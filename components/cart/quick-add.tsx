"use client";

import { Plus } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";

export function QuickAdd({
  product,
}: {
  product: {
    productId: string;
    variantId: string;
    slug: string;
    name: string;
    image: string;
    variantLabel: string;
    price: number;
    originalPrice?: number;
    stock: number;
  };
}) {
  const { addItem } = useCart();
  const soldOut = product.stock <= 0;

  return (
    <button
      type="button"
      onClick={() => addItem(product, 1)}
      disabled={soldOut}
      aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
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
