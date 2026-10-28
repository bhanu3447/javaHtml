# Project notes — Java: Zero to Advanced (interview-prep course)

This file loads every session, so it stays short (**keep it under ~10k characters**). Everything else is read on demand:
- `KB.md`: small index of the knowledge base.
- `kb/lesson-NN-*.md`: the full text of each lesson (source of truth for lesson content).
- `kb/site-internals.md`: how every engine widget and script works (editors, suggestions, themes, layout, motion, localStorage keys, figures), the testing recipes, and the full change log. **Read the relevant part before changing a widget.**
- `kb/appendix-effects.md`: mascot, tree, weather, rider, fire, ghosts, festivals.

After any change: update the right `kb/` file and add one line to the change log below (move older lines to `kb/site-internals.md`).

## The restart (2026-10-24)
The user restarted the Java course from scratch ("remove everything in the java, keep one backup, will start from scratch: what is strings, from there I will tell"). **The whole v1 course is in `archive/java-v1/`** (8 lesson pages, practice page, 5 lab scripts, practice-tools.js, quizzes, lesson notes, practice-layer and course-tools notes; README inside) and in git commit `2b1d8df`. Nothing loads it. **New lessons are built one concept at a time, in the order the user asks**, starting with Lesson 01 "What is a String?". Reuse ideas and code from the backup freely (grep it first) but every lesson is written fresh and read-checked by the user before the next topic.

## Keep Claude usage low
- Never read a whole big file. Grep first (`grep -n "^## " kb/lesson-01-strings.md`), then Read with offset/limit.
- Never read or grep `assets/models/` (22 MB of base64 3D models; reads are denied in `.claude/settings.json`).
- Only open `assets/js/effects.js` when the task is about an effect. Lesson work touches only that lesson's `kb/` file, page and labs file.
- Prefer small, scoped sessions; the user can `/clear` between tasks.

## What it is
A multi-page static site, no build step (opens from `file://`; the folder is in OneDrive, so no `node_modules`). Live at https://bhanu3447.github.io/javaHtml/ (repo `bhanu3447/javaHtml`, branch `main`, GitHub Pages from root; `.nojekyll` is required). **Folders:** `index.html` hub → `java/`, `sql/`, `spring/` and `patterns/` courses; shared `assets/` (`css/ js/ labs/ data/ models/`); `kb/` notes; `scripts/`; `archive/` (old, unreferenced files).

