import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { hashPassword } from "@/lib/password";
import { clean, isEmail, isPhone, normalisePhone } from "@/lib/validate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = clean(body.name, 120);
    const email = clean(body.email, 200).toLowerCase();
    const phone = clean(body.phone, 20);
    const password = String(body.password || "");
    if (name.length < 2) return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
    if (!isEmail(email)) return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    if (!isPhone(phone)) return NextResponse.json({ error: "Invalid phone." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Use at least 8 characters." }, { status: 400 });
    const store = await getStore();
    const existing = await store.users.findByEmail(email);
    if (existing) return NextResponse.json({ error: "Account already exists." }, { status: 409 });
    await store.signups.start({ email, name, phone: normalisePhone(phone), passwordHash: hashPassword(password) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
