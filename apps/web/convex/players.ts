import { v } from "convex/values";

import { mutation, query } from "./_generated/server.js";
import { assertSameClub, requireCoach } from "./lib/auth.js";

const fields = {
  teamId: v.id("teams"),
  name: v.string(),
  jerseyNumber: v.optional(v.number()),
  dateOfBirth: v.optional(v.string()),
  position: v.optional(v.string()),
  secondaryPosition: v.optional(v.string()),
  preferredFoot: v.optional(
    v.union(v.literal("left"), v.literal("right"), v.literal("both")),
  ),
  availability: v.union(
    v.literal("available"),
    v.literal("injured"),
    v.literal("suspended"),
    v.literal("unavailable"),
  ),
  technicalRating: v.optional(v.number()),
  physicalRating: v.optional(v.number()),
  tacticalRating: v.optional(v.number()),
  formRating: v.optional(v.number()),
  coachNotes: v.optional(v.string()),
  squadGroup: v.string(),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const coach = await requireCoach(ctx);
    return ctx.db
      .query("players")
      .withIndex("by_club", (q) => q.eq("clubId", coach.clubId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("players") },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    const player = await ctx.db.get(args.id);
    assertSameClub(coach, player);
    return player;
  },
});

export const create = mutation({
  args: fields,
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    // New players land at the end of their squad group.
    const inGroup = await ctx.db
      .query("players")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
    const maxOrder = inGroup
      .filter((p) => p.squadGroup === args.squadGroup)
      .reduce((max, p) => Math.max(max, p.sortOrder), -1);

    return ctx.db.insert("players", {
      ...args,
      clubId: coach.clubId,
      sortOrder: maxOrder + 1,
    });
  },
});

export const update = mutation({
  args: { id: v.id("players"), ...fields },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    const { id, ...patch } = args;
    assertSameClub(coach, await ctx.db.get(id));
    await ctx.db.patch(id, patch);
  },
});

/**
 * Persists a drag-and-drop reorder: moves a player to a group at a position,
 * renumbering that group. The Phase 4 board calls this on drop.
 */
export const reorder = mutation({
  args: {
    id: v.id("players"),
    squadGroup: v.string(),
    orderedIds: v.array(v.id("players")),
  },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    const moved = await ctx.db.get(args.id);
    assertSameClub(coach, moved);

    await ctx.db.patch(args.id, { squadGroup: args.squadGroup });

    // Renumber the destination group in the given order, guarding each row.
    let order = 0;
    for (const pid of args.orderedIds) {
      const p = await ctx.db.get(pid);
      if (p && p.clubId === coach.clubId) {
        await ctx.db.patch(pid, { sortOrder: order });
        order += 1;
      }
    }
  },
});
