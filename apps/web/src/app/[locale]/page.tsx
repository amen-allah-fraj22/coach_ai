import type { Locale } from "@/i18n/routing";
import { LandingNavBar } from "@/components/landing/nav-bar";
import { LandingHero } from "@/components/landing/hero";
import { TickerBand } from "@/components/landing/ticker-band";
import { PhasesSection } from "@/components/landing/phases-section";
import { ManifestoLab } from "@/components/landing/manifesto-lab";
import { DoctrineSection } from "@/components/landing/doctrine-section";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/footer";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <main className="flex flex-1 flex-col">
      <LandingNavBar locale={locale} />
      <LandingHero />
      <TickerBand />
      <PhasesSection />
      <ManifestoLab />
      <DoctrineSection />
      <FinalCta />
      <LandingFooter />
    </main>
  );
}
