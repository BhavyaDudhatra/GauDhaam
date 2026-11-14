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

  const action = clean(payload.action, 20);
  const ids = Array.isArray(payload.ids) ? (payload.ids as string[]).map((id) => clean(id, 80)).filter(Boolean) : [];

  if (!action || ids.length === 0) {
    return NextResponse.json({ error: "Action and product IDs required." }, { status: 400 });
  }

  const store = await getStore();
  let updated = 0;

  for (const id of ids) {
    try {
      if (action === "activate") {
        await store.products.update(id, { available: true });
        updated++;
      } else if (action === "deactivate") {
        await store.products.update(id, { available: false });
        updated++;
      } else if (action === "delete") {
        await store.products.remove(id);
        updated++;
      } else if (action === "updatePrice") {
        const price = toInt(payload.price, 0);
        if (price > 0) {
          const product = await store.products.get(id);
          if (product && product.variants.length > 0) {
            const variants = product.variants.map((v) => ({ ...v, price }));
            await store.products.update(id, { variants });
            updated++;
          }
        }
      } else if (action === "updateStock") {
        const stock = toInt(payload.stock, 0);
        if (stock >= 0) {
          const product = await store.products.get(id);
          if (product && product.variants.length > 0) {
            const variants = product.variants.map((v) => ({ ...v, stock }));
            await store.products.update(id, { variants });
            updated++;
          }
        }
      }
    } catch {
      // skip failed items
    }
  }

  return NextResponse.json({ ok: true, updated });
}
