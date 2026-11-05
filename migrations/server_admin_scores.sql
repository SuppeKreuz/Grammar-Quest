-- Upgrade an existing Grammar Quest shared leaderboard for server-written admin scores.
-- Does not remove or rewrite any existing leaderboard rows.
-- Admin score submissions must use the protected Edge Function; do NOT grant
-- anonymous clients permission to set is_admin=true.

alter table public.grammar_scores
  add column if not exists is_admin boolean not null default false;

alter table public.grammar_scores
  drop constraint if exists grammar_scores_score_check;
alter table public.grammar_scores
  add constraint grammar_scores_score_check check (
    score % 100 = 0 and
    ((not is_admin and score between 100 and 2000)
      or (is_admin and score between 100 and 100000000))
  );

alter table public.grammar_scores
  drop constraint if exists grammar_scores_levels_completed_check;
alter table public.grammar_scores
  add constraint grammar_scores_levels_completed_check
  check (levels_completed between 0 and 20);

alter table public.grammar_scores
  drop constraint if exists valid_score_for_progress;
alter table public.grammar_scores
  add constraint valid_score_for_progress
  check (is_admin or score = levels_completed * 100);

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

grant select, insert on table public.grammar_scores to service_role;
grant usage on sequence public.grammar_scores_id_seq to service_role;
