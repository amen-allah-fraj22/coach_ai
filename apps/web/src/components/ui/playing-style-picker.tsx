"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { chalkDraw } from "@/lib/motion";
import { PLAYING_STYLES, isPlayingStyle } from "@convex/lib/playingStyles";

/**
 * Pick-one list of coach playing styles. Selected tile follows DESIGN.md's
 * active secondary state (green wash + 4px green inner-start border) with a
 * chalk tick drawn in.
 */
function PlayingStylePicker({
  value,
  onChange,
  className,
}: {
  value?: string;
  onChange: (style: string) => void;
  className?: string;
}) {
  const t = useTranslations("playingStyles");
  const reduced = useReducedMotion() ?? false;

  return (
    <div role="radiogroup" className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2", className)}>
      {PLAYING_STYLES.map((style) => {
        const selected = style === value;
        return (
          <button
            key={style}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(style)}
            className={cn(
              "relative flex min-h-14 flex-col items-start justify-center gap-0.5 border px-3 py-2 text-start transition-colors",
              selected
                ? "border-hairline-24 border-s-4 border-s-pitch-green bg-wash-green"
                : "border-hairline-16 bg-slate-grass hover:bg-card-hover",
            )}
          >
            <span className="font-display text-sm uppercase tracking-wide text-chalk">
              {t(`${style}.label`)}
            </span>
            <span className="text-xs text-muted-foreground">{t(`${style}.hint`)}</span>
            {selected && (
              <svg viewBox="0 0 16 16" fill="none" className="absolute end-2 top-2 size-4" aria-hidden>
                <motion.path
                  d="M2 8.5 L6.5 13 L14 3.5"
                  stroke="var(--chalk)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  variants={chalkDraw({ duration: 0.25 }, reduced)}
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

/** Translated label for a stored style; free text saved before the list existed shows as-is. */
function usePlayingStyleLabel() {
  const t = useTranslations("playingStyles");
  return (value: string | undefined | null) =>
    !value ? undefined : isPlayingStyle(value) ? t(`${value}.label`) : value;
}

export { PlayingStylePicker, usePlayingStyleLabel };
