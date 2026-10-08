import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export async function LandingNavBar({ locale }: { locale: Locale }) {
  const t = await getTranslations("home.nav");
  const tCommon = await getTranslations("common");
  const tApp = await getTranslations("app");

  const languageLabels: Record<Locale, string> = {
    fr: tCommon("french"),
    ar: tCommon("arabic"),
    en: tCommon("english"),
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-hairline-08 bg-night-pitch/95 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex items-center gap-2">
        <span className="font-display text-lg uppercase tracking-tight text-chalk">
          {tApp("name")}
        </span>
        <span className="hidden text-label-mono text-muted-foreground md:inline">
          [ TACTICAL INTELLIGENCE ]
        </span>
      </div>

      <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
        <a href="#how-it-works" className="hover:text-chalk">
          {t("howItWorks")}
        </a>
        <a href="#ai-coach" className="hover:text-chalk">
          {t("aiCoach")}
        </a>
        <a href="#manifesto" className="hover:text-chalk">
          {t("manifesto")}
        </a>
      </nav>

      <div className="flex items-center gap-3">
        <div className="hidden gap-2 text-xs md:flex" role="navigation">
          {routing.locales.map((loc) => (
            <Link
              key={loc}
              href="/"
              locale={loc}
              className={
                loc === locale
                  ? "font-semibold text-chalk underline underline-offset-4"
                  : "text-muted-foreground hover:text-chalk"
              }
            >
              {loc.toUpperCase()}
            </Link>
          ))}
        </div>
        <div className="flex gap-1 text-xs md:hidden" role="navigation">
          {routing.locales.map((loc) => (
            <Link
              key={loc}
              href="/"
              locale={loc}
              aria-label={languageLabels[loc]}
              className={
                loc === locale
                  ? "border border-chalk bg-chalk px-2 py-1 font-semibold text-night-pitch"
                  : "border border-hairline-16 px-2 py-1 text-muted-foreground"
              }
            >
              {loc.toUpperCase()}
            </Link>
          ))}
        </div>
        <Button asChild variant="secondary" size="sm" className="hidden md:inline-flex">
          <Link href="/login">{t("login")}</Link>
        </Button>
      </div>
    </header>
  );
}
