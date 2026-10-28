# Patterns 03 — State

Page: `patterns/03-state.html` (`data-page="p03"`, band `#p03`, section ids `sta-*`). Labs: `assets/labs/labs-patterns-p03.js` (data only, wrapped in an IIFE, no globals) drawn by the kit `assets/labs/labs-patterns.js`. Quiz `QZ.p03` (12: 4 B, 5 I, 3 A) and recall `RC.p03` (3 per day) are merged into `assets/data/quiz-data.js` (2026-10-28). Built 2026-10-28 (phase C, Move 1 · Swap, last page of the move).

## Sections
1. **See it** (`sta-see`, Level 1): pattern header (`.dp-pat data-p="State"`), In 30 seconds, the dealership problem (order lifecycle Booked → Paid → Delivered, Cancelled from Booked / Paid with refund from Paid, never after delivery), analogy **traffic light** (light box = context `Order`, current lamp = `state` field, "what every lamp must answer" = `OrderState`, red/amber/green = concrete states, timer tick = a request), **Pain lab** `dp-stapain` (1 view "Naive Order", 6 steps, meter "switches to edit when the statuses change" 2 → 6: day 1, cancel, Allocated change request, status leaks to screens/reports, "Payed" typo compiles, rules of Paid scattered over four methods).
2. **Build it** (`sta-build`, Level 2): Before `OrderBefore.java`; what breaks (Open / Closed link to P00, scattered rules, stringly-typed status); **Refactor lab** `dp-staref` (1 view, 7 steps: start → OrderState interface with reject defaults → Booked + Paid → Allocated, Delivered, Cancelled → context delegates → moveTo/reject take a state → same output; meter "Order methods that switch on the status" 4 → 0); After `OrderAfter.java` (same 7 output lines as Before).
3. **Watch it run** (`sta-run`, Level 2): **Runtime lab** `dp-starun` (sequence view, 5 lanes main / b:Order / Booked / Paid / Cancelled, 16 messages, 9 steps: ORD-2 pay, deliver rejected by the default, cancel with refund); **Playground** `dpp-staplay` (buttons Pay / Allocate / Deliver / Cancel + Reset on ORD-1 Rs 700000; state diagram with the current state highlighted, the arrow just taken in the accent colour, a rejected action turns the state red; output lines are exactly what OrderAfter.java prints, prefixed with the call, plus "state = X · allowed now: …").
4. **Practise** (`sta-practise`): beginner (override `cancel` in `Delivered` with a helpful message), intermediate (add `Inspected` + `inspect()` between Allocated and Delivered; solution tested as `StateEx2.java`), Explain it back `p03`.
5. **Choose it** (`sta-choose`, Level 3): **Structure lab** `dp-stauml` (3 views: Roles 5 steps, Dealership 5 steps, States (state-transition diagram) 4 steps); use / don't-use table; comparison table State vs Strategy vs if/switch on an enum; trade-offs; Spring Boot sketch (`@Entity CarOrder` with `@Enumerated(EnumType.STRING)` + `@Version`, `JpaRepository`, `@Service` + `@Transactional`); JDK/Spring: `Thread.State` is an enum of states, NOT the GoF pattern; Spring Statemachine (separate project, conceptual); Spot it on a `Thread.getState()` snippet (answer 2: not the pattern).
6. **Master it** (`sta-master`, Level 4): `OrderEnum.java` (enum with per-constant behaviour, defaults throw `IllegalStateException`, `valueOf("PAID")` for persistence); details: `OrderSealed.java` (sealed interface + records + exhaustive pattern switch, `case Delivered _, Cancelled _`); details: sharing stateless states (per-state Singleton, lesson 06 coming), persistence by name, thread safety; common mistakes; Predict (On hold that resumes to the previous state → `OnHold` class with a `previous` field, answer 3); works well with Strategy, Singleton, Flyweight, Factory Method, Observer, Memento.
7. **Interview and review** (`sta-review`): 8 cards (30-second, deeper, State vs Strategy B, who owns transitions I, persistence I, testing I, enum-switch enough B, thread safety A); **Move 1 recap table** (Strategy / Template Method / State: who chooses, when, composition or inheritance, example; links to 01 and 02); revision card; 8 takeaways; quiz `p03`; recall; feedback.

