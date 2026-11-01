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
  const id = randomUUID();
  const now = new Date().toISOString();
  // create thread directly in store
  const thread = { id, userId: session.id, subject: subject || "Support", createdAt: now, updatedAt: now };
  // we need access to internal collections: use store method
  await store.userMessages.createThread({ userId: session.id, subject: thread.subject, body: body || "" });
  return Response.json({ id });
}
