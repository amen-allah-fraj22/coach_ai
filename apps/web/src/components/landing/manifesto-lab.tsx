"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";

import { Button } from "@/components/ui/button";
import { chalkDraw } from "@/lib/motion";

type Phase = "A" | "B" | "C";

/** Node layouts per phase — illustrative only, not live match data. */
const LAYOUTS: Record<Phase, { x: number; y: number }[]> = {
  A: [
    { x: 25, y: 75 },
    { x: 50, y: 55 },
    { x: 75, y: 30 },
  ],
  B: [
    { x: 35, y: 60 },
    { x: 50, y: 50 },
    { x: 65, y: 40 },
  ],
  C: [
    { x: 20, y: 40 },
    { x: 50, y: 65 },
    { x: 80, y: 35 },
  ],
};

export function ManifestoLab() {
  const t = useTranslations("home.manifesto");
  const reduced = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<Phase>("A");
  const [simKey, setSimKey] = useState(0);

  const nodes = LAYOUTS[phase];
  const phaseButtons: { id: Phase; label: string }[] = [
    { id: "A", label: t("phaseALabel") },
    { id: "B", label: t("phaseBLabel") },
    { id: "C", label: t("phaseCLabel") },
  ];

  return (
    <section id="manifesto" className="scroll-mt-20 border-b border-hairline-08 px-4 py-16 md:px-8">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <p className="text-label-tactical text-muted-foreground">{t("label")}</p>
          <h2 className="font-display text-headline-lg uppercase text-chalk">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("body")}</p>

          <div className="flex flex-col gap-2">
            {phaseButtons.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setPhase(b.id)}
                className={
                  "flex items-center gap-2 border px-3 py-2 text-start text-label-tactical transition-colors " +
                  (phase === b.id
                    ? "border-pitch-green bg-wash-green text-chalk"
                    : "border-hairline-16 text-muted-foreground hover:text-chalk")
                }
              >
                <span
                  aria-hidden
                  className={"size-2 shrink-0 " + (phase === b.id ? "bg-pitch-green" : "bg-hairline-24")}
                />
                {b.label}
              </button>
            ))}
          </div>

          <blockquote className="border-s-2 border-chalk ps-4 text-sm italic text-muted-foreground">
            {t("quote")}
            <footer className="mt-2 text-xs not-italic text-muted-foreground/70">
              — {t("quoteAuthor")}
            </footer>
          </blockquote>
        </div>

        <div className="flex flex-col gap-3 border border-hairline-08 bg-slate-grass p-4">
          <div className="flex items-center justify-between">
            <span className="text-label-tactical text-muted-foreground">{t("labTitle")}</span>
          </div>

          <svg viewBox="0 0 100 100" className="aspect-square w-full bg-night-pitch">
            <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(247,245,239,0.12)" strokeWidth="0.5" />

            {nodes.slice(0, -1).map((node, i) => {
              const next = nodes[i + 1];
              return (
                <motion.line
                  key={`${phase}-${i}`}
                  x1={node.x}
                  y1={node.y}
                  x2={next.x}
                  y2={next.y}
                  stroke="var(--chalk)"
                  strokeWidth="0.6"
                  strokeDasharray="2 2"
                  variants={chalkDraw({ duration: 0.4 }, reduced)}
                  initial="hidden"
                  animate="show"
                />
              );
            })}

            {nodes.map((node, i) => (
              <motion.circle
                key={`${phase}-dot-${i}`}
                r="3"
                fill={i === nodes.length - 1 ? "var(--touchline-red)" : "var(--pitch-green)"}
                animate={{ cx: node.x, cy: node.y }}
                transition={reduced ? { duration: 0.01 } : { duration: 0.4, ease: "easeInOut" }}
              />
            ))}

            <AnimatePresence>
              {simKey > 0 && (
                <motion.circle
                  key={simKey}
                  r="1.8"
                  fill="var(--chalk)"
                  initial={{ cx: nodes[0].x, cy: nodes[0].y, opacity: 1 }}
                  animate={{
                    cx: nodes.map((n) => n.x),
                    cy: nodes.map((n) => n.y),
                  }}
                  exit={{ opacity: 0 }}
                  transition={reduced ? { duration: 0.01 } : { duration: 1.2, ease: "linear" }}
                />
              )}
            </AnimatePresence>
          </svg>

          <Button
            type="button"
            variant="secondary"
            onClick={() => setSimKey((k) => k + 1)}
          >
            {t("runSimulation")}
          </Button>
          <p className="text-xs text-muted-foreground">{t("labCaption")}</p>
        </div>
      </div>
    </section>
  );
}
