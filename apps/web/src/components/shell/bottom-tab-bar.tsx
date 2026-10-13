"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SignOutButton } from "@clerk/nextjs";

import { Link, usePathname } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/components/shell/nav-items";
import { cn } from "@/lib/utils";

/** Fixed bottom tab bar (mobile only): the 4 primary routes + a More sheet. */
export function BottomTabBar() {
  const t = useTranslations();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-hairline-08 bg-night-pitch md:hidden">
        {PRIMARY_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]",
                active ? "text-chalk" : "text-muted-foreground",
              )}
            >
              <Icon name={item.icon} size={22} />
              {t(`${item.labelNamespace}.${item.labelKey}`)}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] text-muted-foreground"
        >
          <Icon name="more_horiz" size={22} />
          {t("nav.more")}
        </button>
      </nav>

      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title={t("nav.more")}>
        <div className="flex flex-col gap-1">
          {SECONDARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 border-b border-hairline-08 py-3 text-chalk"
            >
              <Icon name={item.icon} size={20} />
              {t(`${item.labelNamespace}.${item.labelKey}`)}
            </Link>
          ))}
          <SignOutButton>
            <button
              type="button"
              className="flex items-center gap-3 py-3 text-start text-touchline-red"
            >
              <Icon name="logout" size={20} />
              {t("nav.signOut")}
            </button>
          </SignOutButton>
        </div>
      </BottomSheet>
    </>
  );
}
