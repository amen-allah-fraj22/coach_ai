"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useRouter } from "@/i18n/navigation";
import { ConfirmButton } from "@/components/ui/confirm-button";

export function OpponentDeleteButton({ opponentId }: { opponentId: Id<"opponents"> }) {
  const t = useTranslations("common");
  const router = useRouter();
  const removeOpponent = useMutation(api.opponents.remove);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <ConfirmButton
        onConfirm={() => {
          setError(null);
          removeOpponent({ id: opponentId })
            .then(() => router.push("/opponents"))
            .catch((e) => setError(e instanceof Error ? e.message : String(e)));
        }}
        confirmLabel={t("confirm")}
        className="text-sm text-muted-foreground hover:text-touchline-red"
      >
        {t("delete")}
      </ConfirmButton>
      {error && <p className="text-xs text-touchline-red">{error}</p>}
    </>
  );
}
