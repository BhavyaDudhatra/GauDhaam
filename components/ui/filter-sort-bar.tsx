"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Option = { value: string; label: string };

export function FilterSortBar({
  sortOptions,
  filterOptions,
  searchPlaceholder = "Search...",
  showSearch = true,
}: {
  sortOptions?: Option[];
  filterOptions?: { key: string; label: string; options: Option[] }[];
  searchPlaceholder?: string;
  showSearch?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const currentSort = searchParams.get("sort") || "";
  const currentOrder = searchParams.get("order") || "asc";
  const currentSearch = searchParams.get("q") || "";

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {showSearch && (
        <input
          type="text"
          placeholder={searchPlaceholder}
          defaultValue={currentSearch}
          onChange={(e) => {
            const val = e.target.value;
            // Debounce
            clearTimeout((window as any).__searchTimer);
            (window as any).__searchTimer = setTimeout(() => {
              updateParam("q", val);
            }, 300);
          }}
          className="input input-sm max-w-[220px]"
        />
      )}
      {filterOptions?.map((filter) => (
        <select
          key={filter.key}
          value={searchParams.get(filter.key) || "all"}
          onChange={(e) => updateParam(filter.key, e.target.value)}
          className="select select-sm"
        >
          <option value="all">{filter.label}: All</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
      {sortOptions && sortOptions.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="select select-sm"
          >
            <option value="">Sort by</option>
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => updateParam("order", currentOrder === "asc" ? "desc" : "asc")}
            className="btn btn-outline btn-sm"
            title={currentOrder === "asc" ? "Ascending" : "Descending"}
          >
            {currentOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      )}
    </div>
  );
}
