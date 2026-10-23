# SQL course — build prompt and status (written 2026-10-23)

**Status:** phase 1 is **built** (2026-10-23): course switcher, `sql/index.html`, SQL kit, seed database, Lesson S00 (`kb/sql-00-foundations.md`). Phases 2–6 are open. **Decision taken while building:** the Java course got a real ▶ Run button too, via Wandbox (JDK 22, free public API with CORS), after CheerpJ (JVM in WebAssembly) was tried and rejected: it needs http(s) not file://, downloads ~20 MB, and its Java 17 runtime has no compiler (ECJ could not find a JDK image either). SQL runs locally in the browser with sql.js, so it works offline after the first CDN load; Java needs internet. The SQL Playground / mock-interview integration (phase 6) should reuse `SQ.editor`.

The user asked (2026-10-23): "create the same way for SQL also, dropdown on top; if SQL is selected it should come SQL; first create prompt". This file is that prompt. Paste a **phase** of it into a fresh session (one phase per session keeps Claude usage low), together with "follow kb/sql-course-plan.md phase N".

---

## The prompt

You are extending the static course site in this folder (read `CLAUDE.md` first; it is short). Today it holds one course, **Java: Zero to Advanced**. Add a second course, **SQL: Zero to Advanced**, built exactly the way Lesson 00 of Java was rebuilt on 2026-10-23: **the visuals teach, the text captions**. Interview-prep, from zero to advanced, one lesson per page, no build step, opens from `file://` and on GitHub Pages.

### Rules that carry over unchanged
- No new tooling: plain HTML, `assets/css/course.css`, classic scripts sharing one global scope, CDN libraries only (cdnjs). No `node_modules`, no backups, no `-v2` files.
- Every lesson = `kb/sql-NN-name.md` (full text, source of truth) + `sql/NN-name.html` + labs in `assets/labs-sql-NN.js` (classes prefixed `sq-`), a quiz `QZ.sNN` + recall prompts `RC.sNN` in `assets/data/quiz-data.js`, interview cards, takeaways, a "Before you start" block, and **one interactive lab per concept plus one memorable real-world analogy, drawn and interactive**.
- Every section opens with "In 30 seconds", then the lab, then a "💡 Remember it" strip, then a short "Try it" query. Depth (engine internals, dialect history, edge cases) goes under `<details class="d"><summary>Go deeper: …</summary>`.
- Prose budget: **under 250 words per section outside details**. A fresher must be able to follow by playing the labs alone; a senior gets the depth under "Go deeper" and in the interview cards.
- **Every query shown is executed before it goes in**, and its result rows are shown. Engine: **sql.js** (SQLite compiled to WebAssembly, from cdnjs, loaded lazily like CodeMirror) so the page can run real SQL in the browser. Differences for PostgreSQL and MySQL are noted in a small "dialects" line where they matter (`LIMIT` vs `FETCH FIRST`, `||` vs `CONCAT`, `ILIKE`, `RETURNING`, window support, `MERGE`).
- Reduced motion and the ⏸ motion switch are honoured by every animation; every lab keeps `data-s="back|play|next"` or `data-a` buttons so ← → Space work. Labs must not use global short classes (`.c .good .bad .empty`). No copyrighted characters.
- Record everything: the lesson file, `KB.md` files table, `CLAUDE.md` change log (one line), `kb/site-internals.md` for implementation notes.

### One dataset for the whole course: the car dealership
The Java course's metaphor is the car (class = blueprint, object = car, variable = key, HashMap = parking lot). SQL reuses it so both courses feel like one product. Seed database `assets/data/sql-seed.js` (plain SQL string, ~60 rows total, deterministic):
- `customers(id, name, city, joined_on, referred_by → customers.id)`
- `cars(id, model, brand, year, price, colour, in_stock)`
- `employees(id, name, role, manager_id → employees.id, hired_on, salary)`
- `sales(id, car_id → cars, customer_id → customers, employee_id → employees, sold_on, amount)`
- `services(id, car_id, done_on, cost, note)` with some `NULL`s on purpose
- `cities(name, region)` so a `LEFT JOIN` has unmatched rows.
Every lesson queries this one database, so a reader never has to learn a new schema.

