# Patterns 08: Abstract Factory

Page: `patterns/08-abstract-factory.html` (`data-page="p08"`, band `#p08`, section ids `abf-*`). Labs: `assets/labs/labs-patterns-p08.js` (`abfpain`, `abfref`, `abfrun`, `abfuml`; playground `abfplay`). Quiz `QZ.p08` (12: 4 B, 5 I, 3 A answers spread) and recall `RC.p08` were written to a scratch folder (`/tmp/dp-checks/abstract-factory/quiz.js`), not merged yet (`node scripts/dp-checks/qmerge.js lesson <file>`). Built 2026-10-28 (Move 2 · Create, last page).

## Story and analogy
- Problem: two markets (India, EU); each needs a matching family: `Engine` (BS6 / Euro 6), `Headlights` (left / right traffic beam), `NumberPlate`. Naive code has an if / else ladder per create place; a typo ("EUR") gives EU cars an Indian plate.
- Refactor: product interfaces, `PartsFactory` (createEngine / createHeadlights / createPlate), `IndiaPartsFactory`, `EuPartsFactory`, client `AssemblyLine` with constructor injection, new family `UsPartsFactory` = one class.
- Weakness shown honestly: new product (`Battery`) edits the interface and every factory (`NewProduct.java`).
- Each create method is a Factory Method (links to 04). Analogy: matched furniture set from one showroom.
- §07 ends with the Move 2 recap table (04, 05, 06, 07 linked).

## Programs (all ran on JDK 25)
`AbfBefore`, `AbstractFactory` (After, includes US), `NewProduct`, `ModernFactory` (record of Suppliers, `enum Market implements PartsFactory`, choose once at startup), exercises `ExJapan`, `FakeFactory`, spot-it `SpotXml` (`DocumentBuilderFactory`).

## JDK / Spring (conceptually similar, say so)
`DocumentBuilderFactory`, `TransformerFactory`, `java.sql.Connection` creating statements, Spring `@Profile` on `@Configuration`.
