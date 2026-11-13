import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { clean, normalisePhone } from "@/lib/validate";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "user") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const label = clean(payload.label, 40) || "Delivery address";
  const name = clean(payload.name, 120);
  const phone = clean(payload.phone, 20);
  const line1 = clean(payload.line1, 240);
  const line2 = clean(payload.line2, 240);
  const city = clean(payload.city, 120);
  const state = clean(payload.state, 120);
  const pincode = clean(payload.pincode, 10);

  if (!name || !phone || !line1 || !city || !state || !pincode) {
    return NextResponse.json({ error: "Please complete all address fields." }, { status: 400 });
  }

  const store = await getStore();
  const user = await store.users.get(session.id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const addresses = user.addresses ?? [];
  // Check if address already exists
  const exists = addresses.some(a =>
    a.line1 === line1 && a.city === city && a.pincode === pincode && a.phone === normalisePhone(phone)
  );
  if (exists) {
    return NextResponse.json({ ok: true, message: "Address already saved." });
  }

  const id = `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newAddr = {
    id,
    label,
    name,
    phone: normalisePhone(phone),
    line1,
    line2,
    city,
    state,
    pincode,
    isDefault: addresses.length === 0,
  };

  await store.users.update(session.id, { addresses: [newAddr, ...addresses] });

  return NextResponse.json({ ok: true, address: newAddr });
}
