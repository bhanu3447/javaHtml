/* Core: motion switch, helpers, multi-page index, editors and suggestions, Lessons 01–04 widgets, sidebar,
   learning layer, themes, mock interview, palette, motion v4, step-through runner, learn layer, checklist, feedback.
   Part of the course scripts. Every page loads, in this order: course-index.js, quiz-data.js, course.js, effects.js,
   labs-oop.js, labs-collections.js, labs-analogy.js, labs-sorting.js, practice-tools.js. They are classic scripts, so
   top-level const/let/function names are shared between them (course.js defines $, $$, esc, store, hl, FX, THM…). */
"use strict";
/* motion switch (v27): js1-motion "0" = every animation off. The page then behaves exactly as under the OS "reduce motion"
   setting, which every effect already honours: matchMedia reports reduced motion to all blocks, Web Animations finish instantly,
   and html.no-motion mirrors the reduced-motion CSS. The nav button #motionBtn flips it and reloads, because effects read it once at start. */
const MOTION_OFF=(()=>{try{return localStorage.getItem("js1-motion")==="0";}catch(e){return false;}})();
if(MOTION_OFF){document.documentElement.classList.add("no-motion");
  const mm=window.matchMedia.bind(window),still={matches:true,onchange:null,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){},dispatchEvent(){return false;}};
  window.matchMedia=q=>/prefers-reduced-motion/.test(q)&&/reduce/.test(q)?Object.assign({media:q},still):mm(q);
  const an=Element.prototype.animate;
  Element.prototype.animate=function(k,o){const opt=typeof o==="number"||o==null?{duration:0}:Object.assign({},o,{duration:0,delay:0,endDelay:0,iterations:1});return an.call(this,k,opt);};}
/* effects switch (2026-10-23): the decorations in effects.js (rider, tree, mascot, weather, sky, Halloween, festivals) and the
   ∞ background are paused by default. js1-fx "1" = on; the nav button ✨ (and Ctrl+K) flips it and reloads. When off, effects.js
   does not run at all and html.fx-off drops the empty mascot column. */
const FX_ON=(()=>{try{return localStorage.getItem("js1-fx")==="1";}catch(e){return false;}})();
if(!FX_ON)document.documentElement.classList.add("fx-off");
function setFx(on){try{localStorage.setItem("js1-fx",on?"1":"0");}catch(e){}location.reload();}
/* ui polish v38: one icon set for the nav (stroke icons instead of emoji glyphs, so every theme and OS renders them the same).
   navIcon(btn, name) swaps a button's content for the icon; ICO.x is the raw SVG for innerHTML. */
const ICO=(function(){const w=(d,extra)=>'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'+(extra||"")+'>'+d+'</svg>';
  return {menu:w('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    theme:w('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17A8.5 8.5 0 0 0 12 3.5z" fill="currentColor" stroke="none"/>'),
    search:w('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
    sparkles:w('<path d="M12 3.5 13.9 9.1 19.5 11 13.9 12.9 12 18.5 10.1 12.9 4.5 11 10.1 9.1z" fill="currentColor" stroke="none"/><path d="M19 17.5v3M17.5 19h3M5 3.5v3M3.5 5h3"/>'),
    pause:w('<rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/>'),
    play:w('<path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none"/>'),
    chev:w('<path d="m6 9 6 6 6-6"/>'),
    check:w('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    home:w('<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>')};})();
function navIcon(b,name){if(b){b.innerHTML=ICO[name];b.dataset.ico=name;}}
function setMotion(on){try{localStorage.setItem("js1-motion",on?"1":"0");}catch(e){}document.documentElement.classList.toggle("no-motion",!on);location.reload();}
/* ux pass v39: skip link for keyboard users (first tab stop on every page) */
(function(){const a=document.createElement("a");a.className="skip";a.href="#top";a.textContent="Skip to content";document.body.prepend(a);})();
(function(){const t=document.getElementById("theme");if(!t)return;const b=document.createElement("button");b.id="motionBtn";b.type="button";
  navIcon(b,MOTION_OFF?"play":"pause");const lab=MOTION_OFF?"Animations are off: click to turn them on":"Animations are on: click to turn them all off";
  b.title=lab;b.setAttribute("aria-label",lab);b.setAttribute("aria-pressed",String(MOTION_OFF));b.onclick=()=>setMotion(MOTION_OFF);t.before(b);
  const f=document.createElement("button");f.id="fxBtn";f.type="button";navIcon(f,"sparkles");
  const fl=FX_ON?"Effects are on (rider, tree, mascot, weather, background): click to pause them":"Effects are paused: click to turn on the rider, tree, mascot, weather and background";
  f.title=fl;f.setAttribute("aria-label",fl);f.setAttribute("aria-pressed",String(FX_ON));f.classList.toggle("fx-on",FX_ON);f.onclick=()=>setFx(!FX_ON);b.before(f);})();
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const v=c=>c===" "?"␣":c, q=c=>"'"+esc(v(c))+"'", dq=s=>'"'+esc(s)+'"';
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,x){try{localStorage.setItem(k,x)}catch(e){}}};

/* multi-page: COURSE (assets/data/course-index.js, built by scripts/build-index.mjs) lists every page, its sections and the
   interview questions. PAGE is this page's key (body data-page); ROOT is the course folder, so links work from any page. */
const COURSE=window.COURSE||{pages:[],qa:[]};
const PAGE=document.body.dataset.page||"";
const ROOT=new URL("../..",document.currentScript.src).href; /* site root: assets/js/course.js is two levels down */
const PAGES=COURSE.pages,SECP={};PAGES.forEach(p=>p.sections.forEach(s=>SECP[s.id]=p));
const LESSONS=PAGES.filter(p=>/^[lsp]\d/.test(p.key));
const pageUrl=(p,id)=>p.key===PAGE?(id?"#"+id:"#top"):ROOT+p.file+(id?"#"+id:"");
const secUrl=id=>SECP[id]?pageUrl(SECP[id],id):"#"+id;
const thisPage=PAGES.find(p=>p.key===PAGE);
/* course switcher (v36): the site holds two courses, Java (java/) and SQL (sql/), entered from the hub index.html, each with its own index
   (course-index.js / sql-index.js). body[data-course] says which one this page belongs to; the brand is logo + the course menu .csw (v38: a button that opens a styled menu of COURSES; its text span hidden), which
   jumps to the other course's home and remembers the choice (js1-course, read by index.html). */
const COURSE_ID=document.body.dataset.course||"java";
/* every course of the site, in hub order; a new course = one more row here + its folder + a card in index.html */
const COURSES=[{id:"java",name:"Java",sub:"Zero to Advanced · 8 lessons",file:"java/index.html",k:"J"},{id:"sql",name:"SQL",sub:"Zero to Advanced · S00 live",file:"sql/index.html",k:"S"},{id:"spring",name:"Spring Boot",sub:"Annotations lab · request lifecycle",file:"spring/index.html",k:"B"},{id:"patterns",name:"Design Patterns",sub:"Beginner to expert · Moves 1–2 live",file:"patterns/index.html",k:"P"}];
(function(){const b=$("nav .brand");if(!b)return;const cur=COURSES.find(c=>c.id===COURSE_ID)||COURSES[0];
  const w=document.createElement("div");w.className="csw";w.id="courseSel";w.dataset.value=cur.id;
  w.innerHTML='<button type="button" class="csw-b" aria-haspopup="menu" aria-expanded="false" aria-label="Switch course: '+cur.name+'"><span>'+cur.name+'</span>'+ICO.chev+'</button>'+
    '<div class="csw-m" role="menu" hidden>'+COURSES.map(c=>'<a role="menuitem" tabindex="-1" data-c="'+c.id+'" class="'+(c.id===cur.id?"on":"")+'" href="'+ROOT+c.file+'"><i class="k-'+c.id+'">'+c.k+'</i><span><b>'+c.name+'</b><small>'+c.sub+'</small></span>'+ICO.check+'</a>').join("")+
    '<div class="csw-h">All courses</div><a role="menuitem" tabindex="-1" href="'+ROOT+'index.html"><i class="k-hub">'+ICO.home+'</i><span><b>Course hub</b><small>Pick any course</small></span></a></div>';
  b.after(w);b.classList.add("sel");store.set("js1-course",COURSE_ID);
  const bt=$(".csw-b",w),m=$(".csw-m",w),items=()=>$$("a",m);
  const open=o=>{m.hidden=!o;bt.setAttribute("aria-expanded",String(o));if(o)(items().find(a=>a.classList.contains("on"))||items()[0]).focus();};
  bt.onclick=()=>open(m.hidden);
  m.addEventListener("click",e=>{const a=e.target.closest("a[data-c]");if(a)store.set("js1-course",a.dataset.c);});
  document.addEventListener("click",e=>{if(!m.hidden&&!w.contains(e.target))open(false);});
  w.addEventListener("keydown",e=>{const it=items(),i=it.indexOf(document.activeElement);
    if(e.key==="Escape"){open(false);bt.focus();}
    else if(e.key==="ArrowDown"){e.preventDefault();if(m.hidden)open(true);else it[(i+1)%it.length].focus();}
    else if(e.key==="ArrowUp"){e.preventDefault();if(!m.hidden)it[(i-1+it.length)%it.length].focus();}
    else if(e.key==="Home"&&!m.hidden){e.preventDefault();it[0].focus();}else if(e.key==="End"&&!m.hidden){e.preventDefault();it[it.length-1].focus();}});
  w.addEventListener("focusout",e=>{if(!w.contains(e.relatedTarget))open(false);});
  navIcon($("#tocBtn"),"menu");navIcon($("#theme"),"theme");})();

/* effects (v13): confetti bursts and showers made of small DOM pieces moved by the compositor (Web Animations), removed when done.
   FX.confetti(x, y, n, {dir, spread, speed, fall}) — dir/spread in radians, speed px/s-ish, fall px. FX.shower() rains across the screen. */
const FX=(function(){
  const still=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,x){try{localStorage.setItem(k,x)}catch(e){}}};
  const cols=()=>{const cs=getComputedStyle(document.documentElement);return [cs.getPropertyValue("--accent"),cs.getPropertyValue("--accent-2"),"#facc15","#22c55e","#f472b6","#38bdf8"].map(c=>c.trim()).filter(Boolean);};
  function confetti(x,y,n,o){o=o||{};if(still())return;const C=o.cols||cols(),dir=o.dir==null?-Math.PI/2:o.dir,spread=o.spread==null?Math.PI*1.2:o.spread,speed=o.speed||260,fall0=o.fall||380;
    for(let i=0;i<n;i++){const e=document.createElement("i");e.className="fx-cf";e.style.left=x+"px";e.style.top=y+"px";e.style.background=C[i%C.length];
      if(i%3===0)e.style.borderRadius="50%";else if(i%3===1){e.style.width="5px";e.style.height="11px";}document.body.appendChild(e);
      const a=dir+(Math.random()-.5)*spread,v=speed*(.5+Math.random()),dx=Math.cos(a)*v,dy=Math.sin(a)*v,fall=fall0*(.7+Math.random()*.6),r=(Math.random()-.5)*1080;
      e.animate([{transform:"translate(0px,0px) rotate(0deg)",opacity:1},
        {transform:"translate("+(dx*.7).toFixed(0)+"px,"+(dy*.7).toFixed(0)+"px) rotate("+(r*.5).toFixed(0)+"deg)",opacity:1,offset:.35},
        {transform:"translate("+dx.toFixed(0)+"px,"+(dy+fall).toFixed(0)+"px) rotate("+r.toFixed(0)+"deg)",opacity:0}],
        {duration:1100+Math.random()*800,easing:"cubic-bezier(.2,.6,.4,1)"}).onfinish=function(){e.remove();};}}
  function shower(){for(let k=0;k<7;k++)setTimeout(()=>confetti(innerWidth*(.08+.84*Math.random()),-12,16,{dir:Math.PI/2,spread:1,speed:140,fall:innerHeight*.9}),k*140);}
  return {confetti,shower};
})();
window.FX=FX;

/* lesson portal (v13): going to another page of the course, a glowing circle grows from where you clicked and fills the screen with
   that page's name; the new page opens with the circle shrinking away. Plain clicks on links only (modifier keys, new tabs and
   same-page anchors are left alone); off under reduced motion. */
(function(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const mk=()=>{const d=document.createElement("div");d.id="portal";d.setAttribute("aria-hidden","true");d.innerHTML='<i class="pt-c"></i><span class="pt-t"></span>';document.body.appendChild(d);return d;};
  const big=()=>Math.hypot(innerWidth,innerHeight)/40*1.15;
  document.addEventListener("click",e=>{if(e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    const a=e.target.closest("a[href]");if(!a||a.target||a.hasAttribute("download"))return;let u;try{u=new URL(a.href);}catch(x){return;}
    if(u.protocol!==location.protocol||u.pathname===location.pathname||!/\.html$/i.test(u.pathname))return;
    const p=PAGES.find(q=>{try{return new URL(ROOT+q.file).pathname===u.pathname;}catch(x){return false;}});if(!p)return;
    e.preventDefault();const d=mk(),c=$(".pt-c",d),t=$(".pt-t",d),x=e.clientX||innerWidth/2,y=e.clientY||innerHeight/2;
    c.style.left=x+"px";c.style.top=y+"px";t.textContent=p.name;
    c.animate([{transform:"translate(-50%,-50%) scale(0)"},{transform:"translate(-50%,-50%) scale("+big().toFixed(1)+")"}],{duration:560,easing:"cubic-bezier(.65,0,.35,1)",fill:"forwards"});
    t.animate([{opacity:0,transform:"translate(-50%,-50%) scale(.92)"},{opacity:1,transform:"translate(-50%,-50%) scale(1)"}],{duration:320,delay:280,easing:"ease-out",fill:"forwards"});
    try{sessionStorage.setItem("js1-portal",JSON.stringify({n:p.name}));}catch(x){}
    setTimeout(()=>{location.href=a.href;},600);});
  let arr=null;try{arr=JSON.parse(sessionStorage.getItem("js1-portal")||"null");sessionStorage.removeItem("js1-portal");}catch(x){}
  if(arr){const d=mk(),c=$(".pt-c",d),t=$(".pt-t",d);c.style.left=innerWidth/2+"px";c.style.top=innerHeight/2+"px";t.textContent=arr.n;t.style.opacity="1";
    c.animate([{transform:"translate(-50%,-50%) scale("+big().toFixed(1)+")"},{transform:"translate(-50%,-50%) scale(0)"}],{duration:680,delay:140,easing:"cubic-bezier(.65,0,.35,1)",fill:"both"}).onfinish=()=>d.remove();
    t.animate([{opacity:1},{opacity:0}],{duration:260,delay:80,fill:"forwards"});}
  addEventListener("pageshow",e=>{if(e.persisted){const d=$("#portal");if(d)d.remove();}});
})();



/* theme */
const th=store.get("js1-theme"); if(th) document.documentElement.dataset.theme=th;
$("#theme").onclick=()=>{const cur=document.documentElement.dataset.theme||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");const n=cur==="dark"?"light":"dark";document.documentElement.dataset.theme=n;store.set("js1-theme",n);};

/* nav highlight */
const links=$$("nav a");
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle("on",a.hash==="#"+e.target.id))}),{rootMargin:"-40% 0px -55% 0px"});
$$("section,.band").forEach(s=>io.observe(s));

/* lesson 02: object-count spoilers */
$$(".spoil").forEach(s=>{s.tabIndex=0;s.title="Click to reveal";s.onclick=s.onkeydown=e=>{if(e.type==="keydown"&&e.key!=="Enter"&&e.key!==" ")return;s.classList.add("show");s.removeAttribute("tabindex");};});

/* lesson 02: StringBuilder capacity simulator */
(function(){
  const cells=$("#capCells"),st=$("#capStat"),msg=$("#capMsg");let txt="",cap=16;
  if(!cells)return;
  const draw=m=>{cells.innerHTML=Array.from({length:cap},(_,i)=>'<span class="cb'+(i<txt.length?" on":"")+'">'+(i<txt.length?esc(v(txt[i])):"")+"</span>").join("");
    st.innerHTML="<span>length() <b>"+txt.length+"</b></span><span>capacity() <b>"+cap+"</b></span><span>free <b>"+(cap-txt.length)+"</b></span>";msg.innerHTML=m;};
  const reset=()=>{const k=$("#capStart").value;txt=k==="s"?"abc":"";cap=k==="5"?5:16+txt.length;
    draw(k==="d"?"Default capacity is <b>16</b>.":k==="s"?"Capacity = 16 + \"abc\".length() = <b>19</b>.":"You asked for exactly <b>5</b>.");};
  $("#capApp").onclick=()=>{const a=$("#capIn").value;if(!a){draw("Type some text to append.");return;}
    const need=txt.length+a.length;if(need>300){draw("Demo limit reached. Press Reset.");return;}let m;
    if(need>cap){const old=cap,g=old*2+2;cap=Math.max(g,need);m="Needed <b>"+need+"</b>, but the capacity was <b>"+old+"</b>. It grew to <code>"+old+" * 2 + 2 = "+g+"</code>"+(cap>g?". That was still too small, so it used exactly <b>"+need+"</b>":"")+", and the old array was <b>copied</b> into the new one.";}
    else m="It fits, so there is no copy: append() writes into the spare room. That is why append is O(1) amortised.";
    txt+=a;draw(m);};
  $("#capTrim").onclick=()=>{cap=txt.length;draw("trimToSize() shrinks the capacity to the length (<b>"+cap+"</b>). The next append must grow again.");};
  $("#capReset").onclick=reset;$("#capStart").onchange=reset;reset();
})();

/* cells */
function cells(list,ptr){
  if(!list.length) return '<div class="rq-empty">empty — length 0</div>';
  return '<div class="cells">'+list.map((c,k)=>'<div class="cw"><div class="pt">'+((ptr&&ptr[k])||[]).join(" ")+'</div><div class="c '+(c.s||"")+(c.ch===" "?" sp":"")+'">'+(c.ch===""?"&nbsp;":esc(v(c.ch)))+'</div><div class="i">'+k+'</div></div>').join("")+'</div>';
}
$$("[data-cells]").forEach(el=>{
  const s=el.dataset.cells, st=el.dataset.st||"", fix=(el.dataset.fix||"").split(",").filter(Boolean).map(Number);
  el.outerHTML=cells(s.split("").map((ch,k)=>({ch,s:fix.includes(k)?"fix":st})));
});

/* lessons 03–04: plain array diagrams */
$$("[data-arr]").forEach(el=>{el.outerHTML=cells(el.dataset.arr.split(",").map(ch=>({ch,s:""})),{0:["first"],[el.dataset.arr.split(",").length-1]:["last"]});});

/* lessons 03–04: algorithm stepper. A frame = {a: values, st: {i: class}, p: {i: [labels]}, v: "vars html", m: "message"} */
const FR=(a,st,p,m,vv)=>({a:a.slice(),st:Object.assign({},st),p:p||{},m,v:vv||""});
const PT=(...xs)=>{const o={};for(let k=0;k<xs.length;k+=2){const i=xs[k];if(i==null||i<0)continue;(o[i]=o[i]||[]).push(xs[k+1]);}return o;};
const RG=(o,l,r,c)=>{for(let i=l;i<=r;i++)o[i]=c;return o;};
const VS=o=>Object.entries(o).map(([k,x])=>"<span>"+k+" <b>"+x+"</b></span>").join("");
function stepper(root,ALGOS,parse){
  const sel=$(".av-alg",root),inp=$(".av-in",root),kin=$(".av-k",root),klab=$(".av-klab",root),stage=$(".av-stage",root),vars=$(".av-vars",root),msg=$(".av-msg",root),ct=$(".av-ct",root);
  let fr=[],k=0,timer=null;
  sel.innerHTML=ALGOS.map((x,i)=>'<option value="'+i+'">'+esc(x.n)+"</option>").join("");
  const stop=()=>{clearInterval(timer);timer=null;$('[data-a="play"]',root).textContent="▶ Play";};
  const draw=()=>{const f=fr[k];stage.innerHTML=cells(f.a.map((ch,i)=>({ch:String(ch),s:f.st[i]||""})),f.p);vars.innerHTML=f.v;msg.innerHTML=f.m;ct.textContent="step "+(k+1)+" / "+fr.length;
    $('[data-a="prev"]',root).disabled=k===0;$('[data-a="next"]',root).disabled=k===fr.length-1;};
  const build=()=>{stop();const A=ALGOS[+sel.value];const x=parse(inp.value,A);
    if(klab)klab.style.display=A.k==null?"none":"";
    fr=x.err?[FR([],{},{},x.err)]:A.run(x.v,kin?+kin.value:0);k=0;draw();};
  const load=()=>{const A=ALGOS[+sel.value];inp.value=A.d;if(kin&&A.k!=null){kin.value=A.k;klab.firstChild.textContent=A.kl+" ";}build();};
  sel.onchange=load;inp.onchange=build;if(kin)kin.onchange=build;
  root.onclick=e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
    if(a==="prev"&&k>0){stop();k--;draw();}else if(a==="next"&&k<fr.length-1){stop();k++;draw();}else if(a==="reset"){build();}
    else if(a==="play"){if(timer){stop();return;}if(k===fr.length-1)k=0;b.textContent="❚❚ Pause";timer=setInterval(()=>{if(k>=fr.length-1){stop();return;}k++;draw();},750);draw();}};
  load();
}

