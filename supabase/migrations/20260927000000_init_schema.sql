-- CoachAI — MVP schema
-- Multi-tenant model: club -> coaches (owner + members) -> teams -> players
-- Every tenant-scoped table carries club_id directly (denormalized) so RLS
-- policies never need a join. See the cahier des charges, Section 8, for the
-- entity list this migration implements.

-- ─────────────────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────────────────

create type coach_role as enum ('owner', 'member');
create type coach_language as enum ('fr', 'ar', 'en');
create type risk_tolerance as enum ('low', 'medium', 'high');
create type invite_status as enum ('pending', 'accepted', 'expired', 'revoked');

create type preferred_foot as enum ('left', 'right', 'both');
create type player_availability as enum ('available', 'injured', 'suspended', 'unavailable');

create type home_away as enum ('home', 'away');

create type match_event_type as enum (
  'goal', 'assist', 'substitution', 'yellow_card', 'red_card', 'injury', 'tactical_change'
);
create type match_event_side as enum ('us', 'them');

create type feedback_status as enum ('accepted', 'modified', 'rejected');

-- ─────────────────────────────────────────────────────────────────────────
-- Helper: updated_at trigger
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- clubs — tenant root
-- ─────────────────────────────────────────────────────────────────────────

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger clubs_set_updated_at
  before update on public.clubs
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- coaches — one row per auth user, always tied to exactly one club
-- ─────────────────────────────────────────────────────────────────────────

