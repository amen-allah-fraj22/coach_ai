"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentCoach } from "@/lib/auth/session";

export type InviteState = {
  error: string | null;
  inviteUrl?: string | null;
};

export async function createInvite(
  _prevState: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const locale = String(formData.get("locale") ?? "fr");
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Email is required." };
  }

  const current = await getCurrentCoach();
  if (!current) {
    return { error: "Not authenticated." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("club_invites")
    .insert({
      club_id: current.club.id,
      email,
      invited_by: current.coach.id,
    })
    .select("token")
    .single();

  if (error) {
    return { error: error.message };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const inviteUrl = `${siteUrl}/${locale}/invite/${data.token}`;

  return { error: null, inviteUrl };
}
