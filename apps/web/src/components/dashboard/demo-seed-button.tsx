"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";

import { api } from "@convex/_generated/api";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function DemoSeedButton() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const seed = useMutation(api.demo.seedDemoData);
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      await seed({});
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border p-4">
      <p className="text-sm text-muted-foreground">{t("emptyHint")}</p>
      <Button type="button" onClick={onClick} disabled={pending}>
        {pending ? t("loadingDemo") : t("loadDemo")}
      </Button>
    </div>
  );
}
