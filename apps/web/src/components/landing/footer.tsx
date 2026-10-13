import { getTranslations } from "next-intl/server";

export async function LandingFooter() {
  const t = await getTranslations("home.footer");
  const tApp = await getTranslations("app");

  return (
    <footer className="flex flex-col gap-2 px-4 py-8 text-center md:flex-row md:items-center md:justify-between md:px-8 md:text-start">
      <div>
        <p className="font-display uppercase tracking-tight text-chalk">{tApp("name")}</p>
        <p className="text-sm text-muted-foreground">{t("tagline")}</p>
      </div>
      <p className="text-xs text-muted-foreground">{t("copyright")}</p>
    </footer>
  );
}
