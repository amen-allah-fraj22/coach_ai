import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <svg viewBox="0 0 120 80" className="w-48" aria-hidden>
        <rect x="2" y="2" width="116" height="76" fill="none" stroke="rgba(247,245,239,0.15)" strokeWidth="0.8" />
        <line x1="60" y1="2" x2="60" y2="78" stroke="rgba(247,245,239,0.15)" strokeWidth="0.8" />
        <circle cx="60" cy="40" r="12" fill="none" stroke="rgba(247,245,239,0.15)" strokeWidth="0.8" />
        <line x1="20" y1="20" x2="100" y2="60" stroke="var(--touchline-red)" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1="100" y1="20" x2="20" y2="60" stroke="var(--touchline-red)" strokeWidth="1.5" strokeDasharray="4 3" />
      </svg>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-headline-lg uppercase text-chalk">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Button asChild>
        <Link href="/dashboard">{t("backToDashboard")}</Link>
      </Button>
    </main>
  );
}
