import { requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { GalleryManager } from "@/components/admin/gallery-manager";
import { ImagePlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  await requireAdmin();
  const store = await getStore();
  const items = await store.gallery.list();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px]">Gallery</h1>
        <p className="mt-1 text-[13px] text-body">Manage photographs shown on the About page.</p>
      </div>
      <div className="card p-5">
        <GalleryManager items={items} />
      </div>
    </div>
  );
}
