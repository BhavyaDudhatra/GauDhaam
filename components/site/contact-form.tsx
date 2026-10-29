"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { sendMessageAction } from "@/lib/actions/contact";
import type { FormState } from "@/lib/actions/state";

export function ContactForm({ defaultSubject }: { defaultSubject: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    sendMessageAction,
    null,
  );

  if (state?.success) {
    return (
      <div className="flex flex-col items-center px-2 py-10 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-light text-brand">
          <CheckCircle2 size={26} strokeWidth={1.8} />
        </span>
        <h2 className="mt-4 text-[18px]">Message received</h2>
        <p className="mt-2 max-w-sm text-[13px] leading-relaxed">{state.success}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-primary btn-sm">
            Browse the pantry
          </Link>
          <a href="/contact" className="btn btn-outline btn-sm">
            Send another message
          </a>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3.5">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className="field">
          <span className="label">Your name</span>
          <input name="name" required autoComplete="name" className="input" />
        </label>
        <label className="field">
          <span className="label">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input"
          />
        </label>
        <label className="field">
          <span className="label">Mobile (optional)</span>
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            pattern="[6-9][0-9]{9}"
            maxLength={10}
            autoComplete="tel-national"
            className="input"
          />
        </label>
        <label className="field">
          <span className="label">Subject</span>
          <input
            name="subject"
            defaultValue={defaultSubject}
            className="input"
            placeholder="How can we help?"
          />
        </label>
      </div>

      <label className="field">
        <span className="label">Message</span>
        <textarea
          name="message"
          required
          minLength={10}
          rows={5}
          className="textarea"
          placeholder="Tell us a little about what you need…"
        />
      </label>

      {state?.error && (
        <p
          role="alert"
          className="rounded-xl border border-[#E7CCC3] bg-[#F9EEE9] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#8A3E2C]"
        >
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send size={15} />
            Send message
          </>
        )}
      </button>

      <p className="text-[11px] leading-relaxed text-body/65">
        We use your details only to reply to this message. No newsletters unless
        you ask.
      </p>
    </form>
  );
}
