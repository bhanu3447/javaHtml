# Lesson 01 — What is a String, and where does it live?

Page: `java/lessons/01-strings.html` (`body data-page="l01"`, band `.band#str`, section ids `st-*`). Labs: `assets/labs/labs-strings.js` (analogy visuals `#anTwins`, `#anBook`); the String pool stepper `#poolviz` and the `[data-cells]` boxes are core widgets in `course.js`. Quiz `QZ.l01` (10, B/I/A) and recall prompts `RC.l01` in `quiz-data.js`. Figures `fig-jvm fig-anatomy fig-scp1 fig-scp2 fig-scp3 fig-newbc fig-count5 fig-cmp fig-immut` are the v1 SVGs (from `archive/java-v1`), reused unchanged. Every program below was run on JDK 25 (`java File.java`); outputs are in the comments.

Scope (user, 2026-10-24: "what is string and how it will store, SCP and all, give with the same visualization"): the object, the three ways to create one, stack / heap / pool, the SCP in depth, `new String()`, `==` vs `equals`, immutability, compile-time vs run-time concatenation. Methods, StringBuilder, formatting, regex and Unicode are later lessons.

## 1. What is a String?

A String is a sequence of characters: an **object** of the `final` class `java.lang.String`, not a primitive. A String variable holds a **reference** to the object, never the letters themselves. Indexes start at 0; `length() - 1` is the last index. `char` holds exactly one character (single quotes, a 16-bit number, never null); `String` holds zero or more (double quotes, a reference type, can be `null`). `""` is an empty object; `null` is no object, so calling a method on it throws `NullPointerException`. Facts: `java.lang` needs no import, the class is `final`, the object is immutable, the variable is a reference.

Analogy strip: a String variable is a **number plate**, not the car. Two plates can point at the same car; a plate can be moved; the car holds the letters.

```java
// StringBasics.java
public class StringBasics {

    public static void main(String[] args) {
        String greeting = "Hello";            // a String: text in double quotes
        char letter = 'H';                    // a char: ONE character in single quotes

        System.out.println(greeting);                       // Hello
        System.out.println(greeting.length());              // 5
        System.out.println(greeting.charAt(0));             // H
        System.out.println(greeting.charAt(4));             // o   (last index = length - 1)
        System.out.println(letter == greeting.charAt(0));   // true

        String empty = "";                    // a real object with length 0
        String nothing = null;                // no object at all
        System.out.println(empty.length());                 // 0
        System.out.println(nothing == null);                // true

        System.out.println(greeting.getClass().getName());  // java.lang.String
    }
}
```

## 2. Three ways to create one

| Way | Example | Where the object comes from | Use it when |
|---|---|---|---|
| Literal | `String a = "car";` | The pool: one shared object per distinct text | Always, by default |
| `new` | `new String("car")` | A fresh heap object, outside the pool | Practically never |
| From data | `new String(chars)`, `String.valueOf(42)`, `a.toUpperCase()` | A fresh heap object, not pooled | Whenever the text is computed |

```java
// CreateStrings.java
public class CreateStrings {

    public static void main(String[] args) {
        // 1. A literal: the normal way. Goes through the String pool.
        String a = "car";

        // 2. new: always a separate object on the heap
        String b = new String("car");

        // 3. From other data
        char[] letters = {'c', 'a', 'r'};
        String c = new String(letters);       // from a char array
        String d = String.valueOf(42);        // "42" from an int
        String e = "c" + "a" + "r";           // joined by the compiler: a literal again
        String f = a.toUpperCase();           // a method result: a new object

        System.out.println(a + " " + b + " " + c + " " + d + " " + e + " " + f);
        // car car car 42 car CAR

        // Same text, but how many objects? == asks "same object?"
        System.out.println(a == b);           // false  (new made a second object)
        System.out.println(a == c);           // false  (built from the array)
        System.out.println(a == e);           // true   (same pooled literal)
        System.out.println(a.equals(b));      // true   (same characters)
    }
}
```

## 3. Where a String lives: stack, heap, pool

