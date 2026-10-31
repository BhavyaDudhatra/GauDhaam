import { getStore } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const store = await getStore();
  const events = await store.events.list();
  const now = new Date();
  const upcoming = events.filter(e => new Date(e.date) >= now).sort((a,b)=> a.date.localeCompare(b.date));
  const past = events.filter(e => new Date(e.date) < now).sort((a,b)=> b.date.localeCompare(a.date));

  return (
    <div className="container-gd py-10 space-y-10">
      <div>
        <span className="eyebrow">Events</span>
        <h1 className="mt-2 text-[30px]">Our events</h1>
      </div>

      <section>
        <h2 className="text-[20px] font-semibold mb-4">Upcoming</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {upcoming.map(e => (
            <div key={e.id} className="card p-4">
              <p className="font-semibold">{e.title}</p>
              <p className="text-[13px] text-body/70">{e.date}</p>
              <p className="mt-2 text-[13px]">{e.description}</p>
              <div className="mt-3 flex gap-2 overflow-auto">
                {e.images.slice(0,3).map(img => (
                  <div key={img} className="relative h-24 w-32 rounded overflow-hidden">
                    <Image src={img} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {upcoming.length===0 && <p className="text-body/70">No upcoming events.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-[20px] font-semibold mb-4">Completed</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {past.map(e => (
            <div key={e.id} className="card p-4 opacity-80">
              <p className="font-semibold">{e.title}</p>
              <p className="text-[13px] text-body/70">{e.date}</p>
              <p className="mt-2 text-[13px]">{e.description}</p>
            </div>
          ))}
          {past.length===0 && <p className="text-body/70">No past events.</p>}
        </div>
      </section>
    </div>
  );
}
