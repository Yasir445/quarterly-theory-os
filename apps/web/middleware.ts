import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/journal",
  "/backtesting",
  "/research",
  "/jem-library",
  "/calendar",
  "/glossary",
  "/settings",
];
const ADMIN_PREFIX = "/admin";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthed = Boolean(req.auth);
  const role = req.auth?.user?.role;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_PREFIXES.some((route) => pathname.startsWith(route));
  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);

  // Signed-in users shouldn't see the login/register screens again.
  if (isAuthRoute && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isProtectedRoute && !isAuthed) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute) {
    // 404 rather than 403 for non-admins — don't confirm the route exists
    // to users who have no business knowing about it.
    if (!isAuthed || (role !== "ADMIN" && role !== "MODERATOR")) {
      return NextResponse.rewrite(new URL("/404", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except static assets and Next internals.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
