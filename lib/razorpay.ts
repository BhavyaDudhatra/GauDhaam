import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.razorpay.com/v1";

export function isRazorpayConfigured() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
  );
}

/**
 * Payment simulation is only available on a non-production server without
 * Razorpay keys, so a live store can never silently accept unpaid orders.
 */
export function isPaymentSimulationAllowed() {
  return !isRazorpayConfigured() && process.env.NODE_ENV !== "production";
}

export function razorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID ?? "";
}

function authHeader() {
  const id = process.env.RAZORPAY_KEY_ID ?? "";
  const secret = process.env.RAZORPAY_KEY_SECRET ?? "";
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
};

export async function createRazorpayOrder(input: {
  amount: number; // paise
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay is not configured");
  }

  const response = await fetch(`${API}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: "INR",
      receipt: input.receipt,
      notes: input.notes,
      payment_capture: 1,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Razorpay order failed", response.status, detail);
    throw new Error("Could not start the payment. Please try again.");
  }

  return (await response.json()) as RazorpayOrder;
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function verifyPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  return safeEqual(expected, input.signature);
}

export function verifyWebhookSignature(body: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return safeEqual(expected, signature);
}
