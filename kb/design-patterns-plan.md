# Design Patterns course — final plan (merged 2026-10-28)

**Status (2026-10-28):** phases A, B and C done and pushed: plan, kit v2, P00 (16 sections), **01 Strategy, 02 Template Method, 03 State** (Move 1 · Swap complete). Move 2 · Create in progress: 04 Factory Method, 05 Builder, Move 2 complete (04–08 live). Next: Move 3 · Wrap, starting with 09 Adapter (then, 06 Singleton, 07 Prototype, 08 Abstract Factory). **After each move: stop, report, wait for the user's rating** (user, 2026-10-28).

## How to continue (any session, any Claude account, any machine)
Everything needed is in the repo; nothing depends on a previous conversation.
1. Read `CLAUDE.md` (loads automatically), then this plan, then `kb/patterns-page-brief.md` (the step-by-step brief for ONE pattern page).
2. Build one pattern per session: "Build pattern 04 Factory Method following kb/patterns-page-brief.md". Reference pages: `patterns/01-strategy.html`, `02-template-method.html`, `03-state.html` and their `assets/labs/labs-patterns-pNN.js`; widget examples: `scripts/dp-checks/kit-example.html`.
3. Checks are in `scripts/dp-checks/` (run.sh + dptest.js / widgets.js / contrast.js, gx.sh gallery, shot.sh, dpmatch.js, javacheck.sh, qmerge.js). They need Node, a JDK (25) and Chrome; on a non-Windows machine set `CHROME=/path/to/chrome`.
4. Finish: merge the quiz with `node scripts/dp-checks/qmerge.js lesson <quiz.js>`, `node scripts/build-index.mjs patterns`, `KB.md` row, change-log line in `CLAUDE.md`, update the status line above, commit and push (`main` deploys to GitHub Pages).
5. Cheapest: one page per session, `/clear` between pages, Sonnet for building and Opus for review; measured cost on Move 1 was about 200k tokens per pattern page when built by one agent.

| # | Pattern | Status |
|---|---|---|
| 00 | Foundations | live |
| 01–03 | Strategy, Template Method, State | live |
| 04 | Factory Method | live (built by one Sonnet agent, about 160k tokens) |
| 05 | Builder | live |
| 06 | Singleton | live |
| 07 | Prototype | live |
| 08 | Abstract Factory | live (Move 2 complete) |
| 09–13 | Adapter, Decorator, Proxy, Facade, Bridge | next (Move 3) |
| 14–18 | Observer, Command, Chain of Responsibility, Mediator, Memento | planned |
| 19–23 | Composite, Iterator, Visitor, Interpreter, Flyweight | planned |
| 24–26 | Integration, Capstone, Interview | planned |

History: first plan by interview tier (2026-10-28) → reviewed as "partly a good learning curve" (Singleton first, tiers split related ideas, no refactor step, one depth, late practice, no modern Java) → revised into five moves and four levels → the user wrote a master prompt ("Build a Complete Visual Java Design Patterns Course — Beginner to Expert") → reviewed (prerequisite order in TALK/WRAP, approval checkpoints, page structure, project constraints, what can and cannot run) → merged here. "merge and start, use multiple agents if needed".

## Goal
A beginner who knows basic Java becomes able to **explain, choose, code and defend** all 23 GoF patterns. Not definitions: why each exists, seeing it work, building it from a painful version, choosing between look-alikes, applying it in a Java backend. Every visual teaches; nothing is decorative; no control without working behaviour; no progress shown that is not real.

