# KB — Course knowledge base (index)

The full text of the course lives in `kb/`, one file per lesson. The project notes are in `CLAUDE.md`, which loads automatically. The `kb/` files do **not** load automatically: open only the file you need, and grep it for a section (`grep -n "^## " kb/lesson-05-oop.md`).

## Lesson index

| # | Lesson | Page sections | Programs |
|---|---|---|---|
| 01 | Java Strings: From Zero to Advanced | 1–18 | 13 |
| 02 | String Concepts Deep Dive (theory first) | D1–D13 (`.band#deep`) | 3 |
| 03 | String Problems & Patterns (completing Strings) | S1–S12 (`.band#probs`) | 9 |
| 04 | Java Arrays: From Zero to Advanced | A1–A14 (`.band#arrays`) | 10 |
| 00 | Java Foundations: Platform, Types, Operators, Methods (shown **first** on the page) | F1–F8 (`.band#found`) | 12 |
| 05 | Object-Oriented Programming: Classes, the Four Pillars, Modern Types (`java/lessons/05-oop.html`) | P1–P10 (`.band#oop`) | 14 |
| 06 | Sorting: every interview sort + bubble sort in depth (`java/lessons/06-bubble-sort.html`); the sections follow the sort picked in the explorer | B0 explorer + O(n) complexity section (always shown) + bubble B1–B14 + SL, IN, MG, QK, HP 1–4 and CT 1–4, RX, BK, CY, DF 1–3 (52 sections, `.band#bsort`) | 30 + Sorts.java |
| 07 | The Collections Framework (`java/lessons/07-collections.html`): generics, List, HashMap internals, sets and LRU, TreeMap, queues and heaps, comparators, fail-fast, immutable and concurrent collections | C1–C12 (`.band#coll`) | 12 |
| — | Practice layer: quizzes, recall prompts, interview cards, takeaways (all lessons) | quizzes at each lesson end, Revise hub | — |
| — | Course tools: mock interview + complexity cheat sheet | 17 `#mock`, 18 `#bigo` | — |
| — | Course tools: "Watch it run" step-through programs (7) | in lessons 00–04 | — |
| — | Course tools: analogy layer (12 visuals + 16 "Remember it" strips) | every lesson | — |

Each lesson file starts with `# Lesson NN — Title`, and its sections are `## N. Title`. A new lesson gets a new `kb/lesson-NN-name.md` and a row in both tables.

## Files

| File | Holds |
|---|---|
| `kb/lesson-01-strings.md` | Lesson 01 — Java Strings: From Zero to Advanced |
| `kb/lesson-02-string-internals.md` | Lesson 02 — String Concepts Deep Dive (theory first) |
| `kb/lesson-03-string-problems.md` | Lesson 03 — String Problems & Patterns (completing Strings) |
| `kb/lesson-04-arrays.md` | Lesson 04 — Java Arrays: From Zero to Advanced |
| `kb/lesson-00-foundations.md` | Lesson 00 — Java Foundations: Platform, Types, Operators, Methods |
| `kb/lesson-05-oop.md` | Lesson 05 — Object-Oriented Programming: Classes, the Four Pillars, Modern Types |
| `kb/lesson-06-sorting.md` | Lesson 06 — Sorting: Every Interview Sort, then Bubble Sort in Depth |
| `kb/lesson-07-collections.md` | Lesson 07 — The Collections Framework (Level 3) |
| `kb/practice-layer.md` | Practice layer — quizzes, recall prompts, interview cards, takeaways |
| `kb/course-tools.md` | Course tools — mock interview and complexity cheat sheet (page sections 17–18) |
| `kb/sql-00-foundations.md` | SQL 00 — Databases and SQL foundations (live, 2026-10-23) |
| `kb/sql-course-plan.md` | Build prompt for the SQL course + course switcher (2026-10-23; phase 1 built, S00 live) |
| `kb/style-audit-plan.md` | The theme-wise style and colour audit: the prompt (rules, method, acceptance), the findings of the 2026-10-24 run, the accepted exceptions and how to re-run it |
| `kb/ux-pass-plan.md` | The UI/UX pass prompt (reading measure, button system, touch targets, focus, editors, mobile rhythm) with its findings and result |
| `kb/appendix-effects.md` | Appendix — page effects internals (moved from CLAUDE.md on 2026-10-21) |

Course tools (mock interview, Big-O sheet, "Watch it run", analogy layer, learn layer) are all in `kb/course-tools.md`.
