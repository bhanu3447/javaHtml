/* Quiz data (QZ: lesson → MCQs) and recall prompts (RC: lesson → prompts per review day).
   Part of the course scripts. Every page loads, in this order: course-index.js, quiz-data.js, course.js, effects.js,
   labs-oop.js, labs-collections.js, labs-analogy.js, labs-sorting.js, practice-tools.js. They are classic scripts, so
   top-level const/let/function names are shared between them (course.js defines $, $$, esc, store, hl, FX, THM…). */
"use strict";
/* learning layer: quiz data (QZ: lesson → MCQs {lv,q,o,a,e}; RC: lesson → recall prompts per review day) */
const QZ={},RC={};
/* @quiz-data */
QZ.l00=[
{lv:"B",q:"What does this print?<pre><code>System.out.println(7 / 2);</code></pre>",o:["3.5","3","4","3.0"],a:1,e:"Both operands are <code>int</code>, so this is integer division and the fraction is dropped: <b>3</b>. You get 3.5 only if one side is a double, e.g. <code>7 / 2.0</code>. 3.0 would need the result to be a double."},
{lv:"B",q:"Which tool turns <code>Hello.java</code> into <code>Hello.class</code>?",o:["<code>java</code>","The JIT compiler","<code>javac</code>","The class loader"],a:2,e:"<code>javac</code> compiles source to bytecode ahead of time. <code>java</code> starts the JVM; the class loader loads existing <code>.class</code> files; the JIT compiles <i>bytecode</i> to native code at run time, it never sees <code>.java</code>."},
{lv:"B",q:"What does this print?<pre><code>System.out.println(1 + 2 + \"3\" + 4 + 5);</code></pre>",o:["15","3345","12345","339"],a:1,e:"<code>+</code> is evaluated left to right. <code>1 + 2</code> is int addition (3); then <code>3 + \"3\"</code> becomes the String \"33\", and every later <code>+</code> is concatenation: \"3345\"."},
{lv:"B",q:"A method declares <code>int count;</code> and then prints <code>count</code> without assigning it. What happens?",o:["It prints 0","It prints a random value","Compile error: variable might not have been initialized","NullPointerException at run time"],a:2,e:"Local variables have <b>no default value</b>; the compiler enforces definite assignment. Only fields and array elements get defaults like 0, so \"prints 0\" is the tempting wrong answer."},
{lv:"I",q:"What does this print?<pre><code>Integer a = 127, b = 127, c = 128, d = 128;\nSystem.out.println((a == b) + \" \" + (c == d));</code></pre>",o:["true true","false false","true false","false true"],a:2,e:"Autoboxing calls <code>Integer.valueOf</code>, which returns cached objects for −128..127. <code>a</code> and <code>b</code> share one object (true); 128 is outside the cache, so <code>c</code> and <code>d</code> are different objects (false). Use <code>equals</code> for values."},
{lv:"I",q:"What does this print?<pre><code>byte b = 127;\nb += 1;\nSystem.out.println(b);</code></pre>",o:["128","Compile error","-128","ArithmeticException"],a:2,e:"<code>b += 1</code> means <code>b = (byte) (b + 1)</code>. 128 doesn't fit in a byte, and the narrowing cast keeps the low 8 bits, which is −128. It compiles because of the hidden cast (<code>b = b + 1</code> would not), and integer overflow never throws."},
{lv:"I",q:"What does this print?<pre><code>System.out.println(-7 % 3 + \" \" + Math.floorMod(-7, 3));</code></pre>",o:["2 2","-1 2","-1 -1","1 2"],a:1,e:"<code>%</code> takes the sign of the <b>left</b> operand: −7 = 3 × (−2) + (−1), so −1. <code>Math.floorMod</code> rounds the quotient down instead, giving a result with the divisor's sign: 2."},
{lv:"I",q:"Given <code>static void f(long x)</code> and <code>static void f(Integer x)</code>, which one does <code>f(5)</code> call?",o:["<code>f(long)</code>","<code>f(Integer)</code>","Compile error: ambiguous","It depends on the JVM"],a:0,e:"Overload resolution tries widening <i>before</i> boxing. <code>int → long</code> is widening (phase 1), while <code>int → Integer</code> needs boxing (phase 2), so <code>f(long)</code> wins and the call is not ambiguous."},
{lv:"I",q:"What does this print?<pre><code>static void m(StringBuilder sb) {\n    sb.append(\"b\");\n    sb = new StringBuilder(\"z\");\n    sb.append(\"c\");\n}\n// in main:\nStringBuilder s = new StringBuilder(\"a\");\nm(s);\nSystem.out.println(s);</code></pre>",o:["a","abc","zc","ab"],a:3,e:"The parameter is a copy of the reference. <code>append(\"b\")</code> changes the shared object (\"ab\"). Reassigning <code>sb</code> only moves the copy, so <code>\"zc\"</code> is built on a new object the caller never sees. Java is pass-by-value."},
{lv:"A",q:"What does this print?<pre><code>int k = 1;\nk = k++ + ++k;\nSystem.out.println(k);</code></pre>",o:["3","4","5","2"],a:1,e:"Left to right: <code>k++</code> yields 1 and sets k to 2; <code>++k</code> sets k to 3 and yields 3. The sum 1 + 3 = <b>4</b> is then assigned to k, overwriting the 3."},
{lv:"A",q:"What does this print?<pre><code>int x = 2;\nswitch (x) {\n    case 1: System.out.print(\"A\");\n    case 2: System.out.print(\"B\");\n    case 3: System.out.print(\"C\"); break;\n    default: System.out.print(\"D\");\n}</code></pre>",o:["B","BC","BCD","ABC"],a:1,e:"Execution jumps to <code>case 2</code>, prints B, then <b>falls through</b> into case 3 (no break) and prints C, and the <code>break</code> stops it before <code>default</code>. The arrow form <code>case 2 -&gt;</code> would print only B."},
{lv:"A",q:"Which statement about how HotSpot runs your code is correct?",o:["<code>javac</code> produces native machine code, so the JVM only loads it","The JIT compiles every method before <code>main</code> starts","Bytecode is interpreted at first, and frequently run methods are compiled to native code at run time","Bytecode is tied to the OS it was compiled on"],a:2,e:"HotSpot starts by interpreting bytecode and profiles it; hot methods are JIT-compiled (C1, then C2). <code>javac</code> emits portable bytecode, not machine code, and nothing is compiled up front before <code>main</code> (that would be ahead-of-time compilation, a separate tool)."}
];
RC.l00={
d1:[["What do the JDK, JRE and JVM each contain?","JVM runs bytecode; JRE = JVM + standard library; JDK = JRE + tools (<code>javac</code>, <code>javap</code>, <code>jshell</code>)."],["Which values does the Integer cache cover, and why does it matter?","−128..127 via <code>Integer.valueOf</code>; <code>==</code> between wrappers only works by accident inside that range, so use <code>equals</code>."],["Is Java pass-by-value or pass-by-reference?","Always by value. For objects the value is a reference: mutation is visible, reassignment is not."]],
d3:[["Why does <code>b += 1</code> compile for a byte but <code>b = b + 1</code> not?","Arithmetic promotes to int; compound assignment includes a hidden narrowing cast."],["Name the three phases of overload resolution.","1. exact or widening (no boxing), 2. boxing/unboxing, 3. varargs. First phase with a match wins; most specific inside it."],["What happens on <code>Integer.MAX_VALUE + 1</code>, and how do you guard against it?","It wraps to <code>Integer.MIN_VALUE</code> silently. Use <code>long</code>, or <code>Math.addExact</code> to throw on overflow."]],
d7:[["Draw the path from <code>Hello.java</code> to running native code.","javac → <code>Hello.class</code> (bytecode) → class loader → verifier → interpreter → JIT for hot methods; heap, stacks, Metaspace at run time."],["Switch statement vs switch expression: four differences.","Arrow form: no fall-through, comma labels, returns a value (<code>yield</code> in blocks), must be exhaustive. Java 21 adds type patterns and <code>case null</code>."],["What happens on the stack during <code>factorial(3)</code>, and when do you get StackOverflowError?","Each call pushes a frame with its own n until the base case; returns pop frames. With no reachable base case the thread's stack fills up."]]
};
/* Lesson 01–04 review quizzes. Every "what does this print" item was run on JDK 25 . */
QZ.l01=[
{lv:"B",q:`Which statement about <code>String</code> is true?`,
 o:[`It is a primitive type, like <code>char</code>`,`It is an object of the <code>final</code> class <code>java.lang.String</code>, and its value can't change`,`It is a mutable object; methods such as <code>toUpperCase()</code> change it in place`,`It must be imported with <code>import java.lang.String;</code>`],
 a:1,e:`A String is an object, its class is <code>final</code>, and it is immutable. <code>java.lang</code> is imported automatically. Methods such as <code>toUpperCase()</code> return a <b>new</b> String; they never change the original.`},
{lv:"B",q:`What does this print?<pre><code>String s = "java";
s.toUpperCase();
System.out.println(s);</code></pre>`,
 o:[`<code>JAVA</code>`,`<code>Java</code>`,`It doesn't compile`,`<code>java</code>`],
 a:3,e:`<code>toUpperCase()</code> returns a new String, and the result is thrown away. <code>s</code> still points to <code>"java"</code>. Write <code>s = s.toUpperCase();</code> to keep it.`},
{lv:"B",q:`What does <code>"Hello".substring(1, 3)</code> return?`,
 o:[`<code>"Hel"</code>`,`<code>"ell"</code>`,`<code>"el"</code>`,`<code>"llo"</code>`],
 a:2,e:`The range is half-open: the start index 1 is included and the end index 3 is excluded, so you get the chars at 1 and 2: <code>"el"</code>. The length of the result is <code>end - start</code> = 2.`},
{lv:"I",q:`What does this print?<pre><code>String a = "hi", b = "h" + "i", c = new String("hi");
String h = "h";
String d = h + "i";
System.out.println((a == b) + " " + (a == c) + " " + (a == d) + " " + (a == d.intern()));</code></pre>`,
 o:[`<code>true false false true</code>`,`<code>true false true true</code>`,`<code>false false false true</code>`,`<code>true true false false</code>`],
 a:0,e:`<code>"h" + "i"</code> is folded by javac into the literal <code>"hi"</code>, so it is the pooled object. <code>new</code> always makes a heap object. <code>h + "i"</code> uses a variable that is not <code>final</code>, so it is built at runtime as a new heap String. <code>intern()</code> returns the pooled <code>"hi"</code>, which is <code>a</code>.`},
{lv:"I",q:`What does <code>System.out.println(1 + 2 + "3" + 4 + 5);</code> print?`,
 o:[`<code>15</code>`,`<code>12345</code>`,`<code>339</code>`,`<code>3345</code>`],
 a:3,e:`<code>+</code> runs left to right. <code>1 + 2</code> is int addition (3). Once a String appears, every later <code>+</code> is concatenation: <code>"33"</code>, <code>"334"</code>, <code>"3345"</code>. Write <code>"3" + (4 + 5)</code> if you want 9.`},
{lv:"I",q:`A request handler checks a header that may be missing (<code>null</code>). Which check never throws?`,
 o:[`<code>role.equals("admin")</code>`,`<code>role == "admin"</code>`,`<code>"admin".equals(role)</code>`,`<code>role.equalsIgnoreCase("admin")</code>`],
 a:2,e:`Calling a method on the literal is null-safe: <code>"admin".equals(null)</code> is simply <code>false</code>. Options 1 and 4 throw <code>NullPointerException</code> when <code>role</code> is null. <code>==</code> doesn't throw, but it compares references, so a header value read at runtime would not match. <code>Objects.equals(role, "admin")</code> is also safe.`},
{lv:"I",q:`What is <code>"a,b,,c,,".split(",").length</code>?`,
 o:[`<code>6</code>`,`<code>4</code>`,`<code>3</code>`,`<code>5</code>`],
 a:1,e:`The pieces are <code>"a"</code>, <code>"b"</code>, <code>""</code>, <code>"c"</code>, <code>""</code>, <code>""</code>. <code>split</code> drops only the <b>trailing</b> empty strings, so the empty string in the middle stays: 4. Use <code>split(",", -1)</code> to keep all 6.`},
{lv:"A",q:`What does this print?<pre><code>String e = "😀";
System.out.println(e.length() + " " + e.codePointCount(0, e.length()));</code></pre>`,
 o:[`<code>1 1</code>`,`<code>2 2</code>`,`<code>2 1</code>`,`<code>4 1</code>`],
 a:2,e:`The emoji is outside the Basic Multilingual Plane, so UTF-16 stores it as a surrogate pair: 2 <code>char</code>s, but 1 code point. (4 is its size in UTF-8 bytes, not in chars.)`},
{lv:"A",q:`What do these two lines print?<pre><code>System.out.println("" + 'a' + 'b');
System.out.println('a' + 'b' + "");</code></pre>`,
 o:[`<code>ab</code> then <code>ab</code>`,`<code>ab</code> then <code>195</code>`,`<code>195</code> then <code>ab</code>`,`<code>195</code> then <code>195</code>`],
 a:1,e:`Left to right again. In line 1 the String comes first, so each char is appended. In line 2, <code>'a' + 'b'</code> is char + char, which is int addition: 97 + 98 = 195. Only then is it turned into a String.`},
{lv:"A",q:`A version string is masked like this. What is printed?<pre><code>System.out.println("1.2.3".replaceAll(".", "-"));</code></pre>`,
 o:[`<code>1-2-3</code>`,`<code>-----</code>`,`<code>1.2.3</code>`,`It throws <code>PatternSyntaxException</code>`],
 a:1,e:`<code>replaceAll</code> takes a <b>regex</b>, and <code>.</code> means "any character", so all 5 chars are replaced. Use <code>replace(".", "-")</code> (literal) or the regex <code>"\\\\."</code> to get <code>1-2-3</code>.`}
];
QZ.l02=[
{lv:"B",q:`On a current JDK (13 or later), which fields hold a String's data?`,
 o:[`A <code>char[] value</code> and an <code>int count</code>`,`A <code>byte[] value</code>, a <code>byte coder</code>, a cached <code>int hash</code> and a <code>boolean hashIsZero</code>`,`A pointer into the String pool and a length`,`A <code>StringBuilder</code> that is frozen after construction`],
 a:1,e:`Compact Strings (Java 9) replaced <code>char[]</code> with <code>byte[]</code> plus a <code>coder</code> (LATIN1 = 1 byte per char, UTF16 = 2). <code>hash</code> caches <code>hashCode()</code>, and <code>hashIsZero</code> (added in Java 13) remembers that a computed hash really was 0.`},
{lv:"B",q:`What does this print?<pre><code>StringBuilder x = new StringBuilder("ab"), y = new StringBuilder("ab");
System.out.println(x.equals(y) + " " + x.toString().equals(y.toString()) + " " + (x.compareTo(y) == 0));</code></pre>`,
 o:[`<code>true true true</code>`,`<code>false true true</code>`,`<code>false true false</code>`,`<code>false false true</code>`],
 a:1,e:`StringBuilder does not override <code>equals</code>, so it inherits <code>Object.equals</code> (identity): false. Comparing the Strings works. Since Java 11 StringBuilder implements <code>Comparable</code>, so <code>compareTo</code> compares content: 0.`},
{lv:"B",q:`Does this compile, and what does it print?<pre><code>final StringBuilder sb = new StringBuilder("a");
sb.append("b");
System.out.println(sb);</code></pre>`,
 o:[`It doesn't compile: <code>sb</code> is final`,`It prints <code>a</code>`,`It prints <code>ab</code>`,`It throws <code>UnsupportedOperationException</code>`],
 a:2,e:`<code>final</code> fixes the <b>reference</b>, not the object. You can't write <code>sb = new StringBuilder()</code>, but you can still change the object it points to. Final is not the same as immutable.`},
{lv:"I",q:`What does this print?<pre><code>StringBuilder sb = new StringBuilder();
sb.append("abcdefghijklmnopq");   // 17 chars
System.out.println(sb.length() + " " + sb.capacity());</code></pre>`,
 o:[`<code>17 17</code>`,`<code>17 32</code>`,`<code>16 34</code>`,`<code>17 34</code>`],
 a:3,e:`The default capacity is 16. 17 chars don't fit, so it grows to <code>max(old*2 + 2, needed)</code> = <code>max(34, 17)</code> = 34. <code>length()</code> is the number of chars actually stored.`},
{lv:"I",q:`What does this print?<pre><code>String s = null;
s += "x";
System.out.println(s);</code></pre>`,
 o:[`<code>x</code>`,`<code>nullx</code>`,`It throws <code>NullPointerException</code>`,`It doesn't compile`],
 a:1,e:`String concatenation turns a null reference into the text <code>"null"</code>, so <code>s</code> becomes <code>"nullx"</code>. No method is called on <code>s</code>, so there is no NPE. (<code>s.concat("x")</code> would throw.)`},
{lv:"I",q:`<code>"hi"</code> is not in the pool yet. How many String objects does <code>String s = new String("hi");</code> create?`,
 o:[`1`,`2`,`3`,`0, because the JVM reuses one from the pool`],
 a:1,e:`Two: the literal <code>"hi"</code> is put in the pool when the <code>ldc</code> instruction first runs, and <code>new</code> creates a second String object on the heap. The copy shares the pooled object's <code>byte[]</code>, so the characters are not copied.`},
{lv:"I",q:`What does this print?<pre><code>final String a = "he";
String b = "he";
String p = a + "llo", q = b + "llo";
System.out.println((p == "hello") + " " + (q == "hello"));</code></pre>`,
 o:[`<code>true true</code>`,`<code>false false</code>`,`<code>true false</code>`,`<code>false true</code>`],
 a:2,e:`<code>a</code> is a <code>final</code> variable initialised with a constant, so <code>a + "llo"</code> is a compile-time constant that javac folds into the pooled literal. <code>b</code> is not final, so <code>b + "llo"</code> is built at runtime as a new heap object.`},
{lv:"A",q:`What does this print?<pre><code>Map&lt;String, Integer&gt; m = new HashMap&lt;&gt;();
m.put("Aa", 1);
m.put("BB", 2);
System.out.println(("Aa".hashCode() == "BB".hashCode()) + " " + m.size() + " " + m.get("BB"));</code></pre>`,
 o:[`<code>false 2 2</code>`,`<code>true 1 2</code>`,`<code>true 2 2</code>`,`<code>true 2 1</code>`],
 a:2,e:`"Aa" and "BB" collide: 65*31 + 97 = 66*31 + 66 = 2112. Same bucket, but the map then calls <code>equals</code>, which is false, so both entries are kept and <code>get</code> finds the right one. Equal hashes never mean equal keys.`},
{lv:"A",q:`On Java 7+, what does this print?<pre><code>String t = new StringBuilder("ja").append("vaX1").toString();
System.out.println(t.intern() == t);</code></pre>`,
 o:[`<code>true</code>`,`<code>false</code>`,`It depends on the pool size`,`It throws <code>IllegalStateException</code>`],
 a:0,e:`"javaX1" is not in the pool yet. Since Java 7, <code>intern()</code> records a <b>reference</b> to the existing heap object instead of copying it, so it returns <code>t</code> itself. On Java 6 it copied the String into PermGen, and the result was false.`},
{lv:"A",q:`A cache uses request paths as <code>HashMap</code> keys. Why is <code>String</code> a safe key while a <code>StringBuilder</code> key is not?`,
 o:[`StringBuilder is slower to hash`,`String is immutable, so its <code>hashCode</code> can never change after it is stored; StringBuilder also uses identity <code>equals</code>/<code>hashCode</code>`,`HashMap only accepts <code>final</code> classes as keys`,`StringBuilder can't be null`],
 a:1,e:`A key's hash must stay the same while it is in the map, or it lands in the "wrong" bucket and can't be found again. String's content can't change, and its hash is cached. StringBuilder doesn't override <code>equals</code>/<code>hashCode</code>, so a new builder with the same text would not find the entry anyway.`}
];
QZ.l03=[
{lv:"B",q:`"Find the longest substring without repeating characters." Which pattern fits best?`,
 o:[`Sorting`,`Sliding window`,`Stack`,`Two pointers from both ends`],
 a:1,e:`"Longest/shortest contiguous substring that satisfies a condition" is the sliding-window signal. Grow the right edge, shrink the left edge when the condition breaks: O(n).`},
{lv:"B",q:`What does this print?<pre><code>int[] f = new int[26];
for (char c : "banana".toCharArray()) f[c - 'a']++;
System.out.println(f[0] + " " + f['n' - 'a'] + " " + f[1]);</code></pre>`,
 o:[`<code>1 2 3</code>`,`<code>3 2 0</code>`,`<code>0 13 1</code>`,`<code>3 2 1</code>`],
 a:3,e:`<code>c - 'a'</code> maps 'a'→0, 'b'→1, 'n'→13. "banana" has three a's, two n's and one b. This int[26] count is the O(n) answer for anagram and frequency problems on lowercase letters.`},
{lv:"B",q:`What are the time and extra space of the two-pointer palindrome check?`,
 o:[`O(n) time, O(n) space`,`O(n²) time, O(1) space`,`O(n) time, O(1) space`,`O(n log n) time, O(1) space`],
 a:2,e:`One pointer from each end, moving inward, compares each pair once: n/2 comparisons, and only two int variables. Building a reversed copy also takes O(n) time, but O(n) extra space.`},
{lv:"I",q:`What does this print?<pre><code>String s = "  the sky  is blue ";
String[] w = s.trim().split("\\\\s+");
Collections.reverse(Arrays.asList(w));
System.out.println(String.join(" ", w) + "|");</code></pre>`,
 o:[`<code>eulb si yks eht|</code>`,`<code>blue is  sky the |</code>`,`<code>blue is sky the|</code>`,`<code> blue is sky the|</code>`],
 a:2,e:`<code>trim()</code> removes the outer spaces, and <code>\\s+</code> treats each run of spaces as one separator, so there are no empty words. <code>Arrays.asList</code> is a view of the array, so reversing the list reverses <code>w</code>. <code>join</code> puts single spaces back.`},
{lv:"I",q:`What does this print?<pre><code>Matcher m = Pattern.compile("(\\\\w+)@(\\\\w+)\\\\.com").matcher("mail bob@site.com now");
if (m.find()) System.out.println(m.group(2) + " " + m.group(0));</code></pre>`,
 o:[`<code>site bob@site.com</code>`,`<code>bob site</code>`,`<code>site mail bob@site.com now</code>`,`Nothing: <code>find()</code> needs the whole String to match`],
 a:0,e:`Groups are numbered by their opening bracket: group 1 is "bob", group 2 is "site". Group 0 is the whole match, not the whole input. <code>find()</code> searches for a match anywhere; <code>matches()</code> is the one that needs the whole String.`},
{lv:"I",q:`An API receives dates as <code>yyyy-mm-dd</code>. What does this return?<pre><code>"2024-01-15".replaceAll("(\\\\d+)-(\\\\d+)-(\\\\d+)", "$3/$2/$1")</code></pre>`,
 o:[`<code>2024/01/15</code>`,`<code>$3/$2/$1</code>`,`<code>15/01/2024</code>`,`<code>15-01-2024</code>`],
 a:2,e:`In the replacement, <code>$n</code> inserts what group n matched: 15, then 01, then 2024. To insert a literal <code>$</code>, escape it or use <code>Matcher.quoteReplacement</code>.`},
{lv:"I",q:`A query-string parser splits each <code>key=value</code> pair. For the pair <code>"b="</code> (empty value), what are <code>"b=".split("=").length</code> and <code>"b=".split("=", 2).length</code>?`,
 o:[`<code>2</code> and <code>2</code>`,`<code>1</code> and <code>2</code>`,`<code>1</code> and <code>1</code>`,`<code>2</code> and <code>1</code>`],
 a:1,e:`Without a limit, the trailing empty value is dropped, so <code>kv[1]</code> would throw <code>ArrayIndexOutOfBoundsException</code>. With limit 2 the String is split at most once and trailing empties are kept: <code>["b", ""]</code>. Limit 2 also keeps a value such as <code>a=b=c</code> intact.`},
{lv:"A",q:`What does this print?<pre><code>String h = "&lt;b&gt;x&lt;/b&gt;&lt;b&gt;y&lt;/b&gt;";
System.out.println(h.replaceAll("&lt;b&gt;.*&lt;/b&gt;", "#") + " " + h.replaceAll("&lt;b&gt;.*?&lt;/b&gt;", "#"));</code></pre>`,
 o:[`<code>## ##</code>`,`<code># #</code>`,`<code>## #</code>`,`<code># ##</code>`],
 a:3,e:`<code>.*</code> is greedy: it runs to the <b>last</b> <code>&lt;/b&gt;</code>, so the whole String becomes one <code>#</code>. <code>.*?</code> is lazy: it stops at the first <code>&lt;/b&gt;</code>, so each tag pair is replaced separately: <code>##</code>.`},
{lv:"A",q:`<code>e = "a😀b"</code>. Which reversal gives <code>"b😀a"</code>?`,
 o:[`Swapping chars in <code>e.toCharArray()</code> with two pointers`,`<code>new StringBuilder(e).reverse()</code>`,`Both`,`Neither: emoji can't be reversed in Java`],
 a:1,e:`The emoji is 2 chars (a surrogate pair). A plain char swap reverses the pair into an invalid order, so the emoji breaks. <code>StringBuilder.reverse()</code> treats surrogate pairs as one unit and keeps them in order. Verified on JDK 25: the swap result is not equal to "b😀a".`},
{lv:"A",q:`This sliding window for "longest substring without repeats" has a bug. What does it return for <code>"abba"</code>, and what is the correct answer?<pre><code>if (last[c] &gt;= 0) left = last[c] + 1;   // jump past the old copy
last[c] = r;
best = Math.max(best, r - left + 1);</code></pre>`,
 o:[`Returns 2; correct is 2`,`Returns 3; correct is 2`,`Returns 4; correct is 2`,`Returns 2; correct is 3`],
 a:1,e:`At the final 'a' (r = 3), the old 'a' is at index 0, so <code>left</code> jumps <b>back</b> from 2 to 1, and the window "bba" (length 3) is counted even though it repeats 'b'. The left edge must never move left: <code>left = Math.max(left, last[c] + 1)</code>. Then the answer is 2 ("ab" or "ba").`}
];
QZ.l04=[
{lv:"B",q:`What does this print?<pre><code>int[] a = new int[3];
String[] s = new String[2];
boolean[] b = new boolean[1];
System.out.println(a[1] + " " + s[0] + " " + b[0]);</code></pre>`,
 o:[`It doesn't compile: the arrays are not initialised`,`<code>0 null false</code>`,`<code>0  false</code>`,`It throws <code>NullPointerException</code>`],
 a:1,e:`A new array is always filled with defaults: 0 for numbers, <code>false</code> for boolean, <code>null</code> for references. Concatenating <code>null</code> prints "null". (Only <b>local variables</b> must be assigned before use, not array elements.)`},
{lv:"B",q:`What happens here?<pre><code>int[] a = {1, 2, 3};
System.out.println(a.length + " " + a[a.length]);</code></pre>`,
 o:[`It prints <code>3 3</code>`,`It prints <code>3 0</code>`,`It throws <code>ArrayIndexOutOfBoundsException</code> and prints nothing`,`It prints <code>3</code> and then throws`],
 a:2,e:`Valid indexes are 0 to <code>length - 1</code>. The whole argument is evaluated before <code>println</code> runs, so the exception ("Index 3 out of bounds for length 3") is thrown before anything is printed.`},
{lv:"B",q:`Why is <code>arr[i]</code> O(1)?`,
 o:[`The JVM keeps a hash table of every element`,`Elements sit in one contiguous block, so the address is <code>base + i × elementSize</code>`,`Arrays are always sorted`,`It isn't: the JVM walks the array from index 0`],
 a:1,e:`One multiply and one add give the address of any element, whatever i is. That is also why indexes start at 0: index 0 is the offset 0 from the start of the data.`},
{lv:"I",q:`What does this print?<pre><code>int[] a = {1, 2, 3};
int[] b = a;
int[] c = a.clone();
b[0] = 9;
c[1] = 8;
System.out.println(Arrays.toString(a));</code></pre>`,
 o:[`<code>[1, 2, 3]</code>`,`<code>[9, 8, 3]</code>`,`<code>[1, 8, 3]</code>`,`<code>[9, 2, 3]</code>`],
 a:3,e:`<code>b = a</code> copies the reference, so <code>b</code> is an alias and writes through it change <code>a</code>. <code>clone()</code> makes a new array, so writing to <code>c</code> leaves <code>a</code> alone.`},
{lv:"I",q:`What does this print?<pre><code>int[][] g = {{1, 2}, {3, 4}};
int[][] h = g.clone();
h[0][0] = 7;
h[1] = new int[]{5, 6};
System.out.println(Arrays.deepToString(g));</code></pre>`,
 o:[`<code>[[1, 2], [3, 4]]</code>`,`<code>[[7, 2], [5, 6]]</code>`,`<code>[[7, 2], [3, 4]]</code>`,`<code>[[1, 2], [5, 6]]</code>`],
 a:2,e:`<code>clone()</code> of a 2D array is shallow: a new outer array that holds the <b>same</b> row arrays. <code>h[0][0] = 7</code> writes into a shared row, so <code>g</code> sees it. <code>h[1] = …</code> replaces a slot in <code>h</code>'s own outer array only.`},
{lv:"I",q:`What does this print?<pre><code>int[] x = {1, 2}, y = {1, 2};
System.out.println(x.equals(y) + " " + Arrays.equals(x, y) + " " + (Arrays.hashCode(x) == Arrays.hashCode(y)));</code></pre>`,
 o:[`<code>true true true</code>`,`<code>false true true</code>`,`<code>false true false</code>`,`<code>false false true</code>`],
 a:1,e:`Arrays don't override <code>equals</code>, so <code>x.equals(y)</code> is identity: false. <code>Arrays.equals</code> and <code>Arrays.hashCode</code> work on the content. This is why an <code>int[]</code> is a poor HashMap key.`},
{lv:"I",q:`What does this print?<pre><code>static void f(int[] a) {
    a[0] = 5;
    a = new int[]{7, 7};
    a[1] = 9;
}
// in main:
int[] arr = {1, 2};
f(arr);
System.out.println(Arrays.toString(arr));</code></pre>`,
 o:[`<code>[1, 2]</code>`,`<code>[5, 2]</code>`,`<code>[7, 9]</code>`,`<code>[5, 9]</code>`],
 a:1,e:`Java passes a <b>copy of the reference</b>. <code>a[0] = 5</code> goes through the copy to the caller's array. <code>a = new int[]…</code> only re-points the local copy, so <code>a[1] = 9</code> changes the new array, which the caller never sees.`},
{lv:"A",q:`What does this print?<pre><code>String[] s = {"b", "a"};
List&lt;String&gt; l = Arrays.asList(s);
s[0] = "z";
l.set(1, "y");
System.out.println(Arrays.toString(s) + " " + l);
try { l.add("c"); } catch (UnsupportedOperationException e) { System.out.println("UOE"); }</code></pre>`,
 o:[`<code>[z, a] [b, y]</code> then <code>UOE</code>`,`<code>[z, y] [z, y]</code> then <code>UOE</code>`,`<code>[z, y] [z, y]</code> and the add succeeds`,`<code>[z, a] [z, y]</code> then <code>UOE</code>`],
 a:1,e:`<code>Arrays.asList</code> returns a fixed-size <b>view</b> backed by the array: writes go both ways, and <code>set</code> works, but <code>add</code>/<code>remove</code> throw. Use <code>new ArrayList&lt;&gt;(Arrays.asList(s))</code> for an independent, growable list.`},
{lv:"A",q:`What happens here?<pre><code>Object[] o = new String[2];
o[0] = "ok";
o[1] = 42;</code></pre>`,
 o:[`Compile error on line 1`,`Compile error on line 3`,`It compiles and throws <code>ArrayStoreException</code> on line 3`,`It runs fine; <code>o[1]</code> holds 42`],
 a:2,e:`Arrays are covariant: a <code>String[]</code> is an <code>Object[]</code>, so the code compiles. The array still knows it is a <code>String[]</code>, and the JVM checks every store at runtime: storing an Integer throws <code>ArrayStoreException: java.lang.Integer</code>. Generics are invariant, so <code>List&lt;Object&gt; l = new ArrayList&lt;String&gt;()</code> fails at compile time instead.`},
{lv:"A",q:`Orders arrive already sorted by id: o1 PAID, o2 NEW, o3 PAID, o4 NEW. You sort the <code>Order[]</code> by status with <code>Arrays.sort(orders, comparing(Order::status))</code>. What is the order?`,
 o:[`<code>o2 o4 o1 o3</code>, guaranteed`,`<code>o4 o2 o3 o1</code>`,`<code>o2 o4</code> then <code>o1 o3</code> in an unspecified order`,`It depends on the JVM`],
 a:0,e:`<code>Arrays.sort</code> for objects is TimSort, which is <b>stable</b>: equal keys keep their earlier order, so the id order survives inside each status. That is why you can sort by a secondary key first, then by the primary key. Primitive sorts (dual-pivot quicksort) are not stable, but for primitives that can't be observed.`}
];

