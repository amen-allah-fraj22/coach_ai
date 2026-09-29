import { query } from "./_generated/server";
import { getCoachOrNull } from "./lib/auth.js";

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
