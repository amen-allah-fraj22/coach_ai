import { v } from "convex/values";

import { mutation, query } from "./_generated/server.js";
import { assertSameClub, requireCoach } from "./lib/auth.js";

const fields = {
  teamId: v.id("teams"),
  opponentId: v.optional(v.id("opponents")),
  matchDate: v.string(),
  kickoffTime: v.optional(v.string()),
  homeAway: v.union(v.literal("home"), v.literal("away")),
  competition: v.optional(v.string()),
  ourFormation: v.optional(v.string()),
  opponentFormation: v.optional(v.string()),
  scoreFor: v.optional(v.number()),
  scoreAgainst: v.optional(v.number()),
  possessionPct: v.optional(v.number()),
  shots: v.optional(v.number()),
  shotsOnTarget: v.optional(v.number()),
  corners: v.optional(v.number()),
  fouls: v.optional(v.number()),
  yellowCards: v.optional(v.number()),
  redCards: v.optional(v.number()),
  coachNotes: v.optional(v.string()),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const coach = await requireCoach(ctx);
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_club", (q) => q.eq("clubId", coach.clubId))
      .collect();
    // Newest first.
    return matches.sort((a, b) => b.matchDate.localeCompare(a.matchDate));
  },
});

export const get = query({
  args: { id: v.id("matches") },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    const match = await ctx.db.get(args.id);
    assertSameClub(coach, match);
    return match;
  },
});

export const create = mutation({
  args: fields,
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    return ctx.db.insert("matches", { ...args, clubId: coach.clubId });
  },
});

export const update = mutation({
  args: { id: v.id("matches"), ...fields },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    const { id, ...patch } = args;
    assertSameClub(coach, await ctx.db.get(id));
    await ctx.db.patch(id, patch);
  },
});

const importRow = {
  matchDate: v.string(),
  homeAway: v.union(v.literal("home"), v.literal("away")),
  competition: v.optional(v.string()),
  ourFormation: v.optional(v.string()),
  opponentFormation: v.optional(v.string()),
  scoreFor: v.optional(v.number()),
  scoreAgainst: v.optional(v.number()),
  possessionPct: v.optional(v.number()),
  shots: v.optional(v.number()),
  shotsOnTarget: v.optional(v.number()),
  corners: v.optional(v.number()),
  fouls: v.optional(v.number()),
  yellowCards: v.optional(v.number()),
  redCards: v.optional(v.number()),
  coachNotes: v.optional(v.string()),
};

/**
 * Bulk-inserts matches parsed from a spreadsheet. The team is chosen once in
 * the UI (CSV exports rarely carry it) and applied to every row; opponents
 * are left unlinked and can be matched up by editing afterward.
 */
export const importRows = mutation({
  args: {
    teamId: v.id("teams"),
    rows: v.array(v.object(importRow)),
  },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    assertSameClub(coach, await ctx.db.get(args.teamId));

    for (const row of args.rows) {
      await ctx.db.insert("matches", {
        ...row,
        clubId: coach.clubId,
        teamId: args.teamId,
      });
    }
    return { imported: args.rows.length };
  },
});
