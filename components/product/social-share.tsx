"use client";

import { Share2, MessageCircle, Facebook, Twitter, Link2 } from "lucide-react";
import { useState } from "react";

export function SocialShare({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
      color: "text-green-600",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "text-blue-600",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: "text-sky-500",
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11.5px] font-semibold text-body/70">Share:</span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`grid h-8 w-8 place-items-center rounded-full border border-line bg-white transition-colors hover:bg-light ${link.color}`}
          aria-label={`Share on ${link.name}`}
        >
          <link.icon size={14} />
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-body/70 transition-colors hover:bg-light"
        aria-label="Copy link"
      >
        {copied ? <span className="text-[10px] font-bold text-brand">✓</span> : <Link2 size={14} />}
      </button>
    </div>
  );
}
