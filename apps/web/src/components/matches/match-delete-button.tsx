"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useRouter } from "@/i18n/navigation";
import { ConfirmButton } from "@/components/ui/confirm-button";

export function MatchDeleteButton({ matchId }: { matchId: Id<"matches"> }) {
  const t = useTranslations("common");
  const router = useRouter();
  const removeMatch = useMutation(api.matches.remove);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <ConfirmButton
        onConfirm={() => {
          setError(null);
          removeMatch({ id: matchId })
            .then(() => router.push("/matches"))
            .catch((e) => setError(e instanceof Error ? e.message : String(e)));
        }}
        confirmLabel={t("confirm")}
        className="text-chalk hover:text-touchline-red hover:underline"
      >
        {t("delete")}
      </ConfirmButton>
      {error && <p className="text-xs text-touchline-red">{error}</p>}
    </>
  );
}
