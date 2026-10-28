// The course lock (kb/access-lock.md). No npm packages needed.
//   node scripts/lock.mjs build    -> dist/ : the PUBLIC site (hub, login, admin, engine) + a small shell for every locked page
//   node scripts/lock.mjs upload   -> uploads the LOCKED files (course pages, assets/data, assets/labs) to the private Supabase bucket "site"
//                                     needs env SUPABASE_SERVICE_ROLE_KEY (never commit it); the URL comes from assets/js/auth-config.js
//   node scripts/lock.mjs list     -> prints which files are locked
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COURSES = ["java", "sql", "spring", "patterns"];
const PUBLIC = ["index.html", "login.html", "admin.html", ".nojekyll", "assets/css", "assets/js", "assets/models"];
const DIST = path.join(ROOT, "dist");
const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");

function walk(dir, ok) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p, ok) : ok(p) ? [rel(p)] : [];
  });
}
function lockedFiles() {
  return [
    ...COURSES.flatMap((c) => walk(path.join(ROOT, c), (p) => p.endsWith(".html"))),
    ...walk(path.join(ROOT, "assets/data"), (p) => p.endsWith(".js")),
    ...walk(path.join(ROOT, "assets/labs"), (p) => p.endsWith(".js")),
  ];
}
function shell(file) {
  const src = fs.readFileSync(path.join(ROOT, file), "utf8");
  const title = (src.match(/<title>([^<]*)<\/title>/) || [, "Zero to Advanced"])[1];
  const root = "../".repeat(file.split("/").length - 1);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="${root}assets/css/auth.css">
</head>
<body class="au">
<main class="au-gate" id="auGate"><div class="au-card"><span class="au-lock" aria-hidden="true">⏳</span><p>Loading…</p></div></main>
<script src="${root}assets/js/auth-config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
<script src="${root}assets/js/auth.js"></script>
<script>AUTH.gate(${JSON.stringify(file)}, ${JSON.stringify(root)});</script>
</body>
</html>
`;
}

function build() {
  // keep dist/.git (dist is its own repo that pushes to the public GitHub Pages repo)
  if (fs.existsSync(DIST)) for (const e of fs.readdirSync(DIST)) if (e !== ".git") fs.rmSync(path.join(DIST, e), { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  for (const p of PUBLIC) {
    const from = path.join(ROOT, p);
    if (fs.existsSync(from)) fs.cpSync(from, path.join(DIST, p), { recursive: true });
  }
  const locked = lockedFiles(), pages = locked.filter((f) => f.endsWith(".html"));
  for (const f of pages) {
    fs.mkdirSync(path.dirname(path.join(DIST, f)), { recursive: true });
    fs.writeFileSync(path.join(DIST, f), shell(f));
  }
  const cfg = fs.readFileSync(path.join(ROOT, "assets/js/auth-config.js"), "utf8");
  console.log(`dist/ built: ${PUBLIC.length} public entries, ${pages.length} locked-page shells (${locked.length - pages.length} locked scripts stay out).`);
  if (cfg.includes("YOUR-")) console.log("WARNING: assets/js/auth-config.js still has placeholders; the public site would show 'lock not set up'.");
}

async function upload() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const cfg = fs.readFileSync(path.join(ROOT, "assets/js/auth-config.js"), "utf8");
  const url = process.env.SUPABASE_URL || (cfg.match(/url:\s*"([^"]+)"/) || [])[1];
  if (!key || !url || url.includes("YOUR-")) { console.error("Set SUPABASE_SERVICE_ROLE_KEY (and fill assets/js/auth-config.js) first."); process.exit(1); }
  let n = 0, bad = 0;
  for (const f of lockedFiles()) {
    const r = await fetch(`${url}/storage/v1/object/site/${f}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, apikey: key, "x-upsert": "true",
        "Content-Type": f.endsWith(".html") ? "text/html; charset=utf-8" : "application/javascript; charset=utf-8" },
      body: fs.readFileSync(path.join(ROOT, f)),
    });
    if (r.ok) n++; else { bad++; console.error(`FAILED ${f}: ${r.status} ${await r.text()}`); }
  }
  console.log(`uploaded ${n} locked files to the private bucket "site"` + (bad ? `, ${bad} failed` : ""));
  if (bad) process.exit(1);
}

const cmd = process.argv[2];
if (cmd === "build") build();
else if (cmd === "upload") await upload();
else if (cmd === "list") console.log(lockedFiles().join("\n"));
else console.log("usage: node scripts/lock.mjs build | upload | list");
