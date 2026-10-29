"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { getVariantPricing, isVariantBuyable } from "@/lib/pricing";
import { formatINR } from "@/lib/money";
import type { Product } from "@/lib/types";

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const variants = product.variants ?? [];
  const [activeVariantId, setActiveVariantId] = useState(
    variants.find((variant) => variant.active && variant.stock > 0)?.id ??
      variants[0]?.id ??
      "",
  );
  const [qty, setQty] = useState(1);

  const variant = variants.find((item) => item.id === activeVariantId);
  const pricing = variant ? getVariantPricing(product, variant) : null;
  const buyable = variant ? isVariantBuyable(variant) : false;

  const maxQty = useMemo(() => {
    if (!variant) return 1;
    return Math.max(1, Math.min(10, variant.stock));
  }, [variant]);

  if (!variant || !pricing) {
    return (
      <p className="mt-4 text-[13px] text-body/80">
        No pack options available for this product.
      </p>
    );
  }

  const off =
    pricing.mrp && pricing.mrp > pricing.price
      ? Math.round(((pricing.mrp - pricing.price) / pricing.mrp) * 100)
      : 0;

  return (
    <div className="mt-5">
      {variants.length > 1 && (
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-body/70">
            Choose pack size
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((item) => {
              const itemPricing = getVariantPricing(product, item);
              const itemBuyable = isVariantBuyable(item);
              const active = item.id === activeVariantId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveVariantId(item.id)}
                  disabled={!itemBuyable}
                  className={`rounded-full border px-3.5 py-1.5 text-[12.5px] ${
                    active
                      ? "border-brand bg-brand text-white"
                      : itemBuyable
                        ? "border-line bg-white text-brand-dark"
                        : "cursor-not-allowed border-line/70 bg-light/60 text-body/40"
                  }`}
                >
                  {item.label}
                  {!itemBuyable && <span className="ml-1">· Sold out</span>}
                  {itemPricing.offerLabel && itemBuyable && (
                    <span className="ml-1 opacity-80">· {itemPricing.offerLabel}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-baseline gap-2.5">
        <span className="text-[26px] font-bold leading-none text-brand-dark">
          {formatINR(pricing.price)}
        </span>
        {pricing.mrp && pricing.mrp > pricing.price && (
          <>
            <span className="text-[14px] text-body/50 line-through">
              {formatINR(pricing.mrp)}
            </span>
            <span className="text-[12px] font-semibold text-brand">
              {off}% off
            </span>
          </>
        )}
        {pricing.offerLabel && (
          <span className="badge badge-green">{pricing.offerLabel}</span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-body/65">Inclusive of all taxes</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border border-line">
          <button
            type="button"
            onClick={() => setQty((value) => Math.max(1, value - 1))}
            className="grid h-10 w-10 place-items-center"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center text-[13px]">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((value) => Math.min(maxQty, value + 1))}
            className="grid h-10 w-10 place-items-center"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>
        <button
          type="button"
          disabled={!buyable}
          onClick={() => {
            if (!variant) return;
            addItem(
              {
                productId: product.id,
                variantId: variant.id,
                slug: product.slug,
                name: product.name,
                image: product.images[0] ?? "/assets/images/Ghee.jpg",
                variantLabel: variant.label,
                price: pricing.price,
                originalPrice: pricing.mrp && pricing.mrp > pricing.price ? pricing.mrp : undefined,
                stock: variant.stock,
              },
              qty,
            );
          }}
          className="btn btn-primary flex-1 sm:flex-none"
        >
          {buyable ? "Add to cart" : "Sold out"}
        </button>
      </div>
      {!buyable && (
        <p className="mt-2 text-[12px] text-brown-dark">
          This pack size is currently sold out.
        </p>
      )}
    </div>
  );
}
