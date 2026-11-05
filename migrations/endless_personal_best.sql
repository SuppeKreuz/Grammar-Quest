-- Grammar Quest 6.0: endless challenges and permanent personal-best leaderboard.
-- Safe for existing data: no rows are deleted or changed, only numeric limits expand.
-- JavaScript safe-integer ceiling rounded down to a whole 100 XP step.
drop policy if exists "Grammar Quest leaderboard submit" on public.grammar_scores;

alter table public.grammar_scores
  drop constraint if exists grammar_scores_score_check;
alter table public.grammar_scores
  drop constraint if exists grammar_scores_levels_completed_check;
alter table public.grammar_scores
  drop constraint if exists grammar_scores_best_streak_check;
alter table public.grammar_scores
  drop constraint if exists valid_score_for_progress;

alter table public.grammar_scores
  alter column score type bigint using score::bigint,
  alter column levels_completed type bigint using levels_completed::bigint,
  alter column best_streak type bigint using best_streak::bigint;

alter table public.grammar_scores
  add constraint grammar_scores_score_check
    check (score between 100 and 9007199254740900 and score % 100 = 0),
  add constraint grammar_scores_levels_completed_check
    check (levels_completed between 0 and 90071992547409),
  add constraint grammar_scores_best_streak_check
    check (best_streak between 0 and 90071992547409),
  add constraint valid_score_for_progress
    check (is_admin or score = levels_completed * 100);

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

-- Security invoker is critical: users of the view must obey table RLS.
-- DISTINCT ON returns only the player's all-time highest score for their grade.
create or replace view public.grammar_best_scores
 with (security_invoker = true)
 as
 select distinct on (grade, lower(player_name))
   player_name, grade, score, levels_completed, best_streak, played_at
 from public.grammar_scores
 order by grade, lower(player_name), score desc, levels_completed desc, played_at asc;

grant select on public.grammar_best_scores to anon, authenticated;
-- Existing admin-only score writes still use the Edge Function and service role.
