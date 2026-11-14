"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Img } from "@/components/ui/Img";
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
import type { Address } from "@/lib/types";

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
  addresses = [],
}: {
  defaults: { name: string; email: string; phone: string };
  paymentMode: "live" | "simulate" | "unavailable";
  addresses?: Address[];
}) {
  const router = useRouter();
  const { lines, hydrated, subtotal, clear } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses?.find(a => a.isDefault)?.id ?? addresses?.[0]?.id ?? null
  );
  // Auto-select first address if none selected but addresses exist
  useEffect(() => {
    if (!selectedAddressId && addresses && addresses.length > 0) {
      setSelectedAddressId(addresses[0].id ?? null);
    }
  }, [addresses, selectedAddressId]);
  const selectedAddress = addresses?.find(a => a.id === selectedAddressId) ?? (addresses && addresses.length > 0 ? addresses[0] : null);
  const [fulfillment, setFulfillment] = useState<"delivery" | "self">("delivery");
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [deliveryDistance, setDeliveryDistance] = useState<number>(0);
  const [deliveryBaseFee, setDeliveryBaseFee] = useState<number>(0);
  const [deliveryPerKmRate, setDeliveryPerKmRate] = useState<number>(0);
  const [deliveryMethod, setDeliveryMethod] = useState<string>("");
  const [deliveryChargeLoading, setDeliveryChargeLoading] = useState(false);
  const [pincode, setPincode] = useState<string>(selectedAddress?.pincode ?? "");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number; couponId: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);

  const shipping = fulfillment === "self" ? 0 : deliveryCharge;
  const discount = couponApplied?.discount ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);
  const canPay = paymentMode !== "unavailable" && lines.length > 0;

  useEffect(()=>{
    if (selectedAddress?.pincode) setPincode(selectedAddress.pincode);
  }, [selectedAddress?.pincode]);

  // Calculate delivery charge when address fields change (debounced)
  const [addressInput, setAddressInput] = useState("");
  useEffect(() => {
    if (fulfillment === "self") {
      setDeliveryCharge(0);
      setDeliveryDistance(0);
      setDeliveryBaseFee(0);
      setDeliveryPerKmRate(0);
      setDeliveryMethod("");
      return;
    }
    // Build address string from form fields or selected address
    let addrStr = "";
    if (selectedAddress) {
      addrStr = `${selectedAddress.line1||''} ${selectedAddress.line2||''} ${selectedAddress.city||''} ${selectedAddress.state||''} ${selectedAddress.pincode||''}`.trim();
    }
    if (!addrStr && addressInput) {
      addrStr = addressInput;
    }
    if (!addrStr || addrStr.length < 10) {
      setDeliveryCharge(0);
      setDeliveryChargeLoading(false);
      return;
    }
    setDeliveryChargeLoading(true);
    let cancelled = false;
    const timer = setTimeout(() => {
      fetch(`/api/delivery/charge?address=${encodeURIComponent(addrStr)}`)
        .then(r => r.json())
        .then(data => {
          if (!cancelled) {
            setDeliveryCharge(Number(data.charge) || 0);
            setDeliveryDistance(Number(data.distance) || 0);
            setDeliveryBaseFee(Number(data.baseFee) || 0);
            setDeliveryPerKmRate(Number(data.perKmRate) || 0);
            setDeliveryMethod(data.method || "");
            setDeliveryChargeLoading(false);
          }
        })
        .catch(() => { if (!cancelled) { setDeliveryCharge(0); setDeliveryChargeLoading(false); } });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [fulfillment, selectedAddress, addressInput, addresses]);

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
      name: "GauDhaam",
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

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponBusy(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setCouponError(data.error || "Invalid coupon code.");
        setCouponApplied(null);
        return;
      }
      setCouponApplied({ code: data.code, discount: data.discount, couponId: data.couponId });
    } catch {
      setCouponError("Could not validate coupon. Try again.");
    } finally {
      setCouponBusy(false);
    }
  }

  function removeCoupon() {
    setCouponApplied(null);
    setCouponCode("");
    setCouponError("");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canPay || busy) return;

    setBusy(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const saveAddr = formData.get("saveAddress") === "on";

    // If save address is checked, save the address first
    if (saveAddr && !selectedAddressId) {
      try {
        await fetch("/api/address/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: String(formData.get("name") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            line1: String(formData.get("line1") ?? ""),
            line2: String(formData.get("line2") ?? ""),
            city: String(formData.get("city") ?? ""),
            state: String(formData.get("state") ?? ""),
            pincode: String(formData.get("pincode") ?? ""),
          }),
        });
      } catch {
        // Non-critical, continue with checkout
      }
    }

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
      fulfillment: String(formData.get("fulfillment") ?? "delivery"),
      savedAddressId: String(formData.get("savedAddress") ?? ""),
      couponCode: couponApplied?.code ?? "",
      couponId: couponApplied?.couponId ?? "",
      discount: couponApplied?.discount ?? 0,
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
              <h2 className="text-[16px]">Fulfillment option</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${fulfillment === 'delivery' ? 'border-brand bg-light/60' : 'border-line'}`}>
                  <input type="radio" name="fulfillment" value="delivery" checked={fulfillment === 'delivery'} onChange={() => setFulfillment('delivery')} />
                  <div>
                    <p className="text-[13px] font-semibold">Delivery to address</p>
                    <p className="text-[11.5px] text-body/70">We will deliver to your location. Delivery charges apply.</p>
                  </div>
                </label>
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${fulfillment === 'self' ? 'border-brand bg-light/60' : 'border-line'}`}>
                  <input type="radio" name="fulfillment" value="self" checked={fulfillment === 'self'} onChange={() => setFulfillment('self')} />
                  <div>
                    <p className="text-[13px] font-semibold">Self service pickup</p>
                    <p className="text-[11.5px] text-body/70">Come to our place to pick up. Delivery charges ₹0.</p>
                  </div>
                </label>
              </div>
              <input type="hidden" name="fulfillment" value={fulfillment} />
            </div>

            <div className="card p-5 md:p-6">
              <h2 className="text-[16px]">Delivery address</h2>
              {addresses && addresses.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-[12px] text-body/70">Use a saved address</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {addresses.map(addr => (
                      <label key={addr.id} className="flex cursor-pointer items-start gap-2 rounded-xl border border-line bg-cream/50 px-3 py-2 text-[12.5px]">
                        <input
                          type="radio"
                          name="savedAddress"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id ?? null)}
                        />
                        <div>
                          <p className="font-semibold">{addr.label}{addr.isDefault ? " • Default" : ""}</p>
                          <p className="text-body/70">{addr.name}, {addr.phone}</p>
                          <p className="text-body/70">{addr.line1}, {addr.city}, {addr.state} {addr.pincode}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                <label className="field sm:col-span-2">
                  <span className="label">Address line 1</span>
                  <input
                    name="line1"
                    required
                    autoComplete="address-line1"
                    className="input"
                    placeholder="House / flat, street"
                    defaultValue={selectedAddress?.line1 ?? ""}
                    onChange={e => {
                      const line2 = (document.querySelector('input[name="line2"]') as HTMLInputElement)?.value ?? "";
                      const city = (document.querySelector('input[name="city"]') as HTMLInputElement)?.value ?? "";
                      const state = (document.querySelector('select[name="state"]') as HTMLSelectElement)?.value ?? "";
                      const pincode = (document.querySelector('input[name="pincode"]') as HTMLInputElement)?.value ?? "";
                      setAddressInput(`${e.target.value} ${line2} ${city} ${state} ${pincode}`.trim());
                    }}
                  />
                </label>
                <label className="field sm:col-span-2">
                  <span className="label">Address line 2 (optional)</span>
                  <input
                    name="line2"
                    autoComplete="address-line2"
                    className="input"
                    placeholder="Landmark, area"
                    defaultValue={selectedAddress?.line2 ?? ""}
                    onChange={e => {
                      const line1 = (document.querySelector('input[name="line1"]') as HTMLInputElement)?.value ?? "";
                      const city = (document.querySelector('input[name="city"]') as HTMLInputElement)?.value ?? "";
                      const state = (document.querySelector('select[name="state"]') as HTMLSelectElement)?.value ?? "";
                      const pincode = (document.querySelector('input[name="pincode"]') as HTMLInputElement)?.value ?? "";
                      setAddressInput(`${line1} ${e.target.value} ${city} ${state} ${pincode}`.trim());
                    }}
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
                    defaultValue={selectedAddress?.city ?? ""}
                    onChange={e => {
                      const line1 = (document.querySelector('input[name="line1"]') as HTMLInputElement)?.value ?? "";
                      const line2 = (document.querySelector('input[name="line2"]') as HTMLInputElement)?.value ?? "";
                      const state = (document.querySelector('select[name="state"]') as HTMLSelectElement)?.value ?? "";
                      const pincode = (document.querySelector('input[name="pincode"]') as HTMLInputElement)?.value ?? "";
                      setAddressInput(`${line1} ${line2} ${e.target.value} ${state} ${pincode}`.trim());
                    }}
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
                    value={pincode}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPincode(val);
                      const line1 = (document.querySelector('input[name="line1"]') as HTMLInputElement)?.value ?? "";
                      const line2 = (document.querySelector('input[name="line2"]') as HTMLInputElement)?.value ?? "";
                      const city = (document.querySelector('input[name="city"]') as HTMLInputElement)?.value ?? "";
                      const state = (document.querySelector('select[name="state"]') as HTMLSelectElement)?.value ?? "";
                      setAddressInput(`${line1} ${line2} ${city} ${state} ${val}`.trim());
                    }}
                  />
                </label>
                <label className="field sm:col-span-2">
                  <span className="label">State</span>
                  <select
                    name="state"
                    required
                    defaultValue={selectedAddress?.state ?? "Madhya Pradesh"}
                    autoComplete="address-level1"
                    className="select"
                    onChange={e => {
                      const line1 = (document.querySelector('input[name="line1"]') as HTMLInputElement)?.value ?? "";
                      const line2 = (document.querySelector('input[name="line2"]') as HTMLInputElement)?.value ?? "";
                      const city = (document.querySelector('input[name="city"]') as HTMLInputElement)?.value ?? "";
                      const pincode = (document.querySelector('input[name="pincode"]') as HTMLInputElement)?.value ?? "";
                      setAddressInput(`${line1} ${line2} ${city} ${e.target.value} ${pincode}`.trim());
                    }}
                  >
                    {indianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>
              {!selectedAddressId && (
                <label className="mt-3 flex items-center gap-2 text-[12.5px] text-body">
                  <input type="checkbox" name="saveAddress" className="h-4 w-4 rounded border-line accent-[#496B45]" />
                  <span>Save this address for future use</span>
                </label>
              )}
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
                      <Img
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
                    {fulfillment === "self" ? "Free (self pickup)" : deliveryChargeLoading ? "Calculating…" : formatINR(shipping)}
                  </dd>
                </div>
                {fulfillment === "delivery" && !deliveryChargeLoading && (
                  <div className="rounded-lg bg-cream/60 px-3 py-2 text-[11px] text-body/70 space-y-0.5">
                    <p className="font-semibold text-brand-dark text-[11.5px]">Delivery charge breakdown:</p>
                    <p>Distance from nearest branch: {deliveryDistance > 0 ? `${deliveryDistance.toFixed(1)} km` : "N/A"}</p>
                    <p>Base fee: {formatINR(deliveryBaseFee)}</p>
                    <p>Per km rate: {formatINR(deliveryPerKmRate)} × {deliveryDistance > 0 ? deliveryDistance.toFixed(1) : "0"} km = {formatINR(Math.round(deliveryPerKmRate * (deliveryDistance > 0 ? deliveryDistance : 0)))}</p>
                    <p className="font-semibold text-brand-dark">
                      Total delivery charge: {formatINR(deliveryCharge)}
                    </p>
                    {deliveryMethod !== "google-maps" && deliveryMethod !== "" && (
                      <p className="text-[10px] text-amber-600 italic">
                        {deliveryMethod === "pincode-fallback"
                          ? "(Estimated based on pincode — Google Maps not available for exact distance)"
                          : "(Estimated using OpenStreetMap — Google Maps not available for exact distance)"}
                      </p>
                    )}
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <dt>Coupon ({couponApplied?.code})</dt>
                    <dd className="font-semibold">-{formatINR(discount)}</dd>
                  </div>
                )}
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="input input-sm flex-1"
                    disabled={!!couponApplied}
                  />
                  {couponApplied ? (
                    <button type="button" onClick={removeCoupon} className="btn btn-outline btn-xs">
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponBusy || !couponCode.trim()}
                      className="btn btn-primary btn-xs"
                    >
                      {couponBusy ? "…" : "Apply"}
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="text-[11px] text-red-600">{couponError}</p>
                )}
                {couponApplied && (
                  <p className="text-[11px] text-green-700">Saved ₹{couponApplied.discount}!</p>
                )}
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
