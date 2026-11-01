import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const store = await getStore();
  const threads = await store.userMessages.listThreads(session.id);
  return Response.json(threads);
}
