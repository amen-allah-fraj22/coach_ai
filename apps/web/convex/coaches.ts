import { v } from "convex/values";

import { mutation, query } from "./_generated/server.js";
import { getCoachOrNull, requireCoach } from "./lib/auth.js";

/**
 * The signed-in coach and their club, or null when there's no session or no
 * coach profile yet. The app shell uses this to route: null + no session ->
 * login; authenticated but null -> onboarding.
 */
export const getCurrentCoach = query({
  args: {},
  handler: async (ctx) => {
    const coach = await getCoachOrNull(ctx);
    if (!coach) return null;

    const club = await ctx.db.get(coach.clubId);
    if (!club) return null;

    return { coach, club };
  },
});

/** Every coach in the caller's club (the settings roster). */
export const listClubCoaches = query({
  args: {},
  handler: async (ctx) => {
    const coach = await requireCoach(ctx);
    return ctx.db
      .query("coaches")
      .withIndex("by_club", (q) => q.eq("clubId", coach.clubId))
      .collect();
  },
});

/** Records the coach's philosophy during onboarding. */
export const updatePhilosophy = mutation({
  args: {
    preferredFormation: v.optional(v.string()),
    playingStyle: v.optional(v.string()),
    riskTolerance: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
  },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    await ctx.db.patch(coach._id, {
      preferredFormation: args.preferredFormation,
      playingStyle: args.playingStyle,
      riskTolerance: args.riskTolerance,
    });
  },
});