/* String algorithms (Lesson 03) */
const S_ALG=[
 {n:"Reverse: two pointers",d:"hello",run(s){const a=s.split(""),F=[],done={};let i=0,j=a.length-1;
   F.push(FR(a,{},PT(i,"i",j,"j"),"Copy the String into a <code>char[]</code>. Put <b>i</b> at the start and <b>j</b> at the end."));
   while(i<j){F.push(FR(a,Object.assign({},done,{[i]:"read",[j]:"read"}),PT(i,"i",j,"j"),"Swap <code>a["+i+"]</code> ("+q(a[i])+") and <code>a["+j+"]</code> ("+q(a[j])+")."));
     const t=a[i];a[i]=a[j];a[j]=t;done[i]=done[j]="done";F.push(FR(a,Object.assign({},done,{[i]:"swap",[j]:"swap"}),PT(i,"i",j,"j"),"Swapped. Now move <b>i</b> right and <b>j</b> left."));i++;j--;}
   if(i===j)done[i]="done";F.push(FR(a,RG({},0,a.length-1,"done"),{},"<b>i ≥ j</b>, so stop. <code>new String(a)</code> → "+dq(a.join(""))+". "+Math.floor(s.length/2)+" swaps, O(n) time."));return F;}},
 {n:"Palindrome: two pointers",d:"racecar",run(s){const a=s.split(""),F=[],ok={};let i=0,j=a.length-1;
   F.push(FR(a,{},PT(i,"i",j,"j"),"Compare from both ends. No reversed copy is needed, so the extra space is O(1)."));
   while(i<j){if(a[i]!==a[j]){F.push(FR(a,Object.assign({},ok,{[i]:"miss",[j]:"miss"}),PT(i,"i",j,"j"),q(a[i])+" ≠ "+q(a[j])+", so it is <b>not a palindrome</b>. Return false."));return F;}
     ok[i]=ok[j]="done";F.push(FR(a,Object.assign({},ok,{[i]:"win",[j]:"win"}),PT(i,"i",j,"j"),q(a[i])+" = "+q(a[j])+". Move both pointers inward."));i++;j--;}
   F.push(FR(a,RG({},0,a.length-1,"done"),{},"The pointers met with no mismatch: "+dq(s)+" <b>is a palindrome</b>."));return F;}},
 {n:"Longest unique substring: sliding window",d:"abcabcbb",run(s){const a=s.split(""),F=[],last={};let L=0,best=0,bl=0;
   for(let r=0;r<a.length;r++){const c=a[r];let m;
     if(c in last&&last[c]>=L){const old=L;L=last[c]+1;m=q(c)+" is already in the window (index "+last[c]+"), so <b>left</b> jumps from "+old+" to "+L+".";}
     else m="Add "+q(c)+". No repeat in the window.";
     last[c]=r;if(r-L+1>best){best=r-L+1;bl=L;m+=" New best: <b>"+best+"</b>.";}
     F.push(FR(a,Object.assign(RG({},L,r,"win"),{[r]:"read"}),PT(L,"left",r,"right"),m,VS({window:dq(s.slice(L,r+1)),"size":r-L+1,best:best})));}
   F.push(FR(a,RG({},bl,bl+best-1,"done"),{},"Done in one pass, O(n). The longest substring without repeats is "+dq(s.slice(bl,bl+best))+", length <b>"+best+"</b>.",VS({best:best})));return F;}},
 {n:"First unique character: count, then scan",d:"swiss",run(s){const a=s.split(""),F=[],cnt={};
   for(let i=0;i<a.length;i++){cnt[a[i]]=(cnt[a[i]]||0)+1;F.push(FR(a,{[i]:"read"},PT(i,"i"),"Pass 1: count "+q(a[i])+".",VS(Object.fromEntries(Object.entries(cnt).map(([c,n])=>["'"+esc(v(c))+"'",n])))));}
   for(let i=0;i<a.length;i++){const one=cnt[a[i]]===1;F.push(FR(a,{[i]:one?"win":"miss"},PT(i,"i"),"Pass 2: "+q(a[i])+" has count "+cnt[a[i]]+(one?", so the answer is <b>"+q(a[i])+"</b>.":". Skip it.")));if(one)return F;}
   F.push(FR(a,{},{},"Every character repeats, so return a marker such as <code>'_'</code>."));return F;}}
];
/* Array algorithms (Lesson 04) */
const A_ALG=[
 {n:"Binary search (sorted)",d:"3,7,19,25,42,50,61",k:42,kl:"target",run(a,t){a=a.slice().sort((x,y)=>x-y);const F=[];let lo=0,hi=a.length-1;
   F.push(FR(a,{},PT(lo,"lo",hi,"hi"),"The array must be sorted (it was sorted for you). Search for <b>"+t+"</b>."));
   while(lo<=hi){const mid=lo+((hi-lo)>>1),st=RG({},lo,hi,"win");st[mid]="read";
     if(a[mid]===t){st[mid]="swap";F.push(FR(a,st,PT(lo,"lo",mid,"mid",hi,"hi"),"<code>a["+mid+"] = "+a[mid]+"</code>. <b>Found at index "+mid+"</b>.",VS({lo,mid,hi})));return F;}
     const go=a[mid]<t;F.push(FR(a,st,PT(lo,"lo",mid,"mid",hi,"hi"),"<code>a["+mid+"] = "+a[mid]+"</code> is "+(go?"less":"greater")+" than "+t+", so drop the "+(go?"left":"right")+" half.",VS({lo,mid,hi})));
     if(go)lo=mid+1;else hi=mid-1;}
   F.push(FR(a,{},PT(lo,"here"),"Not found. The range is empty. Return <code>-(lo + 1) = "+(-(lo+1))+"</code>, which encodes the insertion point "+lo+".",VS({lo,hi})));return F;}},
 {n:"Pair with sum (two pointers, sorted)",d:"1,3,4,6,9,11",k:10,kl:"target",run(a,t){a=a.slice().sort((x,y)=>x-y);const F=[];let i=0,j=a.length-1;
   while(i<j){const s=a[i]+a[j];
     if(s===t){F.push(FR(a,{[i]:"swap",[j]:"swap"},PT(i,"i",j,"j"),a[i]+" + "+a[j]+" = "+t+". <b>Found the pair</b> at ["+i+", "+j+"].",VS({sum:s})));return F;}
     F.push(FR(a,{[i]:"read",[j]:"read"},PT(i,"i",j,"j"),a[i]+" + "+a[j]+" = "+s+(s<t?" is too small, so move <b>i</b> right (to a bigger value).":" is too big, so move <b>j</b> left (to a smaller value)."),VS({sum:s,target:t})));
     if(s<t)i++;else j--;}
   F.push(FR(a,{},{},"The pointers met. No pair adds up to "+t+"."));return F;}},
 {n:"Max sum of k in a row (sliding window)",d:"2,1,5,1,3,2",k:3,kl:"k",run(a,k){const F=[];if(k<1||k>a.length)return[FR(a,{},{},"Choose k between 1 and "+a.length+".")];let s=0;for(let i=0;i<k;i++)s+=a[i];let best=s,bi=0;
   F.push(FR(a,RG({},0,k-1,"win"),PT(0,"L",k-1,"R"),"Sum the first window: <b>"+s+"</b>.",VS({sum:s,best})));
   for(let i=k;i<a.length;i++){s+=a[i]-a[i-k];let m="Add "+a[i]+", drop "+a[i-k]+". The new sum is <b>"+s+"</b>.";if(s>best){best=s;bi=i-k+1;m+=" New best.";}
     F.push(FR(a,Object.assign(RG({},i-k+1,i,"win"),{[i-k]:"fix"}),PT(i-k+1,"L",i,"R"),m,VS({sum:s,best})));}
   F.push(FR(a,RG({},bi,bi+k-1,"done"),{},"Best window starts at index "+bi+", sum <b>"+best+"</b>. O(n) instead of O(n·k).",VS({best})));return F;}},
 {n:"Max subarray (Kadane)",d:"-2,1,-3,4,-1,2,1,-5,4",run(a){const F=[];let cur=a[0],best=a[0],cs=0,bs=0,be=0;
   F.push(FR(a,{0:"win"},PT(0,"i"),"Start with <code>cur = best = "+a[0]+"</code>.",VS({cur,best})));
   for(let i=1;i<a.length;i++){let m;const ext=cur+a[i];if(a[i]>ext){cur=a[i];cs=i;m="Restart here: "+a[i]+" on its own is bigger than extending the run ("+ext+").";}else{cur=ext;m="Extend the run: cur + "+a[i]+" = "+cur+".";}
     if(cur>best){best=cur;bs=cs;be=i;m+=" New best <b>"+best+"</b>.";}
     F.push(FR(a,Object.assign(RG({},cs,i,"win"),{[i]:"read"}),PT(cs,"start",i,"i"),m,VS({cur,best})));}
   F.push(FR(a,RG({},bs,be,"done"),{},"The best subarray is index "+bs+".."+be+", sum <b>"+best+"</b>. O(n), O(1).",VS({best})));return F;}},
 {n:"Move zeros (read/write pointers)",d:"0,1,0,3,12",run(a){a=a.slice();const F=[];let w=0;
   for(let r=0;r<a.length;r++){if(a[r]!==0){a[w]=a[r];F.push(FR(a,Object.assign(RG({},0,w-1,"done"),{[w]:"swap"}),PT(w,"w",r,"r"),a[r]+" is not zero, so write it at index "+w+" and move <b>w</b>."));w++;}
     else F.push(FR(a,Object.assign(RG({},0,w-1,"done"),{[r]:"miss"}),PT(w,"w",r,"r"),"Zero: skip it. Only <b>r</b> moves."));}
   const keep=w;while(w<a.length)a[w++]=0;F.push(FR(a,Object.assign(RG({},0,keep-1,"done"),RG({},keep,a.length-1,"fix")),{},"Fill the rest with zeros. The order of the non-zero values is kept. O(n), in place."));return F;}},
 {n:"Rotate right by k (three reversals)",d:"1,2,3,4,5,6,7",k:3,kl:"k",run(a,k){a=a.slice();const n=a.length,F=[];k=((k%n)+n)%n;const rev=(i,j)=>{while(i<j){const t=a[i];a[i++]=a[j];a[j--]=t;}};
   F.push(FR(a,{},{},"Rotate right by <b>"+k+"</b> (k % n) with three reversals, in place."));
   rev(0,n-1);F.push(FR(a,RG({},0,n-1,"read"),{},"1. Reverse the whole array."));
   rev(0,k-1);F.push(FR(a,RG({},0,k-1,"swap"),PT(0,"0",k-1,"k-1"),"2. Reverse the first k elements."));
   rev(k,n-1);F.push(FR(a,RG({},k,n-1,"swap"),PT(k,"k",n-1,"n-1"),"3. Reverse the rest."));
   F.push(FR(a,RG({},0,n-1,"done"),{},"Done: O(n) time, O(1) extra space."));return F;}},
 {n:"Dutch flag: sort 0s, 1s and 2s",d:"2,0,2,1,1,0",run(a){a=a.slice();const F=[];let lo=0,mid=0,hi=a.length-1;
   const show=m=>F.push(FR(a,Object.assign(RG({},0,lo-1,"done"),RG({},hi+1,a.length-1,"done")),PT(lo,"lo",mid,"mid",hi,"hi"),m));
   show("Everything before <b>lo</b> is 0, everything after <b>hi</b> is 2, and <b>mid</b> scans the unknown part.");
   while(mid<=hi){if(a[mid]===0){const t=a[lo];a[lo]=a[mid];a[mid]=t;lo++;mid++;show("It was 0: swap it to <b>lo</b>, then move lo and mid.");}
     else if(a[mid]===1){mid++;show("It was 1: it is already in the middle. Move mid.");}
     else{const t=a[hi];a[hi]=a[mid];a[mid]=t;hi--;show("It was 2: swap it to <b>hi</b> and move hi. Don't move mid: the value swapped in is unchecked.");}}
   F.push(FR(a,RG({},0,a.length-1,"done"),{},"Sorted in one pass, O(n), O(1)."));return F;}}
];
const parseStr=(t)=>{const s=t.trim();return s?{v:s.slice(0,24)}:{err:"Type some text."};};
const parseNums=(t,A)=>{const xs=t.split(/[\s,]+/).filter(Boolean).map(Number);if(!xs.length||xs.some(x=>!Number.isInteger(x)))return{err:"Type whole numbers separated by commas."};
  if(xs.length>16)return{err:"Use at most 16 numbers."};if(A.n.startsWith("Dutch")&&xs.some(x=>x<0||x>2))return{err:"Use only 0, 1 and 2."};return{v:xs};};
if($("#sviz"))stepper($("#sviz"),S_ALG,parseStr);
if($("#aviz"))stepper($("#aviz"),A_ALG,parseNums);

/* code blocks */
const KW=new Set("public private static void class return if else for while new int char boolean null true false import final break".split(" "));
function hl(src){
  const re=/(\/\/[^\n]*)|("(?:\\.|[^"\\\n])*")|('(?:\\.|[^'\\\n])+')|\b([A-Za-z_]\w*)\b|\b(\d+)\b/g;let o="",l=0,m;
  while((m=re.exec(src))){o+=esc(src.slice(l,m.index));l=re.lastIndex;const t=m[0];
    if(m[1])o+='<span class="cm">'+esc(t)+"</span>";else if(m[2]||m[3])o+='<span class="s">'+esc(t)+"</span>";
    else if(m[4])o+=KW.has(t)?'<span class="k">'+t+"</span>":/^[A-Z]/.test(t)?'<span class="t">'+t+"</span>":src[l]==="("?'<span class="f">'+t+"</span>":t;
    else o+='<span class="n">'+t+"</span>";}
  return o+esc(src.slice(l));
}
/* example cards (v42): <pre data-ex> holds a short snippet with its outputs in comments; shown static and highlighted, no editor.
   Must run after hl() and KW exist (a classic script: const bindings are in the TDZ until their line runs). */
$$("pre[data-ex]").forEach(p=>{p.innerHTML=hl(p.textContent.replace(/^\n+/,"").replace(/\s+$/,""));});
/* ---------- code blocks → live editors with suggestions ---------- */
/* CodeMirror loads in the background (v12): the pages no longer have blocking <script> tags for it, so on a slow network the page,
   its animations and the sidebar start at once; code shows highlighted until the editor library arrives, then upgrades. */
let CMok=false;
const CM_BASE="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/";
const cmReady=new Promise(res=>{
  const add=src=>new Promise((ok,no)=>{const sc=document.createElement("script");sc.src=CM_BASE+src;sc.onload=ok;sc.onerror=no;document.head.appendChild(sc);});
  add("codemirror.min.js").then(()=>Promise.all(["mode/clike/clike.min.js","addon/hint/show-hint.min.js","addon/edit/matchbrackets.min.js","addon/edit/closebrackets.min.js",
    "addon/selection/active-line.min.js","addon/comment/comment.min.js"].map(add))).then(()=>{CMok=!!(window.CodeMirror&&CodeMirror.showHint);res(CMok);},()=>res(false));});
const SUG={on:store.get("js1-suggest")!=="0",boxes:[]};
function setSug(v){SUG.on=v;store.set("js1-suggest",v?"1":"0");SUG.boxes.forEach(b=>{b.checked=v;});}

/* Java knowledge: [name, params (null = field), returns, what it does] */
const M=a=>a.map(([n,p,r,d])=>({label:n,kind:p===null?"f":"m",params:p,sig:p===null?"":"("+p+")",ret:r,doc:d}));
const SBM=[["append","x","StringBuilder","Adds x to the end"],["reverse","","StringBuilder","Reverses in place and returns this"],["toString","","String","Builds the final String"],["insert","int offset, x","StringBuilder","Inserts x at offset"],["deleteCharAt","int index","StringBuilder","Removes one char"],["setCharAt","int index, char c","void","Replaces one char"],["charAt","int index","char","Char at index"],["length","","int","Current length"],["setLength","int newLength","void","Truncates or pads"],["indexOf","String s","int","First index of s, or -1"],["delete","int start, int end","StringBuilder","Removes [start, end)"],["replace","int start, int end, String s","StringBuilder","Replaces [start, end)"],["isEmpty","","boolean","length() == 0"],["capacity","","int","Allocated size"]];
const MEM={
  String:M([["length","","int","Number of chars"],["charAt","int index","char","Char at index (0-based)"],["toCharArray","","char[]","Copy into a new char[]"],["substring","int begin, int end","String","Chars in [begin, end)"],["isEmpty","","boolean","length() == 0"],["isBlank","","boolean","Empty or only whitespace"],["trim","","String","Removes leading/trailing spaces"],["strip","","String","Unicode-aware trim"],["split","String regex","String[]","Split around regex matches"],["equals","Object other","boolean","Compare content (not ==)"],["equalsIgnoreCase","String other","boolean","Compare ignoring case"],["indexOf","String s","int","First index of s, or -1"],["lastIndexOf","String s","int","Last index of s, or -1"],["contains","CharSequence s","boolean","Does it contain s?"],["startsWith","String prefix","boolean","Starts with prefix?"],["endsWith","String suffix","boolean","Ends with suffix?"],["toUpperCase","","String","New upper-case String"],["toLowerCase","","String","New lower-case String"],["replace","char oldChar, char newChar","String","Replace every match"],["concat","String s","String","New String; original unchanged"],["repeat","int count","String","Repeat count times"],["compareTo","String other","int","Lexicographic order"],["chars","","IntStream","Stream of char values"],["codePointAt","int index","int","Unicode code point"],["matches","String regex","boolean","Whole String matches regex?"],["hashCode","","int","Cached hash"]]),
  StringBuilder:M(SBM),StringBuffer:M(SBM),
  PrintStream:M([["println","x","void","Print, then newline"],["print","x","void","Print without newline"],["printf","String format, args...","PrintStream","Formatted print"]]),
  "[]":M([["length",null,"int","Array length (a field: no ())"],["clone","","same[]","Shallow copy of the array"]]),
  Object:M([["equals","Object other","boolean","Content equality"],["hashCode","","int","Hash code"],["toString","","String","Text form"],["getClass","","Class","Runtime class"]])
};
const STAT={
  String:M([["valueOf","x","String","Any value → String"],["join","CharSequence sep, elements...","String","Join with a separator"],["format","String format, args...","String","Formatted String"]]),
  Character:M([["isLetter","char c","boolean","a–z, A–Z and other letters"],["isDigit","char c","boolean","0–9 and other digits"],["isLetterOrDigit","char c","boolean","Letter or digit?"],["isWhitespace","char c","boolean","Space, tab, newline…"],["isUpperCase","char c","boolean","Upper case?"],["isLowerCase","char c","boolean","Lower case?"],["toUpperCase","char c","char","Upper-case version"],["toLowerCase","char c","char","Lower-case version"],["getNumericValue","char c","int","'7' → 7"]]),
  Arrays:M([["toString","array","String","\"[a, b, c]\""],["sort","array","void","Sorts in place"],["fill","array, value","void","Set every slot"],["copyOf","array, newLength","array","Copy, resized"],["copyOfRange","array, from, to","array","Copy of [from, to)"],["equals","a, b","boolean","Same contents?"],["asList","items...","List","Fixed-size list view"],["stream","array","Stream","Stream over the array"],["binarySearch","sortedArray, key","int","Index, or -(insertion point) - 1"],["deepToString","array","String","Nested arrays as text"],["deepEquals","a, b","boolean","Nested contents equal?"],["setAll","array, i -> value","void","Fill from the index"],["hashCode","array","int","Content-based hash"],["compare","a, b","int","Lexicographic compare (9+)"],["mismatch","a, b","int","First differing index, or -1 (9+)"],["parallelSort","array","void","Multi-threaded sort"]]),
  Math:M([["max","a, b","int","Larger value"],["min","a, b","int","Smaller value"],["abs","x","int","Absolute value"],["pow","a, b","double","a to the power b"],["sqrt","x","double","Square root"],["floorMod","x, y","int","Mod that is never negative"]]),
  System:M([["out",null,"PrintStream","Standard output"],["err",null,"PrintStream","Standard error"],["arraycopy","src, srcPos, dest, destPos, length","void","Fast array copy"],["currentTimeMillis","","long","Wall-clock ms"],["nanoTime","","long","For timing code"],["lineSeparator","","String","OS newline"]]),
  Objects:M([["requireNonNull","obj","T","Throws NPE if null, else returns obj"],["equals","a, b","boolean","Null-safe equals"],["isNull","obj","boolean","obj == null"],["hash","values...","int","Combined hash"]]),
  Integer:M([["parseInt","String s","int","\"42\" → 42"],["valueOf","x","Integer","Boxed int"],["toString","int i","String","42 → \"42\""],["MAX_VALUE",null,"int","2147483647"],["MIN_VALUE",null,"int","-2147483648"]])
};
const KWS="public private protected static final void class interface enum record extends implements return if else for while do switch case default break continue new null true false this super try catch finally throw throws import package int char boolean long double float byte short var instanceof".split(" ");
const TYPES=["String","StringBuilder","StringBuffer","Character","Integer","Math","Arrays","System","Objects","List","ArrayList","Map","HashMap","Set","HashSet","Deque","ArrayDeque","Scanner","Exception","IllegalArgumentException","NullPointerException"];
const SNIPS=[
  ["sout","System.out.println(…)","System.out.println($0);"],
  ["psvm","main method","public static void main(String[] args) {\n    $0\n}"],
  ["fori","for i = 0 → n","for (int i = 0; i < $0; i++) {\n    \n}"],
  ["forr","for i = n-1 → 0 (reverse)","for (int i = s.length() - 1; i >= 0; i--) {\n    $0\n}"],
  ["foreach","for (char c : …)","for (char c : $0) {\n    \n}"],
  ["swap","two-pointer swap loop","int left = 0, right = chars.length - 1;\nwhile (left < right) {\n    char temp = chars[left];\n    chars[left++] = chars[right];\n    chars[right--] = temp;\n}$0"],
  ["ifnull","null guard","if ($0 == null) {\n    return null;\n}"],
  ["sb","new StringBuilder","StringBuilder sb = new StringBuilder($0);"],
  ["tca","String → char[]","char[] chars = $0.toCharArray();"]
].map(([l,d,b])=>({label:l,kind:"s",detail:d,body:b}));
const KW_ITEMS=KWS.map(k=>({label:k,kind:"k",detail:"keyword"}));
const TYPE_ITEMS=TYPES.map(t=>({label:t,kind:"t",detail:STAT[t]?"class":"type"}));
const PRI={v:0,m:0,f:0,s:1,k:2,t:3}, ICON={m:"ƒ",f:"◆",v:"x",k:"K",t:"T",s:"⇥"};
const NOTVAR=new Set(KWS.concat(TYPES,["args","main","out","err","println","print","class"]));

