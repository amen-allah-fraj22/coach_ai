"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentCoach } from "@/lib/auth/session";

export type OpponentActionState = { error: string | null };

function optionalText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim() || null;
}

function readOpponentFields(formData: FormData) {
  return {
    team_name: String(formData.get("teamName") ?? "").trim(),
    usual_formation: optionalText(formData, "usualFormation"),
    playing_style: optionalText(formData, "playingStyle"),
    pressing_style: optionalText(formData, "pressingStyle"),
    build_up_style: optionalText(formData, "buildUpStyle"),
    defensive_style: optionalText(formData, "defensiveStyle"),
    strengths: optionalText(formData, "strengths"),
    weaknesses: optionalText(formData, "weaknesses"),
    set_piece_notes: optionalText(formData, "setPieceNotes"),
  };
}

export async function createOpponent(
  _prevState: OpponentActionState,
  formData: FormData,
): Promise<OpponentActionState> {
  const locale = String(formData.get("locale") ?? "fr");
  const fields = readOpponentFields(formData);

  if (!fields.team_name) {
    return { error: "Opponent name is required." };
  }

  const current = await getCurrentCoach();
  if (!current) {
    return { error: "Not authenticated." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("opponents")
    .insert({ ...fields, club_id: current.club.id });

  if (error) {
    return { error: error.message };
  }

  redirect(`/${locale}/opponents`);
}

export async function updateOpponent(
  opponentId: string,
  _prevState: OpponentActionState,
  formData: FormData,
): Promise<OpponentActionState> {
  const locale = String(formData.get("locale") ?? "fr");
  const fields = readOpponentFields(formData);

  if (!fields.team_name) {
    return { error: "Opponent name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("opponents")
    .update(fields)
    .eq("id", opponentId);

  if (error) {
    return { error: error.message };
  }

  redirect(`/${locale}/opponents`);
}
