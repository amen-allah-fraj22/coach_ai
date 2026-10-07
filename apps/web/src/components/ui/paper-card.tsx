"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { paperDrop } from "@/lib/motion";

/**
 * The rotated "team sheet" card object (dashboard, landing). Chalk surface,
 * a slight paper tilt, and a real shadow — one of the few places DESIGN.md
 * allows a shadow, since it's a physical object, not UI chrome.
 */
function PaperCard({
  className,
  rotate = -2,
  index = 0,
  children,
  ...props
}: React.ComponentProps<typeof motion.div> & { rotate?: number; index?: number }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      data-slot="paper-card"
      variants={paperDrop({ rotate, index }, reduced ?? false)}
      initial="hidden"
      animate="show"
      className={cn(
        "border border-hairline-08 bg-chalk p-5 text-night-pitch shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export { PaperCard };
