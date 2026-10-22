# KB — Lessons (full text)

This file holds the full text of every lesson. The project notes are in `CLAUDE.md`, which loads automatically. This file does **not** load automatically, so read only the lesson you need (see "Working with KB.md" in `CLAUDE.md`).

## Lesson index

| # | Lesson | Page sections | Programs |
|---|---|---|---|
| 01 | Java Strings: From Zero to Advanced | 1–18 | 13 |
| 02 | String Concepts Deep Dive (theory first) | D1–D13 (`.band#deep`) | 3 |
| 03 | String Problems & Patterns (completing Strings) | S1–S12 (`.band#probs`) | 9 |
| 04 | Java Arrays: From Zero to Advanced | A1–A14 (`.band#arrays`) | 10 |
| 00 | Java Foundations: Platform, Types, Operators, Methods (shown **first** on the page) | F1–F8 (`.band#found`) | 12 |
| 05 | Object-Oriented Programming: Classes, the Four Pillars, Modern Types (`lessons/05-oop.html`) | P1–P10 (`.band#oop`) | 14 |
| 06 | Sorting: every interview sort + bubble sort in depth (`lessons/06-bubble-sort.html`); the sections follow the sort picked in the explorer | B0 explorer + O(n) complexity section (always shown) + bubble B1–B14 + SL, IN, MG, QK, HP 1–4 and CT 1–4, RX, BK, CY, DF 1–3 (52 sections, `.band#bsort`) | 30 + Sorts.java |
| 07 | The Collections Framework (`lessons/07-collections.html`): generics, List, HashMap internals, sets and LRU, TreeMap, queues and heaps, comparators, fail-fast, immutable and concurrent collections | C1–C12 (`.band#coll`) | 12 |
| — | Practice layer: quizzes, recall prompts, interview cards, takeaways (all lessons) | quizzes at each lesson end, Revise hub | — |
| — | Course tools: mock interview + complexity cheat sheet | 17 `#mock`, 18 `#bigo` | — |
| — | Course tools: "Watch it run" step-through programs (7) | in lessons 00–04 | — |
| — | Course tools: analogy layer (12 visuals + 16 "Remember it" strips) | every lesson | — |

Each lesson starts with a `## Lesson NN — Title` heading, and its sections are `### N. Title`. New lessons go at the end of this file; add a row to the index when you add one.

# Part B — Lessons

## Lesson 01 — Java Strings: From Zero to Advanced

*This lesson covers everything about `String`, from "what is it?" to its internals. Later lessons (problems such as reversal, palindromes and anagrams) build on it.*

> Read it top to bottom the first time. For revision, use **Section 16**.
> All code has been compiled and run on JDK 25. The output is shown in the comments.

### Table of Contents

1. What is a String?
2. Creating Strings
3. Memory and the String Pool
4. Immutability
5. Comparing Strings
6. Characters, indexes and length
7. Essential String methods
8. Building Strings: `+`, `StringBuilder`, `StringBuffer`, joining
9. Conversions
10. Formatting and text blocks
11. Regex with Strings
12. Unicode, encoding and internals
13. Common mistakes
14. Interview questions (15)
15. Practice (6 exercises)
16. Revision
17. Playground and live editor
18. Your feedback

---

### 1. What is a String?

A **String is a sequence of characters**, such as `"Hello"`, `"42"` or `""`. In Java it is an **object** of the class `java.lang.String`. It is not a primitive like `int` or `char`.

| | `char` | `String` |
|---|---|---|
| What it holds | Exactly one character | Zero or more characters |
| Quotes | Single: `'H'` | Double: `"Hello"` |
| Kind | Primitive (a 16-bit number) | Object (a reference type) |
| Can be `null`? | No | Yes |
| Empty value | Not possible | `""` (length 0) |

Key facts to know from day one:

- `String` lives in `java.lang`, so you never need to import it.
- It is a **`final` class**, so nobody can extend it.
- It is **immutable**: once created, its characters never change (section 4).
- It implements `CharSequence`, `Comparable<String>` and `Serializable`.
- `""` (empty) and `null` (no object) are different. Calling `null.length()` throws `NullPointerException`.

```
 index:    0   1   2   3   4
         ┌───┬───┬───┬───┬───┐
"Hello"  │ H │ e │ l │ l │ o │      length() = 5, last index = length() - 1 = 4
         └───┴───┴───┴───┴───┘
```

```java
public class StringBasics {

    public static void main(String[] args) {
        String greeting = "Hello";            // a String: text in double quotes
        char letter = 'H';                    // a char: ONE character in single quotes

        System.out.println(greeting);             // Hello
        System.out.println(greeting.length());    // 5
        System.out.println(greeting.charAt(0));   // H
        System.out.println(letter == greeting.charAt(0));   // true

        String empty = "";                    // a real object with length 0
        String nothing = null;                // no object at all
        System.out.println(empty.length());       // 0
        System.out.println(nothing == null);      // true

        CharSequence seq = greeting;          // String implements CharSequence
        System.out.println(seq.length());         // 5
    }
}
```

---

### 2. Creating Strings

| Way | Example | Notes |
|---|---|---|
| Literal | `"java"` | Most common. Uses the **String pool**. |
| `new` | `new String("java")` | Always creates a **new** heap object. You rarely need it. |
| From `char[]` | `new String(chars)` or `String.valueOf(chars)` | Copies the array. |
| From bytes | `new String(bytes, StandardCharsets.UTF_8)` | Always pass a charset. |
| From other types | `String.valueOf(42)`, `Integer.toString(42)` | |
| From a builder | `sb.toString()` | |
| Text block (Java 15+) | `"""` … `"""` | Multi-line text (section 10). |

```java
import java.nio.charset.StandardCharsets;

public class CreatingStrings {

    public static void main(String[] args) {
        String a = "java";                                  // 1. literal (uses the String pool)
        String b = new String("java");                      // 2. new: always a new heap object
        char[] letters = {'j', 'a', 'v', 'a'};
        String c = new String(letters);                     // 3. from a char[]
        byte[] bytes = {106, 97, 118, 97};
        String d = new String(bytes, StandardCharsets.UTF_8);   // 4. from bytes + charset
        String e = String.valueOf(42);                      // 5. from another type
        String f = new StringBuilder("ja").append("va").toString();   // 6. from a builder
        String g = """
                java""";                                    // 7. text block (Java 15+)

        System.out.println(a + " " + b + " " + c + " " + d + " " + e + " " + f + " " + g);
        // java java java java 42 java java

        System.out.println(a.equals(b) && a.equals(c) && a.equals(d) && a.equals(f) && a.equals(g));   // true
        System.out.println(a == g);    // true  (literal and text block share the pooled "java")
        System.out.println(a == b);    // false (new always makes a new object)
    }
}
```

---

### 3. Memory and the String Pool

The **String pool** (also called the string constant pool) stores **one shared copy of each literal**. Since Java 7 the pooled String objects live in the main heap; the lookup table itself (HotSpot's `StringTable`) is native JVM memory.

```
 Stack (variables)           Heap
 ─────────────────           ──────────────────────────────────────
                            ┌───────── String pool ─────────┐
 s1 ──────────────────────▶ │  "hello"                      │
 s2 ──────────────────────▶ │    ▲                          │
                            └────┼──────────────────────────┘
 s4 = s3.intern() ───────────────┘
 s3 ──────────────────────▶  "hello"   (separate object made by new)
```

- `String s1 = "hello"; String s2 = "hello";` makes **one** object, so `s1 == s2` is `true`.
- `new String("hello")` **always** makes a new object outside the pool, so `==` gives `false`.
- `intern()` returns the pooled copy, adding the String to the pool if it isn't there yet.
- **Compile-time constants** are joined by the compiler: `"hel" + "lo"` is the literal `"hello"`. The same is true when one part is a `final` variable initialised with a literal.
- Concatenation at **runtime** (with a non-final variable) creates a new object.

**Why have a pool?** Programs repeat the same text many times. Sharing one copy saves memory. Sharing is only safe *because* Strings are immutable.

**Interview classic:** *How many objects does `new String("hello")` create?* Up to **two**. The literal `"hello"` goes into the pool, if it isn't already there, the first time that line runs (literals are resolved lazily, see Lesson 02). Then `new` creates one more object on the heap. If the literal is already pooled, only **one** new object is created.

```java
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
        String s6 = part + "lo";              // built at runtime → new object
        System.out.println(s1 == s6);         // false

        final String constPart = "hel";
        String s7 = constPart + "lo";         // final + literal → compile-time constant
        System.out.println(s1 == s7);         // true
    }
}
```

> **Rule:** never use `==` to compare String content. Use `equals()`. The `==` results above only show *where objects live*.

---

### 4. Immutability

**Immutable** means a String's characters can never change after it is created. Every method that seems to modify a String (`toUpperCase`, `replace`, `trim`, `concat`, `substring`…) actually **returns a new String**. The original is left unchanged.

```
 name ──▶ "java"            name.toUpperCase()  →  "JAVA" is created, but nothing points to it
 name ──▶ "JAVA"            name = name.toUpperCase()  →  the variable now points to the new object
          "java"  ← still exists until the garbage collector removes it
```

**Why did Java's designers make String immutable?**

1. **The pool is safe.** Many variables can share one object without affecting each other.
2. **Security.** File paths, URLs, class names and passwords can't be changed after they are checked.
3. **Thread safety.** Strings can be shared across threads with no locking.
4. **Cached `hashCode`.** It is computed once and reused, which makes Strings fast `HashMap` keys.
5. **Class loading.** Class names passed as Strings can't be altered.

**Need to change text often?** Use `StringBuilder`, which is mutable (section 8).

```java
public class ImmutabilityDemo {

    public static void main(String[] args) {
        String name = "java";
        name.toUpperCase();                   // creates "JAVA" ... and throws it away
        System.out.println(name);             // java

        name = name.toUpperCase();            // keep the result by reassigning
        System.out.println(name);             // JAVA

        String original = "hi";
        String alias = original;              // both variables point to the same object
        original = original + "!";            // original now points to a NEW object
        System.out.println(alias);            // hi
        System.out.println(original);         // hi!

        StringBuilder sb = new StringBuilder("java");
        sb.setCharAt(0, 'J');                 // StringBuilder IS mutable
        System.out.println(sb);               // Java
    }
}
```

---

### 5. Comparing Strings

| Method | Compares | Returns | Use it for |
|---|---|---|---|
| `a == b` | **References** (same object?) | `boolean` | Almost never with Strings |
| `a.equals(b)` | Content, case-sensitive | `boolean` | **The default choice** |
| `a.equalsIgnoreCase(b)` | Content, ignoring case | `boolean` | User input, commands |
| `a.compareTo(b)` | Dictionary order (by `char` values) | `int` (<0, 0, >0) | Sorting |
| `a.compareToIgnoreCase(b)` | Dictionary order, ignoring case | `int` | Case-insensitive sorting |
| `Objects.equals(a, b)` | Content, and null-safe | `boolean` | When either side may be `null` |
| `a.contentEquals(sb)` | Content against any `CharSequence` | `boolean` | Comparing with a `StringBuilder` |

How `compareTo` works: it compares character by character. At the first difference, it returns `charA - charB`. If one String is a prefix of the other, it returns the **difference in length**.

**Null-safe habit:** write `"yes".equals(input)`, not `input.equals("yes")`. The first never throws.

```java
import java.util.Objects;

public class ComparingStrings {

    public static void main(String[] args) {
        String a = "Apple";
        String b = new String("Apple");
        String c = "apple";
        String none = null;

        System.out.println(a == b);                    // false  (different objects)
        System.out.println(a.equals(b));               // true   (same characters)
        System.out.println(a.equals(c));               // false  (case matters)
        System.out.println(a.equalsIgnoreCase(c));     // true

        System.out.println("apple".compareTo("banana"));   // -1  ('a' - 'b')
        System.out.println("b".compareTo("a"));            // 1
        System.out.println("app".compareTo("apple"));      // -2  (shorter: length difference)
        System.out.println("Apple".compareTo("apple"));    // -32 ('A' is 65, 'a' is 97)
        System.out.println("Apple".compareToIgnoreCase("apple"));   // 0

        System.out.println("yes".equals(none));        // false (safe: literal first)
        System.out.println(Objects.equals(none, null));    // true (null-safe helper)
        // none.equals("yes") would throw NullPointerException
    }
}
```

---

### 6. Characters, indexes and length

- Indexes start at **0**. The last index is `length() - 1`.
- `length()` is a **method** on String. Arrays use the `length` **field**, and collections use `size()`. Interviewers like to ask about this.
- A bad index throws `StringIndexOutOfBoundsException`.
- A `char` is an unsigned **16-bit number** (0–65535), so you can do arithmetic with it:
  - `'a' + 1` is `98` (an `int`), while `(char) ('a' + 1)` is `'b'`.
  - `c - '0'` turns the digit character `'7'` into the number `7`.
  - `c - 'a'` gives a letter's position (0–25). This is the basis of the `int[26]` counting trick.
- `Character` helpers include `isLetter`, `isDigit`, `isLetterOrDigit`, `isWhitespace`, `isUpperCase`, `toUpperCase` and `toLowerCase`.

**Useful ASCII values:** `'0'` = 48, `'A'` = 65, `'a'` = 97, and space = 32. Lower case minus upper case = 32.

```java
public class CharsAndIndexes {

    public static void main(String[] args) {
        String word = "code";
        System.out.println(word.length());                   // 4
        System.out.println(word.charAt(0));                  // c  (first)
        System.out.println(word.charAt(word.length() - 1));  // e  (last)
        // word.charAt(4) throws StringIndexOutOfBoundsException

        // A char is a 16-bit number
        char c = 'a';
        System.out.println((int) c);                 // 97
        System.out.println(c + 1);                   // 98  (char + int = int)
        System.out.println((char) (c + 1));          // b
        System.out.println('7' - '0');               // 7   (digit char → its value)
        System.out.println('d' - 'a');               // 3   (position in the alphabet)

        // Character helpers
        System.out.println(Character.isLetter('x'));         // true
        System.out.println(Character.isDigit('5'));          // true
        System.out.println(Character.isWhitespace(' '));     // true
        System.out.println(Character.toUpperCase('q'));      // Q

        // Three ways to visit every character
        for (int i = 0; i < word.length(); i++) {
            System.out.print(word.charAt(i) + " ");          // c o d e
        }
        System.out.println();
        for (char ch : word.toCharArray()) {
            System.out.print(ch + "-");                      // c-o-d-e-
        }
        System.out.println();
        word.chars().forEach(code -> System.out.print(code + " "));   // 99 111 100 101
        System.out.println();
    }
}
```

---

### 7. Essential String methods

| Category | Method | Example → result |
|---|---|---|
| **Inspect** | `length()` | `"Hello".length()` → `5` |
| | `isEmpty()` | `"".isEmpty()` → `true` |
| | `isBlank()` (11+) | `"  ".isBlank()` → `true` |
| | `charAt(i)` | `"Hello".charAt(1)` → `'e'` |
| **Search** | `indexOf(x)` / `indexOf(x, from)` | `"Hello".indexOf('l')` → `2` (or `-1` if not found) |
| | `lastIndexOf(x)` | `"Hello".lastIndexOf('l')` → `3` |
| | `contains(s)` | `"Hello".contains("ell")` → `true` |
| | `startsWith(s)` / `endsWith(s)` | `"Hello".startsWith("He")` → `true` |
| **Extract** | `substring(begin)` | `"Hello".substring(2)` → `"llo"` |
| | `substring(begin, end)` | `"Hello".substring(1, 3)` → `"el"` (*end is excluded*) |
| **Transform** | `toUpperCase()` / `toLowerCase()` | `"Hi".toUpperCase()` → `"HI"` |
| | `trim()` | Removes characters ≤ space from both ends |
| | `strip()` / `stripLeading()` / `stripTrailing()` (11+) | Unicode-aware trimming |
| | `replace(old, new)` | Replaces **every** match, literally (no regex) |
| | `replaceAll(regex, s)` / `replaceFirst(regex, s)` | Regex-based replacing |
| | `repeat(n)` (11+) | `"ab".repeat(3)` → `"ababab"` |
| | `concat(s)` | `"Hi".concat("!")` → `"Hi!"` |
| **Split / join** | `split(regex)` / `split(regex, limit)` | `"a,b".split(",")` → `[a, b]` |
| | `String.join(sep, parts…)` | `String.join("-", "a", "b")` → `"a-b"` |
| | `lines()` (11+) | A stream of the lines |
| **Convert** | `toCharArray()` | `"abc"` → `[a, b, c]` |
| | `chars()` / `codePoints()` | Streams of the character values |
| | `getBytes(charset)` | The encoded bytes |
| | `String.valueOf(x)` | Any value → String |
| **Check** | `matches(regex)` | Does the **whole** String match? |
| | `equals`, `equalsIgnoreCase`, `compareTo` | See section 5 |

Things to remember:

- `substring(begin, end)` is **half-open**: it includes `begin` and excludes `end`, so its length is `end - begin`.
- `split` drops **trailing** empty strings. Pass `-1` as the limit to keep them.
- `split` takes a **regex**, so `.`, `|`, `$`, `*`, `+`, `?` and `\` must be escaped (section 11).
- `trim()` removes every char up to U+0020 (spaces, tabs, newlines, ASCII control characters). `strip()` uses `Character.isWhitespace`, so it also removes Unicode spaces.

```java
import java.util.Arrays;

public class StringMethodsTour {

    public static void main(String[] args) {
        String s = "  Hello, World  ";
        String t = s.trim();                                  // "Hello, World"

        // Inspect
        System.out.println(t.length());                       // 12
        System.out.println("".isEmpty());                     // true
        System.out.println("   ".isBlank());                  // true  (Java 11+)

        // Search
        System.out.println(t.indexOf('o'));                   // 4
        System.out.println(t.lastIndexOf('o'));               // 8
        System.out.println(t.indexOf("xyz"));                 // -1  (not found)
        System.out.println(t.contains("World"));              // true
        System.out.println(t.startsWith("Hell"));             // true
        System.out.println(t.endsWith("!"));                  // false

        // Extract: substring(begin, end) includes begin, excludes end
        System.out.println(t.substring(7));                   // World
        System.out.println(t.substring(0, 5));                // Hello

        // Transform (each returns a NEW String)
        System.out.println(t.toUpperCase());                  // HELLO, WORLD
        System.out.println(t.toLowerCase());                  // hello, world
        System.out.println("[" + s.strip() + "]");            // [Hello, World]
        System.out.println("[" + s.stripLeading() + "]");     // [Hello, World  ]
        System.out.println(t.replace('l', 'L'));              // HeLLo, WorLd
        System.out.println(t.replace("World", "Java"));       // Hello, Java
        System.out.println("ab".repeat(3));                   // ababab
        System.out.println("Hi".concat(" there"));            // Hi there

        // Split and join
        String[] parts = "red,green,blue".split(",");
        System.out.println(Arrays.toString(parts));           // [red, green, blue]
        System.out.println(String.join(" | ", parts));        // red | green | blue
        System.out.println("a,b,,c,,".split(",").length);     // 4  (trailing empties dropped)
        System.out.println("a,b,,c,,".split(",", -1).length); // 6  (limit -1 keeps them)
        System.out.println("line1\nline2".lines().count());   // 2

        // Convert
        System.out.println(Arrays.toString("abc".toCharArray()));   // [a, b, c]
        System.out.println(String.valueOf(3.5));              // 3.5
    }
}
```

---

### 8. Building Strings: `+`, `StringBuilder`, `StringBuffer`, joining

**The `+` operator.** Evaluation goes **left to right**. Once one side is a String, the rest of the expression is joined as text:

- `"Total: " + 1 + 2` gives `"Total: 12"`.
- `"Total: " + (1 + 2)` gives `"Total: 3"`.
- `1 + 2 + " items"` gives `"3 items"`.

**The `+` operator inside a loop is O(n²).** Each `+=` creates a whole new String and copies every character built so far: 1 + 2 + … + n copies. Since Java 9 the compiler handles a *single* `a + b + c` expression efficiently (with `invokedynamic`), but it can't fix a loop. Use **one `StringBuilder`** instead.

| | `String` | `StringBuilder` | `StringBuffer` |
|---|---|---|---|
| Mutable? | No | **Yes** | Yes |
| Thread-safe? | Yes (because immutable) | No | Yes (`synchronized` methods) |
| Speed for building | Slow in loops | **Fastest** | Slower (locking) |
| Use when | Text doesn't change | Building or changing text (the default) | Several threads share one buffer (rare) |

Main `StringBuilder` methods: `append`, `insert`, `delete(start, end)`, `deleteCharAt`, `replace(start, end, s)`, `reverse`, `setCharAt`, `setLength`, `charAt`, `length`, `capacity` and `toString`. Most return **`this`**, so you can chain them.

**Capacity:** the default is 16. When it fills up, the builder grows to about twice the size. If you know the final size, pre-size it with `new StringBuilder(n)`.

**Joining helpers:** `String.join(sep, …)`, `StringJoiner(sep, prefix, suffix)` and `Collectors.joining(sep)` for streams.

```java
import java.util.List;
import java.util.StringJoiner;
import java.util.stream.Collectors;

public class BuildingStrings {

    public static void main(String[] args) {
        // + works with any type: once one side is a String, the rest becomes text
        System.out.println("Total: " + 1 + 2);     // Total: 12
        System.out.println("Total: " + (1 + 2));   // Total: 3
        System.out.println(1 + 2 + " items");      // 3 items

        // Building in a loop: use ONE StringBuilder
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 5; i++) {
            sb.append(i).append(' ');
        }
        System.out.println(sb.toString().trim());  // 1 2 3 4 5

        // Common StringBuilder operations (they change the builder itself)
        StringBuilder w = new StringBuilder("Java");
        w.append("!");                  // Java!
        w.insert(0, "I love ");         // I love Java!
        w.replace(2, 6, "like");        // I like Java!
        w.deleteCharAt(w.length() - 1); // I like Java
        w.delete(0, 7);                 // Java
        w.reverse();                    // avaJ
        System.out.println(w);          // avaJ
        System.out.println(w.length()); // 4

        // Joining many values
        StringJoiner joiner = new StringJoiner(", ", "[", "]");
        joiner.add("a").add("b").add("c");
        System.out.println(joiner);                                   // [a, b, c]
        System.out.println(String.join("-", "2026", "10", "16"));     // 2026-10-16
        List<String> names = List.of("Ann", "Bob", "Cy");
        System.out.println(names.stream().collect(Collectors.joining("/")));   // Ann/Bob/Cy
    }
}
```

---

### 9. Conversions

| From → To | How | Watch out |
|---|---|---|
| String → `int` | `Integer.parseInt(s)` | Throws `NumberFormatException` on bad input |
| String → `Integer` | `Integer.valueOf(s)` | Returns an object (cached for −128..127) |
| String → `double` / `boolean` | `Double.parseDouble`, `Boolean.parseBoolean` | `parseBoolean` is `true` only for "true", in any case |
| Number → String | `String.valueOf(n)`, `Integer.toString(n)`, `n + ""` | `valueOf` is the clearest |
| `char` → String | `String.valueOf(c)`, `Character.toString(c)` | |
| String → `char[]` | `s.toCharArray()` | It is a copy |
| `char[]` → String | `new String(arr)`, `String.valueOf(arr)` | **Not** `arr.toString()`, which prints `[C@1b6d…` |
| String → List | `Arrays.asList(s.split(" "))` / `List.of(...)` | |
| List → String | `String.join(sep, list)` | |

```java
import java.util.Arrays;
import java.util.List;

public class Conversions {

    public static void main(String[] args) {
        // String → number
        int n = Integer.parseInt("123");            // primitive int
        Integer boxed = Integer.valueOf("123");     // Integer object
        double d = Double.parseDouble("3.14");
        boolean flag = Boolean.parseBoolean("TRUE");   // case-insensitive "true"
        System.out.println(n + 1);                  // 124
        System.out.println(boxed + d);              // 126.14
        System.out.println(flag);                   // true

        try {
            Integer.parseInt("12a");
        } catch (NumberFormatException e) {
            System.out.println("Not a number: " + e.getMessage());   // Not a number: For input string: "12a"
        }

        // number → String
        System.out.println(String.valueOf(7) + Integer.toString(8) + (9 + ""));   // 789

        // char ↔ String
        char c = "hey".charAt(0);
        String fromChar = String.valueOf(c);        // or Character.toString(c)
        System.out.println(fromChar + c);           // hh

        // String ↔ char[]
        char[] arr = "dog".toCharArray();
        Arrays.sort(arr);
        System.out.println(new String(arr));        // dgo
        System.out.println(String.valueOf(arr));    // dgo
        System.out.println(arr.toString().startsWith("[C@"));   // true  (NOT the text!)

        // String ↔ List
        List<String> list = Arrays.asList("x y z".split(" "));
        System.out.println(list);                   // [x, y, z]
        System.out.println(String.join("", list));  // xyz
    }
}
```

---

### 10. Formatting and text blocks

**Format specifiers** for `String.format`, `formatted()` (15+) and `printf`:

| Specifier | Meaning | Example → result |
|---|---|---|
| `%s` | String (any object) | `"%s", "hi"` → `hi` |
| `%d` | Integer | `"%d", 7` → `7` |
| `%.2f` | Decimal with 2 places (rounds) | `82.456` → `82.46` |
| `%5d` / `%-6s` | Width 5, right-aligned / width 6, left-aligned | `[    7]` / `[Asha  ]` |
| `%05d` | Pad with zeros | `[00007]` |
| `%x` `%c` `%b` | Hex, char, boolean | `ff A true` |
| `%n` / `%%` | Platform newline / a literal `%` | |

**Text blocks** (Java 15+) are written with `"""`. The content starts on the line after the opening `"""`. Common leading spaces are removed, and the position of the closing `"""` decides the left margin. A `\` at the end of a line joins it with the next line. `\s` keeps a trailing space.

```java
public class FormattingDemo {

    public static void main(String[] args) {
        String name = "Asha";
        int score = 7;
        double avg = 82.456;

        System.out.println(String.format("%s scored %d", name, score));   // Asha scored 7
        System.out.println(String.format("Average: %.2f", avg));          // Average: 82.46
        System.out.println(String.format("[%5d]", score));                // [    7]
        System.out.println(String.format("[%-6s]", name));                // [Asha  ]
        System.out.println(String.format("[%05d]", score));               // [00007]
        System.out.println(String.format("%x %c %b %%", 255, 'A', true)); // ff A true %
        System.out.println("%s is %d".formatted("Ravi", 30));             // Ravi is 30 (Java 15+)
        System.out.printf("%-6s|%6.1f%n", "pi", Math.PI);                 // pi    |   3.1

        // Text block: the closing """ sets the left margin
        String json = """
                {
                  "name": "Asha",
                  "score": 7
                }
                """;
        System.out.print(json);
        // {
        //   "name": "Asha",
        //   "score": 7
        // }

        String oneLine = """
                one \
                line""";
        System.out.println(oneLine);                                      // one line
    }
}
```

---

### 11. Regex with Strings

| Pattern | Meaning |
|---|---|
| `\\d` / `\\w` / `\\s` | Digit / word character `[A-Za-z0-9_]` / whitespace |
| `+` `*` `?` `{n,m}` | One or more / zero or more / optional / between n and m |
| `[abc]` / `[^abc]` / `[a-z]` | Any of / none of / a range |
| `.` | **Any character except a line break** (unless `(?s)`). Write `\\.` for a literal dot |
| `^` `$` | Start / end |

In Java source you write `\\d`, because `\` must itself be escaped inside a string literal.

- `matches()` must match the **whole** String.
- `split(".")` returns an **empty array**: every character is a separator, and the trailing empties are dropped.
- `replace` is literal and `replaceAll` uses regex. To find every match, use `Pattern` and `Matcher.find()`.
- Calling `Pattern.compile` **once** and reusing it is faster than calling `s.matches()` in a loop.

```java
import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegexBasics {

    public static void main(String[] args) {
        // matches() must match the WHOLE string
        System.out.println("12345".matches("\\d+"));          // true
        System.out.println("123a".matches("\\d+"));           // false
        System.out.println("abc@x.com".matches("[\\w.]+@[\\w.]+\\.\\w+"));   // true

        // split on one or more spaces
        System.out.println(Arrays.toString("a   b  c".split("\\s+")));     // [a, b, c]

        // '.' is special in regex: escape it
        System.out.println("1.2.3".split(".").length);                     // 0  (surprise!)
        System.out.println(Arrays.toString("1.2.3".split("\\.")));         // [1, 2, 3]

        // replaceAll uses regex, replace does not
        System.out.println("A1-b2_C3!".replaceAll("[^A-Za-z]", ""));       // AbC
        System.out.println("a.b.c".replace(".", "/"));                     // a/b/c
        System.out.println("hello   world".replaceAll("\\s+", " "));       // hello world

        // Pattern + Matcher to find every match
        Matcher m = Pattern.compile("\\d+").matcher("Order 12 has 3 items for 450");
        StringBuilder found = new StringBuilder();
        while (m.find()) {
            found.append(m.group()).append(' ');
        }
        System.out.println(found.toString().trim());          // 12 3 450
    }
}
```

---

### 12. Unicode, encoding and internals

**A `char` is not always one "character".** Java uses **UTF-16**:

- Most characters, including English, accented letters and Hindi, take **one** `char`.
- Emoji and some rare scripts are **supplementary** characters that take **two** `char`s, called a *surrogate pair*.
- So `"hi😀".length()` is **4**, while `codePointCount` is **3**.
- To work with real characters, use `codePoints()`, `codePointAt()` and `Character.toChars()`.

**Bytes ≠ chars.** `getBytes(UTF_8)` gives 1 byte for ASCII, 2 for `é`, 3 for most Indian scripts, and 4 for emoji. **Always pass a charset.** Without one, the platform default is used. That default was UTF-8 only from Java 18 onward.

**Internals** (useful for interviews):

| Fact | Details |
|---|---|
| Storage | Java 9+ uses **Compact Strings**: a `byte[] value` plus a `coder` flag. LATIN-1 text uses 1 byte per char, and other text uses UTF-16 (2 bytes). Before Java 9 it was `char[]`. |
| `final` | Both the class and its `value` field are final. |
| `hashCode()` | `s[0]*31^(n-1) + … + s[n-1]`, computed once and **cached**. `"Aa"` and `"BB"` have the same hash. |
| `switch` on String (Java 7+) | Compiled to a `switch` on `hashCode()`, then `equals()` to confirm. |
| String pool | It is a hash table in the heap. Its size can be tuned with `-XX:StringTableSize`. |
| String Deduplication (G1 only before JDK 18) | `-XX:+UseStringDeduplication` lets equal Strings share one `byte[]` (this is not the pool). |
| `substring` | Since Java 7u6 it copies the characters. Old versions shared the array, which could leak memory. |

```java
import java.nio.charset.StandardCharsets;

public class UnicodeDemo {

    public static void main(String[] args) {
        String plain = "cafe";
        String accent = "café";
        String emoji = "hi😀";

        System.out.println(plain.length());                                   // 4
        System.out.println(accent.length());                                  // 4
        System.out.println(emoji.length());                                   // 4  (the emoji uses 2 chars)
        System.out.println(emoji.codePointCount(0, emoji.length()));          // 3  (real characters)

        System.out.println(plain.getBytes(StandardCharsets.UTF_8).length);    // 4
        System.out.println(accent.getBytes(StandardCharsets.UTF_8).length);   // 5  (é = 2 bytes)
        System.out.println(emoji.getBytes(StandardCharsets.UTF_8).length);    // 6  (😀 = 4 bytes)

        System.out.println(Character.isSurrogate(emoji.charAt(2)));          // true
        System.out.println(Integer.toHexString(emoji.codePointAt(2)));        // 1f600

        StringBuilder out = new StringBuilder();
        emoji.codePoints().forEach(cp -> out.append(Character.toChars(cp)).append('|'));
        System.out.println(out);                                              // h|i|😀|

        // hashCode is computed from the characters and cached
        System.out.println("ab".hashCode());                                  // 3105  (97*31 + 98)
        System.out.println("Aa".hashCode() == "BB".hashCode());               // true  (a collision)

        // switch on a String uses hashCode() and then equals()
        String day = "SAT";
        switch (day) {
            case "SAT", "SUN" -> System.out.println("weekend");               // weekend
            default -> System.out.println("weekday");
        }
    }
}
```

---

### 13. Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| `if (a == b)` for content | Works sometimes (pool), fails other times | `a.equals(b)` |
| `input.equals("yes")` when `input` may be null | `NullPointerException` | `"yes".equals(input)` or `Objects.equals` |
| `s.toUpperCase();` without assigning | Nothing changes | `s = s.toUpperCase();` |
| `+=` in a loop | O(n²), slow on big input | `StringBuilder` |
| `charAt(s.length())` | `StringIndexOutOfBoundsException` | Last index is `length() - 1` |
| `arr.length()` / `s.length` | Doesn't compile | Array → `length`, String → `length()` |
| `split(".")` or `split("|")` | Wrong result | `split("\\.")`, `split("\\|")` |
| `charArray.toString()` | Prints `[C@1b6d…` | `new String(arr)` |
| `Integer.parseInt(" 42")` | `NumberFormatException` | `trim()` first |
| `new String("x")` everywhere | Extra objects | Use literals |
| `getBytes()` with no charset | Different results on different machines | `getBytes(StandardCharsets.UTF_8)` |
| `length()` on emoji text | Counts UTF-16 units, not characters | `codePointCount` |
| `substring(1, 3)` expected to include index 3 | Off-by-one | The end is **excluded** |

---

### 14. Interview questions

<details><summary>1. What is a String in Java? Is it a primitive?</summary>

An object of the `final` class `java.lang.String`: an immutable sequence of UTF-16 characters. It is **not** a primitive, but the language gives it special support: literals, `+`, and `switch`.
</details>

<details><summary>2. Why is String immutable?</summary>

The pool can share objects safely, values that were checked (paths, URLs, class names) can't change, it is thread-safe with no locks, the `hashCode` can be cached for fast `HashMap` keys, and class loading is reliable.
</details>

<details><summary>3. What is the String pool? Where is it?</summary>

A table holding one shared copy of each literal (and of each interned String). It moved from PermGen to the main heap in Java 7.
</details>

<details><summary>4. What is the difference between == and equals()?</summary>

`==` compares references (same object?). `equals()` compares the characters. Always use `equals` for content.
</details>

<details><summary>5. How many objects does new String("abc") create?</summary>

One or two: the pooled literal `"abc"` (if it isn't already there) plus one new heap object.
</details>

<details><summary>6. What does intern() do?</summary>

It returns the canonical pooled copy with the same content, adding it to the pool if it is missing. After that, `==` works between interned Strings.
</details>

<details><summary>7. String vs StringBuilder vs StringBuffer?</summary>

`String` is immutable. `StringBuilder` is mutable, not synchronized, and fastest. `StringBuffer` is mutable and synchronized, so it is slower. Use `StringBuilder` unless threads share the buffer.
</details>

<details><summary>8. Why is += in a loop slow?</summary>

Each iteration creates a new String and copies everything built so far, which is O(n²) in total. One `StringBuilder` makes it O(n).
</details>

<details><summary>9. Why is "a" + "b" == "ab" true, but a + "b" == "ab" false (when a is a variable)?</summary>

Literal concatenation is a compile-time constant, so it becomes the pooled `"ab"`. With a non-final variable, the String is built at runtime as a new object. If `a` is `final` and initialised with a literal, the result is `true` again.
</details>

<details><summary>10. Why is char[] preferred over String for passwords?</summary>

A String stays in memory (and possibly the pool) until garbage collection, and it can't be wiped. A `char[]` can be overwritten with zeros right after use. It is also less likely to be printed in logs by accident.
</details>

<details><summary>11. Can String be extended? Why is it final?</summary>

No. Making it final stops subclasses from breaking immutability or security, and it allows JVM optimisations.
</details>

<details><summary>12. How does compareTo work?</summary>

It returns the difference of the first pair of characters that differ. If one String is a prefix of the other, it returns the difference in length. The result is 0 when the Strings are equal.
</details>

<details><summary>13. What are Compact Strings?</summary>

Since Java 9, Strings store a `byte[]` plus a coder. LATIN-1 text uses 1 byte per character, which halves the character storage (the object header and fields stay the same, so "hello" goes from 56 to 48 bytes).
</details>

<details><summary>14. Why does "hi😀".length() return 4?</summary>

`length()` counts UTF-16 code units. The emoji is a surrogate pair (2 units). `codePointCount` gives 3.
</details>

<details><summary>15. How does switch work with Strings?</summary>

The compiler switches on `hashCode()`, then calls `equals()` to confirm and handle collisions. A `null` selector throws `NullPointerException`.
</details>

---

### 15. Practice

1. **Easy:** count the vowels in `"Programming in Java"` → `6`.
2. **Predict the output:**
   ```java
   String x = "Java";
   String y = x;
   x = x + "Script";
   String z = "Java";
   System.out.println(y + " " + (y == z) + " " + x.length());
   ```
3. **Medium:** are two Strings anagrams? `("listen", "silent")` → `true`, `("rat", "car")` → `false`.
4. **Medium:** capitalise each word: `"  hello   java WORLD "` → `"Hello Java World"`.
5. **Medium:** letter frequency: `"banana"` → `"a3b1n2"`.
6. **Hard:** run-length compression: `"aaabbc"` → `"a3b2c1"`.

<details><summary>Solutions</summary>

**2.** `Java true 10`. `y` still points to the original `"Java"`, which is the same pooled object as `z`. `x` points to a new `"JavaScript"` with 10 characters.

**Key ideas:** 1. Use `"aeiou".indexOf(c) >= 0`. 3. Count with `int[26]`: add for one String and subtract for the other, then check that every count is zero. This is O(n). 4. Use `split("\\s+")`, upper-case the first letter, lower-case the rest, and join with a `StringBuilder`. 5. Use `counts[c - 'a']++`. 6. Walk each run of the same character and append the character and its count.

```java
import java.util.Arrays;

public class Solutions {

    // 1. Count vowels (case-insensitive)
    static int countVowels(String s) {
        int count = 0;
        for (char c : s.toLowerCase().toCharArray()) {
            if ("aeiou".indexOf(c) >= 0) {
                count++;
            }
        }
        return count;
    }

    // 3. Anagram check: same letters, same counts
    static boolean isAnagram(String a, String b) {
        if (a.length() != b.length()) {
            return false;
        }
        int[] counts = new int[26];
        for (int i = 0; i < a.length(); i++) {
            counts[a.charAt(i) - 'a']++;
            counts[b.charAt(i) - 'a']--;
        }
        for (int c : counts) {
            if (c != 0) {
                return false;
            }
        }
        return true;
    }

    // 4. Capitalize the first letter of every word
    static String capitalizeWords(String sentence) {
        StringBuilder sb = new StringBuilder();
        for (String word : sentence.trim().split("\\s+")) {
            if (sb.length() > 0) {
                sb.append(' ');
            }
            sb.append(Character.toUpperCase(word.charAt(0))).append(word.substring(1).toLowerCase());
        }
        return sb.toString();
    }

    // 5. Character frequency for lowercase letters
    static String frequency(String s) {
        int[] counts = new int[26];
        for (char c : s.toCharArray()) {
            if (c >= 'a' && c <= 'z') {
                counts[c - 'a']++;
            }
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 26; i++) {
            if (counts[i] > 0) {
                sb.append((char) ('a' + i)).append(counts[i]);
            }
        }
        return sb.toString();
    }

    // 6. Run-length compression: "aaabbc" → "a3b2c1"
    static String compress(String s) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        while (i < s.length()) {
            char c = s.charAt(i);
            int run = 0;
            while (i < s.length() && s.charAt(i) == c) {
                i++;
                run++;
            }
            sb.append(c).append(run);
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(countVowels("Programming in Java"));   // 6
        System.out.println(isAnagram("listen", "silent"));        // true
        System.out.println(isAnagram("rat", "car"));              // false
        System.out.println(capitalizeWords("  hello   java WORLD "));   // Hello Java World
        System.out.println(frequency("banana"));                  // a3b1n2
        System.out.println(compress("aaabbc"));                   // a3b2c1
        System.out.println(compress(""));                         // (empty line)

        // 2. Predict the output
        String x = "Java";
        String y = x;
        x = x + "Script";
        String z = "Java";
        System.out.println(y + " " + (y == z) + " " + x.length());   // Java true 10
        System.out.println(Arrays.toString("a-b".split("-")));      // [a, b]
    }
}
```
</details>

---

### 16. Revision

**Cheat sheet**

```
WHAT       String = immutable object, sequence of UTF-16 chars, final class, java.lang
CREATE     "lit" (pool) · new String("x") (new heap object) · valueOf · new String(char[])
COMPARE    equals (content) · == (reference) · equalsIgnoreCase · compareTo (order) · Objects.equals (null-safe)
POOL       literals shared · new → not pooled · intern() → pooled · "a"+"b" compile-time constant
IMMUTABLE  methods return NEW strings → reassign: s = s.trim()
INDEX      0 .. length()-1 · charAt · substring(begin, end) end EXCLUDED
CHAR MATH  c - '0' → digit · c - 'a' → 0..25 · (char)(c + 1) · 'a' = 97, 'A' = 65, '0' = 48
BUILD      StringBuilder in loops · StringBuffer only if shared by threads · String.join / StringJoiner
CONVERT    parseInt / valueOf · String.valueOf(x) · toCharArray / new String(arr) · NEVER arr.toString()
REGEX      split/replaceAll/matches take regex → escape . | $ * + ? · split drops trailing ""
UNICODE    emoji = 2 chars · codePoints() · getBytes(UTF_8) · Java 9 compact strings (byte[] + coder)
```

**Rapid fire**

| Question | Answer |
|---|---|
| Does `String` need an import? | No, it is in `java.lang` |
| `"" == null`? | `false`. Empty is an object |
| Last index of `s`? | `s.length() - 1` |
| `"abc".substring(1, 2)`? | `"b"` |
| `"a,b,,".split(",").length`? | `2` |
| `'a' + 1`? | `98` (an int) |
| Which builder is thread-safe? | `StringBuffer` |
| Is a String's `hashCode` cached? | Yes |
| `"Apple".compareTo("apple")`? | `-32` |
| `"1.2".split(".").length`? | `0` |

**Self-check: can you explain these without notes?**

- [ ] What a String is, and how it differs from `char` and from `null`
- [ ] Literal vs `new`, the String pool, and `intern()`
- [ ] Why String is immutable (5 reasons)
- [ ] `==` vs `equals` vs `compareTo`, and the null-safe style
- [ ] `char` arithmetic and the `int[26]` counting trick
- [ ] The main methods by category, plus `substring` and `split` gotchas
- [ ] String vs `StringBuilder` vs `StringBuffer`, and why `+=` in a loop is slow
- [ ] Conversions, including the `toString()` trap with `char[]`
- [ ] Format specifiers and text blocks
- [ ] Regex escaping with `split` and `replaceAll`
- [ ] UTF-16, surrogate pairs, Compact Strings, and the cached `hashCode`

---

### 17. Playground and live editor

The course page `lessons/01-strings.html` mirrors this lesson. It has these interactive parts:

- **String Pool visualizer:** pick a line of code (literal, `new`, `intern()`, concatenation, a `final` constant) and watch where each variable points. It also shows the `==` and `equals` results.
- **Method explorer:** type any text, choose a method (`length`, `charAt`, `indexOf`, `substring`, `split`, `replace`, `repeat`…), and see the result as Java would return it.
- **Character inspector:** type text, including emoji, and see each `char`, its number, and its code point. It compares `length()`, the code-point count, and the UTF-8 byte count.
- **Live editors:** every code block can be edited. Each has a **Suggestions on/off** switch (it applies to every editor and is remembered), Reset, Copy, an "● edited" marker, and a status bar.
  - **What is suggested:** methods after a dot, based on the type (`s.`, `sb.`, `chars.`, `System.out.`, `Character.`, `Arrays.`, `Math.`, `Integer.`, `Objects.`, `String.`), your own variables and methods, keywords and class names. Partial matches work, such as `tCA` → `toCharArray`.
  - **Snippets:** `sout`, `psvm`, `fori`, `forr`, `foreach`, `swap`, `ifnull`, `sb`, `tca`.
  - **Keys:** `Ctrl`+`Space` opens suggestions, `↑`/`↓` choose, `Enter`/`Tab` accept, `Esc` closes, `Ctrl`+`/` comments lines, and `Tab`/`Shift`+`Tab` change the indent.
- **Playground tasks** (drafts are saved in the browser):

| Task | Expected output |
|---|---|
| Count vowels | `6` |
| Anagram | `true` · `false` |
| Capitalize words | `Hello Java World` |
| Letter frequency | `a3b1n2` |
| Compress | `a3b2c1` |
| Pool predictions | `true` · `false` · `true` · `false` |
| Blank | — |

The page can't compile Java. To run your code, copy it and run `java Playground.java` (JDK 11+). The editor loads CodeMirror 5 from a CDN, so it needs internet the first time.

---

### 18. Your feedback

Rate each from 1 to 5 and add comments: visual explanation, depth, code quality, interview coverage, and overall usefulness. Then tell me which topic should come next. Suggested order: String problems (reversal, palindrome, anagram, frequency) → `StringBuilder` deep dive → regex → Unicode.


---

## Lesson 02 — String Concepts Deep Dive (theory first)

*This lesson is about **concepts**: how Strings are stored, how the String Constant Pool (SCP) works, what `new String()` really does, `==` vs `equals()`, StringBuilder and StringBuffer internals, and every String method. Code is kept small. Every program was run on JDK 25 (Temurin 25.0.4.1) and its output is in the comments.*

### Table of Contents

1. The JVM memory map: where Strings live
2. Anatomy of a String object
3. The String Constant Pool (SCP) in depth
4. What `new String("x")` really does, and "how many objects?"
5. `==` vs `equals()` vs `hashCode()` vs `compareTo()`
6. Immutability: how it is built
7. StringBuilder and StringBuffer internals
8. How `+` concatenation works
9. Complete method reference
10. `null`, the `CharSequence` family, and Strings elsewhere
11. Tricky outputs
12. 25 more interview questions
13. Concept map (revision)

---

### 1. The JVM memory map: where Strings live

| Area | What it holds for Strings |
|---|---|
| **Stack** (one per thread) | Local **variables**. A String variable holds only a **reference** (an address), never the characters. |
| **Heap** | Every String **object**, and the `byte[]` that holds its characters. |
| **String Constant Pool (SCP)** | A hash table (HotSpot's `StringTable`, in native memory) that points to one canonical String per distinct content. Since Java 7 those String objects live in the heap. |
| **Class-file constant pool** | Inside each `.class` file. Literals are stored here as `CONSTANT_String` entries. These are only descriptions, not objects. |
| **Runtime constant pool** | Per-class, in Metaspace (Java 8+). It is the loaded form of the class-file constant pool. Its String entries get **resolved** to a pooled object the first time they are used. |

```
 STACK (main thread)          HEAP
 ───────────────────          ─────────────────────────────────────────────────
 s1 ─────────────┐           ┌──────── String Constant Pool (StringTable) ─────┐
 s2 ─────────────┼─────────▶ │  "hello"  ──▶ byte[] {h,e,l,l,o}                 │
                 │           └──────────────────────────▲────────────────────────┘
 s3 ─────────────┼─────────▶  String object (from new) ──┘ (shares the same byte[])
                 │
 METASPACE: class metadata + runtime constant pool  (#9 = String "hello")
```

**How a literal becomes an object (lazy resolution):**

1. `javac` writes `"hello"` into the class file's constant pool.
2. When the class loads, the entry is only a symbol. No String exists yet.
3. The first time the `ldc` instruction for that literal runs, the JVM looks for `"hello"` in the StringTable.
4. If it is found, the existing reference is used. If not, a String is created, added to the table and used.
5. Every later use of that literal, in any class, gets the **same** object.

---

### 2. Anatomy of a String object

Fields of `java.lang.String` in Java 9+ (JDK 25):

| Field | Type | Purpose |
|---|---|---|
| `value` | `private final byte[]` | The characters, as bytes |
| `coder` | `private final byte` | `0` = **LATIN1** (1 byte per char), `1` = **UTF16** (2 bytes per char) |
| `hash` | `private int` | Cached `hashCode()`. It is `0` until first computed. |
| `hashIsZero` | `private boolean` (Java 13+) | Remembers that the real hash *is* 0, so it is not recomputed |
| `COMPACT_STRINGS` | `static final boolean` | On by default. Turn off with `-XX:-CompactStrings`. |

**Compact Strings (Java 9, JEP 254).** Before Java 9, every String used a `char[]`, so 2 bytes per character. Most text is Latin-1 (English, digits, Western European letters), so Java 9 stores it as 1 byte per character. One non-Latin-1 character (such as `'अ'` or an emoji) makes the whole String use UTF-16. Methods check `coder` and call the matching helper (`StringLatin1` or `StringUTF16`).

**Approximate size of `"hello"`** (64-bit JVM, compressed references):

| Part | Java 8 (`char[]`) | Java 9+ (`byte[]`, LATIN1) |
|---|---|---|
| String object (header + fields, padded) | 24 bytes | 24 bytes |
| Array (16-byte header + data, padded) | 16 + 10 → 32 | 16 + 5 → 24 |
| **Total** | **≈ 56 bytes** | **≈ 48 bytes** |

So even a 5-letter word costs about 48 bytes. This is why the pool and deduplication matter.

**Other internal facts:**

- `final class` and `private final` fields: no subclass, no setter, and the array reference can't be swapped.
- The `byte[]` is **never exposed**. `toCharArray()` and `getBytes()` return **copies**. Constructors that take a `char[]` or `byte[]` **copy** it in.
- `new String(String original)` does **not** copy the characters. It shares `original.value`, because both objects are immutable. Only the String object itself is new.
- Since Java 7u6, `substring()` copies the characters it needs. Before that it shared the parent's array, so a small substring could keep a huge String alive (a memory leak).

---

### 3. The String Constant Pool (SCP) in depth

**What it is:** a hash table (the `StringTable`) of references to canonical Strings, one per distinct content. Its purpose is to **save memory** by sharing repeated text. Sharing is only safe because Strings are immutable.

**What goes into the pool:**

| Goes in automatically | Does NOT go in automatically |
|---|---|
| Every String literal: `"abc"` | `new String("abc")` (the heap object) |
| Compile-time constant expressions: `"a" + "b"`, `"a" + 1`, `FINAL_CONST + "x"` | Runtime concatenation: `s + "x"` with a non-final `s` |
| Text blocks (`"""…"""`) | Results of methods: `substring`, `toUpperCase`, `split`, `replace`, `sb.toString()`… |
| `static final String` constants that are initialised with literals | Text read from a file, `Scanner`, a network or a database |
| Anything you call `intern()` on | |

**History (a common interview question):**

| Version | Where the pool lives | Key point |
|---|---|---|
| Java 6 and earlier | **PermGen** (a fixed-size area) | Interning a lot caused `OutOfMemoryError: PermGen space`. `intern()` **copied** the String into PermGen. |
| Java 7 | Moved to the **main heap** | Pooled Strings can be garbage-collected like other objects. `intern()` stores a **reference to the existing heap object** instead of copying it. |
| Java 8 | Heap (PermGen removed; Metaspace replaces it for class metadata) | The pool stays in the heap. |
| Java 11+ | Heap. The default `StringTableSize` is **65536** buckets (checked on JDK 25). | Since Java 11 the table is concurrent and resizes itself. |

**`intern()` rules:**

- If the pool already has an equal String, `intern()` returns **that** pooled reference.
- Otherwise it adds **this** object's reference to the pool and returns it. So the first object to be interned *becomes* the canonical copy.
- After interning, `a.intern() == b.intern()` is `true` whenever `a.equals(b)`.
- Use it rarely. It costs a hash lookup each time. It is only worth it for many repeated values that live a long time, such as country codes read from a big file.

**Garbage collection and the pool:**

- The pool holds its entries *weakly*. A pooled String that nothing else references can be collected.
- Literals stay alive as long as the class that uses them is loaded.
- **String Deduplication** (`-XX:+UseStringDeduplication`; G1 only before JDK 18, all collectors since) is a different feature. It makes equal Strings share one `byte[]`, but they stay separate String objects, so `==` is still `false`.

**Useful JVM flags:** `-XX:StringTableSize=N` (number of buckets), `-XX:+PrintStringTableStatistics` (print pool statistics on exit).

```java
public class PoolDeepDive {

    public static void main(String[] args) {
        // 1. Literals are shared; new always makes another object
        String lit = "core";
        String obj = new String("core");
        System.out.println(lit == obj);                   // false
        System.out.println(lit == obj.intern());          // true

        // 2. intern() on a String that is NOT in the pool yet:
        //    since Java 7 the pool stores a reference to THIS heap object
        String built = new StringBuilder("uniq").append("Word42").toString();
        System.out.println(built.intern() == built);      // true  (first copy becomes the pooled one)

        // 3. ...but "java" is already pooled by the JDK itself
        String java = new StringBuilder("ja").append("va").toString();
        System.out.println(java.intern() == java);        // false (the pool already had "java")

        // 4. Methods that change nothing may return the SAME object
        String s = "abc";
        System.out.println(s.substring(0) == s);          // true
        System.out.println(s.trim() == s);                // true
        System.out.println(s.toLowerCase() == s);         // true
        System.out.println(s.concat("") == s);            // true
        System.out.println(s.substring(1) == "bc");       // false (new object)

        // 5. Runtime results are never pooled automatically
        String in = "a b".split(" ")[0];
        System.out.println(in == "a");                    // false
        System.out.println(in.equals("a"));               // true
    }
}
```

> Points 3 and 4 are why `==` "sometimes works". Its result depends on JDK internals and optimisations, never on the content. Always use `equals()`.

---

### 4. What `new String("x")` really does, and "how many objects?"

`String s = new String("hi");` compiles to this bytecode (from `javap -c` on JDK 25):

```
 0: new           #7     // class java/lang/String   → allocate an empty String on the heap
 3: dup                                              → keep a copy of the reference
 4: ldc           #9     // String hi                → get the POOLED "hi" (created on first use)
 6: invokespecial #11    // String.<init>(String)    → run the constructor with the pooled "hi"
 9: astore_1                                         → store the new object's reference in s
```

Step by step:

1. `ldc` resolves the literal `"hi"`, creating the pooled object if this is the first time.
2. `new` allocates a **second**, separate String object on the heap (outside the pool).
3. The constructor copies `value`, `coder` and `hash` from the pooled String. The `byte[]` is **shared**, not copied.
4. `s` points to the heap object, so `s == "hi"` is `false` and `s.equals("hi")` is `true`.

**"How many String objects are created?"** (assuming none of these texts are already in the pool):

| Code | String objects | Which ones |
|---|---|---|
| `String s = "java";` | **1** | `"java"` in the pool |
| `String a = "x"; String b = "x";` | **1** | Both share the pooled `"x"` |
| `String s = new String("java");` | **2** | Pooled `"java"` + 1 heap object |
| `new String("x"); new String("x");` | **3** | 1 pooled + 2 heap objects |
| `String s = "a" + "b";` | **1** | Only `"ab"`. The compiler folds it, so `"a"` and `"b"` never exist. |
| `String a = "a"; String b = a + "b";` | **2** | `"a"` pooled + `"ab"` on the heap (not pooled). Since Java 9, `"b"` sits inside the invokedynamic recipe (`"\u0001b"`) and is not pooled; up to Java 8 it was pooled, making 3 |
| `String s = new String("a") + new String("b");` | **5** | `"a"`, `"b"` pooled + 2 heap copies + `"ab"` on the heap (not pooled) |

Before Java 9, the last two rows also created a temporary `StringBuilder` (that is an object, but not a String). Interviewers usually accept the answer if you explain *which* objects exist and *where* they live.

**When should you use `new String(...)`?** Almost never with a literal. It is useful with `char[]`, `byte[]` plus a charset, or a `StringBuilder`, which is how you *build* text from other data.

---

### 5. `==` vs `equals()` vs `hashCode()` vs `compareTo()`

| | `==` | `equals()` | `hashCode()` | `compareTo()` |
|---|---|---|---|---|
| Compares | References: the **same object**? | Content: the **same characters**? | (Not a comparison) gives an `int` built from the content | **Order** of the content |
| Returns | `boolean` | `boolean` | `int` | `int`: <0, 0 or >0 |
| Where it comes from | Operator | Overrides `Object.equals` | Overrides `Object.hashCode` | Implements `Comparable<String>` |
| `null` | `s == null` is safe | `s.equals(x)` throws if `s` is null | Throws if `s` is null | Throws if either side is null |
| Use for | null checks, identity | **Content equality** | `HashMap`/`HashSet` buckets | Sorting |

**How `String.equals()` works** (JDK 25 source, simplified):

```java
public boolean equals(Object anObject) {
    if (this == anObject) return true;                 // 1. same object → equal (fast path)
    return (anObject instanceof String aString)        // 2. must be a String (a StringBuilder is NOT)
        && (!COMPACT_STRINGS || coder == aString.coder) // 3. different encodings can't be equal
        && StringLatin1.equals(value, aString.value);  // 4. same length, then byte by byte
}
```

**How `hashCode()` works:**

- Formula: `s[0]*31^(n-1) + s[1]*31^(n-2) + … + s[n-1]`. `""` gives `0`.
- **Why 31?** It is an odd prime, so hashes spread well. `31 * i` can be computed as `(i << 5) - i`.
- It is **computed once and cached** in the `hash` field. This is safe only because the String can't change.
- **Collisions exist:** `"Aa"` and `"BB"` both give `2112`.

**The equals/hashCode contract** (asked in almost every interview):

1. If `a.equals(b)`, then `a.hashCode() == b.hashCode()` **must** be true.
2. Equal hash codes do **not** mean the objects are equal (collisions).
3. A `HashMap` first finds the bucket by `hashCode`, then checks each entry with `equals`. If you override one of them, override both.

**When `==` happens to give `true`, and when it fails:**

| `==` is `true` (same object) | `==` is `false` (different objects, even with equal content) |
|---|---|
| Two equal literals | `new String(...)` |
| Compile-time constants (`"a" + "b"`, `final` + literal) | Runtime concatenation `s + "x"` |
| Values after `intern()` | `substring`, `split`, `replace`, `toUpperCase` results that changed something |
| Some methods that change nothing return `this` (`substring(0)`, `trim()` on already trimmed text) | Input from a user, file, network or database |

**Other comparison tools:**

- `equalsIgnoreCase`: compares character by character, ignoring case.
- `contentEquals(CharSequence)`: compares with a `StringBuilder`, `StringBuffer` or any `CharSequence`.
- `Objects.equals(a, b)`: null-safe.
- `regionMatches`: compares one part of each String.
- `String.CASE_INSENSITIVE_ORDER`: a ready-made `Comparator` for sorting.
- `"hello".equals(new StringBuilder("hello"))` is `false`, because the argument is not a String.

---

### 6. Immutability: how it is built

**How Java makes String immutable:**

1. The class is `final`, so no subclass can add mutable behaviour.
2. `value` is `private final`: no access from outside, and the reference can't be reassigned.
3. There are no methods that change `value`.
4. Constructors copy the incoming arrays, and getters such as `toCharArray()` return copies, so no outside code ever holds the internal array.
5. Every "modifying" method returns a **new** String. If nothing changed, it may return `this`.

**`final` reference vs immutable object** (a classic confusion):

| | Can the variable point elsewhere? | Can the object change? |
|---|---|---|
| `String s` | Yes | No (String is immutable) |
| `final String s` | No | No |
| `StringBuilder sb` | Yes | Yes |
| `final StringBuilder sb` | No | **Yes**: `sb.append("x")` still works |

**Benefits:** the pool is safe, security (checked paths and URLs can't change), thread safety with no locks, a cached hash for fast `HashMap` keys, and reliable class loading.

**Costs:** every change creates a new object. Heavy editing creates a lot of garbage, which is why `StringBuilder` exists.

**Can reflection break it?** In old Java you could make `value` accessible and edit its bytes, corrupting every user of that pooled String. Since Java 16 the JDK's internals are strongly encapsulated, so `setAccessible(true)` on `String.value` throws `InaccessibleObjectException` unless the module is explicitly opened.

---

### 7. StringBuilder and StringBuffer internals

**Class family:**

```
                 CharSequence (interface)
          ┌────────────┼────────────────────────┐
       String   AbstractStringBuilder (package-private, abstract)
                       ├── StringBuilder  (Java 5,   not synchronized)
                       └── StringBuffer   (Java 1.0, synchronized)
 All three: final classes, Serializable, Comparable (StringBuilder/StringBuffer since Java 11)
```

**How a builder stores text** (`AbstractStringBuilder`):

| Field | Meaning |
|---|---|
| `byte[] value` | The buffer. It is **bigger than the text** so that appends don't copy every time. It is not final. |
| `byte coder` | LATIN1 or UTF16, as in String. It switches to UTF16 when you append a non-Latin-1 char. |
| `int count` | How many characters are used. This is `length()`. |

- **`length()`** is how many characters you have. **`capacity()`** is how many fit before the buffer must grow.
- **Default capacity is 16.** `new StringBuilder("abc")` gets `16 + 3 = 19`. `new StringBuilder(n)` gets exactly `n`.
- **Growth:** when the text doesn't fit, the new capacity is `old * 2 + 2`. If that is still too small, it uses exactly the size needed. Then it copies the old array into the new one.
- Growing costs O(n), but it happens rarely (each time the size roughly doubles), so `append` is **O(1) amortised**.
- `ensureCapacity(n)` grows the buffer ahead of time. `trimToSize()` shrinks it to fit the text. `setLength(n)` cuts the text, or pads it with `'\0'`.
- `toString()` creates a **new String** with a copy of the used characters. Later changes to the builder don't affect that String.

**StringBuffer:**

- Every public method is `synchronized`, so one thread at a time can use it.
- It caches the last `toString()` result (`toStringCache`) and clears the cache on any change.
- **Synchronized does not make a sequence of calls atomic.** `if (sb.length() == 0) sb.append(x);` can still race between the two calls.

**Neither builder overrides `equals()` or `hashCode()`.** Two builders with the same text are **not** equal. Compare them with `compareTo` (Java 11+), `contentEquals`, or `toString().equals(...)`. Don't use a builder as a `HashMap` key.

| | `String` | `StringBuilder` | `StringBuffer` |
|---|---|---|---|
| Since | 1.0 | **5** | 1.0 |
| Mutable | No | Yes | Yes |
| Thread-safe | Yes (immutable) | **No** | Yes (`synchronized`) |
| Speed | Fast to read, slow to modify | **Fastest** | Slower (locks) |
| Storage | `final byte[]`, exact size | Resizable `byte[]` with spare capacity | Same as StringBuilder |
| In the pool? | Literals and interned | Never | Never |
| `equals()` | By content | By **reference** (inherited from Object) | By reference |
| `hashCode()` | By content, cached | Identity-based | Identity-based |
| `+` operator | Yes | No | No |
| `reverse()`, `insert()`, `delete()` | No | Yes | Yes |
| Use when | Text is fixed, keys, constants | Building text in one thread (**the default**) | Several threads share one buffer (rare) |

```java
public class BuilderInternals {

    public static void main(String[] args) {
        StringBuilder a = new StringBuilder();
        System.out.println(a.capacity());                 // 16  (default)
        StringBuilder b = new StringBuilder("abc");
        System.out.println(b.capacity());                 // 19  (16 + length)
        StringBuilder c = new StringBuilder(5);
        System.out.println(c.capacity());                 // 5

        a.append("12345678901234567");                    // 17 chars > 16
        System.out.println(a.length() + " " + a.capacity());   // 17 34  (16 * 2 + 2)
        a.trimToSize();
        System.out.println(a.capacity());                 // 17
        a.setLength(3);
        System.out.println(a + " " + a.length());         // 123 3

        // StringBuilder does NOT override equals()
        StringBuilder x = new StringBuilder("hi");
        StringBuilder y = new StringBuilder("hi");
        System.out.println(x.equals(y));                  // false (Object.equals → ==)
        System.out.println(x.compareTo(y) == 0);          // true  (Java 11+)
        System.out.println("hi".contentEquals(x));        // true
        System.out.println(x.toString().equals(y.toString()));   // true

        // final reference ≠ immutable object
        final StringBuilder fsb = new StringBuilder("A");
        fsb.append("B");                                  // allowed: the object changes
        System.out.println(fsb);                          // AB

        StringBuffer safe = new StringBuffer("x");
        safe.append(1).append('y').append(true);
        System.out.println(safe);                         // x1ytrue
        System.out.println(new StringBuilder("ab").repeat("-", 3));   // ab---  (Java 21+)
    }
}
```

---

### 8. How `+` concatenation works

| Situation | What the compiler or JVM does |
|---|---|
| Only constants: `"a" + "b" + 1` | **Folded at compile time** into the literal `"ab1"`, which is pooled |
| Java 5–8, with variables | Rewritten as `new StringBuilder().append(a).append("b").toString()` |
| **Java 9+**, with variables | One `invokedynamic` call to `StringConcatFactory.makeConcatWithConstants` (JEP 280). At run time the JVM picks a strategy; by default it works out the exact final size and copies once. No temporary StringBuilder. |
| `+=` in a loop (any version) | Each pass still creates a **new** String and copies everything so far, so it is **O(n²)**. Use one StringBuilder. |

From `javap` on JDK 25: `String t = "a" + "b";` became `ldc "ab"`, and `String u = s + "!";` became `invokedynamic makeConcatWithConstants`.

**Rules of `+`:**

- It is evaluated **left to right**. Until one side is a String, `+` is arithmetic: `1 + 2 + "3" + 4 + 5` → `"3345"`.
- `char + char` is an **int**: `'a' + 'b'` → `195`.
- `null + "x"` → `"nullx"`. `+` turns `null` into the text `"null"`.
- `concat()` vs `+`: `concat` accepts only a String, throws `NullPointerException` for `null`, and returns `this` when the argument is empty.

---

### 9. Complete method reference

**`java.lang.String`: every public method, grouped** (the version is shown where it was added after Java 8):

| Group | Methods | Notes |
|---|---|---|
| Length and checks | `length()`, `isEmpty()`, `isBlank()` (11) | `isBlank` is true for whitespace-only text |
| Read characters | `charAt(i)`, `codePointAt(i)`, `codePointBefore(i)`, `codePointCount(b, e)`, `offsetByCodePoints(i, n)`, `getChars(sb, se, dst, db)` | The code-point methods handle emoji correctly |
| Compare | `equals`, `equalsIgnoreCase`, `contentEquals(CharSequence / StringBuffer)`, `compareTo`, `compareToIgnoreCase`, `regionMatches(…)`, `hashCode()` | Field `CASE_INSENSITIVE_ORDER` is a Comparator |
| Search | `indexOf(ch / str [, from])`, `indexOf(ch / str, from, to)` (21), `lastIndexOf(…)`, `contains(cs)`, `startsWith(prefix [, offset])`, `endsWith(suffix)` | They return `-1` when nothing is found |
| Extract | `substring(b)`, `substring(b, e)`, `subSequence(b, e)` | The end is excluded |
| Change case | `toUpperCase()`, `toLowerCase()`, plus versions that take a `Locale` | Use `Locale.ROOT` for machine text (Turkish "i" problem) |
| Whitespace | `trim()`, `strip()` (11), `stripLeading()` (11), `stripTrailing()` (11), `indent(n)` (12), `stripIndent()` (15) | `strip` is Unicode-aware |
| Replace | `replace(char, char)`, `replace(CharSequence, CharSequence)`, `replaceAll(regex, s)`, `replaceFirst(regex, s)` | Only the `replaceAll`/`replaceFirst` versions use regex |
| Join and split | `concat(s)`, `String.join(sep, …)`, `split(regex [, limit])`, `splitWithDelimiters(regex, limit)` (21), `repeat(n)` (11), `lines()` (11) | `split` drops trailing empty strings |
| Regex | `matches(regex)` | Must match the whole String |
| Convert out | `toCharArray()`, `getBytes([charset])`, `chars()`, `codePoints()`, `toString()` | Arrays are copies |
| Convert in (static) | `valueOf(any)`, `copyValueOf(char[])`, `format(…)`, `formatted(…)` (15) | `valueOf(Object)` gives `"null"` for null |
| Pool | `intern()` | See section 3 |
| Functional and other | `transform(fn)` (12), `translateEscapes()` (15), `describeConstable()` (12), `resolveConstantDesc()` (12) | `"a\\tb".translateEscapes()` → a real tab |

**Constructors:** `String()`, `String(String)`, `String(char[] [, offset, count])`, `String(int[] codePoints, offset, count)`, `String(byte[] [, charset])`, `String(byte[], offset, length [, charset])`, `String(StringBuilder)` and `String(StringBuffer)`.

**StringBuilder / StringBuffer methods:**

| Group | Methods |
|---|---|
| Add | `append(any type)` (13 overloads), `appendCodePoint(cp)`, `insert(offset, any type)`, `repeat(cs or cp, count)` (21) |
| Remove | `delete(start, end)`, `deleteCharAt(i)`, `setLength(0)` (the quickest way to clear) |
| Change | `replace(start, end, str)`, `setCharAt(i, c)`, `reverse()` (keeps surrogate pairs together) |
| Read | `charAt`, `length`, `indexOf`, `lastIndexOf`, `substring`, `subSequence`, `codePointAt`, `getChars`, `chars()`, `codePoints()` |
| Capacity | `capacity()`, `ensureCapacity(n)`, `trimToSize()` |
| Finish and compare | `toString()`, `compareTo(other)` (11) |

Most changing methods return **`this`**, which is why calls can be chained: `sb.append(a).append(b).reverse()`.

---

### 10. `null`, the `CharSequence` family, and Strings elsewhere

**`null` traps:**

| Expression | Result |
|---|---|
| `String s = null; s.length()` | `NullPointerException` |
| `s + "x"` | `"nullx"` |
| `"x".concat(null)` | `NullPointerException` |
| `String.valueOf((Object) null)` | `"null"` |
| `String.valueOf(null)` | `NullPointerException`: the compiler picks the more specific `valueOf(char[])` overload |
| `sb.append((String) null)` | Appends the four letters `null` |
| `switch (s)` with `s == null` | `NullPointerException` (unless there is a `case null`, Java 21+) |
| `"".equals(null)` | `false` |

**`CharSequence`** is the read-only interface shared by `String`, `StringBuilder`, `StringBuffer` and `CharBuffer`. It has `length()`, `charAt()`, `subSequence()`, `toString()`, `chars()`, `isEmpty()` (15) and the static `compare()` (11). Methods that take a `CharSequence` (such as `contains`, `replace`, `String.join` and `contentEquals`) accept any of them.

**Strings in other places:**

- **`switch`** (Java 7+): it switches on `hashCode()`, then confirms with `equals()`.
- **`HashMap` keys:** Strings are the ideal key, because they are immutable and their hash is cached. A mutable key that changes after insertion gets lost in the wrong bucket.
- **Threads:** Strings can be shared freely. A shared `StringBuilder` needs a lock, or a `StringBuffer`.
- **Security:** keep passwords in a `char[]` and wipe it with `Arrays.fill(pw, '\0')`. A String can't be wiped and may appear in heap dumps.
- **Serialization:** a String is written as its characters, and the pooled identity is not kept. Call `intern()` after reading if identity matters.
- **Locale:** `"TITLE".toLowerCase()` on a Turkish machine gives a dotless `ı`. Use `toLowerCase(Locale.ROOT)` for keys and protocols.

---

### 11. Tricky outputs

```java
public class TrickyOutputs {

    public static void main(String[] args) {
        System.out.println('a' + 'b');                    // 195  (char + char = int)
        System.out.println("" + 'a' + 'b');               // ab
        System.out.println('a' + 'b' + "c");              // 195c
        System.out.println("c" + 'a' + 'b');              // cab
        System.out.println(1 + 2 + "3" + 4 + 5);          // 3345

        String n = null;
        System.out.println(n + "x");                      // nullx (+ turns null into "null")
        System.out.println(String.valueOf((Object) null));   // null
        // String.valueOf(null)  → NullPointerException (the char[] overload is chosen)
        // "x".concat(null)      → NullPointerException

        StringBuilder sb = new StringBuilder();
        sb.append((String) null);
        System.out.println(sb + " " + sb.length());       // null 4

        String s = "hello";
        s.concat(" world");                               // result thrown away
        System.out.println(s);                            // hello

        System.out.println("Aa".hashCode() + " " + "BB".hashCode());   // 2112 2112
        System.out.println("".hashCode());                // 0
        System.out.println("hello".equals(new StringBuilder("hello")));   // false (not a String)
    }
}
```

---

### 12. 25 more interview questions

<details><summary>1. Where is the String pool stored in Java 6, 7 and 8+?</summary>

Java 6: in PermGen (fixed size, could run out). Java 7: moved to the main heap. Java 8+: still in the heap. PermGen was replaced by Metaspace, which holds class metadata, not the pool.
</details>

<details><summary>2. Are pooled Strings ever garbage-collected?</summary>

Yes. Up to Java 6 only when PermGen was collected (a full GC); since Java 7 they are ordinary heap objects. The pool holds them weakly, so an entry that nothing else references can be collected. Literals stay alive while their class is loaded.
</details>

<details><summary>3. When exactly is a literal added to the pool?</summary>

Lazily: the first time the `ldc` instruction for that literal runs, not when the class is compiled or loaded.
</details>

<details><summary>4. What changed in intern() in Java 7?</summary>

Java 6 copied the String into PermGen. Java 7+ stores a reference to the existing heap object when the content isn't pooled yet, so `s.intern() == s` can be `true`.
</details>

<details><summary>5. Does new String("abc") copy the characters?</summary>

No. It shares the `byte[]` of the pooled `"abc"` (both are immutable). Only the String object is new.
</details>

<details><summary>6. How many objects does new String("a") + new String("b") create?</summary>

Five String objects: pooled `"a"` and `"b"`, two heap copies, and the result `"ab"` on the heap. `"ab"` is not pooled. Before Java 9 there was also a temporary StringBuilder.
</details>

<details><summary>7. Is "ab" in the pool after String s = a + b (runtime)?</summary>

No. Runtime concatenation results are plain heap objects. They are only pooled if you call `intern()`.
</details>

<details><summary>8. Explain the equals() and hashCode() contract.</summary>

Equal objects must have equal hash codes. Equal hash codes don't imply equal objects. Hash-based collections use `hashCode` to find the bucket and `equals` to confirm, so override both together.
</details>

<details><summary>9. Why does String cache its hashCode, and why is that safe?</summary>

Hashing every character each time would be slow for `HashMap` keys. Caching is safe only because the content can never change.
</details>

<details><summary>10. Why does String's hashCode use 31?</summary>

It is an odd prime, so hashes spread well, and `31 * i` is `(i << 5) - i`, which is cheap.
</details>

<details><summary>11. Can two different Strings have the same hashCode?</summary>

Yes. For example `"Aa"` and `"BB"` both give 2112. That is a collision, and `equals` tells them apart.
</details>

<details><summary>12. What are Compact Strings, and when does a String use 2 bytes per char?</summary>

Java 9+ stores Latin-1 text in 1 byte per char (coder LATIN1). If any character is outside Latin-1 (Hindi, Chinese, emoji), the whole String uses UTF-16 (2 bytes per char).
</details>

<details><summary>13. Is final the same as immutable?</summary>

No. `final` stops the variable from being reassigned. Immutable means the object can't change. A `final StringBuilder` can still be appended to.
</details>

<details><summary>14. How is String made immutable?</summary>

A final class, a `private final byte[]`, no setters, copies in constructors and getters, and every change returns a new String.
</details>

<details><summary>15. What is the default capacity of StringBuilder, and how does it grow?</summary>

16 (or 16 + the initial text length). When it is full, the new capacity is `old * 2 + 2`, or exactly what is needed if that is more.
</details>

<details><summary>16. What is the difference between length() and capacity()?</summary>

`length()` is how many characters are in the builder. `capacity()` is how many fit before it must grow.
</details>

<details><summary>17. Why does sb1.equals(sb2) return false for the same text?</summary>

StringBuilder and StringBuffer don't override `equals`, so they use `Object.equals` (the same reference). Use `compareTo` (Java 11+) or compare their `toString()` results.
</details>

<details><summary>18. Is StringBuffer fully thread-safe?</summary>

Each single method call is synchronized, but a sequence of calls (check, then append) is not atomic. That needs an outer lock.
</details>

<details><summary>19. Why was StringBuilder added in Java 5?</summary>

Most building happens in one thread, so StringBuffer's locking was wasted cost. StringBuilder has the same API without the locks.
</details>

<details><summary>20. How does + work in Java 9 and later?</summary>

`javac` emits one `invokedynamic` call to `StringConcatFactory`. The JVM chooses an efficient strategy at run time. Constant-only expressions are still folded at compile time.
</details>

<details><summary>21. Is + always bad for performance?</summary>

No. A single expression such as `a + b + c` is optimised. It is only bad in loops, where each pass copies the whole String again.
</details>

<details><summary>22. What does String.valueOf(null) do?</summary>

It throws `NullPointerException`, because the compiler chooses `valueOf(char[])`. `String.valueOf((Object) null)` returns `"null"`.
</details>

<details><summary>23. What is the difference between concat() and +?</summary>

`concat` takes only a String, throws on `null`, and returns `this` for an empty argument. `+` works with any type and turns `null` into `"null"`.
</details>

<details><summary>24. What is CharSequence?</summary>

A read-only interface for sequences of chars, implemented by String, StringBuilder, StringBuffer and CharBuffer. APIs that take it accept all of these.
</details>

<details><summary>25. Why is it bad to use toLowerCase() without a Locale for keys?</summary>

The result depends on the machine's locale. In Turkish, `"I"` becomes a dotless `ı`. Use `toLowerCase(Locale.ROOT)` for identifiers, keys and protocols.
</details>

---

### 13. Concept map (revision)

```
WHERE       variable (stack) → reference → String object (heap) → byte[] value (heap)
POOL        StringTable in heap (7+) · literals + constants + intern() · lazy at first ldc · GC-able
NEW         new String("x") = pooled "x" + 1 heap object · shares the byte[] · == false, equals true
COUNT       "a" → 1 · new String("a") → 2 · "a"+"b" → 1 · new("a")+new("b") → 5
COMPARE     == reference · equals content (same → instanceof → coder → bytes) · compareTo order
HASH        s[0]*31^(n-1)+… · cached · equal ⇒ same hash, not the reverse · "Aa"/"BB" collide
LAYOUT      byte[] value + coder (LATIN1/UTF16) + hash + hashIsZero · Java 9 Compact Strings
IMMUTABLE   final class + private final value + copies + new results · final ≠ immutable
BUILDER     AbstractStringBuilder: byte[] + count · cap 16 → old*2+2 · toString copies
BUFFER      synchronized methods · toStringCache · not atomic across calls
EQUALS      StringBuilder/StringBuffer: NO equals override → compareTo / toString().equals
CONCAT      constants folded · 5–8 StringBuilder · 9+ invokedynamic · += loop O(n²)
NULL        null+"x" = "nullx" · concat(null) NPE · valueOf(null) NPE · valueOf((Object)null) "null"
```

**Self-check:**

- [ ] Draw the stack, heap and pool for `s1 = "a"`, `s2 = new String("a")`, `s3 = s2.intern()`
- [ ] Explain lazy literal resolution and the history of the pool from Java 6 to 8
- [ ] Count the objects for any line in the section 4 table
- [ ] Walk through `String.equals()` step by step and state the hashCode contract
- [ ] Explain Compact Strings and the `coder` field
- [ ] Explain the capacity growth rule and why `sb1.equals(sb2)` is false
- [ ] Explain how `+` is compiled in Java 8 and in Java 9+
- [ ] Name the String methods added in Java 11, 12, 15 and 21


---

## Lesson 03 — String Problems & Patterns (completing Strings)

*This lesson covers the rest of Strings: how to approach a problem, the 7 patterns behind almost every String question, and the classic problems solved with them. Every program was run on JDK 25 and its output is in the comments. On the page, it is sections S1–S12.*

### Table of Contents

1. How to approach any String problem (and the cost of each operation)
2. The 7 patterns
3. Reversal: 5 ways, and reversing words
4. Palindromes
5. Counting and frequency
6. Sliding window
7. Stacks and parsing
8. More classic problems
9. Strings with streams and Comparators
10. Regex, beyond the basics
11. 15 more interview questions
12. Practice and pattern map

---

### 1. How to approach any String problem

1. **Clarify the input.** Can it be `null` or empty? Does case matter? Should spaces and punctuation count? ASCII only, or Unicode and emoji?
2. **Do a small example by hand**, including one edge case: `""`, one character, all characters the same.
3. **Name the pattern** (section 2). Most problems are a frequency count, two pointers, or a sliding window.
4. **State the complexity** before you code, for example "O(n) time, O(1) extra space, because the alphabet is fixed at 26".
5. **Code it with a `StringBuilder` or a `char[]`**, never `+=` in a loop.
6. **Test** with the normal case and the edge cases you listed.

**Cost of common operations:**

| Operation | Time | Why |
|---|---|---|
| `length()`, `charAt(i)`, `isEmpty()` | **O(1)** | The length is stored, and the array allows direct access |
| `equals`, `compareTo`, `indexOf`, `contains` | O(n) (indexOf: O(n·m) worst case) | They walk the characters |
| `substring`, `toCharArray`, `toUpperCase`, `replace`, `+` | O(n) | They **copy** into a new String |
| `hashCode()` | O(n) once, then O(1) | The result is cached |
| `sb.append(c)` | O(1) amortised | Spare capacity; it grows rarely |
| `sb.insert(0, c)`, `sb.deleteCharAt(0)` | O(n) | Everything after the position shifts |
| `s += x` in a loop of n | **O(n²)** | Each pass copies everything so far |
| `Arrays.sort(char[])` | O(n log n) | A frequency count is O(n), so prefer it when you can |

---

### 2. The 7 patterns

| Pattern | Signal in the question | Typical problems | Cost |
|---|---|---|---|
| **Frequency count** (`int[26]`, `int[128]`, `HashMap`) | "count", "same letters", "unique", "duplicate" | Anagram, first unique char, duplicates, most frequent | O(n) time, O(1) or O(k) space |
| **Two pointers** (from both ends) | "reverse", "palindrome", "in place" | Reverse, palindrome, reverse vowels | O(n), O(1) |
| **Sliding window** (left/right) | "substring", "longest", "shortest", "contiguous" | Longest substring without repeats, all anagrams of p | O(n) |
| **Stack** | "brackets", "nested", "remove adjacent", "undo" | Valid parentheses, decode string | O(n) |
| **Sorting or canonical key** | "group", "same after rearranging" | Group anagrams, sort characters | O(n log n) |
| **Expand around centre** | "longest palindromic", "count palindromes" | Longest palindromic substring | O(n²), O(1) |
| **Build with StringBuilder** | "compress", "format", "transform each" | Compression, capitalize words, reverse words | O(n) |

**The counting trick:** `counts[c - 'a']++` maps `'a'..'z'` to `0..25`. Use `int[128]` and `counts[c]++` for any ASCII character, and a `HashMap<Character, Integer>` for full Unicode.

---

### 3. Reversal: 5 ways, and reversing words

| Way | Time | Extra space | Notes |
|---|---|---|---|
| `new StringBuilder(s).reverse()` | O(n) | O(n) | **Best in real code.** Keeps emoji (surrogate pairs) intact. |
| Two pointers on a `char[]` | O(n) | O(n) for the copy | **What interviewers want** when they say "without built-ins" |
| Loop backwards into a StringBuilder | O(n) | O(n) | Simple and clear |
| Recursion `rev(s.substring(1)) + s.charAt(0)` | O(n²) | O(n²) + stack | Demo only; a long String overflows the stack |
| Streams | O(n) | O(n) | Works, but wordy and slower |

```java
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class ReverseProblems {

    // 1. Built-in: StringBuilder.reverse() (keeps surrogate pairs together)
    static String reverseBuilder(String s) {
        return new StringBuilder(s).reverse().toString();
    }

    // 2. Two pointers on a char[]: swap ends, move inward. O(n) time, O(n) copy
    static String reverseTwoPointers(String s) {
        char[] a = s.toCharArray();
        for (int i = 0, j = a.length - 1; i < j; i++, j--) {
            char t = a[i];
            a[i] = a[j];
            a[j] = t;
        }
        return new String(a);
    }

    // 3. Loop backwards into a StringBuilder
    static String reverseLoop(String s) {
        StringBuilder sb = new StringBuilder(s.length());
        for (int i = s.length() - 1; i >= 0; i--) {
            sb.append(s.charAt(i));
        }
        return sb.toString();
    }

    // 4. Recursion: reverse(rest) + first char. O(n²) copies, deep stack: demo only
    static String reverseRecursive(String s) {
        if (s.length() <= 1) {
            return s;
        }
        return reverseRecursive(s.substring(1)) + s.charAt(0);
    }

    // 5. Streams: walk the indexes from the end
    static String reverseStream(String s) {
        return IntStream.range(0, s.length())
                .mapToObj(i -> String.valueOf(s.charAt(s.length() - 1 - i)))
                .collect(Collectors.joining());
    }

    // Reverse the ORDER of words: "  the sky  is blue " → "blue is sky the"
    static String reverseWords(String s) {
        String[] words = s.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = words.length - 1; i >= 0; i--) {
            sb.append(words[i]);
            if (i > 0) {
                sb.append(' ');
            }
        }
        return sb.toString();
    }

    // Reverse EACH word, keep the order: "Java is fun" → "avaJ si nuf"
    static String reverseEachWord(String s) {
        StringBuilder sb = new StringBuilder();
        for (String w : s.split(" ")) {
            if (sb.length() > 0) {
                sb.append(' ');
            }
            sb.append(new StringBuilder(w).reverse());
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        String s = "hello";
        System.out.println(reverseBuilder(s));        // olleh
        System.out.println(reverseTwoPointers(s));    // olleh
        System.out.println(reverseLoop(s));           // olleh
        System.out.println(reverseRecursive(s));      // olleh
        System.out.println(reverseStream(s));         // olleh

        System.out.println("[" + reverseWords("  the sky  is blue ") + "]");   // [blue is sky the]
        System.out.println(reverseEachWord("Java is fun"));                    // avaJ si nuf

        // Emoji: StringBuilder.reverse keeps the surrogate pair together, a char swap breaks it
        String e = "a😀b";
        System.out.println(reverseBuilder(e));                                 // b😀a
        System.out.println(reverseTwoPointers(e).equals("b😀a"));              // false
    }
}
```

> **Emoji trap:** swapping `char`s splits a surrogate pair, so the emoji breaks. `StringBuilder.reverse()` treats each pair as one unit.

---

### 4. Palindromes

A palindrome reads the same forwards and backwards. The core idea is **two pointers**: compare `s[i]` with `s[j]`, then move both inward. You never need to build a reversed copy.

- **Ignore case and punctuation:** skip non-alphanumeric chars.
- **"Valid with one deletion":** on the first mismatch, try skipping the left char *or* the right char.
- **Number palindrome:** rebuild the number backwards with `% 10` and `/ 10`.
- **Longest palindromic substring:** every palindrome has a centre, either a char (`"aba"`) or a gap (`"abba"`). There are `2n - 1` centres. Expand from each while both ends match: O(n²) time, O(1) space. (Manacher's algorithm is O(n), but it is rarely expected.)

```java
public class PalindromeProblems {

    // Two pointers: compare the ends and move inward. O(n) time, O(1) space
    static boolean isPalindrome(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) {
            if (s.charAt(i++) != s.charAt(j--)) {
                return false;
            }
        }
        return true;
    }

    // Ignore case and everything that is not a letter or digit
    static boolean isPalindromeClean(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) {
            char a = s.charAt(i), b = s.charAt(j);
            if (!Character.isLetterOrDigit(a)) {
                i++;
            } else if (!Character.isLetterOrDigit(b)) {
                j--;
            } else {
                if (Character.toLowerCase(a) != Character.toLowerCase(b)) {
                    return false;
                }
                i++;
                j--;
            }
        }
        return true;
    }

    // Can it become a palindrome by deleting at most one char?
    static boolean validWithOneDelete(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) {
            if (s.charAt(i) != s.charAt(j)) {
                return isRange(s, i + 1, j) || isRange(s, i, j - 1);   // skip left OR right
            }
            i++;
            j--;
        }
        return true;
    }

    static boolean isRange(String s, int i, int j) {
        while (i < j) {
            if (s.charAt(i++) != s.charAt(j--)) {
                return false;
            }
        }
        return true;
    }

    // Longest palindromic substring: expand around each of the 2n-1 centres. O(n²), O(1) space
    static String longestPalindrome(String s) {
        int bestStart = 0, bestLen = 0;
        for (int c = 0; c < s.length(); c++) {
            int odd = expand(s, c, c);          // centre on a char:      "aba"
            int even = expand(s, c, c + 1);     // centre between chars:  "abba"
            int len = Math.max(odd, even);
            if (len > bestLen) {
                bestLen = len;
                bestStart = c - (len - 1) / 2;
            }
        }
        return s.substring(bestStart, bestStart + bestLen);
    }

    static int expand(String s, int l, int r) {
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
            l--;
            r++;
        }
        return r - l - 1;                       // length of the palindrome found
    }

    // Is a NUMBER a palindrome, without converting it to a String?
    static boolean isPalindromeNumber(int x) {
        if (x < 0) {
            return false;
        }
        int original = x, reversed = 0;
        while (x > 0) {
            reversed = reversed * 10 + x % 10;
            x /= 10;
        }
        return original == reversed;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("racecar"));                                   // true
        System.out.println(isPalindrome("Racecar"));                                   // false (case matters)
        System.out.println(isPalindromeClean("A man, a plan, a canal: Panama"));       // true
        System.out.println(validWithOneDelete("abca"));                                // true  (delete 'b' or 'c')
        System.out.println(validWithOneDelete("abc"));                                 // false
        System.out.println(longestPalindrome("babad"));                                // bab
        System.out.println(longestPalindrome("forgeeksskeegfor"));                     // geeksskeeg
        System.out.println(isPalindromeNumber(12321) + " " + isPalindromeNumber(-121)); // true false
        System.out.println(new StringBuilder("level").reverse().toString().equals("level"));   // true (one-liner)
    }
}
```

---

### 5. Counting and frequency

| Tool | Use when | Order of keys |
|---|---|---|
| `int[26]` | Only `'a'..'z'` | Alphabetical (by index) |
| `int[128]` / `boolean[128]` | Any ASCII char | By char code |
| `HashMap<Character, Integer>` | Any char; order doesn't matter | No order |
| `LinkedHashMap` | "First" questions: first unique, first repeating | **Insertion order** |
| `TreeMap` | Sorted output | Sorted |
| `Collectors.groupingBy(…, counting())` | Stream style | Depends on the map you pass |

`map.merge(c, 1, Integer::sum)` is the shortest way to count. It means "put 1, or add 1 if the key is already there".

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

public class FrequencyProblems {

    // int[26]: fastest, but only for 'a'..'z'
    static int[] count26(String s) {
        int[] counts = new int[26];
        for (char c : s.toCharArray()) {
            counts[c - 'a']++;
        }
        return counts;
    }

    // LinkedHashMap: any char, keeps first-seen order
    static Map<Character, Integer> countMap(String s) {
        Map<Character, Integer> map = new LinkedHashMap<>();
        for (char c : s.toCharArray()) {
            map.merge(c, 1, Integer::sum);          // same as put(c, getOrDefault(c, 0) + 1)
        }
        return map;
    }

    // First non-repeating char: count, then scan again in order. O(n)
    static char firstUnique(String s) {
        int[] counts = new int[128];                // ASCII
        for (char c : s.toCharArray()) {
            counts[c]++;
        }
        for (char c : s.toCharArray()) {
            if (counts[c] == 1) {
                return c;
            }
        }
        return '_';
    }

    // First char that repeats: remember what we have seen
    static char firstRepeating(String s) {
        boolean[] seen = new boolean[128];
        for (char c : s.toCharArray()) {
            if (seen[c]) {
                return c;
            }
            seen[c] = true;
        }
        return '_';
    }

    // Remove duplicate chars, keep the first occurrence and the order
    static String removeDuplicates(String s) {
        StringBuilder sb = new StringBuilder();
        boolean[] seen = new boolean[128];
        for (char c : s.toCharArray()) {
            if (!seen[c]) {
                seen[c] = true;
                sb.append(c);
            }
        }
        return sb.toString();
    }

    // Group anagrams: the sorted letters are the key. O(n · k log k)
    static List<List<String>> groupAnagrams(String[] words) {
        Map<String, List<String>> groups = new LinkedHashMap<>();
        for (String w : words) {
            char[] key = w.toCharArray();
            Arrays.sort(key);
            groups.computeIfAbsent(new String(key), k -> new ArrayList<>()).add(w);
        }
        return new ArrayList<>(groups.values());
    }

    public static void main(String[] args) {
        int[] cnt = count26("banana");
        System.out.println(cnt[0] + " " + cnt[1] + " " + cnt['n' - 'a']);    // 3 1 2  (a, b, n)
        System.out.println(countMap("hello"));                       // {h=1, e=1, l=2, o=1}
        System.out.println(firstUnique("swiss"));                    // w
        System.out.println(firstUnique("aabb"));                     // _
        System.out.println(firstRepeating("abcdbe"));                // b
        System.out.println(removeDuplicates("programming"));         // progamin

        // Streams: count every char, sorted by char (TreeMap)
        Map<Character, Long> freq = "mississippi".chars()
                .mapToObj(c -> (char) c)
                .collect(Collectors.groupingBy(Function.identity(), TreeMap::new, Collectors.counting()));
        System.out.println(freq);                                     // {i=4, m=1, p=2, s=4}

        // Most frequent char
        Map<Character, Integer> m = countMap("abracadabra");
        char best = m.entrySet().stream().max(Map.Entry.comparingByValue()).get().getKey();
        System.out.println(best + "=" + m.get(best));                 // a=5

        // Word frequency
        Map<String, Integer> words = new HashMap<>();
        for (String w : "to be or not to be".split(" ")) {
            words.merge(w, 1, Integer::sum);
        }
        System.out.println(new TreeMap<>(words));                     // {be=2, not=1, or=1, to=2}

        System.out.println(groupAnagrams(new String[]{"eat", "tea", "tan", "ate", "nat", "bat"}));
        // [[eat, tea, ate], [tan, nat], [bat]]
    }
}
```

---

### 6. Sliding window

A window is a substring `[left, right]` that moves along the String. **right** moves forward every step to add a char. **left** moves forward only when the window breaks a rule. Each index enters and leaves at most once, so the whole scan is **O(n)** instead of O(n²) for checking every substring.

- **Variable window:** "longest substring without repeating characters". Grow right; when a char repeats, jump left past its earlier copy.
- **Fixed window (size k):** "find all anagrams of p in s". Add the char entering on the right and remove the one leaving on the left.

On the page, the **algorithm stepper** (`#sviz`) animates: reverse with two pointers, palindrome check, longest unique substring, and first unique character.

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SlidingWindowProblems {

    // Longest substring without repeating chars. Window [left, right], O(n)
    static int longestUnique(String s) {
        Map<Character, Integer> lastSeen = new HashMap<>();
        int best = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (lastSeen.containsKey(c) && lastSeen.get(c) >= left) {
                left = lastSeen.get(c) + 1;          // jump past the earlier copy
            }
            lastSeen.put(c, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }

    // All start indexes where an anagram of p appears in s. Fixed-size window, O(n)
    static List<Integer> findAnagrams(String s, String p) {
        List<Integer> result = new ArrayList<>();
        if (p.length() > s.length()) {
            return result;
        }
        int[] need = new int[26], window = new int[26];
        for (char c : p.toCharArray()) {
            need[c - 'a']++;
        }
        for (int i = 0; i < s.length(); i++) {
            window[s.charAt(i) - 'a']++;                        // add the char entering
            if (i >= p.length()) {
                window[s.charAt(i - p.length()) - 'a']--;       // remove the char leaving
            }
            if (i >= p.length() - 1 && Arrays.equals(need, window)) {
                result.add(i - p.length() + 1);
            }
        }
        return result;
    }

    // Longest run of the same char: "aaabbbbcc" → 4
    static int longestRun(String s) {
        int best = 0, run = 0;
        for (int i = 0; i < s.length(); i++) {
            run = (i > 0 && s.charAt(i) == s.charAt(i - 1)) ? run + 1 : 1;
            best = Math.max(best, run);
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(longestUnique("abcabcbb"));          // 3  ("abc")
        System.out.println(longestUnique("bbbbb"));             // 1
        System.out.println(longestUnique("pwwkew"));            // 3  ("wke")
        System.out.println(longestUnique(""));                  // 0
        System.out.println(findAnagrams("cbaebabacd", "abc"));  // [0, 6]
        System.out.println(longestRun("aaabbbbcc"));            // 4
    }
}
```

---

### 7. Stacks and parsing

Use a stack when the **most recent** unmatched thing decides what happens next: brackets, nesting, "remove adjacent pairs", undo. In Java, use `ArrayDeque` with `push`, `pop` and `peek`. The old `Stack` class is synchronized and legacy. A `StringBuilder` can also act as a stack of chars.

- **Valid brackets:** push openers. On a closer, the stack must be non-empty and its top must be the matching opener. At the end, the stack must be empty.
- **Writing parseInt yourself ("atoi"):** strip, read an optional sign, then `result = result * 10 + (c - '0')`, and check for overflow on every step.
- **Decode `"3[a]2[bc]"`:** one stack for counts and one for the text built so far.

```java
import java.util.ArrayDeque;
import java.util.Deque;

public class StackAndParsing {

    // Balanced brackets: push openers, pop and match on closers. O(n)
    static boolean isBalanced(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            switch (c) {
                case '(', '[', '{' -> stack.push(c);
                case ')' -> { if (stack.isEmpty() || stack.pop() != '(') return false; }
                case ']' -> { if (stack.isEmpty() || stack.pop() != '[') return false; }
                case '}' -> { if (stack.isEmpty() || stack.pop() != '{') return false; }
                default -> { }                     // ignore other chars
            }
        }
        return stack.isEmpty();
    }

    // Remove adjacent duplicates repeatedly: "abbaca" → "ca". The StringBuilder IS the stack
    static String removeAdjacent(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            int last = sb.length() - 1;
            if (last >= 0 && sb.charAt(last) == c) {
                sb.deleteCharAt(last);
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    // Our own parseInt ("atoi"): sign, digits, overflow check
    static int myParseInt(String s) {
        s = s.strip();
        if (s.isEmpty()) {
            throw new NumberFormatException("empty");
        }
        int i = 0, sign = 1;
        if (s.charAt(0) == '-' || s.charAt(0) == '+') {
            sign = s.charAt(0) == '-' ? -1 : 1;
            i++;
        }
        long result = 0;
        for (; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c < '0' || c > '9') {
                throw new NumberFormatException("bad char '" + c + "'");
            }
            result = result * 10 + (c - '0');          // the c - '0' trick
            if (sign * result > Integer.MAX_VALUE || sign * result < Integer.MIN_VALUE) {
                throw new NumberFormatException("overflow");
            }
        }
        return (int) (sign * result);
    }

    // Decode "3[a]2[bc]" → "aaabcbc" with two stacks
    static String decode(String s) {
        Deque<Integer> counts = new ArrayDeque<>();
        Deque<StringBuilder> parts = new ArrayDeque<>();
        StringBuilder cur = new StringBuilder();
        int k = 0;
        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) {
                k = k * 10 + (c - '0');
            } else if (c == '[') {
                counts.push(k);
                parts.push(cur);
                cur = new StringBuilder();
                k = 0;
            } else if (c == ']') {
                String inner = cur.toString().repeat(counts.pop());
                cur = parts.pop().append(inner);
            } else {
                cur.append(c);
            }
        }
        return cur.toString();
    }

    public static void main(String[] args) {
        System.out.println(isBalanced("{[()()]}"));     // true
        System.out.println(isBalanced("([)]"));         // false
        System.out.println(isBalanced("(("));           // false
        System.out.println(removeAdjacent("abbaca"));   // ca
        System.out.println(myParseInt("  -42 "));       // -42
        System.out.println(myParseInt("+2147483647"));  // 2147483647
        try {
            myParseInt("2147483648");
        } catch (NumberFormatException e) {
            System.out.println(e.getMessage());         // overflow
        }
        System.out.println(decode("3[a]2[bc]"));        // aaabcbc
        System.out.println(decode("2[a3[c]]"));         // acccaccc
    }
}
```

---

### 8. More classic problems

| Problem | Key idea |
|---|---|
| Is `b` a rotation of `a`? | Same length, and `(a + a).contains(b)` |
| Longest common prefix | Start with the first word and shorten it until every word starts with it |
| Count words | `strip()`, then `split("\\s+")`. Blank input means 0 words. |
| Toggle case | Lower case minus upper case is 32 |
| Isomorphic (`egg` ↔ `add`) | Track the last position of each char in both Strings; they must always agree |
| Only digits? | `s.chars().allMatch(Character::isDigit)` or `s.matches("\\d+")` |

```java
import java.util.Arrays;

public class ClassicProblems {

    // Is b a rotation of a? Every rotation of a is inside a + a
    static boolean isRotation(String a, String b) {
        return a.length() == b.length() && (a + a).contains(b);
    }

    // Longest common prefix: shrink the first word until all start with it
    static String commonPrefix(String... words) {
        if (words.length == 0) {
            return "";
        }
        String prefix = words[0];
        for (String w : words) {
            while (!w.startsWith(prefix)) {
                prefix = prefix.substring(0, prefix.length() - 1);
            }
        }
        return prefix;
    }

    // Count words: split on runs of whitespace after trimming
    static int countWords(String s) {
        String t = s.strip();
        return t.isEmpty() ? 0 : t.split("\\s+").length;
    }

    // Toggle case with char arithmetic: 'a' - 'A' = 32
    static String toggleCase(String s) {
        char[] a = s.toCharArray();
        for (int i = 0; i < a.length; i++) {
            if (a[i] >= 'a' && a[i] <= 'z') a[i] -= 32;
            else if (a[i] >= 'A' && a[i] <= 'Z') a[i] += 32;
        }
        return new String(a);
    }

    // Isomorphic: "egg" ↔ "add" (each char maps to exactly one other char)
    static boolean isIsomorphic(String s, String t) {
        int[] ms = new int[128], mt = new int[128];      // last position + 1 of each char
        for (int i = 0; i < s.length(); i++) {
            if (ms[s.charAt(i)] != mt[t.charAt(i)]) {
                return false;
            }
            ms[s.charAt(i)] = mt[t.charAt(i)] = i + 1;
        }
        return true;
    }

    // Sum of digits inside a String: "a1b22c3" → 1 + 2 + 2 + 3
    static int digitSum(String s) {
        int sum = 0;
        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) sum += c - '0';
        }
        return sum;
    }

    // Does s contain only digits? (s.matches("\\d+") also works)
    static boolean onlyDigits(String s) {
        return !s.isEmpty() && s.chars().allMatch(Character::isDigit);
    }

    // Sort the characters of a String: "dcba" → "abcd"
    static String sortChars(String s) {
        char[] a = s.toCharArray();
        Arrays.sort(a);
        return new String(a);
    }

    public static void main(String[] args) {
        System.out.println(isRotation("waterbottle", "erbottlewat"));      // true
        System.out.println(isRotation("abc", "acb"));                      // false
        System.out.println(commonPrefix("flower", "flow", "flight"));      // fl
        System.out.println("[" + commonPrefix("dog", "car") + "]");        // []
        System.out.println(countWords("  Java   is  fun "));               // 3
        System.out.println(countWords("   "));                             // 0
        System.out.println(toggleCase("Hello World"));                     // hELLO wORLD
        System.out.println(isIsomorphic("egg", "add") + " " + isIsomorphic("foo", "bar"));   // true false
        System.out.println(digitSum("a1b22c3"));                           // 8
        System.out.println(onlyDigits("12345") + " " + onlyDigits("12a")); // true false
        System.out.println(sortChars("dcba"));                             // abcd
        System.out.println("hello".chars().filter(c -> "aeiou".indexOf(c) >= 0).count());   // 2 (vowels)
    }
}
```

---

### 9. Strings with streams and Comparators

- `s.chars()` gives an `IntStream` of char values. Convert with `mapToObj(c -> (char) c)`.
- `Comparator.comparingInt(String::length)`, `.thenComparing(…)`, `.reversed()` and `String.CASE_INSENSITIVE_ORDER` cover most sorting questions.
- Sorting objects in Java is **stable**: items that compare equal keep their original order.
- `Collectors.joining(sep, prefix, suffix)` and `groupingBy(key, TreeMap::new, counting())` are the two collectors you will use most.

```java
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

public class StreamStrings {

    public static void main(String[] args) {
        List<String> words = List.of("kiwi", "apple", "fig", "banana", "cherry", "date");

        // Sort: natural, by length, by length then alphabetically, reversed
        System.out.println(words.stream().sorted().toList());
        // [apple, banana, cherry, date, fig, kiwi]
        System.out.println(words.stream().sorted(Comparator.comparingInt(String::length)).toList());
        // [fig, kiwi, date, apple, banana, cherry]  (stable: equal lengths keep their order)
        System.out.println(words.stream()
                .sorted(Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()))
                .toList());
        // [fig, date, kiwi, apple, banana, cherry]
        System.out.println(words.stream().sorted(Comparator.reverseOrder()).toList());
        // [kiwi, fig, date, cherry, banana, apple]

        // Filter, map, join
        System.out.println(words.stream()
                .filter(w -> w.length() > 4)
                .map(String::toUpperCase)
                .collect(Collectors.joining(", ", "{", "}")));   // {APPLE, BANANA, CHERRY}

        // Group by length
        Map<Integer, List<String>> byLen = words.stream()
                .collect(Collectors.groupingBy(String::length, TreeMap::new, Collectors.toList()));
        System.out.println(byLen);           // {3=[fig], 4=[kiwi, date], 5=[apple], 6=[banana, cherry]}

        // Longest word, total letters, any starting with 'b'
        System.out.println(words.stream().max(Comparator.comparingInt(String::length)).get());   // banana
        System.out.println(words.stream().mapToInt(String::length).sum());                       // 28
        System.out.println(words.stream().anyMatch(w -> w.startsWith("b")));                     // true

        // chars(): an IntStream of char values
        String s = "Hello World";
        System.out.println(s.chars().filter(Character::isUpperCase).count());                    // 2
        System.out.println(s.chars().distinct().count());                                        // 8
        String noSpaces = s.chars().filter(c -> c != ' ')
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
        System.out.println(noSpaces);                                                            // HelloWorld

        // Split words into a sorted, de-duplicated list
        System.out.println(Arrays.stream("b a c a b".split(" ")).distinct().sorted().toList());  // [a, b, c]

        // Case-insensitive sort with a ready-made Comparator
        List<String> mixed = Arrays.asList("b", "A", "c", "B");
        mixed.sort(String.CASE_INSENSITIVE_ORDER);
        System.out.println(mixed);                                                               // [A, b, B, c]
    }
}
```

---

### 10. Regex, beyond the basics

| Syntax | Meaning | Example |
|---|---|---|
| `( )` | Capturing group; read it with `group(1)` | `(\d{4})-(\d{2})` |
| `(?<name> )` | Named group; read it with `group("name")` | `(?<year>\d{4})` |
| `(?: )` | Group without capturing | `(?:ab)+` |
| `$1` in a replacement | Insert what group 1 matched | `replaceAll("(\\w+) (\\w+)", "$2 $1")` |
| `.*` vs `.*?` | Greedy (as much as possible) vs lazy (as little as possible) | `<.*?>` matches one tag |
| `(?=…)` / `(?!…)` | Lookahead / negative lookahead: check without consuming | Password rules |
| `\b` | Word boundary | `\bcat\b` skips "category" |
| `(?i)` or `Pattern.CASE_INSENSITIVE` | Ignore case | |
| `Pattern.quote(s)` | Treat user text literally | `split(Pattern.quote("+"))` |

**Performance:** `String.matches`, `split` and `replaceAll` compile the regex every time. (`split` has a fast path for a single plain character.) In a loop, compile a `Pattern` once and reuse it. A `Pattern` is thread-safe; a `Matcher` is not.

```java
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegexDeep {

    public static void main(String[] args) {
        // 1. Capturing groups: ( ) remember what they matched
        Matcher m = Pattern.compile("(\\d{4})-(\\d{2})-(\\d{2})").matcher("Due: 2026-10-16.");
        if (m.find()) {
            System.out.println(m.group() + " | year=" + m.group(1) + " day=" + m.group(3));
            // 2026-10-16 | year=2026 day=16
        }

        // 2. Named groups: (?<name>...)
        Matcher e = Pattern.compile("(?<user>[\\w.]+)@(?<host>[\\w.]+)").matcher("mail asha.k@trinity.com now");
        if (e.find()) {
            System.out.println(e.group("user") + " at " + e.group("host"));   // asha.k at trinity.com
        }

        // 3. Back-references in the replacement: $1, $2
        System.out.println("2026-10-16".replaceAll("(\\d+)-(\\d+)-(\\d+)", "$3/$2/$1"));   // 16/10/2026

        // 4. Greedy vs lazy: .* takes as much as it can, .*? as little as it can
        String html = "<b>bold</b><i>it</i>";
        System.out.println(html.replaceAll("<.*>", "#"));      // #
        System.out.println(html.replaceAll("<.*?>", "#"));     // #bold##it#

        // 5. Lookahead (?=...): checks without consuming. Password rule:
        //    8+ chars, at least one digit, one upper-case letter, one lower-case letter
        Pattern strong = Pattern.compile("^(?=.*\\d)(?=.*[A-Z])(?=.*[a-z]).{8,}$");
        System.out.println(strong.matcher("Secret123").matches());   // true
        System.out.println(strong.matcher("secret123").matches());   // false (no upper case)

        // 6. Flags: case-insensitive
        Pattern java = Pattern.compile("java", Pattern.CASE_INSENSITIVE);
        System.out.println(java.matcher("I love JAVA").find());      // true
        System.out.println("I love JAVA".matches("(?i).*java.*"));   // true (inline flag)

        // 7. Every match as a stream (Java 9+)
        System.out.println(Pattern.compile("\\d+").matcher("a1b22c333").results()
                .map(r -> r.group()).toList());                      // [1, 22, 333]

        // 8. Word boundaries \b
        System.out.println("cat category bobcat cat".replaceAll("\\bcat\\b", "DOG"));   // DOG category bobcat DOG

        // 9. Quote user text so its symbols are literal
        System.out.println("1+1=2".split(Pattern.quote("+")).length);        // 2
        System.out.println("price $5".replaceAll("\\$", Matcher.quoteReplacement("\\$")));   // price \$5

        // 10. Validate common formats
        System.out.println("9876543210".matches("[6-9]\\d{9}"));           // true  (Indian mobile)
        System.out.println("ABCDE1234F".matches("[A-Z]{5}\\d{4}[A-Z]"));   // true  (PAN format)
    }
}
```

---

### 11. 15 more interview questions

<details><summary>1. How do you reverse a String without reverse()?</summary>

Copy it to a `char[]`, swap `a[i]` and `a[j]` while moving `i` up from 0 and `j` down from the end, then `new String(a)`. O(n) time.
</details>

<details><summary>2. Why can reversing with a char swap break emoji?</summary>

An emoji is a surrogate pair (2 chars). Swapping chars reverses the pair's order, which makes it invalid. `StringBuilder.reverse()` keeps pairs together.
</details>

<details><summary>3. How do you check a palindrome in O(1) extra space?</summary>

Two pointers from both ends, comparing as you go. No reversed copy is needed.
</details>

<details><summary>4. How do you check two Strings are anagrams in O(n)?</summary>

An `int[26]`: add for one String, subtract for the other, then every count must be 0. Sorting both works too, but it is O(n log n).
</details>

<details><summary>5. How do you find the first non-repeating character?</summary>

Two passes: count every char, then scan the String in order and return the first with count 1. O(n).
</details>

<details><summary>6. What is the sliding window technique?</summary>

Keep a substring `[left, right]`. Extend right each step and shrink left only when a rule breaks. Each index moves at most twice, so it is O(n).
</details>

<details><summary>7. Longest substring without repeating characters?</summary>

A sliding window with a map from char to last index. When a char repeats inside the window, move left to one past its last index. Track the best `right - left + 1`.
</details>

<details><summary>8. How do you group anagrams?</summary>

Use the sorted letters (or a 26-count signature) as a map key, and add each word to the list for its key.
</details>

<details><summary>9. How do you check if one String is a rotation of another?</summary>

The lengths must be equal, and `(a + a).contains(b)` must be true.
</details>

<details><summary>10. How do you check balanced brackets?</summary>

A stack (`ArrayDeque`): push openers and pop on closers, checking that they match. It must be empty at the end.
</details>

<details><summary>11. Why use ArrayDeque instead of Stack?</summary>

`Stack` extends `Vector`, so every call is synchronized, and it is a legacy class. `ArrayDeque` is faster and is the recommended stack and queue.
</details>

<details><summary>12. How do you write your own parseInt?</summary>

Strip, read an optional sign, then `result = result * 10 + (c - '0')` for each digit. Reject non-digits, and check for overflow at each step (use a `long`, or compare with `Integer.MAX_VALUE / 10`).
</details>

<details><summary>13. Greedy vs lazy quantifiers?</summary>

`.*` matches as much as possible, then backtracks. `.*?` matches as little as possible. On `<b>x</b>`, `<.*>` matches everything, while `<.*?>` matches just `<b>`.
</details>

<details><summary>14. Why precompile a Pattern?</summary>

Compiling a regex costs time. `s.matches(regex)` compiles it on every call, while a static `Pattern` is compiled once and is thread-safe to reuse. (A `Matcher` is not thread-safe.)
</details>

<details><summary>15. What is the longest palindromic substring approach?</summary>

Expand around each of the 2n−1 centres (each char and each gap) while both ends match. O(n²) time, O(1) space.
</details>

---

### 12. Practice and pattern map

1. **Reverse only the vowels:** `"hello"` → `"holle"`.
2. **One edit away?** `("pale", "ple")` → `true`, `("pale", "bake")` → `false`.
3. **Count palindromic substrings:** `"aaa"` → `6`.
4. **Longest word** in `"I love programming, in Java!"` → `programming`.
5. **Pangram?** Does the sentence use every letter a–z?
6. **Expand** `"a3b2c1"` → `"aaabbc"` (the reverse of Lesson 01's compression).

<details><summary>Solutions</summary>

**Key ideas:** 1. Two pointers that skip consonants. 2. Walk both Strings and allow one mismatch; on a mismatch, move only the longer String's pointer if the lengths differ. 3. Expand around each of the 2n−1 centres and count each successful expansion. 4. `split("\\W+")` and keep the longest. 5. A `boolean[26]` plus a distinct counter. 6. Read the char, then read every digit after it into a number.

```java
public class StringPracticeSolutions {

    // 1. Reverse only the vowels: two pointers that skip consonants
    static String reverseVowels(String s) {
        char[] a = s.toCharArray();
        int i = 0, j = a.length - 1;
        while (i < j) {
            if ("aeiouAEIOU".indexOf(a[i]) < 0) i++;
            else if ("aeiouAEIOU".indexOf(a[j]) < 0) j--;
            else {
                char t = a[i]; a[i++] = a[j]; a[j--] = t;
            }
        }
        return new String(a);
    }

    // 2. One edit away (insert, delete or replace one char)?
    static boolean oneEditAway(String a, String b) {
        if (Math.abs(a.length() - b.length()) > 1) return false;
        if (a.length() < b.length()) return oneEditAway(b, a);   // make a the longer one
        int i = 0, j = 0, edits = 0;
        while (i < a.length() && j < b.length()) {
            if (a.charAt(i) == b.charAt(j)) {
                i++;
                j++;
            } else {
                if (++edits > 1) return false;
                if (a.length() == b.length()) j++;                // replace: move both
                i++;                                              // delete from the longer one
            }
        }
        return true;
    }

    // 3. Count palindromic substrings: expand around every centre
    static int countPalindromes(String s) {
        int count = 0;
        for (int c = 0; c < 2 * s.length() - 1; c++) {
            int l = c / 2, r = l + c % 2;
            while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
                count++;
                l--;
                r++;
            }
        }
        return count;
    }

    // 4. Longest word in a sentence (first one wins a tie)
    static String longestWord(String sentence) {
        String best = "";
        for (String w : sentence.split("\\W+")) {
            if (w.length() > best.length()) best = w;
        }
        return best;
    }

    // 5. Pangram: does it use every letter a–z?
    static boolean isPangram(String s) {
        boolean[] seen = new boolean[26];
        int distinct = 0;
        for (char c : s.toLowerCase().toCharArray()) {
            if (c >= 'a' && c <= 'z' && !seen[c - 'a']) {
                seen[c - 'a'] = true;
                distinct++;
            }
        }
        return distinct == 26;
    }

    // 6. Expand a compressed string: "a3b2c1" → "aaabbc" (counts may have several digits)
    static String expand(String s) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        while (i < s.length()) {
            char c = s.charAt(i++);
            int n = 0;
            while (i < s.length() && Character.isDigit(s.charAt(i))) {
                n = n * 10 + (s.charAt(i++) - '0');
            }
            sb.append(String.valueOf(c).repeat(n));
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(reverseVowels("hello"));                 // holle
        System.out.println(reverseVowels("programming"));           // prigrammong
        System.out.println(oneEditAway("pale", "ple") + " " + oneEditAway("pale", "bake"));   // true false
        System.out.println(countPalindromes("aaa"));                // 6
        System.out.println(countPalindromes("abc"));                // 3
        System.out.println(longestWord("I love programming, in Java!"));   // programming
        System.out.println(isPangram("The quick brown fox jumps over the lazy dog"));   // true
        System.out.println(expand("a3b2c1") + " " + expand("x12").length());   // aaabbc 12
    }
}
```
</details>

**Pattern map**

```
COUNT       int[26] · int[128] · merge(c, 1, Integer::sum) → anagram, first unique, duplicates
TWO PTRS    i from the left, j from the right → reverse, palindrome, reverse vowels
WINDOW      right always moves; left moves on a broken rule → longest unique, all anagrams
STACK       ArrayDeque push/pop → brackets, remove adjacent, decode "3[a]"
KEY         sorted letters as a map key → group anagrams
CENTRE      expand around 2n-1 centres → longest / count palindromic substrings
BUILD       StringBuilder, never += in a loop → compress, reverse words, capitalize
COST        charAt O(1) · substring/replace/+ copy O(n) · += in loop O(n²) · sort chars O(n log n)
```

**Self-check:**

- [ ] Name the 7 String patterns and the signal words for each
- [ ] Reverse a String 5 ways, and explain why a char swap breaks emoji
- [ ] Check palindromes with two pointers; find the longest with expand-around-centre
- [ ] Use a sliding window for the longest substring without repeats
- [ ] Use a stack for brackets, and write parseInt yourself
- [ ] Use regex groups, back-references, lazy quantifiers and lookahead


---

## Lesson 04 — Java Arrays: From Zero to Advanced

*Everything about arrays: creating them, memory, default values, 2D and jagged arrays, copying, the `Arrays` class, sorting and searching, arrays and methods, conversions, internals, and the core algorithm patterns. Every program was run on JDK 25 and its output is in the comments. On the page, it is sections A1–A14.*

### Table of Contents

1. What is an array?
2. Declaring, creating and initialising
3. Memory: where arrays live
4. 2D, jagged and multi-dimensional arrays
5. Copying: aliasing, shallow and deep
6. The `java.util.Arrays` class
7. Sorting and searching
8. Arrays and methods
9. Arrays vs ArrayList, and conversions
10. Internals and advanced rules
11. Core array patterns
12. Common mistakes
13. 20 interview questions
14. Practice and concept map

---

### 1. What is an array?

An array is a **fixed-size**, **ordered** block of values of **one type**, stored next to each other in memory. Each slot has an **index** from `0` to `length - 1`.

```
 index:   0    1    2    3    4
        ┌────┬────┬────┬────┬────┐
 a ──▶  │ 90 │  0 │ 75 │ 42 │ 18 │     a.length = 5 (a field), last index = 4
        └────┴────┴────┴────┴────┘
```

| Property | What it means |
|---|---|
| **Fixed size** | The length is chosen at creation and can never change. To "grow", create a new array and copy. |
| **One type** | `int[]` holds only ints. `Object[]` can hold any object. |
| **Indexed from 0** | `a[0]` is first and `a[a.length - 1]` is last. Reading any index is **O(1)**. |
| **It is an object** | It lives on the heap, the variable holds a reference, and it can be `null`. It has a `length` **field** (no brackets). |
| **Default values** | New slots are filled automatically: `0`, `0.0`, `false`, `'\0'` or `null`. |
| **Bounds-checked** | A bad index throws `ArrayIndexOutOfBoundsException` instead of reading random memory, unlike C. |

**Great for:** a known number of items, fast access by position, primitives without boxing (`int[]` is far smaller than `List<Integer>`), grids, counting tables (`int[26]`).
**Weak at:** growing or shrinking (use `ArrayList`), inserting or deleting in the middle (O(n) shifts), searching unsorted data (O(n)), and printing, comparing and hashing (they need `Arrays.*` helpers).

---

### 2. Declaring, creating and initialising

| Form | Example | Notes |
|---|---|---|
| Declare only | `int[] a;` | No array exists yet. A local variable must be assigned before use. |
| Create with a size | `a = new int[5];` | 5 slots, all default values |
| Initializer | `int[] a = {1, 2, 3};` | Only allowed in a declaration |
| Long form | `a = new int[]{1, 2, 3};` | Works anywhere, including as an argument (an "anonymous array") |
| C-style | `int a[];` | Compiles, but `int[] a` is the Java style |
| Size from a variable | `new int[n]` | `n` can be computed at run time. 0 is legal; negative throws. |

| Element type | Default |
|---|---|
| `byte`, `short`, `int`, `long` | `0` |
| `float`, `double` | `0.0` |
| `char` | `'\0'` (code 0, not a space) |
| `boolean` | `false` |
| Any object (`String`, `Integer`, arrays…) | `null` |

```java
import java.util.Arrays;

public class ArrayBasics {

    public static void main(String[] args) {
        // 1. Declare, then create: the size is fixed at creation
        int[] scores;                       // preferred style (int scores[] also compiles)
        scores = new int[3];                // 3 slots, all set to the default 0
        scores[0] = 90;
        scores[2] = 75;
        System.out.println(Arrays.toString(scores));      // [90, 0, 75]
        System.out.println(scores.length);                // 3  (a field, not a method)

        // 2. Declare + create + fill in one line (array initializer)
        String[] names = {"Asha", "Ravi", "Meena"};
        int[] primes = new int[]{2, 3, 5, 7};              // the long form
        System.out.println(names[1] + " " + primes[primes.length - 1]);   // Ravi 7

        // 3. Default values depend on the element type
        int[] ints = new int[1];
        double[] doubles = new double[1];
        boolean[] flags = new boolean[1];
        char[] chars = new char[1];
        String[] strs = new String[1];
        System.out.println(ints[0] + " " + doubles[0] + " " + flags[0]);   // 0 0.0 false
        System.out.println((int) chars[0] + " " + strs[0]);                // 0 null  (the char default is '\0', code 0)

        // 4. Length 0 is legal; a negative length is not
        int[] empty = new int[0];
        System.out.println(empty.length + " " + Arrays.toString(empty));   // 0 []
        try {
            int[] bad = new int[-1];
        } catch (NegativeArraySizeException e) {
            System.out.println("NegativeArraySizeException: " + e.getMessage());   // NegativeArraySizeException: -1
        }

        // 5. Bad index → ArrayIndexOutOfBoundsException
        try {
            System.out.println(scores[3]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println(e.getMessage());           // Index 3 out of bounds for length 3
        }

        // 6. An anonymous array, passed straight to a method
        System.out.println(sum(new int[]{1, 2, 3}));      // 6

        // 7. Printing: println(array) shows the type and hash, not the contents
        System.out.println(scores.toString().startsWith("[I@"));   // true
        char[] word = {'h', 'i'};
        System.out.println(word);                          // hi  (println has a char[] overload)

        // 8. Iterating: index loop when you need i, for-each when you don't
        for (int i = 0; i < names.length; i++) {
            System.out.print(i + ":" + names[i] + " ");    // 0:Asha 1:Ravi 2:Meena
        }
        System.out.println();
        int total = 0;
        for (int p : primes) {
            total += p;
        }
        System.out.println(total);                         // 17
        System.out.println(Arrays.stream(primes).max().getAsInt());   // 7
    }

    static int sum(int[] a) {
        int s = 0;
        for (int x : a) {
            s += x;
        }
        return s;
    }
}
```

> **Printing trap:** `System.out.println(arr)` prints something like `[I@1b6d3586` (type + hash). Use `Arrays.toString(arr)`, or `Arrays.deepToString` for 2D. The one exception is `char[]`: `println` has an overload that prints its characters.

---

### 3. Memory: where arrays live

```
 STACK (main)                HEAP                                          METASPACE
 ────────────                ───────────────────────────────────────       ─────────────────────
 nums  ─────┐               ┌ int[] object ───────────────────────┐        class [I
 alias ─────┴─────────────▶ │ header · length=3 · [10][20][30]    │        class [Ljava.lang.String;
                            └─────────────────────────────────────┘        (created by the JVM,
 names ───────────────────▶ ┌ String[] object ────────────────────┐         no .class file)
                            │ header · length=2 · [ref][ref]      │
                            └──────────────────────┼─────┼────────┘
                                                   ▼     ▼
                                               "Asha"   "Ravi"   (String objects elsewhere on the heap)
```

- Primitive arrays store the **values** inside the array. Object arrays store **references**, which are `null` until set.
- In HotSpot, an array object has a **header** (about 12 bytes on a 64-bit JVM with compressed references; these sizes are not guaranteed by the JVM spec, and JDK 25's optional compact object headers shrink them) plus a 4-byte `length`, then the elements, rounded up to a multiple of 8. An `int[3]` is about 16 + 12 = 28 → **32 bytes**.
- Elements sit in one continuous block, so the address of `a[i]` is `base + i × elementSize`. That is why access is **O(1)**, why indexes start at 0 (an offset), and why loops over arrays are cache-friendly.
- `int[] b = a;` copies the **reference**, not the array. Both names now see the same elements (aliasing, section 5).
- An unreachable array is garbage-collected like any object.

---

### 4. 2D, jagged and multi-dimensional arrays

Java has no true matrix type. `int[][]` is an **array of arrays**: an outer array whose slots hold references to row arrays. So rows can have **different lengths** (a jagged array), and a row can even be `null`.

```
 int[][] m = {{1, 2, 3}, {4, 5, 6}};          int[][] tri = new int[3][];  (jagged, rows added later)

 m ──▶ [ ref | ref ]                           tri ──▶ [ ref | ref | ref ]
         │     └──▶ [ 4 | 5 | 6 ]   m[1]                 │     │     └──▶ [1 | 2 | 1]
         └──▶ [ 1 | 2 | 3 ]         m[0]                 │     └──▶ [1 | 1]
                                                         └──▶ [1]
 m.length = 2 · m[0].length = 3 · m[1][2] = 6            tri[2].length = 3 · tri[0].length = 1
```

- `new int[3][4]` creates the outer array and all 3 rows. `new int[3][]` creates only the outer array; the rows are `null` until you assign them.
- Loop with `i < m.length` for rows and `j < m[i].length` for columns. Use `m[i].length`, not `m[0].length`, if the array may be jagged.
- Row-by-row traversal is faster than column-by-column, because each row is one continuous block.

```java
import java.util.Arrays;

public class MultiDimArrays {

    public static void main(String[] args) {
        // 1. A 2D array is an array OF arrays (rows)
        int[][] m = {
                {1, 2, 3},
                {4, 5, 6}
        };
        System.out.println(m.length + " rows, " + m[0].length + " cols");   // 2 rows, 3 cols
        System.out.println(m[1][2]);                                       // 6
        System.out.println(Arrays.deepToString(m));                        // [[1, 2, 3], [4, 5, 6]]
        System.out.println(Arrays.toString(m).startsWith("[[I@"));         // true (toString is not deep)

        // 2. Row-by-row traversal
        for (int[] row : m) {
            for (int x : row) {
                System.out.print(x + " ");                                 // 1 2 3 4 5 6
            }
        }
        System.out.println();

        // 3. Jagged array: rows of different lengths (only the first size is required)
        int[][] tri = new int[4][];
        for (int i = 0; i < tri.length; i++) {
            tri[i] = new int[i + 1];
            tri[i][0] = tri[i][i] = 1;                                     // Pascal's triangle
            for (int j = 1; j < i; j++) {
                tri[i][j] = tri[i - 1][j - 1] + tri[i - 1][j];
            }
        }
        System.out.println(Arrays.deepToString(tri));                      // [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]]

        // 4. Transpose: rows become columns
        int[][] t = new int[m[0].length][m.length];
        for (int i = 0; i < m.length; i++) {
            for (int j = 0; j < m[0].length; j++) {
                t[j][i] = m[i][j];
            }
        }
        System.out.println(Arrays.deepToString(t));                        // [[1, 4], [2, 5], [3, 6]]

        // 5. Rotate a square matrix 90° clockwise = transpose, then reverse each row
        int[][] sq = {{1, 2}, {3, 4}};
        int[][] r = new int[2][2];
        for (int i = 0; i < 2; i++) {
            for (int j = 0; j < 2; j++) {
                r[j][1 - i] = sq[i][j];
            }
        }
        System.out.println(Arrays.deepToString(r));                        // [[3, 1], [4, 2]]

        // 6. Sum of the main diagonal, and a 3D array
        int[][] id = {{5, 0, 0}, {0, 6, 0}, {0, 0, 7}};
        int diag = 0;
        for (int i = 0; i < id.length; i++) {
            diag += id[i][i];
        }
        System.out.println(diag);                                          // 18
        int[][][] cube = new int[2][3][4];
        System.out.println(cube.length * cube[0].length * cube[0][0].length);   // 24 ints

        // 7. Arrays.equals is shallow; deepEquals compares nested arrays
        int[][] a = {{1}, {2}}, b = {{1}, {2}};
        System.out.println(Arrays.equals(a, b) + " " + Arrays.deepEquals(a, b));   // false true
    }
}
```

---

### 5. Copying: aliasing, shallow and deep

| Way | Example | Notes |
|---|---|---|
| `=` | `int[] b = a;` | **Not a copy.** Same array, two names. |
| `clone()` | `a.clone()` | Same length, same type. Shallow. |
| `Arrays.copyOf` | `Arrays.copyOf(a, n)` | Can grow (pads with defaults) or shrink. Shallow. |
| `Arrays.copyOfRange` | `copyOfRange(a, from, to)` | Copies `[from, to)` |
| `System.arraycopy` | `(src, srcPos, dest, destPos, len)` | Fastest; copies into an **existing** array; handles overlapping ranges |
| Streams | `Arrays.stream(a).toArray()` | Fine, but slower |

- **Shallow copy:** a new array, but the elements are copied as-is. For primitives that is a full, independent copy. For objects, both arrays point to the **same element objects**. For a 2D array, both share the **same rows**.
- **Deep copy:** copy the array **and** everything inside it. For 2D: `deep[i] = grid[i].clone()` for every row. Strings don't need it, because they are immutable.

```java
import java.util.Arrays;

public class CopyingArrays {

    public static void main(String[] args) {
        int[] a = {1, 2, 3};

        // 1. = copies the REFERENCE: both names point to one array (aliasing)
        int[] alias = a;
        alias[0] = 99;
        System.out.println(a[0] + " " + (a == alias));            // 99 true
        a[0] = 1;

        // 2. Four ways to make a real copy
        int[] c1 = a.clone();
        int[] c2 = Arrays.copyOf(a, a.length);
        int[] c3 = new int[a.length];
        System.arraycopy(a, 0, c3, 0, a.length);                  // (src, srcPos, dest, destPos, length)
        int[] c4 = Arrays.stream(a).toArray();
        c1[0] = 50;
        System.out.println(Arrays.toString(a) + " " + Arrays.toString(c1));   // [1, 2, 3] [50, 2, 3]
        System.out.println(Arrays.equals(a, c2) && Arrays.equals(a, c3) && Arrays.equals(a, c4));   // true

        // 3. copyOf can grow (pads with defaults) or shrink; copyOfRange takes [from, to)
        System.out.println(Arrays.toString(Arrays.copyOf(a, 5)));       // [1, 2, 3, 0, 0]
        System.out.println(Arrays.toString(Arrays.copyOf(a, 2)));       // [1, 2]
        System.out.println(Arrays.toString(Arrays.copyOfRange(a, 1, 3)));   // [2, 3]

        // 4. arraycopy handles overlapping ranges correctly (shift right by one)
        int[] s = {1, 2, 3, 4, 5};
        System.arraycopy(s, 0, s, 1, 4);
        System.out.println(Arrays.toString(s));                   // [1, 1, 2, 3, 4]

        // 5. SHALLOW copy of objects: the copy shares the same element objects
        StringBuilder[] sbs = {new StringBuilder("x"), new StringBuilder("y")};
        StringBuilder[] shallow = sbs.clone();
        shallow[0].append("!");                                    // changes the SHARED object
        System.out.println(sbs[0] + " " + (sbs[0] == shallow[0])); // x! true

        // 6. clone() of a 2D array copies only the outer array: the rows are shared
        int[][] grid = {{1, 2}, {3, 4}};
        int[][] outer = grid.clone();
        outer[0][0] = 9;
        System.out.println(grid[0][0]);                           // 9  (same row object)

        // 7. Deep copy: copy every row
        int[][] deep = new int[grid.length][];
        for (int i = 0; i < grid.length; i++) {
            deep[i] = grid[i].clone();
        }
        deep[1][1] = 0;
        System.out.println(Arrays.deepToString(grid) + " " + Arrays.deepToString(deep));
        // [[9, 2], [3, 4]] [[9, 2], [3, 0]]
    }
}
```

---

### 6. The `java.util.Arrays` class

| Group | Methods | Notes |
|---|---|---|
| Print | `toString(a)`, `deepToString(a)` | Use `deepToString` for nested arrays |
| Fill | `fill(a, v)`, `fill(a, from, to, v)`, `setAll(a, i -> …)` (8) | `setAll` computes each slot from its index |
| Sort | `sort(a)`, `sort(a, from, to)`, `sort(T[], Comparator)`, `parallelSort(a)` (8) | See section 7 for the algorithms |
| Search | `binarySearch(a, key)`, `binarySearch(a, from, to, key)` | The array **must be sorted**. A missing key gives `-(insertionPoint) - 1`. |
| Copy | `copyOf(a, n)`, `copyOfRange(a, from, to)` | Shallow |
| Compare | `equals(a, b)`, `deepEquals(a, b)`, `compare(a, b)` (9), `mismatch(a, b)` (9) | `mismatch` returns the first differing index, -1 if the arrays are equal, or the shorter length if one is a prefix of the other |
| Hash | `hashCode(a)`, `deepHashCode(a)` | Content-based, unlike `a.hashCode()` |
| View and stream | `asList(…)`, `stream(a)`, `stream(a, from, to)` | `asList` is a fixed-size view backed by the array |
| Parallel | `parallelPrefix(a, op)` (8), `parallelSetAll` (8) | For very large arrays |

```java
import java.util.Arrays;
import java.util.List;

public class ArraysUtility {

    public static void main(String[] args) {
        int[] a = {5, 3, 9, 1, 7};

        // Print
        System.out.println(Arrays.toString(a));                    // [5, 3, 9, 1, 7]

        // Fill and setAll
        int[] zeros = new int[4];
        Arrays.fill(zeros, -1);
        System.out.println(Arrays.toString(zeros));                // [-1, -1, -1, -1]
        Arrays.fill(zeros, 1, 3, 8);                               // only [1, 3)
        System.out.println(Arrays.toString(zeros));                // [-1, 8, 8, -1]
        int[] squares = new int[5];
        Arrays.setAll(squares, i -> i * i);
        System.out.println(Arrays.toString(squares));              // [0, 1, 4, 9, 16]

        // Sort (whole array or a range) and binarySearch (needs a SORTED array)
        int[] b = a.clone();
        Arrays.sort(b);
        System.out.println(Arrays.toString(b));                    // [1, 3, 5, 7, 9]
        System.out.println(Arrays.binarySearch(b, 7));             // 3
        System.out.println(Arrays.binarySearch(b, 4));             // -3  (-(insertion point) - 1)
        int[] part = {9, 8, 7, 6, 5};
        Arrays.sort(part, 1, 4);
        System.out.println(Arrays.toString(part));                 // [9, 6, 7, 8, 5]

        // Compare
        System.out.println(Arrays.equals(new int[]{1, 2}, new int[]{1, 2}));   // true
        System.out.println(Arrays.compare(new int[]{1, 2}, new int[]{1, 3}));  // -1  (Java 9+)
        System.out.println(Arrays.mismatch(new int[]{1, 2, 3}, new int[]{1, 9, 3}));   // 1  (first different index, Java 9+)
        System.out.println(Arrays.hashCode(new int[]{1, 2}) == Arrays.hashCode(new int[]{1, 2}));   // true

        // Streams
        System.out.println(Arrays.stream(a).sum() + " " + Arrays.stream(a).average().getAsDouble());   // 25 5.0
        System.out.println(Arrays.stream(a, 1, 3).boxed().toList());   // [3, 9]

        // asList: a fixed-size List VIEW backed by the array
        String[] arr = {"x", "y", "z"};
        List<String> view = Arrays.asList(arr);
        view.set(0, "X");                                          // writes through to the array
        System.out.println(arr[0]);                                // X
        try {
            view.add("w");
        } catch (UnsupportedOperationException e) {
            System.out.println("asList is fixed-size");            // asList is fixed-size
        }

        // parallelSort: same result, uses several threads for big arrays
        int[] big = {4, 2, 8, 6};
        Arrays.parallelSort(big);
        System.out.println(Arrays.toString(big));                  // [2, 4, 6, 8]
    }
}
```

---

### 7. Sorting and searching

| Call | Algorithm inside the JDK | Stable? | Time |
|---|---|---|---|
| `Arrays.sort(int[])` and other primitives | **Dual-Pivot Quicksort** (Java 7+). Since Java 14 it also uses insertion sort for tiny ranges, merging of already-sorted runs, a heap-sort fallback, and counting sort for large `byte`/`short`/`char` arrays | Not needed (equal ints are identical) | O(n log n) |
| `Arrays.sort(Object[])`, `sort(T[], Comparator)` | **TimSort** (a merge sort that finds runs that are already sorted) | **Yes** | O(n log n), O(n) if already sorted |
| `Arrays.parallelSort` | Parallel merge sort on the fork/join pool, for big arrays | Yes for objects | O(n log n) |
| `Collections.sort(list)` / `list.sort` | TimSort. `ArrayList` sorts its own array; other lists are copied to an array, sorted and written back | Yes | O(n log n) |

- **Descending order** needs objects: `Integer[]` with `Collections.reverseOrder()`. For an `int[]`, sort it and then reverse it.
- A `Comparator` returns a negative number, 0, or a positive number. Use `Integer.compare(x, y)`, never `x - y`, which can overflow.
- **Binary search** halves the range each step: O(log n). Compute the middle as `lo + (hi - lo) / 2` to avoid overflow. On unsorted input the result is meaningless.

| Simple sort | Idea | Best · Worst | Stable |
|---|---|---|---|
| Bubble | Swap neighbours that are out of order; the largest "bubbles" to the end | O(n) · O(n²) | Yes |
| Selection | Pick the minimum of the rest and swap it into place | O(n²) · O(n²) | No |
| Insertion | Insert each item into the sorted part on its left | O(n) · O(n²) | Yes |
| Merge | Split in half, sort each half, merge | O(n log n) · O(n log n) | Yes (O(n) extra) |
| Quick | Partition around a pivot, then recurse | O(n log n) · O(n²) | No |

```java
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;

public class SortAndSearch {

    record Emp(String name, int age) { }

    // Binary search by hand: O(log n), the array must be sorted
    static int binarySearch(int[] a, int key) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;          // avoids (lo + hi) overflowing
            if (a[mid] == key) return mid;
            if (a[mid] < key) lo = mid + 1;
            else hi = mid - 1;
        }
        return -(lo + 1);                          // same contract as Arrays.binarySearch
    }

    // First index where a[i] >= key ("lower bound"): useful with duplicates
    static int lowerBound(int[] a, int key) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;             // unsigned shift: another overflow-safe midpoint
            if (a[mid] < key) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }

    // Bubble sort: O(n²), only to understand sorting; stops early if no swaps
    static void bubbleSort(int[] a) {
        for (int pass = 0; pass < a.length - 1; pass++) {
            boolean swapped = false;
            for (int i = 0; i < a.length - 1 - pass; i++) {
                if (a[i] > a[i + 1]) {
                    int t = a[i]; a[i] = a[i + 1]; a[i + 1] = t;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }

    public static void main(String[] args) {
        // 1. Primitives: sorted ascending in place (Dual-Pivot Quicksort)
        int[] nums = {42, 7, 19, 3, 25};
        Arrays.sort(nums);
        System.out.println(Arrays.toString(nums));                     // [3, 7, 19, 25, 42]

        // 2. Descending needs objects (Integer[]), because Comparators work on objects
        Integer[] boxed = {42, 7, 19, 3, 25};
        Arrays.sort(boxed, Collections.reverseOrder());
        System.out.println(Arrays.toString(boxed));                    // [42, 25, 19, 7, 3]

        // 3. Objects: sorted with a Comparator (TimSort, which is STABLE)
        Emp[] team = {new Emp("Ravi", 30), new Emp("Asha", 25), new Emp("Meena", 30), new Emp("Dev", 25)};
        Arrays.sort(team, Comparator.comparingInt(Emp::age));
        System.out.println(Arrays.toString(team));
        // [Emp[name=Asha, age=25], Emp[name=Dev, age=25], Emp[name=Ravi, age=30], Emp[name=Meena, age=30]]
        Arrays.sort(team, Comparator.comparingInt(Emp::age).reversed().thenComparing(Emp::name));
        System.out.println(team[0].name() + " " + team[1].name());     // Meena Ravi

        // 4. Strings sort lexicographically: upper case comes before lower case
        String[] words = {"banana", "Apple", "cherry", "apple"};
        Arrays.sort(words);
        System.out.println(Arrays.toString(words));                    // [Apple, apple, banana, cherry]
        Arrays.sort(words, Comparator.comparing(String::length).thenComparing(Comparator.reverseOrder()));
        System.out.println(Arrays.toString(words));                    // [apple, Apple, cherry, banana]
        // (shorter first; equal lengths in reverse alphabetical order)

        // 5. Sort a 2D array by its first column (intervals)
        int[][] intervals = {{5, 6}, {1, 3}, {2, 4}};
        Arrays.sort(intervals, (x, y) -> Integer.compare(x[0], y[0]));
        System.out.println(Arrays.deepToString(intervals));            // [[1, 3], [2, 4], [5, 6]]

        // 6. Searching
        System.out.println(binarySearch(nums, 19));                    // 2
        System.out.println(binarySearch(nums, 20));                    // -4  (would go at index 3)
        System.out.println(lowerBound(new int[]{1, 2, 2, 2, 5}, 2));   // 1
        int[] unsorted = {9, 4, 7, 1};
        System.out.println(Arrays.binarySearch(unsorted, 9));          // -5  (9 IS there: unsorted input gives garbage)

        int[] b = {5, 1, 4, 2, 8};
        bubbleSort(b);
        System.out.println(Arrays.toString(b));                        // [1, 2, 4, 5, 8]
    }
}
```

---

### 8. Arrays and methods

- **Java is always pass-by-value.** For an array, the value passed is the **reference**. So a method can change the caller's elements, but assigning a new array to the parameter does not affect the caller's variable.
- If a method must not change its input, either document that it does, or return a **new** array.
- **Varargs** (`int... nums`) is an array parameter that the caller can fill with a list of values. It must be the last parameter, and there can only be one.
- A method can return an array, which is a simple way to return several values.
- `main(String[] args)` receives the command-line words as an array. It is empty, not `null`, when there are none.

```java
import java.util.Arrays;

public class ArraysAndMethods {

    // Java passes the REFERENCE by value: the method can change the elements...
    static void doubleAll(int[] a) {
        for (int i = 0; i < a.length; i++) {
            a[i] *= 2;
        }
    }

    // ...but re-pointing the parameter does not affect the caller's variable
    static void replace(int[] a) {
        a = new int[]{0, 0, 0};
        a[0] = 7;
    }

    // Return a NEW array instead of changing the input
    static int[] reversedCopy(int[] a) {
        int[] r = new int[a.length];
        for (int i = 0; i < a.length; i++) {
            r[i] = a[a.length - 1 - i];
        }
        return r;
    }

    // Varargs: int... is really an int[] (it must be the LAST parameter)
    static int max(int first, int... rest) {
        int m = first;
        for (int x : rest) {
            m = Math.max(m, x);
        }
        return m;
    }

    // Return several values at once in a small array
    static int[] minMax(int[] a) {
        int min = Integer.MAX_VALUE, max = Integer.MIN_VALUE;
        for (int x : a) {
            min = Math.min(min, x);
            max = Math.max(max, x);
        }
        return new int[]{min, max};
    }

    public static void main(String[] args) {
        int[] data = {1, 2, 3};
        doubleAll(data);
        System.out.println(Arrays.toString(data));                 // [2, 4, 6]
        replace(data);
        System.out.println(Arrays.toString(data));                 // [2, 4, 6]  (unchanged)
        System.out.println(Arrays.toString(reversedCopy(data)));   // [6, 4, 2]

        System.out.println(max(4));                                // 4
        System.out.println(max(4, 9, 2));                          // 9
        System.out.println(max(1, new int[]{8, 3}));               // 8  (an array works too)

        int[] mm = minMax(new int[]{7, -2, 15, 4});
        System.out.println(mm[0] + " " + mm[1]);                   // -2 15

        // main(String[] args): command-line words arrive as a String array
        System.out.println(args.length);                           // 0  (when run with no arguments)
    }
}
```

---

### 9. Arrays vs ArrayList, and conversions

| | Array | `ArrayList` |
|---|---|---|
| Size | Fixed | Grows automatically (by about 1.5×) |
| Primitives | Yes: `int[]` | No: `List<Integer>` boxes each value |
| Length | `a.length` (a field) | `list.size()` (a method) |
| Access | `a[i]` | `list.get(i)` |
| Generics | Can't create `new T[n]` | Fully generic |
| Type checks | At run time (`ArrayStoreException`) | At compile time |
| `equals` / `toString` | Identity / `[I@…` | Content / `[1, 2, 3]` |
| Memory and speed | **Smallest and fastest** | Extra objects for boxing and the wrapper |

| Conversion | Code |
|---|---|
| `String[]` → `List` (fixed-size view) | `Arrays.asList(arr)` |
| `String[]` → a list you can grow | `new ArrayList<>(Arrays.asList(arr))` |
| `String[]` → unmodifiable list | `List.of(arr)` (9+) |
| `List` → array | `list.toArray(new String[0])` or `list.toArray(String[]::new)` (11+) |
| `int[]` → `List<Integer>` | `Arrays.stream(a).boxed().toList()` (Java 16+; unmodifiable) |
| `List<Integer>` → `int[]` | `list.stream().mapToInt(Integer::intValue).toArray()` |
| `"1,2,3"` → `int[]` | `Arrays.stream(s.split(",")).mapToInt(Integer::parseInt).toArray()` |

> **`Arrays.asList(intArray)` is a trap.** Generics can't hold primitives, so it returns a `List<int[]>` with **one** element. Box the values first.

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class ArrayConversions {

    public static void main(String[] args) {
        // 1. Object array → List
        String[] arr = {"a", "b", "c"};
        List<String> fixed = Arrays.asList(arr);           // fixed-size view: set() ok, add() throws
        List<String> growable = new ArrayList<>(Arrays.asList(arr));   // a real, independent list
        growable.add("d");
        List<String> immutable = List.of(arr);             // Java 9+: no changes at all, no nulls
        System.out.println(fixed + " " + growable + " " + immutable);  // [a, b, c] [a, b, c, d] [a, b, c]

        // 2. List → array
        String[] back = growable.toArray(new String[0]);
        String[] back2 = growable.toArray(String[]::new);  // Java 11+
        System.out.println(back.length + " " + back2[3]);  // 4 d

        // 3. The int[] trap: asList(int[]) gives a List with ONE element (the array itself)
        int[] nums = {3, 1, 2};
        System.out.println(Arrays.asList(nums).size());    // 1

        // 4. int[] ↔ List<Integer> needs boxing
        List<Integer> list = Arrays.stream(nums).boxed().collect(Collectors.toList());
        System.out.println(list);                          // [3, 1, 2]
        int[] again = list.stream().mapToInt(Integer::intValue).toArray();
        System.out.println(Arrays.toString(again));        // [3, 1, 2]

        // 5. int[] ↔ Integer[]
        Integer[] boxed = IntStream.of(nums).boxed().toArray(Integer[]::new);
        int[] unboxed = Arrays.stream(boxed).mapToInt(Integer::intValue).toArray();
        System.out.println(boxed.length + " " + unboxed[0]);   // 3 3

        // 6. String ↔ char[] ↔ String[]
        char[] cs = "java".toCharArray();
        String[] letters = "java".split("");
        System.out.println(cs.length + " " + Arrays.toString(letters));   // 4 [j, a, v, a]
        System.out.println(new String(cs) + " " + String.join("", letters));   // java java

        // 7. "1,2,3" → int[] and back
        int[] parsed = Arrays.stream("1,2,3".split(",")).mapToInt(Integer::parseInt).toArray();
        System.out.println(Arrays.stream(parsed).mapToObj(String::valueOf).collect(Collectors.joining("+")));   // 1+2+3

        // 8. Array vs ArrayList at a glance
        int[] a = new int[2];                              // fixed size, primitives allowed
        ArrayList<Integer> al = new ArrayList<>();         // grows, objects only (boxing)
        al.add(5);
        al.add(6);
        al.add(7);
        System.out.println(a.length + " " + al.size());    // 2 3
    }
}
```

---

### 10. Internals and advanced rules

- **Arrays are objects** of special classes the JVM creates: `int[]` is named `[I`, and `String[]` is `[Ljava.lang.String;`. Every array implements `Cloneable` and `Serializable`.
- **No `equals`/`hashCode` override.** `a.equals(b)` is the same as `a == b`. Use `Arrays.equals` and `Arrays.hashCode`. An array is a bad `HashMap` key: use a `List` or a String instead.
- **Arrays are covariant:** a `String[]` can be assigned to an `Object[]`. Storing the wrong type is caught only at run time with `ArrayStoreException`. Generics are invariant and are checked at compile time, which is one reason lists are safer.
- **No generic array creation:** `new T[n]` and `new List<String>[n]` don't compile, because of type erasure. The workarounds are `(T[]) new Object[n]` with an unchecked cast, or `Array.newInstance(cls, n)`. `ArrayList` itself keeps an `Object[]` and casts each element on the way out.
- **`final int[] a`** fixes the reference, not the elements.
- **Maximum length** is an `int`, so it is a little under `Integer.MAX_VALUE` (memory permitting).
- The JIT compiler can remove bounds checks inside simple loops when it proves the index is always valid.

```java
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class ArrayInternals {

    public static void main(String[] args) {
        // 1. Arrays are objects: they have a runtime class, and are Cloneable + Serializable
        int[] a = {1, 2, 3};
        Object o = a;                                              // any array is an Object
        System.out.println(a.getClass().getName());                // [I
        System.out.println(new String[0].getClass().getName());    // [Ljava.lang.String;
        System.out.println(new int[0][0].getClass().getSimpleName());   // int[][]
        System.out.println(o instanceof Cloneable && o instanceof java.io.Serializable);   // true

        // 2. Arrays do NOT override equals/hashCode: they compare by reference
        int[] b = {1, 2, 3};
        System.out.println(a == b);                    // false
        System.out.println(a.equals(b));               // false  (Object.equals → ==)
        System.out.println(Arrays.equals(a, b));       // true   (content)

        // ...so an array is a bad HashSet/HashMap key
        Set<int[]> set = new HashSet<>();
        set.add(a);
        System.out.println(set.contains(b));           // false
        Set<String> keys = new HashSet<>();
        keys.add(Arrays.toString(a));                  // use a String (or a List) as the key instead
        System.out.println(keys.contains(Arrays.toString(b)));   // true

        // 3. Covariance: a String[] IS-A Object[] ... checked at run time
        Object[] objs = new String[2];
        objs[0] = "ok";
        try {
            objs[1] = 42;                              // compiles, but the real array holds Strings
        } catch (ArrayStoreException e) {
            System.out.println("ArrayStoreException: " + e.getMessage());   // ArrayStoreException: java.lang.Integer
        }

        // 4. final array: the reference is fixed, the elements are not
        final int[] f = {1, 2};
        f[0] = 100;                                    // allowed
        // f = new int[3];                             // compile error
        System.out.println(f[0]);                      // 100

        // 5. Primitive vs reference arrays: values vs references
        int[] prim = new int[2];                       // the 0s live inside the array
        String[] refs = new String[2];                 // slots hold references, null until set
        refs[0] = "hi";
        System.out.println(prim[1] + " " + refs[0] + " " + refs[1]);   // 0 hi null
        try {
            System.out.println(refs[1].length());
        } catch (NullPointerException e) {
            System.out.println("NPE: the slot is null");   // NPE: the slot is null
        }

        // 6. Max size: an int index, so at most Integer.MAX_VALUE (minus a few) elements
        System.out.println(Integer.MAX_VALUE);         // 2147483647

        // 7. Generic arrays can't be created directly: new T[n] / new List<String>[n] don't compile
        @SuppressWarnings("unchecked")
        java.util.List<String>[] lists = new java.util.List[2];   // raw type + cast is the workaround
        lists[0] = java.util.List.of("x");
        System.out.println(lists[0]);                  // [x]
    }
}
```

---

### 11. Core array patterns

| Pattern | Signal | Idea | Cost |
|---|---|---|---|
| **Prefix sum** | Many range-sum queries | `pre[i+1] = pre[i] + a[i]`; sum of `[l, r]` = `pre[r+1] - pre[l]` | O(n) build, O(1) query |
| **Two pointers** | Sorted array, pairs, "in place" | Move `i` and `j` towards each other based on a comparison | O(n) |
| **Hashing** | Pairs in an unsorted array, "seen before" | Store what you have seen in a `HashMap` / `HashSet` | O(n) time, O(n) space |
| **Sliding window** | "k consecutive", "subarray" | Add the element entering, remove the one leaving | O(n) |
| **Kadane** | Maximum subarray sum | `cur = max(a[i], cur + a[i])` | O(n), O(1) |
| **Read/write pointers** | "Remove", "move zeros", "dedupe in place" | One index reads, another writes the kept values | O(n), O(1) |
| **Reversal trick** | Rotate by k | Reverse all, then reverse the first k and the rest | O(n), O(1) |
| **Dutch flag** | Three groups (0/1/2) | Three pointers: low, mid, high | O(n), one pass |
| **Merge** | Two sorted arrays | Take the smaller head each step | O(n + m) |

On the page, the **array algorithm stepper** (`#aviz`) animates binary search, pair sum with two pointers, the fixed sliding window, Kadane, move zeros, rotate by three reversals, and the Dutch flag.

```java
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class ArrayPatterns {

    // PREFIX SUM: pre[i] = sum of a[0..i-1], so any range sum is O(1)
    static int[] prefix(int[] a) {
        int[] pre = new int[a.length + 1];
        for (int i = 0; i < a.length; i++) {
            pre[i + 1] = pre[i] + a[i];
        }
        return pre;
    }

    // TWO POINTERS on a sorted array: pair with a given sum. O(n)
    static int[] pairSum(int[] sorted, int target) {
        int i = 0, j = sorted.length - 1;
        while (i < j) {
            int s = sorted[i] + sorted[j];
            if (s == target) return new int[]{i, j};
            if (s < target) i++;
            else j--;
        }
        return new int[0];
    }

    // HASHING: two sum on an UNSORTED array. O(n) time, O(n) space
    static int[] twoSum(int[] a, int target) {
        Map<Integer, Integer> seen = new HashMap<>();          // value → index
        for (int i = 0; i < a.length; i++) {
            Integer j = seen.get(target - a[i]);
            if (j != null) return new int[]{j, i};
            seen.put(a[i], i);
        }
        return new int[0];
    }

    // SLIDING WINDOW (fixed size k): max sum of k consecutive elements. O(n)
    static int maxWindowSum(int[] a, int k) {
        int sum = 0;
        for (int i = 0; i < k; i++) sum += a[i];
        int best = sum;
        for (int i = k; i < a.length; i++) {
            sum += a[i] - a[i - k];                            // add the new, drop the old
            best = Math.max(best, sum);
        }
        return best;
    }

    // KADANE: max sum of any contiguous subarray. O(n)
    static int kadane(int[] a) {
        int cur = a[0], best = a[0];
        for (int i = 1; i < a.length; i++) {
            cur = Math.max(a[i], cur + a[i]);                  // extend, or start fresh here
            best = Math.max(best, cur);
        }
        return best;
    }

    // MOVE ZEROS to the end, keep the order of the rest. In place, O(n)
    static void moveZeros(int[] a) {
        int w = 0;                                             // write position
        for (int x : a) {
            if (x != 0) a[w++] = x;
        }
        while (w < a.length) a[w++] = 0;
    }

    // ROTATE right by k with three reversals. In place, O(n)
    static void rotate(int[] a, int k) {
        k %= a.length;
        reverse(a, 0, a.length - 1);
        reverse(a, 0, k - 1);
        reverse(a, k, a.length - 1);
    }

    static void reverse(int[] a, int i, int j) {
        while (i < j) {
            int t = a[i]; a[i++] = a[j]; a[j--] = t;
        }
    }

    // DUTCH NATIONAL FLAG: sort 0s, 1s and 2s in one pass
    static void sort012(int[] a) {
        int lo = 0, mid = 0, hi = a.length - 1;
        while (mid <= hi) {
            if (a[mid] == 0) { int t = a[lo]; a[lo++] = a[mid]; a[mid++] = t; }
            else if (a[mid] == 1) mid++;
            else { int t = a[hi]; a[hi--] = a[mid]; a[mid] = t; }
        }
    }

    // MERGE two sorted arrays. O(n + m)
    static int[] merge(int[] x, int[] y) {
        int[] r = new int[x.length + y.length];
        int i = 0, j = 0, k = 0;
        while (i < x.length && j < y.length) r[k++] = x[i] <= y[j] ? x[i++] : y[j++];
        while (i < x.length) r[k++] = x[i++];
        while (j < y.length) r[k++] = y[j++];
        return r;
    }

    public static void main(String[] args) {
        int[] pre = prefix(new int[]{2, 4, 1, 3, 5});
        System.out.println(Arrays.toString(pre));                       // [0, 2, 6, 7, 10, 15]
        System.out.println(pre[4] - pre[1]);                            // 8  (sum of a[1..3] = 4+1+3)

        System.out.println(Arrays.toString(pairSum(new int[]{1, 3, 4, 6, 9}, 10)));   // [0, 4]  (1 + 9)
        System.out.println(Arrays.toString(twoSum(new int[]{8, 2, 11, 7}, 9)));       // [1, 3]

        System.out.println(maxWindowSum(new int[]{2, 1, 5, 1, 3, 2}, 3));   // 9  (5 + 1 + 3)
        System.out.println(kadane(new int[]{-2, 1, -3, 4, -1, 2, 1, -5, 4}));   // 6  ([4, -1, 2, 1])

        int[] z = {0, 1, 0, 3, 12};
        moveZeros(z);
        System.out.println(Arrays.toString(z));                         // [1, 3, 12, 0, 0]

        int[] r = {1, 2, 3, 4, 5, 6, 7};
        rotate(r, 3);
        System.out.println(Arrays.toString(r));                         // [5, 6, 7, 1, 2, 3, 4]

        int[] f = {2, 0, 2, 1, 1, 0};
        sort012(f);
        System.out.println(Arrays.toString(f));                         // [0, 0, 1, 1, 2, 2]

        System.out.println(Arrays.toString(merge(new int[]{1, 4, 7}, new int[]{2, 3, 8})));   // [1, 2, 3, 4, 7, 8]
    }
}
```

---

### 12. Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| `for (i = 0; i <= a.length; i++)` | `ArrayIndexOutOfBoundsException` on the last step | `i < a.length` |
| `a.length()` or `list.length` | Doesn't compile | Array: `length`. String: `length()`. List: `size()`. |
| `System.out.println(a)` | Prints `[I@1b6d…` | `Arrays.toString(a)` |
| `a == b` or `a.equals(b)` for content | `false` for equal contents | `Arrays.equals` / `deepEquals` |
| `int[] b = a;` as a "copy" | Changes to `b` show up in `a` | `a.clone()` / `Arrays.copyOf` |
| `grid.clone()` as a deep copy | Rows are still shared | Clone every row |
| `Arrays.asList(intArr)` | A list with one element | `Arrays.stream(a).boxed()` |
| `Arrays.asList(arr).add(x)` | `UnsupportedOperationException` | `new ArrayList<>(Arrays.asList(arr))` |
| `binarySearch` on unsorted data | Wrong answers, no error | Sort first |
| Reading an object array's slot before setting it | `NullPointerException` | Fill it, or check for null |
| Comparator `(x, y) -> x - y` | Overflows for large values, so the sort is wrong | `Integer.compare(x, y)` |
| `(lo + hi) / 2` for huge arrays | Overflows to a negative index | `lo + (hi - lo) / 2` or `(lo + hi) >>> 1` |

---

### 13. 20 interview questions

<details><summary>1. What is an array? Is it a primitive or an object?</summary>

A fixed-size, indexed container of one element type. It is always an **object** (on the heap, can be null), even when it holds primitives.
</details>

<details><summary>2. Why do indexes start at 0?</summary>

The index is an offset from the start: the address of `a[i]` is `base + i × size`, so the first element is at offset 0.
</details>

<details><summary>3. Why is array access O(1)?</summary>

The elements are in one continuous block, so the position of any index is computed directly, with no walking.
</details>

<details><summary>4. What are the default values in a new array?</summary>

0 for integer types, 0.0 for floating point, `'\0'` for char, false for boolean, and null for objects.
</details>

<details><summary>5. length vs length() vs size()?</summary>

Arrays have a final `length` field. String has a `length()` method. Collections have a `size()` method.
</details>

<details><summary>6. Can you change an array's size?</summary>

No. You create a new array and copy into it (`Arrays.copyOf`). That is exactly what `ArrayList` does when it grows.
</details>

<details><summary>7. What is a jagged array?</summary>

A 2D array whose rows have different lengths. It is possible because a 2D array is an array of references to separate row arrays.
</details>

<details><summary>8. Shallow vs deep copy of an array?</summary>

A shallow copy is a new array holding the same element values or references, so object elements and 2D rows are shared. A deep copy also copies every nested object or row.
</details>

<details><summary>9. clone() vs Arrays.copyOf vs System.arraycopy?</summary>

All are shallow. `clone` gives the same length. `copyOf` can resize. `arraycopy` copies into an existing array, can target any range, is the fastest, and handles overlapping ranges.
</details>

<details><summary>10. Why does a.equals(b) return false for equal contents?</summary>

Arrays inherit `Object.equals`, which compares references. Use `Arrays.equals`, or `Arrays.deepEquals` for nested arrays.
</details>

<details><summary>11. Which algorithms does Arrays.sort use?</summary>

Dual-Pivot Quicksort for primitives (fast, not stable, which doesn't matter for primitives), helped by insertion sort, run merging, a heap-sort fallback and, for large byte/short/char arrays, counting sort. TimSort for objects (stable, O(n) on sorted data).
</details>

<details><summary>12. Why must object sorting be stable?</summary>

Objects that compare equal can still be different, such as two employees of the same age. Stability keeps their earlier order, which lets you sort by several keys in turn.
</details>

<details><summary>13. What does binarySearch return when the key is missing?</summary>

`-(insertionPoint) - 1`, which is always negative. The insertion point is where the key would go to keep the array sorted.
</details>

<details><summary>14. Is Java pass-by-reference for arrays?</summary>

No. Java is always pass-by-value; the value is the reference. The method can change the elements, but reassigning the parameter doesn't affect the caller.
</details>

<details><summary>15. What is ArrayStoreException?</summary>

Arrays are covariant, so a `String[]` can be used as an `Object[]`. Storing an Integer into it compiles, but the JVM checks the real type at run time and throws.
</details>

<details><summary>16. Why can't you write new T[n]?</summary>

Generics are erased at run time, but an array must know its exact element type to do store checks. The workaround is `(T[]) new Object[n]`, or `Array.newInstance(cls, n)`.
</details>

<details><summary>17. What is the problem with Arrays.asList?</summary>

It returns a fixed-size view backed by the array (no add or remove; `set` writes through). With an `int[]` it gives a list containing one element: the array itself.
</details>

<details><summary>18. Array vs ArrayList: when do you use which?</summary>

An array for a fixed size, primitives, or performance-critical code. An `ArrayList` when the size changes or you need collection APIs and generics.
</details>

<details><summary>19. How do you find the maximum subarray sum?</summary>

Kadane's algorithm: at each element, either extend the current sum or restart from this element, and track the best. O(n), O(1).
</details>

<details><summary>20. How do you rotate an array by k in place?</summary>

Reverse the whole array, then reverse the first k elements, then reverse the rest (use `k % n`). O(n) time, O(1) space.
</details>

---

### 14. Practice and concept map

1. **Second largest** distinct value of `{12, 35, 1, 10, 35, 34}` → `34`.
2. **Missing number** in 1..6 from `{1, 2, 4, 5, 6}` → `3`.
3. **Duplicates** in `{4, 3, 2, 7, 8, 2, 3, 1, 3}`, each once → `[2, 3]`.
4. **Remove duplicates** from a sorted array in place and return the new length.
5. **Leaders:** elements greater than everything to their right. `{16, 17, 4, 3, 5, 2}` → `[17, 5, 2]`.
6. **Product of all others**, without division: `{1, 2, 3, 4}` → `[24, 12, 8, 6]`.

<details><summary>Solutions</summary>

**Key ideas:** 1. Track the first and second largest in one pass. 2. Expected sum `n(n+1)/2` minus the actual sum (use a long). 3. A `HashSet`: `add` returns false for a value that was already seen. 4. A write pointer that advances only on a new value. 5. Scan from the right while tracking the maximum. 6. Multiply the prefix products by the suffix products.

**Edge cases an interviewer will ask about:** an empty array (`k %= a.length` in rotate divides by zero, and `out[0] = 1` fails), no second distinct value (this solution returns `Integer.MIN_VALUE`, so say so, or return an `OptionalInt`), and overflow (use a `long` for sums, and for a reversed number in a palindrome check).

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class ArraySolutions {

    // 1. Second largest DISTINCT value in one pass
    static int secondLargest(int[] a) {
        int first = Integer.MIN_VALUE, second = Integer.MIN_VALUE;
        for (int x : a) {
            if (x > first) {
                second = first;
                first = x;
            } else if (x > second && x != first) {
                second = x;
            }
        }
        return second;
    }

    // 2. Missing number in 1..n (n - 1 values given): expected sum - actual sum
    static int missing(int[] a, int n) {
        long expected = (long) n * (n + 1) / 2;
        long actual = 0;
        for (int x : a) actual += x;
        return (int) (expected - actual);
    }

    // 3. Duplicates, each reported once, in first-seen order
    static Set<Integer> duplicates(int[] a) {
        Set<Integer> seen = new HashSet<>(), dup = new LinkedHashSet<>();
        for (int x : a) {
            if (!seen.add(x)) dup.add(x);          // add() returns false if already present
        }
        return dup;
    }

    // 4. Remove duplicates from a SORTED array in place; returns the new length
    static int dedupSorted(int[] a) {
        if (a.length == 0) return 0;
        int w = 1;
        for (int i = 1; i < a.length; i++) {
            if (a[i] != a[w - 1]) a[w++] = a[i];
        }
        return w;
    }

    // 5. Leaders: elements greater than everything to their right (scan from the right)
    static List<Integer> leaders(int[] a) {
        List<Integer> res = new ArrayList<>();
        int maxRight = Integer.MIN_VALUE;
        for (int i = a.length - 1; i >= 0; i--) {
            if (a[i] > maxRight) {
                res.add(0, a[i]);
                maxRight = a[i];
            }
        }
        return res;
    }

    // 6. Product of all others, without division: prefix products × suffix products
    static int[] productExceptSelf(int[] a) {
        int n = a.length;
        int[] out = new int[n];
        out[0] = 1;
        for (int i = 1; i < n; i++) out[i] = out[i - 1] * a[i - 1];    // left products
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            out[i] *= right;                                          // times right products
            right *= a[i];
        }
        return out;
    }

    // 7. Is the array sorted (non-decreasing)?
    static boolean isSorted(int[] a) {
        for (int i = 1; i < a.length; i++) {
            if (a[i - 1] > a[i]) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(secondLargest(new int[]{12, 35, 1, 10, 35, 34}));   // 34
        System.out.println(missing(new int[]{1, 2, 4, 5, 6}, 6));              // 3
        System.out.println(duplicates(new int[]{4, 3, 2, 7, 8, 2, 3, 1, 3}));  // [2, 3]
        int[] s = {1, 1, 2, 3, 3, 3, 4};
        int len = dedupSorted(s);
        System.out.println(len + " " + Arrays.toString(Arrays.copyOf(s, len)));   // 4 [1, 2, 3, 4]
        System.out.println(leaders(new int[]{16, 17, 4, 3, 5, 2}));           // [17, 5, 2]
        System.out.println(Arrays.toString(productExceptSelf(new int[]{1, 2, 3, 4})));   // [24, 12, 8, 6]
        System.out.println(isSorted(new int[]{1, 2, 2, 5}) + " " + isSorted(new int[]{3, 1}));   // true false
    }
}
```
</details>

**Concept map**

```
BASICS      fixed size · one type · index 0..length-1 · O(1) access · object on heap · length FIELD
DEFAULTS    0 · 0.0 · '\0' · false · null      errors: AIOOBE · NegativeArraySize · NPE on null slot
MEMORY      variable → ref → [header | length | elements]  · primitives inline, objects as refs
2D          array of arrays · jagged rows · new int[3][] → rows null · deepToString / deepEquals
COPY        = aliases · clone / copyOf / copyOfRange / arraycopy = SHALLOW · deep: clone each row
ARRAYS      toString fill setAll sort binarySearch copyOf equals compare mismatch asList stream
SORT        primitives: Dual-Pivot Quicksort · objects: TimSort (stable) · Integer.compare, not x - y
SEARCH      binary O(log n) on SORTED data · missing → -(insertion point) - 1 · lo + (hi - lo) / 2
METHODS     pass-by-value of the reference · varargs = array · return arrays for several values
CONVERT     asList fixed view · new ArrayList<>(…) · toArray(String[]::new) · int[] needs boxed()
INTERNALS   [I class · no equals/hashCode override · covariant → ArrayStoreException · no new T[n]
PATTERNS    prefix sum · two pointers · hashing · window · Kadane · read/write · rotate · Dutch flag · merge
```

**Self-check:**

- [ ] Array basics: fixed size, defaults, the length field, and the exceptions
- [ ] Array memory: references, headers, primitive vs object arrays
- [ ] 2D and jagged arrays as arrays of arrays
- [ ] Aliasing vs shallow copy vs deep copy (clone, copyOf, arraycopy)
- [ ] The Arrays class, and which algorithm Arrays.sort uses
- [ ] Pass-by-value of references, varargs, and the asList traps
- [ ] Covariance, ArrayStoreException and generic arrays
- [ ] Prefix sum, two pointers, sliding window, Kadane, rotate

---

## Lesson 00 — Java Foundations: Platform, Types, Operators, Methods

*How Java runs and the language basics that every later lesson assumes: the JDK, JRE and JVM, primitives and references, operators and casting, control flow, methods and recursion, pass-by-value, and packages and I/O. On the page it comes first (band `#found`, sections F1–F8), before Lesson 01. 12 programs, all run on JDK 25.*

### Table of Contents

1. The Java platform: JDK, JRE, JVM and bytecode
2. Variables and types: primitives vs references
3. Operators, casting and arithmetic traps
4. Control flow: if, switch and loops
5. Methods, overloading, scope and recursion
6. Pass-by-value: what really happens to arguments
7. Packages, imports, input/output and the command line
8. Foundations: interview questions and review

---

### 1. The Java platform: JDK, JRE, JVM and bytecode

**In 30 seconds:** you write `.java` text. `javac` compiles it **once** into `.class` files full of **bytecode**, which is the same on every OS. The **JVM** loads that bytecode and runs it: first by interpreting it, then by compiling the hot parts to native machine code (the **JIT**). The **JDK** is everything a developer needs; the **JRE** is what a program needs to run.

**Why it exists:** C and C++ compile to machine code for one CPU and one OS. Java compiles to bytecode for a *virtual* machine, and each platform has its own JVM, so the same `.class` file runs everywhere: "write once, run anywhere".

**Analogy:** bytecode is sheet music; `javac` writes it down once; each JVM is a musician who plays it on their own instrument (the CPU), and learns often-played pieces by heart (the JIT).

| Name | What it is | Contains | Who needs it |
|---|---|---|---|
| **JVM** | Java Virtual Machine: runs bytecode | Class loader, bytecode verifier, interpreter, JIT compiler, garbage collector | Every running Java program |
| **JRE** | Java Runtime Environment | JVM + the standard class library | Users who only run programs |
| **JDK** | Java Development Kit | JRE + tools: `javac`, `java`, `javap`, `jshell`, `jar`, `jcmd`… | Developers |

Since Java 11, Oracle no longer ships a separate JRE (some vendors, such as Eclipse Temurin, still publish JRE builds), and `jlink` can build a trimmed runtime.

```
COMPILE TIME (once):   Hello.java ──javac──▶ Hello.class (bytecode, same on every OS)
RUN TIME (the JVM):    Class loader ─▶ Verifier ─▶ Interpreter ─▶ JIT (hot methods → native code)
Runtime data areas:    Heap (objects, arrays, GC) · Stacks (one per thread, frames) · Metaspace (class metadata) · PC registers
```

Classes load lazily on first use. HotSpot counts method calls; hot methods go to the JIT (C1 quickly, then C2). Metaspace replaced PermGen in Java 8. This is the HotSpot model; other JVMs differ in detail.

```java
public class Add {

    static int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        int sum = add(2, 3);
        System.out.println("2 + 3 = " + sum);                 // 2 + 3 = 5
        System.out.println(Runtime.version().feature());      // 25  (the JDK that ran it)
    }
}
```

```
javac Add.java      # produces Add.class
java Add            # run the class (no .class suffix)
java Add.java       # JDK 11+: compile in memory and run
```

`javap -c Add` (JDK 25, class-file major version 69):

```
static int add(int, int);
  Code:
     0: iload_0            // push parameter a onto the operand stack
     1: iload_1            // push parameter b
     2: iadd               // pop both, push a + b
     3: ireturn            // return the int on top of the stack
public static void main(java.lang.String[]);
     0: iconst_2
     1: iconst_3
     2: invokestatic  #7   // Method add:(II)I
     5: istore_1           // store the result in local slot 1 (sum)
    10: invokedynamic #19  // makeConcatWithConstants: "2 + 3 = " + sum (Java 9+)
```

- Bytecode is a stack machine. Locals are numbered slots (`a` is slot 0 because `add` is static; instance methods use slot 0 for `this`).
- `invokestatic` pushes a frame for `add`; `ireturn` pops it.
- String `+` compiles to `invokedynamic` since Java 9 (Lesson 02, section 8).

| LTS | Year | Headline features |
|---|---|---|
| Java 8 | 2014 | Lambdas, streams, `Optional`, default methods, `java.time`, Metaspace replaces PermGen |
| Java 11 | 2018 | `var` in lambdas, `HttpClient`, `java File.java` launcher, `isBlank/strip/lines/repeat` |
| Java 17 | 2021 | Records (16), sealed classes (17), text blocks (15), switch expressions (14), `instanceof` patterns (16) |
| Java 21 | 2023 | Virtual threads, pattern matching for `switch`, record patterns, sequenced collections |
| Java 25 | 2025 | Compact source files and instance `main` (`void main() { IO.println("hi"); }`, verified), module import declarations, flexible constructor bodies, scoped values |

**Common mistakes:** `java Add.class` (use the class name); file name ≠ public class name; "Java is only interpreted"; a class compiled for a newer Java on an older JVM → `UnsupportedClassVersionError` (use `javac --release N`).

**Interview answer:** "The JDK is the development kit: the compiler and tools plus a runtime. The JRE is the runtime: the JVM plus the standard libraries. The JVM executes bytecode. `javac` compiles source into platform-neutral bytecode; at run time the class loader loads classes on demand, the verifier checks them, and the JVM interprets them while the JIT compiles hot methods into native code."

**Follow-ups:** Compiled or interpreted? Both. Why faster after warm-up? JIT with profiling (inlining, escape analysis). Is the JVM platform-independent? No, bytecode is.

---

### 2. Variables and types: primitives vs references

**In 30 seconds:** 8 primitive types hold a value directly; reference types (classes, interfaces, arrays) hold a reference to a heap object. Each primitive has a wrapper (`int` ↔ `Integer`) and Java converts automatically (autoboxing).

**Why it exists:** primitives are fast and small (no header, no GC); objects give methods, `null`, and a place in collections.

| Type | Size | Range | Default (fields, arrays) | Literal |
|---|---|---|---|---|
| `byte` | 8 bits | −128 … 127 | `0` | `(byte) 10` |
| `short` | 16 bits | −32,768 … 32,767 | `0` | `(short) 10` |
| `int` | 32 bits | −2^31 … 2^31−1 (≈ ±2.1 billion) | `0` | `42`, `0xFF`, `0b1010`, `1_000_000` |
| `long` | 64 bits | −2^63 … 2^63−1 (≈ ±9.2 × 10^18) | `0L` | `3_000_000_000L` |
| `float` | 32 bits | ≈ 7 significant digits | `0.0f` | `1.5f` |
| `double` | 64 bits | ≈ 15–16 significant digits | `0.0` | `1.5`, `2e3` |
| `char` | 16 bits, unsigned | 0 … 65,535 (a UTF-16 unit) | `'\u0000'` | `'A'`, `'\n'` |
| `boolean` | not specified | `true` / `false` | `false` | `true` |

Defaults apply only to fields and array elements. Locals must be definitely assigned before they are read.

```
STACK (main frame)          HEAP
int n      [ 42 ]           ┌ Integer cache −128..127 ┐
Integer a  [ref] ─────────▶ │  Integer 127            │ ◀── b [ref]     a == b → true
Integer c  [ref] ─────────▶ Integer 128
Integer d  [ref] ─────────▶ Integer 128   (another object)              c == d → false
```

```java
public class Primitives {

    static int counter;          // a field: gets the default 0
    static boolean ready;        // default false
    static String name;          // default null (a reference)

    public static void main(String[] args) {
        // 1. Sizes and ranges come from the wrapper classes
        System.out.println(Byte.MIN_VALUE + " .. " + Byte.MAX_VALUE);       // -128 .. 127
        System.out.println(Integer.BYTES + " bytes, max " + Integer.MAX_VALUE); // 4 bytes, max 2147483647
        System.out.println(Long.MAX_VALUE);                                  // 9223372036854775807
        System.out.println((int) Character.MAX_VALUE);                       // 65535

        // 2. Literals
        long big = 3_000_000_000L;      // L: without it, 3000000000 is a too-large int literal
        float f = 1.5f;                 // f: without it, 1.5 is a double
        int hex = 0xFF, bin = 0b1010;   // hex and binary
        System.out.println(big + " " + f + " " + hex + " " + bin);           // 3000000000 1.5 255 10

        // 3. Field defaults vs locals
        System.out.println(counter + " " + ready + " " + name);              // 0 false null
        int local;
        // System.out.println(local);   // error: variable local might not have been initialized
        local = 7;
        System.out.println(local);                                           // 7

        // 4. char is a 16-bit unsigned number
        char c = 'A';
        System.out.println(c + 1);                                           // 66
        System.out.println((char) (c + 1));                                  // B
    }
}
```

```java
import java.util.HashMap;
import java.util.Map;

public class Boxing {

    public static void main(String[] args) {
        // 1. Autoboxing: int -> Integer happens for you
        Integer a = 127, b = 127;          // Integer.valueOf(127): from the cache
        Integer c = 128, d = 128;          // outside -128..127: two new objects
        System.out.println(a == b);        // true   (same cached object)
        System.out.println(c == d);        // false  (different objects)
        System.out.println(c.equals(d));   // true   (same value)

        // 2. Arithmetic unboxes first, so == on an int side compares values
        int e = 128;
        System.out.println(c == e);        // true   (c is unboxed to int)

        // 3. Unboxing null throws
        Map<String, Integer> stock = new HashMap<>();
        Integer apples = stock.get("apples");   // null: no such key
        try {
            int n = apples;                // apples.intValue() on null
            System.out.println(n);
        } catch (NullPointerException ex) {
            System.out.println("NPE: unboxing null");   // NPE: unboxing null
        }
        int safe = stock.getOrDefault("apples", 0);
        System.out.println(safe);          // 0
    }
}
```

- `Integer a = 127` is `Integer.valueOf(127)`. The spec requires caching −128..127; the upper bound can be raised (`-XX:AutoBoxCacheMax`), so never rely on `==`.
- If one side of `==` is primitive, the other is unboxed and values are compared.
- `int n = apples` calls `apples.intValue()`: NPE on `null` (classic `Map<String, Integer>` bug).

**Common mistakes:** `==` on `Integer`/`Long`; unboxing `null`; `long x = 3000000000` (*integer number too large*); `float f = 1.5` (*possible lossy conversion from double to float*); `double` for money.

**Real-world:** `Long` entity IDs compared with `==` pass up to 127 and fail after. Use `Objects.equals`.

**Interview answer:** "Eight primitives store values; reference variables store a reference to a heap object. The compiler autoboxes with `valueOf` and unboxes with `xxxValue()`. Two traps: `Integer.valueOf` caches −128 to 127, so `==` only looks right for small numbers, and unboxing `null` throws an NPE."

**Follow-ups:** Purely OO? No, because of primitives. Where do primitives live? Locals in the frame; primitive fields inside their object on the heap. Other caches: `Byte`, `Short`, `Long` (−128..127), `Character` (0..127), `Boolean`; not `Float`/`Double`. Why no `List<int>`? Erasure makes `T` an `Object`.

---

### 3. Operators, casting and arithmetic traps

**In 30 seconds:** widening (smaller → bigger) is automatic; narrowing needs a cast and may lose data. `byte`/`short`/`char` arithmetic happens in `int`. `int` overflow wraps silently, int `/` drops the fraction, and `double` can't store 0.1 exactly.

| Conversion | Direction | Cast? |
|---|---|---|
| Widening | `byte → short → int → long → float → double`, `char → int` | No (`int → float` and `long → float/double` may lose precision, not range) |
| Narrowing | e.g. `int → byte`, `double → int` | Yes: integers keep low bits, doubles truncate toward zero |
| Promotion | `byte`/`short`/`char` in arithmetic | Result is at least `int` |

```java
public class Operators {

    public static void main(String[] args) {
        // 1. Widening is automatic, narrowing needs a cast and may lose data
        int i = 300;
        long l = i;                        // widening: always safe
        byte b = (byte) i;                 // narrowing: keeps the low 8 bits
        System.out.println(l + " " + b);   // 300 44
        System.out.println((int) 3.99);    // 3   (truncates toward zero)
        System.out.println((int) -3.99);   // -3

        // 2. int overflow wraps around silently
        int max = Integer.MAX_VALUE;
        System.out.println(max + 1);                   // -2147483648
        System.out.println((long) max + 1);            // 2147483648
        System.out.println(Math.addExact(1, 2));       // 3  (addExact throws on overflow instead)

        // 3. Integer division and remainder
        System.out.println(7 / 2);         // 3
        System.out.println(7 / 2.0);       // 3.5
        System.out.println(-7 / 2);        // -3  (rounds toward zero)
        System.out.println(-7 % 3);        // -1  (sign follows the left operand)
        System.out.println(7 % -3);        // 1
        System.out.println(Math.floorMod(-7, 3));   // 2  (always 0..2 for a positive divisor)

        // 4. Promotion: byte, short and char become int in arithmetic
        char ch = 'a';
        System.out.println(ch + 1);        // 98
        System.out.println("" + ch + 1);   // a1  (String concatenation, left to right)
        System.out.println(1 + 2 + "3");   // 33
    }
}
```

- 300 = `0001 0010 1100`; a byte keeps `0010 1100` = 44.
- `MAX_VALUE + 1` wraps to `MIN_VALUE`; cast to `long` before the operation or use `Math.addExact`.
- `%` takes the sign of the left operand; use `Math.floorMod` to wrap into 0..n−1.

```java
public class IncShort {

    static boolean check(String label) {
        System.out.println("  check " + label);
        return true;
    }

    public static void main(String[] args) {
        // 1. Compound assignment hides a cast
        byte b = 10;
        b += 1;                    // compiles: means b = (byte) (b + 1)
        // b = b + 1;              // error: incompatible types: possible lossy conversion from int to byte
        System.out.println(b);     // 11
        byte w = 127;
        w += 1;                    // the hidden cast wraps
        System.out.println(w);     // -128

        // 2. i++ returns the old value, ++i the new one
        int i = 5;
        int x = i++;               // x = 5, then i = 6
        int y = ++i;               // i = 7, then y = 7
        System.out.println(x + " " + y + " " + i);   // 5 7 7
        int k = 1;
        k = k++;                   // k++ yields 1, then that 1 is assigned back
        System.out.println(k);     // 1

        // 3. && short-circuits, & always evaluates both sides
        String s = null;
        System.out.println(s != null && s.length() > 0);   // false  (right side skipped)
        System.out.println(false && check("&&"));          // false  (nothing printed before it)
        System.out.println(false & check("&"));            //   check &
                                                           // false
    }
}
```

```java
import java.math.BigDecimal;

public class Money {

    public static void main(String[] args) {
        // double is binary floating point: 0.1 has no exact binary form
        System.out.println(0.1 + 0.2);                 // 0.30000000000000004
        System.out.println(0.1 + 0.2 == 0.3);          // false
        System.out.println(Math.abs(0.1 + 0.2 - 0.3) < 1e-9);   // true  (compare with a tolerance)

        // BigDecimal is exact decimal arithmetic: build it from a String
        BigDecimal a = new BigDecimal("0.1");
        BigDecimal b = new BigDecimal("0.2");
        System.out.println(a.add(b));                  // 0.3
        System.out.println(new BigDecimal(0.1));       // 0.1000000000000000055511151231257827021181583404541015625
        System.out.println(BigDecimal.valueOf(0.1));   // 0.1  (uses Double.toString)

        // Division by zero: int throws, double gives Infinity or NaN
        System.out.println(1.0 / 0);                   // Infinity
        System.out.println(0.0 / 0);                   // NaN
        try {
            System.out.println(1 / 0);
        } catch (ArithmeticException e) {
            System.out.println(e.getMessage());        // / by zero
        }
    }
}
```

**Common mistakes:** `(lo + hi) / 2` overflow (use `lo + (hi - lo) / 2`); `sum / count` with ints truncates before assigning to a double; `k = k++`; `new BigDecimal(0.1)`; `==` on doubles.

**Real-world:** money is `BigDecimal` or a `long` of cents; millisecond timestamps need `long` (an `int` overflows after ≈ 24.8 days of ms).

**Interview answer:** "Widening is implicit and safe; narrowing needs a cast and keeps the low bits or truncates. Integer arithmetic is at least `int` and overflows silently, so I use `long` or `Math.addExact` where it matters. Compound operators include a hidden cast, which is why `b += 1` compiles for a byte but `b = b + 1` doesn't. For money I use `BigDecimal` from a String."

**Follow-ups:** `Integer.MIN_VALUE == -Integer.MIN_VALUE` → `true` (and `Math.abs(MIN_VALUE)` is negative, verified). `&` vs `&&`: `&&` short-circuits. `1.0 / 0` → `Infinity`; `1 / 0` throws.

---

### 4. Control flow: if, switch and loops

**In 30 seconds:** `if/else` branches; `switch` picks a case; `for`, `while`, `do-while` and enhanced `for` repeat. Classic `switch` falls through without `break`; the arrow form (Java 14+) never does and can return a value; Java 21 adds pattern matching.

| | Classic `case X:` | Arrow `case X ->` (Java 14+) |
|---|---|---|
| Fall-through | Yes, until `break` | Never |
| Several labels | `case 1: case 2:` | `case 1, 2 ->` |
| Returns a value | No | Yes (switch expression; `yield` in a block) |
| Exhaustive | No | A switch expression must be |
| Types | `int` and smaller, `char`, wrappers, `String`, enums; any reference type with patterns (21+) | same |

```java
public class Switches {

    // Classic switch: without break, execution falls through
    static void classic(int day) {
        switch (day) {
            case 1:
                System.out.print("Mon ");
            case 2:
                System.out.print("Tue ");
                break;
            default:
                System.out.print("Other ");
        }
        System.out.println();
    }

    // Switch expression (Java 14+): arrows, no fall-through, returns a value
    static String kind(int day) {
        return switch (day) {
            case 6, 7 -> "weekend";
            case 1, 2, 3, 4, 5 -> {
                String s = "week";
                yield s + "day";            // yield returns a value from a block
            }
            default -> throw new IllegalArgumentException("bad day " + day);
        };
    }

    // Pattern matching for switch (Java 21+)
    static String describe(Object o) {
        return switch (o) {
            case null -> "null";
            case Integer n when n > 100 -> "big int " + n;
            case Integer n -> "int " + n;
            case String s -> "string of length " + s.length();
            default -> "something else";
        };
    }

    public static void main(String[] args) {
        classic(1);                         // Mon Tue
        classic(2);                         // Tue
        classic(9);                         // Other
        System.out.println(kind(6));        // weekend
        System.out.println(kind(3));        // weekday
        System.out.println(describe(500));  // big int 500
        System.out.println(describe(5));    // int 5
        System.out.println(describe("hi")); // string of length 2
        System.out.println(describe(null)); // null
    }
}
```

```java
public class Loops {

    public static void main(String[] args) {
        // for: when you know the count
        for (int i = 0; i < 3; i++) {
            System.out.print(i + " ");
        }
        System.out.println();                         // 0 1 2

        // while: when you loop until a condition changes
        int n = 37, digits = 0;
        while (n > 0) {
            n /= 10;
            digits++;
        }
        System.out.println(digits);                   // 2

        // do-while: the body runs at least once
        int tries = 0;
        do {
            tries++;
        } while (tries < 0);
        System.out.println(tries);                    // 1

        // enhanced for: read every element, no index
        int sum = 0;
        for (int v : new int[]{4, 5, 6}) {
            sum += v;
        }
        System.out.println(sum);                      // 15

        // continue skips one iteration; a labeled break leaves the outer loop
        int[][] grid = {{1, 2, 3}, {4, -1, 6}, {7, 8, 9}};
        outer:
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[r].length; c++) {
                if (grid[r][c] % 2 == 0) continue;    // skip even numbers
                if (grid[r][c] < 0) {
                    System.out.println("negative at " + r + "," + c);
                    break outer;                      // stops both loops
                }
                System.out.print(grid[r][c] + " ");
            }
        }
        // 1 3 negative at 1,1     (7, 8 and 9 are never visited)
    }
}
```

| Loop | Use it when |
|---|---|
| `for (init; cond; step)` | You know the count or need the index |
| `while (cond)` | Loop until something changes |
| `do { } while (cond);` | Body must run at least once |
| `for (T x : items)` | Read every element; no index; don't remove from a list inside it |

**Common mistakes:** missing `break`; `switch` on a `null` String → NPE (unless `case null`, Java 21+; verified); `i <= arr.length`; modifying a list in an enhanced `for` (`ConcurrentModificationException`); `if (x);`.

---

### 5. Methods, overloading, scope and recursion

**In 30 seconds:** a method has parameters and a return type; its **signature** is name + parameter types (not the return type). Overloading = same name, different parameters, resolved at compile time. Every call pushes a stack frame; recursion without a base case overflows the stack.

```
public static  int    add( int a, int b )  throws …  { … }
modifiers      return name  parameters        exceptions  body
signature = add(int, int) · a call add(2, 3) passes the arguments 2 and 3
```

```java
public class Overload {

    static void show(long x)      { System.out.println("long " + x); }
    static void show(Integer x)   { System.out.println("Integer " + x); }
    static void show(int... x)    { System.out.println("varargs " + x.length); }

    static void pick(double d)    { System.out.println("double"); }
    static void pick(Object o)    { System.out.println("Object"); }

    public static void main(String[] args) {
        // The compiler picks the overload in 3 phases:
        // 1. no boxing, no varargs (exact match or widening)
        // 2. boxing allowed       3. varargs allowed
        show(5);           // long 5      (int widens to long in phase 1)
        show(5L);          // long 5      (exact match)
        show(5, 6);        // varargs 2   (only varargs fits two arguments)
        show();            // varargs 0

        pick(5);           // double      (widening beats boxing to Integer -> Object)
        pick("hi");        // Object
        pick('a');         // double      (char widens to double)

        // Scope: a variable declared in a block exists only inside it
        int count = 1;
        {
            int inner = count + 1;   // inner exists only inside this block
            System.out.println(inner);   // 2
        }
        // System.out.println(inner);    // error: cannot find symbol
    }
}
```

Overload resolution has three phases, stopping at the first that matches: (1) exact or widening, no boxing; (2) boxing allowed; (3) varargs. Within a phase the most specific method wins. Two methods differing only in return type → *method add(int) is already defined* (verified).

```
1 main     2 f(3)     3 f(2)     4 f(1) base     5 unwind
                                  f(1) n=1 → 1     f(1) → 1
                       f(2) n=2   f(2) n=2         f(2) → 2 × 1 = 2
            f(3) n=3   f(3) n=3   f(3) n=3         f(3) → 3 × 2 = 6
main        main       main       main             main gets 6
```

```java
public class Recursion {

    static int depth = 0;

    // n! = n * (n-1)!, with 0! = 1 as the base case
    static long factorial(int n) {
        System.out.println("  ".repeat(3 - n) + "push factorial(" + n + ")");
        long result = (n <= 1) ? 1 : n * factorial(n - 1);
        System.out.println("  ".repeat(3 - n) + "pop  factorial(" + n + ") = " + result);
        return result;
    }

    // No base case: every call adds a frame until the stack is full
    static void forever() {
        depth++;
        forever();
    }

    public static void main(String[] args) {
        System.out.println(factorial(3));
        // push factorial(3)
        //   push factorial(2)
        //     push factorial(1)
        //     pop  factorial(1) = 1
        //   pop  factorial(2) = 2
        // pop  factorial(3) = 6
        // 6

        try {
            forever();
        } catch (StackOverflowError e) {
            System.out.println("StackOverflowError after " + (depth > 1000 ? "thousands of" : "a few") + " frames");
            // StackOverflowError after thousands of frames
        }
    }
}
```

The depth before `StackOverflowError` depends on `-Xss`, frame size and the JIT.

**Common mistakes:** return type alone doesn't overload; overloading uses compile-time types; no reachable base case; deep recursion (no tail-call optimisation in Java); catching `StackOverflowError` as control flow.

**Interview answer:** "A signature is name plus parameter types. Overloading is resolved at compile time: exact or widening first, then boxing, then varargs. Each call creates a stack frame for parameters and locals; recursion stacks frames until a base case returns, and too many frames give a `StackOverflowError`, which is an `Error`, not an `Exception`."

**Follow-ups:** overloading vs overriding (compile time vs run time); can `main` be overloaded (yes; the launcher calls `main(String[])`, and Java 25 also accepts an instance `main()`); SOE vs OOME (stack vs heap/Metaspace).

---

### 6. Pass-by-value: what really happens to arguments

**In 30 seconds:** Java always passes a copy of the variable. For a primitive, the number; for an object, a copy of the reference. The method can change the object, but not which object the caller's variable points to.

**Analogy:** a photocopy of your house address. Your friend can repaint the house; crossing out their copy doesn't move your house.

```java
public class PassByValue {

    static class Account {
        int balance;
        Account(int balance) { this.balance = balance; }
    }

    static void addTen(int x) {            // x is a copy of the int
        x += 10;
    }

    static void deposit(Account acc) {     // acc is a copy of the reference
        acc.balance += 10;                 // follows the copy to the SAME object
    }

    static void replace(Account acc) {
        acc = new Account(999);            // moves only the copy
    }

    static void swap(Account p, Account q) {
        Account t = p;
        p = q;
        q = t;                             // swaps the copies, not the caller's variables
    }

    static void grow(StringBuilder sb, String s) {
        sb.append("!");                    // mutates the shared object
        s = s + "!";                       // creates a new String; the caller never sees it
    }

    public static void main(String[] args) {
        int n = 5;
        addTen(n);
        System.out.println(n);                         // 5

        Account a = new Account(100);
        deposit(a);
        System.out.println(a.balance);                 // 110

        replace(a);
        System.out.println(a.balance);                 // 110

        Account b = new Account(1);
        swap(a, b);
        System.out.println(a.balance + " " + b.balance);   // 110 1

        StringBuilder sb = new StringBuilder("hi");
        String s = "hi";
        grow(sb, s);
        System.out.println(sb + " " + s);              // hi! hi
    }
}
```

- `addTen`: separate int. `deposit`: same object through a copied reference. `replace`/`swap`: only the copies move. `grow`: `StringBuilder` mutates; `String` makes a new object.
- The array version of this rule is in Lesson 04, section 8.

**Common mistakes:** "objects are passed by reference"; expecting reassignment of a `String`/`Integer` parameter to affect the caller; forgetting a method can mutate a list or array you pass (make a defensive copy).

**Interview answer:** "Java is strictly pass-by-value. For objects the value is a reference, so a method can mutate the object through its copy, but reassigning the parameter only changes the local copy. A `swap(a, b)` method can't swap the caller's variables."

---

### 7. Packages, imports, input/output and the command line

**In 30 seconds:** a package groups classes and matches a folder (`com.shop.util` → `com/shop/util/`). `import` only saves typing; `java.lang` is automatic. Programs start in `main(String[] args)`, read with `Scanner` or `BufferedReader`, and write to `System.out` / `System.err`.

```java
import java.util.Scanner;
import static java.lang.Math.max;          // static import: call max(...) without "Math."

public class Greet {

    public static void main(String[] args) {
        // 1. Command-line arguments: java Greet.java Asha 3
        String who = args.length > 0 ? args[0] : "world";
        System.out.println("Hello, " + who);            // Hello, world   (no arguments)

        // 2. Scanner splits input into tokens. Here it reads a String; use System.in for the keyboard.
        Scanner in = new Scanner("Ravi 41\n7 9");
        String name = in.next();
        int age = in.nextInt();
        int best = max(in.nextInt(), in.nextInt());
        System.out.println(name + " is " + age + ", best " + best);   // Ravi is 41, best 9

        // 3. Two output streams: out for results, err for problems
        System.out.println("result");                   // result
        System.err.println("warning: demo only");       // warning: demo only  (on stderr)
    }
}
```

```
src/com/shop/util/Prices.java   package com.shop.util;  public class Prices { public static double withTax(double p) … }
src/com/shop/app/Main.java      package com.shop.app;   import com.shop.util.Prices; … Prices.withTax(100)

javac -d out src/com/shop/util/Prices.java src/com/shop/app/Main.java
java -cp out com.shop.app.Main
118.0
```

| Tool | Good for | Notes |
|---|---|---|
| `Scanner` | Small programs, tokens | Easy but slower; `nextInt()` then `nextLine()` leaves the newline |
| `BufferedReader` | Large input, files | `readLine()` (null at end), parse yourself, throws `IOException` |
| `System.out` / `System.err` | Results / diagnostics | Separate streams; can be redirected separately; may interleave |
| `import static` | Constants, helpers | Use sparingly |

**Common mistakes:** package line ≠ folder; `java Main` instead of `java -cp out com.shop.app.Main`; thinking `import java.util.*` costs anything at run time; reading `args[0]` without checking `args.length`.

**Real-world:** Maven/Gradle run `javac`, layout `src/main/java/...`, SLF4J/Logback replace `System.out`.

---

### 8. Foundations: interview questions and review

1. **JDK vs JRE vs JVM?** JVM runs bytecode; JRE = JVM + libraries; JDK = JRE + tools.
2. **Why platform independent?** Bytecode, not machine code; the JVM is platform-specific.
3. **What does the JIT do?** Compiles hot methods to optimised native code at run time.
4. **8 primitives and sizes?** byte 8, short 16, int 32, long 64, float 32, double 64, char 16 (unsigned), boolean (unspecified).
5. **Why `Integer 128 == Integer 128` is false?** `valueOf` caches only −128..127; `==` compares references.
6. **Do locals get defaults?** No; fields and array elements do.
7. **Why `b += 1` compiles but `b = b + 1` doesn't?** Compound assignment includes a cast.
8. **`Integer.MAX_VALUE + 1`?** `Integer.MIN_VALUE`: overflow wraps.
9. **Why not `double` for money?** Binary floating point; use `BigDecimal` from a String or `long` cents.
10. **Switch statement vs expression?** Expression: `->`, no fall-through, exhaustive, returns a value (`yield`).
11. **How is an overload chosen?** Exact/widening → boxing → varargs, most specific wins, compile-time types.
12. **Pass-by-value or reference?** Always by value; for objects the value is a reference.

**5 takeaways**

- `javac` → bytecode → JVM (class loader, verifier, interpreter, JIT). Bytecode is portable; the JVM is not.
- 8 primitives hold values; everything else is a reference. Locals have no defaults.
- Wrappers cache −128..127: compare with `equals`, never unbox a possible `null`.
- Arithmetic is at least `int`, overflow wraps, `/` truncates, `%` follows the left sign, money is `BigDecimal`.
- Overloading is compile time; every call is a stack frame; Java passes copies, including copies of references.

**Check yourself:** the page has a 12-question quiz (`QZ.l00`) and spaced-recall prompts (`RC.l00`, after 1, 3 and 7 days).

---

## Lesson 05 — Object-Oriented Programming: Classes, the Four Pillars, Modern Types

*Level 2 of the roadmap. You already know that objects live on the heap and variables hold references (Lesson 00). Here you learn to design your own types: how an object is built, how to hide its state, when to inherit and when to compose, how Java decides which method runs, and the contracts every class signs with `Object`. It has 10 sections, 14 verified programs, 2 figures, 13 interactive concept labs (including the Car Factory and the town clock), 2 step-through runs, 15 interview questions and a 12-question quiz. On the page: `lessons/05-oop.html`, band `#oop`, sections P1–P10; all programs run on JDK 25.*

### Table of Contents

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

#### Concept labs (interactive, added 2026-10-22)

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

### 1. Classes and objects: the blueprint and the thing

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

#### Watch it run

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

### 2. Constructors and initialisation order

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

### 3. Encapsulation, access modifiers and immutable classes

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

#### Immutable classes

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

### 4. static members and nested classes

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

#### Nested classes

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

### 5. Inheritance, super, and composition over inheritance

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

#### Composition over inheritance

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

### 6. Polymorphism: overloading vs overriding

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

#### Watch it run

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

#### The constructor trap

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

### 7. Abstraction: abstract classes vs interfaces

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

### 8. The Object class: equals, hashCode and toString

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

### 9. Modern OOP: records, enums and sealed types

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

### 10. OOP: interview questions and review

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

#### 5 takeaways

- A class is loaded once; each `new` makes a heap object with its own fields; variables only hold references.
- Initialisation runs static (once, parent first), then parent's instance part, then child's; constructors chain through `this(…)`/`super(…)`.
- Encapsulate behaviour, not just fields; immutability = final class + private final fields + defensive copies.
- Overloads are picked by `javac` from declared types; overrides by the JVM from the object's class; fields and statics are never polymorphic.
- Prefer interfaces and composition; override `equals` and `hashCode` together; reach for records, enums and sealed types first.

#### Check yourself

The 12-question quiz is in "Practice layer" → "Lesson 05 quiz" (`QZ.l05` in `course.js`).

## Lesson 06 — Sorting: Every Interview Sort, then Bubble Sort in Depth

*This lesson opens the sorting series. **B0, the Sorting explorer**, covers all 11 interview sorts and 38 of their types with verified Java and a live visual for each. The sections after it **follow the sort you pick**: each sort has its own idea and dry run, every type in Java, complexity, and interview review; bubble sort has the deepest set, B1–B14. Bubble sort is the slowest sort you will ever write, and that is why it is the right one to start with: every idea you need for the others (passes, invariants, comparisons vs swaps, best/average/worst case, stability, in-place, recursion depth, adaptivity) shows up here in its simplest form. It has 15 sections (start with the B0 explorer), 15 verified programs, the Bubble Lab (11 variants with live code, counters and a call stack), a valet-parking analogy, a stability lab, an inversions grid, a complexity chart, a variant race, 15 interview questions and a 12-question quiz.*

Page: `lessons/06-bubble-sort.html`, band `#bsort`. Sections: B0 the Sorting explorer (always shown), then one set per sort, shown only while that sort is picked in the explorer (`data-sort`): bubble B1–B14 (ids `bs-*`), and for the other ten sorts SL (selection), IN (insertion), MG (merge), QK (quick), HP (heap), CT (counting), RX (radix), BK (bucket), CY (cyclic), DF (Dutch National Flag), each with the idea and a dry run, every type in Java (multi-type sorts), complexity, and interview problems / mistakes / questions / takeaways. Added on 2026-10-22 (user: "sortings are not there but i need one bubble sort first in all various way … recursion brute force all types and also visualization with time and space complexity"; then "all give there" for every interview sort, and "it should show" the selected sort's content instead of bubble sort). Every program was run on JDK 25; every count the labs show is checked against these programs (headless test).

### Table of Contents

1. B0 · Sorting explorer: every interview sort
2. O(n) · Time and space complexity: from scratch to advanced
3. B1 · What sorting is, and the idea behind bubble sort
4. B2 · Dry run by hand: [5, 1, 4, 2, 8]
5. B3 · V1 · Brute force: always n − 1 full sweeps
6. B4 · V2 · Standard: shrink the inner loop
7. B5 · V3 · Optimized: the swapped flag (early exit)
8. B6 · V4 · Last-swap boundary: shrink by many slots at once
9. B7 · V5 · The while and do-while forms
10. B8 · V6 · Recursive bubble sort
11. B9 · V7 · Fully recursive: no loops at all
12. B10 · V8 · Generic, descending, and stable bubble sort
13. B11 · The family: cocktail shaker, odd–even and comb sort
14. B12 · Special cases: linked lists, inversions, top-k and swap traps
15. B13 · Time and space complexity: the master table
16. B14 · Bubble sort: mistakes, interview questions and review
17. SL1 · Selection sort: the idea and a dry run
18. SL2 · Selection sort: every type in Java
19. SL3 · Selection sort: time and space complexity
20. SL4 · Selection sort: interview problems, mistakes and questions
21. IN1 · Insertion sort: the idea and a dry run
22. IN2 · Insertion sort: every type in Java
23. IN3 · Insertion sort: time and space complexity
24. IN4 · Insertion sort: interview problems, mistakes and questions
25. MG1 · Merge sort: the idea and a dry run
26. MG2 · Merge sort: every type in Java
27. MG3 · Merge sort: time and space complexity
28. MG4 · Merge sort: interview problems, mistakes and questions
29. QK1 · Quick sort: the idea and a dry run
30. QK2 · Quick sort: every type in Java
31. QK3 · Quick sort: time and space complexity
32. QK4 · Quick sort: interview problems, mistakes and questions
33. HP1 · Heap sort: the idea and a dry run
34. HP2 · Heap sort: every type in Java
35. HP3 · Heap sort: time and space complexity
36. HP4 · Heap sort: interview problems, mistakes and questions
37. CT1 · Counting sort: the idea and a dry run
38. CT2 · Counting sort: every type in Java
39. CT3 · Counting sort: time and space complexity
40. CT4 · Counting sort: interview problems, mistakes and questions
41. RX1 · Radix sort: the idea and a dry run
42. RX2 · Radix sort: time and space complexity
43. RX3 · Radix sort: interview problems, mistakes and questions
44. BK1 · Bucket sort: the idea and a dry run
45. BK2 · Bucket sort: time and space complexity
46. BK3 · Bucket sort: interview problems, mistakes and questions
47. CY1 · Cyclic sort: the idea and a dry run
48. CY2 · Cyclic sort: time and space complexity
49. CY3 · Cyclic sort: interview problems, mistakes and questions
50. DF1 · Dutch National Flag: the idea and a dry run
51. DF2 · Dutch National Flag: time and space complexity
52. DF3 · Dutch National Flag: interview problems, mistakes and questions

#### Visual labs (interactive)

All are built by the "Bubble sort labs (v28)" block in `course.js` (one tracer `T` with `cmp/swap/mark` that counts and snapshots frames; `window.BUBBLE` is the test hook). Every lab honours reduced motion and the ⏸ switch.

| Section | Lab | What it shows |
|---|---|---|
| B0 | `#bsPath` | Learning path: 12 steps (basics, bubble, selection, insertion, merge, quick, heap, counting, radix, bucket, cyclic, Dutch flag) with a progress bar, Start/Continue, click a step to open that sort, tick to mark done (js1-path); every sort ends with a Next in the path button |
| B0 | `#bsMoves` | The three moves of every sort: Compare (reads, changes nothing), Swap with a temporary glass t (and Try it without t: the 7 is lost, [3, 3]), Shift (insert 4 into [2, 5, 8]: two shifts, then drop the key); the Java line of each step is highlighted |
| B0 | `#bsx` | Sorting explorer: Sort dropdown with 11 families (bubble, selection, insertion, merge, quick, heap, counting, radix, bucket, cyclic, Dutch National Flag) + Compare all sorts; Type dropdown and chips; idea, Best/Average/Worst/Space/Stable/Adaptive cards, key points, interview problems, work done, when to use; a lab locked to that type (data-novar) stepping through the verified Java; choice saved in js1-bsx |
| O(n) | `#cxLoops` | Watch the loops count: pick a loop pattern (single, two in a row, nested, triangular, halving, loop × halving, halving outer + linear inner, constant inner) and n; every ops++ lights one grid cell; counts for n = 10 … 10,000 and the doubling ratio |
| O(n) | `#cxGrow` | Growth chart: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n!) for n ≤ 10/20/100, linear or log scale, hover values; a How long would it take? table for n = 10 … 10⁹ at 10⁸ steps per second |
| O(n) | `#cxAmort` | Amortized O(1): an ArrayList growing ×1.5 (Java), ×2 or +10; one bar per add (red = resize copy), running average line, resizes, copies, average cost per add |
| O(n) | `#cxTree` | Recursion tree: factorial, naive and memoized Fibonacci, binary search, merge sort; calls play in depth-first order with the current call stack highlighted; calls, work, stack now and max depth |
| B1 | `#anValet` | Valet parking analogy: cars of different lengths, the valet compares neighbours, swaps, and parks the longest at the end of each walk |
| B1 | `#bsLab` | Bubble Lab: all 11 variants; bars with j/j+1 pointers, green parked zone, the current Java line, counters (pass, comparisons, swaps, wasted, stack depth, gap), call stack for V6/V7; inputs random/sorted/nearly/reversed/duplicates/turtle/your numbers |
| B2 | `#bsLabDry` | Bubble Lab on `flag` |
| B3 | `#bsLabBrute` | Bubble Lab on `brute` |
| B4 | `#bsLabStd` | Bubble Lab on `standard` |
| B5 | `#bsLabFlag` | Bubble Lab on `flag` |
| B6 | `#bsLabLast` | Bubble Lab on `lastswap` |
| B7 | `#bsLabDo` | Bubble Lab on `dowhile` |
| B8 | `#bsLabRec` | Bubble Lab on `rec` |
| B9 | `#bsLabFull` | Bubble Lab on `fullrec` |
| B10 | `#bsStable` | Stability lab: [2A, 1A, 2B, 3A, 1B, 2C] sorted with `>` (stable, 5 swaps) or `>=` (order lost); verdict per value group |
| B11 | `#bsLabShaker` | Bubble Lab on `shaker` |
| B11 | `#bsLabOddEven` | Bubble Lab on `oddeven` |
| B11 | `#bsLabComb` | Bubble Lab on `comb` |
| B12 | `#bsInv` | Inversions grid: lower-triangle grid of value pairs, lit while the bigger value stands first; each swap switches off exactly one cell; inversions left + swaps done stays constant |
| B13 | `#bsChart` | Complexity chart: measured comparisons or swaps for n = 4 … 64 for V1, V2, V3, V4, V9, V11 on random (average of 5), sorted, nearly sorted or reversed input, with dashed n, n²/2, n² reference curves, linear/log scale, hover tooltip, number table |
| B13 | `#bsRace` | Variant race: six lanes (V1, V2, V3, V4, V9, V11) on the same data, one comparison per lane per tick, finish order and a verdict per input type |

### 1. Sorting explorer: every interview sort

Start here. Choose the **sort**, then its **type**. Its idea, its time and space cost, the key points, the interview problems that use it and a live visual of that exact Java code appear below. The list covers everything asked in MAANG-style interviews:

- **Must know:** merge sort (top-down, bottom-up, inversion count, the TimSort idea), quick sort (Lomuto, Hoare, random pivot, 3-way, Quickselect), heap sort (3 ways), counting sort and bucket sort.
- **Should know:** insertion sort (shifting, swapping, binary, recursive, Shell sort), selection sort (standard, stable, double-ended, recursive), cyclic sort and the Dutch National Flag.
- **Basics and theory:** bubble sort (11 types, the rest of this lesson) and radix sort.

Every Java method shown was compiled on JDK 25 and checked against `Arrays.sort` on 3,000 random arrays. Pick **★ Compare all sorts** for one table of every algorithm.

**The rest of this lesson follows your choice.** Pick **Merge sort** and the sections below, and the sidebar, switch to merge sort: the idea and a dry run, every type in Java, the time and space complexity, and its interview problems, mistakes and questions. Pick **Bubble sort** to get B1–B14. Every **Full section →** link and every **▶ See it** button jumps between the two.

#### Start here: your learning path

New to sorting? Follow these 12 steps in order. Each step opens the right sections below; finish a step with the **Next in the path** button at its end (or tick it here). Your progress is saved in this browser.

*[Visual `#bsPath`: Learning path: 12 steps (basics, bubble, selection, insertion, merge, quick, heap, counting, radix, bucket, cyclic, Dutch flag) with a progress bar, Start/Continue, click a step to open that sort, tick to mark done (js1-path); every sort ends with a Next in the path button.]*

#### Before you start: the three moves of every sort

Every algorithm in this lesson is built from three moves on an array: **compare** two values, **swap** two values, and **shift** (write) a value into another slot. Play each tab until it feels obvious; then the sorts are just these moves in a clever order.

*[Visual `#bsMoves`: The three moves of every sort: Compare (reads, changes nothing), Swap with a temporary glass t (and Try it without t: the 7 is lost, [3, 3]), Shift (insert 4 into [2, 5, 8]: two shifts, then drop the key); the Java line of each step is highlighted.]*

#### The Sorting explorer

*[Visual `#bsx`: Sorting explorer: Sort dropdown with 11 families (bubble, selection, insertion, merge, quick, heap, counting, radix, bucket, cyclic, Dutch National Flag) + Compare all sorts; Type dropdown and chips; idea, Best/Average/Worst/Space/Stable/Adaptive cards, key points, interview problems, work done, when to use; a lab locked to that type (data-novar) stepping through the verified Java; choice saved in js1-bsx.]*

#### Every interview sort in the explorer (v30, 2026-10-22)

The user asked which sorts MAANG interviews need, then said "all give there": every one is now a family in the explorer's **Sort** dropdown, each with its **types**, cost cards, key points, interview problems and a lab that steps through the exact Java below. `Sorts.java` was compiled on JDK 25; `main` checks every sort against `Arrays.sort` on 3,000 random arrays, Quickselect for every k, and the inversion count against brute force: all 28 checks print `ok`. The `// @v name` … `// @end` blocks are copied into `course.js` (`SRC`, by the patch script) and the `/*@key*/` markers tell the lab which line runs.

| Sort (tier) | Types in the explorer | Best / Avg / Worst · Space · Stable | Interview problems |
|---|---|---|---|
| Bubble (basics) | the 11 types of this lesson | n / n² / n² · 1 · yes | is it sorted, adjacent swaps = inversions |
| Selection (should know) | standard, stable (shift), double (min + max), recursive | n² / n² / n² · 1 · no | fewest swaps; why unstable ([2A, 2B, 1] → [1, 2B, 2A]) |
| Insertion (should know) | shifting, swapping, binary insertion, recursive, Shell sort | n / n² / n² · 1 · yes | Insertion Sort List (147), k-sorted array, why libraries use it for small runs |
| Merge (must know) | top-down, bottom-up, + counting inversions, TimSort idea (RUN = 4) | n log n always · n · yes | Sort List (148), Merge k Lists (23), inversions, 315, 493, 88 |
| Quick (must know) | Lomuto, Hoare, random pivot, 3-way, Quickselect | n log n / n log n / n² · log n stack · no | Kth Largest (215), Sort an Array (912), K Closest (973), Wiggle Sort II (324) |
| Heap (must know) | sift-down (bottom-up build O(n)), recursive heapify, build by sift-up (O(n log n)) | n log n always · 1 · no | 215 with a size-k heap, Top K Frequent (347), Median Stream (295), 23, Meeting Rooms II (253) |
| Counting (must know) | simple, stable (prefix sums) | n + k · k · stable version yes | anagrams (int[26]), H-Index (274), 451, 1122 |
| Radix (good to know) | LSD base 10 | d·(n + b) · n + b · yes | Maximum Gap (164), fixed-width keys |
| Bucket (must know) | n buckets over 0..99 | n + k avg, n² worst · n + k · yes* | Top K Frequent (347) in O(n), 164 |
| Cyclic (should know) | values 1..n | n · 1 · no | 268, 287, 41, 442 |
| Dutch National Flag (should know) | 0/1/2 with lo, mid, hi | n · 1 · no | Sort Colors (75), 3-way partition |

Lab additions for these (block "every interview sort (v30)" + the v30 lab in `course.js`, CSS `/* every interview sort v30 */`): bars drawn by position for sorts that write (blue = written), purple pivot, dimmed bars outside the active range, extra pointers (`i, j, min, lo, mid, hi, lt, gt, k, target`), helper panels (`tmp` with i/j for merge, `count[]`/`out` for counting sort, buckets for radix/bucket sort, the lifted-out `key` for insertion), a heap tree for heap sort, counters for writes/inversions/heap passes. `prep` adapts any input to what the sort needs (ranks 1..n for cyclic sort, 0/1/2 for the flag, 0..9 for counting, 3-digit values for radix). "★ Compare all sorts" in the Sort list shows one table; "All" in a family compares its types. Headless test: every type sorts 120 random inputs correctly, every animation step maps to a Java line, stability claims checked (insertion, merge, stable selection stable; selection unstable), inversions of [5,1,4,2,8,7,3,6] = 11 and Quickselect k = 3 → 4 (both as in Java).

```java
import java.util.*;

// Every sort shown in the Sorting explorer. Blocks between "// @v name" and "// @end" are copied to the page as-is
// (the /*@key*/ markers are stripped; they tell the visual which line is running). main() checks every sort
// against Arrays.sort on thousands of random arrays.
public class Sorts {

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    // @v selection
    static void selectionSort(int[] a) {
        int n = a.length;
        for (int i = 0; i < n - 1; i++) {                 /*@pass*/
            int min = i;                                   // find the smallest of a[i..n-1]
            for (int j = i + 1; j < n; j++)
                if (a[j] < a[min]) min = j;                /*@cmp*/
            if (min != i) swap(a, i, min);                 /*@swap*/
        }
    }
    // @end

    // @v selStable
    static void stableSelectionSort(int[] a) {
        for (int i = 0; i < a.length - 1; i++) {          /*@pass*/
            int min = i;
            for (int j = i + 1; j < a.length; j++)
                if (a[j] < a[min]) min = j;                /*@cmp*/
            int key = a[min];                              /*@key*/
            while (min > i) {                              // shift right instead of swapping:
                a[min] = a[min - 1];                       /*@shift*/
                min--;                                     // equal values keep their order
            }
            a[i] = key;                                    /*@place*/
        }
    }
    // @end

    // @v selDouble
    static void doubleSelectionSort(int[] a) {
        for (int lo = 0, hi = a.length - 1; lo < hi; lo++, hi--) {   /*@pass*/
            int min = lo, max = lo;
            for (int j = lo + 1; j <= hi; j++) {
                if (a[j] < a[min]) min = j;                /*@cmp*/
                if (a[j] > a[max]) max = j;                /*@cmp2*/
            }
            swap(a, lo, min);                              /*@swap*/
            if (max == lo) max = min;                      // the max was just moved to min's slot
            swap(a, hi, max);                              /*@swap2*/
        }
    }
    // @end

    // @v selRec
    static void selectionRec(int[] a, int i) {            /*@call*/
        if (i >= a.length - 1) return;                     /*@base*/
        int min = i;
        for (int j = i + 1; j < a.length; j++)
            if (a[j] < a[min]) min = j;                    /*@cmp*/
        if (min != i) swap(a, i, min);                     /*@swap*/
        selectionRec(a, i + 1);                            /*@recurse*/
    }
    // @end

    // @v insertion
    static void insertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {              /*@pass*/
            int key = a[i];                                /*@key*/
            int j = i - 1;
            while (j >= 0 && a[j] > key) {                 /*@cmp*/
                a[j + 1] = a[j];                           /*@shift*/
                j--;
            }
            a[j + 1] = key;                                /*@place*/
        }
    }
    // @end

    // @v insSwap
    static void insertionSortSwaps(int[] a) {
        for (int i = 1; i < a.length; i++)                /*@pass*/
            for (int j = i; j > 0 && a[j - 1] > a[j]; j--) /*@cmp*/
                swap(a, j - 1, j);                         /*@swap*/
    }
    // @end

    // @v insBinary
    static void binaryInsertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {              /*@pass*/
            int key = a[i], lo = 0, hi = i;                // find the first index whose value > key
            while (lo < hi) {
                int mid = (lo + hi) >>> 1;
                if (a[mid] <= key) lo = mid + 1;           /*@cmp*/
                else hi = mid;                             // <= keeps it stable
            }
            System.arraycopy(a, lo, a, lo + 1, i - lo);    /*@shift*/
            a[lo] = key;                                   /*@place*/
        }
    }
    // @end

    // @v insRec
    static void insertionRec(int[] a, int n) {           /*@call*/
        if (n <= 1) return;                                /*@base*/
        insertionRec(a, n - 1);                            /*@recurse*/
        int key = a[n - 1], j = n - 2;                     /*@key*/
        while (j >= 0 && a[j] > key) {                     /*@cmp*/
            a[j + 1] = a[j];                               /*@shift*/
            j--;
        }
        a[j + 1] = key;                                    /*@place*/
    }
    // @end

    // @v shell
    static void shellSort(int[] a) {
        for (int gap = a.length / 2; gap > 0; gap /= 2)   /*@gap*/
            for (int i = gap; i < a.length; i++) {         // insertion sort on every gap-th element
                int key = a[i], j = i;                     /*@key*/
                while (j >= gap && a[j - gap] > key) {     /*@cmp*/
                    a[j] = a[j - gap];                     /*@shift*/
                    j -= gap;
                }
                a[j] = key;                                /*@place*/
            }
    }
    // @end

    // @v mergeTD
    static void mergeSort(int[] a, int lo, int hi) {      /*@call*/
        if (lo >= hi) return;                              /*@base*/
        int mid = (lo + hi) >>> 1;
        mergeSort(a, lo, mid);                             /*@left*/
        mergeSort(a, mid + 1, hi);                         /*@right*/
        merge(a, lo, mid, hi);                             /*@merge*/
    }
    // @end

    // @v merge
    static void merge(int[] a, int lo, int mid, int hi) {
        int[] tmp = Arrays.copyOfRange(a, lo, hi + 1);     /*@copy*/
        int i = 0, j = mid - lo + 1, k = lo;               // i walks the left half, j the right
        while (i <= mid - lo && j <= hi - lo)
            a[k++] = tmp[i] <= tmp[j] ? tmp[i++] : tmp[j++];   /*@cmp*/
        while (i <= mid - lo) a[k++] = tmp[i++];           /*@restL*/
        while (j <= hi - lo) a[k++] = tmp[j++];            /*@restR*/
    }
    // @end

    // @v mergeBU
    static void mergeSortBottomUp(int[] a) {
        for (int width = 1; width < a.length; width *= 2) /*@pass*/
            for (int lo = 0; lo < a.length - width; lo += 2 * width) {
                int hi = Math.min(lo + 2 * width - 1, a.length - 1);
                merge(a, lo, lo + width - 1, hi);          /*@merge*/
            }
    }
    // @end

    // @v mergeInv
    static long countInversions(int[] a, int lo, int hi) {   /*@call*/
        if (lo >= hi) return 0;                               /*@base*/
        int mid = (lo + hi) >>> 1;
        long inv = countInversions(a, lo, mid)                /*@left*/
                 + countInversions(a, mid + 1, hi);           /*@right*/
        int[] tmp = Arrays.copyOfRange(a, lo, hi + 1);        /*@copy*/
        int i = 0, j = mid - lo + 1, k = lo;
        while (i <= mid - lo && j <= hi - lo) {
            if (tmp[i] <= tmp[j]) a[k++] = tmp[i++];          /*@cmp*/
            else {                                            // tmp[j] jumps over every left item still waiting:
                inv += mid - lo + 1 - i;                      /*@inv*/
                a[k++] = tmp[j++];                            // each of them is a bigger value before it
            }
        }
        while (i <= mid - lo) a[k++] = tmp[i++];              /*@restL*/
        while (j <= hi - lo) a[k++] = tmp[j++];               /*@restR*/
        return inv;
    }
    // @end

    // @v timLite
    static final int RUN = 4;                              // real TimSort: 32 to 64, and it finds natural runs
    static void timSortLite(int[] a) {
        int n = a.length;
        for (int lo = 0; lo < n; lo += RUN)                /*@pass*/
            insertionRange(a, lo, Math.min(lo + RUN - 1, n - 1));
        for (int width = RUN; width < n; width *= 2)       /*@pass2*/
            for (int lo = 0; lo < n - width; lo += 2 * width)
                merge(a, lo, lo + width - 1, Math.min(lo + 2 * width - 1, n - 1));   /*@merge*/
    }
    static void insertionRange(int[] a, int lo, int hi) {
        for (int i = lo + 1; i <= hi; i++) {
            int key = a[i], j = i - 1;                     /*@key*/
            while (j >= lo && a[j] > key) { a[j + 1] = a[j]; j--; }   /*@icmp*/
            a[j + 1] = key;                                /*@place*/
        }
    }
    // @end

    // @v quickL
    static void quickSort(int[] a, int lo, int hi) {      /*@call*/
        if (lo >= hi) return;                              /*@base*/
        int p = partition(a, lo, hi);                      /*@part*/
        quickSort(a, lo, p - 1);                           /*@left*/
        quickSort(a, p + 1, hi);                           /*@right*/
    }
    // @end

    // @v partition
    static int partition(int[] a, int lo, int hi) {       // Lomuto: the pivot is the last element
        int pivot = a[hi], i = lo;                         /*@pivot*/
        for (int j = lo; j < hi; j++)                      // a[lo..i-1] < pivot <= a[i..j-1]
            if (a[j] < pivot) swap(a, i++, j);             /*@cmp*/
        swap(a, i, hi);                                    /*@place*/
        return i;                                          // the pivot's final index
    }
    // @end

    // @v quickH
    static void quickSortHoare(int[] a, int lo, int hi) { /*@call*/
        if (lo >= hi) return;                              /*@base*/
        int pivot = a[(lo + hi) >>> 1], i = lo - 1, j = hi + 1;   /*@pivot*/
        while (true) {
            do i++; while (a[i] < pivot);                  /*@cmpI*/
            do j--; while (a[j] > pivot);                  /*@cmpJ*/
            if (i >= j) break;                             /*@cross*/
            swap(a, i, j);                                 /*@swap*/
        }
        quickSortHoare(a, lo, j);                          /*@left*/
        quickSortHoare(a, j + 1, hi);                      /*@right*/
    }
    // @end

    // @v quickR
    static final Random RNG = new Random();
    static void quickSortRandom(int[] a, int lo, int hi) { /*@call*/
        if (lo >= hi) return;                              /*@base*/
        swap(a, lo + RNG.nextInt(hi - lo + 1), hi);        /*@rand*/
        int p = partition(a, lo, hi);                      /*@part*/
        quickSortRandom(a, lo, p - 1);                     /*@left*/
        quickSortRandom(a, p + 1, hi);                     /*@right*/
    }
    // @end

    // @v quick3
    static void quickSort3Way(int[] a, int lo, int hi) {  /*@call*/
        if (lo >= hi) return;                              /*@base*/
        int pivot = a[lo], lt = lo, i = lo + 1, gt = hi;   /*@pivot*/
        while (i <= gt) {                                  // a[lo..lt-1] < pivot, a[lt..i-1] == pivot, a[gt+1..hi] > pivot
            if (a[i] < pivot) swap(a, lt++, i++);          /*@lt*/
            else if (a[i] > pivot) swap(a, i, gt--);       /*@gt*/
            else i++;                                      /*@eq*/
        }
        quickSort3Way(a, lo, lt - 1);                      /*@left*/
        quickSort3Way(a, gt + 1, hi);                      /*@right*/
    }
    // @end

    // @v qselect
    static int quickSelect(int[] a, int k) {              // the k-th smallest value, k counted from 0
        int lo = 0, hi = a.length - 1;
        while (lo < hi) {                                  /*@loop*/
            int p = partition(a, lo, hi);                  /*@part*/
            if (p == k) return a[k];                       /*@found*/
            if (p < k) lo = p + 1; else hi = p - 1;        /*@narrow*/
        }
        return a[k];                                       /*@found2*/
    }
    // @end

    // @v heap
    static void heapSort(int[] a) {
        int n = a.length;
        for (int i = n / 2 - 1; i >= 0; i--)              /*@build*/
            siftDown(a, i, n);                             // 1. build a max-heap bottom-up: O(n)
        for (int end = n - 1; end > 0; end--) {
            swap(a, 0, end);                               /*@swap*/
            siftDown(a, 0, end);                           /*@sift*/
        }
    }
    // @end

    // @v siftDown
    static void siftDown(int[] a, int i, int n) {         // push a[i] down until both children are smaller
        while (2 * i + 1 < n) {                            /*@loop*/
            int c = 2 * i + 1;                             // left child
            if (c + 1 < n && a[c + 1] > a[c]) c++;         /*@child*/
            if (a[i] >= a[c]) return;                      /*@cmp*/
            swap(a, i, c);                                 /*@down*/
            i = c;
        }
    }
    // @end

    // @v heapRec
    static void heapSortRec(int[] a) {
        for (int i = a.length / 2 - 1; i >= 0; i--) heapify(a, i, a.length);   /*@build*/
        for (int end = a.length - 1; end > 0; end--) {
            swap(a, 0, end);                               /*@swap*/
            heapify(a, 0, end);                            /*@sift*/
        }
    }
    static void heapify(int[] a, int i, int n) {          /*@call*/
        int big = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && a[l] > a[big]) big = l;               /*@child*/
        if (r < n && a[r] > a[big]) big = r;               /*@cmp*/
        if (big != i) {
            swap(a, i, big);                               /*@down*/
            heapify(a, big, n);                            /*@recurse*/
        }
    }
    // @end

    // @v heapUp
    static void heapSortSiftUp(int[] a) {
        for (int k = 1; k < a.length; k++) {              /*@insert*/
            int c = k;                                     // insert a[k] into the heap a[0..k-1]
            while (c > 0 && a[(c - 1) / 2] < a[c]) {       /*@cmp*/
                swap(a, c, (c - 1) / 2);                   /*@up*/
                c = (c - 1) / 2;
            }
        }
        for (int end = a.length - 1; end > 0; end--) {
            swap(a, 0, end);                               /*@swap*/
            siftDown(a, 0, end);                           /*@sift*/
        }
    }
    // @end

    // @v counting
    static void countingSort(int[] a, int max) {          // values 0..max
        int[] count = new int[max + 1];
        for (int x : a) count[x]++;                        /*@count*/
        int k = 0;
        for (int v = 0; v <= max; v++)
            while (count[v]-- > 0) a[k++] = v;             /*@write*/
    }
    // @end

    // @v countStable
    static int[] countingSortStable(int[] a, int max) {
        int[] count = new int[max + 1];
        for (int x : a) count[x]++;                        /*@count*/
        for (int v = 1; v <= max; v++)
            count[v] += count[v - 1];                      /*@prefix*/
        int[] out = new int[a.length];                     // count[v] = how many values are <= v
        for (int i = a.length - 1; i >= 0; i--)            // right to left keeps equal keys in order
            out[--count[a[i]]] = a[i];                     /*@place*/
        return out;
    }
    // @end

    // @v radix
    static void radixSort(int[] a) {                      // non-negative ints, least significant digit first
        int max = Arrays.stream(a).max().orElse(0);
        for (int exp = 1; max / exp > 0; exp *= 10) {      /*@digit*/
            int[] count = new int[10], out = new int[a.length];
            for (int x : a) count[(x / exp) % 10]++;
            for (int d = 1; d < 10; d++) count[d] += count[d - 1];
            for (int i = a.length - 1; i >= 0; i--)        // a stable counting sort on this digit
                out[--count[(a[i] / exp) % 10]] = a[i];    /*@place*/
            System.arraycopy(out, 0, a, 0, a.length);      /*@copy*/
        }
    }
    // @end

    // @v bucket
    static void bucketSort(int[] a, int max) {            // values 0..max, spread evenly
        int n = a.length;
        List<List<Integer>> buckets = new ArrayList<>();
        for (int b = 0; b < n; b++) buckets.add(new ArrayList<>());
        for (int x : a)
            buckets.get((int) ((long) x * n / (max + 1))).add(x);   /*@scatter*/
        int k = 0;
        for (List<Integer> b : buckets) {
            Collections.sort(b);                           /*@sortb*/
            for (int x : b) a[k++] = x;                    /*@gather*/
        }
    }
    // @end

    // @v cyclic
    static void cyclicSort(int[] a) {                     // values are 1..n
        int i = 0;
        while (i < a.length) {
            int target = a[i] - 1;                         /*@cmp*/
            if (a[i] != a[target]) swap(a, i, target);     /*@swap*/
            else i++;                                      /*@next*/
        }
    }
    // @end

    // @v dnf
    static void sortColors(int[] a) {                     // values 0, 1, 2 (LeetCode 75)
        int lo = 0, mid = 0, hi = a.length - 1;
        while (mid <= hi) {
            if (a[mid] == 0) swap(a, lo++, mid++);         /*@zero*/
            else if (a[mid] == 2) swap(a, mid, hi--);      /*@two*/
            else mid++;                                    /*@one*/
        }
    }
    // @end

    // ---------------- checks ----------------
    interface Sorter { void sort(int[] a); }

    static int fails = 0;
    static void check(String name, Sorter s, Random r, int maxV, boolean perm) {
        for (int t = 0; t < 3000; t++) {
            int n = r.nextInt(40);
            int[] a;
            if (perm) { a = new int[n]; for (int i = 0; i < n; i++) a[i] = i + 1; for (int i = n - 1; i > 0; i--) swap(a, i, r.nextInt(i + 1)); }
            else a = r.ints(n, 0, maxV + 1).toArray();
            int[] b = a.clone(), c = a.clone();
            Arrays.sort(b);
            s.sort(c);
            if (!Arrays.equals(b, c)) { fails++; System.out.println("FAIL " + name + " " + Arrays.toString(a) + " -> " + Arrays.toString(c)); return; }
        }
        System.out.println("ok   " + name);
    }

    public static void main(String[] args) {
        Random r = new Random(1);
        check("selection", Sorts::selectionSort, r, 99, false);
        check("stable selection", Sorts::stableSelectionSort, r, 9, false);
        check("double selection", Sorts::doubleSelectionSort, r, 99, false);
        check("recursive selection", a -> selectionRec(a, 0), r, 99, false);
        check("insertion", Sorts::insertionSort, r, 99, false);
        check("insertion (swaps)", Sorts::insertionSortSwaps, r, 9, false);
        check("binary insertion", Sorts::binaryInsertionSort, r, 9, false);
        check("recursive insertion", a -> insertionRec(a, a.length), r, 99, false);
        check("shell", Sorts::shellSort, r, 99, false);
        check("merge top-down", a -> mergeSort(a, 0, a.length - 1), r, 99, false);
        check("merge bottom-up", Sorts::mergeSortBottomUp, r, 99, false);
        check("merge + inversions", a -> countInversions(a, 0, a.length - 1), r, 9, false);
        check("timsort-lite", Sorts::timSortLite, r, 99, false);
        check("quick Lomuto", a -> quickSort(a, 0, a.length - 1), r, 99, false);
        check("quick Hoare", a -> quickSortHoare(a, 0, a.length - 1), r, 9, false);
        check("quick random", a -> quickSortRandom(a, 0, a.length - 1), r, 99, false);
        check("quick 3-way", a -> quickSort3Way(a, 0, a.length - 1), r, 3, false);
        check("heap", Sorts::heapSort, r, 99, false);
        check("heap recursive", Sorts::heapSortRec, r, 9, false);
        check("heap sift-up", Sorts::heapSortSiftUp, r, 99, false);
        check("counting", a -> countingSort(a, 9), r, 9, false);
        check("counting stable", a -> { int[] o = countingSortStable(a, 9); System.arraycopy(o, 0, a, 0, a.length); }, r, 9, false);
        check("radix", Sorts::radixSort, r, 999, false);
        check("bucket", a -> bucketSort(a, 99), r, 99, false);
        check("cyclic", Sorts::cyclicSort, r, 0, true);
        check("dutch flag", Sorts::sortColors, r, 2, false);

        // quickselect against the sorted array, for every k
        boolean qs = true;
        for (int t = 0; t < 3000 && qs; t++) {
            int[] a = r.ints(1 + r.nextInt(30), 0, 50).toArray(), s = a.clone();
            Arrays.sort(s);
            for (int k = 0; k < a.length; k++) if (quickSelect(a.clone(), k) != s[k]) { qs = false; break; }
        }
        System.out.println((qs ? "ok   " : "FAIL ") + "quickselect");
        if (!qs) fails++;

        // inversion count against brute force
        boolean ic = true;
        for (int t = 0; t < 3000 && ic; t++) {
            int[] a = r.ints(r.nextInt(30), 0, 20).toArray();
            long brute = 0;
            for (int i = 0; i < a.length; i++) for (int j = i + 1; j < a.length; j++) if (a[i] > a[j]) brute++;
            if (countInversions(a.clone(), 0, a.length - 1) != brute) ic = false;
        }
        System.out.println((ic ? "ok   " : "FAIL ") + "inversion count");
        if (!ic) fails++;

        int[] demo = {5, 1, 4, 2, 8, 7, 3, 6};
        System.out.println("inversions in " + Arrays.toString(demo) + " = " + countInversions(demo.clone(), 0, 7));
        System.out.println("median (k = 3) of " + Arrays.toString(demo) + " = " + quickSelect(demo.clone(), 3));
        System.out.println(fails == 0 ? "ALL OK" : fails + " FAILED");
    }
}
```

### 2. Time and space complexity: from scratch to advanced

**In 30 seconds:** **Time complexity** says how the number of steps an algorithm takes **grows** as the input size **n** grows; **space complexity** says how much **extra memory** it needs as n grows. We write it with **Big-O**, keeping only the fastest-growing term and dropping constants: 3n² + 5n + 2 is O(n²). The ladder to remember is O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!). Loops in a row **add**, loops inside loops **multiply**, halving gives **log n**, and recursion is solved with a **recursion tree**. Space counts new arrays and collections **and the call stack**.

**Why it exists:** a stopwatch measures your laptop, your JVM warm-up and today's background tasks, not the algorithm. Counting how the work *grows* lets you compare algorithms on paper, predict whether a solution will finish before you write it, and explain your choice in an interview. Every interviewer asks "what is the time and space complexity?" after every answer.

**Analogy (remember this one):** finding your car in a car park of n cars. **O(1)**: you know the bay number, so you walk straight to it (array index). **O(log n)**: bays are sorted by number plate, so you check the middle row and throw away half the car park each time (binary search). **O(n)**: you walk past every bay (linear search). **O(n log n)**: you first re-park every car in plate order (sorting). **O(n²)**: you compare every car with every other car to find two identical ones. **O(2ⁿ)**: you try every possible group of cars for a convoy.

> 💡 **Remember it:** Big-O is **how the walk grows when the car park grows**, not how fast you walk. Double the cars: O(n) walks twice as far, O(n²) four times, O(log n) only one step more.

#### Part 1 · What we measure: steps, not seconds

- **Input size n**: the length of the array or string, the number of nodes, or whatever grows. Say what n is; with two inputs use two letters (n and m, V and E).
- **A step** is any constant-time operation: an assignment, a comparison, `a[i]`, `x + y`, a method call that does a fixed amount of work. We don't care whether a step takes 1 ns or 3 ns.
- **Growth rate** is what matters: for n = 1,000,000 an O(n) loop does about a million steps (milliseconds); an O(n²) loop does a trillion (many minutes).
- **Rule of thumb**: Java does roughly **10⁸ simple steps per second**. Multiply your complexity by the input size limit to see if it fits a 1–2 second time limit.

#### Part 2 · Counting steps in code

Read the loops from the inside out: how many times does the innermost line run? The program counts it for real, and the lab below lets you watch each step happen.

| Pattern | Code shape | Exact count | Big-O |
|---|---|---|---|
| Single loop | `for (i = 0; i < n; i++)` | n | O(n) |
| Two loops in a row | loop, then another loop | n + n = 2n | O(n): sequential parts **add** |
| Nested loops | loop inside a loop | n · n | O(n²): nested parts **multiply** |
| Triangular nested | `for j = i + 1 … n − 1` | n(n − 1)/2 | O(n²): half of n² is still n² |
| Halving | `for (i = n; i > 0; i /= 2)` | ⌊log₂ n⌋ + 1 | O(log n) |
| Loop × halving | n-loop around a halving loop | n(⌊log₂ n⌋ + 1) | O(n log n) |
| Three nested loops | i, j, k each 0 … n − 1 | n³ | O(n³) |

```java
// Prints ² : on Windows run it with  java -Dstdout.encoding=UTF-8 CountOps.java
public class CountOps {

    // Each method counts how many times its innermost statement runs for an input of size n.
    static long single(int n) {                 // O(n)
        long ops = 0;
        for (int i = 0; i < n; i++) ops++;
        return ops;
    }

    static long twoLoops(int n) {               // n + n = 2n -> O(n): loops in a row ADD
        long ops = 0;
        for (int i = 0; i < n; i++) ops++;
        for (int j = 0; j < n; j++) ops++;
        return ops;
    }

    static long nested(int n) {                 // n * n -> O(n²): loops inside loops MULTIPLY
        long ops = 0;
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) ops++;
        return ops;
    }

    static long triangle(int n) {               // n(n-1)/2 -> still O(n²)
        long ops = 0;
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) ops++;
        return ops;
    }

    static long halving(int n) {                // log2(n) + 1 -> O(log n)
        long ops = 0;
        for (int i = n; i > 0; i /= 2) ops++;
        return ops;
    }

    static long nLogN(int n) {                  // n * (log2(n) + 1) -> O(n log n)
        long ops = 0;
        for (int i = 0; i < n; i++)
            for (int j = n; j > 0; j /= 2) ops++;
        return ops;
    }

    static long cubic(int n) {                  // n³ -> O(n³)
        long ops = 0;
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                for (int k = 0; k < n; k++) ops++;
        return ops;
    }

    public static void main(String[] args) {
        int[] sizes = {10, 100, 1000};
        System.out.printf("%-12s %10s %12s %15s   %s%n", "pattern", "n=10", "n=100", "n=1000", "Big-O");
        row("single", CountOps::single, sizes, "O(n)");
        row("two loops", CountOps::twoLoops, sizes, "O(n)");
        row("halving", CountOps::halving, sizes, "O(log n)");
        row("n log n", CountOps::nLogN, sizes, "O(n log n)");
        row("triangle", CountOps::triangle, sizes, "O(n²)");
        row("nested", CountOps::nested, sizes, "O(n²)");
        row("cubic", CountOps::cubic, sizes, "O(n³)");
        /* Output:
           pattern            n=10        n=100          n=1000   Big-O
           single               10          100            1000   O(n)
           two loops            20          200            2000   O(n)
           halving               4            7              10   O(log n)
           n log n              40          700           10000   O(n log n)
           triangle             45         4950          499500   O(n²)
           nested              100        10000         1000000   O(n²)
           cubic              1000      1000000      1000000000   O(n³)
        */
    }

    interface Counter { long count(int n); }

    static void row(String name, Counter c, int[] sizes, String bigO) {
        System.out.printf("%-12s %10d %12d %15d   %s%n", name, c.count(sizes[0]), c.count(sizes[1]), c.count(sizes[2]), bigO);
    }
}
```

*[Visual `#cxLoops`: Watch the loops count: pick a loop pattern (single, two in a row, nested, triangular, halving, loop × halving, halving outer + linear inner, constant inner) and n; every ops++ lights one grid cell; counts for n = 10 … 10,000 and the doubling ratio.]*

#### Part 3 · Big-O, Big-Ω and Big-Θ

- **Big-O (upper bound)**: f(n) = O(g(n)) if f grows **no faster** than g: there are constants c > 0 and n₀ with f(n) ≤ c·g(n) for every n ≥ n₀. Example: 3n² + 5n + 2 ≤ 4n² once n ≥ 6, so it is O(n²).
- **Big-Ω (lower bound)**: f grows **at least** as fast as g: f(n) ≥ c·g(n) for large n. Any algorithm that must read all n inputs is Ω(n).
- **Big-Θ (tight bound)**: both at once. Selection sort is Θ(n²) on every input; insertion sort is O(n²) but not Θ(n²) on every input (it is Θ(n) on sorted input).
- In interviews people say "O" when they mean the tight bound. Say the tight one: "binary search is O(log n)", not "O(n)", even though O(n) is technically also true.

| Expression | Simplifies to | Why |
|---|---|---|
| 5n + 100 | O(n) | Drop constant factors and constant terms |
| n² + n log n + 7n | O(n²) | Keep only the fastest-growing term |
| n/2 · log₂ n | O(n log n) | Constant factor ½ is dropped |
| log₂ n vs log₁₀ n | O(log n) | Bases differ by a constant factor: log₂ n = 3.32 · log₁₀ n |
| 2ⁿ + n¹⁰⁰ | O(2ⁿ) | Any exponential beats any polynomial eventually |
| 1000 | O(1) | Doesn't depend on n at all |

#### Part 4 · The growth ladder

| Class | Name | Typical code | n = 10 | n = 1,000 | n = 10⁶ |
|---|---|---|---|---|---|
| O(1) | constant | `a[i]`, HashMap get, push/pop | 1 | 1 | 1 |
| O(log n) | logarithmic | binary search, balanced tree, heap push | 3 | 10 | 20 |
| O(n) | linear | one pass, linear search, sum | 10 | 1,000 | 10⁶ |
| O(n log n) | linearithmic | merge sort, heap sort, `Arrays.sort` | 33 | 10⁴ | 2·10⁷ |
| O(n²) | quadratic | all pairs, bubble/insertion sort | 100 | 10⁶ | 10¹² ✗ |
| O(n³) | cubic | all triples, naive matrix multiply | 1,000 | 10⁹ | 10¹⁸ ✗ |
| O(2ⁿ) | exponential | all subsets, naive Fibonacci | 1,024 | 10³⁰¹ ✗ | ✗ |
| O(n!) | factorial | all permutations | 3.6·10⁶ | ✗ | ✗ |

*[Visual `#cxGrow`: Growth chart: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n!) for n ≤ 10/20/100, linear or log scale, hover values; a How long would it take? table for n = 10 … 10⁹ at 10⁸ steps per second.]*

**Reading the constraints** (about 10⁸ steps per second): the input limit in a problem statement tells you which complexity the interviewer expects.

| n up to | Fits in about a second | Typical technique |
|---|---|---|
| 10–12 | O(n!) | permutations, backtracking |
| 20–25 | O(2ⁿ) | subsets, bitmask DP |
| 500 | O(n³) | triple loops, interval DP, Floyd–Warshall |
| 5,000–10⁴ | O(n²) | all pairs, 2D DP |
| 10⁵–10⁶ | O(n log n) | sorting, heaps, binary search, TreeMap |
| 10⁷–10⁸ | O(n) | one pass, two pointers, hashing, prefix sums |
| 10⁹ and more | O(log n) or O(1) | binary search on the answer, math formula |

#### Part 5 · The rules for combining costs

1. **Sequential parts add, then keep the biggest**: an O(n log n) sort followed by an O(n) scan is O(n log n).
2. **Nested parts multiply**: an O(n) loop that calls an O(log n) method each time is O(n log n). Watch hidden loops: `list.contains(x)` inside a loop is O(n) × O(n) = O(n²).
3. **Different inputs, different letters**: looping over array A (size a) then array B (size b) is O(a + b); nested over them is O(a · b), not O(n²).
4. **Constant-size loops are O(1)**: `for (int d = 0; d < 26; d++)` or looping over 4 directions does not depend on n.
5. **Early exit doesn't change the worst case**: a loop that may `break` early is still O(n) in the worst case; say the best case separately if it matters.
6. **Log bases don't matter**, and neither does log of a power: log(n²) = 2 log n = O(log n).

#### Part 6 · Best, average, worst and amortized

- **Worst case**: the maximum over all inputs of size n. This is what "the complexity" means unless stated otherwise. Linear search: O(n) (the key is last or absent).
- **Best case**: the minimum. Linear search: O(1) (the key is first). Rarely useful, except to show adaptivity (insertion sort O(n) on sorted input).
- **Average case**: the expected cost over random inputs. Quicksort: worst O(n²), average O(n log n). HashMap get: worst O(n) (or O(log n) with treeified bins), average O(1).
- **Amortized**: the average cost per operation over a **sequence** of operations on the worst input, with no randomness. `ArrayList.add` is occasionally O(n) (when it resizes and copies), but every resize grows the capacity by 1.5×, so n adds cost O(n) in total: **amortized O(1)** each.

```java
public class AmortizedGrowth {

    // Simulates a growable array: when it is full, allocate a bigger one and copy every element across.
    // "x1.5" is Java's ArrayList (first capacity 10, then old + old/2); "x2" doubles; "+10" grows by a fixed step.
    static void simulate(String policy, int adds) {
        long capacity = 0, size = 0, copies = 0, resizes = 0;
        for (int k = 0; k < adds; k++) {
            if (size == capacity) {
                long newCap = switch (policy) {
                    case "x1.5" -> capacity == 0 ? 10 : capacity + (capacity >> 1);
                    case "x2" -> capacity == 0 ? 10 : capacity * 2;
                    default -> capacity + 10;
                };
                copies += size;                  // copying the old elements is the expensive part
                capacity = newCap;
                resizes++;
            }
            size++;                              // the add itself: O(1)
        }
        System.out.printf("%-5s %,10d adds: %,6d resizes, %,15d copies, %,10.2f copies per add%n",
                policy, adds, resizes, copies, (double) copies / adds);
    }

    public static void main(String[] args) {
        for (String p : new String[]{"x1.5", "x2", "+10"}) simulate(p, 1_000_000);

        // String s += c copies the whole string every time; StringBuilder grows like a list (old * 2 + 2)
        int n = 100_000;
        long plus = (long) n * (n + 1) / 2;      // 1 + 2 + ... + n characters copied
        long cap = 16, len = 0, sb = 0;
        for (int i = 0; i < n; i++) {
            if (len == cap) { sb += len; cap = cap * 2 + 2; }
            len++;
        }
        System.out.printf("%,d appends: String += copies %,d chars, StringBuilder copies %,d chars%n", n, plus, sb + n);
        /* Output:
           x1.5   1,000,000 adds:     30 resizes,       2,430,972 copies,       2.43 copies per add
           x2     1,000,000 adds:     18 resizes,       1,310,710 copies,       1.31 copies per add
           +10    1,000,000 adds: 100,000 resizes,  49,999,500,000 copies,  49,999.50 copies per add
           100,000 appends: String += copies 5,000,050,000 chars, StringBuilder copies 247,412 chars
        */
    }
}
```

*[Visual `#cxAmort`: Amortized O(1): an ArrayList growing ×1.5 (Java), ×2 or +10; one bar per add (red = resize copy), running average line, resizes, copies, average cost per add.]*

#### Part 7 · Recursion: recursion trees and recurrences

Draw the calls as a tree: **time = total work in all nodes**, **stack space = depth of the tree** (only one root-to-leaf path is on the stack at a time). Each recursive algorithm gives a recurrence T(n) = (calls) · T(smaller n) + (work per call):

| Recurrence | Example | Time | Stack space |
|---|---|---|---|
| T(n) = T(n − 1) + O(1) | factorial, sum of 1..n, linked-list recursion | O(n) | O(n) |
| T(n) = T(n − 1) + O(n) | recursive selection / bubble sort | O(n²) | O(n) |
| T(n) = T(n/2) + O(1) | binary search | O(log n) | O(log n) |
| T(n) = T(n/2) + O(n) | Quickselect (average) | O(n) | O(log n) |
| T(n) = 2T(n/2) + O(1) | tree traversal, max of a range by halves | O(n) | O(log n) (balanced) |
| T(n) = 2T(n/2) + O(n) | merge sort, quicksort (good pivots) | O(n log n) | O(log n) (+ O(n) merge buffer) |
| T(n) = 2T(n − 1) + O(1) | naive Fibonacci, Tower of Hanoi, all subsets | O(2ⁿ) | O(n) |
| T(n) = n · T(n − 1) | all permutations | O(n!) | O(n) |

**Master theorem** (for T(n) = a·T(n/b) + O(n^d), with a ≥ 1, b > 1): compare a with b^d. If a < b^d the top level dominates: O(n^d). If a = b^d every level costs the same: O(n^d log n). If a > b^d the leaves dominate: O(n^(log_b a)). Merge sort: a = 2, b = 2, d = 1, so a = b^d and T(n) = O(n log n). Binary search: a = 1, b = 2, d = 0, so O(log n).

```java
public class RecursionCost {
    static long calls;
    static int depth, maxDepth;

    static void enter() { calls++; depth++; maxDepth = Math.max(maxDepth, depth); }

    // T(n) = T(n-1) + T(n-2) + O(1): about 1.6^n calls -> exponential time, but only n frames deep
    static long fib(int n) {
        enter();
        long r = n < 2 ? n : fib(n - 1) + fib(n - 2);
        depth--;
        return r;
    }

    // Memoization: each fib(k) is computed once -> O(n) time, O(n) space (memo + stack)
    static long[] memo = new long[100];
    static long fibMemo(int n) {
        enter();
        long r;
        if (n < 2) r = n;
        else if (memo[n] != 0) r = memo[n];
        else r = memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
        depth--;
        return r;
    }

    // Bottom-up: O(n) time, O(1) space
    static long fibLoop(int n) {
        long a = 0, b = 1;
        for (int i = 0; i < n; i++) { long t = a + b; a = b; b = t; }
        return a;
    }

    // T(n) = T(n/2) + O(1) -> O(log n) time, O(log n) stack
    static int binarySearch(int[] a, int key, int lo, int hi) {
        enter();
        int r;
        if (lo > hi) r = -1;
        else {
            int mid = (lo + hi) >>> 1;
            if (a[mid] == key) r = mid;
            else if (a[mid] < key) r = binarySearch(a, key, mid + 1, hi);
            else r = binarySearch(a, key, lo, mid - 1);
        }
        depth--;
        return r;
    }

    public static void main(String[] args) {
        for (int n : new int[]{10, 20, 30}) {
            calls = maxDepth = 0;
            long v = fib(n);
            long naive = calls;
            int naiveDepth = maxDepth;
            calls = maxDepth = 0;
            java.util.Arrays.fill(memo, 0);
            fibMemo(n);
            System.out.printf("fib(%d) = %d   naive calls = %,d (depth %d)   memo calls = %d   loop = %d%n",
                    n, v, naive, naiveDepth, calls, fibLoop(n));
        }

        int[] sorted = new int[1_000_000];
        for (int i = 0; i < sorted.length; i++) sorted[i] = 2 * i;
        calls = maxDepth = 0;
        int idx = binarySearch(sorted, 1_999_998, 0, sorted.length - 1);
        System.out.println("binary search in 1,000,000 values: index " + idx + " after " + calls + " calls");
        /* Output:
           fib(10) = 55   naive calls = 177 (depth 10)   memo calls = 19   loop = 55
           fib(20) = 6765   naive calls = 21,891 (depth 20)   memo calls = 39   loop = 6765
           fib(30) = 832040   naive calls = 2,692,537 (depth 30)   memo calls = 59   loop = 832040
           binary search in 1,000,000 values: index 999999 after 20 calls
        */
    }
}
```

*[Visual `#cxTree`: Recursion tree: factorial, naive and memoized Fibonacci, binary search, merge sort; calls play in depth-first order with the current call stack highlighted; calls, work, stack now and max depth.]*

#### Part 8 · Space complexity

- **Auxiliary space** is the extra memory the algorithm allocates; **total space** also counts the input. Interviews almost always mean auxiliary space.
- **What counts**: new arrays, lists, maps and sets; new Strings and StringBuilders; and **recursion frames**, each holding parameters, locals and a return address.
- **What doesn't**: a fixed number of variables (O(1)), and usually the output you are required to return (say so explicitly).
- **In-place** means O(1) auxiliary space (sometimes O(log n) for a recursion stack is still called in-place, as for quicksort).

| Code | Extra space |
|---|---|
| A few `int` variables, swapping in place | O(1) |
| `new int[n]`, a copy, a `HashSet` of the input | O(n) |
| `new int[n][n]` (2D DP table) | O(n²) |
| Recursion n levels deep (sumRec, naive Fibonacci) | O(n) stack |
| Balanced recursion (binary search, merge sort's calls) | O(log n) stack |
| Merge sort's temporary array | O(n) |
| `s.toCharArray()`, `substring`, `split` | O(n): they copy |

```java
// Prints ≈ : on Windows run it with  java -Dstdout.encoding=UTF-8 SpaceCost.java
import java.util.Arrays;

public class SpaceCost {

    static long sumLoop(int n) {                // O(n) time, O(1) extra space: two variables
        long s = 0;
        for (int i = 1; i <= n; i++) s += i;
        return s;
    }

    static long sumRec(int n) {                 // O(n) time, O(n) extra space: n stack frames
        return n == 0 ? 0 : n + sumRec(n - 1);
    }

    static int[] reversedCopy(int[] a) {        // O(n) extra space: a new array
        int[] b = new int[a.length];
        for (int i = 0; i < a.length; i++) b[i] = a[a.length - 1 - i];
        return b;
    }

    static void reverseInPlace(int[] a) {       // O(1) extra space: in-place, two pointers
        for (int i = 0, j = a.length - 1; i < j; i++, j--) {
            int t = a[i]; a[i] = a[j]; a[j] = t;
        }
    }

    public static void main(String[] args) {
        System.out.println(sumLoop(1_000_000));          // 500000500000
        System.out.println(sumRec(10_000));              // 50005000
        try {
            sumRec(1_000_000);                           // a million frames do not fit in the thread stack
        } catch (StackOverflowError e) {
            System.out.println("StackOverflowError: O(n) stack space is a real limit");
        }

        int[] a = {1, 2, 3, 4, 5};
        int[] b = reversedCopy(a);
        reverseInPlace(a);
        System.out.println(Arrays.toString(b) + " " + Arrays.toString(a));   // [5, 4, 3, 2, 1] [5, 4, 3, 2, 1]

        // Space is memory: an int is 4 bytes, so new int[n] costs about 4n bytes (+16 bytes of header)
        long n = 10_000_000;
        System.out.printf("new int[%,d]  ≈ %,d MB%n", n, (4 * n + 16) / (1024 * 1024));
        System.out.printf("new long[%,d] ≈ %,d MB%n", n, (8 * n + 16) / (1024 * 1024));
        /* Output:
           500000500000
           50005000
           StackOverflowError: O(n) stack space is a real limit
           [5, 4, 3, 2, 1] [5, 4, 3, 2, 1]
           new int[10,000,000]  ≈ 38 MB
           new long[10,000,000] ≈ 76 MB
        */
    }
}
```

#### Part 9 · Time–space trade-offs

Many speed-ups buy time with memory. Two Sum by checking every pair is O(n²) time and O(1) space; remembering what you have seen in a `HashMap` is O(n) time and O(n) space. Other everyday trades: memoization (naive Fibonacci 2,692,537 calls for n = 30, memoized 59), prefix sums (O(n) memory for O(1) range sums), precomputed lookup tables, caching. Always state both costs and say which one you optimized.

```java
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class TradeOff {
    static long ops;

    // Brute force: check every pair. O(n²) time, O(1) extra space.
    static int[] twoSumBrute(int[] a, int target) {
        for (int i = 0; i < a.length; i++)
            for (int j = i + 1; j < a.length; j++) {
                ops++;
                if (a[i] + a[j] == target) return new int[]{i, j};
            }
        return null;
    }

    // Spend memory to save time: remember what we have seen. O(n) time, O(n) extra space.
    static int[] twoSumMap(int[] a, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < a.length; i++) {
            ops++;
            Integer j = seen.get(target - a[i]);           // O(1) on average
            if (j != null) return new int[]{j, i};
            seen.put(a[i], i);
        }
        return null;
    }

    public static void main(String[] args) {
        int n = 10_000;
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = 2 * i;
        int target = a[n - 2] + a[n - 1];                  // worst case: the pair is at the very end

        ops = 0;
        System.out.println("brute force " + Arrays.toString(twoSumBrute(a, target)) + " after " + String.format("%,d", ops) + " steps");
        ops = 0;
        System.out.println("hash map    " + Arrays.toString(twoSumMap(a, target)) + " after " + String.format("%,d", ops) + " steps");
        /* Output:
           brute force [9998, 9999] after 49,995,000 steps
           hash map    [9998, 9999] after 10,000 steps
        */
    }
}
```

#### Part 10 · Java costs you must know

| Operation | Cost | Note |
|---|---|---|
| `array[i]`, `arr.length` | O(1) | Address = start + i × size |
| `ArrayList.get/set` | O(1) |  |
| `ArrayList.add(x)` at the end | amortized O(1) | A resize copies everything (grows 1.5×) |
| `ArrayList.add(0, x)`, `remove(0)` | O(n) | Shifts every element |
| `list.contains/indexOf/remove(Object)` | O(n) | Linear search: a hidden loop |
| `LinkedList.get(i)` | O(n) | Walks the nodes |
| `ArrayDeque` push/pop/offer/poll | O(1) amortized | Use it for stacks and queues |
| `HashMap/HashSet` get/put/contains/remove | O(1) average | Worst O(n); O(log n) when a bin is treeified (Comparable keys) |
| `TreeMap/TreeSet` get/put/floor/ceiling | O(log n) | Red-black tree, keys sorted |
| `PriorityQueue` offer/poll | O(log n) | peek O(1); contains/remove(Object) O(n); building from a collection O(n) |
| `String.length/charAt` | O(1) |  |
| `equals, compareTo, indexOf, contains, substring, toCharArray` | O(n) | indexOf can be O(n·m) for a pattern of length m |
| `s += x` inside a loop | O(n²) total | Copies the whole string each time: use StringBuilder |
| `StringBuilder.append` | amortized O(1) per char | `insert(0, …)`, `deleteCharAt(0)` are O(n) |
| `Arrays.sort(int[])` | O(n log n) | Dual-Pivot Quicksort, O(log n) stack, not stable |
| `Arrays.sort(Object[])`, `List.sort`, `Collections.sort` | O(n log n) | TimSort: stable, O(n) extra, O(n) on sorted input |
| `Arrays.binarySearch`, `Collections.binarySearch` | O(log n) | Only on sorted data (on a LinkedList it is O(n)) |
| `Arrays.copyOf`, `System.arraycopy`, `clone` | O(n) |  |

#### Part 11 · Advanced ideas

- **The sorting lower bound.** A comparison sort is a decision tree whose leaves are the n! possible orders; a binary tree with n! leaves has height ≥ log₂(n!) ≈ n log₂ n − 1.44 n. So every comparison sort needs Ω(n log n) comparisons in the worst case. Counting, radix and bucket sort escape it because they don't compare.
- **Pseudo-polynomial time.** Counting sort is O(n + k) and 0/1 knapsack DP is O(n · W). They look polynomial, but k and W are numbers, and their size in bits is log k: doubling the number of bits squares k. That is why counting sort is useless for 32-bit values.
- **Amortized analysis methods.** The *aggregate* method adds up the total cost of n operations (ArrayList: n adds + about 2.43n copies ≈ 3.4n steps with 1.5× growth, measured below; 2.3n when doubling); the *accounting* method charges each cheap operation a little extra to pay for the rare expensive one.
- **Big-O hides constants.** Heap sort and merge sort are both O(n log n), but quicksort usually wins because of cache-friendly memory access. A HashMap's O(1) includes hashing the whole key (O(length) for a String key, cached afterwards). For small n, an O(n²) insertion sort beats an O(n log n) merge sort, which is why TimSort uses it for small runs.
- **Say what n is.** Graph algorithms are O(V + E); string matching is O(n + m); a heap of size k gives O(n log k), better than O(n log n) when k is small; a sliding window over a 26-letter alphabet keeps O(26) = O(1) counts.
- **Recursion in Java has a real limit.** Java has no tail-call elimination, so O(n) recursion depth overflows the stack for n in the tens of thousands, even when the time is fine.
- **Beyond polynomial.** Problems like the travelling salesman or subset sum have no known polynomial algorithm (NP-hard); interviews stop at "this is exponential, here is the pruning / DP / greedy approximation".

#### Part 12 · How to answer "what's the complexity?" in an interview

1. Define n (and m, k, V, E if there are several inputs).
2. Walk the code top to bottom: give each block a cost; add sequential blocks; multiply nested ones; include the cost of every library call (contains, sort, substring).
3. For recursion, state the recurrence or draw the tree: number of calls × work per call, and the depth.
4. Keep the dominant term; drop constants.
5. Give **time and space**, worst case unless asked; mention best/average/amortized when they differ.
6. Offer the trade-off: "O(n²) with O(1) space, or O(n) with a HashMap at O(n) space."

#### Common mistakes

| Mistake | Why it's wrong | Say instead |
|---|---|---|
| "Two nested loops, so O(n²)" | Only if both run ~n times; the inner one might halve, or run a constant 26 times | Count the iterations of each loop |
| Ignoring library calls | `contains`, `indexOf`, `substring`, `remove(0)` are O(n) loops | Multiply them in |
| Forgetting the recursion stack | Recursive DFS on a 10⁵-node chain uses O(n) space and may overflow | Space = O(depth) |
| "HashMap is always O(1)" | Average O(1); hashing a String key is O(length); worst case degrades | "O(1) average" |
| Calling a two-input loop O(n²) | The sizes are different | O(n · m) |
| "O(2n) is better than O(n)" | Constants are dropped: both are O(n) | Compare real constants only when Big-O ties |
| Building a String with `+=` in a loop and calling it O(n) | Each += copies the whole string | O(n²); StringBuilder makes it O(n) |

#### Interview questions

**Q01. What is time complexity, and why not just measure the time?** It describes how the number of steps grows with the input size n. Measured time depends on the machine, JVM warm-up and load; growth rate compares algorithms independently of all that and predicts behaviour for big inputs.

**Q02. What is the difference between Big-O, Big-Ω and Big-Θ?** O is an upper bound (grows no faster than), Ω a lower bound (at least as fast), Θ a tight bound (both). Selection sort is Θ(n²); insertion sort is O(n²) and Ω(n).

**Q03. Why do we drop constants and lower-order terms?** For large n the fastest-growing term dominates, and constants depend on the machine and implementation. 3n² + 5n and n² both grow quadratically: doubling n multiplies the work by about 4.

**Q04. Why is binary search O(log n)?** Each step halves the remaining range: n, n/2, n/4 … 1. The number of halvings until one element is left is log₂ n (about 20 for a million).

**Q05. What is amortized O(1) for ArrayList.add?** Most adds are O(1); when the array is full it is copied into one 1.5× bigger. The copies form a geometric series, so n adds cost O(n) in total: O(1) per add on average over any sequence, with no randomness involved.

**Q06. What is the time and space complexity of naive recursive Fibonacci?** Time O(2ⁿ) (more precisely about 1.618ⁿ; fib(30) makes 2,692,537 calls). Space O(n): the stack holds only one root-to-leaf path. Memoization makes it O(n) time; a loop makes it O(n) time and O(1) space.

**Q07. What is the complexity of merge sort, and how do you derive it?** T(n) = 2T(n/2) + O(n). The recursion tree has log₂ n levels, each doing O(n) merging in total, so O(n log n). Space O(n) for the temporary array plus O(log n) stack. By the master theorem a = 2 = b^d.

**Q08. Does recursion use extra space even if it creates no arrays?** Yes: every active call is a stack frame. Space is O(maximum recursion depth): O(n) for linear recursion, O(log n) for balanced halving.

**Q09. What does O(n + m) mean, and when is it not O(n)?** Two independent inputs of sizes n and m. It is not O(n) because m can be much larger than n; e.g. checking if string t contains all letters of s is O(n + m).

**Q10. Why can't a comparison sort be faster than O(n log n)?** There are n! possible orders and each comparison has two outcomes, so the decision tree needs height ≥ log₂(n!) ≈ n log₂ n. Counting/radix/bucket sorts avoid it by not comparing.

**Q11. What is the complexity of building a String with += in a loop?** O(n²): Strings are immutable, so each += copies the whole current string (1 + 2 + … + n chars). StringBuilder appends into a growing buffer: O(n) total.

**Q12. Give an example of trading space for time.** Two Sum: O(n²) time with O(1) space by checking all pairs, or O(n) time with a HashMap of seen values at O(n) space. Memoization and prefix sums are the same idea.

#### Guess the Big-O

Quiz: 12 Guess the Big-O questions (`QZ.cx`), listed under "Practice layer" → "Lesson 06 · Guess the Big-O".

#### Takeaways

- Complexity = how steps (time) and extra memory (space) grow with n; drop constants and smaller terms.
- Loops in a row add, nested loops multiply, halving gives log n; count library calls too.
- Ladder: 1 < log n < n < n log n < n² < 2ⁿ < n!; about 10⁸ simple steps per second.
- Recursion: time = all the nodes of the call tree, space = its depth; master theorem for divide and conquer.
- Always answer with time and space, worst case, and the trade-off you chose.

Next in the path: Bubble sort →

### 3. What sorting is, and the idea behind bubble sort

**In 30 seconds:** **Sorting** puts elements in order (ascending by default). **Bubble sort** walks the array from left to right comparing each pair of **neighbours**, `a[j]` and `a[j+1]`, and swaps them when they are in the wrong order. One walk is a **pass**. After pass 1 the largest value has "bubbled" to the last index; after pass 2 the second largest sits before it; after at most **n − 1** passes the array is sorted. It uses **O(n²)** time, **O(1)** extra space, is **stable** and **in-place**.

**Why it exists:** it is the simplest correct sorting algorithm that only ever looks at two neighbours. Nobody uses it for big data (Java's `Arrays.sort` uses Dual-Pivot Quicksort for primitives and TimSort for objects, Lesson 04), but interviews use it to test loops, off-by-one bounds, swaps, invariants, and complexity reasoning. It is also genuinely fast on **tiny** or **almost sorted** input, and one pass of it is the cheapest way to **check** whether an array is sorted.

**Analogy (remember this one):** a **valet** must line up cars from shortest to longest, but the lane is narrow: he can only **swap two neighbouring cars**. He walks from the front to the back; whenever the car in front is longer than the one behind it, he swaps them. The longest car keeps getting swapped backwards until it reaches the end of the lane, where it is **parked for good**. Next walk, he can stop one slot earlier. Or picture soda: the big bubbles rise to the top first.

*[Visual `#anValet`: Valet parking analogy: cars of different lengths, the valet compares neighbours, swaps, and parks the longest at the end of each walk.]*

> 💡 **Remember it:** Bubble sort = a **valet who may only swap neighbours**. Each walk parks the longest remaining car at the end of the lane, so the "parked" zone grows from the right by one car per walk.

#### The vocabulary you will use in every sorting lesson

| Term | Meaning | Bubble sort |
|---|---|---|
| **Pass** | One walk over the unsorted part | At most n − 1 passes |
| **Comparison** | Asking "is `a[j] > a[j+1]`?" | n(n−1)/2 in the standard version |
| **Swap** | Exchanging two elements (3 assignments with a temp) | Exactly the number of **inversions** |
| **Invariant** | A fact that is true after every pass | After pass k, the last k slots hold the k largest values, in order |
| **In-place** | Needs only O(1) extra memory | Yes (loop versions); recursion costs O(n) stack |
| **Stable** | Equal elements keep their input order | Yes, as long as you swap only on `>` |
| **Adaptive** | Faster when the input is nearly sorted | Only with the swapped flag (V3+) |
| **Online** | Can sort data as it arrives | No (insertion sort can) |

#### The Bubble Lab

This lab runs **all 11 variants** from this lesson. Pick a variant and an input, then press **Play** or step. The highlighted Java line, the pointers `j`/`j+1`, the green "parked" zone, the counters and, for the recursive variants, the call stack all move together. Each later section opens the same lab on its own variant.

*[Visual `#bsLab`: Bubble Lab: all 11 variants; bars with j/j+1 pointers, green parked zone, the current Java line, counters (pass, comparisons, swaps, wasted, stack depth, gap), call stack for V6/V7; inputs random/sorted/nearly/reversed/duplicates/turtle/your numbers.]*

### 4. Dry run by hand: [5, 1, 4, 2, 8]

**In 30 seconds:** Before you write any sort, trace it on paper with one small array. For `[5, 1, 4, 2, 8]`: pass 1 makes 4 comparisons and 3 swaps and parks 8; pass 2 makes 3 comparisons and 1 swap and parks 5; pass 3 makes 2 comparisons and **no swaps**, so the array is sorted and we stop. Total: **9 comparisons, 4 swaps**. Interviewers love asking "what does the array look like after pass 2?"

Press **Next** in the lab below: every comparison adds a row to the table, exactly like the output of the program.

*[Visual `#bsLabDry`: Bubble Lab opened on `flag` with input `5 1 4 2 8`, plus the dry-run table (one row per comparison).]*

```java
import java.util.Arrays;

public class BubbleDryRun {

    public static void main(String[] args) {
        int[] a = {5, 1, 4, 2, 8};
        int n = a.length, comparisons = 0, swaps = 0;

        for (int pass = 1; pass < n; pass++) {
            boolean swapped = false;
            for (int j = 0; j < n - pass; j++) {          // the last pass-1 slots are already final
                int x = a[j], y = a[j + 1];
                comparisons++;
                boolean swap = x > y;                      // only a strict > swaps: equal values stay put
                if (swap) {
                    a[j] = y;
                    a[j + 1] = x;
                    swaps++;
                    swapped = true;
                }
                System.out.printf("pass %d  j=%d  %d > %d ? %-5s -> %s%n", pass, j, x, y, swap, Arrays.toString(a));
            }
            System.out.println("end of pass " + pass + ": " + a[n - pass] + " is in its final place");
            if (!swapped) {
                System.out.println("no swaps in pass " + pass + ", so the array is sorted: stop early");
                break;
            }
        }
        System.out.println("comparisons = " + comparisons + ", swaps = " + swaps);
        /* Output:
           pass 1  j=0  5 > 1 ? true  -> [1, 5, 4, 2, 8]
           pass 1  j=1  5 > 4 ? true  -> [1, 4, 5, 2, 8]
           pass 1  j=2  5 > 2 ? true  -> [1, 4, 2, 5, 8]
           pass 1  j=3  5 > 8 ? false -> [1, 4, 2, 5, 8]
           end of pass 1: 8 is in its final place
           pass 2  j=0  1 > 4 ? false -> [1, 4, 2, 5, 8]
           pass 2  j=1  4 > 2 ? true  -> [1, 2, 4, 5, 8]
           pass 2  j=2  4 > 5 ? false -> [1, 2, 4, 5, 8]
           end of pass 2: 5 is in its final place
           pass 3  j=0  1 > 2 ? false -> [1, 2, 4, 5, 8]
           pass 3  j=1  2 > 4 ? false -> [1, 2, 4, 5, 8]
           end of pass 3: 4 is in its final place
           no swaps in pass 3, so the array is sorted: stop early
           comparisons = 9, swaps = 4
        */
    }
}
```

- Pass 1: 5 is the largest seen so far, so it is swapped right three times, until it meets 8. Then 8 is the largest and is already last. **The largest value always ends at the end**, whatever its start position.
- Pass 2 needs only 3 comparisons: index 4 already holds its final value.
- Pass 3 makes no swap. A pass with no swap means every neighbour pair is in order, which means the whole array is sorted, so we stop without pass 4.

**Interview tip:** say the invariant out loud: "after pass *k*, the last *k* elements are the *k* largest, in sorted order". It explains both why the inner loop can stop at `n − 1 − i` and why the algorithm is correct.

### 5. V1 · Brute force: always n − 1 full sweeps

**In 30 seconds:** The most naive correct version: run **n − 1** passes, and in every pass compare **every** neighbour pair, `j` from 0 to `n − 2`. It never notices that the tail is already sorted, nor that the whole array might already be sorted. Comparisons: **(n − 1)²** on **every** input, so Θ(n²) best, average and worst. Space O(1).

```java
import java.util.Arrays;

public class BubbleBrute {
    static int comparisons, swaps;

    // V1 brute force: n-1 full sweeps, no matter what. Correct, but it re-checks the sorted tail
    // and never notices that the array is already sorted.
    static void bruteBubble(int[] a) {
        int n = a.length;
        for (int i = 0; i < n - 1; i++) {          // n-1 passes, always
            for (int j = 0; j < n - 1; j++) {      // every pass walks the whole array
                comparisons++;
                if (a[j] > a[j + 1]) {
                    int t = a[j];
                    a[j] = a[j + 1];
                    a[j + 1] = t;
                    swaps++;
                }
            }
        }
    }

    static void run(String label, int[] a) {
        comparisons = swaps = 0;
        bruteBubble(a);
        System.out.println(label + Arrays.toString(a) + "  comparisons=" + comparisons + " swaps=" + swaps);
    }

    public static void main(String[] args) {
        run("random   ", new int[]{5, 1, 4, 2, 8});    // random   [1, 2, 4, 5, 8]  comparisons=16 swaps=4
        run("sorted   ", new int[]{1, 2, 4, 5, 8});    // sorted   [1, 2, 4, 5, 8]  comparisons=16 swaps=0
        run("reversed ", new int[]{8, 5, 4, 2, 1});    // reversed [1, 2, 4, 5, 8]  comparisons=16 swaps=10
        // (n-1)^2 = 16 comparisons for n = 5, on every input: Θ(n²) best, average and worst
    }
}
```

In the lab, the red counter **wasted** counts comparisons that touch the already-parked tail: they can never cause a swap. For n = 5 that is 6 of the 16 comparisons; for n = 1000 it is 498,501 of 998,001, almost exactly half.

*[Visual `#bsLabBrute`: Bubble Lab opened on `brute` with input `5 1 4 2 8`.]*

**Why is it still correct?** Comparing two values that are already in order does nothing, so the extra work is harmless, just slow. Two cheap ideas fix the two kinds of waste: shrink the inner loop (V2) and stop when nothing moved (V3).

**"Brute force" in sorting** sometimes means something even worse: try every permutation until one is sorted (permutation sort, O(n · n!)). Mention it if asked for "the most brute force sort", then explain why bubble sort's neighbour swaps are already far better.

### 6. V2 · Standard: shrink the inner loop

**In 30 seconds:** Because of the invariant, pass `i` (counting from 0) only needs to walk to `n − 2 − i`: write the inner loop as `j < n - 1 - i`. Comparisons drop to (n−1) + (n−2) + … + 1 = **n(n − 1)/2**, half of V1, but it is still the same on every input, so still Θ(n²) best case too.

```java
import java.util.Arrays;

public class BubbleStandard {
    static int comparisons, swaps;

    // V2 standard: after pass i, the i+1 largest values sit at the end in their final places,
    // so the inner loop stops before them.
    static void bubbleSort(int[] a) {
        int n = a.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - 1 - i; j++) {  // shrink: skip the sorted tail
                comparisons++;
                if (a[j] > a[j + 1]) {
                    swap(a, j, j + 1);
                    swaps++;
                }
            }
        }
    }

    static void swap(int[] a, int i, int j) {
        int t = a[i];
        a[i] = a[j];
        a[j] = t;
    }

    static void run(String label, int[] a) {
        comparisons = swaps = 0;
        bubbleSort(a);
        System.out.println(label + Arrays.toString(a) + "  comparisons=" + comparisons + " swaps=" + swaps);
    }

    public static void main(String[] args) {
        run("random   ", new int[]{5, 1, 4, 2, 8});    // random   [1, 2, 4, 5, 8]  comparisons=10 swaps=4
        run("sorted   ", new int[]{1, 2, 4, 5, 8});    // sorted   [1, 2, 4, 5, 8]  comparisons=10 swaps=0
        run("reversed ", new int[]{8, 5, 4, 2, 1});    // reversed [1, 2, 4, 5, 8]  comparisons=10 swaps=10
        // n(n-1)/2 = 10 comparisons on every input: still Θ(n²), but about half of V1
    }
}
```

*[Visual `#bsLabStd`: Bubble Lab opened on `standard` with input `reversed`.]*

#### Counting the comparisons

| Pass i | Inner loop runs for j = | Comparisons |
|---|---|---|
| 0 | 0 … n−2 | n − 1 |
| 1 | 0 … n−3 | n − 2 |
| … | … | … |
| n − 2 | 0 | 1 |
| **Total** | **n(n − 1)/2** ≈ n²/2 → O(n²) |  |

**The classic off-by-one:** writing `j < n - i` makes `a[j + 1]` read `a[n]` in the first pass: `ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5`. The last pair you compare is `(n−2, n−1)`, so `j` stops **one before** the last index.

### 7. V3 · Optimized: the swapped flag (early exit)

**In 30 seconds:** Keep a `boolean swapped`, reset it to `false` at the start of each pass, set it when you swap, and `break` if the pass ended without a swap. On a sorted array the first pass makes n − 1 comparisons and zero swaps, and the sort ends: **best case O(n)**. Average and worst stay O(n²). This is the version interviewers expect when they say "bubble sort".

```java
import java.util.Arrays;

public class BubbleOptimized {
    static int comparisons, swaps, passes;

    // V3 optimized: a pass with no swaps proves every neighbour pair is in order, so the array is sorted.
    static void bubbleSort(int[] a) {
        int n = a.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;               // reset at the start of every pass
            passes++;
            for (int j = 0; j < n - 1 - i; j++) {
                comparisons++;
                if (a[j] > a[j + 1]) {
                    int t = a[j];
                    a[j] = a[j + 1];
                    a[j + 1] = t;
                    swaps++;
                    swapped = true;
                }
            }
            if (!swapped) break;                   // early exit: best case becomes O(n)
        }
    }

    static void run(String label, int[] a) {
        comparisons = swaps = passes = 0;
        bubbleSort(a);
        System.out.println(label + Arrays.toString(a) + "  passes=" + passes + " comparisons=" + comparisons + " swaps=" + swaps);
    }

    public static void main(String[] args) {
        run("sorted   ", new int[]{1, 2, 3, 4, 5, 6, 7, 8});
        run("nearly   ", new int[]{1, 2, 3, 5, 4, 6, 7, 8});
        run("random   ", new int[]{5, 1, 4, 2, 8, 7, 3, 6});
        run("reversed ", new int[]{8, 7, 6, 5, 4, 3, 2, 1});
        run("one      ", new int[]{42});
        run("empty    ", new int[]{});
        /* Output:
           sorted   [1, 2, 3, 4, 5, 6, 7, 8]  passes=1 comparisons=7 swaps=0
           nearly   [1, 2, 3, 4, 5, 6, 7, 8]  passes=2 comparisons=13 swaps=1
           random   [1, 2, 3, 4, 5, 6, 7, 8]  passes=5 comparisons=25 swaps=11
           reversed [1, 2, 3, 4, 5, 6, 7, 8]  passes=7 comparisons=28 swaps=28
           one      [42]  passes=0 comparisons=0 swaps=0
           empty    []  passes=0 comparisons=0 swaps=0
        */
    }
}
```

*[Visual `#bsLabFlag`: Bubble Lab opened on `flag` with input `sorted`.]*

#### Why "no swaps" proves the array is sorted

If a pass compared every pair `(j, j+1)` of the unsorted part and none was out of order, then `a[0] ≤ a[1] ≤ … ≤ a[k]` for that part; and the tail after it is sorted by the invariant and holds larger values. Chained together, the whole array is in order. Nothing more can ever move, so further passes would be wasted.

| Input (n = 8) | Passes | Comparisons | Swaps | Why |
|---|---|---|---|---|
| Sorted | 1 | 7 | 0 | One check pass, then exit: O(n) |
| One pair swapped | 2 | 13 | 1 | Fix pass + one check pass |
| Random | 5 | 25 | 11 | Depends on how far the smallest values must travel left |
| Reversed | 7 | 28 | 28 | Worst case: every pair is an inversion |

**A small value at the end is slow.** A big value can move many places right in one pass (it keeps winning), but a small value moves only **one place left per pass**. That is why `[2,3,4,5,6,7,8,1]` needs all 7 passes even though it is "almost sorted". Bubble sort calls these slow small values **turtles** and fast big ones **rabbits**. Cocktail shaker sort (B11) fixes turtles.

### 8. V4 · Last-swap boundary: shrink by many slots at once

**In 30 seconds:** Remember the index of the **last swap** in a pass. No pair after it was out of order, so everything after it is already sorted and final. The next pass only needs to go up to that index, which can shrink the work by many slots in one step. It also replaces the flag: a pass with no swap leaves the boundary at 0, which ends the loop. Same Big-O as V3 (best O(n), worst O(n²)), fewer comparisons on partly sorted data.

```java
import java.util.Arrays;

public class BubbleLastSwap {
    static int comparisons;

    // V3 for comparison: stops only after a whole pass without swaps
    static void withFlag(int[] a) {
        int n = a.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - 1 - i; j++) {
                comparisons++;
                if (a[j] > a[j + 1]) { int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; swapped = true; }
            }
            if (!swapped) break;
        }
    }

    // V4 last-swap boundary: nothing after the last swap moved, so it is already sorted.
    // The next pass only needs to go up to that index (it can shrink by many slots at once).
    static void lastSwap(int[] a) {
        int bound = a.length - 1;                  // compare pairs (j, j+1) for j < bound
        while (bound > 0) {
            int last = 0;                          // 0 = no swap: the loop ends
            for (int j = 0; j < bound; j++) {
                comparisons++;
                if (a[j] > a[j + 1]) {
                    int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                    last = j;                      // everything after j+1 is in order
                }
            }
            bound = last;
        }
    }

    public static void main(String[] args) {
        int[] data = {3, 1, 2, 4, 5, 6, 7, 8};    // only the front is out of order

        int[] a = data.clone();
        comparisons = 0;
        withFlag(a);
        System.out.println("V3 flag      " + Arrays.toString(a) + " comparisons=" + comparisons);

        int[] b = data.clone();
        comparisons = 0;
        lastSwap(b);
        System.out.println("V4 last swap " + Arrays.toString(b) + " comparisons=" + comparisons);

        int[] r = {8, 7, 6, 5, 4, 3, 2, 1};       // worst case: the bound shrinks by one each pass
        comparisons = 0;
        lastSwap(r);
        System.out.println("V4 reversed  " + Arrays.toString(r) + " comparisons=" + comparisons);
        /* Output:
           V3 flag      [1, 2, 3, 4, 5, 6, 7, 8] comparisons=13
           V4 last swap [1, 2, 3, 4, 5, 6, 7, 8] comparisons=8
           V4 reversed  [1, 2, 3, 4, 5, 6, 7, 8] comparisons=28
        */
    }
}
```

*[Visual `#bsLabLast`: Bubble Lab opened on `lastswap` with input `3 1 2 4 5 6 7 8`.]*

Watch the dashed **bound** line in the lab: after pass 1 on `[3,1,2,4,5,6,7,8]` the last swap happened at `j = 1`, so the bound jumps from 7 straight down to 1, and the second pass makes a single comparison. V3 would have walked 6 more pairs to find that out.

### 9. V5 · The while and do-while forms

**In 30 seconds:** The same algorithm as V3, written as "**repeat sweeping while the last sweep swapped something**". The do-while form runs at least one sweep, which is exactly what you want: you cannot know the array is sorted until you have checked it once. A second form starts with `sorted = false` and sets it to `true` at the top of each pass. Both are O(n) best and O(n²) worst.

```java
import java.util.Arrays;

public class BubbleDoWhile {

    // V5 do-while: "keep sweeping while the last sweep changed something".
    // Same algorithm as V3, written the way many textbooks state it.
    static void bubbleSort(int[] a) {
        int n = a.length;
        boolean swapped;
        do {
            swapped = false;
            for (int j = 1; j < n; j++) {          // compares (j-1, j): no j+1 to go out of bounds
                if (a[j - 1] > a[j]) {
                    int t = a[j - 1];
                    a[j - 1] = a[j];
                    a[j] = t;
                    swapped = true;
                }
            }
            n--;                                   // the largest of this sweep is now at index n
        } while (swapped);
    }

    // The same idea with a while loop and a "sorted" flag that starts optimistic
    static void whileSorted(int[] a) {
        boolean sorted = false;
        int end = a.length - 1;
        while (!sorted) {
            sorted = true;                         // assume sorted until a swap proves otherwise
            for (int j = 0; j < end; j++) {
                if (a[j] > a[j + 1]) {
                    int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                    sorted = false;
                }
            }
            end--;
        }
    }

    public static void main(String[] args) {
        int[] a = {29, 10, 14, 37, 13};
        bubbleSort(a);
        System.out.println(Arrays.toString(a));    // [10, 13, 14, 29, 37]

        int[] b = {29, 10, 14, 37, 13};
        whileSorted(b);
        System.out.println(Arrays.toString(b));    // [10, 13, 14, 29, 37]

        int[] e = {};
        bubbleSort(e);                             // do-while runs once: the for loop does nothing
        whileSorted(e);
        System.out.println(Arrays.toString(e));    // []
    }
}
```

*[Visual `#bsLabDo`: Bubble Lab opened on `dowhile` with input `29 10 14 37 13`.]*

- Comparing `(j − 1, j)` with `j` starting at 1 is the same as `(j, j + 1)` with `j` starting at 0; pick one and keep the bounds consistent.
- `n--` after each sweep is the shrinking tail of V2, written as a changing variable instead of `n - 1 - i`.
- Use whichever form your interviewer writes; the cost and behaviour are identical.

### 10. V6 · Recursive bubble sort

**In 30 seconds:** One pass puts the largest of `a[0..n−1]` at index `n−1`; what is left is the **same problem** on the first `n − 1` elements. So: **base case** `n ≤ 1` → return; otherwise do one pass and call `bubble(a, n − 1)`. Time is the same as the loop version: T(n) = T(n−1) + (n−1) = **O(n²)**, O(n) with the early exit. But each call is a stack frame: **O(n) extra space** instead of O(1).

```java
import java.util.Arrays;

public class BubbleRecursive {

    // V6 recursive (outer loop as recursion): one pass puts the largest of a[0..n-1] at index n-1,
    // then the same problem remains for the first n-1 elements.
    static void bubble(int[] a, int n, int depth) {
        if (n <= 1) {                              // base case: 0 or 1 element is sorted
            System.out.println("  ".repeat(depth) + "bubble(n=" + n + ") base case, return");
            return;
        }
        boolean swapped = false;
        for (int j = 0; j < n - 1; j++) {          // one ordinary pass
            if (a[j] > a[j + 1]) {
                int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                swapped = true;
            }
        }
        System.out.println("  ".repeat(depth) + "bubble(n=" + n + ") after pass: " + Arrays.toString(a));
        if (!swapped) {                            // optional early exit, like V3
            System.out.println("  ".repeat(depth) + "no swaps: sorted, unwind");
            return;
        }
        bubble(a, n - 1, depth + 1);               // the recursive step works on a smaller problem
    }

    public static void main(String[] args) {
        int[] a = {4, 3, 5, 1, 2};
        bubble(a, a.length, 0);
        System.out.println("result: " + Arrays.toString(a));
        /* Output:
           bubble(n=5) after pass: [3, 4, 1, 2, 5]
             bubble(n=4) after pass: [3, 1, 2, 4, 5]
               bubble(n=3) after pass: [1, 2, 3, 4, 5]
                 bubble(n=2) after pass: [1, 2, 3, 4, 5]
                 no swaps: sorted, unwind
           result: [1, 2, 3, 4, 5]
        */
    }
}
```

*[Visual `#bsLabRec`: Bubble Lab opened on `rec` with input `4 3 5 1 2`.]*

#### Solving the recurrence

T(n) = T(n − 1) + (n − 1) unrolls to (n − 1) + (n − 2) + … + 1 + T(1) = n(n − 1)/2: the same count as V2, because recursion only replaced the outer loop. The recursion depth is at most n − 1 frames (one per pass), so the space is O(n).

**Is it tail recursive?** Yes, the recursive call is the last thing the method does, so a compiler *could* turn it back into a loop. Java does not do tail-call elimination, so every call still costs a frame. That is why recursion is a teaching tool here, not an optimisation.

### 11. V7 · Fully recursive: no loops at all

**In 30 seconds:** Replace **both** loops with recursion: `sort(a, n)` calls `pass(a, 0, n)` then `sort(a, n − 1)`; `pass(a, j, n)` compares one pair and calls `pass(a, j + 1, n)`. Time is still O(n²). The deepest stack is about **n + 1 frames** (a sort chain plus a pass chain that together stay ≤ n), so space is O(n), and for a big array it throws **`StackOverflowError`**.

```java
import java.util.Arrays;

public class BubbleFullyRecursive {
    static int depth, maxDepth;

    // V7 fully recursive: no loops at all. sort() replaces the outer loop, pass() replaces the inner loop.
    static void sort(int[] a, int n) {
        enter();
        if (n > 1) {
            pass(a, 0, n);                         // bubble the largest of a[0..n-1] to index n-1
            sort(a, n - 1);                        // then sort the rest
        }
        depth--;
    }

    static void pass(int[] a, int j, int n) {
        enter();
        if (j < n - 1) {                           // base case: j reached the last pair
            if (a[j] > a[j + 1]) {
                int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
            }
            pass(a, j + 1, n);                     // next pair
        }
        depth--;
    }

    static void enter() {
        depth++;
        maxDepth = Math.max(maxDepth, depth);
    }

    public static void main(String[] args) {
        int[] a = {6, 2, 9, 1, 5, 3};
        sort(a, a.length);
        System.out.println(Arrays.toString(a) + " max stack depth = " + maxDepth);
        // [1, 2, 3, 5, 6, 9] max stack depth = 7   (n + 1 frames: O(n) extra space, not O(1))

        int[] big = new int[1_000_000];            // already sorted, but recursion still goes n frames deep
        try {
            sort(big, big.length);
        } catch (StackOverflowError e) {
            System.out.println("StackOverflowError for n = " + big.length + ": use the loop version for large arrays");
        }
    }
}
```

*[Visual `#bsLabFull`: Bubble Lab opened on `fullrec` with input `6 2 9 1 5 3`.]*

- Why only about n frames, not n²? At depth *d* of the `sort` chain the array part has n − d + 1 elements, so the `pass` chain started there is at most n − d deep: d + (n − d) ≈ n.
- The default thread stack (often 512 KB to 1 MB) holds tens of thousands of small frames, not a million, so `n = 1_000_000` overflows in the first pass even though the array is already sorted.
- An interviewer asking for this wants to see a clear **base case** for each function and a **smaller sub-problem** in each call. Say the space cost before they ask.

### 12. V8 · Generic, descending, and stable bubble sort

**In 30 seconds:** Make it work for any type: `<T extends Comparable<? super T>>` with `compareTo(…) > 0`, or any order with a `Comparator<? super T>` (`reverseOrder()` for descending, `comparing(…).thenComparing(…)` for several keys). Bubble sort is **stable** because it swaps only when the left element is **strictly** greater; change `> 0` to `>= 0` and equal elements swap past each other, destroying stability (and adding useless swaps).

```java
import java.util.Arrays;
import java.util.Comparator;

public class BubbleGeneric {

    // V8a any Comparable type: Integer, String, LocalDate, your own records...
    static <T extends Comparable<? super T>> void sort(T[] a) {
        for (int i = 0; i < a.length - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < a.length - 1 - i; j++) {
                if (a[j].compareTo(a[j + 1]) > 0) {   // > 0 means "a[j] comes after a[j+1]"
                    swap(a, j, j + 1);
                    swapped = true;
                }
            }
            if (!swapped) return;
        }
    }

    // V8b any order you like: pass a Comparator
    static <T> void sort(T[] a, Comparator<? super T> c) {
        for (int i = 0; i < a.length - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < a.length - 1 - i; j++) {
                if (c.compare(a[j], a[j + 1]) > 0) {  // strict > 0: equal elements never swap, so it is STABLE
                    swap(a, j, j + 1);
                    swapped = true;
                }
            }
            if (!swapped) return;
        }
    }

    // A deliberately broken copy: >= 0 also swaps equal elements, which destroys stability
    static <T> void sortUnstable(T[] a, Comparator<? super T> c) {
        for (int i = 0; i < a.length - 1; i++)
            for (int j = 0; j < a.length - 1 - i; j++)
                if (c.compare(a[j], a[j + 1]) >= 0) swap(a, j, j + 1);
    }

    static <T> void swap(T[] a, int i, int j) {
        T t = a[i];
        a[i] = a[j];
        a[j] = t;
    }

    record Student(String name, int marks) {
        @Override public String toString() { return name + ":" + marks; }
    }

    public static void main(String[] args) {
        Integer[] nums = {5, 1, 4, 2, 8};
        sort(nums);
        System.out.println(Arrays.toString(nums));          // [1, 2, 4, 5, 8]

        sort(nums, Comparator.reverseOrder());              // descending
        System.out.println(Arrays.toString(nums));          // [8, 5, 4, 2, 1]

        String[] words = {"pear", "Banana", "apple", "cherry"};
        sort(words);                                        // natural order: uppercase sorts before lowercase
        System.out.println(Arrays.toString(words));         // [Banana, apple, cherry, pear]
        sort(words, String.CASE_INSENSITIVE_ORDER);
        System.out.println(Arrays.toString(words));         // [apple, Banana, cherry, pear]
        sort(words, Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
        System.out.println(Arrays.toString(words));         // [pear, apple, Banana, cherry]

        Student[] s = {new Student("Asha", 90), new Student("Ravi", 85), new Student("Meena", 90),
                       new Student("John", 85), new Student("Zoya", 70)};
        Comparator<Student> byMarks = Comparator.comparingInt(Student::marks);

        Student[] stable = s.clone();
        sort(stable, byMarks);
        System.out.println("stable   " + Arrays.toString(stable));
        // stable   [Zoya:70, Ravi:85, John:85, Asha:90, Meena:90]   Ravi before John, Asha before Meena: input order kept

        Student[] broken = s.clone();
        sortUnstable(broken, byMarks);
        System.out.println("unstable " + Arrays.toString(broken));
        // unstable [Zoya:70, John:85, Ravi:85, Meena:90, Asha:90]   equal marks swapped places: order lost
    }
}
```

*[Visual `#bsStable`: Stability lab: [2A, 1A, 2B, 3A, 1B, 2C] sorted with `>` (stable, 5 swaps) or `>=` (order lost); verdict per value group.]*

**Why stability matters:** sort orders by date, then sort them stably by customer: each customer's orders are still in date order. Java's `Arrays.sort(Object[])` and `List.sort` (TimSort) are stable for this reason; `Arrays.sort(int[])` does not need to be, because equal ints are indistinguishable.

- **`? super T`** lets a `Comparator<Object>` or a parent-class comparator sort a `T[]`: the "consumer super" half of PECS.
- Generic methods need **reference** arrays (`Integer[]`, not `int[]`): generics do not work with primitives. Each `compareTo` call also costs more than an `int` comparison.
- String natural order is by UTF-16 code, so `"Banana"` (B = 66) comes before `"apple"` (a = 97). Use `String.CASE_INSENSITIVE_ORDER` when that matters.

### 13. The family: cocktail shaker, odd–even and comb sort

**In 30 seconds:** Three famous relatives fix bubble sort's weak spots. **Cocktail shaker** (V9) sweeps right, then left, so turtles move to the front in one backward sweep. **Odd–even transposition** (V10) compares disjoint pairs, so all comparisons of one phase can run **in parallel**: O(n) rounds on n/2 processors. **Comb sort** (V11) compares elements a **gap** apart and shrinks the gap by 1.3 each pass, which removes turtles early and makes it far faster in practice (around n log n comparisons on random data), though its worst case is still O(n²).

#### V9 · Cocktail shaker sort (bidirectional bubble sort)

```java
import java.util.Arrays;

public class CocktailSort {
    static int comparisons, passes;

    // V9 cocktail shaker sort (bidirectional bubble sort): sweep right to push the largest to the end,
    // then sweep left to pull the smallest to the front. Small values stuck at the end ("turtles")
    // now move all the way left in one backward sweep instead of one step per pass.
    static void cocktail(int[] a) {
        int lo = 0, hi = a.length - 1;
        boolean swapped = true;
        while (swapped && lo < hi) {
            swapped = false;
            passes++;
            for (int j = lo; j < hi; j++) {        // forward sweep: largest goes to hi
                comparisons++;
                if (a[j] > a[j + 1]) { swap(a, j, j + 1); swapped = true; }
            }
            hi--;
            if (!swapped) break;
            swapped = false;
            passes++;
            for (int j = hi; j > lo; j--) {        // backward sweep: smallest goes to lo
                comparisons++;
                if (a[j - 1] > a[j]) { swap(a, j - 1, j); swapped = true; }
            }
            lo++;
        }
    }

    static void bubble(int[] a) {                   // V3, for comparison
        for (int i = 0; i < a.length - 1; i++) {
            boolean swapped = false;
            passes++;
            for (int j = 0; j < a.length - 1 - i; j++) {
                comparisons++;
                if (a[j] > a[j + 1]) { swap(a, j, j + 1); swapped = true; }
            }
            if (!swapped) break;
        }
    }

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    public static void main(String[] args) {
        int[] turtle = {2, 3, 4, 5, 6, 7, 8, 1};   // the 1 at the end is a "turtle"

        int[] a = turtle.clone();
        comparisons = passes = 0;
        bubble(a);
        System.out.println("bubble   " + Arrays.toString(a) + " passes=" + passes + " comparisons=" + comparisons);

        int[] b = turtle.clone();
        comparisons = passes = 0;
        cocktail(b);
        System.out.println("cocktail " + Arrays.toString(b) + " passes=" + passes + " comparisons=" + comparisons);
        /* Output:
           bubble   [1, 2, 3, 4, 5, 6, 7, 8] passes=7 comparisons=28
           cocktail [1, 2, 3, 4, 5, 6, 7, 8] passes=3 comparisons=18
        */
    }
}
```

*[Visual `#bsLabShaker`: Bubble Lab opened on `shaker` with input `2 3 4 5 6 7 8 1`.]*

#### V10 · Odd–even transposition sort (brick sort)

```java
import java.util.Arrays;

public class OddEvenSort {

    // V10 odd-even transposition sort ("brick sort"): alternate two phases.
    // Odd phase compares pairs (1,2), (3,4), ...; even phase compares (0,1), (2,3), ...
    // The pairs inside one phase never overlap, so with n/2 processors each phase takes one step:
    // n rounds of O(1) each = O(n) time in parallel. On one CPU it is still O(n²).
    static void oddEven(int[] a) {
        boolean sorted = false;
        int round = 0;
        while (!sorted) {
            sorted = true;
            for (int j = 1; j < a.length - 1; j += 2) {    // odd phase
                if (a[j] > a[j + 1]) { swap(a, j, j + 1); sorted = false; }
            }
            for (int j = 0; j < a.length - 1; j += 2) {    // even phase
                if (a[j] > a[j + 1]) { swap(a, j, j + 1); sorted = false; }
            }
            System.out.println("round " + (++round) + ": " + Arrays.toString(a));
        }
    }

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    public static void main(String[] args) {
        int[] a = {6, 5, 4, 3, 2, 1};
        oddEven(a);
        System.out.println("sorted: " + Arrays.toString(a));
        /* Output:
           round 1: [4, 6, 2, 5, 1, 3]
           round 2: [2, 4, 1, 6, 3, 5]
           round 3: [1, 2, 3, 4, 5, 6]
           round 4: [1, 2, 3, 4, 5, 6]
           sorted: [1, 2, 3, 4, 5, 6]
        */
    }
}
```

*[Visual `#bsLabOddEven`: Bubble Lab opened on `oddeven` with input `6 5 4 3 2 1`.]*

#### V11 · Comb sort: bubble sort with a shrinking gap

```java
import java.util.Arrays;
import java.util.Random;

public class CombSort {
    static long comparisons;

    // V11 comb sort: bubble sort with a gap. Compare a[j] with a[j+gap] and shrink the gap by 1.3
    // each pass, so turtles jump far left early. When the gap reaches 1 it is plain bubble sort
    // with the early-exit flag, finishing an array that is already almost sorted.
    static void comb(int[] a) {
        int gap = a.length;
        boolean swapped = true;
        while (gap > 1 || swapped) {
            gap = Math.max(1, (int) (gap / 1.3));  // 1.3 is the shrink factor found by experiment
            swapped = false;
            for (int j = 0; j + gap < a.length; j++) {
                comparisons++;
                if (a[j] > a[j + gap]) {
                    int t = a[j]; a[j] = a[j + gap]; a[j + gap] = t;
                    swapped = true;
                }
            }
        }
    }

    static void bubble(int[] a) {                   // V3, for comparison
        for (int i = 0; i < a.length - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < a.length - 1 - i; j++) {
                comparisons++;
                if (a[j] > a[j + 1]) { int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; swapped = true; }
            }
            if (!swapped) break;
        }
    }

    public static void main(String[] args) {
        int[] small = {8, 4, 1, 56, 3, -44, 23, -6, 28, 0};
        comb(small);
        System.out.println(Arrays.toString(small));

        int[] data = new Random(42).ints(10_000, 0, 1_000_000).toArray();
        int[] x = data.clone(), y = data.clone();

        comparisons = 0;
        bubble(x);
        System.out.println("bubble comparisons: " + comparisons);

        comparisons = 0;
        comb(y);
        System.out.println("comb   comparisons: " + comparisons);
        System.out.println("same result: " + Arrays.equals(x, y));
        /* Output:
           [-44, -6, 0, 1, 3, 4, 8, 23, 28, 56]
           bubble comparisons: 49967034
           comb   comparisons: 326734
           same result: true
        */
    }
}
```

*[Visual `#bsLabComb`: Bubble Lab opened on `comb` with input `reversed`.]*

| Variant | Fixes | Best | Average | Worst | Stable |
|---|---|---|---|---|---|
| Cocktail shaker | Turtles at the end | O(n) | O(n²) | O(n²) | Yes |
| Odd–even | Sequential dependency (parallel hardware) | O(n) | O(n²), O(n) rounds in parallel | O(n²) | Yes |
| Comb sort | Turtles anywhere, by long jumps | O(n log n) | ≈ n log n in practice | O(n²) | **No** (gap swaps jump over equal values) |

### 14. Special cases: linked lists, inversions, top-k and swap traps

**In 30 seconds:** Bubble sort only needs "next neighbour", so it works on a **singly linked list**: swap the values, or relink the nodes with a dummy head. Every swap of neighbours removes exactly **one inversion**, so the number of swaps equals the number of inversions. **k passes** leave the k largest values sorted at the end, O(n·k). XOR or add/subtract swaps "without a temp" break when both indexes are the same.

#### Bubble sort on a linked list

```java
public class BubbleLinkedList {

    static class Node {
        int val;
        Node next;
        Node(int val, Node next) { this.val = val; this.next = next; }
    }

    // Way 1: swap the VALUES. Simple; the nodes stay where they are.
    static void sortValues(Node head) {
        for (Node end = null; end != head; ) {     // end = first node of the sorted tail
            Node cur = head;
            while (cur.next != end) {
                if (cur.val > cur.next.val) {
                    int t = cur.val; cur.val = cur.next.val; cur.next.val = t;
                }
                cur = cur.next;
            }
            end = cur;                             // cur now holds the largest unsorted value
        }
    }

    // Way 2: swap the NODES (needed when a node carries a lot of data, or other code holds references).
    // A dummy node before the head means the first pair needs no special case.
    static Node sortNodes(Node head) {
        Node dummy = new Node(0, head), end = null;
        boolean swapped;
        do {
            swapped = false;
            Node prev = dummy, cur = dummy.next;
            while (cur != null && cur.next != end) {
                Node nxt = cur.next;
                if (cur.val > nxt.val) {           // relink prev -> nxt -> cur
                    cur.next = nxt.next;
                    nxt.next = cur;
                    prev.next = nxt;
                    prev = nxt;                    // cur moved one step right by itself
                    swapped = true;
                } else {
                    prev = cur;
                    cur = nxt;
                }
            }
            end = cur;                             // the last node of this pass is in its final place
        } while (swapped);
        return dummy.next;
    }

    static Node list(int... v) {
        Node head = null;
        for (int i = v.length - 1; i >= 0; i--) head = new Node(v[i], head);
        return head;
    }

    static String show(Node h) {
        StringBuilder sb = new StringBuilder();
        for (; h != null; h = h.next) sb.append(h.val).append(h.next != null ? " -> " : "");
        return sb.toString();
    }

    public static void main(String[] args) {
        Node a = list(4, 2, 5, 1, 3);
        sortValues(a);
        System.out.println(show(a));               // 1 -> 2 -> 3 -> 4 -> 5

        Node b = list(4, 2, 5, 1, 3);
        Node first = b;                            // a reference to the node holding 4
        b = sortNodes(b);
        System.out.println(show(b));               // 1 -> 2 -> 3 -> 4 -> 5
        System.out.println(first.val);             // 4 (the node moved; its value did not change)

        System.out.println(show(sortNodes(null)).isEmpty()); // true: an empty list is fine
    }
}
```

#### Inversions, top-k and the swap traps

An **inversion** is a pair of positions `i < j` with `a[i] > a[j]`. A sorted array has 0; a reversed one has the maximum, n(n−1)/2. Swapping two out-of-order **neighbours** fixes that one pair and changes no other pair's order, so it removes exactly one inversion. The grid below shows it: each swap switches off exactly one cell.

*[Visual `#bsInv`: Inversions grid: lower-triangle grid of value pairs, lit while the bigger value stands first; each swap switches off exactly one cell; inversions left + swaps done stays constant.]*

```java
import java.util.Arrays;

public class BubbleTricks {

    // Bubble sort swaps only neighbours that are out of order, and each such swap fixes exactly one
    // inversion (a pair i < j with a[i] > a[j]). So: number of swaps == number of inversions.
    static int bubbleSwaps(int[] a) {
        int swaps = 0;
        for (int i = 0; i < a.length - 1; i++)
            for (int j = 0; j < a.length - 1 - i; j++)
                if (a[j] > a[j + 1]) { int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; swaps++; }
        return swaps;
    }

    static int inversions(int[] a) {               // brute force: check every pair, O(n²)
        int count = 0;
        for (int i = 0; i < a.length; i++)
            for (int j = i + 1; j < a.length; j++)
                if (a[i] > a[j]) count++;
        return count;
    }

    // k passes of bubble sort leave the k largest values, sorted, at the end: O(n·k)
    static int[] topK(int[] a, int k) {
        int[] b = a.clone();
        for (int i = 0; i < k; i++)
            for (int j = 0; j < b.length - 1 - i; j++)
                if (b[j] > b[j + 1]) { int t = b[j]; b[j] = b[j + 1]; b[j + 1] = t; }
        return Arrays.copyOfRange(b, b.length - k, b.length);
    }

    // "Clever" swaps without a temp variable
    static void xorSwap(int[] a, int i, int j) { a[i] ^= a[j]; a[j] ^= a[i]; a[i] ^= a[j]; }
    static void addSwap(int[] a, int i, int j) { a[i] = a[i] + a[j]; a[j] = a[i] - a[j]; a[i] = a[i] - a[j]; }

    public static void main(String[] args) {
        int[] a = {3, 1, 4, 1, 5, 9, 2, 6};
        System.out.println("inversions = " + inversions(a) + ", bubble swaps = " + bubbleSwaps(a.clone()));
        System.out.println("top 3 = " + Arrays.toString(topK(a, 3)));

        int[] big = {Integer.MAX_VALUE, 1};
        addSwap(big, 0, 1);                        // overflows, but wraps back: still correct
        System.out.println("add swap with overflow: " + Arrays.toString(big));

        int[] same = {7, 8};
        xorSwap(same, 0, 0);                       // i == j: x ^ x == 0 wipes the value
        System.out.println("xor swap of index 0 with itself: " + Arrays.toString(same));
        int[] same2 = {7, 8};
        addSwap(same2, 0, 0);                      // same trap: a[0] = 14, then 14 - 14 = 0
        System.out.println("add swap of index 0 with itself: " + Arrays.toString(same2));
        /* Output:
           inversions = 8, bubble swaps = 8
           top 3 = [5, 6, 9]
           add swap with overflow: [1, 2147483647]
           xor swap of index 0 with itself: [0, 8]
           add swap of index 0 with itself: [0, 8]
        */
    }
}
```

- **Swaps = inversions** is also why bubble sort's swap count is the same for V1–V4 and cocktail on the same input (B13's table): they all swap only adjacent inversions.
- The add/subtract swap survives overflow because `int` arithmetic wraps around and then wraps back. Both tricks fail on **aliasing**: `i == j` makes the first step zero the value. A temp variable is clearer and just as fast.
- Counting inversions with bubble sort is O(n²); merge sort counts them in O(n log n), a classic follow-up question.

### 15. Time and space complexity: the master table

**In 30 seconds:** Every bubble-family sort is **O(n²) in the worst case**. The flag (V3+) makes the best case **O(n)** on sorted input. Loop versions use **O(1)** extra space; recursive versions use **O(n)** stack. The number of swaps always equals the number of inversions (about n²/4 on random data). Comb sort is the only one that is fast on random data in practice, and the only unstable one.

| Variant | Best | Average | Worst | Comparisons (worst) | Space | Stable | Adaptive |
|---|---|---|---|---|---|---|---|
| V1 brute force | O(n²) | O(n²) | O(n²) | (n−1)² on every input | O(1) | Yes | No |
| V2 standard | O(n²) | O(n²) | O(n²) | n(n−1)/2 on every input | O(1) | Yes | No |
| V3 swapped flag | **O(n)** | O(n²) | O(n²) | n(n−1)/2; n−1 if sorted | O(1) | Yes | Yes |
| V4 last-swap bound | **O(n)** | O(n²) | O(n²) | ≤ V3 on every input | O(1) | Yes | Yes |
| V5 do-while | O(n) | O(n²) | O(n²) | same as V3 | O(1) | Yes | Yes |
| V6 recursive | O(n) | O(n²) | O(n²) | same as V3 | **O(n)** stack | Yes | Yes |
| V7 fully recursive | O(n²) | O(n²) | O(n²) | n(n−1)/2 | **O(n)** stack | Yes | No |
| V8 generic | O(n) | O(n²) | O(n²) | same as V3 (each compare is a method call) | O(1) | Yes (with `> 0`) | Yes |
| V9 cocktail shaker | O(n) | O(n²) | O(n²) | n(n−1)/2 | O(1) | Yes | Yes |
| V10 odd–even | O(n) | O(n²) | O(n²) | ≈ n²/2; O(n) parallel rounds | O(1) | Yes | Yes |
| V11 comb | O(n log n) | ≈ O(n log n) in practice | O(n²) | ≈ 2.5·n·log₂n measured at n = 10,000 | O(1) | **No** | Partly |

#### Measured: n = 1000, four kinds of input

```java
import java.util.Random;
import java.util.function.Consumer;

public class BubbleCounts {
    static long cmp, swp;

    static boolean gt(int[] a, int i, int j) { cmp++; return a[i] > a[j]; }
    static void swap(int[] a, int i, int j) { swp++; int t = a[i]; a[i] = a[j]; a[j] = t; }

    static void brute(int[] a) {
        for (int i = 0; i < a.length - 1; i++)
            for (int j = 0; j < a.length - 1; j++) if (gt(a, j, j + 1)) swap(a, j, j + 1);
    }
    static void standard(int[] a) {
        for (int i = 0; i < a.length - 1; i++)
            for (int j = 0; j < a.length - 1 - i; j++) if (gt(a, j, j + 1)) swap(a, j, j + 1);
    }
    static void flag(int[] a) {
        for (int i = 0; i < a.length - 1; i++) {
            boolean s = false;
            for (int j = 0; j < a.length - 1 - i; j++) if (gt(a, j, j + 1)) { swap(a, j, j + 1); s = true; }
            if (!s) break;
        }
    }
    static void lastSwap(int[] a) {
        for (int bound = a.length - 1; bound > 0; ) {
            int last = 0;
            for (int j = 0; j < bound; j++) if (gt(a, j, j + 1)) { swap(a, j, j + 1); last = j; }
            bound = last;
        }
    }
    static void cocktail(int[] a) {
        int lo = 0, hi = a.length - 1;
        boolean s = true;
        while (s && lo < hi) {
            s = false;
            for (int j = lo; j < hi; j++) if (gt(a, j, j + 1)) { swap(a, j, j + 1); s = true; }
            hi--;
            if (!s) break;
            s = false;
            for (int j = hi; j > lo; j--) if (gt(a, j - 1, j)) { swap(a, j - 1, j); s = true; }
            lo++;
        }
    }
    static void comb(int[] a) {
        int gap = a.length;
        boolean s = true;
        while (gap > 1 || s) {
            gap = Math.max(1, (int) (gap / 1.3));
            s = false;
            for (int j = 0; j + gap < a.length; j++) if (gt(a, j, j + gap)) { swap(a, j, j + gap); s = true; }
        }
    }

    static void row(String name, Consumer<int[]> sort, int[][] inputs) {
        StringBuilder sb = new StringBuilder(String.format("%-10s", name));
        for (int[] in : inputs) {
            cmp = swp = 0;
            sort.accept(in.clone());
            sb.append(String.format("%10d %8d |", cmp, swp));
        }
        System.out.println(sb);
    }

    public static void main(String[] args) {
        int n = 1000;
        int[] sorted = new int[n], reversed = new int[n];
        for (int i = 0; i < n; i++) { sorted[i] = i; reversed[i] = n - 1 - i; }
        Random r = new Random(7);
        int[] random = r.ints(n, 0, n).toArray();
        int[] nearly = sorted.clone();
        for (int k = 0; k < 10; k++) { int i = r.nextInt(n - 1); int t = nearly[i]; nearly[i] = nearly[i + 1]; nearly[i + 1] = t; }

        int[][] inputs = {sorted, nearly, random, reversed};
        System.out.println("n = 1000   sorted (cmp swp)  | nearly (cmp swp)   | random (cmp swp)   | reversed (cmp swp)");
        row("V1 brute", BubbleCounts::brute, inputs);
        row("V2 std", BubbleCounts::standard, inputs);
        row("V3 flag", BubbleCounts::flag, inputs);
        row("V4 last", BubbleCounts::lastSwap, inputs);
        row("V9 shaker", BubbleCounts::cocktail, inputs);
        row("V11 comb", BubbleCounts::comb, inputs);
        /* Output:
           n = 1000   sorted (cmp swp)  | nearly (cmp swp)   | random (cmp swp)   | reversed (cmp swp)
           V1 brute      998001        0 |    998001       10 |    998001   250000 |    998001   499500 |
           V2 std        499500        0 |    499500       10 |    499500   250000 |    499500   499500 |
           V3 flag          999        0 |      1997       10 |    499247   250000 |    499500   499500 |
           V4 last          999        0 |      1901       10 |    498369   250000 |    499500   499500 |
           V9 shaker        999        0 |      1997       10 |    381645   250000 |    499500   499500 |
           V11 comb       18713        0 |     19712       10 |     21710     4111 |     19712     1582 |
        */
    }
}
```

- **Sorted:** the flag versions do one pass of 999 comparisons; V1 and V2 still do ~10⁶ and ~5·10⁵.
- **Nearly sorted** (10 neighbour swaps): two passes. Bubble sort with a flag is genuinely good here, which is why insertion sort and bubble sort are used inside hybrids for small, nearly sorted runs.
- **Random:** swaps = 250,000 ≈ n²/4 (the expected number of inversions is n(n−1)/4 = 249,750). The flag barely helps: random data needs nearly all passes.
- **Reversed:** every pair is an inversion: 499,500 = n(n−1)/2 comparisons and swaps for every adjacent-swap variant.

#### See it grow: the complexity chart

The chart runs each variant in your browser for n = 4 … 64 and plots the measured comparisons (or swaps) next to the reference curves n, n²/2 and n². Switch the input to **Sorted** to watch the flag variants drop onto the **n** line.

*[Visual `#bsChart`: Complexity chart: measured comparisons or swaps for n = 4 … 64 for V1, V2, V3, V4, V9, V11 on random (average of 5), sorted, nearly sorted or reversed input, with dashed n, n²/2, n² reference curves, linear/log scale, hover tooltip, number table.]*

#### Race the variants

*[Visual `#bsRace`: Variant race: six lanes (V1, V2, V3, V4, V9, V11) on the same data, one comparison per lane per tick, finish order and a verdict per input type.]*

#### Space complexity, precisely

- **Loop versions:** a few `int`s and a `boolean` (i, j, temp, swapped, bound): O(1), whatever n is. The input array itself is not "extra" space.
- **Recursive versions:** one stack frame per active call. V6 keeps up to n − 1 frames, V7 about n + 1: O(n). A frame holds the return address, the parameters and the locals.
- **Generic version:** still O(1) extra, but an `Integer[]` of n boxed values uses about 4–5 times the memory of an `int[]`.

**When is bubble sort the right answer?** Almost never for big data. It is fine for tiny arrays (n ≤ ~10), for data that is known to be nearly sorted, for "is this array sorted?" (one pass), for hardware or parallel sorting networks (odd–even), and for teaching. For everything else use `Arrays.sort` / `List.sort`.

### 16. Bubble sort: mistakes, interview questions and review

#### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| `j < n - i` or `j < n` | `a[j + 1]` reads past the end: `ArrayIndexOutOfBoundsException` | Last pair is `(n−2, n−1)`: `j < n - 1 - i` |
| `swapped` declared outside the outer loop and never reset | After the first swap it stays `true`: no early exit ever | Reset it at the start of every pass |
| `>=` instead of `>` | Equal elements swap: **unstable**, extra swaps | Swap only when strictly greater |
| Swapping without a temp: `a[j] = a[j+1]; a[j+1] = a[j];` | Both slots end with the same value; data is lost | Use a temp (or a `swap` helper) |
| Calling recursion without a base case or without shrinking `n` | `StackOverflowError` | `if (n <= 1) return;` and call with `n − 1` |
| Claiming "bubble sort is O(n) best case" for V1/V2 | Wrong: without the flag every input costs n²/2 or more | Say "O(n) best case **with the swapped-flag optimization**" |
| Using recursion for large n | O(n) stack, overflow around tens of thousands | Use the loop version |

#### Interview answer cards

**Interview answer — "Explain bubble sort and its complexity."**

> "Bubble sort repeatedly walks the array and swaps adjacent elements that are out of order. After each pass the largest remaining element is in its final position at the end, so the next pass can stop one earlier. That gives n(n−1)/2 comparisons, O(n²) in the average and worst case. With a swapped flag, a pass with no swaps proves the array is sorted, so on sorted input it finishes in one pass: O(n) best case. It is in-place with O(1) extra space and stable, because it only swaps strictly greater elements."

**Follow-ups:** Why is it stable? · How many swaps on a reversed array? (n(n−1)/2) · How would you make it faster on "turtles"? (cocktail shaker / comb sort) · What does the recursive version cost in space? (O(n) stack)

**Interview answer — "Bubble sort vs selection sort vs insertion sort?"**

> "All three are O(n²) on average. Selection sort always does n(n−1)/2 comparisons but at most n − 1 swaps, and is not stable. Bubble sort does as many swaps as there are inversions, but with the flag it is O(n) on sorted data. Insertion sort also does one shift per inversion but usually fewer comparisons than bubble sort, is stable, adaptive and online, so it is the one real libraries use for small runs."

**Follow-ups:** Which writes to memory least? (selection) · Which one does TimSort use inside? (binary insertion sort)

#### 15 interview questions

**Q01. How does bubble sort work?** It compares each pair of neighbours `a[j]`, `a[j+1]` and swaps them if they are out of order. One walk over the array is a pass; after pass k the k largest values are in their final places at the end. At most n − 1 passes sort the array.

**Q02. What are the best, average and worst case time complexities?** Worst and average O(n²). Best case O(n) only with the swapped-flag optimization (one pass over sorted input); the plain version is O(n²) even on sorted input.

**Q03. What is the space complexity?** O(1) extra for the loop versions: a few index variables, a temp and a flag. The recursive versions need O(n) stack frames.

**Q04. Is bubble sort stable? Why?** Yes: it only swaps when the left element is strictly greater, so two equal elements never pass each other. Using `>=` breaks stability.

**Q05. Why can the inner loop stop at `n − 1 − i`?** Invariant: after pass i (from 0), the last i + 1 slots hold the largest values in their final order, so comparing them again can never cause a swap. The last pair to compare is `(n−2−i, n−1−i)`.

**Q06. What does the swapped flag do, and why is it correct?** It records whether a pass swapped anything. If not, every neighbour pair is in order, so the array is sorted and the loop can stop. It turns the best case into O(n).

**Q07. How many comparisons and swaps does bubble sort make on a reversed array of n elements?** n(n−1)/2 comparisons and n(n−1)/2 swaps: every pair is an inversion and every comparison causes a swap. For n = 5 that is 10 and 10.

**Q08. How do you write bubble sort recursively, and what does it cost?** Base case `n ≤ 1`; otherwise do one pass to move the largest to index n−1, then recurse on n − 1. Time T(n) = T(n−1) + O(n) = O(n²); space O(n) for the call stack. A fully recursive version also turns the pass into recursion, still O(n) stack.

**Q09. What are "turtles" and "rabbits"?** Large values near the start move quickly to the end (many positions per pass): rabbits. Small values near the end move only one position left per pass: turtles. Cocktail shaker and comb sort exist to move turtles faster.

**Q10. What is the relationship between swaps and inversions?** Each adjacent swap of an out-of-order pair removes exactly one inversion and creates none, and bubble sort ends at 0 inversions, so the number of swaps equals the number of inversions in the input.

**Q11. How is cocktail shaker sort different from bubble sort?** It alternates a forward pass (largest to the end) with a backward pass (smallest to the front), shrinking from both sides. Same O(n²) worst case, but turtles move to the front in one backward pass, so it often needs fewer passes.

**Q12. What is comb sort, and is it stable?** Bubble sort that compares elements a gap apart, shrinking the gap by about 1.3 each pass until it reaches 1. It kills turtles early and is much faster in practice, but swaps over a distance can jump over equal elements, so it is not stable. Worst case still O(n²).

**Q13. Why is odd–even transposition sort interesting?** The pairs compared in one phase never overlap, so all of them can be compared at the same time. With n/2 processors it sorts in n rounds: O(n) parallel time. It is used in sorting networks and GPUs.

**Q14. How do you bubble sort a linked list?** Walk with `cur` and `cur.next` up to a moving `end` marker. Either swap the values (simplest), or relink nodes using a dummy head and a `prev` pointer: `prev.next = nxt; cur.next = nxt.next; nxt.next = cur`. O(n²) time, O(1) space.

**Q15. When would you actually use bubble sort?** Very small inputs, data that is almost sorted, checking if an array is sorted in one pass, parallel sorting networks (odd–even), or teaching. For real data use `Arrays.sort` / `List.sort`: Dual-Pivot Quicksort for primitives, TimSort for objects.

#### Practice problems

1. **Count passes.** Modify V3 to return the number of passes it needed. Predict it for `[2,3,4,5,1]` before running (answer: 4).
2. **Sort descending** with `int[]` and no Comparator. (Flip `>` to `<`.)
3. **Sort strings by length, then alphabetically,** with the generic V8 and one Comparator.
4. **Minimum adjacent swaps** to sort an array = number of inversions. Write it with bubble sort, then think about doing it in O(n log n).
5. **Is it sorted after k passes?** Given an array and k, print the array after exactly k passes of V2.
6. **Linked list.** Implement bubble sort that swaps nodes in a **doubly** linked list.

#### 5 takeaways

- Bubble sort swaps out-of-order neighbours; after pass k the k largest values are parked at the end.
- Inner loop `j < n - 1 - i`; swap only on `>` (stable); reset `swapped` every pass.
- O(n²) average/worst; O(n) best only with the flag; O(1) space for loops, O(n) stack for recursion.
- Swaps = inversions; small values at the end (turtles) are the slow part; cocktail and comb sort fix them.
- Know it to explain invariants and cost; in real code use `Arrays.sort`.

#### Check yourself

Quiz: the 12 questions are under "Practice layer" → "Lesson 06 quiz".

Next in the path: Selection sort →

### 17. Selection sort: the idea and a dry run

**In 30 seconds:** Split the array into a sorted front and an unsorted back. Each pass **selects the smallest** value of the unsorted part and swaps it to the front of that part. After pass i, a[0..i] holds the i + 1 smallest values in order. It always makes n(n − 1)/2 comparisons, but **at most n − 1 swaps**, fewer than any other simple sort. It is **not stable** and **not adaptive**.

**Why it exists:** It is the most direct way to sort by hand: find the smallest, put it first, repeat. Its one real strength is the number of writes: when writing is expensive (flash memory, huge records) n − 1 swaps can matter more than n² comparisons.

**Analogy (remember this one):** Picking a football team in order of height: scan the whole line for the shortest player, bring them to the front, then scan the rest again. You walk the whole line every time, even if it was already in order, but each player moves at most once.

#### How it works

1. For i = 0 … n − 2, start with `min = i`.
2. Scan j = i + 1 … n − 1; when `a[j] < a[min]`, set `min = j`.
3. Swap a[i] with a[min] (skip it when min == i). a[i] is now final.
4. Stop after n − 1 passes: the last value is the largest.

> 💡 **Remember it:** Selection sort = **select** the minimum, then **swap once**. Many comparisons, very few swaps.

#### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `sel_std`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

#### Dry run

```java
import java.util.Arrays;

public class SelectionDemo {

    public static void main(String[] args) {
        int[] a = {64, 25, 12, 22, 11};
        int n = a.length, comparisons = 0, swaps = 0;
        for (int i = 0; i < n - 1; i++) {
            int min = i;
            for (int j = i + 1; j < n; j++) {
                comparisons++;
                if (a[j] < a[min]) min = j;            // remember the index of the smallest so far
            }
            if (min != i) {
                int t = a[i]; a[i] = a[min]; a[min] = t;
                swaps++;
            }
            System.out.println("pass " + (i + 1) + ": min of a[" + i + ".." + (n - 1) + "] is " + a[i]
                    + " -> " + Arrays.toString(a));
        }
        System.out.println("comparisons = " + comparisons + ", swaps = " + swaps);
        /* Output:
           pass 1: min of a[0..4] is 11 -> [11, 25, 12, 22, 64]
           pass 2: min of a[1..4] is 12 -> [11, 12, 25, 22, 64]
           pass 3: min of a[2..4] is 22 -> [11, 12, 22, 25, 64]
           pass 4: min of a[3..4] is 25 -> [11, 12, 22, 25, 64]
           comparisons = 10, swaps = 3
        */
    }
}
```

▶ See it step by step in the explorer

### 18. Selection sort: every type in Java

4 ways to write it. Every method below was compiled on JDK 25 and checked against `Arrays.sort` on 3,000 random arrays (`Sorts.java`); `swap(a, i, j)` is the usual three-line helper. Each **See it** button opens that exact code in the explorer at the top, stepping line by line.

#### Selection sort

Each pass finds the **smallest** value of the unsorted part and swaps it to the front. When writes are expensive: at most n − 1 swaps. Otherwise insertion sort is better.

```java
static void selectionSort(int[] a) {
    int n = a.length;
    for (int i = 0; i < n - 1; i++) {
        int min = i;                                   // find the smallest of a[i..n-1]
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[min]) min = j;
        if (min != i) swap(a, i, min);
    }
}
```

Best **O(n²)** · Average **O(n²)** · Worst **O(n²)** · Space **O(1)** · Stable **No** · Adaptive **No**. always n(n − 1)/2 comparisons; at most n − 1 swaps.

▶ See it step by step in the explorer

#### Stable selection sort

Selection sort that **shifts** the block right instead of swapping, so equal values keep their order. When you need a stable selection sort (rare); it does as many writes as insertion sort.

```java
static void stableSelectionSort(int[] a) {
    for (int i = 0; i < a.length - 1; i++) {
        int min = i;
        for (int j = i + 1; j < a.length; j++)
            if (a[j] < a[min]) min = j;
        int key = a[min];
        while (min > i) {                              // shift right instead of swapping:
            a[min] = a[min - 1];
            min--;                                     // equal values keep their order
        }
        a[i] = key;
    }
}
```

Best **O(n²)** · Average **O(n²)** · Worst **O(n²)** · Space **O(1)** · Stable **Yes** · Adaptive **No**. n(n − 1)/2 comparisons, up to n²/2 writes.

▶ See it step by step in the explorer

#### Double selection (min and max)

Find the minimum **and** the maximum in one walk; put one at the front and one at the back. A common follow-up: halves the number of passes.

```java
static void doubleSelectionSort(int[] a) {
    for (int lo = 0, hi = a.length - 1; lo < hi; lo++, hi--) {
        int min = lo, max = lo;
        for (int j = lo + 1; j <= hi; j++) {
            if (a[j] < a[min]) min = j;
            if (a[j] > a[max]) max = j;
        }
        swap(a, lo, min);
        if (max == lo) max = min;                      // the max was just moved to min's slot
        swap(a, hi, max);
    }
}
```

Best **O(n²)** · Average **O(n²)** · Worst **O(n²)** · Space **O(1)** · Stable **No** · Adaptive **No**. about the same comparisons as selection sort (2 per element, n/2 passes); half the passes.

▶ See it step by step in the explorer

#### Recursive selection sort

Put the minimum at index i, then `selectionRec(a, i + 1)`. Recursion practice.

```java
static void selectionRec(int[] a, int i) {
    if (i >= a.length - 1) return;
    int min = i;
    for (int j = i + 1; j < a.length; j++)
        if (a[j] < a[min]) min = j;
    if (min != i) swap(a, i, min);
    selectionRec(a, i + 1);
}
```

Best **O(n²)** · Average **O(n²)** · Worst **O(n²)** · Space **O(n) stack** · Stable **No** · Adaptive **No**. n(n − 1)/2.

▶ See it step by step in the explorer

### 19. Selection sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Selection sort | O(n²) | O(n²) | O(n²) | O(1) | No | No | always n(n − 1)/2 comparisons; at most n − 1 swaps |
| Stable selection sort | O(n²) | O(n²) | O(n²) | O(1) | Yes | No | n(n − 1)/2 comparisons, up to n²/2 writes |
| Double selection (min and max) | O(n²) | O(n²) | O(n²) | O(1) | No | No | about the same comparisons as selection sort (2 per element, n/2 passes); half the passes |
| Recursive selection sort | O(n²) | O(n²) | O(n²) | O(n) stack | No | No | n(n − 1)/2 |

#### Why these costs

- Comparisons: (n − 1) + (n − 2) + … + 1 = n(n − 1)/2 on **every** input, sorted or not, so best = worst = O(n²).
- Swaps: at most one per pass, so at most n − 1.
- Space: a few indexes, O(1); the recursive version keeps n − 1 frames, O(n).
- Not stable: the long-distance swap can carry a value past an equal one ([2ᴬ, 2ᴮ, 1] → [1, 2ᴮ, 2ᴬ]). Shifting instead of swapping fixes it.

**When to use it:** Use it when writes are expensive or n is tiny. Avoid it for nearly sorted data (it can't stop early) and when stability matters.

### 20. Selection sort: interview problems, mistakes and questions

#### Interview problems that use it

| Problem | Approach |
|---|---|
| **Which simple sort makes the fewest swaps?** | Selection sort: at most n − 1. |
| **Find the k smallest values** | k passes of selection sort: O(n·k); for large k use a heap or Quickselect. |
| **Sort with the minimum number of swaps (distinct values)** | Count cycles of the permutation: answer = n − number of cycles (selection sort's swap count when each swap fixes one value). |

#### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Swapping inside the inner loop every time a smaller value is seen | That becomes a bubble-like sort with many swaps | Only remember `min`; swap once after the scan |
| Inner loop starting at 0 | Re-scans the sorted front | Start at `j = i + 1` |
| Claiming it is stable | Swaps jump over equal values | Say "not stable", or use the shifting version |
| Double selection without the `max == lo` fix | The max moved when min was swapped to lo | `if (max == lo) max = min;` |

#### Interview questions

**Q01. How does selection sort work?** Repeatedly find the minimum of the unsorted part and swap it to the front of that part. After pass i the first i + 1 values are final.

**Q02. What is its time complexity in the best case?** O(n²): it always scans the whole unsorted part to be sure it found the minimum, even on sorted input.

**Q03. Why is selection sort not stable?** The swap moves a[i] far to the right, possibly past an equal value. [2ᴬ, 2ᴮ, 1] becomes [1, 2ᴮ, 2ᴬ].

**Q04. When would you choose selection sort over insertion sort?** When writes are much more expensive than reads: selection sort makes at most n − 1 swaps, insertion sort up to n²/2 shifts.

**Q05. How many comparisons for n = 5?** n(n − 1)/2 = 10, on every input (the dry run prints comparisons = 10, swaps = 3).

#### Takeaways

- Find the minimum, swap it to the front: n(n − 1)/2 comparisons always, ≤ n − 1 swaps.
- O(n²) best, average and worst; O(1) space; not stable; not adaptive.
- Only advantage: few writes. Prefer insertion sort otherwise.

#### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_selection`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Insertion sort →

### 21. Insertion sort: the idea and a dry run

**In 30 seconds:** Keep a **sorted prefix**. Take the next value (the `key`), shift every bigger value in the prefix one slot right, and drop the key into the gap. On sorted input each key needs one comparison, so the **best case is O(n)**; the work grows with the number of inversions, O(n²) at worst. It is **stable, adaptive, in-place and online**: the best simple sort, and the one Java uses inside TimSort and Dual-Pivot Quicksort for small runs.

**Why it exists:** Many real arrays are small or almost sorted. Insertion sort does almost no work on them, needs no extra memory, and can even sort data as it arrives (online).

**Analogy (remember this one):** Sorting playing cards in your hand: pick up the next card and slide it left past every bigger card until it sits in the right place. The cards already in your hand are always in order.

#### How it works

1. For i = 1 … n − 1, lift out `key = a[i]`; a[0..i−1] is already sorted.
2. Walk j = i − 1 down while `a[j] > key`, shifting `a[j + 1] = a[j]`.
3. Drop the key at `a[j + 1]`. Now a[0..i] is sorted.
4. Strict `>` keeps equal values in order: stable.

> 💡 **Remember it:** Insertion sort = **sorting cards in your hand**: slide each new card left until it fits.

#### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `ins_shift`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

#### Dry run

```java
import java.util.Arrays;

public class InsertionDemo {

    public static void main(String[] args) {
        int[] a = {12, 11, 13, 5, 6};
        int comparisons = 0, shifts = 0;
        for (int i = 1; i < a.length; i++) {
            int key = a[i], j = i - 1, moved = 0;
            while (j >= 0) {
                comparisons++;
                if (a[j] <= key) break;                 // stop at the first value not bigger than the key
                a[j + 1] = a[j];                        // shift the bigger value one slot right
                j--;
                moved++;
            }
            a[j + 1] = key;
            shifts += moved;
            System.out.println("insert " + key + ": shifted " + moved + " -> " + Arrays.toString(a)
                    + "   sorted prefix a[0.." + i + "]");
        }
        System.out.println("comparisons = " + comparisons + ", shifts = " + shifts);
        /* Output:
           insert 11: shifted 1 -> [11, 12, 13, 5, 6]   sorted prefix a[0..1]
           insert 13: shifted 0 -> [11, 12, 13, 5, 6]   sorted prefix a[0..2]
           insert 5: shifted 3 -> [5, 11, 12, 13, 6]   sorted prefix a[0..3]
           insert 6: shifted 3 -> [5, 6, 11, 12, 13]   sorted prefix a[0..4]
           comparisons = 9, shifts = 7
        */
    }
}
```

▶ See it step by step in the explorer

### 22. Insertion sort: every type in Java

5 ways to write it. Every method below was compiled on JDK 25 and checked against `Arrays.sort` on 3,000 random arrays (`Sorts.java`); `swap(a, i, j)` is the usual three-line helper. Each **See it** button opens that exact code in the explorer at the top, stepping line by line.

#### Insertion sort (shifting)

Grow a sorted prefix: lift out `key = a[i]`, shift bigger values right, drop the key in the gap. Small (n ≲ 16) or nearly sorted data. Libraries use it for small runs (TimSort, Dual-Pivot Quicksort).

```java
static void insertionSort(int[] a) {
    for (int i = 1; i < a.length; i++) {
        int key = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
}
```

Best **O(n)** · Average **O(n²)** · Worst **O(n²)** · Space **O(1)** · Stable **Yes** · Adaptive **Yes**. n − 1 if sorted; about n²/4 on random data; shifts = inversions.

▶ See it step by step in the explorer

#### Insertion sort (swapping)

The same algorithm, but the new element is swapped left step by step. Shortest to write; slower than shifting.

```java
static void insertionSortSwaps(int[] a) {
    for (int i = 1; i < a.length; i++)
        for (int j = i; j > 0 && a[j - 1] > a[j]; j--)
            swap(a, j - 1, j);
}
```

Best **O(n)** · Average **O(n²)** · Worst **O(n²)** · Space **O(1)** · Stable **Yes** · Adaptive **Yes**. same comparisons as shifting; swaps = inversions.

▶ See it step by step in the explorer

#### Binary insertion sort

Use **binary search** to find where the key goes, then shift the block with `System.arraycopy`. When comparisons are expensive (long strings, complex objects). TimSort uses it.

```java
static void binaryInsertionSort(int[] a) {
    for (int i = 1; i < a.length; i++) {
        int key = a[i], lo = 0, hi = i;                // find the first index whose value > key
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (a[mid] <= key) lo = mid + 1;
            else hi = mid;                             // <= keeps it stable
        }
        System.arraycopy(a, lo, a, lo + 1, i - lo);
        a[lo] = key;
    }
}
```

Best **O(n log n) cmp** · Average **O(n²)** · Worst **O(n²)** · Space **O(1)** · Stable **Yes** · Adaptive **Partly**. O(n log n) comparisons, but still O(n²) moves.

▶ See it step by step in the explorer

#### Recursive insertion sort

Sort the first n − 1 elements recursively, then insert the last one. Recursion practice.

```java
static void insertionRec(int[] a, int n) {
    if (n <= 1) return;
    insertionRec(a, n - 1);
    int key = a[n - 1], j = n - 2;
    while (j >= 0 && a[j] > key) {
        a[j + 1] = a[j];
        j--;
    }
    a[j + 1] = key;
}
```

Best **O(n)** · Average **O(n²)** · Worst **O(n²)** · Space **O(n) stack** · Stable **Yes** · Adaptive **Yes**. same as insertion sort.

▶ See it step by step in the explorer

#### Shell sort (gap insertion)

Insertion sort on elements a **gap** apart, with the gap halving down to 1. Medium arrays without recursion (embedded code); a classic "improve insertion sort" answer.

```java
static void shellSort(int[] a) {
    for (int gap = a.length / 2; gap > 0; gap /= 2)
        for (int i = gap; i < a.length; i++) {         // insertion sort on every gap-th element
            int key = a[i], j = i;
            while (j >= gap && a[j - gap] > key) {
                a[j] = a[j - gap];
                j -= gap;
            }
            a[j] = key;
        }
}
```

Best **O(n log n)** · Average **≈ n^1.3 (gap-dependent)** · Worst **O(n²) for n/2, n/4…** · Space **O(1)** · Stable **No** · Adaptive **Partly**. depends on the gap sequence (Knuth 3k+1 is better than halving).

▶ See it step by step in the explorer

### 23. Insertion sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Insertion sort (shifting) | O(n) | O(n²) | O(n²) | O(1) | Yes | Yes | n − 1 if sorted; about n²/4 on random data; shifts = inversions |
| Insertion sort (swapping) | O(n) | O(n²) | O(n²) | O(1) | Yes | Yes | same comparisons as shifting; swaps = inversions |
| Binary insertion sort | O(n log n) cmp | O(n²) | O(n²) | O(1) | Yes | Partly | O(n log n) comparisons, but still O(n²) moves |
| Recursive insertion sort | O(n) | O(n²) | O(n²) | O(n) stack | Yes | Yes | same as insertion sort |
| Shell sort (gap insertion) | O(n log n) | ≈ n^1.3 (gap-dependent) | O(n²) for n/2, n/4… | O(1) | No | Partly | depends on the gap sequence (Knuth 3k+1 is better than halving) |

#### Why these costs

- Each shift fixes exactly one inversion, so shifts = inversions: 0 when sorted, n(n − 1)/2 when reversed, about n²/4 on random data.
- Comparisons = shifts + about one per element, so sorted input costs n − 1 comparisons: O(n).
- Binary insertion cuts comparisons to O(n log n) but still moves O(n²) values.
- Shell sort runs insertion sort on gaps (n/2, n/4 … 1); with halving gaps the worst case is still O(n²), better gap sequences reach about O(n^1.3).

**When to use it:** Use it for small arrays (≲ 16–32), nearly sorted data, a stream of values, or as the base case of merge/quick sort. Avoid it for large random arrays.

### 24. Insertion sort: interview problems, mistakes and questions

#### Interview problems that use it

| Problem | Approach |
|---|---|
| **Insertion Sort List (LC 147)** | Keep a dummy-headed sorted list; for each node walk from the head to find its place. O(n²). |
| **Sort a k-sorted (nearly sorted) array** | Insertion sort is O(n·k); a min-heap of size k + 1 gives O(n log k). |
| **Why do libraries switch to insertion sort for small runs?** | Low constant factor, no recursion, cache-friendly; for n ≈ 32 it beats n log n sorts. |
| **Count inversions** | Shifts of insertion sort = inversions (O(n²)); merge sort counts them in O(n log n). |

#### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Writing `a[j] >= key` | Equal values cross: not stable, and more shifts | Use strict `>` |
| Checking `a[j] > key` before `j >= 0` | `a[-1]`: ArrayIndexOutOfBoundsException | `while (j >= 0 && a[j] > key)` |
| Overwriting the key before saving it | The first shift destroys a[i] | Save `key = a[i]` first |
| Placing the key at `a[j]` | Off by one: overwrites a smaller value | Place it at `a[j + 1]` |

#### Interview questions

**Q01. How does insertion sort work?** It grows a sorted prefix: each new value is shifted left past bigger values until it fits, like sorting cards in your hand.

**Q02. What are its best and worst cases?** Best O(n) on sorted input (one comparison per element); worst O(n²) on reversed input (every pair shifts).

**Q03. Why is insertion sort used inside TimSort and Quicksort implementations?** For small runs its tiny constant factor, no recursion and adaptivity beat the n log n algorithms. Java switches to it for runs of a few dozen elements (TimSort builds runs of at least 32 with binary insertion sort).

**Q04. What does "online" mean, and is insertion sort online?** It can sort data as it arrives, without seeing the whole input first. Yes: each new value is just inserted into the sorted prefix.

**Q05. What does binary insertion sort improve?** Comparisons drop to O(n log n) by binary-searching the position, but the shifts are still O(n²), so the time stays O(n²).

#### Takeaways

- Grow a sorted prefix; shift bigger values right; drop the key in the gap.
- Best O(n), worst O(n²); shifts = inversions; stable, adaptive, in-place, online.
- The simple sort to recommend; libraries use it for small runs.
- Shell sort = insertion sort with shrinking gaps.

#### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_insertion`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Merge sort →

### 25. Merge sort: the idea and a dry run

**In 30 seconds:** **Divide and conquer**: split the array in half, sort each half recursively, then **merge** the two sorted halves with two pointers, always taking the smaller head (the left one on ties). There are log₂ n levels and each level does O(n) work, so it is **O(n log n) in every case**. It needs an O(n) temporary array, and it is **stable**. Java's `Arrays.sort(Object[])` and `List.sort` use TimSort, a merge sort.

**Why it exists:** Merging two sorted lists is easy and linear. Merge sort turns that into a sort with a guaranteed n log n, works on linked lists without random access, and is the basis of external sorting (data bigger than memory) and of many counting problems.

**Analogy (remember this one):** Two sorted queues of cars at a toll merge into one lane: the attendant always waves through whichever front car is shorter. To get sorted queues in the first place, split every queue in half until each "queue" is a single car, which is trivially sorted, then merge back up.

#### How it works

1. If the range has 0 or 1 element, it is sorted: return.
2. Split at `mid = (lo + hi) >>> 1`; sort a[lo..mid] and a[mid+1..hi] recursively.
3. Copy the range to `tmp`; pointer i on the left half, j on the right.
4. Repeatedly write the smaller of tmp[i], tmp[j] (left on ties) to a[k++]; then copy whatever is left.

> 💡 **Remember it:** Merge sort = **split until single, then zip sorted halves together**. log n levels × n work each.

#### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `m_td`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

#### Dry run

```java
import java.util.Arrays;

public class MergeDemo {

    static void mergeSort(int[] a, int lo, int hi, int depth) {
        String pad = "  ".repeat(depth);
        if (lo >= hi) {
            System.out.println(pad + "[" + a[lo] + "]");
            return;
        }
        int mid = (lo + hi) >>> 1;
        System.out.println(pad + "split " + Arrays.toString(Arrays.copyOfRange(a, lo, hi + 1)));
        mergeSort(a, lo, mid, depth + 1);
        mergeSort(a, mid + 1, hi, depth + 1);
        int[] tmp = Arrays.copyOfRange(a, lo, hi + 1);
        int i = 0, j = mid - lo + 1, k = lo;
        while (i <= mid - lo && j <= hi - lo) a[k++] = tmp[i] <= tmp[j] ? tmp[i++] : tmp[j++];
        while (i <= mid - lo) a[k++] = tmp[i++];
        while (j <= hi - lo) a[k++] = tmp[j++];
        System.out.println(pad + "merge -> " + Arrays.toString(Arrays.copyOfRange(a, lo, hi + 1)));
    }

    public static void main(String[] args) {
        int[] a = {38, 27, 43, 3, 9, 82, 10};
        mergeSort(a, 0, a.length - 1, 0);
        System.out.println("sorted: " + Arrays.toString(a));
        /* Output:
           split [38, 27, 43, 3, 9, 82, 10]
             split [38, 27, 43, 3]
               split [38, 27]
                 [38]
                 [27]
               merge -> [27, 38]
               split [43, 3]
                 [43]
                 [3]
               merge -> [3, 43]
             merge -> [3, 27, 38, 43]
             split [9, 82, 10]
               split [9, 82]
                 [9]
                 [82]
               merge -> [9, 82]
               [10]
             merge -> [9, 10, 82]
           merge -> [3, 9, 10, 27, 38, 43, 82]
           sorted: [3, 9, 10, 27, 38, 43, 82]
        */
    }
}
```

▶ See it step by step in the explorer

### 26. Merge sort: every type in Java

4 ways to write it. Every method below was compiled on JDK 25 and checked against `Arrays.sort` on 3,000 random arrays (`Sorts.java`); `swap(a, i, j)` is the usual three-line helper. Each **See it** button opens that exact code in the explorer at the top, stepping line by line.

#### Merge sort (top-down, recursive)

**Divide** in half, sort each half recursively, then **merge** two sorted halves with two pointers. Guaranteed n log n, stable, linked lists, external sorting. Java sorts objects with TimSort, a merge sort.

```java
static void mergeSort(int[] a, int lo, int hi) {
    if (lo >= hi) return;
    int mid = (lo + hi) >>> 1;
    mergeSort(a, lo, mid);
    mergeSort(a, mid + 1, hi);
    merge(a, lo, mid, hi);
}

static void merge(int[] a, int lo, int mid, int hi) {
    int[] tmp = Arrays.copyOfRange(a, lo, hi + 1);
    int i = 0, j = mid - lo + 1, k = lo;               // i walks the left half, j the right
    while (i <= mid - lo && j <= hi - lo)
        a[k++] = tmp[i] <= tmp[j] ? tmp[i++] : tmp[j++];
    while (i <= mid - lo) a[k++] = tmp[i++];
    while (j <= hi - lo) a[k++] = tmp[j++];
}
```

Best **O(n log n)** · Average **O(n log n)** · Worst **O(n log n)** · Space **O(n)** · Stable **Yes** · Adaptive **No**. at most n log₂ n comparisons; log₂ n levels × n writes.

▶ See it step by step in the explorer

#### Merge sort (bottom-up, iterative)

No recursion: merge runs of 1 into runs of 2, then 4, 8 … until one run remains. When recursion is not allowed; the natural form for linked lists (LC 148 in O(1) extra space).

```java
static void mergeSortBottomUp(int[] a) {
    for (int width = 1; width < a.length; width *= 2)
        for (int lo = 0; lo < a.length - width; lo += 2 * width) {
            int hi = Math.min(lo + 2 * width - 1, a.length - 1);
            merge(a, lo, lo + width - 1, hi);
        }
}
```

Best **O(n log n)** · Average **O(n log n)** · Worst **O(n log n)** · Space **O(n)** · Stable **Yes** · Adaptive **No**. same as top-down.

▶ See it step by step in the explorer

#### Merge sort + counting inversions

While merging, when a right value is taken, every left value still waiting is bigger: add them all as inversions. Count inversions / "how many swaps to sort" in O(n log n) instead of O(n²).

```java
static long countInversions(int[] a, int lo, int hi) {
    if (lo >= hi) return 0;
    int mid = (lo + hi) >>> 1;
    long inv = countInversions(a, lo, mid)
             + countInversions(a, mid + 1, hi);
    int[] tmp = Arrays.copyOfRange(a, lo, hi + 1);
    int i = 0, j = mid - lo + 1, k = lo;
    while (i <= mid - lo && j <= hi - lo) {
        if (tmp[i] <= tmp[j]) a[k++] = tmp[i++];
        else {                                            // tmp[j] jumps over every left item still waiting:
            inv += mid - lo + 1 - i;
            a[k++] = tmp[j++];                            // each of them is a bigger value before it
        }
    }
    while (i <= mid - lo) a[k++] = tmp[i++];
    while (j <= hi - lo) a[k++] = tmp[j++];
    return inv;
}
```

Best **O(n log n)** · Average **O(n log n)** · Worst **O(n log n)** · Space **O(n)** · Stable **Yes** · Adaptive **No**. n log n; answer can reach n(n − 1)/2, so use long.

▶ See it step by step in the explorer

#### TimSort idea (insertion runs + merge)

The idea behind Java's object sort: insertion-sort small runs, then merge the runs. Explains `Arrays.sort(Object[])` / `List.sort`: stable, n log n, very fast on partly sorted data.

```java
static final int RUN = 4;                              // real TimSort: 32 to 64, and it finds natural runs
static void timSortLite(int[] a) {
    int n = a.length;
    for (int lo = 0; lo < n; lo += RUN)
        insertionRange(a, lo, Math.min(lo + RUN - 1, n - 1));
    for (int width = RUN; width < n; width *= 2)
        for (int lo = 0; lo < n - width; lo += 2 * width)
            merge(a, lo, lo + width - 1, Math.min(lo + 2 * width - 1, n - 1));
}
static void insertionRange(int[] a, int lo, int hi) {
    for (int i = lo + 1; i <= hi; i++) {
        int key = a[i], j = i - 1;
        while (j >= lo && a[j] > key) { a[j + 1] = a[j]; j--; }
        a[j + 1] = key;
    }
}
```

Best **O(n)** · Average **O(n log n)** · Worst **O(n log n)** · Space **O(n)** · Stable **Yes** · Adaptive **Yes**. real TimSort finds natural runs and gallops; this is the simplified idea.

▶ See it step by step in the explorer

### 27. Merge sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Merge sort (top-down, recursive) | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | No | at most n log₂ n comparisons; log₂ n levels × n writes |
| Merge sort (bottom-up, iterative) | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | No | same as top-down |
| Merge sort + counting inversions | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | No | n log n; answer can reach n(n − 1)/2, so use long |
| TimSort idea (insertion runs + merge) | O(n) | O(n log n) | O(n log n) | O(n) | Yes | Yes | real TimSort finds natural runs and gallops; this is the simplified idea |

#### Why these costs

- Recurrence T(n) = 2T(n/2) + O(n): log₂ n levels, each merging n elements in total, so O(n log n) best, average and worst.
- Comparisons per merge ≤ length − 1, so total ≤ n log₂ n.
- Space: the tmp array O(n) plus O(log n) recursion frames; bottom-up merge sort needs no recursion.
- Stable because the merge takes the left element on ties (`<=`).
- Not adaptive in this basic form; TimSort detects existing runs, so sorted input costs O(n).

**When to use it:** Use it when you need guaranteed n log n, stability, a linked list (LC 148), external sorting, or counting pairs across halves (inversions, LC 315, LC 493). Avoid it when O(n) extra memory is a problem.

### 28. Merge sort: interview problems, mistakes and questions

#### Interview problems that use it

| Problem | Approach |
|---|---|
| **Sort List (LC 148)** | Find the middle with slow/fast pointers, sort each half, merge the lists. O(n log n), O(log n) stack (or O(1) bottom-up). |
| **Merge k Sorted Lists (LC 23)** | Merge pairs level by level (O(N log k)) or use a min-heap of the k heads. |
| **Count inversions / Count of Smaller Numbers After Self (LC 315)** | During the merge, taking from the right means every waiting left value is bigger: add mid − i + 1. |
| **Reverse Pairs (LC 493)** | Before each merge, count pairs with a[i] > 2·a[j] using two pointers over the sorted halves. |
| **Merge Sorted Array (LC 88)** | Merge from the back so you don't overwrite unread values. |

#### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| `mid = (lo + hi) / 2` on huge indexes | int overflow when lo + hi > 2³¹ − 1 | `(lo + hi) >>> 1` or `lo + (hi − lo) / 2` |
| Using `<` instead of `<=` in the merge | Equal values from the right go first: not stable | Take the left one on ties |
| Forgetting to copy the leftovers | Missing values at the end of the range | Two extra while loops after the main merge |
| Allocating a new array in every merge for big n | Lots of garbage | Allocate one tmp array once and pass it down |
| Counting inversions in an int | Up to n(n − 1)/2: overflows for n > 65,536 | Use `long` |

#### Interview questions

**Q01. Explain merge sort and its complexity.** Split in half, sort each half recursively, merge the sorted halves with two pointers. T(n) = 2T(n/2) + n = O(n log n) in every case, O(n) extra space, stable.

**Q02. Why is merge sort preferred for linked lists?** It only needs sequential access: splitting uses slow/fast pointers and merging just relinks nodes, so no extra array is needed. Quicksort and heap sort need random access.

**Q03. How do you count inversions with merge sort?** When the merge takes tmp[j] from the right half, all mid − i + 1 values still waiting in the left half are bigger and come earlier: add that to the count. O(n log n).

**Q04. What is the difference between top-down and bottom-up merge sort?** Top-down recurses on halves; bottom-up merges runs of width 1, 2, 4 … iteratively with no recursion. Same O(n log n).

**Q05. Why does Java use merge sort (TimSort) for objects but quicksort for primitives?** Objects need a stable sort (equal keys keep their order) and comparisons are expensive; for primitives stability is invisible and Dual-Pivot Quicksort is faster with no extra memory.

#### Takeaways

- Divide, sort halves, merge: O(n log n) always.
- Stable (take left on ties), O(n) extra space.
- The sort for linked lists, external data and counting inversions.
- Java's object sort (TimSort) is a merge sort that exploits existing runs.

#### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_merge`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Quick sort →

### 29. Quick sort: the idea and a dry run

**In 30 seconds:** Pick a **pivot**, **partition** the array so smaller values come before it and the rest after it (the pivot is then in its final place), and sort the two sides recursively. Average **O(n log n)** with a tiny constant and O(log n) stack, but **O(n²)** when the pivot is always the smallest or largest (sorted input with a first/last pivot). A **random pivot** makes that practically impossible. Not stable. Its partition step also gives **Quickselect**: the k-th smallest in O(n) on average.

**Why it exists:** Partitioning is in-place and cache-friendly, so quicksort is the fastest general-purpose sort in practice. Java's `Arrays.sort(int[])` is a Dual-Pivot Quicksort.

**Analogy (remember this one):** A car park attendant picks one car as the reference length (the pivot) and sends every shorter car to the left side, every longer car to the right. The reference car now stands exactly where it belongs; then each side is sorted the same way.

#### How it works

1. If the range has fewer than 2 elements, return.
2. Partition around a pivot: Lomuto uses the last element and an index i for the end of the "smaller" zone; Hoare walks two pointers inwards.
3. The pivot lands at its final index p.
4. Recurse on a[lo..p−1] and a[p+1..hi] (Hoare: on a[lo..j] and a[j+1..hi]).

> 💡 **Remember it:** Quick sort = **pick a pivot, small left, big right, repeat on each side**. Bad pivots make it n².

#### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `q_l`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

#### Dry run

```java
import java.util.Arrays;

public class QuickDemo {

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    static int partition(int[] a, int lo, int hi) {         // Lomuto, pivot = last element
        int pivot = a[hi], i = lo;
        for (int j = lo; j < hi; j++)
            if (a[j] < pivot) swap(a, i++, j);
        swap(a, i, hi);
        return i;
    }

    static void quickSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int pivot = a[hi];
        int p = partition(a, lo, hi);
        System.out.println("partition a[" + lo + ".." + hi + "] around " + pivot + " -> "
                + Arrays.toString(a) + "   " + pivot + " is final at index " + p);
        quickSort(a, lo, p - 1);
        quickSort(a, p + 1, hi);
    }

    static int quickSelect(int[] a, int k) {
        int lo = 0, hi = a.length - 1;
        while (lo < hi) {
            int p = partition(a, lo, hi);
            if (p == k) return a[k];
            if (p < k) lo = p + 1; else hi = p - 1;
        }
        return a[k];
    }

    public static void main(String[] args) {
        int[] a = {10, 80, 30, 90, 40, 50, 70};
        quickSort(a, 0, a.length - 1);
        System.out.println("sorted: " + Arrays.toString(a));

        int[] b = {3, 2, 1, 5, 6, 4};                       // LeetCode 215: 2nd largest
        int k = 2;
        System.out.println(k + "nd largest of " + Arrays.toString(b) + " = " + quickSelect(b.clone(), b.length - k));
        /* Output:
           partition a[0..6] around 70 -> [10, 30, 40, 50, 70, 90, 80]   70 is final at index 4
           partition a[0..3] around 50 -> [10, 30, 40, 50, 70, 90, 80]   50 is final at index 3
           partition a[0..2] around 40 -> [10, 30, 40, 50, 70, 90, 80]   40 is final at index 2
           partition a[0..1] around 30 -> [10, 30, 40, 50, 70, 90, 80]   30 is final at index 1
           partition a[5..6] around 80 -> [10, 30, 40, 50, 70, 80, 90]   80 is final at index 5
           sorted: [10, 30, 40, 50, 70, 80, 90]
           2nd largest of [3, 2, 1, 5, 6, 4] = 5
        */
    }
}
```

▶ See it step by step in the explorer

### 30. Quick sort: every type in Java

5 ways to write it. Every method below was compiled on JDK 25 and checked against `Arrays.sort` on 3,000 random arrays (`Sorts.java`); `swap(a, i, j)` is the usual three-line helper. Each **See it** button opens that exact code in the explorer at the top, stepping line by line.

#### Quick sort (Lomuto, last pivot)

Pick a **pivot** (last element), **partition** so smaller values are left of it, then sort both sides recursively. Fastest in practice on arrays; Java sorts primitives with Dual-Pivot Quicksort.

```java
static void quickSort(int[] a, int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(a, lo, hi);
    quickSort(a, lo, p - 1);
    quickSort(a, p + 1, hi);
}

static int partition(int[] a, int lo, int hi) {       // Lomuto: the pivot is the last element
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; j++)                      // a[lo..i-1] < pivot <= a[i..j-1]
        if (a[j] < pivot) swap(a, i++, j);
    swap(a, i, hi);
    return i;                                          // the pivot's final index
}
```

Best **O(n log n)** · Average **O(n log n)** · Worst **O(n²)** · Space **O(log n) stack** · Stable **No** · Adaptive **No**. ≈ 1.39 n log₂ n on average; n²/2 on sorted input with a last-element pivot.

▶ See it step by step in the explorer

#### Quick sort (Hoare, middle pivot)

Two pointers walk towards each other and swap values on the wrong side of the middle pivot. Fewer swaps than Lomuto; handles duplicates better.

```java
static void quickSortHoare(int[] a, int lo, int hi) {
    if (lo >= hi) return;
    int pivot = a[(lo + hi) >>> 1], i = lo - 1, j = hi + 1;
    while (true) {
        do i++; while (a[i] < pivot);
        do j--; while (a[j] > pivot);
        if (i >= j) break;
        swap(a, i, j);
    }
    quickSortHoare(a, lo, j);
    quickSortHoare(a, j + 1, hi);
}
```

Best **O(n log n)** · Average **O(n log n)** · Worst **O(n²)** · Space **O(log n) stack** · Stable **No** · Adaptive **No**. about 3 times fewer swaps than Lomuto on average.

▶ See it step by step in the explorer

#### Quick sort (random pivot)

Swap a **random** element to the end before partitioning. Always in interviews: makes the O(n²) case vanishingly unlikely on any input.

```java
static final Random RNG = new Random();
static void quickSortRandom(int[] a, int lo, int hi) {
    if (lo >= hi) return;
    swap(a, lo + RNG.nextInt(hi - lo + 1), hi);
    int p = partition(a, lo, hi);
    quickSortRandom(a, lo, p - 1);
    quickSortRandom(a, p + 1, hi);
}
```

Best **O(n log n)** · Average **O(n log n)** · Worst **O(n²) (unlikely)** · Space **O(log n) stack** · Stable **No** · Adaptive **No**. expected ≈ 1.39 n log₂ n on every input.

▶ See it step by step in the explorer

#### Quick sort (3-way, many duplicates)

Partition into < pivot, = pivot, > pivot (Dijkstra). The = block is final at once. Many duplicate keys; it is the same partition as Sort Colors.

```java
static void quickSort3Way(int[] a, int lo, int hi) {
    if (lo >= hi) return;
    int pivot = a[lo], lt = lo, i = lo + 1, gt = hi;
    while (i <= gt) {                                  // a[lo..lt-1] < pivot, a[lt..i-1] == pivot, a[gt+1..hi] > pivot
        if (a[i] < pivot) swap(a, lt++, i++);
        else if (a[i] > pivot) swap(a, i, gt--);
        else i++;
    }
    quickSort3Way(a, lo, lt - 1);
    quickSort3Way(a, gt + 1, hi);
}
```

Best **O(n)** · Average **O(n log n)** · Worst **O(n²)** · Space **O(log n) stack** · Stable **No** · Adaptive **No**. O(n) when all values are equal.

▶ See it step by step in the explorer

#### Quickselect (k-th smallest)

Partition, then continue only into the side that contains index k. k-th largest/smallest (LC 215), median, top-k without sorting.

```java
static int quickSelect(int[] a, int k) {              // the k-th smallest value, k counted from 0
    int lo = 0, hi = a.length - 1;
    while (lo < hi) {
        int p = partition(a, lo, hi);
        if (p == k) return a[k];
        if (p < k) lo = p + 1; else hi = p - 1;
    }
    return a[k];
}
```

Best **O(n)** · Average **O(n)** · Worst **O(n²)** · Space **O(1)** · Stable **–** · Adaptive **–**. n + n/2 + n/4 … ≈ 2n comparisons on average.

▶ See it step by step in the explorer

### 31. Quick sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Quick sort (Lomuto, last pivot) | O(n log n) | O(n log n) | O(n²) | O(log n) stack | No | No | ≈ 1.39 n log₂ n on average; n²/2 on sorted input with a last-element pivot |
| Quick sort (Hoare, middle pivot) | O(n log n) | O(n log n) | O(n²) | O(log n) stack | No | No | about 3 times fewer swaps than Lomuto on average |
| Quick sort (random pivot) | O(n log n) | O(n log n) | O(n²) (unlikely) | O(log n) stack | No | No | expected ≈ 1.39 n log₂ n on every input |
| Quick sort (3-way, many duplicates) | O(n) | O(n log n) | O(n²) | O(log n) stack | No | No | O(n) when all values are equal |
| Quickselect (k-th smallest) | O(n) | O(n) | O(n²) | O(1) | – | – | n + n/2 + n/4 … ≈ 2n comparisons on average |

#### Why these costs

- Balanced splits: T(n) = 2T(n/2) + n = O(n log n). Average over random pivots: about 1.39 n log₂ n comparisons.
- Worst case: the pivot is always the min or max, so T(n) = T(n − 1) + n = O(n²). The dry run shows it: sorted-ish data with a last-element pivot peels one element at a time.
- Space: no extra array; the recursion is O(log n) on average, O(n) in the worst case (recurse into the smaller side first to keep it O(log n)).
- 3-way partitioning makes many duplicates cheap: all values equal to the pivot are finished in one pass.
- Quickselect recurses into one side only: n + n/2 + n/4 … ≈ 2n, so O(n) on average.

**When to use it:** Use it for large in-memory arrays of primitives, and Quickselect for k-th element / top-k. Use a random (or median-of-three) pivot. Avoid it when you need stability or a guaranteed worst case (use merge or heap sort).

### 32. Quick sort: interview problems, mistakes and questions

#### Interview problems that use it

| Problem | Approach |
|---|---|
| **Kth Largest Element in an Array (LC 215)** | Quickselect for index n − k with a random pivot: O(n) average. Or a min-heap of size k: O(n log k). |
| **Sort an Array (LC 912)** | Random-pivot quicksort or merge sort; plain last-pivot quicksort times out on sorted input. |
| **K Closest Points to Origin (LC 973)** | Quickselect on distance, then return the first k. |
| **Sort Colors (LC 75)** | 3-way partition around 1 (the Dutch National Flag). |
| **Wiggle Sort II (LC 324)** | Find the median with Quickselect, then 3-way partition with virtual indexing. |

#### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Always using the first or last element as pivot | O(n²) on sorted or reversed input | Random pivot or median-of-three |
| Hoare partition recursing on (lo, p − 1) and (p + 1, hi) | Hoare does not put the pivot at j: values get lost or the recursion never shrinks | Recurse on (lo, j) and (j + 1, hi) |
| Comparing with `<=` in Lomuto on many duplicates | Unbalanced partitions, O(n²) on all-equal input | 3-way partition |
| Deep recursion on adversarial input | StackOverflowError | Recurse into the smaller side, loop on the larger |
| k-th largest with index k | Off by one | k-th largest = index n − k (0-based) in ascending order |

#### Interview questions

**Q01. Explain quicksort and its complexity.** Choose a pivot, partition so smaller values go left and larger right (pivot is final), recurse on both sides. Average O(n log n), worst O(n²), O(log n) stack, in-place, not stable.

**Q02. When does quicksort hit O(n²), and how do you avoid it?** When every pivot is the smallest or largest value, e.g. sorted input with a first/last pivot, or all-equal values with a 2-way partition. Use a random pivot or median-of-three, and a 3-way partition for duplicates.

**Q03. Lomuto vs Hoare partition?** Lomuto: one pointer, pivot = last, simple, pivot ends at its final index. Hoare: two pointers moving inward, about three times fewer swaps, but the pivot is not necessarily at the returned index.

**Q04. What is Quickselect and its complexity?** Partition, then continue only into the side containing index k. Average O(n) (n + n/2 + …), worst O(n²); used for k-th largest (LC 215).

**Q05. Why is quicksort usually faster than merge sort in practice?** It works in place with sequential memory access (cache-friendly) and has a small constant factor; merge sort copies into a temporary array.

#### Takeaways

- Partition around a pivot, recurse on both sides: O(n log n) average.
- Bad pivots give O(n²): use a random pivot; duplicates: 3-way partition.
- In-place, O(log n) stack, not stable.
- Quickselect = partition + one side only: O(n) average for k-th element.

#### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_quick`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Heap sort →

### 33. Heap sort: the idea and a dry run

**In 30 seconds:** Treat the array as a **binary heap**: the children of index i are 2i + 1 and 2i + 2. First **build a max-heap** (every parent ≥ its children) in O(n), so the maximum is at a[0]. Then repeatedly **swap a[0] to the end**, shrink the heap by one, and **sift the new root down** (O(log n)). Total **O(n log n) in every case with O(1) extra space**, but not stable and slower than quicksort in practice. In interviews the heap usually appears as a `PriorityQueue` for top-k, k-way merges and running medians.

**Why it exists:** It is the only common comparison sort that guarantees O(n log n) **and** uses O(1) extra space. The heap data structure behind it gives O(log n) insert and remove-max, which is what priority queues need.

**Analogy (remember this one):** A company org chart where every boss is taller than the people reporting to them: the tallest person is always the CEO at the top. Remove the CEO (send them to the end of the line), promote the last person to the top, and let them sink down past taller reports until the rule holds again.

#### How it works

1. Build: for i = n/2 − 1 down to 0, `siftDown(a, i, n)`. Leaves are already heaps.
2. Swap the root (the max) with a[end]; a[end] is final.
3. Sift the new root down in the heap a[0..end−1]: swap it with its bigger child while it is smaller.
4. Repeat until the heap has one element.

> 💡 **Remember it:** Heap sort = **the tallest is always on top**: take it off, fix the heap, repeat.

#### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `h_std`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

#### Dry run

```java
import java.util.Arrays;
import java.util.PriorityQueue;

public class HeapDemo {

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    static void siftDown(int[] a, int i, int n) {
        while (2 * i + 1 < n) {
            int c = 2 * i + 1;
            if (c + 1 < n && a[c + 1] > a[c]) c++;
            if (a[i] >= a[c]) return;
            swap(a, i, c);
            i = c;
        }
    }

    public static void main(String[] args) {
        int[] a = {4, 10, 3, 5, 1};
        int n = a.length;
        for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n);
        System.out.println("max-heap: " + Arrays.toString(a));
        for (int end = n - 1; end > 0; end--) {
            swap(a, 0, end);
            siftDown(a, 0, end);
            System.out.println("move " + a[end] + " to index " + end + " -> " + Arrays.toString(a));
        }

        // The interview version: a PriorityQueue (a binary min-heap) keeps the k largest values
        int[] nums = {3, 2, 3, 1, 2, 4, 5, 5, 6};
        int k = 4;
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int x : nums) {
            heap.offer(x);                               // O(log k)
            if (heap.size() > k) heap.poll();            // drop the smallest of the k + 1
        }
        System.out.println(k + "th largest = " + heap.peek());   // LeetCode 215
        /* Output:
           max-heap: [10, 5, 3, 4, 1]
           move 10 to index 4 -> [5, 4, 3, 1, 10]
           move 5 to index 3 -> [4, 1, 3, 5, 10]
           move 4 to index 2 -> [3, 1, 4, 5, 10]
           move 3 to index 1 -> [1, 3, 4, 5, 10]
           4th largest = 4
        */
    }
}
```

▶ See it step by step in the explorer

### 34. Heap sort: every type in Java

3 ways to write it. Every method below was compiled on JDK 25 and checked against `Arrays.sort` on 3,000 random arrays (`Sorts.java`); `swap(a, i, j)` is the usual three-line helper. Each **See it** button opens that exact code in the explorer at the top, stepping line by line.

#### Heap sort (sift-down)

Build a max-heap in the array, then repeatedly swap the max to the end and sift the new root down. Guaranteed n log n with O(1) extra space. The heap itself (PriorityQueue) is what interviews use most.

```java
static void heapSort(int[] a) {
    int n = a.length;
    for (int i = n / 2 - 1; i >= 0; i--)
        siftDown(a, i, n);                             // 1. build a max-heap bottom-up: O(n)
    for (int end = n - 1; end > 0; end--) {
        swap(a, 0, end);
        siftDown(a, 0, end);
    }
}

static void siftDown(int[] a, int i, int n) {         // push a[i] down until both children are smaller
    while (2 * i + 1 < n) {
        int c = 2 * i + 1;                             // left child
        if (c + 1 < n && a[c + 1] > a[c]) c++;
        if (a[i] >= a[c]) return;
        swap(a, i, c);
        i = c;
    }
}
```

Best **O(n log n)** · Average **O(n log n)** · Worst **O(n log n)** · Space **O(1)** · Stable **No** · Adaptive **No**. about 2 n log₂ n.

▶ See it step by step in the explorer

#### Heap sort (recursive heapify)

The same heap sort with a recursive `heapify`. The version most textbooks show.

```java
static void heapSortRec(int[] a) {
    for (int i = a.length / 2 - 1; i >= 0; i--) heapify(a, i, a.length);
    for (int end = a.length - 1; end > 0; end--) {
        swap(a, 0, end);
        heapify(a, 0, end);
    }
}
static void heapify(int[] a, int i, int n) {
    int big = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && a[l] > a[big]) big = l;
    if (r < n && a[r] > a[big]) big = r;
    if (big != i) {
        swap(a, i, big);
        heapify(a, big, n);
    }
}
```

Best **O(n log n)** · Average **O(n log n)** · Worst **O(n log n)** · Space **O(log n) stack** · Stable **No** · Adaptive **No**. same as heap sort.

▶ See it step by step in the explorer

#### Heap sort (build by sift-up)

Build the heap by inserting elements one by one and letting each bubble up. How a PriorityQueue grows with offer().

```java
static void heapSortSiftUp(int[] a) {
    for (int k = 1; k < a.length; k++) {
        int c = k;                                     // insert a[k] into the heap a[0..k-1]
        while (c > 0 && a[(c - 1) / 2] < a[c]) {
            swap(a, c, (c - 1) / 2);
            c = (c - 1) / 2;
        }
    }
    for (int end = a.length - 1; end > 0; end--) {
        swap(a, 0, end);
        siftDown(a, 0, end);
    }
}
```

Best **O(n log n)** · Average **O(n log n)** · Worst **O(n log n)** · Space **O(1)** · Stable **No** · Adaptive **No**. build is O(n log n) instead of O(n).

▶ See it step by step in the explorer

### 35. Heap sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Heap sort (sift-down) | O(n log n) | O(n log n) | O(n log n) | O(1) | No | No | about 2 n log₂ n |
| Heap sort (recursive heapify) | O(n log n) | O(n log n) | O(n log n) | O(log n) stack | No | No | same as heap sort |
| Heap sort (build by sift-up) | O(n log n) | O(n log n) | O(n log n) | O(1) | No | No | build is O(n log n) instead of O(n) |

#### Why these costs

- Bottom-up build is O(n): most nodes are near the bottom and sift down only a little (sum of heights ≤ n).
- Each of the n − 1 extractions sifts down at most log₂ n levels: O(n log n), on every input.
- Space O(1) for the iterative version (the recursive heapify uses O(log n) stack).
- Not stable: the swap of the root to the end jumps over equal values.
- Building by n sift-up inserts costs O(n log n) instead of O(n).

**When to use it:** Use the sort when you need a guaranteed n log n in O(1) memory (Java does not use it, but some C++ introsorts fall back to it). Use the heap (PriorityQueue) for top-k, streaming medians, k-way merges, scheduling.

### 36. Heap sort: interview problems, mistakes and questions

#### Interview problems that use it

| Problem | Approach |
|---|---|
| **Kth Largest Element (LC 215)** | Min-heap of size k: push each value, poll when size > k; the root is the answer. O(n log k). |
| **Top K Frequent Elements (LC 347)** | Count with a HashMap, keep a min-heap of size k by frequency (or bucket sort for O(n)). |
| **Find Median from Data Stream (LC 295)** | A max-heap for the lower half and a min-heap for the upper half, balanced in size. |
| **Merge k Sorted Lists (LC 23)** | Min-heap of the k current heads: O(N log k). |
| **Meeting Rooms II (LC 253)** | Sort by start; a min-heap of end times tracks rooms in use. |

#### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Children at 2i and 2i + 1 | That is the 1-based layout; with 0-based arrays you skip the root's real children | 0-based: 2i + 1 and 2i + 2, parent (i − 1) / 2 |
| Building the heap from i = 0 upward with siftDown | Children are not heaps yet: wrong result | Go from n/2 − 1 down to 0 |
| Sifting down over the whole array after a swap | The sorted tail is pulled back into the heap | Pass the shrinking size `end` |
| Using a max-heap for k-th largest with all n values | O(n log n) and O(n) memory | Min-heap of size k |
| `PriorityQueue` is a max-heap | It is a min-heap by default | `new PriorityQueue<>(Comparator.reverseOrder())` for max |

#### Interview questions

**Q01. Explain heap sort.** Build a max-heap in place in O(n), then n − 1 times swap the root (the max) to the end and sift the new root down in O(log n). O(n log n) always, O(1) space, not stable.

**Q02. Why is building a heap O(n) and not O(n log n)?** Sift-down cost is the node's height. Half the nodes are leaves (0), a quarter have height 1, … The sum n/4·1 + n/8·2 + … is bounded by n.

**Q03. Heap sort vs quicksort vs merge sort?** Heap: O(n log n) worst, O(1) space, not stable, poor cache use. Quick: fastest on average, O(n²) worst. Merge: O(n log n) worst, stable, O(n) space.

**Q04. How do you find the k-th largest with a heap?** Keep a min-heap of the k largest seen so far; when it grows past k, poll the smallest. The root is the answer: O(n log k) time, O(k) space.

**Q05. What are the index formulas of a binary heap stored in an array?** 0-based: left = 2i + 1, right = 2i + 2, parent = (i − 1) / 2; the last non-leaf is n/2 − 1.

#### Takeaways

- Array as a tree: children 2i + 1, 2i + 2; max-heap keeps the max at a[0].
- Build O(n), then n extractions O(log n) each: O(n log n) always, O(1) space.
- Not stable; slower than quicksort in practice.
- Interviews use the heap itself: PriorityQueue for top-k, medians, k-way merge.

#### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_heap`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Counting sort →

### 37. Counting sort: the idea and a dry run

**In 30 seconds:** When the values are integers in a **small range** 0 … k, don't compare at all: **count** how many times each value occurs, then write the values back in order. That is **O(n + k)** time and O(k) space, beating the n log n limit of comparison sorts. The stable version turns counts into end positions with **prefix sums** and places elements from right to left, which is how radix sort uses it. The same idea is the `int[26]` frequency array of String problems.

**Why it exists:** Comparison sorts can never beat Ω(n log n). When keys are small integers (ages, marks, letters, digits), counting is linear and simpler.

**Analogy (remember this one):** A car park with numbered bays by car length (3 m, 4 m, 5 m …): instead of comparing cars, each car just drives into the bay for its length. Then you empty the bays in order 3 m, 4 m, 5 m.

#### How it works

1. Make `count = new int[k + 1]` and do `count[x]++` for every value.
2. Simple: for v = 0 … k write v `count[v]` times.
3. Stable: prefix sums `count[v] += count[v − 1]` give how many values are ≤ v.
4. Walk the input right to left and place each value at `out[--count[x]]`.

> 💡 **Remember it:** Counting sort = **tally marks**: count each value, then read the tally from smallest to largest. No comparisons.

#### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `c_simple`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

#### Dry run

```java
import java.util.Arrays;

public class CountingDemo {

    public static void main(String[] args) {
        int[] a = {4, 2, 2, 8, 3, 3, 1};
        int max = 8;
        int[] count = new int[max + 1];
        for (int x : a) count[x]++;
        System.out.println("count  " + Arrays.toString(count) + "   (index = value)");
        for (int v = 1; v <= max; v++) count[v] += count[v - 1];
        System.out.println("prefix " + Arrays.toString(count) + "   (how many values are <= index)");
        int[] out = new int[a.length];
        for (int i = a.length - 1; i >= 0; i--) out[--count[a[i]]] = a[i];
        System.out.println("sorted " + Arrays.toString(out));

        // the everyday form: a frequency array for lowercase letters
        String s = "anagram", t = "nagaram";
        int[] f = new int[26];
        for (char c : s.toCharArray()) f[c - 'a']++;
        for (char c : t.toCharArray()) f[c - 'a']--;
        System.out.println("anagrams? " + Arrays.stream(f).allMatch(x -> x == 0));
        /* Output:
           count  [0, 1, 2, 2, 1, 0, 0, 0, 1]   (index = value)
           prefix [0, 1, 3, 5, 6, 6, 6, 6, 7]   (how many values are <= index)
           sorted [1, 2, 2, 3, 3, 4, 8]
           anagrams? true
        */
    }
}
```

▶ See it step by step in the explorer

### 38. Counting sort: every type in Java

2 ways to write it. Every method below was compiled on JDK 25 and checked against `Arrays.sort` on 3,000 random arrays (`Sorts.java`); `swap(a, i, j)` is the usual three-line helper. Each **See it** button opens that exact code in the explorer at the top, stepping line by line.

#### Counting sort (simple)

Count how many times each value occurs, then write the values out in order. **No comparisons.** Small integer range k: ages, marks, letters (int[26]).

```java
static void countingSort(int[] a, int max) {          // values 0..max
    int[] count = new int[max + 1];
    for (int x : a) count[x]++;
    int k = 0;
    for (int v = 0; v <= max; v++)
        while (count[v]-- > 0) a[k++] = v;
}
```

Best **O(n + k)** · Average **O(n + k)** · Worst **O(n + k)** · Space **O(k)** · Stable **–** · Adaptive **–**. 0 comparisons; n counts + n writes.

▶ See it step by step in the explorer

#### Counting sort (stable, prefix sums)

Prefix sums turn counts into end positions; place elements from right to left into `out`. When records carry data (sort people by age) and as the inner step of radix sort.

```java
static int[] countingSortStable(int[] a, int max) {
    int[] count = new int[max + 1];
    for (int x : a) count[x]++;
    for (int v = 1; v <= max; v++)
        count[v] += count[v - 1];
    int[] out = new int[a.length];                     // count[v] = how many values are <= v
    for (int i = a.length - 1; i >= 0; i--)            // right to left keeps equal keys in order
        out[--count[a[i]]] = a[i];
    return out;
}
```

Best **O(n + k)** · Average **O(n + k)** · Worst **O(n + k)** · Space **O(n + k)** · Stable **Yes** · Adaptive **–**. 0 comparisons.

▶ See it step by step in the explorer

### 39. Counting sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Counting sort (simple) | O(n + k) | O(n + k) | O(n + k) | O(k) | – | – | 0 comparisons; n counts + n writes |
| Counting sort (stable, prefix sums) | O(n + k) | O(n + k) | O(n + k) | O(n + k) | Yes | – | 0 comparisons |

#### Why these costs

- One pass to count (n), one pass over the counts (k), one pass to write (n): O(n + k).
- Space O(k) for the counts (+ O(n) for the stable version's output array).
- Zero comparisons, so the Ω(n log n) comparison lower bound does not apply.
- If k is huge (values up to 10⁹) the count array is too big: use a HashMap, radix sort or a comparison sort.
- Stable version: right-to-left placement keeps equal keys in input order.

**When to use it:** Use it when the range k is small compared with n (or both small): letters, digits, ages, scores, colors. Avoid it for wide ranges, negative values without an offset, or non-integer keys.

### 40. Counting sort: interview problems, mistakes and questions

#### Interview problems that use it

| Problem | Approach |
|---|---|
| **Valid Anagram (LC 242) / Group Anagrams (LC 49)** | `int[26]` counts of letters; the count array (as a key) groups anagrams. |
| **H-Index (LC 274)** | Bucket citations by min(c, n) into counts[0..n], then scan from the top. O(n). |
| **Sort Characters By Frequency (LC 451)** | Count characters, then emit by frequency (bucket by count). |
| **Relative Sort Array (LC 1122)** | Count arr1 values (range 0..1000), emit in arr2 order, then the rest ascending. |
| **Sort an array of 0..9 digits or exam marks** | Classic counting sort, O(n + k). |

#### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Using it with negative values | Negative index: ArrayIndexOutOfBoundsException | Shift by the minimum: `count[x − min]++` |
| Range up to 10⁹ | OutOfMemoryError or huge time | Use radix sort, a HashMap, or Arrays.sort |
| Placing left to right in the stable version | Equal keys come out reversed: not stable | Walk from the right with `--count[x]` |
| `new int[max]` | Index max is out of bounds | `new int[max + 1]` |

#### Interview questions

**Q01. How can counting sort beat O(n log n)?** It never compares elements; it uses the values as array indexes. The Ω(n log n) lower bound only applies to comparison sorts.

**Q02. What is its complexity?** O(n + k) time, O(k) extra space (O(n + k) for the stable version), where k is the range of values.

**Q03. How do you make counting sort stable?** Turn counts into prefix sums (positions), then place elements from the right end of the input at out[--count[x]].

**Q04. When is counting sort a bad idea?** When the range k is much larger than n (sparse wide values), or keys are not small integers.

**Q05. Where does counting sort appear in String problems?** Every `int[26]` or `int[128]` frequency array: anagrams, first unique character, sort by frequency.

#### Takeaways

- Count each value, write them back in order: O(n + k), no comparisons.
- Only for small integer ranges; shift by min for negatives.
- Prefix sums + right-to-left placement = stable (used by radix sort).
- The `int[26]` trick is counting sort in disguise.

#### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_counting`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Radix sort →

### 41. Radix sort: the idea and a dry run

**In 30 seconds:** Sort integers **digit by digit**, from the least significant digit (ones) to the most significant, using a **stable** counting sort on each digit. Because each pass is stable, the order from earlier digits survives, and after the last digit the array is sorted. Time **O(d·(n + b))** for d digits in base b: linear for fixed-width keys. No comparisons.

**Why it exists:** Counting sort alone needs a small range. Radix sort applies it one digit at a time, so huge ranges (32-bit ints, phone numbers, IDs, fixed-length strings) can still be sorted in linear time.

**Analogy (remember this one):** Sorting number plates: first stack the cars by the last digit, then (keeping that order inside each stack) restack by the second-to-last digit, and so on. After the first digit, the whole line is in order.

#### How it works

1. Find the maximum to know how many digits d there are.
2. For exp = 1, 10, 100 …: counting-sort the array by `(x / exp) % 10`, stably.
3. Copy the output back and move to the next digit.
4. After the most significant digit the array is sorted.

> 💡 **Remember it:** Radix sort = **sort by the last digit, then the next, keeping order**, like re-stacking number plates.

#### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `radix`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

#### Dry run

```java
import java.util.Arrays;

public class RadixDemo {

    public static void main(String[] args) {
        int[] a = {170, 45, 75, 90, 802, 24, 2, 66};
        int max = Arrays.stream(a).max().orElse(0);
        for (int exp = 1; max / exp > 0; exp *= 10) {
            int[] count = new int[10], out = new int[a.length];
            for (int x : a) count[(x / exp) % 10]++;
            for (int d = 1; d < 10; d++) count[d] += count[d - 1];
            for (int i = a.length - 1; i >= 0; i--) out[--count[(a[i] / exp) % 10]] = a[i];
            System.arraycopy(out, 0, a, 0, a.length);
            System.out.println("by the " + (exp == 1 ? "ones" : exp == 10 ? "tens" : "hundreds") + " digit: " + Arrays.toString(a));
        }
        /* Output:
           by the ones digit: [170, 90, 802, 2, 24, 45, 75, 66]
           by the tens digit: [802, 2, 24, 45, 66, 170, 75, 90]
           by the hundreds digit: [2, 24, 45, 66, 75, 90, 170, 802]
        */
    }
}
```

#### The Java

Sort by the ones digit, then the tens, then the hundreds, each time with a **stable** counting sort. Many integers or fixed-length strings (IDs, phone numbers, dates).

```java
static void radixSort(int[] a) {                      // non-negative ints, least significant digit first
    int max = Arrays.stream(a).max().orElse(0);
    for (int exp = 1; max / exp > 0; exp *= 10) {
        int[] count = new int[10], out = new int[a.length];
        for (int x : a) count[(x / exp) % 10]++;
        for (int d = 1; d < 10; d++) count[d] += count[d - 1];
        for (int i = a.length - 1; i >= 0; i--)        // a stable counting sort on this digit
            out[--count[(a[i] / exp) % 10]] = a[i];
        System.arraycopy(out, 0, a, 0, a.length);
    }
}
```

Best **O(d·(n + b))** · Average **O(d·(n + b))** · Worst **O(d·(n + b))** · Space **O(n + b)** · Stable **Yes** · Adaptive **–**. 0 comparisons; d passes (d = digits, b = base 10).

▶ See it step by step in the explorer

### 42. Radix sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Radix sort (LSD, base 10) | O(d·(n + b)) | O(d·(n + b)) | O(d·(n + b)) | O(n + b) | Yes | – | 0 comparisons; d passes (d = digits, b = base 10) |

#### Why these costs

- Each pass is a counting sort over n values with b = 10 buckets: O(n + b).
- d passes: O(d·(n + b)). For 32-bit ints in base 256, d = 4: effectively O(n).
- Extra space O(n + b) for the output and the counts.
- Stability of each pass is essential: an unstable pass would scramble the order produced by earlier digits.
- Negative numbers need an offset (or a separate pass for the sign).

**When to use it:** Use it for many fixed-width integer or string keys (IDs, dates, phone numbers, IP addresses). Avoid it for few elements, variable-length keys with huge d, or floating point without bit tricks.

### 43. Radix sort: interview problems, mistakes and questions

#### Interview problems that use it

| Problem | Approach |
|---|---|
| **Maximum Gap (LC 164)** | Radix sort in O(n), then scan adjacent differences (or the bucket/pigeonhole trick). |
| **Sort 10 million phone numbers** | LSD radix sort: d = 10 digits, linear time. |
| **Sort strings of equal length** | LSD radix on characters from the last position to the first. |
| **Why can radix sort beat n log n?** | It doesn't compare; its cost depends on the key width d, not on log n. |

#### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Using an unstable sort for each digit | Earlier digits' order is lost: wrong result | A stable counting sort per digit |
| Starting from the most significant digit with this loop | LSD loop logic gives wrong order | LSD: ones first. MSD needs recursion per bucket |
| Negative numbers | `(x / exp) % 10` is negative: bad index | Offset all values by −min, or sort negatives separately |
| `max / exp` overflow with exp *= 10 near Integer.MAX_VALUE | exp overflows and the loop misbehaves | Use long exp or loop a fixed number of digits |

#### Interview questions

**Q01. How does LSD radix sort work?** Stable counting sort by the ones digit, then the tens, and so on up to the most significant digit. Stability keeps the earlier digits' order inside equal digits.

**Q02. What is its complexity?** O(d·(n + b)) time and O(n + b) space, where d is the number of digits and b the base.

**Q03. Why must each pass be stable?** Pass k must keep the order created by passes 1 … k − 1 among values with the same k-th digit; otherwise the lower digits are scrambled.

**Q04. Radix sort vs counting sort?** Counting sort needs the whole range k in memory; radix sort handles big ranges by counting one digit (base b) at a time.

#### Takeaways

- Stable counting sort digit by digit, least significant first.
- O(d·(n + b)): linear for fixed-width keys; no comparisons.
- Every pass must be stable; negatives need an offset.

#### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_radix`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Bucket sort →

### 44. Bucket sort: the idea and a dry run

**In 30 seconds:** Spread the values into **buckets by range** (bucket = x · n / (max + 1)), sort each small bucket, and concatenate the buckets in order. If the values are spread evenly, each bucket holds about one value and the whole sort is **O(n + k) on average**; if they all land in one bucket it degrades to that bucket's sort, O(n²) with insertion sort. In interviews the same idea, with **frequency as the bucket index**, solves Top K Frequent in O(n).

**Why it exists:** When you know the distribution (uniform floats in [0, 1), scores 0–99), you can place each value almost directly where it belongs and skip most comparisons.

**Analogy (remember this one):** Post office pigeonholes: letters are dropped into holes by postcode range, each hole is sorted by hand (it holds only a few letters), and then the holes are emptied left to right.

#### How it works

1. Create n empty buckets.
2. Put each value x into bucket `x · n / (max + 1)`; the bucket index grows with x.
3. Sort every bucket (they are small, so insertion sort is typical).
4. Concatenate the buckets in order.

> 💡 **Remember it:** Bucket sort = **pigeonholes by range**: drop each value in its hole, tidy each hole, read the holes in order.

#### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `bucket`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

#### Dry run

```java
import java.util.*;

public class BucketDemo {

    public static void main(String[] args) {
        int[] a = {78, 17, 39, 26, 72, 94, 21, 12, 23, 68};   // values 0..99
        int n = a.length;
        List<List<Integer>> buckets = new ArrayList<>();
        for (int b = 0; b < n; b++) buckets.add(new ArrayList<>());
        for (int x : a) buckets.get(x * n / 100).add(x);
        System.out.println("buckets " + buckets);
        int k = 0;
        for (List<Integer> b : buckets) {
            Collections.sort(b);
            for (int x : b) a[k++] = x;
        }
        System.out.println("sorted  " + Arrays.toString(a));

        // LeetCode 347, Top K Frequent: bucket index = frequency, O(n)
        int[] nums = {1, 1, 1, 2, 2, 3};
        Map<Integer, Integer> freq = new HashMap<>();
        for (int x : nums) freq.merge(x, 1, Integer::sum);
        List<List<Integer>> byFreq = new ArrayList<>();
        for (int i = 0; i <= nums.length; i++) byFreq.add(new ArrayList<>());
        freq.forEach((v, f) -> byFreq.get(f).add(v));
        List<Integer> top = new ArrayList<>();
        for (int f = nums.length; f > 0 && top.size() < 2; f--) top.addAll(byFreq.get(f));
        System.out.println("top 2 frequent " + top);
        /* Output:
           buckets [[], [17, 12], [26, 21, 23], [39], [], [], [68], [78, 72], [], [94]]
           sorted  [12, 17, 21, 23, 26, 39, 68, 72, 78, 94]
           top 2 frequent [1, 2]
        */
    }
}
```

#### The Java

Scatter values into buckets by range, sort each small bucket, then concatenate. Values spread evenly over a known range; Top K Frequent (LC 347) buckets by frequency.

```java
static void bucketSort(int[] a, int max) {            // values 0..max, spread evenly
    int n = a.length;
    List<List<Integer>> buckets = new ArrayList<>();
    for (int b = 0; b < n; b++) buckets.add(new ArrayList<>());
    for (int x : a)
        buckets.get((int) ((long) x * n / (max + 1))).add(x);
    int k = 0;
    for (List<Integer> b : buckets) {
        Collections.sort(b);
        for (int x : b) a[k++] = x;
    }
}
```

Best **O(n + k)** · Average **O(n + k)** · Worst **O(n²)** · Space **O(n + k)** · Stable **Yes*** · Adaptive **–**. linear on average; all in one bucket = worst case.

▶ See it step by step in the explorer

### 45. Bucket sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Bucket sort | O(n + k) | O(n + k) | O(n²) | O(n + k) | Yes* | – | linear on average; all in one bucket = worst case |

#### Why these costs

- Scatter and gather are O(n); with n buckets and uniform data each bucket has O(1) values on average, so sorting them is O(n) total.
- Worst case: all values in one bucket, so the bucket sort dominates: O(n²) with insertion sort, O(n log n) with a comparison sort.
- Space O(n + k) for the buckets.
- Stable if values are appended in input order and each bucket is sorted stably.

**When to use it:** Use it for uniformly distributed values with a known range, or when the "key" is small like a frequency (LC 347). Avoid it for skewed data.

### 46. Bucket sort: interview problems, mistakes and questions

#### Interview problems that use it

| Problem | Approach |
|---|---|
| **Top K Frequent Elements (LC 347)** | Count frequencies; bucket i holds the values that occur i times (i ≤ n); read buckets from the top. O(n). |
| **Maximum Gap (LC 164)** | n − 1 buckets by range; the max gap is between buckets, so keep only each bucket's min and max. O(n). |
| **Sort floats uniformly in [0, 1)** | Bucket = (int)(x · n); classic CLRS bucket sort. |
| **Contains Duplicate III (LC 220)** | Buckets of width t + 1 over values; check the same and neighbouring buckets. |

#### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Bucket index `x * n / max` | x = max gives index n: out of bounds | Divide by `max + 1` |
| `x * n` overflow for large values | Negative index | Compute in long |
| Choosing too few buckets for the data | Big buckets, slow inner sorts | About n buckets for n values |
| Assuming O(n) on any input | Skewed data puts everything in one bucket | State the uniform-distribution assumption |

#### Interview questions

**Q01. How does bucket sort work and when is it linear?** Scatter values into range buckets, sort each bucket, concatenate. It is O(n + k) on average when values are spread uniformly so each bucket is small.

**Q02. What is its worst case?** All values in one bucket: the cost of the inner sort on n values, O(n²) with insertion sort.

**Q03. How does bucket sort solve Top K Frequent in O(n)?** Frequencies are between 1 and n, so use them as bucket indexes: bucket[f] lists values seen f times; collect from the highest bucket down until you have k.

**Q04. Bucket sort vs counting sort?** Counting sort has one bucket per possible value (just a count); bucket sort groups a range of values per bucket and sorts inside each.

#### Takeaways

- Scatter by range, sort small buckets, concatenate.
- O(n + k) average for uniform data, O(n²) worst.
- Frequency as the bucket index: Top K Frequent in O(n).

#### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_bucket`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Cyclic sort →

### 47. Cyclic sort: the idea and a dry run

**In 30 seconds:** When the values are exactly (or almost) **1 … n**, value v belongs at index **v − 1**. Walk the array: if a[i] is not at its home and its home doesn't already hold the same value, swap it home; otherwise move on. Every swap puts at least one value home, so it is **O(n) time and O(1) space**. Afterwards, any index i with a[i] ≠ i + 1 reveals a **missing** number (i + 1) and a **duplicate** (a[i]): the pattern behind a whole family of interview problems.

**Why it exists:** The "numbers 1 to n" constraint appears constantly in interviews. Using the values as indexes finds missing and duplicate numbers in linear time without a HashSet.

**Analogy (remember this one):** Numbered parking bays 1 … n and cars with matching ticket numbers: walk along the bays, and whenever a car is in the wrong bay, drive it straight to the bay on its ticket. Each car moves at most once.

#### How it works

1. i = 0.
2. `target = a[i] − 1` (where a[i] belongs).
3. If `a[i] != a[target]`, swap a[i] to its target (don't move i: the new a[i] must be placed too).
4. Else i++ (a[i] is home, or it is a duplicate of the value already home).

> 💡 **Remember it:** Cyclic sort = **numbered bays**: send every car straight to the bay on its ticket.

#### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `cyclic`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

#### Dry run

```java
import java.util.*;

public class CyclicDemo {

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    static void cyclicSort(int[] a) {                     // values in 1..n (duplicates allowed)
        int i = 0;
        while (i < a.length) {
            int target = a[i] - 1;
            if (a[i] != a[target]) swap(a, i, target);
            else i++;
        }
    }

    public static void main(String[] args) {
        int[] a = {3, 1, 5, 4, 2};
        cyclicSort(a);
        System.out.println("sorted " + Arrays.toString(a));

        // LeetCode 442 / 448: after cyclic sort, every slot whose value is wrong
        // holds a duplicate, and its index + 1 is a missing number
        int[] b = {4, 3, 2, 7, 8, 2, 3, 1};
        cyclicSort(b);
        List<Integer> dup = new ArrayList<>(), missing = new ArrayList<>();
        for (int i = 0; i < b.length; i++)
            if (b[i] != i + 1) { dup.add(b[i]); missing.add(i + 1); }
        System.out.println(Arrays.toString(b) + " duplicates " + dup + " missing " + missing);
        /* Output:
           sorted [1, 2, 3, 4, 5]
           [1, 2, 3, 4, 3, 2, 7, 8] duplicates [3, 2] missing [5, 6]
        */
    }
}
```

#### The Java

Values are 1 … n, so value v belongs at index v − 1: swap each value straight home. Missing / duplicate number problems in O(n) time, O(1) space.

```java
static void cyclicSort(int[] a) {                     // values are 1..n
    int i = 0;
    while (i < a.length) {
        int target = a[i] - 1;
        if (a[i] != a[target]) swap(a, i, target);
        else i++;
    }
}
```

Best **O(n)** · Average **O(n)** · Worst **O(n)** · Space **O(1)** · Stable **No** · Adaptive **–**. at most n − 1 swaps.

▶ See it step by step in the explorer

### 48. Cyclic sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Cyclic sort (values 1…n) | O(n) | O(n) | O(n) | O(1) | No | – | at most n − 1 swaps |

#### Why these costs

- Each swap puts one value in its final slot, so there are at most n − 1 swaps; i advances n times: O(n).
- O(1) extra space: no HashSet or count array.
- Comparing `a[i]` with `a[target]` (not with i + 1) stops infinite loops on duplicates.
- Only works when values map to indexes (1..n or 0..n−1).

**When to use it:** Use it whenever the input is a permutation (or near-permutation) of 1..n or 0..n − 1 and you need missing/duplicate values in O(1) space.

### 49. Cyclic sort: interview problems, mistakes and questions

#### Interview problems that use it

| Problem | Approach |
|---|---|
| **Missing Number (LC 268)** | Values 0..n: cyclic sort for values < n, then the first index with a[i] ≠ i (or n). (XOR or sum also work.) |
| **Find the Duplicate Number (LC 287)** | Cyclic sort finds it (modifies the array); Floyd's cycle detection does it read-only. |
| **First Missing Positive (LC 41)** | Place each value in 1..n at index v − 1, ignore the rest; the first i with a[i] ≠ i + 1 gives i + 1. |
| **Find All Duplicates (LC 442) / All Missing (LC 448)** | After cyclic sort, wrong slots give duplicates a[i] and missing numbers i + 1. |
| **Set Mismatch (LC 645)** | The one wrong slot gives the duplicate and the missing number. |

#### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Condition `a[i] != i + 1` | With duplicates it swaps the same values forever | Compare `a[i] != a[a[i] − 1]` |
| Incrementing i after a swap | The value swapped in is never placed | Only i++ when nothing was swapped |
| Values outside 1..n (LC 41) | Index out of bounds | Skip values ≤ 0 or > n |
| Off-by-one between 0..n−1 and 1..n | Wrong targets | target = a[i] − 1 for 1..n; a[i] for 0..n−1 |

#### Interview questions

**Q01. What is cyclic sort and when can you use it?** For values in 1..n, swap each value to index v − 1 until everything is home. Only when values map to indexes; O(n) time, O(1) space.

**Q02. Why is it O(n) even though it has a while loop with swaps?** Each swap places one value permanently, so there are at most n − 1 swaps, plus n increments of i.

**Q03. How do you find all duplicates and missing numbers with it?** After the sort, every index i with a[i] ≠ i + 1 holds a duplicate a[i], and i + 1 is missing.

**Q04. How does it find the first missing positive (LC 41)?** Place every value in 1..n at its index, ignore others; the first index i with a[i] ≠ i + 1 gives the answer i + 1 (or n + 1).

#### Takeaways

- Values 1..n: value v belongs at index v − 1.
- Swap until home; compare with a[target] to survive duplicates.
- O(n) time, O(1) space; wrong slots reveal missing and duplicate numbers.

#### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_cyclic`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Dutch National Flag →

### 50. Dutch National Flag: the idea and a dry run

**In 30 seconds:** Sort an array of only **0s, 1s and 2s** in **one pass** with three pointers: everything before `lo` is 0, between lo and mid is 1, after `hi` is 2, and a[mid..hi] is still unknown. A 0 is swapped to lo (lo++, mid++), a 2 is swapped to hi (hi-- only, because the value that came from hi is unchecked), a 1 just moves mid. **O(n) time, O(1) space**. It is Dijkstra's 3-way partition, the core of 3-way quicksort.

**Why it exists:** Counting sort would need two passes; this needs one and works in place. The same three-zone idea partitions around any pivot when there are many duplicates.

**Analogy (remember this one):** The Dutch flag has three stripes: red, white, blue. Sort a pile of red, white and blue cars into a lane with red at the front and blue at the back, using one walk and only swaps.

#### How it works

1. lo = mid = 0, hi = n − 1.
2. While mid ≤ hi: if a[mid] == 0, swap(lo, mid), lo++, mid++.
3. Else if a[mid] == 2, swap(mid, hi), hi-- (mid stays).
4. Else (a 1) mid++.

> 💡 **Remember it:** Dutch National Flag = **three stripes, three pointers**: 0s to the front, 2s to the back, 1s stay in the middle.

#### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `dnf`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

#### Dry run

```java
import java.util.Arrays;

public class DnfDemo {

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    public static void main(String[] args) {
        int[] a = {2, 0, 2, 1, 1, 0};                   // LeetCode 75, Sort Colors
        int lo = 0, mid = 0, hi = a.length - 1;
        while (mid <= hi) {
            int v = a[mid];
            if (v == 0) swap(a, lo++, mid++);
            else if (v == 2) swap(a, mid, hi--);
            else mid++;
            System.out.println("saw " + v + " -> " + Arrays.toString(a) + "  lo=" + lo + " mid=" + mid + " hi=" + hi);
        }
        /* Output:
           saw 2 -> [0, 0, 2, 1, 1, 2]  lo=0 mid=0 hi=4
           saw 0 -> [0, 0, 2, 1, 1, 2]  lo=1 mid=1 hi=4
           saw 0 -> [0, 0, 2, 1, 1, 2]  lo=2 mid=2 hi=4
           saw 2 -> [0, 0, 1, 1, 2, 2]  lo=2 mid=2 hi=3
           saw 1 -> [0, 0, 1, 1, 2, 2]  lo=2 mid=3 hi=3
           saw 1 -> [0, 0, 1, 1, 2, 2]  lo=2 mid=4 hi=3
        */
    }
}
```

#### The Java

Three pointers split the array into 0s, 1s, unknown and 2s in one pass. Sort Colors (LC 75); the partition step of 3-way quicksort.

```java
static void sortColors(int[] a) {                     // values 0, 1, 2 (LeetCode 75)
    int lo = 0, mid = 0, hi = a.length - 1;
    while (mid <= hi) {
        if (a[mid] == 0) swap(a, lo++, mid++);
        else if (a[mid] == 2) swap(a, mid, hi--);
        else mid++;
    }
}
```

Best **O(n)** · Average **O(n)** · Worst **O(n)** · Space **O(1)** · Stable **No** · Adaptive **–**. one pass, at most n swaps.

▶ See it step by step in the explorer

### 51. Dutch National Flag: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Dutch National Flag (0, 1, 2) | O(n) | O(n) | O(n) | O(1) | No | – | one pass, at most n swaps |

#### Why these costs

- Each step either moves mid forward or hi backward, so the loop runs at most n times: O(n).
- At most n swaps, O(1) extra space.
- Not stable (swaps jump), which doesn't matter for plain 0/1/2 values.
- Generalizes: partition into < pivot, = pivot, > pivot.

**When to use it:** Use it for Sort Colors, any three-way partition (negatives / zeros / positives), and 3-way quicksort.

### 52. Dutch National Flag: interview problems, mistakes and questions

#### Interview problems that use it

| Problem | Approach |
|---|---|
| **Sort Colors (LC 75)** | Exactly this algorithm, one pass. |
| **Partition around a pivot with duplicates** | 3-way partition: < pivot, = pivot, > pivot. |
| **Move Zeroes (LC 283) / segregate even and odd** | The two-zone version: one write pointer. |
| **Wiggle Sort II (LC 324)** | Median via Quickselect, then a 3-way partition with index mapping. |

#### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| mid++ after swapping with hi | The value that came from hi is never checked | Only hi-- |
| Loop condition `mid < hi` | The last unknown element is skipped | `while (mid <= hi)` |
| Not moving mid when swapping a 0 | Re-checks a value known to be 1 (or loops) | lo++ and mid++ together |
| Using two passes of counting | Works, but the interviewer asked for one pass | Three pointers |

#### Interview questions

**Q01. Explain the Dutch National Flag algorithm.** Three pointers lo, mid, hi keep zones [0s | 1s | unknown | 2s]. Look at a[mid]: 0 → swap to lo, lo++, mid++; 2 → swap to hi, hi--; 1 → mid++. One pass, O(1) space.

**Q02. Why don't we increment mid after swapping with hi?** The value moved from hi into mid has not been examined yet; it could be a 0 or 2.

**Q03. How is it related to quicksort?** It is the 3-way partition: with a pivot instead of 1, zones become < pivot, = pivot, > pivot, which makes quicksort fast on many duplicates.

**Q04. What is its complexity?** O(n) time with at most n swaps, O(1) extra space.

#### Takeaways

- Three pointers: [0s | 1s | unknown | 2s].
- 0 → swap to lo, lo++ and mid++; 2 → swap to hi, hi-- only; 1 → mid++.
- O(n), O(1); the 3-way partition of quicksort.

#### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_dnf`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Path complete: back to the explorer ↑

## Lesson 07 — The Collections Framework (Level 3)

*Added 2026-10-22. Page `lessons/07-collections.html`, band `#coll`, sections C1–C12. Level 3 of the roadmap. Arrays (Lesson 04) have a fixed size and almost no behaviour; real programs need lists that grow, sets without duplicates, maps from keys to values, and queues. The Collections Framework gives you all of them behind a few interfaces. This lesson has 12 sections, 12 verified programs, 2 figures, 13 interactive labs (including the **parking lot** that explains HashMap), 18 interview questions and a 12-question quiz. It builds on `equals`/`hashCode` from Lesson 05 and Big-O from Lesson 06.*

> All code has been compiled and run on JDK 25. The output is shown in the comments.

### C1. The Collections Framework: the map of every type (`#c-overview`)

> **In 30 seconds** A **collection** is an object that holds other objects. Java gives you four kinds: a **List** (ordered, indexed, duplicates allowed), a **Set** (no duplicates), a **Queue**/**Deque** (take from the front, or both ends) and a **Map** (key → value). The first three extend `Collection`, which extends `Iterable` (so for-each works). `Map` is a separate tree. You declare the **interface** (`List`) and create a **class** (`ArrayList`).

**Why it exists:** before Java 1.2 every project wrote its own resizable array and hash table, each with different method names. One framework with shared interfaces means any code that accepts a `List` works with every list, and you can swap `ArrayList` for `LinkedList` by changing one word.

**Analogy:** the interfaces are **job titles** (List = "a numbered shelf", Set = "a guest list", Queue = "a ticket counter", Map = "a parking lot with numbered bays"), and the classes are the **people** who do the job in different ways. You hire for the title; you can change who fills it.

#### See it

Answer three questions about your data, and the lab picks the collection and shows where it sits in the family tree. Click any class to see its rules and costs.

**Lab `#clPick`:** Which collection? (decision helper + family tree).

**Figure `#fig-colltree`.** **The family tree.** Interfaces (outlined) say *what* a collection can do; classes (accent border) say *how*. `Map` does not extend `Collection`: it holds pairs, not single elements, but it gives you collection views (`keySet()`, `values()`, `entrySet()`). `NavigableSet`/`NavigableMap` sit between the Sorted interfaces and the Tree classes, and Java 21 added `SequencedCollection`/`SequencedMap` (`getFirst()`, `reversed()`) above List, Deque, LinkedHashSet and the sorted types; both are left out to keep the picture readable.

```java
// CollectionTour.java
import java.util.*;

public class CollectionTour {
    public static void main(String[] args) {
        // List: ordered, indexed, duplicates allowed
        List<String> list = new ArrayList<>();
        list.add("tea"); list.add("coffee"); list.add("tea");
        System.out.println(list);              // [tea, coffee, tea]
        System.out.println(list.get(1));       // coffee

        // Set: no duplicates (HashSet: no order promised)
        Set<String> set = new HashSet<>(list);
        System.out.println(set.size());        // 2
        System.out.println(set.contains("tea"));   // true

        // Queue: first in, first out
        Queue<String> queue = new ArrayDeque<>();
        queue.offer("first"); queue.offer("second");
        System.out.println(queue.poll());      // first

        // Map: key -> value, not a Collection
        Map<String, Integer> stock = new HashMap<>();
        stock.put("tea", 10);
        stock.put("tea", 12);                  // same key: the value is replaced
        stock.merge("coffee", 1, Integer::sum);
        System.out.println(stock.get("tea"));  // 12
        System.out.println(stock.getOrDefault("milk", 0));  // 0
        System.out.println(stock instanceof Collection);    // false

        // program to the interface: the variable type is List, the object is ArrayList
        List<Integer> nums = new LinkedList<>(List.of(3, 1, 2));
        Collections.sort(nums);
        System.out.println(nums);              // [1, 2, 3]
    }
}
```

| Need | Interface | Default pick | Other choices |
|---|---|---|---|
| Ordered items, access by position | `List` | `ArrayList` | `LinkedList` (rarely better) |
| Unique items, fast "is it there?" | `Set` | `HashSet` | `LinkedHashSet` (keep insertion order), `TreeSet` (sorted) |
| Look up a value by a key | `Map` | `HashMap` | `LinkedHashMap` (order, LRU), `TreeMap` (sorted, ranges) |
| Process in arrival order / a stack | `Deque` | `ArrayDeque` | `LinkedList` |
| Always take the smallest (or largest) | `Queue` | `PriorityQueue` | `TreeMap` if you also need to remove any item |
| Shared between threads | any | `ConcurrentHashMap` | `CopyOnWriteArrayList`, `BlockingQueue` (C11) |

- **Collections hold objects, not primitives.** `List<int>` does not compile; you write `List<Integer>` and Java *autoboxes* each `int`. That costs memory (an `Integer` is ~16 bytes, an `int` 4).
- **`Collection`** is the interface; **`Collections`** (with an s) is a utility class of static methods: `sort`, `reverse`, `shuffle`, `max`, `unmodifiableList`, `synchronizedMap`…
- **Program to the interface:** `List<String> names = new ArrayList<>();`. Method parameters and return types should also be interfaces.

**Common mistakes:** using `Vector`, `Hashtable` or `Stack` (legacy, synchronised on every call; use `ArrayList`, `HashMap`, `ArrayDeque`); expecting a `HashSet` or `HashMap` to keep insertion order; declaring `ArrayList<String> x` everywhere instead of `List<String>`.

**Interview answer:** "The framework has four main interfaces: `List` for ordered, indexed data with duplicates; `Set` for unique elements; `Queue` and `Deque` for FIFO, LIFO and priority processing; and `Map` for key-value lookup, which is a separate hierarchy because it stores pairs. My defaults are `ArrayList`, `HashSet`, `HashMap` and `ArrayDeque`; I switch to the linked or tree versions when I need insertion order or sorting."
- Follow-ups:
  - Why doesn't Map extend Collection? — A map's unit is a key-value pair; `add(E)` makes no sense for it. It offers `keySet`, `values` and `entrySet` views instead.
  - Collection vs Collections? — Interface vs utility class of static helpers.
  - What is Iterable for? — It provides `iterator()`, which is what the for-each loop calls.

### C2. Generics: type-safe collections (`#c-generics`)

> **In 30 seconds** `List<String>` tells the compiler "only Strings go in", so it rejects `add(42)` at compile time and you never need a cast when you read. `<T>` is a **type parameter**; `<T extends Comparable<T>>` is a **bound**. Wildcards make methods flexible: `? extends T` to **read** (producer), `? super T` to **write** (consumer): **PECS**. Generics exist only at compile time: **type erasure** removes them from the bytecode.

**Why it exists:** before Java 5 a `List` held `Object`s. Every read needed a cast, and putting an `Integer` into a list of names only failed later, with a `ClassCastException` far from the bug. Generics move that failure to compile time.

**Analogy:** a generic list is a **labelled jar**: "Sugar only". The label is checked when you fill it (compile time), and then peeled off before it goes on the shelf (erasure): at run time all jars look the same.

```java
// GenericsDemo.java
import java.util.*;

public class GenericsDemo {

    // a generic class: T is decided by whoever creates the Box
    static class Box<T> {
        private T value;
        void put(T value) { this.value = value; }
        T get() { return value; }
    }

    // a generic method with a bound: T must be Comparable to itself
    static <T extends Comparable<T>> T max(List<T> items) {
        T best = items.get(0);
        for (T x : items) if (x.compareTo(best) > 0) best = x;
        return best;
    }

    // PECS: producer extends (we only read Numbers out)
    static double sum(List<? extends Number> nums) {
        double s = 0;
        for (Number n : nums) s += n.doubleValue();
        return s;
    }

    // PECS: consumer super (we only put Integers in)
    static void fill(List<? super Integer> out) {
        for (int i = 1; i <= 3; i++) out.add(i);
    }

    public static void main(String[] args) {
        Box<String> b = new Box<>();
        b.put("hello");
        String s = b.get();                       // no cast needed
        System.out.println(s.length());           // 5

        System.out.println(max(List.of(4, 9, 2)));          // 9
        System.out.println(max(List.of("pear", "apple")));  // pear

        System.out.println(sum(List.of(1, 2.5, 3L)));       // 6.5

        List<Number> sink = new ArrayList<>();
        fill(sink);
        System.out.println(sink);                 // [1, 2, 3]

        // type erasure: at run time both are just ArrayList
        List<String> a = new ArrayList<>();
        List<Integer> c = new ArrayList<>();
        System.out.println(a.getClass() == c.getClass());   // true

        // raw types skip the checks and fail later
        List raw = a;
        raw.add(42);                              // compiles, with an unchecked warning
        try {
            String first = a.get(0);              // ClassCastException here, far from the bug
        } catch (ClassCastException e) {
            System.out.println("ClassCastException");
        }
    }
}
```

#### See it: the wildcard checker

Pick a parameter type, then try to read from it, write to it, or pass different lists to it. Every result is what `javac` (JDK 25) actually says.

**Lab `#clPecs`:** Wildcard checker: real javac (JDK 25) results for 5 parameter types × 6 statements and 4 arguments.

- **Generics are invariant:** an `Integer` is a `Number`, but a `List<Integer>` is **not** a `List<Number>`. If it were, you could add a `Double` to a list of Integers through the wider reference. (Arrays are covariant and pay for it at run time with `ArrayStoreException`: Lesson 04.)
- **`? extends Number`**: "some unknown subtype of Number". Reading gives you a `Number`; writing anything except `null` is refused because the compiler doesn't know which subtype the list holds.
- **`? super Integer`**: "Integer or some supertype". You can add Integers; reading only gives you `Object`.
- **Erasure consequences:** no `new T()`, no `new T[n]`, no `instanceof List<String>`, no overloads that differ only in type arguments (`m(List<String>)` and `m(List<Integer>)` clash), no primitives as type arguments.
- **The diamond** `new ArrayList<>()` lets the compiler infer the type argument from the variable.

**Common mistakes:** raw types (`List list = new ArrayList();`), which switch the checks off; writing `List<Object>` when you mean "any list" (that is `List<?>`); trying to add to a `List<? extends T>`.

**Interview answer:** "Generics give compile-time type safety and remove casts. They're implemented by type erasure: the compiler checks the types, inserts the casts, and the bytecode only sees the bounds, usually `Object`, which kept old code compatible. Generic types are invariant, so I use wildcards for flexible APIs: PECS, producer extends, consumer super. `Collections.copy(List<? super T> dest, List<? extends T> src)` is the textbook example."
- Follow-ups:
  - Why can't you write `new T[10]`? — After erasure the JVM wouldn't know the element type to create.
  - What is a bridge method? — A synthetic method `javac` adds so an override still works after erasure (e.g. `compareTo(Object)` calling `compareTo(Student)`).
  - `List<?>` vs raw `List`? — `List<?>` is type-checked (you can't add); raw `List` is unchecked.

### C3. List: ArrayList vs LinkedList (`#c-list`)

> **In 30 seconds** **ArrayList** wraps an `Object[]`. `get(i)` is O(1); adding at the end is **amortised O(1)**; when the array is full it grows by half (`new = old + old/2`, starting at 10) and copies. Inserting or removing in the middle shifts everything after it: O(n). **LinkedList** is a doubly linked list of nodes: O(1) at the two ends, but `get(i)` walks node by node: O(n). In practice ArrayList wins almost always, because arrays are cache-friendly.

**Analogy:** ArrayList is a **row of numbered cinema seats**: you go straight to seat 7, but making someone sit in seat 2 means everyone from seat 2 onwards moves one seat right. LinkedList is a **treasure hunt**: each clue tells you where the next one is. Adding a clue is easy once you're there; getting to clue 7 means reading clues 1 to 6.

#### See it

The same operations on both lists. Count the **moves** (elements shifted or copied) for ArrayList and the **hops** (nodes walked) for LinkedList. Keep adding to watch the array fill up and grow 10 → 15 → 22.

**Lab `#clList`:** ArrayList vs LinkedList: moves and hops counted; growth 10 → 15 → 22.

```java
// ListInternals.java
import java.util.*;

public class ListInternals {
    public static void main(String[] args) {
        // ArrayList grows by half: newCapacity = old + (old >> 1), first add gives 10
        int cap = 10;
        StringBuilder growth = new StringBuilder("10");
        for (int i = 0; i < 6; i++) {
            cap = cap + (cap >> 1);
            growth.append(" -> ").append(cap);
        }
        System.out.println(growth);               // 10 -> 15 -> 22 -> 33 -> 49 -> 73 -> 109

        List<Integer> arr = new ArrayList<>(List.of(10, 20, 30, 40));
        arr.add(1, 15);                           // shifts 20, 30, 40 one place right
        System.out.println(arr);                  // [10, 15, 20, 30, 40]
        arr.remove(Integer.valueOf(30));          // remove the value 30
        arr.remove(0);                            // remove index 0
        System.out.println(arr);                  // [15, 20, 40]

        LinkedList<Integer> linked = new LinkedList<>(List.of(1, 2, 3));
        linked.addFirst(0);                       // O(1): just relink the head
        linked.addLast(4);                        // O(1): relink the tail
        System.out.println(linked);               // [0, 1, 2, 3, 4]
        System.out.println(linked.get(2));        // 2  (but get walks node by node: O(n))

        // ListIterator: walk and insert without index arithmetic
        ListIterator<Integer> it = linked.listIterator();
        while (it.hasNext()) if (it.next() == 2) it.add(99);
        System.out.println(linked);               // [0, 1, 2, 99, 3, 4]

        // trimToSize / ensureCapacity exist only on ArrayList, not on List
        ArrayList<String> big = new ArrayList<>(1000);   // pre-size when you know the count
        big.add("x");
        big.trimToSize();
        System.out.println(big.size());           // 1
    }
}
```

| Operation | ArrayList | LinkedList |
|---|---|---|
| `get(i)`, `set(i, x)` | O(1) | O(n) (walks from the nearer end) |
| `add(x)` at the end | O(1) amortised (O(n) on a resize) | O(1) |
| `add(0, x)`, `remove(0)` | O(n) (shift everything) | O(1) |
| `add(i, x)` in the middle | O(n) shift | O(n) walk, then O(1) link |
| `contains(x)`, `indexOf(x)` | O(n) | O(n) |
| Memory per element | one reference (4–8 bytes) + spare capacity | a node: ~24–32 bytes (item, prev, next, header) |

- **Lazy start:** `new ArrayList<>()` holds a shared empty array; the 10-slot array is created on the first `add`.
- **Why amortised O(1):** each resize copies n elements but then gives n/2 free slots, so the copying averages out to a constant per add (the `#cxAmort` lab in Lesson 06 shows it).
- **`remove(int)` vs `remove(Object)`:** on a `List<Integer>`, `remove(1)` removes **index** 1; write `remove(Integer.valueOf(1))` to remove the value.
- **Pre-size** with `new ArrayList<>(n)` when you know the count: no resizes at all.

**Common mistakes:** choosing LinkedList "because inserts are O(1)" (only once you're already at the node; getting there is O(n)); calling `get(i)` in a loop over a LinkedList (O(n²)); the `remove(1)` index-vs-value trap.

**Interview answer:** "ArrayList is backed by an array: O(1) random access, amortised O(1) append, O(n) insert or remove in the middle because elements shift. It grows by 50% when full. LinkedList is a doubly linked list: O(1) add and remove at the ends or through an iterator, but O(n) to reach an index, and much more memory per element. Because of CPU caches, ArrayList is faster in nearly every real workload; for a queue or stack I'd use ArrayDeque rather than LinkedList."
- Follow-ups:
  - What's the default capacity? — 10, allocated on the first add.
  - Is ArrayList thread-safe? — No. Use `CopyOnWriteArrayList` or external locking.
  - How does `ArrayList.remove(i)` work? — `System.arraycopy` shifts the tail left and nulls the last slot so it can be garbage-collected.

### C4. HashMap internals: hashing, buckets, resize and treeify (`#c-hashmap`)

> **In 30 seconds** A HashMap is an array of **buckets** (16 by default). To store a key it calls `key.hashCode()`, mixes the high bits in (`h ^ (h >>> 16)`) and picks the bucket with `hash & (n − 1)`. Keys that land in the same bucket form a **linked chain**; `equals` finds the right one. When **size > capacity × 0.75** the table **doubles** and every entry is re-placed. A chain that would exceed 8 becomes a **red-black tree** (only once the table has 64+ buckets). Average `get`/`put`: **O(1)**.

**Why it exists:** searching a list for a key is O(n). If the key itself tells you where to look, you jump straight to one small bucket: O(1) on average, whatever the size.

**Analogy (remember this one):** a HashMap is a **parking lot with numbered bays**. The car's **number plate is the key**. The valet turns the plate into a bay number (**`hashCode` picks the bay**), drives there, and if several cars share that bay he reads each plate until one matches (**`equals` finds your car**). When the lot is three-quarters full, the owner **builds a lot twice as big** and re-parks every car (resize).

#### Remember it: the parking lot

**Lab `#anPark`:** Parking lot analogy: hashCode picks the bay, equals finds the car; a changed plate is lost; rebuild at 75%.

> **💡 Remember it****hashCode picks the bay, equals finds your car.** Change your number plate while parked (a mutable key) and the valet will look in the wrong bay forever.

**Figure `#fig-hashmap`.** **Inside `HashMap.put` (Java 8+).** The table is created on the first `put`. Each bucket is empty, a chain of `Node`s (new nodes go at the tail), or a tree of `TreeNode`s. "plum" is drawn in bucket 1 for illustration; where a real key lands depends on its hash, as the lab below computes. A `null` key is allowed (hash 0, bucket 0). Capacity is always a power of two, so `hash & (n − 1)` keeps the low bits: a non-negative remainder modulo n without a slow division (plain `%` would even go negative for negative hashes).

#### See it: a real HashMap

This lab uses Java's exact `String.hashCode()`, the same spread and index formula, the 0.75 load factor and the treeify rules, checked against JDK 25. Add fruits until it resizes, then try the **collision attack**: keys like `AaAa` and `BBBB` all have the same hash code.

**Lab `#clMap`:** A real HashMap: String.hashCode, spread, index, resize at 0.75, lo/hi split, treeify (9th node, table ≥ 64, else resize).

```java
// HashMapInternals.java
import java.util.*;

public class HashMapInternals {

    // what HashMap does to a key's hashCode before picking a bucket
    static int spread(Object key) {
        int h;
        return key == null ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }

    public static void main(String[] args) {
        int n = 16;                                    // default table size
        for (String k : List.of("apple", "mango", "kiwi", "Aa", "BB")) {
            int h = k.hashCode();
            System.out.println(k + " hashCode=" + h + " bucket=" + (spread(k) & (n - 1)));
        }
        // apple hashCode=93029210 bucket=1
        // mango hashCode=103662530 bucket=15
        // kiwi hashCode=3292336 bucket=2
        // Aa hashCode=2112 bucket=0
        // BB hashCode=2112 bucket=0

        Map<String, Integer> m = new HashMap<>();
        System.out.println(m.put("Aa", 1));            // null  (no previous value)
        System.out.println(m.put("BB", 2));            // null  (collision: same bucket, different key)
        System.out.println(m.put("Aa", 3));            // 1     (same key: value replaced, old one returned)
        System.out.println(m.size());                  // 2
        m.put(null, 0);                                // one null key is allowed, always bucket 0
        System.out.println(m.get(null));               // 0

        // resize: threshold = capacity * 0.75
        System.out.println("threshold for 16 = " + (int) (16 * 0.75f));   // threshold for 16 = 12
        // capacity for 100 entries without any resize: next power of two >= 100 / 0.75
        int need = (int) Math.ceil(100 / 0.75);
        System.out.println(Integer.highestOneBit(need - 1) << 1);          // 256
        Map<String, Integer> sized = HashMap.newHashMap(100);              // Java 19+: does that maths for you
        System.out.println(sized.isEmpty());                               // true
    }
}
```

#### Why keys must not change: the lost car

If a key's `hashCode` changes while it is inside the map, the entry stays in the old bucket, but every lookup now goes to a new one.

```java
// BadKey.java
import java.util.*;

public class BadKey {

    // a mutable key: hashCode depends on a field that can change
    static class Seat {
        int row;
        Seat(int row) { this.row = row; }
        @Override public boolean equals(Object o) { return o instanceof Seat s && s.row == row; }
        @Override public int hashCode() { return Integer.hashCode(row); }
    }

    public static void main(String[] args) {
        Map<Seat, String> booked = new HashMap<>();
        Seat s = new Seat(5);
        booked.put(s, "Asha");

        s.row = 7;                                     // mutate the key while it is inside the map
        System.out.println(booked.get(s));             // null   (looks in row 7's bucket)
        System.out.println(booked.get(new Seat(5)));   // null   (right bucket, but equals fails: row is 7 now)
        System.out.println(booked.size());             // 1      (the entry is still there: lost, not removed)

        // the fix: immutable keys (String, Integer, records with immutable fields)
        record Spot(int row) {}
        Map<Spot, String> ok = new HashMap<>();
        ok.put(new Spot(5), "Asha");
        System.out.println(ok.get(new Spot(5)));       // Asha
    }
}
```

| Constant (JDK source) | Value | Meaning |
|---|---|---|
| `DEFAULT_INITIAL_CAPACITY` | 16 | Buckets when you write `new HashMap<>()` |
| `DEFAULT_LOAD_FACTOR` | 0.75 | Resize when size > capacity × 0.75 (12 for 16) |
| `TREEIFY_THRESHOLD` | 8 | A chain that already has 8 nodes is turned into a tree when a 9th arrives |
| `MIN_TREEIFY_CAPACITY` | 64 | Below this, resize instead of treeifying |
| `UNTREEIFY_THRESHOLD` | 6 | A tree bin that shrinks to 6 (during a resize split) becomes a chain again |

- **Why the spread `h ^ (h >>> 16)`?** The index uses only the low bits. Mixing the high 16 bits in stops keys whose hash codes differ only in high bits from all landing in one bucket.
- **Why powers of two?** `hash & (n − 1)` is one CPU instruction; `%` is a division. On a resize, one extra bit decides whether an entry stays at `i` or moves to `i + oldCap`.
- **Worst case:** before Java 8, many colliding keys made a bucket an O(n) list (a denial-of-service trick). Treeify caps that at O(log n) when keys are `Comparable`.
- **`put` returns the previous value** (or `null`). Prefer `getOrDefault`, `putIfAbsent`, `computeIfAbsent` and `merge` over get-check-put.
- **Iteration order** follows bucket order, so it looks random and can change after a resize. Need order? `LinkedHashMap` or `TreeMap`.

**Common mistakes:** overriding `equals` without `hashCode` (Lesson 05 P8); mutable keys; a `hashCode` that returns a constant (every key in one bucket: O(n) or O(log n)); using `new HashMap<>(100)` and expecting no resize for 100 entries (threshold is 128 × 0.75 = 96; use `HashMap.newHashMap(100)`).

**Interview answer:** "HashMap is an array of buckets. `put` computes the key's hashCode, XORs in the high 16 bits, and uses `hash & (n−1)` as the index. Colliding keys form a linked list in that bucket, and `equals` picks the matching key. When size exceeds capacity × 0.75, the table doubles and entries are split between index i and i + oldCapacity. Since Java 8 a bucket that grows past 8 nodes becomes a red-black tree if the table has at least 64 buckets, so the worst case is O(log n) instead of O(n). Average get and put are O(1)."
- Follow-ups:
  - What if two keys have the same hashCode? — Same bucket; `equals` tells them apart. Correct, just slower.
  - Can a HashMap hold null? — One null key (bucket 0) and any number of null values. `ConcurrentHashMap` and `Map.of` allow neither.
  - Is HashMap thread-safe? — No. Concurrent writes can lose updates or corrupt the table; use `ConcurrentHashMap` (C11).

### C5. Sets and LinkedHashMap: HashSet, LinkedHashSet, TreeSet and an LRU cache (`#c-sets`)

> **In 30 seconds** A **HashSet is a HashMap in disguise**: each element is stored as a key with a dummy value, so it has the same O(1) `add`/`contains` and the same `equals`/`hashCode` rules. **LinkedHashSet**/**LinkedHashMap** add a doubly linked list through the entries, so iteration follows insertion order. With `accessOrder = true`, a LinkedHashMap moves each entry you read to the end, and `removeEldestEntry` turns it into an **LRU cache**. **TreeSet** keeps elements sorted (O(log n)).

**Analogy:** an LRU cache is a **small fridge shelf** with room for three things. Whatever you just used goes to the front; when something new arrives and the shelf is full, the thing at the back, untouched the longest, goes out.

#### See it: an LRU cache

A `LinkedHashMap` with capacity 3. `get` and `put` move an entry to the "newest" end; a fourth key evicts the eldest. Switch to insertion order to see a plain FIFO cache instead.

**Lab `#clLru`:** LRU cache: LinkedHashMap access order vs insertion order, capacity 3.

```java
// SetsAndLru.java
import java.util.*;

public class SetsAndLru {

    // an LRU cache in 6 lines: access order + evict the eldest entry
    static class Lru<K, V> extends LinkedHashMap<K, V> {
        private final int capacity;
        Lru(int capacity) {
            super(16, 0.75f, true);                    // true = access order, not insertion order
            this.capacity = capacity;
        }
        @Override protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            return size() > capacity;
        }
    }

    public static void main(String[] args) {
        List<String> words = List.of("pear", "apple", "fig", "apple", "kiwi");
        System.out.println(new LinkedHashSet<>(words));  // [pear, apple, fig, kiwi]   insertion order
        System.out.println(new TreeSet<>(words));        // [apple, fig, kiwi, pear]   sorted
        Set<String> hs = new HashSet<>(words);
        System.out.println(hs.size());                   // 4   (HashSet order is not promised)
        System.out.println(hs.add("fig"));               // false  (already there)

        Lru<String, Integer> cache = new Lru<>(3);
        cache.put("a", 1); cache.put("b", 2); cache.put("c", 3);
        cache.get("a");                                  // a becomes most recently used
        cache.put("d", 4);                               // over capacity: evicts b, the least recently used
        System.out.println(cache.keySet());              // [c, a, d]
    }
}
```

|  | HashSet | LinkedHashSet | TreeSet |
|---|---|---|---|
| Backed by | `HashMap` | `LinkedHashMap` | `TreeMap` (red-black tree) |
| Order | none promised | insertion order | sorted (natural or Comparator) |
| `add` / `contains` / `remove` | O(1) | O(1) | O(log n) |
| Duplicates decided by | `hashCode` + `equals` | `hashCode` + `equals` | `compareTo` / `compare` == 0 |
| `null` element | one allowed | one allowed | no (it must be compared) |

- **`set.add(x)` returns `false`** when x is already there: a one-line duplicate check.
- **Set algebra:** `a.retainAll(b)` (intersection), `a.addAll(b)` (union), `a.removeAll(b)` (difference). They change `a`, so copy it first.
- **LRU in interviews:** the LinkedHashMap version shows you know the library; be ready to build it by hand with a `HashMap<K, Node>` plus your own doubly linked list (both O(1)).

**Common mistakes:** changing a field that `hashCode` uses after adding the object to a HashSet (it can no longer be found or removed); expecting `new LinkedHashMap<>()` to be LRU (the default is insertion order: pass `true` as the third argument); a TreeSet comparator that returns 0 for different objects (they're treated as duplicates, C8).

**Interview answer:** "HashSet is backed by a HashMap: the element is the key and a shared dummy object is the value, so uniqueness comes from hashCode and equals and operations are O(1) on average. LinkedHashSet keeps a doubly linked list for insertion order; TreeSet is a red-black tree, sorted, O(log n). For an LRU cache I extend LinkedHashMap with accessOrder true and override removeEldestEntry to return size() > capacity."
- Follow-ups:
  - How would you build LRU without LinkedHashMap? — HashMap from key to node, plus a doubly linked list with head and tail sentinels; move to front on access, drop the tail on overflow.
  - Is the LinkedHashMap LRU thread-safe? — No; wrap it or use a caching library (Caffeine).
  - What does `HashSet.add` really call? — `map.put(e, PRESENT) == null`.

### C6. TreeMap and TreeSet: sorted and navigable (`#c-treemap`)

> **In 30 seconds** A **TreeMap** keeps its keys **sorted** in a **red-black tree** (a self-balancing binary search tree), so `get`/`put`/`remove` are **O(log n)**. In return it answers questions a HashMap can't: the **nearest** key (`floorKey`, `ceilingKey`, `lowerKey`, `higherKey`), the **first**/**last**, and **ranges** (`headMap`, `tailMap`, `subMap`). Keys must be `Comparable`, or you pass a `Comparator`.

**Analogy:** a TreeMap is a **dictionary**. You can't jump straight to a word the way a HashMap jumps to a bay, but you can open it in the middle and halve the search each time, and you can always say "the word just before *mango*" or "every word from *c* to *f*".

#### See it

The keys sit in a balanced search tree. Pick a query and a number: the lab walks from the root, comparing at each node (that's the O(log n)), and highlights the answer.

**Lab `#clNav`:** TreeMap navigator: floorKey/ceilingKey/lowerKey/higherKey/get path in a balanced tree; headMap/tailMap.

```java
// TreeMapDemo.java
import java.util.*;

public class TreeMapDemo {
    public static void main(String[] args) {
        // marks -> grade boundaries, kept sorted by key (a red-black tree)
        TreeMap<Integer, String> grade = new TreeMap<>();
        grade.put(90, "A"); grade.put(75, "B"); grade.put(60, "C"); grade.put(40, "D"); grade.put(0, "F");

        System.out.println(grade);                        // {0=F, 40=D, 60=C, 75=B, 90=A}
        System.out.println(grade.floorEntry(82).getValue());   // B    (largest key <= 82)
        System.out.println(grade.ceilingKey(61));         // 75     (smallest key >= 61)
        System.out.println(grade.higherKey(90));          // null   (nothing > 90)
        System.out.println(grade.lowerKey(60));           // 40     (largest key < 60)
        System.out.println(grade.headMap(60));            // {0=F, 40=D}        keys < 60
        System.out.println(grade.tailMap(60));            // {60=C, 75=B, 90=A} keys >= 60
        System.out.println(grade.subMap(40, 90));         // {40=D, 60=C, 75=B} from 40 up to, not including, 90
        System.out.println(grade.firstKey() + " " + grade.lastKey());   // 0 90
        System.out.println(grade.descendingMap());        // {90=A, 75=B, 60=C, 40=D, 0=F}

        TreeSet<String> names = new TreeSet<>(Comparator.reverseOrder());
        names.addAll(List.of("Ravi", "Anu", "Kiran"));
        System.out.println(names);                        // [Ravi, Kiran, Anu]
        System.out.println(names.pollFirst());            // Ravi

        try {
            new TreeMap<String, Integer>().put(null, 1);  // a TreeMap must compare keys: null can't be compared
        } catch (NullPointerException e) {
            System.out.println("NullPointerException");
        }
    }
}
```

| Method | Returns | Grades example |
|---|---|---|
| `floorKey(x)` | largest key ≤ x | `floorKey(82)` → 75 |
| `ceilingKey(x)` | smallest key ≥ x | `ceilingKey(61)` → 75 |
| `lowerKey(x)` / `higherKey(x)` | strictly < x / strictly > x | `lowerKey(60)` → 40 |
| `headMap(x)` / `tailMap(x)` | keys < x / keys ≥ x (live views) | `headMap(60)` → {0, 40} |
| `subMap(a, b)` | a ≤ key < b | `subMap(40, 90)` → {40, 60, 75} |
| `firstEntry()` / `pollFirstEntry()` | smallest (and remove it) | 0=F |

- **Red-black tree:** every node is red or black, with rules that keep the longest path at most twice the shortest, so the height stays O(log n) whatever order you insert in. Insertions fix the rules with a few recolourings and rotations.
- **Range views are live:** `headMap(60)` is a window onto the original map; changes show through both ways.
- **Interview uses:** rank/grade lookups (floor), calendar booking (check floor and ceiling for overlaps), sliding-window maximum with counts, "stock price at time t".

**Common mistakes:** using a TreeMap when you never need order (HashMap is faster); keys that are not `Comparable` and no comparator (`ClassCastException` on the first `put`); a `null` key (`NullPointerException`).

**Interview answer:** "TreeMap is a red-black tree that keeps keys sorted by natural order or a Comparator. get, put and remove are O(log n). I use it when I need ordered iteration, the first or last key, the nearest key with floor, ceiling, lower and higher, or a range with subMap, headMap and tailMap. If I only need lookups, HashMap's O(1) is better."
- Follow-ups:
  - HashMap vs TreeMap? — O(1) unordered vs O(log n) sorted with navigation.
  - Why can't a TreeMap have a null key? — It must call `compareTo` on the key.
  - How does TreeMap decide two keys are equal? — `compare(a, b) == 0`; `equals` is never called.

### C7. Queue, Deque and PriorityQueue (`#c-queue`)

> **In 30 seconds** A **Queue** hands out items in a defined order: FIFO for `ArrayDeque`, smallest first for `PriorityQueue`. A **Deque** (double-ended queue) works at both ends, so it is also the right **stack** (`push`/`pop`). **ArrayDeque** is a circular array: O(1) at both ends. **PriorityQueue** is a **binary min-heap** in an array: `peek` O(1), `offer`/`poll` O(log n). Its `toString()` shows heap order, **not sorted order**.

**Analogy:** ArrayDeque is a **ticket counter** line (join at the back, served from the front) that can also take people at the front. PriorityQueue is a **hospital emergency room**: the most urgent patient is always seen next, whatever time they came in.

#### See it: the binary heap

Offer and poll on a real min-heap. The tree and the array are the same data: the children of index `i` are `2i + 1` and `2i + 2`. Watch the new value **sift up** and the moved last value **sift down**.

**Lab `#clHeap`:** Binary min-heap: offer sifts up, poll sifts down (PriorityQueue).

#### See it: the circular ArrayDeque

An ArrayDeque never shifts elements: `head` and `tail` indexes move around a ring and wrap at the end.

**Lab `#clDeque`:** ArrayDeque ring buffer: head/tail wrap, growth.

```java
// QueueDemo.java
import java.util.*;

public class QueueDemo {
    public static void main(String[] args) {
        // ArrayDeque as a stack (LIFO): use it instead of the old Stack class
        Deque<String> stack = new ArrayDeque<>();
        stack.push("a"); stack.push("b"); stack.push("c");
        System.out.println(stack.pop() + stack.peek());   // cb

        // ArrayDeque as a queue (FIFO)
        Deque<String> q = new ArrayDeque<>();
        q.offer("a"); q.offer("b"); q.offer("c");
        System.out.println(q.poll() + q.peek());          // ab

        // PriorityQueue: a binary min-heap; poll always returns the smallest
        PriorityQueue<Integer> pq = new PriorityQueue<>(List.of(5, 1, 8, 3, 2));
        System.out.println(pq);                           // [1, 2, 8, 3, 5]   heap order, NOT sorted
        StringBuilder out = new StringBuilder();
        while (!pq.isEmpty()) out.append(pq.poll()).append(' ');
        System.out.println(out.toString().trim());        // 1 2 3 5 8

        // max-heap: reverse the comparator
        PriorityQueue<Integer> max = new PriorityQueue<>(Comparator.reverseOrder());
        max.addAll(List.of(5, 1, 8, 3));
        System.out.println(max.peek());                   // 8

        // top 3 largest with a size-3 min-heap: O(n log k)
        PriorityQueue<Integer> top = new PriorityQueue<>();
        for (int x : new int[]{7, 2, 9, 4, 11, 5}) {
            top.offer(x);
            if (top.size() > 3) top.poll();               // drop the smallest of the kept ones
        }
        List<Integer> best = new ArrayList<>(top);
        Collections.sort(best);
        System.out.println(best);                         // [7, 9, 11]

        // offer/poll/peek return false/null; add/remove/element throw
        Queue<String> empty = new ArrayDeque<>();
        System.out.println(empty.poll());                 // null
        try { empty.remove(); } catch (NoSuchElementException e) { System.out.println("NoSuchElementException"); }
    }
}
```

|  | Throws an exception | Returns a special value |
|---|---|---|
| Insert | `add(e)` | `offer(e)` → `false` if full |
| Remove the head | `remove()` | `poll()` → `null` if empty |
| Look at the head | `element()` | `peek()` → `null` if empty |

- **Stack:** `Deque<T> st = new ArrayDeque<>()` with `push`, `pop`, `peek`. The old `Stack` class extends `Vector`: synchronised and lets you insert in the middle.
- **ArrayDeque refuses `null`**, because `poll()` uses `null` to mean "empty".
- **PriorityQueue from a collection** uses *heapify* (O(n)), so `new PriorityQueue<>(List.of(5, 1, 8, 3, 2))` gives `[1, 2, 8, 3, 5]`, while offering the same numbers one by one gives `[1, 2, 8, 5, 3]`. Both are valid heaps.
- **Top-k pattern:** keep a min-heap of size k; whenever it grows past k, poll the smallest. O(n log k) time, O(k) space.
- **Removing an arbitrary element** from a PriorityQueue is O(n) (it must be found first). Need that often? Use a `TreeMap`/`TreeSet`.

**Common mistakes:** printing or iterating a PriorityQueue and expecting sorted order (only `poll` gives order); using `Stack` or `LinkedList` where `ArrayDeque` is faster; a max-heap written as `(a, b) -> b - a` (overflows for large values; use `Comparator.reverseOrder()`).

**Interview answer:** "For FIFO queues and stacks I use ArrayDeque: a resizable circular array with O(1) operations at both ends and no synchronisation, better than Stack or LinkedList. PriorityQueue is a binary heap in an array: peek is O(1), offer and poll are O(log n) because the element sifts up or down one level at a time. It's the tool for top-k, merging k sorted lists, Dijkstra and scheduling. Its iterator is not in priority order."
- Follow-ups:
  - Children of index i in a heap? — `2i+1` and `2i+2`; parent `(i−1)/2`.
  - How do you make a max-heap? — `new PriorityQueue<>(Comparator.reverseOrder())`.
  - Is PriorityQueue thread-safe? — No; `PriorityBlockingQueue` is.

### C8. Comparable vs Comparator (`#c-compare`)

> **In 30 seconds** **Comparable** (`compareTo`) is the class's one **natural order**, written inside the class: String is alphabetical, Integer is numeric. **Comparator** (`compare`) is an **external** order you can have many of, built with `Comparator.comparing(...)`, `.thenComparing(...)` and `.reversed()`. Both return negative / zero / positive. Sorted collections treat **compare == 0 as "the same element"**.

**Analogy:** Comparable is the **roll number** printed on every student's ID card: one built-in order. A Comparator is a **teacher deciding how to line the class up today**: by height, by marks, then by name to break ties.

#### See it: build a comparator

Click sort keys to chain them. The code updates, the list re-sorts (stable, like `List.sort`), and ties are marked. The last row shows what a `TreeSet` with the same comparator keeps.

**Lab `#clCmp`:** Comparator builder: chain keys, stable sort, ties, what a TreeSet keeps.

```java
// CompareDemo.java
import java.util.*;

public class CompareDemo {

    // Comparable: the one "natural" order, written inside the class
    record Student(String name, int marks, int age) implements Comparable<Student> {
        @Override public int compareTo(Student o) {
            return name.compareTo(o.name);            // natural order: by name
        }
    }

    public static void main(String[] args) {
        List<Student> s = new ArrayList<>(List.of(
            new Student("Ravi", 82, 21),
            new Student("Anu", 91, 20),
            new Student("Kiran", 82, 19)));

        Collections.sort(s);                           // uses compareTo
        System.out.println(s.stream().map(Student::name).toList());   // [Anu, Kiran, Ravi]

        // Comparator: any number of orders, written outside the class
        s.sort(Comparator.comparingInt(Student::marks).reversed()
                         .thenComparing(Student::name));
        System.out.println(s.stream().map(Student::name).toList());   // [Anu, Kiran, Ravi]

        s.sort(Comparator.comparingInt(Student::age));
        System.out.println(s.stream().map(Student::name).toList());   // [Kiran, Anu, Ravi]

        // never subtract to compare: it overflows
        Comparator<Integer> bad = (a, b) -> a - b;
        System.out.println(bad.compare(Integer.MIN_VALUE, 1));        // 2147483647  (says MIN_VALUE > 1!)
        System.out.println(Integer.compare(Integer.MIN_VALUE, 1));    // -1

        // a TreeSet uses compare, not equals: compare == 0 means "duplicate"
        Set<Student> byMarks = new TreeSet<>(Comparator.comparingInt(Student::marks));
        byMarks.addAll(s);
        System.out.println(byMarks.size());                           // 2   (Ravi and Kiran both have 82)
    }
}
```

|  | Comparable<T> | Comparator<T> |
|---|---|---|
| Package | `java.lang` | `java.util` |
| Method | `int compareTo(T o)` | `int compare(T a, T b)` |
| Where | inside the class | outside: lambda, method reference, separate class |
| How many | one natural order | as many as you need |
| Used by | `Collections.sort(list)`, `TreeMap` with no comparator | `list.sort(c)`, `new TreeSet<>(c)`, `stream.sorted(c)` |

- **Consistent with equals:** ideally `compareTo == 0` exactly when `equals` is true. `BigDecimal` breaks this (`2.0` vs `2.00`), so a `HashSet` keeps both and a `TreeSet` keeps one.
- **Null-safe ordering:** `Comparator.nullsFirst(Comparator.naturalOrder())`.
- **Primitive keys:** `comparingInt`/`comparingLong`/`comparingDouble` avoid boxing.
- **Stability:** `List.sort` and `Collections.sort` are stable (TimSort, Lesson 06), so sorting by name and then by marks keeps names in order within equal marks.

**Common mistakes:** `return a - b;` (overflow); calling `.reversed()` at the end of a chain and reversing every key, not just the last one; a comparator that ignores a field, so a TreeSet silently drops "duplicates".

**Interview answer:** "Comparable defines a class's natural order through compareTo, implemented by the class itself, like String and Integer. Comparator is a separate strategy object, so a class can be sorted many ways, including classes I can't modify. Since Java 8 I build comparators with comparing, thenComparing and reversed. Both must be consistent: sign-correct, transitive, and ideally zero only when equals is true, because TreeSet and TreeMap use compare to decide duplicates."
- Follow-ups:
  - Why not `a - b`? — Integer overflow flips the sign for large values; use `Integer.compare`.
  - What does "Comparison method violates its general contract!" mean? — TimSort detected a non-transitive comparator.
  - How do you sort descending by marks, then ascending by name? — `comparingInt(Student::marks).reversed().thenComparing(Student::name)`.

### C9. Iterators and fail-fast: ConcurrentModificationException (`#c-iter`)

> **In 30 seconds** The for-each loop uses an **Iterator**. Every structural change to an ArrayList or HashMap bumps a counter, **`modCount`**. The iterator remembers the value it started with (`expectedModCount`) and, on each `next()`, throws **`ConcurrentModificationException`** if they differ. So **don't add or remove through the collection while looping over it**: use `iterator.remove()` or `removeIf`. "Fail-fast" is best effort, not a guarantee: one famous case doesn't throw at all.

**Analogy:** a **museum guide** counts the paintings before the tour. If someone quietly removes a painting while the group is walking, the guide notices the count is different at the next stop and stops the tour, rather than describing a wall that's no longer there.

#### See it

Step through `for (Integer n : list) if (cond) list.remove(n);` exactly as `ArrayList.Itr` runs it. Watch `cursor`, `size`, `modCount` and `expectedModCount`.

**Lab `#clFail`:** Fail-fast iterator: ArrayList.Itr step by step (CME, second-to-last trick, it.remove).

```java
// FailFast.java
import java.util.*;

public class FailFast {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4));

        // 1. removing inside for-each: the iterator notices modCount changed
        try {
            for (Integer n : nums) if (n == 1) nums.remove(n);
        } catch (ConcurrentModificationException e) {
            System.out.println("ConcurrentModificationException");
        }

        // 2. the surprise: removing the second-to-last element does NOT throw
        List<Integer> b = new ArrayList<>(List.of(1, 2, 3, 4));
        for (Integer n : b) if (n == 3) b.remove(n);   // size drops to 3, hasNext() sees cursor == size and stops
        System.out.println(b);                         // [1, 2, 4]   (4 was never visited)

        // 3. the right ways
        List<Integer> c = new ArrayList<>(List.of(1, 2, 3, 4));
        Iterator<Integer> it = c.iterator();
        while (it.hasNext()) if (it.next() % 2 == 0) it.remove();   // the iterator's own remove keeps counts in sync
        System.out.println(c);                         // [1, 3]

        List<Integer> d = new ArrayList<>(List.of(1, 2, 3, 4));
        d.removeIf(n -> n % 2 == 0);                   // Java 8+: the clearest way
        System.out.println(d);                         // [1, 3]

        // 4. maps too: modify while iterating keySet -> CME
        Map<String, Integer> m = new HashMap<>(Map.of("a", 1, "b", 2, "c", 3));
        m.entrySet().removeIf(e -> e.getValue() > 1);  // safe
        System.out.println(m);                         // {a=1}
    }
}
```

- **Despite the name, it's usually single-threaded:** the classic CME comes from one thread changing a list it is iterating.
- **Structural change** = add or remove (size changes). `list.set(i, x)` is not structural and doesn't bump `modCount`.
- **Fail-safe iterators** (`CopyOnWriteArrayList`, `ConcurrentHashMap`) never throw CME: they iterate a snapshot or tolerate concurrent change (weakly consistent).
- **Index loops:** removing with `for (int i…)` doesn't throw but skips the element after each removal; loop backwards if you must.

**Common mistakes:** catching CME instead of fixing the loop; assuming no exception means the code is right (the second-to-last case silently skips the last element); modifying a map's `keySet()` inside a loop over `entrySet()`.

**Interview answer:** "Collections like ArrayList and HashMap keep a modCount that increases on every structural change. Their iterators record it and check it on each next(); if another code path changed the collection, they throw ConcurrentModificationException. It's best-effort, to catch bugs early. To remove while iterating I use Iterator.remove, which updates the expected count, or removeIf. Concurrent collections have weakly consistent iterators that never throw it."
- Follow-ups:
  - Fail-fast vs fail-safe? — Fail-fast throws on concurrent modification; fail-safe (snapshot or weakly consistent) doesn't.
  - Why doesn't removing the second-to-last element throw? — After the removal, `cursor == size`, so `hasNext()` is false and `next()`, which does the check, is never called.
  - Can CME happen with one thread? — Yes, that's the usual case.

### C10. Immutable and unmodifiable collections (`#c-immut`)

> **In 30 seconds** **`List.of`, `Set.of`, `Map.of`** (Java 9+) create truly **immutable** collections: any change throws `UnsupportedOperationException`, and `null` is rejected. **`Collections.unmodifiableList(x)`** is only a **read-only view**: you can't change it, but whoever holds `x` can, and the view shows it. **`List.copyOf(x)`** takes a real immutable copy. **`Arrays.asList`** is fixed-size but writable, and writes go through to the array.

**Analogy:** an unmodifiable view is a **shop window**: you can't touch the goods, but the shopkeeper can rearrange them behind the glass. An immutable copy is a **photograph** of the window: it never changes.

#### See it

One base list and an array, plus four collections made from them. Press the buttons and watch which ones change and which ones throw.

**Lab `#clView`:** Views vs copies: unmodifiableList, List.copyOf, List.of, Arrays.asList.

```java
// Unmodifiable.java
import java.util.*;

public class Unmodifiable {
    public static void main(String[] args) {
        List<String> base = new ArrayList<>(List.of("a", "b"));

        List<String> view = Collections.unmodifiableList(base);   // a read-only VIEW of base
        List<String> copy = List.copyOf(base);                     // a real, immutable COPY
        List<String> of   = List.of("a", "b");                     // immutable from the start

        base.add("c");
        System.out.println(view);                  // [a, b, c]   the view sees the change
        System.out.println(copy);                  // [a, b]      the copy does not

        try { view.add("x"); } catch (UnsupportedOperationException e) { System.out.println("view: UnsupportedOperationException"); }
        try { of.set(0, "x"); } catch (UnsupportedOperationException e) { System.out.println("of: UnsupportedOperationException"); }
        try { List.of("a", null); } catch (NullPointerException e) { System.out.println("List.of: NullPointerException"); }

        // Arrays.asList: fixed size, but writes go through to the array
        String[] arr = {"x", "y"};
        List<String> fixed = Arrays.asList(arr);
        fixed.set(0, "z");
        System.out.println(arr[0]);                // z
        try { fixed.add("w"); } catch (UnsupportedOperationException e) { System.out.println("asList: UnsupportedOperationException"); }

        // Map.of and Set.of: immutable, no nulls, and Set.of rejects duplicates
        try { Set.of("a", "a"); } catch (IllegalArgumentException e) { System.out.println("Set.of: IllegalArgumentException"); }
        System.out.println(Map.of("k", 1).get("k"));   // 1
    }
}
```

|  | `List.of` / `copyOf` | `unmodifiableList` | `Arrays.asList` | `stream.toList()` |
|---|---|---|---|---|
| add / remove | throws | throws | throws | throws |
| set | throws | throws | works (writes the array) | throws |
| Sees later changes to the source | no | **yes** (a view) | yes (same array) | no |
| `null` elements | rejected | allowed | allowed | allowed |

- **Shallow:** an immutable list of mutable objects still lets you change the objects.
- **Defensive copies:** a class that stores or returns a list should use `List.copyOf` (Lesson 05: immutable classes and records).
- **`Map.of`** takes up to 10 pairs; use `Map.ofEntries(Map.entry(k, v), …)` for more. Its iteration order is deliberately unspecified.

**Common mistakes:** returning `Collections.unmodifiableList(field)` and assuming callers see a frozen list; `List.of(...).contains(null)` (throws NPE); `Arrays.asList(intArray)` (gives a `List<int[]>` of one element).

**Interview answer:** "Unmodifiable means the reference you hold can't change the collection, but it may be a view of one that can, like Collections.unmodifiableList. Immutable means nobody can change it: List.of, Set.of, Map.of and List.copyOf, which also reject nulls. I return immutable copies from APIs and store copies of incoming lists, so callers can't change my object's state behind my back."
- Follow-ups:
  - Does `List.copyOf` always copy? — Not if the argument is already an immutable list from `List.of`/`copyOf`; then it returns the same instance.
  - What does `Collectors.toList()` return? — An ArrayList in practice, but no mutability is promised; `stream.toList()` (Java 16) is unmodifiable.
  - Why do `List.of` collections reject null? — To catch bugs early and keep the implementations simple.

### C11. Thread-safe collections: ConcurrentHashMap and friends (`#c-conc`)

> **In 30 seconds** The everyday collections are **not thread-safe**: two threads doing `map.put(k, map.get(k) + 1)` lose updates. **`Collections.synchronizedMap`** (and the legacy `Hashtable`) put one lock around every call: safe, but one thread at a time. **`ConcurrentHashMap`** locks only the **bucket** being written (and uses CAS for empty buckets), reads without locking, and gives **atomic** `merge`, `compute` and `putIfAbsent`. **`CopyOnWriteArrayList`** copies the array on every write: great for read-mostly lists.

**Analogy:** `synchronizedMap` is a **library with one door**: one visitor inside at a time. `ConcurrentHashMap` is a library where **each shelf has its own small lock**: many people work at once unless they want the very same shelf.

#### See it: the lost update

Two threads each add 1 to the same key. Step through the interleaving with a plain HashMap, then with `synchronizedMap` and `ConcurrentHashMap.merge`, then run 1,000 random interleavings.

**Lab `#clRace`:** Lost update: HashMap vs synchronizedMap vs ConcurrentHashMap, plus 1,000 random interleavings.

```java
// ConcurrentDemo.java
import java.util.*;
import java.util.concurrent.*;

public class ConcurrentDemo {

    static int count(Map<String, Integer> map) throws InterruptedException {
        Runnable work = () -> {
            for (int i = 0; i < 100_000; i++) map.merge("hits", 1, Integer::sum);
        };
        Thread t1 = new Thread(work), t2 = new Thread(work);
        t1.start(); t2.start();
        t1.join(); t2.join();
        return map.get("hits");
    }

    public static void main(String[] args) throws InterruptedException {
        // with a plain HashMap the result is random and usually less than 200000 (lost updates)
        System.out.println(count(new ConcurrentHashMap<>()));                   // 200000
        System.out.println(count(Collections.synchronizedMap(new HashMap<>()))); // 200000

        // ConcurrentHashMap refuses null keys and values (null would be ambiguous: absent or null?)
        try {
            new ConcurrentHashMap<String, Integer>().put("k", null);
        } catch (NullPointerException e) {
            System.out.println("NullPointerException");
        }

        // CopyOnWriteArrayList: iterate while another write happens, no CME (the iterator reads a snapshot)
        List<Integer> cow = new CopyOnWriteArrayList<>(List.of(1, 2, 3));
        for (Integer n : cow) if (n == 1) cow.add(4);
        System.out.println(cow);                                                // [1, 2, 3, 4]
    }
}
```

| Need | Use | Why |
|---|---|---|
| Shared map, many threads | `ConcurrentHashMap` | per-bucket locking, lock-free reads, atomic compound operations |
| Read-mostly list (listeners, config) | `CopyOnWriteArrayList` | reads never lock; each write copies the array |
| Producer–consumer | `ArrayBlockingQueue`, `LinkedBlockingQueue` | `put` waits when full, `take` waits when empty |
| Sorted and concurrent | `ConcurrentSkipListMap` | a lock-free skip list, O(log n) |
| Wrap an existing collection quickly | `Collections.synchronizedList/Map` | one lock per call; you must still lock manually while iterating |

- **Atomic per call, not per sequence:** `if (!map.containsKey(k)) map.put(k, v)` is a race even on ConcurrentHashMap. Use `putIfAbsent`, `computeIfAbsent` or `merge`.
- **Java 7 vs 8:** Java 7's ConcurrentHashMap used 16 fixed *segments*; Java 8 locks the first node of each bucket (synchronized) and uses CAS to fill empty buckets, with the same treeify rules as HashMap.
- **`size()`** on a ConcurrentHashMap is an estimate while other threads are writing; prefer `mappingCount()` for large maps.

**Common mistakes:** sharing a HashMap between threads "because it's only reads" while one thread still writes; check-then-act sequences on a concurrent map; iterating a `synchronizedList` without `synchronized (list) { … }`.

**Interview answer:** "HashMap isn't thread-safe: concurrent puts can lose updates or corrupt the structure. Hashtable and synchronizedMap serialise every call on one lock. ConcurrentHashMap in Java 8 uses CAS for empty bins and synchronises on the bin head only when writing, so reads are lock-free and writes to different buckets run in parallel. It gives atomic merge, compute and putIfAbsent, rejects nulls, and its iterators are weakly consistent and never throw ConcurrentModificationException."
- Follow-ups:
  - Why no nulls in ConcurrentHashMap? — `get` returning `null` must mean "absent"; with concurrency you can't follow up with `containsKey` safely.
  - HashMap vs Hashtable? — Hashtable is legacy, fully synchronised, no nulls; HashMap is unsynchronised and allows one null key.
  - When is CopyOnWriteArrayList a bad idea? — Frequent writes or large lists: every write copies the whole array.

### C12. Collections: interview questions and review (`#c-review`)

| Class | get / contains | add | remove | Order | Nulls |
|---|---|---|---|---|---|
| `ArrayList` | O(1) index · O(n) search | O(1)* | O(n) | index | yes |
| `LinkedList` | O(n) | O(1) ends | O(1) ends | index | yes |
| `HashMap` / `HashSet` | O(1)† | O(1)† | O(1)† | none | one key |
| `LinkedHashMap` / `Set` | O(1)† | O(1)† | O(1)† | insertion / access | one key |
| `TreeMap` / `TreeSet` | O(log n) | O(log n) | O(log n) | sorted | no keys |
| `ArrayDeque` | O(1) ends | O(1)* | O(1) ends | FIFO / LIFO | no |
| `PriorityQueue` | O(1) peek | O(log n) | O(log n) poll | heap | no |
| `ConcurrentHashMap` | O(1)† | O(1)† | O(1)† | none | no |

* amortised (an occasional resize is O(n)). † average; a bucket's worst case is O(log n) once treeified.

**Q01. What are the main interfaces of the Collections Framework?** `Collection` (extends `Iterable`) with `List`, `Set` and `Queue`/`Deque`; plus `Map`, a separate hierarchy for key-value pairs. Sorted variants: `SortedSet`/`NavigableSet`, `SortedMap`/`NavigableMap`.

**Q02. ArrayList vs LinkedList?** ArrayList: array-backed, O(1) get, amortised O(1) append, O(n) middle insert/remove, compact and cache-friendly. LinkedList: doubly linked nodes, O(1) at the ends, O(n) to reach an index, ~4× the memory. ArrayList is the default; ArrayDeque beats LinkedList for queues.

**Q03. How does HashMap work internally?** An array of buckets (16). Index = `(h ^ h>>>16) & (n−1)`. Colliding entries form a chain; `equals` finds the key. Resize (double) when size > capacity × 0.75; entries split between i and i + oldCap. A bucket that gets a 9th node becomes a red-black tree if the table has ≥ 64 buckets (otherwise it resizes).

**Q04. What happens when two keys have the same hashCode?** They land in the same bucket (a collision). The map walks the chain (or tree) and uses `equals` to find the exact key. Results are correct; only speed suffers if many keys collide.

**Q05. Why must HashMap keys be immutable?** The bucket is chosen from the hashCode at insertion time. If a field used by hashCode changes, lookups go to a different bucket and the entry is lost (still counted in `size()`, never found).

**Q06. What is the load factor, and why 0.75?** The fill ratio that triggers a resize. 0.75 balances memory (not too many empty buckets) against collisions (chains stay short). Lower = faster lookups, more memory; higher = the opposite.

**Q07. How is HashSet implemented?** With a HashMap: each element is a key mapped to a shared dummy object (`PRESENT`). `add` returns `map.put(e, PRESENT) == null`.

**Q08. HashMap vs LinkedHashMap vs TreeMap?** HashMap: O(1), no order. LinkedHashMap: O(1), insertion or access order (LRU). TreeMap: O(log n), sorted, with floor/ceiling/range queries; no null keys.

**Q09. How do you implement an LRU cache?** Extend `LinkedHashMap` with `accessOrder = true` and override `removeEldestEntry` to return `size() > capacity`. By hand: a HashMap from key to node plus a doubly linked list; move to the front on access, evict the tail.

**Q10. Comparable vs Comparator?** Comparable: `compareTo`, inside the class, one natural order. Comparator: `compare`, external, many orders, built with `comparing`/`thenComparing`/`reversed`. Sorted collections treat compare == 0 as a duplicate.

**Q11. What is ConcurrentModificationException, and how do you avoid it?** Thrown by fail-fast iterators when the collection is structurally changed outside the iterator (`modCount` ≠ `expectedModCount`). Use `Iterator.remove`, `removeIf`, or a concurrent collection.

**Q12. Fail-fast vs fail-safe iterators?** Fail-fast (ArrayList, HashMap) throw CME on concurrent modification. Fail-safe / weakly consistent (CopyOnWriteArrayList iterates a snapshot; ConcurrentHashMap tolerates changes) never throw it.

**Q13. HashMap vs Hashtable vs ConcurrentHashMap?** HashMap: not synchronised, one null key. Hashtable: legacy, every method synchronised, no nulls. ConcurrentHashMap: thread-safe with bucket-level locking and CAS, lock-free reads, atomic `merge`/`compute`, no nulls.

**Q14. Unmodifiable vs immutable collections?** `Collections.unmodifiableList` is a read-only view: the backing list can still change and the view shows it. `List.of`/`List.copyOf` are immutable: nobody can change them, and they reject nulls.

**Q15. What is type erasure?** Generic type arguments are checked by the compiler and then removed; the bytecode uses the bound (usually `Object`) and inserted casts. So `List<String>` and `List<Integer>` share one class at run time, and you can't write `new T()` or `instanceof List<String>`.

**Q16. Explain PECS.** Producer Extends, Consumer Super. Read from a `List<? extends T>` (it produces Ts); write to a `List<? super T>` (it consumes Ts). Example: `Collections.copy(List<? super T> dest, List<? extends T> src)`.

**Q17. How does PriorityQueue work?** A binary min-heap stored in an array (children of i at 2i+1 and 2i+2). `offer` sifts up, `poll` moves the last element to the root and sifts down: O(log n). `peek` is O(1). Iteration and `toString` are in heap order, not sorted.

**Q18. Why prefer ArrayDeque over Stack?** `Stack` extends `Vector`: every call is synchronised, and it exposes list methods like `insertElementAt` that break the stack idea. `ArrayDeque` is unsynchronised, faster, and offers only deque operations.

#### 5 takeaways

**5 takeaways**

- Declare interfaces, create classes: `List`/`ArrayList`, `Set`/`HashSet`, `Map`/`HashMap`, `Deque`/`ArrayDeque`.
- HashMap: hashCode picks the bay, equals finds the car; resize at 0.75; trees after 8; keep keys immutable.
- Need order? LinkedHash* for insertion/access order, Tree* for sorted order and ranges.
- Comparator chains for sorting; compare == 0 means "duplicate" in sorted collections; never subtract.
- Never change a collection while looping over it (use removeIf); share between threads only via concurrent collections.

#### Check yourself

Answer before you look. Each answer locks and explains itself; your answers are saved in this browser.

**Quiz:** `QZ.l07` (12 questions, see Practice layer → "Lesson 07 quiz"); recall prompts `RC.l07`.

#### Implementation notes (Lesson 07 page)

- Labs live in the `course.js` block "Collections labs (v34)" (just before the OOP car story `let OLF=null;`), CSS block `/* collections labs v34 */` at the end of `course.css`. All lab classes are prefixed `cl-` because `.f .e .t .st .bad .cur` are global.
- `#clMap` follows `java.util.HashMap` exactly. Checked by reflection on JDK 25: with 16 keys built from "Aa"/"BB" (all hashCode -540425984), a new map resizes 16 → 32 on the 9th key, 32 → 64 on the 10th, and the bin becomes `TreeNode`s on the 11th; with `new HashMap<>(64)` the 9th key treeifies. 12 entries keep 16 buckets, the 13th makes 32. Removal untreeifies at ≤ 6 nodes in the lab (the JDK does it when the tree becomes very small).
- `#anPark` uses 8 bays (rebuild at the 7th car) for the picture; on resize it re-parks from the **stored** hash, like `HashMap` (a car whose plate changed stays lost).
- `#clPecs` holds the javac matrix generated by compiling every pair (5 parameter types × 6 statements, × 4 argument lists) on JDK 25.
- Command palette entries (`TOOLS`), Before you start (`START.l07`), 5 glossary terms (load factor, type erasure, fail-fast, red-black tree, binary heap).
- Headless test: 57 checks (HashMap numbers, ArrayList growth, LRU, TreeMap queries, heap order, deque growth, comparator order, fail-fast scenarios, views, race) all pass; all 10 pages load with no JS errors and no overflow at 520 px.

## Practice layer — quizzes, recall prompts, interview cards, takeaways

*Added 2026-10-18. On the page these render through the learning-layer JS: quizzes (`QZ`) at the end of each lesson, recall prompts (`RC`) in the Revise hub, interview cards (`.ia`) and takeaways (`.takeaways`) inside the sections named below. Every "what does this print" item was run on JDK 25. Lesson 00's cards and takeaways are already in its own text above.*

### Interview answer cards (Lessons 01–04)

**Section `#pool`.** The String pool is a JVM-wide table of unique String objects. Every String literal is resolved through it, so equal literals share one object, which saves memory and makes `==` true between them. Since Java 7 the pool lives in the main heap, so pooled Strings can be garbage-collected. `new String("x")` always creates a separate heap object, and `intern()` returns the pooled copy, adding one if needed.
- Follow-ups:
  - Why not intern everything? — The pool is a hash table that starts with 65536 buckets (`-XX:StringTableSize`) and grows as needed since JDK 11, lookups cost time, and most runtime Strings are short-lived; interning helps only when there are many duplicates that live long.
  - Is `"a" + "b"` pooled? — Yes, javac folds constant expressions into the literal `"ab"`. With a non-final variable, the result is a new heap String.
  - Where was the pool before Java 7? — In PermGen, which had a fixed size, so heavy interning could cause `OutOfMemoryError: PermGen space`.
  - Should you compare with `==` because of the pool? — No. Strings built at runtime (input, JSON, DB values) are not pooled; always use `equals`.

**Section `#immutable`.** A String's content can never change after it is created; every "modifying" method returns a new String. Java designed it that way so Strings can be shared safely in the pool, used as `HashMap` keys with a cached hash, passed between threads without locking, and trusted in security checks such as file paths, URLs and class names. The cost is extra objects when you modify text repeatedly, which is what StringBuilder is for.
- Follow-ups:
  - How is immutability enforced? — The class is `final`, the `value` array is `private final`, no method writes to it, and it is never handed out without copying.
  - Is `final String s` the same thing? — No. `final` fixes the variable's reference; immutability is a property of the object.
  - Why can the hash be cached? — The content can't change, so the hash can't either; it is computed once and stored in the `hash` field.
  - Why `char[]` for passwords? — You can overwrite a `char[]` after use; an immutable String stays in memory until it is collected.

**Section `#build`.** Use `+` for a few fixed pieces, and a `StringBuilder` when you build text in a loop: each `+=` copies the whole String so far, which is O(n²), while a builder appends into one growing buffer. `StringBuffer` is the same API with every method synchronized; it is a leftover from Java 1.0, and you rarely need it because builders are usually local to one thread. For joining collections, `String.join`, `StringJoiner` or `Collectors.joining` read better.
- Follow-ups:
  - Doesn't the compiler use a builder for `+` anyway? — For one expression, yes (or `invokedynamic` on Java 9+), but in a loop it creates a new one on every iteration.
  - Is StringBuffer fully thread-safe? — Each call is, but a sequence such as check-length-then-append is not atomic without your own lock.
  - How do you avoid regrowth? — Pass an expected capacity: `new StringBuilder(expectedSize)`.

**Section `#d-equals`.** `==` checks whether two references point to the same object. `String.equals` first checks identity, then that the other object is a String with the same coder and length, and finally compares the bytes. `hashCode` is `s[0]·31^(n−1) + … + s[n−1]`, cached after the first call. The contract is that equal objects must have equal hash codes, because a `HashMap` uses the hash to choose the bucket and `equals` to confirm the key.
- Follow-ups:
  - Can two different Strings have the same hash? — Yes: `"Aa"` and `"BB"` both hash to 2112. The map still keeps them apart with `equals`.
  - What breaks if you override only `equals` in your own class? — Two equal keys land in different buckets, so `get` misses and a `HashSet` keeps duplicates.
  - Why 31? — It is an odd prime, so it spreads values well, and `31 * h` can be computed as `(h << 5) - h`.
  - What does `compareTo` return? — The difference of the first differing chars, or the difference in length if one is a prefix of the other.

**Section `#d-builder`.** A StringBuilder holds a resizable `byte[]` plus a count of used positions. The default capacity is 16, or 16 plus the length of the initial String. When an append doesn't fit, it allocates a new array of `max(old*2 + 2, needed)` and copies the data, so appends are amortised O(1). StringBuffer shares the same parent class, `AbstractStringBuilder`, but synchronizes its methods. Neither overrides `equals`, so compare their contents with `toString()`, `compareTo` (Java 11+) or `contentEquals`.
- Follow-ups:
  - What is `length()` vs `capacity()`? — The chars stored vs the room allocated.
  - Does `setLength(0)` free memory? — No, it keeps the capacity; use `trimToSize()` to shrink it.
  - Why is a StringBuilder a bad `HashMap` key? — It is mutable and uses identity `equals`/`hashCode`.

**Section `#d-concat`.** If every operand is a compile-time constant, javac folds the expression into one literal, which is pooled. Otherwise the result is built at runtime: up to Java 8 javac emitted a `StringBuilder` append chain, and since Java 9 (JEP 280) it emits a single `invokedynamic` call to `StringConcatFactory`, which chooses an efficient strategy at runtime. Either way, a runtime result is a new heap String, not a pooled one, and a loop still needs an explicit StringBuilder.
- Follow-ups:
  - Does `final` change the result? — Yes. A `final` local initialised with a constant is itself a constant, so `a + "b"` is folded.
  - What does `null + "x"` give? — `"nullx"`; concatenation turns null into the text "null".
  - Why move to `invokedynamic`? — The JDK can improve the strategy without recompiling your classes, and it avoids building and sizing a StringBuilder each time.

**Section `#s-window`.** A sliding window keeps two indexes, `left` and `right`, around a contiguous part of the input. You extend `right` one step at a time and update a small summary of the window, such as counts or a sum. When the window breaks the rule, you move `left` forward until it is valid again. Each index only moves forward, so the whole scan is O(n) instead of checking all O(n²) substrings.
- Follow-ups:
  - How do you spot it? — "Longest", "shortest" or "all" contiguous substrings or subarrays that satisfy a condition.
  - Fixed vs variable window? — A fixed window (size k, e.g. anagrams of p) moves both ends together; a variable one grows and shrinks.
  - Why `left = Math.max(left, last[c] + 1)`? — The last copy of c can be outside the window; without `max` the left edge moves backwards (wrong on `"abba"`).
  - When doesn't it work? — When adding an element can make an invalid window valid again, such as sums with negative numbers; use prefix sums with a map instead.

**Section `#s-palin`.** To check a palindrome, I put one pointer at each end and move them inward while the chars match: O(n) time and O(1) space, with no reversed copy. If the input has spaces or punctuation, I skip non-alphanumeric chars and compare in lower case. For "palindrome after deleting at most one char", on the first mismatch I try skipping the left char or the right char and check the rest. For the longest palindromic substring, I expand around each of the 2n − 1 centres: O(n²) time, O(1) space.
- Follow-ups:
  - Why 2n − 1 centres? — Odd-length palindromes centre on a char (n), even-length ones on a gap between chars (n − 1).
  - Is there an O(n) algorithm? — Yes, Manacher's, but expand-around-centre is the expected interview answer.
  - Why not `s.equals(new StringBuilder(s).reverse().toString())`? — It is correct, but it uses O(n) extra memory and can't skip punctuation.

**Section `#s-freq`.** For frequency problems I count once and then answer from the counts. If the input is lowercase letters, an `int[26]` indexed by `c - 'a'` is fastest; for ASCII, an `int[128]`; for any Unicode text, a `HashMap` with `merge(c, 1, Integer::sum)`. Two Strings are anagrams if their counts match: O(n), versus O(n log n) for sorting. To group anagrams, I build a key from the sorted chars or the count array and use `computeIfAbsent` to collect each group.
- Follow-ups:
  - First non-repeating char? — Count in one pass, then scan the String again and return the first char with count 1.
  - Why can the array be faster than a HashMap? — No boxing, no hashing, and it fits in cache; the space is O(1) because 26 is fixed.
  - Do you need two arrays for an anagram check? — No: increment for one String, decrement for the other, and check that everything is 0.

**Section `#a-sort`.** `Arrays.sort` uses dual-pivot quicksort for primitive arrays and TimSort for object arrays; both are O(n log n). TimSort is stable, so equal elements keep their order, which matters when you sort records by one field after another. Stability can't be observed for primitives, so a faster non-stable sort is fine there. `Arrays.binarySearch` needs a sorted array; if the key is missing it returns `-(insertionPoint) - 1`.
- Follow-ups:
  - What happens if you binary-search an unsorted array? — The result is undefined; you may get a wrong index or "not found".
  - How do you sort descending? — For objects, `Comparator.reverseOrder()`; for an `int[]`, sort ascending and reverse, or box to `Integer[]`.
  - When is TimSort O(n)? — When the input is already sorted (or made of a few sorted runs).
  - What is `parallelSort`? — It splits large arrays across the common ForkJoinPool; it only pays off for large inputs.

**Section `#a-methods`.** Java is always pass-by-value. For an array, the value that is copied is the reference, so the method and the caller point to the same array. Writing an element, `a[0] = 5`, is visible to the caller. Reassigning the parameter, `a = new int[3]`, only changes the method's local copy. Varargs (`int... xs`) is just an array parameter that the compiler fills for you.
- Follow-ups:
  - How do you write a swap for two ints? — You can't through parameters; swap two elements of an array instead.
  - How do you protect your array from a caller? — Return or store a defensive copy (`arr.clone()`) or an unmodifiable list.
  - What does a varargs method get if called with no arguments? — An empty array, not null.

**Section `#a-convert`.** `Arrays.asList(arr)` returns a fixed-size list backed by the array: `set` writes through, but `add` and `remove` throw `UnsupportedOperationException`. For an independent, growable list, wrap it: `new ArrayList<>(Arrays.asList(arr))`. `List.of(...)` is fully unmodifiable and rejects nulls. Primitive arrays need streams, such as `Arrays.stream(ints).boxed().toList()`, because `Arrays.asList(int[])` makes a one-element `List<int[]>`.
- Follow-ups:
  - List to array? — `list.toArray(new String[0])`, or `list.toArray(String[]::new)` on Java 11+.
  - Array vs ArrayList in a service? — ArrayList for most code; arrays for fixed sizes, primitives in hot loops, and byte buffers.
  - Why does `Arrays.asList(1, 2).add(3)` compile? — The return type is `List`; the restriction is only enforced at runtime.

### 5 takeaways per lesson

**End of `#practice`:**
1. A String is an immutable object: every "change" returns a new String, so reassign the result.
2. Compare content with `equals` (null-safe as `"lit".equals(x)`); `==` only tells you if it is the same object.
3. Literals are pooled and shared; `new String` always makes a new heap object; `intern()` returns the pooled one.
4. Build text in loops with a `StringBuilder`; `+=` copies everything each time.
5. `split` and `replaceAll` take regex, `substring`'s end is excluded, and an emoji is 2 chars.

**End of `#d-map`:**
1. Since Java 7 the pool is in the heap; literals are pooled lazily when their `ldc` first runs, and `intern()` stores a reference, not a copy.
2. A String is a `byte[]` plus a `coder` (LATIN1 or UTF16) and a cached hash; `final` on a variable is not the same as an immutable object.
3. `new String("x")` creates up to 2 String objects but shares one `byte[]`.
4. Equal objects need equal hash codes; equal hashes don't mean equal objects (`"Aa"`/`"BB"`).
5. Constant expressions are folded at compile time; everything else is concatenated at runtime (StringBuilder up to Java 8, `invokedynamic` since Java 9) and is not pooled.

**End of `#s-practice`:**
1. Name the pattern before you code: counting, two pointers, sliding window, stack, canonical key, expand around centre, or building with a StringBuilder.
2. `int[26]` with `c - 'a'` gives O(n) counting; use a `HashMap` only when the alphabet is large or unknown.
3. Sliding window is O(n) because both edges only move forward; never let `left` move back.
4. Use an `ArrayDeque` as the stack for brackets and nested parsing, and check that it is empty at the end.
5. Test the edge cases every time: empty String, one char, all the same chars, spaces, and surrogate pairs.

**End of `#a-practice`:**
1. An array is a fixed-size object with contiguous elements, a `length` field, and default values; index access is O(1).
2. Assignment aliases, `clone()`/`copyOf` copy one level, and a 2D deep copy must clone each row.
3. Arrays don't override `equals`/`toString`: use `Arrays.equals`, `Arrays.toString` and the `deep…` versions.
4. Java passes the reference by value: element writes are visible to the caller, reassigning the parameter is not.
5. `Arrays.asList` is a fixed-size view, primitives sort with quicksort and objects with stable TimSort, and arrays are covariant (ArrayStoreException).

### Lesson 00 quiz (12 questions)

1. *(Beginner)* What does this print?
```java
System.out.println(7 / 2);
```
   - A) 3.5
   - B) 3
   - C) 4
   - D) 3.0
   - **Answer: B.** Both operands are `int`, so this is integer division and the fraction is dropped: **3**. You get 3.5 only if one side is a double, e.g. `7 / 2.0`. 3.0 would need the result to be a double.

2. *(Beginner)* Which tool turns `Hello.java` into `Hello.class`?
   - A) `java`
   - B) The JIT compiler
   - C) `javac`
   - D) The class loader
   - **Answer: C.** `javac` compiles source to bytecode ahead of time. `java` starts the JVM; the class loader loads existing `.class` files; the JIT compiles *bytecode* to native code at run time, it never sees `.java`.

3. *(Beginner)* What does this print?
```java
System.out.println(1 + 2 + "3" + 4 + 5);
```
   - A) 15
   - B) 3345
   - C) 12345
   - D) 339
   - **Answer: B.** `+` is evaluated left to right. `1 + 2` is int addition (3); then `3 + "3"` becomes the String "33", and every later `+` is concatenation: "3345".

4. *(Beginner)* A method declares `int count;` and then prints `count` without assigning it. What happens?
   - A) It prints 0
   - B) It prints a random value
   - C) Compile error: variable might not have been initialized
   - D) NullPointerException at run time
   - **Answer: C.** Local variables have **no default value**; the compiler enforces definite assignment. Only fields and array elements get defaults like 0, so "prints 0" is the tempting wrong answer.

5. *(Intermediate)* What does this print?
```java
Integer a = 127, b = 127, c = 128, d = 128;
System.out.println((a == b) + " " + (c == d));
```
   - A) true true
   - B) false false
   - C) true false
   - D) false true
   - **Answer: C.** Autoboxing calls `Integer.valueOf`, which returns cached objects for −128..127. `a` and `b` share one object (true); 128 is outside the cache, so `c` and `d` are different objects (false). Use `equals` for values.

6. *(Intermediate)* What does this print?
```java
byte b = 127;
b += 1;
System.out.println(b);
```
   - A) 128
   - B) Compile error
   - C) -128
   - D) ArithmeticException
   - **Answer: C.** `b += 1` means `b = (byte) (b + 1)`. 128 doesn't fit in a byte, and the narrowing cast keeps the low 8 bits, which is −128. It compiles because of the hidden cast (`b = b + 1` would not), and integer overflow never throws.

7. *(Intermediate)* What does this print?
```java
System.out.println(-7 % 3 + " " + Math.floorMod(-7, 3));
```
   - A) 2 2
   - B) -1 2
   - C) -1 -1
   - D) 1 2
   - **Answer: B.** `%` takes the sign of the **left** operand: −7 = 3 × (−2) + (−1), so −1. `Math.floorMod` rounds the quotient down instead, giving a result with the divisor's sign: 2.

8. *(Intermediate)* Given `static void f(long x)` and `static void f(Integer x)`, which one does `f(5)` call?
   - A) `f(long)`
   - B) `f(Integer)`
   - C) Compile error: ambiguous
   - D) It depends on the JVM
   - **Answer: A.** Overload resolution tries widening *before* boxing. `int → long` is widening (phase 1), while `int → Integer` needs boxing (phase 2), so `f(long)` wins and the call is not ambiguous.

9. *(Intermediate)* What does this print?
```java
static void m(StringBuilder sb) {
    sb.append("b");
    sb = new StringBuilder("z");
    sb.append("c");
}
// in main:
StringBuilder s = new StringBuilder("a");
m(s);
System.out.println(s);
```
   - A) a
   - B) abc
   - C) zc
   - D) ab
   - **Answer: D.** The parameter is a copy of the reference. `append("b")` changes the shared object ("ab"). Reassigning `sb` only moves the copy, so `"zc"` is built on a new object the caller never sees. Java is pass-by-value.

10. *(Advanced)* What does this print?
```java
int k = 1;
k = k++ + ++k;
System.out.println(k);
```
   - A) 3
   - B) 4
   - C) 5
   - D) 2
   - **Answer: B.** Left to right: `k++` yields 1 and sets k to 2; `++k` sets k to 3 and yields 3. The sum 1 + 3 = **4** is then assigned to k, overwriting the 3.

11. *(Advanced)* What does this print?
```java
int x = 2;
switch (x) {
    case 1: System.out.print("A");
    case 2: System.out.print("B");
    case 3: System.out.print("C"); break;
    default: System.out.print("D");
}
```
   - A) B
   - B) BC
   - C) BCD
   - D) ABC
   - **Answer: B.** Execution jumps to `case 2`, prints B, then **falls through** into case 3 (no break) and prints C, and the `break` stops it before `default`. The arrow form `case 2 ->` would print only B.

12. *(Advanced)* Which statement about how HotSpot runs your code is correct?
   - A) `javac` produces native machine code, so the JVM only loads it
   - B) The JIT compiles every method before `main` starts
   - C) Bytecode is interpreted at first, and frequently run methods are compiled to native code at run time
   - D) Bytecode is tied to the OS it was compiled on
   - **Answer: C.** HotSpot starts by interpreting bytecode and profiles it; hot methods are JIT-compiled (C1, then C2). `javac` emits portable bytecode, not machine code, and nothing is compiled up front before `main` (that would be ahead-of-time compilation, a separate tool).

**Recall prompts.**
- Day 1:
  - What do the JDK, JRE and JVM each contain? — JVM runs bytecode; JRE = JVM + standard library; JDK = JRE + tools (`javac`, `javap`, `jshell`).
  - Which values does the Integer cache cover, and why does it matter? — −128..127 via `Integer.valueOf`; `==` between wrappers only works by accident inside that range, so use `equals`.
  - Is Java pass-by-value or pass-by-reference? — Always by value. For objects the value is a reference: mutation is visible, reassignment is not.
- Day 3:
  - Why does `b += 1` compile for a byte but `b = b + 1` not? — Arithmetic promotes to int; compound assignment includes a hidden narrowing cast.
  - Name the three phases of overload resolution. — 1. exact or widening (no boxing), 2. boxing/unboxing, 3. varargs. First phase with a match wins; most specific inside it.
  - What happens on `Integer.MAX_VALUE + 1`, and how do you guard against it? — It wraps to `Integer.MIN_VALUE` silently. Use `long`, or `Math.addExact` to throw on overflow.
- Day 7:
  - Draw the path from `Hello.java` to running native code. — javac → `Hello.class` (bytecode) → class loader → verifier → interpreter → JIT for hot methods; heap, stacks, Metaspace at run time.
  - Switch statement vs switch expression: four differences. — Arrow form: no fall-through, comma labels, returns a value (`yield` in blocks), must be exhaustive. Java 21 adds type patterns and `case null`.
  - What happens on the stack during `factorial(3)`, and when do you get StackOverflowError? — Each call pushes a frame with its own n until the base case; returns pop frames. With no reachable base case the thread's stack fills up.

### Lesson 01 quiz (10 questions)

1. *(Beginner)* Which statement about `String` is true?
   - A) It is a primitive type, like `char`
   - B) It is an object of the `final` class `java.lang.String`, and its value can't change
   - C) It is a mutable object; methods such as `toUpperCase()` change it in place
   - D) It must be imported with `import java.lang.String;`
   - **Answer: B.** A String is an object, its class is `final`, and it is immutable. `java.lang` is imported automatically. Methods such as `toUpperCase()` return a **new** String; they never change the original.

2. *(Beginner)* What does this print?
```java
String s = "java";
s.toUpperCase();
System.out.println(s);
```
   - A) `JAVA`
   - B) `Java`
   - C) It doesn't compile
   - D) `java`
   - **Answer: D.** `toUpperCase()` returns a new String, and the result is thrown away. `s` still points to `"java"`. Write `s = s.toUpperCase();` to keep it.

3. *(Beginner)* What does `"Hello".substring(1, 3)` return?
   - A) `"Hel"`
   - B) `"ell"`
   - C) `"el"`
   - D) `"llo"`
   - **Answer: C.** The range is half-open: the start index 1 is included and the end index 3 is excluded, so you get the chars at 1 and 2: `"el"`. The length of the result is `end - start` = 2.

4. *(Intermediate)* What does this print?
```java
String a = "hi", b = "h" + "i", c = new String("hi");
String h = "h";
String d = h + "i";
System.out.println((a == b) + " " + (a == c) + " " + (a == d) + " " + (a == d.intern()));
```
   - A) `true false false true`
   - B) `true false true true`
   - C) `false false false true`
   - D) `true true false false`
   - **Answer: A.** `"h" + "i"` is folded by javac into the literal `"hi"`, so it is the pooled object. `new` always makes a heap object. `h + "i"` uses a variable that is not `final`, so it is built at runtime as a new heap String. `intern()` returns the pooled `"hi"`, which is `a`.

5. *(Intermediate)* What does `System.out.println(1 + 2 + "3" + 4 + 5);` print?
   - A) `15`
   - B) `12345`
   - C) `339`
   - D) `3345`
   - **Answer: D.** `+` runs left to right. `1 + 2` is int addition (3). Once a String appears, every later `+` is concatenation: `"33"`, `"334"`, `"3345"`. Write `"3" + (4 + 5)` if you want 9.

6. *(Intermediate)* A request handler checks a header that may be missing (`null`). Which check never throws?
   - A) `role.equals("admin")`
   - B) `role == "admin"`
   - C) `"admin".equals(role)`
   - D) `role.equalsIgnoreCase("admin")`
   - **Answer: C.** Calling a method on the literal is null-safe: `"admin".equals(null)` is simply `false`. Options 1 and 4 throw `NullPointerException` when `role` is null. `==` doesn't throw, but it compares references, so a header value read at runtime would not match. `Objects.equals(role, "admin")` is also safe.

7. *(Intermediate)* What is `"a,b,,c,,".split(",").length`?
   - A) `6`
   - B) `4`
   - C) `3`
   - D) `5`
   - **Answer: B.** The pieces are `"a"`, `"b"`, `""`, `"c"`, `""`, `""`. `split` drops only the **trailing** empty strings, so the empty string in the middle stays: 4. Use `split(",", -1)` to keep all 6.

8. *(Advanced)* What does this print?
```java
String e = "😀";
System.out.println(e.length() + " " + e.codePointCount(0, e.length()));
```
   - A) `1 1`
   - B) `2 2`
   - C) `2 1`
   - D) `4 1`
   - **Answer: C.** The emoji is outside the Basic Multilingual Plane, so UTF-16 stores it as a surrogate pair: 2 `char`s, but 1 code point. (4 is its size in UTF-8 bytes, not in chars.)

9. *(Advanced)* What do these two lines print?
```java
System.out.println("" + 'a' + 'b');
System.out.println('a' + 'b' + "");
```
   - A) `ab` then `ab`
   - B) `ab` then `195`
   - C) `195` then `ab`
   - D) `195` then `195`
   - **Answer: B.** Left to right again. In line 1 the String comes first, so each char is appended. In line 2, `'a' + 'b'` is char + char, which is int addition: 97 + 98 = 195. Only then is it turned into a String.

10. *(Advanced)* A version string is masked like this. What is printed?
```java
System.out.println("1.2.3".replaceAll(".", "-"));
```
   - A) `1-2-3`
   - B) `-----`
   - C) `1.2.3`
   - D) It throws `PatternSyntaxException`
   - **Answer: B.** `replaceAll` takes a **regex**, and `.` means "any character", so all 5 chars are replaced. Use `replace(".", "-")` (literal) or the regex `"\\."` to get `1-2-3`.

**Recall prompts.**
- Day 1:
  - What is a String in Java? — An immutable object of the `final` class `java.lang.String`, a sequence of UTF-16 chars.
  - What does `==` compare for Strings, and what does `equals` compare? — `==` compares references (same object?); `equals` compares the characters.
  - Where do literals go, and where does `new String("x")` go? — Literals go to the String pool; `new` always creates a new heap object.
- Day 3:
  - Why does `s.trim();` on its own do nothing? — String methods return a new String; you must reassign: `s = s.trim();`.
  - Why is `+=` in a loop slow? — Each step copies the whole String so far: O(n²) total. A StringBuilder appends into one growing buffer: O(n).
  - Why does `"1.2".split(".")` return an empty array? — `split` takes a regex; `.` matches every char, every piece is empty, and trailing empties are dropped. Use `"\\."`.
- Day 7:
  - Explain to an interviewer why String is immutable. — Safe sharing in the pool, a hash that can be cached (safe map keys), thread safety without locks, and security (paths, class names, URLs can't change after checks).
  - How would you safely compare a user-supplied value with a constant? — `"CONST".equals(value)` or `Objects.equals(value, "CONST")`: null-safe and content-based.
  - A log line for each of 1 million records is built with `+` in a loop. What do you change and why? — Use one StringBuilder (or `String.join`/`StringJoiner`) to avoid O(n²) copying and garbage; consider pre-sizing its capacity.

### Lesson 02 quiz (10 questions)

1. *(Beginner)* On a current JDK (13 or later), which fields hold a String's data?
   - A) A `char[] value` and an `int count`
   - B) A `byte[] value`, a `byte coder`, a cached `int hash` and a `boolean hashIsZero`
   - C) A pointer into the String pool and a length
   - D) A `StringBuilder` that is frozen after construction
   - **Answer: B.** Compact Strings (Java 9) replaced `char[]` with `byte[]` plus a `coder` (LATIN1 = 1 byte per char, UTF16 = 2). `hash` caches `hashCode()`, and `hashIsZero` (added in Java 13) remembers that a computed hash really was 0.

2. *(Beginner)* What does this print?
```java
StringBuilder x = new StringBuilder("ab"), y = new StringBuilder("ab");
System.out.println(x.equals(y) + " " + x.toString().equals(y.toString()) + " " + (x.compareTo(y) == 0));
```
   - A) `true true true`
   - B) `false true true`
   - C) `false true false`
   - D) `false false true`
   - **Answer: B.** StringBuilder does not override `equals`, so it inherits `Object.equals` (identity): false. Comparing the Strings works. Since Java 11 StringBuilder implements `Comparable`, so `compareTo` compares content: 0.

3. *(Beginner)* Does this compile, and what does it print?
```java
final StringBuilder sb = new StringBuilder("a");
sb.append("b");
System.out.println(sb);
```
   - A) It doesn't compile: `sb` is final
   - B) It prints `a`
   - C) It prints `ab`
   - D) It throws `UnsupportedOperationException`
   - **Answer: C.** `final` fixes the **reference**, not the object. You can't write `sb = new StringBuilder()`, but you can still change the object it points to. Final is not the same as immutable.

4. *(Intermediate)* What does this print?
```java
StringBuilder sb = new StringBuilder();
sb.append("abcdefghijklmnopq");   // 17 chars
System.out.println(sb.length() + " " + sb.capacity());
```
   - A) `17 17`
   - B) `17 32`
   - C) `16 34`
   - D) `17 34`
   - **Answer: D.** The default capacity is 16. 17 chars don't fit, so it grows to `max(old*2 + 2, needed)` = `max(34, 17)` = 34. `length()` is the number of chars actually stored.

5. *(Intermediate)* What does this print?
```java
String s = null;
s += "x";
System.out.println(s);
```
   - A) `x`
   - B) `nullx`
   - C) It throws `NullPointerException`
   - D) It doesn't compile
   - **Answer: B.** String concatenation turns a null reference into the text `"null"`, so `s` becomes `"nullx"`. No method is called on `s`, so there is no NPE. (`s.concat("x")` would throw.)

6. *(Intermediate)* `"hi"` is not in the pool yet. How many String objects does `String s = new String("hi");` create?
   - A) 1
   - B) 2
   - C) 3
   - D) 0, because the JVM reuses one from the pool
   - **Answer: B.** Two: the literal `"hi"` is put in the pool when the `ldc` instruction first runs, and `new` creates a second String object on the heap. The copy shares the pooled object's `byte[]`, so the characters are not copied.

7. *(Intermediate)* What does this print?
```java
final String a = "he";
String b = "he";
String p = a + "llo", q = b + "llo";
System.out.println((p == "hello") + " " + (q == "hello"));
```
   - A) `true true`
   - B) `false false`
   - C) `true false`
   - D) `false true`
   - **Answer: C.** `a` is a `final` variable initialised with a constant, so `a + "llo"` is a compile-time constant that javac folds into the pooled literal. `b` is not final, so `b + "llo"` is built at runtime as a new heap object.

8. *(Advanced)* What does this print?
```java
Map<String, Integer> m = new HashMap<>();
m.put("Aa", 1);
m.put("BB", 2);
System.out.println(("Aa".hashCode() == "BB".hashCode()) + " " + m.size() + " " + m.get("BB"));
```
   - A) `false 2 2`
   - B) `true 1 2`
   - C) `true 2 2`
   - D) `true 2 1`
   - **Answer: C.** "Aa" and "BB" collide: 65*31 + 97 = 66*31 + 66 = 2112. Same bucket, but the map then calls `equals`, which is false, so both entries are kept and `get` finds the right one. Equal hashes never mean equal keys.

9. *(Advanced)* On Java 7+, what does this print?
```java
String t = new StringBuilder("ja").append("vaX1").toString();
System.out.println(t.intern() == t);
```
   - A) `true`
   - B) `false`
   - C) It depends on the pool size
   - D) It throws `IllegalStateException`
   - **Answer: A.** "javaX1" is not in the pool yet. Since Java 7, `intern()` records a **reference** to the existing heap object instead of copying it, so it returns `t` itself. On Java 6 it copied the String into PermGen, and the result was false.

10. *(Advanced)* A cache uses request paths as `HashMap` keys. Why is `String` a safe key while a `StringBuilder` key is not?
   - A) StringBuilder is slower to hash
   - B) String is immutable, so its `hashCode` can never change after it is stored; StringBuilder also uses identity `equals`/`hashCode`
   - C) HashMap only accepts `final` classes as keys
   - D) StringBuilder can't be null
   - **Answer: B.** A key's hash must stay the same while it is in the map, or it lands in the "wrong" bucket and can't be found again. String's content can't change, and its hash is cached. StringBuilder doesn't override `equals`/`hashCode`, so a new builder with the same text would not find the entry anyway.

**Recall prompts.**
- Day 1:
  - Where has the String pool lived since Java 7? — In the main heap (it was in PermGen in Java 6).
  - What is StringBuilder's default capacity and growth rule? — 16; it grows to `max(old*2 + 2, needed)`.
  - Which fields make up a JDK 13+ String? — `byte[] value`, `byte coder`, `int hash`, `boolean hashIsZero`.
- Day 3:
  - Why is `"a" + "b" == "ab"` true, but `x + "b" == "ab"` false (x not final)? — javac folds constant expressions into one pooled literal; a non-constant operand means the result is built at runtime as a new object.
  - Why does StringBuilder's `equals` return false for the same text? — It doesn't override `Object.equals`, so it compares identity. Compare `toString()`, use `compareTo` (Java 11+) or `contentEquals`.
  - What changed in `intern()` in Java 7? — It stores a reference to the existing heap String instead of copying it into PermGen, so `s.intern() == s` can be true.
- Day 7:
  - Walk an interviewer through what `new String("hi")` does. — `ldc` resolves the literal (pooling it on first use), `new` allocates a String on the heap, the constructor shares the pooled `byte[]`: 2 String objects, 1 byte array.
  - Explain the equals/hashCode contract with a HashMap lookup. — hashCode picks the bucket, equals confirms the key. Equal objects must have equal hashes; equal hashes (e.g. "Aa"/"BB") don't imply equality.
  - How does `+` compile in Java 8 versus Java 9+? — Java 8: a `new StringBuilder().append(...).toString()` chain. Java 9+: one `invokedynamic` to `StringConcatFactory`, which picks the strategy at runtime.

### Lesson 03 quiz (10 questions)

1. *(Beginner)* "Find the longest substring without repeating characters." Which pattern fits best?
   - A) Sorting
   - B) Sliding window
   - C) Stack
   - D) Two pointers from both ends
   - **Answer: B.** "Longest/shortest contiguous substring that satisfies a condition" is the sliding-window signal. Grow the right edge, shrink the left edge when the condition breaks: O(n).

2. *(Beginner)* What does this print?
```java
int[] f = new int[26];
for (char c : "banana".toCharArray()) f[c - 'a']++;
System.out.println(f[0] + " " + f['n' - 'a'] + " " + f[1]);
```
   - A) `1 2 3`
   - B) `3 2 0`
   - C) `0 13 1`
   - D) `3 2 1`
   - **Answer: D.** `c - 'a'` maps 'a'→0, 'b'→1, 'n'→13. "banana" has three a's, two n's and one b. This int[26] count is the O(n) answer for anagram and frequency problems on lowercase letters.

3. *(Beginner)* What are the time and extra space of the two-pointer palindrome check?
   - A) O(n) time, O(n) space
   - B) O(n²) time, O(1) space
   - C) O(n) time, O(1) space
   - D) O(n log n) time, O(1) space
   - **Answer: C.** One pointer from each end, moving inward, compares each pair once: n/2 comparisons, and only two int variables. Building a reversed copy also takes O(n) time, but O(n) extra space.

4. *(Intermediate)* What does this print?
```java
String s = "  the sky  is blue ";
String[] w = s.trim().split("\\s+");
Collections.reverse(Arrays.asList(w));
System.out.println(String.join(" ", w) + "|");
```
   - A) `eulb si yks eht|`
   - B) `blue is  sky the |`
   - C) `blue is sky the|`
   - D) ` blue is sky the|`
   - **Answer: C.** `trim()` removes the outer spaces, and `\s+` treats each run of spaces as one separator, so there are no empty words. `Arrays.asList` is a view of the array, so reversing the list reverses `w`. `join` puts single spaces back.

5. *(Intermediate)* What does this print?
```java
Matcher m = Pattern.compile("(\\w+)@(\\w+)\\.com").matcher("mail bob@site.com now");
if (m.find()) System.out.println(m.group(2) + " " + m.group(0));
```
   - A) `site bob@site.com`
   - B) `bob site`
   - C) `site mail bob@site.com now`
   - D) Nothing: `find()` needs the whole String to match
   - **Answer: A.** Groups are numbered by their opening bracket: group 1 is "bob", group 2 is "site". Group 0 is the whole match, not the whole input. `find()` searches for a match anywhere; `matches()` is the one that needs the whole String.

6. *(Intermediate)* An API receives dates as `yyyy-mm-dd`. What does this return?
```java
"2024-01-15".replaceAll("(\\d+)-(\\d+)-(\\d+)", "$3/$2/$1")
```
   - A) `2024/01/15`
   - B) `$3/$2/$1`
   - C) `15/01/2024`
   - D) `15-01-2024`
   - **Answer: C.** In the replacement, `$n` inserts what group n matched: 15, then 01, then 2024. To insert a literal `$`, escape it or use `Matcher.quoteReplacement`.

7. *(Intermediate)* A query-string parser splits each `key=value` pair. For the pair `"b="` (empty value), what are `"b=".split("=").length` and `"b=".split("=", 2).length`?
   - A) `2` and `2`
   - B) `1` and `2`
   - C) `1` and `1`
   - D) `2` and `1`
   - **Answer: B.** Without a limit, the trailing empty value is dropped, so `kv[1]` would throw `ArrayIndexOutOfBoundsException`. With limit 2 the String is split at most once and trailing empties are kept: `["b", ""]`. Limit 2 also keeps a value such as `a=b=c` intact.

8. *(Advanced)* What does this print?
```java
String h = "<b>x</b><b>y</b>";
System.out.println(h.replaceAll("<b>.*</b>", "#") + " " + h.replaceAll("<b>.*?</b>", "#"));
```
   - A) `## ##`
   - B) `# #`
   - C) `## #`
   - D) `# ##`
   - **Answer: D.** `.*` is greedy: it runs to the **last** `</b>`, so the whole String becomes one `#`. `.*?` is lazy: it stops at the first `</b>`, so each tag pair is replaced separately: `##`.

9. *(Advanced)* `e = "a😀b"`. Which reversal gives `"b😀a"`?
   - A) Swapping chars in `e.toCharArray()` with two pointers
   - B) `new StringBuilder(e).reverse()`
   - C) Both
   - D) Neither: emoji can't be reversed in Java
   - **Answer: B.** The emoji is 2 chars (a surrogate pair). A plain char swap reverses the pair into an invalid order, so the emoji breaks. `StringBuilder.reverse()` treats surrogate pairs as one unit and keeps them in order. Verified on JDK 25: the swap result is not equal to "b😀a".

10. *(Advanced)* This sliding window for "longest substring without repeats" has a bug. What does it return for `"abba"`, and what is the correct answer?
```java
if (last[c] >= 0) left = last[c] + 1;   // jump past the old copy
last[c] = r;
best = Math.max(best, r - left + 1);
```
   - A) Returns 2; correct is 2
   - B) Returns 3; correct is 2
   - C) Returns 4; correct is 2
   - D) Returns 2; correct is 3
   - **Answer: B.** At the final 'a' (r = 3), the old 'a' is at index 0, so `left` jumps **back** from 2 to 1, and the window "bba" (length 3) is counted even though it repeats 'b'. The left edge must never move left: `left = Math.max(left, last[c] + 1)`. Then the answer is 2 ("ab" or "ba").

**Recall prompts.**
- Day 1:
  - Name the 7 String patterns. — Frequency count, two pointers, sliding window, stack, sorting or canonical key, expand around centre, and build with StringBuilder.
  - How do you map a lowercase letter to an index 0–25? — `c - 'a'`.
  - What does `split(",", -1)` change? — It keeps trailing empty strings.
- Day 3:
  - Why is the int[26] count O(n) for anagrams while sorting is O(n log n)? — Counting touches each char once and compares 26 slots; sorting both Strings costs n log n.
  - Why must the sliding-window left edge use `Math.max`? — The last position of a char can be left of the window; without max, the left edge jumps backwards and counts repeats ("abba" gives 3 instead of 2).
  - Greedy vs lazy quantifier? — `.*` takes as much as possible and backs off; `.*?` takes as little as possible.
- Day 7:
  - Explain expand-around-centre for the longest palindrome. — Try each of the 2n−1 centres (each char and each gap), expand while both ends match, keep the best: O(n²) time, O(1) space.
  - How would you validate brackets in a JSON-like payload? — Push openers onto a stack (`ArrayDeque`), pop and match on each closer, and require the stack to be empty at the end.
  - How do you parse `key=value` pairs safely? — Split on `&`, then `split("=", 2)` so empty values and values containing `=` survive; decode and validate each part.

### Lesson 04 quiz (10 questions)

1. *(Beginner)* What does this print?
```java
int[] a = new int[3];
String[] s = new String[2];
boolean[] b = new boolean[1];
System.out.println(a[1] + " " + s[0] + " " + b[0]);
```
   - A) It doesn't compile: the arrays are not initialised
   - B) `0 null false`
   - C) `0  false`
   - D) It throws `NullPointerException`
   - **Answer: B.** A new array is always filled with defaults: 0 for numbers, `false` for boolean, `null` for references. Concatenating `null` prints "null". (Only **local variables** must be assigned before use, not array elements.)

2. *(Beginner)* What happens here?
```java
int[] a = {1, 2, 3};
System.out.println(a.length + " " + a[a.length]);
```
   - A) It prints `3 3`
   - B) It prints `3 0`
   - C) It throws `ArrayIndexOutOfBoundsException` and prints nothing
   - D) It prints `3` and then throws
   - **Answer: C.** Valid indexes are 0 to `length - 1`. The whole argument is evaluated before `println` runs, so the exception ("Index 3 out of bounds for length 3") is thrown before anything is printed.

3. *(Beginner)* Why is `arr[i]` O(1)?
   - A) The JVM keeps a hash table of every element
   - B) Elements sit in one contiguous block, so the address is `base + i × elementSize`
   - C) Arrays are always sorted
   - D) It isn't: the JVM walks the array from index 0
   - **Answer: B.** One multiply and one add give the address of any element, whatever i is. That is also why indexes start at 0: index 0 is the offset 0 from the start of the data.

4. *(Intermediate)* What does this print?
```java
int[] a = {1, 2, 3};
int[] b = a;
int[] c = a.clone();
b[0] = 9;
c[1] = 8;
System.out.println(Arrays.toString(a));
```
   - A) `[1, 2, 3]`
   - B) `[9, 8, 3]`
   - C) `[1, 8, 3]`
   - D) `[9, 2, 3]`
   - **Answer: D.** `b = a` copies the reference, so `b` is an alias and writes through it change `a`. `clone()` makes a new array, so writing to `c` leaves `a` alone.

5. *(Intermediate)* What does this print?
```java
int[][] g = {{1, 2}, {3, 4}};
int[][] h = g.clone();
h[0][0] = 7;
h[1] = new int[]{5, 6};
System.out.println(Arrays.deepToString(g));
```
   - A) `[[1, 2], [3, 4]]`
   - B) `[[7, 2], [5, 6]]`
   - C) `[[7, 2], [3, 4]]`
   - D) `[[1, 2], [5, 6]]`
   - **Answer: C.** `clone()` of a 2D array is shallow: a new outer array that holds the **same** row arrays. `h[0][0] = 7` writes into a shared row, so `g` sees it. `h[1] = …` replaces a slot in `h`'s own outer array only.

6. *(Intermediate)* What does this print?
```java
int[] x = {1, 2}, y = {1, 2};
System.out.println(x.equals(y) + " " + Arrays.equals(x, y) + " " + (Arrays.hashCode(x) == Arrays.hashCode(y)));
```
   - A) `true true true`
   - B) `false true true`
   - C) `false true false`
   - D) `false false true`
   - **Answer: B.** Arrays don't override `equals`, so `x.equals(y)` is identity: false. `Arrays.equals` and `Arrays.hashCode` work on the content. This is why an `int[]` is a poor HashMap key.

7. *(Intermediate)* What does this print?
```java
static void f(int[] a) {
    a[0] = 5;
    a = new int[]{7, 7};
    a[1] = 9;
}
// in main:
int[] arr = {1, 2};
f(arr);
System.out.println(Arrays.toString(arr));
```
   - A) `[1, 2]`
   - B) `[5, 2]`
   - C) `[7, 9]`
   - D) `[5, 9]`
   - **Answer: B.** Java passes a **copy of the reference**. `a[0] = 5` goes through the copy to the caller's array. `a = new int[]…` only re-points the local copy, so `a[1] = 9` changes the new array, which the caller never sees.

8. *(Advanced)* What does this print?
```java
String[] s = {"b", "a"};
List<String> l = Arrays.asList(s);
s[0] = "z";
l.set(1, "y");
System.out.println(Arrays.toString(s) + " " + l);
try { l.add("c"); } catch (UnsupportedOperationException e) { System.out.println("UOE"); }
```
   - A) `[z, a] [b, y]` then `UOE`
   - B) `[z, y] [z, y]` then `UOE`
   - C) `[z, y] [z, y]` and the add succeeds
   - D) `[z, a] [z, y]` then `UOE`
   - **Answer: B.** `Arrays.asList` returns a fixed-size **view** backed by the array: writes go both ways, and `set` works, but `add`/`remove` throw. Use `new ArrayList<>(Arrays.asList(s))` for an independent, growable list.

9. *(Advanced)* What happens here?
```java
Object[] o = new String[2];
o[0] = "ok";
o[1] = 42;
```
   - A) Compile error on line 1
   - B) Compile error on line 3
   - C) It compiles and throws `ArrayStoreException` on line 3
   - D) It runs fine; `o[1]` holds 42
   - **Answer: C.** Arrays are covariant: a `String[]` is an `Object[]`, so the code compiles. The array still knows it is a `String[]`, and the JVM checks every store at runtime: storing an Integer throws `ArrayStoreException: java.lang.Integer`. Generics are invariant, so `List<Object> l = new ArrayList<String>()` fails at compile time instead.

10. *(Advanced)* Orders arrive already sorted by id: o1 PAID, o2 NEW, o3 PAID, o4 NEW. You sort the `Order[]` by status with `Arrays.sort(orders, comparing(Order::status))`. What is the order?
   - A) `o2 o4 o1 o3`, guaranteed
   - B) `o4 o2 o3 o1`
   - C) `o2 o4` then `o1 o3` in an unspecified order
   - D) It depends on the JVM
   - **Answer: A.** `Arrays.sort` for objects is TimSort, which is **stable**: equal keys keep their earlier order, so the id order survives inside each status. That is why you can sort by a secondary key first, then by the primary key. Primitive sorts (dual-pivot quicksort) are not stable, but for primitives that can't be observed.

**Recall prompts.**
- Day 1:
  - What are the default values in a new array? — 0 / 0.0 for numbers, `'\u0000'` for char, `false` for boolean, `null` for references.
  - Is `length` a field or a method on arrays? — A final field: `arr.length` (Strings use `length()`).
  - Which algorithm does `Arrays.sort` use? — Dual-pivot quicksort for primitives; TimSort (stable) for objects.
- Day 3:
  - Why does a method that reassigns its array parameter not affect the caller? — Java passes a copy of the reference; reassigning the copy re-points only the local variable.
  - Why does `Arrays.asList(new int[]{1,2})` have size 1? — Generics can't hold primitives, so `T` becomes `int[]` and the list holds the array itself.
  - Why is `clone()` of a 2D array shallow? — A 2D array is an array of references to rows; clone copies the references, not the rows.
- Day 7:
  - Explain array covariance and why generics chose invariance. — `String[]` is an `Object[]`, so a wrong store is only caught at runtime (ArrayStoreException). Generics are invariant so the compiler catches it.
  - When do you choose an array over an ArrayList in backend code? — Fixed size, primitives (no boxing), hot loops or byte buffers; otherwise ArrayList for growth and the Collections API.
  - Walk through Kadane's algorithm. — Keep the best sum ending here: `cur = max(x, cur + x)`; track the overall best. O(n) time, O(1) space; start from the first element so all-negative input works.

### Lesson 05 quiz (12 questions)

1. *(Beginner)* Which statement about classes and objects is correct?
   - A) A class and an object are the same thing
   - B) A class is a blueprint loaded once; each `new` creates a separate object on the heap with its own instance fields
   - C) Every object holds its own copy of the class's methods
   - D) Objects are stored inside the variables that refer to them

   **Answer: B.** The class (field layout, method code, method table) is loaded once into Metaspace. Each object on the heap holds only a header and its own instance fields; variables hold references to objects.

2. *(Beginner)* What does this print?
```java
Car a = new Car("Swift");   // speed starts at 0
Car b = a;
b.speed = 5;
System.out.println(a.speed);
```
   - A) 0
   - B) 5
   - C) Compile error
   - D) NullPointerException

   **Answer: B.** `b = a` copies the **reference**, so both variables point to one Car. Setting the speed through `b` is visible through `a`.

3. *(Beginner)* A field is declared with **no** access modifier. Who can access it?
   - A) Everyone
   - B) Only the class itself
   - C) Classes in the same package
   - D) Classes in the same package and subclasses anywhere

   **Answer: C.** No modifier means **package-private**: the same package only. `protected` adds subclasses in other packages; `public` is everyone.

4. *(Beginner)* `class Dog` declares only the constructor `Dog(String name)`. What does `new Dog()` do?
   - A) Creates a Dog with `name = null`
   - B) Compile error: no matching constructor
   - C) Throws `InstantiationException` at run time
   - D) Calls `Object()` directly

   **Answer: B.** The compiler adds a no-arg constructor only when a class declares **no** constructors. Once `Dog(String)` exists, `new Dog()` has nothing to call: "constructor Dog in class Dog cannot be applied to given types".

5. *(Intermediate)* What does this print?
```java
class A { void f(Object o) { System.out.println("A.obj"); } }
class B extends A { void f(String s) { System.out.println("B.str"); } }

A x = new B();
x.f("hi");
```
   - A) B.str
   - B) A.obj
   - C) Compile error: ambiguous
   - D) ClassCastException

   **Answer: B.** `f(String)` has a different parameter type, so it is an **overload**, not an override. `javac` looks only at the declared type `A`, which has just `f(Object)`. B doesn't override `f(Object)`, so A's version runs. Writing `@Override` on B's method would have caught it.

6. *(Intermediate)* What does this print?
```java
class P { String n = "P"; String get() { return n; } }
class C extends P { String n = "C"; @Override String get() { return n; } }

P p = new C();
System.out.println(p.n + " " + p.get());
```
   - A) C C
   - B) P P
   - C) P C
   - D) C P

   **Answer: C.** Fields are **not** polymorphic: `p.n` uses the declared type P, so "P". Methods are: `p.get()` runs C's override, which reads C's own field, so "C".

7. *(Intermediate)* `Point` overrides `equals` (comparing x and y) but **not** `hashCode`. What does this print?
```java
Set set = new HashSet<>();
set.add(new Point(1, 2));
System.out.println(set.contains(new Point(1, 2)));
```
   - A) true
   - B) false
   - C) It throws an exception
   - D) Compile error

   **Answer: B.** The two objects have different identity hash codes, so the set looks in the wrong bucket and never calls `equals`. (In theory the hashes could collide and print true, but in practice it is false.) Equal objects must have equal hash codes.

8. *(Intermediate)* Which statement about abstract classes and interfaces is true?
   - A) An interface can have instance fields that each object gets a copy of
   - B) An abstract class can have constructors and state; a class can implement many interfaces but extend only one class
   - C) An abstract class must contain at least one abstract method
   - D) Interface methods can't have bodies in any Java version

   **Answer: B.** Interfaces have only `public static final` constants (no instance state) and, since Java 8, `default`/`static` methods with bodies. An abstract class may have zero abstract methods; it just can't be instantiated.

9. *(Intermediate)* What does `new C()` print?
```java
class P { static { print("Ps "); }  { print("Pi "); }  P() { print("Pc "); } }
class C extends P { static { print("Cs "); }  { print("Ci "); }  C() { print("Cc "); } }
```
   - A) Ps Pi Pc Cs Ci Cc
   - B) Ps Cs Pi Pc Ci Cc
   - C) Cs Ps Ci Cc Pi Pc
   - D) Ps Cs Ci Cc Pi Pc

   **Answer: B.** Class initialisation first, parent then child (both static blocks). Then the object: `C()` calls `super()`, which runs P's instance block and constructor; then C's instance block, then the rest of C's constructor.

10. *(Advanced)* What does `new Der()` print?
```java
class Base { Base() { show(); }  void show() {} }
class Der extends Base {
    String s = "set";
    @Override void show() { System.out.println(s); }
}
```
   - A) set
   - B) null
   - C) Nothing
   - D) NullPointerException

   **Answer: B.** `Base()` runs before Der's field initialisers, but dispatch already uses Der, so `Der.show()` runs while `s` is still `null`. Printing a null String prints "null" (no exception). Never call overridable methods from a constructor.

11. *(Advanced)* A `CountingSet extends HashSet` overrides `add` (count++) and `addAll` (count += size, then `super.addAll`). After `addAll(List.of("a", "b", "c"))`, what is the count?
   - A) 3
   - B) 6
   - C) 0
   - D) 9

   **Answer: B.** The inherited `addAll` (from `AbstractCollection`) calls `add` for each element, and that is the overriding `add`, so 3 + 3 = 6. The fragile base class problem: prefer composition (wrap a Set and forward).

12. *(Advanced)* What does this print?
```java
class Animal { static String kind() { return "Animal"; } }
class Dog extends Animal { static String kind() { return "Dog"; } }

Animal a = new Dog();
System.out.println(a.kind() + " " + ((Dog) a).kind());
```
   - A) Dog Dog
   - B) Animal Dog
   - C) Animal Animal
   - D) Compile error: static methods can't be redeclared

   **Answer: B.** Static methods are **hidden**, not overridden. The call is bound at compile time to the declared type: `a` is Animal, the cast expression is Dog. Write `Animal.kind()` to make it obvious.

#### Lesson 05 recall prompts

**Day 1:**
- Class vs object in one sentence each. — Class: the blueprint, loaded once. Object: an instance made by `new` on the heap with its own fields.
- When does Java add a default constructor? — Only when the class declares no constructor at all.
- List the four access levels from narrowest to widest. — `private` < package-private < `protected` < `public`.

**Day 3:**
- Overloading vs overriding: who picks, and when? — Overloads: `javac`, from declared types. Overrides: the JVM at run time, from the object's class.
- Why must equals and hashCode be overridden together? — Hash collections find the bucket by hash before calling equals; equal objects need equal hashes.
- Give the order of initialisation for `new Child()`. — Static parent, static child (once); parent fields/blocks/constructor; child fields/blocks; child constructor body.

**Day 7:**
- Explain composition over inheritance with an example. — A counting `HashSet` subclass double-counts because `addAll` calls `add`; a wrapper that forwards to a Set depends only on the contract.
- Abstract class vs interface: how do you choose? — Interface for a capability (many, no state, defaults); abstract class for shared state, constructors or a template method (one).
- What do records, enums and sealed types each give you? — Record: generated immutable data class. Enum: fixed singleton instances with behaviour. Sealed: closed hierarchy, exhaustive switch.


### Lesson 06 quiz (12 questions)

1. *(Beginner)* What does `[5, 1, 4, 2, 8]` look like after the **first** pass of bubble sort (ascending)?
   - A) `[1, 5, 4, 2, 8]`
   - B) `[1, 4, 2, 5, 8]`
   - C) `[1, 2, 4, 5, 8]`
   - D) `[1, 4, 5, 2, 8]`

   **Answer: B.** 5 wins three comparisons in a row (5>1, 5>4, 5>2) and moves right until it meets 8; then 8 is compared with nothing larger. Pass 1 parks the largest value, 8, at the end: `[1, 4, 2, 5, 8]`.

2. *(Beginner)* Which elements does bubble sort compare?
   - A) The smallest remaining element with every other element
   - B) Each element with the pivot
   - C) Adjacent elements `a[j]` and `a[j + 1]`
   - D) The first and last elements of the unsorted part

   **Answer: C.** Bubble sort only ever compares and swaps **neighbours**. Selection sort searches for the minimum; quicksort uses a pivot.

3. *(Beginner)* At most how many passes does bubble sort need for an array of `n` elements?
   - A) `n / 2`
   - B) `n − 1`
   - C) `n`
   - D) `n²`

   **Answer: B.** Each pass parks one more value at the end; once n − 1 values are parked, the last one (the minimum) is automatically at index 0.

4. *(Intermediate)* What is the best-case time of the standard bubble sort **without** a swapped flag (inner loop `j < n - 1 - i`)?
   - A) O(1)
   - B) O(n)
   - C) O(n log n)
   - D) O(n²)

   **Answer: D.** Without the flag it never stops early: it makes n(n−1)/2 comparisons even on sorted input. "O(n) best case" is true only with the swapped-flag optimization.

5. *(Intermediate)* With the swapped flag, how many comparisons does bubble sort make on an already sorted array of 1000 elements?
   - A) 999
   - B) 1000
   - C) 499,500
   - D) 0

   **Answer: A.** One pass compares the 999 neighbour pairs, swaps nothing, and the flag ends the sort. Measured in `BubbleCounts`: 999.

6. *(Intermediate)* What happens?
```java
int[] b = {5, 1, 4, 2, 8};
int n = b.length;
for (int i = 0; i < n - 1; i++)
    for (int j = 0; j < n - i; j++)
        if (b[j] > b[j + 1]) { /* swap */ }
```
   - A) It sorts the array correctly
   - B) It makes one extra harmless comparison per pass
   - C) `ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5`
   - D) An infinite loop

   **Answer: C.** In the first pass `j` reaches 4, so `b[j + 1]` reads `b[5]`. The last valid pair is (n−2, n−1): the bound must be `j < n - 1 - i`.

7. *(Intermediate)* How many swaps does bubble sort make on `[3, 1, 2]`?
   - A) 1
   - B) 2
   - C) 3
   - D) It depends on the variant

   **Answer: B.** Swaps = inversions. The inversions are (3,1) and (3,2): 2 swaps, in every adjacent-swap variant (V1–V9).

8. *(Intermediate)* You change `if (a[j] > a[j + 1])` to `if (a[j] >= a[j + 1])`. What changes?
   - A) Nothing: the result is the same array
   - B) It sorts in descending order
   - C) Equal elements are swapped, so the sort is no longer stable (and does extra swaps)
   - D) It throws for duplicate values

   **Answer: C.** For plain `int`s the output looks the same, but objects with equal keys change their relative order: `[Asha:90, Meena:90]` becomes `[Meena:90, Asha:90]`. With duplicates it can even swap back and forth needlessly.

9. *(Advanced)* What is the extra space used by recursive bubble sort (`bubble(a, n)` → one pass → `bubble(a, n − 1)`)?
   - A) O(1): it sorts in place
   - B) O(log n)
   - C) O(n): up to n − 1 stack frames
   - D) O(n²)

   **Answer: C.** The array is sorted in place, but each active call keeps a stack frame. Java has no tail-call elimination, so the depth is up to n − 1: O(n). The fully recursive version overflows for n = 1,000,000.

10. *(Advanced)* What does this print?
```java
int[] a = {2, 1, 3, 4};
int c = 0;
boolean swapped = false;          // declared once
for (int i = 0; i < a.length - 1; i++) {
    for (int j = 0; j < a.length - 1 - i; j++) {
        c++;
        if (a[j] > a[j + 1]) { /* swap */ swapped = true; }
    }
    if (!swapped) break;
}
System.out.println(c);
```
   - A) 3
   - B) 5
   - C) 6
   - D) 4

   **Answer: C.** `swapped` is never reset, so after the first swap the early exit can never fire: 3 + 2 + 1 = **6**. With the reset inside the outer loop it would print 5 (3 + 2).

11. *(Advanced)* `[2, 3, 4, 5, 6, 7, 8, 1]` takes 7 passes with the swapped flag. Which variant fixes this best, and why?
   - A) Odd–even sort, because it runs in parallel
   - B) Cocktail shaker sort: its backward sweep carries the 1 (a "turtle") to the front in one sweep
   - C) Recursive bubble sort, because it uses the call stack
   - D) The last-swap boundary, because it shrinks faster

   **Answer: B.** A small value at the end moves only one slot left per forward pass. Cocktail shaker sort sorts it in 3 sweeps and 18 comparisons instead of 7 passes and 28 (`CocktailSort` output).

12. *(Advanced)* Which statement about comb sort is **false**?
   - A) It compares elements a gap apart and shrinks the gap by about 1.3
   - B) When the gap reaches 1 it is bubble sort with a flag
   - C) It is stable, like bubble sort
   - D) On 10,000 random ints it made about 327 thousand comparisons, versus about 50 million for bubble sort

   **Answer: C.** Swaps over a gap can jump one element over an equal one, so comb sort is **not** stable. The counts are from `CombSort`: 326,734 vs 49,967,034.

#### Lesson 06 recall prompts

**Day 1:**
- Explain bubble sort in two sentences. — Compare each pair of neighbours and swap them if they are out of order; one walk is a pass. After pass k the k largest values are parked at the end, so n − 1 passes sort the array.
- Write the inner loop bound and say why. — `j < n - 1 - i`: the last pair is (n−2−i, n−1−i); the i parked values after it never move.
- What does the swapped flag give you? — Early exit: a pass with no swaps proves the array is sorted. Best case O(n).

**Day 3:**
- Best, average, worst time and space of bubble sort? — O(n) with the flag (O(n²) without), O(n²), O(n²); O(1) space for loops, O(n) stack for recursion.
- Why is bubble sort stable, and how do you break it? — It swaps only on strict `>`, so equal elements never cross; `>=` breaks it.
- How many swaps on a given input? — Exactly the number of inversions; n(n−1)/2 for a reversed array.

**Day 7:**
- Write recursive bubble sort and state its cost. — `if (n <= 1) return;` one pass; `bubble(a, n - 1)`. O(n²) time, O(n) stack.
- Name three relatives of bubble sort and what each fixes. — Cocktail shaker (turtles, two directions), odd–even (parallel phases), comb sort (gap shrinking by 1.3, fast in practice, unstable).
- What does the last-swap boundary do? — Remembers the index of the last swap; everything after it is final, so the next pass stops there. Same Big-O, fewer comparisons.


### Lesson 06 · Guess the Big-O (12 questions, section O(n))

1. *(Beginner)* Time complexity?
```java
for (int i = 0; i < n; i++)
    sum += a[i];
```
   - A) O(1)
   - B) O(log n)
   - C) O(n)
   - D) O(n²)

   **Answer: C.** The body runs n times and does O(1) work each time.

2. *(Beginner)* Time complexity?
```java
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
        count++;
```
   - A) O(n)
   - B) O(2n)
   - C) O(n²)
   - D) O(n log n)

   **Answer: C.** Nested loops multiply: n × n = n² iterations.

3. *(Beginner)* Time complexity?
```java
for (int i = 1; i < n; i *= 2)
    count++;
```
   - A) O(n)
   - B) O(log n)
   - C) O(n/2)
   - D) O(√n)

   **Answer: B.** i takes the values 1, 2, 4, 8 … so the loop runs about log₂ n times.

4. *(Intermediate)* Time complexity?
```java
for (int i = 0; i < n; i++)
    for (int j = 0; j < i; j++)
        count++;
```
   - A) O(n)
   - B) O(n log n)
   - C) O(n²)
   - D) O(n²/2), which is better than O(n²)

   **Answer: C.** 0 + 1 + … + (n − 1) = n(n − 1)/2 iterations. The ½ is a constant, so it is O(n²).

5. *(Intermediate)* Time complexity?
```java
for (int i = 0; i < n; i++)
    for (int d = 0; d < 26; d++)
        count[d] += f(i, d);   // f is O(1)
```
   - A) O(n²)
   - B) O(26n²)
   - C) O(n)
   - D) O(log n)

   **Answer: C.** The inner loop always runs 26 times, a constant: 26n = O(n).

6. *(Intermediate)* Time complexity? (`list` is an ArrayList of n values)
```java
for (int x : list)
    if (list.contains(x + 1))
        pairs++;
```
   - A) O(n)
   - B) O(n log n)
   - C) O(n²)
   - D) O(1)

   **Answer: C.** `contains` on an ArrayList is a hidden linear search, O(n), done n times: O(n²). A HashSet would make it O(n).

7. *(Intermediate)* Time complexity? (a has length A, b has length B)
```java
for (int x : a) total += x;
for (int y : b) total += y;
```
   - A) O(A · B)
   - B) O(A + B)
   - C) O(n²)
   - D) O(max(A, B)²)

   **Answer: B.** Sequential loops add, and the inputs are different, so keep both letters: O(A + B).

8. *(Advanced)* Time complexity?
```java
for (int i = n; i > 0; i /= 2)
    for (int j = 0; j < i; j++)
        count++;
```
   - A) O(n log n)
   - B) O(n)
   - C) O(log n)
   - D) O(n²)

   **Answer: B.** The inner loop runs n, then n/2, n/4 … times: n + n/2 + n/4 + … < 2n. A geometric series, so O(n), not O(n log n).

9. *(Advanced)* Time and space complexity?
```java
int f(int n) {
    if (n <= 1) return 1;
    return f(n - 1) + f(n - 1);
}
```
   - A) O(n) time, O(n) space
   - B) O(2ⁿ) time, O(2ⁿ) space
   - C) O(2ⁿ) time, O(n) space
   - D) O(n²) time, O(1) space

   **Answer: C.** Each call makes two calls on n − 1: 1 + 2 + 4 + … + 2ⁿ⁻¹ ≈ 2ⁿ calls. Only one root-to-leaf path is on the stack at a time, so the space is the depth, O(n).

10. *(Advanced)* Time complexity?
```java
String s = "";
for (int i = 0; i < n; i++)
    s += "x";
```
   - A) O(n)
   - B) O(n log n)
   - C) O(n²)
   - D) O(1) per step, so O(n)

   **Answer: C.** Strings are immutable: each `+=` copies the whole current string, 1 + 2 + … + n = O(n²) characters. StringBuilder makes it O(n).

11. *(Advanced)* Extra space of recursive binary search on n sorted values?
   - A) O(1)
   - B) O(log n)
   - C) O(n)
   - D) O(n log n)

   **Answer: B.** It creates no arrays, but each halving step is a stack frame: about log₂ n frames. The iterative version is O(1).

12. *(Advanced)* Time complexity?
```java
for (int i = 0; i * i < n; i++)
    count++;
```
   - A) O(n)
   - B) O(log n)
   - C) O(√n)
   - D) O(n²)

   **Answer: C.** The loop stops when i² ≥ n, i.e. after about √n iterations (e.g. a prime check up to √n).

### Lesson 06 · Check yourself per sort (30 questions, end of each sort's review section)

Array states come from each sort's dry-run program (run on JDK 25).

**Selection sort** (`QZ.s_selection`)

1. *(Beginner)* What is `[64, 25, 12, 22, 11]` after the **first** pass of selection sort?
   - A) `[25, 64, 12, 22, 11]`
   - B) `[11, 25, 12, 22, 64]`
   - C) `[11, 12, 22, 25, 64]`
   - D) `[25, 12, 22, 11, 64]`

   **Answer: B.** The minimum of the whole array, 11, is swapped with a[0] = 64. Nothing else moves (SelectionDemo, pass 1).

2. *(Intermediate)* At most how many swaps does selection sort make on n elements?
   - A) n − 1
   - B) n(n − 1)/2
   - C) n²
   - D) log n

   **Answer: A.** One swap per pass at most, and there are n − 1 passes. That is its one advantage: few writes.

3. *(Intermediate)* Why is selection sort still O(n²) on an array that is already sorted?
   - A) It swaps every pair
   - B) It must scan the whole unsorted part every pass to be sure it found the minimum
   - C) It uses recursion
   - D) It is not; it is O(n) on sorted input

   **Answer: B.** Comparisons are always (n − 1) + (n − 2) + … + 1 = n(n − 1)/2; there is no early exit.

**Insertion sort** (`QZ.s_insertion`)

1. *(Beginner)* Insertion sort on `[12, 11, 13, 5, 6]`: what is the array after inserting the 5?
   - A) `[5, 12, 11, 13, 6]`
   - B) `[11, 12, 13, 5, 6]`
   - C) `[5, 11, 12, 13, 6]`
   - D) `[5, 6, 11, 12, 13]`

   **Answer: C.** The prefix [11, 12, 13] is sorted; 13, 12 and 11 shift right and 5 drops into a[0] (InsertionDemo: "insert 5: shifted 3").

2. *(Intermediate)* What is insertion sort's best case, and on which input?
   - A) O(1), empty input
   - B) O(n), already sorted input
   - C) O(n log n), random input
   - D) O(n²), sorted input

   **Answer: B.** Each key is compared once with its left neighbour and stays: n − 1 comparisons, no shifts.

3. *(Intermediate)* Why does the loop test `a[j] > key` and not `a[j] >= key`?
   - A) To avoid an exception
   - B) So equal values are not shifted past each other: the sort stays stable (and shifts less)
   - C) It makes it O(n log n)
   - D) There is no difference

   **Answer: B.** With >= a key would jump over equal values, reversing their order.

**Merge sort** (`QZ.s_merge`)

1. *(Beginner)* Merging the sorted halves `[27, 38]` and `[3, 43]` gives?
   - A) `[27, 38, 3, 43]`
   - B) `[3, 27, 38, 43]`
   - C) `[3, 43, 27, 38]`
   - D) `[27, 3, 38, 43]`

   **Answer: B.** Two pointers always take the smaller head: 3, 27, 38, 43 (MergeDemo: "merge -> [3, 27, 38, 43]").

2. *(Intermediate)* How much extra memory does merge sort on an array need?
   - A) O(1)
   - B) O(log n) only
   - C) O(n)
   - D) O(n²)

   **Answer: C.** The merge copies the range into a temporary array: O(n), plus O(log n) for the recursion.

3. *(Advanced)* Merge sort's recurrence and its result?
   - A) T(n) = T(n − 1) + n → O(n²)
   - B) T(n) = 2T(n/2) + n → O(n log n) in every case
   - C) T(n) = T(n/2) + 1 → O(log n)
   - D) T(n) = 2T(n/2) + 1 → O(n)

   **Answer: B.** Two halves plus a linear merge: log₂ n levels × n work per level, on every input.

**Quick sort** (`QZ.s_quick`)

1. *(Beginner)* Lomuto partition of `[10, 80, 30, 90, 40, 50, 70]` around the last element, 70, gives?
   - A) `[10, 30, 40, 50, 70, 90, 80]`, 70 at index 4
   - B) `[10, 30, 40, 50, 70, 80, 90]`, 70 at index 4
   - C) `[70, 10, 80, 30, 90, 40, 50]`, 70 at index 0
   - D) `[10, 80, 30, 90, 40, 50, 70]`, 70 at index 6

   **Answer: A.** Values smaller than 70 are swapped to the front in order; 70 then swaps into index 4, its final place (QuickDemo line 1).

2. *(Intermediate)* When does quicksort take O(n²)?
   - A) Never
   - B) When the pivot is always the smallest or largest value, e.g. sorted input with a last-element pivot
   - C) On random input
   - D) When n is odd

   **Answer: B.** Each partition then removes only the pivot: n + (n − 1) + … = O(n²). A random pivot avoids it.

3. *(Advanced)* What is the average time of Quickselect (k-th smallest)?
   - A) O(n)
   - B) O(n log n)
   - C) O(log n)
   - D) O(n²)

   **Answer: A.** It keeps only the side holding k: n + n/2 + n/4 + … ≈ 2n.

**Heap sort** (`QZ.s_heap`)

1. *(Beginner)* In a binary heap stored in an array from index 0, where are the children of index i?
   - A) 2i and 2i + 1
   - B) 2i + 1 and 2i + 2
   - C) i + 1 and i + 2
   - D) i / 2

   **Answer: B.** 0-based: left = 2i + 1, right = 2i + 2, parent = (i − 1) / 2.

2. *(Intermediate)* Building a max-heap from `[4, 10, 3, 5, 1]` (bottom-up sift-down) gives?
   - A) `[10, 4, 3, 5, 1]`
   - B) `[10, 5, 3, 4, 1]`
   - C) `[1, 3, 4, 5, 10]`
   - D) `[10, 5, 4, 3, 1]`

   **Answer: B.** siftDown(1): 10 is bigger than 5 and 1, stays. siftDown(0): 4 swaps with 10, then with 5 (HeapDemo: "max-heap: [10, 5, 3, 4, 1]").

3. *(Advanced)* Best way to find the k-th largest of n values with a heap?
   - A) Sort, then index
   - B) A min-heap of size k: push each value, poll when size > k; the root is the answer, O(n log k)
   - C) A max-heap of all n values, poll k times
   - D) Heaps can't do it

   **Answer: B.** The size-k min-heap holds the k largest seen so far; its smallest is the k-th largest (HeapDemo: 4th largest = 4).

**Counting sort** (`QZ.s_counting`)

1. *(Beginner)* Time of counting sort for n values in the range 0 … k?
   - A) O(n log n)
   - B) O(n + k)
   - C) O(n · k)
   - D) O(k²)

   **Answer: B.** One pass to count, one pass over the k counters, one pass to write: no comparisons at all.

2. *(Intermediate)* For `[4, 2, 2, 8, 3, 3, 1]`, what are `count[2]` and `count[3]`?
   - A) 1 and 1
   - B) 2 and 2
   - C) 2 and 3
   - D) 3 and 5

   **Answer: B.** The value 2 appears twice and 3 twice (CountingDemo: count [0, 1, 2, 2, 1, 0, 0, 0, 1]).

3. *(Intermediate)* When is counting sort a bad idea?
   - A) When values are letters
   - B) When the range is huge, e.g. values up to 10⁹
   - C) When there are duplicates
   - D) When n is large

   **Answer: B.** The count array would need 10⁹ slots. Use radix sort, a HashMap or a comparison sort.

**Radix sort** (`QZ.s_radix`)

1. *(Beginner)* `[170, 45, 75, 90, 802, 24, 2, 66]` after the **ones-digit** pass?
   - A) `[2, 24, 45, 66, 75, 90, 170, 802]`
   - B) `[170, 90, 802, 2, 24, 45, 75, 66]`
   - C) `[802, 2, 24, 45, 66, 170, 75, 90]`
   - D) `[170, 45, 75, 90, 802, 24, 2, 66]`

   **Answer: B.** Grouped by last digit 0, 0, 2, 2, 4, 5, 5, 6, keeping input order inside each group (RadixDemo line 1).

2. *(Intermediate)* Why must each digit pass be stable?
   - A) To save memory
   - B) To keep the order created by the earlier digits among values with the same current digit
   - C) To avoid negative numbers
   - D) It doesn't need to be

   **Answer: B.** Otherwise the work of the earlier passes is scrambled.

3. *(Intermediate)* Radix sort's time for d digits in base b?
   - A) O(n log n)
   - B) O(d · (n + b))
   - C) O(n²)
   - D) O(b^d)

   **Answer: B.** d passes of a counting sort over n values and b buckets.

**Bucket sort** (`QZ.s_bucket`)

1. *(Beginner)* 10 buckets over 0 … 99 (bucket = x · 10 / 100): where does 72 go?
   - A) bucket 2
   - B) bucket 7
   - C) bucket 72
   - D) bucket 9

   **Answer: B.** 72 · 10 / 100 = 7.2 → 7 (BucketDemo: bucket 7 holds [78, 72]).

2. *(Intermediate)* Bucket sort's worst case?
   - A) O(n)
   - B) O(n log n)
   - C) All values land in one bucket: the inner sort's cost, O(n²) with insertion sort
   - D) O(1)

   **Answer: C.** Linear time needs evenly spread values.

3. *(Intermediate)* Top K Frequent Elements in O(n) uses buckets indexed by what?
   - A) The value
   - B) The frequency
   - C) The index
   - D) The hash code

   **Answer: B.** Frequencies are between 1 and n, so bucket[f] lists values seen f times; read from the top.

**Cyclic sort** (`QZ.s_cyclic`)

1. *(Beginner)* Values are exactly 1 … n. Where does value v belong?
   - A) index v
   - B) index v − 1
   - C) index n − v
   - D) anywhere

   **Answer: B.** So each value can be swapped straight home.

2. *(Intermediate)* After cyclic sort of `[4, 3, 2, 7, 8, 2, 3, 1]`, which numbers are missing?
   - A) 2 and 3
   - B) 5 and 6
   - C) 7 and 8
   - D) none

   **Answer: B.** Slots 4 and 5 hold 3 and 2 instead of 5 and 6 (CyclicDemo: duplicates [3, 2], missing [5, 6]).

3. *(Intermediate)* Why compare `a[i]` with `a[a[i] − 1]` instead of `a[i]` with `i + 1`?
   - A) It is faster
   - B) With duplicates, a[i] ≠ i + 1 forever and the loop never ends
   - C) To sort descending
   - D) No reason

   **Answer: B.** If the target already holds the same value, the current value is a duplicate: move on.

**Dutch National Flag** (`QZ.s_dnf`)

1. *(Beginner)* Sort Colors on `[2, 0, 2, 1, 1, 0]` gives?
   - A) `[0, 0, 1, 1, 2, 2]`
   - B) `[2, 2, 1, 1, 0, 0]`
   - C) `[0, 1, 2, 0, 1, 2]`
   - D) `[0, 0, 2, 1, 1, 2]`

   **Answer: A.** One pass with lo, mid, hi (DnfDemo's last line).

2. *(Intermediate)* After swapping a 2 from mid with hi, which pointers move?
   - A) mid++ and hi--
   - B) only hi--
   - C) only mid++
   - D) lo++ and mid++

   **Answer: B.** The value that came from hi into mid has not been checked yet, so mid must stay.

3. *(Intermediate)* Time and space of the Dutch National Flag algorithm?
   - A) O(n log n), O(1)
   - B) O(n), O(1), one pass
   - C) O(n), O(n)
   - D) O(n²), O(1)

   **Answer: B.** Each step moves mid forward or hi backward.

### Lesson 07 quiz (12 questions)

1. *(Beginner)* Which of these does **not** extend `Collection`?
   - A) `List`
   - B) `Set`
   - C) `Queue`
   - D) `Map`

   **Answer: D.** `Map` is a separate hierarchy: it stores key-value pairs, so `add(E)` makes no sense for it. It offers collection *views* instead: `keySet()`, `values()`, `entrySet()`.

2. *(Beginner)* What does this print?
```java
List<Integer> l = new ArrayList<>(List.of(10, 20, 30));
l.remove(1);
System.out.println(l);
```
   - A) `[20, 30]`
   - B) `[10, 30]`
   - C) `[10, 20, 30]`
   - D) `[10, 20]`

   **Answer: B.** `remove(1)` with an `int` argument picks `remove(int index)`, so the element at index 1 (20) goes. To remove the *value* 1 write `l.remove(Integer.valueOf(1))`.

3. *(Beginner)* You need unique elements, always iterated in sorted order. Which class?
   - A) `HashSet`
   - B) `LinkedHashSet`
   - C) `TreeSet`
   - D) `ArrayList`

   **Answer: C.** `TreeSet` is a red-black tree: unique and sorted, O(log n). `LinkedHashSet` keeps *insertion* order; `HashSet` promises no order.

4. *(Intermediate)* What does this print?
```java
Map<String, Integer> m = new HashMap<>();
System.out.println(m.put("a", 1) + " " + m.put("a", 2) + " " + m.size());
```
   - A) `null 1 1`
   - B) `1 2 2`
   - C) `null null 2`
   - D) `true false 1`

   **Answer: A.** `put` returns the **previous** value: `null` for a new key, then 1 when the second put replaces it. The key is the same, so the size stays 1.

5. *(Intermediate)* A `new HashMap<>()` gets keys with well-spread hash codes. Which `put` triggers the first resize?
   - A) The 9th
   - B) The 12th
   - C) The 13th
   - D) The 17th

   **Answer: C.** Capacity 16 × load factor 0.75 = threshold 12. The resize happens when `++size > threshold`, i.e. on the 13th entry; the table doubles to 32.

6. *(Intermediate)* What does this print?
```java
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(4); pq.offer(1); pq.offer(3);
System.out.println(pq);
```
   - A) `[1, 3, 4]`
   - B) `[1, 4, 3]`
   - C) `[4, 1, 3]`
   - D) `[3, 4, 1]`

   **Answer: B.** `toString` shows the heap array, not sorted order. 4 → [4]; 1 sifts up past 4 → [1, 4]; 3 is placed at index 2, its parent 1 is smaller, so it stays → `[1, 4, 3]`. Only `poll()` gives sorted order.

7. *(Intermediate)* What happens?
```java
List<String> f = new ArrayList<>(List.of("a", "b", "c"));
for (String s : f) if (s.equals("b")) f.remove(s);
System.out.println(f);
```
   - A) `ConcurrentModificationException`
   - B) Prints `[a, c]`
   - C) Prints `[a, b, c]`
   - D) Prints `[a]`

   **Answer: B.** "b" is the second-to-last element. After removing it, size is 2 and the iterator's cursor is 2, so `hasNext()` returns false and the loop ends before `next()` can check `modCount`. No exception, and "c" is never visited. Still a bug: use `removeIf`.

8. *(Intermediate)* What is `t.size()`?
```java
Set<String> t = new TreeSet<>(Comparator.comparingInt(String::length));
t.add("cat"); t.add("dog"); t.add("bird");
```
   - A) 3
   - B) 2
   - C) 1
   - D) It throws `ClassCastException`

   **Answer: B.** A TreeSet decides duplicates with the comparator, not `equals`. "dog" has the same length as "cat", so compare returns 0 and it is treated as a duplicate: the set is `[cat, bird]`.

9. *(Advanced)* What does this print?
```java
Map<String, Integer> lru = new LinkedHashMap<>(16, 0.75f, true);
lru.put("a", 1); lru.put("b", 2); lru.put("c", 3);
lru.get("a");
System.out.println(lru.keySet());
```
   - A) `[a, b, c]`
   - B) `[b, c, a]`
   - C) `[c, b, a]`
   - D) `[a, c, b]`

   **Answer: B.** The third constructor argument `true` means **access order**: every `get` moves the entry to the end. That is the basis of an LRU cache (add `removeEldestEntry`).

10. *(Advanced)* Does this compile?
```java
List<? extends Number> nums = new ArrayList<Integer>();
nums.add(1);
```
   - A) Yes, 1 is a Number
   - B) Yes, but it throws `ArrayStoreException`
   - C) No: `incompatible types: int cannot be converted to CAP#1`
   - D) No: wildcards can't be used in variable declarations

   **Answer: C.** `? extends Number` means "some unknown subtype of Number" (javac calls it `CAP#1`). It might be a list of Doubles, so adding an Integer can't be proved safe. Producer extends: read from it, don't write.

11. *(Advanced)* When does a HashMap bucket become a red-black tree?
   - A) As soon as two keys collide
   - B) When it already has 8 nodes, a 9th arrives, and the table has at least 64 buckets (otherwise the table resizes)
   - C) When the load factor passes 0.75
   - D) Never; only `TreeMap` uses trees

   **Answer: B.** `TREEIFY_THRESHOLD` = 8 and `MIN_TREEIFY_CAPACITY` = 64. With a smaller table, `treeifyBin` resizes instead, because spreading the keys usually shortens the chain. In JDK 25, 11 colliding keys in a new map give: resize to 32, resize to 64, then a tree.

12. *(Advanced)* What does this print?
```java
List<String> base = new ArrayList<>(List.of("x"));
List<String> v = Collections.unmodifiableList(base);
List<String> c = List.copyOf(base);
base.add("y");
System.out.println(v.size() + " " + c.size());
```
   - A) `1 1`
   - B) `2 2`
   - C) `2 1`
   - D) It throws `UnsupportedOperationException`

   **Answer: C.** `unmodifiableList` is a read-only **view**: it shows the change made through `base`. `List.copyOf` took an immutable **copy** before the change. Adding to `base` itself is allowed.

**Recall prompts (`RC.l07`)**

- Day 1: Name the four main collection interfaces and one class for each. — List: ArrayList. Set: HashSet. Queue/Deque: ArrayDeque (PriorityQueue). Map: HashMap.
- Day 1: ArrayList vs LinkedList in one line each. — ArrayList: array, O(1) get, O(n) middle insert. LinkedList: nodes, O(1) at the ends, O(n) get.
- Day 1: What does `map.put` return? — The previous value for that key, or `null` if there was none.
- Day 3: Describe `HashMap.put` in four steps. — hashCode → spread (h ^ h>>>16) → index = hash & (n−1) → walk the bucket with equals: replace or append; resize if size > 0.75n.
- Day 3: How do you build an LRU cache with the JDK? — `new LinkedHashMap<>(16, 0.75f, true)` + override `removeEldestEntry` to return `size() > capacity`.
- Day 3: Comparable vs Comparator? — compareTo inside the class (one natural order) vs compare outside (many orders, comparing/thenComparing/reversed).
- Day 7: Why does removing inside a for-each loop throw, and what do you write instead? — The iterator checks modCount against expectedModCount in next(). Use `iterator.remove()` or `removeIf`.
- Day 7: When does a HashMap bin become a tree? — When a bin with 8 nodes gets a 9th and the table has ≥ 64 buckets; with fewer buckets it resizes instead.
- Day 7: HashMap vs synchronizedMap vs ConcurrentHashMap? — Unsafe / one lock for everything / bucket-level locks, lock-free reads, atomic merge/compute, no nulls.

## Course tools — mock interview and complexity cheat sheet (page sections 17–18)

### Mock interview (page section 17, `#mock`)
A timed drill built from all 87 numbered interview questions (every `<details class="d">` with a `.q` badge) in Lessons 00–04. The learner picks lessons (L00–L04, none = all), "Weak only", round size (5/10/20/All) and a timer (Off/45/60/90/120 s). For each question they answer aloud, reveal the model answer (Space, or automatically when time runs out), and rate it: 1 nailed, 2 shaky, 3 missed. Shaky and missed become the weak list. The end screen lists the weak questions with links that open the original answer, and offers "Drill these again". Why: reading an answer and saying it are different skills.

### Complexity cheat sheet (page section 18, `#bigo`)
n = length of the String/array, m = length of the other argument, k = items added. Facts checked against the JDK 25 source (`String.equals`, `StringLatin1.indexOf`, `DualPivotQuicksort`).

| Operation | Time | Extra space | Why / note |
|---|---|---|---|
| `s.length()`, `s.charAt(i)` | O(1) | O(1) | Read from the backing byte[] (LATIN1 or UTF16). |
| `s.equals(t)` | O(n) | O(1) | Same reference, different coder or different length returns at once. |
| `s.hashCode()` | O(n) first call | O(1) | Cached in `hash`; later calls O(1). |
| `s.compareTo(t)` | O(min(n, m)) | O(1) | Stops at the first different char, else length difference. |
| `s.indexOf(t)`, `contains` | O(n·m) worst | O(1) | Naive scan (intrinsified), not KMP. |
| `indexOf(char)` / `startsWith`, `endsWith` | O(n) / O(m) | O(1) | Prefix/suffix only. |
| `s.substring(a, b)` | O(b − a) | O(b − a) | Copies since 7u6. |
| `s + t`, `concat` | O(n + m) | O(n + m) | Always a new String. |
| `s += x` in a loop of k | O(k²) | O(k) live | Use one StringBuilder: O(k). |
| `toCharArray`, `new String(char[])`, `valueOf(char[])` | O(n) | O(n) | Defensive copies. |
| `toUpperCase`, `replace(char,char)`, `strip`, `trim` | O(n) | O(n) | Return `this` when nothing changes. |
| `split`, `replaceAll`, `matches` | O(n) typical | O(n) | Plus regex compile; split fast path for one plain char; backtracking can be worse. |
| `String.join`, `repeat(k)` | O(total) | O(total) | Output length. |
| `intern()` | O(n) average | O(1) or O(n) | Hash + StringTable lookup. |
| `sb.append(x)` | O(1) amortized per char | O(1) amortized | Growth `old*2+2`; pre-size. |
| `sb.charAt`, `setCharAt`, `length` | O(1) | O(1) | |
| `sb.insert(0, x)`, `deleteCharAt(0)` | O(n) | O(1) | Shifts the tail. |
| `sb.reverse()` | O(n) | O(1) | In place, keeps surrogate pairs. |
| `sb.toString()` | O(n) | O(n) | Copy; call once. |
| `a[i]`, `a.length` | O(1) | O(1) | base + i × size; length in header. |
| Linear search, `Arrays.toString/equals/fill` | O(n) | O(1)/O(n) | |
| Insert/delete in the middle | O(n) | O(1) or O(n) | Shift or copy. |
| `clone`, `copyOf`, `arraycopy` | O(n) | O(n) | Shallow. |
| `Arrays.sort(int[])` | O(n log n) | O(log n) to O(n) | Dual-pivot quicksort, heap-sort fallback (no O(n²)); merges long sorted runs with an O(n) buffer; not stable. |
| `Arrays.sort(T[])`, `list.sort` | O(n log n) | O(n) | TimSort, stable, O(n) when sorted. |
| `Arrays.binarySearch` | O(log n) | O(1) | Sorted input only; miss = -(ins) - 1. |
| `Arrays.asList(arr)` | O(1) | O(1) | View; `List.of(arr)` copies O(n). |
| `deepEquals`, `deepToString` | O(total cells) | O(depth)/O(total) | |
| ArrayList `get`, `set` | O(1) | O(1) | Object[] backed. |
| ArrayList `add` at end | O(1) amortized | O(1) amortized | Grows ~1.5×. |
| ArrayList `add(0,x)`, `remove(i)` | O(n) | O(1) | arraycopy shift. |
| ArrayList `contains`, `indexOf`, `remove(Object)` | O(n) | O(1) | Use HashSet for lookups. |
| Two pointers | O(n) | O(1) | |
| Sliding window | O(n) | O(1) or O(alphabet) | Each index enters/leaves once. |
| `int[26]`/`int[128]` counting | O(n) | O(1) | |
| HashMap counting | O(n) average | O(distinct) | |
| Prefix sum build / query | O(n) / O(1) | O(n) | `p[r+1] − p[l]`. |
| Kadane | O(n) | O(1) | |
| Stack (brackets, decode) | O(n) | O(n) | |
| Sort then scan | O(n log n) | O(log n) to O(n) | |
| Group anagrams, sorted key | O(n·k log k) | O(n·k) | Count key: O(n·k). |
| Expand around centres | O(n²) | O(1) | 2n − 1 centres. |
| All substrings, brute force | O(n³) | varies | O(n²) substrings × O(n) each. |

Rule of thumb for n ≈ 10^5: O(n) and O(n log n) are instant; O(n²) ≈ 10^10 steps times out.

## Course tools — "Watch it run" step-through programs (added 2026-10-21)

Seven short programs, each shown on its lesson page as a step-through runner (code with a moving line highlight, stack frames, heap objects with the String pool and the Integer cache, reference arrows, console). Every program was run on JDK 25 and the output below is the real output.

| Lesson · section | Program | Shows | Output |
|---|---|---|---|
| 00 · F2 types | `IntegerCache.java` (`Integer a = 127, b = 127; Integer c = 128, d = 128;`) | `valueOf` cache −128..127: one shared object vs two objects | `true` `false` `true` |
| 00 · F5 methods | `Factorial.java` (`fact(3)`) | one frame per call, base case, frames popped with return values | `6` |
| 00 · F6 pass-by-value | `PassByValue.java` (`change(int x, int[] arr)`) | the copy of `x` changes alone; `arr` and `a` share one array | `1 99` |
| 01 · 04 immutability | `Immutable.java` (`s = s + "!"`) | `"hi"` stays in the pool; `+` builds a new heap String; `t` keeps the old one | `hi!` `hi` `false` |
| 02 · D7 StringBuilder | `Builder.java` (append, append, reverse, toString) | one builder object, capacity 16 never grows, `toString` copies | `skcor avaJ 10 16` |
| 03 · S4 palindromes | `Palindrome.java` (`"abba"`, two pointers) | `i`/`j` move inward until they cross | `true` |
| 04 · A5 copying | `Aliasing.java` (`b = a`, `c = a.clone()`) | alias vs separate copy | `[9, 2, 3]` `[1, 7, 3]` |
| 05 · P1 objects | `Cars.java` (`new Car("Swift")`, `c = a`, `a = new Car("Nexon")`) | object allocated with defaults, constructor frame with `this`, shared reference, re-pointing | `Swift 60` |
| 05 · P6 polymorphism | `Zoo.java` (`Animal a = new Dog(); a.sound()`) | `javac` binds `Animal.sound()`, the JVM runs Dog's override via the klass pointer; then Animal's | `Woof` `...` |

Lesson 05 added two more (2026-10-22), so there are nine. Objects that are neither Strings nor arrays use the generic `k:"box"` heap card (`t` = class name, `v` = a field summary).

## Course tools — analogy layer: memorable real-world pictures (added 2026-10-22)

After the Car Factory (Lesson 05, P1), the user asked for "reasonable things like this all over the document". Every lesson now has interactive **analogy visuals** (`.viz.ol.an`, block "Analogy visuals (v26)" in `course.js`) and short **"💡 Remember it" strips** (`.an-strip`, static HTML). Each visual shows memory-hook chips, the matching Java line for every step, and a message. All are listed in the Ctrl+K palette.

| Lesson · section | Visual | The analogy | What you do / see |
|---|---|---|---|
| 00 · F2 types | Boxes and car keys `#anBoxes` | primitive = the value in a box; reference = a key to a car | 6 steps: `int x = 5; int y = x; y = 9;` (photocopy), `Car a = new Car(); Car b = a; b.paint("red")` (one car, two keys, both see red) |
| 00 · F3 operators | Car odometer `#anOdo` | numbers have fixed digits and roll over | byte / int tabs; ±1, jump to MAX/MIN; bits with the sign bit outlined; 127 + 1 = −128, MAX_VALUE + 1 = MIN_VALUE, tip `Math.addExact` |
| 00 · F4 control | Waterfall `#anFall` | case = step, break = dam | toggle dams, pick x (1/2/3/7), run: water falls through until a break (x = 1 prints AB); arrow switch = separate pools |
| 00 · F5 methods | Stack of plates `#anPlates` | call = plate on, return = plate off | `fact(4)`: plates pushed then popped handing 1, 2, 6, 24 down; without a base case the plates hit the ceiling → StackOverflowError |
| 00 · F6 pass-by-value | Photocopies and spare keys `#anCopy` | argument = photocopy; object argument = spare key | tabs `change(int x)` (your 5 stays 5), `paint(Car c)` (your car turns red), `replace(Car c)` (the method's key now opens car #2; yours still opens car #1) |
| 01 · 5 comparing | Identical twins `#anTwins` | `==` = same person? `equals` = same name? | `a == b` false, `a.equals(b)` true, `c = a` nickname → true, two literals → one pooled person |
| 01 · 8 building | Stone tablets vs a whiteboard `#anTablet` | String = carved tablet; StringBuilder = whiteboard | 5 rounds of `s += i` / `sb.append(i)`: 6 tablets, 5 garbage, 15 chars copied vs 1 board, 5 chars; O(n²) vs O(n) |
| 03 · S6 sliding window | Caterpillar `#anCat` | body = window, head eats (right++), tail lets go (left++) | any string (default "abcabcbb" → 3 "abc"; "pwwkew" → 3 "wke"); a repeat letter flashes red |
| 04 · A1 what is an array | Numbered lockers `#anLockers` | a welded row of numbered lockers | `arr[i]`: the runner jumps straight there (address 1000 + i × 4); linked-list `get(i)` walks door to door; "add a 9th item" → AIOOBE, then `Arrays.copyOf(arr, 16)` |
| 04 · A4 2D arrays | Cinema seats `#anCinema` | rows of seats, each row its own array | click a seat → `seats[r][c]`, click a row → `seats[r]`; jagged toggle (6, 4, 5 seats) |
| 04 · A7 sorting/searching | Guess the number `#anGuess` | binary search = the guessing game | pick 1–100; the range band halves each guess (73 found in 6); log₂ 100 ≈ 6.6 |
| 05 · P4 static | Town clock and wristwatches `#anClock` | static = the town clock; instance = each person's watch | move the town clock → everyone sees it; move one watch → only that person |

"Remember it" strips (one line each, in the lesson text):
- **00 F7:** `System.out` and `System.err` are two separate pipes.
- **01 pool:** the String pool is a shared sticker book; `new String("hi")` prints a fresh copy not in the book. **01 unicode:** an emoji is a two-seater (two `char` seats), so `"😀".length()` is 2.
- **02 D3:** `intern()` = handing your sticker to the shared book (you get the book's copy back). **02 D5:** hashCode is the postcode, equals is checking the face. **02 D7:** a StringBuilder is a suitcase with spare room (`old × 2 + 2`).
- **03 S4:** two pointers = two friends walking toward each other across a bridge. **03 S5:** a frequency array is a tally sheet. **03 S7:** a stack is a stack of plates; each closing bracket must match the top plate.
- **04 A5:** a shallow copy is a photocopied contact list: same people at the other end.
- **05 P2:** the foundation (parent constructor) is poured before the child's walls. **05 P3:** access levels are rooms of a house (bedroom, family home, family including the kids who moved out, front garden). **05 P5:** a Car *is a* Vehicle, *has an* Engine. **05 P6:** same horn button, different vehicles. **05 P8:** hashCode = locker number, equals = opening it and checking. **05 P9:** record = printed receipt, enum = traffic light, sealed = guest list.

## Course tools — learn layer: learning from scratch on every page (added 2026-10-22, v33)

The user asked to "go through as a person who can make this to learn and understand from scratch … make visualization code properly … not only sort, whole html". Block "learn layer (v33)" in `course.js`, CSS `/* learn layer v33 */`; everything works on every page.

- **Glossary hints**: the first time a key term appears in a section (or in the page intro) it gets a dotted underline (`dfn.gl`); hover, focus or tap shows a plain definition in `#glTip` with "Learn more →" (the section that teaches it) and "Hide all hints". Skipped inside code, links, headings, summaries, buttons, visuals and quizzes. Off: `js1-gloss = "0"` (Ctrl+K "Turn glossary hints on/off"). `window.LEARN.gloss()` runs it (once).
- **Before you start** (`details.lx-start` under every lesson title and on Practice; open state in `js1-start-<page>`): You need · You will learn · How to study each section (In 30 seconds → play the visual with ← → Space → run the code → hover dotted words → Mark as understood + quiz → Revise after 1, 3, 7 days) · time.
- **Continue where you left off**: the section being read is saved as `js1-last` ({p, id, n, t, l}); the home page shows "Continue: L03 · S6 Sliding window →" first in the CTA row; also a Ctrl+K command.
- **Keyboard for every step-through visual**: every `.viz` is focusable; ← / → press its Back/Next (`data-a`/`data-s` = back|prev|next|step), Space its Play.
- **Lesson 06 (v33)**: learning path `#bsPath` (12 steps, `js1-path`), the three moves `#bsMoves`, a Sort Lab inside every sort's idea section, a colour key under every lab, 3 Check-yourself questions per sort (`QZ.s_<sort>`), "Next in the path →" buttons at the end of O(n), B14 and every sort's review.
- **Every visual was clicked through**: a headless test on all 9 pages clicks every button, cycles every dropdown and slider and steps 40 times in every visual (34 visuals on Lesson 06): it found and fixed two crashes (explorer `show()` while "Compare all sorts" was selected; the three-moves "without t" toggle on the Shift tab).

| Term | Definition (as shown in the hint) | Learn more |
|---|---|---|
| JVM | Java Virtual Machine: the program that runs Java bytecode. It loads classes, manages memory (heap and stacks), runs the garbage collector and compiles hot code to machine code (JIT). | `f-platform` |
| JDK | Java Development Kit: everything you need to write Java: the compiler javac, the JVM and the standard library. | `f-platform` |
| JRE | Java Runtime Environment: the JVM plus the standard library, enough to run (not compile) Java. Modern JDKs include it. | `f-platform` |
| bytecode | The instructions in a .class file that javac produces. The JVM reads them, not your CPU, so the same .class runs on Windows, Mac and Linux. | `f-platform` |
| JIT | Just-In-Time compiler: part of the JVM that turns often-run bytecode into fast machine code while the program runs. | `f-platform` |
| javac | The Java compiler: turns your .java source file into .class bytecode. | `f-platform` |
| primitive | One of Java's 8 built-in value types: int, long, double, float, char, boolean, byte, short. The variable holds the value itself. | `f-types` |
| reference | A variable of a class type (String, int[], Car…) holds a reference: the address of an object on the heap, not the object. Copying it copies the address, not the object. | `f-types` |
| object | A thing built from a class with new. It lives on the heap and has its own copy of the instance fields. | `o-class` |
| class | A blueprint: it declares the fields (data) and methods (behaviour) that its objects will have. | `o-class` |
| heap | (1) Memory: the area where every object and array lives; the garbage collector cleans it. (2) Data structure: a tree stored in an array where every parent is ≥ its children; used by heap sort and PriorityQueue. | `d-memory` |
| stack | (1) Memory: every running method gets a frame on the call stack with its parameters and local variables; the frame disappears when the method returns. (2) Data structure: last in, first out (push / pop). | `f-methods` |
| garbage collector | The part of the JVM that frees objects no variable can reach any more, so Java code never frees memory by hand. | `d-memory` |
| String pool | A special area where Java keeps one shared copy of each String literal: "hi" written twice in your code is the same object. | `pool` |
| immutable | Cannot change after it is created. Every "change" to a String builds a new String; the old one stays exactly as it was. | `immutable` |
| mutable | Can be changed in place, like a StringBuilder or an array. | `build` |
| index | The position of an element, counted from 0: a[0] is the first element, a[a.length − 1] the last. | `a-what` |
| null | A reference that points to no object. Calling a method on it, or reading a field, throws NullPointerException. | `f-types` |
| NullPointerException | The exception thrown when you use a null reference as if it pointed to an object. | `d-null` |
| exception | An error object thrown when something goes wrong while the program runs (bad index, null, division by zero). If nobody catches it, the program stops and prints a stack trace. | `mistakes` |
| overflow | When a number gets too big for its type and wraps around: Integer.MAX_VALUE + 1 becomes Integer.MIN_VALUE. (StackOverflowError is different: too many nested calls.) | `f-operators` |
| cast | Converting a value to another type, e.g. (int) 3.9 gives 3. Narrowing casts can lose information. | `f-operators` |
| autoboxing | Java converting automatically between a primitive and its wrapper object, e.g. int ↔ Integer. | `f-types` |
| wrapper class | The object version of a primitive: Integer for int, Double for double, Character for char, and so on. | `f-types` |
| constructor | Code that runs once when new creates an object, to set up its fields. It has the class's name and no return type. | `o-ctor` |
| static | Belongs to the class itself, not to one object: there is one shared copy, usable without new. | `o-static` |
| overloading | Several methods with the same name but different parameter lists; javac chooses one from the argument types, at compile time. | `o-poly` |
| overriding | A subclass redefines an inherited method with the same signature; the object's real class decides which version runs, at run time. | `o-poly` |
| polymorphism | One reference type, many object types: a Vehicle variable can hold a Car or a Truck, and each responds in its own way. | `o-poly` |
| encapsulation | Keeping fields private and offering safe methods, so an object's rules can't be broken from outside. | `o-encap` |
| inheritance | A class extends another and reuses its fields and methods (Car extends Vehicle). | `o-inherit` |
| interface | A contract: a list of methods a class promises to provide (implements). A class can implement many interfaces. | `o-abstract` |
| recursion | A method that calls itself on a smaller version of the problem, until a base case stops it. | `f-methods` |
| base case | The simplest input a recursive method answers directly, without calling itself. Without it the recursion never stops. | `f-methods` |
| Big-O | How the work grows when the input size n grows, ignoring constants: O(n) doubles when n doubles, O(n²) becomes four times bigger. | `cx-complexity` |
| time complexity | How the number of steps an algorithm takes grows with the input size n. | `cx-complexity` |
| space complexity | How much extra memory an algorithm needs as n grows: new arrays and collections, plus the call stack. | `cx-complexity` |
| in-place | Uses only O(1) extra memory: it rearranges the input itself instead of building a copy. | `cx-complexity` |
| stable | A stable sort keeps equal elements in their original order (useful when you sort records by one field, then by another). | `bs-generic` |
| adaptive | Runs faster when the input is already nearly sorted. | `bs-flag` |
| pivot | The value quicksort compares everything against: smaller values go to its left, the rest to its right. | `qk-idea` |
| partition | Rearranging an array around a pivot so that all smaller values come before it and the rest after it. | `qk-idea` |
| inversion | A pair of positions i < j with a[i] > a[j]: two values in the wrong order. A sorted array has none. | `bs-special` |
| amortized | The average cost per operation over a long sequence: rare expensive steps are paid for by many cheap ones (ArrayList.add is amortized O(1)). | `cx-complexity` |
| hash code | A number computed from an object's contents. Hash tables use it to pick a bucket, so equal objects must have equal hash codes. | `o-object` |
| HashMap | Finds a value by its key in O(1) on average, by turning the key into an array index with its hash code. | `o-object` |
| binary search | Finding a value in a sorted array by checking the middle and throwing away half each time: O(log n). | `a-sort` |
| two pointers | Two indexes walking the array (often from both ends) so you don't need a nested loop. | `s-palin` |
| sliding window | A range [left, right] that slides along an array or string, adding on one side and removing on the other, so each element is handled O(1) times. | `s-window` |
| regex | A pattern language for matching text, e.g. \d+ means "one or more digits". | `regex` |
| Unicode | The standard that gives every character of every language a number, called a code point. | `unicode` |
| UTF-16 | How Java stores text in char values: most characters take one 16-bit char; emoji and rare characters take two (a surrogate pair). | `unicode` |
| code point | The number Unicode gives one character. One code point can need two Java chars. | `unicode` |
| surrogate pair | Two chars that together encode one character above U+FFFF, such as most emoji. | `unicode` |
| StringBuilder | A mutable string buffer: append many times cheaply, then call toString() once. | `build` |
| pass-by-value | Java always passes a copy: for primitives a copy of the value, for objects a copy of the reference (the method can change the object, but not your variable). | `f-pass` |
| varargs | A parameter like int... nums that accepts any number of arguments; inside the method it is an array. | `a-methods` |
| invariant | A fact that stays true at every step of a loop or algorithm; it is how you prove the algorithm correct. | `bs-dryrun` |
| lexicographic | Dictionary order, compared character by character (in Java by UTF-16 code, so "B" comes before "a"). | `compare` |
| memoization | Storing the results of a function so each input is computed only once (naive Fibonacci goes from O(2ⁿ) to O(n)). | `cx-complexity` |
| Metaspace | Native memory where the JVM keeps class metadata (field layout, method code), separate from the heap. | `d-memory` |
| Comparator | An object that defines an order for sorting: compare(a, b) returns a negative number, zero or a positive number. | `bs-generic` |

## Appendix — page effects internals (moved from CLAUDE.md on 2026-10-21)

These are implementation notes for the course pages' visual effects, not lesson content. They were moved here verbatim to keep `CLAUDE.md` under its size budget; `CLAUDE.md` keeps a one-line summary of each.

- **Lesson 02 on the page:** it is inserted between Practice (15) and Playground (16). It starts with a `.band#deep` banner, followed by sections `#d-memory`, `#d-anatomy`, `#d-scp`, `#d-new`, `#d-equals`, `#d-immutable`, `#d-builder`, `#d-concat`, `#d-methods`, `#d-null`, `#d-tricky`, `#d-qa` and `#d-map`, numbered D1–D13. The nav has the links Deep dive, SCP, Internals and Q&A 2. The scroll-spy observes `section,.band`. New CSS (under `/* lesson 02 */`): `.band .diagram .mem .two .card .steps .timeline .spoil .mref .capctl .capcells .capstat`. **Object-count spoilers:** `.spoil` cells reveal on click or Enter. **StringBuilder capacity simulator** (`#capviz`): start option, append, trimToSize and reset. It uses the real growth rule `max(old*2+2, needed)` and has a demo limit of 300. The checklist `CK` has 7 more items that start with "D:".
- **Lessons 03–04 on the page:** they are inserted after Lesson 02 and before Playground (16). Lesson 03 is the `.band#probs` banner plus sections `#s-approach #s-patterns #s-reverse #s-palin #s-freq #s-window #s-stack #s-classic #s-streams #s-regex #s-qa #s-practice` (S1–S12). Lesson 04 is the `.band#arrays` banner plus `#a-what #a-create #a-memory #a-multi #a-copy #a-util #a-sort #a-methods #a-convert #a-internals #a-patterns #a-mistakes #a-qa #a-practice` (A1–A14). New nav links: Problems, Window, Arrays, Arrays API, Array patterns, Q&A 4. **Algorithm stepper** (JS block "lessons 03–04: algorithm stepper"): `stepper(root, ALGOS, parse)` drives `#sviz` (`S_ALG`: reverse, palindrome, longest unique substring, first unique) and `#aviz` (`A_ALG`: binary search, pair sum, window sum, Kadane, move zeros, rotate, Dutch flag). An algorithm is `{n, d: default input, k?, kl?: label of the k box, run(input, k) → frames}`, and a frame is `FR(values, states, pointers, message, varsHtml)`. Cell states: `read swap done fix win miss`. `[data-arr="1,2,3"]` renders a static array with first/last pointers. New CSS is under `/* lessons 03–04 */`. The Playground gained 7 tasks (Reverse words, Longest unique substring, Valid brackets, Second largest, Move zeros, Max subarray, Rotate array), and the checklist gained 14 "S:"/"A:" items. `STAT.Arrays` now also suggests binarySearch, deepToString, deepEquals, setAll, hashCode, compare, mismatch and parallelSort. The hero, title, brand and footer now read "Java Strings & Arrays · Lessons 01–04".
- **Concept figures** (`<figure class="fig" id="fig-…">` with inline SVG and a caption). They are styled only by the CSS block `/* concept figures */`, so they follow the light/dark tokens. The figures: `#fig-scp1` (literal vs new vs intern: stack → pool / heap, shared byte[], == results) in section 03 above the Pool visualizer; `#fig-immut` (alias + reassignment) in section 04, replacing the old cell rows; `#fig-scp2` (javac constant folding vs runtime concat) and `#fig-scp3` (intern: Java 6 PermGen copy vs Java 7+ reference) in D3; `#fig-arrmem` (stack refs, int[] header/length/values, String[] refs) in A3, replacing the old `.mem` cards; `#fig-copy` (shallow vs deep 2D copy) in A5, rebuilt so rows sit side by side and no arrows cross; `#fig-anatomy` (String object fields → byte[], LATIN1 "hello" vs UTF16 "hi€") in D2; `#fig-hash` (HashMap get: hashCode → bucket 0 → equals walks "Aa", "BB") in D5; `#fig-cap` (StringBuilder capacity 16 → 34 → 70, used vs spare) in D7 above the capacity simulator; `#fig-jagged` (array of arrays, jagged rows, null rows) in A4, replacing the old ASCII sketch; `#fig-pass` (pass-by-value of an array reference: doubleAll vs replace) in A8. Extra figure classes: `.used .free .split`, marker class `mr` (red). SVG text classes are `ft fts fs fst fhd zl`. **Never use `.t .s .k .n .f .cm .hd` inside a figure:** those are global code-highlight and hint classes, and they recolour the text. Arrow classes are `a g|h|ac|no|d`, with markers per figure (`f1g`, `f1h`, …). On narrow screens a figure scrolls sideways (svg min-width 640px). **24 more figures (2026-10-18):** L01 `#fig-cmp` (== vs equals, compareTo walk), `#fig-charnum` (char codes, c - 'a' → int[26]), `#fig-substr` (indexOf, half-open substring), `#fig-concat` (+= loop copies vs one StringBuilder), `#fig-split` (trailing empties, limit -1, split(".")), `#fig-utf` (hi😀 as chars / code points / UTF-8 bytes); L02 `#fig-jvm` (JVM memory map + lazy literal resolution, replaced the old `.mem` cards in D1), `#fig-newbc` (new String bytecode + operand stack), `#fig-count5` (5 objects), `#fig-final` (final vs immutable grid), `#fig-concat2` (+ compiled: folding, 5–8 StringBuilder, 9+ indy), `#fig-sbeq` (StringBuilder equals vs compareTo/contentEquals); L03 `#fig-patterns` (signal → pattern → cost), `#fig-reverse` (two pointers + emoji trap), `#fig-centres` (2n−1 centres), `#fig-count` (int[26] + group anagrams), `#fig-window` (fixed window anagrams), `#fig-brackets` (stack snapshots); L04 `#fig-arrcontig` (contiguous memory, O(n) insert), `#fig-defaults`, `#fig-bsearch` (halving + stable TimSort), `#fig-aslist` (view vs copy, int[] trap), `#fig-covar` (covariance vs generics), `#fig-prefix` (prefix sum). Marker prefixes used: f1–f9, fa, fb, pa, pb, pc, pd; a new figure needs a new prefix. Extra CSS: `.fig .win` (window outline, under `/* L3 figures */`). SVG collapses repeated spaces in text.
- **Time of day:** `THM.PH` phases: early bird 5–9 → Sunset, day 9–17 → Light, evening 17–21 → Dark, night owl 21–5 → Midnight. Theme **"Auto · time"** is the default when `js1-theme` is unset (stored as "auto"; re-checked every minute). **Animated mascot** (CSS/JS blocks "time of day: animated mascot"): `#mascot` sits at the top right of the hero (absolute ≥1000px, floated beside the h1 below that) and shows a hand-drawn SVG **night owl** (17:00–5:00: blinks, looks around, tilts its head, breathes, flaps; moon halo, twinkling stars, shooting star, fireflies) or **early bird** (5:00–17:00: hops, flutters, pecks, chirps with floating ♪ notes, blinks; spinning sun rays, drifting clouds, a bird flying past). Clicking it plays a reaction ("Hoo hoo!" / "Tweet tweet!" bubble + fast flaps), and it greets once after load. The nav `#sky` mini button and the "Song bird · time" caption under the mascot were **removed** on 2026-10-20 at the user’s request (the name and time now appear only in the mascot tooltip). The mascot itself stays, switching by time: bird + sun from 5:00 to 17:00, owl + moon from 17:00 to 5:00. **Flight (2026-10-20):** `fly()` in the mascot block clones the character group (`.b-bird` / `.o-body`) into a fixed `.ms-flyer` (z-index 65) and animates it with the Web Animations API along a Catmull-Rom path through 9 waypoints (take off, sweep left, dive, swing right, land; 8 s). The bird turns to face its direction and both tilt and grow slightly mid-air. While it flies, `#mascot.away` hides the copy on the branch, and on landing it calls `react()`. Flights start on click/Enter, 12 s after load, then every 45–90 s; they are skipped under reduced motion, while the tab is hidden, or when the mascot is off screen. CSS is under "mascot flight" (fast flap keyframes `fl-flapB/L/R`). The greeting card with study tips was **removed** at the user's request ("I asked animation … not some configuration"). Mascot parts use `transform-box: fill-box`; part classes are `o-*` (owl), `b-*` (bird), `m-*` (mini). Theme changes fire a `themechange` event.
- **Fire rider (2026-10-20; 3D since v14, see below):** IIFE `RIDER` just before the mascot block. A flaming-skull rider (an original design, not Marvel's) crosses the bottom of the screen **only when summoned** (ghost button, Ctrl+K "Summon the fire rider" = `RIDER.go()`, or a quiz's `quizdone`). He goes out on the bike (`tricks()`: hop → big jump, 65% a backflip → wheelie → hop; `over(r)` flips over `#heroWin` in slow-mo; `land()` squash + sparks), then a 1.4 s gap, then he comes back the other way on the black stallion. Size `s = clamp(W/2100, .45, .75)`, speed `max(170, W/9)`. **Haunted mode** `haunt()`/`hauntDraw()` (`hz` fades in; `html.haunted`): dark flicker, lightning, moon, bats, cobwebs, ghosts, eyes, mist, graveyard with coffins and racing ghosts. **`SFX`** (Web Audio, `window.SFX`, unlocked on the first click/key; `#sndBtn`, `js1-sound`): engine, thunder, gunshot, thud, hoofbeats, neigh, wail, creak, squeak, owl `hoot()`, `chirp()`, `pop()`, `bells()`. `shake(k)` is a Web Animation; letterbox bars are `html.cine`. **Shooting** (`shoot()`/`fire()`, bullets `B`) hits bats/crows and ghosts; a near miss calls `MASCOT.dodge()`, which sends the bird to hide in the left tree (`#jungleL`, `TREE.perchesL()`), and `MASCOT.home()` brings it back afterwards. Particles `P` (`f` fire, `e` embers, `m` smoke). `PALS` holds one fire palette per theme, so a new theme needs a `PALS` entry. He is skipped when `THM.on` is false, under reduced motion and while the tab is hidden. `dt` is clamped ≥ 0. **Testing:** use CDP with a GPU (see "Checking changes"), or frame-step a standalone page with a fake rAF queue.
- **Ancient tree (2026-10-20, modelled on a photo the user sent of a huge hollow tree).** The IIFE "ancient tree" just before the mascot block, with CSS `/* ancient tree */` and `#jungle` (fixed at right 0, top 56px, 190px wide, z-index 14, hidden below 1200px). A massive gnarled trunk (`edge(u)` = the left outline, bottom → top; it runs off the right screen edge) rises to the mascot branch. There is a big dark hollow at the base (`jgHole` radial, exposed-wood rim `.jg-wd`), a small side hollow, a knot hole, bark fissures and ridges (`.jg-fis/.jg-rid`), moss (`jgMoss`) and dappled sun (`.jg-sun`, blurred, day only), all clipped to the trunk (`jgClip`). Procedural leafy limbs (`branch()` → `limb()` + `leaves()`) reach left and form a crown at the top; shallow limbs sway (`.jg-b`), and a leaf falls every 5.2 s. CSS vars `--jl*` (leaves), `--jb*` (bark), `--jm*`, `--jrim`, `--jwd`, `--jfis`, `--jsun`, `--jearth`; `#jungle.night` darkens everything. The tree uses a seeded random (`seed=11`). It is pinned to the top and rebuilt by a ResizeObserver (headless screenshots change the viewport height). **The user wants it natural:** no nests, vines or decorations (the only animal is the woodpecker they asked for). The Tarzan-style swinger was **removed** at the user’s request. **Realism pass (2026-10-20):** leaves are pointed `LEAF` shapes shaded by position (`shade()`, classes `jl0–jl4`, `--jl4` = sunlit), branch tips end in `clump()` foliage masses (dark volume ellipses + leaves), three crown clumps sit at the top, and branch length is shortened so tips stay at x ≥ 32 (no clipped leaves). Bark gets stretched-noise texture filters `jgTexD`/`jgTexL` (`.jg-texl` opacity `--jtexl`) and a blurred edge shadow/highlight along the left outline. **Woodpecker:** a great spotted woodpecker (`woodpecker()`, group `.jg-wp`, head `.jg-wph`, chips `.jg-chip.c0–2`) lives in the enlarged knot hole (scale 1.25, clip `jgWpc` = hole ∪ the bark left of it, inner shadow `jgHoleIn`). 11 s cycle: hidden → peeks → leans out → two drumming bursts with flying wood chips → looks around → ducks back; the head/chip keyframes are generated in JS into an SVG `<style>`. At night it just peeks, still.
- **Weather (2026-10-20)** — CSS `/* weather (WX) … */` after the ghost-button CSS; JS IIFE `WX` just before "enhancements v3". Default mode **Live** (v9, 2026-10-21): place = typed city (picker form → Open-Meteo geocoding) > browser geolocation (saved 6 h in `js1-wx-loc` so other pages don't re-ask; file:// pages often can't get it) > approximate from the network (ipapi.co). Conditions from Open-Meteo (current + last 15-min precipitation; precipitation > 0 forces rain) **and** wttr.in (`WWO` map); the wetter one wins (`RANK`), cached 10 min in `js1-wx-live` (`{kind,lvl,desc,temp,wind,day,place,src,t}`). The user is in Nellore; both services are model/station based and can miss a local shower. **Sound** (`AMB` in WX, uses `SFX.ac/out/noise/drop/cricket/chirp`): rain hiss layers + drop ticks, thunder after each storm flash, wind gusts (LFOs), birds by day / crickets at night when clear; starts after the first click (`sfxready` event), 🔊 mutes. Nav button `#wxBtn` (emoji of the current weather, before `#theme`) opens a `.thm`-styled picker: Live, Clear, Cloudy, Rain, Storm, Snow, Fog, Windy, Off + intensity Auto/Light/Medium/Heavy (`js1-wx`, `js1-wx-lvl`). Canvas `#wx` (z-index 16, ~30 fps, paused when hidden, off under reduced motion) draws rain streaks + splashes, storm lightning (bolt + flash), snow, fog banks, drifting clouds, blown leaves (wind ≥ 28 km/h or Windy), plus a faint veil in light themes. The tree gets `wx-wet` / `wx-snow` (top leaves turn white) / `wx-fog` / `wx-wind` (gust sway); the mascot gets `wx-c1` (cloud beside the sun/moon), `wx-c2` (dark cloud hides it), `wx-c3` (snow cloud) via the `.ms-wxc` cloud (`WXC` in both mascot SVGs). Ctrl+K has "Weather: …" commands.
- **Ghost button + bird plumage (2026-10-20):** `#ghostBtn` (SVG ghost, inserted in the RIDER block) summons the rider, glows while he rides, and a ghost `.gh-pop` floats out on each click. The early bird is a real-proportion songbird (single smooth outline, wing hinged at the shoulder — `transform-origin:92% 8%`, layered tail) whose colours come from `PLUM` (Robin, Bluebird, Cardinal, Goldfinch, Kingfisher); each click switches to the next (`js1-bird`), and `plumage()` writes the gradient stops (`msRB/msRO/msRF/msRW/msRT`, all `userSpaceOnUse` so head and body join without a seam). Patches are clipped by `msCB`/`msCH`.
- **Tree wildlife (2026-10-21):** block "tree wildlife" inside the ancient-tree IIFE (just before `build();buildL();`), CSS `/* tree wildlife */` at the end of `course.css`. By day 4 songbirds on the big tree + 2 on the left one (`SPC`: house sparrow, great tit, blue tit, chaffinch, drawn by `birdSvg()`), by night 3 + 2 bats (`batSvg()`: wrapped wings, hanging head-down under the limb, eye shine, moonlit rim). Each animal is `div.cr` (zero size, in `.cr-host` on top of the tree layers) > `div.cr-f` (flip `.r` = facing right) > a small SVG; parts pivot with `piv()`. Perches come from `branch()` (`[x,y,w]`; big tree: y>200 and left of the trunk via `edgeAt`). One 800 ms tick picks actions: birds turn, peck, preen, tilt, flick, hop, fly a bounding arc to a free limb (`flyBird`); bats stretch a wing, look, sway, drop and flutter an erratic Catmull-Rom loop (`flyBat`). Moves are WAAPI transforms on the div (compositor only); nothing animates inside the tree SVGs (the peer's motion v9 `layerize()` rule). `mode()` respawns them (`spawn(T)`) when day/night flips; skipped while hidden, under reduced motion or with `THM.on` false.
- **3D rider (v14, 2026-10-21):** real CC BY 4.0 Sketchfab models the user downloaded: cruiser (Alpha One), Skeleton Lord (DJMaesen) and Horse (henrysteve973; only the Gallop and Buck_1 clips are kept). They are packed as base64 GLB in `assets/models/{bike,rider,horse}.js` (`window.MODELS[name]`, ~22 MB), because file:// pages can't fetch .gltf files and WebGL rejects file:// images. The pipeline is scratchpad `tex.ps1` + `pack.mjs`: textures go to 1024 px (base colour) and 512 px (other maps) as JPEG, and unused clips are pruned. Module `R3` inside RIDER: three.js r147 + GLTFLoader from jsDelivr, loaded on the first summon or on ghost-button hover. `go()` waits up to 12 s and then calls `go0()`. Canvases: `#riderLow` (z69: haunt, smoke, glow) < `#rider3d` (z70) < `#rider` (z71: fire, embers, bullets). `R3.bike/horse(run)` place the models from the 2D state (pivot, tilt, squash, yaw ±.28). The rider is seated by two-bone IK (`ik()`/`aim()`); the gun arm follows `r.aim`, and `r.arm` raises the fist. Test hook: `window.RIDER3D`. Every page footer has a `.credits` line. **Removed at the user's request:** the chain catch (`r.ch={st:"off"}`), the werewolf (`wolf:{st:"gone"}`; `R3.wolf` is unused, guarded by `WF.rig`), and the original downloads. **v15 additions:** a soft teardrop flame shader (pool `FL`, 8 planes, additive) on the helmet, wheels, exhaust, mane and tail. The horse **rears at the moon** at 40% of its pass: the Buck_1 clip plus a procedural rear about the hind hooves (`r.rear`, `pv=[-46,0]`, angle down to −0.62), with thunder, a neigh, a shake and the fist up. A **cinematic zoom** (`camZ`, CSS `scale()` on the three rider canvases) goes to 1.17 in the bike's slow-mo flip and 1.12 while rearing. He **shoots ghosts** every 1.6–2.6 s (`r.ghT`, a lead-aimed `fire(...,{gh})`): a hit ghost bursts into green mist with `SFX.wail`.
- **Inferno ride (v16, 2026-10-21):** block "v16 inferno" in RIDER, before `hauntDraw`; `inferno(dt,T)` runs right after `hauntDraw` on `#riderLow` (above the trees, below the 3D rider). Every flame is a `tongue(x,y,h,w,ph)` emitter for the **v18 particle fire** (the drawn teardrops looked artificial): `flushT(T,a,dt)` spawns soft sprites (`fireSprites()`: 24 heat steps from `pal.f[1]` to `pal.f[4]` + a smoke sprite, per palette) that rise with buoyancy, lick sideways in turbulence and are pulled back to the flame axis. They are drawn additively into a half-resolution buffer `FC` that is scaled up so they melt into one glowing volume; fire-lit smoke (`SM`) rises from flames taller than 24 px. Budget: 3200 flame + 260 smoke particles, with emission scaled evenly when full. The rider's own `P` fire particles use the same heat sprites. Tune the look on a standalone page that steps `flushT` (scratchpad `firetest.html`). (1) **Road:** a burn spot every 20 px behind the wheels/hooves (`hs.road`, random heights `hv/h2`), flames 3.4 s then a glowing lava crack at y = H−9, plus a ground glow. (2) **Coffins** he passes ignite (`c.burn`; `c.px/py/hh/w` are stored by the coffin draw): tongues up both sides and over the top, glow, sparks; the wood chars with ember edges. (3) The graveyard's **dead trees** light at their tips (`g.bt`, `g.fp`). (4) The **big trees**: `TREE.fire("R"|"L")` returns [x,y,size] for leaf clumps (`tips`/`tipL`), limbs and trunk points (`trunkR`/`trunkL`, set in build/buildL). A tree lights when he passes it, and the fire climbs from the base (delay ∝ height, 2.4 s) with three tongues and a glow sprite (`glowSprite()`) per point; after 1.1 s the tree gets `.burning` (CSS: ember-orange leaves, charred bark). Everything fades 1.6 s after the ride ends (`h.gone`), and `.burning` is cleared then, in `haunt()` and when the haunt ends. The letterbox bars are now z 68, under `#riderLow`, so the graveyard and the burning road show on the black floor. **Testing:** `RIDER` is block-scoped; summon him with `document.getElementById("ghostBtn").click()`.
- **Art pass v19 "Hell Ride" (2026-10-21, user: "looks very cheap … act as a professional visual artist, make a prompt and enhance").** The brief (critique → target look) is in the change log. (1) **GPU fire** `GF` (in RIDER, before the v18 particle fire): canvas `#fireGL` (WebGL2, half resolution, z 70, inserted before `#rider`, so `#rider3d` covers it). Each `tongue()` is one instanced quad (`aI` = x, y, w, h; `aJ` = seed, alpha) whose fragment shader draws a procedural flame: two domain-warped fbm layers scroll up, bend and tear the tips; the silhouette narrows with height; colour is a blackbody ramp from `pal.f`; there's a soft bloom fading to 0 at the quad edge. Output is premultiplied with alpha 0, so it composites additively. `flushT` uses it when `GF.init(cv)` succeeds and otherwise falls back to the 2D particle fire. Flames are fewer and bigger so they merge: trees 1 per point (h = 7s, w = 2.1s), road h 95·s, w 24·s, plus firelight pools (`glowSprite`) instead of a rectangle. `GF.clear()` runs when the haunt ends; it is in the camera-zoom list. Tune it on a standalone page (scratchpad `gputest.html`, Chrome with `--use-angle=d3d11 --enable-gpu`). (2) **Grade:** a vertical blue-black gradient (warm only at the horizon) plus a heavier vignette instead of the flat purple wash. (3) **Moon:** `moonSprite()` (limb darkening, maria, seeded craters) with a corona and an atmospheric halo (3 radial layers); moonlit cloud banks from `cloudSprite(k)` replace the black ellipses. (4) Mist and fog are desaturated moonlit blue-grey (no neon green or purple). (5) `batShape()`: real bat silhouettes (ears, scalloped membranes). (6) Embers are glowing motion streaks.
- **Ghosts v17 (2026-10-21):** one painter, `ghostPaint(ctx,x,y,S,dir,t,alpha,{lean,mouth,arms,ph,tint,light})` (in RIDER, also `window.ghostPaint`). It draws a glowing aura sprite (`gSprite`), a domed body fading into 5 tattered tendrils that trail with `lean`, wispy arms (far arm behind the body), slanted hollow eyes with glowing pupils, a mouth that opens into a wail, and blinks. S = head radius in px; `dir` between −1 and 1 squashes it while it turns; `tint` = green; `light` = outline for light pages. Each face shape needs its own path (`ellipse()` doesn't start a subpath). **Ride:** `hs.ghosts` = 8 `roamer()`s that materialise in place (fade in, grow) and steer to a new random point every 2–4 s. Every 5–9 s one swoops at the viewer (×6, fades) or circles the moon; within 300 px of the rider they flee screaming with arms up. `shoot()` also targets them (hit → `mist()`, back 2.6 s later), and coffin runners use the same painter. **Halloween mode:** `ghostsOn()` in HALLOWEEN adds canvas `#hwg` (z −1, behind the content, ~30 fps) with 4 ghosts that wander and shy away from the mouse pointer; it is hidden while `html.cine`.
- **Festivals + sky play (v15, 2026-10-21):** IIFE `FEST` (`window.FEST`) at the end of `course.js`, CSS "v15 festivals" at the end of `course.css`. One canvas `#fest` (z66) runs only while something is in flight. It handles rockets → `burst()` (sparks, rings, twinkle), paper sky `lantern()`s, `star()`, `bolt()` and an extras list `X` (snow, sleigh). **Diwali** (auto ±5 days around the date in `DIWALI` {2026: 8 Nov … 2030}; `js1-diwali` "" auto / "1" / "0"): SVG diyas with flickering flames on the tree limbs (`#diwali`, z15) plus a ground row and a self-drawing, slowly turning rangoli **behind** the content (`#diwaliLow`, z −1), lanterns rising and random fireworks every 2.6–5.2 s. **Christmas** (auto 15 Dec – 1 Jan; `js1-xmas`): canvas snow, twinkling bulbs on every perch (`#xmas .xl`), and a sleigh with 4 reindeer (red-nosed leader) crossing the sky every 28–45 s with `SFX.bells`. **Click the sky** (a click on body, `.wrap`, a section, a band, the sky or a tree, with no text selected): lightning in Storm weather, a firework (65%) or shooting star at night or in Diwali mode, golden sparkles by day. **Easter egg:** typing `java` outside inputs and editors shows a coffee cup whose steam spells "Java", plus brown confetti and the mascot saying "Fresh Java! ☕" (`MASCOT.say` is now exposed). `SFX.pop` (thump + crackle) and `SFX.bells` are new. Ctrl+K has Diwali/Christmas on/off/auto and "Launch fireworks". Everything is off under reduced motion and in print. **Needs downloads (not built):** a 3D owl and songbird mascot, and a daytime phoenix/eagle summon (links were given to the user).
- **Road fire v19.1 (2026-10-21):** the burn spots are no longer evenly spaced. Each gap is random (14–46 px × scale, `h.gap`); heights follow a slow wave envelope along x (`h.e1/h.e2`) times a random factor, with a 12% chance of a big flare (×1.4–1.9); widths vary (`wv`, 0.6–1.7); fresh flames start 15% taller and shrink by up to 40% as they age; the second tongue is offset ±14 px. The result reads as a natural fire front instead of a comb.
- **Ghost sizes (2026-10-21, user: "ghosts size is more"):** head radius is now 12·s for the ride roamers (s 0.85–1.25, so about 10–15 px; the mist matches), 16·g.s for the coffin runners, and 13·s for the Halloween background ghosts (were 20, 23 and 22). Swooping ghosts still grow ×6 from the smaller base.
- **Polish v20 (2026-10-21, user: "what else can we improve"):** (1) the moon sits in the open sky right of the hero (`W*0.62–0.78`, `H*0.10–0.17`), away from the heading. (2) A burning tree rises above the night overlay: `.burning` gives `#jungle`/`#jungleL` z-index 69 with charred colours (black bark, ember leaves, `--jl4` glowing), so `#riderLow` is now z 68 and the letterbox bars z 67. (3) Graveyard trees are gnarled: each branch in `dead()` carries a control point (`[x0,y0,x1,y1,w,qx,qy]`, drawn with quadraticCurveTo); near trees are bigger (length 48–84, width 5–9, depth 5), the far row is fogged blue-grey (length 36–64), and a fog band separates the two rows. (4) Coffin lids get plank seams, a moonlit bevel and 4 nails. (5) The grade is about 8% lighter, so the page stays faintly readable. (6) Adaptive quality `lowQ`: when the frame-time average stays above 30 ms for 1.5 s of a ride, it halves the tree flames, drops the second road flame, renders the GPU fire at 0.34 resolution and caps particles at 350, for the rest of the session. (7) `TREE.fire` only returns points inside the tree box (clipped tips used to make fire float in mid-air). (8) The camera zoom also scales `#jungle`/`#jungleL` (each element's untransformed rect `c._b` is cached so the zoom centre follows the rider), so the fire stays on its tree.
- **Cinematic tier v21 (2026-10-21, user: "enhance this more … the best"):** (1) **GPU smoke plumes:** a second instanced program inside `GF` (shaders `SVS`/`SFS`, instance data x, y = plume base, w, h, seed, alpha) draws billowing smoke before the fire with premultiplied normal blending: domain-warped fbm that widens and drifts with height, dark grey with lighter billows, moonlit tops, lit orange from below (`c2`). Emitters go through `plume(x,y,w,h,seed,al)` into `SKS` (passed to `GF.draw(...,SKS)`): two crown plumes and one trunk plume per burning tree, one per burning coffin, one per burning dead tree, and one over every 6th road spot (not in `lowQ`). The 2D `SM` smoke now runs only without WebGL2. (2) **Lightning:** `mkBolt()` builds a midpoint-displacement bolt (depth 7) from the clouds to 42–70% of the height, plus 3 forks; it is drawn for 0.42 s with a flicker (on, off, on, fade) in 3 additive passes (glow 16 px, body 6 px, white core 2 px). The screen flash is cooler and briefer (200,215,255 at 0.2). (3) **Firelight that breathes:** a full-screen additive `pal.g` wash scaled by the number of active flames, pulsing with two sines. (4) **Film grain:** a 160 px noise pattern `GR` on `#rider` at 0.35·hz with a random offset every frame (off in `lowQ`). (5) **Title card:** `title()` in RIDER adds `.ride-title` ("THE FIRE RIDER" / "rides tonight", ember gradient text, a dark radial backdrop, a flicker-in, 4.4 s) when he is summoned; CSS "v21 opening title card".
- **v22 interactive scene (2026-10-21):** in RIDER: `splash(x,y)` on pointerdown during a ride (water drops `HW`, a ring, steam `STM` via `steamSprite()`, `SFX.splash/hiss`): road spots within 95 px jump to dying, tree points within 90 px get `p.ex`, coffins `c.ex`, dead trees `g.ex`; ghosts within 55 px die (mist), within 170 px are pushed away screaming. `rainy()` reads `WX.mode`/`WX.live.kind`; when wet, `FK` shrinks tongue height to 60%, road fires age faster, and trees steam and hiss. **Scroll rider** (IIFE at the end of course.js, lesson pages only via `document.body.dataset.page`, since `PAGE` is block-scoped there): `#scrollRider` (rail, burning trail `scaleX`, SVG bike with flame, wheels spin while scrolling, flips when scrolling up, a burst at 100%), placed under the first `.wrap>section`.
- **v23 Memory Lab** (`#mlApp`, practice section 19): `MLC.run(src)` interprets a subset of Java (declarations, assignments, arrays, String/StringBuilder/Integer, == / equals, intern, clone, Arrays.toString/sort/fill, static methods with params and return, println, System.gc) into snapshots `{line,msg,hot,frames,heap,out}`; zones pool/cache/heap; GC marks then sweeps; no if/loops (friendly error). The UI reuses the runner's `.rz-*` look, has an editable textarea with a gliding line bar, Step/Back/Run/Reset/Run GC, 7 examples, and saves code in `js1-memlab`. Example outputs were checked on JDK 25. **Algorithm race** (`#raceApp`, section 20): bubble, selection, insertion, merge, quick (last pivot), heap; traces of c/s/w/d ops replayed at the same ops per frame; data random/nearly/reversed/few; sizes 16–128; verdict notes per algorithm and data pattern. Revise and Feedback are sections 21–22.
- **v24 OOP labs (2026-10-22, user: "concept visualization i am expecting"):** block "OOP labs (v24)" before `/* sky (v13)` in `course.js`, CSS `/* OOP labs v24 */` at the end of `course.css`. Helpers: `codeBlock(lines, cls)` (dark code pane via `hl()`), `player()` (cancellable async play: `go/ok/stop`), `arrows(host, svg, [[from,to,cls]])` (curved reference arrows in an SVG overlay, redrawn on resize), `pulse`/`shake` (WAAPI). Each lab is guarded by its host id. Class-name traps found while building: the global `.c` rule (key-cap style, height 44px) squashed a code pane named `c`, and the global `.good`/`.bad` text colours tinted whole panels, so lab state classes are `ol-ok`/`ol-bad` and panes `ol-p`/`ol-c`. The dispatch simulator auto-runs once when it scrolls into view (IntersectionObserver). Labs are hidden in print and lose animations under reduced motion. Palette (Ctrl+K) lists all ten under Tools.
- **v25 car story (2026-10-22, user: "object is a car, class is a blueprint … so it should remember long"):** block "OOP car story (v25)" after the v24 labs in `course.js`, CSS `/* OOP car story v25 */`, prefix `olf-`. `carSvg(color, kind, blue)` draws a 164×80 car / truck / ev / chassis (paint via the CSS variable `--paint`; `blue` = dashed blueprint drawing); wheels spin with `.olf-go` (`transform-box:fill-box`); `horn(kind)` is a tiny Web Audio horn, played only after a click and only when `js1-sound` is not "0". Bug met: a class name shared by an SVG rect and an HTML grid (`olf-tl`) gave the rect `width:100%` (SVG2 geometry from CSS), so the taillight is `olf-tail`. Test scripts injected by `shotlab.mjs` must not redeclare `s`.
- **v26 analogy layer (2026-10-22, user: "like this add reasonable things all over the document"):** block "Analogy visuals (v26)" (before `/* sky (v13)`), CSS `/* analogy visuals v26 */`. Hosts are `.viz.ol.an` (the `ol` class gives them the v24 header and control styles). Helpers inside the block: `mount(id, title, sub, hooks, body)` (header + hook chips + `.an-foot`), `stepper(host, frames, init, render, unhot)` (Back / Play / Next over frames `{code, msg, apply(state)}`; the state is rebuilt from `init()` by replaying frames, and `unhot` clears highlights before the current frame; its click listener sits on `.an-foot`, so replacing the foot drops it, which the tabbed visuals rely on). The car drawing comes from v25 through the shared `OLF` object (`OLF.carSvg`), set on every page. Class traps again: the global `.empty` rule, so empty lockers are `.vac`.
- **v27 motion switch (2026-10-22, user: "stop all animations … on and off buttons"):** `#motionBtn` in the nav (before ◐), and a Ctrl+K command, toggles `js1-motion` and reloads (effects read the setting once at start). With it off, `course.js` patches `window.matchMedia` so any `prefers-reduced-motion: reduce` query matches (every effect already has a still path: ∞ background draws one frame, trees/mascot/sky freeze, weather, festivals, Halloween and the scroll rider stay off, confetti is skipped), patches `Element.prototype.animate` to duration 0 (WAAPI moves jump to their end), and adds `html.no-motion`; `motion.mjs` generated that CSS by copying every `@media (prefers-reduced-motion)` rule with the `html.no-motion` prefix, plus a rule for `::before/::after`. Headless check with `document.getAnimations()`: home 86 running → 0, Lesson 05 84 → 0, Lesson 00 69 → 0.
