"use client";

import { useState } from "react";
import { createEventAction, deleteEventAction } from "@/lib/actions/admin";

type Event = { id: string; title: string; description: string; date: string; images: string[]; category?: string };

export function EventManager({ items }: { items: Event[] }) {
  const [list] = useState(items);
  const today = new Date();
  today.setHours(0,0,0,0);
  const upcoming = list.filter(e => new Date(e.date) >= today).sort((a,b)=> a.date.localeCompare(b.date));
  const past = list.filter(e => new Date(e.date) < today).sort((a,b)=> b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <form action={createEventAction} className="grid md:grid-cols-3 gap-3 items-end">
        <label className="field">
          <span className="label">Title</span>
          <input name="title" required className="input" />
        </label>
        <label className="field">
          <span className="label">Date</span>
          <input name="date" type="date" required className="input" />
        </label>
        <label className="field">
          <span className="label">Category</span>
          <input name="category" className="input" placeholder="e.g. Workshop, Festival" />
        </label>
        <label className="field md:col-span-3">
          <span className="label">Images comma separated</span>
          <input name="images" className="input" placeholder="https://..." />
        </label>
        <label className="field md:col-span-3">
          <span className="label">Description</span>
          <textarea name="description" rows={3} className="textarea" />
        </label>
        <button className="btn btn-primary md:col-span-3">Add Event</button>
      </form>

      <div>
        <h3 className="font-semibold mb-3">Upcoming / Present</h3>
        <div className="space-y-3">
          {upcoming.map(e => (
            <div key={e.id} className="card p-4 flex justify-between items-start gap-4">
              <div>
                <p className="font-semibold">{e.title} — {e.date} {e.category && `· ${e.category}`}</p>
                <p className="text-[13px] text-body/70">{e.description}</p>
                {e.images && e.images.length>0 && <div className="flex gap-2 mt-2">{e.images.slice(0,3).map(img=><img key={img} src={img} className="h-12 w-16 object-cover rounded" />)}</div>}
              </div>
              <form action={deleteEventAction}><input type="hidden" name="id" value={e.id} /><button className="btn btn-outline btn-sm">Delete</button></form>
            </div>
          ))}
          {upcoming.length===0 && <p className="text-body/70">No upcoming events.</p>}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Past</h3>
        <div className="space-y-3">
          {past.map(e => (
            <div key={e.id} className="card p-4 opacity-70 flex justify-between items-start gap-4">
              <div>
                <p className="font-semibold">{e.title} — {e.date} {e.category && `· ${e.category}`}</p>
                <p className="text-[13px] text-body/70">{e.description}</p>
              </div>
              <form action={deleteEventAction}><input type="hidden" name="id" value={e.id} /><button className="btn btn-outline btn-sm">Delete</button></form>
            </div>
          ))}
          {past.length===0 && <p className="text-body/70">No past events.</p>}
        </div>
      </div>
    </div>
  );
}
