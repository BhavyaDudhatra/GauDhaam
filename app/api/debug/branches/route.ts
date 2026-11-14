import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";

export async function GET() {
  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  const snap = await db.collection('branches').get();
  const branches = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ branches });
}