create table public.coaches (
  id uuid primary key references auth.users (id) on delete cascade,
  club_id uuid not null references public.clubs (id) on delete cascade,
  role coach_role not null default 'member',
  full_name text not null,
  preferred_language coach_language not null default 'fr',
  preferred_formation text,
  playing_style text,
  risk_tolerance risk_tolerance,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index coaches_club_id_idx on public.coaches (club_id);

create trigger coaches_set_updated_at
  before update on public.coaches
  for each row execute function public.set_updated_at();

-- Only one owner per club at a time (a club can still have zero owners
-- transiently during an ownership transfer, handled at the app layer).
create unique index coaches_one_owner_per_club_idx
  on public.coaches (club_id)
  where role = 'owner';

-- ─────────────────────────────────────────────────────────────────────────
-- club_invites — email invites for additional coaches on a club
-- ─────────────────────────────────────────────────────────────────────────

create table public.club_invites (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  email text not null,
  invited_by uuid not null references public.coaches (id) on delete cascade,
  token uuid not null default gen_random_uuid(),
  status invite_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create index club_invites_club_id_idx on public.club_invites (club_id);
create unique index club_invites_token_idx on public.club_invites (token);

-- Only one pending invite per email per club at a time.
create unique index club_invites_pending_unique_idx
  on public.club_invites (club_id, email)
  where status = 'pending';

-- ─────────────────────────────────────────────────────────────────────────
-- teams
-- ─────────────────────────────────────────────────────────────────────────

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  name text not null,
  age_category text,
  competition text,
  default_formation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index teams_club_id_idx on public.teams (club_id);

create trigger teams_set_updated_at
  before update on public.teams
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- players
-- ─────────────────────────────────────────────────────────────────────────

create table public.players (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  name text not null,
  date_of_birth date,
  position text,
  secondary_position text,
  preferred_foot preferred_foot,
  availability player_availability not null default 'available',
  technical_rating smallint check (technical_rating between 1 and 10),
  physical_rating smallint check (physical_rating between 1 and 10),
  tactical_rating smallint check (tactical_rating between 1 and 10),
  form_rating smallint check (form_rating between 1 and 10),
  coach_notes text,
  -- Drag-and-drop squad organization: a free-text group (e.g. "Starting XI",
  -- "Bench", or a custom label) plus a position within that group.
  squad_group text not null default 'Squad',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index players_club_id_idx on public.players (club_id);
create index players_team_id_idx on public.players (team_id);
create index players_team_group_order_idx on public.players (team_id, squad_group, sort_order);

create trigger players_set_updated_at
  before update on public.players
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- opponents
-- ─────────────────────────────────────────────────────────────────────────

create table public.opponents (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  team_name text not null,
  usual_formation text,
  alternative_formations text[] not null default '{}',
  playing_style text,
  pressing_style text,
  build_up_style text,
  defensive_style text,
  strengths text,
  weaknesses text,
  set_piece_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index opponents_club_id_idx on public.opponents (club_id);

create trigger opponents_set_updated_at
  before update on public.opponents
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- matches
-- ─────────────────────────────────────────────────────────────────────────

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  opponent_id uuid references public.opponents (id) on delete set null,
  match_date date not null,
  home_away home_away not null,
  competition text,
  our_formation text,
  opponent_formation text,
  score_for smallint,
  score_against smallint,
  possession_pct numeric(5, 2),
  shots smallint,
  shots_on_target smallint,
  corners smallint,
  fouls smallint,
  yellow_cards smallint,
  red_cards smallint,
  coach_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index matches_club_id_idx on public.matches (club_id);
create index matches_team_id_idx on public.matches (team_id);
create index matches_opponent_id_idx on public.matches (opponent_id);

create trigger matches_set_updated_at
  before update on public.matches
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- match_events
-- ─────────────────────────────────────────────────────────────────────────

create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  match_id uuid not null references public.matches (id) on delete cascade,
  minute smallint not null check (minute between 0 and 130),
  event_type match_event_type not null,
  side match_event_side not null,
  player_id uuid references public.players (id) on delete set null,
  description text,
  created_at timestamptz not null default now()
);

create index match_events_club_id_idx on public.match_events (club_id);
create index match_events_match_id_idx on public.match_events (match_id);

-- ─────────────────────────────────────────────────────────────────────────
-- ai_recommendations — every AI-generated output, for the feedback loop
-- ─────────────────────────────────────────────────────────────────────────

create table public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  coach_id uuid not null references public.coaches (id) on delete cascade,
  match_id uuid references public.matches (id) on delete set null,
  recommendation_type text not null,
  question text not null,
  language coach_language not null,
  recommendation jsonb not null,
  reasoning_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index ai_recommendations_club_id_idx on public.ai_recommendations (club_id);
create index ai_recommendations_coach_id_idx on public.ai_recommendations (coach_id);
create index ai_recommendations_match_id_idx on public.ai_recommendations (match_id);

-- ─────────────────────────────────────────────────────────────────────────
-- coach_feedback — accept / modify / reject on each recommendation
-- ─────────────────────────────────────────────────────────────────────────

create table public.coach_feedback (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  recommendation_id uuid not null references public.ai_recommendations (id) on delete cascade,
  coach_id uuid not null references public.coaches (id) on delete cascade,
  status feedback_status not null,
  comment text,
  outcome text,
  created_at timestamptz not null default now()
);

create unique index coach_feedback_one_per_recommendation_idx
  on public.coach_feedback (recommendation_id);
create index coach_feedback_club_id_idx on public.coach_feedback (club_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────

-- Resolves the calling user's club, once per policy check.
create or replace function public.current_club_id()
returns uuid
language sql
security definer
stable
as $$
  select club_id from public.coaches where id = auth.uid();
$$;

alter table public.clubs enable row level security;
alter table public.coaches enable row level security;
alter table public.club_invites enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.opponents enable row level security;
alter table public.matches enable row level security;
alter table public.match_events enable row level security;
alter table public.ai_recommendations enable row level security;
alter table public.coach_feedback enable row level security;

-- clubs: a coach can see and update only their own club.
create policy clubs_select on public.clubs
  for select using (id = public.current_club_id());
create policy clubs_update on public.clubs
  for update using (id = public.current_club_id())
  with check (id = public.current_club_id());

-- coaches: every coach in a club can see every other coach in that club;
-- a coach can only edit their own profile row.
create policy coaches_select on public.coaches
  for select using (club_id = public.current_club_id());
create policy coaches_update_self on public.coaches
  for update using (id = auth.uid())
  with check (id = auth.uid());

-- club_invites: visible and manageable by any coach in the club (MVP has
-- no permission tiers yet — see the cahier des charges, Section 12).
create policy club_invites_select on public.club_invites
  for select using (club_id = public.current_club_id());
create policy club_invites_insert on public.club_invites
  for insert with check (club_id = public.current_club_id());
create policy club_invites_update on public.club_invites
  for update using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());
create policy club_invites_delete on public.club_invites
  for delete using (club_id = public.current_club_id());

-- Every remaining tenant table follows the same club_id isolation pattern.
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'teams', 'players', 'opponents', 'matches',
    'match_events', 'ai_recommendations', 'coach_feedback'
  ]
  loop
    execute format(
      'create policy %I_select on public.%I for select using (club_id = public.current_club_id());',
      tbl, tbl
    );
    execute format(
      'create policy %I_insert on public.%I for insert with check (club_id = public.current_club_id());',
      tbl, tbl
    );
    execute format(
      'create policy %I_update on public.%I for update using (club_id = public.current_club_id()) with check (club_id = public.current_club_id());',
      tbl, tbl
    );
    execute format(
      'create policy %I_delete on public.%I for delete using (club_id = public.current_club_id());',
      tbl, tbl
    );
  end loop;
end;
$$;

-- Note: creating the first coach (+ their club) and accepting a club_invite
-- (+ creating the invited coach's row) are handled at the application layer,
-- not by a database trigger on auth.users — the signup flow needs to ask
-- "create a new club" vs. "join via invite token" before a coaches row can
-- be written, which is a decision the app makes, not the database.
