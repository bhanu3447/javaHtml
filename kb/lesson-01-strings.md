# Lesson 01 — What is a String, and where does it live?

Page: `java/lessons/01-strings.html` (`body data-page="l01"`, band `.band#str`, section ids `st-*`). Labs: `assets/labs/labs-strings.js` (analogy visuals `#anTwins`, `#anBook`; the String methods playground `#smPlay` of section 8, classes `sm-`, test hook `window.SMX`); the String pool stepper `#poolviz` and the `[data-cells]` boxes are core widgets in `course.js`. Quiz `QZ.l01` (10, B/I/A) and recall prompts `RC.l01` in `quiz-data.js`. Figures `fig-jvm fig-anatomy fig-scp1 fig-scp2 fig-scp3 fig-newbc fig-count5 fig-cmp fig-immut` are the v1 SVGs (from `archive/java-v1`), reused unchanged. Every program below was run on JDK 25 (`java File.java`); outputs are in the comments.

Scope (user, 2026-10-24: "what is string and how it will store, SCP and all, give with the same visualization"): the object, the three ways to create one, stack / heap / pool, the SCP in depth, `new String()`, `==` vs `equals`, immutability, compile-time vs run-time concatenation. The String methods are section 8 (user, 2026-10-25: "in string one playground which will explain all the methods"); StringBuilder, formatting in depth, regex and Unicode are later lessons.

**Rewrite 2026-10-25** (user: "focus on the understanding, then more examples, proper examples"; scope: the whole lesson): every section intro and long figure caption was cut to 2–3 sentences, and every section 01–09 got **example cards** (`.exg` grid of `.exc`: title, a 3–8 line snippet shown static and highlighted via `pre[data-ex]` + `hl()` in `labs-strings.js`, outputs as comments, one line of why). 34 cards; every snippet was run on JDK 25 (`Ex.java` in the temp folder, one block per card). The examples are listed per section below as `// En` blocks. The methods groups table and the three-rules table of section 8 were replaced by cards.

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

Examples (cards):

