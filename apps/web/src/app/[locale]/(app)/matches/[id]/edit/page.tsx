import { notFound } from "next/navigation";

import { MatchForm } from "@/components/matches/match-form";
import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";

export default async function EditMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const match = await fetchAuthed(api.matches.get, { id: id as Id<"matches"> });
  if (!match) notFound();

  const [teams, opponents] = await Promise.all([
    fetchAuthed(api.teams.list, {}),
    fetchAuthed(api.opponents.list, {}),
  ]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <MatchForm
        teams={(teams ?? []) as Doc<"teams">[]}
        opponents={(opponents ?? []) as Doc<"opponents">[]}
        match={match}
      />
    </div>
  );
}
