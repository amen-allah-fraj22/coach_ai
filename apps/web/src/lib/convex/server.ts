import "server-only";

import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import type { FunctionReference } from "convex/server";

import { api } from "@convex/_generated/api";

async function convexToken() {
  const { getToken } = await auth();
  return getToken({ template: "convex" });
}

/**
 * Runs a Convex query server-side with the Clerk-issued Convex JWT so the
 * query's requireCoach() sees the caller. Returns null when unauthenticated.
 */
export async function fetchAuthed<Query extends FunctionReference<"query">>(
  query: Query,
  args: Query["_args"],
): Promise<Query["_returnType"] | null> {
  const token = await convexToken();
  if (!token) return null;
  return fetchQuery(query, args, { token });
}

/** The signed-in coach + club, or null (no session / no profile). */
export async function getServerCoach() {
  return fetchAuthed(api.coaches.getCurrentCoach, {});
}
