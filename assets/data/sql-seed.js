/* The one database every SQL lesson queries: a small car dealership (the Java course's car metaphor, continued).
   Deterministic, ~60 rows. Loaded into sql.js (SQLite) by labs-sql.js; also loadable in Node for verification
   (scratch script sqlcheck.mjs). Facts worth knowing when writing lessons:
   - cars = the catalogue (one row per model); in_stock 0/1. A model can appear in many sales.
   - customer 8 lives in 'Vizag', which is not in cities (LEFT JOIN shows it); customer 10 has city NULL and no sales.
   - employees form a tree: 1 manager → leads 2, 3 → sales staff 4, 5 (under 2) and 6 (under 3). Only 4, 5, 6 sell.
   - services has NULL cost (ids 4, 7) and NULL note (ids 2, 6): COUNT(*) = 8, COUNT(cost) = 6. */
const SQL_SEED = `
PRAGMA foreign_keys = ON;

CREATE TABLE cities (
  name   TEXT PRIMARY KEY,
  region TEXT NOT NULL
);
INSERT INTO cities VALUES
  ('Nellore','South'), ('Chennai','South'), ('Bengaluru','South'), ('Hyderabad','South'),
  ('Mumbai','West'), ('Pune','West'), ('Delhi','North'), ('Kolkata','East');

CREATE TABLE customers (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  city        TEXT,
  joined_on   DATE NOT NULL,
  referred_by INTEGER REFERENCES customers(id)
);
INSERT INTO customers VALUES
  (1, 'Asha',   'Nellore',   '2023-01-15', NULL),
  (2, 'Ravi',   'Chennai',   '2023-02-03', 1),
  (3, 'Meera',  'Bengaluru', '2023-03-21', 1),
  (4, 'Kiran',  'Hyderabad', '2023-05-09', NULL),
  (5, 'Divya',  'Mumbai',    '2023-06-30', 3),
  (6, 'Arjun',  'Pune',      '2023-08-12', NULL),
  (7, 'Sneha',  'Delhi',     '2023-09-01', 4),
  (8, 'Vikram', 'Vizag',     '2023-11-18', NULL),
  (9, 'Priya',  'Chennai',   '2024-01-07', 2),
  (10,'Rahul',  NULL,        '2024-02-14', NULL);

CREATE TABLE cars (
  id       INTEGER PRIMARY KEY,
  brand    TEXT NOT NULL,
  model    TEXT NOT NULL,
  year     INTEGER NOT NULL,
  price    INTEGER NOT NULL,
  colour   TEXT,
  in_stock INTEGER NOT NULL DEFAULT 1
);
INSERT INTO cars VALUES
  (1, 'Maruti',   'Swift',    2022,  650000, 'red',    1),
  (2, 'Maruti',   'Baleno',   2023,  780000, 'blue',   0),
  (3, 'Hyundai',  'i20',      2023,  820000, 'white',  1),
  (4, 'Hyundai',  'Creta',    2024, 1450000, 'black',  0),
  (5, 'Tata',     'Nexon',    2024, 1150000, 'blue',   1),
  (6, 'Tata',     'Punch',    2023,  700000, 'white',  0),
  (7, 'Kia',      'Seltos',   2024, 1550000, 'grey',   1),
  (8, 'Honda',    'City',     2022, 1250000, 'silver', 0),
  (9, 'Toyota',   'Innova',   2023, 2100000, 'white',  1),
  (10,'Mahindra', 'XUV700',   2024, 2050000, 'red',    0),
  (11,'Maruti',   'Alto',     2021,  420000, NULL,     1),
  (12,'Tata',     'Nexon EV', 2024, 1500000, 'teal',   1);

CREATE TABLE employees (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL,
  manager_id INTEGER REFERENCES employees(id),
  hired_on   DATE NOT NULL,
  salary     INTEGER NOT NULL
);
INSERT INTO employees VALUES
  (1, 'Lakshmi', 'manager', NULL, '2019-04-01', 95000),
  (2, 'Suresh',  'lead',    1,    '2020-07-15', 70000),
  (3, 'Anita',   'lead',    1,    '2021-01-10', 72000),
  (4, 'Mohan',   'sales',   2,    '2022-03-01', 45000),
  (5, 'Farah',   'sales',   2,    '2022-09-20', 48000),
  (6, 'Dev',     'sales',   3,    '2023-05-05', 42000);

CREATE TABLE sales (
  id          INTEGER PRIMARY KEY,
  car_id      INTEGER NOT NULL REFERENCES cars(id),
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  sold_on     DATE NOT NULL,
  amount      INTEGER NOT NULL
);
INSERT INTO sales VALUES
  (1,  1,  1, 4, '2024-01-05',  640000),
  (2,  2,  2, 4, '2024-01-20',  770000),
  (3,  3,  3, 5, '2024-02-02',  815000),
  (4,  4,  1, 5, '2024-02-14', 1420000),
  (5,  5,  5, 6, '2024-03-03', 1140000),
  (6,  6,  6, 4, '2024-03-18',  695000),
  (7,  7,  7, 5, '2024-04-01', 1530000),
  (8,  8,  2, 6, '2024-04-22', 1230000),
  (9,  9,  9, 4, '2024-05-06', 2090000),
  (10, 10, 4, 5, '2024-05-30', 2040000),
  (11, 1,  9, 6, '2024-06-11',  645000),
  (12, 5,  3, 4, '2024-06-25', 1145000),
  (13, 12, 7, 5, '2024-07-09', 1490000),
  (14, 2,  8, 6, '2024-07-21',  775000),
  (15, 3,  1, 4, '2024-08-02',  810000);

CREATE TABLE services (
  id      INTEGER PRIMARY KEY,
  car_id  INTEGER NOT NULL REFERENCES cars(id),
  done_on DATE NOT NULL,
  cost    INTEGER,
  note    TEXT
);
INSERT INTO services VALUES
  (1, 1, '2024-03-10', 3500, 'first service'),
  (2, 2, '2024-04-15', 4200, NULL),
  (3, 1, '2024-07-12', 5100, 'brake pads'),
  (4, 5, '2024-06-01', NULL, 'under warranty'),
  (5, 8, '2024-08-20', 6900, 'tyres'),
  (6, 3, '2024-05-11', 3900, NULL),
  (7, 9, '2024-09-02', NULL, 'recall check'),
  (8, 4, '2024-09-15', 8200, 'insurance claim');
`;
if (typeof module !== "undefined") module.exports = SQL_SEED;
