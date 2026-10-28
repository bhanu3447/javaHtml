# Patterns 05 — Builder

Page: `patterns/05-builder.html` (`data-page="p05"`, band `#p05`, section ids `bld-*`). Labs: `assets/labs/labs-patterns-p05.js` (`bldpain`, `bldref`, `bldrun`, `blduml` with views Roles / Dealership / GoF Director; playground `bldplay`). Quiz `QZ.p05` (12: 4 B, 5 I, 3 A) and recall `RC.p05` were written to a scratch folder (`/tmp/dp-checks/builder/quiz.js`) and are merged by the lead with `node scripts/dp-checks/qmerge.js lesson <quiz.js>`.

## Story and analogy
- Problem: `Car` with required model and fuel, optional colour, sunroof, alloy wheels, GPS, warranty, seat covers. Telescoping constructors (`new Car("Nexon","EV","Red",true,false,true,3)`: which boolean?), then JavaBeans setters (mutable, half-built, nothing validates).
- Analogy: the dealership order form filled step by step; "Confirm" (`build()`) checks it and hands over the finished car; parts snapping onto a frame (the glyph).
- Teaching order: telescoping + setters (Before) → Effective Java Builder (nested `Car.Builder`, required values in its constructor, fluent setters returning `this`, `build()` validates, private `Car(Builder)` with final fields). GoF Builder (Director + `VehicleBuilder` + `CarBuilder`/`PriceSheetBuilder`) shown in §05 as a runnable program and a third Structure tab.
- Look-alike line used everywhere: Factory Method decides WHICH class (link back to `04-factory-method.html`); Builder decides HOW one complex object is assembled.

## Rules in the code
- `sunroof && trim.equals("Base")` → `IllegalStateException("Sunroof is not available on the Base trim")`; warranty outside 0–5 → `IllegalStateException("Warranty years must be 0 to 5, got N")`. Playground prints the same messages. Prices: base by fuel (EV 1650000, Diesel 1400000, Petrol 1250000) + Top trim 150000 + sunroof 60000 + alloy 40000 + GPS 25000 + 12000 per warranty year.

## Programs (all ran on JDK 25)
`BuilderBefore`, `BuilderPattern` (After), `GofBuilder`, `ModernBuilder` (record compact constructor, `withColour`, `toBuilder()`, `StringBuilder`, `Stream.builder()`, `HttpRequest.newBuilder()` built not sent), `StepBuilder`; exercises `ExSeatCovers`, `ExRule`; spot-it `SpotBuilder` (`StringBuilder`, answer `toString()`).

## Notes
- JDK/Spring: `StringBuilder`, `HttpRequest.newBuilder()`, `Stream.builder()`, `Locale.Builder`, `ProcessBuilder` ("conceptually similar"), Spring `ResponseEntity.ok().header().body()`, `UriComponentsBuilder`, `RestClient.builder()` (6.1+), Lombok `@Builder` (mentioned, not used).
- Abstract Factory (lesson 08), Prototype, Composite are named, not linked (not built).
- Playground is not covered by the gallery check (gx.sh); it was screenshotted with a one-off script in light and dark.
