import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "New product · Admin" };

export default function NewProductPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:underline"
        >
          <ArrowLeft size={14} />
          Products
        </Link>
        <h1 className="mt-2 text-[24px]">New product</h1>
        <p className="mt-1 text-[13px] text-body">
          Add images, pack options, stock and offers.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
