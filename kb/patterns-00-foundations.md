# Patterns 00 — Foundations and SOLID

Page: `patterns/00-foundations.html` (`data-page="p00"`, band `#ptf`, section ids `pf-*`). Labs: `assets/labs/labs-patterns-p00.js` (data only) drawn by the kit `assets/labs/labs-patterns.js`. Quiz `QZ.p00` (12: 5 B, 5 I, 2 A), recall `RC.p00` (3 per day). Live 2026-10-28 (phase 1 of `kb/design-patterns-plan.md`).

## The kit (`assets/labs/labs-patterns.js`, global `DPL`, classes `dp-`)
- A lab is data: `DPL.add({key: {pill, views:[{name, h, nodes, edges, steps, code?}]}})` builds `<div class="viz dp" id="dp-KEY">`. Two or more views → tabs (`role=tab`); Structure/Runtime for patterns, Before/After for principles.
- Nodes: `['id',x,y,w,'title','sub',h?]` plain box (objects, people, steps) or `{id,x,y,w,name,st?,f?,m?}` UML-lite class box (`st` = interface/abstract/record → «st», italic name for interface/abstract; height computed: 24 or 36 header + 15 px per member line + 6 per part). SVG viewBox 600 × h.
- Edges: `['id',from,to,kind?,bend?,label?,ports?]`, kind `impl` (dashed, hollow triangle at `to`), `ext` (solid, hollow triangle), `has` (diamond at `from` = owner), `calls` (default, filled arrow). Anchors: vertical when the boxes don't overlap vertically, else horizontal; `ports` 'h'/'v' forces. Markers per view (`dpm-KEY-V-tri|dia|arr[-on]`), switched to the accent set when the edge is on. A legend shows only the kinds used.
- Steps: `{t,d,code?,marks?,cur,on,good,bad,dim,hide,lines,txt,note}`. `lines`: array = those edges accent, the rest faded (.45); `"all"`; absent = all normal. `marks`: code lines containing a mark are highlighted (code panel `.dp-code`, `hl()` from course.js). STEP n / N bar, Back/Next/Play (2.6 s), `data-a` buttons so ← → Space work (course.js keyboard handler, visible buttons only).
- `DPL.CATALOG`: the 23 patterns (name, family c/s/b, tier, dealership problem, lesson). Used by `DPL.families(host)` (P00 §2 map with tier filter) and `DPL.picker(host)` (course home "problem → pattern"; links only to lessons whose `.lcard` is not `.soon`).
- Test hook: `DPL.BUILT[key] = {host, ctl:[{show(i), stop(), n}], tab(i)}`.

