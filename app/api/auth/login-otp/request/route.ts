import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { getDb } from "@/lib/firebase";
import { generateOtp } from "@/lib/email";
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").toLowerCase();
    const store = await getStore();
    const user = await store.users.findByEmail(email);
    if (!user) return NextResponse.json({ error: "No account found" }, { status: 404 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await db.collection("login_otps").doc(email).set({ email, code, expiresAt, attempts: 0, createdAt: new Date().toISOString() });
    await sendOtpEmail(email, code);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
