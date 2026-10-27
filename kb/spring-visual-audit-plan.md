# Spring lab visual audit, state by state (the prompt)

Written 2026-10-27 at the user's request ("still issues are there when next clicking, proper visualization not there; whole document properly check; first make prompt, use that"). This prompt drives the audit of `spring/index.html`; findings and fixes are logged at the end.

## Goal
Every visual in the Spring Boot lab must be correct in **every state the reader can reach**, not only in its first frame: after each Next / Back / Play step, each scenario button, each toggle, each run. It must read correctly in light and dark themes (and stay legible in all nine) at desktop and phone widths, matching the look of the Java and SQL courses.

## What counts as a visual (the inventory)
| Visual | Root | States to reach |
|---|---|---|
| First run | `.hello` | before run, after ▶ Run (8 log lines, browser), each log line clicked |
| IoC lab | `#iocLab` | 6 steps |
| Bean lifecycle strip | `#life` | 5 phases |
| Proxy lab | `#proxyLab` | 7 steps |
| Bean scope | `.scope` | singleton, prototype, request |
| HTTP anatomy | `.anat` | 13 parts |
| Methods table | `.mtable` | 9 rows |
| Status codes | `#scDetail` | a code from each class 1xx–5xx |
| Pipeline | `#dispLab` | 7 steps + 7 exits |
| Flow layers | `.flow-shell` | 5 layers |
| Data morph | `#dmLab` | 6 shapes |
| Request map + simulator | `#rjMap`, `.sim` | 5 scenarios, every step |
| Transaction timeline | `#txLab` | 6 ok + 6 fail steps |
| Entity states | entity card | each action |
| N+1 | n1 card | loop, join |
| Reference modal | `#modal` | one card per group (map lit) |
| Stereotype tree | `.tree` | each node hovered |

## Rules (what "proper" means)
1. **One focus per state.** In every step exactly the things the caption talks about are highlighted (accent border or fill), everything else is visible but quieter. Nothing the caption mentions is hidden; nothing hidden by design (`.hide`) reappears by accident.
2. **Highlights survive the theme.** Active, good, bad and dim states are distinguishable in light and dark: active = `--accent`, success = `--good`, error = `--bad`, note = `--amber`, on a background that is not the same colour. No state that only works on a dark background.
3. **Geometry.** Labels fit inside their boxes (JetBrains Mono, 0.6 em per character); no two labels overlap; no box overlaps another unless it is a container; lines start and end on box edges; moving dots stop on a box edge or a line, inside the SVG.
4. **Text and code.** Captions and step titles match the picture of that step; code panels highlight the lines the step names; code panels stay dark in every theme.
5. **Contrast.** Lab text ≥ 4.5:1 (≥ 3:1 for large text and SVG labels ≥ 14 px bold) against its composited background, in all nine themes. Code areas are excluded (fixed dark palette).
6. **Layout.** No horizontal page scroll at 1280, 900 or 500 px; two-column labs stack below 900 px; nothing clipped.
7. **Controls.** Back is disabled on the first step and Next on the last; Play runs to the end and stops; the position label (`3 / 7`) matches.

## Method
1. **State gallery** (scratchpad `gallery.js`): for each visual, drive it through every state from the inventory and clone its root after each state into a gallery (frames labelled `lab · step n · caption`), hide the rest of the page, screenshot in light and dark at 1280 px, and phone (500 px) for the two-column labs. Review every frame against rules 1–4.
2. **Geometry check** (scratchpad `geo.js`): in every state, rule 3 by measurement (label fit, label/label overlap, box/box overlap, dot inside the SVG and within 6 px of a box or line).
3. **Contrast check** (scratchpad `contrast.js`): every text node in `.spl` outside code areas, composited background, all nine themes, in the default state and in each lab's most coloured state.
4. **Controls check**: rule 7 for every stepper.
5. Fix in `spring/index.html` (lab CSS under `.spl`, SVG markup, step data). Re-run 1–4 until clean; then the behaviour tests (`test-v4.js`, `fit.js`) and a console-error pass on every page of the site.

