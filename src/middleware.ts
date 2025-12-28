import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",

  // APIs ציבוריים
  "/api/companies",
  "/api/testimonials",
  "/api/users/exists",
]);

const isProtectedApiRoute = createRouteMatcher([
  "/api/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req) && !req.nextUrl.pathname.startsWith("/api")) {
    await auth.protect();
  }

  if (isProtectedApiRoute(req) && !isPublicRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
  ],
};
