/* Lesson 06 labs: bubble sort labs + sorting explorer (v28–v31) and complexity labs (v32).
   Part of the course scripts. Every page loads, in this order: course-index.js, quiz-data.js, course.js, effects.js,
   labs-oop.js, labs-collections.js, labs-analogy.js, labs-sorting.js, practice-tools.js. They are classic scripts, so
   top-level const/let/function names are shared between them (course.js defines $, $$, esc, store, hl, FX, THM…). */
"use strict";
/* Bubble sort labs (v28, Lesson 06). Hosts: every .bs-lab (the Bubble Lab: 11 variants, live Java line, pointers, counters,
   call stack, optional dry-run table), #anValet (valet analogy), #bsStable (stability), #bsInv (inversions grid),
   #bsChart (measured comparisons/swaps vs n) and #bsRace (variant race). One tracer T drives everything: a variant's run(T)
   calls T.cmp / T.swap / T.mark, which count and (when recording) snapshot frames. The counts match the Lesson 06 Java
   programs (BubbleBrute, BubbleOptimized, BubbleLastSwap, CocktailSort, OddEvenSort, CombSort...). */
(function(){
  if(!$(".bs-lab,#bsx,#bsPath,#bsMoves,#anValet,#bsStable,#bsInv,#bsChart,#bsRace"))return;
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const head=(t,sub)=>'<div class="ol-head"><b>'+t+"</b><span>"+sub+"</span></div>";
  const lazy=(el,f)=>{if(!el)return;const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();f(el);}},{rootMargin:"300px 0px"});io.observe(el);};

  /* ---------- tracer ---------- */
  function tracer(vals,o){o=o||{};
    const T={n:vals.length,a:vals.map((v,i)=>({v:typeof v==="object"?v.v:v,t:typeof v==="object"?v.t:"",id:i})),rec:o.rec!==false,ge:!!o.ge,
      comps:0,swaps:0,writes:0,inv:0,wasted:0,pass:0,stack:[],maxDepth:0,fin:new Set(),bound:null,lo:null,hi:null,gap:null,dir:0,
      P:{},keep:null,rg:null,pv:null,aux:null,hs:null,frames:[],cap:o.cap||6000};
    const shot=(key,msg,x)=>{if(!T.rec||T.frames.length>=T.cap)return;
      T.frames.push(Object.assign({key,msg,ids:T.a.map(e=>e.id),vals:T.a.map(e=>e.v),tags:T.a.map(e=>e.t),fin:[...T.fin],pass:T.pass,comps:T.comps,swaps:T.swaps,writes:T.writes,inv:T.inv,
        wasted:T.wasted,stack:T.stack.slice(),depth:T.stack.length,maxDepth:T.maxDepth,bound:T.bound,lo:T.lo,hi:T.hi,gap:T.gap,dir:T.dir,
        ptrs:Object.entries(Object.assign({},T.keep||{},T.P)).filter(e=>e[1]!=null&&e[1]>=0&&e[1]<T.n),rg:T.rg?T.rg.slice():null,pv:T.pv,hs:T.hs,
        aux:T.aux?JSON.parse(JSON.stringify(T.aux)):null},x||{}));};
    const nm=e=>e.v+(e.t?"<sub>"+e.t+"</sub>":"");
    const OPS={"<":(x,y)=>x<y,">":(x,y)=>x>y,"<=":(x,y)=>x<=y,">=":(x,y)=>x>=y,"==":(x,y)=>x===y,"!=":(x,y)=>x!==y},
          OPH={"<":"&lt;",">":"&gt;","<=":"≤",">=":"≥","==":"==","!=":"≠"};
    T.val=i=>nm(T.a[i]);
    T.gt=(x,y)=>T.ge?x.v>=y.v:x.v>y.v;
    T.cmp=(i,j,key,opt)=>{opt=opt||{};T.comps++;if(opt.waste)T.wasted++;const x=T.a[i],y=T.a[j],r=T.gt(x,y);
      if(T.rec){const after=T.a.map(e=>e.v);if(r){const t=after[i];after[i]=after[j];after[j]=t;}
        const eq=x.v===y.v,rel=r?(eq?" ≥ ":" &gt; "):(eq?" = ":" ≤ ");
        shot(key,"Compare <code>a["+i+"]</code> = <b>"+nm(x)+"</b> and <code>a["+j+"]</code> = <b>"+nm(y)+"</b>: "+nm(x)+rel+nm(y)+(r?", so <b>swap</b>.":", so leave them."+(eq&&!T.ge?" Equal values never swap: that is what makes it stable.":""))+
          (opt.waste?' <span class="bs-wtag">wasted: index '+j+" is already parked</span>":""),
          {cmp:[i,j],lab:opt.lab,res:r,waste:!!opt.waste,row:{pass:T.pass,j:i,x:nm(x),y:nm(y),sw:r,after:after.join(", ")}});}
      return r;};
    /* general comparisons for the other sorts: positions i, j (test) or position i and a value v (testv) */
    T.test=(i,j,op,key,opt)=>{opt=opt||{};T.comps++;const x=T.a[i],y=T.a[j],r=OPS[op](x.v,y.v);
      shot(key,"<code>"+(opt.n1||"a["+i+"]")+"</code> = <b>"+nm(x)+"</b> "+OPH[op]+" <code>"+(opt.n2||"a["+j+"]")+"</code> = <b>"+nm(y)+"</b> ? <b>"+(r?"yes":"no")+"</b>."+(r?(opt.yes||""):(opt.no||"")),{cmp:[i,j],lab:["",""]});return r;};
    T.testv=(i,v,op,key,opt)=>{opt=opt||{};T.comps++;const x=T.a[i],r=OPS[op](x.v,v);
      shot(key,"<code>"+(opt.n1||"a["+i+"]")+"</code> = <b>"+nm(x)+"</b> "+OPH[op]+" "+(opt.vn?"<code>"+opt.vn+"</code> = ":"")+"<b>"+v+"</b> ? <b>"+(r?"yes":"no")+"</b>."+(r?(opt.yes||""):(opt.no||"")),{cmp:[i,i],lab:["",""]});return r;};
    T.get=i=>Object.assign({},T.a[i]);
    T.set=(k,e,key,msg)=>{T.writes++;T.a[k]=typeof e==="object"?Object.assign({},e):{v:e,t:"",id:-1};shot(key,msg||("<code>a["+k+"] = "+nm(T.a[k])+"</code>"),{wr:k});};
    T.swap=(i,j,key,msg)=>{if(i===j)return;T.swaps++;const t=T.a[i];T.a[i]=T.a[j];T.a[j]=t;
      shot(key,msg||("Swapped: <b>"+nm(T.a[j])+"</b> moves "+(j>i?"right":"left")+" to index "+j+", <b>"+nm(T.a[i])+"</b> moves "+(j>i?"left":"right")+" to index "+i+"."),{cmp:[i,j],sw:true});};
    T.cmpMany=(js,key,what)=>{const out=[];js.forEach(j=>{T.comps++;if(T.gt(T.a[j],T.a[j+1]))out.push(j);});
      shot(key,what+": compare "+js.map(j=>"("+j+","+(j+1)+")").join(" ")+" <b>at the same time</b>; the pairs don't overlap. "+(out.length?out.length+" pair"+(out.length>1?"s are":" is")+" out of order.":"All in order."),{pairs:js,bad:out});return out;};
    T.swapMany=(js,key)=>{js.forEach(j=>{T.swaps++;const t=T.a[j];T.a[j]=T.a[j+1];T.a[j+1]=t;});shot(key,"Swap all "+js.length+" out-of-order pair"+(js.length>1?"s":"")+" together.",{pairs:js,sw:true,bad:js});};
    T.mark=(key,msg,x)=>shot(key,msg,x);
    T.done=i=>T.fin.add(i);
    T.push=s=>{T.stack.push(s);T.maxDepth=Math.max(T.maxDepth,T.stack.length);};
    T.pop=()=>T.stack.pop();
    T.end=()=>{for(let i=0;i<T.n;i++)T.fin.add(i);T.bound=T.lo=T.hi=null;T.dir=0;T.P={};T.keep=null;T.rg=null;T.pv=null;T.aux=null;
      shot("done","<b>Sorted.</b> "+T.comps+" comparisons, "+T.swaps+" swaps"+(T.writes?", "+T.writes+" writes":"")+(T.pass?", "+T.pass+" "+(T.passWord||(T.pass>1?"passes":"pass")):"")+
        (T.invOn?", <b>"+T.inv+" inversions</b> counted":"")+(T.wasted?", of which "+T.wasted+" comparisons were wasted on the parked tail":"")+(T.maxDepth?"; deepest call stack: "+T.maxDepth+" frames":"")+".");};
    return T;}

  /* ---------- the 11 variants: code lines [text, key] and run(T) ---------- */
  const L=(t,k)=>[t,k||""];
  const VAR={
    brute:{n:"V1 · Brute force",code:[L("void bruteBubble(int[] a) {"),L("    int n = a.length;"),L("    for (int i = 0; i < n - 1; i++) {      // always n-1 passes","pass"),L("        for (int j = 0; j < n - 1; j++) {  // always the whole array"),L("            if (a[j] > a[j + 1]) {","cmp"),L("                swap(a, j, j + 1);","swap"),L("            }"),L("        }"),L("    }"),L("}","done")],
      run(T){const n=T.n;for(let i=0;i<n-1;i++){T.pass=i+1;T.mark("pass","Pass "+(i+1)+": walk the <b>whole</b> array again, parked tail included.");for(let j=0;j<n-1;j++){if(T.cmp(j,j+1,"cmp",{waste:j+1>=n-i}))T.swap(j,j+1,"swap");}T.done(n-1-i);}T.end();}},
    standard:{n:"V2 · Standard (shrinking)",code:[L("void bubbleSort(int[] a) {"),L("    int n = a.length;"),L("    for (int i = 0; i < n - 1; i++) {","pass"),L("        for (int j = 0; j < n - 1 - i; j++) {  // skip the parked tail"),L("            if (a[j] > a[j + 1]) {","cmp"),L("                swap(a, j, j + 1);","swap"),L("            }"),L("        }"),L("    }"),L("}","done")],
      run(T){const n=T.n;for(let i=0;i<n-1;i++){T.pass=i+1;T.mark("pass","Pass "+(i+1)+": compare j = 0 … "+(n-2-i)+" (indexes after "+(n-1-i)+" are parked).");for(let j=0;j<n-1-i;j++){if(T.cmp(j,j+1,"cmp"))T.swap(j,j+1,"swap");}T.done(n-1-i);}T.end();}},
    flag:{n:"V3 · Optimized (swapped flag)",code:[L("void bubbleSort(int[] a) {"),L("    int n = a.length;"),L("    for (int i = 0; i < n - 1; i++) {","pass"),L("        boolean swapped = false;","reset"),L("        for (int j = 0; j < n - 1 - i; j++) {"),L("            if (a[j] > a[j + 1]) {","cmp"),L("                swap(a, j, j + 1);","swap"),L("                swapped = true;"),L("            }"),L("        }"),L("        if (!swapped) break;           // early exit","check"),L("    }"),L("}","done")],
      run(T){const n=T.n;for(let i=0;i<n-1;i++){T.pass=i+1;let s=false;T.mark("reset","Pass "+(i+1)+": <code>swapped = false</code>.");for(let j=0;j<n-1-i;j++){if(T.cmp(j,j+1,"cmp")){T.swap(j,j+1,"swap");s=true;}}T.done(n-1-i);
        if(!s){T.mark("check","Pass "+(i+1)+" made <b>no swaps</b>: every neighbour pair is in order, so the array is sorted. <code>break</code>.");break;}T.mark("check","<code>swapped</code> is true, so another pass is needed. "+T.val(n-1-i)+" is parked at index "+(n-1-i)+".");}T.end();}},
    lastswap:{n:"V4 · Last-swap boundary",code:[L("void bubbleSort(int[] a) {"),L("    int bound = a.length - 1;"),L("    while (bound > 0) {","pass"),L("        int last = 0;"),L("        for (int j = 0; j < bound; j++) {"),L("            if (a[j] > a[j + 1]) {","cmp"),L("                swap(a, j, j + 1);","swap"),L("                last = j;"),L("            }"),L("        }"),L("        bound = last;                  // all after it is final","check"),L("    }"),L("}","done")],
      run(T){let bound=T.n-1;T.bound=bound;while(bound>0){T.pass++;T.mark("pass","Pass "+T.pass+": compare pairs while <code>j &lt; bound</code> = "+bound+".");let last=0,any=false;
        for(let j=0;j<bound;j++){if(T.cmp(j,j+1,"cmp")){T.swap(j,j+1,"swap");last=j;any=true;}}for(let k=last+1;k<=bound;k++)T.done(k);if(!any)T.done(0);
        T.bound=last;T.mark("check",any?"Last swap was at <code>j = "+last+"</code>: nothing after index "+(last+1)+" moved, so it is all final. <code>bound = "+last+"</code>"+(bound-last>1?" (shrinks by "+(bound-last)+" at once).":"."):"No swap in this pass: <code>bound = 0</code>, the loop ends.");bound=last;}T.end();}},
    dowhile:{n:"V5 · do-while",code:[L("void bubbleSort(int[] a) {"),L("    int n = a.length;"),L("    boolean swapped;"),L("    do {","pass"),L("        swapped = false;"),L("        for (int j = 1; j < n; j++) {"),L("            if (a[j - 1] > a[j]) {","cmp"),L("                swap(a, j - 1, j);","swap"),L("                swapped = true;"),L("            }"),L("        }"),L("        n--;"),L("    } while (swapped);","check"),L("}","done")],
      run(T){let n=T.n,s;do{T.pass++;s=false;T.mark("pass","Sweep "+T.pass+": <code>swapped = false</code>, compare (j−1, j) for j = 1 … "+(n-1)+".");for(let j=1;j<n;j++){if(T.cmp(j-1,j,"cmp",{lab:["j-1","j"]})){T.swap(j-1,j,"swap");s=true;}}n--;T.done(n);
        T.mark("check",s?"Something was swapped: <code>n--</code> and sweep again.":"No swaps: <code>while (swapped)</code> is false, done.");}while(s&&n>1);T.end();}},
    rec:{n:"V6 · Recursive",rec:1,code:[L("void bubble(int[] a, int n) {","call"),L("    if (n <= 1) return;               // base case","base"),L("    boolean swapped = false;"),L("    for (int j = 0; j < n - 1; j++) {"),L("        if (a[j] > a[j + 1]) {","cmp"),L("            swap(a, j, j + 1);","swap"),L("            swapped = true;"),L("        }"),L("    }"),L("    if (!swapped) return;             // early exit","check"),L("    bubble(a, n - 1);                 // smaller problem","recurse"),L("}","ret")],
      run(T){const go=n=>{T.push("bubble(a, "+n+")");T.mark("call","Call <code>bubble(a, "+n+")</code>: a new stack frame.");if(n<=1){T.mark("base","<code>n = "+n+"</code>: base case, return.");T.pop();return;}
        T.pass++;let s=false;for(let j=0;j<n-1;j++){if(T.cmp(j,j+1,"cmp")){T.swap(j,j+1,"swap");s=true;}}T.done(n-1);
        if(!s){T.mark("check","No swaps: already sorted, return without recursing. The frames now unwind.");T.pop();return;}
        T.mark("recurse",T.val(n-1)+" is parked at index "+(n-1)+". Recurse on the first "+(n-1)+" elements.");go(n-1);T.mark("ret","<code>bubble(a, "+n+")</code> returns to its caller.");T.pop();};
        go(T.n);T.end();}},
    fullrec:{n:"V7 · Fully recursive",rec:1,code:[L("void sort(int[] a, int n) {","call"),L("    if (n <= 1) return;","base"),L("    pass(a, 0, n);           // inner loop as recursion","callpass"),L("    sort(a, n - 1);          // outer loop as recursion","recurse"),L("}","ret"),L("void pass(int[] a, int j, int n) {"),L("    if (j >= n - 1) return;","pbase"),L("    if (a[j] > a[j + 1])","cmp"),L("        swap(a, j, j + 1);","swap"),L("    pass(a, j + 1, n);"),L("}")],
      run(T){const pass=(j,n)=>{T.push("pass(a, "+j+", "+n+")");if(j>=n-1){T.mark("pbase","<code>pass(a, "+j+", "+n+")</code>: j reached the last pair, return. The "+(n-1)+" pass frames unwind one by one.");T.pop();return;}
          if(T.cmp(j,j+1,"cmp"))T.swap(j,j+1,"swap");pass(j+1,n);T.pop();};
        const sort=n=>{T.push("sort(a, "+n+")");T.mark("call","Call <code>sort(a, "+n+")</code>.");if(n<=1){T.mark("base","<code>n = "+n+"</code>: base case.");T.pop();return;}
          T.pass++;T.mark("callpass","Call <code>pass(a, 0, "+n+")</code>: it bubbles the largest of the first "+n+" to index "+(n-1)+", one call per pair.");pass(0,n);T.done(n-1);
          T.mark("recurse",T.val(n-1)+" is parked. Call <code>sort(a, "+(n-1)+")</code>.");sort(n-1);T.mark("ret","<code>sort(a, "+n+")</code> returns.");T.pop();};
        sort(T.n);T.end();}},
    generic:{n:"V8 · Generic (Comparator)",code:[L("<T> void sort(T[] a, Comparator<? super T> c) {"),L("    for (int i = 0; i < a.length - 1; i++) {","pass"),L("        boolean swapped = false;"),L("        for (int j = 0; j < a.length - 1 - i; j++) {"),L("            if (c.compare(a[j], a[j + 1]) > 0) {  // strict: stable","cmp"),L("                swap(a, j, j + 1);","swap"),L("                swapped = true;"),L("            }"),L("        }"),L("        if (!swapped) return;","check"),L("    }"),L("}","done")],
      run(T){VAR.flag.run(T);}},
    shaker:{n:"V9 · Cocktail shaker",code:[L("void cocktail(int[] a) {"),L("    int lo = 0, hi = a.length - 1;"),L("    boolean swapped = true;"),L("    while (swapped && lo < hi) {"),L("        swapped = false;"),L("        for (int j = lo; j < hi; j++)          // → forward","fwd"),L("            if (a[j] > a[j + 1]) { swap(a, j, j + 1); swapped = true; }","cmpF"),L("        hi--;"),L("        if (!swapped) break;","brk"),L("        swapped = false;"),L("        for (int j = hi; j > lo; j--)          // ← backward","bwd"),L("            if (a[j - 1] > a[j]) { swap(a, j - 1, j); swapped = true; }","cmpB"),L("        lo++;"),L("    }"),L("}","done")],
      run(T){let lo=0,hi=T.n-1,s=true;T.lo=lo;T.hi=hi;while(s&&lo<hi){s=false;T.pass++;T.dir=1;T.mark("fwd","Forward sweep →: the largest of indexes "+lo+"…"+hi+" travels to index "+hi+".");
        for(let j=lo;j<hi;j++)if(T.cmp(j,j+1,"cmpF")){T.swap(j,j+1,"cmpF");s=true;}T.done(hi);hi--;T.hi=hi;if(!s){T.mark("brk","No swaps on the way forward: sorted, <code>break</code>.");break;}
        s=false;T.pass++;T.dir=-1;T.mark("bwd","Backward sweep ←: the smallest of indexes "+lo+"…"+hi+" travels to index "+lo+". Turtles move all the way in one sweep.");
        for(let j=hi;j>lo;j--)if(T.cmp(j-1,j,"cmpB",{lab:["j-1","j"]})){T.swap(j-1,j,"cmpB");s=true;}T.done(lo);lo++;T.lo=lo;}T.passWord="sweeps";T.end();}},
    oddeven:{n:"V10 · Odd–even (brick)",code:[L("void oddEven(int[] a) {"),L("    boolean sorted = false;"),L("    while (!sorted) {","round"),L("        sorted = true;"),L("        for (int j = 1; j < a.length - 1; j += 2)   // odd phase","odd"),L("            if (a[j] > a[j + 1]) { swap(a, j, j + 1); sorted = false; }","oddS"),L("        for (int j = 0; j < a.length - 1; j += 2)   // even phase","even"),L("            if (a[j] > a[j + 1]) { swap(a, j, j + 1); sorted = false; }","evenS"),L("    }"),L("}","done")],
      run(T){let sorted=false;while(!sorted){sorted=true;T.pass++;
        for(const [st,k,w] of [[1,"odd","Odd phase"],[0,"even","Even phase"]]){const js=[];for(let j=st;j<T.n-1;j+=2)js.push(j);const bad=T.cmpMany(js,k,"Round "+T.pass+", "+w);if(bad.length){T.swapMany(bad,k+"S");sorted=false;}}
        T.mark("round",sorted?"Round "+T.pass+" swapped nothing: <code>sorted</code> stays true, done.":"End of round "+T.pass+": something moved, so another round.");}T.passWord="rounds";T.end();}},
    comb:{n:"V11 · Comb sort",code:[L("void comb(int[] a) {"),L("    int gap = a.length;"),L("    boolean swapped = true;"),L("    while (gap > 1 || swapped) {"),L("        gap = Math.max(1, (int) (gap / 1.3));","gap"),L("        swapped = false;"),L("        for (int j = 0; j + gap < a.length; j++)"),L("            if (a[j] > a[j + gap]) { swap(a, j, j + gap); swapped = true; }","cmp"),L("    }"),L("}","done")],
      run(T){let gap=T.n,s=true;while(gap>1||s){gap=Math.max(1,Math.floor(gap/1.3));T.gap=gap;T.pass++;s=false;
        T.mark("gap","<code>gap = "+gap+"</code>"+(gap===1?": now it is plain bubble sort with a flag, finishing an almost sorted array.":": compare elements "+gap+" apart, so small values jump far to the left."));
        for(let j=0;j+gap<T.n;j++)if(T.cmp(j,j+gap,"cmp",{lab:["j","j+"+gap]})){T.swap(j,j+gap,"cmp");s=true;}}T.end();}}
  };
  const ORDER=["brute","standard","flag","lastswap","dowhile","rec","fullrec","generic","shaker","oddeven","comb"];


  /* ---------- every interview sort (v30) ---------- SRC holds the Java of each sort, copied from Sorts.java (compiled and
     checked against Arrays.sort on JDK 25) with "@key" line markers; run(T) mirrors that Java step by step.
     Flags: pos = draw bars by position (the sort writes values), w = count writes, rec = call stack, tree = heap tree,
     pl = pass counter label, prep = turn any input into a valid one (ranks for cyclic sort, 0/1/2 for the flag...). */
  const SRC={"selection":[["static void selectionSort(int[] a) {",""],["    int n = a.length;",""],["    for (int i = 0; i < n - 1; i++) {","pass"],["        int min = i;                                   // find the smallest of a[i..n-1]",""],["        for (int j = i + 1; j < n; j++)",""],["            if (a[j] < a[min]) min = j;","cmp"],["        if (min != i) swap(a, i, min);","swap"],["    }",""],["}",""]],"selStable":[["static void stableSelectionSort(int[] a) {",""],["    for (int i = 0; i < a.length - 1; i++) {","pass"],["        int min = i;",""],["        for (int j = i + 1; j < a.length; j++)",""],["            if (a[j] < a[min]) min = j;","cmp"],["        int key = a[min];","key"],["        while (min > i) {                              // shift right instead of swapping:",""],["            a[min] = a[min - 1];","shift"],["            min--;                                     // equal values keep their order",""],["        }",""],["        a[i] = key;","place"],["    }",""],["}",""]],"selDouble":[["static void doubleSelectionSort(int[] a) {",""],["    for (int lo = 0, hi = a.length - 1; lo < hi; lo++, hi--) {","pass"],["        int min = lo, max = lo;",""],["        for (int j = lo + 1; j <= hi; j++) {",""],["            if (a[j] < a[min]) min = j;","cmp"],["            if (a[j] > a[max]) max = j;","cmp2"],["        }",""],["        swap(a, lo, min);","swap"],["        if (max == lo) max = min;                      // the max was just moved to min's slot",""],["        swap(a, hi, max);","swap2"],["    }",""],["}",""]],"selRec":[["static void selectionRec(int[] a, int i) {","call"],["    if (i >= a.length - 1) return;","base"],["    int min = i;",""],["    for (int j = i + 1; j < a.length; j++)",""],["        if (a[j] < a[min]) min = j;","cmp"],["    if (min != i) swap(a, i, min);","swap"],["    selectionRec(a, i + 1);","recurse"],["}",""]],"insertion":[["static void insertionSort(int[] a) {",""],["    for (int i = 1; i < a.length; i++) {","pass"],["        int key = a[i];","key"],["        int j = i - 1;",""],["        while (j >= 0 && a[j] > key) {","cmp"],["            a[j + 1] = a[j];","shift"],["            j--;",""],["        }",""],["        a[j + 1] = key;","place"],["    }",""],["}",""]],"insSwap":[["static void insertionSortSwaps(int[] a) {",""],["    for (int i = 1; i < a.length; i++)","pass"],["        for (int j = i; j > 0 && a[j - 1] > a[j]; j--)","cmp"],["            swap(a, j - 1, j);","swap"],["}",""]],"insBinary":[["static void binaryInsertionSort(int[] a) {",""],["    for (int i = 1; i < a.length; i++) {","pass"],["        int key = a[i], lo = 0, hi = i;                // find the first index whose value > key",""],["        while (lo < hi) {",""],["            int mid = (lo + hi) >>> 1;",""],["            if (a[mid] <= key) lo = mid + 1;","cmp"],["            else hi = mid;                             // <= keeps it stable",""],["        }",""],["        System.arraycopy(a, lo, a, lo + 1, i - lo);","shift"],["        a[lo] = key;","place"],["    }",""],["}",""]],"insRec":[["static void insertionRec(int[] a, int n) {","call"],["    if (n <= 1) return;","base"],["    insertionRec(a, n - 1);","recurse"],["    int key = a[n - 1], j = n - 2;","key"],["    while (j >= 0 && a[j] > key) {","cmp"],["        a[j + 1] = a[j];","shift"],["        j--;",""],["    }",""],["    a[j + 1] = key;","place"],["}",""]],"shell":[["static void shellSort(int[] a) {",""],["    for (int gap = a.length / 2; gap > 0; gap /= 2)","gap"],["        for (int i = gap; i < a.length; i++) {         // insertion sort on every gap-th element",""],["            int key = a[i], j = i;","key"],["            while (j >= gap && a[j - gap] > key) {","cmp"],["                a[j] = a[j - gap];","shift"],["                j -= gap;",""],["            }",""],["            a[j] = key;","place"],["        }",""],["}",""]],"mergeTD":[["static void mergeSort(int[] a, int lo, int hi) {","call"],["    if (lo >= hi) return;","base"],["    int mid = (lo + hi) >>> 1;",""],["    mergeSort(a, lo, mid);","left"],["    mergeSort(a, mid + 1, hi);","right"],["    merge(a, lo, mid, hi);","merge"],["}",""]],"merge":[["static void merge(int[] a, int lo, int mid, int hi) {",""],["    int[] tmp = Arrays.copyOfRange(a, lo, hi + 1);","copy"],["    int i = 0, j = mid - lo + 1, k = lo;               // i walks the left half, j the right",""],["    while (i <= mid - lo && j <= hi - lo)",""],["        a[k++] = tmp[i] <= tmp[j] ? tmp[i++] : tmp[j++];","cmp"],["    while (i <= mid - lo) a[k++] = tmp[i++];","restL"],["    while (j <= hi - lo) a[k++] = tmp[j++];","restR"],["}",""]],"mergeBU":[["static void mergeSortBottomUp(int[] a) {",""],["    for (int width = 1; width < a.length; width *= 2)","pass"],["        for (int lo = 0; lo < a.length - width; lo += 2 * width) {",""],["            int hi = Math.min(lo + 2 * width - 1, a.length - 1);",""],["            merge(a, lo, lo + width - 1, hi);","merge"],["        }",""],["}",""]],"mergeInv":[["static long countInversions(int[] a, int lo, int hi) {","call"],["    if (lo >= hi) return 0;","base"],["    int mid = (lo + hi) >>> 1;",""],["    long inv = countInversions(a, lo, mid)","left"],["             + countInversions(a, mid + 1, hi);","right"],["    int[] tmp = Arrays.copyOfRange(a, lo, hi + 1);","copy"],["    int i = 0, j = mid - lo + 1, k = lo;",""],["    while (i <= mid - lo && j <= hi - lo) {",""],["        if (tmp[i] <= tmp[j]) a[k++] = tmp[i++];","cmp"],["        else {                                            // tmp[j] jumps over every left item still waiting:",""],["            inv += mid - lo + 1 - i;","inv"],["            a[k++] = tmp[j++];                            // each of them is a bigger value before it",""],["        }",""],["    }",""],["    while (i <= mid - lo) a[k++] = tmp[i++];","restL"],["    while (j <= hi - lo) a[k++] = tmp[j++];","restR"],["    return inv;",""],["}",""]],"timLite":[["static final int RUN = 4;                              // real TimSort: 32 to 64, and it finds natural runs",""],["static void timSortLite(int[] a) {",""],["    int n = a.length;",""],["    for (int lo = 0; lo < n; lo += RUN)","pass"],["        insertionRange(a, lo, Math.min(lo + RUN - 1, n - 1));",""],["    for (int width = RUN; width < n; width *= 2)","pass2"],["        for (int lo = 0; lo < n - width; lo += 2 * width)",""],["            merge(a, lo, lo + width - 1, Math.min(lo + 2 * width - 1, n - 1));","merge"],["}",""],["static void insertionRange(int[] a, int lo, int hi) {",""],["    for (int i = lo + 1; i <= hi; i++) {",""],["        int key = a[i], j = i - 1;","key"],["        while (j >= lo && a[j] > key) { a[j + 1] = a[j]; j--; }","icmp"],["        a[j + 1] = key;","place"],["    }",""],["}",""]],"quickL":[["static void quickSort(int[] a, int lo, int hi) {","call"],["    if (lo >= hi) return;","base"],["    int p = partition(a, lo, hi);","part"],["    quickSort(a, lo, p - 1);","left"],["    quickSort(a, p + 1, hi);","right"],["}",""]],"partition":[["static int partition(int[] a, int lo, int hi) {       // Lomuto: the pivot is the last element",""],["    int pivot = a[hi], i = lo;","pivot"],["    for (int j = lo; j < hi; j++)                      // a[lo..i-1] < pivot <= a[i..j-1]",""],["        if (a[j] < pivot) swap(a, i++, j);","cmp"],["    swap(a, i, hi);","place"],["    return i;                                          // the pivot's final index",""],["}",""]],"quickH":[["static void quickSortHoare(int[] a, int lo, int hi) {","call"],["    if (lo >= hi) return;","base"],["    int pivot = a[(lo + hi) >>> 1], i = lo - 1, j = hi + 1;","pivot"],["    while (true) {",""],["        do i++; while (a[i] < pivot);","cmpI"],["        do j--; while (a[j] > pivot);","cmpJ"],["        if (i >= j) break;","cross"],["        swap(a, i, j);","swap"],["    }",""],["    quickSortHoare(a, lo, j);","left"],["    quickSortHoare(a, j + 1, hi);","right"],["}",""]],"quickR":[["static final Random RNG = new Random();",""],["static void quickSortRandom(int[] a, int lo, int hi) {","call"],["    if (lo >= hi) return;","base"],["    swap(a, lo + RNG.nextInt(hi - lo + 1), hi);","rand"],["    int p = partition(a, lo, hi);","part"],["    quickSortRandom(a, lo, p - 1);","left"],["    quickSortRandom(a, p + 1, hi);","right"],["}",""]],"quick3":[["static void quickSort3Way(int[] a, int lo, int hi) {","call"],["    if (lo >= hi) return;","base"],["    int pivot = a[lo], lt = lo, i = lo + 1, gt = hi;","pivot"],["    while (i <= gt) {                                  // a[lo..lt-1] < pivot, a[lt..i-1] == pivot, a[gt+1..hi] > pivot",""],["        if (a[i] < pivot) swap(a, lt++, i++);","lt"],["        else if (a[i] > pivot) swap(a, i, gt--);","gt"],["        else i++;","eq"],["    }",""],["    quickSort3Way(a, lo, lt - 1);","left"],["    quickSort3Way(a, gt + 1, hi);","right"],["}",""]],"qselect":[["static int quickSelect(int[] a, int k) {              // the k-th smallest value, k counted from 0",""],["    int lo = 0, hi = a.length - 1;",""],["    while (lo < hi) {","loop"],["        int p = partition(a, lo, hi);","part"],["        if (p == k) return a[k];","found"],["        if (p < k) lo = p + 1; else hi = p - 1;","narrow"],["    }",""],["    return a[k];","found2"],["}",""]],"heap":[["static void heapSort(int[] a) {",""],["    int n = a.length;",""],["    for (int i = n / 2 - 1; i >= 0; i--)","build"],["        siftDown(a, i, n);                             // 1. build a max-heap bottom-up: O(n)",""],["    for (int end = n - 1; end > 0; end--) {",""],["        swap(a, 0, end);","swap"],["        siftDown(a, 0, end);","sift"],["    }",""],["}",""]],"siftDown":[["static void siftDown(int[] a, int i, int n) {         // push a[i] down until both children are smaller",""],["    while (2 * i + 1 < n) {","loop"],["        int c = 2 * i + 1;                             // left child",""],["        if (c + 1 < n && a[c + 1] > a[c]) c++;","child"],["        if (a[i] >= a[c]) return;","cmp"],["        swap(a, i, c);","down"],["        i = c;",""],["    }",""],["}",""]],"heapRec":[["static void heapSortRec(int[] a) {",""],["    for (int i = a.length / 2 - 1; i >= 0; i--) heapify(a, i, a.length);","build"],["    for (int end = a.length - 1; end > 0; end--) {",""],["        swap(a, 0, end);","swap"],["        heapify(a, 0, end);","sift"],["    }",""],["}",""],["static void heapify(int[] a, int i, int n) {","call"],["    int big = i, l = 2 * i + 1, r = 2 * i + 2;",""],["    if (l < n && a[l] > a[big]) big = l;","child"],["    if (r < n && a[r] > a[big]) big = r;","cmp"],["    if (big != i) {",""],["        swap(a, i, big);","down"],["        heapify(a, big, n);","recurse"],["    }",""],["}",""]],"heapUp":[["static void heapSortSiftUp(int[] a) {",""],["    for (int k = 1; k < a.length; k++) {","insert"],["        int c = k;                                     // insert a[k] into the heap a[0..k-1]",""],["        while (c > 0 && a[(c - 1) / 2] < a[c]) {","cmp"],["            swap(a, c, (c - 1) / 2);","up"],["            c = (c - 1) / 2;",""],["        }",""],["    }",""],["    for (int end = a.length - 1; end > 0; end--) {",""],["        swap(a, 0, end);","swap"],["        siftDown(a, 0, end);","sift"],["    }",""],["}",""]],"counting":[["static void countingSort(int[] a, int max) {          // values 0..max",""],["    int[] count = new int[max + 1];",""],["    for (int x : a) count[x]++;","count"],["    int k = 0;",""],["    for (int v = 0; v <= max; v++)",""],["        while (count[v]-- > 0) a[k++] = v;","write"],["}",""]],"countStable":[["static int[] countingSortStable(int[] a, int max) {",""],["    int[] count = new int[max + 1];",""],["    for (int x : a) count[x]++;","count"],["    for (int v = 1; v <= max; v++)",""],["        count[v] += count[v - 1];","prefix"],["    int[] out = new int[a.length];                     // count[v] = how many values are <= v",""],["    for (int i = a.length - 1; i >= 0; i--)            // right to left keeps equal keys in order",""],["        out[--count[a[i]]] = a[i];","place"],["    return out;",""],["}",""]],"radix":[["static void radixSort(int[] a) {                      // non-negative ints, least significant digit first",""],["    int max = Arrays.stream(a).max().orElse(0);",""],["    for (int exp = 1; max / exp > 0; exp *= 10) {","digit"],["        int[] count = new int[10], out = new int[a.length];",""],["        for (int x : a) count[(x / exp) % 10]++;",""],["        for (int d = 1; d < 10; d++) count[d] += count[d - 1];",""],["        for (int i = a.length - 1; i >= 0; i--)        // a stable counting sort on this digit",""],["            out[--count[(a[i] / exp) % 10]] = a[i];","place"],["        System.arraycopy(out, 0, a, 0, a.length);","copy"],["    }",""],["}",""]],"bucket":[["static void bucketSort(int[] a, int max) {            // values 0..max, spread evenly",""],["    int n = a.length;",""],["    List<List<Integer>> buckets = new ArrayList<>();",""],["    for (int b = 0; b < n; b++) buckets.add(new ArrayList<>());",""],["    for (int x : a)",""],["        buckets.get((int) ((long) x * n / (max + 1))).add(x);","scatter"],["    int k = 0;",""],["    for (List<Integer> b : buckets) {",""],["        Collections.sort(b);","sortb"],["        for (int x : b) a[k++] = x;","gather"],["    }",""],["}",""]],"cyclic":[["static void cyclicSort(int[] a) {                     // values are 1..n",""],["    int i = 0;",""],["    while (i < a.length) {",""],["        int target = a[i] - 1;","cmp"],["        if (a[i] != a[target]) swap(a, i, target);","swap"],["        else i++;","next"],["    }",""],["}",""]],"dnf":[["static void sortColors(int[] a) {                     // values 0, 1, 2 (LeetCode 75)",""],["    int lo = 0, mid = 0, hi = a.length - 1;",""],["    while (mid <= hi) {",""],["        if (a[mid] == 0) swap(a, lo++, mid++);","zero"],["        else if (a[mid] == 2) swap(a, mid, hi--);","two"],["        else mid++;","one"],["    }",""],["}",""]]};
  const C=(...ks)=>ks.flatMap((k,i)=>(i?[["",""]]:[]).concat(SRC[k]));
  const rank=a=>{const r=Array(a.length);a.map((v,i)=>[v,i]).sort((x,y)=>x[0]-y[0]||x[1]-y[1]).forEach(([,i],k)=>r[i]=k+1);return r;};
  const keyPanel=(e,t)=>[{t:"arr",title:t||"key (lifted out)",vals:[e.v]}];
  function partJ(T,lo,hi){const pv=T.a[hi].v;T.pv=hi;let i=lo;T.P={i};
    T.mark("pivot","Partition a["+lo+".."+hi+"] around <b>pivot = a["+hi+"] = "+pv+"</b> (Lomuto). Values smaller than the pivot are collected left of <code>i</code>.");
    for(let j=lo;j<hi;j++){T.P={i,j};if(T.testv(j,pv,"<","cmp",{n1:"a[j]",vn:"pivot",yes:" Smaller: swap it to a[i], then i++.",no:" Not smaller: leave it on the right side."})){T.swap(i,j,"cmp");i++;T.P={i,j};}}
    T.P={i};if(i!==hi)T.swap(i,hi,"place","Swap the pivot into a["+i+"]: everything left of it is smaller, everything right is not. <b>Index "+i+" is final.</b>");
    else T.mark("place","The pivot is already at index "+i+": it is final.");T.pv=i;T.done(i);return i;}
  function mergeJ(T,lo,mid,hi,o){o=o||{};const tmp=T.a.slice(lo,hi+1).map(e=>Object.assign({},e)),L=mid-lo+1,R=hi-lo;let i=0,j=L,k=lo;
    const ax=()=>{const mk={};if(i<L)mk[i]="i";if(j<=R)mk[j]="j";T.aux=[{t:"arr",title:"tmp = copy of a["+lo+".."+hi+"]  ·  left | right",vals:tmp.map(e=>e.v),idx:tmp.map((_,q)=>q),hot:[i<L?i:-1,j<=R?j:-1],split:L,mark:mk}];};
    T.rg=[lo,hi];ax();T.P={k};T.mark("copy","Copy a["+lo+".."+hi+"] into <code>tmp</code>: the left half is tmp[0.."+(L-1)+"], the right half tmp["+L+".."+R+"]. Both are already sorted.");
    while(i<L&&j<=R){T.comps++;const tl=tmp[i].v<=tmp[j].v,e=tl?tmp[i]:tmp[j],jump=L-i;
      let m="tmp[i] = "+tmp[i].v+(tl?" ≤ ":" &gt; ")+"tmp[j] = "+tmp[j].v+": take the "+(tl?"left":"right")+" one, <code>a["+k+"] = "+e.v+"</code>."+(tl&&tmp[i].v===tmp[j].v?" On a tie the left one goes first: that keeps merge sort stable.":"");
      if(!tl&&o.inv){T.inv+=jump;m+=" It jumps over "+jump+" waiting left value"+(jump>1?"s":"")+", each bigger than it: <b>+"+jump+" inversion"+(jump>1?"s":"")+"</b>.";}
      if(tl)i++;else j++;ax();T.P={k};T.set(k,e,!tl&&o.inv?"inv":"cmp",m);k++;}
    while(i<L){const e=tmp[i++];ax();T.P={k};T.set(k,e,"restL","The right half is used up: copy the rest of the left half, a["+k+"] = "+e.v+".");k++;}
    while(j<=R){const e=tmp[j++];ax();T.P={k};T.set(k,e,"restR","The left half is used up: copy the rest of the right half, a["+k+"] = "+e.v+".");k++;}
    T.aux=null;T.P={};}
  function siftJ(T,i,n){while(2*i+1<n){let c=2*i+1;T.P={i,c};
      if(c+1<n&&T.test(c+1,c,">","child",{n1:"right child a["+(c+1)+"]",n2:"left child a["+c+"]",yes:" Follow the right child.",no:" Follow the left child."}))c++;
      T.P={i,c};if(T.test(i,c,">=","cmp",{n1:"parent a["+i+"]",n2:"child a["+c+"]",yes:" The parent is bigger: the heap is fixed, return.",no:" The child is bigger: swap and keep sinking."}))return;
      T.swap(i,c,"down");i=c;}T.P={};}
  function heapPhase(T,n,sink){for(let end=n-1;end>0;end--){T.P={};T.swap(0,end,"swap","Swap the maximum a[0] with a["+end+"]: it is now in its <b>final place</b>.");T.done(end);T.hs=end;
      T.mark("sift","The heap shrinks to a[0.."+(end-1)+"]. Sift the new root down to restore it.");sink(end);}T.done(0);T.hs=0;}
  function insertKey(T,key,j,lo,step,shiftKey,cmpKey){step=step||1;
    while(j>=lo){T.P={j};if(!T.testv(j,key.v,">",cmpKey||"cmp",{n1:"a["+j+"]",vn:"key",yes:" Bigger than the key: shift it right.",no:" Not bigger: the key belongs right after it."}))break;
      T.set(j+step,T.get(j),shiftKey||"shift","Shift a["+j+"] = "+T.a[j].v+" right to a["+(j+step)+"].");j-=step;}return j;}
  Object.assign(VAR,{
    sel_std:{n:"Selection sort",code:C("selection"),pl:"Pass",run(T){const n=T.n;for(let i=0;i<n-1;i++){T.pass=i+1;let min=i;T.P={i,min};
        T.mark("pass","Pass "+(i+1)+": find the smallest value in a["+i+".."+(n-1)+"]. Start with <code>min = "+i+"</code>.");
        for(let j=i+1;j<n;j++){T.P={i,j,min};if(T.test(j,min,"<","cmp",{n1:"a[j]",n2:"a[min]",yes:" New minimum: <code>min = "+j+"</code>."}))min=j;}
        T.P={i,min};if(min!==i)T.swap(i,min,"swap","Swap the minimum "+T.a[min].v+" into a["+i+"]. Index "+i+" is <b>final</b>.");else T.mark("swap","The minimum is already at index "+i+": no swap.");T.done(i);}T.end();}},
    sel_stable:{n:"Stable selection sort",code:C("selStable"),pos:1,w:1,pl:"Pass",run(T){const n=T.n;for(let i=0;i<n-1;i++){T.pass=i+1;let min=i;T.P={i,min};T.mark("pass","Pass "+(i+1)+": find the smallest of a["+i+".."+(n-1)+"].");
        for(let j=i+1;j<n;j++){T.P={i,j,min};if(T.test(j,min,"<","cmp",{n1:"a[j]",n2:"a[min]",yes:" New minimum."}))min=j;}
        const key=T.get(min);T.aux=keyPanel(key,"key = a[min]");T.P={i,min};T.mark("key","Take out the minimum "+key.v+". Instead of swapping (which can jump over an equal value), shift a["+i+".."+(min-1)+"] one place right.");
        while(min>i){T.P={i,min};T.set(min,T.get(min-1),"shift","a["+min+"] = a["+(min-1)+"] = "+T.a[min-1].v+".");min--;}
        T.set(i,key,"place","Put the minimum into a["+i+"]. Equal values kept their order: <b>stable</b>.");T.aux=null;T.done(i);}T.end();}},
    sel_double:{n:"Double selection (min and max)",code:C("selDouble"),pl:"Pass",run(T){for(let lo=0,hi=T.n-1;lo<hi;lo++,hi--){T.pass++;let min=lo,max=lo;T.P={lo,hi};
        T.mark("pass","Pass "+T.pass+": find both the minimum and the maximum of a["+lo+".."+hi+"] in one walk.");
        for(let j=lo+1;j<=hi;j++){T.P={j,min,max};if(T.test(j,min,"<","cmp",{n1:"a[j]",n2:"a[min]",yes:" New minimum."}))min=j;T.P={j,min,max};if(T.test(j,max,">","cmp2",{n1:"a[j]",n2:"a[max]",yes:" New maximum."}))max=j;}
        T.P={lo,hi,min,max};if(lo!==min)T.swap(lo,min,"swap","Minimum to the front, a["+lo+"].");else T.mark("swap","The minimum is already at a["+lo+"].");
        if(max===lo){max=min;T.P={lo,hi,max};T.mark("swap","The maximum was at lo, so it just moved to index "+min+": <code>max = min</code>.");}
        if(hi!==max)T.swap(hi,max,"swap2","Maximum to the back, a["+hi+"].");else T.mark("swap2","The maximum is already at a["+hi+"].");T.done(lo);T.done(hi);}T.end();}},
    sel_rec:{n:"Recursive selection sort",code:C("selRec"),rec:1,run(T){const n=T.n;const go=i=>{T.push("selectionRec(a, "+i+")");T.mark("call","Call <code>selectionRec(a, "+i+")</code>: a[0.."+(i-1)+"] is done; handle index "+i+".");
        if(i>=n-1){T.done(i);T.mark("base","i = "+i+": only the last element is left, so it is in place. Return.");T.pop();return;}
        let min=i;for(let j=i+1;j<n;j++){T.P={i,j,min};if(T.test(j,min,"<","cmp",{n1:"a[j]",n2:"a[min]",yes:" New minimum."}))min=j;}T.P={i,min};
        if(min!==i)T.swap(i,min,"swap");else T.mark("swap","Already the minimum.");T.done(i);T.P={};T.mark("recurse","Recurse on the rest: <code>selectionRec(a, "+(i+1)+")</code>.");go(i+1);T.pop();};go(0);T.end();}},

    ins_shift:{n:"Insertion sort (shifting)",code:C("insertion"),pos:1,w:1,pl:"Pass",run(T){for(let i=1;i<T.n;i++){T.pass=i;T.rg=[0,i];const key=T.get(i);T.aux=keyPanel(key);T.P={i};
        T.mark("key","a[0.."+(i-1)+"] is sorted. Lift out <code>key = a["+i+"] = "+key.v+"</code> and walk left to find its place.");
        const j=insertKey(T,key,i-1,0);T.P={};T.set(j+1,key,"place","Drop the key into <code>a["+(j+1)+"]</code>. Now a[0.."+i+"] is sorted.");T.aux=null;}T.rg=null;T.end();}},
    ins_swap:{n:"Insertion sort (swapping)",code:C("insSwap"),pl:"Pass",run(T){for(let i=1;i<T.n;i++){T.pass=i;T.rg=[0,i];T.P={i};T.mark("pass","Insert a["+i+"] = "+T.a[i].v+" into the sorted a[0.."+(i-1)+"] by swapping it left.");
        for(let j=i;j>0;j--){T.P={j};if(!T.test(j-1,j,">","cmp",{n1:"a[j-1]",n2:"a[j]",yes:" Out of order: swap.",no:" In order: stop."}))break;T.swap(j-1,j,"swap");}}T.rg=null;T.end();}},
    ins_bin:{n:"Binary insertion sort",code:C("insBinary"),pos:1,w:1,pl:"Pass",run(T){for(let i=1;i<T.n;i++){T.pass=i;T.rg=[0,i];const key=T.get(i);T.aux=keyPanel(key);let lo=0,hi=i;T.P={lo,hi};
        T.mark("pass","key = a["+i+"] = "+key.v+". <b>Binary search</b> a[0.."+(i-1)+"] for the first value bigger than the key.");
        while(lo<hi){const mid=(lo+hi)>>1;T.P={lo,mid,hi};if(T.testv(mid,key.v,"<=","cmp",{n1:"a[mid]",vn:"key",yes:" Go right: lo = mid + 1.",no:" Go left: hi = mid."}))lo=mid+1;else hi=mid;}
        T.P={lo};for(let q=i;q>lo;q--)T.set(q,T.get(q-1),"shift","<code>System.arraycopy</code> moves a["+(q-1)+"] right to a["+q+"].");
        T.set(lo,key,"place","Put the key at a["+lo+"]. Only O(log i) comparisons, but the shifting still costs O(i).");T.aux=null;}T.rg=null;T.end();}},
    ins_rec:{n:"Recursive insertion sort",code:C("insRec"),pos:1,w:1,rec:1,run(T){const go=n=>{T.push("insertionRec(a, "+n+")");T.mark("call","Call <code>insertionRec(a, "+n+")</code>.");
        if(n<=1){T.mark("base","n ≤ 1: one element is sorted. Return.");T.pop();return;}T.mark("recurse","First sort the first "+(n-1)+" elements.");go(n-1);
        T.rg=[0,n-1];const key=T.get(n-1);T.aux=keyPanel(key);T.P={};T.mark("key","Back in <code>insertionRec(a, "+n+")</code>: a[0.."+(n-2)+"] is sorted. Insert <code>key = a["+(n-1)+"] = "+key.v+"</code>.");
        const j=insertKey(T,key,n-2,0);T.set(j+1,key,"place","Drop the key into a["+(j+1)+"]. a[0.."+(n-1)+"] is sorted; return.");T.aux=null;T.pop();};go(T.n);T.rg=null;T.end();}},
    shell:{n:"Shell sort (gap insertion)",code:C("shell"),pos:1,w:1,run(T){const n=T.n;for(let gap=n>>1;gap>0;gap>>=1){T.gap=gap;T.pass++;
        T.mark("gap","<code>gap = "+gap+"</code>: insertion sort on elements "+gap+" apart"+(gap===1?". This is plain insertion sort, on an array that is now almost sorted.":", so small values jump far left."));
        for(let i=gap;i<n;i++){const key=T.get(i);T.aux=keyPanel(key);T.P={i};T.mark("key","key = a["+i+"] = "+key.v+".");
          let j=i;while(j>=gap){T.P={i,j};if(!T.testv(j-gap,key.v,">","cmp",{n1:"a[j-gap]",vn:"key",yes:" Shift it "+gap+" places right.",no:" Stop."}))break;T.set(j,T.get(j-gap),"shift","a["+j+"] = a["+(j-gap)+"] = "+T.a[j-gap].v+".");j-=gap;}
          T.set(j,key,"place","Put the key at a["+j+"].");T.aux=null;}}T.end();}},

    m_td:{n:"Merge sort (top-down, recursive)",code:C("mergeTD","merge"),pos:1,w:1,rec:1,run(T){const go=(lo,hi)=>{T.push("mergeSort(a, "+lo+", "+hi+")");T.rg=[lo,hi];T.P={};
        T.mark("call","<code>mergeSort(a, "+lo+", "+hi+")</code>: sort a["+lo+".."+hi+"].");if(lo>=hi){T.mark("base","One element is already sorted: return.");T.pop();return;}
        const mid=(lo+hi)>>1;T.mark("left","Split at <code>mid = "+mid+"</code>. First sort the left half a["+lo+".."+mid+"].");go(lo,mid);
        T.rg=[lo,hi];T.mark("right","Now sort the right half a["+(mid+1)+".."+hi+"].");go(mid+1,hi);
        T.rg=[lo,hi];T.mark("merge","Both halves are sorted: merge them.");mergeJ(T,lo,mid,hi);T.rg=[lo,hi];T.pop();};go(0,T.n-1);T.end();}},
    m_bu:{n:"Merge sort (bottom-up, iterative)",code:C("mergeBU","merge"),pos:1,w:1,pl:"Width pass",run(T){const n=T.n;for(let w=1;w<n;w*=2){T.pass++;T.rg=null;
        T.mark("pass","<code>width = "+w+"</code>: merge neighbouring sorted runs of "+w+" into runs of "+(2*w)+". No recursion, no call stack.");
        for(let lo=0;lo<n-w;lo+=2*w){const hi=Math.min(lo+2*w-1,n-1);T.rg=[lo,hi];T.mark("merge","Merge a["+lo+".."+(lo+w-1)+"] with a["+(lo+w)+".."+hi+"].");mergeJ(T,lo,lo+w-1,hi);}}T.end();}},
    m_inv:{n:"Merge sort + counting inversions",code:C("mergeInv"),pos:1,w:1,rec:1,inv:1,run(T){T.invOn=true;const go=(lo,hi)=>{T.push("countInversions(a, "+lo+", "+hi+")");T.rg=[lo,hi];T.P={};
        T.mark("call","<code>countInversions(a, "+lo+", "+hi+")</code>.");if(lo>=hi){T.mark("base","One element: 0 inversions.");T.pop();return;}
        const mid=(lo+hi)>>1;T.mark("left","Count inside the left half a["+lo+".."+mid+"] first.");go(lo,mid);T.rg=[lo,hi];T.mark("right","Then inside the right half a["+(mid+1)+".."+hi+"].");go(mid+1,hi);
        T.rg=[lo,hi];mergeJ(T,lo,mid,hi,{inv:true});T.pop();};go(0,T.n-1);T.end();}},
    tim:{n:"TimSort idea (insertion runs + merge)",code:C("timLite","merge"),pos:1,w:1,pl:"Phase",run(T){const n=T.n,R=4;T.pass=1;
        for(let lo=0;lo<n;lo+=R){const hi=Math.min(lo+R-1,n-1);T.rg=[lo,hi];T.P={};T.mark("pass","Phase 1: insertion-sort the small run a["+lo+".."+hi+"] (RUN = "+R+"; real TimSort uses 32–64).");
          for(let i=lo+1;i<=hi;i++){const key=T.get(i);T.aux=keyPanel(key);T.P={i};T.mark("key","key = a["+i+"] = "+key.v+".");const j=insertKey(T,key,i-1,lo,1,"icmp","icmp");T.set(j+1,key,"place","Drop the key into a["+(j+1)+"].");T.aux=null;}}
        for(let w=R;w<n;w*=2){T.pass++;T.rg=null;T.mark("pass2","Phase 2: merge runs of "+w+" into runs of "+(2*w)+".");
          for(let lo=0;lo<n-w;lo+=2*w){const hi=Math.min(lo+2*w-1,n-1);T.rg=[lo,hi];T.mark("merge","Merge a["+lo+".."+(lo+w-1)+"] with a["+(lo+w)+".."+hi+"].");mergeJ(T,lo,lo+w-1,hi);}}T.end();}},

    q_l:{n:"Quick sort (Lomuto, last pivot)",code:C("quickL","partition"),rec:1,run(T){const go=(lo,hi)=>{T.push("quickSort(a, "+lo+", "+hi+")");T.rg=[lo,hi];T.P={};T.pv=null;
        T.mark("call","<code>quickSort(a, "+lo+", "+hi+")</code>.");if(lo>=hi){if(lo===hi)T.done(lo);T.mark("base",lo===hi?"One element: it is in its final place.":"Empty range: return.");T.pop();return;}
        T.mark("part","Partition a["+lo+".."+hi+"].");const p=partJ(T,lo,hi);T.rg=[lo,hi];T.P={p};T.mark("left","Pivot fixed at "+p+". Sort the left part a["+lo+".."+(p-1)+"].");go(lo,p-1);
        T.rg=[lo,hi];T.P={p};T.mark("right","Sort the right part a["+(p+1)+".."+hi+"].");go(p+1,hi);T.pop();};go(0,T.n-1);T.end();}},
    q_h:{n:"Quick sort (Hoare, middle pivot)",code:C("quickH"),rec:1,run(T){const go=(lo,hi)=>{T.push("quickSortHoare(a, "+lo+", "+hi+")");T.rg=[lo,hi];T.P={};T.pv=null;
        T.mark("call","<code>quickSortHoare(a, "+lo+", "+hi+")</code>.");if(lo>=hi){if(lo===hi)T.done(lo);T.mark("base",lo===hi?"One element: in place.":"Empty: return.");T.pop();return;}
        const m=(lo+hi)>>1,pv=T.a[m].v;let i=lo-1,j=hi+1;T.pv=m;T.mark("pivot","Hoare partition. <b>pivot = a["+m+"] = "+pv+"</b> (the middle). i walks right, j walks left; they stop at values on the wrong side.");T.pv=null;
        for(;;){do{i++;T.P={i,j:j<=hi?j:null};}while(T.testv(i,pv,"<","cmpI",{n1:"a[i]",vn:"pivot",yes:" Keep walking right."}));
          do{j--;T.P={i,j};}while(T.testv(j,pv,">","cmpJ",{n1:"a[j]",vn:"pivot",yes:" Keep walking left."}));
          if(i>=j){T.mark("cross","i = "+i+" ≥ j = "+j+": the pointers crossed. Everything in a["+lo+".."+j+"] ≤ pivot ≤ everything in a["+(j+1)+".."+hi+"].");break;}
          T.swap(i,j,"swap","Both stopped on the wrong side: swap a["+i+"] and a["+j+"].");}
        T.P={};T.mark("left","Recurse on a["+lo+".."+j+"].");go(lo,j);T.rg=[lo,hi];T.mark("right","Recurse on a["+(j+1)+".."+hi+"].");go(j+1,hi);T.pop();};go(0,T.n-1);T.end();}},
    q_r:{n:"Quick sort (random pivot)",code:C("quickR","partition"),rec:1,run(T){const go=(lo,hi)=>{T.push("quickSortRandom(a, "+lo+", "+hi+")");T.rg=[lo,hi];T.P={};T.pv=null;
        T.mark("call","<code>quickSortRandom(a, "+lo+", "+hi+")</code>.");if(lo>=hi){if(lo===hi)T.done(lo);T.mark("base",lo===hi?"One element: in place.":"Empty: return.");T.pop();return;}
        const r=lo+Math.floor(Math.random()*(hi-lo+1));T.P={r};if(r!==hi)T.swap(r,hi,"rand","Random pivot: swap a["+r+"] = "+T.a[r].v+" to the end. No input can be the worst case every time.");else T.mark("rand","The random index is "+hi+": the pivot stays put.");
        T.mark("part","Partition a["+lo+".."+hi+"].");const p=partJ(T,lo,hi);T.rg=[lo,hi];T.P={p};T.mark("left","Sort the left part a["+lo+".."+(p-1)+"].");go(lo,p-1);T.rg=[lo,hi];T.mark("right","Sort the right part a["+(p+1)+".."+hi+"].");go(p+1,hi);T.pop();};go(0,T.n-1);T.end();}},
    q_3:{n:"Quick sort (3-way, many duplicates)",code:C("quick3"),rec:1,run(T){const go=(lo,hi)=>{T.push("quickSort3Way(a, "+lo+", "+hi+")");T.rg=[lo,hi];T.P={};T.pv=null;
        T.mark("call","<code>quickSort3Way(a, "+lo+", "+hi+")</code>.");if(lo>=hi){if(lo===hi)T.done(lo);T.mark("base",lo===hi?"One element: in place.":"Empty: return.");T.pop();return;}
        const pv=T.a[lo].v;let lt=lo,i=lo+1,gt=hi;const P=()=>{T.P={lt,i:i<=hi?i:null,gt};};P();
        T.mark("pivot","3-way partition around <b>pivot = "+pv+"</b>: [ &lt; pivot | = pivot | unknown | &gt; pivot ].");
        while(i<=gt){P();if(T.testv(i,pv,"<","lt",{n1:"a[i]",vn:"pivot",yes:" Smaller: swap it into the &lt; zone, lt++ and i++."})){T.swap(lt,i,"lt");lt++;i++;}
          else if(T.testv(i,pv,">","gt",{n1:"a[i]",vn:"pivot",yes:" Bigger: swap it to the &gt; zone, gt--. Don't move i: the new a[i] is unchecked."})){T.swap(i,gt,"gt");gt--;}
          else{i++;P();T.mark("eq","Equal to the pivot: it stays in the = zone, i++.");}}
        for(let x=lt;x<=gt;x++)T.done(x);T.P={};T.mark("left","a["+lt+".."+gt+"] all equal "+pv+": <b>final, never touched again</b>. Recurse on the &lt; part.");go(lo,lt-1);
        T.rg=[lo,hi];T.mark("right","Recurse on the &gt; part a["+(gt+1)+".."+hi+"].");go(gt+1,hi);T.pop();};go(0,T.n-1);T.end();}},
    q_sel:{n:"Quickselect (k-th smallest)",code:C("qselect","partition"),run(T){const k=(T.n-1)>>1;let lo=0,hi=T.n-1;T.keep={k};
        T.mark("loop","Find the k-th smallest value, <code>k = "+k+"</code> (the median), without sorting the whole array.");
        while(lo<hi){T.rg=[lo,hi];T.pv=null;T.mark("loop","Search a["+lo+".."+hi+"].");const p=partJ(T,lo,hi);
          if(p===k){T.rg=null;T.mark("found","The pivot landed exactly at k = "+k+": <b>a[k] = "+T.a[k].v+"</b> is the answer. "+T.comps+" comparisons; average O(n), because each step keeps only one side.");return;}
          if(p<k){lo=p+1;T.mark("narrow","p = "+p+" &lt; k: the answer is to the right. <code>lo = "+lo+"</code>; the left part is never touched again.");}
          else{hi=p-1;T.mark("narrow","p = "+p+" &gt; k: the answer is to the left. <code>hi = "+hi+"</code>.");}}
        T.done(k);T.rg=null;T.mark("found2","lo == hi == k: <b>a[k] = "+T.a[k].v+"</b> is the "+(k+1)+"th smallest. "+T.comps+" comparisons.");}},

    h_std:{n:"Heap sort (sift-down)",code:C("heap","siftDown"),tree:1,run(T){const n=T.n;T.hs=n;
        for(let i=(n>>1)-1;i>=0;i--){T.P={i};T.mark("build","Build the max-heap: <code>siftDown(a, "+i+", "+n+")</code>. Leaves (index ≥ "+(n>>1)+") are already heaps.");siftJ(T,i,n);}
        T.P={};T.mark("build","<b>Max-heap built</b> in O(n): every parent ≥ its children, so the maximum "+T.a[0].v+" is at the root a[0].");heapPhase(T,n,end=>siftJ(T,0,end));T.end();}},
    h_rec:{n:"Heap sort (recursive heapify)",code:C("heapRec"),tree:1,rec:1,run(T){const n=T.n;T.hs=n;
        const hp=(i,m)=>{T.push("heapify(a, "+i+", "+m+")");let big=i;const l=2*i+1,r=2*i+2;T.P={i,l:l<m?l:null,r:r<m?r:null};
          if(l<m&&T.test(l,big,">","child",{n1:"a[l]",n2:"a[big]",yes:" big = l."}))big=l;
          if(r<m&&T.test(r,big,">","cmp",{n1:"a[r]",n2:"a[big]",yes:" big = r."}))big=r;
          if(big!==i){T.swap(i,big,"down");T.mark("recurse","Recurse where the small value went: <code>heapify(a, "+big+", "+m+")</code>.");hp(big,m);}
          else T.mark("call","a["+i+"] is the largest in its family: nothing to fix, return.");T.pop();};
        for(let i=(n>>1)-1;i>=0;i--){T.P={i};T.mark("build","Build: <code>heapify(a, "+i+", "+n+")</code>.");hp(i,n);}
        T.P={};T.mark("build","<b>Max-heap built.</b>");heapPhase(T,n,end=>hp(0,end));T.end();}},
    h_up:{n:"Heap sort (build by sift-up)",code:C("heapUp","siftDown"),tree:1,run(T){const n=T.n;T.hs=1;
        for(let k=1;k<n;k++){T.hs=k+1;T.P={k};T.mark("insert","Insert a["+k+"] = "+T.a[k].v+" into the heap a[0.."+(k-1)+"]: let it bubble up.");let c=k;
          while(c>0){const p=(c-1)>>1;T.P={c,parent:p};if(!T.test(p,c,"<","cmp",{n1:"parent a["+p+"]",n2:"a["+c+"]",yes:" The child is bigger: swap up.",no:" The parent is bigger: stop."}))break;T.swap(c,p,"up");c=p;}}
        T.P={};T.mark("insert","<b>Max-heap built</b> by n inserts: O(n log n), slower than bottom-up sift-down (O(n)).");heapPhase(T,n,end=>siftJ(T,0,end));T.end();}},

    c_simple:{n:"Counting sort (simple)",code:C("counting"),pos:1,w:1,noSwap:1,prep:a=>a.every(v=>v>=0&&v<=9)?a:a.map(v=>Math.max(0,Math.min(9,Math.floor(Math.abs(v)/10)))),
      run(T){const cnt=Array(10).fill(0);const ax=h=>{T.aux=[{t:"arr",title:"count[v] for v = 0 … 9",vals:cnt.slice(),idx:cnt.map((_,v)=>v),hot:h==null?[]:[h]}];};
        ax();T.mark("count","Make <code>count = new int[10]</code>: one counter per possible value. No comparisons in this sort.");
        for(let i=0;i<T.n;i++){const v=T.a[i].v;cnt[v]++;T.P={i};ax(v);T.mark("count","a["+i+"] = "+v+": <code>count["+v+"]++</code> → "+cnt[v]+".");}
        let k=0;T.P={};for(let v=0;v<=9;v++)while(cnt[v]>0){cnt[v]--;ax(v);T.P={k};T.set(k,{v,t:""},"write","Write "+v+" into a["+k+"] (count["+v+"] left: "+cnt[v]+").");k++;}T.end();}},
    c_stable:{n:"Counting sort (stable, prefix sums)",code:C("countStable"),pos:1,w:1,noSwap:1,prep:a=>a.every(v=>v>=0&&v<=9)?a:a.map(v=>Math.max(0,Math.min(9,Math.floor(Math.abs(v)/10)))),
      run(T){const n=T.n,cnt=Array(10).fill(0),out=Array(n).fill(null);const ax=(h,o)=>{T.aux=[{t:"arr",title:"count[v]",vals:cnt.slice(),idx:cnt.map((_,v)=>v),hot:h==null?[]:[h]},{t:"arr",title:"out",vals:out.map(e=>e?e.v:"·"),idx:out.map((_,q)=>q),hot:o==null?[]:[o]}];};
        ax();T.mark("count","Count every value.");for(let i=0;i<n;i++){const v=T.a[i].v;cnt[v]++;T.P={i};ax(v);T.mark("count","a["+i+"] = "+v+": count["+v+"]++.");}
        T.P={};for(let v=1;v<=9;v++){cnt[v]+=cnt[v-1];ax(v);T.mark("prefix","Prefix sum: <code>count["+v+"] += count["+(v-1)+"]</code> → "+cnt[v]+" values are ≤ "+v+".");}
        for(let i=n-1;i>=0;i--){const e=T.a[i],p=--cnt[e.v];out[p]=e;T.writes++;T.P={i};ax(e.v,p);T.mark("place","a["+i+"] = "+e.v+" goes to <code>out[--count["+e.v+"]]</code> = out["+p+"]. Walking right to left keeps equal values in their input order: <b>stable</b>.");}
        out.forEach((e,q)=>T.a[q]=Object.assign({},e));T.P={};ax();T.mark("place","<code>out</code> is the sorted array (shown in the bars now).");T.end();}},
    radix:{n:"Radix sort (LSD, base 10)",code:C("radix"),pos:1,w:1,noSwap:1,pl:"Digit pass",prep:a=>{const b=a.map(v=>Math.abs(v)%1000);return Math.max(...b)<100?b.map(v=>v*10+v%10):b;},
      run(T){const max=Math.max(...T.a.map(e=>e.v));for(let exp=1;Math.floor(max/exp)>0;exp*=10){T.pass++;const nm=exp===1?"ones":exp===10?"tens":exp===100?"hundreds":"10^"+Math.log10(exp);
          const B=Array.from({length:10},()=>[]);const ax=h=>{T.aux=[{t:"buckets",title:"buckets by the "+nm+" digit",b:B.map(x=>x.map(e=>e.v)),hot:h}];};ax(-1);T.P={};
          T.mark("digit","Pass "+T.pass+": a stable counting sort on the <b>"+nm+" digit</b> (<code>exp = "+exp+"</code>).");
          for(let i=0;i<T.n;i++){const e=T.a[i],d=Math.floor(e.v/exp)%10;B[d].push(e);T.writes++;T.P={i};ax(d);T.mark("place",e.v+": "+nm+" digit = "+d+" → bucket "+d+".");}
          let k=0;B.forEach(b=>b.forEach(e=>{T.a[k++]=Object.assign({},e);}));T.writes+=T.n;T.P={};ax(-1);
          T.mark("copy","Read the buckets back in order 0 … 9. Equal digits keep their order, so the order from the earlier digits survives.");}T.aux=null;T.end();}},
    bucket:{n:"Bucket sort",code:C("bucket"),pos:1,w:1,noSwap:1,prep:a=>a.map(v=>Math.abs(v)%100),
      run(T){const n=T.n,B=Array.from({length:n},()=>[]);const ax=h=>{T.aux=[{t:"buckets",title:n+" buckets · bucket = x · n / 100",b:B.map(x=>x.map(e=>e.v)),hot:h}];};ax(-1);
        T.mark("scatter","Make "+n+" empty buckets, one per element. Values are 0 … 99, so bucket b holds the range ["+"b·100/n, (b+1)·100/n).");
        for(let i=0;i<n;i++){const e=T.a[i],b=Math.floor(e.v*n/100);B[b].push(e);T.writes++;T.P={i};ax(b);T.mark("scatter",e.v+" → bucket "+b+"  ("+e.v+" · "+n+" / 100 = "+(e.v*n/100).toFixed(2)+").");}
        let k=0;T.P={};for(let b=0;b<n;b++){if(!B[b].length)continue;if(B[b].length>1){B[b].sort((x,y)=>x.v-y.v);ax(b);T.mark("sortb","Sort bucket "+b+" → ["+B[b].map(e=>e.v).join(", ")+"]. Buckets are tiny when values are spread evenly.");}
          for(const e of B[b]){T.P={k};ax(b);T.set(k,e,"gather","Copy "+e.v+" from bucket "+b+" into a["+k+"].");k++;}}T.aux=null;T.end();}},
    cyclic:{n:"Cyclic sort (values 1…n)",code:C("cyclic"),prep:rank,run(T){let i=0;T.mark("cmp","The values are exactly 1 … "+T.n+", so value v belongs at index v − 1. Each swap puts one value home.");
        while(i<T.n){const tg=T.a[i].v-1;T.P={i,target:tg};
          if(T.test(i,tg,"!=","cmp",{n1:"a[i]",n2:"a[target]",yes:" a[i] = "+(tg+1)+" is not home: swap it to index "+tg+".",no:" Value "+(tg+1)+" is already home."})){T.swap(i,tg,"swap");T.done(tg);}
          else{T.done(i);i++;T.P={i};T.mark("next","<code>i++</code>.");}}T.end();}},
    dnf:{n:"Dutch National Flag (0, 1, 2)",code:C("dnf"),prep:a=>{const r=rank(a),n=a.length;return r.map(x=>Math.min(2,Math.floor((x-1)*3/n)));},
      run(T){let lo=0,mid=0,hi=T.n-1;const P=()=>{T.P={lo,mid,hi};for(let x=0;x<T.n;x++)if(x<lo||x>hi)T.done(x);};P();
        T.mark("zero","Before <code>lo</code>: 0s · lo..mid−1: 1s · mid..hi: unknown · after <code>hi</code>: 2s. One pass, O(1) space.");
        while(mid<=hi){P();if(T.testv(mid,0,"==","zero",{n1:"a[mid]",yes:" A 0: swap it to lo, then lo++ and mid++."})){T.swap(lo,mid,"zero");lo++;mid++;continue;}
          P();if(T.testv(mid,2,"==","two",{n1:"a[mid]",yes:" A 2: swap it to hi, then hi--. Don't move mid: the value that came from hi is unchecked."})){T.swap(mid,hi,"two");hi--;continue;}
          mid++;P();T.mark("one","A 1: it is already in the middle zone, <code>mid++</code>.");}T.P={};T.end();}}
  });

  /* ---------- inputs ---------- */
  const rnd=(n,lo,hi)=>Array.from({length:n},()=>lo+Math.floor(Math.random()*(hi-lo+1)));
  const distinct=n=>{const p=Array.from({length:n},(_,i)=>Math.round(8+i*(90/(n-1||1))));for(let i=n-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[p[i],p[k]]=[p[k],p[i]];}return p;};
  const INPUTS={random:["Random",n=>distinct(n)],sorted:["Sorted (best case)",n=>distinct(n).sort((a,b)=>a-b)],nearly:["Nearly sorted",n=>{const a=distinct(n).sort((x,y)=>x-y);const i=1+Math.floor(Math.random()*(n-2));[a[i],a[i+1]]=[a[i+1],a[i]];return a;}],
    reversed:["Reversed (worst case)",n=>distinct(n).sort((a,b)=>b-a)],dups:["Many duplicates",n=>rnd(n,1,4).map(v=>v*20)],turtle:["Turtle at the end",n=>{const a=distinct(n).sort((x,y)=>x-y);a.push(a.shift());return a;}]};
  const parse=s=>{const a=String(s||"").split(/[\s,]+/).filter(Boolean).map(Number).filter(x=>Number.isFinite(x));return a.length>=2&&a.length<=16?a.map(x=>Math.max(-999,Math.min(999,Math.round(x)))):null;};

  /* ---------- the Bubble Lab (v30: runs every sort; bubble variants keep their own counters) ---------- */
  function auxHtml(f){if(!f||!f.aux)return "";return f.aux.map(p=>p.t==="buckets"?
      '<div class="bs-auxp"><h5>'+esc(p.title)+'</h5><div class="bs-bks">'+p.b.map((b,i)=>'<div class="bs-bk'+(i===p.hot?" hot":"")+'"><small>'+i+"</small>"+b.map(v=>"<b>"+v+"</b>").join("")+"</div>").join("")+"</div></div>":
      '<div class="bs-auxp"><h5>'+esc(p.title)+'</h5><div class="bs-cells">'+p.vals.map((v,i)=>'<span class="'+((p.hot||[]).includes(i)?"hot":"")+(p.split===i?" split":"")+'">'+(p.idx?"<small>"+p.idx[i]+"</small>":"")+"<b>"+v+"</b>"+(p.mark&&p.mark[i]?"<em>"+p.mark[i]+"</em>":"")+"</span>").join("")+"</div></div>").join("");}
  function treeHtml(f,vals){const n=vals.length,hs=f&&f.hs!=null?f.hs:n,c=f&&f.cmp,ps=new Map((f&&f.ptrs||[]).map(([l,p])=>[p,l]));
    const lv=i=>Math.floor(Math.log2(i+1)),x=i=>{const L=lv(i);return (i-(2**L-1)+.5)/2**L*100;},y=i=>lv(i)*50+20,H=(lv(n-1)+1)*50;
    let s='<svg class="bs-tl" viewBox="0 0 100 '+H+'" preserveAspectRatio="none" style="height:'+H+'px" aria-hidden="true">';
    for(let i=1;i<n;i++){const p=(i-1)>>1;s+='<line x1="'+x(p)+'" y1="'+y(p)+'" x2="'+x(i)+'" y2="'+y(i)+'"'+(i>=hs?' class="off"':"")+"/>";}
    s+="</svg>";for(let i=0;i<n;i++){const hot=c&&(i===c[0]||i===c[1]);s+='<span class="bs-tn'+(i>=hs?" off":"")+(hot?(f.sw?" sw":" hot"):"")+'" style="left:'+x(i)+"%;top:"+y(i)+'px">'+vals[i]+"<small>"+(ps.has(i)?ps.get(i):i)+"</small></span>";}
    return '<div class="bs-auxp"><h5>Heap as a tree (a[i] has children a[2i+1], a[2i+2]) · heap size '+hs+'</h5><div class="bs-tree" style="height:'+H+'px">'+s+"</div></div>";}
  function lab(host){
    const lock=!!host.dataset.lock,table=!!host.dataset.table,novar=!!host.dataset.novar;
    let vk=VAR[host.dataset.v]?host.dataset.v:"flag",inKey=INPUTS[host.dataset.in]?host.dataset.in:"custom",custom=parse(host.dataset.in),n=custom?custom.length:9,raw,data,F=[],k=-1,timer=null,mx=1;
    host.innerHTML=(ORDER.includes(vk)?head("Bubble Lab","Every variant, step by step: the Java line, the pointers, the parked zone and the counters"):head("Sort Lab","The bars are the array; the Java on the right runs one line per step"))+
      '<div class="vbody">'+(lock?"":'<div class="bs-opts">'+(novar?"":'<label class="ol-tog">Variant <select class="bs-v">'+ORDER.map(x=>'<option value="'+x+'">'+VAR[x].n+"</option>").join("")+'</select></label>')+
      '<label class="ol-tog">Input <select class="bs-in">'+Object.keys(INPUTS).map(x=>'<option value="'+x+'">'+INPUTS[x][0]+"</option>").join("")+'<option value="custom">Your numbers</option></select></label>'+
      '<label class="ol-tog">n <input type="range" class="bs-n" min="4" max="14" value="'+n+'"><b class="bs-nv">'+n+'</b></label>'+
      '<input class="bs-cu" type="text" spellcheck="false" placeholder="type numbers: 5 1 4 2 8" aria-label="Your numbers"><button type="button" class="chip" data-a="new">New data</button></div>')+
      '<div class="bs-main"><div class="bs-left"><div class="bs-stage"><div class="bs-bars"></div><div class="bs-ptrs"></div></div>'+
      '<div class="bs-key" aria-label="Colour key"><span><i class="k-hot"></i>compared</span><span><i class="k-sw"></i>swapping</span><span><i class="k-wr"></i>written</span><span><i class="k-piv"></i>pivot</span><span><i class="k-fin"></i>in its final place</span><span><i class="k-dim"></i>outside the current range</span></div>'+
      '<div class="bs-aux"></div><div class="bs-stats"></div><div class="bs-stack" hidden></div></div>'+
      '<div class="bs-right"><div class="bs-vn"></div><div class="ol-code bs-code"></div></div></div>'+
      (table?'<div class="tw bs-tbl"><table><thead><tr><th>Pass</th><th>j</th><th>Compare</th><th>Swap?</th><th>Array after</th></tr></thead><tbody></tbody></table></div>':"")+
      '<div class="ctrl"><button type="button" class="btn" data-a="reset">⟲</button><button type="button" class="btn" data-a="back">◀ Back</button><button type="button" class="btn pri" data-a="play">▶ Play</button><button type="button" class="btn" data-a="next">Next ▶</button>'+
      '<label class="bs-spd small muted">speed <input type="range" min="1" max="10" value="5"></label><span class="count"></span></div><div class="msg" aria-live="polite"></div></div>';
    const $h=s=>$(s,host),V=()=>VAR[vk],bub=()=>ORDER.includes(vk);
    if(!lock){if(!novar)$h(".bs-v").value=vk;$h(".bs-in").value=inKey;if(custom)$h(".bs-cu").value=custom.join(" ");}
    const load=fresh=>{if(fresh||!raw){raw=inKey==="custom"&&custom?custom.slice():INPUTS[inKey==="custom"?"random":inKey][1](n);}
      data=V().prep?V().prep(raw.slice()):raw.slice();const T=tracer(data);V().run(T);F=T.frames;k=-1;build();go(-1);};
    let els={};
    const build=()=>{const nn=data.length,bars=$h(".bs-bars");mx=Math.max(...data.map(Math.abs),1);bars.style.setProperty("--n",nn);
      bars.innerHTML=data.map((v,i)=>'<div class="bs-b" data-id="'+i+'"><i style="height:'+(8+86*Math.abs(v)/mx).toFixed(1)+'%"></i><b>'+v+"</b></div>").join("");
      els={};$$(".bs-b",bars).forEach(e=>els[e.dataset.id]=e);
      $h(".bs-ptrs").style.setProperty("--n",nn);
      $h(".bs-code").innerHTML=V().code.map((l,i)=>'<div class="ol-l" data-i="'+i+'">'+(hl(l[0])||" ")+"</div>").join("");
      $h(".bs-vn").innerHTML="<b>"+V().n+"</b>";$h(".bs-stack").hidden=!V().rec;
      if(table)$h(".bs-tbl tbody").innerHTML="";};
    const paint=f=>{const nn=data.length,pos=!!V().pos,vals=f?f.vals:data,ids=f&&!pos?f.ids:data.map((_,i)=>i),fin=new Set(f?f.fin:[]),c=f&&f.cmp,pairs=f&&f.pairs,rg=f&&f.rg;
      ids.forEach((id,p)=>{const e=els[id];if(!e)return;e.style.transform="translateX("+p*100+"%)";
        if(pos){$("i",e).style.height=(8+86*Math.abs(vals[p])/mx).toFixed(1)+"%";$("b",e).textContent=vals[p];}
        const inC=c&&(p===c[0]||p===c[1])||pairs&&pairs.some(j=>p===j||p===j+1),bad=f&&f.bad&&f.bad.some(j=>p===j||p===j+1);
        e.className="bs-b"+(fin.has(p)?" fin":"")+(inC?(f.sw?" sw":f.waste?" waste":(f.res||bad)?" hot bad":" hot"):"")+(f&&f.wr===p?" wr":"")+(f&&f.pv===p?" piv":"")+
          (rg&&(p<rg[0]||p>rg[1])?" dim":"")+(f&&f.key==="done"?" fin":"");});
      const P=[];if(c){const lab=f.lab||(bub()?["j","j+1"]:["",""]);P.push([c[0],lab[0]],[c[1],lab[1]]);}
      if(f&&f.ptrs)f.ptrs.forEach(([l,p])=>P.push([p,l]));
      const G=new Map();P.forEach(([p,l])=>{if(!l)return;if(!G.has(p))G.set(p,[]);if(!G.get(p).includes(l))G.get(p).push(l);});
      $h(".bs-ptrs").innerHTML=[...G].map(([p,l])=>'<span class="bs-p" style="transform:translateX('+p*100+'%)">'+esc(l.join(","))+"</span>").join("")+
        (f&&f.bound!=null&&f.key!=="done"?'<span class="bs-bound" style="left:calc('+(f.bound+1)+' * 100% / var(--n))">bound</span>':"")+
        (f&&f.lo!=null&&f.key!=="done"?'<span class="bs-lohi" style="left:calc('+f.lo+' * 100% / var(--n))">lo</span><span class="bs-lohi" style="left:calc('+f.hi+' * 100% / var(--n))">hi</span>':"");
      $h(".bs-aux").innerHTML=(V().tree?treeHtml(f,vals):"")+auxHtml(f);
      let st;
      if(bub()){st=[["Pass"+(vk==="oddeven"?" (round)":vk==="shaker"?" (sweep)":""),f?f.pass:0],["Comparisons",f?f.comps:0],["Swaps",f?f.swaps:0]];
        if(vk==="brute")st.push(["Wasted",f?f.wasted:0,"w"]);if(V().rec)st.push(["Stack depth",(f?f.depth:0)+" / max "+(f?f.maxDepth:0)]);if(vk==="comb")st.push(["Gap",f&&f.gap!=null?f.gap:"–"]);
        if(vk==="shaker")st.push(["Direction",f&&f.dir?(f.dir>0?"→":"←"):"–"]);}
      else{st=[["Comparisons",f?f.comps:0]];if(!V().noSwap)st.push(["Swaps",f?f.swaps:0]);if(V().w)st.push(["Writes",f?f.writes:0]);if(V().pl)st.push([V().pl,f?f.pass:0]);
        if(f&&f.gap!=null)st.push(["Gap",f.gap]);if(V().inv)st.push(["Inversions",f?f.inv:0,"w"]);if(V().rec)st.push(["Stack depth",(f?f.depth:0)+" / max "+(f?f.maxDepth:0)]);}
      $h(".bs-stats").innerHTML=st.map(s=>'<div class="'+(s[2]==="w"?"bs-w":"")+'"><small>'+s[0]+"</small><b>"+s[1]+"</b></div>").join("");
      if(V().rec){const s=f?f.stack:[];$h(".bs-stack").innerHTML="<h5>Call stack (top first)</h5>"+(s.length?s.slice().reverse().map((x,i)=>'<div class="'+(i===0?"top":"")+'">'+esc(x)+"</div>").join(""):'<div class="ol-empty">empty: main() only</div>');}
      const key=f?f.key:"",code=V().code;let li=-1;if(key)li=code.findIndex(l=>l[1]===key);if(key==="done"&&li<0)li=code.findIndex(l=>l[1]==="ret");if(key==="done"&&li<0)li=code.length-1;if(li<0&&f&&f.sw){const si=code.findIndex(l=>l[1]==="swap");if(si>=0)li=si;}
      $$(".bs-code .ol-l",host).forEach((e,i)=>e.classList.toggle("cur",i===li));
      if(table){const rows=F.slice(0,k+1).filter(x=>x.row);$h(".bs-tbl tbody").innerHTML=rows.map((x,i)=>{const r=x.row;return '<tr class="'+(i===rows.length-1?"cur":"")+'"><td>'+r.pass+"</td><td>"+r.j+"</td><td>"+r.x+" &gt; "+r.y+" ?</td><td>"+(r.sw?'<b class="bs-yes">yes</b>':"no")+"</td><td><code>["+r.after+"]</code></td></tr>";}).join("");}
      $h(".msg").innerHTML=f?f.msg:"Input <code>["+data.join(", ")+"]</code>"+(V().prep&&data.join()!==raw.join()?" (your input adapted to what this sort needs)":"")+". Press <b>Play</b>, or step with <b>Next</b>. Yellow = being compared, red = swapping, blue = written, purple = pivot, green = in its final place.";
      $h(".count").textContent=(k+1)+" / "+F.length;$('[data-a="back"]',host).disabled=k<0;$('[data-a="next"]',host).disabled=k>=F.length-1;};
    const go=i=>{k=Math.max(-1,Math.min(F.length-1,i));paint(k>=0?F[k]:null);};
    const stop=()=>{clearTimeout(timer);timer=null;$('[data-a="play"]',host).textContent="▶ Play";};
    const delay=()=>{const s=+$(".bs-spd input",host).value;return Math.round(1400/Math.pow(1.45,s-1));};
    const play=()=>{if(timer){stop();return;}if(k>=F.length-1)go(-1);$('[data-a="play"]',host).textContent="❚❚ Pause";const tick=()=>{if(k>=F.length-1){stop();return;}go(k+1);timer=setTimeout(tick,delay());};timer=setTimeout(tick,60);};
    host.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b||!host.contains(b))return;const a=b.dataset.a;
      if(a==="next"){stop();go(k+1);}else if(a==="back"){stop();go(k-1);}else if(a==="play")play();else if(a==="reset"){stop();go(-1);}else if(a==="new"){stop();if(inKey==="custom")inKey="random",$h(".bs-in").value="random";load(true);}});
    if(!host.hasAttribute("tabindex"))host.tabIndex=0;
    host.addEventListener("keydown",e=>{if(e.target.closest("input,select,textarea,button")&&e.key===" ")return;if(e.target.closest("input,select,textarea"))return;
      if(e.key==="ArrowRight"){e.preventDefault();stop();go(k+1);}else if(e.key==="ArrowLeft"){e.preventDefault();stop();go(k-1);}else if(e.key===" "){e.preventDefault();play();}});
    if(!lock){
      if(!novar)$h(".bs-v").onchange=e=>{stop();vk=e.target.value;load(false);};
      $h(".bs-in").onchange=e=>{stop();inKey=e.target.value;if(inKey==="custom"){custom=parse($h(".bs-cu").value)||custom||[5,1,4,2,8];$h(".bs-cu").value=custom.join(" ");}load(true);};
      $h(".bs-n").oninput=e=>{n=+e.target.value;$h(".bs-nv").textContent=n;};
      $h(".bs-n").onchange=()=>{stop();if(inKey==="custom"){inKey="random";$h(".bs-in").value="random";}load(true);};
      $h(".bs-cu").onchange=e=>{const p=parse(e.target.value);if(!p){$h(".msg").innerHTML="Type 2 to 16 whole numbers separated by spaces or commas, for example <code>5 1 4 2 8</code>.";return;}stop();custom=p;inKey="custom";$h(".bs-in").value="custom";load(true);};}
    load(true);host.bsLab={get frames(){return F;},go,load,set variant(x){stop();vk=x;const vs=$h(".bs-v");if(vs&&ORDER.includes(x))vs.value=x;load(false);},get data(){return data;}};}
  $$(".bs-lab").forEach(h=>lazy(h,lab));

  /* ---------- Sorting explorer #bsx (B0, v30: every interview sort): pick a sort, then a type; the type's idea, cost cards,
     key points, interview problems and a lab locked to that type appear in place. "Compare all sorts" shows one table.
     Choice saved in js1-bsx ({s, t}). ---------- */
  const TYPES={
    brute:{s:"bs-brute",idea:"Run n − 1 passes and compare <b>every</b> neighbour pair in every pass. It never skips the sorted tail and never stops early.",when:"Never in real code. It is the baseline that shows what each optimization saves.",c:["O(n²)","O(n²)","O(n²)","O(1)","Yes","No"],cmp:"(n − 1)² on every input",pts:["Outer <code>i &lt; n - 1</code>, inner <code>j &lt; n - 1</code>","About half its comparisons touch the already-parked tail (the red <b>wasted</b> counter)","Still correct: comparing two ordered values does nothing"]},
    standard:{s:"bs-standard",idea:"After pass i the last i + 1 values are final, so the inner loop stops at <code>n - 1 - i</code>.",when:"The textbook version; say it first, then add the flag.",c:["O(n²)","O(n²)","O(n²)","O(1)","Yes","No"],cmp:"n(n − 1)/2 on every input",pts:["Half the work of brute force","Still no early exit: sorted input costs the same","Off-by-one trap: <code>j &lt; n - i</code> reads <code>a[n]</code>"]},
    flag:{s:"bs-flag",idea:"A <code>boolean swapped</code>, reset every pass. A pass with no swaps proves the array is sorted, so <code>break</code>.",when:"The version interviewers mean by \"bubble sort\". Good for tiny or nearly sorted data.",c:["O(n)","O(n²)","O(n²)","O(1)","Yes","Yes"],cmp:"n − 1 if sorted, n(n − 1)/2 worst",pts:["Best case O(n): one check pass","Reset the flag inside the outer loop","Small values at the end (turtles) still need many passes"]},
    lastswap:{s:"bs-last",idea:"Remember where the <b>last swap</b> happened; everything after it is final, so the next pass stops there.",when:"Partly sorted data where the tail settles early.",c:["O(n)","O(n²)","O(n²)","O(1)","Yes","Yes"],cmp:"never more than V3",pts:["The bound can shrink by many slots at once","A pass with no swap sets bound = 0 and ends the loop","[3,1,2,4,5,6,7,8]: 8 comparisons vs 13 with the flag"]},
    dowhile:{s:"bs-dowhile",idea:"\"Sweep again while the last sweep swapped something\": the flag version written as a do-while.",when:"When the interviewer writes it this way; same cost as V3.",c:["O(n)","O(n²)","O(n²)","O(1)","Yes","Yes"],cmp:"same as V3",pts:["do-while runs at least one check sweep","Compares (j − 1, j) for j = 1 … n − 1","<code>n--</code> after each sweep = the shrinking tail"]},
    rec:{s:"bs-rec",idea:"One pass parks the largest at index n − 1, then <code>bubble(a, n - 1)</code> solves the rest. Base case <code>n ≤ 1</code>.",when:"Recursion practice; not for large arrays.",c:["O(n)","O(n²)","O(n²)","O(n) stack","Yes","Yes"],cmp:"same as V3",pts:["T(n) = T(n − 1) + (n − 1) = n(n − 1)/2","Up to n − 1 stack frames: O(n) space","Tail recursive, but Java does not remove tail calls"]},
    fullrec:{s:"bs-fullrec",idea:"No loops at all: <code>sort(a, n)</code> calls <code>pass(a, 0, n)</code> then <code>sort(a, n - 1)</code>; <code>pass</code> recurses over the pairs.",when:"To show you can turn any loop into recursion.",c:["O(n²)","O(n²)","O(n²)","O(n) stack","Yes","No"],cmp:"n(n − 1)/2",pts:["Two base cases: n ≤ 1 and j ≥ n − 1","Deepest stack ≈ n + 1 frames","n = 1,000,000 throws StackOverflowError"]},
    generic:{s:"bs-generic",idea:"Works for any type: <code>Comparable</code> with <code>compareTo &gt; 0</code>, or any order with a <code>Comparator</code>.",when:"Sorting objects: by marks, by length then name, descending.",c:["O(n)","O(n²)","O(n²)","O(1)","Yes (with &gt; 0)","Yes"],cmp:"same as V3",pts:["<code>&gt; 0</code> keeps it stable; <code>&gt;= 0</code> breaks stability","<code>Comparator.reverseOrder()</code> for descending","Needs <code>Integer[]</code>, not <code>int[]</code>"]},
    shaker:{s:"bs-family",idea:"Sweep right (largest to the end), then left (smallest to the front), shrinking from both sides.",when:"Data with turtles: small values stuck near the end.",c:["O(n)","O(n²)","O(n²)","O(1)","Yes","Yes"],cmp:"n(n − 1)/2 worst",pts:["[2,3,4,5,6,7,8,1]: 3 sweeps, 18 comparisons vs 7 passes, 28","Also called bidirectional bubble sort","Same swap count: swaps = inversions"]},
    oddeven:{s:"bs-family",idea:"Alternate an odd phase (pairs 1-2, 3-4 …) and an even phase (0-1, 2-3 …). Pairs in one phase never overlap.",when:"Parallel hardware and sorting networks (GPUs).",c:["O(n)","O(n²)","O(n²)","O(1)","Yes","Yes"],cmp:"≈ n²/2; O(n) parallel rounds",pts:["Every phase can run all its comparisons at once","At most n rounds","Also called brick sort"]},
    comb:{s:"bs-family",idea:"Compare elements a <b>gap</b> apart and shrink the gap by 1.3 each pass; at gap 1 it is bubble sort with a flag.",when:"When you want bubble-sort simplicity but real speed.",c:["O(n log n)","≈ n log n","O(n²)","O(1)","<b>No</b>","Partly"],cmp:"≈ 327 thousand vs 50 million for V3 (10,000 random ints)",pts:["Kills turtles early with long jumps","Not stable: gap swaps jump over equal values","The fastest member of the family in practice"]}
  };

  Object.assign(TYPES,{
    sel_std:{idea:"Each pass finds the <b>smallest</b> value of the unsorted part and swaps it to the front.",when:"When writes are expensive: at most n − 1 swaps. Otherwise insertion sort is better.",c:["O(n²)","O(n²)","O(n²)","O(1)","No","No"],cmp:"always n(n − 1)/2 comparisons; at most n − 1 swaps",pts:["Not stable: a long swap can jump over an equal value ([2ᴬ, 2ᴮ, 1] → [1, 2ᴮ, 2ᴬ])","Not adaptive: sorted input costs the same","Fewest writes of the simple sorts"]},
    sel_stable:{idea:"Selection sort that <b>shifts</b> the block right instead of swapping, so equal values keep their order.",when:"When you need a stable selection sort (rare); it does as many writes as insertion sort.",c:["O(n²)","O(n²)","O(n²)","O(1)","Yes","No"],cmp:"n(n − 1)/2 comparisons, up to n²/2 writes",pts:["Shifting is what insertion sort does","Trades the few-swaps advantage for stability"]},
    sel_double:{idea:"Find the minimum <b>and</b> the maximum in one walk; put one at the front and one at the back.",when:"A common follow-up: halves the number of passes.",c:["O(n²)","O(n²)","O(n²)","O(1)","No","No"],cmp:"about 2 comparisons per element per pass, n/2 passes: still ≈ n²/2... in total about the same",pts:["Trap: if the max was at lo, it moved to min's slot after the first swap","Same Big-O; fewer passes, not fewer comparisons"]},
    sel_rec:{idea:"Put the minimum at index i, then <code>selectionRec(a, i + 1)</code>.",when:"Recursion practice.",c:["O(n²)","O(n²)","O(n²)","O(n) stack","No","No"],cmp:"n(n − 1)/2",pts:["Base case: i ≥ n − 1","n − 1 stack frames"]},
    ins_shift:{idea:"Grow a sorted prefix: lift out <code>key = a[i]</code>, shift bigger values right, drop the key in the gap.",when:"Small (n ≲ 16) or nearly sorted data. Libraries use it for small runs (TimSort, Dual-Pivot Quicksort).",c:["O(n)","O(n²)","O(n²)","O(1)","Yes","Yes"],cmp:"n − 1 if sorted; about n²/4 on random data; shifts = inversions",pts:["Stable, adaptive, in-place and <b>online</b> (can sort as data arrives)","Shifting (1 write) beats swapping (3 writes)","The best simple sort; the one to recommend"]},
    ins_swap:{idea:"The same algorithm, but the new element is swapped left step by step.",when:"Shortest to write; slower than shifting.",c:["O(n)","O(n²)","O(n²)","O(1)","Yes","Yes"],cmp:"same comparisons as shifting; swaps = inversions",pts:["Each step is a 3-assignment swap instead of 1 write"]},
    ins_bin:{idea:"Use <b>binary search</b> to find where the key goes, then shift the block with <code>System.arraycopy</code>.",when:"When comparisons are expensive (long strings, complex objects). TimSort uses it.",c:["O(n log n) cmp","O(n²)","O(n²)","O(1)","Yes","Partly"],cmp:"O(n log n) comparisons, but still O(n²) moves",pts:["Search for the first value &gt; key (≤ goes right) to stay stable","Fewer comparisons, same number of moves"]},
    ins_rec:{idea:"Sort the first n − 1 elements recursively, then insert the last one.",when:"Recursion practice.",c:["O(n)","O(n²)","O(n²)","O(n) stack","Yes","Yes"],cmp:"same as insertion sort",pts:["The recursion goes all the way down first, then inserts on the way back"]},
    shell:{idea:"Insertion sort on elements a <b>gap</b> apart, with the gap halving down to 1.",when:"Medium arrays without recursion (embedded code); a classic \"improve insertion sort\" answer.",c:["O(n log n)","≈ n^1.3 (gap-dependent)","O(n²) for n/2, n/4…","O(1)","No","Partly"],cmp:"depends on the gap sequence (Knuth 3k+1 is better than halving)",pts:["Moves small values far left early, like comb sort for bubble sort","Not stable: gaps jump over equal values"]},
    m_td:{idea:"<b>Divide</b> in half, sort each half recursively, then <b>merge</b> two sorted halves with two pointers.",when:"Guaranteed n log n, stable, linked lists, external sorting. Java sorts objects with TimSort, a merge sort.",c:["O(n log n)","O(n log n)","O(n log n)","O(n)","Yes","No"],cmp:"at most n log₂ n comparisons; log₂ n levels × n writes",pts:["T(n) = 2T(n/2) + O(n) = O(n log n)","Merge takes from the left on ties: stable","O(n) extra array + O(log n) stack"]},
    m_bu:{idea:"No recursion: merge runs of 1 into runs of 2, then 4, 8 … until one run remains.",when:"When recursion is not allowed; the natural form for linked lists (LC 148 in O(1) extra space).",c:["O(n log n)","O(n log n)","O(n log n)","O(n)","Yes","No"],cmp:"same as top-down",pts:["log₂ n width passes, each O(n)","No call stack"]},
    m_inv:{idea:"While merging, when a right value is taken, every left value still waiting is bigger: add them all as inversions.",when:"Count inversions / \"how many swaps to sort\" in O(n log n) instead of O(n²).",c:["O(n log n)","O(n log n)","O(n log n)","O(n)","Yes","No"],cmp:"n log n; answer can reach n(n − 1)/2, so use long",pts:["inv += (mid − i + 1) when taking from the right","Same idea: count of smaller numbers after self (LC 315), reverse pairs (LC 493)"]},
    tim:{idea:"The idea behind Java's object sort: insertion-sort small runs, then merge the runs.",when:"Explains <code>Arrays.sort(Object[])</code> / <code>List.sort</code>: stable, n log n, very fast on partly sorted data.",c:["O(n)","O(n log n)","O(n log n)","O(n)","Yes","Yes"],cmp:"real TimSort finds natural runs and gallops; this is the simplified idea",pts:["Runs of 32–64 in the real one","Stable: insertion and merge both are"]},
    q_l:{idea:"Pick a <b>pivot</b> (last element), <b>partition</b> so smaller values are left of it, then sort both sides recursively.",when:"Fastest in practice on arrays; Java sorts primitives with Dual-Pivot Quicksort.",c:["O(n log n)","O(n log n)","O(n²)","O(log n) stack","No","No"],cmp:"≈ 1.39 n log₂ n on average; n²/2 on sorted input with a last-element pivot",pts:["Worst case: already sorted input with first/last pivot","Each partition fixes the pivot's final index","Not stable"]},
    q_h:{idea:"Two pointers walk towards each other and swap values on the wrong side of the middle pivot.",when:"Fewer swaps than Lomuto; handles duplicates better.",c:["O(n log n)","O(n log n)","O(n²)","O(log n) stack","No","No"],cmp:"about 3 times fewer swaps than Lomuto on average",pts:["Recurse on (lo, j) and (j + 1, hi): the pivot is not necessarily at j","Uses do-while: the pointers move before they compare"]},
    q_r:{idea:"Swap a <b>random</b> element to the end before partitioning.",when:"Always in interviews: makes the O(n²) case vanishingly unlikely on any input.",c:["O(n log n)","O(n log n)","O(n²) (unlikely)","O(log n) stack","No","No"],cmp:"expected ≈ 1.39 n log₂ n on every input",pts:["Defeats adversarial or sorted input","Recurse on the smaller side first to keep the stack O(log n)"]},
    q_3:{idea:"Partition into &lt; pivot, = pivot, &gt; pivot (Dijkstra). The = block is final at once.",when:"Many duplicate keys; it is the same partition as Sort Colors.",c:["O(n)","O(n log n)","O(n²)","O(log n) stack","No","No"],cmp:"O(n) when all values are equal",pts:["Three pointers lt, i, gt","Don't advance i after swapping with gt"]},
    q_sel:{idea:"Partition, then continue only into the side that contains index k.",when:"k-th largest/smallest (LC 215), median, top-k without sorting.",c:["O(n)","O(n)","O(n²)","O(1)","–","–"],cmp:"n + n/2 + n/4 … ≈ 2n comparisons on average",pts:["Use a random pivot in interviews","k-th largest = index n − k","Alternative: a min-heap of size k, O(n log k)"]},
    h_std:{idea:"Build a max-heap in the array, then repeatedly swap the max to the end and sift the new root down.",when:"Guaranteed n log n with O(1) extra space. The heap itself (PriorityQueue) is what interviews use most.",c:["O(n log n)","O(n log n)","O(n log n)","O(1)","No","No"],cmp:"about 2 n log₂ n",pts:["Children of i: 2i + 1 and 2i + 2; parent: (i − 1) / 2","Bottom-up build is O(n), not O(n log n)","Not stable, poor cache locality: slower than quicksort in practice"]},
    h_rec:{idea:"The same heap sort with a recursive <code>heapify</code>.",when:"The version most textbooks show.",c:["O(n log n)","O(n log n)","O(n log n)","O(log n) stack","No","No"],cmp:"same as heap sort",pts:["Recursion depth = heap height = log₂ n"]},
    h_up:{idea:"Build the heap by inserting elements one by one and letting each bubble up.",when:"How a PriorityQueue grows with offer().",c:["O(n log n)","O(n log n)","O(n log n)","O(1)","No","No"],cmp:"build is O(n log n) instead of O(n)",pts:["siftUp = PriorityQueue.offer, siftDown = poll"]},
    c_simple:{idea:"Count how many times each value occurs, then write the values out in order. <b>No comparisons.</b>",when:"Small integer range k: ages, marks, letters (int[26]).",c:["O(n + k)","O(n + k)","O(n + k)","O(k)","–","–"],cmp:"0 comparisons; n counts + n writes",pts:["Beats the n log n lower bound because it doesn't compare","Useless when k is huge (values up to 10⁹)","Same idea as frequency arrays in String problems"]},
    c_stable:{idea:"Prefix sums turn counts into end positions; place elements from right to left into <code>out</code>.",when:"When records carry data (sort people by age) and as the inner step of radix sort.",c:["O(n + k)","O(n + k)","O(n + k)","O(n + k)","Yes","–"],cmp:"0 comparisons",pts:["count[v] = how many values ≤ v","Right to left = stable"]},
    radix:{idea:"Sort by the ones digit, then the tens, then the hundreds, each time with a <b>stable</b> counting sort.",when:"Many integers or fixed-length strings (IDs, phone numbers, dates).",c:["O(d·(n + b))","O(d·(n + b))","O(d·(n + b))","O(n + b)","Yes","–"],cmp:"0 comparisons; d passes (d = digits, b = base 10)",pts:["Each pass must be stable, or earlier digits get scrambled","LSD = least significant digit first","Negative numbers need an offset or a separate pass"]},
    bucket:{idea:"Scatter values into buckets by range, sort each small bucket, then concatenate.",when:"Values spread evenly over a known range; Top K Frequent (LC 347) buckets by frequency.",c:["O(n + k)","O(n + k)","O(n²)","O(n + k)","Yes*","–"],cmp:"linear on average; all in one bucket = worst case",pts:["*stable if each bucket is sorted stably","Maximum Gap (LC 164) uses buckets"]},
    cyclic:{idea:"Values are 1 … n, so value v belongs at index v − 1: swap each value straight home.",when:"Missing / duplicate number problems in O(n) time, O(1) space.",c:["O(n)","O(n)","O(n)","O(1)","No","–"],cmp:"at most n − 1 swaps",pts:["LC 268 missing number, 287 duplicate, 41 first missing positive, 442 all duplicates","Compare a[i] with a[target], not with i + 1, to survive duplicates"]},
    dnf:{idea:"Three pointers split the array into 0s, 1s, unknown and 2s in one pass.",when:"Sort Colors (LC 75); the partition step of 3-way quicksort.",c:["O(n)","O(n)","O(n)","O(1)","No","–"],cmp:"one pass, at most n swaps",pts:["Swap a 0 with lo (lo++, mid++); a 2 with hi (hi-- only)","Don't advance mid after swapping with hi"]}
  });
  TYPES.sel_double.cmp="about the same comparisons as selection sort (2 per element, n/2 passes); half the passes";
  const FAM=[
    {k:"bubble",n:"Bubble sort",tier:"Basics",t:ORDER,sum:"Swap neighbours that are out of order; each pass parks the largest at the end.",p:["Is the array sorted? (one pass)","Minimum adjacent swaps = inversions","Sort with only adjacent swaps"]},
    {k:"selection",n:"Selection sort",tier:"Should know",t:["sel_std","sel_stable","sel_double","sel_rec"],sum:"Select the minimum, put it in front; fewest swaps.",p:["Which sort makes the fewest swaps?","Why is selection sort not stable?","Kth smallest by k selection passes, O(n·k)"]},
    {k:"insertion",n:"Insertion sort",tier:"Should know",t:["ins_shift","ins_swap","ins_bin","ins_rec","shell"],sum:"Grow a sorted prefix by inserting each element in place; best simple sort.",p:["Insertion Sort List (LC 147)","Sort a nearly sorted (k-sorted) array","Why do libraries use insertion sort for small runs?"]},
    {k:"merge",n:"Merge sort",tier:"Must know",t:["m_td","m_bu","m_inv","tim"],sum:"Divide, sort halves, merge: n log n always, stable.",p:["Sort List (LC 148)","Merge k Sorted Lists (LC 23)","Count inversions; Count of Smaller Numbers After Self (LC 315); Reverse Pairs (LC 493)","Merge Sorted Array (LC 88)"]},
    {k:"quick",n:"Quick sort",tier:"Must know",t:["q_l","q_h","q_r","q_3","q_sel"],sum:"Partition around a pivot, recurse; fastest in practice, O(n²) worst.",p:["Kth Largest Element (LC 215) with Quickselect","Sort an Array (LC 912)","Top K / K Closest Points (LC 973)","Wiggle Sort II (LC 324)"]},
    {k:"heap",n:"Heap sort",tier:"Must know",t:["h_std","h_rec","h_up"],sum:"Max-heap in the array; swap the max to the end, repeat. PriorityQueue is the real interview tool.",p:["Kth Largest (LC 215) with a size-k min-heap","Top K Frequent (LC 347)","Find Median from Data Stream (LC 295)","Merge k Sorted Lists (LC 23)","Meeting Rooms II (LC 253)"]},
    {k:"counting",n:"Counting sort",tier:"Must know",t:["c_simple","c_stable"],sum:"Count each value, write them back: O(n + k), no comparisons.",p:["Valid Anagram / Group Anagrams (int[26])","H-Index (LC 274)","Sort by frequency (LC 451)","Relative Sort Array (LC 1122)"]},
    {k:"radix",n:"Radix sort",tier:"Good to know",t:["radix"],sum:"Stable counting sort digit by digit.",p:["Maximum Gap (LC 164)","Sort 10⁷ phone numbers / IDs","Why radix beats n log n for fixed-width keys"]},
    {k:"bucket",n:"Bucket sort",tier:"Must know",t:["bucket"],sum:"Scatter into range buckets, sort each, concatenate.",p:["Top K Frequent Elements (LC 347) in O(n)","Maximum Gap (LC 164)","Sort floats in [0, 1)"]},
    {k:"cyclic",n:"Cyclic sort",tier:"Should know",t:["cyclic"],sum:"Values 1 … n: swap each value to index v − 1.",p:["Missing Number (LC 268)","Find the Duplicate Number (LC 287)","First Missing Positive (LC 41)","Find All Duplicates (LC 442)"]},
    {k:"dnf",n:"Dutch National Flag",tier:"Should know",t:["dnf"],sum:"Three-way partition of 0/1/2 in one pass.",p:["Sort Colors (LC 75)","Partition around a value (3-way quicksort)","Move zeroes / segregate even and odd"]}
  ];
  const HD=["Best","Average","Worst","Space","Stable","Adaptive"];
  const cls=(i,v)=>{v=String(v);if(i<3)return /n²/.test(v)&&!/unlikely/.test(v)?"bsx-lo":/O\(n\)|n log n|O\(n \+ k\)|O\(d/.test(v)?"bsx-hi":"";
    if(i===3)return /O\(1\)|O\(log n\)/.test(v)?"bsx-hi":/^O\(n\)/.test(v)?"bsx-lo":"";return /^Yes/.test(v)?"bsx-hi":/^No/.test(v)?"bsx-lo":"";};
  lazy($("#bsx"),h=>{let st={s:"bubble",t:"flag"};try{st=Object.assign(st,JSON.parse(store.get("js1-bsx")||"{}"));}catch(e){}
    const fam=k=>FAM.find(f=>f.k===k);if(!fam(st.s)&&st.s!=="all")st.s="bubble";
    h.innerHTML=head("Sorting explorer","Pick a sort, then a type: its idea, its cost, interview problems and a live visual appear below")+
      '<div class="vbody"><div class="bsx-pick"><label class="bsx-sel"><span>Sort</span><select class="bsx-s">'+FAM.map(f=>'<option value="'+f.k+'">'+f.n+" · "+f.tier+"</option>").join("")+'<option value="all">★ Compare all sorts</option></select></label>'+
      '<label class="bsx-sel"><span>Type</span><select class="bsx-t"></select></label></div><div class="bsx-chips" role="tablist" aria-label="Types"></div>'+
      '<div class="bsx-info" aria-live="polite"></div><div class="bsx-all" hidden></div><div class="bs-lab bsx-lab" data-novar="1" data-v="flag" data-in="random"></div></div>';
    const inner=$(".bsx-lab",h);lab(inner);
    const allSorts='<div class="tw"><table><tr><th>Sort</th><th>Best</th><th>Average</th><th>Worst</th><th>Space</th><th>Stable</th><th>For interviews</th></tr>'+
      FAM.map(f=>{const T=TYPES[f.k==="bubble"?"flag":f.k==="quick"?"q_r":f.t[0]];return '<tr><td><a href="#" data-s="'+f.k+'">'+f.n+"</a></td>"+T.c.slice(0,5).map((x,i)=>'<td class="'+cls(i,x)+'">'+x+"</td>").join("")+"<td>"+f.tier+"</td></tr>";}).join("")+
      "</table></div><p class=\"small muted\">Comparison sorts can't beat O(n log n) in the worst case; counting, radix and bucket sort do, because they never compare. Java: <code>Arrays.sort(int[])</code> = Dual-Pivot Quicksort (not stable), <code>Arrays.sort(Object[])</code> / <code>List.sort</code> = TimSort (stable).</p>";
    const famTable=f=>'<div class="tw"><table><tr><th>Type</th>'+HD.map(x=>"<th>"+x+"</th>").join("")+"<th>Work</th></tr>"+f.t.map(k=>'<tr><td><a href="#" data-t="'+k+'">'+VAR[k].n+"</a></td>"+TYPES[k].c.map((x,i)=>'<td class="'+cls(i,x)+'">'+x+"</td>").join("")+"<td>"+TYPES[k].cmp+"</td></tr>").join("")+"</table></div>";
    const save=()=>store.set("js1-bsx",JSON.stringify(st));
    const setSort=s=>{applySort(s);st.s=s;$(".bsx-s",h).value=s;const all=s==="all",f=fam(s);$(".bsx-t",h).disabled=all;
      $(".bsx-t",h).innerHTML=all?"<option>—</option>":f.t.map(k=>'<option value="'+k+'">'+VAR[k].n+"</option>").join("")+(f.t.length>1?'<option value="all">★ Compare all '+f.t.length+" types</option>":"");
      $(".bsx-chips",h).innerHTML=all?"":f.t.length>1?f.t.map(k=>'<button type="button" class="chip" data-t="'+k+'">'+(f.k==="bubble"?VAR[k].n.split(" · ")[0]:VAR[k].n.replace(/^[^(]*\(([^)]*)\).*$/,"$1").replace(f.n,"").trim()||VAR[k].n)+"</button>").join("")+'<button type="button" class="chip" data-t="all">All</button>':"";
      if(all){$(".bsx-info",h).innerHTML='<div class="bsx-head"><b>All interview sorts</b></div><p class="bsx-idea">Pick a sort in the table to open it. <b>Must know</b>: merge, quick (+ Quickselect), heap (PriorityQueue), counting, bucket. <b>Should know</b>: insertion, selection, cyclic sort, Dutch National Flag. Bubble sort and radix sort are basics and theory.</p>';
        $(".bsx-all",h).innerHTML=allSorts;$(".bsx-all",h).hidden=false;inner.hidden=true;save();return;}
      const t=f.t.includes(st.t)||st.t==="all"&&f.t.length>1?st.t:f.t[f.k==="bubble"?2:0];show(t);};
    const show=t=>{const f=fam(st.s);if(!f)return;st.t=t;save();$(".bsx-t",h).value=t;$$(".bsx-chips .chip",h).forEach(c=>c.classList.toggle("on",c.dataset.t===t));
      const probs='<h5>Interview problems</h5><ul>'+f.p.map(p=>"<li>"+p+"</li>").join("")+"</ul>";
      if(t==="all"){$(".bsx-info",h).innerHTML='<div class="bsx-head"><b>'+f.n+": all "+f.t.length+' types</b><span class="bsx-tier">'+f.tier+'</span></div><p class="bsx-idea">'+f.sum+" Click a type to open it.</p>"+probs;
        $(".bsx-all",h).innerHTML=famTable(f);$(".bsx-all",h).hidden=false;inner.hidden=true;return;}
      $(".bsx-all",h).hidden=true;inner.hidden=false;const T=TYPES[t];
      $(".bsx-info",h).innerHTML='<div class="bsx-head"><b>'+VAR[t].n+'</b><span class="bsx-tier">'+f.n+" · "+f.tier+"</span>"+(T.s||$("#t-"+t)?'<a href="'+(T.s?secUrl(T.s):"#t-"+t)+'">Full section →</a>':"")+'</div><p class="bsx-idea">'+T.idea+"</p>"+
        '<div class="bsx-cost">'+HD.map((x,i)=>'<div class="'+cls(i,T.c[i])+'"><small>'+x+"</small><b>"+T.c[i]+"</b></div>").join("")+"</div>"+
        '<div class="bsx-two"><div><h5>Key points</h5><ul>'+T.pts.map(p=>"<li>"+p+"</li>").join("")+"</ul>"+probs+'</div><div><h5>Work done</h5><p>'+T.cmp+'</p><h5>Use it when</h5><p>'+T.when+"</p></div></div>";
      inner.bsLab.variant=t;};
    h.addEventListener("click",e=>{const b=e.target.closest("[data-t],[data-s]");if(!b||b.closest(".bsx-lab"))return;e.preventDefault();if(b.dataset.s)setSort(b.dataset.s);else show(b.dataset.t);});
    $(".bsx-s",h).onchange=e=>{setSort(e.target.value);};
    $(".bsx-t",h).onchange=e=>show(e.target.value);
    BSX={select(s,t){if(t)st.t=t;setSort(s);}};
    setSort(st.s);});


  /* v31: the lesson follows the explorer. Sections carry data-sort (bubble B1–B14, then SL/IN/MG/QK/HP/CT/RX/BK/CY/DF for the
     other sorts); only the selected sort's sections and sidebar entries show (.sx-hide), the "Next →" cards skip hidden ones,
     a link or hash to a hidden section switches the sort, and "▶ See it" buttons (.bs-seeit data-sx="sort:type") open the
     explorer on that exact code. */
  var BSX;   /* set by the explorer when it opens (hoisted, so the order of the blocks does not matter) */
  var SORTSECS=null,lastNext=null;
  function applySort(s){SORTSECS=SORTSECS||$$(".wrap>section[data-sort]");if(!SORTSECS.length)return;const cur=s&&SORTSECS.some(x=>x.dataset.sort===s)?s:"bubble";document.body.dataset.sort=cur;
    SORTSECS.forEach(x=>x.classList.toggle("sx-hide",x.dataset.sort!==cur));
    $$("#toc .ti[data-id]").forEach(a=>{const x=document.getElementById(a.dataset.id);if(x&&x.dataset.sort)a.classList.toggle("sx-hide",x.dataset.sort!==cur);});
    const all=$$(".wrap>section"),vis=all.filter(x=>!x.classList.contains("sx-hide"));
    if(!lastNext){const a=$("a.secnext",all[all.length-1]||document.body);if(a)lastNext={href:a.getAttribute("href"),html:a.innerHTML};}
    const info=id=>(thisPage&&thisPage.sections.find(q=>q.id===id))||{n:"",t:id};
    vis.forEach((x,i)=>{const a=$("a.secnext",x);if(!a)return;const nx=vis[i+1];
      if(nx){const q=info(nx.id);a.setAttribute("href","#"+nx.id);a.innerHTML='<span class="sn-n">'+esc(q.n)+"</span><span><small>Next</small><b>"+esc(q.t)+'</b></span><span class="sn-go" aria-hidden="true">→</span>';}
      else if(lastNext){a.setAttribute("href",lastNext.href);a.innerHTML=lastNext.html;}});
    vis.forEach(x=>$$(".CodeMirror",x).forEach(c=>{try{c.CodeMirror.refresh();}catch(e){}}));}
  const sortOf=id=>{const el=id&&document.getElementById(id),sec=el&&el.closest("section[data-sort]");return sec?sec.dataset.sort:null;};
  const pick=(s,t)=>{let o={};try{o=JSON.parse(store.get("js1-bsx")||"{}");}catch(e){}o.s=s;if(t)o.t=t;store.set("js1-bsx",JSON.stringify(o));if(BSX)BSX.select(s,t);else applySort(s);};
  if($$(".wrap>section[data-sort]").length){let s0=null;try{s0=JSON.parse(store.get("js1-bsx")||"{}").s;}catch(e){}
    const hs=sortOf(decodeURIComponent(location.hash.slice(1)));if(hs&&hs!==s0)pick(hs);else applySort(s0);
    setTimeout(()=>{applySort(document.body.dataset.sort);const el=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(hs&&el)el.scrollIntoView();},0);
    addEventListener("hashchange",()=>{const id=decodeURIComponent(location.hash.slice(1)),s=sortOf(id);if(s&&s!==document.body.dataset.sort){pick(s);const el=document.getElementById(id);if(el)el.scrollIntoView();}});
    document.addEventListener("click",e=>{const b=e.target.closest(".bs-seeit");if(b){const [s,t]=b.dataset.sx.split(":");pick(s,t);const x=$("#bs-explorer");if(x)x.scrollIntoView({behavior:still?"auto":"smooth"});return;}
      const a=e.target.closest('a[href^="#"]');if(a){const id=decodeURIComponent(a.getAttribute("href").slice(1)),s=sortOf(id);if(s&&s!==document.body.dataset.sort)pick(s);}},true);}


  /* v33 learning path (#bsPath) and the three moves (#bsMoves), Lesson 06 B0. The path is the order to learn the sorts from scratch;
     a step is done (js1-path) when you press "Next in the path" at the end of it, or tick it by hand. */
  const PATH=[["basics","Basics: the 3 moves + Big-O","bsMoves"],["bubble","Bubble sort","bs-what"],["selection","Selection sort","sl-idea"],["insertion","Insertion sort","in-idea"],["merge","Merge sort","mg-idea"],
    ["quick","Quick sort","qk-idea"],["heap","Heap sort","hp-idea"],["counting","Counting sort","ct-idea"],["radix","Radix sort","rx-idea"],["bucket","Bucket sort","bk-idea"],["cyclic","Cyclic sort","cy-idea"],["dnf","Dutch National Flag","df-idea"]];
  const pathDone=()=>{try{return JSON.parse(store.get("js1-path")||"{}");}catch(e){return {};}};
  const setDone=(k,v)=>{const d=pathDone();if(v)d[k]=1;else delete d[k];store.set("js1-path",JSON.stringify(d));drawPath();};
  const openStep=k=>{const p=PATH.find(x=>x[0]===k);if(!p)return;if(k!=="basics")pick(k);const el=document.getElementById(p[2]);if(el)setTimeout(()=>el.scrollIntoView({behavior:still?"auto":"smooth",block:"start"}),30);};
  function drawPath(){const h=$("#bsPath");if(!h)return;const d=pathDone(),n=PATH.filter(p=>d[p[0]]).length,cur=document.body.dataset.sort,next=PATH.find(p=>!d[p[0]]);
    h.innerHTML=head("Your learning path","12 steps from zero; each step ends with a quiz and a Next button")+'<div class="vbody"><div class="lp-top"><div class="lp-bar"><i style="transform:scaleX('+(n/PATH.length)+')"></i></div><b>'+n+" of "+PATH.length+" done</b>"+
      (next?'<button type="button" class="btn pri" data-lp="'+next[0]+'">'+(n?"Continue":"Start")+": "+esc(next[1])+" →</button>":'<span class="lp-fin">Path complete! Drill it in the <a href="'+ROOT+'practice.html#mock">mock interview</a>.</span>')+'</div>'+
      '<ol class="lp-steps">'+PATH.map((p,i)=>'<li class="'+(d[p[0]]?"done":"")+(cur===p[0]&&p[0]!=="basics"?" cur":"")+'"><button type="button" class="lp-go" data-lp="'+p[0]+'"><span class="lp-n">'+(d[p[0]]?"✓":i)+"</span>"+esc(p[1])+'</button><button type="button" class="lp-tick" data-lt="'+p[0]+'" aria-label="Mark '+esc(p[1])+(d[p[0]]?' as not done':' as done')+'" title="'+(d[p[0]]?"Mark as not done":"Mark as done")+'">'+(d[p[0]]?"↺":"✓")+"</button></li>").join("")+"</ol></div>";}
  if($("#bsPath")){drawPath();$("#bsPath").addEventListener("click",e=>{const g=e.target.closest("[data-lp]"),t=e.target.closest("[data-lt]");if(g)openStep(g.dataset.lp);else if(t)setDone(t.dataset.lt,!pathDone()[t.dataset.lt]);});
    new MutationObserver(drawPath).observe(document.body,{attributes:true,attributeFilter:["data-sort"]});}
  document.addEventListener("click",e=>{const b=e.target.closest(".bs-pathnext");if(!b)return;if(b.dataset.from)setDone(b.dataset.from,true);
    if(b.dataset.next)openStep(b.dataset.next);else{const x=$("#bs-explorer");if(x)x.scrollIntoView({behavior:still?"auto":"smooth"});}});

  /* the three moves: compare, swap (with a temp "glass"), shift */
  lazy($("#bsMoves"),h=>{
    const MV={
      compare:{t:"Compare",code:["if (a[0] > a[1]) {","    // swap, shift or move on","}"],start:{a:[7,3]},fr:[
        {a:[7,3],hot:[0,1],line:0,m:"Read a[0] = 7 and a[1] = 3. Is 7 &gt; 3? <b>Yes.</b> A comparison only <b>reads</b>: the array does not change."},
        {a:[7,3],hot:[0,1],line:1,m:"The answer decides the next move: swap them, shift one, or leave them. Sorts are measured by how many comparisons and moves they make."}]},
      swap:{t:"Swap",code:["int t = a[0];","a[0] = a[1];","a[1] = t;"],start:{a:[7,3],t:null},fr:[
        {a:[7,3],t:7,hot:[0],th:1,line:0,m:"Pour a[0] into the empty glass <code>t</code>. Now 7 is safe in t."},
        {a:[3,3],t:7,hot:[0],line:1,m:"Pour a[1] into a[0]. a[0] is 3 now. Without t, the 7 would be lost forever."},
        {a:[3,7],t:7,hot:[1],th:1,line:2,m:"Pour t into a[1]. <b>Swapped</b>: 3 assignments and one temporary variable, O(1) time and O(1) space."}],
        alt:{t:"Try it without t",code:["a[0] = a[1];","a[1] = a[0];   // a[0] is already 3!"],fr:[
          {a:[3,3],hot:[0],line:0,m:"a[0] = a[1]: a[0] becomes 3 and the 7 is overwritten."},
          {a:[3,3],hot:[1],bad:1,line:1,m:"a[1] = a[0] copies the 3 back. Both are 3; the 7 is gone. <b>This is why a swap needs a temporary variable.</b>"}]}},
      shift:{t:"Shift",code:["int key = a[3];","a[3] = a[2];   // 8 > key","a[2] = a[1];   // 5 > key","// a[0] = 2 > key ? no: stop","a[1] = key;"],start:{a:[2,5,8,4],t:null},fr:[
        {a:[2,5,8,4],t:4,free:3,hot:[3],th:1,line:0,m:"Lift out <code>key = 4</code>. Its slot is now free to be overwritten. (This is how insertion sort works.)"},
        {a:[2,5,8,8],t:4,hot:[3],line:1,m:"8 is bigger than the key, so <b>shift</b> it one slot right. For a moment 8 appears twice; that is fine."},
        {a:[2,5,5,8],t:4,hot:[2],line:2,m:"5 is bigger than the key: shift it right too."},
        {a:[2,5,5,8],t:4,cmp:[0],line:3,m:"2 is not bigger than 4: stop. The gap is at index 1."},
        {a:[2,4,5,8],t:4,hot:[1],th:1,line:4,m:"Drop the key into the gap. A shift is <b>one</b> write, cheaper than a swap's three."}]}};
    let tab="swap",alt=false,k=-1,timer=null;
    h.innerHTML=head("The three moves of every sort","Compare, swap, shift: every sort in this lesson is built from these")+
      '<div class="seg" role="tablist">'+Object.keys(MV).map(x=>'<button type="button" data-mv="'+x+'" class="'+(x===tab?"on":"")+'">'+MV[x].t+"</button>").join("")+"</div>"+
      '<div class="vbody"><div class="mv-row"><div class="mv-cells"></div><div class="mv-glass"><b></b><small>t</small></div></div><div class="ol-code mv-code"></div>'+
      '<div class="ctrl"><button type="button" class="btn" data-a="back">◀ Back</button><button type="button" class="btn pri" data-a="play">▶ Play</button><button type="button" class="btn" data-a="next">Next ▶</button><button type="button" class="chip mv-alt" hidden>Try it without t</button><span class="count"></span></div><div class="msg" aria-live="polite"></div></div>';
    const cur=()=>alt&&MV[tab].alt?MV[tab].alt:MV[tab];
    const draw=()=>{const M=cur(),f=k>=0?M.fr[k]:null,a=f?f.a:MV[tab].start.a;
      $(".mv-cells",h).innerHTML=a.map((v,i)=>'<div class="mv-c'+(f&&f.hot&&f.hot.includes(i)?(f.bad?" bad":" hot"):"")+(f&&f.cmp&&f.cmp.includes(i)?" cmp":"")+(f&&f.free===i?" free":"")+'"><small>a['+i+"]</small><b>"+v+"</b></div>").join("");
      const g=$(".mv-glass",h);g.hidden=tab==="compare";$("b",g).textContent=f&&f.t!=null?f.t:"";$("small",g).textContent=tab==="shift"?"key":"t";g.classList.toggle("hot",!!(f&&f.th));
      $(".mv-code",h).innerHTML=M.code.map((l,i)=>'<div class="ol-l'+(f&&f.line===i?" cur":"")+'">'+hl(l)+"</div>").join("");
      $(".msg",h).innerHTML=f?f.m:(tab==="compare"?"Press <b>Next</b>: how a sort asks \"are these two in the wrong order?\"":tab==="swap"?"Two glasses of juice and you want to exchange them: you need a third, empty glass. Press <b>Next</b>.":"Insert 4 into the sorted part [2, 5, 8] by sliding bigger values right. Press <b>Next</b>.");
      $(".count",h).textContent=(k+1)+" / "+M.fr.length;$('[data-a="back"]',h).disabled=k<0;$('[data-a="next"]',h).disabled=k>=M.fr.length-1;
      const ab=$(".mv-alt",h);ab.hidden=tab!=="swap";ab.textContent=alt?"Back to the correct swap":"Try it without t";};
    const stop=()=>{clearTimeout(timer);timer=null;$('[data-a="play"]',h).textContent="▶ Play";};
    h.addEventListener("click",e=>{const t=e.target.closest("[data-mv]");if(t){stop();tab=t.dataset.mv;alt=false;k=-1;$$("[data-mv]",h).forEach(x=>x.classList.toggle("on",x===t));draw();return;}
      if(e.target.closest(".mv-alt")){if(!MV[tab].alt)return;stop();alt=!alt;k=-1;draw();return;}
      const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a,n=cur().fr.length;
      if(a==="next"){stop();k=Math.min(n-1,k+1);draw();}else if(a==="back"){stop();k=Math.max(-1,k-1);draw();}
      else{if(timer){stop();return;}if(k>=n-1)k=-1;b.textContent="❚❚ Pause";const tick=()=>{if(k>=cur().fr.length-1){stop();return;}k++;draw();timer=setTimeout(tick,still?400:1500);};timer=setTimeout(tick,60);}});
    draw();h.mvApi={MV,get k(){return k;}};});

  /* ---------- valet analogy ---------- */
  lazy($("#anValet"),h=>{
    const COL=["#ef4444","#3b82f6","#f59e0b","#10b981","#a855f7","#ec4899"];let cars,F=[],k=-1,timer=null;
    h.innerHTML=head("The valet who can only swap neighbours","Cars must stand from shortest to longest; he may only swap two cars that are side by side")+
      '<div class="an-hooks"><span>car length = the value</span><span>compare two <b>neighbours</b></span><span>front car longer → <b>swap</b></span><span>each walk <b>parks</b> the longest at the end</span></div>'+
      '<div class="vbody"><div class="bs-lane"><div class="bs-cars"></div><div class="bs-valet" aria-hidden="true"><svg viewBox="0 0 24 40"><circle cx="12" cy="7" r="5"/><path d="M5 38V20Q5 14 12 14Q19 14 19 20V38H15V27H9V38Z"/></svg><span>valet</span></div></div>'+
      '<div class="ctrl"><button type="button" class="btn" data-a="back">◀ Back</button><button type="button" class="btn pri" data-a="play">▶ Play</button><button type="button" class="btn" data-a="next">Next ▶</button><button type="button" class="chip" data-a="new">New cars</button><span class="count"></span></div><div class="msg" aria-live="polite"></div></div>';
    const lane=$(".bs-cars",h),val=$(".bs-valet",h);
    const load=()=>{const L=[1,2,3,4,5,6].sort(()=>Math.random()-.5).slice(0,5);cars=L.map((v,i)=>({v,c:COL[(v-1)%6]}));
      const T=tracer(L);VAR.flag.run(T);F=T.frames.filter(f=>f.key!=="reset");k=-1;
      lane.innerHTML=cars.map((c,i)=>'<div class="bs-car" data-id="'+i+'"><div style="width:'+(46+c.v*9)+'%">'+(OLF?OLF.carSvg(c.c):"🚗")+"</div><small>"+(3+c.v*.5).toFixed(1)+" m</small></div>").join("")+'<div class="bs-sign">PARKED</div>';go(-1);};
    const go=i=>{k=Math.max(-1,Math.min(F.length-1,i));const f=k>=0?F[k]:null,ids=f?f.ids:cars.map((_,i)=>i),fin=new Set(f?f.fin:[]);
      ids.forEach((id,pos)=>{const e=$('.bs-car[data-id="'+id+'"]',h);e.style.transform="translateX("+pos*100+"%)";e.classList.toggle("fin",fin.has(pos)||!!(f&&f.key==="done"));e.classList.toggle("hot",!!(f&&f.cmp&&(pos===f.cmp[0]||pos===f.cmp[1])&&f.key!=="done"));e.classList.toggle("sw",!!(f&&f.sw&&(pos===f.cmp[0]||pos===f.cmp[1])));});
      const pos=f&&f.cmp?f.cmp[0]:0;val.style.transform="translateX("+(pos+.5)*100+"%)";
      const len=v=>(3+v*.5).toFixed(1)+" m";let m;
      if(!f)m="Five cars, in random order. The valet starts at the front of the lane. Press <b>Play</b>.";
      else if(f.key==="done")m="<b>All cars are parked, shortest to longest.</b> "+f.comps+" comparisons and "+f.swaps+" swaps. Each walk parked one more car at the end: that is bubble sort.";
      else if(f.key==="check")m=/no swaps/i.test(f.msg)?"A whole walk with <b>no swaps</b>: every car is shorter than the one behind it. The valet goes home early (the swapped flag).":"End of walk "+f.pass+": the longest car still unparked has reached the end of the lane and is <b>parked</b>. Next walk stops one car earlier.";
      else if(f.sw)m="Swap! The two cars trade places; the longer one moves one slot back.";
      else{const x=f.vals[f.cmp[0]],y=f.vals[f.cmp[1]];m="Walk "+f.pass+": the valet compares the car in slot "+f.cmp[0]+" ("+len(x)+") with slot "+f.cmp[1]+" ("+len(y)+"). "+(x>y?"The front one is longer, so he swaps them.":"Already in order, he walks on.");}
      $(".msg",h).innerHTML=m;$(".count",h).textContent=(k+1)+" / "+F.length;$(".bs-sign",h).classList.toggle("on",!!(f&&f.fin.length));};
    const stop=()=>{clearTimeout(timer);timer=null;$('[data-a="play"]',h).textContent="▶ Play";};
    h.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
      if(a==="next"){stop();go(k+1);}else if(a==="back"){stop();go(k-1);}else if(a==="new"){stop();load();}
      else{if(timer){stop();return;}if(k>=F.length-1)go(-1);b.textContent="❚❚ Pause";const t=()=>{if(k>=F.length-1){stop();return;}go(k+1);timer=setTimeout(t,still?500:1100);};timer=setTimeout(t,80);}});
    load();});

  /* ---------- stability lab ---------- */
  lazy($("#bsStable"),h=>{
    const D=[{v:2,t:"A"},{v:1,t:"A"},{v:2,t:"B"},{v:3,t:"A"},{v:1,t:"B"},{v:2,t:"C"}];let ge=false,F=[],k=-1,timer=null;
    h.innerHTML=head("Stability lab","Equal values carry a tag (A, B, C = their input order). Does the sort keep that order?")+
      '<div class="vbody"><div class="seg bs-seg" role="group" aria-label="Comparison"><button type="button" class="on" data-g="0"><code>if (a[j] &gt; a[j+1])</code> strict</button><button type="button" data-g="1"><code>if (a[j] &gt;= a[j+1])</code> or equal</button></div>'+
      '<div class="bs-cards"></div><div class="bs-verdict"></div>'+
      '<div class="ctrl"><button type="button" class="btn" data-a="back">◀ Back</button><button type="button" class="btn pri" data-a="play">▶ Play</button><button type="button" class="btn" data-a="next">Next ▶</button><button type="button" class="chip" data-a="end">Jump to result</button><span class="count"></span></div><div class="msg" aria-live="polite"></div></div>';
    const box=$(".bs-cards",h);
    const load=()=>{const T=tracer(D,{ge});VAR.flag.run(T);F=T.frames.filter(f=>f.key==="cmp"||f.key==="swap"||f.key==="done");k=-1;
      box.style.setProperty("--n",D.length);box.innerHTML=D.map((d,i)=>'<div class="bs-card t'+d.t+'" data-id="'+i+'"><b>'+d.v+"</b><small>"+d.t+"</small></div>").join("");go(-1);};
    const go=i=>{k=Math.max(-1,Math.min(F.length-1,i));const f=k>=0?F[k]:null,ids=f?f.ids:D.map((_,i)=>i);
      ids.forEach((id,pos)=>{const e=$('.bs-card[data-id="'+id+'"]',box);e.style.transform="translateX("+pos*100+"%)";e.classList.toggle("hot",!!(f&&f.cmp&&f.key!=="done"&&(pos===f.cmp[0]||pos===f.cmp[1])));});
      let v="";if(f&&f.key==="done"){const by={};f.vals.forEach((x,i)=>(by[x]=by[x]||[]).push(f.tags[i]));const ok=Object.values(by).every(t=>t.join("")===t.slice().sort().join(""));
        v=Object.keys(by).map(x=>{const t=by[x],good=t.join("")===t.slice().sort().join("");return '<span class="'+(good?"bs-ok":"bs-no")+'">'+x+": "+t.join(" → ")+(good?" ✓":" ✗")+"</span>";}).join("")+
          '<p>'+(ok?"<b>Stable.</b> Every group of equal values kept its input order A → B → C. Swaps: "+f.swaps+".":"<b>Not stable.</b> Equal values were swapped past each other, so their input order is lost, and it cost "+f.swaps+" swaps instead of 6.")+"</p>";}
      $(".bs-verdict",h).innerHTML=v;$(".msg",h).innerHTML=f?f.msg:"Input <code>[2ᴬ, 1ᴬ, 2ᴮ, 3ᴬ, 1ᴮ, 2ᶜ]</code>. Pick a comparison and press <b>Play</b>.";$(".count",h).textContent=(k+1)+" / "+F.length;};
    const stop=()=>{clearTimeout(timer);timer=null;$('[data-a="play"]',h).textContent="▶ Play";};
    h.addEventListener("click",e=>{const g=e.target.closest("[data-g]");if(g){stop();ge=g.dataset.g==="1";$$(".bs-seg button",h).forEach(x=>x.classList.toggle("on",x===g));load();return;}
      const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
      if(a==="next"){stop();go(k+1);}else if(a==="back"){stop();go(k-1);}else if(a==="end"){stop();go(F.length-1);}
      else{if(timer){stop();return;}if(k>=F.length-1)go(-1);b.textContent="❚❚ Pause";const t=()=>{if(k>=F.length-1){stop();return;}go(k+1);timer=setTimeout(t,still?300:750);};timer=setTimeout(t,60);}});
    load();});

  /* ---------- inversions grid ---------- */
  lazy($("#bsInv"),h=>{let A=[4,7,2,6,1,5,3],F=[],k=-1,timer=null,total=0;
    h.innerHTML=head("Inversions grid","A lit cell (x, y) means the bigger value x still stands before the smaller value y. Each swap switches off exactly one cell.")+
      '<div class="vbody"><div class="bs-inv"><div><h5>Array</h5><div class="bs-row"></div><div class="bs-ic"></div></div><div><h5>Inversion pairs</h5><div class="bs-grid"></div></div></div>'+
      '<div class="ctrl"><button type="button" class="btn" data-a="back">◀ Back</button><button type="button" class="btn pri" data-a="play">▶ Play</button><button type="button" class="btn" data-a="next">Next ▶</button><button type="button" class="chip" data-a="new">Shuffle</button><span class="count"></span></div><div class="msg" aria-live="polite"></div></div>';
    const inv=a=>{const s=new Set();for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i]>a[j])s.add(a[i]+","+a[j]);return s;};
    const load=()=>{const T=tracer(A);VAR.flag.run(T);F=T.frames.filter(f=>f.key==="cmp"||f.key==="swap"||f.key==="done");total=inv(A).size;k=-1;
      const vs=A.slice().sort((x,y)=>x-y),n=vs.length;let g='<div class="bs-gc"></div>'+vs.slice(0,n-1).map(y=>'<div class="bs-gh">'+y+"</div>").join("");
      vs.slice(1).forEach(x=>{g+='<div class="bs-gh">'+x+"</div>"+vs.slice(0,n-1).map(y=>y<x?'<div class="bs-cell" data-p="'+x+","+y+'" title="'+x+" before "+y+'"></div>':'<div class="bs-cell off"></div>').join("");});
      const gr=$(".bs-grid",h);gr.style.gridTemplateColumns="28px repeat("+(n-1)+",minmax(0,34px))";gr.innerHTML=g;go(-1);};
    const go=i=>{k=Math.max(-1,Math.min(F.length-1,i));const f=k>=0?F[k]:null,a=f?f.vals:A,S=inv(a),c=f&&f.cmp&&f.key!=="done"?f.cmp:null;
      $(".bs-row",h).innerHTML=a.map((v,p)=>'<span class="'+(c&&(p===c[0]||p===c[1])?(f.sw?"sw":"hot"):"")+'">'+v+"</span>").join("");
      let just=null;if(f&&f.sw)just=f.vals[f.cmp[1]]+","+f.vals[f.cmp[0]];
      $$(".bs-cell[data-p]",h).forEach(e=>{e.classList.toggle("on",S.has(e.dataset.p));e.classList.toggle("gone",e.dataset.p===just);});
      const sw=f?f.swaps:0;$(".bs-ic",h).innerHTML="<b>"+S.size+"</b> inversions left + <b>"+sw+"</b> swaps done = <b>"+(S.size+sw)+"</b> (always "+total+")";
      $(".msg",h).innerHTML=!f?"Start: <code>["+A.join(", ")+"]</code> has <b>"+total+"</b> inversions, so bubble sort will make exactly "+total+" swaps.":f.key==="done"?"<b>0 inversions left:</b> sorted, after exactly "+f.swaps+" swaps. Swaps = inversions.":f.sw?"Swapping "+f.vals[f.cmp[1]]+" and "+f.vals[f.cmp[0]]+" fixes the pair ("+just.replace(","," before ")+") and no other pair changes order: one cell switches off.":f.msg;
      $(".count",h).textContent=(k+1)+" / "+F.length;};
    const stop=()=>{clearTimeout(timer);timer=null;$('[data-a="play"]',h).textContent="▶ Play";};
    h.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
      if(a==="next"){stop();go(k+1);}else if(a==="back"){stop();go(k-1);}else if(a==="new"){stop();A=distinct(7).map((_,i)=>i+1).sort(()=>Math.random()-.5);load();}
      else{if(timer){stop();return;}if(k>=F.length-1)go(-1);b.textContent="❚❚ Pause";const t=()=>{if(k>=F.length-1){stop();return;}go(k+1);timer=setTimeout(t,still?300:650);};timer=setTimeout(t,60);}});
    load();});

  /* ---------- complexity chart ---------- */
  const SER=[["brute","V1 brute"],["standard","V2 standard"],["flag","V3 flag"],["lastswap","V4 last swap"],["shaker","V9 shaker"],["comb","V11 comb"]];
  let seed=1;const srand=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const genIn=(kind,n)=>{const a=Array.from({length:n},(_,i)=>i);if(kind==="sorted")return a;if(kind==="reversed")return a.reverse();
    if(kind==="nearly"){for(let t=0;t<Math.max(1,n/20);t++){const i=Math.floor(srand()*(n-1));[a[i],a[i+1]]=[a[i+1],a[i]];}return a;}
    for(let i=n-1;i>0;i--){const j=Math.floor(srand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const count=(vk,arr)=>{const T=tracer(arr,{rec:false});VAR[vk].run(T);return {c:T.comps,s:T.swaps};};
  window.BUBBLE={VAR,tracer,count};   /* test hook */
  lazy($("#bsChart"),h=>{const NS=[];for(let n=4;n<=64;n+=4)NS.push(n);let kind="random",metric="c",on=new Set(SER.map(s=>s[0])),scale="lin";
    h.innerHTML=head("Complexity chart","Measured in your browser for n = 4 … 64; dashed lines are the reference curves")+
      '<div class="vbody"><div class="bs-opts"><label class="ol-tog">Input <select class="bs-k"><option value="random">Random (average of 5)</option><option value="sorted">Sorted (best case)</option><option value="nearly">Nearly sorted</option><option value="reversed">Reversed (worst case)</option></select></label>'+
      '<div class="seg bs-seg" role="group" aria-label="Measure"><button type="button" class="on" data-m="c">Comparisons</button><button type="button" data-m="s">Swaps</button></div>'+
      '<div class="seg bs-seg" role="group" aria-label="Scale"><button type="button" class="on" data-s="lin">Linear</button><button type="button" data-s="log">Log</button></div></div>'+
      '<div class="bs-legend">'+SER.map((s,i)=>'<button type="button" class="bs-lg on" data-k="'+s[0]+'" style="--c:var(--bs-s'+(i+1)+')" aria-pressed="true"><i></i>'+s[1]+"</button>").join("")+'<span class="bs-lg ref"><i></i>reference</span></div>'+
      '<div class="bs-plot"><svg class="bs-svg" role="img" aria-label="Comparisons against n for each bubble sort variant"></svg><div class="bs-tip" hidden></div></div>'+
      '<details class="bs-data"><summary>Show the numbers</summary><div class="tw"><table></table></div></details><div class="msg" aria-live="polite"></div></div>';
    const svg=$(".bs-svg",h),tip=$(".bs-tip",h);let D={};
    const compute=()=>{D={};SER.forEach(([vk])=>{D[vk]=NS.map(n=>{const runs=kind==="random"||kind==="nearly"?5:1;let c=0,s=0;seed=n*7+1;for(let r=0;r<runs;r++){const x=count(vk,genIn(kind,n));c+=x.c;s+=x.s;}return metric==="c"?c/runs:s/runs;});});};
    const REF=[["n",n=>n],["n²/2",n=>n*n/2],["n²",n=>n*n]];
    const draw=()=>{const W=Math.max(320,svg.clientWidth||640),H=300,m={l:56,r:46,t:14,b:34},pw=W-m.l-m.r,ph=H-m.t-m.b;svg.setAttribute("viewBox","0 0 "+W+" "+H);
      const vis=SER.filter(s=>on.has(s[0]));let mx=1;vis.forEach(s=>D[s[0]].forEach(v=>mx=Math.max(mx,v)));mx=Math.max(mx,64*64/2);if(on.has("brute")&&metric==="c")mx=Math.max(mx,64*64);
      const lg=scale==="log",y=v=>m.t+ph-(lg?Math.log10(Math.max(1,v))/Math.log10(mx):v/mx)*ph,x=n=>m.l+(n-4)/(60)*pw;
      let g="";const ticks=lg?[1,10,100,1000,10000].filter(t=>t<=mx*1.01):[0,.25,.5,.75,1].map(f=>Math.round(mx*f));
      ticks.forEach(t=>{g+='<line class="bs-gl" x1="'+m.l+'" x2="'+(W-m.r)+'" y1="'+y(t)+'" y2="'+y(t)+'"/><text class="bs-ax" x="'+(m.l-8)+'" y="'+(y(t)+4)+'" text-anchor="end">'+t.toLocaleString()+"</text>";});
      [4,16,32,48,64].forEach(n=>{g+='<text class="bs-ax" x="'+x(n)+'" y="'+(H-12)+'" text-anchor="middle">'+n+"</text>";});
      g+='<text class="bs-ax" x="'+(W-m.r)+'" y="'+(H-12)+'" text-anchor="start" dx="8">n</text>';
      if(metric==="c")REF.forEach(([nm,f])=>{const pts=NS.map(n=>[x(n),y(Math.min(f(n),mx))]);g+='<path class="bs-ref" d="M'+pts.map(p=>p.join(" ")).join("L")+'"/>';const last=pts[pts.length-1];if(f(64)<=mx*1.01)g+='<text class="bs-rl" x="'+(last[0]+4)+'" y="'+(last[1]+4)+'">'+nm+"</text>";});
      SER.forEach(([vk],i)=>{if(!on.has(vk))return;const pts=NS.map((n,j)=>[x(n),y(D[vk][j])]);g+='<path class="bs-line" style="stroke:var(--bs-s'+(i+1)+')" d="M'+pts.map(p=>p.map(v=>v.toFixed(1)).join(" ")).join("L")+'"/>';});
      g+='<line class="bs-cross" x1="0" x2="0" y1="'+m.t+'" y2="'+(m.t+ph)+'" hidden/>';
      svg.innerHTML=g;svg.dataset.m=JSON.stringify(m);
      $("table",h).innerHTML="<tr><th>n</th>"+SER.map(s=>"<th>"+s[1]+"</th>").join("")+"</tr>"+NS.map((n,j)=>"<tr><td>"+n+"</td>"+SER.map(s=>"<td>"+Math.round(D[s[0]][j]).toLocaleString()+"</td>").join("")+"</tr>").join("");
      const at=(vk,n)=>Math.round(D[vk][NS.indexOf(n)]).toLocaleString();
      $(".msg",h).innerHTML=metric==="s"?"Swaps are the same for every adjacent-swap variant on the same input (they all remove one inversion per swap): "+at("flag",64)+" at n = 64. Only comb sort, which swaps over a gap, differs ("+at("comb",64)+").":
        kind==="sorted"?"Sorted input: V3, V4 and the shaker stop after one pass, <b>n − 1</b> comparisons ("+at("flag",64)+" at n = 64), right on the <b>n</b> line. V1 and V2 do not notice: "+at("brute",64)+" and "+at("standard",64)+".":
        kind==="reversed"?"Reversed input: every adjacent-swap variant needs n(n−1)/2 = "+at("standard",64)+" comparisons at n = 64 (the <b>n²/2</b> line); V1 needs (n−1)² = "+at("brute",64)+". Comb sort: "+at("comb",64)+".":
        kind==="nearly"?"Nearly sorted: the flag variants need only a few passes ("+at("flag",64)+" comparisons at n = 64) while V2 still pays the full "+at("standard",64)+".":
        "Random input: the flag barely helps ("+at("flag",64)+" vs "+at("standard",64)+" at n = 64). The cocktail shaker saves a bit ("+at("shaker",64)+"); comb sort is far below ("+at("comb",64)+"), close to n log n.";};
    const all=()=>{compute();draw();};
    const dark=()=>{const c=getComputedStyle(document.body).backgroundColor.match(/\d+/g)||[255,255,255];h.classList.toggle("bs-dk",(+c[0]*.299+ +c[1]*.587+ +c[2]*.114)<128);};
    dark();addEventListener("themechange",()=>{dark();});
    h.addEventListener("change",e=>{if(e.target.matches(".bs-k")){kind=e.target.value;all();}});
    h.addEventListener("click",e=>{const b=e.target.closest("[data-m],[data-s],.bs-lg[data-k]");if(!b)return;
      if(b.dataset.m){metric=b.dataset.m;$$("[data-m]",h).forEach(x=>x.classList.toggle("on",x===b));all();}
      else if(b.dataset.s){scale=b.dataset.s;$$("[data-s]",h).forEach(x=>x.classList.toggle("on",x===b));draw();}
      else{const k2=b.dataset.k;if(on.has(k2)&&on.size>1)on.delete(k2);else on.add(k2);b.classList.toggle("on",on.has(k2));b.setAttribute("aria-pressed",on.has(k2));draw();}});
    svg.addEventListener("pointermove",e=>{const r=svg.getBoundingClientRect(),m=JSON.parse(svg.dataset.m||"{}"),W=r.width,px=(e.clientX-r.left);
      const vb=svg.viewBox.baseVal,sx=vb.width/W,xx=px*sx,n=Math.max(4,Math.min(64,Math.round(((xx-m.l)/(vb.width-m.l-m.r)*60+4)/4)*4)),j=NS.indexOf(n),cx=m.l+(n-4)/60*(vb.width-m.l-m.r);
      const cr=$(".bs-cross",svg);cr.removeAttribute("hidden");cr.setAttribute("x1",cx);cr.setAttribute("x2",cx);
      tip.hidden=false;tip.innerHTML="<b>n = "+n+"</b>"+SER.map((s,i)=>on.has(s[0])?'<div><i style="background:var(--bs-s'+(i+1)+')"></i>'+s[1]+"<span>"+Math.round(D[s[0]][j]).toLocaleString()+"</span></div>":"").join("")+(metric==="c"?'<div class="r">n²/2 = '+(n*n/2).toLocaleString()+"</div>":"");
      const tx=cx/sx;tip.style.left=Math.min(Math.max(0,tx+12),W-tip.offsetWidth-4)+"px";});
    svg.addEventListener("pointerleave",()=>{tip.hidden=true;const cr=$(".bs-cross",svg);if(cr)cr.setAttribute("hidden","");});
    addEventListener("resize",()=>requestAnimationFrame(draw),{passive:true});
    all();});

  /* ---------- variant race ---------- */
  lazy($("#bsRace"),h=>{const LN=[["brute","V1 brute force"],["standard","V2 standard"],["flag","V3 swapped flag"],["lastswap","V4 last swap"],["shaker","V9 cocktail shaker"],["comb","V11 comb sort"]];
    let kind="random",n=24,lanes=[],timer=null,place=0;
    h.innerHTML=head("Variant race","Same data for every lane; each tick every lane makes one more comparison")+
      '<div class="vbody"><div class="bs-opts"><label class="ol-tog">Input <select class="bs-rk"><option value="random">Random</option><option value="nearly">Nearly sorted</option><option value="sorted">Sorted</option><option value="reversed">Reversed</option><option value="turtle">Turtle at the end</option></select></label>'+
      '<label class="ol-tog">n <input type="range" class="bs-rn" min="8" max="40" value="24"><b>24</b></label><label class="bs-spd small muted">speed <input type="range" class="bs-rs" min="1" max="10" value="5"></label></div>'+
      '<div class="bs-lanes"></div><div class="ctrl"><button type="button" class="btn pri" data-a="go">▶ Start</button><button type="button" class="btn" data-a="new">New data</button></div><div class="msg" aria-live="polite">Press <b>Start</b>. Comparisons are the clock: the lane with the fewest finishes first.</div></div>';
    const setup=()=>{stop();place=0;let base;if(kind==="turtle"){base=distinct(n).sort((a,b)=>a-b);base.push(base.shift());}else base=INPUTS[kind][1](n);
      const mx=Math.max(...base);lanes=LN.map(([vk,nm])=>{const T=tracer(base,{cap:100000});VAR[vk].run(T);const fr=T.frames.filter(f=>f.key==="done"||f.cmp&&!f.sw);return {vk,nm,fr,i:-1,done:false,tot:T.comps,sw:T.swaps,pl:0};});
      $(".bs-lanes",h).innerHTML=lanes.map(l=>'<div class="bs-lane2" data-k="'+l.vk+'"><div class="bs-ln"><b>'+l.nm+'</b><span class="bs-cnt">0</span><em></em></div><div class="bs-mini">'+base.map(v=>'<i style="height:'+(10+88*v/mx).toFixed(0)+'%"></i>').join("")+"</div></div>").join("");
      lanes.forEach(paintL);$(".msg",h).innerHTML="Data: <code>["+base.join(", ")+"]</code>. Press <b>Start</b>.";};
    const paintL=l=>{const idle=l.i<0,f=l.fr[Math.max(0,Math.min(l.i,l.fr.length-1))],el=$('.bs-lane2[data-k="'+l.vk+'"]',h),bars=$$(".bs-mini i",el),mx=Math.max(...f.vals),fin=new Set(f.fin);
      f.vals.forEach((v,p)=>{const b=bars[p];b.style.height=(10+88*v/mx).toFixed(0)+"%";b.className=idle?"":f.key==="done"||fin.has(p)?"fin":f.cmp&&(p===f.cmp[0]||p===f.cmp[1])?"hot":"";});
      $(".bs-cnt",el).textContent=(idle?0:f.comps).toLocaleString()+" comparisons";if(l.done){el.classList.add("won");$("em",el).textContent=["1st","2nd","3rd","4th","5th","6th"][l.pl-1]+" · "+l.tot.toLocaleString()+" cmp · "+l.sw.toLocaleString()+" swaps";}};
    const stop=()=>{clearInterval(timer);timer=null;const b=$('[data-a="go"]',h);if(b)b.textContent="▶ Start";};
    const tick=()=>{const per=Math.round(Math.pow(1.9,+$(".bs-rs",h).value-1));let fin=[];
      lanes.forEach(l=>{if(l.done)return;l.i=Math.min(l.fr.length-1,l.i+per);if(l.i>=l.fr.length-1){l.done=true;fin.push(l);}});
      fin.sort((a,b)=>a.tot-b.tot);let last=null;fin.forEach(l=>{if(last&&last.tot===l.tot)l.pl=last.pl;else l.pl=++place;last=l;});
      lanes.forEach(paintL);if(lanes.every(l=>l.done)){stop();verdict();}};
    const verdict=()=>{const r=lanes.slice().sort((a,b)=>a.tot-b.tot),get=k=>lanes.find(l=>l.vk===k).tot;
      const note={random:"On random data the flag rarely fires early, so V2–V4 are close; the shaker saves a little and comb sort's long jumps win by far.",nearly:"Nearly sorted data is where the flag shines: V3, V4 and the shaker finish after a couple of passes while V1 and V2 grind through every pair.",
        sorted:"Sorted data: one check pass (n − 1 comparisons) for every variant with a flag. V1 and V2 cannot tell.",reversed:"Reversed data is the worst case: every pair is an inversion, so V2–V4 and the shaker all need n(n−1)/2 comparisons. Only comb sort escapes.",
        turtle:"A turtle (the smallest value at the end) moves one slot left per forward pass, so V3/V4 need n − 1 passes; the shaker brings it home in one backward sweep."}[kind];
      $(".msg",h).innerHTML="<b>Finish order:</b> "+r.map(l=>l.nm+" ("+l.tot.toLocaleString()+")").join(" · ")+". "+note+" Swaps are equal ("+lanes[2].sw.toLocaleString()+") for every adjacent-swap lane: swaps = inversions.";};
    h.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;if(b.dataset.a==="new"){setup();return;}
      if(timer){stop();return;}if(lanes.every(l=>l.done))setup();b.textContent="❚❚ Pause";timer=setInterval(tick,still?120:60);});
    $(".bs-rk",h).onchange=e=>{kind=e.target.value;setup();};
    $(".bs-rn",h).oninput=e=>{n=+e.target.value;e.target.nextElementSibling.textContent=n;};$(".bs-rn",h).onchange=()=>setup();
    setup();});
})();


