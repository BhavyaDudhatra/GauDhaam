import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import {
  currentMonthKey,
  isDateKey,
  normalizeAddress,
  parseFrequency,
  toDateKey,
} from "@/lib/subscriptions";
import { clean, toInt } from "@/lib/validate";

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

  const productId = clean(input.productId, 80);
  const frequency = parseFrequency(input.frequency ?? "daily");
  const quantity = Math.min(50, Math.max(1, toInt(input.quantity, 1)));
  const rawStart = clean(input.startDate, 10);
  const today = toDateKey(new Date());
  const startDate = isDateKey(rawStart) && rawStart >= today ? rawStart : today;

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }
  if (!frequency) {
    return NextResponse.json(
      { error: "frequency must be daily, weekly or monthly" },
      { status: 400 },
    );
  }

  const { address, error: addressError } = normalizeAddress(input.address);
  if (!address) {
    return NextResponse.json(
      { error: addressError ?? "A delivery address is required" },
      { status: 400 },
    );
  }

  try {
    const store = await getStore();
    const product = await store.products.get(productId);
    if (!product || !product.available) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
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

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error("Subscription creation error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await getStore();
    const subscriptions = await store.subscriptions.list({ userId: session.id });
    return NextResponse.json({ subscriptions }, { status: 200 });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 },
    );
  }
}
