import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { isDateKey, toDateKey } from "@/lib/subscriptions";
import { clean } from "@/lib/validate";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const input = (body && typeof body === "object" ? body : {}) as Record<
    string,
    unknown
  >;
  const subscriptionId = clean(input.subscriptionId, 80);
  const startDate = clean(input.startDate, 10);
  const endDate = clean(input.endDate, 10);
  const today = toDateKey(new Date());

  if (!subscriptionId) {
    return NextResponse.json(
      { error: "subscriptionId is required" },
      { status: 400 },
    );
  }
  if (!isDateKey(startDate) || !isDateKey(endDate)) {
    return NextResponse.json(
      { error: "Valid startDate and endDate are required" },
      { status: 400 },
    );
  }
  if (endDate < startDate) {
    return NextResponse.json(
      { error: "endDate must be after startDate" },
      { status: 400 },
    );
  }
  if (endDate < today) {
    return NextResponse.json(
      { error: "The pause window is in the past" },
      { status: 400 },
    );
  }

  try {
    const store = await getStore();
    const subscription = await store.subscriptions.get(subscriptionId);
    if (!subscription || subscription.userId !== session.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (subscription.status === "cancelled") {
      return NextResponse.json(
        { error: "Subscription is cancelled" },
        { status: 400 },
      );
    }

    const effectiveStart = startDate < today ? today : startDate;
    const pausedIntervals = [...(subscription.pausedIntervals ?? [])];
    if (
      !pausedIntervals.some(
        (interval) =>
          interval.startDate === effectiveStart && interval.endDate === endDate,
      )
    ) {
      pausedIntervals.push({ startDate: effectiveStart, endDate });
    }

    const updated = await store.subscriptions.update(subscriptionId, {
      status: "paused",
      pausedIntervals,
    });
    await store.dailyDeliveries.generateForSubscription(
      subscriptionId,
      effectiveStart.slice(0, 7),
    );
    if (endDate.slice(0, 7) !== effectiveStart.slice(0, 7)) {
      await store.dailyDeliveries.generateForSubscription(
        subscriptionId,
        endDate.slice(0, 7),
      );
    }
    await store.dailyDeliveries.pauseDays(
      subscriptionId,
      effectiveStart,
      endDate,
    );

    return NextResponse.json({ subscription: updated }, { status: 200 });
  } catch (error) {
    console.error("Subscription pause error:", error);
    return NextResponse.json(
      { error: "Failed to pause subscription" },
      { status: 500 },
    );
  }
}
