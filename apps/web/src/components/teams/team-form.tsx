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

export function TeamForm({ team }: { team?: Doc<"teams"> }) {
  const t = useTranslations("teams");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const create = useMutation(api.teams.create);
  const update = useMutation(api.teams.update);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const args = {
      name: String(formData.get("name") ?? "").trim(),
      ageCategory: String(formData.get("ageCategory") ?? "").trim() || undefined,
      competition: String(formData.get("competition") ?? "").trim() || undefined,
      defaultFormation:
        String(formData.get("defaultFormation") ?? "").trim() || undefined,
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
    <form action={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" name="name" required defaultValue={team?.name} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ageCategory">{t("ageCategory")}</Label>
        <Input id="ageCategory" name="ageCategory" defaultValue={team?.ageCategory ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="competition">{t("competition")}</Label>
        <Input id="competition" name="competition" defaultValue={team?.competition ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="defaultFormation">{t("defaultFormation")}</Label>
        <Input
          id="defaultFormation"
          name="defaultFormation"
          defaultValue={team?.defaultFormation ?? ""}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {team ? tCommon("save") : tCommon("create")}
      </Button>
    </form>
  );
}
