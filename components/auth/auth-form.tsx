"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Lock, Mail, Phone, User } from "lucide-react";
import Image from "next/image";
import {
  loginAction,
  registerAction,
  resendSignupOtpAction,
  verifySignupOtpAction,
} from "@/lib/actions/auth";
import type { FormState } from "@/lib/actions/state";

export function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "register";
  next: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    mode === "login" ? loginAction : registerAction,
    null,
  );
  const [otpState, verifyOtpAction, verifyPending] = useActionState<FormState, FormData>(
    verifySignupOtpAction,
    null,
  );
  const [resendState, resendAction, resendPending] = useActionState<FormState, FormData>(
    resendSignupOtpAction,
    null,
  );

  const currentState = otpState || resendState || state;
  const isOtp = mode === "register" && currentState?.step === "otp";
  const email = currentState?.email || "";
  const qrDataUrl = (currentState as any)?.qrDataUrl || "";

  return (
    <form action={isOtp ? verifyOtpAction : formAction} className="mt-6 space-y-3.5">
      <input type="hidden" name="next" value={next} />

      {isOtp && (
        <>
          <input type="hidden" name="email" value={email} />
          <p className="text-[12.5px] text-body">
            {currentState?.success || "Enter the 6-digit code sent to your email."}
          </p>
          {qrDataUrl && (
            <div className="rounded-card border border-line bg-white p-4 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-body/60">
                Scan with Google Authenticator
              </p>
              <div className="mt-3 flex justify-center">
                <Image
                  src={qrDataUrl}
                  alt="TOTP QR code for Google Authenticator"
                  width={180}
                  height={180}
                  className="rounded-xl"
                />
              </div>
              <p className="mt-2 text-[11px] text-body/70">
                Open Google Authenticator → + → Scan a QR code
              </p>
            </div>
          )}
          <label className="field">
            <span className="label">Verification code</span>
            <input
              name="code"
              required
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              className="input text-center tracking-[0.5em]"
              placeholder="123456"
            />
          </label>
          <button type="submit" disabled={verifyPending} className="btn btn-primary btn-block">
            {verifyPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify and create account"
            )}
          </button>
          {resendState?.success && (
            <p className="text-center text-[12px] text-brand">{resendState.success}</p>
          )}
          <div className="text-center">
            <button
              type="submit"
              formAction={resendAction}
              disabled={resendPending}
              className="link-underline text-[12px]"
            >
              {resendPending ? "Sending a new code…" : "Resend code"}
            </button>
          </div>
        </>
      )}

      {!isOtp && mode === "register" && (
        <>
          <label className="field">
            <span className="label">Full name</span>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body/50" />
              <input name="name" required autoComplete="name" className="input pl-10" placeholder="Your name" />
            </div>
          </label>

          <label className="field">
            <span className="label">Mobile number</span>
            <div className="relative">
              <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body/50" />
              <input
                name="phone"
                type="tel"
                required
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                autoComplete="tel-national"
                className="input pl-10"
                placeholder="10-digit mobile"
              />
            </div>
          </label>
        </>
      )}

      {!isOtp && (
        <>
          <label className="field">
            <span className="label">Email</span>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body/50" />
              <input name="email" type="email" required autoComplete="email" className="input pl-10" placeholder="you@example.com" />
            </div>
          </label>

          <label className="field">
            <span className="label">Password</span>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body/50" />
              <input
                name="password"
                type="password"
                required
                minLength={mode === "register" ? 8 : undefined}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="input pl-10"
                placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
              />
            </div>
          </label>

          {mode === "register" && (
            <label className="field">
              <span className="label">Confirm password</span>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body/50" />
                <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className="input pl-10" placeholder="Repeat your password" />
              </div>
            </label>
          )}
        </>
      )}

      {currentState?.error && (
        <p role="alert" className="rounded-xl border border-[#E7CCC3] bg-[#F9EEE9] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#8A3E2C]">
          {currentState.error}
        </p>
      )}

      {!isOtp && (
        <button type="submit" disabled={pending} className="btn btn-primary btn-block">
          {pending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Please wait...
            </>
          ) : mode === "login" ? (
            "Sign in"
          ) : (
            "Create my account"
          )}
        </button>
      )}

      {mode === "login" && (
        <p className="text-center text-[11.5px] text-body/70">
          Forgot your password?{" "}
          <Link href="/contact" className="link-underline">Write to us</Link>{" "}
          and we will help.
        </p>
      )}

      <p className="border-t border-line pt-3.5 text-center text-[12.5px] text-body">
        {mode === "login" ? (
          <>
            New to Gaudham?{" "}
            <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="link-underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="link-underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
