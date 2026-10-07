import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A styled native <select>. Deliberately not the Radix listbox: native
 * selects keep the mobile picker, need no JS, and mirror correctly in RTL —
 * all of which matter more here than a custom popover.
 */
function SelectNative({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select-native"
      className={cn(
        "flex h-10 w-full rounded-none border border-input bg-transparent px-3 text-sm text-foreground outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-chalk",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { SelectNative };
