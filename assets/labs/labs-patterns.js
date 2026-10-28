/* Design Patterns course: the shared lab kit (phase 1, 2026-10-28). Every patterns page loads patterns-index.js, quiz-data.js,
   course.js, effects.js, this file, then its lesson's data file (labs-patterns-pNN.js) and run-java.js. Classic scripts share one
   global scope, so the only top-level name here is DPL (window.DPL, also the test hook). Classes are prefixed dp-.
   A lab is DATA ONLY: DPL.add({key: spec}) builds every <div class="viz dp" id="dp-KEY"> on the page.
   spec  = {pill, views:[view, …]}            several views → tabs (Structure / Runtime, Before / After …)
   view  = {name, h, nodes, edges, steps, code?}   SVG viewBox is 600 × h; code = default code for every step
   node  = ['id', x, y, w, 'title', 'sub', h?]    a plain box (an object, a person, a step); h defaults to 52
         | {id, x, y, w, name, st?, f?, m?}       a UML-lite class box: st = 'interface' | 'abstract' | 'record' (shown «st»,
                                                  name italic for interface/abstract), f = field lines, m = method lines;
                                                  the height is computed (24 or 36 header + 15 px per line)
   edge  = ['id', from, to, kind?, bend?, label?, ports?]   kind: 'impl' (dashed, hollow head at `to`), 'ext' (solid, hollow head),
           'has' (diamond at `from`, the owner), 'calls' (default, filled arrow); bend curves the line; ports 'h' | 'v' forces sides
   step  = {t, d, code?, marks?, cur, on, good, bad, dim, hide, lines, txt:{id:[title,sub]}, note}
           marks = substrings; every code line containing one is highlighted. lines = edge ids drawn in the accent colour
           (others fade); lines 'all' = every edge on; no lines = every edge in its normal colour. hide = node/edge ids not drawn yet.
           add / del = substrings: lines shown as added (green +) / removed (struck); meter = [label, value, max] ("places to edit" bar)
   Sequence view (phase B): view.seq = {lanes:[[id,title,sub]], msgs:[[from,to,label,kind]]} (kind call | ret | new | self); its steps take
           upto (messages shown) and cur (index of the message happening now) instead of nodes/lines. view.alt = text alternative.
   Also: DPL.CATALOG (the 23 patterns in learning order: file, GoF family, move, tier, difficulty, problem, intent, related, confused-with),
   DPL.play (Playgrounds, see below), DPL.map (course home map + catalogue), DPL.picker, DPL.families, DPL.glyph, and markup widgets bound
   on load: .dp-pat[data-p] pattern header, .dp-pred Predict, .dp-xb Explain it back. Full format: kb/patterns-00-foundations.md → Kit. */
