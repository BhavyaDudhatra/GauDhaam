import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { getDb } from "@/lib/firebase";
import { formatINR } from "@/lib/money";
import { razorpayKeyId, isRazorpayConfigured } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export default async function B2BPayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) redirect("/b2b/orders");
  const session = await getSession();
  if (!session) redirect("/login?next=/b2b/orders");
  const store = await getStore();
  const order = await store.b2bOrders.get(id);
  if (!order || order.userId !== session.id) redirect("/b2b/orders");
  if (!order.priceQuoted) redirect("/b2b/orders");

  const db = await getDb();
  let razorpayOrderId = "";
  if (db) {
    const doc = await db.collection("b2bOrders").doc(id).get();
    razorpayOrderId = doc.data()?.razorpayOrderId || "";
  }

  const amount = Math.round((order.priceQuoted + (order.deliveryCharge || 0)) * 100);

  return (
    <div className="container-gd py-10 max-w-xl">
      <h1 className="text-[22px] font-bold">Pay for B2B order</h1>
      <div className="card p-6 mt-4 space-y-3">
        <p><strong>Item:</strong> {order.itemName} × {order.quantity}</p>
        <p><strong>Quoted amount:</strong> {formatINR(order.priceQuoted)}</p>
        <p><strong>Delivery charge:</strong> {formatINR(order.deliveryCharge || 0)}</p>
        <p className="text-[18px] font-bold">Total: {formatINR(order.priceQuoted + (order.deliveryCharge || 0))}</p>
        {isRazorpayConfigured() ? (
          <form action={`https://checkout.razorpay.com/v1/checkout`} method="POST">
            <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
            <p>Razorpay integration will be handled here. Order ID: {razorpayOrderId || "pending"}</p>
            <a href="/b2b/orders" className="btn btn-outline btn-sm mt-4">Back</a>
          </form>
        ) : (
          <p className="text-body/70">Razorpay not configured. Payment endpoint will be integrated.</p>
        )}
      </div>
    </div>
  );
}
