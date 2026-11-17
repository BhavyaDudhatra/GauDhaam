import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").toLowerCase();
    const code = String(body.code || "").replace(/\D/g, "");
    const store = await getStore();
    const existing = await store.users.findByEmail(email);
    if (existing) { await store.signups.clear(email); return NextResponse.json({ error: "Already registered." }, { status: 409 }); }
    const pending = await store.signups.verify(email, code);
    if (!pending) return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
    const user = await store.users.create({ name: pending.name, email: pending.email, phone: pending.phone, passwordHash: pending.passwordHash, role: "user", emailVerified: true });
    await store.signups.clear(email);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, emailVerified: user.emailVerified, createdAt: user.createdAt, addresses: user.addresses ?? [], wishlist: user.wishlist ?? [] } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
