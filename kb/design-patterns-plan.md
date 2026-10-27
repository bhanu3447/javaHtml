# Design Patterns course — build prompt and status (written 2026-10-28)

**Status:** prompt written, nothing built yet. History: the user asked "one more I need: design patterns; first give prompt, then will start", then asked what top-tech (MAANG-style) interviews need, then decided (same day): "first understand and learn all the important design patterns asked in MAANG, then separately learn the rest". So this course is **patterns only**, ordered by how often each pattern comes up in interviews. Low-level design (method, case studies, concurrency, machine coding) moved to its own prompt, `kb/lld-plan.md`, for later.

Say "start" to begin phase 1, or paste one phase into a session.

---

## The prompt

You are extending the static course site in this folder (read `CLAUDE.md` first). It has three courses: **Java** (`java/`), **SQL** (`sql/`) and the **Spring Boot lab** (`spring/`). Add a fourth course, **Design Patterns for Interviews**, built like the Java lessons and visual like the Spring lab: every pattern is understood by *seeing* it run, and every pattern comes with the exact questions interviewers ask about it.

### Rules that carry over unchanged
- No new tooling: plain HTML, `assets/css/course.css`, classic scripts in one global scope, CDN libraries only. No `node_modules`, no backups, no `-v2` files.
- Same theme and system as Java/SQL/Spring: `<body data-course="patterns">`, the shared nav, contents panel, search, theme toggle; a row in `COURSES` (course.js) and a card on the hub `index.html`; its own index `node scripts/build-index.mjs patterns` → `assets/data/patterns-index.js`.
- **Every Java program runs on JDK 25 before it goes in**; outputs go in comments; editors are `<script type="text/x-java" data-file="X.java">` so ▶ Run (Wandbox) works as on the Java pages.
- Learning order: a term is defined before any figure or code uses it. Prose under 250 words per section outside `<details class="d">Go deeper</details>`.
- Every visual passes the checks from `kb/spring-visual-audit-plan.md`: state gallery reviewed in light and dark, labels fit (0.63 em), no overlaps, controls (Back/Next/Play, STEP n / N bar), contrast in all nine themes, no console errors, no horizontal scroll at 500 px.
- Reduced motion honoured; keyboard ← → Space on every lab; no copyrighted characters; record everything in `kb/` and the change log.

### Which patterns, in which order: by interview importance
Interviews do not weigh the 23 classic (Gang of Four) patterns equally. The course teaches them in three tiers, most-asked first, so the reader is interview-ready after Tier 1 and complete after Tier 3.

| Tier | Patterns | Why this tier |
|---|---|---|
| **Tier 1: asked constantly** | Singleton, Factory Method (with Simple Factory), Builder, Strategy, Observer, Decorator, Adapter, Proxy, Facade, State, Command, Template Method, Chain of Responsibility | come up directly ("implement a thread-safe Singleton", "Decorator vs inheritance?") and inside almost every design problem |
| **Tier 2: asked often** | Abstract Factory, Composite, Iterator, Prototype | asked as follow-ups and in comparisons |
| **Tier 3: know the idea** | Bridge, Flyweight, Mediator, Memento, Visitor, Interpreter | explain intent, one example, when to use; rarely coded in an interview |

### One story for the whole course: the car dealership
The Java course's metaphor is the car and SQL uses a car dealership database, so patterns live in the same world. Every pattern solves one dealership problem:

| Pattern | Dealership problem it solves |
|---|---|
| Singleton | one shared vehicle registry for the whole showroom |
| Factory Method | `CarFactory.create("SUV")` without `new` scattered everywhere |
| Builder | a car with 12 optional extras, readable and immutable |
| Strategy | interchangeable discount rules (festival, loyalty, none) |
| Observer | customers notified when a price drops |
| Decorator | add-ons (sunroof, GPS, warranty) each adding to the price |
| Adapter | plug an old payment gateway into the new checkout |
| Proxy | a test-drive key: checks access, loads lazily, logs use |
| Facade | one `buyCar()` hiding finance, insurance, registration |
| State | an order moving booked → paid → delivered → cancelled |
| Command | workshop jobs as objects: queue, log, undo |
| Template Method | a fixed inspection checklist with model-specific steps |
| Chain of Responsibility | a loan approval chain (clerk → manager → bank) |
| Abstract Factory | a family of parts per market (India vs EU: engine, lights, plates) |
| Composite | a car as a tree of parts; price = sum of the tree |
| Iterator | walk the inventory without knowing how it is stored |
| Prototype | clone a configured demo car instead of rebuilding it |
| Bridge | vehicle type × engine type without a class explosion |
| Flyweight | thousands of cars sharing one model spec and paint record |
| Mediator | a showroom coordinator instead of everyone calling everyone |
| Memento | undo in the car configurator |
| Visitor | tax and valuation over different vehicle types |
| Interpreter | a tiny search language ("brand:Tata price<10L") |

### Shared lab kit (`assets/labs/labs-patterns.js`, built in phase 1)
- Port the Spring lab's data-driven engine (`LABS2` + `buildLab2`: boxes, arrows, curved edges, per-lab arrowheads, steps with cur/on/good/bad/dim/lines/txt/note, STEP n / N bar) into a shared kit so every pattern lab is **data only**.
- Add a **class-box renderer**: UML-lite boxes (name, key fields, key methods) with arrow kinds for *implements* (dashed, hollow head), *extends* (solid, hollow head), *has-a* (diamond) and *calls* (plain arrow), and a tiny legend. P00 teaches how to read them; every pattern then has one.
- Two views per pattern, toggled by tabs: **Structure** (the class diagram) and **Runtime** (objects and calls stepping through one scenario, e.g. a price drop notifying three customers).
- **Before / After** code pair per pattern: the painful version first, then the pattern, both runnable.

