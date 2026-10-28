// page: returns one locked page if the logged-in person may open its course. Body {path: "java/lessons/01-strings.html"}.
// Answer {html} on success, else {status: "login" | "none" | "pending" | "rejected"}.
// Private scripts the page uses (assets/data/*, assets/labs/*) are rewritten to signed URLs that expire in an hour.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const out = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const COURSES = ["java", "sql", "spring", "patterns"];
const PRIVATE = /^assets\/(data|labs)\/[\w.-]+\.js$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const { path } = await req.json().catch(() => ({}));
  const p = String(path || "");
  const course = p.split("/")[0];
  if (!/^[\w/.-]+\.html$/.test(p) || p.includes("..") || !COURSES.includes(course)) return out({ error: "bad path" }, 400);

  const token = (req.headers.get("Authorization") || "").replace(/^Bearer /, "");
  const { data: u } = await db.auth.getUser(token);
  if (!u?.user) return out({ status: "login" }, 401);
  const { data: me } = await db.from("profiles").select("role").eq("id", u.user.id).single();
  if (!me || !["owner", "admin"].includes(me.role)) {
    const { data: a } = await db.from("course_access").select("status").eq("user_id", u.user.id).eq("course_id", course).maybeSingle();
    if (!a || a.status !== "approved") return out({ status: a ? a.status : "none", course }, 403);
  }

  const { data: file, error } = await db.storage.from("site").download(p);
  if (error || !file) return out({ error: "page not found" }, 404);
  let html = await file.text();

  // resolve every src="..." against the page path; sign the private ones
  const base = "https://x/" + p, wanted = new Map<string, string>();
  for (const m of html.matchAll(/src="([^"]+)"/g)) {
    if (/^(https?:|data:|\/\/)/.test(m[1])) continue;
    const rel = new URL(m[1], base).pathname.slice(1);
    if (PRIVATE.test(rel)) wanted.set(m[1], rel);
  }
  if (wanted.size) {
    const rels = [...new Set(wanted.values())];
    const { data: signed } = await db.storage.from("site").createSignedUrls(rels, 3600);
    const byRel = new Map((signed || []).map((s, i) => [rels[i], s.signedUrl]));
    html = html.replace(/src="([^"]+)"/g, (all, src) => {
      const rel = wanted.get(src), url = rel && byRel.get(rel);
      return url ? `src="${url}"` : all;
    });
  }
  return out({ html });
});
