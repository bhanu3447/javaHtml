// register: a new person signs up with a selfie. Body {email, password, image (base64 JPEG)}.
// Allowed only when the email has an unused invite and the selfie matches its photo.
// Public sign-ups are switched off in Supabase, so this is the only way to create an account.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const out = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const THRESHOLD = 0.55;   // cosine distance (1 - similarity) for InsightFace w600k_mbf: same person measured 0.03-0.29, different people ~1.0; lower = stricter
const MAX_TRIES = 5;

async function embed(image: string, live: boolean): Promise<{ embedding?: number[]; error?: string }> {
  const r = await fetch(Deno.env.get("FACE_API_URL")!.replace(/\/$/, "") + "/embed", {
    method: "POST", headers: { "Content-Type": "application/json", "x-face-secret": Deno.env.get("FACE_API_SECRET")! },
    body: JSON.stringify({ image, live }),
  });
  try { return await r.json(); } catch { return { error: "The face server did not answer (it may be waking up; try again in a minute)." }; }
}
function distance(a: number[], b: number[]) {
  let d = 0, x = 0, y = 0;
  for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; x += a[i] * a[i]; y += b[i] * b[i]; }
  return 1 - d / (Math.sqrt(x) * Math.sqrt(y));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const { email, password, image } = await req.json().catch(() => ({}));
  const mail = String(email || "").trim().toLowerCase();
  if (!mail || !image || String(password || "").length < 8) return out({ error: "Email, a password of 8+ characters and a selfie are needed." }, 400);

  const { data: inv } = await db.from("invites").select("*").eq("email", mail).maybeSingle();
  // the same answer for "no invite" and "already used", so the form can't be used to discover who is invited
  if (!inv || inv.used_at) return out({ error: "This email is not approved for registration. Ask the course owner." }, 403);
  if (inv.attempts >= MAX_TRIES) return out({ error: "Too many failed face checks. Ask the course owner to re-approve you." }, 429);

  const f = await embed(image, true);
  if (!f.embedding) return out({ error: f.error || "No single clear face found. Face the camera in good light." }, 422);
  const dist = distance(f.embedding, inv.embedding);
  if (dist > THRESHOLD) {
    await db.from("invites").update({ attempts: inv.attempts + 1 }).eq("id", inv.id);
    return out({ error: `Face does not match the approved photo (${MAX_TRIES - inv.attempts - 1} tries left).` }, 403);
  }

  const { error } = await db.auth.admin.createUser({ email: mail, password, email_confirm: true, user_metadata: { name: inv.name } });
  if (error) return out({ error: error.message }, 400);
  await db.from("invites").update({ used_at: new Date().toISOString() }).eq("id", inv.id);
  return out({ ok: true });
});
