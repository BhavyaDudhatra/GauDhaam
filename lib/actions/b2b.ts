"use server";

import { revalidatePath } from "next/cache";
import { getSession, requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { parseFrequency } from "@/lib/subscriptions";
import { clean, isEmail, isPhone, normalisePhone, toInt } from "@/lib/validate";
import type { FormState } from "./state";
import type { B2BOrderStatus } from "@/lib/types";
import { getDb } from "@/lib/firebase";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDJR8t41dcVSIz9J4QLKXf85zpJV6F1O0k';

async function geocode(address: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK' || !data.results[0]) return null;
  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}
async function distanceMatrix(origins: {lat:number,lng:number}[], destination:{lat:number,lng:number}) {
  const originsParam = origins.map(o => `${o.lat},${o.lng}`).join('|');
  const destParam = `${destination.lat},${destination.lng}`;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsParam}&destinations=${destParam}&units=metric&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  return res.json();
}
async function computeDeliveryCharge(address: string) {
  const db = await getDb();
  if (!db) return { charge: 0, distance: 0 };
  const branchesSnap = await db.collection('branches').get();
  const branches = branchesSnap.docs.map(d=>({id:d.id,...d.data() as any}));
  if (!branches.length) return { charge:0, distance:0 };
  const dest = await geocode(address);
  if (!dest) return { charge:0, distance:0 };
  const origins = branches.map(b=>({lat:b.lat,lng:b.lng}));
  const dm = await distanceMatrix(origins, dest);
  let best = {distance:Infinity};
  dm.rows?.forEach((row:any)=>{const e=row.elements[0]; if(e.status==='OK'){const meters=e.distance.value; if(meters<best.distance) best.distance=meters/1000;}});
  const configSnap = await db.collection('config').doc('delivery').get();
  const config = configSnap.exists ? configSnap.data() as any : {baseFee:0, perKmRate:0};
  const baseFee = Number(config.baseFee||0);
  const perKmRate = Number(config.perKmRate||0);
  const distanceKm = best.distance;
  const charge = baseFee + distanceKm * perKmRate;
  return { charge: Math.round(charge), distance: distanceKm };
}

const b2bStatuses: B2BOrderStatus[] = [
  "pending",
  "quoted",
  "confirmed",
  "rejected",
  "completed",
];

export async function submitB2BRequestAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const orderType = clean(formData.get("orderType"), 20);
  const fullName = clean(formData.get("fullName"), 120);
  const phone = normalisePhone(clean(formData.get("phone"), 20));
  const gstNumber = clean(formData.get("gstNumber"), 20).toUpperCase();
  const pickupOption = clean(formData.get("pickupOption"), 20);
  const address = clean(formData.get("address"), 500);
  const deadline = clean(formData.get("deadline"), 20);
  const itemName = clean(formData.get("itemName"), 200);
  const quantityRaw = clean(formData.get("quantity"), 10);
  const notes = clean(formData.get("notes"), 1200);

  if (!['bulk','hamper'].includes(orderType)) return { error: "Choose order type." };
  if (fullName.length < 2) return { error: "Enter full name." };
  if (!isPhone(phone)) return { error: "Enter valid 10-digit mobile." };
  if (!['self','delivery'].includes(pickupOption)) return { error: "Choose pickup option." };
  if (pickupOption === 'delivery' && address.length < 10) return { error: "Enter delivery address." };
  if (!deadline) return { error: "Select delivery deadline." };
  if (!itemName) return { error: "Enter item name." };
  const quantity = Number(quantityRaw);
  if (!quantity || quantity < 1) return { error: "Enter valid quantity." };

  let deliveryCharge = 0;
  let distanceKm = 0;
  if (pickupOption === 'delivery') {
    const result = await computeDeliveryCharge(address);
    deliveryCharge = result.charge;
    distanceKm = result.distance;
  }

  const store = await getStore();
  const session = await getSession();
  await store.b2bOrders.create({
    userId: session?.id ?? null,
    orderType,
    fullName,
    phone,
    gstNumber: gstNumber || undefined,
    pickupOption,
    address: pickupOption === 'delivery' ? address : '',
    deadline,
    itemName,
    quantity,
    notes,
    deliveryCharge,
    distanceKm,
    status: 'pending',
  });

  revalidatePath("/admin/b2b");
  return {
    success: pickupOption === 'self' 
      ? "Your B2B request is received. Our team will contact you for self-pickup details."
      : `Your B2B request is received. Estimated delivery charge is ₹${deliveryCharge}. Our team will confirm.`,
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

export async function payB2BOrderAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const id = clean(formData.get("id"), 80);
  const store = await getStore();
  const order = await store.b2bOrders.get(id);
  if (!order || order.userId !== session.id) {
    throw new Error("Order not found");
  }
  if (!order.priceQuoted) {
    throw new Error("No price quoted");
  }
  // Create Razorpay order
  const { createRazorpayOrder, razorpayKeyId } = await import("@/lib/razorpay");
  const amount = Math.round((order.priceQuoted + (order.deliveryCharge || 0)) * 100);
  const rzpOrder = await createRazorpayOrder(amount, `B2B-${order.id}`);
  // Store payment reference
  const db = await getDb();
  if (db) {
    await db.collection("b2bOrders").doc(id).update({
      razorpayOrderId: rzpOrder.id,
      paymentStatus: "pending",
    });
  }
  // Redirect to Razorpay checkout
  const redirectUrl = `https://checkout.razorpay.com/v1/checkout.js?key_id=${razorpayKeyId}&order_id=${rzpOrder.id}&amount=${amount}&currency=INR&name=GauDhaam&description=B2B Order ${order.id}`;
  // For simplicity, redirect to a placeholder page
  const { redirect } = await import("next/navigation");
  redirect(`/b2b/pay/${id}?rzp=${rzpOrder.id}`);
}
