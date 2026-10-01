import { getTranslations } from "next-intl/server";

import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function PlayersPage() {
  const t = await getTranslations("players");

  const [players, teams] = await Promise.all([
    fetchAuthed(api.players.list, {}),
    fetchAuthed(api.teams.list, {}),
  ]);

  const list = (players ?? []) as Doc<"players">[];
  const teamList = (teams ?? []) as Doc<"teams">[];
  const teamNames = new Map(teamList.map((team) => [team._id, team.name]));

  const sorted = [...list].sort(
    (a, b) =>
      a.squadGroup.localeCompare(b.squadGroup) || a.sortOrder - b.sortOrder,
  );
  const groups = sorted.reduce<Map<string, Doc<"players">[]>>((acc, player) => {
    const group = acc.get(player.squadGroup) ?? [];
    group.push(player);
    acc.set(player.squadGroup, group);
    return acc;
  }, new Map());

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-2xl uppercase tracking-tight">
            {t("title")}
          </h1>
          <nav className="flex gap-2 text-sm">
            <span className="font-semibold text-primary">{t("list")}</span>
            <Link
              href="/players/board"
              className="text-muted-foreground hover:text-foreground"
            >
              {t("board")}
            </Link>
          </nav>
        </div>
        {teamList.length > 0 && (
          <Button asChild>
            <Link href="/players/new">{t("addPlayer")}</Link>
          </Button>
        )}
      </div>

      {teamList.length === 0 ? (
        <p className="text-muted-foreground">{t("emptyNeedsTeam")}</p>
      ) : list.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-6">
          {[...groups.entries()].map(([group, groupPlayers]) => (
            <section key={group} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold uppercase text-muted-foreground">
                {group}
              </h2>
              <ul className="flex flex-col gap-2">
                {groupPlayers.map((player) => (
                  <li key={player._id}>
                    <Link
                      href={`/players/${player._id}`}
                      className="flex items-center justify-between rounded-md border border-border px-4 py-3 hover:border-primary"
                    >
                      <span className="flex items-center gap-3">
                        <span className="font-medium">{player.name}</span>
                        {player.position && (
                          <span className="text-xs text-muted-foreground">
                            {player.position}
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{teamNames.get(player.teamId)}</span>
                        <span
                          className={
                            player.availability === "available"
                              ? "text-secondary"
                              : "text-primary"
                          }
                        >
                          {t(`status.${player.availability}`)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
