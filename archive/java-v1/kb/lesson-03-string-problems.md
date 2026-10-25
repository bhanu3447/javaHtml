# Lesson 03 — String Problems & Patterns (completing Strings)

*This lesson covers the rest of Strings: how to approach a problem, the 7 patterns behind almost every String question, and the classic problems solved with them. Every program was run on JDK 25 and its output is in the comments. On the page, it is sections S1–S12.*

## Table of Contents

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

## 1. How to approach any String problem

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

## 2. The 7 patterns

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

## 3. Reversal: 5 ways, and reversing words

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

## 4. Palindromes

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

## 5. Counting and frequency

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

## 6. Sliding window

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

## 7. Stacks and parsing

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

## 8. More classic problems

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

## 9. Strings with streams and Comparators

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

## 10. Regex, beyond the basics

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

## 11. 15 more interview questions

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

## 12. Practice and pattern map

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
