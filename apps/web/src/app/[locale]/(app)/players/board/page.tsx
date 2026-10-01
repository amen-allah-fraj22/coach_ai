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
        <div className="flex items-center gap-4">
          <h1 className="font-display text-2xl uppercase tracking-tight">
            {t("squadBoard")}
          </h1>
          <nav className="flex gap-2 text-sm">
            <Link href="/players" className="text-muted-foreground hover:text-foreground">
              {t("list")}
            </Link>
            <span className="font-semibold text-primary">{t("board")}</span>
          </nav>
        </div>
        {teams.length > 0 && (
          <Button asChild>
            <Link href="/players/new">{t("addPlayer")}</Link>
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
