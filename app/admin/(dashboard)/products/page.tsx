import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteProductAction, toggleProductAction } from "@/lib/actions/admin";
import { formatINR } from "@/lib/money";
import { activeVariants, priceRange, variantStock } from "@/lib/pricing";
import { getStore } from "@/lib/store";
import { Img } from "@/components/ui/Img";
import { FilterSortBar } from "@/components/ui/filter-sort-bar";

export const metadata: Metadata = { title: "Products · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; q?: string; sort?: string; order?: string; category?: string; status?: string }>;
}) {
  const { saved, q, sort, order, category, status } = await searchParams;
  const store = await getStore();
  let products = await store.products.list();

  // Filter by search query
  if (q) {
    const lower = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower) ||
        p.shortDescription.toLowerCase().includes(lower),
    );
  }

  // Filter by category
  if (category && category !== "all") {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by status
  if (status === "visible") {
    products = products.filter((p) => p.available);
  } else if (status === "hidden") {
    products = products.filter((p) => !p.available);
  }

  // Sort
  if (sort) {
    const dir = order === "desc" ? -1 : 1;
    products.sort((a, b) => {
      let aVal: any = a[sort as keyof typeof a];
      let bVal: any = b[sort as keyof typeof b];
      if (sort === "price") {
        aVal = Math.min(...a.variants.map((v) => v.price));
        bVal = Math.min(...b.variants.map((v) => v.price));
      }
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

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px]">Products</h1>
          <p className="mt-1 text-[13px] text-body">
            {products.length} products · variants, stock and offers
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary btn-sm">
          <Plus size={15} />
          New product
        </Link>
      </div>

      {saved === "1" && (
        <p className="rounded-card border border-brand/25 bg-light/70 p-3 text-[12.5px] font-semibold text-brand-dark">
          Product saved.
        </p>
      )}

      <FilterSortBar
        searchPlaceholder="Search products..."
        filterOptions={[
          {
            key: "category",
            label: "Category",
            options: categories.map((c) => ({ value: c, label: c })),
          },
          {
            key: "status",
            label: "Status",
            options: [
              { value: "visible", label: "Visible" },
              { value: "hidden", label: "Hidden" },
            ],
          },
        ]}
        sortOptions={[
          { value: "name", label: "Name" },
          { value: "price", label: "Price" },
          { value: "createdAt", label: "Date added" },
          { value: "available", label: "Status" },
        ]}
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[12.5px]">
            <thead className="border-b border-line bg-cream/60 text-[11px] uppercase tracking-[0.08em] text-body/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Options</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((product) => {
                const range = priceRange(product);
                const stock = variantStock(product);
                return (
                  <tr key={product.id} className="align-middle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-light">
                          <Img
                            src={product.images[0] ?? "/assets/images/Ghee.jpg"}
                            alt={product.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-semibold text-brand-dark hover:text-brand"
                          >
                            {product.name}
                          </Link>
                          <p className="text-[11px] text-body/70">
                            {product.category}
                            {product.featured ? " · featured" : ""}
                            {product.offer ? " · offer" : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-body">
                      {activeVariants(product).length}
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand-dark">
                      {range.min === range.max
                        ? formatINR(range.min)
                        : `${formatINR(range.min)} – ${formatINR(range.max)}`}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          stock === 0
                            ? "font-semibold text-brown"
                            : stock <= 5
                              ? "font-semibold text-brown-dark"
                              : "text-body"
                        }
                      >
                        {stock === 0 ? "Sold out" : stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          product.available ? "badge-green" : "badge-brown"
                        }`}
                      >
                        {product.available ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-[12px] font-semibold text-brand hover:underline"
                        >
                          Edit
                        </Link>
                        <form action={toggleProductAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <input
                            type="hidden"
                            name="available"
                            value={product.available ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            className="text-[12px] font-semibold text-body hover:text-brand-dark"
                          >
                            {product.available ? "Hide" : "Show"}
                          </button>
                        </form>
                        <form action={deleteProductAction}>
                          <input type="hidden" name="id" value={product.id} />
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
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-body">
                    No products yet. Create your first one.
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
