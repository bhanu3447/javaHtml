# Lesson 07 — The Collections Framework (Level 3)

*Added 2026-10-22. Page `java/lessons/07-collections.html`, band `#coll`, sections C1–C12. Level 3 of the roadmap. Arrays (Lesson 04) have a fixed size and almost no behaviour; real programs need lists that grow, sets without duplicates, maps from keys to values, and queues. The Collections Framework gives you all of them behind a few interfaces. This lesson has 12 sections, 12 verified programs, 2 figures, 13 interactive labs (including the **parking lot** that explains HashMap), 18 interview questions and a 12-question quiz. It builds on `equals`/`hashCode` from Lesson 05 and Big-O from Lesson 06.*

> All code has been compiled and run on JDK 25. The output is shown in the comments.

## C1. The Collections Framework: the map of every type (`#c-overview`)

> **In 30 seconds** A **collection** is an object that holds other objects. Java gives you four kinds: a **List** (ordered, indexed, duplicates allowed), a **Set** (no duplicates), a **Queue**/**Deque** (take from the front, or both ends) and a **Map** (key → value). The first three extend `Collection`, which extends `Iterable` (so for-each works). `Map` is a separate tree. You declare the **interface** (`List`) and create a **class** (`ArrayList`).

**Why it exists:** before Java 1.2 every project wrote its own resizable array and hash table, each with different method names. One framework with shared interfaces means any code that accepts a `List` works with every list, and you can swap `ArrayList` for `LinkedList` by changing one word.

**Analogy:** the interfaces are **job titles** (List = "a numbered shelf", Set = "a guest list", Queue = "a ticket counter", Map = "a parking lot with numbered bays"), and the classes are the **people** who do the job in different ways. You hire for the title; you can change who fills it.

### See it

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

## C2. Generics: type-safe collections (`#c-generics`)

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

### See it: the wildcard checker

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

## C3. List: ArrayList vs LinkedList (`#c-list`)

> **In 30 seconds** **ArrayList** wraps an `Object[]`. `get(i)` is O(1); adding at the end is **amortised O(1)**; when the array is full it grows by half (`new = old + old/2`, starting at 10) and copies. Inserting or removing in the middle shifts everything after it: O(n). **LinkedList** is a doubly linked list of nodes: O(1) at the two ends, but `get(i)` walks node by node: O(n). In practice ArrayList wins almost always, because arrays are cache-friendly.

**Analogy:** ArrayList is a **row of numbered cinema seats**: you go straight to seat 7, but making someone sit in seat 2 means everyone from seat 2 onwards moves one seat right. LinkedList is a **treasure hunt**: each clue tells you where the next one is. Adding a clue is easy once you're there; getting to clue 7 means reading clues 1 to 6.

### See it

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

## C4. HashMap internals: hashing, buckets, resize and treeify (`#c-hashmap`)

> **In 30 seconds** A HashMap is an array of **buckets** (16 by default). To store a key it calls `key.hashCode()`, mixes the high bits in (`h ^ (h >>> 16)`) and picks the bucket with `hash & (n − 1)`. Keys that land in the same bucket form a **linked chain**; `equals` finds the right one. When **size > capacity × 0.75** the table **doubles** and every entry is re-placed. A chain that would exceed 8 becomes a **red-black tree** (only once the table has 64+ buckets). Average `get`/`put`: **O(1)**.

**Why it exists:** searching a list for a key is O(n). If the key itself tells you where to look, you jump straight to one small bucket: O(1) on average, whatever the size.

**Analogy (remember this one):** a HashMap is a **parking lot with numbered bays**. The car's **number plate is the key**. The valet turns the plate into a bay number (**`hashCode` picks the bay**), drives there, and if several cars share that bay he reads each plate until one matches (**`equals` finds your car**). When the lot is three-quarters full, the owner **builds a lot twice as big** and re-parks every car (resize).

### Remember it: the parking lot

**Lab `#anPark`:** Parking lot analogy: hashCode picks the bay, equals finds the car; a changed plate is lost; rebuild at 75%.

> **💡 Remember it****hashCode picks the bay, equals finds your car.** Change your number plate while parked (a mutable key) and the valet will look in the wrong bay forever.

**Figure `#fig-hashmap`.** **Inside `HashMap.put` (Java 8+).** The table is created on the first `put`. Each bucket is empty, a chain of `Node`s (new nodes go at the tail), or a tree of `TreeNode`s. "plum" is drawn in bucket 1 for illustration; where a real key lands depends on its hash, as the lab below computes. A `null` key is allowed (hash 0, bucket 0). Capacity is always a power of two, so `hash & (n − 1)` keeps the low bits: a non-negative remainder modulo n without a slow division (plain `%` would even go negative for negative hashes).

### See it: a real HashMap

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

### Why keys must not change: the lost car

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

## C5. Sets and LinkedHashMap: HashSet, LinkedHashSet, TreeSet and an LRU cache (`#c-sets`)

> **In 30 seconds** A **HashSet is a HashMap in disguise**: each element is stored as a key with a dummy value, so it has the same O(1) `add`/`contains` and the same `equals`/`hashCode` rules. **LinkedHashSet**/**LinkedHashMap** add a doubly linked list through the entries, so iteration follows insertion order. With `accessOrder = true`, a LinkedHashMap moves each entry you read to the end, and `removeEldestEntry` turns it into an **LRU cache**. **TreeSet** keeps elements sorted (O(log n)).

