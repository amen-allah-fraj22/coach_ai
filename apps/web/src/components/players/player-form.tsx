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
import { PlayerToken } from "@/components/players/player-token";
import { stampPress } from "@/lib/motion";

const FEET = ["right", "left", "both"] as const;
const AVAILABILITY = ["available", "injured", "suspended", "unavailable"] as const;
const SQUAD_GROUPS = ["Starting XI", "Bench", "Reserves", "Squad"];

// Pitch zone buttons; LCB/RCB fold into the stored "CB" position, matching
// the plan's "map LCB/RCB→CB etc. to stored string".
const POSITION_ZONES: { label: string; value: string }[] = [
  { label: "GK", value: "GK" },
  { label: "LB", value: "LB" },
  { label: "LCB", value: "CB" },
  { label: "RCB", value: "CB" },
  { label: "RB", value: "RB" },
  { label: "CDM", value: "CDM" },
  { label: "CM", value: "CM" },
  { label: "CAM", value: "CAM" },
  { label: "LW", value: "LW" },
  { label: "ST", value: "ST" },
  { label: "RW", value: "RW" },
];

const RATING_FIELDS = [
  { name: "technicalRating", label: "technical", key: "technicalRating" },
  { name: "physicalRating", label: "physical", key: "physicalRating" },
  { name: "tacticalRating", label: "tactical", key: "tacticalRating" },
  { name: "formRating", label: "form", key: "formRating" },
] as const satisfies readonly { name: string; label: string; key: keyof Doc<"players"> }[];

function RatingSlider({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label-tactical text-muted-foreground">
        {label} · {value}
      </span>
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className={`h-3 flex-1 ${i < value ? "bg-pitch-green" : "bg-hairline-16"}`}
          />
        ))}
      </div>
    </div>
  );
}

