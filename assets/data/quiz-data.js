/* Quiz data (QZ: lesson → MCQs) and recall prompts (RC: lesson → prompts per review day).
   Part of the course scripts. Every page loads, in this order: course-index.js, quiz-data.js, course.js, effects.js,
   then the labs of each course and run-java.js. They are classic scripts, so
   top-level const/let/function names are shared between them (course.js defines $, $$, esc, store, hl, FX, THM…). */
"use strict";
/* learning layer: quiz data (QZ: lesson → MCQs {lv,q,o,a,e}; RC: lesson → recall prompts per review day).
   Java quizzes come back lesson by lesson as the course is rebuilt (QZ.l01, RC.l01, …); the v1 set is in archive/java-v1. */
const QZ={},RC={};
/* @quiz-data */

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

/* Lesson 01 (What is a String? where it lives, the String Constant Pool). Every output was checked on JDK 25. */
QZ.l01=[
{lv:"B",q:`Which statement about <code>String</code> is true?`,
 o:[`It is a primitive type, like <code>char</code>`,`It is an object of the <code>final</code> class <code>java.lang.String</code>, and its characters can't change`,`It is a mutable object; methods such as <code>toUpperCase()</code> change it in place`,`It must be imported before use`],
 a:1,e:`A String is an object, its class is <code>final</code>, and it is immutable. <code>java.lang</code> is imported automatically. Methods such as <code>toUpperCase()</code> return a <b>new</b> String; they never change the original.`},
{lv:"B",q:`<code>String s = "car";</code> Where do the variable and the characters live?`,
 o:[`Both on the stack`,`Both inside the String pool`,`<code>s</code> on the stack holds a reference; the String object and its <code>byte[]</code> are on the heap, and the pool points to that object`,`<code>s</code> on the heap, the characters in Metaspace`],
 a:2,e:`A local variable is a slot in the method's stack frame. It holds only a <b>reference</b>. Every String object lives on the heap. Since Java 7 the pool is a table in the heap that points to the pooled objects.`},
{lv:"B",q:`What does this print?<pre><code>String s = "java";
s.toUpperCase();
System.out.println(s);</code></pre>`,
 o:[`<code>JAVA</code>`,`<code>Java</code>`,`It doesn't compile`,`<code>java</code>`],
 a:3,e:`<code>toUpperCase()</code> returns a new String, and the result is thrown away. <code>s</code> still points to <code>"java"</code>. Write <code>s = s.toUpperCase();</code> to keep it.`},
{lv:"I",q:`What does this print?<pre><code>String a = "hi", b = "h" + "i", c = new String("hi");
String h = "h";
String d = h + "i";
System.out.println((a == b) + " " + (a == c) + " " + (a == d) + " " + (a == d.intern()));</code></pre>`,
 o:[`<code>true false false true</code>`,`<code>true false true true</code>`,`<code>false false false true</code>`,`<code>true true false false</code>`],
 a:0,e:`<code>"h" + "i"</code> is folded by javac into the literal <code>"hi"</code>, so it is the pooled object. <code>new</code> always makes a heap object. <code>h + "i"</code> uses a variable that is not <code>final</code>, so it is built at run time: a new object. <code>intern()</code> returns the pooled one.`},
{lv:"I",q:`How many String objects does <code>String s = new String("swift");</code> create, if <code>"swift"</code> was not in the pool before?`,
 o:[`One: the heap object`,`Two: the pooled <code>"swift"</code> and a separate heap object`,`Three: literal, heap object and a copy of the <code>byte[]</code>`,`None, it reuses the pool`],
 a:1,e:`The literal is resolved first (<code>ldc</code>) and pooled. Then <code>new</code> allocates a second String on the heap. The two objects <b>share</b> one <code>byte[]</code>, which is not a String object.`},
{lv:"I",q:`A request handler checks a header that may be missing (<code>null</code>). Which check never throws?`,
 o:[`<code>role.equals("admin")</code>`,`<code>role == "admin"</code>`,`<code>"admin".equals(role)</code>`,`<code>role.equalsIgnoreCase("admin")</code>`],
 a:2,e:`Calling a method on the literal is null-safe: <code>"admin".equals(null)</code> is simply <code>false</code>. Options 1 and 4 throw <code>NullPointerException</code> when <code>role</code> is null. <code>==</code> doesn't throw, but it compares references and is wrong for content.`},
{lv:"I",q:`Since Java 7, what does <code>s.intern()</code> do when the pool does <b>not</b> contain the text of <code>s</code>?`,
 o:[`Copies <code>s</code> into PermGen and returns the copy`,`Stores a reference to <code>s</code> itself in the pool and returns <code>s</code>`,`Throws <code>IllegalStateException</code>`,`Returns <code>null</code>`],
 a:1,e:`Java 6 copied the String into PermGen. Since Java 7 the pool lives in the heap and simply records a reference to the existing object, so <code>s.intern() == s</code> is <code>true</code> for the first object interned with that text.`},
{lv:"A",q:`What does this print?<pre><code>String built = new StringBuilder("ja").append("va").toString();
System.out.println(built.intern() == built);</code></pre>`,
 o:[`<code>true</code>, the first interned object becomes the pooled one`,`<code>false</code>, because <code>"java"</code> is already in the pool when the program starts`,`It doesn't compile`,`<code>true</code> only on Java 6`],
 a:1,e:`The JDK itself uses the literal <code>"java"</code> (for example in <code>java.lang</code> package names), so it is pooled before <code>main</code> runs. <code>intern()</code> returns <b>that</b> object, not <code>built</code>. With a unique text the answer would be <code>true</code>.`},
{lv:"A",q:`Which of these is <b>not</b> a reason String is immutable?`,
 o:[`Pooled Strings can be shared safely`,`The <code>hashCode</code> can be computed once and cached`,`Strings are automatically thread-safe`,`It makes <code>+</code> in a loop fast`],
 a:3,e:`Immutability is what makes <code>+</code> in a loop <b>slow</b>: every step copies the whole text into a new object. Sharing in the pool, cached hashes, thread safety and security are the real reasons.`},
{lv:"A",q:`<code>String a = "x"; String b = a + "y";</code> on JDK 9 or later. How many String objects, if nothing was pooled before?`,
 o:[`1`,`2: pooled <code>"x"</code> and <code>"xy"</code> on the heap`,`3: <code>"x"</code>, <code>"y"</code> and <code>"xy"</code>`,`4`],
 a:1,e:`<code>"x"</code> is pooled. <code>a + "y"</code> is a run-time concatenation (<code>a</code> is not <code>final</code>), so <code>"xy"</code> is a new heap object that is not pooled. Since Java 9 the constant part <code>"y"</code> lives inside the invokedynamic recipe, not as a pooled String; before Java 9 it was pooled, making 3.`}
];
RC.l01={
 d1:[[`What is a String in Java?`,`An immutable object of the <code>final</code> class <code>java.lang.String</code>: a sequence of characters stored in a <code>byte[]</code>, with a cached hash.`],
     [`Where do a String variable, the String object and the pool live?`,`The variable is a reference on the stack; the object and its <code>byte[]</code> are on the heap; the pool is a heap table (since Java 7) pointing at the pooled objects.`],
     [`What does <code>==</code> compare for Strings, and what does <code>equals</code> compare?`,`<code>==</code> compares references (same object?); <code>equals</code> compares the characters.`]],
 d3:[[`Why does <code>"hel" + "lo" == "hello"</code> print true but <code>part + "lo" == "hello"</code> print false?`,`The first is a compile-time constant that javac folds into the pooled literal. The second is built at run time, a new heap object. A <code>final</code> variable makes it a constant again.`],
     [`Why does <code>s.toUpperCase();</code> on its own change nothing?`,`String methods return a new String; the original can't change. Reassign: <code>s = s.toUpperCase();</code>.`],
     [`What changed about <code>intern()</code> in Java 7?`,`The pool moved from PermGen to the heap, so <code>intern()</code> stores a reference to the existing object instead of copying it, and pooled Strings can be garbage-collected.`]],
 d7:[[`Explain to an interviewer why String is immutable.`,`Safe sharing in the pool, a hash that can be cached (safe map keys), thread safety without locks, and security (paths, class names, URLs can't change after checks).`],
     [`How many objects does <code>new String("a") + new String("b")</code> create, and where?`,`Five: <code>"a"</code> and <code>"b"</code> pooled, two heap copies made by <code>new</code>, and <code>"ab"</code> on the heap (not pooled).`],
     [`A service compares a user-supplied value with a constant. Write the safe check and say why.`,`<code>"CONST".equals(value)</code> (or <code>Objects.equals</code>): content-based and null-safe, unlike <code>==</code> and unlike <code>value.equals(...)</code> on a null.`]]
};

