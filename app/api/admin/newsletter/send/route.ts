import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { getDb } from "@/lib/firebase";
import { requireAdmin } from "@/lib/auth";
import { clean } from "@/lib/validate";

export async function POST(request: Request) {
  await requireAdmin();
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const subject = clean(payload.subject, 200);
  const body = clean(payload.body, 5000);
  const type = clean(payload.type, 20) || "general"; // general, new_product, new_service, offer

  if (!subject || !body) {
    return NextResponse.json({ error: "Subject and body required." }, { status: 400 });
  }

  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const snap = await db.collection("newsletter").where("active", "==", true).get();
  const subscribers = snap.docs.map((d) => d.data().email as string).filter(Boolean);

  if (subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: "No subscribers." });
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || "GauDhaam <gaudhaamorganic@gmail.com>";

  if (!host || !user || !pass) {
    return NextResponse.json({ error: "SMTP not configured." }, { status: 500 });
  }

  const { default: nodemailer } = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  let sent = 0;
  for (const sub of subscribers) {
    try {
      await transporter.sendMail({
        from,
        to: sub,
        subject,
        html: `
          <div style="margin:0;padding:32px 16px;background:#FFF8EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#655B54;">
            <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E9DFD0;border-radius:18px;overflow:hidden;">
              <div style="background:#496B45;padding:22px 28px;">
                <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">GauDhaam</p>
                <p style="margin:4px 0 0;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#DCE8D8;">From farm to Your place</p>
              </div>
              <div style="padding:28px;">
                <h1 style="margin:0;font-size:20px;color:#2F4930;">${subject}</h1>
                <div style="margin:10px 0 0;font-size:14px;line-height:1.65;">${body.replace(/\n/g, "<br/>")}</div>
              </div>
              <div style="border-top:1px solid #E9DFD0;padding:16px 28px;font-size:11px;color:#8a807a;">
                GauDhaam · Made in small batches, sent from the farm. <a href="mailto:gaudhaamorganic@gmail.com?subject=Unsubscribe" style="color:#496B45;">Unsubscribe</a>
              </div>
            </div>
          </div>
        `,
      });
      sent++;
    } catch (e) {
      console.error(`Failed to send to ${sub}:`, e);
    }
  }

  return NextResponse.json({ ok: true, sent, total: subscribers.length });
}
