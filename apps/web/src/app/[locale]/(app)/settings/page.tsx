import { getTranslations } from "next-intl/server";

import { fetchAuthed, getServerCoach } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { InviteForm } from "@/components/settings/invite-form";
import { SettingsPhilosophy } from "@/components/settings/settings-philosophy";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("settings");
  const tCommon = await getTranslations("common");

  const current = await getServerCoach();
  if (!current) return null;

  const coaches = ((await fetchAuthed(api.coaches.listClubCoaches, {})) ??
    []) as Doc<"coaches">[];

  const languageLabels: Record<Locale, string> = {
    fr: tCommon("french"),
    ar: tCommon("arabic"),
    en: tCommon("english"),
  };

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="font-display text-headline-sm uppercase text-chalk">
        {t("operationalLedger")}
      </h1>

      <section className="flex flex-col gap-3 border-b border-hairline-08 pb-6">
        <h2 className="text-label-tactical text-muted-foreground">{t("clubInfo")}</h2>
        <p className="font-display text-headline-sm uppercase text-chalk">{current.club.name}</p>
      </section>

      <section className="flex flex-col gap-3 border-b border-hairline-08 pb-6">
        <h2 className="text-label-tactical text-muted-foreground">{tCommon("language")}</h2>
        <div className="flex gap-2">
          {routing.locales.map((loc) => (
            <Link
              key={loc}
              href="/settings"
              locale={loc}
              className={
                loc === locale
                  ? "flex items-center gap-1 border border-chalk bg-chalk px-3 py-2 text-xs font-semibold uppercase text-night-pitch"
                  : "flex items-center gap-1 border border-hairline-16 px-3 py-2 text-xs uppercase text-muted-foreground hover:text-chalk"
              }
            >
              {loc === locale && "✓ "}
              {languageLabels[loc]}
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 border-b border-hairline-08 pb-6">
        <h2 className="text-label-tactical text-muted-foreground">{t("coachPhilosophy")}</h2>
        <SettingsPhilosophy coach={current.coach} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-label-tactical text-muted-foreground">{t("coaches")}</h2>
        <ul className="flex flex-col gap-2">
          {coaches.map((coach) => (
            <li
              key={coach._id}
              className="flex items-center justify-between border border-hairline-08 bg-slate-grass px-3 py-2 text-sm"
            >
              <span className="text-chalk">{coach.fullName}</span>
              <span className="text-muted-foreground">
                {t(`role.${coach.role}` as "role.owner" | "role.member")}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex flex-col gap-2">
          <h3 className="text-label-tactical text-muted-foreground">
            {t("issueTechnicalPassport")}
          </h3>
          <InviteForm />
        </div>
      </section>
    </div>
  );
}
