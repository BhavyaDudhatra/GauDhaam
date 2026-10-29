import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { clean } from "@/lib/validate";
import {
  isPaymentSimulationAllowed,
  verifyPaymentSignature,
} from "@/lib/razorpay";

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const orderId = clean(payload.orderId, 80);
  if (!orderId) {
    return NextResponse.json({ error: "Missing order." }, { status: 400 });
  }

  const store = await getStore();
  const order = await store.orders.get(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.payment.status === "paid") {
    return NextResponse.json({ ok: true, orderNumber: order.number });
  }

  // Development-only simulation, never available on a production build.
  if (payload.dev === true) {
    if (!isPaymentSimulationAllowed()) {
      return NextResponse.json({ error: "Simulated payments are disabled." }, { status: 403 });
    }
    await store.orders.markPaid(order.id, `sim_${Date.now()}`);
    return NextResponse.json({ ok: true, orderNumber: order.number });
  }

  const razorpayOrderId = clean(payload.razorpay_order_id, 100);
  const razorpayPaymentId = clean(payload.razorpay_payment_id, 100);
  const signature = clean(payload.razorpay_signature, 200);

  if (!razorpayOrderId || !razorpayPaymentId || !signature) {
    return NextResponse.json({ error: "Incomplete payment details." }, { status: 400 });
  }

  if (!order.payment.razorpayOrderId || order.payment.razorpayOrderId !== razorpayOrderId) {
    return NextResponse.json({ error: "Payment does not match this order." }, { status: 400 });
  }

  if (
    !verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      signature,
    })
  ) {
    return NextResponse.json(
      { error: "We could not verify this payment. If money was deducted, contact us." },
      { status: 400 },
    );
  }

  await store.orders.markPaid(order.id, razorpayPaymentId);
  return NextResponse.json({ ok: true, orderNumber: order.number });
}
