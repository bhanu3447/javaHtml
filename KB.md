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
| P00 | Design Patterns — Foundations and SOLID (`patterns/00-foundations.html`): what a pattern is, GoF families and the five moves, interface vs abstract class, class diagrams, program to an interface, dynamic dispatch, composition, S O L I D before/after, lambdas, first refactor | 01–16 (`.band#ptf`, ids `pf-*`) | 17 |
| P01 | Strategy (`patterns/01-strategy.html`, Move 1 · Swap): 7 sections, 4 levels, Pain / Refactor / Sequence / Structure labs, playground | `#p01`, ids `stg-*` | 7 |
| P02 | Template Method (`patterns/02-template-method.html`, Move 1): 7 sections, Pain / Refactor / Sequence / Structure labs, playground | `#p02`, ids `tpl-*` | 5 |
| P04 | Factory Method (`patterns/04-factory-method.html`, Move 2 · Create): naive new → Simple Factory (not GoF) → Factory Method; static factory methods | `#p04`, ids `fac-*` | 7 |
| P05 | Builder (`patterns/05-builder.html`, Move 2): telescoping constructors and setters → fluent immutable Builder; GoF Director view; records | `#p05`, ids `bld-*` | 5 |
| P06 | Singleton (`patterns/06-singleton.html`, Move 2): one shared registry; eager, lazy, synchronized, DCL + volatile, holder, enum; reflection/serialization/clone breakers | `#p06`, ids `sgl-*` | 6 |
| P07 | Prototype (`patterns/07-prototype.html`, Move 2): copy() and a template registry; shallow vs deep copy bug and fix; why not Cloneable; records with withX | `#p07`, ids `pro-*` | 5 |
| P08 | Abstract Factory (`patterns/08-abstract-factory.html`, Move 2, last): India/EU part families, mismatched-plate bug, new product vs new family, Move 2 recap table | `#p08`, ids `abf-*` | 7 |
| P03 | State (`patterns/03-state.html`, Move 1): 7 sections, Move 1 recap | `#p03`, ids `sta-*` | 7 |
| PG | Java Visual Playground (`java/playground.html`): step through any program (`kb/playground.md`) | no sections | 22 examples |
| SP | Spring Boot Annotations Lab (`spring/index.html`, the third course: 21 sections, 135-card reference, nine concept labs from auto-configuration to Kafka; notes `kb/spring-annotations-lab.md`): first run, basics + IoC lab, proxies, HTTP, pipeline, flow + "one user, six shapes", live request map + 5-scenario simulator, data visuals, 75-card reference with a where-it-acts map, recall, quiz | `#hello #basics #proxy #http #dispatch #flow #simulator #datavis #annotations #di #recall #quiz` | 9 files, 5 scenarios, 22 quiz Qs |

Each lesson file starts with `# Lesson NN — Title`, and its sections are `## N. Title`. A new lesson gets a new `kb/lesson-NN-name.md` and a row in both tables.

## Files

| File | Holds |
|---|---|
| `kb/lesson-00-foundations.md` | Lesson 00 — Java, the JDK and the two kinds of types (what Java is, javac → bytecode → JVM, JDK ⊃ JRE ⊃ JVM, stack / heap / Metaspace, the eight primitives vs reference types; live 2026-10-25) |
| `kb/lesson-01-strings.md` | Lesson 01 — What is a String, and where does it live? (the object, creating one, stack/heap/SCP, new String(), == vs equals, immutability, compile-time vs run-time; live 2026-10-24) |
| `kb/lesson-02-classes-objects.md` | Lesson 02 — What is a Class and an Object? (class vs object, members, what `new` does and defaults, stack/heap/Metaspace, references and null, constructors and `this`, static vs instance, toString/equals/hashCode, mistakes; live 2026-10-25) |
| `kb/playground.md` | The Java Visual Playground (`java/playground.html`): how `jvm-lite.js` interprets Java and records steps, the supported subset and what is not supported, the step and record format, the page's drawing rules, measurements, testing recipes, and the 50 test programs with their JDK 25 output (2026-10-25) |
| `kb/sql-00-foundations.md` | SQL 00 — Databases and SQL foundations (live, 2026-10-23) |
| `kb/design-patterns-plan.md` | Build prompt for the Design Patterns course (`patterns/`; revised 2026-10-28 into a beginner-to-expert path: 9 lessons P00–P08 grouped by five moves (swap, create, wrap, talk, compose), four levels per pattern, Refactor/Playground/Sequence views, capstone; phase 1 done: shell, kit, P00; revision awaiting the user's review) |
| `kb/patterns-01-strategy.md`, `kb/patterns-02-template-method.md`, `kb/patterns-03-state.md`, `kb/patterns-04-factory-method.md`, `kb/patterns-05-builder.md`, `kb/patterns-06-singleton.md`, `kb/patterns-07-prototype.md`, `kb/patterns-08-abstract-factory.md` | Pattern pages 01–08: sections, labs, checks, programs |
| `kb/patterns-page-brief.md` | The step-by-step brief for building ONE pattern page (any session or account), with the checks in `scripts/dp-checks/` |
| `kb/patterns-00-foundations.md` | Patterns 00 — Foundations and SOLID (live 2026-10-28): the lab kit `DPL` (data format, class boxes, edge kinds, tabs, catalog, test hook), the 13 sections, the checks, and the 13 JDK 25 programs |
| `kb/lld-plan.md` | Build prompt for the later Low-Level Design course (`lld/`: concurrency, 7-step method, 19 case studies, timed machine coding; after the patterns course) |
| `kb/sql-course-plan.md` | Build prompt for the SQL course + course switcher (2026-10-23; phase 1 built, S00 live) |
| `kb/spring-annotations-lab.md` | Spring Boot Annotations Lab (`spring/index.html`): sections, data model (`files`, `A`, `byName`, `scenarios`), test hook `window.SPRING`, headless test recipe (rebuilt 2026-10-26) |
| `kb/site-internals.md` | How the engine works (editors, suggestions, themes, sidebar, palette, motion, localStorage keys), the testing recipes and the full change log. Its "Lessons in detail" part describes the v1 lessons, now in `archive/java-v1/`. |
| `kb/spring-visual-audit-plan.md` | The Spring lab visual audit, state by state: the prompt (inventory of every visual and state, rules, method, acceptance) and the 2026-10-27 run (12 findings and fixes) |
| `kb/style-audit-plan.md` | The theme-wise style and colour audit: the prompt (rules, method, acceptance), the findings of the 2026-10-24 run, the accepted exceptions and how to re-run it |
| `kb/ux-pass-plan.md` | The UI/UX pass prompt (reading measure, button system, touch targets, focus, editors, mobile rhythm) with its findings and result |
| `kb/appendix-effects.md` | Appendix — page effects internals (moved from CLAUDE.md on 2026-10-21) |
| `kb/access-lock.md` | The course lock (2026-10-28, not live yet): face-matched registration, owner/admin/learner roles, per-course approval, locked pages served from Supabase; setup steps and workflow |
| `archive/java-v1/` | The whole first Java course (pages, labs, quizzes, lesson notes, practice layer and course-tools notes). Reference only, nothing loads it. |
