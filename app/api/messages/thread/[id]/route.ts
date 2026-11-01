import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const store = await getStore();
  const data = await store.userMessages.getThread(params.id);
  if (!data) return new Response("Not found", { status: 404 });
  if (data.thread.userId !== session.id && session.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }
  return Response.json(data);
}
