# Lesson 00 — Java Foundations: Platform, Types, Operators, Methods

**Concept labs (v35, 2026-10-23, `assets/labs/labs-foundations.js`, CSS `/* foundations labs v35 */`, classes `fd-`):** the lesson is taught by its visuals, with short text around them. F1 `#fdPipe` (javac → bytecode → every OS → inside the JVM, 10 steps) and `#fdKit` (JDK ⊃ JRE ⊃ JVM); F2 `#fdTypes` (the 8 primitives as bit bars: click for size, range, default, literal, wrapper, use; 8 "which type would you pick?" questions); F3 `#fdCast` (one value through int → long, int → byte with the cut bits, double → int, char → int, int overflow, 7 / 2, `b += 1`, huge double → int; every result run on JDK 25); F4 `#fdFlow` (a switch as a ladder a ball falls through; break toggles per case, arrow-form switch; the generated code updates live); F5 `#fdOverload` (overload resolution in 3 phases for 9 calls, including the ambiguous `f(null)`). The earlier analogy visuals (`#anBoxes #anOdo #anFall #anPlates #anCopy`) stay. Keys ← → Space work in every lab (`data-s`).

*How Java runs and the language basics that every later lesson assumes: the JDK, JRE and JVM, primitives and references, operators and casting, control flow, methods and recursion, pass-by-value, and packages and I/O. On the page it comes first (band `#found`, sections F1–F8), before Lesson 01. 12 programs, all run on JDK 25.*

## Table of Contents

1. The Java platform: JDK, JRE, JVM and bytecode
2. Variables and types: primitives vs references
3. Operators, casting and arithmetic traps
4. Control flow: if, switch and loops
5. Methods, overloading, scope and recursion
6. Pass-by-value: what really happens to arguments
7. Packages, imports, input/output and the command line
8. Foundations: interview questions and review

---

## 1. The Java platform: JDK, JRE, JVM and bytecode

**In 30 seconds:** you write `Hello.java`. `javac` turns it **once** into `Hello.class`: **bytecode**. That one file runs on Windows, Linux and macOS, because each has its own **JVM** that reads bytecode. The JVM starts by **interpreting** it, then **compiles the hot parts** to machine code (the JIT). **JDK** = the tools to write Java · **JRE** = what is needed to run it · **JVM** = the engine inside both.

**Taught by two labs** (`assets/labs/labs-foundations.js`, v35, 2026-10-23; the static `#fig-pipeline` figure was removed because the lab replaced it):

- `#fdPipe` **From your text to a running program**, a 10-step player: Hello.java → `javac` checks every type (a mistake stops here: compile error) → Hello.class with the real bytecode `iload_0 iload_1 iadd ireturn` → the same file lights up Windows, Linux and macOS machines, each with its own JVM ("write once, run anywhere"; the JVM is the part that is *not* portable) → inside one JVM: class loader (lazy, on first use) → verifier (a hostile .class cannot crash the JVM) → interpreter prints `2 + 3 = 5` → `add()` is called 10,000 times, a per-method counter makes it **hot** → the JIT compiles it to native code for this CPU and swaps it in ("compiled *and* interpreted"; why Java gets faster after warm-up) → memory while running: heap (objects), one stack per thread (method calls), Metaspace (loaded classes).
- `#fdKit` **Three names, one picture**: JDK ⊃ JRE ⊃ JVM as nested boxes. Click a box, or choose who you are: "I write Java code" → JDK, "I only run a Java app" → JRE, "what runs the bytecode?" → JVM. JVM = class loader, verifier, interpreter, JIT, garbage collector; one build per OS/CPU. JRE = JVM + the standard library (`java.lang`, `java.util`, `java.io`, `java.time`…); not shipped separately by Oracle since Java 11, but still the interview word. JDK = JRE + `javac`, `javap`, `jshell`, `jar`, `jcmd`, `jlink`.

**Remember it:** bytecode is **sheet music**. `javac` writes it down once. Every JVM is a musician who reads the same sheet on their own instrument (the CPU), and a piece played often is learned **by heart**: that is the JIT.

**Try it:** type `Add.java` (the file name must match the `public` class) and run it. On the page the bytecode excerpt and the LTS table are collapsed under "Go deeper".

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

**Go deeper (collapsed on the page):** `javap -c Add` (JDK 25, class-file major version 69). Bytecode is a tiny stack machine: push values, operate, pop the result.

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

## 2. Variables and types: primitives vs references

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

## 3. Operators, casting and arithmetic traps

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

## 4. Control flow: if, switch and loops

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

## 5. Methods, overloading, scope and recursion

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

## 6. Pass-by-value: what really happens to arguments

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

## 7. Packages, imports, input/output and the command line

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

## 8. Foundations: interview questions and review

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
