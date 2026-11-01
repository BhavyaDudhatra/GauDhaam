"use client";

import { useActionState } from "react";
import { sendMessageAction } from "@/lib/actions/messages";

export function ReplyForm({ threadId }: { threadId: string }) {
  const [state, formAction, pending] = useActionState(sendMessageAction, null);
  return (
    <form action={formAction} className="card p-5 space-y-3">
      <input type="hidden" name="threadId" value={threadId} />
      <textarea name="body" placeholder="Reply..." rows={4} required className="textarea" />
      <button className="btn btn-primary" disabled={pending}>{pending ? "Sending..." : "Send"}</button>
      {state?.error && <p className="text-red-600 text-sm">{state.error}</p>}
    </form>
  );
}
