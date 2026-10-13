import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Variants match design/stitch/DESIGN.md "Buttons & Tactical Triggers"
 * exactly (primary/secondary/destructive), plus `pill` for the landing CTA
 * only (the sole rounded element besides status dots/avatars). The
 * `stampPress` motion preset (lib/motion.ts) is layered on at the call site
 * via `whileTap`, not baked in here as a separate color variant — it's a
 * behavior (Accept/Modify/Reject, "Stamp & …" submits), not a look.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-display uppercase tracking-wide outline-none transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:ring-2 focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        primary:
          "border border-chalk bg-chalk text-night-pitch hover:bg-slate-grass hover:text-chalk",
        secondary:
          "border border-hairline-16 bg-slate-grass text-chalk hover:border-hairline-24",
        destructive:
          "border border-touchline-red bg-slate-grass text-touchline-red hover:bg-touchline-red hover:text-chalk",
        pill: "rounded-full bg-touchline-red text-chalk hover:bg-touchline-red/90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        full: "h-14 w-full text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
