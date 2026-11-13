import { NextResponse } from "next/server";
import { computeDeliveryCharge } from "@/lib/delivery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

  const result = await computeDeliveryCharge(address);
  return NextResponse.json({ 
    charge: result.charge, 
    distance: result.distanceKm, 
    branchId: result.branchId,
    method: result.method,
    baseFee: result.baseFee,
    perKmRate: result.perKmRate,
  });
}
