import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { verifyPassword } from "@/lib/password";
import { setSession } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").toLowerCase();
  const password = String(formData.get("password") || "");

  const store = await getStore();
  const user = await store.users.findByEmail(email);

  if (!user || user.role !== "admin" || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url));
  }

  await setSession(user);
  return NextResponse.redirect(new URL("/admin", request.url));
}
