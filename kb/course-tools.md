# Course tools — mock interview and complexity cheat sheet (page sections 17–18)

## Mock interview (page section 17, `#mock`)
A timed drill built from all 87 numbered interview questions (every `<details class="d">` with a `.q` badge) in Lessons 00–04. The learner picks lessons (L00–L04, none = all), "Weak only", round size (5/10/20/All) and a timer (Off/45/60/90/120 s). For each question they answer aloud, reveal the model answer (Space, or automatically when time runs out), and rate it: 1 nailed, 2 shaky, 3 missed. Shaky and missed become the weak list. The end screen lists the weak questions with links that open the original answer, and offers "Drill these again". Why: reading an answer and saying it are different skills.

## Complexity cheat sheet (page section 18, `#bigo`)
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
