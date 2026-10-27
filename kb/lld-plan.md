# Low-Level Design course — build prompt and status (written 2026-10-28)

**Status:** prompt only; to be built **after** the Design Patterns course (`kb/design-patterns-plan.md`). The user decided (2026-10-28) to learn the important patterns first and the low-level design round separately afterwards. This file keeps that second part.

---

## The prompt

Add a fifth course, **Low-Level Design for Interviews**, after the Design Patterns course exists. Same rules as that course (read `kb/design-patterns-plan.md` → "Rules that carry over unchanged" and its shared lab kit with the class-box renderer, Structure/Runtime views and Before/After code). Folder `lld/`, `data-course="lld"`, a `COURSES` row, a hub card, its own index.

### The target: the low-level design round at top tech companies
Large product companies usually test design in two separate rounds: **low-level design** (object-oriented design, often a 60–90 minute "machine coding" round where you write working, extensible code) and **high-level design** (system design). Patterns are tested inside the LLD round. This course must make the reader pass it, so it teaches what interviewers grade:

| Interviewers look for | Where the course teaches it |
|---|---|
| Clarifying requirements and scope before designing | the method (L01), practised in every case study |
| Clean entities, responsibilities and relationships | every case study |
| SOLID and design principles | recap in L01 (taught in the patterns course P00) |
| Choosing the right pattern **and saying why** | every case study names the problem each pattern solves |
| Extensibility: "now add X" follow-ups without rewriting | a follow-up step in every case study |
| Thread safety and concurrency | L00 |
| Working, readable, testable code in limited time | timed machine-coding mode (L07), a unit test in every case study |
| Reading and drawing class and sequence diagrams | Structure and Runtime views |
| Java fluency: interfaces, enums, generics, immutability, equals/hashCode, collections, exceptions | used throughout |

### The LLD method (L01, then used in every case study)
A fixed 7-step routine the reader can repeat under pressure, shown as a visual stepper with a timer bar for a 60-minute round:
1. **Requirements** (5 min): functional, non-functional, out of scope; ask, do not assume.
2. **Entities** (5 min): nouns become classes, verbs become methods; find the core objects.
3. **Relationships and class diagram** (10 min): is-a, has-a, uses; multiplicities; interfaces at the seams.
4. **APIs** (5 min): the public methods a client calls; inputs, outputs, errors.
5. **Patterns** (5 min): pick them to solve a named problem, not to decorate.
6. **Code** (25 min): core flow first, then edge cases; enums for states; no premature generality.
7. **Concurrency, extensibility, tests** (5 min): what breaks with two threads; the "now add X" follow-up; one unit test.

### Case studies
Each case study is a full worked interview: requirements → class diagram (Structure view) → one scenario stepped (Runtime view) → complete runnable Java → a concurrency check → one follow-up change → a unit test → a self-review rubric.

| Case study | Patterns and ideas it exercises |
|---|---|
| Parking lot | Strategy (spot allocation, pricing), Factory, Singleton, State; concurrency on spot booking |
| Elevator system | State, Strategy (scheduling), Observer, Command; a scheduler loop |
| Vending machine | State, Chain of Responsibility (change), Strategy (payment) |
| LRU / LFU cache | HashMap + doubly linked list, generics, thread-safe version, eviction Strategy |
| Rate limiter | Strategy (token bucket, sliding window), thread safety, clock injection for tests |
| Logger / logging framework | Singleton, Chain of Responsibility (levels), Observer (appenders), Builder |
| In-memory key-value store with TTL | Facade, Strategy (eviction), scheduled cleanup, ConcurrentHashMap |
| Pub-sub / message queue | Observer, Producer–Consumer, BlockingQueue, at-least-once delivery |
| Task scheduler | Command, PriorityQueue, ScheduledExecutorService, retries |
| Splitwise (expense sharing) | Strategy (equal / exact / percent split), simplifying debts |
| Movie ticket booking | concurrency on seat locks, State, Facade, idempotency |
| Car rental / ride sharing | Strategy (pricing, matching), State (trip), Observer (driver updates) |
| Library management | Repository, Observer (reservations), State (book copy) |
| Snake and ladder / tic-tac-toe / chess | game loop, Strategy (players), Command (moves, undo), extensible rules |
| ATM | State, Chain of Responsibility (cash dispenser), Facade |
| Hotel / meeting-room booking | interval overlaps, Strategy, concurrency |
| Food delivery / e-commerce cart and checkout | Builder, Strategy (discounts), State (order), Observer |
| Notification service | Strategy / Factory (SMS, email, push), Decorator (retry, logging), Template Method |
| URL shortener (LLD view) | encoding Strategy, Repository, collision handling |

### Lessons
| # | Page | Content |
|---|---|---|
| L00 | `lld/00-concurrency.html` | Concurrency for LLD: race conditions seen step by step, synchronized and locks, ReentrantReadWriteLock, atomic classes, ConcurrentHashMap, immutability, thread-safe Singleton, Producer–Consumer with BlockingQueue, thread pools, deadlock (visual) and how to avoid it |
| L01 | `lld/01-method.html` | The 7-step method with a timed stepper; worked mini-example; the grading rubric; common mistakes (jumping to code, God class, over-engineering) |
| L02 | `lld/02-parking-elevator.html` | Parking lot, elevator, vending machine |
| L03 | `lld/03-caches-limits.html` | LRU/LFU cache, rate limiter, key-value store with TTL, logger |
| L04 | `lld/04-queues-schedulers.html` | Pub-sub / message queue, task scheduler, notification service |
| L05 | `lld/05-booking-money.html` | Movie ticket booking, hotel / meeting-room booking, Splitwise, ATM |
| L06 | `lld/06-apps-games.html` | Car rental / ride sharing, food delivery / cart, library, URL shortener, snake and ladder, tic-tac-toe, chess |
| L07 | `lld/07-interview.html` | Timed machine-coding mode (pick a problem, 60/90-minute timer, checklist, compare with the model solution); 30 most-asked LLD/OOD questions with spoken answers; mock interview |

### Phases (one per session)
1. Course shell + **L00** concurrency. 2. **L01** method + **L02**. 3. **L03**. 4. **L04**. 5. **L05**. 6. **L06**. 7. **L07** + full visual audit.

### Acceptance
- Every case study: requirements, class diagram, one stepped scenario, complete Java that compiles and runs on JDK 25, a concurrency check, one follow-up change, one unit test, and the rubric filled in for the model solution.
- Same visual checks as the patterns course; `kb/lld-NN-name.md`, `QZ`/`RC`, `KB.md` row, change-log line, index rebuilt.

### What else a top-tech loop needs (separate courses, not planned yet)
- **Data structures and algorithms**: usually the largest part of the loop (arrays, hashing, two pointers, sliding window, stacks, heaps, trees, graphs, binary search, dynamic programming, complexity).
- **High-level system design**: requirements, estimation, APIs, data model, SQL vs NoSQL, caching, sharding, replication, queues, consistency; classic designs (URL shortener, news feed, chat, notification system).
- **Behavioural**: structured stories (STAR), ownership, conflict, failure.
