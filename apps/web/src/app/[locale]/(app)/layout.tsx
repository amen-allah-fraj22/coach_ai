import { redirect } from "next/navigation";

import { getServerCoach } from "@/lib/convex/server";
import { Sidebar } from "@/components/shell/sidebar";
import { TopBar } from "@/components/shell/top-bar";
import { BottomTabBar } from "@/components/shell/bottom-tab-bar";

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

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <Sidebar clubName={current.club.name} coachName={current.coach.fullName} />

      <div className="flex min-h-full flex-1 flex-col md:ms-64">
        <TopBar />
        <main className="flex-1 px-4 py-6 pb-20 md:px-8 md:py-8 md:pb-8">{children}</main>
      </div>

      <BottomTabBar />
    </div>
  );
}
