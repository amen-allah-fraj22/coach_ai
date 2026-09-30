import "server-only";

import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";

import { api } from "@convex/_generated/api";

/**
 * Reads the signed-in coach + club server-side, passing the Clerk-issued
 * Convex JWT so Convex can authenticate the request. Returns null when there
 * is no session or no coach profile yet (the caller decides: login vs
 * onboarding).
 */
export async function getServerCoach() {
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
  if (!token) return null;

  return fetchQuery(api.coaches.getCurrentCoach, {}, { token });
}
