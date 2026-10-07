"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { chalkDraw } from "@/lib/motion";

export interface PitchDot {
  x: number; // 0-100
  y: number; // 0-100 (0 = top/attack, 100 = bottom/own goal)
  label?: string;
}

export interface PitchArrow {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

/** "4-3-3" -> [4, 3, 3] (outfield lines only, GK is implicit). */
function parseFormation(formation: string): number[] {
  return formation
    .split("-")
    .map((part) => Number.parseInt(part, 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** Evenly distributes dots line-by-line from the goal line (GK) to attack. */
export function layoutFormation(formation: string): PitchDot[] {
  const lines = parseFormation(formation);
  if (lines.length === 0) return [{ x: 50, y: 92 }];

  const dots: PitchDot[] = [{ x: 50, y: 92 }]; // GK
  const lineCount = lines.length;
  lines.forEach((count, lineIndex) => {
    // Defense closest to goal (y near 75), attack closest to y 12.
    const y = 75 - (lineIndex / Math.max(lineCount - 1, 1)) * 63;
    for (let i = 0; i < count; i += 1) {
      const x = ((i + 1) / (count + 1)) * 100;
      dots.push({ x, y });
    }
  });
  return dots;
}

/**
 * DESIGN.md "Tactical Chalk Pitch Board": slate SVG, chalk field lines at
 * .15 opacity, optional dashed chalk arrows (decorative, `chalkDraw`).
 */
function PitchDiagram({
  formation,
  dots,
  arrows = [],
  className,
}: {
  formation?: string;
  dots?: PitchDot[];
  arrows?: PitchArrow[];
  className?: string;
}) {
  const reduced = useReducedMotion();
  const points = dots ?? (formation ? layoutFormation(formation) : []);

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("aspect-[2/3] w-full bg-slate-grass", className)}
      aria-hidden={points.length === 0}
    >
      {/* Field lines */}
      <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(247,245,239,0.15)" strokeWidth="0.5" />
      <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(247,245,239,0.15)" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="10" fill="none" stroke="rgba(247,245,239,0.15)" strokeWidth="0.5" />
      <rect x="30" y="2" width="40" height="14" fill="none" stroke="rgba(247,245,239,0.15)" strokeWidth="0.5" />
      <rect x="30" y="84" width="40" height="14" fill="none" stroke="rgba(247,245,239,0.15)" strokeWidth="0.5" />

      {arrows.map((arrow, i) => (
        <motion.line
          key={i}
          x1={arrow.from.x}
          y1={arrow.from.y}
          x2={arrow.to.x}
          y2={arrow.to.y}
          stroke="var(--chalk)"
          strokeWidth="1"
          strokeDasharray="4 4"
          variants={chalkDraw({ duration: 0.4, delay: i * 0.1 }, reduced ?? false)}
          initial="hidden"
          animate="show"
        />
      ))}

      {points.map((dot, i) => (
        <g key={i} transform={`translate(${dot.x} ${dot.y})`}>
          <circle r="3" fill="var(--chalk)" />
          {dot.label && (
            <text
              y="6.5"
              textAnchor="middle"
              fontSize="3"
              fill="var(--chalk)"
              className="font-display uppercase"
            >
              {dot.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export { PitchDiagram };