RC.l01={
 d1:[[`What is a String in Java?`,`An immutable object of the <code>final</code> class <code>java.lang.String</code>, a sequence of UTF-16 chars.`],
     [`What does <code>==</code> compare for Strings, and what does <code>equals</code> compare?`,`<code>==</code> compares references (same object?); <code>equals</code> compares the characters.`],
     [`Where do literals go, and where does <code>new String("x")</code> go?`,`Literals go to the String pool; <code>new</code> always creates a new heap object.`]],
 d3:[[`Why does <code>s.trim();</code> on its own do nothing?`,`String methods return a new String; you must reassign: <code>s = s.trim();</code>.`],
     [`Why is <code>+=</code> in a loop slow?`,`Each step copies the whole String so far: O(n²) total. A StringBuilder appends into one growing buffer: O(n).`],
     [`Why does <code>"1.2".split(".")</code> return an empty array?`,`<code>split</code> takes a regex; <code>.</code> matches every char, every piece is empty, and trailing empties are dropped. Use <code>"\\\\."</code>.`]],
 d7:[[`Explain to an interviewer why String is immutable.`,`Safe sharing in the pool, a hash that can be cached (safe map keys), thread safety without locks, and security (paths, class names, URLs can't change after checks).`],
     [`How would you safely compare a user-supplied value with a constant?`,`<code>"CONST".equals(value)</code> or <code>Objects.equals(value, "CONST")</code>: null-safe and content-based.`],
     [`A log line for each of 1 million records is built with <code>+</code> in a loop. What do you change and why?`,`Use one StringBuilder (or <code>String.join</code>/<code>StringJoiner</code>) to avoid O(n²) copying and garbage; consider pre-sizing its capacity.`]]
};
RC.l02={
 d1:[[`Where has the String pool lived since Java 7?`,`In the main heap (it was in PermGen in Java 6).`],
     [`What is StringBuilder's default capacity and growth rule?`,`16; it grows to <code>max(old*2 + 2, needed)</code>.`],
     [`Which fields make up a JDK 13+ String?`,`<code>byte[] value</code>, <code>byte coder</code>, <code>int hash</code>, <code>boolean hashIsZero</code>.`]],
 d3:[[`Why is <code>"a" + "b" == "ab"</code> true, but <code>x + "b" == "ab"</code> false (x not final)?`,`javac folds constant expressions into one pooled literal; a non-constant operand means the result is built at runtime as a new object.`],
     [`Why does StringBuilder's <code>equals</code> return false for the same text?`,`It doesn't override <code>Object.equals</code>, so it compares identity. Compare <code>toString()</code>, use <code>compareTo</code> (Java 11+) or <code>contentEquals</code>.`],
     [`What changed in <code>intern()</code> in Java 7?`,`It stores a reference to the existing heap String instead of copying it into PermGen, so <code>s.intern() == s</code> can be true.`]],
 d7:[[`Walk an interviewer through what <code>new String("hi")</code> does.`,`<code>ldc</code> resolves the literal (pooling it on first use), <code>new</code> allocates a String on the heap, the constructor shares the pooled <code>byte[]</code>: 2 String objects, 1 byte array.`],
     [`Explain the equals/hashCode contract with a HashMap lookup.`,`hashCode picks the bucket, equals confirms the key. Equal objects must have equal hashes; equal hashes (e.g. "Aa"/"BB") don't imply equality.`],
     [`How does <code>+</code> compile in Java 8 versus Java 9+?`,`Java 8: a <code>new StringBuilder().append(...).toString()</code> chain. Java 9+: one <code>invokedynamic</code> to <code>StringConcatFactory</code>, which picks the strategy at runtime.`]]
};
RC.l03={
 d1:[[`Name the 7 String patterns.`,`Frequency count, two pointers, sliding window, stack, sorting or canonical key, expand around centre, and build with StringBuilder.`],
     [`How do you map a lowercase letter to an index 0–25?`,`<code>c - 'a'</code>.`],
     [`What does <code>split(",", -1)</code> change?`,`It keeps trailing empty strings.`]],
 d3:[[`Why is the int[26] count O(n) for anagrams while sorting is O(n log n)?`,`Counting touches each char once and compares 26 slots; sorting both Strings costs n log n.`],
     [`Why must the sliding-window left edge use <code>Math.max</code>?`,`The last position of a char can be left of the window; without max, the left edge jumps backwards and counts repeats ("abba" gives 3 instead of 2).`],
     [`Greedy vs lazy quantifier?`,`<code>.*</code> takes as much as possible and backs off; <code>.*?</code> takes as little as possible.`]],
 d7:[[`Explain expand-around-centre for the longest palindrome.`,`Try each of the 2n−1 centres (each char and each gap), expand while both ends match, keep the best: O(n²) time, O(1) space.`],
     [`How would you validate brackets in a JSON-like payload?`,`Push openers onto a stack (<code>ArrayDeque</code>), pop and match on each closer, and require the stack to be empty at the end.`],
     [`How do you parse <code>key=value</code> pairs safely?`,`Split on <code>&amp;</code>, then <code>split("=", 2)</code> so empty values and values containing <code>=</code> survive; decode and validate each part.`]]
};
RC.l04={
 d1:[[`What are the default values in a new array?`,`0 / 0.0 for numbers, <code>'\\u0000'</code> for char, <code>false</code> for boolean, <code>null</code> for references.`],
     [`Is <code>length</code> a field or a method on arrays?`,`A final field: <code>arr.length</code> (Strings use <code>length()</code>).`],
     [`Which algorithm does <code>Arrays.sort</code> use?`,`Dual-pivot quicksort for primitives; TimSort (stable) for objects.`]],
 d3:[[`Why does a method that reassigns its array parameter not affect the caller?`,`Java passes a copy of the reference; reassigning the copy re-points only the local variable.`],
     [`Why does <code>Arrays.asList(new int[]{1,2})</code> have size 1?`,`Generics can't hold primitives, so <code>T</code> becomes <code>int[]</code> and the list holds the array itself.`],
     [`Why is <code>clone()</code> of a 2D array shallow?`,`A 2D array is an array of references to rows; clone copies the references, not the rows.`]],
 d7:[[`Explain array covariance and why generics chose invariance.`,`<code>String[]</code> is an <code>Object[]</code>, so a wrong store is only caught at runtime (ArrayStoreException). Generics are invariant so the compiler catches it.`],
     [`When do you choose an array over an ArrayList in backend code?`,`Fixed size, primitives (no boxing), hot loops or byte buffers; otherwise ArrayList for growth and the Collections API.`],
     [`Walk through Kadane's algorithm.`,`Keep the best sum ending here: <code>cur = max(x, cur + x)</code>; track the overall best. O(n) time, O(1) space; start from the first element so all-negative input works.`]]
};
/* Lesson 05 (OOP) quiz and recall prompts. Every "what does this print" item was run on JDK 25. */
QZ.l05=[
{lv:"B",q:`Which statement about classes and objects is correct?`,
 o:[`A class and an object are the same thing`,`A class is a blueprint loaded once; each <code>new</code> creates a separate object on the heap with its own instance fields`,`Every object holds its own copy of the class's methods`,`Objects are stored inside the variables that refer to them`],
 a:1,e:`The class (field layout, method code, method table) is loaded once into Metaspace. Each object on the heap holds only a header and its own instance fields; variables hold references to objects.`},
{lv:"B",q:`What does this print?<pre><code>Car a = new Car("Swift");   // speed starts at 0
Car b = a;
b.speed = 5;
System.out.println(a.speed);</code></pre>`,
 o:[`0`,`5`,`Compile error`,`NullPointerException`],
 a:1,e:`<code>b = a</code> copies the <b>reference</b>, so both variables point to one Car. Setting the speed through <code>b</code> is visible through <code>a</code>.`},
{lv:"B",q:`A field is declared with <b>no</b> access modifier. Who can access it?`,
 o:[`Everyone`,`Only the class itself`,`Classes in the same package`,`Classes in the same package and subclasses anywhere`],
 a:2,e:`No modifier means <b>package-private</b>: the same package only. <code>protected</code> adds subclasses in other packages; <code>public</code> is everyone.`},
{lv:"B",q:`<code>class Dog</code> declares only the constructor <code>Dog(String name)</code>. What does <code>new Dog()</code> do?`,
 o:[`Creates a Dog with <code>name = null</code>`,`Compile error: no matching constructor`,`Throws <code>InstantiationException</code> at run time`,`Calls <code>Object()</code> directly`],
 a:1,e:`The compiler adds a no-arg constructor only when a class declares <b>no</b> constructors. Once <code>Dog(String)</code> exists, <code>new Dog()</code> has nothing to call: "constructor Dog in class Dog cannot be applied to given types".`},
{lv:"I",q:`What does this print?<pre><code>class A { void f(Object o) { System.out.println("A.obj"); } }
class B extends A { void f(String s) { System.out.println("B.str"); } }

A x = new B();
x.f("hi");</code></pre>`,
 o:[`B.str`,`A.obj`,`Compile error: ambiguous`,`ClassCastException`],
 a:1,e:`<code>f(String)</code> has a different parameter type, so it is an <b>overload</b>, not an override. <code>javac</code> looks only at the declared type <code>A</code>, which has just <code>f(Object)</code>. B doesn't override <code>f(Object)</code>, so A's version runs. Writing <code>@Override</code> on B's method would have caught it.`},
{lv:"I",q:`What does this print?<pre><code>class P { String n = "P"; String get() { return n; } }
class C extends P { String n = "C"; @Override String get() { return n; } }

P p = new C();
System.out.println(p.n + " " + p.get());</code></pre>`,
 o:[`C C`,`P P`,`P C`,`C P`],
 a:2,e:`Fields are <b>not</b> polymorphic: <code>p.n</code> uses the declared type P, so "P". Methods are: <code>p.get()</code> runs C's override, which reads C's own field, so "C".`},
{lv:"I",q:`<code>Point</code> overrides <code>equals</code> (comparing x and y) but <b>not</b> <code>hashCode</code>. What does this print?<pre><code>Set&lt;Point&gt; set = new HashSet&lt;&gt;();
set.add(new Point(1, 2));
System.out.println(set.contains(new Point(1, 2)));</code></pre>`,
 o:[`true`,`false`,`It throws an exception`,`Compile error`],
 a:1,e:`The two objects have different identity hash codes, so the set looks in the wrong bucket and never calls <code>equals</code>. (In theory the hashes could collide and print true, but in practice it is false.) Equal objects must have equal hash codes.`},
{lv:"I",q:`Which statement about abstract classes and interfaces is true?`,
 o:[`An interface can have instance fields that each object gets a copy of`,`An abstract class can have constructors and state; a class can implement many interfaces but extend only one class`,`An abstract class must contain at least one abstract method`,`Interface methods can't have bodies in any Java version`],
 a:1,e:`Interfaces have only <code>public static final</code> constants (no instance state) and, since Java 8, <code>default</code>/<code>static</code> methods with bodies. An abstract class may have zero abstract methods; it just can't be instantiated.`},
{lv:"I",q:`What does <code>new C()</code> print?<pre><code>class P { static { print("Ps "); }  { print("Pi "); }  P() { print("Pc "); } }
class C extends P { static { print("Cs "); }  { print("Ci "); }  C() { print("Cc "); } }</code></pre>`,
 o:[`Ps Pi Pc Cs Ci Cc`,`Ps Cs Pi Pc Ci Cc`,`Cs Ps Ci Cc Pi Pc`,`Ps Cs Ci Cc Pi Pc`],
 a:1,e:`Class initialisation first, parent then child (both static blocks). Then the object: <code>C()</code> calls <code>super()</code>, which runs P's instance block and constructor; then C's instance block, then the rest of C's constructor.`},
{lv:"A",q:`What does <code>new Der()</code> print?<pre><code>class Base { Base() { show(); }  void show() {} }
class Der extends Base {
    String s = "set";
    @Override void show() { System.out.println(s); }
}</code></pre>`,
 o:[`set`,`null`,`Nothing`,`NullPointerException`],
 a:1,e:`<code>Base()</code> runs before Der's field initialisers, but dispatch already uses Der, so <code>Der.show()</code> runs while <code>s</code> is still <code>null</code>. Printing a null String prints "null" (no exception). Never call overridable methods from a constructor.`},
{lv:"A",q:`A <code>CountingSet extends HashSet</code> overrides <code>add</code> (count++) and <code>addAll</code> (count += size, then <code>super.addAll</code>). After <code>addAll(List.of("a", "b", "c"))</code>, what is the count?`,
 o:[`3`,`6`,`0`,`9`],
 a:1,e:`The inherited <code>addAll</code> (from <code>AbstractCollection</code>) calls <code>add</code> for each element, and that is the overriding <code>add</code>, so 3 + 3 = 6. The fragile base class problem: prefer composition (wrap a Set and forward).`},
{lv:"A",q:`What does this print?<pre><code>class Animal { static String kind() { return "Animal"; } }
class Dog extends Animal { static String kind() { return "Dog"; } }

Animal a = new Dog();
System.out.println(a.kind() + " " + ((Dog) a).kind());</code></pre>`,
 o:[`Dog Dog`,`Animal Dog`,`Animal Animal`,`Compile error: static methods can't be redeclared`],
 a:1,e:`Static methods are <b>hidden</b>, not overridden. The call is bound at compile time to the declared type: <code>a</code> is Animal, the cast expression is Dog. Write <code>Animal.kind()</code> to make it obvious.`}
];
RC.l05={
 d1:[[`Class vs object in one sentence each.`,`Class: the blueprint, loaded once. Object: an instance made by <code>new</code> on the heap with its own fields.`],
     [`When does Java add a default constructor?`,`Only when the class declares no constructor at all.`],
     [`List the four access levels from narrowest to widest.`,`<code>private</code> &lt; package-private &lt; <code>protected</code> &lt; <code>public</code>.`]],
 d3:[[`Overloading vs overriding: who picks, and when?`,`Overloads: <code>javac</code>, from declared types. Overrides: the JVM at run time, from the object's class.`],
     [`Why must equals and hashCode be overridden together?`,`Hash collections find the bucket by hash before calling equals; equal objects need equal hashes.`],
     [`Give the order of initialisation for <code>new Child()</code>.`,`Static parent, static child (once); parent fields/blocks/constructor; child fields/blocks; child constructor body.`]],
 d7:[[`Explain composition over inheritance with an example.`,`A counting <code>HashSet</code> subclass double-counts because <code>addAll</code> calls <code>add</code>; a wrapper that forwards to a Set depends only on the contract.`],
     [`Abstract class vs interface: how do you choose?`,`Interface for a capability (many, no state, defaults); abstract class for shared state, constructors or a template method (one).`],
     [`What do records, enums and sealed types each give you?`,`Record: generated immutable data class. Enum: fixed singleton instances with behaviour. Sealed: closed hierarchy, exhaustive switch.`]]
};

