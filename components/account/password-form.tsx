"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { changePasswordAction } from "@/lib/actions/auth";
import type { FormState } from "@/lib/actions/state";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    changePasswordAction,
    null,
  );

  return (
    <form action={formAction} className="mt-4 space-y-3.5">
      <label className="field">
        <span className="label">Current password</span>
        <input
          name="current"
          type="password"
          required
          autoComplete="current-password"
          className="input"
        />
      </label>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className="field">
          <span className="label">New password</span>
          <input
            name="next"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input"
            placeholder="At least 8 characters"
          />
        </label>
        <label className="field">
          <span className="label">Confirm new password</span>
          <input
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input"
          />
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

      <button type="submit" disabled={pending} className="btn btn-outline">
        {pending ? <Loader2 size={16} className="animate-spin" /> : null}
        Change password
      </button>
    </form>
  );
}
