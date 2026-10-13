import { cn } from "@/lib/utils";

/** DESIGN.md "Telemetry Spark-Bars": flat segmented bar, 2px gaps. */
function RatingBar({
  value,
  max = 10,
  label,
  className,
}: {
  value: number;
  max?: number;
  label?: React.ReactNode;
  className?: string;
}) {
  const segments = Array.from({ length: max }, (_, i) => i < Math.round(value));

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && <span className="text-label-tactical text-muted-foreground">{label}</span>}
      <div className="flex gap-0.5">
        {segments.map((filled, i) => (
          <span
            key={i}
            className={cn("h-2 flex-1", filled ? "bg-pitch-green" : "bg-hairline-16")}
          />
        ))}
      </div>
    </div>
  );
}

export { RatingBar };
