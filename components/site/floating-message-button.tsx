"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { usePathname } from "next/navigation";

type Message = { id: string; body: string; senderRole: "user" | "admin"; createdAt: string };

export function FloatingMessageButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!open || !threadId) return;
    fetch(`/api/messages/thread/${threadId}`).then(r => r.json()).then(d => setMessages(d.messages));
  }, [open, threadId]);

  async function ensureThread() {
    if (threadId) return;
    // Try to find existing thread for admin
    const res = await fetch("/api/messages/threads");
    const threads = await res.json();
    const existing = threads.find((t: any) => t.subject === "Support");
    if (existing) {
      setThreadId(existing.id);
      return;
    }
    // Create new thread
    const createRes = await fetch("/api/messages/create-thread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: "Support", body: "" })
    });
    if (createRes.ok) {
      const data = await createRes.json();
      setThreadId(data.id);
    }
  }

  useEffect(() => {
    if (open) ensureThread();
  }, [open]);

  async function send() {
    if (!threadId || !text.trim()) return;
    await fetch("/api/messages/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ threadId, body: text }) });
    setText("");
    fetch(`/api/messages/thread/${threadId}`).then(r => r.json()).then(d => setMessages(d.messages));
  }

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg hover:bg-brand-dark">
        <MessageCircle size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-end p-0 sm:p-4 bg-black/50" onClick={() => setOpen(false)}>
          <div className="w-full sm:w-[360px] h-[70vh] sm:h-[600px] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold">Message Admin</h3>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={18} /></button>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-auto p-3 space-y-2">
                {messages.map(m => (
                  <div key={m.id} className={`max-w-[75%] p-2 rounded-lg text-sm ${m.senderRole==='user'?'bg-brand text-white ml-auto':'bg-gray-100'}`}>
                    {m.body}
                  </div>
                ))}
                {!threadId && <div className="text-center text-gray-500 text-sm">Loading...</div>}
              </div>
              <div className="p-2 border-t flex gap-2">
                <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message..." className="flex-1 input" onKeyDown={e=> e.key==='Enter' && send()} />
                <button onClick={send} className="btn btn-primary btn-sm"><Send size={16}/></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
