import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { generateOtp } from "@/lib/email";
import { sendOtpEmail } from "@/lib/email";
import { clean, isEmail } from "@/lib/validate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = clean(body.email, 200).toLowerCase();
    if (!isEmail(email)) return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured." }, { status: 500 });
    const ref = db.collection("password_resets").doc(email);
    const doc = await ref.get();
    if (!doc.exists) return NextResponse.json({ error: "No pending reset." }, { status: 400 });
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await ref.update({ code, expiresAt, attempts: 0 });
    await sendOtpEmail(email, code);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
