import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check for NextAuth session cookie (works with both secure and non-secure)
  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token");

  if (!hasSession) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect everything except:
    // - landing page (/)
    // - auth routes (/api/auth/*, /auth/*)
    // - webhooks (/api/webhooks/*)
    // - tools endpoints called by ElevenLabs (/api/tools/*)
    // - static files (_next, favicon, etc.)
    "/call/:path*",
    "/history",
    "/api/calls/:path*",
  ],
};