## Project constraints (break these and the site breaks)
- Static site, no build step, opens from `file://`, folder in OneDrive: no `node_modules`, no frameworks, CDN libraries only. Plain HTML + `assets/css/course.css` + classic scripts sharing one global scope (never reuse a top-level name across files).
- Pages load in order: `patterns-index.js, quiz-data.js, course.js, effects.js, labs-patterns.js, labs-patterns-pNN.js, run-java.js`. Lab data files are data only (plus small pure functions for Playgrounds); classes and ids are prefixed `dp-`.
- Every Java program runs on **JDK 25** (`java File.java`) before it goes in; output in comments; editors are `<script type="text/x-java" data-file="X.java" data-hl="…">` (CodeMirror + ▶ Run via Wandbox, needs internet). Never `</script>` or `${` inside quiz strings; quiz explanation classes `qok`/`qno`.
- Spring code cannot run here: shown as read-only `<pre><code>` marked "Spring · not runnable here", only real class/annotation names, conceptual sketches labelled as such.
- Tests in the capstone are plain `main` programs printing PASS/FAIL (no JUnit/Maven here).
- Shared files are edited **only by the lead**: `course.css`, `course.js`, `quiz-data.js`, `labs-patterns.js`, `patterns/index.html`, hub `index.html`, `KB.md`, `CLAUDE.md`, this plan. Agents write their own page, their own data file, their own `kb/patterns-NN-*.md`, and hand quiz/recall data and CSS needs back as files in a temp folder outside the project (TMP, see kb/patterns-page-brief.md).
- Checks (there is no lint or unit-test suite): `node --check` on JS; `node scripts/build-index.mjs patterns`; JDK 25 on every program; headless Chrome: geometry/controls (`dptest.js`), state gallery in light and dark, contrast in nine themes, console errors, no horizontal scroll at 500 px; reduced motion; keyboard ← → Space on labs.
- Prose under ~250 words per section outside `<details class="d">`. A term is defined before any figure or code uses it. Glossary terms link to P00.
- One running story: **the car dealership** (payments, notifications, caching, orders all happen inside it).

