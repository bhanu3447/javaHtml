# Pattern page brief: how to build ONE pattern page (used for 01–03, 2026-10-28)

The exact instructions every pattern-page builder follows (one agent or one session per page). The contract is `kb/design-patterns-plan.md`; the kit format is `kb/patterns-00-foundations.md` → Kit. Paths are relative to the project folder. **TMP** = a scratch folder outside the project for Java files, quiz files and screenshots (any temp folder, e.g. `/tmp/dp-checks/<slug>/`); never write scratch files into the project.

## Start of a new session (cheapest way)
1. `/clear`, then: "Build pattern NN <Name> following kb/patterns-page-brief.md". Read only the files listed under "Read first"; do not read other lessons.
2. One page per session; Sonnet is enough for building, Opus for reviewing. Keep Level 4 short on ○ patterns.
3. When the page is green: merge the quiz (`node scripts/dp-checks/qmerge.js lesson TMP/<slug>/quiz.js`), `node scripts/build-index.mjs patterns`, add the `KB.md` row and a change-log line, commit and push.
4. Already built: 01 Strategy, 02 Template Method, 03 State. Use them as reference pages (e.g. `patterns/01-strategy.html` + `assets/labs/labs-patterns-p01.js`).

## Read first (in this order, only what you need)
1. `kb/design-patterns-plan.md`: the contract (constraints, the 7-section page, visual language, acceptance). Follow it exactly.
2. The kit `assets/labs/labs-patterns.js`: read the header comment (lab data format), `seqPrep`, `play`/`playBuild`, `predict`, `explainBack`, `header`. Lab data = DPL.add({key:{pill, views:[…]}}).
3. `patterns/00-foundations.html` + `assets/labs/labs-patterns-p00.js`: the house style for sections, labs, editors, interview cards, review block (copy its `<head>`, `<nav>`, header, band, footer, script tags, review/feedback markup exactly; change titles/keys).
4. `scripts/dp-checks/kit-example.html` (open it in a browser from that folder) and one finished page (`patterns/01-strategy.html` + its data file): a working example of every new widget (Refactor with add/del/meter, Sequence view, Playground, Predict, Explain it back, revision card, Spring snippet).
5. `CLAUDE.md` rules (JDK 25 for every program, no `</script>` or `${` in strings, classic scripts share one global scope, reduced motion, keyboard).

## You may create / edit ONLY
- `patterns/NN-slug.html` (your page), `assets/labs/labs-patterns-pNN.js` (your data), `kb/patterns-NN-slug.md` (your notes).
- Files inside `TMP/<your-slug>/` (Java scratch, quiz file, screenshots).
NEVER edit course.css, course.js, quiz-data.js, labs-patterns.js, index pages, KB.md, CLAUDE.md, other lessons. If you need CSS that does not exist, do without it and list the need in your report.

## Page skeleton
- `<body data-page="pNN" data-course="patterns" data-name="PNN · Pattern Name" data-short="PNN">`, `<title>PNN: Pattern Name · Design Patterns</title>`.
- Header `.ph`: tag `PATTERNS NN · MOVE n · SWAP` style, `<h1>` with a `.grad` span, a `.lead` (2–3 sentences, plain words), `<div class="pager"></div>`.
- Band `<div class="band" id="pNN">` (tag, h2, one line).
- Script tags at the end, in this order: `../assets/data/patterns-index.js`, `../assets/data/quiz-data.js`, `../assets/js/course.js`, `../assets/js/effects.js`, `../assets/labs/labs-patterns.js`, `../assets/labs/labs-patterns-pNN.js`, `../assets/js/run-java.js`. Keep `<button id="totop">` and the `<footer>`.
- Exactly 7 sections, ids `xxx-see, xxx-build, xxx-run, xxx-practise, xxx-choose, xxx-master, xxx-review` (xxx = your prefix), each `<section id="…"><span class="num">0N</span><h2>…</h2>`. Put the level chip as the first child after h2: `<span class="dp-lv l1">Level 1 · See it</span>` (l2 Build it / l2 Watch it run / l2 Practise / l3 Choose it / l4 Master it / lr Interview and review).
- § 01 starts with `<div class="dp-pat" data-p="Exact Pattern Name"></div>` (the kit fills glyph, chips, intent, related links).

