import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { MatchForm } from "@/components/matches/match-form";
import { MatchEventLog } from "@/components/matches/match-event-log";
import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("common");

  const match = await fetchAuthed(api.matches.get, { id: id as Id<"matches"> });
  if (!match) notFound();

  const [teams, opponents, players] = await Promise.all([
    fetchAuthed(api.teams.list, {}),
    fetchAuthed(api.opponents.list, {}),
    fetchAuthed(api.players.list, {}),
  ]);

  const teamPlayers = ((players ?? []) as Doc<"players">[]).filter(
    (p) => p.teamId === match.teamId,
  );

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10">
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-2xl uppercase tracking-tight">
          {t("edit")}
        </h1>
        <MatchForm
          teams={(teams ?? []) as Doc<"teams">[]}
          opponents={(opponents ?? []) as Doc<"opponents">[]}
          match={match}
        />
      </div>

      <MatchEventLog matchId={match._id} players={teamPlayers} />
    </div>
  );
}
