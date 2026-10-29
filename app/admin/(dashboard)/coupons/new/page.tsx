import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CouponForm } from "@/components/admin/coupon-form";

export const metadata: Metadata = { title: "New coupon · Admin" };

export default function NewCouponPage() {
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
        <h1 className="mt-2 text-[24px]">New coupon</h1>
      </div>
      <CouponForm />
    </div>
  );
}
