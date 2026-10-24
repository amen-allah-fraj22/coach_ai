import { getTranslations } from "next-intl/server";

import type { DashboardMatch } from "@/components/dashboard/match-header-band";

export async function CampaignTrail({
  lastMatch,
  upcoming,
  pastCount,
}: {
  lastMatch: (DashboardMatch & { scoreFor?: number; scoreAgainst?: number }) | null;
  upcoming: DashboardMatch[];
  pastCount: number;
}) {
  const t = await getTranslations("dashboard");

  return (
    <div className="flex flex-col gap-4 border border-hairline-08 bg-slate-grass p-4">
      <span className="text-label-tactical text-muted-foreground">{t("campaignTrail")}</span>

      <ol className="flex flex-col gap-3 border-s border-hairline-16 ps-4">
        {lastMatch && (
          <li className="relative text-sm text-muted-foreground">
            <span className="absolute -start-[21px] top-1 size-2 bg-hairline-24" />
            {lastMatch.matchDate} · {lastMatch.opponentName ?? "—"}{" "}
            {lastMatch.scoreFor !== undefined && (
              <span className="tabular-nums text-chalk">
                {lastMatch.scoreFor}–{lastMatch.scoreAgainst}
              </span>
            )}
          </li>
        )}

        <li className="relative text-sm font-semibold text-chalk">
          <span className="absolute -start-[21px] top-1 flex size-2">
            <span className="absolute inline-flex size-2 animate-ping bg-touchline-red/75" />
            <span className="relative inline-flex size-2 bg-touchline-red" />
          </span>
          {t("youAreHere")}
        </li>

        {upcoming.map((match, i) => (
          <li
            key={match.id}
            className="relative text-sm text-muted-foreground"
            style={{ opacity: 1 - (i + 1) * 0.18 }}
          >
            <span className="absolute -start-[21px] top-1 size-2 bg-hairline-16" />
            {match.matchDate} · {match.opponentName ?? "—"}
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-1">
        <div className="h-1 w-full bg-hairline-16">
          <div
            className="h-1 bg-pitch-green"
            style={{ width: `${Math.min(100, pastCount * 8)}%` }}
          />
        </div>
        <span className="text-label-mono text-muted-foreground">
          {t("scheduleDensity", { n: pastCount })}
        </span>
      </div>
    </div>
  );
}
