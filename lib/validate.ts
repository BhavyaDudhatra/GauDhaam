export function clean(value: unknown, max = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function normalisePhone(value: string) {
  return value.replace(/[^\d+]/g, "").replace(/^\+91/, "").slice(-10);
}

export function isPhone(value: string) {
  return /^[6-9]\d{9}$/.test(normalisePhone(value));
}

export function isPincode(value: string) {
  return /^[1-9]\d{5}$/.test(value);
}

export function toInt(value: unknown, fallback = 0) {
  const number = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(number) ? number : fallback;
}

export function toBool(value: unknown) {
  return value === "on" || value === "true" || value === "1";
}
