/* Foundations labs (v35, Lesson 00): the lesson is taught by these visuals, the text around them is short.
   Part of the course scripts. Every page loads, in this order: course-index.js, quiz-data.js, course.js, effects.js,
   labs-oop.js, labs-collections.js, labs-analogy.js, labs-sorting.js, labs-foundations.js, practice-tools.js. They are
   classic scripts, so top-level names are shared (course.js defines $, $$, esc, store, hl…). Classes are prefixed fd-.
   Hosts (.viz.ol.fd on lessons/00-foundations.html): #fdPipe (F1 javac → bytecode → every OS → inside the JVM),
   #fdKit (F1 JDK ⊃ JRE ⊃ JVM), #fdTypes (F2 the 8 primitives as bit bars + "which type would you pick"),
   #fdCast (F3 a value going through widening / narrowing / overflow / integer division), #fdFlow (F4 a switch as a
   ladder a ball falls through: break toggles, arrow form), #fdOverload (F5 overload resolution in 3 phases).
   Every result shown was run on JDK 25 (scratch program Verify.java). Keys: ← → Space via data-s (course.js learn layer). */
"use strict";
(function(){
  if(!$("#fdPipe,#fdKit,#fdTypes,#fdCast,#fdFlow,#fdOverload"))return;
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait=ms=>new Promise(r=>setTimeout(r,still?Math.min(ms,30):ms));
  const pop=el=>{if(el&&!still)el.animate([{transform:"scale(.7)",opacity:.2},{transform:"scale(1.06)",opacity:1,offset:.7},{transform:"none",opacity:1}],{duration:420,easing:"cubic-bezier(.2,1.4,.4,1)"});};
  const head=(t,sub,hooks)=>'<div class="ol-head"><b>'+t+"</b><span>"+sub+"</span></div>"+(hooks?'<div class="fd-hooks">'+hooks.map(h=>"<span>"+h+"</span>").join("")+"</div>":"");
  const mount=(id,title,sub,hooks,body)=>{const h=$("#"+id);if(!h)return null;h.innerHTML=head(title,sub,hooks)+'<div class="vbody">'+body+'<div class="an-foot"></div></div>';return h;};
  /* Back / Play / Next player: frames = [{code, msg, apply(state)}]; state is rebuilt from scratch, so Back is exact */
  function stepper(host,frames,init,render,unhot){let k=-1,timer=null;const foot=$(".an-foot",host);
    foot.innerHTML='<div class="ctrl an-ctl"><button type="button" class="btn" data-s="back">◀ Back</button><button type="button" class="btn pri" data-s="play">▶ Play</button><button type="button" class="btn" data-s="next">Next ▶</button><span class="count"></span></div><div class="an-code"></div><div class="msg" aria-live="polite"></div>';
    const go=n=>{k=Math.max(-1,Math.min(frames.length-1,n));const st=init();for(let i=0;i<=k;i++){if(i===k&&unhot)unhot(st);frames[i].apply&&frames[i].apply(st);}render(st,k>=0?frames[k]:null,k);
      $(".an-code",host).innerHTML=frames.slice(0,k+1).map((f,i)=>f.code?'<div class="'+(i===k?"cur":"")+'">'+hl(f.code)+"</div>":"").join("")||'<div class="dim">// press Next or Play</div>';
      $(".msg",host).innerHTML=k>=0?frames[k].msg:host.dataset.intro||"Press <b>Play</b>, or step with <b>Next</b>.";
      $(".count",host).textContent=(k+1)+" / "+frames.length;$('[data-s="back"]',host).disabled=k<0;$('[data-s="next"]',host).disabled=k>=frames.length-1;};
    const stop=()=>{clearInterval(timer);timer=null;$('[data-s="play"]',host).textContent="▶ Play";};
    foot.addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(!b)return;const s=b.dataset.s;
      if(s==="next"){stop();go(k+1);}else if(s==="back"){stop();go(k-1);}
      else{if(timer){stop();return;}if(k>=frames.length-1)go(-1);b.textContent="❚❚ Pause";timer=setInterval(()=>{if(k>=frames.length-1){stop();return;}go(k+1);},still?600:2200);}});
    go(-1);return {go};}
  const bits=(n,w)=>{const b=BigInt.asUintN(w,BigInt(n)).toString(2).padStart(w,"0");return b;};

  /* ===== F1 · the pipeline: javac → bytecode → every OS → inside the JVM ===== */
  (function(){const h=mount("fdPipe","From your text to a running program","Compile once, run anywhere, get faster while running",
      ["<b>javac</b> runs once → <b>bytecode</b>","one <code>.class</code> → every OS","<b>interpreter</b> starts fast","<b>JIT</b> makes hot code fast"],
      '<div class="fd-pipe">'+
      '<div class="fd-row"><h5>1 · Compile once, with the JDK</h5><div class="fd-track">'+
        '<div class="fd-card" data-k="src"><b>Hello.java</b><pre>static int add(int a, int b) {\n    return a + b;\n}</pre><small>text you write</small></div>'+
        '<div class="fd-arr" data-k="javac"><span>javac</span><i>→</i><em>checks types</em></div>'+
        '<div class="fd-card cls" data-k="cls"><b>Hello.class</b><pre>iload_0\niload_1\niadd\nireturn</pre><small>bytecode · same on every OS</small></div>'+
      '</div></div>'+
      '<div class="fd-row"><h5>2 · The same file runs anywhere</h5><div class="fd-machs">'+
        ['🪟 Windows','🐧 Linux','🍎 macOS'].map((m,i)=>'<div class="fd-mach" data-k="m'+i+'"><b>'+m+'</b><span>JVM for '+m.slice(2)+'</span><em>native code</em></div>').join("")+
      '</div></div>'+
      '<div class="fd-row"><h5>3 · Inside one JVM · <code>java Hello</code></h5><div class="fd-stages">'+
        [["load","Class loader","finds and loads .class"],["verify","Verifier","is the bytecode safe?"],["interp","Interpreter","runs it line by line"],["jit","JIT compiler","hot code → machine code"]].map(s=>'<div class="fd-stage" data-k="'+s[0]+'"><b>'+s[1]+'</b><small>'+s[2]+'</small></div>').join("")+
      '</div><div class="fd-heat"><span>calls to <code>add()</code></span><div class="fd-bar"><i></i></div><b class="fd-count">0</b><em>cold</em></div>'+
      '<div class="fd-console"><span>$ java Hello</span><div class="fd-out"></div></div>'+
      '<div class="fd-mem" hidden><div><b>Heap</b><small>objects, arrays</small></div><div><b>Stacks</b><small>one per thread: method calls</small></div><div><b>Metaspace</b><small>loaded classes</small></div></div>'+
      '</div></div>');
    if(!h)return;
    h.dataset.intro="Press <b>Play</b> to follow one program from text to machine code, or step with <b>Next</b>.";
    const F=[
      {code:"// Hello.java",msg:"You write plain text. Nothing can run it yet: a CPU understands machine code, not Java.",apply:s=>{s.lit.add("src");s.hot="src";}},
      {code:"javac Hello.java",msg:"<b>javac</b> reads the text and checks every type and name. A mistake stops it here with a <i>compile error</i>, and nothing runs. This happens <b>once</b>, on your machine.",apply:s=>{s.lit.add("javac");s.hot="javac";}},
      {code:"// → Hello.class",msg:"It writes <b>Hello.class</b>: <b>bytecode</b>, a short instruction list for an imaginary machine. It is not Windows code and not Mac code, which is the whole trick.",apply:s=>{s.lit.add("cls");s.hot="cls";}},
      {code:"// copy Hello.class anywhere",msg:"The same file goes to any computer. Each one has its own <b>JVM</b> that reads bytecode and talks to that CPU: <b>write once, run anywhere</b>. The JVM is the part that is <i>not</i> portable.",apply:s=>{["m0","m1","m2"].forEach(k=>s.lit.add(k));s.hot="m1";}},
      {code:"java Hello",msg:"You run it. The <b>class loader</b> finds Hello.class and loads it. Classes load <i>lazily</i>: only when first needed.",apply:s=>{s.lit.add("load");s.hot="load";}},
      {msg:"Before a single instruction runs, the <b>verifier</b> checks the bytecode: no fake jumps, no type cheating. This is why a corrupt or hostile <code>.class</code> cannot crash the JVM itself.",apply:s=>{s.lit.add("verify");s.hot="verify";}},
      {msg:"The <b>interpreter</b> walks the instructions one by one: <code>iload_0, iload_1, iadd, ireturn</code>. Slow-ish, but it starts instantly. Your program prints its line.",apply:s=>{s.lit.add("interp");s.hot="interp";s.out.push("2 + 3 = 5");s.heat=.08;s.count=1;}},
      {code:"for (int i = 0; i < 10_000; i++) add(i, 1);",msg:"Your program calls <code>add()</code> in a loop. The JVM keeps a <b>counter per method</b>: 1… 1,000… 10,000. <code>add()</code> is now <b>hot</b>.",apply:s=>{s.heat=.95;s.count=10000;s.hot="heat";}},
      {msg:"The <b>JIT</b> compiles <code>add()</code> into real machine code for <i>this</i> CPU and swaps it in while the program keeps running. Hot code now runs at full speed. That is why Java is \"compiled <i>and</i> interpreted\", and why it gets faster after warm-up.",apply:s=>{s.lit.add("jit");s.hot="jit";s.jit=true;}},
      {msg:"While it runs, memory is split: objects on the <b>heap</b>, each thread's method calls on its <b>stack</b>, loaded classes in <b>Metaspace</b>. Lesson 02 opens these up; for now, just know they exist.",apply:s=>{s.mem=true;s.hot="mem";}}];
    stepper(h,F,()=>({lit:new Set(),hot:"",out:[],heat:0,count:0,jit:false,mem:false}),(s)=>{
      $$("[data-k]",h).forEach(el=>{el.classList.toggle("on",s.lit.has(el.dataset.k));el.classList.toggle("hot",el.dataset.k===s.hot);});
      $$(".fd-mach",h).forEach(el=>el.classList.toggle("jit",s.jit));
      $(".fd-bar i",h).style.width=(s.heat*100)+"%";$(".fd-count",h).textContent=s.count.toLocaleString("en-US");
      const hm=$(".fd-heat",h);hm.classList.toggle("hot",s.heat>.5);hm.classList.toggle("on",s.heat>0);$(".fd-heat em",h).textContent=s.heat>.5?(s.jit?"compiled to native":"hot"):s.heat>0?"warming":"cold";
      $(".fd-out",h).innerHTML=s.out.map(o=>"<div>"+esc(o)+"</div>").join("");
      const mem=$(".fd-mem",h);mem.hidden=!s.mem;mem.classList.toggle("hot",s.hot==="mem");
      pop($(".hot",h));},s=>{});})();

  /* ===== F1 · JDK ⊃ JRE ⊃ JVM ===== */
  (function(){const h=mount("fdKit","Three names, one picture","The JDK contains the JRE, which contains the JVM. Click a box, or say who you are.",
      ["<b>JVM</b> = the engine that runs bytecode","<b>JRE</b> = JVM + the standard library","<b>JDK</b> = JRE + developer tools"],
      '<div class="ol-cmds fd-who"><button type="button" class="chip" data-who="dev">👩‍💻 I write Java code</button><button type="button" class="chip" data-who="user">🧑 I only run a Java app</button><button type="button" class="chip" data-who="jvm">⚙️ What runs the bytecode?</button></div>'+
      '<div class="fd-nest"><div class="fd-box jdk" data-b="jdk" tabindex="0"><b>JDK</b><small>Java Development Kit</small><div class="fd-tools"><span>javac</span><span>javap</span><span>jshell</span><span>jar</span><span>jcmd</span><span>jlink</span></div>'+
        '<div class="fd-box jre" data-b="jre" tabindex="0"><b>JRE</b><small>Java Runtime Environment</small><div class="fd-tools"><span>java.lang</span><span>java.util</span><span>java.io</span><span>java.time</span><span>…</span></div>'+
          '<div class="fd-box jvm" data-b="jvm" tabindex="0"><b>JVM</b><small>Java Virtual Machine</small><div class="fd-tools"><span>class loader</span><span>verifier</span><span>interpreter</span><span>JIT</span><span>garbage collector</span></div></div>'+
        '</div></div></div><div class="msg" aria-live="polite">Click <b>JVM</b>, <b>JRE</b> or <b>JDK</b>.</div>');
    if(!h)return;
    const T={jvm:"<b>JVM</b>: the engine. It loads <code>.class</code> files, verifies them, interprets the bytecode and JIT-compiles the hot parts, and its <b>garbage collector</b> frees objects you no longer use. There is one JVM build per OS and CPU: the JVM is what makes bytecode portable, and is itself <i>not</i> portable.",
      jre:"<b>JRE</b>: the JVM <b>plus the standard library</b> (<code>String</code>, <code>ArrayList</code>, <code>HashMap</code>, files, dates…). Everything a finished program needs to run, and nothing for writing code. Since Java 11 Oracle no longer ships it as a separate download, but interviewers still use the word.",
      jdk:"<b>JDK</b>: the JRE <b>plus the tools</b>: <code>javac</code> (compiler), <code>javap</code> (look at bytecode), <code>jshell</code> (try one line), <code>jar</code> (package), <code>jcmd</code> (inspect a running JVM), <code>jlink</code> (ship a small runtime). This is what you install to learn Java.",
      dev:"You need the <b>JDK</b>: the compiler and the tools. It already contains the JRE and the JVM, so one install is enough.",
      user:"You need only the <b>JRE</b>: the JVM and the library. Today the app usually ships its own trimmed runtime (<code>jlink</code>), so you may not install anything.",
      jvmq:"The <b>JVM</b>, the innermost box. Both the JRE and the JDK contain one."};
    const show=(b,msg)=>{$$(".fd-box",h).forEach(x=>x.classList.toggle("on",x.dataset.b===b));$$(".fd-who .chip",h).forEach(c=>c.classList.toggle("on",c.dataset.who===(b==="jvm"&&msg===T.jvmq?"jvm":b==="jdk"?"dev":b==="jre"?"user":"")));$(".msg",h).innerHTML=msg;pop($(".fd-box.on",h));};
    h.addEventListener("click",e=>{const w=e.target.closest("[data-who]");if(w){const who=w.dataset.who;show(who==="dev"?"jdk":who==="user"?"jre":"jvm",who==="jvm"?T.jvmq:T[who]);return;}
      const b=e.target.closest(".fd-box");if(b){e.stopPropagation();show(b.dataset.b,T[b.dataset.b]);}});
    h.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.classList.contains("fd-box")){e.preventDefault();e.stopPropagation();show(e.target.dataset.b,T[e.target.dataset.b]);}});})();

  /* ===== F2 · the 8 primitives as bit bars ===== */
  (function(){const TY=[["byte",8,"−128 … 127","0","(byte) 10","Byte","raw bytes from a file or the network"],["short",16,"−32,768 … 32,767","0","(short) 10","Short","rare: audio samples, compact arrays"],
      ["int",32,"−2,147,483,648 … 2,147,483,647 (about ±2.1 billion)","0","42, 0xFF, 1_000_000","Integer","<b>the default whole number</b>: counts, indexes, ages"],["long",64,"about ±9.2 × 10¹⁸","0L","3_000_000_000L","Long","timestamps, ids, anything past 2.1 billion"],
      ["float",32,"about 7 significant digits","0.0f","1.5f","Float","graphics and sensors; rare in business code"],["double",64,"about 15–16 significant digits","0.0","1.5, 2e3","Double","<b>the default decimal</b> (never for money: see F3)"],
      ["char",16,"0 … 65,535, unsigned: one UTF-16 unit","'\\u0000'","'A', '\\n'","Character","one character"],["boolean",0,"true / false (size not specified)","false","true","Boolean","yes/no flags"]];
    const ASK=[["a person's age","int","It fits in a byte, but <code>int</code> is the convention for ordinary whole numbers."],["world population: 8,100,000,000","long","Past 2.1 billion an <code>int</code> overflows (the odometer in F3). <code>long</code> goes to 9.2 × 10¹⁸."],
      ["a price: 19.99","double","For a quick calculation. For real money use <code>BigDecimal</code> or a <code>long</code> of cents, because <code>double</code> cannot hold 0.1 exactly (F3)."],["one letter: 'A'","char","A single character, 16 bits. A whole word needs a <code>String</code> (Lesson 01)."],
      ["is the door open?","boolean","Two values only: <code>true</code> or <code>false</code>."],["time in milliseconds since 1970","long","About 1.7 × 10¹² today. An <code>int</code> runs out after 24.8 days of milliseconds."],["body temperature: 36.6","double","A decimal; <code>double</code> is the default, <code>float</code> only when memory is tight."],["a pixel colour: 0xFF8800","int","Three bytes of colour (plus alpha) fit in 32 bits; graphics code packs them into an <code>int</code>."]];
    const h=mount("fdTypes","The 8 primitive types","Each box has a fixed number of bits. Click a bar, then try the questions below.",
      ["<b>4</b> whole-number types: byte, short, int, long","<b>2</b> decimals: float, double","<b>char</b> is a 16-bit number","<b>boolean</b> is true / false"],
      '<div class="fd-bars">'+TY.map(t=>'<button type="button" class="fd-tbar" data-t="'+t[0]+'"><b>'+t[0]+'</b><span class="fd-bits'+(t[1]?"":" none")+'" style="--w:'+(t[1]||4)+'"><i></i></span><small>'+(t[1]?t[1]+" bits":"true / false")+'</small></button>').join("")+'</div>'+
      '<div class="fd-tinfo"><div class="ol-empty">Click a type.</div></div>'+
      '<h5>Which type would you pick?</h5><div class="ol-cmds fd-asks">'+ASK.map((a,i)=>'<button type="button" class="chip" data-a="'+i+'">'+a[0]+'</button>').join("")+'</div><div class="msg" aria-live="polite">Pick a question: the right bar lights up and says why.</div>');
    if(!h)return;
    const sel=(name,why)=>{const t=TY.find(x=>x[0]===name);$$(".fd-tbar",h).forEach(b=>b.classList.toggle("on",b.dataset.t===name));
      $(".fd-tinfo",h).innerHTML='<div class="fd-tgrid"><div><small>size</small><b>'+(t[1]?t[1]+" bits":"not specified")+'</b></div><div><small>range</small><b>'+t[2]+'</b></div><div><small>default (fields, arrays)</small><b><code>'+esc(t[3])+'</code></b></div><div><small>literal</small><b><code>'+esc(t[4])+'</code></b></div><div><small>wrapper class</small><b><code>'+t[5]+'</code></b></div><div><small>use it for</small><b>'+t[6]+'</b></div></div>'+(why?'<div class="fd-why">'+why+'</div>':"");
      pop($(".fd-tbar.on",h));};
    h.addEventListener("click",e=>{const b=e.target.closest(".fd-tbar");if(b){$$(".fd-asks .chip",h).forEach(c=>c.classList.remove("on"));$(".msg",h).innerHTML="A local variable has <b>no</b> default: the compiler refuses to read it before you assign it. Defaults apply to fields and array elements only.";sel(b.dataset.t);return;}
      const c=e.target.closest(".fd-asks .chip");if(c){const a=ASK[+c.dataset.a];$$(".fd-asks .chip",h).forEach(x=>x.classList.toggle("on",x===c));sel(a[1],"<b>"+esc(a[0])+"</b> → <code>"+a[1]+"</code>. "+a[2]);$(".msg",h).innerHTML="<code>"+a[1]+"</code>: "+a[2];}});})();

  /* ===== F3 · a value through a conversion ===== */
  (function(){const C=[
      {id:"i2l",lab:"int → long",code:"int i = 300;\nlong l = i;",from:["int",300,32],to:["long","300",64],kind:"wide",msg:"<b>Widening</b>: the new box is bigger, so the value always fits. Java converts it for you, no cast, nothing lost."},
      {id:"i2b",lab:"int → byte",code:"int i = 300;\nbyte b = (byte) i;",from:["int",300,32],to:["byte","44",8],kind:"narrow",msg:"<b>Narrowing</b> needs <code>(byte)</code>, and it can lose data: a byte keeps only the <b>low 8 bits</b>. 300 is <code>1 0010 1100</code>; the low 8 bits <code>0010 1100</code> are 44."},
      {id:"d2i",lab:"double → int",code:"int a = (int) 3.99;\nint b = (int) -3.99;",from:["double","3.99"],to:["int","3  (and −3.99 → −3)"],kind:"narrow",msg:"<code>(int)</code> <b>drops the fraction</b>, toward zero: 3.99 → 3, −3.99 → −3. No rounding. Use <code>Math.round</code> when you want rounding."},
      {id:"c2i",lab:"char → int",code:"char c = 'a';\nint n = c + 1;",from:["char 'a'",97,16],to:["int","98",32],kind:"wide",msg:"A <code>char</code> is a 16-bit number: <code>'a'</code> is 97, so <code>'a' + 1</code> is the <b>int</b> 98, not <code>'b'</code>. Cast back, <code>(char) 98</code>, to get <code>'b'</code>."},
      {id:"ovf",lab:"int overflow",code:"int big = Integer.MAX_VALUE;\nint r = big + 1;",from:["int",2147483647,32],to:["int","−2,147,483,648",32],kind:"wrap",msg:"Adding 1 to the biggest int <b>rolls over</b> to the smallest (the odometer above). No error, no warning. Use <code>long</code>, or <code>Math.addExact</code> to get an exception instead."},
      {id:"div",lab:"7 / 2",code:"int q = 7 / 2;\ndouble d = 7 / 2.0;",from:["int ÷ int","7 / 2"],to:["int","3  (7 / 2.0 → 3.5)"],kind:"int",msg:"Two <code>int</code>s divide as ints: the fraction is <b>dropped</b>. Make one side a <code>double</code> and you get 3.5. <code>-7 / 2</code> is −3 (toward zero) and <code>-7 % 3</code> is −1."},
      {id:"plus",lab:"b += 1",code:"byte b = 10;\nb += 1;        // ok\n// b = b + 1;  // error",from:["byte",10,8],to:["byte","11",8],kind:"hidden",msg:"<code>b += 1</code> compiles because it means <code>b = (byte)(b + 1)</code>: the cast is <b>hidden</b>. <code>b = b + 1</code> does not compile: <code>b + 1</code> is an <code>int</code> (small types are promoted to int in arithmetic)."},
      {id:"big",lab:"huge double → int",code:"int x = (int) 3e10;",from:["double","3e10 (30 billion)"],to:["int","2,147,483,647"],kind:"narrow",msg:"Too big for an int, so the result <b>saturates</b> at <code>Integer.MAX_VALUE</code>. Note the difference: int → byte keeps the low bits, double → int clamps."}];
    const h=mount("fdCast","One value, one conversion","Watch what happens to the bits when a value changes type",
      ["<b>widening</b> = bigger box, automatic, safe","<b>narrowing</b> = smaller box, needs a cast, may lose data","small types compute as <b>int</b>","overflow <b>wraps</b>, silently"],
      '<div class="ol-cmds fd-cases">'+C.map(c=>'<button type="button" class="chip" data-c="'+c.id+'">'+esc(c.lab)+'</button>').join("")+'</div>'+
      '<div class="fd-conv"><div class="fd-val from"><small></small><b></b><div class="fd-bitrow"></div></div><div class="fd-pipe2"><i></i><span></span></div><div class="fd-val to"><small></small><b></b><div class="fd-bitrow"></div></div></div>'+
      '<div class="an-code"></div><div class="msg" aria-live="polite">Pick a conversion.</div>');
    if(!h)return;
    const KIND={wide:"widening · automatic",narrow:"narrowing · (cast) needed",wrap:"overflow · wraps around",int:"integer division",hidden:"hidden cast in +="};
    const bitrow=(v,w,keep)=>{if(w==null||typeof v!=="number")return "";const b=bits(v,w);return b.split("").map((x,i)=>'<i class="'+(x==="1"?"on":"")+(keep&&i<w-keep?" cut":"")+'">'+x+"</i>").join("");};
    function show(c){$$(".fd-cases .chip",h).forEach(b=>b.classList.toggle("on",b.dataset.c===c.id));
      const conv=$(".fd-conv",h);conv.className="fd-conv "+c.kind;$(".fd-pipe2 span",h).textContent=KIND[c.kind];
      $(".from small",h).textContent=c.from[0];$(".from b",h).textContent=String(c.from[1]);$(".from .fd-bitrow",h).innerHTML=bitrow(c.from[1],c.from[2],c.kind==="narrow"&&c.to[2]?c.to[2]:0);
      $(".to small",h).textContent=c.to[0];$(".to b",h).textContent=c.to[1];
      const tv=c.id==="i2b"?44:c.id==="i2l"?300:c.id==="c2i"?98:c.id==="ovf"?-2147483648:c.id==="plus"?11:null;$(".to .fd-bitrow",h).innerHTML=tv==null?"":bitrow(tv,c.to[2]);
      $(".an-code",h).innerHTML='<div class="cur">'+hl(c.code)+"</div>";$(".msg",h).innerHTML=c.msg;$(".msg",h).classList.toggle("err",c.kind==="wrap");
      pop($(".fd-val.to",h));if(!still)$(".fd-pipe2 i",h).animate([{transform:"translateX(-120%)",opacity:0},{transform:"translateX(0)",opacity:1},{transform:"translateX(120%)",opacity:0}],{duration:900,easing:"ease-in-out"});}
    h.addEventListener("click",e=>{const b=e.target.closest(".fd-cases .chip");if(b)show(C.find(c=>c.id===b.dataset.c));});
    show(C[1]);})();

  /* ===== F4 · a switch is a ladder the ball falls through ===== */
  (function(){const CASES=[["1","Mon"],["2","Tue"],["3","Wed"],["default","Other"]];
    const h=mount("fdFlow","The switch ladder","A classic switch keeps falling until it meets a break. The arrow form never falls.",
      ["classic <code>case X:</code> <b>falls through</b>","<code>break</code> stops the fall","arrow <code>case X -&gt;</code> runs <b>one</b> case","<code>default</code> catches the rest"],
      '<div class="ol-cmds"><span class="fd-lbl">switch (day) · day =</span>'+["1","2","3","9"].map(d=>'<button type="button" class="chip" data-d="'+d+'">'+d+'</button>').join("")+'<label class="ol-tog"><input type="checkbox" data-arrow> arrow form (Java 14+)</label></div>'+
      '<div class="fd-ladder">'+CASES.map(([c,p],i)=>'<div class="fd-case" data-i="'+i+'"><code>'+(c==="default"?"default":"case "+c)+'<span class="fd-colon">:</span><span class="fd-arrowk"> -&gt;</span></code><span class="fd-do">print("'+p+' ")</span>'+(c==="default"?'<em class="fd-brk"></em>':'<label class="fd-brk"><input type="checkbox" data-brk="'+i+'"'+(i>0?" checked":"")+'> break</label>')+'</div>').join("")+'<div class="fd-ball" hidden>●</div></div>'+
      '<div class="fd-console"><span>output</span><div class="fd-out"></div></div><div class="an-code"></div><div class="msg" aria-live="polite">Pick a <b>day</b>. Case 1 has no <code>break</code> on purpose: watch the ball keep falling.</div>');
    if(!h)return;let runId=0;
    const arrow=()=>$("[data-arrow]",h).checked;
    const code=()=>{const a=arrow();return "switch (day) {\n"+CASES.map(([c,p],i)=>a?"    "+(c==="default"?"default":"case "+c)+" -> System.out.print(\""+p+" \");":"    "+(c==="default"?"default":"case "+c)+":\n        System.out.print(\""+p+" \");"+(c!=="default"&&$('[data-brk="'+i+'"]',h).checked?"\n        break;":"")).join("\n")+"\n}";};
    const paint=()=>{h.classList.toggle("arrow",arrow());$$(".fd-brk input",h).forEach(x=>x.disabled=arrow());$(".an-code",h).innerHTML='<div class="cur">'+hl(code())+"</div>";};
    async function run(day){const my=++runId;const live=()=>my===runId;const a=arrow();let i=CASES.findIndex(c=>c[0]===day);if(i<0)i=3;const path=[];
      if(a)path.push(i);else{for(let k=i;k<CASES.length;k++){path.push(k);if(k===3||$('[data-brk="'+k+'"]',h).checked)break;}}
      $$(".fd-case",h).forEach(c=>c.classList.remove("on","hit"));$(".fd-out",h).textContent="";const ball=$(".fd-ball",h);ball.hidden=false;ball.style.top="-14px";
      $(".msg",h).innerHTML="day = <b>"+day+"</b>: "+(i===3?"no case matches, so <code>default</code> runs.":"the ball drops to <code>case "+day+"</code>.");
      for(const k of path){const el=$('.fd-case[data-i="'+k+'"]',h);await wait(380);if(!live())return;ball.style.top=(el.offsetTop+el.offsetHeight/2-11)+"px";await wait(320);if(!live())return;el.classList.add("on","hit");$(".fd-out",h).textContent+=CASES[k][1]+" ";pop(el);}
      await wait(300);if(!live())return;ball.hidden=true;const txt=path.map(k=>CASES[k][1]).join(" ");
      $(".msg",h).innerHTML=a?"Arrow form: exactly <b>one</b> case runs, no <code>break</code> needed. Output: <code>"+txt+"</code>.":path.length>1?"No <code>break</code> after <code>"+CASES[path[0]][1]+"</code>, so execution <b>fell through</b> into the next case"+(path.length>2?"s":"")+". Output: <code>"+txt+"</code>. This is the #1 switch bug.":"<code>break</code> stopped the fall. Output: <code>"+txt+"</code>.";}
    h.addEventListener("click",e=>{const d=e.target.closest("[data-d]");if(d){$$("[data-d]",h).forEach(x=>x.classList.toggle("on",x===d));run(d.dataset.d);}});
    h.addEventListener("change",e=>{paint();if(e.target.matches("[data-arrow]"))$(".msg",h).innerHTML=arrow()?"Arrow form: no fall-through, several labels as <code>case 1, 2 -&gt;</code>, and it can return a value (<code>int x = switch (…) {…};</code>). Pick a day.":"Classic form: it keeps falling until a <code>break</code>. Pick a day.";});
    paint();})();

  /* ===== F5 · overload resolution in three phases ===== */
  (function(){const M=[["long","f(long x)"],["Integer","f(Integer x)"],["Object","f(Object o)"],["var","f(int... xs)"]];
    const ok=(t)=>"✓ "+t,no=(t)=>"✗ "+t;
    const CALLS=[
      {c:"f(5)",arg:"int",ph:[{long:ok("int widens to long"),Integer:no("int → Integer is boxing: not in phase 1"),Object:no("would need boxing first"),var:no("varargs wait for phase 3")}],win:"long",res:"long"},
      {c:"f(5L)",arg:"long",ph:[{long:ok("exact match"),Integer:no("a long is not an Integer"),Object:no("needs boxing"),var:no("long → int would narrow")}],win:"long",res:"long"},
      {c:"f(5.0)",arg:"double",ph:[{long:no("double → long is narrowing"),Integer:no("a double is not an Integer"),Object:no("needs boxing"),var:no("not yet")},{long:no("still narrowing"),Integer:no("boxes to Double, not Integer"),Object:ok("Double is an Object"),var:no("not yet")}],win:"Object",res:"Object"},
      {c:"f('a')",arg:"char",ph:[{long:ok("char widens to long (97)"),Integer:no("char → Integer is not a boxing"),Object:no("needs boxing"),var:no("not yet")}],win:"long",res:"long"},
      {c:'f("hi")',arg:"String",ph:[{long:no("a String is not a number"),Integer:no("not an Integer"),Object:ok("String is an Object"),var:no("not yet")}],win:"Object",res:"Object"},
      {c:"f(5, 6)",arg:"int, int",ph:[{long:no("two arguments, one parameter"),Integer:no("two arguments"),Object:no("two arguments"),var:no("not yet")},{long:no("two arguments"),Integer:no("two arguments"),Object:no("two arguments"),var:no("not yet")},{long:no("two arguments"),Integer:no("two arguments"),Object:no("two arguments"),var:ok("int... takes any count")}],win:"var",res:"varargs (2)"},
      {c:"f()",arg:"nothing",ph:[{long:no("no argument"),Integer:no("no argument"),Object:no("no argument"),var:no("not yet")},{long:no("no argument"),Integer:no("no argument"),Object:no("no argument"),var:no("not yet")},{long:no("no argument"),Integer:no("no argument"),Object:no("no argument"),var:ok("zero values is fine")}],win:"var",res:"varargs (0)"},
      {c:"f((Integer) 5)",arg:"Integer",ph:[{long:no("Integer → long needs unboxing (phase 2)"),Integer:ok("exact match"),Object:ok("Integer is an Object, but less specific"),var:no("not yet")}],win:"Integer",res:"Integer",note:"Two fit in phase 1; the <b>most specific</b> one wins: <code>Integer</code> is a kind of <code>Object</code>, not the other way round."},
      {c:"f(null)",arg:"null",ph:[{long:no("null is never a primitive"),Integer:ok("null fits any reference"),Object:ok("null fits any reference"),var:ok("null can be the int[] itself")}],win:null,res:"compile error",note:"<code>Integer</code> and <code>int[]</code> both fit and neither is more specific than the other: <b>error: reference to f is ambiguous</b>. Cast the null: <code>f((Integer) null)</code>."}];
    const h=mount("fdOverload","Which f() gets called?","The compiler picks an overload in three phases and stops at the first phase with a match",
      ["phase 1: <b>exact or widening</b>","phase 2: <b>boxing</b> allowed","phase 3: <b>varargs</b> allowed","several fit → the <b>most specific</b> wins"],
      '<div class="fd-cands">'+M.map(m=>'<div class="fd-cand" data-m="'+m[0]+'"><code>'+esc(m[1])+'</code><span></span></div>').join("")+'</div>'+
      '<div class="ol-cmds fd-calls"><span class="fd-lbl">call:</span>'+CALLS.map((c,i)=>'<button type="button" class="chip" data-i="'+i+'">'+esc(c.c)+'</button>').join("")+'</div>'+
      '<div class="fd-phases">'+[["1","exact match or widening","no boxing, no varargs"],["2","boxing / unboxing","still no varargs"],["3","varargs","last resort"]].map(p=>'<div class="fd-phase" data-p="'+p[0]+'"><b>Phase '+p[0]+'</b><small>'+p[1]+'</small><em>'+p[2]+'</em></div>').join("")+'</div>'+
      '<div class="msg" aria-live="polite">Pick a call and watch the phases.</div>');
    if(!h)return;let runId=0;
    async function run(c){const my=++runId;const live=()=>my===runId;$$(".fd-cand",h).forEach(x=>{x.className="fd-cand";$("span",x).textContent="";});$$(".fd-phase",h).forEach(p=>p.classList.remove("on","done"));
      const msg=$(".msg",h);msg.classList.remove("err");msg.innerHTML="Argument type: <b>"+esc(c.arg)+"</b>.";
      for(let i=0;i<c.ph.length;i++){const P=$('.fd-phase[data-p="'+(i+1)+'"]',h);P.classList.add("on");await wait(500);if(!live())return;
        for(const m of M){const el=$('.fd-cand[data-m="'+m[0]+'"]',h),t=c.ph[i][m[0]];el.classList.remove("yes","no");el.classList.add(t.startsWith("✓")?"yes":"no");$("span",el).textContent=t;await wait(260);if(!live())return;}
        const fits=M.filter(m=>c.ph[i][m[0]].startsWith("✓"));
        if(fits.length){P.classList.add("done");break;}P.classList.remove("on");P.classList.add("done");msg.innerHTML+=" Phase "+(i+1)+": nothing fits, move on.";await wait(350);if(!live())return;}
      if(c.win){const w=$('.fd-cand[data-m="'+c.win+'"]',h);w.classList.add("win");pop(w);msg.innerHTML="<b>"+esc(c.c)+"</b> → <code>"+esc(M.find(m=>m[0]===c.win)[1])+"</code>, prints <b>"+esc(c.res)+"</b>."+(c.note?" "+c.note:"");}
      else{msg.classList.add("err");msg.innerHTML="<b>"+esc(c.c)+"</b> → <b>"+esc(c.res)+"</b>. "+c.note;}}
    h.addEventListener("click",e=>{const b=e.target.closest(".fd-calls .chip");if(b){$$(".fd-calls .chip",h).forEach(x=>x.classList.toggle("on",x===b));run(CALLS[+b.dataset.i]);}});})();
})();
