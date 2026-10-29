"use server";

import { revalidatePath } from "next/cache";
import { getSession, requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import {
  currentMonthKey,
  isDateKey,
  normalizeAddress,
  parseFrequency,
  toDateKey,
} from "@/lib/subscriptions";
import { clean, toInt } from "@/lib/validate";
import type { FormState } from "./state";
import type { SubscriptionStatus } from "@/lib/types";

const subscriptionStatuses: SubscriptionStatus[] = [
  "active",
  "paused",
  "cancelled",
];

function revalidateSubscription(subscriptionId?: string) {
  revalidatePath("/subscriptions");
  revalidatePath("/admin/subscriptions");
  if (subscriptionId) revalidatePath(`/subscriptions/${subscriptionId}`);
}

export async function createSubscriptionAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getSession();
  if (!session) {
    return { error: "Please sign in to start a subscription." };
  }

  const productId = clean(formData.get("productId"), 80);
  const frequency = parseFrequency(clean(formData.get("frequency"), 20));
  const quantity = Math.min(50, Math.max(1, toInt(formData.get("quantity"), 1)));

  if (!productId) return { error: "Choose a product to subscribe to." };
  if (!frequency) return { error: "Choose how often you want delivery." };

  const rawStart = clean(formData.get("startDate"), 10);
  const today = toDateKey(new Date());
  const startDate = isDateKey(rawStart) && rawStart >= today ? rawStart : today;

  const { address, error: addressError } = normalizeAddress({
    name: formData.get("name"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2"),
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
  });
  if (!address) return { error: addressError ?? "Add a delivery address." };

  const store = await getStore();
  const product = await store.products.get(productId);
  if (!product || !product.available) {
    return { error: "That product is no longer available." };
  }

  const subscription = await store.subscriptions.create({
    userId: session.id,
    productId: product.id,
    quantity,
    frequency,
    startDate,
    status: "active",
    pausedIntervals: [],
    address,
  });
  await store.dailyDeliveries.generateForSubscription(
    subscription.id,
    currentMonthKey(),
  );

  revalidateSubscription(subscription.id);
  revalidatePath(`/product/${product.slug}`);

  return {
    success: `Subscription started. Your first ${frequency} delivery is scheduled for ${startDate}.`,
  };
}

export async function pauseSubscriptionAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in again to pause your subscription." };

  const id = clean(formData.get("id"), 80);
  const startDate = clean(formData.get("startDate"), 10);
  const endDate = clean(formData.get("endDate"), 10);
  const today = toDateKey(new Date());

  if (!id) return { error: "Subscription not found." };
  if (!isDateKey(startDate) || !isDateKey(endDate)) {
    return { error: "Choose both a start and end date." };
  }
  if (endDate < startDate) {
    return { error: "The pause end date must be after the start date." };
  }
  if (endDate < today) {
    return { error: "Choose a pause window that has not already passed." };
  }

  const store = await getStore();
  const subscription = await store.subscriptions.get(id);
  if (!subscription || subscription.userId !== session.id) {
    return { error: "Subscription not found." };
  }
  if (subscription.status === "cancelled") {
    return { error: "This subscription has already been cancelled." };
  }

  const effectiveStart = startDate < today ? today : startDate;
  const pausedIntervals = [...(subscription.pausedIntervals ?? [])];
  const exists = pausedIntervals.some(
    (interval) =>
      interval.startDate === effectiveStart && interval.endDate === endDate,
  );
  if (!exists) {
    pausedIntervals.push({ startDate: effectiveStart, endDate });
  }

  await store.subscriptions.update(id, {
    status: "paused",
    pausedIntervals,
  });
  await store.dailyDeliveries.generateForSubscription(
    id,
    effectiveStart.slice(0, 7),
  );
  if (endDate.slice(0, 7) !== effectiveStart.slice(0, 7)) {
    await store.dailyDeliveries.generateForSubscription(id, endDate.slice(0, 7));
  }
  await store.dailyDeliveries.pauseDays(id, effectiveStart, endDate);

  revalidateSubscription(id);
  return { success: "Subscription paused for the selected dates." };
}

export async function resumeSubscriptionAction(formData: FormData) {
  const session = await getSession();
  if (!session) return;
  const id = clean(formData.get("id"), 80);
  if (!id) return;

  const store = await getStore();
  const subscription = await store.subscriptions.get(id);
  if (!subscription || subscription.userId !== session.id) return;
  if (subscription.status === "cancelled") return;

  const today = toDateKey(new Date());
  const pausedIntervals = (subscription.pausedIntervals ?? []).filter(
    (interval) => interval.endDate < today,
  );

  await store.subscriptions.update(id, {
    status: "active",
    pausedIntervals,
  });
  await store.dailyDeliveries.generateForSubscription(
    id,
    currentMonthKey(),
  );
  await store.dailyDeliveries.resumeDays(id);
  revalidateSubscription(id);
}

export async function cancelSubscriptionAction(formData: FormData) {
  const session = await getSession();
  if (!session) return;
  const id = clean(formData.get("id"), 80);
  if (!id) return;

  const store = await getStore();
  const subscription = await store.subscriptions.get(id);
  if (!subscription || subscription.userId !== session.id) return;

  await store.subscriptions.update(id, { status: "cancelled" });
  await store.dailyDeliveries.cancelDays(id);
  revalidateSubscription(id);
}

export async function updateSubscriptionStatusAction(formData: FormData) {
  await requireAdmin();

  const id = clean(formData.get("id"), 80);
  const status = clean(formData.get("status"), 20) as SubscriptionStatus;
  if (!id || !subscriptionStatuses.includes(status)) return;

  const store = await getStore();
  const subscription = await store.subscriptions.get(id);
  if (!subscription) return;

  if (status === "active") {
    const today = toDateKey(new Date());
    const pausedIntervals = (subscription.pausedIntervals ?? []).filter(
      (interval) => interval.endDate < today,
    );
    await store.subscriptions.update(id, { status, pausedIntervals });
    await store.dailyDeliveries.resumeDays(id);
  } else {
    await store.subscriptions.update(id, { status });
    if (status === "cancelled") {
      await store.dailyDeliveries.cancelDays(id);
    }
  }

  revalidateSubscription(id);
}
