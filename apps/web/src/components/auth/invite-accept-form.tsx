"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { acceptInvite, type ActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = { error: null };

export function InviteAcceptForm({
  locale,
  token,
  email,
}: {
  locale: string;
  token: string;
  email: string;
}) {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(acceptInvite, initialState);

  if (state.message) {
    return <p className="text-sm text-secondary">{state.message}</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">{t("fullName")}</Label>
        <Input id="fullName" name="fullName" required autoComplete="name" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-email">{t("email")}</Label>
        <Input
          id="invite-email"
          name="email"
          type="email"
          required
          defaultValue={email}
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-password">{t("password")}</Label>
        <Input
          id="invite-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {t("inviteCta")}
      </Button>
    </form>
  );
}
