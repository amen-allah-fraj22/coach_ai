"use client";

import { motion, useReducedMotion } from "motion/react";

import { chalkDraw } from "@/lib/motion";

export interface RadarAxis {
  label: string;
  value: number;
  max?: number;
}

/**
 * 4-axis diamond radar for the four real rating fields (technical, physical,
 * tactical, form). Stitch's design drew a 5-axis PAC/PAS/DRI/DEF/PHY
 * pentagon, which doesn't match the schema — deliberately 4 axes here, see
 * docs/design-implementation-plan.md §2.
 */
function RadarChart({
  axes,
  size = 200,
  className,
}: {
  axes: RadarAxis[];
  size?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const n = axes.length;
  const center = 50;
  const maxRadius = 40;

  function pointFor(i: number, fraction: number) {
    const angle = -90 + (360 / n) * i;
    const rad = (angle * Math.PI) / 180;
    const r = maxRadius * fraction;
    return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
  }

  const dataPoints = axes.map((axis, i) => pointFor(i, Math.max(0, Math.min(1, axis.value / (axis.max ?? 10)))));
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const ringFractions = [0.33, 0.66, 1];

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      {ringFractions.map((fraction) => {
        const ringPoints = axes.map((_, i) => pointFor(i, fraction));
        return (
          <polygon
            key={fraction}
            points={ringPoints.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="rgba(247,245,239,0.15)"
            strokeWidth="0.5"
          />
        );
      })}

      {axes.map((axis, i) => {
        const outer = pointFor(i, 1);
        return (
          <line
            key={axis.label}
            x1={center}
            y1={center}
            x2={outer.x}
            y2={outer.y}
            stroke="rgba(247,245,239,0.15)"
            strokeWidth="0.5"
          />
        );
      })}

      <motion.polygon
        points={dataPath}
        fill="rgba(47,109,79,0.25)"
        stroke="var(--chalk)"
        strokeWidth="1.5"
        variants={chalkDraw({ duration: 0.5 }, reduced ?? false)}
        initial="hidden"
        animate="show"
      />

      {axes.map((axis, i) => {
        const labelPoint = pointFor(i, 1.28);
        return (
          <text
            key={axis.label}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="5"
            fill="var(--chalk)"
            className="text-label-tactical"
          >
            {axis.label}
          </text>
        );
      })}
    </svg>
  );
}

export { RadarChart };
