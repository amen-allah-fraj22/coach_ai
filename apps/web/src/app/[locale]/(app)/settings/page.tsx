import { getTranslations } from "next-intl/server";

import { getCurrentCoach } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { InviteForm } from "@/components/settings/invite-form";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import type { Coach } from "@/lib/types/database";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("settings");
  const tCommon = await getTranslations("common");

  const current = await getCurrentCoach();
  if (!current) return null;

  const supabase = await createClient();
  const { data: coaches } = await supabase
    .from("coaches")
    .select("*")
    .eq("club_id", current.club.id)
    .order("created_at", { ascending: true });

  const languageLabels: Record<Locale, string> = {
    fr: tCommon("french"),
    ar: tCommon("arabic"),
    en: tCommon("english"),
  };

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-tight">
          {t("title")}
        </h1>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">
          {t("clubInfo")}
        </h2>
        <p>{current.club.name}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">
          {tCommon("language")}
        </h2>
        <nav className="flex gap-3 text-sm">
          {routing.locales.map((loc) => (
            <Link
              key={loc}
              href="/settings"
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">
          {t("coaches")}
        </h2>
        <ul className="flex flex-col gap-2">
          {(coaches as Coach[] | null)?.map((coach) => (
            <li
              key={coach.id}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
            >
              <span>{coach.full_name}</span>
              <span className="text-muted-foreground">
                {t(`role.${coach.role}` as "role.owner" | "role.member")}
              </span>
            </li>
          ))}
        </ul>

        <InviteForm locale={locale} />
      </section>
    </div>
  );
}
