# Lesson 05 — Object-Oriented Programming: Classes, the Four Pillars, Modern Types

*Level 2 of the roadmap. You already know that objects live on the heap and variables hold references (Lesson 00). Here you learn to design your own types: how an object is built, how to hide its state, when to inherit and when to compose, how Java decides which method runs, and the contracts every class signs with `Object`. It has 10 sections, 14 verified programs, 2 figures, 13 interactive concept labs (including the Car Factory and the town clock), 2 step-through runs, 15 interview questions and a 12-question quiz. On the page: `java/lessons/05-oop.html`, band `#oop`, sections P1–P10; all programs run on JDK 25.*

## Table of Contents

1. Classes and objects: the blueprint and the thing
2. Constructors and initialisation order
3. Encapsulation, access modifiers and immutable classes
4. static members and nested classes
5. Inheritance, super, and composition over inheritance
6. Polymorphism: overloading vs overriding
7. Abstraction: abstract classes vs interfaces
8. The Object class: equals, hashCode and toString
9. Modern OOP: records, enums and sealed types
10. OOP: interview questions and review

### Concept labs (interactive, added 2026-10-22)

The user asked for concept visualisation, so every section has a "See it" lab on the page (`.viz.ol`, built by the "OOP labs (v24)" block in `course.js`). Every message and output they show was checked with javac/java on JDK 25.

| Section | Lab | What you do | What it shows |
|---|---|---|---|
| P1 | **Car Factory** `#olFactory` (the memorable analogy, added after the user asked for "object is a car, class is a blueprint, so it remembers long") | Pick a model and colour, press `new Car(…)`; drive / honk / paint one car; copy its key | A blueprint (class, line drawing on blueprint paper) builds real coloured cars (objects) on a parking lot (heap); only the driven car speeds up (own fields); every car can honk (methods from the class); copying a key adds a key tag, not a car (reference); memory-hook chips: class = blueprint, new = factory, object = real car, field = its own paint and speed, method = what it can do, variable = the car key; the Java line for every action |
| P10 | **Four pillars as one car** `#olStory` | Tabs | Encapsulation = locked bonnet (`accelerate(20)` works, `accelerate(-500)` ignored, `car.speed = 500` → "speed has private access in Car"); Inheritance = vehicle family Vehicle → Car/Truck → ElectricCar, click to list own / inherited / overridden members; Polymorphism = `for (Vehicle v : garage) v.honk()` → Beep beep! / HOOONK! / ♪ pling (real horn sounds when site sound is on); Abstraction = dashboard `interface Drivable` (start/drive/brake) with the engine hidden under the bonnet, swap petrol ↔ electric and the controls stay the same |
| P1 | Object lab `#olObj` | Run `a = new Car(…)`, `c = a`, `a.speed += 20`, `a = null`, `System.gc()` … | Stack variables with arrows to heap objects, aliases (refs list), live `==` table, NPE message for a null receiver, unreachable objects greyed, GC sweeps them |
| P2 | Initialisation order `#olInit` | Play or step `new Child()`, twice | Parent/Child code with the running line lit, the object filling in (a = 0 → 1, b = null → "hi"), console; static blocks skipped for the second object |
| P3 | Access modifier map `#olAccess` | Pick private / none / protected / public | Two packages, four classes; ✓ or the exact javac error for each access |
| P4 | static vs instance `#olStatic` | `new Counter()`, `a.created`, `Counter.total()` | One static field in the class data, each object with its own `id`, dashed klass links |
| P5 | Fragile base class `#olFragile` | Step inheritance vs composition | Call stack frames (ours vs JDK), the counter reaching 6 vs 3, the re-entrant `add` frame in red |
| P6 | Dispatch simulator `#olDispatch` | Choose declared type, object, call; Run | Hierarchy Object → Animal → Dog/Cat → Puppy; phase 1 javac search on the declared type (or "cannot find symbol", "incompatible types"), phase 2 JVM walk from the object's class (Puppy → Dog for `sound()`), fields/statics bound at compile time, cast → ClassCastException for a Cat |
| P7 | Default-method resolver `#olDiamond` | A/B: none / abstract / default; B extends A; Base; C overrides | Generated code, winner box, the rule (class wins, most specific interface wins, must override) or the exact javac error |
| P8 | HashSet buckets `#olHash` | Toggle equals/hashCode overrides; add / contains Points | 16 buckets with HashMap's `(h ^ h>>>16) & 15`, identity vs `Objects.hash` hashes, duplicates, contains missing the bucket |
| P9 | Record expander `#olRecord` | Type a record header | The equivalent final class (fields, canonical constructor, accessors, equals/hashCode/toString); warns on mutable components |
| P9 | Exhaustive switch checker `#olSealed` | Toggle sealed, cases, default, add `Triangle` | Covered / missing subtypes; "the switch expression does not cover all possible input values"; why `default` hides new subtypes |

---

## 1. Classes and objects: the blueprint and the thing

**In 30 seconds:** A **class** is a blueprint: it declares **fields** (state) and **methods** (behaviour). An **object** is one thing built from that blueprint with `new`; it lives on the **heap** and has its own copy of every instance field. A variable of a class type never holds the object, only a **reference** to it, so two variables can point to the same object, and a variable can point to nothing (`null`).

**Why it exists:** large programs are easier to reason about when data and the code that changes it travel together. Instead of a loose `speed` variable that any code can set to −5, a `Car` object owns its speed and offers `accelerate()`. OOP is a way to put rules next to the data they protect.

**Analogy (remember this one):** a **class is a car's blueprint**: one drawing that says every car has a colour, a model and a speed, and can drive and honk. An **object is a real car** built from it in the factory (`new`). Every car has its **own** paint and speed, and you can build as many as you like from one blueprint. You can't drive the blueprint. A **variable is the car key**: copying the key does not build a second car. (On the page this is the **Car Factory** lab, `#olFactory`.)

```java
public class Car {

    // fields: the state every Car object carries
    String model;
    int speed;

    // a constructor: runs once, when new Car(...) creates the object
    Car(String model) {
        this.model = model;          // this.model is the field, model is the parameter
    }

    // methods: behaviour that works on this object's state
    void accelerate(int by) {
        speed += by;
    }

    @Override
    public String toString() {
        return model + " @ " + speed + " km/h";
    }

    public static void main(String[] args) {
        Car a = new Car("Swift");    // one object on the heap; a holds a reference to it
        Car b = new Car("Nexon");    // a second, independent object
        Car c = a;                   // no new object: c is another name for a's car

        a.accelerate(40);
        c.accelerate(20);            // changes the same object a points to
        b.accelerate(90);

        System.out.println(a);               // Swift @ 60 km/h
        System.out.println(b);               // Nexon @ 90 km/h
        System.out.println(a == c);          // true   (same object)
        System.out.println(a == b);          // false  (different objects)

        Car none = null;                     // a reference to nothing
        System.out.println(none == null);    // true
        // none.accelerate(1);               // would throw NullPointerException
    }
}
```

