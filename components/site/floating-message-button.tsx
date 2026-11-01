"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { usePathname } from "next/navigation";

type Thread = { id: string; subject: string; updatedAt: string; userId: string };
type Message = { id: string; body: string; senderRole: "user" | "admin"; createdAt: string };

export function FloatingMessageButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch("/api/messages/threads").then(r => r.json()).then(setThreads);
  }, [open]);

  useEffect(() => {
    if (!activeId) return;
    fetch(`/api/messages/thread/${activeId}`).then(r => r.json()).then(d => {
      setMessages(d.messages);
    });
  }, [activeId]);

  async function send() {
    if (!activeId || !text.trim()) return;
    await fetch("/api/messages/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ threadId: activeId, body: text }) });
    setText("");
    fetch(`/api/messages/thread/${activeId}`).then(r => r.json()).then(d => setMessages(d.messages));
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
              <h3 className="font-semibold">Messages</h3>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={18} /></button>
            </div>
            <div className="flex flex-1 min-h-0">
              <div className="w-1/3 border-r hidden sm:block overflow-auto">
                {threads.map(t => (
                  <button key={t.id} onClick={() => setActiveId(t.id)} className={`w-full text-left p-3 border-b hover:bg-gray-50 ${activeId===t.id?'bg-gray-100':''}`}>
                    <div className="text-sm font-medium truncate">{t.subject}</div>
                    <div className="text-[11px] text-gray-500">{new Date(t.updatedAt).toLocaleDateString()}</div>
                  </button>
                ))}
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-auto p-3 space-y-2">
                  {messages.map(m => (
                    <div key={m.id} className={`max-w-[75%] p-2 rounded-lg text-sm ${m.senderRole==='user'?'bg-brand text-white ml-auto':'bg-gray-100'}`}>
                      {m.body}
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t flex gap-2">
                  <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message..." className="flex-1 input" onKeyDown={e=> e.key==='Enter' && send()} />
                  <button onClick={send} className="btn btn-primary btn-sm"><Send size={16}/></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
