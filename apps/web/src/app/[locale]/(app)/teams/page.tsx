import { getTranslations } from "next-intl/server";

import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { TeamsRoster } from "@/components/teams/teams-roster";

export default async function TeamsPage() {
  const t = await getTranslations("teams");
  const [teams, players] = await Promise.all([
    fetchAuthed(api.teams.list, {}),
    fetchAuthed(api.players.list, {}),
  ]);

  const teamList = (teams ?? []) as Doc<"teams">[];
  const playerCounts = new Map<string, number>();
  for (const p of (players ?? []) as Doc<"players">[]) {
    playerCounts.set(p.teamId, (playerCounts.get(p.teamId) ?? 0) + 1);
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-headline-sm uppercase text-chalk">{t("rosterBook")}</h1>
        <Button asChild size="sm" className="hidden md:inline-flex">
          <Link href="/teams/new">{t("registerNewSquad")}</Link>
        </Button>
      </div>

      {teamList.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <TeamsRoster teams={teamList} playerCounts={playerCounts} />
      )}

      <Button asChild className="md:hidden">
        <Link href="/teams/new">{t("registerNewSquad")}</Link>
      </Button>
    </div>
  );
}
