"use client";

import { useTranslations } from "next-intl";

import { Monogram } from "@/components/dashboard/monogram";
import { Chip } from "@/components/ui/chip";
import { Countdown } from "@/components/dashboard/countdown";

export interface DashboardMatch {
  id: string;
  teamName: string;
  opponentName: string | null;
  matchDate: string;
  kickoffTime?: string;
  homeAway: "home" | "away";
  competition?: string;
  ourFormation?: string;
  opponentFormation?: string;
}

export function MatchHeaderBand({ match }: { match: DashboardMatch | null }) {
  const t = useTranslations("dashboard");

  if (!match) {
    return (
      <div className="border border-hairline-08 bg-slate-grass px-6 py-8 text-center text-muted-foreground">
        {t("noNextMatch")}
      </div>
    );
  }

  const home = match.homeAway === "home" ? match.teamName : (match.opponentName ?? "—");
  const away = match.homeAway === "home" ? (match.opponentName ?? "—") : match.teamName;

  const target = new Date(`${match.matchDate}T${match.kickoffTime ?? "00:00"}:00`);

  return (
    <div className="flex flex-col items-center gap-6 border border-hairline-08 bg-slate-grass px-6 py-8 text-center md:flex-row md:justify-between md:text-start">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <Monogram name={home} />
          {match.ourFormation && match.homeAway === "home" && (
            <Chip className="text-[10px]">{match.ourFormation}</Chip>
          )}
        </div>
        <span className="font-display text-headline-sm text-muted-foreground">{t("vs")}</span>
        <div className="flex flex-col items-center gap-1">
          <Monogram name={away} />
          {match.ourFormation && match.homeAway === "away" && (
            <Chip className="text-[10px]">{match.ourFormation}</Chip>
          )}
        </div>
        {match.competition && (
          <span className="hidden text-label-tactical text-muted-foreground md:inline">
            {match.competition}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-label-tactical text-muted-foreground">{t("kickoffIn")}</span>
        <Countdown
          target={target}
          labels={{
            days: t("days"),
            hours: t("hours"),
            minutes: t("minutes"),
            seconds: t("seconds"),
          }}
        />
      </div>
    </div>
  );
}
