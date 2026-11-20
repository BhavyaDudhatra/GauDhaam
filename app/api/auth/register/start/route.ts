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
    const confirm = String(body.confirm || "");

    if (name.length < 2) return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
    if (!isEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (!isPhone(phone)) return NextResponse.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Use at least 8 characters for your password." }, { status: 400 });
    if (password !== confirm) return NextResponse.json({ error: "The two passwords do not match." }, { status: 400 });

    const store = await getStore();
    const existing = await store.users.findByEmail(email);
    if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });

    await store.signups.start({
      email,
      name,
      phone: normalisePhone(phone),
      passwordHash: hashPassword(password),
    });

    return NextResponse.json({ step: "otp", email, expiresAt: Date.now() + 5 * 60 * 1000 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
