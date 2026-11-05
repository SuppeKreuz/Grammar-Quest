-- Grammar Quest 6.0 — fresh Supabase leaderboard installation.
-- Existing installations must run migrations/endless_personal_best.sql instead.
-- Levels and points have no practical 20-level/2,000-XP cap.
-- Player rankings use their best-ever score. No existing score rows are deleted.
create table if not exists public.grammar_scores (
  id bigint generated always as identity primary key,
  player_name text not null check (char_length(trim(player_name)) between 2 and 20),
  grade smallint not null check (grade in (8,9,10)),
  is_admin boolean not null default false,
  assisted boolean not null default false,
  score bigint not null constraint grammar_scores_score_check
    check (score between 100 and 9007199254740900 and score % 100 = 0),
  levels_completed bigint not null constraint grammar_scores_levels_completed_check
    check (levels_completed between 0 and 90071992547409),
  best_streak bigint not null constraint grammar_scores_best_streak_check
    check (best_streak between 0 and 90071992547409),
  played_at timestamptz not null default now(),
  constraint valid_score_for_progress check (is_admin or score = levels_completed * 100)
);

create index if not exists grammar_scores_grade_score_idx
  on public.grammar_scores(grade, score desc, played_at asc);
alter table public.grammar_scores enable row level security;

-- Public visitors may read the scores and submit ordinary, self-reported scores.
-- Neither updates nor deletes are granted to visitors. Admin writes use Edge Functions.
revoke all privileges on table public.grammar_scores from anon, authenticated;
grant select, insert on table public.grammar_scores to anon, authenticated;
grant usage on sequence public.grammar_scores_id_seq to anon, authenticated;
grant select, insert on public.grammar_scores to service_role;
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
    and score between 100 and 9007199254740900
    and score % 100 = 0
    and levels_completed >= 1
    and score = levels_completed * 100
    and best_streak <= levels_completed
  );

-- RLS-respecting, permanent best-ever score for each nickname and grade.
create or replace view public.grammar_best_scores with (security_invoker = true) as
  select distinct on (grade, lower(player_name))
    player_name, grade, score, levels_completed, best_streak, played_at
  from public.grammar_scores
  order by grade, lower(player_name), score desc, levels_completed desc, played_at asc;

grant select on public.grammar_best_scores to anon, authenticated;
