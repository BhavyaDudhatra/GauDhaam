import type { Metadata } from "next";
import Link from "next/link";
import { Eye } from "lucide-react";
import { formatDateTime, formatINR } from "@/lib/money";
import { paymentStatusLabel } from "@/components/ui/order-status";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Revenue — Admin" };
export const dynamic = "force-dynamic";

type Filter = "all" | "paid" | "unpaid" | "self";

export default async function AdminRevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "all" } = await searchParams;
  const store = await getStore();
  const allOrders = await store.orders.list();
  let orders = [...allOrders];

  const isComplementary = (order: any) =>
    order.total === 0 || (order.notes && /self|complementary/i.test(order.notes));

  if (filter === "paid") {
    orders = orders.filter((o) => o.payment.status === "paid");
  } else if (filter === "unpaid") {
    orders = orders.filter((o) => o.payment.status !== "paid");
  } else if (filter === "self") {
    orders = orders.filter(isComplementary);
  }

  const totalRevenue = allOrders
    .filter((o) => o.payment.status === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "paid", label: "Paid" },
    { key: "unpaid", label: "Unpaid" },
    { key: "self", label: "Self Pickup" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px]">Revenue</h1>
          <p className="mt-1 text-[13px] text-body">
            Total revenue from paid orders
          </p>
        </div>
        <div className="card px-5 py-4">
          <p className="text-[11px] uppercase tracking-wide text-body/70">Total Revenue (paid)</p>
          <p className="text-[24px] font-bold text-brand-dark">{formatINR(totalRevenue)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/revenue?filter=${t.key}`}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
              filter === t.key
                ? "bg-brand text-white"
                : "bg-light text-body hover:bg-cream"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-[12.5px]">
            <thead className="border-b border-line bg-cream/60 text-[11px] uppercase tracking-[0.08em] text-body/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Fulfillment</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 text-right font-semibold">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => {
                const complementary = isComplementary(order);
                return (
                  <tr key={order.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-dark">{order.number}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-dark">{order.customerName}</p>
                      <p className="text-[11px] text-body/70">{order.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand-dark">
                      {formatINR(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge badge-neutral">
                        {paymentStatusLabel(order.payment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] ${complementary ? "text-brand font-semibold" : "text-body/70"}`}>
                        {complementary ? "Self Pickup" : "Standard"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body/70">
                      {formatDateTime(order.createdAt)}
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
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-body">
                    No orders found.
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
