import { v } from "convex/values";

import { mutation, query } from "./_generated/server.js";
import { assertSameClub, requireCoach } from "./lib/auth.js";

export const listByMatch = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    // Confirm the match is this club's before returning its events.
    assertSameClub(coach, await ctx.db.get(args.matchId));

    const events = await ctx.db
      .query("matchEvents")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();
    return events.sort((a, b) => a.minute - b.minute);
  },
});

export const add = mutation({
  args: {
    matchId: v.id("matches"),
    minute: v.number(),
    eventType: v.union(
      v.literal("goal"),
      v.literal("assist"),
      v.literal("substitution"),
      v.literal("yellow_card"),
      v.literal("red_card"),
      v.literal("injury"),
      v.literal("tactical_change"),
    ),
    side: v.union(v.literal("us"), v.literal("them")),
    playerId: v.optional(v.id("players")),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    assertSameClub(coach, await ctx.db.get(args.matchId));
    return ctx.db.insert("matchEvents", { ...args, clubId: coach.clubId });
  },
});

export const remove = mutation({
  args: { id: v.id("matchEvents") },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    assertSameClub(coach, await ctx.db.get(args.id));
    await ctx.db.delete(args.id);
  },
});
