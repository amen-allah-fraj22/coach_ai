"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { createInvite, type InviteState } from "@/app/[locale]/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: InviteState = { error: null };

export function InviteForm({ locale }: { locale: string }) {
  const t = useTranslations("settings");
  const [state, formAction, pending] = useActionState(createInvite, initialState);

  return (
    <div className="flex flex-col gap-3">
      <form action={formAction} className="flex items-end gap-3">
        <input type="hidden" name="locale" value={locale} />
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="inviteEmail">{t("inviteEmail")}</Label>
          <Input id="inviteEmail" name="email" type="email" required />
        </div>
        <Button type="submit" disabled={pending}>
          {t("inviteCoach")}
        </Button>
      </form>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      {state.inviteUrl && (
        <p className="rounded-md bg-muted p-3 text-sm break-all">
          {t("inviteSent")}
          <br />
          <span className="font-mono text-foreground">{state.inviteUrl}</span>
        </p>
      )}
    </div>
  );
}
