# Practice layer — quizzes, recall prompts, interview cards, takeaways

*Added 2026-10-18. On the page these render through the learning-layer JS: quizzes (`QZ`) at the end of each lesson, recall prompts (`RC`) in the Revise hub, interview cards (`.ia`) and takeaways (`.takeaways`) inside the sections named below. Every "what does this print" item was run on JDK 25. Lesson 00's cards and takeaways are already in its own text above.*

## Interview answer cards (Lessons 01–04)

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

## 5 takeaways per lesson

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

## Lesson 00 quiz (12 questions)

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

## Lesson 01 quiz (10 questions)

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

## Lesson 02 quiz (10 questions)

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

## Lesson 03 quiz (10 questions)

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

## Lesson 04 quiz (10 questions)

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

## Lesson 05 quiz (12 questions)

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

### Lesson 05 recall prompts

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


## Lesson 06 quiz (12 questions)

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

### Lesson 06 recall prompts

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


## Lesson 06 · Guess the Big-O (12 questions, section O(n))

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

## Lesson 06 · Check yourself per sort (30 questions, end of each sort's review section)

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

## Lesson 07 quiz (12 questions)

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
