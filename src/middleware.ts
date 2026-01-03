import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname, origin, search } = req.nextUrl;

  // Read NextAuth JWT from cookies
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Protect dashboard and API routes (except auth)
  const isApiAuth = pathname.startsWith("/api/auth");
  const isProtected = pathname.startsWith("/dashboard") || (pathname.startsWith("/api") && !isApiAuth);

  if (isProtected) {
    if (!token) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = new URL("/signin", origin);
      // preserve intended destination
      url.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // If already signed-in, block visiting /signin
  if (pathname === "/signin" && token) {
    return NextResponse.redirect(new URL("/dashboard", origin));
  }

  return NextResponse.next();
}

// Only run on these routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/dashboard/:path*",
    "/signin",
    "/api/:path*", // Secure all API routes
  ],
};
