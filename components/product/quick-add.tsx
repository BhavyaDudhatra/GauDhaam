"use client";

import { Plus } from "lucide-react";
import { useCart, type AddableItem } from "@/components/cart/cart-context";

export function QuickAdd({
  item,
  variant = "icon",
}: {
  item: AddableItem;
  variant?: "icon" | "button";
}) {
  const { addItem } = useCart();
  const soldOut = item.stock <= 0;

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={() => addItem(item, 1)}
        disabled={soldOut}
        className="btn btn-primary btn-sm w-full"
      >
        {soldOut ? "Sold out" : `Add ${item.variantLabel}`}
        {!soldOut && <Plus size={15} strokeWidth={2.4} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addItem(item, 1)}
      disabled={soldOut}
      aria-label={
        soldOut
          ? `${item.name} is sold out`
          : `Add ${item.name} (${item.variantLabel}) to cart`
      }
      title={soldOut ? "Sold out" : `Add ${item.variantLabel}`}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors ${
        soldOut
          ? "cursor-not-allowed border-line bg-cream text-body/40"
          : "border-brand/25 bg-white text-brand hover:border-brand hover:bg-brand hover:text-white"
      }`}
    >
      <Plus size={17} strokeWidth={2.2} />
    </button>
  );
}
