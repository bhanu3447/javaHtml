# Lesson 02 — String Concepts Deep Dive (theory first)

*This lesson is about **concepts**: how Strings are stored, how the String Constant Pool (SCP) works, what `new String()` really does, `==` vs `equals()`, StringBuilder and StringBuffer internals, and every String method. Code is kept small. Every program was run on JDK 25 (Temurin 25.0.4.1) and its output is in the comments.*

## Table of Contents

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

## 1. The JVM memory map: where Strings live

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

## 2. Anatomy of a String object

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

## 3. The String Constant Pool (SCP) in depth

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

## 4. What `new String("x")` really does, and "how many objects?"

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

## 5. `==` vs `equals()` vs `hashCode()` vs `compareTo()`

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

## 6. Immutability: how it is built

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

## 7. StringBuilder and StringBuffer internals

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

## 8. How `+` concatenation works

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

## 9. Complete method reference

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

## 10. `null`, the `CharSequence` family, and Strings elsewhere

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

## 11. Tricky outputs

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

## 12. 25 more interview questions

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

## 13. Concept map (revision)

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
