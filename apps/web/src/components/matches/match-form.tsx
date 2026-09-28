"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import {
  createMatch,
  updateMatch,
  type MatchActionState,
} from "@/app/[locale]/(app)/matches/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import type { Match, Opponent, Team } from "@/lib/types/database";

const initialState: MatchActionState = { error: null };

const STAT_FIELDS = [
  { name: "possessionPct", label: "possession", key: "possession_pct" },
  { name: "shots", label: "shots", key: "shots" },
  { name: "shotsOnTarget", label: "shotsOnTarget", key: "shots_on_target" },
  { name: "corners", label: "corners", key: "corners" },
  { name: "fouls", label: "fouls", key: "fouls" },
  { name: "yellowCards", label: "yellowCards", key: "yellow_cards" },
  { name: "redCards", label: "redCards", key: "red_cards" },
] as const;

export function MatchForm({
  locale,
  teams,
  opponents,
  match,
}: {
  locale: string;
  teams: Team[];
  opponents: Opponent[];
  match?: Match;
}) {
  const t = useTranslations("matches");
  const tCommon = useTranslations("common");
  const action = match ? updateMatch.bind(null, match.id) : createMatch;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="matchDate">{t("date")}</Label>
          <Input
            id="matchDate"
            name="matchDate"
            type="date"
            required
            defaultValue={match?.match_date ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="homeAway">{t("homeAway")}</Label>
          <SelectNative
            id="homeAway"
            name="homeAway"
            defaultValue={match?.home_away ?? "home"}
          >
            <option value="home">{t("home")}</option>
            <option value="away">{t("away")}</option>
          </SelectNative>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="teamId">{t("team")}</Label>
          <SelectNative
            id="teamId"
            name="teamId"
            required
            defaultValue={match?.team_id ?? teams[0]?.id}
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </SelectNative>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="opponentId">{t("opponent")}</Label>
          <SelectNative
            id="opponentId"
            name="opponentId"
            defaultValue={match?.opponent_id ?? ""}
          >
            <option value="">{tCommon("none")}</option>
            {opponents.map((opponent) => (
              <option key={opponent.id} value={opponent.id}>
                {opponent.team_name}
              </option>
            ))}
          </SelectNative>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="competition">{t("competition")}</Label>
        <Input
          id="competition"
          name="competition"
          defaultValue={match?.competition ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ourFormation">{t("ourFormation")}</Label>
          <Input
            id="ourFormation"
            name="ourFormation"
            placeholder="4-3-3"
            defaultValue={match?.our_formation ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="opponentFormation">{t("opponentFormation")}</Label>
          <Input
            id="opponentFormation"
            name="opponentFormation"
            defaultValue={match?.opponent_formation ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scoreFor">{t("scoreFor")}</Label>
          <Input
            id="scoreFor"
            name="scoreFor"
            type="number"
            min={0}
            defaultValue={match?.score_for ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scoreAgainst">{t("scoreAgainst")}</Label>
          <Input
            id="scoreAgainst"
            name="scoreAgainst"
            type="number"
            min={0}
            defaultValue={match?.score_against ?? ""}
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">{t("stats")}</legend>
        <div className="grid grid-cols-3 gap-3">
          {STAT_FIELDS.map((field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <Label htmlFor={field.name} className="text-xs">
                {t(field.label)}
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                min={0}
                step={field.name === "possessionPct" ? "0.1" : "1"}
                defaultValue={match?.[field.key] ?? ""}
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
          defaultValue={match?.coach_notes ?? ""}
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {match ? tCommon("save") : tCommon("create")}
      </Button>
    </form>
  );
}