```java
// E1 Text is not a number
System.out.println("42" + 1);       // 421
System.out.println(42 + 1);         // 43
System.out.println("42".length());  // 2
// E2 char vs String
char c = 'H'; String s = "H";
System.out.println(c + 1);   // 73   a char is a number (H = 72)
System.out.println(s + 1);   // H1   a String is text
// E3 Empty is not null
String empty = ""; String nothing = null;
System.out.println(empty.length());    // 0
System.out.println(nothing == null);   // true
System.out.println(nothing.length());  // NullPointerException
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

Examples (cards, after the program):

```java
// E4 A literal is shared
String a = "car"; String b = "car";
System.out.println(a == b);   // true   one pooled object, two variables
// E5 new always makes another object
String a = "car"; String b = new String("car");
System.out.println(a == b);        // false
System.out.println(a.equals(b));   // true
// E6 Computed text is a new object
String a = "car"; String up = a.toUpperCase(); String num = String.valueOf(42); char[] letters = {'c', 'a', 'r'};
System.out.println(up + " " + num + " " + new String(letters));  // CAR 42 car
System.out.println(new String(letters) == a);                     // false
```

## 3. Where a String lives: stack, heap, pool

**The three areas, defined first** (user, 2026-10-25: "metaspace, heap and stack: somewhere they need to be explained"): a table *Area · What it is · What goes there · Created/removed · When it is full*. Stack: one per thread, a frame per running method, holds primitive values and references, never objects; `StackOverflowError`. Heap: one per program, every object (Strings, their `byte[]`, arrays), the String pool points at some of them; removed by the GC when unreferenced; `OutOfMemoryError: Java heap space`. Metaspace: one per program, every loaded class (bytecode, method tables, constant pool where a literal's text sits until first use), replaced PermGen in Java 8; `OutOfMemoryError: Metaspace`. Then an annotated card "Which area? One line at a time" (`class Garage` → Metaspace; `park()` frame → stack; `int n = 7` → stack value; `String s = "Swift"` → reference on the stack, pooled object on the heap; `String t = s + "!"` → new heap object; return → frame gone, objects stay until GC).

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

Examples (cards, before "Inside the object"; E10 after it):

```java
// E7 Two plates, one car
String model = "Swift"; String alias = model;
System.out.println(model == alias);   // true
model = "Dzire";
System.out.println(alias);            // Swift
// E8 A method gets a copy of the plate
static void rename(String name) { name = "Gone"; }
String s = "Swift"; rename(s);
System.out.println(s);        // Swift
// E9 Primitive copies the value, String copies the reference
int n = 7; int m = n; m++;
System.out.println(n + " " + m);   // 7 8
String p = "hi"; String q = p;
System.out.println(p == q);        // true
// E10 length() counts UTF-16 units, not symbols
System.out.println("₹".length());                // 1
System.out.println("😀".length());               // 2
System.out.println("😀".codePointCount(0, 2));   // 1
```

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

Examples (cards, replacing the old "intern() rules" list; the "use rarely" line stays as a small note):

```java
// E11 Every literal with the same text is one object
String a = "OK"; String b = "OK"; String c = "O" + "K";
System.out.println(a == b && b == c);     // true
// E12 new is outside the pool, intern() gets you back in
String heap = new String("OK");
System.out.println(heap == "OK");            // false
System.out.println(heap.intern() == "OK");   // true
// E13 Run-time text is not pooled
String k = "O"; String built = k + "K";
System.out.println(built == "OK");           // false
System.out.println(built.equals("OK"));      // true
// E14 The first intern() wins
String fresh = new StringBuilder("zq").append("77").toString();
System.out.println(fresh.intern() == fresh);   // true
String again = new StringBuilder("zq").append("77").toString();
System.out.println(again.intern() == fresh);   // true
System.out.println(again == fresh);            // false
```

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

Examples (cards, before the program):

```java
// E15 Two objects, one text
String s = new String("hi");
System.out.println(s == "hi");           // false
System.out.println(s.equals("hi"));      // true
System.out.println(s.intern() == "hi");  // true
// E16 Two news, three objects
String a = new String("x"); String b = new String("x");
System.out.println(a == b);                     // false
System.out.println(a.intern() == b.intern());   // true
// E17 + at run time makes one more
String a = new String("a"); String ab = a + new String("b");
System.out.println(ab == "ab");          // false
System.out.println(ab.intern() == "ab"); // true
```

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

Examples (cards, before the program):

```java
// E18 Same text, two objects
String a = "Swift"; String b = new String("Swift");
System.out.println(a == b);        // false
System.out.println(a.equals(b));   // true
// E19 Literal first, so null can't bite
String input = null;
System.out.println("yes".equals(input));   // false
System.out.println(input.equals("yes"));   // NullPointerException
// E20 compareTo: only the sign matters
System.out.println("apple".compareTo("apricot"));  // -2   'p' (112) - 'r' (114)
System.out.println("car".compareTo("cars"));       // -1   length 3 - 4
System.out.println("b".compareTo("a"));            // 1
System.out.println("Zebra".compareTo("apple"));    // -7   'Z' (90) - 'a' (97)
// E21 switch and contains already use equals
String cmd = new String("go");
switch (cmd) { case "go" -> System.out.println("matched"); default -> System.out.println("no"); }  // matched
System.out.println(List.of("go").contains(cmd));  // true
```

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

Examples (cards, before the program):

```java
// E22 The forgotten result
String s = "java"; s.toUpperCase();
System.out.println(s);        // java
s = s.toUpperCase();
System.out.println(s);        // JAVA
// E23 An alias never sees a change
String a = "hi"; String b = a; a = a + "!";
System.out.println(a + " " + b);   // hi! hi
// E24 StringBuilder is the mutable one
StringBuilder sb = new StringBuilder("hi"); StringBuilder same = sb; sb.append("!");
System.out.println(same);        // hi!
String s = "hi"; String t = s.concat("!");
System.out.println(s + " " + t); // hi hi!
// E25 Safe as a map key
Map<String, Integer> stock = new HashMap<>(); String key = "Swift"; stock.put(key, 3);
key = key.toLowerCase();
System.out.println(stock.get("Swift"));   // 3
System.out.println(key);                  // swift
```

## 8. Every String method, live (the String methods playground)

Section `st-methods`, host `<div class="viz an" id="smPlay">`, built by `labs-strings.js` (classes `sm-`, CSS block `/* string methods playground v41 */`). **43 methods in 6 groups**: Inspect (`length isEmpty isBlank charAt hashCode`), Search (`indexOf indexOf(str,from) lastIndexOf contains startsWith endsWith matches`), Extract & split (`substring(b) substring(b,e) split split(re,limit) lines`), Transform (`toUpperCase toLowerCase trim strip stripLeading stripTrailing replace(char,char) replace(cs,cs) replaceAll replaceFirst repeat concat indent formatted`), Compare (`equals equalsIgnoreCase compareTo compareToIgnoreCase intern`), Convert & static (`toCharArray chars getBytes toString String.valueOf String.join String.format`).

How it works: the text box and every String argument are the **body of a Java literal** (`\n \t \" \\ \uXXXX` work; an unknown escape such as `\d` is the javac compile error). Each method has its own sample text (loaded while "method's own sample" is on; typing or a preset chip turns that off), its signature with a Java-version badge (1.0 / 11+ / 12+ / 15+), argument inputs typed like javac (int must be a whole number, char exactly one character, `Object` args are typed int / double / boolean / String), the cells of `s` with marks (amber = read, red = removed or the failing position, green = changed), the call and its result with a type badge ("new String object" / "new String[]" / "a value, not a String"), the result as cells (String) or pieces (arrays, streams), the line "s is still …" (immutability), a two-line code preview with the result as a comment, a **why** paragraph computed from the actual result (for example the first differing index of `equals`, the char arithmetic of `compareTo`, the count of pieces of `split`), a "Watch out" tip and an "Interview" line. Exceptions show the JDK 25 message (`Index 20 out of bounds for length 12`, `Range [3, 1) out of bounds for length 12`, `count is negative: -1`, `d != java.lang.String`, `Format specifier '%s'`). ← / → / Previous / Next walk the list, ▶ Tour all steps every 3.2 s (6 s under reduced motion), "Explored n / 43" and a green dot per seen method persist in `js1-sm-seen`. `window.SMX = {M, calc, unesc, lit, parseArg, pick}` is the test hook.

