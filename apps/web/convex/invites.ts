import { v } from "convex/values";

import { mutation, query } from "./_generated/server.js";
import { requireCoach } from "./lib/auth.js";

const coachLanguage = v.union(
  v.literal("fr"),
  v.literal("ar"),
  v.literal("en"),
);

const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/** Owner/member creates an invite for their own club. */
export const createInvite = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);

    // One pending invite per email per club.
    const existing = await ctx.db
      .query("clubInvites")
      .withIndex("by_club", (q) => q.eq("clubId", coach.clubId))
      .filter((q) =>
        q.and(
          q.eq(q.field("email"), args.email),
          q.eq(q.field("status"), "pending"),
        ),
      )
      .first();
    if (existing) {
      return { token: existing.token };
    }

    const token = crypto.randomUUID();
    await ctx.db.insert("clubInvites", {
      clubId: coach.clubId,
      email: args.email,
      invitedBy: coach._id,
      token,
      status: "pending",
      expiresAt: Date.now() + INVITE_TTL_MS,
    });

    return { token };
  },
});

/**
 * Preview an invite by token. Readable by any authenticated user (an invited
 * person who has signed in but has no coach profile yet); the token is the
 * secret, so nothing is exposed without holding it.
 */
export const getInviteInfo = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("clubInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!invite) return null;

    const club = await ctx.db.get(invite.clubId);
    if (!club) return null;

    const valid = invite.status === "pending" && invite.expiresAt > Date.now();
    return {
      clubName: club.name,
      email: invite.email,
      status: invite.status,
      valid,
    };
  },
});

/**
 * The signed-in Clerk user accepts an invite and joins the club as a member.
 * Bootstrap path (no coach row yet), so it reads the Clerk identity directly.
 */
export const acceptInvite = mutation({
  args: {
    token: v.string(),
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

    const invite = await ctx.db
      .query("clubInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!invite || invite.status !== "pending" || invite.expiresAt < Date.now()) {
      throw new Error("This invite is invalid or has expired");
    }

    await ctx.db.insert("coaches", {
      tokenIdentifier: identity.subject,
      clubId: invite.clubId,
      role: "member",
      fullName: args.fullName,
      preferredLanguage: args.language,
    });
    await ctx.db.patch(invite._id, { status: "accepted" });

    return { clubId: invite.clubId };
  },
});
