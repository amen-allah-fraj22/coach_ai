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
import { FormationPicker } from "@/components/ui/formation-picker";
import { stampPress } from "@/lib/motion";

const AGE_CATEGORY_KEYS = ["ageSenior", "ageU23", "ageU21", "ageU18", "ageAcademy", "ageYouth"] as const;

export function TeamForm({ team }: { team?: Doc<"teams"> }) {
  const t = useTranslations("teams");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;

  const create = useMutation(api.teams.create);
  const update = useMutation(api.teams.update);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [ageCategory, setAgeCategory] = useState(team?.ageCategory ?? "");
  const [defaultFormation, setDefaultFormation] = useState(team?.defaultFormation ?? "");

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const args = {
      name: String(formData.get("name") ?? "").trim(),
      ageCategory: ageCategory || undefined,
      competition: String(formData.get("competition") ?? "").trim() || undefined,
      defaultFormation: defaultFormation || undefined,
    };
    try {
      if (team) {
        await update({ id: team._id, ...args });
      } else {
        await create(args);
      }
      router.push("/teams");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} data-theme="light" className="flex flex-col gap-4 border border-hairline-08 bg-paper p-6 text-chalk md:-rotate-1">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-chalk/70">{t("name")}</Label>
        <Input id="name" name="name" required defaultValue={team?.name} variant="underline" className="text-chalk" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-chalk/70">{t("ageCategory")}</Label>
        <div className="flex flex-wrap gap-1.5">
          {AGE_CATEGORY_KEYS.map((key) => {
            const label = t(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setAgeCategory(label)}
                className={`border px-2 py-1 text-xs uppercase ${
                  ageCategory === label
                    ? "border-chalk bg-chalk text-chalk"
                    : "border-chalk/30 text-chalk/70"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="competition" className="text-chalk/70">{t("competition")}</Label>
        <Input id="competition" name="competition" variant="underline" className="text-chalk" defaultValue={team?.competition ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-chalk/70">{t("defaultFormation")}</Label>
        <FormationPicker value={defaultFormation} onChange={setDefaultFormation} />
      </div>

      {error && <p className="text-sm text-red-ink">{error}</p>}

      <motion.div whileTap={stampPress(reduced)}>
        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {team ? tCommon("save") : t("stampCreateSquad")}
        </Button>
      </motion.div>
    </form>
  );
}
