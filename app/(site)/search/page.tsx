import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getStore } from "@/lib/store";
import { ProductCard } from "@/components/product/product-card";
import { FilterSortBar } from "@/components/ui/filter-sort-bar";
import { formatINR } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; order?: string }>;
}) {
  const { q, category, sort, order } = await searchParams;
  const query = (q || "").trim();

  if (!query) {
    redirect("/products");
  }

  const store = await getStore();
  const products = await store.products.list();
  const available = products.filter((p) => p.available);

  let results = available.filter((p) => {
    const lower = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower) ||
      p.shortDescription.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      (p.ingredients || "").toLowerCase().includes(lower) ||
      (p.highlights || []).some((h) => h.toLowerCase().includes(lower))
    );
  });

  if (category && category !== "all") {
    results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (sort) {
    const dir = order === "desc" ? -1 : 1;
    results.sort((a, b) => {
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
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }

  const categories = Array.from(new Set(available.map((p) => p.category).filter(Boolean))).sort();

  return (
    <div className="container-gd py-10">
      <h1 className="text-[24px] font-bold">
        Search results for &ldquo;{query}&rdquo;
      </h1>
      <p className="mt-1 text-[13px] text-body/70">
        {results.length} product{results.length !== 1 ? "s" : ""} found
      </p>

      <div className="mt-6">
        <FilterSortBar
          searchPlaceholder="Refine search..."
          filterOptions={[
            {
              key: "category",
              label: "Category",
              options: categories.map((c) => ({ value: c, label: c })),
            },
          ]}
          sortOptions={[
            { value: "name", label: "Name" },
            { value: "price", label: "Price" },
            { value: "createdAt", label: "Newest" },
          ]}
        />
      </div>

      {results.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3.5 md:gap-5 lg:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="card px-6 py-12 text-center mt-6">
          <h2 className="text-[18px]">No products found</h2>
          <p className="mt-2 text-[13px]">
            Try a different search term or browse all products.
          </p>
          <Link href="/products" className="btn btn-primary btn-sm mt-5">
            Browse all products
          </Link>
        </div>
      )}
    </div>
  );
}
