import type { Metadata } from "next";
import Link from "next/link";
import { Eye } from "lucide-react";
import { formatDateTime, formatINR } from "@/lib/money";
import { OrderStatusBadge, paymentStatusLabel } from "@/components/ui/order-status";
import { getStore } from "@/lib/store";
import { FilterSortBar } from "@/components/ui/filter-sort-bar";

export const metadata: Metadata = { title: "Orders · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; paid?: string; q?: string; sort?: string; order?: string; status?: string; payment?: string }>;
}) {
  const { updated, paid, q, sort, order, status, payment } = await searchParams;
  const store = await getStore();
  let orders = await store.orders.list();
  if (paid === 'true') {
    orders = orders.filter(o => o.payment.status === 'paid');
  }

  // Filter by search query
  if (q) {
    const lower = q.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.number.toLowerCase().includes(lower) ||
        o.customerName.toLowerCase().includes(lower) ||
        o.email.toLowerCase().includes(lower) ||
        o.phone.includes(lower),
    );
  }

  // Filter by status
  if (status && status !== "all") {
    orders = orders.filter((o) => o.status === status);
  }

  // Filter by payment status
  if (payment && payment !== "all") {
    orders = orders.filter((o) => o.payment?.status === payment);
  }

  // Sort
  if (sort) {
    const dir = order === "desc" ? -1 : 1;
    orders.sort((a, b) => {
      let aVal: any = a[sort as keyof typeof a];
      let bVal: any = b[sort as keyof typeof b];
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal ?? "").toLowerCase();
      }
      if (sort.includes("At")) {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }

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

      <FilterSortBar
        searchPlaceholder="Search orders..."
        filterOptions={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "pending", label: "Pending" },
              { value: "paid", label: "Paid" },
              { value: "packed", label: "Packed" },
              { value: "shipped", label: "Shipped" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
            ],
          },
          {
            key: "payment",
            label: "Payment",
            options: [
              { value: "created", label: "Created" },
              { value: "paid", label: "Paid" },
              { value: "failed", label: "Failed" },
              { value: "refunded", label: "Refunded" },
            ],
          },
        ]}
        sortOptions={[
          { value: "createdAt", label: "Date" },
          { value: "total", label: "Total" },
          { value: "number", label: "Order #" },
          { value: "customerName", label: "Customer" },
        ]}
      />

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
                      {paymentStatusLabel(order.payment?.status)}
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