const strip=src=>src.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g," ");
function methodsIn(full){
  const re=/(?:public|private|protected|static|final|\s)+([\w$]+(?:<[^>]*>)?(?:\[\])*)\s+([\w$]+)\s*\(([^)]*)\)\s*(?:throws[^{]*)?\{/g,out=[];let m;
  while((m=re.exec(full)))if(!/^(new|return|else)$/.test(m[1]))out.push({label:m[2],kind:"m",params:m[3].trim(),sig:"("+m[3].trim()+")",ret:m[1],doc:"declared in this file"});
  return out;
}
function varType(name,full){
  const re=new RegExp("([A-Za-z_$][\\w$]*(?:<[^<>]*>)?(?:\\s*\\[\\])*)\\s+"+name+"\\b\\s*(?=[=;,):]|$)","gm");let m;
  while((m=re.exec(full)))if(!/^(return|new|else|throw|case|instanceof|class)$/.test(m[1]))return m[1].replace(/<.*>/,"").replace(/\s+/g,"");
  const multi=new RegExp("\\b(int|char|long|String|boolean)\\b[^;(]*,\\s*"+name+"\\s*[=;,]").exec(full);
  return multi?multi[1]:null;
}
function memberType(T,name,full){
  if(T.startsWith("static:")){const c=T.slice(7),it=(STAT[c]||methodsIn(full)).find(x=>x.label===name);return it?it.ret:null;}
  if(T.endsWith("[]"))return name==="clone"?T:name==="length"?"int":null;
  const it=(MEM[T]||MEM.Object).find(x=>x.label===name);return it?it.ret:null;
}
function typeAt(s,full){
  s=s.replace(/\s+$/,"");if(!s)return null;
  if(/"$/.test(s))return "String";
  const last=s[s.length-1];
  if(last===")"||last==="]"){
    const open=last===")"?"(":"[";let d=0,i=s.length-1;
    for(;i>=0;i--){if(s[i]===last)d++;else if(s[i]===open&&--d===0)break;}
    if(i<0)return null;
    const head=s.slice(0,i).replace(/\s+$/,"");
    if(last==="]"){const t=typeAt(head,full);return t&&t.endsWith("[]")?t.slice(0,-2):null;}
    const m=head.match(/([\w$]+)$/);if(!m)return null;
    const name=m[1],pre=head.slice(0,-name.length);
    if(/\bnew\s+$/.test(pre))return name;
    if(/\.\s*$/.test(pre)){const r=typeAt(pre.replace(/\.\s*$/,""),full);return r?memberType(r,name,full):null;}
    const own=methodsIn(full).find(x=>x.label===name);return own?own.ret:null;
  }
  const m=s.match(/([\w$]+)$/);if(!m)return null;
  const name=m[1],pre=s.slice(0,-name.length);
  if(/\.\s*$/.test(pre)){const r=typeAt(pre.replace(/\.\s*$/,""),full);return r?memberType(r,name,full):null;}
  if(STAT[name]||new RegExp("\\bclass\\s+"+name+"\\b").test(full))return "static:"+name;
  return varType(name,full);
}
function membersOf(T,full){
  if(T.startsWith("static:")){const c=T.slice(7);return STAT[c]||methodsIn(full).filter(x=>x.label!=="main");}
  if(T.endsWith("[]"))return MEM["[]"];
  return MEM[T]||(/^[A-Z]/.test(T)?MEM.Object:null);
}
function localItems(full){
  const code=strip(full),own=methodsIn(code),names=new Set(own.map(x=>x.label)),out=[...own];
  (code.match(/\b[A-Za-z_$][\w$]*\b/g)||[]).forEach(w=>{if(!NOTVAR.has(w)&&!names.has(w)&&!/^[A-Z]/.test(w)){names.add(w);out.push({label:w,kind:"v",detail:varType(w,code)||""});}});
  return out;
}
function camel(label,w){let i=0;for(let k=0;k<label.length&&i<w.length;k++){const ch=label[k];if(ch.toLowerCase()===w[i].toLowerCase()&&(k===0||ch!==ch.toLowerCase()||label[k-1]==="_"))i++;}return i===w.length;}
function rank(items,w,keepOrder){
  const lw=w.toLowerCase(),seen=new Set(),out=[];
  for(const [ix,it] of items.entries()){
    const key=it.kind+it.label;if(seen.has(key))continue;seen.add(key);
    if(it.label===w&&it.kind!=="s")continue;
    let sc;
    if(!w)sc=0;else if(it.label.startsWith(w))sc=0;else if(it.label.toLowerCase().startsWith(lw))sc=1;
    else if(camel(it.label,w))sc=2;else if(lw.length>2&&/[vmf]/.test(it.kind)&&it.label.toLowerCase().includes(lw))sc=3;else continue;
    out.push({it,sc,ix});
  }
  out.sort((a,b)=>a.sc-b.sc||PRI[a.it.kind]-PRI[b.it.kind]||(keepOrder?a.ix-b.ix:0)||a.it.label.length-b.it.label.length||a.it.label.localeCompare(b.it.label));
  return out.slice(0,50).map(({it})=>({text:it.label,_it:it,render:(el)=>{
    const lab=esc(it.label),n=w&&it.label.toLowerCase().startsWith(lw)?"<b>"+lab.slice(0,w.length)+"</b>"+lab.slice(w.length):lab;
    el.innerHTML='<span class="hk '+it.kind+'">'+ICON[it.kind]+'</span><span class="hn">'+n+(it.sig?"<i>"+esc(it.sig)+"</i>":"")+'</span><span class="hd">'+esc(it.ret||it.detail||"")+"</span>";
  },hint:applyItem}));
}
function applyItem(cm,data,c){
  const it=c._it,P=CodeMirror.Pos;
  if(it.kind==="s"){
    const ind=cm.getLine(data.from.line).match(/^\s*/)[0],body=it.body.replace(/\n/g,"\n"+ind),at=body.indexOf("$0"),text=body.replace("$0","");
    const start=cm.indexFromPos(data.from);cm.replaceRange(text,data.from,data.to,"complete");cm.setCursor(cm.posFromIndex(start+(at<0?text.length:at)));return;
  }
  if(it.kind==="m"&&cm.getRange(data.to,P(data.to.line,data.to.ch+1))!=="("){
    cm.replaceRange(it.label+"()",data.from,data.to,"complete");
    cm.setCursor(P(data.from.line,data.from.ch+it.label.length+(it.params?1:2)));return;
  }
  cm.replaceRange(it.label,data.from,data.to,"complete");
}
function javaHint(cm,manual){
  const cur=cm.getCursor(),line=cm.getLine(cur.line),tok=cm.getTokenAt(cur);
  if(tok.type&&/string|comment/.test(tok.type))return null;
  let s=cur.ch;while(s>0&&/[\w$]/.test(line[s-1]))s--;
  const word=line.slice(s,cur.ch);if(/^\d/.test(word))return null;
  const before=line.slice(0,s),full=cm.getValue();let items;
  if(/\.\s*$/.test(before)){
    const T=typeAt(before.replace(/\.\s*$/,""),full);if(!T)return null;
    items=membersOf(T,full);if(!items)return null;
  }else{
    if(!manual&&!word)return null;
    items=/\bnew\s+$/.test(before)?TYPE_ITEMS:localItems(full).concat(SNIPS,KW_ITEMS,TYPE_ITEMS);
  }
  const list=rank(items,word,/.s*$/.test(before));if(!list.length)return null;
  const res={list,from:CodeMirror.Pos(cur.line,s),to:CodeMirror.Pos(cur.line,cur.ch)},st=cm._status;
  if(st){
    CodeMirror.on(res,"select",c=>{const it=c._it;st.innerHTML=it.kind==="s"?"<b>"+esc(it.label)+"</b> snippet · "+esc(it.detail):"<b>"+esc(it.label+(it.sig||""))+"</b>"+(it.ret?" → "+esc(it.ret):"")+(it.doc?" · "+esc(it.doc):it.detail?" · "+esc(it.detail):"");});
    CodeMirror.on(res,"close",()=>{st.innerHTML=st._def;});
  }
  return res;
}
function openHint(cm,manual){cm.showHint({hint:c=>javaHint(c,manual),completeSingle:false,closeCharacters:/[\s()\[\]{};:>,=+\-*\/!<&|"'?]/});}

function shell(file){
  const d=document.createElement("div");d.className="code";
  d.innerHTML='<div class="bar"><span class="dots"><i></i><i></i><i></i></span><span class="fn">'+esc(file)+'</span><span class="mod">● edited</span><span class="sp"></span>'+
    ('<label class="sw" style="display:none" title="Pop-up suggestions while typing. Ctrl+Space always works."><input type="checkbox" class="sg"><span class="tr"></span><span class="sl">Suggestions</span></label><button class="ib rs" style="display:none" title="Restore the original code">Reset</button>')+
    '<button class="ib cp">Copy</button></div>';
  return d;
}
function mount(box,src,hlSet){
  /* the editor chrome (suggestions switch, Reset) appears once the editor exists */
  box.classList.add("ed");box.querySelectorAll(".sw,.rs").forEach(x=>x.style.display="");
  const host=document.createElement("div"),status=document.createElement("div");
  status.className="status";status.innerHTML='<span class="pos">Ln 1, Col 1</span><span class="doc">Java · Ctrl+Space suggest · Ctrl+/ comment</span>';
  box.append(host,status);
  const cm=CodeMirror(host,{value:src,mode:"text/x-java",theme:"lesson",lineNumbers:true,indentUnit:4,tabSize:4,indentWithTabs:false,
    matchBrackets:true,autoCloseBrackets:true,styleActiveLine:true,viewportMargin:Infinity,
    extraKeys:{"Ctrl-Space":c=>openHint(c,true),"Ctrl-/":"toggleComment","Cmd-/":"toggleComment",
      Tab:c=>c.execCommand(c.somethingSelected()?"indentMore":"insertSoftTab"),"Shift-Tab":"indentLess"}});
  const doc=status.querySelector(".doc"),pos=status.querySelector(".pos");doc._def=doc.innerHTML;cm._status=doc;
  box._cm=cm;box._orig=src;box._hl=hlSet;
  const paint=()=>box._hl.forEach(n=>{if(n<=cm.lineCount())cm.addLineClass(n-1,"background","cm-hlline");});paint();
  const sg=box.querySelector(".sg");sg.checked=SUG.on;SUG.boxes.push(sg);sg.onchange=()=>setSug(sg.checked);
  box.querySelector(".rs").onclick=()=>{cm.setValue(box._orig);paint();if(box._key)store.set(box._key,"");cm.focus();};
  cm.on("changes",()=>{const dirty=cm.getValue()!==box._orig;box.classList.toggle("dirty",dirty);if(box._key)store.set(box._key,dirty?cm.getValue():"");});
  cm.on("cursorActivity",()=>{const c=cm.getCursor();pos.textContent="Ln "+(c.line+1)+", Col "+(c.ch+1);});
  cm.on("inputRead",(c,ch)=>{if(!SUG.on||c.state.completionActive||ch.origin!=="+input")return;if(/^[\w$.]$/.test(ch.text.join("")))openHint(c,false);});
  return cm;
}
function copyBtn(box,get){box.querySelector(".cp").onclick=e=>{const b=e.target;if(navigator.clipboard)navigator.clipboard.writeText(get()).then(()=>{b.textContent="Copied";setTimeout(()=>b.textContent="Copy",1200);},()=>{});};}

/* editors are created when they get near the screen (CodeMirror setup is the slowest part of a page load) */
const lazyCM=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const d=e.target;lazyCM.unobserve(d);
  cmReady.then(ok=>{if(!ok||d._cm)return;const w=d.querySelector(".cm-wait");mount(d,d._src,d._set);if(w)w.remove();});}),{rootMargin:"150% 0px 150% 0px"});
$$('script[type="text/x-java"]').forEach(sc=>{
  const src=sc.textContent.replace(/^\n+/,"").replace(/\s+$/,""),set=new Set();
  (sc.dataset.hl||"").split(",").filter(Boolean).forEach(p=>{const[a,b]=p.split("-").map(Number);for(let i=a;i<=(b||a);i++)set.add(i);});
  const d=shell(sc.dataset.file);sc.replaceWith(d);
  {d._src=src;d._set=set;d.insertAdjacentHTML("beforeend",'<pre class="cm-wait"><code>'+hl(src).split("\n").map((x,i)=>'<span class="ln'+(set.has(i+1)?" hl":"")+'">'+x+"</span>").join("")+"</code></pre>");
    lazyCM.observe(d);copyBtn(d,()=>d._cm?d._cm.getValue():d._src);}
});
/* editors inside closed <details> or hidden tabs need a re-measure when shown */
const refreshIn=el=>$$(".CodeMirror",el).forEach(x=>x.CodeMirror&&x.CodeMirror.refresh());
document.addEventListener("toggle",e=>{if(e.target.open)refreshIn(e.target);},true);

/* playground */
const PG=[
  {n:"Count vowels",f:"Playground.java",o:"6",c:'public class Playground {\n\n    static int countVowels(String s) {\n        int count = 0;\n        // TODO: loop over s.toLowerCase(), count chars found in "aeiou"\n\n        return count;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(countVowels("Programming in Java"));   // 6\n    }\n}'},
  {n:"Anagram",f:"Playground.java",o:"true\nfalse",c:'public class Playground {\n\n    static boolean isAnagram(String a, String b) {\n        // TODO: different lengths → false\n        // TODO: int[26] counts: ++ for a, -- for b, then all must be 0\n        return false;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(isAnagram("listen", "silent"));   // true\n        System.out.println(isAnagram("rat", "car"));         // false\n    }\n}'},
  {n:"Capitalize words",f:"Playground.java",o:"Hello Java World",c:'public class Playground {\n\n    static String capitalizeWords(String sentence) {\n        StringBuilder sb = new StringBuilder();\n        // TODO: trim, split("\\\\s+"), upper-case first char + lower-case the rest\n\n        return sb.toString();\n    }\n\n    public static void main(String[] args) {\n        System.out.println(capitalizeWords("  hello   java WORLD "));   // Hello Java World\n    }\n}'},
  {n:"Letter frequency",f:"Playground.java",o:"a3b1n2",c:'public class Playground {\n\n    static String frequency(String s) {\n        int[] counts = new int[26];\n        // TODO: counts[c - \'a\']++ for each letter, then build "a3b1n2"\n\n        return "";\n    }\n\n    public static void main(String[] args) {\n        System.out.println(frequency("banana"));   // a3b1n2\n    }\n}'},
  {n:"Compress",f:"Playground.java",o:"a3b2c1",c:'public class Playground {\n\n    static String compress(String s) {\n        StringBuilder sb = new StringBuilder();\n        // TODO: walk each run of the same char, append char + run length\n\n        return sb.toString();\n    }\n\n    public static void main(String[] args) {\n        System.out.println(compress("aaabbc"));   // a3b2c1\n    }\n}'},
  {n:"Pool predictions",f:"Playground.java",o:"true\nfalse\ntrue\nfalse",c:'public class Playground {\n\n    public static void main(String[] args) {\n        String s1 = "hello";\n        String s2 = "hello";\n        String s3 = new String("hello");\n        String part = "hel";\n\n        // Predict each line BEFORE you run it\n        System.out.println(s1 == s2);\n        System.out.println(s1 == s3);\n        System.out.println(s1 == s3.intern());\n        System.out.println(s1 == part + "lo");\n    }\n}'},
  {n:"Reverse words",f:"Playground.java",o:"blue is sky the",c:"public class Playground {\n\n    static String reverseWords(String s) {\n        StringBuilder sb = new StringBuilder();\n        // TODO: trim, split(\"\\\\s+\"), append the words from last to first with one space between\n\n        return sb.toString();\n    }\n\n    public static void main(String[] args) {\n        System.out.println(reverseWords(\"  the sky  is blue \"));   // blue is sky the\n    }\n}"},
  {n:"Longest unique substring",f:"Playground.java",o:"3\n1\n3",c:"import java.util.HashMap;\nimport java.util.Map;\n\npublic class Playground {\n\n    static int longestUnique(String s) {\n        Map<Character, Integer> lastSeen = new HashMap<>();\n        int best = 0, left = 0;\n        // TODO: for each right: if s[right] was seen at index >= left, move left past it\n        //       remember lastSeen, update best = max(best, right - left + 1)\n\n        return best;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(longestUnique(\"abcabcbb\"));   // 3\n        System.out.println(longestUnique(\"bbbbb\"));      // 1\n        System.out.println(longestUnique(\"pwwkew\"));     // 3\n    }\n}"},
  {n:"Valid brackets",f:"Playground.java",o:"true\nfalse",c:"import java.util.ArrayDeque;\nimport java.util.Deque;\n\npublic class Playground {\n\n    static boolean isBalanced(String s) {\n        Deque<Character> stack = new ArrayDeque<>();\n        // TODO: push ( [ { ; on ) ] } the stack must be non-empty and pop the matching opener\n\n        return stack.isEmpty();\n    }\n\n    public static void main(String[] args) {\n        System.out.println(isBalanced(\"{[()()]}\"));   // true\n        System.out.println(isBalanced(\"([)]\"));       // false\n    }\n}"},
  {n:"Second largest",f:"Playground.java",o:"34",c:"public class Playground {\n\n    static int secondLargest(int[] a) {\n        int first = Integer.MIN_VALUE, second = Integer.MIN_VALUE;\n        // TODO: one pass; a new maximum pushes first down to second\n\n        return second;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(secondLargest(new int[]{12, 35, 1, 10, 35, 34}));   // 34\n    }\n}"},
  {n:"Move zeros",f:"Playground.java",o:"[1, 3, 12, 0, 0]",c:"import java.util.Arrays;\n\npublic class Playground {\n\n    static void moveZeros(int[] a) {\n        int w = 0;\n        // TODO: copy every non-zero value to a[w++], then fill the rest with 0\n\n    }\n\n    public static void main(String[] args) {\n        int[] a = {0, 1, 0, 3, 12};\n        moveZeros(a);\n        System.out.println(Arrays.toString(a));   // [1, 3, 12, 0, 0]\n    }\n}"},
  {n:"Max subarray (Kadane)",f:"Playground.java",o:"6",c:"public class Playground {\n\n    static int maxSubarray(int[] a) {\n        int cur = a[0], best = a[0];\n        // TODO: for i from 1: cur = max(a[i], cur + a[i]); best = max(best, cur)\n\n        return best;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(maxSubarray(new int[]{-2, 1, -3, 4, -1, 2, 1, -5, 4}));   // 6\n    }\n}"},
  {n:"Rotate array",f:"Playground.java",o:"[5, 6, 7, 1, 2, 3, 4]",c:"import java.util.Arrays;\n\npublic class Playground {\n\n    static void rotate(int[] a, int k) {\n        k %= a.length;\n        // TODO: reverse(a, 0, n-1), then reverse(a, 0, k-1), then reverse(a, k, n-1)\n\n    }\n\n    static void reverse(int[] a, int i, int j) {\n        while (i < j) {\n            int t = a[i];\n            a[i++] = a[j];\n            a[j--] = t;\n        }\n    }\n\n    public static void main(String[] args) {\n        int[] a = {1, 2, 3, 4, 5, 6, 7};\n        rotate(a, 3);\n        System.out.println(Arrays.toString(a));   // [5, 6, 7, 1, 2, 3, 4]\n    }\n}"},
  {n:"Blank",f:"Main.java",o:"(your output)",c:'public class Main {\n\n    public static void main(String[] args) {\n        \n    }\n}'}
];
const pgHost=$("#pg");
if(pgHost){
  const box=shell(PG[0].f);pgHost.appendChild(box);let cur=0,useCM=false;
  const ta=document.createElement("textarea");ta.spellcheck=false;box.appendChild(ta);copyBtn(box,()=>useCM?box._cm.getValue():ta.value);
  const pick=i=>{cur=i;const t=PG[i],key="js1-pg-"+i,saved=store.get(key);
    $$("#pgTasks .chip").forEach((b,k)=>b.classList.toggle("on",k===i));
    $(".fn",box).textContent=t.f;$("#pgOut").textContent=t.o;
    if(useCM){box._key=null;box._orig=t.c;box._cm.setValue(saved||t.c);box._key=key;box.classList.toggle("dirty",!!saved);box._cm.clearHistory();}
    else ta.value=saved||t.c;
    store.set("js1-pg-last",String(i));};
  $("#pgTasks").innerHTML=PG.map((t,i)=>'<button class="chip">'+esc(t.n)+"</button>").join("");
  $("#pgTasks").onclick=e=>{const b=e.target.closest("button");if(b)pick($$("#pgTasks .chip").indexOf(b));};
  ta.oninput=()=>store.set("js1-pg-"+cur,ta.value);
  pick(Math.min(+(store.get("js1-pg-last")||0)||0,PG.length-1));
  cmReady.then(ok=>{if(!ok)return;ta.remove();mount(box,"",new Set());useCM=true;pick(cur);});
}

/* scroll progress */
const prog=$("#prog");
/* the bar is scaled on the GPU (no layout), once per frame at most. (v10: animations no longer pause while scrolling; with the
   gliding wheel that made them freeze and restart, and the trees are cheap to draw now.) */
let sTick=0;
const onScroll=()=>{if(!sTick)sTick=requestAnimationFrame(()=>{sTick=0;const h=document.documentElement,max=h.scrollHeight-h.clientHeight;prog.style.transform="scaleX("+(max>0?h.scrollTop/max:0).toFixed(4)+")";});};
addEventListener("scroll",onScroll,{passive:true});onScroll();

/* ---------- String Pool visualizer ---------- */
const POOL_STEPS=[
  {c:'String s1 = "hello";',run:S=>{S.obj("A","hello","pool");S.v("s1","A");},m:'The literal <code>"hello"</code> is not in the pool yet, so it is <b>added</b>. <code>s1</code> points to it.'},
  {c:'String s2 = "hello";',run:S=>S.v("s2","A"),m:'The same literal is already pooled, so <code>s2</code> <b>reuses</b> the same object. No new object is created.'},
  {c:'String s3 = new String("hello");',run:S=>{S.obj("B","hello","heap");S.v("s3","B");},m:'<code>new</code> <b>always</b> creates a separate object outside the pool, even though the content is the same.'},
  {c:'String s4 = s3.intern();',run:S=>S.v("s4","A"),m:'<code>intern()</code> returns the <b>pooled</b> copy with the same content, so <code>s4</code> points to the pooled object.'},
  {c:'String s5 = "hel" + "lo";',run:S=>S.v("s5","A"),m:'Both parts are literals, so the <b>compiler</b> joins them into <code>"hello"</code>. The result is the pooled object.'},
  {c:'String part = "hel";',run:S=>{S.obj("C","hel","pool");S.v("part","C");},m:'A new literal <code>"hel"</code> goes into the pool.'},
  {c:'String s6 = part + "lo";',run:S=>{S.obj("D","hello","heap");S.v("s6","D");},m:'<code>part</code> is a variable, so the String is built at <b>runtime</b>. The result is a <b>new</b> heap object.'},
  {c:'String s7 = s6.intern();',run:S=>S.v("s7","A"),m:'Interning the runtime String gives back the pooled <code>"hello"</code> again.'}
];
const PCOL={A:"#6366f1",B:"#f59e0b",C:"#10b981",D:"#ec4899"};
let pidx=0;
function poolState(n){
  const st={objs:[],vars:[],obj(id,val,where){this.objs.push({id,val,where});},v(name,id){this.vars.push({name,id});}};
  for(let i=0;i<n;i++)POOL_STEPS[i].run(st);return st;
}
function poolRender(){
  const st=poolState(pidx),last=st.vars[st.vars.length-1];
  $("#pcode").innerHTML=POOL_STEPS.map((s,i)=>'<div class="pl'+(i<pidx?" done":"")+(i===pidx-1?" cur":"")+'"><span class="pn">'+(i+1)+"</span>"+hl(s.c)+"</div>").join("");
  const objHtml=w=>st.objs.filter(o=>o.where===w).map(o=>{const refs=st.vars.filter(v=>v.id===o.id).map(v=>v.name);
    return '<div class="pobj'+(last&&last.id===o.id?" hot":"")+'" style="--oc:'+PCOL[o.id]+'"><span class="oid">#'+o.id+'</span><b>"'+esc(o.val)+'"</b><span class="refs">'+refs.join(", ")+"</span></div>";}).join("")||'<div class="rq-empty">empty</div>';
  $("#ppool").innerHTML=objHtml("pool");$("#pheap").innerHTML=objHtml("heap");
  $("#pvars").innerHTML=st.vars.map(v=>'<span class="pvar'+(v===last?" hot":"")+'" style="--oc:'+PCOL[v.id]+'">'+v.name+' → #'+v.id+"</span>").join("");
  $("#pmsg").innerHTML=pidx?POOL_STEPS[pidx-1].m:'Press <b>Run line</b> to execute the first line.';
  const s1=st.vars.find(v=>v.name==="s1"),others=st.vars.filter(v=>v.name!=="s1"&&v.name!=="part");
  const val=id=>st.objs.find(o=>o.id===id).val;
  $("#pcmp").innerHTML=s1&&others.length?"<tr><th>Expression</th><th>==</th><th>equals()</th></tr>"+others.map(v=>"<tr"+(v===last?' class="cur"':"")+"><td><code>s1 vs "+v.name+"</code></td><td class=\""+(v.id===s1.id?"good\">true":"bad\">false")+'</td><td class="good">'+(val(v.id)===val(s1.id))+"</td></tr>").join(""):"";
  $("#pcount").textContent=pidx+" / "+POOL_STEPS.length;
  $("#pprev").disabled=pidx===0;$("#pnext").disabled=pidx===POOL_STEPS.length;
}
if($("#poolviz")){
$("#pnext").onclick=()=>{if(pidx<POOL_STEPS.length){pidx++;poolRender();}};
$("#pprev").onclick=()=>{if(pidx>0){pidx--;poolRender();}};
$("#preset").onclick=()=>{pidx=0;poolRender();};
poolRender();
}

/* ---------- Method explorer (mimics Java) ---------- */
class JavaEx extends Error{constructor(t,m){super(m);this.t=t;}}
const jstr=v=>'"'+v+'"';
const jarr=a=>"["+a.join(", ")+"]";
function idx(s,i,incl){if(!Number.isInteger(i)||i<0||(incl?i>s.length:i>=s.length))throw new JavaEx("StringIndexOutOfBoundsException",incl?"Range ["+i+", "+s.length+") out of bounds for length "+s.length:"Index "+i+" out of bounds for length "+s.length);return i;}
function jsplit(s,re,limit){
  let rx;try{rx=new RegExp(re,"g");}catch(e){throw new JavaEx("PatternSyntaxException",e.message);}
  if(s==="")return[""];
  const out=[];let last=0,m;rx.lastIndex=0;
  while((m=rx.exec(s))){if(m[0]===""){if(m.index>=s.length)break;if(m.index===0){rx.lastIndex++;continue;}}
    if(limit>0&&out.length===limit-1)break;
    out.push(s.slice(last,m.index));last=m.index+m[0].length;if(m[0]==="")rx.lastIndex++;}
  out.push(s.slice(last));
  if(limit===0)while(out.length>1&&out[out.length-1]==="")out.pop();
  if(limit===0&&out.length===1&&out[0]===""&&s!=="")return[];
  return out;
}
function jcompare(a,b){const n=Math.min(a.length,b.length);for(let i=0;i<n;i++){const d=a.charCodeAt(i)-b.charCodeAt(i);if(d)return d;}return a.length-b.length;}
/* Character.isWhitespace: no-break spaces (U+00A0, U+2007, U+202F) and U+FEFF are NOT whitespace */
const jws=c=>(c>=9&&c<=13)||(c>=28&&c<=32)||c===0x1680||(c>=0x2000&&c<=0x2006)||(c>=0x2008&&c<=0x200A)||c===0x2028||c===0x2029||c===0x205F||c===0x3000;
const jstrip=s=>{let a=0,b=s.length;while(a<b&&jws(s.charCodeAt(a)))a++;while(b>a&&jws(s.charCodeAt(b-1)))b--;return s.slice(a,b);};
/* Matcher replacement rules: $n and ${name} are groups, a backslash makes the next char literal, a bare $ throws */
function jrepl(s,rx,rep){
  const ng=new RegExp(rx.source+"|").exec("").length-1,parts=[];
  for(let i=0;i<rep.length;i++){const c=rep[i];
    if(c==="\\"){if(++i>=rep.length)throw new JavaEx("IllegalArgumentException","character to be escaped is missing");parts.push(rep[i]);}
    else if(c==="$"){if(++i>=rep.length)throw new JavaEx("IllegalArgumentException","Illegal group reference: group index is missing");
      if(rep[i]==="{"){const e=rep.indexOf("}",i);if(e<0)throw new JavaEx("IllegalArgumentException","named capturing group is missing trailing '}'");parts.push({name:rep.slice(i+1,e)});i=e;}
      else{let d=rep.charCodeAt(i)-48;if(d<0||d>9)throw new JavaEx("IllegalArgumentException","Illegal group reference");if(d>ng)throw new JavaEx("IndexOutOfBoundsException","No group "+d);
        while(i+1<rep.length&&/\d/.test(rep[i+1])&&d*10+(+rep[i+1])<=ng){d=d*10+(+rep[i+1]);i++;}parts.push({g:d});}}
    else parts.push(c);}
  return s.replace(rx,(...m)=>{const named=typeof m[m.length-1]==="object"?m[m.length-1]:null;
    return parts.map(p=>typeof p==="string"?p:p.name!=null?((named&&named[p.name])||""):(m[p.g]==null?"":m[p.g])).join("");});
}
const jtrim=s=>{let a=0,b=s.length;while(a<b&&s.charCodeAt(a)<=32)a++;while(b>a&&s.charCodeAt(b-1)<=32)b--;return s.slice(a,b);};
/* each: [label, args(name:type), fn(s,args) → {r: display, t: type, hl: {from,to}|null}] */
const MX=[
  ["length()",[],s=>({r:s.length,t:"int"})],
  ["isEmpty()",[],s=>({r:s.length===0,t:"boolean"})],
  ["isBlank()",[],s=>({r:jstrip(s)==="",t:"boolean"})],
  ["charAt(int)",[["index","int","4"]],(s,[i])=>{idx(s,i);return{r:"'"+s[i]+"'",t:"char",hl:[i,i+1]};}],
  ["indexOf(String)",[["str","String","o"]],(s,[x])=>{const i=s.indexOf(x);return{r:i,t:"int",hl:i>=0?[i,i+x.length]:null};}],
  ["lastIndexOf(String)",[["str","String","o"]],(s,[x])=>{const i=s.lastIndexOf(x);return{r:i,t:"int",hl:i>=0?[i,i+x.length]:null};}],
  ["contains(CharSequence)",[["s","String","World"]],(s,[x])=>{const i=s.indexOf(x);return{r:i>=0,t:"boolean",hl:i>=0?[i,i+x.length]:null};}],
  ["startsWith(String)",[["prefix","String","Hell"]],(s,[x])=>({r:s.startsWith(x),t:"boolean",hl:s.startsWith(x)?[0,x.length]:null})],
  ["endsWith(String)",[["suffix","String","ld"]],(s,[x])=>({r:s.endsWith(x),t:"boolean",hl:s.endsWith(x)?[s.length-x.length,s.length]:null})],
  ["substring(int)",[["begin","int","7"]],(s,[b])=>{idx(s,b,true);return{r:jstr(s.slice(b)),t:"String",hl:[b,s.length]};}],
  ["substring(int, int)",[["begin","int","0"],["end","int","5"]],(s,[b,e])=>{if(!Number.isInteger(b)||!Number.isInteger(e)||b<0||e>s.length||b>e)throw new JavaEx("StringIndexOutOfBoundsException","Range ["+b+", "+e+") out of bounds for length "+s.length);return{r:jstr(s.slice(b,e)),t:"String",hl:[b,e]};}],
  ["toUpperCase()",[],s=>({r:jstr(s.toUpperCase()),t:"String"})],
  ["toLowerCase()",[],s=>({r:jstr(s.toLowerCase()),t:"String"})],
  ["trim()",[],s=>({r:jstr(jtrim(s)),t:"String"})],
  ["strip()",[],s=>({r:jstr(jstrip(s)),t:"String"})],
  ["replace(CharSequence, CharSequence)",[["target","String","l"],["replacement","String","L"]],(s,[a,b])=>({r:jstr(a===""?b+s.split("").map(c=>c+b).join(""):s.split(a).join(b)),t:"String"})],
  ["replaceAll(String regex, String)",[["regex","String","[^A-Za-z]"],["replacement","String",""]],(s,[a,b])=>{let rx;try{rx=new RegExp(a,"g");}catch(e){throw new JavaEx("PatternSyntaxException",e.message);}return{r:jstr(jrepl(s,rx,b)),t:"String"};}],
  ["repeat(int)",[["count","int","2"]],(s,[n])=>{if(n<0)throw new JavaEx("IllegalArgumentException","count is negative: "+n);return{r:jstr(s.repeat(n)),t:"String"};}],
  ["concat(String)",[["str","String","!"]],(s,[x])=>({r:jstr(s+x),t:"String"})],
  ["split(String regex)",[["regex","String",", "]],(s,[x])=>{const a=jsplit(s,x,0);return{r:jarr(a),t:"String[]",n:"length "+a.length};}],
  ["split(String regex, int limit)",[["regex","String",","],["limit","int","-1"]],(s,[x,l])=>{const a=jsplit(s,x,l);return{r:jarr(a),t:"String[]",n:"length "+a.length};}],
  ["equals(Object)",[["other","String","hello, world"]],(s,[x])=>({r:s===x,t:"boolean"})],
  ["equalsIgnoreCase(String)",[["other","String","hello, world"]],(s,[x])=>({r:s.toLowerCase()===x.toLowerCase(),t:"boolean"})],
  ["compareTo(String)",[["other","String","Hello"]],(s,[x])=>({r:jcompare(s,x),t:"int"})],
  ["toCharArray()",[],s=>({r:jarr(s.split("")),t:"char[]"})],
  ["hashCode()",[],s=>{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return{r:h,t:"int"};}]
];
const mxSel=$("#mxm");
if(mxSel){
mxSel.innerHTML=MX.map((m,i)=>'<option value="'+i+'">'+esc(m[0])+"</option>").join("");
function mxArgs(){const m=MX[+mxSel.value];
  $("#mxargs").innerHTML=m[1].map((a,i)=>'<input class="arg" data-i="'+i+'" data-t="'+a[1]+'" value="'+esc(a[2])+'" aria-label="'+a[0]+'" title="'+a[0]+" ("+a[1]+')" placeholder="'+a[0]+'" spellcheck="false" style="width:'+(a[1]==="int"?70:120)+'px">').join("");
  mxRun();}
function mxRun(){
  const s=$("#mxs").value,m=MX[+mxSel.value],ins=$$("#mxargs input");
  const vals=ins.map(x=>x.dataset.t==="int"?Number(x.value.trim()):x.value);
  const call="s."+m[0].split("(")[0]+"("+ins.map(x=>x.dataset.t==="int"?x.value.trim():'"'+esc(x.value)+'"').join(", ")+")";
  let res,err=null;
  try{if(ins.some(x=>x.dataset.t==="int"&&!/^-?\d+$/.test(x.value.trim())))throw new JavaEx("compile error","int argument must be a whole number");res=m[2](s,vals);}catch(e){err=e;}
  const hlr=res&&res.hl;
  $("#mxstage").innerHTML='<div class="row"><span class="lb">s</span>'+cells(s.split("").map((ch,k)=>({ch,s:hlr&&k>=hlr[0]&&k<hlr[1]?"read":""})))+"</div>";
  $("#mxout").innerHTML='<code>'+esc('String s = "'+s+'";')+"</code><br><code>"+call+"</code> → "+(err?'<span class="bad">'+esc((err.t||"Error")+": "+err.message)+"</span>":'<b class="mono">'+esc(String(res.r))+'</b> <span class="muted small">('+res.t+(res.n?", "+res.n:"")+")</span>");
}
mxSel.onchange=mxArgs;$("#mxs").oninput=mxRun;$("#mxargs").oninput=mxRun;
mxSel.value=String(MX.findIndex(m=>m[0]==="indexOf(String)"));mxArgs();
}

/* ---------- Character inspector ---------- */
const CI_PRE=["Java é😀","hello","नमस्ते","a😀b","Aa BB"];
if($("#cichips"))$("#cichips").innerHTML=CI_PRE.map(p=>'<button class="chip" data-v="'+esc(p)+'">'+esc(p)+"</button>").join(" ");
function ciRun(){
  const s=$("#cis").value,units=[];
  for(let i=0;i<s.length;i++){const c=s.charCodeAt(i),hi=c>=0xD800&&c<=0xDBFF,lo=c>=0xDC00&&c<=0xDFFF;
    units.push({i,c,hi,lo,cp:hi&&i+1<s.length?s.codePointAt(i):null});}
  const cps=[...s].length,bytes=new TextEncoder().encode(s).length;
  $("#cistats").innerHTML='<div><b>'+s.length+'</b>length() · UTF-16 chars</div><div><b>'+cps+'</b>codePointCount · real characters</div><div><b>'+bytes+'</b>getBytes(UTF_8).length</div>';
  $("#cigrid").innerHTML=units.map(u=>{
    const shown=u.hi?esc(String.fromCodePoint(u.cp||0xFFFD)):u.lo?"↩":u.c===32?"␣":esc(s[u.i]);
    const tag=u.hi?"high surrogate":u.lo?"low surrogate":u.c<128?"ASCII":u.c<256?"Latin-1":"BMP";
    return '<div class="cu'+(u.hi||u.lo?" sur":"")+'"><span class="ci">'+u.i+'</span><span class="cc">'+shown+'</span><span class="cn">'+u.c+'</span><span class="cx">\\u'+u.c.toString(16).toUpperCase().padStart(4,"0")+'</span><span class="ct">'+tag+(u.cp?" · U+"+u.cp.toString(16).toUpperCase():"")+"</span></div>";
  }).join("")||'<div class="rq-empty">empty — length 0</div>';
}
if($("#cis")){
$("#cis").oninput=ciRun;
$("#cichips").onclick=e=>{const b=e.target.closest("button");if(b){$("#cis").value=b.dataset.v;ciRun();}};
ciRun();
}

/* tabs */
if($("#tabs"))$("#tabs").onclick=e=>{const b=e.target.closest("button");if(!b)return;$$("#tabs button").forEach(x=>x.classList.toggle("on",x===b));$(".pane").forEach(p=>p.classList.toggle("on",p.id===b.dataset.p));refreshIn($("#"+b.dataset.p));};


/* redesign v2: sidebar contents, heading anchors, back to top */
(function(){
  /* heading anchors for this page's sections */
  $$(".wrap > section").forEach(el=>{const h2=$("h2",el);if(!h2||!el.id)return;
    const a=document.createElement("a");a.className="anchor";a.href="#"+el.id;a.textContent="#";a.setAttribute("aria-label","Link to this section");h2.appendChild(a);});
  /* top nav links (shown below 1200px) and the previous / next page buttons in the page header */
  const nl=$("nav .links");
  if(nl)nl.innerHTML=PAGES.map(p=>'<a href="'+pageUrl(p)+'"'+(p.key===PAGE?' class="cur" aria-current="page"':"")+">"+esc(p.short)+"</a>").join("");
  const pager=$("header .pager");
  if(pager&&thisPage){const i=PAGES.indexOf(thisPage),pv=PAGES[i-1],nx=PAGES[i+1];
    pager.innerHTML=(pv?'<a class="btn" href="'+pageUrl(pv)+'"><span aria-hidden="true">←</span> '+esc(pv.name)+"</a>":"")+(nx?'<a class="btn pri" href="'+pageUrl(nx)+'">'+esc(nx.name)+' <span aria-hidden="true">→</span></a>':"");}
  /* the sidebar lists the whole course; other pages' groups stay folded to their heading until you search */
  const groups=PAGES.filter(p=>p.sections.length).map(p=>({p,t:p.name,href:pageUrl(p,p.band||null),cur:p.key===PAGE,items:p.sections.map(s=>({id:s.id,n:s.n,t:s.t,href:pageUrl(p,s.id)}))}));
  const toc=document.createElement("aside");toc.id="toc";toc.setAttribute("aria-label","Contents");
  toc.innerHTML='<div class="ts"><input type="search" placeholder="Search sections…  /" aria-label="Search sections"></div><div class="tl">'+
    groups.map(g=>'<div class="tg'+(g.cur?" cur":" fold")+'"><a class="tgh" data-l="'+g.p.key+'" href="'+g.href+'">'+esc(g.t)+"<small>"+g.items.length+"</small></a>"+g.items.map(i=>'<a class="ti" data-id="'+i.id+'" title="'+esc(i.t)+'" href="'+i.href+'"><span>'+esc(i.n)+"</span><b>"+esc(i.t)+"</b></a>").join("")+"</div>").join("")+
    '<div class="none" hidden>No matching sections.</div></div>';
  $("nav").after(toc);
  const items=$$(".ti",toc),list=$(".tl",toc),find=$("input",toc),btn=$("#tocBtn");
  const close=()=>{document.body.classList.remove("toc-open");btn.setAttribute("aria-expanded","false");};
  btn.onclick=()=>{const o=document.body.classList.toggle("toc-open");btn.setAttribute("aria-expanded",String(o));if(o)setTimeout(()=>find.focus(),50);};
  toc.addEventListener("click",e=>{if(e.target.closest("a"))close();});
  document.addEventListener("click",e=>{if(document.body.classList.contains("toc-open")&&!e.target.closest("#toc,#tocBtn"))close();});
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape")close();
    if(e.key==="/"&&!e.target.closest("input,textarea,select,.CodeMirror")){e.preventDefault();if(innerWidth<1200)btn.click();else find.focus();}
  });
  find.oninput=()=>{const q=find.value.trim().toLowerCase();let any=false;toc.classList.toggle("searching",!!q);
    $$(".tg",toc).forEach(g=>{let n=0;$$(".ti",g).forEach(a=>{const m=!q||a.textContent.toLowerCase().includes(q);a.hidden=!m;if(m)n++;});g.hidden=q&&!n;if(n)any=true;});
    $(".none",toc).hidden=any;};
  find.onkeydown=e=>{if(e.key==="Enter"){const f=items.find(a=>!a.hidden);if(f){find.blur();location.href=f.href;}}};
  const spy=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;
    items.forEach(a=>{const on=a.hash==="#"+e.target.id;a.classList.toggle("on",on);
      if(on&&list.offsetParent){const r=a.getBoundingClientRect(),lr=list.getBoundingClientRect();if(r.top<lr.top+40||r.bottom>lr.bottom-40)list.scrollTop+=r.top-lr.top-lr.height/2;}});}),{rootMargin:"-30% 0px -65% 0px"});
  $$(".wrap > section").forEach(s=>spy.observe(s));
  const top=$("#totop");top.onclick=()=>scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"});
  addEventListener("scroll",()=>top.classList.toggle("show",scrollY>900),{passive:true});
})();


