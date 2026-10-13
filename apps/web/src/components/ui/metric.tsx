import * as React from "react";

import { cn } from "@/lib/utils";

/** A big tabular-nums figure with a small uppercase tactical label beneath it. */
function Metric({
  value,
  label,
  className,
  size = "default",
}: {
  value: React.ReactNode;
  label: React.ReactNode;
  className?: string;
  size?: "default" | "mobile";
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span
        className={cn(
          "text-chalk tabular-nums",
          size === "mobile" ? "text-metric-huge-mobile" : "text-metric-huge",
        )}
      >
        {value}
      </span>
      <span className="text-label-tactical text-muted-foreground">{label}</span>
    </div>
  );
}

export { Metric };
