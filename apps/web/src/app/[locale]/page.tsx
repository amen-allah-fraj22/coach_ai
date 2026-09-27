import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  const languageLabels: Record<Locale, string> = {
    fr: tCommon("french"),
    ar: tCommon("arabic"),
    en: tCommon("english"),
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="font-display text-4xl uppercase tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Button size="lg">{t("cta")}</Button>

      <nav className="flex gap-3 text-sm">
        {routing.locales.map((loc) => (
          <Link
            key={loc}
            href="/"
            locale={loc}
            className={
              loc === locale
                ? "font-semibold text-primary underline underline-offset-4"
                : "text-muted-foreground hover:text-foreground"
            }
          >
            {languageLabels[loc]}
          </Link>
        ))}
      </nav>
    </main>
  );
}
