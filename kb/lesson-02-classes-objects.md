# Lesson 02 — What is a Class and an Object?

Page: `java/lessons/02-classes-objects.html` (`body data-page="l02"`, band `.band#cls`, section ids `co-*`). Labs: `assets/labs/labs-objects.js` (`#olFactory` Car Factory, `#olObj` object lab, `#olStatic` static vs instance; all three from v1 Lesson 05, `archive/java-v1/assets/labs/labs-oop.js`, styles `.ol-* .olf-*` already in `course.css`; the file also assigns the global `OLF` declared in course.js). Step-through `RUNS.objs` (Cars.java) is a core widget in `course.js` (`<div class="runviz" data-run="objs">`). Figure `fig-objmem` is the v1 SVG (the vtable lines replaced by "method code lives here, once, not in each object"). Quiz `QZ.l02` (10, B/I/A) and recall prompts `RC.l02` in `quiz-data.js`. Every program below was run on JDK 25 (`java File.java`); outputs are in the comments. The two "compile error" comments and the static-context message in the quiz were checked with javac too.

Scope (user, 2026-10-25: "here i need what is class and object properly"): what a class and an object are, the members of a class, what `new` does and default values, where objects live (stack / heap / Metaspace), references and null and GC eligibility, constructors and `this`, static vs instance, printing and comparing objects (`toString`, `==`, `equals`/`hashCode`), common mistakes. Encapsulation, inheritance, polymorphism, abstraction, records and enums are later lessons.

## 1. What is a class? What is an object?

A **class** is a blueprint: what every thing of that kind **has** (fields) and **can do** (methods). An **object** is one real thing built from it with `new`; one class, any number of objects, each with its own copy of the fields. Every object has **state** (field values), **behaviour** (methods) and **identity** (it is itself, not its twin). "Instance" = object.

Analogy (course-wide car story): class = the car's **blueprint**, object = a **real car** built in the factory (`new`), variable = the **car key** (copying a key does not build a car). Lab `#olFactory`: pick a model and colour, press `new Car(…)`; each car has `accelerate(20)`, `honk()`, `paint()`, `copy key`; only the clicked car changes.

```java
// Car.java
public class Car {

    // fields: what every car HAS (each object gets its own copy)
    String model;
    String color;
    int speed;

    // a constructor: runs once, when new Car(...) builds the object
    Car(String model, String color) {
        this.model = model;                // this.model = the field, model = the parameter
        this.color = color;
    }

    // methods: what every car CAN DO (written once, used by every object)
    void accelerate(int by) {
        speed += by;
    }

    void describe() {
        System.out.println(color + " " + model + " at " + speed + " km/h");
    }

    public static void main(String[] args) {
        Car a = new Car("Swift", "red");   // object 1, built from the blueprint
        Car b = new Car("Nexon", "blue");  // object 2: same blueprint, its own fields

        a.accelerate(40);                  // only a's speed changes
        b.accelerate(90);

        a.describe();                      // red Swift at 40 km/h
        b.describe();                      // blue Nexon at 90 km/h

        System.out.println(a == b);                 // false  (two different objects)
        System.out.println(a.getClass().getName()); // Car    (both are built from class Car)
    }
}
```

| | Class | Object |
|---|---|---|
| What it is | A blueprint, a template, a type | One real instance of that type |
| How you make it | Written once: `class Car { … }` | At run time with `new Car(…)`, as many as needed |
| Exists | In source code, then loaded once by the JVM | On the heap while the program runs |
| Holds data? | No (only describes the fields; static aside) | Yes: its own value for every field |
| Real world | The blueprint | The red Swift in the parking lot |

## 2. Inside a class: fields, constructors, methods

Members: **field** (data per object, a noun), **constructor** (sets up a new object; class name, no return type; runs once inside `new`), **method** (behaviour, a verb). A class is a new **type**: variables, parameters, return values and arrays can be of type `Car`. The dot reaches this object's member: `c.model`, `a.accelerate(40)`. File rules: a `public class Car` lives in `Car.java`, at most one public top-level class per file; `static class Car` inside another class is a nested class (used to keep examples in one file). Names: classes `PascalCase`, fields and methods `camelCase`.

```java
// Garage.java
public class Garage {

    static class Car {                     // a class is a new TYPE, like int or String
        String model;
        int speed;

        Car(String model) {
            this.model = model;
        }

        Car faster(int by) {               // a method can RETURN an object...
            Car copy = new Car(model);
            copy.speed = speed + by;
            return copy;
        }
    }

    static void print(Car c) {             // ...a method can TAKE one as a parameter...
        System.out.println(c.model + " " + c.speed);
    }

    public static void main(String[] args) {
        Car[] lot = { new Car("Swift"), new Car("Nexon"), new Car("Creta") };   // ...and an array can hold them
        for (Car c : lot) {
            print(c);                      // Swift 0, then Nexon 0, then Creta 0
        }

        Car quick = lot[0].faster(60);
        print(quick);                      // Swift 60
        print(lot[0]);                     // Swift 0   (the original object is unchanged)
        System.out.println(lot.length);    // 3
    }
}
```