/* shared with the analogy visuals and the bubble valet: set by the OOP car story (labs-oop.js) */
let OLF=null;

/* learning layer: quizzes, progress, bookmarks, spaced review, full-text search */
(function(){
  const LVN={B:"Beginner",I:"Intermediate",A:"Advanced"};
  const LNAME={};LESSONS.forEach(p=>LNAME[p.key]=p.name);
  const load=k=>{try{return JSON.parse(store.get(k)||"{}")||{}}catch(e){return {}}};
  const flash=el=>{el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash");};

  /* quizzes: one card per question, answers saved per lesson */
  $$(".quiz[data-quiz]").forEach(root=>{
    const id=root.dataset.quiz,qs=QZ[id]||[],key="js1-qz-"+id;
    if(!qs.length){root.innerHTML='<p class="small muted">Quiz coming soon.</p>';return;}
    let ans=load(key),streak=0;
    /* v13 reactions: a streak badge, and a result banner with a trophy (plus a confetti shower for 70% or more) when the quiz is done */
    const showStreak=()=>{let sb=$(".qstreak",root);if(!sb){sb=document.createElement("span");sb.className="qstreak";$(".qhead",root).appendChild(sb);}
      sb.textContent=streak>=2?"🔥 "+streak+" in a row":"";sb.classList.toggle("on",streak>=2);
      if(streak>=2)sb.animate([{transform:"scale(1.4)"},{transform:"scale(1)"}],{duration:420,easing:"cubic-bezier(.2,1.6,.4,1)"});};
    const celebrate=()=>{const c=qs.filter((x,i)=>ans[i]===x.a).length,pct=c/qs.length;let d=$(".qdone",root);if(!d){d=document.createElement("div");d.className="qdone";$(".qhead",root).after(d);}
      d.innerHTML='<span class="qd-cup">'+(pct===1?"🏆":pct>=.7?"🥇":pct>=.4?"🥈":"📚")+"</span><span><b>"+c+" / "+qs.length+"</b> "+
        (pct===1?"Perfect score!":pct>=.7?"Great job!":pct>=.4?"Good effort. Retry the wrong ones.":"Reread the lesson, then retry.")+"</span>";
      d.classList.remove("show");requestAnimationFrame(()=>requestAnimationFrame(()=>d.classList.add("show")));if(pct>=.7)FX.shower();};
    root.innerHTML='<div class="qhead"><span class="qscore" aria-live="polite"></span><span><button type="button" class="btn" data-act="wrong">Retry wrong</button> <button type="button" class="btn" data-act="reset">Reset</button></span><span class="qbar"><i></i></span></div>'+
      qs.map((x,i)=>'<div class="qq" data-i="'+i+'"><div class="qmeta"><span class="qn">Q'+(i+1)+'</span><span class="lv '+x.lv.toLowerCase()+'">'+LVN[x.lv]+'</span></div><div class="qt">'+x.q+'</div><div class="qo" role="group" aria-label="Answers for question '+(i+1)+'">'+
        x.o.map((o,j)=>'<button type="button" class="qopt" data-j="'+j+'"><span class="qk">'+"ABCDEF"[j]+'</span><span>'+o+'</span></button>').join("")+'</div><div class="qe" aria-live="polite" hidden></div></div>').join("");
    const paint=()=>{let n=0,c=0;
      $$(".qq",root).forEach(card=>{const i=+card.dataset.i,x=qs[i],a=ans[i],done=a!=null,ok=done&&a===x.a;
        $$(".qopt",card).forEach(b=>{const j=+b.dataset.j;b.disabled=done;b.classList.toggle("ok",done&&j===x.a);b.classList.toggle("no",done&&j===a&&!ok);b.setAttribute("aria-pressed",String(done&&j===a));});
        const e=$(".qe",card);e.hidden=!done;
        if(done){n++;if(ok)c++;e.className="qe "+(ok?"qok":"qno");e.innerHTML="<b>"+(ok?"Correct.":"Not quite — the answer is "+"ABCDEF"[x.a]+".")+"</b> "+x.e;}
        card.classList.toggle("right",ok);card.classList.toggle("wrong",done&&!ok);});
      $(".qscore",root).innerHTML="<b>"+c+"</b> / "+qs.length+" correct · "+n+" answered"+(n===qs.length?(c===qs.length?" · perfect":" · retry the wrong ones, then reread their sections"):"");
      $(".qbar i",root).style.width=(100*n/qs.length)+"%";};
    root.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
      if(b.classList.contains("qopt")){const i=+b.closest(".qq").dataset.i;if(ans[i]!=null)return;ans[i]=+b.dataset.j;}
      else if(b.dataset.act==="reset"){ans={};streak=0;showStreak();const d=$(".qdone",root);if(d)d.remove();}
      else if(b.dataset.act==="wrong"){for(const k in ans)if(ans[k]!==qs[k].a)delete ans[k];const w=$(".qq.wrong",root);if(w)w.scrollIntoView({block:"center"});}
      else return;
      store.set(key,JSON.stringify(ans));paint();
      /* the last answer of a quiz summons the fire rider (RIDER listens for "quizdone") */
      if(b.classList.contains("qopt")){const card=b.closest(".qq"),i=+card.dataset.i,ok=ans[i]===qs[i].a,r=b.getBoundingClientRect();
        streak=ok?streak+1:0;showStreak();
        if(ok){FX.confetti(r.left+r.width/2,r.top+r.height/2,24);card.animate([{boxShadow:"0 0 0 0 rgba(34,197,94,.55)"},{boxShadow:"0 0 0 16px rgba(34,197,94,0)"}],{duration:750,easing:"ease-out"});}
        else{card.animate([{translate:"0 0"},{translate:"-9px 0"},{translate:"8px 0"},{translate:"-6px 0"},{translate:"4px 0"},{translate:"0 0"}],{duration:420,easing:"ease-out"});
          card.animate([{boxShadow:"0 0 0 0 rgba(239,68,68,.5)"},{boxShadow:"0 0 0 14px rgba(239,68,68,0)"}],{duration:650,easing:"ease-out"});}
        document.dispatchEvent(new CustomEvent("quizanswer",{detail:{id,ok,streak}}));
        if(Object.keys(ans).length===qs.length){celebrate();document.dispatchEvent(new CustomEvent("quizdone",{detail:{id}}));}}});
    paint();
  });

  /* every lesson section in the course (el only for the ones on this page) and the lesson each belongs to */
  const SEC=[];
  LESSONS.forEach(p=>p.sections.forEach(s=>SEC.push({el:p.key===PAGE?document.getElementById(s.id):null,id:s.id,l:p.key,n:s.n,t:s.t})));
  const byId={};SEC.forEach(s=>byId[s.id]=s);

  /* progress: understood → review after 1, 3 and 7 days (stage 0..2), then mastered (3) */
  const DAY=864e5,GAP=[1,2,4],STAGE=["Day 1","Day 3","Day 7"];
  let prog=load("js1-done"),bm=load("js1-bm");
  for(const k in prog)if(!byId[k])delete prog[k];
  const due=p=>p.s>=3?Infinity:p.r+GAP[p.s]*DAY;
  const status=p=>{if(p.s>=3)return "Mastered: all three reviews done";const d=Math.ceil((due(p)-Date.now())/DAY);return d<=0?STAGE[p.s]+" review is due":STAGE[p.s]+" review in "+d+(d===1?" day":" days");};
  const save=()=>{store.set("js1-done",JSON.stringify(prog));store.set("js1-bm",JSON.stringify(bm));paint();};

  SEC.forEach(s=>{if(!s.el)return;const f=document.createElement("div");f.className="secfoot";
    f.innerHTML='<button type="button" class="sf-done" aria-pressed="false">✓ <span>Mark as understood</span></button><button type="button" class="sf-bm" aria-pressed="false">☆ <span>Bookmark</span></button><span class="sf-note"></span>';
    s.el.appendChild(f);s.foot=f;});
  document.addEventListener("click",e=>{
    const b=e.target.closest(".secfoot button, .rq button");if(!b)return;
    const id=b.dataset.id||b.closest("section").id,now=Date.now();
    if(b.classList.contains("sf-done")){if(prog[id])delete prog[id];else prog[id]={t:now,r:now,s:0};}
    else if(b.classList.contains("sf-bm")||b.dataset.act==="unbm"){if(bm[id])delete bm[id];else bm[id]=now;}
    else if(b.dataset.act==="ok"&&prog[id]){prog[id].s++;prog[id].r=now;}
    else if(b.dataset.act==="again"&&prog[id]){prog[id].s=0;prog[id].r=now;}
    else return;
    save();});

  const toc=$("#toc"),hubQ=$("#rq"),hubB=$("#bml"),hubS=$("#rstats");
  function paint(){
    const now=Date.now(),per={};
    SEC.forEach(s=>{const p=prog[s.id],m=!!bm[s.id];
      (per[s.l]=per[s.l]||{d:0,n:0}).n++;if(p)per[s.l].d++;
      if(s.foot){const d=$(".sf-done",s.foot),k=$(".sf-bm",s.foot);
        d.setAttribute("aria-pressed",String(!!p));$("span",d).textContent=p?"Understood":"Mark as understood";
        k.setAttribute("aria-pressed",String(m));k.firstChild.textContent=m?"★ ":"☆ ";$("span",k).textContent=m?"Bookmarked":"Bookmark";
        $(".sf-note",s.foot).textContent=p?status(p):"";}
      if(toc){const a=$('.ti[data-id="'+s.id+'"]',toc);if(a){a.classList.toggle("done",!!p);a.classList.toggle("bm",m);}}});
    for(const l in per){const pct=Math.round(100*per[l].d/per[l].n);
      if(toc){const h=$('.tgh[data-l="'+l+'"] small',toc);if(h)h.textContent=per[l].d+"/"+per[l].n;}
      const c=$('.lcard[data-l="'+l+'"]');if(c){let bar=$(".lp",c);if(!bar){bar=document.createElement("span");bar.className="lp";bar.innerHTML="<i></i>";c.appendChild(bar);}
        $("i",bar).style.width=pct+"%";bar.title=per[l].d+" of "+per[l].n+" sections understood";}}
    if(!hubQ)return;
    const items=SEC.filter(s=>prog[s.id]).map(s=>({s,p:prog[s.id],due:due(prog[s.id])})).sort((a,b)=>a.due-b.due);
    const dueNow=items.filter(x=>x.due<=now),later=items.filter(x=>x.due>now&&x.p.s<3),done=items.filter(x=>x.p.s>=3);
    const row=(x,isDue)=>'<div class="ri'+(isDue?" due":"")+'"><a href="'+secUrl(x.s.id)+'">'+esc(x.s.n+" · "+x.s.t)+'</a><span class="rs">'+esc(status(x.p))+"</span>"+
      (isDue?'<button type="button" class="btn" data-act="ok" data-id="'+x.s.id+'">I remember it</button><button type="button" class="btn" data-act="again" data-id="'+x.s.id+'">Forgot · restart</button>':"")+"</div>";
    hubS.innerHTML="<span><b>"+items.length+"</b> / "+SEC.length+" understood</span><span><b>"+dueNow.length+"</b> due now</span><span><b>"+later.length+"</b> scheduled</span><span><b>"+done.length+"</b> mastered</span><span><b>"+Object.keys(bm).filter(k=>byId[k]).length+"</b> bookmarked</span>";
    hubQ.innerHTML=(dueNow.length?dueNow.map(x=>row(x,true)).join(""):'<div class="rq-empty">Nothing is due. Mark sections as understood and they come back here after 1, 3 and 7 days.</div>')+
      (later.length?'<details class="d"><summary>Scheduled later ('+later.length+')</summary><div class="b rq">'+later.map(x=>row(x,false)).join("")+"</div></details>":"");
    const bms=SEC.filter(s=>bm[s.id]);
    hubB.innerHTML=bms.length?bms.map(s=>'<div class="ri"><a href="'+secUrl(s.id)+'">'+esc(s.n+" · "+s.t)+'</a><span class="rs">'+esc(LNAME[s.l])+'</span><button type="button" class="btn" data-act="unbm" data-id="'+s.id+'">Remove</button></div>').join(""):'<div class="rq-empty">No bookmarks yet. Use ☆ Bookmark at the end of any section.</div>';
  }
  paint();
  setInterval(paint,60*60*1000);

  /* recall prompts for day 1 / 3 / 7 */
  const rc=$("#rcp");
  if(rc){const DAYS=[["d1","Day 1 · define"],["d3","Day 3 · explain why"],["d7","Day 7 · apply"]];let on="d1";
    const draw=()=>{rc.innerHTML='<div class="rtabs" role="tablist">'+DAYS.map(([k,t])=>'<button type="button" role="tab" data-k="'+k+'" aria-selected="'+(k===on)+'">'+t+"</button>").join("")+"</div>"+
      Object.keys(LNAME).filter(l=>RC[l]&&RC[l][on]).map(l=>"<h4>"+esc(LNAME[l])+"</h4>"+RC[l][on].map(([q,a])=>'<details class="d"><summary>'+q+'</summary><div class="b">'+a+"</div></details>").join("")).join("")||'<p class="small muted">No prompts yet.</p>';};
    rc.addEventListener("click",e=>{const b=e.target.closest(".rtabs button");if(b){on=b.dataset.k;draw();$('.rtabs [aria-selected="true"]',rc).focus();}});
    draw();}

  /* full-text search in the sidebar: titles are filtered by the block above; this adds matches in the text */
  if(!toc)return;
  const find=$(".ts input",toc),list=$(".tl",toc),box=document.createElement("div");box.className="cres";box.hidden=true;list.appendChild(box);
  find.placeholder="Search sections and text…  /";
  const IDX=SEC.filter(s=>s.el).map(s=>({s,blocks:$$("h3,p,li,summary,td,figcaption,.tldr",s.el).filter(b=>!b.closest(".secfoot,.quiz,.CodeMirror"))}));
  const hits=[];
  const mark=(txt,q)=>{const i=txt.toLowerCase().indexOf(q),a=Math.max(0,i-40),b=Math.min(txt.length,i+q.length+60);
    return (a?"…":"")+esc(txt.slice(a,i))+"<mark>"+esc(txt.slice(i,i+q.length))+"</mark>"+esc(txt.slice(i+q.length,b))+(b<txt.length?"…":"");};
  find.addEventListener("input",()=>{const q=find.value.trim().toLowerCase();hits.length=0;
    if(q.length<3){box.hidden=true;box.innerHTML="";return;}
    for(const {s,blocks} of IDX){const b=blocks.find(x=>x.textContent.toLowerCase().includes(q));if(b){hits.push({s,b});if(hits.length>=25)break;}}
    box.hidden=!hits.length;
    box.innerHTML='<div class="tgh">In the text on this page<small>'+hits.length+(hits.length>=25?"+":"")+"</small></div>"+hits.map((h,i)=>'<a class="cr" href="#'+h.s.id+'" data-h="'+i+'"><b>'+esc(h.s.n+" · "+h.s.t)+"</b>"+mark(h.b.textContent.replace(/\s+/g," ").trim(),q)+"</a>").join("");
    if(hits.length)$(".none",toc).hidden=true;});
  box.addEventListener("click",e=>{const a=e.target.closest(".cr");if(!a)return;e.preventDefault();const h=hits[+a.dataset.h];
    const d=h.b.closest("details");if(d)d.open=true;
    h.b.scrollIntoView({block:"center"});flash(h.b);history.replaceState(null,"","#"+h.s.id);
    document.body.classList.remove("toc-open");});
  find.addEventListener("keydown",e=>{if(e.key==="Enter"&&!$$(".ti",toc).some(a=>!a.hidden)){const a=$(".cr",box);if(a)a.click();}});
})();

