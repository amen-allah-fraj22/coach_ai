import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import type { Locale } from "@/i18n/routing";

export default async function OnboardingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ invite?: string; fullName?: string; clubName?: string }>;
}) {
  const { locale } = await params;
  const { invite, fullName, clubName } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <OnboardingFlow
          locale={locale}
          inviteToken={invite}
          defaultFullName={fullName}
          defaultClubName={clubName}
        />
      </div>
    </main>
  );
}
