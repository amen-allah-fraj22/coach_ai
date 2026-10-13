import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * DESIGN.md "Analytical Cards & Pitch Containers": Level 1 slate container,
 * 1px .08 hairline perimeter, no shadow (elevation is flat, not drop-shadow).
 */
function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel"
      className={cn("border border-hairline-08 bg-slate-grass", className)}
      {...props}
    />
  );
}

function PanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-header"
      className={cn(
        "flex items-center justify-between border-b border-hairline-08 px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

export { Panel, PanelHeader };