/* Lesson 06 (bubble sort) quiz and recall prompts. Every "what does this print / what happens" item was run on JDK 25. */
QZ.l06=[
{lv:"B",q:`What does <code>[5, 1, 4, 2, 8]</code> look like after the <b>first</b> pass of bubble sort (ascending)?`,
 o:[`<code>[1, 5, 4, 2, 8]</code>`,`<code>[1, 4, 2, 5, 8]</code>`,`<code>[1, 2, 4, 5, 8]</code>`,`<code>[1, 4, 5, 2, 8]</code>`],
 a:1,e:`5 wins three comparisons in a row (5&gt;1, 5&gt;4, 5&gt;2) and moves right until it meets 8; then 8 is compared with nothing larger. Pass 1 parks the largest value, 8, at the end: <code>[1, 4, 2, 5, 8]</code>.`},
{lv:"B",q:`Which elements does bubble sort compare?`,
 o:[`The smallest remaining element with every other element`,`Each element with the pivot`,`Adjacent elements <code>a[j]</code> and <code>a[j + 1]</code>`,`The first and last elements of the unsorted part`],
 a:2,e:`Bubble sort only ever compares and swaps <b>neighbours</b>. Selection sort searches for the minimum; quicksort uses a pivot.`},
{lv:"B",q:`At most how many passes does bubble sort need for an array of <code>n</code> elements?`,
 o:[`<code>n / 2</code>`,`<code>n − 1</code>`,`<code>n</code>`,`<code>n²</code>`],
 a:1,e:`Each pass parks one more value at the end; once n − 1 values are parked, the last one (the minimum) is automatically at index 0.`},
{lv:"I",q:`What is the best-case time of the standard bubble sort <b>without</b> a swapped flag (inner loop <code>j &lt; n - 1 - i</code>)?`,
 o:[`O(1)`,`O(n)`,`O(n log n)`,`O(n²)`],
 a:3,e:`Without the flag it never stops early: it makes n(n−1)/2 comparisons even on sorted input. "O(n) best case" is true only with the swapped-flag optimization.`},
{lv:"I",q:`With the swapped flag, how many comparisons does bubble sort make on an already sorted array of 1000 elements?`,
 o:[`999`,`1000`,`499,500`,`0`],
 a:0,e:`One pass compares the 999 neighbour pairs, swaps nothing, and the flag ends the sort. Measured in <code>BubbleCounts</code>: 999.`},
{lv:"I",q:`What happens?<pre><code>int[] b = {5, 1, 4, 2, 8};
int n = b.length;
for (int i = 0; i &lt; n - 1; i++)
    for (int j = 0; j &lt; n - i; j++)
        if (b[j] &gt; b[j + 1]) { /* swap */ }</code></pre>`,
 o:[`It sorts the array correctly`,`It makes one extra harmless comparison per pass`,`<code>ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5</code>`,`An infinite loop`],
 a:2,e:`In the first pass <code>j</code> reaches 4, so <code>b[j + 1]</code> reads <code>b[5]</code>. The last valid pair is (n−2, n−1): the bound must be <code>j &lt; n - 1 - i</code>.`},
{lv:"I",q:`How many swaps does bubble sort make on <code>[3, 1, 2]</code>?`,
 o:[`1`,`2`,`3`,`It depends on the variant`],
 a:1,e:`Swaps = inversions. The inversions are (3,1) and (3,2): 2 swaps, in every adjacent-swap variant (V1–V9).`},
{lv:"I",q:`You change <code>if (a[j] &gt; a[j + 1])</code> to <code>if (a[j] &gt;= a[j + 1])</code>. What changes?`,
 o:[`Nothing: the result is the same array`,`It sorts in descending order`,`Equal elements are swapped, so the sort is no longer stable (and does extra swaps)`,`It throws for duplicate values`],
 a:2,e:`For plain <code>int</code>s the output looks the same, but objects with equal keys change their relative order: <code>[Asha:90, Meena:90]</code> becomes <code>[Meena:90, Asha:90]</code>. With duplicates it can even swap back and forth needlessly.`},
{lv:"A",q:`What is the extra space used by recursive bubble sort (<code>bubble(a, n)</code> → one pass → <code>bubble(a, n − 1)</code>)?`,
 o:[`O(1): it sorts in place`,`O(log n)`,`O(n): up to n − 1 stack frames`,`O(n²)`],
 a:2,e:`The array is sorted in place, but each active call keeps a stack frame. Java has no tail-call elimination, so the depth is up to n − 1: O(n). The fully recursive version overflows for n = 1,000,000.`},
{lv:"A",q:`What does this print?<pre><code>int[] a = {2, 1, 3, 4};
int c = 0;
boolean swapped = false;          // declared once
for (int i = 0; i &lt; a.length - 1; i++) {
    for (int j = 0; j &lt; a.length - 1 - i; j++) {
        c++;
        if (a[j] &gt; a[j + 1]) { /* swap */ swapped = true; }
    }
    if (!swapped) break;
}
System.out.println(c);</code></pre>`,
 o:[`3`,`5`,`6`,`4`],
 a:2,e:`<code>swapped</code> is never reset, so after the first swap the early exit can never fire: 3 + 2 + 1 = <b>6</b>. With the reset inside the outer loop it would print 5 (3 + 2).`},
{lv:"A",q:`<code>[2, 3, 4, 5, 6, 7, 8, 1]</code> takes 7 passes with the swapped flag. Which variant fixes this best, and why?`,
 o:[`Odd–even sort, because it runs in parallel`,`Cocktail shaker sort: its backward sweep carries the 1 (a "turtle") to the front in one sweep`,`Recursive bubble sort, because it uses the call stack`,`The last-swap boundary, because it shrinks faster`],
 a:1,e:`A small value at the end moves only one slot left per forward pass. Cocktail shaker sort sorts it in 3 sweeps and 18 comparisons instead of 7 passes and 28 (<code>CocktailSort</code> output).`},
{lv:"A",q:`Which statement about comb sort is <b>false</b>?`,
 o:[`It compares elements a gap apart and shrinks the gap by about 1.3`,`When the gap reaches 1 it is bubble sort with a flag`,`It is stable, like bubble sort`,`On 10,000 random ints it made about 327 thousand comparisons, versus about 50 million for bubble sort`],
 a:2,e:`Swaps over a gap can jump one element over an equal one, so comb sort is <b>not</b> stable. The counts are from <code>CombSort</code>: 326,734 vs 49,967,034.`}
];
RC.l06={
 d1:[[`Explain bubble sort in two sentences.`,`Compare each pair of neighbours and swap them if they are out of order; one walk is a pass. After pass k the k largest values are parked at the end, so n − 1 passes sort the array.`],
     [`Write the inner loop bound and say why.`,`<code>j &lt; n - 1 - i</code>: the last pair is (n−2−i, n−1−i); the i parked values after it never move.`],
     [`What does the swapped flag give you?`,`Early exit: a pass with no swaps proves the array is sorted. Best case O(n).`]],
 d3:[[`Best, average, worst time and space of bubble sort?`,`O(n) with the flag (O(n²) without), O(n²), O(n²); O(1) space for loops, O(n) stack for recursion.`],
     [`Why is bubble sort stable, and how do you break it?`,`It swaps only on strict <code>&gt;</code>, so equal elements never cross; <code>&gt;=</code> breaks it.`],
     [`How many swaps on a given input?`,`Exactly the number of inversions; n(n−1)/2 for a reversed array.`]],
 d7:[[`Write recursive bubble sort and state its cost.`,`<code>if (n &lt;= 1) return;</code> one pass; <code>bubble(a, n - 1)</code>. O(n²) time, O(n) stack.`],
     [`Name three relatives of bubble sort and what each fixes.`,`Cocktail shaker (turtles, two directions), odd–even (parallel phases), comb sort (gap shrinking by 1.3, fast in practice, unstable).`],
     [`What does the last-swap boundary do?`,`Remembers the index of the last swap; everything after it is final, so the next pass stops there. Same Big-O, fewer comparisons.`]]
};
/* Lesson 07 (collections) quiz and recall prompts. Every "what does this print / does it compile" item was run on JDK 25. */
QZ.l07=[
{lv:"B",q:`Which of these does <b>not</b> extend <code>Collection</code>?`,
 o:[`<code>List</code>`,`<code>Set</code>`,`<code>Queue</code>`,`<code>Map</code>`],
 a:3,e:`<code>Map</code> is a separate hierarchy: it stores key-value pairs, so <code>add(E)</code> makes no sense for it. It offers collection <i>views</i> instead: <code>keySet()</code>, <code>values()</code>, <code>entrySet()</code>.`},
{lv:"B",q:`What does this print?<pre><code>List&lt;Integer&gt; l = new ArrayList&lt;&gt;(List.of(10, 20, 30));
l.remove(1);
System.out.println(l);</code></pre>`,
 o:[`<code>[20, 30]</code>`,`<code>[10, 30]</code>`,`<code>[10, 20, 30]</code>`,`<code>[10, 20]</code>`],
 a:1,e:`<code>remove(1)</code> with an <code>int</code> argument picks <code>remove(int index)</code>, so the element at index 1 (20) goes. To remove the <i>value</i> 1 write <code>l.remove(Integer.valueOf(1))</code>.`},
{lv:"B",q:`You need unique elements, always iterated in sorted order. Which class?`,
 o:[`<code>HashSet</code>`,`<code>LinkedHashSet</code>`,`<code>TreeSet</code>`,`<code>ArrayList</code>`],
 a:2,e:`<code>TreeSet</code> is a red-black tree: unique and sorted, O(log n). <code>LinkedHashSet</code> keeps <i>insertion</i> order; <code>HashSet</code> promises no order.`},
{lv:"I",q:`What does this print?<pre><code>Map&lt;String, Integer&gt; m = new HashMap&lt;&gt;();
System.out.println(m.put("a", 1) + " " + m.put("a", 2) + " " + m.size());</code></pre>`,
 o:[`<code>null 1 1</code>`,`<code>1 2 2</code>`,`<code>null null 2</code>`,`<code>true false 1</code>`],
 a:0,e:`<code>put</code> returns the <b>previous</b> value: <code>null</code> for a new key, then 1 when the second put replaces it. The key is the same, so the size stays 1.`},
{lv:"I",q:`A <code>new HashMap&lt;&gt;()</code> gets keys with well-spread hash codes. Which <code>put</code> triggers the first resize?`,
 o:[`The 9th`,`The 12th`,`The 13th`,`The 17th`],
 a:2,e:`Capacity 16 × load factor 0.75 = threshold 12. The resize happens when <code>++size &gt; threshold</code>, i.e. on the 13th entry; the table doubles to 32.`},
{lv:"I",q:`What does this print?<pre><code>PriorityQueue&lt;Integer&gt; pq = new PriorityQueue&lt;&gt;();
pq.offer(4); pq.offer(1); pq.offer(3);
System.out.println(pq);</code></pre>`,
 o:[`<code>[1, 3, 4]</code>`,`<code>[1, 4, 3]</code>`,`<code>[4, 1, 3]</code>`,`<code>[3, 4, 1]</code>`],
 a:1,e:`<code>toString</code> shows the heap array, not sorted order. 4 → [4]; 1 sifts up past 4 → [1, 4]; 3 is placed at index 2, its parent 1 is smaller, so it stays → <code>[1, 4, 3]</code>. Only <code>poll()</code> gives sorted order.`},
{lv:"I",q:`What happens?<pre><code>List&lt;String&gt; f = new ArrayList&lt;&gt;(List.of("a", "b", "c"));
for (String s : f) if (s.equals("b")) f.remove(s);
System.out.println(f);</code></pre>`,
 o:[`<code>ConcurrentModificationException</code>`,`Prints <code>[a, c]</code>`,`Prints <code>[a, b, c]</code>`,`Prints <code>[a]</code>`],
 a:1,e:`"b" is the second-to-last element. After removing it, size is 2 and the iterator's cursor is 2, so <code>hasNext()</code> returns false and the loop ends before <code>next()</code> can check <code>modCount</code>. No exception, and "c" is never visited. Still a bug: use <code>removeIf</code>.`},
{lv:"I",q:`What is <code>t.size()</code>?<pre><code>Set&lt;String&gt; t = new TreeSet&lt;&gt;(Comparator.comparingInt(String::length));
t.add("cat"); t.add("dog"); t.add("bird");</code></pre>`,
 o:[`3`,`2`,`1`,`It throws <code>ClassCastException</code>`],
 a:1,e:`A TreeSet decides duplicates with the comparator, not <code>equals</code>. "dog" has the same length as "cat", so compare returns 0 and it is treated as a duplicate: the set is <code>[cat, bird]</code>.`},
{lv:"A",q:`What does this print?<pre><code>Map&lt;String, Integer&gt; lru = new LinkedHashMap&lt;&gt;(16, 0.75f, true);
lru.put("a", 1); lru.put("b", 2); lru.put("c", 3);
lru.get("a");
System.out.println(lru.keySet());</code></pre>`,
 o:[`<code>[a, b, c]</code>`,`<code>[b, c, a]</code>`,`<code>[c, b, a]</code>`,`<code>[a, c, b]</code>`],
 a:1,e:`The third constructor argument <code>true</code> means <b>access order</b>: every <code>get</code> moves the entry to the end. That is the basis of an LRU cache (add <code>removeEldestEntry</code>).`},
{lv:"A",q:`Does this compile?<pre><code>List&lt;? extends Number&gt; nums = new ArrayList&lt;Integer&gt;();
nums.add(1);</code></pre>`,
 o:[`Yes, 1 is a Number`,`Yes, but it throws <code>ArrayStoreException</code>`,`No: <code>incompatible types: int cannot be converted to CAP#1</code>`,`No: wildcards can't be used in variable declarations`],
 a:2,e:`<code>? extends Number</code> means "some unknown subtype of Number" (javac calls it <code>CAP#1</code>). It might be a list of Doubles, so adding an Integer can't be proved safe. Producer extends: read from it, don't write.`},
{lv:"A",q:`When does a HashMap bucket become a red-black tree?`,
 o:[`As soon as two keys collide`,`When it already has 8 nodes, a 9th arrives, and the table has at least 64 buckets (otherwise the table resizes)`,`When the load factor passes 0.75`,`Never; only <code>TreeMap</code> uses trees`],
 a:1,e:`<code>TREEIFY_THRESHOLD</code> = 8 and <code>MIN_TREEIFY_CAPACITY</code> = 64. With a smaller table, <code>treeifyBin</code> resizes instead, because spreading the keys usually shortens the chain. In JDK 25, 11 colliding keys in a new map give: resize to 32, resize to 64, then a tree.`},
{lv:"A",q:`What does this print?<pre><code>List&lt;String&gt; base = new ArrayList&lt;&gt;(List.of("x"));
List&lt;String&gt; v = Collections.unmodifiableList(base);
List&lt;String&gt; c = List.copyOf(base);
base.add("y");
System.out.println(v.size() + " " + c.size());</code></pre>`,
 o:[`<code>1 1</code>`,`<code>2 2</code>`,`<code>2 1</code>`,`It throws <code>UnsupportedOperationException</code>`],
 a:2,e:`<code>unmodifiableList</code> is a read-only <b>view</b>: it shows the change made through <code>base</code>. <code>List.copyOf</code> took an immutable <b>copy</b> before the change. Adding to <code>base</code> itself is allowed.`}
];
RC.l07={
 d1:[[`Name the four main collection interfaces and one class for each.`,`List: ArrayList. Set: HashSet. Queue/Deque: ArrayDeque (PriorityQueue). Map: HashMap.`],
     [`ArrayList vs LinkedList in one line each.`,`ArrayList: array, O(1) get, O(n) middle insert. LinkedList: nodes, O(1) at the ends, O(n) get.`],
     [`What does <code>map.put</code> return?`,`The previous value for that key, or <code>null</code> if there was none.`]],
 d3:[[`Describe <code>HashMap.put</code> in four steps.`,`hashCode → spread (h ^ h&gt;&gt;&gt;16) → index = hash &amp; (n−1) → walk the bucket with equals: replace or append; resize if size &gt; 0.75n.`],
     [`How do you build an LRU cache with the JDK?`,`<code>new LinkedHashMap&lt;&gt;(16, 0.75f, true)</code> + override <code>removeEldestEntry</code> to return <code>size() &gt; capacity</code>.`],
     [`Comparable vs Comparator?`,`compareTo inside the class (one natural order) vs compare outside (many orders, comparing/thenComparing/reversed).`]],
 d7:[[`Why does removing inside a for-each loop throw, and what do you write instead?`,`The iterator checks modCount against expectedModCount in next(). Use <code>iterator.remove()</code> or <code>removeIf</code>.`],
     [`When does a HashMap bin become a tree?`,`When a bin with 8 nodes gets a 9th and the table has ≥ 64 buckets; with fewer buckets it resizes instead.`],
     [`HashMap vs synchronizedMap vs ConcurrentHashMap?`,`Unsafe / one lock for everything / bucket-level locks, lock-free reads, atomic merge/compute, no nulls.`]]
};


