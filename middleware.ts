export { auth as middleware } from "@/lib/auth";

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
