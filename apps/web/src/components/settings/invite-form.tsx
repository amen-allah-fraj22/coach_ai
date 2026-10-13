"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations, useLocale } from "next-intl";
import { motion, useReducedMotion } from "motion/react";

import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { stampPress } from "@/lib/motion";

export function InviteForm() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const reduced = useReducedMotion() ?? false;
  const createInvite = useMutation(api.invites.createInvite);

  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setInviteUrl(null);
    setPending(true);
    try {
      const { token } = await createInvite({
        email: String(formData.get("email") ?? "").trim(),
      });
      const base =
        process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      setInviteUrl(`${base}/${locale}/invite/${token}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <form action={onSubmit} className="flex items-end gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="inviteEmail">{t("inviteEmail")}</Label>
          <Input id="inviteEmail" name="email" type="email" required />
        </div>
        <motion.div whileTap={stampPress(reduced)}>
          <Button type="submit" disabled={pending}>
            {t("stampInvitationIssuePass")}
          </Button>
        </motion.div>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {inviteUrl && (
        <p className="border border-hairline-08 bg-slate-grass p-3 text-sm break-all text-chalk">
          {t("inviteSent")}
          <br />
          <span className="font-mono">{inviteUrl}</span>
        </p>
      )}
    </div>
  );
}
