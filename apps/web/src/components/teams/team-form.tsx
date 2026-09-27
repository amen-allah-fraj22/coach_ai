"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { createTeam, updateTeam, type TeamActionState } from "@/app/[locale]/(app)/teams/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Team } from "@/lib/types/database";

const initialState: TeamActionState = { error: null };

export function TeamForm({ locale, team }: { locale: string; team?: Team }) {
  const t = useTranslations("teams");
  const tCommon = useTranslations("common");
  const action = team ? updateTeam.bind(null, team.id) : createTeam;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" name="name" required defaultValue={team?.name} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ageCategory">{t("ageCategory")}</Label>
        <Input
          id="ageCategory"
          name="ageCategory"
          defaultValue={team?.age_category ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="competition">{t("competition")}</Label>
        <Input
          id="competition"
          name="competition"
          defaultValue={team?.competition ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="defaultFormation">{t("defaultFormation")}</Label>
        <Input
          id="defaultFormation"
          name="defaultFormation"
          defaultValue={team?.default_formation ?? ""}
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {team ? tCommon("save") : tCommon("create")}
      </Button>
    </form>
  );
}
