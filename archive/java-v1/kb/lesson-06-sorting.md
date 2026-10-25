# Lesson 06 — Sorting: Every Interview Sort, then Bubble Sort in Depth

*This lesson opens the sorting series. **B0, the Sorting explorer**, covers all 11 interview sorts and 38 of their types with verified Java and a live visual for each. The sections after it **follow the sort you pick**: each sort has its own idea and dry run, every type in Java, complexity, and interview review; bubble sort has the deepest set, B1–B14. Bubble sort is the slowest sort you will ever write, and that is why it is the right one to start with: every idea you need for the others (passes, invariants, comparisons vs swaps, best/average/worst case, stability, in-place, recursion depth, adaptivity) shows up here in its simplest form. It has 15 sections (start with the B0 explorer), 15 verified programs, the Bubble Lab (11 variants with live code, counters and a call stack), a valet-parking analogy, a stability lab, an inversions grid, a complexity chart, a variant race, 15 interview questions and a 12-question quiz.*

Page: `java/lessons/06-bubble-sort.html`, band `#bsort`. Sections: B0 the Sorting explorer (always shown), then one set per sort, shown only while that sort is picked in the explorer (`data-sort`): bubble B1–B14 (ids `bs-*`), and for the other ten sorts SL (selection), IN (insertion), MG (merge), QK (quick), HP (heap), CT (counting), RX (radix), BK (bucket), CY (cyclic), DF (Dutch National Flag), each with the idea and a dry run, every type in Java (multi-type sorts), complexity, and interview problems / mistakes / questions / takeaways. Added on 2026-10-22 (user: "sortings are not there but i need one bubble sort first in all various way … recursion brute force all types and also visualization with time and space complexity"; then "all give there" for every interview sort, and "it should show" the selected sort's content instead of bubble sort). Every program was run on JDK 25; every count the labs show is checked against these programs (headless test).

## Table of Contents

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

### Visual labs (interactive)

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

## 1. Sorting explorer: every interview sort

Start here. Choose the **sort**, then its **type**. Its idea, its time and space cost, the key points, the interview problems that use it and a live visual of that exact Java code appear below. The list covers everything asked in MAANG-style interviews:

- **Must know:** merge sort (top-down, bottom-up, inversion count, the TimSort idea), quick sort (Lomuto, Hoare, random pivot, 3-way, Quickselect), heap sort (3 ways), counting sort and bucket sort.
- **Should know:** insertion sort (shifting, swapping, binary, recursive, Shell sort), selection sort (standard, stable, double-ended, recursive), cyclic sort and the Dutch National Flag.
- **Basics and theory:** bubble sort (11 types, the rest of this lesson) and radix sort.

Every Java method shown was compiled on JDK 25 and checked against `Arrays.sort` on 3,000 random arrays. Pick **★ Compare all sorts** for one table of every algorithm.

**The rest of this lesson follows your choice.** Pick **Merge sort** and the sections below, and the sidebar, switch to merge sort: the idea and a dry run, every type in Java, the time and space complexity, and its interview problems, mistakes and questions. Pick **Bubble sort** to get B1–B14. Every **Full section →** link and every **▶ See it** button jumps between the two.

### Start here: your learning path

New to sorting? Follow these 12 steps in order. Each step opens the right sections below; finish a step with the **Next in the path** button at its end (or tick it here). Your progress is saved in this browser.

*[Visual `#bsPath`: Learning path: 12 steps (basics, bubble, selection, insertion, merge, quick, heap, counting, radix, bucket, cyclic, Dutch flag) with a progress bar, Start/Continue, click a step to open that sort, tick to mark done (js1-path); every sort ends with a Next in the path button.]*

### Before you start: the three moves of every sort

Every algorithm in this lesson is built from three moves on an array: **compare** two values, **swap** two values, and **shift** (write) a value into another slot. Play each tab until it feels obvious; then the sorts are just these moves in a clever order.

*[Visual `#bsMoves`: The three moves of every sort: Compare (reads, changes nothing), Swap with a temporary glass t (and Try it without t: the 7 is lost, [3, 3]), Shift (insert 4 into [2, 5, 8]: two shifts, then drop the key); the Java line of each step is highlighted.]*

### The Sorting explorer

*[Visual `#bsx`: Sorting explorer: Sort dropdown with 11 families (bubble, selection, insertion, merge, quick, heap, counting, radix, bucket, cyclic, Dutch National Flag) + Compare all sorts; Type dropdown and chips; idea, Best/Average/Worst/Space/Stable/Adaptive cards, key points, interview problems, work done, when to use; a lab locked to that type (data-novar) stepping through the verified Java; choice saved in js1-bsx.]*

### Every interview sort in the explorer (v30, 2026-10-22)

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

## 2. Time and space complexity: from scratch to advanced

**In 30 seconds:** **Time complexity** says how the number of steps an algorithm takes **grows** as the input size **n** grows; **space complexity** says how much **extra memory** it needs as n grows. We write it with **Big-O**, keeping only the fastest-growing term and dropping constants: 3n² + 5n + 2 is O(n²). The ladder to remember is O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!). Loops in a row **add**, loops inside loops **multiply**, halving gives **log n**, and recursion is solved with a **recursion tree**. Space counts new arrays and collections **and the call stack**.

**Why it exists:** a stopwatch measures your laptop, your JVM warm-up and today's background tasks, not the algorithm. Counting how the work *grows* lets you compare algorithms on paper, predict whether a solution will finish before you write it, and explain your choice in an interview. Every interviewer asks "what is the time and space complexity?" after every answer.

**Analogy (remember this one):** finding your car in a car park of n cars. **O(1)**: you know the bay number, so you walk straight to it (array index). **O(log n)**: bays are sorted by number plate, so you check the middle row and throw away half the car park each time (binary search). **O(n)**: you walk past every bay (linear search). **O(n log n)**: you first re-park every car in plate order (sorting). **O(n²)**: you compare every car with every other car to find two identical ones. **O(2ⁿ)**: you try every possible group of cars for a convoy.

> 💡 **Remember it:** Big-O is **how the walk grows when the car park grows**, not how fast you walk. Double the cars: O(n) walks twice as far, O(n²) four times, O(log n) only one step more.

### Part 1 · What we measure: steps, not seconds

- **Input size n**: the length of the array or string, the number of nodes, or whatever grows. Say what n is; with two inputs use two letters (n and m, V and E).
- **A step** is any constant-time operation: an assignment, a comparison, `a[i]`, `x + y`, a method call that does a fixed amount of work. We don't care whether a step takes 1 ns or 3 ns.
- **Growth rate** is what matters: for n = 1,000,000 an O(n) loop does about a million steps (milliseconds); an O(n²) loop does a trillion (many minutes).
- **Rule of thumb**: Java does roughly **10⁸ simple steps per second**. Multiply your complexity by the input size limit to see if it fits a 1–2 second time limit.

### Part 2 · Counting steps in code

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

### Part 3 · Big-O, Big-Ω and Big-Θ

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

### Part 4 · The growth ladder

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

### Part 5 · The rules for combining costs

1. **Sequential parts add, then keep the biggest**: an O(n log n) sort followed by an O(n) scan is O(n log n).
2. **Nested parts multiply**: an O(n) loop that calls an O(log n) method each time is O(n log n). Watch hidden loops: `list.contains(x)` inside a loop is O(n) × O(n) = O(n²).
3. **Different inputs, different letters**: looping over array A (size a) then array B (size b) is O(a + b); nested over them is O(a · b), not O(n²).
4. **Constant-size loops are O(1)**: `for (int d = 0; d < 26; d++)` or looping over 4 directions does not depend on n.
5. **Early exit doesn't change the worst case**: a loop that may `break` early is still O(n) in the worst case; say the best case separately if it matters.
6. **Log bases don't matter**, and neither does log of a power: log(n²) = 2 log n = O(log n).

### Part 6 · Best, average, worst and amortized

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

### Part 7 · Recursion: recursion trees and recurrences

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

### Part 8 · Space complexity

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

### Part 9 · Time–space trade-offs

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

### Part 10 · Java costs you must know

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

### Part 11 · Advanced ideas

- **The sorting lower bound.** A comparison sort is a decision tree whose leaves are the n! possible orders; a binary tree with n! leaves has height ≥ log₂(n!) ≈ n log₂ n − 1.44 n. So every comparison sort needs Ω(n log n) comparisons in the worst case. Counting, radix and bucket sort escape it because they don't compare.
- **Pseudo-polynomial time.** Counting sort is O(n + k) and 0/1 knapsack DP is O(n · W). They look polynomial, but k and W are numbers, and their size in bits is log k: doubling the number of bits squares k. That is why counting sort is useless for 32-bit values.
- **Amortized analysis methods.** The *aggregate* method adds up the total cost of n operations (ArrayList: n adds + about 2.43n copies ≈ 3.4n steps with 1.5× growth, measured below; 2.3n when doubling); the *accounting* method charges each cheap operation a little extra to pay for the rare expensive one.
- **Big-O hides constants.** Heap sort and merge sort are both O(n log n), but quicksort usually wins because of cache-friendly memory access. A HashMap's O(1) includes hashing the whole key (O(length) for a String key, cached afterwards). For small n, an O(n²) insertion sort beats an O(n log n) merge sort, which is why TimSort uses it for small runs.
- **Say what n is.** Graph algorithms are O(V + E); string matching is O(n + m); a heap of size k gives O(n log k), better than O(n log n) when k is small; a sliding window over a 26-letter alphabet keeps O(26) = O(1) counts.
- **Recursion in Java has a real limit.** Java has no tail-call elimination, so O(n) recursion depth overflows the stack for n in the tens of thousands, even when the time is fine.
- **Beyond polynomial.** Problems like the travelling salesman or subset sum have no known polynomial algorithm (NP-hard); interviews stop at "this is exponential, here is the pruning / DP / greedy approximation".

