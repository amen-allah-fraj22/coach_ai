"use client";

import { useState, useTransition } from "react";
import { useMutation } from "convex/react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Recommendation } from "@convex/aiRecommendation";
import { Button } from "@/components/ui/button";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { PitchDiagram, layoutFormation } from "@/components/ui/pitch-diagram";
import { stampPress, arcEnter } from "@/lib/motion";

type FeedbackStatus = "accepted" | "modified" | "rejected";

// Sections reveal one after another, like a plan being written out.
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

function SectionList({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="flex flex-col gap-1.5 text-sm">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-pitch-green" aria-hidden>
            &bull;
          </span>
          <span className="text-chalk">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function MatchPlanCard({
  recommendation,
  recommendationId,
  provider,
}: {
  recommendation: Recommendation;
  recommendationId: Id<"aiRecommendations"> | null;
  provider: string;
}) {
  const t = useTranslations("assistant");
  const recordFeedback = useMutation(api.ai.recordFeedback);
  const [pending, startTransition] = useTransition();
  const [feedbackDone, setFeedbackDone] = useState(false);
  const reduced = useReducedMotion() ?? false;

  const rec = recommendation;

  const sections = [
    { key: "attacking", label: t("attacking"), items: rec.attacking_plan },
    { key: "defensive", label: t("defensive"), items: rec.defensive_plan },
    { key: "pressing", label: t("pressing"), items: rec.pressing_plan },
    { key: "transition", label: t("transition"), items: rec.transition_plan },
    { key: "setPieces", label: t("setPieces"), items: rec.set_pieces },
    { key: "substitutions", label: t("substitutions"), items: rec.substitutions },
    { key: "risks", label: t("risks"), items: rec.risks },
    { key: "training", label: t("training"), items: rec.training_focus },
  ].filter((s) => s.items && s.items.length > 0);

  const [tab, setTab] = useState(sections[0]?.key ?? "attacking");
  const activeSection = sections.find((s) => s.key === tab) ?? sections[0];

  const pitchDots = rec.formation
    ? layoutFormation(rec.formation).map((dot, i) => ({
        ...dot,
        label: rec.starting_xi?.[i]?.role,
      }))
    : [];

  function submitFeedback(status: FeedbackStatus) {
    if (!recommendationId) {
      setFeedbackDone(true);
      return;
    }
    startTransition(async () => {
      await recordFeedback({ recommendationId, status });
      setFeedbackDone(true);
    });
  }

  const stamps: { status: FeedbackStatus; label: string; variant: "primary" | "secondary" | "destructive" }[] = [
    { status: "accepted", label: t("accept"), variant: "primary" },
    { status: "modified", label: t("modify"), variant: "secondary" },
    { status: "rejected", label: t("reject"), variant: "destructive" },
  ];

  return (
    <motion.article
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5 border border-hairline-08 bg-slate-grass p-5"
    >
      <motion.header variants={item} className="flex flex-col gap-1">
        <h2 className="font-display text-headline-md uppercase text-chalk">{rec.headline}</h2>
        <p className="text-sm text-muted-foreground">{rec.summary}</p>
      </motion.header>

      {pitchDots.length > 0 && (
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-[auto_1fr]">
          <PitchDiagram dots={pitchDots} className="mx-auto w-32 sm:mx-0" />
          <div className="flex flex-col justify-center gap-1">
            {rec.formation && (
              <p className="font-display text-2xl tabular-nums text-chalk">{rec.formation}</p>
            )}
            {rec.starting_xi && (
              <ul className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
                {rec.starting_xi.map((p, i) => (
                  <li key={i} className="flex justify-between gap-2 border-b border-hairline-08 py-1">
                    <span className="font-medium text-chalk">{p.player}</span>
                    <span className="text-muted-foreground">{p.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      )}

      {sections.length > 0 && (
        <motion.div variants={item} className="flex flex-col gap-3">
          <SegmentedTabs
            value={tab}
            onChange={setTab}
            tabs={sections.map((s) => ({ value: s.key, label: s.label }))}
          />
          <motion.div
            key={activeSection?.key}
            variants={arcEnter({ direction: "horizontal" }, reduced)}
            initial="hidden"
            animate="show"
          >
            <SectionList items={activeSection?.items} />
          </motion.div>
        </motion.div>
      )}

      {rec.alternatives && rec.alternatives.length > 0 && (
        <motion.div variants={item} className="flex flex-col gap-2">
          <h3 className="text-label-tactical text-muted-foreground">{t("alternatives")}</h3>
          {rec.alternatives.map((alt, i) => (
            <div key={i} className="border border-hairline-08 p-3 text-sm">
              <p className="font-medium text-chalk">{alt.name}</p>
              <p className="text-muted-foreground">{alt.rationale}</p>
            </div>
          ))}
        </motion.div>
      )}

      <motion.details variants={item} className="text-sm">
        <summary className="cursor-pointer text-label-tactical text-muted-foreground">
          {t("reasoning")}
        </summary>
        <p className="mt-2 text-muted-foreground">{rec.reasoning}</p>
      </motion.details>

      <motion.footer variants={item} className="flex flex-col gap-3 border-t border-hairline-08 pt-4">
        {feedbackDone ? (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-pitch-green"
          >
            {t("feedbackThanks")}
          </motion.p>
        ) : (
          <div className="flex gap-2">
            {stamps.map((s) => (
              <motion.div key={s.status} whileTap={stampPress(reduced)}>
                <Button
                  type="button"
                  variant={s.variant}
                  size="sm"
                  disabled={pending}
                  onClick={() => submitFeedback(s.status)}
                >
                  {s.label}
                </Button>
              </motion.div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">{t("poweredBy", { provider })}</p>
      </motion.footer>
    </motion.article>
  );
}
