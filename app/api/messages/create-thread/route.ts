import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { randomUUID } from "node:crypto";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { subject, body } = await req.json();
  const store = await getStore();
  // check existing support thread
  const threads = await store.userMessages.listThreads(session.id);
  const existing = threads.find(t => t.subject === "Support");
  if (existing) {
    return Response.json({ id: existing.id });
  }
  const thread = await store.userMessages.createThread({ userId: session.id, subject: subject || "Support", body: body || "" });
  return Response.json({ id: thread.id });
}
