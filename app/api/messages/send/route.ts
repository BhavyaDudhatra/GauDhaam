import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { threadId, body } = await req.json();
  if (!threadId || !body) return new Response("Bad Request", { status: 400 });
  const store = await getStore();
  await store.userMessages.sendMessage({ threadId, senderId: session.id, senderRole: "user", body });
  return Response.json({ ok: true });
}
