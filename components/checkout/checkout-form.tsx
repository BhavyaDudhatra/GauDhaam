"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { lineKey, useCart } from "@/components/cart/cart-context";
import { formatINR, shippingFor } from "@/lib/money";
import { indianStates, site } from "@/lib/site";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type PaymentSession = {
  orderId: string;
  orderNumber: string;
  mode: "razorpay" | "simulate";
  keyId?: string;
  amount?: number;
  name?: string;
  email?: string;
  phone?: string;
  razorpayOrderId?: string;
};

let scriptPromise: Promise<boolean> | null = null;

function loadRazorpay() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (!scriptPromise) {
    scriptPromise = new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

export function CheckoutForm({
  defaults,
  paymentMode,
}: {
  defaults: { name: string; email: string; phone: string };
  paymentMode: "live" | "simulate" | "unavailable";
}) {
  const router = useRouter();
  const { lines, hydrated, subtotal, clear } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<PaymentSession | null>(null);

  const shipping = shippingFor(subtotal, site.freeShippingAbove, site.shippingFee);
  const total = subtotal + shipping;
  const canPay = paymentMode !== "unavailable" && lines.length > 0;

  function finish(orderId: string) {
    clear();
    router.push(`/order/${orderId}?new=1`);
  }

  async function verifyPayment(payload: Record<string, unknown>) {
    const response = await fetch("/api/checkout/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as {
      ok?: boolean;
      error?: string;
      orderNumber?: string;
    };
    if (!response.ok || !data.ok) {
      throw new Error(
        data.error ||
          "We could not confirm the payment. Please contact us before trying again.",
      );
    }
    return data;
  }

  function openRazorpay(payment: PaymentSession) {
    if (!window.Razorpay) {
      setError("The payment window could not load. Please check your connection.");
      return;
    }
    setError("");
    setBusy(true);

    const checkout = new window.Razorpay({
      key: payment.keyId,
      amount: payment.amount,
      currency: "INR",
      name: "Gaudham",
      description: `Order ${payment.orderNumber}`,
      order_id: payment.razorpayOrderId,
      image: `${window.location.origin}/assets/images/gaudhamlogo.png`,
      prefill: {
        name: payment.name,
        email: payment.email,
        contact: payment.phone,
      },
      notes: { orderNumber: payment.orderNumber },
      theme: { color: "#496B45" },
      modal: {
        ondismiss: () => {
          setBusy(false);
          setError(
            `Payment window closed. Your order ${payment.orderNumber} is saved — use “Retry payment” when you are ready.`,
          );
        },
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        setBusy(true);
        try {
          await verifyPayment({
            orderId: payment.orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
          finish(payment.orderId);
        } catch (verificationError) {
          setError(
            verificationError instanceof Error
              ? verificationError.message
              : "Payment verification failed.",
          );
          setBusy(false);
        }
      },
    });

    checkout.open();
    setBusy(false);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canPay || busy) return;

    setBusy(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      items: lines.map((line) => ({
        productId: line.productId,
        variantId: line.variantId,
        qty: line.qty,
        name: line.name,
        variantLabel: line.variantLabel,
      })),
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      line1: String(formData.get("line1") ?? ""),
      line2: String(formData.get("line2") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      pincode: String(formData.get("pincode") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    };

    try {
      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as PaymentSession & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSession(data);

      if (data.mode === "simulate") {
        await verifyPayment({ orderId: data.orderId, dev: true });
        finish(data.orderId);
        return;
      }

      const ready = await loadRazorpay();
      if (!ready) {
        setError("The payment window could not load. Please try again.");
        setBusy(false);
        return;
      }

      openRazorpay(data);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.",
      );
      setBusy(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="container-gd section">
        <div className="card h-72 animate-pulse bg-white/60" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-gd section">
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-light text-brand">
            <ShoppingBag size={26} strokeWidth={1.6} />
          </span>
          <h1 className="mt-4 text-[19px]">Your cart is empty</h1>
          <p className="mt-2 max-w-sm text-[13.5px]">
            Add something from the pantry first, then come back to checkout.
          </p>
          <Link href="/products" className="btn btn-primary mt-5">
            Go to shop
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container-gd">
        <div className="flex flex-wrap items-center gap-2 text-[11.5px] font-semibold text-body/60">
          <span className="text-brand">Cart</span>
          <span>→</span>
          <span className="text-brand-dark">Details & payment</span>
          <span>→</span>
          <span>Confirmation</span>
        </div>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1>Checkout</h1>
            <p className="mt-1.5 text-[13px]">
              One last step. We will pack your order within two working days.
            </p>
          </div>
          <Link
            href="/cart"
            className="text-[12.5px] font-semibold text-brand hover:text-brand-dark"
          >
            Edit cart
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <form onSubmit={onSubmit} className="space-y-4">
            {paymentMode === "simulate" && (
              <div className="rounded-card border border-[#E6D5B4] bg-[#FBF4E4] p-4 text-[12.5px] leading-relaxed text-[#6D5320]">
                <strong className="font-semibold">Test mode.</strong> Razorpay keys
                are not configured yet, so this order will be marked paid without
                taking money. Add your keys to <code>.env.local</code> to accept
                real payments.
              </div>
            )}

            {paymentMode === "unavailable" && (
              <div className="rounded-card border border-line bg-[#F6E7E2] p-4 text-[12.5px] leading-relaxed text-[#8A3E2C]">
                Online payments are not available right now. Please{" "}
                <Link href="/contact" className="font-semibold underline">
                  contact us
                </Link>{" "}
                and we will help you place the order.
              </div>
            )}

            <div className="card p-5 md:p-6">
              <h2 className="text-[16px]">Contact</h2>
              <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                <label className="field sm:col-span-2">
                  <span className="label">Full name</span>
                  <input
                    name="name"
                    required
                    autoComplete="name"
                    defaultValue={defaults.name}
                    className="input"
                    placeholder="Your name"
                  />
                </label>
                <label className="field">
                  <span className="label">Email</span>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    defaultValue={defaults.email}
                    className="input"
                    placeholder="you@example.com"
                  />
                </label>
                <label className="field">
                  <span className="label">Mobile number</span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    autoComplete="tel-national"
                    defaultValue={defaults.phone}
                    className="input"
                    placeholder="10-digit mobile"
                  />
                </label>
              </div>
            </div>

            <div className="card p-5 md:p-6">
              <h2 className="text-[16px]">Delivery address</h2>
              <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                <label className="field sm:col-span-2">
                  <span className="label">Address line 1</span>
                  <input
                    name="line1"
                    required
                    autoComplete="address-line1"
                    className="input"
                    placeholder="House / flat, street"
                  />
                </label>
                <label className="field sm:col-span-2">
                  <span className="label">Address line 2 (optional)</span>
                  <input
                    name="line2"
                    autoComplete="address-line2"
                    className="input"
                    placeholder="Landmark, area"
                  />
                </label>
                <label className="field">
                  <span className="label">City</span>
                  <input
                    name="city"
                    required
                    autoComplete="address-level2"
                    className="input"
                    placeholder="City"
                  />
                </label>
                <label className="field">
                  <span className="label">PIN code</span>
                  <input
                    name="pincode"
                    required
                    inputMode="numeric"
                    pattern="[1-9][0-9]{5}"
                    maxLength={6}
                    autoComplete="postal-code"
                    className="input"
                    placeholder="6-digit PIN"
                  />
                </label>
                <label className="field sm:col-span-2">
                  <span className="label">State</span>
                  <select
                    name="state"
                    required
                    defaultValue="Madhya Pradesh"
                    autoComplete="address-level1"
                    className="select"
                  >
                    {indianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field sm:col-span-2">
                  <span className="label">Delivery notes (optional)</span>
                  <textarea
                    name="notes"
                    className="textarea"
                    rows={3}
                    placeholder="Landmark, gate code, preferred delivery time…"
                  />
                </label>
              </div>
            </div>

            <div className="card p-5 md:p-6">
              <h2 className="text-[16px]">Payment</h2>
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-brand/25 bg-light/60 p-3.5">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-brand">
                  <CreditCard size={17} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-brand-dark">
                    Pay online with Razorpay
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-body/80">
                    UPI, credit/debit cards, netbanking and wallets. We never see
                    or store your card details.
                  </p>
                </div>
                <span className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-white">
                  <Check size={13} strokeWidth={3} />
                </span>
              </div>

              <label className="mt-4 flex items-start gap-2.5 text-[11.5px] leading-relaxed text-body">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 rounded border-line accent-[#496B45]"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/policies/terms" className="link-underline">
                    terms of use
                  </Link>{" "}
                  and{" "}
                  <Link href="/policies/refund" className="link-underline">
                    returns policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-card border border-[#E7CCC3] bg-[#F9EEE9] p-3.5 text-[12.5px] leading-relaxed text-[#8A3E2C]"
              >
                {error}
              </p>
            )}

            {session && session.mode === "razorpay" && !busy && (
              <button
                type="button"
                onClick={() => openRazorpay(session)}
                className="btn btn-outline btn-block"
              >
                Retry payment for {session.orderNumber}
              </button>
            )}

            <button
              type="submit"
              disabled={!canPay || busy}
              className="btn btn-primary btn-lg btn-block"
            >
              {busy ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Please wait…
                </>
              ) : (
                <>
                  <Lock size={16} />
                  {paymentMode === "simulate"
                    ? `Place order · ${formatINR(total)} (test)`
                    : `Pay ${formatINR(total)} securely`}
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-body/65">
              <ShieldCheck size={13} />
              Encrypted checkout · Razorpay is PCI DSS compliant
            </p>
          </form>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="card overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <h2 className="text-[16px]">Your order</h2>
                <p className="mt-0.5 text-[11.5px] text-body/75">
                  {lines.reduce((sum, line) => sum + line.qty, 0)} items
                </p>
              </div>

              <ul className="max-h-[320px] divide-y divide-line overflow-y-auto px-5">
                {lines.map((line) => (
                  <li key={`${line.productId}:${line.variantId}`} className="flex gap-3 py-3.5">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px] border border-line bg-light">
                      <Image
                        src={line.image}
                        alt={line.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                      <span className="absolute right-0 top-0 grid h-[18px] min-w-[18px] place-items-center rounded-bl-[8px] rounded-tr-[9px] bg-brand px-1 text-[10px] font-bold text-white">
                        {line.qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-brand-dark">
                        {line.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-body/70">{line.variantLabel}</p>
                    </div>
                    <span className="text-[12.5px] font-semibold text-brand-dark">
                      {formatINR(line.price * line.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="space-y-2 border-t border-line px-5 py-4 text-[13px]">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold text-brand-dark">
                    {formatINR(subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Delivery</dt>
                  <dd className="font-semibold text-brand-dark">
                    {shipping === 0 ? "Free" : formatINR(shipping)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-[15px]">
                  <dt className="font-semibold text-brand-dark">Total</dt>
                  <dd className="font-bold text-brand-dark">{formatINR(total)}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-3 rounded-card border border-line bg-white/60 p-4 text-[11.5px] leading-relaxed text-body/80">
              <p className="font-semibold text-brand-dark">Need help ordering?</p>
              <p className="mt-1">
                Call{" "}
                <a href={`tel:${site.phoneHref}`} className="link-underline">
                  {site.phone}
                </a>{" "}
                or write to{" "}
                <a href={`mailto:${site.email}`} className="link-underline">
                  {site.email}
                </a>
                . {site.hours}.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
