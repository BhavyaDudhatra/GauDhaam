import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  await requireAdmin();
  const form = await request.formData();
  const name = String(form.get('name')||'').trim();
  const address = String(form.get('address')||'').trim();
  const lat = parseFloat(String(form.get('lat')||'0'));
  const lng = parseFloat(String(form.get('lng')||'0'));
  const phone = String(form.get('phone')||'').trim();
  const isMain = String(form.get('isMain')||'false') === 'true';
  if (!name || !address || !lat || !lng) return NextResponse.json({error:'required'}, {status:400});
  const db = await getDb();
  await db.collection('branches').add({name, address, lat, lng, phone, isMain, createdAt: new Date().toISOString()});
  return NextResponse.redirect(new URL('/admin/branches', request.url));
}
