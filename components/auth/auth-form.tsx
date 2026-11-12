"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Lock, Mail, Phone, User } from "lucide-react";
import {
  loginAction,
  registerAction,
  resendSignupOtpAction,
  verifySignupOtpAction,
  requestLoginOtpAction,
  verifyLoginOtpAction,
} from "@/lib/actions/auth";
import type { FormState } from "@/lib/actions/state";

export function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "register";
  next: string;
}) {
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");

  // Register flow
  const [regState, regAction, regPending] = useActionState<FormState, FormData>(
    registerAction,
    null,
  );
  const [signupOtpState, signupOtpAction, signupOtpPending] = useActionState<FormState, FormData>(
    verifySignupOtpAction,
    null,
  );
  const [signupResendState, signupResendAction, signupResendPending] = useActionState<FormState, FormData>(
    resendSignupOtpAction,
    null,
  );

  // Login password flow
  const [pwdState, pwdAction, pwdPending] = useActionState<FormState, FormData>(
    loginAction,
    null,
  );

  // Login OTP flow
  const [otpReqState, otpReqAction, otpReqPending] = useActionState<FormState, FormData>(
    requestLoginOtpAction,
    null,
  );
  const [otpVerifyState, otpVerifyAction, otpVerifyPending] = useActionState<FormState, FormData>(
    verifyLoginOtpAction,
    null,
  );

  const isRegister = mode === "register";
  const isLogin = mode === "login";

  // Combine states for display
  const regCurrent = signupOtpState || signupResendState || regState;
  const isSignupOtp = isRegister && regCurrent?.step === "otp";
  const regEmail = regCurrent?.email || "";
  const regQr = (regCurrent as any)?.qrDataUrl || "";

  const loginOtpReq = otpReqState;
  const loginOtpVerify = otpVerifyState;
  const isLoginOtpStep = isLogin && loginMethod === "otp" && (loginOtpReq?.step === "otp" || loginOtpVerify?.step === "otp");
  const loginEmail = (loginOtpReq?.email || loginOtpVerify?.email || "") as string;

  // Countdown for any OTP step
  const activeState: FormState = isSignupOtp ? regCurrent : isLoginOtpStep ? (loginOtpReq?.expiresAt ? loginOtpReq : loginOtpVerify) : null;
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!activeState?.expiresAt) {
      setTimeLeft(null);
      return;
    }
    const end = activeState.expiresAt;
    const update = () => {
      const remaining = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [activeState?.email, activeState?.expiresAt]);

  const error = regCurrent?.error || pwdState?.error || otpReqState?.error || otpVerifyState?.error;
  const success = regCurrent?.success || otpReqState?.success;

  return (
    <div className="mt-6 space-y-3.5">
      {isLogin && !isLoginOtpStep && (
        <div className="flex gap-2 rounded-xl border border-line p-1">
          <button
            type="button"
            onClick={() => setLoginMethod("password")}
            className={`flex-1 rounded-lg px-3 py-2 text-[13px] ${loginMethod === "password" ? "bg-brand text-white" : "text-body/70"}`}
          >
            By Password
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod("otp")}
            className={`flex-1 rounded-lg px-3 py-2 text-[13px] ${loginMethod === "otp" ? "bg-brand text-white" : "text-body/70"}`}
          >
            By OTP
          </button>
        </div>
      )}

      {/* REGISTER */}
      {isRegister && (
        <form action={isSignupOtp ? signupOtpAction : regAction} className="space-y-3.5">
          <input type="hidden" name="next" value={next} />
          {isSignupOtp && (
            <>
              <input type="hidden" name="email" value={regEmail} />
              <p className="text-[12.5px] text-body">{regCurrent?.success || "Enter the 6-digit code sent to your email."}</p>
              {typeof timeLeft === "number" && (
                <p className="text-center text-[11.5px] text-body/70">
                  {timeLeft > 0 ? `Code expires in ${Math.floor(timeLeft/60)}:${String(timeLeft%60).padStart(2,"0")}` : "Code has expired"}
                </p>
              )}
              {regQr && (
                <div className="rounded-card border border-line bg-white p-4 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-body/60">Scan with Google Authenticator</p>
                  <div className="mt-3 flex justify-center">
                    <Image src={regQr} alt="TOTP QR" width={180} height={180} className="rounded-xl" />
                  </div>
                </div>
              )}
              <label className="field">
                <span className="label">Verification code</span>
                <input name="code" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} className="input text-center tracking-[0.5em]" placeholder="123456" />
              </label>
              <button type="submit" disabled={signupOtpPending} className="btn btn-primary btn-block">
                {signupOtpPending ? <><Loader2 size={16} className="animate-spin"/> Verifying...</> : "Verify and create account"}
              </button>
              <div className="text-center">
                <button type="submit" formAction={signupResendAction} disabled={signupResendPending} className="link-underline text-[12px]">
                  {signupResendPending ? "Sending..." : timeLeft===0 ? "Resend code (expired)" : "Resend code"}
                </button>
              </div>
            </>
          )}
          {!isSignupOtp && (
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
                  <input name="phone" type="tel" required inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} className="input pl-10" placeholder="10-digit mobile" />
                </div>
              </label>
              <label className="field">
                <span className="label">Email</span>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body/50" />
                  <input name="email" type="email" required className="input pl-10" placeholder="you@example.com" />
                </div>
              </label>
              <label className="field">
                <span className="label">Password</span>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body/50" />
                  <input name="password" type="password" required minLength={8} className="input pl-10" placeholder="At least 8 characters" />
                </div>
              </label>
              <label className="field">
                <span className="label">Confirm password</span>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body/50" />
                  <input name="confirm" type="password" required minLength={8} className="input pl-10" placeholder="Repeat password" />
                </div>
              </label>
              <button type="submit" disabled={regPending} className="btn btn-primary btn-block">
                {regPending ? <><Loader2 size={16} className="animate-spin"/> Please wait...</> : "Create my account"}
              </button>
            </>
          )}
        </form>
      )}

      {/* LOGIN PASSWORD */}
      {isLogin && loginMethod === "password" && !isLoginOtpStep && (
        <form action={pwdAction} className="space-y-3.5">
          <input type="hidden" name="next" value={next} />
          <label className="field">
            <span className="label">Email</span>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body/50" />
              <input name="email" type="email" required className="input pl-10" placeholder="you@example.com" />
            </div>
          </label>
          <label className="field">
            <span className="label">Password</span>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body/50" />
              <input name="password" type="password" required className="input pl-10" placeholder="Your password" />
            </div>
          </label>
          <button type="submit" disabled={pwdPending} className="btn btn-primary btn-block">
            {pwdPending ? <><Loader2 size={16} className="animate-spin"/> Please wait...</> : "Sign in"}
          </button>
        </form>
      )}

      {/* LOGIN OTP REQUEST */}
      {isLogin && loginMethod === "otp" && !isLoginOtpStep && (
        <form action={otpReqAction} className="space-y-3.5">
          <input type="hidden" name="next" value={next} />
          <label className="field">
            <span className="label">Email</span>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body/50" />
              <input name="email" type="email" required className="input pl-10" placeholder="you@example.com" />
            </div>
          </label>
          <button type="submit" disabled={otpReqPending} className="btn btn-primary btn-block">
            {otpReqPending ? <><Loader2 size={16} className="animate-spin"/> Sending...</> : "Send OTP"}
          </button>
        </form>
      )}

      {/* LOGIN OTP VERIFY */}
      {isLogin && isLoginOtpStep && (
        <form action={otpVerifyAction} className="space-y-3.5">
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="email" value={loginEmail} />
          <p className="text-[12.5px] text-body">{success || "Enter the 6-digit code sent to your email."}</p>
          {typeof timeLeft === "number" && (
            <p className="text-center text-[11.5px] text-body/70">
              {timeLeft > 0 ? `Code expires in ${Math.floor(timeLeft/60)}:${String(timeLeft%60).padStart(2,"0")}` : "Code has expired"}
            </p>
          )}
          <label className="field">
            <span className="label">Verification code</span>
            <input name="code" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} className="input text-center tracking-[0.5em]" placeholder="123456" />
          </label>
          <button type="submit" disabled={otpVerifyPending} className="btn btn-primary btn-block">
            {otpVerifyPending ? <><Loader2 size={16} className="animate-spin"/> Verifying...</> : "Verify and sign in"}
          </button>
          <div className="text-center">
            <button type="button" onClick={() => { setLoginMethod("otp"); }} className="link-underline text-[12px]">Resend OTP</button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-[#E7CCC3] bg-[#F9EEE9] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#8A3E2C]">
          {error}
        </p>
      )}

      {isLogin && (
        <p className="text-center text-[11.5px] text-body/70">
          Forgot your password?{" "}
          <Link href="/forgot-password" className="link-underline">Reset password</Link>
        </p>
      )}

      <p className="border-t border-line pt-3.5 text-center text-[12.5px] text-body">
        {isLogin ? (
          <>New to GauDhaam? <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="link-underline">Create an account</Link></>
        ) : (
          <>Already have an account? <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="link-underline">Sign in</Link></>
        )}
      </p>
    </div>
  );
}
