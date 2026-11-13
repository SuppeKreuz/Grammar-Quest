-- Explicitly deny browser access to protected-owner authentication internals.
-- service_role continues to use these tables through its full privileges.
create policy "Owner credentials are never public"
 on public.grammar_owner_credentials for select to anon, authenticated using (false);
create policy "Owner sign-in attempts are never public"
 on public.grammar_owner_login_attempts for select to anon, authenticated using (false);
