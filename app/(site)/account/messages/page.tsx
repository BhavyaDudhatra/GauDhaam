import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { formatDateTime } from "@/lib/money";
import { NewThreadForm } from "@/components/account/new-thread-form";

export default async function UserMessagesPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/messages");
  const store = await getStore();
  const threads = await store.userMessages.listThreads(session.id);

  return (
    <div className="container-gd py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold">Messages</h1>
        <Link href="/account" className="btn btn-outline btn-sm">Back to account</Link>
      </div>

      <NewThreadForm />

      <div className="space-y-3">
        {threads.map(t => (
          <Link key={t.id} href={`/account/messages/${t.id}`} className="block card p-4 hover:bg-cream/50">
            <p className="font-semibold">{t.subject}</p>
            <p className="text-[12px] text-body/70">{formatDateTime(t.updatedAt)}</p>
          </Link>
        ))}
        {threads.length === 0 && <p className="text-body/70">No messages yet.</p>}
      </div>
    </div>
  );
}
