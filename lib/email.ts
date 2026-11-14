import { randomInt } from "node:crypto";
import * as speakeasy from "speakeasy";
import QRCode from "qrcode";

export function generateOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function generateTotpSecret(email: string) {
  return speakeasy.generateSecret({
    name: `GauDhaam (${email})`,
    issuer: "GauDhaam",
    length: 20,
  });
}

export async function generateTotpQrDataUrl(secret: string, email: string) {
  const otpauth = `otpauth://totp/GauDhaam:${encodeURIComponent(email)}?secret=${secret}&issuer=GauDhaam&period=30&digits=6`;
  return QRCode.toDataURL(otpauth);
}

export function generateTotpCode(secret: string) {
  return speakeasy.totp({
    secret,
    encoding: "base32",
    step: 30,
    digits: 6,
  });
}

export function verifyTotpCode(secret: string, token: string) {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: String(token).replace(/\D/g, ""),
    step: 30,
    digits: 6,
    window: 1,
  });
}

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || "GauDhaam <gaudhaamorganic@gmail.com>";

  if (!host || !user || !pass) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Email verification is not configured (SMTP env vars missing).",
      );
    }
    console.log(`[dev] Verification code for ${email}: ${code}`);
    return;
  }

  const { default: nodemailer } = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from,
    to: email,
    subject: `Your GauDhaam verification code`,
    html: `
      <div style="margin:0;padding:32px 16px;background:#FFF8EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#655B54;">
        <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #E9DFD0;border-radius:18px;overflow:hidden;">
          <div style="background:#496B45;padding:22px 28px;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">GauDhaam</p>
            <p style="margin:4px 0 0;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#DCE8D8;">From farm to Your place</p>
          </div>
          <div style="padding:28px;">
            <h1 style="margin:0;font-size:20px;color:#2F4930;">Verify your email</h1>
            <p style="margin:10px 0 0;font-size:14px;line-height:1.65;">Use the code below to finish creating your GauDhaam account.</p>
            <div style="margin:22px 0;background:#EAF1E5;border-radius:14px;padding:18px;text-align:center;">
              <span style="font-size:34px;font-weight:700;letter-spacing:10px;color:#2F4930;">${code}</span>
            </div>
            <p style="margin:0;font-size:13px;line-height:1.65;">This code expires in 10 minutes. If you did not ask for it, you can safely ignore this email.</p>
          </div>
          <div style="border-top:1px solid #E9DFD0;padding:16px 28px;font-size:11px;color:#8a807a;">
            GauDhaam · Made in small batches, sent from the farm.
          </div>
        </div>
      </div>
    `,
  });

  if (!info || info.accepted.length === 0) {
    console.error("SMTP send failed", info);
    if (process.env.NODE_ENV === "production") {
      throw new Error("We could not send the verification email. Please try again.");
    }
  }
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  total: number,
  items: { name: string; qty: number; price: number }[],
  createdAt?: string,
): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || "GauDhaam <gaudhaamorganic@gmail.com>";

  if (!host || !user || !pass) {
    if (process.env.NODE_ENV === "production") {
      console.error("SMTP not configured, skipping order email.");
    }
    return;
  }

  const { default: nodemailer } = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const itemRows = items
    .map(
      (item) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #E9DFD0;">${item.name}</td><td style="padding:8px;border-bottom:1px solid #E9DFD0;text-align:center;">${item.qty}</td><td style="padding:8px;border-bottom:1px solid #E9DFD0;text-align:right;">₹${item.price * item.qty}</td></tr>`,
    )
    .join("");

  await transporter.sendMail({
    from,
    to: email,
    subject: `Order confirmed — ${orderNumber}`,
    html: `
      <div style="margin:0;padding:32px 16px;background:#FFF8EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#655B54;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E9DFD0;border-radius:18px;overflow:hidden;">
          <div style="background:#496B45;padding:22px 28px;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">GauDhaam</p>
            <p style="margin:4px 0 0;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#DCE8D8;">From farm to Your place</p>
          </div>
          <div style="padding:28px;">
            <h1 style="margin:0;font-size:20px;color:#2F4930;">Order confirmed!</h1>
            <p style="margin:10px 0 0;font-size:14px;line-height:1.65;">Thank you for your order. Here's a summary:</p>
            <p style="margin:8px 0 0;font-size:13px;font-weight:600;color:#2F4930;">Order: ${orderNumber}</p>
            ${createdAt ? `<p style="margin:4px 0 0;font-size:12px;color:#8a807a;">Date: ${new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} at ${new Date(createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>` : ""}
            <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;">
              <thead><tr style="background:#EAF1E5;"><th style="padding:8px;text-align:left;">Item</th><th style="padding:8px;text-align:center;">Qty</th><th style="padding:8px;text-align:right;">Amount</th></tr></thead>
              <tbody>${itemRows}</tbody>
              <tfoot><tr><td colspan="2" style="padding:8px;font-weight:700;">Total</td><td style="padding:8px;text-align:right;font-weight:700;">₹${total}</td></tr></tfoot>
            </table>
            <p style="margin:0;font-size:13px;line-height:1.65;">We'll notify you when your order is packed and shipped. Track your order anytime from your account.</p>
          </div>
          <div style="border-top:1px solid #E9DFD0;padding:16px 28px;font-size:11px;color:#8a807a;">
            GauDhaam · Made in small batches, sent from the farm.
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendOrderStatusEmail(
  email: string,
  orderNumber: string,
  status: string,
): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || "GauDhaam <gaudhaamorganic@gmail.com>";

  if (!host || !user || !pass) {
    if (process.env.NODE_ENV === "production") {
      console.error("SMTP not configured, skipping status email.");
    }
    return;
  }

  const { default: nodemailer } = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const statusMessages: Record<string, string> = {
    packed: "Your order has been packed and is ready for dispatch.",
    shipped: "Your order is on its way! Track it in your account.",
    delivered: "Your order has been delivered. Enjoy!",
    cancelled: "Your order has been cancelled.",
  };

  const message = statusMessages[status] || `Your order status has been updated to: ${status}.`;

  await transporter.sendMail({
    from,
    to: email,
    subject: `Order ${orderNumber} — ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html: `
      <div style="margin:0;padding:32px 16px;background:#FFF8EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#655B54;">
        <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #E9DFD0;border-radius:18px;overflow:hidden;">
          <div style="background:#496B45;padding:22px 28px;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">GauDhaam</p>
          </div>
          <div style="padding:28px;">
            <h1 style="margin:0;font-size:20px;color:#2F4930;">Order Update</h1>
            <p style="margin:10px 0 0;font-size:14px;line-height:1.65;">${message}</p>
            <p style="margin:8px 0 0;font-size:13px;font-weight:600;color:#2F4930;">Order: ${orderNumber}</p>
            <p style="margin:16px 0 0;font-size:13px;line-height:1.65;">Track your order anytime from your account dashboard.</p>
          </div>
          <div style="border-top:1px solid #E9DFD0;padding:16px 28px;font-size:11px;color:#8a807a;">
            GauDhaam · Made in small batches, sent from the farm.
          </div>
        </div>
      </div>
    `,
  });
}