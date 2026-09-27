"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null; message?: string | null };

function localePath(locale: string, path: string) {
  return `/${locale}${path}`;
}

export async function login(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = String(formData.get("locale") ?? "fr");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect(localePath(locale, "/dashboard"));
}

export async function signUpAndCreateClub(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = String(formData.get("locale") ?? "fr");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const clubName = String(formData.get("clubName") ?? "").trim();

  if (!email || !password || !fullName || !clubName) {
    return { error: "All fields are required." };
  }

  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  if (!signUpData.session) {
    return {
      error: null,
      message:
        "Check your email to confirm your account, then log in to finish creating your club.",
    };
  }

  const { error: rpcError } = await supabase.rpc("create_club_and_owner", {
    club_name: clubName,
    coach_full_name: fullName,
    coach_language: locale,
  });

  if (rpcError) {
    return { error: rpcError.message };
  }

  redirect(localePath(locale, "/onboarding"));
}

export async function acceptInvite(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = String(formData.get("locale") ?? "fr");
  const token = String(formData.get("token") ?? "");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!token || !email || !password || !fullName) {
    return { error: "All fields are required." };
  }

  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  if (!signUpData.session) {
    return {
      error: null,
      message:
        "Check your email to confirm your account, then open this invite link again to join.",
    };
  }

  const { error: rpcError } = await supabase.rpc("accept_club_invite", {
    invite_token: token,
    coach_full_name: fullName,
    coach_language: locale,
  });

  if (rpcError) {
    return { error: rpcError.message };
  }

  redirect(localePath(locale, "/onboarding"));
}

export async function logout(formData: FormData) {
  const locale = String(formData.get("locale") ?? "fr");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(localePath(locale, "/login"));
}

export async function updatePhilosophy(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = String(formData.get("locale") ?? "fr");
  const preferredFormation =
    String(formData.get("preferredFormation") ?? "").trim() || null;
  const playingStyle = String(formData.get("playingStyle") ?? "").trim() || null;
  const riskTolerance = String(formData.get("riskTolerance") ?? "") || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const { error } = await supabase
    .from("coaches")
    .update({
      preferred_formation: preferredFormation,
      playing_style: playingStyle,
      risk_tolerance: riskTolerance,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  redirect(localePath(locale, "/dashboard"));
}
