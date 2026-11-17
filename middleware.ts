import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = "*";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (request.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGINS);
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.headers.set("Access-Control-Max-Age", "86400");
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGINS);
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export const config = {
  matcher: "/api/:path*",
};