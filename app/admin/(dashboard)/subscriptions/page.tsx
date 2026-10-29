import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";
import {
  approveQuantityChangeAction,
  rejectQuantityChangeAction,
  updateSubscriptionStatusAction,
} from "@/lib/actions/subscriptions";
import { formatDate } from "@/lib/money";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Subscriptions · Admin" };
export const dynamic = "force-dynamic";

const frequencyLabel = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
} as const;

export default async function AdminSubscriptionsPage() {
  const store = await getStore();
  const [subscriptions, users, products] = await Promise.all([
    store.subscriptions.list(),
    store.users.list(),
    store.products.list({ includeUnavailable: true }),
  ]);

  const usersById = new Map(users.map((user) => [user.id, user]));
  const productsById = new Map(products.map((product) => [product.id, product]));
  const active = subscriptions.filter(
    (subscription) => subscription.status === "active",
  ).length;
  const paused = subscriptions.filter(
    (subscription) => subscription.status === "paused",
  ).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px]">Subscriptions</h1>
        <p className="mt-1 text-[13px] text-body">
          {subscriptions.length} total · {active} active · {paused} paused
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[12.5px]">
            <thead className="border-b border-line bg-cream/60 text-[11px] uppercase tracking-[0.08em] text-body/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Started</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Quantity request</th>
                <th className="px-4 py-3 text-right font-semibold">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {subscriptions.map((subscription) => {
                const user = usersById.get(subscription.userId);
                return (
                  <tr key={subscription.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-dark">
                        {user?.name ?? subscription.address.name}
                      </p>
                      <p className="text-[11px] text-body/70">
                        {user?.email ?? subscription.address.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-dark">
                        {productsById.get(subscription.productId)?.name ??
                          "Removed product"}
                      </p>
                      <p className="text-[11px] text-body/70">
                        {subscription.address.city}, {subscription.address.pincode}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-body">
                      {subscription.quantity} unit
                      {subscription.quantity === 1 ? "" : "s"}
                      <p className="text-[11px] text-body/70">
                        {frequencyLabel[subscription.frequency]}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-body">
                      {formatDate(subscription.startDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge capitalize ${
                          subscription.status === "active"
                            ? "badge-green"
                            : subscription.status === "paused"
                              ? "badge-brown"
                              : "badge-neutral"
                        }`}
                      >
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {subscription.requestedQty ? (
                        <div className="text-body">
                          <p className="font-semibold">
                            {subscription.quantity} → {subscription.requestedQty}
                          </p>
                          <p className="text-[11px] text-body/70">
                            requested {formatDate(subscription.requestedAt ?? "")}
                          </p>
                          <div className="mt-1 flex gap-2">
                            <form action={approveQuantityChangeAction}>
                              <input type="hidden" name="id" value={subscription.id} />
                              <button type="submit" className="text-[11px] font-semibold text-green-700 hover:underline">Approve</button>
                            </form>
                            <form action={rejectQuantityChangeAction}>
                              <input type="hidden" name="id" value={subscription.id} />
                              <button type="submit" className="text-[11px] font-semibold text-red-700 hover:underline">Reject</button>
                            </form>
                          </div>
                        </div>
                      ) : (
                        <span className="text-body/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <form
                        action={updateSubscriptionStatusAction}
                        className="flex items-center justify-end gap-2"
                      >
                        <input type="hidden" name="id" value={subscription.id} />
                        <select
                          name="status"
                          defaultValue={subscription.status}
                          className="input w-auto py-1 text-[12px]"
                        >
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="cancelled">Cancelled</option>
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
                );
              })}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-body">
                    <CalendarClock
                      size={24}
                      className="mx-auto text-body/40"
                      strokeWidth={1.6}
                    />
                    <p className="mt-2">No subscriptions yet.</p>
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
