import { randomUUID } from "node:crypto";
import { hashPassword } from "@/lib/password";
import type { Coupon, ProductInput, ServiceInput, User } from "@/lib/types";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gaudhaam.in";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Gaudham@123";
export const ADMIN_NAME = "GauDhaam Admin";

export function buildSeedAdmin(): User {
  return {
    id: randomUUID(),
    name: ADMIN_NAME,
    email: ADMIN_EMAIL.trim().toLowerCase(),
    phone: "",
    passwordHash: hashPassword(ADMIN_PASSWORD),
    role: "admin",
    emailVerified: true,
    createdAt: new Date().toISOString(),
  };
}

const image = (name: string) => `/assets/images/${name}`;

export const seedProducts: ProductInput[] = [];

export const seedServices: ServiceInput[] = [];

export const seedCoupons: Array<
  Omit<Coupon, "id" | "createdAt" | "updatedAt" | "usedCount">
> = [];
