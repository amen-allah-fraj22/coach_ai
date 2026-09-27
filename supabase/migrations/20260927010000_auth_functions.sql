-- Signup / invite-acceptance can't happen through ordinary RLS-guarded
-- inserts: creating a club and its first coach (or accepting an invite into
-- an existing club) needs to bypass the club_id = current_club_id() check,
-- since the calling user has no club yet. These security-definer functions
-- are the one deliberate bypass, called via RPC from the app.

create or replace function public.create_club_and_owner(
  club_name text,
  coach_full_name text,
  coach_language coach_language default 'fr'
)
returns table (club_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_club_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.coaches where id = auth.uid()) then
    raise exception 'This account is already linked to a club';
  end if;

  insert into public.clubs (name) values (club_name) returning id into new_club_id;

  insert into public.coaches (id, club_id, role, full_name, preferred_language)
  values (auth.uid(), new_club_id, 'owner', coach_full_name, coach_language);

  return query select new_club_id;
end;
$$;

revoke all on function public.create_club_and_owner(text, text, coach_language) from public;
grant execute on function public.create_club_and_owner(text, text, coach_language) to authenticated;

create or replace function public.accept_club_invite(
  invite_token uuid,
  coach_full_name text,
  coach_language coach_language default 'fr'
)
returns table (club_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  invite record;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.coaches where id = auth.uid()) then
    raise exception 'This account is already linked to a club';
  end if;

  select * into invite
  from public.club_invites
  where token = invite_token
    and status = 'pending'
    and expires_at > now()
  for update;

  if not found then
    raise exception 'This invite is invalid or has expired';
  end if;

  insert into public.coaches (id, club_id, role, full_name, preferred_language)
  values (auth.uid(), invite.club_id, 'member', coach_full_name, coach_language);

  update public.club_invites set status = 'accepted' where id = invite.id;

  return query select invite.club_id;
end;
$$;

revoke all on function public.accept_club_invite(uuid, text, coach_language) from public;
grant execute on function public.accept_club_invite(uuid, text, coach_language) to authenticated;

-- A person opening an invite link isn't a club member yet (may not even be
-- signed up), so the normal club_invites RLS policy can't let them read it.
-- This returns just enough to render "You've been invited to join <club>"
-- without exposing the rest of the table.
create or replace function public.get_invite_info(invite_token uuid)
returns table (club_name text, email text, status invite_status)
language sql
security definer
set search_path = public
stable
as $$
  select c.name, i.email, i.status
  from public.club_invites i
  join public.clubs c on c.id = i.club_id
  where i.token = invite_token;
$$;

revoke all on function public.get_invite_info(uuid) from public;
grant execute on function public.get_invite_info(uuid) to anon, authenticated;
