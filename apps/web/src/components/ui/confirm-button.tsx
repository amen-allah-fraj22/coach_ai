"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/**
 * A destructive action that asks once before firing — no modal, just a
 * two-tap confirm that reverts after a few seconds. Used wherever a plain
 * delete button would otherwise fire immediately (design-implementation-plan
 * §8: "Delete confirmations").
 */
export function ConfirmButton({
  onConfirm,
  children,
  confirmLabel,
  className,
}: {
  onConfirm: () => void;
  children: React.ReactNode;
  confirmLabel: string;
  className?: string;
}) {
  const tCommon = useTranslations("common");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const id = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(id);
  }, [confirming]);

  if (confirming) {
    return (
      <button
        type="button"
        title={tCommon("confirmDelete")}
        onClick={() => {
          setConfirming(false);
          onConfirm();
        }}
        className={cn("border border-touchline-red bg-touchline-red px-2 py-1 text-xs uppercase text-chalk", className)}
      >
        {confirmLabel}
      </button>
    );
  }

  return (
    <button type="button" onClick={() => setConfirming(true)} className={className}>
      {children}
    </button>
  );
}
