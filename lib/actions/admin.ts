"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { orderStatuses } from "@/lib/site";
import { slugify } from "@/lib/slug";
import { clean, toBool, toInt } from "@/lib/validate";
import type { FormState } from "./state";
import type {
  Coupon,
  Offer,
  OrderStatus,
  PaymentStatus,
  ProductVariant,
} from "@/lib/types";

function lines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseJson<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function parseImages(value: FormDataEntryValue | null, fallback: string) {
  const parsed = parseJson<unknown>(value, []);
  const images = Array.isArray(parsed)
    ? parsed.map((item) => String(item).trim()).filter(Boolean)
    : [];
  return images.length > 0 ? images : [fallback];
}

function cleanOffer(
  typeValue: FormDataEntryValue | null,
  valueValue: FormDataEntryValue | null,
  startValue: FormDataEntryValue | null,
  endValue: FormDataEntryValue | null,
  labelValue: FormDataEntryValue | null,
): Offer | null {
  const type = clean(typeValue, 20);
  if (type !== "percentage" && type !== "fixed") return null;
  const value = Math.max(0, toInt(valueValue, 0));
  if (value <= 0) return null;
  const startDate = clean(startValue, 30);
  const endDate = clean(endValue, 30);
  const label = clean(labelValue, 60);
  return {
    type,
    value: type === "percentage" ? Math.min(100, value) : value,
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...(label ? { label } : {}),
  };
}

function parseVariantOffer(raw: unknown): Offer | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const type = item.type;
  if (type !== "percentage" && type !== "fixed") return null;
  const value = Number(item.value);
  if (!Number.isFinite(value) || value <= 0) return null;
  return {
    type,
    value: type === "percentage" ? Math.min(100, Math.round(value)) : Math.round(value),
    ...(typeof item.label === "string" && item.label.trim()
      ? { label: item.label.trim() }
      : {}),
  };
}

function parseVariants(value: FormDataEntryValue | null): ProductVariant[] {
  const parsed = parseJson<unknown>(value, []);
  if (!Array.isArray(parsed)) return [];
  const variants: ProductVariant[] = [];
  for (let index = 0; index < parsed.length; index += 1) {
    const raw = parsed[index];
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    const label = String(item.label ?? "").trim().slice(0, 60);
    const price = Math.max(0, Math.round(Number(item.price)));
    const mrpRaw = item.mrp === null || item.mrp === "" ? null : Number(item.mrp);
    const mrp = Number.isFinite(mrpRaw) && Number(mrpRaw) > 0 ? Math.round(Number(mrpRaw)) : null;
    const stock = Math.max(0, Math.round(Number(item.stock)));
    const sku = String(item.sku ?? "").trim().slice(0, 40);
    if (!label || !Number.isFinite(price)) continue;
    variants.push({
      id: String(item.id ?? "").trim() || `variant-${index + 1}-${Date.now()}`,
      label,
      price,
      mrp,
      stock,
      active: item.active !== false,
      ...(sku ? { sku } : {}),
      offer: parseVariantOffer(item.offer),
    });
  }
  return variants;
}

