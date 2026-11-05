import pathlib
p = pathlib.Path('B:/Study/Projects/VibeCoding/GauDham/Web/app/admin/(dashboard)/slides/page.tsx')
content = """import { getDb } from "@/lib/firebase";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSlidesPage() {
  await requireAdmin();
  const db = await getDb();
  let slides = [];
  if (db) {
    const snap = await db.collection('slides').orderBy('order','asc').get();
    slides = snap.docs.map(d=>({id:d.id,...d.data()}));
  }
  return (
    <div className="space-y-6">
      <h1 className="text-[22px]">Homepage Slides</h1>
      <form action="/api/admin/slides" method="post" className="card p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="field"><span className="label">Title</span><input name="title" required className="input"/></label>
          <label className="field"><span className="label">Subtitle</span><input name="subtitle" className="input"/></label>
        </div>
        <label className="field"><span className="label">Image URL</span><input name="imageUrl" required className="input"/></label>
        <label className="field"><span className="label">Link</span><input name="link" className="input"/></label>
        <label className="field"><span className="label">Order</span><input name="order" type="number" defaultValue="0" className="input"/></label>
        <button className="btn btn-primary btn-sm">Add slide</button>
      </form>
      <div className="card p-4">
        <ul className="space-y-2">
          {slides.map(s=>(
            <li key={s.id} className="border-b border-line py-2 text-[13px] flex items-center gap-3">
              <img src={s.imageUrl} className="h-12 w-20 object-cover rounded"/>
              <div><div className="font-semibold">{s.title}</div><div className="text-body/70">{s.subtitle}</div></div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
"""
p.write_text(content)
print('admin slides updated')
