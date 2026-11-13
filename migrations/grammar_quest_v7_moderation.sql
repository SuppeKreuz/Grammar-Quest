-- Grammar Quest 7: central name moderation for all direct and admin score uploads.
-- No existing scores are removed. Adult moderation happens through the Edge Function.
create table if not exists public.grammar_blocked_names (
  normalized_name text primary key check (char_length(normalized_name) between 2 and 50),
  display_name text not null check (char_length(display_name) between 2 and 50),
  reason text not null default 'Inappropriate name',
  blocked_at timestamptz not null default now()
);
alter table public.grammar_blocked_names enable row level security;
revoke all on public.grammar_blocked_names from public, anon, authenticated;
grant select, insert, delete, update on public.grammar_blocked_names to service_role;

-- This readonly normalizer is shared by public validation and backend moderation.
create or replace function public.grammar_name_key(input_name text)
returns text language sql immutable
set search_path = ''
as $fn$
 select pg_catalog.regexp_replace(
   pg_catalog.translate(pg_catalog.lower(coalesce(input_name,'')),
     '013457@$!äöüß', 'oieastasiaous'),
   '[^a-z0-9]', '', 'g');
$fn$;

-- Readonly SECURITY DEFINER is intentional: it can check private banned names,
-- but returns only true/false and does not reveal the denylist or change any data.
create or replace function public.grammar_name_allowed(input_name text)
returns boolean language plpgsql stable security definer
set search_path = ''
as $fn$
declare clean text;
begin
 if input_name is null or char_length(pg_catalog.btrim(input_name)) not between 2 and 20
    or input_name !~ '^[[:alnum:]_ -]+$' then return false; end if;
 clean := public.grammar_name_key(input_name);
 if char_length(clean) < 2 then return false; end if;
 if clean ~ '(hurensohn|arschloch|wichser|fotze|scheise|scheisse|fucker|fuck|fuk|shit|bitch|cunt|nigger|nigga|heilhitler|hitler|nazi|hakenkreuz|kike|retard|spasti|verpiss|wanker|motherfucker|drecksau|schlampe|hure)' then
   return false;
 end if;
 if clean in ('idiot','idioten','depp','dummkopf','loser','asshole') then return false; end if;
 if exists (select 1 from public.grammar_blocked_names where normalized_name = clean) then return false; end if;
 return true;
end;
$fn$;
revoke all on function public.grammar_name_allowed(text) from public;
grant execute on function public.grammar_name_allowed(text) to anon, authenticated, service_role;

-- Database trigger means users cannot bypass moderation by calling PostgREST directly.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create or replace function private.grammar_enforce_score_name()
returns trigger language plpgsql security definer
set search_path = ''
as $fn$
begin
 if not public.grammar_name_allowed(new.player_name) then
   raise exception using errcode='23514', message='Player name not allowed.';
 end if;
 return new;
end;
$fn$;
revoke all on function private.grammar_enforce_score_name() from public, anon, authenticated;
drop trigger if exists grammar_score_name_guard on public.grammar_scores;
create trigger grammar_score_name_guard
 before insert or update of player_name on public.grammar_scores
 for each row execute function private.grammar_enforce_score_name();

-- Admin-only audit log, no public access or deletion controls.
create table if not exists public.grammar_moderation_log (
  id bigint generated always as identity primary key,
  target_name text not null,
  action text not null check(action in ('delete','block','unblock')),
  removed_count integer not null default 0,
  performed_at timestamptz not null default now()
);
alter table public.grammar_moderation_log enable row level security;
revoke all on public.grammar_moderation_log from public, anon, authenticated;
grant select, insert on public.grammar_moderation_log to service_role;
grant usage on sequence public.grammar_moderation_log_id_seq to service_role;