- **`new Car("Swift")`** does three things: allocates memory on the heap with every field at its default (`null`, `0`), runs the constructor, and returns the reference.
- **`this`** is the reference to the current object. It is needed when a parameter has the same name as a field (*shadowing*); otherwise it is optional.
- **`Car c = a`** copies the reference, not the object. Changing the car through `c` is visible through `a`.
- **`println(a)`** calls `a.toString()`. Without the override you would see `Car@1b6d3586`: the class name and the hash code in hex.

*Figure `fig-objmem`: The main frame on the stack holds references a, c and b. a and c point to the same Car object on the heap, b to a second Car object. Each object has a header whose klass pointer leads to the one Car class description in Metaspace.* **Two objects, three references, one class.** Local variables live in the method's stack frame and hold only references. Each object on the heap has a small **header** (a mark word for hashing, locking and GC age, and a **klass pointer**) followed by its own instance fields. The class itself is loaded once into **Metaspace**: field layout, method bytecode, and the method table the JVM uses to pick overridden methods (P6). Methods are not copied into each object.

### Watch it run

Step through a constructor call: see the new object appear with default values, `this` in the constructor frame, and what happens when a reference is copied and then re-pointed.

*Watch it run: step-through trace `RUNS.objs` in `course.js` (Cars.java: constructor frame, `this`, copying and re-pointing a reference; prints `Swift 60`, verified on JDK 25).*

| Term | Meaning | Example |
|---|---|---|
| **Class** | A type you define: fields + constructors + methods | `class Car { … }` |
| **Object / instance** | One value of that type, created at run time on the heap | `new Car("Swift")` |
| **Instance field** | State stored in each object (default 0 / false / null) | `int speed;` |
| **Instance method** | Behaviour; gets a hidden `this` parameter | `a.accelerate(40)` |
| **Reference** | The value a variable holds to reach an object | `Car c = a;` |

