import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/money";
import { getStore } from "@/lib/store";
import { deleteMessageAction, markMessageReadAction } from "@/lib/actions/admin";

export const metadata: Metadata = { title: "Contact Messages · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const store = await getStore();
  const messages = await store.messages.list();
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px]">Contact Messages</h1>
        <p className="mt-1 text-[13px] text-body">
          {messages.length} messages · {unread} unread
        </p>
      </div>

      <div className="space-y-3">
        {messages.map((msg) => (
          <article key={msg.id} className={`card p-5 ${!msg.read ? "border-brand/30 bg-light/30" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-brand-dark">{msg.name}</p>
                  {!msg.read && <span className="badge badge-green">New</span>}
                </div>
                <p className="mt-0.5 text-[11.5px] text-body/70">
                  {formatDateTime(msg.createdAt)} · {msg.email}
                  {msg.phone && ` · ${msg.phone}`}
                </p>
                {msg.subject && (
                  <p className="mt-2 text-[13px] font-semibold text-brand-dark">
                    {msg.subject}
                  </p>
                )}
                <p className="mt-1 text-[13px] leading-relaxed text-body">
                  {msg.message}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!msg.read && (
                  <form action={markMessageReadAction}>
                    <input type="hidden" name="id" value={msg.id} />
                    <button className="btn btn-outline btn-sm">
                      <Mail size={14} />
                      Mark read
                    </button>
                  </form>
                )}
                <form action={deleteMessageAction}>
                  <input type="hidden" name="id" value={msg.id} />
                  <button className="btn btn-outline btn-sm text-red-600">
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