### Shared SQL lab kit (`assets/labs/labs-sql.js`, built in phase 1 and reused by every lesson)
- `SQ.table(rows, opts)`: renders a result grid with highlightable rows/cells (classes `sq-row.on`, `sq-cell.hot`).
- `SQ.run(sql)`: runs on the sql.js database (lazy-loaded; a static fallback shows the pre-computed rows if WASM fails).
- `SQ.editor(host, sql, expected)`: a CodeMirror SQL editor (mode `sql`) with **Run**, a result grid, row count, and "expected" check. The **SQL Playground** on the practice page is built from it.
- `SQ.stepper(host, frames, …)`: the same Back / Play / Next player as `labs-foundations.js`, so query execution can be shown step by step (FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT: the **logical order**, the headline idea of the course).

### Lessons (one page each; S00 shown first)
| # | Lesson | Headline lab (the one people remember) | Analogy |
|---|---|---|---|
| S00 | **Databases and SQL foundations**: what a database is, tables/rows/columns, keys, data types, `SELECT … FROM`, the logical order of a query | `#sqOrder`: a query is executed clause by clause on a real table while the written order sits above it | A **filing cabinet**: drawers = tables, folders = rows, labels = columns, the drawer index = primary key |
| S01 | **Filtering and sorting**: `WHERE`, comparison and `LIKE`, `IN`, `BETWEEN`, `NULL` and three-valued logic, `ORDER BY`, `LIMIT`/`OFFSET`, `DISTINCT` | `#sqFunnel`: rows fall through a funnel of conditions; `#sqNull`: the `TRUE/FALSE/UNKNOWN` truth table you can click | A **bouncer's checklist** at the door |
| S02 | **Joins**: `INNER`, `LEFT`, `RIGHT`, `FULL`, `CROSS`, self join, join on several keys, semi/anti join (`EXISTS` / `NOT EXISTS`), the N+1 trap | `#sqJoin`: two small tables, a dropdown of join types, rows **slide together** when keys match and unmatched rows get `NULL`s; a Venn that updates | **Matching car keys to cars** in the lot |
| S03 | **Aggregation**: `COUNT(*)` vs `COUNT(col)`, `SUM/AVG/MIN/MAX`, `GROUP BY`, `HAVING` vs `WHERE`, grouping sets | `#sqGroup`: rows fly into buckets by key, then each bucket collapses to one row | **Sorting coins into jars** |
| S04 | **Subqueries and CTEs**: scalar, `IN`, correlated, `EXISTS`, derived tables, `WITH`, recursive CTE (the employee → manager tree) | `#sqSub`: the inner query runs first and its result is pasted into the outer one, step by step; `#sqRec`: a recursive CTE grows the org tree level by level | **A question inside a question** |
| S05 | **Window functions**: `OVER`, `PARTITION BY`, `ROW_NUMBER/RANK/DENSE_RANK`, `LAG/LEAD`, running totals, frames (`ROWS BETWEEN`) | `#sqWindow`: a frame slides over the rows and the value is computed live; rank ties shown side by side | **A spotlight moving along a queue** |
| S06 | **Data modelling and normalisation**: ER basics, 1NF → 2NF → 3NF → BCNF, keys and constraints, when to denormalise | `#sqNorm`: one messy spreadsheet is split into clean tables one step at a time, with the anomaly it fixes | **One cupboard per kind of thing** |
| S07 | **Indexes and performance**: B-tree, how a lookup walks the tree, composite index order, covering index, selectivity, `EXPLAIN QUERY PLAN`, when an index hurts (writes, functions on columns, leading wildcards) | `#sqBtree`: full scan vs B-tree search, step counters side by side; `#sqPlan`: a real `EXPLAIN QUERY PLAN` from sql.js | **A book's index vs reading every page** |
| S08 | **Transactions and concurrency**: ACID, `BEGIN/COMMIT/ROLLBACK`, isolation levels and their anomalies (dirty, non-repeatable, phantom), locks, deadlocks, MVCC in one picture | `#sqTx`: two sessions side by side; pick an isolation level and replay the anomaly | **Two cashiers and one till** |
| S09 | **DDL, DML and modern SQL**: `CREATE/ALTER/DROP`, constraints, `INSERT … SELECT`, `UPDATE … FROM`, `DELETE` vs `TRUNCATE`, upsert (`ON CONFLICT` / `ON DUPLICATE KEY` / `MERGE`), `RETURNING`, JSON columns, keyset pagination | `#sqUpsert`: an insert hits a key conflict and the row is updated instead | **Rewriting a label vs adding a folder** |
| S10 | **Interview problems** (the classic 20): nth highest salary, top-N per group, duplicates and dedupe, gaps and islands, consecutive days, running balance, pivot/unpivot, employees above their manager, customers with no orders, second order per customer, year-over-year growth… | each problem = a `SQ.editor` with the expected rows and a "show the pattern" button | — |

