import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-10 w-full min-w-0 rounded-none bg-transparent px-3 py-1 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        /** Sharp 1px border, used on most forms. */
        bordered: "border border-input focus-visible:border-chalk",
        /** Bottom rule only, used on some auth screens. */
        underline: "border-0 border-b border-hairline-16 px-0 focus-visible:border-chalk",
      },
    },
    defaultVariants: { variant: "bordered" },
  },
);

function Input({
  className,
  type,
  variant,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Input, inputVariants };