## 3. What `new` really does

Three steps: (1) allocate the object on the heap with every field at its default; (2) run the constructor with `this` = the new object; (3) return a reference. Strip: the factory builds a bare car, the workers (constructor) paint it, then you get the key. Step-through `RUNS.objs` (9 steps, prints `Swift 60`). Defaults: `byte short int long` 0, `float double` 0.0, `boolean` false, `char` character 0, references `null`. Local variables get no default (compile error if read unassigned).

```java
// DefaultValues.java
public class DefaultValues {

    static class Car {
        String model;          // a reference field -> null
        int speed;             // int               -> 0
        double fuel;           // double            -> 0.0
        boolean running;       // boolean           -> false
        char gear;             // char              -> character number 0 (invisible)
    }

    public static void main(String[] args) {
        Car c = new Car();     // we wrote no constructor, so the compiler added: Car() {}

        System.out.println(c.model);         // null
        System.out.println(c.speed);         // 0
        System.out.println(c.fuel);          // 0.0
        System.out.println(c.running);       // false
        System.out.println((int) c.gear);    // 0

        int local;                           // a LOCAL variable gets no default value
        // System.out.println(local);        // compile error: variable local might not have been initialized
    }
}
```

## 4. Where objects live: stack, heap, Metaspace

Objects on the heap; a class-type variable holds a reference; locals in the stack frame; the class (field layout, method code) loaded once into Metaspace, each object's header has a klass pointer to it. Figure `fig-objmem` (a and c → Car #1 Swift 60, b → Car #2 Nexon 90). Lab `#olObj`: `a = new Car(…)`, `c = a`, `a.speed += 20`, `a = null`, `System.gc()`… with arrows, `==` table, NPE, unreachable objects swept. Passing an object copies the reference (pass-by-value, as in Lesson 01). No delete: an object with no reachable reference is eligible for GC; `System.gc()` is only a request.

```java
// References.java
public class References {

    static class Car {
        String model;
        int speed;

        Car(String model) {
            this.model = model;
        }
    }

    static void tune(Car car) {            // 'car' is a COPY of the caller's reference
        car.speed = 100;                   // follows it: changes the caller's object
        car = new Car("Spare");            // moves only the copy
        car.speed = 5;                     // changes the spare, which nobody else sees
    }

    public static void main(String[] args) {
        Car a = new Car("Swift");
        Car c = a;                         // copies the reference: still ONE car
        c.speed = 60;
        System.out.println(a.speed);                   // 60   (a and c point to the same object)

        a = new Car("Nexon");              // a now points to a new car; c keeps the Swift
        System.out.println(c.model + " " + a.model);   // Swift Nexon

        tune(c);
        System.out.println(c.model + " " + c.speed);   // Swift 100

        Car none = null;                   // a reference to no object at all
        System.out.println(none == null);              // true
        try {
            none.speed = 1;                // there is no object to change
        } catch (NullPointerException e) {
            System.out.println("NullPointerException");  // NullPointerException
        }
    }
}
```

## 5. Constructors and `this`

Constructor: class name, no return type, once per object inside `new`. Default no-arg constructor only when the class declares none. Overload constructors; put the work in one and delegate with `this(…)` (first statement). `this` = current object, needed when a parameter shadows a field. Classic bug: `model = model;` leaves the field null.

```java
// Constructors.java
public class Constructors {

    static class Car {
        String model;
        String color;

        Car(String model, String color) {  // the one constructor that does the real work
            this.model = model;
            this.color = color;
        }

        Car(String model) {                // overloaded: same name, different parameters
            this(model, "white");          // calls the constructor above (must be the first line)
        }

        Car() {
            this("Unknown");
        }

        String describe() {
            return color + " " + model;
        }
    }

    static class Bike {
        String model;

        Bike(String model) {
            model = model;                 // BUG: assigns the parameter to itself
        }
    }

    public static void main(String[] args) {
        System.out.println(new Car("Nexon", "blue").describe());   // blue Nexon
        System.out.println(new Car("Swift").describe());           // white Swift
        System.out.println(new Car().describe());                  // white Unknown

        System.out.println(new Bike("Duke").model);                // null  (forgot this.)
        // new Bike();   // compile error: constructor Bike in class Bike cannot be applied to given types
    }
}
```

## 6. `static` vs instance

Instance field: one per object. Static field: one per class, exists before any object. Static method: no object, no `this`, can't use instance fields directly (why `main` is static). Strip: each car's odometer vs the factory's one counter on the wall. Lab `#olStatic` (`new Car(…)`, `a.built`, `Car.howMany()`).

