import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

export async function middleware(request: NextRequest) {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const isPublicRoute = 
    pathname.startsWith("/login") || 
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/announcements") ||
    pathname === "/favicon.ico";

  // If it's a public route, just add CORS headers and continue
  if (isPublicRoute) {
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Handle protected routes
  if (!token) {
    // Redirect to login if trying to access protected route without token
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    // Add user info to headers for server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.sub as string);
    requestHeaders.set("x-user-role", payload.role as string);
    requestHeaders.set("x-user-phone", payload.phoneNumber as string);

    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      requestHeaders.set(key, value);
    });

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    // If token verification fails, clear it and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    
    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
}

// Configure middleware to run on all routes except static assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|logo.png|manifest.json).*)",
  ],
};
