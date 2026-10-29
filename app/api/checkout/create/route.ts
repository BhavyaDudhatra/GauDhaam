import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { shippingFor } from "@/lib/money";
import { site } from "@/lib/site";
import { getStore } from "@/lib/store";
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

  const name = clean(payload.name, 120);
  const email = clean(payload.email, 200).toLowerCase();
  const phoneRaw = clean(payload.phone, 20);
  const line1 = clean(payload.line1, 240);
  const line2 = clean(payload.line2, 240);
  const city = clean(payload.city, 120);
  const state = clean(payload.state, 120);
  const pincode = clean(payload.pincode, 10);
  const notes = clean(payload.notes, 600);

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

  const store = await getStore();
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
    const image = product.images[0] ?? "/assets/images/Ghee.jpg";

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
  const shipping = shippingFor(subtotal, site.freeShippingAbove, site.shippingFee);
  const total = subtotal + shipping;

  const session = await getSession();

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
    discount: 0,
    discountCode: undefined,
    couponId: undefined,
    total,
    status: "pending",
    payment: {
      provider: "razorpay",
      status: "created",
      razorpayOrderId: null,
      razorpayPaymentId: null,
    },
    notes,
  } as never);

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
