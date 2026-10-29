import { clean, isPhone, isPincode, normalisePhone } from "@/lib/validate";
import type {
  Address,
  PausedInterval,
  Product,
  SubscriptionFrequency,
} from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function pad2(value: number) {
  return String(value).padStart(2, "0");
}

/** Local calendar key (`YYYY-MM-DD`) — avoids UTC off-by-one drift. */
export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseDateKey(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function isDateKey(value: string | null | undefined) {
  return parseDateKey(value) !== null;
}

export function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

export function isMonthKey(value: string | null | undefined) {
  return Boolean(value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value));
}

export function shiftMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + delta, 1);
  return currentMonthKey(date);
}

export function monthLabel(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1));
}

function monthBounds(month: string) {
  if (!isMonthKey(month)) return null;
  const [year, monthNumber] = month.split("-").map(Number);
  const start = new Date(year, monthNumber - 1, 1);
  const end = new Date(year, monthNumber, 0);
  return { start, end };
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Delivery dates for one subscription inside a calendar month. Weekly plans
 * stay anchored to the start date; monthly plans keep the start day of month
 * (clamped for short months).
 */
export function deliveryDatesForMonth(
  startDate: string,
  frequency: SubscriptionFrequency,
  month: string,
): string[] {
  const bounds = monthBounds(month);
  if (!bounds) return [];
  const start = parseDateKey(startDate) ?? bounds.start;
  const dates = new Set<string>();

  if (frequency === "weekly") {
    let cursor = start;
    while (cursor < bounds.start) cursor = addDays(cursor, 7);
    while (cursor <= bounds.end) {
      dates.add(toDateKey(cursor));
      cursor = addDays(cursor, 7);
    }
  } else if (frequency === "monthly") {
    const targetDay = start.getDate();
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= bounds.end) {
      const year = cursor.getFullYear();
      const monthIndex = cursor.getMonth();
      const date = new Date(
        year,
        monthIndex,
        Math.min(targetDay, daysInMonth(year, monthIndex)),
      );
      if (date >= start && date >= bounds.start && date <= bounds.end) {
        dates.add(toDateKey(date));
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    let cursor = start > bounds.start ? start : bounds.start;
    while (cursor <= bounds.end) {
      dates.add(toDateKey(cursor));
      cursor = addDays(cursor, 1);
    }
  }

  return [...dates].sort();
}

export function isPausedOn(date: string, intervals: PausedInterval[]) {
  return intervals.some(
    (interval) =>
      Boolean(interval.startDate) &&
      Boolean(interval.endDate) &&
      date >= interval.startDate &&
      date <= interval.endDate,
  );
}

/** Inclusive calendar days between two date keys, capped to a year. */
export function daysBetween(startDate: string, endDate: string) {
  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);
  if (!start || !end || end < start) return [];
  const days: string[] = [];
  let cursor = start;
  while (cursor <= end && days.length < 366) {
    days.push(toDateKey(cursor));
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function daysBetweenCount(startDate: string, endDate: string) {
  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);
  if (!start || !end || end < start) return 0;
  return Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
}

export function productUnitPrice(product: Product | null | undefined) {
  if (!product) return 0;
  const variants = product.variants ?? [];
  const variant =
    variants.find((item) => item.active && item.price > 0) ??
    variants.find((item) => item.price > 0);
  return variant ? Math.max(0, Math.round(variant.price)) : 0;
}

export function parseFrequency(value: unknown): SubscriptionFrequency | null {
  return value === "daily" || value === "weekly" || value === "monthly"
    ? value
    : null;
}

export function normalizeAddress(input: unknown): {
  address: Address | null;
  error: string | null;
} {
  const raw = (input && typeof input === "object" ? input : {}) as Record<
    string,
    unknown
  >;
  const address: Address = {
    name: clean(raw.name, 80),
    phone: normalisePhone(clean(raw.phone, 20)),
    line1: clean(raw.line1, 160),
    line2: clean(raw.line2, 160),
    city: clean(raw.city, 80),
    state: clean(raw.state, 80),
    pincode: clean(raw.pincode, 10),
  };

  if (address.name.length < 2) return { address: null, error: "Add a delivery name." };
  if (!isPhone(address.phone)) {
    return { address: null, error: "Enter a valid 10-digit mobile number." };
  }
  if (address.line1.length < 5) {
    return { address: null, error: "Add the street or building address." };
  }
  if (!address.city) return { address: null, error: "Add the delivery city." };
  if (!address.state) return { address: null, error: "Add the delivery state." };
  if (!isPincode(address.pincode)) {
    return { address: null, error: "Enter a valid 6-digit PIN code." };
  }
  return { address, error: null };
}

export function addressLines(address: Address) {
  return [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.pincode}`,
  ].filter(Boolean);
}
