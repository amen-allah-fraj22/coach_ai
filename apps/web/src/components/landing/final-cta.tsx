import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function FinalCta() {
  const t = await getTranslations("home.finalCta");

  return (
    <section className="flex flex-col items-center gap-4 border-b border-hairline-08 bg-slate-grass px-4 py-16 text-center md:flex-row md:justify-between md:px-8 md:text-start">
      <div>
        <p className="text-label-tactical text-muted-foreground">{t("label")}</p>
        <h2 className="font-display text-headline-md uppercase text-chalk">{t("title")}</h2>
      </div>
      <Button asChild variant="pill" size="lg">
        <Link href="/signup">{t("cta")} ▸</Link>
      </Button>
    </section>
  );
}
