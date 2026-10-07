"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface SegmentedTab {
  value: string;
  label: React.ReactNode;
}

/**
 * Folder-divider tab strip (profile/dossier sections, language switch). A
 * plain controlled component — the language switch's "shirt number" look
 * (e.g. "07 FR") is just styling applied to `label` at the call site.
 */
function SegmentedTabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: SegmentedTab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("flex border-b border-hairline-08", className)}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "border-b-2 px-4 py-2 text-label-tactical transition-colors",
              active
                ? "border-chalk text-chalk"
                : "border-transparent text-muted-foreground hover:text-chalk",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export { SegmentedTabs };
