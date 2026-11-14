import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Box, Gift, MessageSquare, Package, ShoppingCart, Users } from "lucide-react";
import { getStore } from "@/lib/store";
import { formatINR } from "@/lib/money";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const store = await getStore();
  const [products, services, orders, users, feedback, coupons] = await Promise.all([
    store.products.list(),
    store.services.list({ includeInactive: true }),
    store.orders.list(),
    store.users.list(),
    store.feedback.list(),
    store.coupons.list(),
  ]);

  const paidOrders = orders.filter((order) => order.payment?.status === "paid");
  const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(
    (order) => order.payment?.status === "created" && order.status === "pending",
  ).length;
  const deliveredOrders = orders.filter((order) => order.status === "delivered").length;
  const cancelledOrders = orders.filter((order) => order.status === "cancelled").length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // B2B stats
  const b2bOrders = await store.b2bOrders.list();
  const pendingB2B = b2bOrders.filter((o) => o.status === "pending").length;
  const completedB2B = b2bOrders.filter((o) => o.status === "completed").length;

  // Low stock alerts
  const lowStockProducts = products.filter((p) => {
    const stock = p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    return stock > 0 && stock <= 5;
  });
  const outOfStockProducts = products.filter((p) => {
    const stock = p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    return stock === 0;
  });

  const cards = [
    { label: "Revenue (paid)", value: formatINR(revenue), icon: ShoppingCart, href: "/admin/revenue" },
    { label: "Total orders", value: orders.length, href: "/admin/orders", icon: ShoppingCart, note: `${pendingOrders} awaiting payment` },
    { label: "Delivered", value: deliveredOrders, href: "/admin/orders", icon: Package },
    { label: "Cancelled", value: cancelledOrders, href: "/admin/orders", icon: Package },
    { label: "Avg order value", value: formatINR(avgOrderValue), icon: ShoppingCart, href: "/admin/revenue" },
    { label: "Products", value: products.length, href: "/admin/products", icon: Box },
    { label: "Services", value: services.length, href: "/admin/services", icon: Package },
    { label: "Users", value: users.length, href: "/admin/users", icon: Users },
    { label: "Feedback", value: feedback.length, href: "/admin/feedback", icon: MessageSquare },
    { label: "Coupons", value: coupons.length, href: "/admin/coupons", icon: Gift },
    { label: "B2B orders", value: b2bOrders.length, href: "/admin/b2b", icon: Gift, note: `${pendingB2B} pending, ${completedB2B} completed` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px]">Dashboard</h1>
        <p className="mt-1 text-[13px] text-body">
          Firebase is the source of truth. Products and services are seeded on first run.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <div className="card flex items-center justify-between p-5">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-body/70">
                  {card.label}
                </p>
                <p className="mt-1 text-[22px] font-bold text-brand-dark">
                  {card.value}
                </p>
                {card.note && (
                  <p className="mt-1 text-[11px] text-body/65">{card.note}</p>
                )}
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-light text-brand">
                <Icon size={18} />
              </span>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {lowStockProducts.length > 0 && (
            <div className="card p-5 border-amber-200 bg-amber-50/50">
              <h2 className="text-[17px] text-amber-800">⚠️ Low Stock Alerts</h2>
              <p className="mt-1 text-[12px] text-amber-700">
                {lowStockProducts.length} product{lowStockProducts.length !== 1 ? "s" : ""} with 5 or fewer units in stock
              </p>
              <div className="mt-3 space-y-2">
                {lowStockProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/products/${p.id}`}
                    className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-3 py-2 text-[12.5px] transition-colors hover:bg-amber-50"
                  >
                    <span className="font-semibold text-brand-dark">{p.name}</span>
                    <span className="text-amber-700">
                      {p.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)} units left
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {outOfStockProducts.length > 0 && (
            <div className="card p-5 border-red-200 bg-red-50/50">
              <h2 className="text-[17px] text-red-800">🚫 Out of Stock</h2>
              <p className="mt-1 text-[12px] text-red-700">
                {outOfStockProducts.length} product{outOfStockProducts.length !== 1 ? "s" : ""} are completely out of stock
              </p>
              <div className="mt-3 space-y-2">
                {outOfStockProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/products/${p.id}`}
                    className="flex items-center justify-between rounded-lg border border-red-200 bg-white px-3 py-2 text-[12.5px] transition-colors hover:bg-red-50"
                  >
                    <span className="font-semibold text-brand-dark">{p.name}</span>
                    <span className="text-red-700">Sold out</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-[17px]">Recent orders</h2>
              <p className="text-[12px] text-body">Latest activity across the store</p>
            </div>
            <Link href="/admin/orders" className="text-[12.5px] font-semibold text-brand hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-line">
            {orders.slice(0, 3).map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-cream/60"
              >
                <div>
                  <p className="text-[13px] font-semibold text-brand-dark">
                    {order.number}
                  </p>
                  <p className="text-[11.5px] text-body/70">
                    {order.customerName} · {order.items.length} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-brand-dark">
                    {formatINR(order.total)}
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-body/60">
                    {order.payment?.status}
                  </p>
                </div>
                <ArrowRight size={15} className="text-body/40" />
              </Link>
            ))}
            {orders.length === 0 && (
              <p className="px-5 py-8 text-center text-[13px] text-body">
                No orders yet.
              </p>
            )}
            {orders.length > 3 && (
              <div className="px-5 py-3 text-center border-t border-line">
                <Link href="/admin/orders" className="text-[12.5px] font-semibold text-brand hover:underline">
                  View all {orders.length} orders →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-[17px]">Quick actions</h2>
          <p className="mt-1 text-[12px] text-body">
            Manage your catalogue and promotions
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link href="/admin/products/new" className="btn btn-primary">
              Add product
            </Link>
            <Link href="/admin/services/new" className="btn btn-outline">
              Add service
            </Link>
            <Link href="/admin/coupons/new" className="btn btn-outline">
              Create coupon
            </Link>
            <Link href="/admin/feedback" className="btn btn-outline">
              Review feedback
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
