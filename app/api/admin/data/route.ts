import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get("collection");
    if (!collection) return NextResponse.json({ error: "Missing collection" }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    const snap = await db.collection(collection).get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const collection = String(body.collection || "");
    const data = body.data || {};
    if (!collection) return NextResponse.json({ error: "Missing collection" }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    const ref = await db.collection(collection).add(data);
    return NextResponse.json({ id: ref.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const collection = String(body.collection || "");
    const id = String(body.id || "");
    const data = body.data || {};
    if (!collection || !id) return NextResponse.json({ error: "Missing collection or id" }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    await db.collection(collection).doc(id).update(data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get("collection");
    const id = searchParams.get("id");
    if (!collection || !id) return NextResponse.json({ error: "Missing collection or id" }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    await db.collection(collection).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
