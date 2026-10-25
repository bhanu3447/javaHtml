# Lesson 00 — Java, the JDK and the two kinds of types

Page: `java/lessons/00-foundations.html` (`body data-page="l00"`, band `.band#fnd`, section ids `fn-*`). No labs file: the page loads `course-index, quiz-data, course, effects, run-java` only; the example cards (`pre[data-ex]`) are built by `course.js`. Quiz `QZ.l00` (8, B/I) and recall prompts `RC.l00` in `quiz-data.js`. Figures are plain HTML/CSS (block `/* lesson 00 figures v43 */`, prefix `l0-`): `fig-l0pipe` (compile pipeline), `fig-l0kit` (JDK ⊃ JRE ⊃ JVM rings), `fig-l0mem` (stack / heap / Metaspace), `fig-l0box` (value vs reference). Both programs and all card snippets were run on JDK 25.0.4.1 (`Hello.java`, `Types.java`, `Ex0.java`, `bad/Bad.java` for the compiler messages).

Scope (user, 2026-10-25: "what is java, jdk, jre, jvm, primitive, non primitive and all, where will you add"; then "build this simple, not more complex"): placed **before** Lesson 01 as Lesson 00 (learning-order rule in `CLAUDE.md`), kept deliberately short: 6 sections, 4 pictures, 2 programs, 9 example cards, 5 interview cards, quiz. Operators, control flow, methods and arrays are not here; they come when a lesson needs them.

## 1. What is Java?

A language and a platform: `.java` text → `javac` → `.class` bytecode (the same on every OS) → the JVM runs it ("write once, run anywhere"). Figure `fig-l0pipe`. Card: `javac Hello.java` / `java Hello` / `java Hello.java` (11+, one step). Note: every program is a `public class` named like the file with a `main` method; "class" itself is Lesson 02.

```java
// Hello.java
public class Hello {

    public static void main(String[] args) {
        System.out.println("Hello, Java");                          // Hello, Java
        System.out.println(System.getProperty("java.version"));     // 25.0.4.1     (this PC's JDK)
        System.out.println(System.getProperty("os.name"));          // Windows 11   (whatever this PC runs)
        System.out.println(args.length);                            // 0            (no words after "java Hello")
    }
}
```

## 2. JDK, JRE and JVM

JVM runs bytecode; JRE = JVM + class library (enough to run); JDK = JRE + tools (`javac`, `jshell`, `jar`, `javadoc`, debugger). Figure `fig-l0kit` (nested rings). Table "You want to… / You need / Why" (write → JDK; run a jar → JRE inside the JDK; run on a new machine → that OS's JVM). Since Java 11 there is no separate JRE download. Card: `java -version` / `javac -version` (on this PC: `openjdk version "25.0.4.1"`, `javac 25.0.4.1`). Analogy strip: car = engine (JVM) + body (JRE library); the factory (you) needs the tools too (JDK).

## 3. What the JVM does while your program runs

Loads the class, finds `main`, runs it; three areas (figure `fig-l0mem`): **Stack** (one per thread, a frame per running method with its variables, thrown away on return), **Heap** (one per program, every object, garbage collector removes unreferenced ones), **Metaspace** (one per program, loaded classes: bytecode and method tables). Card "Two kinds of error": `int x = "5";` → compile error `incompatible types: String cannot be converted to int` (no .class written); `int[] a = new int[2]; a[5] = 1;` → `ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 2` (the JVM stops the program).

## 4. Primitive vs reference types

A primitive variable holds the value itself (exactly eight); a reference variable holds the address of a heap object (String, arrays, anything made with `new`; everything that is not one of the eight). Figure `fig-l0box` (value in the box vs plate on the box). Table of the eight: byte 8 bit -128…127 default 0; short 16 bit ±32,767; int 32 bit about ±2.1 billion (the usual one); long 64 bit about ±9.2 quintillion, default 0L; float 32 bit ~7 digits 0.0f; double 64 bit ~15 digits (the usual one); char 16 bit 0…65,535 default '\u0000'; boolean true/false default false; reference: default `null`.

```java
// Types.java
public class Types {

    public static void main(String[] args) {
        // Primitives: the variable holds the value itself
        int count = 42;
        double price = 7.5;
        char grade = 'A';
        boolean open = true;
        long big = 3_000_000_000L;                // too big for int, so long with an L
        System.out.println(count + " " + price + " " + grade + " " + open + " " + big);   // 42 7.5 A true 3000000000

        // Copying a primitive copies the value
        int a = 10;
        int b = a;
        b = b + 1;
        System.out.println(a + " " + b);          // 10 11   (a did not change)

        // Reference types: the variable holds the address of an object
        int[] nums = {1, 2, 3};
        int[] same = nums;                        // copies the address, not the array
        same[0] = 99;
        System.out.println(nums[0]);              // 99      (one array, two names)

        String s = "Java";
        String t = s;
        System.out.println(s == t);               // true    (same object)

        // Defaults: a new array starts at 0 / false / null; a local variable has no default
        int[] counts = new int[3];
        boolean[] flags = new boolean[1];
        String[] names = new String[2];
        System.out.println(counts[0] + " " + flags[0] + " " + names[0]);   // 0 false null
    }
}
```

Example cards (all run on JDK 25):

```java
// Integer division
System.out.println(7 / 2);     // 3
System.out.println(7 / 2.0);   // 3.5
System.out.println(7 % 2);     // 1
// Overflow
System.out.println(Integer.MAX_VALUE);        // 2147483647
System.out.println(Integer.MAX_VALUE + 1);    // -2147483648
System.out.println(Integer.MAX_VALUE + 1L);   // 2147483648
// A char is a number
System.out.println('A' + 1);            // 66
System.out.println((char) ('A' + 1));   // B
System.out.println((int) 'a');          // 97
// null is only for references
String s = null;   int[] a = null;      // fine
int n = null;                           // compile error: incompatible types: <null> cannot be converted to int
// Wrapper classes
Integer boxed = 5; int plain = boxed; List<Integer> list = List.of(1, 2);
System.out.println(boxed + plain + list.size());   // 12
// Limits worth knowing
System.out.println(Byte.MAX_VALUE);             // 127
System.out.println(Short.MAX_VALUE);            // 32767
System.out.println((int) Character.MAX_VALUE);  // 65535
System.out.println(Long.MAX_VALUE);             // 9223372036854775807
System.out.println(0.1 + 0.2);                  // 0.30000000000000004
```

Analogy strip: a primitive is a number written on the box; a reference is a number plate saying where the car is parked. Strings (Lesson 01) and objects (Lesson 02) are always the second kind.

## 5. 5 interview questions

1. JDK vs JRE vs JVM — JVM runs bytecode; JRE = JVM + library; JDK = JRE + tools; developers install the JDK.
2. Why platform independent — javac makes bytecode, not machine code; only the JVM is built per OS.
3. How many primitives — eight: byte short int long, float double, char, boolean; everything else is a reference.
4. Primitive vs reference variable — value itself vs address of an object; copying copies value vs address; only references can be null.
5. Where things live — local variables in stack frames, objects on the heap (GC), classes in Metaspace.

## 6. Review

Takeaways: (1) javac → bytecode → JVM on any OS; (2) JDK ⊃ JRE ⊃ JVM, install the JDK; (3) stack = variables, heap = objects, Metaspace = classes; (4) eight primitives hold values, every other type is a reference that may be null; (5) copying a primitive copies the value, copying a reference copies the address.

Quiz `QZ.l00` (8 questions, B/I), recall prompts `RC.l00` (day 1 / 3 / 7), feedback stars + comment box.
