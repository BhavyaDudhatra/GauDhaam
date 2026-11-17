import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").toLowerCase();
    const password = String(body.password || "");
    const store = await getStore();
    const user = await store.users.findByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, emailVerified: user.emailVerified, createdAt: user.createdAt, addresses: user.addresses ?? [], wishlist: user.wishlist ?? [] } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