```java
// StaticVsInstance.java
public class StaticVsInstance {

    static class Car {
        static int built = 0;              // ONE copy, owned by the class
        static final int WHEELS = 4;       // a shared constant

        final int id;                      // one copy PER OBJECT
        String model;

        Car(String model) {
            this.model = model;
            built++;                       // every new car updates the one shared counter
            id = built;                    // ...and keeps its own number
        }

        static int howMany() {             // needs no object, so it has no 'this'
            return built;
        }
    }

    public static void main(String[] args) {
        System.out.println(Car.howMany());                    // 0   (the class exists before any object)

        Car a = new Car("Swift");
        Car b = new Car("Nexon");
        Car c = new Car("Creta");

        System.out.println(a.id + " " + b.id + " " + c.id);  // 1 2 3
        System.out.println(Car.built);                        // 3
        System.out.println(Car.WHEELS);                       // 4
        System.out.println(Car.howMany());                    // 3
    }
}
```

## 7. Printing and comparing objects

Every class extends `Object`: `toString()` (default `ClassName@hexHash`; `println` calls it), `equals()` (default = `==`), `hashCode()`. Override `toString` and `equals`, and always `hashCode` with `equals`. Same rule as Lesson 01: `==` identity, `equals` content.

```java
// PrintCompare.java
import java.util.Objects;

public class PrintCompare {

    static class Plain {                   // writes nothing extra: uses Object's versions
        String model;

        Plain(String model) {
            this.model = model;
        }
    }

    static class Car {
        String model;
        int year;

        Car(String model, int year) {
            this.model = model;
            this.year = year;
        }

        @Override
        public String toString() {         // what println shows
            return model + " (" + year + ")";
        }

        @Override
        public boolean equals(Object o) {  // what "the same car" means for us
            if (this == o) return true;
            if (!(o instanceof Car other)) return false;
            return year == other.year && model.equals(other.model);
        }

        @Override
        public int hashCode() {            // always override together with equals
            return Objects.hash(model, year);
        }
    }

    public static void main(String[] args) {
        Plain p1 = new Plain("Swift");
        Plain p2 = new Plain("Swift");
        System.out.println(p1);                  // PrintCompare$Plain@ followed by a hex hash (changes every run)
        System.out.println(p1.equals(p2));       // false  (Object's equals is just ==)

        Car a = new Car("Swift", 2024);
        Car b = new Car("Swift", 2024);
        System.out.println(a);                   // Swift (2024)   println calls toString()
        System.out.println(a == b);              // false  two different objects
        System.out.println(a.equals(b));         // true   same model and year
        System.out.println(a.hashCode() == b.hashCode());   // true
    }
}
```

## 8. Common mistakes

`Car c = a` to copy (copies the reference → build a new object); method on `null` (NPE); `model = model` (→ `this.model`); adding `Car(String)` then `new Car()` (compile error → write `Car()`); `void Car()` (a method, not a constructor); `a == b` for content (→ override `equals`); instance field from `static main` (compile error "non-static variable … cannot be referenced from a static context" → create an object).

## 9. 10 interview questions

1. Class vs object — blueprint / user-defined type with fields and methods; instance created with `new`, on the heap, own field copies.
2. Difference — logical template written and loaded once vs physical instances, many per class, each with state and identity.
3. `new Car("Swift")` — (load class if needed) allocate with defaults, run constructor (`this`), return reference.
4. Where stored — objects on the heap; local references in the stack frame; field references inside their object; class metadata in Metaspace.
5. `Car c = a;` — copies the reference; one object, `a == c` true.
6. Defaults — 0 / 0.0 / false / char 0 / null; locals none (compile error).
7. Constructor vs method — class name, no return type, once per object, not inherited vs return type, any name, called many times.
8. `this` — current object; shadowed fields, `this(…)`, passing itself; none in static methods.
9. static vs instance — class-owned single copy, via class name, no `this` vs per-object.
10. Ways to create an object — `new`, reflection (`getDeclaredConstructor().newInstance()`), `clone()`, deserialization, factory methods (`List.of`, `LocalDate.now`) that use one of these inside.

## 10. Review

Takeaways: (1) class = blueprint and type, object = instance via `new`; (2) `new` = allocate with defaults, constructor, reference; (3) variables hold references: copying shares, `null` = no object, unreachable objects are collected; (4) constructors set up, `this` = current object, static = class, instance = each object; (5) `println` → `toString`, `==` identity, `equals` content once overridden (with `hashCode`).

Quiz `QZ.l02` (10, B/I/A), recall prompts `RC.l02` (day 1 / 3 / 7, `#rcp`), feedback stars `#rates` + comment box.
