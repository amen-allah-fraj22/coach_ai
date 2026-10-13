import { query } from "./_generated/server.js";
import { requireCoach } from "./lib/auth.js";
import type { Doc, Id } from "./_generated/dataModel.js";

interface MatchSummary {
  id: Id<"matches">;
  teamId: Id<"teams">;
  teamName: string;
  opponentName: string | null;
  matchDate: string;
  kickoffTime?: string;
  homeAway: "home" | "away";
  competition?: string;
  ourFormation?: string;
  opponentFormation?: string;
  scoreFor?: number;
  scoreAgainst?: number;
}

/**
 * Everything the dashboard needs in one round-trip (§6): next match, last
 * match, a short upcoming list, the latest AI recommendation, squad
 * availability counts, and the next opponent's recorded weaknesses.
 */
export const summary = query({
  args: {},
  handler: async (ctx) => {
    const coach = await requireCoach(ctx);
    const clubId = coach.clubId;

    const [teams, matches, opponents, recommendations, players] = await Promise.all([
      ctx.db.query("teams").withIndex("by_club", (q) => q.eq("clubId", clubId)).collect(),
      ctx.db.query("matches").withIndex("by_club", (q) => q.eq("clubId", clubId)).collect(),
      ctx.db.query("opponents").withIndex("by_club", (q) => q.eq("clubId", clubId)).collect(),
      ctx.db
        .query("aiRecommendations")
        .withIndex("by_club", (q) => q.eq("clubId", clubId))
        .collect(),
      ctx.db.query("players").withIndex("by_club", (q) => q.eq("clubId", clubId)).collect(),
    ]);

    const teamById = new Map(teams.map((t) => [t._id, t]));
    const opponentById = new Map(opponents.map((o) => [o._id, o]));

    function toSummary(m: Doc<"matches">): MatchSummary {
      return {
        id: m._id,
        teamId: m.teamId,
        teamName: teamById.get(m.teamId)?.name ?? "",
        opponentName: m.opponentId ? (opponentById.get(m.opponentId)?.teamName ?? null) : null,
        matchDate: m.matchDate,
        kickoffTime: m.kickoffTime,
        homeAway: m.homeAway,
        competition: m.competition,
        ourFormation: m.ourFormation,
        opponentFormation: m.opponentFormation,
        scoreFor: m.scoreFor,
        scoreAgainst: m.scoreAgainst,
      };
    }

    const today = new Date().toISOString().slice(0, 10);
    const sorted = [...matches].sort((a, b) => a.matchDate.localeCompare(b.matchDate));
    const upcoming = sorted.filter((m) => m.matchDate >= today);
    const past = sorted.filter((m) => m.matchDate < today).reverse();

    const nextMatchDoc = upcoming[0] ?? null;
    const lastMatchDoc = past[0] ?? null;

    const latestRecommendationDoc = recommendations.reduce<Doc<"aiRecommendations"> | null>(
      (latest, r) => (!latest || r._creationTime > latest._creationTime ? r : latest),
      null,
    );

    const availability = { available: 0, injured: 0, suspended: 0, unavailable: 0 };
    for (const p of players) {
      availability[p.availability] += 1;
    }

    const nextOpponentWeakness = nextMatchDoc?.opponentId
      ? (opponentById.get(nextMatchDoc.opponentId)?.weaknesses ?? null)
      : null;

    return {
      hasTeams: teams.length > 0,
      nextMatch: nextMatchDoc ? toSummary(nextMatchDoc) : null,
      lastMatch: lastMatchDoc ? toSummary(lastMatchDoc) : null,
      upcoming: upcoming.slice(1, 5).map(toSummary),
      pastCount: past.length,
      latestRecommendation: latestRecommendationDoc
        ? {
            headline:
              (latestRecommendationDoc.recommendation as { headline?: string } | null)
                ?.headline ?? null,
            question: latestRecommendationDoc.question,
            matchId: latestRecommendationDoc.matchId ?? null,
            createdAt: latestRecommendationDoc._creationTime,
          }
        : null,
      availability,
      nextOpponentWeakness,
    };
  },
});
