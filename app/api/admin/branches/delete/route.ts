import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  await requireAdmin();
  const form = await request.formData();
  const id = String(form.get('id')||'');
  if (!id) return NextResponse.json({error:'id required'}, {status:400});
  const db = await getDb();
  await db.collection('branches').doc(id).delete();
  return NextResponse.redirect(new URL('/admin/branches', request.url));
}
