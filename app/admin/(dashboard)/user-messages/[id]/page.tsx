import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getStore } from "@/lib/store";
import { formatDateTime } from "@/lib/money";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminThreadPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const store = await getStore();
  const threadData = await store.userMessages.getThread(params.id);
  if (!threadData) notFound();
  const { thread, messages } = threadData;

  async function sendReply(formData: FormData) {
    "use server";
    const body = formData.get("body") as string;
    if (!body) return;
    const adminStore = await getStore();
    // For simplicity, senderId uses placeholder admin id
    await adminStore.userMessages.sendMessage({ threadId: thread.id, senderId: "admin", senderRole: "admin", body });
    // revalidate
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px]">{thread.subject}</h1>
        <Link href="/admin/user-messages" className="btn btn-outline btn-sm">Back</Link>
      </div>

      <div className="card p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.senderRole === "admin" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${m.senderRole === "admin" ? "bg-brand text-white" : "bg-cream"}`}>
              <p className="text-sm">{m.body}</p>
              <p className="text-[10px] opacity-70 mt-1">{formatDateTime(m.createdAt)} · {m.senderRole}</p>
            </div>
          </div>
        ))}
      </div>

      <form action={async (formData: FormData) => {
        "use server";
        const body = formData.get("body") as string;
        if (!body) return;
        const store = await getStore();
        await store.userMessages.sendMessage({ threadId: thread.id, senderId: "admin", senderRole: "admin", body });
      }} className="card p-5 space-y-3">
        <textarea name="body" placeholder="Reply to user..." rows={4} required className="textarea" />
        <button className="btn btn-primary">Send Reply</button>
      </form>
    </div>
  );
}
