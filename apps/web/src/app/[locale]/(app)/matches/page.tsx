import { getTranslations } from "next-intl/server";

import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

function resultAccent(match: Doc<"matches">) {
  if (match.scoreFor === undefined || match.scoreAgainst === undefined) {
    return "bg-muted";
  }
  if (match.scoreFor > match.scoreAgainst) return "bg-secondary";
  if (match.scoreFor < match.scoreAgainst) return "bg-destructive";
  return "bg-muted-foreground";
}

export default async function MatchesPage() {
  const t = await getTranslations("matches");

  const [matches, teams, opponents] = await Promise.all([
    fetchAuthed(api.matches.list, {}),
    fetchAuthed(api.teams.list, {}),
    fetchAuthed(api.opponents.list, {}),
  ]);

  const list = (matches ?? []) as Doc<"matches">[];
  const teamList = (teams ?? []) as Doc<"teams">[];
  const opponentNames = new Map(
    ((opponents ?? []) as Doc<"opponents">[]).map((o) => [o._id, o.teamName]),
  );

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase tracking-tight">
          {t("title")}
        </h1>
        {teamList.length > 0 && (
          <div className="flex gap-2">
            <Button asChild variant="secondary">
              <Link href="/matches/import">{t("importMatch")}</Link>
            </Button>
            <Button asChild>
              <Link href="/matches/new">{t("addMatch")}</Link>
            </Button>
          </div>
        )}
      </div>

      {teamList.length === 0 ? (
        <p className="text-muted-foreground">{t("emptyNeedsTeam")}</p>
      ) : list.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((match) => (
            <li key={match._id}>
              <Link
                href={`/matches/${match._id}`}
                className="flex items-stretch gap-4 overflow-hidden rounded-md border border-border hover:border-primary"
              >
                <span className={`w-1.5 shrink-0 ${resultAccent(match)}`} aria-hidden />
                <span className="flex flex-1 items-center justify-between py-3 pe-4">
                  <span className="flex flex-col">
                    <span className="font-medium">
                      {match.opponentId
                        ? opponentNames.get(match.opponentId)
                        : t("unknownOpponent")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {match.matchDate} &middot;{" "}
                      {match.homeAway === "home" ? t("home") : t("away")}
                    </span>
                  </span>
                  <span className="font-display text-lg tabular-nums">
                    {match.scoreFor ?? "-"} : {match.scoreAgainst ?? "-"}
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
