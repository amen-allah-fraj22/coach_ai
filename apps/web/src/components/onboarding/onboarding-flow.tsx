"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { api } from "@convex/_generated/api";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaperCard } from "@/components/ui/paper-card";
import { FormationPicker } from "@/components/ui/formation-picker";
import { RiskSlider } from "@/components/onboarding/risk-slider";
import { pageTurn } from "@/lib/motion";

const TOTAL_STEPS = 3;

export function OnboardingFlow({
  locale,
  inviteToken,
  defaultFullName,
  defaultClubName,
}: {
  locale: Locale;
  inviteToken?: string;
  defaultFullName?: string;
  defaultClubName?: string;
}) {
  const t = useTranslations("onboarding");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;

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
  const [accepted, setAccepted] = useState(false);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [fullName, setFullName] = useState(defaultFullName ?? "");
  const [clubName, setClubName] = useState(defaultClubName ?? "");
  const [preferredFormation, setPreferredFormation] = useState("");
  const [playingStyle, setPlayingStyle] = useState("");
  const [riskTolerance, setRiskTolerance] = useState<"low" | "medium" | "high">("medium");

  useEffect(() => {
    if (current && !accepted) {
      router.replace("/dashboard");
    }
  }, [current, accepted, router]);

  function goNext() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleComplete() {
    setError(null);
    setPending(true);
    try {
      await createClub({ clubName: clubName.trim(), fullName: fullName.trim(), language: locale });
      await updatePhilosophy({
        preferredFormation: preferredFormation || undefined,
        playingStyle: playingStyle.trim() || undefined,
        riskTolerance,
      });
      router.replace("/dashboard");
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
      setAccepted(true);
      router.replace("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  }

  if (current === undefined) {
    return <p className="text-muted-foreground">{tCommon("loading")}</p>;
  }

  // Invite path: joining an existing club — a pinned-note card, not the wizard.
  if (inviteToken) {
    if (invite === undefined) {
      return <p className="text-muted-foreground">{tCommon("loading")}</p>;
    }
    if (!invite || !invite.valid) {
      return <p className="text-sm text-destructive">{tAuth("inviteExpired")}</p>;
    }
    return (
      <PaperCard rotate={-1.5} className="flex flex-col gap-6">
        <div>
          <p className="text-label-tactical text-muted-foreground">{t("inviteAcceptedTitle")}</p>
          <h1 className="font-display text-headline-md uppercase">
            {tAuth("inviteTitle", { club: invite.clubName })}
          </h1>
        </div>
        <form action={handleAccept} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">{tAuth("fullName")}</Label>
            <Input id="fullName" name="fullName" required autoComplete="name" className="border-night-pitch/30 text-night-pitch" />
          </div>
          {error && <p className="text-sm text-touchline-red">{error}</p>}
          <Button type="submit" disabled={pending} variant="primary">
            {tAuth("inviteCta")}
          </Button>
        </form>
      </PaperCard>
    );
  }

  // Default path: create a new club, as a 3-step clipboard wizard.
  return (
    <div className="flex flex-col gap-6 border border-hairline-08 bg-slate-grass p-6 md:-rotate-1">
      <div className="flex items-center justify-between">
        <span className="text-label-tactical text-muted-foreground">
          {t("stepOf", { current: step, total: TOTAL_STEPS })}
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={i + 1 <= step ? "size-2 bg-touchline-red" : "size-2 bg-hairline-16"}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {step === 1 && (
          <motion.div
            key="step1"
            custom={direction}
            variants={pageTurn(direction, reduced)}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col gap-5"
          >
            <h1 className="font-display text-headline-md uppercase text-chalk">
              {t("step1Title")}
            </h1>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">{tAuth("fullName")}</Label>
              <Input
                id="fullName"
                variant="underline"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clubName">{tAuth("clubName")}</Label>
              <Input
                id="clubName"
                variant="underline"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                required
              />
            </div>
            <Button
              type="button"
              disabled={!fullName.trim() || !clubName.trim()}
              onClick={goNext}
              className="mt-2"
            >
              {t("next")}
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            custom={direction}
            variants={pageTurn(direction, reduced)}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col gap-5"
          >
            <h1 className="font-display text-headline-md uppercase text-chalk">
              {t("step2Title")}
            </h1>
            <div className="flex flex-col gap-1.5">
              <Label>{t("formation")}</Label>
              <FormationPicker value={preferredFormation} onChange={setPreferredFormation} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="playingStyle">{t("playingStyle")}</Label>
              <Input
                id="playingStyle"
                value={playingStyle}
                onChange={(e) => setPlayingStyle(e.target.value)}
              />
            </div>
            <div className="mt-2 flex gap-2">
              <Button type="button" variant="secondary" onClick={goBack}>
                {t("back")}
              </Button>
              <Button type="button" onClick={goNext} className="flex-1">
                {t("next")}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            custom={direction}
            variants={pageTurn(direction, reduced)}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col gap-5"
          >
            <h1 className="font-display text-headline-md uppercase text-chalk">
              {t("step3Title")}
            </h1>
            <div className="flex flex-col gap-1.5">
              <Label>{t("riskTolerance")}</Label>
              <RiskSlider
                value={riskTolerance}
                onChange={setRiskTolerance}
                labels={{
                  low: t("riskLow"),
                  medium: t("riskMedium"),
                  high: t("riskHigh"),
                }}
              />
            </div>
            {error && <p className="text-sm text-touchline-red">{error}</p>}
            <div className="mt-2 flex gap-2">
              <Button type="button" variant="secondary" onClick={goBack} disabled={pending}>
                {t("back")}
              </Button>
              <Button
                type="button"
                onClick={handleComplete}
                disabled={pending}
                className="flex-1"
              >
                {t("completeCta")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
