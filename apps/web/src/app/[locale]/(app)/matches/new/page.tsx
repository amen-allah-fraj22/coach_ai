import { redirect } from "next/navigation";

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
      <MatchForm teams={teamList} opponents={(opponents ?? []) as Doc<"opponents">[]} />
    </div>
  );
}
