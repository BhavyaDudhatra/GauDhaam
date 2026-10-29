"use server";

import { revalidatePath } from "next/cache";
import { getSession, requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { parseFrequency } from "@/lib/subscriptions";
import { clean, isEmail, isPhone, normalisePhone, toInt } from "@/lib/validate";
import type { FormState } from "./state";
import type { B2BOrderStatus } from "@/lib/types";

const b2bStatuses: B2BOrderStatus[] = [
  "pending",
  "quoted",
  "confirmed",
  "rejected",
];

export async function submitB2BRequestAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const companyName = clean(formData.get("companyName"), 140);
  const contactName = clean(formData.get("contactName"), 80);
  const email = clean(formData.get("email"), 160).toLowerCase();
  const phone = normalisePhone(clean(formData.get("phone"), 20));
  const gstNumber = clean(formData.get("gstNumber"), 20).toUpperCase();
  const productId = clean(formData.get("productId"), 80);
  const quantity = Math.min(100000, Math.max(1, toInt(formData.get("quantity"), 0)));
  const frequency = parseFrequency(clean(formData.get("frequency"), 20));
  const packagingDetails = clean(formData.get("packagingDetails"), 300);
  const customNotes = clean(formData.get("customNotes"), 1200);

  if (companyName.length < 2) {
    return { error: "Add your company or business name." };
  }
  if (contactName.length < 2) return { error: "Add a contact person." };
  if (!isEmail(email)) return { error: "Enter a valid email address." };
  if (!isPhone(phone)) {
    return { error: "Enter a valid 10-digit mobile number." };
  }
  if (gstNumber && !/^[0-9A-Z]{15}$/.test(gstNumber)) {
    return { error: "GSTIN should be 15 letters and numbers." };
  }
  if (!productId) return { error: "Choose the product you need." };
  if (quantity < 1) return { error: "Enter the quantity you need." };
  if (!frequency) return { error: "Choose a delivery frequency." };

  const store = await getStore();
  const product = await store.products.get(productId);
  if (!product) return { error: "That product is no longer available." };

  const session = await getSession();
  await store.b2bOrders.create({
    userId: session?.id ?? null,
    companyName,
    contactName,
    email,
    phone,
    ...(gstNumber ? { gstNumber } : {}),
    productId: product.id,
    productName: product.name,
    quantity,
    frequency,
    ...(packagingDetails ? { packagingDetails } : {}),
    ...(customNotes ? { customNotes } : {}),
  });

  revalidatePath("/admin/b2b");
  return {
    success:
      "Your bulk inquiry is in. Our team will review it and send a quote within one working day.",
  };
}

export async function updateB2BOrderAction(formData: FormData) {
  await requireAdmin();

  const id = clean(formData.get("id"), 80);
  const status = clean(formData.get("status"), 20) as B2BOrderStatus;
  const priceRaw = clean(formData.get("priceQuoted"), 20);
  if (!id || !b2bStatuses.includes(status)) return;

  const patch: {
    status: B2BOrderStatus;
    priceQuoted?: number;
  } = { status };

  if (priceRaw) {
    const price = Math.max(0, toInt(priceRaw, 0));
    if (price > 0) patch.priceQuoted = price;
  }

  const store = await getStore();
  await store.b2bOrders.update(id, patch);
  revalidatePath("/admin/b2b");
}