/* complexity labs (v32, Lesson 06 section "O(n)" #cx-complexity): #cxLoops (watch a loop pattern count its steps),
   #cxGrow (growth chart + "how long would it take" table), #cxTree (recursion tree: time = all calls, space = depth),
   #cxAmort (ArrayList growth: amortized O(1)). Counts match CountOps / RecursionCost / AmortizedGrowth on JDK 25. */
(function(){
  if(!$("#cxLoops,#cxGrow,#cxTree,#cxAmort"))return;
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const head=(t,s)=>'<div class="ol-head"><b>'+t+"</b><span>"+s+"</span></div>";
  const lazy=(el,f)=>{if(!el)return;const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();f(el);}},{rootMargin:"300px 0px"});io.observe(el);};
  const L2=Math.log2,num=x=>Math.round(x).toLocaleString("en-US");
  const sup=e=>String(e).split("").map(c=>"⁰¹²³⁴⁵⁶⁷⁸⁹"["0123456789".indexOf(c)]||c).join("");
  const big=lg=>lg<6?num(Math.pow(10,lg)):(Math.pow(10,lg-Math.floor(lg))).toFixed(1)+"×10"+sup(Math.floor(lg));   /* lg = log10 of the value */
  const ctl=extra=>'<div class="ctrl"><button type="button" class="btn" data-a="back">◀ Back</button><button type="button" class="btn pri" data-a="play">▶ Play</button><button type="button" class="btn" data-a="next">Next ▶</button>'+(extra||"")+'<span class="count"></span></div>';
  /* a small player over k = -1 … total-1 */
  function player(host,total,draw,ms){let k=-1,t=null;const P={get k(){return k;},total,
      go(i){k=Math.max(-1,Math.min(P.total-1,i));draw(k);$(".count",host).textContent=(k+1)+" / "+P.total;},
      stop(){clearTimeout(t);t=null;const b=$('[data-a="play"]',host);if(b)b.textContent="▶ Play";},
      play(){if(t){P.stop();return;}if(k>=P.total-1)P.go(-1);$('[data-a="play"]',host).textContent="❚❚ Pause";const tick=()=>{if(k>=P.total-1){P.stop();return;}P.go(k+1);t=setTimeout(tick,typeof ms==="function"?ms():ms);};t=setTimeout(tick,60);}};
    host.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;if(a==="next"){P.stop();P.go(k+1);}else if(a==="back"){P.stop();P.go(k-1);}else if(a==="play")P.play();});
    return P;}

  /* ---------- 1. loop patterns ---------- */
  const halves=n=>{const r=[];for(let i=n;i>0;i=Math.floor(i/2))r.push(i);return r;};
  const PAT={
    single:{n:"Single loop",code:["for (int i = 0; i < n; i++)","    ops++;"],R:n=>1,C:n=>n,cells:n=>Array.from({length:n},(_,i)=>[0,i]),cnt:n=>n,f:"n",o:"O(n)",d:"×2"},
    two:{n:"Two loops in a row",code:["for (int i = 0; i < n; i++) ops++;","for (int j = 0; j < n; j++) ops++;"],R:n=>2,C:n=>n,cells:n=>[...Array.from({length:n},(_,i)=>[0,i]),...Array.from({length:n},(_,j)=>[1,j])],cnt:n=>2*n,f:"n + n = 2n",o:"O(n)",d:"×2"},
    nested:{n:"Nested loops",code:["for (int i = 0; i < n; i++)","    for (int j = 0; j < n; j++)","        ops++;"],R:n=>n,C:n=>n,cells:n=>{const c=[];for(let i=0;i<n;i++)for(let j=0;j<n;j++)c.push([i,j]);return c;},cnt:n=>n*n,f:"n · n = n²",o:"O(n²)",d:"×4"},
    tri:{n:"Triangular nested (j > i)",code:["for (int i = 0; i < n; i++)","    for (int j = i + 1; j < n; j++)","        ops++;"],R:n=>n,C:n=>n,cells:n=>{const c=[];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)c.push([i,j]);return c;},cnt:n=>n*(n-1)/2,f:"n(n − 1)/2",o:"O(n²)",d:"×4"},
    half:{n:"Halving loop",code:["for (int i = n; i > 0; i /= 2)","    ops++;"],R:n=>1,C:n=>n,cells:n=>halves(n).map(i=>[0,i-1]),cnt:n=>halves(n).length,f:"⌊log₂ n⌋ + 1",o:"O(log n)",d:"+1"},
    nlogn:{n:"Loop × halving loop",code:["for (int i = 0; i < n; i++)","    for (int j = n; j > 0; j /= 2)","        ops++;"],R:n=>n,C:n=>n,cells:n=>{const c=[];for(let i=0;i<n;i++)halves(n).forEach(j=>c.push([i,j-1]));return c;},cnt:n=>n*halves(n).length,f:"n · (⌊log₂ n⌋ + 1)",o:"O(n log n)",d:"×2 and a bit"},
    geo:{n:"Halving outer, linear inner",code:["for (int i = n; i > 0; i /= 2)","    for (int j = 0; j < i; j++)","        ops++;"],R:n=>halves(n).length,C:n=>n,cells:n=>{const c=[];halves(n).forEach((i,r)=>{for(let j=0;j<i;j++)c.push([r,j]);});return c;},cnt:n=>halves(n).reduce((s,i)=>s+i,0),f:"n + n/2 + n/4 + … &lt; 2n",o:"O(n)",d:"×2"},
    dirs:{n:"Inner loop of constant size",code:["for (int i = 0; i < n; i++)","    for (int d = 0; d < 4; d++)   // 4 directions","        ops++;"],R:n=>n,C:n=>4,cells:n=>{const c=[];for(let i=0;i<n;i++)for(let d=0;d<4;d++)c.push([i,d]);return c;},cnt:n=>4*n,f:"4n",o:"O(n)",d:"×2"}
  };
  lazy($("#cxLoops"),h=>{let pk="nested",n=8,cells=[],P=null;
    h.innerHTML=head("Watch the loops count","Every lit cell is one run of ops++; the shape of the grid is the complexity")+
      '<div class="vbody"><div class="bs-opts"><label class="ol-tog">Pattern <select class="cx-p">'+Object.keys(PAT).map(k=>'<option value="'+k+'">'+PAT[k].n+"</option>").join("")+'</select></label>'+
      '<label class="ol-tog">n <input type="range" class="cx-n" min="1" max="16" value="8"><b class="cx-nv">8</b></label></div>'+
      '<div class="cx-two"><div><div class="ol-code cx-code"></div><div class="cx-stat"></div></div><div class="cx-gridw"><div class="cx-grid"></div></div></div>'+
      '<div class="tw cx-dbl"></div>'+ctl()+'<div class="msg" aria-live="polite"></div></div>';
    const draw=k=>{const p=PAT[pk];const g=$(".cx-grid",h),cs=g.children;
      for(let q=0;q<cs.length;q++)cs[q].className="";cells.forEach(([r,c],q)=>{const el=cs[r*p.C(n)+c];if(el&&q<=k)el.className=q===k?"cur":"on";});
      $(".cx-stat",h).innerHTML="<div><small>ops so far</small><b>"+(k+1)+"</b></div><div><small>total for n = "+n+"</small><b>"+num(p.cnt(n))+"</b></div><div><small>formula</small><b>"+p.f+"</b></div><div><small>Big-O</small><b>"+p.o+"</b></div>";
      $(".msg",h).innerHTML=k<0?"Press <b>Play</b>: each step runs <code>ops++</code> once and lights its cell (row = outer loop, column = inner loop).":k>=cells.length-1?"<b>Done: "+num(p.cnt(n))+" steps</b> for n = "+n+" ("+p.f+"). Double n and this pattern costs "+p.d+": that ratio <i>is</i> the complexity, "+p.o+".":"Step "+(k+1)+": <code>ops++</code> at row "+cells[k][0]+", column "+cells[k][1]+".";};
    const load=()=>{const p=PAT[pk];cells=p.cells(n);const g=$(".cx-grid",h),R=p.R(n),Cc=p.C(n);g.style.gridTemplateColumns="repeat("+Cc+",minmax(0,1fr))";g.innerHTML="<i></i>".repeat(R*Cc);
      $(".cx-code",h).innerHTML=p.code.map(l=>'<div class="ol-l">'+hl(l)+"</div>").join("");
      const ns=[10,100,1000,10000];$(".cx-dbl",h).innerHTML="<table><tr><th>n</th>"+ns.map(x=>"<th>"+num(x)+"</th>").join("")+"</tr><tr><td>steps</td>"+ns.map(x=>"<td>"+num(p.cnt(x))+"</td>").join("")+"</tr></table>";
      if(P)P.stop();P=player(h,cells.length,draw,()=>still?30:Math.max(25,900/Math.sqrt(cells.length)));P.go(-1);h.cxLoops={pk,n,cells,P};};
    $(".cx-p",h).value=pk;$(".cx-p",h).onchange=e=>{pk=e.target.value;load();};
    $(".cx-n",h).oninput=e=>{n=+e.target.value;$(".cx-nv",h).textContent=n;load();};
    load();h.cxApi={PAT,set(p,m){pk=p;n=m;$(".cx-p",h).value=p;$(".cx-n",h).value=m;$(".cx-nv",h).textContent=m;load();},get cells(){return cells;},get P(){return P;}};});

  /* ---------- 2. growth chart + how long would it take ---------- */
  const CLS=[["O(1)",n=>0],["O(log n)",n=>Math.log10(Math.max(1,L2(n)))],["O(n)",n=>Math.log10(n)],["O(n log n)",n=>Math.log10(n*Math.max(1,L2(n)))],["O(n²)",n=>2*Math.log10(n)],["O(2ⁿ)",n=>n*Math.log10(2)],["O(n!)",n=>{let s=0;for(let k=2;k<=Math.min(n,2000);k++)s+=Math.log10(k);if(n>2000)s=n*Math.log10(n/Math.E)+0.5*Math.log10(2*Math.PI*n);return s;}]];
  const p2=x=>String(Number(x.toPrecision(2)));
  const time=lg=>{const s=lg-8;if(s>17.64)return "longer than the age of the universe";const v=Math.pow(10,s);
    return v<1e-6?p2(v*1e9)+" ns":v<1e-3?p2(v*1e6)+" µs":v<1?p2(v*1e3)+" ms":v<60?p2(v)+" s":v<3600?p2(v/60)+" min":v<86400?p2(v/3600)+" hours":v<3.15e7?p2(v/86400)+" days":big(Math.log10(v/3.15e7))+" years";};
  lazy($("#cxGrow"),h=>{let N=20,lg=true,pick=1e6;
    h.innerHTML=head("Growth chart","How each class grows, and how long n steps take at about 10⁸ steps per second")+
      '<div class="vbody"><div class="bs-opts"><div class="seg bs-seg" role="group" aria-label="Range of n"><button type="button" data-N="10">n ≤ 10</button><button type="button" class="on" data-N="20">n ≤ 20</button><button type="button" data-N="100">n ≤ 100</button></div>'+
      '<div class="seg bs-seg" role="group" aria-label="Scale"><button type="button" data-s="lin">Linear</button><button type="button" class="on" data-s="log">Log</button></div></div>'+
      '<div class="bs-plot"><svg class="bs-svg cx-svg" role="img" aria-label="Growth of the complexity classes"></svg><div class="bs-tip" hidden></div></div>'+
      '<h5 class="cx-h5">How long would it take?</h5><div class="bsx-chips cx-ns">'+[10,100,1e3,1e4,1e6,1e9].map(x=>'<button type="button" class="chip'+(x===pick?" on":"")+'" data-n="'+x+'">n = '+(x>=1e6?"10"+sup(Math.log10(x)):num(x))+"</button>").join("")+'</div><div class="tw cx-feel"></div><div class="msg" aria-live="polite"></div></div>';
    const svg=$(".cx-svg",h),tip=$(".bs-tip",h);
    const draw=()=>{const W=Math.max(320,svg.clientWidth||640),H=280,m={l:56,r:74,t:12,b:30},pw=W-m.l-m.r,ph=H-m.t-m.b;svg.setAttribute("viewBox","0 0 "+W+" "+H);
      const xs=[];for(let n=1;n<=N;n++)xs.push(n);const yMax=lg?Math.max(2,2*Math.log10(N)+1):N*N*1.05,x=n=>m.l+(n-1)/(N-1)*pw,
        y=l=>{const v=lg?l:Math.pow(10,l);return m.t+ph-Math.min(1.05,v/yMax)*ph;};
      let g='<defs><clipPath id="cxclip"><rect x="'+m.l+'" y="'+m.t+'" width="'+pw+'" height="'+ph+'"/></clipPath></defs>';
      const ticks=lg?Array.from({length:Math.floor(yMax)+1},(_,i)=>i):[0,.25,.5,.75,1].map(f=>Math.log10(Math.max(1,f*yMax)));
      ticks.forEach((t,i)=>{const yy=lg?y(t):m.t+ph-(i/4)*ph;g+='<line class="bs-gl" x1="'+m.l+'" x2="'+(W-m.r)+'" y1="'+yy+'" y2="'+yy+'"/><text class="bs-ax" x="'+(m.l-8)+'" y="'+(yy+4)+'" text-anchor="end">'+(lg?(t===0?"1":"10"+sup(t)):num(i/4*yMax))+"</text>";});
      [1,Math.round(N/2),N].forEach(n=>{g+='<text class="bs-ax" x="'+x(n)+'" y="'+(H-10)+'" text-anchor="middle">'+n+"</text>";});
      g+='<g clip-path="url(#cxclip)">';CLS.forEach(([nm,f],i)=>{g+='<path class="bs-line" style="stroke:var(--cx-s'+(i+1)+')" d="M'+xs.map(n=>x(n).toFixed(1)+" "+y(f(n)).toFixed(1)).join("L")+'"/>';});g+="</g>";
      const offN=CLS.filter(([,q])=>y(q(N))<m.t-2).length;let up=0;const labs=CLS.map(([nm,f],i)=>{const yy=y(f(N)),off=yy<m.t-2;return {i,nm,off,y:off?m.t+4+13*up++:Math.max(m.t+8+13*offN,yy)};});const on=labs.filter(q=>!q.off).sort((a,b)=>a.y-b.y);for(let q=on.length-2;q>=0;q--)if(on[q+1].y-on[q].y<12)on[q].y=on[q+1].y-12;labs.forEach(q=>{g+='<text class="cx-lab" x="'+(W-m.r+6)+'" y="'+(q.y+4)+'" style="fill:var(--cx-s'+(q.i+1)+')">'+q.nm+(q.off?" ↑":"")+"</text>";});
      g+='<line class="bs-cross" x1="0" x2="0" y1="'+m.t+'" y2="'+(m.t+ph)+'" hidden/>';svg.innerHTML=g;svg.dataset.m=JSON.stringify(m);svg.dataset.N=N;};
    const feel=()=>{$(".cx-feel",h).innerHTML="<table><tr><th>Class</th><th>Steps for n = "+(pick>=1e6?"10"+sup(Math.log10(pick)):num(pick))+"</th><th>Time at 10⁸ steps/s</th></tr>"+
        CLS.map(([nm,f],i)=>{const l=f(pick);return '<tr><td><i class="cx-dot" style="background:var(--cx-s'+(i+1)+')"></i>'+nm+"</td><td>"+(l>12?"10"+sup(Math.floor(l)):big(l))+"</td><td>"+time(l)+"</td></tr>";}).join("")+"</table>";
      $(".msg",h).innerHTML=pick>=1e6?"At n = "+(pick===1e6?"a million":"a billion")+", O(n log n) still finishes in "+time(CLS[3][1](pick))+", while O(n²) needs "+time(CLS[4][1](pick))+". This is why interviewers push you from n² to n log n.":"For small n everything is fast; the classes only separate as n grows. Try n = 10⁶.";};
    const dark=()=>{const c=getComputedStyle(document.body).backgroundColor.match(/\d+/g)||[255,255,255];h.classList.toggle("bs-dk",(+c[0]*.299+ +c[1]*.587+ +c[2]*.114)<128);};dark();addEventListener("themechange",dark);
    h.addEventListener("click",e=>{const b=e.target.closest("[data-N],[data-s],[data-n]");if(!b)return;
      if(b.dataset.N){N=+b.dataset.N;$$("[data-N]",h).forEach(x=>x.classList.toggle("on",x===b));draw();}
      else if(b.dataset.s){lg=b.dataset.s==="log";$$("[data-s]",h).forEach(x=>x.classList.toggle("on",x===b));draw();}
      else{pick=+b.dataset.n;$$("[data-n]",h).forEach(x=>x.classList.toggle("on",x===b));feel();}});
    svg.addEventListener("pointermove",e=>{const r=svg.getBoundingClientRect(),m=JSON.parse(svg.dataset.m||"{}"),vb=svg.viewBox.baseVal,sx=vb.width/r.width,xx=(e.clientX-r.left)*sx;
      const n=Math.max(1,Math.min(N,Math.round((xx-m.l)/(vb.width-m.l-m.r)*(N-1)+1))),cx=m.l+(n-1)/(N-1)*(vb.width-m.l-m.r),cr=$(".bs-cross",svg);
      cr.removeAttribute("hidden");cr.setAttribute("x1",cx);cr.setAttribute("x2",cx);tip.hidden=false;
      tip.innerHTML="<b>n = "+n+"</b>"+CLS.map(([nm,f],i)=>'<div><i style="background:var(--cx-s'+(i+1)+')"></i>'+nm+"<span>"+big(f(n))+"</span></div>").join("");
      tip.style.left=Math.min(Math.max(0,cx/sx+12),r.width-tip.offsetWidth-4)+"px";});
    svg.addEventListener("pointerleave",()=>{tip.hidden=true;const cr=$(".bs-cross",svg);if(cr)cr.setAttribute("hidden","");});
    addEventListener("resize",()=>requestAnimationFrame(draw),{passive:true});draw();feel();h.cxApi={CLS,time};});

  /* ---------- 3. recursion tree ---------- */
  const REC={
    fact:{n:"factorial: T(n) = T(n−1) + O(1)",lab:k=>"f("+k+")",kids:k=>k>1?[k-1]:[],w:k=>1,max:8,def:5,o:"O(n) time, O(n) stack",java:"long f(int n) { return n <= 1 ? 1 : n * f(n - 1); }"},
    fib:{n:"naive Fibonacci: T(n) = T(n−1) + T(n−2) + O(1)",lab:k=>"fib("+k+")",kids:k=>k>1?[k-1,k-2]:[],w:k=>1,max:7,def:5,o:"O(2ⁿ) time, O(n) stack",java:"long fib(int n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }"},
    memo:{n:"memoized Fibonacci",lab:k=>"fib("+k+")",kids:null,w:k=>1,max:10,def:6,o:"O(n) time, O(n) space",java:"if (memo[n] != 0) return memo[n];   // each fib(k) is computed once"},
    bs:{n:"binary search: T(n) = T(n/2) + O(1)",lab:k=>"n="+k,kids:k=>k>1?[Math.floor(k/2)]:[],w:k=>1,max:64,def:32,o:"O(log n) time, O(log n) stack",java:"search(a, lo, mid - 1)  or  search(a, mid + 1, hi)   // one half only"},
    merge:{n:"merge sort: T(n) = 2T(n/2) + O(n)",lab:k=>"n="+k,kids:k=>k>1?[Math.ceil(k/2),Math.floor(k/2)]:[],w:k=>k,max:16,def:8,o:"O(n log n) time, O(log n) stack (+ O(n) buffer)",java:"sort(left half); sort(right half); merge(...);   // merge costs n"}
  };
  function buildTree(key,n){const R=REC[key],nodes=[];let seen=new Set();
    const mk=(k,d,par)=>{const node={k,d,par,kids:[],memo:false,i:nodes.length};nodes.push(node);
      let ks;if(key==="memo"){if(k>1&&seen.has(k)){node.memo=true;ks=[];}else{seen.add(k);ks=k>1?[k-1,k-2]:[];}}else ks=R.kids(k);
      ks.forEach(c=>node.kids.push(mk(c,d+1,node)));return node;};
    const root=mk(n,0,null);let leaf=0;const place=nd=>{if(!nd.kids.length){nd.x=leaf++;return;}nd.kids.forEach(place);nd.x=(nd.kids[0].x+nd.kids[nd.kids.length-1].x)/2;};place(root);
    return {nodes,root,leaves:leaf,depth:Math.max(...nodes.map(q=>q.d))+1};}
  lazy($("#cxTree"),h=>{let key="fib",n=5,T=null,P=null;
    h.innerHTML=head("Recursion tree","Time = every node of the tree; space = the deepest path, because only one path is on the stack at a time")+
      '<div class="vbody"><div class="bs-opts"><label class="ol-tog">Recursion <select class="cx-r">'+Object.keys(REC).map(k=>'<option value="'+k+'">'+REC[k].n+"</option>").join("")+'</select></label>'+
      '<label class="ol-tog">n <input type="range" class="cx-tn" min="1" max="7" value="5"><b class="cx-tnv">5</b></label></div>'+
      '<code class="cx-java"></code><div class="cx-treew"><svg class="cx-tree" aria-label="Recursion tree"></svg></div><div class="cx-stat cx-tstat"></div><div class="cx-stack"></div>'+ctl()+'<div class="msg" aria-live="polite"></div></div>';
    const svg=$(".cx-tree",h);
    const draw=k=>{const R=REC[key],cur=k>=0?T.nodes[k]:null,path=new Set();for(let q=cur;q;q=q.par)path.add(q.i);
      const W=Math.max(1,T.leaves)*54+40,H=T.depth*64+20,X=nd=>20+nd.x*54+27,Y=nd=>24+nd.d*64;svg.setAttribute("viewBox","0 0 "+W+" "+H);svg.style.maxWidth=W*1.1+"px";
      let g="";T.nodes.forEach(nd=>{if(nd.par)g+='<line x1="'+X(nd.par)+'" y1="'+Y(nd.par)+'" x2="'+X(nd)+'" y2="'+Y(nd)+'" class="'+(nd.i<=k?"on":"")+(path.has(nd.i)?" st":"")+'"/>';});
      T.nodes.forEach(nd=>{const st=nd.i>k?"todo":path.has(nd.i)?"stk":"done";g+='<g class="cx-nd '+st+(nd.memo?" memo":"")+'"><rect x="'+(X(nd)-25)+'" y="'+(Y(nd)-13)+'" width="50" height="26" rx="13"/><text x="'+X(nd)+'" y="'+(Y(nd)+4)+'" text-anchor="middle">'+(nd.memo?"memo":R.lab(nd.k))+"</text></g>";});
      svg.innerHTML=g;
      const shown=T.nodes.slice(0,k+1),work=shown.reduce((s,nd)=>s+(nd.memo?1:R.w(nd.k)),0),tot=T.nodes.reduce((s,nd)=>s+(nd.memo?1:R.w(nd.k)),0);
      $(".cx-tstat",h).innerHTML="<div><small>calls so far</small><b>"+(k+1)+" / "+T.nodes.length+"</b></div><div><small>work so far</small><b>"+work+" / "+tot+"</b></div><div><small>stack now</small><b>"+path.size+"</b></div><div><small>max depth</small><b>"+T.depth+"</b></div>";
      $(".cx-stack",h).innerHTML="<h5>Call stack now (bottom → top)</h5>"+(path.size?[...path].reverse().map(i=>"<span>"+(T.nodes[i].memo?"memo hit":R.lab(T.nodes[i].k))+"</span>").join("→"):'<em class="ol-empty">empty</em>');
      $(".msg",h).innerHTML=k<0?"Press <b>Play</b> to make the calls in the order Java makes them (depth first). Highlighted: the frames on the stack right now.":
        k>=T.nodes.length-1?"<b>"+T.nodes.length+" calls</b>, total work "+tot+", but never more than <b>"+T.depth+"</b> frames on the stack at once. "+R.o+".":
        "Calling "+(cur.memo?"a value already in the memo: return at once":R.lab(cur.k))+". Stack depth "+path.size+".";};
    const load=()=>{const R=REC[key];n=Math.min(n,R.max);const s=$(".cx-tn",h);s.max=R.max;s.value=n;$(".cx-tnv",h).textContent=n;T=buildTree(key,n);$(".cx-java",h).innerHTML=hl(R.java);
      if(P)P.stop();P=player(h,T.nodes.length,draw,()=>still?40:Math.max(120,4000/T.nodes.length));P.go(-1);};
    $(".cx-r",h).value=key;$(".cx-r",h).onchange=e=>{key=e.target.value;n=REC[key].def;load();};
    $(".cx-tn",h).oninput=e=>{n=+e.target.value;$(".cx-tnv",h).textContent=n;load();};
    load();h.cxApi={REC,buildTree,set(k2,m){key=k2;n=m;$(".cx-r",h).value=k2;load();},get T(){return T;},get P(){return P;}};});

  /* ---------- 4. amortized ArrayList growth ---------- */
  lazy($("#cxAmort"),h=>{let pol="x1.5",cap=0,size=0,copies=0,resizes=0,costs=[],last="";
    const grow=c=>pol==="x1.5"?(c===0?10:c+(c>>1)):pol==="x2"?(c===0?10:c*2):c+10;
    h.innerHTML=head("Amortized O(1): watch an ArrayList grow","Most adds cost 1; a full array is copied into a bigger one. Is add() O(1) or O(n)?")+
      '<div class="vbody"><div class="bs-opts"><div class="seg bs-seg" role="group" aria-label="Growth policy"><button type="button" class="on" data-p="x1.5">× 1.5 (Java ArrayList)</button><button type="button" data-p="x2">× 2</button><button type="button" data-p="+10">+ 10 each time</button></div></div>'+
      '<div class="cx-cap"><div class="cx-capbar"><i></i></div><span class="cx-captxt"></span></div><div class="bs-plot"><svg class="cx-cost" aria-label="Cost of each add"></svg></div>'+
      '<div class="cx-stat cx-astat"></div><div class="ctrl"><button type="button" class="btn pri" data-add="1">add(x)</button><button type="button" class="btn" data-add="10">add × 10</button><button type="button" class="btn" data-add="100">add × 100</button><button type="button" class="chip" data-add="0">reset</button></div><div class="msg" aria-live="polite"></div></div>';
    const add=k=>{for(let q=0;q<k;q++){let c=1;if(size===cap){const nc=grow(cap);c+=size;last="Full at "+size+": allocate an array of "+nc+" and copy "+size+" elements, so this add cost "+(size+1)+" steps.";copies+=size;cap=nc;resizes++;}else last="";size++;costs.push(c);}};
    const draw=()=>{$(".cx-capbar i",h).style.transform="scaleX("+(cap?size/cap:0)+")";$(".cx-captxt",h).textContent="size "+size+" / capacity "+cap;
      const svg=$(".cx-cost",h),W=Math.max(320,svg.clientWidth||600),H=150,show=costs.slice(-200),off=costs.length-show.length,mx=Math.max(2,...show),bw=(W-50)/Math.max(50,show.length);svg.setAttribute("viewBox","0 0 "+W+" "+H);
      let run=0,g="",pts=[];costs.forEach((c,i)=>{run+=c;if(i>=off)pts.push([40+(i-off)*bw+bw/2,run/(i+1)]);});
      show.forEach((c,i)=>{const bh=c/mx*(H-30);g+='<rect x="'+(40+i*bw)+'" y="'+(H-20-bh)+'" width="'+Math.max(1,bw-1)+'" height="'+bh+'" class="'+(c>1?"big":"")+'"/>';});
      if(pts.length)g+='<path class="cx-avg" d="M'+pts.map(p=>p[0].toFixed(1)+" "+(H-20-p[1]/mx*(H-30)).toFixed(1)).join("L")+'"/>';
      g+='<text class="bs-ax" x="34" y="14" text-anchor="end">'+mx+'</text><text class="bs-ax" x="34" y="'+(H-20)+'" text-anchor="end">0</text><text class="bs-ax" x="'+(W-4)+'" y="'+(H-4)+'" text-anchor="end">each bar = one add · line = average cost per add so far</text>';svg.innerHTML=g;
      const avg=costs.length?(size+copies)/size:0;
      $(".cx-astat",h).innerHTML="<div><small>adds</small><b>"+size+"</b></div><div><small>resizes</small><b>"+resizes+"</b></div><div><small>elements copied</small><b>"+copies+"</b></div><div><small>average cost per add</small><b>"+avg.toFixed(2)+"</b></div>";
      $(".msg",h).innerHTML=last||(size===0?"Press <b>add(x)</b> a few times, then <b>add × 100</b>. Watch the tall bars (copies) get rarer as the array grows.":
        pol==="+10"?"Growing by a fixed 10 copies everything every 10 adds: the average keeps climbing with n (about n/20). n adds cost O(n²): <b>not</b> amortized O(1).":
        "The tall bars are rare and spaced further apart each time, so the average stays a small constant (about "+(pol==="x2"?"2–3":"3–4")+"). That is <b>amortized O(1)</b>: n adds cost O(n) in total.");};
    h.addEventListener("click",e=>{const b=e.target.closest("[data-add],[data-p]");if(!b)return;
      if(b.dataset.p){pol=b.dataset.p;$$("[data-p]",h).forEach(x=>x.classList.toggle("on",x===b));cap=size=copies=resizes=0;costs=[];last="";draw();return;}
      const k=+b.dataset.add;if(!k){cap=size=copies=resizes=0;costs=[];last="";}else add(k);draw();});
    addEventListener("resize",()=>requestAnimationFrame(draw),{passive:true});draw();h.cxApi={add,get s(){return {cap,size,copies,resizes};},setPol(p){const b=$('[data-p="'+p+'"]',h);if(b)b.click();}};});
})();
