import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/firebase";
import { sendOtpEmail } from "@/lib/email";
import { orderNumber, uniqueSlug } from "@/lib/slug";
import { generateTotpCode, generateTotpSecret, verifyTotpCode } from "@/lib/email";
import {
  daysBetween,
  deliveryDatesForMonth,
  isPausedOn,
  productUnitPrice,
  toDateKey,
} from "@/lib/subscriptions";
import type {
  B2BOrder,
  ContactMessage,
  Coupon,
  DailyDelivery,
  Feedback,
  Order,
  PendingSignup,
  Product,
  ProductInput,
  Service,
  ServiceInput,
  Store,
  Subscription,
  User,
} from "@/lib/types";

const byNewest = <T extends { createdAt: string }>(a: T, b: T) =>
  b.createdAt.localeCompare(a.createdAt);

export async function createFirestoreStore(): Promise<Store> {
  const db = await getDb();
  if (!db) {
    throw new Error(
      "Firestore is not configured. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.",
    );
  }

  const productsCol = db.collection("products");
  const servicesCol = db.collection("services");
  const usersCol = db.collection("users");
  const ordersCol = db.collection("orders");
  const feedbackCol = db.collection("feedback");
  const couponsCol = db.collection("coupons");
  const signupsCol = db.collection("signups");
  const messagesCol = db.collection("messages");
  const subscriptionsCol = db.collection("subscriptions");
  const dailyDeliveriesCol = db.collection("dailyDeliveries");
  const b2bOrdersCol = db.collection("b2bOrders");
  const messageThreadsCol = db.collection("messageThreads");
  const userMessagesCol = db.collection("userMessages");
  const galleryCol = db.collection("gallery");
  const eventsCol = db.collection("events");

  async function ready() {
    try {
      const [products, services, coupons, admins] = await Promise.all([
        productsCol.limit(1).get(),
        servicesCol.limit(1).get(),
        couponsCol.limit(1).get(),
        usersCol.where("role", "==", "admin").limit(1).get(),
      ]);

    if (admins.empty) {
      const { buildSeedAdmin } = await import("./seed");
      const admin = buildSeedAdmin();
      await usersCol.doc(admin.id).set(admin);
    }

    if (products.empty) {
      const { seedProducts } = await import("./seed");
      const batch = db!.batch();
      const now = Date.now();
      seedProducts.forEach((input, index) => {
        const id = randomUUID();
        const stamp = new Date(now - index * 1000).toISOString();
        const product: Product = {
          ...input,
          id,
          createdAt: stamp,
          updatedAt: stamp,
        };
        batch.set(productsCol.doc(id), product);
      });
      await batch.commit();
    }

    if (services.empty) {
      const { seedServices } = await import("./seed");
      const batch = db!.batch();
      const now = Date.now();
      seedServices.forEach((input, index) => {
        const id = randomUUID();
        const stamp = new Date(now - index * 1000).toISOString();
        const service: Service = {
          ...input,
          id,
          createdAt: stamp,
          updatedAt: stamp,
        };
        batch.set(servicesCol.doc(id), service);
      });
      await batch.commit();
    }

    if (coupons.empty) {
      const { seedCoupons } = await import("./seed");
      const batch = db!.batch();
      seedCoupons.forEach((input) => {
        const id = randomUUID();
        const now = new Date().toISOString();
        const coupon: Coupon = {
          ...input,
          id,
          usedCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        batch.set(couponsCol.doc(id), coupon);
      });
      await batch.commit();
    }
    } catch (error) {
      console.error("Firestore ready() failed:", error);
    }
  }

  return {
    ready,

    products: {
      async list() {
        try {
          const snap = await productsCol.get();
          return snap.docs
            .map((doc) => doc.data() as Product)
            .map((product) => ({
              ...product,
              images: product.images?.length ? product.images : ["/assets/images/Ghee.jpg"],
              variants: product.variants ?? [],
            }))
            .sort(byNewest);
        } catch {
          const { seedProducts } = await import("./seed");
          return seedProducts.map((input, i) => ({
            ...input,
            id: `seed-${i}`,
            createdAt: new Date(Date.now() - i * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
          })) as Product[];
        }
      },
      async get(id) {
        const doc = await productsCol.doc(id).get();
        return doc.exists ? (doc.data() as Product) : null;
      },
      async getBySlug(slug) {
        const snap = await productsCol.where("slug", "==", slug).limit(1).get();
        if (snap.empty) return null;
        return snap.docs[0].data() as Product;
      },
      async create(input) {
        const all = await productsCol.get();
        const taken = all.docs.map((doc) => (doc.data() as Product).slug);
        const now = new Date().toISOString();
        const product: Product = {
          ...input,
          id: randomUUID(),
          slug: uniqueSlug(input.slug, taken),
          createdAt: now,
          updatedAt: now,
        };
        await productsCol.doc(product.id).set(product);
        return product;
      },
      async update(id, patch: Partial<ProductInput>) {
        const ref = productsCol.doc(id);
        const doc = await ref.get();
        if (!doc.exists) return null;

        let next = patch;
        if (patch.slug !== undefined) {
          const all = await productsCol.get();
          const taken = all.docs
            .filter((item) => item.id !== id)
            .map((item) => (item.data() as Product).slug);
          next = { ...patch, slug: uniqueSlug(patch.slug, taken) };
        }

        await ref.update({ ...next, updatedAt: new Date().toISOString() });
        return (await ref.get()).data() as Product;
      },
      async remove(id) {
        await productsCol.doc(id).delete();
      },
    },

    services: {
      async list(options) {
        try {
          const snap = await servicesCol.get();
          const items = snap.docs.map((doc) => doc.data() as Service);
          const visible = options?.includeInactive
            ? items
            : items.filter((service) => service.active);
          return visible.sort((a, b) => a.sort - b.sort || byNewest(a, b));
        } catch {
          const { seedServices } = await import("./seed");
          const items = seedServices as Service[];
          const visible = options?.includeInactive ? items : items.filter((service) => (service as Service).active);
          return visible.sort((a, b) => ((a as Service).sort - (b as Service).sort) || byNewest(a as Service, b as Service));
        }
      },
      async get(id) {
        const doc = await servicesCol.doc(id).get();
        return doc.exists ? (doc.data() as Service) : null;
      },
      async getBySlug(slug) {
        const snap = await servicesCol.where("slug", "==", slug).limit(1).get();
        if (snap.empty) return null;
        return snap.docs[0].data() as Service;
      },
      async create(input) {
        const all = await servicesCol.get();
        const taken = all.docs.map((doc) => (doc.data() as Service).slug);
        const now = new Date().toISOString();
        const service: Service = {
          ...input,
          id: randomUUID(),
          slug: uniqueSlug(input.slug, taken),
          createdAt: now,
          updatedAt: now,
        };
        await servicesCol.doc(service.id).set(service);
        return service;
      },
      async update(id, patch: Partial<ServiceInput>) {
        const ref = servicesCol.doc(id);
        const doc = await ref.get();
        if (!doc.exists) return null;

        let next = patch;
        if (patch.slug !== undefined) {
          const all = await servicesCol.get();
          const taken = all.docs
            .filter((item) => item.id !== id)
            .map((item) => (item.data() as Service).slug);
          next = { ...patch, slug: uniqueSlug(patch.slug, taken) };
        }

        await ref.update({ ...next, updatedAt: new Date().toISOString() });
        return (await ref.get()).data() as Service;
      },
      async remove(id) {
        await servicesCol.doc(id).delete();
      },
    },

    users: {
      async list() {
        const snap = await usersCol.get();
        return snap.docs
          .map((doc) => doc.data() as User)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },
      async get(id) {
        const doc = await usersCol.doc(id).get();
        return doc.exists ? (doc.data() as User) : null;
      },
      async findByEmail(email) {
        const snap = await usersCol
          .where("email", "==", email.trim().toLowerCase())
          .limit(1)
          .get();
        if (snap.empty) return null;
        return snap.docs[0].data() as User;
      },
      async create(input) {
        const user: User = {
          ...input,
          email: input.email.trim().toLowerCase(),
          id: randomUUID(),
          emailVerified: input.emailVerified ?? false,
          createdAt: new Date().toISOString(),
        };
        await usersCol.doc(user.id).set(user);
        return user;
      },
      async update(id, patch) {
        const ref = usersCol.doc(id);
        const doc = await ref.get();
        if (!doc.exists) return null;
        const next = { ...patch };
        if (next.email) next.email = next.email.trim().toLowerCase();
        await ref.update(next);
        return (await ref.get()).data() as User;
      },
      async remove(id) {
        await usersCol.doc(id).delete();
      },
    },

    orders: {
      async create(input) {
        const now = new Date().toISOString();
        let number = input.number ?? orderNumber();
        for (let i = 0; i < 10; i += 1) {
          const clash = await ordersCol
            .where("number", "==", number)
            .limit(1)
            .get();
          if (clash.empty) break;
          number = orderNumber();
        }

        const order: Order = {
          ...input,
          id: randomUUID(),
          number,
          stockRestored: false,
          createdAt: now,
          updatedAt: now,
        };
        await ordersCol.doc(order.id).set(order);
        return order;
      },
      async get(id) {
        const doc = await ordersCol.doc(id).get();
        return doc.exists ? (doc.data() as Order) : null;
      },
      async list(options) {
        const snap = await ordersCol.get();
        const items = snap.docs.map((doc) => doc.data() as Order);
        const filtered = options?.userId
          ? items.filter((order) => order.userId === options.userId)
          : items;
        return filtered.sort(byNewest);
      },
      async update(id, patch) {
        const ref = ordersCol.doc(id);
        const doc = await ref.get();
        if (!doc.exists) return null;
        const order = doc.data() as Order;
        const changes: Record<string, unknown> = {
          updatedAt: new Date().toISOString(),
        };

        if (patch.status) {
          changes.status = patch.status;

          if (
            patch.status === "cancelled" &&
            order.status !== "cancelled" &&
            order.payment.status === "paid" &&
            !order.stockRestored
          ) {
            const batch = db!.batch();
            for (const item of order.items) {
              const productRef = productsCol.doc(item.productId);
              const productDoc = await productRef.get();
              if (!productDoc.exists) continue;
              const product = productDoc.data() as Product;
              const variants = (product.variants ?? []).map((variant) =>
                variant.id === item.variantId
                  ? { ...variant, stock: variant.stock + item.qty }
                  : variant,
              );
              batch.update(productRef, { variants });
            }
            batch.update(ref, { ...changes, stockRestored: true });
            await batch.commit();
            return (await ref.get()).data() as Order;
          }

          if (
            patch.status !== "cancelled" &&
            order.status === "cancelled" &&
            order.stockRestored
          ) {
            const batch = db!.batch();
            for (const item of order.items) {
              const productRef = productsCol.doc(item.productId);
              const productDoc = await productRef.get();
              if (!productDoc.exists) continue;
              const product = productDoc.data() as Product;
              const variants = (product.variants ?? []).map((variant) =>
                variant.id === item.variantId
                  ? {
                      ...variant,
                      stock: Math.max(0, variant.stock - item.qty),
                    }
                  : variant,
              );
              batch.update(productRef, { variants });
            }
            batch.update(ref, { ...changes, stockRestored: false });
            await batch.commit();
            return (await ref.get()).data() as Order;
          }
        }

        if (patch.notes !== undefined) changes.notes = patch.notes;
        if (patch.discount !== undefined) changes.discount = patch.discount;
        if (patch.discountCode !== undefined) changes.discountCode = patch.discountCode;
        if (patch.couponId !== undefined) changes.couponId = patch.couponId;
        if (patch.payment) {
          changes.payment = { ...order.payment, ...patch.payment };
        }

        await ref.update(changes);
        return (await ref.get()).data() as Order;
      },
      async markPaid(id, paymentId) {
        const ref = ordersCol.doc(id);
        const doc = await ref.get();
        if (!doc.exists) return null;
        const order = doc.data() as Order;
        if (order.payment.status === "paid") return order;

        const batch = db!.batch();
        if (!order.stockRestored) {
          for (const item of order.items) {
            const productRef = productsCol.doc(item.productId);
            const productDoc = await productRef.get();
            if (!productDoc.exists) continue;
            const product = productDoc.data() as Product;
            const variants = (product.variants ?? []).map((variant) =>
              variant.id === item.variantId
                ? {
                    ...variant,
                    stock: Math.max(0, variant.stock - item.qty),
                  }
                : variant,
            );
            batch.update(productRef, { variants });
          }
        }

        batch.update(ref, {
          "payment.status": "paid",
          "payment.razorpayPaymentId":
            paymentId ?? order.payment.razorpayPaymentId,
          status: order.status === "pending" ? "paid" : order.status,
          updatedAt: new Date().toISOString(),
        });

        await batch.commit();
        return (await ref.get()).data() as Order;
      },
    },

    feedback: {
      async list(options) {
        const snap = await feedbackCol.get();
        let items = snap.docs.map((doc) => doc.data() as Feedback);
        if (options?.productId) {
          items = items.filter((item) => item.productId === options.productId);
        }
        if (options?.userId) {
          items = items.filter((item) => item.userId === options.userId);
        }
        if (options?.approved !== undefined) {
          items = items.filter((item) => item.approved === options.approved);
        }
        return items.sort(byNewest);
      },
      async get(id) {
        const doc = await feedbackCol.doc(id).get();
        return doc.exists ? (doc.data() as Feedback) : null;
      },
      async create(input) {
        const now = new Date().toISOString();
        const feedback: Feedback = {
          ...input,
          id: randomUUID(),
          approved: true,
          createdAt: now,
          updatedAt: now,
        };
        await feedbackCol.doc(feedback.id).set(feedback);
        return feedback;
      },
      async update(id, patch) {
        const ref = feedbackCol.doc(id);
        const doc = await ref.get();
        if (!doc.exists) return null;
        await ref.update({ ...patch, updatedAt: new Date().toISOString() });
        return (await ref.get()).data() as Feedback;
      },
      async remove(id) {
        await feedbackCol.doc(id).delete();
      },
    },

    coupons: {
      async list() {
        const snap = await couponsCol.get();
        return snap.docs.map((doc) => doc.data() as Coupon).sort(byNewest);
      },
      async get(id) {
        const doc = await couponsCol.doc(id).get();
        return doc.exists ? (doc.data() as Coupon) : null;
      },
      async getByCode(code) {
        const snap = await couponsCol
          .where("code", "==", code.trim().toUpperCase())
          .limit(1)
          .get();
        if (snap.empty) return null;
        return snap.docs[0].data() as Coupon;
      },
      async create(input) {
        const now = new Date().toISOString();
        const coupon: Coupon = {
          ...input,
          id: randomUUID(),
          code: input.code.trim().toUpperCase(),
          usedCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        await couponsCol.doc(coupon.id).set(coupon);
        return coupon;
      },
      async update(id, patch) {
        const ref = couponsCol.doc(id);
        const doc = await ref.get();
        if (!doc.exists) return null;
        const next = { ...patch };
        if (next.code) next.code = next.code.trim().toUpperCase();
        await ref.update({ ...next, updatedAt: new Date().toISOString() });
        return (await ref.get()).data() as Coupon;
      },
      async remove(id) {
        await couponsCol.doc(id).delete();
      },
      async incrementUsage(id) {
        const ref = couponsCol.doc(id);
        const doc = await ref.get();
        if (!doc.exists) return;
        const coupon = doc.data() as Coupon;
        await ref.update({ usedCount: (coupon.usedCount || 0) + 1 });
      },
    },

    signups: {
      async start(input) {
        const email = input.email.trim().toLowerCase();
        const secretObj = generateTotpSecret(email);
        const secret = secretObj.base32;
        const code = generateTotpCode(secret);
        let qrDataUrl: string | undefined;
        try {
          const { generateTotpQrDataUrl } = await import("@/lib/email");
          qrDataUrl = await generateTotpQrDataUrl(secret, email);
        } catch {}
        const now = new Date();
        const pending: PendingSignup = {
          email,
          name: input.name,
          phone: input.phone,
          passwordHash: input.passwordHash,
          secret,
          attempts: 0,
          expiresAt: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
          createdAt: now.toISOString(),
          qrDataUrl,
        } as any;
        await signupsCol.doc(email).set(pending);
        await sendOtpEmail(email, code);
      },
      async verify(email, code) {
        const key = email.trim().toLowerCase();
        const ref = signupsCol.doc(key);
        const doc = await ref.get();
        if (!doc.exists) return null;
        const pending = doc.data() as any;

        if (new Date(pending.expiresAt).getTime() < Date.now()) return null;
        if ((pending.attempts || 0) >= 5) return null;

        if (!verifyTotpCode(pending.secret, code)) {
          await ref.update({ attempts: (pending.attempts || 0) + 1 });
          return null;
        }

        return pending;
      },
      async resend(email) {
        const key = email.trim().toLowerCase();
        const ref = signupsCol.doc(key);
        const doc = await ref.get();
        if (!doc.exists) throw new Error("No pending signup found.");
        const existing = doc.data() as any;
        const secretObj = generateTotpSecret(key);
        const secret = secretObj.base32;
        const code = generateTotpCode(secret);
        let qrDataUrl: string | undefined;
        try {
          const { generateTotpQrDataUrl } = await import("@/lib/email");
          qrDataUrl = await generateTotpQrDataUrl(secret, key);
        } catch {}
        await ref.update({
          secret,
          attempts: 0,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          qrDataUrl,
        });
        await sendOtpEmail(key, code);
      },
      async clear(email) {
        await signupsCol.doc(email.trim().toLowerCase()).delete();
      },
    },

    messages: {
      async list() {
        const snap = await messagesCol.get();
        return snap.docs
          .map((doc) => doc.data() as ContactMessage)
          .sort(byNewest);
      },
      async create(input) {
        const message: ContactMessage = {
          ...input,
          id: randomUUID(),
          read: false,
          createdAt: new Date().toISOString(),
        };
        await messagesCol.doc(message.id).set(message);
        return message;
      },
      async markRead(id) {
        await messagesCol.doc(id).update({ read: true });
      },
      async remove(id) {
        await messagesCol.doc(id).delete();
      },
    },

    userMessages: {
      async listThreads(userId?: string) {
        const snap = await messageThreadsCol.get();
        let threads = snap.docs.map(doc => doc.data() as any);
        if (userId) threads = threads.filter(t => t.userId === userId);
        return threads.sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
      },
      async getThread(id) {
        const threadSnap = await messageThreadsCol.doc(id).get();
        if (!threadSnap.exists) return null;
        const thread = threadSnap.data() as any;
        const msgsSnap = await userMessagesCol.where('threadId','==',id).get();
        const messages = msgsSnap.docs.map(d => d.data() as any).sort((a,b)=> a.createdAt.localeCompare(b.createdAt));
        return { thread, messages };
      },
      async createThread(input) {
        const id = randomUUID();
        const now = new Date().toISOString();
        const thread = { id, userId: input.userId, subject: input.subject, createdAt: now, updatedAt: now };
        await messageThreadsCol.doc(id).set(thread);
        const msg = { id: randomUUID(), threadId: id, senderId: input.userId, senderRole: 'user', body: input.body, createdAt: now };
        await userMessagesCol.doc(msg.id).set(msg);
        return thread;
      },
      async sendMessage(input) {
        const msg = { id: randomUUID(), threadId: input.threadId, senderId: input.senderId, senderRole: input.senderRole, body: input.body, createdAt: new Date().toISOString() };
        await userMessagesCol.doc(msg.id).set(msg);
        await messageThreadsCol.doc(input.threadId).update({ updatedAt: new Date().toISOString() });
        return msg;
      },
    },

    gallery: {
      async list() {
        const snap = await galleryCol.get();
        return snap.docs.map(d => d.data() as any).sort(byNewest);
      },
      async create(input) {
        const item = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
        await galleryCol.doc(item.id).set(item);
        return item;
      },
      async update(id, patch) {
        const ref = galleryCol.doc(id);
        await ref.update(patch);
        const doc = await ref.get();
        return doc.exists ? doc.data() as any : null;
      },
      async remove(id) {
        await galleryCol.doc(id).delete();
      },
    },

    events: {
      async list() {
        const snap = await eventsCol.get();
        return snap.docs.map(d => d.data() as any).sort(byNewest);
      },
      async create(input) {
        const item = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
        await eventsCol.doc(item.id).set(item);
        return item;
      },
      async update(id, patch) {
        const ref = eventsCol.doc(id);
        await ref.update(patch);
        const doc = await ref.get();
        return doc.exists ? doc.data() as any : null;
      },
      async remove(id) {
        await eventsCol.doc(id).delete();
      },
    },

    subscriptions: {
      async list(options) {
        const snap = await subscriptionsCol.get();
        let items = snap.docs.map((doc) => doc.data() as Subscription);
        if (options?.userId) {
          items = items.filter((item) => item.userId === options.userId);
        }
        return items.sort(byNewest);
      },
      async get(id) {
        const doc = await subscriptionsCol.doc(id).get();
        return doc.exists ? (doc.data() as Subscription) : null;
      },
      async create(input) {
        const subscription: Subscription = {
          ...input,
          pausedIntervals: input.pausedIntervals ?? [],
          status: input.status ?? "active",
          id: randomUUID(),
          createdAt: new Date().toISOString(),
        };
        await subscriptionsCol.doc(subscription.id).set(subscription);
        return subscription;
      },
      async update(id, patch) {
        const ref = subscriptionsCol.doc(id);
        const doc = await ref.get();
        if (!doc.exists) return null;
        await ref.update(patch);
        return (await ref.get()).data() as Subscription;
      },
      async remove(id) {
        await subscriptionsCol.doc(id).delete();
        const snap = await dailyDeliveriesCol
          .where("subscriptionId", "==", id)
          .get();
        if (snap.empty) return;
        const batch = db!.batch();
        snap.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      },
    },

    dailyDeliveries: {
      async list(options) {
        const snap = await dailyDeliveriesCol.get();
        let items = snap.docs.map((doc) => doc.data() as DailyDelivery);
        if (options?.subscriptionId) {
          items = items.filter((item) => item.subscriptionId === options.subscriptionId);
        }
        if (options?.userId) {
          items = items.filter((item) => item.userId === options.userId);
        }
        if (options?.date) {
          items = items.filter((item) => item.date === options.date);
        }
        if (options?.month) {
          items = items.filter((item) => item.date.startsWith(`${options.month}-`));
        }
        return items.sort((a, b) => a.date.localeCompare(b.date));
      },

      async generateForSubscription(subscriptionId, month) {
        const subDoc = await subscriptionsCol.doc(subscriptionId).get();
        if (!subDoc.exists) return [];
        const subscription = subDoc.data() as Subscription;

        const productDoc = await productsCol.doc(subscription.productId).get();
        const product = productDoc.exists ? (productDoc.data() as Product) : null;
        const unitPrice = productUnitPrice(product);
        const today = toDateKey(new Date());
        const intervals = subscription.pausedIntervals ?? [];
        const dates = deliveryDatesForMonth(
          subscription.startDate,
          subscription.frequency,
          month,
        );

        const snap = await dailyDeliveriesCol
          .where("subscriptionId", "==", subscriptionId)
          .get();
        const existing = new Map<string, DailyDelivery>();
        snap.docs.forEach((doc) => {
          const delivery = doc.data() as DailyDelivery;
          existing.set(delivery.date, delivery);
        });

        const batch = db!.batch();
        const rows: DailyDelivery[] = [];

        for (const date of dates) {
          const paused = isPausedOn(date, intervals);
          const plannedStatus: DailyDelivery["status"] = paused
            ? "paused"
            : date < today
              ? "delivered"
              : "scheduled";
          const current = existing.get(date);

          if (!current) {
            const quantity = Math.max(1, subscription.quantity || 1);
            const row: DailyDelivery = {
              id: `${subscriptionId}_${date}`,
              subscriptionId,
              userId: subscription.userId,
              date,
              status: plannedStatus,
              quantity,
              amountCharged:
                plannedStatus === "delivered" ? unitPrice * quantity : 0,
              createdAt: new Date().toISOString(),
            };
            batch.set(dailyDeliveriesCol.doc(row.id), row);
            rows.push(row);
            continue;
          }

          let status = current.status;
          if (status === "scheduled" && date < today) status = "delivered";
          if (paused && status !== "delivered") status = "paused";
          if (status === "paused" && !paused && date >= today) {
            status = "scheduled";
          }
          const quantity = Math.max(1, current.quantity || subscription.quantity || 1);
          const amountCharged = status === "delivered" ? unitPrice * quantity : 0;

          if (
            status !== current.status ||
            quantity !== current.quantity ||
            amountCharged !== current.amountCharged
          ) {
            batch.update(dailyDeliveriesCol.doc(current.id), {
              status,
              quantity,
              amountCharged,
            });
          }
          rows.push({ ...current, status, quantity, amountCharged });
        }

        await batch.commit();
        return rows.sort((a, b) => a.date.localeCompare(b.date));
      },

      async pauseDays(subscriptionId, startDate, endDate) {
        const subDoc = await subscriptionsCol.doc(subscriptionId).get();
        if (!subDoc.exists) return;
        const subscription = subDoc.data() as Subscription;

        const snap = await dailyDeliveriesCol
          .where("subscriptionId", "==", subscriptionId)
          .get();
        const existing = new Map<string, DailyDelivery>();
        snap.docs.forEach((doc) => {
          const delivery = doc.data() as DailyDelivery;
          existing.set(delivery.date, delivery);
        });

        const batch = db!.batch();
        for (const date of daysBetween(startDate, endDate)) {
          if (date < subscription.startDate) continue;
          const month = date.slice(0, 7);
          const isDeliveryDay = deliveryDatesForMonth(
            subscription.startDate,
            subscription.frequency,
            month,
          ).includes(date);
          if (!isDeliveryDay) continue;

          const current = existing.get(date);
          if (!current) {
            const row: DailyDelivery = {
              id: `${subscriptionId}_${date}`,
              subscriptionId,
              userId: subscription.userId,
              date,
              status: "paused",
              quantity: Math.max(1, subscription.quantity || 1),
              amountCharged: 0,
              createdAt: new Date().toISOString(),
            };
            batch.set(dailyDeliveriesCol.doc(row.id), row);
          } else if (current.status !== "delivered") {
            batch.update(dailyDeliveriesCol.doc(current.id), {
              status: "paused",
              amountCharged: 0,
            });
          }
        }
        await batch.commit();
      },

      async resumeDays(subscriptionId) {
        const today = toDateKey(new Date());
        const snap = await dailyDeliveriesCol
          .where("subscriptionId", "==", subscriptionId)
          .get();
        if (snap.empty) return;
        const batch = db!.batch();
        let changed = false;
        snap.docs.forEach((doc) => {
          const delivery = doc.data() as DailyDelivery;
          if (delivery.status === "paused" && delivery.date >= today) {
            batch.update(doc.ref, { status: "scheduled", amountCharged: 0 });
            changed = true;
          }
        });
        if (changed) await batch.commit();
      },

      async cancelDays(subscriptionId) {
        const today = toDateKey(new Date());
        const snap = await dailyDeliveriesCol
          .where("subscriptionId", "==", subscriptionId)
          .get();
        if (snap.empty) return;
        const batch = db!.batch();
        let changed = false;
        snap.docs.forEach((doc) => {
          const delivery = doc.data() as DailyDelivery;
          if (
            delivery.date >= today &&
            delivery.status !== "delivered" &&
            delivery.status !== "skipped"
          ) {
            batch.update(doc.ref, { status: "skipped", amountCharged: 0 });
            changed = true;
          }
        });
        if (changed) await batch.commit();
      },
    },

    b2bOrders: {
      async list(options) {
        const snap = await b2bOrdersCol.get();
        let items = snap.docs.map((doc) => doc.data() as B2BOrder);
        if (options?.userId) {
          items = items.filter((item) => item.userId === options.userId);
        }
        if (options?.status) {
          items = items.filter((item) => item.status === options.status);
        }
        return items.sort(byNewest);
      },
      async get(id) {
        const doc = await b2bOrdersCol.doc(id).get();
        return doc.exists ? (doc.data() as B2BOrder) : null;
      },
      async create(input) {
        const now = new Date().toISOString();
        const order: B2BOrder = {
          ...input,
          id: randomUUID(),
          status: "pending",
          createdAt: now,
          updatedAt: now,
        };
        await b2bOrdersCol.doc(order.id).set(order);
        return order;
      },
      async update(id, patch) {
        const ref = b2bOrdersCol.doc(id);
        const doc = await ref.get();
        if (!doc.exists) return null;
        await ref.update({ ...patch, updatedAt: new Date().toISOString() });
        return (await ref.get()).data() as B2BOrder;
      },
    },
  };
}
