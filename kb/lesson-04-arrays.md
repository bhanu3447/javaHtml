# Lesson 04 — Java Arrays: From Zero to Advanced

*Everything about arrays: creating them, memory, default values, 2D and jagged arrays, copying, the `Arrays` class, sorting and searching, arrays and methods, conversions, internals, and the core algorithm patterns. Every program was run on JDK 25 and its output is in the comments. On the page, it is sections A1–A14.*

## Table of Contents

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

## 1. What is an array?

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

## 2. Declaring, creating and initialising

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

## 3. Memory: where arrays live

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

## 4. 2D, jagged and multi-dimensional arrays

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

## 5. Copying: aliasing, shallow and deep

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

## 6. The `java.util.Arrays` class

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

## 7. Sorting and searching

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

## 8. Arrays and methods

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

## 9. Arrays vs ArrayList, and conversions

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

## 10. Internals and advanced rules

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

## 11. Core array patterns

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

## 12. Common mistakes

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

## 13. 20 interview questions

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

## 14. Practice and concept map

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
