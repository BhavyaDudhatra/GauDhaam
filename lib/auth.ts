import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, SessionUser } from "@/lib/types";

const COOKIE_NAME = "gd_session";
const MAX_AGE = 60 * 60 * 24 * 30;

type TokenPayload = SessionUser & { exp: number };

function secret() {
  return (
    process.env.AUTH_SECRET ||
    "gaudham-development-secret-change-this-in-production"
  );
}

function encode(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function createToken(user: SessionUser) {
  const payload: TokenPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  };
  const body = encode(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function readToken(token: string): SessionUser | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as TokenPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== "user" && payload.role !== "admin") return null;
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function setSession(user: {
  id: string;
  name: string;
  email: string;
  role: Role;
}) {
  const store = await cookies();
  store.set(COOKIE_NAME, createToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return readToken(token);
}

export async function requireUser(nextPath = "/account"): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }
  return session;
}
