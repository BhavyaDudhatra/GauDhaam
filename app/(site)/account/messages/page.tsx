import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { formatDateTime } from "@/lib/money";
import { createThreadAction } from "@/lib/actions/messages";
import { useActionState } from "react";

function NewThreadForm() {
  const [state, formAction, pending] = useActionState(createThreadAction, null);
  return (
    <form action={formAction} className="card p-5 space-y-3">
      <h2 className="text-[16px] font-semibold">New message to admin</h2>
      <input name="subject" placeholder="Subject" required className="input" />
      <textarea name="body" placeholder="Your message" rows={4} required className="textarea" />
      <button className="btn btn-primary" disabled={pending}>{pending ? "Sending..." : "Send"}</button>
      {state?.error && <p className="text-red-600 text-sm">{state.error}</p>}
      {state?.success && <p className="text-green-600 text-sm">Message sent</p>}
    </form>
  );
}

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
