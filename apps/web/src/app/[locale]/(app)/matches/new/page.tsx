import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { MatchForm } from "@/components/matches/match-form";
import { getCurrentCoach } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Opponent, Team } from "@/lib/types/database";

export default async function NewMatchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("matches");

  const current = await getCurrentCoach();
  if (!current) return null;

  const supabase = await createClient();
  const [{ data: teams }, { data: opponents }] = await Promise.all([
    supabase
      .from("teams")
      .select("*")
      .eq("club_id", current.club.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("opponents")
      .select("*")
      .eq("club_id", current.club.id)
      .order("team_name", { ascending: true }),
  ]);

  const teamList = (teams as Team[] | null) ?? [];

  if (teamList.length === 0) {
    redirect(`/${locale}/teams/new`);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="font-display text-2xl uppercase tracking-tight">
        {t("addMatch")}
      </h1>
      <MatchForm
        locale={locale}
        teams={teamList}
        opponents={(opponents as Opponent[] | null) ?? []}
      />
    </div>
  );
}
