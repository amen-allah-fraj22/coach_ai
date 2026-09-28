"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import {
  createOpponent,
  updateOpponent,
  type OpponentActionState,
} from "@/app/[locale]/(app)/opponents/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Opponent } from "@/lib/types/database";

const initialState: OpponentActionState = { error: null };

const STYLE_FIELDS = [
  { name: "playingStyle", label: "playingStyle", key: "playing_style" },
  { name: "pressingStyle", label: "pressingStyle", key: "pressing_style" },
  { name: "buildUpStyle", label: "buildUpStyle", key: "build_up_style" },
  { name: "defensiveStyle", label: "defensiveStyle", key: "defensive_style" },
] as const;

const NOTE_FIELDS = [
  { name: "strengths", label: "strengths", key: "strengths" },
  { name: "weaknesses", label: "weaknesses", key: "weaknesses" },
  { name: "setPieceNotes", label: "setPieceNotes", key: "set_piece_notes" },
] as const;

export function OpponentForm({
  locale,
  opponent,
}: {
  locale: string;
  opponent?: Opponent;
}) {
  const t = useTranslations("opponents");
  const tCommon = useTranslations("common");
  const action = opponent
    ? updateOpponent.bind(null, opponent.id)
    : createOpponent;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="teamName">{t("teamName")}</Label>
        <Input
          id="teamName"
          name="teamName"
          required
          defaultValue={opponent?.team_name}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="usualFormation">{t("usualFormation")}</Label>
        <Input
          id="usualFormation"
          name="usualFormation"
          placeholder="4-2-3-1"
          defaultValue={opponent?.usual_formation ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {STYLE_FIELDS.map((field) => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>{t(field.label)}</Label>
            <Input
              id={field.name}
              name={field.name}
              defaultValue={opponent?.[field.key] ?? ""}
            />
          </div>
        ))}
      </div>

      {NOTE_FIELDS.map((field) => (
        <div key={field.name} className="flex flex-col gap-1.5">
          <Label htmlFor={field.name}>{t(field.label)}</Label>
          <Textarea
            id={field.name}
            name={field.name}
            defaultValue={opponent?.[field.key] ?? ""}
          />
        </div>
      ))}

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {opponent ? tCommon("save") : tCommon("create")}
      </Button>
    </form>
  );
}