/* Lesson 06, section "O(n)": Guess the Big-O (12). Each answer follows from counting iterations; see the explanations. */
QZ.cx=[
{lv:"B",q:`Time complexity?<pre><code>for (int i = 0; i &lt; n; i++)
    sum += a[i];</code></pre>`,o:[`O(1)`,`O(log n)`,`O(n)`,`O(n²)`],a:2,e:`The body runs n times and does O(1) work each time.`},
{lv:"B",q:`Time complexity?<pre><code>for (int i = 0; i &lt; n; i++)
    for (int j = 0; j &lt; n; j++)
        count++;</code></pre>`,o:[`O(n)`,`O(2n)`,`O(n²)`,`O(n log n)`],a:2,e:`Nested loops multiply: n × n = n² iterations.`},
{lv:"B",q:`Time complexity?<pre><code>for (int i = 1; i &lt; n; i *= 2)
    count++;</code></pre>`,o:[`O(n)`,`O(log n)`,`O(n/2)`,`O(√n)`],a:1,e:`i takes the values 1, 2, 4, 8 … so the loop runs about log₂ n times.`},
{lv:"I",q:`Time complexity?<pre><code>for (int i = 0; i &lt; n; i++)
    for (int j = 0; j &lt; i; j++)
        count++;</code></pre>`,o:[`O(n)`,`O(n log n)`,`O(n²)`,`O(n²/2), which is better than O(n²)`],a:2,e:`0 + 1 + … + (n − 1) = n(n − 1)/2 iterations. The ½ is a constant, so it is O(n²).`},
{lv:"I",q:`Time complexity?<pre><code>for (int i = 0; i &lt; n; i++)
    for (int d = 0; d &lt; 26; d++)
        count[d] += f(i, d);   // f is O(1)</code></pre>`,o:[`O(n²)`,`O(26n²)`,`O(n)`,`O(log n)`],a:2,e:`The inner loop always runs 26 times, a constant: 26n = O(n).`},
{lv:"I",q:`Time complexity? (<code>list</code> is an ArrayList of n values)<pre><code>for (int x : list)
    if (list.contains(x + 1))
        pairs++;</code></pre>`,o:[`O(n)`,`O(n log n)`,`O(n²)`,`O(1)`],a:2,e:`<code>contains</code> on an ArrayList is a hidden linear search, O(n), done n times: O(n²). A HashSet would make it O(n).`},
{lv:"I",q:`Time complexity? (a has length A, b has length B)<pre><code>for (int x : a) total += x;
for (int y : b) total += y;</code></pre>`,o:[`O(A · B)`,`O(A + B)`,`O(n²)`,`O(max(A, B)²)`],a:1,e:`Sequential loops add, and the inputs are different, so keep both letters: O(A + B).`},
{lv:"A",q:`Time complexity?<pre><code>for (int i = n; i &gt; 0; i /= 2)
    for (int j = 0; j &lt; i; j++)
        count++;</code></pre>`,o:[`O(n log n)`,`O(n)`,`O(log n)`,`O(n²)`],a:1,e:`The inner loop runs n, then n/2, n/4 … times: n + n/2 + n/4 + … &lt; 2n. A geometric series, so O(n), not O(n log n).`},
{lv:"A",q:`Time and space complexity?<pre><code>int f(int n) {
    if (n &lt;= 1) return 1;
    return f(n - 1) + f(n - 1);
}</code></pre>`,o:[`O(n) time, O(n) space`,`O(2ⁿ) time, O(2ⁿ) space`,`O(2ⁿ) time, O(n) space`,`O(n²) time, O(1) space`],a:2,e:`Each call makes two calls on n − 1: 1 + 2 + 4 + … + 2ⁿ⁻¹ ≈ 2ⁿ calls. Only one root-to-leaf path is on the stack at a time, so the space is the depth, O(n).`},
{lv:"A",q:`Time complexity?<pre><code>String s = "";
for (int i = 0; i &lt; n; i++)
    s += "x";</code></pre>`,o:[`O(n)`,`O(n log n)`,`O(n²)`,`O(1) per step, so O(n)`],a:2,e:`Strings are immutable: each <code>+=</code> copies the whole current string, 1 + 2 + … + n = O(n²) characters. StringBuilder makes it O(n).`},
{lv:"A",q:`Extra space of recursive binary search on n sorted values?`,o:[`O(1)`,`O(log n)`,`O(n)`,`O(n log n)`],a:1,e:`It creates no arrays, but each halving step is a stack frame: about log₂ n frames. The iterative version is O(1).`},
{lv:"A",q:`Time complexity?<pre><code>for (int i = 0; i * i &lt; n; i++)
    count++;</code></pre>`,o:[`O(n)`,`O(log n)`,`O(√n)`,`O(n²)`],a:2,e:`The loop stops when i² ≥ n, i.e. after about √n iterations (e.g. a prime check up to √n).`}
];

