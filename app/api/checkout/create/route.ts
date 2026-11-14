import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/auth";
import { site } from "@/lib/site";
import { getStore } from "@/lib/store";
import { normalizeDriveLink } from "@/lib/drive-utils";
import { computeDeliveryCharge } from "@/lib/delivery";
import {
  clean,
  isEmail,
  isPhone,
  isPincode,
  normalisePhone,
  toInt,
} from "@/lib/validate";
import {
  createRazorpayOrder,
  isPaymentSimulationAllowed,
  isRazorpayConfigured,
  razorpayKeyId,
} from "@/lib/razorpay";
import type { OrderItem } from "@/lib/types";

type IncomingItem = {
  productId?: unknown;
  variantId?: unknown;
  qty?: unknown;
  name?: unknown;
  variantLabel?: unknown;
};

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const { allowed } = rateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const rawItems = Array.isArray(payload.items)
    ? (payload.items as IncomingItem[])
    : [];
  if (rawItems.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  if (rawItems.length > 40) {
    return NextResponse.json({ error: "Too many items in one order." }, { status: 400 });
  }

  const session = await getSession();
  const savedAddressId = clean(String(payload.savedAddressId ?? ""), 80);

  let name = clean(payload.name, 120);
  let email = clean(payload.email, 200).toLowerCase();
  let phoneRaw = clean(payload.phone, 20);
  let line1 = clean(payload.line1, 240);
  let line2 = clean(payload.line2, 240);
  let city = clean(payload.city, 120);
  let state = clean(payload.state, 120);
  let pincode = clean(payload.pincode, 10);
  const notes = clean(payload.notes, 600);
  const fulfillment = clean(String(payload.fulfillment ?? "delivery"), 20) === "self" ? "self" : "delivery";
  const giftWrap = payload.giftWrap === true;
  const giftMessage = clean(payload.giftMessage, 500);

  const store = await getStore();

  // If saved address selected, override address fields from user's saved address
  let skipAddressSave = false;
  if (session?.role === "user" && savedAddressId) {
    const user = await store.users.get(session.id);
    const addr = user?.addresses?.find(a => a.id === savedAddressId);
    if (addr) {
      name = name || addr.name;
      phoneRaw = phoneRaw || addr.phone;
      line1 = addr.line1;
      line2 = addr.line2 ?? "";
      city = addr.city;
      state = addr.state;
      pincode = addr.pincode;
      skipAddressSave = true;
    }
  }

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!isPhone(phoneRaw)) {
    return NextResponse.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
  }
  if (line1.length < 4 || !city || !state) {
    return NextResponse.json({ error: "Please complete your delivery address." }, { status: 400 });
  }
  if (!isPincode(pincode)) {
    return NextResponse.json({ error: "Please enter a valid 6-digit PIN code." }, { status: 400 });
  }

  const items: OrderItem[] = [];

  for (const entry of rawItems) {
    const productId = clean(entry.productId, 80);
    const variantId = clean(entry.variantId, 80);
    const qty = Math.min(10, Math.max(1, toInt(entry.qty, 1)));
    if (!productId || !variantId) continue;

    const product = await store.products.get(productId);
    if (!product || !product.available) {
      return NextResponse.json(
        { error: "One of the items in your cart is no longer available." },
        { status: 409 },
      );
    }

    const variant = (product.variants ?? []).find((v) => v.id === variantId);
    if (!variant || !variant.active) {
      return NextResponse.json(
        {
          error: `${product.name} (${clean(entry.variantLabel, 60) || variantId}) is not available.`,
        },
        { status: 409 },
      );
    }
    if (variant.stock < qty) {
      return NextResponse.json(
        {
          error:
            variant.stock === 0
              ? `${product.name} (${variant.label}) is sold out. Please remove it from your cart.`
              : `Only ${variant.stock} of ${product.name} (${variant.label}) left. Please adjust the quantity.`,
        },
        { status: 409 },
      );
    }

    const { getVariantPricing } = await import("@/lib/pricing");
    const pricing = getVariantPricing(product, variant);
    const image = normalizeDriveLink(product.images[0] ?? "/assets/images/Ghee.jpg");

    items.push({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      image,
      variantLabel: variant.label,
      price: pricing.price,
      originalPrice: pricing.mrp && pricing.mrp > pricing.price ? pricing.mrp : undefined,
      qty,
    });
  }

  if (items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  // Calculate delivery charge based on branch distance (not pincode)
  let deliveryCharge = 0;
  if (fulfillment === "delivery") {
    const addressStr = [line1, line2, city, state, pincode].filter(Boolean).join(", ");
    if (addressStr.length >= 10) {
      const result = await computeDeliveryCharge(addressStr);
      deliveryCharge = result.charge;
    }
  }
  const shipping = deliveryCharge;
  
  // Handle coupon discount
  let discount = 0;
  let couponId: string | undefined;
  let discountCode: string | undefined;
  const couponCodeRaw = clean(String(payload.couponCode ?? ""), 40).toUpperCase();
  const couponIdRaw = clean(String(payload.couponId ?? ""), 80);
  const clientDiscount = Number(payload.discount) || 0;
  
  if (couponCodeRaw && session?.role === "user") {
    const coupon = await store.coupons.getByCode(couponCodeRaw);
    if (coupon) {
      const { evaluateCoupon } = await import("@/lib/pricing");
      const result = evaluateCoupon(coupon, subtotal);
      if (result.ok) {
        discount = result.discount;
        couponId = coupon.id;
        discountCode = coupon.code;
        // Increment usage
        try {
          await store.coupons.incrementUsage(coupon.id);
        } catch (e) {
          console.error("[CHECKOUT] Failed to increment usage:", e);
        }
      }
    }
  }
  
  const total = Math.max(0, subtotal + shipping - discount + (giftWrap ? 99 : 0));

  // create order
  const order = await store.orders.create({
    userId: session?.role === "user" ? session.id : null,
    email,
    customerName: name,
    phone: normalisePhone(phoneRaw),
    address: {
      name,
      phone: normalisePhone(phoneRaw),
      line1,
      line2,
      city,
      state,
      pincode,
    },
    items,
    subtotal,
    shipping,
    discount,
    discountCode,
    couponId,
    total,
    status: "pending",
    payment: {
      provider: "razorpay",
      status: "created",
      razorpayOrderId: null,
      razorpayPaymentId: null,
    },
    notes: giftWrap && giftMessage ? `${notes}\nGift wrap: ${giftMessage}`.trim() : notes,
    fulfillment,
  } as never);

  // Persist address to user profile if logged in
  if (session?.role === "user" && !skipAddressSave) {
    try {
      const user = await store.users.get(session.id);
      if (user) {
        const addresses = user.addresses ?? [];
        const exists = addresses.some(a => a.line1 === line1 && a.city === city && a.pincode === pincode && a.phone === normalisePhone(phoneRaw));
        if (!exists) {
          const addrId = `addr-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
          const newAddr = { id: addrId, label: "Order address", name, phone: normalisePhone(phoneRaw), line1, line2, city, state, pincode, isDefault: addresses.length === 0 };
          await store.users.update(session.id, { addresses: [newAddr, ...addresses] });
        }
      }
    } catch {}
  }

  if (!isRazorpayConfigured()) {
    if (isPaymentSimulationAllowed()) {
      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.number,
        mode: "simulate",
        amount: total,
      });
    }
    return NextResponse.json(
      {
        error:
          "Online payments are not set up yet. Please contact us to place this order.",
      },
      { status: 503 },
    );
  }

  try {
    const razorpayOrder = await createRazorpayOrder({
      amount: total * 100,
      receipt: order.number,
      notes: {
        orderId: order.id,
        orderNumber: order.number,
      },
    });

    await store.orders.update(order.id, {
      payment: {
        status: "created",
        razorpayOrderId: razorpayOrder.id,
        razorpayPaymentId: null,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.number,
      mode: "razorpay",
      keyId: razorpayKeyId(),
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name,
      email,
      phone: normalisePhone(phoneRaw),
    });
  } catch (error) {
    console.error("Checkout error", error);
    return NextResponse.json(
      {
        error:
          "We could not start the payment. Your cart is safe — please try again in a moment.",
      },
      { status: 502 },
    );
  }
}
