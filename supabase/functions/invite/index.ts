// invite: an owner/admin approves a person by photo. Body {email, name, image (base64 JPEG)}.
// Stores only the face embedding (from the face server on Render), never the photo.
// Secrets: FACE_API_URL, FACE_API_SECRET (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are built in).
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const out = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

async function embed(image: string, live: boolean): Promise<{ embedding?: number[]; error?: string }> {
  const r = await fetch(Deno.env.get("FACE_API_URL")!.replace(/\/$/, "") + "/embed", {
    method: "POST", headers: { "Content-Type": "application/json", "x-face-secret": Deno.env.get("FACE_API_SECRET")! },
    body: JSON.stringify({ image, live }),
  });
  try { return await r.json(); } catch { return { error: "The face server did not answer (it may be waking up; try again in a minute)." }; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer /, "");
  const { data: u } = await db.auth.getUser(token);
  if (!u?.user) return out({ error: "Log in first." }, 401);
  const { data: me } = await db.from("profiles").select("role").eq("id", u.user.id).single();
  if (!me || !["owner", "admin"].includes(me.role)) return out({ error: "Admins only." }, 403);

  const { email, name, image } = await req.json().catch(() => ({}));
  const mail = String(email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail) || !String(name || "").trim() || !image) return out({ error: "Name, email and photo are all needed." }, 400);

  const f = await embed(image, false);
  if (!f.embedding) return out({ error: f.error || "No single clear face found in the photo." }, 422);
  const { error } = await db.from("invites").upsert(
    { email: mail, name: String(name).trim(), embedding: f.embedding, attempts: 0, used_at: null, created_by: u.user.id },
    { onConflict: "email" });
  if (error) return out({ error: error.message }, 500);
  return out({ ok: true });
});