/* Lesson 06: "Check yourself" (3 per sort). Array states come from each sort's dry-run program, run on JDK 25. */
QZ.s_selection=[
{lv:"B",q:`What is <code>[64, 25, 12, 22, 11]</code> after the <b>first</b> pass of selection sort?`,o:[`<code>[25, 64, 12, 22, 11]</code>`,`<code>[11, 25, 12, 22, 64]</code>`,`<code>[11, 12, 22, 25, 64]</code>`,`<code>[25, 12, 22, 11, 64]</code>`],a:1,e:`The minimum of the whole array, 11, is swapped with a[0] = 64. Nothing else moves (SelectionDemo, pass 1).`},
{lv:"I",q:`At most how many swaps does selection sort make on n elements?`,o:[`n − 1`,`n(n − 1)/2`,`n²`,`log n`],a:0,e:`One swap per pass at most, and there are n − 1 passes. That is its one advantage: few writes.`},
{lv:"I",q:`Why is selection sort still O(n²) on an array that is already sorted?`,o:[`It swaps every pair`,`It must scan the whole unsorted part every pass to be sure it found the minimum`,`It uses recursion`,`It is not; it is O(n) on sorted input`],a:1,e:`Comparisons are always (n − 1) + (n − 2) + … + 1 = n(n − 1)/2; there is no early exit.`}];
QZ.s_insertion=[
{lv:"B",q:`Insertion sort on <code>[12, 11, 13, 5, 6]</code>: what is the array after inserting the 5?`,o:[`<code>[5, 12, 11, 13, 6]</code>`,`<code>[11, 12, 13, 5, 6]</code>`,`<code>[5, 11, 12, 13, 6]</code>`,`<code>[5, 6, 11, 12, 13]</code>`],a:2,e:`The prefix [11, 12, 13] is sorted; 13, 12 and 11 shift right and 5 drops into a[0] (InsertionDemo: "insert 5: shifted 3").`},
{lv:"I",q:`What is insertion sort's best case, and on which input?`,o:[`O(1), empty input`,`O(n), already sorted input`,`O(n log n), random input`,`O(n²), sorted input`],a:1,e:`Each key is compared once with its left neighbour and stays: n − 1 comparisons, no shifts.`},
{lv:"I",q:`Why does the loop test <code>a[j] &gt; key</code> and not <code>a[j] &gt;= key</code>?`,o:[`To avoid an exception`,`So equal values are not shifted past each other: the sort stays stable (and shifts less)`,`It makes it O(n log n)`,`There is no difference`],a:1,e:`With >= a key would jump over equal values, reversing their order.`}];
QZ.s_merge=[
{lv:"B",q:`Merging the sorted halves <code>[27, 38]</code> and <code>[3, 43]</code> gives?`,o:[`<code>[27, 38, 3, 43]</code>`,`<code>[3, 27, 38, 43]</code>`,`<code>[3, 43, 27, 38]</code>`,`<code>[27, 3, 38, 43]</code>`],a:1,e:`Two pointers always take the smaller head: 3, 27, 38, 43 (MergeDemo: "merge -> [3, 27, 38, 43]").`},
{lv:"I",q:`How much extra memory does merge sort on an array need?`,o:[`O(1)`,`O(log n) only`,`O(n)`,`O(n²)`],a:2,e:`The merge copies the range into a temporary array: O(n), plus O(log n) for the recursion.`},
{lv:"A",q:`Merge sort's recurrence and its result?`,o:[`T(n) = T(n − 1) + n → O(n²)`,`T(n) = 2T(n/2) + n → O(n log n) in every case`,`T(n) = T(n/2) + 1 → O(log n)`,`T(n) = 2T(n/2) + 1 → O(n)`],a:1,e:`Two halves plus a linear merge: log₂ n levels × n work per level, on every input.`}];
QZ.s_quick=[
{lv:"B",q:`Lomuto partition of <code>[10, 80, 30, 90, 40, 50, 70]</code> around the last element, 70, gives?`,o:[`<code>[10, 30, 40, 50, 70, 90, 80]</code>, 70 at index 4`,`<code>[10, 30, 40, 50, 70, 80, 90]</code>, 70 at index 4`,`<code>[70, 10, 80, 30, 90, 40, 50]</code>, 70 at index 0`,`<code>[10, 80, 30, 90, 40, 50, 70]</code>, 70 at index 6`],a:0,e:`Values smaller than 70 are swapped to the front in order; 70 then swaps into index 4, its final place (QuickDemo line 1).`},
{lv:"I",q:`When does quicksort take O(n²)?`,o:[`Never`,`When the pivot is always the smallest or largest value, e.g. sorted input with a last-element pivot`,`On random input`,`When n is odd`],a:1,e:`Each partition then removes only the pivot: n + (n − 1) + … = O(n²). A random pivot avoids it.`},
{lv:"A",q:`What is the average time of Quickselect (k-th smallest)?`,o:[`O(n)`,`O(n log n)`,`O(log n)`,`O(n²)`],a:0,e:`It keeps only the side holding k: n + n/2 + n/4 + … ≈ 2n.`}];
QZ.s_heap=[
{lv:"B",q:`In a binary heap stored in an array from index 0, where are the children of index i?`,o:[`2i and 2i + 1`,`2i + 1 and 2i + 2`,`i + 1 and i + 2`,`i / 2`],a:1,e:`0-based: left = 2i + 1, right = 2i + 2, parent = (i − 1) / 2.`},
{lv:"I",q:`Building a max-heap from <code>[4, 10, 3, 5, 1]</code> (bottom-up sift-down) gives?`,o:[`<code>[10, 4, 3, 5, 1]</code>`,`<code>[10, 5, 3, 4, 1]</code>`,`<code>[1, 3, 4, 5, 10]</code>`,`<code>[10, 5, 4, 3, 1]</code>`],a:1,e:`siftDown(1): 10 is bigger than 5 and 1, stays. siftDown(0): 4 swaps with 10, then with 5 (HeapDemo: "max-heap: [10, 5, 3, 4, 1]").`},
{lv:"A",q:`Best way to find the k-th largest of n values with a heap?`,o:[`Sort, then index`,`A min-heap of size k: push each value, poll when size > k; the root is the answer, O(n log k)`,`A max-heap of all n values, poll k times`,`Heaps can't do it`],a:1,e:`The size-k min-heap holds the k largest seen so far; its smallest is the k-th largest (HeapDemo: 4th largest = 4).`}];
QZ.s_counting=[
{lv:"B",q:`Time of counting sort for n values in the range 0 … k?`,o:[`O(n log n)`,`O(n + k)`,`O(n · k)`,`O(k²)`],a:1,e:`One pass to count, one pass over the k counters, one pass to write: no comparisons at all.`},
{lv:"I",q:`For <code>[4, 2, 2, 8, 3, 3, 1]</code>, what are <code>count[2]</code> and <code>count[3]</code>?`,o:[`1 and 1`,`2 and 2`,`2 and 3`,`3 and 5`],a:1,e:`The value 2 appears twice and 3 twice (CountingDemo: count [0, 1, 2, 2, 1, 0, 0, 0, 1]).`},
{lv:"I",q:`When is counting sort a bad idea?`,o:[`When values are letters`,`When the range is huge, e.g. values up to 10⁹`,`When there are duplicates`,`When n is large`],a:1,e:`The count array would need 10⁹ slots. Use radix sort, a HashMap or a comparison sort.`}];
QZ.s_radix=[
{lv:"B",q:`<code>[170, 45, 75, 90, 802, 24, 2, 66]</code> after the <b>ones-digit</b> pass?`,o:[`<code>[2, 24, 45, 66, 75, 90, 170, 802]</code>`,`<code>[170, 90, 802, 2, 24, 45, 75, 66]</code>`,`<code>[802, 2, 24, 45, 66, 170, 75, 90]</code>`,`<code>[170, 45, 75, 90, 802, 24, 2, 66]</code>`],a:1,e:`Grouped by last digit 0, 0, 2, 2, 4, 5, 5, 6, keeping input order inside each group (RadixDemo line 1).`},
{lv:"I",q:`Why must each digit pass be stable?`,o:[`To save memory`,`To keep the order created by the earlier digits among values with the same current digit`,`To avoid negative numbers`,`It doesn't need to be`],a:1,e:`Otherwise the work of the earlier passes is scrambled.`},
{lv:"I",q:`Radix sort's time for d digits in base b?`,o:[`O(n log n)`,`O(d · (n + b))`,`O(n²)`,`O(b^d)`],a:1,e:`d passes of a counting sort over n values and b buckets.`}];
QZ.s_bucket=[
{lv:"B",q:`10 buckets over 0 … 99 (bucket = x · 10 / 100): where does 72 go?`,o:[`bucket 2`,`bucket 7`,`bucket 72`,`bucket 9`],a:1,e:`72 · 10 / 100 = 7.2 → 7 (BucketDemo: bucket 7 holds [78, 72]).`},
{lv:"I",q:`Bucket sort's worst case?`,o:[`O(n)`,`O(n log n)`,`All values land in one bucket: the inner sort's cost, O(n²) with insertion sort`,`O(1)`],a:2,e:`Linear time needs evenly spread values.`},
{lv:"I",q:`Top K Frequent Elements in O(n) uses buckets indexed by what?`,o:[`The value`,`The frequency`,`The index`,`The hash code`],a:1,e:`Frequencies are between 1 and n, so bucket[f] lists values seen f times; read from the top.`}];
QZ.s_cyclic=[
{lv:"B",q:`Values are exactly 1 … n. Where does value v belong?`,o:[`index v`,`index v − 1`,`index n − v`,`anywhere`],a:1,e:`So each value can be swapped straight home.`},
{lv:"I",q:`After cyclic sort of <code>[4, 3, 2, 7, 8, 2, 3, 1]</code>, which numbers are missing?`,o:[`2 and 3`,`5 and 6`,`7 and 8`,`none`],a:1,e:`Slots 4 and 5 hold 3 and 2 instead of 5 and 6 (CyclicDemo: duplicates [3, 2], missing [5, 6]).`},
{lv:"I",q:`Why compare <code>a[i]</code> with <code>a[a[i] − 1]</code> instead of <code>a[i]</code> with <code>i + 1</code>?`,o:[`It is faster`,`With duplicates, a[i] ≠ i + 1 forever and the loop never ends`,`To sort descending`,`No reason`],a:1,e:`If the target already holds the same value, the current value is a duplicate: move on.`}];
QZ.s_dnf=[
{lv:"B",q:`Sort Colors on <code>[2, 0, 2, 1, 1, 0]</code> gives?`,o:[`<code>[0, 0, 1, 1, 2, 2]</code>`,`<code>[2, 2, 1, 1, 0, 0]</code>`,`<code>[0, 1, 2, 0, 1, 2]</code>`,`<code>[0, 0, 2, 1, 1, 2]</code>`],a:0,e:`One pass with lo, mid, hi (DnfDemo's last line).`},
{lv:"I",q:`After swapping a 2 from mid with hi, which pointers move?`,o:[`mid++ and hi--`,`only hi--`,`only mid++`,`lo++ and mid++`],a:1,e:`The value that came from hi into mid has not been checked yet, so mid must stay.`},
{lv:"I",q:`Time and space of the Dutch National Flag algorithm?`,o:[`O(n log n), O(1)`,`O(n), O(1), one pass`,`O(n), O(n)`,`O(n²), O(1)`],a:1,e:`Each step moves mid forward or hi backward.`}];

