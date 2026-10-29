"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { clean } from "@/lib/validate";
import type { FormState } from "./state";

export async function addAddressAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireUser();
  const store = await getStore();

  const label = clean(formData.get("label"), 40);
  const name = clean(formData.get("name"), 120);
  const phone = clean(formData.get("phone"), 20);
  const line1 = clean(formData.get("line1"), 200);
  const line2 = clean(formData.get("line2") ?? "", 200);
  const city = clean(formData.get("city"), 80);
  const state = clean(formData.get("state"), 80);
  const pincode = clean(formData.get("pincode"), 10);
  const isDefault = formData.get("isDefault") === "on";

  if (!label || !name || !phone || !line1 || !city || !state || !pincode) {
    return { error: "Please fill all required address fields." };
  }

  const user = await store.users.get(session.id);
  if (!user) return { error: "User not found." };

  const addresses = user.addresses ?? [];
  const id = `addr-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  const newAddr = { id, label, name, phone, line1, line2, city, state, pincode, isDefault };

  const updatedAddresses = isDefault
    ? [newAddr, ...addresses.map(a => ({ ...a, isDefault: false }))]
    : [...addresses, newAddr];

  await store.users.update(session.id, { addresses: updatedAddresses });
  revalidatePath("/account");
  return { success: "Address added." };
}

export async function updateAddressAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireUser();
  const store = await getStore();

  const id = clean(formData.get("id"), 80);
  const label = clean(formData.get("label"), 40);
  const name = clean(formData.get("name"), 120);
  const phone = clean(formData.get("phone"), 20);
  const line1 = clean(formData.get("line1"), 200);
  const line2 = clean(formData.get("line2") ?? "", 200);
  const city = clean(formData.get("city"), 80);
  const state = clean(formData.get("state"), 80);
  const pincode = clean(formData.get("pincode"), 10);
  const isDefault = formData.get("isDefault") === "on";

  if (!id) return { error: "Address ID missing." };

  const user = await store.users.get(session.id);
  if (!user || !user.addresses) return { error: "Address not found." };

  const updated = user.addresses.map(a => {
    if (a.id !== id) return a;
    return { ...a, label, name, phone, line1, line2, city, state, pincode, isDefault };
  });

  const final = isDefault ? updated.map(a => ({ ...a, isDefault: a.id === id })) : updated;
  
  await store.users.update(session.id, { addresses: final });
  revalidatePath("/account");
  return { success: "Address updated." };
}

export async function deleteAddressAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireUser();
  const store = await getStore();

  const id = clean(formData.get("id"), 80);
  const user = await store.users.get(session.id);
  if (!user || !user.addresses) return { error: "Address not found." };

  const filtered = user.addresses.filter(a => a.id !== id);
  await store.users.update(session.id, { addresses: filtered });
  revalidatePath("/account");
  return { success: "Address removed." };
}

export async function setDefaultAddressAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireUser();
  const store = await getStore();

  const id = clean(formData.get("id"), 80);
  const user = await store.users.get(session.id);
  if (!user || !user.addresses) return { error: "Address not found." };

  const updated = user.addresses.map(a => ({ ...a, isDefault: a.id === id }));
  await store.users.update(session.id, { addresses: updated });
  revalidatePath("/account");
  return { success: "Default address updated." };
}