### Part 12 · How to answer "what's the complexity?" in an interview

1. Define n (and m, k, V, E if there are several inputs).
2. Walk the code top to bottom: give each block a cost; add sequential blocks; multiply nested ones; include the cost of every library call (contains, sort, substring).
3. For recursion, state the recurrence or draw the tree: number of calls × work per call, and the depth.
4. Keep the dominant term; drop constants.
5. Give **time and space**, worst case unless asked; mention best/average/amortized when they differ.
6. Offer the trade-off: "O(n²) with O(1) space, or O(n) with a HashMap at O(n) space."

### Common mistakes

| Mistake | Why it's wrong | Say instead |
|---|---|---|
| "Two nested loops, so O(n²)" | Only if both run ~n times; the inner one might halve, or run a constant 26 times | Count the iterations of each loop |
| Ignoring library calls | `contains`, `indexOf`, `substring`, `remove(0)` are O(n) loops | Multiply them in |
| Forgetting the recursion stack | Recursive DFS on a 10⁵-node chain uses O(n) space and may overflow | Space = O(depth) |
| "HashMap is always O(1)" | Average O(1); hashing a String key is O(length); worst case degrades | "O(1) average" |
| Calling a two-input loop O(n²) | The sizes are different | O(n · m) |
| "O(2n) is better than O(n)" | Constants are dropped: both are O(n) | Compare real constants only when Big-O ties |
| Building a String with `+=` in a loop and calling it O(n) | Each += copies the whole string | O(n²); StringBuilder makes it O(n) |

### Interview questions

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

### Guess the Big-O

Quiz: 12 Guess the Big-O questions (`QZ.cx`), listed under "Practice layer" → "Lesson 06 · Guess the Big-O".

### Takeaways

- Complexity = how steps (time) and extra memory (space) grow with n; drop constants and smaller terms.
- Loops in a row add, nested loops multiply, halving gives log n; count library calls too.
- Ladder: 1 < log n < n < n log n < n² < 2ⁿ < n!; about 10⁸ simple steps per second.
- Recursion: time = all the nodes of the call tree, space = its depth; master theorem for divide and conquer.
- Always answer with time and space, worst case, and the trade-off you chose.

Next in the path: Bubble sort →

## 3. What sorting is, and the idea behind bubble sort

**In 30 seconds:** **Sorting** puts elements in order (ascending by default). **Bubble sort** walks the array from left to right comparing each pair of **neighbours**, `a[j]` and `a[j+1]`, and swaps them when they are in the wrong order. One walk is a **pass**. After pass 1 the largest value has "bubbled" to the last index; after pass 2 the second largest sits before it; after at most **n − 1** passes the array is sorted. It uses **O(n²)** time, **O(1)** extra space, is **stable** and **in-place**.

