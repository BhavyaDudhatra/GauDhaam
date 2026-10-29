"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { formatINR, shippingFor } from "@/lib/money";
import { site } from "@/lib/site";

export default function CartPage() {
  const { lines, hydrated, subtotal, setQty, removeItem, count } = useCart();

  const shipping = shippingFor(subtotal, site.freeShippingAbove, site.shippingFee);
  const remaining = site.freeShippingAbove - subtotal;

  return (
    <>
      <section className="border-b border-line bg-light/40">
        <div className="container-gd py-9 md:py-11">
          <span className="eyebrow">Your basket</span>
          <h1 className="mt-2">Cart</h1>
          <p className="mt-2 text-[13.5px]">
            {hydrated
              ? count === 0
                ? "Your cart is waiting to be filled."
                : `${count} ${count === 1 ? "item" : "items"} ready to go.`
              : "Loading your cart…"}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-gd">
          {!hydrated ? (
            <div className="card h-56 animate-pulse bg-white/60" />
          ) : lines.length === 0 ? (
            <div className="card flex flex-col items-center px-6 py-16 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-light text-brand">
                <ShoppingBag size={26} strokeWidth={1.6} />
              </span>
              <h2 className="mt-4 text-[19px]">Nothing in here yet</h2>
              <p className="mt-2 max-w-sm text-[13.5px]">
                Start with a jar of ghee or a bottle of herbal oil — everything is
                made in small batches and packed in glass.
              </p>
              <Link href="/products" className="btn btn-primary mt-5">
                Browse products
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:gap-8">
              <div className="space-y-4">
                <div className="card overflow-hidden">
                  <ul className="divide-y divide-line">
                    {lines.map((line) => (
                      <li key={`${line.productId}:${line.variantId}`} className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                        <Link
                          href={`/product/${line.slug}`}
                          className="relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-[14px] border border-line bg-light sm:h-24 sm:w-24"
                        >
                          <Image
                            src={line.image}
                            alt={line.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/product/${line.slug}`}
                                className="line-clamp-2 text-[14px] font-semibold leading-snug text-brand-dark hover:text-brand"
                              >
                                {line.name}
                              </Link>
                              <p className="mt-0.5 text-[11.5px] text-body/75">
                                {line.variantLabel} · {formatINR(line.price)}
                                {line.originalPrice && line.originalPrice > line.price && (
                                  <span className="ml-1 line-through text-body/40">
                                    {formatINR(line.originalPrice)}
                                  </span>
                                )}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(`${line.productId}:${line.variantId}`)}
                              aria-label={`Remove ${line.name}`}
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-body/60 transition-colors hover:bg-light hover:text-brown"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <QuantityStepper
                              value={line.qty}
                              onChange={(value) => setQty(`${line.productId}:${line.variantId}`, value)}
                              max={Math.max(1, line.stock)}
                              size="sm"
                            />
                            <span className="text-[14px] font-bold text-brand-dark">
                              {formatINR(line.price * line.qty)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:text-brand-dark"
                >
                  <ArrowLeft size={15} />
                  Continue shopping
                </Link>
              </div>

              <aside className="lg:sticky lg:top-28 lg:self-start">
                <div className="card p-5">
                  <h2 className="text-[17px]">Order summary</h2>

                  <dl className="mt-4 space-y-2.5 text-[13.5px]">
                    <div className="flex justify-between">
                      <dt>Subtotal</dt>
                      <dd className="font-semibold text-brand-dark">
                        {formatINR(subtotal)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Delivery</dt>
                      <dd className="font-semibold text-brand-dark">
                        {shipping === 0 ? "Free" : formatINR(shipping)}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-line pt-3 text-[15px]">
                      <dt className="font-semibold text-brand-dark">Total</dt>
                      <dd className="font-bold text-brand-dark">
                        {formatINR(subtotal + shipping)}
                      </dd>
                    </div>
                  </dl>

                  {remaining > 0 ? (
                    <p className="mt-3 flex items-start gap-2 rounded-xl bg-light/80 p-3 text-[11.5px] text-brand-dark">
                      <Truck size={15} className="mt-0.5 shrink-0 text-brand" />
                      Add {formatINR(remaining)} more and delivery is on us.
                    </p>
                  ) : (
                    <p className="mt-3 flex items-start gap-2 rounded-xl bg-light/80 p-3 text-[11.5px] text-brand-dark">
                      <Truck size={15} className="mt-0.5 shrink-0 text-brand" />
                      Free delivery applies to this order.
                    </p>
                  )}

                  <Link href="/checkout" className="btn btn-primary btn-block mt-4">
                    Proceed to checkout
                    <ArrowRight size={16} />
                  </Link>

                  <p className="mt-3 text-center text-[11px] leading-relaxed text-body/70">
                    Secure payment via Razorpay · UPI, cards & netbanking
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
