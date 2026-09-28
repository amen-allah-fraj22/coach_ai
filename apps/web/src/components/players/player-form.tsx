"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import {
  createPlayer,
  updatePlayer,
  type PlayerActionState,
} from "@/app/[locale]/(app)/players/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import type {
  Player,
  PlayerAvailability,
  PreferredFoot,
  Team,
} from "@/lib/types/database";

const initialState: PlayerActionState = { error: null };

const FEET: PreferredFoot[] = ["right", "left", "both"];
const AVAILABILITY: PlayerAvailability[] = [
  "available",
  "injured",
  "suspended",
  "unavailable",
];
const RATING_FIELDS = [
  { name: "technicalRating", label: "technical", key: "technical_rating" },
  { name: "physicalRating", label: "physical", key: "physical_rating" },
  { name: "tacticalRating", label: "tactical", key: "tactical_rating" },
  { name: "formRating", label: "form", key: "form_rating" },
] as const;

export function PlayerForm({
  locale,
  teams,
  player,
}: {
  locale: string;
  teams: Team[];
  player?: Player;
}) {
  const t = useTranslations("players");
  const tCommon = useTranslations("common");
  const action = player ? updatePlayer.bind(null, player.id) : createPlayer;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" name="name" required defaultValue={player?.name} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="teamId">{t("team")}</Label>
        <SelectNative
          id="teamId"
          name="teamId"
          required
          defaultValue={player?.team_id ?? teams[0]?.id}
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </SelectNative>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="position">{t("position")}</Label>
          <Input
            id="position"
            name="position"
            defaultValue={player?.position ?? ""}
            placeholder="CM"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="secondaryPosition">{t("secondaryPosition")}</Label>
          <Input
            id="secondaryPosition"
            name="secondaryPosition"
            defaultValue={player?.secondary_position ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dateOfBirth">{t("dateOfBirth")}</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={player?.date_of_birth ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="preferredFoot">{t("preferredFoot")}</Label>
          <SelectNative
            id="preferredFoot"
            name="preferredFoot"
            defaultValue={player?.preferred_foot ?? ""}
          >
            <option value="">{tCommon("none")}</option>
            {FEET.map((foot) => (
              <option key={foot} value={foot}>
                {t(`foot.${foot}`)}
              </option>
            ))}
          </SelectNative>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="availability">{t("availability")}</Label>
          <SelectNative
            id="availability"
            name="availability"
            defaultValue={player?.availability ?? "available"}
          >
            {AVAILABILITY.map((status) => (
              <option key={status} value={status}>
                {t(`status.${status}`)}
              </option>
            ))}
          </SelectNative>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="squadGroup">{t("squadGroup")}</Label>
          <Input
            id="squadGroup"
            name="squadGroup"
            defaultValue={player?.squad_group ?? "Squad"}
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">{t("ratings")}</legend>
        <div className="grid grid-cols-4 gap-3">
          {RATING_FIELDS.map((field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <Label htmlFor={field.name} className="text-xs">
                {t(field.label)}
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                min={1}
                max={10}
                defaultValue={player?.[field.key] ?? ""}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="coachNotes">{t("coachNotes")}</Label>
        <Textarea
          id="coachNotes"
          name="coachNotes"
          defaultValue={player?.coach_notes ?? ""}
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {player ? tCommon("save") : tCommon("create")}
      </Button>
    </form>
  );
}
