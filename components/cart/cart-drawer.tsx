"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { formatINR } from "@/lib/money";
import { site } from "@/lib/site";

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    lines,
    count,
    subtotal,
    setQty,
    removeItem,
  } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const remaining = site.freeShippingAbove - subtotal;
  const progress = Math.min(100, Math.round((subtotal / site.freeShippingAbove) * 100));

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 animate-fade-in cursor-default bg-brand-dark/35 backdrop-blur-[1px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute right-0 top-0 flex h-full w-full max-w-[420px] animate-slide-in flex-col bg-cream shadow-lift"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[17px]">Your cart</h2>
            <p className="mt-0.5 text-[12px] text-body">
              {count === 0
                ? "Nothing here yet"
                : `${count} ${count === 1 ? "item" : "items"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="grid h-9 w-9 place-items-center rounded-full text-brand-dark transition-colors hover:bg-light"
          >
            <X size={19} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-light text-brand">
              <ShoppingBag size={26} strokeWidth={1.6} />
            </div>
            <h3 className="mt-4 text-[17px]">Your cart is empty</h3>
            <p className="mt-2 text-[13.5px]">
              Ghee, honey and herbal care are waiting for you.
            </p>
            <Link href="/products" onClick={closeCart} className="btn btn-primary mt-5">
              Start shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-line bg-white/60 px-5 py-3.5">
              {remaining > 0 ? (
                <p className="text-[12px] font-semibold text-brand-dark">
                  Add {formatINR(remaining)} more for free delivery
                </p>
              ) : (
                <p className="text-[12px] font-semibold text-brand-dark">
                  Free delivery unlocked
                </p>
              )}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              <ul className="divide-y divide-line">
                {lines.map((line) => {
                  const key = `${line.productId}:${line.variantId}`;
                  return (
                    <li key={key} className="flex gap-3 py-4">
                      <Link
                        href={`/product/${line.slug}`}
                        onClick={closeCart}
                        className="relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-[12px] border border-line bg-light"
                      >
                        <Image
                          src={line.image}
                          alt={line.name}
                          fill
                          sizes="74px"
                          className="object-cover"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${line.slug}`}
                            onClick={closeCart}
                            className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-brand-dark hover:text-brand"
                          >
                            {line.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(key)}
                            aria-label={`Remove ${line.name}`}
                            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-body/60 transition-colors hover:bg-light hover:text-brown"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="mt-0.5 text-[11.5px] text-body/80">
                          {line.variantLabel} · {formatINR(line.price)}
                          {line.originalPrice && line.originalPrice > line.price && (
                            <span className="ml-1 line-through text-body/40">
                              {formatINR(line.originalPrice)}
                            </span>
                          )}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <QuantityStepper
                            value={line.qty}
                            onChange={(value) => setQty(key, value)}
                            max={Math.max(1, line.stock)}
                            size="sm"
                          />
                          <span className="text-[13.5px] font-semibold text-brand-dark">
                            {formatINR(line.price * line.qty)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-line bg-white/60 px-5 py-4">
              <div className="flex items-center justify-between text-[14px] font-semibold text-brand-dark">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <p className="mt-1 text-[11.5px] text-body">
                Delivery and taxes are calculated at checkout.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn btn-primary mt-3 w-full"
              >
                Checkout
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="mt-2 block text-center text-[12.5px] font-semibold text-brand underline-offset-2 hover:underline"
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
