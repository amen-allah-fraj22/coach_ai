import { getTranslations } from "next-intl/server";

import { TeamForm } from "@/components/teams/team-form";
import type { Locale } from "@/i18n/routing";

export default async function NewTeamPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("teams");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="font-display text-2xl uppercase tracking-tight">
        {t("addTeam")}
      </h1>
      <TeamForm locale={locale} />
    </div>
  );
}
