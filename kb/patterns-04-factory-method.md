# Patterns 04 — Factory Method

Page: `patterns/04-factory-method.html` (`data-page="p04"`, band `#p04`, section ids `fac-*`). Labs: `assets/labs/labs-patterns-p04.js` (`facpain`, `facref`, `facrun`, `facuml`; playground `facplay`). Quiz `QZ.p04` (12: 4 B, 6 I, 2 A) and recall `RC.p04` were written to a scratch folder and are merged with `node scripts/dp-checks/qmerge.js` (not merged yet). Built 2026-10-28 (Move 2 · Create, first page).

## Story and analogy
- Problem: `new PetrolCar/DieselCar/EvCar` plus an if / else on the fuel in `Checkout`, `TestDrive`, `Reports`; CNG means 3 edits and a forgotten ladder is a silent bug.
- Analogy: a factory machine with an order slot (counter = `Showroom.sellCar()`, slot = `createCar()`, machines = `CityShowroom`/`EvShowroom`).
- Teaching order: naive scattered `new` → Simple Factory (`CarFactory.create`, "not a GoF pattern") → Factory Method (`Showroom` / `createCar()`), linked to Template Method (02) and Strategy (01).

## Programs (all ran on JDK 25)
`FactoryBefore`, `SimpleFactory`, `FactoryMethod` (After, includes `CngShowroom`), `ModernFactory` (`Supplier`, constructor references, `Map<String, Supplier<Car>>`, `List.of`, `Optional.of`, `LocalDate.of`, `Integer.valueOf` cache), exercises `ExDiesel`, `FakeShowroom`, spot-it `SpotIterator` (`Itr` / `ListItr`).

## Notes
- Static factory method (Effective Java item 1) vs GoF Factory Method explained in §05 and interview card 04.
- JDK/Spring: `Collection.iterator()`, `Calendar.getInstance()`, `NumberFormat.getInstance()`, `DocumentBuilderFactory.newInstance()`, Spring `@Bean` and `FactoryBean<T>` (conceptual).
- Abstract Factory (lesson 08) and Builder (lesson 05) are named, not linked (not built).
- Polish later: `facref` steps 6–7 have crossing creator→product arrows (readable, busy).
