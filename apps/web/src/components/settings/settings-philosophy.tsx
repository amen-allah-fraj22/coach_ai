"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";

import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormationPicker } from "@/components/ui/formation-picker";
import { Chip } from "@/components/ui/chip";

const RISK_LEVELS = ["low", "medium", "high"] as const;

export function SettingsPhilosophy({ coach }: { coach: Doc<"coaches"> }) {
  const t = useTranslations("onboarding");
  const tSettings = useTranslations("settings");
  const tCommon = useTranslations("common");
  const update = useMutation(api.coaches.updatePhilosophy);

  const [editing, setEditing] = useState(false);
  const [formation, setFormation] = useState(coach.preferredFormation ?? "");
  const [playingStyle, setPlayingStyle] = useState(coach.playingStyle ?? "");
  const [riskTolerance, setRiskTolerance] = useState(coach.riskTolerance ?? "medium");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSave() {
    setPending(true);
    try {
      await update({
        preferredFormation: formation || undefined,
        playingStyle: playingStyle.trim() || undefined,
        riskTolerance,
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setPending(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-chalk">
          {coach.preferredFormation ?? "—"} · {coach.playingStyle || "—"} ·{" "}
          {t(`risk${(coach.riskTolerance ?? "medium").replace(/^./, (c) => c.toUpperCase())}` as "riskLow" | "riskMedium" | "riskHigh")}
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(true)}>
            {tSettings("modifyShapeMatrix")}
          </Button>
          {saved && <span className="text-xs text-pitch-green">{tSettings("savedConfirmation")}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>{t("preferredFormation")}</Label>
        <FormationPicker value={formation} onChange={setFormation} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="playingStyle">{t("playingStyle")}</Label>
        <Input id="playingStyle" value={playingStyle} onChange={(e) => setPlayingStyle(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>{t("riskTolerance")}</Label>
        <div className="flex gap-2">
          {RISK_LEVELS.map((level) => (
            <button key={level} type="button" onClick={() => setRiskTolerance(level)}>
              <Chip status={riskTolerance === level ? "green" : undefined}>
                {t(`risk${level[0].toUpperCase()}${level.slice(1)}` as "riskLow" | "riskMedium" | "riskHigh")}
              </Chip>
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
          {tCommon("cancel")}
        </Button>
        <Button type="button" disabled={pending} onClick={onSave}>
          {tSettings("saveConfiguration")}
        </Button>
      </div>
    </div>
  );
}
