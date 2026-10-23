/* Lesson 05 labs: OOP concept labs (v24) and the car story (v25), which also sets OLF.
   Part of the course scripts. Every page loads, in this order: course-index.js, quiz-data.js, course.js, effects.js,
   labs-oop.js, labs-collections.js, labs-analogy.js, labs-sorting.js, practice-tools.js. They are classic scripts, so
   top-level const/let/function names are shared between them (course.js defines $, $$, esc, store, hl, FX, THM…). */
"use strict";
/* OOP labs (v24): interactive concept visualisations for Lesson 05, one per section. Each lab is a .viz.ol host
   (#olObj #olInit #olAccess #olStatic #olFragile #olDispatch #olDiamond #olHash #olSealed #olRecord) that this block fills.
   Every compiler message and output shown was checked with javac / java on JDK 25. */
(function(){
  if(!$(".ol[id]"))return;
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait=ms=>new Promise(r=>setTimeout(r,still?Math.min(ms,40):ms));
  const C=s=>"<code>"+esc(s)+"</code>";
  const codeBlock=(lines,cls)=>'<div class="ol-code '+(cls||"")+'">'+lines.map((l,i)=>'<div class="ol-l" data-i="'+i+'">'+(hl(l)||" ")+"</div>").join("")+"</div>";
  const head=(t,sub)=>'<div class="ol-head"><b>'+t+"</b><span>"+sub+"</span></div>";
  /* a cancellable player: start() invalidates the previous run */
  const player=()=>{let tok=0;return {go(){return ++tok;},ok(t){return t===tok;},stop(){tok++;}};};
  /* reference arrows drawn in an SVG overlay: pairs of [fromEl, toEl, cls] */
  let mk=0;
  function arrows(host,svg,pairs){const hb=host.getBoundingClientRect(),id="olm"+(++mk);
    svg.setAttribute("width",hb.width);svg.setAttribute("height",hb.height);
    svg.innerHTML='<defs><marker id="'+id+'" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker></defs>'+
      pairs.map(([a,b,cls])=>{if(!a||!b)return "";const r1=a.getBoundingClientRect(),r2=b.getBoundingClientRect();
        if(!r1.width||!r2.width)return "";
        const x1=r1.right-hb.left,y1=r1.top+r1.height/2-hb.top,x2=r2.left-hb.left-2,y2=r2.top+Math.min(22,r2.height/2)-hb.top,dx=Math.max(30,(x2-x1)/2);
        return '<path class="'+(cls||"")+'" d="M'+x1+" "+y1+" C"+(x1+dx)+" "+y1+","+(x2-dx)+" "+y2+","+x2+" "+y2+'" marker-end="url(#'+id+')"/>';}).join("");}
  const onResize=f=>addEventListener("resize",()=>requestAnimationFrame(f),{passive:true});
  const pulse=el=>{if(!el||still)return;el.animate([{transform:"scale(1.18)"},{transform:"scale(1)"}],{duration:420,easing:"cubic-bezier(.2,1.6,.4,1)"});};
  const shake=el=>{if(!el||still)return;el.animate([{transform:"translateX(0)"},{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"translateX(-3px)"},{transform:"translateX(0)"}],{duration:360});};

  /* 1. Object lab: references, aliasing, null, unreachable objects and GC */
  const objHost=$("#olObj");
  if(objHost){
    const MODELS=["Swift","Nexon","Creta","Punch","Verna","Brezza"];
    let V,O,nid,mi,log;
    const reset=()=>{V={a:null,b:null,c:null};O=[];nid=1;mi=0;log=["Car a = null, b = null, c = null;"];};
    reset();
    const CMDS=[["a = new Car(…)",()=>nw("a")],["b = new Car(…)",()=>nw("b")],["c = a",()=>as("c","a")],["b = a",()=>as("b","a")],["a = b",()=>as("a","b")],
      ["a.speed += 20",()=>sp("a")],["c.speed += 20",()=>sp("c")],["a = null",()=>nl("a")],["b = null",()=>nl("b")],["c = null",()=>nl("c")],["System.gc()",()=>gc()]];
    objHost.innerHTML=head("Object lab","Run statements and watch references, objects, aliases and garbage")+
      '<div class="vbody"><div class="ol-cmds">'+CMDS.map((c,i)=>'<button type="button" class="chip" data-c="'+i+'">'+esc(c[0])+"</button>").join("")+'<button type="button" class="btn" data-c="r">Reset</button></div>'+
      '<div class="ol-mem"><svg class="ol-arw" aria-hidden="true"></svg><div class="ol-col"><h5>Stack · main()</h5><div class="ol-vars"></div></div><div class="ol-col"><h5>Heap</h5><div class="ol-heap"></div></div></div>'+
      '<div class="ol-row2"><div class="ol-log"></div><div class="ol-eq"></div></div><div class="msg" aria-live="polite"></div></div>';
    const $o=s=>$(s,objHost),msg=$o(".msg");
    const refs=id=>Object.keys(V).filter(k=>V[k]===id);
    function draw(fresh){
      $o(".ol-vars").innerHTML=Object.keys(V).map(k=>'<div class="ol-var" data-v="'+k+'"><span>Car '+k+"</span>"+(V[k]==null?"<b class=nul>null</b>":'<b class="ref">ref</b>')+"</div>").join("");
      $o(".ol-heap").innerHTML=O.map(o=>{const r=refs(o.id);return '<div class="ol-obj'+(r.length?"":" gone")+(fresh===o.id?" pop":"")+'" data-o="'+o.id+'"><small>Car #'+o.id+(r.length?" · refs: "+r.join(", "):" · unreachable")+"</small><div>model = <b>\""+o.model+"\"</b></div><div>speed = <b>"+o.speed+"</b></div></div>";}).join("")||'<div class="ol-empty">nothing on the heap yet</div>';
      $o(".ol-log").innerHTML=log.slice(-7).map((l,i,a)=>'<div class="'+(i===a.length-1?"cur":"")+'">'+hl(l)+"</div>").join("");
      const eq=(x,y)=>'<div><code>'+x+" == "+y+"</code><b class=\""+(V[x]===V[y]?"ok":"no")+'">'+(V[x]===V[y])+"</b></div>";
      $o(".ol-eq").innerHTML=eq("a","b")+eq("a","c")+eq("b","c");
      requestAnimationFrame(()=>arrows($o(".ol-mem"),$o(".ol-arw"),Object.keys(V).filter(k=>V[k]!=null).map(k=>[$('[data-v="'+k+'"] b',objHost),$('[data-o="'+V[k]+'"]',objHost),"g"])));}
    const say=h=>{msg.innerHTML=h;msg.classList.remove("err");};
    function nw(v){const m=MODELS[mi++%MODELS.length],id=nid++;const old=V[v];O.push({id,model:m,speed:0});V[v]=id;log.push(v+' = new Car("'+m+'");');
      say("<code>new</code> allocates <b>Car #"+id+"</b> on the heap (fields start at their defaults, then the constructor sets <code>model</code>) and stores a <b>reference</b> in <code>"+v+"</code>."+(old&&!refs(old).length?" Car #"+old+" has no references left: it is now <b>unreachable</b>.":""));draw(id);}
    function as(t,f){const old=V[t];V[t]=V[f];log.push(t+" = "+f+";");
      say(V[f]==null?"<code>"+f+"</code> is null, so <code>"+t+"</code> becomes null too. No object is touched.":"Copies the <b>reference</b>, not the car: <code>"+t+"</code> and <code>"+f+"</code> now point to the same Car #"+V[f]+". No new object was created."+(old&&!refs(old).length?" Car #"+old+" is now unreachable.":""));draw();}
    function sp(v){log.push(v+".speed += 20;");
      if(V[v]==null){draw();msg.innerHTML='<b>NullPointerException</b>: Cannot read field "speed" because "'+v+'" is null (local names need <code>javac -g</code>; otherwise it says "&lt;local1&gt;"). A null reference points to no object, so there is no field to change.';msg.classList.add("err");shake($('[data-v="'+v+'"]',objHost));return;}
      const o=O.find(x=>x.id===V[v]);o.speed+=20;const r=refs(o.id);
      say("Changes Car #"+o.id+" through <code>"+v+"</code>."+(r.length>1?" Every alias sees it: "+r.map(x=>"<code>"+x+".speed</code>").join(", ")+" are all "+o.speed+".":""));draw();pulse($('[data-o="'+o.id+'"]',objHost));}
    function nl(v){const old=V[v];V[v]=null;log.push(v+" = null;");
      say("<code>"+v+"</code> no longer refers to anything. The object itself is not deleted"+(old&&!refs(old).length?"; Car #"+old+" has no references left, so it is <b>eligible for garbage collection</b>.":old?"; Car #"+old+" is still referenced by "+refs(old).map(C).join(", ")+".":"."));draw();}
    async function gc(){log.push("System.gc();");const dead=O.filter(o=>!refs(o.id).length);draw();
      if(!dead.length){say("Nothing to collect: every object is still reachable from a variable. (<code>System.gc()</code> is only a <i>request</i>; the JVM decides when to collect.)");return;}
      say("The collector starts from the <b>roots</b> (here, the stack variables), marks every object it can reach, and frees the rest: "+dead.map(o=>"Car #"+o.id).join(", ")+". You never free memory yourself in Java.");
      dead.forEach(o=>{const el=$('[data-o="'+o.id+'"]',objHost);if(el)el.classList.add("sweep");});await wait(650);O=O.filter(o=>refs(o.id).length);draw();}
    objHost.addEventListener("click",e=>{const b=e.target.closest("[data-c]");if(!b)return;const c=b.dataset.c;
      if(c==="r"){reset();say("Start again: three variables, all <code>null</code>, and an empty heap.");draw();return;}CMDS[+c][1]();});
    say("Three local variables, all <code>null</code>. Press <code>a = new Car(…)</code>, then try <code>c = a</code>, <code>c.speed += 20</code>, <code>a = null</code> and <code>System.gc()</code>.");draw();onResize(()=>draw());}

  /* 2. Initialisation order */
  const initHost=$("#olInit");
  if(initHost){
    const PL=['class Parent {','    static { print("P static"); }','    int a = log(1, "P field");','    { print("P instance block"); }','    Parent() {','        print("P constructor");','    }','}'];
    const CL=['class Child extends Parent {','    static { print("C static"); }','    String b = log("hi", "C field");','    { print("C instance block"); }','    Child() {','        super();','        print("C constructor");','    }','}'];
    initHost.innerHTML=head("Initialisation order","Watch every block of new Child() run, in the real order")+
      '<div class="vbody"><div class="ctrl" style="margin:0 0 14px"><button type="button" class="btn pri" data-a="play">▶ new Child()</button><button type="button" class="btn" data-a="step">Next step</button><button type="button" class="btn" data-a="reset">Reset</button><span class="count"></span></div>'+
      '<div class="ol-init"><div><h5>Parent.java</h5>'+codeBlock(PL,"ol-p")+'</div><div><h5>Child.java</h5>'+codeBlock(CL,"ol-c")+'</div>'+
      '<div class="ol-side"><h5>The object being built</h5><div class="ol-obj ol-build"><small>Child object</small><div class="pp">Parent part: a = <b>0</b></div><div class="cp">Child part: b = <b>null</b></div></div><h5>Console</h5><pre class="ol-con"></pre></div></div><div class="msg" aria-live="polite"></div></div>';
    const $i=s=>$(s,initHost),msg=$i(".msg"),P=player();
    let runs=0,steps=[],k=-1;
    const S=(pane,line,m,extra)=>Object.assign({pane,line,m},extra||{});
    function build(first){const s=[];
      s.push(S(null,null,first?"<code>new Child()</code>: before anything else the JVM must <b>initialise the classes</b>. Child extends Parent, so Parent is initialised first.":"<code>new Child()</code> again. Both classes are already initialised, so the <b>static blocks are skipped</b>."));
      if(first){s.push(S("p",1,"Parent's <b>static block</b> runs, once per class.",{out:"P static"}));s.push(S("c",1,"Then Child's static block. Statics never run again for this class.",{out:"C static"}));}
      else{s.push(S("p",1,"Skipped: Parent is already initialised.",{skip:1}));s.push(S("c",1,"Skipped: Child is already initialised.",{skip:1}));}
      s.push(S(null,null,"Memory for the <b>whole</b> object is allocated at once, and every field gets its default: <code>a = 0</code>, <code>b = null</code>.",{alloc:1}));
      s.push(S("c",4,"Now the constructor <code>Child()</code> is called…"));
      s.push(S("c",5,"…and its first statement is <code>super()</code> (if you don't write it, <code>javac</code> inserts it). Control jumps to Parent."));
      s.push(S("p",4,"<code>Parent()</code> starts. It first calls <code>Object()</code>; then <code>javac</code> has placed Parent's field initialisers and instance blocks here, in source order."));
      s.push(S("p",2,"Parent's <b>field initialiser</b>: <code>a</code> becomes 1.",{out:"P field",a:1}));
      s.push(S("p",3,"Parent's <b>instance block</b>.",{out:"P instance block"}));
      s.push(S("p",5,"The rest of Parent's constructor body. The <b>Parent part</b> of the object is now complete.",{out:"P constructor",pd:1}));
      s.push(S("c",2,"Back in <code>Child()</code>, right after <code>super()</code>: Child's field initialiser, <code>b = \"hi\"</code>.",{out:"C field",b:1}));
      s.push(S("c",3,"Child's instance block.",{out:"C instance block"}));
      s.push(S("c",6,"Finally the rest of Child's constructor body. The object is fully built and <code>new</code> returns its reference.",{out:"C constructor",cd:1}));
      return s;}
    function show(){const st=steps[k];
      $$(".ol-l",initHost).forEach(l=>l.classList.remove("cur","skip"));
      if(st&&st.pane){const l=$(".ol-code.ol-"+st.pane+' [data-i="'+st.line+'"]',initHost);l.classList.add(st.skip?"skip":"cur");}
      const done=steps.slice(0,k+1),has=f=>done.some(x=>x[f]);
      const bo=$i(".ol-build");bo.classList.toggle("on",has("alloc"));
      $(".pp b",bo).textContent=has("a")?"1":"0";$(".cp b",bo).textContent=has("b")?'"hi"':"null";
      $(".pp",bo).classList.toggle("done",has("pd"));$(".cp",bo).classList.toggle("done",has("cd"));
      $i(".ol-con").innerHTML=(initHost._prev||"")+done.filter(x=>x.out).map((x,i,a)=>'<span class="'+(x===st?"new":"")+'">'+esc(x.out)+"\n</span>").join("");
      msg.innerHTML=st?st.m:"Press <b>new Child()</b> to play, or <b>Next step</b> to go one block at a time.";
      $i(".count").textContent=steps.length?"step "+(k+1)+" / "+steps.length:"";
      if(st&&st.out)pulse($(".ol-con span.new",initHost));}
    function next(){if(k>=steps.length-1){if(steps.length){initHost._prev=($i(".ol-con").textContent||"")+"--- second object ---\n";}runs++;steps=build(runs===1);k=-1;}k++;show();return k<steps.length-1;}
    async function play(){const t=P.go();if(k>=steps.length-1)next();else{k++;show();}while(P.ok(t)&&k<steps.length-1){await wait(1300);if(!P.ok(t))return;k++;show();}}
    initHost.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
      if(a==="play")play();else if(a==="step"){P.stop();next();}else{P.stop();runs=0;steps=[];k=-1;initHost._prev="";show();}});
    show();}

  /* 3. Access modifiers */
  const accHost=$("#olAccess");
  if(accHost){
    const MODS=[["private","private"],["","(none)"],["protected","protected"],["public","public"]];
    const CELLS=[{id:"self",pkg:"com.bank",cls:"class Account",code:"this.balance",who:"the same class"},
      {id:"same",pkg:"com.bank",cls:"class Teller",code:"acc.balance",who:"another class in the same package"},
      {id:"sub",pkg:"com.app",cls:"class Savings extends Account",code:"this.balance",who:"a subclass in another package"},
      {id:"other",pkg:"com.app",cls:"class App",code:"acc.balance",who:"an unrelated class in another package"}];
    const ok=(m,c)=>c==="self"||(m!=="private"&&c==="same")||((m==="protected"||m==="public")&&c==="sub")||(m==="public");
    const err=m=>m==="private"?"error: balance has private access in Account":m===""?"error: balance is not public in Account; cannot be accessed from outside package":"error: balance has protected access in Account";
    let mod="private";
    accHost.innerHTML=head("Access modifier map","Pick a modifier for the field and see who can compile against it")+
      '<div class="vbody"><div class="ol-cmds">'+MODS.map(([m,l])=>'<button type="button" class="chip" data-m="'+m+'">'+l+"</button>").join("")+'</div>'+
      '<div class="ol-decl"></div><div class="ol-world"><span class="ol-zt">everyone else</span><div class="ol-pkgs">'+
      ["com.bank","com.app"].map(p=>'<div class="ol-pkg"><span class="ol-zt">package '+p+"</span>"+CELLS.filter(c=>c.pkg===p).map(c=>'<div class="ol-acc" data-k="'+c.id+'"><small>'+esc(c.cls)+"</small><code>"+esc(c.code)+'</code><span class="ol-res"></span></div>').join("")+"</div>").join("")+
      '</div></div><div class="msg" aria-live="polite"></div></div>';
    function draw(){$$("[data-m]",accHost).forEach(b=>b.classList.toggle("on",b.dataset.m===mod));
      $(".ol-decl",accHost).innerHTML=hl("package com.bank;  public class Account { "+(mod?mod+" ":"")+"long balance; }");
      let n=0;CELLS.forEach((c,i)=>{const el=$('[data-k="'+c.id+'"]',accHost),y=ok(mod,c.id);n+=y;
        el.classList.remove("yes","noo");void el.offsetWidth;el.style.animationDelay=(i*90)+"ms";el.classList.add(y?"yes":"noo");
        $(".ol-res",el).textContent=y?"✓ compiles":"✗ "+err(mod);});
      $(".msg",accHost).innerHTML="<b>"+(mod||"package-private (no keyword)")+"</b>: visible to "+n+" of 4. "+
        (mod==="private"?"Only code inside <code>Account</code> itself. This is the default choice for fields.":mod===""?"The whole package <code>com.bank</code>, but nothing outside it, not even subclasses.":mod==="protected"?"The package <b>plus</b> subclasses anywhere (through inheritance, <code>this.balance</code>). Note: <code>protected</code> is <i>wider</i> than no modifier.":"Everyone. Fine for constants and the methods that form your API; not for mutable fields.");}
    accHost.addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(b){mod=b.dataset.m;draw();}});draw();}

  /* 4. static vs instance */
  const stHost=$("#olStatic");
  if(stHost){
    let objs=[],created=0;
    stHost.innerHTML=head("static vs instance","One shared copy in the class, one copy per object")+
      '<div class="vbody"><div class="ol-cmds"><button type="button" class="btn pri" data-a="new">new Counter()</button><button type="button" class="chip" data-a="read">a.created</button><button type="button" class="chip" data-a="call">Counter.total()</button><button type="button" class="btn" data-a="reset">Reset</button></div>'+
      '<div class="ol-mem st"><svg class="ol-arw" aria-hidden="true"></svg><div class="ol-col"><h5>Heap · objects</h5><div class="ol-heap"></div></div><div class="ol-col"><h5>Class data (one per class)</h5><div class="ol-cls"><small>class Counter</small><div class="sf">static int created = <b>0</b></div><div class="mt">static int total()</div><div class="mt">Counter() { created++; id = created; }</div></div></div></div>'+
      '<div class="msg" aria-live="polite"></div></div>';
    const $s=s=>$(s,stHost),msg=$s(".msg");
    function draw(fresh){$s(".ol-heap").innerHTML=objs.map((o,i)=>'<div class="ol-obj'+(fresh===i?" pop":"")+'" data-o="'+i+'"><small>'+"abcdefgh"[i]+" → Counter object</small><div>final int id = <b>"+o+"</b></div></div>").join("")||'<div class="ol-empty">no objects yet: the static field already exists</div>';
      $(".sf b",stHost).textContent=created;
      requestAnimationFrame(()=>arrows($s(".ol-mem"),$s(".ol-arw"),objs.map((o,i)=>[$('[data-o="'+i+'"]',stHost),$s(".ol-cls"),"d"])));}
    stHost.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
      if(a==="new"){if(objs.length>=8){msg.innerHTML="That's enough objects to see the idea. Press Reset.";return;}created++;objs.push(created);draw(objs.length-1);pulse($(".sf",stHost));
        msg.innerHTML="The constructor runs <code>created++</code> on the <b>one shared</b> field, then copies the value into this object's <b>own</b> <code>id</code> field ("+created+"). Every object points back to the same class data.";}
      else if(a==="read"){if(!objs.length){msg.innerHTML="Create an object first: there is no <code>a</code> yet. (<code>Counter.created</code> works without any object.)";return;}
        pulse($(".sf",stHost));msg.innerHTML="<code>a.created</code> = <b>"+created+"</b>. It compiles, but it reads the <b>class's</b> field, not anything stored in <code>a</code>; the compiler only uses <code>a</code>'s type. Write <code>Counter.created</code>.";}
      else if(a==="call"){pulse($(".ol-cls .mt",stHost));msg.innerHTML="<code>Counter.total()</code> = <b>"+created+"</b>. A static method needs no object and has no <code>this</code>, so it can't read <code>id</code> (which object's id would it be?).";}
      else{objs=[];created=0;draw();msg.innerHTML="Reset. Note the static field exists (with value 0) as soon as the class is initialised, before any object.";}});
    msg.innerHTML="Press <b>new Counter()</b> a few times. Watch the one static field count up while each object keeps its own <code>id</code>.";draw();onResize(()=>draw());}

  /* 5. Fragile base class: counting HashSet, inheritance vs composition */
  const frHost=$("#olFragile");
  if(frHost){
    let mode="inh",steps=[],k=0;const P=player();
    const F=(n,cls)=>({n,cls});
    function build(){const s=[],st=[];let added=0,set=[];const push=(f,m,hot)=>{st.push(f);s.push({st:st.slice(),added,set:set.slice(),m,hot});},
      pop=(m)=>{st.pop();s.push({st:st.slice(),added,set:set.slice(),m});},snap=(m,hot)=>s.push({st:st.slice(),added,set:set.slice(),m,hot});
      push(F('main: s.addAll(List.of("a", "b", "c"))'),"<code>main</code> calls <code>addAll</code> with three elements.");
      if(mode==="inh"){
        push(F("CountingSet.addAll(c)","ours"),"Our override runs first.");added=3;snap("<code>added += c.size()</code>: the counter is <b>3</b>, which is correct so far.","n");
        push(F("AbstractCollection.addAll(c)","jdk"),"<code>super.addAll(c)</code>: HashSet inherits <code>addAll</code> from <code>AbstractCollection</code>, which loops and calls <code>add(e)</code> for each element.");
        for(const x of ["a","b","c"]){push(F('CountingSet.add("'+x+'")',"ours ol-bad"),"<code>add(\""+x+"\")</code> is a virtual call on <i>this</i> object, a CountingSet, so <b>our</b> <code>add</code> runs (dynamic dispatch)…");
          added++;snap("…and counts the element <b>again</b>: added = "+added+".","n");push(F('HashSet.add("'+x+'")',"jdk"),"<code>super.add</code> really stores it.");set.push(x);snap("\""+x+"\" is in the set.");st.pop();st.pop();snap("Both frames return.");}
        pop("The loop is done.");pop("Our <code>addAll</code> returns.");pop("Result: the set has <b>3</b> elements but <code>added</code> is <b>6</b>. The subclass broke because of a detail of HashSet it could not see: the <b>fragile base class</b> problem.");}
      else{
        push(F("CountingSet2.addAll(c)","ours"),"The wrapper's own method.");added=3;snap("<code>added += c.size()</code>: <b>3</b>.","n");
        push(F("AbstractCollection.addAll(c)","jdk"),"<code>inner.addAll(c)</code>: the plain HashSet in the field loops and calls <code>add</code>…");
        for(const x of ["a","b","c"]){push(F('HashSet.add("'+x+'")',"jdk"),"…on <b>itself</b>. <code>inner</code> is a plain HashSet, so its own <code>add</code> runs; nothing of ours is involved.");set.push(x);snap("\""+x+"\" stored. The counter is untouched.");st.pop();snap("Returns.");}
        pop("The loop is done.");pop("Result: 3 elements and <code>added</code> = <b>3</b>. Composition depends only on the public <code>Set</code> contract, never on how HashSet implements it.");}
      return s;}
    frHost.innerHTML=head("Fragile base class","Why a counting HashSet counts 6 instead of 3")+
      '<div class="seg"><button type="button" data-m="inh" class="on">extends HashSet (inheritance)</button><button type="button" data-m="cmp">wraps a Set (composition)</button></div>'+
      '<div class="vbody"><div class="ol-fr"><div><h5>Call stack (top = running)</h5><div class="ol-stack"></div></div><div class="ol-frr"><h5>added</h5><div class="ol-big">0</div><h5>Set contents</h5><div class="ol-set"></div><div class="ol-legend"><i class="ours"></i> our code <i class="jdk"></i> JDK code</div></div></div>'+
      '<div class="ctrl"><button type="button" class="btn" data-a="prev">◀ Back</button><button type="button" class="btn pri" data-a="play">▶ Play</button><button type="button" class="btn" data-a="next">Next ▶</button><span class="count"></span></div><div class="msg" aria-live="polite"></div></div>';
    const $f=s=>$(s,frHost);
    function draw(){const s=steps[k];
      $f(".ol-stack").innerHTML=s.st.slice().reverse().map((f,i)=>'<div class="ol-fr-f '+(f.cls||"")+(i===0?" top":"")+'">'+esc(f.n)+"</div>").join("");
      const big=$f(".ol-big");if(big.textContent!==String(s.added)){big.textContent=s.added;pulse(big);}big.classList.toggle("ol-bad",mode==="inh"&&s.added>3);
      $f(".ol-set").innerHTML=s.set.map(x=>'<span>"'+x+'"</span>').join("")||'<em>empty</em>';
      $f(".msg").innerHTML=s.m;$f(".count").textContent="step "+(k+1)+" / "+steps.length;
      $('[data-a="prev"]',frHost).disabled=k===0;$('[data-a="next"]',frHost).disabled=k===steps.length-1;}
    const load=()=>{steps=build();k=0;draw();};
    frHost.addEventListener("click",async e=>{const m=e.target.closest("[data-m]");if(m){P.stop();mode=m.dataset.m;$$(".seg button",frHost).forEach(b=>b.classList.toggle("on",b===m));load();return;}
      const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
      if(a==="next"&&k<steps.length-1){P.stop();k++;draw();}else if(a==="prev"&&k>0){P.stop();k--;draw();}
      else if(a==="play"){const t=P.go();if(k===steps.length-1){k=0;draw();}while(P.ok(t)&&k<steps.length-1){await wait(1100);if(!P.ok(t))return;k++;draw();}}});
    load();}

  /* 6. Dispatch simulator: compile-time check on the declared type, run-time lookup from the object's class */
  const dHost=$("#olDispatch");
  if(dHost){
    const CL={Object:{p:null,m:{"toString()":'"Puppy@1b6d3586"-style text',"hashCode()":"an identity number"}},
      Animal:{p:"Object",m:{"name":'"animal"',"kind()":'"Animal.kind"',"sound()":'"..."',"move()":'"walks"'}},
      Dog:{p:"Animal",m:{"name":'"dog"',"kind()":'"Dog.kind"',"sound()":'"Woof"',"fetch()":'"fetches"'}},
      Cat:{p:"Animal",m:{"sound()":'"Meow"'}},
      Puppy:{p:"Dog",m:{"move()":'"tumbles"'}}};
    const FIELD=new Set(["name"]),STATIC=new Set(["kind()"]);
    const up=c=>{const r=[];for(let x=c;x;x=CL[x].p)r.push(x);return r;};
    const isSub=(c,d)=>up(c).includes(d);
    const CALLS=["sound()","move()","fetch()","toString()","name","kind()","((Dog) x).fetch()"];
    let decl="Animal",rt="Puppy",call="sound()";const P=player();
    const card=n=>'<div class="ol-cls dz" data-c="'+n+'"><small>'+(n==="Object"?"class Object":"class "+n+(CL[n].p&&CL[n].p!=="Object"?" extends "+CL[n].p:""))+'</small><span class="tagd">declared type</span><span class="tagr">object’s class</span>'+
      Object.keys(CL[n].m).map(m=>'<div class="mt'+(FIELD.has(m)?" fld":STATIC.has(m)?" sta":"")+'" data-m="'+m+'">'+(FIELD.has(m)?"field "+m:STATIC.has(m)?"static "+m:m)+"</div>").join("")+"</div>";
    const sel=(id,opts,v)=>'<label>'+id+' <select data-s="'+id+'">'+opts.map(o=>'<option'+(o===v?" selected":"")+">"+o+"</option>").join("")+"</select></label>";
    dHost.innerHTML=head("Dispatch simulator","Who decides which code runs: the variable's type or the object's class?")+
      '<div class="vbody"><div class="ol-dsel"><code class="ol-stmt"></code>'+sel("Declared type",["Object","Animal","Dog","Puppy"],decl)+sel("Object",["Animal","Dog","Puppy","Cat"],rt)+sel("Call",CALLS,call)+'<button type="button" class="btn pri" data-a="run">▶ Run</button></div>'+
      '<div class="ol-tree"><div class="r1">'+card("Object")+'</div><div class="ol-ext">▲ extends</div><div class="r1">'+card("Animal")+'</div><div class="ol-ext">▲ extends</div><div class="r2">'+card("Dog")+card("Cat")+'</div><div class="ol-ext l">▲ extends</div><div class="r2">'+card("Puppy")+'<div></div></div></div>'+
      '<div class="ol-phases"><div class="ol-ph" data-p="1"><b>1 · Compile time (javac)</b><div></div></div><div class="ol-ph" data-p="2"><b>2 · Run time (JVM)</b><div></div></div><div class="ol-ph out" data-p="3"><b>Result</b><div></div></div></div></div>';
    const $d=s=>$(s,dHost);
    const expr=()=>call.startsWith("((")?call:"x."+call;
    function frame(){$$(".dz",dHost).forEach(c=>{c.classList.toggle("decl",c.dataset.c===decl);c.classList.toggle("rt",c.dataset.c===rt);});
      $d(".ol-stmt").innerHTML=hl(decl+" x = new "+rt+"();  "+expr()+";");}
    const clear=()=>{$$(".dz .mt",dHost).forEach(m=>m.classList.remove("look","hit","miss"));$$(".dz",dHost).forEach(c=>c.classList.remove("scan"));$$(".ol-ph",dHost).forEach(p=>{p.classList.remove("on","ol-bad","ol-ok");$("div",p).innerHTML="";});};
    const ph=(n,h,cls)=>{const p=$('.ol-ph[data-p="'+n+'"]',dHost);p.classList.add("on");if(cls)p.classList.add(cls);$("div",p).innerHTML+=h;};
    const mEl=(c,m)=>$('.dz[data-c="'+c+'"] [data-m="'+m+'"]',dHost);
    async function walk(t,from,m,phase){/* search from class `from` upward; returns the class that declares m */
      for(const c of up(from)){if(!P.ok(t))return null;const cd=$('.dz[data-c="'+c+'"]',dHost);cd.classList.add("scan");
        const el=mEl(c,m);ph(phase,'<div class="st">'+c+": "+(el?"<b>has "+esc(m)+"</b> ✓":"no "+esc(m)+", go up to "+(CL[c].p||"—"))+"</div>");
        if(el){el.classList.add(phase===1?"look":"hit");await wait(700);return c;}await wait(700);cd.classList.remove("scan");}
      return null;}
    async function run(){const t=P.go();clear();frame();
      if(!isSub(rt,decl)){ph(1,'<div class="st"><code>'+decl+" x = new "+rt+"()</code>: a "+rt+" is not a "+decl+".</div>","ol-bad");
        ph(3,'<span class="e">error: incompatible types: '+rt+" cannot be converted to "+decl+"</span>","ol-bad");shake($d(".ol-stmt"));return;}
      ph(1,'<div class="st">javac knows only the <b>declared</b> type of <code>x</code>: '+decl+".</div>");await wait(600);
      let m=call,castTo=null;if(call.startsWith("((")){castTo="Dog";m="fetch()";
        if(!isSub("Dog",decl)&&!isSub(decl,"Dog")){ph(3,'<span class="e">error: incompatible types</span>',"ol-bad");return;}
        ph(1,'<div class="st">The cast <code>(Dog) x</code> makes the expression\'s type Dog, so javac looks in Dog.</div>');await wait(600);}
      const ct=castTo||decl,found=await walk(t,ct,m,1);if(!P.ok(t))return;
      if(!found){ph(1,'<div class="st">Nothing in '+up(ct).join(" → ")+".</div>","ol-bad");ph(3,'<span class="e">error: cannot find symbol: '+(FIELD.has(m)?"variable ":"method ")+esc(m.replace("()",""))+"</span><br><span class=\"small\">The object really is a "+rt+", but javac only trusts the declared type. Cast it (after an <code>instanceof</code> check) to reach it.</span>","ol-bad");return;}
      ph(1,'<div class="st ol-ok">Found in <b>'+found+"</b>: "+(FIELD.has(m)?"field access bound now":STATIC.has(m)?"<code>invokestatic "+found+"."+m+"</code>, bound now":"emits <code>invokevirtual "+found+"."+m+"</code>")+".</div>");await wait(700);if(!P.ok(t))return;
      if(castTo){if(!isSub(rt,"Dog")){ph(2,'<div class="st">checkcast Dog: the object is a '+rt+", which is not a Dog.</div>","ol-bad");
          ph(3,'<span class="e">ClassCastException: class '+rt+" cannot be cast to class Dog</span><br><span class=\"small\">It compiled, but the cast is checked at run time. Guard it: <code>if (x instanceof Dog d) d.fetch();</code></span>","ol-bad");return;}
        ph(2,'<div class="st">checkcast Dog: the object is a '+rt+", so the cast succeeds.</div>");await wait(600);}
      if(FIELD.has(m)||STATIC.has(m)){mEl(found,m).classList.add("hit");
        ph(2,'<div class="st">No lookup at run time. '+(FIELD.has(m)?"Fields are":"Static methods are")+" <b>not polymorphic</b>: the declared type picked "+found+"’s, even though the object is a "+rt+".</div>","ol-ok");
        ph(3,"<code>"+esc(expr())+"</code> → <b>"+esc(CL[found].m[m])+"</b>","ol-ok");pulse($('.ol-ph[data-p="3"]',dHost));return;}
      ph(2,'<div class="st">The JVM follows the object’s klass pointer to <b>'+rt+"</b> and searches upward for the most specific override of "+esc(m)+".</div>");await wait(600);
      const impl=await walk(t,rt,m,2);if(!P.ok(t)||!impl)return;
      ph(2,'<div class="st ol-ok">Runs <b>'+impl+"."+esc(m)+"</b>"+(impl!==found?" (javac had bound "+found+"."+esc(m)+"; the object’s class overrides it)":"")+".</div>","ol-ok");
      const out=impl==="Object"&&m==="toString()"?'"'+rt+'@6d06d69c" (class name @ identity hash in hex)':CL[impl].m[m];
      ph(3,"<code>"+esc(expr())+"</code> → <b>"+esc(out)+"</b>","ol-ok");pulse($('.ol-ph[data-p="3"]',dHost));}
    dHost.addEventListener("change",e=>{const s=e.target.closest("[data-s]");if(!s)return;const v=s.value,id=s.dataset.s;
      if(id==="Declared type")decl=v;else if(id==="Object")rt=v;else call=v;P.stop();clear();frame();run();});
    dHost.addEventListener("click",e=>{if(e.target.closest('[data-a="run"]'))run();});
    frame();let started=false;
    const io=new IntersectionObserver(es=>{if(es[0].isIntersecting&&!started){started=true;run();io.disconnect();}},{threshold:.3});io.observe(dHost);}

  /* 7. Default-method conflict resolver */
  const dmHost=$("#olDiamond");
  if(dmHost){
    let st={A:"default",B:"default",ext:false,base:false,ovr:false};
    const opt=(k,l)=>'<label class="ol-tog">'+l+' <select data-k="'+k+'"><option value="none">no tag()</option><option value="abstract">String tag();</option><option value="default">default tag()</option></select></label>';
    const chk=(k,l)=>'<label class="ol-tog"><input type="checkbox" data-k="'+k+'"> '+l+"</label>";
    dmHost.innerHTML=head("Default-method resolver","Two interfaces, one method name: which one wins?")+
      '<div class="vbody"><div class="ol-cmds">'+opt("A","interface A:")+opt("B","interface B:")+chk("ext","B extends A")+chk("base","class Base has public tag()")+chk("ovr","C overrides tag()")+'</div>'+
      '<div class="ol-dm"><div class="ol-dmsrc"></div><div><div class="ol-dmg"><div class="b" data-n="A">A</div><div class="b" data-n="B">B</div><div class="b cls" data-n="Base">Base</div><div class="b cls c" data-n="C">C</div></div><div class="ol-ph on" data-p="r"><b>new C().tag()</b><div></div></div></div></div><div class="msg"></div></div>';
    $$("select",dmHost).forEach(s=>s.value=st[s.dataset.k]);
    function solve(){const {A,B,ext,base,ovr}=st;
      if(ovr&&A==="none"&&B==="none"&&!base)return {ok:0,err:"error: method does not override or implement a method from a supertype",rule:"<code>@Override</code> needs a supertype method to override, and neither A, B nor a base class declares <code>tag()</code>. Remove <code>@Override</code> or declare <code>tag()</code> in a supertype."};
      if(ovr)return {ok:1,win:"C",out:'"C"',rule:"The class's own method always wins. Inside it you may still call <code>A.super.tag()</code> or <code>B.super.tag()</code>."};
      if(base)return {ok:1,win:"Base",out:'"Base"',rule:"<b>Rule 1, class wins:</b> a method inherited from a superclass beats any interface default (and also implements an abstract <code>tag()</code>)."};
      const cand=[];if(A!=="none"&&!(ext&&B!=="none"))cand.push("A");if(B!=="none")cand.push("B");
      const shadow=ext&&A!=="none"&&B!=="none";
      if(!cand.length)return {ok:0,err:"error: cannot find symbol: method tag()",rule:"Nobody declares <code>tag()</code>, so <code>C</code> has no such method."};
      const ab=cand.find(x=>st[x]==="abstract");
      if(ab)return {ok:0,err:"error: C is not abstract and does not override abstract method tag() in "+ab,rule:(shadow&&ab==="B"?"<b>Rule 2:</b> B extends A, so B's abstract <code>tag()</code> re-declares (hides) A's default. ":"")+"An abstract method needs an implementation: C must override <code>tag()</code> (or be abstract)."};
      if(cand.length===2)return {ok:0,err:"error: types A and B are incompatible;\n  class C inherits unrelated defaults for tag() from types A and B",rule:"<b>Rule 3:</b> two unrelated defaults with the same signature are ambiguous. C must override <code>tag()</code> and can pick one with <code>A.super.tag()</code>."};
      const w=cand[0];return {ok:1,win:w,out:'"'+w+'"',rule:shadow?"<b>Rule 2, most specific interface wins:</b> B extends A, so B's default overrides A's.":"Only one default is visible, so C simply inherits it."};}
    function draw(){const {A,B,ext,base,ovr}=st,L=[];
      L.push("interface A {"+(A==="none"?"":A==="abstract"?" String tag();":' default String tag() { return "A"; }')+" }");
      L.push("interface B"+(ext?" extends A":"")+" {"+(B==="none"?"":B==="abstract"?" String tag();":' default String tag() { return "B"; }')+" }");
      if(base)L.push('class Base { public String tag() { return "Base"; } }');
      L.push("class C "+(base?"extends Base ":"")+"implements A, B {");if(ovr)L.push('    @Override public String tag() { return "C"; }');L.push("}");
      $(".ol-dmsrc",dmHost).innerHTML=codeBlock(L);
      const r=solve();$$(".ol-dmg .b",dmHost).forEach(b=>{const n=b.dataset.n;b.classList.toggle("off",n==="Base"&&!base);b.classList.toggle("win",r.ok&&r.win===n);
        b.classList.toggle("ol-bad",!r.ok&&(n==="C"));b.dataset.s=n==="A"?A:n==="B"?B:"";});
      $(".ol-dmg",dmHost).classList.toggle("ext",ext);
      const p=$('.ol-ph[data-p="r"]',dmHost);p.classList.toggle("ol-ok",!!r.ok);p.classList.toggle("ol-bad",!r.ok);
      $("div",p).innerHTML=r.ok?"→ <b>"+r.out+"</b>":'<span class="e">'+esc(r.err).replace(/\n/g,"<br>")+"</span>";
      $(".msg",dmHost).innerHTML=r.rule;pulse(p);}
    dmHost.addEventListener("change",e=>{const el=e.target.closest("[data-k]");if(!el)return;st[el.dataset.k]=el.type==="checkbox"?el.checked:el.value;draw();});draw();}

  /* 8. HashSet buckets: why equals needs hashCode */
  const hHost=$("#olHash");
  if(hHost){
    const N=16;let eqO=true,hcO=false,items=[],nid=1;
    const idHash=()=>(Math.random()*0x7fffffff)|0;
    const contentHash=(x,y)=>31*(31+x)+y;               /* Objects.hash(x, y) */
    const spread=h=>(h^(h>>>16))&(N-1);                  /* HashMap.hash(), then index = hash & (n - 1) */
    const mkP=(x,y)=>({id:nid++,x,y,ih:idHash()});
    const H=p=>hcO?contentHash(p.x,p.y):p.ih,EQ=(p,q)=>eqO?p.x===q.x&&p.y===q.y:p===q;
    hHost.innerHTML=head("HashSet buckets","See where each Point lands, and why contains() can miss")+
      '<div class="vbody"><div class="ol-cmds"><label class="ol-tog"><input type="checkbox" data-k="eq" checked> override <code>equals</code></label><label class="ol-tog"><input type="checkbox" data-k="hc"> override <code>hashCode</code></label></div>'+
      '<div class="ol-cmds"><span class="ol-pt">new Point(<input type="number" data-p="x" value="1" min="0" max="99">, <input type="number" data-p="y" value="2" min="0" max="99">)</span><button type="button" class="btn pri" data-a="add">set.add(…)</button><button type="button" class="btn" data-a="has">set.contains(…)</button><button type="button" class="btn" data-a="reset">Clear</button></div>'+
      '<div class="ol-calc"></div><div class="ol-buckets">'+Array.from({length:N},(_,i)=>'<div class="ol-bk" data-b="'+i+'"><span>'+i+"</span><div></div></div>").join("")+'</div><div class="ol-size"></div><div class="msg" aria-live="polite"></div></div>';
    const $h=s=>$(s,hHost),msg=$h(".msg");const P=player();
    const val=k=>Math.max(0,Math.min(99,parseInt($('[data-p="'+k+'"]',hHost).value,10)||0));
    function draw(hot){$$(".ol-bk",hHost).forEach(b=>{const i=+b.dataset.b;$("div",b).innerHTML=items.filter(p=>spread(H(p))===i).map(p=>'<i class="'+(hot&&hot.includes(p.id)?"hot":"")+'">('+p.x+","+p.y+")<small>#"+p.id+"</small></i>").join("");});
      $h(".ol-size").innerHTML="set.size() = <b>"+items.length+"</b>";}
    async function op(add){const t=P.go(),q=mkP(val("x"),val("y")),h=H(q),b=spread(h);$$(".ol-bk",hHost).forEach(x=>x.classList.remove("aim","miss"));
      $h(".ol-calc").innerHTML="<code>new Point("+q.x+", "+q.y+")</code> → hashCode() = <b>"+h+"</b> "+(hcO?"(Objects.hash(x, y): from the <b>fields</b>)":"(identity hash: <b>different for every object</b>)")+" → bucket <b>"+b+"</b> = (h ^ h&gt;&gt;&gt;16) &amp; 15";
      const bk=$('[data-b="'+b+'"]',hHost);bk.classList.add("aim");await wait(650);if(!P.ok(t))return;
      const inB=items.filter(p=>spread(H(p))===b);let found=null;
      for(const p of inB){draw([p.id]);await wait(500);if(!P.ok(t))return;if(H(p)===h&&EQ(p,q)){found=p;break;}}
      const other=items.filter(p=>p.x===q.x&&p.y===q.y&&p!==found&&H(p)!==h);
      if(add){if(found){msg.innerHTML="Bucket "+b+" already holds an equal Point (#"+found.id+"): hashes match and <code>equals</code> is true, so <code>add</code> returns <b>false</b> and nothing is added. This is how a set stays duplicate-free.";draw([found.id]);}
        else{items.push(q);draw([q.id]);msg.innerHTML="<code>add</code> returns <b>true</b>: Point #"+q.id+" stored in bucket "+b+"."+(other.length?" <b>But an equal Point is already in the set</b> (bucket "+other.map(p=>spread(H(p))).join(", ")+"): the set now holds a <b>duplicate</b>, because the two objects have different hash codes.":inB.length&&!eqO?" A Point with the same fields is in this bucket, but without an <code>equals</code> override two objects are equal only if they are the same object.":"");}}
      else{if(found){msg.innerHTML="<code>contains</code> → <b>true</b>. Same hash → same bucket → <code>equals</code> confirms the match.";draw([found.id]);}
        else{bk.classList.add("miss");msg.innerHTML="<code>contains</code> → <b>false</b>."+(other.length?" An equal Point exists (bucket "+other.map(p=>spread(H(p))).join(", ")+"), but its hash code is different. The set compares hashes first and looked only in bucket "+b+", so <code>equals</code> never got a chance to say yes. <b>Equal objects must have equal hash codes.</b>":inB.length?" The bucket had candidates, but <code>equals</code> said no"+(eqO?".":": without an override, <code>equals</code> means <code>==</code>, and this is a new object."):" Nothing equal is in the set.");}}}
    hHost.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
      if(a==="reset"){P.stop();items=[];draw();$h(".ol-calc").innerHTML="";msg.innerHTML="Empty set.";}else op(a==="add");});
    hHost.addEventListener("change",e=>{const c=e.target.closest("[data-k]");if(!c)return;if(c.dataset.k==="eq")eqO=c.checked;else hcO=c.checked;P.stop();items=[];nid=1;draw();$h(".ol-calc").innerHTML="";
      msg.innerHTML="The class changed, so the set was cleared. "+(eqO&&hcO?"Both overridden: the correct pair. Add (1, 2) twice, then try <code>contains</code>.":eqO?"Only <code>equals</code>: add (1, 2), then <code>contains</code> (1, 2), and watch it look in the wrong bucket.":hcO?"Only <code>hashCode</code>: equal Points land in the same bucket, but <code>equals</code> is still identity.":"Neither: every object is unique, even with the same fields.");});
    msg.innerHTML="Right now <code>Point</code> overrides <code>equals</code> but <b>not</b> <code>hashCode</code>. Press <b>set.add</b> with (1, 2), then <b>set.contains</b> with (1, 2).";draw();}

  /* 9. Sealed hierarchy + exhaustive switch checker */
  const sHost=$("#olSealed");
  if(sHost){
    const T=["Circle","Square","Rect","Triangle"];
    let st={sealed:true,tri:false,cases:{Circle:true,Square:true,Rect:false,Triangle:false},def:false};
    sHost.innerHTML=head("Exhaustive switch checker","Can javac prove the switch covers every Shape?")+
      '<div class="vbody"><div class="ol-cmds"><label class="ol-tog"><input type="checkbox" data-k="sealed" checked> <code>sealed</code> interface</label><label class="ol-tog"><input type="checkbox" data-k="tri"> add <code>record Triangle</code></label></div>'+
      '<div class="ol-cmds"><span class="small muted">cases:</span>'+T.map(t=>'<button type="button" class="chip" data-c="'+t+'">case '+t+"</button>").join("")+'<button type="button" class="chip" data-c="def">default</button></div>'+
      '<div class="ol-dm"><div class="ol-dmsrc"></div><div><div class="ol-sh"></div><div class="ol-ph on" data-p="r"><b>javac</b><div></div></div></div></div><div class="msg"></div></div>';
    function draw(){const types=T.filter(t=>t!=="Triangle"||st.tri),cs=types.filter(t=>st.cases[t]);
      $$("[data-c]",sHost).forEach(b=>{const c=b.dataset.c;b.classList.toggle("on",c==="def"?st.def:!!st.cases[c]);b.disabled=c==="Triangle"&&!st.tri;});
      const L=[(st.sealed?"sealed ":"")+"interface Shape"+(st.sealed?" permits "+types.join(", "):"")+" {}"];
      types.forEach(t=>L.push("record "+t+"(…) implements Shape {}"));
      L.push("","static String name(Shape s) {","    return switch (s) {");cs.forEach(t=>L.push("        case "+t+" x -> \""+t.toLowerCase()+"\";"));if(st.def)L.push('        default -> "other";');L.push("    };","}");
      $(".ol-dmsrc",sHost).innerHTML=codeBlock(L);
      const missing=types.filter(t=>!st.cases[t]),ok=st.def||(st.sealed&&!missing.length);
      $(".ol-sh",sHost).innerHTML='<div class="ol-shr">Shape'+(st.sealed?" <small>sealed</small>":" <small>open: anyone may implement it</small>")+"</div>"+'<div class="ol-shk">'+types.map(t=>'<span class="'+(st.cases[t]?"cov":st.def?"defc":"mis")+'">'+t+"</span>").join("")+(st.sealed?"":'<span class="unk">? unknown classes</span>')+"</div>";
      const p=$('.ol-ph[data-p="r"]',sHost);p.classList.toggle("ol-ok",ok);p.classList.toggle("ol-bad",!ok);
      $("div",p).innerHTML=ok?"✓ compiles":'<span class="e">error: the switch expression does not cover all possible input values</span>';
      $(".msg",sHost).innerHTML=ok?(st.def?(st.sealed&&!missing.length?"Compiles, but the <code>default</code> is now dead weight, and worse: it hides the error you would get when someone adds a new Shape. With a sealed type, prefer no <code>default</code>.":"The <code>default</code> catches everything else, so it compiles. But the compiler can no longer warn you about a forgotten case."):"Every permitted subtype has a case, and the type is sealed, so javac <b>knows</b> the list is complete. No <code>default</code> needed."):
        !st.sealed?"Shape is not sealed, so any class anywhere could implement it. javac can't prove the cases are complete, however many you write: you need a <code>default</code>.":
        "Missing: "+missing.map(C).join(", ")+"."+(st.tri&&missing.includes("Triangle")?" This is the point of sealed types: <b>adding</b> Triangle broke every switch that doesn't handle it, at compile time, exactly where code must change.":"");pulse(p);}
    sHost.addEventListener("click",e=>{const b=e.target.closest("[data-c]");if(!b||b.disabled)return;const c=b.dataset.c;if(c==="def")st.def=!st.def;else st.cases[c]=!st.cases[c];draw();});
    sHost.addEventListener("change",e=>{const c=e.target.closest("[data-k]");if(!c)return;st[c.dataset.k]=c.checked;if(c.dataset.k==="tri"&&!c.checked)st.cases.Triangle=false;draw();});draw();}

  /* 10. Record expander: the class javac writes for a record header */
  const rHost=$("#olRecord");
  if(rHost){
    rHost.innerHTML=head("Record expander","Type a record header and see the class the compiler generates")+
      '<div class="vbody"><div class="vin"><input class="ol-rin" value="record Money(String currency, long paise)" spellcheck="false" aria-label="Record header" style="width:min(100%,460px)"></div><div class="ol-rout"></div><div class="msg"></div></div>';
    const inp=$(".ol-rin",rHost);
    function draw(){const m=inp.value.trim().match(/^(?:public\s+)?record\s+([A-Z]\w*)\s*\(([^)]*)\)\s*(?:\{\s*\}?)?;?$/);
      if(!m){$(".ol-rout",rHost).innerHTML="";$(".msg",rHost).innerHTML="Write it as <code>record Name(Type a, Type b)</code>, e.g. <code>record Point(int x, int y)</code>.";return;}
      const n=m[1],comps=m[2].trim()?m[2].split(",").map(s=>s.trim().split(/\s+/)).filter(p=>p.length===2):[];
      if(m[2].trim()&&comps.length!==m[2].split(",").length){$(".msg",rHost).innerHTML="Each component needs a type and a name: <code>int x</code>.";return;}
      const prim=t=>/^(int|long|short|byte|char|boolean|float|double)$/.test(t);
      const eqOf=([t,v])=>prim(t)?(t==="double"||t==="float"?(t==="double"?"Double":"Float")+".compare("+v+", r."+v+") == 0":v+" == r."+v):"Objects.equals("+v+", r."+v+")";
      const pub=/^public\s/.test(inp.value.trim())?"public ":"";
      const L=[pub+"final class "+n+" extends java.lang.Record {   // final: no subclasses"];
      comps.forEach(([t,v])=>L.push("    private final "+t+" "+v+";"));
      L.push("","    "+pub+n+"("+comps.map(c=>c.join(" ")).join(", ")+") {   // canonical constructor: same access as the record");comps.forEach(([,v])=>L.push("        this."+v+" = "+v+";"));L.push("    }","");
      comps.forEach(([t,v])=>L.push("    public "+t+" "+v+"() { return "+v+"; }   // accessor: no \"get\""));
      L.push("","    @Override public boolean equals(Object o) {","        return o instanceof "+n+" r"+(comps.length?" && "+comps.map(eqOf).join(" && "):"")+";","    }",
        "    @Override public int hashCode() {","        return "+(comps.length?"Objects.hash("+comps.map(c=>c[1]).join(", ")+");   // in spirit; the exact formula is unspecified":"0;")+"","    }",
        "    @Override public String toString() {","        return \""+n+"["+comps.map(([,v])=>v+"=\" + "+v+" + \"").join(", ")+"]\";","    }","}");
      $(".ol-rout",rHost).innerHTML=codeBlock(L.map(l=>l.replace(/\+ ""\]"/,'+ "]"')));
      $(".msg",rHost).innerHTML="One line became "+L.length+" lines. "+(comps.some(([t])=>/^(List|Map|Set|ArrayList|Date|.*\[\])/.test(t))?"<b>Careful:</b> a component like <code>"+esc(comps.find(([t])=>/^(List|Map|Set|ArrayList|Date|.*\[\])/.test(t))[0])+"</code> is mutable; the field is final but its contents are not. Copy it in a compact constructor (<code>List.copyOf</code>).":"The real <code>equals</code>, <code>hashCode</code> and <code>toString</code> are generated through <code>invokedynamic</code> (<code>ObjectMethods</code>), but they behave like this: every component, in declaration order.");}
    inp.addEventListener("input",draw);draw();}
})();

