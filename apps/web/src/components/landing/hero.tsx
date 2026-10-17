"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Metric } from "@/components/ui/metric";
import { Icon } from "@/components/ui/icon";
import { ChalkPath } from "@/components/ui/chalk-path";
import { chalkDraw } from "@/lib/motion";

// Ported from design/stitch/landing-page/web: a fixed-size drawing centred
// behind the hero and cropped by the section, so strokes never scale with the viewport.
const RUNS = [
  { d: "M 280 240 Q 420 200 520 280", head: "520,280 504,272 514,264", dash: "6 5", width: 2.5, opacity: 1 },
  { d: "M 180 140 C 320 110, 480 90, 680 150", head: "680,150 664,142 670,132", dash: "4 4", width: 2, opacity: 0.75 },
  { d: "M 780 480 Q 640 460 560 370", head: "560,370 576,378 572,390", dash: "8 4", width: 3, opacity: 0.8, color: "#94D4B0" },
  { d: "M 720 260 L 610 330", head: "610,330 622,320 628,328", dash: "5 5", width: 2, opacity: 0.5 },
];
const SQUAD = [
  { x: 360, y: 400, n: "6" },
  { x: 480, y: 260, n: "8" },
  { x: 510, y: 530, n: "10" },
  { x: 690, y: 380, n: "9", striker: true },
];
const OPPONENTS = [
  { x: 620, y: 365 },
  { x: 580, y: 240 },
  { x: 590, y: 490 },
];

function HeroPitch({ reduced }: { reduced: boolean }) {
  const appear = (delay: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { delay: reduced ? 0 : delay, duration: 0.3 },
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden items-center justify-center overflow-hidden opacity-35 md:flex"
    >
      <svg
        viewBox="0 0 1200 800"
        fill="none"
        stroke="var(--chalk)"
        className="h-[850px] w-[1400px] shrink-0 select-none"
      >
        <rect x="100" y="60" width="1000" height="680" opacity="0.4" strokeDasharray="12 6" strokeWidth="2" />
        <line x1="600" y1="60" x2="600" y2="740" opacity="0.4" strokeDasharray="10 8" strokeWidth="2" />
        <circle cx="600" cy="400" r="110" opacity="0.4" strokeDasharray="6 6" strokeWidth="2" />
        <circle cx="600" cy="400" r="4" fill="var(--chalk)" opacity="0.6" />
        <rect x="100" y="220" width="180" height="360" opacity="0.3" strokeDasharray="8 6" strokeWidth="2" />
        <rect x="920" y="220" width="180" height="360" opacity="0.3" strokeDasharray="8 6" strokeWidth="2" />
        <circle cx="230" cy="400" r="3" fill="var(--chalk)" opacity="0.5" />
        <circle cx="970" cy="400" r="3" fill="var(--chalk)" opacity="0.5" />

        <path
          d="M 440 290 L 580 290 L 530 460 L 400 440 Z"
          fill="#0C5135"
          fillOpacity="0.12"
          stroke="#94D4B0"
          strokeDasharray="3 3"
          strokeWidth="1"
        />

        {RUNS.map((run, i) => (
          <g key={run.d} opacity={run.opacity} stroke={run.color ?? "var(--chalk)"}>
            <ChalkPath
              d={run.d}
              strokeDasharray={run.dash}
              strokeWidth={run.width}
              duration={0.5}
              delay={i * 0.3}
              reduced={reduced}
            />
            <motion.polygon
              points={run.head}
              fill={run.color ?? "var(--chalk)"}
              stroke="none"
              {...appear(0.5 + i * 0.3)}
            />
          </g>
        ))}

        <g opacity="0.85" strokeWidth="2">
          {SQUAD.map((p, i) => (
            <motion.g key={p.n} {...appear(1.2 + i * 0.1)}>
              <circle
                cx={p.x}
                cy={p.y}
                r={p.striker ? 18 : 16}
                fill={p.striker ? "#0C5135" : "none"}
                fillOpacity={p.striker ? 0.4 : undefined}
              />
              <text
                x={p.x}
                y={p.y + (p.striker ? 6 : 5)}
                fill="var(--chalk)"
                stroke="none"
                textAnchor="middle"
                fontSize={p.striker ? 16 : 14}
                className="font-display"
              >
                {p.n}
              </text>
            </motion.g>
          ))}
        </g>

        <g opacity="0.75" stroke="#FFDAD4" strokeWidth="3">
          {OPPONENTS.map((o, i) => (
            <motion.g key={`${o.x}-${o.y}`} {...appear(1.6 + i * 0.1)}>
              <line x1={o.x} y1={o.y} x2={o.x + 16} y2={o.y + 16} />
              <line x1={o.x + 16} y1={o.y} x2={o.x} y2={o.y + 16} />
            </motion.g>
          ))}
        </g>
      </svg>
    </div>
  );
}

// Mobile-only framed mini pitch from design/stitch/landing-page/mobile.
const MOBILE_TOKENS = [
  { n: "4", top: "48%", left: "24%", className: "bg-[#273831] text-chalk" },
  { n: "8", top: "34%", left: "44%", className: "bg-[#94D4B0] text-[#003823]" },
  { n: "10", top: "52%", left: "64%", className: "bg-[#94D4B0] text-[#003823]" },
  { n: "9", top: "40%", left: "82%", className: "bg-touchline-red text-chalk" },
];

