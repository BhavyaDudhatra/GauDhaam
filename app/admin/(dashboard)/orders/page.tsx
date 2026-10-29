import type { Metadata } from "next";
import Link from "next/link";
import { Eye } from "lucide-react";
import { formatDateTime, formatINR } from "@/lib/money";
import { OrderStatusBadge, paymentStatusLabel } from "@/components/ui/order-status";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Orders · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const { updated } = await searchParams;
  const store = await getStore();
  const orders = await store.orders.list();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px]">Orders</h1>
        <p className="mt-1 text-[13px] text-body">
          {orders.length} orders · update status and payment
        </p>
      </div>

      {updated === "1" && (
        <p className="rounded-card border border-brand/25 bg-light/70 p-3 text-[12.5px] font-semibold text-brand-dark">
          Order updated.
        </p>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-[12.5px]">
            <thead className="border-b border-line bg-cream/60 text-[11px] uppercase tracking-[0.08em] text-body/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-dark">{order.number}</p>
                    <p className="text-[11px] text-body/70">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-dark">{order.customerName}</p>
                    <p className="text-[11px] text-body/70">{order.email}</p>
                    <p className="text-[11px] text-body/70">{order.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-body">
                    {order.items.reduce((sum, item) => sum + item.qty, 0)} items
                    <p className="text-[11px] text-body/70">
                      {order.items.map((item) => item.name).join(", ")}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-dark">
                    {formatINR(order.total)}
                    {order.discount > 0 && (
                      <p className="text-[10.5px] font-normal text-brand">
                        -{formatINR(order.discount)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge badge-neutral">
                      {paymentStatusLabel(order.payment.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:underline"
                    >
                      <Eye size={14} />
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-body">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
