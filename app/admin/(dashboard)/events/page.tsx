import { requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { EventManager } from "@/components/admin/event-manager";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  await requireAdmin();
  const store = await getStore();
  const events = await store.events.list();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px]">Events</h1>
        <p className="mt-1 text-[13px] text-body">Manage completed and upcoming events.</p>
      </div>
      <div className="card p-5">
        <EventManager items={events} />
      </div>
    </div>
  );
}
