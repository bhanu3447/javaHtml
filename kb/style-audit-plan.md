# Style and colour audit, theme-wise (the prompt)

Written 2026-10-23 at the user's request ("whole styling and colour code properly check whole html, leave animation, theme-wise check whole; enable the best prompt and use that"). This is the prompt that drives the audit; the result and the fixes are logged at the end.

## Goal
Every page of the site (hub, Java home, 8 lessons, practice, SQL home, S00) must look finished and consistent in **every theme** (light, dark, midnight, nord, dracula, forest, sunset, ocean, sepia): readable text, one colour language, no element that keeps a light-theme colour on a dark theme or the reverse. Animation and motion are out of scope (they were reviewed separately and the ⏸ switch covers them).

## Rules (what "proper" means here)
1. **Tokens only.** Every colour in page chrome, labs, figures, quizzes and cards comes from the token set in `assets/css/course.css` (`--bg --surface --soft --text --muted --line --accent --accent-2 --accent-soft --amber(-soft) --good(-soft) --bad(-soft) --code-*`). Hard-coded hex is allowed only (a) inside the always-dark code editors and code windows (`--code-*` world), (b) in the brand/hero gradients, (c) in illustrations that are deliberately scene-coloured (fire, sky, tree, festival pieces, 3D rider: effects, out of scope).
2. **Contrast.** Body text ≥ 4.5:1, large text (≥ 24 px, or ≥ 18.66 px bold) ≥ 3:1, against the composited background, in every theme. Labels on coloured chips use the matching `-soft` background with the strong colour as text, never white-on-pastel.
3. **Semantic colours mean one thing.** `--good` = correct / success / allocated, `--bad` = wrong / error / freed, `--amber` = warning / note / pivot, `--accent` = the current thing / interactive, `--muted` = secondary text, `--line` = borders. A lab must not invent a fourth meaning for green.
4. **Same component, same look.** Cards, buttons (`.btn`, `.btn.pri`, `.ghost`), pills, tables, callouts, quiz options, step players, lab controls share one radius/border/shadow scale across all lessons and both courses. New lab CSS reuses the existing classes rather than restyling them.
5. **Light themes (light, sunset, ocean, sepia) and dark themes (the rest)** both get a real pass: a colour that is only ever checked in dark mode counts as unchecked.
6. **Nothing visual depends on `prefers-color-scheme` alone**: the `[data-theme]` override must give the same result as the system rule.

## Method
1. **Automated contrast audit** (scratchpad `audit-gen.mjs` + Chrome headless + `audit-sum.mjs`): for every page, open every `<details>`, then for each of the 9 themes composite the effective background of every element that owns text and compute the WCAG ratio; list every element below the threshold with its selector signature, colours, the themes it fails in and a text sample. Shared signatures that fail on many pages are fixed once in the shared CSS.
2. **Static scan** of `course.css` for hard-coded colours outside the allowed places, grouped by `/* block */` so each lab/figure block is reviewed as a unit.
3. **Visual pass** by screenshot at 1100 px and 420 px in a light theme and a dark theme for each page, looking for: fixed-colour boxes that ignore the theme, invisible borders, white flashes, pastel chips with white text, SVG figures whose strokes/fills do not adapt.
4. **Fix in `course.css` only** (and in the lab scripts when a colour is set inline), re-run the audit until it reports nothing above the noise floor (decorative text inside scene illustrations is the only accepted exception, listed explicitly).

## Acceptance
- The audit reports 0 failing signatures on all 13 pages in all 9 themes (exceptions listed by name).
- No new hard-coded colour outside the allowed places; the static scan count goes down, not up.
- 13 pages, no JS errors, 0 horizontal overflow at 480 px.
- Change log entry in `CLAUDE.md`; this file gets the findings table and the list of accepted exceptions.

