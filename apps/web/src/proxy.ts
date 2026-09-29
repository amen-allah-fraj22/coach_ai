import createIntlMiddleware from "next-intl/middleware";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Routes that require a signed-in Clerk user. The locale prefix is optional
// so both /dashboard and /fr/dashboard match. Auth pages and the marketing
// home stay public.
const isProtected = createRouteMatcher([
  "/:locale/dashboard(.*)",
  "/:locale/onboarding(.*)",
  "/:locale/teams(.*)",
  "/:locale/players(.*)",
  "/:locale/matches(.*)",
  "/:locale/opponents(.*)",
  "/:locale/settings(.*)",
  "/:locale/assistant(.*)",
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/teams(.*)",
  "/players(.*)",
  "/matches(.*)",
  "/opponents(.*)",
  "/settings(.*)",
  "/assistant(.*)",
]);

// Clerk wraps next-intl: Clerk resolves the session, then locale routing
// runs and returns the response. protect() redirects anonymous users on
// guarded routes to Clerk's sign-in.
export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    await auth.protect();
  }
  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
