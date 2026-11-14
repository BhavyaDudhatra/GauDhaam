import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import { clean, toInt } from "@/lib/validate";

export async function POST(request: Request) {
  await requireAdmin();
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const productId = clean(payload.productId, 80);
  const variantId = clean(payload.variantId, 80);
  const stock = toInt(payload.stock, -1);
  const price = toInt(payload.price, -1);

  if (!productId || !variantId) {
    return NextResponse.json({ error: "Product and variant required." }, { status: 400 });
  }

  const store = await getStore();
  const product = await store.products.get(productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const variants = product.variants.map((v) => {
    if (v.id !== variantId) return v;
    return {
      ...v,
      ...(stock >= 0 ? { stock } : {}),
      ...(price > 0 ? { price } : {}),
    };
  });

  await store.products.update(productId, { variants });
  return NextResponse.json({ ok: true });
}
