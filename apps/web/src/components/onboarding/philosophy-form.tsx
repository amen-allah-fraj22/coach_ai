"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { updatePhilosophy, type ActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = { error: null };

const FORMATIONS = ["4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "3-4-3"];
const RISK_LEVELS = ["low", "medium", "high"] as const;

export function PhilosophyForm({ locale }: { locale: string }) {
  const t = useTranslations("onboarding");
  const [state, formAction, pending] = useActionState(
    updatePhilosophy,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="preferredFormation">{t("preferredFormation")}</Label>
        <select
          id="preferredFormation"
          name="preferredFormation"
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            {t("preferredFormation")}
          </option>
          {FORMATIONS.map((formation) => (
            <option key={formation} value={formation}>
              {formation}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="playingStyle">{t("playingStyle")}</Label>
        <Input id="playingStyle" name="playingStyle" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="riskTolerance">{t("riskTolerance")}</Label>
        <select
          id="riskTolerance"
          name="riskTolerance"
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          defaultValue="medium"
        >
          {RISK_LEVELS.map((level) => (
            <option key={level} value={level}>
              {t(`risk${level.charAt(0).toUpperCase()}${level.slice(1)}` as
                | "riskLow"
                | "riskMedium"
                | "riskHigh")}
            </option>
          ))}
        </select>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {t("cta")}
      </Button>
    </form>
  );
}
