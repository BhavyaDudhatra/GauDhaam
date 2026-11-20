import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { hashPassword } from "@/lib/password";

export async function POST() {
  const store = await getStore();
  const user = await store.users.findByEmail("admin@gaudhaam.in");
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });
  await store.users.update(user.id, { passwordHash: hashPassword("Gaudham@123") });
  return NextResponse.json({ ok: true });
}