"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentCoach } from "@/lib/auth/session";

export type PlayerActionState = { error: string | null };

function optionalText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim() || null;
}

function optionalRating(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function readPlayerFields(formData: FormData) {
  return {
    team_id: String(formData.get("teamId") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    date_of_birth: optionalText(formData, "dateOfBirth"),
    position: optionalText(formData, "position"),
    secondary_position: optionalText(formData, "secondaryPosition"),
    preferred_foot: optionalText(formData, "preferredFoot"),
    availability: String(formData.get("availability") ?? "available"),
    technical_rating: optionalRating(formData, "technicalRating"),
    physical_rating: optionalRating(formData, "physicalRating"),
    tactical_rating: optionalRating(formData, "tacticalRating"),
    form_rating: optionalRating(formData, "formRating"),
    coach_notes: optionalText(formData, "coachNotes"),
    squad_group: String(formData.get("squadGroup") ?? "").trim() || "Squad",
  };
}

export async function createPlayer(
  _prevState: PlayerActionState,
  formData: FormData,
): Promise<PlayerActionState> {
  const locale = String(formData.get("locale") ?? "fr");
  const fields = readPlayerFields(formData);

  if (!fields.name || !fields.team_id) {
    return { error: "Player name and team are required." };
  }

  const current = await getCurrentCoach();
  if (!current) {
    return { error: "Not authenticated." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("players")
    .insert({ ...fields, club_id: current.club.id });

  if (error) {
    return { error: error.message };
  }

  redirect(`/${locale}/players`);
}

export async function updatePlayer(
  playerId: string,
  _prevState: PlayerActionState,
  formData: FormData,
): Promise<PlayerActionState> {
  const locale = String(formData.get("locale") ?? "fr");
  const fields = readPlayerFields(formData);

  if (!fields.name || !fields.team_id) {
    return { error: "Player name and team are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("players")
    .update(fields)
    .eq("id", playerId);

  if (error) {
    return { error: error.message };
  }

  redirect(`/${locale}/players`);
}
