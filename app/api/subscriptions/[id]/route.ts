import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { isDateKey, normalizeAddress, parseFrequency } from "@/lib/subscriptions";
import { clean, toInt } from "@/lib/validate";
import type {
  PausedInterval,
  Subscription,
  SubscriptionStatus,
} from "@/lib/types";

const statuses: SubscriptionStatus[] = ["active", "paused", "cancelled"];

function pauseIntervals(value: unknown): PausedInterval[] | null {
  if (!Array.isArray(value)) return null;
  const intervals: PausedInterval[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const raw = item as Record<string, unknown>;
    const startDate = clean(raw.startDate, 10);
    const endDate = clean(raw.endDate, 10);
    if (!isDateKey(startDate) || !isDateKey(endDate) || endDate < startDate) {
      return null;
    }
    intervals.push({ startDate, endDate });
  }
  return intervals;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  try {
    const { id } = await params;
    const store = await getStore();
    const existing = await store.subscriptions.get(id);
    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const patch: Partial<Subscription> = {};

    if (input.status !== undefined) {
      const status = clean(input.status, 20) as SubscriptionStatus;
      if (!statuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      patch.status = status;
      if (status === "active") patch.pausedIntervals = [];
    }

    if (input.frequency !== undefined) {
      const frequency = parseFrequency(input.frequency);
      if (!frequency) {
        return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
      }
      patch.frequency = frequency;
    }

    if (input.quantity !== undefined) {
      patch.quantity = Math.min(50, Math.max(1, toInt(input.quantity, 1)));
    }

    if (input.startDate !== undefined) {
      const startDate = clean(input.startDate, 10);
      if (!isDateKey(startDate)) {
        return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
      }
      patch.startDate = startDate;
    }

    if (input.pausedIntervals !== undefined) {
      const intervals = pauseIntervals(input.pausedIntervals);
      if (!intervals) {
        return NextResponse.json(
          { error: "Invalid pausedIntervals" },
          { status: 400 },
        );
      }
      patch.pausedIntervals = intervals;
    }

    if (input.address !== undefined) {
      const { address, error } = normalizeAddress(input.address);
      if (!address) {
        return NextResponse.json({ error }, { status: 400 });
      }
      patch.address = address;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const subscription = await store.subscriptions.update(id, patch);
    if (patch.status === "active") {
      await store.dailyDeliveries.resumeDays(id);
    }
    if (patch.status === "cancelled") {
      await store.dailyDeliveries.cancelDays(id);
    }
    return NextResponse.json({ subscription }, { status: 200 });
  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const store = await getStore();
    const existing = await store.subscriptions.get(id);
    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await store.subscriptions.update(id, { status: "cancelled" });
    await store.dailyDeliveries.cancelDays(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Subscription cancellation error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 },
    );
  }
}
