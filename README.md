# Grammar Quest

A browser-based English word-order game for grades 8, 9 and 10.

## Deployment

1. GitHub repository Settings → Pages → deploy `main` from `/ (root)`.
2. For a shared leaderboard, create a Supabase project and run `supabase-leaderboard.sql` in its SQL editor.
3. Add your project URL and **publishable key** to `config.js`. Do not add any secret key.
4. Only nicknames should be used; scores are public. Public demo score submissions are **not tamper-proof**.

Local play works without Supabase.
