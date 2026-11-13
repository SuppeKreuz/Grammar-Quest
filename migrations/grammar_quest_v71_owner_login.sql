-- Grammar Quest 7.1: protect the owner's nickname and verification.
-- Password hash is provisioned privately, never committed to this repository.
-- pgcrypto is already enabled in Supabase's 'extensions' schema.
create table if not exists public.grammar_owner_credentials (
  nickname text primary key check (nickname = 'fabian'),
  password_hash text not null check (password_hash ~ '^\$2[abxy]\$[0-9]{2}\$'),
  updated_at timestamptz not null default now()
);
alter table public.grammar_owner_credentials enable row level security;
revoke all on public.grammar_owner_credentials from public, anon, authenticated;
grant select, insert, update on public.grammar_owner_credentials to service_role;

-- Rate-limit wrong attempts, per hashed origin (never persist plain IP addresses).
create table if not exists public.grammar_owner_login_attempts (
  client_hash text primary key check (client_hash ~ '^[a-f0-9]{64}$'),
  failures integer not null default 0 check (failures between 0 and 9999),
  window_started timestamptz not null default now()
);
alter table public.grammar_owner_login_attempts enable row level security;
revoke all on public.grammar_owner_login_attempts from public, anon, authenticated;
grant select, insert, update, delete on public.grammar_owner_login_attempts to service_role;

-- Runs with the caller's privileges: the Data API only exposes it to service_role.
create or replace function public.grammar_verify_owner_password(
  p_password text,
  p_client_hash text
) returns boolean
language plpgsql volatile security invoker
set search_path = ''
as $$
declare
  saved_hash text;
  attempts integer;
  started timestamptz;
  password_matches boolean;
begin
  if p_password is null or char_length(p_password) not between 8 and 128
     or p_client_hash is null or p_client_hash !~ '^[a-f0-9]{64}$' then
    return false;
  end if;
  select failures, window_started into attempts, started
    from public.grammar_owner_login_attempts where client_hash = p_client_hash;
  if coalesce(attempts,0) >= 8 and started > now() - interval '15 minutes' then
    return false;
  end if;
  select password_hash into saved_hash from public.grammar_owner_credentials
    where nickname = 'fabian';
  if saved_hash is null then return false; end if;
  password_matches := extensions.crypt(p_password, saved_hash) = saved_hash;
  if password_matches then
    delete from public.grammar_owner_login_attempts where client_hash = p_client_hash;
    return true;
  end if;
  insert into public.grammar_owner_login_attempts as attempt (client_hash, failures, window_started)
    values (p_client_hash, 1, now())
  on conflict (client_hash) do update
    set failures = case when attempt.window_started < now()-interval '15 minutes'
      then 1 else least(attempt.failures+1,9999) end,
        window_started = case when attempt.window_started < now()-interval '15 minutes'
      then now() else attempt.window_started end;
  return false;
end;
$$;
revoke all on function public.grammar_verify_owner_password(text,text) from public, anon, authenticated;
grant execute on function public.grammar_verify_owner_password(text,text) to service_role;

-- All anon direct score inserts still need the existing permissive INSERT policy,
-- but this restrictive policy specifically protects the owner's nickname.
create policy "Owner nickname scores require server verification"
  on public.grammar_scores as restrictive
  for insert to anon, authenticated
  with check (public.grammar_name_key(player_name) <> 'fabian');
