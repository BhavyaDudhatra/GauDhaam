"use client";

import { useState } from "react";
import { X, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Img } from "@/components/ui/Img";
import { formatINR } from "@/lib/money";
import { useCart, type AddableItem } from "@/components/cart/cart-context";
import { getVariantPricing, activeVariants, isVariantBuyable } from "@/lib/pricing";
import type { Product } from "@/lib/types";

export function QuickView({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const { addItem } = useCart();
  const variants = activeVariants(product);
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants.find((v) => v.active && v.stock > 0)?.id ?? variants[0]?.id ?? "",
  );
  const variant = variants.find((v) => v.id === selectedVariantId);
  const pricing = variant ? getVariantPricing(product, variant) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11.5px] font-semibold text-brand hover:underline"
      >
        Quick view
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-lift overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-body hover:bg-light"
            >
              <X size={16} />
            </button>
            <div className="grid gap-0 md:grid-cols-2">
              <div className="relative aspect-square bg-light">
                <Img
                  src={product.images?.[0] ?? "/assets/images/Ghee.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brown">
                  {product.category}
                </p>
                <h2 className="text-[20px] font-bold text-brand-dark">{product.name}</h2>
                <p className="text-[13px] text-body/80">{product.shortDescription}</p>
                {pricing && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[24px] font-bold text-brand-dark">
                      {formatINR(pricing.price)}
                    </span>
                    {pricing.mrp && pricing.mrp > pricing.price && (
                      <span className="text-[14px] text-body/50 line-through">
                        {formatINR(pricing.mrp)}
                      </span>
                    )}
                  </div>
                )}
                {variants.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        disabled={v.stock <= 0}
                        className={`rounded-full border px-3 py-1.5 text-[12px] ${
                          selectedVariantId === v.id
                            ? "border-brand bg-brand text-white"
                            : v.stock <= 0
                              ? "cursor-not-allowed border-line/70 bg-light/60 text-body/40"
                              : "border-line bg-white text-brand-dark"
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  disabled={!variant || !isVariantBuyable(variant)}
                  onClick={() => {
                    if (!variant) return;
                    const item: AddableItem = {
                      productId: product.id,
                      variantId: variant.id,
                      slug: product.slug,
                      name: product.name,
                      image: product.images?.[0] ?? "/assets/images/Ghee.jpg",
                      variantLabel: variant.label,
                      price: pricing!.price,
                      originalPrice: pricing!.mrp && pricing!.mrp > pricing!.price ? pricing!.mrp : undefined,
                      stock: variant.stock,
                    };
                    addItem(item, 1);
                    setOpen(false);
                  }}
                  className="btn btn-primary btn-block"
                >
                  <ShoppingBag size={16} />
                  Add to cart
                </button>
                <Link
                  href={`/product/${product.slug}`}
                  className="block text-center text-[12.5px] font-semibold text-brand hover:underline"
                  onClick={() => setOpen(false)}
                >
                  View full details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
