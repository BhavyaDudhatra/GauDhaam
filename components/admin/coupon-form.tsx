"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { saveCouponAction } from "@/lib/actions/admin";
import type { FormState } from "@/lib/actions/state";
import type { Coupon } from "@/lib/types";

export function CouponForm({ coupon }: { coupon?: Coupon }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveCouponAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      {coupon && <input type="hidden" name="id" value={coupon.id} />}

      <div className="card p-5">
        <h2 className="text-[16px]">Coupon details</h2>
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          <label className="field">
            <span className="label">Code</span>
            <input
              name="code"
              required
              defaultValue={coupon?.code}
              className="input uppercase"
              placeholder="WELCOME10"
            />
          </label>
          <label className="field">
            <span className="label">Type</span>
            <select
              name="type"
              defaultValue={coupon?.type ?? "percentage"}
              className="select"
            >
              <option value="percentage">Percentage off</option>
              <option value="fixed">Flat ₹ off</option>
            </select>
          </label>
          <label className="field">
            <span className="label">Value</span>
            <input
              name="value"
              type="number"
              min={0}
              required
              defaultValue={coupon?.value ?? ""}
              className="input"
            />
          </label>
          <label className="field">
            <span className="label">Minimum order ₹</span>
            <input
              name="minOrderValue"
              type="number"
              min={0}
              defaultValue={coupon?.minOrderValue ?? 0}
              className="input"
            />
          </label>
          <label className="field">
            <span className="label">Max discount ₹ (optional)</span>
            <input
              name="maxDiscount"
              type="number"
              min={0}
              defaultValue={coupon?.maxDiscount ?? ""}
              className="input"
              placeholder="For percentage coupons"
            />
          </label>
          <label className="field">
            <span className="label">Usage limit (optional)</span>
            <input
              name="usageLimit"
              type="number"
              min={1}
              defaultValue={coupon?.usageLimit ?? ""}
              className="input"
              placeholder="e.g. 100"
            />
          </label>
          <label className="field">
            <span className="label">Starts (optional)</span>
            <input
              name="startDate"
              type="date"
              defaultValue={coupon?.startDate ?? ""}
              className="input"
            />
          </label>
          <label className="field">
            <span className="label">Ends (optional)</span>
            <input
              name="endDate"
              type="date"
              defaultValue={coupon?.endDate ?? ""}
              className="input"
            />
          </label>
          <label className="field sm:col-span-2">
            <span className="label">Description</span>
            <input
              name="description"
              defaultValue={coupon?.description}
              className="input"
              placeholder="10% off your first order"
            />
          </label>
          <label className="flex items-center gap-2 text-[13px] font-semibold text-brand-dark">
            <input
              type="checkbox"
              name="active"
              defaultChecked={coupon?.active ?? true}
              className="h-4 w-4 rounded border-line"
            />
            Active
          </label>
        </div>
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-card border border-[#E7CCC3] bg-[#F9EEE9] p-3.5 text-[12.5px] text-[#8A3E2C]"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending && <Loader2 size={16} className="animate-spin" />}
          {coupon ? "Save changes" : "Create coupon"}
        </button>
        <Link href="/admin/coupons" className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
