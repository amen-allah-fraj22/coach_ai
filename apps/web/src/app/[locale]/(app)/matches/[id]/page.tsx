import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { MatchForm } from "@/components/matches/match-form";
import { MatchEventLog } from "@/components/matches/match-event-log";
import { getCurrentCoach } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type {
  Match,
  MatchEvent,
  Opponent,
  Player,
  Team,
} from "@/lib/types/database";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("common");

  const current = await getCurrentCoach();
  if (!current) return null;

  const supabase = await createClient();
  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!match) {
    notFound();
  }

  const typedMatch = match as Match;

  const [{ data: teams }, { data: opponents }, { data: events }, { data: players }] =
    await Promise.all([
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
      supabase
        .from("match_events")
        .select("*")
        .eq("match_id", id)
        .order("minute", { ascending: true }),
      supabase
        .from("players")
        .select("*")
        .eq("team_id", typedMatch.team_id)
        .order("name", { ascending: true }),
    ]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10">
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-2xl uppercase tracking-tight">
          {t("edit")}
        </h1>
        <MatchForm
          locale={locale}
          teams={(teams as Team[] | null) ?? []}
          opponents={(opponents as Opponent[] | null) ?? []}
          match={typedMatch}
        />
      </div>

      <MatchEventLog
        locale={locale}
        matchId={id}
        events={(events as MatchEvent[] | null) ?? []}
        players={(players as Player[] | null) ?? []}
      />
    </div>
  );
}
