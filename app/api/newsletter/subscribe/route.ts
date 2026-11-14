import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { getDb } from "@/lib/firebase";
import { clean } from "@/lib/validate";

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = clean(payload.email, 200).toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const db = await getDb();
  if (!db) {
    return NextResponse.json({ ok: true, message: "Subscribed (local mode)." });
  }

  const ref = db.collection("newsletter").doc(email);
  const existing = await ref.get();
  if (existing.exists) {
    return NextResponse.json({ ok: true, message: "You're already subscribed!" });
  }

  await ref.set({
    email,
    createdAt: new Date().toISOString(),
    active: true,
  });

  // Send welcome email
  try {
    const { sendOtpEmail } = await import("@/lib/email");
    // Reuse OTP email template style for welcome
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || "GauDhaam <gaudhaamorganic@gmail.com>";
    if (host && user && pass) {
      const { default: nodemailer } = await import("nodemailer");
      const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
      await transporter.sendMail({
        from,
        to: email,
        subject: "Welcome to GauDhaam Newsletter",
        html: `<div style="margin:0;padding:32px 16px;background:#FFF8EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#655B54;">
          <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #E9DFD0;border-radius:18px;overflow:hidden;">
            <div style="background:#496B45;padding:22px 28px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">GauDhaam</p>
              <p style="margin:4px 0 0;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#DCE8D8;">From farm to Your place</p>
            </div>
            <div style="padding:28px;">
              <h1 style="margin:0;font-size:20px;color:#2F4930;">Welcome!</h1>
              <p style="margin:10px 0 0;font-size:14px;line-height:1.65;">Thank you for subscribing to the GauDhaam newsletter. You'll receive updates on new products, special offers, and farm news.</p>
            </div>
            <div style="border-top:1px solid #E9DFD0;padding:16px 28px;font-size:11px;color:#8a807a;">
              GauDhaam · Made in small batches, sent from the farm.
            </div>
          </div>
        </div>`,
      });
    }
  } catch (e) {
    console.error("Failed to send welcome email:", e);
  }

  return NextResponse.json({ ok: true, message: "Thanks for subscribing!" });
}
