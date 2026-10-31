"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { clean } from "@/lib/validate";

export async function listUserThreadsAction() {
  const session = await requireUser();
  const store = await getStore();
  return await store.userMessages.listThreads(session.id);
}

export async function createThreadAction(_prev: any, formData: FormData) {
  const session = await requireUser();
  const subject = clean(formData.get("subject"), 200);
  const body = clean(formData.get("body"), 2000);
  if (!subject || !body) return { error: "Subject and message required" };
  const store = await getStore();
  await store.userMessages.createThread({ userId: session.id, subject, body });
  revalidatePath("/account/messages");
  return { success: true };
}

export async function sendMessageAction(_prev: any, formData: FormData) {
  const session = await requireUser();
  const threadId = clean(formData.get("threadId"), 80);
  const body = clean(formData.get("body"), 2000);
  if (!threadId || !body) return { error: "Message required" };
  const store = await getStore();
  await store.userMessages.sendMessage({ threadId, senderId: session.id, senderRole: "user", body });
  revalidatePath("/account/messages");
  return { success: true };
}

export async function getThreadAction(threadId: string) {
  const session = await requireUser();
  const store = await getStore();
  const thread = await store.userMessages.getThread(threadId);
  if (!thread) return null;
  if (thread.thread.userId !== session.id && session.role !== "admin") return null;
  return thread;
}
