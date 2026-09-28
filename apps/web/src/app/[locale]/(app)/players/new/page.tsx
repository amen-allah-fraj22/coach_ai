import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PlayerForm } from "@/components/players/player-form";
import { getCurrentCoach } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Team } from "@/lib/types/database";

export default async function NewPlayerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("players");

  const current = await getCurrentCoach();
  if (!current) return null;

  const supabase = await createClient();
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .eq("club_id", current.club.id)
    .order("created_at", { ascending: true });

  const teamList = (teams as Team[] | null) ?? [];

  // A player can't exist without a team to belong to.
  if (teamList.length === 0) {
    redirect(`/${locale}/teams/new`);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="font-display text-2xl uppercase tracking-tight">
        {t("addPlayer")}
      </h1>
      <PlayerForm locale={locale} teams={teamList} />
    </div>
  );
}