## Acceptance
- Gallery reviewed frame by frame in light and dark: no finding left open (accepted exceptions named below).
- Geometry and controls checks: 0 failures. Contrast: 0 failures outside code areas in all nine themes.
- Behaviour tests 42/42 at 1280 and 500 px, labels all fit, no console errors on any page.

## Findings and fixes
### Run 1 (2026-10-27)
Tools (scratchpad): `gallery.js` + `gx.sh` (state gallery: drives a visual through every state, clones it after each one, screenshots the frames two per row; the theme is preset in localStorage because the Auto theme re-applies itself every 60 s), `geo.js` (102 reachable states), `contrast.js` (nine themes; transitions switched off while measuring, because headless Chrome does not finish colour transitions when it is not painting), `fit.js`, `test-v4.js`.

| # | Finding (rule) | Fix |
|---|---|---|
| 1 | After Next, every box looked active: the theme migration had mapped near-white titles to the accent and grey-blue labels to full text (1) | Migration classifier: near-white → text, soft greys → muted, pale tinted text keeps its hue. Two states: `.on` = taking part so far (quiet accent outline), `.cur` = where the action is now (filled, glowing). `moveDot` sets `.cur` on the box the dot sits in; the proxy lab's first step focuses the proxy |
| 2 | Proxy lab: the dot sat on top of "begin transaction", "create()", "commit" (3) | Dot stops moved beside the line (x 196 in the proxy box, 414 in the real object, 556 on its right edge for the self-call) |
| 3 | Proxy lab: "this.audit() → no proxy" clipped at the right edge (3) | Centred under the real object |
| 4 | Pipeline: clicking an exit kept the last step's state (dot and highlight on "200 out") next to the red exit (1) | An exit now shows its stop in red (401/403 Filters, 404/405 HandlerMapping, 415/400 argument resolvers, 500 handler + advice, 406 converter), later stops dim, the dot moves there, caption "the request leaves the pipeline here with …"; stepping clears it |
| 5 | Transaction "fail" story said "only 1 left" but showed stock 5 and "left 3" (4) | Its own numbers: stock 1 → "left -1 (uncommitted)" → rollback "stock still 1" |
| 6 | Entity states: "persist / save" and "tx ends · detach" sat on their arrows and touched the Managed box (3) | Diagram widened to 600 × 200, labels centred in wider gaps |
| 7 | IoC: "needs UserService/UserRepository" drawn on the wire curves (3) | Labels start right of the curve (x 470, left-aligned) |
| 8 | Data morph: six cards in one row, ~150 px each, code broken mid-word, chips spilling into the next card (6) | Three per row (two below 560 px), words wrap at boundaries; unreached cards at 60 % instead of 45 % |
| 9 | Request map badges named the wrong thing ("@RestController" under DispatcherServlet, "UserResponse create" under @Valid) (4) | A badge shows only a real annotation, and only on a box where it works |
| 10 | Flow layers: nine items in a five-column grid (broken two-row layout) with a 720 px minimum width that clipped on phones (6) | Nine-column row; one column with downward arrows below 700 px |
| 11 | HTTP anatomy parts used theme colours on the always-dark message panel (light themes ≈ 3:1); the selected part had a light chip (5) | Parts use the fixed code palette; selected part = translucent dark chip; wrapped header lines left-aligned |
| 12 | Pale accents of sunset/nord/sepia as text (2.7–4.3:1) (5) | Lab-only "ink" tokens for text: the theme colour mixed toward `--text` (`--ink-accent --ink-2 --ink-amber --ink-good --ink-bad`), used for every `color`/`fill` that took a semantic colour |

Result: gallery reviewed in light and dark (proxy, IoC + lifecycle, pipeline + exits, transactions ok + fail, entity states, N+1, data morph, flow, stereotype tree, first run, HTTP anatomy, request map for get1, postBad, get99). Geometry and controls: 0 findings in 102 states (the same check finds 96 on the pre-audit page). Contrast: 0 failures in all nine themes; accepted exceptions: gradient text (`.grad` "Java", shared with the Java/SQL heroes) and the gradient `.btn.primary` (text `--bg` on `--accent`), which the checker cannot composite. Behaviour 42/42 at 1280, 900 and 500 px; all labels fit; no console errors on any page.

