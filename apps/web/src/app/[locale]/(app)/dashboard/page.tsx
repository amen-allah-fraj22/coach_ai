import { getTranslations } from "next-intl/server";

import { getCurrentCoach } from "@/lib/auth/session";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const current = await getCurrentCoach();

  if (!current) return null; // (app) layout already redirects otherwise

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-display text-2xl uppercase tracking-tight">
        {t("welcome", { name: current.coach.full_name })}
      </h1>
      <p className="text-muted-foreground">{t("club", { club: current.club.name })}</p>
    </div>
  );
}
