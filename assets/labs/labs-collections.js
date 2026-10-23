/* Lesson 07 labs: Collections (v34).
   Part of the course scripts. Every page loads, in this order: course-index.js, quiz-data.js, course.js, effects.js,
   labs-oop.js, labs-collections.js, labs-analogy.js, labs-sorting.js, practice-tools.js. They are classic scripts, so
   top-level const/let/function names are shared between them (course.js defines $, $$, esc, store, hl, FX, THM…). */
"use strict";
/* Collections labs (v34): Lesson 07 concept visualisations, one or more per section. Hosts are .viz.ol.cl
   (#clPick #clPecs #clList #anPark #clMap #clLru #clNav #clHeap #clDeque #clCmp #clFail #clView #clRace).
   #clMap follows java.util.HashMap exactly (String.hashCode, h ^ h>>>16, & (n-1), resize at size > 0.75n,
   lo/hi split, treeify when a bin gets its 9th node and the table has 64+ buckets, otherwise resize), checked
   against JDK 25 by reflection. #clPecs shows real javac (JDK 25) results. #clHeap follows PriorityQueue's siftUp/siftDown,
   #clFail follows ArrayList.Itr (cursor, modCount, expectedModCount). */
(function(){
  if(!$(".cl[id]"))return;
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait=ms=>new Promise(r=>setTimeout(r,still?Math.min(ms,30):ms));
  const head=(t,sub)=>'<div class="ol-head"><b>'+t+"</b><span>"+sub+"</span></div>";
  const C=s=>"<code>"+esc(s)+"</code>";
  const player=()=>{let tok=0;return {go(){return ++tok;},ok(t){return t===tok;},stop(){tok++;}};};
  const pulse=el=>{if(!el||still||!el.animate)return;el.animate([{transform:"scale(1.12)"},{transform:"scale(1)"}],{duration:380,easing:"cubic-bezier(.2,1.6,.4,1)"});};
  const jhash=s=>{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return h;};   /* String.hashCode */
  const spread=h=>(h^(h>>>16))|0;                                                                      /* HashMap.hash */
  const codeLines=(lines,cur)=>'<div class="ol-code">'+lines.map((l,i)=>'<div class="ol-l'+(i===cur?" cur":"")+'">'+(hl(l)||" ")+"</div>").join("")+"</div>";
  const stepper=(host,frames,draw)=>{let k=0,timer=null;
    const go=i=>{k=Math.max(0,Math.min(frames().length-1,i));draw(frames()[k],k);
      $('[data-a="back"]',host).disabled=k===0;$('[data-a="next"]',host).disabled=k===frames().length-1;$(".cl-cnt",host).textContent=(k+1)+" / "+frames().length;};
    const stop=()=>{clearInterval(timer);timer=null;$('[data-a="play"]',host).textContent="▶ Play";};
    host.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
      if(a==="next"){stop();go(k+1);}else if(a==="back"){stop();go(k-1);}else if(a==="reset"){stop();go(0);}
      else if(a==="play"){if(timer){stop();return;}if(k>=frames().length-1)go(0);b.textContent="⏸ Pause";timer=setInterval(()=>{if(k>=frames().length-1){stop();return;}go(k+1);},still?300:1300);}});
    return {go,stop,get k(){return k;}};};
  const ctrls='<div class="ctrl"><button type="button" class="btn" data-a="back">← Back</button><button type="button" class="btn pri" data-a="play">▶ Play</button><button type="button" class="btn" data-a="next">Next →</button><button type="button" class="btn" data-a="reset">Reset</button><span class="count cl-cnt"></span></div>';

  /* 1. Which collection? decision helper + family tree */
  const pHost=$("#clPick");
  if(pHost){
    const K={
      ArrayList:{i:"List",d:"A resizable array. The default list.",o:"index order",n:"allowed",c:"get(i) O(1) · add O(1)* · insert/remove in the middle O(n)"},
      LinkedList:{i:"List, Deque",d:"A doubly linked list of nodes.",o:"index order",n:"allowed",c:"ends O(1) · get(i) O(n) · insert at an iterator O(1)"},
      HashSet:{i:"Set",d:"A HashMap whose keys are the elements.",o:"none promised",n:"one null",c:"add / contains / remove O(1) average"},
      LinkedHashSet:{i:"Set",d:"HashSet plus a linked list through the entries.",o:"insertion order",n:"one null",c:"add / contains / remove O(1) average"},
      TreeSet:{i:"NavigableSet",d:"A red-black tree of elements.",o:"sorted",n:"not allowed",c:"add / contains / remove O(log n) · floor, ceiling, ranges"},
      ArrayDeque:{i:"Deque",d:"A circular array: the right queue and the right stack.",o:"FIFO or LIFO",n:"not allowed",c:"both ends O(1)*"},
      PriorityQueue:{i:"Queue",d:"A binary min-heap in an array.",o:"smallest first (poll)",n:"not allowed",c:"peek O(1) · offer / poll O(log n)"},
      HashMap:{i:"Map",d:"An array of buckets, chains and trees.",o:"none promised",n:"one null key, null values",c:"get / put / remove O(1) average"},
      LinkedHashMap:{i:"Map",d:"HashMap plus a linked list: insertion or access order (LRU).",o:"insertion or access",n:"one null key, null values",c:"get / put / remove O(1) average"},
      TreeMap:{i:"NavigableMap",d:"A red-black tree of keys.",o:"sorted by key",n:"no null keys",c:"get / put / remove O(log n) · floorKey, subMap"}};
    const G=[["Collection → List",["ArrayList","LinkedList"]],["Collection → Set",["HashSet","LinkedHashSet","TreeSet"]],["Collection → Queue / Deque",["ArrayDeque","PriorityQueue"]],["Map (separate tree)",["HashMap","LinkedHashMap","TreeMap"]]];
    const Q=[{k:"what",q:"1. What do you store?",o:[["items","Single items"],["pairs","Key → value pairs"]]},
      {k:"shape",q:"2. What matters most?",when:s=>s.what==="items",o:[["list","Position, duplicates allowed"],["set","No duplicates"],["queue","Processing order"]]},
      {k:"lord",q:"3. How will you use it?",when:s=>s.what==="items"&&s.shape==="list",o:[["idx","get(i), append"],["iter","insert while walking with an iterator"]]},
      {k:"sord",q:"3. What order on iteration?",when:s=>s.what==="pairs"||s.shape==="set",o:[["none","Don't care"],["ins","Insertion order"],["sorted","Sorted"]]},
      {k:"qord",q:"3. Which one comes out next?",when:s=>s.what==="items"&&s.shape==="queue",o:[["fifo","Oldest (queue) or newest (stack)"],["prio","Smallest / most urgent"]]}];
    let st={what:"items",shape:"list",lord:"idx",sord:"none",qord:"fifo"},pick=null;
    const choose=s=>s.what==="pairs"?{none:"HashMap",ins:"LinkedHashMap",sorted:"TreeMap"}[s.sord]:s.shape==="list"?(s.lord==="idx"?"ArrayList":"LinkedList"):s.shape==="set"?{none:"HashSet",ins:"LinkedHashSet",sorted:"TreeSet"}[s.sord]:(s.qord==="fifo"?"ArrayDeque":"PriorityQueue");
    pHost.innerHTML=head("Which collection?","Answer three questions; the lab finds the class")+'<div class="vbody"><div class="cl-qs"></div><div class="cl-fam"></div><div class="cl-card"></div><div class="msg" aria-live="polite"></div></div>';
    function draw(){const best=choose(st),show=pick||best,k=K[show];
      $(".cl-qs",pHost).innerHTML=Q.filter(q=>!q.when||q.when(st)).map(q=>'<div class="cl-q"><span>'+q.q+"</span>"+q.o.map(([v,l])=>'<button type="button" class="chip'+(st[q.k]===v?" on":"")+'" data-q="'+q.k+'" data-v="'+v+'">'+l+"</button>").join("")+"</div>").join("");
      $(".cl-fam",pHost).innerHTML='<div class="cl-root">Iterable → Collection <small>· Map stands alone</small></div><div class="cl-grp">'+G.map(([t,cs])=>'<div><h5>'+t+"</h5>"+cs.map(c=>'<button type="button" class="cl-cls'+(c===best?" best":"")+(c===show?" sel":"")+'" data-c="'+c+'">'+c+(c===best?" <small>✓ pick</small>":"")+"</button>").join("")+"</div>").join("")+"</div>";
      $(".cl-card",pHost).innerHTML='<div class="cl-kv"><b>'+show+"</b><span>implements "+k.i+"</span></div><p>"+k.d+'</p><div class="cl-kgrid"><div><h5>Order</h5>'+k.o+"</div><div><h5>Nulls</h5>"+k.n+"</div><div><h5>Cost</h5>"+k.c+"</div></div>";
      $(".msg",pHost).innerHTML=pick&&pick!==best?"You are looking at <b>"+pick+"</b>. For your answers the pick is <b>"+best+"</b>.":"Declare the interface, create the class: <code>"+(st.what==="pairs"?"Map&lt;K, V&gt; m = new "+best+"&lt;&gt;();":(st.shape==="list"?"List":st.shape==="set"?"Set":best==="ArrayDeque"?"Deque":"Queue")+"&lt;T&gt; c = new "+best+"&lt;&gt;();")+"</code>"+(best==="LinkedList"?" (Even here, measure: ArrayList often still wins.)":"");}
    pHost.addEventListener("click",e=>{const q=e.target.closest("[data-q]");if(q){st[q.dataset.q]=q.dataset.v;pick=null;draw();pulse($(".cl-cls.best",pHost));return;}
      const c=e.target.closest("[data-c]");if(c){pick=c.dataset.c;draw();}});
    draw();}

  /* 2. Wildcard checker: real javac results */
  const wHost=$("#clPecs");
  if(wHost){
    const P=["List<Number>","List<Integer>","List<? extends Number>","List<? super Integer>","List<?>"];
    const OPS=["Number x = list.get(0);","Integer x = list.get(0);","Object x = list.get(0);","list.add(1);","list.add(2.5);","list.add(null);"];
    const ARGS=["new ArrayList<Integer>()","new ArrayList<Double>()","new ArrayList<Number>()","new ArrayList<Object>()"];
    const ok="ok",e1="incompatible types: ";
    /* javac (JDK 25) output for each pair, generated by compiling every combination */
    const R={ops:{"List<Number>":[ok,e1+"Number cannot be converted to Integer",ok,ok,ok,ok],
      "List<Integer>":[ok,ok,ok,ok,e1+"double cannot be converted to Integer",ok],
      "List<? extends Number>":[ok,e1+"CAP#1 cannot be converted to Integer",ok,e1+"int cannot be converted to CAP#1",e1+"double cannot be converted to CAP#1",ok],
      "List<? super Integer>":[e1+"CAP#1 cannot be converted to Number",e1+"CAP#1 cannot be converted to Integer",ok,ok,e1+"double cannot be converted to CAP#1",ok],
      "List<?>":[e1+"CAP#1 cannot be converted to Number",e1+"CAP#1 cannot be converted to Integer",ok,e1+"int cannot be converted to CAP#1",e1+"double cannot be converted to CAP#1",ok]},
      args:{"List<Number>":[e1+"ArrayList<Integer> cannot be converted to List<Number>",e1+"ArrayList<Double> cannot be converted to List<Number>",ok,e1+"ArrayList<Object> cannot be converted to List<Number>"],
      "List<Integer>":[ok,e1+"ArrayList<Double> cannot be converted to List<Integer>",e1+"ArrayList<Number> cannot be converted to List<Integer>",e1+"ArrayList<Object> cannot be converted to List<Integer>"],
      "List<? extends Number>":[ok,ok,ok,e1+"ArrayList<Object> cannot be converted to List<? extends Number>"],
      "List<? super Integer>":[ok,e1+"ArrayList<Double> cannot be converted to List<? super Integer>",ok,ok],
      "List<?>":[ok,ok,ok,ok]}};
    const WHY={"List<Number>":"Exactly a list of Number: you can put in any Number and read Numbers out, but you can only <b>pass</b> a <code>List&lt;Number&gt;</code>. Generics are invariant: a <code>List&lt;Integer&gt;</code> is not a <code>List&lt;Number&gt;</code>.",
      "List<Integer>":"Exactly a list of Integer. Strict on both sides: only Integers go in, and only a <code>List&lt;Integer&gt;</code> can be passed.",
      "List<? extends Number>":"<b>Producer extends.</b> \"A list of some subtype of Number.\" Reading is safe (whatever it is, it's a Number), and you can pass Integer, Double or Number lists. Writing is refused: the compiler calls the unknown type <code>CAP#1</code> and can't prove 1 or 2.5 fits.",
      "List<? super Integer>":"<b>Consumer super.</b> \"A list of Integer or some supertype.\" Adding an Integer is always safe, and you can pass Integer, Number or Object lists. Reading only gives <code>Object</code>, because the element type could be Object.",
      "List<?>":"\"A list of something.\" You can pass any list and read <code>Object</code>s, but you can't add anything except <code>null</code>. Use it for methods like <code>printAll(List&lt;?&gt;)</code>."};
    let p=2,sel={t:"op",i:0};
    wHost.innerHTML=head("Wildcard checker","What javac accepts for each parameter type")+'<div class="vbody"><div class="ol-cmds cl-ptypes"><span class="small muted">parameter:</span>'+P.map((t,i)=>'<button type="button" class="chip" data-p="'+i+'">'+esc(t)+"</button>").join("")+'</div><div class="cl-pecs"><div><h5>Inside the method</h5>'+OPS.map((o,i)=>'<button type="button" class="cl-op" data-t="op" data-i="'+i+'"><span>'+esc(o)+"</span><i></i></button>").join("")+'</div><div><h5>Call it with m(…)</h5>'+ARGS.map((o,i)=>'<button type="button" class="cl-op" data-t="arg" data-i="'+i+'"><span>'+esc(o)+"</span><i></i></button>").join("")+'</div></div><div class="cl-src"></div><div class="ol-ph on cl-jc" data-p="r"><b>javac</b><div></div></div><div class="msg"></div></div>';
    function draw(){const pt=P[p];
      $$("[data-p]",wHost).forEach(b=>b.classList.toggle("on",+b.dataset.p===p));
      $$(".cl-op",wHost).forEach(b=>{const r=(b.dataset.t==="op"?R.ops:R.args)[pt][+b.dataset.i];b.classList.toggle("yes",r===ok);b.classList.toggle("no",r!==ok);$("i",b).textContent=r===ok?"✓":"✗";b.classList.toggle("sel",b.dataset.t===sel.t&&+b.dataset.i===sel.i);});
      const r=(sel.t==="op"?R.ops:R.args)[pt][sel.i];
      $(".cl-src",wHost).innerHTML=codeLines(sel.t==="op"?["static void m("+pt+" list) {","    "+OPS[sel.i],"}"]:["static void m("+pt+" list) { }","","m("+ARGS[sel.i]+");"],sel.t==="op"?1:2);
      const ph=$(".cl-jc",wHost);ph.classList.toggle("ol-ok",r===ok);ph.classList.toggle("ol-bad",r!==ok);
      $("div",ph).innerHTML=r===ok?"✓ compiles":'<span class="e">error: '+esc(r)+"</span>";
      $(".msg",wHost).innerHTML=WHY[pt];pulse(ph);}
    wHost.addEventListener("click",e=>{const b=e.target.closest("[data-p]");if(b){p=+b.dataset.p;draw();return;}const o=e.target.closest(".cl-op");if(o){sel={t:o.dataset.t,i:+o.dataset.i};draw();}});
    draw();}

  /* 3. ArrayList vs LinkedList: moves and hops */
  const lHost=$("#clList");
  if(lHost){
    let arr=[],cap=0,next=1,tot={m:0,h:0};const P=player();
    lHost.innerHTML=head("ArrayList vs LinkedList","The same operations, counted")+'<div class="vbody"><div class="ol-cmds"><button type="button" class="btn pri" data-o="add">add(x)</button><button type="button" class="btn" data-o="add0">add(0, x)</button><button type="button" class="btn" data-o="rem0">remove(0)</button><span class="ol-pt">get(<input type="number" data-k="i" value="3" min="0" max="40" aria-label="index">)</span><button type="button" class="btn" data-o="get">get(i)</button><button type="button" class="btn" data-o="fill">add 6 more</button><button type="button" class="btn" data-o="clr">Clear</button></div>'+
      '<div class="cl-lists"><div><h5>ArrayList <span class="cl-cap"></span></h5><div class="cl-arr"></div><div class="cl-tally" data-t="m"></div></div><div><h5>LinkedList</h5><div class="cl-ll"></div><div class="cl-tally" data-t="h"></div></div></div><div class="msg" aria-live="polite"></div></div>';
    const msg=$(".msg",lHost);
    function draw(o){o=o||{};
      $(".cl-cap",lHost).textContent="size "+arr.length+" · capacity "+cap;
      $(".cl-arr",lHost).innerHTML=(cap?Array.from({length:cap},(_,i)=>'<span class="'+(i<arr.length?"cl-f":"cl-e")+(o.ah&&o.ah.includes(i)?" hot":"")+(o.an===i?" nw":"")+'"><b>'+(i<arr.length?arr[i]:"")+"</b><small>"+i+"</small></span>").join(""):'<em class="cl-none">elementData = {} (empty until the first add)</em>');
      $(".cl-ll",lHost).innerHTML=arr.length?'<span class="cl-end">head</span>'+arr.map((v,i)=>'<span class="cl-node'+(o.lh&&o.lh.includes(i)?" hot":"")+(o.ln===i?" nw":"")+'">'+v+"</span>").join('<i class="cl-lk">⇄</i>')+'<span class="cl-end">tail</span>':'<em class="cl-none">first = last = null</em>';
      $('[data-t="m"]',lHost).innerHTML="moves this op: <b>"+(o.m||0)+"</b> · total "+tot.m;
      $('[data-t="h"]',lHost).innerHTML="hops this op: <b>"+(o.h||0)+"</b> · total "+tot.h;}
    async function grow(t){const old=cap;cap=old?old+(old>>1):10;
      if(old){tot.m+=arr.length;draw({ah:arr.map((_,i)=>i),m:arr.length});msg.innerHTML="The array is full ("+old+"/"+old+"). <code>grow()</code> makes a new array of <b>"+old+" + "+old+"/2 = "+cap+"</b> and copies all "+arr.length+" elements: one O(n) step, then "+(cap-arr.length)+" cheap adds.";await wait(1200);}
      else{msg.innerHTML="First add: the shared empty array is replaced by a real one of <b>10</b> slots.";await wait(700);}return P.ok(t);}
    async function op(o){const t=P.go();
      if(o==="clr"){arr=[];cap=0;next=1;tot={m:0,h:0};draw();msg.innerHTML="Empty lists. Press <b>add(x)</b> a few times.";return;}
      if(o==="fill"){for(let k=0;k<6;k++){if(arr.length===cap&&!(await grow(t)))return;arr.push(next++);draw({an:arr.length-1,ln:arr.length-1});await wait(250);if(!P.ok(t))return;}msg.innerHTML="Added 6 at the end: ArrayList moves nothing (except on a resize); LinkedList links a new tail node each time.";return;}
      if(o==="add"||o==="add0"){if(arr.length===cap&&!(await grow(t)))return;const v=next++;
        if(o==="add"){arr.push(v);draw({an:arr.length-1,ln:arr.length-1});msg.innerHTML="<code>add("+v+")</code>: ArrayList writes slot "+(arr.length-1)+" (0 moves). LinkedList creates a node and links it after the tail (0 hops). Both O(1).";return;}
        const n=arr.length;arr.push(null);for(let i=n;i>0;i--){arr[i]=arr[i-1];arr[i-1]="";draw({ah:[i],m:n-i+1});await wait(still?0:260);if(!P.ok(t))return;}
        arr[0]=v;tot.m+=n;draw({an:0,ln:0,m:n});msg.innerHTML="<code>add(0, "+v+")</code>: ArrayList shifted <b>"+n+"</b> elements one slot right (<code>System.arraycopy</code>): O(n). LinkedList just linked a new head node: O(1), 0 hops.";return;}
      if(o==="rem0"){if(!arr.length){msg.innerHTML="Both lists are empty: <code>remove(0)</code> would throw <code>IndexOutOfBoundsException</code>.";return;}
        const n=arr.length-1;draw({ah:[0],lh:[0]});await wait(400);if(!P.ok(t))return;
        for(let i=0;i<n;i++){arr[i]=arr[i+1];draw({ah:[i],m:i+1});await wait(still?0:220);if(!P.ok(t))return;}
        arr.pop();tot.m+=n;draw({m:n});msg.innerHTML="<code>remove(0)</code>: ArrayList shifted <b>"+n+"</b> elements left and nulled the last slot. LinkedList unlinked the head: 0 hops. This is why a queue should never be an ArrayList.";return;}
      if(o==="get"){const i=parseInt($('[data-k="i"]',lHost).value,10)||0;
        if(i<0||i>=arr.length){msg.innerHTML="<code>get("+i+")</code> → <code>IndexOutOfBoundsException: Index "+i+" out of bounds for length "+arr.length+"</code>";return;}
        const fromEnd=i>=(arr.length>>1),path=[];draw({ah:[i]});
        for(let k=0;k<=(fromEnd?arr.length-1-i:i);k++){path.push(fromEnd?arr.length-1-k:k);draw({ah:[i],lh:path.slice(),h:path.length-1});await wait(still?0:300);if(!P.ok(t))return;}
        tot.h+=path.length-1;draw({ah:[i],lh:path,h:path.length-1});
        msg.innerHTML="<code>get("+i+")</code> = "+arr[i]+". ArrayList: one address calculation, O(1). LinkedList walked <b>"+(path.length-1)+"</b> hop"+(path.length===2?"":"s")+" from the "+(fromEnd?"tail":"head")+" (it starts from the nearer end): O(n).";}}
    lHost.addEventListener("click",e=>{const b=e.target.closest("[data-o]");if(b)op(b.dataset.o);});
    draw();msg.innerHTML="Press <b>add(x)</b> to create the array, then <b>add 6 more</b> twice to see it grow 10 → 15, and compare <b>add(0, x)</b> and <b>get(i)</b>.";}

  /* 4. Parking lot analogy: hashCode picks the bay, equals finds the car */
  const kHost=$("#anPark");
  if(kHost){
    const PLATES=["AP26-1234","KA01-7777","TN09-4521","MH12-0042","DL3C-9090","AP39-1111","TS07-2468","KL07-5050","GJ01-3141","RJ14-8008","UP32-6000","WB02-1357"];
    const COL=["#3b82f6","#ef4444","#10b981","#f59e0b","#8b5cf6","#ec4899","#14b8a6","#f97316","#6366f1","#84cc16","#06b6d4","#e11d48"];
    let n=8,cars=[],ix=0,lost=null;const P=player();
    const bay=pl=>spread(jhash(pl))&(n-1);
    const carIco=c=>'<svg viewBox="0 0 44 22" aria-hidden="true"><path d="M3 15Q3 11 7 10L13 9L17 4Q18 3 20 3H30Q32 3 33 5L37 9Q41 10 41 13V16Q41 17 40 17H4Q3 17 3 16Z" fill="'+c+'"/><path d="M18 5H29L32 9H15Z" fill="rgba(255,255,255,.55)"/><circle cx="12" cy="17" r="3.2" fill="#1f2937"/><circle cx="33" cy="17" r="3.2" fill="#1f2937"/></svg>';
    kHost.innerHTML=head("The parking lot","A HashMap is a lot with numbered bays")+'<div class="vbody"><div class="ol-cmds"><button type="button" class="btn pri" data-o="park">Park the next car (put)</button><label class="ol-tog">find <select data-k="find"></select></label><button type="button" class="btn" data-o="find">Find it (get)</button><button type="button" class="btn" data-o="bend">Change a parked plate</button><button type="button" class="btn" data-o="clr">Empty the lot</button></div><div class="cl-valet"></div><div class="cl-lot"></div><div class="cl-lotinfo"></div><div class="msg" aria-live="polite"></div></div>';
    const msg=$(".msg",kHost);
    function draw(o){o=o||{};
      $(".cl-lot",kHost).style.setProperty("--bays",Math.min(n,8));
      $(".cl-lot",kHost).innerHTML=Array.from({length:n},(_,b)=>'<div class="cl-bay'+(o.aim===b?" aim":"")+(o.miss===b?" miss":"")+'"><span>bay '+b+"</span>"+cars.filter(c=>c.b===b).map(c=>'<div class="cl-car'+(o.hot===c?" hot":"")+(c===lost?" lost":"")+'">'+carIco(c.c)+"<b>"+c.p+"</b></div>").join("")+"</div>").join("");
      $(".cl-lotinfo",kHost).innerHTML="cars <b>"+cars.length+"</b> · bays <b>"+n+"</b> · rebuild when cars &gt; "+n+" × 0.75 = <b>"+(n*0.75)+"</b>";
      const s=$('[data-k="find"]',kHost),v=s.value;s.innerHTML=cars.map(c=>'<option value="'+c.p+'">'+c.p+"</option>").join("")||"<option>(no cars)</option>";if(cars.some(c=>c.p===v))s.value=v;}
    const valet=t=>{$(".cl-valet",kHost).innerHTML=t;};
    async function look(pl,t){const h=jhash(pl),b=bay(pl);valet('🧑‍✈️ Valet reads plate <b>'+pl+"</b> → <code>hashCode()</code> = "+h+" → bay <b>"+b+"</b>");draw({aim:b});await wait(800);if(!P.ok(t))return undefined;
      for(const c of cars.filter(c=>c.b===b)){draw({aim:b,hot:c});valet("🧑‍✈️ In bay "+b+": is <b>"+c.p+"</b> <code>equals</code> "+pl+"? "+(c.p===pl?"<b>yes</b>":"no"));await wait(700);if(!P.ok(t))return undefined;if(c.p===pl)return c;}
      return null;}
    async function op(o){const t=P.go();
      if(o==="clr"){n=8;cars=[];ix=0;lost=null;draw();valet("");msg.innerHTML="An empty lot with 8 bays.";return;}
      if(o==="park"){if(ix>=PLATES.length){msg.innerHTML="That's all the cars for this demo. Empty the lot to start again.";return;}
        const pl=PLATES[ix],c={p:pl,c:COL[ix],b:0,h:jhash(pl)};ix++;const f=await look(pl,t);if(f===undefined)return;
        c.b=bay(pl);cars.push(c);draw({aim:c.b,hot:c});const sh=cars.filter(x=>x.b===c.b).length;
        msg.innerHTML="Parked <b>"+pl+"</b> in bay "+c.b+"."+(sh>1?" That bay already had a car: a <b>collision</b>. Both cars stay; the valet will tell them apart by reading plates (<code>equals</code>).":"");
        if(cars.length>n*0.75){await wait(1100);if(!P.ok(t))return;const old=n;n*=2;valet("🏗️ The lot is over 75% full: the owner builds a lot with <b>"+n+"</b> bays and re-parks every car.");
          for(const x of cars){x.b=spread(x.h)&(n-1);}draw();msg.innerHTML="<b>Resize:</b> "+old+" → "+n+" bays. Each car's new bay comes from the hash the valet noted when it was parked (HashMap stores every key's hash and doesn't call <code>hashCode</code> again); with "+n+" bays one more bit of it counts, so cars spread out and chains get shorter.";}return;}
      if(o==="find"){const pl=$('[data-k="find"]',kHost).value;if(!cars.some(c=>c.p===pl)){msg.innerHTML="Park some cars first.";return;}
        const f=await look(pl,t);if(f===undefined)return;
        if(f){draw({aim:f.b,hot:f});msg.innerHTML="Found <b>"+pl+"</b>: <b>hashCode picked the bay</b>, <b>equals found the car</b>. The valet never looked in any other bay: that's why <code>get</code> is O(1).";}
        else{const real=cars.find(c=>c.p===pl);draw({miss:bay(pl),hot:real});msg.innerHTML="Not found! The car <b>"+pl+"</b> is sitting in bay "+real.b+", but its plate now leads to bay "+bay(pl)+". The map still counts it (<code>size()</code> = "+cars.length+"), yet <code>get</code> can never reach it.";}return;}
      if(o==="bend"){const pl=$('[data-k="find"]',kHost).value,c=cars.find(x=>x.p===pl);if(!c){msg.innerHTML="Park some cars first.";return;}
        let np=pl.slice(0,-1)+((+pl.slice(-1)+1)%10),k=0;while(bay(np)===c.b&&k<10){np=pl.slice(0,-2)+String((+pl.slice(-2)+(++k)*7)%100).padStart(2,"0");}
        c.p=np;lost=c;draw({hot:c});$('[data-k="find"]',kHost).value=np;valet("");msg.innerHTML="The owner changed the plate of the car in bay "+c.b+" to <b>"+np+"</b> <i>without moving the car</i>: a <b>mutable key</b>. Now pick <b>"+np+"</b> and press <b>Find it</b>.";}}
    kHost.addEventListener("click",e=>{const b=e.target.closest("[data-o]");if(b)op(b.dataset.o);});
    draw();msg.innerHTML="Press <b>Park the next car</b> several times. Watch where each car goes, the first collision, and the rebuild when the 7th car arrives.";}

  /* 5. A real HashMap */
  const mHost=$("#clMap");
  if(mHost){
    const FRUIT=["apple","mango","kiwi","banana","grape","lemon","peach","plum","guava","cherry","orange","papaya","melon","fig","lime"];
    const ATT=[];(function(){let ks=[""];for(let r=0;r<4;r++){const nk=[];ks.forEach(s=>{nk.push(s+"Aa");nk.push(s+"BB");});ks=nk;}ATT.push(...ks);})();   /* 16 keys, all hashCode -540425984 */
    let n=16,tab,size=0,ops=[];const P=player();
    const reset=()=>{n=16;tab=Array.from({length:n},()=>({nodes:[],tree:false}));size=0;};reset();
    mHost.innerHTML=head("A real HashMap","Java's hashCode, spread, index, resize and treeify rules")+'<div class="vbody"><div class="ol-cmds"><span class="ol-pt">key <input data-k="key" value="apple" spellcheck="false" aria-label="key" style="width:120px"> value <input type="number" data-k="val" value="5" aria-label="value" style="width:64px"></span><button type="button" class="btn pri" data-o="put">put</button><button type="button" class="btn" data-o="get">get</button><button type="button" class="btn" data-o="rem">remove</button></div>'+
      '<div class="ol-cmds"><button type="button" class="btn" data-o="fruit">Add 13 fruits (watch the resize)</button><button type="button" class="btn" data-o="att">Collision attack (11 equal hashes)</button><button type="button" class="btn" data-o="clr">new HashMap&lt;&gt;()</button></div>'+
      '<div class="ol-calc cl-calc"></div><div class="cl-stats"></div><div class="cl-tab"></div><div class="msg" aria-live="polite"></div></div>';
    const msg=$(".msg",mHost);
    function draw(o){o=o||{};const T=$(".cl-tab",mHost);T.style.setProperty("--cols",Math.min(n,16));
      T.innerHTML=tab.map((b,i)=>'<div class="cl-bk'+(b.tree?" tree":"")+(o.aim===i?" aim":"")+(o.miss===i?" miss":"")+'"><span>'+i+(b.tree?" 🌳":"")+"</span><div>"+b.nodes.map(x=>'<i class="'+(o.hot===x?"hot":"")+(o.nw===x?" nw":"")+'" title="hash '+x.h+'">'+esc(x.k)+"<small>="+x.v+"</small></i>").join("")+"</div></div>").join("");
      const long=Math.max(0,...tab.map(b=>b.nodes.length));
      $(".cl-stats",mHost).innerHTML="size <b>"+size+"</b> · capacity <b>"+n+"</b> · threshold <b>"+(n*0.75)+"</b> · load <b>"+(size/n).toFixed(2)+"</b> · longest bucket <b>"+long+"</b>"+(tab.some(b=>b.tree)?" · <b>tree bins: "+tab.filter(b=>b.tree).length+"</b>":"");}
    const calc=k=>{const h=jhash(k),s=spread(h),i=s&(n-1);$(".cl-calc",mHost).innerHTML=C('"'+k+'".hashCode()')+" = <b>"+h+"</b> → h ^ (h &gt;&gt;&gt; 16) = "+s+" → &amp; ("+n+" − 1) = bucket <b>"+i+"</b>";return {h:s,i};};
    function resize(){const old=n;n*=2;const nt=Array.from({length:n},()=>({nodes:[],tree:false}));
      tab.forEach((b,i)=>{const lo=b.nodes.filter(x=>(x.h&old)===0),hi=b.nodes.filter(x=>(x.h&old)!==0);
        nt[i].nodes=lo;nt[i+old].nodes=hi;if(b.tree){nt[i].tree=lo.length>6;nt[i+old].tree=hi.length>6;}});
      tab=nt;return old;}
    async function put(k,v,t,fast){const {h,i}=calc(k),b=tab[i];draw({aim:i});await wait(fast?120:600);if(!P.ok(t))return null;
      for(const x of b.nodes){if(b.tree)break;draw({aim:i,hot:x});await wait(fast?60:380);if(!P.ok(t))return null;if(x.h===h&&x.k===k){const old=x.v;x.v=v;draw({aim:i,hot:x});return {t:"rep",old};}}
      if(b.tree){const x=b.nodes.find(x=>x.k===k);if(x){const old=x.v;x.v=v;draw({aim:i,hot:x});return {t:"rep",old,tree:true};}}
      const node={k,v,h},before=b.nodes.length;b.nodes.push(node);let note="";
      if(!b.tree&&before>=8){if(n<64){const old=resize();note="treeifyBin: this bucket already had 8 nodes, but the table has only "+old+" buckets (&lt; 64), so HashMap <b>resized to "+n+"</b> instead of building a tree.";}
        else{b.tree=true;note="treeifyBin: the bucket had 8 nodes and the table has "+n+" buckets (≥ 64), so the chain became a <b>red-black tree</b> 🌳: lookups in it are now O(log n).";}}
      size++;if(size>n*0.75){const old=resize();note+=(note?" Then ":"")+"size "+size+" &gt; threshold "+(old*0.75)+": <b>resize "+old+" → "+n+"</b>. Each entry stays at its index or moves to index + "+old+", decided by one bit of its hash.";}
      draw({nw:node,aim:tab.findIndex(b=>b.nodes.includes(node))});return {t:"new",before,note};}
    async function op(o){const t=P.go(),key=$('[data-k="key"]',mHost).value,val=parseInt($('[data-k="val"]',mHost).value,10)||0;
      if(o==="clr"){reset();draw();$(".cl-calc",mHost).innerHTML="";msg.innerHTML="An empty HashMap: 16 buckets (in the JDK the table is created on the first put).";return;}
      if(o==="put"){if(!key){msg.innerHTML="Type a key.";return;}const r=await put(key,val,t);if(!r)return;
        msg.innerHTML=r.t==="rep"?"<code>put</code> found an existing key with the same hash that <code>equals</code> \""+esc(key)+"\": the value is replaced and the old value <b>"+r.old+"</b> is returned. Size stays "+size+".":"<code>put</code> returns <b>null</b> (new key)."+(r.before?" The bucket already had "+r.before+" node"+(r.before>1?"s":"")+": a collision; the new node goes at the <b>tail</b> of the chain.":"")+(r.note?" "+r.note:"");return;}
      if(o==="get"||o==="rem"){const {h,i}=calc(key),b=tab[i];draw({aim:i});await wait(500);if(!P.ok(t))return;let f=null;
        for(const x of b.nodes){draw({aim:i,hot:x});await wait(b.tree?150:380);if(!P.ok(t))return;if(x.h===h&&x.k===key){f=x;break;}}
        if(!f){draw({miss:i});msg.innerHTML="<code>"+(o==="get"?"get":"remove")+'("'+esc(key)+'")</code> → <b>null</b>: nothing in bucket '+i+" has the same hash and an equal key.";return;}
        if(o==="get"){draw({aim:i,hot:f});msg.innerHTML="<code>get</code> → <b>"+f.v+"</b>. One bucket, "+(b.nodes.indexOf(f)+1)+" comparison"+(b.nodes.indexOf(f)?"s":"")+(b.tree?" (in a tree bin the JDK compares through the tree: O(log n))":"")+".";return;}
        b.nodes.splice(b.nodes.indexOf(f),1);size--;let note="";if(b.tree&&b.nodes.length<=6){b.tree=false;note=" The tree bin became very small, so it went back to a plain chain.";}
        draw({aim:i});msg.innerHTML="<code>remove</code> → <b>"+f.v+"</b>. Size is now "+size+". Tables never shrink."+note;return;}
      if(o==="fruit"||o==="att"){const keys=o==="fruit"?FRUIT.slice(0,13):ATT.slice(0,11);let last=null;
        for(let k=0;k<keys.length;k++){const r=await put(keys[k],k+1,t,true);if(!r)return;if(r.note){last=r.note;msg.innerHTML="<code>put(\""+keys[k]+"\")</code>: "+r.note;await wait(1300);if(!P.ok(t))return;}}
        msg.innerHTML=o==="fruit"?"13 fruits added. "+(last?"The 13th put pushed size past 12 (16 × 0.75), so the table doubled to 32 and every entry was re-placed. Notice that "+C("apple")+" and others kept or moved their index by exactly 16.":"")+"":"All these keys ("+C("AaAaAaAa")+", "+C("AaAaAaBB")+"…) have hashCode <b>"+jhash(ATT[0])+"</b>, because \"Aa\" and \"BB\" both hash to 2112. From an empty map, the 9th key resizes 16 → 32, the 10th 32 → 64, and the 11th turns the bucket into a tree 🌳: exactly what JDK 25 does.";}}
    mHost.addEventListener("click",e=>{const b=e.target.closest("[data-o]");if(b)op(b.dataset.o);});
    draw();msg.innerHTML="Press <b>put</b> to store <code>apple</code>, then try the two preset buttons. Every number here matches <code>HashMapInternals.java</code> below.";}

  /* 6. LRU cache with LinkedHashMap */
  const rHost=$("#clLru");
  if(rHost){
    const CAP=3;let order=[],access=true,gone=[];const keys=["a","b","c","d","e"];
    rHost.innerHTML=head("LRU cache","new LinkedHashMap<>(16, 0.75f, true) + removeEldestEntry")+'<div class="vbody"><div class="ol-cmds"><label class="ol-tog"><input type="checkbox" data-k="acc" checked> accessOrder = true (LRU)</label></div><div class="ol-cmds"><span class="small muted">put:</span>'+keys.map(k=>'<button type="button" class="chip" data-put="'+k+'">'+k+"</button>").join("")+'<span class="small muted">get:</span>'+keys.map(k=>'<button type="button" class="chip" data-get="'+k+'">'+k+"</button>").join("")+'<button type="button" class="btn" data-o="clr">Clear</button></div><div class="cl-lru"></div><div class="cl-gone"></div><div class="msg" aria-live="polite"></div></div>';
    const msg=$(".msg",rHost);
    function draw(hot){$(".cl-lru",rHost).innerHTML='<span class="cl-end">eldest</span>'+(order.length?order.map(k=>'<span class="cl-node'+(k===hot?" nw":"")+'">'+k+"</span>").join('<i class="cl-lk">⇄</i>'):'<em class="cl-none">empty</em>')+'<span class="cl-end">newest</span><span class="cl-capn">'+order.length+" / "+CAP+"</span>";
      $(".cl-gone",rHost).innerHTML=gone.length?"evicted so far: "+gone.map(k=>'<s>'+k+"</s>").join(" "):"";$(".cl-gone",rHost).style.display=gone.length?"":"none";}
    rHost.addEventListener("click",e=>{const p=e.target.closest("[data-put]"),g=e.target.closest("[data-get]"),c=e.target.closest('[data-o="clr"]');
      if(c){order=[];gone=[];draw();msg.innerHTML="Empty cache.";return;}
      if(p){const k=p.dataset.put,had=order.includes(k);if(had&&access){order.splice(order.indexOf(k),1);order.push(k);}else if(!had)order.push(k);
        let ev="";if(order.length>CAP){const x=order.shift();gone.push(x);ev=" Size became "+(CAP+1)+" &gt; "+CAP+", so <code>removeEldestEntry</code> returned true and <b>"+x+"</b> (the "+(access?"least recently used":"oldest inserted")+") was evicted.";}
        draw(k);msg.innerHTML="<code>put(\""+k+"\")</code>: "+(had?(access?"existing key: value replaced and the entry moves to the newest end.":"existing key: value replaced; in insertion order the position doesn't change."):"new entry at the newest end.")+ev;return;}
      if(g){const k=g.dataset.get;if(!order.includes(k)){draw();msg.innerHTML="<code>get(\""+k+"\")</code> → <b>null</b> (a cache miss"+(gone.includes(k)?": it was evicted":"")+").";return;}
        if(access){order.splice(order.indexOf(k),1);order.push(k);}draw(k);msg.innerHTML="<code>get(\""+k+"\")</code> → hit. "+(access?"With access order, reading <b>moves</b> the entry to the newest end, so it is now the last to be evicted.":"In insertion order, reading changes nothing: this is a FIFO cache, not LRU.");}});
    rHost.addEventListener("change",e=>{const c=e.target.closest('[data-k="acc"]');if(!c)return;access=c.checked;order=[];gone=[];draw();msg.innerHTML=access?"LRU mode. Try: put a, b, c, get a, put d. Which one goes?":"Insertion (FIFO) mode. Try the same: put a, b, c, get a, put d.";});
    draw();msg.innerHTML="Try: <b>put a, b, c</b>, then <b>get a</b>, then <b>put d</b>. The answer matches <code>SetsAndLru.java</code>: <code>[c, a, d]</code>.";}

  /* 7. TreeMap navigation in a balanced search tree */
  const tHost=$("#clNav");
  if(tHost){
    const QS=[["floorKey","largest key ≤ x"],["ceilingKey","smallest key ≥ x"],["lowerKey","largest key < x"],["higherKey","smallest key > x"],["get","exact key"],["headMap","keys < x"],["tailMap","keys ≥ x"]];
    let keys=[0,20,40,50,60,75,82,90,95],q="floorKey";const P=player();
    tHost.innerHTML=head("TreeMap navigator","Walk the tree: one comparison per level")+'<div class="vbody"><div class="vin"><label class="small muted">keys <input data-k="keys" value="'+keys.join(", ")+'" spellcheck="false" style="width:min(100%,300px)" aria-label="keys"></label><label class="small muted">x <input type="number" data-k="x" value="82" style="width:80px" aria-label="x"></label></div><div class="ol-cmds">'+QS.map(([m,d])=>'<button type="button" class="chip" data-q="'+m+'" title="'+d+'">'+m+"(x)</button>").join("")+'</div><div class="cl-tree"></div><div class="cl-line"></div><div class="msg" aria-live="polite"></div></div>';
    const msg=$(".msg",tHost);
    const build=(a,lo,hi,d)=>{if(lo>hi)return null;const m=(lo+hi)>>1;return {k:a[m],d,l:build(a,lo,m-1,d+1),r:build(a,m+1,hi,d+1),x:0};};
    let root=null,W=0;
    function layout(){root=build(keys,0,keys.length-1,0);let c=0;const walk=nd=>{if(!nd)return;walk(nd.l);nd.x=c++;walk(nd.r);};walk(root);W=c;}
    function draw(vis,ans,range){const H=Math.max(1,depth(root)),w=Math.max(320,W*56),h=H*56+10,nodes=[],edges=[];
      const px=nd=>28+nd.x*((w-56)/Math.max(1,W-1)),py=nd=>24+nd.d*56;
      const walk=nd=>{if(!nd)return;[nd.l,nd.r].forEach(ch=>{if(ch)edges.push('<line x1="'+px(nd)+'" y1="'+py(nd)+'" x2="'+px(ch)+'" y2="'+py(ch)+'" class="'+(vis&&vis.includes(nd)&&vis.includes(ch)?"on":"")+'"/>');});
        const cls=(ans===nd?"ans":vis&&vis.includes(nd)?"vis":"")+(range&&range.includes(nd.k)?" rng":"");
        nodes.push('<g class="'+cls+'"><circle cx="'+px(nd)+'" cy="'+py(nd)+'" r="18"/><text x="'+px(nd)+'" y="'+(py(nd)+4)+'" text-anchor="middle">'+nd.k+"</text>"+(vis&&vis.includes(nd)?'<text x="'+(px(nd)+20)+'" y="'+(py(nd)-14)+'" class="cl-st">'+(vis.indexOf(nd)+1)+"</text>":"")+"</g>");walk(nd.l);walk(nd.r);};walk(root);
      $(".cl-tree",tHost).innerHTML='<svg viewBox="0 0 '+w+" "+h+'" style="max-width:'+w+'px" aria-hidden="true">'+edges.join("")+nodes.join("")+"</svg>";
      $(".cl-line",tHost).innerHTML="sorted: "+keys.map(k=>'<span class="'+(ans&&ans.k===k?"ans":range&&range.includes(k)?"rng":"")+'">'+k+"</span>").join("");}
    const depth=nd=>nd?1+Math.max(depth(nd.l),depth(nd.r)):0;
    async function run(){const t=P.go(),x=parseFloat($('[data-k="x"]',tHost).value);if(isNaN(x)){msg.innerHTML="Type a number for x.";return;}
      $$("[data-q]",tHost).forEach(b=>b.classList.toggle("on",b.dataset.q===q));
      if(q==="headMap"||q==="tailMap"){const r=keys.filter(k=>q==="headMap"?k<x:k>=x);draw(null,null,r);msg.innerHTML="<code>"+q+"("+x+")</code> → <code>"+(r.length?"{"+r.join(", ")+"}":"{}")+"</code> (keys only). A <b>live view</b> of the map: the tree finds the boundary in O(log n), then walks in order.";return;}
      const vis=[];let nd=root,best=null;
      while(nd){vis.push(nd);draw(vis.slice(),null);await wait(550);if(!P.ok(t))return;
        if(q==="get"){if(nd.k===x){best=nd;break;}nd=x<nd.k?nd.l:nd.r;}
        else if(q==="floorKey"){if(nd.k===x){best=nd;break;}if(nd.k<x){best=nd;nd=nd.r;}else nd=nd.l;}
        else if(q==="ceilingKey"){if(nd.k===x){best=nd;break;}if(nd.k>x){best=nd;nd=nd.l;}else nd=nd.r;}
        else if(q==="lowerKey"){if(nd.k<x){best=nd;nd=nd.r;}else nd=nd.l;}
        else if(q==="higherKey"){if(nd.k>x){best=nd;nd=nd.l;}else nd=nd.r;}}
      draw(vis,best);const d=QS.find(z=>z[0]===q)[1];
      msg.innerHTML="<code>"+q+"("+x+")</code> → <b>"+(best?best.k:"null")+"</b> ("+d.replace("x",x)+"). It compared at <b>"+vis.length+"</b> node"+(vis.length>1?"s":"")+" out of "+keys.length+": one per level, O(log n). "+(q==="get"?"":"Going right means \"this key is a candidate, look for a closer one\"; going left, the opposite.");}
    tHost.addEventListener("click",e=>{const b=e.target.closest("[data-q]");if(b){q=b.dataset.q;run();}});
    tHost.addEventListener("input",e=>{const k=e.target.closest('[data-k="keys"]');if(!k)return;const ks=[...new Set(k.value.split(/[\s,]+/).filter(x=>x!=="").map(Number).filter(Number.isFinite))].sort((a,b)=>a-b).slice(0,15);
      if(!ks.length)return;keys=ks;layout();draw();msg.innerHTML="A TreeMap keeps duplicates out and the keys sorted: "+keys.length+" key"+(keys.length>1?"s":"")+", height "+depth(root)+".";});
    layout();draw();msg.innerHTML="The tree is drawn perfectly balanced; a red-black tree is never more than about twice as tall. Pick a query: <b>floorKey(82)</b> answers \"which grade band does 82 fall in?\".";}

  /* 8. PriorityQueue: binary heap */
  const hHost=$("#clHeap");
  if(hHost){
    let a=[];const P=player(),MAX=15;
    hHost.innerHTML=head("Binary min-heap","PriorityQueue: offer sifts up, poll sifts down")+'<div class="vbody"><div class="ol-cmds"><span class="ol-pt">offer(<input type="number" data-k="v" value="2" aria-label="value" style="width:64px">)</span><button type="button" class="btn pri" data-o="offer">offer</button><button type="button" class="btn" data-o="rand">offer random</button><button type="button" class="btn" data-o="poll">poll()</button><button type="button" class="btn" data-o="seed">5, 1, 8, 3, 2</button><button type="button" class="btn" data-o="clr">Clear</button></div><div class="cl-heap"></div><div class="cl-harr"></div><div class="msg" aria-live="polite"></div></div>';
    const msg=$(".msg",hHost);
    function draw(o){o=o||{};const L=a.length?Math.floor(Math.log2(a.length))+1:1,w=480,h=L*58+14;
      const pos=i=>{const lv=Math.floor(Math.log2(i+1)),k=i+1-(1<<lv),slots=1<<lv;return [(k+.5)*w/slots,24+lv*58];};
      let e="",nds="";a.forEach((v,i)=>{const [x,y]=pos(i);if(i){const [px,py]=pos((i-1)>>1);e+='<line x1="'+px+'" y1="'+py+'" x2="'+x+'" y2="'+y+'" class="'+(o.cmp&&o.cmp.includes(i)&&o.cmp.includes((i-1)>>1)?"on":"")+'"/>';}
        nds+='<g class="'+(o.hot&&o.hot.includes(i)?"vis":"")+(o.root&&i===0?" ans":"")+'"><circle cx="'+x+'" cy="'+y+'" r="18"/><text x="'+x+'" y="'+(y+4)+'" text-anchor="middle">'+v+'</text><text x="'+(x+20)+'" y="'+(y-14)+'" class="cl-st">'+i+"</text></g>";});
      $(".cl-heap",hHost).innerHTML=a.length?'<svg viewBox="0 0 '+w+" "+h+'" style="max-width:'+w+'px" aria-hidden="true">'+e+nds+"</svg>":'<em class="cl-none">empty queue</em>';
      $(".cl-harr",hHost).innerHTML="queue[] = "+(a.length?a.map((v,i)=>'<span class="'+(o.hot&&o.hot.includes(i)?"hot":"")+'"><b>'+v+"</b><small>"+i+"</small></span>").join(""):"[]")+'<em class="cl-ts">toString() → ['+a.join(", ")+"]</em>";}
    async function offer(v,t){if(a.length>=MAX){msg.innerHTML="That's enough for one picture ("+MAX+").";return false;}
      a.push(v);let k=a.length-1,steps=0;draw({hot:[k]});await wait(450);if(!P.ok(t))return false;
      while(k>0){const p=(k-1)>>1;draw({hot:[k,p],cmp:[k,p]});await wait(500);if(!P.ok(t))return false;if(a[k]>=a[p])break;[a[k],a[p]]=[a[p],a[k]];k=p;steps++;draw({hot:[k]});await wait(350);if(!P.ok(t))return false;}
      draw({hot:[k],root:true});msg.innerHTML="<code>offer("+v+")</code>: placed at index "+(a.length-1)+", then <b>sifted up</b> "+steps+" level"+(steps===1?"":"s")+" (swapping while smaller than its parent at <code>(i − 1) / 2</code>). At most log₂ n swaps.";return true;}
    async function op(o){const t=P.go();
      if(o==="clr"){a=[];draw();msg.innerHTML="Empty.";return;}
      if(o==="seed"){a=[];for(const v of [5,1,8,3,2]){if(!(await offer(v,t)))return;await wait(250);}msg.innerHTML="Offered 5, 1, 8, 3, 2 one at a time: <code>[1, 2, 8, 5, 3]</code>. (<code>new PriorityQueue&lt;&gt;(List.of(5, 1, 8, 3, 2))</code> heapifies instead and gives <code>[1, 2, 8, 3, 5]</code>; both are valid heaps, neither is sorted.)";return;}
      if(o==="offer"||o==="rand"){const v=o==="rand"?Math.floor(Math.random()*99)+1:(parseInt($('[data-k="v"]',hHost).value,10)||0);await offer(v,t);return;}
      if(o==="poll"){if(!a.length){msg.innerHTML="<code>poll()</code> → <b>null</b> (empty queue).";return;}
        const top=a[0];draw({hot:[0],root:true});await wait(450);if(!P.ok(t))return;const last=a.pop();
        if(!a.length){draw();msg.innerHTML="<code>poll()</code> → <b>"+top+"</b>. The queue is empty now.";return;}
        a[0]=last;let k=0,steps=0;draw({hot:[0]});await wait(450);if(!P.ok(t))return;
        while(true){const l=2*k+1,r=l+1;if(l>=a.length)break;const c=r<a.length&&a[r]<a[l]?r:l;draw({hot:[k,c],cmp:[k,c]});await wait(500);if(!P.ok(t))return;if(a[k]<=a[c])break;[a[k],a[c]]=[a[c],a[k]];k=c;steps++;draw({hot:[k]});await wait(350);if(!P.ok(t))return;}
        draw({hot:[k]});msg.innerHTML="<code>poll()</code> → <b>"+top+"</b>, the smallest. The last element ("+last+") moved to the root and <b>sifted down</b> "+steps+" level"+(steps===1?"":"s")+", each time swapping with its <b>smaller</b> child (<code>2i + 1</code> or <code>2i + 2</code>).";}}
    hHost.addEventListener("click",e=>{const b=e.target.closest("[data-o]");if(b)op(b.dataset.o);});
    draw();msg.innerHTML="Press <b>5, 1, 8, 3, 2</b> to build a heap, then <b>poll()</b> a few times: values come out in sorted order even though the array never is.";}

  /* 9. ArrayDeque ring buffer */
  const dHost=$("#clDeque");
  if(dHost){
    let N=8,es,hd,tl,cnt,nx=1;const reset=()=>{N=8;es=Array(N).fill(null);hd=0;tl=0;cnt=0;nx=1;};reset();
    dHost.innerHTML=head("ArrayDeque ring","head and tail move; elements never shift")+'<div class="vbody"><div class="ol-cmds"><button type="button" class="btn" data-o="af">addFirst / push</button><button type="button" class="btn pri" data-o="al">addLast / offer</button><button type="button" class="btn" data-o="pf">pollFirst / pop / poll</button><button type="button" class="btn" data-o="pl">pollLast</button><button type="button" class="btn" data-o="clr">Clear</button></div><div class="cl-ring"></div><div class="cl-dq"></div><div class="msg" aria-live="polite"></div></div>';
    const msg=$(".msg",dHost);
    function draw(hot){$(".cl-ring",dHost).style.setProperty("--n",N);
      $(".cl-ring",dHost).innerHTML=es.map((v,i)=>'<span class="'+(v!==null?"cl-f":"cl-e")+(i===hot?" nw":"")+'"><b>'+(v===null?"":v)+"</b><small>"+i+"</small>"+(i===hd&&cnt?'<em class="cl-h">head</em>':"")+(i===tl?'<em class="cl-t">tail</em>':"")+"</span>").join("");
      const seq=[];for(let k=0;k<cnt;k++)seq.push(es[(hd+k)%N]);$(".cl-dq",dHost).innerHTML="deque (first → last): <b>["+seq.join(", ")+"]</b>";}
    function grow(){const seq=[];for(let k=0;k<cnt;k++)seq.push(es[(hd+k)%N]);N*=2;es=Array(N).fill(null);seq.forEach((v,i)=>es[i]=v);hd=0;tl=cnt;return seq.length;}
    dHost.addEventListener("click",e=>{const b=e.target.closest("[data-o]");if(!b)return;const o=b.dataset.o;let note="",at=-1;
      if(o==="clr"){reset();draw();msg.innerHTML="Empty ring of 8 slots.";return;}
      if(o==="af"||o==="al"){if(cnt===N-1){const c=grow();note=" The ring was full, so it <b>grew to "+N+" slots</b> and the "+c+" elements were copied across in order (the JDK grows a small deque to 2n + 2 slots and moves the wrapped part so the order stays intact).";}
        const v=nx++;if(o==="af"){hd=(hd-1+N)%N;es[hd]=v;at=hd;}else{es[tl]=v;at=tl;tl=(tl+1)%N;}cnt++;
        msg.innerHTML=(o==="af"?"<code>addFirst("+v+")</code>: head moved one slot <b>left</b>"+(at===N-1?" and <b>wrapped</b> to the end of the array":"")+".":"<code>addLast("+v+")</code>: written at tail, then tail moved right"+(tl===0?" and <b>wrapped</b> to 0":"")+".")+" Nothing shifted: O(1)."+note;}
      else{if(!cnt){msg.innerHTML="Empty: <code>pollFirst()</code> returns <b>null</b>; <code>pop()</code> would throw <code>NoSuchElementException</code>.";return;}
        let v;if(o==="pf"){v=es[hd];es[hd]=null;hd=(hd+1)%N;}else{tl=(tl-1+N)%N;v=es[tl];es[tl]=null;}cnt--;
        msg.innerHTML="<code>"+(o==="pf"?"pollFirst":"pollLast")+"()</code> → <b>"+v+"</b>; the slot is cleared and "+(o==="pf"?"head":"tail")+" moves. O(1).";}
      draw(at);});
    draw();msg.innerHTML="Press <b>addFirst</b> a few times: head wraps around to the end of the array. As a stack use push/pop (the first end); as a queue use offer (last) and poll (first). This picture uses 8 slots; <code>new ArrayDeque&lt;&gt;()</code> starts with 17 (room for 16, because one slot always stays free so that head == tail means empty).";}

  /* 10. Comparator builder */
  const cHost=$("#clCmp");
  if(cHost){
    const S=[{name:"Ravi",marks:82,age:21,city:"Pune"},{name:"Anu",marks:91,age:20,city:"Delhi"},{name:"Kiran",marks:82,age:19,city:"Pune"},{name:"Meera",marks:91,age:22,city:"Chennai"},{name:"Arjun",marks:75,age:20,city:"Delhi"},{name:"Zoya",marks:82,age:20,city:"Chennai"}];
    const F={name:"s",marks:"i",age:"i",city:"s"};
    let chain=[{f:"marks",d:true},{f:"name",d:false}];
    cHost.innerHTML=head("Comparator builder","comparing → thenComparing → reversed")+'<div class="vbody"><div class="ol-cmds"><span class="small muted">add a key:</span>'+Object.keys(F).map(f=>'<button type="button" class="chip" data-add="'+f+'">+ '+f+"</button>").join("")+'<button type="button" class="btn" data-o="clr">Clear</button></div><div class="cl-chain"></div><div class="cl-csrc"></div><div class="tw"><table class="cl-ctab"></table></div><div class="cl-tset"></div><div class="msg" aria-live="polite"></div></div>';
    const msg=$(".msg",cHost);
    const cmp1=(f,d)=>(x,y)=>{const a=x[f],b=y[f];const r=F[f]==="i"?(a<b?-1:a>b?1:0):(a<b?-1:a>b?1:0);return d?-r:r;};
    const cmp=(x,y)=>{for(const c of chain){const r=cmp1(c.f,c.d)(x,y);if(r)return r;}return 0;};
    const ref=f=>"Student::"+f,key=(f)=>F[f]==="i"?"comparingInt("+ref(f)+")":"comparing("+ref(f)+")";
    function src(){if(!chain.length)return ["// no comparator: insertion order","list.sort(null);   // would use Comparable (natural order)"];
      const L=["list.sort(Comparator."+key(chain[0].f)+(chain[0].d?".reversed()":"")];
      chain.slice(1).forEach(c=>L.push("        ."+(c.d?"thenComparing(Comparator."+key(c.f)+".reversed())":(F[c.f]==="i"?"thenComparingInt(":"thenComparing(")+ref(c.f)+")")));L[L.length-1]+=");";return L;}
    function draw(){$(".cl-chain",cHost).innerHTML=chain.length?chain.map((c,i)=>'<span class="cl-key">'+(i?"then ":"")+"<b>"+c.f+'</b><button type="button" data-dir="'+i+'" aria-label="toggle direction">'+(c.d?"↓ desc":"↑ asc")+'</button><button type="button" data-del="'+i+'" aria-label="remove key">×</button></span>').join(""):'<em class="cl-none">no keys: the list keeps its insertion order</em>';
      $$("[data-add]",cHost).forEach(b=>b.disabled=chain.some(c=>c.f===b.dataset.add));
      $(".cl-csrc",cHost).innerHTML=codeLines(src(),-1);
      const sorted=S.map((s,i)=>({s,i})).sort((p,q)=>cmp(p.s,q.s)||p.i-q.i);
      $(".cl-ctab",cHost).innerHTML="<tr><th>#</th><th>name</th><th>marks</th><th>age</th><th>city</th><th></th></tr>"+sorted.map(({s},k)=>{const tie=chain.length&&((k&&!cmp(s,sorted[k-1].s))||(k<sorted.length-1&&!cmp(s,sorted[k+1].s)));
        return "<tr"+(tie?' class="cl-tie"':"")+"><td>"+(k+1)+"</td>"+["name","marks","age","city"].map(f=>"<td"+(chain.some(c=>c.f===f)?' class="cl-kc"':"")+">"+s[f]+"</td>").join("")+"<td>"+(tie?"tie":"")+"</td></tr>";}).join("");
      const kept=[];S.forEach(s=>{if(!kept.some(k=>chain.length?!cmp(k,s):k===s))kept.push(s);});
      $(".cl-tset",cHost).innerHTML="<b>new TreeSet&lt;&gt;(this comparator)</b> keeps <b>"+kept.length+"</b> of "+S.length+(kept.length<S.length?": "+S.filter(s=>!kept.includes(s)).map(s=>"<s>"+s.name+"</s>").join(", ")+" dropped (compare == 0 with an earlier one)":": all distinct");
      const ties=$$(".cl-tie",cHost).length;
      msg.innerHTML=!chain.length?"Add a key to start sorting.":ties?"Rows marked <b>tie</b> compare as 0 on every key, so <code>List.sort</code> (stable) keeps their original order. Add another key to break the tie.":"Every row is fully ordered: no two students compare as equal."+(chain[0].d&&chain.length>1?" Note where <code>.reversed()</code> sits: right after the first key, so only marks are descending.":"");}
    cHost.addEventListener("click",e=>{const a=e.target.closest("[data-add]"),d=e.target.closest("[data-dir]"),x=e.target.closest("[data-del]"),c=e.target.closest('[data-o="clr"]');
      if(a)chain.push({f:a.dataset.add,d:false});else if(d)chain[+d.dataset.dir].d=!chain[+d.dataset.dir].d;else if(x)chain.splice(+x.dataset.del,1);else if(c)chain=[];else return;draw();});
    draw();}

  /* 11. Fail-fast iterator: ArrayList.Itr step by step */
  const fHost=$("#clFail");
  if(fHost){
    const SC={a:{t:"remove when n == 1",cond:n=>n===1,it:false},b:{t:"remove when n == 3",cond:n=>n===3,it:false},c:{t:"it.remove() when even",cond:n=>n%2===0,it:true}};
    let sc="a",FR=[];
    const lines=s=>["List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4));","Iterator<Integer> it = list.iterator();   // what for-each does","while (it.hasNext()) {                    // cursor != size ?","    Integer n = it.next();                // throws if modCount != expectedModCount",
      s.it?"    if (n % 2 == 0) it.remove();          // expectedModCount = modCount":"    if ("+(s===SC.a?"n == 1":"n == 3")+") list.remove(n);           // modCount++, size--","}","System.out.println(list);"];
    function gen(){const s=SC[sc],L=[1,2,3,4],F=[];let cur=0,mod=0,exp=0,last=-1,n=null;
      const push=(line,m,st)=>F.push({line,L:L.slice(),cur,mod,exp,n,m,st:st||""});
      push(0,"A new ArrayList of 4. <code>modCount</code> = 0.");push(1,"<code>iterator()</code> records <code>expectedModCount = modCount</code> = 0; <code>cursor</code> = 0.");
      for(let g=0;g<12;g++){
        const hn=cur!==L.length;push(2,"<code>hasNext()</code>: cursor "+cur+" != size "+L.length+" → <b>"+hn+"</b>."+(hn?"":(sc==="b"?" <b>The loop ends</b> although element 4 was never visited! No exception: <code>next()</code>, which does the check, is never called.":" The loop ends normally.")));
        if(!hn)break;
        if(mod!==exp){push(3,"<code>next()</code> checks: modCount "+mod+" != expectedModCount "+exp+" → throws <b>ConcurrentModificationException</b>.","cme");return F;}
        n=L[cur];last=cur;cur++;push(3,"<code>next()</code>: counts match ("+mod+" = "+exp+"), returns <b>"+n+"</b>, cursor → "+cur+".");
        if(s.cond(n)){if(s.it){L.splice(last,1);cur=last;mod++;exp=mod;last=-1;push(4,"<code>it.remove()</code> removes "+n+" through the iterator: modCount → "+mod+" <b>and</b> expectedModCount → "+exp+"; cursor steps back to "+cur+". Counts stay in sync.");}
          else{L.splice(L.indexOf(n),1);mod++;push(4,"<code>list.remove("+n+")</code> goes around the iterator: size → "+L.length+", <b>modCount → "+mod+"</b>, but expectedModCount is still "+exp+".");}}
        else push(4,"Condition false for "+n+": nothing removed.");}
      push(6,"Prints <b>["+L.join(", ")+"]</b>."+(sc==="b"?" Matches <code>FailFast.java</code>: the second-to-last trick silently skipped 4.":""),"ok");return F;}
    fHost.innerHTML=head("Fail-fast iterator","ArrayList.Itr, one call at a time")+'<div class="vbody"><div class="ol-cmds"><span class="small muted">scenario:</span>'+Object.entries(SC).map(([k,s])=>'<button type="button" class="chip" data-sc="'+k+'">'+s.t+"</button>").join("")+'</div><div class="cl-fail"><div class="cl-fsrc"></div><div><div class="cl-flist"></div><div class="cl-fvars"></div></div></div><div class="msg" aria-live="polite"></div>'+ctrls+"</div>";
    const S=stepper(fHost,()=>FR,(f)=>{$(".cl-fsrc",fHost).innerHTML=codeLines(lines(SC[sc]),f.line);
      $(".cl-flist",fHost).innerHTML=f.L.map((v,i)=>'<span class="'+(i===f.cur?"cl-cur":"")+'"><b>'+v+"</b><small>"+i+"</small></span>").join("")+(f.cur===f.L.length?'<span class="cl-cur cl-ghost"><b>·</b><small>'+f.cur+"</small></span>":"");
      $(".cl-fvars",fHost).innerHTML=[["cursor",f.cur],["size",f.L.length],["modCount",f.mod],["expectedModCount",f.exp]].map(([k,v])=>'<span class="'+((k==="modCount"||k==="expectedModCount")&&f.mod!==f.exp?"cl-bad":"")+'">'+k+" <b>"+v+"</b></span>").join("");
      const m=$(".msg",fHost);m.innerHTML=f.m;m.classList.toggle("err",f.st==="cme");});
    const setSc=k=>{sc=k;FR=gen();$$("[data-sc]",fHost).forEach(b=>b.classList.toggle("on",b.dataset.sc===sc));S.go(0);};
    fHost.addEventListener("click",e=>{const b=e.target.closest("[data-sc]");if(b){S.stop();setSc(b.dataset.sc);}});
    setSc("a");}

  /* 12. Views vs copies */
  const vHost=$("#clView");
  if(vHost){
    let base,arr,copy,of;const reset=()=>{base=["a","b"];arr=["x","y"];copy=["a","b"];of=["a","b"];};reset();
    const ACT=[["base.add(\"c\")",()=>{base.push("c");return {ch:["base","view"]};}],["view.add(\"x\")",()=>({ex:"view",e:"UnsupportedOperationException"})],["copy.set(0, \"x\")",()=>({ex:"copy",e:"UnsupportedOperationException"})],["of.add(\"z\")",()=>({ex:"of",e:"UnsupportedOperationException"})],
      ["arr[0] = \"z\"",()=>{arr[0]="z";return {ch:["arr","fixed"]};}],["fixed.set(1, \"q\")",()=>{arr[1]="q";return {ch:["arr","fixed"]};}],["fixed.add(\"w\")",()=>({ex:"fixed",e:"UnsupportedOperationException"})],["List.of(\"a\", null)",()=>({ex:"of",e:"NullPointerException"})]];
    vHost.innerHTML=head("Views vs copies","Who sees a change, and who throws")+'<div class="vbody"><div class="ol-cmds">'+ACT.map((a,i)=>'<button type="button" class="btn" data-i="'+i+'"><code>'+esc(a[0])+"</code></button>").join("")+'<button type="button" class="btn" data-o="clr">Reset</button></div><div class="cl-views"></div><div class="msg" aria-live="polite"></div></div>';
    const msg=$(".msg",vHost);
    const CARDS=[["base","List<String> base = new ArrayList<>(List.of(\"a\", \"b\"));","mutable",()=>base],["view","Collections.unmodifiableList(base)","read-only view",()=>base],["copy","List.copyOf(base)   // taken at the start","immutable copy",()=>copy],["of","List.of(\"a\", \"b\")","immutable",()=>of],["arr","String[] arr = {\"x\", \"y\"};","array",()=>arr],["fixed","Arrays.asList(arr)","fixed-size view",()=>arr]];
    function draw(r){r=r||{};$(".cl-views",vHost).innerHTML=CARDS.map(([k,code,tag,get])=>'<div class="cl-vc'+(r.ch&&r.ch.includes(k)?" ch":"")+(r.ex===k?" ex":"")+'"><div class="cl-vh"><b>'+k+"</b><span>"+tag+'</span></div><code class="cl-vcode">'+esc(code)+'</code><div class="cl-vv">['+get().map(esc).join(", ")+"]</div>"+(r.ex===k?'<div class="cl-ve">'+r.e+"</div>":"")+"</div>").join("");
      if(r.ch||r.ex)$$(".cl-vc.ch,.cl-vc.ex",vHost).forEach(pulse);}
    vHost.addEventListener("click",e=>{const b=e.target.closest("[data-i]"),c=e.target.closest('[data-o="clr"]');if(c){reset();draw();msg.innerHTML="Back to the start.";return;}if(!b)return;
      const [lab,fn]=ACT[+b.dataset.i],r=fn();draw(r);
      msg.innerHTML="<code>"+esc(lab)+"</code> → "+(r.ex?"<b>"+r.e+"</b>. "+(r.e==="NullPointerException"?"<code>List.of</code>, <code>Set.of</code> and <code>Map.of</code> reject null elements, keys and values.":r.ex==="view"?"The view blocks every write, but it is only a window onto <code>base</code>.":r.ex==="fixed"?"<code>Arrays.asList</code> can't change size: it is the array.":"Immutable collections reject every change."):"changed: <b>"+r.ch.join("</b> and <b>")+"</b>. "+(r.ch.includes("view")?"The unmodifiable <b>view</b> shows the new element; the <b>copy</b> does not.":"<code>Arrays.asList</code> and the array share the same storage, so both show it."));});
    draw();msg.innerHTML="Press <code>base.add(\"c\")</code> first: which cards change?";}

  /* 13. Lost updates: HashMap vs synchronizedMap vs ConcurrentHashMap */
  const xHost=$("#clRace");
  if(xHost){
    const MODES={hm:"HashMap",sync:"synchronizedMap",chm:"ConcurrentHashMap"};let mode="hm",FR=[];
    function gen(){const F=[],m={hits:5,misses:0},th={T1:"",T2:"",T3:""},lk={};let tk=0;
      const push=(msg,o)=>{F.push({m:{...m},th:{...th},lk:{...lk},msg,tk,o:o||{}});};
      const set=(t,s)=>{th[t]=s;};
      push("Start: <code>hits</code> = 5, <code>misses</code> = 0. T1 and T2 each do <code>merge(\"hits\", 1, Integer::sum)</code>; T3 does <code>merge(\"misses\", 1, …)</code>, a different bucket.");
      if(mode==="hm"){let r1,r2,r3;
        tk++;r1=m.hits;set("T1","read hits = "+r1);r2=m.hits;set("T2","read hits = "+r2);r3=m.misses;set("T3","read misses = "+r3);push("Time 1: all three threads read at once. T1 and T2 <b>both see 5</b>. Nothing stops them: HashMap has no locks.");
        tk++;m.hits=r1+1;set("T1","write hits = "+(r1+1)+" ✓");m.misses=r3+1;set("T3","write misses = 1 ✓");set("T2","computing 5 + 1");push("Time 2: T1 writes 6. T3 writes misses = 1.",{w:["hits","misses"]});
        tk++;m.hits=r2+1;set("T2","write hits = "+(r2+1)+" ✗");set("T1","done");set("T3","done");push("Time 3: T2 writes <b>6</b> too, based on its stale read. <b>One increment is lost</b>: hits should be 7.",{w:["hits"],bad:true});}
      else if(mode==="sync"){const one=(t,k)=>{tk++;lk.map=t;set(t,"🔒 locked the whole map");push("Time "+tk+": "+t+" takes the <b>map</b> lock. "+["T1","T2","T3"].filter(x=>x!==t&&th[x]!=="done").join(" and ")+" must <b>wait</b>, even T3, which wants a different key.");
          ["T1","T2","T3"].forEach(x=>{if(x!==t&&th[x]!=="done")set(x,"⏳ waiting for the map lock");});
          tk++;m[k]++;set(t,"read + write "+k+" = "+m[k]+" ✓");push("Time "+tk+": "+t+" reads and writes "+k+" = "+m[k]+" while holding the lock.",{w:[k]});delete lk.map;set(t,"done");};
        one("T1","hits");one("T2","hits");one("T3","misses");F[F.length-1].msg+=" Correct (hits = 7), but the three updates ran <b>one after another</b>: "+tk+" time steps.";}
      else{tk++;lk.hits="T1";lk.misses="T3";set("T1","🔒 bin(hits)");set("T3","🔒 bin(misses)");set("T2","⏳ waiting for bin(hits)");push("Time 1: T1 locks the <b>hits bucket</b>, T3 locks the <b>misses bucket</b> at the same moment. Only T2, which wants the same bucket as T1, waits.");
        tk++;m.hits++;m.misses++;set("T1","hits = 6 ✓");set("T3","misses = 1 ✓");push("Time 2: T1 and T3 update <b>in parallel</b>.",{w:["hits","misses"]});
        tk++;delete lk.misses;lk.hits="T2";set("T1","done");set("T3","done");set("T2","🔒 bin(hits)");push("Time 3: T1 releases; T2 locks the hits bucket and reads 6.");
        tk++;m.hits++;delete lk.hits;set("T2","hits = 7 ✓");push("Time 4: T2 writes 7. Correct, in "+tk+" time steps instead of 6: writes to different buckets don't block each other, and reads never lock.",{w:["hits"]});}
      return F;}
    xHost.innerHTML=head("Lost update","Two threads, one key")+'<div class="vbody"><div class="ol-cmds"><span class="small muted">map:</span>'+Object.entries(MODES).map(([k,v])=>'<button type="button" class="chip" data-m="'+k+'">'+v+"</button>").join("")+'</div><div class="cl-race"><div class="cl-lanes"></div><div class="cl-mapbox"></div></div><div class="msg" aria-live="polite"></div>'+ctrls+'<div class="ol-cmds cl-sim"><button type="button" class="btn" data-o="sim">Run 1,000 random interleavings (HashMap)</button><span class="cl-simout"></span></div></div>';
    const S=stepper(xHost,()=>FR,f=>{$(".cl-lanes",xHost).innerHTML=["T1","T2","T3"].map(t=>'<div class="cl-lane"><b>'+t+"</b><span>"+(f.th[t]||"ready")+"</span></div>").join("");
      $(".cl-mapbox",xHost).innerHTML="<h5>"+MODES[mode]+"</h5>"+["hits","misses"].map(k=>'<div class="'+(f.o.w&&f.o.w.includes(k)?(f.o.bad?"cl-bad":"cl-nw"):"")+'">'+k+" = <b>"+f.m[k]+"</b>"+(f.lk[k]?" 🔒 "+f.lk[k]:"")+"</div>").join("")+(f.lk.map?'<div class="cl-lk2">🔒 whole map: '+f.lk.map+"</div>":"");
      const m=$(".msg",xHost);m.innerHTML=f.msg;m.classList.toggle("err",!!f.o.bad);});
    const setM=k=>{mode=k;FR=gen();$$("[data-m]",xHost).forEach(b=>b.classList.toggle("on",b.dataset.m===mode));S.go(0);};
    xHost.addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(b){S.stop();setM(b.dataset.m);return;}
      if(e.target.closest('[data-o="sim"]')){let lost=0,hist={};for(let r=0;r<1000;r++){let v=0;const pc=[0,0],tmp=[0,0];while(pc[0]<6||pc[1]<6){const t=pc[0]>=6?1:pc[1]>=6?0:(Math.random()<.5?0:1);if(pc[t]%2===0)tmp[t]=v;else v=tmp[t]+1;pc[t]++;}hist[v]=(hist[v]||0)+1;if(v<6)lost++;}
        $(".cl-simout",xHost).innerHTML="each thread adds 1 three times (expected 6): <b>"+lost+"</b> of 1,000 runs lost updates · results "+Object.keys(hist).sort((a,b)=>b-a).map(k=>k+"×"+hist[k]).join(", ");}});
    setM("hm");}
})();