/* SQL 00 (foundations) quiz and recall prompts. Every result was produced by the course database (assets/data/sql-seed.js) in SQLite 3.49. */
QZ.s00=[
{lv:"B",q:"Which clause decides <b>which table</b> a query reads?",o:["<code>SELECT</code>","<code>FROM</code>","<code>WHERE</code>","<code>ORDER BY</code>"],a:1,e:"<code>FROM</code> names the drawer; <code>SELECT</code> only picks the labels (columns) to read from it."},
{lv:"B",q:"What does <code>SELECT 7 / 2;</code> return in SQLite and PostgreSQL?",o:["3.5","3","4","an error"],a:1,e:"Two integers divide as integers, exactly like Java: 3. Write <code>7 / 2.0</code> for 3.5. (MySQL is the odd one out: it returns 3.5000.)"},
{lv:"B",q:"How many rows does <code>SELECT name FROM customers WHERE city = NULL;</code> return? (Customer 10 has a NULL city.)",o:["1","0","10","an error"],a:1,e:"None. <code>= NULL</code> is never true because comparing with an unknown value is unknown, and WHERE keeps only true. <code>WHERE city IS NULL</code> returns Rahul."},
{lv:"B",q:"<code>services</code> has 8 rows and two of them have a NULL <code>cost</code>. What do <code>COUNT(*)</code> and <code>COUNT(cost)</code> return?",o:["8 and 8","8 and 6","6 and 6","8 and 2"],a:1,e:"<code>COUNT(*)</code> counts rows (8); <code>COUNT(cost)</code> counts non-NULL costs (6)."},
{lv:"B",q:"Which of these is the <b>primary key</b> of <code>sales</code>?",o:["<code>car_id</code>","<code>customer_id</code>","<code>id</code>","<code>sold_on</code>"],a:2,e:"<code>id</code> identifies the sale. <code>car_id</code>, <code>customer_id</code> and <code>employee_id</code> are foreign keys pointing at other tables' primary keys."},
{lv:"I",q:"Which clause runs <b>first</b> when the engine executes a query?",o:["<code>SELECT</code>","<code>WHERE</code>","<code>FROM</code>","<code>ORDER BY</code>"],a:2,e:"FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. SELECT is written first and executed fifth."},
{lv:"I",q:"Why does this fail?<pre><code>SELECT brand, COUNT(*) AS models\nFROM cars\nWHERE models &gt;= 2\nGROUP BY brand;</code></pre>",o:["<code>COUNT</code> needs <code>DISTINCT</code>","<code>WHERE</code> runs before <code>SELECT</code>, so the alias <code>models</code> does not exist yet","<code>GROUP BY</code> must come before <code>WHERE</code>","Aliases need double quotes"],a:1,e:"WHERE runs before GROUP BY and SELECT: nothing is counted and no alias exists. Use <code>HAVING COUNT(*) &gt;= 2</code> after GROUP BY."},
{lv:"I",q:"<code>WHERE</code> vs <code>HAVING</code>: which statement is correct?",o:["They are interchangeable","<code>WHERE</code> filters rows before grouping; <code>HAVING</code> filters groups after it","<code>HAVING</code> is faster","<code>WHERE</code> can use aggregates, <code>HAVING</code> cannot"],a:1,e:"WHERE sees individual rows and cannot use aggregates; HAVING sees groups and can. Prefer WHERE when no aggregate is needed: it removes rows earlier."},
{lv:"I",q:"<code>SELECT name FROM customers ORDER BY joined_on LIMIT 3 OFFSET 2;</code> returns which names?",o:["Asha, Ravi, Meera","Meera, Kiran, Divya","Ravi, Meera, Kiran","Kiran, Divya, Arjun"],a:1,e:"Sorted by join date the list is Asha, Ravi, Meera, Kiran, Divya…; OFFSET 2 skips the first two and LIMIT 3 takes the next three."},
{lv:"A",q:"What happens?<pre><code>INSERT INTO cars VALUES (1, 'Maruti', 'Dzire', 2024, 700000, 'white', 1);</code></pre>(car 1 already exists)",o:["The old row is replaced","A second row with id 1 is added","The statement is refused: UNIQUE constraint failed on <code>cars.id</code>","Only the model name is updated"],a:2,e:"A primary key must be unique. The whole statement is rejected and nothing changes. (Upserts that replace are Lesson S09.)"},
{lv:"A",q:"With foreign keys enforced, what does <code>INSERT INTO sales VALUES (16, 99, 1, 4, '2024-09-01', 100);</code> do? (There is no car 99.)",o:["Inserts the sale with a dangling reference","Creates car 99 automatically","Is refused: FOREIGN KEY constraint failed","Inserts it with car_id set to NULL"],a:2,e:"A foreign key must point at an existing row. SQLite enforces this only after <code>PRAGMA foreign_keys = ON</code>; PostgreSQL and MySQL/InnoDB always do."},
{lv:"A",q:"A query without <code>ORDER BY</code> returned rows in id order yesterday. Is that guaranteed tomorrow?",o:["Yes, tables keep insertion order","Yes, if the table has a primary key","No: without ORDER BY the order is whatever the plan produced, and it can change","Only in PostgreSQL"],a:2,e:"Row order is undefined without ORDER BY. A new index, more data or a different plan can change it. Always sort explicitly, by something unique for pagination."}];
RC.s00={d1:[["Table, row, column, primary key: the four cabinet words?","Drawer, folder, label, folder number."],["The logical order of a query?","FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT."],["How do you test for a missing value?","IS NULL, never = NULL."]],
 d3:[["Why can ORDER BY use a SELECT alias but WHERE cannot?","ORDER BY runs after SELECT; WHERE runs before it."],["COUNT(*) vs COUNT(col)?","Rows vs non-NULL values of col."],["What is a foreign key, in one sentence?","A column holding another row's primary key, enforced by the database."]],
 d7:[["WHERE vs HAVING?","Rows before grouping vs groups after; only HAVING can use aggregates."],["What does the database do with a statement that violates a key?","Refuses the whole statement; nothing is half-written."],["Is row order without ORDER BY guaranteed?","No. Only ORDER BY guarantees it."]]};