## Checks (2026-10-28)
run.sh 1280 / 500: errors [], fails [], scroll -10 · widgets.js 1280 / 500: fails [] (1 header, playground 5 actions / 5 outputs, 2 predicts, 1 explain-back) · contrast.js: fails {} (8073 checks) · dpmatch: 61 checked, fails [] · gallery light + dark reviewed (state/g-l-1..3.png, g-d-1..3.png).

## Programs (all run on JDK 25 with `java File.java`)

### OrderBefore.java
```java
public class OrderBefore {
    public static void main(String[] args) {
        Order a = new Order("ORD-1", 700000);
        a.pay();       // ORD-1: Booked -> Paid (Rs 700000 received)
        a.allocate();  // ORD-1: Paid -> Allocated (chassis reserved)
        a.deliver();   // ORD-1: Allocated -> Delivered (keys handed over)
        a.cancel();    // ORD-1: cannot cancel an order that is Delivered

        Order b = new Order("ORD-2", 900000);
        b.pay();       // ORD-2: Booked -> Paid (Rs 900000 received)
        b.deliver();   // ORD-2: cannot deliver an order that is Paid
        b.cancel();    // ORD-2: Paid -> Cancelled (refund Rs 900000)
    }
}

class Order {
    private final String id;
    private final long price;
    private String status = "Booked";                  // a plain String: "Payed" would compile too

    Order(String id, long price) { this.id = id; this.price = price; }

    void pay() {
        switch (status) {
            case "Booked" -> moveTo("Paid", "Rs " + price + " received");
            default -> reject("pay");
        }
    }
    void allocate() {                                  // change request: a new status between Paid and Delivered
        switch (status) {
            case "Paid" -> moveTo("Allocated", "chassis reserved");
            default -> reject("allocate");
        }
    }
    void deliver() {
        switch (status) {
            case "Allocated" -> moveTo("Delivered", "keys handed over");   // was "Paid" before the change
            default -> reject("deliver");
        }
    }
    void cancel() {
        switch (status) {
            case "Booked" -> moveTo("Cancelled", "no refund needed");
            case "Paid", "Allocated" -> moveTo("Cancelled", "refund Rs " + price);   // edited again
            default -> reject("cancel");
        }
    }

    private void moveTo(String next, String note) {
        System.out.println(id + ": " + status + " -> " + next + " (" + note + ")");
        status = next;
    }
    private void reject(String action) {
        System.out.println(id + ": cannot " + action + " an order that is " + status);
    }
}
```

### OrderAfter.java
```java
public class OrderAfter {
    public static void main(String[] args) {
        Order a = new Order("ORD-1", 700000);
        a.pay();       // ORD-1: Booked -> Paid (Rs 700000 received)
        a.allocate();  // ORD-1: Paid -> Allocated (chassis reserved)
        a.deliver();   // ORD-1: Allocated -> Delivered (keys handed over)
        a.cancel();    // ORD-1: cannot cancel an order that is Delivered

        Order b = new Order("ORD-2", 900000);
        b.pay();       // ORD-2: Booked -> Paid (Rs 900000 received)
        b.deliver();   // ORD-2: cannot deliver an order that is Paid
        b.cancel();    // ORD-2: Paid -> Cancelled (refund Rs 900000)
    }
}

interface OrderState {                                 // one method per action the order supports
    String name();
    default void pay(Order o)      { o.reject("pay"); }        // illegal unless a state says otherwise:
    default void allocate(Order o) { o.reject("allocate"); }   // the "not allowed" rule lives in ONE place
    default void deliver(Order o)  { o.reject("deliver"); }
    default void cancel(Order o)   { o.reject("cancel"); }
}

class Booked implements OrderState {
    public String name() { return "Booked"; }
    public void pay(Order o)    { o.moveTo(new Paid(), "Rs " + o.price() + " received"); }
    public void cancel(Order o) { o.moveTo(new Cancelled(), "no refund needed"); }
}

class Paid implements OrderState {
    public String name() { return "Paid"; }
    public void allocate(Order o) { o.moveTo(new Allocated(), "chassis reserved"); }
    public void cancel(Order o)   { o.moveTo(new Cancelled(), "refund Rs " + o.price()); }
}

class Allocated implements OrderState {
    public String name() { return "Allocated"; }
    public void deliver(Order o) { o.moveTo(new Delivered(), "keys handed over"); }
    public void cancel(Order o)  { o.moveTo(new Cancelled(), "refund Rs " + o.price()); }
}

class Delivered implements OrderState { public String name() { return "Delivered"; } }   // final: every action rejected
class Cancelled implements OrderState { public String name() { return "Cancelled"; } }   // final

class Order {                                          // the context
    private final String id;
    private final long price;
    private OrderState state = new Booked();           // the current state object

    Order(String id, long price) { this.id = id; this.price = price; }

    long price() { return price; }
    void pay()      { state.pay(this); }               // no switch: delegate to the current state
    void allocate() { state.allocate(this); }
    void deliver()  { state.deliver(this); }
    void cancel()   { state.cancel(this); }

    void moveTo(OrderState next, String note) {       // called by the states: they decide the next one
        System.out.println(id + ": " + state.name() + " -> " + next.name() + " (" + note + ")");
        state = next;
    }
    void reject(String action) {
        System.out.println(id + ": cannot " + action + " an order that is " + state.name());
    }
}
```

