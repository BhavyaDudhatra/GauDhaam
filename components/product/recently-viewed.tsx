"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import type { Product } from "@/lib/types";

export function RecentlyViewed({ products }: { products: Product[] }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(getRecentlyViewed());
  }, []);

  if (ids.length === 0) return null;

  const viewedProducts = ids
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  if (viewedProducts.length === 0) return null;

  return (
    <section className="section border-t border-line bg-white/45 pt-12">
      <div className="container-gd">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Recently viewed</span>
            <h2 className="mt-2">Pick up where you left off</h2>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3.5 md:gap-5 lg:grid-cols-4">
          {viewedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
