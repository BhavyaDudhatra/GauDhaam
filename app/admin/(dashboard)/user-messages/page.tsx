import Link from "next/link";
import { getStore } from "@/lib/store";
import { formatDateTime } from "@/lib/money";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUserMessagesPage() {
  await requireAdmin();
  const store = await getStore();
  const threads = await store.userMessages.listThreads();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px]">User Messages</h1>
        <p className="mt-1 text-[13px] text-body">{threads.length} threads</p>
      </div>
      <div className="space-y-2">
        {threads.map(t => (
          <Link key={t.id} href={`/admin/messages/${t.id}`} className="block card p-4 hover:bg-cream/50">
            <p className="font-semibold">{t.subject}</p>
            <p className="text-[12px] text-body/70">User: {t.userId} · Updated {formatDateTime(t.updatedAt)}</p>
          </Link>
        ))}
        {threads.length === 0 && <div className="card p-10 text-center text-body">No threads</div>}
      </div>
    </div>
  );
}
