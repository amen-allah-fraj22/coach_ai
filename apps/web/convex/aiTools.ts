import { v } from "convex/values";

import { internalQuery } from "./_generated/server.js";
import type { Doc } from "./_generated/dataModel.js";
import type { LlmToolDefinition } from "./aiLlm.js";

// Internal queries backing the assistant's tools. They are internal (never
// client-callable) and take clubId from the action, which resolved it from
// the authenticated coach — so club scoping is still enforced, just one step
// up in the action rather than in each query.

function player(p: Doc<"players">) {
  return {
    id: p._id,
    name: p.name,
    position: p.position,
    secondaryPosition: p.secondaryPosition,
    preferredFoot: p.preferredFoot,
    availability: p.availability,
    technicalRating: p.technicalRating,
    physicalRating: p.physicalRating,
    tacticalRating: p.tacticalRating,
    formRating: p.formRating,
    coachNotes: p.coachNotes,
    squadGroup: p.squadGroup,
    teamId: p.teamId,
  };
}

function match(m: Doc<"matches">) {
  return {
    id: m._id,
    matchDate: m.matchDate,
    homeAway: m.homeAway,
    competition: m.competition,
    ourFormation: m.ourFormation,
    opponentFormation: m.opponentFormation,
    scoreFor: m.scoreFor,
    scoreAgainst: m.scoreAgainst,
    possessionPct: m.possessionPct,
    shots: m.shots,
    shotsOnTarget: m.shotsOnTarget,
    corners: m.corners,
    fouls: m.fouls,
    coachNotes: m.coachNotes,
    teamId: m.teamId,
    opponentId: m.opponentId,
  };
}

export const listTeams = internalQuery({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();
    return {
      teams: teams.map((t) => ({
        id: t._id,
        name: t.name,
        ageCategory: t.ageCategory,
        competition: t.competition,
        defaultFormation: t.defaultFormation,
      })),
    };
  },
});

export const getSquad = internalQuery({
  args: {
    clubId: v.id("clubs"),
    teamId: v.optional(v.id("teams")),
    onlyAvailable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let players = await ctx.db
      .query("players")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();
    if (args.teamId) players = players.filter((p) => p.teamId === args.teamId);
    if (args.onlyAvailable) players = players.filter((p) => p.availability === "available");
    return { players: players.map(player) };
  },
});

export const comparePlayers = internalQuery({
  args: { clubId: v.id("clubs"), playerIds: v.array(v.id("players")) },
  handler: async (ctx, args) => {
    const players: ReturnType<typeof player>[] = [];
    for (const id of args.playerIds) {
      const p = await ctx.db.get(id);
      if (p && p.clubId === args.clubId) players.push(player(p));
    }
    return { players };
  },
});

export const getRecentMatches = internalQuery({
  args: {
    clubId: v.id("clubs"),
    teamId: v.optional(v.id("teams")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let matches = await ctx.db
      .query("matches")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();
    if (args.teamId) matches = matches.filter((m) => m.teamId === args.teamId);
    matches.sort((a, b) => b.matchDate.localeCompare(a.matchDate));
    return { matches: matches.slice(0, Math.min(args.limit ?? 5, 20)).map(match) };
  },
});

export const getMatchEvents = internalQuery({
  args: { clubId: v.id("clubs"), matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const m = await ctx.db.get(args.matchId);
    if (!m || m.clubId !== args.clubId) return { events: [] };
    const events = await ctx.db
      .query("matchEvents")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();
    events.sort((a, b) => a.minute - b.minute);
    return {
      events: events.map((e) => ({
        minute: e.minute,
        eventType: e.eventType,
        side: e.side,
        playerId: e.playerId,
        description: e.description,
      })),
    };
  },
});

export const listOpponents = internalQuery({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const opponents = await ctx.db
      .query("opponents")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();
    return {
      opponents: opponents.map((o) => ({
        id: o._id,
        teamName: o.teamName,
        usualFormation: o.usualFormation,
      })),
    };
  },
});

export const getOpponent = internalQuery({
  args: {
    clubId: v.id("clubs"),
    opponentId: v.optional(v.id("opponents")),
    teamName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let found: Doc<"opponents"> | null = null;
    if (args.opponentId) {
      const o = await ctx.db.get(args.opponentId);
      if (o && o.clubId === args.clubId) found = o;
    } else if (args.teamName) {
      const all = await ctx.db
        .query("opponents")
        .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
        .collect();
      found =
        all.find(
          (o) => o.teamName.toLowerCase() === args.teamName!.toLowerCase(),
        ) ?? null;
    }
    if (!found) return { opponent: null };
    return {
      opponent: {
        teamName: found.teamName,
        usualFormation: found.usualFormation,
        alternativeFormations: found.alternativeFormations,
        playingStyle: found.playingStyle,
        pressingStyle: found.pressingStyle,
        buildUpStyle: found.buildUpStyle,
        defensiveStyle: found.defensiveStyle,
        strengths: found.strengths,
        weaknesses: found.weaknesses,
        setPieceNotes: found.setPieceNotes,
      },
    };
  },
});

/** The tool schema advertised to the model (get_coach_profile is served
 *  from the action directly, the rest map to the internal queries above). */
export const toolDefinitions: LlmToolDefinition[] = [
  {
    name: "list_teams",
    description:
      "Lists the club's teams with age category, competition and default formation. Use first when the coach hasn't said which team they mean.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "get_squad",
    description:
      "Players of a team with ratings, positions, availability and coach notes. Use before naming any player.",
    parameters: {
      type: "object",
      properties: {
        team_id: { type: "string", description: "Team id from list_teams. Omit for all club players." },
        only_available: { type: "boolean", description: "Exclude injured/suspended/unavailable." },
      },
    },
  },
  {
    name: "compare_players",
    description: "Full profiles for specific players side by side.",
    parameters: {
      type: "object",
      properties: {
        player_ids: { type: "array", items: { type: "string" }, description: "Player ids from get_squad." },
      },
      required: ["player_ids"],
    },
  },
  {
    name: "get_recent_matches",
    description: "Recent matches with result, formations and basic stats, newest first.",
    parameters: {
      type: "object",
      properties: {
        team_id: { type: "string" },
        limit: { type: "number", description: "Default 5, max 20." },
      },
    },
  },
  {
    name: "get_match_events",
    description: "Logged events of one match (goals, cards, subs, injuries, tactical changes) in minute order.",
    parameters: {
      type: "object",
      properties: { match_id: { type: "string" } },
      required: ["match_id"],
    },
  },
  {
    name: "list_opponents",
    description: "Scouted opponents by name with usual formation.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "get_opponent",
    description: "One opponent's full scouting profile.",
    parameters: {
      type: "object",
      properties: {
        opponent_id: { type: "string" },
        team_name: { type: "string", description: "If the id is unknown (case-insensitive)." },
      },
    },
  },
  {
    name: "get_coach_profile",
    description:
      "The coach's own stated philosophy: preferred formation, playing style, risk tolerance. Don't contradict it without saying so.",
    parameters: { type: "object", properties: {} },
  },
];
