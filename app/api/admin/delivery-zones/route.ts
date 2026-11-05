import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  await requireAdmin();
  const form = await request.formData();
  const pincodePrefix = String(form.get('pincodePrefix')||'').trim();
  const charge = Number(form.get('charge')||0);
  const label = String(form.get('label')||'').trim();
  if (!pincodePrefix || isNaN(charge)) return NextResponse.json({error:'invalid'}, {status:400});
  const db = await getDb();
  const doc = db.collection('delivery_zones').doc();
  await doc.set({pincodePrefix, charge, label, createdAt: new Date().toISOString()});
  return NextResponse.redirect(new URL('/admin/delivery-charges', request.url));
}
