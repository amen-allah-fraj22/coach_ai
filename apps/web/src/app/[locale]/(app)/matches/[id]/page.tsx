import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { MatchEventLog } from "@/components/matches/match-event-log";
import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { Monogram } from "@/components/dashboard/monogram";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("matches");
  const tCommon = await getTranslations("common");

  const match = await fetchAuthed(api.matches.get, { id: id as Id<"matches"> });
  if (!match) notFound();

  const [teams, opponents, players] = await Promise.all([
    fetchAuthed(api.teams.list, {}),
    fetchAuthed(api.opponents.list, {}),
    fetchAuthed(api.players.list, {}),
  ]);

  const team = ((teams ?? []) as Doc<"teams">[]).find((tm) => tm._id === match.teamId);
  const opponent = match.opponentId
    ? ((opponents ?? []) as Doc<"opponents">[]).find((o) => o._id === match.opponentId)
    : undefined;
  const teamPlayers = ((players ?? []) as Doc<"players">[]).filter(
    (p) => p.teamId === match.teamId,
  );

  const home = match.homeAway === "home" ? (team?.name ?? "—") : (opponent?.teamName ?? t("unknownOpponent"));
  const away = match.homeAway === "home" ? (opponent?.teamName ?? t("unknownOpponent")) : (team?.name ?? "—");

  const STAT_FIELDS = [
    ["possessionPct", match.possessionPct],
    ["shots", match.shots],
    ["shotsOnTarget", match.shotsOnTarget],
    ["corners", match.corners],
    ["fouls", match.fouls],
    ["yellowCards", match.yellowCards],
    ["redCards", match.redCards],
  ] as const;
  const recordedStats = STAT_FIELDS.filter(([, v]) => v !== undefined);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <div>
        <Link href="/matches" className="text-sm text-muted-foreground hover:text-chalk">
          ← {t("title")}
        </Link>

        <div className="mt-3 flex items-center justify-between gap-4 border border-hairline-08 bg-slate-grass px-6 py-6">
          <div className="flex flex-col items-center gap-1">
            <Monogram name={home} />
            <span className="text-xs text-muted-foreground">{home}</span>
          </div>
          <span className="font-display text-display-lg-mobile tabular-nums text-chalk">
            {match.scoreFor ?? "–"}:{match.scoreAgainst ?? "–"}
          </span>
          <div className="flex flex-col items-center gap-1">
            <Monogram name={away} />
            <span className="text-xs text-muted-foreground">{away}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {match.matchDate} · {match.competition ?? "—"}
          </span>
          <Link href={`/matches/${match._id}/edit`} className="text-chalk hover:underline">
            {tCommon("edit")}
          </Link>
        </div>
      </div>

      {recordedStats.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-headline-sm uppercase text-chalk">
            {t("postMatchDossier")}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {recordedStats.map(([key, value]) => (
              <div key={key} className="border border-hairline-08 bg-slate-grass px-3 py-2">
                <p className="text-label-tactical text-muted-foreground">{t(key)}</p>
                <p className="font-display text-lg tabular-nums text-chalk">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <MatchEventLog matchId={match._id} players={teamPlayers} />
    </div>
  );
}
