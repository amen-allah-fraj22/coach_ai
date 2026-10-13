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
import { Textarea } from "@/components/ui/textarea";
import { FormationPicker } from "@/components/ui/formation-picker";
import { stampPress } from "@/lib/motion";

const STYLE_FIELDS = [
  { name: "playingStyle", key: "playingStyle" },
  { name: "pressingStyle", key: "pressingStyle" },
  { name: "buildUpStyle", key: "buildUpStyle" },
  { name: "defensiveStyle", key: "defensiveStyle" },
] as const;

const NOTE_FIELDS = [
  { name: "strengths", key: "strengths", tint: "bg-wash-green" },
  { name: "weaknesses", key: "weaknesses", tint: "bg-wash-red" },
  { name: "setPieceNotes", key: "setPieceNotes", tint: "bg-slate-grass" },
] as const;

export function OpponentForm({ opponent }: { opponent?: Doc<"opponents"> }) {
  const t = useTranslations("opponents");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;

  const create = useMutation(api.opponents.create);
  const update = useMutation(api.opponents.update);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [usualFormation, setUsualFormation] = useState(opponent?.usualFormation ?? "");

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const text = (key: string) => String(formData.get(key) ?? "").trim() || undefined;
    const args = {
      teamName: String(formData.get("teamName") ?? "").trim(),
      usualFormation: usualFormation || undefined,
      alternativeFormations: opponent?.alternativeFormations ?? [],
      playingStyle: text("playingStyle"),
      pressingStyle: text("pressingStyle"),
      buildUpStyle: text("buildUpStyle"),
      defensiveStyle: text("defensiveStyle"),
      strengths: text("strengths"),
      weaknesses: text("weaknesses"),
      setPieceNotes: text("setPieceNotes"),
    };
    try {
      if (opponent) {
        await update({ id: opponent._id, ...args });
      } else {
        await create(args);
      }
      router.push("/opponents");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      {!opponent && (
        <h2 className="font-display text-headline-sm uppercase text-chalk">
          {t("initialEncounterSpec")}
        </h2>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="teamName">{t("teamName")}</Label>
        <Input id="teamName" name="teamName" required defaultValue={opponent?.teamName} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("usualFormation")}</Label>
        <FormationPicker value={usualFormation} onChange={setUsualFormation} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {STYLE_FIELDS.map((field) => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>{t(field.name)}</Label>
            <Input id={field.name} name={field.name} defaultValue={opponent?.[field.key] ?? ""} />
          </div>
        ))}
      </div>

      {NOTE_FIELDS.map((field) => (
        <div key={field.name} className={`flex flex-col gap-1.5 p-3 ${field.tint}`}>
          <Label htmlFor={field.name} className="text-chalk">
            {t(field.name)}
          </Label>
          <Textarea
            id={field.name}
            name={field.name}
            defaultValue={opponent?.[field.key] ?? ""}
            className="border-0 bg-transparent"
          />
        </div>
      ))}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="mt-2 flex gap-2">
        <Button type="button" variant="secondary" onClick={() => router.push("/opponents")}>
          {t("discardDraft")}
        </Button>
        <motion.div whileTap={stampPress(reduced)} className="flex-1">
          <Button type="submit" disabled={pending} className="w-full">
            {opponent ? tCommon("save") : t("createScoutingDossier")}
          </Button>
        </motion.div>
      </div>
    </form>
  );
}
