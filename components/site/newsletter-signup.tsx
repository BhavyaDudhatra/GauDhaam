"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Subscribed!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Could not subscribe. Try again.");
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-[12.5px] font-semibold text-brand-dark">Newsletter</p>
      <p className="text-[11.5px] text-body/70">Get updates on new products and offers.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-body/50" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input pl-9 text-[12px]"
            disabled={status === "loading" || status === "success"}
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading" || status === "success" || !email.trim()}
          className="btn btn-primary btn-sm shrink-0"
        >
          {status === "loading" ? "…" : status === "success" ? "✓" : "Join"}
        </button>
      </form>
      {message && (
        <p className={`text-[11px] ${status === "success" ? "text-green-700" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
