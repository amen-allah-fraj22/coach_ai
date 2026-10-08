import { cn } from "@/lib/utils";

/** Real-data crest substitute (RECAST, §3): the team/opponent name's first three letters. */
export function Monogram({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex size-12 items-center justify-center border border-hairline-16 bg-slate-grass font-display text-sm text-chalk",
        className,
      )}
    >
      {initials || "—"}
    </div>
  );
}
