import * as React from "react";

import { cn } from "@/lib/utils";

/** Same sharp-square treatment as Checkbox — DESIGN.md draws radios square too. */
function Radio({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <span className="relative inline-flex size-4 shrink-0">
      <input
        type="radio"
        data-slot="radio"
        className={cn("peer absolute inset-0 size-4 cursor-pointer appearance-none", className)}
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center border border-hairline-24 bg-slate-grass",
          "peer-checked:border-chalk peer-checked:bg-chalk peer-checked:[&>span]:scale-100",
          "peer-disabled:opacity-50",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50",
        )}
      >
        <span className="size-2 scale-0 bg-night-pitch transition-transform" />
      </span>
    </span>
  );
}

export { Radio };
