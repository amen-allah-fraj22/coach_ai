"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { sheetUp } from "@/lib/motion";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useMounted } from "@/hooks/use-mounted";
import { Icon } from "@/components/ui/icon";

/**
 * Mobile: slides up from the bottom (sheetUp), Night Pitch with a 2px Chalk
 * top edge. Desktop: centered modal, Night Pitch with a 2px Chalk border —
 * DESIGN.md "Overlays & Modals". One component, switched by useIsMobile()
 * rather than a CSS-only split, since only one should ever be mounted.
 */
function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const mounted = useMounted();

  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <motion.div
            className="absolute inset-0 bg-night-pitch/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : undefined}
            variants={isMobile ? sheetUp(reduced ?? false) : undefined}
            initial={isMobile ? "hidden" : { opacity: 0, scale: 0.96 }}
            animate={isMobile ? "show" : { opacity: 1, scale: 1 }}
            exit={isMobile ? "exit" : { opacity: 0, scale: 0.96 }}
            className={cn(
              "relative z-10 flex max-h-[85vh] w-full flex-col overflow-y-auto border-2 border-chalk bg-night-pitch shadow-[0_-8px_24px_rgba(0,0,0,0.4)]",
              "md:max-w-lg",
              className,
            )}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-hairline-08 px-4 py-3">
                <h2 className="text-headline-sm text-chalk">{title}</h2>
                <button type="button" onClick={onClose} className="text-chalk">
                  <Icon name="close" label="Close" />
                </button>
              </div>
            )}
            <div className="p-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export { BottomSheet };
