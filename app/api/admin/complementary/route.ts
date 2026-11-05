import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  await requireAdmin();
  const form = await request.formData();
  const name = String(form.get('name')||'');
  const type = String(form.get('type')||'product');
  const itemId = String(form.get('itemId')||'');
  const notes = String(form.get('notes')||'');
  const deliveryMode = String(form.get('deliveryMode')||'');
  if (!name || !itemId) return NextResponse.json({error:'required'}, {status:400});
  const db = await getDb();
  const doc = db.collection('complementary_gifts').doc();
  await doc.set({name, type, itemId, notes, deliveryMode: type==='product'?deliveryMode:null, createdAt: new Date().toISOString()});
  return NextResponse.redirect(new URL('/admin/complementary', request.url));
}
