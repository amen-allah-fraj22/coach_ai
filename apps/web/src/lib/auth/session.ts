import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Club, Coach } from "@/lib/types/database";

export interface CurrentCoach {
  coach: Coach;
  club: Club;
}

/**
 * Loads the signed-in user's coach profile and club, if both the session
 * and the coaches row exist. Returns null rather than throwing so callers
 * (layouts, pages) can decide whether that means "go to /login" or
 * "go to /onboarding" (session exists, no coaches row yet).
 */
export async function getCurrentCoach(): Promise<CurrentCoach | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: coach } = await supabase
    .from("coaches")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!coach) return null;

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", coach.club_id)
    .maybeSingle();

  if (!club) return null;

  return { coach, club };
}

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
