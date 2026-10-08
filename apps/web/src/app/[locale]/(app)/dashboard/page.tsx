import { getTranslations } from "next-intl/server";

import { fetchAuthed, getServerCoach } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import { DemoSeedButton } from "@/components/dashboard/demo-seed-button";
import { MatchHeaderBand } from "@/components/dashboard/match-header-band";
import { BriefingCards } from "@/components/dashboard/briefing-cards";
import { InfoCards } from "@/components/dashboard/info-cards";
import { CampaignTrail } from "@/components/dashboard/campaign-trail";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const [current, summary] = await Promise.all([
    getServerCoach(),
    fetchAuthed(api.dashboard.summary, {}),
  ]);

  if (!current) return null; // (app) layout already redirects otherwise
  if (!summary) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl uppercase tracking-tight">
          {t("welcome", { name: current.coach.fullName })}
        </h1>
        <p className="text-muted-foreground">{t("club", { club: current.club.name })}</p>
      </div>

      {!summary.hasTeams && <DemoSeedButton />}

      <MatchHeaderBand match={summary.nextMatch} />

      <div>
        <h2 className="mb-4 font-display text-headline-sm uppercase text-chalk">
          {t("briefingDesk")}
        </h2>
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-6">
            <BriefingCards
              nextMatch={summary.nextMatch}
              lastMatch={summary.lastMatch}
              latestRecommendation={summary.latestRecommendation}
            />
            <InfoCards
              availability={summary.availability}
              nextOpponentWeakness={summary.nextOpponentWeakness}
            />
          </div>

          <CampaignTrail
            lastMatch={summary.lastMatch}
            upcoming={summary.upcoming}
            pastCount={summary.pastCount}
          />
        </div>
      </div>
    </div>
  );
}
