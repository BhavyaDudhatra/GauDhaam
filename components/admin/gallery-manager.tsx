"use client";

import { useActionState, useState } from "react";
import { createGalleryItemAction, updateGalleryItemAction, deleteGalleryItemAction } from "@/lib/actions/admin";
import { ImageManager } from "@/components/admin/image-manager";
import { Trash2 } from "lucide-react";

type GalleryItem = { id: string; title: string; image: string; createdAt: string };

export function GalleryManager({ items }: { items: GalleryItem[] }) {
  const [list, setList] = useState(items);

  return (
    <div className="space-y-4">
      <form action={createGalleryItemAction} className="grid md:grid-cols-3 gap-3 items-end">
        <label className="field">
          <span className="label">Title</span>
          <input name="title" required className="input" />
        </label>
        <label className="field">
          <span className="label">Image URL</span>
          <ImageManager onChange={(url)=>{ (document.querySelector('input[name="image"]') as HTMLInputElement).value = url; }} />
          <input name="image" required className="input mt-2" placeholder="https://" />
        </label>
        <button className="btn btn-primary">Add</button>
      </form>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(item => (
          <div key={item.id} className="card p-3 space-y-2">
            <img src={item.image} alt={item.title} className="aspect-video object-cover rounded" />
            <p className="font-semibold">{item.title}</p>
            <form action={deleteGalleryItemAction} className="flex gap-2">
              <input type="hidden" name="id" value={item.id} />
              <button className="btn btn-outline btn-sm"><Trash2 size={14}/> Delete</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