function MobilePitchCard({ reduced, phase, zone }: { reduced: boolean; phase: string; zone: string }) {
  return (
    <div aria-hidden className="relative w-full overflow-hidden border border-hairline-08 bg-slate-grass p-2 md:hidden">
      <svg viewBox="0 0 320 180" fill="none" stroke="var(--chalk)" className="h-48 w-full opacity-40">
        <rect x="10" y="8" width="300" height="164" strokeDasharray="4 2" strokeWidth="1.5" />
        <line x1="160" y1="8" x2="160" y2="172" strokeDasharray="4 2" strokeWidth="1.5" />
        <circle cx="160" cy="90" r="32" strokeDasharray="3 3" strokeWidth="1.5" />
        <circle cx="160" cy="90" r="2.5" fill="var(--chalk)" />
        <rect x="10" y="44" width="48" height="92" strokeDasharray="4 2" strokeWidth="1.2" />
        <rect x="262" y="44" width="48" height="92" strokeDasharray="4 2" strokeWidth="1.2" />
        <rect x="10" y="66" width="18" height="48" strokeWidth="1" />
        <rect x="292" y="66" width="18" height="48" strokeWidth="1" />
        <line x1="10" y1="62" x2="310" y2="62" strokeDasharray="2 4" strokeOpacity="0.4" strokeWidth="0.75" />
        <line x1="10" y1="118" x2="310" y2="118" strokeDasharray="2 4" strokeOpacity="0.4" strokeWidth="0.75" />
        <ChalkPath
          d="M125 90 Q 145 55, 195 52"
          stroke="#94D4B0"
          strokeDasharray="6 3"
          strokeLinecap="round"
          strokeWidth={2.5}
          duration={0.5}
          delay={0.3}
          reduced={reduced}
        />
        <polygon points="199,52 191,48 193,56" fill="#94D4B0" stroke="none" />
        <ChalkPath
          d="M210 115 Q 235 95, 258 75"
          stroke="#FFB4A7"
          strokeDasharray="5 3"
          strokeLinecap="round"
          strokeWidth={2}
          duration={0.5}
          delay={0.6}
          reduced={reduced}
        />
        <polygon points="261,73 253,73 258,79" fill="#FFB4A7" stroke="none" />
      </svg>

      {MOBILE_TOKENS.map((token, i) => (
        <motion.span
          key={token.n}
          className={`absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-display text-lg ${token.className}`}
          style={{ top: token.top, left: token.left }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduced ? 0 : 0.8 + i * 0.1, duration: 0.3 }}
        >
          {token.n}
        </motion.span>
      ))}

      <span className="absolute bottom-2 start-2 bg-[#02110B]/90 px-2 py-0.5 text-label-mono uppercase text-muted-foreground">
        {phase}
      </span>
      <span className="absolute end-2 top-2 flex items-center gap-1 bg-[#02110B]/90 px-2 py-0.5 text-label-mono uppercase text-[#FFB4A7]">
        <Icon name="warning" size={12} />
        {zone}
      </span>
    </div>
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
    <section className="relative overflow-hidden border-b border-hairline-08 bg-pitch-grid px-4 py-10 text-start md:px-8 md:py-24 md:text-center">
      <HeroPitch reduced={reduced} />

      <div className="relative mx-auto flex max-w-3xl flex-col items-start gap-6 md:items-center">
        <Chip status="green">{t("statusChip")}</Chip>

        <h1 className="font-display text-4xl uppercase leading-tight tracking-tight text-chalk sm:text-5xl md:text-6xl">
          {t("titleLine1")}
          <br />
          <span className="relative inline-block text-[#94D4B0]">
            {t("titleLine2")}
            <motion.svg
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
              className="absolute -bottom-2 start-0 h-3 w-full opacity-70"
              aria-hidden
            >
              <motion.path
                d="M2 9 C 50 3, 150 11, 198 4"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="5 3"
                strokeLinecap="round"
                fill="none"
                variants={chalkDraw({ duration: 0.4, delay: 1.3 }, reduced)}
                initial="hidden"
                animate="show"
              />
            </motion.svg>
          </span>
        </h1>

        <p className="max-w-xl text-muted-foreground">{t("subtitle")}</p>

        <MobilePitchCard reduced={reduced} phase={t("pitchPhase")} zone={t("pitchZone")} />

        <div className="flex w-full flex-col items-center gap-3 sm:flex-row md:w-auto">
          <motion.div
            className="w-full rounded-full md:w-auto"
            animate={
              reduced
                ? {}
                : { boxShadow: ["0 0 0 0px rgba(227,64,42,0)", "0 0 0 4px rgba(227,64,42,0.25)", "0 0 0 0px rgba(227,64,42,0)"] }
            }
            transition={reduced ? undefined : { duration: 2.4, repeat: Infinity }}
          >
            <Button asChild variant="pill" size="full" className="group px-8 md:w-auto">
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
