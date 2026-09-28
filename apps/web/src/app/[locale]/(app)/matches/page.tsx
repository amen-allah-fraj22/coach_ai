import { getTranslations } from "next-intl/server";

import { getCurrentCoach } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { Match, Opponent, Team } from "@/lib/types/database";

function resultAccent(match: Match) {
  if (match.score_for === null || match.score_against === null) {
    return "bg-muted";
  }
  if (match.score_for > match.score_against) return "bg-secondary";
  if (match.score_for < match.score_against) return "bg-primary";
  return "bg-muted-foreground";
}

export default async function MatchesPage() {
  const t = await getTranslations("matches");

  const current = await getCurrentCoach();
  if (!current) return null;

  const supabase = await createClient();
  const [{ data: matches }, { data: teams }, { data: opponents }] =
    await Promise.all([
      supabase
        .from("matches")
        .select("*")
        .eq("club_id", current.club.id)
        .order("match_date", { ascending: false }),
      supabase.from("teams").select("*").eq("club_id", current.club.id),
      supabase.from("opponents").select("*").eq("club_id", current.club.id),
    ]);

  const list = (matches as Match[] | null) ?? [];
  const teamList = (teams as Team[] | null) ?? [];
  const opponentNames = new Map(
    ((opponents as Opponent[] | null) ?? []).map((o) => [o.id, o.team_name]),
  );

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase tracking-tight">
          {t("title")}
        </h1>
        {teamList.length > 0 && (
          <Button asChild>
            <Link href="/matches/new">{t("addMatch")}</Link>
          </Button>
        )}
      </div>

      {teamList.length === 0 ? (
        <p className="text-muted-foreground">{t("emptyNeedsTeam")}</p>
      ) : list.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((match) => (
            <li key={match.id}>
              <Link
                href={`/matches/${match.id}`}
                className="flex items-stretch gap-4 overflow-hidden rounded-md border border-border hover:border-primary"
              >
                <span
                  className={`w-1.5 shrink-0 ${resultAccent(match)}`}
                  aria-hidden
                />
                <span className="flex flex-1 items-center justify-between py-3 pe-4">
                  <span className="flex flex-col">
                    <span className="font-medium">
                      {match.opponent_id
                        ? opponentNames.get(match.opponent_id)
                        : t("unknownOpponent")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {match.match_date} &middot;{" "}
                      {match.home_away === "home" ? t("home") : t("away")}
                    </span>
                  </span>
                  <span className="font-display text-lg tabular-nums">
                    {match.score_for ?? "-"} : {match.score_against ?? "-"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
