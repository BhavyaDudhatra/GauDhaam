import pathlib
p = pathlib.Path('B:/Study/Projects/VibeCoding/GauDham/Web/app/api/admin/slides')
p.mkdir(parents=True, exist_ok=True)
route = p/'route.ts'
content = """import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  await requireAdmin();
  const form = await request.formData();
  const title = String(form.get('title')||'');
  const subtitle = String(form.get('subtitle')||'');
  const imageUrl = String(form.get('imageUrl')||'');
  const link = String(form.get('link')||'');
  const order = Number(form.get('order')||0);
  if (!title || !imageUrl) return NextResponse.json({error:'title and image required'}, {status:400});
  const db = await getDb();
  const doc = db.collection('slides').doc();
  await doc.set({title, subtitle, imageUrl, link, order, createdAt: new Date().toISOString()});
  return NextResponse.redirect(new URL('/admin/slides', request.url));
}
"""
route.write_text(content)
print('api created')
