import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

/**
 * The trust boundary that replaces Supabase RLS.
 *
 * Every query and mutation that touches club-scoped data calls this first.
 * It resolves the Clerk identity to a coach row; callers then filter their
 * queries by `coach.clubId`. Nothing trusts a clubId passed in as an
 * argument — it always comes from here.
 */
export async function requireCoach(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"coaches">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const coach = await ctx.db
    .query("coaches")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
    .unique();

  if (!coach) {
    // Authenticated with Clerk but no coach profile yet — the caller should
    // route to onboarding (create a club or accept an invite).
    throw new Error("NO_COACH_PROFILE");
  }

  return coach;
}

/** Like requireCoach but returns null instead of throwing when there's no
 *  profile yet, for the app shell deciding between /login and /onboarding. */
export async function getCoachOrNull(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"coaches"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return ctx.db
    .query("coaches")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
    .unique();
}

/**
 * Guards a mutation/query against a record from another club. Convex has no
 * RLS, so a get-by-id could return any club's row; this is what stops a
 * coach acting on data that isn't theirs.
 */
export function assertSameClub(
  coach: Doc<"coaches">,
  record: { clubId: Doc<"coaches">["clubId"] } | null,
): void {
  if (!record || record.clubId !== coach.clubId) {
    throw new Error("Not found");
  }
}
