import { SignUp } from "@clerk/nextjs";

import type { Locale } from "@/i18n/routing";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  // Clerk handles account creation. New accounts have no coach profile yet,
  // so we send them to onboarding to create a club or accept an invite.
  return (
    <SignUp
      routing="hash"
      signInUrl={`/${locale}/login`}
      fallbackRedirectUrl={`/${locale}/onboarding`}
    />
  );
}
