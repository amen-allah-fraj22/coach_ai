import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

// Phase 2 will extend this to also refresh the Supabase auth session
// (createServerClient + auth.getUser()) alongside the locale routing below.
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