/* themes v3: theme picker (THEMES: [id, name, dark?, swatch]) and the ∞ background animation (canvas #infbg) */
const THM=(function(){
  const THEMES=[["auto","Auto · time",null,["#fdba74","#f7f8fb","#11141c","#070b1a"]],["system","System",null,["#f7f8fb","#0a0c12","#6366f1","#a855f7"]],["light","Light",0,["#f7f8fb","#ffffff","#6366f1","#a855f7"]],["dark","Dark",1,["#0a0c12","#11141c","#8b8cf8","#c084fc"]],
    ["midnight","Midnight",1,["#070b1a","#0d1328","#3b82f6","#a78bfa"]],["nord","Nord",1,["#2e3440","#3b4252","#81a1c1","#b48ead"]],["dracula","Dracula",1,["#1e1f29","#282a36","#a87ff5","#ff79c6"]],
    ["forest","Forest",1,["#0b1410","#111d17","#22a06b","#a3e635"]],["sunset","Sunset",0,["#fff8f3","#ffffff","#e11d48","#f97316"]],["ocean","Ocean",0,["#f2f8fb","#ffffff","#0e7490","#2563eb"]],["sepia","Sepia",0,["#f4ecd8","#fbf6ea","#a0522d","#b8860b"]]];
  const html=document.documentElement,btn=$("#theme"),sysDark=matchMedia("(prefers-color-scheme: dark)"),reduce=matchMedia("(prefers-reduced-motion: reduce)");
  if(html.dataset.theme&&!THEMES.some(x=>x[0]===html.dataset.theme))delete html.dataset.theme;
  /* time of day: [id, name, auto theme, from hour, to hour (night wraps past 24)] */
  const PH=[["early","Early bird","sunset",5,9],["day","Daytime","light",9,17],["evening","Evening","dark",17,21],["night","Night owl","midnight",21,29]];
  const phase=()=>{const h=new Date().getHours(),x=h<5?h+24:h;return PH.find(p=>x>=p[3]&&x<p[4]);};
  let mode=store.get("js1-theme");if(mode===null)mode="auto";
  const applyAuto=()=>{if(mode!=="auto")return;const t=phase()[2];if(html.dataset.theme!==t)html.dataset.theme=t;};
  applyAuto();
  const isDark=()=>{const e=THEMES.find(x=>x[0]===html.dataset.theme);return e&&e[2]!=null?!!e[2]:sysDark.matches;};

  /* background v9 (WebGL): a glowing ∞ ribbon with a DNA helix braided around it, rungs, two light pulses, bokeh motes, three comets
     and a slow aurora. All geometry is a static mesh moved by the vertex shader (time is a uniform), so a frame costs the CPU almost
     nothing and it runs at the display's own rate. It drifts gently with scroll and the pointer (eased). Without WebGL one still 2D
     frame is drawn instead. */
  const cv=document.createElement("canvas");cv.id="infbg";cv.setAttribute("aria-hidden","true");document.body.prepend(cv);
  let gl=null,ctx=null;

  let W=0,H=0,dpr=1,col={a:"#6366f1",b:"#a855f7"},dark=false,on=FX_ON&&store.get("js1-anim")!=="0",raf=0;const t0=performance.now();
  const rgba=(c,a)=>{c=c.trim();if(c.length===4)c="#"+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];const n=parseInt(c.slice(1),16)||0;return "rgba("+(n>>16&255)+","+(n>>8&255)+","+(n&255)+","+a.toFixed(3)+")";};
  const rgb=c=>{c=c.trim();if(c.length===4)c="#"+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];const n=parseInt(c.slice(1),16)||0;return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];};
  const pt=(u,cx,cy,A)=>{const t=u*6.2832,s=Math.sin(t),c=Math.cos(t),d=1+s*s;return [cx+A*c/d,cy+A*s*c/d];};
  /* layout: the loop sits between the sidebar and the mascot column; par = eased scroll / pointer drift */
  const par={x:0,y:0,tx:0,ty:0};let lastNow=0;
  const geo=()=>{const left=W>=1200?272:0,right=W>=1200?190:0,aw=Math.max(240,W-left-right);return {cx:left+aw/2+par.x,cy:H*.55+par.y,A:Math.min(aw*.4,H*.9)};};
  let mY=0;const sy=()=>-Math.min(scrollY,3000)*.012;
  addEventListener("scroll",()=>{par.ty=sy()+mY;},{passive:true});
  addEventListener("pointermove",e=>{par.tx=(e.clientX/W-.5)*-18;mY=(e.clientY/H-.5)*-10;par.ty=sy()+mY;},{passive:true});

  /* the WebGL context is created on first use, after the first paint: creating it can wait on the GPU process starting up */
  let GL=null;
  function initGL(){if(GL!==null)return;try{gl=cv.getContext("webgl",{alpha:true,premultipliedAlpha:true,antialias:true,powerPreference:"low-power"});}catch(e){}
  if(!gl){ctx=cv.getContext("2d");GL=false;return;}
  GL=(function(){
    const HEAD="precision highp float;uniform vec2 uRes;uniform vec2 uC;uniform float uA,uT,uAmp,uDpr,uK;uniform vec3 uCa,uCb;"+
      "vec2 lem(float u){float t=u*6.2831853;float s=sin(t),c=cos(t),d=1.+s*s;return uC+uA*vec2(c/d,s*c/d);}"+
      "vec2 clip(vec2 p){return vec2(p.x/uRes.x*2.-1.,1.-p.y/uRes.y*2.);}"+
      "float pulse(float u){float g=0.;for(int i=0;i<2;i++){float q=fract(uT*.06+float(i)*.5);float d=abs(u-q);d=min(d,1.-d);g=max(g,exp(-(d/.025)*(d/.025)));}return g;}";
    /* ribbon: aP = (u along the loop, side -1..1 across, kind 0/1 helix strands, 2 core loop, 3 rung; t -1..1 along a rung) */
    const RVS=HEAD+"attribute vec4 aP;varying float vD,vCw,vA,vMix,vK;"+
      "void main(){float u=aP.x,side=aP.y,k=aP.z;vec2 p=lem(u),q=lem(u+.0007),tg=normalize(q-p),n=vec2(-tg.y,tg.x);"+
      "float a=u*28.*6.2831853-uT*1.1,g=pulse(u);vec2 pos;float hw;vK=k;"+
      "if(k<1.5){float sg=k<.5?1.:-1.;float f=(sg*cos(a)+1.)*.5;vCw=.5+1.1*f+g;hw=vCw+6.;vA=.12+.5*f+.45*g;vMix=k;pos=p+n*(uAmp*sin(a)*sg)+n*side*hw;}"+
      "else if(k<2.5){vCw=.9+.8*g;hw=14.;vA=.42+.5*g;vMix=.5+.5*sin(u*12.566+uT*.4);pos=p+n*side*hw;}"+
      "else{vCw=.45+.5*g;hw=vCw+1.;vA=.07+.1*abs(cos(a))+.35*g;vMix=1.;pos=p+n*(uAmp*sin(a)*aP.w)+tg*side*hw;}"+
      "vD=side*hw;gl_Position=vec4(clip(pos),0.,1.);}";
    const RFS=HEAD+"varying float vD,vCw,vA,vMix,vK;"+
      "void main(){float d=abs(vD);float line=1.-smoothstep(vCw-.35,vCw+.75,d);float glow=exp(-(d*d)/((vCw+3.5)*(vCw+3.5)));"+
      "float a=vA*(line+glow*(vK>2.5?0.:vK>1.5?.55:.45))*uK;vec3 c=mix(uCa,uCb,vMix);gl_FragColor=vec4(c*a,a);}";
    /* points: aQ = (u, side offset, size, phase), aR = (speed, kind 0 mote / 1 comet tail / 2 comet head, tail fraction) */
    const PVS=HEAD+"attribute vec4 aQ;attribute vec3 aR;varying float vA,vMix,vSoft;"+
      "void main(){float k=aR.y,u,sz;vec2 off=vec2(0.);"+
      "if(k<.5){u=fract(aQ.x+uT*aR.x);vec2 p=lem(u),q=lem(u+.002),tg=normalize(q-p),n=vec2(-tg.y,tg.x);float o=aQ.y*16.*(1.+.5*sin(uT+aQ.w));"+
      "gl_Position=vec4(clip(p+n*o),0.,1.);sz=aQ.z*3.2;float s=sin(uT*1.3+aQ.w);vA=(.16+.26*s*s);vMix=step(3.14,aQ.w);vSoft=1.;}"+
      "else{float f=1.-aR.z;u=fract(aQ.x+uT*aR.x-aR.z*.157);gl_Position=vec4(clip(lem(u)),0.,1.);"+
      "if(k<1.5){sz=(3.*f+.6)*2.;vA=.34*f*f;vSoft=.6;}else{sz=46.;vA=.5;vSoft=1.;}vMix=aQ.w;}"+
      "gl_PointSize=sz*uDpr;}";
    const PFS=HEAD+"varying float vA,vMix,vSoft;"+
      "void main(){vec2 d=gl_PointCoord-.5;float r=length(d)*2.;float a=vSoft>.9?exp(-r*r*4.):1.-smoothstep(.55,1.,r);a*=vA*uK*step(r,1.);"+
      "vec3 c=mix(uCa,uCb,vMix);gl_FragColor=vec4(c*a,a);}";
    /* aurora: a few slow soft colour clouds behind everything, dithered so the gradients never band */
    const AVS="attribute vec2 aV;void main(){gl_Position=vec4(aV,0.,1.);}";
    const AFS=HEAD+"float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}"+
      "void main(){vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;float S=uA*uA;"+
      "vec2 b1=uC+uA*vec2(-.95+.18*sin(uT*.11),-.42+.12*cos(uT*.13)),b2=uC+uA*vec2(.9+.16*cos(uT*.09),.38+.14*sin(uT*.12)),b3=uC+uA*vec2(.1*sin(uT*.07),.05*cos(uT*.1));"+
      "float f1=exp(-dot(p-b1,p-b1)/(S*.42)),f2=exp(-dot(p-b2,p-b2)/(S*.42)),f3=exp(-dot(p-b3,p-b3)/(S*.18));"+
      "vec3 c=uCa*f1+uCb*f2+mix(uCa,uCb,.5)*f3*.8;float a=(f1+f2+f3*.8)*.085*uK;a+= (h(gl_FragCoord.xy+fract(uT))-.5)/255.;a=max(a,0.);gl_FragColor=vec4(c*a,a);}";
    /* shaders compile in the background (KHR_parallel_shader_compile): asking for COMPILE/LINK_STATUS straight away made the browser
       wait ~2 s for the Direct3D compiler on Windows, freezing the page at load. ready() polls without blocking; drawing starts when done. */
    const PSC=gl.getExtension("KHR_parallel_shader_compile");
    function prog(vs,fs){const p=gl.createProgram(),sh=[];for(const [t,s] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);gl.attachShader(p,x);sh.push(x);}
      gl.linkProgram(p);return {p,sh,U:null};}
    function finish(pr){if(!gl.getProgramParameter(pr.p,gl.LINK_STATUS))throw new Error(pr.sh.map(x=>gl.getShaderInfoLog(x)).join(" ")+" "+gl.getProgramInfoLog(pr.p));
      const U={};["uRes","uC","uA","uT","uAmp","uDpr","uK","uCa","uCb"].forEach(n=>U[n]=gl.getUniformLocation(pr.p,n));pr.U=U;}
    const R=prog(RVS,RFS),P=prog(PVS,PFS),A=prog(AVS,AFS);let ok=false,failed=false;
    function ready(){if(ok||failed)return ok;if(PSC&&![R,P,A].every(x=>gl.getProgramParameter(x.p,PSC.COMPLETION_STATUS_KHR)))return false;
      try{[R,P,A].forEach(finish);ok=true;}catch(e){failed=true;console.warn("∞ background: WebGL shaders failed",e);}return ok;}
    /* ribbon mesh */
    const N=520,v=[],draws=[];
    for(const k of [0,1]){const f=v.length/4;for(let i=0;i<=N;i++){const u=i/N;v.push(u,-1,k,0,u,1,k,0);}draws.push([gl.TRIANGLE_STRIP,f,(N+1)*2]);}
    {const f=v.length/4,M=360;for(let i=0;i<=M;i++){const u=i/M;v.push(u,-1,2,0,u,1,2,0);}draws.push([gl.TRIANGLE_STRIP,f,(M+1)*2]);}
    {const f=v.length/4;let n=0;for(let i=0;i<N;i+=4){const u=i/N;for(const [s,t] of [[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]])v.push(u,s,3,t);n+=6;}draws.push([gl.TRIANGLES,f,n]);}
    const rb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,rb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(v),gl.STATIC_DRAW);
    /* points: 110 motes, 3 comets × (60 tail + 1 head) */
    const q=[],r=[];
    for(let i=0;i<110;i++){q.push(Math.random(),(Math.random()-.5)*2,.6+Math.random()*1.6,Math.random()*6.283);r.push(.012+Math.random()*.03,0,0);}
    [[0,.045,0],[.34,.032,1],[.67,.038,0]].forEach(([u0,s,c])=>{q.push(u0,0,0,c);r.push(s,2,0);for(let j=0;j<60;j++){q.push(u0,0,0,c);r.push(s,1,j/60);}});
    const qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(q),gl.STATIC_DRAW);
    const rbuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,rbuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(r),gl.STATIC_DRAW);
    const NP=q.length/4;
    const ab=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,ab);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const attr=(pr,name,buf,size)=>{const l=gl.getAttribLocation(pr.p,name);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,size,gl.FLOAT,false,0,0);return l;};
    function uni(pr,T,g,ca,cb,k){const U=pr.U;gl.uniform2f(U.uRes,W,H);gl.uniform2f(U.uC,g.cx,g.cy);gl.uniform1f(U.uA,g.A);gl.uniform1f(U.uT,T);
      gl.uniform1f(U.uAmp,Math.max(9,g.A*.045));gl.uniform1f(U.uDpr,dpr);gl.uniform1f(U.uK,k);gl.uniform3fv(U.uCa,ca);gl.uniform3fv(U.uCb,cb);}
    return {draw(T){if(!ready())return;const g=geo(),ca=rgb(col.a),cb=rgb(col.b),k=dark?.6:.55;
      gl.viewport(0,0,cv.width,cv.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE,dark?gl.ONE:gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(A.p);uni(A,T,g,ca,cb,k);const la=attr(A,"aV",ab,2);gl.drawArrays(gl.TRIANGLES,0,3);gl.disableVertexAttribArray(la);
      gl.useProgram(R.p);uni(R,T,g,ca,cb,k);const lr=attr(R,"aP",rb,4);draws.forEach(([m,f,n])=>gl.drawArrays(m,f,n));gl.disableVertexAttribArray(lr);
      gl.useProgram(P.p);uni(P,T,g,ca,cb,k);const l1=attr(P,"aQ",qb,4),l2=attr(P,"aR",rbuf,3);gl.drawArrays(gl.POINTS,0,NP);gl.disableVertexAttribArray(l1);gl.disableVertexAttribArray(l2);}};
  })()||false;}

  /* 2D fallback: one still frame (the old renderer was too heavy to animate on the CPU) */
  function still2d(){if(!ctx)return;const T=(performance.now()-t0)/1000,k=dark?1:.75,{cx,cy,A}=geo();
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    const g=ctx.createLinearGradient(cx-A,cy,cx+A,cy);g.addColorStop(0,rgba(col.a,.3*k));g.addColorStop(.5,rgba(col.b,.24*k));g.addColorStop(1,rgba(col.a,.3*k));
    for(const [sg,c] of [[1,col.a],[-1,col.b],[0,null]]){ctx.beginPath();for(let i=0;i<=480;i++){const u=i/480,[x,y]=pt(u,cx,cy,A),[x2,y2]=pt(u+.001,cx,cy,A),l=Math.hypot(x2-x,y2-y)||1,o=sg*Math.max(9,A*.045)*Math.sin(u*28*6.2832-T*1.1);
        if(i)ctx.lineTo(x-(y2-y)/l*o,y+(x2-x)/l*o);else ctx.moveTo(x-(y2-y)/l*o,y+(x2-x)/l*o);}
      ctx.strokeStyle=c?rgba(c,.35*k):g;ctx.lineWidth=c?1.4:2;ctx.stroke();}}
  function size(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}
  function render(now){const T=(now-t0)/1000,dt=Math.min(.1,Math.max(0,(now-(lastNow||now))/1000));lastNow=now;
    const e=1-Math.exp(-dt*3.2);par.x+=(par.tx-par.x)*e;par.y+=(par.ty-par.y)*e;
    if(GL)GL.draw(T);else still2d();}
  function loop(now){raf=requestAnimationFrame(loop);render(now);}
  const stop=()=>{cancelAnimationFrame(raf);raf=0;lastNow=0;};
  const start=()=>{if(raf||!on||document.hidden)return;if(!GL||reduce.matches){render(performance.now());return;}raf=requestAnimationFrame(loop);};
  function recolor(){const cs=getComputedStyle(html);col={a:cs.getPropertyValue("--accent")||"#6366f1",b:cs.getPropertyValue("--accent-2")||"#a855f7"};dark=isDark();if(on&&!raf)render(performance.now());}
  function apply(){if(on)initGL();cv.classList.toggle("on",on);if(!on){stop();if(gl){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);}return;}recolor();start();}
  size();
  addEventListener("resize",()=>{size();if(on&&!raf)render(performance.now());},{passive:true});
  document.addEventListener("visibilitychange",()=>document.hidden?stop():start());
  cv.addEventListener("webglcontextlost",e=>{e.preventDefault();stop();});
  new MutationObserver(recolor).observe(html,{attributes:true,attributeFilter:["data-theme"]});
  sysDark.addEventListener("change",recolor);reduce.addEventListener("change",()=>{stop();apply();});
  /* start after the first paint, so the page text shows at once and reading the theme colours costs no extra layout */
  requestAnimationFrame(()=>setTimeout(apply,0));

  /* theme picker: the ◐ button opens it */
  const pk=document.createElement("div");pk.className="thm";pk.hidden=true;pk.setAttribute("role","dialog");pk.setAttribute("aria-label","Theme and background");
  document.body.appendChild(pk);
  function paint(){const cur=mode==="auto"?"auto":html.dataset.theme||"system";
    pk.innerHTML='<h4>Theme</h4><div class="thm-g">'+THEMES.map(([id,n,,sw])=>'<button type="button" data-th="'+id+'" aria-pressed="'+(id===cur)+'"><span class="thm-sw">'+sw.map(c=>'<i style="background:'+c+'"></i>').join("")+"</span>"+n+"</button>").join("")+
      '</div><div class="thm-row"><span>∞ Background animation</span><button type="button" data-anim="1" aria-pressed="'+on+'">'+(on?"On":"Off")+"</button></div>"+
      (reduce.matches&&on?'<p class="small muted" style="margin:6px 4px 0">Your system asks for reduced motion, so it is drawn still.</p>':"");}
  function set(id){mode=id;
    if(id==="auto"){store.set("js1-theme","auto");applyAuto();}
    else{if(id==="system")delete html.dataset.theme;else html.dataset.theme=id;store.set("js1-theme",id==="system"?"":id);}
    if(!pk.hidden)paint();document.dispatchEvent(new Event("themechange"));}
  setInterval(()=>{applyAuto();document.dispatchEvent(new Event("themechange"));},60000);
  function anim(v){on=v==null?!on:!!v;store.set("js1-anim",on?"1":"0");apply();if(!pk.hidden)paint();}
  const close=()=>{pk.hidden=true;btn.setAttribute("aria-expanded","false");};
  function open(){paint();const r=btn.getBoundingClientRect();pk.style.top=(r.bottom+8)+"px";pk.style.right=Math.max(12,innerWidth-r.right)+"px";pk.hidden=false;btn.setAttribute("aria-expanded","true");
    const b=$('[aria-pressed="true"]',pk);if(b)b.focus();}
  btn.onclick=e=>{e.stopPropagation();if(pk.hidden)open();else close();};
  btn.setAttribute("aria-label","Theme and background");btn.title="Theme and background";btn.setAttribute("aria-expanded","false");
  pk.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.th){set(b.dataset.th);$('[data-th="'+b.dataset.th+'"]',pk).focus();}else if(b.dataset.anim)anim();});
  document.addEventListener("click",e=>{if(!pk.hidden&&!e.target.closest(".thm,#theme"))close();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!pk.hidden){close();btn.focus();}});
  addEventListener("resize",close,{passive:true});
  return {list:THEMES,set,anim,phase,PH,get on(){return on;},get mode(){return mode;}};
})();

