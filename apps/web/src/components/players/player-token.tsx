import type { Doc } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";

/** Average of whatever ratings are filled, 0 when none — drives the dial. */
function averageRating(p: Doc<"players">): number | null {
  const vals = [
    p.technicalRating,
    p.physicalRating,
    p.tacticalRating,
    p.formRating,
  ].filter((v): v is number => typeof v === "number");
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

const AVAILABILITY_RING: Record<Doc<"players">["availability"], string> = {
  available: "ring-secondary/60",
  injured: "ring-primary/70",
  suspended: "ring-primary/70",
  unavailable: "ring-muted-foreground/40",
};

/** Small 1–10 dial rendered as an SVG ring. */
function RatingDial({ value }: { value: number | null }) {
  const pct = value === null ? 0 : Math.max(0, Math.min(1, value / 10));
  const r = 11;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 28 28" className="size-7 shrink-0" aria-hidden>
      <circle cx="14" cy="14" r={r} className="fill-none stroke-border" strokeWidth="3" />
      <circle
        cx="14"
        cy="14"
        r={r}
        className="fill-none stroke-secondary"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform="rotate(-90 14 14)"
      />
      <text
        x="14"
        y="18"
        textAnchor="middle"
        className="fill-foreground font-display text-[9px]"
      >
        {value === null ? "–" : value.toFixed(0)}
      </text>
    </svg>
  );
}

/**
 * A magnetic "player counter" token. Presentational only — the board owns
 * the drag behavior and renders this both in lanes and in the drag overlay.
 */
export function PlayerToken({
  player,
  dragging = false,
}: {
  player: Doc<"players">;
  dragging?: boolean;
}) {
  const badge = player.position ?? player.name.slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 select-none",
        "ring-2 ring-inset",
        AVAILABILITY_RING[player.availability],
        dragging ? "shadow-xl" : "shadow-xs",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent font-display text-[11px] uppercase text-accent-foreground">
        {badge}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium leading-tight">
          {player.name}
        </span>
        {player.secondaryPosition && (
          <span className="truncate text-[11px] text-muted-foreground leading-tight">
            {player.secondaryPosition}
          </span>
        )}
      </span>
      <RatingDial value={averageRating(player)} />
    </div>
  );
}
