"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Img } from "@/components/ui/Img";
import { formatINR } from "@/lib/money";
import type { Product } from "@/lib/types";

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/products/list");
        const data = await res.json();
        const ids = JSON.parse(localStorage.getItem("gaudhaam-compare") || "[]");
        const compared = (data.products || []).filter((p: Product) => ids.includes(p.id));
        setProducts(compared);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function clearAll() {
    localStorage.removeItem("gaudhaam-compare");
    setProducts([]);
  }

  if (loading) {
    return <div className="container-gd py-10 text-center">Loading...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="container-gd py-10 text-center">
        <h1 className="text-[24px] font-bold">Product Comparison</h1>
        <p className="mt-2 text-[13px] text-body/70">No products selected for comparison.</p>
        <p className="mt-1 text-[12px] text-body/50">Click the compare icon on product cards to add them.</p>
        <Link href="/products" className="btn btn-primary mt-5">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-gd py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold">Product Comparison</h1>
        <button onClick={clearAll} className="btn btn-outline btn-sm">
          Clear all
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr>
              <th className="p-3 text-left font-semibold text-body/70">Feature</th>
              {products.map((p) => (
                <th key={p.id} className="p-3 text-center min-w-[200px]">
                  <div className="relative aspect-square w-24 mx-auto overflow-hidden rounded-lg border border-line bg-light">
                    <Img src={p.images?.[0] ?? "/assets/images/Ghee.jpg"} alt={p.name} fill className="object-cover" />
                  </div>
                  <p className="mt-2 font-semibold text-brand-dark">{p.name}</p>
                  <p className="text-[11px] text-body/70">{p.category}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <tr>
              <td className="p-3 font-semibold text-body/70">Price</td>
              {products.map((p) => {
                const prices = p.variants.map((v) => v.price);
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                return (
                  <td key={p.id} className="p-3 text-center font-bold text-brand-dark">
                    {min === max ? formatINR(min) : `${formatINR(min)} – ${formatINR(max)}`}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-body/70">Variants</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-center">
                  {p.variants.map((v) => v.label).join(", ")}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-body/70">Description</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-center text-[12px]">
                  {p.shortDescription}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-body/70">Highlights</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-center text-[12px]">
                  {p.highlights?.join(", ") || "—"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-body/70">Ingredients</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-center text-[12px]">
                  {p.ingredients || "—"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-body/70">Action</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-center">
                  <Link href={`/product/${p.slug}`} className="btn btn-outline btn-sm">
                    View product
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
