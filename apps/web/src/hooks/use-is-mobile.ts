"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 768px)"; // Tailwind's `md` breakpoint

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/**
 * True below the `md` breakpoint. Unlike a CSS `hidden md:flex` split, this
 * is for components that must mount only ONE instance of something (e.g.
 * the squad board's single DndContext) rather than one hidden copy per
 * breakpoint — see docs/design-implementation-plan.md §1.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !window.matchMedia(QUERY).matches,
    () => false,
  );
}
