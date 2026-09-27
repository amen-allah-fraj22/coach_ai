import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { TeamForm } from "@/components/teams/team-form";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/routing";
import type { Team } from "@/lib/types/database";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("common");

  const supabase = await createClient();
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!team) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="font-display text-2xl uppercase tracking-tight">
        {t("edit")}
      </h1>
      <TeamForm locale={locale} team={team as Team} />
    </div>
  );
}
