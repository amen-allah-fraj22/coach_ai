// Hand-written types for the tables the web app touches directly.
// These mirror supabase/migrations/20260927000000_init_schema.sql; once a
// real Supabase project exists, `supabase gen types typescript` can replace
// this file with a fully generated one without changing call sites.

export type CoachRole = "owner" | "member";
export type CoachLanguage = "fr" | "ar" | "en";
export type RiskTolerance = "low" | "medium" | "high";
export type InviteStatus = "pending" | "accepted" | "expired" | "revoked";

export type PreferredFoot = "left" | "right" | "both";
export type PlayerAvailability =
  | "available"
  | "injured"
  | "suspended"
  | "unavailable";

export type HomeAway = "home" | "away";

export type MatchEventType =
  | "goal"
  | "assist"
  | "substitution"
  | "yellow_card"
  | "red_card"
  | "injury"
  | "tactical_change";
export type MatchEventSide = "us" | "them";

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

export interface Player {
  id: string;
  club_id: string;
  team_id: string;
  name: string;
  date_of_birth: string | null;
  position: string | null;
  secondary_position: string | null;
  preferred_foot: PreferredFoot | null;
  availability: PlayerAvailability;
  technical_rating: number | null;
  physical_rating: number | null;
  tactical_rating: number | null;
  form_rating: number | null;
  coach_notes: string | null;
  squad_group: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Opponent {
  id: string;
  club_id: string;
  team_name: string;
  usual_formation: string | null;
  alternative_formations: string[];
  playing_style: string | null;
  pressing_style: string | null;
  build_up_style: string | null;
  defensive_style: string | null;
  strengths: string | null;
  weaknesses: string | null;
  set_piece_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  club_id: string;
  team_id: string;
  opponent_id: string | null;
  match_date: string;
  home_away: HomeAway;
  competition: string | null;
  our_formation: string | null;
  opponent_formation: string | null;
  score_for: number | null;
  score_against: number | null;
  possession_pct: number | null;
  shots: number | null;
  shots_on_target: number | null;
  corners: number | null;
  fouls: number | null;
  yellow_cards: number | null;
  red_cards: number | null;
  coach_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchEvent {
  id: string;
  club_id: string;
  match_id: string;
  minute: number;
  event_type: MatchEventType;
  side: MatchEventSide;
  player_id: string | null;
  description: string | null;
  created_at: string;
}
