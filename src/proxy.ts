import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 🔐 Only auth pages are public
const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();
  const url = new URL(req.url);
  const isApiRoute = url.pathname.startsWith("/api");

  // ✅ If user is logged in → block auth pages
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // ✅ If NOT logged in → protect everything except auth + public APIs
  if (!userId) {
    if (!isAuthRoute(req) && !isApiRoute) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals + static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run on API routes
    "/(api|trpc)(.*)",
  ],
};