/* Lesson 02 (What is a Class and an Object?). Every output was checked on JDK 25. */
QZ.l02=[
{lv:"B",q:`Which statement is true?`,
 o:[`A class is an object that lives on the heap`,`A class is a blueprint (a type); an object is one instance built from it with <code>new</code>`,`An object and a class are the same thing`,`Every class can have only one object`],
 a:1,e:`The class describes fields and methods once; <code>new</code> builds as many objects from it as you like, each with its own field values.`},
{lv:"B",q:`What does this print?<pre><code>Car a = new Car("Swift", "red");
Car b = new Car("Nexon", "blue");
a.accelerate(40);
System.out.println(b.speed);</code></pre>`,
 o:[`40`,`0`,`null`,`A compile error`],
 a:1,e:`Each object has its <b>own</b> copy of the instance fields. Only <code>a</code>'s speed changed; <code>b.speed</code> is still its default, 0.`},
{lv:"B",q:`<code>Car c = a;</code> How many Car objects are there now (if <code>a</code> already pointed to one)?`,
 o:[`One: <code>c</code> is a second reference to the same car`,`Two: <code>c</code> is a copy of the car`,`Zero: <code>a</code> loses its car`,`It depends on <code>equals</code>`],
 a:0,e:`Assigning a reference copies the <b>arrow</b>, not the object. <code>a == c</code> is true, and a change through <code>c</code> is visible through <code>a</code>.`},
{lv:"B",q:`What is the default value of a <code>String</code> field and an <code>int</code> field in a new object?`,
 o:[`<code>""</code> and <code>0</code>`,`<code>null</code> and <code>0</code>`,`<code>null</code> and <code>null</code>`,`They have no value: reading them is a compile error`],
 a:1,e:`Fields start at defaults: references <code>null</code>, numbers 0, <code>boolean</code> false. Only <b>local</b> variables have no default.`},
{lv:"I",q:`What does this print?<pre><code>class Bike {
    String model;
    Bike(String model) { model = model; }
}
System.out.println(new Bike("Duke").model);</code></pre>`,
 o:[`Duke`,`null`,`model`,`A compile error`],
 a:1,e:`Inside the constructor, <code>model</code> means the parameter, so <code>model = model</code> assigns it to itself. The field stays <code>null</code>. Write <code>this.model = model;</code>.`},
{lv:"I",q:`A class declares only <code>Car(String model)</code>. What does <code>new Car()</code> do?`,
 o:[`Creates a Car with <code>model = null</code>`,`Fails to compile: the default constructor is added only when a class declares none`,`Throws a NullPointerException`,`Creates a Car with <code>model = ""</code>`],
 a:1,e:`javac: <i>constructor Car in class Car cannot be applied to given types</i>. Write <code>Car()</code> yourself, ideally as <code>this("Unknown")</code>.`},
{lv:"I",q:`What does this print?<pre><code>static void tune(Car car) {
    car.speed = 100;
    car = new Car("Spare");
}
Car c = new Car("Swift");
tune(c);
System.out.println(c.model + " " + c.speed);</code></pre>`,
 o:[`Spare 100`,`Swift 0`,`Swift 100`,`Spare 0`],
 a:2,e:`The method gets a <b>copy of the reference</b>. Following it changes the caller's car (speed 100); re-pointing the copy to a new car does nothing to <code>c</code>.`},
{lv:"I",q:`<code>static int built;</code> is incremented in the constructor. After three <code>new Car(…)</code>, what is <code>Car.built</code>?`,
 o:[`1 in every car`,`3, one shared copy for the whole class`,`0, static fields can't change`,`A compile error: static fields can't be used in constructors`],
 a:1,e:`A static field belongs to the class: one copy shared by all objects. Each constructor call adds 1 to the same counter.`},
{lv:"A",q:`A class <code>Car</code> overrides neither <code>toString</code> nor <code>equals</code>. With <code>a</code> and <code>b</code> built from the same arguments, which is true?`,
 o:[`<code>println(a)</code> shows the field values, and <code>a.equals(b)</code> is true`,`<code>println(a)</code> shows <code>Car@</code> plus a hex hash, and <code>a.equals(b)</code> is false`,`Both lines fail to compile`,`<code>a.equals(b)</code> is true because the fields match`],
 a:1,e:`Without overrides you get <code>Object</code>'s versions: <code>toString</code> = class name @ hash in hex, <code>equals</code> = <code>==</code> (same object?).`},
{lv:"A",q:`Why does this fail to compile?<pre><code>class Car {
    int speed;
    public static void main(String[] args) {
        speed = 10;
    }
}</code></pre>`,
 o:[`<code>speed</code> is not initialised`,`<code>main</code> must not be inside a class`,`<code>main</code> is static: there is no object, so no <code>speed</code> to set (non-static variable cannot be referenced from a static context)`,`<code>int</code> fields must be <code>final</code>`],
 a:2,e:`A static method has no <code>this</code>. Create an object first: <code>Car c = new Car(); c.speed = 10;</code>.`}
];
RC.l02={
 d1:[[`Class vs object in one sentence each?`,`A class is a blueprint (fields + methods, a type); an object is one instance of it, built with <code>new</code>, living on the heap with its own field values.`],
     [`What three things does <code>new Car("Swift")</code> do?`,`Allocate on the heap with default values, run the constructor (<code>this</code> = the new object), return the reference.`],
     [`What does <code>Car c = a;</code> copy?`,`The reference. Still one car, two names.`]],
 d3:[[`Why does <code>model = model;</code> in a constructor leave the field null, and what is the fix?`,`The parameter shadows the field, so it assigns the parameter to itself. <code>this.model = model;</code>.`],
     [`When does the compiler add a default constructor?`,`Only when the class declares no constructor at all.`],
     [`Default values of fields vs local variables?`,`Fields: 0 / 0.0 / false / character 0 / null. Locals: none; reading an unassigned local is a compile error.`]],
 d7:[[`Explain static vs instance to an interviewer.`,`Instance members belong to each object (one copy each, need an object, have <code>this</code>). Static members belong to the class (one shared copy, used via the class name, no <code>this</code>).`],
     [`Where do the object, its reference and its class live?`,`Object on the heap; a local reference in the stack frame; class metadata and method code in Metaspace, loaded once.`],
     [`What do <code>Object</code>'s <code>toString</code> and <code>equals</code> do, and what must you override with <code>equals</code>?`,`<code>ClassName@hexHash</code> and <code>==</code>. Override <code>hashCode</code> together with <code>equals</code>.`]]
};
