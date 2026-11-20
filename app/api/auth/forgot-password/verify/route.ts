import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { getDb } from "@/lib/firebase";
import { hashPassword } from "@/lib/password";
import { clean, isEmail } from "@/lib/validate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = clean(body.email, 200).toLowerCase();
    const code = clean(body.code, 10).replace(/\D/g, "");
    const newPassword = String(body.newPassword || "");
    const confirm = String(body.confirm || "");

    if (!isEmail(email)) return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    if (code.length !== 6) return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
    if (newPassword.length < 8) return NextResponse.json({ error: "Use at least 8 characters." }, { status: 400 });
    if (newPassword !== confirm) return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });

    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured." }, { status: 500 });

    const ref = db.collection("password_resets").doc(email);
    const doc = await ref.get();
    if (!doc.exists) return NextResponse.json({ error: "No pending reset." }, { status: 400 });
    const data = doc.data() as any;
    if (new Date(data.expiresAt).getTime() < Date.now()) {
      await ref.delete();
      return NextResponse.json({ error: "Code expired." }, { status: 400 });
    }
    if ((data.attempts || 0) >= 5) {
      await ref.delete();
      return NextResponse.json({ error: "Too many attempts." }, { status: 400 });
    }
    if (data.code !== code) {
      await ref.update({ attempts: (data.attempts || 0) + 1 });
      return NextResponse.json({ error: "Incorrect code." }, { status: 400 });
    }

    const store = await getStore();
    const user = await store.users.findByEmail(email);
    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 400 });
    await store.users.update(user.id, { passwordHash: hashPassword(newPassword) });
    await ref.delete();

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
