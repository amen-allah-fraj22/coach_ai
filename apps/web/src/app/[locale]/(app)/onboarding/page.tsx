import { getTranslations } from "next-intl/server";

import { PhilosophyForm } from "@/components/onboarding/philosophy-form";
import type { Locale } from "@/i18n/routing";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("onboarding");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <PhilosophyForm locale={locale} />
    </div>
  );
}
