/* Offline support (2026-11-04, kb/lock/access-lock.md → "Offline"). Registered by assets/js/auth.js on the live https site only.
   - The public site in "zl-site": pages and unstamped files network first; files stamped ?v= (lock.mjs) cache first.
   - CDN files (supabase-js, CodeMirror, fonts): stale-while-revalidate in "zl-cdn".
   - Locked lesson scripts come from 1-hour signed Supabase Storage URLs: network first, kept in "zl-private" under their path
     (the token is dropped from the key), so an offline copy of a lesson finds them. Logging out deletes "zl-private"
     (auth.js signOut), which also holds the lesson pages themselves (auth.js → keep).
   Never cached: Supabase auth, REST and edge functions (POST, or personal data). */
const SITE = "zl-site", CDN = "zl-cdn", PRIV = "zl-private";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (![SITE, CDN, PRIV].includes(k)) await caches.delete(k);
  await self.clients.claim();
})()));

const swr = async (cache, req, key) => {
  const c = await caches.open(cache), hit = await c.match(key || req, { ignoreVary: true });
  const net = fetch(req).then((r) => { if (r && (r.ok || r.type === "opaque")) c.put(key || req, r.clone()); return r; }).catch(() => null);
  return hit || (await net) || new Response("Offline", { status: 503, statusText: "Offline" });
};
const netFirst = async (cache, req, key) => {
  const c = await caches.open(cache);
  try { const r = await fetch(req); if (r.ok) c.put(key, r.clone()); return r; }
  catch (e) { const hit = await c.match(key); if (hit) return hit; throw e; }
};

const cacheFirst = async (cache, req, key) => {
  const c = await caches.open(cache), hit = await c.match(key);
  if (hit) return hit;
  const r = await fetch(req);
  if (r.ok) c.put(key, r.clone());
  return r;
};

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.origin === location.origin) {
    /* pages and unstamped files (study.js, effects.js, models): network first, so a publish shows at once;
       files stamped ?v=<content hash> by lock.mjs never change, so the cached copy is served right away */
    if (req.mode === "navigate" || !u.searchParams.has("v")) { e.respondWith(netFirst(SITE, req, u.origin + u.pathname).catch(() => caches.match(u.origin + u.pathname).then((r) => r || Response.error()))); return; }
    e.respondWith(swr(SITE, req)); return;
  }
  const sign = u.pathname.match(/\/storage\/v1\/object\/sign\/site\/(.+)$/);
  /* perf v1 (2026-11-08): a signed URL stamped &v=<content hash> (lock.mjs upload + page function) is that exact file, so
     it is served from the cache once fetched; unstamped ones stay network first */
  if (sign && u.searchParams.has("v")) { e.respondWith(cacheFirst(PRIV, req, "https://zl.local/site/" + sign[1] + "?v=" + u.searchParams.get("v"))); return; }
  if (sign) { e.respondWith(netFirst(PRIV, req, "https://zl.local/site/" + sign[1])); return; }
  if (/(^|\.)(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname)) { e.respondWith(swr(CDN, req)); return; }
});
