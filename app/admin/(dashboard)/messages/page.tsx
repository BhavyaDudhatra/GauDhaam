import type { Metadata } from "next";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { deleteMessageAction, markMessageReadAction } from "@/lib/actions/admin";
import { formatDateTime } from "@/lib/money";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Messages · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const store = await getStore();
  const messages = await store.messages.list();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px]">Messages</h1>
        <p className="mt-1 text-[13px] text-body">
          {messages.length} enquiries from the contact form
        </p>
      </div>

      <div className="space-y-2">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`card p-4 ${
              message.read ? "opacity-80" : "border-brand/40"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  {message.read ? <MailOpen size={16} /> : <Mail size={16} className="text-brand" />}
                  <p className="font-semibold text-brand-dark">{message.name}</p>
                  <span className="text-[11.5px] text-body">{message.email}</span>
                  {message.phone && (
                    <span className="text-[11.5px] text-body">{message.phone}</span>
                  )}
                </div>
                <p className="mt-1 text-[12px] text-body/70">
                  {formatDateTime(message.createdAt)} · {message.subject}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed">
                  {message.message}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!message.read && (
                  <form action={markMessageReadAction}>
                    <input type="hidden" name="id" value={message.id} />
                    <button className="btn btn-outline btn-sm">Mark read</button>
                  </form>
                )}
                <form action={deleteMessageAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <button className="btn btn-outline btn-sm">
                    <Trash2 size={14} />
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </article>
        ))}
        {messages.length === 0 && (
          <div className="card px-5 py-10 text-center text-body">
            No messages yet.
          </div>
        )}
      </div>
    </div>
  );
}
