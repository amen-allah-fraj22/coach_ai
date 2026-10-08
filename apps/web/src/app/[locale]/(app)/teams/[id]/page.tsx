import { notFound } from "next/navigation";

import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { TeamRosterBoard } from "@/components/teams/team-roster-board";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [team, players] = await Promise.all([
    fetchAuthed(api.teams.get, { id: id as Id<"teams"> }),
    fetchAuthed(api.players.list, {}),
  ]);

  if (!team) notFound();

  const teamPlayers = ((players ?? []) as Doc<"players">[]).filter(
    (p) => p.teamId === team._id,
  );

  return (
    <div className="max-w-3xl">
      <TeamRosterBoard team={team} players={teamPlayers} />
    </div>
  );
}