### Run 2 (2026-10-27, user screenshot of proxy step 5: "not understanding where the stage is")
| # | Finding | Fix |
|---|---|---|
| 13 | No lab said in the picture which step it shows; the caption sat beside the code | Every stepper gets a "STEP n / N · title" bar on top of its picture pane (`.stg-now`, written by `stepper()`) |
| 14 | Proxy diagram: the three proxy jobs were plain text lines, the two methods one box, the self-call a tiny curl on the box edge | Redrawn (`.pxsvg`, 640 × 390): proxy jobs are rows that go current → ✓ done; `create()` and `audit()` are separate boxes; step 5 draws a red arrow `this.audit()` from create() to audit() and the route through the proxy dashed with a red ✗; a transaction bar shows OPEN → "audit() also runs inside #1, REQUIRES_NEW ignored" (amber) → COMMIT ✓ (green); arrows have heads; state per step is explicit (no hit-testing) |

Checks after run 2: geometry 0 findings in 102 states, all labels fit, behaviour 42/42, contrast 0 non-gradient failures, no console errors.

### Run 3 (2026-10-28, user: "implement the visualization in a much more understandable way, this looks clumsy; are all annotations there?")
| # | Finding | Fix |
|---|---|---|
| 15 | Pipeline: seven 70-px stops in one row, seven exits under them, 10-px text | Top-to-bottom flowchart (`.dpsvg`, 560 × 470): each stop a wide row with a title and one-line job, its exits to the right in red, the advice box bottom right; the dot rides the current row; same ids and logic; clicking an exit writes "EXIT 415 · the request leaves at …" into the step bar |
| 16 | Request map: packet covered box titles, sub-labels on the box edge, no step number while running | Packet rides 8 px above the box; labels moved inward; caption shows "STEP n / N" plus the step text during a run |
| 17 | Annotation coverage: 13 common annotations missing | 12 cards added (87 cards): @Conditional, @CookieValue, @RequestPart, @Past / @Future, @Transient, @Lob, @Secured, @AutoConfigureMockMvc, @TestConfiguration, @Sql, @DirtiesContext, @ActiveProfiles (ResponseEntity is a class, not an annotation) |

Checks after run 3: behaviour 42/42 at 1280 and 500 px, all labels fit, geometry 0 findings in 102 states, contrast clean, every related link resolves, no console errors.

### Run 4 (2026-10-28, user: "in run request why next is not there, it goes fast, how will I understand")
| # | Finding | Fix |
|---|---|---|
| 18 | The simulator ran a request on a 620 ms timer with no way to pause or step | Stepped simulator: Start shows step 1; Back / Next move one step (map, code panel and log together); Auto plays at 2.2 s per step and toggles to Pause; the pill shows STEP n / N; the log shows one line per step, the current one highlighted and earlier ones faded; choosing another request resets. `run(k)` (test hook) jumps straight to the last step. Checked by scratchpad `simtest.js` (12 checks) |

### Run 5 (2026-10-28, user: "any annotations or concepts missed?" then "add all this")
Added nine concept labs (auto-configuration, filter vs interceptor, Spring Security 401/403, propagation, isolation, pagination, calling other services, Kafka, observability, OpenAPI) and 48 annotation cards. The label-fit estimate was tightened from 0.60 to 0.63 em after one label rendered clipped while passing; four near-misses fixed. Checks: geometry 0 findings in 162 states, all labels fit (8,400+), behaviour 42/42 and simulator 12/12 at 1280 and 500 px, contrast clean, every related link resolves, no console errors.

### How to re-run
Copy the scratchpad tools from a session that has them, or rebuild them from this description; run the gallery per visual in light and dark, then `geo.js`, `contrast.js`, `fit.js`, `test-v4.js`; review every frame against the rules before fixing.