### OrderEnum.java
```java
public class OrderEnum {
    public static void main(String[] args) {
        CarOrder a = new CarOrder("ORD-1", 700000);
        a.apply(Action.PAY);      // ORD-1: BOOKED -> PAID
        a.apply(Action.ALLOCATE); // ORD-1: PAID -> ALLOCATED
        a.apply(Action.DELIVER);  // ORD-1: ALLOCATED -> DELIVERED
        a.apply(Action.CANCEL);   // ORD-1: cannot cancel an order that is DELIVERED

        CarOrder b = new CarOrder("ORD-2", 900000);
        b.apply(Action.PAY);      // ORD-2: BOOKED -> PAID
        b.apply(Action.DELIVER);  // ORD-2: cannot deliver an order that is PAID
        b.apply(Action.CANCEL);   // ORD-2: PAID -> CANCELLED (refund Rs 900000)

        // what you store in a database column: the constant's name, then read it back
        Status loaded = Status.valueOf("PAID");
        System.out.println("loaded " + loaded + ", next on allocate: " + loaded.allocate());
        // loaded PAID, next on allocate: ALLOCATED
    }
}

enum Action { PAY, ALLOCATE, DELIVER, CANCEL }

enum Status {                                          // each constant is a state with its own behaviour
    BOOKED {
        Status pay()    { return PAID; }
        Status cancel() { return CANCELLED; }
    },
    PAID {
        Status allocate() { return ALLOCATED; }
        Status cancel()   { return CANCELLED; }
    },
    ALLOCATED {
        Status deliver() { return DELIVERED; }
        Status cancel()  { return CANCELLED; }
    },
    DELIVERED, CANCELLED;                              // final: no overrides, every action rejected

    Status pay()      { throw illegal("pay"); }        // defaults = the illegal actions, in one place
    Status allocate() { throw illegal("allocate"); }
    Status deliver()  { throw illegal("deliver"); }
    Status cancel()   { throw illegal("cancel"); }

    IllegalStateException illegal(String action) {
        return new IllegalStateException("cannot " + action + " an order that is " + this);
    }
}

class CarOrder {
    private final String id;
    private final long price;
    private Status status = Status.BOOKED;             // one shared constant per state: no new objects

    CarOrder(String id, long price) { this.id = id; this.price = price; }

    void apply(Action action) {
        try {
            Status next = switch (action) {
                case PAY -> status.pay();
                case ALLOCATE -> status.allocate();
                case DELIVER -> status.deliver();
                case CANCEL -> status.cancel();
            };
            boolean refund = next == Status.CANCELLED && status != Status.BOOKED;
            System.out.println(id + ": " + status + " -> " + next + (refund ? " (refund Rs " + price + ")" : ""));
            status = next;
        } catch (IllegalStateException e) {
            System.out.println(id + ": " + e.getMessage());
        }
    }
}
```

