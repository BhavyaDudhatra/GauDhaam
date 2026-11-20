import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { setSession } from "@/lib/auth";
import { clean, isEmail } from "@/lib/validate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = clean(body.email, 200).toLowerCase();
    const code = clean(body.code, 10).replace(/\D/g, "");

    if (!isEmail(email)) return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    if (code.length !== 6) return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });

    const store = await getStore();
    const existing = await store.users.findByEmail(email);
    if (existing) return NextResponse.json({ error: "This email is already registered." }, { status: 400 });

    const pending = await store.signups.verify(email, code);
    if (!pending) return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });

    const user = await store.users.create({
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      passwordHash: pending.passwordHash,
      role: "user",
      emailVerified: true,
    });

    await store.signups.clear(email);
    await setSession(user);

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, emailVerified: user.emailVerified, createdAt: user.createdAt, addresses: user.addresses ?? [], wishlist: user.wishlist ?? [] } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
