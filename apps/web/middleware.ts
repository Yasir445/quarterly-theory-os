import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];
const PROTECTED_PREFIXES = [
  "/dashboard", "/journal", "/backtesting", "/research",
  "/jem-library", "/calendar", "/glossary", "/settings",
];

function hasSessionCookie(req: NextRequest) {
  return Boolean(
    req.cookies.get("authjs.session-token") ||
    req.cookies.get("__Secure-authjs.session-token"),
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthed = hasSessionCookie(req);

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_PREFIXES.some((r) => pathname.startsWith(r));

  if (isAuthRoute && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (isProtectedRoute && !isAuthed) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
