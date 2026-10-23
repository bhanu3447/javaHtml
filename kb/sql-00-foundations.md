# SQL 00 — Databases and SQL foundations

Page `sql/00-foundations.html` (key `s00`, band `#sqlfound`, sections S1–S6: `s-what s-schema s-select s-order s-keys s-review`). Added 2026-10-23 as phase 1 of the SQL course (`kb/sql-course-plan.md`). **Visual-first:** the labs teach, the text captions; depth under "Go deeper". Every query on the page runs for real in the browser on SQLite 3.49 (sql.js 1.13.0 from cdnjs) seeded by `assets/data/sql-seed.js` (the car dealership: `cities customers cars employees sales services`, 59 rows). Every result below was produced by that database (scratch `sqlcheck.mjs`).

**Labs** (`assets/labs/labs-sql.js`, classes `sq-`, hosts `.viz.ol.fd.sq`): `#sqCabinet` (S1, the analogy: drawers = tables, folders = rows, labels = columns, folder number = primary key; pulls real rows), `#sqSchema` (S2: table cards; click a foreign-key column to follow one row to the row it points at, Next steps through the rows), `#sqPick` (S3: build `SELECT … FROM … ORDER BY … LIMIT` by clicking, result updates live), `#sqOrder` (S4, headline: a 7-step player runs FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT as real queries, 12 → 9 → 6 → 2 → 2 → 2 → 1 rows, with the written query highlighted clause by clause), `#sqKeys` (S5: six statements on a fresh copy of the database; the refused ones show the engine's error). Code blocks `<script type="text/x-sql" data-file data-auto>` become CodeMirror SQL editors with ▶ Run (Ctrl+Enter), Reset and a result grid; `data-auto` runs them when they scroll into view. Footer button `data-sq-reset` rebuilds the database.

## S1. What a database is

**In 30 seconds:** a database stores facts in tables. A table has columns (the kind of fact) and rows (one thing). Every row has the same columns. SQL is the language for asking questions and changing what is stored.

**Remember it:** a database is a filing cabinet: a drawer per kind of thing (table), a folder per thing (row), the same labels on every folder (columns), and a number on each folder that no other folder in that drawer has (primary key).

**Go deeper:** engines (PostgreSQL, MySQL/MariaDB, SQLite, Oracle, SQL Server) all speak SQL (standard since 1986) with dialects: LIMIT vs FETCH FIRST vs TOP, `||` vs CONCAT, dates. Relational = tables that reference each other by key, so each fact is stored once.

## S2. Tables, keys and the dealership schema

**In 30 seconds:** a primary key identifies a row (unique, never NULL). A foreign key holds another table's primary key: `sales.car_id` holds a `cars.id`. The schema is the set of tables and the keys that link them.

Foreign keys in the seed: `sales.car_id → cars`, `sales.customer_id → customers`, `sales.employee_id → employees`, `services.car_id → cars`, `customers.referred_by → customers` (self), `employees.manager_id → employees` (self).

**Try it:** `SELECT * FROM cars;` → 12 rows (id, brand, model, year, price, colour, in_stock); car 11 Alto has colour NULL.

**Go deeper:** surrogate vs natural keys (`cities.name` is natural), UNIQUE on the natural key, composite keys, self-references for trees.

## S3. Your first query: SELECT … FROM

**In 30 seconds:** SELECT names columns, FROM the table, `*` = every column, ORDER BY sorts, LIMIT cuts, AS renames. Keywords are case-insensitive; convention is UPPERCASE keywords.

```sql
SELECT brand, model, price FROM cars ORDER BY price DESC LIMIT 3;
-- Toyota | Innova | 2100000
-- Mahindra | XUV700 | 2050000
-- Kia | Seltos | 1550000

SELECT model, price / 100000 AS lakhs_int, price * 1.0 / 100000 AS lakhs, brand || ' ' || model AS full_name
FROM cars WHERE brand = 'Maruti';
-- Swift  | 6 | 6.5 | Maruti Swift
-- Baleno | 7 | 7.8 | Maruti Baleno
-- Alto   | 4 | 4.2 | Maruti Alto
SELECT 7 / 2 AS q, 7 / 2.0 AS d, 'a' || 'b' AS s;   -- 3 | 3.5 | ab
```

**Common mistakes:** `SELECT *` in application code; relying on order without ORDER BY; `price / 100000` expecting 6.5; double quotes around text (standard SQL: double quotes = identifier, single quotes = string).

**Dialects:** LIMIT 3 (SQLite, PostgreSQL also FETCH FIRST 3 ROWS ONLY, MySQL LIMIT); text join `||` (SQLite, PostgreSQL) vs CONCAT (MySQL, where `||` is OR unless PIPES_AS_CONCAT); `7 / 2` = 3 in SQLite/PostgreSQL but 3.5000 in MySQL (use DIV); identifier case: SQLite insensitive, PostgreSQL folds to lowercase unless quoted, MySQL table names follow the file system.

## S4. How a query really runs: the logical order

**In 30 seconds:** written SELECT-first, executed **FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT**. Hence: WHERE cannot see a SELECT alias (does not exist yet) nor use COUNT(*) (nothing grouped yet); HAVING can use aggregates; ORDER BY can use the alias.

**Remember it:** "From Where Groups Have Selected Order Limits".

The lab's query and the rows at each step:

```sql
SELECT brand, COUNT(*) AS models, MIN(price) AS cheapest
FROM cars                      -- 1. 12 rows
WHERE year >= 2023             -- 2. 9 rows
GROUP BY brand                 -- 3. 6 groups: Hyundai 2/820000, Kia 1, Mahindra 1, Maruti 1/780000, Tata 3/700000, Toyota 1
HAVING COUNT(*) >= 2           -- 4. 2 groups: Hyundai, Tata
                               -- 5. SELECT shapes/names the columns
ORDER BY cheapest              -- 6. Tata 3 700000, Hyundai 2 820000
LIMIT 1;                       -- 7. Tata | 3 | 700000
```

Edits to try: `WHERE models >= 2` → error: no such column: models. `ORDER BY models` → works.

**Go deeper:** logical order is the definition of the result; the planner may use indexes, reorder filters and stop early for LIMIT while giving the same answer (S07 shows plans). Alias in GROUP BY/HAVING: MySQL and SQLite allow, PostgreSQL allows in GROUP BY only; portable code repeats the expression.

## S5. Primary keys, foreign keys and NULL

**In 30 seconds:** keys are rules the database enforces: duplicate primary key → refused; foreign key pointing at nothing → refused; a refused statement changes nothing. NULL = no value (not 0, not ''). Any comparison with NULL is unknown, so `city = NULL` never matches; use IS NULL. COUNT(*) counts rows, COUNT(col) counts non-NULL values.

Lab statements (each on a fresh copy of the database):

```sql
INSERT INTO cars VALUES (1, 'Maruti', 'Dzire', 2024, 700000, 'white', 1);   -- UNIQUE constraint failed: cars.id
INSERT INTO sales VALUES (16, 99, 1, 4, '2024-09-01', 100);                 -- FOREIGN KEY constraint failed
INSERT INTO customers (id, name, joined_on) VALUES (11, 'Nikhil', '2024-09-01');
SELECT id, name, city, referred_by FROM customers WHERE id = 11;             -- 11 | Nikhil | NULL | NULL
SELECT COUNT(*) AS all_rows, COUNT(cost) AS with_cost FROM services;         -- 8 | 6
SELECT name FROM customers WHERE city = NULL;                               -- no rows
SELECT name FROM customers WHERE city IS NULL;                              -- Rahul
```

**Remember it:** NULL is an empty label on the folder; you can only ask "is it empty?".

**Go deeper:** PRIMARY KEY, UNIQUE, NOT NULL, CHECK, DEFAULT, FOREIGN KEY … ON DELETE CASCADE | SET NULL | RESTRICT. SQLite checks foreign keys only after `PRAGMA foreign_keys = ON` per connection (the seed turns it on); PostgreSQL and MySQL/InnoDB always.

## S6. Review

8 interview Q&A (Q1 PK vs FK · Q2 execution order · Q3 WHERE vs HAVING · Q4 `= NULL` · Q5 COUNT variants: 8, 6, 6 · Q6 cost of `SELECT *` · Q7 order without ORDER BY undefined · Q8 schema), 5 takeaways, quiz `QZ.s00` (12, in `assets/data/quiz-data.js`; verified answers: 7/2 → 3; `= NULL` → 0 rows; COUNT 8/6; OFFSET 2 LIMIT 3 by joined_on → Meera, Kiran, Divya; the two constraint errors), recall `RC.s00`.

Other verified facts for later lessons: `SELECT DISTINCT brand` → 7 brands; most expensive = Toyota Innova; customers with most purchases: Asha 3, Meera 2, Priya 2; 8 sales over 10 lakh; 7 models in stock; the only employee without a manager: Lakshmi 95000; `year > 2023 AND price < 1500000` → Creta, Nexon.
