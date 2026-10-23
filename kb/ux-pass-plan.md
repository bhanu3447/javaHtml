# UI/UX pass (the prompt) — buttons, content size, reading comfort

Written 2026-10-24 at the user's request ("buttons and content size, UI/UX level, anything we can change better; act as professional, enable prompt and complete this one"). Follows the colour audit (`kb/style-audit-plan.md`). Animation stays out of scope.

## What a professional pass changes here (findings from the survey)
Screens surveyed at 1100 px and 500 px (headless Chrome's minimum): hub, Java home, Lesson 05 top, Practice top, SQL S00 top, plus the component CSS.
1. **Reading measure.** Prose runs the full 840 px column (~95 characters per line at 16 px). Comfortable is 60–80. Visuals, code, tables and cards should stay full width; paragraphs, lists, notes and Q&A bodies should not.
2. **Body type.** 16 px / 1.7 on a wide desktop reads small next to the 2.3 rem headings; 17 px on ≥ 900 px screens, 16 px below.
3. **Button system.** Buttons exist in four ad-hoc sizes (nav 32, `.btn` ~34, `.btn.big` ~46, lab `.ib` ~24) with different radii. Define three: **sm 32** (toolbar/lab), **md 38** (default), **lg 46** (hero/pager), radii 8/10/12, consistent horizontal padding, `white-space:nowrap`, same focus ring. Touch devices get ≥ 44 px targets.
4. **Code editors** at .84 rem (13.4 px) are the smallest text on the page while being the most important; 14 px / 1.7 with a slightly brighter gutter.
5. **Quiz options** need a clear hover/focus and a minimum height so they work as touch targets; the key letter should look like a key.
6. **Mobile rhythm.** 20 px gutters on ≤ 480 px steal space: 16 px; hero CTA buttons stack full width; the band and cards get tighter padding; the nav link strip fades at its edges so it reads as scrollable.
7. **Keyboard users.** No skip link; summaries, links and quiz options have no visible focus ring. Add a "Skip to content" link (injected by course.js so no page changes) and a single `:focus-visible` rule for every interactive element.
8. **Details/notes.** "Go deeper" summaries and notes should share the same radius and padding scale as cards (14 px) and sit on the same 8 px spacing grid.

## Rules
- CSS only (one block `/* ux pass v39 */` at the end of `course.css`), one small JS addition for the skip link. No page markup changes, no new files besides this note.
- Nothing that changes a lab's behaviour or an animation.
- Every change must hold in all 9 themes (the tokens from v38 do that) and must keep the contrast audit at 0 failures.

## Acceptance
- 13 pages, no JS errors; the smoke test and the contrast audit still pass.
- Screenshots at 1100 and 500 px of the Java home and Lesson 05 top look right (measure, buttons, spacing).
- Change log line in `CLAUDE.md`, details in `kb/site-internals.md`.

## Result
Run of 2026-10-24: all eight findings applied in `assets/css/course.css` (`/* ux pass v39 */`) and one JS addition (the skip link). Checks after the pass: contrast audit 0 failing element kinds on all 13 pages × 9 themes; smoke test 13 pages, no JS errors, course menu reports the right course; screenshots of the Java home, Lesson 05 and Practice at 1100 px and 500 px reviewed (the hero lead keeps its 620/640 px width; the ghost CTA keeps a faint border so the three hero actions read as one group). Not changed on purpose: lab behaviour, animations, page markup, lesson text.
