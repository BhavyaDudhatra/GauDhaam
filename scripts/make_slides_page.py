import pathlib
p = pathlib.Path('B:/Study/Projects/VibeCoding/GauDham/Web/app/admin/(dashboard)/slides/page.tsx')
content = """import { redirect } from "next/navigation";
import { getStore } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSlidesPage() {
  await requireAdmin();
  const store = await getStore();
  const slides = await store.slides.list();
  return (
    <div className="space-y-6">
      <h1 className="text-[22px]">Homepage Slides</h1>
      <div className="card p-4">
        <p>Slides management UI placeholder. Add slides via Firestore directly or extend here.</p>
        <ul className="mt-3 space-y-2">
          {slides.map(s=>(
            <li key={s.id} className="border-b border-line py-2 text-[13px]">{s.title} - {s.imageUrl}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
"""
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text(content)
print('created')