/* enhancements v3: mock interview, complexity sheet filter, command palette, shortcut sheet, print */
(function(){
  const load=(k,d)=>{try{return JSON.parse(store.get(k)||"null")||d}catch(e){return d}};
  const typing=t=>t&&t.closest&&t.closest("input,textarea,select,.CodeMirror,[contenteditable]");
  const flash=el=>{el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash");};
  const jump=(el,center)=>{if(!el)return;const d=el.closest("details");if(d)d.open=true;
    el.scrollIntoView({block:center?"center":"start"});if(center)flash(el);
    const s=el.closest("section,.band");if(s&&s.id)history.replaceState(null,"","#"+s.id);};
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

  /* mock interview: every numbered Q&A (<details class="d"> with a .q badge) from the lessons */
  /* the questions come from COURSE.qa (all lessons); "open in the lesson" jumps to the answer here or opens its page */
  const QS=COURSE.qa;
  const qEl=q=>{const s=document.getElementById(q.sec);return s&&$$("details.d",s).find(d=>{const n=$("summary .q",d);return n&&q.sec+":"+n.textContent.trim()===q.k;});};
  const openQ=q=>{const el=qEl(q);if(el)jump(el,true);else location.href=secUrl(q.sec);};
  const root=$("#mockviz .vbody");
  if(root&&QS.length){
    const LSH=[...new Set(QS.map(q=>q.l))],byK={};QS.forEach(q=>byK[q.k]=q);
    let hist=load("js1-mock",{}),cfg=Object.assign({ls:[],weak:false,n:10,t:60},load("js1-mock-cfg",{}));
    let deck=[],res=[],i=0,shown=false,active=false,timer=null,end=0;
    const saveH=()=>store.set("js1-mock",JSON.stringify(hist)),saveC=()=>store.set("js1-mock-cfg",JSON.stringify(cfg));
    const isWeak=q=>hist[q.k]&&hist[q.k].r>1;
    const pool=()=>QS.filter(q=>(!cfg.ls.length||cfg.ls.includes(q.l))&&(!cfg.weak||isWeak(q)));
    const chip=(f,v,t)=>'<button type="button" class="chip'+(cfg[f]===v?" on":"")+'" data-'+f+'="'+v+'" aria-pressed="'+(cfg[f]===v)+'">'+t+"</button>";
    const stop=()=>{clearInterval(timer);timer=null;};
    function setup(){
      active=false;stop();
      const tried=QS.filter(q=>hist[q.k]).length,nailed=QS.filter(q=>hist[q.k]&&hist[q.k].r===1).length,weak=QS.filter(isWeak).length,n=pool().length,size=cfg.n?Math.min(n,cfg.n):n;
      root.innerHTML='<div class="mk-set"><div class="mk-stats"><span><b>'+QS.length+"</b> questions</span><span><b>"+nailed+"</b> nailed</span><span><b>"+weak+"</b> weak</span><span><b>"+(QS.length-tried)+"</b> not tried</span></div>"+
        '<div class="mk-row" role="group" aria-label="Lessons"><b>Lessons</b>'+LSH.map(l=>'<button type="button" class="chip'+(cfg.ls.includes(l)?" on":"")+'" data-l="'+l+'" aria-pressed="'+cfg.ls.includes(l)+'">'+l+"</button>").join("")+
          '<button type="button" class="chip'+(cfg.weak?" on":"")+'" data-w="1" aria-pressed="'+cfg.weak+'">Weak only</button></div>'+
        '<div class="mk-row" role="group" aria-label="Questions per round"><b>Round</b>'+[5,10,20,0].map(v=>chip("n",v,v?v+" questions":"All")).join("")+"</div>"+
        '<div class="mk-row" role="group" aria-label="Time per question"><b>Timer</b>'+[0,45,60,90,120].map(v=>chip("t",v,v?v+" s":"Off")).join("")+"</div>"+
        '<div class="mk-row"><button type="button" class="btn pri" data-act="start"'+(n?"":" disabled")+">Start round · "+size+(size===1?" question":" questions")+"</button>"+
          (tried?' <button type="button" class="btn" data-act="clear">Clear history</button>':"")+"</div>"+
        (n?'<p class="small muted">No lesson selected means all lessons. Answer aloud as if to an interviewer, then rate yourself honestly.</p>':'<p class="small muted">'+(cfg.weak?"No weak questions here yet. Turn off <i>Weak only</i> or pick other lessons.":"No questions match.")+"</p>")+"</div>";
    }
    function start(list){if(!list.length)return;deck=shuffle(list.slice());if(cfg.n&&!list._again)deck=deck.slice(0,cfg.n);res=[];i=0;active=true;show();root.closest(".viz").scrollIntoView({block:"nearest"});}
    function show(){
      shown=false;const q=deck[i];
      root.innerHTML='<div class="mk-card"><div class="mk-top"><span>Question '+(i+1)+" / "+deck.length+" · "+q.l+' · <a href="'+secUrl(q.sec)+'">'+esc(q.st)+'</a></span><span class="mk-dots" aria-hidden="true">'+
          deck.map((x,j)=>'<i class="'+(j===i?"cur":res[j]?"v"+res[j]:"")+'"></i>').join("")+"</span></div>"+
        '<div class="mk-q">'+q.q+"</div>"+
        (cfg.t?'<div class="mk-tm"><span class="mk-bar"><i></i></span><span class="mk-s">'+cfg.t+" s</span></div>":"")+
        '<div class="mk-a" hidden></div>'+
        '<div class="mk-act"><button type="button" class="btn pri" data-act="reveal">Reveal answer</button><button type="button" class="btn" data-act="end">End round</button></div></div>';
      stop();if(cfg.t){end=Date.now()+cfg.t*1000;timer=setInterval(tick,200);tick();}
    }
    function tick(){const tm=$(".mk-tm",root);if(!tm){stop();return;}
      const left=Math.max(0,end-Date.now()),f=left/(cfg.t*1000);
      $(".mk-bar i",tm).style.transform="scaleX("+f+")";$(".mk-s",tm).textContent=left?Math.ceil(left/1000)+" s":"Time's up";
      tm.classList.toggle("low",left>0&&f<.25);tm.classList.toggle("out",!left);
      if(!left){stop();reveal();}}
    function reveal(){if(shown||!active)return;shown=true;stop();
      const a=$(".mk-a",root);a.innerHTML="<b>Model answer.</b> "+deck[i].a;a.hidden=false;
      $(".mk-act",root).innerHTML='<button type="button" class="btn r1" data-r="1">✓ Nailed it</button><button type="button" class="btn r2" data-r="2">~ Shaky</button><button type="button" class="btn r3" data-r="3">✗ Missed</button><button type="button" class="btn" data-act="open">Open in the lesson</button><button type="button" class="btn" data-act="end">End round</button>';}
    function rate(r){if(!shown)return;const q=deck[i];res[i]=r;hist[q.k]={r,t:Date.now()};saveH();if(++i<deck.length)show();else finish();}
    function finish(){
      active=false;stop();const done=res.filter(Boolean).length;if(!done){setup();return;}
      const c=[1,2,3].map(r=>res.filter(x=>x===r).length),weak=deck.map((q,j)=>({q,r:res[j]})).filter(x=>x.r>1);
      root.innerHTML='<div class="mk-sum"><div class="mk-big">'+c[0]+" / "+done+' nailed</div><div class="mk-stats"><span><b>'+c[0]+"</b> nailed</span><span><b>"+c[1]+"</b> shaky</span><span><b>"+c[2]+"</b> missed</span>"+(done<deck.length?"<span><b>"+(deck.length-done)+"</b> skipped</span>":"")+"</div>"+
        (weak.length?'<div class="mk-list">'+weak.map(x=>'<a href="'+secUrl(x.q.sec)+'" data-k="'+esc(x.q.k)+'"><small>'+x.q.l+" · "+esc(x.q.st)+" · "+(x.r===2?"shaky":"missed")+"</small>"+x.q.q+"</a>").join("")+"</div>":"<p>Every answer nailed. Try a longer round, a shorter timer or another lesson.</p>")+
        '<div class="mk-act">'+(weak.length?'<button type="button" class="btn pri" data-act="again">Drill these '+weak.length+" again</button>":"")+'<button type="button" class="btn" data-act="new">New round</button></div></div>';
    }
    root.addEventListener("click",e=>{
      const a=e.target.closest(".mk-list a");if(a){e.preventDefault();const q=byK[a.dataset.k];if(q)openQ(q);return;}
      const b=e.target.closest("button");if(!b)return;const D=b.dataset;
      if(D.r){rate(+D.r);return;}
      if(D.act==="reveal"){reveal();return;}
      if(D.act==="end"){finish();return;}
      if(D.act==="open"){openQ(deck[i]);return;}
      if(D.act==="start"){start(pool());return;}
      if(D.act==="again"){const w=deck.filter((q,j)=>res[j]>1);w._again=true;start(w);return;}
      if(D.act==="new"){setup();return;}
      if(D.act==="clear"){if(!confirm("Clear your mock interview history (nailed / weak ratings)?"))return;hist={};saveH();}
      else if(D.l)cfg.ls=cfg.ls.includes(D.l)?cfg.ls.filter(x=>x!==D.l):cfg.ls.concat(D.l);
      else if(D.w)cfg.weak=!cfg.weak;
      else if(D.n!=null)cfg.n=+D.n;
      else if(D.t!=null)cfg.t=+D.t;
      else return;
      saveC();setup();});
    document.addEventListener("keydown",e=>{
      if(!active||e.ctrlKey||e.metaKey||e.altKey||typing(e.target)||$("dialog[open]"))return;
      const r=root.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
      if(e.key==="Escape"){finish();return;}
      if(!shown&&e.key===" "){e.preventDefault();reveal();}
      else if(shown&&/^[123]$/.test(e.key)){e.preventDefault();rate(+e.key);}});
    setup();
  }

  /* complexity cheat sheet: category chips + text filter */
  const boT=$("#boT");
  if(boT){let cat="";const rows=$$("tr[data-c]",boT),q=$("#boQ"),cats=$(".bo-cats");
    const f=()=>{const s=q.value.trim().toLowerCase();let n=0;
      rows.forEach(r=>{const m=(!cat||r.dataset.c===cat)&&(!s||r.textContent.toLowerCase().includes(s));r.hidden=!m;if(m)n++;});
      $("#boNone").hidden=!!n;boT.hidden=!n;};
    q.addEventListener("input",f);
    cats.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;cat=b.dataset.c;
      $$(".chip",cats).forEach(x=>{x.classList.toggle("on",x===b);x.setAttribute("aria-pressed",String(x===b));});f();});
    $$(".chip",cats).forEach(x=>x.setAttribute("aria-pressed",String(x.classList.contains("on"))));}

  /* command palette (Ctrl/⌘ + K) and keyboard shortcut sheet (?) */
  const mac=/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent),MOD=mac?"⌘":"Ctrl";
  const pal=document.createElement("dialog");pal.className="pal";pal.id="cmdk";pal.setAttribute("aria-label","Command palette");
  pal.innerHTML='<div class="pal-in"><span aria-hidden="true">⌕</span><input type="text" placeholder="Jump to a section, tool or quiz, or run a command…" aria-label="Search commands" aria-controls="palList" autocomplete="off" spellcheck="false"><kbd>Esc</kbd></div>'+
    '<div class="pal-list" id="palList" role="listbox" aria-label="Results"></div><div class="pal-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>?</kbd> all shortcuts</span></div>';
  const keys=document.createElement("dialog");keys.className="pal";keys.id="kbdlg";keys.setAttribute("aria-label","Keyboard shortcuts");
  keys.innerHTML='<div class="kb-h">Keyboard shortcuts<button type="button" aria-label="Close">✕</button></div><ul class="kb-list">'+
    [[MOD+" K","Command palette: jump anywhere, run a command"],["/","Search sections and text in the sidebar"],["?","This list"],["Esc","Close a panel, the sidebar or a mock round"],
     ["Ctrl Space","Suggestions in a code editor"],["Ctrl /","Comment or uncomment lines in an editor"],["Space","Mock interview: reveal the answer"],["1  2  3","Mock interview: nailed · shaky · missed"],["Enter","Sidebar search: open the first match"]]
    .map(([k,t])=>"<li><span>"+esc(t)+"</span><span>"+k.split(/\s+/).map(x=>"<kbd>"+esc(x)+"</kbd>").join(" ")+"</span></li>").join("")+"</ul>";
  document.body.append(pal,keys);
  const pin=$("input",pal),plist=$(".pal-list",pal);
  /* [name, element, the section it lives in (to open its page when it is not on this one)] */
  const TOOLS=[["String Pool visualizer","#poolviz","pool"],["String methods playground (43 methods)","#smPlay","st-methods"],["Method explorer","#mx","methods"],["Character inspector","#ci","unicode"],["StringBuilder capacity simulator","#capviz","d-builder"],
    ["String algorithm stepper","#sviz","s-window"],["Array algorithm stepper","#aviz","a-patterns"],["Playground","#playground","playground"],["Mock interview","#mockviz","mock"],["Complexity cheat sheet","#bigo","bigo"],["Memory Lab","#mlApp","memlab"],["Algorithm race","#raceApp","race"],["Car Factory (class vs object)","#olFactory","o-class"],["Boxes and car keys (primitive vs reference)","#anBoxes","f-types"],["Car odometer (overflow)","#anOdo","f-operators"],["Waterfall (switch fall-through)","#anFall","f-control"],["Stack of plates (call stack)","#anPlates","f-methods"],["Photocopies and spare keys (pass-by-value)","#anCopy","f-pass"],["Identical twins (== vs equals)","#anTwins","compare"],["Stone tablets vs whiteboard","#anTablet","build"],["Caterpillar (sliding window)","#anCat","s-window"],["Numbered lockers (arrays)","#anLockers","a-what"],["Cinema seats (2D arrays)","#anCinema","a-multi"],["Guess the number (binary search)","#anGuess","a-sort"],["Town clock (static)","#anClock","o-static"],["Four pillars as a car","#olStory","o-review"],["Object lab (references and GC)","#olObj","o-class"],["Initialisation order","#olInit","o-ctor"],["Access modifier map","#olAccess","o-encap"],["static vs instance","#olStatic","o-static"],["Fragile base class","#olFragile","o-inherit"],["Dispatch simulator","#olDispatch","o-poly"],["Default-method resolver","#olDiamond","o-abstract"],["HashSet buckets (equals/hashCode)","#olHash","o-object"],["Record expander","#olRecord","o-modern"],["Exhaustive switch checker","#olSealed","o-modern"],["Learning path: sorting from scratch","#bsPath","bs-explorer"],["The three moves: compare, swap, shift","#bsMoves","bs-explorer"],["Sorting explorer (every interview sort)","#bsx","bs-explorer"],["Watch the loops count (Big-O)","#cxLoops","cx-complexity"],["Growth chart: O(1) to O(n!)","#cxGrow","cx-complexity"],["Recursion tree: time vs stack space","#cxTree","cx-complexity"],["Amortized O(1): ArrayList growth","#cxAmort","cx-complexity"],["Bubble Lab (11 sorting variants)","#bsLab","bs-what"],["Valet parking (bubble sort)","#anValet","bs-what"],["Stability lab","#bsStable","bs-generic"],["Inversions grid","#bsInv","bs-special"],["Complexity chart (bubble sort)","#bsChart","bs-cost"],["Bubble sort variant race","#bsRace","bs-cost"],["Which collection? (family tree)","#clPick","c-overview"],["Wildcard checker (PECS)","#clPecs","c-generics"],["ArrayList vs LinkedList","#clList","c-list"],["Parking lot (HashMap analogy)","#anPark","c-hashmap"],["Real HashMap: buckets, resize, treeify","#clMap","c-hashmap"],["LRU cache (LinkedHashMap)","#clLru","c-sets"],["TreeMap navigator","#clNav","c-treemap"],["Binary heap (PriorityQueue)","#clHeap","c-queue"],["ArrayDeque ring buffer","#clDeque","c-queue"],["Comparator builder","#clCmp","c-compare"],["Fail-fast iterator","#clFail","c-iter"],["Views vs copies","#clView","c-immut"],["Lost update (ConcurrentHashMap)","#clRace","c-conc"],["Review queue","#revise","revise"],["Checklist","#chk","revise"]];
  let E=[],vis=[],sel=0;
  function entries(){const L=[],A=(g,n,t,run,hint)=>L.push({g,n,t,run,hint:hint||""});
    A("Commands","›","Choose a theme…",()=>$("#theme").click());
    A("Commands","›",MOTION_OFF?"Turn all animations on":"Turn all animations off (stop everything)",()=>setMotion(MOTION_OFF));
    A("Commands","📖",store.get("js1-gloss")==="0"?"Turn glossary hints on (dotted words)":"Turn glossary hints off",()=>{store.set("js1-gloss",store.get("js1-gloss")==="0"?"1":"0");location.reload();});
    {let L0=null;try{L0=JSON.parse(store.get("js1-last")||"null");}catch(e){}if(L0&&SECP[L0.id])A("Commands","↩","Continue where you left off: "+L0.l+" · "+L0.n+" "+L0.t,()=>{location.href=secUrl(L0.id);});}
    A("Commands","›","Turn the ∞ background animation "+(THM.on?"off":"on"),()=>THM.anim());
    A("Commands","✨",FX_ON?"Pause the effects (rider, tree, mascot, weather, background)":"Turn the effects on (rider, tree, mascot, weather, background)",()=>setFx(!FX_ON));
    if(FX_ON){
    A("Commands","›","Summon the fire rider",()=>RIDER.go());
    A("Commands","🎃","Halloween mode: "+(HALLOWEEN.on?"turn off":"turn on"),()=>HALLOWEEN.set(HALLOWEEN.on?"0":"1"));A("Commands","🎃","Halloween mode: automatic (21 Oct – 1 Nov)",()=>HALLOWEEN.set(""));
    A("Commands","🪔","Diwali mode: "+(FEST.diwali?"turn off":"turn on"),()=>FEST.set("diwali",FEST.diwali?"0":"1"));A("Commands","🪔","Diwali mode: automatic (5 days around Diwali)",()=>FEST.set("diwali",""));
    A("Commands","🎄","Christmas mode: "+(FEST.xmas?"turn off":"turn on"),()=>FEST.set("xmas",FEST.xmas?"0":"1"));A("Commands","🎄","Christmas mode: automatic (15 Dec – 1 Jan)",()=>FEST.set("xmas",""));
    A("Commands","🎆","Launch fireworks",()=>{for(let i=0;i<5;i++)setTimeout(()=>FEST.firework(innerWidth*(.2+.6*Math.random()),innerHeight*(.15+.25*Math.random())),i*380);});
    WX.KINDS.forEach(([id,n,ic])=>A("Weather",ic,"Weather: "+n,()=>WX.set(id)));
    }
    THM.list.forEach(([id,n])=>A("Themes","◐","Theme · "+n,()=>THM.set(id)));
    A("Commands","›","Turn editor suggestions "+(SUG.on?"off":"on"),()=>setSug(!SUG.on));
    A("Commands","›","Start a mock interview round",()=>{if(!$("#mockviz")){location.href=secUrl("mock");return;}jump($("#mockviz"),true);const b=$('#mockviz [data-act="start"]');if(b&&!b.disabled)b.click();});
    A("Commands","›","Expand every answer on the page",()=>$$("details.d").forEach(d=>d.open=true));
    A("Commands","›","Collapse every answer",()=>$$("details.d").forEach(d=>d.open=false));
    A("Commands","›","Print or save as PDF",()=>print());
    A("Commands","›","Keyboard shortcuts",()=>keys.showModal(),"?");
    A("Commands","›","Back to top",()=>scrollTo({top:0}));
    PAGES.forEach(p=>{if(p.key!==PAGE)A("Pages","▸",p.name,()=>{location.href=pageUrl(p);});});
    TOOLS.forEach(([t,s,sec])=>{const el=$(s);if(el)A("Tools","◆",t,()=>jump(el,s!=="#playground"&&s!=="#bigo"&&s!=="#revise"));else if(SECP[sec])A("Tools","◆",t,()=>{location.href=secUrl(sec);},SECP[sec].short);});
    $$(".quiz[data-quiz]").forEach(q=>A("Quizzes","?",/^l\d+$/.test(q.dataset.quiz)?"Quiz · Lesson "+q.dataset.quiz.slice(1):/^s\d+$/.test(q.dataset.quiz)?"Quiz · SQL "+q.dataset.quiz.slice(1):/^p\d+$/.test(q.dataset.quiz)?"Quiz · Patterns "+q.dataset.quiz.slice(1):"Quiz · "+(((thisPage&&thisPage.sections.find(s=>s.id===(q.closest("section")||{}).id))||{}).t||"Check yourself"),()=>jump(q)));
    $$("#pgTasks .chip").forEach(b=>A("Playground","▶","Playground task · "+b.textContent,()=>{b.click();jump($("#playground"));}));
    $$("#toc .ti").forEach(a=>{const el=document.getElementById(a.dataset.id);A("Sections",$("span",a).textContent,$("b",a).textContent,()=>{if(el)jump(el);else location.href=a.href;},el?"":(SECP[a.dataset.id]||{}).short);});
    return L;}
  function render(){
    const q=pin.value.trim().toLowerCase(),w=q.split(/\s+/).filter(Boolean),rk=x=>{const t=x.e.t.toLowerCase();return t.startsWith(q)?0:t.includes(q)?1:2;};
    vis=E.map((e,i)=>({e,i,h:(e.g+" "+e.n+" "+e.t).toLowerCase()})).filter(x=>w.every(v=>x.h.includes(v)));
    if(q)vis.sort((a,b)=>rk(a)-rk(b)||a.i-b.i);
    sel=Math.min(sel,Math.max(0,vis.length-1));
    let g="",h="";
    vis.forEach((x,k)=>{if(!q&&x.e.g!==g){g=x.e.g;h+='<div class="pal-g">'+esc(g)+"</div>";}
      h+='<button type="button" class="pal-it'+(k===sel?" on":"")+'" role="option" aria-selected="'+(k===sel)+'" data-k="'+k+'" tabindex="-1"><span>'+esc(x.e.n)+"</span><b>"+esc(x.e.t)+"</b><small>"+esc(q?x.e.g:x.e.hint)+"</small></button>";});
    plist.innerHTML=h||'<div class="pal-none">Nothing matches. Try a section name, a tool or a command.</div>';}
  function move(d){if(!vis.length)return;sel=(sel+d+vis.length)%vis.length;
    $$(".pal-it",plist).forEach((b,k)=>{b.classList.toggle("on",k===sel);b.setAttribute("aria-selected",String(k===sel));if(k===sel)b.scrollIntoView({block:"nearest"});});}
  function run(k){const x=vis[k];if(!x)return;pal.close();x.e.run();}
  function openPal(){if(keys.open)keys.close();E=entries();pin.value="";sel=0;render();pal.showModal();pin.focus();plist.scrollTop=0;}
  pin.addEventListener("input",()=>{sel=0;render();});
  pin.addEventListener("keydown",e=>{
    if(e.key==="ArrowDown"){e.preventDefault();move(1);}else if(e.key==="ArrowUp"){e.preventDefault();move(-1);}
    else if(e.key==="Enter"){e.preventDefault();run(sel);}});
  plist.addEventListener("click",e=>{const b=e.target.closest(".pal-it");if(b)run(+b.dataset.k);});
  plist.addEventListener("mousemove",e=>{const b=e.target.closest(".pal-it");if(b&&+b.dataset.k!==sel)move(+b.dataset.k-sel);});
  [pal,keys].forEach(d=>d.addEventListener("click",e=>{if(e.target===d)d.close();}));
  $("button",keys).onclick=()=>keys.close();
  const nb=document.createElement("button");nb.id="cmdBtn";nb.type="button";nb.title="Command palette ("+MOD+"+K)";nb.setAttribute("aria-label","Command palette");
  nb.innerHTML=ICO.search+'<em>'+MOD+" K</em>";nb.onclick=openPal;$("#tocBtn").before(nb);
  document.addEventListener("keydown",e=>{
    if((e.ctrlKey||e.metaKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="k"){e.preventDefault();if(pal.open)pal.close();else openPal();return;}
    if(e.key==="?"&&!e.ctrlKey&&!e.metaKey&&!typing(e.target)&&!$("dialog[open]")){e.preventDefault();keys.showModal();}
  });

  /* print: light theme and every answer open, restored afterwards */
  let pst=null;const html=document.documentElement;
  addEventListener("beforeprint",()=>{const ds=$$("details");pst={ds:ds.map(d=>d.open),th:html.dataset.theme};
    ds.forEach(d=>d.open=true);html.dataset.theme="light";$$(".CodeMirror").forEach(c=>c.CodeMirror&&c.CodeMirror.refresh());});
  addEventListener("afterprint",()=>{if(!pst)return;$$("details").forEach((d,i)=>{if(i<pst.ds.length)d.open=pst.ds[i];});
    if(pst.th)html.dataset.theme=pst.th;else delete html.dataset.theme;pst=null;});
})();

