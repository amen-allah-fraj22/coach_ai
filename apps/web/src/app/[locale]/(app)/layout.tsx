import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SignOutButton } from "@clerk/nextjs";

import { getServerCoach } from "@/lib/convex/server";
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
  // Middleware guarantees a signed-in Clerk user here. If they have no coach
  // profile yet, send them to onboarding to create a club or accept an invite.
  const current = await getServerCoach();

  if (!current) {
    redirect(`/${locale}/onboarding`);
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

        <SignOutButton>
          <Button type="button" variant="ghost" size="sm">
            {current.coach.fullName}
          </Button>
        </SignOutButton>
      </header>

      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
