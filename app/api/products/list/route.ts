import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET() {
  const store = await getStore();
  const products = await store.products.list();
  return NextResponse.json({ products });
}
