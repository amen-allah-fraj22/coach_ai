"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import { ALL_NAV } from "@/components/shell/nav-items";
import { cn } from "@/lib/utils";

/** Fixed 256px left sidebar (desktop only) — see nav-items.tsx. */
export function Sidebar({
  clubName,
  coachName,
}: {
  clubName: string;
  coachName: string;
}) {
  const tApp = useTranslations("app");
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e border-hairline-08 bg-night-pitch md:flex">
      <div className="border-b border-hairline-08 px-5 py-5">
        <span className="font-display text-xl uppercase tracking-tight text-chalk">
          {tApp("name")}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {ALL_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 border-s-4 px-3 py-2.5 text-sm transition-colors",
                active
                  ? "border-s-pitch-green bg-wash-green text-chalk"
                  : "border-s-transparent text-muted-foreground hover:text-chalk",
              )}
            >
              <Icon name={item.icon} size={20} />
              {t(`${item.labelNamespace}.${item.labelKey}`)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-hairline-08 px-4 py-4">
        <p className="truncate text-sm font-medium text-chalk">{clubName}</p>
        <p className="truncate text-xs text-muted-foreground">{coachName}</p>
      </div>
    </aside>
  );
}
