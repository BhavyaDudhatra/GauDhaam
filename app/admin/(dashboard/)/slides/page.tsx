import { redirect } from "next/navigation";
import { getStore } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import { SlideForm } from "@/components/admin/slide-form";

export const dynamic = "force-dynamic";

export default async function AdminSlidesPage() {
  await requireAdmin();
  const store = await getStore();
  const slides = await store.slides.list();
  return (
    <div className="space-y-6">
      <h1 className="text-[22px]">Homepage Slides</h1>
      <SlideForm />
      <div className="card p-4">
        <table className="w-full text-[13px]">
          <thead><tr><th className="text-left">Title</th><th>Image</th><th>Link</th><th></th></tr></thead>
          <tbody>
            {slides.map(s=>(
              <tr key={s.id} className="border-t border-line">
                <td className="py-2">{s.title}</td>
                <td><img src={s.imageUrl} className="h-10 w-auto rounded"/></td>
                <td>{s.link}</td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