## Findings and fixes
### Run 1 (2026-10-24)
**Baseline** (transitions and animations disabled in the auditor, faded elements skipped): 13 pages × 9 themes, 36 696 elements with text checked. Failing signatures per page: hub 10, Java home 18, L00 18, L01 30, L02 26, L03 23, L04 26, L05 25, L06 26, L07 22, Practice 28, SQL home 22, S00 33. Almost all of it was **token-level**, not page-level:
- light theme: `--muted` 4.48 on bg / 4.29 on soft, `--accent` 4.21 (section numbers, lesson-card labels, current nav link on accent-soft 3.94), `--good` 3.43 on good-soft, `--amber` 2.99 on amber-soft, white on `--good` 3.77 and on `--amber` 3.19 (quiz keys, chips);
- every dark theme: white on `--accent/--good/--bad/--amber` solids 1.4–3.7 (the dark tokens are bright for text, not for fills);
- nord: accent 3.74 on surface, bad 3.27 on soft, muted 4.37; dracula / nord `--code-dim` 3.7–4.1; sunset / ocean / sepia muted and bad 4.0–4.4;
- code windows (always dark): `--code-dim` 3.36 on the toolbar (▶ Run, copy, reset, file tabs), comments `.cm` 3.06, gutter numbers 2.0;
- footer credits 2.8–3.0 (muted at reduced opacity), hub course arrows 2.1, `#fxBtn` dimmed 3.2 (icon state, accepted).

**Fixes** (all in `assets/css/course.css`, block `/* ui polish v38 */`, plus the token lines): light `--muted #5b6474 --accent #4f46e5 --accent-2 #9333ea --amber #b45309 --good #047857 --bad #c81e1e`; nord `--muted #b8c1d1 --accent #a3c0dd --accent-2 #c9a6c6 --good #b0cc98 --bad #f2aeb4`; dracula `--accent #b79cf7`; forest `--accent #27b37a --accent-soft #0f2a1e`; midnight `--accent-soft #0e1a3a`; sunset `--muted #7d5f52 --accent #be123c --bad #c81e1e`; ocean `--muted #4b6b7d --bad #c81e1e --amber #a3470a`; sepia `--accent #8f4a26 --good #456d0c --amber #7f5500`; `--code-dim` brightened in every theme, `.cm #8b949e`, gutter opacity .85. New **fill tokens** per theme (`--accent-fill --accent-2-fill --good-fill --bad-fill --amber-fill`, each ≥ 4.5:1 under white) carry every white-on-colour element; `.chip.on` is accent-soft + accent text everywhere. Footer credits full muted; hub arrows text-coloured. Verified by `tokens.mjs`: every text token ≥ 4.5 on bg/surface/soft in all 9 themes, white ≥ 4.5 on every fill.

**Accepted exceptions**: `--accent-2` as *text* in sunset/sepia (it is only used in gradients and the `.grad` headline, which the auditor skips); `#fxBtn` dimmed to 60 % while effects are paused (icon state, not text); text inside scene illustrations (odometer, plates, lockers, car story dashboard) that carry their own fixed palettes on fixed backgrounds.

**Result** (final run, same auditor): 13 pages × 9 themes, 0 failing element kinds on every page (the last two, gutter numbers in nord at 4.43, were lifted by gutter opacity .92). Smoke test: 13 pages, no JS errors, course root resolves, the course menu reports the right course. `body{overflow-x:hidden}` keeps the pages from scrolling sideways at 480 px; the only elements wider than the viewport are the background canvas and tables inside their own scroll wrappers.

### How to re-run
1. `node audit-gen.mjs` (env `THEME=` for the initial theme, `ASSETS=` to audit a snapshot) writes `audit-pages/*.html` with the auditor injected.
2. Chrome headless `--dump-dom` each page, keep the text of `<pre id="__t">` as `audit-out/<page>.json`.
3. `node audit-sum.mjs [minThemes]` prints every failing signature with its themes and ratios.
4. `node tokens.mjs` checks the token pairs alone (fast, no browser).
