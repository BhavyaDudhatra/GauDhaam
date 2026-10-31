import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { formatDateTime } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function B2BOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/b2b/orders");

  const store = await getStore();
  const orders = await store.b2bOrders.list({ userId: session.id });

  return (
    <div className="container-gd py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold">My B2B Orders</h1>
        <Link href="/b2b" className="btn btn-outline btn-sm">New Request</Link>
      </div>

      <div className="grid gap-4">
        {orders.map(o => (
          <div key={o.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{o.productName ?? o.productId}</p>
                <p className="text-[13px] text-body/70">Qty: {o.quantity} · Frequency: {o.frequency} · Status: {o.status}</p>
                <p className="text-[12px] text-body/70">{formatDateTime(o.createdAt)}</p>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-body/70">No B2B orders yet.</p>}
      </div>
    </div>
  );
}
