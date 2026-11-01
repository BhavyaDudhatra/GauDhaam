"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export function FloatingMessageButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <Link
      href="/account/messages"
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg hover:bg-brand-dark transition-colors"
      aria-label="Message admin"
    >
      <MessageCircle size={22} />
    </Link>
  );
}
