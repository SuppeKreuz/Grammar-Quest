// Grammar Quest - admin-only score writer for the shared public leaderboard.
// No service/secret API key is ever returned to the browser.
// Admin verifier is stored in a server-only RLS-protected database table.
// No password or password hash is shipped to GitHub Pages.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "600",
};

function reply(status: number, message: string): Response {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
async function validAdminPassword(value: unknown): Promise<boolean> {
  if (typeof value !== "string" || value.length < 12 || value.length > 128) return false;
  const base = Deno.env.get("SUPABASE_URL");
  const key = getServerKey();
  if (!base || !key) return false;
  try {
    // Only the service role can read grammar_admin_config. No password hash in public code.
    const headers: Record<string, string> = { apikey: key, Accept: "application/json" };
    if (!key.startsWith("sb_secret_")) headers.Authorization = "Bearer " + key;
    const res = await fetch(base.replace(/\/$/, "") + "/rest/v1/grammar_admin_config?select=salt,password_hash&name=eq.main&limit=1", {headers, cache:"no-store"});
    if (!res.ok) return false;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length !== 1) return false;
    const { salt, password_hash } = rows[0];
    if (typeof salt !== "string" || !/^[a-f0-9]{32}$/.test(salt) || typeof password_hash !== "string" || !/^[a-f0-9]{64}$/.test(password_hash)) return false;
    const actual = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + ":" + value)));
    const expected = new Uint8Array(password_hash.match(/.{2}/g)!.map((x: string) => Number.parseInt(x, 16)));
    let difference = 0;
    for (let i = 0; i < expected.length; i++) difference |= expected[i] ^ actual[i];
    return difference === 0;
  } catch (err) {
    console.error("Admin verification service unavailable");
    return false;
  }
}
function getServerKey(): string | null {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    for (const value of Object.values(keys)) {
      if (typeof value === "string" && value.startsWith("sb_secret_")) return value;
    }
  } catch { /* no secret key configured */ }
  return null;
}

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== "POST") return reply(405, "Method not allowed.");
  if (Number(request.headers.get("content-length") || "0") > 4096) return reply(413, "Request too large.");

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return reply(400, "Invalid JSON."); }
  if (!body || typeof body !== "object" || !(await validAdminPassword(body.passphrase))) {
    return reply(401, "Incorrect admin passphrase.");
  }

  if (body.action === "verify") return reply(200, "Admin access verified.");

  const player_name = typeof body.player_name === "string" ? body.player_name.trim() : "";
  const grade = Number(body.grade);
  const score = Number(body.score);
  const levels_completed = Number(body.levels_completed);
  const best_streak = Number(body.best_streak);
  if (!/^[\p{L}\p{N}_ -]{2,20}$/u.test(player_name) ||
      ![8, 9, 10].includes(grade) ||
      !Number.isSafeInteger(score) || score < 100 || score > 9007199254740900 || score % 100 !== 0 ||
      !Number.isSafeInteger(levels_completed) || levels_completed < 0 || levels_completed > 90071992547409 ||
      !Number.isSafeInteger(best_streak) || best_streak < 0 || best_streak > 90071992547409) {
    return reply(400, "Invalid score, grade, name, or progress.");
  }

  const base = Deno.env.get("SUPABASE_URL");
  const key = getServerKey();
  if (!base || !key) return reply(503, "Server-side score writer is unavailable.");
  const headers: Record<string, string> = {
    "apikey": key,
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
  };
  if (!key.startsWith("sb_secret_")) headers["Authorization"] = "Bearer " + key;

  try {
    const res = await fetch(base.replace(/\/$/, "") + "/rest/v1/grammar_scores", {
      method: "POST",
      headers,
      body: JSON.stringify({ player_name, grade, score, levels_completed, best_streak, is_admin: true }),
    });
    if (!res.ok) {
      console.error("Admin score insert failed", res.status);
      return reply(502, "Could not save admin score to database.");
    }
    return reply(200, "Score saved to the shared leaderboard.");
  } catch (error) {
    console.error("Admin score error", error);
    return reply(502, "Could not reach score database.");
  }
});