Each thread has a **stack** of frames holding local variables (references and primitives). Objects never live there. Every String object and its `byte[]` live on the **heap**. The **String Constant Pool** (HotSpot's `StringTable`) is a table pointing at one canonical String per distinct literal; since Java 7 those pooled Strings are ordinary heap objects. **Metaspace** holds loaded classes and their constant tables (where the text of a literal sits before first use). Figure `fig-jvm`.

Passing a String to a method copies the **reference** (pass-by-value): the method reads the same object, but reassigning its parameter moves only its own copy.

```java
// WhereItLives.java
public class WhereItLives {

    static void rename(String name) {         // 'name' is a COPY of the reference
        name = name + "!";                    // builds a new String, moves only the copy
        System.out.println("inside: " + name);
    }

    public static void main(String[] args) {
        String model = "Swift";               // the variable (on the stack) -> the object (on the heap)
        String alias = model;                 // a second reference to the SAME object

        rename(model);                        // inside: Swift!
        System.out.println("after:  " + model);           // after:  Swift
        System.out.println(model == alias);               // true  (still the same object)

        int n = 7;                            // a primitive: the VALUE 7 sits in the variable itself
        int m = n;                            // copies the number, there is no object
        m++;
        System.out.println(n + " " + m);                  // 7 8
    }
}
```

Inside the object (figure `fig-anatomy`): header, `value` (a reference to a `byte[]`), `coder` (0 = Latin-1, 1 byte per char; 1 = UTF-16, 2 bytes), cached `hash`. The characters are in the array, a separate object.

## 4. The String Constant Pool (SCP)

One shared copy of each literal, to **save memory**; safe only because Strings are immutable. Visuals: figure `fig-scp1` (literal vs `new` vs `intern()`), the **pool stepper** `#poolviz` (8 lines: `s1 = "hello"`, `s2 = "hello"`, `s3 = new String("hello")`, `s4 = s3.intern()`, `s5 = "hel" + "lo"`, `part = "hel"`, `s6 = part + "lo"`, `s7 = s6.intern()`; the pool / heap / variables are drawn after each line and a `==` table fills in), and the **sticker book** analogy `#anBook` (press the four statements; literal = look in the book, `new` = private copy, `intern()` = hand it to the book).

Pooled automatically: literals and text blocks, compile-time constants (`"a" + "b"`, `"a" + 1`, `FINAL + "x"`), `static final String` constants, anything interned. Not pooled: the heap object of `new String("abc")`, run-time concatenation, method results (`substring`, `toUpperCase`, `split`, `sb.toString()`), text read from files, Scanner, network, database.

```java
// StringPoolDemo.java
public class StringPoolDemo {

    public static void main(String[] args) {
        String s1 = "hello";                  // goes to the pool
        String s2 = "hello";                  // reuses the SAME pooled object
        String s3 = new String("hello");      // new object on the heap
        String s4 = s3.intern();              // returns the pooled "hello"

        System.out.println(s1 == s2);         // true
        System.out.println(s1 == s3);         // false
        System.out.println(s1 == s4);         // true
        System.out.println(s1.equals(s3));    // true  (same content)

        // Compile-time constants are joined by the compiler
        String s5 = "hel" + "lo";             // becomes "hello" at compile time
        System.out.println(s1 == s5);         // true

        String part = "hel";
        String s6 = part + "lo";              // built at runtime -> new object
        System.out.println(s1 == s6);         // false
        System.out.println(s1 == s6.intern()); // true

        final String constPart = "hel";
        String s7 = constPart + "lo";         // final + literal -> compile-time constant
        System.out.println(s1 == s7);         // true
    }
}
```

History: Java 6 pool in PermGen (fixed size, `intern()` copies, `OutOfMemoryError: PermGen space`); Java 7 pool in the main heap (`intern()` stores a reference to the existing object, pooled Strings can be collected); Java 8 PermGen removed, Metaspace for class metadata; Java 11+ concurrent, self-resizing StringTable, default `StringTableSize` 65536 (checked on JDK 25). Figure `fig-scp3`.

`intern()` rules: if the pool has an equal String, return that reference; otherwise add **this** object's reference and return it (the first object interned becomes canonical). Use rarely (a hash lookup each time). Entries are weak: an unreferenced pooled String can be collected; literals stay alive while their class is loaded.

Interview answer: a JVM-wide table of unique String objects; every literal is resolved through it, so equal literals share one object (memory saving; `==` true between them); in the heap since Java 7; `new String("x")` always creates a separate heap object; `intern()` returns the pooled copy, adding one if needed. Follow-ups: why not intern everything (cost, only for many repeated long-lived values); the pool is not a cache for `==`; pooled Strings can be collected since Java 7.

## 5. What `new String("x")` really does

Bytecode of `String s = new String("hi");` (javap, JDK 25): `new #7` (empty String on the heap), `dup`, `ldc #9` (the pooled `"hi"`, created on first use), `invokespecial #11` (`String.<init>(String)`: copies `value`, `coder`, `hash`; the `byte[]` is **shared**), `astore_1`. So `s == "hi"` is false, `s.equals("hi")` is true. Figure `fig-newbc`.

"How many String objects?" (nothing pooled before): `String s = "java";` 1 · `String a = "x"; String b = "x";` 1 · `new String("java");` 2 · `new String("x"); new String("x");` 3 · `String s = "a" + "b";` 1 (folded) · `String a = "a"; String b = a + "b";` 2 on JDK 9+ (`"b"` is in the invokedynamic recipe; 3 up to Java 8) · `new String("a") + new String("b");` 5 (figure `fig-count5`). Before Java 9 the run-time rows also created a temporary StringBuilder (an object, not a String).

```java
// NewStringCount.java
public class NewStringCount {

    public static void main(String[] args) {
        String lit = "java";
        String copy1 = new String("java");
        String copy2 = new String("java");

        System.out.println(lit == copy1);                 // false
        System.out.println(copy1 == copy2);               // false (two separate heap objects)
        System.out.println(copy1.equals(copy2));          // true
        System.out.println(copy1.intern() == lit);        // true  (intern finds the pooled one)

        // A String built at run time is NOT in the pool until you intern it
        String built = new StringBuilder("sw").append("ift").toString();
        System.out.println(built == "swift");             // false
        System.out.println(built.intern() == "swift");    // true

        // Since Java 7 the FIRST object interned becomes the pooled one (no copy is made)
        String fresh = new StringBuilder("uniq").append("Text99").toString();
        System.out.println(fresh.intern() == fresh);      // true
    }
}
```

The last line: `"java"` is pooled by the JDK itself before `main` runs, so interning a run-time `"java"` returns the JDK's object. `==` "sometimes works" for reasons like this; never use it for content.

## 6. `==` vs `equals`

`==` compares the arrows (same object?); `equals` compares the characters. The pool makes `==` true by accident between literals, which is why it is dangerous. Figure `fig-cmp` (two objects with the same text; `compareTo` walks to the first differing char). Analogy `#anTwins`: two `new String("Asha")` are identical twins (`==` false, `equals` true); a second variable is a nickname for one person (`==` true); two literals share one pooled person.

```java
// CompareStrings.java
public class CompareStrings {

    public static void main(String[] args) {
        String a = "Swift";
        String b = new String("Swift");
        String c = "swift";

        System.out.println(a == b);                       // false  same object?
        System.out.println(a.equals(b));                  // true   same characters?
        System.out.println(a.equals(c));                  // false  case matters
        System.out.println(a.equalsIgnoreCase(c));        // true

        System.out.println(a.compareTo(c));               // -32    'S' (83) - 's' (115)
        System.out.println("apple".compareTo("banana"));  // -1     'a' - 'b'
        System.out.println("car".compareTo("cars"));      // -1     length difference
        System.out.println("car".compareTo("car"));       // 0

        String input = null;
        System.out.println("yes".equals(input));          // false  (null-safe: literal first)
        try {
            System.out.println(input.equals("yes"));
        } catch (NullPointerException e) {
            System.out.println("NPE: input is null");     // NPE: input is null
        }
    }
}
```

Rule: compare content with `equals()`, literal first (`"yes".equals(input)`) so a null input gives false. The only honest use of `==` on Strings is a null test.

## 7. Why a String can never change

Characters are fixed for life; every "changing" method (`toUpperCase`, `trim`, `replace`, `+`) returns a new object. The class is `final`, `value` is private and never exposed. Figure `fig-immut` (after `original = original + "!"` only the variable moves; `alias` still sees `"hi"`). Five reasons: pool sharing, cached hash (safe HashMap key), thread safety without locks, security (checked paths / class names can't change), class loading.

```java
// Immutable.java
public class Immutable {

    public static void main(String[] args) {
        String s = "java";
        s.toUpperCase();                      // returns "JAVA"... and throws it away
        System.out.println(s);                // java   (unchanged)

        s = s.toUpperCase();                  // keep the NEW String by reassigning
        System.out.println(s);                // JAVA

        String original = "hi";
        String alias = original;              // both point to the same "hi"
        original = original + "!";            // a NEW object; only 'original' moves
        System.out.println(original);         // hi!
        System.out.println(alias);            // hi    (the shared object never changed)

        // A String's hash is computed once and cached: safe because the text can't change
        String key = "parking";
        System.out.println(key.hashCode());   // -793201736
        System.out.println(key.hashCode());   // -793201736  (same, read from the cache)
    }
}
```

Mistakes: `s.toUpperCase();` without assigning (nothing changes → `s = s.toUpperCase();`); `a == b` for content (→ `equals`); `input.equals("yes")` on null (→ `"yes".equals(input)`); expecting `rename(s)` to change the caller's `s` (only the method's copy of the reference moves → return and assign).

## 8. Compile time vs run time

The compiler folds `+` over constants (literals, `final` variables initialised with literals) into one pooled literal; anything with a plain variable runs at run time and gives a new heap object. Figure `fig-scp2`.

| Expression | Decided | `== "hello"` |
|---|---|---|
| `"hel" + "lo"` | Compile time (folded) | true |
| `final String p = "hel"; p + "lo"` | Compile time (`p` is a constant) | true |
| `String p = "hel"; p + "lo"` | Run time (new object) | false |
| `(p + "lo").intern()` | Run time, then pooled | true |

Since Java 9 run-time `+` uses `invokedynamic` with a recipe such as `"\u0001lo"` and no StringBuilder; before that javac emitted a StringBuilder. Either way the result is a fresh object. (`+` in a loop and StringBuilder: next lesson.)

## 9. 10 interview questions

1. What is a String? Is it a primitive? — An object of the final class `java.lang.String`, an immutable sequence of characters in a `byte[]`; not a primitive, but with language support (literals, `+`, `switch`).
2. Stack or heap? — The variable is a reference in a stack frame (or a field); the object and its `byte[]` are on the heap; pooled Strings are heap objects since Java 7.
3. What is the SCP, where is it? — One shared copy per literal / interned String; PermGen → heap in Java 7, so collectable.
4. `==` vs `equals()` — references vs characters; always `equals`, literal first.
5. Objects in `new String("abc")` — one or two: the pooled literal (if new) plus one heap object sharing the `byte[]`.
6. `intern()` — returns the canonical pooled copy, adding this object's reference if missing; no copy since Java 7.
7. Why immutable? — pool sharing, cached hash, thread safety, security, class loading.
8. `"a" + "b" == "ab"` true but `a + "b" == "ab"` false — compile-time constant vs run-time object; `final` restores true.
9. Passed by reference? — Always pass-by-value of the reference; reassigning the parameter never touches the caller's variable.
10. Can String be extended? — No, `final`: protects immutability and security, allows JVM optimisations.

## 10. Review

Takeaways: (1) a String is an immutable object, the variable is a reference, object and `byte[]` on the heap; (2) literals go through the pool, one object per text; `new` makes a separate object; `intern()` returns the pooled one; (3) compile-time constants are folded and pooled, run-time results are fresh objects; (4) compare content with `equals`, literal first; (5) "changing" methods return a new String: reassign.

Quiz `QZ.l01` (10 questions, B/I/A), recall prompts `RC.l01` (day 1 / 3 / 7, rendered in `#rcp` on the page), feedback stars `#rates` + comment box (copies a text to paste in the chat).
