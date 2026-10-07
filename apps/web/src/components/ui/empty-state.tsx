import * as React from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Not designed by Stitch (§8) — built in the same system: dashed hairline, muted icon. */
function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 border border-dashed border-hairline-16 px-6 py-12 text-center",
        className,
      )}
    >
      {icon && <Icon name={icon} size={32} className="text-muted-foreground" />}
      <p className="text-headline-sm text-chalk">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

export { EmptyState };
