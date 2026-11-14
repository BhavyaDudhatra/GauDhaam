import type { Metadata } from "next";
import Link from "next/link";
import { getStore } from "@/lib/store";
import { formatINR, formatDate } from "@/lib/money";

export const metadata: Metadata = { title: "Returns · Admin" };
export const dynamic = "force-dynamic";

export default async function ReturnsPage() {
  const store = await getStore();
  const orders = await store.orders.list();
  const returnable = orders.filter(
    (o) => o.status === "delivered" || o.status === "cancelled",
  );

  return (
    <div className="space-y-5">
      <h1 className="text-[24px]">Returns & Refunds</h1>
      <p className="mt-1 text-[13px] text-body">
        Manage return requests and process refunds for delivered orders.
      </p>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[12.5px]">
            <thead className="border-b border-line bg-cream/60 text-[11px] uppercase tracking-[0.08em] text-body/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {returnable.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-dark">{order.number}</p>
                    <p className="text-[11px] text-body/70">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-dark">{order.customerName}</p>
                    <p className="text-[11px] text-body/70">{order.email}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-dark">{formatINR(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${order.status === "delivered" ? "badge-green" : "badge-brown"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge badge-neutral">{order.payment?.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-[12px] font-semibold text-brand hover:underline">
                      Process refund
                    </Link>
                  </td>
                </tr>
              ))}
              {returnable.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-body">
                    No returnable orders.
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
