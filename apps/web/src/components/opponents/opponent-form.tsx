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
import { Textarea } from "@/components/ui/textarea";

const STYLE_FIELDS = [
  { name: "playingStyle", key: "playingStyle" },
  { name: "pressingStyle", key: "pressingStyle" },
  { name: "buildUpStyle", key: "buildUpStyle" },
  { name: "defensiveStyle", key: "defensiveStyle" },
] as const;

const NOTE_FIELDS = [
  { name: "strengths", key: "strengths" },
  { name: "weaknesses", key: "weaknesses" },
  { name: "setPieceNotes", key: "setPieceNotes" },
] as const;

export function OpponentForm({ opponent }: { opponent?: Doc<"opponents"> }) {
  const t = useTranslations("opponents");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const create = useMutation(api.opponents.create);
  const update = useMutation(api.opponents.update);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const text = (key: string) => String(formData.get(key) ?? "").trim() || undefined;
    const args = {
      teamName: String(formData.get("teamName") ?? "").trim(),
      usualFormation: text("usualFormation"),
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="teamName">{t("teamName")}</Label>
        <Input id="teamName" name="teamName" required defaultValue={opponent?.teamName} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="usualFormation">{t("usualFormation")}</Label>
        <Input
          id="usualFormation"
          name="usualFormation"
          placeholder="4-2-3-1"
          defaultValue={opponent?.usualFormation ?? ""}
        />
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
        <div key={field.name} className="flex flex-col gap-1.5">
          <Label htmlFor={field.name}>{t(field.name)}</Label>
          <Textarea id={field.name} name={field.name} defaultValue={opponent?.[field.key] ?? ""} />
        </div>
      ))}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {opponent ? tCommon("save") : tCommon("create")}
      </Button>
    </form>
  );
}
