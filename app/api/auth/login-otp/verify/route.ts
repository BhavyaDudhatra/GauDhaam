import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { getDb } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").toLowerCase();
    const code = String(body.code || "");
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    const ref = db.collection("login_otps").doc(email);
    const doc = await ref.get();
    if (!doc.exists) return NextResponse.json({ error: "No pending code" }, { status: 400 });
    const data = doc.data() as any;
    if (new Date(data.expiresAt).getTime() < Date.now()) { await ref.delete(); return NextResponse.json({ error: "Code expired" }, { status: 400 }); }
    if ((data.attempts || 0) >= 5) { await ref.delete(); return NextResponse.json({ error: "Too many attempts" }, { status: 400 }); }
    if (data.code !== code) { await ref.update({ attempts: (data.attempts || 0) + 1 }); return NextResponse.json({ error: "Incorrect code" }, { status: 400 }); }
    await ref.delete();
    const store = await getStore();
    const user = await store.users.findByEmail(email);
    if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, emailVerified: user.emailVerified, createdAt: user.createdAt, addresses: user.addresses ?? [], wishlist: user.wishlist ?? [] } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
