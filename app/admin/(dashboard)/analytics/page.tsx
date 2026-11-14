import type { Metadata } from "next";
import { getStore } from "@/lib/store";
import { formatINR } from "@/lib/money";

export const metadata: Metadata = { title: "Analytics · Admin" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const store = await getStore();
  const [products, orders, users, coupons] = await Promise.all([
    store.products.list(),
    store.orders.list(),
    store.users.list(),
    store.coupons.list(),
  ]);

  // Revenue by month
  const revenueByMonth: Record<string, number> = {};
  const ordersByMonth: Record<string, number> = {};
  orders.forEach((o) => {
    const month = o.createdAt.slice(0, 7);
    revenueByMonth[month] = (revenueByMonth[month] || 0) + (o.payment?.status === "paid" ? o.total : 0);
    ordersByMonth[month] = (ordersByMonth[month] || 0) + 1;
  });

  const months = Object.keys(revenueByMonth).sort();
  const totalRevenue = orders.reduce((sum, o) => sum + (o.payment?.status === "paid" ? o.total : 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const paidOrders = orders.filter((o) => o.payment?.status === "paid").length;
  const conversionRate = totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0;

  // Top products by quantity sold
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.name, qty: 0, revenue: 0 };
      }
      productSales[item.productId].qty += item.qty;
      productSales[item.productId].revenue += item.price * item.qty;
    });
  });
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  // Orders by status
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  // Payment method breakdown
  const paymentStatusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    const ps = o.payment?.status || "unknown";
    paymentStatusCounts[ps] = (paymentStatusCounts[ps] || 0) + 1;
  });

  return (
    <div className="space-y-5">
      <h1 className="text-[24px]">Analytics Dashboard</h1>
      <p className="mt-1 text-[13px] text-body">Revenue trends, top products, and store metrics.</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-body/70">Total Revenue</p>
          <p className="mt-1 text-[22px] font-bold text-brand-dark">{formatINR(totalRevenue)}</p>
        </div>
        <div className="card p-5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-body/70">Total Orders</p>
          <p className="mt-1 text-[22px] font-bold text-brand-dark">{totalOrders}</p>
        </div>
        <div className="card p-5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-body/70">Avg Order Value</p>
          <p className="mt-1 text-[22px] font-bold text-brand-dark">{formatINR(avgOrderValue)}</p>
        </div>
        <div className="card p-5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-body/70">Conversion Rate</p>
          <p className="mt-1 text-[22px] font-bold text-brand-dark">{conversionRate}%</p>
        </div>
      </div>

      {/* Revenue by Month */}
      <div className="card p-5">
        <h2 className="text-[17px] mb-4">Revenue by Month</h2>
        <div className="space-y-3">
          {months.map((month) => {
            const rev = revenueByMonth[month] || 0;
            const maxRev = Math.max(...Object.values(revenueByMonth), 1);
            const pct = Math.round((rev / maxRev) * 100);
            return (
              <div key={month} className="flex items-center gap-3">
                <span className="w-20 text-[12px] font-semibold text-body/70">{month}</span>
                <div className="flex-1 h-6 bg-light rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-24 text-right text-[12px] font-semibold text-brand-dark">
                  {formatINR(rev)}
                </span>
                <span className="w-12 text-right text-[11px] text-body/60">
                  {ordersByMonth[month] || 0} orders
                </span>
              </div>
            );
          })}
          {months.length === 0 && (
            <p className="text-[13px] text-body/70">No order data yet.</p>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="card overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[17px]">Top Products by Quantity Sold</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="border-b border-line bg-cream/60">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Product</th>
                <th className="px-4 py-3 text-right font-semibold">Qty Sold</th>
                <th className="px-4 py-3 text-right font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {topProducts.map((p, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-body/70">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-brand-dark">{p.name}</td>
                  <td className="px-4 py-3 text-right">{p.qty}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatINR(p.revenue)}</td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-body/70">
                    No sales data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order & Payment Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-[17px] mb-4">Orders by Status</h2>
          <div className="space-y-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-[13px] capitalize text-body">{status}</span>
                <span className="text-[13px] font-semibold text-brand-dark">{count}</span>
              </div>
            ))}
            {Object.keys(statusCounts).length === 0 && (
              <p className="text-[13px] text-body/70">No orders yet.</p>
            )}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-[17px] mb-4">Payment Status</h2>
          <div className="space-y-2">
            {Object.entries(paymentStatusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-[13px] capitalize text-body">{status}</span>
                <span className="text-[13px] font-semibold text-brand-dark">{count}</span>
              </div>
            ))}
            {Object.keys(paymentStatusCounts).length === 0 && (
              <p className="text-[13px] text-body/70">No payments yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
