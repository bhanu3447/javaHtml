# Lesson 01 — Java Strings: From Zero to Advanced

*This lesson covers everything about `String`, from "what is it?" to its internals. Later lessons (problems such as reversal, palindromes and anagrams) build on it.*

> Read it top to bottom the first time. For revision, use **Section 16**.
> All code has been compiled and run on JDK 25. The output is shown in the comments.

## Table of Contents

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

## 1. What is a String?

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

## 2. Creating Strings

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

## 3. Memory and the String Pool

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

## 4. Immutability

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

## 5. Comparing Strings

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

## 6. Characters, indexes and length

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

## 7. Essential String methods

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

## 8. Building Strings: `+`, `StringBuilder`, `StringBuffer`, joining

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

## 9. Conversions

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

## 10. Formatting and text blocks

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

## 11. Regex with Strings

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

## 12. Unicode, encoding and internals

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

## 13. Common mistakes

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

## 14. Interview questions

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

## 15. Practice

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

## 16. Revision

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

## 17. Playground and live editor

The course page `java/lessons/01-strings.html` mirrors this lesson. It has these interactive parts:

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

## 18. Your feedback

Rate each from 1 to 5 and add comments: visual explanation, depth, code quality, interview coverage, and overall usefulness. Then tell me which topic should come next. Suggested order: String problems (reversal, palindrome, anagram, frequency) → `StringBuilder` deep dive → regex → Unicode.


---