**Analogy:** an LRU cache is a **small fridge shelf** with room for three things. Whatever you just used goes to the front; when something new arrives and the shelf is full, the thing at the back, untouched the longest, goes out.

### See it: an LRU cache

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

## C6. TreeMap and TreeSet: sorted and navigable (`#c-treemap`)

> **In 30 seconds** A **TreeMap** keeps its keys **sorted** in a **red-black tree** (a self-balancing binary search tree), so `get`/`put`/`remove` are **O(log n)**. In return it answers questions a HashMap can't: the **nearest** key (`floorKey`, `ceilingKey`, `lowerKey`, `higherKey`), the **first**/**last**, and **ranges** (`headMap`, `tailMap`, `subMap`). Keys must be `Comparable`, or you pass a `Comparator`.

**Analogy:** a TreeMap is a **dictionary**. You can't jump straight to a word the way a HashMap jumps to a bay, but you can open it in the middle and halve the search each time, and you can always say "the word just before *mango*" or "every word from *c* to *f*".

### See it

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

## C7. Queue, Deque and PriorityQueue (`#c-queue`)

> **In 30 seconds** A **Queue** hands out items in a defined order: FIFO for `ArrayDeque`, smallest first for `PriorityQueue`. A **Deque** (double-ended queue) works at both ends, so it is also the right **stack** (`push`/`pop`). **ArrayDeque** is a circular array: O(1) at both ends. **PriorityQueue** is a **binary min-heap** in an array: `peek` O(1), `offer`/`poll` O(log n). Its `toString()` shows heap order, **not sorted order**.

**Analogy:** ArrayDeque is a **ticket counter** line (join at the back, served from the front) that can also take people at the front. PriorityQueue is a **hospital emergency room**: the most urgent patient is always seen next, whatever time they came in.

### See it: the binary heap

Offer and poll on a real min-heap. The tree and the array are the same data: the children of index `i` are `2i + 1` and `2i + 2`. Watch the new value **sift up** and the moved last value **sift down**.

**Lab `#clHeap`:** Binary min-heap: offer sifts up, poll sifts down (PriorityQueue).

### See it: the circular ArrayDeque

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

## C8. Comparable vs Comparator (`#c-compare`)

> **In 30 seconds** **Comparable** (`compareTo`) is the class's one **natural order**, written inside the class: String is alphabetical, Integer is numeric. **Comparator** (`compare`) is an **external** order you can have many of, built with `Comparator.comparing(...)`, `.thenComparing(...)` and `.reversed()`. Both return negative / zero / positive. Sorted collections treat **compare == 0 as "the same element"**.

**Analogy:** Comparable is the **roll number** printed on every student's ID card: one built-in order. A Comparator is a **teacher deciding how to line the class up today**: by height, by marks, then by name to break ties.

### See it: build a comparator

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

## C9. Iterators and fail-fast: ConcurrentModificationException (`#c-iter`)

> **In 30 seconds** The for-each loop uses an **Iterator**. Every structural change to an ArrayList or HashMap bumps a counter, **`modCount`**. The iterator remembers the value it started with (`expectedModCount`) and, on each `next()`, throws **`ConcurrentModificationException`** if they differ. So **don't add or remove through the collection while looping over it**: use `iterator.remove()` or `removeIf`. "Fail-fast" is best effort, not a guarantee: one famous case doesn't throw at all.

