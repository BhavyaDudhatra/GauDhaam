import type { Store } from "@/lib/types";
import {
  daysBetween,
  deliveryDatesForMonth,
  isPausedOn,
  productUnitPrice,
  toDateKey,
} from "@/lib/subscriptions";
import { generateTotpCode, generateTotpSecret, verifyTotpCode } from "@/lib/email";
import { seedProducts } from "./seed";
import { seedServices } from "./seed";
import { seedCoupons } from "./seed";
import { buildSeedAdmin } from "./seed";

const nowIso = new Date().toISOString();

function localId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createFallbackStore(): Store {
  const admin = buildSeedAdmin();
  const products = seedProducts.map((input, i) => ({
    ...input,
    id: `seed-p-${i}`,
    createdAt: new Date(Date.now() - i * 1000).toISOString(),
    updatedAt: nowIso,
  })) as any[];
  const services = seedServices.map((input, i) => ({
    ...input,
    id: `seed-s-${i}`,
    createdAt: nowIso,
    updatedAt: nowIso,
  })) as any[];
  const coupons = seedCoupons.map((input, i) => ({
    ...input,
    id: `seed-c-${i}`,
    usedCount: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  })) as any[];
  const users = [admin as any];
  const orders: any[] = [];
  const feedback: any[] = [];
  const messages: any[] = [];
  const subscriptions: any[] = [];
  const dailyDeliveries: any[] = [];
  const b2bOrders: any[] = [];

  return {
    ready: async () => {},
    products: {
      list: async (options?: any) => {
        const items = options?.includeUnavailable ? products : products.filter((p) => p.available !== false);
        return items as any;
      },
      get: async (id: string) => products.find((p) => p.id === id) ?? null,
      getBySlug: async (slug: string) => products.find((p) => p.slug === slug) ?? null,
      create: async (input: any) => {
        const p = { ...input, id: `local-${Date.now()}`, createdAt: nowIso, updatedAt: nowIso };
        products.push(p);
        return p;
      },
      update: async (id: string, patch: any) => {
        const idx = products.findIndex((p) => p.id === id);
        if (idx === -1) return null;
        products[idx] = { ...products[idx], ...patch, updatedAt: nowIso };
        return products[idx];
      },
      remove: async (id: string) => {
        const idx = products.findIndex((p) => p.id === id);
        if (idx >= 0) products.splice(idx, 1);
      },
    },
    services: {
      list: async (options?: any) => {
        const items = options?.includeInactive ? services : services.filter((s) => s.active !== false);
        return items as any;
      },
      get: async (id: string) => services.find((s) => s.id === id) ?? null,
      getBySlug: async (slug: string) => services.find((s) => s.slug === slug) ?? null,
      create: async (input: any) => {
        const s = { ...input, id: `local-${Date.now()}`, createdAt: nowIso, updatedAt: nowIso };
        services.push(s);
        return s;
      },
      update: async (id: string, patch: any) => {
        const idx = services.findIndex((s) => s.id === id);
        if (idx === -1) return null;
        services[idx] = { ...services[idx], ...patch, updatedAt: nowIso };
        return services[idx];
      },
      remove: async (id: string) => {
        const idx = services.findIndex((s) => s.id === id);
        if (idx >= 0) services.splice(idx, 1);
      },
    },
    users: {
      list: async () => users as any,
      get: async (id: string) => users.find((u) => u.id === id) ?? null,
      findByEmail: async (email: string) => users.find((u) => u.email === email.toLowerCase()) ?? null,
      create: async (input: any) => {
        const u = { ...input, id: `local-${Date.now()}`, createdAt: nowIso };
        users.push(u);
        return u;
      },
      update: async (id: string, patch: any) => {
        const idx = users.findIndex((u) => u.id === id);
        if (idx === -1) return null;
        users[idx] = { ...users[idx], ...patch };
        return users[idx];
      },
      remove: async (id: string) => {
        const idx = users.findIndex((u) => u.id === id);
        if (idx >= 0) users.splice(idx, 1);
      },
    },
    orders: {
      create: async (input: any) => {
        const o = { ...input, id: `local-${Date.now()}`, number: `GD-${Date.now().toString().slice(-6)}`, stockRestored: false, createdAt: nowIso, updatedAt: nowIso };
        orders.push(o);
        return o;
      },
      get: async (id: string) => orders.find((o: any) => o.id === id) ?? null,
      list: async (options?: any) => {
        let items = orders;
        if (options?.userId) items = items.filter((o: any) => o.userId === options.userId);
        return items;
      },
      update: async (id: string, patch: any) => {
        const idx = orders.findIndex((o: any) => o.id === id);
        if (idx === -1) return null;
        orders[idx] = { ...orders[idx], ...patch, updatedAt: nowIso };
        return orders[idx];
      },
      markPaid: async (id: string) => {
        const idx = orders.findIndex((o: any) => o.id === id);
        if (idx === -1) return null;
        orders[idx] = { ...orders[idx], payment: { ...(orders[idx].payment || {}), status: "paid" }, status: orders[idx].status === "pending" ? "paid" : orders[idx].status, updatedAt: nowIso };
        return orders[idx];
      },
    },
    feedback: {
      list: async () => feedback as any,
      get: async (id: string) => feedback.find((f: any) => f.id === id) ?? null,
      create: async (input: any) => {
        const f = { ...input, id: `local-${Date.now()}`, approved: true, createdAt: nowIso, updatedAt: nowIso };
        feedback.push(f);
        return f;
      },
      update: async (id: string, patch: any) => {
        const idx = feedback.findIndex((f: any) => f.id === id);
        if (idx === -1) return null;
        feedback[idx] = { ...feedback[idx], ...patch, updatedAt: nowIso };
        return feedback[idx];
      },
      remove: async (id: string) => {
        const idx = feedback.findIndex((f: any) => f.id === id);
        if (idx >= 0) feedback.splice(idx, 1);
      },
    },
    coupons: {
      list: async () => coupons as any,
      get: async (id: string) => coupons.find((c: any) => c.id === id) ?? null,
      getByCode: async (code: string) => coupons.find((c: any) => c.code === code.toUpperCase()) ?? null,
      create: async (input: any) => {
        const c = { ...input, id: `local-${Date.now()}`, code: (input.code || "").toUpperCase(), usedCount: 0, createdAt: nowIso, updatedAt: nowIso };
        coupons.push(c);
        return c;
      },
      update: async (id: string, patch: any) => {
        const idx = coupons.findIndex((c: any) => c.id === id);
        if (idx === -1) return null;
        coupons[idx] = { ...coupons[idx], ...patch, updatedAt: nowIso };
        return coupons[idx];
      },
      remove: async (id: string) => {
        const idx = coupons.findIndex((c: any) => c.id === id);
        if (idx >= 0) coupons.splice(idx, 1);
      },
      incrementUsage: async (id: string) => {
        const idx = coupons.findIndex((c: any) => c.id === id);
        if (idx >= 0) coupons[idx].usedCount = (coupons[idx].usedCount || 0) + 1;
      },
    },
    signups: (() => {
      const pending = new Map<string, any>();
      return {
        start: async (data: any) => {
          const secretObj = generateTotpSecret(data.email);
          const secret = secretObj.base32;
          const code = generateTotpCode(secret);
          let qrDataUrl: string | undefined;
          try {
            const { generateTotpQrDataUrl } = await import("@/lib/email");
            qrDataUrl = await generateTotpQrDataUrl(secret, data.email);
          } catch (e) {
            console.error("[FALLBACK] Failed to generate QR", e);
          }
          pending.set(data.email.toLowerCase(), {
            ...data,
            secret,
            attempts: 0,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            createdAt: Date.now().toString(),
            qrDataUrl,
          });
          console.log(`[FALLBACK] TOTP secret for ${data.email}: ${secret}`);
          console.log(`[FALLBACK] Current OTP (Google Authenticator) for ${data.email}: ${code}`);
          if (qrDataUrl) console.log(`[FALLBACK] QR DataURL for ${data.email}: ${qrDataUrl}`);
          try {
            const { sendOtpEmail } = await import("@/lib/email");
            await sendOtpEmail(data.email, code);
          } catch (e) {
            console.error("[FALLBACK] Failed to send OTP email", e);
          }
        },
        verify: async (email: string, code: string) => {
          const entry = pending.get(email.toLowerCase());
          if (!entry) return null;
          if (new Date(entry.expiresAt).getTime() < Date.now()) {
            pending.delete(email.toLowerCase());
            return null;
          }
          if ((entry.attempts || 0) >= 5) return null;
          const ok = verifyTotpCode(entry.secret, code);
          if (!ok) {
            entry.attempts = (entry.attempts || 0) + 1;
            pending.set(email.toLowerCase(), entry);
            return null;
          }
          return entry;
        },
        resend: async (email: string) => {
          const entry = pending.get(email.toLowerCase());
          if (!entry) throw new Error("No pending signup");
          const secretObj = generateTotpSecret(email);
          const secret = secretObj.base32;
          const code = generateTotpCode(secret);
          let qrDataUrl: string | undefined;
          try {
            const { generateTotpQrDataUrl } = await import("@/lib/email");
            qrDataUrl = await generateTotpQrDataUrl(secret, email);
          } catch (e) {
            console.error("[FALLBACK] Failed to generate QR", e);
          }
          entry.secret = secret;
          entry.attempts = 0;
          entry.expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
          entry.qrDataUrl = qrDataUrl;
          pending.set(email.toLowerCase(), entry);
          console.log(`[FALLBACK] TOTP secret for ${email}: ${secret}`);
          console.log(`[FALLBACK] Current OTP (Google Authenticator) for ${email}: ${code}`);
          if (qrDataUrl) console.log(`[FALLBACK] QR DataURL for ${email}: ${qrDataUrl}`);
          try {
            const { sendOtpEmail } = await import("@/lib/email");
            await sendOtpEmail(email, code);
          } catch (e) {
            console.error("[FALLBACK] Failed to resend OTP email", e);
          }
        },
        clear: async (email: string) => {
          pending.delete(email.toLowerCase());
        },
      };
    })() as any,
    messages: {
      list: async () => messages as any,
      create: async (input: any) => {
        const m = { ...input, id: `local-${Date.now()}`, read: false, createdAt: nowIso };
        messages.push(m);
        return m;
      },
      markRead: async (id: string) => {
        const idx = messages.findIndex((m: any) => m.id === id);
        if (idx >= 0) messages[idx].read = true;
      },
      remove: async (id: string) => {
        const idx = messages.findIndex((m: any) => m.id === id);
        if (idx >= 0) messages.splice(idx, 1);
      },
    },
    subscriptions: {
      list: async (options?: any) => {
        let items = subscriptions;
        if (options?.userId) {
          items = items.filter((s: any) => s.userId === options.userId);
        }
        return [...items].sort((a, b) =>
          String(b.createdAt).localeCompare(String(a.createdAt)),
        );
      },
      get: async (id: string) => subscriptions.find((s: any) => s.id === id) ?? null,
      create: async (input: any) => {
        const subscription = {
          ...input,
          pausedIntervals: input.pausedIntervals ?? [],
          status: input.status ?? "active",
          id: localId("sub"),
          createdAt: nowIso,
        };
        subscriptions.push(subscription);
        return subscription;
      },
      update: async (id: string, patch: any) => {
        const idx = subscriptions.findIndex((s: any) => s.id === id);
        if (idx === -1) return null;
        subscriptions[idx] = { ...subscriptions[idx], ...patch };
        return subscriptions[idx];
      },
      remove: async (id: string) => {
        const idx = subscriptions.findIndex((s: any) => s.id === id);
        if (idx >= 0) subscriptions.splice(idx, 1);
        for (let i = dailyDeliveries.length - 1; i >= 0; i -= 1) {
          if (dailyDeliveries[i].subscriptionId === id) dailyDeliveries.splice(i, 1);
        }
      },
    },
    dailyDeliveries: {
      list: async (options?: any) => {
        let items = dailyDeliveries;
        if (options?.subscriptionId) {
          items = items.filter(
            (d: any) => d.subscriptionId === options.subscriptionId,
          );
        }
        if (options?.userId) {
          items = items.filter((d: any) => d.userId === options.userId);
        }
        if (options?.date) {
          items = items.filter((d: any) => d.date === options.date);
        }
        if (options?.month) {
          items = items.filter((d: any) => d.date.startsWith(`${options.month}-`));
        }
        return [...items].sort((a, b) => String(a.date).localeCompare(String(b.date)));
      },
      generateForSubscription: async (subscriptionId: string, month: string) => {
        const subscription = subscriptions.find((s: any) => s.id === subscriptionId);
        if (!subscription) return [];

        const product = products.find((p) => p.id === subscription.productId) ?? null;
        const unitPrice = productUnitPrice(product as any);
        const today = toDateKey(new Date());
        const intervals = subscription.pausedIntervals ?? [];
        const dates = deliveryDatesForMonth(
          subscription.startDate,
          subscription.frequency,
          month,
        );
        const rows: any[] = [];

        for (const date of dates) {
          const paused = isPausedOn(date, intervals);
          const plannedStatus = paused
            ? "paused"
            : date < today
              ? "delivered"
              : "scheduled";
          const idx = dailyDeliveries.findIndex(
            (d: any) => d.subscriptionId === subscriptionId && d.date === date,
          );

          if (idx === -1) {
            const quantity = Math.max(1, subscription.quantity || 1);
            const row = {
              id: `${subscriptionId}_${date}`,
              subscriptionId,
              userId: subscription.userId,
              date,
              status: plannedStatus,
              quantity,
              amountCharged: plannedStatus === "delivered" ? unitPrice * quantity : 0,
              createdAt: nowIso,
            };
            dailyDeliveries.push(row);
            rows.push(row);
            continue;
          }

          const row = dailyDeliveries[idx];
          if (row.status === "scheduled" && date < today) row.status = "delivered";
          if (paused && row.status !== "delivered") row.status = "paused";
          if (row.status === "paused" && !paused && date >= today) {
            row.status = "scheduled";
          }
          row.quantity = Math.max(1, row.quantity || subscription.quantity || 1);
          row.amountCharged =
            row.status === "delivered" ? unitPrice * row.quantity : 0;
          rows.push(row);
        }

        return rows;
      },
      pauseDays: async (subscriptionId: string, startDate: string, endDate: string) => {
        const subscription = subscriptions.find((s: any) => s.id === subscriptionId);
        if (!subscription) return;

        for (const date of daysBetween(startDate, endDate)) {
          if (date < subscription.startDate) continue;
          const month = date.slice(0, 7);
          const isDeliveryDay = deliveryDatesForMonth(
            subscription.startDate,
            subscription.frequency,
            month,
          ).includes(date);
          if (!isDeliveryDay) continue;

          const idx = dailyDeliveries.findIndex(
            (d: any) => d.subscriptionId === subscriptionId && d.date === date,
          );
          if (idx === -1) {
            dailyDeliveries.push({
              id: `${subscriptionId}_${date}`,
              subscriptionId,
              userId: subscription.userId,
              date,
              status: "paused",
              quantity: Math.max(1, subscription.quantity || 1),
              amountCharged: 0,
              createdAt: nowIso,
            });
          } else if (dailyDeliveries[idx].status !== "delivered") {
            dailyDeliveries[idx].status = "paused";
            dailyDeliveries[idx].amountCharged = 0;
          }
        }
      },
      resumeDays: async (subscriptionId: string) => {
        const today = toDateKey(new Date());
        for (const row of dailyDeliveries) {
          if (
            row.subscriptionId === subscriptionId &&
            row.status === "paused" &&
            row.date >= today
          ) {
            row.status = "scheduled";
            row.amountCharged = 0;
          }
        }
      },
      cancelDays: async (subscriptionId: string) => {
        const today = toDateKey(new Date());
        for (const row of dailyDeliveries) {
          if (
            row.subscriptionId === subscriptionId &&
            row.date >= today &&
            row.status !== "delivered" &&
            row.status !== "skipped"
          ) {
            row.status = "skipped";
            row.amountCharged = 0;
          }
        }
      },
    },
    b2bOrders: {
      list: async (options?: any) => {
        let items = b2bOrders;
        if (options?.userId) {
          items = items.filter((o: any) => o.userId === options.userId);
        }
        if (options?.status) {
          items = items.filter((o: any) => o.status === options.status);
        }
        return [...items].sort((a, b) =>
          String(b.createdAt).localeCompare(String(a.createdAt)),
        );
      },
      get: async (id: string) => b2bOrders.find((o: any) => o.id === id) ?? null,
      create: async (input: any) => {
        const order = {
          ...input,
          id: localId("b2b"),
          status: "pending",
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        b2bOrders.push(order);
        return order;
      },
      update: async (id: string, patch: any) => {
        const idx = b2bOrders.findIndex((o: any) => o.id === id);
        if (idx === -1) return null;
        b2bOrders[idx] = { ...b2bOrders[idx], ...patch, updatedAt: nowIso };
        return b2bOrders[idx];
      },
    },
  };
}