**Why it exists:** it is the simplest correct sorting algorithm that only ever looks at two neighbours. Nobody uses it for big data (Java's `Arrays.sort` uses Dual-Pivot Quicksort for primitives and TimSort for objects, Lesson 04), but interviews use it to test loops, off-by-one bounds, swaps, invariants, and complexity reasoning. It is also genuinely fast on **tiny** or **almost sorted** input, and one pass of it is the cheapest way to **check** whether an array is sorted.

**Analogy (remember this one):** a **valet** must line up cars from shortest to longest, but the lane is narrow: he can only **swap two neighbouring cars**. He walks from the front to the back; whenever the car in front is longer than the one behind it, he swaps them. The longest car keeps getting swapped backwards until it reaches the end of the lane, where it is **parked for good**. Next walk, he can stop one slot earlier. Or picture soda: the big bubbles rise to the top first.

*[Visual `#anValet`: Valet parking analogy: cars of different lengths, the valet compares neighbours, swaps, and parks the longest at the end of each walk.]*

> 💡 **Remember it:** Bubble sort = a **valet who may only swap neighbours**. Each walk parks the longest remaining car at the end of the lane, so the "parked" zone grows from the right by one car per walk.

### The vocabulary you will use in every sorting lesson

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

### The Bubble Lab

This lab runs **all 11 variants** from this lesson. Pick a variant and an input, then press **Play** or step. The highlighted Java line, the pointers `j`/`j+1`, the green "parked" zone, the counters and, for the recursive variants, the call stack all move together. Each later section opens the same lab on its own variant.

*[Visual `#bsLab`: Bubble Lab: all 11 variants; bars with j/j+1 pointers, green parked zone, the current Java line, counters (pass, comparisons, swaps, wasted, stack depth, gap), call stack for V6/V7; inputs random/sorted/nearly/reversed/duplicates/turtle/your numbers.]*

## 4. Dry run by hand: [5, 1, 4, 2, 8]

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

## 5. V1 · Brute force: always n − 1 full sweeps

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

## 6. V2 · Standard: shrink the inner loop

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

### Counting the comparisons

| Pass i | Inner loop runs for j = | Comparisons |
|---|---|---|
| 0 | 0 … n−2 | n − 1 |
| 1 | 0 … n−3 | n − 2 |
| … | … | … |
| n − 2 | 0 | 1 |
| **Total** | **n(n − 1)/2** ≈ n²/2 → O(n²) |  |

**The classic off-by-one:** writing `j < n - i` makes `a[j + 1]` read `a[n]` in the first pass: `ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5`. The last pair you compare is `(n−2, n−1)`, so `j` stops **one before** the last index.

## 7. V3 · Optimized: the swapped flag (early exit)

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

### Why "no swaps" proves the array is sorted

If a pass compared every pair `(j, j+1)` of the unsorted part and none was out of order, then `a[0] ≤ a[1] ≤ … ≤ a[k]` for that part; and the tail after it is sorted by the invariant and holds larger values. Chained together, the whole array is in order. Nothing more can ever move, so further passes would be wasted.

| Input (n = 8) | Passes | Comparisons | Swaps | Why |
|---|---|---|---|---|
| Sorted | 1 | 7 | 0 | One check pass, then exit: O(n) |
| One pair swapped | 2 | 13 | 1 | Fix pass + one check pass |
| Random | 5 | 25 | 11 | Depends on how far the smallest values must travel left |
| Reversed | 7 | 28 | 28 | Worst case: every pair is an inversion |

**A small value at the end is slow.** A big value can move many places right in one pass (it keeps winning), but a small value moves only **one place left per pass**. That is why `[2,3,4,5,6,7,8,1]` needs all 7 passes even though it is "almost sorted". Bubble sort calls these slow small values **turtles** and fast big ones **rabbits**. Cocktail shaker sort (B11) fixes turtles.

## 8. V4 · Last-swap boundary: shrink by many slots at once

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

## 9. V5 · The while and do-while forms

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

## 10. V6 · Recursive bubble sort

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

### Solving the recurrence

T(n) = T(n − 1) + (n − 1) unrolls to (n − 1) + (n − 2) + … + 1 + T(1) = n(n − 1)/2: the same count as V2, because recursion only replaced the outer loop. The recursion depth is at most n − 1 frames (one per pass), so the space is O(n).

**Is it tail recursive?** Yes, the recursive call is the last thing the method does, so a compiler *could* turn it back into a loop. Java does not do tail-call elimination, so every call still costs a frame. That is why recursion is a teaching tool here, not an optimisation.

## 11. V7 · Fully recursive: no loops at all

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

## 12. V8 · Generic, descending, and stable bubble sort

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

## 13. The family: cocktail shaker, odd–even and comb sort

**In 30 seconds:** Three famous relatives fix bubble sort's weak spots. **Cocktail shaker** (V9) sweeps right, then left, so turtles move to the front in one backward sweep. **Odd–even transposition** (V10) compares disjoint pairs, so all comparisons of one phase can run **in parallel**: O(n) rounds on n/2 processors. **Comb sort** (V11) compares elements a **gap** apart and shrinks the gap by 1.3 each pass, which removes turtles early and makes it far faster in practice (around n log n comparisons on random data), though its worst case is still O(n²).

### V9 · Cocktail shaker sort (bidirectional bubble sort)

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

### V10 · Odd–even transposition sort (brick sort)

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

### V11 · Comb sort: bubble sort with a shrinking gap

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

## 14. Special cases: linked lists, inversions, top-k and swap traps

**In 30 seconds:** Bubble sort only needs "next neighbour", so it works on a **singly linked list**: swap the values, or relink the nodes with a dummy head. Every swap of neighbours removes exactly **one inversion**, so the number of swaps equals the number of inversions. **k passes** leave the k largest values sorted at the end, O(n·k). XOR or add/subtract swaps "without a temp" break when both indexes are the same.

### Bubble sort on a linked list

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

### Inversions, top-k and the swap traps

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

## 15. Time and space complexity: the master table

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

### Measured: n = 1000, four kinds of input

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

### See it grow: the complexity chart

The chart runs each variant in your browser for n = 4 … 64 and plots the measured comparisons (or swaps) next to the reference curves n, n²/2 and n². Switch the input to **Sorted** to watch the flag variants drop onto the **n** line.

*[Visual `#bsChart`: Complexity chart: measured comparisons or swaps for n = 4 … 64 for V1, V2, V3, V4, V9, V11 on random (average of 5), sorted, nearly sorted or reversed input, with dashed n, n²/2, n² reference curves, linear/log scale, hover tooltip, number table.]*

### Race the variants

*[Visual `#bsRace`: Variant race: six lanes (V1, V2, V3, V4, V9, V11) on the same data, one comparison per lane per tick, finish order and a verdict per input type.]*

### Space complexity, precisely

- **Loop versions:** a few `int`s and a `boolean` (i, j, temp, swapped, bound): O(1), whatever n is. The input array itself is not "extra" space.
- **Recursive versions:** one stack frame per active call. V6 keeps up to n − 1 frames, V7 about n + 1: O(n). A frame holds the return address, the parameters and the locals.
- **Generic version:** still O(1) extra, but an `Integer[]` of n boxed values uses about 4–5 times the memory of an `int[]`.

**When is bubble sort the right answer?** Almost never for big data. It is fine for tiny arrays (n ≤ ~10), for data that is known to be nearly sorted, for "is this array sorted?" (one pass), for hardware or parallel sorting networks (odd–even), and for teaching. For everything else use `Arrays.sort` / `List.sort`.

## 16. Bubble sort: mistakes, interview questions and review

### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| `j < n - i` or `j < n` | `a[j + 1]` reads past the end: `ArrayIndexOutOfBoundsException` | Last pair is `(n−2, n−1)`: `j < n - 1 - i` |
| `swapped` declared outside the outer loop and never reset | After the first swap it stays `true`: no early exit ever | Reset it at the start of every pass |
| `>=` instead of `>` | Equal elements swap: **unstable**, extra swaps | Swap only when strictly greater |
| Swapping without a temp: `a[j] = a[j+1]; a[j+1] = a[j];` | Both slots end with the same value; data is lost | Use a temp (or a `swap` helper) |
| Calling recursion without a base case or without shrinking `n` | `StackOverflowError` | `if (n <= 1) return;` and call with `n − 1` |
| Claiming "bubble sort is O(n) best case" for V1/V2 | Wrong: without the flag every input costs n²/2 or more | Say "O(n) best case **with the swapped-flag optimization**" |
| Using recursion for large n | O(n) stack, overflow around tens of thousands | Use the loop version |

### Interview answer cards

**Interview answer — "Explain bubble sort and its complexity."**

> "Bubble sort repeatedly walks the array and swaps adjacent elements that are out of order. After each pass the largest remaining element is in its final position at the end, so the next pass can stop one earlier. That gives n(n−1)/2 comparisons, O(n²) in the average and worst case. With a swapped flag, a pass with no swaps proves the array is sorted, so on sorted input it finishes in one pass: O(n) best case. It is in-place with O(1) extra space and stable, because it only swaps strictly greater elements."

**Follow-ups:** Why is it stable? · How many swaps on a reversed array? (n(n−1)/2) · How would you make it faster on "turtles"? (cocktail shaker / comb sort) · What does the recursive version cost in space? (O(n) stack)

**Interview answer — "Bubble sort vs selection sort vs insertion sort?"**

> "All three are O(n²) on average. Selection sort always does n(n−1)/2 comparisons but at most n − 1 swaps, and is not stable. Bubble sort does as many swaps as there are inversions, but with the flag it is O(n) on sorted data. Insertion sort also does one shift per inversion but usually fewer comparisons than bubble sort, is stable, adaptive and online, so it is the one real libraries use for small runs."

**Follow-ups:** Which writes to memory least? (selection) · Which one does TimSort use inside? (binary insertion sort)

### 15 interview questions

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

### Practice problems

1. **Count passes.** Modify V3 to return the number of passes it needed. Predict it for `[2,3,4,5,1]` before running (answer: 4).
2. **Sort descending** with `int[]` and no Comparator. (Flip `>` to `<`.)
3. **Sort strings by length, then alphabetically,** with the generic V8 and one Comparator.
4. **Minimum adjacent swaps** to sort an array = number of inversions. Write it with bubble sort, then think about doing it in O(n log n).
5. **Is it sorted after k passes?** Given an array and k, print the array after exactly k passes of V2.
6. **Linked list.** Implement bubble sort that swaps nodes in a **doubly** linked list.

### 5 takeaways

- Bubble sort swaps out-of-order neighbours; after pass k the k largest values are parked at the end.
- Inner loop `j < n - 1 - i`; swap only on `>` (stable); reset `swapped` every pass.
- O(n²) average/worst; O(n) best only with the flag; O(1) space for loops, O(n) stack for recursion.
- Swaps = inversions; small values at the end (turtles) are the slow part; cocktail and comb sort fix them.
- Know it to explain invariants and cost; in real code use `Arrays.sort`.

### Check yourself

Quiz: the 12 questions are under "Practice layer" → "Lesson 06 quiz".

Next in the path: Selection sort →

## 17. Selection sort: the idea and a dry run

**In 30 seconds:** Split the array into a sorted front and an unsorted back. Each pass **selects the smallest** value of the unsorted part and swaps it to the front of that part. After pass i, a[0..i] holds the i + 1 smallest values in order. It always makes n(n − 1)/2 comparisons, but **at most n − 1 swaps**, fewer than any other simple sort. It is **not stable** and **not adaptive**.

**Why it exists:** It is the most direct way to sort by hand: find the smallest, put it first, repeat. Its one real strength is the number of writes: when writing is expensive (flash memory, huge records) n − 1 swaps can matter more than n² comparisons.

**Analogy (remember this one):** Picking a football team in order of height: scan the whole line for the shortest player, bring them to the front, then scan the rest again. You walk the whole line every time, even if it was already in order, but each player moves at most once.

### How it works

1. For i = 0 … n − 2, start with `min = i`.
2. Scan j = i + 1 … n − 1; when `a[j] < a[min]`, set `min = j`.
3. Swap a[i] with a[min] (skip it when min == i). a[i] is now final.
4. Stop after n − 1 passes: the last value is the largest.

> 💡 **Remember it:** Selection sort = **select** the minimum, then **swap once**. Many comparisons, very few swaps.

### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `sel_std`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

### Dry run

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

## 18. Selection sort: every type in Java

4 ways to write it. Every method below was compiled on JDK 25 and checked against `Arrays.sort` on 3,000 random arrays (`Sorts.java`); `swap(a, i, j)` is the usual three-line helper. Each **See it** button opens that exact code in the explorer at the top, stepping line by line.

### Selection sort

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

### Stable selection sort

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

### Double selection (min and max)

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

### Recursive selection sort

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

## 19. Selection sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Selection sort | O(n²) | O(n²) | O(n²) | O(1) | No | No | always n(n − 1)/2 comparisons; at most n − 1 swaps |
| Stable selection sort | O(n²) | O(n²) | O(n²) | O(1) | Yes | No | n(n − 1)/2 comparisons, up to n²/2 writes |
| Double selection (min and max) | O(n²) | O(n²) | O(n²) | O(1) | No | No | about the same comparisons as selection sort (2 per element, n/2 passes); half the passes |
| Recursive selection sort | O(n²) | O(n²) | O(n²) | O(n) stack | No | No | n(n − 1)/2 |

### Why these costs

- Comparisons: (n − 1) + (n − 2) + … + 1 = n(n − 1)/2 on **every** input, sorted or not, so best = worst = O(n²).
- Swaps: at most one per pass, so at most n − 1.
- Space: a few indexes, O(1); the recursive version keeps n − 1 frames, O(n).
- Not stable: the long-distance swap can carry a value past an equal one ([2ᴬ, 2ᴮ, 1] → [1, 2ᴮ, 2ᴬ]). Shifting instead of swapping fixes it.

**When to use it:** Use it when writes are expensive or n is tiny. Avoid it for nearly sorted data (it can't stop early) and when stability matters.

## 20. Selection sort: interview problems, mistakes and questions

### Interview problems that use it

| Problem | Approach |
|---|---|
| **Which simple sort makes the fewest swaps?** | Selection sort: at most n − 1. |
| **Find the k smallest values** | k passes of selection sort: O(n·k); for large k use a heap or Quickselect. |
| **Sort with the minimum number of swaps (distinct values)** | Count cycles of the permutation: answer = n − number of cycles (selection sort's swap count when each swap fixes one value). |

### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Swapping inside the inner loop every time a smaller value is seen | That becomes a bubble-like sort with many swaps | Only remember `min`; swap once after the scan |
| Inner loop starting at 0 | Re-scans the sorted front | Start at `j = i + 1` |
| Claiming it is stable | Swaps jump over equal values | Say "not stable", or use the shifting version |
| Double selection without the `max == lo` fix | The max moved when min was swapped to lo | `if (max == lo) max = min;` |

### Interview questions

**Q01. How does selection sort work?** Repeatedly find the minimum of the unsorted part and swap it to the front of that part. After pass i the first i + 1 values are final.

**Q02. What is its time complexity in the best case?** O(n²): it always scans the whole unsorted part to be sure it found the minimum, even on sorted input.

**Q03. Why is selection sort not stable?** The swap moves a[i] far to the right, possibly past an equal value. [2ᴬ, 2ᴮ, 1] becomes [1, 2ᴮ, 2ᴬ].

**Q04. When would you choose selection sort over insertion sort?** When writes are much more expensive than reads: selection sort makes at most n − 1 swaps, insertion sort up to n²/2 shifts.

**Q05. How many comparisons for n = 5?** n(n − 1)/2 = 10, on every input (the dry run prints comparisons = 10, swaps = 3).

### Takeaways

- Find the minimum, swap it to the front: n(n − 1)/2 comparisons always, ≤ n − 1 swaps.
- O(n²) best, average and worst; O(1) space; not stable; not adaptive.
- Only advantage: few writes. Prefer insertion sort otherwise.

### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_selection`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Insertion sort →

## 21. Insertion sort: the idea and a dry run

**In 30 seconds:** Keep a **sorted prefix**. Take the next value (the `key`), shift every bigger value in the prefix one slot right, and drop the key into the gap. On sorted input each key needs one comparison, so the **best case is O(n)**; the work grows with the number of inversions, O(n²) at worst. It is **stable, adaptive, in-place and online**: the best simple sort, and the one Java uses inside TimSort and Dual-Pivot Quicksort for small runs.

**Why it exists:** Many real arrays are small or almost sorted. Insertion sort does almost no work on them, needs no extra memory, and can even sort data as it arrives (online).

**Analogy (remember this one):** Sorting playing cards in your hand: pick up the next card and slide it left past every bigger card until it sits in the right place. The cards already in your hand are always in order.

### How it works

1. For i = 1 … n − 1, lift out `key = a[i]`; a[0..i−1] is already sorted.
2. Walk j = i − 1 down while `a[j] > key`, shifting `a[j + 1] = a[j]`.
3. Drop the key at `a[j + 1]`. Now a[0..i] is sorted.
4. Strict `>` keeps equal values in order: stable.

> 💡 **Remember it:** Insertion sort = **sorting cards in your hand**: slide each new card left until it fits.

### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `ins_shift`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

### Dry run

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

## 22. Insertion sort: every type in Java

5 ways to write it. Every method below was compiled on JDK 25 and checked against `Arrays.sort` on 3,000 random arrays (`Sorts.java`); `swap(a, i, j)` is the usual three-line helper. Each **See it** button opens that exact code in the explorer at the top, stepping line by line.

### Insertion sort (shifting)

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

### Insertion sort (swapping)

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

### Binary insertion sort

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

### Recursive insertion sort

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

### Shell sort (gap insertion)

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

## 23. Insertion sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Insertion sort (shifting) | O(n) | O(n²) | O(n²) | O(1) | Yes | Yes | n − 1 if sorted; about n²/4 on random data; shifts = inversions |
| Insertion sort (swapping) | O(n) | O(n²) | O(n²) | O(1) | Yes | Yes | same comparisons as shifting; swaps = inversions |
| Binary insertion sort | O(n log n) cmp | O(n²) | O(n²) | O(1) | Yes | Partly | O(n log n) comparisons, but still O(n²) moves |
| Recursive insertion sort | O(n) | O(n²) | O(n²) | O(n) stack | Yes | Yes | same as insertion sort |
| Shell sort (gap insertion) | O(n log n) | ≈ n^1.3 (gap-dependent) | O(n²) for n/2, n/4… | O(1) | No | Partly | depends on the gap sequence (Knuth 3k+1 is better than halving) |

### Why these costs

- Each shift fixes exactly one inversion, so shifts = inversions: 0 when sorted, n(n − 1)/2 when reversed, about n²/4 on random data.
- Comparisons = shifts + about one per element, so sorted input costs n − 1 comparisons: O(n).
- Binary insertion cuts comparisons to O(n log n) but still moves O(n²) values.
- Shell sort runs insertion sort on gaps (n/2, n/4 … 1); with halving gaps the worst case is still O(n²), better gap sequences reach about O(n^1.3).

**When to use it:** Use it for small arrays (≲ 16–32), nearly sorted data, a stream of values, or as the base case of merge/quick sort. Avoid it for large random arrays.

## 24. Insertion sort: interview problems, mistakes and questions

### Interview problems that use it

| Problem | Approach |
|---|---|
| **Insertion Sort List (LC 147)** | Keep a dummy-headed sorted list; for each node walk from the head to find its place. O(n²). |
| **Sort a k-sorted (nearly sorted) array** | Insertion sort is O(n·k); a min-heap of size k + 1 gives O(n log k). |
| **Why do libraries switch to insertion sort for small runs?** | Low constant factor, no recursion, cache-friendly; for n ≈ 32 it beats n log n sorts. |
| **Count inversions** | Shifts of insertion sort = inversions (O(n²)); merge sort counts them in O(n log n). |

### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Writing `a[j] >= key` | Equal values cross: not stable, and more shifts | Use strict `>` |
| Checking `a[j] > key` before `j >= 0` | `a[-1]`: ArrayIndexOutOfBoundsException | `while (j >= 0 && a[j] > key)` |
| Overwriting the key before saving it | The first shift destroys a[i] | Save `key = a[i]` first |
| Placing the key at `a[j]` | Off by one: overwrites a smaller value | Place it at `a[j + 1]` |

### Interview questions

**Q01. How does insertion sort work?** It grows a sorted prefix: each new value is shifted left past bigger values until it fits, like sorting cards in your hand.

**Q02. What are its best and worst cases?** Best O(n) on sorted input (one comparison per element); worst O(n²) on reversed input (every pair shifts).

**Q03. Why is insertion sort used inside TimSort and Quicksort implementations?** For small runs its tiny constant factor, no recursion and adaptivity beat the n log n algorithms. Java switches to it for runs of a few dozen elements (TimSort builds runs of at least 32 with binary insertion sort).

**Q04. What does "online" mean, and is insertion sort online?** It can sort data as it arrives, without seeing the whole input first. Yes: each new value is just inserted into the sorted prefix.

**Q05. What does binary insertion sort improve?** Comparisons drop to O(n log n) by binary-searching the position, but the shifts are still O(n²), so the time stays O(n²).

### Takeaways

- Grow a sorted prefix; shift bigger values right; drop the key in the gap.
- Best O(n), worst O(n²); shifts = inversions; stable, adaptive, in-place, online.
- The simple sort to recommend; libraries use it for small runs.
- Shell sort = insertion sort with shrinking gaps.

### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_insertion`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Merge sort →

## 25. Merge sort: the idea and a dry run

**In 30 seconds:** **Divide and conquer**: split the array in half, sort each half recursively, then **merge** the two sorted halves with two pointers, always taking the smaller head (the left one on ties). There are log₂ n levels and each level does O(n) work, so it is **O(n log n) in every case**. It needs an O(n) temporary array, and it is **stable**. Java's `Arrays.sort(Object[])` and `List.sort` use TimSort, a merge sort.

**Why it exists:** Merging two sorted lists is easy and linear. Merge sort turns that into a sort with a guaranteed n log n, works on linked lists without random access, and is the basis of external sorting (data bigger than memory) and of many counting problems.

**Analogy (remember this one):** Two sorted queues of cars at a toll merge into one lane: the attendant always waves through whichever front car is shorter. To get sorted queues in the first place, split every queue in half until each "queue" is a single car, which is trivially sorted, then merge back up.

### How it works

1. If the range has 0 or 1 element, it is sorted: return.
2. Split at `mid = (lo + hi) >>> 1`; sort a[lo..mid] and a[mid+1..hi] recursively.
3. Copy the range to `tmp`; pointer i on the left half, j on the right.
4. Repeatedly write the smaller of tmp[i], tmp[j] (left on ties) to a[k++]; then copy whatever is left.

> 💡 **Remember it:** Merge sort = **split until single, then zip sorted halves together**. log n levels × n work each.

### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `m_td`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

### Dry run

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

## 26. Merge sort: every type in Java

4 ways to write it. Every method below was compiled on JDK 25 and checked against `Arrays.sort` on 3,000 random arrays (`Sorts.java`); `swap(a, i, j)` is the usual three-line helper. Each **See it** button opens that exact code in the explorer at the top, stepping line by line.

### Merge sort (top-down, recursive)

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

### Merge sort (bottom-up, iterative)

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

### Merge sort + counting inversions

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

### TimSort idea (insertion runs + merge)

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

## 27. Merge sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Merge sort (top-down, recursive) | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | No | at most n log₂ n comparisons; log₂ n levels × n writes |
| Merge sort (bottom-up, iterative) | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | No | same as top-down |
| Merge sort + counting inversions | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | No | n log n; answer can reach n(n − 1)/2, so use long |
| TimSort idea (insertion runs + merge) | O(n) | O(n log n) | O(n log n) | O(n) | Yes | Yes | real TimSort finds natural runs and gallops; this is the simplified idea |

### Why these costs

- Recurrence T(n) = 2T(n/2) + O(n): log₂ n levels, each merging n elements in total, so O(n log n) best, average and worst.
- Comparisons per merge ≤ length − 1, so total ≤ n log₂ n.
- Space: the tmp array O(n) plus O(log n) recursion frames; bottom-up merge sort needs no recursion.
- Stable because the merge takes the left element on ties (`<=`).
- Not adaptive in this basic form; TimSort detects existing runs, so sorted input costs O(n).

**When to use it:** Use it when you need guaranteed n log n, stability, a linked list (LC 148), external sorting, or counting pairs across halves (inversions, LC 315, LC 493). Avoid it when O(n) extra memory is a problem.

## 28. Merge sort: interview problems, mistakes and questions

### Interview problems that use it

| Problem | Approach |
|---|---|
| **Sort List (LC 148)** | Find the middle with slow/fast pointers, sort each half, merge the lists. O(n log n), O(log n) stack (or O(1) bottom-up). |
| **Merge k Sorted Lists (LC 23)** | Merge pairs level by level (O(N log k)) or use a min-heap of the k heads. |
| **Count inversions / Count of Smaller Numbers After Self (LC 315)** | During the merge, taking from the right means every waiting left value is bigger: add mid − i + 1. |
| **Reverse Pairs (LC 493)** | Before each merge, count pairs with a[i] > 2·a[j] using two pointers over the sorted halves. |
| **Merge Sorted Array (LC 88)** | Merge from the back so you don't overwrite unread values. |

### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| `mid = (lo + hi) / 2` on huge indexes | int overflow when lo + hi > 2³¹ − 1 | `(lo + hi) >>> 1` or `lo + (hi − lo) / 2` |
| Using `<` instead of `<=` in the merge | Equal values from the right go first: not stable | Take the left one on ties |
| Forgetting to copy the leftovers | Missing values at the end of the range | Two extra while loops after the main merge |
| Allocating a new array in every merge for big n | Lots of garbage | Allocate one tmp array once and pass it down |
| Counting inversions in an int | Up to n(n − 1)/2: overflows for n > 65,536 | Use `long` |

### Interview questions

**Q01. Explain merge sort and its complexity.** Split in half, sort each half recursively, merge the sorted halves with two pointers. T(n) = 2T(n/2) + n = O(n log n) in every case, O(n) extra space, stable.

**Q02. Why is merge sort preferred for linked lists?** It only needs sequential access: splitting uses slow/fast pointers and merging just relinks nodes, so no extra array is needed. Quicksort and heap sort need random access.

**Q03. How do you count inversions with merge sort?** When the merge takes tmp[j] from the right half, all mid − i + 1 values still waiting in the left half are bigger and come earlier: add that to the count. O(n log n).

**Q04. What is the difference between top-down and bottom-up merge sort?** Top-down recurses on halves; bottom-up merges runs of width 1, 2, 4 … iteratively with no recursion. Same O(n log n).

**Q05. Why does Java use merge sort (TimSort) for objects but quicksort for primitives?** Objects need a stable sort (equal keys keep their order) and comparisons are expensive; for primitives stability is invisible and Dual-Pivot Quicksort is faster with no extra memory.

### Takeaways

- Divide, sort halves, merge: O(n log n) always.
- Stable (take left on ties), O(n) extra space.
- The sort for linked lists, external data and counting inversions.
- Java's object sort (TimSort) is a merge sort that exploits existing runs.

### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_merge`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Quick sort →

## 29. Quick sort: the idea and a dry run

**In 30 seconds:** Pick a **pivot**, **partition** the array so smaller values come before it and the rest after it (the pivot is then in its final place), and sort the two sides recursively. Average **O(n log n)** with a tiny constant and O(log n) stack, but **O(n²)** when the pivot is always the smallest or largest (sorted input with a first/last pivot). A **random pivot** makes that practically impossible. Not stable. Its partition step also gives **Quickselect**: the k-th smallest in O(n) on average.

**Why it exists:** Partitioning is in-place and cache-friendly, so quicksort is the fastest general-purpose sort in practice. Java's `Arrays.sort(int[])` is a Dual-Pivot Quicksort.

**Analogy (remember this one):** A car park attendant picks one car as the reference length (the pivot) and sends every shorter car to the left side, every longer car to the right. The reference car now stands exactly where it belongs; then each side is sorted the same way.

### How it works

1. If the range has fewer than 2 elements, return.
2. Partition around a pivot: Lomuto uses the last element and an index i for the end of the "smaller" zone; Hoare walks two pointers inwards.
3. The pivot lands at its final index p.
4. Recurse on a[lo..p−1] and a[p+1..hi] (Hoare: on a[lo..j] and a[j+1..hi]).

> 💡 **Remember it:** Quick sort = **pick a pivot, small left, big right, repeat on each side**. Bad pivots make it n².

### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `q_l`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

### Dry run

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

## 30. Quick sort: every type in Java

5 ways to write it. Every method below was compiled on JDK 25 and checked against `Arrays.sort` on 3,000 random arrays (`Sorts.java`); `swap(a, i, j)` is the usual three-line helper. Each **See it** button opens that exact code in the explorer at the top, stepping line by line.

### Quick sort (Lomuto, last pivot)

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

### Quick sort (Hoare, middle pivot)

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

### Quick sort (random pivot)

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

### Quick sort (3-way, many duplicates)

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

### Quickselect (k-th smallest)

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

## 31. Quick sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Quick sort (Lomuto, last pivot) | O(n log n) | O(n log n) | O(n²) | O(log n) stack | No | No | ≈ 1.39 n log₂ n on average; n²/2 on sorted input with a last-element pivot |
| Quick sort (Hoare, middle pivot) | O(n log n) | O(n log n) | O(n²) | O(log n) stack | No | No | about 3 times fewer swaps than Lomuto on average |
| Quick sort (random pivot) | O(n log n) | O(n log n) | O(n²) (unlikely) | O(log n) stack | No | No | expected ≈ 1.39 n log₂ n on every input |
| Quick sort (3-way, many duplicates) | O(n) | O(n log n) | O(n²) | O(log n) stack | No | No | O(n) when all values are equal |
| Quickselect (k-th smallest) | O(n) | O(n) | O(n²) | O(1) | – | – | n + n/2 + n/4 … ≈ 2n comparisons on average |

### Why these costs

- Balanced splits: T(n) = 2T(n/2) + n = O(n log n). Average over random pivots: about 1.39 n log₂ n comparisons.
- Worst case: the pivot is always the min or max, so T(n) = T(n − 1) + n = O(n²). The dry run shows it: sorted-ish data with a last-element pivot peels one element at a time.
- Space: no extra array; the recursion is O(log n) on average, O(n) in the worst case (recurse into the smaller side first to keep it O(log n)).
- 3-way partitioning makes many duplicates cheap: all values equal to the pivot are finished in one pass.
- Quickselect recurses into one side only: n + n/2 + n/4 … ≈ 2n, so O(n) on average.

**When to use it:** Use it for large in-memory arrays of primitives, and Quickselect for k-th element / top-k. Use a random (or median-of-three) pivot. Avoid it when you need stability or a guaranteed worst case (use merge or heap sort).

## 32. Quick sort: interview problems, mistakes and questions

### Interview problems that use it

| Problem | Approach |
|---|---|
| **Kth Largest Element in an Array (LC 215)** | Quickselect for index n − k with a random pivot: O(n) average. Or a min-heap of size k: O(n log k). |
| **Sort an Array (LC 912)** | Random-pivot quicksort or merge sort; plain last-pivot quicksort times out on sorted input. |
| **K Closest Points to Origin (LC 973)** | Quickselect on distance, then return the first k. |
| **Sort Colors (LC 75)** | 3-way partition around 1 (the Dutch National Flag). |
| **Wiggle Sort II (LC 324)** | Find the median with Quickselect, then 3-way partition with virtual indexing. |

### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Always using the first or last element as pivot | O(n²) on sorted or reversed input | Random pivot or median-of-three |
| Hoare partition recursing on (lo, p − 1) and (p + 1, hi) | Hoare does not put the pivot at j: values get lost or the recursion never shrinks | Recurse on (lo, j) and (j + 1, hi) |
| Comparing with `<=` in Lomuto on many duplicates | Unbalanced partitions, O(n²) on all-equal input | 3-way partition |
| Deep recursion on adversarial input | StackOverflowError | Recurse into the smaller side, loop on the larger |
| k-th largest with index k | Off by one | k-th largest = index n − k (0-based) in ascending order |

### Interview questions

**Q01. Explain quicksort and its complexity.** Choose a pivot, partition so smaller values go left and larger right (pivot is final), recurse on both sides. Average O(n log n), worst O(n²), O(log n) stack, in-place, not stable.

**Q02. When does quicksort hit O(n²), and how do you avoid it?** When every pivot is the smallest or largest value, e.g. sorted input with a first/last pivot, or all-equal values with a 2-way partition. Use a random pivot or median-of-three, and a 3-way partition for duplicates.

**Q03. Lomuto vs Hoare partition?** Lomuto: one pointer, pivot = last, simple, pivot ends at its final index. Hoare: two pointers moving inward, about three times fewer swaps, but the pivot is not necessarily at the returned index.

**Q04. What is Quickselect and its complexity?** Partition, then continue only into the side containing index k. Average O(n) (n + n/2 + …), worst O(n²); used for k-th largest (LC 215).

**Q05. Why is quicksort usually faster than merge sort in practice?** It works in place with sequential memory access (cache-friendly) and has a small constant factor; merge sort copies into a temporary array.

### Takeaways

- Partition around a pivot, recurse on both sides: O(n log n) average.
- Bad pivots give O(n²): use a random pivot; duplicates: 3-way partition.
- In-place, O(log n) stack, not stable.
- Quickselect = partition + one side only: O(n) average for k-th element.

### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_quick`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Heap sort →

## 33. Heap sort: the idea and a dry run

**In 30 seconds:** Treat the array as a **binary heap**: the children of index i are 2i + 1 and 2i + 2. First **build a max-heap** (every parent ≥ its children) in O(n), so the maximum is at a[0]. Then repeatedly **swap a[0] to the end**, shrink the heap by one, and **sift the new root down** (O(log n)). Total **O(n log n) in every case with O(1) extra space**, but not stable and slower than quicksort in practice. In interviews the heap usually appears as a `PriorityQueue` for top-k, k-way merges and running medians.

**Why it exists:** It is the only common comparison sort that guarantees O(n log n) **and** uses O(1) extra space. The heap data structure behind it gives O(log n) insert and remove-max, which is what priority queues need.

**Analogy (remember this one):** A company org chart where every boss is taller than the people reporting to them: the tallest person is always the CEO at the top. Remove the CEO (send them to the end of the line), promote the last person to the top, and let them sink down past taller reports until the rule holds again.

### How it works

1. Build: for i = n/2 − 1 down to 0, `siftDown(a, i, n)`. Leaves are already heaps.
2. Swap the root (the max) with a[end]; a[end] is final.
3. Sift the new root down in the heap a[0..end−1]: swap it with its bigger child while it is smaller.
4. Repeat until the heap has one element.

> 💡 **Remember it:** Heap sort = **the tallest is always on top**: take it off, fix the heap, repeat.

### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `h_std`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

### Dry run

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

## 34. Heap sort: every type in Java

3 ways to write it. Every method below was compiled on JDK 25 and checked against `Arrays.sort` on 3,000 random arrays (`Sorts.java`); `swap(a, i, j)` is the usual three-line helper. Each **See it** button opens that exact code in the explorer at the top, stepping line by line.

### Heap sort (sift-down)

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

### Heap sort (recursive heapify)

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

### Heap sort (build by sift-up)

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

## 35. Heap sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Heap sort (sift-down) | O(n log n) | O(n log n) | O(n log n) | O(1) | No | No | about 2 n log₂ n |
| Heap sort (recursive heapify) | O(n log n) | O(n log n) | O(n log n) | O(log n) stack | No | No | same as heap sort |
| Heap sort (build by sift-up) | O(n log n) | O(n log n) | O(n log n) | O(1) | No | No | build is O(n log n) instead of O(n) |

### Why these costs

- Bottom-up build is O(n): most nodes are near the bottom and sift down only a little (sum of heights ≤ n).
- Each of the n − 1 extractions sifts down at most log₂ n levels: O(n log n), on every input.
- Space O(1) for the iterative version (the recursive heapify uses O(log n) stack).
- Not stable: the swap of the root to the end jumps over equal values.
- Building by n sift-up inserts costs O(n log n) instead of O(n).

**When to use it:** Use the sort when you need a guaranteed n log n in O(1) memory (Java does not use it, but some C++ introsorts fall back to it). Use the heap (PriorityQueue) for top-k, streaming medians, k-way merges, scheduling.

## 36. Heap sort: interview problems, mistakes and questions

### Interview problems that use it

| Problem | Approach |
|---|---|
| **Kth Largest Element (LC 215)** | Min-heap of size k: push each value, poll when size > k; the root is the answer. O(n log k). |
| **Top K Frequent Elements (LC 347)** | Count with a HashMap, keep a min-heap of size k by frequency (or bucket sort for O(n)). |
| **Find Median from Data Stream (LC 295)** | A max-heap for the lower half and a min-heap for the upper half, balanced in size. |
| **Merge k Sorted Lists (LC 23)** | Min-heap of the k current heads: O(N log k). |
| **Meeting Rooms II (LC 253)** | Sort by start; a min-heap of end times tracks rooms in use. |

### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Children at 2i and 2i + 1 | That is the 1-based layout; with 0-based arrays you skip the root's real children | 0-based: 2i + 1 and 2i + 2, parent (i − 1) / 2 |
| Building the heap from i = 0 upward with siftDown | Children are not heaps yet: wrong result | Go from n/2 − 1 down to 0 |
| Sifting down over the whole array after a swap | The sorted tail is pulled back into the heap | Pass the shrinking size `end` |
| Using a max-heap for k-th largest with all n values | O(n log n) and O(n) memory | Min-heap of size k |
| `PriorityQueue` is a max-heap | It is a min-heap by default | `new PriorityQueue<>(Comparator.reverseOrder())` for max |

### Interview questions

**Q01. Explain heap sort.** Build a max-heap in place in O(n), then n − 1 times swap the root (the max) to the end and sift the new root down in O(log n). O(n log n) always, O(1) space, not stable.

**Q02. Why is building a heap O(n) and not O(n log n)?** Sift-down cost is the node's height. Half the nodes are leaves (0), a quarter have height 1, … The sum n/4·1 + n/8·2 + … is bounded by n.

**Q03. Heap sort vs quicksort vs merge sort?** Heap: O(n log n) worst, O(1) space, not stable, poor cache use. Quick: fastest on average, O(n²) worst. Merge: O(n log n) worst, stable, O(n) space.

**Q04. How do you find the k-th largest with a heap?** Keep a min-heap of the k largest seen so far; when it grows past k, poll the smallest. The root is the answer: O(n log k) time, O(k) space.

**Q05. What are the index formulas of a binary heap stored in an array?** 0-based: left = 2i + 1, right = 2i + 2, parent = (i − 1) / 2; the last non-leaf is n/2 − 1.

### Takeaways

- Array as a tree: children 2i + 1, 2i + 2; max-heap keeps the max at a[0].
- Build O(n), then n extractions O(log n) each: O(n log n) always, O(1) space.
- Not stable; slower than quicksort in practice.
- Interviews use the heap itself: PriorityQueue for top-k, medians, k-way merge.

### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_heap`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Counting sort →

## 37. Counting sort: the idea and a dry run

**In 30 seconds:** When the values are integers in a **small range** 0 … k, don't compare at all: **count** how many times each value occurs, then write the values back in order. That is **O(n + k)** time and O(k) space, beating the n log n limit of comparison sorts. The stable version turns counts into end positions with **prefix sums** and places elements from right to left, which is how radix sort uses it. The same idea is the `int[26]` frequency array of String problems.

**Why it exists:** Comparison sorts can never beat Ω(n log n). When keys are small integers (ages, marks, letters, digits), counting is linear and simpler.

**Analogy (remember this one):** A car park with numbered bays by car length (3 m, 4 m, 5 m …): instead of comparing cars, each car just drives into the bay for its length. Then you empty the bays in order 3 m, 4 m, 5 m.

### How it works

1. Make `count = new int[k + 1]` and do `count[x]++` for every value.
2. Simple: for v = 0 … k write v `count[v]` times.
3. Stable: prefix sums `count[v] += count[v − 1]` give how many values are ≤ v.
4. Walk the input right to left and place each value at `out[--count[x]]`.

> 💡 **Remember it:** Counting sort = **tally marks**: count each value, then read the tally from smallest to largest. No comparisons.

### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `c_simple`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

### Dry run

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

## 38. Counting sort: every type in Java

2 ways to write it. Every method below was compiled on JDK 25 and checked against `Arrays.sort` on 3,000 random arrays (`Sorts.java`); `swap(a, i, j)` is the usual three-line helper. Each **See it** button opens that exact code in the explorer at the top, stepping line by line.

### Counting sort (simple)

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

### Counting sort (stable, prefix sums)

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

## 39. Counting sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Counting sort (simple) | O(n + k) | O(n + k) | O(n + k) | O(k) | – | – | 0 comparisons; n counts + n writes |
| Counting sort (stable, prefix sums) | O(n + k) | O(n + k) | O(n + k) | O(n + k) | Yes | – | 0 comparisons |

### Why these costs

- One pass to count (n), one pass over the counts (k), one pass to write (n): O(n + k).
- Space O(k) for the counts (+ O(n) for the stable version's output array).
- Zero comparisons, so the Ω(n log n) comparison lower bound does not apply.
- If k is huge (values up to 10⁹) the count array is too big: use a HashMap, radix sort or a comparison sort.
- Stable version: right-to-left placement keeps equal keys in input order.

**When to use it:** Use it when the range k is small compared with n (or both small): letters, digits, ages, scores, colors. Avoid it for wide ranges, negative values without an offset, or non-integer keys.

## 40. Counting sort: interview problems, mistakes and questions

### Interview problems that use it

| Problem | Approach |
|---|---|
| **Valid Anagram (LC 242) / Group Anagrams (LC 49)** | `int[26]` counts of letters; the count array (as a key) groups anagrams. |
| **H-Index (LC 274)** | Bucket citations by min(c, n) into counts[0..n], then scan from the top. O(n). |
| **Sort Characters By Frequency (LC 451)** | Count characters, then emit by frequency (bucket by count). |
| **Relative Sort Array (LC 1122)** | Count arr1 values (range 0..1000), emit in arr2 order, then the rest ascending. |
| **Sort an array of 0..9 digits or exam marks** | Classic counting sort, O(n + k). |

### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Using it with negative values | Negative index: ArrayIndexOutOfBoundsException | Shift by the minimum: `count[x − min]++` |
| Range up to 10⁹ | OutOfMemoryError or huge time | Use radix sort, a HashMap, or Arrays.sort |
| Placing left to right in the stable version | Equal keys come out reversed: not stable | Walk from the right with `--count[x]` |
| `new int[max]` | Index max is out of bounds | `new int[max + 1]` |

### Interview questions

**Q01. How can counting sort beat O(n log n)?** It never compares elements; it uses the values as array indexes. The Ω(n log n) lower bound only applies to comparison sorts.

**Q02. What is its complexity?** O(n + k) time, O(k) extra space (O(n + k) for the stable version), where k is the range of values.

**Q03. How do you make counting sort stable?** Turn counts into prefix sums (positions), then place elements from the right end of the input at out[--count[x]].

**Q04. When is counting sort a bad idea?** When the range k is much larger than n (sparse wide values), or keys are not small integers.

**Q05. Where does counting sort appear in String problems?** Every `int[26]` or `int[128]` frequency array: anagrams, first unique character, sort by frequency.

### Takeaways

- Count each value, write them back in order: O(n + k), no comparisons.
- Only for small integer ranges; shift by min for negatives.
- Prefix sums + right-to-left placement = stable (used by radix sort).
- The `int[26]` trick is counting sort in disguise.

### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_counting`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Radix sort →

## 41. Radix sort: the idea and a dry run

**In 30 seconds:** Sort integers **digit by digit**, from the least significant digit (ones) to the most significant, using a **stable** counting sort on each digit. Because each pass is stable, the order from earlier digits survives, and after the last digit the array is sorted. Time **O(d·(n + b))** for d digits in base b: linear for fixed-width keys. No comparisons.

**Why it exists:** Counting sort alone needs a small range. Radix sort applies it one digit at a time, so huge ranges (32-bit ints, phone numbers, IDs, fixed-length strings) can still be sorted in linear time.

**Analogy (remember this one):** Sorting number plates: first stack the cars by the last digit, then (keeping that order inside each stack) restack by the second-to-last digit, and so on. After the first digit, the whole line is in order.

### How it works

1. Find the maximum to know how many digits d there are.
2. For exp = 1, 10, 100 …: counting-sort the array by `(x / exp) % 10`, stably.
3. Copy the output back and move to the next digit.
4. After the most significant digit the array is sorted.

> 💡 **Remember it:** Radix sort = **sort by the last digit, then the next, keeping order**, like re-stacking number plates.

### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `radix`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

### Dry run

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

### The Java

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

## 42. Radix sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Radix sort (LSD, base 10) | O(d·(n + b)) | O(d·(n + b)) | O(d·(n + b)) | O(n + b) | Yes | – | 0 comparisons; d passes (d = digits, b = base 10) |

### Why these costs

- Each pass is a counting sort over n values with b = 10 buckets: O(n + b).
- d passes: O(d·(n + b)). For 32-bit ints in base 256, d = 4: effectively O(n).
- Extra space O(n + b) for the output and the counts.
- Stability of each pass is essential: an unstable pass would scramble the order produced by earlier digits.
- Negative numbers need an offset (or a separate pass for the sign).

**When to use it:** Use it for many fixed-width integer or string keys (IDs, dates, phone numbers, IP addresses). Avoid it for few elements, variable-length keys with huge d, or floating point without bit tricks.

## 43. Radix sort: interview problems, mistakes and questions

### Interview problems that use it

| Problem | Approach |
|---|---|
| **Maximum Gap (LC 164)** | Radix sort in O(n), then scan adjacent differences (or the bucket/pigeonhole trick). |
| **Sort 10 million phone numbers** | LSD radix sort: d = 10 digits, linear time. |
| **Sort strings of equal length** | LSD radix on characters from the last position to the first. |
| **Why can radix sort beat n log n?** | It doesn't compare; its cost depends on the key width d, not on log n. |

### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Using an unstable sort for each digit | Earlier digits' order is lost: wrong result | A stable counting sort per digit |
| Starting from the most significant digit with this loop | LSD loop logic gives wrong order | LSD: ones first. MSD needs recursion per bucket |
| Negative numbers | `(x / exp) % 10` is negative: bad index | Offset all values by −min, or sort negatives separately |
| `max / exp` overflow with exp *= 10 near Integer.MAX_VALUE | exp overflows and the loop misbehaves | Use long exp or loop a fixed number of digits |

### Interview questions

**Q01. How does LSD radix sort work?** Stable counting sort by the ones digit, then the tens, and so on up to the most significant digit. Stability keeps the earlier digits' order inside equal digits.

**Q02. What is its complexity?** O(d·(n + b)) time and O(n + b) space, where d is the number of digits and b the base.

**Q03. Why must each pass be stable?** Pass k must keep the order created by passes 1 … k − 1 among values with the same k-th digit; otherwise the lower digits are scrambled.

**Q04. Radix sort vs counting sort?** Counting sort needs the whole range k in memory; radix sort handles big ranges by counting one digit (base b) at a time.

### Takeaways

- Stable counting sort digit by digit, least significant first.
- O(d·(n + b)): linear for fixed-width keys; no comparisons.
- Every pass must be stable; negatives need an offset.

### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_radix`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Bucket sort →

## 44. Bucket sort: the idea and a dry run

**In 30 seconds:** Spread the values into **buckets by range** (bucket = x · n / (max + 1)), sort each small bucket, and concatenate the buckets in order. If the values are spread evenly, each bucket holds about one value and the whole sort is **O(n + k) on average**; if they all land in one bucket it degrades to that bucket's sort, O(n²) with insertion sort. In interviews the same idea, with **frequency as the bucket index**, solves Top K Frequent in O(n).

**Why it exists:** When you know the distribution (uniform floats in [0, 1), scores 0–99), you can place each value almost directly where it belongs and skip most comparisons.

**Analogy (remember this one):** Post office pigeonholes: letters are dropped into holes by postcode range, each hole is sorted by hand (it holds only a few letters), and then the holes are emptied left to right.

### How it works

1. Create n empty buckets.
2. Put each value x into bucket `x · n / (max + 1)`; the bucket index grows with x.
3. Sort every bucket (they are small, so insertion sort is typical).
4. Concatenate the buckets in order.

> 💡 **Remember it:** Bucket sort = **pigeonholes by range**: drop each value in its hole, tidy each hole, read the holes in order.

### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `bucket`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

### Dry run

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

### The Java

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

## 45. Bucket sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Bucket sort | O(n + k) | O(n + k) | O(n²) | O(n + k) | Yes* | – | linear on average; all in one bucket = worst case |

### Why these costs

- Scatter and gather are O(n); with n buckets and uniform data each bucket has O(1) values on average, so sorting them is O(n) total.
- Worst case: all values in one bucket, so the bucket sort dominates: O(n²) with insertion sort, O(n log n) with a comparison sort.
- Space O(n + k) for the buckets.
- Stable if values are appended in input order and each bucket is sorted stably.

**When to use it:** Use it for uniformly distributed values with a known range, or when the "key" is small like a frequency (LC 347). Avoid it for skewed data.

## 46. Bucket sort: interview problems, mistakes and questions

### Interview problems that use it

| Problem | Approach |
|---|---|
| **Top K Frequent Elements (LC 347)** | Count frequencies; bucket i holds the values that occur i times (i ≤ n); read buckets from the top. O(n). |
| **Maximum Gap (LC 164)** | n − 1 buckets by range; the max gap is between buckets, so keep only each bucket's min and max. O(n). |
| **Sort floats uniformly in [0, 1)** | Bucket = (int)(x · n); classic CLRS bucket sort. |
| **Contains Duplicate III (LC 220)** | Buckets of width t + 1 over values; check the same and neighbouring buckets. |

### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Bucket index `x * n / max` | x = max gives index n: out of bounds | Divide by `max + 1` |
| `x * n` overflow for large values | Negative index | Compute in long |
| Choosing too few buckets for the data | Big buckets, slow inner sorts | About n buckets for n values |
| Assuming O(n) on any input | Skewed data puts everything in one bucket | State the uniform-distribution assumption |

### Interview questions

**Q01. How does bucket sort work and when is it linear?** Scatter values into range buckets, sort each bucket, concatenate. It is O(n + k) on average when values are spread uniformly so each bucket is small.

**Q02. What is its worst case?** All values in one bucket: the cost of the inner sort on n values, O(n²) with insertion sort.

**Q03. How does bucket sort solve Top K Frequent in O(n)?** Frequencies are between 1 and n, so use them as bucket indexes: bucket[f] lists values seen f times; collect from the highest bucket down until you have k.

**Q04. Bucket sort vs counting sort?** Counting sort has one bucket per possible value (just a count); bucket sort groups a range of values per bucket and sorts inside each.

### Takeaways

- Scatter by range, sort small buckets, concatenate.
- O(n + k) average for uniform data, O(n²) worst.
- Frequency as the bucket index: Top K Frequent in O(n).

### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_bucket`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Cyclic sort →

## 47. Cyclic sort: the idea and a dry run

**In 30 seconds:** When the values are exactly (or almost) **1 … n**, value v belongs at index **v − 1**. Walk the array: if a[i] is not at its home and its home doesn't already hold the same value, swap it home; otherwise move on. Every swap puts at least one value home, so it is **O(n) time and O(1) space**. Afterwards, any index i with a[i] ≠ i + 1 reveals a **missing** number (i + 1) and a **duplicate** (a[i]): the pattern behind a whole family of interview problems.

**Why it exists:** The "numbers 1 to n" constraint appears constantly in interviews. Using the values as indexes finds missing and duplicate numbers in linear time without a HashSet.

**Analogy (remember this one):** Numbered parking bays 1 … n and cars with matching ticket numbers: walk along the bays, and whenever a car is in the wrong bay, drive it straight to the bay on its ticket. Each car moves at most once.

### How it works

1. i = 0.
2. `target = a[i] − 1` (where a[i] belongs).
3. If `a[i] != a[target]`, swap a[i] to its target (don't move i: the new a[i] must be placed too).
4. Else i++ (a[i] is home, or it is a duplicate of the value already home).

> 💡 **Remember it:** Cyclic sort = **numbered bays**: send every car straight to the bay on its ticket.

### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `cyclic`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

### Dry run

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

### The Java

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

## 48. Cyclic sort: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Cyclic sort (values 1…n) | O(n) | O(n) | O(n) | O(1) | No | – | at most n − 1 swaps |

### Why these costs

- Each swap puts one value in its final slot, so there are at most n − 1 swaps; i advances n times: O(n).
- O(1) extra space: no HashSet or count array.
- Comparing `a[i]` with `a[target]` (not with i + 1) stops infinite loops on duplicates.
- Only works when values map to indexes (1..n or 0..n−1).

**When to use it:** Use it whenever the input is a permutation (or near-permutation) of 1..n or 0..n − 1 and you need missing/duplicate values in O(1) space.

## 49. Cyclic sort: interview problems, mistakes and questions

### Interview problems that use it

| Problem | Approach |
|---|---|
| **Missing Number (LC 268)** | Values 0..n: cyclic sort for values < n, then the first index with a[i] ≠ i (or n). (XOR or sum also work.) |
| **Find the Duplicate Number (LC 287)** | Cyclic sort finds it (modifies the array); Floyd's cycle detection does it read-only. |
| **First Missing Positive (LC 41)** | Place each value in 1..n at index v − 1, ignore the rest; the first i with a[i] ≠ i + 1 gives i + 1. |
| **Find All Duplicates (LC 442) / All Missing (LC 448)** | After cyclic sort, wrong slots give duplicates a[i] and missing numbers i + 1. |
| **Set Mismatch (LC 645)** | The one wrong slot gives the duplicate and the missing number. |

### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Condition `a[i] != i + 1` | With duplicates it swaps the same values forever | Compare `a[i] != a[a[i] − 1]` |
| Incrementing i after a swap | The value swapped in is never placed | Only i++ when nothing was swapped |
| Values outside 1..n (LC 41) | Index out of bounds | Skip values ≤ 0 or > n |
| Off-by-one between 0..n−1 and 1..n | Wrong targets | target = a[i] − 1 for 1..n; a[i] for 0..n−1 |

### Interview questions

**Q01. What is cyclic sort and when can you use it?** For values in 1..n, swap each value to index v − 1 until everything is home. Only when values map to indexes; O(n) time, O(1) space.

**Q02. Why is it O(n) even though it has a while loop with swaps?** Each swap places one value permanently, so there are at most n − 1 swaps, plus n increments of i.

**Q03. How do you find all duplicates and missing numbers with it?** After the sort, every index i with a[i] ≠ i + 1 holds a duplicate a[i], and i + 1 is missing.

**Q04. How does it find the first missing positive (LC 41)?** Place every value in 1..n at its index, ignore others; the first index i with a[i] ≠ i + 1 gives the answer i + 1 (or n + 1).

### Takeaways

- Values 1..n: value v belongs at index v − 1.
- Swap until home; compare with a[target] to survive duplicates.
- O(n) time, O(1) space; wrong slots reveal missing and duplicate numbers.

### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_cyclic`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Next in the path: Dutch National Flag →

## 50. Dutch National Flag: the idea and a dry run

**In 30 seconds:** Sort an array of only **0s, 1s and 2s** in **one pass** with three pointers: everything before `lo` is 0, between lo and mid is 1, after `hi` is 2, and a[mid..hi] is still unknown. A 0 is swapped to lo (lo++, mid++), a 2 is swapped to hi (hi-- only, because the value that came from hi is unchecked), a 1 just moves mid. **O(n) time, O(1) space**. It is Dijkstra's 3-way partition, the core of 3-way quicksort.

**Why it exists:** Counting sort would need two passes; this needs one and works in place. The same three-zone idea partitions around any pivot when there are many duplicates.

**Analogy (remember this one):** The Dutch flag has three stripes: red, white, blue. Sort a pile of red, white and blue cars into a lane with red at the front and blue at the back, using one walk and only swaps.

### How it works

1. lo = mid = 0, hi = n − 1.
2. While mid ≤ hi: if a[mid] == 0, swap(lo, mid), lo++, mid++.
3. Else if a[mid] == 2, swap(mid, hi), hi-- (mid stays).
4. Else (a 1) mid++.

> 💡 **Remember it:** Dutch National Flag = **three stripes, three pointers**: 0s to the front, 2s to the back, 1s stay in the middle.

### Watch it

The bars are the array and the Java on the right runs one line per step. Press **Play**, or click the lab and use ← →; try the other inputs too (sorted, reversed, your own numbers).

*[Visual: Sort Lab on `dnf`: the bars, the Java line by line, counters, colour key; keys ← → Space.]*

### Dry run

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

### The Java

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

## 51. Dutch National Flag: time and space complexity

| Type | Best | Average | Worst | Space | Stable | Adaptive | Work done |
|---|---|---|---|---|---|---|---|
| Dutch National Flag (0, 1, 2) | O(n) | O(n) | O(n) | O(1) | No | – | one pass, at most n swaps |

### Why these costs

- Each step either moves mid forward or hi backward, so the loop runs at most n times: O(n).
- At most n swaps, O(1) extra space.
- Not stable (swaps jump), which doesn't matter for plain 0/1/2 values.
- Generalizes: partition into < pivot, = pivot, > pivot.

**When to use it:** Use it for Sort Colors, any three-way partition (negatives / zeros / positives), and 3-way quicksort.

## 52. Dutch National Flag: interview problems, mistakes and questions

### Interview problems that use it

| Problem | Approach |
|---|---|
| **Sort Colors (LC 75)** | Exactly this algorithm, one pass. |
| **Partition around a pivot with duplicates** | 3-way partition: < pivot, = pivot, > pivot. |
| **Move Zeroes (LC 283) / segregate even and odd** | The two-zone version: one write pointer. |
| **Wiggle Sort II (LC 324)** | Median via Quickselect, then a 3-way partition with index mapping. |

### Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| mid++ after swapping with hi | The value that came from hi is never checked | Only hi-- |
| Loop condition `mid < hi` | The last unknown element is skipped | `while (mid <= hi)` |
| Not moving mid when swapping a 0 | Re-checks a value known to be 1 (or loops) | lo++ and mid++ together |
| Using two passes of counting | Works, but the interviewer asked for one pass | Three pointers |

### Interview questions

**Q01. Explain the Dutch National Flag algorithm.** Three pointers lo, mid, hi keep zones [0s | 1s | unknown | 2s]. Look at a[mid]: 0 → swap to lo, lo++, mid++; 2 → swap to hi, hi--; 1 → mid++. One pass, O(1) space.

**Q02. Why don't we increment mid after swapping with hi?** The value moved from hi into mid has not been examined yet; it could be a 0 or 2.

**Q03. How is it related to quicksort?** It is the 3-way partition: with a pivot instead of 1, zones become < pivot, = pivot, > pivot, which makes quicksort fast on many duplicates.

**Q04. What is its complexity?** O(n) time with at most n swaps, O(1) extra space.

### Takeaways

- Three pointers: [0s | 1s | unknown | 2s].
- 0 → swap to lo, lo++ and mid++; 2 → swap to hi, hi-- only; 1 → mid++.
- O(n), O(1); the 3-way partition of quicksort.

### Check yourself

Quiz: 3 Check yourself questions (`QZ.s_dnf`), listed under "Practice layer" → "Lesson 06 · Check yourself per sort".

Path complete: back to the explorer ↑
