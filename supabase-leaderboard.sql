-- GRAMMAR QUEST - shared leaderboard (classroom demo)
-- Run once in Supabase > SQL Editor > New query > Run.
-- Use nicknames only. This public submission API cannot verify actual gameplay.

create table if not exists public.grammar_scores (
  id bigint generated always as identity primary key,
  player_name text not null check (char_length(trim(player_name)) between 2 and 20),
  grade smallint not null check (grade in (8,9,10)),
  score integer not null check (score between 100 and 2000 and score % 100 = 0),
  levels_completed smallint not null check (levels_completed between 1 and 20),
  best_streak smallint not null check (best_streak between 0 and 20),
  played_at timestamptz not null default now(),
  constraint valid_score_for_progress check (score = levels_completed * 100)
);

create index if not exists grammar_scores_grade_score_idx
  on public.grammar_scores(grade, score desc, played_at asc);

alter table public.grammar_scores enable row level security;

-- Anonymous users may read and submit, but may not edit or delete rows.
revoke all privileges on table public.grammar_scores from anon, authenticated;
grant select, insert on table public.grammar_scores to anon, authenticated;
grant usage on sequence public.grammar_scores_id_seq to anon, authenticated;

drop policy if exists "Grammar Quest leaderboard read" on public.grammar_scores;
create policy "Grammar Quest leaderboard read"
  on public.grammar_scores for select to anon, authenticated using (true);

drop policy if exists "Grammar Quest leaderboard submit" on public.grammar_scores;
create policy "Grammar Quest leaderboard submit"
  on public.grammar_scores for insert to anon, authenticated
  with check (char_length(trim(player_name)) between 2 and 20
    and player_name !~ '[[:cntrl:]]'
    and score = levels_completed * 100
    and best_streak <= levels_completed);
