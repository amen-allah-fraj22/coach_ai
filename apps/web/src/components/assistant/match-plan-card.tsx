"use client";

import { useState, useTransition } from "react";
import { useMutation } from "convex/react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Recommendation } from "@convex/aiRecommendation";
import { Button } from "@/components/ui/button";
import { stampPress } from "@/lib/motion";

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

function Section({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <ul className="flex flex-col gap-1 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-primary" aria-hidden>
              &bull;
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
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
  const reduced = useReducedMotion();

  const rec = recommendation;

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
      className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5"
    >
      <motion.header variants={item} className="flex flex-col gap-1">
        <h2 className="font-display text-xl uppercase tracking-tight">
          {rec.headline}
        </h2>
        <p className="text-sm text-muted-foreground">{rec.summary}</p>
        {rec.formation && (
          <p className="mt-1 font-display text-2xl tabular-nums text-primary">
            {rec.formation}
          </p>
        )}
      </motion.header>

      {rec.starting_xi && rec.starting_xi.length > 0 && (
        <motion.div variants={item} className="flex flex-col gap-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("startingXI")}
          </h3>
          <ul className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
            {rec.starting_xi.map((p, i) => (
              <li key={i} className="flex justify-between gap-2 border-b border-border/50 py-1">
                <span className="font-medium">{p.player}</span>
                <span className="text-muted-foreground">{p.role}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <motion.div variants={item} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Section title={t("attacking")} items={rec.attacking_plan} />
        <Section title={t("defensive")} items={rec.defensive_plan} />
        <Section title={t("pressing")} items={rec.pressing_plan} />
        <Section title={t("transition")} items={rec.transition_plan} />
        <Section title={t("setPieces")} items={rec.set_pieces} />
        <Section title={t("substitutions")} items={rec.substitutions} />
        <Section title={t("risks")} items={rec.risks} />
        <Section title={t("training")} items={rec.training_focus} />
      </motion.div>

      {rec.alternatives && rec.alternatives.length > 0 && (
        <motion.div variants={item} className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("alternatives")}
          </h3>
          {rec.alternatives.map((alt, i) => (
            <div key={i} className="rounded-md border border-border p-3 text-sm">
              <p className="font-medium">{alt.name}</p>
              <p className="text-muted-foreground">{alt.rationale}</p>
            </div>
          ))}
        </motion.div>
      )}

      <motion.details variants={item} className="text-sm">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("reasoning")}
        </summary>
        <p className="mt-2 text-muted-foreground">{rec.reasoning}</p>
      </motion.details>

      <motion.footer variants={item} className="flex flex-col gap-3 border-t border-border pt-4">
        {feedbackDone ? (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-secondary"
          >
            {t("feedbackThanks")}
          </motion.p>
        ) : (
          <div className="flex gap-2">
            {stamps.map((s) => (
              <motion.div key={s.status} whileTap={stampPress(reduced ?? false)}>
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
        <p className="text-xs text-muted-foreground">
          {t("poweredBy", { provider })}
        </p>
      </motion.footer>
    </motion.article>
  );
}
