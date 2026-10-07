export interface NavItem {
  href: string;
  icon: string;
  labelNamespace: string;
  labelKey: string;
}

/**
 * The one real app shell (docs/design-implementation-plan.md §2 "App
 * shell") — Stitch invented a different fake sidebar per screen; this
 * replaces all of them. Mobile shows the first four as fixed bottom tabs
 * plus a "More" sheet for the rest.
 */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", icon: "space_dashboard", labelNamespace: "dashboard", labelKey: "title" },
  { href: "/players", icon: "groups", labelNamespace: "players", labelKey: "title" },
  { href: "/matches", icon: "sports_soccer", labelNamespace: "matches", labelKey: "title" },
  { href: "/assistant", icon: "neurology", labelNamespace: "assistant", labelKey: "title" },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/teams", icon: "shield", labelNamespace: "teams", labelKey: "title" },
  { href: "/opponents", icon: "travel_explore", labelNamespace: "opponents", labelKey: "title" },
  { href: "/settings", icon: "settings", labelNamespace: "settings", labelKey: "title" },
];

export const ALL_NAV: NavItem[] = [...PRIMARY_NAV, ...SECONDARY_NAV];
