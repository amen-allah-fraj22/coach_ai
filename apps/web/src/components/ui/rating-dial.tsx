"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/** A circular gauge: hairline track, chalk arc filled to value/max. */
function RatingDial({
  value,
  max = 10,
  label,
  size = 72,
  className,
}: {
  value: number;
  max?: number;
  label?: React.ReactNode;
  size?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.max(0, Math.min(1, value / max));

  return (
    <div className={cn("flex flex-col items-center gap-1", className)} style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="size-full" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--hairline-16)" strokeWidth="6" />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--chalk)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - fraction) }}
            transition={reduced ? { duration: 0.01 } : { duration: 0.5, ease: "easeOut" }}
          />
        </svg>
        <span className="font-display absolute inset-0 flex items-center justify-center text-headline-md tabular-nums text-chalk">
          {value}
        </span>
      </div>
      {label && <span className="text-label-tactical text-muted-foreground">{label}</span>}
    </div>
  );
}

export { RatingDial };