**Common mistakes:** thinking `Car c = a` copies the car (it copies the reference); calling a method on a `null` reference (`NullPointerException`; Java 14+ names the variable in the message; a local's name needs `javac -g`, otherwise it shows `"<local1>"`); comparing objects with `==` when you mean "same content" (that is `equals`, P8); and forgetting `this.` so that `model = model` assigns the parameter to itself and the field stays `null`.

**Interview answer:** "A class is a template that defines state and behaviour; an object is an instance created at run time with `new`. The object lives on the heap with its own copy of the instance fields, while the class metadata and method code are loaded once into Metaspace. Variables hold references, so assigning one variable to another shares the object instead of copying it."

Follow-ups:
- Where are objects stored? — On the heap; references and primitives in locals live in stack frames (escape analysis may optimise this, but that is the model).
- What does `new` do? — Allocate, zero the fields, run the constructor chain, return the reference.
- Can an object exist without a reference? — Briefly; once nothing reachable refers to it, it becomes eligible for garbage collection.

## 2. Constructors and initialisation order

**In 30 seconds:** A **constructor** has the class's name and no return type; it runs once per object to put it in a valid state. If you write **no** constructor, the compiler adds a no-argument one; if you write **any**, it does not. `this(…)` calls another constructor of the same class, `super(…)` calls the parent's; either must come first. Order for `new Child()`: static blocks (parent, then child, once per class) → parent's field initialisers, instance blocks and constructor → child's field initialisers, instance blocks and constructor.

```java
public class Point {

    private final int x, y;

    Point() {
        this(0, 0);                    // constructor chaining: must be the first statement
    }

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    Point(Point other) {               // a "copy constructor"
        this(other.x, other.y);
    }

    @Override
    public String toString() { return "(" + x + ", " + y + ")"; }

    public static void main(String[] args) {
        System.out.println(new Point());                  // (0, 0)
        System.out.println(new Point(3, 4));              // (3, 4)
        System.out.println(new Point(new Point(7, 1)));   // (7, 1)
    }
}
```

Put all the real work in one constructor and let the others delegate with `this(…)`. Then validation lives in one place. A `final` field must be assigned exactly once on every constructor path, or the code does not compile.

```java
public class InitOrder {

    static class Parent {
        static { System.out.println("1. Parent static block"); }
        { System.out.println("3. Parent instance block"); }
        Parent() { System.out.println("4. Parent constructor"); }
    }

    static class Child extends Parent {
        static { System.out.println("2. Child static block"); }
        String name = log("5. Child field initialiser");
        { System.out.println("6. Child instance block"); }

        Child() {
            super();                                   // implicit if you leave it out
            System.out.println("7. Child constructor");
        }

        static String log(String s) { System.out.println(s); return s; }
    }

    public static void main(String[] args) {
        new Child();
        System.out.println("--- second object ---");
        new Child();      // static blocks do not run again
    }
}
/* Output:
1. Parent static block
2. Child static block
3. Parent instance block
4. Parent constructor
5. Child field initialiser
6. Child instance block
7. Child constructor
--- second object ---
3. Parent instance block
4. Parent constructor
5. Child field initialiser
6. Child instance block
7. Child constructor
*/
```

- **Static blocks** run when the class is *initialised* (first real use), parent class first, and only once per class loader.
- **Field initialisers and instance blocks** are copied by `javac` into every constructor, right after the `super(…)` call, in the order they appear in the source.
- So the parent part of the object is fully built before any line of the child's initialisation runs.

| Rule | Detail |
|---|---|
| Default constructor | Added only when the class declares no constructor; it has the class's access level and calls `super()` |
| `this(…)` / `super(…)` | At most one, and (before Java 25) it must be the first statement. Java 25 allows statements before it that don't touch `this` (flexible constructor bodies) |
| Implicit `super()` | Inserted if you call neither; it fails to compile if the parent has no no-arg constructor |
| No return type | `void Point() {}` is a *method* named Point, not a constructor |
| Not inherited | A subclass does not get its parent's constructors; it must declare its own |
| `private` constructor | Stops `new` from outside: singletons, factory methods (`LocalDate.of`), utility classes (`Math`) |

**Common mistakes:** adding a `Dog(String name)` constructor and then calling `new Dog()` (compile error: the free no-arg constructor is gone); a subclass whose parent has only `Parent(int)` (every child constructor must call `super(someInt)`); and giving a "constructor" a return type by accident.

**Interview answer:** "When I call `new Child()`, the classes are initialised first if needed, parent then child, which runs the static blocks once. Then for the object: the parent's constructor runs first through `super()`, including the parent's field initialisers and instance blocks, then the child's field initialisers and instance blocks in source order, and finally the rest of the child's constructor body."

Follow-ups:
- Can a constructor be `private`? — Yes: singletons, static factories, utility classes.
- Can a constructor be `final`, `static` or `abstract`? — No; it is not inherited, so none of those mean anything.
- Can a constructor call an overridable method? — It compiles, but it is a trap (P6).

## 3. Encapsulation, access modifiers and immutable classes

**In 30 seconds:** **Encapsulation** means hiding an object's fields (`private`) and exposing only methods that keep it valid. The rule "balance can't go negative" then lives in one place instead of in every caller. Java has four access levels: `private` (the class) < package-private, no keyword (the package) < `protected` (package + subclasses) < `public` (everyone). The strongest form is an **immutable** class: its state can't change after construction.

| Modifier | Same class | Same package | Subclass in another package | Everyone else |
|---|---|---|---|---|
| `private` | ✓ | — | — | — |
| *(none)* package-private | ✓ | ✓ | — | — |
| `protected` | ✓ | ✓ | ✓ (through inheritance) | — |
| `public` | ✓ | ✓ | ✓ | ✓ |

A top-level class can only be `public` or package-private. Nested classes can use all four. Since Java 9, modules add one more wall: a `public` class is visible outside its module only if its package is exported.

```java
import java.util.ArrayList;
import java.util.List;

public class Account {

    private final String id;                   // set once, never changes
    private long balancePaise;                 // hidden: only methods below can change it
    private final List<String> history = new ArrayList<>();

    public Account(String id, long openingPaise) {
        if (openingPaise < 0) throw new IllegalArgumentException("negative opening balance");
        this.id = id;
        this.balancePaise = openingPaise;
    }

    public void deposit(long paise) {
        if (paise <= 0) throw new IllegalArgumentException("deposit must be positive");
        balancePaise += paise;
        history.add("+" + paise);
    }

    public boolean withdraw(long paise) {
        if (paise <= 0 || paise > balancePaise) return false;   // the rule lives in one place
        balancePaise -= paise;
        history.add("-" + paise);
        return true;
    }

    public long getBalancePaise() { return balancePaise; }     // read access, no setter
    public List<String> getHistory() { return List.copyOf(history); }   // a read-only copy

    public static void main(String[] args) {
        Account acc = new Account("SB-01", 10_000);
        acc.deposit(2_500);
        System.out.println(acc.withdraw(50_000));     // false (not enough money)
        System.out.println(acc.withdraw(1_000));      // true
        System.out.println(acc.getBalancePaise());    // 11500
        System.out.println(acc.getHistory());         // [+2500, -1000]

        try {
            acc.getHistory().add("+999999");          // callers can't rewrite history
        } catch (UnsupportedOperationException e) {
            System.out.println("history is read-only");   // history is read-only
        }
        // acc.balancePaise = 1_000_000;   // compile error outside Account: balancePaise has private access
    }
}
```

Encapsulation is not "a getter and a setter for every field". A public setter for `balancePaise` would make the field effectively public again. Expose **operations** (`deposit`, `withdraw`) that enforce the rules, and give read access only where callers need it.

### Immutable classes

An immutable object can't change after it is built, like `String` (Lesson 02, D6). It is automatically thread-safe, safe to share and cache, and safe as a `HashMap` key. The recipe:

1. Make the class `final` (or give it only private constructors), so no subclass can add mutable state.
2. Make every field `private final`.
3. Provide no setters; "changing" methods return a new object (`withSkill`).
4. **Defensive copies** of mutable inputs in the constructor, and never hand out a mutable field.

```java
import java.util.ArrayList;
import java.util.List;

public class Immutable {

    // The recipe: final class, private final fields, no setters, defensive copies in and out
    static final class Employee {
        private final String name;
        private final List<String> skills;

        Employee(String name, List<String> skills) {
            this.name = name;
            this.skills = List.copyOf(skills);     // copy IN: the caller's list can change later
        }

        String name() { return name; }
        List<String> skills() { return skills; }   // already unmodifiable, safe to share

        Employee withSkill(String s) {             // "change" = return a new object
            List<String> more = new ArrayList<>(skills);
            more.add(s);
            return new Employee(name, more);
        }

        @Override public String toString() { return name + " " + skills; }
    }

    // A broken version: final fields, but it leaks its mutable list
    static final class Leaky {
        private final List<String> skills;
        Leaky(List<String> skills) { this.skills = skills; }    // no copy
        List<String> skills() { return skills; }               // hands out the original
    }

    public static void main(String[] args) {
        List<String> input = new ArrayList<>(List.of("Java"));
        Employee e = new Employee("Asha", input);
        Leaky l = new Leaky(input);

        input.add("SQL");                          // the caller changes its own list
        System.out.println(e);                     // Asha [Java]
        System.out.println(l.skills());            // [Java, SQL]   (Leaky changed!)

        Employee e2 = e.withSkill("Spring");
        System.out.println(e + " | " + e2);        // Asha [Java] | Asha [Java, Spring]
    }
}
```

**Key idea:** `final` on a field freezes the *reference*, not the object it points to. `Leaky` has only `final` fields and is still mutable. (Same lesson as "final ≠ immutable" in Lesson 02.)

**Common mistakes:** public fields "for convenience"; a setter for every field; returning an internal `List`, array or `Date` directly; and believing `final` makes an object immutable.

**Interview answer:** "Encapsulation is keeping the state private and exposing behaviour that maintains the object's invariants, so the rules live in one place and the internals can change without breaking callers. To make a class immutable I make it final, make the fields private and final, add no setters, defensively copy mutable inputs and never return mutable internals; changes return new instances."

Follow-ups:
- Why is `protected` wider than package-private? — It includes the whole package *plus* subclasses elsewhere.
- Why should a `HashMap` key be immutable? — If its hash changes while it is in the map, it lands in the wrong bucket and can't be found.
- Is a `record` immutable? — Shallowly: its fields are final, but a record holding a mutable list still needs a defensive copy (P9).

## 4. static members and nested classes

**In 30 seconds:** A **static** member belongs to the **class**: one copy, shared by every object, usable without any object (`Math.max`, `Counter.created`). An instance member belongs to each **object**. Static code has no `this`, so it can't touch instance fields directly. Classes can be nested four ways: static nested, inner, local and anonymous.

```java
public class Counter {

    static int created = 0;        // ONE copy, shared by the class
    final int id;                  // one copy PER object

    Counter() {
        created++;                 // instance code can use static members
        id = created;
    }

    static int total() {
        return created;            // static code has no "this"
        // return id;              // compile error: non-static variable id cannot be referenced from a static context
    }

    public static void main(String[] args) {
        Counter a = new Counter();
        Counter b = new Counter();
        Counter c = new Counter();
        System.out.println(a.id + " " + b.id + " " + c.id);   // 1 2 3
        System.out.println(Counter.total());                   // 3
        System.out.println(a.created);                         // 3  (legal, but misleading: write Counter.created)

        Counter none = null;
        System.out.println(none.total());   // 3  (static call: uses the declared type, never touches the object)
    }
}
```

|  | static | instance |
|---|---|---|
| Belongs to | The class (stored with the class) | Each object (stored in the object) |
| Copies | One | One per object |
| Called as | `Counter.total()` | `a.accelerate(40)` |
| `this` / `super` | Not available | Available |
| Overriding | No: a subclass static method with the same signature **hides** it | Yes: chosen at run time |
| Typical use | Constants (`static final`), factories, utilities, counters | Everything that depends on an object's state |

### Nested classes

```java
import java.util.function.IntSupplier;

public class Nested {

    private int base = 10;

    // 1. static nested class: no link to an outer object
    static class Config {
        int port = 8080;
    }

    // 2. inner class: every instance is tied to an outer Nested object
    class Adder {
        int add(int x) { return base + x; }        // reads the outer object's field
    }

    IntSupplier counter() {
        int start = 100;                            // effectively final, so local classes may capture it
        // 3. local class: declared inside a method
        class Step implements IntSupplier {
            int n = start;
            public int getAsInt() { return n++; }
        }
        return new Step();
    }

    public static void main(String[] args) {
        Config cfg = new Config();                  // no outer object needed
        System.out.println(cfg.port);               // 8080

        Nested outer = new Nested();
        Nested.Adder adder = outer.new Adder();     // needs an outer object
        System.out.println(adder.add(5));           // 15

        IntSupplier s = outer.counter();
        System.out.println(s.getAsInt() + " " + s.getAsInt());   // 100 101

        // 4. anonymous class: a one-off subclass or implementation, written inline
        Runnable r = new Runnable() {
            @Override public void run() { System.out.println("anonymous run"); }
        };
        r.run();                                    // anonymous run

        // 5. a lambda: shorter, for interfaces with one abstract method
        Runnable l = () -> System.out.println("lambda run");
        l.run();                                    // lambda run
    }
}
```

| Kind | Needs an outer object? | Use it for |
|---|---|---|
| Static nested | No | Helpers that belong with the outer class: `Map.Entry`, builders, nodes of a linked list |
| Inner (non-static) | Yes: holds a hidden reference `Outer.this` | Objects that must read the outer's state, such as an iterator over a collection |
| Local | Yes, if declared in an instance method | A small named class used in one method |
| Anonymous | Same as local | A one-off implementation; mostly replaced by lambdas for single-method interfaces |

**Common mistakes:** making a nested class inner when it doesn't need the outer object (each instance then keeps the outer object alive: a classic memory leak with listeners and long-lived caches; prefer `static`); mutable `static` state shared by threads; and calling static methods through a variable (`a.created`), which hides that the value is shared.

**Interview answer:** "Static members belong to the class, so there is one copy shared by every instance, and they can be used without an object; instance members belong to each object. Static methods have no `this`, can't be overridden, only hidden, and are resolved at compile time. For nested classes I default to static nested; an inner class carries an implicit reference to its outer instance, which is only worth it when it really needs the outer's state."

Follow-ups:
- Why is `main` static? — The JVM must call it before any object exists. (Java 25 also allows an instance `void main()` in any class, including compact source files.)
- Can you override a static method? — No. The same signature in a subclass hides it; the declared type picks the method (P6).
- When does a static block run? — When the class is initialised, once, before its first use.

## 5. Inheritance, super, and composition over inheritance

**In 30 seconds:** `class Dog extends Animal` makes Dog a **subtype**: it inherits Animal's accessible fields and methods, can add its own, and can **override** methods. Java classes have **one** parent (every class ends at `Object`) but can implement many interfaces. `super.method()` calls the parent's version. Inherit only for a true **is-a** relationship; for "uses" or "has-a", hold an object in a field instead (**composition**).

```java
import java.util.List;

public class Shapes {

    // abstract: a shared idea that can't be created on its own
    static abstract class Shape {
        private final String name;

        Shape(String name) { this.name = name; }

        abstract double area();                       // every subclass must implement it

        String describe() {                           // shared code, written once
            return name + " with area " + String.format("%.2f", area());
        }
    }

    static class Circle extends Shape {
        private final double r;
        Circle(double r) { super("Circle"); this.r = r; }    // super(...) runs the parent constructor first
        @Override double area() { return Math.PI * r * r; }
    }

    static class Rect extends Shape {
        protected final double w, h;
        Rect(double w, double h) { this("Rect", w, h); }
        Rect(String name, double w, double h) { super(name); this.w = w; this.h = h; }
        @Override double area() { return w * h; }
    }

    static class Square extends Rect {
        Square(double side) { super("Square", side, side); }
        @Override String describe() {
            return super.describe() + " (all sides " + w + ")";   // extend the parent's version
        }
    }

    public static void main(String[] args) {
        List<Shape> shapes = List.of(new Circle(1), new Rect(2, 3), new Square(2));
        for (Shape s : shapes) {
            System.out.println(s.describe());    // the object's real class decides which area() runs
        }
        // Circle with area 3.14
        // Rect with area 6.00
        // Square with area 4.00 (all sides 2.0)

        Shape s = new Square(5);
        System.out.println(s instanceof Rect);           // true   (a Square IS-A Rect IS-A Shape)
        System.out.println(s.getClass().getSimpleName()); // Square
        // new Shape("x");   // compile error: Shape is abstract; cannot be instantiated
    }
}
```

- **What is inherited:** public and protected members (and package-private ones within the package). `private` fields exist inside the child object but are reachable only through the parent's methods. Constructors are never inherited.
- **Why one parent only:** two parents with the same method or field would be ambiguous (the "diamond problem"). Interfaces allow multiple inheritance of *type* and, since Java 8, of behaviour through default methods with explicit conflict rules (P7).
- **`final`** on a class stops inheritance (`String`, `Integer`); on a method, it stops overriding.
- **Upcasting** (`Shape s = new Square(5)`) is automatic and safe. **Downcasting** (`(Square) s`) needs a cast and throws `ClassCastException` if the object is not really that type; check with `if (s instanceof Square q)` first.

### Composition over inheritance

Inheritance couples the child to the parent's *implementation*, not just its contract. This classic example (from *Effective Java*) counts elements added to a set:

```java
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Composition {

    // Inheritance: count how many elements were ever added
    static class CountingSet<E> extends HashSet<E> {
        int added = 0;
        @Override public boolean add(E e) { added++; return super.add(e); }
        @Override public boolean addAll(Collection<? extends E> c) {
            added += c.size();
            return super.addAll(c);     // HashSet.addAll calls add() for each element...
        }
    }

    // Composition: wrap a Set and forward to it ("has-a" instead of "is-a")
    static class CountingSet2<E> {
        private final Set<E> inner = new HashSet<>();
        int added = 0;
        boolean add(E e) { added++; return inner.add(e); }
        boolean addAll(Collection<? extends E> c) {
            added += c.size();
            return inner.addAll(c);     // inner's add() is not ours, so nothing is counted twice
        }
        int size() { return inner.size(); }
    }

    public static void main(String[] args) {
        CountingSet<String> s1 = new CountingSet<>();
        s1.addAll(List.of("a", "b", "c"));
        System.out.println(s1.added);     // 6   (3 in addAll + 3 more from the add() calls inside it)

        CountingSet2<String> s2 = new CountingSet2<>();
        s2.addAll(List.of("a", "b", "c"));
        System.out.println(s2.added);     // 3
    }
}
```

`HashSet.addAll` (inherited from `AbstractCollection`) loops and calls `add`, which is now *our* overriding `add`, so each element is counted twice. The subclass broke because of a detail it could not see. The wrapper depends only on the public contract of `Set`. This is called the **fragile base class** problem.

|  | Inheritance (is-a) | Composition (has-a) |
|---|---|---|
| Coupling | Tight: depends on the parent's internals | Loose: depends on an interface |
| Change at run time | No: fixed at compile time | Yes: swap the field (strategy pattern) |
| Reuse | Gets every parent method, wanted or not | Exposes only what you forward |
| Use when | A real subtype that must work anywhere the parent works (Liskov) | Most other cases: `Car` has an `Engine`, a service has a repository |

**Real-world:** Spring services are built by composition: a `OrderService` *has* an `OrderRepository` and a `PaymentClient` injected through its constructor. Inheritance shows up in frameworks mostly as abstract base classes and interfaces you implement.

**Common mistakes:** inheriting to reuse code (`Stack extends Vector` in the JDK is the famous regret: a stack that also allows `insertElementAt`); a subclass that weakens the parent's promises (a `Square` whose `setWidth` also changes the height breaks code written for mutable `Rect`s); deep hierarchies.

**Interview answer:** "Inheritance models an is-a relationship and gives subtype polymorphism, but it couples the subclass to the parent's implementation; a change in the base class can break subclasses, as in the counting `HashSet` example. Composition holds the other object in a field and forwards to it, so it depends only on the interface and can be swapped at run time. I use inheritance for genuine subtypes that respect Liskov substitution, and composition otherwise."

Follow-ups:
- Why doesn't Java support multiple class inheritance? — To avoid diamond ambiguity in state and implementation; interfaces give multiple inheritance of type.
- What is the Liskov substitution principle? — A subtype must be usable wherever its parent is expected without breaking correctness.
- What does `super` refer to? — The parent's part of this object: `super.m()` calls the parent's implementation, `super(…)` its constructor.

## 6. Polymorphism: overloading vs overriding

**In 30 seconds:** **Overloading**: same name, different parameter lists, in one class; `javac` picks one at **compile time** from the declared types of the arguments. **Overriding**: a subclass redefines an inherited instance method with the same signature; the JVM picks one at **run time** from the object's actual class (**dynamic dispatch**). Fields and static methods are **not** polymorphic: the declared type decides.

```java
public class Dispatch {

    static class Animal {
        String name = "animal";
        static String kind() { return "Animal.kind"; }
        String sound() { return "..."; }
        void greet(Animal other) { System.out.println("Animal meets an animal"); }
    }

    static class Dog extends Animal {
        String name = "dog";                           // HIDES the parent's field (a second field)
        static String kind() { return "Dog.kind"; }    // HIDES the static method (no override)
        @Override String sound() { return "Woof"; }   // OVERRIDES: chosen at run time
        void greet(Dog other) { System.out.println("Dog meets a dog"); }   // OVERLOAD, not override!
    }

    public static void main(String[] args) {
        Animal a = new Dog();        // declared type Animal, real object Dog

        System.out.println(a.sound());   // Woof      instance methods: the OBJECT decides (run time)
        System.out.println(a.name);      // animal    fields: the DECLARED type decides (compile time)
        System.out.println(a.kind());    // Animal.kind  static methods: the DECLARED type decides

        Dog d = new Dog();
        a.greet(d);    // Animal meets an animal   (a's type Animal only has greet(Animal))
        d.greet(d);    // Dog meets a dog          (Dog has both; greet(Dog) is more specific)
        d.greet(a);    // Animal meets an animal   (argument's declared type is Animal)
    }
}
```

Two decisions happen for every call `a.greet(d)`. **1. Compile time:** `javac` looks only at the declared type of `a` (`Animal`), finds the methods named `greet` there, and chooses the signature with overload resolution (Lesson 00, F5). **2. Run time:** the JVM takes that signature and finds the most specific *override* of it in the object's real class. `greet(Dog)` is a different signature, so it is never a candidate for a call through an `Animal`.

*Figure `fig-dispatch`: a.sound() compiles to invokevirtual Animal.sound. At run time the JVM follows the receiver object's klass pointer to the Dog class, looks up the sound slot in Dog's method table, and runs Dog.sound. Animal's table has the same slot pointing to Animal.sound.* **How dynamic dispatch works (HotSpot).** `javac` resolves the call to a signature on the declared type and emits `invokevirtual`. Each class has a method table (vtable); an overriding method takes over its parent's slot, inherited methods keep the parent's entry. At run time the JVM reads the receiver's klass pointer and jumps through that class's slot. The JIT usually removes the lookup entirely by inlining when only one or two receiver classes are seen at a call site. `static`, `private` and `final` methods and constructors never need the lookup.

### Watch it run

*Watch it run: step-through trace `RUNS.virt` in `course.js` (Zoo.java: `Animal a = new Dog(); a.sound()` runs Dog's override, then Animal's; prints `Woof` and `...`, verified on JDK 25).*

|  | Overloading | Overriding |
|---|---|---|
| Where | Same class (or inherited + new) | Subclass redefines a parent's instance method |
| Signature | Same name, **different** parameters | **Same** name and parameters |
| Return type | Anything | Same, or a subtype (**covariant** return) |
| Access | Anything | Same or **wider** (protected → public OK; public → private: error) |
| Checked exceptions | Anything | Same, narrower or none; never new or broader checked ones |
| Chosen | Compile time (static binding) | Run time (dynamic binding) |
| `static` / `private` / `final` | Can be overloaded | Can't be overridden (static is hidden, private is invisible, final is locked) |

Always write `@Override`. If the signature doesn't actually override anything (a typo such as `toSting()`, or `equals(Point)` instead of `equals(Object)`), the compiler stops with *method does not override or implement a method from a supertype*.

### The constructor trap

```java
public class CtorTrap {

    static class Base {
        Base() {
            System.out.println("Base sees: " + describe());   // calls an overridable method: dangerous
        }
        String describe() { return "base"; }
    }

    static class Derived extends Base {
        private final String label = "derived";
        private String city = "Nellore";
        private int size = 42;

        Derived() {
            super();                                            // Base() runs BEFORE these fields are set
            System.out.println("Derived sees: " + describe());
        }

        @Override String describe() { return label + "/" + city + "/" + size; }
    }

    public static void main(String[] args) {
        new Derived();
        // Base sees: derived/null/0
        // Derived sees: derived/Nellore/42
    }
}
```

Dispatch already uses the real class while the parent constructor runs, so `Base()` calls `Derived.describe()` before `Derived`'s field initialisers have run: `city` is still `null` and `size` is `0`. Why is `label` already "derived"? A `final` field initialised with a compile-time constant is a *constant variable*, and `javac` inlines the literal wherever it is read. Rule: **don't call overridable methods from a constructor**; make them `private` or `final`.

**Common mistakes:** "overriding" with a different parameter type (that is an overload, as in `greet(Dog)`); expecting fields to be polymorphic; expecting a static method to be overridden; and narrowing access in the override.

**Interview answer:** "Polymorphism lets one reference type stand for many implementations. Compile-time polymorphism is overloading: the compiler picks a signature from the declared argument types. Run-time polymorphism is overriding: the JVM picks the implementation from the object's actual class through dynamic dispatch, using the class's method table. Fields, static methods and private methods are bound at compile time, so they are not polymorphic."

Follow-ups:
- Can you override a private method? — No; the subclass method is a new, unrelated method.
- What is a covariant return type? — An override may return a subtype, e.g. `Dog clone()` overriding `Animal clone()`.
- Is overloading resolved by the runtime type of the argument? — No, by its declared type. Double dispatch needs the visitor pattern, or pattern matching (P9).

## 7. Abstraction: abstract classes vs interfaces

**In 30 seconds:** **Abstraction** means depending on *what* something does, not *how*. An **abstract class** is a partial class: it can have state, constructors and finished methods, plus `abstract` methods that subclasses must fill in; you extend only one. An **interface** is a contract: abstract methods plus (since Java 8) `default` and `static` methods and (since 9) `private` helpers, but no instance state; a class can implement many.

```java
public class Interfaces {

    interface Payment {
        double FEE = 0.02;                          // implicitly public static final
        double amount();                            // implicitly public abstract

        default double total() {                    // Java 8+: a method with a body
            return round(amount() * (1 + FEE));
        }
        static Payment of(double amt) {             // Java 8+: a factory on the interface
            return () -> amt;                       // Payment has one abstract method, so a lambda works
        }
        private static double round(double v) {     // Java 9+: a helper hidden from implementers
            return Math.round(v * 100) / 100.0;
        }
    }

    interface Loggable {
        default String tag() { return "LOG"; }
    }
    interface Auditable {
        default String tag() { return "AUDIT"; }
    }

    // Two defaults with the same signature: the class MUST override and may pick one with X.super
    static class Upi implements Payment, Loggable, Auditable {
        private final double amt;
        Upi(double amt) { this.amt = amt; }
        public double amount() { return amt; }
        @Override public String tag() { return Loggable.super.tag() + "+" + Auditable.super.tag(); }
    }

    public static void main(String[] args) {
        Payment p = new Upi(500);
        System.out.println(p.total());                     // 510.0
        System.out.println(((Upi) p).tag());               // LOG+AUDIT
        System.out.println(Payment.of(99.99).total());     // 101.99
        System.out.println(Payment.FEE);                   // 0.02
        System.out.println(p instanceof Loggable);         // true  (a class can implement many interfaces)
    }
}
```

|  | Abstract class | Interface |
|---|---|---|
| How many per class | One (`extends`) | Many (`implements`) |
| Instance fields (state) | Yes | No: only `public static final` constants |
| Constructors | Yes (run through `super(…)`) | No |
| Method bodies | Any | `default`, `static`, `private` (8/9+) |
| Member access | Any modifier | Methods are `public` unless `private` |
| Models | "is a kind of" with shared code and state (template method) | "can do" capability: `Comparable`, `Runnable`, `AutoCloseable` |

**Default-method conflict rules**, in order: 1. a method in the class (or its superclasses) wins over any interface default ("class wins"); 2. a more specific interface wins over the one it extends; 3. otherwise the class must override and may call `X.super.m()`. A **functional interface** has exactly one abstract method (`@FunctionalInterface` checks it), so a lambda can implement it, as `Payment.of` does.

**Why default methods exist:** Java 8 needed to add `forEach`, `stream` and `removeIf` to `Collection` without breaking every class that already implemented it. A default method gives existing implementations a body for free.

**Real-world:** program to interfaces. Declare `List<Order> orders = new ArrayList<>()`, inject a `PaymentGateway` interface rather than a concrete class, and tests can pass a fake. The JDK pairs them too: `List` (interface) + `AbstractList` (skeleton) + `ArrayList` (class).

**Common mistakes:** thinking interface fields are per object (they are constants); forgetting that interface methods are `public`, so the implementation must be `public` too (package-private gives "attempting to assign weaker access privileges"); putting a constructor or instance field in an interface.

**Interview answer:** "Both express abstraction. An abstract class is a partially implemented base type: it can hold state and constructors and share code, but a class can extend only one. An interface defines a capability or contract; it has no instance state, a class can implement many, and since Java 8 it can carry default and static methods. I start with an interface and add an abstract class only when implementations share real state or code."

Follow-ups:
- Can an abstract class have no abstract methods? — Yes; it just can't be instantiated (e.g. `HttpServlet`).
- Can an interface extend another? — Yes, several: `interface C extends A, B`.
- What happens with two conflicting defaults? — Compile error until the class overrides; it can call `A.super.m()`.

## 8. The Object class: equals, hashCode and toString

**In 30 seconds:** Every class extends `java.lang.Object`. Its `equals` means `==` (same object) and its `hashCode` is identity-based. If two objects should be equal by **content**, override **both**: equal objects **must** have equal hash codes, or `HashMap` and `HashSet` silently stop finding them. Override `toString` for readable logs.

```java
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class EqualsHash {

    // equals WITHOUT hashCode: breaks every hash-based collection
    static class BadPoint {
        final int x, y;
        BadPoint(int x, int y) { this.x = x; this.y = y; }
        @Override public boolean equals(Object o) {
            return o instanceof BadPoint p && x == p.x && y == p.y;
        }
    }

    // the correct pair
    static final class Point {
        final int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }

        @Override public boolean equals(Object o) {
            if (this == o) return true;                       // 1. same object
            if (!(o instanceof Point p)) return false;        // 2. right type (also handles null)
            return x == p.x && y == p.y;                      // 3. compare the significant fields
        }
        @Override public int hashCode() {
            return Objects.hash(x, y);                        // same fields as equals
        }
        @Override public String toString() { return "Point[" + x + ", " + y + "]"; }
    }

    public static void main(String[] args) {
        BadPoint b1 = new BadPoint(1, 2), b2 = new BadPoint(1, 2);
        System.out.println(b1.equals(b2));                     // true
        Set<BadPoint> bad = new HashSet<>();
        bad.add(b1);
        System.out.println(bad.contains(b2));                  // false  (different hash, wrong bucket)

        Point p1 = new Point(1, 2), p2 = new Point(1, 2);
        Set<Point> good = new HashSet<>();
        good.add(p1);
        System.out.println(good.contains(p2));                 // true
        System.out.println(p1 == p2);                          // false  (two objects)
        System.out.println(p1.hashCode() == p2.hashCode());    // true
        System.out.println(p1);                                // Point[1, 2]
        System.out.println(p1.equals(null));                   // false  (never throws)
    }
}
```

| The equals contract | Meaning |
|---|---|
| Reflexive | `x.equals(x)` is true |
| Symmetric | `x.equals(y)` ⇔ `y.equals(x)` |
| Transitive | x = y and y = z ⇒ x = z |
| Consistent | Same answer every call while the fields don't change |
| Non-null | `x.equals(null)` is false, never an exception |
| **hashCode** | Equal objects ⇒ equal hash codes. (Unequal objects *may* share a hash: a collision, slower but legal.) |

**Why `contains` fails:** a `HashSet` first uses the hash to pick a bucket, and only then calls `equals` inside that bucket. `BadPoint`'s two objects have different identity hashes, so the set looks in the wrong bucket and never asks `equals`. (Lesson 02, D5 shows the same contract on `String`; Level 3 covers `HashMap` internals.)

| Object method | Default behaviour | Notes |
|---|---|---|
| `equals(Object)` | `this == o` | Parameter must be `Object`; `equals(Point)` is an overload, and collections won't call it |
| `hashCode()` | Identity-based number | Use the same fields as `equals`; `Objects.hash(…)` is easy, a hand-written `31 * h + f` is faster |
| `toString()` | `ClassName@hexHash` | Used by `println`, string concatenation and loggers |
| `getClass()` | Runtime class | `final`; can't be overridden |
| `clone()` | Protected, shallow copy; needs `Cloneable` | Prefer a copy constructor or a static factory |
| `wait/notify/notifyAll` | Monitor methods | Level 7, Concurrency |
| `finalize()` | Deprecated for removal | Use try-with-resources or `Cleaner` |

**`instanceof` or `getClass()` in equals?** `instanceof` lets subclasses compare equal to the parent, which can break symmetry once a subclass adds a field; `getClass() != o.getClass()` forbids it. Making the class `final` (as `Point` is) or using a `record` sidesteps the question.

**Common mistakes:** overriding `equals` without `hashCode`; `equals(Point o)` instead of `equals(Object o)` (use `@Override`); basing the hash on mutable fields and then changing them while the object is a map key; and comparing `double` fields with `==` (use `Double.compare`).

**Interview answer:** "`Object.equals` is identity. When I override it for value equality I must also override `hashCode`, because the contract says equal objects have equal hash codes, and hash-based collections find the bucket by hash before they call `equals`. Breaking that makes `contains` and `get` fail for logically equal keys. The equals must be reflexive, symmetric, transitive, consistent and false for null."

Follow-ups:
- Can two unequal objects have the same hash code? — Yes, that's a collision; correctness is fine, only speed suffers.
- What if `hashCode` returns a constant? — Correct but every key lands in one bucket: O(n) lookups (HashMap turns long buckets into trees: O(log n) if the keys are `Comparable`, still O(n) if not).
- Why use 31 in hash formulas? — Odd prime, cheap (`(h << 5) - h`), spreads values well.

## 9. Modern OOP: records, enums and sealed types

**In 30 seconds:** A **record** (Java 16) is a final, immutable data class in one line: the compiler writes the constructor, accessors, `equals`, `hashCode` and `toString`. An **enum** is a class with a fixed set of instances that can hold fields and methods. A **sealed** type (Java 17) lists exactly which classes may extend it, so a `switch` over it can be checked for completeness without a `default`.

```java
import java.util.List;

public class Modern {

    // 1. record: a transparent, immutable data carrier (Java 16+)
    record Money(String currency, long paise) {
        Money {                                        // compact constructor: validate, then fields are set
            if (paise < 0) throw new IllegalArgumentException("negative");
            currency = currency.toUpperCase();
        }
        Money plus(Money o) { return new Money(currency, paise + o.paise); }
    }

    // 2. enum: a fixed set of instances, each can carry data and behaviour
    enum Plan {
        FREE(0) { @Override String perk() { return "ads"; } },
        PRO(499) { @Override String perk() { return "no ads"; } };

        final int rupees;
        Plan(int rupees) { this.rupees = rupees; }    // enum constructors are always private
        abstract String perk();
    }

    // 3. sealed interface: only the listed classes may implement it (Java 17+)
    sealed interface Shape permits Circle, Square, Rect {}
    record Circle(double r) implements Shape {}
    record Square(double side) implements Shape {}
    record Rect(double w, double h) implements Shape {}

    static double area(Shape s) {
        return switch (s) {                            // pattern matching for switch (Java 21+)
            case Circle c -> Math.PI * c.r() * c.r();
            case Square q -> q.side() * q.side();
            case Rect(double w, double h) -> w * h;   // a record pattern takes the parts out
        };                                             // no default: the compiler knows the list is complete
    }

    public static void main(String[] args) {
        Money a = new Money("inr", 1500);
        Money b = new Money("INR", 1500);
        System.out.println(a);                         // Money[currency=INR, paise=1500]
        System.out.println(a.equals(b) + " " + (a == b));   // true false  (equals/hashCode/toString are generated)
        System.out.println(a.plus(b).paise());         // 3000

        for (Plan p : Plan.values())
            System.out.println(p + " " + p.ordinal() + " " + p.rupees + " " + p.perk());
        // FREE 0 0 ads
        // PRO 1 499 no ads
        System.out.println(Plan.valueOf("PRO") == Plan.PRO);   // true  (one instance per constant)

        for (Shape s : List.of(new Circle(1), new Square(2), new Rect(2, 5)))
            System.out.printf("%.2f%n", area(s));
        // 3.14
        // 4.00
        // 10.00
    }
}
```

| Type | What you get | Limits |
|---|---|---|
| `record` | Private final fields, canonical constructor, accessors `currency()` (no `get`), `equals`/`hashCode`/`toString` over all components | Implicitly `final`; extends `Record`, so can't extend another class (can implement interfaces); no extra instance fields; shallowly immutable |
| `enum` | One instance per constant, `values()`, `valueOf()`, `ordinal()`, `name()`, safe `==`, works in `switch`, `EnumMap`/`EnumSet` | Constructors are private; can't be extended; can't be created with `new`, even through reflection |
| `sealed` | A closed hierarchy: `permits` lists the subtypes; exhaustive `switch` | Each permitted subclass must be `final`, `sealed` or `non-sealed` (records are final already; an enum is implicitly final, or sealed if a constant has a body) |

**Why they exist:** before records, a data class meant about 50 lines of boilerplate that drifted out of date (a new field missing from `equals`). Before enums, constants were `static final int`s with no type safety (`setPlan(42)` compiled). Sealed types plus pattern matching give Java "algebraic data types": adding a new `Shape` makes every non-exhaustive `switch` fail to compile, which is exactly where the code needs updating.

**Real-world:** records are ideal for DTOs, API request and response bodies (Jackson and Spring support them), map keys and value objects like `Money`. An enum is the standard thread-safe singleton (*Effective Java* item 3) and a good home for state machines (`OrderStatus`).

**Common mistakes:** using records for JPA entities (entities need a no-arg constructor and mutable fields); storing `ordinal()` in a database (reordering the constants corrupts the data; store `name()`); a record with a mutable `List` component and no copy in the compact constructor.

**Interview answer:** "A record is a concise, final, shallowly immutable data carrier: the compiler generates the canonical constructor, accessors, equals, hashCode and toString from its components, and I can validate in a compact constructor. Enums are full classes with a fixed set of singleton instances that can have fields, constructors and per-constant behaviour. Sealed classes restrict which types can extend them, which lets a pattern-matching switch be exhaustive without a default."

Follow-ups:
- Can a record have static fields and methods? — Yes; extra *instance* fields are not allowed.
- Can an enum implement an interface? — Yes, and each constant can implement it differently.
- Why is an enum singleton safe? — The JVM guarantees one instance per constant, even with serialization and reflection.

## 10. OOP: interview questions and review

| Pillar | One line | Java tools |
|---|---|---|
| **Encapsulation** | Hide state, expose behaviour that keeps it valid | `private` fields, methods, immutable classes, records |
| **Inheritance** | A subtype reuses and specialises a parent type | `extends`, `super`, `final`, `sealed` |
| **Polymorphism** | One interface, many implementations, chosen at run time | Overriding, dynamic dispatch, interfaces; overloading at compile time |
| **Abstraction** | Depend on what something does, not how | Interfaces, abstract classes |

**Q01. What are the four pillars of OOP?** Encapsulation (private state behind methods), inheritance (subtypes reuse and specialise a parent), polymorphism (one reference type, many implementations chosen at run time) and abstraction (depend on contracts, not implementations).

**Q02. What is the difference between a class and an object?** A class is the blueprint loaded once into Metaspace; an object is an instance created with `new` on the heap, with its own copy of the instance fields. Variables hold references to objects.

**Q03. What is the order of initialisation for `new Child()`?** Static blocks and static fields, parent then child (once per class). Then the parent's field initialisers, instance blocks and constructor; then the child's field initialisers and instance blocks in source order, then the rest of the child's constructor.

**Q04. Does Java give you a default constructor?** Only if the class declares no constructor at all. Declare any constructor and the no-arg one disappears, so `new Dog()` stops compiling.

**Q05. Overloading vs overriding?** Overloading: same name, different parameters, chosen at compile time from declared types. Overriding: a subclass redefines an inherited instance method with the same signature (covariant return, same or wider access, no broader checked exceptions), chosen at run time from the object's class.

**Q06. Can you override a static or a private method?** No. A static method with the same signature in a subclass *hides* the parent's, and the declared type decides which runs. A private method is invisible to subclasses, so a same-named method is unrelated.

**Q07. Are fields polymorphic?** No. A field with the same name in a subclass hides the parent's; `Animal a = new Dog(); a.name` reads Animal's field. Only instance methods are dispatched dynamically.

**Q08. Why shouldn't a constructor call an overridable method?** Dispatch already uses the subclass during the parent's constructor, but the subclass fields are not initialised yet, so the override sees `null`/0. Make such methods `private` or `final`.

**Q09. Abstract class vs interface: when do you use each?** Interface for a capability or contract (many per class, no state, default methods since Java 8). Abstract class when subtypes share state, constructors or a template algorithm (one per class). Default to interfaces.

**Q10. Why prefer composition over inheritance?** Inheritance couples the subclass to the parent's implementation (fragile base class: a counting `HashSet` double-counts because `addAll` calls `add`). Composition depends only on an interface, hides unwanted methods and can be swapped at run time.

**Q11. Why must you override hashCode when you override equals?** The contract says equal objects must have equal hash codes. Hash collections pick a bucket by hash before calling `equals`, so without it `contains`/`get` miss logically equal keys.

**Q12. How do you make a class immutable?** `final` class, `private final` fields, no setters, defensive copies of mutable inputs and outputs, and "change" methods that return new objects. A `final` field alone only freezes the reference.

**Q13. Static nested class vs inner class?** A static nested class has no link to an outer instance. An inner class holds a hidden `Outer.this` reference, needs an outer object to be created (`outer.new Inner()`), and can keep that object alive (a leak risk).

**Q14. What does a record generate, and what can't it do?** Private final fields, canonical constructor, accessors, `equals`, `hashCode`, `toString`. It is final, can't extend a class (it extends `Record`), can't declare extra instance fields, and is only shallowly immutable.

**Q15. What problem do sealed classes solve?** They close a hierarchy (`permits`), so the compiler knows every subtype. A pattern-matching `switch` over it can be exhaustive without `default`, and adding a subtype breaks the compile exactly where code must change.

### 5 takeaways

- A class is loaded once; each `new` makes a heap object with its own fields; variables only hold references.
- Initialisation runs static (once, parent first), then parent's instance part, then child's; constructors chain through `this(…)`/`super(…)`.
- Encapsulate behaviour, not just fields; immutability = final class + private final fields + defensive copies.
- Overloads are picked by `javac` from declared types; overrides by the JVM from the object's class; fields and statics are never polymorphic.
- Prefer interfaces and composition; override `equals` and `hashCode` together; reach for records, enums and sealed types first.

### Check yourself

The 12-question quiz is in "Practice layer" → "Lesson 05 quiz" (`QZ.l05` in `course.js`).
