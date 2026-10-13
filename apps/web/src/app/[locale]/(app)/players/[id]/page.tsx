import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { PlayerDossier } from "@/components/players/player-dossier";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tMatches = await getTranslations("matches");

  const [player, allPlayers, events, matches, opponents] = await Promise.all([
    fetchAuthed(api.players.get, { id: id as Id<"players"> }),
    fetchAuthed(api.players.list, {}),
    fetchAuthed(api.matchEvents.listByPlayer, { playerId: id as Id<"players"> }),
    fetchAuthed(api.matches.list, {}),
    fetchAuthed(api.opponents.list, {}),
  ]);

  if (!player) notFound();

  const matchById = new Map(((matches ?? []) as Doc<"matches">[]).map((m) => [m._id, m]));
  const opponentNames = new Map(
    ((opponents ?? []) as Doc<"opponents">[]).map((o) => [o._id, o.teamName]),
  );

  const recentMatches = ((events ?? []) as Doc<"matchEvents">[])
    .slice(0, 10)
    .map((event) => {
      const match = matchById.get(event.matchId);
      return {
        id: event._id,
        matchDate: match?.matchDate ?? "—",
        opponentName: match?.opponentId
          ? (opponentNames.get(match.opponentId) ?? tMatches("unknownOpponent"))
          : tMatches("unknownOpponent"),
        minute: event.minute,
        eventType: event.eventType,
      };
    });

  const peers = ((allPlayers ?? []) as Doc<"players">[]).filter(
    (p) => p._id !== player._id && p.position && p.position === player.position,
  );
  const peerAverage =
    peers.length > 0
      ? {
          technicalRating: avg(peers, "technicalRating"),
          physicalRating: avg(peers, "physicalRating"),
          tacticalRating: avg(peers, "tacticalRating"),
          formRating: avg(peers, "formRating"),
          count: peers.length,
        }
      : null;

  return (
    <div className="mx-auto max-w-2xl">
      <PlayerDossier player={player} recentMatches={recentMatches} peerAverage={peerAverage} />
    </div>
  );
}

function avg(players: Doc<"players">[], key: "technicalRating" | "physicalRating" | "tacticalRating" | "formRating") {
  const values = players.map((p) => p[key]).filter((v): v is number => typeof v === "number");
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
