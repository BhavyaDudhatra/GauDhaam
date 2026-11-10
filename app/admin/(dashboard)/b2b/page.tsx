import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { updateB2BOrderAction } from "@/lib/actions/b2b";
import { formatDate, formatINR } from "@/lib/money";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "B2B Orders · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminB2BPage() {
  const store = await getStore();
  const orders = await store.b2bOrders.list();
  const open = orders.filter((order) => order.status === "pending").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px]">B2B Bulk Order Requests</h1>
        <p className="mt-1 text-[13px] text-body">
          {orders.length} inquiries · {open} awaiting action
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-[12.5px]">
            <thead className="border-b border-line bg-cream/60 text-[11px] uppercase tracking-[0.08em] text-body/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Request</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Pickup / Delivery</th>
                <th className="px-4 py-3 font-semibold">Deadline</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Quote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-dark capitalize">
                      {order.orderType === 'bulk' ? 'Bulk buying' : 'Hampers order'}
                    </p>
                    <p className="text-[11px] text-body/70">{formatDate(order.createdAt)}</p>
                    {order.notes && (
                      <p className="max-w-[240px] text-[11px] text-body/70 mt-1">{order.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{order.fullName}</p>
                    <p className="text-[11px] text-body/70">{order.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-body">
                    <p className="capitalize">{order.pickupOption}</p>
                    {order.pickupOption === 'delivery' && (
                      <>
                        <p className="text-[11px] text-body/70">{order.address}</p>
                        <p className="text-[11px] font-semibold text-brand-dark">
                          Delivery ₹{order.deliveryCharge || 0} · {order.distanceKm?.toFixed ? order.distanceKm.toFixed(1) : order.distanceKm} km
                        </p>
                      </>
                    )}
                    {order.pickupOption === 'self' && (
                      <p className="text-[11px] text-body/70">Self pickup, charge ₹0</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {order.deadline ? new Date(order.deadline).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge capitalize ${
                        order.status === "confirmed"
                          ? "badge-green"
                          : order.status === "rejected"
                            ? "badge-brown"
                            : order.status === "quoted"
                              ? "badge-neutral"
                              : "badge-brown"
                      }`}
                    >
                      {order.status}
                    </span>
                    {order.priceQuoted ? (
                      <p className="mt-1 text-[11px] font-semibold text-brand-dark">
                        {formatINR(order.priceQuoted)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <form
                      action={updateB2BOrderAction}
                      className="flex flex-wrap items-center justify-end gap-2"
                    >
                      <input type="hidden" name="id" value={order.id} />
                      <input
                        name="priceQuoted"
                        type="number"
                        min={0}
                        step={1}
                        defaultValue={order.priceQuoted ?? ""}
                        placeholder="Quote ₹"
                        className="input w-24 py-1 text-[12px]"
                      />
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="input w-auto py-1 text-[12px]"
                      >
                        <option value="pending">Pending</option>
                        <option value="quoted">Quoted</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button
                        type="submit"
                        className="text-[12px] font-semibold text-brand hover:underline"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-body">
                    <Building2
                      size={24}
                      className="mx-auto text-body/40"
                      strokeWidth={1.6}
                    />
                    <p className="mt-2">No B2B inquiries yet.</p>
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
