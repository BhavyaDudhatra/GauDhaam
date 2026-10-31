import { getStore } from "@/lib/store";
import Image from "next/image";

export async function GalleryGrid() {
  const store = await getStore();
  const items = await store.gallery.list();
  if (!items.length) return <div className="text-body/70">Gallery coming soon.</div>;
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(item => (
        <div key={item.id} className="overflow-hidden rounded-banner border border-line">
          <div className="relative aspect-[4/3]">
            <Image src={item.image} alt={item.title} fill className="object-cover" />
          </div>
          <div className="p-3 text-[13px] font-medium">{item.title}</div>
        </div>
      ))}
    </div>
  );
}
