// Hand-written types for the tables the web app touches directly.
// These mirror supabase/migrations/20260927000000_init_schema.sql; once a
// real Supabase project exists, `supabase gen types typescript` can replace
// this file with a fully generated one without changing call sites.

export type CoachRole = "owner" | "member";
export type CoachLanguage = "fr" | "ar" | "en";
export type RiskTolerance = "low" | "medium" | "high";
export type InviteStatus = "pending" | "accepted" | "expired" | "revoked";

export interface Club {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Coach {
  id: string;
  club_id: string;
  role: CoachRole;
  full_name: string;
  preferred_language: CoachLanguage;
  preferred_formation: string | null;
  playing_style: string | null;
  risk_tolerance: RiskTolerance | null;
  created_at: string;
  updated_at: string;
}

export interface ClubInvite {
  id: string;
  club_id: string;
  email: string;
  invited_by: string;
  token: string;
  status: InviteStatus;
  expires_at: string;
  created_at: string;
}

export interface Team {
  id: string;
  club_id: string;
  name: string;
  age_category: string | null;
  competition: string | null;
  default_formation: string | null;
  created_at: string;
  updated_at: string;
}
