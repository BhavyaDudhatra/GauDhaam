import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  await requireAdmin();
  const form = await request.formData();
  const baseFee = parseFloat(String(form.get('baseFee')||'0'));
  const perKmRate = parseFloat(String(form.get('perKmRate')||'0'));
  const db = await getDb();
  await db.collection('config').doc('delivery').set({baseFee, perKmRate, updatedAt: new Date().toISOString()});
  return NextResponse.redirect(new URL('/admin/delivery-config', request.url));
}
