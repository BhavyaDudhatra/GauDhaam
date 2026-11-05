import { getDb } from "@/lib/firebase";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminComplementaryPage() {
  await requireAdmin();
  const db = await getDb();
  let gifts = [];
  if (db) {
    const snap = await db.collection('complementary_gifts').orderBy('createdAt','desc').get();
    gifts = snap.docs.map(d=>({id:d.id,...d.data()}));
  }
  return (
    <div className="space-y-6">
      <h1 className="text-[22px]">Complementary Gifts / Services</h1>
      <form action="/api/admin/complementary" method="post" className="card p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="field"><span className="label">Name</span><input name="name" required className="input"/></label>
          <label className="field"><span className="label">Type</span>
            <select name="type" className="input"><option value="product">Product</option><option value="service">Service</option></select>
          </label>
        </div>
        <label className="field"><span className="label">Item ID / Slug</span><input name="itemId" required className="input"/></label>
        <label className="field"><span className="label">Notes</span><textarea name="notes" className="textarea"/></label>
        <button className="btn btn-primary btn-sm">Add</button>
      </form>
      <div className="card p-4">
        <ul className="space-y-2">
          {gifts.map(g=>(
            <li key={g.id} className="border-b border-line py-2 text-[13px]">{g.name} - {g.type} - {g.itemId}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
