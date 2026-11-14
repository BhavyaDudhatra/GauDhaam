"use client";

import { useState, useEffect } from "react";
import { GitCompare } from "lucide-react";

const STORAGE_KEY = "gaudhaam-compare";
const MAX_ITEMS = 3;

export function addToCompare(productId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (ids.includes(productId)) return;
    const updated = [...ids, productId].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function removeFromCompare(productId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    const updated = ids.filter((id) => id !== productId);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getCompareIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

export function CompareButton({ productId }: { productId: string }) {
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    setInCompare(getCompareIds().includes(productId));
  }, [productId]);

  function toggle() {
    if (inCompare) {
      removeFromCompare(productId);
      setInCompare(false);
    } else {
      addToCompare(productId);
      setInCompare(true);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`grid h-8 w-8 place-items-center rounded-full border transition-colors ${
        inCompare
          ? "border-brand bg-brand text-white"
          : "border-line bg-white text-body/60 hover:border-brand hover:text-brand"
      }`}
      aria-label={inCompare ? "Remove from comparison" : "Add to comparison"}
      title={inCompare ? "Remove from comparison" : "Compare"}
    >
      <GitCompare size={14} />
    </button>
  );
}
