import { getDb } from "@/lib/firebase";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DeliveryConfigPage() {
  await requireAdmin();
  const db = await getDb();
  const snap = await db.collection('config').doc('delivery').get();
  const config = snap.exists ? snap.data() as any : {baseFee:0, perKmRate:0};
  return (
    <div className="space-y-6">
      <h1 className="text-[22px]">Delivery Config</h1>
      <form method="post" action="/api/admin/delivery-config" className="card p-4 space-y-3">
        <label className="field"><span className="label">Base Fee ₹</span><input name="baseFee" type="number" step="0.01" defaultValue={config.baseFee||0} className="input"/></label>
        <label className="field"><span className="label">Per Km Rate ₹</span><input name="perKmRate" type="number" step="0.01" defaultValue={config.perKmRate||0} className="input"/></label>
        <button className="btn btn-primary btn-sm">Save</button>
      </form>
    </div>
  );
}
