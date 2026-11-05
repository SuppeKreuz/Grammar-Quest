-- GRAMMAR QUEST - shared leaderboard (classroom demo)
-- New Supabase project: run this once in Supabase SQL Editor.
-- Existing projects: use the server-only admin migration instead.
-- Regular scores have normal progression checks; admin scores use an Edge Function.
-- Warning: the demo Admin password is present in public HTML source, so it is not
-- a strong authentication solution. Use nicknames, not real names.

create table if not exists public.grammar_scores (
  id bigint generated always as identity primary key,
  player_name text not null check (char_length(trim(player_name)) between 2 and 20),
  grade smallint not null check (grade in (8,9,10)),
  score integer not null,
  levels_completed smallint not null check (levels_completed between 0 and 20),
  best_streak smallint not null check (best_streak between 0 and 20),
  played_at timestamptz not null default now(),
  assisted boolean not null default false,
  is_admin boolean not null default false,
  constraint grammar_scores_score_check check (
    score % 100 = 0 and
    ((not is_admin and score between 100 and 2000)
      or (is_admin and score between 100 and 100000000))
  ),
  constraint valid_score_for_progress check (is_admin or score = levels_completed * 100)
);

create index if not exists grammar_scores_grade_score_idx
  on public.grammar_scores(grade, score desc, played_at asc);

alter table public.grammar_scores enable row level security;

-- Anonymous players can READ and submit only regular scores; they cannot
-- edit/delete rows or submit arbitrary admin scores via the normal REST API.
revoke all privileges on table public.grammar_scores from anon, authenticated;
grant select, insert on table public.grammar_scores to anon, authenticated;
grant usage on sequence public.grammar_scores_id_seq to anon, authenticated;
-- The server-side Edge Function uses the Supabase service role to insert admin scores.
grant select, insert on table public.grammar_scores to service_role;
grant usage on sequence public.grammar_scores_id_seq to service_role;

drop policy if exists "Grammar Quest leaderboard read" on public.grammar_scores;
create policy "Grammar Quest leaderboard read"
  on public.grammar_scores for select to anon, authenticated using (true);

drop policy if exists "Grammar Quest leaderboard submit" on public.grammar_scores;
create policy "Grammar Quest leaderboard submit"
  on public.grammar_scores for insert to anon, authenticated
  with check (
    is_admin = false
    and char_length(trim(player_name)) between 2 and 20
    and player_name !~ '[[:cntrl:]]'
    and score between 100 and 2000
    and score = levels_completed * 100
    and best_streak <= levels_completed
  );
