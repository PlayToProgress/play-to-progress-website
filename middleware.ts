import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ROLE_PREFIX: Record<string, string> = {
  admin: "/admin",
  coordinator: "/coordinator",
  participant: "/participant",
  partner: "/partner",
  parent: "/parent",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // /account (change password) is available to every authenticated role —
  // it just requires login, not a specific role.
  if (pathname.startsWith("/account")) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const protectedPrefixes = Object.values(ROLE_PREFIX);
  const matchedPrefix = protectedPrefixes.find((p) => pathname.startsWith(p));
  if (!matchedPrefix) return NextResponse.next();

  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Super admin can browse any role area (e.g. to review the coordinator's
  // programme screens) — every other role is confined to its own prefix.
  if (session.user.role === "admin") return NextResponse.next();

  const allowedPrefix = ROLE_PREFIX[session.user.role];
  if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
    return NextResponse.redirect(new URL(allowedPrefix, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/coordinator/:path*",
    "/participant/:path*",
    "/partner/:path*",
    "/parent/:path*",
    "/account/:path*",
  ],
};