export async function saveProductAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = clean(formData.get("id"), 80);
  const name = clean(formData.get("name"), 140);
  const category = clean(formData.get("category"), 60);
  const shortDescription = clean(formData.get("shortDescription"), 300);
  const description = clean(formData.get("description"), 6000);
  const highlights = lines(formData.get("highlights"));
  const ingredients = clean(formData.get("ingredients"), 2000);
  const howToUse = clean(formData.get("howToUse"), 2000);
  const featured = toBool(formData.get("featured"));
  const available = toBool(formData.get("available"));
  const requestedSlug = clean(formData.get("slug"), 100);
  const slug = slugify(requestedSlug || name);
  const variants = parseVariants(formData.get("variants"));
  const images = parseImages(formData.get("images"), "/assets/images/Ghee.jpg");
  const galleryImages = parseImages(formData.get("galleryImages"), "");
  const offer = cleanOffer(
    formData.get("offerType"),
    formData.get("offerValue"),
    formData.get("offerStart"),
    formData.get("offerEnd"),
    formData.get("offerLabel"),
  );

  if (name.length < 2) return { error: "Give the product a name." };
  if (!category) return { error: "Choose or type a category." };
  if (!slug) return { error: "The URL slug could not be created." };
  if (variants.length === 0) {
    return { error: "Add at least one size or pack option." };
  }
  for (const variant of variants) {
    if (variant.price <= 0) {
      return { error: `Set a selling price for “${variant.label}”.` };
    }
    if (variant.mrp !== null && variant.mrp < variant.price) {
      return {
        error: `MRP for “${variant.label}” cannot be lower than the selling price.`,
      };
    }
  }
  if (!shortDescription) {
    return { error: "Add a short description for the product card." };
  }

  const store = await getStore();
  const input = {
    name,
    slug,
    category,
    shortDescription,
    description,
    highlights,
    ingredients: ingredients || undefined,
    howToUse: howToUse || undefined,
    images,
    galleryImages: galleryImages.length ? galleryImages : undefined,
    variants,
    offer,
    featured,
    available,
  };

  if (id) {
    const updated = await store.products.update(id, input);
    if (!updated) return { error: "That product no longer exists." };
  } else {
    await store.products.create(input);
  }

  revalidatePath("/", "layout");
  revalidatePath("/products");
  redirect("/admin/products?saved=1");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 80);
  if (!id) return;
  const store = await getStore();
  await store.products.remove(id);
  revalidatePath("/", "layout");
  revalidatePath("/products");
  revalidatePath("/admin/products");
}

export async function toggleProductAction(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 80);
  if (!id) return;
  const available = clean(formData.get("available"), 10) === "true";
  const store = await getStore();
  await store.products.update(id, { available });
  revalidatePath("/", "layout");
  revalidatePath("/products");
  revalidatePath("/admin/products");
}

export async function saveServiceAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = clean(formData.get("id"), 80);
  const name = clean(formData.get("name"), 140);
  const tagline = clean(formData.get("tagline"), 240);
  const description = clean(formData.get("description"), 8000);
  const highlights = lines(formData.get("highlights"));
  const priceNote = clean(formData.get("priceNote"), 120);
  const active = toBool(formData.get("active"));
  const sort = toInt(formData.get("sort"), 99);
  const requestedSlug = clean(formData.get("slug"), 100);
  const slug = slugify(requestedSlug || name);
  const images = parseImages(formData.get("images"), "/assets/images/banner.jpg");
  const galleryImages = parseImages(formData.get("galleryImages"), "");

  if (name.length < 2) return { error: "Give the service a name." };
  if (!tagline) return { error: "Add a one-line tagline." };
  if (!slug) return { error: "The URL slug could not be created." };

  const store = await getStore();
  const input = {
    name,
    slug,
    tagline,
    description,
    highlights,
    images,
    galleryImages: galleryImages.length ? galleryImages : undefined,
    priceNote,
    active,
    sort,
  };

  if (id) {
    const updated = await store.services.update(id, input);
    if (!updated) return { error: "That service no longer exists." };
  } else {
    await store.services.create(input);
  }

  revalidatePath("/", "layout");
  revalidatePath("/services");
  redirect("/admin/services?saved=1");
}

export async function deleteServiceAction(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 80);
  if (!id) return;
  const store = await getStore();
  await store.services.remove(id);
  revalidatePath("/", "layout");
  revalidatePath("/services");
  revalidatePath("/admin/services");
}

export async function toggleServiceAction(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 80);
  if (!id) return;
  const active = clean(formData.get("active"), 10) === "true";
  const store = await getStore();
  await store.services.update(id, { active });
  revalidatePath("/", "layout");
  revalidatePath("/services");
  revalidatePath("/admin/services");
}

