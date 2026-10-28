# Patterns 07 — Prototype

Page: `patterns/07-prototype.html` (`data-page="p07"`, band `#p07`, section ids `pro-*`). Labs: `assets/labs/labs-patterns-p07.js` (`propain`, `proref`, `prorun`, `prouml` with views Roles / Dealership; playground `proplay`). Programs live in the page's editors; scratch copies were run on JDK 25.

## Story and analogy
- Problem: a demo car (trim, colour, accessories `List`, dealer-fitted extras `Map`, `ServiceHistory`) is long to set up; booking code holds only a `Car` and needs a copy.
- Analogy: a photocopier / the display car used as the master for an order (glyph: photocopier). Shallow copy = photocopy of a form that says "see attached sheet".
- Teaching order: repeated set-up + instanceof `duplicate()` (forgets fields) → copy constructor, first shallow (bug) → copy the list → copy `ServiceHistory` (deep) → `Car.copy()` on the interface (`EvCar` overrides) → `CarRegistry` of templates → clients copy and tweak.

## Programs (all ran on JDK 25)
`PrototypeBefore`, `PrototypePattern` (registry, "nexon-demo", "tiago-ev-demo", deep copy constructors), `PrototypeShallow` (matches the sequence lab and playground: shallow shares list = true, deep = false), `PrototypeClone` (Cloneable: shared list, constructor count 1, `CloneNotSupportedException: NotCloneable`, `ArrayList.clone()` shallow), `PrototypeModern` (record `CarSpec`, `withColour`, `List.copyOf` defensive copy). Exercises `ExCopy`, `ExRegistry`, `SpotProto` (`new ArrayList<>(a)` shares the `StringBuilder`).

## Facts used
- Effective Java Item 13 (clone problems): shallow by default, no constructor, checked exception, final fields, `Cloneable` declares no method; arrays are the exception.
- `ArrayList.clone()` and `ArrayList(Collection)` are shallow. Spring `@Scope("prototype")` builds a new bean from the definition (conceptually similar only); prototype bean injected into a singleton is created once (use `ObjectProvider`).
- Cycles: identity map original → copy.
- Links: 05 Builder, 06 Singleton (cloning can break one), 04 Factory Method; Abstract Factory 08, Composite 19, Memento 18 named as coming.

## Playground
`proplay`: select template (nexon-demo / punch-demo), toggle deep copy, buttons copy / add accessory to copy / Reset. Shallow mode: shared list node turns red. Output lines equal what `PrototypeShallow` prints (describe format); adding before copying prints the real NullPointerException.
Note: the playground uses `punch-demo` (both templates are `PetrolCar`, the class used by `PrototypeShallow`); `tiago-ev-demo` (an `EvCar`) is in `PrototypePattern`.