## Learning path: five moves, GoF family kept in the catalogue
| # | Page | Pattern | GoF family | Move | Interview tier |
|---|---|---|---|---|---|
| 00 | `00-foundations.html` | Foundations and SOLID (+ dispatch, lambdas, first refactor) | | | |
| 01 | `01-strategy.html` | Strategy | Behavioral | Swap | ★ |
| 02 | `02-template-method.html` | Template Method | Behavioral | Swap | ★ |
| 03 | `03-state.html` | State | Behavioral | Swap | ★ |
| 04 | `04-factory-method.html` | Factory Method (Simple Factory as a non-GoF stepping stone) | Creational | Create | ★ |
| 05 | `05-builder.html` | Builder | Creational | Create | ★ |
| 06 | `06-singleton.html` | Singleton (purpose; thread safety in 24) | Creational | Create | ★ |
| 07 | `07-prototype.html` | Prototype | Creational | Create | ◆ |
| 08 | `08-abstract-factory.html` | Abstract Factory | Creational | Create | ◆ |
| 09 | `09-adapter.html` | Adapter | Structural | Wrap | ★ |
| 10 | `10-decorator.html` | Decorator | Structural | Wrap | ★ |
| 11 | `11-proxy.html` | Proxy | Structural | Wrap | ★ |
| 12 | `12-facade.html` | Facade | Structural | Wrap | ★ |
| 13 | `13-bridge.html` | Bridge (taught as Adapter vs Bridge) | Structural | Wrap | ○ |
| 14 | `14-observer.html` | Observer | Behavioral | Talk | ★ |
| 15 | `15-command.html` | Command | Behavioral | Talk | ★ |
| 16 | `16-chain-of-responsibility.html` | Chain of Responsibility | Behavioral | Talk | ★ |
| 17 | `17-mediator.html` | Mediator | Behavioral | Talk | ○ |
| 18 | `18-memento.html` | Memento (after Command's undo) | Behavioral | Talk | ○ |
| 19 | `19-composite.html` | Composite | Structural | Compose | ◆ |
| 20 | `20-iterator.html` | Iterator | Behavioral | Compose | ◆ |
| 21 | `21-visitor.html` | Visitor (after Composite) | Behavioral | Compose | ○ |
| 22 | `22-interpreter.html` | Interpreter (a Composite of expressions) | Behavioral | Compose | ○ |
| 23 | `23-flyweight.html` | Flyweight | Structural | Compose | ○ |
| 24 | `24-integration.html` | Advanced integration: all 23 by GoF family, combinations, JDK/Spring internals, DI and extension points, thread-safe Singleton (DCL, `volatile`, holder, enum; reflection/serialization/cloning), modern Java, testing, anti-patterns, refactoring to patterns, when simple beats a pattern | | | |
| 25 | `25-capstone.html` | Dealership app, eight change requests | | | |
| 26 | `26-interview.html` | Look-alikes, "which pattern?" drill, code-reading and refactoring questions, LLD exercises, mock interviews with follow-ups, one-week fast track | | | |

Moves: **Swap** replace behaviour without rewriting the client · **Create** control how objects are made · **Wrap** compatibility, extra responsibilities, controlled access · **Talk** communication, requests, responsibilities · **Compose** structures of many objects. 3 + 5 + 5 + 5 + 5 = 23; each pattern appears exactly once in the tracker; later mentions link back. Page key = `pNN` (`data-page`), `data-short="PNN"`, `data-name="PNN · Name"`.

## Every pattern page: 7 sections, 4 levels, the 22 items of the master prompt
Section ids use the pattern's 3-letter prefix (`stg` Strategy, `tpl` Template Method, `sta` State, `fac`, `bld`, `sgl`, `pro`, `abf`, `adp`, `dec`, `prx`, `fcd`, `brg`, `obs`, `cmd`, `cor`, `med`, `mem`, `cmp`, `itr`, `vis`, `int`, `fly`). Band id `#pNN`.

| § | id | Level | Contains (master-prompt items) |
|---|---|---|---|
| 01 | `xxx-see` | 1 · See it | `DPL.header` block; one-line intent (1); the real problem (2); everyday analogy mapped to software (3, table "analogy → class"); **Pain lab** (4, 6): the problem as a diagram getting worse as change requests arrive, with the "places to edit" meter. Every arrow, box and relationship explained in the step text. No jargon left undefined. |
| 02 | `xxx-build` | 2 · Build it | Before code, runnable (5); what breaks (6); **Refactor lab** (7): 4–7 small steps, code and diagram change together, added lines green, removed lines struck, each step says *why*; final code, runnable, with output (8). |
| 03 | `xxx-run` | 2 · Watch it run | **Runtime lab** (Sequence view) (9): object creation, calls, returns, and how execution reaches each output line; **Playground** (driven by the reader). |
| 04 | `xxx-practise` | 2 · Practise | Beginner exercise with hints and solution (17), intermediate exercise (18), **Explain it back**. |
| 05 | `xxx-choose` | 3 · Choose it | **Structure lab** (UML, two tabs: Roles / Dealership); when to use (12), when not + simpler alternative (13); comparison with look-alikes (14, table); trade-offs (15); backend application (11); JDK/Spring connection, verified names (16); **Spot it** predict widget. |
| 06 | `xxx-master` | 4 · Master it | Modern Java alternative, runnable (10); advanced details (concurrency/performance only where relevant); common mistakes; advanced scenario as a **Predict** widget (19); patterns it cooperates with. |
| 07 | `xxx-review` | Interview + review | 30-second answer, deeper answer, follow-ups as interview cards (20); **revision card** (21); quiz `QZ.pNN` B/I/A (22), recall `RC.pNN`, feedback. |

A beginner can stop after § 04 of every pattern and has a complete beginner course; §§ 05–06 add depth without changing §§ 01–04.

## Visual language
- **Moves** have one colour token each (`--mv-swap`, `--mv-create`, `--mv-wrap`, `--mv-talk`, `--mv-compose`) defined for light and dark, passing contrast in nine themes; GoF family shown as text chips.
- **Glyph per pattern** (`DPL.GLYPH`, 48×48 SVG, `currentColor`): Strategy socket with swappable plugs · Template Method form with blanks · State traffic light · Factory Method machine with an order slot · Builder parts snapping onto a frame · Singleton one key on a hook · Prototype photocopier · Abstract Factory set of matching machines · Adapter plug converter · Decorator onion rings · Proxy guard at a door · Facade front desk · Bridge two dials · Observer broadcaster with listeners · Command ticket · Chain linked hands passing a note · Mediator control tower · Memento camera snapshot · Composite tree · Iterator cursor along a shelf · Visitor inspector touring rooms · Interpreter parse tree · Flyweight shared stamp.
- **Motion meanings:** a highlighted arrow = a call happening now; a box appearing = `new`; green = good/added, red = bad/removed; dashed outline = interface; dimmed = not involved in this step.
- **Diagrams match code:** every class box name in a pattern's Structure and Refactor labs appears in that page's final code (checked by `dpmatch.js`).
- **Pattern map + catalogue** on the course home: 23 glyph cards by move, real progress from "Mark as understood" (`js1-done`), filters (GoF family, move, tier, level), search, related/confused-with highlighting.

## Kit additions (phase B, in `labs-patterns.js`; documented in `kb/patterns-00-foundations.md` → Kit)
1. Step fields `add`, `del` (substrings → green / struck lines) and `meter:[label, value, max]` (the "places to edit" bar). Used by Pain and Refactor labs.
2. **Sequence view**: `view.seq = {lanes:[[id, title, sub]], msgs:[[from, to, label, kind]]}` (kind `call` | `ret` | `new` | `self`); steps use `upto` (messages shown) and `cur` (message index highlighted). Same controls, keyboard and checks as other views.
3. **Playground**: `DPL.play({key:{pill, init(), controls:[{id, type:'select'|'toggle'|'button', label, options}], act?(state, id), render(state) → {h, nodes, edges, on, good, bad, lines, out, log}}})` into `<div class="dp-play" id="dpp-KEY">`. Reset button; output `aria-live`.
4. `DPL.header(host)` for `<div class="dp-pat" data-p="Strategy">`: glyph, name, GoF family, move, tier, one-line intent, related / confused-with links.
5. Widgets bound by markup: **Predict** `<div class="dp-pred" data-ans="1">` (question, option buttons, explanation revealed after a choice); **Explain it back** `<div class="dp-xb" data-k="p01">` (textarea, model answer, got it / almost / not yet stored in `js1-dpxb`); **revision card** `.dp-rev`; **level chip** `.dp-lv.l1…l4` in each `h2`'s preceding tag.
6. `DPL.catalog(host)` and `DPL.map(host)` for the course home; `CATALOG` rows carry `{n, key, file, fam, move, tier, p (dealership problem), i (intent), rel:[], conf:[]}`.

## Capstone (25): the dealership app, eight change requests
discounts → Strategy · creating cars → Factory Method + Builder · add-ons → Decorator · legacy payment gateway → Adapter · checkout → Facade · order lifecycle → State · price alerts → Observer · workshop jobs with undo → Command + Memento. For each: requirement, existing code, the problem, "think first" Predict, refactor (Refactor view), updated class + sequence diagram, PASS/FAIL test program, alternatives and trade-offs, architecture after the change. A pattern appears only where the requirement justifies it.

## Phases and agents
| Phase | Work | Who |
|---|---|---|
| A | inspect, this plan | lead (done) |
| B | kit additions, CSS, CATALOG, home catalogue + map, P00 additions (dispatch, lambdas/anonymous classes/method references, first refactor exercise; fix stale lesson references) | lead (kit, shared files) + 1 agent (P00) + 1 agent (glyphs) |
| C | Move 1 · Swap: 01 Strategy, 02 Template Method, 03 State | 3 agents in parallel (one page each) + 1 QA agent; lead integrates |
| D1–D4 | Create (5) · Wrap (5) · Talk (5) · Compose (5): one move per session | ≤ 5 agents per move + QA |
| E | 24 integration + 25 capstone | 2 agents + QA |
| F | 26 interview, fast track, final quality gate across the course | 1 agent + QA; lead runs the full gate |

The user rates after every phase from C on. Never claim an agent ran unless it did.

## Acceptance per pattern
All 7 sections with the items above; Pain, Refactor, Runtime (sequence) and Structure labs; a Playground; Predict + Spot it + Explain it back; every program run on JDK 25 with outputs in comments; Spring snippets marked not runnable; `dpmatch.js` green; `dptest.js` 0 findings at 1280 and 500 px; gallery reviewed light + dark; contrast 0 failures in nine themes; no console errors; quiz (≥ 10, B/I/A) and recall (3 per day) merged; `kb/patterns-NN-name.md`; `KB.md` row; change-log line; index rebuilt.

## Final quality gate (phase F)
All 23 in the tracker, correctly classified; every pattern has the 4 levels and the visual sequence; diagrams match code; all programs run; exercises, predicts, explain-back, quizzes, playgrounds, filters, map and progress work; desktop and 500 px usable; reduced motion; no regressions on the Java, SQL and Spring pages; report per pattern: which items exist and pass.
