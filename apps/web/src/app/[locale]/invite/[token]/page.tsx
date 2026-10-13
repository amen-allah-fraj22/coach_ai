import { redirect } from "next/navigation";

import type { Locale } from "@/i18n/routing";

// The invite link is protected by middleware, so the visitor is signed in by
// the time they reach here. Hand the token to the onboarding flow, which
// previews the club and lets them join. (An anonymous visitor is sent through
// Clerk sign-in first and returns here afterward.)
export default async function InvitePage({
  params,
}: {
  params: Promise<{ locale: Locale; token: string }>;
}) {
  const { locale, token } = await params;
  redirect(`/${locale}/onboarding?invite=${encodeURIComponent(token)}`);
}