Verification (2026-10-25): a headless run of the page computed every method's default example and 20 edge/error cases and matched `Verify.java` on JDK 25 line for line (the scratchpad `mk.mjs` + `smtest.js` recipe); the browser regex engine is the only known difference (noted under the playground). The program below is the same tour on a real JDK.

```java
// StringMethods.java
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

public class StringMethods {

    public static void main(String[] args) {
        String s = "Hello, World";

        // Inspect
        System.out.println(s.length());                                    // 12
        System.out.println(s.isEmpty());                                   // false
        System.out.println("  \t ".isBlank());                             // true
        System.out.println(s.charAt(4));                                   // o
        System.out.println("car".hashCode());                              // 98260

        // Search (-1 means "not found")
        System.out.println(s.indexOf("o"));                                // 4
        System.out.println(s.indexOf("o", 5));                             // 8
        System.out.println(s.lastIndexOf("o"));                            // 8
        System.out.println(s.indexOf("z"));                                // -1
        System.out.println(s.contains("World"));                           // true
        System.out.println(s.startsWith("Hell"));                          // true
        System.out.println("report.pdf".endsWith(".pdf"));                 // true
        System.out.println("2026-10-25".matches("\\d{4}-\\d{2}-\\d{2}"));  // true

        // Extract and split (end index is excluded)
        System.out.println(s.substring(7));                                // World
        System.out.println(s.substring(0, 5));                             // Hello
        System.out.println(Arrays.toString("a,b,,c,,".split(",")));        // [a, b, , c]
        System.out.println(Arrays.toString("a,b,,c,,".split(",", -1)));    // [a, b, , c, , ]
        System.out.println("one\ntwo\nthree\n".lines().toList());          // [one, two, three]

        // Transform: every one of these returns a NEW String
        System.out.println(s.toUpperCase());                               // HELLO, WORLD
        System.out.println("  java \t".trim() + "|");                      // java|
        System.out.println("  java  ".strip() + "|");            // java|
        System.out.println(s.replace('l', 'L'));                           // HeLLo, WorLd
        System.out.println(s.replace("World", "Java"));                    // Hello, Java
        System.out.println("a1b22c333".replaceAll("[0-9]+", "#"));         // a#b#c#
        System.out.println("ab".repeat(3));                                // ababab
        System.out.println("Total: %,d items".formatted(1234567));         // Total: 1,234,567 items
        System.out.println(s);                                             // Hello, World   (unchanged)

        // Compare
        System.out.println(s.equals("hello, world"));                      // false
        System.out.println(s.equalsIgnoreCase("hello, world"));            // true
        System.out.println(s.compareTo("Help"));                           // -4   ('l' is 108, 'p' is 112)
        System.out.println("apple".compareToIgnoreCase("Banana"));         // -1

        // Convert and static
        System.out.println(Arrays.toString("Java".toCharArray()));         // [J, a, v, a]
        System.out.println(Arrays.toString("Hi ₹".getBytes(StandardCharsets.UTF_8))); // [72, 105, 32, -30, -126, -71]
        System.out.println(String.valueOf(42) + 1);                        // 421
        System.out.println(String.join(", ", "red", "green", "blue"));     // red, green, blue
        System.out.println(String.format("[%-6s] done %%", "Java"));       // [Java  ] done %

        // The trap: a result you don't keep is lost
        s.toUpperCase();
        System.out.println(s);                                             // Hello, World
        s = s.toUpperCase();
        System.out.println(s);                                             // HELLO, WORLD

        // Off by one: the last index is length() - 1
        try {
            s.charAt(s.length());
        } catch (StringIndexOutOfBoundsException e) {
            System.out.println(e.getMessage());                            // Index 12 out of bounds for length 12
        }
    }
}
```

