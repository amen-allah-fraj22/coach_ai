import { SignIn } from "@clerk/nextjs";

import type { Locale } from "@/i18n/routing";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  // Clerk renders its own sign-in UI. After sign-in we send the user to the
  // dashboard, which bounces to /onboarding if they have no coach profile.
  return (
    <SignIn
      routing="hash"
      signUpUrl={`/${locale}/signup`}
      fallbackRedirectUrl={`/${locale}/dashboard`}
    />
  );
}