export async function saveCouponAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = clean(formData.get("id"), 80);
  const code = clean(formData.get("code"), 40).toUpperCase().replace(/\s+/g, "");
  const description = clean(formData.get("description"), 200);
  const typeRaw = clean(formData.get("type"), 20);
  const type: Coupon["type"] = typeRaw === "fixed" ? "fixed" : "percentage";
  const value = Math.max(0, toInt(formData.get("value"), 0));
  const minOrderValue = Math.max(0, toInt(formData.get("minOrderValue"), 0));
  const maxDiscountRaw = clean(formData.get("maxDiscount"), 20);
  const maxDiscount = maxDiscountRaw ? Math.max(0, toInt(maxDiscountRaw, 0)) : null;
  const usageLimitRaw = clean(formData.get("usageLimit"), 20);
  const usageLimit = usageLimitRaw ? Math.max(1, toInt(usageLimitRaw, 1)) : null;
  const active = toBool(formData.get("active"));
  const startDate = clean(formData.get("startDate"), 30);
  const endDate = clean(formData.get("endDate"), 30);

  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
    return { error: "Use 3–30 letters, numbers, dashes or underscores for the code." };
  }
  if (value <= 0) return { error: "Set a discount value." };
  if (type === "percentage" && value > 100) {
    return { error: "A percentage discount cannot exceed 100." };
  }

  const store = await getStore();
  const clash = await store.coupons.getByCode(code);
  if (clash && clash.id !== id) {
    return { error: "That coupon code already exists." };
  }

  const input = {
    code,
    description,
    type,
    value,
    minOrderValue,
    maxDiscount,
    usageLimit,
    active,
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };

  if (id) {
    const updated = await store.coupons.update(id, input);
    if (!updated) return { error: "That coupon no longer exists." };
  } else {
    await store.coupons.create(input);
  }

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons?saved=1");
}

export async function deleteCouponAction(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 80);
  if (!id) return;
  const store = await getStore();
  await store.coupons.remove(id);
  revalidatePath("/admin/coupons");
}

export async function toggleCouponAction(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 80);
  if (!id) return;
  const active = clean(formData.get("active"), 10) === "true";
  const store = await getStore();
  await store.coupons.update(id, { active });
  revalidatePath("/admin/coupons");
}

export async function updateOrderAction(formData: FormData) {
  await requireAdmin();

  const id = clean(formData.get("id"), 80);
  const status = clean(formData.get("status"), 30) as OrderStatus;
  const paymentStatus = clean(formData.get("paymentStatus"), 30) as PaymentStatus;
  const notes = clean(formData.get("notes"), 600);

  if (!id) return;
  if (!orderStatuses.includes(status)) return;
  if (!["created", "paid", "failed", "refunded"].includes(paymentStatus)) return;

  const store = await getStore();
  const existing = await store.orders.get(id);
  if (!existing) return;

  await store.orders.update(id, {
    status,
    notes,
    payment: {
      status: paymentStatus,
      razorpayOrderId: existing.payment.razorpayOrderId,
      razorpayPaymentId: existing.payment.razorpayPaymentId,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/order/${id}`);
  redirect(`/admin/orders/${id}?updated=1`);
}

export async function markMessageReadAction(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 80);
  if (!id) return;
  const store = await getStore();
  await store.messages.markRead(id);
  revalidatePath("/admin/messages");
}

export async function deleteMessageAction(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 80);
  if (!id) return;
  const store = await getStore();
  await store.messages.remove(id);
  revalidatePath("/admin/messages");
}

export async function deleteUser(formData: FormData) {
  const session = await requireAdmin();
  const id = clean(formData.get("id"), 80);
  if (!id) return;

  const store = await getStore();
  const user = await store.users.get(id);
  if (!user) return;

  // Prevent deletion of admin users or self-deletion
  if (user.role === "admin") return;
  if (user.id === session.id) return;

  await store.users.remove(id);
  revalidatePath("/admin/users");
}

export async function createGalleryItemAction(formData: FormData) {
  await requireAdmin();
  const title = clean(formData.get("title"), 200);
  const image = clean(formData.get("image"), 1000);
  if (!title || !image) return;
  const store = await getStore();
  await store.gallery.create({ title, image });
  revalidatePath("/admin/gallery");
  revalidatePath("/about");
}

export async function deleteGalleryItemAction(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 80);
  if (!id) return;
  const store = await getStore();
  await store.gallery.remove(id);
  revalidatePath("/admin/gallery");
  revalidatePath("/about");
}

export async function createEventAction(formData: FormData) {
  await requireAdmin();
  const title = clean(formData.get("title"), 200);
  const description = clean(formData.get("description"), 2000);
  const date = clean(formData.get("date"), 50);
  const imagesRaw = clean(formData.get("images"), 5000);
  const images = imagesRaw.split(",").map(s=>s.trim()).filter(Boolean);
  const category = clean(formData.get("category"), 100);
  if (!title || !date) return;
  const store = await getStore();
  await store.events.create({ title, description, date, images, category: category || undefined });
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function deleteEventAction(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 80);
  if (!id) return;
  const store = await getStore();
  await store.events.remove(id);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}
