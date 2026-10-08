"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";

import type { Doc } from "@convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { Chip } from "@/components/ui/chip";
import { arcEnter } from "@/lib/motion";

export function TeamsRoster({
  teams,
  playerCounts,
}: {
  teams: Doc<"teams">[];
  playerCounts: Map<string, number>;
}) {
  const t = useTranslations("teams");
  const [hovered, setHovered] = useState<Doc<"teams"> | null>(teams[0] ?? null);
  const [filter, setFilter] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const team of teams) if (team.ageCategory) set.add(team.ageCategory);
    return [...set];
  }, [teams]);

  const filtered = filter ? teams.filter((t) => t.ageCategory === filter) : teams;

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile: filter chips */}
      <div className="flex flex-wrap gap-2 md:hidden">
        <button type="button" onClick={() => setFilter(null)}>
          <Chip status={filter === null ? "green" : undefined}>
            {t("allSquads")} ({teams.length})
          </Chip>
        </button>
        {categories.map((cat) => (
          <button key={cat} type="button" onClick={() => setFilter(cat)}>
            <Chip status={filter === cat ? "green" : undefined}>{cat}</Chip>
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
        {/* Folder-index tabs (desktop) / rows (mobile) */}
        <ul className="flex flex-col border-s border-hairline-16">
          {filtered.map((team) => (
            <li key={team._id} onMouseEnter={() => setHovered(team)}>
              <Link
                href={`/teams/${team._id}`}
                className="flex items-center justify-between gap-3 border-b border-hairline-08 px-3 py-3 hover:bg-slate-grass"
              >
                <span className="font-display uppercase text-chalk">{team.name}</span>
                <span className="text-xs text-muted-foreground">
                  {playerCounts.get(team._id) ?? 0} {t("players")}
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/teams/new"
              className="flex items-center border-b border-dashed border-hairline-16 px-3 py-3 text-sm text-muted-foreground hover:text-chalk"
            >
              {t("newSquadFolder")}
            </Link>
          </li>
        </ul>

        {/* Hover summary panel (desktop only) */}
        <div className="hidden md:block">
          <AnimatePresence mode="wait">
            {hovered && (
              <motion.div
                key={hovered._id}
                variants={arcEnter({ direction: "horizontal" })}
                initial="hidden"
                animate="show"
                className="border border-hairline-08 bg-slate-grass p-5"
              >
                <h2 className="font-display text-headline-md uppercase text-chalk">
                  {hovered.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[hovered.ageCategory, hovered.competition].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-4 text-sm text-chalk">
                  {playerCounts.get(hovered._id) ?? 0} {t("players")}
                </p>
                {hovered.defaultFormation && (
                  <Chip status="green" className="mt-3">
                    {hovered.defaultFormation}
                  </Chip>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
