import * as React from "react";

import { cn } from "@/lib/utils";

/** DESIGN.md "Chips & Tactical Tags": 0 radius, bg #182E25, label-tactical type. */
function Chip({
  className,
  status,
  children,
  ...props
}: React.ComponentProps<"span"> & { status?: "green" | "red" }) {
  return (
    <span
      data-slot="chip"
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-1 text-label-tactical text-chalk",
        "border-[rgba(247,245,239,0.12)] bg-slate-grass",
        className,
      )}
      {...props}
    >
      {status && (
        <span
          aria-hidden
          className={cn(
            "size-1.5 shrink-0",
            status === "green" ? "bg-pitch-green" : "bg-touchline-red",
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Chip };
