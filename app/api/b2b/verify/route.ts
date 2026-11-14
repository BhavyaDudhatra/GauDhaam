import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { clean } from "@/lib/validate";
import { verifyPaymentSignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const b2bOrderId = clean(payload.b2bOrderId, 80);
  const razorpayOrderId = clean(payload.razorpay_order_id, 100);
  const razorpayPaymentId = clean(payload.razorpay_payment_id, 100);
  const signature = clean(payload.razorpay_signature, 200);

  if (!b2bOrderId || !razorpayOrderId || !razorpayPaymentId || !signature) {
    return NextResponse.json({ error: "Incomplete payment details." }, { status: 400 });
  }

  const store = await getStore();
  const order = await store.b2bOrders.get(b2bOrderId);
  if (!order) {
    return NextResponse.json({ error: "B2B order not found." }, { status: 404 });
  }

  // Verify signature
  if (!verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, signature })) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  // Mark B2B order as completed
  await store.b2bOrders.update(b2bOrderId, {
    status: "completed",
    paymentStatus: "paid" as any,
  } as any);

  // Create a regular order entry
  const session = (await import("@/lib/auth")).getSession;
  // Note: session might not be available in API route context, use order.userId
  if (order.userId) {
    await store.orders.create({
      userId: order.userId,
      email: "",
      customerName: order.fullName,
      phone: order.phone,
      address: {
        name: order.fullName,
        phone: order.phone,
        line1: order.address || "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
      },
      items: [{ productId: order.itemName || "", variantId: "", name: order.itemName || "", slug: "", image: "", variantLabel: "", price: order.priceQuoted || 0, qty: order.quantity || 1 }],
      subtotal: order.priceQuoted || 0,
      shipping: order.deliveryCharge || 0,
      discount: 0,
      total: (order.priceQuoted || 0) + (order.deliveryCharge || 0),
      status: "pending",
      payment: {
        provider: "razorpay",
        status: "paid",
        razorpayOrderId,
        razorpayPaymentId,
      },
      notes: `Converted from B2B ${order.id}`,
    } as any);
  }

  return NextResponse.json({ ok: true });
}
