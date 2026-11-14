import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { FilterSortBar } from "@/components/ui/filter-sort-bar";
import { formatDate } from "@/lib/money";
import { payB2BOrderAction } from "@/lib/actions/b2b";

export const dynamic = "force-dynamic";

export default async function B2BOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; order?: string; status?: string }>;
}) {
  const { q, sort, order, status } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/login?next=/b2b/orders");

  const store = await getStore();
  let orders = await store.b2bOrders.list({ userId: session.id });

  if (q) {
    const lower = q.toLowerCase();
    orders = orders.filter(
      (o) =>
        (o.itemName || "").toLowerCase().includes(lower) ||
        (o.fullName || "").toLowerCase().includes(lower),
    );
  }

  if (status && status !== "all") {
    orders = orders.filter((o) => o.status === status);
  }

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
    <div className="container-gd py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold">My B2B Orders</h1>
        <Link href="/b2b" className="btn btn-outline btn-sm">New Request</Link>
      </div>

      <FilterSortBar
        searchPlaceholder="Search B2B orders..."
        filterOptions={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "pending", label: "Pending" },
              { value: "quoted", label: "Quoted" },
              { value: "confirmed", label: "Confirmed" },
              { value: "rejected", label: "Rejected" },
              { value: "completed", label: "Completed" },
            ],
          },
        ]}
        sortOptions={[
          { value: "createdAt", label: "Date" },
          { value: "status", label: "Status" },
          { value: "itemName", label: "Item" },
        ]}
      />

      <div className="grid gap-4">
        {orders.map(o => (
          <div key={o.id} className="card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold capitalize">{o.orderType === 'bulk' ? 'Bulk buying' : 'Hampers order'} · {o.itemName}</p>
                <p className="text-[13px] text-body/70">Qty: {o.quantity} · Pickup: {o.pickupOption} · Status: {o.status}</p>
                <p className="text-[12px] text-body/70">Requested {formatDate(o.createdAt)} · Deadline {o.deadline ? new Date(o.deadline).toLocaleDateString() : '—'}</p>
                {o.deliveryCharge > 0 && <p className="text-[12px]">Delivery charge ₹{o.deliveryCharge}</p>}
                {o.priceQuoted && <p className="text-[13px] font-semibold">Quoted amount ₹{o.priceQuoted}</p>}
                {(o.status === 'confirmed' || o.status === 'completed') && (
                  <p className="text-[12px] text-brand mt-1">Tracking: Order confirmed, awaiting dispatch and delivery.</p>
                )}
              </div>
              <div className="text-right">
                {o.status === 'quoted' || o.status === 'confirmed' ? (
                  <a href={`/b2b/pay/${o.id}`} className="btn btn-primary btn-sm">Pay ₹{o.priceQuoted || 0}</a>
                ) : (
                  <span className="badge capitalize">{o.status}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-body/70">No B2B orders yet.</p>}
      </div>
    </div>
  );
}
