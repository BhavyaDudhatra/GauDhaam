// Rate limiter with per-route limits
const store = new Map<string, { count: number; resetAt: number }>();

const ROUTE_LIMITS: Record<string, { windowMs: number; max: number }> = {
  "/api/auth/login": { windowMs: 60_000, max: 5 },
  "/api/auth/register": { windowMs: 60_000, max: 3 },
  "/api/auth/admin-login": { windowMs: 60_000, max: 5 },
  "/api/checkout/create": { windowMs: 60_000, max: 10 },
  "/api/coupons/validate": { windowMs: 60_000, max: 10 },
  "/api/delivery/charge": { windowMs: 60_000, max: 20 },
  default: { windowMs: 60_000, max: 30 },
};

export function rateLimit(ip: string, route?: string): { allowed: boolean; remaining: number; retryAfter?: number } {
  const config = (route && ROUTE_LIMITS[route]) || ROUTE_LIMITS.default;
  const key = route ? `${ip}:${route}` : ip;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.max - 1 };
  }

  if (entry.count >= config.max) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true, remaining: config.max - entry.count };
}

// Cleanup old entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 60_000);
}
