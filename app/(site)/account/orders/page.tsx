import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { formatINR, formatDate } from "@/lib/money";
import { OrderStatusBadge } from "@/components/ui/order-status";

export default async function MyOrdersAggregationPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/orders");

  const store = await getStore();
  const user = await store.users.get(session.id);
  if (!user) redirect("/login?next=/account/orders");

  const orders = await store.orders.list({ userId: user.id });
  const b2b = await store.b2b.list({ userId: user.id });
  const subscriptions = await store.subscriptions.list({ userId: user.id });

  return (
    <div className="container-gd py-10">
      <h1 className="text-[24px] font-bold">My Orders</h1>
      <p className="mt-1 text-[13px] text-body/70">All your purchases, subscriptions and B2B enquiries in one place.</p>

      <div className="mt-6 space-y-8">
        <section>
          <h2 className="text-[16px] font-semibold mb-3">Products & Services</h2>
          {orders.length === 0 ? (
            <p className="text-[13px] text-body/70">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {orders.map(o => (
                <li key={o.id} className="py-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{o.number} • {formatDate(o.createdAt)}</p>
                    <p className="text-[12px] text-body/70">{o.items.length} items</p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                  <p className="w-24 text-right font-semibold">{formatINR(o.total)}</p>
                  <Link href={`/order/${o.id}`} className="btn btn-outline btn-sm">View</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-[16px] font-semibold mb-3">B2B Enquiries</h2>
          {b2b.length === 0 ? (
            <p className="text-[13px] text-body/70">No B2B orders yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {b2b.map(b => (
                <li key={b.id} className="py-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{b.productName || b.productId} • {formatDate(b.createdAt)}</p>
                    <p className="text-[12px] text-body/70">{b.status}</p>
                  </div>
                  <Link href="/b2b" className="btn btn-outline btn-sm">Reorder</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-[16px] font-semibold mb-3">Subscriptions</h2>
          {subscriptions.length === 0 ? (
            <p className="text-[13px] text-body/70">No subscriptions yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {subscriptions.map(s => (
                <li key={s.id} className="py-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{s.productName} • {s.frequency}</p>
                    <p className="text-[12px] text-body/70">Next delivery: {formatDate(s.nextDeliveryDate ?? s.createdAt)}</p>
                  </div>
                  <Link href={`/subscriptions/${s.id}`} className="btn btn-outline btn-sm">Manage</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
