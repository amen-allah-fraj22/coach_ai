import { v } from "convex/values";

import { mutation } from "./_generated/server.js";

const coachLanguage = v.union(
  v.literal("fr"),
  v.literal("ar"),
  v.literal("en"),
);

/**
 * Creates a club and its owner coach for the signed-in Clerk user. This is
 * the bootstrap path: the caller is authenticated with Clerk but has no
 * coach row yet, so it can't use requireCoach. It instead reads the Clerk
 * identity directly and refuses if a coach already exists for it.
 */
export const createClubAndOwner = mutation({
  args: {
    clubName: v.string(),
    fullName: v.string(),
    language: coachLanguage,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("coaches")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();
    if (existing) {
      throw new Error("This account is already linked to a club");
    }

    const clubId = await ctx.db.insert("clubs", { name: args.clubName });
    await ctx.db.insert("coaches", {
      tokenIdentifier: identity.subject,
      clubId,
      role: "owner",
      fullName: args.fullName,
      preferredLanguage: args.language,
    });

    return { clubId };
  },
});
