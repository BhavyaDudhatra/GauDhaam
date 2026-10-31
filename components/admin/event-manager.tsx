"use client";

import { useState } from "react";
import { ImageManager } from "@/components/admin/image-manager";

type Event = { id: string; title: string; description: string; date: string; images: string[] };

export function EventManager({ items }: { items: Event[] }) {
  const [list] = useState(items);
  return (
    <div className="space-y-4">
      <form action="/api/admin/events/create" method="POST" className="grid md:grid-cols-2 gap-3">
        <input name="title" placeholder="Title" required className="input" />
        <input name="date" type="date" required className="input" />
        <textarea name="description" placeholder="Description" rows={3} className="textarea md:col-span-2" />
        <input name="images" placeholder="Comma separated image URLs" className="input md:col-span-2" />
        <button className="btn btn-primary md:col-span-2">Add Event</button>
      </form>
      <div className="space-y-3">
        {list.map(e => (
          <div key={e.id} className="card p-4">
            <p className="font-semibold">{e.title} — {e.date}</p>
            <p className="text-[13px] text-body/70">{e.description}</p>
            <div className="flex gap-2 mt-2 overflow-auto">
              {e.images.map(img => <img key={img} src={img} className="h-16 w-24 object-cover rounded" />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
