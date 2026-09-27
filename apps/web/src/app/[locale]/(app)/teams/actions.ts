"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentCoach } from "@/lib/auth/session";

export type TeamActionState = { error: string | null };

function readTeamFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    age_category: String(formData.get("ageCategory") ?? "").trim() || null,
    competition: String(formData.get("competition") ?? "").trim() || null,
    default_formation:
      String(formData.get("defaultFormation") ?? "").trim() || null,
  };
}

export async function createTeam(
  _prevState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const locale = String(formData.get("locale") ?? "fr");
  const fields = readTeamFields(formData);

  if (!fields.name) {
    return { error: "Team name is required." };
  }

  const current = await getCurrentCoach();
  if (!current) {
    return { error: "Not authenticated." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("teams")
    .insert({ ...fields, club_id: current.club.id });

  if (error) {
    return { error: error.message };
  }

  redirect(`/${locale}/teams`);
}

export async function updateTeam(
  teamId: string,
  _prevState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const locale = String(formData.get("locale") ?? "fr");
  const fields = readTeamFields(formData);

  if (!fields.name) {
    return { error: "Team name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("teams").update(fields).eq("id", teamId);

  if (error) {
    return { error: error.message };
  }

  redirect(`/${locale}/teams`);
}
