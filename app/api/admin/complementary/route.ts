import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  await requireAdmin();
  const form = await request.formData();
  const name = String(form.get('name')||'').trim();
  const type = String(form.get('type')||'product');
  const itemId = String(form.get('itemId')||'').trim();
  const notes = String(form.get('notes')||'').trim();
  if (!name || !itemId) {
    return new Response('Name and Item are required', { status: 400 });
  }
  const db = await getDb();
  if (!db) {
    return new Response('Firestore not configured', { status: 503 });
  }
  const doc = db.collection('complementary_gifts').doc();
  await doc.set({name, type, itemId, notes, createdAt: new Date().toISOString()});
  return NextResponse.redirect(new URL('/admin/complementary', request.url), 303);
}
