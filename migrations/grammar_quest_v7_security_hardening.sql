-- Grammar Quest 7 security hardening: no anonymous SECURITY DEFINER RPC access.
-- All public nickname checks are done by the Edge Function with a secret server key.
revoke execute on function public.grammar_name_allowed(text) from public, anon, authenticated;
grant execute on function public.grammar_name_allowed(text) to service_role;
create policy "Block browser reads of banned nicknames"
 on public.grammar_blocked_names for select to anon, authenticated using (false);
create policy "Block browser reads of moderation log"
 on public.grammar_moderation_log for select to anon, authenticated using (false);
