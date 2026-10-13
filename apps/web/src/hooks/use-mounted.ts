"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * True only after the client has hydrated. Used to gate portal-based UI
 * (document.body isn't available during SSR). Implemented via
 * useSyncExternalStore rather than `useState` + `useEffect` so the
 * mount-triggered re-render isn't flagged as a setState-in-effect anti-pattern.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
