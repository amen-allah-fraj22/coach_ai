import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { MatchForm } from "@/components/matches/match-form";
import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";

export default async function NewMatchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("matches");

  const [teams, opponents] = await Promise.all([
    fetchAuthed(api.teams.list, {}),
    fetchAuthed(api.opponents.list, {}),
  ]);

  const teamList = (teams ?? []) as Doc<"teams">[];
  if (teamList.length === 0) {
    redirect(`/${locale}/teams/new`);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="font-display text-2xl uppercase tracking-tight">
        {t("addMatch")}
      </h1>
      <MatchForm teams={teamList} opponents={(opponents ?? []) as Doc<"opponents">[]} />
    </div>
  );
}
