import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").toLowerCase();
    const store = await getStore();
    await store.signups.resend(email);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