Analogy ("Remember it" strip): a String method is a **photocopier, never an eraser**: you get a fresh copy with the change on it, the original stays in the tray; walk away without the copy (`s.toUpperCase();` alone) and nothing happened. Three rules table: indexes 0 … `length() - 1`; `substring` excludes the end (length = end − begin); `split`, `replaceAll`, `replaceFirst`, `matches` take a regex (`split(".")` gives an empty array).

Examples (cards "the six that cover most bugs", replacing the three-rules table; the groups table was removed, the playground's left column lists the groups):

```java
// E26 Off by one
String s = "Hello";
System.out.println(s.charAt(s.length() - 1));   // o
System.out.println(s.charAt(s.length()));       // StringIndexOutOfBoundsException: Index 5 out of bounds for length 5
// E27 substring: the end is excluded
String s = "Hello, World";
System.out.println(s.substring(7));              // World
System.out.println(s.substring(0, 5));           // Hello
System.out.println(s.substring(5, 7).length());  // 2
// E28 split takes a regex
System.out.println("a.b.c".split(".").length);      // 0
System.out.println("a.b.c".split("\\.").length);    // 3
System.out.println("a,b,,c,,".split(",").length);   // 4
// E29 Chain them
String raw = "  Java 25  "; String clean = raw.trim().toLowerCase().replace(" ", "-");
System.out.println(clean);              // java-25
System.out.println("[" + raw + "]");    // [  Java 25  ]
// E30 replace vs replaceAll
String s = "a.b.c";
System.out.println(s.replace(".", "-"));        // a-b-c
System.out.println(s.replaceAll(".", "-"));     // -----
System.out.println(s.replaceAll("\\.", "-"));   // a-b-c
// E31 Searching: -1 is an answer, not an error
String s = "Mississippi";
System.out.println(s.indexOf("ss"));       // 2
System.out.println(s.indexOf("ss", 3));    // 5
System.out.println(s.lastIndexOf("i"));    // 10
System.out.println(s.indexOf("z"));        // -1
```

## 9. Compile time vs run time

The compiler folds `+` over constants (literals, `final` variables initialised with literals) into one pooled literal; anything with a plain variable runs at run time and gives a new heap object. Figure `fig-scp2`.

| Expression | Decided | `== "hello"` |
|---|---|---|
| `"hel" + "lo"` | Compile time (folded) | true |
| `final String p = "hel"; p + "lo"` | Compile time (`p` is a constant) | true |
| `String p = "hel"; p + "lo"` | Run time (new object) | false |
| `(p + "lo").intern()` | Run time, then pooled | true |

Since Java 9 run-time `+` uses `invokedynamic` with a recipe such as `"\u0001lo"` and no StringBuilder; before that javac emitted a StringBuilder. Either way the result is a fresh object. (`+` in a loop and StringBuilder: next lesson.)

Examples (cards, after the table):

```java
// E32 Folded by javac
String s = "hel" + "lo";
System.out.println(s == "hello");    // true
// E33 final makes it a constant
final String p = "hel"; String q = "hel";
System.out.println((p + "lo") == "hello");   // true
System.out.println((q + "lo") == "hello");   // false
// E34 Numbers fold too
String a = "v" + 25; String b = "v25";
System.out.println(a == b);           // true
int n = 25;
System.out.println(("v" + n) == b);   // false
```

## 10. 10 interview questions

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

## 11. Review

Takeaways: (1) a String is an immutable object, the variable is a reference, object and `byte[]` on the heap; (2) literals go through the pool, one object per text; `new` makes a separate object; `intern()` returns the pooled one; (3) compile-time constants are folded and pooled, run-time results are fresh objects; (4) compare content with `equals`, literal first; (5) "changing" methods return a new String: reassign.

Quiz `QZ.l01` (12 questions, B/I/A; the last two are on the methods: the unkept `toUpperCase()` + `substring` end index, and `split(".")`), recall prompts `RC.l01` (day 1 / 3 / 7, rendered in `#rcp` on the page), feedback stars `#rates` + comment box (copies a text to paste in the chat).
