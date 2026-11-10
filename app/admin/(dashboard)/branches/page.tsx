import { getDb } from "@/lib/firebase";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminBranchesPage() {
  await requireAdmin();
  const db = await getDb();
  let branches = [];
  if (db) {
    try {
      const snap = await db.collection('branches').orderBy('createdAt','desc').get();
      branches = snap.docs.map(d=>({id:d.id,...d.data()}));
    } catch {
      const snap = await db.collection('branches').get();
      branches = snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''));
    }
  }
  return (
    <div className="space-y-6">
      <h1 className="text-[22px]">Branches</h1>
      <form method="post" action="/api/admin/branches" className="card p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="field"><span className="label">Name</span><input name="name" required className="input"/></label>
          <label className="field"><span className="label">Phone</span><input name="phone" className="input"/></label>
        </div>
        <label className="field"><span className="label">Address</span><textarea name="address" required className="textarea"/></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="field"><span className="label">Latitude</span><input name="lat" type="number" step="any" required className="input"/></label>
          <label className="field"><span className="label">Longitude</span><input name="lng" type="number" step="any" required className="input"/></label>
        </div>
        <label className="field"><span className="label">Is Main</span>
          <select name="isMain" className="input"><option value="false">No</option><option value="true">Yes</option></select>
        </label>
        <button className="btn btn-primary btn-sm">Add Branch</button>
      </form>
      <div className="card p-4">
        <ul className="space-y-2">
          {branches.map(b=>(
            <li key={b.id} className="border-b border-line py-2 text-[13px] flex justify-between">
              <span>{b.name} {b.isMain?'· Main':''} - {b.address}</span>
              <form method="post" action="/api/admin/branches/delete">
                <input type="hidden" name="id" value={b.id}/>
                <button className="text-[12px] text-red-600">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
