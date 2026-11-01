"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NewThreadForm } from "@/components/account/new-thread-form";

export function FloatingMessageButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg hover:bg-brand-dark transition-colors"
        aria-label="Message admin"
      >
        <MessageCircle size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setOpen(false)}>
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Message Admin</h3>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={18} /></button>
            </div>
            <div className="p-4 overflow-auto">
              <NewThreadForm />
              <div className="mt-4 text-center">
                <Link href="/account/messages" className="text-brand text-sm" onClick={() => setOpen(false)}>View all messages</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
