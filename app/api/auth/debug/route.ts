import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
export async function GET() {
  const store = await getStore();
  const users = await store.users.list();
  return NextResponse.json({ users: users.map(u => ({ id: u.id, email: u.email, role: u.role })) });
}