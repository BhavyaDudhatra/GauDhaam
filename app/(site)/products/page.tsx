import type { Metadata } from "next";
import { ProductCard } from "@/components/product/product-card";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse Gaudham cold-pressed oils, A2 ghee, raw honey, herbal powders and handmade soaps.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const store = await getStore();
  const products = await store.products.list();
  const available = products.filter((product) => product.available);
  const filtered = category
    ? available.filter((product) => product.category.toLowerCase() === category.toLowerCase())
    : available;

  const categories = Array.from(
    new Set(available.map((product) => product.category).filter(Boolean)),
  ).sort();

  return (
    <>
      <section className="border-b border-line bg-light/45">
        <div className="container-gd py-10 md:py-12">
          <span className="eyebrow">Shop</span>
          <h1 className="mt-2">All products</h1>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed">
            Pure, small-batch essentials made slowly.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-gd">
          {categories.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <a
                href="/products"
                className={`badge ${!category ? "bg-brand text-white" : "border border-line bg-white text-brand-dark"}`}
              >
                All
              </a>
              {categories.map((item) => (
                <a
                  key={item}
                  href={`/products?category=${encodeURIComponent(item)}`}
                  className={`badge ${category?.toLowerCase() === item.toLowerCase() ? "bg-brand text-white" : "border border-line bg-white text-brand-dark"}`}
                >
                  {item}
                </a>
              ))}
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5 md:gap-5 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="card px-6 py-12 text-center">
              <h2 className="text-[18px]">No products here yet</h2>
              <p className="mt-2 text-[13px]">
                Try another category or check back soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
