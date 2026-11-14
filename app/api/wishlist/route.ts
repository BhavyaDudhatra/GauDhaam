import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { clean } from "@/lib/validate";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const store = await getStore();
  const user = await store.users.get(session.id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  return NextResponse.json({ wishlist: user.wishlist ?? [] });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const productId = clean(payload.productId, 80);
  if (!productId) {
    return NextResponse.json({ error: "Product ID required." }, { status: 400 });
  }

  const store = await getStore();
  const user = await store.users.get(session.id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const wishlist = user.wishlist ?? [];
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    await store.users.update(session.id, { wishlist });
  }

  return NextResponse.json({ ok: true, wishlist });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const productId = clean(payload.productId, 80);
  if (!productId) {
    return NextResponse.json({ error: "Product ID required." }, { status: 400 });
  }

  const store = await getStore();
  const user = await store.users.get(session.id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const wishlist = (user.wishlist ?? []).filter((id) => id !== productId);
  await store.users.update(session.id, { wishlist });

  return NextResponse.json({ ok: true, wishlist });
}
