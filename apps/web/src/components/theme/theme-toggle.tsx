"use client";

import { useTranslations } from "next-intl";

import { Icon } from "@/components/ui/icon";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import type { ThemePreference } from "@/lib/theme";

/** Compact light/dark switch for the top bar and landing nav. */
export function ThemeToggleButton({ className }: { className?: string }) {
  const t = useTranslations("common");
  const { resolved, setPreference } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setPreference(next)}
      aria-label={next === "dark" ? t("switchToDark") : t("switchToLight")}
      className={cn(
        "inline-flex size-9 items-center justify-center border border-hairline-16 text-chalk hover:border-chalk",
        className,
      )}
    >
      <Icon name={next === "dark" ? "dark_mode" : "light_mode"} size={20} />
    </button>
  );
}

const OPTIONS: { value: ThemePreference; icon: string; labelKey: "themeLight" | "themeDark" | "themeSystem" }[] = [
  { value: "light", icon: "light_mode", labelKey: "themeLight" },
  { value: "dark", icon: "dark_mode", labelKey: "themeDark" },
  { value: "system", icon: "brightness_auto", labelKey: "themeSystem" },
];

/** Light / Dark / System picker for Settings. */
export function ThemeSegmented() {
  const t = useTranslations("common");
  const { preference, setPreference } = useTheme();

  return (
    <div role="radiogroup" aria-label={t("theme")} className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => {
        const active = option.value === preference;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(option.value)}
            className={cn(
              "flex items-center gap-1.5 border px-3 py-2 text-xs uppercase",
              active
                ? "border-chalk bg-chalk font-semibold text-night-pitch"
                : "border-hairline-16 text-muted-foreground hover:text-chalk",
            )}
          >
            <Icon name={option.icon} size={16} />
            {t(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
