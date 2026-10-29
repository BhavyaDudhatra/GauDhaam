import { randomInt } from "node:crypto";
import * as speakeasy from "speakeasy";
import QRCode from "qrcode";

export function generateOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function generateTotpSecret(email: string) {
  return speakeasy.generateSecret({
    name: `Gaudham (${email})`,
    issuer: "Gaudham",
    length: 20,
  });
}

export async function generateTotpQrDataUrl(secret: string, email: string) {
  const otpauth = `otpauth://totp/Gaudham:${encodeURIComponent(email)}?secret=${secret}&issuer=Gaudham&period=30&digits=6`;
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
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Gaudham <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Email verification is not configured (RESEND_API_KEY is missing).",
      );
    }
    console.log(`[dev] Verification code for ${email}: ${code}`);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `${code} is your Gaudham verification code`,
    html: `
      <div style="margin:0;padding:32px 16px;background:#FFF8EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#655B54;">
        <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #E9DFD0;border-radius:18px;overflow:hidden;">
          <div style="background:#496B45;padding:22px 28px;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Gaudham</p>
            <p style="margin:4px 0 0;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#DCE8D8;">Pure by nature</p>
          </div>
          <div style="padding:28px;">
            <h1 style="margin:0;font-size:20px;color:#2F4930;">Verify your email</h1>
            <p style="margin:10px 0 0;font-size:14px;line-height:1.65;">Use the code below to finish creating your Gaudham account.</p>
            <div style="margin:22px 0;background:#EAF1E5;border-radius:14px;padding:18px;text-align:center;">
              <span style="font-size:34px;font-weight:700;letter-spacing:10px;color:#2F4930;">${code}</span>
            </div>
            <p style="margin:0;font-size:13px;line-height:1.65;">This code expires in 10 minutes. If you did not ask for it, you can safely ignore this email.</p>
          </div>
          <div style="border-top:1px solid #E9DFD0;padding:16px 28px;font-size:11px;color:#8a807a;">
            Gaudham · Made in small batches, sent from the farm.
          </div>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error", error);
    if (process.env.NODE_ENV === "production") {
      throw new Error("We could not send the verification email. Please try again.");
    }
    console.log(`[dev] Skipping email send for ${email} due to Resend error. Code: ${code}`);
    return;
  }
}
