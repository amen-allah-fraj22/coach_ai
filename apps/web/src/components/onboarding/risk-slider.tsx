"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const LEVELS = ["low", "medium", "high"] as const;
type RiskLevel = (typeof LEVELS)[number];

/** Cautious -> All-in, three discrete stops with a sliding flag marker. */
export function RiskSlider({
  value,
  onChange,
  labels,
}: {
  value: RiskLevel;
  onChange: (level: RiskLevel) => void;
  labels: Record<RiskLevel, string>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className="relative flex flex-1 flex-col items-center gap-2 py-4"
          >
            <div className="h-1 w-full bg-hairline-16" />
            {value === level && (
              <motion.div
                layoutId="risk-flag"
                className="absolute top-0 size-3 -translate-y-1/2 bg-touchline-red"
                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              />
            )}
            <span
              className={cn(
                "text-label-tactical",
                value === level ? "text-chalk" : "text-muted-foreground",
              )}
            >
              {labels[level]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