| File | Role |
|---|---|
| `java/index.html` | Java home: hero, live code window, lesson cards with progress (`.lcard data-l="lNN"`; planned ones are `.lcard.soon`), 10-level roadmap. |
| `java/lessons/NN-name.html` | One page per lesson. Since the restart: `00-foundations` (what Java is, JDK/JRE/JVM, stack/heap/Metaspace, primitive vs reference; HTML/CSS figures `l0-`, no labs file), `01-strings` (What is a String, where it lives, the SCP, the String methods playground `#smPlay`), `02-classes-objects` (What is a Class and an Object?). |
| `assets/css/course.css` | All styles (blocks marked `/* name vNN */`). |
| `assets/data/course-index.js` | **Generated** by `node scripts/build-index.mjs` (`window.COURSE = {pages, qa}`). |
| `assets/data/quiz-data.js` | `QZ.lNN` quizzes and `RC.lNN` recall prompts (after `/* @quiz-data */`); currently only the SQL set `QZ.s00`/`RC.s00`. |
| `assets/js/course.js` | Core: helpers (`$ $$ esc store hl FX THM`…), editors + suggestions, sidebar, learning layer (quiz, recall, progress), themes, palette, motion, learn layer, hero code window. Still contains the v1 lesson widgets (Lessons 01–04 steppers etc.); they do nothing when their DOM is absent. |
| `assets/js/effects.js` | Decorations: rider, tree, mascot, weather, sky, Halloween, festivals. **Paused by default** (user's choice, 2026-10-23): runs only when `js1-fx` = "1" (`FX_ON` in course.js; nav ✨ button / Ctrl+K, reloads); it exports `RIDER WX HALLOWEEN FEST` on window, so code elsewhere must check `FX_ON` before using them. The ∞ background is also off unless effects are on. |
| `java/playground.html` | **Java Visual Playground**: ▶ Visualize steps through any program (stack, heap, pool, arrows). Notes: `kb/playground.md`. |
| `assets/js/jvm-lite.js` | Playground Java interpreter + step recorder (no DOM), `window.JVML`. After any change rerun the 70-program comparison (`kb/playground.md`). |
| `assets/js/playground.js` | The Playground UI (`pg-` classes, test hook `window.PGV`; `PG` is taken by course.js). |
| `assets/js/run-java.js` | **▶ Run on every Java editor**: real JDK 22 via Wandbox (free API, CORS, ~10–20 s, needs internet). Details in `kb/site-internals.md`. |
| `assets/labs/labs-*.js` | Interactive labs. Java labs are added per lesson as needed (one file per lesson with many labs, e.g. `labs-strings.js`, class prefix unique per file). |
| `sql/index.html`, `sql/NN-name.html` | **The SQL course** (`body data-course="sql"`; `00-foundations` live, S01–S10 planned: `kb/sql-course-plan.md`). SQL pages load `sql-index, quiz-data, course, effects, sql-seed, labs-sql` only. |
| `assets/data/sql-index.js` | **Generated** by `node scripts/build-index.mjs sql`. |
| `assets/data/sql-seed.js` | The one database every SQL lesson uses (car dealership, 6 tables, 59 rows; facts in its header comment). |
| `assets/labs/labs-sql.js` | SQL kit (`SQ.ready/run/grid/editor/stepper`; sql.js 1.13.0 from cdnjs; `<script type="text/x-sql" data-auto>` → editor with ▶ Run) + S00 labs (`sq-` classes). |
| `spring/index.html` | **Spring Boot lab**, third course (`data-course="spring"`; index: `node scripts/build-index.mjs spring`). Lab CSS scoped under `.spl`, script in an IIFE. Notes: `kb/spring-annotations-lab.md`. |
| `patterns/index.html`, `patterns/NN-name.html` | **Design Patterns for Interviews**, fourth course (`data-course="patterns"`, keys `pNN`; index: `node scripts/build-index.mjs patterns` → `patterns-index.js`). Lab kit `assets/labs/labs-patterns.js` (`DPL`, `dp-` classes; labs are data only) + one data file per lesson `labs-patterns-pNN.js`. P00 live; plan and phases: `kb/design-patterns-plan.md`; kit format: `kb/patterns-00-foundations.md`. |
| `index.html` | **The hub**: the single entry page listing every course. Self-contained, loads no course script. New course = new folder + a card here. |

Every Java page loads, in this order: `course-index, quiz-data, course, effects, [labs-<lesson>…], run-java` (classic scripts sharing one global scope: never reuse a top-level name across files). **Don't create other files** (no backups or `-v2` copies). A new lesson = `kb/lesson-NN-name.md` + `java/lessons/NN-name.html` (+ a `labs-*.js` only if it has many labs).

## Adding a lesson
Skeleton: `<body data-page="l01" data-name="Lesson 01 · …" data-short="L01">`, the nav from `java/index.html` (brand links to `../index.html`), `header#top.ph`, `.band#id`, `<section id="…"><span class="num">N</span><h2>…</h2>`, footer, the script tags above (`../../assets/…`). The v1 pages in `archive/java-v1/java/lessons/` are the reference for the markup of quizzes (`.quiz`), recall prompts, interview cards (`<details class="d"><summary><span class="q">…`), takeaways, analogies and labs. Section ids are unique across the course. Add `QZ.lNN`/`RC.lNN` to `quiz-data.js`, a `.lcard data-l="lNN"` on the home page (replace the `.soon` placeholder), a row in `KB.md`, then run `node scripts/build-index.mjs`. Each lesson gets: a band, quiz (labelled B/I/A), recall prompts, interview cards, takeaways, **an interactive visual lab per concept and one memorable real-world analogy** (the car story is the course-wide metaphor).

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
- Learns one topic at a time and rates each lesson (Feedback section) before the next topic.
- **Add everything in learning order** (user, 2026-10-25: "whenever adding something, add in order; first is what class and object"). A new topic, section, term or example goes where its prerequisites are already explained; a term the reader has not met yet (stack, heap, Metaspace, object, reference…) is defined on the spot, before any figure or code uses it. The lesson order itself stays as it is (the user chose not to swap Lessons 01/02), but new lessons are placed by prerequisites, not by when they were written.

## Checking changes (Windows; no Python; JDK 25 installed)
- `node --check assets/<file>.js` for syntax.
- Headless Chrome: `%LOCALAPPDATA%/Google/Chrome/Application/chrome.exe --headless=new --allow-file-access-from-files --user-data-dir=<fresh> --virtual-time-budget=8000 --dump-dom file:///<long path>`; inject a test script before `</body>` that writes results into a `<pre>`. Test files go in the scratchpad. Full recipes: `kb/site-internals.md` → "Checking changes".
- Write files containing backslashes with the Write tool, not Bash heredocs or `node -e` (the Bash tool mangles `\`; a heredoc holding one fails with "unexpected EOF").

## Change log (recent; older entries in `kb/site-internals.md`)
- 2026-10-28: **Design Patterns, phases A–C**: final plan (five moves, 4 levels, one page per pattern `NN-slug.html`, `kb/design-patterns-plan.md`); kit v2 (Refactor add/del/meter, Sequence view, Playground, Predict, Explain it back, glyphs, home map + catalogue; documented in `kb/patterns-00-foundations.md`); P00 +3 sections; 01 Strategy and 03 State done; 02 Template Method built but its quiz/notes/checks unfinished.