export function PlayerForm({
  teams,
  player,
}: {
  teams: Doc<"teams">[];
  player?: Doc<"players">;
}) {
  const t = useTranslations("players");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;

  const create = useMutation(api.players.create);
  const update = useMutation(api.players.update);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState(player?.name ?? "");
  const [jerseyNumber, setJerseyNumber] = useState(player?.jerseyNumber ?? 1);
  const [position, setPosition] = useState(player?.position ?? "");
  const [preferredFoot, setPreferredFoot] = useState(player?.preferredFoot ?? "right");
  const [availability, setAvailability] = useState(player?.availability ?? "available");
  const [squadGroup, setSquadGroup] = useState(player?.squadGroup ?? "Squad");
  const [ratings, setRatings] = useState({
    technicalRating: player?.technicalRating ?? 5,
    physicalRating: player?.physicalRating ?? 5,
    tacticalRating: player?.tacticalRating ?? 5,
    formRating: player?.formRating ?? 5,
  });

  const previewPlayer: Doc<"players"> = {
    ...(player ?? ({} as Doc<"players">)),
    _id: player?._id ?? ("preview" as Doc<"players">["_id"]),
    _creationTime: player?._creationTime ?? 0,
    clubId: player?.clubId ?? ("" as Doc<"players">["clubId"]),
    teamId: player?.teamId ?? teams[0]?._id ?? ("" as Doc<"players">["teamId"]),
    name: name || "—",
    jerseyNumber,
    position,
    availability,
    squadGroup,
    sortOrder: player?.sortOrder ?? 0,
    ...ratings,
  };

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const args = {
      teamId: String(formData.get("teamId") ?? "") as Doc<"players">["teamId"],
      name: name.trim(),
      jerseyNumber,
      dateOfBirth: String(formData.get("dateOfBirth") ?? "").trim() || undefined,
      position: position || undefined,
      secondaryPosition: String(formData.get("secondaryPosition") ?? "").trim() || undefined,
      preferredFoot,
      availability,
      ...ratings,
      coachNotes: String(formData.get("coachNotes") ?? "").trim() || undefined,
      squadGroup: squadGroup.trim() || "Squad",
    };
    try {
      setSubmitted(true);
      if (player) {
        await update({ id: player._id, ...args });
      } else {
        await create(args);
      }
      router.push("/players");
    } catch (e) {
      setSubmitted(false);
      setError(e instanceof Error ? e.message : String(e));
      setPending(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <form action={onSubmit} className="flex flex-col gap-4 order-2 lg:order-1">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t("jerseyNumber")}</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => setJerseyNumber((n) => Math.max(1, n - 1))}
            >
              <Icon name="remove" size={16} />
            </Button>
            <motion.span
              key={jerseyNumber}
              initial={{ rotateX: reduced ? 0 : 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              className="w-10 text-center font-display text-xl tabular-nums text-chalk"
            >
              {jerseyNumber}
            </motion.span>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => setJerseyNumber((n) => Math.min(99, n + 1))}
            >
              <Icon name="add" size={16} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="teamId">{t("team")}</Label>
          <SelectNative id="teamId" name="teamId" required defaultValue={player?.teamId ?? teams[0]?._id}>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </SelectNative>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t("position")}</Label>
          <div className="flex flex-wrap gap-1.5">
            {POSITION_ZONES.map((zone) => (
              <button
                key={zone.label}
                type="button"
                onClick={() => setPosition(zone.value)}
                className={`border px-2 py-1 text-xs ${
                  position === zone.value
                    ? "border-chalk bg-chalk text-night-pitch"
                    : "border-hairline-16 text-muted-foreground hover:text-chalk"
                }`}
              >
                {zone.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="secondaryPosition">{t("secondaryPosition")}</Label>
          <Input
            id="secondaryPosition"
            name="secondaryPosition"
            defaultValue={player?.secondaryPosition ?? ""}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dateOfBirth">{t("dateOfBirth")}</Label>
            <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={player?.dateOfBirth ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t("preferredFoot")}</Label>
            <div className="flex border border-hairline-16">
              {FEET.map((foot) => (
                <button
                  key={foot}
                  type="button"
                  onClick={() => setPreferredFoot(foot)}
                  className={`flex-1 px-2 py-2 text-xs uppercase ${
                    preferredFoot === foot ? "bg-chalk text-night-pitch" : "text-muted-foreground"
                  }`}
                >
                  {t(`foot.${foot}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t("availability")}</Label>
          <SelectNative value={availability} onChange={(e) => setAvailability(e.target.value as typeof availability)}>
            {AVAILABILITY.map((status) => (
              <option key={status} value={status}>
                {t(`status.${status}`)}
              </option>
            ))}
          </SelectNative>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t("squadGroup")}</Label>
          <div className="flex flex-wrap gap-1.5">
            {SQUAD_GROUPS.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setSquadGroup(group)}
                className={`border px-2 py-1 text-xs ${
                  squadGroup === group
                    ? "border-pitch-green bg-wash-green text-chalk"
                    : "border-hairline-16 text-muted-foreground hover:text-chalk"
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-chalk">{t("ratings")}</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {RATING_FIELDS.map((field) => (
              <RatingSlider
                key={field.name}
                value={ratings[field.key as keyof typeof ratings]}
                onChange={(v) => setRatings((r) => ({ ...r, [field.key]: v }))}
                label={t(field.label)}
              />
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="coachNotes">{t("coachNotes")}</Label>
          <Textarea id="coachNotes" name="coachNotes" defaultValue={player?.coachNotes ?? ""} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="mt-2 flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.push("/players")}>
            {t("discardDraft")}
          </Button>
          <motion.div whileTap={stampPress(reduced)} className="flex-1">
            <Button type="submit" disabled={pending} className="w-full">
              {player ? tCommon("save") : t("stampRegisterAthlete")}
            </Button>
          </motion.div>
        </div>
      </form>

      <div className="order-1 flex flex-col items-start gap-3 lg:order-2 lg:sticky lg:top-6">
        <Label>{t("name")}</Label>
        <motion.div animate={submitted ? { scale: [1, 1.02, 1] } : {}} transition={{ duration: 0.3 }}>
          <PlayerToken player={previewPlayer} />
        </motion.div>
      </div>
    </div>
  );
}
