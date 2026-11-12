/* Offline support (2026-11-04, kb/lock/access-lock.md → "Offline"). Registered by assets/js/auth.js on the live https site only.
   No precache list on purpose: whatever a visit loads is kept, so new file names (the split course-*.css, lazy lab scripts,
   per-course quiz files) need no change here. Strategy (sw v2, 2026-11-11, Speed pass):
   - The public site in "zl-site": pages and unstamped files network first (a publish shows at once), banner/logo images
     (assets/img, unstamped) stale-while-revalidate; files stamped ?v=<content hash> (lock.mjs) cache first, and storing a new
     stamp of a path drops the older stamps of that path (otherwise every publish left another 1 MB course.css behind).
   - CDN files: versioned URLs (CodeMirror 5.65.16 on cdnjs, supabase-js on jsdelivr, font files on fonts.gstatic) cache first;
     the Google Fonts CSS stale-while-revalidate. All in "zl-cdn".
   - Locked lesson scripts come from 1-hour signed Supabase Storage URLs, kept in "zl-private" under their path (the token is
     dropped from the key), so an offline copy of a lesson finds them; stamped (&v=) ones cache first (older stamps dropped),
     unstamped network first. Lazy lab tags (type="text/zl-lazy") are signed the same way and load within seconds of a visit,
     so a visited lesson has its labs offline. Logging out deletes "zl-private" (auth.js signOut), which also holds the lesson
     pages themselves (auth.js → keep).
   Never cached: Supabase auth, REST and edge functions (POST, or personal data). */
const SITE = "zl-site", CDN = "zl-cdn", PRIV = "zl-private";
self.addEventListener("install", () => self.skipWaiting());
/* one copy per path: keys come back in insertion order, so the last stamp seen for a path is the newest */
const prune = async (name) => {
  const c = await caches.open(name), last = new Map(), all = await c.keys();
  for (const r of all) { const u = new URL(r.url); if (u.searchParams.has("v")) last.set(u.origin + u.pathname, r.url); }
  for (const r of all) { const u = new URL(r.url); if (u.searchParams.has("v") && last.get(u.origin + u.pathname) !== r.url) await c.delete(r); }
};
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (![SITE, CDN, PRIV].includes(k)) await caches.delete(k);
  try { await prune(SITE); await prune(PRIV); } catch (err) { /* best effort */ }
  await self.clients.claim();
})()));

const ok = (r) => r && (r.ok || r.type === "opaque");
const swr = async (cache, req, key) => {
  const c = await caches.open(cache), hit = await c.match(key || req, { ignoreVary: true });
  const net = fetch(req).then((r) => { if (ok(r)) c.put(key || req, r.clone()); return r; }).catch(() => null);
  return hit || (await net) || new Response("Offline", { status: 503, statusText: "Offline" });
};
const netFirst = async (cache, req, key) => {
  const c = await caches.open(cache);
  try { const r = await fetch(req); if (r.ok) c.put(key, r.clone()); return r; }
  catch (e) { const hit = await c.match(key); if (hit) return hit; throw e; }
};
/* key: string or Request; a stamped key (…?v=hash) also removes the other stamps of the same path once the new one is stored */
const cacheFirst = async (cache, req, key) => {
  const c = await caches.open(cache), hit = await c.match(key, { ignoreVary: true });
  if (hit) return hit;
  const r = await fetch(req);
  if (ok(r)) {
    const k = new URL(typeof key === "string" ? key : key.url);
    c.put(key, r.clone()).then(async () => {
      if (!k.searchParams.has("v")) return;
      for (const old of await c.keys()) { const u = new URL(old.url); if (u.origin + u.pathname === k.origin + k.pathname && old.url !== k.href) await c.delete(old); }
    }).catch(() => { });
  }
  return r;
};

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.origin === location.origin) {
    const path = u.origin + u.pathname;
    if (req.mode !== "navigate" && u.searchParams.has("v")) { e.respondWith(cacheFirst(SITE, req, u.origin + u.pathname + "?v=" + u.searchParams.get("v"))); return; }
    if (req.mode !== "navigate" && /\/assets\/img\//.test(u.pathname)) { e.respondWith(swr(SITE, req, path)); return; }
    /* pages and unstamped files (study.js, course-images.js, effects.js…): network first, so a publish shows at once */
    e.respondWith(netFirst(SITE, req, path).catch(() => caches.match(path).then((r) => r || Response.error()))); return;
  }
  const sign = u.pathname.match(/\/storage\/v1\/object\/sign\/site\/(.+)$/);
  /* perf v1 (2026-11-08): a signed URL stamped &v=<content hash> (lock.mjs upload + page function) is that exact file, so
     it is served from the cache once fetched; unstamped ones stay network first */
  if (sign && u.searchParams.has("v")) { e.respondWith(cacheFirst(PRIV, req, "https://zl.local/site/" + sign[1] + "?v=" + u.searchParams.get("v"))); return; }
  if (sign) { e.respondWith(netFirst(PRIV, req, "https://zl.local/site/" + sign[1])); return; }
  if (/(^|\.)(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com|fonts\.gstatic\.com)$/.test(u.hostname)) { e.respondWith(cacheFirst(CDN, req, req)); return; }
  if (/(^|\.)fonts\.googleapis\.com$/.test(u.hostname)) { e.respondWith(swr(CDN, req)); return; }
});
