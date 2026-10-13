import { getTranslations } from "next-intl/server";

import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PlayersLedger } from "@/components/players/players-ledger";

export default async function PlayersPage() {
  const t = await getTranslations("players");

  const [players, teams] = await Promise.all([
    fetchAuthed(api.players.list, {}),
    fetchAuthed(api.teams.list, {}),
  ]);

  const list = (players ?? []) as Doc<"players">[];
  const teamList = (teams ?? []) as Doc<"teams">[];
  const teamNames = new Map(teamList.map((team) => [team._id, team.name]));

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-headline-sm uppercase text-chalk">
            {t("scoutingLedger")}
          </h1>
          <nav className="flex gap-2 text-sm">
            <span className="font-semibold text-chalk">{t("list")}</span>
            <Link href="/players/board" className="text-muted-foreground hover:text-chalk">
              {t("board")}
            </Link>
          </nav>
        </div>
        {teamList.length > 0 && (
          <Button asChild>
            <Link href="/players/new">{t("registerAthlete")}</Link>
          </Button>
        )}
      </div>

      {teamList.length === 0 ? (
        <p className="text-muted-foreground">{t("emptyNeedsTeam")}</p>
      ) : list.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <PlayersLedger players={list} teamNames={teamNames} />
      )}
    </div>
  );
}
