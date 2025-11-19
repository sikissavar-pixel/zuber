import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Development bypass: when NEXT_PUBLIC_DISABLE_AUTH=1, skip all auth redirects
  // This enables previewing protected pages/styles without logging in.
  // Do NOT enable this in production.
  const disableAuth = process.env.NEXT_PUBLIC_DISABLE_AUTH === "1";
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const isPreview = url.searchParams.get("preview") === "1";
  if (disableAuth || isPreview) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value as "guest" | "driver" | "partner" | "admin" | undefined;

  // url and pathname already defined above

  // Public routes whitelist
  const publicPaths = ["/", "/login", "/register", "/partner/apply", "/driver/apply", "/partner-apply", "/driver-apply"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protect dashboards and admin
  const protectedPrefixes = ["/partner/dashboard", "/driver/dashboard", "/admin"];
  if (!token && protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If accessing login/register while authenticated, send to dashboard
  if (token && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    if (role) {
      const map: Record<string, string> = {
        guest: "/",
        driver: "/driver/dashboard",
        partner: "/partner/dashboard",
        admin: "/admin",
      };
      url.pathname = map[role];
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except Next.js internals and API
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};