"use strict";
window.DPL=(function(){
  const LABS={},BUILT={};
  const LH=15,FS=11,NAME=12;
  const KINDS={impl:"implements",ext:"extends",has:"has-a",calls:"calls / uses"};
  const hlc=s=>typeof hl==="function"?hl(s):esc(s);

  /* ---------- the 23 patterns, in learning order (page NN = position; kb/design-patterns-plan.md) ----------
     [name, file slug, GoF family c/s/b, move, interview tier 1★ 2◆ 3○, difficulty 1 beginner 2 intermediate 3 advanced,
      dealership problem, one-line intent, related (used with), confused with] */
  const CATALOG=[
    ["Strategy","strategy","b","swap",1,1,"interchangeable discount rules (festival, loyalty, none)","Put each interchangeable behaviour in its own class behind one interface, and let the client pick one.",["State","Template Method","Factory Method"],["State","Template Method"]],
    ["Template Method","template-method","b","swap",1,1,"a fixed inspection checklist with model-specific steps","Fix the steps of an algorithm in a base class and let subclasses fill in only the steps that vary.",["Factory Method","Strategy"],["Strategy"]],
    ["State","state","b","swap",1,1,"an order moving booked → paid → delivered → cancelled","Let an object change its behaviour when its internal state changes, by delegating to a state object.",["Strategy","Singleton"],["Strategy"]],
    ["Factory Method","factory-method","c","create",1,1,"creating the right car without new scattered everywhere","Let a method decide which concrete class to create, so callers depend only on the interface.",["Template Method","Abstract Factory"],["Abstract Factory","Builder"]],
    ["Builder","builder","c","create",1,1,"a car with 12 optional extras, readable and immutable","Build a complex object step by step, then get a finished, valid, usually immutable result.",["Composite","Abstract Factory"],["Factory Method","Abstract Factory"]],
    ["Singleton","singleton","c","create",1,1,"one shared vehicle registry for the whole showroom","Make sure a class has exactly one instance and give one global way to reach it.",["Abstract Factory","Facade","State"],["Flyweight"]],
    ["Prototype","prototype","c","create",2,2,"clone a configured demo car instead of rebuilding it","Create new objects by copying a configured example instead of building them from scratch.",["Memento","Composite"],["Builder"]],
    ["Abstract Factory","abstract-factory","c","create",2,2,"a family of matching parts per market (India vs EU)","Create families of related objects that must match, without naming their concrete classes.",["Factory Method","Singleton"],["Factory Method","Builder"]],
    ["Adapter","adapter","s","wrap",1,1,"plug an old payment gateway into the new checkout","Convert the interface of an existing class into the interface a client expects.",["Facade","Bridge"],["Decorator","Proxy","Facade","Bridge"]],
    ["Decorator","decorator","s","wrap",1,2,"add-ons (sunroof, GPS, warranty) each adding to the price","Add responsibilities to an object at run time by wrapping it in objects with the same interface.",["Composite","Strategy"],["Proxy","Adapter"]],
    ["Proxy","proxy","s","wrap",1,2,"a test-drive key: checks access, loads lazily, logs use","Stand in for another object to control access to it: lazily, securely, remotely or with logging.",["Decorator","Facade"],["Decorator","Adapter"]],
    ["Facade","facade","s","wrap",1,1,"one buyCar() hiding finance, insurance, registration","Give one simple entry point to a complicated subsystem.",["Singleton","Mediator","Adapter"],["Adapter","Mediator"]],
    ["Bridge","bridge","s","wrap",3,3,"vehicle type × engine type without a class explosion","Split one class hierarchy into two (abstraction and implementation) that vary independently.",["Abstract Factory","Strategy"],["Adapter","Strategy"]],
    ["Observer","observer","b","talk",1,1,"customers notified when a price drops","Let many objects subscribe to one object and be notified automatically when it changes.",["Mediator","Command"],["Mediator"]],
    ["Command","command","b","talk",1,1,"workshop jobs as objects: queue, log, undo","Turn a request into an object, so it can be queued, logged, undone or passed around.",["Memento","Composite","Chain of Responsibility"],["Strategy"]],
    ["Chain of Responsibility","chain-of-responsibility","b","talk",1,2,"a loan approval chain (clerk → manager → bank)","Pass a request along a chain of handlers until one of them handles it.",["Command","Composite","Decorator"],["Decorator"]],
    ["Mediator","mediator","b","talk",3,2,"a showroom coordinator instead of everyone calling everyone","Let objects talk through one coordinator instead of referring to each other directly.",["Observer","Facade"],["Observer","Facade"]],
    ["Memento","memento","b","talk",3,2,"undo in the car configurator","Capture an object's state in a snapshot so it can be restored later, without exposing its internals.",["Command","Prototype","Iterator"],["Prototype"]],
    ["Composite","composite","s","compose",2,2,"a car as a tree of parts; price = sum of the tree","Treat single objects and groups of objects the same way, as a tree.",["Iterator","Visitor","Decorator","Interpreter"],["Decorator"]],
    ["Iterator","iterator","b","compose",2,1,"walk the inventory without knowing how it is stored","Walk through the elements of a collection without exposing how it is stored.",["Composite","Visitor","Memento"],["Visitor"]],
    ["Visitor","visitor","b","compose",3,3,"tax and valuation over different vehicle types","Add new operations over a fixed set of classes without changing those classes.",["Composite","Iterator","Interpreter"],["Iterator","Strategy"]],
    ["Interpreter","interpreter","b","compose",3,3,"a tiny search language (brand:Tata price<10L)","Represent a small language's grammar as classes and evaluate sentences by walking the tree.",["Composite","Visitor","Flyweight"],["Composite"]],
    ["Flyweight","flyweight","s","compose",3,3,"thousands of cars sharing one model spec","Share the common, unchanging part of many fine-grained objects instead of copying it.",["Composite","Factory Method"],["Singleton","Prototype"]]
  ].map(([n,slug,f,mv,t,d,p,i,rel,conf],k)=>({n,slug,f,mv,t,d,p,i,rel,conf,k:"p"+String(k+1).padStart(2,"0"),file:String(k+1).padStart(2,"0")+"-"+slug+".html"}));
  const BYN={};CATALOG.forEach(c=>BYN[c.n]=c);
  const MOVE={swap:["Swap","replace behaviour without rewriting the client"],create:["Create","control how objects are made"],
    wrap:["Wrap","compatibility, extra responsibilities, controlled access"],talk:["Talk","notify, request, coordinate"],compose:["Compose","structures of many objects"]};
  const TIER=["","★","◆","○"],TIERN=["","asked constantly","asked often","know the idea"],DIFF=["","Beginner","Intermediate","Advanced"];
  const FAM={c:"Creational",s:"Structural",b:"Behavioral"};
  const FAMD={c:"how objects are created",s:"how objects are put together",b:"how objects talk and share work"};

  /* ---------- geometry ---------- */
  function box(n){
    if(Array.isArray(n)){const [id,x,y,w,t,s,h]=n;return {id,x,y,w,h:h||52,t,s,cls:false};}
    const hdr=n.st?36:24,f=n.f||[],m=n.m||[];
    const h=Math.max(30,hdr+(f.length?f.length*LH+6:0)+(m.length?m.length*LH+6:0));
    return Object.assign({},n,{h,hdr,f,m,cls:true});
  }
  function anchor(a,b,ports){
    const v=ports==="v"||(ports!=="h"&&(b.y>=a.y+a.h||b.y+b.h<=a.y));
    if(v){if(b.y>=a.y+a.h)return [[a.x+a.w/2,a.y+a.h],[b.x+b.w/2,b.y]];return [[a.x+a.w/2,a.y],[b.x+b.w/2,b.y+b.h]];}
    if(b.x>=a.x+a.w||b.x+b.w/2>a.x+a.w/2)return [[a.x+a.w,a.y+a.h/2],[b.x,b.y+b.h/2]];
    return [[a.x,a.y+a.h/2],[b.x+b.w,b.y+b.h/2]];
  }
  const R=n=>Math.round(n*10)/10;

  /* ---------- SVG ---------- */
  function markers(id){
    const m=(nm,path,refX,cls)=>'<marker id="'+id+"-"+nm+'" viewBox="0 0 10 10" refX="'+refX+'" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path class="'+cls+'" d="'+path+'"/></marker>';
    const tri="M0,0 L10,5 L0,10 z",dia="M0,5 L5,1 L10,5 L5,9 z";
    return "<defs>"+["","-on"].map(s=>m("tri"+s,tri,10,"dp-mk-h"+s)+m("dia"+s,dia,10,"dp-mk-d"+s)+m("arr"+s,tri,10,"dp-mk-a"+s)).join("")+"</defs>";
  }
  function nodeSvg(b){
    let o='<g class="dp-nd'+(b.cls?" dp-cls":"")+'" data-n="'+b.id+'"><rect x="'+b.x+'" y="'+b.y+'" width="'+b.w+'" height="'+b.h+'" rx="'+(b.cls?6:10)+'"/>';
    const cx=b.x+b.w/2;
    if(!b.cls){
      o+='<text class="dp-tt" x="'+cx+'" y="'+(b.s!=null&&b.s!==""?b.y+b.h/2-3:b.y+b.h/2+4)+'">'+esc(b.t)+"</text>";
      o+='<text class="dp-ts" x="'+cx+'" y="'+(b.y+b.h/2+13)+'">'+esc(b.s||"")+"</text>";
      return o+"</g>";
    }
    if(b.st)o+='<text class="dp-st" x="'+cx+'" y="'+(b.y+14)+'">«'+esc(b.st)+"»</text>";
    o+='<text class="dp-cn'+(b.st==="interface"||b.st==="abstract"?" dp-it":"")+'" x="'+cx+'" y="'+(b.y+(b.st?30:17))+'">'+esc(b.name)+"</text>";
    let y=b.y+b.hdr;
    [b.f,b.m].forEach(list=>{if(!list.length)return;o+='<line class="dp-sep" x1="'+b.x+'" x2="'+(b.x+b.w)+'" y1="'+y+'" y2="'+y+'"/>';
      list.forEach((t,i)=>o+='<text class="dp-mb" x="'+(b.x+8)+'" y="'+(y+14+i*LH)+'">'+esc(t)+"</text>");y+=list.length*LH+6;});
    return o+"</g>";
  }
  function edgeSvg(e,N,mid){
    const [id,from,to,kind,bend,label,ports]=e,k=kind||"calls";
    const [p,q]=anchor(N[from],N[to],ports);let d="M"+R(p[0])+","+R(p[1])+" L"+R(q[0])+","+R(q[1]),lx=(p[0]+q[0])/2,ly=(p[1]+q[1])/2;
    if(bend){const dx=q[0]-p[0],dy=q[1]-p[1],L=Math.hypot(dx,dy)||1,cx=lx-dy/L*bend,cy=ly+dx/L*bend;d="M"+R(p[0])+","+R(p[1])+" Q"+R(cx)+","+R(cy)+" "+R(q[0])+","+R(q[1]);lx=(lx+cx)/2;ly=(ly+cy)/2;}
    const mk=k==="has"?' marker-start="url(#'+mid+'-dia)"':' marker-end="url(#'+mid+"-"+(k==="calls"?"arr":"tri")+')"';
    let o='<g class="dp-ed dp-'+k+'" data-e="'+id+'"><path d="'+d+'"'+mk+"/>";
    if(label)o+='<text class="dp-el" x="'+R(lx)+'" y="'+R(ly-5)+'">'+esc(label)+"</text>";
    return o+"</g>";
  }
  function legend(kinds){
    if(!kinds.length)return "";
    const ic={impl:'<path d="M2 7H24" stroke-dasharray="4 3"/><path class="dp-lh" d="M24 2L32 7L24 12Z"/>',ext:'<path d="M2 7H24"/><path class="dp-lh" d="M24 2L32 7L24 12Z"/>',
      has:'<path class="dp-lh" d="M2 7L7 3L12 7L7 11Z"/><path d="M12 7H32"/>',calls:'<path d="M2 7H25"/><path class="dp-la" d="M24 2L32 7L24 12Z"/>'};
    return '<div class="dp-leg" aria-label="Arrow legend">'+kinds.map(k=>'<span><svg viewBox="0 0 34 14" aria-hidden="true">'+ic[k]+"</svg>"+KINDS[k]+"</span>").join("")+"</div>";
  }

  /* ---------- code panel: one span per line, lines containing a mark are highlighted ---------- */
  /* add / del (Refactor view): lines containing one of them are shown as added (green, +) or removed (struck, −) */
  function codeHtml(src,marks,add,del){
    marks=marks||[];add=add||[];del=del||[];const has=(a,l)=>a.some(m=>l.includes(m));
    return src.replace(/^\n+|\s+$/g,"").split("\n").map(l=>{const c=has(del,l)?" del":has(add,l)?" add":has(marks,l)?" on":"";
      return '<span class="dp-ln'+c+'">'+(hlc(l)||" ")+"</span>";}).join("");
  }

  /* ---------- sequence view: lanes (lifelines) across the top, one message per row; a message is an edge, a lane head is a plain box ---------- */
  const SQ={top:8,head:44,first:84,gap:34};
  function seqPrep(v){
    const L=v.seq.lanes,M=v.seq.msgs,n=L.length,slot=600/n,w=Math.min(150,slot-14);
    const X={};L.forEach((l,i)=>X[l[0]]=i*slot+slot/2);
    v.nodes=L.map((l,i)=>[l[0],R(i*slot+(slot-w)/2),SQ.top,R(w),l[1],l[2]||"",SQ.head]);
    v.edges=[];v.h=v.h||SQ.first+M.length*SQ.gap;
    v._seq={X,M,life:L.map(l=>[X[l[0]],SQ.top+SQ.head,v.h-6])};
    v.steps=v.steps.map(s=>{const o=Object.assign({},s),upto=s.upto==null?M.length:s.upto;
      o.hide=(s.hide||[]).concat(M.map((m,i)=>i>=upto?"m"+i:null).filter(Boolean));
      if(s.cur!=null&&!Array.isArray(s.cur)){const m=M[s.cur];o.lines=["m"+s.cur];o.on=(s.on||[]).concat(m[0],m[1]);o.cur=[m[1]];}
      return o;});
  }
  function seqSvg(v,mid){
    const {X,M,life}=v._seq;
    let o=life.map(([x,y1,y2])=>'<line class="dp-life" x1="'+R(x)+'" x2="'+R(x)+'" y1="'+y1+'" y2="'+y2+'"/>').join("");
    M.forEach(([a,b,label,kind],i)=>{const y=SQ.first+i*SQ.gap,k=kind||"call",x1=X[a],x2=X[b];let d,lx,ly=y-6;
      if(a===b){d="M"+R(x1)+","+(y-8)+" h28 v14 h-24";lx=x1+34;ly=y-2;}
      else{const dir=x2>x1?1:-1;d="M"+R(x1+dir*3)+","+y+" L"+R(x2-dir*4)+","+y;lx=(x1+x2)/2;}
      o+='<g class="dp-ed dp-sq dp-'+k+'" data-e="m'+i+'"><path d="'+d+'" marker-end="url(#'+mid+'-arr)"/>'+
        '<text class="dp-el'+(a===b?" dp-el-l":"")+'" x="'+R(lx)+'" y="'+R(ly)+'">'+esc(label)+"</text></g>";});
    return o;
  }

  /* ---------- one view = one stepped diagram ---------- */
  function viewHtml(key,vi,v){
    const mid="dpm-"+key+"-"+vi;
    if(v.seq&&!v._seq)seqPrep(v);
    const B=v.nodes.map(box),N={};B.forEach(b=>N[b.id]=b);
    v._B=B;v._N=N;
    const kinds=v.seq?[]:[...new Set(v.edges.map(e=>e[3]||"calls"))].sort((a,b)=>Object.keys(KINDS).indexOf(a)-Object.keys(KINDS).indexOf(b));
    const svg='<svg class="dp-svg'+(v.seq?" dp-seqv":"")+'" viewBox="0 0 600 '+v.h+'" role="img" aria-label="'+esc(v.alt||v.name||"diagram")+'">'+markers(mid)+
      (v.seq?seqSvg(v,mid):v.edges.map(e=>edgeSvg(e,N,mid)).join(""))+B.map(nodeSvg).join("")+"</svg>";
    const hasCode=v.code!=null||v.steps.some(s=>s.code!=null);
    const meter=v.steps.some(s=>s.meter)?'<div class="dp-meter" data-meter><span data-ml></span><i><b data-mb></b></i><em data-mv></em></div>':"";
    const seqLeg=v.seq?'<div class="dp-leg" aria-label="Arrow legend"><span><svg viewBox="0 0 34 14" aria-hidden="true"><path d="M2 7H25"/><path class="dp-la" d="M24 2L32 7L24 12Z"/></svg>call</span><span><svg viewBox="0 0 34 14" aria-hidden="true"><path d="M2 7H25" stroke-dasharray="4 3"/><path class="dp-la" d="M24 2L32 7L24 12Z"/></svg>return</span></div>':"";
    return '<div class="dp-view" data-v="'+vi+'" role="tabpanel"'+(vi?" hidden":"")+'>'+
      '<div class="dp-now" aria-live="polite"><b data-pos2></b><span data-t></span></div><p class="dp-d" data-d></p>'+meter+
      '<div class="dp-stage">'+svg+legend(kinds)+seqLeg+'<p class="dp-note" data-note></p></div>'+
      (hasCode?'<pre class="dp-code" data-code></pre>':"")+
      '<div class="dp-ctl"><button type="button" class="btn" data-a="back">◀ Back</button><button type="button" class="btn pri" data-a="next">Next ▶</button><button type="button" class="btn" data-a="play">▶ Play</button><span class="dp-pos" data-pos></span></div></div>';
  }
  function bindView(root,v,mid){
    const q=s=>root.querySelector(s),steps=v.steps;let i=0,timer=null,lastCode=null;
    const play=q("[data-a=play]"),back=q("[data-a=back]"),next=q("[data-a=next]");
    function apply(s){
      const all=["on","cur","good","bad","dim"],hide=s.hide||[];
      root.querySelectorAll(".dp-nd").forEach(n=>{const id=n.dataset.n;all.forEach(c=>n.classList.remove(c));n.classList.toggle("dp-hide",hide.includes(id));
        const b=v._N[id];if(!b.cls){const tx=(s.txt&&s.txt[id])||[b.t,b.s];const ts=n.querySelectorAll("text");ts[0].textContent=tx[0];ts[1].textContent=tx[1]||"";}});
      all.forEach(c=>(s[c]||[]).forEach(id=>{const n=q('.dp-nd[data-n="'+id+'"]');if(n)n.classList.add(c);}));
      root.querySelectorAll(".dp-ed").forEach(g=>{const id=g.dataset.e,on=s.lines==="all"||(Array.isArray(s.lines)&&s.lines.includes(id));
        g.classList.toggle("on",on);g.classList.toggle("dim",Array.isArray(s.lines)&&!on);g.classList.toggle("dp-hide",hide.includes(id));
        const p=g.querySelector("path"),at=p.hasAttribute("marker-start")?"marker-start":"marker-end",cur=p.getAttribute(at);p.setAttribute(at,cur.replace(/-on\)$/,")").replace(/\)$/,on?"-on)":")"));});
      q("[data-note]").textContent=s.note||"";
      const c=q("[data-code]"),src=s.code!=null?s.code:v.code;
      if(c&&src!=null){const k=src+"\u0000"+[s.marks,s.add,s.del].map(a=>(a||[]).join("\u0001")).join("\u0002");if(k!==lastCode){c.innerHTML=codeHtml(src,s.marks,s.add,s.del);lastCode=k;}
        const on=c.querySelector(".dp-ln.on,.dp-ln.add,.dp-ln.del");if(on&&c.scrollHeight>c.clientHeight)c.scrollTop=Math.max(0,on.offsetTop-c.clientHeight/3);}
      const mt=q("[data-meter]");
      if(mt){const m=s.meter;mt.hidden=!m;if(m){const [lab,val,max]=m;q("[data-ml]").textContent=lab;q("[data-mv]").textContent=val;
        const b=q("[data-mb]");b.style.width=Math.min(100,100*val/(max||val||1))+"%";mt.classList.toggle("hot",val>=(max||val)*.6);}}
    }
    function show(n){i=Math.max(0,Math.min(steps.length-1,n));const s=steps[i];
      q("[data-t]").textContent=s.t;q("[data-d]").innerHTML=s.d||"";q("[data-pos]").textContent=(i+1)+" / "+steps.length;q("[data-pos2]").textContent="STEP "+(i+1)+" / "+steps.length;
      back.disabled=i===0;next.disabled=i===steps.length-1;apply(s);}
    function stop(){if(timer){clearInterval(timer);timer=null;play.textContent="▶ Play";play.setAttribute("aria-pressed","false");}}
    back.onclick=()=>{stop();show(i-1);};next.onclick=()=>{stop();show(i+1);};
    play.onclick=()=>{if(timer)return stop();if(i>=steps.length-1)show(0);play.textContent="⏸ Pause";play.setAttribute("aria-pressed","true");
      timer=setInterval(()=>{if(i>=steps.length-1)stop();else show(i+1);},2600);};
    show(0);
    return {show,stop,get i(){return i;},n:steps.length};
  }
  function build(key){
    const spec=LABS[key],host=document.getElementById("dp-"+key);if(!spec||!host)return;
    const views=spec.views,many=views.length>1;
    host.classList.add("dp");
    host.innerHTML='<div class="dp-head"><span class="dp-pill">'+esc(spec.pill)+"</span>"+
      (many?'<div class="dp-tabs" role="tablist" aria-label="Views">'+views.map((v,i)=>'<button type="button" role="tab" data-tab="'+i+'" aria-selected="'+(i===0)+'">'+esc(v.name)+"</button>").join("")+"</div>":"")+"</div>"+
      views.map((v,i)=>viewHtml(key,i,v)).join("");
    const ctl=views.map((v,i)=>bindView(host.querySelector('.dp-view[data-v="'+i+'"]'),v,"dpm-"+key+"-"+i));
    let cur=0;
    const tab=t=>{ctl[cur].stop();cur=t;host.querySelectorAll(".dp-tabs [role=tab]").forEach(b=>b.setAttribute("aria-selected",String(+b.dataset.tab===t)));
      host.querySelectorAll(".dp-view").forEach(p=>p.hidden=+p.dataset.v!==t);};
    host.addEventListener("click",e=>{const b=e.target.closest(".dp-tabs [role=tab]");if(b)tab(+b.dataset.tab);});
    BUILT[key]={host,ctl,tab,get view(){return cur;}};
  }
  function add(map){Object.assign(LABS,map);Object.keys(map).forEach(build);}

  /* ---------- the 23 pattern glyphs (inner SVG markup, viewBox 0 0 48 48, drawn with currentColor) ---------- */
  const GLYPH={"Strategy":"<rect x='5' y='24' width='22' height='18' rx='3'/><circle cx='12' cy='33' r='1.5' fill='currentColor'/><circle cx='20' cy='33' r='1.5' fill='currentColor'/><rect x='10' y='14' width='12' height='10' rx='2' fill='currentColor' opacity='.25'/><rect x='10' y='14' width='12' height='10' rx='2'/><path d='M16 14V6'/><rect x='31' y='20' width='12' height='10' rx='2'/><path d='M35 30v5M39 30v5M37 20v-8'/>",
"Template Method":"<rect x='9' y='4' width='30' height='40' rx='3'/><path d='M15 11h18M15 26h14M15 40h10'/><rect x='15' y='15' width='18' height='7' rx='1.5' fill='currentColor' opacity='.25'/><rect x='15' y='15' width='18' height='7' rx='1.5'/><rect x='15' y='29' width='18' height='7' rx='1.5'/>",
"State":"<rect x='15' y='4' width='18' height='40' rx='6'/><circle cx='24' cy='13' r='4'/><circle cx='24' cy='24' r='4' fill='currentColor'/><circle cx='24' cy='35' r='4'/>",
"Factory Method":"<path d='M11 14 8 5h16l-3 9'/><rect x='5' y='14' width='26' height='21' rx='2'/><circle cx='18' cy='24.5' r='4.5'/><path d='M9 35v7M27 35v7M4 42h40M31 30h3'/><rect x='34' y='32' width='9' height='10' rx='1' fill='currentColor' opacity='.25'/><rect x='34' y='32' width='9' height='10' rx='1'/>",
"Builder":"<rect x='5' y='24' width='36' height='12' rx='2'/><circle cx='12' cy='40' r='3'/><circle cx='34' cy='40' r='3'/><rect x='9' y='16' width='11' height='8' rx='1'/><rect x='25' y='4' width='11' height='7' rx='1' fill='currentColor' opacity='.25'/><rect x='25' y='4' width='11' height='7' rx='1'/><path d='M30.5 13v8M27.5 18l3 3 3-3'/>",
"Singleton":"<path d='M9 6h30'/><path d='M24 6v7a3 3 0 0 1-6 0'/><circle cx='21' cy='21' r='5' fill='currentColor' opacity='.25'/><circle cx='21' cy='21' r='5'/><path d='M21 26v17M21 35h5M21 40h4'/>",
"Prototype":"<path d='M16 11V8a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2h-6' stroke-dasharray='3 3'/><rect x='8' y='12' width='24' height='30' rx='2'/><circle cx='15' cy='20' r='3' fill='currentColor' opacity='.25'/><circle cx='15' cy='20' r='3'/><path d='M13 28h14M13 34h10'/>",
"Abstract Factory":"<path d='M8 10V5h4v5M30 10V5h4v5'/><rect x='5' y='10' width='16' height='14' rx='2'/><rect x='27' y='10' width='16' height='14' rx='2'/><path d='M13 24v3M35 24v3'/><circle cx='13' cy='31' r='3.5' fill='currentColor' opacity='.25'/><circle cx='13' cy='31' r='3.5'/><circle cx='35' cy='31' r='3.5' fill='currentColor' opacity='.25'/><circle cx='35' cy='31' r='3.5'/><rect x='9.5' y='37' width='7' height='6' rx='1'/><rect x='31.5' y='37' width='7' height='6' rx='1'/>",
"Adapter":"<rect x='14' y='11' width='20' height='26' rx='5'/><path d='M14 18H9M14 30H9'/><circle cx='7.5' cy='18' r='2.5' fill='currentColor'/><circle cx='7.5' cy='30' r='2.5' fill='currentColor'/><rect x='34' y='16' width='9' height='3.5'/><rect x='34' y='28.5' width='9' height='3.5'/><path d='M19 24h9M25 21l3 3-3 3'/>",
"Decorator":"<rect x='5' y='5' width='38' height='38' rx='13'/><rect x='12' y='12' width='24' height='24' rx='8'/><circle cx='24' cy='24' r='4.5' fill='currentColor'/>",
"Proxy":"<rect x='25' y='6' width='17' height='36' rx='1'/><circle cx='37' cy='25' r='1.5' fill='currentColor'/><path d='M4 42h40'/><circle cx='13' cy='13' r='4'/><path d='M9 10h8'/><path d='M6 42V28a7 7 0 0 1 14 0v14' fill='currentColor' opacity='.25'/><path d='M6 42V28a7 7 0 0 1 14 0v14'/>",
"Facade":"<path d='M7 22V8h9v14M19.5 22V4h9v18M32 22V10h9v12'/><rect x='4' y='22' width='40' height='20' rx='2'/><rect x='17' y='27' width='14' height='9' rx='1' fill='currentColor' opacity='.25'/><rect x='17' y='27' width='14' height='9' rx='1'/>",
"Bridge":"<path d='M12 20v-9h24v9'/><circle cx='12' cy='29' r='9'/><circle cx='36' cy='29' r='9'/><path d='M12 29l4-5M36 29l4-5'/><circle cx='12' cy='29' r='1.8' fill='currentColor'/><circle cx='36' cy='29' r='1.8' fill='currentColor'/>",
"Observer":"<circle cx='24' cy='24' r='3' fill='currentColor'/><path d='M18.5 19.5a7 7 0 0 0 0 9M29.5 19.5a7 7 0 0 1 0 9M14 15a13 13 0 0 0 0 18M34 15a13 13 0 0 1 0 18M24 27v15M19 42h10'/><circle cx='7' cy='9' r='3' fill='currentColor' opacity='.25'/><circle cx='7' cy='9' r='3'/><circle cx='24' cy='7' r='3' fill='currentColor' opacity='.25'/><circle cx='24' cy='7' r='3'/><circle cx='41' cy='9' r='3' fill='currentColor' opacity='.25'/><circle cx='41' cy='9' r='3'/>",
"Command":"<path d='M5 10h38v10a4 4 0 0 0 0 8v10H5V28a4 4 0 0 0 0-8z'/><path d='M15 12v24' stroke-dasharray='2 3'/><path d='M21 18h15M21 24h15M21 30h10'/>",
"Chain of Responsibility":"<circle cx='12' cy='32' r='7'/><circle cx='24' cy='32' r='7'/><circle cx='36' cy='32' r='7'/><rect x='5' y='6' width='10' height='8' rx='1' fill='currentColor' opacity='.25'/><rect x='5' y='6' width='10' height='8' rx='1'/><path d='M19 10h22M37 6l4 4-4 4'/>",
"Mediator":"<rect x='18' y='14' width='12' height='8' rx='2' fill='currentColor' opacity='.25'/><rect x='18' y='14' width='12' height='8' rx='2'/><path d='M22 22l-1 20M26 22l1 20M15 42h18'/><path d='M18 15 10 10M30 15l8-5M18 21l-9 7M30 21l9 7' stroke-dasharray='2 3'/><circle cx='7' cy='8' r='3' fill='currentColor'/><circle cx='41' cy='8' r='3' fill='currentColor'/><circle cx='7' cy='30' r='3' fill='currentColor'/><circle cx='41' cy='30' r='3' fill='currentColor'/>",
"Memento":"<path d='M16 14l3-5h10l3 5'/><rect x='5' y='14' width='38' height='26' rx='4'/><circle cx='24' cy='27' r='7.5'/><circle cx='24' cy='27' r='3' fill='currentColor' opacity='.25'/><circle cx='24' cy='27' r='3'/><circle cx='37' cy='20' r='1.5' fill='currentColor'/>",
"Composite":"<rect x='19' y='4' width='10' height='8' rx='1.5' fill='currentColor' opacity='.25'/><rect x='19' y='4' width='10' height='8' rx='1.5'/><path d='M24 12v4H12v4M24 16h10v4M34 28v4h-7v4M34 32h7v4'/><rect x='7' y='20' width='10' height='8' rx='1.5'/><rect x='29' y='20' width='10' height='8' rx='1.5'/><circle cx='27' cy='39.5' r='3.5'/><circle cx='41' cy='39.5' r='3' fill='currentColor' opacity='.25'/><circle cx='41' cy='39.5' r='3'/>",
"Iterator":"<path d='M4 36h40M8 36v6M40 36v6'/><rect x='5' y='26' width='8' height='10' rx='1'/><rect x='15' y='26' width='8' height='10' rx='1' fill='currentColor' opacity='.25'/><rect x='15' y='26' width='8' height='10' rx='1'/><rect x='25' y='26' width='8' height='10' rx='1'/><rect x='35' y='26' width='8' height='10' rx='1'/><path d='M19 6v14M15 16l4 4 4-4M26 9h9M32 6l3 3-3 3'/>",
"Visitor":"<rect x='5' y='5' width='38' height='38' rx='2'/><path d='M24 5v8M24 21v5M5 26h22M37 26h6'/><path d='M12 17h20v17H13' stroke-dasharray='.5 4'/><circle cx='12' cy='17' r='2.2' fill='currentColor'/><path d='M16 31l-3 3 3 3'/>",
"Interpreter":"<circle cx='24' cy='9' r='5'/><path d='M21.5 9h5M24 6.5v5'/><path d='M20.5 12.5 14 21M27.5 12.5 32 19.5'/><rect x='6' y='21' width='10' height='8' rx='1.5' fill='currentColor' opacity='.25'/><rect x='6' y='21' width='10' height='8' rx='1.5'/><circle cx='34' cy='24' r='4.5'/><path d='M31.5 28 28 35M36.5 28 40 35'/><rect x='23' y='35' width='8' height='7' rx='1.5' fill='currentColor' opacity='.25'/><rect x='23' y='35' width='8' height='7' rx='1.5'/><rect x='36' y='35' width='8' height='7' rx='1.5'/>",
"Flyweight":"<circle cx='24' cy='8' r='4'/><path d='M22 12v3h4v-3'/><rect x='14' y='15' width='20' height='8' rx='2' fill='currentColor' opacity='.25'/><rect x='14' y='15' width='20' height='8' rx='2'/><path d='M24 26v3'/><circle cx='10' cy='37' r='5'/><circle cx='24' cy='37' r='5'/><circle cx='38' cy='37' r='5'/><circle cx='10' cy='37' r='1.6' fill='currentColor'/><circle cx='24' cy='37' r='1.6' fill='currentColor'/><circle cx='38' cy='37' r='1.6' fill='currentColor'/>"};

  /* ---------- the families map (P00 §2) and the pattern picker (course home): data from CATALOG ---------- */
  function families(host){
    if(!host)return;let tier=0;
    const draw=()=>{host.querySelector(".dp-fam").innerHTML=["c","s","b"].map(f=>'<div class="dp-fcol dp-f-'+f+'"><h4>'+FAM[f]+"<small>"+FAMD[f]+"</small></h4><ul>"+
      CATALOG.filter(p=>p.f===f).sort((a,b)=>a.t-b.t).map(p=>'<li class="'+(tier&&p.t!==tier?"off":"")+'"><b>'+esc(p.n)+'</b><i class="dp-t'+p.t+'" title="'+TIERN[p.t]+'">'+TIER[p.t]+"</i><span>"+esc(p.p)+"</span></li>").join("")+"</ul></div>").join("");
      host.querySelectorAll(".dp-chips button").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.tier===tier)));
      host.querySelector(".dp-fcount").textContent=tier?CATALOG.filter(p=>p.t===tier).length+" patterns: "+TIERN[tier]:"all 23 patterns";};
    host.innerHTML='<div class="dp-head"><span class="dp-pill">THE 23 PATTERNS · THREE FAMILIES</span><div class="dp-chips" role="group" aria-label="Filter by tier">'+
      [[0,"All"],[1,"★ asked constantly"],[2,"◆ asked often"],[3,"○ know the idea"]].map(([t,n])=>'<button type="button" data-tier="'+t+'">'+n+"</button>").join("")+'</div></div><p class="dp-fcount small muted"></p><div class="dp-fam"></div>';
    host.addEventListener("click",e=>{const b=e.target.closest(".dp-chips button");if(b){tier=+b.dataset.tier;draw();}});
    draw();
  }
  /* a pattern page exists once build-index has listed it (window.COURSE.pages) */
  const live=c=>!!(window.COURSE&&COURSE.pages.some(p=>p.key===c.k));
  function picker(host,base){
    if(!host)return;
    const list=CATALOG.slice().sort((a,b)=>a.t-b.t||CATALOG.indexOf(a)-CATALOG.indexOf(b));
    host.innerHTML='<label class="dp-pk-l" for="dpPick">The dealership has a problem…</label><select id="dpPick">'+list.map((p,i)=>'<option value="'+i+'">'+esc(p.p)+"</option>").join("")+'</select><div class="dp-pk-out" aria-live="polite"></div>';
    const sel=host.querySelector("select"),out=host.querySelector(".dp-pk-out");
    const draw=()=>{const p=list[+sel.value];out.innerHTML=glyph(p.n)+'<b>'+esc(p.n)+'</b><span class="dp-pk-m">'+FAM[p.f]+" · "+MOVE[p.mv][0]+" · "+TIER[p.t]+'</span><span class="dp-pk-s">'+(live(p)?'<a href="'+(base||"")+p.file+'">Open lesson '+p.k.slice(1)+" →</a>":"Lesson "+p.k.slice(1)+" · coming")+"</span>";};
    sel.onchange=draw;draw();
  }

  /* ---------- glyphs (one per pattern, 48 × 48, currentColor) ---------- */
  function glyph(n,cls){const g=GLYPH[n];return g?'<svg class="dp-gl'+(cls?" "+cls:"")+'" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+g+"</svg>":"";}

  /* ---------- progress, read from course.js's js1-done (sections marked "understood") ---------- */
  function progress(c){
    let done={};try{done=JSON.parse(localStorage.getItem("js1-done")||"{}")||{};}catch(e){}
    const pg=window.COURSE&&COURSE.pages.find(p=>p.key===c.k);if(!pg)return {d:0,n:0};
    return {d:pg.sections.filter(s=>done[s.id]).length,n:pg.sections.length};
  }
  const link=(n,base)=>{const c=BYN[n];return c&&live(c)?'<a href="'+(base||"")+c.file+'">'+esc(n)+"</a>":esc(n);};

  /* ---------- the pattern header on each pattern page: <div class="dp-pat" data-p="Strategy"></div> ---------- */
  function header(host){
    const c=BYN[host.dataset.p];if(!c)return;
    host.classList.add("dp-mv-"+c.mv);
    host.innerHTML='<div class="dp-pat-g">'+glyph(c.n)+'</div><div class="dp-pat-b"><div class="dp-pat-chips"><span class="dp-chip dp-chip-mv">Move · '+MOVE[c.mv][0]+'</span><span class="dp-chip">'+FAM[c.f]+
      '</span><span class="dp-chip" title="How often interviews ask about it">'+TIER[c.t]+" "+TIERN[c.t]+'</span><span class="dp-chip">'+DIFF[c.d]+'</span></div><p class="dp-pat-i"><b>Intent</b> '+esc(c.i)+"</p>"+
      '<p class="dp-pat-r small">Used with: '+c.rel.map(n=>link(n)).join(", ")+" · Often confused with: "+c.conf.map(n=>link(n)).join(", ")+"</p></div>";
  }

  /* ---------- Predict: <div class="dp-pred" data-ans="1"><p>question</p><ol><li>option…</li></ol><div class="dp-pe">why</div></div> ---------- */
  function predict(host){
    const ans=+host.dataset.ans,ol=host.querySelector("ol"),ex=host.querySelector(".dp-pe");if(!ol)return;
    const opts=[...ol.children].map(li=>li.innerHTML);
    const box=document.createElement("div");box.className="dp-pred-o";box.setAttribute("role","group");
    box.innerHTML=opts.map((o,i)=>'<button type="button" class="dp-po" data-i="'+i+'">'+o+"</button>").join("");
    ol.replaceWith(box);if(ex)ex.hidden=true;
    const fb=document.createElement("p");fb.className="dp-pred-f";fb.setAttribute("aria-live","polite");box.after(fb);
    box.addEventListener("click",e=>{const b=e.target.closest(".dp-po");if(!b||host.classList.contains("done"))return;const i=+b.dataset.i;
      host.classList.add("done");box.querySelectorAll(".dp-po").forEach(x=>{x.disabled=true;const k=+x.dataset.i;if(k===ans)x.classList.add("ok");else if(k===i)x.classList.add("no");});
      fb.textContent=i===ans?"Right.":"Not quite: the highlighted answer is the right one.";fb.className="dp-pred-f "+(i===ans?"qok":"qno");if(ex)ex.hidden=false;
      const r=document.createElement("button");r.type="button";r.className="btn dp-pred-r";r.textContent="Try again";fb.append(" ",r);
      r.onclick=()=>{host.classList.remove("done");box.querySelectorAll(".dp-po").forEach(x=>{x.disabled=false;x.classList.remove("ok","no");});fb.textContent="";fb.className="dp-pred-f";if(ex)ex.hidden=true;};});
  }

  /* ---------- Explain it back: <div class="dp-xb" data-k="p01"><p>prompt</p><div class="dp-xm">model answer</div></div>
     the draft and the self-rating are stored in js1-dpxb ({key:{r, t, draft}}) ---------- */
  const XB_KEY="js1-dpxb";
  const xbLoad=()=>{try{return JSON.parse(localStorage.getItem(XB_KEY)||"{}")||{};}catch(e){return {};}};
  const xbSave=o=>{try{localStorage.setItem(XB_KEY,JSON.stringify(o));}catch(e){}};
  const XB_MSG={got:"Saved: got it. Come back in a few days and explain it again.",almost:"Saved: almost. Re-read the model answer, then try again tomorrow.",not:"Saved: not yet. Step through the labs above again, then retry."};
  function explainBack(host){
    const k=host.dataset.k,model=host.querySelector(".dp-xm");if(!k||!model)return;
    model.hidden=true;const me=xbLoad()[k]||{};
    const ui=document.createElement("div");ui.className="dp-xb-ui";
    ui.innerHTML='<label class="small muted" for="dpxb-'+k+'">Your explanation (saved in this browser)</label><textarea id="dpxb-'+k+'" rows="4"></textarea>'+
      '<p><button type="button" class="btn pri" data-x="show">Compare with the model answer</button></p>';
    model.before(ui);
    const rate=document.createElement("div");rate.className="dp-xb-rate";rate.hidden=true;
    rate.innerHTML='<span class="small">How close were you?</span>'+[["got","Got it"],["almost","Almost"],["not","Not yet"]].map(([v,n])=>'<button type="button" class="btn" data-r="'+v+'" aria-pressed="false">'+n+"</button>").join("")+'<span class="dp-xb-s small muted" aria-live="polite"></span>';
    model.after(rate);
    const ta=ui.querySelector("textarea");ta.value=me.draft||"";
    const paint=()=>{const r=(xbLoad()[k]||{}).r;rate.querySelectorAll("[data-r]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.r===r)));
      rate.querySelector(".dp-xb-s").textContent=r?XB_MSG[r]:"";};
    const show=()=>{model.hidden=false;rate.hidden=false;paint();};
    if(me.r)show();
    ta.addEventListener("input",()=>{const a=xbLoad();a[k]=Object.assign(a[k]||{},{draft:ta.value});xbSave(a);});
    ui.querySelector("[data-x=show]").onclick=show;
    rate.addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(!b)return;const a=xbLoad();a[k]=Object.assign(a[k]||{},{r:b.dataset.r,t:Date.now()});xbSave(a);paint();});
  }

  /* ---------- Playground: DPL.play({key:{pill, init(), controls:[{id,type,label,options}], act?(state,id), render(state)}})
     into <div class="dp-play" id="dpp-KEY">. type: 'select' (options [[value,label]…]) | 'toggle' | 'button' (calls act(state,id)).
     render(state) → {h, nodes, edges, on?, good?, bad?, dim?, cur?, lines?, out, log?, alt?}: drawn with the same boxes and arrows as the labs. ---------- */
  const PLAYS={},PBUILT={};
  function playBuild(key){
    const spec=PLAYS[key],host=document.getElementById("dpp-"+key);if(!spec||!host)return;
    let st=spec.init();const mid="dpm-p-"+key;
    host.classList.add("dp");
    host.innerHTML='<div class="dp-head"><span class="dp-pill">'+esc(spec.pill)+'</span><span class="dp-play-tag">PLAYGROUND · you drive it</span></div><div class="dp-pctl">'+
      spec.controls.map(c=>{const id="dpp-"+key+"-"+c.id;
        if(c.type==="select")return '<label class="dp-psel"><span>'+esc(c.label)+'</span><select id="'+id+'" data-c="'+c.id+'">'+c.options.map(o=>'<option value="'+esc(o[0])+'">'+esc(o[1])+"</option>").join("")+"</select></label>";
        if(c.type==="toggle")return '<label class="dp-tog"><input type="checkbox" id="'+id+'" data-c="'+c.id+'"> '+esc(c.label)+"</label>";
        return '<button type="button" class="btn" data-c="'+c.id+'">'+esc(c.label)+"</button>";}).join("")+
      '<button type="button" class="btn" data-c="__reset">↺ Reset</button></div><div class="dp-stage" data-stage></div><pre class="dp-out" aria-live="polite" data-out></pre>';
    const sync=()=>host.querySelectorAll("select[data-c],input[data-c]").forEach(el=>{const v=st[el.dataset.c];if(el.type==="checkbox")el.checked=!!v;else if(v!=null)el.value=String(v);});
    function draw(){
      const r=spec.render(st)||{},B=(r.nodes||[]).map(box),N={};B.forEach(b=>N[b.id]=b);
      const kinds=[...new Set((r.edges||[]).map(e=>e[3]||"calls"))];
      host.querySelector("[data-stage]").innerHTML='<svg class="dp-svg" viewBox="0 0 600 '+(r.h||200)+'" role="img" aria-label="'+esc(r.alt||spec.pill)+'">'+markers(mid)+
        (r.edges||[]).map(e=>edgeSvg(e,N,mid)).join("")+B.map(nodeSvg).join("")+"</svg>"+legend(kinds);
      const svg=host.querySelector("svg");
      ["on","good","bad","dim","cur"].forEach(c=>(r[c]||[]).forEach(id=>{const n=svg.querySelector('.dp-nd[data-n="'+id+'"]');if(n)n.classList.add(c);}));
      if(r.lines)svg.querySelectorAll(".dp-ed").forEach(g=>{const on=r.lines==="all"||r.lines.includes(g.dataset.e);g.classList.toggle("on",on);g.classList.toggle("dim",!on&&r.lines!=="all");
        const p=g.querySelector("path"),at=p.hasAttribute("marker-start")?"marker-start":"marker-end";if(on)p.setAttribute(at,p.getAttribute(at).replace(/\)$/,"-on)"));});
      host.querySelector("[data-out]").textContent=(r.log||[]).concat(r.out!=null?[r.out]:[]).join("\n");
      sync();
    }
    host.addEventListener("change",e=>{const el=e.target.closest("[data-c]");if(!el)return;st[el.dataset.c]=el.type==="checkbox"?el.checked:el.value;draw();});
    host.addEventListener("click",e=>{const b=e.target.closest("button[data-c]");if(!b)return;if(b.dataset.c==="__reset")st=spec.init();else if(spec.act)spec.act(st,b.dataset.c);draw();});
    draw();
    PBUILT[key]={host,get state(){return st;},draw,set(k,v){st[k]=v;draw();},press(id){if(spec.act)spec.act(st,id);draw();},reset(){st=spec.init();draw();}};
  }
  function play(map){Object.assign(PLAYS,map);Object.keys(map).forEach(playBuild);}

  /* ---------- course home: the pattern map + catalogue (search, GoF family, move, tier, difficulty, status) ---------- */
  function map(host,base){
    if(!host)return;base=base||"";
    const F={q:"",f:"",mv:"",t:"",d:"",s:""};
    const sel=(id,label,opts)=>'<label><span>'+label+'</span><select data-f="'+id+'"><option value="">All</option>'+opts.map(([v,n])=>'<option value="'+v+'">'+esc(n)+"</option>").join("")+"</select></label>";
    host.innerHTML='<div class="dp-mapf"><label class="dp-mapq"><span>Search</span><input type="search" data-f="q" placeholder="name, problem or intent…"></label>'+
      sel("f","GoF family",Object.entries(FAM))+sel("mv","Move",Object.entries(MOVE).map(([k,v])=>[k,v[0]]))+sel("t","Interview",[[1,"★ asked constantly"],[2,"◆ asked often"],[3,"○ know the idea"]])+
      sel("d","Difficulty",[[1,"Beginner"],[2,"Intermediate"],[3,"Advanced"]])+sel("s","Status",[["none","Not started"],["part","In progress"],["done","Done"],["soon","Coming"]])+
      '</div><p class="dp-mapn small muted" aria-live="polite"></p><div class="dp-map"></div>';
    const grid=host.querySelector(".dp-map"),cnt=host.querySelector(".dp-mapn");
    const state=c=>{if(!live(c))return "soon";const p=progress(c);return p.d===0?"none":p.d>=p.n?"done":"part";};
    function draw(){
      const q=F.q.trim().toLowerCase();let shown=0;
      grid.innerHTML=Object.keys(MOVE).map((mv,mi)=>{
        const cards=CATALOG.filter(c=>c.mv===mv).map(c=>{
          const s=state(c),p=progress(c),hit=(!q||(c.n+" "+c.p+" "+c.i).toLowerCase().includes(q))&&(!F.f||c.f===F.f)&&(!F.mv||c.mv===F.mv)&&(!F.t||c.t===+F.t)&&(!F.d||c.d===+F.d)&&(!F.s||s===F.s);
          if(hit)shown++;
          const inner=glyph(c.n)+'<span class="dp-mc-n"><i>'+c.k.slice(1)+"</i>"+esc(c.n)+'</span><span class="dp-mc-m">'+FAM[c.f]+" · "+TIER[c.t]+" · "+DIFF[c.d]+"</span>"+
            '<span class="dp-mc-s">'+(s==="soon"?"coming":s==="done"?"✓ done":s==="part"?p.d+" / "+p.n+" sections":"not started")+"</span>"+(s==="soon"?"":'<span class="dp-mc-bar"><b style="width:'+(p.n?Math.round(100*p.d/p.n):0)+'%"></b></span>');
          return s==="soon"?'<div class="dp-mc st-soon'+(hit?"":" off")+'" data-n="'+esc(c.n)+'" tabindex="0">'+inner+"</div>":'<a class="dp-mc st-'+s+(hit?"":" off")+'" data-n="'+esc(c.n)+'" href="'+base+c.file+'">'+inner+"</a>";}).join("");
        return '<div class="dp-mcol dp-mv-'+mv+'"><h4><span>Move '+(mi+1)+" · "+MOVE[mv][0]+"</span><small>"+esc(MOVE[mv][1])+"</small></h4>"+cards+"</div>";}).join("");
      cnt.textContent=shown===23?"All 23 patterns. Hover or focus one to see the patterns it is used with and confused with.":shown+" of 23 patterns match.";
    }
    const rel=n=>{const c=BYN[n];grid.querySelectorAll(".dp-mc").forEach(el=>{const m=el.dataset.n;el.classList.toggle("rel",!!c&&c.rel.includes(m));el.classList.toggle("conf",!!c&&c.conf.includes(m));el.classList.toggle("me",m===n);});};
    const onF=e=>{const el=e.target.closest("[data-f]");if(el){F[el.dataset.f]=el.value;draw();}};
    host.addEventListener("input",onF);host.addEventListener("change",onF);
    ["mouseover","focusin"].forEach(t=>grid.addEventListener(t,e=>{const el=e.target.closest(".dp-mc");rel(el?el.dataset.n:null);}));
    grid.addEventListener("mouseleave",()=>rel(null));
    draw();
    return {draw,F};
  }

  /* ---------- markup widgets on every patterns page are bound when this file loads (scripts sit at the end of <body>) ---------- */
  document.querySelectorAll(".dp-pat[data-p]").forEach(header);
  document.querySelectorAll(".dp-pred").forEach(predict);
  document.querySelectorAll(".dp-xb[data-k]").forEach(explainBack);

  return {LABS,BUILT,PLAYS,PBUILT,CATALOG,BYN,FAM,MOVE,TIER,add,play,build,box,families,picker,map,glyph,header,predict,explainBack,progress,codeHtml};
})();