### Every pattern section has the same shape
1. **In 30 seconds**: intent in one line + the dealership problem.
2. **Before**: the naive code and why it hurts (runnable).
3. **Visual lab**: Structure and Runtime, stepped.
4. **After**: the pattern in code (runnable), with the output.
5. **When to use / when not** (2 + 2 bullets) and the classic mistake.
6. **Where you already use it**: JDK and Spring examples (list below).
7. **The interview angle**: the questions actually asked about this pattern, each with a 30-second spoken answer and, where they ask for code, the code. Examples: Singleton → lazy vs eager, `synchronized` cost, double-checked locking and why `volatile` is needed, the enum Singleton, how reflection, serialization and cloning break it, Singleton vs Spring singleton scope. Decorator → why not subclasses, Decorator vs Proxy. Factory → Factory Method vs Abstract Factory vs Simple Factory. Observer → push vs pull, memory leaks from forgotten listeners, Observer vs pub-sub.
8. **Quiz** (`QZ.pNN`, labelled B/I/A) and **recall prompts** (`RC.pNN`).

### Where Java and Spring already use them (shown in every section, collected in P07)
Singleton → Spring's default bean scope, `Runtime.getRuntime()` · Factory → `BeanFactory`, `Calendar.getInstance()`, `List.of` · Builder → `StringBuilder`, `ResponseEntity`, `RestClient.builder()`, `HttpRequest.newBuilder()` · Strategy → `Comparator`, `HandlerMapping`, `PasswordEncoder` · Observer → `ApplicationEvent` / `@EventListener`, `PropertyChangeListener` · Decorator → `BufferedInputStream`, `Collections.unmodifiableList` · Adapter → `HandlerAdapter`, `Arrays.asList`, `InputStreamReader` · Proxy → `@Transactional`, AOP, JPA lazy loading · Facade → `JdbcTemplate` over JDBC, `SpringApplication.run` · State → thread states, order workflows · Command → `Runnable`, `Callable` · Template Method → `JdbcTemplate`, `AbstractList`, `HttpServlet.service` · Chain of Responsibility → servlet filters, Spring Security filter chain · Iterator → `Iterable`, `Iterator` · Composite → `CompositeHealthContributor`, UI trees · Prototype → `Object.clone`, prototype scope · Flyweight → `Integer.valueOf` cache, string pool · Memento → serialization snapshots · Visitor → `FileVisitor`, annotation processing.

### Lessons (one page each)
| # | Page | Content |
|---|---|---|
| P00 | `patterns/00-foundations.html` | What a pattern is (and is not); the three families (creational, structural, behavioral); interface vs abstract class; composition over inheritance; program to an interface; reading a class diagram; **SOLID** with one before/after lab per principle (the thing every pattern builds on) |
| P01 | `patterns/01-creational.html` | **Tier 1:** Singleton (every variant and how it breaks), Factory Method + Simple Factory, Builder |
| P02 | `patterns/02-strategy-observer.html` | **Tier 1:** Strategy, Observer (the two most used behavioral patterns) |
| P03 | `patterns/03-wrappers.html` | **Tier 1:** Decorator, Adapter, Proxy, Facade (four "wrappers" that look alike, taught together so the differences are clear) |
| P04 | `patterns/04-behaviour.html` | **Tier 1:** State, Command, Template Method, Chain of Responsibility |
| P05 | `patterns/05-tier2.html` | **Tier 2:** Abstract Factory, Composite, Iterator, Prototype |
| P06 | `patterns/06-tier3.html` | **Tier 3:** Bridge, Flyweight, Mediator, Memento, Visitor, Interpreter (intent, one visual, one example, when to use) |
| P07 | `patterns/07-interview.html` | Look-alikes side by side (Strategy vs State, Decorator vs Proxy vs Adapter vs Facade, Factory Method vs Abstract Factory vs Builder, Template Method vs Strategy, Observer vs Mediator); every pattern inside JDK and Spring; a "which pattern?" scenario drill; the most-asked pattern questions with spoken answers; anti-patterns (God object, Singleton abuse, pattern overuse); a mock quiz across all patterns |

`patterns/index.html` is the course home: hero, lesson cards with progress, the three tiers as a roadmap, and a "pattern picker" (problem → pattern).

### Phases (one per session)
1. Course shell: `COURSES` row, hub card, `patterns/index.html`, index build, the shared lab kit with the class-box renderer, and **P00** (foundations + SOLID).
2. **P01** Singleton, Factory, Builder.
3. **P02** Strategy, Observer.
4. **P03** Decorator, Adapter, Proxy, Facade.
5. **P04** State, Command, Template Method, Chain of Responsibility.
6. **P05** Tier 2 + **P06** Tier 3.
7. **P07** interview lesson + a full visual audit of the course (gallery in light and dark, all checks green).

### Acceptance (what "done" means for a lesson)
- Every pattern: before/after code run on JDK 25 with output, a Structure view and a Runtime view, all states reviewed in the gallery in light and dark, and an interview-angle block with spoken answers.
- Checks green: labels fit, no overlaps, controls, contrast in nine themes, no console errors on any page, no horizontal scroll at 500 px.
- `kb/patterns-NN-name.md` written, `QZ`/`RC` added, `KB.md` row, change-log line, index rebuilt.

### After this course
`kb/lld-plan.md` holds the next step: the low-level design round (the 7-step method, concurrency, 19 case studies such as parking lot, elevator, LRU cache and rate limiter, timed machine coding). It builds on every pattern here.
