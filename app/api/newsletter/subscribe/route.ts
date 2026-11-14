import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { getDb } from "@/lib/firebase";
import { clean } from "@/lib/validate";

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = clean(payload.email, 200).toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const db = await getDb();
  if (!db) {
    return NextResponse.json({ ok: true, message: "Subscribed (local mode)." });
  }

  const ref = db.collection("newsletter").doc(email);
  const existing = await ref.get();
  if (existing.exists) {
    return NextResponse.json({ ok: true, message: "You're already subscribed!" });
  }

  await ref.set({
    email,
    createdAt: new Date().toISOString(),
    active: true,
  });

  return NextResponse.json({ ok: true, message: "Thanks for subscribing!" });
}
