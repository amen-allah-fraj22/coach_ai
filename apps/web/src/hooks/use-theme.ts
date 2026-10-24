"use client";

import { useSyncExternalStore } from "react";

import {
  DEFAULT_THEME_PREFERENCE,
  THEME_STORAGE_KEY,
  applyTheme,
  readThemePreference,
  resolveTheme,
  writeThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  const media = matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (readThemePreference() === "system") {
      applyTheme(resolveTheme("system"));
      notify();
    }
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      applyTheme(resolveTheme(readThemePreference()));
      notify();
    }
  };

  media.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
}

function setPreference(preference: ThemePreference) {
  writeThemePreference(preference);
  applyTheme(resolveTheme(preference));
  notify();
}

/**
 * The saved preference (light | dark | system) plus the theme it resolves to.
 * Server and first-hydration render use the default so markup matches; the
 * real value arrives right after.
 */
export function useTheme(): {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
} {
  const preference = useSyncExternalStore(
    subscribe,
    readThemePreference,
    () => DEFAULT_THEME_PREFERENCE,
  );
  return {
    preference,
    resolved: resolveTheme(preference),
    setPreference,
  };
}
