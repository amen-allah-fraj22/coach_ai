"use client";

import * as React from "react";
import { motion } from "motion/react";

import { chalkDraw } from "@/lib/motion";

type ChalkPathProps = Omit<React.SVGProps<SVGPathElement>, "ref"> & {
  d: string;
  duration?: number;
  delay?: number;
  reduced?: boolean;
};

/**
 * A stroke that draws itself in with `chalkDraw` while keeping its
 * strokeDasharray. Animating pathLength directly takes over the dash
 * pattern (dashed arrows render solid), so the draw-in is applied to a
 * mask over the real path instead.
 */
function ChalkPath({ d, duration, delay, reduced = false, strokeWidth = 1, ...pathProps }: ChalkPathProps) {
  const maskId = `chalk-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const revealWidth = Number(strokeWidth) * 4 + 4;

  return (
    <>
      <mask id={maskId} maskUnits="userSpaceOnUse" x="-10000" y="-10000" width="20000" height="20000">
        <motion.path
          d={d}
          fill="none"
          stroke="white"
          strokeWidth={revealWidth}
          strokeLinecap="round"
          variants={chalkDraw({ duration, delay }, reduced)}
          initial="hidden"
          animate="show"
        />
      </mask>
      <path d={d} fill="none" strokeWidth={strokeWidth} mask={`url(#${maskId})`} {...pathProps} />
    </>
  );
}

function lineToPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}

export { ChalkPath, lineToPath };