### Kit v2 (phase B, 2026-10-28; CSS block "design patterns kit v2")
- **Refactor / Pain steps:** `add`, `del` (substrings → code lines shown green "+" or struck red "−"; the panel scrolls to the first changed line) and `meter:[label, value, max]` (a "places to edit" bar above the stage; red from 60 % of max).
- **Sequence view:** `view.seq = {lanes:[[id,title,sub]], msgs:[[from,to,label,kind]]}`, kind `call` (solid) | `ret` (dashed) | `new` | `self` (loop). Lanes are spread evenly over the 600 px width (box ≤ 150 px), one message every 34 px from y 84; `h` is computed. Steps use `upto` (messages visible) and `cur` (message index now: arrow accented, both lanes outlined, target lane current). Internally the lanes are plain boxes and the messages edges `m0, m1…`, so the same controls, keyboard and checks apply. `view.alt` = text alternative for the SVG.
- **Playground:** `DPL.play({key:{pill, init(), controls:[{id,type,label,options}], act?(state,id), render(state)}})` into `<div class="dp-play" id="dpp-KEY">`. `select`/`toggle` write `state[id]`; `button` calls `act`; ↺ Reset calls `init()`. `render` returns `{h, nodes, edges, on, good, bad, dim, cur, lines, out, log, alt}`, drawn with the lab boxes and arrows; `log` + `out` fill the `aria-live` output. Test hook `DPL.PBUILT[key] = {host, state, set(k,v), press(id), reset()}`. No `data-a` attributes (course.js's keyboard handler clicks those inside `.viz`).
- **Markup widgets bound on load:** `.dp-pat[data-p="Name"]` pattern header (glyph, move, GoF family, ★/◆/○, difficulty, intent, used-with / confused-with links to live pages); `.dp-pred[data-ans=i]` with `<p>` question, `<ol>` options, `.dp-pe` explanation (option buttons, locks, marks right/wrong, Try again; class `spot` relabels it "Spot it"); `.dp-xb[data-k]` with `<p>` prompt and `.dp-xm` model answer (textarea draft + rating got / almost / not yet in `localStorage` `js1-dpxb`). CSS-only: `.dp-lv.l1…l4/.lr` level chips, `.dp-ex[data-t]` exercise box, `.dp-rev` revision card, `pre.dp-spring` "Spring · not runnable here".
- **Data:** `CATALOG` rows `{n, slug, f, mv, t, d, p, i, rel, conf, k, file}` in learning order (`k` = `p01…p23`, `file` = `NN-slug.html`); `BYN[name]`; `MOVE`, `TIER` (★ ◆ ○). A page counts as live once `build-index` lists it. `GLYPH` (23 inner-SVG strings, 48 × 48, `currentColor`) via `DPL.glyph(name)`.
- **Course home:** `DPL.map(host, base)` = pattern map + catalogue in one: 5 move columns × glyph cards with real progress (sections marked understood in `js1-done` / sections on the page), filters (search, GoF family, move, tier, difficulty, status), hover/focus highlights used-with (green) and confused-with (amber).
- **Move colours:** `--mv-swap/create/wrap/talk/compose`, light and dark sets (Nord swap lightened to pass 4.5:1); `.dp-mv-*` sets `--mv`.
- **Checks (`scripts/dp-checks/`, see its README part in `kb/patterns-page-brief.md`):** `run.sh <page> <width> [test]` with `dptest.js` (geometry/controls), `widgets.js` (headers, add/del/meter, sequence counts, playgrounds change output, predict, explain-back storage, map filters), `contrast.js` (labs + the new widgets, nine themes); `gx.sh <theme> <h> <png> <labs> <page>` (state gallery); `node dpmatch.js <page>` (every class box and method in non-"Roles" views exists in the page's Java); `qmerge.js` (merges a lesson's `QZ.pNN`/`RC.pNN` into quiz-data.js and validates answer indexes).
- CSS block "design patterns kit v1" at the end of `course.css`.

## Sections
1. **What is a design pattern** (`pf-what`): named, proven solution to a recurring design problem; not a library, not code to paste, not an algorithm. GoF 1994, 23 patterns. Analogy: a pattern is a body style (SUV, hatchback): it names a proven shape, each maker still builds its own car. Anatomy cards: name, problem, solution, consequences. Go deeper: principles vs patterns vs idioms.
2. **The three families, and the five moves of this course** (`pf-families`): creational / structural / behavioral stay the official GoF classification; the course teaches by five moves (Swap 01–03, Create 04–08, Wrap 09–13, Talk 14–18, Compose 19–23; one line each), interview tier shown as a badge ★ (tier 1, 13) / ◆ (tier 2, 4) / ○ (tier 3, 6). Figure `#dpFam` (kit, tier filter) unchanged. Lessons 24–26: integration, capstone, interview.
3. **Interface vs abstract class** (`pf-iface`): comparison table; `Vehicles.java`. Go deeper: the diamond problem with default methods.
4. **Reading a class diagram** (`pf-uml`): lab `uml` (8 steps: box parts, visibility signs, «interface»/«abstract», implements, extends, has-a, calls, the whole picture).
5. **Program to an interface** (`pf-prog`): lab `iface` (Structure 4 steps, Runtime 5 steps); polymorphism defined here; `Checkout.java`.
6. **How Java picks the method: overriding and dynamic dispatch** (`pf-dispatch`, added 2026-10-28 phase B): declared (static) type vs runtime type; override (same signature, chosen at run time by the object) vs overload (different parameter types, chosen at compile time by declared types). Analogy: the sign on a parking bay (declared type) vs the car parked there (object). Lab `dispatch` (1 view, 8 steps: the call → compile-time check against `Discount` → follow the reference to the heap → the object's class → FestivalDiscount.apply runs (630000) → same variable, LoyaltyDiscount object → its apply runs (680000) → override vs overload). Table override vs overload; `Dispatch.java` (override at run time, the `welcome(Car)` overload chosen for an ElectricCar). Go deeper: static/private/final not dispatched, fields not polymorphic, invokevirtual/invokeinterface, single dispatch (Visitor, lesson 21).
7. **Composition over inheritance** (`pf-comp`): lab `comp` (Inheritance: class explosion and fixed engine; Composition: has-a, swap at run time, hybrid = one new class); `Garage.java`. Go deeper: when inheritance is still right (Template Method = lesson 02).
8. **S** (`pf-srp`): lab `srp`; SOLID introduced here; `SrpBefore.java` / `SrpAfter.java`.
9. **O** (`pf-ocp`): lab `ocp`; points forward to Strategy (lesson 01); `OcpBefore.java` / `OcpAfter.java`.
10. **L** (`pf-lsp`): lab `lsp` (refuel vs topUp); Go deeper: square/rectangle, `List.of` optional operations; `LspBefore.java` / `LspAfter.java`.
11. **I** (`pf-isp`): lab `isp` (fat ShowroomStaff vs Seller/Repairer/Driver); `IspBefore.java` / `IspAfter.java`.
12. **D** (`pf-dip`): lab `dip` (new SmsSender() vs injected Notifier, fake for tests); Go deeper: DIP vs DI vs IoC; `DipBefore.java` / `DipAfter.java`.
13. **Lambdas are tiny objects** (`pf-lambda`, added 2026-10-28): functional interface (`@FunctionalInterface`, exactly one abstract method); one interface `PriceRule` (`long apply(long price)`) written as named class → anonymous class → lambda → method reference. Analogy: "something that drives": a named model, a one-off build, a key and a route, a car already in the showroom. Lab `lambda` (1 view, 4 steps: diagram stays the same, the code panel and the "code you write" box shrink). JDK table: Function, Supplier, Consumer, Predicate, Comparator. Why it matters: Strategy, Command, Observer are often lambdas. `Lambdas.java` (four ways → 630000 ×4, `then` default method, the five JDK interfaces, `this` in a lambda vs an anonymous class). Go deeper: anonymous class vs lambda (`this`, state, several methods, effectively final, `Outer$1.class` vs invokedynamic).
14. **Your first refactor** (`pf-refactor`, added 2026-10-28): exercise with a `Checkout.pay(type, amount)` if/else over card, UPI, cash; details "Hint: find the smell" (growing type-code if/else; OCP, SRP, untestable, tight coupling) and "Solution" (interface `Payment` + one class per type + constructor injection); coupling tight vs loose; analogy: a cashier hard-wired to one card machine vs a standard socket. Lab `refactor` (Before · tight 4 steps; After · loose 5 steps, ends "You just discovered Strategy"). `RefactorBefore.java` / `RefactorAfter.java` (wallet added as a lambda). Go deeper: rule of three, refactor in small steps.
15. **13 interview questions** (`pf-qa`): cards 11 overload vs override, 12 functional interface, 13 anonymous class vs lambda added.
16. **Review** (`pf-review`): 9 takeaways (tiers takeaway replaced by the five moves), quiz, recall, feedback.

Quiz/recall for sections 6, 13, 14: 4 questions + 3 recall prompts merged into `QZ.p00` / `RC.p00`.

## Checks (2026-10-28)
Phase B additions (sections 6, 13, 14): 4 new programs run on JDK 25 (25.0.4.1), outputs in comments; 11 labs at 1280 and 500 px with 0 dptest findings, no console errors, no horizontal scroll; contrast 0 failures in nine themes; galleries of dispatch, lambda, refactor reviewed in light and dark.
All 13 programs run on JDK 25 (outputs below are in the comments; the two "compile error" comments were verified by uncommenting). Headless Chrome: 8 labs, 69 states, at 1280 and 500 px: 0 label-fit, overlap, edge-through-box, controls or step-bar failures; no console errors; no horizontal scroll. Contrast: 11 601 text checks in the nine themes, 0 below 4.5:1 (lowest 4.51; dimmed and hidden nodes excluded). State galleries reviewed in light (all labs) and dark (uml, srp, ocp). Tools (now in `scripts/dp-checks/`): `run.sh` + `dptest.js` (geometry/controls), `gx.sh` + `gallery.js` (state gallery), `contrast.js`.

## Programs

### Vehicles.java
```java
public class Vehicles {
    public static void main(String[] args) {
        Drivable a = new Swift("KA-01-1234");    // the variable's type is the interface
        a.drive(40);                             // Swift KA-01-1234 drives at 40 km/h
        a.honk();                                // Beep! (default method from the interface)

        Vehicle b = new Nexon("KA-05-9876");     // or the abstract class
        b.drive(90);                             // Nexon KA-05-9876 drives at 90 km/h
        System.out.println(b.wheels());          // 4 (written once, in the abstract class)
        System.out.println(b instanceof Drivable); // true: a Nexon is both
        // new Vehicle("X");                     // compile error: Vehicle is abstract; cannot be instantiated
    }
}

// interface: a promise of WHAT can be done. No fields (only constants), no constructor.
interface Drivable {
    void drive(int speed);                       // abstract: every class must write it
    default void honk() {                        // default method: a shared body (Java 8+)
        System.out.println("Beep!");
    }
}

// abstract class: a half-built class. It CAN hold fields, a constructor and finished methods.
abstract class Vehicle implements Drivable {
    protected final String plate;                // state shared by every vehicle
    Vehicle(String plate) { this.plate = plate; }
    int wheels() { return 4; }                   // finished method, inherited as is
    // drive(int) is still missing, so the class must stay abstract
}

class Swift extends Vehicle {
    Swift(String plate) { super(plate); }
    public void drive(int speed) { System.out.println("Swift " + plate + " drives at " + speed + " km/h"); }
}

class Nexon extends Vehicle {
    Nexon(String plate) { super(plate); }
    public void drive(int speed) { System.out.println("Nexon " + plate + " drives at " + speed + " km/h"); }
}
```

### Checkout.java
```java
import java.util.ArrayList;
import java.util.List;

public class Checkout {
    private final PaymentGateway gateway;          // the field's type is the INTERFACE

    Checkout(PaymentGateway gateway) { this.gateway = gateway; }

    void buy(String car, int lakhs) {
        System.out.println(car + ": " + gateway.pay(lakhs));
    }

    public static void main(String[] args) {
        new Checkout(new CardGateway()).buy("Swift", 7);   // Swift: paid 7 lakh by card
        new Checkout(new UpiGateway()).buy("Nexon", 12);   // Nexon: paid 12 lakh by UPI

        List<String> cars = new ArrayList<>();             // same idea in the JDK: List, not ArrayList
        cars.add("Swift");
        System.out.println(cars);                          // [Swift]
    }
}

interface PaymentGateway {
    String pay(int lakhs);
}

class CardGateway implements PaymentGateway {
    public String pay(int lakhs) { return "paid " + lakhs + " lakh by card"; }
}

class UpiGateway implements PaymentGateway {
    public String pay(int lakhs) { return "paid " + lakhs + " lakh by UPI"; }
}
```

### Garage.java
```java
public class Garage {
    public static void main(String[] args) {
        Car suv = new Car("SUV", new PetrolEngine());   // the car HAS an engine
        suv.start();                                    // SUV: petrol engine, vroom

        suv.setEngine(new ElectricEngine());            // swap the part at run time
        suv.start();                                    // SUV: electric motor, hum

        Car sedan = new Car("Sedan", new ElectricEngine());
        sedan.start();                                  // Sedan: electric motor, hum
        // 2 body types x 2 engines = 4 combinations, but only 1 Car class + 2 engine classes
    }
}

interface Engine {
    String sound();
}

class PetrolEngine implements Engine {
    public String sound() { return "petrol engine, vroom"; }
}

class ElectricEngine implements Engine {
    public String sound() { return "electric motor, hum"; }
}

class Car {
    private final String body;
    private Engine engine;                          // has-a: composition

    Car(String body, Engine engine) { this.body = body; this.engine = engine; }

    void setEngine(Engine engine) { this.engine = engine; }

    void start() { System.out.println(body + ": " + engine.sound()); }   // delegate to the part
}
```

### SrpBefore.java
```java
public class SrpBefore {
    public static void main(String[] args) {
        Invoice inv = new Invoice("Swift", 700000, 50000);
        System.out.println(inv.total());   // 650000
        inv.print();                       // INVOICE  Swift  Rs 650000
        inv.save();                        // saved invoice-Swift.txt
    }
}

// one class, three jobs: a change to tax rules, to the print layout
// or to storage all edit this same class
class Invoice {
    private final String car;
    private final int price, discount;

    Invoice(String car, int price, int discount) {
        this.car = car; this.price = price; this.discount = discount;
    }

    int total() { return price - discount; }                    // job 1: business rule

    void print() {                                              // job 2: presentation
        System.out.println("INVOICE  " + car + "  Rs " + total());
    }

    void save() {                                               // job 3: storage
        System.out.println("saved invoice-" + car + ".txt");
    }
}
```

### SrpAfter.java
```java
public class SrpAfter {
    public static void main(String[] args) {
        Invoice inv = new Invoice("Swift", 700000, 50000);
        System.out.println(inv.total());          // 650000
        new InvoicePrinter().print(inv);          // INVOICE  Swift  Rs 650000
        new InvoiceRepository().save(inv);        // saved invoice-Swift.txt
    }
}

// each class has ONE reason to change
record Invoice(String car, int price, int discount) {      // the business rule
    int total() { return price - discount; }
}

class InvoicePrinter {                                     // the layout
    void print(Invoice inv) {
        System.out.println("INVOICE  " + inv.car() + "  Rs " + inv.total());
    }
}

class InvoiceRepository {                                  // the storage
    void save(Invoice inv) {
        System.out.println("saved invoice-" + inv.car() + ".txt");
    }
}
```

### OcpBefore.java
```java
public class OcpBefore {
    public static void main(String[] args) {
        PriceCalculator calc = new PriceCalculator();
        System.out.println(calc.finalPrice(700000, "none"));      // 700000
        System.out.println(calc.finalPrice(700000, "festival"));  // 630000
        System.out.println(calc.finalPrice(700000, "loyalty"));   // 680000
    }
}

class PriceCalculator {
    // every new offer means opening this method and adding a branch,
    // then re-testing the branches that already worked
    int finalPrice(int price, String offer) {
        if (offer.equals("festival")) return price * 90 / 100;   // 10% off
        else if (offer.equals("loyalty")) return price - 20000;  // flat 20,000 off
        else return price;
        // a "student" offer? edit here again
    }
}
```

### OcpAfter.java
```java
import java.util.List;

public class OcpAfter {
    public static void main(String[] args) {
        PriceCalculator calc = new PriceCalculator();
        List<Discount> offers = List.of(new NoDiscount(), new FestivalDiscount(),
                                        new LoyaltyDiscount(), new StudentDiscount());
        for (Discount d : offers)
            System.out.println(d.getClass().getSimpleName() + " " + calc.finalPrice(700000, d));
        // NoDiscount 700000
        // FestivalDiscount 630000
        // LoyaltyDiscount 680000
        // StudentDiscount 665000
    }
}

interface Discount {
    int apply(int price);
}

class NoDiscount implements Discount {
    public int apply(int price) { return price; }
}

class FestivalDiscount implements Discount {
    public int apply(int price) { return price * 90 / 100; }
}

class LoyaltyDiscount implements Discount {
    public int apply(int price) { return price - 20000; }
}

class StudentDiscount implements Discount {     // NEW offer: a new class, nothing else edited
    public int apply(int price) { return price * 95 / 100; }
}

class PriceCalculator {                          // closed for modification
    int finalPrice(int price, Discount d) { return d.apply(price); }
}
```

### LspBefore.java
```java
import java.util.List;

public class LspBefore {
    public static void main(String[] args) {
        List<Car> fleet = List.of(new PetrolCar("Swift"), new ElectricCar("Nexon EV"));
        for (Car c : fleet) {
            c.refuel();      // the code was written for Car, so it trusts refuel()
        }
        // Swift: tank filled
        // Exception in thread "main" java.lang.UnsupportedOperationException: Nexon EV has no fuel tank
    }
}

class Car {
    protected final String name;
    Car(String name) { this.name = name; }
    void refuel() { System.out.println(name + ": tank filled"); }
}

class PetrolCar extends Car {
    PetrolCar(String name) { super(name); }
}

class ElectricCar extends Car {          // "an electric car IS A car", so extends... but
    ElectricCar(String name) { super(name); }
    @Override void refuel() {            // it breaks the parent's promise
        throw new UnsupportedOperationException(name + " has no fuel tank");
    }
}
```

### LspAfter.java
```java
import java.util.List;

public class LspAfter {
    public static void main(String[] args) {
        List<Vehicle> fleet = List.of(new PetrolCar("Swift"), new ElectricCar("Nexon EV"));
        for (Vehicle v : fleet) {
            v.topUp();       // every subtype keeps the promise: "after topUp, range is full"
        }
        // Swift: tank filled
        // Nexon EV: battery charged
    }
}

abstract class Vehicle {
    protected final String name;
    Vehicle(String name) { this.name = name; }
    abstract void topUp();               // the promise is about the RESULT, not about petrol
}

class PetrolCar extends Vehicle {
    PetrolCar(String name) { super(name); }
    void topUp() { System.out.println(name + ": tank filled"); }
}

class ElectricCar extends Vehicle {
    ElectricCar(String name) { super(name); }
    void topUp() { System.out.println(name + ": battery charged"); }
}
```

### IspBefore.java
```java
public class IspBefore {
    public static void main(String[] args) {
        ShowroomStaff m = new Mechanic("Ravi");
        m.repair("Swift");             // Ravi repairs Swift
        m.sell("Nexon");               // the interface allows it, the class can't do it
        // Exception in thread "main" java.lang.UnsupportedOperationException: Ravi does not sell cars
    }
}

// one fat interface: everyone in the showroom must implement everything
interface ShowroomStaff {
    void sell(String car);
    void repair(String car);
    void testDrive(String car);
}

class Mechanic implements ShowroomStaff {
    private final String name;
    Mechanic(String name) { this.name = name; }
    public void repair(String car)    { System.out.println(name + " repairs " + car); }
    public void testDrive(String car) { System.out.println(name + " test-drives " + car); }
    public void sell(String car) {     // forced to write a method it can't honour
        throw new UnsupportedOperationException(name + " does not sell cars");
    }
}
```

### IspAfter.java
```java
public class IspAfter {
    public static void main(String[] args) {
        Repairer m = new Mechanic("Ravi");
        m.repair("Swift");                 // Ravi repairs Swift
        // m.sell("Nexon");                // compile error: Repairer has no sell(). The mistake can't be written.

        SalesMechanic a = new SalesMechanic("Asha");
        a.sell("Nexon");                   // Asha sells Nexon
        a.repair("Nexon");                 // Asha repairs Nexon
    }
}

// small interfaces, one role each
interface Seller   { void sell(String car); }
interface Repairer { void repair(String car); }
interface Driver   { void testDrive(String car); }

class Mechanic implements Repairer, Driver {
    private final String name;
    Mechanic(String name) { this.name = name; }
    public void repair(String car)    { System.out.println(name + " repairs " + car); }
    public void testDrive(String car) { System.out.println(name + " test-drives " + car); }
}

class SalesMechanic implements Seller, Repairer {   // a class may take several roles
    private final String name;
    SalesMechanic(String name) { this.name = name; }
    public void sell(String car)   { System.out.println(name + " sells " + car); }
    public void repair(String car) { System.out.println(name + " repairs " + car); }
}
```

### DipBefore.java
```java
public class DipBefore {
    public static void main(String[] args) {
        new OrderService().place("Swift");
        // order placed: Swift
        // SMS to customer: your Swift is booked
    }
}

class SmsSender {                                   // a low-level detail
    void send(String text) { System.out.println("SMS to customer: " + text); }
}

class OrderService {                                // the high-level business rule...
    private final SmsSender sms = new SmsSender();  // ...welded to one concrete detail

    void place(String car) {
        System.out.println("order placed: " + car);
        sms.send("your " + car + " is booked");
        // email instead? a fake for a unit test? you must edit OrderService
    }
}
```

### DipAfter.java
```java
public class DipAfter {
    public static void main(String[] args) {
        new OrderService(new SmsNotifier()).place("Swift");
        // order placed: Swift
        // SMS: your Swift is booked

        new OrderService(new EmailNotifier()).place("Nexon");
        // order placed: Nexon
        // Email: your Nexon is booked

        FakeNotifier fake = new FakeNotifier();     // in a unit test: no SMS is really sent
        new OrderService(fake).place("Creta");      // order placed: Creta
        System.out.println(fake.last);              // your Creta is booked
    }
}

interface Notifier {                                // the abstraction both sides depend on
    void send(String text);
}

class SmsNotifier implements Notifier {
    public void send(String text) { System.out.println("SMS: " + text); }
}

class EmailNotifier implements Notifier {
    public void send(String text) { System.out.println("Email: " + text); }
}

class FakeNotifier implements Notifier {
    String last;
    public void send(String text) { last = text; }
}

class OrderService {
    private final Notifier notifier;                // depends on the interface only

    OrderService(Notifier notifier) {               // the detail is handed in (constructor injection)
        this.notifier = notifier;
    }

    void place(String car) {
        System.out.println("order placed: " + car);
        notifier.send("your " + car + " is booked");
    }
}
```

### Dispatch.java
```java
public class Dispatch {
    public static void main(String[] args) {
        long price = 700000;
        Discount discount = new FestivalDiscount();     // declared type: Discount · object: FestivalDiscount
        System.out.println(discount.apply(price));      // 630000  (FestivalDiscount.apply ran)

        discount = new LoyaltyDiscount();               // same variable, a different object
        System.out.println(discount.apply(price));      // 680000  (LoyaltyDiscount.apply ran)

        Car car = new ElectricCar("Nexon EV");          // declared type: Car · object: ElectricCar
        car.describe();                                 // Nexon EV: battery, 0 litres of petrol
                                                        //   OVERRIDE: chosen at run time by the object

        Showroom s = new Showroom();
        s.welcome(car);                                 // Welcome! Any car is fine here.
                                                        //   OVERLOAD: chosen at compile time by the declared type (Car)
        s.welcome(new ElectricCar("Ioniq 5"));          // Welcome! The charging bay is on the left.
        s.welcome((ElectricCar) car);                   // Welcome! The charging bay is on the left.
    }
}

interface Discount {
    long apply(long price);
}

class FestivalDiscount implements Discount {
    @Override public long apply(long price) { return price * 90 / 100; }   // 10% off
}

class LoyaltyDiscount implements Discount {
    @Override public long apply(long price) { return price - 20000; }      // flat 20,000 off
}

class Car {
    protected final String name;
    Car(String name) { this.name = name; }
    void describe() { System.out.println(name + ": petrol tank"); }
}

class ElectricCar extends Car {
    ElectricCar(String name) { super(name); }
    @Override void describe() { System.out.println(name + ": battery, 0 litres of petrol"); }   // same signature = override
}

class Showroom {                                        // same name, different parameter types = overloads
    void welcome(Car c)         { System.out.println("Welcome! Any car is fine here."); }
    void welcome(ElectricCar c) { System.out.println("Welcome! The charging bay is on the left."); }
}
```

### Lambdas.java
```java
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.Comparator;

public class Lambdas {
    public static void main(String[] args) {
        long price = 700000;

        PriceRule a = new FestivalRule();                    // 1. a named class
        PriceRule b = new PriceRule() {                      // 2. an anonymous class: no name, written in place
            @Override public long apply(long p) { return p * 90 / 100; }
        };
        PriceRule c = p -> p * 90 / 100;                     // 3. a lambda: just the parameter and the body
        PriceRule d = Lambdas::festival;                     // 4. a method reference to an existing method

        for (PriceRule r : List.of(a, b, c, d))
            System.out.print(r.apply(price) + " ");          // 630000 630000 630000 630000
        System.out.println();

        PriceRule festivalThenLoyalty = c.then(p -> p - 20000);
        System.out.println(festivalThenLoyalty.apply(price)); // 610000

        // the JDK's ready-made functional interfaces (java.util.function, java.util)
        Function<Long, String> label = p -> "Rs " + p;              // takes one value, returns another
        Supplier<String> nextCar = () -> "Swift";                    // takes nothing, returns a value
        Consumer<String> sms = text -> System.out.println("SMS: " + text);   // takes a value, returns nothing
        Predicate<Long> affordable = p -> p <= 800000;               // takes a value, returns true/false

        System.out.println(label.apply(price));                      // Rs 700000
        sms.accept(nextCar.get() + " is ready");                     // SMS: Swift is ready
        System.out.println(affordable.test(1200000L));               // false

        List<Car> cars = new ArrayList<>(List.of(new Car("Nexon", 1200000), new Car("Swift", 700000), new Car("Creta", 1100000)));
        cars.sort(Comparator.comparingLong(Car::price));             // Comparator built from a method reference
        System.out.println(cars.get(0).name());                      // Swift

        new Showroom().whoIsThis();
        // lambda this: Showroom
        // anonymous this: anonymous class
    }

    static long festival(long p) { return p * 90 / 100; }
}

@FunctionalInterface                                   // exactly ONE abstract method; the compiler checks it
interface PriceRule {
    long apply(long price);

    default PriceRule then(PriceRule next) {           // default methods don't count
        return p -> next.apply(apply(p));
    }
}

class FestivalRule implements PriceRule {
    @Override public long apply(long price) { return price * 90 / 100; }
}

record Car(String name, long price) {}

class Showroom {
    String who() { return "Showroom"; }

    void whoIsThis() {
        Supplier<String> lambda = () -> this.who();               // a lambda's this = the enclosing object
        Supplier<String> anon = new Supplier<String>() {
            String who() { return "anonymous class"; }
            @Override public String get() { return this.who(); }   // an anonymous class's this = itself
        };
        System.out.println("lambda this: " + lambda.get());
        System.out.println("anonymous this: " + anon.get());
    }
}
```

### RefactorBefore.java
```java
public class RefactorBefore {
    public static void main(String[] args) {
        Checkout checkout = new Checkout();
        checkout.pay("card", 700000);     // card: Rs 700000 + 1% fee = Rs 707000
        checkout.pay("upi", 700000);      // UPI: Rs 700000, no fee
        checkout.pay("cash", 700000);     // cash: Rs 700000, receipt printed
        checkout.pay("wallet", 700000);   // unknown payment type: wallet
    }
}

class Checkout {
    void pay(String type, long amount) {
        if (type.equals("card")) {
            long fee = amount / 100;
            System.out.println("card: Rs " + amount + " + 1% fee = Rs " + (amount + fee));
        } else if (type.equals("upi")) {
            System.out.println("UPI: Rs " + amount + ", no fee");
        } else if (type.equals("cash")) {
            System.out.println("cash: Rs " + amount + ", receipt printed");
        } else {
            System.out.println("unknown payment type: " + type);
        }
        // EMI next month, a wallet after that: open this method again each time
    }
}
```

### RefactorAfter.java
```java
public class RefactorAfter {
    public static void main(String[] args) {
        long price = 700000;
        new Checkout(new CardPayment()).pay(price);    // card: Rs 700000 + 1% fee = Rs 707000
        new Checkout(new UpiPayment()).pay(price);     // UPI: Rs 700000, no fee
        new Checkout(new CashPayment()).pay(price);    // cash: Rs 700000, receipt printed

        // a new type next month: one new class (or one lambda), Checkout is not opened
        new Checkout(amount -> "wallet: Rs " + amount + ", 2% cashback").pay(price);
        // wallet: Rs 700000, 2% cashback
    }
}

interface Payment {                                    // the role every payment type plays
    String pay(long amount);
}

class CardPayment implements Payment {
    public String pay(long amount) { return "card: Rs " + amount + " + 1% fee = Rs " + (amount + amount / 100); }
}

class UpiPayment implements Payment {
    public String pay(long amount) { return "UPI: Rs " + amount + ", no fee"; }
}

class CashPayment implements Payment {
    public String pay(long amount) { return "cash: Rs " + amount + ", receipt printed"; }
}

class Checkout {
    private final Payment payment;                     // depends on the interface only (loose coupling)

    Checkout(Payment payment) { this.payment = payment; }   // handed in from outside

    void pay(long amount) { System.out.println(payment.pay(amount)); }
}
```
