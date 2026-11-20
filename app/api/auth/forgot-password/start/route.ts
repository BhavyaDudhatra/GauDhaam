import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { getDb } from "@/lib/firebase";
import { generateOtp, sendOtpEmail } from "@/lib/email";
import { clean, isEmail } from "@/lib/validate";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
  "Content-Type": "application/json",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const email = clean(body?.email, 200).toLowerCase();
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400, headers: corsHeaders });
    }

    const store = await getStore();
    const user = await store.users.findByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "No account found for this email." }, { status: 404, headers: corsHeaders });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured." }, { status: 500, headers: corsHeaders });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await db.collection("password_resets").doc(email).set({
      email, code, expiresAt, attempts: 0, createdAt: new Date().toISOString(),
    });
    try {
      await sendOtpEmail(email, code);
    } catch (e) {
      console.error("sendOtpEmail failed", e);
    }

    return NextResponse.json({ step: "otp", email, expiresAt: Date.now() + 5 * 60 * 1000 }, { headers: corsHeaders });
  } catch (e) {
    console.error("forgot-password/start error", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500, headers: corsHeaders });
  }
}
