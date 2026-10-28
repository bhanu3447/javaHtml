# The course lock (built 2026-10-28, not live yet)

The user wants only approved people to see the courses: they approve a person by photo, the person registers with a selfie that must match, then asks for each course and the owner (or an admin) approves it. **Real lock**: locked files are never on the public site.

## Pieces (all free tiers)
| Part | Where | Files |
|---|---|---|
| Public site | GitHub Pages, repo `bhanu3447/javaHtml` (holds only `dist/`) | `index.html` (hub), `login.html`, `admin.html`, `assets/css`, `assets/js`, `assets/models`, + one shell per locked page |
| Login, roles, approvals, locked files | Supabase (free) | `supabase/schema.sql`, `supabase/functions/{invite,register,page}/index.ts`, private bucket `site` |
| Face matching | Render free web service (Node, 512 MB) | `face-server/` (`server.js` + `face.js`: InsightFace buffalo_s ONNX via onnxruntime-node: SCRFD det_500m → 5-point alignment → w600k_mbf 512-d embedding) |
| Source of everything | this folder, pushed to a **private** repo | unchanged authoring; file:// works as before because `auth-config.js` placeholders switch the lock off |

**Locked** (`node scripts/lock.mjs list`): every `.html` under `java/ sql/ spring/ patterns/`, and `assets/data/*.js`, `assets/labs/*.js` (they hold lesson text, quiz answers, search index). **Public**: the engine (`course.js`, `effects.js`, `run-java.js`, `jvm-lite.js`, `playground.js`, `course.css`); `course.js` still holds some v1 widget text (accepted).

## How a locked page opens
1. `dist/<path>.html` is a shell (`lock.mjs` `shell()`): auth.css, auth-config, supabase-js 2.45.4 (jsdelivr), auth.js, `AUTH.gate(path, root)`.
2. `gate` → not logged in: card with Log in (`login.html?next=…`). Logged in: POST `functions/v1/page {path}`.
3. `page` function: token → user; owner/admin open all; others need `course_access.status='approved'` for the first path segment. Else `{status: login|none|pending|rejected}` → card (Request access calls RPC `request_course`).
4. On success it downloads the page from bucket `site`, rewrites `src` of private scripts to 1-hour signed URLs, returns `{html}`; the shell waits for DOMContentLoaded (document.open is ignored while parsing), then `document.open/write/close`. Same URL, so relative paths, links, progress keys all work.
Tested 2026-10-28 (headless, written vs direct): L01, P01, S00, playground give identical counts of sections, buttons, SVGs, editors; gate cards for no-login/none/pending/open.

## Roles and rules (database enforces them; RLS read-only, writes via security-definer RPCs or edge functions)
- `profiles.role`: `owner` (set once by SQL), `admin` (owner's `set_role`), `learner`. Owner/admin: admin page, approve people (`invite`), approve/reject/remove course access (`decide_access`, can grant without a request). Only the owner makes admins; nobody changes their own role or the owner's.
- `invites`: email, name, 512-float embedding (no photo stored), `attempts` (5 failures lock it), `used_at`. Register answers the same for "not invited" and "already used".
- Register (`register` function): unused invite + selfie embedding cosine distance ≤ 0.55 (measured 2026-10-28: same person 0.03–0.29, different people ≈ 1.0) → `auth.admin.createUser` (email confirmed), profile created by trigger with the invite's name.
- **Public sign-ups must be OFF** in Supabase (Authentication → Sign In / Providers → "Allow new users to sign up" off), otherwise anyone could sign up with the anon key. `createUser` with the service key still works.
- All three edge functions: "Verify JWT" **off** (each checks the token itself; register has no user yet).

## Setup steps (for the user, once)
1. **Private source repo**: on GitHub create private `javaHtml-src`; `git remote set-url origin https://github.com/bhanu3447/javaHtml-src.git` and `git push -u origin main` (keeps the full history private).
2. **Supabase**: new project → SQL Editor: run `supabase/schema.sql`. Authentication → Users → Add user (own email, auto-confirm) → SQL: `update public.profiles set role='owner' where email='…'`. Turn public sign-ups off. Fill `assets/js/auth-config.js` (Project URL + anon/publishable key).
3. **Render**: New → Web Service → repo `javaHtml-src`, Root Directory `face-server`, Runtime Node, Build `npm install` (postinstall downloads the models), Start `npm start`, Instance type Free; env vars `FACE_API_SECRET` (long random string) and `ONNXRUNTIME_NODE_INSTALL_CUDA=skip`. URL: `https://<name>.onrender.com`.
4. **Edge functions**: Supabase → Edge Functions → create `invite`, `register`, `page` (paste each `index.ts`), Verify JWT off. Edge Functions → Secrets: `FACE_API_URL` (Render URL), `FACE_API_SECRET` (same string).
5. **Upload locked files**: `$env:SUPABASE_SERVICE_ROLE_KEY="…"; node scripts/lock.mjs upload` (PowerShell; key never committed).
6. **Public site**: `node scripts/lock.mjs build`; `dist/` becomes its own git repo pushed to `bhanu3447/javaHtml`. To drop the old public history (the lessons are in it), **delete and recreate** the public repo (force-push alone leaves old commits reachable by SHA for a while), push `dist/`, enable Pages (main, root). Forks/clones others already made cannot be recalled.
7. Admin page: approve yourself a test person, register at `login.html#register`, request a course, approve it.

## Workflow after it is live
New or changed lesson: edit as always → `node scripts/lock.mjs upload` (locked files) and, if public files or the list of pages changed, `node scripts/lock.mjs build` + push `dist/`. Deleting a page does not delete it from the bucket (remove it in Supabase Storage).

## Limits / not done
- Free tiers: Supabase pauses after ~7 idle days (Restore button); Render's free service sleeps after ~15 idle minutes (first check ~1 min). Hugging Face was dropped on 2026-10-28: compute Spaces now need PRO.
- Face server tested locally 2026-10-28 (Node 24, onnxruntime-node 1.19.2): obama/obama2/obama_small 0.71–0.97 similarity, biden ≈ 0, two-face photo rejected, ~150 ms per image, ~166 MB RAM. Not tested on Render itself yet.
- No liveness/anti-spoofing check (a printed photo of the approved person could pass); the owner still approves every course. InsightFace's buffalo models are licensed for non-commercial research use only.
- The edge functions are untested until the project exists (Deno, supabase-js 2.45.4).
- No password reset page yet; no "delete user" button (remove in Supabase → Authentication → Users).
