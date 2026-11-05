-- Grammar Quest: let admin-assisted points compete in the existing online leaderboard.
-- Existing public rows remain unmodified. Regular scores continue to match progress.
-- WARNING: without real server-side admin authentication, anonymous clients can claim
-- assisted=true too. This project is a casual classroom demo, not a trusted contest.
alter table public.grammar_scores
  add column if not exists assisted boolean not null default false;

alter table public.grammar_scores
  drop constraint if exists grammar_scores_score_check;
alter table public.grammar_scores
  add constraint grammar_scores_score_check
  check (score between 100 and 1000000 and score % 100 = 0);

alter table public.grammar_scores
  drop constraint if exists grammar_scores_levels_completed_check;
alter table public.grammar_scores
  add constraint grammar_scores_levels_completed_check
  check (levels_completed between 0 and 20);

alter table public.grammar_scores
  drop constraint if exists valid_score_for_progress;
alter table public.grammar_scores
  add constraint valid_score_for_progress
  check (assisted or score = levels_completed * 100);

drop policy if exists "Grammar Quest leaderboard submit" on public.grammar_scores;
create policy "Grammar Quest leaderboard submit"
  on public.grammar_scores for insert to anon, authenticated
  with check (
    char_length(trim(player_name)) between 2 and 20
    and player_name !~ '[[:cntrl:]]'
    and (assisted or (score = levels_completed * 100 and best_streak <= levels_completed))
  );
