"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentCoach } from "@/lib/auth/session";

export type MatchActionState = { error: string | null };

function optionalText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim() || null;
}

function optionalNumber(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function readMatchFields(formData: FormData) {
  return {
    team_id: String(formData.get("teamId") ?? ""),
    opponent_id: String(formData.get("opponentId") ?? "") || null,
    match_date: String(formData.get("matchDate") ?? ""),
    home_away: String(formData.get("homeAway") ?? "home"),
    competition: optionalText(formData, "competition"),
    our_formation: optionalText(formData, "ourFormation"),
    opponent_formation: optionalText(formData, "opponentFormation"),
    score_for: optionalNumber(formData, "scoreFor"),
    score_against: optionalNumber(formData, "scoreAgainst"),
    possession_pct: optionalNumber(formData, "possessionPct"),
    shots: optionalNumber(formData, "shots"),
    shots_on_target: optionalNumber(formData, "shotsOnTarget"),
    corners: optionalNumber(formData, "corners"),
    fouls: optionalNumber(formData, "fouls"),
    yellow_cards: optionalNumber(formData, "yellowCards"),
    red_cards: optionalNumber(formData, "redCards"),
    coach_notes: optionalText(formData, "coachNotes"),
  };
}

export async function createMatch(
  _prevState: MatchActionState,
  formData: FormData,
): Promise<MatchActionState> {
  const locale = String(formData.get("locale") ?? "fr");
  const fields = readMatchFields(formData);

  if (!fields.team_id || !fields.match_date) {
    return { error: "Team and match date are required." };
  }

  const current = await getCurrentCoach();
  if (!current) {
    return { error: "Not authenticated." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("matches")
    .insert({ ...fields, club_id: current.club.id });

  if (error) {
    return { error: error.message };
  }

  redirect(`/${locale}/matches`);
}

export async function updateMatch(
  matchId: string,
  _prevState: MatchActionState,
  formData: FormData,
): Promise<MatchActionState> {
  const locale = String(formData.get("locale") ?? "fr");
  const fields = readMatchFields(formData);

  if (!fields.team_id || !fields.match_date) {
    return { error: "Team and match date are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("matches").update(fields).eq("id", matchId);

  if (error) {
    return { error: error.message };
  }

  redirect(`/${locale}/matches`);
}

export type MatchEventActionState = { error: string | null };

export async function createMatchEvent(
  matchId: string,
  _prevState: MatchEventActionState,
  formData: FormData,
): Promise<MatchEventActionState> {
  const locale = String(formData.get("locale") ?? "fr");
  const minute = Number(String(formData.get("minute") ?? ""));

  if (!Number.isFinite(minute) || minute < 0 || minute > 130) {
    return { error: "Minute must be between 0 and 130." };
  }

  const current = await getCurrentCoach();
  if (!current) {
    return { error: "Not authenticated." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("match_events").insert({
    club_id: current.club.id,
    match_id: matchId,
    minute,
    event_type: String(formData.get("eventType") ?? "goal"),
    side: String(formData.get("side") ?? "us"),
    player_id: String(formData.get("playerId") ?? "") || null,
    description: optionalText(formData, "description"),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/${locale}/matches/${matchId}`);
  return { error: null };
}

export async function deleteMatchEvent(formData: FormData) {
  const locale = String(formData.get("locale") ?? "fr");
  const eventId = String(formData.get("eventId") ?? "");
  const matchId = String(formData.get("matchId") ?? "");

  const supabase = await createClient();
  await supabase.from("match_events").delete().eq("id", eventId);

  revalidatePath(`/${locale}/matches/${matchId}`);
}
