"use client";

import { useActionState } from "react";
import { createThreadAction } from "@/lib/actions/messages";

export function NewThreadForm() {
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
