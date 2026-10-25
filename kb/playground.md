# Java Visual Playground

Page: `java/playground.html` (`body data-page="pg" data-name="Playground" data-short="PG" class="pg-page"`). Scripts, in order: `course-index, quiz-data, course, effects, jvm-lite, playground, run-java`. Built 2026-10-25 from `playground-build-prompt.txt` (full scope, all five phases).

| File | Role |
|---|---|
| `assets/js/jvm-lite.js` | Lexer, parser, tree-walking interpreter and step recorder. No DOM code. Global: `window.JVML = {run, state, parse, lex, version}`. |
| `assets/js/playground.js` | The UI: editor access, Visualize, step controls, stack and heap drawing, SVG arrows, console, Why line, examples, share links, persistence. One IIFE; test hook `window.PGV` (`run`, `go(k)`, `result`, `step`). `PG` is taken: course.js has a top-level `const PG`. |
| `assets/css/course.css` | Block `/* playground v1 */` at the end: only `pg-` classes (box kinds are `pg-k-<kind>`), theme tokens, ≤980 px stacked, ≤600 px phone, reduced motion. |
| `assets/js/run-java.js` | The real-JDK Run (Wandbox). The Playground editor `#pgv .code` is attached with `opts.fileOf` (file name from the public class), `opts.stdin` (the page's Input box) and `opts.noKey` (Ctrl+Enter stays Visualize); the toolbar button calls `box._run()`. |
| `scripts/build-index.mjs` | Adds `java/playground.html` after the lessons, so every page's nav shows **PG**. |

## How it works

1. **Lexer** (`lex`): Java tokens with line numbers. `>` is never merged by the lexer (the parser joins `> >`, `> > >`, `> >=` when the tokens touch), so `List<List<Integer>>` closes cleanly. Text blocks follow the JLS (incidental indentation, trailing spaces, `\` line joins, `\s`). Int literals are range-checked (`2147483648` only after unary minus); hex/binary/octal wrap like javac.
2. **Parser** (`parse`): recursive descent to an AST of plain objects `{k: "Kind", line, …}`. Statements: `Block Local ExprS If While Do For ForEach Labeled Return Break Continue Yield Throw Try Switch Sync Assert CtorCall Empty`. Expressions: `Lit Name Field Call Index New NewArr ArrInit Assign Bin Un PreInc PostInc Cast Cond InstOf Lambda MRef This Super Switch ClassLit Paren`. String concatenation of literals is folded at parse time (so `"hel" + "lo"` is one pooled literal, as with javac). Casts vs parenthesised expressions and lambdas are detected by look-ahead.
3. **Interpreter** (`class VM`): values are `number` (int/short/byte), `BigInt` (long), `JDbl`, `JFlt`, `JChr`, `boolean`, `null`, and `HObj` heap objects (`kind`: `obj str box arr lambda list deque pq map set view entry iter sb scanner random opt stream coll ps clsobj misc`). Arithmetic follows Java exactly (int overflow with `|0` and `Math.imul`, long with `BigInt.asIntN(64)`, float with `Math.fround`, `/ by zero`, shifts masked to 31/63, compound assignment narrows, char arithmetic). `Double.toString`/`Float.toString` use the shortest round-trip digits plus Java's two-digit rule (`4.9E-324`). `%f` rounds HALF_UP on the shortest decimal, like `java.util.Formatter` (`2.675` → `2.68`).
4. **Classes**: fields with defaults, constructors with `this(…)`/`super(…)`, field initialisers and instance blocks in source order, static fields and blocks (initialised on first use, parent first), inheritance with dynamic dispatch, `super.m()`, `Iface.super.m()`, abstract classes, interfaces with default and static methods, nested static and inner classes (outer instance kept), anonymous classes (named `Main$1`, captured locals), lambdas and method references (`Type::static`, `Type::instance`, `expr::m`, `Type::new`, `int[]::new`), enums (fields, constructors, methods, constant bodies, `values() valueOf() ordinal() compareTo() name()`, switch), records (canonical and compact constructors, accessors, `toString equals hashCode`), generics (parsed, erased). Overloads are picked by scoring the argument values against parameter types (exact < widening < boxing < Object < varargs).
5. **Library** (JS, matching the JDK): String (pooled literals, `intern`, methods that return `this` when nothing changes, Java `split` rules, `hashCode`), StringBuilder (JDK capacity growth, `append(double)` reserves 24), Math (incl. `floorMod`, `*Exact`), wrappers (Integer/Long/Short/Byte/Character caches −128..127 so `==` on boxes behaves like Java, `Boolean.TRUE/FALSE`), Arrays, Collections, `List/Set/Map.of`, Objects, Optional, Random (the 48-bit LCG: seeded output equals the JDK's, incl. `nextInt(origin, bound)` and `nextGaussian`), Scanner and BufferedReader on the Input box, printf/`String.format`/`formatted`, `System.arraycopy`, `System.exit`, `Thread.sleep` (no-op), streams (lazy, element by element: filter, map, mapToInt/Obj/Double, boxed, peek, sorted, distinct, limit, skip, flatMap, forEach, collect, toList, toArray, count, sum, average, min/max, reduce, any/all/noneMatch, findFirst; Collectors toList toSet joining counting groupingBy partitioningBy toMap summingInt averagingInt), Comparator (comparing, thenComparing, reversed, naturalOrder, reverseOrder), Function/Predicate combinators.
6. **Collections**: ArrayList (capacity 0 → 10 → ×1.5), LinkedList, ArrayDeque, Stack, PriorityQueue (the JDK's siftUp/siftDown, so `toString` order matches), HashMap/HashSet (**iteration order follows Java's buckets**: `(h ^ h>>>16) & (cap−1)`, table 16 doubling at 0.75 load, constructor sizes as in the JDK), LinkedHashMap/Set (insertion order; access order for `get` when constructed with `true`), TreeMap/TreeSet (sorted, navigation methods), views (`keySet values entrySet`) backed by the map, entries that write through, iterators with `remove`, and fail-fast `ConcurrentModificationException` with the JDK's `hasNext` rule (removing the second-to-last element ends the loop quietly).
7. **Exceptions**: the Throwable hierarchy is written in Java (`BUILTIN_SRC`) and run quietly (frames hidden). JDK messages: `/ by zero`, `Index 5 out of bounds for length 3`, `Range [2, 1) out of bounds for length 3`, `For input string: "x"`, helpful NullPointerException texts (`Cannot invoke "String.length()" because "<local1>" is null`). Locals are named `<localN>` by **javac slot**, simulated exactly (this = 0, parameters, long/double take two slots, slots reused after a block, for-each hides 3 slots for arrays and 1 for Iterables, String switch hides 2), because `java File.java` compiles without debug names. Stack traces use `Outer$Inner.method(File.java:line)`; under the source launcher every trace also holds five launcher frames below `main`, which the JVM trims only from an uncaught top-level trace (so a `Caused by:` section shows them). `StackOverflowError` is thrown at depth 2000 or when JavaScript's own stack runs out, whichever comes first, and can be caught.
8. **Unsupported** constructs stop with a message naming the line ("… is not supported in the visualizer, use Run for real output"): threads and concurrency, files and NIO, reflection beyond `getClass().getName()/getSimpleName()`, BigInteger/BigDecimal, java.time, local classes and records declared inside a method, `outer.new Inner()`, extending library classes (`extends Thread`, `extends ArrayList`), pattern-matching `switch`, `Set.of`/`Map.of` iteration order (the JDK randomises it per run; the visualizer uses insertion order), HashMap treeified bins, `ClassCastException` texts (simplified), `%e` rounding. Programs never hang: 50,000 executed steps is the limit ("Stopped after 50,000 steps (infinite loop?)").

## Learner aids (v2, 2026-10-25)

User: "anything for improving the learner's understanding, implement that". Added after the first build:
- **Garbage collection that really happens.** `System.gc()` runs `VM.gc()`: mark from the roots (every frame's `this`, locals and captured values, every class's static fields, the String pool, the box caches, the internal Class objects and PrintStreams), sweep the rest (`o.dead = true`, record flag `dead:1`, removed from `vm.all`), then record a step with event **`gc`** and the Why line "System.gc(): the collector starts from the stack and the static fields, marks every object it can reach, and frees the N it can't reach (M objects stay)". On that step the freed boxes are drawn dashed red with a "freed by GC" tag; from the next step they are gone. Before a collection, unreachable objects stay faded with an "unreachable" tag (the 12 most recent). Real Java collects whenever it decides, so the visualizer only collects when the program asks (said on the page).
- **Classes area (Metaspace).** Every user class gets a class-area record when it is initialised (first use), not only classes with static fields: `{id:"S:Q", st:1, name, q, kind (class, abstract class, anonymous class, interface, enum, record), sup, ifs, ms (method signatures, "static " prefix), ctors, comps, consts, vars (static fields)}`. The page draws them in a **Classes** row between Stack and Heap (header "class Car", "extends …/implements …", static fields with arrows, constructors and methods; `main` is left out). So a class appears exactly when Java loads it, and static fields sit with their class, not in a frame.
- **Strings and numbers as objects** (switch in the legend, `js1-pg-objs`): off = Strings and boxed numbers inside arrays and collections are drawn inline as text; on = they get their own boxes and arrows, so `{"Asha", "Asha", new String("Asha")}` shows two cells pointing at one pooled String and one at a separate heap String.
- **Hover tracing**: hovering a variable or field row (or its dot) lights the row, its arrow and the object; hovering an object lights every arrow into it and its class card; hovering a class card lights every object built from it. Paths carry `data-k` (source key) and `data-to` (target id); boxes of objects carry `data-cls`.
- **Legend** at the top of the panel: reference dot, unreachable, String pool, the hover tip and the switch.
- Two more examples, verified on JDK 25: "Static vs instance (the class area)" (`StaticCounter`) and "Garbage collection with System.gc()" (`GarbageDemo`). 22 examples, 72 programs in all.

## The step recorder

`JVML.run(src, stdin, opts)` returns `{steps, out, errR, error, uncaught, exit, ms, objs, cps, total, file, main}`. `error = {line, msg, kind}` with `kind` `compile | runtime | limit | internal`. `opts.maxSteps` overrides 50,000; `opts.names: true` makes NPE messages use variable names.

One step is recorded **before** each statement runs (so the drawing shows the state after the previous line), plus `call` at method entry, `return` (frame still on the stack, with its return value; locals of the method body stay visible), `exception` at a throw (`x` = the thrown object's id), `gc` after `System.gc()` swept the heap, and a final `end`. A second `line` step on the same line of the same frame with nothing changed is skipped (it still counts toward the limit). Step object: `{l, e, f, d, k, o, c, w, x, cp?}` = line, event, current frame id, **delta** (records that changed), stack ids (static areas, then visible frames bottom→top), console length, changed keys (`fid:var`, `h<id>`, `h<id>:field|index`), Why text, thrown id, checkpoint.

Records are immutable snapshots, rebuilt only for entities touched since the last step (copy-on-write): frames `{id, fr:1, name, line, call, vars:[{n,t,v}], ret}`, static areas `{id:"S:Class", st:1, name, vars}`, heap `{id, k, …}` per kind (`obj` fields with a `self` flag for linked layouts, `arr` first 500 cells, collections first 200, `map` entries with bucket index). Values are `{p:type, s:text[, c:charCode]}`, `{r:id}` or `null`. **Checkpoints** (a full `Map` id → record) are stored every 256 steps, or every `heapSize/4` steps when the heap is large; `JVML.state(result, k)` copies the nearest checkpoint ≤ k and applies the deltas after it (≤ 256 for normal heaps).

Why line: notes collected while a statement runs (`alloc set inc call ret throw catch pooled cache intern`) become one sentence, e.g. "new allocates a Node on the heap; head.next now points to it", "x++ reads 5 and writes 6", "fact(3) returns 6 to fact(4)", "Integer.valueOf reuses the cached box for 127".

**Measured** (2026-10-25, Node 24 and Chrome in the app's browser): a 4,807-step loop records in 42–71 ms; 50,000 executed steps (40,201 recorded, 10,054 objects, 200 live) take 667 ms and keep 103 MB; `state()` averages 0.006 ms; drawing one step with 202 heap boxes and 68 arrows averages 13.7 ms (median 14.6, p95 19.9). The state reconstruction was checked against a full replay on 2,041 sampled steps of the 50 test programs: 0 mismatches.

## The page

Desktop: left = toolbar (▶ Visualize, Run on a real JDK, Examples, Share, Reset), the course editor (`<script type="text/x-java">`, so CodeMirror, suggestions and Copy come from course.js), Input (stdin), Console (stderr red). Right (sticky) = controls `data-a="first|back|play|next|last"`, slider, speed 0.25×–4×, the Why line, and one scrollable panel: legend, Stack (newest frame on top, current frame outlined, at most 12 drawn), Classes (one card per loaded class with its static fields and methods), Heap (String pool strip, then boxes) with an SVG overlay for arrows. ≤980 px: one column, controls sticky. Keys (outside inputs and the editor): → or Space next, ← back, Home, End, P play; Ctrl+Enter in the editor = Visualize.

Drawing rules: primitives inline (`'a' (97)` for chars); references are dots with arrows; Strings and boxed numbers are drawn inline inside arrays and collections, but as their own boxes when a variable or field points to them (that is how `a == b` sharing shows); pooled Strings sit in the pool strip; objects with one self-typed field (`next`) that form a chain of 2+ are laid out in a row, objects with two (`left/right`) as a tree (in-order x, depth y); everything else flows in rows. Arrows: rounded orthogonal into a box on the right, curves down or up to boxes below or above, a looping back edge for cycles; the arrow of a variable that changed this step is accent-coloured. Boxes are keyed by heap id and rebuilt only when their record changes; new boxes appear in place, moved boxes glide. Unreachable objects (not reachable from frames or static fields) fade with an "unreachable" tag (the 12 most recent); the exception being thrown gets a red "thrown" tag. Arrays show 64 cells, then "+N".

Persistence (try/catch): `js1-pg-code`, `js1-pg-stdin`, `js1-pg-speed`, `js1-pg-objs`. Share: `#code=z<deflate-raw, base64url>` (CompressionStream; `b<utf-8 base64url>` without it) `&in=<base64url>`; a shared link wins over saved work. Editing after a run fades the drawing ("The code changed: press ▶ Visualize").

Examples (`<script type="text/x-java-example" data-name data-file [data-stdin]>` in `#pgExamples`, inserted from the verified files): Hello and variables · Swap two ints · Arrays and loops · 2D matrix · String pool and equals · StringBuilder reverse · Factorial recursion · Fibonacci memo with HashMap · Car class and objects · Inheritance and overriding · Linked list: build, traverse, reverse · Stack with an array · Queue with ArrayDeque · Binary tree: insert and inorder · Bubble sort · Binary search · Exceptions: try / catch / finally · Scanner input · Integer cache == trap · Interface and lambda Comparator sort · Static vs instance (the class area) · Garbage collection with System.gc(). All 22 print exactly what JDK 25 prints.

## Testing recipes

The scratch folder must be short (`java` refuses the long scratchpad path): `C:/Users/BHANUP~1.D/AppData/Local/Temp/pg`.
- `node split.js tests1.txt t1` splits a bundle (`=== Name.java`, `=== stdin Name.java`) into files; `bash cmp.sh t1` runs each with `java -Dstdout.encoding=UTF-8 Name.java` (cached as `.exp`, stdout+stderr) and with `node run.js` (the interpreter), and compares byte for byte. Suites: `t1` (Phase 1, 25), `t2` (Phase 2, 25), `ex` (the 22 examples). Result 2026-10-25: 72/72.
- `node --expose-gc rec.js` checks reconstruction vs replay, speed and memory; `node rec.js File.java` prints a readable step trace with Why lines.
- Headless screenshots: `bash shot.sh java/playground.html out.png 1600 1000 inject.js` (adds `<base>` and an error collector; `mkinj.js <example> <end|line:N[:k]|ev:exception>` makes an injection that loads an example and jumps to a step). Under `--virtual-time-budget` the clock is frozen and CSS transitions are caught mid-way: use it for structure, not timing. Headless Chrome can't go below a 490 px layout width.
- Real timings and phone width: `node serve.js` (static server on 127.0.0.1:8765) and the app's browser (`resize_window` mobile). Scripts injected from the browser tool run in an isolated world: append a `<script>` (wrapped in an IIFE) to reach `PGV`/`JVML`.

## Test programs and their JDK 25 output

### Phase 1: primitives, Strings, arrays, control flow, static methods, recursion, exceptions

#### P01Primitives.java

```java
public class P01Primitives {
    public static void main(String[] args) {
        int max = Integer.MAX_VALUE;
        System.out.println(max + 1);
        System.out.println(7 / 2 + " " + (-7 / 2) + " " + (7 % 3) + " " + (-7 % 3) + " " + (7 % -3));
        long big = 1L << 40;
        System.out.println(big + " " + (big * big));
        int i = 10;
        int j = i++ + ++i;
        System.out.println(i + " " + j);
        i += 3.7;
        System.out.println(i);
        char c = 'A';
        c += 2;
        System.out.println(c + " " + (c + 1) + " " + (char) (c + 1));
        byte b = (byte) 200;
        short s = (short) 70000;
        System.out.println(b + " " + s);
        System.out.println((int) 'z' + " " + (char) 97);
        int x = 5;
        x *= 2 + 3;
        System.out.println(x);
        long l = 123456789L * 1000;
        System.out.println(l + " " + (int) l);
        System.out.println(Long.MAX_VALUE + " " + Long.MIN_VALUE);
        System.out.println(0x1F + " " + 0b1010 + " " + 017 + " " + 1_000_000);
    }
}
```

JDK 25 output (stdout and stderr):

```
-2147483648
3 -3 1 -1 1
1099511627776 0
12 22
15
C 68 D
-56 4464
122 a
25
123456789000 -1097262584
9223372036854775807 -9223372036854775808
31 10 15 1000000
```

#### P02Doubles.java

```java
public class P02Doubles {
    public static void main(String[] args) {
        System.out.println(0.1 + 0.2);
        System.out.println(1e7 + " " + 1e6 + " " + 123456789.0 + " " + 0.001 + " " + 0.0001);
        System.out.println(100.0 / 3);
        System.out.println(1.1f * 3 + " " + 0.1f + " " + (float) 1 / 3);
        System.out.println(0.0 / 0 + " " + 1.0 / 0 + " " + -1.0 / 0 + " " + -0.0);
        System.out.println((int) 3.99 + " " + (int) -3.99 + " " + (int) 1e20 + " " + (long) -1e30);
        System.out.println(Math.round(2.5) + " " + Math.round(-2.5) + " " + Math.round(2.4f));
        double d = 10;
        System.out.println(d + " " + d / 4 + " " + 5 / 2 * 2.0);
        System.out.println(1.0E-5 + " " + 12345.678e3 + " " + Double.MAX_VALUE + " " + Double.MIN_VALUE);
        float f = 3.14159f;
        double g = f;
        System.out.println(f + " " + g);
        System.out.println((0.1 + 0.2 == 0.3) + " " + (0.1f + 0.2f == 0.3f));
        System.out.println(2e-3 + " " + 9999999.0 + " " + 10000000.0 + " " + 1.0 / 3);
    }
}
```

JDK 25 output (stdout and stderr):

```
0.30000000000000004
1.0E7 1000000.0 1.23456789E8 0.001 1.0E-4
33.333333333333336
3.3000002 0.1 0.33333334
NaN Infinity -Infinity -0.0
3 -3 2147483647 -9223372036854775808
3 -2 2
10.0 2.5 4.0
1.0E-5 1.2345678E7 1.7976931348623157E308 4.9E-324
3.14159 3.141590118408203
false true
0.002 9999999.0 1.0E7 0.3333333333333333
```

#### P03Bits.java

```java
public class P03Bits {
    public static void main(String[] args) {
        int a = 0b1100, b = 0b1010;
        System.out.println((a & b) + " " + (a | b) + " " + (a ^ b) + " " + (~a));
        System.out.println((1 << 31) + " " + (1 << 32) + " " + (-16 >> 2) + " " + (-16 >>> 28));
        long m = -1L;
        System.out.println((m >>> 60) + " " + (m << 63));
        System.out.println(Integer.toBinaryString(42) + " " + Integer.toHexString(-1) + " " + Integer.bitCount(255));
        int n = 37;
        System.out.println(((n & 1) == 0 ? "even" : "odd") + " " + (n >> 1));
        boolean t = true, f = false;
        System.out.println((t & f) + " " + (t | f) + " " + (t ^ f) + " " + !t);
    }
}
```

JDK 25 output (stdout and stderr):

```
8 14 6 -13
-2147483648 1 -4 15
15 -9223372036854775808
101010 ffffffff 8
odd 18
false true true false
```

#### P04Strings.java

```java
public class P04Strings {
    public static void main(String[] args) {
        String s = "Hello, World";
        System.out.println(s.length() + " " + s.charAt(4) + " " + s.indexOf('o') + " " + s.lastIndexOf("o") + " " + s.indexOf("xyz"));
        System.out.println(s.substring(7) + "|" + s.substring(0, 5) + "|" + s.toUpperCase() + "|" + s.toLowerCase());
        String a = "java";
        String b = new String("java");
        System.out.println((a == b) + " " + a.equals(b) + " " + a.compareTo("javascript") + " " + "b".compareTo("a"));
        System.out.println("1" + 2 + 3 + " " + (1 + 2) + "3" + " " + 1 + 2);
        System.out.println(s.contains("World") + " " + s.startsWith("Hell") + " " + s.endsWith("d") + " " + s.isEmpty() + " " + "  ".isBlank());
        String t = null;
        System.out.println("value: " + t);
        System.out.println("abc".equalsIgnoreCase("ABC") + " " + "Apple".compareToIgnoreCase("apple"));
        char[] cs = s.toCharArray();
        System.out.println(cs.length + " " + cs[0] + cs[cs.length - 1]);
        System.out.println(String.valueOf(cs, 0, 5) + " " + String.valueOf(3.5) + String.valueOf(true));
    }
}
```

JDK 25 output (stdout and stderr):

```
12 o 4 8 -1
World|Hello|HELLO, WORLD|hello, world
false true -6 1
123 33 12
true true true false true
value: null
true 0
12 Hd
Hello 3.5true
```

#### P05Pool.java

```java
public class P05Pool {
    public static void main(String[] args) {
        String s1 = "hello";
        String s2 = "hello";
        String s3 = new String("hello");
        String s4 = s3.intern();
        System.out.println((s1 == s2) + " " + (s1 == s3) + " " + (s1 == s4) + " " + s1.equals(s3));
        String part = "hel";
        String s5 = part + "lo";
        String s6 = "hel" + "lo";
        System.out.println((s1 == s5) + " " + (s1 == s6) + " " + (s1 == s5.intern()));
        String u = s1.toUpperCase();
        String v = "HELLO";
        System.out.println((u == v) + " " + u.equals(v) + " " + (s1.trim() == s1) + " " + (s1.substring(0) == s1));
        String e = "";
        System.out.println((e + "hello" == s1) + " " + (s1.concat("") == s1));
    }
}
```

JDK 25 output (stdout and stderr):

```
true false true true
false true true
false true true true
false true
```

#### P06StringOps.java

```java
import java.util.Arrays;

public class P06StringOps {
    public static void main(String[] args) {
        String csv = "a,b,,c,,";
        System.out.println(Arrays.toString(csv.split(",")) + " " + csv.split(",").length);
        System.out.println(Arrays.toString(csv.split(",", -1)) + " " + Arrays.toString("a1b22c333".split("\\d+")));
        System.out.println(Arrays.toString("hello world  java".split(" ")) + Arrays.toString("hello world  java".split("\\s+")));
        System.out.println(Arrays.toString("abc".split("")) + " " + Arrays.toString("".split(",")) + " " + ",".split(",").length);
        System.out.println(String.join("-", "x", "y", "z") + " " + "banana".replace('a', 'o') + " " + "banana".replace("an", "AN"));
        System.out.println("[" + "  pad  ".trim() + "][" + "  pad  ".strip() + "] " + "ab".repeat(3) + " " + "Mississippi".replaceAll("ss", "SS"));
        System.out.println("a-b-c".replaceAll("-", "") + " " + "hello".chars().filter(c -> c == 'l').count());
        String r = "";
        for (int i = 0; i < 5; i++) r += i;
        System.out.println(r + " " + r.length() + " " + "x".compareTo("xyz") + " " + "Hello".hashCode());
        System.out.println("racecar".equals(new StringBuilder("racecar").reverse().toString()));
        System.out.println("Java".indexOf('a', 2) + " " + "a.b.c".split("\\.").length + " " + "  x ".length());
    }
}
```

JDK 25 output (stdout and stderr):

```
[a, b, , c] 4
[a, b, , c, , ] [a, b, c]
[hello, world, , java][hello, world, java]
[a, b, c] [] 0
x-y-z bonono bANANa
[pad][pad] ababab MiSSiSSippi
abc 2
01234 5 -2 69609650
true
3 3 4
```

#### P07Builder.java

```java
public class P07Builder {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        System.out.println(sb.length() + " " + sb.capacity());
        sb.append("Hello").append(' ').append(42).append(true).append(1.5);
        System.out.println(sb + " " + sb.length() + " " + sb.capacity());
        sb.insert(0, ">> ");
        sb.reverse();
        System.out.println(sb);
        sb.reverse();
        sb.deleteCharAt(0).setCharAt(0, '#');
        System.out.println(sb + " " + sb.indexOf("42") + " " + sb.charAt(3));
        sb.delete(0, 2);
        sb.replace(0, 5, "HELLO");
        System.out.println(sb.toString());
        StringBuilder a = new StringBuilder("x");
        StringBuilder b = a;
        b.append("y");
        System.out.println(a + " " + (a == b) + " " + a.equals(new StringBuilder("xy")));
        StringBuilder big = new StringBuilder();
        for (int i = 0; i < 20; i++) big.append(i % 10);
        System.out.println(big + " " + big.capacity());
    }
}
```

JDK 25 output (stdout and stderr):

```
0 16
Hello 42true1.5 15 36
5.1eurt24 olleH >>
# Hello 42true1.5 8 e
HELLO 42true1.5
xy true false
01234567890123456789 34
```

#### P08Arrays.java

```java
import java.util.Arrays;

public class P08Arrays {
    public static void main(String[] args) {
        int[] a = {5, 3, 9, 1, 7};
        int sum = 0, max = a[0];
        for (int v : a) { sum += v; if (v > max) max = v; }
        System.out.println(sum + " " + max + " " + a.length);
        int[] c = Arrays.copyOf(a, 7);
        Arrays.sort(a);
        System.out.println(Arrays.toString(a) + " " + Arrays.toString(c));
        System.out.println(Arrays.binarySearch(a, 7) + " " + Arrays.binarySearch(a, 4));
        double[] d = new double[3];
        boolean[] f = new boolean[2];
        String[] s = new String[2];
        char[] ch = new char[2];
        System.out.println(Arrays.toString(d) + Arrays.toString(f) + Arrays.toString(s) + (int) ch[0]);
        Arrays.fill(d, 1.5);
        System.out.println(Arrays.toString(d) + " " + Arrays.toString(Arrays.copyOfRange(a, 1, 3)));
        int[] b = a;
        b[0] = 100;
        System.out.println(a[0] + " " + (a == b) + " " + Arrays.equals(a, b.clone()) + " " + (a == b.clone()));
        String[] names = {"pear", "Apple", "fig", "apple"};
        Arrays.sort(names);
        System.out.println(Arrays.toString(names));
        int[] rev = new int[a.length];
        for (int i = 0; i < a.length; i++) rev[a.length - 1 - i] = a[i];
        System.out.println(Arrays.toString(rev));
        Integer[] boxed = {3, 1, 2};
        Arrays.sort(boxed, (x, y) -> y - x);
        System.out.println(Arrays.toString(boxed));
    }
}
```

JDK 25 output (stdout and stderr):

```
25 9 5
[1, 3, 5, 7, 9] [5, 3, 9, 1, 7, 0, 0]
3 -3
[0.0, 0.0, 0.0][false, false][null, null]0
[1.5, 1.5, 1.5] [3, 5]
100 true true false
[Apple, apple, fig, pear]
[9, 7, 5, 3, 100]
[3, 2, 1]
```

#### P09Matrix.java

```java
import java.util.Arrays;

public class P09Matrix {
    public static void main(String[] args) {
        int[][] m = {{1, 2, 3}, {4, 5, 6}};
        int[][] t = new int[3][2];
        for (int i = 0; i < m.length; i++)
            for (int j = 0; j < m[i].length; j++)
                t[j][i] = m[i][j];
        System.out.println(Arrays.deepToString(t));
        int[][] jag = new int[3][];
        for (int i = 0; i < jag.length; i++) {
            jag[i] = new int[i + 1];
            for (int j = 0; j <= i; j++) jag[i][j] = i * j;
        }
        System.out.println(Arrays.deepToString(jag) + " " + jag[2].length);
        char[][] grid = new char[2][3];
        for (char[] row : grid) Arrays.fill(row, '.');
        grid[1][2] = '#';
        for (char[] row : grid) System.out.println(new String(row));
        int[][] id = new int[3][3];
        for (int i = 0; i < 3; i++) id[i][i] = 1;
        int total = 0;
        for (int[] row : id) for (int v : row) total += v;
        System.out.println(total + " " + Arrays.toString(id[1]));
    }
}
```

JDK 25 output (stdout and stderr):

```
[[1, 4], [2, 5], [3, 6]]
[[0], [0, 1], [0, 2, 4]] 3
...
..#
3 [0, 1, 0]
```

#### P10Switch.java

```java
public class P10Switch {
    static String kind(int day) {
        switch (day) {
            case 1:
            case 7:
                return "weekend";
            case 2: case 3: case 4: case 5: case 6:
                return "weekday";
            default:
                return "invalid";
        }
    }
    public static void main(String[] args) {
        System.out.println(kind(1) + " " + kind(3) + " " + kind(9));
        int n = 2;
        switch (n) {
            case 1: System.out.println("one");
            case 2: System.out.println("two");
            case 3: System.out.println("three"); break;
            case 4: System.out.println("four");
        }
        String cmd = "stop";
        switch (cmd) {
            case "go" -> System.out.println("going");
            case "stop", "halt" -> System.out.println("stopping");
            default -> System.out.println("?");
        }
        char grade = 'B';
        String msg = switch (grade) {
            case 'A' -> "excellent";
            case 'B', 'C' -> {
                String base = "good";
                yield base + "!";
            }
            default -> "keep going";
        };
        System.out.println(msg);
        int len = switch ("abc") { case "abc" -> 3; default -> 0; };
        System.out.println(len);
    }
}
```

JDK 25 output (stdout and stderr):

```
weekend weekday invalid
two
three
stopping
good!
3
```

#### P11Loops.java

```java
public class P11Loops {
    public static void main(String[] args) {
        int i = 0;
        while (i < 3) { System.out.print(i + " "); i++; }
        System.out.println();
        do { System.out.print(i-- + " "); } while (i > 0);
        System.out.println();
        for (int a = 0, b = 10; a < b; a += 3, b -= 2) System.out.print(a + ":" + b + " ");
        System.out.println();
        outer:
        for (int r = 0; r < 4; r++) {
            for (int c = 0; c < 4; c++) {
                if (c == 2) continue outer;
                if (r == 3) break outer;
                System.out.print(r + "" + c + " ");
            }
        }
        System.out.println();
        for (int r = 1; r <= 4; r++) {
            System.out.println(" ".repeat(4 - r) + "*".repeat(2 * r - 1));
        }
        int count = 0;
        for (;;) { if (++count == 5) break; }
        System.out.println(count);
    }
}
```

JDK 25 output (stdout and stderr):

```
0 1 2 
3 2 1 
0:10 3:8 
00 01 10 11 20 21 
   *
  ***
 *****
*******
5
```

#### P12Methods.java

```java
public class P12Methods {
    static int add(int a, int b) { return a + b; }
    static double add(double a, double b) { return a + b; }
    static long add(long a, long b) { return a + b + 1000; }
    static String add(String a, String b) { return a + "+" + b; }
    static int sum(int... nums) {
        int s = 0;
        for (int n : nums) s += n;
        return s;
    }
    static void show(Object o) { System.out.println("object " + o); }
    static void show(int x) { System.out.println("int " + x); }
    static void show(long x) { System.out.println("long " + x); }
    static void swap(int[] arr, int i, int j) { int t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    static void tryChange(int x) { x = 99; }
    public static void main(String[] args) {
        System.out.println(add(2, 3) + " " + add(2.5, 3) + " " + add(2L, 3L) + " " + add("a", "b"));
        System.out.println(sum() + " " + sum(1) + " " + sum(1, 2, 3, 4) + " " + sum(new int[]{5, 5}));
        show(5); show(5L); show("hi"); show('c'); show(2.5);
        int[] arr = {1, 2};
        swap(arr, 0, 1);
        int v = 1;
        tryChange(v);
        System.out.println(arr[0] + "" + arr[1] + " " + v);
    }
}
```

JDK 25 output (stdout and stderr):

```
5 5.5 1005 a+b
0 1 10 10
int 5
long 5
object hi
int 99
object 2.5
21 1
```

#### P13Recursion.java

```java
public class P13Recursion {
    static long fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }
    static int fib(int n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }
    static int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }
    static double power(double b, int e) {
        if (e == 0) return 1;
        double half = power(b, e / 2);
        return e % 2 == 0 ? half * half : half * half * b;
    }
    static int moves = 0;
    static void hanoi(int n, char from, char to, char via) {
        if (n == 0) return;
        hanoi(n - 1, from, via, to);
        moves++;
        if (n == 3) System.out.println("move disk 3 " + from + "->" + to);
        hanoi(n - 1, via, to, from);
    }
    static String reverse(String s) { return s.isEmpty() ? "" : reverse(s.substring(1)) + s.charAt(0); }
    public static void main(String[] args) {
        System.out.println(fact(5) + " " + fact(20) + " " + fact(21));
        System.out.println(fib(10) + " " + gcd(84, 36) + " " + power(2, 10) + " " + power(1.5, 3));
        hanoi(4, 'A', 'C', 'B');
        System.out.println(moves + " " + reverse("recursion"));
    }
}
```

JDK 25 output (stdout and stderr):

```
120 2432902008176640000 -4249290049419214848
55 12 1024.0 3.375
move disk 3 A->B
move disk 3 B->C
15 noisrucer
```

#### P14Exceptions.java

```java
public class P14Exceptions {
    static int f() {
        try { return 1; } finally { System.out.println("finally runs before return"); }
    }
    static int g() {
        try { throw new RuntimeException("x"); } catch (RuntimeException e) { return 2; } finally { System.out.println("g finally"); }
    }
    public static void main(String[] args) {
        try {
            int z = 0;
            System.out.println(10 / z);
        } catch (ArithmeticException e) {
            System.out.println("caught: " + e.getMessage() + " | " + e);
        } finally {
            System.out.println("finally 1");
        }
        try {
            int[] a = new int[3];
            a[3] = 1;
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println(e.getMessage());
        }
        try {
            "abc".charAt(5);
        } catch (StringIndexOutOfBoundsException e) {
            System.out.println(e.getClass().getSimpleName() + ": " + e.getMessage());
        }
        try {
            "abc".substring(2, 1);
        } catch (IndexOutOfBoundsException e) {
            System.out.println(e.getMessage());
        }
        System.out.println(f() + " " + g());
        try {
            throw new IllegalStateException("bad state");
        } catch (IllegalArgumentException | IllegalStateException e) {
            System.out.println("multi " + e.getMessage());
        }
    }
}
```

JDK 25 output (stdout and stderr):

```
caught: / by zero | java.lang.ArithmeticException: / by zero
finally 1
Index 3 out of bounds for length 3
StringIndexOutOfBoundsException: Index 5 out of bounds for length 3
Range [2, 1) out of bounds for length 3
finally runs before return
g finally
1 2
multi bad state
```

#### P15Exceptions2.java

```java
public class P15Exceptions2 {
    static int parse(String s) {
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            System.out.println("NFE " + e.getMessage());
            return -1;
        }
    }
    static void check(int age) {
        if (age < 0) throw new IllegalArgumentException("age must be >= 0, got " + age);
    }
    public static void main(String[] args) {
        System.out.println(parse("42") + " " + parse("4x2") + " " + parse("") + " " + parse("99999999999"));
        try { check(-5); } catch (IllegalArgumentException e) { System.out.println(e.getMessage()); }
        String s = null;
        try { s.length(); } catch (NullPointerException e) { System.out.println("NPE caught"); }
        try {
            try { throw new RuntimeException("inner"); }
            finally { System.out.println("inner finally"); }
        } catch (RuntimeException e) {
            System.out.println("outer caught " + e.getMessage());
        }
        try {
            try { Integer.parseInt("x"); }
            catch (NumberFormatException e) { throw new RuntimeException("wrapped", e); }
        } catch (RuntimeException e) {
            System.out.println(e.getMessage() + " cause=" + e.getCause().getClass().getName());
        }
        Object o = "text";
        try { Integer i = (Integer) o; } catch (ClassCastException e) { System.out.println("CCE"); }
        System.out.println(Double.parseDouble("3.5e2") + " " + Long.parseLong("-123") + " " + Integer.parseInt("ff", 16));
    }
}
```

JDK 25 output (stdout and stderr):

```
NFE For input string: "4x2"
NFE For input string: ""
NFE For input string: "99999999999"
42 -1 -1 -1
age must be >= 0, got -5
NPE caught
inner finally
outer caught inner
wrapped cause=java.lang.NumberFormatException
CCE
350.0 -123 255
```

#### P16Uncaught.java

```java
public class P16Uncaught {
    static int divide(int a, int b) {
        return a / b;
    }
    static int compute(int x) {
        int r = divide(100, x - 3);
        return r * 2;
    }
    public static void main(String[] args) {
        System.out.println(compute(8));
        System.out.println(compute(3));
        System.out.println("never printed");
    }
}
```

JDK 25 output (stdout and stderr):

```
40
Exception in thread "main" java.lang.ArithmeticException: / by zero
	at P16Uncaught.divide(P16Uncaught.java:3)
	at P16Uncaught.compute(P16Uncaught.java:6)
	at P16Uncaught.main(P16Uncaught.java:11)
```

#### P17Overflow.java

```java
public class P17Overflow {
    static int depth = 0;
    static void down() { depth++; down(); }
    public static void main(String[] args) {
        try {
            down();
        } catch (StackOverflowError e) {
            System.out.println("caught " + e.getClass().getName() + " " + (depth > 100));
        }
        System.out.println("still running");
    }
}
```

JDK 25 output (stdout and stderr):

```
caught java.lang.StackOverflowError true
still running
```

#### P18Math.java

```java
public class P18Math {
    public static void main(String[] args) {
        System.out.println(Math.max(3, 7) + " " + Math.min(-2, 4) + " " + Math.max(2, 3.5) + " " + Math.abs(-9) + " " + Math.abs(-2.5));
        System.out.println(Math.pow(2, 10) + " " + Math.sqrt(144) + " " + Math.cbrt(27) + " " + Math.hypot(3, 4));
        System.out.println(Math.floor(-2.5) + " " + Math.ceil(-2.5) + " " + Math.round(-2.5) + " " + Math.rint(2.5) + " " + Math.rint(3.5));
        System.out.println(Math.floorMod(-7, 3) + " " + (-7 % 3) + " " + Math.floorDiv(-7, 3) + " " + (-7 / 3));
        System.out.println(Math.abs(Integer.MIN_VALUE) + " " + Math.signum(-4.2) + " " + Math.PI + " " + Math.E);
        System.out.println(Math.log10(1000) + " " + Math.exp(0) + " " + (int) Math.toDegrees(Math.PI));
        try { Math.addExact(Integer.MAX_VALUE, 1); } catch (ArithmeticException e) { System.out.println(e.getMessage()); }
        double r = Math.random();
        System.out.println(r >= 0 && r < 1);
    }
}
```

JDK 25 output (stdout and stderr):

```
7 -2 3.5 9 2.5
1024.0 12.0 3.0 5.0
-3.0 -2.0 -2 2.0 4.0
2 -1 -3 -2
-2147483648 -1.0 3.141592653589793 2.718281828459045
3.0 1.0 180
integer overflow
true
```

#### P19Wrappers.java

```java
public class P19Wrappers {
    public static void main(String[] args) {
        Integer a = 127, b = 127, c = 128, d = 128;
        System.out.println((a == b) + " " + (c == d) + " " + c.equals(d) + " " + (c.intValue() == d));
        Integer e = Integer.valueOf(50), f = Integer.valueOf(50), g = Integer.valueOf("50");
        System.out.println((e == f) + " " + (e == g) + " " + e.equals(g));
        Long l1 = 100L, l2 = 100L;
        System.out.println((l1 == l2) + " " + l1.equals(100) + " " + l1.equals(100L));
        int sum = a + c;
        System.out.println(sum + " " + Integer.toString(255, 16) + " " + Integer.toBinaryString(10) + " " + Integer.parseInt("-77"));
        System.out.println(Character.isDigit('7') + " " + Character.isLetter('x') + " " + Character.isUpperCase('Q') + " " + Character.toUpperCase('m') + " " + Character.getNumericValue('8'));
        System.out.println(Integer.MAX_VALUE + " " + Integer.MIN_VALUE + " " + Integer.compare(3, 9) + " " + Double.compare(1.5, 1.5) + " " + Boolean.parseBoolean("TRUE"));
        Double dd = 2.5;
        double prim = dd;
        System.out.println(prim * 2 + " " + dd.intValue() + " " + Character.isWhitespace(' ') + " " + (int) Character.forDigit(11, 16));
        Character ch = 'z';
        System.out.println(ch + 1);
    }
}
```

JDK 25 output (stdout and stderr):

```
true false true true
true true true
true false true
255 ff 1010 -77
true true true M 8
2147483647 -2147483648 -1 0 true
5.0 2 true 98
123
```

#### P20Chars.java

```java
public class P20Chars {
    static boolean isPal(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) if (s.charAt(i++) != s.charAt(j--)) return false;
        return true;
    }
    static String caesar(String s, int k) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (Character.isUpperCase(c)) sb.append((char) ('A' + (c - 'A' + k) % 26));
            else if (Character.isLowerCase(c)) sb.append((char) ('a' + (c - 'a' + k) % 26));
            else sb.append(c);
        }
        return sb.toString();
    }
    public static void main(String[] args) {
        String text = "Programming in Java";
        int vowels = 0;
        int[] freq = new int[26];
        for (int i = 0; i < text.length(); i++) {
            char c = Character.toLowerCase(text.charAt(i));
            if ("aeiou".indexOf(c) >= 0) vowels++;
            if (c >= 'a' && c <= 'z') freq[c - 'a']++;
        }
        System.out.println(vowels + " " + freq['g' - 'a'] + " " + freq['m' - 'a']);
        System.out.println(isPal("level") + " " + isPal("java") + " " + caesar("Hello, Zebra!", 3));
        char c = 'a';
        c++;
        System.out.println(c + " " + (c + 1) + " " + (char) (c + 1) + " " + ('a' + 'b') + " " + (char) 65 + 'B');
    }
}
```

JDK 25 output (stdout and stderr):

```
6 2 2
true false Khoor, Cheud!
b 99 c 195 AB
```

#### P21Ternary.java

```java
public class P21Ternary {
    public static void main(String[] args) {
        int x = 7;
        String s = x > 5 ? "big" : "small";
        System.out.println(s + " " + (x % 2 == 0 ? "even" : "odd"));
        System.out.println(true ? 1 : 2.0);
        System.out.println(x > 0 ? 'Y' : 'N');
        byte b = 10;
        b += 5;
        b++;
        short sh = 1;
        sh *= 1000;
        char c = 'a';
        c += 1;
        System.out.println(b + " " + sh + " " + c);
        int a = 3, y = 4;
        a = a ^ y; y = a ^ y; a = a ^ y;
        System.out.println(a + " " + y);
        int k = 5;
        k = k++ + k++;
        System.out.println(k);
        double avg = (3 + 4) / 2;
        double avg2 = (3 + 4) / 2.0;
        System.out.println(avg + " " + avg2 + " " + 'a' + 1 + " " + (char) ('a' + 1));
        long big = 1_000_000 * 3000;
        long ok = 1_000_000L * 3000;
        System.out.println(big + " " + ok);
        System.out.println(10 == 10.0);
    }
}
```

JDK 25 output (stdout and stderr):

```
big odd
1.0
Y
16 1000 b
4 3
11
3.0 3.5 a1 b
-1294967296 3000000000
true
```

#### P22TextBlock.java

```java
public class P22TextBlock {
    public static void main(String[] args) {
        String json = """
            {
              "name": "Swift",
              "speed": 120
            }
            """;
        System.out.print(json);
        String tabbed = "a\tb\nc\\d \"quoted\" A";
        System.out.println(tabbed);
        String line = """
            one \
            two""";
        System.out.println(line + "|" + line.length());
        char q = '\'';
        System.out.println(q + "" + '\\' + '"');
    }
}
```

JDK 25 output (stdout and stderr):

```
{
  "name": "Swift",
  "speed": 120
}
a	b
c\d "quoted" A
one two|7
'\"
```

#### P23Printf.java

```java
public class P23Printf {
    public static void main(String[] args) {
        System.out.printf("%d|%5d|%-5d|%05d%n", 42, 42, 42, 42);
        System.out.printf("%s|%10s|%-10s|%.3s%n", "java", "java", "java", "java");
        System.out.printf("%.2f|%8.3f|%-8.1f|%.0f%n", Math.PI, Math.E, 2.25, 2.5);
        System.out.printf("%,d|%,.2f|%+d|%x|%X|%o%n", 1234567, 9876543.219, 7, 255, 255, 8);
        System.out.printf("%c|%b|%b|%e|%%|%n", 'Z', true, null, 12345.678);
        String s = String.format("%-6s%6.2f", "Total", 3.14159);
        System.out.println("[" + s + "]");
        System.out.println(String.format("%.2f %.2f %.1f %.1f", 2.675, 0.125, 0.05, 0.25));
        System.out.printf("%3$s %1$s %2$s%n", "a", "b", "c");
        System.out.println(String.format("%08.2f|%(d|% d", -3.5, -12, 5));
        System.out.println("%d items cost %.2f".formatted(3, 9.5));
    }
}
```

JDK 25 output (stdout and stderr):

```
42|   42|42   |00042
java|      java|java      |jav
3.14|   2.718|2.3     |3
1,234,567|9,876,543.22|+7|ff|FF|10
Z|true|false|1.234568e+04|%|
[Total   3.14]
2.68 0.13 0.1 0.3
c a b
-0003.50|(12)| 5
3 items cost 9.50
```

#### P24Sorting.java

```java
import java.util.Arrays;

public class P24Sorting {
    static void bubble(int[] a) {
        int n = a.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - 1 - i; j++) {
                if (a[j] > a[j + 1]) {
                    int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                    swapped = true;
                }
            }
            System.out.println("pass " + (i + 1) + ": " + Arrays.toString(a));
            if (!swapped) break;
        }
    }
    static int search(int[] a, int key) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1;
            if (a[mid] == key) return mid;
            if (a[mid] < key) lo = mid + 1; else hi = mid - 1;
        }
        return -(lo + 1);
    }
    public static void main(String[] args) {
        int[] a = {5, 1, 4, 2, 8};
        bubble(a);
        System.out.println(search(a, 4) + " " + search(a, 3) + " " + search(a, 9));
        int[] sel = {64, 25, 12, 22, 11};
        for (int i = 0; i < sel.length - 1; i++) {
            int m = i;
            for (int j = i + 1; j < sel.length; j++) if (sel[j] < sel[m]) m = j;
            int t = sel[m]; sel[m] = sel[i]; sel[i] = t;
        }
        System.out.println(Arrays.toString(sel));
    }
}
```

JDK 25 output (stdout and stderr):

```
pass 1: [1, 4, 2, 5, 8]
pass 2: [1, 2, 4, 5, 8]
pass 3: [1, 2, 4, 5, 8]
2 -3 -6
[11, 12, 22, 25, 64]
```

#### P25Numbers.java

```java
public class P25Numbers {
    public static void main(String[] args) {
        int n = 50;
        boolean[] composite = new boolean[n + 1];
        StringBuilder primes = new StringBuilder();
        for (int i = 2; i <= n; i++) {
            if (composite[i]) continue;
            primes.append(i).append(' ');
            for (int j = i * i; j <= n; j += i) composite[j] = true;
        }
        System.out.println(primes.toString().trim());
        for (int i = 1; i <= 15; i++) {
            String out = i % 15 == 0 ? "FizzBuzz" : i % 3 == 0 ? "Fizz" : i % 5 == 0 ? "Buzz" : String.valueOf(i);
            System.out.print(out + (i < 15 ? "," : "\n"));
        }
        int num = 98765, digits = 0, sum = 0, rev = 0;
        while (num > 0) { sum += num % 10; rev = rev * 10 + num % 10; num /= 10; digits++; }
        System.out.println(digits + " " + sum + " " + rev);
        int armstrong = 153, t = armstrong, s2 = 0;
        while (t > 0) { int d = t % 10; s2 += d * d * d; t /= 10; }
        System.out.println(armstrong + (s2 == armstrong ? " is" : " is not") + " Armstrong");
        long collatz = 27; int steps = 0;
        while (collatz != 1) { collatz = collatz % 2 == 0 ? collatz / 2 : 3 * collatz + 1; steps++; }
        System.out.println("collatz(27) steps = " + steps);
    }
}
```

JDK 25 output (stdout and stderr):

```
2 3 5 7 11 13 17 19 23 29 31 37 41 43 47
1,2,Fizz,4,Buzz,Fizz,7,8,Fizz,Buzz,11,Fizz,13,14,FizzBuzz
5 35 56789
153 is Armstrong
collatz(27) steps = 111
```

### Phase 2: classes, inheritance, interfaces, lambdas, collections, Scanner, printf, records, enums, streams

#### Q01Car.java

```java
public class Q01Car {
    static class Car {
        static int built = 0;
        private final String model;
        private int speed;
        Car(String model) { this(model, 0); }
        Car(String model, int speed) { this.model = model; this.speed = speed; built++; }
        void accelerate(int by) { speed += by; }
        int getSpeed() { return speed; }
        String getModel() { return model; }
        @Override public String toString() { return model + "@" + speed; }
    }
    public static void main(String[] args) {
        Car a = new Car("Swift");
        Car b = new Car("Nexon", 30);
        Car c = a;
        a.accelerate(40);
        c.accelerate(20);
        System.out.println(a + " " + b + " " + c + " " + (a == c) + " " + Car.built);
        Car[] lot = {a, b, new Car("Creta", 90)};
        int total = 0;
        for (Car car : lot) total += car.getSpeed();
        System.out.println(total + " " + lot.length + " " + Car.built + " " + lot[2].getModel());
        Car none = null;
        System.out.println(none == null ? "no car" : none.getModel());
    }
}
```

JDK 25 output (stdout and stderr):

```
Swift@60 Nexon@30 Swift@60 true 2
180 3 3 Creta
no car
```

#### Q02Inherit.java

```java
public class Q02Inherit {
    static abstract class Animal {
        protected String name;
        Animal(String name) { this.name = name; }
        abstract String sound();
        String describe() { return name + " says " + sound(); }
        public String toString() { return getClass().getSimpleName() + "(" + name + ")"; }
    }
    static class Dog extends Animal {
        Dog(String n) { super(n); }
        String sound() { return "Woof"; }
        String fetch() { return name + " fetches"; }
    }
    static class Puppy extends Dog {
        Puppy(String n) { super(n + " Jr"); }
        @Override String sound() { return "Yip (" + super.sound() + ")"; }
    }
    static class Cat extends Animal {
        Cat(String n) { super(n); }
        String sound() { return "Meow"; }
        @Override String describe() { return "The cat: " + super.describe(); }
    }
    public static void main(String[] args) {
        Animal[] zoo = {new Dog("Rex"), new Cat("Tom"), new Puppy("Rex")};
        for (Animal a : zoo) System.out.println(a.describe() + " | " + a);
        for (Animal a : zoo) {
            if (a instanceof Dog d) System.out.println(d.fetch());
            else System.out.println(a.name + " is not a dog");
        }
        Animal x = zoo[2];
        System.out.println((x instanceof Animal) + " " + (x instanceof Dog) + " " + (x instanceof Puppy) + " " + (x instanceof Cat));
        System.out.println(x.getClass().getName() + " " + x.getClass().getSimpleName());
        Dog dd = (Dog) x;
        System.out.println(dd.sound());
    }
}
```

JDK 25 output (stdout and stderr):

```
Rex says Woof | Dog(Rex)
The cat: Tom says Meow | Cat(Tom)
Rex Jr says Yip (Woof) | Puppy(Rex Jr)
Rex fetches
Tom is not a dog
Rex Jr fetches
true true true false
Q02Inherit$Puppy Puppy
Yip (Woof)
```

#### Q03Interface.java

```java
public class Q03Interface {
    interface Shape {
        double area();
        default String label() { return getClass().getSimpleName() + " with area " + String.format("%.2f", area()); }
        static Shape unit() { return new Square(1); }
    }
    interface Named { String name(); }
    static class Circle implements Shape, Named {
        private final double r;
        Circle(double r) { this.r = r; }
        public double area() { return Math.PI * r * r; }
        public String name() { return "circle r=" + r; }
    }
    static class Square implements Shape {
        private final double s;
        Square(double s) { this.s = s; }
        public double area() { return s * s; }
        @Override public String label() { return "Square! " + Shape.super.label(); }
    }
    @FunctionalInterface interface MathOp { int apply(int a, int b); default MathOp twice() { return (a, b) -> apply(apply(a, b), b); } }
    public static void main(String[] args) {
        Shape[] shapes = {new Circle(1), new Square(3), Shape.unit()};
        double sum = 0;
        for (Shape s : shapes) { System.out.println(s.label()); sum += s.area(); }
        System.out.printf("total %.3f%n", sum);
        Named n = new Circle(2.5);
        System.out.println(n.name() + " " + (n instanceof Shape));
        MathOp add = (a, b) -> a + b;
        MathOp mul = (a, b) -> a * b;
        System.out.println(add.apply(2, 3) + " " + mul.apply(4, 5) + " " + add.twice().apply(1, 10));
    }
}
```

JDK 25 output (stdout and stderr):

```
Circle with area 3.14
Square! Square with area 9.00
Square! Square with area 1.00
total 13.142
circle r=2.5 true
5 20 21
```

#### Q04Lambdas.java

```java
import java.util.*;
import java.util.function.*;

public class Q04Lambdas {
    static int triple(int x) { return x * 3; }
    public static void main(String[] args) {
        Function<Integer, Integer> sq = x -> x * x;
        Function<Integer, Integer> plus1 = x -> x + 1;
        System.out.println(sq.apply(5) + " " + sq.andThen(plus1).apply(5) + " " + sq.compose(plus1).apply(5));
        Predicate<String> empty = String::isEmpty;
        Predicate<String> longer = s -> s.length() > 3;
        System.out.println(empty.test("") + " " + empty.negate().test("") + " " + longer.and(s -> s.startsWith("j")).test("java"));
        Supplier<List<String>> maker = ArrayList::new;
        List<String> list = maker.get();
        Consumer<String> adder = list::add;
        adder.accept("kiwi"); adder.accept("fig"); adder.accept("banana"); adder.accept("apple");
        BiFunction<Integer, Integer, Integer> pow = (b, e) -> { int r = 1; for (int i = 0; i < e; i++) r *= b; return r; };
        System.out.println(list + " " + pow.apply(2, 8));
        list.sort(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
        System.out.println(list);
        list.sort(Comparator.comparing(String::length).reversed());
        System.out.println(list);
        list.forEach(s -> System.out.print(s.charAt(0)));
        System.out.println();
        Function<Integer, Integer> t = Q04Lambdas::triple;
        UnaryOperator<String> up = String::toUpperCase;
        BinaryOperator<Integer> max = Math::max;
        System.out.println(t.apply(7) + " " + up.apply("hi") + " " + max.apply(3, 9));
        Runnable r = () -> System.out.println("running");
        r.run();
        int base = 10;
        Function<Integer, Integer> addBase = v -> v + base;
        System.out.println(addBase.apply(5));
        list.forEach(System.out::println);
    }
}
```

JDK 25 output (stdout and stderr):

```
25 26 36
true false true
[kiwi, fig, banana, apple] 256
[fig, kiwi, apple, banana]
[banana, apple, kiwi, fig]
bakf
21 HI 9
running
15
banana
apple
kiwi
fig
```

#### Q05ArrayList.java

```java
import java.util.*;

public class Q05ArrayList {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>();
        for (int i = 1; i <= 6; i++) nums.add(i * 10);
        System.out.println(nums + " size=" + nums.size());
        nums.remove(1);
        nums.remove(Integer.valueOf(50));
        System.out.println(nums + " " + nums.contains(30) + " " + nums.indexOf(40) + " " + nums.get(0));
        nums.add(0, 5);
        nums.set(nums.size() - 1, 99);
        System.out.println(nums);
        nums.removeIf(n -> n % 2 == 1);
        System.out.println(nums);
        List<String> words = new ArrayList<>(List.of("pear", "apple", "fig", "banana"));
        Collections.sort(words);
        System.out.println(words + " " + Collections.max(words) + " " + Collections.min(words, Comparator.comparing(String::length)));
        Collections.reverse(words);
        System.out.println(words + " " + words.subList(1, 3));
        List<Integer> big = new ArrayList<>();
        for (int i = 0; i < 300; i++) big.add(i);
        System.out.println(big.get(127) == big.get(127) ? "same box" : "different");
        Integer p = 1000, q = 1000;
        List<Integer> two = new ArrayList<>(Arrays.asList(p, q));
        System.out.println((two.get(0) == two.get(1)) + " " + two.get(0).equals(two.get(1)));
        List<Integer> fixed = Arrays.asList(3, 1, 2);
        Collections.sort(fixed);
        System.out.println(fixed);
        try { fixed.add(4); } catch (UnsupportedOperationException e) { System.out.println("fixed size"); }
        try { List.of(1, 2).set(0, 5); } catch (UnsupportedOperationException e) { System.out.println("immutable"); }
        try { nums.get(10); } catch (IndexOutOfBoundsException e) { System.out.println(e.getMessage()); }
        System.out.println(String.join(",", words) + " " + words.isEmpty() + " " + new ArrayList<>().isEmpty());
    }
}
```

JDK 25 output (stdout and stderr):

```
[10, 20, 30, 40, 50, 60] size=6
[10, 30, 40, 60] true 2 10
[5, 10, 30, 40, 99]
[10, 30, 40]
[apple, banana, fig, pear] pear fig
[pear, fig, banana, apple] [fig, banana]
same box
false true
[1, 2, 3]
fixed size
immutable
Index 10 out of bounds for length 3
pear,fig,banana,apple false true
```

#### Q06HashMap.java

```java
import java.util.*;

public class Q06HashMap {
    public static void main(String[] args) {
        String text = "the quick brown fox jumps over the lazy dog the end";
        Map<String, Integer> freq = new HashMap<>();
        for (String w : text.split(" ")) freq.put(w, freq.getOrDefault(w, 0) + 1);
        System.out.println(freq);
        Map<String, Integer> merged = new HashMap<>();
        for (String w : text.split(" ")) merged.merge(w, 1, Integer::sum);
        System.out.println(merged.equals(freq) + " " + merged.get("the") + " " + merged.get("cat") + " " + merged.containsKey("fox"));
        Map<Integer, String> byNum = new HashMap<>();
        for (int k : new int[]{42, 7, 100, 3, 17, 64, 33}) byNum.put(k, "v" + k);
        System.out.println(byNum + " " + byNum.keySet() + " " + byNum.values());
        for (Map.Entry<Integer, String> e : byNum.entrySet()) if (e.getKey() > 40) e.setValue(e.getValue().toUpperCase());
        System.out.println(byNum);
        byNum.keySet().removeIf(k -> k < 10);
        System.out.println(byNum + " " + byNum.size());
        Map<String, List<String>> groups = new TreeMap<>();
        for (String w : text.split(" ")) groups.computeIfAbsent(w.substring(0, 1), k -> new ArrayList<>()).add(w);
        System.out.println(groups);
        Map<String, Integer> linked = new LinkedHashMap<>();
        linked.put("zebra", 1); linked.put("apple", 2); linked.put("mango", 3); linked.put("apple", 20);
        System.out.println(linked + " " + linked.remove("zebra") + " " + linked);
        TreeMap<Integer, String> tm = new TreeMap<>(Comparator.reverseOrder());
        tm.put(5, "five"); tm.put(1, "one"); tm.put(9, "nine");
        System.out.println(tm + " " + tm.firstKey());
        Map<Character, Integer> chars = new HashMap<>();
        for (char c : "mississippi".toCharArray()) chars.put(c, chars.getOrDefault(c, 0) + 1);
        System.out.println(chars);
        Map<String, Integer> many = new HashMap<>();
        for (int i = 0; i < 14; i++) many.put("key" + i, i);
        System.out.println(many);
        System.out.println(freq.putIfAbsent("the", 100) + " " + freq.putIfAbsent("new", 1) + " " + freq.size());
    }
}
```

JDK 25 output (stdout and stderr):

```
{the=3, over=1, quick=1, lazy=1, jumps=1, end=1, brown=1, dog=1, fox=1}
true 3 null true
{64=v64, 17=v17, 33=v33, 3=v3, 100=v100, 7=v7, 42=v42} [64, 17, 33, 3, 100, 7, 42] [v64, v17, v33, v3, v100, v7, v42]
{64=V64, 17=v17, 33=v33, 3=v3, 100=V100, 7=v7, 42=V42}
{64=V64, 17=v17, 33=v33, 100=V100, 42=V42} 5
{b=[brown], d=[dog], e=[end], f=[fox], j=[jumps], l=[lazy], o=[over], q=[quick], t=[the, the, the]}
{zebra=1, apple=20, mango=3} 1 {apple=20, mango=3}
{9=nine, 5=five, 1=one} 9
{p=2, s=4, i=4, m=1}
{key1=1, key2=2, key0=0, key5=5, key6=6, key3=3, key4=4, key9=9, key7=7, key8=8, key11=11, key10=10, key13=13, key12=12}
3 null 10
```

#### Q07Sets.java

```java
import java.util.*;

public class Q07Sets {
    public static void main(String[] args) {
        Set<Integer> hs = new HashSet<>();
        for (int x : new int[]{50, 3, 17, 3, 99, 16, 1, 50, 33}) hs.add(x);
        System.out.println(hs + " " + hs.size() + " " + hs.contains(17) + " " + hs.add(3));
        Set<String> names = new HashSet<>(List.of("Ravi", "Asha", "Kiran", "Meera", "Arjun", "Divya"));
        System.out.println(names);
        Set<String> lhs = new LinkedHashSet<>(List.of("c", "a", "b"));
        lhs.add("a");
        System.out.println(lhs);
        TreeSet<Integer> ts = new TreeSet<>(hs);
        System.out.println(ts + " first=" + ts.first() + " last=" + ts.last() + " floor(20)=" + ts.floor(20) + " ceiling(20)=" + ts.ceiling(20) + " higher(99)=" + ts.higher(99));
        System.out.println(ts.headSet(17) + " " + ts.tailSet(17) + " " + ts.pollFirst() + " " + ts);
        Set<Integer> a = new TreeSet<>(List.of(1, 2, 3, 4)), b = new TreeSet<>(List.of(3, 4, 5));
        Set<Integer> union = new TreeSet<>(a); union.addAll(b);
        Set<Integer> inter = new TreeSet<>(a); inter.retainAll(b);
        Set<Integer> diff = new TreeSet<>(a); diff.removeAll(b);
        System.out.println(union + " " + inter + " " + diff);
        Set<Character> seen = new HashSet<>();
        StringBuilder firstRepeat = new StringBuilder();
        for (char c : "programming".toCharArray()) if (!seen.add(c) && firstRepeat.length() == 0) firstRepeat.append(c);
        System.out.println(firstRepeat + " " + seen);
        TreeSet<String> words = new TreeSet<>(Comparator.comparing(String::length).thenComparing(s -> s));
        words.addAll(List.of("bb", "a", "ccc", "aa", "b"));
        System.out.println(words + " " + words.descendingSet());
    }
}
```

JDK 25 output (stdout and stderr):

```
[16, 17, 1, 33, 50, 3, 99] 7 true false
[Meera, Kiran, Ravi, Asha, Divya, Arjun]
[c, a, b]
[1, 3, 16, 17, 33, 50, 99] first=1 last=99 floor(20)=17 ceiling(20)=33 higher(99)=null
[1, 3, 16] [17, 33, 50, 99] 1 [3, 16, 17, 33, 50, 99]
[1, 2, 3, 4, 5] [3, 4] [1, 2]
r [p, a, r, g, i, m, n, o]
[a, b, aa, bb, ccc] [ccc, bb, aa, b, a]
```

#### Q08Deque.java

```java
import java.util.*;

public class Q08Deque {
    public static void main(String[] args) {
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(1); stack.push(2); stack.push(3);
        System.out.println(stack + " peek=" + stack.peek() + " pop=" + stack.pop() + " " + stack);
        Queue<String> q = new ArrayDeque<>();
        q.offer("a"); q.offer("b"); q.add("c");
        System.out.println(q + " poll=" + q.poll() + " peek=" + q.peek() + " " + q + " " + q.size());
        Stack<Character> st = new Stack<>();
        for (char c : "({[".toCharArray()) st.push(c);
        System.out.println(st + " " + st.peek() + " " + st.pop() + " " + st + " " + st.search('(') + " " + st.empty());
        Queue<Integer> lq = new LinkedList<>();
        lq.add(10); lq.add(20); lq.offer(30);
        System.out.println(lq.poll() + " " + lq + " " + lq.peek());
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : new int[]{5, 1, 8, 3, 9, 2, 7}) pq.add(x);
        System.out.println(pq + " size=" + pq.size());
        StringBuilder order = new StringBuilder();
        while (!pq.isEmpty()) order.append(pq.poll()).append(' ');
        System.out.println(order.toString().trim());
        PriorityQueue<String> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
        maxHeap.addAll(List.of("kiwi", "apple", "mango", "fig"));
        System.out.println(maxHeap + " " + maxHeap.poll() + " " + maxHeap);
        Deque<Integer> dq = new ArrayDeque<>();
        dq.addFirst(1); dq.addLast(2); dq.addFirst(0); dq.offerLast(3);
        System.out.println(dq + " " + dq.pollLast() + " " + dq.peekFirst() + " " + dq.removeFirst() + " " + dq);
        try { new ArrayDeque<Integer>().pop(); } catch (NoSuchElementException e) { System.out.println("empty pop"); }
        try { new Stack<Integer>().pop(); } catch (EmptyStackException e) { System.out.println("empty stack " + e.getMessage()); }
        System.out.println(new ArrayDeque<Integer>().poll());
    }
}
```

JDK 25 output (stdout and stderr):

```
[3, 2, 1] peek=3 pop=3 [2, 1]
[a, b, c] poll=a peek=b [b, c] 2
[(, {, [] [ [ [(, {] 2 false
10 [20, 30] 20
[1, 3, 2, 5, 9, 8, 7] size=7
1 2 3 5 7 8 9
[mango, fig, kiwi, apple] mango [kiwi, fig, apple]
[0, 1, 2, 3] 3 0 0 [1, 2]
empty pop
empty stack null
null
```

#### Q09LinkedList.java

```java
public class Q09LinkedList {
    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }
    static Node build(int... vals) {
        Node head = null, tail = null;
        for (int v : vals) {
            Node n = new Node(v);
            if (head == null) head = tail = n;
            else { tail.next = n; tail = n; }
        }
        return head;
    }
    static String show(Node h) {
        StringBuilder sb = new StringBuilder();
        for (Node n = h; n != null; n = n.next) sb.append(n.val).append(n.next != null ? " -> " : "");
        return sb.toString();
    }
    static Node reverse(Node h) {
        Node prev = null, cur = h;
        while (cur != null) { Node nx = cur.next; cur.next = prev; prev = cur; cur = nx; }
        return prev;
    }
    static Node middle(Node h) {
        Node slow = h, fast = h;
        while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
        return slow;
    }
    public static void main(String[] args) {
        Node head = build(1, 2, 3, 4, 5);
        System.out.println(show(head));
        System.out.println("middle " + middle(head).val);
        head = reverse(head);
        System.out.println(show(head));
        Node n = head;
        while (n.next.next != null) n = n.next;
        n.next = null;
        System.out.println(show(head) + " | " + show(null).isEmpty());
    }
}
```

JDK 25 output (stdout and stderr):

```
1 -> 2 -> 3 -> 4 -> 5
middle 3
5 -> 4 -> 3 -> 2 -> 1
5 -> 4 -> 3 -> 2 | true
```

#### Q10Tree.java

```java
public class Q10Tree {
    static class TreeNode {
        int key;
        TreeNode left, right;
        TreeNode(int key) { this.key = key; }
    }
    static TreeNode insert(TreeNode root, int key) {
        if (root == null) return new TreeNode(key);
        if (key < root.key) root.left = insert(root.left, key);
        else if (key > root.key) root.right = insert(root.right, key);
        return root;
    }
    static void inorder(TreeNode r, StringBuilder sb) {
        if (r == null) return;
        inorder(r.left, sb); sb.append(r.key).append(' '); inorder(r.right, sb);
    }
    static int height(TreeNode r) { return r == null ? 0 : 1 + Math.max(height(r.left), height(r.right)); }
    static boolean contains(TreeNode r, int k) { return r != null && (r.key == k || contains(k < r.key ? r.left : r.right, k)); }
    public static void main(String[] args) {
        TreeNode root = null;
        for (int k : new int[]{50, 30, 70, 20, 40, 60, 80, 35}) root = insert(root, k);
        StringBuilder sb = new StringBuilder();
        inorder(root, sb);
        System.out.println(sb.toString().trim());
        System.out.println("height " + height(root) + " " + contains(root, 35) + " " + contains(root, 36) + " root=" + root.key + " left.right=" + root.left.right.key);
    }
}
```

JDK 25 output (stdout and stderr):

```
20 30 35 40 50 60 70 80
height 4 true false root=50 left.right=40
```

#### Q11Generics.java

```java
import java.util.*;

public class Q11Generics {
    static class Box<T> {
        private T value;
        Box(T value) { this.value = value; }
        T get() { return value; }
        void set(T v) { value = v; }
        <R> Box<R> map(java.util.function.Function<T, R> f) { return new Box<>(f.apply(value)); }
        public String toString() { return "Box[" + value + "]"; }
    }
    static class Pair<K, V> {
        final K key; final V val;
        Pair(K k, V v) { key = k; val = v; }
        public String toString() { return "(" + key + ", " + val + ")"; }
    }
    static <T extends Comparable<T>> T maxOf(List<T> items) {
        T best = items.get(0);
        for (T t : items) if (t.compareTo(best) > 0) best = t;
        return best;
    }
    static <T> void swap(T[] arr, int i, int j) { T t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    static double sum(List<? extends Number> nums) { double s = 0; for (Number n : nums) s += n.doubleValue(); return s; }
    public static void main(String[] args) {
        Box<Integer> bi = new Box<>(41);
        bi.set(bi.get() + 1);
        Box<String> bs = bi.map(i -> "#" + i);
        System.out.println(bi + " " + bs + " " + bs.get().length());
        List<Pair<String, Integer>> pairs = new ArrayList<>();
        pairs.add(new Pair<>("a", 1)); pairs.add(new Pair<>("b", 2));
        System.out.println(pairs);
        System.out.println(maxOf(Arrays.asList(3, 9, 4)) + " " + maxOf(List.of("pear", "zucchini", "apple")));
        String[] arr = {"x", "y", "z"};
        swap(arr, 0, 2);
        System.out.println(Arrays.toString(arr) + " " + sum(List.of(1, 2.5, 3L)));
    }
}
```

JDK 25 output (stdout and stderr):

```
Box[42] Box[#42] 3
[(a, 1), (b, 2)]
9 zucchini
[z, y, x] 6.5
```

#### Q12RecordsEnums.java

```java
import java.util.*;

public class Q12RecordsEnums {
    record Point(int x, int y) {
        Point {
            if (x < 0) throw new IllegalArgumentException("x < 0");
        }
        double dist() { return Math.sqrt(x * x + y * y); }
    }
    enum Planet {
        MERCURY(3.303e+23, 2.4397e6), EARTH(5.976e+24, 6.37814e6);
        private final double mass, radius;
        Planet(double mass, double radius) { this.mass = mass; this.radius = radius; }
        double gravity() { return 6.67300E-11 * mass / (radius * radius); }
    }
    enum Level { LOW, MEDIUM, HIGH;
        Level next() { return values()[(ordinal() + 1) % values().length]; }
    }
    public static void main(String[] args) {
        Point p = new Point(3, 4), q = new Point(3, 4);
        System.out.println(p + " " + p.x() + " " + p.dist() + " " + p.equals(q) + " " + (p == q) + " " + (p.hashCode() == q.hashCode()));
        Set<Point> set = new HashSet<>(List.of(p, new Point(1, 2)));
        System.out.println(set.contains(q) + " " + set.size());
        try { new Point(-1, 0); } catch (IllegalArgumentException e) { System.out.println("rejected " + e.getMessage()); }
        for (Planet pl : Planet.values()) System.out.printf("%s %.2f %d%n", pl, pl.gravity(), pl.ordinal());
        Level l = Level.valueOf("MEDIUM");
        System.out.println(l + " " + l.next() + " " + l.next().next() + " " + l.compareTo(Level.HIGH) + " " + l.name() + " " + (l == Level.MEDIUM));
        switch (l) {
            case LOW -> System.out.println("relax");
            case MEDIUM -> System.out.println("watch");
            case HIGH -> System.out.println("act");
        }
        String verdict = switch (Level.HIGH) { case LOW, MEDIUM -> "ok"; case HIGH -> "alert"; };
        System.out.println(verdict + " " + Arrays.toString(Level.values()));
        try { Level.valueOf("NONE"); } catch (IllegalArgumentException e) { System.out.println(e.getMessage()); }
    }
}
```

JDK 25 output (stdout and stderr):

```
Point[x=3, y=4] 3 5.0 true false true
true 2
rejected x < 0
MERCURY 3.70 0
EARTH 9.80 1
MEDIUM HIGH LOW -1 MEDIUM true
watch
alert [LOW, MEDIUM, HIGH]
No enum constant Q12RecordsEnums.Level.NONE
```

#### Q13Anon.java

```java
import java.util.*;

public class Q13Anon {
    private int counter = 100;
    class Inner {
        int bump() { return ++counter; }
    }
    interface Greeter { String greet(String who); }
    void run() {
        Inner in = new Inner();
        in.bump(); in.bump();
        System.out.println("counter " + counter);
    }
    public static void main(String[] args) {
        String prefix = "Hi ";
        Greeter g = new Greeter() {
            int calls = 0;
            public String greet(String who) { calls++; return prefix + who + " #" + calls; }
        };
        System.out.println(g.greet("Asha") + " | " + g.greet("Ravi"));
        List<String> names = new ArrayList<>(List.of("Meera", "Al", "Kiran"));
        Collections.sort(names, new Comparator<String>() {
            @Override public int compare(String a, String b) { return a.length() - b.length(); }
        });
        System.out.println(names);
        Runnable r = new Runnable() { public void run() { System.out.println("anon run " + names.size()); } };
        r.run();
        new Q13Anon().run();
    }
}
```

JDK 25 output (stdout and stderr):

```
Hi Asha #1 | Hi Ravi #2
[Al, Meera, Kiran]
anon run 3
counter 102
```

#### Q14Iterator.java

```java
import java.util.*;

public class Q14Iterator {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
        Iterator<Integer> it = list.iterator();
        while (it.hasNext()) if (it.next() % 2 == 0) it.remove();
        System.out.println(list);
        try {
            for (Integer x : list) if (x == 1) list.remove(x);
        } catch (ConcurrentModificationException e) {
            System.out.println("CME " + list);
        }
        List<String> s = new ArrayList<>(List.of("a", "b", "c"));
        for (String x : s) if (x.equals("b")) s.remove(x);
        System.out.println("no CME " + s);
        Map<String, Integer> m = new HashMap<>(Map.of("x", 1));
        m.put("y", 2); m.put("z", 3);
        Iterator<Map.Entry<String, Integer>> mi = m.entrySet().iterator();
        while (mi.hasNext()) { Map.Entry<String, Integer> e = mi.next(); if (e.getValue() == 2) mi.remove(); }
        System.out.println(m);
        try {
            for (String k : m.keySet()) m.put(k + k, 0);
        } catch (ConcurrentModificationException e) { System.out.println("map CME"); }
        Iterator<Integer> e = new ArrayList<Integer>().iterator();
        try { e.next(); } catch (NoSuchElementException ex) { System.out.println("NSEE"); }
    }
}
```

JDK 25 output (stdout and stderr):

```
[1, 3, 5]
CME [3, 5]
no CME [a, c]
{x=1, z=3}
map CME
NSEE
```

#### Q15Streams.java

```java
import java.util.*;
import java.util.stream.*;

public class Q15Streams {
    public static void main(String[] args) {
        List<Integer> nums = List.of(5, 3, 8, 1, 9, 2, 8, 3);
        List<Integer> evensSq = nums.stream().filter(n -> n % 2 == 0).map(n -> n * n).collect(Collectors.toList());
        System.out.println(evensSq + " " + nums.stream().mapToInt(Integer::intValue).sum() + " " + nums.stream().mapToInt(n -> n).max().getAsInt());
        System.out.println(nums.stream().distinct().sorted().collect(Collectors.toList()) + " " + nums.stream().sorted(Comparator.reverseOrder()).limit(3).toList());
        System.out.println(nums.stream().mapToInt(n -> n).average().getAsDouble() + " " + nums.stream().count() + " " + nums.stream().anyMatch(n -> n > 8) + " " + nums.stream().allMatch(n -> n > 0));
        List<String> words = List.of("apple", "banana", "cherry", "avocado", "blueberry", "fig");
        System.out.println(words.stream().filter(w -> w.length() > 4).map(String::toUpperCase).collect(Collectors.joining(", ", "[", "]")));
        Map<Character, Long> byFirst = words.stream().collect(Collectors.groupingBy(w -> w.charAt(0), Collectors.counting()));
        System.out.println(byFirst);
        Map<Integer, List<String>> byLen = words.stream().collect(Collectors.groupingBy(String::length));
        System.out.println(byLen);
        System.out.println(IntStream.rangeClosed(1, 5).map(i -> i * i).sum() + " " + IntStream.range(0, 5).boxed().collect(Collectors.toList()) + " " + nums.stream().reduce(0, Integer::sum));
        Optional<String> longest = words.stream().max(Comparator.comparing(String::length));
        System.out.println(longest.get() + " " + longest.isPresent() + " " + words.stream().filter(w -> w.startsWith("z")).findFirst().orElse("none"));
        int[] arr = {4, 2, 7};
        System.out.println(Arrays.stream(arr).sum() + " " + Arrays.stream(arr).min().getAsInt() + " " + "hello".chars().filter(c -> c == 'l').count());
        Stream.of("x", "y", "z").map(s -> s + s).forEach(System.out::print);
        System.out.println();
        List<String> trace = new ArrayList<>();
        Stream.of(1, 2, 3, 4).filter(n -> { trace.add("f" + n); return n % 2 == 0; }).map(n -> { trace.add("m" + n); return n; }).findFirst();
        System.out.println(trace);
        System.out.println(words.stream().collect(Collectors.partitioningBy(w -> w.length() > 5)));
    }
}
```

JDK 25 output (stdout and stderr):

```
[64, 4, 64] 39 9
[1, 2, 3, 5, 8, 9] [9, 8, 8]
4.875 8 true true
[APPLE, BANANA, CHERRY, AVOCADO, BLUEBERRY]
{a=2, b=2, c=1, f=1}
{3=[fig], 5=[apple], 6=[banana, cherry], 7=[avocado], 9=[blueberry]}
55 [0, 1, 2, 3, 4] 39
blueberry true none
13 2 2
xxyyzz
[f1, f2, m2]
{false=[apple, fig], true=[banana, cherry, avocado, blueberry]}
```

#### Q16Scanner.java

```java
import java.util.Scanner;

public class Q16Scanner {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        long sum = 0;
        for (int i = 0; i < n; i++) { a[i] = sc.nextInt(); sum += a[i]; }
        sc.nextLine();
        String name = sc.nextLine();
        double price = sc.nextDouble();
        String word = sc.next();
        System.out.println("n=" + n + " sum=" + sum + " name=[" + name + "] price=" + price + " word=" + word);
        System.out.println(sc.hasNextInt() + " " + sc.hasNext());
    }
}
```

stdin:

```
4
10 20 30 40
Ravi Kumar
99.5 hello
```

JDK 25 output (stdout and stderr):

```
n=4 sum=100 name=[Ravi Kumar] price=99.5 word=hello
false false
```

#### Q17Scanner2.java

```java
import java.util.*;

public class Q17Scanner2 {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int count = 0, total = 0;
        while (in.hasNextInt()) { total += in.nextInt(); count++; }
        String stop = in.next();
        String rest = in.nextLine();
        List<String> lines = new ArrayList<>();
        while (in.hasNextLine()) lines.add(in.nextLine());
        System.out.println(count + " " + total + " stop=" + stop + " rest=[" + rest + "] lines=" + lines);
        try { in.next(); } catch (NoSuchElementException e) { System.out.println("no more input"); }
    }
}
```

stdin:

```
5 6
7 end of numbers
first line
second line
```

JDK 25 output (stdout and stderr):

```
3 18 stop=end rest=[ of numbers] lines=[first line, second line]
no more input
```

#### Q18CustomException.java

```java
public class Q18CustomException {
    static class InsufficientFundsException extends Exception {
        private final double shortBy;
        InsufficientFundsException(String msg, double shortBy) { super(msg); this.shortBy = shortBy; }
        double getShortBy() { return shortBy; }
    }
    static class Account {
        private double balance;
        Account(double b) { balance = b; }
        void withdraw(double amt) throws InsufficientFundsException {
            if (amt > balance) throw new InsufficientFundsException("need " + amt + " have " + balance, amt - balance);
            balance -= amt;
        }
    }
    static void process(Account a) {
        try {
            a.withdraw(500);
        } catch (InsufficientFundsException e) {
            throw new IllegalStateException("payment failed", e);
        }
    }
    public static void main(String[] args) {
        Account acc = new Account(300);
        try {
            acc.withdraw(100);
            acc.withdraw(250);
        } catch (InsufficientFundsException e) {
            System.out.println(e.getMessage() + " short by " + e.getShortBy() + " " + e);
        }
        process(acc);
    }
}
```

JDK 25 output (stdout and stderr):

```
need 250.0 have 200.0 short by 50.0 Q18CustomException$InsufficientFundsException: need 250.0 have 200.0
Exception in thread "main" java.lang.IllegalStateException: payment failed
	at Q18CustomException.process(Q18CustomException.java:19)
	at Q18CustomException.main(Q18CustomException.java:30)
Caused by: Q18CustomException$InsufficientFundsException: need 500.0 have 200.0
	at Q18CustomException$Account.withdraw(Q18CustomException.java:11)
	at Q18CustomException.process(Q18CustomException.java:17)
	at Q18CustomException.main(Q18CustomException.java:30)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:104)
	at java.base/java.lang.reflect.Method.invoke(Method.java:565)
	at jdk.compiler/com.sun.tools.javac.launcher.SourceLauncher.execute(SourceLauncher.java:258)
	at jdk.compiler/com.sun.tools.javac.launcher.SourceLauncher.run(SourceLauncher.java:138)
	at jdk.compiler/com.sun.tools.javac.launcher.SourceLauncher.main(SourceLauncher.java:76)
```

#### Q19Equals.java

```java
import java.util.*;

public class Q19Equals {
    static class Plain { int id; Plain(int id) { this.id = id; } }
    static class Emp {
        final String name; final int id;
        Emp(String n, int i) { name = n; id = i; }
        @Override public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Emp)) return false;
            Emp e = (Emp) o;
            return id == e.id && name.equals(e.name);
        }
        @Override public int hashCode() { return Objects.hash(name, id); }
        @Override public String toString() { return name + "#" + id; }
    }
    public static void main(String[] args) {
        Plain p1 = new Plain(1), p2 = new Plain(1);
        System.out.println(p1.equals(p2) + " " + p1.toString().startsWith("Q19Equals$Plain@") + " " + (p1.hashCode() == p1.hashCode()));
        Set<Plain> ps = new HashSet<>(List.of(p1, p2));
        System.out.println(ps.size());
        Emp e1 = new Emp("Asha", 7), e2 = new Emp("Asha", 7), e3 = new Emp("Ravi", 8);
        System.out.println(e1.equals(e2) + " " + (e1 == e2) + " " + e1.hashCode() + " " + (e1.hashCode() == e2.hashCode()));
        Set<Emp> es = new HashSet<>(List.of(e1, e3));
        System.out.println(es.contains(e2) + " " + es.size());
        Map<Emp, String> roles = new HashMap<>();
        roles.put(e1, "dev"); roles.put(e2, "lead"); roles.put(e3, "qa");
        System.out.println(roles.size() + " " + roles.get(new Emp("Asha", 7)) + " " + Objects.equals(null, null) + " " + Objects.hash(1, 2, 3));
        String s1 = "Hi", s2 = new String("Hi");
        System.out.println(s1.hashCode() == s2.hashCode());
    }
}
```

JDK 25 output (stdout and stderr):

```
false true true
2
true false 63558749 true
true 2
2 lead true 30817
true
```

#### Q20InitOrder.java

```java
public class Q20InitOrder {
    static class Parent {
        static { System.out.println("1 Parent static"); }
        { System.out.println("3 Parent instance block"); }
        Parent() { System.out.println("4 Parent constructor"); }
    }
    static class Child extends Parent {
        static String tag = log("2 Child static field");
        static { System.out.println("2b Child static block"); }
        String name = log("5 Child field");
        { System.out.println("6 Child instance block"); }
        Child() { super(); System.out.println("7 Child constructor"); }
        Child(String n) { this(); name = n; System.out.println("8 named " + name); }
        static String log(String s) { System.out.println(s); return s; }
    }
    public static void main(String[] args) {
        System.out.println("main starts");
        new Child();
        System.out.println("--- second ---");
        new Child("x");
    }
}
```

JDK 25 output (stdout and stderr):

```
main starts
1 Parent static
2 Child static field
2b Child static block
3 Parent instance block
4 Parent constructor
5 Child field
6 Child instance block
7 Child constructor
--- second ---
3 Parent instance block
4 Parent constructor
5 Child field
6 Child instance block
7 Child constructor
8 named x
```

#### Q21NPE.java

```java
public class Q21NPE {
    static class Node { int val; Node next; }
    static String find() { return null; }
    public static void main(String[] args) {
        String s = null;
        try { s.length(); } catch (NullPointerException e) { System.out.println(e.getMessage()); }
        Node n = new Node();
        try { int v = n.next.val; } catch (NullPointerException e) { System.out.println(e.getMessage()); }
        int[] arr = null;
        try { arr[0] = 1; } catch (NullPointerException e) { System.out.println(e.getMessage()); }
        try { System.out.println(arr.length); } catch (NullPointerException e) { System.out.println(e.getMessage()); }
        try { find().trim(); } catch (NullPointerException e) { System.out.println(e.getMessage()); }
        Integer boxed = null;
        try { int x = boxed; } catch (NullPointerException e) { System.out.println(e.getMessage()); }
        try { n.next.next = n; } catch (NullPointerException e) { System.out.println(e.getMessage()); }
    }
}
```

JDK 25 output (stdout and stderr):

```
Cannot invoke "String.length()" because "<local1>" is null
Cannot read field "val" because "<local2>.next" is null
Cannot store to int array because "<local3>" is null
Cannot read the array length because "<local3>" is null
Cannot invoke "String.trim()" because the return value of "Q21NPE.find()" is null
Cannot invoke "java.lang.Integer.intValue()" because "<local4>" is null
Cannot assign field "next" because "<local2>.next" is null
```

#### Q22Random.java

```java
import java.util.*;

public class Q22Random {
    public static void main(String[] args) {
        Random r = new Random(42);
        for (int i = 0; i < 6; i++) System.out.print(r.nextInt(10) + " ");
        System.out.println();
        System.out.println(r.nextInt() + " " + r.nextDouble() + " " + r.nextBoolean() + " " + r.nextLong() + " " + r.nextInt(16));
        Random r2 = new Random(7);
        System.out.println(r2.nextInt(5, 10) + " " + r2.nextInt(100) + " " + r2.nextGaussian());
        List<Integer> deck = new ArrayList<>();
        for (int i = 1; i <= 10; i++) deck.add(i);
        Collections.shuffle(deck, new Random(123));
        System.out.println(deck);
        Random same1 = new Random(2024), same2 = new Random(2024);
        System.out.println(same1.nextInt(1000) == same2.nextInt(1000));
    }
}
```

JDK 25 output (stdout and stderr):

```
0 3 8 4 0 5 
1190043011 0.7077105889551186 false -1782466964123969572 5
6 64 1.2540167679374974
[7, 9, 2, 5, 10, 4, 1, 8, 6, 3]
true
```

#### Q23Optional.java

```java
import java.util.*;

public class Q23Optional {
    static Optional<String> lookup(Map<String, String> m, String k) { return Optional.ofNullable(m.get(k)); }
    public static void main(String[] args) {
        Map<String, String> caps = new HashMap<>(Map.of("India", "Delhi"));
        System.out.println(lookup(caps, "India") + " " + lookup(caps, "Mars") + " " + lookup(caps, "Mars").orElse("unknown"));
        System.out.println(lookup(caps, "India").map(String::length).get() + " " + lookup(caps, "India").filter(c -> c.startsWith("X")).isPresent());
        lookup(caps, "India").ifPresent(c -> System.out.println("capital " + c));
        try { lookup(caps, "Mars").get(); } catch (NoSuchElementException e) { System.out.println(e.getMessage()); }
        try { lookup(caps, "Mars").orElseThrow(() -> new IllegalArgumentException("no capital")); } catch (IllegalArgumentException e) { System.out.println(e.getMessage()); }
        System.out.println(Optional.empty().isEmpty() + " " + Optional.of(5).map(x -> x * 2).orElse(0));
    }
}
```

JDK 25 output (stdout and stderr):

```
Optional[Delhi] Optional.empty unknown
5 false
capital Delhi
No value present
no capital
true 10
```

#### Q24Bank.java

```java
import java.util.*;

public class Q24Bank {
    static abstract class Account {
        private static int nextId = 1000;
        protected final int id;
        protected final String owner;
        protected double balance;
        Account(String owner, double opening) { this.id = nextId++; this.owner = owner; this.balance = opening; }
        void deposit(double amt) { if (amt <= 0) throw new IllegalArgumentException("bad amount"); balance += amt; }
        boolean withdraw(double amt) { if (amt > balance) return false; balance -= amt; return true; }
        abstract double monthlyInterest();
        @Override public String toString() { return String.format("%s[%d] %-6s %10.2f", getClass().getSimpleName(), id, owner, balance); }
    }
    static class Savings extends Account {
        Savings(String o, double b) { super(o, b); }
        double monthlyInterest() { return balance * 0.04 / 12; }
    }
    static class Current extends Account {
        Current(String o, double b) { super(o, b); }
        double monthlyInterest() { return 0; }
        @Override boolean withdraw(double amt) { if (amt > balance + 500) return false; balance -= amt; return true; }
    }
    public static void main(String[] args) {
        List<Account> bank = new ArrayList<>();
        bank.add(new Savings("Asha", 5000));
        bank.add(new Current("Ravi", 200));
        bank.add(new Savings("Meera", 12000.5));
        bank.get(0).deposit(1500);
        System.out.println(bank.get(1).withdraw(600) + " " + bank.get(1).withdraw(200) + " " + bank.get(2).withdraw(20000));
        for (Account a : bank) a.balance += a.monthlyInterest();
        bank.sort(Comparator.comparingDouble((Account a) -> a.balance).reversed());
        bank.forEach(System.out::println);
        double total = 0;
        for (Account a : bank) total += a.balance;
        System.out.printf("Total: %,.2f across %d accounts%n", total, bank.size());
        try { bank.get(0).deposit(-5); } catch (IllegalArgumentException e) { System.out.println("rejected: " + e.getMessage()); }
    }
}
```

JDK 25 output (stdout and stderr):

```
true false false
Savings[1002] Meera    12040.50
Savings[1000] Asha      6521.67
Current[1001] Ravi      -400.00
Total: 18,162.17 across 3 accounts
rejected: bad amount
```

#### Q25Comparable.java

```java
import java.util.*;

public class Q25Comparable {
    static class Student implements Comparable<Student> {
        String name; double gpa; int age;
        Student(String n, double g, int a) { name = n; gpa = g; age = a; }
        public int compareTo(Student o) {
            int c = Double.compare(o.gpa, gpa);
            return c != 0 ? c : name.compareTo(o.name);
        }
        public String toString() { return name + "(" + gpa + ")"; }
    }
    public static void main(String[] args) {
        List<Student> list = new ArrayList<>(List.of(new Student("Kiran", 8.5, 20), new Student("Asha", 9.1, 21), new Student("Arjun", 8.5, 19), new Student("Divya", 7.9, 22)));
        Collections.sort(list);
        System.out.println(list);
        list.sort(Comparator.comparingInt(s -> s.age));
        System.out.println(list);
        PriorityQueue<Student> pq = new PriorityQueue<>(list);
        System.out.print("by rank:");
        while (!pq.isEmpty()) System.out.print(" " + pq.poll().name);
        System.out.println();
        TreeMap<Student, Integer> ranks = new TreeMap<>();
        for (Student s : list) ranks.put(s, s.age);
        System.out.println(ranks.firstKey() + " " + ranks.lastEntry().getValue() + " " + ranks.size());
        Student[] arr = list.toArray(new Student[0]);
        Arrays.sort(arr, Comparator.comparing((Student s) -> s.name).reversed());
        System.out.println(Arrays.toString(arr));
    }
}
```

JDK 25 output (stdout and stderr):

```
[Asha(9.1), Arjun(8.5), Kiran(8.5), Divya(7.9)]
[Arjun(8.5), Kiran(8.5), Asha(9.1), Divya(7.9)]
by rank: Asha Arjun Kiran Divya
Asha(9.1) 22 4
[Kiran(8.5), Divya(7.9), Asha(9.1), Arjun(8.5)]
```
