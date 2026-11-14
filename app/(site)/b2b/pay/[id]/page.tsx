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
  let amount = Math.round((order.priceQuoted + (order.deliveryCharge || 0)) * 100);

  // Create Razorpay order if not exists
  if (isRazorpayConfigured()) {
    const { createRazorpayOrder } = await import("@/lib/razorpay");
    if (db) {
      const doc = await db.collection("b2bOrders").doc(id).get();
      razorpayOrderId = doc.data()?.razorpayOrderId || "";
      if (!razorpayOrderId) {
        const rzp = await createRazorpayOrder({ amount, receipt: `B2B-${id}` });
        razorpayOrderId = rzp.id;
        await db.collection("b2bOrders").doc(id).update({
          razorpayOrderId,
          paymentStatus: "pending",
        });
      }
    }
  }

  const total = order.priceQuoted + (order.deliveryCharge || 0);

  return (
    <div className="container-gd py-10 max-w-xl">
      <h1 className="text-[22px] font-bold">Pay for B2B order</h1>
      <div className="card p-6 mt-4 space-y-3">
        <p><strong>Item:</strong> {order.itemName} × {order.quantity}</p>
        <p><strong>Quoted amount:</strong> {formatINR(order.priceQuoted)}</p>
        <p><strong>Delivery charge:</strong> {formatINR(order.deliveryCharge || 0)}</p>
        <p className="text-[18px] font-bold">Total: {formatINR(total)}</p>
        {isRazorpayConfigured() ? (
          <div>
            <button id="rzp-button" className="btn btn-primary btn-sm">Pay {formatINR(total)}</button>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  document.getElementById('rzp-button').addEventListener('click', function(e){
                    var options = {
                      key: "${razorpayKeyId()}",
                      amount: ${amount},
                      currency: "INR",
                      name: "GauDhaam",
                      description: "B2B Order ${id}",
                      order_id: "${razorpayOrderId}",
                      handler: function(response){
                        fetch('/api/b2b/verify', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            b2bOrderId: "${id}",
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                          }),
                        }).then(function() {
                          window.location.href = '/b2b/orders?paid=1';
                        });
                      },
                      prefill: {},
                      theme: { color: "#496B45" }
                    };
                    var rzp = new Razorpay(options);
                    rzp.open();
                    e.preventDefault();
                  });
                `
              }}
            />
            <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
            <a href="/b2b/orders" className="btn btn-outline btn-sm mt-4 ml-2">Back</a>
          </div>
        ) : (
          <p className="text-body/70">Razorpay not configured. Payment endpoint will be integrated.</p>
        )}
      </div>
    </div>
  );
}
