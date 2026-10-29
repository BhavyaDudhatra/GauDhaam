export type FormState = {
  error?: string;
  success?: string;
  /** Used by the two-step signup flow. */
  step?: "otp";
  email?: string;
  qrDataUrl?: string;
} | null;
