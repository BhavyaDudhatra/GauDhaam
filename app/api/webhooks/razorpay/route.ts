import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };

  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id) {
      const store = await getStore();
      const orders = await store.orders.list();
      const order = orders.find(
        (item) => item.payment.razorpayOrderId === payment.order_id,
      );
      if (order) {
        await store.orders.markPaid(order.id, payment.id ?? null);
      }
    }
  }

  return NextResponse.json({ received: true });
}
