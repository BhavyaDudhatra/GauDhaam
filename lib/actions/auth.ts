"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearSession,
  getSession,
  requireUser,
  setSession,
} from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getStore } from "@/lib/store";
import { clean, isEmail, isPhone, normalisePhone } from "@/lib/validate";
import type { FormState } from "./state";

function safeNext(value: FormDataEntryValue | null) {
  const next = clean(value, 300);
  if (next.startsWith("/") && !next.startsWith("//")) return next;
  return "";
}

export async function loginAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = clean(formData.get("email"), 200).toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password to continue." };
  }

  const store = await getStore();
  const user = await store.users.findByEmail(email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Those details do not match our records." };
  }

  await setSession(user);
  revalidatePath("/", "layout");

  const next = safeNext(formData.get("next"));
  redirect(next || (user.role === "admin" ? "/admin" : "/account"));
}

/**
 * Step 1 of signup: validate details and email a six-digit code.
 * The account is only created after the code is verified.
 */
export async function registerAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  console.log("[AUTH] registerAction called");
  const name = clean(formData.get("name"), 120);
  const email = clean(formData.get("email"), 200).toLowerCase();
  const phone = clean(formData.get("phone"), 20);
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (name.length < 2) return { error: "Please tell us your name." };
  if (!isEmail(email)) return { error: "Please enter a valid email address." };
  if (!isPhone(phone)) {
    return { error: "Please enter a valid 10-digit mobile number." };
  }
  if (password.length < 8) {
    return { error: "Use at least 8 characters for your password." };
  }
  if (password !== confirm) return { error: "The two passwords do not match." };

  const store = await getStore();
  const existing = await store.users.findByEmail(email);
  if (existing) {
    return { error: "An account with this email already exists. Try signing in." };
  }

  try {
    console.log("[AUTH] calling signups.start for", email);
    await store.signups.start({
      email,
      name,
      phone: normalisePhone(phone),
      passwordHash: hashPassword(password),
    });
    console.log("[AUTH] signups.start completed for", email);
  } catch (error) {
    console.error("Signup OTP error", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "We could not send the verification code. Please try again.",
    };
  }

  return {
    step: "otp",
    email,
    success: `We sent a 6-digit code to ${email}. Enter it below to finish creating your account.`,
  };
}

export async function verifySignupOtpAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = clean(formData.get("email"), 200).toLowerCase();
  const code = clean(formData.get("code"), 10).replace(/\D/g, "");

  if (!isEmail(email)) return { error: "Start the signup again." };
  if (code.length !== 6) return { error: "Enter the 6-digit code from your email." };

  const store = await getStore();
  const existing = await store.users.findByEmail(email);
  if (existing) {
    await store.signups.clear(email);
    return { error: "This email is already registered. Please sign in instead." };
  }

  const pending = await store.signups.verify(email, code);
  if (!pending) {
    return {
      error:
        "That code is not right, or it has expired. Check the email or request a new code.",
    };
  }

  const user = await store.users.create({
    name: pending.name,
    email: pending.email,
    phone: pending.phone,
    passwordHash: pending.passwordHash,
    role: "user",
    emailVerified: true,
  });

  await store.signups.clear(email);
  await setSession(user);
  revalidatePath("/", "layout");

  const next = safeNext(formData.get("next"));
  redirect(next || "/account");
}

export async function resendSignupOtpAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = clean(formData.get("email"), 200).toLowerCase();
  if (!isEmail(email)) return { error: "Start the signup again." };

  const store = await getStore();
  try {
    await store.signups.resend(email);
  } catch {
    return { error: "We could not resend the code. Please sign up again." };
  }

  return {
    step: "otp",
    email,
    success: `A new code is on its way to ${email}.`,
  };
}

export async function logoutAction() {
  await clearSession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfileAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in again." };

  const name = clean(formData.get("name"), 120);
  const phone = clean(formData.get("phone"), 20);

  if (name.length < 2) return { error: "Please tell us your name." };
  if (!isPhone(phone)) {
    return { error: "Please enter a valid 10-digit mobile number." };
  }

  const store = await getStore();
  const user = await store.users.update(session.id, {
    name,
    phone: normalisePhone(phone),
  });
  if (!user) return { error: "We could not find your account." };

  await setSession(user);
  revalidatePath("/account");
  return { success: "Your details have been updated." };
}

export async function changePasswordAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!current || !next) return { error: "Fill in both password fields." };
  if (next.length < 8) {
    return { error: "Use at least 8 characters for your new password." };
  }
  if (next !== confirm) return { error: "The new passwords do not match." };

  const store = await getStore();
  const user = await store.users.get(session.id);
  if (!user) return { error: "We could not find your account." };
  if (!verifyPassword(current, user.passwordHash)) {
    return { error: "Your current password is not correct." };
  }

  await store.users.update(user.id, { passwordHash: hashPassword(next) });
  return { success: "Your password has been changed." };
}
