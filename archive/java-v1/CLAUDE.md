# Project notes — Java: Zero to Advanced (interview-prep course)

This file loads every session, so it stays short (**keep it under ~10k characters**). Everything else is read on demand:
- `KB.md`: small index of the knowledge base.
- `kb/lesson-NN-*.md`: the full text of each lesson (source of truth for lesson content).
- `kb/practice-layer.md` (quizzes, recall prompts, interview cards, takeaways), `kb/course-tools.md` (mock interview, Big-O sheet, Watch it run, analogy layer, learn layer), `kb/appendix-effects.md` (mascot, tree, weather, rider, fire, ghosts, festivals).
- `kb/site-internals.md`: detailed notes per lesson page, how every widget and script works (editors, suggestions, themes, layout, motion, localStorage keys, figures), the testing recipes, and the full change log. **Read the relevant part before changing a widget.**

After any change: update the right `kb/` file and add one line to the change log below (move older lines to `kb/site-internals.md`).

## Keep Claude usage low
- Never read a whole big file. Grep first (`grep -n "^## " kb/lesson-05-oop.md`, `grep -n "^/\* " assets/labs/labs-sorting.js`), then Read with offset/limit.
- Never read or grep `assets/models/` (22 MB of base64 3D models; reads are denied in `.claude/settings.json`).
- Only open `assets/js/effects.js` when the task is about an effect. Lesson work touches only that lesson's `kb/` file, page and labs file.
- Prefer small, scoped sessions; the user can `/clear` between tasks.

## What it is
A multi-page static site, no build step (opens from `file://`; the folder is in OneDrive, so no `node_modules`). Lessons 00–07 are done; roadmap of 10 levels in the hero. Live at https://bhanu3447.github.io/javaHtml/ (repo `bhanu3447/javaHtml`, branch `main`, GitHub Pages from root; `.nojekyll` is required). **Folders:** `index.html` hub → `java/` and `sql/` courses; shared `assets/` (`css/ js/ labs/ data/ models/`); `kb/` notes; `scripts/`; `archive/` (old, unreferenced files).

