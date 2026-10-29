export type Role = "user" | "admin";

export type OfferType = "percentage" | "fixed";

export type Offer = {
  type: OfferType;
  value: number;
  startDate?: string;
  endDate?: string;
  minQty?: number;
  label?: string;
};

export type ProductVariant = {
  id: string;
  label: string;
  price: number;
  mrp: number | null;
  stock: number;
  sku?: string;
  active: boolean;
  offer?: Offer | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  ingredients?: string;
  howToUse?: string;
  images: string[];
  variants: ProductVariant[];
  offer: Offer | null;
  featured: boolean;
  available: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export type Service = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  images: string[];
  priceNote: string;
  active: boolean;
  sort: number;
  createdAt: string;
  updatedAt: string;
};

export type ServiceInput = Omit<Service, "id" | "createdAt" | "updatedAt">;

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
};

import * as speakeasy from "speakeasy";
import { generateTotpCode, generateTotpSecret, verifyTotpCode } from "@/lib/email";

export type PendingSignup = {
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  secret: string;
  attempts: number;
  expiresAt: string;
  createdAt: string;
  qrDataUrl?: string;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "created" | "paid" | "failed" | "refunded";

export type Address = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

export type OrderItem = {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  image: string;
  variantLabel: string;
  price: number;
  originalPrice?: number;
  qty: number;
};

export type Order = {
  id: string;
  number: string;
  userId: string | null;
  email: string;
  customerName: string;
  phone: string;
  address: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  couponId?: string;
  shipping: number;
  total: number;
  status: OrderStatus;
  payment: {
    provider: "razorpay";
    status: PaymentStatus;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
  };
  notes: string;
  stockRestored: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Feedback = {
  id: string;
  userId: string;
  userName: string;
  productId?: string;
  productName?: string;
  rating: number;
  title: string;
  comment: string;
  reply?: string;
  repliedAt?: string;
  repliedBy?: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FeedbackInput = {
  productId?: string;
  productName?: string;
  rating: number;
  title: string;
  comment: string;
};

export type Coupon = {
  id: string;
  code: string;
  description: string;
  type: OfferType;
  value: number;
  minOrderValue: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type MessageInput = Omit<ContactMessage, "id" | "read" | "createdAt">;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type SubscriptionFrequency = "daily" | "weekly" | "monthly";

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export type PausedInterval = {
  startDate: string;
  endDate: string;
};

export type Subscription = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  frequency: SubscriptionFrequency;
  startDate: string;
  status: SubscriptionStatus;
  pausedIntervals: PausedInterval[];
  address: Address;
  createdAt: string;
};

export type DeliveryStatus = "scheduled" | "delivered" | "paused" | "skipped";

export type DailyDelivery = {
  id: string;
  subscriptionId: string;
  userId: string;
  date: string;
  status: DeliveryStatus;
  quantity: number;
  amountCharged: number;
  createdAt: string;
};

export type B2BOrderStatus = "pending" | "quoted" | "confirmed" | "rejected";

export type B2BOrder = {
  id: string;
  userId: string | null;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  gstNumber?: string;
  productId: string;
  productName?: string;
  quantity: number;
  frequency: SubscriptionFrequency;
  packagingDetails?: string;
  customNotes?: string;
  priceQuoted?: number;
  status: B2BOrderStatus;
  createdAt: string;
  updatedAt?: string;
};

export type Store = {
  products: {
    list: (options?: { includeUnavailable?: boolean }) => Promise<Product[]>;
    get: (id: string) => Promise<Product | null>;
    getBySlug: (slug: string) => Promise<Product | null>;
    create: (input: ProductInput) => Promise<Product>;
    update: (id: string, patch: Partial<ProductInput>) => Promise<Product | null>;
    remove: (id: string) => Promise<void>;
  };
  services: {
    list: (options?: { includeInactive?: boolean }) => Promise<Service[]>;
    get: (id: string) => Promise<Service | null>;
    getBySlug: (slug: string) => Promise<Service | null>;
    create: (input: ServiceInput) => Promise<Service>;
    update: (id: string, patch: Partial<ServiceInput>) => Promise<Service | null>;
    remove: (id: string) => Promise<void>;
  };
  users: {
    list: () => Promise<User[]>;
    get: (id: string) => Promise<User | null>;
    findByEmail: (email: string) => Promise<User | null>;
    create: (input: Omit<User, "id" | "createdAt">) => Promise<User>;
    update: (id: string, patch: Partial<Omit<User, "id" | "createdAt">>) => Promise<User | null>;
  };
  orders: {
    create: (input: Omit<Order, "id" | "number" | "createdAt" | "updatedAt" | "stockRestored"> & { number?: string }) => Promise<Order>;
    get: (id: string) => Promise<Order | null>;
    list: (options?: { userId?: string }) => Promise<Order[]>;
    update: (id: string, patch: Partial<Pick<Order, "status" | "notes" | "discount" | "discountCode" | "couponId">> & { payment?: Pick<Order["payment"], "status" | "razorpayOrderId" | "razorpayPaymentId"> }) => Promise<Order | null>;
    markPaid: (id: string, razorpayPaymentId: string | null) => Promise<Order | null>;
  };
  feedback: {
    list: (options?: { productId?: string; approved?: boolean; userId?: string }) => Promise<Feedback[]>;
    get: (id: string) => Promise<Feedback | null>;
    create: (input: FeedbackInput & { userId: string; userName: string }) => Promise<Feedback>;
    update: (id: string, patch: Partial<Pick<Feedback, "approved" | "reply" | "repliedAt" | "repliedBy">>) => Promise<Feedback | null>;
    remove: (id: string) => Promise<void>;
  };
  coupons: {
    list: () => Promise<Coupon[]>;
    get: (id: string) => Promise<Coupon | null>;
    getByCode: (code: string) => Promise<Coupon | null>;
    create: (input: Omit<Coupon, "id" | "createdAt" | "updatedAt" | "usedCount">) => Promise<Coupon>;
    update: (id: string, patch: Partial<Coupon>) => Promise<Coupon | null>;
    remove: (id: string) => Promise<void>;
    incrementUsage: (id: string) => Promise<void>;
  };
  signups: {
    start: (input: { email: string; name: string; phone: string; passwordHash: string }) => Promise<void>;
    verify: (email: string, code: string) => Promise<PendingSignup | null>;
    resend: (email: string) => Promise<void>;
    clear: (email: string) => Promise<void>;
  };
  messages: {
    list: () => Promise<ContactMessage[]>;
    create: (input: MessageInput) => Promise<ContactMessage>;
    markRead: (id: string) => Promise<void>;
    remove: (id: string) => Promise<void>;
  };
  subscriptions: {
    list: (options?: { userId?: string }) => Promise<Subscription[]>;
    get: (id: string) => Promise<Subscription | null>;
    create: (input: Omit<Subscription, "id" | "createdAt">) => Promise<Subscription>;
    update: (id: string, patch: Partial<Subscription>) => Promise<Subscription | null>;
    remove: (id: string) => Promise<void>;
  };
  dailyDeliveries: {
    list: (options?: {
      subscriptionId?: string;
      userId?: string;
      date?: string;
      month?: string;
    }) => Promise<DailyDelivery[]>;
    generateForSubscription: (subscriptionId: string, month: string) => Promise<DailyDelivery[]>;
    pauseDays: (subscriptionId: string, startDate: string, endDate: string) => Promise<void>;
    resumeDays: (subscriptionId: string) => Promise<void>;
    cancelDays: (subscriptionId: string) => Promise<void>;
  };
  b2bOrders: {
    list: (options?: { userId?: string; status?: B2BOrderStatus }) => Promise<B2BOrder[]>;
    get: (id: string) => Promise<B2BOrder | null>;
    create: (
      input: Omit<B2BOrder, "id" | "createdAt" | "status" | "priceQuoted">,
    ) => Promise<B2BOrder>;
    update: (id: string, patch: Partial<B2BOrder>) => Promise<B2BOrder | null>;
  };
  ready: () => Promise<void>;
};
