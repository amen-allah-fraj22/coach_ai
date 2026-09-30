import { v } from "convex/values";

import { mutation, query } from "./_generated/server.js";
import { assertSameClub, requireCoach } from "./lib/auth.js";

const fields = {
  teamName: v.string(),
  usualFormation: v.optional(v.string()),
  alternativeFormations: v.array(v.string()),
  playingStyle: v.optional(v.string()),
  pressingStyle: v.optional(v.string()),
  buildUpStyle: v.optional(v.string()),
  defensiveStyle: v.optional(v.string()),
  strengths: v.optional(v.string()),
  weaknesses: v.optional(v.string()),
  setPieceNotes: v.optional(v.string()),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const coach = await requireCoach(ctx);
    return ctx.db
      .query("opponents")
      .withIndex("by_club", (q) => q.eq("clubId", coach.clubId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("opponents") },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    const opponent = await ctx.db.get(args.id);
    assertSameClub(coach, opponent);
    return opponent;
  },
});

export const create = mutation({
  args: fields,
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    return ctx.db.insert("opponents", { ...args, clubId: coach.clubId });
  },
});

export const update = mutation({
  args: { id: v.id("opponents"), ...fields },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    const { id, ...patch } = args;
    assertSameClub(coach, await ctx.db.get(id));
    await ctx.db.patch(id, patch);
  },
});
