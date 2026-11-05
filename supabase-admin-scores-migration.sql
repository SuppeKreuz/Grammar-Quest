-- Grammar Quest 5.0.1: admin-awarded scores in the same online rankings.
-- Existing rows are preserved, with is_admin = false.
-- Normal visitors remain constrained to score = completed levels × 100.
-- Only the server-side Edge Function should insert is_admin = true.

alter table public.grammar_scores
  add column if not exists is_admin boolean not null default false;

alter table public.grammar_scores
  drop constraint if exists grammar_scores_score_check;
alter table public.grammar_scores
  add constraint grammar_scores_score_check check (
    score % 100 = 0 and
    ((is_admin = false and score between 100 and 2000)
      or (is_admin = true and score between 100 and 100000000))
  );

alter table public.grammar_scores
  drop constraint if exists valid_score_for_progress;
alter table public.grammar_scores
  add constraint valid_score_for_progress check (
    is_admin = true or score = levels_completed * 100
  );

-- Preserve the anonymous read policy while refusing client-asserted admin rows.
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

alter table public.grammar_scores enable row level security;
