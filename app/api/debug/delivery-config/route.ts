import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";

export async function GET() {
  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  const snap = await db.collection('config').doc('delivery').get();
  if (!snap.exists) {
    return NextResponse.json({ exists: false, message: "No delivery config found" });
  }
  return NextResponse.json({ exists: true, data: snap.data() });
}