/* OOP car story (v25): the memorable analogy for Lesson 05. #olFactory (P1): the class is a blueprint, `new` is the factory,
   each object is a real car with its own paint and speed, a variable is a key. #olStory (P10): the same car explains the four
   pillars (locked hood, vehicle family, different horns, the dashboard). Cars are small inline SVGs (carSvg); only the small
   wheel groups and the svg itself move. Horns use Web Audio only after a click and only when the site sound is on (js1-sound). */
(function(){
  const fHost=$("#olFactory"),sHost=$("#olStory");
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait=ms=>new Promise(r=>setTimeout(r,still?Math.min(ms,40):ms));
  /* kind: car | truck | ev | chassis; blue: blueprint line drawing */
  function carSvg(color,kind,blue){kind=kind||"car";
    const wheel=(x)=>'<g class="olf-wh" transform="translate('+x+' 60)"><g class="olf-wr"><circle r="12" class="olf-tyre"/><circle r="6" class="olf-rim"/><path d="M0-6V6M-6 0H6" class="olf-spk"/></g></g>';
    let body="";
    if(kind==="truck")body='<path class="olf-body" d="M10 58V30Q10 26 14 26H92V58Z"/><path class="olf-body olf-cab" d="M92 58V22Q92 18 96 18H124Q130 18 134 24L148 40Q152 44 152 50V56Q152 60 148 60H92Z"/><path class="olf-win" d="M100 24H124L138 40H100Z"/><rect x="14" y="30" width="74" height="24" rx="2" class="olf-load"/><circle cx="148" cy="48" r="3" class="olf-hl"/>';
    else if(kind==="chassis")body='<rect x="14" y="48" width="134" height="8" rx="4" class="olf-body"/><path class="olf-win" d="M60 48V40H100V48"/>';
    else body='<path class="olf-body" d="M12 52Q12 40 26 38L48 36L64 20Q68 16 76 16H108Q116 16 122 22L136 36Q150 38 152 48V56Q152 60 148 60H16Q12 60 12 56Z"/><path class="olf-win" d="M70 22H106Q112 22 116 27L126 36H58Z"/><path class="olf-line" d="M92 22V36M92 38V58"/><path class="olf-shine" d="M22 44Q60 40 146 44"/><circle cx="148" cy="47" r="3" class="olf-hl"/><rect x="12" y="44" width="4" height="6" rx="1" class="olf-tail"/>'+
      (kind==="ev"?'<path class="olf-bolt" d="M80 40L72 50H79L76 58L86 47H79L82 40Z"/>':"");
    return '<svg class="olf-car'+(blue?" olf-blue":"")+'" viewBox="0 0 164 80" style="--paint:'+(color||"#3b82f6")+'" aria-hidden="true"><ellipse cx="82" cy="73" rx="64" ry="4" class="olf-shadow"/>'+body+wheel(kind==="truck"?36:40)+(kind==="truck"?wheel(68):"")+wheel(kind==="truck"?128:124)+"</svg>";}
  /* tiny horns (no files): car beep-beep, truck low horn, EV chime */
  let ac=null;
  function horn(kind){if(store.get("js1-sound")==="0")return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
    const t0=ac.currentTime,tone=(f,f2,type,s,d,v)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t0+s);if(f2)o.frequency.linearRampToValueAtTime(f2,t0+s+d);
      g.gain.setValueAtTime(0,t0+s);g.gain.linearRampToValueAtTime(v,t0+s+.02);g.gain.setValueAtTime(v,t0+s+d-.04);g.gain.linearRampToValueAtTime(0,t0+s+d);o.connect(g).connect(ac.destination);o.start(t0+s);o.stop(t0+s+d+.02);};
    if(kind==="truck"){tone(147,0,"sawtooth",0,.7,.07);tone(185,0,"sawtooth",0,.7,.05);}
    else if(kind==="ev"){tone(880,0,"sine",0,.18,.08);tone(1320,0,"sine",.16,.3,.07);}
    else{tone(420,0,"square",0,.14,.05);tone(420,0,"square",.2,.14,.05);}}
  const bubble=(el,text)=>{const b=document.createElement("span");b.className="olf-say";b.textContent=text;el.appendChild(b);setTimeout(()=>b.remove(),1500);};
  async function drive(svg){svg.classList.add("olf-go");if(!still)svg.animate([{transform:"translateX(0)"},{transform:"translateX(34px)",offset:.55},{transform:"translateX(0)"}],{duration:1300,easing:"cubic-bezier(.45,0,.3,1)"});await wait(1300);svg.classList.remove("olf-go");}
  const C=s=>"<code>"+esc(s)+"</code>";
  OLF={carSvg,horn,bubble,drive};   /* shared with the analogy visuals (v26) on every page */

  /* ---------- Car Factory ---------- */
  if(fHost){
    const PAINT=[["#ef4444","red"],["#3b82f6","blue"],["#22c55e","green"],["#f59e0b","yellow"],["#a855f7","purple"],["#e5e7eb","white"]];
    const NAMES=["Swift","Nexon","Creta","Punch"],VARS="abcdefgh";
    let cars=[],nv=0,paint=0,last=["Car blueprint loaded: class Car { color; model; speed; drive(); honk(); paint(); }"];
    fHost.innerHTML='<div class="ol-head"><b>Car Factory</b><span>A class is a blueprint. An object is a real car built from it.</span></div><div class="vbody">'+
      '<div class="olf-hooks"><span><b>class</b> = blueprint</span><span><b>new</b> = the factory</span><span><b>object</b> = a real car</span><span><b>field</b> = its own paint, speed</span><span><b>method</b> = what it can do</span><span><b>variable</b> = the car key</span></div>'+
      '<div class="olf-top"><div class="olf-bp"><div class="olf-bpt">BLUEPRINT · <code>class Car</code></div>'+carSvg("#fff","car",true)+
        '<div class="olf-spec"><div><i>fields</i> color · model · speed</div><div><i>methods</i> drive() · honk() · paint()</div></div><div class="olf-bpn">Drawn once. You can\'t drive a drawing.</div></div>'+
      '<div class="olf-mach"><div class="olf-form"><label>model <input class="olf-model" maxlength="10" value="Swift" spellcheck="false"></label><div class="olf-sw">'+PAINT.map((p,i)=>'<button type="button" class="olf-dot'+(i?"":" on")+'" data-p="'+i+'" style="--paint:'+p[0]+'" aria-label="'+p[1]+'"></button>').join("")+'</div></div>'+
        '<button type="button" class="btn pri olf-new">🏭 new Car(…)</button><div class="olf-belt"><i></i></div><div class="olf-cnt"></div></div></div>'+
      '<h5>Parking lot · the heap (real objects)</h5><div class="olf-lot"></div><div class="olf-code"></div><div class="msg" aria-live="polite"></div></div>';
    const $f=s=>$(s,fHost),lot=$f(".olf-lot"),msg=$f(".msg");
    const keysOf=c=>c.keys.map(k=>'<span class="olf-key">🔑 '+k+"</span>").join("");
    function code(lines){last=last.concat(lines).slice(-4);$f(".olf-code").innerHTML=last.map((l,i,a)=>'<div class="'+(i===a.length-1?"cur":"")+'">'+hl(l)+"</div>").join("");}
    function cardHtml(c){return '<div class="olf-slot" data-id="'+c.id+'"><div class="olf-keys">'+keysOf(c)+'</div><div class="olf-stage">'+carSvg(c.color,"car")+'</div>'+
      '<div class="olf-plate">'+esc(c.model)+'</div><div class="olf-gauge"><span>speed</span><i style="--v:'+Math.min(1,c.speed/120)+'"></i><b>'+c.speed+'</b></div>'+
      '<div class="olf-acts"><button type="button" class="chip" data-a="drive">drive()</button><button type="button" class="chip" data-a="honk">honk()</button><button type="button" class="chip" data-a="paint">paint()</button><button type="button" class="chip" data-a="key">copy key</button></div></div>';}
    function drawLot(){lot.innerHTML=cars.map(cardHtml).join("")||'<div class="ol-empty">Empty lot. The blueprint alone gives you no car: press <b>new Car(…)</b>.</div>';
      $f(".olf-cnt").textContent="1 blueprint → "+cars.length+" car"+(cars.length===1?"":"s");}
    const slot=id=>$('.olf-slot[data-id="'+id+'"]',fHost),find=id=>cars.find(c=>c.id===+id);
    let busy=false;
    $f(".olf-new").addEventListener("click",async()=>{if(busy)return;if(cars.length>=4){msg.innerHTML="The lot is full (4 cars). Every car is a separate object; making more works the same way.";return;}
      busy=true;const model=($f(".olf-model").value.trim()||"Car").replace(/[^\w ]/g,"").slice(0,10)||"Car",col=PAINT[paint],v=VARS[nv++%VARS.length];
      const c={id:Date.now(),model,color:col[0],cname:col[1],speed:0,keys:[v]};
      $f(".olf-bp").classList.add("olf-flash");$f(".olf-belt").classList.add("olf-run");
      msg.innerHTML="The factory reads the <b>blueprint</b> and builds a new car on the heap…";await wait(700);
      cars.push(c);drawLot();const s=slot(c.id);s.classList.add("olf-raw");await wait(60);s.classList.remove("olf-raw");s.classList.add("olf-born");
      $f(".olf-bp").classList.remove("olf-flash");$f(".olf-belt").classList.remove("olf-run");
      code(["Car "+v+' = new Car("'+model+'", "'+col[1]+'");   // a new object; '+v+" holds its key"]);
      msg.innerHTML="A real <b>"+col[1]+" "+esc(model)+"</b> rolled out. It is an <b>object</b>: it has its <b>own</b> paint and speed (0). The blueprint is unchanged and can build any number of cars. <code>"+v+"</code> is just the <b>key</b> to this car.";busy=false;});
    fHost.addEventListener("click",async e=>{const d=e.target.closest(".olf-dot");if(d){paint=+d.dataset.p;$$(".olf-dot",fHost).forEach(x=>x.classList.toggle("on",x===d));return;}
      const b=e.target.closest(".olf-acts [data-a]");if(!b)return;const s=b.closest(".olf-slot"),c=find(s.dataset.id),k=c.keys[0],a=b.dataset.a;
      if(a==="drive"){c.speed=Math.min(120,c.speed+20);$(".olf-gauge",s).outerHTML='<div class="olf-gauge"><span>speed</span><i style="--v:'+Math.min(1,c.speed/120)+'"></i><b>'+c.speed+"</b></div>";
        code([k+".drive();   // only this car: "+k+".speed is now "+c.speed]);
        const others=cars.filter(x=>x!==c);msg.innerHTML="Only <b>this</b> car moved and sped up to "+c.speed+"."+(others.length?" The "+others.map(x=>x.cname+" "+esc(x.model)).join(" and the ")+" kept "+(others.length>1?"their":"its")+" own speed: every object has its <b>own copy</b> of the fields.":"");
        drive($("svg",s));}
      else if(a==="honk"){horn("car");bubble($(".olf-stage",s),"Beep beep!");code([k+".honk();   // behaviour from the blueprint, done by this car"]);
        msg.innerHTML="Every car can <code>honk()</code> because the blueprint says so: methods are written <b>once</b> in the class and run by each object.";}
      else if(a==="paint"){const i=(PAINT.findIndex(p=>p[0]===c.color)+1)%PAINT.length;c.color=PAINT[i][0];c.cname=PAINT[i][1];$("svg",s).style.setProperty("--paint",c.color);
        code([k+'.paint("'+c.cname+'");   // changes this object\'s field only']);msg.innerHTML="Repainted to "+c.cname+". The <b>blueprint</b> is still a line drawing, and no other car changed colour.";}
      else if(a==="key"){const v=VARS[nv++%VARS.length];c.keys.push(v);$(".olf-keys",s).innerHTML=keysOf(c);
        code(["Car "+v+" = "+k+";   // a second key, NOT a second car"]);
        msg.innerHTML="<code>Car "+v+" = "+k+";</code> copied the <b>key</b>, not the car: the lot still has "+cars.length+" car"+(cars.length===1?"":"s")+". Drive with key <code>"+v+"</code> and the same car moves. That's a <b>reference</b>.";
        if(!still)$$(".olf-key",s).pop().animate([{transform:"translateY(-14px) rotate(-20deg)",opacity:0},{transform:"none",opacity:1}],{duration:450,easing:"cubic-bezier(.2,1.5,.4,1)"});}});
    drawLot();code([]);msg.innerHTML="Pick a model and a colour, then press <b>new Car(…)</b> two or three times. Then drive one car and watch the others stay still.";}

  /* ---------- the four pillars as a car ---------- */
  if(sHost){
    const TABS=[["enc","Encapsulation"],["inh","Inheritance"],["poly","Polymorphism"],["abs","Abstraction"]];
    sHost.innerHTML='<div class="ol-head"><b>The four pillars, told with one car</b><span>Remember the car, and you remember OOP</span></div><div class="seg">'+TABS.map((t,i)=>'<button type="button" data-t="'+t[0]+'"'+(i?"":' class="on"')+">"+t[1]+"</button>").join("")+'</div><div class="vbody"><div class="olf-tab"></div></div>';
    const tab=$(".olf-tab",sHost);
    const view={
      enc(){let sp=0;tab.innerHTML='<div class="olf-two"><div class="olf-scene"><div class="olf-stage">'+carSvg("#ef4444","car")+'<span class="olf-lock" title="private">🔒</span></div><div class="olf-gauge"><span>speed</span><i style="--v:0"></i><b>0</b></div></div>'+
        '<div><p class="olf-big"><b>Encapsulation = the bonnet is locked.</b> You never reach into the engine; you use the pedals. The pedal (a method) checks every request.</p>'+
        '<div class="ol-cmds"><button type="button" class="chip" data-x="ok">car.accelerate(20)</button><button type="button" class="chip" data-x="neg">car.accelerate(-500)</button><button type="button" class="chip" data-x="hack">car.speed = 500</button></div><div class="olf-out"></div></div></div>'+
        '<div class="olf-code">'+["class Car {","    private int speed;                 // under the locked bonnet","    public void accelerate(int by) {   // the pedal","        if (by > 0) speed = Math.min(speed + by, 180);","    }","}"].map(l=>"<div>"+hl(l)+"</div>").join("")+"</div>";
        const out=$(".olf-out",tab),g=()=>{$(".olf-gauge",tab).outerHTML='<div class="olf-gauge"><span>speed</span><i style="--v:'+(sp/180)+'"></i><b>'+sp+"</b></div>";};
        tab.onclick=e=>{const b=e.target.closest("[data-x]");if(!b)return;const x=b.dataset.x;
          if(x==="ok"){sp=Math.min(180,sp+20);g();drive($(".olf-car",tab));out.innerHTML='<span class="olf-okk">✓ The pedal accepted it: speed '+sp+".</span>";}
          else if(x==="neg"){out.innerHTML='<span class="olf-warn">The pedal ignored it: <code>by &gt; 0</code> is false. A bad value can never reach the field.</span>';}
          else{const l=$(".olf-lock",tab);if(!still)l.animate([{transform:"scale(1)"},{transform:"scale(1.6) rotate(-12deg)"},{transform:"scale(1)"}],{duration:450});
            out.innerHTML='<span class="olf-err">error: speed has private access in Car</span><br>You can\'t open the bonnet from outside. That is the whole point: the rule "speed ≥ 0, ≤ 180" lives in <b>one</b> place.';}};},
      inh(){const T={Vehicle:{k:"chassis",c:"#94a3b8",own:["wheels","drive()","honk()"],p:null},Car:{k:"car",c:"#3b82f6",own:["doors = 4","honk() → Beep"],p:"Vehicle"},
          Truck:{k:"truck",c:"#f59e0b",own:["cargo","honk() → HONK"],p:"Vehicle"},ElectricCar:{k:"ev",c:"#22c55e",own:["battery","charge()","honk() → chime"],p:"Car"}};
        const node=n=>'<button type="button" class="olf-node" data-n="'+n+'">'+carSvg(T[n].c,T[n].k)+"<b>"+n+"</b></button>";
        tab.innerHTML='<div class="olf-tree"><div>'+node("Vehicle")+'</div><div class="olf-tl"><span>extends ▲</span><span>extends ▲</span></div><div class="olf-row">'+node("Car")+node("Truck")+'</div><div class="olf-tl l"><span>extends ▲</span></div><div class="olf-row">'+node("ElectricCar")+"<div></div></div></div>"+
          '<p class="olf-big"><b>Inheritance = a family of vehicles.</b> Every vehicle has wheels and can drive. A Car <i>is a</i> Vehicle and adds doors; an ElectricCar <i>is a</i> Car and adds a battery. Click a vehicle to see what it gets.</p><div class="olf-out"></div>';
        const show=n=>{$$(".olf-node",tab).forEach(b=>{let on=false;for(let x=n;x;x=T[x].p)if(x===b.dataset.n)on=true;b.classList.toggle("on",b.dataset.n===n);b.classList.toggle("anc",on&&b.dataset.n!==n);});
          const rows=[];const hidden=new Set();for(let x=n;x;x=T[x].p){T[x].own.forEach(m=>{const name=m.split(" ")[0];const ov=hidden.has(name);hidden.add(name);rows.push('<li class="'+(x===n?"own":"inh")+(ov?" ovd":"")+'"><code>'+esc(m)+"</code> "+(x===n?"<em>its own</em>":"<em>from "+x+(ov?", overridden below":"")+"</em>")+"</li>");});}
          $(".olf-out",tab).innerHTML="<b>"+n+"</b> has:<ul class=\"olf-has\">"+rows.join("")+"</ul>";};
        tab.onclick=e=>{const b=e.target.closest(".olf-node");if(b)show(b.dataset.n);};show("ElectricCar");},
      poly(){const G=[["Car","car","#3b82f6","Beep beep!"],["Truck","truck","#f59e0b","HOOONK!"],["ElectricCar","ev","#22c55e","♪ pling"]];
        tab.innerHTML='<div class="olf-garage">'+G.map(g=>'<div class="olf-bay" data-k="'+g[1]+'"><div class="olf-stage">'+carSvg(g[2],g[1])+"</div><code>Vehicle v = new "+g[0]+"();</code></div>").join("")+"</div>"+
          '<div class="ol-cmds"><button type="button" class="btn pri" data-x="all">▶ for (Vehicle v : garage) v.honk();</button></div>'+
          '<p class="olf-big"><b>Polymorphism = press the same horn button in different vehicles.</b> The call is identical, <code>v.honk()</code>, and the variable type is always <code>Vehicle</code>. Each <b>object</b> answers its own way, chosen at run time.</p><div class="olf-out"></div>';
        tab.onclick=async e=>{if(!e.target.closest('[data-x="all"]'))return;const out=$(".olf-out",tab);out.innerHTML="";
          for(const [i,g] of G.entries()){const bay=$$(".olf-bay",tab)[i];bay.classList.add("on");horn(g[1]);bubble($(".olf-stage",bay),g[3]);out.innerHTML+="<div><code>v.honk()</code> on a "+g[0]+" → <b>"+esc(g[3])+"</b></div>";await wait(900);bay.classList.remove("on");}
          out.innerHTML+='<div class="olf-okk">One line of code, three behaviours. Add a <code>Bus</code> tomorrow and this loop works unchanged.</div>';};},
      abs(){let engine="petrol",open=false;
        const parts={petrol:["fuel injector","spark plugs","5-speed gearbox","exhaust"],electric:["battery pack","inverter","electric motor","regenerative braking"]};
        tab.innerHTML='<div class="olf-two"><div class="olf-dash"><div class="olf-wheel">◎</div><div class="olf-ctl"><button type="button" class="chip" data-x="start">start()</button><button type="button" class="chip" data-x="drive">drive()</button><button type="button" class="chip" data-x="brake">brake()</button></div><div class="olf-dashl">interface Drivable · what the driver sees</div>'+
          '<div class="olf-hood"><div class="olf-hoodl">under the bonnet: the implementation</div><div class="olf-parts"></div></div></div>'+
          '<div><p class="olf-big"><b>Abstraction = the dashboard.</b> You drive any car with the same three controls. Petrol or electric, the engine is hidden behind them.</p><div class="ol-cmds"><button type="button" class="chip" data-x="hood">open the bonnet</button><button type="button" class="chip" data-x="swap">swap engine</button></div><div class="olf-out"></div></div></div>';
        const parts$=()=>{$(".olf-parts",tab).innerHTML=parts[engine].map(p=>"<span>"+p+"</span>").join("");$(".olf-hood",tab).classList.toggle("open",open);};parts$();
        tab.onclick=e=>{const b=e.target.closest("[data-x]");if(!b)return;const x=b.dataset.x,out=$(".olf-out",tab);
          if(x==="hood"){open=!open;b.textContent=open?"close the bonnet":"open the bonnet";parts$();out.innerHTML=open?"This is the <b>implementation</b>: the class that <code>implements Drivable</code>. The driver never needs to know it.":"Hidden again. The driver only knows the interface.";}
          else if(x==="swap"){engine=engine==="petrol"?"electric":"petrol";parts$();out.innerHTML="Swapped to a <b>"+engine+"</b> engine. The dashboard did not change at all: code written against <code>Drivable</code> keeps working. <code>Drivable car = new "+(engine==="petrol"?"PetrolCar":"ElectricCar")+"();</code>";if(!open){open=true;parts$();}}
          else{const msgs={start:{petrol:"vroom: fuel ignites",electric:"click: battery connects, silent"},drive:{petrol:"gears shift, engine roars",electric:"motor spins, instant torque"},brake:{petrol:"brake pads clamp",electric:"regenerative braking charges the battery"}};
            out.innerHTML="<code>car."+x+"()</code> → "+msgs[x][engine]+". Same button, different machinery.";}};}};
    sHost.addEventListener("click",e=>{const b=e.target.closest(".seg [data-t]");if(!b)return;$$(".seg button",sHost).forEach(x=>x.classList.toggle("on",x===b));view[b.dataset.t]();});
    view.enc();}
})();
