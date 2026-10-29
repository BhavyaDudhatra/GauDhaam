import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CouponForm } from "@/components/admin/coupon-form";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Edit coupon · Admin" };
export const dynamic = "force-dynamic";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await getStore();
  const coupon = await store.coupons.get(id);
  if (!coupon) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/coupons"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:underline"
        >
          <ArrowLeft size={14} />
          Coupons
        </Link>
        <h1 className="mt-2 text-[24px]">{coupon.code}</h1>
        <p className="mt-1 text-[13px] text-body">
          Used {coupon.usedCount}
          {coupon.usageLimit ? ` of ${coupon.usageLimit}` : ""} times
        </p>
      </div>
      <CouponForm coupon={coupon} />
    </div>
  );
}
