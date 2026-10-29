import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { QuickAdd } from "@/components/product/quick-add";
import { SmartImage } from "@/components/ui/smart-image";
import { Stars } from "@/components/ui/stars";
import { formatINR } from "@/lib/money";
import {
  activeVariants,
  cheapestVariant,
  isProductBuyable,
  pricingFor,
} from "@/lib/pricing";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  rating,
  reviewCount,
}: {
  product: Product;
  rating?: number;
  reviewCount?: number;
}) {
  const variants = activeVariants(product);
  const cheapest = cheapestVariant(product);
  const pricing = cheapest ? pricingFor(product, cheapest) : null;
  const buyable = isProductBuyable(product);
  const image = product.images[0] || "/assets/images/Ghee.jpg";
  const hasMultiple = variants.length > 1;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition-shadow hover:shadow-soft dark:bg-[#20261f]">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-light"
      >
        <SmartImage
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-dark backdrop-blur dark:bg-[#171c17]/90 dark:text-[#e7efe6]">
          {product.category}
        </span>
        {pricing?.hasOffer && (
          <span className="absolute right-3 top-3 rounded-full bg-brown px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
            {pricing.badge}
          </span>
        )}
        {!buyable && (
          <span className="absolute inset-0 grid place-items-center bg-brand-dark/55 backdrop-blur-[1px]">
            <span className="rounded-full bg-cream px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-brown">
              Sold out
            </span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {reviewCount ? (
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-body/75">
            <Stars rating={rating ?? 0} size={11} />
            <span>({reviewCount})</span>
          </div>
        ) : null}

        <h3 className="text-[15px] leading-snug">
          <Link
            href={`/product/${product.slug}`}
            className="text-brand-dark transition-colors hover:text-brand dark:text-[#e7efe6]"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-body/85">
          {product.shortDescription}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            {pricing ? (
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="text-[16px] font-bold text-brand-dark dark:text-[#e7efe6]">
                  {formatINR(pricing.unitPrice)}
                </span>
                {pricing.compareAt > pricing.unitPrice && (
                  <span className="text-[11.5px] text-body/55 line-through">
                    {formatINR(pricing.compareAt)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[13px] font-semibold text-body/70">
                Coming soon
              </span>
            )}
            {cheapest && (
              <p className="mt-0.5 text-[10.5px] text-body/65">
                {hasMultiple
                  ? `${variants.length} sizes · from ${cheapest.label}`
                  : cheapest.label}
              </p>
            )}
          </div>

          {buyable && cheapest ? (
            <QuickAdd
              item={{
                productId: product.id,
                variantId: cheapest.id,
                slug: product.slug,
                name: product.name,
                image,
                variantLabel: cheapest.label,
                price: pricingFor(product, cheapest).unitPrice,
                originalPrice: pricingFor(product, cheapest).hasOffer
                  ? pricingFor(product, cheapest).listPrice
                  : undefined,
                stock: cheapest.stock,
              }}
            />
          ) : (
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand"
            >
              Details
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-white">
      <div className="aspect-square animate-pulse bg-light" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-2/3 animate-pulse rounded bg-light" />
        <div className="h-3 w-full animate-pulse rounded bg-light" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-light" />
      </div>
    </div>
  );
}

export function EmptyProducts({ message }: { message?: string }) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-light text-brand">
        <Leaf size={24} strokeWidth={1.6} />
      </span>
      <h2 className="mt-4 text-[18px]">Nothing matches that search</h2>
      <p className="mt-2 max-w-sm text-[13px]">
        {message ?? "Try a different category or a simpler search term."}
      </p>
      <Link href="/products" className="btn btn-primary btn-sm mt-5">
        View all products
      </Link>
    </div>
  );
}
