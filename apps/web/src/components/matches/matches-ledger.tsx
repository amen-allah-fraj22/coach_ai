"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";

import type { Doc, Id } from "@convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { tickerIn } from "@/lib/motion";

const PAGE_SIZE = 6;

function resultAccent(match: Doc<"matches">) {
  if (match.scoreFor === undefined || match.scoreAgainst === undefined) return "bg-hairline-16";
  if (match.scoreFor > match.scoreAgainst) return "bg-pitch-green";
  if (match.scoreFor < match.scoreAgainst) return "bg-touchline-red";
  return "bg-hairline-24";
}

export function MatchesLedger({
  matches,
  opponentNames,
}: {
  matches: Doc<"matches">[];
  opponentNames: Map<Id<"opponents">, string>;
}) {
  const t = useTranslations("matches");
  const [competition, setCompetition] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const competitions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of matches) {
      if (!m.competition) continue;
      counts.set(m.competition, (counts.get(m.competition) ?? 0) + 1);
    }
    return [...counts.entries()];
  }, [matches]);

  const filtered = competition ? matches.filter((m) => m.competition === competition) : matches;
  const sorted = [...filtered].sort((a, b) => b.matchDate.localeCompare(a.matchDate));
  const pageItems = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const remaining = Math.max(0, sorted.length - (page + 1) * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => { setCompetition(null); setPage(0); }}>
          <Chip status={competition === null ? "green" : undefined}>
            {t("allCompetitions")} ({matches.length})
          </Chip>
        </button>
        {competitions.map(([comp, count]) => (
          <button key={comp} type="button" onClick={() => { setCompetition(comp); setPage(0); }}>
            <Chip status={competition === comp ? "green" : undefined}>
              {comp} ({count})
            </Chip>
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {pageItems.map((match, i) => (
            <motion.li
              key={match._id}
              variants={tickerIn({ index: i })}
              initial="hidden"
              animate="show"
            >
              <Link
                href={`/matches/${match._id}`}
                className="group flex items-stretch gap-4 overflow-hidden border border-hairline-08 hover:border-chalk"
              >
                <span className={`w-1.5 shrink-0 ${resultAccent(match)}`} aria-hidden />
                <span className="flex flex-1 flex-col justify-center py-3 sm:flex-row sm:items-center sm:justify-between sm:pe-4">
                  <span className="flex flex-col">
                    <span className="font-medium text-chalk">
                      {match.opponentId ? opponentNames.get(match.opponentId) : t("unknownOpponent")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {match.matchDate} · {match.homeAway === "home" ? t("home") : t("away")}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-display text-lg tabular-nums text-chalk">
                      {match.scoreFor ?? "–"}:{match.scoreAgainst ?? "–"}
                    </span>
                    <span className="hidden text-xs text-muted-foreground group-hover:text-chalk sm:inline">
                      {t("matchCenter")}
                    </span>
                  </span>
                </span>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className="hidden items-center justify-between sm:flex">
        <Button type="button" variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          {t("prev")}
        </Button>
        <Button type="button" variant="secondary" size="sm" disabled={remaining === 0} onClick={() => setPage((p) => p + 1)}>
          {t("next")}
        </Button>
      </div>

      {remaining > 0 && (
        <Button type="button" variant="secondary" onClick={() => setPage((p) => p + 1)} className="sm:hidden">
          {t("loadOlderFixtures", { n: remaining })}
        </Button>
      )}
    </div>
  );
}