| File | Role |
|---|---|
| `java/index.html` | Home: hero, live code window, lesson cards with progress, roadmap. |
| `java/lessons/NN-name.html` | One page per lesson: `00-foundations 01-strings 02-string-internals 03-string-problems 04-arrays 05-oop 06-bubble-sort 07-collections`. |
| `java/practice.html` | Playground, Mock interview, Big-O sheet, Revise, Feedback, Memory Lab, Algorithm race. |
| `assets/css/course.css` | All styles (blocks marked `/* name vNN */`). |
| `assets/data/course-index.js` | **Generated** by `node scripts/build-index.mjs` (`window.COURSE = {pages, qa}`). |
| `assets/data/quiz-data.js` | `QZ.lNN` quizzes and `RC.lNN` recall prompts (after `/* @quiz-data */`). |
| `assets/js/course.js` | Core: helpers (`$ $$ esc store hl FX THM`…), editors + suggestions, Lessons 01–04 widgets, sidebar, learning layer, themes, palette, motion, learn layer. |
| `assets/js/effects.js` | Decorations: rider, tree, mascot, weather, sky, Halloween, festivals. **Paused by default** (user's choice, 2026-10-23): the file runs only when `js1-fx` = "1" (`FX_ON` in course.js; nav ✨ button / Ctrl+K, reloads); it exports `RIDER WX HALLOWEEN FEST` on window, so code elsewhere must check `FX_ON` before using them. The ∞ background is also off unless effects are on. |
| `assets/labs/labs-oop.js`, `labs-collections.js`, `labs-analogy.js`, `labs-sorting.js`, `labs-foundations.js` | Interactive labs for Lessons 05, 07, analogies, 06, 00 (classes `ol- cl- an- bs- fd-`). |
| `assets/js/practice-tools.js` | Memory Lab interpreter + UI, Algorithm race. |
| `assets/js/run-java.js` | **▶ Run on every Java editor + Playground**: real JDK 22 via Wandbox (free API, CORS, ~10–20 s, needs internet). Details in `kb/site-internals.md`. |
| `sql/index.html`, `sql/NN-name.html` | **The SQL course** (`body data-course="sql"`; `00-foundations` live, S01–S10 planned: `kb/sql-course-plan.md`). SQL pages load `sql-index, quiz-data, course, effects, sql-seed, labs-sql` only. |
| `assets/data/sql-index.js` | **Generated** by `node scripts/build-index.mjs sql`. |
| `assets/data/sql-seed.js` | The one database every SQL lesson uses (car dealership, 6 tables, 59 rows; facts in its header comment). |
| `assets/labs/labs-sql.js` | SQL kit (`SQ.ready/run/grid/editor/stepper`; sql.js 1.13.0 from cdnjs; `<script type="text/x-sql" data-auto>` → editor with ▶ Run) + S00 labs (`sq-` classes). |
| `index.html` | **The hub**: the single entry page listing every course (Java, SQL, future ones). Self-contained, loads no course script. New course = new folder + a card here. |

Every Java page loads, in this order: `course-index, quiz-data, course, effects, labs-oop, labs-collections, labs-analogy, labs-sorting, labs-foundations, practice-tools, run-java` (classic scripts sharing one global scope: never reuse a top-level name across files). **Don't create other files** (no backups or `-v2` copies). A new lesson = `kb/lesson-NN-name.md` + `java/lessons/NN-name.html` (+ a `labs-*.js` only if it has many labs).

## Adding a lesson
Copy an existing lesson page's skeleton (`<body data-page="l08" data-name="Lesson 08 · …" data-short="L08">`, nav, `header#top.ph`, `.band#id`, `<section id="…"><span class="num">N</span><h2>…</h2>`, footer, the script tags above). Section ids are unique across the course. Add `QZ.lNN`/`RC.lNN` to `quiz-data.js`, a `.lcard data-l="lNN"` on the home page, a row in `KB.md`, then run `node scripts/build-index.mjs`. Each lesson gets: a band, quiz (labelled B/I/A), recall prompts, interview cards, takeaways, **an interactive visual lab per concept and one memorable real-world analogy** (the car story is the course-wide metaphor). Next levels: 4 Exceptions and APIs → 5 Functional/modern Java → 7 Concurrency → 9 Spring → 10 Engineering.

## Rules that break things if forgotten
- Every Java program is run on JDK 25 (`java File.java`) before it goes in; outputs go in comments. Same file in the md and the HTML. Emoji output needs `-Dstdout.encoding=UTF-8`.
- Code blocks are `<script type="text/x-java" data-file="X.java" data-hl="7-9">…</script>`; JS turns them into CodeMirror 5.65.16 editors.
- Quiz/data strings: never `</script>` or `${` inside backtick strings. Quiz explanation classes are `qok`/`qno`.
- Don't use global short classes in new labs/figures (`.c .good .bad .empty`, and in SVG figures `.t .s .k .n .f .cm .hd`). Each figure needs its own marker prefix (see site-internals).
- localStorage is always wrapped in try/catch (keys `js1-*`). Checklist items are only ever appended.
- Every new animation honours `prefers-reduced-motion` (the ⏸ motion switch relies on it). Visuals keep `data-a="next|back|play"` buttons for the keyboard.
- Never draw or copy copyrighted characters. Removed at the user's request, don't bring back: right rail, greeting card, Tom & Jerry, werewolf, chain catch, Avengers background.

## User preferences
- Do things directly with sensible defaults; little back-and-forth.
- Record content, features and decisions in the `kb/` files.
- Polished, modern "world-class" UI (Stripe/Linear/Vercel level), dark code editors; change presentation only and keep every tool working.
- Wants **visual animation** built, not extra settings, cards or panels. Keep the tree natural.
- Rates each lesson (Feedback section) before the next topic.

## Checking changes (Windows; no Python; JDK 25 installed)
- `node --check assets/<file>.js` for syntax.
- Headless Chrome: `%LOCALAPPDATA%/Google/Chrome/Application/chrome.exe --headless=new --allow-file-access-from-files --user-data-dir=<fresh> --virtual-time-budget=8000 --dump-dom file:///<long path>`; inject a test script before `</body>` that writes results into a `<pre>`. Test files go in the scratchpad. Full recipes: `kb/site-internals.md` → "Checking changes".
- Write files containing `\\` with the Write tool, not Bash heredocs or `node -e`.

## Change log (recent; older entries in `kb/site-internals.md`)
- 2026-10-24: **Responsive v40** (user: "all screen sizes responsive and great"). CSS block `/* responsive v40 */` at the end of `course.css` (parts: base, chrome, content, tools, labs-a, labs-b) + small fixes in `labs-analogy.js`, `labs-collections.js`, `labs-sorting.js`, hub `index.html`. Audited all 13 pages at 18 viewports (320×568 → 3440×1440, phones emulated as touch) with the scratchpad CDP tool `rz.mjs`: sideways scroll 6→0, breakouts 15→0, clipped text 205→0, spill 23→0, tiny figure text 52→0, tap-target fails 174→50 (remaining: dense lab cells / inline terms), 0 JS errors. One-row nav at every width, wrapping sidebar titles, wider sidebar + fluid type/column on ≥1600/1920/2400, long code tokens wrap, scroll shadows on tables/figures/code, responsive roadmap, editor bars that adapt to editor width, 44 px touch controls.
- 2026-10-24: **UX pass v39** (user: "buttons and content size ui/ux level anything we can change better, act as professional, enable prompt"). Prompt + findings: `kb/ux-pass-plan.md`. Reading measure (72ch prose, full-width visuals), body 17 px on desktop, button system sm 32 / md 38 / lg 46 with 44 px touch targets, one focus ring, skip link (course.js), 48 px quiz options, 14 px editors, 14 px-radius details/notes, masked nav strip, tighter phone rhythm (16 px gutters, stacked CTAs). Details in `kb/site-internals.md`.
- 2026-10-24: **UI polish v38 + theme-wise colour audit** (user: "dropdown and other styling… button also looks very cheap"; "whole styling and colour code properly check… theme-wise… enable the best prompt and use that"). The prompt is `kb/style-audit-plan.md` (rules, method, acceptance, findings). Automated WCAG contrast audit of all 13 pages × 9 themes (scratchpad `audit-gen.mjs`): baseline 10–33 failing element kinds per page, almost all token-level. Fixed in `course.css`: accessible light/nord/dracula/forest/sunset/ocean/sepia tokens, new per-theme **fill tokens** `--accent-fill --accent-2-fill --good-fill --bad-fill --amber-fill` for every white-on-colour chip/button/badge, `--hi` inset highlight, brighter `--code-dim`/comments/gutters, planned SQL cards dashed instead of faded. **Nav**: stroke-icon set `ICO`/`navIcon` in course.js replaces emoji glyphs; 32 px ghost icon buttons; `#cmdBtn` search pill. **Course menu `.csw`** replaces the native select (`COURSES` array; button "Java ▾" → styled menu with course rows + "Course hub"; keyboard + click-outside; same control inline in the hub). `.btn`/`.btn.pri`/`.btn.ghost`/`.chip` restyled (raised neutral, vertical accent-fill primary, soft selected chips). Final audit: see the plan file. 13 pages no JS errors, 0 overflow at 480 px. Details: `kb/site-internals.md` change log.
- 2026-10-23: **Files sorted + one hub page** (user: "properly sort all the files… single html inside that I need all java, sql, anything in future; I will change the html names if needed"). `index.html` = the hub listing every course (self-contained, no course script, Continue button from `js1-course`); `java/` (`index.html` was Java.html, `practice.html`, `lessons/`); `sql/` (`index.html` was Sql.html, `NN-*.html`); `assets/css|js|labs|data|models`; `archive/Java-Interview-Playbook.html` (old single-file site, unreferenced). `ROOT` in course.js is `../..` of the script (the site root); the index files hold `java/…` and `sql/…` paths; `build-index.mjs` updated. Old GitHub Pages deep links (`/Java.html`, `/lessons/…`) no longer exist. Tested: 13 pages headless, 0 JS errors, ROOT correct, every relative link resolves. **A new course** = `<name>/index.html` (+ `<name>/NN-*.html`) + a card in the hub + an index built by `build-index.mjs`. **Brand = dropdown** (user: "where java is showing there dropdown, if sql selected it should change"): `#courseSel` now sits right after the logo styled as the brand name (`nav .brand.sel` hides the text span; transparent, chevron, hover pill), picking SQL/Java opens that course; the hub has the same brand with "Courses ▾". Screenshots checked at 1100 and 420 px.
