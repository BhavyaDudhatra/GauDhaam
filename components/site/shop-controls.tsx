"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";

export function ShopControls({
  categories,
  activeCategory,
  activeQuery,
  activeSort,
}: {
  categories: string[];
  activeCategory: string;
  activeQuery: string;
  activeSort: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(activeQuery);

  function go(next: { category?: string; q?: string; sort?: string }) {
    const category = next.category ?? activeCategory;
    const q = next.q ?? activeQuery;
    const sort = next.sort ?? activeSort;
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (sort && sort !== "featured") params.set("sort", sort);
    const suffix = params.toString();
    router.push(`/shop${suffix ? `?${suffix}` : ""}`);
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            go({ q: query.trim() });
          }}
          className="relative flex-1"
          role="search"
        >
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body/60"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search ghee, honey, soaps…"
            aria-label="Search products"
            className="input pl-10 pr-10"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                go({ q: "" });
              }}
              className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-body/60 hover:bg-light hover:text-brand"
            >
              <X size={14} />
            </button>
          )}
        </form>

        <div className="relative sm:w-[190px]">
          <SlidersHorizontal
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body/60"
          />
          <select
            value={activeSort}
            onChange={(event) => go({ sort: event.target.value })}
            aria-label="Sort products"
            className="select pl-9"
          >
            <option value="featured">Featured first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => go({ category: "" })}
          className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
            !activeCategory
              ? "border-brand bg-brand text-white"
              : "border-line bg-white text-body hover:border-brand/40 hover:text-brand"
          }`}
        >
          All products
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() =>
              go({ category: activeCategory === category ? "" : category })
            }
            className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
              activeCategory.toLowerCase() === category.toLowerCase()
                ? "border-brand bg-brand text-white"
                : "border-line bg-white text-body hover:border-brand/40 hover:text-brand"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
