"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { forgotPasswordRequestAction, verifyForgotPasswordAction } from "@/lib/actions/auth";
import type { FormState } from "@/lib/actions/state";

export function AuthForgotForm() {
  const [reqState, reqAction, reqPending] = useActionState<FormState, FormData>(forgotPasswordRequestAction, null);
  const [verifyState, verifyAction, verifyPending] = useActionState<FormState, FormData>(verifyForgotPasswordAction, null);

  const isOtp = reqState?.step === "otp" || verifyState?.step === "otp";
  const email = reqState?.email || verifyState?.email || "";
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const active = reqState?.expiresAt ? reqState : verifyState;
    if (!active?.expiresAt) {
      setTimeLeft(null);
      return;
    }
    const end = active.expiresAt;
    const update = () => setTimeLeft(Math.max(0, Math.floor((end - Date.now())/1000)));
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [reqState?.email, reqState?.expiresAt, verifyState?.email]);

  const error = reqState?.error || verifyState?.error;
  const success = reqState?.success || verifyState?.success;

  return (
    <div className="mt-6 space-y-3.5">
      {!isOtp ? (
        <form action={reqAction} className="space-y-3.5">
          <label className="field">
            <span className="label">Email</span>
            <input name="email" type="email" required className="input" placeholder="you@example.com" />
          </label>
          <button disabled={reqPending} className="btn btn-primary btn-block">
            {reqPending ? <><Loader2 size={16} className="animate-spin"/> Sending...</> : "Send reset code"}
          </button>
        </form>
      ) : (
        <form action={verifyAction} className="space-y-3.5">
          <input type="hidden" name="email" value={email} />
          <p className="text-[12.5px] text-body">{success || "Enter the code and new password."}</p>
          {typeof timeLeft === "number" && (
            <p className="text-center text-[11.5px] text-body/70">
              {timeLeft > 0 ? `Code expires in ${Math.floor(timeLeft/60)}:${String(timeLeft%60).padStart(2,"0")}` : "Code has expired"}
            </p>
          )}
          <label className="field">
            <span className="label">Verification code</span>
            <input name="code" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} className="input text-center tracking-[0.5em]" placeholder="123456" />
          </label>
          <label className="field">
            <span className="label">New password</span>
            <input name="newPassword" type="password" required minLength={8} autoComplete="new-password" className="input" placeholder="At least 8 characters" />
          </label>
          <label className="field">
            <span className="label">Confirm password</span>
            <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className="input" placeholder="Repeat password" />
          </label>
          <button disabled={verifyPending} className="btn btn-primary btn-block">
            {verifyPending ? <><Loader2 size={16} className="animate-spin"/> Updating...</> : "Reset password"}
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className="rounded-xl border border-[#E7CCC3] bg-[#F9EEE9] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#8A3E2C]">{error}</p>
      )}
      {success && (
        <p className="text-center text-[12px] text-brand">{success}</p>
      )}
    </div>
  );
}