**Analogy:** a **museum guide** counts the paintings before the tour. If someone quietly removes a painting while the group is walking, the guide notices the count is different at the next stop and stops the tour, rather than describing a wall that's no longer there.

### See it

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

## C10. Immutable and unmodifiable collections (`#c-immut`)

> **In 30 seconds** **`List.of`, `Set.of`, `Map.of`** (Java 9+) create truly **immutable** collections: any change throws `UnsupportedOperationException`, and `null` is rejected. **`Collections.unmodifiableList(x)`** is only a **read-only view**: you can't change it, but whoever holds `x` can, and the view shows it. **`List.copyOf(x)`** takes a real immutable copy. **`Arrays.asList`** is fixed-size but writable, and writes go through to the array.

**Analogy:** an unmodifiable view is a **shop window**: you can't touch the goods, but the shopkeeper can rearrange them behind the glass. An immutable copy is a **photograph** of the window: it never changes.

### See it

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

## C11. Thread-safe collections: ConcurrentHashMap and friends (`#c-conc`)

> **In 30 seconds** The everyday collections are **not thread-safe**: two threads doing `map.put(k, map.get(k) + 1)` lose updates. **`Collections.synchronizedMap`** (and the legacy `Hashtable`) put one lock around every call: safe, but one thread at a time. **`ConcurrentHashMap`** locks only the **bucket** being written (and uses CAS for empty buckets), reads without locking, and gives **atomic** `merge`, `compute` and `putIfAbsent`. **`CopyOnWriteArrayList`** copies the array on every write: great for read-mostly lists.

**Analogy:** `synchronizedMap` is a **library with one door**: one visitor inside at a time. `ConcurrentHashMap` is a library where **each shelf has its own small lock**: many people work at once unless they want the very same shelf.

### See it: the lost update

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

## C12. Collections: interview questions and review (`#c-review`)

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

### 5 takeaways

**5 takeaways**

- Declare interfaces, create classes: `List`/`ArrayList`, `Set`/`HashSet`, `Map`/`HashMap`, `Deque`/`ArrayDeque`.
- HashMap: hashCode picks the bay, equals finds the car; resize at 0.75; trees after 8; keep keys immutable.
- Need order? LinkedHash* for insertion/access order, Tree* for sorted order and ranges.
- Comparator chains for sorting; compare == 0 means "duplicate" in sorted collections; never subtract.
- Never change a collection while looping over it (use removeIf); share between threads only via concurrent collections.

### Check yourself

Answer before you look. Each answer locks and explains itself; your answers are saved in this browser.

**Quiz:** `QZ.l07` (12 questions, see Practice layer → "Lesson 07 quiz"); recall prompts `RC.l07`.

### Implementation notes (Lesson 07 page)

- Labs live in the `course.js` block "Collections labs (v34)" (just before the OOP car story `let OLF=null;`), CSS block `/* collections labs v34 */` at the end of `course.css`. All lab classes are prefixed `cl-` because `.f .e .t .st .bad .cur` are global.
- `#clMap` follows `java.util.HashMap` exactly. Checked by reflection on JDK 25: with 16 keys built from "Aa"/"BB" (all hashCode -540425984), a new map resizes 16 → 32 on the 9th key, 32 → 64 on the 10th, and the bin becomes `TreeNode`s on the 11th; with `new HashMap<>(64)` the 9th key treeifies. 12 entries keep 16 buckets, the 13th makes 32. Removal untreeifies at ≤ 6 nodes in the lab (the JDK does it when the tree becomes very small).
- `#anPark` uses 8 bays (rebuild at the 7th car) for the picture; on resize it re-parks from the **stored** hash, like `HashMap` (a car whose plate changed stays lost).
- `#clPecs` holds the javac matrix generated by compiling every pair (5 parameter types × 6 statements, × 4 argument lists) on JDK 25.
- Command palette entries (`TOOLS`), Before you start (`START.l07`), 5 glossary terms (load factor, type erasure, fail-fast, red-black tree, binary heap).
- Headless test: 57 checks (HashMap numbers, ArrayList growth, LRU, TreeMap queries, heap order, deque growth, comparator order, fail-fast scenarios, views, race) all pass; all 10 pages load with no JS errors and no overflow at 520 px.
