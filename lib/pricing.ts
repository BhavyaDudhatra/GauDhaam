import type { Coupon, Offer, Product, ProductVariant } from "@/lib/types";

function dateOnlyEnd(value: string) {
  const date = new Date(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setHours(23, 59, 59, 999);
  }
  return date;
}

export function isOfferActive(offer: Offer | null | undefined, qty = 1) {
  if (!offer || offer.value <= 0) return false;
  if (offer.minQty && qty < offer.minQty) return false;

  const now = Date.now();
  if (offer.startDate) {
    const start = new Date(offer.startDate);
    if (!Number.isNaN(start.getTime()) && now < start.getTime()) return false;
  }
  if (offer.endDate) {
    const end = dateOnlyEnd(offer.endDate);
    if (!Number.isNaN(end.getTime()) && now > end.getTime()) return false;
  }
  return true;
}

export function offerLabel(offer: Offer | null | undefined) {
  if (!offer || offer.value <= 0) return "";
  return (
    offer.label ||
    (offer.type === "percentage"
      ? `${offer.value}% off`
      : `₹${offer.value} off`)
  );
}

function applyOffer(base: number, offer: Offer) {
  const next =
    offer.type === "percentage"
      ? base - Math.round((base * offer.value) / 100)
      : base - Math.round(offer.value);
  return Math.max(1, next);
}

export type VariantPricing = {
  unitPrice: number;
  listPrice: number;
  compareAt: number;
  hasOffer: boolean;
  offer: Offer | null;
  badge: string;
};

/** Variant offer wins; otherwise the product offer applies. */
export function pricingFor(
  product: Pick<Product, "offer">,
  variant: Pick<ProductVariant, "price" | "mrp" | "offer">,
  qty = 1,
): VariantPricing {
  const variantOffer = variant.offer && isOfferActive(variant.offer, qty) ? variant.offer : null;
  const productOffer =
    !variantOffer && isOfferActive(product.offer, qty) ? product.offer : null;
  const offer = variantOffer ?? productOffer;
  const unitPrice = offer ? applyOffer(variant.price, offer) : variant.price;
  const compareAt = Math.max(variant.mrp ?? 0, variant.price);

  return {
    unitPrice,
    listPrice: variant.price,
    compareAt,
    hasOffer: Boolean(offer) && unitPrice < compareAt,
    offer,
    badge: offer ? offerLabel(offer) : "",
  };
}

export function activeVariants(product: Product) {
  return (product.variants ?? []).filter((variant) => variant.active !== false);
}

export function variantStock(product: Product) {
  return activeVariants(product).reduce(
    (sum, variant) => sum + Math.max(0, variant.stock),
    0,
  );
}

export function isProductBuyable(product: Product) {
  return product.available !== false && variantStock(product) > 0;
}

export function getVariantPricing(product: Product, variant: ProductVariant) {
  const pricing = pricingFor(product, variant);
  return {
    price: pricing.unitPrice,
    mrp: pricing.compareAt > pricing.unitPrice ? pricing.compareAt : null,
    originalPrice: pricing.compareAt > pricing.unitPrice ? pricing.compareAt : undefined,
    offerLabel: pricing.badge,
    hasOffer: pricing.hasOffer,
  };
}

export function isVariantBuyable(variant: ProductVariant) {
  return variant.active !== false && variant.stock > 0;
}

export function cheapestVariant(product: Product) {
  const variants = activeVariants(product);
  if (variants.length === 0) return null;
  return variants.reduce((best, variant) =>
    pricingFor(product, variant).unitPrice < pricingFor(product, best).unitPrice
      ? variant
      : best,
  );
}

export function firstBuyableVariant(product: Product) {
  const variants = activeVariants(product);
  return (
    variants.find((variant) => variant.stock > 0) ?? variants[0] ?? null
  );
}

export function priceRange(product: Product) {
  const variants = activeVariants(product);
  if (variants.length === 0) return { min: 0, max: 0 };
  const prices = variants.map((variant) => pricingFor(product, variant).unitPrice);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function countActiveOffers(products: Product[]) {
  return products.filter(
    (product) =>
      isOfferActive(product.offer) ||
      activeVariants(product).some((variant) => isOfferActive(variant.offer)),
  ).length;
}

export type CouponResult = {
  ok: boolean;
  discount: number;
  error: string;
};

export function evaluateCoupon(
  coupon: Coupon | null,
  subtotal: number,
): CouponResult {
  if (!coupon) return { ok: false, discount: 0, error: "That code is not valid." };
  if (!coupon.active) {
    return { ok: false, discount: 0, error: "This coupon is no longer active." };
  }

  const now = Date.now();
  if (coupon.startDate && now < new Date(coupon.startDate).getTime()) {
    return { ok: false, discount: 0, error: "This coupon is not live yet." };
  }
  if (coupon.endDate && now > dateOnlyEnd(coupon.endDate).getTime()) {
    return { ok: false, discount: 0, error: "This coupon has expired." };
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, discount: 0, error: "This coupon has been fully claimed." };
  }
  if (subtotal < coupon.minOrderValue) {
    return {
      ok: false,
      discount: 0,
      error: `Add ₹${coupon.minOrderValue - subtotal} more to use ${coupon.code}.`,
    };
  }

  let discount =
    coupon.type === "percentage"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.round(coupon.value);

  if (coupon.type === "percentage" && coupon.maxDiscount) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  discount = Math.max(0, Math.min(discount, subtotal));
  if (discount === 0) {
    return { ok: false, discount: 0, error: "This coupon has no value for this cart." };
  }

  return { ok: true, discount, error: "" };
}