/* motion v4: hero entrance, live code window, count-up stats, scroll reveal, animated figures, spotlight cards, cursor glow */
(function(){
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  /* hero headline: words rise in */
  const h1=$("header h1");
  if(h1&&!$(".w",h1)){[...h1.childNodes].forEach(n=>{
    if(n.nodeType===3&&n.textContent.trim()){if(/^s/.test(n.textContent)&&n.previousSibling)h1.insertBefore(document.createTextNode(" "),n);const s=document.createElement("span");s.className="w";s.textContent=n.textContent.trim();h1.replaceChild(s,n);h1.insertBefore(document.createTextNode(" "),s.nextSibling);}
    else if(n.nodeType===1)n.classList.add("w");});}

  /* live code window: types a program, runs it, prints the real JDK 25 output, then moves to the next */
  const SN=[
    {f:"StringPool.java",c:'String a = "java";\nString b = "java";\nString c = new String("java");\n\nSystem.out.println(a == b);\nSystem.out.println(a == c);\nSystem.out.println(a.equals(c));',o:["true","false","true"],
     n:"<b>Same literal, same pooled object.</b> <code>new</code> makes a second object on the heap, so only <code>equals</code> sees them as equal."},
    {f:"IntegerCache.java",c:"Integer x = 127, y = 127;\nInteger p = 128, q = 128;\n\nSystem.out.println(x == y);\nSystem.out.println(p == q);",o:["true","false"],
     n:"<b>Autoboxing caches −128..127.</b> 128 creates two objects, and <code>==</code> compares references."},
    {f:"Capacity.java",c:'StringBuilder sb = new StringBuilder();\nSystem.out.println(sb.capacity());\n\nsb.append("x".repeat(17));\nSystem.out.println(sb.capacity());',o:["16","34"],
     n:"<b>Growth rule: old × 2 + 2.</b> 17 chars overflow 16, so the array grows to 34."},
    {f:"SortSearch.java",c:"int[] nums = {5, 3, 9, 1};\nArrays.sort(nums);\n\nSystem.out.println(Arrays.toString(nums));\nSystem.out.println(Arrays.binarySearch(nums, 4));",o:["[1, 3, 5, 9]","-3"],
     n:"<b>Not found returns −(insertion point) − 1.</b> 4 would go at index 2, so the result is −3."}];
  const host=$("#heroWin");
  if(host){
    host.hidden=false;
    host.innerHTML='<span class="hw-beam" aria-hidden="true"><i></i></span><div class="hw-in"><div class="hw-bar"><span class="dots"><i></i><i></i><i></i></span><div class="hw-tabs" role="tablist" aria-label="Examples">'+
      SN.map((s,i)=>'<button type="button" role="tab" data-i="'+i+'" aria-selected="false">'+esc(s.f)+"</button>").join("")+
      '</div><span class="hw-run">▶ Run</span></div><div class="hw-body"><pre class="hw-code"></pre><div class="hw-out"><div class="hw-oh">Console · JDK 25</div><pre class="hw-o"></pre><div class="hw-note"></div></div></div><div class="hw-prog"><i></i></div></div>';
    const code=$(".hw-code",host),out=$(".hw-o",host),note=$(".hw-note",host),run=$(".hw-run",host),bar=$(".hw-prog i",host),tabs=$$(".hw-tabs button",host);
    let cur=0,token=0,vis=true;
    const lines=src=>src.split("\n").map((l,i)=>'<span class="ln">'+(i+1)+"</span>"+hl(l)).join("\n");
    const paintTab=i=>tabs.forEach((t,k)=>t.setAttribute("aria-selected",String(k===i)));
    const wait=async(ms,t)=>{let left=ms;while(left>0||!vis||document.hidden){if(t!==token)return false;const step=Math.max(16,Math.min(60,left));await sleep(step);if(vis&&!document.hidden)left-=step;}return t===token;};
    function full(i){const s=SN[i];paintTab(i);code.innerHTML=lines(s.c);out.innerHTML='<span class="p">$ java '+esc(s.f)+"</span>"+s.o.map(x=>"<span>"+esc(x)+"</span>").join("");note.innerHTML=s.n;bar.style.width="100%";}
    async function play(i){
      const t=++token;cur=i;const s=SN[i];paintTab(i);out.innerHTML="";note.innerHTML="";bar.style.transition="none";bar.style.width="0";
      const total=s.c.length*26+900+s.o.length*420+3600;let el=0;const tick=ms=>{el+=ms;bar.style.transition="width .2s linear";bar.style.width=Math.min(100,100*el/total)+"%";};
      for(let n=1;n<=s.c.length;n++){
        code.innerHTML=lines(s.c.slice(0,n))+'<span class="hw-caret"></span>';
        const ch=s.c[n-1],d=ch==="\n"?140:ch===" "?18:26+Math.random()*22;if(!await wait(d,t))return;tick(d);}
      code.innerHTML=lines(s.c);
      run.classList.add("go");if(!await wait(450,t))return;run.classList.remove("go");tick(450);
      out.innerHTML='<span class="p">$ java '+esc(s.f)+"</span>";if(!await wait(450,t))return;tick(450);
      for(const o of s.o){out.insertAdjacentHTML("beforeend","<span>"+esc(o)+"</span>");if(!await wait(420,t))return;tick(420);}
      note.innerHTML=s.n;if(!await wait(3600,t))return;bar.style.width="100%";
      play((i+1)%SN.length);}
    $(".hw-tabs",host).addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const i=+b.dataset.i;if(still){full(i);}else play(i);});
    new IntersectionObserver(es=>es.forEach(e=>vis=e.isIntersecting)).observe(host);
    if(still)full(0);else play(0);
  }

  /* hero stats count up */
  if(!still)$$("header .meta b").forEach((b,i)=>{const n=parseInt(b.textContent,10);if(!(n>1))return;const t0=performance.now()+500+i*60,d=1300;b.textContent="0";
    const step=now=>{const p=Math.min(1,Math.max(0,(now-t0)/d));b.textContent=String(Math.round(n*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(step);};requestAnimationFrame(step);});

  /* figures: arrows draw in, then little packets travel along every reference; paused off screen */
  const figs=$$("figure.fig");
  const pathOf=a=>{if(a.tagName==="path")return a.getAttribute("d");if(a.tagName==="line")return "M"+a.getAttribute("x1")+" "+a.getAttribute("y1")+" L"+a.getAttribute("x2")+" "+a.getAttribute("y2");
    if(a.tagName==="polyline")return "M"+a.getAttribute("points").trim().replace(/\s+/g," ");return null;};
  function arm(f){if(f._armed)return;f._armed=1;const svg=$("svg",f);if(!svg)return;
    /* v13: the figure builds itself left to right as it scrolls in: each part fades in on a sweep (opacity only, so SVG transforms
       are untouched), the arrows then draw in as before */
    {const vb=svg.viewBox&&svg.viewBox.baseVal,W=vb&&vb.width||svg.getBoundingClientRect().width||1,x0=vb?vb.x:0;
      [...svg.children].filter(n=>!/^(defs|style|title|desc|marker)$/i.test(n.tagName)&&!n.classList.contains("a")).forEach(n=>{let x=0;try{const b=n.getBBox();x=(b.x-x0)/W;}catch(e){}
        n.animate([{opacity:0},{opacity:1}],{duration:480,delay:Math.round(60+Math.max(0,Math.min(1,x))*850),easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"});});}
    $$(".a",svg).forEach((a,i)=>{
      if(!a.classList.contains("d")&&a.getTotalLength){let L=0;try{L=a.getTotalLength();}catch(e){}if(L>0){a.style.setProperty("--len",L.toFixed(1));a.style.setProperty("--ad",(i*.09).toFixed(2)+"s");a.classList.add("drawn");}}
      const d=pathOf(a);if(!d)return;
      const c=document.createElementNS("http://www.w3.org/2000/svg","circle");c.setAttribute("r","2.8");c.setAttribute("class","pk");
      c.setAttribute("fill",getComputedStyle(a).stroke||"currentColor");
      const m=document.createElementNS("http://www.w3.org/2000/svg","animateMotion");m.setAttribute("path",d);m.setAttribute("dur",(2.2+(i%3)*.4)+"s");
      m.setAttribute("begin","-"+(i*.37).toFixed(2)+"s");m.setAttribute("repeatCount","indefinite");m.setAttribute("calcMode","spline");m.setAttribute("keyTimes","0;1");m.setAttribute("keyPoints","0;1");m.setAttribute("keySplines",".4 0 .2 1");
      c.appendChild(m);c.setAttribute("cx","0");c.setAttribute("cy","0");
      a.after(c);});}

  /* scroll reveal: content blocks fade and rise in, staggered per batch */
  const SEL=".wrap > section > :is(h2,h3,h4,p,ul,ol,.note,.tldr,figure,.viz,.tw,table,.ia,.code,.sheet,.two,.quiz,.takeaways,.expect,.bo-ctl,.pg-tasks,.chk,.rq,.rstats,.diagram,.steps,.timeline,.mem,.card),.wrap > section > details,.wrap > .band > :is(h2,p,.num),.lessons .lcard";
  if(!still&&"IntersectionObserver" in window){
    const els=$$(SEL).filter(el=>!el.closest(".secfoot"));
    const io=new IntersectionObserver(es=>{let k=0;es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;el.style.setProperty("--rd",Math.min(k++,4)*.04+"s");el.classList.add("in");io.unobserve(el);
      if(el.matches("figure.fig"))arm(el);});},{rootMargin:"0px 0px 12% 0px",threshold:0});
    els.forEach(el=>{const r=el.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)el.classList.add("rv","in");else{el.classList.add("rv");io.observe(el);}});
    figs.forEach(f=>{if(f.classList.contains("in"))arm(f);});
    const fio=new IntersectionObserver(es=>es.forEach(e=>{const svg=$("svg",e.target);if(!svg||!svg.pauseAnimations)return;e.target.classList.toggle("play",e.isIntersecting);
      if(e.isIntersecting){arm(e.target);svg.unpauseAnimations();}else svg.pauseAnimations();}));
    figs.forEach(f=>fio.observe(f));
    addEventListener("beforeprint",()=>$$(".rv").forEach(el=>el.classList.add("in")));
  }

  /* spotlight + gentle tilt on lesson cards; cursor glow; nav shadow once scrolled */
  const fine=matchMedia("(pointer: fine)").matches;
  if(fine&&!still){
    $$(".lcard").forEach(c=>{
      c.addEventListener("pointermove",e=>{const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;c.style.setProperty("--mx",x+"px");c.style.setProperty("--my",y+"px");
        c.style.transform="perspective(700px) rotateX("+((.5-y/r.height)*5).toFixed(2)+"deg) rotateY("+((x/r.width-.5)*6).toFixed(2)+"deg) translateY(-2px)";});
      c.addEventListener("pointerleave",()=>{c.style.transform="";});});
    const g=document.createElement("div");g.id="glow";g.setAttribute("aria-hidden","true");document.body.appendChild(g);
    let gx=innerWidth/2,gy=innerHeight/3,tx=gx,ty=gy,gr=0;
    const mv=()=>{gx+=(tx-gx)*.12;gy+=(ty-gy)*.12;g.style.transform="translate("+gx.toFixed(1)+"px,"+gy.toFixed(1)+"px)";gr=Math.abs(tx-gx)+Math.abs(ty-gy)>.5?requestAnimationFrame(mv):0;};
    addEventListener("pointermove",e=>{tx=e.clientX;ty=e.clientY;g.classList.add("on");if(!gr)gr=requestAnimationFrame(mv);},{passive:true});
    document.addEventListener("pointerleave",()=>g.classList.remove("on"));
  }
  const nav=$("nav");addEventListener("scroll",()=>nav.classList.toggle("scrolled",scrollY>8),{passive:true});
})();

/* step-through runner (v13): "Watch it run" boxes (.runviz[data-run]) play a short program line by line: the current line glides,
   stack frames are pushed and popped, objects appear on the heap (String pool / Integer cache / heap), reference arrows draw in, and
   the console fills. Each trace (RUNS) mirrors what Java really does; the programs were run on JDK 25 and their output matches.
   A trace is built with T(code, build): build gets {call, ret, set, obj, upd, out, s}; s(line, message, hot) records a step. */
(function(){
  const hosts=$$(".runviz[data-run]");if(!hosts.length)return;
  function T(file,code,build){const st={f:[],h:[],o:""},steps=[];
    const api={call(n){st.f.push({n,v:[]});},ret(){st.f.pop();},
      set(name,val){const fr=st.f[st.f.length-1],e=fr.v.find(x=>x[0]===name);if(e)e[1]=val;else fr.v.push([name,val]);},
      obj(id,o){st.h.push(Object.assign({id},o));return {r:id};},upd(id,o){Object.assign(st.h.find(x=>x.id===id),o);},
      out(t){st.o+=t+"\n";},s(l,m,hot){steps.push(JSON.parse(JSON.stringify({l,m,hot:hot||[],f:st.f,h:st.h,o:st.o})));}};
    build(api);return {file,code,steps};}
  const RUNS={
    fact:T("Factorial.java",`public class Factorial {
    static int fact(int n) {
        if (n <= 1) return 1;
        return n * fact(n - 1);
    }
    public static void main(String[] args) {
        int r = fact(3);
        System.out.println(r);
    }
}`,R=>{R.call("main");R.s(6,"The JVM calls <code>main</code>: a new <b>frame</b> is pushed on the stack.");
      R.s(7,"Before <code>r</code> can get a value, <code>fact(3)</code> must run.");
      R.call("fact");R.set("n","3");R.s(2,"A new frame for <code>fact</code>, with its own <code>n = 3</code>.",["n"]);
      R.s(3,"<code>3 &lt;= 1</code> is false, so carry on.");R.s(4,"It needs <code>fact(2)</code> first, so this frame waits.");
      R.call("fact");R.set("n","2");R.s(2,"Another frame. Each call has its <b>own copy</b> of <code>n</code>.",["n"]);
      R.s(3,"<code>2 &lt;= 1</code> is false.");R.s(4,"Now it waits for <code>fact(1)</code>.");
      R.call("fact");R.set("n","1");R.s(2,"A third frame: <code>n = 1</code>.",["n"]);
      R.s(3,"<code>1 &lt;= 1</code> is true: the <b>base case</b> returns 1 without calling again.");
      R.ret();R.set("fact(n - 1)","1");R.s(4,"The top frame is popped. <code>fact(2)</code> gets 1 back: 2 × 1 = 2.",["fact(n - 1)"]);
      R.ret();R.set("fact(n - 1)","2");R.s(4,"Popped again. <code>fact(3)</code> gets 2 back: 3 × 2 = 6.",["fact(n - 1)"]);
      R.ret();R.set("r","6");R.s(7,"Back in <code>main</code>: <code>r = 6</code>. Without a base case the frames would pile up until <code>StackOverflowError</code>.",["r"]);
      R.out("6");R.s(8,"Prints <b>6</b>.");}),
    pbv:T("PassByValue.java",`public class PassByValue {
    static void change(int x, int[] arr) {
        x = 99;
        arr[0] = 99;
    }
    public static void main(String[] args) {
        int n = 1;
        int[] a = {1, 2};
        change(n, a);
        System.out.println(n + " " + a[0]);
    }
}`,R=>{R.call("main");R.s(6,"<code>main</code> starts with its own frame.");
      R.set("n","1");R.s(7,"A primitive: the value 1 sits right in the frame.",["n"]);
      R.set("a",R.obj("A",{k:"arr",t:"int[]",v:["1","2"]}));R.s(8,"The array lives on the <b>heap</b>; <code>a</code> holds a <b>reference</b> to it.",["a","A"]);
      R.s(9,"<code>change(n, a)</code> copies both values: the number 1 and the reference.");
      R.call("change");R.set("x","1");R.set("arr",{r:"A"});R.s(2,"<code>change</code> gets copies: <code>x = 1</code>, and <code>arr</code> points to the <b>same</b> array.",["x","arr","A"]);
      R.set("x","99");R.s(3,"This only changes the copy <code>x</code> in this frame.",["x"]);
      R.upd("A",{v:["99","2"],hl:[0]});R.s(4,"<code>arr[0] = 99</code> goes through the reference and changes the shared array.",["arr","A"]);
      R.ret();R.s(9,"<code>change</code> returns; its frame, and <code>x</code>, are gone.");
      R.out("1 99");R.s(10,"<code>n</code> is still 1, but <code>a[0]</code> is 99. Java passes a <b>copy</b> of each value, and for an object that value is the reference.");}),
    icache:T("IntegerCache.java",`public class IntegerCache {
    public static void main(String[] args) {
        Integer a = 127, b = 127;
        Integer c = 128, d = 128;
        System.out.println(a == b);
        System.out.println(c == d);
        System.out.println(c.equals(d));
    }
}`,R=>{R.call("main");R.s(2,"<code>main</code> starts.");
      R.set("a",R.obj("I1",{k:"box",t:"Integer",v:"127",cache:true}));R.set("b",{r:"I1"});
      R.s(3,"Autoboxing calls <code>Integer.valueOf(127)</code>. Values −128 to 127 come from a shared <b>cache</b>, so <code>a</code> and <code>b</code> get the same object.",["a","b","I1"]);
      R.set("c",R.obj("I2",{k:"box",t:"Integer",v:"128"}));R.set("d",R.obj("I3",{k:"box",t:"Integer",v:"128"}));
      R.s(4,"128 is outside the cache, so <code>valueOf</code> creates <b>two different</b> objects.",["c","d","I2","I3"]);
      R.out("true");R.s(5,"<code>==</code> compares references: the same cached object, so <b>true</b>.",["a","b"]);
      R.out("false");R.s(6,"Two objects, so <b>false</b>, even though both hold 128.",["c","d"]);
      R.out("true");R.s(7,"<code>equals</code> compares the values: <b>true</b>. Always use <code>equals</code> for wrappers.",["I2","I3"]);}),
    immut:T("Immutable.java",`public class Immutable {
    public static void main(String[] args) {
        String s = "hi";
        String t = s;
        s = s + "!";
        System.out.println(s);
        System.out.println(t);
        System.out.println(s == t);
    }
}`,R=>{R.call("main");R.s(2,"<code>main</code> starts.");
      R.set("s",R.obj("P1",{k:"str",v:"hi",pool:true}));R.s(3,"The literal <code>\"hi\"</code> lives in the <b>String pool</b>; <code>s</code> points to it.",["s","P1"]);
      R.set("t",{r:"P1"});R.s(4,"<code>t = s</code> copies the reference: both point to the same String.",["t","P1"]);
      R.set("s",R.obj("H1",{k:"str",v:"hi!"}));R.s(5,"A String never changes. <code>s + \"!\"</code> builds a <b>new</b> String at run time, on the heap, and <code>s</code> moves to it. <code>\"hi\"</code> is untouched.",["s","H1"]);
      R.out("hi!");R.s(6,"Prints <b>hi!</b>.");R.out("hi");R.s(7,"<code>t</code> still sees the original <b>hi</b>.",["t"]);
      R.out("false");R.s(8,"Different objects, so <code>==</code> is <b>false</b>.",["s","t"]);}),
    sb:T("Builder.java",`public class Builder {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        sb.append("Java");
        sb.append(" rocks");
        sb.reverse();
        String r = sb.toString();
        System.out.println(r + " " + sb.length() + " " + sb.capacity());
    }
}`,R=>{const C=s=>s.split("");R.call("main");R.s(2,"<code>main</code> starts.");
      R.set("sb",R.obj("SB",{k:"sb",v:[],cap:16}));R.s(3,"An empty builder with room for <b>16</b> chars.",["sb","SB"]);
      R.obj("L1",{k:"str",v:"Java",pool:true});R.upd("SB",{v:C("Java"),hl:[0,1,2,3]});R.s(4,"<code>append</code> copies the chars into the builder's own array. No new String per step.",["SB"]);
      R.obj("L2",{k:"str",v:" rocks",pool:true});R.upd("SB",{v:C("Java rocks"),hl:[4,5,6,7,8,9]});R.s(5,"10 chars still fit in 16, so the array didn't have to grow.",["SB"]);
      R.upd("SB",{v:C("skcor avaJ"),hl:[0,1,2,3,4,5,6,7,8,9]});R.s(6,"<code>reverse()</code> works <b>in place</b> on the same object.",["SB"]);
      R.set("r",R.obj("H1",{k:"str",v:"skcor avaJ"}));R.upd("SB",{hl:[]});R.s(7,"<code>toString()</code> copies the chars into a new, immutable String.",["r","H1"]);
      R.out("skcor avaJ 10 16");R.s(8,"Length 10, capacity still 16.");}),
    pal:T("Palindrome.java",`public class Palindrome {
    public static void main(String[] args) {
        String s = "abba";
        int i = 0, j = s.length() - 1;
        boolean ok = true;
        while (i < j) {
            if (s.charAt(i) != s.charAt(j)) { ok = false; break; }
            i++; j--;
        }
        System.out.println(ok);
    }
}`,R=>{R.call("main");R.s(2,"<code>main</code> starts.");
      R.set("s",R.obj("P",{k:"str",v:"abba",pool:true,cells:true}));R.s(3,"The String <code>\"abba\"</code>, shown as its chars.",["s","P"]);
      R.set("i","0");R.set("j","3");R.upd("P",{ptr:{0:"i",3:"j"}});R.s(4,"Two pointers: <code>i</code> at the start, <code>j</code> at the end (<code>length() − 1 = 3</code>).",["i","j"]);
      R.set("ok","true");R.s(5,"Assume it's a palindrome until a pair differs.",["ok"]);
      R.s(6,"<code>0 &lt; 3</code>, so the loop runs.");R.upd("P",{hl:[0,3]});R.s(7,"<code>charAt(0)</code> is 'a' and <code>charAt(3)</code> is 'a': equal, so no break.",["P"]);
      R.set("i","1");R.set("j","2");R.upd("P",{ptr:{1:"i",2:"j"},hl:[]});R.s(8,"Both pointers move inward.",["i","j"]);
      R.s(6,"<code>1 &lt; 2</code>, loop again.");R.upd("P",{hl:[1,2]});R.s(7,"'b' and 'b': equal.",["P"]);
      R.set("i","2");R.set("j","1");R.upd("P",{ptr:{2:"i",1:"j"},hl:[]});R.s(8,"Move inward again.",["i","j"]);
      R.s(6,"<code>2 &lt; 1</code> is false: the pointers crossed and every pair matched.");
      R.out("true");R.s(10,"Prints <b>true</b>. O(n) time, O(1) extra space.");}),
    alias:T("Aliasing.java",`import java.util.Arrays;

public class Aliasing {
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        int[] b = a;
        int[] c = a.clone();
        b[0] = 9;
        c[1] = 7;
        System.out.println(Arrays.toString(a));
        System.out.println(Arrays.toString(c));
    }
}`,R=>{R.call("main");R.s(4,"<code>main</code> starts.");
      R.set("a",R.obj("A",{k:"arr",t:"int[]",v:["1","2","3"]}));R.s(5,"One array on the heap; <code>a</code> refers to it.",["a","A"]);
      R.set("b",{r:"A"});R.s(6,"<code>b = a</code> copies the <b>reference</b>: one array, two names (an alias).",["b","A"]);
      R.set("c",R.obj("C",{k:"arr",t:"int[]",v:["1","2","3"]}));R.s(7,"<code>clone()</code> makes a <b>second</b> array with the same values.",["c","C"]);
      R.upd("A",{v:["9","2","3"],hl:[0]});R.s(8,"Writing through <code>b</code> changes the array that <code>a</code> sees too.",["b","A"]);
      R.upd("A",{hl:[]});R.upd("C",{v:["1","7","3"],hl:[1]});R.s(9,"<code>c</code> is a separate array, so <code>a</code> is not affected.",["c","C"]);
      R.out("[9, 2, 3]");R.s(10,"Prints <b>[9, 2, 3]</b>.");R.out("[1, 7, 3]");R.s(11,"Prints <b>[1, 7, 3]</b>. Note: <code>clone()</code> is shallow for arrays of objects.");}),
    objs:T("Cars.java",`public class Cars {
    static class Car {
        String model;
        int speed;
        Car(String m) { model = m; }
    }
    public static void main(String[] args) {
        Car a = new Car("Swift");
        Car c = a;
        c.speed = 60;
        a = new Car("Nexon");
        System.out.println(c.model + " " + c.speed);
    }
}`,R=>{R.call("main");R.s(7,"<code>main</code> starts with an empty frame.");
      R.obj("C1",{k:"box",t:"Car",v:"model=null · speed=0"});R.s(8,"<code>new</code> first allocates a Car on the <b>heap</b>, with every field at its default value.",["C1"]);
      R.call("Car");R.set("this",{r:"C1"});R.set("m","\"Swift\"");R.s(5,"The constructor gets its own frame: <code>this</code> refers to the new object, <code>m</code> is the argument.",["this","m","C1"]);
      R.upd("C1",{v:"model=\"Swift\" · speed=0"});R.s(5,"<code>model = m</code> really means <code>this.model = m</code>: the object's field is set.",["C1"]);
      R.ret();R.set("a",{r:"C1"});R.s(8,"The constructor frame is popped and <code>new</code> hands back the <b>reference</b>, stored in <code>a</code>.",["a","C1"]);
      R.set("c",{r:"C1"});R.s(9,"<code>c = a</code> copies the reference. There is still only <b>one</b> Car.",["c","C1"]);
      R.upd("C1",{v:"model=\"Swift\" · speed=60"});R.s(10,"Writing through <code>c</code> changes the shared object, so <code>a</code> sees it too.",["c","C1"]);
      R.obj("C2",{k:"box",t:"Car",v:"model=\"Nexon\" · speed=0"});R.set("a",{r:"C2"});R.s(11,"A second Car is built the same way, and only <code>a</code> is re-pointed to it. <code>c</code> still refers to the first car.",["a","C2"]);
      R.out("Swift 60");R.s(12,"Prints <b>Swift 60</b>. Re-pointing a variable never changes the object another variable refers to.",["c","C1"]);}),
    virt:T("Zoo.java",`public class Zoo {
    static class Animal {
        String sound() { return "..."; }
    }
    static class Dog extends Animal {
        @Override String sound() { return "Woof"; }
    }
    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(a.sound());
        a = new Animal();
        System.out.println(a.sound());
    }
}`,R=>{R.call("main");R.s(8,"<code>main</code> starts.");
      R.set("a",R.obj("D",{k:"box",t:"Dog",v:"klass → Dog"}));R.s(9,"The variable's <b>declared</b> type is Animal, but the object is a <b>Dog</b>. Its header points to the Dog class.",["a","D"]);
      R.s(10,"<code>javac</code> only checked that <b>Animal</b> has <code>sound()</code>, and wrote <code>invokevirtual Animal.sound()</code>.");
      R.call("sound");R.set("this",{r:"D"});R.s(6,"At run time the JVM follows the object's klass pointer to Dog and finds Dog's override in the method table, so <b>Dog.sound()</b> runs.",["this","D"]);
      R.ret();R.out("Woof");R.s(10,"Prints <b>Woof</b>. The object decided, not the variable's type.");
      R.set("a",R.obj("A",{k:"box",t:"Animal",v:"klass → Animal"}));R.s(11,"Now <code>a</code> refers to a plain Animal. The Dog has no references left, so it can be garbage-collected.",["a","A"]);
      R.call("sound");R.set("this",{r:"A"});R.s(3,"Same bytecode instruction, different object: this time Animal's own <code>sound()</code> runs.",["this","A"]);
      R.ret();R.out("...");R.s(12,"Prints <b>...</b>. One call site, two behaviours: that is run-time polymorphism.");})};

  let uid=0;
  const val=v=>v&&typeof v==="object"?'<span class="rz-ref" data-r="'+v.r+'"></span>':"<b>"+esc(v)+"</b>";
  function objHtml(o,hot){const cls="rz-o "+o.k+(hot.includes(o.id)?" hot":"");
    const cells=(xs,n,ptr)=>'<span class="rz-cells">'+Array.from({length:n},(_,i)=>{const c=xs[i];return '<i class="'+((o.hl||[]).includes(i)?"hl":"")+(c==null?" e":"")+'">'+(c==null?"":esc(c===" "?"␣":c))+
      (ptr&&ptr[i]?'<em>'+ptr[i]+"</em>":"")+"</i>";}).join("")+"</span>";
    if(o.k==="str")return '<div class="'+cls+'" data-id="'+o.id+'"><small>String</small>'+(o.cells?cells(o.v.split(""),o.v.length,o.ptr):'<b>"'+esc(o.v)+'"</b>')+"</div>";
    if(o.k==="arr")return '<div class="'+cls+'" data-id="'+o.id+'"><small>'+o.t+"</small>"+cells(o.v,o.v.length)+"</div>";
    if(o.k==="sb")return '<div class="'+cls+'" data-id="'+o.id+'"><small>StringBuilder · length '+o.v.length+" · capacity "+o.cap+"</small>"+cells(o.v,o.cap)+"</div>";
    return '<div class="'+cls+'" data-id="'+o.id+'"><small>'+o.t+"</small><b>"+esc(o.v)+"</b></div>";}
  function build(host,run){const id="rz"+(++uid),lines=run.code.split("\n");
    host.innerHTML='<div class="rz"><div class="rz-head"><span class="rz-dots"><i></i><i></i><i></i></span><span class="rz-file">'+esc(run.file)+'</span><span class="rz-ct"></span></div>'+
      '<div class="rz-main"><div class="rz-code"><div class="rz-bar"></div>'+lines.map((l,i)=>'<div class="rz-l"><span class="rz-n">'+(i+1)+"</span>"+(hl(l)||" ")+"</div>").join("")+"</div>"+
      '<div class="rz-mem"><svg class="rz-arw" aria-hidden="true"><defs><marker id="'+id+'m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker></defs><g></g></svg>'+
        '<div class="rz-col"><h5>Stack</h5><div class="rz-stack"></div></div><div class="rz-col"><h5>Heap</h5><div class="rz-heap"></div></div></div></div>'+
      '<div class="rz-msg" aria-live="polite"></div><div class="rz-foot"><div class="rz-out"><span>Console</span><pre></pre></div>'+
      '<div class="rz-ctl"><button type="button" class="btn" data-a="reset" title="Start again">⟲</button><button type="button" class="btn" data-a="prev">◀ Back</button>'+
      '<button type="button" class="btn pri" data-a="play">▶ Play</button><button type="button" class="btn" data-a="next">Next ▶</button></div></div><div class="rz-prog"><i></i></div></div>';
    const $h=s=>$(s,host),code=$h(".rz-code"),bar=$h(".rz-bar"),stack=$h(".rz-stack"),heap=$h(".rz-heap"),mem=$h(".rz-mem"),g=$h(".rz-arw g"),
      msg=$h(".rz-msg"),out=$h(".rz-out pre"),ct=$h(".rz-ct"),prog=$h(".rz-prog i"),L=$$(".rz-l",code);
    let k=0,timer=null,prev=null;
    const stop=()=>{clearInterval(timer);timer=null;$('[data-a="play"]',host).textContent="▶ Play";};
    function arrows(fresh){const mr=mem.getBoundingClientRect();let h="";
      $$(".rz-ref",stack).forEach(r=>{const t=$('.rz-o[data-id="'+r.dataset.r+'"]',heap);if(!t)return;const a=r.getBoundingClientRect(),b=t.getBoundingClientRect();
        const x1=a.left+a.width/2-mr.left,y1=a.top+a.height/2-mr.top,x2=b.left-mr.left-2,y2=Math.min(b.bottom-8,Math.max(b.top+8,y1))-mr.top,dx=Math.max(30,(x2-x1)*.5);
        const key=r.closest(".rz-v").dataset.k+">"+r.dataset.r,isNew=fresh.has(key),hot=r.closest(".rz-v").classList.contains("hot");
        h+='<path class="'+(isNew?"new":"")+(hot?" hot":"")+'" pathLength="1" marker-end="url(#'+id+'m)" d="M'+x1.toFixed(1)+" "+y1.toFixed(1)+" C"+(x1+dx).toFixed(1)+" "+y1.toFixed(1)+" "+(x2-dx).toFixed(1)+" "+y2.toFixed(1)+" "+x2.toFixed(1)+" "+y2.toFixed(1)+'"/>';});
      g.innerHTML=h;}
    function draw(){const st=run.steps[k],hot=st.hot,pv=prev;
      /* code: the highlight bar glides to the current line */
      L.forEach((l,i)=>{l.classList.toggle("cur",i===st.l-1);l.classList.toggle("was",pv&&i===pv.l-1&&i!==st.l-1);});
      const cl=L[st.l-1];bar.style.transform="translateY("+cl.offsetTop+"px)";bar.style.height=cl.offsetHeight+"px";
      if(cl.offsetTop<code.scrollTop||cl.offsetTop+cl.offsetHeight>code.scrollTop+code.clientHeight)code.scrollTo({top:cl.offsetTop-code.clientHeight/2,behavior:"smooth"});
      /* stack: newest frame on top; new frames and changed values animate */
      const pf=pv?pv.f:[],fresh=new Set();
      stack.innerHTML=st.f.map((fr,fi)=>{const old=pf[fi]&&pf[fi].n===fr.n&&pf.length>=fi+1?pf[fi]:null,isNew=!old||(pv&&pv.f.length<st.f.length&&fi===st.f.length-1);
        return '<div class="rz-fr'+(isNew?" push":"")+(fi===st.f.length-1?" top":"")+'"><div class="rz-fh">'+esc(fr.n)+"()</div>"+
          (fr.v.map(([n,v])=>{const o=old&&!isNew?old.v.find(x=>x[0]===n):null,chg=!o||JSON.stringify(o[1])!==JSON.stringify(v),kk=fi+"/"+n;
            if(chg&&v&&typeof v==="object")fresh.add(kk+">"+v.r);
            return '<div class="rz-v'+(chg?" chg":"")+(hot.includes(n)&&fi===st.f.length-1?" hot":"")+'" data-k="'+kk+'"><span>'+esc(n)+"</span>"+val(v)+"</div>";}).join("")||'<div class="rz-v e"><span>no locals yet</span></div>')+"</div>";}).reverse().join("");
      /* heap: grouped as String pool, Integer cache and the rest; new objects pop in, changed ones flash */
      const ph=pv?pv.h:[],grp=[["String pool",o=>o.pool],["Integer cache",o=>o.cache],["Objects",o=>!o.pool&&!o.cache]];
      heap.innerHTML=grp.map(([t,f])=>{const os=st.h.filter(f);if(!os.length)return "";
        return '<div class="rz-area"><div class="rz-at">'+t+"</div>"+os.map(o=>{const p=ph.find(x=>x.id===o.id);return objHtml(o,hot).replace('class="rz-o','class="rz-o'+(!p?" pop":JSON.stringify(p)!==JSON.stringify(o)?" chg":""));}).join("")+"</div>";}).join("")||'<div class="rz-empty">nothing on the heap yet</div>';
      msg.innerHTML=st.m;
      const newOut=pv&&st.o.length>pv.o.length?st.o.slice(pv.o.length):"";
      out.innerHTML=esc(newOut?pv.o:st.o)+(newOut?'<span class="new">'+esc(newOut)+"</span>":"");
      ct.textContent="step "+(k+1)+" / "+run.steps.length;prog.style.transform="scaleX("+((k+1)/run.steps.length).toFixed(3)+")";
      $('[data-a="prev"]',host).disabled=k===0;$('[data-a="next"]',host).disabled=k===run.steps.length-1;
      requestAnimationFrame(()=>arrows(fresh));prev=st;}
    host.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
      if(a==="next"&&k<run.steps.length-1){stop();k++;draw();}
      else if(a==="prev"&&k>0){stop();k--;prev=null;draw();}
      else if(a==="reset"){stop();k=0;prev=null;draw();}
      else if(a==="play"){if(timer){stop();return;}if(k===run.steps.length-1){k=0;prev=null;draw();}b.textContent="❚❚ Pause";
        timer=setInterval(()=>{if(k>=run.steps.length-1){stop();return;}k++;draw();},1500);}});
    addEventListener("resize",()=>requestAnimationFrame(()=>arrows(new Set())),{passive:true});
    draw();}
  /* built when they come near the screen */
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const r=RUNS[e.target.dataset.run];if(r)build(e.target,r);}),{rootMargin:"300px 0px"});
  hosts.forEach(h=>io.observe(h));
})();

