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

const FEET = ["right", "left", "both"] as const;
const AVAILABILITY = ["available", "injured", "suspended", "unavailable"] as const;
const RATING_FIELDS = [
  { name: "technicalRating", label: "technical", key: "technicalRating" },
  { name: "physicalRating", label: "physical", key: "physicalRating" },
  { name: "tacticalRating", label: "tactical", key: "tacticalRating" },
  { name: "formRating", label: "form", key: "formRating" },
] as const;

function num(formData: FormData, key: string): number | undefined {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
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

  const create = useMutation(api.players.create);
  const update = useMutation(api.players.update);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const args = {
      teamId: String(formData.get("teamId") ?? "") as Doc<"players">["teamId"],
      name: String(formData.get("name") ?? "").trim(),
      dateOfBirth: String(formData.get("dateOfBirth") ?? "").trim() || undefined,
      position: String(formData.get("position") ?? "").trim() || undefined,
      secondaryPosition:
        String(formData.get("secondaryPosition") ?? "").trim() || undefined,
      preferredFoot:
        (String(formData.get("preferredFoot") ?? "") as
          | "left"
          | "right"
          | "both") || undefined,
      availability: String(formData.get("availability") ?? "available") as
        | "available"
        | "injured"
        | "suspended"
        | "unavailable",
      technicalRating: num(formData, "technicalRating"),
      physicalRating: num(formData, "physicalRating"),
      tacticalRating: num(formData, "tacticalRating"),
      formRating: num(formData, "formRating"),
      coachNotes: String(formData.get("coachNotes") ?? "").trim() || undefined,
      squadGroup: String(formData.get("squadGroup") ?? "").trim() || "Squad",
    };
    try {
      if (player) {
        await update({ id: player._id, ...args });
      } else {
        await create(args);
      }
      router.push("/players");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" name="name" required defaultValue={player?.name} />
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

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="position">{t("position")}</Label>
          <Input id="position" name="position" defaultValue={player?.position ?? ""} placeholder="CM" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="secondaryPosition">{t("secondaryPosition")}</Label>
          <Input
            id="secondaryPosition"
            name="secondaryPosition"
            defaultValue={player?.secondaryPosition ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dateOfBirth">{t("dateOfBirth")}</Label>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={player?.dateOfBirth ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="preferredFoot">{t("preferredFoot")}</Label>
          <SelectNative id="preferredFoot" name="preferredFoot" defaultValue={player?.preferredFoot ?? ""}>
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
          <SelectNative id="availability" name="availability" defaultValue={player?.availability ?? "available"}>
            {AVAILABILITY.map((status) => (
              <option key={status} value={status}>
                {t(`status.${status}`)}
              </option>
            ))}
          </SelectNative>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="squadGroup">{t("squadGroup")}</Label>
          <Input id="squadGroup" name="squadGroup" defaultValue={player?.squadGroup ?? "Squad"} />
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
        <Textarea id="coachNotes" name="coachNotes" defaultValue={player?.coachNotes ?? ""} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {player ? tCommon("save") : tCommon("create")}
      </Button>
    </form>
  );
}
