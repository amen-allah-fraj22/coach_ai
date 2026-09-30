"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";

import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";

const STAT_FIELDS = [
  { name: "possessionPct", label: "possession", key: "possessionPct" },
  { name: "shots", label: "shots", key: "shots" },
  { name: "shotsOnTarget", label: "shotsOnTarget", key: "shotsOnTarget" },
  { name: "corners", label: "corners", key: "corners" },
  { name: "fouls", label: "fouls", key: "fouls" },
  { name: "yellowCards", label: "yellowCards", key: "yellowCards" },
  { name: "redCards", label: "redCards", key: "redCards" },
] as const;

function num(formData: FormData, key: string): number | undefined {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export function MatchForm({
  teams,
  opponents,
  match,
}: {
  teams: Doc<"teams">[];
  opponents: Doc<"opponents">[];
  match?: Doc<"matches">;
}) {
  const t = useTranslations("matches");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const create = useMutation(api.matches.create);
  const update = useMutation(api.matches.update);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const text = (k: string) => String(formData.get(k) ?? "").trim() || undefined;
    const opponentId = String(formData.get("opponentId") ?? "");
    const args = {
      teamId: String(formData.get("teamId") ?? "") as Doc<"matches">["teamId"],
      opponentId: (opponentId || undefined) as Doc<"matches">["opponentId"],
      matchDate: String(formData.get("matchDate") ?? ""),
      homeAway: String(formData.get("homeAway") ?? "home") as "home" | "away",
      competition: text("competition"),
      ourFormation: text("ourFormation"),
      opponentFormation: text("opponentFormation"),
      scoreFor: num(formData, "scoreFor"),
      scoreAgainst: num(formData, "scoreAgainst"),
      possessionPct: num(formData, "possessionPct"),
      shots: num(formData, "shots"),
      shotsOnTarget: num(formData, "shotsOnTarget"),
      corners: num(formData, "corners"),
      fouls: num(formData, "fouls"),
      yellowCards: num(formData, "yellowCards"),
      redCards: num(formData, "redCards"),
      coachNotes: text("coachNotes"),
    };
    try {
      if (match) {
        await update({ id: match._id, ...args });
      } else {
        await create(args);
      }
      router.push("/matches");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="matchDate">{t("date")}</Label>
          <Input id="matchDate" name="matchDate" type="date" required defaultValue={match?.matchDate ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="homeAway">{t("homeAway")}</Label>
          <SelectNative id="homeAway" name="homeAway" defaultValue={match?.homeAway ?? "home"}>
            <option value="home">{t("home")}</option>
            <option value="away">{t("away")}</option>
          </SelectNative>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="teamId">{t("team")}</Label>
          <SelectNative id="teamId" name="teamId" required defaultValue={match?.teamId ?? teams[0]?._id}>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </SelectNative>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="opponentId">{t("opponent")}</Label>
          <SelectNative id="opponentId" name="opponentId" defaultValue={match?.opponentId ?? ""}>
            <option value="">{tCommon("none")}</option>
            {opponents.map((opponent) => (
              <option key={opponent._id} value={opponent._id}>
                {opponent.teamName}
              </option>
            ))}
          </SelectNative>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="competition">{t("competition")}</Label>
        <Input id="competition" name="competition" defaultValue={match?.competition ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ourFormation">{t("ourFormation")}</Label>
          <Input id="ourFormation" name="ourFormation" placeholder="4-3-3" defaultValue={match?.ourFormation ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="opponentFormation">{t("opponentFormation")}</Label>
          <Input id="opponentFormation" name="opponentFormation" defaultValue={match?.opponentFormation ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scoreFor">{t("scoreFor")}</Label>
          <Input id="scoreFor" name="scoreFor" type="number" min={0} defaultValue={match?.scoreFor ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scoreAgainst">{t("scoreAgainst")}</Label>
          <Input id="scoreAgainst" name="scoreAgainst" type="number" min={0} defaultValue={match?.scoreAgainst ?? ""} />
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
        <Textarea id="coachNotes" name="coachNotes" defaultValue={match?.coachNotes ?? ""} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {match ? tCommon("save") : tCommon("create")}
      </Button>
    </form>
  );
}
