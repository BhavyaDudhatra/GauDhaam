import type { Metadata } from "next";
import { getDb } from "@/lib/firebase";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Delivery Charges — Admin" };
export const dynamic = "force-dynamic";

export default async function DeliveryChargesPage() {
  await requireAdmin();
  const db = await getDb();
  let zones: any[] = [];
  if (db) {
    const snap = await db.collection('delivery_zones').orderBy('pincodePrefix','asc').get();
    zones = snap.docs.map(d=>({id:d.id,...d.data()}));
  }
  return (
    <div className="space-y-6">
      <h1 className="text-[22px]">Delivery Charges</h1>
      <form action="/api/admin/delivery-zones" method="post" className="card p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="field"><span className="label">PIN code prefix</span><input name="pincodePrefix" required pattern="[0-9]{3,6}" className="input" placeholder="e.g. 380"/></label>
          <label className="field"><span className="label">Charge ₹</span><input name="charge" required type="number" min="0" className="input"/></label>
          <label className="field"><span className="label">Label</span><input name="label" className="input" placeholder="Ahmedabad"/></label>
        </div>
        <button className="btn btn-primary btn-sm">Add Zone</button>
      </form>
      <div className="card p-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-left text-body/70"><tr><th className="py-2">Prefix</th><th>Charge</th><th>Label</th><th></th></tr></thead>
          <tbody>
            {zones.map(z=>(
              <tr key={z.id} className="border-t border-line">
                <td className="py-2">{z.pincodePrefix}</td>
                <td>₹{z.charge}</td>
                <td>{z.label||''}</td>
                <td className="text-right"><form action="/api/admin/delivery-zones/delete" method="post"><input type="hidden" name="id" value={z.id}/><button className="text-red-600 text-[12px]">Delete</button></form></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
