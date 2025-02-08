import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Define public and auth routes
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // Everything except auth routes and static assets requires authentication
  const requiresAuth =
    !isAuthRoute &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    pathname !== "/favicon.ico";

  try {
    if (!token && requiresAuth) {
      // Redirect to login if trying to access protected route without token
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token) {
      try {
        // Verify token
        const secret = new TextEncoder().encode(
          process.env.JWT_SECRET || "super-secret"
        );
        const { payload } = await jose.jwtVerify(token, secret);

        // If token is valid and user is on auth routes, redirect to main app
        if (isAuthRoute) {
          return NextResponse.redirect(new URL("/", request.url));
        }

        // Add user info to headers for server components
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user-id", payload.sub as string);
        requestHeaders.set("x-user-role", payload.role as string);
        requestHeaders.set("x-user-phone", payload.phoneNumber as string);

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } catch {
        // If token is invalid, clear it and redirect to login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token");
        return response;
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
}

// Configure middleware to run on all routes except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
