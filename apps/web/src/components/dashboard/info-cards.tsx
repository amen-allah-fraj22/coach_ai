import { getTranslations } from "next-intl/server";

import { Panel, PanelHeader } from "@/components/ui/panel";
import { RatingBar } from "@/components/ui/rating-bar";

interface Availability {
  available: number;
  injured: number;
  suspended: number;
  unavailable: number;
}

export async function InfoCards({
  availability,
  nextOpponentWeakness,
}: {
  availability: Availability;
  nextOpponentWeakness: string | null;
}) {
  const t = await getTranslations("dashboard");
  const tPlayers = await getTranslations("players");
  const total = availability.available + availability.injured + availability.suspended + availability.unavailable;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel>
        <PanelHeader>
          <span className="text-label-tactical text-muted-foreground">{t("squadAvailability")}</span>
        </PanelHeader>
        <div className="flex flex-col gap-3 p-4">
          {(["available", "injured", "suspended", "unavailable"] as const).map((status) => (
            <RatingBar
              key={status}
              value={availability[status]}
              max={Math.max(total, 1)}
              label={`${tPlayers(`status.${status}`)} · ${availability[status]}`}
            />
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader>
          <span className="text-label-tactical text-muted-foreground">
            {t("nextOpponentWeakness")}
          </span>
        </PanelHeader>
        <div className="p-4 text-sm text-muted-foreground">
          {nextOpponentWeakness || t("noWeaknessNoted")}
        </div>
      </Panel>
    </div>
  );
}
