"use client";

import { useState } from "react";
import { formatINR } from "@/lib/money";

export function StockEditor({ productId, variantId, currentStock, currentPrice }: { productId: string; variantId: string; currentStock: number; currentPrice: number }) {
  const [stock, setStock] = useState(currentStock);
  const [price, setPrice] = useState(currentPrice);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId, stock, price }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(Number(e.target.value))}
        className="input input-sm w-16 text-right"
        min="0"
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="input input-sm w-20 text-right"
        min="0"
      />
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="btn btn-primary btn-xs"
      >
        {saving ? "…" : saved ? "✓" : "Save"}
      </button>
    </div>
  );
}
