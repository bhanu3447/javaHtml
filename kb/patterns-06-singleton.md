# Patterns 06 — Singleton

Page: `patterns/06-singleton.html` (`data-page="p06"`, band `#p06`, section ids `sgl-*`). Labs: `assets/labs/labs-patterns-p06.js` (`sglpain`, `sglref`, `sglrun`, `sgluml` with views Roles / Dealership; playground `sglplay`). Programs live in the page's editors; scratch copies were run on JDK 25 (`java File.java`).

## Story and analogy
- Problem: one `VehicleRegistry` (cars in stock by chassis number). Sales desk, service desk and reports each write `new VehicleRegistry()`, so three copies disagree (CH-101 sold at the desk, still "in stock" in reports; counts 2, 3, 3).
- Analogy: the showroom's single stock register book (glyph: one key on a hook).
- Teaching order: naive `new` everywhere → private constructor → `private static final INSTANCE` (eager) → `public static getInstance()` → desks switched → lazy variant (warning: single thread only). Thread safety deferred to §06 and lesson 24 (coming).

## Programs (all ran on JDK 25)
`SingletonBefore` (7 lines), `SingletonPattern` (eager, 5), `SingletonRun` (lazy, 5; matches the sequence lab), `SingletonVariants` (synchronized / DCL+volatile / holder / enum, 8 threads each, prints "1 distinct instance"), `SingletonBreakers` (reflection breaks class, enum throws "Cannot reflectively create enum objects", guarded constructor throws), `SingletonSerial` (plain Serializable false, readResolve true, enum true, Cloneable clone false). Exercises `ExInvoice`, `ExTestable` (interface injection), `SpotSingleton` (Runtime.getRuntime, Collections.emptyList, two `new ArrayList`: true, true, false).
- The DCL reordering race is explained, not demonstrated (it is not reproducible on demand).

## Facts used
- `Runtime.getRuntime()` is a real Singleton; `Desktop.getDesktop()` one per application; `Collections.emptyList()` shared immutable instance ("similar idea"; same instance in OpenJDK). Spring default scope = singleton, one per `ApplicationContext`.
- "One per JVM" is really one per class loader.
- Links: 03 State (stateless states as shared singletons), 04 Factory Method, 05 Builder; Abstract Factory 08, Facade 12, Flyweight 23 named as coming.

## Playground
`sglplay`: buttons Sales desk / Service desk / Reports getInstance(), Sell car CH-101, toggle "naive new (no Singleton)". Output lines equal what SingletonBefore / SingletonRun print; selling with no sales-desk registry prints the real NullPointerException message.
