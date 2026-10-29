"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { updateProfileAction } from "@/lib/actions/auth";
import type { FormState } from "@/lib/actions/state";

export function ProfileForm({
  user,
}: {
  user: { name: string; email: string; phone: string };
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateProfileAction,
    null,
  );

  return (
    <form action={formAction} className="mt-4 space-y-3.5">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className="field">
          <span className="label">Full name</span>
          <input name="name" defaultValue={user.name} required className="input" />
        </label>
        <label className="field">
          <span className="label">Mobile number</span>
          <input
            name="phone"
            defaultValue={user.phone}
            required
            type="tel"
            inputMode="numeric"
            pattern="[6-9][0-9]{9}"
            maxLength={10}
            className="input"
          />
        </label>
        <label className="field sm:col-span-2">
          <span className="label">Email</span>
          <input
            value={user.email}
            readOnly
            disabled
            className="input bg-cream/70 text-body/70"
          />
          <span className="mt-1 block text-[11px] text-body/60">
            To change your email, write to us — it keeps your order history safe.
          </span>
        </label>
      </div>

      {state?.error && (
        <p role="alert" className="text-[12.5px] text-[#8A3E2C]">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="flex items-center gap-1.5 text-[12.5px] text-brand">
          <CheckCircle2 size={15} />
          {state.success}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? <Loader2 size={16} className="animate-spin" /> : null}
        Save changes
      </button>
    </form>
  );
}