Practice page additions: **SQL Playground** (`#sqPlay`, tasks like the Java Playground, drafts saved), the mock interview reads SQL Q&A too, Big-O sheet gets a "query cost" group, Revise hub covers both courses.

### The course switcher (phase 1, before any SQL lesson)
- A dropdown in the nav of every page, left of the search: **Java ▾ · SQL**. It is a real `<select id="courseSel">` styled like the theme button; choosing a course opens that course's home (`java/index.html` or `sql/index.html`) and remembers it in `js1-course`. Opening `index.html` redirects to the remembered course (default Java).
- Each course has its own index: `scripts/build-index.mjs` gets a `--course sql` mode that scans `sql/*.html` and writes `assets/data/sql-index.js`; SQL pages load it instead of `course-index.js`. `course.js` reads `document.body.dataset.course` ("java" default, "sql") for the home link, the lesson-card group and the Continue button; the sidebar shows the current course only, with a one-line "Switch to Java/SQL" at the bottom.
- The hero of each home page shows the other course as a small card ("Also here: SQL · 11 lessons"). The roadmap of the SQL course has its own levels (Foundations → Joins & aggregation → Subqueries & windows → Modelling → Performance → Transactions → Interview problems).
- Shared: themes, motion switch, effects switch, palette (adds a "Switch course" command), glossary (`GL` gets SQL terms), progress keys stay `js1-*` but section ids are prefixed `s-` so the two courses never collide.

### Phases (one per session)
1. **Switcher + kit + S00**: dropdown, `sql/index.html` home with hero and cards, `--course sql` index, `labs-sql.js` kit with sql.js loading, seed database, Lesson S00 with its 4–5 labs and quiz. Tests: both homes and S00 render, switcher round-trips, sql.js runs `SELECT COUNT(*) FROM cars`, no JS errors on all pages, 0 overflow at 480 px.
2. S01 + S02 (joins is the headline of the course: spend the time there).
3. S03 + S04.  4. S05 + S06.  5. S07 + S08.  6. S09 + S10 + SQL Playground + mock interview and Revise integration.
Each phase ends with: every query run in sql.js and its rows pasted into the lesson, every lab control driven headlessly, 10+ pages without errors, notes updated, one commit.

### Acceptance (what "done" means for a lesson)
A fresher who only plays the labs can answer the lesson's Beginner quiz questions. A senior finds, under "Go deeper" and in the interview cards, the engine-level answers (logical order, three-valued logic, join algorithms, B-tree walk, isolation anomalies). Every shown row is real output. Nothing on the page is a wall of text.
