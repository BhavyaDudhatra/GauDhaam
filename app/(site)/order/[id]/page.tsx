import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Check,
  CircleAlert,
  Mail,
  MapPin,
  Phone,
  Truck,
} from "lucide-react";
import {
  OrderStatusBadge,
  paymentStatusLabel,
} from "@/components/ui/order-status";
import { formatDate, formatINR } from "@/lib/money";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

const steps = [
  { key: "paid", label: "Order confirmed" },
  { key: "packed", label: "Packed at the farm" },
  { key: "shipped", label: "On its way" },
  { key: "delivered", label: "Delivered" },
] as const;

function stepIndex(status: string) {
  if (status === "delivered") return 3;
  if (status === "shipped") return 2;
  if (status === "packed") return 1;
  if (status === "paid") return 0;
  return -1;
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const store = await getStore();
  const order = await store.orders.get(id);

  if (!order) notFound();

  const session = await getSession();
  const current = stepIndex(order.status);
  const paid = order.payment.status === "paid";

  return (
    <>
      <section className="border-b border-line bg-light/45">
        <div className="container-gd py-9 md:py-12">
          {isNew === "1" ? (
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-white">
                <Check size={24} strokeWidth={3} />
              </span>
              <div>
                <span className="eyebrow">Order confirmed</span>
                <h1 className="mt-1.5">Thank you — we have your order.</h1>
                <p className="mt-2 max-w-xl text-[13.5px]">
                  We will pack it within two working days and send it from the
                  farm. Keep this page bookmarked to check the status.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <span className="eyebrow">Order</span>
              <h1 className="mt-1.5">{order.number}</h1>
              <p className="mt-2 text-[13.5px]">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <span className="badge badge-neutral">
              {paymentStatusLabel(order.payment.status)}
            </span>
            <span className="badge badge-neutral">{order.number}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-gd grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:gap-8">
          <div className="space-y-4">
            {order.payment.status === "created" && (
              <div className="flex items-start gap-3 rounded-card border border-[#E6D5B4] bg-[#FBF4E4] p-4 text-[12.5px] leading-relaxed text-[#6D5320]">
                <CircleAlert size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Payment is still pending.</p>
                  <p className="mt-1">
                    Your order is saved, but we cannot pack it until payment is
                    confirmed. If money was deducted,{" "}
                    <Link href="/contact" className="font-semibold underline">
                      contact us
                    </Link>{" "}
                    with order {order.number}.
                  </p>
                </div>
              </div>
            )}

            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="text-[16px]">Items</h2>
                <span className="text-[11.5px] text-body/70">
                  {order.items.reduce((sum, item) => sum + item.qty, 0)} items
                </span>
              </div>
              <ul className="divide-y divide-line">
                {order.items.map((item) => (
                  <li key={`${item.productId}:${item.variantId}`} className="flex gap-3 p-4 sm:p-5">
                    <Link
                      href={`/product/${item.slug}`}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[12px] border border-line bg-light"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${item.slug}`}
                        className="text-[13.5px] font-semibold text-brand-dark hover:text-brand"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-[11.5px] text-body/70">
                        {item.variantLabel} · Qty {item.qty}
                      </p>
                    </div>
                    <span className="text-[13.5px] font-semibold text-brand-dark">
                      {formatINR(item.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h2 className="text-[16px]">Delivery details</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="flex gap-2.5 text-[12.5px] leading-relaxed">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
                  <div>
                    <p className="font-semibold text-brand-dark">
                      {order.address.name}
                    </p>
                    <p>{order.address.line1}</p>
                    {order.address.line2 && <p>{order.address.line2}</p>}
                    <p>
                      {order.address.city}, {order.address.state} —{" "}
                      {order.address.pincode}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-[12.5px]">
                  <p className="flex items-center gap-2">
                    <Phone size={15} className="shrink-0 text-brand" />
                    {order.phone}
                  </p>
                  <p className="flex items-center gap-2 break-all">
                    <Mail size={15} className="shrink-0 text-brand" />
                    {order.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Truck size={15} className="shrink-0 text-brand" />
                    Standard delivery, 3–7 working days
                  </p>
                </div>
              </div>

              {order.notes && (
                <p className="mt-4 rounded-xl bg-light/70 p-3 text-[12px] text-body">
                  <span className="font-semibold text-brand-dark">Note: </span>
                  {order.notes}
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="card p-5">
              <h2 className="text-[16px]">Summary</h2>
              <dl className="mt-3 space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold text-brand-dark">
                    {formatINR(order.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Delivery</dt>
                  <dd className="font-semibold text-brand-dark">
                    {order.shipping === 0 ? "Free" : formatINR(order.shipping)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-[15px]">
                  <dt className="font-semibold text-brand-dark">Total</dt>
                  <dd className="font-bold text-brand-dark">
                    {formatINR(order.total)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 rounded-xl bg-light/60 p-3 text-[11.5px] leading-relaxed text-body">
                <p>
                  <span className="font-semibold text-brand-dark">Payment: </span>
                  {paymentStatusLabel(order.payment.status)} · Razorpay
                </p>
                {order.payment.razorpayPaymentId && (
                  <p className="mt-1 break-all text-body/70">
                    Ref: {order.payment.razorpayPaymentId}
                  </p>
                )}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-[16px]">Progress</h2>

              {order.status === "cancelled" ? (
                <p className="mt-3 text-[12.5px] leading-relaxed text-body">
                  This order was cancelled. If this was not expected, write to us
                  at{" "}
                  <a href={`mailto:${site.email}`} className="link-underline">
                    {site.email}
                  </a>
                  .
                </p>
              ) : (
                <ol className="mt-4 space-y-0">
                  {steps.map((step, index) => {
                    const reached = paid && current >= index;
                    const active = paid && current === index && order.status !== "delivered";
                    return (
                      <li key={step.key} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span
                            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                              reached
                                ? "bg-brand text-white"
                                : "border border-line bg-white text-body/50"
                            }`}
                          >
                            {reached ? <Check size={12} strokeWidth={3} /> : index + 1}
                          </span>
                          {index < steps.length - 1 && (
                            <span
                              className={`my-1 h-6 w-px ${
                                reached ? "bg-brand/40" : "bg-line"
                              }`}
                            />
                          )}
                        </div>
                        <div className="pb-3">
                          <p
                            className={`text-[12.5px] font-semibold ${
                              reached ? "text-brand-dark" : "text-body/70"
                            }`}
                          >
                            {step.label}
                          </p>
                          {active && (
                            <p className="text-[11px] text-body/70">
                              Happening now
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              {!paid && order.status !== "cancelled" && (
                <p className="mt-2 text-[11.5px] leading-relaxed text-body/70">
                  Progress begins once payment is confirmed.
                </p>
              )}
            </div>

            <div className="rounded-card border border-line bg-white/60 p-4 text-[11.5px] leading-relaxed text-body/80">
              <p className="font-semibold text-brand-dark">A question?</p>
              <p className="mt-1">
                Write to{" "}
                <a href={`mailto:${site.email}`} className="link-underline">
                  {site.email}
                </a>{" "}
                or call{" "}
                <a href={`tel:${site.phoneHref}`} className="link-underline">
                  {site.phone}
                </a>
                . Mention {order.number}.
              </p>
            </div>
          </aside>
        </div>

        <div className="container-gd mt-6 flex flex-wrap gap-3">
          <Link href="/products" className="btn btn-primary">
            Continue shopping
            <ArrowRight size={16} />
          </Link>
          {session?.id === order.userId && (
            <Link href="/account" className="btn btn-outline">
              View my account
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
