"use server";

import { revalidatePath } from "next/cache";
import { getStore } from "@/lib/store";
import { clean, isEmail, isPhone, normalisePhone } from "@/lib/validate";
import type { FormState } from "./state";

export async function sendMessageAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = clean(formData.get("name"), 120);
  const email = clean(formData.get("email"), 200).toLowerCase();
  const phone = clean(formData.get("phone"), 20);
  const subject = clean(formData.get("subject"), 160) || "General enquiry";
  const message = clean(formData.get("message"), 3000);

  if (name.length < 2) return { error: "Please tell us your name." };
  if (!isEmail(email)) return { error: "Please enter a valid email address." };
  if (phone && !isPhone(phone)) {
    return { error: "Please check your mobile number." };
  }
  if (message.length < 10) {
    return { error: "Tell us a little more so we can help." };
  }

  const store = await getStore();
  await store.messages.create({
    name,
    email,
    phone: phone ? normalisePhone(phone) : "",
    subject,
    message,
  });

  revalidatePath("/admin/messages");

  return {
    success:
      "Thank you — your message is with us. We usually reply within one working day.",
  };
}
