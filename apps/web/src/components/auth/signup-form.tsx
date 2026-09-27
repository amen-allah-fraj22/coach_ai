"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { signUpAndCreateClub, type ActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = { error: null };

export function SignupForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(
    signUpAndCreateClub,
    initialState,
  );

  if (state.message) {
    return <p className="text-sm text-secondary">{state.message}</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clubName">{t("clubName")}</Label>
        <Input id="clubName" name="clubName" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">{t("fullName")}</Label>
        <Input id="fullName" name="fullName" required autoComplete="name" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-email">{t("email")}</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-password">{t("password")}</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {t("signupCta")}
      </Button>
    </form>
  );
}
