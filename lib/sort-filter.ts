// Shared sort/filter utilities for listing pages

export type SortOption = {
  value: string;
  label: string;
};

export type FilterOption = {
  value: string;
  label: string;
};

export function sortBy<T>(
  items: T[],
  field: string,
  direction: "asc" | "desc" = "asc",
): T[] {
  const sorted = [...items].sort((a: any, b: any) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle nested fields like "price" from variants
    if (field === "price" && a.variants) {
      aVal = Math.min(...a.variants.map((v: any) => v.price));
      bVal = Math.min(...b.variants.map((v: any) => v.price));
    }

    // Handle name fields
    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = (bVal ?? "").toLowerCase();
    }

    // Handle dates
    if (field.includes("At") || field.includes("Date")) {
      aVal = new Date(aVal || 0).getTime();
      bVal = new Date(bVal || 0).getTime();
    }

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
}

export function filterBy<T>(
  items: T[],
  filters: Record<string, string>,
): T[] {
  return items.filter((item: any) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === "all") return true;
      const itemVal = String(item[key] ?? "").toLowerCase();
      return itemVal === value.toLowerCase();
    });
  });
}

export function searchBy<T>(items: T[], query: string, fields: string[]): T[] {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter((item: any) => {
    return fields.some((field) => {
      const val = String(item[field] ?? "").toLowerCase();
      return val.includes(q);
    });
  });
}
