"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
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
  const maxRadius = 46;

  function pointFor(i: number, fraction: number) {
    const angle = -90 + (360 / n) * i;
    const rad = (angle * Math.PI) / 180;
    const r = maxRadius * fraction;
    return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
  }

  const dataPoints = axes.map((axis, i) => pointFor(i, Math.max(0, Math.min(1, axis.value / (axis.max ?? 10)))));
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const ringFractions = [0.33, 0.66, 1];
  const compact = size < 100;
  const labelClass = cn(
    "uppercase text-chalk",
    compact ? "text-[9px] font-semibold leading-none" : "text-label-tactical",
  );
  // Axis order from pointFor: 0 top, 1 right, 2 bottom, 3 left.
  const [top, right, bottom, left] = axes;

  // Labels are HTML in a 3x3 grid around the SVG so they never clip and keep
  // a real font size; dir="ltr" keeps each label beside its own axis in RTL.
  return (
    <div
      dir="ltr"
      className={cn(
        "inline-grid grid-cols-[auto_auto_auto] grid-rows-[auto_auto_auto] items-center justify-items-center",
        compact ? "gap-0.5" : "gap-1.5",
        className,
      )}
    >
      <span className={cn(labelClass, "col-start-2 row-start-1")}>{top?.label}</span>
      <span className={cn(labelClass, "col-start-1 row-start-2 justify-self-end")}>{left?.label}</span>
      <svg viewBox="0 0 100 100" width={size} height={size} className="col-start-2 row-start-2 overflow-visible">
        {ringFractions.map((fraction) => {
          const ringPoints = axes.map((_, i) => pointFor(i, fraction));
          return (
            <polygon
              key={fraction}
              points={ringPoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="var(--line-15)"
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
              stroke="var(--line-15)"
              strokeWidth="0.5"
            />
          );
        })}

        <motion.polygon
          points={dataPath}
          fill="var(--wash-green)"
          stroke="var(--chalk)"
          strokeWidth="1.5"
          variants={chalkDraw({ duration: 0.5 }, reduced ?? false)}
          initial="hidden"
          animate="show"
        />
      </svg>
      <span className={cn(labelClass, "col-start-3 row-start-2 justify-self-start")}>{right?.label}</span>
      <span className={cn(labelClass, "col-start-2 row-start-3")}>{bottom?.label}</span>
    </div>
  );
}

export { RadarChart };