/* These blocks ran last in the old single file (they look at what the labs built), so they wait until every script has run. */
(function(){const late=()=>{
/* learn layer (v33, every page): the course read as a beginner would read it.
   1. Glossary hints: the first time a key term appears in a section it gets a dotted underline (dfn.gl); hover, focus or
      tap shows a plain-language definition (#glTip). js1-gloss "0" = off (Ctrl+K, or the button in the tip).
   2. "Before you start" card under each lesson title: what you need, what you'll learn, time, how to study (js1-start-<page>).
   3. Continue where you left off: the section you were reading (js1-last) becomes a Continue button on the home page.
   4. Keyboard for every step-through visual: inside any .viz, ← / → step and Space plays or pauses. */
(function(){
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* ---------- 1. glossary ---------- [term, pattern, definition, section id for "more"] */
  const GL=[
    ["load factor","\\bload factor\\b","How full a HashMap may get before it doubles its table: 0.75 by default, so 16 buckets resize at the 13th entry.","c-hashmap"],
    ["type erasure","\\btype erasure\\b","Generic types exist only at compile time: javac checks them, inserts casts, then removes them, so List<String> and List<Integer> are the same class at run time.","c-generics"],
    ["fail-fast","\\bfail-fast\\b","An iterator that throws ConcurrentModificationException as soon as it notices the collection was changed outside it (modCount check).","c-iter"],
    ["red-black tree","\\bred-black trees?\\b","A self-balancing binary search tree: colour rules keep its height O(log n). TreeMap, TreeSet and big HashMap buckets use it.","c-treemap"],
    ["binary heap","\\bbinary (?:min-)?heap\\b","A complete binary tree stored in an array where every parent is smaller than its children (min-heap); PriorityQueue uses one. Children of i are at 2i+1 and 2i+2.","c-queue"],
    ["JVM","\\bJVM\\b","Java Virtual Machine: the program that runs Java bytecode. It loads classes, manages memory (heap and stacks), runs the garbage collector and compiles hot code to machine code (JIT).","f-platform"],
    ["JDK","\\bJDK\\b","Java Development Kit: everything you need to write Java: the compiler javac, the JVM and the standard library.","f-platform"],
    ["JRE","\\bJRE\\b","Java Runtime Environment: the JVM plus the standard library, enough to run (not compile) Java. Modern JDKs include it.","f-platform"],
    ["bytecode","\\bbytecode\\b","The instructions in a .class file that javac produces. The JVM reads them, not your CPU, so the same .class runs on Windows, Mac and Linux.","f-platform"],
    ["JIT","\\bJIT\\b","Just-In-Time compiler: part of the JVM that turns often-run bytecode into fast machine code while the program runs.","f-platform"],
    ["javac","\\bjavac\\b","The Java compiler: turns your .java source file into .class bytecode.","f-platform"],
    ["primitive","\\bprimitives?\\b","One of Java's 8 built-in value types: int, long, double, float, char, boolean, byte, short. The variable holds the value itself.","f-types"],
    ["reference","\\breferences?\\b","A variable of a class type (String, int[], Car…) holds a reference: the address of an object on the heap, not the object. Copying it copies the address, not the object.","f-types"],
    ["object","\\bobjects?\\b","A thing built from a class with new. It lives on the heap and has its own copy of the instance fields.","o-class"],
    ["class","\\bclass(?:es)?\\b","A blueprint: it declares the fields (data) and methods (behaviour) that its objects will have.","o-class"],
    ["heap","\\bheaps?\\b","(1) Memory: the area where every object and array lives; the garbage collector cleans it. (2) Data structure: a tree stored in an array where every parent is ≥ its children; used by heap sort and PriorityQueue.","d-memory"],
    ["stack","\\b(?:call )?stacks?\\b","(1) Memory: every running method gets a frame on the call stack with its parameters and local variables; the frame disappears when the method returns. (2) Data structure: last in, first out (push / pop).","f-methods"],
    ["garbage collector","\\bgarbage collect(?:or|ion|ed)\\b|\\bGC\\b","The part of the JVM that frees objects no variable can reach any more, so Java code never frees memory by hand.","d-memory"],
    ["String pool","\\bString (?:[Cc]onstant )?[Pp]ool\\b|\\bSCP\\b","A special area where Java keeps one shared copy of each String literal: \"hi\" written twice in your code is the same object.","pool"],
    ["immutable","\\bimmutab(?:le|ility)\\b","Cannot change after it is created. Every \"change\" to a String builds a new String; the old one stays exactly as it was.","immutable"],
    ["mutable","\\bmutable\\b","Can be changed in place, like a StringBuilder or an array.","build"],
    ["index","\\b(?:index|indexes|indices)\\b","The position of an element, counted from 0: a[0] is the first element, a[a.length − 1] the last.","a-what"],
    ["null","\\bnull\\b","A reference that points to no object. Calling a method on it, or reading a field, throws NullPointerException.","f-types"],
    ["NullPointerException","\\bNullPointerException\\b|\\bNPE\\b","The exception thrown when you use a null reference as if it pointed to an object.","d-null"],
    ["exception","\\bexceptions?\\b","An error object thrown when something goes wrong while the program runs (bad index, null, division by zero). If nobody catches it, the program stops and prints a stack trace.","mistakes"],
    ["overflow","\\boverflows?\\b|\\boverflowed\\b","When a number gets too big for its type and wraps around: Integer.MAX_VALUE + 1 becomes Integer.MIN_VALUE. (StackOverflowError is different: too many nested calls.)","f-operators"],
    ["cast","\\bcast(?:s|ing)?\\b","Converting a value to another type, e.g. (int) 3.9 gives 3. Narrowing casts can lose information.","f-operators"],
    ["autoboxing","\\b(?:auto)?boxing\\b|\\bunboxing\\b","Java converting automatically between a primitive and its wrapper object, e.g. int ↔ Integer.","f-types"],
    ["wrapper class","\\bwrapper(?: class(?:es)?|s)?\\b","The object version of a primitive: Integer for int, Double for double, Character for char, and so on.","f-types"],
    ["constructor","\\bconstructors?\\b","Code that runs once when new creates an object, to set up its fields. It has the class's name and no return type.","o-ctor"],
    ["static","\\bstatic\\b","Belongs to the class itself, not to one object: there is one shared copy, usable without new.","o-static"],
    ["overloading","\\boverload(?:ing|ed|s)?\\b","Several methods with the same name but different parameter lists; javac chooses one from the argument types, at compile time.","o-poly"],
    ["overriding","\\boverrid(?:e|es|ing|den)\\b","A subclass redefines an inherited method with the same signature; the object's real class decides which version runs, at run time.","o-poly"],
    ["polymorphism","\\bpolymorphi(?:sm|c)\\b","One reference type, many object types: a Vehicle variable can hold a Car or a Truck, and each responds in its own way.","o-poly"],
    ["encapsulation","\\bencapsulat(?:ion|ed|e)\\b","Keeping fields private and offering safe methods, so an object's rules can't be broken from outside.","o-encap"],
    ["inheritance","\\binherit(?:ance|s|ed)?\\b","A class extends another and reuses its fields and methods (Car extends Vehicle).","o-inherit"],
    ["interface","\\binterfaces?\\b","A contract: a list of methods a class promises to provide (implements). A class can implement many interfaces.","o-abstract"],
    ["recursion","\\brecursi(?:on|ve|vely)\\b","A method that calls itself on a smaller version of the problem, until a base case stops it.","f-methods"],
    ["base case","\\bbase cases?\\b","The simplest input a recursive method answers directly, without calling itself. Without it the recursion never stops.","f-methods"],
    ["Big-O","\\bBig-O\\b","How the work grows when the input size n grows, ignoring constants: O(n) doubles when n doubles, O(n²) becomes four times bigger.","cx-complexity"],
    ["time complexity","\\btime complexity\\b","How the number of steps an algorithm takes grows with the input size n.","cx-complexity"],
    ["space complexity","\\bspace complexity\\b","How much extra memory an algorithm needs as n grows: new arrays and collections, plus the call stack.","cx-complexity"],
    ["in-place","\\bin-place\\b","Uses only O(1) extra memory: it rearranges the input itself instead of building a copy.","cx-complexity"],
    ["stable","\\bstable\\b|\\bstability\\b","A stable sort keeps equal elements in their original order (useful when you sort records by one field, then by another).","bs-generic"],
    ["adaptive","\\badaptive\\b","Runs faster when the input is already nearly sorted.","bs-flag"],
    ["pivot","\\bpivots?\\b","The value quicksort compares everything against: smaller values go to its left, the rest to its right.","qk-idea"],
    ["partition","\\bpartition(?:ing|s|ed)?\\b","Rearranging an array around a pivot so that all smaller values come before it and the rest after it.","qk-idea"],
    ["inversion","\\binversions?\\b","A pair of positions i < j with a[i] > a[j]: two values in the wrong order. A sorted array has none.","bs-special"],
    ["amortized","\\bamorti[sz]ed\\b","The average cost per operation over a long sequence: rare expensive steps are paid for by many cheap ones (ArrayList.add is amortized O(1)).","cx-complexity"],
    ["hash code","\\bhash ?codes?\\b|\\bhashCode\\b","A number computed from an object's contents. Hash tables use it to pick a bucket, so equal objects must have equal hash codes.","o-object"],
    ["HashMap","\\bHashMap\\b|\\bhash (?:table|map)s?\\b","Finds a value by its key in O(1) on average, by turning the key into an array index with its hash code.","o-object"],
    ["binary search","\\bbinary search\\b","Finding a value in a sorted array by checking the middle and throwing away half each time: O(log n).","a-sort"],
    ["two pointers","\\btwo[- ]pointers?\\b","Two indexes walking the array (often from both ends) so you don't need a nested loop.","s-palin"],
    ["sliding window","\\bsliding window\\b","A range [left, right] that slides along an array or string, adding on one side and removing on the other, so each element is handled O(1) times.","s-window"],
    ["regex","\\bregex(?:es)?\\b|\\bregular expressions?\\b","A pattern language for matching text, e.g. \\d+ means \"one or more digits\".","regex"],
    ["Unicode","\\bUnicode\\b","The standard that gives every character of every language a number, called a code point.","unicode"],
    ["UTF-16","\\bUTF-16\\b","How Java stores text in char values: most characters take one 16-bit char; emoji and rare characters take two (a surrogate pair).","unicode"],
    ["code point","\\bcode points?\\b","The number Unicode gives one character. One code point can need two Java chars.","unicode"],
    ["surrogate pair","\\bsurrogates?(?: pairs?)?\\b","Two chars that together encode one character above U+FFFF, such as most emoji.","unicode"],
    ["StringBuilder","\\bStringBuilder\\b","A mutable string buffer: append many times cheaply, then call toString() once.","build"],
    ["pass-by-value","\\bpass(?:ed)?-by-value\\b","Java always passes a copy: for primitives a copy of the value, for objects a copy of the reference (the method can change the object, but not your variable).","f-pass"],
    ["varargs","\\bvarargs\\b","A parameter like int... nums that accepts any number of arguments; inside the method it is an array.","a-methods"],
    ["invariant","\\binvariants?\\b","A fact that stays true at every step of a loop or algorithm; it is how you prove the algorithm correct.","bs-dryrun"],
    ["lexicographic","\\blexicographic(?:al(?:ly)?)?\\b","Dictionary order, compared character by character (in Java by UTF-16 code, so \"B\" comes before \"a\").","compare"],
    ["memoization","\\bmemoi[sz](?:ation|ed)\\b","Storing the results of a function so each input is computed only once (naive Fibonacci goes from O(2ⁿ) to O(n)).","cx-complexity"],
    ["Metaspace","\\bMetaspace\\b","Native memory where the JVM keeps class metadata (field layout, method code), separate from the heap.","d-memory"],
    ["Comparator","\\bComparator\\b","An object that defines an order for sorting: compare(a, b) returns a negative number, zero or a positive number.","bs-generic"]
  ];
  const glossOn=()=>store.get("js1-gloss")!=="0";
  let tip=null,tipFor=null;
  const hideTip=()=>{if(tip)tip.hidden=true;tipFor=null;};
  const showTip=el=>{const g=GL[+el.dataset.g];if(!g)return;if(!tip){tip=document.createElement("div");tip.id="glTip";tip.setAttribute("role","tooltip");document.body.appendChild(tip);
      tip.addEventListener("click",e=>{const b=e.target.closest("[data-gl]");if(!b)return;if(b.dataset.gl==="off"){store.set("js1-gloss","0");$$("dfn.gl").forEach(d=>d.replaceWith(document.createTextNode(d.textContent)));hideTip();}});}
    tipFor=el;const more=g[3]&&SECP[g[3]]&&!el.closest("#"+g[3])?' <a href="'+secUrl(g[3])+'">Learn more →</a>':"";
    tip.innerHTML="<b>"+esc(g[0])+"</b> "+esc(g[2])+'<div class="gl-f">'+more+'<button type="button" data-gl="off">Hide all hints</button></div>';tip.hidden=false;
    const r=el.getBoundingClientRect(),w=Math.min(340,innerWidth-24);tip.style.width=w+"px";
    let x=r.left+r.width/2-w/2;x=Math.max(12,Math.min(innerWidth-w-12,x));tip.style.left=x+scrollX+"px";
    const below=r.bottom+tip.offsetHeight+12<innerHeight;tip.style.top=(below?r.bottom+8:r.top-tip.offsetHeight-8)+scrollY+"px";};
  function gloss(){if(!glossOn()||gloss.done)return;gloss.done=true;
    const re=new RegExp(GL.map((g,i)=>"(?<g"+i+">"+g[1]+")").join("|"),"gi");
    const SKIP="code,pre,a,h1,h2,h3,h4,h5,h6,script,style,button,label,select,option,summary,svg,figure,.viz,.quiz,.CodeMirror,.num,.tag,nav,#toc,.secfoot,.secnext,.msg,.lcard,.pager,dfn,.bsx-chips,kbd,.cta,.mq,.ctrl";
    const roots=$$(".wrap>section,.wrap>header .lead,.band .muted");
    const introUsed=new Set();roots.forEach(root=>{const used=root.matches("section")?new Set():introUsed,w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue.trim().length<3||n.parentElement.closest(SKIP)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
      const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
      nodes.forEach(node=>{let s=node.nodeValue,m,out=[],last=0;re.lastIndex=0;
        while((m=re.exec(s))){const gi=+Object.keys(m.groups).find(k=>m.groups[k]!==undefined).slice(1);if(used.has(gi))continue;used.add(gi);
          out.push(document.createTextNode(s.slice(last,m.index)));const d=document.createElement("dfn");d.className="gl";d.tabIndex=0;d.dataset.g=gi;d.textContent=m[0];out.push(d);last=m.index+m[0].length;}
        if(out.length){out.push(document.createTextNode(s.slice(last)));node.replaceWith(...out);}});});}
  document.addEventListener("mouseover",e=>{const d=e.target.closest&&e.target.closest("dfn.gl");if(d&&d!==tipFor)showTip(d);});
  document.addEventListener("mouseout",e=>{const d=e.target.closest&&e.target.closest("dfn.gl");if(d&&!(e.relatedTarget&&(e.relatedTarget.closest("#glTip")||e.relatedTarget===d)))setTimeout(()=>{if(tip&&!tip.matches(":hover")&&tipFor===d)hideTip();},120);});
  document.addEventListener("focusin",e=>{const d=e.target.closest&&e.target.closest("dfn.gl");if(d)showTip(d);});
  document.addEventListener("click",e=>{const d=e.target.closest("dfn.gl");if(d){if(tipFor===d&&tip&&!tip.hidden)hideTip();else showTip(d);}else if(tip&&!e.target.closest("#glTip"))hideTip();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")hideTip();});
  addEventListener("scroll",()=>{if(tip&&!tip.hidden&&tipFor){const r=tipFor.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)hideTip();}},{passive:true});
  setTimeout(gloss,350);
  window.LEARN={GL,gloss};

  /* ---------- 2. Before you start ---------- */
  const START={
    l00:{need:"Nothing: no programming experience assumed. Install a JDK (21 or newer; this course uses JDK 25) to run the programs.",learn:"How Java runs (JDK, JVM, bytecode), variables and types, operators and casting, if / switch / loops, methods and recursion, pass-by-value, packages and input/output.",time:"about 4 hours"},
    l00:{need:"Nothing: this is the first page. A JDK (21 or newer; the course uses JDK 25) if you want to run the programs on your own PC; every editor also has ▶ Run.",learn:"What Java is, how a program is compiled and run, JDK vs JRE vs JVM, the three memory areas (stack, heap, Metaspace), and primitive vs reference types.",time:"about 1 hour"},
    l01:{need:"Lesson 00 (what the JVM is, stack and heap, primitive vs reference types).",learn:"What a String is, the three ways to create one, where it lives (stack, heap, String Constant Pool), what new String() really does, == vs equals, why a String can never change, every String method live in the methods playground, compile-time vs run-time concatenation.",time:"about 2 hours 30 minutes"},
    l02:{need:"Lesson 01 (references, stack and heap, == vs equals).",learn:"What a class and an object are, what is inside a class, what new really does, where objects live (stack, heap, Metaspace), references and null, constructors and this, static vs instance, printing and comparing objects.",time:"about 2 hours"},
    l03:{need:"Lesson 02 (class, object, field, method, constructor, this, static).",learn:"Encapsulation: why public fields break objects, private fields behind methods that check every change, getters, setters and \"tell, don't ask\", packages and private / no keyword / public, read-only and immutable objects, defensive copies.",time:"about 2 hours"},
    l04:{need:"Lessons 02 and 03 (constructors, this, private, packages, getters, final).",learn:"Inheritance: extends and IS-A, what a child object looks like on the heap, how a call finds its method, adding and replacing methods with super, constructors and the build order, protected and the full access table, Object and final, composition over inheritance.",time:"about 2 hours 30 minutes"},
    l05:{need:"Lesson 04 (extends, the child object, method lookup, @Override, super).",learn:"Polymorphism: a parent-type variable holding any child, dynamic dispatch and the method table, the overriding rules, overloading and how javac picks one, upcasting, downcasting and instanceof patterns, fields and static methods are not polymorphic, the constructor trap, Liskov.",time:"about 2 hours 30 minutes"},
    l06:{need:"Lessons 04 and 05 (inheritance, overriding, a parent-type variable holding a child).",learn:"Abstraction: abstract classes and methods, interfaces as contracts, default / static / private interface methods, many interfaces and the diamond, marker and functional interfaces, a first lambda, abstract class vs interface.",time:"about 2 hours 30 minutes"},
    l07:{need:"Lessons 02–06 (objects, encapsulation, overriding, interfaces).",learn:"The Object contract: == vs equals, the equals and hashCode contracts and the HashSet bug, mutable keys, toString, clone and copies, immutability, records, final vs finally vs finalize.",time:"about 2 hours 30 minutes"},
    l08:{need:"Lessons 02–07 (classes, interfaces, overriding, records).",learn:"Enums with fields and methods, EnumMap and EnumSet, sealed classes and exhaustive switch, and the four kinds of nested classes: static nested, inner, local and anonymous.",time:"about 2 hours 30 minutes"},
    l09:{need:"Lessons 02–08.",learn:"OOP review: the four pillars side by side, association / aggregation / composition, coupling and cohesion, SOLID in one table, the big mistakes table, 25 interview questions, and a parking lot designed step by step.",time:"about 2 hours"},
    practice:{need:"Any lesson you want to drill.",learn:"Write and run code in the Playground, practise in a timed mock interview, check costs on the Big-O sheet, watch memory in the Memory Lab, and review with spaced repetition.",time:"10–20 minutes a day"}};
  const st=START[PAGE],hdr=$("header#top");
  if(st&&hdr){const key="js1-start-"+PAGE,d=document.createElement("details");d.className="lx-start";d.open=store.get(key)!=="0";
    d.innerHTML='<summary><b>Before you start</b><span>'+esc(st.time)+"</span></summary>"+
      '<div class="lx-grid"><div><h5>You need</h5><p>'+esc(st.need)+'</p></div><div><h5>You will learn</h5><p>'+esc(st.learn)+'</p></div><div><h5>How to study each section</h5><ol>'+
      "<li>Read the <b>In 30 seconds</b> box.</li><li>Play the visual: <kbd>←</kbd> <kbd>→</kbd> step, <kbd>Space</kbd> plays.</li><li>Read the code, then press <b>▶ Run</b> (or run <code>java File.java</code> yourself).</li><li>Hover the <dfn class=\"gl-demo\">dotted words</dfn> for definitions.</li><li>Click <b>Mark as understood</b>, then answer the quiz.</li><li>Come back to the <b>Recall prompts</b> after 1, 3 and 7 days.</li></ol></div></div>";
    d.addEventListener("toggle",()=>store.set(key,d.open?"1":"0"));
    const pager=$(".pager",hdr);if(pager)hdr.insertBefore(d,pager);else hdr.appendChild(d);}

  /* ---------- 3. continue where you left off ---------- */
  if(PAGE!=="home"){let tmr=null;const io=new IntersectionObserver(es=>{const vis=es.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      if(!vis.length)return;const sec=vis[0].target,info=thisPage&&thisPage.sections.find(s=>s.id===sec.id);if(!info)return;
      clearTimeout(tmr);tmr=setTimeout(()=>store.set("js1-last",JSON.stringify({p:PAGE,id:sec.id,n:info.n,t:info.t,l:thisPage.short,at:Date.now()})),1500);},{rootMargin:"-25% 0px -60% 0px"});
    $$(".wrap>section[id]").forEach(s=>io.observe(s));}
  let last=null;try{last=JSON.parse(store.get("js1-last")||"null");}catch(e){}
  if(PAGE==="home"&&last&&SECP[last.id]){const cta=$(".cta");if(cta){const a=document.createElement("a");a.className="btn big lx-cont";a.href=secUrl(last.id);
      a.innerHTML="Continue: "+esc(last.l+" · "+last.n+" "+last.t)+' <span aria-hidden="true">→</span>';a.title="Where you stopped reading";cta.insertBefore(a,cta.firstChild);}}
  window.LEARN.last=last;

  /* ---------- 4. keyboard for every step-through visual ---------- */
  $$(".viz").forEach(v=>{if(!v.hasAttribute("tabindex"))v.tabIndex=0;});
  const KEYS={ArrowRight:'[data-a="next"],[data-s="next"],[data-a="step"],#pnext',ArrowLeft:'[data-a="back"],[data-a="prev"],[data-s="back"],#pprev'," ":'[data-a="play"],[data-s="play"],[data-a="go"]'};
  document.addEventListener("keydown",e=>{if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey)return;const sel=KEYS[e.key];if(!sel)return;
    const v=e.target.closest&&e.target.closest(".viz");if(!v||e.target.closest("input,select,textarea,.CodeMirror"))return;if(e.key===" "&&e.target.closest("button,a,summary"))return;
    const b=$$(sel,v).find(x=>!x.disabled&&x.offsetParent!==null);if(b){e.preventDefault();b.click();}});
})();

/* smooth scroll v10: the mouse wheel glides (eased, frame-rate independent, ~0.35 s to settle) instead of jumping in steps.
   Keyboard, scrollbar, touch, anchors and inner scroll boxes (sidebar, editors, dialogs, wide tables) stay native; if anything else
   scrolls the page mid-glide, the glide yields. Off under reduced motion and on touch-only devices. */
(function(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches||!matchMedia("(pointer: fine)").matches)return;
  const de=document.documentElement;let y=0,ty=0,set=-1,raf=0,last=0;
  const max=()=>de.scrollHeight-innerHeight;
  const inner=(el,dy)=>{for(;el&&el.nodeType===1&&el!==document.body&&el!==de;el=el.parentElement){if(el.scrollHeight<=el.clientHeight+1)continue;
      const o=getComputedStyle(el).overflowY;if(o!=="auto"&&o!=="scroll")continue;if(dy<0?el.scrollTop>0:el.scrollTop+el.clientHeight<el.scrollHeight-1)return true;}return false;};
  const stop=()=>{cancelAnimationFrame(raf);raf=0;last=0;set=-1;};
  function step(now){
    if(set>=0&&Math.abs(scrollY-set)>2){stop();return;}
    const dt=Math.min(.05,(now-(last||now-16))/1000);last=now;y+=(ty-y)*(1-Math.exp(-dt*11));if(Math.abs(ty-y)<.4)y=ty;
    scrollTo({top:y,behavior:"instant"});set=scrollY;raf=y!==ty?requestAnimationFrame(step):(stop(),0);}
  addEventListener("wheel",e=>{
    if(e.ctrlKey||e.defaultPrevented||e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||document.querySelector("dialog[open]"))return;
    const dy=e.deltaY*(e.deltaMode===1?40:e.deltaMode===2?innerHeight:1);if(!dy||inner(e.target,dy))return;
    e.preventDefault();if(!raf){y=ty=scrollY;}ty=Math.max(0,Math.min(max(),ty+dy));if(!raf)raf=requestAnimationFrame(step);},{passive:false});
  addEventListener("keydown",stop);addEventListener("pointerdown",stop);
})();

/* layout v7: "Next →" card at the end of every section */
(function(){
  /* the whole course in order, so the last section of a page points to the first one of the next page */
  const SECS=[];
  PAGES.forEach(p=>p.sections.forEach(s=>SECS.push({el:p.key===PAGE?document.getElementById(s.id):null,id:s.id,g:p.name,n:s.n,t:s.t})));
  SECS.forEach((s,i)=>{const nx=SECS[i+1];if(!nx||!s.el)return;
    const a=document.createElement("a");a.className="secnext";a.href=secUrl(nx.id);
    a.innerHTML='<span class="sn-n">'+esc(nx.n)+"</span><span><small>Next"+(nx.g!==s.g?" · "+esc(nx.g):"")+"</small><b>"+esc(nx.t)+'</b></span><span class="sn-go" aria-hidden="true">→</span>';
    s.el.appendChild(a);});
})();

/* checklist */
if($("#chk")){
const CK=["What a String is, and how it differs from char and from null","Literal vs new, the String pool, and intern()","Why String is immutable (5 reasons)","== vs equals vs compareTo, and the null-safe style","char arithmetic and the int[26] counting trick","The main methods by category, plus the substring and split gotchas","String vs StringBuilder vs StringBuffer, and why += in a loop is slow","Conversions, including the char[] toString() trap","Format specifiers and text blocks","Regex escaping with split and replaceAll","UTF-16, surrogate pairs, Compact Strings, and the cached hashCode","D: Draw stack, heap and pool for a literal, new String and intern()","D: Lazy literal resolution and the pool history (Java 6 → 7 → 8)","D: Count the objects for any line of the D4 table","D: Walk through String.equals() and state the hashCode contract","D: Compact Strings and the coder field; final vs immutable","D: Builder capacity growth (old*2+2) and why sb1.equals(sb2) is false","D: How + compiles in Java 8 vs Java 9+, and the null traps","S: The 7 String patterns and the signal words for each","S: Reverse a String 5 ways, and why a char swap breaks emoji","S: Palindrome checks with two pointers, and expand-around-centre","S: Sliding window for the longest substring without repeats","S: Stacks for brackets, and writing parseInt yourself","S: Regex groups, back-references, lazy quantifiers and lookahead","A: Array basics: fixed size, defaults, length field, exceptions","A: Array memory: references, headers, primitive vs object arrays","A: 2D and jagged arrays as arrays of arrays","A: Aliasing vs shallow copy vs deep copy (clone, copyOf, arraycopy)","A: The Arrays class, and which algorithm Arrays.sort uses","A: Pass-by-value of references, varargs, and asList traps","A: Covariance, ArrayStoreException and generic arrays","A: Prefix sum, two pointers, sliding window, Kadane, rotate","F: JDK vs JRE vs JVM, and the path from .java to bytecode to JIT","F: The 8 primitives, defaults, wrappers and the Integer cache trap","F: Widening vs narrowing, overflow, integer division and the hidden cast in +=","F: Classic switch vs arrow switch and switch expressions","F: Overload resolution order, and recursion on the call stack","F: Why Java is always pass-by-value, even for objects"];
let sv={};try{sv=JSON.parse(store.get("js1-chk")||"{}")}catch(e){}
$("#chk").innerHTML=CK.map((t,i)=>'<label><input type="checkbox" data-i="'+i+'"'+(sv[i]?" checked":"")+'><span>'+esc(t)+'</span></label>').join("");
$("#chk").onchange=()=>{const o={};$$("#chk input").forEach(b=>{if(b.checked)o[b.dataset.i]=1});store.set("js1-chk",JSON.stringify(o));};
}

/* feedback */
if($("#rates")){
const RT=["Visual explanation","Depth of understanding","Code & dry runs","Interview coverage","Overall usefulness"],sc=RT.map(()=>0);
$("#rates").innerHTML=RT.map((t,i)=>'<div class="rate"><span>'+t+'</span><div class="stars" data-i="'+i+'">'+[1,2,3,4,5].map(n=>'<button data-n="'+n+'" aria-label="'+n+' stars">★</button>').join("")+'</div></div>').join("");
$("#rates").onclick=e=>{const b=e.target.closest("button");if(!b)return;const g=b.parentElement,n=+b.dataset.n;sc[+g.dataset.i]=n;$$("button",g).forEach(x=>x.classList.toggle("on",+x.dataset.n<=n));};
$("#fbc").onclick=()=>{const t="Feedback on "+document.body.dataset.name+":\n"+RT.map((r,i)=>"- "+r+": "+(sc[i]||"-")+"/5").join("\n")+"\nComments: "+($("#fbt").value.trim()||"none");
  if(navigator.clipboard)navigator.clipboard.writeText(t).then(()=>{$("#fbm").textContent="Copied — paste it in the chat.";},()=>{});};
}
};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",late);else late();})();
