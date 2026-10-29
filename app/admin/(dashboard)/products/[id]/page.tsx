import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Edit product · Admin" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await getStore();
  const product = await store.products.get(id);
  if (!product) notFound();

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
        <h1 className="mt-2 text-[24px]">{product.name}</h1>
        <p className="mt-1 text-[13px] text-body">
          Last updated {new Date(product.updatedAt).toLocaleString("en-IN")}
        </p>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
