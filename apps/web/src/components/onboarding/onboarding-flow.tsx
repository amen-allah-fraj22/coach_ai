"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useTranslations } from "next-intl";

import { api } from "@convex/_generated/api";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";

const FORMATIONS = ["4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "3-4-3"];
const RISK_LEVELS = ["low", "medium", "high"] as const;

export function OnboardingFlow({
  locale,
  inviteToken,
}: {
  locale: Locale;
  inviteToken?: string;
}) {
  const t = useTranslations("onboarding");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const current = useQuery(api.coaches.getCurrentCoach);
  const invite = useQuery(
    api.invites.getInviteInfo,
    inviteToken ? { token: inviteToken } : "skip",
  );

  const createClub = useMutation(api.clubs.createClubAndOwner);
  const acceptInvite = useMutation(api.invites.acceptInvite);
  const updatePhilosophy = useMutation(api.coaches.updatePhilosophy);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // Once a coach exists we show the optional philosophy step before leaving.
  const [showPhilosophy, setShowPhilosophy] = useState(false);

  // Already onboarded and not mid-philosophy — go to the dashboard.
  useEffect(() => {
    if (current && !showPhilosophy) {
      router.replace("/dashboard");
    }
  }, [current, showPhilosophy, router]);

  async function handleCreateClub(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      await createClub({
        clubName: String(formData.get("clubName") ?? "").trim(),
        fullName: String(formData.get("fullName") ?? "").trim(),
        language: locale,
      });
      setShowPhilosophy(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  }

  async function handleAccept(formData: FormData) {
    if (!inviteToken) return;
    setError(null);
    setPending(true);
    try {
      await acceptInvite({
        token: inviteToken,
        fullName: String(formData.get("fullName") ?? "").trim(),
        language: locale,
      });
      router.replace("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  }

  async function handlePhilosophy(formData: FormData) {
    setPending(true);
    try {
      await updatePhilosophy({
        preferredFormation:
          String(formData.get("preferredFormation") ?? "").trim() || undefined,
        playingStyle: String(formData.get("playingStyle") ?? "").trim() || undefined,
        riskTolerance:
          (String(formData.get("riskTolerance") ?? "") as
            | "low"
            | "medium"
            | "high") || undefined,
      });
      router.replace("/dashboard");
    } finally {
      setPending(false);
    }
  }

  if (current === undefined) {
    return <p className="text-muted-foreground">{tCommon("loading")}</p>;
  }

  if (showPhilosophy) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <form action={handlePhilosophy} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="preferredFormation">{t("preferredFormation")}</Label>
            <SelectNative id="preferredFormation" name="preferredFormation" defaultValue="">
              <option value="">{tCommon("none")}</option>
              {FORMATIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </SelectNative>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="playingStyle">{t("playingStyle")}</Label>
            <Input id="playingStyle" name="playingStyle" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="riskTolerance">{t("riskTolerance")}</Label>
            <SelectNative id="riskTolerance" name="riskTolerance" defaultValue="medium">
              {RISK_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {t(`risk${level[0].toUpperCase()}${level.slice(1)}` as
                    | "riskLow"
                    | "riskMedium"
                    | "riskHigh")}
                </option>
              ))}
            </SelectNative>
          </div>
          <Button type="submit" disabled={pending} className="mt-2">
            {t("cta")}
          </Button>
        </form>
      </div>
    );
  }

  // Invite path: joining an existing club.
  if (inviteToken) {
    if (invite === undefined) {
      return <p className="text-muted-foreground">{tCommon("loading")}</p>;
    }
    if (!invite || !invite.valid) {
      return <p className="text-sm text-destructive">{tAuth("inviteExpired")}</p>;
    }
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-2xl uppercase tracking-tight">
          {tAuth("inviteTitle", { club: invite.clubName })}
        </h1>
        <form action={handleAccept} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">{tAuth("fullName")}</Label>
            <Input id="fullName" name="fullName" required autoComplete="name" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={pending}>
            {tAuth("inviteCta")}
          </Button>
        </form>
      </div>
    );
  }

  // Default path: create a new club.
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl uppercase tracking-tight">
        {tAuth("signupTab")}
      </h1>
      <form action={handleCreateClub} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="clubName">{tAuth("clubName")}</Label>
          <Input id="clubName" name="clubName" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">{tAuth("fullName")}</Label>
          <Input id="fullName" name="fullName" required autoComplete="name" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={pending}>
          {tCommon("create")}
        </Button>
      </form>
    </div>
  );
}
