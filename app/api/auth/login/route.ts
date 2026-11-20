import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { verifyPassword } from "@/lib/password";
import { clean, isEmail } from "@/lib/validate";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
  "Content-Type": "application/json",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

function pickPasswordHash(user: any): string {
  if (user?.passwordHash) return String(user.passwordHash);
  if (user?.password) return String(user.password);
  return "";
}

function pickVerified(user: any): boolean {
  if (user?.emailVerified === true || user?.emailVerified === "true") return true;
  if (user?.verified === true || user?.verified === "true") return true;
  if (user?.isVerified === true || user?.isVerified === "true") return true;
  if (user?.emailVerified === undefined && user?.verified === undefined && user?.isVerified === undefined) return true;
  return false;
}

function verifyAny(password: string, stored: string): boolean {
  if (!stored) return false;
  if (stored.includes(":")) {
    try {
      return verifyPassword(password, stored);
    } catch {
      return false;
    }
  }
  return stored === password;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = clean(body.email, 200).toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Enter your email and password to continue." }, { status: 400, headers: corsHeaders });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400, headers: corsHeaders });
    }

    const store = await getStore();
    let user = await store.users.findByEmail(email);
    if (!user) {
      const all = await store.users.list();
      user = all.find((u: any) => String(u.email || "").trim().toLowerCase() === email) || null;
    }
    if (!user) {
      return NextResponse.json({ error: "No account found with this email address. Please sign up first or check for typos." }, { status: 404, headers: corsHeaders });
    }
    const normalizedRole = String(user.role || "").trim().toLowerCase() === "admin" || (user as any).isAdmin === true ? "admin" : "user";
    if (!pickVerified(user)) {
      return NextResponse.json({ error: "Your account is not verified yet. Please verify your email." }, { status: 403, headers: corsHeaders });
    }
    const hash = pickPasswordHash(user);
    if (!verifyAny(password, hash)) {
      return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401, headers: corsHeaders });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: normalizedRole,
        isAdmin: normalizedRole === "admin",
        emailVerified: pickVerified(user),
        createdAt: user.createdAt,
        addresses: user.addresses ?? [],
        wishlist: user.wishlist ?? [],
      },
    }, { headers: corsHeaders });
  } catch (e) {
    console.error("login error", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500, headers: corsHeaders });
  }
}
