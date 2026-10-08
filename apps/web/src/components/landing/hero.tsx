"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Metric } from "@/components/ui/metric";
import { chalkDraw } from "@/lib/motion";

const ARROWS = [
  { from: { x: 20, y: 75 }, to: { x: 45, y: 40 } },
  { from: { x: 45, y: 40 }, to: { x: 75, y: 20 } },
  { from: { x: 30, y: 90 }, to: { x: 60, y: 60 } },
];
const DOTS = [
  { x: 20, y: 75 },
  { x: 45, y: 40 },
  { x: 75, y: 20 },
  { x: 30, y: 90 },
  { x: 60, y: 60 },
];

function HeroPitch({ reduced }: { reduced: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      className="absolute inset-0 size-full opacity-60"
    >
      <rect x="4" y="4" width="92" height="92" fill="none" stroke="rgba(247,245,239,0.1)" strokeWidth="0.4" />
      <line x1="4" y1="50" x2="96" y2="50" stroke="rgba(247,245,239,0.1)" strokeWidth="0.4" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(247,245,239,0.1)" strokeWidth="0.4" />

      {ARROWS.map((arrow, i) => (
        <motion.line
          key={i}
          x1={arrow.from.x}
          y1={arrow.from.y}
          x2={arrow.to.x}
          y2={arrow.to.y}
          stroke="var(--chalk)"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          variants={chalkDraw({ duration: 0.5, delay: i * 0.3 }, reduced)}
          initial="hidden"
          animate="show"
        />
      ))}

      {DOTS.map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r="1.6"
          fill="var(--chalk)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 1 + i * 0.1, duration: 0.3 }}
        />
      ))}
    </svg>
  );
}

export function LandingHero() {
  const t = useTranslations("home.hero");
  const reduced = useReducedMotion() ?? false;

  const metrics = [
    { value: t("metricLanguagesValue"), label: t("metricLanguages") },
    { value: t("metricDemoValue"), label: t("metricDemo") },
    { value: t("metricToolsValue"), label: t("metricTools") },
    { value: t("metricSpreadsheetsValue"), label: t("metricSpreadsheets") },
  ];

  return (
    <section className="relative overflow-hidden border-b border-hairline-08 bg-pitch-grid px-4 py-16 text-center md:px-8 md:py-24">
      <HeroPitch reduced={reduced} />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6">
        <Chip status="green">{t("statusChip")}</Chip>

        <h1 className="font-display text-4xl uppercase leading-tight tracking-tight text-chalk sm:text-5xl md:text-6xl">
          {t("titleLine1")}
          <br />
          <span className="relative inline-block text-[#94D4B0]">
            {t("titleLine2")}
            <motion.svg
              viewBox="0 0 200 12"
              className="absolute -bottom-2 start-0 h-3 w-full"
              aria-hidden
            >
              <motion.path
                d="M2 8 Q 100 2 198 8"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                variants={chalkDraw({ duration: 0.4, delay: 1.3 }, reduced)}
                initial="hidden"
                animate="show"
              />
            </motion.svg>
          </span>
        </h1>

        <p className="max-w-xl text-muted-foreground">{t("subtitle")}</p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <motion.div
            animate={
              reduced
                ? {}
                : { boxShadow: ["0 0 0 0px rgba(227,64,42,0)", "0 0 0 4px rgba(227,64,42,0.25)", "0 0 0 0px rgba(227,64,42,0)"] }
            }
            transition={reduced ? undefined : { duration: 2.4, repeat: Infinity }}
          >
            <Button asChild variant="pill" size="full" className="group w-auto px-8">
              <Link href="/signup">
                {t("cta")}{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </Button>
          </motion.div>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-chalk">
            [ {t("seeHow")} ]
          </a>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="border border-hairline-08 bg-slate-grass px-4 py-3">
              <Metric value={metric.value} label={metric.label} size="mobile" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
