import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const store = await getStore();
  const eventType = String(event.event || "");

  if (eventType === "payment.captured") {
    const payload = event.payload as Record<string, unknown>;
    const payment = payload?.payment as Record<string, unknown>;
    const entity = payment?.entity as Record<string, unknown>;
    const razorpayOrderId = String(entity?.order_id || "");
    const razorpayPaymentId = String(entity?.id || "");

    // Find order by razorpayOrderId
    const orders = await store.orders.list();
    const order = orders.find((o) => o.payment?.razorpayOrderId === razorpayOrderId);

    if (order && order.payment?.status !== "paid") {
      await store.orders.markPaid(order.id, razorpayPaymentId);
    }

    // Check B2B orders
    // B2B orders are tracked separately; payment completion handled on B2B pay page
  }

  if (eventType === "payment.failed") {
    const payload = event.payload as Record<string, unknown>;
    const payment = payload?.payment as Record<string, unknown>;
    const entity = payment?.entity as Record<string, unknown>;
    const razorpayOrderId = String(entity?.order_id || "");

    const orders = await store.orders.list();
    const order = orders.find((o) => o.payment?.razorpayOrderId === razorpayOrderId);

    if (order) {
      await store.orders.update(order.id, {
        payment: {
          status: "failed",
          razorpayOrderId: order.payment.razorpayOrderId,
          razorpayPaymentId: null,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
