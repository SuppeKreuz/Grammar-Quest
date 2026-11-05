// Grammar Quest - admin-only score writer for the shared public leaderboard.
// No service/secret API key is ever returned to the browser.
// The legacy client-side Admin passphrase is visible in the site's source,
// so this gate is for casual abuse prevention, NOT high-security authentication.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "600",
};
const adminPasswordHash = "b8a4e3368e8e8b32fdb13b09490501363903098d5caeb1d54a7a795a26a444ce";

function reply(status: number, message: string): Response {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
async function validAdminPassword(value: unknown): Promise<boolean> {
  if (typeof value !== "string" || value.length > 128) return false;
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  const expected = new Uint8Array(adminPasswordHash.match(/.{2}/g)!.map(x => Number.parseInt(x, 16)));
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= expected[i] ^ digest[i];
  return difference === 0;
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

  const player_name = typeof body.player_name === "string" ? body.player_name.trim() : "";
  const grade = Number(body.grade);
  const score = Number(body.score);
  const levels_completed = Number(body.levels_completed);
  const best_streak = Number(body.best_streak);
  if (!/^[\p{L}\p{N}_ -]{2,20}$/u.test(player_name) ||
      ![8, 9, 10].includes(grade) ||
      !Number.isInteger(score) || score < 100 || score > 100000000 || score % 100 !== 0 ||
      !Number.isInteger(levels_completed) || levels_completed < 1 || levels_completed > 20 ||
      !Number.isInteger(best_streak) || best_streak < 0 || best_streak > 20) {
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