## What each section must contain (the master prompt's 22 items)
§01 See it (beginner, assume no pattern knowledge): `.tldr` "In 30 seconds" with the one-line intent in plain English; the real dealership problem; `.an-strip` everyday analogy + a small `.tw` table mapping analogy parts → classes; **Pain lab** (`dp-xxxpain`): 4–6 steps, the naive design as the change requests arrive (each step a new requirement), the "places to edit" `meter` rising, every box/arrow explained in the step text `d`. No undefined jargon (define "client", "context", etc. on first use).
§02 Build it: "Before" `.dp-ba before` + runnable editor (the naive code); 2–4 sentences on what breaks; **Refactor lab** (`dp-xxxref`): 5–7 small steps, each step's `code` is the whole (short) current code with `add`/`del` marks, the diagram grows with `hide` lists in sync, `meter` falling, and `d` says WHY this change; then "After" `.dp-ba after` + runnable editor with the final code and its real output in comments.
§03 Watch it run: **Runtime lab** (`dp-xxxrun`) as a Sequence view (`seq` lanes = the objects of main(), msgs = every call/return/new in order for one scenario; steps with `upto`/`cur`; `d` explains how execution reaches each output line; code panel with `marks` on the line running); then a **Playground** (`dpp-xxxplay`, DPL.play) the reader drives: e.g. pick a strategy/state/subclass, press actions, see the diagram change and the output; render() must compute the real result the Java code would print (same numbers).
§04 Practise: beginner exercise `<div class="dp-ex" data-t="Beginner exercise">` (task, `<details class="d">` Hint, `<details class="d">` Solution with code in `<pre><code>`); intermediate exercise (implement/refactor; same shape); **Explain it back** `<div class="dp-xb" data-k="pNN"><p>prompt</p><div class="dp-xm">model answer</div></div>`.
§05 Choose it: **Structure lab** (`dp-xxxuml`) with TWO views: `Roles` (generic GoF role names: Context, Strategy, ConcreteStrategy… plus the client) and `Dealership` (the real class names from your After code), stepped to explain each role and arrow; when to use (2–3 bullets), when NOT + the simpler alternative (2–3 bullets); comparison table with the look-alikes; trade-offs (complexity, extensibility, coupling, testing, performance where relevant); a realistic backend application (Spring Boot scenario as `<pre class="dp-spring"><code>…</code></pre>`, real annotations/classes only, clearly conceptual); JDK/Spring connection with verified, real class names (say "conceptually similar" where it is not a literal implementation); a **Spot it** `<div class="dp-pred spot" data-ans="i">` on a short JDK/Spring snippet.
§06 Master it (collapsed depth is fine with `<details class="d">`): the modern Java alternative (lambdas / method references / enums / records / sealed+switch where it fits), runnable editor with output; advanced details (thread safety/performance ONLY if relevant); common mistakes; an advanced scenario as a **Predict** `<div class="dp-pred" data-ans="i">` (changing requirements: choose the design); patterns it cooperates with (link to `NN-slug.html` only for 01–03 and 00; name the others plainly, they are not built yet).
§07 Interview and review: interview cards `<details class="d"><summary><span class="q">01</span>Question</summary><div class="b">…</div></details>` — a 30-second answer card, a deeper-answer card, and 4–6 follow-up questions interviewers really ask (label each B/I/A at the start of the answer, e.g. `<b>B ·</b>`); **revision card** `<div class="dp-rev">` with 5 cells: Intent, Structure, Use when, Trade-off, Remember (the analogy); then the review block exactly like P00 (takeaways ul, quiz `<div class="quiz" data-quiz="pNN">`, recall `<div id="rcp"></div>`, feedback `#rates #fbt #fbc #fbm`).

