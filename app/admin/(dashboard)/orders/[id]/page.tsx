import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { updateOrderAction } from "@/lib/actions/admin";
import { formatDateTime, formatINR } from "@/lib/money";
import { orderStatuses } from "@/lib/site";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Order details · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string }>;
}) {
  const { id } = await params;
  const { updated } = await searchParams;
  const store = await getStore();
  const order = await store.orders.get(id);
  if (!order) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:underline"
        >
          <ArrowLeft size={14} />
          Orders
        </Link>
        <h1 className="mt-2 text-[24px]">{order.number}</h1>
        <p className="mt-1 text-[13px] text-body">
          Placed {formatDateTime(order.createdAt)} · {order.email}
        </p>
      </div>

      {updated === "1" && (
        <p className="rounded-card border border-brand/25 bg-light/70 p-3 text-[12.5px] font-semibold text-brand-dark">
          Order updated.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="text-[16px]">Items</h2>
            <ul className="mt-3 divide-y divide-line">
              {order.items.map((item) => (
                <li
                  key={`${item.productId}:${item.variantId}`}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-semibold text-brand-dark">{item.name}</p>
                    <p className="text-[11.5px] text-body">
                      {item.variantLabel} · Qty {item.qty} · {formatINR(item.price)} each
                    </p>
                  </div>
                  <p className="font-semibold text-brand-dark">
                    {formatINR(item.price * item.qty)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-[13px]">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatINR(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Discount</dt>
                <dd>{order.discount > 0 ? `-${formatINR(order.discount)}` : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd>{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-[14px] font-bold text-brand-dark">
                <dt>Total</dt>
                <dd>{formatINR(order.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="text-[16px]">Delivery</h2>
            <div className="mt-3 space-y-1 text-[12.5px] text-body">
              <p className="font-semibold text-brand-dark">{order.address.name}</p>
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>
                {order.address.city}, {order.address.state} {order.address.pincode}
              </p>
              <p>{order.phone}</p>
              <p>{order.email}</p>
            </div>
            {order.notes && (
              <p className="mt-3 rounded-xl bg-cream/70 p-3 text-[12px]">
                <span className="font-semibold text-brand-dark">Notes:</span>{" "}
                {order.notes}
              </p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-[16px]">Update order</h2>
          <form action={updateOrderAction} className="mt-3 space-y-3">
            <input type="hidden" name="id" value={order.id} />
            <label className="field">
              <span className="label">Order status</span>
              <select
                name="status"
                defaultValue={order.status}
                className="select"
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Payment status</span>
              <select
                name="paymentStatus"
                defaultValue={order.payment.status}
                className="select"
              >
                <option value="created">created</option>
                <option value="paid">paid</option>
                <option value="failed">failed</option>
                <option value="refunded">refunded</option>
              </select>
            </label>
            <label className="field">
              <span className="label">Internal notes</span>
              <textarea
                name="notes"
                rows={4}
                defaultValue={order.notes}
                className="textarea"
              />
            </label>
            <button type="submit" className="btn btn-primary btn-sm">
              Update order
            </button>
          </form>

          <div className="mt-4 rounded-xl border border-line bg-cream/40 p-3 text-[11.5px] text-body">
            <p className="font-semibold text-brand-dark">Payment</p>
            <p className="mt-1">Provider: {order.payment.provider}</p>
            <p>Status: {order.payment.status}</p>
            {order.payment.razorpayOrderId && (
              <p className="mt-1 break-all">Razorpay order: {order.payment.razorpayOrderId}</p>
            )}
            {order.payment.razorpayPaymentId && (
              <p className="mt-1 break-all">Payment ID: {order.payment.razorpayPaymentId}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
