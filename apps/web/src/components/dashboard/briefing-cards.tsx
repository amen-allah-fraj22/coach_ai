"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { PaperCard } from "@/components/ui/paper-card";
import { Chip } from "@/components/ui/chip";
import type { DashboardMatch } from "@/components/dashboard/match-header-band";

interface LatestRecommendation {
  headline: string | null;
  question: string;
  matchId: string | null;
}

export function BriefingCards({
  nextMatch,
  lastMatch,
  latestRecommendation,
}: {
  nextMatch: DashboardMatch | null;
  lastMatch: (DashboardMatch & { scoreFor?: number; scoreAgainst?: number }) | null;
  latestRecommendation: LatestRecommendation | null;
}) {
  const t = useTranslations("dashboard");

  const resultLabel =
    lastMatch?.scoreFor !== undefined && lastMatch?.scoreAgainst !== undefined
      ? lastMatch.scoreFor > lastMatch.scoreAgainst
        ? "W"
        : lastMatch.scoreFor < lastMatch.scoreAgainst
          ? "L"
          : "D"
      : null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <PaperCard rotate={-1} index={0}>
        <p className="mb-2 text-label-tactical text-touchline-red">{t("prepareTitle")}</p>
        {nextMatch ? (
          <>
            <p className="mb-4 text-sm text-night-pitch/80">
              {nextMatch.opponentName ?? "—"} · {nextMatch.matchDate}
            </p>
            <Link
              href={`/assistant?matchId=${nextMatch.id}`}
              className="font-display text-sm uppercase text-night-pitch hover:underline"
            >
              {t("deploy")}
            </Link>
          </>
        ) : (
          <p className="text-sm text-night-pitch/70">{t("prepareTeaserEmpty")}</p>
        )}
      </PaperCard>

      <PaperCard rotate={0} index={1}>
        <p className="mb-2 text-label-tactical text-touchline-red">{t("reviewTitle")}</p>
        {lastMatch ? (
          <>
            <div className="mb-4 flex items-center gap-2">
              {resultLabel && <Chip className="border-night-pitch/20 bg-transparent text-night-pitch">{resultLabel}</Chip>}
              <span className="font-display text-xl tabular-nums text-night-pitch">
                {lastMatch.scoreFor ?? "–"}–{lastMatch.scoreAgainst ?? "–"}
              </span>
              <span className="text-sm text-night-pitch/70">{lastMatch.opponentName ?? "—"}</span>
            </div>
            <Link
              href={`/matches/${lastMatch.id}`}
              className="font-display text-sm uppercase text-night-pitch hover:underline"
            >
              {t("expand")}
            </Link>
          </>
        ) : (
          <p className="text-sm text-night-pitch/70">{t("noLastMatch")}</p>
        )}
      </PaperCard>

      <PaperCard rotate={1} index={2}>
        <p className="mb-2 text-label-tactical text-touchline-red">{t("askTitle")}</p>
        {latestRecommendation ? (
          <>
            <p className="mb-4 line-clamp-2 text-sm text-night-pitch/80">
              {latestRecommendation.headline ?? latestRecommendation.question}
            </p>
            <Link
              href={
                latestRecommendation.matchId
                  ? `/assistant?matchId=${latestRecommendation.matchId}`
                  : "/assistant"
              }
              className="font-display text-sm uppercase text-night-pitch hover:underline"
            >
              {t("launch")}
            </Link>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-night-pitch/70">{t("noQuestionYet")}</p>
            <Link
              href="/assistant"
              className="font-display text-sm uppercase text-night-pitch hover:underline"
            >
              {t("launch")}
            </Link>
          </>
        )}
      </PaperCard>
    </div>
  );
}
