import { getTranslations } from "next-intl/server";

import { getCurrentCoach } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { Player, Team } from "@/lib/types/database";

export default async function PlayersPage() {
  const t = await getTranslations("players");

  const current = await getCurrentCoach();
  if (!current) return null;

  const supabase = await createClient();

  const [{ data: players }, { data: teams }] = await Promise.all([
    supabase
      .from("players")
      .select("*")
      .eq("club_id", current.club.id)
      .order("squad_group", { ascending: true })
      .order("sort_order", { ascending: true }),
    supabase.from("teams").select("*").eq("club_id", current.club.id),
  ]);

  const list = (players as Player[] | null) ?? [];
  const teamList = (teams as Team[] | null) ?? [];
  const teamNames = new Map(teamList.map((team) => [team.id, team.name]));

  const groups = list.reduce<Map<string, Player[]>>((acc, player) => {
    const group = acc.get(player.squad_group) ?? [];
    group.push(player);
    acc.set(player.squad_group, group);
    return acc;
  }, new Map());

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase tracking-tight">
          {t("title")}
        </h1>
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
                  <li key={player.id}>
                    <Link
                      href={`/players/${player.id}`}
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
                        <span>{teamNames.get(player.team_id)}</span>
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