Words: under ~250 words of prose per section outside `<details>`/labs/exercises. Plain English, short sentences, beginner first. Dealership story everywhere (prices in rupees as `long`).

## Java
- Every program: write it in `TMP/<slug>/`, run `java File.java` (JDK 25 on PATH) and paste the REAL output into `// comments`. Single-file programs with a public class matching the file name and `main`. Small: 30–70 lines.
- Editors: `<script type="text/x-java" data-file="X.java" data-hl="…">` (data-hl = the lines to highlight). Inside the HTML, escape `<` as `&lt;` only if the existing P00 editors do (check how P00 writes generics like `List<String>` inside x-java scripts and copy that).
- Use the same class names in labs and code. `node scripts/dp-checks/dpmatch.js patterns/NN-slug.html` must report `fails: []` (it checks every class box and method in non-"Roles" views exists in the page's code).

## Quiz and recall (do NOT edit quiz-data.js)
Write `TMP/<slug>/quiz.js` with exactly: `QZ.pNN=[…];` (10–12 questions: ~4 B, 5 I, 2–3 A; format `{lv:"B",q:"…",o:["…","…","…","…"],a:1,e:"…"}`, answers spread over positions, plausible distractors, no ambiguous options) and `RC.pNN={d1:[[q,a],[q,a],[q,a]],d3:[…3],d7:[…3]};`. Check it with `node -e` (load with QZ={},RC={} defined) for syntax and that every `a` is a valid index.

## Checks (from the project folder with the Bash tool; the page is not in the site index until build-index runs — fine; ignore pager/quiz/rcp counts until then)
1. `node --check "<project>/assets/labs/labs-patterns-pNN.js"`
2. `sh scripts/dp-checks/run.sh patterns/NN-slug.html 1280` and `… 500` → `errors: []`, `fails: []`, `scroll` ≤ 0.
3. `sh scripts/dp-checks/run.sh patterns/NN-slug.html 1280 widgets.js` and `… 500 widgets.js` → `fails: []` (header, add/del/meter, sequence, playground, predict, explain-back).
4. `sh scripts/dp-checks/run.sh patterns/NN-slug.html 1280 contrast.js` → `fails: {}`.
5. `node scripts/dp-checks/dpmatch.js patterns/NN-slug.html` → `fails: []`.
5b. `sh scripts/dp-checks/javacheck.sh patterns/NN-slug.html` → every program `0 not in comments` (runs each editor's code on the JDK and checks its output against the comments).
6. Gallery, light AND dark: `sh scripts/dp-checks/gx.sh light 4000 g-<slug>-l.png key1,key2,… NN-slug.html` (keys = lab ids without `dp-`; split into several shots if tall). Open every PNG with Read and fix anything cramped, overlapping, unclear or misleading. Also `sh scripts/dp-checks/shot.sh patterns/NN-slug.html 1280 6000 full.png` and the same at 500 px wide, and look at them (use a smaller height to get readable crops).
Known harmless: none. Any console error is yours to fix.

## Report back (short, when an agent builds it)
Sections (ids), labs (keys, views, step counts), playground key, programs (file names; "ran on JDK 25: yes" + one output line each), the final JSON line of every check, paths of quiz.js and screenshots, CSS needs, anything you could not do or are unsure is technically accurate.

## Lessons learned on 01–03
- Write the Java files first, run them, then paste them into the page (a tiny script that inlines the .java files keeps the editors identical to what ran).
- Edge labels on short edges sit on boxes: drop them or curve the edge with `bend`.
- Plain `<pre><code>` in exercises and Spot it needs `style="overflow-x:auto"` (or it scrolls the page at 500 px).
- Sequence views reserve their full height from step 1; keep a scenario to about 10–18 messages.
- Network drops end long agents: write the page's files early so a resumed agent can continue from disk.
- Verify JDK/Spring class names against the docs before writing them; say "conceptually similar" when it is not a literal implementation.
