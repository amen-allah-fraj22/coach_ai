import { getTranslations } from "next-intl/server";

import { fetchAuthed, getServerCoach } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { DemoSeedButton } from "@/components/dashboard/demo-seed-button";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const [current, teams] = await Promise.all([
    getServerCoach(),
    fetchAuthed(api.teams.list, {}),
  ]);

  if (!current) return null; // (app) layout already redirects otherwise

  const hasTeams = ((teams ?? []) as Doc<"teams">[]).length > 0;

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl uppercase tracking-tight">
          {t("welcome", { name: current.coach.fullName })}
        </h1>
        <p className="text-muted-foreground">
          {t("club", { club: current.club.name })}
        </p>
      </div>

      {!hasTeams && <DemoSeedButton />}
    </div>
  );
}
