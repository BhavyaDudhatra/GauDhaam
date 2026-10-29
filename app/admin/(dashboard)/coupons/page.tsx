import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  deleteCouponAction,
  toggleCouponAction,
} from "@/lib/actions/admin";
import { formatDate, formatINR } from "@/lib/money";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Coupons · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const store = await getStore();
  const coupons = await store.coupons.list();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px]">Coupons</h1>
          <p className="mt-1 text-[13px] text-body">
            Sitewide discount codes, applied at checkout.
          </p>
        </div>
        <Link href="/admin/coupons/new" className="btn btn-primary btn-sm">
          <Plus size={15} />
          New coupon
        </Link>
      </div>

      {saved === "1" && (
        <p className="rounded-card border border-brand/25 bg-light/70 p-3 text-[12.5px] font-semibold text-brand-dark">
          Coupon saved.
        </p>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[12.5px]">
            <thead className="border-b border-line bg-cream/60 text-[11px] uppercase tracking-[0.08em] text-body/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Discount</th>
                <th className="px-4 py-3 font-semibold">Min order</th>
                <th className="px-4 py-3 font-semibold">Used</th>
                <th className="px-4 py-3 font-semibold">Window</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/coupons/${coupon.id}`}
                      className="font-mono text-[12.5px] font-bold uppercase text-brand-dark hover:text-brand"
                    >
                      {coupon.code}
                    </Link>
                    {coupon.description && (
                      <p className="text-[11px] text-body/70">{coupon.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-dark">
                    {coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : formatINR(coupon.value)}
                    {coupon.maxDiscount ? (
                      <span className="block text-[10.5px] font-normal text-body/70">
                        max {formatINR(coupon.maxDiscount)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-body">
                    {coupon.minOrderValue ? formatINR(coupon.minOrderValue) : "—"}
                  </td>
                  <td className="px-4 py-3 text-body">
                    {coupon.usedCount}
                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-[11.5px] text-body">
                    {coupon.startDate ? formatDate(coupon.startDate) : "Now"}
                    {" → "}
                    {coupon.endDate ? formatDate(coupon.endDate) : "No end"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${coupon.active ? "badge-green" : "badge-brown"}`}>
                      {coupon.active ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`/admin/coupons/${coupon.id}`}
                        className="text-[12px] font-semibold text-brand hover:underline"
                      >
                        Edit
                      </Link>
                      <form action={toggleCouponAction}>
                        <input type="hidden" name="id" value={coupon.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={coupon.active ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className="text-[12px] font-semibold text-body hover:text-brand-dark"
                        >
                          {coupon.active ? "Pause" : "Activate"}
                        </button>
                      </form>
                      <form action={deleteCouponAction}>
                        <input type="hidden" name="id" value={coupon.id} />
                        <button
                          type="submit"
                          className="text-[12px] font-semibold text-brown hover:underline"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-body">
                    No coupons yet.
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
