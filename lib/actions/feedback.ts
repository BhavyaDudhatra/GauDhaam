"use server";

import { revalidatePath } from "next/cache";
import { getSession, requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { clean, toBool, toInt } from "@/lib/validate";
import type { FormState } from "./state";

export async function submitFeedbackAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getSession();
  if (!session) {
    return { error: "Please sign in to share your feedback." };
  }

  const productId = clean(formData.get("productId"), 80);
  const productName = clean(formData.get("productName"), 160);
  const serviceId = clean(formData.get("serviceId"), 80);
  const serviceName = clean(formData.get("serviceName"), 160);
  const title = clean(formData.get("title"), 120) || "";
  const comment = clean(formData.get("comment"), 1500);
  const rating = Math.min(5, Math.max(1, toInt(formData.get("rating"), 5)));

  // comment is optional, title optional
  const store = await getStore();
  
  // Verify purchase for product feedback
  if (productId) {
    const orders = await store.orders.list({ userId: session.id });
    const hasDelivered = orders.some(o => o.status === "delivered" && o.items?.some(i => i.productId === productId));
    if (!hasDelivered) {
      return { error: "You can only review products you have purchased and received." };
    }
  }

  await store.feedback.create({
    userId: session.id,
    userName: session.name,
    productId: productId || undefined,
    productName: productName || undefined,
    serviceId: serviceId || undefined,
    serviceName: serviceName || undefined,
    title,
    comment,
    rating,
  });

  revalidatePath("/feedback");
  if (productId) {
    const product = await store.products.get(productId);
    if (product) revalidatePath(`/product/${product.slug}`);
  }

  return {
    success:
      "Thank you — your feedback is live. We read every note and reply where we can help.",
  };
}

export async function replyFeedbackAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = clean(formData.get("id"), 80);
  const reply = clean(formData.get("reply"), 1200);
  if (!id || !reply) return;

  const store = await getStore();
  await store.feedback.update(id, {
    reply,
    repliedAt: new Date().toISOString(),
    repliedBy: admin.name,
  });
  revalidatePath("/feedback");
  revalidatePath("/admin/feedback");
}

export async function toggleFeedbackAction(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 80);
  if (!id) return;
  const approved = toBool(formData.get("approved"));
  const store = await getStore();
  await store.feedback.update(id, { approved });
  revalidatePath("/feedback");
  revalidatePath("/admin/feedback");
}

export async function deleteFeedbackAction(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 80);
  if (!id) return;
  const store = await getStore();
  await store.feedback.remove(id);
  revalidatePath("/feedback");
  revalidatePath("/admin/feedback");
}
