/* Lesson 02 labs (Classes and objects). Part of the course scripts: every Java page loads course-index.js, quiz-data.js,
   course.js, effects.js, then the labs of the lesson, then run-java.js. Classic scripts share one global scope, so nothing
   here is a top-level name: everything lives inside one IIFE (OLF is declared in course.js and only assigned here).
   course.js provides $, $$, esc, hl, store. Hosts are .viz.ol[id]: #olFactory (the Car Factory: class = blueprint,
   new = the factory, object = a real car, variable = the key), #olObj (stack, heap, references, null, garbage collection)
   and #olStatic (one static field per class, one instance field per object). All three come from the v1 Lesson 05
   (archive/java-v1/assets/labs/labs-oop.js); the .ol-* and .olf-* styles are in course.css. */
"use strict";
(function(){
  if(!$(".ol[id]"))return;
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait=ms=>new Promise(r=>setTimeout(r,still?Math.min(ms,40):ms));
  const C=s=>"<code>"+esc(s)+"</code>";
  const head=(t,sub)=>'<div class="ol-head"><b>'+t+"</b><span>"+sub+"</span></div>";
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

  /* ===== small car drawings and a horn (no files; Web Audio only after a click and only when js1-sound is not "0") ===== */
  function carSvg(color,blue){
    const wheel=x=>'<g class="olf-wh" transform="translate('+x+' 60)"><g class="olf-wr"><circle r="12" class="olf-tyre"/><circle r="6" class="olf-rim"/><path d="M0-6V6M-6 0H6" class="olf-spk"/></g></g>';
    const body='<path class="olf-body" d="M12 52Q12 40 26 38L48 36L64 20Q68 16 76 16H108Q116 16 122 22L136 36Q150 38 152 48V56Q152 60 148 60H16Q12 60 12 56Z"/><path class="olf-win" d="M70 22H106Q112 22 116 27L126 36H58Z"/><path class="olf-line" d="M92 22V36M92 38V58"/><path class="olf-shine" d="M22 44Q60 40 146 44"/><circle cx="148" cy="47" r="3" class="olf-hl"/><rect x="12" y="44" width="4" height="6" rx="1" class="olf-tail"/>';
    return '<svg class="olf-car'+(blue?" olf-blue":"")+'" viewBox="0 0 164 80" style="--paint:'+(color||"#3b82f6")+'" aria-hidden="true"><ellipse cx="82" cy="73" rx="64" ry="4" class="olf-shadow"/>'+body+wheel(40)+wheel(124)+"</svg>";}
  let ac=null;
  function horn(){if(store.get("js1-sound")==="0")return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
    const t0=ac.currentTime,tone=s=>{const o=ac.createOscillator(),g=ac.createGain();o.type="square";o.frequency.setValueAtTime(420,t0+s);
      g.gain.setValueAtTime(0,t0+s);g.gain.linearRampToValueAtTime(.05,t0+s+.02);g.gain.setValueAtTime(.05,t0+s+.1);g.gain.linearRampToValueAtTime(0,t0+s+.14);o.connect(g).connect(ac.destination);o.start(t0+s);o.stop(t0+s+.16);};
    tone(0);tone(.2);}
  const bubble=(el,text)=>{const b=document.createElement("span");b.className="olf-say";b.textContent=text;el.appendChild(b);setTimeout(()=>b.remove(),1500);};
  async function drive(svg){svg.classList.add("olf-go");if(!still)svg.animate([{transform:"translateX(0)"},{transform:"translateX(34px)",offset:.55},{transform:"translateX(0)"}],{duration:1300,easing:"cubic-bezier(.45,0,.3,1)"});await wait(1300);svg.classList.remove("olf-go");}
  OLF={carSvg:(c,k,b)=>carSvg(c,b),horn,bubble,drive};

  /* ===== 1. Car Factory: class = blueprint, new = the factory, object = a real car, variable = the key ===== */
  const fHost=$("#olFactory");
  if(fHost){
    const PAINT=[["#ef4444","red"],["#3b82f6","blue"],["#22c55e","green"],["#f59e0b","yellow"],["#a855f7","purple"],["#e5e7eb","white"]];
    const VARS="abcdefgh";
    let cars=[],nv=0,paint=0,last=["class Car { String model; String color; int speed; void accelerate(int by); void honk(); }"];
    fHost.innerHTML=head("Car Factory","A class is a blueprint. An object is a real car built from it.")+'<div class="vbody">'+
      '<div class="olf-hooks"><span><b>class</b> = blueprint</span><span><b>new</b> = the factory</span><span><b>object</b> = a real car</span><span><b>field</b> = its own paint, speed</span><span><b>method</b> = what it can do</span><span><b>variable</b> = the car key</span></div>'+
      '<div class="olf-top"><div class="olf-bp"><div class="olf-bpt">BLUEPRINT · <code>class Car</code></div>'+carSvg("#fff",true)+
        '<div class="olf-spec"><div><i>fields</i> model · color · speed</div><div><i>methods</i> accelerate() · honk() · paint()</div></div><div class="olf-bpn">Drawn once. You can\'t drive a drawing.</div></div>'+
      '<div class="olf-mach"><div class="olf-form"><label>model <input class="olf-model" maxlength="10" value="Swift" spellcheck="false"></label><div class="olf-sw">'+PAINT.map((p,i)=>'<button type="button" class="olf-dot'+(i?"":" on")+'" data-p="'+i+'" style="--paint:'+p[0]+'" aria-label="'+p[1]+'"></button>').join("")+'</div></div>'+
        '<button type="button" class="btn pri olf-new">🏭 new Car(…)</button><div class="olf-belt"><i></i></div><div class="olf-cnt"></div></div></div>'+
      '<h5>Parking lot · the heap (real objects)</h5><div class="olf-lot"></div><div class="olf-code"></div><div class="msg" aria-live="polite"></div></div>';
    const $f=s=>$(s,fHost),lot=$f(".olf-lot"),msg=$f(".msg");
    const keysOf=c=>c.keys.map(k=>'<span class="olf-key">🔑 '+k+"</span>").join("");
    function code(lines){last=last.concat(lines).slice(-4);$f(".olf-code").innerHTML=last.map((l,i,a)=>'<div class="'+(i===a.length-1?"cur":"")+'">'+hl(l)+"</div>").join("");}
    const gauge=c=>'<div class="olf-gauge"><span>speed</span><i style="--v:'+Math.min(1,c.speed/120)+'"></i><b>'+c.speed+"</b></div>";
    function cardHtml(c){return '<div class="olf-slot" data-id="'+c.id+'"><div class="olf-keys">'+keysOf(c)+'</div><div class="olf-stage">'+carSvg(c.color)+'</div>'+
      '<div class="olf-plate">'+esc(c.model)+"</div>"+gauge(c)+
      '<div class="olf-acts"><button type="button" class="chip" data-a="drive">accelerate(20)</button><button type="button" class="chip" data-a="honk">honk()</button><button type="button" class="chip" data-a="paint">paint()</button><button type="button" class="chip" data-a="key">copy key</button></div></div>';}
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
      msg.innerHTML="A real <b>"+col[1]+" "+esc(model)+"</b> rolled out. It is an <b>object</b>: it has its <b>own</b> paint and its own speed (0). The blueprint is unchanged and can build any number of cars. <code>"+v+"</code> is only the <b>key</b> to this car.";busy=false;});
    fHost.addEventListener("click",e=>{const d=e.target.closest(".olf-dot");if(d){paint=+d.dataset.p;$$(".olf-dot",fHost).forEach(x=>x.classList.toggle("on",x===d));return;}
      const b=e.target.closest(".olf-acts [data-a]");if(!b)return;const s=b.closest(".olf-slot"),c=find(s.dataset.id),k=c.keys[0],a=b.dataset.a;
      if(a==="drive"){c.speed=Math.min(120,c.speed+20);$(".olf-gauge",s).outerHTML=gauge(c);
        code([k+".accelerate(20);   // only this car: "+k+".speed is now "+c.speed]);
        const others=cars.filter(x=>x!==c);msg.innerHTML="Only <b>this</b> car sped up, to "+c.speed+"."+(others.length?" The "+others.map(x=>x.cname+" "+esc(x.model)).join(" and the ")+" kept "+(others.length>1?"their":"its")+" own speed: every object has its <b>own copy</b> of the fields.":"");
        drive($("svg",s));}
      else if(a==="honk"){horn();bubble($(".olf-stage",s),"Beep beep!");code([k+".honk();   // behaviour from the blueprint, done by this car"]);
        msg.innerHTML="Every car can <code>honk()</code> because the blueprint says so: a method is written <b>once</b> in the class and run by each object.";}
      else if(a==="paint"){const i=(PAINT.findIndex(p=>p[0]===c.color)+1)%PAINT.length;c.color=PAINT[i][0];c.cname=PAINT[i][1];$("svg",s).style.setProperty("--paint",c.color);
        code([k+'.color = "'+c.cname+'";   // changes this object\'s field only']);msg.innerHTML="Repainted to "+c.cname+". The <b>blueprint</b> is still a line drawing, and no other car changed colour.";}
      else if(a==="key"){const v=VARS[nv++%VARS.length];c.keys.push(v);$(".olf-keys",s).innerHTML=keysOf(c);
        code(["Car "+v+" = "+k+";   // a second key, NOT a second car"]);
        msg.innerHTML="<code>Car "+v+" = "+k+";</code> copied the <b>key</b>, not the car: the lot still has "+cars.length+" car"+(cars.length===1?"":"s")+". Drive with key <code>"+v+"</code> and the same car moves. That is a <b>reference</b>.";
        if(!still)$$(".olf-key",s).pop().animate([{transform:"translateY(-14px) rotate(-20deg)",opacity:0},{transform:"none",opacity:1}],{duration:450,easing:"cubic-bezier(.2,1.5,.4,1)"});}});
    drawLot();code([]);msg.innerHTML="Pick a model and a colour, then press <b>new Car(…)</b> two or three times. Then accelerate one car and watch the others stay still.";}

  /* ===== 2. Object lab: references, aliasing, null, unreachable objects and GC ===== */
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
      if(V[v]==null){draw();msg.innerHTML='<b>NullPointerException</b>: Cannot read field "speed" because "'+v+'" is null. A null reference points to no object, so there is no field to change.';msg.classList.add("err");shake($('[data-v="'+v+'"]',objHost));return;}
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

  /* ===== 3. static vs instance: one copy in the class, one copy per object ===== */
  const stHost=$("#olStatic");
  if(stHost){
    let objs=[],built=0;const MODELS=["Swift","Nexon","Creta","Punch","Verna","Brezza","Thar","Ertiga"];
    stHost.innerHTML=head("static vs instance","One shared copy in the class, one copy per object")+
      '<div class="vbody"><div class="ol-cmds"><button type="button" class="btn pri" data-a="new">new Car(…)</button><button type="button" class="chip" data-a="read">a.built</button><button type="button" class="chip" data-a="call">Car.howMany()</button><button type="button" class="btn" data-a="reset">Reset</button></div>'+
      '<div class="ol-mem st"><svg class="ol-arw" aria-hidden="true"></svg><div class="ol-col"><h5>Heap · objects</h5><div class="ol-heap"></div></div><div class="ol-col"><h5>Class data (one per class)</h5><div class="ol-cls"><small>class Car</small><div class="sf">static int built = <b>0</b></div><div class="mt">static int howMany()</div><div class="mt">Car(String m) { built++; id = built; }</div></div></div></div>'+
      '<div class="msg" aria-live="polite"></div></div>';
    const $s=s=>$(s,stHost),msg=$s(".msg");
    function draw(fresh){$s(".ol-heap").innerHTML=objs.map((o,i)=>'<div class="ol-obj'+(fresh===i?" pop":"")+'" data-o="'+i+'"><small>'+"abcdefgh"[i]+" → Car object</small><div>model = <b>\""+o.m+"\"</b></div><div>final int id = <b>"+o.id+"</b></div></div>").join("")||'<div class="ol-empty">no objects yet: the static field already exists</div>';
      $(".sf b",stHost).textContent=built;
      requestAnimationFrame(()=>arrows($s(".ol-mem"),$s(".ol-arw"),objs.map((o,i)=>[$('[data-o="'+i+'"]',stHost),$s(".ol-cls"),"d"])));}
    stHost.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
      if(a==="new"){if(objs.length>=8){msg.innerHTML="That's enough cars to see the idea. Press Reset.";return;}built++;objs.push({id:built,m:MODELS[objs.length]});draw(objs.length-1);pulse($(".sf",stHost));
        msg.innerHTML="The constructor runs <code>built++</code> on the <b>one shared</b> field, then copies the value into this car's <b>own</b> <code>id</code> field ("+built+"). Every object points back to the same class data.";}
      else if(a==="read"){if(!objs.length){msg.innerHTML="Build a car first: there is no <code>a</code> yet. (<code>Car.built</code> works without any object.)";return;}
        pulse($(".sf",stHost));msg.innerHTML="<code>a.built</code> = <b>"+built+"</b>. It compiles, but it reads the <b>class's</b> field, not anything stored in <code>a</code>. Write <code>Car.built</code> so nobody is fooled.";}
      else if(a==="call"){pulse($(".ol-cls .mt",stHost));msg.innerHTML="<code>Car.howMany()</code> = <b>"+built+"</b>. A static method needs no object and has no <code>this</code>, so it can't read <code>id</code> (which car's id would it be?).";}
      else{objs=[];built=0;draw();msg.innerHTML="Reset. The static field exists (with value 0) as soon as the class is loaded, before any object.";}});
    msg.innerHTML="Press <b>new Car(…)</b> a few times. Watch the one static field count up while each car keeps its own <code>id</code>.";draw();onResize(()=>draw());}
})();
