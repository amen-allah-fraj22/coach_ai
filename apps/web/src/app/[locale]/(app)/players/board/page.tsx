import { getTranslations } from "next-intl/server";

import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { SquadBoard } from "@/components/players/squad-board";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function PlayersBoardPage() {
  const t = await getTranslations("players");

  // The board itself is live via useQuery; this server read only decides the
  // empty state (no team yet -> can't have players).
  const teams = ((await fetchAuthed(api.teams.list, {})) ?? []) as Doc<"teams">[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <nav className="flex gap-2 text-sm">
          <Link href="/players" className="text-muted-foreground hover:text-chalk">
            {t("list")}
          </Link>
          <span className="font-semibold text-chalk">{t("board")}</span>
        </nav>
        {teams.length > 0 && (
          <Button asChild size="sm">
            <Link href="/players/new">{t("registerAthlete")}</Link>
          </Button>
        )}
      </div>

      {teams.length === 0 ? (
        <p className="text-muted-foreground">{t("emptyNeedsTeam")}</p>
      ) : (
        <SquadBoard />
      )}
    </div>
  );
}
