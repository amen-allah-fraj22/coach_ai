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
  "/:locale/invite(.*)",
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/teams(.*)",
  "/players(.*)",
  "/matches(.*)",
  "/opponents(.*)",
  "/settings(.*)",
  "/assistant(.*)",
  "/invite(.*)",
]);

function loginUrlFor(req: Request): string {
  const url = new URL(req.url);
  const first = url.pathname.split("/")[1];
  const locale = routing.locales.includes(first as (typeof routing.locales)[number])
    ? first
    : routing.defaultLocale;
  const login = new URL(`/${locale}/login`, url.origin);
  login.searchParams.set("redirect_url", url.pathname + url.search);
  return login.toString();
}

// Clerk wraps next-intl: Clerk resolves the session, then locale routing
// runs and returns the response. protect() sends anonymous users on
// guarded routes to our own /[locale]/login, not Clerk's hosted page.
export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    await auth.protect({ unauthenticatedUrl: loginUrlFor(req) });
  }
  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
