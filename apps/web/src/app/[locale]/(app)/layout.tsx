import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getCurrentCoach } from "@/lib/auth/session";
import { logout } from "@/lib/auth/actions";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const current = await getCurrentCoach();

  if (!current) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations("dashboard");
  const tSettings = await getTranslations("settings");
  const tTeams = await getTranslations("teams");
  const tPlayers = await getTranslations("players");
  const tMatches = await getTranslations("matches");
  const tOpponents = await getTranslations("opponents");
  const tAssistant = await getTranslations("assistant");

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <nav className="flex items-center gap-6 text-sm font-medium">
          <span className="font-display uppercase tracking-tight text-primary">
            CoachAI
          </span>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
            {t("title")}
          </Link>
          <Link href="/teams" className="text-muted-foreground hover:text-foreground">
            {tTeams("title")}
          </Link>
          <Link href="/players" className="text-muted-foreground hover:text-foreground">
            {tPlayers("title")}
          </Link>
          <Link href="/matches" className="text-muted-foreground hover:text-foreground">
            {tMatches("title")}
          </Link>
          <Link
            href="/opponents"
            className="text-muted-foreground hover:text-foreground"
          >
            {tOpponents("title")}
          </Link>
          <Link
            href="/assistant"
            className="font-medium text-primary hover:text-primary/80"
          >
            {tAssistant("title")}
          </Link>
          <Link href="/settings" className="text-muted-foreground hover:text-foreground">
            {tSettings("title")}
          </Link>
        </nav>

        <form action={logout}>
          <input type="hidden" name="locale" value={locale} />
          <Button type="submit" variant="ghost" size="sm">
            {current.coach.full_name}
          </Button>
        </form>
      </header>

      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
