import { UserButton } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";

/** Persistent top bar: brand on mobile (sidebar carries it on desktop) + Clerk user button. */
export async function TopBar() {
  const t = await getTranslations("app");

  return (
    <header className="flex items-center justify-between border-b border-hairline-08 bg-night-pitch px-4 py-3 md:justify-end md:px-6">
      <span className="font-display text-lg uppercase tracking-tight text-chalk md:hidden">
        {t("name")}
      </span>
      <UserButton />
    </header>
  );
}
