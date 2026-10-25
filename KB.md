# KB — Course knowledge base (index)

The full text of the course lives in `kb/`, one file per lesson. The project notes are in `CLAUDE.md`, which loads automatically. The `kb/` files do **not** load automatically: open only the file you need, and grep it for a section (`grep -n "^## " kb/lesson-01-strings.md`).

**2026-10-24: the Java course was restarted from scratch.** The complete first version (lessons 00–07, practice page, labs, quizzes, notes) is kept as one backup in `archive/java-v1/` (see its README) and in git history (commit `2b1d8df`). New Java lessons are written one concept at a time, in the order the user asks for them, starting with "what is a String?".

## Lesson index

| # | Lesson | Page sections | Programs |
|---|---|---|---|
| 00 | Java, the JDK and the two kinds of types (`java/lessons/00-foundations.html`) | 01–06 (`.band#fnd`, ids `fn-*`) | 2 |
| 01 | What is a String, and where does it live? + the String methods playground (`java/lessons/01-strings.html`) | 01–11 (`.band#str`, ids `st-*`; `#smPlay` in 08) | 8 |
| 02 | What is a Class and an Object? (`java/lessons/02-classes-objects.html`) | 01–10 (`.band#cls`, ids `co-*`) | 7 |
| S00 | SQL — Databases and SQL foundations (`sql/00-foundations.html`) | `.band#sqlf` | 5 live editors |
| PG | Java Visual Playground (`java/playground.html`): step through any program (`kb/playground.md`) | no sections | 22 examples |

Each lesson file starts with `# Lesson NN — Title`, and its sections are `## N. Title`. A new lesson gets a new `kb/lesson-NN-name.md` and a row in both tables.

## Files

| File | Holds |
|---|---|
| `kb/lesson-00-foundations.md` | Lesson 00 — Java, the JDK and the two kinds of types (what Java is, javac → bytecode → JVM, JDK ⊃ JRE ⊃ JVM, stack / heap / Metaspace, the eight primitives vs reference types; live 2026-10-25) |
| `kb/lesson-01-strings.md` | Lesson 01 — What is a String, and where does it live? (the object, creating one, stack/heap/SCP, new String(), == vs equals, immutability, compile-time vs run-time; live 2026-10-24) |
| `kb/lesson-02-classes-objects.md` | Lesson 02 — What is a Class and an Object? (class vs object, members, what `new` does and defaults, stack/heap/Metaspace, references and null, constructors and `this`, static vs instance, toString/equals/hashCode, mistakes; live 2026-10-25) |
| `kb/playground.md` | The Java Visual Playground (`java/playground.html`): how `jvm-lite.js` interprets Java and records steps, the supported subset and what is not supported, the step and record format, the page's drawing rules, measurements, testing recipes, and the 50 test programs with their JDK 25 output (2026-10-25) |
| `kb/sql-00-foundations.md` | SQL 00 — Databases and SQL foundations (live, 2026-10-23) |
| `kb/sql-course-plan.md` | Build prompt for the SQL course + course switcher (2026-10-23; phase 1 built, S00 live) |
| `kb/site-internals.md` | How the engine works (editors, suggestions, themes, sidebar, palette, motion, localStorage keys), the testing recipes and the full change log. Its "Lessons in detail" part describes the v1 lessons, now in `archive/java-v1/`. |
| `kb/style-audit-plan.md` | The theme-wise style and colour audit: the prompt (rules, method, acceptance), the findings of the 2026-10-24 run, the accepted exceptions and how to re-run it |
| `kb/ux-pass-plan.md` | The UI/UX pass prompt (reading measure, button system, touch targets, focus, editors, mobile rhythm) with its findings and result |
| `kb/appendix-effects.md` | Appendix — page effects internals (moved from CLAUDE.md on 2026-10-21) |
| `archive/java-v1/` | The whole first Java course (pages, labs, quizzes, lesson notes, practice layer and course-tools notes). Reference only, nothing loads it. |
