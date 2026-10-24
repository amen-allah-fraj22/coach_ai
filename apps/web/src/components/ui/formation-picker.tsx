"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { chalkDraw } from "@/lib/motion";

export const FORMATIONS = ["4-3-3", "4-2-3-1", "4-4-2", "3-5-2", "3-4-3", "5-3-2"] as const;

/**
 * Large formation glyph buttons with a hand-drawn chalk circle around the
 * selected one. Horizontal scroll strip on mobile (flex + overflow-x-auto;
 * no separate mobile variant needed, matches §1's CSS-only-layout screens).
 */
function FormationPicker({
  value,
  onChange,
  formations = FORMATIONS,
  className,
}: {
  value?: string;
  onChange: (formation: string) => void;
  formations?: readonly string[];
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div className={cn("flex gap-3 overflow-x-auto pb-2", className)} role="radiogroup">
      {formations.map((formation) => {
        const selected = formation === value;
        return (
          <button
            key={formation}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(formation)}
            className="relative flex h-16 w-20 shrink-0 items-center justify-center border border-hairline-16 bg-slate-grass text-chalk"
          >
            <span className="font-display text-lg tabular-nums">{formation}</span>
            {selected && (
              <svg
                viewBox="0 0 100 100"
                className="pointer-events-none absolute inset-0 size-full"
                fill="none"
              >
                <motion.circle
                  cx="50"
                  cy="50"
                  r="46"
                  stroke="var(--chalk)"
                  strokeWidth="2"
                  variants={chalkDraw({ duration: 0.3 }, reduced ?? false)}
                  initial="hidden"
                  animate="show"
                />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

export { FormationPicker };
