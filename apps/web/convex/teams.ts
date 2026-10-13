import { v } from "convex/values";

import { mutation, query } from "./_generated/server.js";
import { assertSameClub, requireCoach } from "./lib/auth.js";

const fields = {
  name: v.string(),
  ageCategory: v.optional(v.string()),
  competition: v.optional(v.string()),
  defaultFormation: v.optional(v.string()),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const coach = await requireCoach(ctx);
    return ctx.db
      .query("teams")
      .withIndex("by_club", (q) => q.eq("clubId", coach.clubId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    const team = await ctx.db.get(args.id);
    assertSameClub(coach, team);
    return team;
  },
});

export const create = mutation({
  args: fields,
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    return ctx.db.insert("teams", { ...args, clubId: coach.clubId });
  },
});

export const update = mutation({
  args: { id: v.id("teams"), ...fields },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    const { id, ...patch } = args;
    assertSameClub(coach, await ctx.db.get(id));
    await ctx.db.patch(id, patch);
  },
});

/** Refuses to delete a team that still has players — move or delete them first. */
export const remove = mutation({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    assertSameClub(coach, await ctx.db.get(args.id));

    const players = await ctx.db
      .query("players")
      .withIndex("by_team", (q) => q.eq("teamId", args.id))
      .collect();
    if (players.length > 0) {
      throw new Error("This team still has players. Move or delete them first.");
    }

    await ctx.db.delete(args.id);
  },
});
