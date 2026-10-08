"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";

import type { Doc, Id } from "@convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

const AVAILABILITY_DOT: Record<Doc<"players">["availability"], string> = {
  available: "bg-pitch-green",
  injured: "bg-touchline-red",
  suspended: "bg-touchline-red",
  unavailable: "bg-hairline-24",
};

export function PlayersLedger({
  players,
  teamNames,
}: {
  players: Doc<"players">[];
  teamNames: Map<Id<"teams">, string>;
}) {
  const t = useTranslations("players");
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<string | null>(null);

  const positions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of players) {
      if (!p.position) continue;
      counts.set(p.position, (counts.get(p.position) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [players]);

  const filtered = players.filter((p) => {
    if (position && p.position !== position) return false;
    if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="max-w-xs"
      />

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setPosition(null)}>
          <Chip status={position === null ? "green" : undefined}>
            {t("all")} ({players.length})
          </Chip>
        </button>
        {positions.map(([pos, count]) => (
          <button key={pos} type="button" onClick={() => setPosition(pos)}>
            <Chip status={position === pos ? "green" : undefined}>
              {pos} ({count})
            </Chip>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="search_off"
          title={t("noAthletesFound")}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch("");
                setPosition(null);
              }}
            >
              {t("resetFilters")}
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col border-t border-hairline-08">
          <AnimatePresence initial={false}>
            {filtered.map((player) => (
              <motion.li key={player._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Link
                  href={`/players/${player._id}`}
                  className="flex items-center gap-3 border-b border-hairline-08 px-2 py-3 hover:bg-slate-grass"
                >
                  <span className="w-8 shrink-0 font-display tabular-nums text-chalk">
                    {player.jerseyNumber ?? "–"}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium text-chalk">{player.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {teamNames.get(player.teamId)}
                    </span>
                  </span>
                  {player.position && (
                    <Chip className="hidden sm:inline-flex">{player.position}</Chip>
                  )}
                  <span
                    aria-hidden
                    className={`size-2 shrink-0 ${AVAILABILITY_DOT[player.availability]}`}
                    title={t(`status.${player.availability}`)}
                  />
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
