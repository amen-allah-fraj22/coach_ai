"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

import type { Doc } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { RadarChart } from "@/components/ui/radar-chart";
import { flip3D } from "@/lib/motion";

/** Average of whatever ratings are filled, 0 when none — drives the dial. */
function averageRating(p: Doc<"players">): number | null {
  const vals = [p.technicalRating, p.physicalRating, p.tacticalRating, p.formRating].filter(
    (v): v is number => typeof v === "number",
  );
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function ageFromDob(dob?: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

const AVAILABILITY_DOT: Record<Doc<"players">["availability"], string> = {
  available: "bg-pitch-green",
  injured: "bg-touchline-red",
  suspended: "bg-touchline-red",
  unavailable: "bg-hairline-24",
};

function MiniDial({ value }: { value: number | null }) {
  const pct = value === null ? 0 : Math.max(0, Math.min(1, value / 10));
  const r = 11;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 28 28" className="size-6 shrink-0" aria-hidden>
      <circle cx="14" cy="14" r={r} className="fill-none stroke-hairline-16" strokeWidth="3" />
      <circle
        cx="14"
        cy="14"
        r={r}
        className="fill-none stroke-pitch-green"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform="rotate(-90 14 14)"
      />
      <text x="14" y="18" textAnchor="middle" className="fill-chalk font-display text-[9px] tabular-nums">
        {value === null ? "–" : value.toFixed(0)}
      </text>
    </svg>
  );
}

/**
 * A magnetic "player counter" token. Front: kit #, position, rating, name.
 * Back: age, 4-axis radar, coach notes, availability (flip3D). Presentational
 * only — the board owns the drag behavior and renders this both in lanes and
 * in the drag overlay.
 */
export function PlayerToken({
  player,
  dragging = false,
}: {
  player: Doc<"players">;
  dragging?: boolean;
}) {
  const t = useTranslations("players");
  const reduced = useReducedMotion() ?? false;
  const [flipped, setFlipped] = useState(false);
  const rating = averageRating(player);
  const age = ageFromDob(player.dateOfBirth);

  return (
    <div style={{ perspective: 800 }} className="h-[76px] min-w-44 select-none">
      <motion.div
        className="relative size-full"
        style={{ transformStyle: "preserve-3d" }}
        variants={flip3D(reduced)}
        animate={flipped ? "back" : "front"}
      >
        <div
          style={{ backfaceVisibility: "hidden" }}
          className={cn(
            "absolute inset-0 flex items-center gap-2 border border-hairline-16 bg-slate-grass px-3 py-2",
            dragging && "shadow-[0_8px_20px_rgba(0,0,0,0.5)]",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center border border-hairline-16 bg-night-pitch font-display text-xs tabular-nums text-chalk">
            {player.jerseyNumber ?? "–"}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium leading-tight text-chalk">
              {player.name}
            </span>
            <span className="truncate text-[11px] leading-tight text-muted-foreground">
              {player.position ?? player.secondaryPosition ?? "—"}
            </span>
          </span>
          <span
            aria-hidden
            className={cn("size-1.5 shrink-0", AVAILABILITY_DOT[player.availability])}
          />
          <MiniDial value={rating} />
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(true);
            }}
            className="shrink-0 text-muted-foreground hover:text-chalk"
          >
            <Icon name="flip" size={16} label={t("flip")} />
          </button>
        </div>

        <div
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          className="absolute inset-0 flex items-center gap-2 border border-hairline-16 bg-night-pitch px-3 py-2"
        >
          <RadarChart
            size={56}
            axes={[
              { label: "T", value: player.technicalRating ?? 0 },
              { label: "P", value: player.physicalRating ?? 0 },
              { label: "A", value: player.tacticalRating ?? 0 },
              { label: "F", value: player.formRating ?? 0 },
            ]}
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium leading-tight text-chalk">
              {player.name}
              {age !== null && <span className="text-muted-foreground"> · {age}</span>}
            </span>
            <span className="truncate text-[11px] leading-tight text-muted-foreground">
              {player.coachNotes || "—"}
            </span>
          </span>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(false);
            }}
            className="shrink-0 text-muted-foreground hover:text-chalk"
          >
            <Icon name="flip" size={16} label={t("flip")} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
