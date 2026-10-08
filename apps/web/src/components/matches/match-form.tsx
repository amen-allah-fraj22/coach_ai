"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";

import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { stampPress, flipDigit } from "@/lib/motion";

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

function ScoreStepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-label-tactical text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Button type="button" variant="secondary" size="icon" onClick={() => onChange(Math.max(0, value - 1))}>
          <Icon name="remove" size={16} />
        </Button>
        <motion.span
          key={value}
          initial={{ rotateX: reduced ? 0 : 90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          variants={flipDigit(reduced)}
          className="w-8 text-center font-display text-2xl tabular-nums text-chalk"
        >
          {value}
        </motion.span>
        <Button type="button" variant="secondary" size="icon" onClick={() => onChange(value + 1)}>
          <Icon name="add" size={16} />
        </Button>
      </div>
    </div>
  );
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
  const reduced = useReducedMotion() ?? false;

  const create = useMutation(api.matches.create);
  const update = useMutation(api.matches.update);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [homeAway, setHomeAway] = useState<"home" | "away">(match?.homeAway ?? "home");
  const [scoreFor, setScoreFor] = useState(match?.scoreFor ?? 0);
  const [scoreAgainst, setScoreAgainst] = useState(match?.scoreAgainst ?? 0);

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const text = (k: string) => String(formData.get(k) ?? "").trim() || undefined;
    const opponentId = String(formData.get("opponentId") ?? "");
    const args = {
      teamId: String(formData.get("teamId") ?? "") as Doc<"matches">["teamId"],
      opponentId: (opponentId || undefined) as Doc<"matches">["opponentId"],
      matchDate: String(formData.get("matchDate") ?? ""),
      homeAway,
      competition: text("competition"),
      ourFormation: text("ourFormation"),
      opponentFormation: text("opponentFormation"),
      scoreFor,
      scoreAgainst,
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
    <form
      action={onSubmit}
      className="flex flex-col gap-4 border-2 border-chalk bg-night-pitch p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-headline-sm uppercase text-chalk">
          {t("officialReportEntry")}
        </h2>
        <button
          type="button"
          onClick={() => router.push("/matches")}
          className="text-xs text-muted-foreground hover:text-chalk"
        >
          {t("dismissEsc")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="matchDate">{t("date")}</Label>
          <Input id="matchDate" name="matchDate" type="date" required defaultValue={match?.matchDate ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>{t("homeAway")}</Label>
          <div className="flex border border-hairline-16">
            {(["home", "away"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setHomeAway(opt)}
                className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-xs uppercase ${
                  homeAway === opt ? "bg-chalk text-night-pitch" : "text-muted-foreground"
                }`}
              >
                <Icon name={opt === "home" ? "stadium" : "flight"} size={14} />
                {opt === "home" ? t("homeGate") : t("awayGate")}
              </button>
            ))}
          </div>
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

      <div className="flex items-center justify-center gap-6 border-y border-hairline-08 py-4">
        <ScoreStepper value={scoreFor} onChange={setScoreFor} label={t("scoreFor")} />
        <span className="font-display text-xl text-muted-foreground">vs</span>
        <ScoreStepper value={scoreAgainst} onChange={setScoreAgainst} label={t("scoreAgainst")} />
      </div>

      <details className="flex flex-col gap-3">
        <summary className="cursor-pointer text-sm font-medium text-chalk">{t("matchStats")}</summary>
        <div className="mt-3 grid grid-cols-3 gap-3">
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
      </details>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="coachNotes">{t("coachNotes")}</Label>
        <Textarea id="coachNotes" name="coachNotes" defaultValue={match?.coachNotes ?? ""} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <motion.div whileTap={stampPress(reduced)}>
        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {match ? tCommon("save") : t("stampRecordFixture")}
        </Button>
      </motion.div>
    </form>
  );
}