### OrderSealed.java
```java
public class OrderSealed {
    public static void main(String[] args) {
        OrderStatus s = new Booked();
        s = pay(s, 900000);
        System.out.println(s);         // Paid[amount=900000]
        s = allocate(s, "CH-4471");
        System.out.println(s);         // Allocated[amount=900000, chassis=CH-4471]
        s = cancel(s);
        System.out.println(s);         // Cancelled[refund=900000]
        try {
            cancel(s);
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage());   // cannot cancel: Cancelled[refund=900000]
        }
    }

    static OrderStatus pay(OrderStatus s, long amount) {
        return switch (s) {
            case Booked _ -> new Paid(amount);
            default -> throw new IllegalStateException("cannot pay: " + s);
        };
    }

    static OrderStatus allocate(OrderStatus s, String chassis) {
        return switch (s) {
            case Paid p -> new Allocated(p.amount(), chassis);
            default -> throw new IllegalStateException("cannot allocate: " + s);
        };
    }

    static OrderStatus cancel(OrderStatus s) {
        return switch (s) {                            // no default: the compiler checks every state is covered
            case Booked _ -> new Cancelled(0);
            case Paid p -> new Cancelled(p.amount());
            case Allocated a -> new Cancelled(a.amount());
            case Delivered _, Cancelled _ -> throw new IllegalStateException("cannot cancel: " + s);
        };
    }
}

sealed interface OrderStatus permits Booked, Paid, Allocated, Delivered, Cancelled {}
record Booked() implements OrderStatus {}
record Paid(long amount) implements OrderStatus {}                     // each state carries its own data
record Allocated(long amount, String chassis) implements OrderStatus {}
record Delivered(String chassis) implements OrderStatus {}
record Cancelled(long refund) implements OrderStatus {}
```

### StateEx2.java
```java
public class StateEx2 {
    public static void main(String[] args) {
        Order a = new Order("ORD-3", 1500000);
        a.pay();
        a.allocate();
        a.deliver();
        a.inspect();
        a.deliver();
    }
}

interface OrderState {
    String name();
    default void pay(Order o)      { o.reject("pay"); }
    default void allocate(Order o) { o.reject("allocate"); }
    default void inspect(Order o)  { o.reject("inspect"); }     // new action: rejected everywhere by default
    default void deliver(Order o)  { o.reject("deliver"); }
    default void cancel(Order o)   { o.reject("cancel"); }
}

class Booked implements OrderState {
    public String name() { return "Booked"; }
    public void pay(Order o)    { o.moveTo(new Paid(), "Rs " + o.price() + " received"); }
    public void cancel(Order o) { o.moveTo(new Cancelled(), "no refund needed"); }
}
class Paid implements OrderState {
    public String name() { return "Paid"; }
    public void allocate(Order o) { o.moveTo(new Allocated(), "chassis reserved"); }
    public void cancel(Order o)   { o.moveTo(new Cancelled(), "refund Rs " + o.price()); }
}
class Allocated implements OrderState {
    public String name() { return "Allocated"; }
    public void inspect(Order o) { o.moveTo(new Inspected(), "PDI passed"); }   // was deliver()
    public void cancel(Order o)  { o.moveTo(new Cancelled(), "refund Rs " + o.price()); }
}
class Inspected implements OrderState {                         // the new status: one new class
    public String name() { return "Inspected"; }
    public void deliver(Order o) { o.moveTo(new Delivered(), "keys handed over"); }
    public void cancel(Order o)  { o.moveTo(new Cancelled(), "refund Rs " + o.price()); }
}
class Delivered implements OrderState { public String name() { return "Delivered"; } }
class Cancelled implements OrderState { public String name() { return "Cancelled"; } }

class Order {
    private final String id;
    private final long price;
    private OrderState state = new Booked();
    Order(String id, long price) { this.id = id; this.price = price; }
    long price() { return price; }
    void pay()      { state.pay(this); }
    void allocate() { state.allocate(this); }
    void inspect()  { state.inspect(this); }
    void deliver()  { state.deliver(this); }
    void cancel()   { state.cancel(this); }
    void moveTo(OrderState next, String note) {
        System.out.println(id + ": " + state.name() + " -> " + next.name() + " (" + note + ")");
        state = next;
    }
    void reject(String action) {
        System.out.println(id + ": cannot " + action + " an order that is " + state.name());
    }
}
```
