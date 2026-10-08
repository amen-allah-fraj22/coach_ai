"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { Chip } from "@/components/ui/chip";
import { PitchDiagram, layoutFormation } from "@/components/ui/pitch-diagram";
import { FormationPicker } from "@/components/ui/formation-picker";
import { BottomSheet } from "@/components/ui/bottom-sheet";

function groupOf(position?: string): "GK" | "DEF" | "MID" | "FWD" | "OTHER" {
  if (!position) return "OTHER";
  if (position === "GK") return "GK";
  if (["LB", "CB", "RB"].includes(position)) return "DEF";
  if (["CDM", "CM", "CAM"].includes(position)) return "MID";
  if (["LW", "ST", "RW"].includes(position)) return "FWD";
  return "OTHER";
}

const GROUPS = ["GK", "DEF", "MID", "FWD"] as const;

export function TeamRosterBoard({
  team,
  players,
}: {
  team: Doc<"teams">;
  players: Doc<"players">[];
}) {
  const t = useTranslations("teams");
  const tPlayers = useTranslations("players");
  const tCommon = useTranslations("common");
  const updateTeam = useMutation(api.teams.update);

  const [formation, setFormation] = useState(team.defaultFormation ?? "4-3-3");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filter, setFilter] = useState<(typeof GROUPS)[number] | null>(null);

  const dots = useMemo(
    () =>
      layoutFormation(formation).map((dot, i) => ({
        ...dot,
        label: i === 0 ? "GK" : undefined,
      })),
    [formation],
  );

  const filtered = filter ? players.filter((p) => groupOf(p.position) === filter) : players;
  const counts = useMemo(() => {
    const c: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    for (const p of players) {
      const g = groupOf(p.position);
      if (g !== "OTHER") c[g] += 1;
    }
    return c;
  }, [players]);

  async function onFormationChange(next: string) {
    setFormation(next);
    setSheetOpen(false);
    await updateTeam({
      id: team._id as Id<"teams">,
      name: team.name,
      ageCategory: team.ageCategory,
      competition: team.competition,
      defaultFormation: next,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <h1 className="font-display text-display-lg-mobile uppercase text-chalk md:text-display-lg">
            {team.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {[team.ageCategory, team.competition].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-3 flex gap-3">
            <Link href={`/teams/${team._id}/edit`} className="text-sm text-muted-foreground hover:text-chalk">
              {tCommon("edit")}
            </Link>
            <Link href="/players/new" className="text-sm text-chalk underline underline-offset-4">
              {t("addPlayerCta")}
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex w-40 flex-col items-center gap-1"
          aria-label={t("changeFormation")}
        >
          <PitchDiagram dots={dots} className="w-40" />
          <Chip status="green">{formation}</Chip>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setFilter(null)}>
          <Chip status={filter === null ? "green" : undefined}>
            {t("positionAll")} ({players.length})
          </Chip>
        </button>
        {GROUPS.map((g) => (
          <button key={g} type="button" onClick={() => setFilter(g)}>
            <Chip status={filter === g ? "green" : undefined}>
              {g} ({counts[g]})
            </Chip>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">{t("noPlayersInTeam")}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {filtered.map((player) => (
            <li key={player._id}>
              <Link
                href={`/players/${player._id}`}
                className="flex items-center gap-2 border border-hairline-08 bg-slate-grass px-3 py-2 hover:border-chalk"
              >
                <span className="flex size-7 shrink-0 items-center justify-center border border-hairline-16 bg-night-pitch font-display text-xs tabular-nums text-chalk">
                  {player.jerseyNumber ?? "–"}
                </span>
                <span className="truncate text-sm text-chalk">{player.name}</span>
                <span className="ms-auto text-xs text-muted-foreground">
                  {player.position ?? tPlayers("position")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={t("changeFormation")}>
        <FormationPicker value={formation} onChange={onFormationChange} />
      </BottomSheet>
    </div>
  );
}
