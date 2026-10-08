"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * The "generating" state: a small tactics-board loader where dashed passing
 * arrows draw and fade in a loop, instead of a generic spinner (stitch spec
 * #9). Night Pitch board, Touchline Red + Pitch Green chalk strokes.
 */
export function AiThinking({ label }: { label: string }) {
  const reduced = useReducedMotion();
  const arrows = [
    { d: "M20 70 Q 60 20 110 45", color: "var(--chalk)", delay: 0 },
    { d: "M30 40 Q 80 80 130 60", color: "var(--pitch-green)", delay: 0.5 },
    { d: "M60 75 Q 100 40 150 75", color: "var(--touchline-red)", delay: 1 },
  ];

  return (
    <div className="flex flex-col items-center gap-3 border border-hairline-08 bg-slate-grass/60 p-6">
      <svg viewBox="0 0 170 100" className="h-24 w-full max-w-[220px]" aria-hidden>
        <rect x="2" y="2" width="166" height="96" className="fill-none stroke-hairline-16" strokeDasharray="4 4" />
        <line x1="85" y1="2" x2="85" y2="98" className="stroke-hairline-16" strokeDasharray="3 3" />
        <circle cx="85" cy="50" r="12" className="fill-none stroke-hairline-16" strokeDasharray="3 3" />
        {arrows.map((a, i) => (
          <motion.path
            key={i}
            d={a.d}
            fill="none"
            stroke={a.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="6 5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              reduced
                ? { pathLength: 1, opacity: 0.6 }
                : { pathLength: [0, 1, 1], opacity: [0, 1, 0] }
            }
            transition={
              reduced
                ? { duration: 0.3 }
                : {
                    duration: 1.8,
                    delay: a.delay,
                    repeat: Infinity,
                    repeatDelay: 0.3,
                    ease: "easeInOut",
                  }
            }
          />
        ))}
      </svg>
      <p className="font-display text-sm uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
