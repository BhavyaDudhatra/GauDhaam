import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { formatDateTime } from "@/lib/money";
import { sendMessageAction } from "@/lib/actions/messages";
import Link from "next/link";

export default async function MessageThreadPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/messages");

  const store = await getStore();
  const threadData = await store.userMessages.getThread(params.id);
  if (!threadData) notFound();
  const { thread, messages } = threadData;

  if (thread.userId !== session.id && session.role !== "admin") notFound();

  return (
    <div className="container-gd py-10 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold">{thread.subject}</h1>
        <Link href="/account/messages" className="btn btn-outline btn-sm">Back</Link>
      </div>

      <div className="card p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.senderRole === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${m.senderRole === "user" ? "bg-brand text-white" : "bg-cream"}`}>
              <p className="text-sm">{m.body}</p>
              <p className="text-[10px] opacity-70 mt-1">{formatDateTime(m.createdAt)} · {m.senderRole}</p>
            </div>
          </div>
        ))}
      </div>

      <form action={sendMessageAction} className="card p-5 space-y-3">
        <input type="hidden" name="threadId" value={thread.id} />
        <textarea name="body" placeholder="Reply..." rows={4} required className="textarea" />
        <button className="btn btn-primary">Send</button>
      </form>
    </div>
  );
}
