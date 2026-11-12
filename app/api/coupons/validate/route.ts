import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { clean } from "@/lib/validate";
import { evaluateCoupon } from "@/lib/pricing";

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const code = clean(payload.code, 40).toUpperCase();
  const subtotal = Number(payload.subtotal) || 0;

  if (!code) {
    return NextResponse.json({ error: "Enter a coupon code." }, { status: 400 });
  }

  const store = await getStore();
  const coupon = await store.coupons.getByCode(code);
  const result = evaluateCoupon(coupon, subtotal);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    code: coupon!.code,
    discount: result.discount,
    couponId: coupon!.id,
  });
}
