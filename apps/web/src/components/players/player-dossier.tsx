"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import type { Doc } from "@convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { RadarChart } from "@/components/ui/radar-chart";
import { arcEnter } from "@/lib/motion";

interface RecentMatchRow {
  id: string;
  matchDate: string;
  opponentName: string;
  minute: number;
  eventType: string;
}

interface PeerAverage {
  technicalRating: number;
  physicalRating: number;
  tacticalRating: number;
  formRating: number;
  count: number;
}

function ageFromDob(dob?: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  return Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 3600 * 1000));
}

export function PlayerDossier({
  player,
  recentMatches,
  peerAverage,
}: {
  player: Doc<"players">;
  recentMatches: RecentMatchRow[];
  peerAverage: PeerAverage | null;
}) {
  const t = useTranslations("players");
  const tEvents = useTranslations("events");
  const tCommon = useTranslations("common");
  const reduced = useReducedMotion() ?? false;
  const [tab, setTab] = useState("notes");
  const age = ageFromDob(player.dateOfBirth);

  const ratings = {
    technical: player.technicalRating ?? 0,
    physical: player.physicalRating ?? 0,
    tactical: player.tacticalRating ?? 0,
    form: player.formRating ?? 0,
  };
  const topStrength = Object.entries(ratings).sort((a, b) => b[1] - a[1])[0];

  const askQuestion = encodeURIComponent(`What do you think about ${player.name}?`);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/players" className="text-sm text-muted-foreground hover:text-chalk">
        ← {t("backToSquad")}
      </Link>

      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-3">
          <p className="text-label-tactical text-muted-foreground">{t("dossier")}</p>
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center border border-hairline-16 bg-slate-grass font-display text-lg tabular-nums text-chalk">
              {player.jerseyNumber ?? "–"}
            </span>
            <div>
              <h1 className="font-display text-headline-md uppercase text-chalk">
                {player.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {player.position ?? "—"} {age !== null && `· ${age} ${t("age")}`} ·{" "}
                {t(`status.${player.availability}`)}
              </p>
            </div>
          </div>

          {topStrength && (
            <p className="text-sm text-muted-foreground">
              {t("evaluatedStrengths")}:{" "}
              <span className="text-chalk">
                {t(topStrength[0] as "technical" | "physical" | "tactical" | "form")} ({topStrength[1]})
              </span>
            </p>
          )}
        </div>

        <RadarChart
          size={160}
          axes={[
            { label: t("technical"), value: ratings.technical },
            { label: t("physical"), value: ratings.physical },
            { label: t("tactical"), value: ratings.tactical },
            { label: t("form"), value: ratings.form },
          ]}
        />
      </div>

      <div className="flex gap-2">
        <Button asChild variant="primary">
          <Link href={`/assistant?question=${askQuestion}`}>{t("askAboutPlayer")}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href={`/players/${player._id}/edit`}>{tCommon("edit")}</Link>
        </Button>
      </div>

      <SegmentedTabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "notes", label: t("coachNotesTab") },
          { value: "matches", label: t("recentMatchesTab") },
          { value: "peers", label: t("peerComparisonsTab") },
        ]}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          variants={arcEnter({ direction: "horizontal" }, reduced)}
          initial="hidden"
          animate="show"
        >
          {tab === "notes" && (
            <p className="italic text-muted-foreground">
              {player.coachNotes || t("noNotes")}
            </p>
          )}

          {tab === "matches" && (
            <ul className="flex flex-col gap-2">
              {recentMatches.length === 0 ? (
                <p className="text-muted-foreground">{t("noRecentMatches")}</p>
              ) : (
                recentMatches.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center gap-3 border-b border-hairline-08 py-2 text-sm"
                  >
                    <span className="font-display tabular-nums text-chalk">{row.minute}&apos;</span>
                    <span className="text-chalk">{tEvents(`types.${row.eventType}`)}</span>
                    <span className="text-muted-foreground">
                      {row.matchDate} · {row.opponentName}
                    </span>
                  </li>
                ))
              )}
            </ul>
          )}

          {tab === "peers" && (
            <div className="flex flex-col gap-3">
              {peerAverage ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {t("squadAverage", { position: player.position ?? "—" })} ({peerAverage.count})
                  </p>
                  {(["technicalRating", "physicalRating", "tacticalRating", "formRating"] as const).map(
                    (key) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t(key.replace("Rating", "") as "technical" | "physical" | "tactical" | "form")}</span>
                        <span className="tabular-nums text-chalk">
                          {player[key] ?? 0} <span className="text-muted-foreground">vs {peerAverage[key].toFixed(1)}</span>
                        </span>
                      </div>
                    ),
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">{t("noNotes")}</p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
