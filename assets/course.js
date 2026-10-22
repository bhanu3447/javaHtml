(function(){
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
function setMotion(on){try{localStorage.setItem("js1-motion",on?"1":"0");}catch(e){}document.documentElement.classList.toggle("no-motion",!on);location.reload();}
(function(){const t=document.getElementById("theme");if(!t)return;const b=document.createElement("button");b.id="motionBtn";b.type="button";
  b.textContent=MOTION_OFF?"▶":"⏸";const lab=MOTION_OFF?"Animations are off: click to turn them on":"Animations are on: click to turn them all off";
  b.title=lab;b.setAttribute("aria-label",lab);b.setAttribute("aria-pressed",String(MOTION_OFF));b.onclick=()=>setMotion(MOTION_OFF);t.before(b);})();
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const v=c=>c===" "?"␣":c, q=c=>"'"+esc(v(c))+"'", dq=s=>'"'+esc(s)+'"';
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,x){try{localStorage.setItem(k,x)}catch(e){}}};

/* multi-page: COURSE (assets/course-index.js, built by scripts/build-index.mjs) lists every page, its sections and the
   interview questions. PAGE is this page's key (body data-page); ROOT is the course folder, so links work from any page. */
const COURSE=window.COURSE||{pages:[],qa:[]};
const PAGE=document.body.dataset.page||"";
const ROOT=new URL("..",document.currentScript.src).href;
const PAGES=COURSE.pages,SECP={};PAGES.forEach(p=>p.sections.forEach(s=>SECP[s.id]=p));
const LESSONS=PAGES.filter(p=>/^l\d/.test(p.key));
const pageUrl=(p,id)=>p.key===PAGE?(id?"#"+id:"#top"):ROOT+p.file+(id?"#"+id:"");
const secUrl=id=>SECP[id]?pageUrl(SECP[id],id):"#"+id;
const thisPage=PAGES.find(p=>p.key===PAGE);

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

  let W=0,H=0,dpr=1,col={a:"#6366f1",b:"#a855f7"},dark=false,on=store.get("js1-anim")!=="0",raf=0;const t0=performance.now();
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

/* fire rider: a flaming-skull biker rides across the bottom of the screen now and then (first after ~8 s, then every 40–70 s),
   leaving fire, embers and smoke behind. Canvas #rider sits above the page and ignores the pointer. RIDER.go() summons him (command palette).
   Skipped when the ∞ animation is off, under reduced motion and while the tab is hidden. P = particles {k: f fire | e ember | m smoke} */
const RIDER=(function(){
  const reduce=matchMedia("(prefers-reduced-motion: reduce)");
  const cv=document.createElement("canvas");cv.id="rider";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);
  let ctx=cv.getContext("2d");let W=0,H=0,dpr=1,raf=0,run=null,P=[],last=0,dark=true,camZ=1;
  /* v20 adaptive quality: lowQ halves the tree flames, drops the second road flame, renders the GPU fire at a third of the
     resolution and caps particles at 350 (set when the frame time average stays above 30 ms for 1.5 s of a ride) */
  let lowQ=false,ema=.016,slowT=0,GR=null;
  /* v14 layers: #riderLow (haunted backdrop, smoke, glow) < #rider3d (3D models) < #rider (fire, embers, chain, bullets) */
  const cvL=document.createElement("canvas");cvL.id="riderLow";cvL.setAttribute("aria-hidden","true");document.body.insertBefore(cvL,cv);const ctxL=cvL.getContext("2d"),ctxM=ctx;
  function size(){dpr=1;W=innerWidth;H=innerHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cvL.width=cv.width;cvL.height=cv.height;}
  size();addEventListener("resize",size,{passive:true});
  const R=(a,b)=>a+Math.random()*(b-a);
  /* theme palettes (picked from data-theme when he sets off; light/dark/system use classic fire): fire stages hot → cool as "r,g,b",
     g glow, e embers, ring wheel fire ring, eye socket glow, tank bike tank, beam headlight, sm smoke */
  const PALS={
    fire:{f:["255,248,214","255,206,84","255,136,24","214,48,10","90,30,20"],g:"255,110,0",e:"255,170,60",ring:"#ff7a18",eye:"#ff6a00",tank:"#7f1d1d",beam:"255,236,170",sm:"70,60,60"},
    midnight:{f:["235,245,255","147,197,253","59,130,246","37,99,235","30,41,90"],g:"59,130,246",e:"147,197,253",ring:"#60a5fa",eye:"#93c5fd",tank:"#1e3a8a",beam:"191,219,254",sm:"40,50,90"},
    nord:{f:["245,250,255","191,227,240","136,192,208","94,129,172","59,66,82"],g:"136,192,208",e:"216,222,233",ring:"#88c0d0",eye:"#8fbcbb",tank:"#4c566a",beam:"229,233,240",sm:"76,86,106"},
    dracula:{f:["255,236,250","255,121,198","189,147,249","139,92,246","68,40,90"],g:"189,147,249",e:"255,121,198",ring:"#ff79c6",eye:"#bd93f9",tank:"#6d28d9",beam:"241,250,140",sm:"68,71,90"},
    forest:{f:["240,255,220","190,242,100","132,204,22","34,160,107","20,60,40"],g:"132,204,22",e:"190,242,100",ring:"#84cc16",eye:"#a3e635",tank:"#14532d",beam:"217,249,157",sm:"40,60,45"},
    sunset:{f:["255,240,220","253,186,116","249,115,22","225,29,72","110,20,50"],g:"249,115,22",e:"251,146,60",ring:"#f97316",eye:"#e11d48",tank:"#be123c",beam:"254,215,170",sm:"120,60,70"},
    ocean:{f:["236,254,255","165,243,252","34,211,238","14,116,144","20,50,80"],g:"14,165,233",e:"103,232,249",ring:"#06b6d4",eye:"#22d3ee",tank:"#0e7490",beam:"207,250,254",sm:"50,80,100"},
    sepia:{f:["255,247,220","250,204,120","205,133,63","160,82,45","90,60,30"],g:"184,134,11",e:"218,165,32",ring:"#b8860b",eye:"#cd853f",tank:"#7c2d12",beam:"253,230,138",sm:"110,85,60"}};
  let pal=PALS.fire;
  function isDark(){const m=getComputedStyle(document.body).backgroundColor.match(/\d+/g)||[255,255,255];return (+m[0]*.3+ +m[1]*.59+ +m[2]*.11)<110;}
  /* cinematic sound, synthesised with Web Audio (no files): thunder, engine, gunshot, landing thud, hoofbeats, chain clinks, whoosh.
     The context starts on the ghost-button click (browsers need a gesture); 🔊/🔇 in the nav mutes it (js1-sound "0" = muted). */
  const SFX=(function(){let ac=null,master=null,noise=null,eng=null,engBuf=null,shp=null,on=store.get("js1-sound")!=="0";
    const ready=()=>{if(ac&&ac.state==="running")document.dispatchEvent(new Event("sfxready"));};
    function init(){if(ac){if(ac.state==="suspended")ac.resume().then(ready);return;}const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
      ac=new A();ac.addEventListener("statechange",ready);setTimeout(ready,50);master=ac.createGain();master.gain.value=on?.55:0;master.connect(ac.destination);
      const n=ac.sampleRate*2,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;noise=b;
      /* one engine cycle of a V-twin: two uneven exhaust pops (decaying thump + rasp), looped; playbackRate = revs */
      const L=Math.round(ac.sampleRate/11),eb=ac.createBuffer(1,L,ac.sampleRate),ed=eb.getChannelData(0);
      for(const [at,amp] of [[0,1],[.36,.75]]){const s0=Math.round(at*L);for(let i=0;i<L;i++){const t=((i-s0+L)%L)/ac.sampleRate,e=Math.exp(-t*70);ed[i]+=amp*e*(Math.sin(6.2832*62*t)*.9+Math.sin(6.2832*131*t)*.3+(Math.random()*2-1)*.55*Math.exp(-t*160));}}
      engBuf=eb;shp=ac.createWaveShaper();const cv=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;cv[i]=Math.tanh(2.6*x);}shp.curve=cv;}
    const ok=()=>ac&&ac.state==="running";
    function nz(type,f,q,t0,a,dec,vol,f1){const s=ac.createBufferSource();s.buffer=noise;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;s.loopStart=0;fl.frequency.setValueAtTime(f,t0);if(f1)fl.frequency.exponentialRampToValueAtTime(f1,t0+dec);fl.Q.value=q;
      const g=ac.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+a);g.gain.exponentialRampToValueAtTime(.001,t0+a+dec);s.connect(fl);fl.connect(g);g.connect(master);s.start(t0,Math.random()*1.8);s.stop(t0+a+dec+.05);}
    function tone(type,f0,f1,t0,dec,vol){const o=ac.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(f1,t0+dec);
      const g=ac.createGain();g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.001,t0+dec);o.connect(g);g.connect(master);o.start(t0);o.stop(t0+dec+.05);}
    return {init,
      get ac(){return ac;},get out(){return master;},get noise(){return noise;},get ok(){return ok();},
      /* weather ambience pieces: a single rain drop tick, a cricket chirp (night), a soft bird call */
      drop(t,v){if(!ok())return;nz("bandpass",1800+Math.random()*4200,3+Math.random()*5,t,.001,.025+Math.random()*.03,.05*v);},
      cricket(t,v){if(!ok())return;const f=4300+Math.random()*300;for(let i=0;i<3;i++)tone("sine",f,f*.98,t+i*.055,.035,.022*v);},
      get on(){return on;},set(v){on=v;store.set("js1-sound",v?"1":"0");if(master)master.gain.setTargetAtTime(v?.55:0,ac.currentTime,.05);document.dispatchEvent(new Event("sfxready"));},
      thunder(v){if(!ok())return;const t=ac.currentTime;v=v||1;nz("lowpass",900,.7,t,.02,.35,.9*v);nz("lowpass",220,.5,t+.08,.4,2.8,.8*v);nz("lowpass",120,.5,t+.3,.6,3.2,.55*v);},
      gun(){if(!ok())return;const t=ac.currentTime;nz("bandpass",1800,.8,t,.002,.18,.9);nz("lowpass",600,.6,t,.003,.35,.6);tone("sine",140,40,t,.22,.8);},
      thud(){if(!ok())return;const t=ac.currentTime;tone("sine",90,35,t,.28,.9);nz("lowpass",300,.6,t,.005,.25,.4);},
      hoof(v){if(!ok())return;const t=ac.currentTime;nz("lowpass",650,.7,t,.002,.1,.75*v);tone("sine",82,42,t,.11,.6*v);nz("bandpass",1300,4,t,.001,.03,.3*v);},
      neigh(){if(!ok())return;const t=ac.currentTime,o=ac.createOscillator(),lfo=ac.createOscillator(),lg=ac.createGain(),g=ac.createGain(),b1=ac.createBiquadFilter(),b2=ac.createBiquadFilter();
        o.type="sawtooth";o.frequency.setValueAtTime(480,t);o.frequency.linearRampToValueAtTime(980,t+.22);o.frequency.linearRampToValueAtTime(860,t+.7);o.frequency.linearRampToValueAtTime(380,t+1.35);
        lfo.frequency.value=10;lg.gain.setValueAtTime(10,t);lg.gain.linearRampToValueAtTime(70,t+.8);lfo.connect(lg);lg.connect(o.frequency);
        b1.type="bandpass";b1.frequency.value=1100;b1.Q.value=4;b2.type="bandpass";b2.frequency.value=2600;b2.Q.value=5;
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.32,t+.06);g.gain.linearRampToValueAtTime(.22,t+.9);g.gain.exponentialRampToValueAtTime(.001,t+1.45);
        o.connect(b1);o.connect(b2);b1.connect(g);b2.connect(g);g.connect(master);o.start(t);lfo.start(t);o.stop(t+1.5);lfo.stop(t+1.5);nz("bandpass",1600,1,t,.05,1.2,.08);},
      snort(){if(!ok())return;const t=ac.currentTime;nz("bandpass",850,1.4,t,.01,.22,.45);nz("bandpass",700,1.4,t+.28,.01,.3,.35);},
      creak(){if(!ok())return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),fl=ac.createBiquadFilter(),lfo=ac.createOscillator(),lg=ac.createGain();
        o.type="sawtooth";o.frequency.setValueAtTime(70,t);o.frequency.linearRampToValueAtTime(130,t+.5);o.frequency.linearRampToValueAtTime(85,t+.75);
        lfo.frequency.value=28;lg.gain.value=30;lfo.connect(lg);lg.connect(o.frequency);fl.type="bandpass";fl.frequency.value=700;fl.Q.value=3;
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16,t+.05);g.gain.setValueAtTime(.16,t+.6);g.gain.exponentialRampToValueAtTime(.001,t+.8);
        o.connect(fl);fl.connect(g);g.connect(master);o.start(t);lfo.start(t);o.stop(t+.85);lfo.stop(t+.85);},
      wail(){if(!ok())return;const t=ac.currentTime,o=ac.createOscillator(),lfo=ac.createOscillator(),lg=ac.createGain(),g=ac.createGain(),f=420+Math.random()*120;
        o.type="sine";o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*2.1,t+.5);o.frequency.exponentialRampToValueAtTime(f*.8,t+1.6);
        lfo.frequency.value=6;lg.gain.value=f*.04;lfo.connect(lg);lg.connect(o.frequency);
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.13,t+.25);g.gain.exponentialRampToValueAtTime(.001,t+1.7);
        o.connect(g);g.connect(master);o.start(t);lfo.start(t);o.stop(t+1.75);lfo.stop(t+1.75);nz("bandpass",1400,1.2,t,.2,1.4,.05);},
      howl(){if(!ok())return;const t=ac.currentTime,o=ac.createOscillator(),o2=ac.createOscillator(),lfo=ac.createOscillator(),lg=ac.createGain(),g=ac.createGain(),bp=ac.createBiquadFilter();
        o.type="sawtooth";o2.type="sine";o.frequency.setValueAtTime(250,t);o.frequency.linearRampToValueAtTime(530,t+.65);o.frequency.setValueAtTime(530,t+1.4);o.frequency.linearRampToValueAtTime(360,t+2.4);
        o2.frequency.setValueAtTime(500,t);o2.frequency.linearRampToValueAtTime(1060,t+.65);o2.frequency.linearRampToValueAtTime(720,t+2.4);
        lfo.frequency.value=5.5;lg.gain.value=9;lfo.connect(lg);lg.connect(o.frequency);bp.type="bandpass";bp.frequency.value=950;bp.Q.value=2.2;
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.22,t+.3);g.gain.setValueAtTime(.22,t+1.7);g.gain.exponentialRampToValueAtTime(.001,t+2.5);
        o.connect(bp);o2.connect(bp);bp.connect(g);g.connect(master);[o,o2,lfo].forEach(x=>{x.start(t);x.stop(t+2.55);});nz("bandpass",1300,1,t,.3,2.1,.04);},
      growl(){if(!ok())return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),lp=ac.createBiquadFilter(),lfo=ac.createOscillator(),lg=ac.createGain();
        o.type="sawtooth";o.frequency.setValueAtTime(78,t);o.frequency.linearRampToValueAtTime(96,t+.35);o.frequency.linearRampToValueAtTime(70,t+.8);lfo.frequency.value=24;lg.gain.value=14;lfo.connect(lg);lg.connect(o.frequency);
        lp.type="lowpass";lp.frequency.value=520;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.32,t+.06);g.gain.exponentialRampToValueAtTime(.001,t+.85);
        o.connect(lp);lp.connect(g);g.connect(master);o.start(t);lfo.start(t);o.stop(t+.9);lfo.stop(t+.9);nz("lowpass",380,.7,t,.02,.7,.25);},
      laugh(){if(!ok())return;const t=ac.currentTime;[0,.2,.4,.62].forEach((d,i)=>{const o=ac.createOscillator(),g=ac.createGain(),bp=ac.createBiquadFilter(),f=210-i*20;
        o.type="sawtooth";o.frequency.setValueAtTime(f*1.15,t+d);o.frequency.exponentialRampToValueAtTime(f*.82,t+d+.17);bp.type="bandpass";bp.frequency.value=820;bp.Q.value=3;
        g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(.24,t+d+.02);g.gain.exponentialRampToValueAtTime(.001,t+d+.19);o.connect(bp);bp.connect(g);g.connect(master);o.start(t+d);o.stop(t+d+.21);});
        nz("bandpass",1500,2,t,.01,.85,.04);},
      squeak(){if(!ok())return;const t=ac.currentTime;tone("sine",3400,1700,t,.12,.12);nz("lowpass",500,.7,t,.002,.12,.25);},
      hoot(){if(!ok())return;const t=ac.currentTime;[[0,.42],[.62,.2],[.88,.5]].forEach(([d,len],i)=>{const t0=t+d,o=ac.createOscillator(),o2=ac.createOscillator(),g=ac.createGain(),g2=ac.createGain();
        o.type="sine";o.frequency.setValueAtTime(330,t0);o.frequency.linearRampToValueAtTime(i===1?405:385,t0+len*.3);o.frequency.linearRampToValueAtTime(320,t0+len);o2.type="sine";o2.frequency.setValueAtTime(660,t0);o2.frequency.linearRampToValueAtTime(760,t0+len*.3);o2.frequency.linearRampToValueAtTime(640,t0+len);
        g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.42,t0+.07);g.gain.setValueAtTime(.42,t0+len-.1);g.gain.linearRampToValueAtTime(0,t0+len);g2.gain.value=.05;
        o.connect(g);o2.connect(g2);g2.connect(g);g.connect(master);o.start(t0);o2.start(t0);o.stop(t0+len+.05);o2.stop(t0+len+.05);nz("lowpass",450,.7,t0,.05,len,.04);});},
      chirp(v){if(!ok())return;v=v==null?1:v;const t=ac.currentTime;for(let i=0;i<4;i++){const f=3000+Math.random()*900;tone("sine",f,f*1.45,t+i*.11,.08,.14*v);}},
      clink(){if(!ok())return;const t=ac.currentTime;for(let i=0;i<3;i++)tone("sine",2200+Math.random()*1600,1800+Math.random()*900,t+i*.045,.16,.12);},
      whoosh(){if(!ok())return;nz("bandpass",350,1.2,ac.currentTime,.12,.4,.5,2200);},
      /* v15: firework burst (thump + crackle) and sleigh bells */
      pop(v){if(!ok())return;v=v||1;const t=ac.currentTime;nz("lowpass",900,.7,t,.004,.35,.5*v,120);for(let i=0;i<9;i++)nz("highpass",3500,1,t+.12+Math.random()*.5,.002,.04,.12*v);},
      splash(){if(!ok())return;const t=ac.currentTime;nz("highpass",1600,.8,t,.004,.32,.34);nz("bandpass",520,1,t,.008,.22,.22);},
      hiss(v){if(!ok())return;nz("highpass",3200,.7,ac.currentTime,.06,1.1,.16*(v||1),6500);},
      bells(){if(!ok())return;const t=ac.currentTime;for(let i=0;i<14;i++){const f=[2093,2637,3136][i%3]*(1+Math.random()*.01);tone("sine",f,f*.995,t+i*.16+Math.random()*.04,.5,.07);}},
      engine(go,rev){if(!ok())return;const t=ac.currentTime;
        if(go&&!eng){const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=engBuf;s.loop=true;fl.type="lowpass";fl.frequency.value=1100;fl.Q.value=.8;
          g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.5,t+.5);s.connect(shp);shp.connect(fl);fl.connect(g);g.connect(master);s.start();eng={s,fl,g};}
        else if(!go&&eng){const e=eng;eng=null;e.g.gain.setTargetAtTime(0,t,.3);setTimeout(()=>{e.s.stop();try{shp.disconnect();}catch(x){}},1600);}
        if(eng&&rev!=null){eng.s.playbackRate.setTargetAtTime(.9+rev*1.25,t,.12);eng.fl.frequency.setTargetAtTime(900+rev*1700,t,.12);}}};})();
  window.SFX=SFX;
  /* sound unlocks on the first click or key press anywhere (browsers need a gesture) */
  addEventListener("pointerdown",()=>SFX.init(),{once:true});addEventListener("keydown",()=>SFX.init(),{once:true});
  /* camera shake (the page and the trees jolt) and letterbox bars, toggled on <html> */
  /* v11: a Web Animation on the page layers (compositor only). The old version restarted a CSS class with a forced layout of the
     whole page, and its CSS stopped every other animation on the page during the shake, so everything froze and restarted. */
  const SHX=[0,-1,3,-5,5,-5,5,-5,3,-1,0],SHY=[0,0,-1,2,-2,2,-2,2,-1,0,0];
  function shake(k){k=k||1;const fr=SHX.map((x,i)=>({translate:(x*k).toFixed(1)+"px "+(SHY[i]*k).toFixed(1)+"px"}));
    for(const sel of [".wrap","#toc","#jungle","#jungleL","#mascot.ms-fixed"]){const el=document.querySelector(sel);if(el)el.animate(fr,{duration:500,easing:"cubic-bezier(.36,.07,.19,.97)"});}}
  /* the stunt run, as spans of the crossing (0 → 1): a bunny hop, a big jump (often a full backflip, fist in the air), a wheelie,
     and a last hop. Jumps rotate about the bike's centre, the wheelie about the rear wheel; every landing squashes the suspension. */
  function tricks(){const T=[],add=(a,b,k,h)=>T.push({a,b,k,h});
    add(R(.09,.13),R(.2,.23),"hop",R(45,65));
    add(R(.32,.35),R(.53,.56),Math.random()<.65?"flip":"big",R(120,150));
    add(R(.66,.68),R(.76,.78),"wheelie",0);
    add(R(.83,.85),R(.92,.94),"hop",R(35,55));return T;}
  function go(){if(run||reduce.matches)return;const st=R3.state;if(st==="ready"||st==="failed")return go0();
    const gb=document.getElementById("ghostBtn");if(gb)gb.classList.add("loading");let fired=false;
    const fin=()=>{if(fired)return;fired=true;if(gb)gb.classList.remove("loading");go0();};R3.load().then(fin,fin);setTimeout(fin,12000);}
  function title(){const t=document.createElement("div");t.className="ride-title";t.setAttribute("aria-hidden","true");t.innerHTML="<b>THE FIRE RIDER</b><i>rides tonight</i>";
    document.body.appendChild(t);setTimeout(()=>t.remove(),4600);}
  function go0(){if(run||reduce.matches)return;title();dark=isDark();pal=PALS[document.documentElement.dataset.theme]||PALS.fire;const s=Math.max(.45,Math.min(.75,W/2100)),dir=Math.random()<.5?1:-1,v=Math.max(170,W/9);
    run={s,dir,v,mode:"bike",x:dir>0?-160*s:W+160*s,spin:0,t:0,ang:0,pv:[0,-24],lift:0,sq:0,air:false,arm:false,tr:tricks(),g:0,shots:[.2,.32,.44],gun:0,flash:0,aim:-1};run.gy=H;hs=haunt(s);hs.fl=1;over(run);SFX.init();SFX.thunder();shake(1.4);setTimeout(()=>{if(run)SFX.engine(true,.2);},700);last=performance.now();if(!raf)raf=requestAnimationFrame(loop);}
  /* when the hero code window is on screen, the big jump becomes a backflip that arcs over it (other tricks in its way are dropped) */
  function over(r){const hw=document.getElementById("heroWin"),wr=hw&&!hw.hidden&&hw.getBoundingClientRect();if(!wr||wr.top>H-60||wr.bottom<0||wr.width<200)return;
    const base=H-34*r.s-12,need=(base-wr.top+60)/r.s*1.15;if(need<60||need>H*.8/r.s)return;const k=r.tr[1],pL=(wr.left-240)/W,pR=(wr.right+240)/W;
    Object.assign(k,{a:r.dir>0?pL:1-pR,b:r.dir>0?pR:1-pL,h:need,k:"flip",over:true});r.tr=r.tr.filter(t=>t===k||t.b<k.a-.02||t.a>k.b+.02);r.shots=r.shots.filter(p=>p<k.a||p>k.b);if(!r.shots.length)r.shots=[Math.max(.06,k.a-.08)];}
  /* haunted scene while he rides: the page darkens, a pale moon and bats appear, and a graveyard ground (tombstones, crosses, dead
     trees, an iron fence) rises along the bottom where he rides, with green fog drifting through it. hz fades it in and out. */
  let hs=null,hz=0,B=[];
  /* shooting: at set points of each pass (r.shots, progress 0 → 1) he aims his gun arm at the mascot (r.aim, local angle) and fires a
     glowing hellfire round; a near miss makes the bird dodge (MASCOT.dodge), which sends it to hide in the left tree */
  function shoot(p,dt){const r=run;r.gun=Math.max(0,r.gun-dt);r.flash=Math.max(0,r.flash-dt);if(r.gun>0)r.arm=false;
    /* every 1.3–2.1 s he picks off a bat or crow (leading it), unless the chain is busy */
    r.batT=(r.batT==null?1.4:r.batT)-dt;const busy=r.ch&&(r.ch.st==="throw"||r.ch.st==="reel"||r.ch.st==="carry");
    if(r.batT<=0&&hs&&!busy){r.batT=R(1.3,2.1);const L=hs.bats.filter(b=>!b.dead&&b.sx>60&&b.sx<W-60&&b.sy>50&&b.sy<H*.68);
      if(L.length){const b=L[Math.floor(Math.random()*L.length)],S=toW(0,-60),lead=Math.hypot(b.sx-S[0],b.sy-S[1])/1300;fire([b.sx+b.v*lead,b.sy],b);}}
    r.ghT=(r.ghT==null?2.2:r.ghT)-dt;
    if(r.ghT<=0&&hs&&hs.run){r.ghT=R(1.6,2.6);const G=[...hs.run,...hs.ghosts.filter(g=>g.mode!=="swoop"&&g.al>.6)].filter(g=>!g.dead&&g.t>.6&&g.x>60&&g.x<W-60&&g.cy);if(G.length){const g=G[Math.floor(Math.random()*G.length)],S=toW(0,-60),lead=Math.hypot(g.x-S[0],g.cy-S[1])/1300;fire([g.x+g.vx*lead,g.cy],{gh:g});}}
    if(!r.shots.length||p<r.shots[0])return;r.shots.shift();const t=window.MASCOT&&MASCOT.where();if(t)fire(t,null);}
  function fire(t,bat){const r=run;
    const ox=r.mode==="horse"?10:0,oy=r.mode==="horse"?-44:0,S=toW(ox+2,oy-58),a=Math.atan2((t[1]-S[1])/r.s,(t[0]-S[0])/(r.s*r.dir))-r.ang;
    SFX.gun();shake(bat?.2:.45);r.aim=a;r.gun=.8;r.flash=.1;r.arm=false;const M=toW(ox+2+Math.cos(a)*40,oy-58+Math.sin(a)*40),dx=t[0]-M[0],dy=t[1]-M[1],d=Math.hypot(dx,dy)||1;
    B.push({x:M[0],y:M[1],vx:dx/d*1300,vy:dy/d*1300,tx:t[0],ty:t[1],hit:false,bat});
    emit("f",M[0],M[1],14,()=>({vx:dx/d*R(80,260)+R(-40,40),vy:dy/d*R(80,260)+R(-40,40),r:R(2,5),l:R(.1,.22)}));}
  function haunt(s){const G=[],F=[];let x=R(-30,20);document.querySelectorAll(".burning").forEach(e=>e.classList.remove("burning"));
    const dead=(x,y,a,l,w,d,S)=>{const x1=x+Math.sin(a)*l,y1=y-Math.cos(a)*l,b=R(-.22,.22)*l;S.push([x,y,x1,y1,w,(x+x1)/2+Math.cos(a)*b,(y+y1)/2+Math.sin(a)*b]);if(d>0){dead(x1,y1,a-R(.3,.75),l*R(.6,.78),w*.62,d-1,S);dead(x1,y1,a+R(.3,.75),l*R(.6,.78),w*.62,d-1,S);}};
    while(x<W+40){const t=Math.random();
      if(t<.5)G.push({k:"grave",x,h:R(16,32),w:R(11,19),c:Math.random()<.35,tl:R(-.12,.12)});
      else if(t<.72){const S=[];dead(x,0,R(-.18,.18),R(48,84),R(5,9),5,S);G.push({k:"tree",S});}
      else G.push({k:"fence",x,w:R(40,90)});
      x+=R(60,160);}
    for(let x=R(0,60);x<W;x+=R(70,150)){const S=[];dead(x,-6,R(-.2,.2),R(36,64),R(3,5.5),4,S);F.push(S);}
    const bats=[];for(let i=0;i<22;i++){const crow=i<7;bats.push({k:crow?"crow":"bat",x:R(0,W),y:R(H*.06,H*.55),v:(crow?R(70,130):R(50,120))*(Math.random()<.5?1:-1),ph:R(0,6.28),s:crow?R(1.1,1.5):R(.55,1.15),b:R(0,6.28)});}
    const fog=[];for(let i=0;i<18;i++)fog.push({x:R(0,W),dy:R(-40,10),r:R(90,190),v:R(-22,22),g:Math.random()<.6});
    const ghosts=[];for(let i=0;i<8;i++)ghosts.push(roamer(i));
    const eyes=[];for(let i=0;i<9;i++)eyes.push({x:R(20,W-20),dy:R(-50,-8),ph:R(0,6.28),r:Math.random()<.7});
    const wisps=[];for(let i=0;i<3;i++)wisps.push({dx:R(-160,160),dy:R(-24,24),v:R(10,22),w:R(60,110)});
    const cof=[];for(let i=0;i<4;i++)cof.push({x:W*(.12+.76*(i+R(.2,.8))/4),at:1.1+i*R(1.1,1.7),tl:R(-.16,.16),k:R(.9,1.15),dir:Math.random()<.5?1:-1,done:false,cr:false});
    return {G,F,bats,fog,ghosts,eyes,wisps,cof,run:[],t:0,wolf:{st:"gone",t:0},s,ln:R(2,4),fl:0,moon:[W*R(.62,.78),R(H*.1,H*.17)]};}
  function web(x,y,dir){/* a cobweb in a top corner: radial threads + sagging rings */
    const R0=110;ctx.beginPath();for(let i=0;i<=6;i++){const a=(dir>0?0:Math.PI/2)+i*Math.PI/12;ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*R0*dir,y+Math.sin(a)*R0);}
    for(let k=1;k<=5;k++){const rr=k*R0/5.5;for(let i=0;i<6;i++){const a0=i*Math.PI/12,a1=(i+1)*Math.PI/12,m=(a0+a1)/2;
      ctx.moveTo(x+Math.cos(a0)*rr*dir,y+Math.sin(a0)*rr);ctx.quadraticCurveTo(x+Math.cos(m)*rr*.86*dir,y+Math.sin(m)*rr*.86,x+Math.cos(a1)*rr*dir,y+Math.sin(a1)*rr);}}ctx.stroke();}
  /* werewolf v3: a rigged, furry creature with wolf anatomy. Bones (hips, ribcage, shoulders, neck, broad skull, muzzle with a nose,
     hinged lower jaw, big swept-back ears, arms with long claws, digitigrade legs, bushy tail) are posed by joint angles; each bone is
     wrapped in a tapered capsule whose outline carries irregular fur tufts (many short, a few long, swept backwards, stirring slightly).
     The union is filled near-black with a pale moonlit rim, glowing red eyes and fangs. Poses: "howl" (upright on a crag in front of a
     swollen moon, muzzle to the sky), "leap" (stretched out, claws first), "land" (heavy crouch) and "run" (gallop: legs gather and
     extend, the spine flexes). Facing +x, ~190 units tall standing; except for the leap the figure is shifted so its lowest point sits
     on y = 0. */
  const WHN=n=>{const x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x);};
  function wcap(p,A,ra,B,rb,seed,amp,T){const dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,nx=-uy,ny=ux,N=Math.max(4,Math.round(L/3.2)),pts=[];
    /* fur: odd samples are tufts; length ~ k^1.7 (mostly short, a few long), swept back along the bone */
    const tuft=i=>{if(!(i%2)||!amp)return [0,0];const k=Math.pow(WHN(seed+i*7.13),1.7);return [amp*(.25+1.6*k)*(1+.12*Math.sin(T*3.1+i*1.7)),-(1.5+7*k)*amp];};
    const side=(sgn,base,t,r,i)=>{const [e,b]=tuft(i),d=r*(1+e);return [A[0]+dx*t+sgn*nx*d+ux*b,A[1]+dy*t+sgn*ny*d+uy*b];};
    for(let i=0;i<=N;i++){const t=i/N;pts.push(side(1,0,t,ra+(rb-ra)*t,i));}
    for(let j=1;j<6;j++){const an=j/6*Math.PI,c=Math.cos(an),s=Math.sin(an),[e]=tuft(N+j),d=rb*(1+e*.6);pts.push([B[0]+(nx*c+ux*s)*d,B[1]+(ny*c+uy*s)*d]);}
    for(let i=N;i>=0;i--){const t=i/N;pts.push(side(-1,0,t,ra+(rb-ra)*t,i+31));}
    for(let j=1;j<6;j++){const an=j/6*Math.PI,c=Math.cos(an),s=Math.sin(an),[e]=tuft(N+j+60),d=ra*(1+e*.6);pts.push([A[0]-(nx*c+ux*s)*d,A[1]-(ny*c+uy*s)*d]);}
    p.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length;k++)p.lineTo(pts[k][0],pts[k][1]);p.closePath();}
  function wtri(p,a,b,c){p.moveTo(a[0],a[1]);p.lineTo(b[0],b[1]);p.lineTo(c[0],c[1]);p.closePath();}
  function wcirc(p,c,r){p.moveTo(c[0]+r,c[1]);p.arc(c[0],c[1],r,0,6.2832);}
  const wgo=(o,a,l)=>[o[0]+Math.cos(a)*l,o[1]+Math.sin(a)*l],UP=-Math.PI/2,DN=Math.PI/2;
  function wolfRig(pose,g,T){
    let H=[0,0],C,N,S,ma,jo,arms,legs,tail,br=1+.04*Math.sin(T*2.6);
    if(pose==="howl"){
      C=wgo(H,UP+.2,64);N=wgo(C,UP+.22,24);S=wgo(N,UP+.18,15);ma=UP+.55+Math.sin(T*1.1)*.04;jo=.62+.08*Math.sin(T*1.9);
      arms=[[DN-.05,DN-.5,DN-.25,0],[DN+.2,DN-.15,DN+.1,1]];
      legs=[[DN-.5,DN+.6,DN-.3,0],[DN-.22,DN+.78,DN-.12,.1]];tail=DN+1.05;}
    else if(pose==="leap"){
      C=wgo(H,-.3,70);N=wgo(C,-.55,24);S=wgo(N,-.2,15);ma=.02;jo=.62;br=1;
      arms=[[-.45,-.15,.1,0],[.05,0,.25,1]];legs=[[2.5,2.95,2.4,2.1],[2.25,2.75,2.3,2]];tail=Math.PI+.1;}
    else if(pose==="land"){
      C=wgo(H,-.45,60);N=wgo(C,-.45,24);S=wgo(N,-.05,15);ma=.15;jo=.5;
      arms=[[DN-.05,DN+.3,0,0],[DN+.15,DN+.35,.05,1]];legs=[[DN-1,DN+1.2,DN-.65,0],[DN-.85,DN+1.1,DN-.55,.05]];tail=Math.PI-.55;}
    else{const f=Math.sin(g);
      C=wgo(H,-.16+.07*f,70+8*f);N=wgo(C,-.85,24);S=wgo(N,-.3+.05*Math.sin(g*2),15);ma=.12;jo=.32+.14*Math.max(0,Math.sin(g));br=1;
      const fr=k=>{const u=DN-.85*Math.sin(g+k);return [u,u-.1+1.05*Math.max(0,Math.sin(g+k+1.6)),u+.3+.4*Math.max(0,Math.sin(g+k+1.6)),0];};
      const hd=k=>{const th=DN-.25+.8*Math.sin(g+Math.PI+k);return [th,th+1+.55*Math.max(0,Math.sin(g+Math.PI+k+1.6)),th-.2,0];};
      arms=[fr(0).slice(0,3).concat(0),fr(.5).slice(0,3).concat(1)];legs=[hd(0),hd(.5)];tail=Math.PI-.3+.2*Math.sin(g);}
    const Sh=[C[0]+4,C[1]+11],Hp=[H[0]-2,H[1]+5];
    const A=arms.map(([a1,a2,a3,far])=>{const E=wgo(Sh,a1,40),W=wgo(E,a2,38),Hd=wgo(W,a3,16);return {E,W,Hd,a3,far};});
    const Lg=legs.map(([a1,a2,a3,a4])=>{const K=wgo(Hp,a1,46),Hk=wgo(K,a2,42),An=wgo(Hk,a3,28),Ft=wgo(An,a4,14);return {K,Hk,An,Ft,a4};});
    const tl=[H];for(let i=0;i<5;i++)tl.push(wgo(tl[i],tail+i*.14*(pose==="howl"?-1:1),14));
    return {H,C,N,S,ma,jo,br,Sh,Hp,A,Lg,tl};}
  function wolfPath(R,T){const p=new Path2D(),{H,C,N,S,ma,jo,br,Sh,Hp,A,Lg,tl}=R;
    const M=wgo(S,ma,40),J=wgo(S,ma+jo,34),mz0=wgo(S,ma,8);
    const arm=(a,s0)=>{wcap(p,Sh,12,a.E,9,s0,.35,T);wcap(p,a.E,9,a.W,6.5,s0+4,.45,T);wcap(p,a.W,6,a.Hd,4,s0+8,.1,T);};
    const leg=(l,s0)=>{wcap(p,Hp,17,l.K,11,s0,.3,T);wcap(p,l.K,9.5,l.Hk,7,s0+4,.35,T);wcap(p,l.Hk,7,l.An,5,s0+8,.12,T);wcap(p,l.An,5,l.Ft,3.5,s0+12,0,T);};
    A.filter(a=>a.far).forEach(a=>arm(a,11));Lg.slice(1).forEach(l=>leg(l,23));
    for(let i=0;i<tl.length-1;i++)wcap(p,tl[i],9.5-i*1.3,tl[i+1],8.2-i*1.4,41+i*5,1.05,T);
    wcap(p,H,22,C,30*br,47,.35,T);wcap(p,[H[0]+8,H[1]+6],16,[C[0]+8,C[1]+14],24*br,49,.3,T);
    wcap(p,C,26*br,Sh,17,51,.55,T);
    wcap(p,[C[0]-10,C[1]+8],18,[N[0]-7,N[1]+2],15,53,1.0,T);wcap(p,C,22*br,N,17,59,.8,T);
    wcap(p,N,16,S,12,61,.5,T);wcap(p,S,12,mz0,9.5,63,.12,T);wcap(p,mz0,8.2,M,3.8,67,.03,T);wcap(p,wgo(S,ma-1.2,6),5,wgo(S,ma-.35,14),3,69,0,T);
    wcap(p,wgo(S,ma+jo,4),6.5,J,2.6,71,.06,T);
    const ea=ma-2.3,eb=wgo(S,ea+.55,9),ec=wgo(S,ea-.5,8);wtri(p,eb,wgo(S,ea,28),ec);wtri(p,wgo(S,ea+.15,7),wgo(S,ea+.3,24),wgo(S,ea+.9,9));
    Lg.slice(0,1).forEach(l=>leg(l,73));A.filter(a=>!a.far).forEach(a=>arm(a,97));
    A.forEach(a=>{for(let k=-1;k<=1;k++){const ang=a.a3+k*.38,b=wgo(a.Hd,ang,2),t=wgo(a.Hd,ang+.32,15);wtri(p,wgo(b,ang+1.57,2),t,wgo(b,ang-1.57,2));}});
    Lg.forEach(l=>{for(let k=-1;k<=1;k++){const ang=l.a4+k*.3,b=wgo(l.Ft,ang,1.5),t=wgo(l.Ft,ang+.38,10);wtri(p,wgo(b,ang+1.57,1.6),t,wgo(b,ang-1.57,1.6));}});
    return p;}
  function wlow(R){let m=-1e9;R.Lg.forEach(l=>{m=Math.max(m,l.Ft[1]+4,l.An[1]+5);});R.A.forEach(a=>{m=Math.max(m,a.Hd[1]+4);});return m;}
  function wolfDraw(x,y,sc,dir,pose,g,a,rot,T,light){if(R3.on){R3.wolf(x,y,sc,dir,pose,g,a,rot,T);return;}const R=wolfRig(pose,g,T),p=wolfPath(R,T),S=R.S,ma=R.ma,jo=R.jo;
    ctx.save();ctx.translate(x,y);ctx.rotate(rot||0);ctx.scale(sc*dir,sc);if(pose!=="leap")ctx.translate(0,-wlow(R));else ctx.translate(-R.C[0]*.5,-R.C[1]*.5);
    if(pose!=="howl"){const cx=R.C[0]*.5,cy=R.C[1]*.5-10,au=ctx.createRadialGradient(cx,cy,6,cx,cy,120);au.addColorStop(0,"rgba(170,255,200,"+(.16*a).toFixed(3)+")");au.addColorStop(1,"rgba(170,255,200,0)");
      ctx.fillStyle=au;ctx.beginPath();ctx.arc(cx,cy,120,0,6.2832);ctx.fill();}
    const rim="rgba(222,255,226,"+(.85*a).toFixed(3)+")";
    if(pose==="howl"){ctx.strokeStyle=rim;ctx.lineWidth=2.6/sc;ctx.lineJoin="round";ctx.stroke(p);}
    else{const lx=(light?light[0]:-.4)*dir,ly=light?light[1]:-.9,k=1.9/sc;ctx.save();ctx.translate(lx*k,ly*k);ctx.fillStyle=rim;ctx.fill(p);ctx.restore();}
    ctx.fillStyle="rgba(9,5,13,"+a.toFixed(3)+")";ctx.fill(p);
    if(jo>.2){ctx.beginPath();ctx.fillStyle="rgba(240,236,224,"+(.95*a).toFixed(3)+")";
      for(const t of [.4,.56,.72,.88]){const u=wgo(S,ma,40*t),d=wgo(u,ma+Math.PI/2,7.2-3.8*t),v=wgo(S,ma+jo,34*t),e=wgo(v,ma+jo-Math.PI/2,5.2-2.8*t),big=t===.88?1.7:1;
        wtri(ctx,d,wgo(d,ma+Math.PI/2,3.4*big),wgo(d,ma,2.4));wtri(ctx,e,wgo(e,ma+jo-Math.PI/2,2.8*big),wgo(e,ma+jo,2));}
      ctx.fill();}
    const E=wgo(S,ma-.62,9.5),eg=ctx.createRadialGradient(E[0],E[1],0,E[0],E[1],6.5);eg.addColorStop(0,"rgba(255,60,40,"+a.toFixed(3)+")");eg.addColorStop(1,"rgba(255,30,20,0)");
    ctx.fillStyle=eg;ctx.beginPath();ctx.arc(E[0],E[1],6.5,0,6.2832);ctx.fill();ctx.fillStyle="rgba(255,210,180,"+a.toFixed(3)+")";ctx.beginPath();ctx.ellipse(E[0],E[1],2.2,1.3,ma,0,6.2832);ctx.fill();
    ctx.restore();}
  function wolfTick(h,dt,a,onMoon){const w=h.wolf;if(!w)return;const [mx,my]=h.moon,gy=H-17*h.s-12,sRun=h.s*1.25,sMoon=.6,T=h.t;
    const light=(x,y)=>{const dx=mx-x,dy=my-y,l=Math.hypot(dx,dy)||1;return [dx/l,dy/l];};
    if(onMoon){w.t+=dt;
      if(w.st==="wait"&&h.t>2.2){w.st="howl";w.t=0;SFX.howl();w.dir=mx<W/2?1:-1;}
      if(w.st==="howl"&&w.t>2.6){w.st="leap";w.t=0;w.x0=mx;w.y0=my+72;w.x1=Math.max(90,Math.min(W-90,mx+w.dir*Math.min(440,W*.3)));SFX.whoosh();}
      if(w.st==="leap"&&w.t>1.3){w.st="land";w.t=0;SFX.thud();shake(.75);SFX.growl();
        for(let i=0;i<4;i++)emit("m",w.x1+R(-40,40),gy,4,()=>({vx:R(-110,110),vy:R(-90,-20),r:R(6,13),l:R(.6,1.3)}));}
      if(w.st==="land"&&w.t>.55){w.st="run";w.t=0;w.x=w.x1;w.g=0;}
      if(w.st==="howl"||w.st==="leap"&&w.t<.4){const k=w.st==="howl"?Math.min(1,w.t/.5):1-w.t/.4,R0=40+62*k;
        /* the moon swells behind a rocky crag */
        const gl2=ctx.createRadialGradient(mx,my,R0*.6,mx,my,R0*2.6);gl2.addColorStop(0,"rgba(230,255,215,"+(.4*k*a).toFixed(3)+")");gl2.addColorStop(1,"rgba(230,255,215,0)");
        ctx.fillStyle=gl2;ctx.fillRect(mx-R0*2.6,my-R0*2.6,R0*5.2,R0*5.2);ctx.fillStyle="rgba(232,250,214,"+(.96*a*k).toFixed(3)+")";ctx.beginPath();ctx.arc(mx,my,R0,0,6.2832);ctx.fill();
        ctx.fillStyle="rgba(150,175,140,"+(.35*a*k).toFixed(3)+")";for(const [cx,cy,cr] of [[-.3,-.2,.18],[.28,.15,.14],[.12,-.42,.1],[-.36,.34,.12]]){ctx.beginPath();ctx.arc(mx+cx*R0,my+cy*R0,cr*R0,0,6.2832);ctx.fill();}
        ctx.fillStyle="rgba(9,5,13,"+(a*k).toFixed(3)+")";ctx.beginPath();ctx.moveTo(mx-R0*1.25,my+R0*1.05);ctx.lineTo(mx-R0*.55,my+R0*.62);ctx.lineTo(mx-R0*.2,my+R0*.7);ctx.lineTo(mx+R0*.05,my+R0*.5);
        ctx.lineTo(mx+R0*.32,my+R0*.58);ctx.lineTo(mx+R0*.7,my+R0*.48);ctx.lineTo(mx+R0*1.3,my+R0*1.05);ctx.closePath();ctx.fill();
        if(w.st==="howl")wolfDraw(mx+R0*.05*w.dir,my+R0*.52,sMoon*(R0/102),w.dir,"howl",0,a*k,0,T);}
      return;}
    if(w.st==="leap"){const u=Math.min(1,w.t/1.3),x=w.x0+(w.x1-w.x0)*u,y=w.y0+(gy-60*sRun-w.y0)*u*u-Math.sin(Math.PI*u)*170,sc=sMoon+(sRun-sMoon)*Math.pow(u,1.3),rot=(u-.35)*.75*w.dir;
      wolfDraw(x,y,sc,w.dir,"leap",0,a,rot,T,light(x,y));}
    else if(w.st==="land"){const c=Math.sin(Math.min(1,w.t/.55)*Math.PI);ctx.save();ctx.translate(w.x1,gy);ctx.scale(1+.06*c,1-.1*c);wolfDraw(0,0,sRun,w.dir,"land",0,a,0,T,light(w.x1,gy));ctx.restore();}
    else if(w.st==="run"){w.x+=w.dir*460*dt;w.g+=dt*13;if((w.dir>0&&w.x>W+180)||(w.dir<0&&w.x<-180)){w.st="gone";return;}
      wolfDraw(w.x,gy+Math.abs(Math.cos(w.g))*-5*sRun,sRun,w.dir,"run",w.g,a,0,T,light(w.x,gy));
      if(Math.random()<.4)emit("m",w.x-w.dir*40*sRun,gy,1,()=>({vx:-w.dir*R(20,70),vy:R(-50,-10),r:R(3,7),l:R(.4,.9)}));}}
  /* v17 ghost painter (window.ghostPaint): a glowing spectre drawn in head-radius units and scaled to S px. A soft aura, a domed head
     whose body flows down into 5 tattered tendrils that trail behind it (lean = forward speed 0..1), two wispy arms reaching ahead
     (arms 0 low … 1.3 raised), a hollow face turned three-quarters to the front: dark sockets with faint glowing pupils and a mouth that
     opens into a wail (mouth 0..1). It faces +x; dir (-1..1) mirrors it, and values in between squash it while it turns round.
     o.tint 1 = sickly green instead of moon-blue; o.light adds a soft outline so it still reads on light pages. */
  const GSPR={};
  function gSprite(k){if(GSPR[k])return GSPR[k];const c=document.createElement("canvas");c.width=c.height=64;const g=c.getContext("2d"),r=g.createRadialGradient(32,32,0,32,32,32);
    r.addColorStop(0,"rgba("+k+",.55)");r.addColorStop(.4,"rgba("+k+",.22)");r.addColorStop(1,"rgba("+k+",0)");g.fillStyle=r;g.fillRect(0,0,64,64);return GSPR[k]=c;}
  function ghostPaint(c,x,y,S,dir,t,al,o){o=o||{};if(al<=.01||S<1)return;
    const ph=o.ph||0,lean=Math.max(0,Math.min(1,o.lean||0)),mouth=o.mouth||0,arms=o.arms==null?.35:o.arms,tint=o.tint?1:0;
    const C0=tint?"214,255,228":"238,245,255",C1=tint?"150,255,190":"165,215,255",AU=tint?"120,255,170":"150,200,255";
    c.save();c.translate(x,y);c.scale(S*(Math.abs(dir)<.12?.12*Math.sign(dir||1):dir),S);c.rotate(lean*.32);
    c.globalAlpha=al;c.drawImage(gSprite(AU),-3.6,-3.2,7.2,7.6);c.globalAlpha=1;
    const L=2.75+.2*Math.sin(t*2.1+ph)+lean*.5,tl=-lean*1.5-.15*Math.sin(t*1.7+ph);
    const body=()=>{c.beginPath();c.moveTo(-1,.05);c.arc(0,0,1,Math.PI,0);c.bezierCurveTo(1.08,.85,1.02+tl*.25,1.6,.92+tl*.55,L*.72);
      for(let i=0;i<5;i++){const u0=.92-i*.38,u1=u0-.38,um=(u0+u1)/2,w=Math.sin(t*5.2+ph+i*1.4),ln=L+.3*w+(i%2?.35:0)+i*.08;
        c.quadraticCurveTo(u0+tl*.75,ln*.9,um+tl*(1+i*.08)+.12*w,ln);c.quadraticCurveTo(u1+tl*.7,L*.78+.12*Math.sin(t*4.3+i*2),u1+tl*.55,L*.72);}
      c.bezierCurveTo(-1+tl*.25,1.6,-1.08,.85,-1,.05);c.closePath();};
    /* a wispy sleeve: wide at the shoulder, bending at the elbow, tapering to a curled tip; it waves and rises when scared */
    const arm=(sd,a0)=>{const sx=sd?.45:-.45,sy=.6,w=Math.sin(t*6.5+ph+sd*2.1),w2=Math.sin(t*4.1+ph+sd),
        ex=sx+1.5+.25*arms,ey=sy+.25-1.3*arms+.3*w2,mx=(sx+ex)/2+.1,my=(sy+ey)/2+.35-.2*arms+.15*w,
        ag=c.createLinearGradient(sx,sy,ex,ey);ag.addColorStop(0,"rgba("+C0+",0)");ag.addColorStop(.3,"rgba("+C0+","+(a0*al).toFixed(3)+")");ag.addColorStop(1,"rgba("+C1+",0)");
      c.fillStyle=ag;c.beginPath();c.moveTo(sx,sy-.2);c.quadraticCurveTo(mx,my-.16,ex,ey);c.quadraticCurveTo(mx,my+.16,sx,sy+.2);c.closePath();c.fill();};
    arm(0,.4);
    body();const g=c.createLinearGradient(0,-1,tl*.4,L+.5);g.addColorStop(0,"rgba("+C0+","+(.93*al).toFixed(3)+")");g.addColorStop(.42,"rgba("+C0+","+(.7*al).toFixed(3)+")");
    g.addColorStop(.78,"rgba("+C1+","+(.28*al).toFixed(3)+")");g.addColorStop(1,"rgba("+C1+",0)");c.fillStyle=g;c.fill();
    if(o.light){c.strokeStyle="rgba(70,80,130,"+(.28*al).toFixed(3)+")";c.lineWidth=.07;c.stroke();}
    arm(1,.6);
    /* inner light on the crown */
    const hg=c.createRadialGradient(-.25,-.5,0,-.25,-.5,1.05);hg.addColorStop(0,"rgba(255,255,255,"+(.55*al).toFixed(3)+")");hg.addColorStop(1,"rgba(255,255,255,0)");
    c.fillStyle=hg;c.beginPath();c.arc(0,0,1,0,6.2832);c.fill();
    /* hollow face, three-quarters to the front: slanted sockets, glowing pupils, a wailing mouth */
    const bl=Math.sin(t*.9+ph*3)>.97?.15:1;
    c.fillStyle="rgba(14,8,30,"+(.88*al).toFixed(3)+")";
    for(const [ex,ey,rx,ry,rt] of [[-.06,-.18,.15,.25*bl,-.22],[.56,-.15,.14,.23*bl,.2],[.27,.5+.08*mouth,.1+.06*mouth,.07+.28*mouth,0]]){c.beginPath();c.ellipse(ex,ey,rx,ry,rt,0,6.2832);c.fill();}
    if(bl>.5){const pg=.55+.45*Math.sin(t*3+ph);c.fillStyle="rgba("+(tint?"170,255,140":"150,235,255")+","+(pg*al).toFixed(3)+")";c.beginPath();
      c.arc(-.02,-.13,.05,0,6.2832);c.moveTo(.635,-.11);c.arc(.59,-.11,.045,0,6.2832);c.fill();}
    c.restore();}
  window.ghostPaint=ghostPaint;

  /* v17 roaming ghosts of the haunted ride (hs.ghosts, 8): each wanders on its own, steering toward a new random point every 2–4 s,
     bobbing and turning round smoothly (g.f eases between -1 and 1). Every 5–9 s one of them either swoops at the viewer (grows ×6 and
     fades, then returns from an edge) or circles the moon for a while. Any ghost within 300 px of the rider flees screaming, arms up.
     The rider shoots them too (shoot() targets hs.run + hs.ghosts): a hit one bursts into green mist and comes back 2.6 s later. */
  function roamer(i){const L=Math.random()<.5;return {x:R(W*.08,W*.92),y:R(H*.1,H*.6),vx:0,vy:0,tx:R(W*.1,W*.9),ty:R(H*.1,H*.62),tt:R(1.5,3.5),
      s:R(.85,1.25),ph:R(0,6.28),t:-i*.6,f:L?1:-1,mode:"roam",mt:0,sc:.3,al:0,mouth:.6,arms:.9,tint:Math.random()<.35,tr:[],cy:0,dead:false,dt:0};}
  function mist(x,y,S,k,a){for(let j=0;j<3;j++){const rr=S*(1+k*3.2)*(.55+j*.3),cx=x+(j-1)*S*.3,cy=y-j*S*.2,gg=ctx.createRadialGradient(cx,cy,rr*.2,cx,cy,rr);
      gg.addColorStop(0,"rgba(160,255,190,"+(.45*(1-k)*a).toFixed(3)+")");gg.addColorStop(1,"rgba(120,255,170,0)");ctx.fillStyle=gg;ctx.beginPath();ctx.arc(cx,cy,rr,0,6.2832);ctx.fill();}}
  function roam(h,dt,a){const r=run,me=r?toW(0,-60):null;
    h.swT=(h.swT==null?4:h.swT)-dt;
    if(h.swT<=0){h.swT=R(5,9);const L=h.ghosts.filter(g=>g.mode==="roam"&&!g.dead&&g.t>1.5&&g.x>0&&g.x<W);
      if(L.length){const g=L[Math.floor(Math.random()*L.length)];
        if(Math.random()<.55){g.mode="swoop";g.mt=0;g.sx=g.x;g.sy=g.y;SFX.wail();}else{g.mode="orbit";g.mt=0;g.oa=Math.atan2(g.y-h.moon[1],g.x-h.moon[0]);}}}
    for(const g of h.ghosts){g.t+=dt;
      if(g.dead){g.dt+=dt;if(g.dt<1.1)mist(g.x,g.cy,12*g.s,g.dt/1.1,a);if(g.dt>2.6)Object.assign(g,roamer(0),{t:0});continue;}
      if(g.t<0)continue;g.al=Math.min(1,g.al+dt*.9);if(g.mode!=="swoop")g.sc+=(1-g.sc)*Math.min(1,dt*2.5);
      let tx=g.tx,ty=g.ty,max=95*g.s,scared=false;const dx=me?g.x-me[0]:0,dy=me?g.y-me[1]:0,dr=Math.hypot(dx,dy);
      if(me&&dr<300&&g.mode!=="swoop"){scared=true;const k=1/(dr||1);tx=g.x+dx*k*260;ty=Math.max(H*.06,Math.min(H*.72,g.y+dy*k*200-90));max=330*g.s;if(g.mode==="orbit")g.mode="roam";}
      if(g.mode==="swoop"){g.mt+=dt;const u=Math.min(1,g.mt/1.8),e=u*u;g.x=g.sx+(W/2-g.sx)*e;g.y=g.sy+(H*.42-g.sy)*e;g.sc=1+e*5;g.al=1-Math.pow(u,1.6);g.mouth=1;g.arms=1.25;
        g.vx=(W/2-g.sx)*.4;g.vy=0;if(u>=1){Object.assign(g,roamer(0),{t:0});continue;}}
      else{if(g.mode==="orbit"){g.mt+=dt;g.oa+=dt*1.2;const rr=100+22*Math.sin(g.mt*2);tx=h.moon[0]+Math.cos(g.oa)*rr;ty=h.moon[1]+Math.sin(g.oa)*rr*.7;max=230*g.s;if(g.mt>6)g.mode="roam";}
        else if(!scared){g.tt-=dt;if(g.tt<=0||Math.hypot(g.tx-g.x,g.ty-g.y)<40){g.tt=R(2,4);g.tx=R(W*.06,W*.94);g.ty=R(H*.1,H*.66);}}
        const ex=tx-g.x,ey=ty-g.y,el=Math.hypot(ex,ey)||1,sp=Math.min(max,el*2),k=Math.min(1,dt*(scared?4:1.5));
        g.vx+=(ex/el*sp-g.vx)*k;g.vy+=(ey/el*sp-g.vy)*k;g.x+=g.vx*dt;g.y+=g.vy*dt;
        g.mouth+=((scared?1:.12+.12*Math.sin(g.t*.7+g.ph))-g.mouth)*Math.min(1,dt*5);g.arms+=((scared?1.25:.3+.25*Math.sin(g.t*1.3+g.ph))-g.arms)*Math.min(1,dt*4);
        if(scared&&!g.scr){g.scr=1;if(Math.random()<.35)SFX.wail();}if(!scared)g.scr=0;
        if(g.x<-160||g.x>W+160||g.y<-160||g.y>H+120){Object.assign(g,roamer(0),{t:0});continue;}}
      const want=g.vx>12?1:g.vx<-12?-1:g.f>=0?1:-1;g.f+=(want-g.f)*Math.min(1,dt*3.5);
      const y=g.y+Math.sin(g.t*2.2+g.ph)*7,S=12*g.s*g.sc,AU=g.tint?"120,255,170":"150,200,255";g.cy=y+S*.6;
      g.tr.push([g.x,y]);if(g.tr.length>9)g.tr.shift();
      for(let i=0;i<g.tr.length-1;i++){const q=(i+1)/g.tr.length,[x0,y0]=g.tr[i];ctx.globalAlpha=.3*q*g.al*a;ctx.drawImage(gSprite(AU),x0-S*1.2,y0+S*.2,S*2.4,S*2.4);}ctx.globalAlpha=1;
      ghostPaint(ctx,g.x,y,S,g.f,g.t+g.ph,g.al*a*.95,{lean:Math.hypot(g.vx,g.vy)/(260*g.s),mouth:g.mouth,arms:g.arms,ph:g.ph,tint:g.tint});}}
  /* v16 inferno: as he rides, the road behind him, the coffins and the trees catch fire (inferno() below); each flame is a
     tongue(x,y,h,w) emitter for the v18 particle fire. Drawn on #riderLow, above the trees and below the 3D rider. */
  /* v19 GPU fire (canvas #fireGL, WebGL2, half resolution, between #riderLow and the 3D rider): each tongue(x,y,h,w) is one instanced
     quad whose fragment shader draws a procedural flame: two layers of domain-warped fractal noise scroll upward, bend the flame and
     tear its tips apart; the silhouette narrows with height; colour follows a blackbody ramp (the theme's pal.f: deep red → orange →
     yellow → white core) and a soft bloom halo is added. Output is premultiplied with alpha 0, so the page composites it additively.
     Falls back to the 2D particle fire when WebGL2 is unavailable. */
  /* v21 smoke plumes: a second instanced program draws billowing smoke columns (x, y = plume base, w, h, seed, alpha) BEFORE the
     fire, blended normally (premultiplied), dark grey with lighter billows, lit orange from underneath by the fire (c2) */
  const GF=(function(){let gl=null,cvF=null,ok=null,prog,vao,ib,U={},data=new Float32Array(6*1400),drawn=false,sp,svao,sib,SU={},sdata=new Float32Array(6*200);
    const SVS="#version 300 es\nin vec2 aC;in vec4 aI;in vec2 aJ;uniform vec2 uR;out vec2 vU;out float vS;out float vK;"+
      "void main(){vec2 p=aI.xy+vec2(aC.x*aI.z,-aC.y*aI.w);vU=aC;vS=aJ.x;vK=aJ.y;gl_Position=vec4(p.x/uR.x*2.-1.,1.-p.y/uR.y*2.,0.,1.);}";
    const SFS="#version 300 es\nprecision highp float;in vec2 vU;in float vS;in float vK;uniform float uT;uniform vec3 c2;out vec4 o;"+
      "float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}"+
      "float nz(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(hh(i),hh(i+vec2(1,0)),u.x),mix(hh(i+vec2(0,1)),hh(i+vec2(1,1)),u.x),u.y);}"+
      "float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*nz(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}"+
      "void main(){float y=vU.y,t=uT*.32+vS*5.7;"+
      "float lean=y*y*.55*sin(vS*3.1+uT*.15);"+
      "vec2 p=vec2(vU.x*1.3-lean,y*2.2-t);"+
      "float w=fb(p*1.3+vec2(0.,-t*.4));"+
      "float n=fb(p*2.1+vec2(w*1.8,w));"+
      "float wd=mix(.28,1.,pow(y,.55));"+
      "float x=(vU.x-lean)/wd;"+
      "float d=(1.-smoothstep(.15,1.,abs(x)+(n-.5)*.7))*smoothstep(0.,.18,y)*(1.-smoothstep(.45,1.,y));"+
      "d*=smoothstep(.28,.72,n+.12);"+
      "float a=clamp(d*.85,0.,1.)*vK;"+
      "vec3 col=mix(vec3(.06,.055,.065),vec3(.24,.23,.26),smoothstep(.3,.8,n));"+
      "col+=vec3(.1,.12,.17)*smoothstep(.35,1.,y)*smoothstep(.4,.9,n);"+
      "col+=c2*1.15*pow(1.-y,3.)*smoothstep(.2,.8,n);"+
      "o=vec4(col*a,a);}";
    const VS="#version 300 es\nin vec2 aC;in vec4 aI;in vec2 aJ;uniform vec2 uR;out vec2 vU;out float vS;out float vK;"+
      "void main(){vec2 p=aI.xy+vec2(aC.x*aI.z*1.6,-(aC.y*1.3-.1)*aI.w);vU=vec2(aC.x*1.6,aC.y*1.3-.1);vS=aJ.x;vK=aJ.y;"+
      "gl_Position=vec4(p.x/uR.x*2.-1.,1.-p.y/uR.y*2.,0.,1.);}";
    const FSH="#version 300 es\nprecision highp float;in vec2 vU;in float vS;in float vK;uniform float uT;uniform vec3 c0,c1,c2,c3;out vec4 o;"+
      "float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}"+
      "float nz(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(hh(i),hh(i+vec2(1,0)),u.x),mix(hh(i+vec2(0,1)),hh(i+vec2(1,1)),u.x),u.y);}"+
      "float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*nz(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}"+
      "void main(){vec2 u=vU;float t=uT*1.15+vS*7.31;"+
      "float n1=fb(vec2(u.x*1.5+vS*3.1,u.y*1.3-t*1.7));"+
      "float n2=fb(vec2(u.x*3.4-vS,u.y*3.1-t*2.9)+vec2(n1*1.6,n1));"+
      "float y=max(u.y,0.);"+
      "float x=u.x+(n1-.5)*1.2*y+(n2-.5)*.4*y+sin(uT*2.1+vS*5.3)*.3*y*y;"+
      "float w=mix(.95,.18,pow(min(y,1.2),.7));"+
      /* flame field: wide hot base, cooling with height, torn by turbulence that grows toward the tips */
      "float f=(1.-abs(x)/w)*1.1-pow(y,1.3)*.9+(n2-.55)*(.6+y*1.5)+(n1-.5)*.3;"+
      "f=clamp(f*smoothstep(-.12,.14,u.y+(n1-.5)*.1)*(1.-.35*smoothstep(.0,-.12,u.y)),0.,1.);"+
      "float tp=pow(f,1.15);"+
      "vec3 col=mix(c3*.35,c3,smoothstep(.0,.25,tp));col=mix(col,c2,smoothstep(.2,.5,tp));col=mix(col,c1,smoothstep(.45,.75,tp));col=mix(col,c0,smoothstep(.8,1.,tp));"+
      "float a=smoothstep(.0,.28,f);"+
      "float ef=(1.-smoothstep(.55,1.,abs(u.x)/1.6))*(1.-smoothstep(.7,1.,(u.y+.1)/1.3))*smoothstep(-.1,.02,u.y);"+
      "float g=exp(-2.6*length(vec2(u.x*.7,(u.y-.28)*.9)))*ef;"+
      "vec3 c=col*a*1.15+c2*g*.13+c3*g*.09;"+
      "o=vec4(c*vK,0.);}";
    const v3=s=>s.split(",").map(v=>+v/255);
    function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
    function init(before){if(ok!==null)return ok;ok=false;
      try{cvF=document.createElement("canvas");cvF.id="fireGL";cvF.setAttribute("aria-hidden","true");
        gl=cvF.getContext("webgl2",{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false});if(!gl)return false;
        prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,VS));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FSH));gl.linkProgram(prog);
        if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog));
        ["uR","uT","c0","c1","c2","c3"].forEach(k=>U[k]=gl.getUniformLocation(prog,k));
        vao=gl.createVertexArray();gl.bindVertexArray(vao);
        const qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,0,1,0,-1,1,1,1]),gl.STATIC_DRAW);
        const lc=gl.getAttribLocation(prog,"aC");gl.enableVertexAttribArray(lc);gl.vertexAttribPointer(lc,2,gl.FLOAT,false,0,0);
        ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferData(gl.ARRAY_BUFFER,data.byteLength,gl.DYNAMIC_DRAW);
        const li=gl.getAttribLocation(prog,"aI"),lj=gl.getAttribLocation(prog,"aJ");
        gl.enableVertexAttribArray(li);gl.vertexAttribPointer(li,4,gl.FLOAT,false,24,0);gl.vertexAttribDivisor(li,1);
        gl.enableVertexAttribArray(lj);gl.vertexAttribPointer(lj,2,gl.FLOAT,false,24,16);gl.vertexAttribDivisor(lj,1);
        gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
        /* smoke program: same corner buffer, its own instance buffer */
        sp=gl.createProgram();gl.attachShader(sp,sh(gl.VERTEX_SHADER,SVS));gl.attachShader(sp,sh(gl.FRAGMENT_SHADER,SFS));gl.linkProgram(sp);
        if(!gl.getProgramParameter(sp,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(sp));["uR","uT","c2"].forEach(k=>SU[k]=gl.getUniformLocation(sp,k));
        svao=gl.createVertexArray();gl.bindVertexArray(svao);gl.bindBuffer(gl.ARRAY_BUFFER,qb);const sc=gl.getAttribLocation(sp,"aC");gl.enableVertexAttribArray(sc);gl.vertexAttribPointer(sc,2,gl.FLOAT,false,0,0);
        sib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,sib);gl.bufferData(gl.ARRAY_BUFFER,sdata.byteLength,gl.DYNAMIC_DRAW);
        const si=gl.getAttribLocation(sp,"aI"),sj=gl.getAttribLocation(sp,"aJ");
        gl.enableVertexAttribArray(si);gl.vertexAttribPointer(si,4,gl.FLOAT,false,24,0);gl.vertexAttribDivisor(si,1);
        gl.enableVertexAttribArray(sj);gl.vertexAttribPointer(sj,2,gl.FLOAT,false,24,16);gl.vertexAttribDivisor(sj,1);gl.bindVertexArray(null);
        before.parentNode.insertBefore(cvF,before);ok=true;}catch(e){console.warn("GPU fire unavailable, using the 2D fire",e);ok=false;}
      return ok;}
    function draw(TG,T,a,W,H,pal,rs,SK){if(!ok)return;rs=rs||.5;SK=SK||[];const n=Math.min(TG.length/5,1400),m=Math.min(SK.length/6,200);
      if(!n&&!m){if(drawn){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);drawn=false;}return;}
      const w=Math.max(1,Math.round(W*rs)),h=Math.max(1,Math.round(H*rs));if(cvF.width!==w||cvF.height!==h){cvF.width=w;cvF.height=h;}
      for(let i=0;i<n;i++){const j=i*5,k=i*6;data[k]=TG[j];data[k+1]=TG[j+1];data[k+2]=TG[j+3];data[k+3]=TG[j+2];data[k+4]=TG[j+4]%61;data[k+5]=a;}
      gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      if(m){for(let i=0;i<m*6;i++)sdata[i]=SK[i];gl.useProgram(sp);gl.bindVertexArray(svao);gl.bindBuffer(gl.ARRAY_BUFFER,sib);gl.bufferSubData(gl.ARRAY_BUFFER,0,sdata,0,m*6);
        gl.uniform2f(SU.uR,W,H);gl.uniform1f(SU.uT,T%600);gl.uniform3fv(SU.c2,v3(pal.f[2]));gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,m);gl.blendFunc(gl.ONE,gl.ONE);}
      gl.useProgram(prog);gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferSubData(gl.ARRAY_BUFFER,0,data,0,n*6);
      gl.uniform2f(U.uR,W,H);gl.uniform1f(U.uT,T%600);gl.uniform3fv(U.c0,v3(pal.f[0]));gl.uniform3fv(U.c1,v3(pal.f[1]));gl.uniform3fv(U.c2,v3(pal.f[2]));gl.uniform3fv(U.c3,v3(pal.f[3]));
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,n);drawn=true;}
    function clear(){if(ok&&drawn){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);drawn=false;}}
    return {init,draw,clear,get el(){return cvF;},get ok(){return ok;}};})();
  /* v18 particle fire (replaces the drawn tongues): every tongue(x,y,h,w) of a frame is an emitter. Particles are soft round sprites
     drawn additively; they rise with buoyancy, lick sideways in turbulence and are pulled back toward their flame's axis (so flames
     narrow upward), shrinking as they cool white-hot → yellow → orange → deep red → nothing. Overlapping sprites build the bright core
     by themselves. Dark smoke rises from the taller flames. Sprites are pre-rendered per palette (FS: 24 heat steps + smoke).
     Budget: at most 2600 flame and 260 smoke particles; emission is scaled down evenly when the budget is full. */
  const TG=[],FP=[],SM=[];let FS=null,FSp=null,FC=null,fx=null;
  /* the fire is drawn into a half-resolution buffer and scaled up: the soft upscale melts the particles into one glowing volume */
  function fireCanvas(){const w=Math.ceil(W/2),h=Math.ceil(H/2);if(!FC){FC=document.createElement("canvas");fx=FC.getContext("2d");}
    if(FC.width!==w||FC.height!==h){FC.width=w;FC.height=h;}return fx;}
  let FK=1;function tongue(x,y,h,w,ph){h*=FK;w*=.5+.5*FK;if(h>1.5)TG.push(x,y,h,w,ph);}
  /* v22 is it raining (chosen weather, or the live weather where the user is)? */
  function rainy(){try{const m=WX.mode,k=m==="live"?(WX.live&&WX.live.kind):m;return k==="rain"||k==="storm";}catch(e){return false;}}
  const SKS=[];function plume(x,y,w,h,seed,al){if(al>.02&&h>20&&SKS.length<1200)SKS.push(x,y,w,h,seed%61,al);}
  function fireSprites(){if(FS&&FSp===pal)return FS;FSp=pal;const mix=(a,b,u)=>a.split(",").map((v,i)=>Math.round(+v+(+b.split(",")[i]-v)*u)).join(",");
    const mk=(rgb,soft)=>{const c=document.createElement("canvas");c.width=c.height=64;const g=c.getContext("2d"),r=g.createRadialGradient(32,32,0,32,32,32);
      r.addColorStop(0,"rgba("+rgb+",1)");r.addColorStop(soft,"rgba("+rgb+",.42)");r.addColorStop(1,"rgba("+rgb+",0)");g.fillStyle=r;g.fillRect(0,0,64,64);return c;};
    FS={heat:[],smoke:mk("74,64,62",.2)};
    for(let i=0;i<24;i++){const u=1+i/23*3,k=Math.min(3,Math.floor(u));FS.heat.push(mk(mix(pal.f[k],pal.f[k+1],u-k),.3));}
    return FS;}
  function flushT(T,a,dt){const S=fireSprites(),gpu=GF.init(cv);
    /* emit: rate grows with flame width; flames taller than ~24 px also breathe out smoke */
    let E=0;for(let i=0;i<TG.length;i+=5)E+=(10+TG[i+3]*2.6)*dt;const room=Math.max(0,3200-FP.length),sc=E>room?room/E:1;
    for(let i=0;i<TG.length;i+=5){const x=TG[i],y=TG[i+1],h=TG[i+2],w=TG[i+3],ph=TG[i+4];let n=(10+w*2.6)*dt*sc;
      while(!gpu&&n>0){if(n<1&&Math.random()>n)break;n--;const L=R(.5,.9),up=h/L*R(.85,1.2);
        FP.push({x:x+R(-w,w)*.8,y:y+R(-2,2),ax:x,vx:R(-12,12),vy:-up*1.25,acc:up*1.9,t:0,L,s:Math.max(4,w*R(1.2,1.7)),ph:ph+R(0,6.28)});}
      if(!gpu&&h>24&&SM.length<260&&Math.random()<dt*(.35+w*.05))SM.push({x:x+R(-w,w)*.5,y:y-h*.85,vx:R(-8,8),vy:-R(28,48),t:0,L:R(1.8,2.8),s:w*R(1.1,1.6)+6});}
    if(gpu)GF.draw(TG,T,a,W,H,pal,lowQ?.34:.5,SKS);SKS.length=0;
    TG.length=0;
    /* smoke first (normal blending), then the fire on top (additive) */
    ctx.globalCompositeOperation="source-over";
    for(let i=SM.length-1;i>=0;i--){const p=SM[i];p.t+=dt;if(p.t>=p.L){SM[i]=SM[SM.length-1];SM.pop();continue;}const u=p.t/p.L;
      p.vx+=Math.sin(T*1.3+p.y*.01)*14*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const r=p.s*(1+u*2.6);
      ctx.globalAlpha=.2*Math.sin(Math.PI*Math.min(1,u*1.4))*a;ctx.drawImage(S.smoke,p.x-r,p.y-r,r*2,r*2);}
    if(gpu){ctx.globalAlpha=1;return;}
    const f=fireCanvas();f.setTransform(.5,0,0,.5,0,0);f.globalAlpha=1;f.clearRect(0,0,W,H);f.globalCompositeOperation="lighter";
    for(let i=FP.length-1;i>=0;i--){const p=FP[i];p.t+=dt;if(p.t>=p.L){FP[i]=FP[FP.length-1];FP.pop();continue;}const u=p.t/p.L;
      p.vy-=p.acc*dt;p.vy*=1-.5*dt;
      p.vx+=(Math.sin(T*8.5+p.y*.045+p.ph)*90+Math.sin(T*3.1+p.ph*2)*40)*dt+(p.ax-p.x)*5*dt;p.vx*=1-3*dt;
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      const r=p.s*(u<.15?.7+u*2:1.0-.55*(u-.15)/.85)*(.9+.2*Math.sin(T*23+p.ph)),hi=Math.min(23,Math.floor(Math.pow(u,1.25)*24));
      f.globalAlpha=Math.min(1,u*6)*(1-u*u)*.5*a;f.drawImage(S.heat[hi],p.x-r,p.y-r*1.3,r*2,r*2.6);}
    ctx.globalAlpha=1;ctx.globalCompositeOperation="lighter";ctx.imageSmoothingEnabled=true;ctx.drawImage(FC,0,0,W,H);}
  /* a soft fire-glow sprite (radial gradient drawn once per palette) */
  let GS=null,GSp=null;
  function glowSprite(){if(GS&&GSp===pal)return GS;GSp=pal;GS=document.createElement("canvas");GS.width=GS.height=64;const g=GS.getContext("2d"),r=g.createRadialGradient(32,32,0,32,32,32);
    r.addColorStop(0,"rgba("+pal.f[1]+",1)");r.addColorStop(.35,"rgba("+pal.g+",.55)");r.addColorStop(1,"rgba("+pal.g+",0)");g.fillStyle=r;g.fillRect(0,0,64,64);return GS;}
  /* the two big trees (TREE.fire): each point lights after a delay that grows with its height, so the fire climbs from the base */
  function treeFire(){const T=[];if(!window.TREE||!TREE.fire)return T;
    for(const side of ["R","L"]){const p=TREE.fire(side);if(!p.length)continue;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
      for(const q of p){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);}
      T.push({el:document.getElementById(side==="R"?"jungle":"jungleL"),x0,x1,y0,y1,t:null,
        pts:p.map(q=>({x:q[0],y:q[1],s:q[2],d:(y1-q[1])/Math.max(1,y1-y0)*2.4+R(0,.35),ph:R(0,6.28)}))});}
    return T;}
  function inferno(dt,T){const h=hs,r=run;if(!h||hz<=.01){GF.clear();return;}
    /* rain: the fire struggles (60% height), road fires die sooner, steam rises and it hisses now and then */
    if(h.wet==null)h.wet=rainy();FK+=((h.wet?.6:1)-FK)*Math.min(1,dt*2);
    if(h.wet){if(Math.random()<dt*.5)SFX.hiss(.6);for(const q of h.road||[])if(q.t>.3)q.t+=dt*.35;}const a=Math.min(1,hz*1.4);
    if(!h.road){h.road=[];h.trees=treeFire();h.gone=0;}
    if(!r)h.gone+=dt;const out=Math.max(0,1-h.gone/1.6);
    ctx.globalCompositeOperation="lighter";
    /* 1. the road: a burn spot every ~20 px behind the wheels or hooves; flames roar ~3 s, then a lava crack is left */
    if(r&&(r.mode==="bike"||r.mode==="horse")){const bx=r.x-r.dir*(r.mode==="bike"?44:58)*r.s;
      /* v19.1 a natural fire front, not a comb: irregular gaps, widths and heights under a slow wave envelope, the odd big flare */
      if(h.e1==null){h.e1=R(0,6.28);h.e2=R(0,6.28);h.gap=20;}
      if(h.rx==null||h.rm!==r.mode||Math.abs(bx-h.rx)>h.gap*r.s){h.rx=bx;h.rm=r.mode;h.gap=R(14,46);
        const env=.55+.3*Math.sin(bx*.009+h.e1)+.2*Math.sin(bx*.027+h.e2),fl=Math.random()<.12?R(1.4,1.9):1;
        if(bx>-40&&bx<W+40)h.road.push({x:bx,t:0,s:r.s*R(.85,1.2),ph:R(0,6.28),jy:R(-3,3),hv:Math.max(.3,env*R(.7,1.3)*fl),wv:R(.6,1.7),h2:R(.4,1.2),o:R(-14,14)});}}
    const gy=H-9,RD=h.road;let mn=1e9,mx=-1e9;
    ctx.strokeStyle="rgba("+pal.f[3]+","+(.6*a*out*(.8+.2*Math.sin(T*3))).toFixed(3)+")";ctx.lineWidth=2.4;ctx.lineJoin="round";ctx.beginPath();
    for(let i=0;i<RD.length;i++){const q=RD[i];q.t+=dt;if(q.t<.25)continue;const p=RD[i-1];
      if(p&&p.t>=.25&&Math.abs(p.x-q.x)<40*q.s)ctx.lineTo(q.x,gy+q.jy);else ctx.moveTo(q.x,gy+q.jy);}
    ctx.stroke();
    for(const q of RD){const k=(q.t<.3?q.t/.3:q.t<3.4?1:Math.max(0,1-(q.t-3.4)/1.4))*out;if(k<=0)continue;mn=Math.min(mn,q.x);mx=Math.max(mx,q.x);
      const age=q.t<.3?1.15:1-.4*Math.min(1,(q.t-.3)/3.1);if(!lowQ&&RD.indexOf(q)%6===0)plume(q.x,gy-55*q.s,180*q.s,330*q.s,q.x,.55*k*a);
      tongue(q.x,gy+q.jy,95*q.s*k*q.hv*age,24*q.s*k*q.wv,q.ph);if(!lowQ&&q.h2>.85)tongue(q.x+q.o*q.s,gy+q.jy,55*q.s*k*q.h2*age,14*q.s*k*q.wv,q.ph+2);
      if(Math.random()<.04*k)emit("e",q.x,gy-20*q.s,1,()=>({vx:R(-40,40),vy:R(-200,-90),r:R(1,2),l:R(.8,1.6)}));
}
    /* firelight on the ground: soft glow pools under every few burning spots (no hard edges) */
    if(mx>mn){const gs=glowSprite();RD.forEach((q,i)=>{if(i%3)return;const k=(q.t<.3?q.t/.3:q.t<3.4?1:Math.max(0,1-(q.t-3.4)/1.4))*out;if(k<=0)return;
      ctx.globalAlpha=.3*k*a;ctx.drawImage(gs,q.x-110*q.s*1.6,gy-150*q.s*1.6,220*q.s*1.6,220*q.s*1.6);});ctx.globalAlpha=1;}
    /* 2. coffins he passes burst into flame: tongues up both sides and over the top, a glow, sparks */
    for(const c of h.cof){if(c.px==null)continue;
      if(c.burn==null&&r&&h.t-c.at>.35&&Math.abs(r.x-c.x)<60*h.s+20){c.burn=0;SFX.whoosh();const cy=c.py-c.hh*.5;
        emit("f",c.px,cy,24,()=>({vx:R(-160,160),vy:R(-260,-60),r:R(4,9),l:R(.3,.6)}));emit("e",c.px,cy,18,()=>({vx:R(-220,220),vy:R(-300,-80),r:R(1,2.2),l:R(.6,1.3)}));}
      if(c.burn==null||c.ex)continue;c.burn+=dt;const k=Math.min(1,c.burn/.6)*out,cs=Math.cos(c.tl),sn=Math.sin(c.tl),Pt=(lx,ly)=>[c.px+lx*cs-ly*sn,c.py+lx*sn+ly*cs];
      const cx=Pt(0,-c.hh*.5),gg=ctx.createRadialGradient(cx[0],cx[1],0,cx[0],cx[1],c.hh*1.4);gg.addColorStop(0,"rgba("+pal.g+","+(.35*a*k).toFixed(3)+")");gg.addColorStop(1,"rgba("+pal.g+",0)");
      ctx.fillStyle=gg;ctx.fillRect(cx[0]-c.hh*1.4,cx[1]-c.hh*1.4,c.hh*2.8,c.hh*2.8);
      for(let i=0;i<4;i++){const v=-.12-.22*i;for(const sd of [-1,1]){const [x,y]=Pt(sd*c.w*(.38+.12*Math.min(1,-v/.68)),c.hh*v);tongue(x,y,c.hh*.6*k,c.w*.3*k,i*1.3+sd+c.x);}}
      for(let i=0;i<3;i++){const [x,y]=Pt((i-1)*c.w*.26,-c.hh);tongue(x,y+3,c.hh*.85*k,c.w*.36*k,i*2.1+c.x);}
      if(Math.random()<.25*k)emit("e",cx[0]+R(-c.w*.4,c.w*.4),cx[1]-c.hh*.4,1,()=>({vx:R(-60,60),vy:R(-240,-110),r:R(1,2),l:R(.8,1.5)}));
      if(Math.random()<.05*k)emit("m",cx[0],cx[1]-c.hh*.8,1,()=>({vx:R(-20,20),vy:R(-70,-30),r:R(12,20),l:R(1.8,2.8)}));
      plume(cx[0],cx[1]-c.hh*.9,c.hh*1.7,c.hh*4.2,c.x,.85*k*a*Math.min(1,c.burn/1.5));}
    /* 3. the graveyard's dead trees light up at the branch tips as he passes */
    const gl=H-17*h.s-12;
    for(const g of h.G){if(g.k!=="tree")continue;
      if(g.bt==null&&r&&Math.abs(r.x-g.S[0][0])<55){g.bt=0;const S0=g.S[0];
        g.fp=g.S.filter(s=>s[4]<3.2).slice(0,8).map(s=>[s[2],s[3],R(0,6.28),R(0,.7)]).concat([[(S0[0]+S0[2])/2,(S0[1]+S0[3])/2,R(0,6.28),0]]);}
      if(g.bt==null)continue;g.bt+=dt;
      for(const [x,y,ph,d] of g.fp){const k=Math.max(0,Math.min(1,(g.bt-d)/.5))*out;tongue(x,gl+y+4,36*k,10*k,ph);}
      const S0=g.S[0];plume(S0[0],gl-70,90,200,S0[0],.6*a*out*Math.min(1,g.bt/2));}
    /* 4. the big trees: lit as he passes, the fire climbs from the trunk to the crown; leaves turn ember-orange (CSS .burning) */
    for(const t of h.trees){
      if(t.t==null&&r&&r.x>t.x0-60&&r.x<t.x1+60){t.t=0;SFX.whoosh();shake(.25);}
      if(t.t==null)continue;t.t+=dt;if(t.el&&t.t>1.1&&out>0)t.el.classList.add("burning");
      let cx=0,cy=0,n=0;const gs=glowSprite();
      for(const [pi,p] of t.pts.entries()){if(lowQ&&pi%2||p.ex)continue;if(h.wet&&Math.random()<dt*.15)steam(p.x,p.y-p.s,1);const k=Math.max(0,Math.min(1,(t.t-p.d)/.6))*out;if(k<=0)continue;cx+=p.x;cy+=p.y;n++;
        /* a blaze, not a candle: a glow lights the limb and three tongues of different heights lick upwards */
        const gr=p.s*6*k;ctx.globalAlpha=.42*a*(.85+.15*Math.sin(T*11+p.ph));ctx.drawImage(gs,p.x-gr,p.y-gr*1.15,gr*2,gr*2);ctx.globalAlpha=1;
        tongue(p.x,p.y+p.s*.6,p.s*7*k*(.8+.4*Math.abs(Math.sin(p.ph))),p.s*2.1*k,p.ph);
        if(Math.random()<.02*k)emit("e",p.x,p.y-p.s,1,()=>({vx:R(-50,50),vy:R(-220,-100),r:R(1,2.2),l:R(1,2)}));
}
      if(n){const wd=t.x1-t.x0,sa=a*out*Math.min(1,t.t/2.5),top=Math.max(80,t.y0+30);
        plume(t.x0+wd*.3,top,wd*.95,Math.min(top+60,460),t.x0,sa);plume(t.x0+wd*.72,top+30,wd*.8,Math.min(top+40,420),t.x0+9,sa*.9);
        plume((t.x0+t.x1)/2,cy/n,wd*.7,300,t.x0+21,sa*.7);}
      if(n){cx/=n;cy/=n;const rr=Math.max(t.x1-t.x0,t.y1-t.y0)*.7+80,gg=ctx.createRadialGradient(cx,cy,0,cx,cy,rr);
        gg.addColorStop(0,"rgba("+pal.g+","+(.3*a*out*Math.min(1,t.t/2)).toFixed(3)+")");gg.addColorStop(1,"rgba("+pal.g+",0)");ctx.fillStyle=gg;ctx.fillRect(cx-rr,cy-rr,rr*2,rr*2);}
      if(out<=0&&t.el){t.el.classList.remove("burning");t.el=null;}}
    const fa=Math.min(1,TG.length/5/90);if(fa>.02){ctx.globalCompositeOperation="lighter";
      ctx.fillStyle="rgba("+pal.g+","+(.045*fa*a*(.7+.3*Math.sin(T*13.1)*Math.sin(T*7.7))).toFixed(3)+")";ctx.fillRect(0,0,W,H);}
    flushT(T,a,dt);ctx.globalCompositeOperation="source-over";}
  /* v19 sprites drawn once: the moon (limb darkening, soft grey maria, speckled craters) and three moonlit cloud banks (soft dark
     puffs whose tops catch the moonlight) */
  let MS=null;const CS=[];
  function moonSprite(){if(MS)return MS;const c=document.createElement("canvas");c.width=c.height=256;const g=c.getContext("2d"),o=128,r=100;
    const gr=g.createRadialGradient(o-20,o-24,8,o,o,r);gr.addColorStop(0,"#f6f8fc");gr.addColorStop(.72,"#e1e6ef");gr.addColorStop(1,"#aeb6c8");g.fillStyle=gr;g.beginPath();g.arc(o,o,r,0,6.2832);g.fill();
    g.save();g.beginPath();g.arc(o,o,r,0,6.2832);g.clip();
    for(const [x,y,rr] of [[-30,-24,40],[22,-36,26],[36,8,32],[-8,26,24],[-46,14,18],[12,52,16],[-20,-58,14]]){const m=g.createRadialGradient(o+x,o+y,0,o+x,o+y,rr);
      m.addColorStop(0,"rgba(118,126,148,.5)");m.addColorStop(.65,"rgba(128,136,158,.28)");m.addColorStop(1,"rgba(140,148,168,0)");g.fillStyle=m;g.fillRect(o+x-rr,o+y-rr,rr*2,rr*2);}
    let sd=7;const rn=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
    for(let i=0;i<150;i++){const an=rn()*6.2832,d=Math.sqrt(rn())*r*.96,x=o+Math.cos(an)*d,y=o+Math.sin(an)*d,cr=rn()*3.2+.4;
      g.fillStyle="rgba(96,104,126,"+(rn()*.28).toFixed(3)+")";g.beginPath();g.arc(x,y,cr,0,6.2832);g.fill();g.fillStyle="rgba(255,255,255,"+(rn()*.18).toFixed(3)+")";g.beginPath();g.arc(x-cr*.35,y-cr*.35,cr*.55,0,6.2832);g.fill();}
    const lg=g.createRadialGradient(o,o,r*.55,o,o,r);lg.addColorStop(0,"rgba(4,8,30,0)");lg.addColorStop(1,"rgba(8,12,40,.4)");g.fillStyle=lg;g.fillRect(0,0,256,256);g.restore();return MS=c;}
  function cloudSprite(k){if(CS[k])return CS[k];const c=document.createElement("canvas");c.width=400;c.height=120;const g=c.getContext("2d");let sd=31+k*17;const rn=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
    const P=[];for(let i=0;i<16;i++){const u=i/15;P.push([30+u*340+rn()*20,62+Math.sin(u*3.14)*-14+rn()*16,18+Math.sin(u*3.14)*26+rn()*12]);}
    for(const [x,y,r] of P){const d=g.createRadialGradient(x,y,0,x,y,r);d.addColorStop(0,"rgba(14,16,34,.95)");d.addColorStop(.6,"rgba(18,20,40,.7)");d.addColorStop(1,"rgba(20,22,44,0)");g.fillStyle=d;g.fillRect(x-r,y-r,r*2,r*2);}
    for(const [x,y,r] of P){const d=g.createRadialGradient(x,y-r*.55,0,x,y-r*.55,r*.7);d.addColorStop(0,"rgba(170,182,220,.22)");d.addColorStop(1,"rgba(170,182,220,0)");g.fillStyle=d;g.fillRect(x-r,y-r*1.3,r*2,r*1.5);}
    return CS[k]=c;}
  /* a bat silhouette: head with ears, body, and two membrane wings scalloped between the finger bones; f (-1..1) flaps them */
  function batShape(x,y,s,f){const wy=-f*s*1.15;ctx.beginPath();ctx.moveTo(x-.22*s,y-.2*s);
    for(const sd of [-1,1]){if(sd>0){ctx.moveTo(x+.22*s,y-.2*s);}const X=v=>x+sd*v*s;
      ctx.quadraticCurveTo(X(1.2),y-.55*s+wy*.6,X(2.55),y+wy);ctx.quadraticCurveTo(X(2.15),y+.1*s+wy*.55,X(1.9),y+.38*s+wy*.45);
      ctx.quadraticCurveTo(X(1.6),y+.12*s+wy*.32,X(1.3),y+.46*s+wy*.25);ctx.quadraticCurveTo(X(1),y+.22*s+wy*.15,X(.66),y+.52*s);
      ctx.quadraticCurveTo(X(.45),y+.32*s,X(.18),y+.38*s);ctx.lineTo(x,y+.62*s);ctx.lineTo(X(.18),y+.38*s);ctx.lineTo(X(.22),y-.2*s);}
    ctx.moveTo(x-.2*s,y-.22*s);ctx.lineTo(x-.2*s,y-.62*s);ctx.lineTo(x-.07*s,y-.4*s);ctx.lineTo(x+.07*s,y-.4*s);ctx.lineTo(x+.2*s,y-.62*s);ctx.lineTo(x+.2*s,y-.22*s);ctx.closePath();ctx.fill();}
  /* a lightning bolt: midpoint displacement from a cloud to low in the sky, plus 2–3 thinner forks */
  function mkBolt(){const jag=(x0,y0,x1,y1,d,o)=>{if(d<=0)return [[x0,y0],[x1,y1]];const mx=(x0+x1)/2+R(-o,o),my=(y0+y1)/2+R(-o*.3,o*.3);
      const A=jag(x0,y0,mx,my,d-1,o*.55),B=jag(mx,my,x1,y1,d-1,o*.55);return A.concat(B.slice(1));};
    const x0=R(W*.15,W*.85),y0=R(-10,H*.08),x1=x0+R(-220,220),y1=R(H*.42,H*.7),main=jag(x0,y0,x1,y1,7,90),lines=[[main,1]];
    for(let i=0;i<3;i++){const p=main[Math.floor(R(.2,.7)*main.length)],an=Math.atan2(y1-y0,x1-x0)+R(-.9,.9),l=R(80,200);lines.push([jag(p[0],p[1],p[0]+Math.cos(an)*l,p[1]+Math.sin(an)*l,5,40),.55]);}
    return {t:0,lines};}
  /* v22 holy water + steam */
  const HW=[],STM=[],RINGS=[];let STS=null;
  function steamSprite(){if(STS)return STS;STS=document.createElement("canvas");STS.width=STS.height=64;const g=STS.getContext("2d"),r=g.createRadialGradient(32,32,0,32,32,32);
    r.addColorStop(0,"rgba(232,238,246,.9)");r.addColorStop(.45,"rgba(220,228,240,.35)");r.addColorStop(1,"rgba(220,228,240,0)");g.fillStyle=r;g.fillRect(0,0,64,64);return STS;}
  function steam(x,y,n){for(let i=0;i<n;i++)if(STM.length<240)STM.push({x:x+R(-10,10),y:y+R(-6,6),vx:R(-18,18),vy:-R(40,90),t:0,l:R(1.2,2.2),r:R(10,20)});}
  function splash(x,y){if(!run||!hs||hz<.3)return;SFX.splash();RINGS.push({x,y,t:0});
    for(let i=0;i<46;i++){const an=R(0,6.2832),sp=R(120,520);HW.push({x,y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp-R(80,220),t:0,l:R(.5,1),r:R(1.2,3)});}
    const h=hs,gy=H-9,d2=(ax,ay)=>Math.hypot(ax-x,ay-y);let put=0;
    for(const q of h.road||[])if(q.t<3.4&&Math.abs(q.x-x)<95&&y>gy-170){q.t=3.4;put++;steam(q.x,gy-20,3);}
    for(const t of h.trees||[])for(const p of t.pts)if(!p.ex&&d2(p.x,p.y)<90){p.ex=1;put++;steam(p.x,p.y-p.s,2);}
    for(const c of h.cof)if(c.burn!=null&&!c.ex&&c.px!=null&&d2(c.px,c.py-c.hh*.5)<c.hh+40){c.ex=1;put++;steam(c.px,c.py-c.hh*.6,8);}
    for(const g of h.G)if(g.bt!=null&&!g.ex&&Math.abs(g.S[0][0]-x)<70&&y>H*.6){g.ex=1;put++;steam(g.S[0][0],H-60,5);}
    if(put)SFX.hiss(Math.min(1.4,.5+put*.12));
    for(const g of [...h.ghosts,...h.run]){if(g.dead||g.cy==null)continue;const dx=g.x-x,dy=g.cy-y,dd=Math.hypot(dx,dy);
      if(dd<55){g.dead=true;g.dt=0;SFX.wail();}else if(dd<170){const k=(170-dd)/170*700/(dd||1);g.vx=(g.vx||0)+dx*k;if(g.vy!=null)g.vy+=dy*k;g.mouth=1;g.arms=1.3;}}}
  addEventListener("pointerdown",e=>{if(e.button===0&&run)splash(e.clientX,e.clientY);},{passive:true,capture:true});
  function water(dt){if(!HW.length&&!STM.length&&!RINGS.length)return;
    ctx.globalCompositeOperation="source-over";const sp=steamSprite();
    for(let i=STM.length-1;i>=0;i--){const p=STM[i];p.t+=dt;if(p.t>=p.l){STM.splice(i,1);continue;}const u=p.t/p.l;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=1-dt;
      const r=p.r*(1+u*2.4);ctx.globalAlpha=.45*Math.sin(Math.PI*Math.min(1,u*1.3));ctx.drawImage(sp,p.x-r,p.y-r,r*2,r*2);}
    ctx.globalAlpha=1;ctx.globalCompositeOperation="lighter";
    for(let i=RINGS.length-1;i>=0;i--){const g=RINGS[i];g.t+=dt;if(g.t>.5){RINGS.splice(i,1);continue;}const u=g.t/.5;
      ctx.strokeStyle="rgba(170,215,255,"+(.7*(1-u)).toFixed(3)+")";ctx.lineWidth=3*(1-u)+.5;ctx.beginPath();ctx.ellipse(g.x,g.y,20+u*120,12+u*70,0,0,6.2832);ctx.stroke();}
    ctx.lineCap="round";
    for(let i=HW.length-1;i>=0;i--){const p=HW[i];p.t+=dt;if(p.t>=p.l){HW.splice(i,1);continue;}p.vy+=700*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const u=p.t/p.l;
      ctx.strokeStyle="rgba(190,225,255,"+(.85*(1-u)).toFixed(3)+")";ctx.lineWidth=p.r;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.02,p.y-p.vy*.02);ctx.stroke();}
    ctx.globalCompositeOperation="source-over";}
  function hauntDraw(dt,T){const a=hz,h=hs;if(!h||a<=.01)return;
    const fk=.93+.07*Math.sin(T*23)*Math.sin(T*7.3);
    /* v19 grade: cool blue-black night, darker overhead, a faint warm horizon where the fires burn, heavy cinematic vignette */
    const sk=ctx.createLinearGradient(0,0,0,H);sk.addColorStop(0,"rgba(2,4,12,"+(.84*a*fk).toFixed(3)+")");sk.addColorStop(.55,"rgba(6,10,24,"+(.7*a*fk).toFixed(3)+")");
    sk.addColorStop(.86,"rgba(14,14,26,"+(.66*a*fk).toFixed(3)+")");sk.addColorStop(1,"rgba(34,16,12,"+(.7*a*fk).toFixed(3)+")");ctx.fillStyle=sk;ctx.fillRect(0,0,W,H);
    const vg=ctx.createRadialGradient(W/2,H*.48,Math.min(W,H)*.3,W/2,H*.48,Math.max(W,H)*.7);vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,4,"+(.78*a).toFixed(3)+")");ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    /* lightning: a double flash every few seconds */
    h.ln-=dt;if(h.ln<=0){h.fl=1;h.ln=R(4,9);h.bolt=mkBolt();setTimeout(()=>SFX.thunder(.55),250);setTimeout(()=>{if(hs)hs.fl=Math.max(hs.fl,.75);},160);}
    if(h.fl>0){ctx.fillStyle="rgba(200,215,255,"+(.2*h.fl*a).toFixed(3)+")";ctx.fillRect(0,0,W,H);h.fl=Math.max(0,h.fl-dt*3.2);}
    if(h.bolt){const b=h.bolt;b.t+=dt;if(b.t>.42)h.bolt=null;else{const v=b.t<.07?1:b.t<.11?.15:b.t<.2?1:1-(b.t-.2)/.22,al=v*a;
      ctx.globalCompositeOperation="lighter";ctx.lineJoin="round";ctx.lineCap="round";
      for(const [L,k] of b.lines)for(const [lw,c,o] of [[16*k,"150,160,255",.1],[6*k,"185,195,255",.42],[2*k,"255,255,255",.95]]){
        ctx.strokeStyle="rgba("+c+","+(o*al).toFixed(3)+")";ctx.lineWidth=lw;ctx.beginPath();L.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
      ctx.globalCompositeOperation="source-over";}}
    /* v19 moon: wide atmospheric halo, tight corona, then the pre-rendered disc (limb darkening, soft maria, craters) */
    const [mx,my]=h.moon;
    for(const [rr,al,c] of [[420,.16,"150,175,255"],[150,.3,"190,210,255"],[62,.55,"230,238,255"]]){const mg=ctx.createRadialGradient(mx,my,0,mx,my,rr);
      mg.addColorStop(0,"rgba("+c+","+(al*a).toFixed(3)+")");mg.addColorStop(1,"rgba("+c+",0)");ctx.fillStyle=mg;ctx.fillRect(mx-rr,my-rr,rr*2,rr*2);}
    ctx.globalAlpha=a;ctx.drawImage(moonSprite(),mx-56,my-56,112,112);ctx.globalAlpha=1;
    wolfTick(h,dt,a,true);
    for(const [i,w] of h.wisps.entries()){w.dx+=w.v*dt;if(w.dx>260)w.dx=-260;const cs=cloudSprite(i%3),cw=w.w*3.2,ch=cw*.3;ctx.globalAlpha=.92*a;ctx.drawImage(cs,mx+w.dx-cw/2,my+w.dy-ch/2,cw,ch);}ctx.globalAlpha=1;
    ctx.fillStyle="rgba(4,2,8,"+a.toFixed(3)+")";
    for(const b of h.bats){
      /* shot ones tumble down, then a new one flies in from an edge */
      if(b.dead){b.vy+=700*dt;b.sy+=b.vy*dt;b.sx+=b.v*.3*dt;b.rot+=dt*9;if(b.sy>H+40){b.dead=false;b.x=b.v>0?-40:W+40;b.y=R(H*.06,H*.5);}
        else{ctx.save();ctx.translate(b.sx,b.sy);ctx.rotate(b.rot);ctx.beginPath();ctx.ellipse(0,0,b.s*7,b.s*3,0,0,6.2832);ctx.fill();ctx.restore();continue;}}
      b.x+=b.v*dt;if(b.x>W+40)b.x=-40;if(b.x<-40)b.x=W+40;const y=b.y+Math.sin(T*1.6+b.b)*14,f=Math.sin(T*(b.k==="crow"?9:16)+b.ph),s=b.s*9;b.sx=b.x;b.sy=y;
      if(b.k==="crow"){const d=b.v>0?1:-1;ctx.save();ctx.translate(b.x,y);ctx.scale(d,1);ctx.beginPath();ctx.ellipse(0,0,s*.9,s*.28,0,0,6.2832);ctx.moveTo(s*.8,-s*.05);ctx.arc(s*.85,-s*.12,s*.2,0,6.2832);
        ctx.moveTo(s*1.02,-s*.16);ctx.lineTo(s*1.3,-s*.1);ctx.lineTo(s*1.02,-s*.04);ctx.moveTo(-s*.8,0);ctx.lineTo(-s*1.3,-s*.18);ctx.lineTo(-s*1.25,s*.16);ctx.closePath();
        ctx.moveTo(-s*.2,-s*.1);ctx.quadraticCurveTo(-s*.5,-s*1.3*f,-s*1.1,-s*1.4*f);ctx.quadraticCurveTo(-s*.4,-s*.6*f,s*.3,-s*.05);ctx.fill();ctx.restore();continue;}
      batShape(b.x,y,s*.85,f);}
    ctx.strokeStyle="rgba(215,215,235,"+(.22*a).toFixed(3)+")";ctx.lineWidth=.8;web(0,0,1);web(W,0,-1);
    const gl=H-17*h.s-12;ctx.lineCap="round";
    /* far line of dead trees, lighter, behind the graveyard */
    /* far row: fogged blue-grey silhouettes, then a fog band that separates them from the near graveyard */
    ctx.strokeStyle="rgba(40,46,66,"+(.85*a).toFixed(3)+")";for(const S of h.F)for(const [x0,y0,x1,y1,w,qx,qy] of S){ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,gl+y0);ctx.quadraticCurveTo(qx,gl+qy,x1,gl+y1);ctx.stroke();}
    const fb=ctx.createLinearGradient(0,gl-90,0,gl+4);fb.addColorStop(0,"rgba(90,104,132,0)");fb.addColorStop(1,"rgba(90,104,132,"+(.22*a).toFixed(3)+")");ctx.fillStyle=fb;ctx.fillRect(0,gl-90,W,94);
    const sil="rgba(9,5,16,"+a.toFixed(3)+")";ctx.fillStyle=sil;ctx.strokeStyle=sil;
    ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W+20;x+=20)ctx.lineTo(x,gl+2+Math.sin(x*.013)*3+Math.sin(x*.041)*1.5);ctx.lineTo(W,H);ctx.closePath();ctx.fill();
    for(const g of h.G){
      if(g.k==="grave"){ctx.save();ctx.translate(g.x,gl+3);ctx.rotate(g.tl);
        if(g.c){ctx.fillRect(-2,-g.h-6,4,g.h+6);ctx.fillRect(-g.w*.45,-g.h+2,g.w*.9,4);}
        else{ctx.beginPath();ctx.moveTo(-g.w/2,0);ctx.lineTo(-g.w/2,-g.h+g.w/2);ctx.arc(0,-g.h+g.w/2,g.w/2,Math.PI,0);ctx.lineTo(g.w/2,0);ctx.fill();}
        ctx.restore();}
      else if(g.k==="tree")for(const [x0,y0,x1,y1,w,qx,qy] of g.S){ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,gl+y0);ctx.quadraticCurveTo(qx,gl+qy,x1,gl+y1);ctx.stroke();}
      else{ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(g.x,gl-14);ctx.lineTo(g.x+g.w,gl-14);ctx.moveTo(g.x,gl-6);ctx.lineTo(g.x+g.w,gl-6);
        for(let x=g.x;x<=g.x+g.w;x+=7){ctx.moveTo(x,gl+2);ctx.lineTo(x,gl-20);}ctx.stroke();
        for(let x=g.x;x<=g.x+g.w;x+=7){ctx.beginPath();ctx.moveTo(x-2,gl-19);ctx.lineTo(x,gl-24);ctx.lineTo(x+2,gl-19);ctx.fill();}}}
    /* coffins: one by one they heave up out of the ground, shaking and throwing dirt; the lid creaks open on its hinge (green glow
       inside) and one or two ghosts burst out */
    h.t+=dt;ctx.save();ctx.beginPath();ctx.rect(0,0,W,gl+5);ctx.clip();
    for(const c of h.cof){const tt=h.t-c.at;if(tt<0)continue;const k=c.k*h.s,hh=90*k,w=36*k;
      const up=Math.min(1,tt/.55),e=1-Math.pow(1-up,3),sh=up<1?Math.sin(tt*70)*1.6:0,op=Math.max(0,Math.min(1,(tt-.55)/.35)),oe=op*op*(3-2*op);
      if(!c.cr&&tt>.5){c.cr=true;SFX.creak();}
      if(!c.done&&tt>.75){c.done=true;const n=Math.random()<.45?2:1;
        for(let i=0;i<n;i++)h.run.push({x:c.x,by:gl-hh*.55,t:-i*.35,vx:c.dir*(i?-1:1)*R(240,380),ph:R(0,6.28),s:R(.9,1.25)*h.s,tr:[]});SFX.wail();}
      if(up<1&&Math.random()<.6)emit("m",c.x+R(-w*.6,w*.6),gl,1,()=>({vx:R(-30,30),vy:R(-70,-25),r:R(3,7),l:R(.5,1)}));
      c.px=c.x+sh;c.py=gl+4+hh*(1-e)*.92;c.hh=hh;c.w=w;
      ctx.save();ctx.translate(c.x+sh,gl+4+hh*(1-e)*.92);ctx.rotate(c.tl);
      const P6=[[-w*.36,0],[-w*.5,-hh*.68],[-w*.3,-hh],[w*.3,-hh],[w*.5,-hh*.68],[w*.36,0]];
      const poly=()=>{ctx.beginPath();P6.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();};
      poly();ctx.fillStyle="rgba(30,18,12,"+a.toFixed(3)+")";ctx.fill();
      if(oe>0){ctx.save();poly();ctx.clip();ctx.fillStyle="rgba(4,2,4,"+a.toFixed(3)+")";ctx.fillRect(-w,-hh,2*w,hh);
        const gg=ctx.createRadialGradient(0,-hh*.5,0,0,-hh*.5,hh*.7);gg.addColorStop(0,"rgba(150,255,170,"+(.55*oe*a).toFixed(3)+")");gg.addColorStop(1,"rgba(150,255,170,0)");
        ctx.fillStyle=gg;ctx.fillRect(-w,-hh,2*w,hh);ctx.restore();}
      ctx.strokeStyle="rgba(110,72,44,"+(.9*a).toFixed(3)+")";ctx.lineWidth=1.6;poly();ctx.stroke();
      const sx=1-1.35*oe;ctx.save();ctx.translate(-w*.5,0);ctx.scale(sx,1);ctx.translate(w*.5,0);
      poly();ctx.fillStyle="rgba("+(sx<0?"22,13,9":"52,32,21")+","+a.toFixed(3)+")";ctx.fill();ctx.stroke();
      if(sx>0){ctx.save();poly();ctx.clip();ctx.strokeStyle="rgba(10,5,3,"+(.55*a).toFixed(3)+")";ctx.lineWidth=1.1;ctx.beginPath();
        for(const u of [-.17,.17]){ctx.moveTo(u*w,-hh);ctx.lineTo(u*w*1.15,0);}ctx.stroke();
        ctx.strokeStyle="rgba(150,165,200,"+(.35*a).toFixed(3)+")";ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-w*.47,-hh*.68);ctx.lineTo(-w*.3,-hh+1);ctx.lineTo(w*.28,-hh+1);ctx.stroke();
        ctx.fillStyle="rgba(170,160,140,"+(.7*a).toFixed(3)+")";for(const [nx,ny] of [[-.36,-.9],[.36,-.9],[-.4,-.12],[.4,-.12]]){ctx.beginPath();ctx.arc(nx*w,ny*hh,1.1,0,6.2832);ctx.fill();}
        ctx.restore();}
      if(sx>0){ctx.strokeStyle="rgba(210,200,180,"+(.55*a).toFixed(3)+")";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-hh*.82);ctx.lineTo(0,-hh*.35);ctx.moveTo(-w*.17,-hh*.68);ctx.lineTo(w*.17,-hh*.68);ctx.stroke();}
      ctx.restore();
      /* v16: once the rider sets it alight the wood chars black and its edges glow like embers */
      if(c.burn!=null){const ch=Math.min(1,c.burn/2.2);poly();ctx.fillStyle="rgba(8,4,2,"+(.72*ch*a).toFixed(3)+")";ctx.fill();
        ctx.strokeStyle="rgba("+pal.f[2]+","+((.45+.35*Math.sin(T*7+c.x))*a*Math.min(1,c.burn/.5)).toFixed(3)+")";ctx.lineWidth=2.4;ctx.stroke();}
      ctx.restore();}
    ctx.restore();
    /* red eyes blinking in the dark */
    for(const e of h.eyes){if(Math.sin(T*.9+e.ph)>.82)continue;const c=e.r?"255,40,30":"170,255,90";ctx.save();ctx.shadowColor="rgba("+c+",.9)";ctx.shadowBlur=8;ctx.fillStyle="rgba("+c+","+(.9*a).toFixed(3)+")";
      ctx.beginPath();ctx.ellipse(e.x-4,gl+e.dy,2.2,1.3,.15,0,6.2832);ctx.ellipse(e.x+4,gl+e.dy,2.2,1.3,-.15,0,6.2832);ctx.fill();ctx.restore();}
    /* v17: the roaming ghosts */
    roam(h,dt,a);
    /* ghosts escaping the coffins: they rise, lean forward and race across the graveyard, arms reaching, with a misty trail */
    h.run=h.run.filter(g=>g.x>-140&&g.x<W+140&&!(g.dead&&g.dt>1.1));
    for(const g of h.run){
      if(g.dead){g.dt+=dt;const k=g.dt/1.1,R0=g.s*16*(1+k*3.2);for(let j=0;j<3;j++){const rr=R0*(.55+j*.3);const gg=ctx.createRadialGradient(g.x,g.cy,rr*.2,g.x,g.cy,rr);
          gg.addColorStop(0,"rgba(160,255,190,"+(.45*(1-k)*a).toFixed(3)+")");gg.addColorStop(1,"rgba(120,255,170,0)");ctx.fillStyle=gg;ctx.beginPath();ctx.arc(g.x+(j-1)*R0*.3,g.cy-j*R0*.2,rr,0,6.2832);ctx.fill();}continue;}
      g.t+=dt;if(g.t<0)continue;const s=g.s*16,rise=Math.min(1,g.t/.5),d=Math.sign(g.vx)||1,sp=Math.min(1,Math.max(0,g.t-.45)*2.2);
      g.x+=g.vx*sp*dt;const y=g.by-rise*s*2.2+Math.sin(g.t*9+g.ph)*s*.18;g.cy=y+s*.4;g.tr.push([g.x,y]);if(g.tr.length>14)g.tr.shift();
      const al=a*Math.min(1,g.t*3)*.72;
      g.tr.forEach(([tx,ty],i)=>{const q=i/g.tr.length;ctx.fillStyle="rgba(200,255,220,"+(al*.16*q).toFixed(3)+")";ctx.beginPath();ctx.arc(tx-d*s*.6,ty+s*.6,s*(.35+.5*q),0,6.2832);ctx.fill();});
      ghostPaint(ctx,g.x,y,s,d,g.t+g.ph,Math.min(1,al*1.3),{lean:sp,mouth:.75+.25*Math.sin(g.t*7+g.ph),arms:1.1,ph:g.ph,tint:1});}
    wolfTick(h,dt,a,false);
    /* thick ground mist */
    const mist=ctx.createLinearGradient(0,gl-70,0,H);mist.addColorStop(0,"rgba(130,150,180,0)");mist.addColorStop(.6,"rgba(130,150,180,"+(.12*a).toFixed(3)+")");mist.addColorStop(1,"rgba(150,140,170,"+(.15*a).toFixed(3)+")");
    ctx.fillStyle=mist;ctx.fillRect(0,gl-70,W,H-gl+70);
    for(const f of h.fog){f.x+=f.v*dt;if(f.x-f.r>W)f.x=-f.r;if(f.x+f.r<0)f.x=W+f.r;
      const fy=gl+f.dy,fg=ctx.createRadialGradient(f.x,fy,0,f.x,fy,f.r),c=f.g?"120,148,175":"150,142,180";fg.addColorStop(0,"rgba("+c+","+(.15*a).toFixed(3)+")");fg.addColorStop(1,"rgba("+c+",0)");
      ctx.fillStyle=fg;ctx.fillRect(f.x-f.r,fy-f.r,2*f.r,2*f.r);}}
  /* local bike coordinates (facing +x, wheels on y = 0, rear wheel at -38), rotated by ang about the pivot pv → screen */
  function toW(lx,ly){const r=run,c=Math.cos(r.ang),sn=Math.sin(r.ang),px=r.pv[0],py=r.pv[1],x0=lx-px,y0=ly-py,rx=x0*c-y0*sn+px,ry=x0*sn+y0*c+py;return [r.x+rx*r.s*r.dir,r.gy+ry*r.s];}
  function land(){const r=run;r.sq=1;const back=-r.dir;SFX.thud();shake(.7);
    for(const wx of [-38,40]){const w=toW(wx,17);
      emit("e",w[0],w[1],12,()=>({vx:R(-260,260),vy:R(-260,-80),r:R(1,2.2),l:R(.5,1)}));
      emit("m",w[0],w[1]-4,5,()=>({vx:R(-90,90),vy:R(-40,-8),r:R(8,15),l:R(.8,1.5)}));
      emit("f",w[0],w[1]-6,10,()=>({vx:back*R(-60,160),vy:R(-140,-30),r:R(4,8),l:R(.25,.5)}));}}
  function emit(k,x,y,n,o){for(let i=0;i<n&&P.length<(lowQ?350:600);i++){const p=Object.assign({k,x:x+R(-3,3)-(run?run.dir*Math.random()*run.sp:0),y:y+R(-3,3),vx:R(-30,30),vy:R(-120,-40),t:0,l:R(.35,.8),r:R(4,9)},o&&o());if(run)p.r*=run.s;P.push(p);}}
  function limb(c,w,pts){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);ctx.stroke();}
  function bike(){const r=run;
    /* shadow on the ground, shrinking and fading as he rises */
    if(r.lift>1){const k=Math.max(0,1-r.lift/(220*r.s));ctx.fillStyle="rgba(0,0,0,"+(.22*k).toFixed(3)+")";ctx.beginPath();ctx.ellipse(r.x,r.base+18*r.s,62*r.s*(.5+.5*k),5*r.s*(.5+.5*k),0,0,6.2832);ctx.fill();}
    ctx.save();ctx.translate(r.x,r.gy+17*r.s);ctx.scale(r.dir*r.s*(1+.06*r.sq),r.s*(1-.14*r.sq));ctx.translate(0,-17);
    ctx.translate(r.pv[0],r.pv[1]);ctx.rotate(r.ang);ctx.translate(-r.pv[0],-r.pv[1]);ctx.lineCap="round";ctx.lineJoin="round";
    /* headlight beam */
    const bm=ctx.createLinearGradient(30,0,230,0);bm.addColorStop(0,"rgba("+pal.beam+",.38)");bm.addColorStop(1,"rgba("+pal.beam+",0)");ctx.fillStyle=bm;ctx.beginPath();ctx.moveTo(30,-36);ctx.lineTo(230,-80);ctx.lineTo(230,8);ctx.closePath();ctx.fill();
    /* wheels */
    for(const wx of [-38,40]){ctx.fillStyle="rgba(20,10,5,.55)";ctx.beginPath();ctx.arc(wx,0,17,0,6.2832);ctx.fill();ctx.strokeStyle="#0b0b0b";ctx.lineWidth=6;ctx.beginPath();ctx.arc(wx,0,17,0,6.2832);ctx.stroke();
      ctx.strokeStyle=pal.ring;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(wx,0,19.5,0,6.2832);ctx.stroke();
      ctx.strokeStyle="#9ca3af";ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(wx,0,11,0,6.2832);for(let i=0;i<6;i++){const a=r.spin+i*1.047;ctx.moveTo(wx,0);ctx.lineTo(wx+Math.cos(a)*11,Math.sin(a)*11);}ctx.stroke();
      ctx.fillStyle="#d1d5db";ctx.beginPath();ctx.arc(wx,0,3,0,6.2832);ctx.fill();}
    /* frame, engine, pipes, tank, seat, fork */
    limb("#1f2937",4.5,[-38,0,-10,-10,14,-22]);limb("#1f2937",4,[-10,-10,-24,-28]);
    ctx.fillStyle="#374151";ctx.fillRect(-16,-24,24,16);limb("#cbd5e1",2,[-12,-24,-6,-34,0,-24]);limb("#94a3b8",1.2,[-14,-18,6,-18,-14,-13,6,-13]);
    limb("#d1d5db",4,[-4,-9,-30,-8,-58,-11]);limb("#9ca3af",2,[-4,-13,-30,-13,-56,-16]);
    ctx.fillStyle=pal.tank;ctx.beginPath();ctx.ellipse(6,-31,16,7,-.12,0,6.2832);ctx.fill();ctx.fillStyle="rgba(255,255,255,.25)";ctx.beginPath();ctx.ellipse(4,-34,8,2,-.12,0,6.2832);ctx.fill();
    limb("#0a0a0a",6,[-30,-29,-8,-28]);limb("#111827",3,[-52,-14,-40,-24,-26,-27]);
    limb("#e5e7eb",3.6,[22,-40,40,0]);limb("#9ca3af",3,[18,-44,24,-50,30,-50]);
    ctx.fillStyle="#fde68a";ctx.beginPath();ctx.arc(28,-35,4.5,0,6.2832);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(29,-35,2,0,6.2832);ctx.fill();
    ctx.save();ctx.translate(0,r.air?-3:Math.sin(r.t*24)*.9+r.sq*3);figure(r);ctx.restore();ctx.restore();}
  /* legs at a gallop: gait cycle c = g/2π; each leg plants (stance, 42% of the cycle) and its hoof slides back at ground speed, then
     lifts and swings forward. Two-bone IK places the joint: forelegs bend at the knee (forward), hind legs at the hock (backward).
     Order: far hind, far fore, near hind, near fore (hind pair, then fore pair, as in a real gallop). Returns
     [hipX, hipY, jointX, jointY, hoofX, hoofY, lowerAngleFromVertical]. */
  function legs(g){const c=g/6.2832;return [[-38,-58,0,1],[30,-54,.42,0],[-34,-57,.1,1],[34,-53,.52,0]].map(([hx,hy,o,hind])=>{
    const ph=((c+o)%1+1)%1,st=.42,reach=hind?17:19,bx=hx+(hind?3:6);let fx,fy;
    if(ph<st){const u=ph/st;fx=bx+reach*(1-2*u);fy=0;}else{const u=(ph-st)/(1-st),e=u*u*(3-2*u);fx=bx-reach+2*reach*e;fy=-Math.sin(Math.PI*u)*(hind?15:21);}
    const A=hind?27:24,Bl=hind?29:30;let dx=fx-hx,dy=fy-hy,d=Math.hypot(dx,dy);const dd=Math.min(d,A+Bl-.4);dx*=dd/d;dy*=dd/d;fx=hx+dx;fy=hy+dy;
    const ang=Math.acos(Math.max(-1,Math.min(1,(A*A+dd*dd-Bl*Bl)/(2*A*dd)))),base=Math.atan2(dy,dx),ja=hind?base+ang:base-ang,
      kx=hx+Math.cos(ja)*A,ky=hy+Math.sin(ja)*A;return [hx,hy,kx,ky,fx,fy,Math.atan2(fx-kx,fy-ky)];});}
  /* the black stallion he rides back on: one smooth outline (chest, belly, haunches, arched neck, head, ears) over tapered legs with
     knee/hock joints and hooves, an ember rim glow, glowing eye, flame mane and tail that flicker, reins and saddle. Hooves on y = 0. */
  const HORSE="M-48 -68 C-40 -77 -24 -77 -10 -73 C2 -71 12 -74 20 -79 C30 -86 40 -100 49 -113 L52 -127 L56 -118 L59 -126 L61 -116 C67 -110 75 -100 81 -92 "+
    "C84 -88 82 -82 76 -83 C70 -84 64 -88 59 -92 C55 -95 49 -89 44 -80 C40 -72 41 -62 38 -52 C34 -46 22 -43 6 -43 C-10 -43 -22 -45 -30 -47 "+
    "C-40 -47 -48 -51 -51 -58 C-53 -63 -51 -67 -48 -68Z";
  function seg(x0,y0,x1,y1,w0,w1){const a=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(a),ny=Math.cos(a);ctx.beginPath();ctx.moveTo(x0+nx*w0,y0+ny*w0);ctx.lineTo(x1+nx*w1,y1+ny*w1);
    ctx.lineTo(x1-nx*w1,y1-ny*w1);ctx.lineTo(x0-nx*w0,y0-ny*w0);ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(x1,y1,w1,0,6.2832);ctx.fill();}
  function horseLeg(l,c){ctx.fillStyle=c;const hind=l[0]<0;seg(l[0],l[1],l[2],l[3],hind?7:5.5,hind?3.4:3.2);seg(l[2],l[3],l[4],l[5],2.5,2.1);ctx.beginPath();ctx.arc(l[4]-Math.sin(l[6])*4,l[5]-Math.cos(l[6])*4,2.7,0,6.2832);ctx.fill();
    ctx.save();ctx.translate(l[4],l[5]);ctx.rotate(-l[6]);ctx.fillStyle="#050404";ctx.beginPath();ctx.moveTo(-3.4,-2);ctx.lineTo(3.4,-2);ctx.lineTo(4.6,3);ctx.lineTo(-3.6,3);ctx.closePath();ctx.fill();
    ctx.fillStyle=pal.ring;ctx.globalAlpha=.85;ctx.fillRect(-3.8,2,8.4,1.6);ctx.restore();ctx.globalAlpha=1;}
  function flames(pts,len,T,seed){/* flame tongues streaming back (-x) from points along a line */
    const fg=ctx.createLinearGradient(0,-130,0,-50);fg.addColorStop(0,"rgba("+pal.f[1]+",.95)");fg.addColorStop(.5,"rgba("+pal.f[2]+",.9)");fg.addColorStop(1,"rgba("+pal.f[3]+",.8)");
    ctx.fillStyle=fg;pts.forEach(([x,y],i)=>{const fl=Math.sin(T*13+i*1.7+seed),L=len*(.75+.25*Math.sin(T*9+i*2.3+seed)),tx=x-L,ty=y-6-fl*5;
      ctx.beginPath();ctx.moveTo(x+3,y+2);ctx.quadraticCurveTo(x-L*.4,y-8+fl*4,tx,ty);ctx.quadraticCurveTo(x-L*.45,y+4-fl*3,x-2,y+4);ctx.closePath();ctx.fill();});}
  function horse(){const r=run,L=legs(r.g),T=r.t;
    ctx.save();ctx.translate(r.x,r.gy);ctx.scale(r.dir*r.s,r.s);ctx.translate(r.pv[0],r.pv[1]);ctx.rotate(r.ang);ctx.translate(-r.pv[0],-r.pv[1]);ctx.lineCap="round";ctx.lineJoin="round";
    horseLeg(L[0],"#0b0808");horseLeg(L[1],"#0b0808");
    ctx.globalCompositeOperation="lighter";flames([[-48,-67],[-50,-63],[-49,-59]],30,T,1);ctx.globalCompositeOperation="source-over";
    const bg=ctx.createLinearGradient(0,-90,0,-42);bg.addColorStop(0,"#2b2222");bg.addColorStop(.55,"#161010");bg.addColorStop(1,"#0a0707");
    const p=new Path2D(HORSE);ctx.save();ctx.shadowColor="rgba("+pal.g+",.9)";ctx.shadowBlur=10;ctx.fillStyle=bg;ctx.fill(p);ctx.restore();
    ctx.strokeStyle="rgba("+pal.g+",.55)";ctx.lineWidth=1.1;ctx.stroke(p);
    /* muscle highlights: shoulder, haunch, neck, jaw */
    ctx.strokeStyle="rgba(255,240,225,.12)";ctx.lineWidth=1.4;
    for(const d of ["M24 -74 C30 -64 30 -54 26 -48","M-30 -72 C-20 -66 -20 -54 -26 -48","M28 -82 C36 -90 42 -98 48 -106","M62 -94 C66 -98 70 -97 74 -93"]){ctx.stroke(new Path2D(d));}
    ctx.fillStyle="rgba(0,0,0,.45)";ctx.beginPath();ctx.ellipse(78,-87,1.6,1.1,.4,0,6.2832);ctx.fill();
    ctx.save();ctx.shadowColor=pal.eye;ctx.shadowBlur=8;ctx.fillStyle=pal.eye;ctx.beginPath();ctx.ellipse(64,-106,2.6,1.7,-.5,0,6.2832);ctx.fill();ctx.restore();
    ctx.globalCompositeOperation="lighter";flames([[22,-80],[28,-86],[34,-93],[40,-101],[46,-109],[51,-117]],22,T,4);ctx.globalCompositeOperation="source-over";
    horseLeg(L[2],"#1a1313");horseLeg(L[3],"#1a1313");
    ctx.fillStyle="#2a1a12";ctx.beginPath();ctx.moveTo(-12,-76);ctx.quadraticCurveTo(0,-82,12,-78);ctx.lineTo(10,-70);ctx.quadraticCurveTo(0,-72,-10,-70);ctx.closePath();ctx.fill();
    limb("#3a2a20",1.6,[2,-70,4,-58]);
    ctx.save();ctx.translate(10,-44+Math.sin(r.g*2)*1.5);figure(r);ctx.restore();
    limb("#6b4f3a",1,[34,-92,58,-90,76,-85]);
    ctx.restore();}
  /* the chain hangs from his fist (raised while throwing/holding) in a sagging curve of alternating links over a fiery glow */
  function chainFist(){const r=run;return r.arm?toW(18,-133+Math.sin(r.g*2)*1.5):toW(34,-92);}
  function chain(){const c=run.ch;if(!c||!c.e||c.st==="idle"||c.st==="off")return;const [x0,y0]=chainFist(),[x1,y1]=c.e,d=Math.hypot(x1-x0,y1-y0),
      mx=(x0+x1)/2,my=(y0+y1)/2+Math.min(60,d*.12),n=Math.max(4,Math.round(d/(7*Math.max(.6,run.s)))),pt=t=>[(1-t)*(1-t)*x0+2*(1-t)*t*mx+t*t*x1,(1-t)*(1-t)*y0+2*(1-t)*t*my+t*t*y1];
    ctx.save();ctx.lineCap="round";ctx.strokeStyle="rgba("+pal.g+",.45)";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(mx,my,x1,y1);ctx.stroke();
    ctx.strokeStyle="#d1d5db";ctx.lineWidth=1.8;
    for(let i=0;i<n;i++){const [ax,ay]=pt(i/n),[bx,by]=pt((i+1)/n),a=Math.atan2(by-ay,bx-ax),L=Math.hypot(bx-ax,by-ay);
      ctx.beginPath();ctx.ellipse((ax+bx)/2,(ay+by)/2,L*.62,i%2?1.2:3.2,a,0,6.2832);ctx.stroke();}
    ctx.fillStyle=pal.ring;ctx.beginPath();ctx.arc(x1,y1,3.4,0,6.2832);ctx.fill();ctx.restore();}
  /* rider: leather jacket, spiked shoulders, chain, skull; bobs with the road, crouches in the air, punches the sky on big jumps */
  function figure(r){
    limb("#1c1917",8,[-14,-34,4,-28,-2,-12]);limb("#0b0b0b",5,[-2,-12,6,-12]);
    limb("#141414",14,[-14,-36,0,-60]);limb("#262626",3,[-13,-38,-2,-58]);
    ctx.fillStyle="#cbd5e1";for(const [sx,sy] of [[-6,-66],[0,-67],[5,-65]]){ctx.beginPath();ctx.moveTo(sx-2,sy+5);ctx.lineTo(sx,sy);ctx.lineTo(sx+2,sy+5);ctx.fill();}
    limb("#9ca3af",1.4,[-10,-58,-2,-44,4,-38]);
    if(r.gun>0){const a=r.aim,hx=2+Math.cos(a)*26,hy=-58+Math.sin(a)*26,mx=2+Math.cos(a)*40,my=-58+Math.sin(a)*40;limb("#141414",6.5,[2,-58,hx,hy]);
      limb("#1f2937",3.4,[hx-Math.cos(a)*2,hy-Math.sin(a)*2,mx,my]);limb("#374151",2.6,[hx,hy,hx-Math.sin(a)*-5,hy+Math.cos(a)*5]);ctx.fillStyle="#0a0a0a";ctx.beginPath();ctx.arc(hx,hy,3.2,0,6.2832);ctx.fill();
      if(r.flash>0){ctx.save();ctx.shadowColor="rgba("+pal.g+",1)";ctx.shadowBlur=14;ctx.fillStyle="rgba("+pal.f[0]+",.95)";ctx.beginPath();ctx.arc(mx+Math.cos(a)*4,my+Math.sin(a)*4,6,0,6.2832);ctx.fill();ctx.restore();}}
    else if(r.arm){limb("#141414",6.5,[2,-58,10,-70,8,-86]);ctx.fillStyle="#0a0a0a";ctx.beginPath();ctx.arc(8,-88,3.6,0,6.2832);ctx.fill();}
    else{limb("#141414",6.5,[2,-58,14,-50,24,-48]);ctx.fillStyle="#0a0a0a";ctx.beginPath();ctx.arc(24,-48,3.2,0,6.2832);ctx.fill();}
    ctx.fillStyle="#f3ead7";ctx.beginPath();ctx.ellipse(6,-74,8.5,9.5,.15,0,6.2832);ctx.fill();ctx.beginPath();ctx.roundRect?ctx.roundRect(5,-69,9,8,2):ctx.rect(5,-69,9,8);ctx.fill();
    ctx.fillStyle="#120804";ctx.beginPath();ctx.ellipse(9,-75,2.6,3.2,0,0,6.2832);ctx.ellipse(14,-74,1.8,2.8,0,0,6.2832);ctx.fill();
    ctx.fillStyle=pal.eye;ctx.beginPath();ctx.arc(9.4,-75,1,0,6.2832);ctx.arc(14.2,-74,.8,0,6.2832);ctx.fill();
    ctx.fillStyle="#120804";ctx.beginPath();ctx.moveTo(14,-70);ctx.lineTo(16,-67);ctx.lineTo(13,-67);ctx.fill();limb("#3f2a1a",.9,[6,-64,14,-64,7,-62,7,-66,10,-62,10,-66,13,-62,13,-66]);}
  function col(f){const a=Math.pow(1-f,1.3)*(dark?.85:.75),i=f<.12?0:f<.3?1:f<.55?2:f<.8?3:4;return "rgba("+pal.f[i]+","+(i===4?a*.6:a).toFixed(3)+")";}
  /* 3D rider (v14): real models rendered with three.js r147 on canvas #rider3d, between the haunted backdrop (#riderLow) and the
     fire, chain and bullets (#rider). Models (CC BY 4.0, credited in the footer): cruiser "1990 Fatboy inspired Cruiser Motorcycle" by
     Alpha One, "Skeleton Lord" by DJMaesen, "Horse" by henrysteve973, "Werewolf - IDLE [MESHY]" by EthanFromEngland. They are packed as
     base64 GLB in assets/models/*.js (a file:// page can't fetch files) and load on the first summon (or hovering the ghost button).
     The ride logic stays the same: R3.bike(run) / R3.horse(run) / R3.wolf(...) place the models from the existing 2D state, the
     seated rider is posed by two-bone IK (hands on the grips or reins, feet on the pegs or flanks, gun arm aimed, fist raised) and the
     werewolf is posed procedurally on its Mixamo skeleton (howl, leap, crouch, sprint). If anything fails, the drawn versions stay. */
  const R3=(function(){
    let state="idle",loading=null,ren,scene,cam,cv3,hemi,moonL,keyL,fireL,B={},RD={},HS={},WF={},FL={},shown=false,rest=new Map();
    const MD=ROOT+"assets/models/",V=()=>new THREE.Vector3(),Q=()=>new THREE.Quaternion();
    const addS=src=>new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});
    const b64=s=>{const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;};
    function load(){if(loading)return loading;state="loading";
      const lib=window.THREE&&THREE.GLTFLoader?Promise.resolve():(window.THREE?Promise.resolve():addS("https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js")).then(()=>addS("https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/loaders/GLTFLoader.js"));
      loading=lib.then(()=>Promise.all(["bike","rider","horse"].map(k=>window.MODELS&&MODELS[k]?0:addS(MD+k+".js")))).then(build)
        .then(()=>{state="ready";},e=>{state="failed";console.warn("3D rider unavailable, the drawn one is used",e);});
      return loading;}
    const parse=k=>new Promise((res,rej)=>new THREE.GLTFLoader().parse(b64(MODELS[k]),"",g=>{delete MODELS[k];res(g);},rej));
    /* bounds after skinning, in the space of `space` */
    function box(o,space){o.updateMatrixWorld(true);const bb=new THREE.Box3(),v=V(),inv=space?new THREE.Matrix4().copy(space.matrixWorld).invert():null;
      o.traverse(m=>{if(!m.isMesh||!m.visible)return;const p=m.geometry.attributes.position;for(let i=0;i<p.count;i+=3){v.fromBufferAttribute(p,i);if(m.isSkinnedMesh)m.boneTransform(i,v);v.applyMatrix4(m.matrixWorld);if(inv)v.applyMatrix4(inv);bb.expandByPoint(v);}});return bb;}
    const bones=o=>{const b={};o.traverse(x=>{if(x.isBone){b[x.name.replace(/^mixamorig:?/,"").replace(/_\d+$/,"").replace(/_0$/,"")]=x;rest.set(x,x.quaternion.clone());}});return b;};
    const reset=bs=>{for(const k in bs){const r=rest.get(bs[k]);if(r)bs[k].quaternion.copy(r);}};
    const wp=(o,v)=>o.getWorldPosition(v||V());
    /* rotate `bone` so the direction bone→child turns toward bone→target (world space) */
    function aim(bone,child,target){bone.updateMatrixWorld(true);const a=wp(bone),c=wp(child),d0=c.sub(a).normalize(),d1=target.clone().sub(a).normalize();if(d0.lengthSq()<1e-9||d1.lengthSq()<1e-9)return;
      const q=Q().setFromUnitVectors(d0,d1),bw=bone.getWorldQuaternion(Q()),pw=bone.parent.getWorldQuaternion(Q());bone.quaternion.copy(pw.invert().multiply(q.multiply(bw)));bone.updateMatrixWorld(true);}
    /* two-bone IK: upper→mid→end reaches `target`; the middle joint bends toward `pole` */
    function ik(up,mid,end,target,pole){up.updateMatrixWorld(true);const A=wp(up),Bp=wp(mid),C=wp(end),la=A.distanceTo(Bp),lb=Bp.distanceTo(C);
      const T=target.clone(),AT=T.clone().sub(A),d=Math.max(Math.abs(la-lb)+1e-4,Math.min(la+lb-1e-4,AT.length()));AT.setLength(d);T.copy(A).add(AT);
      const n=AT.clone().normalize(),pl=pole.clone().sub(n.clone().multiplyScalar(pole.dot(n)));if(pl.lengthSq()<1e-9)pl.set(0,1,0);pl.normalize();
      const ca=(la*la+d*d-lb*lb)/(2*la*d),sa=Math.sqrt(Math.max(0,1-ca*ca)),Bd=A.clone().add(n.clone().multiplyScalar(ca*la)).add(pl.multiplyScalar(sa*la));
      aim(up,mid,Bd);aim(mid,end,T);}
    function build(){
      cv3=document.createElement("canvas");cv3.id="rider3d";cv3.setAttribute("aria-hidden","true");document.body.appendChild(cv3);
      ren=new THREE.WebGLRenderer({canvas:cv3,alpha:true,antialias:true,powerPreference:"high-performance"});ren.setClearColor(0,0);ren.outputEncoding=THREE.sRGBEncoding;
      ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=1.15;
      scene=new THREE.Scene();cam=new THREE.OrthographicCamera(0,1,0,-1,-4000,4000);
      hemi=new THREE.HemisphereLight(0x9fb4ff,0x1a1010,.75);moonL=new THREE.DirectionalLight(0xdff3ff,1.6);keyL=new THREE.DirectionalLight(0xbcd0ff,.55);
      fireL=new THREE.PointLight(0xff7a18,2.4,400,1.6);scene.add(hemi,moonL,moonL.target,keyL,keyL.target,fireL);
      /* v15 real fire: flame planes drawn by a noise shader (additive), hot core → cool tips in the theme's fire colours,
         streaming back with speed; two extra flickering lights put orange glints on the chrome and armour */
      FL.lights=[new THREE.PointLight(0xff7a18,1.4,300,1.6),new THREE.PointLight(0xff7a18,1.4,300,1.6)];FL.lights.forEach(l=>scene.add(l));
      FL.mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,
        uniforms:{uT:{value:0},c1:{value:new THREE.Color(1,1,.85)},c2:{value:new THREE.Color(1,.6,.1)},c3:{value:new THREE.Color(.9,.15,.03)},uSeed:{value:0}},
        vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
        fragmentShader:"uniform float uT,uSeed;uniform vec3 c1,c2,c3;varying vec2 vUv;"+
          "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}"+
          "float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}"+
          "float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+1.7;a*=.5;}return v;}"+
          /* a soft teardrop: rounded base, tapering wavy tongue, edges eaten by noise, bright core → orange → red tips */
          "void main(){vec2 uv=vUv;float t=uT*2.4+uSeed*17.;float q=fb(vec2(uv.x*2.6+uSeed,uv.y*2.4-t)),q2=fb(vec2(uv.x*5.+3.,uv.y*5.-t*1.7));"+
          "vec2 p=uv-vec2(.5,.2);p.x+=(q-.5)*.34*uv.y+(q2-.5)*.06;float wd=.3*pow(max(0.,1.-uv.y),.75)+.015;"+
          "float d=length(vec2(p.x/wd,p.y<0.?p.y/.2:p.y/.8));float body=1.-d+(q-.5)*.55+(q2-.5)*.18;"+
          "float a=smoothstep(.0,.42,body);float core=smoothstep(.35,.85,body);"+
          "vec3 col=mix(c3,c2,smoothstep(.05,.4,body));col=mix(col,c1,core);a*=smoothstep(1.,.82,uv.y);"+
          "gl_FragColor=vec4(col*a*1.25,a);}"});
      FL.geo=new THREE.PlaneGeometry(1,1);FL.geo.translate(0,.5,0);FL.pool=[];
      for(let i=0;i<8;i++){const m=new THREE.Mesh(FL.geo,FL.mat.clone());m.material.uniforms.uSeed.value=i*1.37;m.renderOrder=10;m.visible=false;scene.add(m);FL.pool.push(m);}
      return Promise.all(["bike","rider","horse"].map(parse)).then(([gb,gr,gh])=>{
        /* bike: faces +X; origin at the ground midway between the axles; body paint turned to blood-red black */
        const bm=gb.scene;bm.rotation.y=Math.PI/2;B.inner=new THREE.Group();B.inner.add(bm);let bb=box(bm,B.inner);
        B.len=bb.max.x-bb.min.x;B.hgt=bb.max.y-bb.min.y;B.wid=bb.max.z-bb.min.z;bm.position.set(-(bb.min.x+.525*B.len),-bb.min.y,-(bb.min.z+bb.max.z)/2);
        bm.traverse(m=>{if(m.isMesh&&m.material&&/Body/.test(m.material.name)){m.material=m.material.clone();m.material.color.setRGB(.32,.07,.06);m.material.metalness=Math.min(1,(m.material.metalness||0)+.25);}});
        /* wheels: parts centred on an axle and no bigger than the tyre spin around it */
        B.inner.updateMatrixWorld(true);B.wheels=[];
        for(const u of [.18,.87]){const c=new THREE.Vector3((u-.525)*B.len,.245*B.hgt,0),R=.132*B.len,pv=new THREE.Group();pv.position.copy(c);B.inner.add(pv);pv.updateMatrixWorld(true);const take=[];
          bm.traverse(m=>{if(!m.isMesh)return;const b=box(m,B.inner),cc=b.getCenter(V()),sz=b.getSize(V());if(Math.hypot(cc.x-c.x,cc.y-c.y)<.3*R&&Math.max(sz.x,sz.y)<2.35*R)take.push(m);});
          take.forEach(m=>pv.attach(m));B.wheels.push(pv);}
        B.rig=new THREE.Group();B.body=new THREE.Group();B.rig.add(B.body);B.body.add(B.inner);scene.add(B.rig);
        /* rider: the sword hidden; scaled to 1.78 m against the 2.4 m bike */
        const rm=gr.scene;rm.rotation.y=Math.PI/2;rm.traverse(m=>{if(m.isMesh&&m.material&&/sword/i.test(m.material.name))m.visible=false;});
        RD.m=rm;RD.g=new THREE.Group();RD.g.add(rm);RD.b=bones(rm);const rb=box(rm,RD.g);RD.h=rb.max.y-rb.min.y;
        /* horse: black coat and mane, ember eyes; gallop clip driven by the ride's gait phase */
        const hm=gh.scene;hm.rotation.y=Math.PI/2;HS.mix=new THREE.AnimationMixer(hm);const gal=gh.animations.find(a=>/Gallop$/.test(a.name));HS.act=HS.mix.clipAction(gal);HS.act.play();HS.dur=gal.duration;const bk=gh.animations.find(a=>/Buck_1$/.test(a.name));HS.buck=HS.mix.clipAction(bk);HS.buck.play();HS.buck.weight=0;HS.bdur=bk.duration;HS.mix.update(.05);
        const hb=[];hm.traverse(x=>{if(x.isBone)hb.push(x);});HS.mane=hb.filter(x=>/Neck_0[0-3]_|Head_00/.test(x.name)).slice(0,4);HS.tail=hb.find(x=>/Tail/i.test(x.name))||null;
        hm.traverse(m=>{if(!m.isMesh||!m.material)return;const n=m.material.name;if(/Horse|Hair/.test(n)){m.material=m.material.clone();m.material.color.setRGB(.028,.024,.026);m.material.metalness=0;m.material.roughness=.55;}
          if(/Cornea/.test(n)){m.material=m.material.clone();m.material.emissive=new THREE.Color(0xff3a10);m.material.emissiveIntensity=2.5;}});
        HS.inner=new THREE.Group();HS.inner.add(hm);bb=box(hm,HS.inner);HS.len=bb.max.x-bb.min.x;HS.hgt=bb.max.y-bb.min.y;HS.wid=bb.max.z-bb.min.z;
        hm.position.set(-(bb.min.x+.5*HS.len),-bb.min.y,-(bb.min.z+bb.max.z)/2);
        HS.rig=new THREE.Group();HS.body=new THREE.Group();HS.rig.add(HS.body);HS.body.add(HS.inner);scene.add(HS.rig);
        const gm=new THREE.MeshStandardMaterial({color:0x0c0c0e,metalness:.85,roughness:.35});RD.gun=new THREE.Group();
        const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,1,10),gm);barrel.rotation.z=-Math.PI/2;barrel.position.x=.55;
        const body=new THREE.Mesh(new THREE.BoxGeometry(.45,.32,.22),gm);body.position.x=.05;const grip=new THREE.Mesh(new THREE.BoxGeometry(.2,.5,.18),gm);grip.position.set(-.1,-.3,0);grip.rotation.z=.35;
        RD.gun.add(barrel,body,grip);RD.gun.visible=false;scene.add(RD.gun);
        [B.rig,HS.rig].forEach(o=>o.visible=false);});}
    const fireCols=()=>{const c=k=>pc(pal.f[k]);FL.pool.forEach(m=>{m.material.uniforms.c1.value.copy(c(0));m.material.uniforms.c2.value.copy(c(2));m.material.uniforms.c3.value.copy(c(3));});};
    function fl(i,p,h,w,lean){const m=FL.pool[i];if(!m)return;m.visible=true;m.position.set(p.x,p.y,300+i);m.scale.set(w,h,1);m.rotation.set(0,0,lean);
      m.material.uniforms.uT.value=performance.now()/1000;}
    function flLights(a,b){FL.lights[0].position.copy(a);FL.lights[1].position.copy(b);FL.lights.forEach((l,i)=>{l.color.copy(pc(pal.g));l.intensity=1.2+.5*Math.sin(performance.now()/(47+i*13));});}
    function sizeTo(){const w=innerWidth,h=innerHeight;if(cv3.width!==Math.round(w*Math.min(devicePixelRatio||1,1.5))||cam.right!==w||cam.bottom!==-h){ren.setPixelRatio(Math.min(devicePixelRatio||1,1.5));ren.setSize(w,h,false);cam.right=w;cam.bottom=-h;cam.updateProjectionMatrix();}}
    const pc=s=>{const a=s.split(",").map(Number);return new THREE.Color(a[0]/255,a[1]/255,a[2]/255);};
    function lightsAt(x,y,s){const [mx,my]=hs&&hs.moon?hs.moon:[W*.3,H*.15];moonL.position.set(mx,-my,-500);moonL.target.position.set(x,-y,0);
      keyL.position.set(x+200,-y+400,900);keyL.target.position.set(x,-y,0);fireL.color.copy(pc(pal.g));fireL.distance=420*s;fireL.intensity=2.2+.6*Math.sin(performance.now()/60)*Math.sin(performance.now()/23);}
    /* the rider sits at `seat`, hands to `hands`, feet to `feet` (points in the inner space of the bike or horse) */
    function seatRider(par,seat,hands,feet,r,scale,lean){
      if(RD.g.parent!==par){par.add(RD.g);RD.g.scale.setScalar(scale);RD.placed=false;}
      const b=RD.b;reset(b);RD.g.position.set(0,0,0);RD.m.position.set(0,0,0);RD.g.updateMatrixWorld(true);
      const hp=par.worldToLocal(wp(b.hips));RD.m.position.set((seat.x-hp.x)/scale,(seat.y-hp.y)/scale,(seat.z-hp.z)/scale);RD.g.updateMatrixWorld(true);
      const L=p=>par.localToWorld(p.clone()),fw=L(new THREE.Vector3(1,0,0)).sub(L(new THREE.Vector3(0,0,0))).normalize(),up=L(new THREE.Vector3(0,1,0)).sub(L(new THREE.Vector3(0,0,0))).normalize();
      aim(b.spine,b.chest,wp(b.spine).add(up.clone().multiplyScalar(Math.cos(lean))).add(fw.clone().multiplyScalar(Math.sin(lean))));
      aim(b.neck,b.head,wp(b.neck).add(up.clone()).add(fw.clone().multiplyScalar(.25)));
      ik(b.R_leg,b.R_knee,b.R_ankle,L(feet[1]),fw.clone().add(up.clone().multiplyScalar(.6)));ik(b.L_leg,b.L_knee,b.L_ankle,L(feet[0]),fw.clone().add(up.clone().multiplyScalar(.6)));
      const sh=par.worldToLocal(wp(b.R_arm)),armL=wp(b.R_arm).distanceTo(wp(b.R_elbow))+wp(b.R_elbow).distanceTo(wp(b.R_wrist));
      let rh=hands[1];const ul=armL/par.getWorldScale(V()).x;
      if(r.gun>0)rh=sh.clone().add(new THREE.Vector3(Math.cos(r.aim),-Math.sin(r.aim),0).multiplyScalar(ul*.98));
      else if(r.arm)rh=sh.clone().add(new THREE.Vector3(.15,1,.1).normalize().multiplyScalar(ul*.95));
      const back=up.clone().multiplyScalar(-1).add(fw.clone().multiplyScalar(-.6));
      ik(b.R_arm,b.R_elbow,b.R_wrist,L(rh),back);ik(b.L_arm,b.L_elbow,b.L_wrist,L(hands[0]),back);
      RD.gun.visible=r.gun>0;if(r.gun>0){const e=wp(b.R_elbow),w=wp(b.R_wrist),d=w.clone().sub(e).normalize(),sz=e.distanceTo(w)*.7;
        RD.gun.position.copy(w).add(d.clone().multiplyScalar(sz*.9));RD.gun.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),d);RD.gun.scale.setScalar(sz);}}
    /* place a rig: pivot in screen px (2D local pv scaled), tilt, yaw for a 3/4 view, model origin at local (ox, oy) of the 2D drawing */
    function place(o,r,ox,oy,k,sx,sy){const pvx=r.x+r.pv[0]*r.s*r.dir,pvy=r.gy+r.pv[1]*r.s;o.rig.position.set(pvx,-pvy,0);o.rig.rotation.set(0,0,-r.ang*r.dir);
      o.body.position.set(r.dir*(ox-r.pv[0])*r.s,-(oy-r.pv[1])*r.s,0);o.body.rotation.set(0,r.dir>0?-.28:Math.PI+.28,0);o.body.scale.set(k*(sx||1),k*(sy||1),k);}
    function bike(r){sizeTo();B.rig.visible=true;HS.rig.visible=false;shown=true;const k=125*r.s/B.len;
      place(B,r,1,17,k,1+.06*r.sq,1-.14*r.sq);B.wheels.forEach(w=>w.rotation.z=-r.spin*r.dir);
      const P=(u,v,z)=>new THREE.Vector3((u-.525)*B.len,v*B.hgt,z*B.wid);
      seatRider(B.inner,P(.36,.62,0),[P(.545,.83,-.33),P(.545,.83,.33)],[P(.63,.24,-.3),P(.63,.24,.3)],r,1.78*(B.len/2.4)/RD.h,r.air?.55:.3);
      lightsAt(r.x,r.gy-40*r.s,r.s);fireL.position.set(r.x,-(r.gy-80*r.s),60);
      fireCols();const lean=r.dir*(.75+(r.air?.25:0)),hd=wp(RD.b.head),w0=wp(B.wheels[0]),w1=wp(B.wheels[1]),ex=B.inner.localToWorld(new THREE.Vector3((.06-.525)*B.len,.3*B.hgt,.3*B.wid));
      fl(0,hd.clone().add(new THREE.Vector3(0,6*r.s,0)),70*r.s,40*r.s,lean);fl(1,w0.clone().add(new THREE.Vector3(0,-12*r.s,0)),64*r.s,46*r.s,lean*1.1);
      fl(2,w1.clone().add(new THREE.Vector3(0,-12*r.s,0)),52*r.s,40*r.s,lean*1.1);fl(3,ex,38*r.s,22*r.s,r.dir*1.35);flLights(w0,w1);}
    function horse(r){sizeTo();HS.rig.visible=true;B.rig.visible=false;shown=true;const k=150*r.s/HS.len;
      place(HS,r,14,0,k);const rear=r.rear!=null&&r.rear<2.4;HS.act.weight=rear?0:1;HS.buck.weight=rear?1:0;
      HS.act.time=((r.g/6.2832)%1+1)%1*HS.dur;HS.buck.time=rear?Math.min(1.5+.12*Math.sin(r.rear*7),HS.bdur-.01):0;HS.mix.update(0);
      const P=(u,v,z)=>new THREE.Vector3((u-.5)*HS.len,v*HS.hgt,z*HS.wid);
      seatRider(HS.inner,P(.57,.72,0),[P(.68,.76,-.12),P(.68,.76,.12)],[P(.56,.42,-.55),P(.56,.42,.55)],r,1.78*(HS.len/2.4)/RD.h,.2);
      lightsAt(r.x,r.gy-70*r.s,r.s);fireL.position.set(r.x,-(r.gy-120*r.s),60);
      fireCols();const lean=r.dir*(r.rear!=null&&r.rear<2.4?.25:.8),hd=wp(RD.b.head);fl(0,hd.clone().add(new THREE.Vector3(0,6*r.s,0)),70*r.s,40*r.s,lean);
      HS.mane.forEach((b,i)=>fl(1+i,wp(b),(44-i*6)*r.s,26*r.s,lean*1.1));if(HS.tail)fl(5,wp(HS.tail),46*r.s,24*r.s,r.dir*1.4);flLights(wp(HS.mane[0]||RD.b.head),HS.tail?wp(HS.tail):hd);}
    /* werewolf poses on its Mixamo skeleton: targets in the wolf's own space (X forward, Y up, model units) */
    function wolf(x,y,sc,dir,pose,g,a,rot,T){if(!WF.rig)return;sizeTo();WF.rig.visible=true;WF.seen=true;shown=true;const k=150*sc/WF.hgt,b=WF.b;
      WF.rig.position.set(x,-y,0);WF.rig.rotation.set(0,0,-(rot||0)*dir);WF.inner.rotation.set(0,dir>0?-.3:Math.PI+.3,0);WF.inner.scale.setScalar(k);
      WF.inner.position.set(0,pose==="leap"?-.45*150*sc:0,0);
      WF.mix.update(0);reset(b);WF.mix.setTime(T%2);WF.inner.updateMatrixWorld(true);
      const H=WF.hgt,L=p=>WF.inner.localToWorld(p.clone()),P=(u,v,z)=>L(new THREE.Vector3(u*H,v*H,z*H)),fw=P(1,0,0).sub(P(0,0,0)).normalize(),up=P(0,1,0).sub(P(0,0,0)).normalize();
      const look=(bn,ch,f,u)=>aim(bn,ch,wp(bn).add(up.clone().multiplyScalar(u)).add(fw.clone().multiplyScalar(f)));
      const back=fw.clone().multiplyScalar(-1),fwd=fw.clone(),knee=fw.clone().add(up.clone().multiplyScalar(.3));
      if(pose==="sit"||pose==="howl"){const br=Math.sin(T*2.6)*.03;
        look(b.Spine,b.Spine2,-.15,1);look(b.Spine2,b.Neck,-.05,1);look(b.Neck,b.Head,.35,1);look(b.Head,b.HeadTop_End,.55+br,1);
        ik(b.LeftArm,b.LeftForeArm,b.LeftHand,P(-.12,.36,-.62),back);ik(b.RightArm,b.RightForeArm,b.RightHand,P(.06,.4,.62),back);
        ik(b.LeftUpLeg,b.LeftLeg,b.LeftFoot,P(-.1,.02,-.2),knee);ik(b.RightUpLeg,b.RightLeg,b.RightFoot,P(.08,.02,.2),knee);}
      else if(pose==="leap"){look(b.Spine,b.Spine2,1,.25);look(b.Spine2,b.Neck,1,.2);look(b.Neck,b.Head,1,.25);
        ik(b.LeftArm,b.LeftForeArm,b.LeftHand,P(.85,.55,-.25),back);ik(b.RightArm,b.RightForeArm,b.RightHand,P(.9,.62,.25),back);
        ik(b.LeftUpLeg,b.LeftLeg,b.LeftFoot,P(-.75,.3,-.15),knee);ik(b.RightUpLeg,b.RightLeg,b.RightFoot,P(-.65,.18,.15),knee);}
      else if(pose==="land"){look(b.Spine,b.Spine2,.8,.5);look(b.Neck,b.Head,1,.3);
        ik(b.LeftArm,b.LeftForeArm,b.LeftHand,P(.45,.04,-.3),back);ik(b.RightArm,b.RightForeArm,b.RightHand,P(.5,.04,.3),back);
        ik(b.LeftUpLeg,b.LeftLeg,b.LeftFoot,P(-.15,.03,-.2),knee);ik(b.RightUpLeg,b.RightLeg,b.RightFoot,P(-.05,.03,.2),knee);}
      else{/* sprint: hunched forward, legs cycle (stance slides back on the ground, swing arcs forward), arms counter-swing */
        look(b.Spine,b.Spine2,.75,.65);look(b.Spine2,b.Neck,.8,.5);look(b.Neck,b.Head,1,.2);
        const foot=(ph,z)=>{const c=((ph/6.2832)%1+1)%1;let u,v;if(c<.45){const t=c/.45;u=.38-.76*t;v=.03;}else{const t=(c-.45)/.55,e=t*t*(3-2*t);u=-.38+.76*e;v=.03+Math.sin(Math.PI*t)*.32;}return P(u,v,z);};
        ik(b.LeftUpLeg,b.LeftLeg,b.LeftFoot,foot(g,-.16),knee);ik(b.RightUpLeg,b.RightLeg,b.RightFoot,foot(g+Math.PI,.16),knee);
        const hand=(ph,z)=>P(.25+.35*Math.sin(ph),.42+.12*Math.cos(ph),z);
        ik(b.LeftArm,b.LeftForeArm,b.LeftHand,hand(g+Math.PI,-.32),back);ik(b.RightArm,b.RightForeArm,b.RightHand,hand(g,.32),back);}
      WF.inner.traverse(m=>{if(m.isMesh&&m.material){m.material.transparent=a<.98;m.material.opacity=a;}});
      lightsAt(x,y-60*sc,sc);if(!run)fireL.intensity=0;}
    /* one render per frame; models not placed this frame are hidden */
    function frame(){if(state!=="ready")return;const any=(B.rig.visible||HS.rig.visible||WF.seen);
      if(WF.rig&&!WF.seen)WF.rig.visible=false;WF.seen=false;
      if(!any){if(shown){ren.clear();shown=false;}return;}
      ren.render(scene,cam);B.rig.visible=false;HS.rig.visible=false;if(RD.gun)RD.gun.visible=false;FL.pool.forEach(m=>m.visible=false);FL.lights.forEach(l=>l.intensity=0);}
    const dbg=()=>({state,cv:[cv3&&cv3.width,cv3&&cv3.height],cam:cam&&[cam.left,cam.right,cam.top,cam.bottom],bike:B.rig&&B.rig.position.toArray(),k:B.body&&B.body.scale.x,len:B.len,tris:ren&&ren.info.render.triangles,calls:ren&&ren.info.render.calls,vis:B.rig&&B.rig.visible});
    return {load,bike,horse,wolf,frame,dbg,get on(){return state==="ready";},get state(){return state;}};
  })();
  function loop(now){raf=requestAnimationFrame(loop);const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=Math.max(last,now);
    const r=run;
    hz+=((r?1:0)-hz)*Math.min(1,dt*1.4);
    document.documentElement.classList.toggle("haunted",hz>.3);document.documentElement.classList.toggle("cine",!!run);
    /* after the bike pass: a short pause, then he gallops back the other way on the flaming horse */
    if(r&&r.mode==="gap"){r.wait-=dt;if(r.wait<=0){r.mode="horse";r.dir=-r.dir;r.x=r.dir>0?-200*r.s:W+200*r.s;r.ang=0;r.pv=[0,-60];r.arm=false;r.air=false;r.lift=0;r.ch={st:"off",t:0};  /* v14: no chain catch (user asked to remove it) */ r.shots=[.08,.17];SFX.neigh();setTimeout(()=>SFX.snort(),1700);}}
    else if(r&&r.mode==="horse"){const pr=r.dir>0?r.x/W:1-r.x/W;
      if(r.rear==null&&pr>.4&&R3.on){r.rear=0;if(hs)hs.fl=1;SFX.thunder(1);setTimeout(()=>SFX.neigh(),180);shake(.6);}
      const rearing=r.rear!=null&&r.rear<2.4;if(r.rear!=null&&r.rear<2.4)r.rear+=dt;r.zt=rearing?1.12:1;const v=rearing?0:r.v*1.3;r.x+=r.dir*v*dt;r.t+=dt;const c0=r.g/6.2832;r.g+=dt*v/(15*r.s);r.sp=v*dt;
      for(const o of [0,.1,.42,.52])if(Math.floor(r.g/6.2832+o)>Math.floor(c0+o))SFX.hoof(o===.1||o===.52?1:.65);if(Math.random()<.003)SFX.snort();
      r.base=H-17*r.s-12;r.gy=r.base-Math.max(0,Math.sin(r.g-.6))*6*r.s;r.ang=Math.sin(r.g+.9)*.06;
      /* rearing: the whole horse pivots up about its hind hooves (nose to the moon), then drops back to the gallop */
      if(rearing){const u=Math.min(1,r.rear/2.4),e=Math.sin(Math.PI*Math.min(1,u*1.15));r.pv=[-46,0];r.ang=-.62*Math.pow(Math.max(0,e),.7);r.gy=r.base;}else if(r.rear!=null)r.pv=[0,-60];const back=-r.dir;
      const hd=toW(16,-126);emit("f",hd[0],hd[1],7,()=>({vx:back*R(60,200),vy:R(-160,-60),r:R(4,9),l:R(.25,.5)}));
      emit("e",hd[0],hd[1],2,()=>({vx:back*R(40,200),vy:R(-220,-80),r:R(1,2),l:R(.8,1.6)}));
      for(const [mx,my] of [[28,-80],[38,-92],[46,-104]]){const m=toW(mx,my);emit("f",m[0],m[1],1,()=>({vx:back*R(60,160),vy:R(-120,-40),r:R(2,5),l:R(.2,.4)}));}
      const tl=toW(-54,-54);emit("f",tl[0],tl[1],3,()=>({vx:back*R(80,200),vy:R(-70,10),r:R(3,7),l:R(.25,.5)}));
      for(const l of legs(r.g)){const hf=toW(l[4],l[5]);emit("f",hf[0],hf[1],l[5]>-6?5:1,()=>({vx:back*R(10,90),vy:R(-90,-20),r:R(3,6),l:R(.2,.45)}));
        if(l[5]>-3&&Math.random()<.25)emit("e",hf[0],hf[1],4,()=>({vx:R(-120,120),vy:R(-180,-60),r:R(1,2),l:R(.4,.9)}));}
      emit("m",tl[0],r.base-6*r.s,1,()=>({vx:back*R(10,50),vy:R(-40,-10),r:R(8,14),l:R(1.2,2.2)}));
      /* the flaming chain: thrown at the mascot, it catches it (MASCOT.grab), reels it in to fly on a leash above his raised fist,
         and lets it go before he leaves (MASCOT.release), then snaps back. c.st: idle → throw → reel → carry → back → off */
      const c=r.ch,fist=chainFist(),p=r.dir>0?r.x/W:1-r.x/W,ease=u=>u*u*(3-2*u),lerp=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u],lead=()=>[fist[0]-r.dir*34*r.s,fist[1]-72*r.s];c.t+=dt;
      if(c.st==="idle"){if(p>.27&&p<.62&&window.MASCOT){const w=MASCOT.where();if(w){c.st="throw";c.t=0;c.tg=w;SFX.whoosh();}}}
      else if(c.st==="throw"){const u=Math.min(1,c.t/.65);c.e=lerp(fist,c.tg,1-(1-u)*(1-u));
        if(u>=1){c.h=MASCOT.grab();SFX.clink();c.s0=c.e.slice();c.t=0;c.st=c.h?"reel":"back";emit("e",c.e[0],c.e[1],16,()=>({vx:R(-200,200),vy:R(-200,60),r:R(1,2.2),l:R(.4,.9)}));}}
      else if(c.st==="reel"){const u=Math.min(1,c.t/1.3);c.e=lerp(c.s0,lead(),ease(u));c.e[1]-=Math.sin(u*Math.PI)*40;if(u>=1){c.st="carry";c.t=0;}}
      else if(c.st==="carry"){const l=lead();if(Math.random()<.025)SFX.clink();c.e=[l[0]+Math.sin(r.t*5)*9,l[1]+Math.sin(r.t*7)*7];
        if(c.t>2.6||p>.86){(MASCOT.releaseGhost||MASCOT.release).call(MASCOT,c.h,c.e[0],c.e[1]);c.h=null;c.st="back";c.t=0;c.s0=c.e.slice();}}
      else if(c.st==="back"){const u=Math.min(1,c.t/.35);c.e=lerp(c.s0,fist,u);if(u>=1)c.st="off";}
      r.arm=c.st==="throw"||c.st==="reel"||c.st==="carry"||(r.rear!=null&&r.rear<2.4);shoot(p,dt);
      if(c.e&&c.st!=="idle"&&c.st!=="off")emit("f",c.e[0],c.e[1],2,()=>({vx:R(-40,40),vy:R(-80,-20),r:R(2,5),l:R(.2,.4)}));
      if(c.h)c.h.el.style.transform="translate("+(c.e[0]-c.h.cx).toFixed(1)+"px,"+(c.e[1]-c.h.cy).toFixed(1)+"px) scale("+(c.h.owl?.7:.7*r.dir)+",.7)";
      if(r.dir>0?r.x>W+240*r.s:r.x<-240*r.s){if(c.h)(MASCOT.releaseGhost||MASCOT.release).call(MASCOT,c.h,c.e[0],c.e[1]);else if(window.MASCOT)MASCOT.home();run=null;}}
    else if(r){let sl=1;const p0=r.dir>0?r.x/W:1-r.x/W;for(const k of r.tr)if(k.k==="flip"&&p0>k.a&&p0<k.b){const u=(p0-k.a)/(k.b-k.a);sl=k.over?2.2*(u>.4&&u<.6?.4:1):(u>.3&&u<.7?.35:1);}
      r.slow=(r.slow||1)+(sl-(r.slow||1))*Math.min(1,dt*7);r.zt=sl<.99?1.17:1;const dts=dt*r.slow;r.x+=r.dir*r.v*dts;r.t+=dts;const p=r.dir>0?r.x/W:1-r.x/W;
      let ang=0,pv=[0,-24],lift=0,air=false,arm=false;
      for(const k of r.tr){
        if(p>k.b){if(!k.done){k.done=true;if(k.k!=="wheelie")land();}continue;}
        if(p<k.a)continue;const u=(p-k.a)/(k.b-k.a);
        if(k.k==="wheelie"){ang=-.4*Math.min(1,Math.sin(Math.PI*u)*1.7);pv=[-38,0];continue;}
        air=true;arm=k.k!=="hop"&&u>.25&&u<.8;lift=k.h*r.s*(k.over?Math.sqrt(4*u*(1-u)):4*u*(1-u));
        if(k.k==="flip"){const e=u<.18?0:u>.82?1:(u-.18)/.64;ang=-6.2832*e*e*(3-2*e)-.3*Math.sin(Math.PI*u);}
        else ang=-.34*Math.sin(2*Math.PI*u)*(k.k==="big"?1.4:1);
        if(!k.up){k.up=true;SFX.engine(true,1.4);const ex=toW(-58,-11);emit("f",ex[0],ex[1],26,()=>({vx:-r.dir*R(120,320),vy:R(-80,20),r:R(3,7),l:R(.2,.45)}));}}
      r.sq=Math.max(0,r.sq-dt*3.5);r.ang=ang;r.pv=pv;r.lift=lift;r.air=air;r.arm=arm;shoot(p,dt);
      r.base=H-34*r.s-12;r.gy=r.base-lift;r.spin+=r.dir*r.v*dts/(17*r.s)*(air?1.6:1);SFX.engine(true,air?1.1:.25+.12*Math.sin(r.t*3));
      r.sp=r.v*dt;const hd=toW(6,-80),rw=toW(-38,16),fw=toW(40,16),ex=toW(-60,-13),wx=toW(-38,0),fx=toW(40,0),back=-r.dir;
      emit("f",hd[0],hd[1],R3.on?5:14,()=>({vx:back*R(60,220),vy:R(-170,-60),r:R(5,11),l:R(.3,.65)}));
      emit("e",hd[0],hd[1],2,()=>({vx:back*R(40,200),vy:R(-220,-80),r:R(1,2),l:R(.8,1.6)}));
      for(const w of [wx,fx])emit("f",w[0]+R(-16,16)*r.s,w[1]+R(-16,16)*r.s,4,()=>({vx:back*R(20,120),vy:R(-90,-20),r:R(3,6),l:R(.2,.45)}));
      emit("f",rw[0],rw[1],6,()=>({vx:back*R(0,40),vy:R(-70,-15),r:R(4,9),l:R(.7,1.5)}));
      emit("f",fw[0],fw[1],2,()=>({vx:back*R(0,30),vy:R(-60,-10),r:R(3,7),l:R(.5,1.1)}));
      emit("m",rw[0],rw[1]-8,2,()=>({vx:back*R(10,50),vy:R(-50,-15),r:R(8,14),l:R(1.4,2.4)}));
      emit("f",ex[0],ex[1],3,()=>({vx:back*R(120,260),vy:R(-30,10),r:R(2,5),l:R(.15,.35)}));
      if(r.dir>0?r.x>W+200*r.s:r.x<-200*r.s){r.mode="gap";r.wait=1.4;SFX.engine(false);}}
    for(const q of P){q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.97;if(q.k==="e")q.vy+=90*dt;if(q.k==="m"){q.r+=14*dt;q.vy*=.98;}}
    P=P.filter(q=>q.t<q.l);
    for(const b of B){b.x+=b.vx*dt;b.y+=b.vy*dt;emit("f",b.x,b.y,2,()=>({vx:-b.vx*.05+R(-20,20),vy:-b.vy*.05+R(-20,20),r:R(2,4),l:R(.12,.25)}));
      if(b.bat&&b.bat.gh){const g=b.bat.gh;if(!b.hit&&!g.dead&&g.cy&&Math.hypot(b.x-g.x,b.y-g.cy)<40*g.s+12){b.hit=true;g.dead=true;g.dt=0;b.x=-999;SFX.wail();
        emit("e",g.x,g.cy,14,()=>({vx:R(-200,200),vy:R(-200,60),r:R(1,2.2),l:R(.4,.9)}));}}
      else if(b.bat){const bt=b.bat;if(!b.hit&&!bt.dead&&Math.hypot(b.x-bt.sx,b.y-bt.sy)<26){b.hit=true;bt.dead=true;bt.vy=-140;bt.rot=0;b.x=-999;SFX.squeak();
        emit("e",bt.sx,bt.sy,16,()=>({vx:R(-220,220),vy:R(-220,80),r:R(1,2.4),l:R(.4,.9)}));emit("f",bt.sx,bt.sy,8,()=>({vx:R(-80,80),vy:R(-120,0),r:R(3,6),l:R(.2,.4)}));}}
      else if(!b.hit&&Math.hypot(b.x-b.tx,b.y-b.ty)<46){b.hit=true;if(window.MASCOT)MASCOT.dodge();}}
    B=B.filter(b=>b.x>-60&&b.x<W+60&&b.y>-60&&b.y<H+60);
    if(run&&!document.hidden){ema+=(dt-ema)*.05;if(ema>.03)slowT+=dt;else slowT=Math.max(0,slowT-dt*.5);if(slowT>1.5&&!lowQ){lowQ=true;console.info("fire rider: lighter mode for this device");}}
    const r3=R3.on;ctx=ctxL;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    hauntDraw(dt,now/1000);inferno(dt,now/1000);const dk0=dark;dark=dark||hz>.4;
    for(const q of P)if(q.k==="m"){const f=q.t/q.l;ctx.fillStyle="rgba("+pal.sm+","+((dark?.22:.08)*(1-f)).toFixed(3)+")";ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,6.2832);ctx.fill();}
    if(run){const [gx,gy]=toW(0,-40),g=ctx.createRadialGradient(gx,gy,0,gx,gy,190*run.s);g.addColorStop(0,"rgba("+pal.g+","+(dark?.28:.16)+")");g.addColorStop(1,"rgba("+pal.g+",0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(gx,gy,190*run.s,0,6.2832);ctx.fill();}
    ctx=ctxM;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    if(run){if(run.mode==="bike"){if(r3)R3.bike(run);else bike();}else if(run.mode==="horse"){if(r3)R3.horse(run);else horse();chain();}}
    ctx.globalCompositeOperation=dark?"lighter":"source-over";
    for(const q of P){if(q.k==="m")continue;const f=q.t/q.l;
      if(q.k==="e"){ctx.strokeStyle="rgba("+pal.e+","+((1-f)*(.6+.4*Math.random())).toFixed(3)+")";ctx.lineWidth=q.r*.9;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x-q.vx*.035,q.y-q.vy*.035);ctx.stroke();continue;}
      const HS=fireSprites().heat,rr=q.r*1.9*(f<.2?.6+f*2:1.1-f*.6);ctx.globalAlpha=Math.pow(1-f,1.2)*(dark?.75:.6);ctx.drawImage(HS[Math.min(23,Math.floor(f*24))],q.x-rr,q.y-rr*1.2,rr*2,rr*2.4);ctx.globalAlpha=1;}
    for(const b of B){ctx.save();ctx.shadowColor="rgba("+pal.g+",1)";ctx.shadowBlur=12;ctx.lineCap="round";ctx.strokeStyle="rgba("+pal.f[0]+",1)";ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(b.x-b.vx*.03,b.y-b.vy*.03);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore();}
    water(dt);ctx.globalCompositeOperation="source-over";dark=dk0;R3.frame();
    if(hz>.3&&!lowQ){if(!GR){const g=document.createElement("canvas");g.width=g.height=160;const x=g.getContext("2d"),im=x.createImageData(160,160);
        for(let i=0;i<im.data.length;i+=4){const v=Math.random()*255|0;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=Math.random()<.5?40:0;}x.putImageData(im,0,0);GR=ctx.createPattern(g,"repeat");}
      ctx.save();ctx.globalAlpha=.35*hz;ctx.translate(-R(0,160),-R(0,160));ctx.fillStyle=GR;ctx.fillRect(0,0,W+160,H+160);ctx.restore();}
    /* cinematic zoom on the rider during the backflip and the rearing (all three layers, compositor only) */
    camZ+=((run&&run.zt||1)-camZ)*Math.min(1,dt*2.6);const zc=[cvL,cv,document.getElementById("rider3d"),GF.el,document.getElementById("jungle"),document.getElementById("jungleL")];
    /* v20: the trees zoom with the camera too (origin converted into each element's own box), so the fire stays on its tree */
    if(camZ>1.002&&run){const [zx,zy]=toW(0,-40);zc.forEach(c=>{if(c){if(!c.style.transform||!c._b)c._b=c.getBoundingClientRect();const ox=[zx-c._b.left,zy-c._b.top];
      c.style.transformOrigin=ox[0].toFixed(0)+"px "+ox[1].toFixed(0)+"px";c.style.transform="scale("+camZ.toFixed(4)+")";}});}
    else if(camZ<=1.002)zc.forEach(c=>{if(c&&c.style.transform)c.style.transform="";});
    if(!run&&!P.length&&!B.length&&!HW.length&&!STM.length&&hz<.01){hz=0;hs=null;document.querySelectorAll(".burning").forEach(e=>e.classList.remove("burning"));cancelAnimationFrame(raf);raf=0;ctx.clearRect(0,0,W,H);ctxL.clearRect(0,0,W,H);GF.clear();R3.frame();}}
  /* he comes only when summoned: the ghost button, the command palette, or finishing a quiz */
  document.addEventListener("quizdone",()=>{SFX.init();setTimeout(()=>{if(!reduce.matches)go();},900);});
  /* ghost button in the nav: a ghost floats out of it and the rider comes (glows while he rides) */
  const GH='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5c-4.4 0-7.5 3.4-7.5 7.8V21l2.5-1.8 2.5 1.8 2.5-1.8 2.5 1.8 2.5-1.8 2.5 1.8V10.3c0-4.4-3.1-7.8-7.5-7.8z"/><ellipse cx="9.3" cy="10.5" rx="1.5" ry="2" fill="var(--surface,#fff)"/><ellipse cx="14.7" cy="10.5" rx="1.5" ry="2" fill="var(--surface,#fff)"/></svg>';
  const POP='<svg viewBox="0 0 24 24"><path fill="#f8f7ff" stroke="#a78bfa" stroke-width=".8" d="M12 2.5c-4.4 0-7.5 3.4-7.5 7.8V21l2.5-1.8 2.5 1.8 2.5-1.8 2.5 1.8 2.5-1.8 2.5 1.8V10.3c0-4.4-3.1-7.8-7.5-7.8z"/><ellipse cx="9.3" cy="10.5" rx="1.5" ry="2" fill="#1e1b4b"/><ellipse cx="14.7" cy="10.5" rx="1.5" ry="2" fill="#1e1b4b"/><ellipse cx="12" cy="15" rx="1.4" ry="1.7" fill="#1e1b4b"/></svg>';
  const tb=document.getElementById("tocBtn");
  if(tb){const gb=document.createElement("button");gb.id="ghostBtn";gb.type="button";gb.title="Summon the fire rider";gb.setAttribute("aria-label","Summon the fire rider");gb.innerHTML=GH;tb.before(gb);gb.addEventListener("pointerenter",()=>R3.load(),{once:true});
    const sb=document.createElement("button");sb.id="sndBtn";sb.type="button";const sp=()=>{sb.textContent=SFX.on?"🔊":"🔇";sb.title="Sound: "+(SFX.on?"on":"off");sb.setAttribute("aria-label",sb.title);sb.setAttribute("aria-pressed",String(SFX.on));};
    sp();gb.before(sb);sb.addEventListener("click",()=>{SFX.init();SFX.set(!SFX.on);sp();});
    gb.addEventListener("click",()=>{const r=gb.getBoundingClientRect(),p=document.createElement("div");p.className="gh-pop";p.innerHTML=POP;
      p.style.left=(r.left+r.width/2)+"px";p.style.top=(r.top+r.height/2)+"px";document.body.appendChild(p);setTimeout(()=>p.remove(),2000);
      go();if(run){gb.classList.add("on");const t=setInterval(()=>{if(!run){gb.classList.remove("on");clearInterval(t);}},300);}});}
  window.RIDER3D=R3;  /* test hook: the 3D layer */
  return {go};
})();

/* ancient tree: a massive, gnarled trunk fills the mascot column (≥1200px) from the ground up to the mascot's branch and runs off the
   right screen edge. A big dark hollow opens at its base (exposed-wood rim), with a smaller side hollow and a knot hole higher up;
   grey-brown bark with deep vertical fissures and lighter ridges, moss patches, and dappled sunlight drifting over it by day. A few
   natural leafy limbs reach out to the left and a crown sits behind the mascot. Limbs sway from their joints; a leaf drifts down now and
   then; darker at night (owl hours). Seeded random, so the same tree every time; rebuilt when the column's height changes. */
(function(){
  const box=document.createElement("div");box.id="jungle";box.setAttribute("aria-hidden","true");document.body.appendChild(box);
  const wide=matchMedia("(min-width:1200px)"),reduce=matchMedia("(prefers-reduced-motion: reduce)");
  const isNight=()=>{const p=THM.phase()[0];return !(p==="early"||p==="day");};
  const f=n=>n.toFixed(1);
  let svg=null,tips=[],perches=[],seed=11;
  const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;},rr=(a,b)=>a+rnd()*(b-a);
  /* smooth path through points (quadratic curves through the midpoints) */
  const smooth=P=>{let d="M"+f(P[0][0])+" "+f(P[0][1]);for(let i=1;i<P.length-1;i++)d+=" Q"+f(P[i][0])+" "+f(P[i][1])+" "+f((P[i][0]+P[i+1][0])/2)+" "+f((P[i][1]+P[i+1][1])/2);
    return d+" L"+f(P[P.length-1][0])+" "+f(P[P.length-1][1]);};
  function limb(x0,y0,x1,y1,w0,w1,bend,cls){const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,a=-dy/l,b=dx/l,mx=(x0+x1)/2+a*bend,my=(y0+y1)/2+b*bend;
    return '<path class="'+cls+'" d="M'+f(x0+a*w0)+' '+f(y0+b*w0)+' Q'+f(mx+a*(w0+w1)/2)+' '+f(my+b*(w0+w1)/2)+' '+f(x1+a*w1)+' '+f(y1+b*w1)+' L'+f(x1-a*w1)+' '+f(y1-b*w1)+' Q'+f(mx-a*(w0+w1)/2)+' '+f(my-b*(w0+w1)/2)+' '+f(x0-a*w0)+' '+f(y0-b*w0)+'Z"/>';}
  /* a pointed, slightly asymmetric leaf (12.5 long) with a short stalk; shade picked by where it sits in its clump (sunlit on top) */
  const LEAF="M0 0 L1.6 0 C3.6 -3.6 8.6 -4.2 12.5 0 C8.4 3.6 3.6 3.2 1.6 0Z";
  const shade=v=>{const r=rnd();return v<-.35?(r<.45?4:3):v<.05?(r<.25?4:r<.7?3:2):v<.45?(r<.5?2:1):(r<.6?1:0);};
  function leaves(x,y,ang,n,spread){let s="";for(let i=0;i<n;i++){const a=ang+rr(-1.7,1.7),d=rr(1,spread),lx=x+Math.sin(a)*d,ly=y-Math.cos(a)*d,rot=a*57.3-90+rr(-30,30),k=rr(.7,1.1);
      s+='<path class="jl'+shade((ly-y)/spread)+'" transform="translate('+f(lx)+' '+f(ly)+') rotate('+f(rot)+') scale('+f(k)+')" d="'+LEAF+'"/>';}return s;}
  /* a foliage clump: dark masses give it volume, then leaves fan out in every direction, lighter on top and darker underneath */
  function clump(x,y,r){let s="";
    for(let i=0;i<5;i++){const a=rr(0,6.283),d=rr(0,r*.45);s+='<ellipse class="jl0" cx="'+f(x+Math.cos(a)*d)+'" cy="'+f(y+Math.sin(a)*d+r*.15)+'" rx="'+f(rr(.45,.7)*r)+'" ry="'+f(rr(.4,.6)*r)+'"/>';}
    const n=Math.round(r*3.2);
    for(let i=0;i<n;i++){const a=rr(0,6.283),d=Math.sqrt(rnd())*r,lx=x+Math.cos(a)*d,ly=y+Math.sin(a)*d*.85,k=rr(.65,1.05),
      rot=a*57.3+rr(-40,40);
      s+='<path class="jl'+shade((ly-y)/r)+'" transform="translate('+f(lx)+' '+f(ly)+') rotate('+f(rot)+') scale('+f(k)+')" d="'+LEAF+'"/>';}
    return s;}
  function branch(x,y,ang,len,w,depth,sway){
    if(x+Math.sin(ang)*len<32)len=Math.max(8,(x-32)/-Math.sin(ang));
    const x1=Math.min(186,x+Math.sin(ang)*len),y1=y-Math.cos(ang)*len,w1=Math.max(.5,w*.62);
    if(depth>=2&&w>1.6)perches.push([x+(x1-x)*.55,y+(y1-y)*.55-w*.4,w]);
    let s=sway?'<g class="jg-b" style="transform-origin:'+f(x)+'px '+f(y)+'px;animation-duration:'+f(rr(5,8))+'s;animation-delay:'+f(-rr(0,8))+'s">':"<g>";
    s+=limb(x,y,x1,y1,w,w1,rr(-len*.08,len*.08),"jg-wood");
    if(depth<=0||w1<.8){s+=clump(x1,y1,rr(9,13));tips.push([x1,y1]);return s+"</g>";}
    const kids=rnd()<.35?3:2;
    for(let i=0;i<kids;i++){const t=i===0?1:rr(.45,.85),bx=x+(x1-x)*t,by=y+(y1-y)*t,side=i===0?rr(-.25,.15):(i%2?-1:1)*rr(.45,.9)-.15;
      s+=branch(bx,by,ang+side,len*rr(.62,.8),i===0?w1:w1*.8,depth-1,depth>=3);}
    if(depth<=2)s+=leaves(x1,y1,ang,8,10);
    return s+"</g>";}
  /* the woodpecker, drawn facing left with its head at about (-5,-11) and its body inside the hole (the clip hides what is behind the
     bark). Its head jabs at the bark in two drumming bursts per 11 s cycle, and wood chips fly from the bill on every strike. */
  function woodpecker(){
    const T=[[30,7],[50,5]],K=["0%{transform:none}","12%{transform:rotate(9deg)}","15%{transform:rotate(-7deg)}","19%,26%{transform:none}"];
    const C=[[],[],[]];
    T.forEach(([at,n])=>{for(let i=0;i<n;i++){const p=at+i*1.1;K.push(f(p)+"%{transform:none}",f(p+.45)+"%{transform:translate(-2.4px,.6px) rotate(-12deg)}");
      C.forEach((c,j)=>c.push(f(p+.4)+"%{opacity:0;transform:translate(-20px,-9px)}",f(p+.5)+"%{opacity:1;transform:translate(-20px,-9px)}",
        f(p+1.6)+"%{opacity:0;transform:translate("+f(-24-j*3)+"px,"+f(-6+j*4)+"px) rotate("+(90+j*70)+"deg)}"));}
      K.push(f(at+n*1.1)+"%{transform:none}");});
    K.push("64%{transform:none}","67%,71%{transform:rotate(8deg)}","74%,100%{transform:none}");
    const css="@keyframes jg-wph{"+K.join("")+"}"+C.map((c,j)=>"@keyframes jg-chip"+j+"{0%{opacity:0}"+c.join("")+"100%{opacity:0}}#jungle .jg-chip.c"+j+"{animation:jg-chip"+j+" 11s linear infinite}").join("");
    return '<style>'+css+'</style><g class="jg-wp">'+
      '<path fill="#151413" d="M-4 -6 C2 -8 9 -2 9 6 C9 12 6 16 2 18 C-2 14 -5 6 -4 -6Z"/>'+
      '<path fill="#efebe2" d="M-1 -1 C2.5 -2 5.5 2.5 5.5 8 C3 9 0 6 -1 -1Z"/>'+
      '<g fill="#efebe2"><circle cx="4.5" cy="12" r=".8"/><circle cx="6.5" cy="10.5" r=".7"/><circle cx="3" cy="14.5" r=".7"/><circle cx="5.5" cy="14" r=".6"/></g>'+
      '<path fill="#e6dfd2" d="M-4 -5 C-9 -1 -10 7 -7 13 C-5 16 -1 18 2 18 C-2 12 -4 4 -4 -5Z"/>'+
      '<path d="M-8 4 C-7.5 8 -6.5 11 -5 13" stroke="#cfc5b4" stroke-width=".8" fill="none"/>'+
      '<g transform="translate(-3 -5)"><g class="jg-wph"><g transform="translate(3 5)">'+
        '<circle cx="-5" cy="-11" r="6.2" fill="#efebe2"/>'+
        '<path fill="#151413" d="M-11.4 -12 C-10.5 -18.4 -1.5 -19.4 1.2 -13 C-2 -15.6 -7.2 -15.4 -11.4 -12Z"/>'+
        '<path fill="#c8102e" d="M.4 -15.4 C2.4 -13.4 2.4 -10.4 .6 -9 C-.6 -10.8 -.6 -13.4 .4 -15.4Z"/>'+
        '<path fill="#151413" d="M-10.6 -9 C-6.5 -7.3 -2.6 -7.4 1 -10.4 L1.2 -8.4 C-.6 -5.6 -1.8 -3.4 -2.8 -1 L-4.2 -1.8 C-4.4 -4 -6.4 -6.2 -10.6 -7.8Z"/>'+
        '<circle cx="-7.2" cy="-12" r="1.35" fill="#1a0f08"/><circle cx="-7.6" cy="-12.4" r=".45" fill="#fff"/>'+
        '<path fill="#3a3836" d="M-10.8 -11.6 L-19.6 -10.6 L-10.8 -9.3Z"/><path d="M-10.8 -11.4 L-19 -10.6" stroke="#77736d" stroke-width=".4"/>'+
      '</g></g></g></g>'+
      '<g fill="#c99a63"><rect class="jg-chip c0" x="-.8" y="-.5" width="1.8" height="1"/><rect class="jg-chip c1" x="-.6" y="-.4" width="1.3" height=".9"/><rect class="jg-chip c2" x="-.7" y="-.5" width="1.5" height="1"/></g>';}
  function build(){
    if(!wide.matches){box.innerHTML="";svg=null;return;}
    seed=11;tips=[];perches=[];
    const Ht=Math.max(460,box.clientHeight||innerHeight-56),tY=118,span=Ht-tY;
    /* left edge of the trunk, bottom → top: wide flared base narrowing upwards, with gnarled bulges */
    const edge=u=>{const base=118-80*Math.pow(1-u,1.8),flare=u<.08?-28*Math.pow((.08-u)/.08,2):0;
      return base+flare+7*Math.sin(u*9+1)+4*Math.sin(u*23)+(u>.55&&u<.7?-8*Math.sin((u-.55)/.15*Math.PI):0);};
    edgeAt=y=>edge((Ht-y)/span);
    trunkR=[];for(let i=0;i<=9;i++){const u=i/9*.88;trunkR.push([edge(u)+18,Ht-span*u-8]);}
    const L=[];for(let i=0;i<=60;i++){const u=i/60;L.push([edge(u),Ht-span*u]);}
    const trunkD=smooth(L)+" L 200 "+f(tY-12)+" L 200 "+(Ht+4)+" L "+f(L[0][0])+" "+(Ht+4)+" Z";
    const hy=Ht-150,hx0=72,hx1=146;
    let s='<svg viewBox="0 0 190 '+Ht+'" width="190" height="'+Ht+'"><defs>'+
      '<linearGradient id="jgBark" x1="0" x2="1"><stop offset="0" class="jb0"/><stop offset=".35" class="jb1"/><stop offset=".7" class="jb3"/><stop offset="1" class="jb2"/></linearGradient>'+
      '<linearGradient id="jgShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".25" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>'+
      '<radialGradient id="jgHole" cx=".5" cy=".7" r=".7"><stop offset="0" stop-color="#050302"/><stop offset=".7" stop-color="#140c07"/><stop offset="1" stop-color="#2b1b10"/></radialGradient>'+
      '<radialGradient id="jgMoss"><stop offset="0" class="jm0"/><stop offset="1" class="jm1"/></radialGradient>'+
      '<filter id="jgBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>'+
      /* bark texture: stretched noise makes long vertical furrows (dark) and plates (light) */
      '<filter id="jgTexD" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".32 .016" numOctaves="4" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 .05 0 0 0 0 .03 0 0 0 0 .02 3.4 0 0 0 -1.75"/></filter>'+
      '<filter id="jgTexL" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".5 .03" numOctaves="3" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 .93 0 0 0 0 .88 0 0 0 0 .78 -3 0 0 0 1.38"/></filter>'+
      '<linearGradient id="jgHoleIn" x1="0" x2="1"><stop offset=".3" stop-color="#050302" stop-opacity="0"/><stop offset="1" stop-color="#050302" stop-opacity=".92"/></linearGradient>'+
      '<clipPath id="jgWpc"><ellipse rx="13" ry="18.5"/><rect x="-60" y="-60" width="58" height="120"/></clipPath>'+
      '<clipPath id="jgClip"><path d="'+trunkD+'"/></clipPath></defs>';
    /* leafy limbs behind the trunk, reaching left from its upper part */
    let limbs="";
    [[.5,-1.05,58,5,4],[.62,-.85,50,4.4,4],[.74,-1.2,46,4,3],[.86,-.95,40,3.6,3],[.38,-1.25,44,4.2,3]].forEach(([u,a,len,w,d])=>{
      const y=Ht-span*u,x=edge(u)+6;limbs+=branch(x,y,a,len,w,d,true);});
    s+=limbs;
    /* trunk body, shading and texture (all clipped to the trunk) */
    s+='<path class="jg-trunk" d="'+trunkD+'"/><g clip-path="url(#jgClip)">';
    for(let i=0;i<34;i++){const x=rr(6,200),y0=rr(tY,Ht),len=rr(60,240),w=rr(.8,2.6),b=rr(-8,8);
      s+='<path class="jg-fis" style="stroke-width:'+f(w)+'" d="M'+f(x)+' '+f(y0)+' c '+f(b)+' '+f(-len*.3)+', '+f(-b)+' '+f(-len*.7)+', '+f(b*.5)+' '+f(-len)+'"/>'+
        '<path class="jg-rid" d="M'+f(x+w+1.2)+' '+f(y0-4)+' c '+f(b)+' '+f(-len*.3)+', '+f(-b)+' '+f(-len*.6)+', '+f(b*.5)+' '+f(-len*.85)+'"/>';}
    for(const [u,x,rx,ry] of [[.66,40,30,46],[.42,58,24,36],[.2,30,26,40],[.85,120,30,26],[.55,150,18,30]])s+='<ellipse cx="'+x+'" cy="'+f(Ht-span*u)+'" rx="'+rx+'" ry="'+ry+'" fill="url(#jgMoss)"/>';
    s+='<g class="jg-sun" filter="url(#jgBlur)">';for(let i=0;i<7;i++)s+='<ellipse cx="'+f(rr(60,190))+'" cy="'+f(rr(tY+40,Ht-60))+'" rx="'+f(rr(10,22))+'" ry="'+f(rr(16,40))+'" style="animation-delay:'+f(-rr(0,9))+'s"/>';s+="</g>";
    const tex='x="0" y="'+(tY-20)+'" width="200" height="'+(span+30)+'"';
    s+='<rect '+tex+' filter="url(#jgTexD)"/><rect class="jg-texl" '+tex+' filter="url(#jgTexL)"/>';
    /* roundness: a soft shadow follows the trunk's left edge, a faint highlight runs just inside it */
    const ed=smooth(L);
    s+='<path d="'+ed+'" stroke="#000" stroke-opacity=".5" stroke-width="30" fill="none" filter="url(#jgBlur)"/>'+
      '<path d="'+ed+'" transform="translate(34 0)" stroke="#fff" stroke-opacity=".08" stroke-width="22" fill="none" filter="url(#jgBlur)"/>';
    s+='<rect '+tex+' fill="url(#jgShade)"/></g>';
    /* knot hole higher up, with a great spotted woodpecker living in it */
    const ky=Ht-span*.6,kx=edge(.6)+54;
    s+='<g transform="translate('+f(kx)+' '+f(ky)+') scale(1.25)"><ellipse rx="17" ry="23" class="jg-rim"/><ellipse cx="-1" cy="-1" rx="15" ry="21" fill="none" stroke="var(--jfis)" stroke-width="2"/>'+
      '<ellipse rx="13" ry="18.5" fill="url(#jgHole)"/><g clip-path="url(#jgWpc)">'+woodpecker()+'<ellipse rx="13" ry="18.5" fill="url(#jgHoleIn)"/></g>'+
      '<path d="M-13 6 C-12 13 -7 18 0 18.5" stroke="var(--jwd)" stroke-width="1.6" fill="none" opacity=".55"/></g>';
    /* small side hollow */
    const sx=edge(.22)+22,sy=Ht-span*.22;s+='<path d="M'+f(sx)+' '+f(sy+34)+' Q'+f(sx-8)+' '+f(sy)+' '+f(sx+4)+' '+f(sy-32)+' Q'+f(sx+16)+' '+f(sy)+' '+f(sx+12)+' '+f(sy+34)+'Z" fill="url(#jgHole)"/>';
    /* the big hollow at the base, with exposed orange wood along its left rim */
    const H0='M'+hx0+' '+(Ht+2)+' C '+(hx0-2)+' '+(Ht-50)+', '+(hx0+2)+' '+(hy+30)+', '+(hx0+18)+' '+(hy+6)+' C '+(hx0+30)+' '+(hy-12)+', '+(hx1-24)+' '+(hy-6)+', '+(hx1-12)+' '+(hy+22)+' C '+(hx1-2)+' '+(hy+50)+', '+(hx1+2)+' '+(Ht-40)+', '+hx1+' '+(Ht+2)+' Z';
    s+='<path d="'+H0+'" class="jg-rim" transform="translate(-3 -4) scale(1.0)"/><path d="'+H0+'" fill="url(#jgHole)"/>'+
      '<path class="jg-wd" d="M'+(hx0+1)+' '+(Ht-6)+' C '+(hx0-1)+' '+(Ht-50)+', '+(hx0+3)+' '+(hy+30)+', '+(hx0+18)+' '+(hy+7)+'"/>';
    /* top crown behind the mascot's branch */
    s+=clump(edge(1)+46,tY-6,24)+clump(edge(1)+10,tY+14,20)+clump(176,tY-14,22);
    s+=branch(edge(1)+20,tY+40,-.6,36,4,3,true)+branch(edge(1)+40,tY+24,-.1,24,3.4,2,true)+branch(edge(1)+8,tY+70,-1.15,44,3.8,4,true);
    /* ground: earth and grass */
    s+='<rect x="0" y="'+(Ht-5)+'" width="190" height="6" class="jg-earth"/>';
    for(let i=0;i<16;i++){const x=rr(0,190);if(x>hx0-4&&x<hx1+4)continue;s+='<path class="jg-grass" style="animation-delay:'+f(-rr(0,4))+'s;transform-origin:'+f(x)+'px '+Ht+'px" d="M'+f(x)+' '+Ht+' q -2 -7 -5 -11 M'+f(x)+' '+Ht+' q 1 -9 2 -14 M'+f(x)+' '+Ht+' q 3 -6 7 -8"/>';}
    box.innerHTML=s+"</svg>";svg=$("svg",box);layerize(box);mode();spawn(TB);}
  function mode(){const n=isNight();box.classList.toggle("night",n);boxL.classList.toggle("night",n);if(WILD.night!==n){WILD.night=n;TR.forEach(spawn);}}
  /* motion v9: everything that moves is lifted out of the big tree SVG into its own small SVG layer (a swaying limb, the woodpecker's
     hollow, the sun dapple). The browser paints each layer once and the compositor only rotates / fades it, so the bark textures and
     thousands of leaves are never repainted per frame. Ancestor groups (clips, transforms) are copied as empty shells around the part. */
  const NS="http://www.w3.org/2000/svg";
  function layerize(host){const base=$("svg",host);if(!base)return;
    /* phase 1: pick the parts and read all their rectangles at once (a single layout instead of one per layer) */
    const jobs=[];
    $$(".jg-b",base).filter(g=>!g.parentNode.closest(".jg-b")).forEach(g=>{const o=(g.style.transformOrigin||"").match(/-?\d+(?:\.\d+)?/g);
      jobs.push({el:g,cls:"jg-b",origin:o&&o.length>1?[+o[0],+o[1]]:null,dur:g.style.animationDuration,del:g.style.animationDelay});});
    $$(".jg-wp",base).forEach(wp=>{let top=wp;while(top.parentNode&&top.parentNode!==base)top=top.parentNode;jobs.push({el:top,cls:"jg-wpL"});});
    $$(".jg-sun",base).forEach(g=>jobs.push({el:g,cls:"jg-sunL"}));
    const hr=host.getBoundingClientRect(),br=base.getBoundingClientRect(),bx=br.left-hr.left,by=br.top-hr.top;
    jobs.forEach(j=>j.r=j.el.getBoundingClientRect());
    /* phase 2: write */
    const frag=document.createDocumentFragment();
    for(const j of jobs){const r=j.r,el=j.el;if(!r.width&&!r.height)continue;const m=34,x0=r.left-br.left-m,y0=r.top-br.top-m,w=r.width+2*m,h=r.height+2*m;
      const L=document.createElementNS(NS,"svg");L.setAttribute("viewBox",[x0,y0,w,h].map(v=>v.toFixed(1)).join(" "));L.setAttribute("width",w.toFixed(1));L.setAttribute("height",h.toFixed(1));
      L.setAttribute("class","jg-layer "+j.cls);L.style.cssText="left:"+(bx+x0).toFixed(1)+"px;top:"+(by+y0).toFixed(1)+"px;right:auto;bottom:auto";
      if(j.origin)L.style.transformOrigin=(j.origin[0]-x0).toFixed(1)+"px "+(j.origin[1]-y0).toFixed(1)+"px";
      if(j.cls==="jg-b"){L.style.animationDuration=j.dur;L.style.animationDelay=j.del;el.classList.remove("jg-b");el.removeAttribute("style");$$(".jg-b",el).forEach(x=>{x.classList.remove("jg-b");x.removeAttribute("style");});}
      const chain=[];for(let a=el.parentNode;a&&a!==base;a=a.parentNode)chain.unshift(a);
      let p=L;for(const a of chain){const sh=a.cloneNode(false);p.appendChild(sh);p=sh;}p.appendChild(el);frag.appendChild(L);}
    host.appendChild(frag);}
  /* the second tree, bottom left (≥1500px, right of the sidebar, behind the content): a natural broadleaf tree with a leaning, tapered
     trunk (root flare, bark texture, edge shadow) that forks into limbs carrying shaded leaf clumps under a full crown. Same seeded
     helpers as the big tree; its limb points (TREE.perchesL) are where the bird hides when the fire rider shoots at it. */
  const boxL=document.createElement("div");boxL.id="jungleL";boxL.setAttribute("aria-hidden","true");document.body.appendChild(boxL);
  const wideL=matchMedia("(min-width:1500px)");let svgL=null,perchL=[];
  function buildL(){
    if(!wideL.matches){boxL.innerHTML="";svgL=null;perchL=[];return;}
    const t0=tips,p0=perches;tips=[];perches=[];seed=29;
    const Ht=Math.max(380,boxL.clientHeight||innerHeight*.8),fy=Ht*.52,cx=96;
    const half=u=>12-4.5*u+(u<.1?15*Math.pow((.1-u)/.1,2):0),lean=u=>7*Math.sin(u*2.4);
    const Lp=[],Rp=[];for(let i=0;i<=24;i++){const u=i/24,y=Ht+2-(Ht+2-fy)*u;Lp.push([cx+lean(u)-half(u),y]);Rp.push([cx+lean(u)+half(u),y]);}
    const trunk=smooth(Lp)+" L"+smooth(Rp.reverse()).slice(1)+"Z",fx=cx+lean(1);
    let s='<svg viewBox="0 0 200 '+Ht+'" width="200" height="'+Ht+'"><defs>'+
      '<linearGradient id="jgBarkL" x1="0" x2="1"><stop offset="0" class="jb0"/><stop offset=".35" class="jb1"/><stop offset=".7" class="jb3"/><stop offset="1" class="jb2"/></linearGradient>'+
      '<filter id="jgTexDL" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".5 .03" numOctaves="4" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 .05 0 0 0 0 .03 0 0 0 0 .02 3.4 0 0 0 -1.75"/></filter>'+
      '<filter id="jgBlurL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>'+
      '<clipPath id="jgClipL"><path d="'+trunk+'"/></clipPath></defs>';
    /* back of the crown, then the trunk, then limbs with their clumps in front */
    for(let i=0;i<9;i++)s+=clump(fx+rr(-60,60),fy-Ht*rr(.2,.4),rr(20,30));
    s+='<path d="'+trunk+'" fill="url(#jgBarkL)"/><g clip-path="url(#jgClipL)"><rect x="0" y="'+f(fy-10)+'" width="200" height="'+f(Ht-fy+14)+'" filter="url(#jgTexDL)"/>'+
      '<path d="'+smooth(Lp)+'" stroke="#000" stroke-opacity=".45" stroke-width="12" fill="none" filter="url(#jgBlurL)"/></g>';
    s+=branch(fx-3,fy+4,-.8,Ht*.17,6.5,4,false)+branch(fx,fy,-.12,Ht*.2,7,4,false)+branch(fx+3,fy+4,.62,Ht*.17,6.5,4,false)+
      branch(fx-5,fy+Ht*.09,-1.2,Ht*.12,4.6,3,true)+branch(fx+5,fy+Ht*.11,1.15,Ht*.11,4.4,3,true);
    s+=clump(fx-30,fy-Ht*.36,22)+clump(fx+30,fy-Ht*.37,22)+clump(fx,fy-Ht*.43,24);
    s+='<rect x="0" y="'+(Ht-4)+'" width="200" height="6" class="jg-earth"/>';
    for(let i=0;i<14;i++){const x=rr(10,190);s+='<path class="jg-grass" style="animation-delay:'+f(-rr(0,4))+'s;transform-origin:'+f(x)+'px '+Ht+'px" d="M'+f(x)+' '+Ht+' q -2 -7 -5 -11 M'+f(x)+' '+Ht+' q 1 -9 2 -14 M'+f(x)+' '+Ht+' q 3 -6 7 -8"/>';}
    boxL.innerHTML=s+"</svg>";svgL=$("svg",boxL);layerize(boxL);perchL=perches.filter(([x,y])=>y>40);tipL=tips.slice();
    trunkL=[];for(let i=0;i<=6;i++){const u=i/6*.95;trunkL.push([cx+lean(u),Ht-(Ht-fy)*u-6]);}tips=t0;perches=p0;mode();spawn(TL);}
  let rtL=0,lastHL=-1;new ResizeObserver(()=>{const hh=boxL.clientHeight;if(lastHL<0){lastHL=hh;return;}if(hh===lastHL)return;lastHL=hh;clearTimeout(rtL);rtL=setTimeout(buildL,120);}).observe(boxL);
  wideL.addEventListener("change",buildL);
  /* a leaf drifts down from a twig now and then */
  setInterval(()=>{if(!svg||document.hidden||reduce.matches||!tips.length)return;const [x,y]=tips[Math.floor(Math.random()*tips.length)];
    const hr=box.getBoundingClientRect(),br=svg.getBoundingClientRect(),l=document.createElementNS(NS,"svg");
    l.setAttribute("viewBox","0 -4 10 8");l.setAttribute("width","10");l.setAttribute("height","8");l.setAttribute("class","jg-layer jg-flL");
    l.style.cssText="left:"+f(br.left-hr.left+x)+"px;top:"+f(br.top-hr.top+y-4)+"px;right:auto;bottom:auto";
    l.innerHTML='<path class="jl'+(1+Math.floor(Math.random()*2))+'" d="M0 0 Q4.5 -3.2 10 0 Q4.5 3.2 0 0Z"/>';box.appendChild(l);setTimeout(()=>l.remove(),7000);},5200);
  let rt=0,lastH=-1;new ResizeObserver(()=>{const hh=box.clientHeight;if(lastH<0){lastH=hh;return;}if(hh===lastH)return;lastH=hh;clearTimeout(rt);rt=setTimeout(build,120);}).observe(box);
  wide.addEventListener("change",build);document.addEventListener("themechange",mode);setInterval(mode,60000);
  /* tree wildlife (2026-10-21): small songbirds by day (house sparrow, great tit, blue tit, chaffinch) and bats by night sit on the
     limbs of both trees. Each animal is a tiny SVG in a zero-size <div> on top of the tree's layers (.cr-host): hops, turns, flights
     and the bats' hanging sway are transforms on HTML elements, so only the compositor works; a peck, preen, tail flick or wing
     stretch repaints just that small SVG. One 800 ms tick picks idle actions (skipped while the tab is hidden, under reduced motion or
     with the background animation off). Birds fly a bounding arc to a free limb, bats drop and flutter an erratic loop, then hang. */
  const SPC=[
    {n:"sparrow",back:"#8b5d38",wing:"#6a4226",bar:"#e6d6b8",belly:"#d4c9b7",cheek:"#dcd6ca",cap:"#7f858a",bib:"#1d1a19",tail:"#56391f",bill:"#2a2521",leg:"#a47e5e",
      hx:'<path fill="#7a4a28" d="M-6.6 -17.4 C-3.6 -18.2 -2.2 -15.6 -2.6 -12.6 C-3.6 -14.2 -5 -15.6 -6.6 -15.6Z"/>'},
    {n:"great tit",back:"#7d8b3d",wing:"#56687b",bar:"#eef3f6",belly:"#f1d336",cheek:"#f7f7f4",cap:"#151515",bib:"#151515",tail:"#4b5a6a",bill:"#151515",leg:"#6b7480",
      x:'<path fill="#151515" d="M-6.6 -9.8 C-5.8 -7 -4.6 -4.4 -2.8 -1.8 L-1.2 -2 C-2.6 -4.6 -3.6 -7.2 -4.2 -10Z"/>'},
    {n:"blue tit",k:.88,back:"#8fae4c",wing:"#3f80cf",bar:"#f2f7ff",belly:"#f2da45",cheek:"#fbfbfa",cap:"#3a7fdc",bib:"#1e2c4a",tail:"#3a70bd",bill:"#222",leg:"#6f7b8f",
      hx:'<path fill="#1e2c4a" d="M-12 -15.9 L-3.2 -15.3 L-3.2 -14 L-11.6 -14.7Z M-3.2 -15.3 C-2.6 -13 -3 -11.4 -4.4 -10.4 L-4.6 -12Z"/>'},
    {n:"chaffinch",back:"#86613f",wing:"#26221f",bar:"#f3efe6",belly:"#d98d6b",cheek:"#d98d6b",cap:"#6f8299",bib:"#d98d6b",tail:"#2c2825",bill:"#a4abb3",leg:"#8a7466"}];
  /* a part that rotates about (x,y): the CSS animation turns the middle group, the outer/inner groups move the pivot to the origin */
  const piv=(c,x,y,inner)=>'<g transform="translate('+x+' '+y+')"><g class="'+c+'"><g transform="translate('+(-x)+' '+(-y)+')">'+inner+'</g></g></g>';
  const BODY="M-7.4 -12 C-9.4 -7 -6.4 -1.8 0 -1.4 C5.2 -1.4 9 -4.6 8.2 -8.8 C7.4 -12.8 2.6 -15 -1.6 -15 C-4.8 -15 -6.6 -14 -7.4 -12Z";
  /* songbird facing left, feet at (0,0); folded wing at rest, two spread wings (beating) in flight */
  function birdSvg(c){const k=c.k||1,
      wing=(cls,dark)=>piv(cls,-1,-11,'<path fill="'+c.wing+'" d="M-1 -11 C1 -19 8 -24.5 15.5 -24 C13 -21.5 13.5 -20 11.5 -18.4 C11 -16.6 9 -15.4 7.5 -14 C5.5 -12 3 -10.4 1.6 -9.4Z"/>'+
        '<path d="M1 -12 C4 -17 9 -21 14 -22.6 M2.6 -11 C5.6 -14.6 8.6 -17 12 -18.6" stroke="'+c.bar+'" stroke-width=".6" fill="none" opacity=".7"/>'+
        (dark?'<path fill="#000" opacity=".3" d="M-1 -11 C1 -19 8 -24.5 15.5 -24 C13 -21.5 13.5 -20 11.5 -18.4 C11 -16.6 9 -15.4 7.5 -14 C5.5 -12 3 -10.4 1.6 -9.4Z"/>':""));
    return '<svg class="cr-s" viewBox="0 0 40 32" width="'+f(40*k)+'" height="'+f(32*k)+'" style="left:'+f(-20*k)+'px;top:'+f(-26*k)+'px"><g transform="translate(20 26)">'+
      '<g class="cr-wo">'+wing("cr-wn cr-wb",1)+'</g>'+
      piv("cr-tail",5,-7,'<path fill="'+c.tail+'" d="M4.6 -8.8 L18.6 -3.6 C19.4 -3 19.4 -1.8 18.4 -1.4 L4.4 -4.4Z"/><path d="M6 -6.6 L17.8 -2.6" stroke="#000" stroke-opacity=".25" stroke-width=".5"/>')+
      '<path class="cr-leg" d="M-1.2 -2.2 L-1.8 0 M1.4 -2.2 L1.6 0 M-3.8 .1 L1 .1 M-.6 .1 L3.6 .1" stroke="'+c.leg+'" stroke-width=".75" stroke-linecap="round" fill="none"/>'+
      '<path fill="'+c.back+'" d="'+BODY+'"/><path fill="'+c.belly+'" d="M-7.3 -11.2 C-8.4 -6.2 -5.2 -1.9 0 -1.5 C3.4 -1.5 5.8 -3 6.4 -5.2 C2.4 -6.4 -3 -8.2 -7.3 -11.2Z"/>'+(c.x||"")+
      '<path fill="url(#crVol)" d="'+BODY+'"/>'+
      '<g class="cr-wf"><path fill="'+c.wing+'" d="M-3.6 -12.8 C1 -14.6 7.6 -12.4 11.8 -6.4 C7.6 -5.6 1.4 -6.6 -2.2 -9Z"/>'+
        '<path d="M-.4 -11.8 C3 -11.6 6.2 -9.9 8.8 -7.3 M1 -9.9 C3.8 -9.5 6.4 -8.2 8.9 -6.5" stroke="'+c.bar+'" stroke-width=".65" fill="none"/>'+
        '<path d="M2 -12.6 C4.6 -12 7 -10.6 9.4 -8.4" stroke="#000" stroke-opacity=".28" stroke-width=".5" fill="none"/></g>'+
      piv("cr-head",-4.4,-11.6,'<circle cx="-7.2" cy="-14.8" r="4.8" fill="'+c.cheek+'"/>'+
        '<path fill="'+c.cap+'" d="M-11.8 -15.4 C-11.4 -20.6 -3.2 -21.2 -2.6 -15.4 C-5 -17 -9.2 -17 -11.8 -15.4Z"/>'+(c.hx||"")+
        '<path fill="'+c.bib+'" d="M-10.8 -12.6 C-9.4 -10 -7 -8.8 -4.4 -9.2 L-4.8 -12 C-6.8 -12.4 -8.8 -12.6 -10.8 -12.6Z"/>'+
        '<circle cx="-8.8" cy="-15.6" r="1.05" fill="#0b0705"/><circle cx="-9.1" cy="-15.95" r=".35" fill="#fff"/>'+
        '<path fill="'+c.bill+'" d="M-11.6 -15.4 L-15.2 -14.3 L-11.4 -13.2Z"/><path d="M-11.6 -14.3 L-14.6 -14.3" stroke="#000" stroke-opacity=".35" stroke-width=".35"/>'+
        '<circle cx="-7.2" cy="-14.8" r="4.8" fill="url(#crVol)" opacity=".7"/>')+
      '<g class="cr-wo">'+wing("cr-wn",0)+'</g></g></svg>';}
  /* bat hanging head-down from the limb's underside (feet at (0,0)): wings wrapped round the body, ears pointing down, eye shine, a moonlit
     rim; one wing unfolds for a stretch. In flight the second group shows it the right way up with both wings beating. */
  function batSvg(){const M="#2b2024",F="#5b4134",H="#4a362c",B="#6b5550",
      wingF=s=>'<g transform="scale('+s+' 1)">'+piv("cr-bw",-2,8,'<path fill="'+M+'" d="M-2 7 C-6 2.6 -12 1.6 -17 3.6 L-15.4 7.8 L-12.6 6.6 L-11.4 11.2 L-7.8 9.4 L-5 13 C-4 11 -3 9.6 -2 10Z"/>'+
        '<path d="M-2.6 7.4 L-16.4 4 M-4 8.4 L-12.4 7 M-4 9.4 L-11.2 10.8 M-3.6 10.4 L-7.6 9.8" stroke="'+B+'" stroke-width=".45" fill="none"/>')+'</g>';
    return '<svg class="cr-s" viewBox="0 0 40 34" width="40" height="34"><g transform="translate(20 4)"><g class="cr-hang">'+
      '<path d="M-1.6 0 C-1.8 1.2 -1.4 2.4 -1 3.4 M1.6 0 C1.8 1.2 1.4 2.4 1 3.4" stroke="#1a1214" stroke-width=".8" fill="none" stroke-linecap="round"/>'+
      piv("cr-ws",-4,6,'<path fill="'+M+'" d="M-4 5 L-15 3 L-13.6 8 L-10.4 7 L-11 12.6 L-7.4 10.6 L-5.2 15Z"/><path d="M-4 5.6 L-14.6 3.4 M-4.4 7.4 L-10.6 7.2 M-4.6 9.4 L-10.6 12.2" stroke="'+B+'" stroke-width=".45" fill="none"/>')+
      '<path fill="'+M+'" d="M-5 3 C-7.2 8 -6.8 14.6 -3.2 18.8 C-1.2 20.4 1.2 20.4 3.2 18.8 C6.8 14.6 7.2 8 5 3 C2 1.6 -2 1.6 -5 3Z"/>'+
      '<path fill="'+F+'" d="M-2.2 5.6 C-3 9.6 -2.2 13.8 0 15.6 C2.2 13.8 3 9.6 2.2 5.6 C.8 5 -.8 5 -2.2 5.6Z"/>'+
      '<path d="M-4.6 4.6 C-5.4 9.6 -4.4 14.6 -2 18 M4.6 4.6 C5.4 9.6 4.4 14.6 2 18" stroke="'+B+'" stroke-width=".5" fill="none"/>'+
      '<path class="cr-rim" d="M-5 3 C-7.2 8 -6.8 14.6 -3.2 18.8"/>'+
      piv("cr-head",0,17,'<path fill="'+H+'" d="M-2.6 21.6 L-3.8 26.4 L-.9 23Z M2.6 21.6 L3.8 26.4 L.9 23Z"/><ellipse cx="0" cy="20.4" rx="3.1" ry="2.9" fill="'+H+'"/>'+
        '<ellipse cx="0" cy="18.9" rx=".9" ry=".6" fill="#22160f"/><circle class="cr-eye" cx="-1.2" cy="21.1" r=".55"/><circle class="cr-eye" cx="1.2" cy="21.1" r=".55"/>')+
      '</g><g class="cr-bf">'+wingF(1)+wingF(-1)+
      '<ellipse cx="0" cy="10" rx="2.8" ry="5.2" fill="'+M+'"/><ellipse cx="0" cy="9.4" rx="1.8" ry="3.6" fill="'+F+'"/>'+
      '<path fill="'+H+'" d="M-2.4 4.4 L-3.2 .2 L-.8 3.2Z M2.4 4.4 L3.2 .2 L.8 3.2Z"/><circle cx="0" cy="5" r="2.6" fill="'+H+'"/>'+
      '<circle class="cr-eye" cx="-1" cy="4.6" r=".5"/><circle class="cr-eye" cx="1" cy="4.6" r=".5"/></g></g></svg>';}
  { const d=document.createElementNS(NS,"svg");d.setAttribute("aria-hidden","true");d.style.cssText="position:absolute;width:0;height:0;overflow:hidden";
    d.innerHTML='<defs><radialGradient id="crVol" cx=".38" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient></defs>';
    document.body.appendChild(d);}
  /* the two trees: where their limbs are (svg coordinates), which limb points are visible, how many animals and where they may fly */
  const TB={box,nd:4,nb:3,P:()=>perches,ok:([x,y])=>y>200&&y<TB.svgH-50&&x>14&&edgeAt&&x<edgeAt(y)-8,top:176},
        TL={box:boxL,nd:2,nb:2,P:()=>perchL,ok:([x,y])=>y+TL.oy>50&&y+TL.oy<TL.h-40&&x>12&&x<188,top:30},TR=[TB,TL];
  let edgeAt=null,trunkR=[],trunkL=[],tipL=[];const WILD={list:[],night:null};
  const spot=(c,p)=>[c.T.ox+p[0],c.T.oy+p[1]+(c.bat?(p[2]||3)*1.15:-(p[2]||3)*.25)];
  function put(c,p){c.p=p;c.at=spot(c,p);c.el.style.left=f(c.at[0])+"px";c.el.style.top=f(c.at[1])+"px";}
  function spawn(T){WILD.list=WILD.list.filter(c=>{if(c.T!==T)return true;c.el.remove();return false;});
    if(T.host)T.host.remove();T.host=null;const base=$("svg",T.box);if(!base)return;
    const hr=T.box.getBoundingClientRect(),br=base.getBoundingClientRect();T.ox=br.left-hr.left;T.oy=br.top-hr.top;T.w=T.box.clientWidth;T.h=T.box.clientHeight;T.svgH=br.height;
    T.host=document.createElement("div");T.host.className="cr-host";T.box.appendChild(T.host);
    const night=isNight(),n=night?T.nb:T.nd,P=T.P().filter(T.ok).sort(()=>Math.random()-.5),pick=[];
    for(const p of P){if(pick.length>=n)break;if(pick.every(q=>Math.hypot(q[0]-p[0],q[1]-p[1])>26))pick.push(p);}
    for(const p of pick){const c={T,bat:night};c.el=document.createElement("div");c.el.className="cr "+(night?"cr-bat":"cr-bird");
      c.el.innerHTML='<div class="cr-f">'+(night?batSvg():birdSvg(SPC[Math.floor(Math.random()*SPC.length)]))+'</div>';
      if(!night&&Math.random()<.5)c.el.classList.add("r");put(c,p);T.host.appendChild(c.el);WILD.list.push(c);}}
  function act(c,k,ms){c.busy=1;c.el.classList.add(k);setTimeout(()=>{c.el.classList.remove(k);c.busy=0;},ms);}
  function hop(c){c.busy=1;if(Math.random()<.5)setTimeout(()=>c.el.classList.toggle("r"),140);
    c.el.animate([{transform:"none"},{transform:"translateY(-4px)",offset:.45},{transform:"none"}],{duration:300,easing:"ease-out"}).onfinish=()=>{c.busy=0;};}
  const free=c=>c.T.P().filter(c.T.ok).filter(p=>WILD.list.every(o=>o===c||o.T!==c.T||Math.hypot(o.p[0]-p[0],o.p[1]-p[1])>24));
  const clampX=(T,x)=>Math.max(14,Math.min(T.w-14,x)),rand=(a,b)=>a+Math.random()*(b-a);
  /* Catmull-Rom points through K, n per segment */
  const spline=(K,n)=>{const o=[];for(let i=0;i<K.length-1;i++){const p0=K[Math.max(0,i-1)],p1=K[i],p2=K[i+1],p3=K[Math.min(K.length-1,i+2)];
    for(let j=1;j<=n;j++){const t=j/n,t2=t*t,t3=t2*t;o.push([0,1].map(k=>.5*(2*p1[k]+(p2[k]-p0[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(3*p1[k]-p0[k]-3*p2[k]+p3[k])*t3)));}}return o;};
  function travel(c,pts,dur,p,ease){const [x0,y0]=c.at;c.busy=1;c.p=p;c.el.classList.add("fly");
    c.el.animate([{transform:"none"}].concat(pts.map(([x,y])=>({transform:"translate("+f(x-x0)+"px,"+f(y-y0)+"px)"}))),{duration:dur,easing:ease}).onfinish=()=>{
      if(!WILD.list.includes(c))return;put(c,p);c.el.classList.remove("fly");c.busy=0;if(!c.bat)act(c,"flick",450);};}
  function flyBird(c){const [x0,y0]=c.at,D=free(c).filter(p=>{const d=Math.hypot(c.T.ox+p[0]-x0,c.T.oy+p[1]-y0);return d>28&&d<170;});if(!D.length)return;
    const p=D[Math.floor(Math.random()*D.length)],[x1,y1]=spot(c,p),d=Math.hypot(x1-x0,y1-y0),mx=(x0+x1)/2,my=Math.min(y0,y1)-18-d*.3,pts=[];
    for(let i=1;i<=18;i++){const t=i/18,u=1-t;pts.push([clampX(c.T,u*u*x0+2*t*u*mx+t*t*x1),Math.max(c.T.top,u*u*y0+2*t*u*my+t*t*y1+Math.sin(t*Math.PI*5)*2.4*Math.sin(t*Math.PI))]);}
    c.el.classList.toggle("r",x1>x0);travel(c,pts,700+d*7,p,"ease-in-out");}
  function flyBat(c){const T=c.T,[x0,y0]=c.at,D=free(c);if(!D.length)return;const p=D[Math.floor(Math.random()*D.length)],[x1,y1]=spot(c,p),
      K=[[x0,y0],[x0+rand(-6,6),y0+16]];
    for(let i=0,n=4+Math.floor(Math.random()*3);i<n;i++)K.push([rand(24,T.w-24),rand(Math.max(T.top,40),T.h*.8)]);
    K.push([x1+rand(-10,10),y1+24],[x1,y1]);
    travel(c,spline(K,8).map(([x,y],i,a)=>i===a.length-1?[x,y]:[clampX(T,x+rand(-1.5,1.5)),y+rand(-1.5,1.5)]),3400+Math.random()*2200,p,"linear");}
  setInterval(()=>{if(document.hidden||reduce.matches||(window.THM&&THM.on===false))return;
    for(const c of WILD.list){if(c.busy)continue;const r=Math.random();
      if(c.bat){if(r<.012)flyBat(c);else if(r<.05)act(c,"stretch",2000);else if(r<.1)act(c,"look",1400);}
      else if(r<.018)flyBird(c);else if(r<.12)c.el.classList.toggle("r");else if(r<.21)act(c,"peck",800);else if(r<.25)act(c,"preen",1600);
      else if(r<.33)act(c,"flick",450);else if(r<.38)act(c,"tilt",1200);else if(r<.42)hop(c);}},800);
  /* the trees are built just after the first paint (their measuring would otherwise force extra layouts of the whole page) */
  requestAnimationFrame(()=>setTimeout(()=>{build();buildL();},0));
  /* perches for the flying mascot: points on the thicker limbs, in screen coordinates (big tree, and the left tree for hiding) */
  window.TREE={perches(){if(!svg||!wide.matches)return [];const b=box.getBoundingClientRect(),ox=b.right-190;return perches.map(([x,y])=>[ox+x,b.top+y]);},
    perchesL(){if(!svgL)return [];const b=boxL.getBoundingClientRect();return perchL.map(([x,y])=>[b.left+x,b.top+y]);},
    /* v16: where the fire rider's flames catch on each tree, as [x, y, size] in screen px: leaf clumps, every other limb, the trunk */
    fire(side){const L=side==="L";if(L?!svgL:!svg||!wide.matches)return [];const b=(L?boxL:box).getBoundingClientRect(),ox=L?b.left:b.right-190,
      P=[...(L?tipL:tips).map(([x,y])=>[x,y,12]),...(L?perchL:perches).map(([x,y])=>[x,y,8]),...(L?trunkL:trunkR).map(([x,y])=>[x,y,15])];
      /* only parts of the tree that are drawn: tips outside the tree's own box are clipped away, so no fire floats in mid-air */
      return P.filter(([x])=>x>=6&&x<=(L?194:186)).map(([x,y,s])=>[ox+x,b.top+y,s]).filter(([x,y])=>y>60&&y<innerHeight-4&&x<innerWidth+10);}};
})();

/* time of day: animated mascot (night owl 17–5, early bird 5–17) at the top right of the hero, plus a mini one in the nav */
(function(){
  /* the branch both characters sit on: a tapered limb with bark shading growing out of the tree on the right, one twig and real leaves */
  const LF=(x,y,r,k,c)=>'<g transform="translate('+x+' '+y+') rotate('+r+') scale('+k+')"><path d="M0 0 C6 -7 17 -8 24 0 C17 8 6 7 0 0Z" fill="url(#'+c+')"/><path d="M1 0 L22 0" stroke="#24411a" stroke-width=".7" opacity=".55"/></g>';
  const BR='<defs><linearGradient id="msBark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a7258"/><stop offset=".45" stop-color="#5e4a37"/><stop offset="1" stop-color="#2f241a"/></linearGradient>'+
      '<linearGradient id="msLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#86b84a"/><stop offset="1" stop-color="#3a6a1f"/></linearGradient>'+
      '<linearGradient id="msLeaf2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5e9433"/><stop offset="1" stop-color="#264a15"/></linearGradient></defs>'+
    '<path d="M64 181 C54 171 41 165 27 161 L28 159 C43 162 56 168 67 179Z" fill="url(#msBark)"/>'+
    '<path d="M2 183 C50 176 130 181 250 158 L250 184 C160 196 70 191 2 187Z" fill="url(#msBark)"/>'+
    '<path d="M8 183 C60 177 130 181 248 159" stroke="#f3e2c8" stroke-width="1" fill="none" opacity=".25"/>'+
    '<path d="M40 186 C80 184 120 187 170 179 M150 185 C180 182 210 178 248 172 M196 176 c6 -1 10 -1 14 1" stroke="#1e1610" stroke-width=".8" fill="none" opacity=".35"/>'+
    '<ellipse cx="176" cy="177" rx="3.4" ry="2.4" fill="#2a1f16" opacity=".6"/>'+
    LF(27,160,196,.8,"msLeaf")+LF(28,160,232,.7,"msLeaf2")+LF(46,170,250,.6,"msLeaf")+
    LF(198,168,-38,.85,"msLeaf2")+LF(214,165,-8,.75,"msLeaf")+LF(228,162,-62,.7,"msLeaf2")+LF(150,183,104,.7,"msLeaf2");
  /* weather cloud: hides the sun/moon when the weather (WX) is cloudy, rainy, stormy, snowy or foggy */
  const WXC='<g class="ms-wxc"><path d="M146 80 a15 15 0 0 1 12 -22 a22 22 0 0 1 40 -10 a17 17 0 0 1 30 14 a12 12 0 0 1 -2 24 h-72 a11 11 0 0 1 -8 -6z"/><path class="ms-wxc2" d="M120 66 a10 10 0 0 1 9 -14 a14 14 0 0 1 26 -5 a11 11 0 0 1 8 18 h-38 a7 7 0 0 1 -5 1z"/></g>';
  const OWL='<svg viewBox="0 0 240 220" role="img" aria-label="An animated night owl on a branch under the moon">'+
    '<defs><radialGradient id="msMoon"><stop offset="0" stop-color="#fffbe6"/><stop offset="1" stop-color="#fde68a"/></radialGradient><radialGradient id="msHalo"><stop offset="0" stop-color="#fde68a" stop-opacity=".5"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient></defs>'+
    '<circle class="o-halo" cx="184" cy="50" r="50" fill="url(#msHalo)"/><circle class="b-sun" cx="184" cy="50" r="26" fill="url(#msMoon)"/><circle cx="176" cy="44" r="4" fill="#f2cf6b" opacity=".55"/><circle cx="192" cy="58" r="3" fill="#f2cf6b" opacity=".45"/><circle cx="188" cy="38" r="2" fill="#f2cf6b" opacity=".4"/>'+
    WXC+
    '<g fill="#fff"><circle class="o-st" cx="34" cy="26" r="1.9"/><circle class="o-st" cx="70" cy="14" r="1.4"/><circle class="o-st" cx="120" cy="30" r="1.7"/><circle class="o-st" cx="226" cy="104" r="1.5"/><circle class="o-st" cx="20" cy="76" r="1.3"/><circle class="o-st" cx="140" cy="8" r="1.2"/></g>'+
    '<path class="o-shoot" d="M110 18 l-26 14" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>'+
    '<g fill="#fde047"><circle class="o-ff f1" cx="30" cy="140" r="2.4"/><circle class="o-ff f2" cx="196" cy="128" r="2"/><circle class="o-ff f3" cx="214" cy="186" r="2.2"/></g>'+
    BR+
    '<g class="o-body"><path class="o-wl" d="M74 112 C 54 130, 56 162, 80 172 C 82 152, 84 130, 74 112z" fill="#6f4a2f"/><path class="o-wr" d="M146 112 C 166 130, 164 162, 140 172 C 138 152, 136 130, 146 112z" fill="#6f4a2f"/>'+
      '<ellipse cx="110" cy="132" rx="40" ry="44" fill="#8b5e3c"/><ellipse cx="110" cy="146" rx="26" ry="28" fill="#ead2ad"/>'+
      '<path d="M99 134 l4 4 l4 -4 M113 134 l4 4 l4 -4 M106 145 l4 4 l4 -4 M99 156 l4 4 l4 -4 M113 156 l4 4 l4 -4" stroke="#b08458" stroke-width="1.7" fill="none" stroke-linecap="round"/>'+
      '<g class="o-head"><path d="M72 98 L74 60 L92 80 Q110 74 128 80 L146 60 L148 98 Q150 126 110 126 Q70 126 72 98z" fill="#8b5e3c"/>'+
        '<circle cx="95" cy="99" r="17" fill="#d9b48f"/><circle cx="125" cy="99" r="17" fill="#d9b48f"/>'+
        '<circle cx="95" cy="99" r="12" fill="#fbbf24"/><circle cx="125" cy="99" r="12" fill="#fbbf24"/>'+
        '<g class="o-pup"><circle cx="95" cy="100" r="6.8" fill="#1c1003"/><circle cx="125" cy="100" r="6.8" fill="#1c1003"/><circle cx="97.5" cy="97" r="2.1" fill="#fff"/><circle cx="127.5" cy="97" r="2.1" fill="#fff"/></g>'+
        '<ellipse class="o-lid" cx="95" cy="99" rx="13" ry="13" fill="#8b5e3c"/><ellipse class="o-lid" cx="125" cy="99" rx="13" ry="13" fill="#8b5e3c"/>'+
        '<path d="M104 110 L116 110 L110 123z" fill="#f59e0b"/></g>'+
      '<path d="M98 173 v7 M104 174 v7 M116 174 v7 M122 173 v7" stroke="#f59e0b" stroke-width="3.2" stroke-linecap="round"/></g>'+
    '<g class="ms-bub"><path d="M150 84 h74 a10 10 0 0 1 10 10 v16 a10 10 0 0 1 -10 10 h-58 l-10 9 l1 -9 h-7 a10 10 0 0 1 -10 -10 v-16 a10 10 0 0 1 10 -10z" fill="#fff"/><text x="189" y="107" text-anchor="middle" font-family="Inter,sans-serif" font-weight="700" font-size="14" fill="#1e1b4b">Hoo hoo!</text></g></svg>';
  const BIRD='<svg viewBox="0 0 240 220" role="img" aria-label="An animated early bird singing on a branch at sunrise">'+
    '<defs><radialGradient id="msSun"><stop offset="0" stop-color="#fde68a" stop-opacity=".7"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient></defs>'+
    '<circle class="b-halo" cx="182" cy="58" r="54" fill="url(#msSun)"/>'+
    '<g class="b-rays" stroke="#fbbf24" stroke-width="3.2" stroke-linecap="round"><path d="M182 22v-9M182 94v9M146 58h-9M218 58h9M156.5 32.5l-6.4-6.4M207.5 83.5l6.4 6.4M156.5 83.5l-6.4 6.4M207.5 32.5l6.4-6.4"/></g>'+
    '<circle class="b-sun" cx="182" cy="58" r="25" fill="#fcd34d"/><circle class="b-sun" cx="182" cy="58" r="25" fill="none" stroke="#f59e0b" stroke-width="1.5" opacity=".5"/>'+
    WXC+
    '<g class="b-cl1"><path d="M22 52 a10 10 0 0 1 12 -10 a14 14 0 0 1 26 4 a9 9 0 0 1 2 18 h-36 a8 8 0 0 1 -4 -12z" fill="#fff" opacity=".95"/></g>'+
    '<g class="b-cl2"><path d="M120 22 a7 7 0 0 1 9 -7 a10 10 0 0 1 18 3 a6 6 0 0 1 1 12 h-24 a6 6 0 0 1 -4 -8z" fill="#fff" opacity=".85"/></g>'+
    '<g class="b-fly"><path class="b-flap" d="M0 6 q6 -7 12 0 q6 -7 12 0" stroke="#334155" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>'+
    BR+
    /* a songbird drawn to real proportions: one smooth body outline (head, neck, back, rump, belly, breast), a folded wing hinged at
       the shoulder, layered tail feathers, thin bill and legs. The gradients use one shared user space so head and body meet without a
       seam. Its plumage comes from PLUM (robin, bluebird, cardinal, goldfinch, kingfisher): plumage() writes the colours into these
       gradients and the .b-belly/.b-edge/.b-lid/.b-bill parts. Colour patches are clipped to the outline, so nothing spills past it. */
    '<defs><linearGradient id="msRB" gradientUnits="userSpaceOnUse" x1="0" y1="90" x2="0" y2="176"><stop offset="0"/><stop offset="1"/></linearGradient>'+
      '<radialGradient id="msRO" gradientUnits="userSpaceOnUse" cx="140" cy="124" r="46"><stop offset="0"/><stop offset=".7"/><stop offset="1"/></radialGradient>'+
      '<radialGradient id="msRF" gradientUnits="userSpaceOnUse" cx="140" cy="110" r="18"><stop offset="0"/><stop offset=".7"/><stop offset="1"/></radialGradient>'+
      '<linearGradient id="msRW" gradientUnits="userSpaceOnUse" x1="116" y1="112" x2="66" y2="154"><stop offset="0"/><stop offset="1"/></linearGradient>'+
      '<linearGradient id="msRT" gradientUnits="userSpaceOnUse" x1="84" y1="150" x2="42" y2="178"><stop offset="0"/><stop offset="1"/></linearGradient>'+
      '<radialGradient id="msRS" gradientUnits="userSpaceOnUse" cx="122" cy="98" r="80"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient>'+
      '<clipPath id="msCB"><path d="M118 100 C108 110 88 120 78 134 C72 143 72 154 80 162 C90 171 108 174 122 168 C136 161 144 146 144 132 C144 124 144 120 142 116 C134 108 126 102 118 100Z"/></clipPath>'+
      '<clipPath id="msCH"><path d="M148 106 C146 97 139 92 130 92 C121 92 115 97 113 104 C111 112 114 120 120 124 C128 128 140 124 146 118 L149.5 112.5Z"/></clipPath></defs>'+
    '<g class="b-bird">'+
      /* tail: two layered feathers, the lower one darker */
      '<path d="M82 152 L46 174 L44 179 L52 178 L88 158Z" fill="url(#msRT)" opacity=".8"/>'+
      '<path d="M80 148 L42 168 L40 174 L48 174 L86 154Z" fill="url(#msRT)"/><path d="M44 171 L83 151" stroke="#fff" stroke-width=".6" opacity=".25"/>'+
      /* body, colour patches and shading (clipped to the outline) */
      '<path d="M118 100 C108 110 88 120 78 134 C72 143 72 154 80 162 C90 171 108 174 122 168 C136 161 144 146 144 132 C144 124 144 120 142 116 C134 108 126 102 118 100Z" fill="url(#msRB)"/>'+
      '<g clip-path="url(#msCB)"><ellipse class="b-belly" cx="112" cy="168" rx="26" ry="12"/>'+
        '<path d="M144 110 C133 109 127 116 125 126 C122 140 117 152 119 166 L126 172 C140 162 148 146 147 128Z" fill="url(#msRO)"/>'+
        '<path class="b-edge" d="M127 116 C124 128 121 142 118 154 C117 160 118 165 120 169" stroke-width="2.2" fill="none" opacity=".7" stroke-linecap="round"/>'+
        '<path d="M86 128 q3 -2 6 0 M95 121 q3 -2 6 0 M104 115 q3 -2 6 0 M90 136 q3 -2 6 0 M99 130 q3 -2 6 0" stroke="#000" stroke-width=".7" fill="none" opacity=".18"/>'+
        '<rect x="60" y="90" width="100" height="90" fill="url(#msRS)"/></g>'+
      /* folded wing, hinged at the shoulder: coverts, then long primaries with pale edges */
      '<g class="b-wing"><path d="M116 113 C105 110 91 118 83 130 C77 139 71 147 62 154 C75 155 91 151 103 144 C113 138 119 127 116 113Z" fill="url(#msRW)"/>'+
        '<path d="M113 118 C106 120 100 126 96 133 M108 126 C102 130 97 136 93 142" stroke="#fff" stroke-width=".8" fill="none" opacity=".28"/>'+
        '<path d="M98 140 C88 146 76 151 63 154 M100 136 C90 143 79 148 66 152 M103 132 C94 139 84 145 71 149" stroke="#000" stroke-width=".8" fill="none" opacity=".35"/>'+
        '<path d="M97 141 C87 147 76 151 64 153" stroke="#fff" stroke-width=".5" fill="none" opacity=".3"/></g>'+
      /* head (pecks): same gradients, face patch clipped to the head */
      '<g class="b-head"><path d="M148 106 C146 97 139 92 130 92 C121 92 115 97 113 104 C111 112 114 120 120 124 C128 128 140 124 146 118 L149.5 112.5Z" fill="url(#msRB)"/>'+
        '<g clip-path="url(#msCH)"><path d="M150 112 C148 101 142 97 136 98 C130 99 126 105 127 112 C128 120 133 126 141 126 L150 120Z" fill="url(#msRF)"/>'+
        '<path class="b-edge" d="M135 98 C129 100 126 106 127 113 C128 119 131 123 135 126" stroke-width="1.8" fill="none" opacity=".7" stroke-linecap="round"/>'+
        '<rect x="110" y="90" width="42" height="40" fill="url(#msRS)"/></g>'+
        '<circle cx="137.5" cy="104.5" r="3.6" fill="#fff" opacity=".35"/><circle class="b-pup" cx="137.5" cy="104.5" r="2.9" fill="#120c08"/><circle cx="138.5" cy="103.5" r=".9" fill="#fff"/>'+
        '<ellipse class="b-lid" cx="137.5" cy="104.5" rx="3.7" ry="3.7"/>'+
        '<path class="b-bill" d="M147.5 106.5 C152 107.6 156 108.8 160 110.2 C156 110.8 152 111.2 148.6 111.4Z"/><path class="b-beak b-bill2" d="M148.6 111.4 L158 110.6 C154 112 151 112.8 148.4 113Z"/></g>'+
      '<path d="M103 171 L101.5 179 M101.5 179 l-5 1.4 M101.5 179 l4.4 1.6 M101.5 179 l.8 2.8 M113 170 L113.5 178.5 M113.5 178.5 l-4.4 1.8 M113.5 178.5 l5 1 M113.5 178.5 l.2 2.8" stroke="#7d5f4c" stroke-width="1.5" stroke-linecap="round" fill="none"/></g>'+
    '<g class="b-notes" fill="#7c3aed" font-family="Inter,sans-serif" font-weight="700"><text class="n1" x="166" y="112" font-size="16">♪</text><text class="n2" x="174" y="104" font-size="18">♫</text><text class="n3" x="160" y="100" font-size="14">♪</text></g>'+
    '<g class="ms-bub"><path d="M150 112 h74 a10 10 0 0 1 10 10 v16 a10 10 0 0 1 -10 10 h-58 l-10 9 l1 -9 h-7 a10 10 0 0 1 -10 -10 v-16 a10 10 0 0 1 10 -10z" fill="#fff"/><text x="189" y="135" text-anchor="middle" font-family="Inter,sans-serif" font-weight="700" font-size="14" fill="#1e3a8a">Tweet tweet!</text></g></svg>';
  const kind=()=>{const p=THM.phase()[0];return p==="early"||p==="day"?"bird":"owl";};
  const hhmm=()=>{const d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");};
  const head=$("header#top"),h1=head&&$("h1",head);if(!h1)return;
  const ms=document.createElement("div");ms.id="mascot";ms.setAttribute("role","button");ms.tabIndex=0;h1.before(ms);
  const wide=matchMedia("(min-width:1200px)");
  const place=()=>{if(wide.matches){if(ms.parentNode!==document.body)document.body.appendChild(ms);ms.classList.add("ms-fixed");}else{ms.classList.remove("ms-fixed");if(ms.nextElementSibling!==h1)h1.before(ms);}};
  place();wide.addEventListener("change",place);
  let cur="",rt=0;
  /* plumages (real species): b back, o breast, f face, w wing, t tail (gradient stops), belly, edge (breast/face border), bill */
  const PLUM=[
    {n:"Robin",b:["#8d7659","#57452f"],o:["#f3904f","#df6630","#c24f22"],f:["#f3904f","#df6630","#c24f22"],w:["#7d664c","#463727"],t:["#6e5841","#3b2f22"],belly:"#ece5d9",edge:"#a7aeb2",bill:["#2e251f","#4a3c31"]},
    {n:"Bluebird",b:["#5b8fe0","#2d56a8"],o:["#eda06a","#d9813f","#b8652c"],f:["#6a9ae6","#3f70c8","#2d56a8"],w:["#4a80d8","#22448f"],t:["#3d6cc0","#1f3d80"],belly:"#f2eee6",edge:"#9fb6dc",bill:["#22242a","#3a3d45"]},
    {n:"Cardinal",b:["#e0453a","#a52219"],o:["#ee5246","#d9352b","#b8271f"],f:["#1c1110","#2a1512","#b8271f"],w:["#c2322a","#7f1914"],t:["#b02a22","#6e140f"],belly:"#d93a30",edge:"#e85a4f",bill:["#f08a3a","#d9702a"]},
    {n:"Goldfinch",b:["#f7d23a","#dcae14"],o:["#ffdf4a","#f7c823","#e0aa10"],f:["#ffe25a","#f7c823","#e6b015"],w:["#2e2e2e","#0f0f0f"],t:["#2a2a2a","#111111"],belly:"#f8f2d6",edge:"#e9c21c",bill:["#f2a65a","#e08a3c"]},
    {n:"Kingfisher",b:["#27aee0","#0f6f9f"],o:["#f39046","#e2722b","#c85a1c"],f:["#f39046","#e2722b","#c85a1c"],w:["#1f9fd6","#0b5f8c"],t:["#1689bd","#0a4f75"],belly:"#f3e6d4",edge:"#ffffff",bill:["#1d1d1f","#2c2c30"]}];
  let pl=Math.max(0,Math.min(PLUM.length-1,+(store.get("js1-bird")||0)||0));
  function plumage(){if(cur!=="bird")return;const P=PLUM[pl],stops=(id,c)=>{const g=$("#"+id,ms);if(g)[...g.children].forEach((s,i)=>s.setAttribute("stop-color",c[i]));};
    stops("msRB",P.b);stops("msRO",P.o);stops("msRF",P.f);stops("msRW",P.w);stops("msRT",P.t);
    $$(".b-belly",ms).forEach(e=>e.setAttribute("fill",P.belly));$$(".b-edge",ms).forEach(e=>e.setAttribute("stroke",P.edge));
    $$(".b-lid",ms).forEach(e=>e.setAttribute("fill",P.f[1]));const b1=$(".b-bill",ms),b2=$(".b-bill2",ms);if(b1)b1.setAttribute("fill",P.bill[0]);if(b2)b2.setAttribute("fill",P.bill[1]);}
  function paint(){const k=kind(),p=THM.phase();
    if(k!==cur){cur=k;ms.classList.remove("ms-owl","ms-bird");ms.classList.add("ms-"+k);ms.innerHTML=k==="owl"?OWL:BIRD;plumage();}
    const name=k==="owl"?"Night owl":PLUM[pl].n+" · "+(p[0]==="early"?"early bird":"song bird");
    ms.setAttribute("aria-label",name+" · "+hhmm()+": click to say hello");ms.title=name+" · "+hhmm()+(k==="bird"?" (click: new colours)":"");}
  function react(){if(window.SFX)cur==="owl"?SFX.hoot():SFX.chirp();ms.classList.remove("react");requestAnimationFrame(()=>requestAnimationFrame(()=>ms.classList.add("react")));clearTimeout(rt);rt=setTimeout(()=>ms.classList.remove("react"),2600);}
  /* study buddy (v13): short speech-bubble lines when you answer a quiz question, finish a quiz or mark a section understood (with a
     nod), and a nap (eyes shut, floating z's) after 2 minutes without activity; any activity wakes it ("I'm up!") */
  const pickL=a=>a[Math.floor(Math.random()*a.length)];
  function say(t,nod){if(flying||ms.classList.contains("away")||ms.classList.contains("sleep"))return;const tx=$(".ms-bub text",ms);if(!tx)return;
    if(!tx.dataset.d)tx.dataset.d=tx.textContent;tx.textContent=t;react();
    if(nod){const h=$(cur==="owl"?".o-head":".b-head",ms);if(h&&h.animate)h.animate([{transform:"rotate(0deg)"},{transform:"rotate(14deg)"},{transform:"rotate(0deg)"},{transform:"rotate(10deg)"},{transform:"rotate(0deg)"}],{duration:900,easing:"ease-in-out",composite:"add"});}
    clearTimeout(say.t);say.t=setTimeout(()=>{const t2=$(".ms-bub text",ms);if(t2&&t2.dataset.d)t2.textContent=t2.dataset.d;},2800);}
  document.addEventListener("quizanswer",e=>{const d=e.detail;say(d.ok&&d.streak>=3?"🔥 ×"+d.streak+"!":d.ok?pickL(["Nice!","Yes!","Correct!","Smart!"]):pickL(["Oops!","Not quite","Hmm…"]),d.ok);});
  document.addEventListener("quizdone",()=>setTimeout(()=>say("Bravo! 🎉",true),900));
  document.addEventListener("click",e=>{const b=e.target.closest(".sf-done");if(b)setTimeout(()=>{if(b.getAttribute("aria-pressed")==="true")say(pickL(["Great!","Learned!","Well done!"]),true);},40);});
  let napT=0,lastAct=0;
  const nap=()=>{if(document.hidden||flying)return;if(!$(".ms-zzz",ms))ms.insertAdjacentHTML("beforeend",'<span class="ms-zzz" aria-hidden="true"><i>z</i><i>z</i><i>z</i></span>');ms.classList.add("sleep");};
  const wake=()=>{const now=Date.now();if(now-lastAct<1000&&!ms.classList.contains("sleep"))return;lastAct=now;clearTimeout(napT);
    if(ms.classList.contains("sleep")){ms.classList.remove("sleep");setTimeout(()=>say("I'm up!"),250);}napT=setTimeout(nap,120000);};
  ["pointermove","pointerdown","keydown","scroll","wheel"].forEach(t=>addEventListener(t,wake,{passive:true}));wake();
  /* flight: now and then (and on click) the bird/owl takes off, flies to the "Java" heading (the hero h1 word when it is on screen,
     else the nav brand), pecks it three times (the word bounces, glows and throws sparks), then flies back and lands on its branch.
     A fixed .ms-flyer holds a clone of the character; the one on the branch hides (#mascot.away) until it lands, then calls out. */
  let flying=false;
  /* tree flight (≥1200px, where the tree is): the bird/owl swoops out over the page with a songbird's dipping flight, lands on a limb
     of the tree (TREE.perches), settles, hop-turns to face the page, looks round and pecks, then takes off and loops back to its branch.
     Wings stop flapping while perched (.ms-flyer.perched). Falls back to the heading flight (flyWord) when there is no tree. */
  function fly(){return flyTree()||flyWord();}
  function flyTree(){
    if(flying||document.hidden||!window.TREE||matchMedia("(prefers-reduced-motion:reduce)").matches)return false;
    const owl=cur==="owl",g=$(owl?".o-body":".b-bird",ms);if(!g)return false;
    const r=g.getBoundingClientRect(),W=innerWidth,H=innerHeight;if(!r.width||r.bottom<0||r.top>H)return false;
    const P=TREE.perches().filter(([x,y])=>y>r.bottom+90&&y<H-90&&x>W-200);if(!P.length)return false;
    const [tx,ty]=P[Math.floor(Math.random()*P.length)];
    const bb=g.getBBox(),k=r.width/bb.width,pad=8,fw=(bb.width+2*pad)*k;
    const fl=document.createElement("div");fl.className="ms-flyer ms-"+cur;fl.setAttribute("aria-hidden","true");
    fl.innerHTML='<svg viewBox="'+[bb.x-pad,bb.y-pad,bb.width+2*pad,bb.height+2*pad].join(" ")+'">'+g.outerHTML+"</svg>";
    Object.assign(fl.style,{left:(r.left-pad*k)+"px",top:(r.top-pad*k)+"px",width:fw+"px"});
    const hx=r.left+r.width/2,hy=r.top+r.height/2,sc=owl?.5:.6,px=tx+2,py=ty-r.height*sc/2+2,j=v=>v+(Math.random()-.5)*60;
    const cr=(a,b,c,d,t)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
    const path=Q=>{const F=[];for(let i=0;i<Q.length-1;i++)for(let s=0;s<12;s++){const t=s/12,q=[Q[Math.max(0,i-1)],Q[i],Q[i+1],Q[Math.min(Q.length-1,i+2)]];
      F.push([cr(q[0][0],q[1][0],q[2][0],q[3][0],t),cr(q[0][1],q[1][1],q[2][1],q[3][1],t)]);}F.push(Q[Q.length-1]);return F;};
    const out=path([[hx,hy],[hx-W*.1,hy-20],[j(W*.62),j((hy+py)/2)],[px-150,py-60],[px-45,py-16],[px,py]]),
      back=path([[px,py],[px-70,py-40],[j(W*.58),j(H*.45)],[j(W*.72),Math.max(60,hy-40)],[hx-50,hy-40],[hx,hy]]);
    const KF=[],T=13000,o1=.34,o2=.64;let face=1;
    const tf=(x,y,rot,sx,sy)=>"translate("+(x-hx).toFixed(1)+"px,"+(y-hy).toFixed(1)+"px) rotate("+rot.toFixed(1)+"deg) scale("+sx.toFixed(3)+","+sy.toFixed(3)+")";
    const push=(F,a,b,s0,s1)=>F.forEach(([x,y],i)=>{const n=F[Math.min(F.length-1,i+1)],dx=n[0]-x,dy=n[1]-y;if(Math.abs(dx)>2)face=dx<0?-1:1;
      const u=i/(F.length-1),s=s0+(s1-s0)*u+.12*Math.sin(Math.PI*u),dip=Math.sin(u*Math.PI*7)*9*Math.sin(Math.PI*u),
        tilt=Math.max(-22,Math.min(22,Math.atan2(dy,Math.abs(dx)+1)*57.3*.45));
      KF.push({offset:a+(b-a)*u,transform:tf(x,y+dip,owl?tilt*.4:tilt*face,owl?s:s*face,s)});});
    push(out,0,o1,1,sc);
    /* on the limb: land (squash), settle, hop-turn to face the page, look, peck twice, crouch, take off */
    const fz=face,at=(o,dy,rot,f,sy)=>KF.push({offset:o,transform:tf(px,py+dy,rot,owl?sc:sc*f,sc*(sy||1))});
    at(o1+.01,3,0,fz,.88);at(o1+.03,0,0,fz);at(o1+.08,0,0,fz);at(o1+.1,-7,0,fz);at(o1+.11,-7,0,-fz);at(o1+.13,0,0,-fz,.92);at(o1+.14,0,0,-fz);
    at(o1+.18,0,owl?-8:0,-fz);at(o1+.2,0,owl?8:0,-fz);at(o1+.21,2,owl?0:-fz*16,-fz);at(o1+.22,0,0,-fz);at(o1+.23,2,owl?0:-fz*16,-fz);at(o1+.24,0,0,-fz);
    at(o2-.02,0,0,-fz);at(o2-.005,3,0,-fz,.86);
    face=-fz;push(back,o2,1,sc,1);
    KF[0].transform=KF[KF.length-1].transform="translate(0px,0px) rotate(0deg) scale(1,1)";
    KF.sort((a,b)=>a.offset-b.offset);
    flying=true;ms.classList.add("away");document.body.appendChild(fl);
    const an=fl.animate(KF,{duration:T,easing:"linear"}),timers=[setTimeout(()=>fl.classList.add("perched"),T*(o1+.01)),setTimeout(()=>fl.classList.remove("perched"),T*(o2-.005))];
    an.onfinish=an.oncancel=()=>{timers.forEach(clearTimeout);fl.remove();ms.classList.remove("away");flying=false;react();};
    return true;}
  function flyWord(){
    if(flying||document.hidden||matchMedia("(prefers-reduced-motion:reduce)").matches)return false;
    const g=$(cur==="owl"?".o-body":".b-bird",ms);if(!g)return false;
    const r=g.getBoundingClientRect(),W=innerWidth,H=innerHeight;if(!r.width||r.bottom<0||r.top>H)return false;
    const big=$("header#top h1 .grad"),br=big&&big.getBoundingClientRect(),
      tg=br&&br.top>60&&br.bottom<H-20&&br.width?big:$("nav .brand span");if(!tg)return false;
    const tr=tg.getBoundingClientRect();
    const bb=g.getBBox(),k=r.width/bb.width,pad=8,owl=cur==="owl",fw=(bb.width+2*pad)*k,fh=(bb.height+2*pad)*k;
    const fl=document.createElement("div");fl.className="ms-flyer ms-"+cur;fl.setAttribute("aria-hidden","true");
    fl.innerHTML='<svg viewBox="'+[bb.x-pad,bb.y-pad,bb.width+2*pad,bb.height+2*pad].join(" ")+'">'+g.outerHTML+"</svg>";
    Object.assign(fl.style,{left:(r.left-pad*k)+"px",top:(r.top-pad*k)+"px",width:fw+"px"});
    const hx=r.left+r.width/2,hy=r.top+r.height/2,j=v=>v+(Math.random()-.5)*v*.12,top=Math.max(60,r.height*.7);
    /* where it perches to peck: the bird sits just right of the word (beak towards it), the owl hovers over it */
    const sc=Math.min(1,Math.max(.55,(tr.height*1.5)/fh)),
      px=owl?tr.left+tr.width*.55:tr.right+fw*sc*.3,py=owl?tr.top-fh*sc*.32:tr.top+tr.height*.42,toL=tr.left+tr.width/2<px;
    const cr=(a,b,c,d,t)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
    const path=P=>{const F=[];for(let i=0;i<P.length-1;i++)for(let s=0;s<10;s++){const t=s/10,q=[P[Math.max(0,i-1)],P[i],P[i+1],P[Math.min(P.length-1,i+2)]];
      F.push([cr(q[0][0],q[1][0],q[2][0],q[3][0],t),cr(q[0][1],q[1][1],q[2][1],q[3][1],t)]);}F.push(P[P.length-1]);return F;};
    const out=path([[hx,hy],[hx-W*.08,Math.max(top,hy-60)],[j((hx+px)/2),Math.max(top,Math.min(hy,py)-90)],[px+(toL?60:-60),py-50],[px,py]]),
      back=path([[px,py],[px+(toL?40:-40),py-70],[j(W*.45),j(H*.62)],[j(W*.78),j(H*.34)],[hx+40,Math.max(top,hy-80)],[hx,hy]]);
    let face=-1;const KF=[];
    const push=(F,o0,o1,s0,s1)=>F.forEach(([x,y],i)=>{const n=F[Math.min(F.length-1,i+1)],dx=n[0]-x,dy=n[1]-y;if(Math.abs(dx)>2)face=dx<0?-1:1;
      const u=i/(F.length-1),s=s0+(s1-s0)*u+.18*Math.sin(Math.PI*u),tilt=Math.max(-25,Math.min(25,Math.atan2(dy,Math.abs(dx)+1)*57.3*.5));
      KF.push({offset:o0+(o1-o0)*u,transform:"translate("+(x-hx).toFixed(1)+"px,"+(y-hy).toFixed(1)+"px) rotate("+(owl?tilt*.4:tilt*face).toFixed(1)+"deg) scale("+(owl?s:s*face).toFixed(3)+","+s.toFixed(3)+")"});});
    const T=9000,o1=.36,o2=.62;
    push(out,0,o1,1,sc);
    /* three pecks: lunge towards the word and back */
    const pf=toL?-1:1,at=(x,y,rot)=>"translate("+(x-hx).toFixed(1)+"px,"+(y-hy).toFixed(1)+"px) rotate("+rot+"deg) scale("+(owl?sc:sc*pf).toFixed(3)+","+sc.toFixed(3)+")";
    for(let i=0;i<3;i++){const b=o1+(o2-o1)*(i/3),d=(o2-o1)/3;
      KF.push({offset:b+d*.15,transform:at(px,py,0)});
      KF.push({offset:b+d*.45,transform:owl?at(px,py+10*sc,0):at(px+pf*12*sc,py+5*sc,pf*-22)});
      KF.push({offset:b+d*.75,transform:at(px,py,0)});}
    push(back,o2,1,sc,1);
    KF[0].transform=KF[KF.length-1].transform="translate(0px,0px) rotate(0deg) scale(1,1)";
    flying=true;ms.classList.add("away");document.body.appendChild(fl);tg.classList.add("poke-tgt");
    const an=fl.animate(KF,{duration:T,easing:"linear"}),timers=[];
    for(let i=0;i<3;i++)timers.push(setTimeout(()=>poke(tg,owl?px:px+pf*fw*sc*.45,owl?tr.top:py),T*(o1+(o2-o1)*(i/3+.45/3))));
    an.onfinish=an.oncancel=()=>{timers.forEach(clearTimeout);fl.remove();tg.classList.remove("poke-tgt","poked");ms.classList.remove("away");flying=false;react();};
    return true;}
  /* the poked word bounces and glows; a few sparks fly from the beak */
  function poke(el,x,y){el.classList.remove("poked");void el.offsetWidth;el.classList.add("poked");
    for(let i=0;i<7;i++){const s=document.createElement("i");s.className="poke-spark";s.style.left=x+"px";s.style.top=y+"px";
      const a=Math.random()*6.283,d=18+Math.random()*26;s.style.setProperty("--dx",(Math.cos(a)*d).toFixed(1)+"px");s.style.setProperty("--dy",(Math.sin(a)*d-8).toFixed(1)+"px");
      document.body.appendChild(s);setTimeout(()=>s.remove(),700);}}
  /* the fire rider and the mascot (RIDER calls these). where() is the bird's position (on its branch, or hiding in the left tree);
     dodge() — a shot just missed: feathers fly; at home it flees to a limb of the left tree (TREE.perchesL) and hides there, already
     hiding it hops aside; grab() hands RIDER a flapping clone to move on his chain (the copy on the branch hides); release(h,x,y) lets
     it go and it flies home; home() sends a hiding bird back when the rider has gone. */
  let out=null;
  const clone=g=>{const r=g.getBoundingClientRect(),bb=g.getBBox(),k=r.width/bb.width,pad=8;
    const fl=document.createElement("div");fl.className="ms-flyer ms-"+cur;fl.setAttribute("aria-hidden","true");
    fl.innerHTML='<svg viewBox="'+[bb.x-pad,bb.y-pad,bb.width+2*pad,bb.height+2*pad].join(" ")+'">'+g.outerHTML+"</svg>";
    Object.assign(fl.style,{left:(r.left-pad*k)+"px",top:(r.top-pad*k)+"px",width:((bb.width+2*pad)*k)+"px"});
    flying=true;ms.classList.add("away");document.body.appendChild(fl);return {el:fl,cx:r.left+r.width/2,cy:r.top+r.height/2,h:r.height,owl:cur==="owl"};};
  const done=el=>{el.remove();ms.classList.remove("away");flying=false;out=null;react();};
  function feathers(x,y){const P=PLUM[pl],c=cur==="owl"?["#8b5e3c","#ead2ad"]:[P.b[0],P.o[1],P.belly];
    for(let i=0;i<9;i++){const e=document.createElement("i");e.className="ms-feather";e.style.left=x+"px";e.style.top=y+"px";e.style.background=c[i%c.length];
      e.style.setProperty("--dx",((Math.random()-.5)*120).toFixed(0)+"px");e.style.setProperty("--dy",(Math.random()*90-20).toFixed(0)+"px");e.style.setProperty("--r",((Math.random()-.5)*720).toFixed(0)+"deg");
      document.body.appendChild(e);setTimeout(()=>e.remove(),1500);}}
  window.MASCOT={say,
    where(){if(out)return out.sit?[out.x,out.y]:null;const g=$(cur==="owl"?".o-body":".b-bird",ms);if(flying||!g)return null;const r=g.getBoundingClientRect();
      return r.width&&r.bottom>0&&r.top<innerHeight?[r.left+r.width/2,r.top+r.height/2]:null;},
    dodge(){const w=this.where();if(!w)return;feathers(w[0],w[1]);
      if(out){out.el.animate([{transform:"translate(0,0)"},{transform:"translate(-12px,-16px) rotate(-14deg)"},{transform:"translate(0,0)"}],{duration:480,easing:"ease-out",composite:"add"});return;}
      const P=window.TREE&&TREE.perchesL?TREE.perchesL().filter(([x,y])=>y>120&&y<innerHeight-60):[];
      if(!P.length){ms.classList.remove("dodge");void ms.offsetWidth;ms.classList.add("dodge");setTimeout(()=>ms.classList.remove("dodge"),600);return;}
      const g=$(cur==="owl"?".o-body":".b-bird",ms),h=clone(g),[tx,ty]=P[Math.floor(Math.random()*P.length)],sc=h.owl?.5:.6,px=tx,py=ty-h.h*sc/2+2,K=[];
      const mx=(h.cx+px)/2,my=Math.min(h.cy,py)-140;
      for(let i=0;i<=40;i++){const u=i/40,x=(1-u)*(1-u)*h.cx+2*(1-u)*u*mx+u*u*px,y=(1-u)*(1-u)*h.cy+2*(1-u)*u*my+u*u*py+Math.sin(u*Math.PI*6)*8*Math.sin(Math.PI*u),s=1+(sc-1)*u;
        K.push({offset:u,transform:"translate("+(x-h.cx).toFixed(1)+"px,"+(y-h.cy).toFixed(1)+"px) rotate("+(i<40?-10:0)+"deg) scale("+(h.owl?s:-s).toFixed(3)+","+s.toFixed(3)+")"});}
      out=Object.assign(h,{x:px,y:py,sc,sit:false});
      out.anim=h.el.animate(K,{duration:2200,easing:"ease-in-out",fill:"forwards"});
      out.anim.onfinish=()=>{if(out){out.sit=true;out.el.classList.add("perched");}};},
    grab(){if(out){if(!out.sit)return null;const h=out;h.anim.onfinish=null;h.anim.cancel();h.el.classList.remove("perched");
        h.el.style.transform="translate("+(h.x-h.cx)+"px,"+(h.y-h.cy)+"px) scale("+(h.owl?h.sc:-h.sc)+","+h.sc+")";out=null;return h;}
      const g=$(cur==="owl"?".o-body":".b-bird",ms);if(flying||!g||!g.getBoundingClientRect().width)return null;return clone(g);},
    release(h,x,y){const dx=x-h.cx,dy=y-h.cy,f=dx>0?-1:1,s=.7;
      const a=h.el.animate([{transform:"translate("+dx+"px,"+dy+"px) scale("+(h.owl?s:s*f)+","+s+")"},
        {transform:"translate("+(dx*.45)+"px,"+(Math.min(dy,0)*.5-90)+"px) rotate(-8deg) scale("+(h.owl?.85:.85*f)+",.85)"},
        {transform:"translate(0px,0px) scale(1,1)"}],{duration:2600,easing:"ease-in-out"});
      a.onfinish=a.oncancel=()=>done(h.el);},
    /* v12: after the chain the bird turns into a ghost (green puff + wail), the ghost swoops back to the tree, a second ghost rushes
       out of the tree straight at the viewer (growing to fill the screen as it fades), then the bird is back on its branch */
    releaseGhost(h,x,y){
      const GH='<svg viewBox="-14 -14 128 148"><ellipse cx="50" cy="62" rx="62" ry="72" fill="rgba(150,255,190,.22)"/><ellipse cx="50" cy="62" rx="44" ry="54" fill="rgba(170,255,205,.22)"/>'+
        '<path d="M10 62 Q10 8 50 8 Q90 8 90 62 L90 112 Q82 101 74 112 Q66 123 58 112 Q50 101 42 112 Q34 123 26 112 Q18 101 10 112 Z" fill="#eef4ff" fill-opacity=".93"/>'+
        '<path d="M88 58 Q104 48 110 30 M12 58 Q-4 48 -10 30" stroke="#eef4ff" stroke-opacity=".9" stroke-width="9" stroke-linecap="round" fill="none"/>'+
        '<ellipse cx="36" cy="52" rx="8" ry="12" fill="#140a22"/><ellipse cx="64" cy="52" rx="8" ry="12" fill="#140a22"/><ellipse cx="50" cy="82" rx="9" ry="13" fill="#140a22"/></svg>';
      const mk=(w,z)=>{const e=document.createElement("div");e.className="ms-ghost";e.setAttribute("aria-hidden","true");e.innerHTML=GH;e.style.width=w+"px";if(z)e.style.zIndex=z;document.body.appendChild(e);return e;};
      const puff=(px,py,n,col)=>{for(let i=0;i<n;i++){const e=document.createElement("i");e.className="ms-puff";e.style.left=px+"px";e.style.top=py+"px";e.style.background=col;
        e.style.setProperty("--dx",((Math.random()-.5)*150).toFixed(0)+"px");e.style.setProperty("--dy",((Math.random()-.5)*120).toFixed(0)+"px");document.body.appendChild(e);setTimeout(()=>e.remove(),1100);}};
      const wail=()=>{if(window.SFX&&SFX.wail)SFX.wail();};
      if(matchMedia("(prefers-reduced-motion: reduce)").matches){this.release(h,x,y);return;}
      /* 1. the bird on the chain vanishes in a green puff */
      h.el.animate([{opacity:1},{opacity:0}],{duration:260,fill:"forwards"});puff(x,y,16,"rgba(150,255,190,.85)");wail();setTimeout(()=>h.el.remove(),300);
      /* 2. a ghost appears there and swoops back to the tree */
      const G1=72,g=mk(G1),sx=x-G1/2,sy=y-G1*.62,tx=h.cx-G1/2,ty=h.cy-G1*.62,mx=(sx+tx)/2,my=Math.min(sy,ty)-170,f=tx<sx?-1:1,K=[];
      g.style.left=sx+"px";g.style.top=sy+"px";
      for(let i=0;i<=36;i++){const u=i/36,px=(1-u)*(1-u)*sx+2*(1-u)*u*mx+u*u*tx,py=(1-u)*(1-u)*sy+2*(1-u)*u*my+u*u*ty+Math.sin(u*Math.PI*5)*12;
        K.push({offset:u,opacity:i===0?0:i>31?(36-i)/5:1,transform:"translate("+(px-sx).toFixed(1)+"px,"+(py-sy).toFixed(1)+"px) rotate("+(Math.sin(u*Math.PI*6)*10).toFixed(1)+"deg) scale("+f+",1)"});}
      g.animate(K,{duration:2100,easing:"ease-in-out",fill:"forwards"}).onfinish=()=>{g.remove();
        /* 3. another ghost bursts out of the tree straight at the viewer */
        const Z=120,z=mk(Z,90),zx=h.cx-Z/2,zy=h.cy-Z*.62,cx=innerWidth/2-Z/2-zx,cy=innerHeight/2-Z*.62-zy;z.style.left=zx+"px";z.style.top=zy+"px";wail();
        z.animate([{transform:"translate(0px,0px) scale(.2)",opacity:0},{transform:"translate("+(cx*.3).toFixed(0)+"px,"+(cy*.3).toFixed(0)+"px) scale(1.5)",opacity:1,offset:.35},
          {transform:"translate("+cx.toFixed(0)+"px,"+cy.toFixed(0)+"px) scale(16)",opacity:0}],{duration:1200,easing:"cubic-bezier(.55,0,.9,.35)",fill:"forwards"}).onfinish=()=>{z.remove();
          /* 4. the bird is back on its branch */
          puff(h.cx,h.cy,10,"rgba(255,255,255,.85)");done(h.el);};};},
    home(){if(!out)return;if(!out.sit){out.anim.onfinish=()=>{if(out){out.sit=true;MASCOT.home();}};return;}
      const h=out;h.anim.onfinish=null;h.el.classList.remove("perched");this.release(h,h.x,h.y);h.anim.cancel();}};
  /* a click gives the bird the next plumage (kept between visits), then it flies off */
  const go=()=>{if(cur==="bird"&&!flying){pl=(pl+1)%PLUM.length;store.set("js1-bird",pl);plumage();paint();}if(!fly())react();};
  ms.addEventListener("click",go);ms.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});
  document.addEventListener("themechange",paint);
  paint();setInterval(paint,30000);setTimeout(react,1600);
  /* the owl hoots on its own every 35–58 s (sound plays once the page has had a click; see SFX) */
  (function hoots(){setTimeout(()=>{if(cur==="owl"&&!document.hidden&&window.SFX)SFX.hoot();hoots();},35000+Math.random()*23000);})();
  (function auto(ms){setTimeout(()=>{fly();auto(45000+Math.random()*45000);},ms);})(12000);
})();

/* weather v9: the scene follows the real weather or a kind picked in the ☁ picker (clear, cloudy, rain, storm, snow, fog, windy, off;
   intensity auto / light / medium / heavy), with matching sound. Canvas #wx draws rain + splashes, lightning, snow, fog, clouds and blown
   leaves at the display's frame rate (time-based; clouds and fog are pre-rendered sprites). #jungle gets wx-wet/wx-snow/wx-fog/wx-wind,
   #mascot wx-c1/wx-c2/wx-c3.
   Live weather: the place is a city you typed (Open-Meteo geocoding), else the browser location (asked once, saved for 6 h so other
   pages don't ask again), else an approximate place from the network (ipapi.co). Conditions come from Open-Meteo (current + last
   15-min precipitation) and wttr.in; the wetter of the two wins, refreshed every 10 min.
   Sound (after the first click, 🔊 in the nav mutes): rain hiss + drop ticks, thunder after each flash, wind gusts, birds by day and
   crickets at night when it is clear. Keys: js1-wx, js1-wx-lvl, js1-wx-live, js1-wx-loc. */
const WX=(function(){
  const reduce=matchMedia("(prefers-reduced-motion: reduce)");
  const KINDS=[["live","Live","📍"],["clear","Clear","☀️"],["cloudy","Cloudy","☁️"],["rain","Rain","🌧️"],["storm","Storm","⛈️"],["snow","Snow","❄️"],["fog","Fog","🌫️"],["wind","Windy","🍃"],["off","Off","⦸"]];
  const ICON={clear:"☀️",cloudy:"☁️",rain:"🌧️",storm:"⛈️",snow:"❄️",fog:"🌫️",wind:"🍃",off:"⦸"};
  const RANK={clear:0,cloudy:1,fog:2,rain:3,snow:4,storm:5};
  /* WMO weather codes (Open-Meteo) → [kind, level, description] */
  const CODES={0:["clear",1,"Clear sky"],1:["clear",1,"Mainly clear"],2:["cloudy",1,"Partly cloudy"],3:["cloudy",2,"Overcast"],45:["fog",2,"Fog"],48:["fog",3,"Rime fog"],
    51:["rain",1,"Light drizzle"],53:["rain",1,"Drizzle"],55:["rain",2,"Dense drizzle"],56:["rain",1,"Freezing drizzle"],57:["rain",2,"Freezing drizzle"],
    61:["rain",1,"Light rain"],63:["rain",2,"Rain"],65:["rain",3,"Heavy rain"],66:["rain",2,"Freezing rain"],67:["rain",3,"Heavy freezing rain"],
    71:["snow",1,"Light snow"],73:["snow",2,"Snow"],75:["snow",3,"Heavy snow"],77:["snow",1,"Snow grains"],80:["rain",1,"Rain showers"],81:["rain",2,"Rain showers"],82:["rain",3,"Violent showers"],
    85:["snow",2,"Snow showers"],86:["snow",3,"Heavy snow showers"],95:["storm",2,"Thunderstorm"],96:["storm",3,"Thunderstorm, hail"],99:["storm",3,"Thunderstorm, heavy hail"]};
  /* wttr.in (WWO) codes → [kind, level] */
  const WWO=c=>{c=+c;if([113].includes(c))return ["clear",1];if([116,119,122].includes(c))return ["cloudy",c===116?1:2];if([143,248,260].includes(c))return ["fog",2];
    if([200,386,389,392,395].includes(c))return ["storm",c===389||c===395?3:2];
    if([179,182,185,227,230,317,320,323,326,329,332,335,338,350,362,365,368,371,374,377].includes(c))return ["snow",[227,230,335,338,371,377].includes(c)?3:2];
    if([176,263,266,281,284,293,296,353].includes(c))return ["rain",1];if([299,302,311,356].includes(c))return ["rain",2];if([305,308,314,359].includes(c))return ["rain",3];return null;};
  const jget=k=>{try{return JSON.parse(store.get(k)||"null");}catch(e){return null;}};
  let mode=store.get("js1-wx")||"live",lv=+(store.get("js1-wx-lvl")||0)||0,live=jget("js1-wx-live"),loc=jget("js1-wx-loc"),status="",busy=false;
  if(live&&live.kind==null)live=null;
  let kind="clear",lvl=2,windy=false,dark=false;
  const cv=document.createElement("canvas");cv.id="wx";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);
  const ctx=cv.getContext("2d");let W=0,H=0,dpr=1,raf=0,last=0,T=0;
  const R=(a,b)=>a+Math.random()*(b-a);
  let drops=[],splash=[],flakes=[],fogs=[],clouds=[],leaves=[],bolt=null,flash=0,nextBolt=0;
  function isDark(){const m=getComputedStyle(document.body).backgroundColor.match(/\d+/g)||[255,255,255];return (+m[0]*.3+ +m[1]*.59+ +m[2]*.11)<110;}
  /* soft round sprite (pre-rendered once per colour), drawn scaled for clouds and fog banks */
  const SPR={};function sprite(rgb,a){const key=rgb+a;if(SPR[key])return SPR[key];const c=document.createElement("canvas");c.width=c.height=128;const g=c.getContext("2d"),gr=g.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,"rgba("+rgb+","+a+")");gr.addColorStop(.55,"rgba("+rgb+","+(a*.45).toFixed(3)+")");gr.addColorStop(1,"rgba("+rgb+",0)");g.fillStyle=gr;g.fillRect(0,0,128,128);return SPR[key]=c;}
  function size(){dpr=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);seed();}
  /* particle sets for the current kind and level */
  function seed(){const k=kind,L=lvl;
    const nr=k==="rain"?[0,150,260,420][L]:k==="storm"?[0,260,380,560][L]:0;
    drops=[];for(let i=0;i<nr;i++)drops.push({x:R(-100,W+100),y:R(-H,H),l:R(12,24),v:R(760,1150),a:R(.55,1)});
    flakes=[];if(k==="snow")for(let i=0,n=[0,80,160,300][L];i<n;i++)flakes.push({x:R(0,W),y:R(-H,H),r:R(1.2,3.6),v:R(30,85),ph:R(0,6.28),f:R(.6,1.6)});
    fogs=[];if(k==="fog")for(let i=0,n=4+2*L;i<n;i++)fogs.push({x:R(-200,W),y:R(H*.1,H*.95),r:R(200,420),v:R(8,24)*(Math.random()<.5?1:-1)});
    clouds=[];if(k!=="clear"&&k!=="off")for(let i=0,n=k==="cloudy"?3+2*L:6;i<n;i++)clouds.push({x:R(-300,W),y:R(-60,H*.16),r:R(160,300),v:R(6,18)});
    leaves=[];if(windy)for(let i=0;i<16;i++)leaves.push(leaf(true));
    splash=[];bolt=null;flash=0;nextBolt=R(2,6);}
  function leaf(any){return {x:any?R(-W*.5,W):R(-160,-20),y:R(H*.05,H*.9),vx:R(160,320),vy:R(-30,40),r:R(0,6.28),vr:R(-6,6),s:R(4,7),c:["#5f9a34","#94c454","#c9a227","#a4652a"][Math.floor(R(0,4))],ph:R(0,6.28)};}
  function makeBolt(){const x0=R(W*.35,W*.95);let x=x0,y=0;const P=[[x,y]],end=R(H*.45,H*.85),B=[];
    while(y<end){y+=R(14,34);x+=R(-26,26);P.push([x,y]);if(Math.random()<.18){const b=[[x,y]];let bx=x,by=y;for(let j=0;j<4;j++){by+=R(12,26);bx+=R(-30,30);b.push([bx,by]);}B.push(b);}}
    return {P,B,t:0};}
  function line(P){ctx.beginPath();ctx.moveTo(P[0][0],P[0][1]);for(let i=1;i<P.length;i++)ctx.lineTo(P[i][0],P[i][1]);ctx.stroke();}
  function frame(now){raf=requestAnimationFrame(frame);const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;T+=dt;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    const k=kind,wx=(windy?.55:.12);
    /* gloom: a faint blue-grey veil in light themes */
    const veil={rain:.05,storm:.1,snow:.04,fog:.03}[k];if(veil&&!dark){ctx.fillStyle="rgba(40,52,72,"+veil+")";ctx.fillRect(0,0,W,H);}
    if(clouds.length){const a=k==="storm"?.17:k==="rain"?.13:.09,s=sprite(dark?"190,200,220":k==="storm"||k==="rain"?"70,80,96":"120,130,145",a);
      for(const c of clouds){c.x+=c.v*dt*(windy?3:1);if(c.x-c.r>W)c.x=-c.r*1.5;ctx.drawImage(s,c.x-c.r,c.y-c.r*.7,2*c.r,1.4*c.r);}}
    if(fogs.length){const s=sprite(dark?"200,208,220":"235,238,242",dark?.1:.5);
      for(const f of fogs){f.x+=f.v*dt;if(f.x-f.r>W)f.x=-f.r;if(f.x+f.r<0)f.x=W+f.r;ctx.drawImage(s,f.x-f.r,f.y-f.r*.6,2*f.r,1.2*f.r);}}
    if(drops.length){ctx.lineCap="round";
      /* two passes: far drops thin and faint, near drops brighter */
      for(const near of [false,true]){ctx.strokeStyle=dark?(near?"rgba(185,208,240,.5)":"rgba(160,185,220,.26)"):(near?"rgba(60,85,120,.42)":"rgba(80,105,140,.22)");ctx.lineWidth=near?1.3:.9;ctx.beginPath();
        for(const d of drops){if((d.a>.8)!==near)continue;d.y+=d.v*dt;d.x+=wx*d.v*dt;
          if(d.y>H){if(near&&Math.random()<.6)splash.push({x:d.x,y:H-R(0,6),t:0});d.y=R(-120,-10);d.x=R(-200,W+50);}
          ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-wx*d.l,d.y-d.l);}
        ctx.stroke();}
      ctx.strokeStyle=dark?"rgba(170,195,230,.5)":"rgba(70,95,130,.45)";ctx.lineWidth=1;
      splash=splash.filter(s=>(s.t+=dt)<.35);for(const s of splash){const u=s.t/.35;ctx.globalAlpha=1-u;ctx.beginPath();ctx.ellipse(s.x,s.y,2+9*u,1+2.5*u,0,Math.PI,0);ctx.stroke();}
      ctx.globalAlpha=1;}
    if(flakes.length){ctx.fillStyle="rgba(255,255,255,.95)";ctx.strokeStyle=dark?"rgba(0,0,0,0)":"rgba(90,110,140,.35)";ctx.lineWidth=.8;
      for(const f of flakes){f.y+=f.v*dt;f.x+=(Math.sin(T*f.f+f.ph)*22+wx*90)*dt;if(f.y>H+5){f.y=-5;f.x=R(-50,W);}if(f.x>W+10)f.x=-10;
        ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,6.2832);ctx.fill();if(!dark)ctx.stroke();}}
    for(const l of leaves){l.x+=l.vx*dt;l.y+=(l.vy+Math.sin(T*3+l.ph)*40)*dt;l.r+=l.vr*dt;if(l.x>W+30||l.y>H+30||l.y<-30)Object.assign(l,leaf(false));
      ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.r);ctx.scale(1,Math.abs(Math.cos(T*4+l.ph))*.8+.2);ctx.fillStyle=l.c;ctx.beginPath();ctx.ellipse(0,0,l.s,l.s*.45,0,0,6.2832);ctx.fill();ctx.restore();}
    if(k==="storm"){nextBolt-=dt;if(nextBolt<=0){bolt=makeBolt();flash=1;nextBolt=R(4,10)/(lvl||1)*1.6;setTimeout(()=>{flash=Math.max(flash,.7);},140);
        /* thunder follows the flash, later and softer when the strike is far */
        const far=Math.random();setTimeout(()=>{if(window.SFX)SFX.thunder(.45+.6*(1-far));},250+far*2200);}
      if(flash>0){ctx.fillStyle="rgba(235,240,255,"+(flash*(dark?.22:.35)).toFixed(3)+")";ctx.fillRect(0,0,W,H);flash=Math.max(0,flash-dt*4);}
      if(bolt&&(bolt.t+=dt)<.35){const a=1-bolt.t/.35;ctx.save();ctx.globalAlpha=a*.35;ctx.strokeStyle="rgb(200,180,255)";ctx.lineWidth=7;line(bolt.P);
        ctx.globalAlpha=a;ctx.strokeStyle="#fff";ctx.lineWidth=2.2;line(bolt.P);ctx.lineWidth=1.1;bolt.B.forEach(line);ctx.restore();}}}
  function stop(){cancelAnimationFrame(raf);raf=0;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);}
  function start(){if(raf||document.hidden||reduce.matches)return;if(kind==="clear"&&!windy||kind==="off")return;last=performance.now();raf=requestAnimationFrame(frame);}

  /* ambience: a bus of looping noise layers + scheduled ticks, cross-faded when the weather changes */
  const AMB=(function(){let key="",bus=null,srcs=[],tm=[];
    function fade(){tm.forEach(clearInterval);tm=[];if(!bus)return;const ac=SFX.ac,b=bus,ss=srcs;bus=null;srcs=[];
      b.gain.setTargetAtTime(0,ac.currentTime,.6);setTimeout(()=>{ss.forEach(s=>{try{s.stop();}catch(e){}});try{b.disconnect();}catch(e){}},3500);}
    function build(k,L,wind,night){const ac=SFX.ac,v=[0,.6,.85,1.1][L]||.85;
      bus=ac.createGain();bus.gain.value=0;bus.connect(SFX.out);bus.gain.setTargetAtTime(1,ac.currentTime,1.2);
      const layer=(type,f,q,vol)=>{const s=ac.createBufferSource();s.buffer=SFX.noise;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
        const g=ac.createGain();g.gain.value=vol;s.connect(fl);fl.connect(g);g.connect(bus);s.start(0,Math.random()*1.8);srcs.push(s);return {fl,g};};
      const lfo=(param,hz,depth)=>{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=hz;g.gain.value=depth;o.connect(g);g.connect(param);o.start();srcs.push(o);};
      if(k==="rain"||k==="storm"){const s=k==="storm"?1.25:1;
        layer("bandpass",1300,.45,.2*v*s);layer("highpass",4800,.4,.045*v*s);layer("lowpass",260,.5,.11*v*s);
        tm.push(setInterval(()=>{if(!SFX.ok)return;const t=SFX.ac.currentTime;for(let i=0,n=Math.round(4+7*v*s);i<n;i++)SFX.drop(t+Math.random()*.25,v);},250));}
      if(wind||k==="storm"||k==="snow"||k==="fog"||k==="cloudy"){const strong=wind||k==="storm",w=layer("bandpass",380,.8,strong?.16:k==="snow"?.08:.045);
        lfo(w.g.gain,.09+Math.random()*.05,strong?.1:.025);lfo(w.fl.frequency,.06,strong?220:90);}
      if(night&&(k==="clear"||k==="cloudy"))tm.push(setInterval(()=>{if(!SFX.ok)return;const t=SFX.ac.currentTime;for(let i=0;i<3;i++)if(Math.random()<.7)SFX.cricket(t+i*.42+Math.random()*.1,k==="clear"?1:.6);},1300));
      if(!night&&k==="clear")tm.push(setInterval(()=>{if(SFX.ok&&Math.random()<.4)SFX.chirp(.45);},3200));}
    function set(k,L,wind,night){const S=window.SFX,nk=S&&S.on&&S.ok&&!document.hidden&&k!=="off"?[k,L,wind,night].join():"";if(nk===key)return;key=nk;fade();if(nk)build(k,L,wind,night);}
    return {set};})();
  const night=()=>{if(mode==="live"&&live&&live.day!=null&&Date.now()-live.t<3*3600e3)return !live.day;const h=new Date().getHours();return h<6||h>=18;};
  const sound=()=>AMB.set(kind,lvl,windy,night());

  /* work out what to show, then update the tree, the mascot, the canvas and the sound */
  function apply(){
    if(mode==="off"){kind="off";windy=false;}
    else if(mode==="live"){kind=live?live.kind:"clear";lvl=lv||(live?live.lvl:2);windy=!!(live&&live.wind>=28);}
    else{kind=mode==="wind"?"clear":mode;windy=mode==="wind";lvl=lv||2;}
    if(mode!=="live"&&mode!=="wind"&&lv===0)lvl=2;
    dark=isDark();
    const ms=document.getElementById("mascot");
    for(const jg of [document.getElementById("jungle"),document.getElementById("jungleL")])if(jg){jg.classList.toggle("wx-wet",kind==="rain"||kind==="storm");jg.classList.toggle("wx-snow",kind==="snow");jg.classList.toggle("wx-fog",kind==="fog");jg.classList.toggle("wx-wind",windy||kind==="storm");}
    if(ms){ms.classList.toggle("wx-c1",kind==="cloudy"||kind==="fog");ms.classList.toggle("wx-c2",kind==="rain"||kind==="storm");ms.classList.toggle("wx-c3",kind==="snow");}
    if(btn){btn.textContent=windy&&kind==="clear"?ICON.wind:ICON[kind]||"☀️";btn.title="Weather: "+label();}
    stop();seed();start();sound();if(!pk.hidden)paint();}
  function label(){if(mode==="off")return "off";
    return mode==="live"?(live?live.desc+", "+Math.round(live.temp)+"°C"+(live.place?" · "+live.place:""):"live (no data yet)"):(KINDS.find(x=>x[0]===mode)||[,mode])[1];}

  /* where: a typed city wins; else the browser location (saved for 6 h); else an approximate place from the network */
  const saveLoc=o=>{loc=o;store.set("js1-wx-loc",JSON.stringify(o));return o;};
  function viaIP(){return fetch("https://ipapi.co/json/").then(r=>r.json()).then(j=>{if(j.latitude==null)throw 0;
    return saveLoc({la:+(+j.latitude).toFixed(2),lo:+(+j.longitude).toFixed(2),name:j.city||"",src:"ip",t:Date.now()});});}
  function where(force){
    if(loc&&(loc.src==="city"||(!force&&loc.src==="gps"&&Date.now()-loc.t<6*3600e3)))return Promise.resolve(loc);
    return new Promise(res=>{
      const fallback=why=>{status=why;viaIP().then(res,()=>res(loc||null));};
      if(!navigator.geolocation)return fallback("This browser has no location access.");
      navigator.geolocation.getCurrentPosition(p=>res(saveLoc({la:+p.coords.latitude.toFixed(2),lo:+p.coords.longitude.toFixed(2),name:"",src:"gps",t:Date.now()})),
        e=>fallback(e.code===1?"Location access is blocked for this page.":"The browser could not get a location (is Windows location turned on?)."),
        {timeout:9000,maximumAge:30*60e3});});}
  /* what: Open-Meteo (current code, precipitation now and in the last hour) and wttr.in; the wetter answer wins */
  function conditions(L){
    const om=fetch("https://api.open-meteo.com/v1/forecast?latitude="+L.la+"&longitude="+L.lo+"&current=temperature_2m,weather_code,wind_speed_10m,precipitation,is_day&minutely_15=precipitation&past_minutely_15=4&forecast_minutely_15=1")
      .then(r=>r.json()).then(j=>{const c=j.current,cd=CODES[c.weather_code]||["cloudy",1,"Cloudy"],p=Math.max(c.precipitation||0,...((j.minutely_15||{}).precipitation||[0]).slice(-3));
        let k=cd[0],l=cd[1],desc=cd[2];if(p>0&&RANK[k]<RANK.rain){k="rain";l=p>2?2:1;desc=p>2?"Rain":"Light rain";}
        return {kind:k,lvl:l,desc,temp:c.temperature_2m,wind:c.wind_speed_10m,day:c.is_day};});
    const wt=fetch("https://wttr.in/"+L.la+","+L.lo+"?format=j1").then(r=>r.json()).then(j=>{const c=j.current_condition[0],m=WWO(c.weatherCode)||["cloudy",1];
        let [k,l]=m;if(+c.precipMM>0&&RANK[k]<RANK.rain){k="rain";l=1;}return {kind:k,lvl:l,desc:c.weatherDesc[0].value,temp:+c.temp_C,wind:+c.windspeedKmph};});
    return Promise.allSettled([om,wt]).then(([a,b])=>{const A=a.status==="fulfilled"?a.value:null,B=b.status==="fulfilled"?b.value:null;if(!A&&!B)throw 0;
      const w=!A?B:!B?A:(RANK[B.kind]>RANK[A.kind]?Object.assign({},A,{kind:B.kind,lvl:B.lvl,desc:B.desc}):A);w.lvl=Math.max(w.lvl,A&&B&&A.kind===B.kind?Math.max(A.lvl,B.lvl):w.lvl);return w;});}
  function fetchLive(force){
    if(mode!=="live"||busy)return;
    if(!force&&live&&Date.now()-live.t<10*60e3){apply();return;}
    if(!window.fetch){status="This browser can't fetch live weather.";apply();return;}
    busy=true;status="Finding your location…";if(!pk.hidden)paint();
    where(force).then(L=>{if(!L){busy=false;status+=" Type your city below.";apply();return;}
      if(!pk.hidden)paint();
      return conditions(L).then(w=>{live=Object.assign(w,{t:Date.now(),place:L.name||"",src:L.src});store.set("js1-wx-live",JSON.stringify(live));
          if(L.src!=="ip")status="";busy=false;apply();},
        ()=>{busy=false;status="Could not reach the weather services. Showing the last known weather.";apply();});});}
  function setCity(name){name=name.trim();if(!name)return;status="Looking up "+name+"…";paint();
    fetch("https://geocoding-api.open-meteo.com/v1/search?count=1&name="+encodeURIComponent(name)).then(r=>r.json()).then(j=>{const g=j.results&&j.results[0];
      if(!g){status="No place called “"+name+"” was found.";paint();return;}
      saveLoc({la:+g.latitude.toFixed(2),lo:+g.longitude.toFixed(2),name:g.name+(g.admin1?", "+g.admin1:""),src:"city",t:Date.now()});
      status="";if(mode!=="live"){mode="live";store.set("js1-wx","live");}fetchLive(true);},()=>{status="Could not reach the place search.";paint();});}

  /* picker: the weather button in the nav opens it */
  const tb=document.getElementById("theme");let btn=null;
  const pk=document.createElement("div");pk.className="thm";pk.hidden=true;pk.setAttribute("role","dialog");pk.setAttribute("aria-label","Weather");document.body.appendChild(pk);
  const SRC={city:"your city",gps:"your location",ip:"approximate, from your network"};
  function paint(){
    pk.innerHTML='<h4>Weather</h4><div class="thm-g wx-g">'+KINDS.map(([id,n,ic])=>'<button type="button" data-wx="'+id+'" aria-pressed="'+(id===mode)+'"><b>'+ic+"</b>"+n+"</button>").join("")+"</div>"+
      '<div class="thm-row wx-lv"><span>Intensity</span><span>'+[[0,"Auto"],[1,"Light"],[2,"Medium"],[3,"Heavy"]].map(([v,n])=>'<button type="button" data-lv="'+v+'" aria-pressed="'+(v===lv)+'">'+n+"</button>").join("")+"</span></div>"+
      '<form class="wx-city"><input type="text" placeholder="Your city, e.g. Nellore" aria-label="Your city" value="'+(loc&&loc.src==="city"?esc(loc.name.split(",")[0]):"")+'" spellcheck="false"><button type="submit">Set</button></form>'+
      '<p class="wx-st">'+(mode==="live"?(live?"<b>Live:</b> "+esc(live.desc)+", "+Math.round(live.temp)+"°C, wind "+Math.round(live.wind)+" km/h"+(live.place?" in <b>"+esc(live.place)+"</b>":"")+
          " · "+new Date(live.t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+' · <a href="#" data-rf="1">refresh</a>':"")+
        (loc?'<br><span style="font-size:.74rem">Place: '+(loc.name?esc(loc.name)+" · ":"")+SRC[loc.src]+(loc.src==="city"?' · <a href="#" data-gps="1">use my location instead</a>':"")+"</span>":"")+
        (status?"<br>"+esc(status):"")+'<br><span style="font-size:.74rem">Open-Meteo + wttr.in, refreshed every 10 min. Sound starts after your first click; 🔊 mutes it.</span>'
        :"Showing <b>"+label()+"</b>. Choose <b>Live</b> to follow the real weather.")+
      (reduce.matches?"<br>Your system asks for reduced motion, so rain and snow are not animated.":"")+"</p>";}
  if(tb){btn=document.createElement("button");btn.id="wxBtn";btn.type="button";btn.setAttribute("aria-label","Weather");btn.setAttribute("aria-expanded","false");tb.before(btn);
    const close=()=>{pk.hidden=true;btn.setAttribute("aria-expanded","false");};
    btn.onclick=e=>{e.stopPropagation();if(!pk.hidden)return close();paint();const r=btn.getBoundingClientRect();pk.style.top=(r.bottom+8)+"px";pk.style.right=Math.max(12,innerWidth-r.right)+"px";pk.hidden=false;btn.setAttribute("aria-expanded","true");};
    pk.addEventListener("submit",e=>{e.preventDefault();const i=$("input",pk);if(i)setCity(i.value);});
    pk.addEventListener("click",e=>{const a=e.target.closest("[data-rf],[data-gps]");if(a){e.preventDefault();if(a.dataset.gps){loc=null;store.set("js1-wx-loc","");}fetchLive(true);return;}
      const b=e.target.closest("button");if(!b||b.type==="submit")return;if(b.dataset.wx)set(b.dataset.wx);else if(b.dataset.lv!=null){lv=+b.dataset.lv;store.set("js1-wx-lvl",String(lv));apply();}});
    document.addEventListener("click",e=>{if(!pk.hidden&&!e.target.closest(".thm,#wxBtn"))close();});
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!pk.hidden){close();btn.focus();}});
    addEventListener("resize",close,{passive:true});}
  function set(m){mode=m;store.set("js1-wx",m);status="";apply();if(m==="live")fetchLive(false);}
  size();addEventListener("resize",()=>{size();},{passive:true});
  document.addEventListener("visibilitychange",()=>{document.hidden?stop():start();sound();});
  document.addEventListener("sfxready",sound);
  document.addEventListener("themechange",()=>setTimeout(apply,50));reduce.addEventListener("change",apply);
  apply();if(mode==="live")setTimeout(()=>fetchLive(false),800);
  setInterval(()=>{if(mode==="live"&&!document.hidden)fetchLive(false);},3*60e3);
  setInterval(sound,10*60e3);
  return {set,city:setCity,get mode(){return mode;},get live(){return live;},KINDS};
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
  const TOOLS=[["String Pool visualizer","#poolviz","pool"],["Method explorer","#mx","methods"],["Character inspector","#ci","unicode"],["StringBuilder capacity simulator","#capviz","d-builder"],
    ["String algorithm stepper","#sviz","s-window"],["Array algorithm stepper","#aviz","a-patterns"],["Playground","#playground","playground"],["Mock interview","#mockviz","mock"],["Complexity cheat sheet","#bigo","bigo"],["Memory Lab","#mlApp","memlab"],["Algorithm race","#raceApp","race"],["Car Factory (class vs object)","#olFactory","o-class"],["Boxes and car keys (primitive vs reference)","#anBoxes","f-types"],["Car odometer (overflow)","#anOdo","f-operators"],["Waterfall (switch fall-through)","#anFall","f-control"],["Stack of plates (call stack)","#anPlates","f-methods"],["Photocopies and spare keys (pass-by-value)","#anCopy","f-pass"],["Identical twins (== vs equals)","#anTwins","compare"],["Stone tablets vs whiteboard","#anTablet","build"],["Caterpillar (sliding window)","#anCat","s-window"],["Numbered lockers (arrays)","#anLockers","a-what"],["Cinema seats (2D arrays)","#anCinema","a-multi"],["Guess the number (binary search)","#anGuess","a-sort"],["Town clock (static)","#anClock","o-static"],["Four pillars as a car","#olStory","o-review"],["Object lab (references and GC)","#olObj","o-class"],["Initialisation order","#olInit","o-ctor"],["Access modifier map","#olAccess","o-encap"],["static vs instance","#olStatic","o-static"],["Fragile base class","#olFragile","o-inherit"],["Dispatch simulator","#olDispatch","o-poly"],["Default-method resolver","#olDiamond","o-abstract"],["HashSet buckets (equals/hashCode)","#olHash","o-object"],["Record expander","#olRecord","o-modern"],["Exhaustive switch checker","#olSealed","o-modern"],["Learning path: sorting from scratch","#bsPath","bs-explorer"],["The three moves: compare, swap, shift","#bsMoves","bs-explorer"],["Sorting explorer (every interview sort)","#bsx","bs-explorer"],["Watch the loops count (Big-O)","#cxLoops","cx-complexity"],["Growth chart: O(1) to O(n!)","#cxGrow","cx-complexity"],["Recursion tree: time vs stack space","#cxTree","cx-complexity"],["Amortized O(1): ArrayList growth","#cxAmort","cx-complexity"],["Bubble Lab (11 sorting variants)","#bsLab","bs-what"],["Valet parking (bubble sort)","#anValet","bs-what"],["Stability lab","#bsStable","bs-generic"],["Inversions grid","#bsInv","bs-special"],["Complexity chart (bubble sort)","#bsChart","bs-cost"],["Bubble sort variant race","#bsRace","bs-cost"],["Review queue","#revise","revise"],["Checklist","#chk","revise"]];
  let E=[],vis=[],sel=0;
  function entries(){const L=[],A=(g,n,t,run,hint)=>L.push({g,n,t,run,hint:hint||""});
    A("Commands","›","Choose a theme…",()=>$("#theme").click());
    A("Commands","›",MOTION_OFF?"Turn all animations on":"Turn all animations off (stop everything)",()=>setMotion(MOTION_OFF));
    A("Commands","📖",store.get("js1-gloss")==="0"?"Turn glossary hints on (dotted words)":"Turn glossary hints off",()=>{store.set("js1-gloss",store.get("js1-gloss")==="0"?"1":"0");location.reload();});
    {let L0=null;try{L0=JSON.parse(store.get("js1-last")||"null");}catch(e){}if(L0&&SECP[L0.id])A("Commands","↩","Continue where you left off: "+L0.l+" · "+L0.n+" "+L0.t,()=>{location.href=secUrl(L0.id);});}
    A("Commands","›","Turn the ∞ background animation "+(THM.on?"off":"on"),()=>THM.anim());
    A("Commands","›","Summon the fire rider",()=>RIDER.go());
    A("Commands","🎃","Halloween mode: "+(HALLOWEEN.on?"turn off":"turn on"),()=>HALLOWEEN.set(HALLOWEEN.on?"0":"1"));A("Commands","🎃","Halloween mode: automatic (21 Oct – 1 Nov)",()=>HALLOWEEN.set(""));
    A("Commands","🪔","Diwali mode: "+(FEST.diwali?"turn off":"turn on"),()=>FEST.set("diwali",FEST.diwali?"0":"1"));A("Commands","🪔","Diwali mode: automatic (5 days around Diwali)",()=>FEST.set("diwali",""));
    A("Commands","🎄","Christmas mode: "+(FEST.xmas?"turn off":"turn on"),()=>FEST.set("xmas",FEST.xmas?"0":"1"));A("Commands","🎄","Christmas mode: automatic (15 Dec – 1 Jan)",()=>FEST.set("xmas",""));
    A("Commands","🎆","Launch fireworks",()=>{for(let i=0;i<5;i++)setTimeout(()=>FEST.firework(innerWidth*(.2+.6*Math.random()),innerHeight*(.15+.25*Math.random())),i*380);});
    WX.KINDS.forEach(([id,n,ic])=>A("Weather",ic,"Weather: "+n,()=>WX.set(id)));
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
    $$(".quiz[data-quiz]").forEach(q=>A("Quizzes","?",/^l\d+$/.test(q.dataset.quiz)?"Quiz · Lesson "+q.dataset.quiz.slice(1):"Quiz · "+(((thisPage&&thisPage.sections.find(s=>s.id===(q.closest("section")||{}).id))||{}).t||"Check yourself"),()=>jump(q)));
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
  nb.innerHTML='⌕ <em>'+MOD+" K</em>";nb.onclick=openPal;$("#tocBtn").before(nb);
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
    if(n.nodeType===3&&n.textContent.trim()){const s=document.createElement("span");s.className="w";s.textContent=n.textContent.trim();h1.replaceChild(s,n);h1.insertBefore(document.createTextNode(" "),s.nextSibling);}
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


let OLF=null;
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


/* Analogy visuals (v26): one memorable real-world picture per key concept, all over the course (the user asked for the Car
   Factory kind of thing "all over the document"). Hosts are .viz.an[id] on each lesson page; each builder is guarded by its id.
   Shared: AN.head (title + memory hooks), AN.steps (a Back / Play / Next player over a list of frames), OLF.carSvg (the car). */
(function(){
  if(!$(".an[id]"))return;
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait=ms=>new Promise(r=>setTimeout(r,still?Math.min(ms,40):ms));
  const car=(c,k)=>OLF?OLF.carSvg(c,k):"🚗";
  const pop=el=>{if(el&&!still)el.animate([{transform:"scale(.6)",opacity:0},{transform:"scale(1.08)",opacity:1,offset:.7},{transform:"none",opacity:1}],{duration:450,easing:"cubic-bezier(.2,1.4,.4,1)"});};
  const shake=el=>{if(el&&!still)el.animate([{transform:"translateX(0)"},{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"translateX(0)"}],{duration:320});};
  const head=(t,sub,hooks)=>'<div class="ol-head an-h"><b>'+t+"</b><span>"+sub+"</span></div>"+(hooks?'<div class="an-hooks">'+hooks.map(h=>"<span>"+h+"</span>").join("")+"</div>":"");
  /* a stepper: frames = [{code, msg, apply(state)}]; render(state) paints; state rebuilt from scratch on Back */
  function stepper(host,frames,init,render,unhot){let k=-1,timer=null;const foot=$(".an-foot",host);const ctl='<div class="ctrl an-ctl"><button type="button" class="btn" data-s="back">◀ Back</button><button type="button" class="btn pri" data-s="play">▶ Play</button><button type="button" class="btn" data-s="next">Next ▶</button><span class="count"></span></div><div class="an-code"></div><div class="msg" aria-live="polite"></div>';
    foot.innerHTML=ctl;
    const go=n=>{k=Math.max(-1,Math.min(frames.length-1,n));const st=init();for(let i=0;i<=k;i++){if(i===k&&unhot)unhot(st);frames[i].apply&&frames[i].apply(st);}render(st,k>=0?frames[k]:null);
      $(".an-code",host).innerHTML=frames.slice(0,k+1).map((f,i)=>f.code?'<div class="'+(i===k?"cur":"")+'">'+hl(f.code)+"</div>":"").join("")||'<div class="dim">// press Next or Play</div>';
      $(".msg",host).innerHTML=k>=0?frames[k].msg:host.dataset.intro||"Press <b>Play</b>, or step with <b>Next</b>.";
      $(".count",host).textContent=(k+1)+" / "+frames.length;$('[data-s="back"]',host).disabled=k<0;$('[data-s="next"]',host).disabled=k>=frames.length-1;};
    const stop=()=>{clearInterval(timer);timer=null;$('[data-s="play"]',host).textContent="▶ Play";};
    foot.addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(!b)return;const s=b.dataset.s;
      if(s==="next"){stop();go(k+1);}else if(s==="back"){stop();go(k-1);}
      else{if(timer){stop();return;}if(k>=frames.length-1)go(-1);b.textContent="❚❚ Pause";timer=setInterval(()=>{if(k>=frames.length-1){stop();return;}go(k+1);},still?600:1700);}});
    go(-1);return {go};}
  const mount=(id,title,sub,hooks,body)=>{const h=$("#"+id);if(!h)return null;h.innerHTML=head(title,sub,hooks)+'<div class="vbody">'+body+'<div class="an-foot"></div></div>';return h;};

  /* ===== L00 · boxes and keys: primitives vs references ===== */
  (function(){const h=mount("anBoxes","Boxes and car keys","A primitive variable holds the value. A reference variable holds a key.",
      ["<b>primitive</b> = the value sits in the box","<b>reference</b> = a key to an object","copy a primitive = photocopy the number","copy a reference = cut a second key"],
      '<div class="an-two"><div class="an-pane"><h5>Variables (boxes on the stack)</h5><div class="an-boxes"></div></div><div class="an-pane"><h5>Objects (the parking lot / heap)</h5><div class="an-lot"></div></div></div>');
    if(!h)return;
    const F=[{code:"int x = 5;",msg:"<code>x</code> is a box with the number <b>5</b> inside. For primitives the value itself lives in the box.",apply:s=>s.v.push({n:"x",t:"int",v:"5"})},
      {code:"int y = x;",msg:"Copying a primitive is a <b>photocopy</b>: <code>y</code> gets its own 5. The two boxes are not connected.",apply:s=>s.v.push({n:"y",t:"int",v:"5",hot:1})},
      {code:"y = 9;",msg:"Change <code>y</code> and only <code>y</code> changes. <code>x</code> is still <b>5</b>.",apply:s=>{s.v[1].v="9";s.v[1].hot=1;}},
      {code:'Car a = new Car();',msg:"An object is too big for a box: it is parked in the lot (the heap). The box <code>a</code> holds only a <b>key</b> to it.",apply:s=>{s.car=1;s.v.push({n:"a",t:"Car",key:1,hot:1});}},
      {code:"Car b = a;",msg:"Copying a reference cuts a <b>second key</b>. Still <b>one</b> car in the lot.",apply:s=>s.v.push({n:"b",t:"Car",key:1,hot:1})},
      {code:'b.paint("red");',msg:"Drive to the car with key <code>b</code> and paint it. Open it with key <code>a</code>: it is <b>red</b> too, because it is the same car. That is all a reference is.",apply:s=>{s.color="#ef4444";s.hot="car";}}];
    stepper(h,F,()=>({v:[],car:0,color:"#3b82f6"}),(s)=>{
      $(".an-boxes",h).innerHTML=s.v.map(v=>'<div class="an-box'+(v.hot?" hot":"")+'"><small>'+v.t+" "+v.n+"</small><b>"+(v.key?"🔑 key #1":v.v)+"</b></div>").join("")||'<div class="ol-empty">no variables yet</div>';
      $(".an-lot",h).innerHTML=s.car?'<div class="an-carcard'+(s.hot==="car"?" hot":"")+'">'+car(s.color)+'<small>Car #1 · keys: '+s.v.filter(v=>v.key).map(v=>v.n).join(", ")+"</small></div>":'<div class="ol-empty">empty lot</div>';
      pop($(".an-box.hot",h));},s=>{s.v.forEach(v=>v.hot=0);s.hot=0;});})();

  /* ===== L00 · odometer: integer overflow ===== */
  (function(){const h=mount("anOdo","The car odometer","Numbers in Java have a fixed number of digits, so they roll over",
      ["a <b>byte</b> = an 8-bit odometer","the top bit = the sign","<b>MAX + 1</b> rolls over to <b>MIN</b>","no error, no warning"],
      '<div class="seg an-seg"><button type="button" data-m="byte" class="on">byte (8 bits)</button><button type="button" data-m="int">int (32 bits)</button></div><div class="an-odo"><div class="an-dial">🚗<span class="an-num"></span></div><div class="an-bits"></div></div>'+
      '<div class="ol-cmds"><button type="button" class="btn" data-o="-1">− 1</button><button type="button" class="btn pri" data-o="1">+ 1</button><button type="button" class="chip" data-o="max">jump to MAX</button><button type="button" class="chip" data-o="min">jump to MIN</button><button type="button" class="chip" data-o="zero">reset to 0</button></div>');
    if(!h)return;let mode="byte",v=125;
    const L={byte:{min:-128,max:127,w:8,wrap:x=>((x+128)%256+256)%256-128,T:"Byte"},int:{min:-2147483648,max:2147483647,w:32,wrap:x=>x|0,T:"Integer"}};
    $(".an-foot",h).innerHTML='<div class="an-code"></div><div class="msg" aria-live="polite"></div>';
    function draw(note,roll){const m=L[mode],bits=(mode==="byte"?(v&255):(v>>>0)).toString(2).padStart(m.w,"0");
      $(".an-num",h).textContent=v.toLocaleString("en-US");$(".an-num",h).classList.toggle("neg",v<0);
      $(".an-bits",h).innerHTML=bits.split("").map((b,i)=>'<i class="'+(b==="1"?"on":"")+(i===0?" sign":"")+'">'+b+"</i>").join("");$(".an-bits",h).classList.toggle("w32",mode==="int");
      if(roll&&!still)$(".an-dial",h).animate([{transform:"rotateX(0)"},{transform:"rotateX(90deg)"},{transform:"rotateX(0)"}],{duration:500});
      $(".msg",h).innerHTML=note||("The leftmost bit is the <b>sign</b> (1 = negative). Range: "+m.min.toLocaleString("en-US")+" to "+m.max.toLocaleString("en-US")+". Press <b>+ 1</b> near the top.");}
    h.addEventListener("click",e=>{const s=e.target.closest(".an-seg [data-m]");if(s){mode=s.dataset.m;$$(".an-seg button",h).forEach(b=>b.classList.toggle("on",b===s));v=L[mode].max-2;$(".an-code",h).innerHTML="";draw();return;}
      const b=e.target.closest("[data-o]");if(!b)return;const m=L[mode],o=b.dataset.o,ty=mode;
      if(o==="max"){v=m.max;$(".an-code",h).innerHTML=hl(ty+" n = "+m.T+".MAX_VALUE;   // "+m.max);draw();return;}
      if(o==="min"){v=m.min;$(".an-code",h).innerHTML=hl(ty+" n = "+m.T+".MIN_VALUE;   // "+m.min);draw();return;}
      if(o==="zero"){v=0;$(".an-code",h).innerHTML=hl(ty+" n = 0;");draw();return;}
      const d=+o,raw=v+d,nv=m.wrap(raw),rolled=raw!==nv;v=nv;
      $(".an-code",h).innerHTML=hl("n"+(d>0?"++":"--")+";   // n is now "+nv+(rolled?"  (rolled over!)":""));
      draw(rolled?(d>0?"<b>Rolled over!</b> Like a car odometer going from 999999 to 000000, the bits wrapped: "+m.max.toLocaleString("en-US")+" + 1 = <b>"+m.min.toLocaleString("en-US")+"</b>. Java gives no error. Use <code>long</code>, or <code>Math.addExact</code> to get an exception instead.":"Rolled under: "+m.min.toLocaleString("en-US")+" − 1 = <b>"+m.max.toLocaleString("en-US")+"</b>."):null,rolled);if(rolled)shake($(".an-odo",h));});
    v=125;draw();})();

  /* ===== L00 · photocopy and key copy: pass-by-value ===== */
  (function(){const h=mount("anCopy","Photocopies and spare keys","Java always hands a method a copy. For objects, the copy is a key.",
      ["argument = a <b>photocopy</b>","primitive: the method scribbles on its copy","object: the copy is a <b>spare key</b>","it can paint your car, not swap it"],
      '<div class="seg an-seg"><button type="button" data-c="0" class="on">change(int x)</button><button type="button" data-c="1">paint(Car c)</button><button type="button" data-c="2">replace(Car c)</button></div><div class="an-three"><div class="an-pane"><h5>main()</h5><div class="an-side" data-w="main"></div></div><div class="an-pane an-mid"><h5>the car lot</h5><div class="an-lot"></div></div><div class="an-pane"><h5>the method</h5><div class="an-side" data-w="m"></div></div></div>');
    if(!h)return;
    const SC=[
      [{code:"int n = 5;",msg:"Your note says <b>5</b>.",apply:s=>s.main.push(["n","📝 5"])},
       {code:"change(n);",msg:"Java makes a <b>photocopy</b> of the note and hands it to the method as <code>x</code>.",apply:s=>s.m.push(["x","📝 5",1])},
       {code:"    x = 99;   // inside change",msg:"The method scribbles <b>99</b> on <i>its photocopy</i>.",apply:s=>s.m[0]=["x","📝 99",1]},
       {code:"System.out.println(n);   // 5",msg:"The method returns and its photocopy is thrown away. Your note still says <b>5</b>.",apply:s=>{s.m=[];s.main[0][2]=1;}}],
      [{code:"Car mine = new Car();",msg:"You own a blue car and hold its key.",apply:s=>{s.car=1;s.main.push(["mine","🔑 key #1"]);}},
       {code:"paint(mine);",msg:"Java cuts a <b>spare key</b> (a copy of the reference) and hands it over as <code>c</code>.",apply:s=>s.m.push(["c","🔑 key #1",1])},
       {code:'    c.paint("red");   // inside paint',msg:"The method uses the spare key to reach <b>your</b> car and paints it red.",apply:s=>{s.color="#ef4444";s.hot=1;}},
       {code:"System.out.println(mine.color);   // red",msg:"Back in <code>main</code>, your car is red. The method changed the <b>object</b>, through a copy of the key.",apply:s=>{s.m=[];s.main[0][2]=1;}}],
      [{code:"Car mine = new Car();",msg:"You own a blue car.",apply:s=>{s.car=1;s.main.push(["mine","🔑 key #1"]);}},
       {code:"replace(mine);",msg:"The method gets a spare key, <code>c</code>.",apply:s=>s.m.push(["c","🔑 key #1",1])},
       {code:"    c = new Car();   // inside replace",msg:"The method throws its spare key away and takes a key to a <b>new</b> car. That changes only its own copy.",apply:s=>{s.car2=1;s.m[0]=["c","🔑 key #2",1];}},
       {code:"// mine still opens car #1",msg:"Your key still opens your original car. A method can never make <i>your</i> variable point somewhere else: that would be pass-by-reference, and Java doesn't have it.",apply:s=>{s.m=[];s.main[0][2]=1;}}]];
    let sc=0,st=null;
    const render=s=>{const side=(arr)=>arr.map(([n,v,hot])=>'<div class="an-box'+(hot?" hot":"")+'"><small>'+n+"</small><b>"+v+"</b></div>").join("")||'<div class="ol-empty">—</div>';
      $('[data-w="main"]',h).innerHTML=side(s.main);$('[data-w="m"]',h).innerHTML=side(s.m);
      $(".an-lot",h).innerHTML=(s.car?'<div class="an-carcard'+(s.hot?" hot":"")+'">'+car(s.color)+"<small>car #1</small></div>":"")+(s.car2?'<div class="an-carcard hot">'+car("#22c55e")+"<small>car #2 (new)</small></div>":"")||'<div class="ol-empty">no cars (primitives need none)</div>';
      pop($(".an-box.hot",h));};
    const load=()=>{const host=h.querySelector(".an-foot");host.innerHTML="";st=stepper(h,SC[sc],()=>({main:[],m:[],car:0,car2:0,color:"#3b82f6",hot:0}),render,s=>{s.main.forEach(a=>a[2]=0);s.m.forEach(a=>a[2]=0);s.hot=0;});};
    h.addEventListener("click",e=>{const b=e.target.closest(".an-seg [data-c]");if(!b)return;sc=+b.dataset.c;$$(".an-seg button",h).forEach(x=>x.classList.toggle("on",x===b));
      const old=$(".an-foot",h),fresh=old.cloneNode(false);old.replaceWith(fresh);load();});
    load();})();

  /* ===== L00 · stack of plates: the call stack ===== */
  (function(){const h=mount("anPlates","A stack of plates","Every method call puts a plate on the stack; return takes it off",
      ["call = put a plate on top","return = take the top plate off","only the <b>top</b> plate is working","no base case = plates hit the ceiling"],
      '<div class="an-two"><div class="an-cup"><div class="an-ceil">ceiling: the stack size limit</div><div class="an-plates"></div><div class="an-table"></div></div><div><div class="ol-cmds"><button type="button" class="btn pri" data-p="ok">▶ fact(4)</button><button type="button" class="btn" data-p="bad">▶ fact(4) without a base case</button></div><div class="an-code an-src"></div><div class="an-out"></div></div></div>');
    if(!h)return;let tok=0;
    $(".an-foot",h).innerHTML='<div class="msg" aria-live="polite">Press <b>fact(4)</b> and watch plates go on and come off.</div>';
    const plates=$(".an-plates",h),msg=$(".msg",h),out=$(".an-out",h);
    const plate=(t,cls)=>{const p=document.createElement("div");p.className="an-plate "+(cls||"");p.innerHTML=t;plates.appendChild(p);if(!still)p.animate([{transform:"translateY(-60px)",opacity:0},{transform:"none",opacity:1}],{duration:380,easing:"cubic-bezier(.2,1.3,.4,1)"});return p;};
    async function run(bad){const t=++tok;plates.innerHTML="";out.innerHTML="";h.classList.remove("an-crash");
      $(".an-src",h).innerHTML=(bad?["static int fact(int n) {","    return n * fact(n - 1);   // no base case!","}"]:["static int fact(int n) {","    if (n <= 1) return 1;     // base case","    return n * fact(n - 1);","}"]).map(l=>"<div>"+hl(l)+"</div>").join("");
      plate("main()","main");msg.innerHTML="<code>main</code> is the first plate.";await wait(700);
      for(let n=4;;n--){if(t!==tok)return;if(!bad&&n<1)break;
        const all=$$(".an-plate",h);if(bad&&all.length>=11){h.classList.add("an-crash");shake($(".an-cup",h));
          msg.innerHTML="The plates hit the ceiling: <b>java.lang.StackOverflowError</b>. Without a base case every call adds a plate and none ever comes off. Real stacks hold thousands of frames, but they always run out.";out.innerHTML='<span class="olf-err">Exception in thread "main" java.lang.StackOverflowError</span>';return;}
        plate("fact("+n+") <small>n = "+n+"</small>");msg.innerHTML="<code>fact("+n+")</code> is called: a new plate with its <b>own</b> <code>n = "+n+"</code>. The plate below waits."+(n<=1&&!bad?"":"");await wait(650);if(!bad&&n===1)break;}
      if(t!==tok)return;msg.innerHTML="<code>fact(1)</code> hits the <b>base case</b>: it returns 1 without calling again, so no more plates go on.";await wait(900);
      let val=1;for(let n=1;n<=4;n++){if(t!==tok)return;const top=$$(".an-plate",h).pop();top.classList.add("off");if(!still)top.animate([{transform:"none",opacity:1},{transform:"translate(80px,-30px) rotate(12deg)",opacity:0}],{duration:420,fill:"forwards"});
        await wait(430);top.remove();val*=n;const below=$$(".an-plate",h).pop();msg.innerHTML="The top plate comes off and hands <b>"+val+"</b> down to "+(n<4?"<code>fact("+(n+1)+")</code>":"<code>main</code>")+".";if(below)pop(below);await wait(650);}
      out.innerHTML="Prints <b>24</b>";msg.innerHTML="Back to one plate, <code>main</code>. Every call put a plate on, every return took one off: last in, first out.";}
    h.addEventListener("click",e=>{const b=e.target.closest("[data-p]");if(b)run(b.dataset.p==="bad");});})();

  /* ===== L00 · waterfall steps: switch fall-through ===== */
  (function(){const h=mount("anFall","The waterfall","Classic switch: water enters at the matching case and pours down until a break",
      ["case = a step","<b>break</b> = a dam","no break = water falls to the next step","arrow switch: separate pools, no falling"],
      '<div class="ol-cmds"><span class="small muted">x =</span><button type="button" class="chip on" data-x="1">1</button><button type="button" class="chip" data-x="2">2</button><button type="button" class="chip" data-x="3">3</button><button type="button" class="chip" data-x="7">7</button><label class="ol-tog"><input type="checkbox" data-arrow> arrow switch (<code>-&gt;</code>)</label><button type="button" class="btn pri" data-go>▶ run switch (x)</button></div>'+
      '<div class="an-two"><div class="an-falls"></div><div><div class="an-code an-src"></div><div class="an-out"></div></div></div>');
    if(!h)return;
    const C=[["1",'"A"',false],["2",'"B"',true],["3",'"C"',false],["default",'"D"',true]];let x=1,arrow=false,tok=0;
    $(".an-foot",h).innerHTML='<div class="msg" aria-live="polite">Click a dam (<b>break</b>) to add or remove it, pick x, then run.</div>';
    function draw(lit){$(".an-falls",h).innerHTML=C.map((c,i)=>'<div class="an-step'+(lit&&lit.has(i)?" wet":"")+(arrow?" pool":"")+'" style="margin-left:'+(i*18)+'px"><span>'+(c[0]==="default"?"default":"case "+c[0])+"</span><b>print("+c[1]+")</b>"+(arrow?"":'<button type="button" class="an-dam'+(c[2]?" on":"")+'" data-d="'+i+'" title="toggle break">'+(c[2]?"🧱 break":"no break")+"</button>")+"</div>").join("");
      $(".an-src",h).innerHTML=["switch (x) {"].concat(C.map(c=>"    "+(c[0]==="default"?"default":"case "+c[0])+(arrow?" -> print("+c[1]+");":": print("+c[1]+");"+(c[2]?" break;":"")))).concat(["}"]).map(l=>"<div>"+hl(l)+"</div>").join("");}
    async function go(){const t=++tok;let i=C.findIndex(c=>c[0]===String(x));if(i<0)i=3;const lit=new Set(),out=[];$(".an-out",h).innerHTML="";
      while(i<C.length){if(t!==tok)return;lit.add(i);out.push(C[i][1].replace(/"/g,""));draw(lit);$(".an-out",h).innerHTML="Output: <b>"+out.join("")+"</b>";
        const step=$$(".an-step",h)[i];pop(step);await wait(650);if(arrow||C[i][2])break;i++;}
      $(".msg",h).innerHTML=arrow?"Arrow cases never fall through: each case is its own pool. Output: <b>"+out.join("")+"</b>.":
        out.length>1?"The water entered at "+(x>3||x<1?"<code>default</code>":"<code>case "+x+"</code>")+" and poured down "+(out.length-1)+" more step"+(out.length>2?"s":"")+" before a dam stopped it. Output <b>"+out.join("")+"</b>. A missing <code>break</code> is the classic bug.":"A dam right away: only <b>"+out.join("")+"</b>.";}
    h.addEventListener("click",e=>{const d=e.target.closest("[data-d]");if(d){C[+d.dataset.d][2]=!C[+d.dataset.d][2];draw();return;}
      const c=e.target.closest("[data-x]");if(c){x=+c.dataset.x;$$("[data-x]",h).forEach(b=>b.classList.toggle("on",b===c));return;}
      if(e.target.closest("[data-go]"))go();});
    h.addEventListener("change",e=>{if(e.target.matches("[data-arrow]")){arrow=e.target.checked;draw();}});draw();})();

  /* ===== L01 · stone tablet vs whiteboard: String vs StringBuilder ===== */
  (function(){const h=mount("anTablet","Stone tablets vs a whiteboard","A String is carved in stone. A StringBuilder is a whiteboard.",
      ["String = a <b>stone tablet</b>: can't change","\"changing\" it = carve a new tablet","old tablets = garbage","StringBuilder = one <b>whiteboard</b> you keep writing on"],
      '<div class="an-two"><div class="an-pane"><h5 class="cd">String s = ""; s += i;</h5><div class="an-tabs"></div><div class="an-stat" data-k="s"></div></div><div class="an-pane"><h5 class="cd">StringBuilder sb; sb.append(i);</h5><div class="an-wb"><span></span></div><div class="an-stat" data-k="b"></div></div></div>');
    if(!h)return;
    const F=[0,1,2,3,4,5].map(i=>({code:i?"s += "+i+";   sb.append("+i+");":'String s = "";   StringBuilder sb = new StringBuilder();',
      msg:i===0?"Both start empty.":i===1?"The String can't change, so <code>s += 1</code> carves a <b>new</b> tablet \"1\". The whiteboard just gets \"1\" written on it.":
        i<5?"Another new tablet, with all "+i+" characters copied onto it. The previous tablet is now garbage. The whiteboard just adds one character.":
        "After 5 rounds: <b>6</b> tablets (5 of them garbage) and 15 characters copied, versus <b>one</b> whiteboard. For n rounds the String way copies about n²/2 characters: O(n²). StringBuilder is O(n).",
      apply:s=>{s.n=i;}}));
    stepper(h,F,()=>({n:-1}),s=>{const n=s.n;let txt="";const tabs=[];for(let i=0;i<=n;i++){if(i)txt+=i;tabs.push(txt);}
      $(".an-tabs",h).innerHTML=tabs.map((t,i)=>'<div class="an-tab'+(i<tabs.length-1?" old":" new")+'">'+(t?esc(t):"&quot;&quot;")+"</div>").join("");
      const copied=n>0?n*(n+1)/2:0;
      $('[data-k="s"]',h).innerHTML=n<0?"":"objects: <b>"+tabs.length+"</b> · garbage: <b>"+Math.max(0,tabs.length-1)+"</b> · chars copied: <b>"+copied+"</b>";
      $(".an-wb span",h).textContent=n<0?"":txt||" ";$('[data-k="b"]',h).innerHTML=n<0?"":"objects: <b>1</b> · chars written: <b>"+Math.max(0,n)+"</b>";
      pop($(".an-tab.new",h));});})();

  /* ===== L01 · identical twins: == vs equals ===== */
  (function(){const h=mount("anTwins","Identical twins","== asks \"same person?\"  equals asks \"same content?\"",
      ["<b>==</b> = is it the <b>same person</b>?","<b>equals</b> = do they <b>say the same name</b>?","two <code>new String(\"Asha\")</code> = twins","a second variable = a nickname for one person"],
      '<div class="an-people"></div><div class="ol-cmds"><button type="button" class="chip" data-q="eq">a == b</button><button type="button" class="chip" data-q="equals">a.equals(b)</button><button type="button" class="chip" data-q="alias">String c = a;  a == c</button><button type="button" class="chip" data-q="lit">two literals: "Asha" == "Asha"</button></div>');
    if(!h)return;
    $(".an-foot",h).innerHTML='<div class="an-code"></div><div class="msg" aria-live="polite">Two Strings made with <code>new String("Asha")</code> are identical twins: same name, two different people. Ask a question.</div>';
    const P=(tags,name,cls)=>'<div class="an-person '+(cls||"")+'"><div class="an-face">🧑</div><b>"'+name+'"</b><div class="an-tags">'+tags.map(t=>"<span>"+t+"</span>").join("")+"</div></div>";
    const draw=(m)=>{$(".an-people",h).innerHTML=m==="alias"?P(["a","c"],"Asha","hot")+P(["b"],"Asha"):m==="lit"?P(["x","y"],"Asha","hot")+'<div class="an-note">one pooled String: both literals share it</div>':P(["a"],"Asha",m==="eq"?"hot":m==="equals"?"talk":"")+P(["b"],"Asha",m==="eq"?"hot":m==="equals"?"talk":"");};
    const Q={eq:["a == b   // false","<code>==</code> compares <b>who</b>: two different people, so <b>false</b>, even though they look the same."],
      equals:["a.equals(b)   // true","<code>equals</code> compares <b>what they say</b>: both say \"Asha\", so <b>true</b>. Use this for Strings."],
      alias:["String c = a;   a == c   // true","<code>c</code> is just a nickname tag on the <b>same</b> person, so <code>a == c</code> is <b>true</b>."],
      lit:['"Asha" == "Asha"   // true (pooled)',"Literals go in the String pool, so both are the <b>same</b> person and <code>==</code> happens to be true. Don't rely on it: compare text with <code>equals</code>."]};
    h.addEventListener("click",e=>{const b=e.target.closest("[data-q]");if(!b)return;const q=b.dataset.q;$$("[data-q]",h).forEach(x=>x.classList.toggle("on",x===b));draw(q);
      $(".an-code",h).innerHTML='<div class="cur">'+hl(Q[q][0])+"</div>";$(".msg",h).innerHTML=Q[q][1];$$(".an-person.hot,.an-person.talk",h).forEach(pop);});
    draw("");})();

  /* ===== L03 · caterpillar: sliding window ===== */
  (function(){const h=mount("anCat","The caterpillar","Longest substring without repeating characters, as a caterpillar crawling along the string",
      ["the body = the <b>window</b>","the head eats the next letter (right++)","a repeat in the body? the tail lets go (left++)","each letter is eaten once: O(n)"],
      '<div class="vin"><input class="an-cin" value="abcabcbb" maxlength="16" spellcheck="false" aria-label="String"></div><div class="an-track"></div><div class="an-best"></div>');
    if(!h)return;
    function frames(str){const F=[];let l=0,best=0,bl=0,br=-1;const last={};
      F.push({code:"int left = 0, best = 0;",msg:"The caterpillar starts with no body.",apply:s=>{s.l=0;s.r=-1;s.best=0;s.b=[0,-1];}});
      for(let r=0;r<str.length;r++){const c=str[r];
        if(last[c]!==undefined&&last[c]>=l){const nl=last[c]+1,ol=l;l=nl;const R=r,L=l;
          F.push({code:"// '"+c+"' is already in the body → left = "+L,msg:"The head wants <b>'"+c+"'</b>, but the body already has one. The tail lets go of "+(L-ol)+" letter"+(L-ol>1?"s":"")+", up to just past the old '"+c+"'.",apply:s=>{s.l=L;s.r=R-1;s.warn=R;}});}
        last[c]=r;if(r-l+1>best){best=r-l+1;bl=l;br=r;}const R=r,L=l,B=best,BL=bl,BR=br;
        F.push({code:"right = "+R+": eat '"+c+"'   window = \""+str.slice(L,R+1)+"\"",msg:"The head eats <b>'"+c+"'</b>. Body: \""+str.slice(L,R+1)+"\" (length "+(R-L+1)+")."+(R-L+1===B&&BR===R?" <b>New best!</b>":""),apply:s=>{s.l=L;s.r=R;s.best=B;s.b=[BL,BR];s.warn=-1;}});}
      F.push({code:"return best;   // "+best,msg:"The caterpillar reached the end. Longest run without repeats: <b>\""+str.slice(bl,br+1)+"\"</b>, length <b>"+best+"</b>. Every letter was eaten once and released at most once: O(n).",apply:s=>{}});return F;}
    function load(){const str=($(".an-cin",h).value||"abcabcbb").slice(0,16);const old=$(".an-foot",h),fresh=old.cloneNode(false);old.replaceWith(fresh);
      stepper(h,frames(str),()=>({l:0,r:-1,best:0,b:[0,-1],warn:-1}),s=>{
        $(".an-track",h).innerHTML=str.split("").map((c,i)=>{const inb=i>=s.l&&i<=s.r,head=i===s.r&&s.r>=s.l,tail=i===s.l&&inb;
          return '<span class="an-cell'+(inb?" body":"")+(head?" head":"")+(tail?" tail":"")+(i===s.warn?" warn":"")+'">'+esc(c)+"<small>"+i+"</small></span>";}).join("");
        $(".an-best",h).innerHTML="best so far: <b>"+s.best+"</b>"+(s.best?' ("'+esc(str.slice(s.b[0],s.b[1]+1))+'")':"");});}
    $(".an-cin",h).addEventListener("change",load);load();})();

  /* ===== L04 · numbered lockers: arrays ===== */
  (function(){const h=mount("anLockers","A row of numbered lockers","An array is a welded row of same-size lockers, numbered from 0",
      ["index = locker number (from <b>0</b>)","<code>arr[i]</code> = walk straight to it: O(1)","the row is welded: fixed length","more room = build a bigger row and copy"],
      '<div class="an-lockers"><span class="an-runner">🏃</span><div class="an-lrow"></div></div><div class="ol-cmds"><span class="small muted">i =</span><input type="number" class="an-li" value="5" min="0" max="9" style="width:58px"><button type="button" class="btn pri" data-l="get">arr[i]</button><button type="button" class="btn" data-l="walk">linked list get(i)</button><button type="button" class="chip" data-l="add">add a 9th item</button><button type="button" class="chip" data-l="reset">reset</button></div>');
    if(!h)return;let A=[12,7,30,4,19,25,8,16],grown=false;
    $(".an-foot",h).innerHTML='<div class="an-code"></div><div class="msg" aria-live="polite">An <code>int[8]</code>: eight lockers, each 4 bytes wide, starting at address 1000. Pick an index.</div>';
    const draw=(hot,walk)=>{$(".an-lrow",h).innerHTML=A.map((v,i)=>'<div class="an-locker'+(hot===i?" hot":"")+(walk&&walk.has(i)?" walked":"")+(v===null?" vac":"")+'"><small>'+i+"</small><b>"+(v===null?"":v)+"</b><em>@"+(1000+i*4)+"</em></div>").join("");};
    const run=async(i,mode)=>{const ls=$$(".an-locker",h),rn=$(".an-runner",h);if(!ls[i])return;const target=ls[i];
      if(mode==="get"){rn.style.transform="translateX("+(target.offsetLeft+target.offsetWidth/2-12)+"px)";draw(i);$(".an-code",h).innerHTML='<div class="cur">'+hl("arr["+i+"]   // address = 1000 + "+i+" × 4 = "+(1000+i*4)+"  →  "+A[i])+"</div>";
        $(".msg",h).innerHTML="One multiplication and one addition give the address, so the runner goes <b>straight</b> to locker "+i+". Locker 0 or locker 7: the same single step. That is O(1), and why indexes start at 0 (the offset from the start).";pop($(".an-locker.hot",h));}
      else{const seen=new Set();for(let k=0;k<=i;k++){seen.add(k);draw(k,seen);const rr=$(".an-runner",h);const t=$$(".an-locker",h)[k];rr.style.transform="translateX("+(t.offsetLeft+t.offsetWidth/2-12)+"px)";$(".an-code",h).innerHTML='<div class="cur">'+hl("list.get("+i+")   // node "+k+" → next …")+"</div>";await wait(330);}
        $(".msg",h).innerHTML="A linked list has no locker numbers, only \"next\" arrows, so the runner checks <b>"+(i+1)+"</b> doors to reach item "+i+": O(n). Arrays win at random access.";}};
    h.addEventListener("click",e=>{const b=e.target.closest("[data-l]");if(!b)return;const m=b.dataset.l,i=Math.max(0,Math.min(A.length-1,parseInt($(".an-li",h).value,10)||0));
      if(m==="get"||m==="walk")run(i,m);
      else if(m==="add"){if(grown){$(".msg",h).innerHTML="The new row has room (16 lockers). Press reset to start again.";return;}
        $(".an-code",h).innerHTML='<div>'+hl("arr[8] = 21;   // ArrayIndexOutOfBoundsException: Index 8 out of bounds for length 8")+'</div><div class="cur">'+hl("arr = Arrays.copyOf(arr, 16);   arr[8] = 21;")+"</div>";
        shake($(".an-lockers",h));grown=true;A=A.concat([21],Array(7).fill(null));setTimeout(()=>{draw(8);pop($$(".an-locker",h)[8]);},still?0:400);
        $(".msg",h).innerHTML="The row is <b>welded</b>: there is no locker 8, so <code>arr[8]</code> throws. To grow, build a <b>new, bigger row</b> and move everything across (<code>Arrays.copyOf</code>). An <code>ArrayList</code> does exactly this for you, about 1.5× each time.";}
      else{A=[12,7,30,4,19,25,8,16];grown=false;draw();$(".an-runner",h).style.transform="";$(".an-code",h).innerHTML="";}});
    draw();})();

  /* ===== L04 · cinema seats: 2D and jagged arrays ===== */
  (function(){const h=mount("anCinema","Cinema seats","A 2D array is rows of seats; each row is its own array",
      ["<code>seats[row][col]</code> = row, then seat","<code>seats.length</code> = number of rows","<code>seats[r].length</code> = seats in that row","jagged = a theatre with rows of different lengths"],
      '<div class="ol-cmds"><label class="ol-tog"><input type="checkbox" data-j> jagged (balcony rows)</label></div><div class="an-hall"><div class="an-screen">SCREEN</div><div class="an-rows"></div></div>');
    if(!h)return;let jag=false;
    $(".an-foot",h).innerHTML='<div class="an-code"></div><div class="msg" aria-live="polite">Click a seat, or a row label.</div>';
    const shape=()=>jag?[6,4,5]:[5,5,5];
    const draw=(sel,row)=>{const S=shape();$(".an-rows",h).innerHTML=S.map((n,r)=>'<div class="an-row'+(row===r?" hot":"")+'"><button type="button" class="an-rl" data-r="'+r+'">row '+r+"</button>"+Array.from({length:n},(_,c)=>'<button type="button" class="an-seat'+(sel&&sel[0]===r&&sel[1]===c?" hot":"")+'" data-s="'+r+","+c+'">'+c+"</button>").join("")+"</div>").join("");};
    h.addEventListener("click",e=>{const s=e.target.closest("[data-s]"),r=e.target.closest("[data-r]");const S=shape();
      if(s){const [a,b]=s.dataset.s.split(",").map(Number);draw([a,b]);$(".an-code",h).innerHTML='<div class="cur">'+hl("seats["+a+"]["+b+"]   // row "+a+", seat "+b)+"</div>";
        $(".msg",h).innerHTML="First pick the row (<code>seats["+a+"]</code>, itself an array), then the seat in it. <code>seats.length</code> = "+S.length+" rows; this row has <code>seats["+a+"].length</code> = "+S[a]+" seats.";pop($(".an-seat.hot",h));}
      else if(r){const a=+r.dataset.r;draw(null,a);$(".an-code",h).innerHTML='<div class="cur">'+hl("int[] row = seats["+a+"];   // a whole row: length "+S[a])+"</div>";
        $(".msg",h).innerHTML="A 2D array is an <b>array of rows</b>. <code>seats["+a+"]</code> is a reference to one row's own array, so rows can even have different lengths (jagged).";}});
    h.addEventListener("change",e=>{if(e.target.matches("[data-j]")){jag=e.target.checked;draw();$(".an-code",h).innerHTML='<div class="cur">'+hl(jag?"int[][] seats = { new int[6], new int[4], new int[5] };   // jagged":"int[][] seats = new int[3][5];")+"</div>";
      $(".msg",h).innerHTML=jag?"Each row was created separately, with its own length. Always loop with <code>seats[r].length</code>, never a fixed number.":"Three rows of five: a rectangle.";}});
    draw();})();

  /* ===== L04 · guess the number: binary search ===== */
  (function(){const h=mount("anGuess","Guess the number","Binary search is the guessing game: always guess the middle",
      ["sorted data only (a phone book, not a pile)","guess the middle","\"too high\" throws away the top half","100 numbers: at most 7 guesses"],
      '<div class="ol-cmds"><span class="small muted">I\'m thinking of</span><input type="number" class="an-gt" value="73" min="1" max="100" style="width:64px"><span class="small muted">(1–100)</span><button type="button" class="btn pri" data-g>▶ play</button></div><div class="an-range"><div class="an-band"></div><div class="an-pin"></div></div><div class="an-guesses"></div>');
    if(!h)return;let tok=0;
    $(".an-foot",h).innerHTML='<div class="msg" aria-live="polite">Pick a secret number and press play. The searcher only hears "too high", "too low" or "yes".</div>';
    async function play(){const t=++tok,target=Math.max(1,Math.min(100,parseInt($(".an-gt",h).value,10)||1));let lo=1,hi=100,n=0;const G=[];
      const band=$(".an-band",h),pin=$(".an-pin",h),pct=v=>((v-1)/99*100)+"%";
      while(lo<=hi){if(t!==tok)return;const mid=(lo+hi)>>>1;n++;band.style.left=pct(lo);band.style.width="calc("+pct(hi)+" - "+pct(lo)+" + 1%)";pin.style.left=pct(mid);pin.textContent=mid;
        const r=mid===target?"yes!":mid>target?"too high":"too low";G.push('<span class="'+(mid===target?"hit":"")+'"><b>'+n+".</b> "+mid+" → "+r+"</span>");$(".an-guesses",h).innerHTML=G.join("");
        $(".msg",h).innerHTML="Range "+lo+"–"+hi+" ("+(hi-lo+1)+" left). Guess the middle: <b>"+mid+"</b> → "+r+".";await wait(900);
        if(mid===target)break;if(mid>target)hi=mid-1;else lo=mid+1;}
      if(t!==tok)return;$(".msg",h).innerHTML="Found <b>"+target+"</b> in <b>"+n+"</b> guesses. Counting up from 1 would take <b>"+target+"</b>. Each guess halves the range, so 100 numbers need at most 7 (log₂ 100 ≈ 6.6), and a million need only 20. That is O(log n): <code>Arrays.binarySearch</code>, on <b>sorted</b> data.";}
    h.addEventListener("click",e=>{if(e.target.closest("[data-g]"))play();});})();

  /* ===== L05 · town clock vs wristwatches: static vs instance ===== */
  (function(){const h=mount("anClock","The town clock and wristwatches","static = one clock in the square for everyone; instance = each person's own watch",
      ["<b>static</b> field = the town clock: one, shared","instance field = each person's own watch","change the town clock: everyone sees it","change one watch: only that person"],
      '<div class="an-town"><div class="an-tower"><div class="an-face2">🕰️</div><b class="an-tt"></b><small>static int townTime</small></div><div class="an-folk"></div></div>'+
      '<div class="ol-cmds"><button type="button" class="btn pri" data-c="town">Clock.townTime += 1</button><button type="button" class="chip" data-c="0">asha.watch += 1</button><button type="button" class="chip" data-c="1">ravi.watch += 1</button><button type="button" class="chip" data-c="2">meera.watch += 1</button></div>');
    if(!h)return;let town=9;const folk=[["asha",9],["ravi",9],["meera",9]];
    $(".an-foot",h).innerHTML='<div class="an-code"></div><div class="msg" aria-live="polite">Three people (objects), each with a wristwatch (an instance field), all looking at one town clock (a static field).</div>';
    const draw=(hot)=>{$(".an-tt",h).textContent=town+":00";$(".an-folk",h).innerHTML=folk.map(([n,w],i)=>'<div class="an-folkp'+(hot===i?" hot":"")+(hot==="town"?" look":"")+'"><div class="an-face">🧑</div><b>'+n+'</b><span>⌚ '+w+':00</span><small>sees town: '+town+":00</small></div>").join("");};
    h.addEventListener("click",e=>{const b=e.target.closest("[data-c]");if(!b)return;const c=b.dataset.c;
      if(c==="town"){town=town%12+1;draw("town");pop($(".an-tower",h));$(".an-code",h).innerHTML='<div class="cur">'+hl("Clock.townTime += 1;   // one shared field")+"</div>";$(".msg",h).innerHTML="One change to the <b>static</b> field, and all three people see <b>"+town+":00</b>. There is only one town clock, however many people there are (even zero).";}
      else{const i=+c;folk[i][1]=folk[i][1]%12+1;draw(i);pop($$(".an-folkp",h)[i]);$(".an-code",h).innerHTML='<div class="cur">'+hl(folk[i][0]+".watch += 1;   // only this object")+"</div>";$(".msg",h).innerHTML="Only "+folk[i][0]+"'s watch moved to "+folk[i][1]+":00. Each object has its <b>own copy</b> of an instance field.";}});
    draw();})();
})();

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
    l01:{need:"Lesson 00: types, references, methods.",learn:"What a String is, creating and comparing Strings, the String pool, immutability, the key methods, StringBuilder, conversions, formatting, regex and Unicode.",time:"about 5 hours"},
    l02:{need:"Lesson 01.",learn:"How Strings work inside the JVM: memory, the pool in depth, how many objects a line creates, equals and hashCode, how + is compiled, tricky outputs.",time:"about 4 hours"},
    l03:{need:"Lesson 01 (Lesson 02 helps).",learn:"How to solve String interview problems: the 7 patterns (two pointers, frequency counts, sliding window, stacks…) with classic problems and their costs.",time:"about 5 hours"},
    l04:{need:"Lesson 00.",learn:"Arrays from zero: creation and memory, 2D arrays, copying, the Arrays class, sorting and binary search, ArrayList, and 9 core array patterns.",time:"about 5 hours"},
    l05:{need:"Lessons 00 and 04.",learn:"Object-oriented Java: classes and objects, constructors, encapsulation, static, inheritance vs composition, polymorphism, interfaces, equals/hashCode, records, enums and sealed types.",time:"about 5 hours"},
    l06:{need:"Lesson 00 (loops, methods, recursion) and Lesson 04 (arrays).",learn:"Time and space complexity from scratch, then every interview sort: bubble, selection, insertion, merge, quick, heap, counting, bucket, radix, cyclic sort and the Dutch National Flag.",time:"about 8 hours, one sort at a time"},
    practice:{need:"Any lesson you want to drill.",learn:"Write and run code in the Playground, practise in a timed mock interview, check costs on the Big-O sheet, watch memory in the Memory Lab, and review with spaced repetition.",time:"10–20 minutes a day"}};
  const st=START[PAGE],hdr=$("header#top");
  if(st&&hdr){const key="js1-start-"+PAGE,d=document.createElement("details");d.className="lx-start";d.open=store.get(key)!=="0";
    d.innerHTML='<summary><b>Before you start</b><span>'+esc(st.time)+"</span></summary>"+
      '<div class="lx-grid"><div><h5>You need</h5><p>'+esc(st.need)+'</p></div><div><h5>You will learn</h5><p>'+esc(st.learn)+'</p></div><div><h5>How to study each section</h5><ol>'+
      "<li>Read the <b>In 30 seconds</b> box.</li><li>Play the visual: <kbd>←</kbd> <kbd>→</kbd> step, <kbd>Space</kbd> plays.</li><li>Read the code, then run it (Playground or <code>java File.java</code>).</li><li>Hover the <dfn class=\"gl-demo\">dotted words</dfn> for definitions.</li><li>Click <b>Mark as understood</b>, then answer the quiz.</li><li>Come back when <b>Revise</b> asks: after 1, 3 and 7 days.</li></ol></div></div>";
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


/* sky (v13): a soft sky behind the page that follows the real time of day, blended minute by minute (dawn pink-orange, day blue,
   dusk orange-violet, night navy). At night in dark themes: three layers of twinkling stars and a shooting star every 8–16 s.
   In the evening and at night: fireflies drifting around the trees. All movement is transform/opacity (compositor only). */
(function(){
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sky=document.createElement("div");sky.id="sky2";sky.setAttribute("aria-hidden","true");
  sky.innerHTML='<div class="sk-g"></div><div class="sk-st s1"></div><div class="sk-st s2"></div><div class="sk-st s3"></div><i class="sk-shoot"></i><div class="sk-ff"></div>';
  document.body.prepend(sky);
  const stars=n=>Array.from({length:n},()=>Math.round(Math.random()*innerWidth)+"px "+Math.round(Math.random()*innerHeight*.62)+"px 0 "+(Math.random()<.18?1:0)+"px rgba(255,255,255,"+(.45+Math.random()*.55).toFixed(2)+")").join(",");
  const seedStars=()=>$$(".sk-st",sky).forEach((s,i)=>s.style.boxShadow=stars(36+i*22));
  /* [hour, top colour, horizon colour] — blended linearly between neighbours */
  const K=[[0,"#0b1026","#1b1f45"],[4.6,"#0b1026","#221d52"],[5.6,"#3b2a5c","#f59e8b"],[6.8,"#7aa7d9","#fcd5b5"],[8.2,"#8ec5ff","#dbeafe"],[16.3,"#8ec5ff","#dbeafe"],
    [17.6,"#6d5ba8","#fdba74"],[18.6,"#3b2a5c","#fb7185"],[19.6,"#141a3a","#3b2a5c"],[21,"#0b1026","#1b1f45"],[24,"#0b1026","#1b1f45"]];
  const hx=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),mix=(a,b,t)=>"rgb("+hx(a).map((v,i)=>Math.round(v+(hx(b)[i]-v)*t)).join(",")+")";
  const isDark=()=>{const m=getComputedStyle(document.body).backgroundColor.match(/\d+/g)||[255,255,255];return (+m[0]*.3+ +m[1]*.59+ +m[2]*.11)<110;};
  let night=false,eve=false;
  function upd(){const d=new Date(),h=d.getHours()+d.getMinutes()/60;let i=0;while(i<K.length-2&&h>=K[i+1][0])i++;
    const [h0,a0,b0]=K[i],[h1,a1,b1]=K[i+1],t=Math.max(0,Math.min(1,(h-h0)/(h1-h0))),dk=isDark();
    sky.style.setProperty("--sk1",mix(a0,a1,t));sky.style.setProperty("--sk2",mix(b0,b1,t));
    night=h<5.3||h>=19.8;eve=h>=17.8||h<4.5;
    sky.style.setProperty("--ska",dk?(night?.62:.2):(night?.12:.3));
    sky.classList.toggle("night",night&&dk);sky.classList.toggle("eve",eve&&!still);
    if(eve&&!still&&!$(".ff",sky))fireflies();}
  /* shooting stars at night */
  const shoot=$(".sk-shoot",sky);
  function shootLoop(){setTimeout(()=>{if(sky.classList.contains("night")&&!document.hidden&&!still){const x=innerWidth*(.25+Math.random()*.6),y=innerHeight*(.05+Math.random()*.25),a=-(18+Math.random()*22);
      shoot.style.left=x+"px";shoot.style.top=y+"px";
      shoot.animate([{transform:"rotate("+a+"deg) translateX(0) scaleX(.2)",opacity:0},{opacity:1,offset:.15},{transform:"rotate("+a+"deg) translateX(-520px) scaleX(1)",opacity:0}],{duration:1100,easing:"cubic-bezier(.3,0,.7,1)"});}
    shootLoop();},8000+Math.random()*8000);}
  /* fireflies: glowing dots wandering near the trees (or along the bottom on narrow screens) */
  function fireflies(){const box=$(".sk-ff",sky),wide=innerWidth>=1200,zones=wide?[[272,472],[innerWidth-200,innerWidth-10]]:[[0,innerWidth]];
    for(let i=0;i<14;i++){const z=zones[i%zones.length],x=z[0]+Math.random()*(z[1]-z[0]),y=innerHeight*(.45+Math.random()*.5),e=document.createElement("i");e.className="ff";
      e.style.left=x+"px";e.style.top=y+"px";e.style.animationDelay=(-Math.random()*3).toFixed(2)+"s";box.appendChild(e);
      const P=Array.from({length:5},()=>[(Math.random()-.5)*120,(Math.random()-.5)*90]);
      e.animate([{transform:"translate(0px,0px)"},...P.map(([a,b])=>({transform:"translate("+a.toFixed(0)+"px,"+b.toFixed(0)+"px)"})),{transform:"translate(0px,0px)"}],
        {duration:14000+Math.random()*9000,iterations:Infinity,easing:"ease-in-out",delay:-Math.random()*9000});}}
  seedStars();upd();shootLoop();
  setInterval(upd,60000);document.addEventListener("themechange",()=>setTimeout(upd,60));
  let rs=0;addEventListener("resize",()=>{clearTimeout(rs);rs=setTimeout(seedStars,300);},{passive:true});
})();

/* Halloween mode (v13): automatic from 21 Oct to 1 Nov (js1-halloween: "" auto, "1" on, "0" off; Ctrl+K toggles it). Glowing
   jack-o'-lanterns at the foot of the trees, flocks of bats crossing the sky every 16–28 s, a spider bobbing on its thread, and the
   fire rider rides in by himself once per visit (25 s after the first page). Everything is transform/opacity on small elements. */
const HALLOWEEN=(function(){
  const still=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,x){try{localStorage.setItem(k,x)}catch(e){}}};
  const auto=()=>{const d=new Date(),m=d.getMonth(),day=d.getDate();return (m===9&&day>=21)||(m===10&&day<=1);};
  const mode=()=>store.get("js1-halloween")||"";
  const active=()=>mode()==="1"||(mode()===""&&auto());
  const PUMP='<svg viewBox="0 0 64 56"><ellipse cx="32" cy="50" rx="26" ry="5" fill="rgba(0,0,0,.25)"/><path d="M32 12 q-1 -7 5 -10" stroke="#4d7c0f" stroke-width="3.2" fill="none" stroke-linecap="round"/>'+
    '<ellipse cx="19" cy="31" rx="14" ry="18" fill="#c2410c"/><ellipse cx="45" cy="31" rx="14" ry="18" fill="#c2410c"/><ellipse cx="32" cy="31" rx="15.5" ry="20" fill="#f97316"/>'+
    '<path d="M24 13 q-4 18 0 37 M40 13 q4 18 0 37" stroke="#c2410c" stroke-width="1.4" fill="none" opacity=".7"/>'+
    '<g class="pk-face"><path d="M18 26 l7 -7 l4 7z"/><path d="M46 26 l-7 -7 l-4 7z"/><path d="M30 31 l2 -4 l2 4z"/><path d="M15 36 q17 15 34 0 l-4 2.5 l-3 -3 l-3.5 3.5 l-3 -3.5 l-3.5 3.5 l-3 -3.5 l-3.5 3.5 l-3 -3z"/></g></svg>';
  const BAT='<svg viewBox="0 0 60 26"><g class="hb-w"><path d="M30 13 C22 2 12 0 2 6 C8 8 10 12 9 16 C14 13 19 15 21 19 C24 15 27 15 30 17Z"/><path d="M30 13 C38 2 48 0 58 6 C52 8 50 12 51 16 C46 13 41 15 39 19 C36 15 33 15 30 17Z"/></g>'+
    '<ellipse cx="30" cy="15" rx="4.2" ry="6"/><path d="M27 9 l1 -4 l2 3 l2 -3 l1 4z"/><circle cx="28.5" cy="12" r=".9" fill="#f87171"/><circle cx="31.5" cy="12" r=".9" fill="#f87171"/></svg>';
  const SPIDER='<svg viewBox="0 0 40 34"><g stroke="#1f1a2e" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M14 16 q-8 -6 -12 -2 M14 19 q-9 -1 -12 4 M15 22 q-7 4 -9 10 M16 13 q-6 -9 -10 -9"/>'+
    '<path d="M26 16 q8 -6 12 -2 M26 19 q9 -1 12 4 M25 22 q7 4 9 10 M24 13 q6 -9 10 -9"/></g><ellipse cx="20" cy="19" rx="7" ry="8" fill="#1f1a2e"/><circle cx="20" cy="10" r="4.5" fill="#1f1a2e"/>'+
    '<circle cx="18.4" cy="9.6" r="1" fill="#f87171"/><circle cx="21.6" cy="9.6" r="1" fill="#f87171"/></svg>';
  let root=null,batT=0;
  /* touch / click reactions (v13.1): a pumpkin bounces, flares and lets a little ghost out with an evil laugh; the spider drops on its
     thread and climbs back; a bat squeaks, flips and darts away */
  const GHOST='<svg viewBox="-14 -14 128 148"><ellipse cx="50" cy="62" rx="58" ry="66" fill="rgba(170,255,205,.2)"/><path d="M10 62 Q10 8 50 8 Q90 8 90 62 L90 112 Q82 101 74 112 Q66 123 58 112 Q50 101 42 112 Q34 123 26 112 Q18 101 10 112 Z" fill="#eef4ff" fill-opacity=".94"/>'+
    '<ellipse cx="36" cy="52" rx="8" ry="12" fill="#140a22"/><ellipse cx="64" cy="52" rx="8" ry="12" fill="#140a22"/><ellipse cx="50" cy="82" rx="9" ry="13" fill="#140a22"/></svg>';
  const SPOOKY=["#f97316","#a855f7","#22c55e","#facc15","#fb923c"];
  function poke(e){const t=e.target;
    const pk=t.closest(".hw-pk");
    if(pk){if(pk._busy)return;pk._busy=1;setTimeout(()=>{pk._busy=0;},1400);const r=pk.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height*.45;
      pk.classList.add("lit");setTimeout(()=>pk.classList.remove("lit"),1700);
      pk.animate([{transform:"scale(1,1)"},{transform:"scale(1.2,.8)"},{transform:"translateY(-16px) scale(.9,1.15)"},{transform:"scale(1.06,.94)"},{transform:"scale(1,1)"}],{duration:680,easing:"ease-out",composite:"add"});
      FX.confetti(cx,cy,28,{cols:SPOOKY,speed:320});
      const g=document.createElement("div");g.className="hw-ghost";g.innerHTML=GHOST;g.style.left=(cx-24)+"px";g.style.top=(cy-44)+"px";root.appendChild(g);
      g.animate([{transform:"translate(0px,24px) scale(.2)",opacity:0},{transform:"translate(-8px,-46px) scale(1)",opacity:1,offset:.28},{transform:"translate(16px,-140px) scale(1.05)",opacity:.9,offset:.68},{transform:"translate(-10px,-220px) scale(.9)",opacity:0}],
        {duration:2300,easing:"ease-out"}).onfinish=()=>g.remove();
      if(window.SFX&&SFX.laugh)SFX.laugh();return;}
    const sp=t.closest(".hw-spider");
    if(sp){if(sp._busy)return;sp._busy=1;const d=Math.round(innerHeight*.42);
      sp.animate([{transform:"translateY(0px)"},{transform:"translateY("+d+"px)",offset:.24},{transform:"translateY("+(d-34)+"px) rotate(14deg)",offset:.42},{transform:"translateY("+(d-6)+"px) rotate(-12deg)",offset:.58},{transform:"translateY(0px)"}],
        {duration:2700,easing:"cubic-bezier(.3,.7,.4,1)",composite:"add"}).onfinish=()=>{sp._busy=0;};
      if(window.SFX)SFX.squeak();return;}
    const bat=t.closest(".hw-bat");
    if(bat){const r=bat.getBoundingClientRect();bat.getAnimations().forEach(a=>a.cancel());const p="translate("+r.left.toFixed(0)+"px,"+r.top.toFixed(0)+"px)";bat.style.transform=p;
      FX.confetti(r.left+r.width/2,r.top+r.height/2,12,{cols:["#a855f7","#f87171","#facc15"],speed:200});
      bat.animate([{transform:p+" rotate(0deg)"},{transform:"translate("+(r.left+40).toFixed(0)+"px,"+(r.top-70).toFixed(0)+"px) rotate(360deg) scale(1.3)",offset:.4},
        {transform:"translate("+(r.left+140).toFixed(0)+"px,-140px) rotate(720deg) scale(.6)"}],{duration:900,easing:"ease-in",fill:"forwards"}).onfinish=()=>bat.remove();
      if(window.SFX)SFX.squeak();}}
  function on(){if(root||still())return;root=document.createElement("div");root.id="hween";root.setAttribute("aria-hidden","true");
    const wide=innerWidth>=1200,spots=wide?[["left:300px;bottom:2px",54],["left:410px;bottom:0",42],["right:58px;bottom:4px",60],["right:150px;bottom:0",44]]:[["left:8px;bottom:4px",46]];
    root.innerHTML=spots.map(([pos,w],i)=>'<div class="hw-pk" style="'+pos+';width:'+w+'px;animation-delay:'+(-i*.7)+'s"><div class="hw-glow"></div>'+PUMP+"</div>").join("")+
      '<div class="hw-spider" style="right:'+(wide?250:30)+'px"><i class="hw-thread"></i>'+SPIDER+"</div>";
    document.body.appendChild(root);root.addEventListener("click",poke);document.documentElement.classList.add("halloween");batLoop(2500);riderOnce();ghostsOn();}
  /* v17 roaming ghosts (Halloween mode): 4 spectres drift behind the page (canvas #hwg, z −1, ~30 fps), wandering on their own and
     shying away from the mouse pointer with a wail face; hidden while the fire rider rides (he brings his own) */
  let gcv=null,graf=0;
  function ghostsOn(){if(gcv||!window.ghostPaint)return;gcv=document.createElement("canvas");gcv.id="hwg";gcv.setAttribute("aria-hidden","true");document.body.appendChild(gcv);
    const c=gcv.getContext("2d");let W=0,H=0,last=0,acc=0,px=-999,py=-999,light=false,lt=0;
    const size=()=>{if(!gcv)return;W=gcv.width=innerWidth;H=gcv.height=innerHeight;};size();addEventListener("resize",size,{passive:true});
    addEventListener("pointermove",e=>{px=e.clientX;py=e.clientY;},{passive:true});
    const R=(a,b)=>a+Math.random()*(b-a),mk=()=>({x:R(W*.1,W*.9),y:R(H*.15,H*.8),vx:0,vy:0,tx:R(0,W),ty:R(0,H),tt:0,s:R(.7,1.1),ph:R(0,6.28),t:0,f:1,m:0,ar:.3,tint:Math.random()<.4,al:0});
    const G=Array.from({length:4},mk);
    const loop=now=>{if(!gcv)return;graf=requestAnimationFrame(loop);const dt=Math.min(.1,(now-(last||now))/1000);last=now;acc+=dt;if(acc<1/30)return;const d=acc;acc=0;
      if(document.hidden)return;lt-=d;if(lt<=0){lt=2;const m=getComputedStyle(document.body).backgroundColor.match(/\d+/g)||[0,0,0];light=(+m[0]*.3+ +m[1]*.59+ +m[2]*.11)>=110;}
      c.clearRect(0,0,W,H);if(document.documentElement.classList.contains("cine"))return;
      for(const g of G){g.t+=d;g.al=Math.min(1,g.al+d*.4);let tx=g.tx,ty=g.ty,mx=55*g.s;const dx=g.x-px,dy=g.y-py,dr=Math.hypot(dx,dy),sc=dr<170;
        if(sc){tx=g.x+dx/(dr||1)*220;ty=g.y+dy/(dr||1)*220;mx=260;}
        else{g.tt-=d;if(g.tt<=0||Math.hypot(g.tx-g.x,g.ty-g.y)<30){g.tt=R(3,6);g.tx=R(W*.05,W*.95);g.ty=R(H*.1,H*.85);}}
        const ex=tx-g.x,ey=ty-g.y,el=Math.hypot(ex,ey)||1,sp=Math.min(mx,el*1.5),k=Math.min(1,d*(sc?5:1.2));g.vx+=(ex/el*sp-g.vx)*k;g.vy+=(ey/el*sp-g.vy)*k;g.x+=g.vx*d;g.y+=g.vy*d;
        if(g.x<-90)g.x=W+70;if(g.x>W+90)g.x=-70;if(g.y<-90)g.y=H+50;if(g.y>H+90)g.y=-50;
        g.m+=((sc?1:.1)-g.m)*Math.min(1,d*5);g.ar+=((sc?1.25:.3)-g.ar)*Math.min(1,d*4);
        const want=g.vx>8?1:g.vx<-8?-1:g.f>=0?1:-1;g.f+=(want-g.f)*Math.min(1,d*3);
        ghostPaint(c,g.x,g.y+Math.sin(g.t*2+g.ph)*6,13*g.s,g.f,g.t+g.ph,g.al*(light?.5:.6),{lean:Math.hypot(g.vx,g.vy)/220,mouth:g.m,arms:g.ar,ph:g.ph,tint:g.tint,light});}};
    graf=requestAnimationFrame(loop);}
  function ghostsOff(){if(!gcv)return;cancelAnimationFrame(graf);gcv.remove();gcv=null;}
  function off(){if(!root)return;root.remove();root=null;clearTimeout(batT);ghostsOff();document.documentElement.classList.remove("halloween");}
  function flock(){if(!root||document.hidden)return;const n=3+Math.floor(Math.random()*3),dir=Math.random()<.5?1:-1,y0=innerHeight*(.1+Math.random()*.3);
    for(let i=0;i<n;i++){const b=document.createElement("div");b.className="hw-bat";b.innerHTML=BAT;const s=.7+Math.random()*.6;b.style.width=(40*s).toFixed(0)+"px";root.appendChild(b);
      const x0=dir>0?-80:innerWidth+80,x1=dir>0?innerWidth+80:-80,yy=y0+(Math.random()-.5)*90,K=[];
      for(let k=0;k<=12;k++){const u=k/12;K.push({transform:"translate("+(x0+(x1-x0)*u).toFixed(0)+"px,"+(yy+Math.sin(u*Math.PI*3+i)*40).toFixed(0)+"px) scaleX("+(dir>0?1:-1)+")"});}
      b.animate(K,{duration:6500+Math.random()*2500,delay:i*260+Math.random()*200,easing:"linear",fill:"both"}).onfinish=()=>b.remove();}
    if(window.SFX&&SFX.squeak&&Math.random()<.6)setTimeout(()=>SFX.squeak(),800);}
  function batLoop(first){clearTimeout(batT);batT=setTimeout(()=>{flock();batLoop();},first||16000+Math.random()*12000);}
  function riderOnce(){let seen=null;try{seen=sessionStorage.getItem("js1-hw-rider");}catch(e){}if(seen)return;
    setTimeout(()=>{if(!root||document.hidden)return;try{sessionStorage.setItem("js1-hw-rider","1");}catch(e){}const g=document.getElementById("ghostBtn");if(g)g.click();},25000);}
  function apply(){active()?on():off();}
  function set(m){store.set("js1-halloween",m);apply();}
  apply();
  return {set,get on(){return !!root;},get mode(){return mode();}};
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
$("#fbc").onclick=()=>{const t="Java course, Lessons 00–04 feedback:\n"+RT.map((r,i)=>"- "+r+": "+(sc[i]||"-")+"/5").join("\n")+"\nComments: "+($("#fbt").value.trim()||"none");
  if(navigator.clipboard)navigator.clipboard.writeText(t).then(()=>{$("#fbm").textContent="Copied — paste it in the chat.";},()=>{});};
}
})();
/* festivals + sky play (v15). One canvas #fest (fireworks, sky lanterns, snow, the sleigh, shooting stars, lightning) shared by:
   Diwali mode (auto ±5 days around Diwali; js1-diwali "" auto / "1" / "0"), Christmas mode (auto 15 Dec – 1 Jan; js1-xmas),
   click-the-sky (empty background: fireworks or a shooting star at night, lightning in a storm, a sparkle by day) and the "java"
   easter egg (a coffee cup whose steam spells Java). Canvas work stops when nothing is in flight. Ctrl+K toggles both modes. */
const FEST=(function(){
  const still=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,x){try{localStorage.setItem(k,x)}catch(e){}}};
  const R=(a,b)=>a+Math.random()*(b-a);
  const cv=document.createElement("canvas");cv.id="fest";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);
  const ctx=cv.getContext("2d");let W=0,H=0,dpr=1,raf=0,last=0;const P=[],L=[],X=[];
  function size(){dpr=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}
  size();addEventListener("resize",size,{passive:true});
  const kick=()=>{if(!raf&&!document.hidden)raf=requestAnimationFrame(loop);};
  function loop(now){const dt=Math.min(.05,(now-(last||now))/1000);last=now;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    /* sparks and rockets (additive) */
    ctx.globalCompositeOperation="lighter";
    for(let i=P.length-1;i>=0;i--){const p=P[i];p.t+=dt;
      if(p.k==="rk"){const u=Math.min(1,p.t/p.l),x=p.x0+(p.x1-p.x0)*u,y=p.y0+(p.y1-p.y0)*(1-Math.pow(1-u,2.2));
        for(let j=0;j<6;j++){const v=u-j*.015;if(v<0)break;const tx=p.x0+(p.x1-p.x0)*v,ty=p.y0+(p.y1-p.y0)*(1-Math.pow(1-v,2.2));ctx.fillStyle="rgba(255,220,160,"+(.5-j*.08).toFixed(2)+")";ctx.beginPath();ctx.arc(tx,ty,2.2-j*.25,0,6.2832);ctx.fill();}
        if(u>=1){P.splice(i,1);burst(x,y,p.cols);}continue;}
      p.vy+=p.g*dt;p.vx*=1-1.6*dt;p.vy*=1-1.2*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const f=p.t/p.l;if(f>=1){P.splice(i,1);continue;}
      const a=(1-f)*(p.tw?(.5+.5*Math.sin(p.t*40+i)):1);ctx.fillStyle="hsla("+p.h+",100%,"+(62+20*(1-f))+"%,"+a.toFixed(3)+")";ctx.beginPath();ctx.arc(p.x,p.y,p.r*(1-.5*f),0,6.2832);ctx.fill();}
    ctx.globalCompositeOperation="source-over";
    /* sky lanterns: warm paper lanterns rising and swaying */
    for(let i=L.length-1;i>=0;i--){const l=L[i];l.t+=dt;l.y-=l.vy*dt;l.x+=Math.sin(l.t*.8+l.ph)*12*dt;if(l.y<-80){L.splice(i,1);continue;}
      const fl=.85+.15*Math.sin(l.t*9+l.ph)*Math.sin(l.t*5.3),s=l.sz,g=ctx.createRadialGradient(l.x,l.y,0,l.x,l.y,s*3.2);
      g.addColorStop(0,"rgba(255,170,60,"+(.35*fl).toFixed(3)+")");g.addColorStop(1,"rgba(255,140,40,0)");ctx.fillStyle=g;ctx.fillRect(l.x-s*3.2,l.y-s*3.2,s*6.4,s*6.4);
      const bg=ctx.createLinearGradient(0,l.y-s,0,l.y+s);bg.addColorStop(0,"rgba(255,120,40,.95)");bg.addColorStop(1,"rgba(255,210,110,"+(.95*fl).toFixed(2)+")");
      ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(l.x-s*.55,l.y-s);ctx.quadraticCurveTo(l.x-s*.9,l.y,l.x-s*.6,l.y+s);ctx.lineTo(l.x+s*.6,l.y+s);ctx.quadraticCurveTo(l.x+s*.9,l.y,l.x+s*.55,l.y-s);ctx.closePath();ctx.fill();
      ctx.fillStyle="rgba(255,250,200,"+fl.toFixed(2)+")";ctx.beginPath();ctx.ellipse(l.x,l.y+s*.85,s*.18,s*.12,0,0,6.2832);ctx.fill();}
    /* extras (snow, sleigh, stars, bolts): each returns false when done */
    for(let i=X.length-1;i>=0;i--)if(X[i](dt,ctx,W,H)===false)X.splice(i,1);
    if(P.length||L.length||X.length)raf=requestAnimationFrame(loop);else{raf=0;last=0;ctx.clearRect(0,0,W,H);}}
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)kick();});
  const PAL=[[0,40,330],[45,190,280],[120,200,60],[200,320,30],[30,50,60]];
  function burst(x,y,hues){hues=hues||PAL[Math.floor(Math.random()*PAL.length)];const n=90,sp=R(160,260),ring=Math.random()<.4;
    for(let i=0;i<n;i++){const a=i/n*6.2832+R(-.05,.05),v=ring?sp:sp*R(.35,1);P.push({k:"s",x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:70,t:0,l:R(1.1,1.8),r:R(1.4,2.4),h:hues[i%hues.length],tw:Math.random()<.35});}
    if(window.SFX&&SFX.pop)SFX.pop(.6+Math.random()*.4);kick();}
  function firework(x,y,hues){if(still())return burst(x,y,hues);P.push({k:"rk",x0:x+R(-60,60),y0:H+10,x1:x,y1:y,t:0,l:R(.8,1.1),cols:hues});if(window.SFX&&SFX.whoosh)SFX.whoosh();kick();}
  function lantern(){if(still())return;L.push({x:R(W*.05,W*.95),y:H+40,vy:R(26,44),ph:R(0,6.28),sz:R(10,17),t:0});kick();}
  function star(x,y){const o={x:x,y:y,t:0,dx:R(380,520)*(Math.random()<.5?-1:1),dy:R(160,240)};
    X.push((dt,c)=>{o.t+=dt;const u=o.t/.9;if(u>=1)return false;const px=o.x+o.dx*u,py=o.y+o.dy*u,tx=px-o.dx*.18,ty=py-o.dy*.18,g=c.createLinearGradient(tx,ty,px,py);
      g.addColorStop(0,"rgba(255,255,255,0)");g.addColorStop(1,"rgba(255,255,255,"+(1-u).toFixed(2)+")");c.strokeStyle=g;c.lineWidth=2.2;c.lineCap="round";c.beginPath();c.moveTo(tx,ty);c.lineTo(px,py);c.stroke();
      c.fillStyle="rgba(220,235,255,"+(1-u).toFixed(2)+")";c.beginPath();c.arc(px,py,2.6,0,6.2832);c.fill();});kick();}
  function bolt(x,y){const pts=[[x+R(-60,60),0]];let cx=pts[0][0],cy=0;while(cy<y){cy+=R(18,40);cx+=(x-cx)*.15+R(-24,24);pts.push([cx,Math.min(cy,y)]);}const o={t:0};
    if(window.SFX&&SFX.thunder)setTimeout(()=>SFX.thunder(.8),220);
    X.push((dt,c,w,h)=>{o.t+=dt;if(o.t>.6)return false;const a=1-o.t/.6;c.fillStyle="rgba(220,225,255,"+(.25*a).toFixed(3)+")";c.fillRect(0,0,w,h);
      c.strokeStyle="rgba(200,180,255,"+(.5*a).toFixed(2)+")";c.lineWidth=8;c.lineJoin="round";c.beginPath();pts.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.stroke();
      c.strokeStyle="rgba(255,255,255,"+a.toFixed(2)+")";c.lineWidth=2.4;c.stroke();});kick();}
  /* ---------- Diwali ---------- */
  const DIWALI={2026:[10,8],2027:[9,29],2028:[9,17],2029:[10,5],2030:[9,26]};
  const near=(m,d,days)=>{const now=new Date(),t=new Date(now.getFullYear(),m,d);return Math.abs(now-t)<=days*864e5;};
  const autoD=()=>{const y=new Date().getFullYear(),d=DIWALI[y];return d?near(d[0],d[1],5):false;};
  const autoX=()=>{const n=new Date(),m=n.getMonth(),d=n.getDate();return (m===11&&d>=15)||(m===0&&d<=1);};
  const on=(key,auto)=>{const v=store.get(key)||"";return v==="1"||(v===""&&auto());};
  const DIYA='<svg viewBox="0 0 40 34"><defs><radialGradient id="dyG" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#d9733a"/><stop offset="1" stop-color="#7a2e10"/></radialGradient></defs>'+
    '<ellipse cx="20" cy="30" rx="15" ry="3" fill="rgba(0,0,0,.3)"/><path d="M3 18 Q20 34 37 18 Q30 22 20 22 Q10 22 3 18Z" fill="url(#dyG)"/><path d="M3 18 Q20 24 37 18" stroke="#f6c26b" stroke-width="1.4" fill="none"/>'+
    '<ellipse cx="20" cy="18.5" rx="17" ry="3.2" fill="#5a1f0a"/><g class="dy-f"><path d="M20 3 C26 10 24 16 20 18 C16 16 14 10 20 3Z" fill="#ffb02e"/><path d="M20 8 C23 12 22 16 20 17 C18 16 17 12 20 8Z" fill="#fff4b0"/></g></svg>';
  const RANGOLI=(()=>{const c=["#e11d48","#f59e0b","#10b981","#3b82f6","#a855f7","#f97316"];let s='<svg viewBox="-100 -100 200 200">';
    for(let k=0;k<4;k++){const n=8+k*4,r=24+k*20;for(let i=0;i<n;i++){const a=i/n*6.2832,x=Math.cos(a)*r,y=Math.sin(a)*r;s+='<path class="rg-p" d="M0 0 Q '+(Math.cos(a-.25)*r*.6).toFixed(1)+' '+(Math.sin(a-.25)*r*.6).toFixed(1)+' '+x.toFixed(1)+' '+y.toFixed(1)+' Q '+(Math.cos(a+.25)*r*.6).toFixed(1)+' '+(Math.sin(a+.25)*r*.6).toFixed(1)+' 0 0" fill="'+c[(i+k)%c.length]+'" fill-opacity=".85" stroke="#fff7e6" stroke-width=".8" style="--d:'+((k*n+i)*.03).toFixed(2)+'s"/>';}}
    s+='<circle r="12" fill="#facc15" stroke="#fff7e6" stroke-width="1.5"/><circle r="5" fill="#e11d48"/></svg>';return s;})();
  let dRoot=null,dLow=null,dT=0;
  function diwaliOn(){if(dRoot||still())return;dRoot=document.createElement("div");dRoot.id="diwali";dRoot.setAttribute("aria-hidden","true");
    const pts=[...(window.TREE&&TREE.perches?TREE.perches():[]),...(window.TREE&&TREE.perchesL?TREE.perchesL():[])].filter((p,i)=>i%2===0).slice(0,14);
    const gnd=[];for(let i=0;i<10;i++)gnd.push([W*(.08+.84*i/9),H-14]);
    const dy=([x,y],i)=>'<div class="dy" style="left:'+(x-14).toFixed(0)+'px;top:'+(y-24).toFixed(0)+'px;animation-delay:'+(-i*.37).toFixed(2)+'s">'+DIYA+"</div>";
    /* tree diyas sit over the trees; the ground row and the rangoli go behind the page content */
    dRoot.innerHTML=pts.map(dy).join("");dLow=document.createElement("div");dLow.id="diwaliLow";dLow.setAttribute("aria-hidden","true");
    dLow.innerHTML=gnd.map(dy).join("")+'<div class="rangoli">'+RANGOLI+"</div>";
    document.body.appendChild(dRoot);document.body.appendChild(dLow);const tick=()=>{if(!dRoot)return;if(!document.hidden){lantern();if(Math.random()<.45)firework(R(W*.15,W*.85),R(H*.12,H*.4));}dT=setTimeout(tick,R(2600,5200));};dT=setTimeout(tick,1200);}
  function diwaliOff(){if(!dRoot)return;dRoot.remove();dLow.remove();dRoot=dLow=null;clearTimeout(dT);}
  /* ---------- Christmas ---------- */
  let xRoot=null,xT=0,snow=null;
  function sleigh(){const dir=Math.random()<.5?1:-1,y0=H*R(.1,.22),o={t:0,dur:12};if(window.SFX&&SFX.bells)SFX.bells();
    X.push((dt,c,w)=>{o.t+=dt;const u=o.t/o.dur;if(u>=1)return false;const x=dir>0?-260+(w+520)*u:w+260-(w+520)*u,y=y0+Math.sin(u*6.2832)*18;
      c.save();c.translate(x,y);c.scale(dir,1);c.fillStyle="rgba(10,12,24,.92)";c.strokeStyle="rgba(10,12,24,.92)";c.lineCap="round";
      /* sleigh: curled runner, body, Santa */
      c.lineWidth=2.4;c.beginPath();c.moveTo(-70,10);c.lineTo(-10,10);c.quadraticCurveTo(4,10,2,0);c.stroke();
      c.beginPath();c.moveTo(-66,6);c.lineTo(-64,-10);c.quadraticCurveTo(-60,-18,-50,-16);c.lineTo(-20,-10);c.quadraticCurveTo(-12,-8,-14,6);c.closePath();c.fill();
      c.beginPath();c.arc(-48,-24,7,0,6.2832);c.fill();c.beginPath();c.moveTo(-54,-26);c.lineTo(-44,-38);c.lineTo(-40,-26);c.fill();c.fillStyle="rgba(255,255,255,.9)";c.beginPath();c.arc(-44,-38,1.8,0,6.2832);c.fill();c.fillStyle="rgba(10,12,24,.92)";
      c.lineWidth=1.2;c.beginPath();c.moveTo(-14,-6);c.lineTo(150,-14);c.stroke();
      /* four reindeer bounding */
      for(let k=0;k<4;k++){const rx=24+k*36,ry=-14+Math.sin(o.t*9+k)*3,g=Math.sin(o.t*9+k*1.3);c.beginPath();c.ellipse(rx,ry,11,5,0,0,6.2832);c.fill();
        c.lineWidth=2;c.beginPath();c.moveTo(rx+9,ry-2);c.lineTo(rx+14,ry-11);c.stroke();c.beginPath();c.ellipse(rx+16,ry-12,4,2.6,.3,0,6.2832);c.fill();
        c.lineWidth=1.1;c.beginPath();c.moveTo(rx+14,ry-14);c.lineTo(rx+11,ry-21);c.moveTo(rx+12,ry-18);c.lineTo(rx+8,ry-19);c.moveTo(rx+16,ry-14);c.lineTo(rx+18,ry-21);c.moveTo(rx+17,ry-18);c.lineTo(rx+21,ry-19);c.stroke();
        c.lineWidth=1.8;c.beginPath();c.moveTo(rx+6,ry+3);c.lineTo(rx+10+g*5,ry+11);c.moveTo(rx+3,ry+3);c.lineTo(rx+6-g*4,ry+11);c.moveTo(rx-6,ry+3);c.lineTo(rx-10-g*5,ry+11);c.moveTo(rx-3,ry+3);c.lineTo(rx-1+g*4,ry+11);c.stroke();
        if(k===3){c.fillStyle="rgba(255,60,50,"+(.7+.3*Math.sin(o.t*12)).toFixed(2)+")";c.beginPath();c.arc(rx+20,ry-12,2.2,0,6.2832);c.fill();c.fillStyle="rgba(10,12,24,.92)";}}
      /* a trail of glitter */
      c.restore();if(Math.random()<.5)P.push({k:"s",x:x-dir*60,y:y+8,vx:R(-20,20),vy:R(10,40),g:20,t:0,l:R(.6,1.2),r:R(1,1.8),h:R(40,60),tw:true});});kick();}
  function xmasOn(){if(xRoot||still())return;xRoot=document.createElement("div");xRoot.id="xmas";xRoot.setAttribute("aria-hidden","true");
    const pts=[...(window.TREE&&TREE.perches?TREE.perches():[]),...(window.TREE&&TREE.perchesL?TREE.perchesL():[])];const cols=["#ef4444","#facc15","#22c55e","#3b82f6","#f472b6"];
    xRoot.innerHTML=pts.map(([x,y],i)=>'<i class="xl" style="left:'+(x-3).toFixed(0)+'px;top:'+(y-2).toFixed(0)+'px;background:'+cols[i%cols.length]+';color:'+cols[i%cols.length]+';animation-delay:'+(-i*.29).toFixed(2)+'s"></i>').join("");
    document.body.appendChild(xRoot);
    const F=Array.from({length:90},()=>({x:R(0,W),y:R(-H,H),r:R(1,3),v:R(20,55),ph:R(0,6.28)}));
    snow=(dt,c,w,h)=>{if(!xRoot)return false;c.fillStyle="rgba(255,255,255,.85)";for(const f of F){f.y+=f.v*dt;f.x+=Math.sin(f.y*.02+f.ph)*12*dt;if(f.y>h+5){f.y=-5;f.x=R(0,w);}c.beginPath();c.arc(f.x,f.y,f.r,0,6.2832);c.fill();}};X.push(snow);
    const tick=()=>{if(!xRoot)return;if(!document.hidden)sleigh();xT=setTimeout(tick,R(28000,45000));};xT=setTimeout(tick,4000);kick();}
  function xmasOff(){if(!xRoot)return;xRoot.remove();xRoot=null;clearTimeout(xT);}
  function apply(){on("js1-diwali",autoD)?diwaliOn():diwaliOff();on("js1-xmas",autoX)?xmasOn():xmasOff();}
  setTimeout(apply,1500);
  /* ---------- click the sky ---------- */
  document.addEventListener("click",e=>{if(still()||e.defaultPrevented||e.button!==0)return;const t=e.target;
    if(!(t===document.body||t===document.documentElement||t.matches(".wrap,.wrap>section,.wrap>header,.band,#sky2,#jungle,#jungleL")))return;
    if(String(getSelection&&getSelection())!=="")return;
    const night=document.getElementById("sky2")&&document.getElementById("sky2").classList.contains("night"),storm=window.WX&&WX.mode==="storm";
    if(storm)bolt(e.clientX,e.clientY);else if(night||dRoot)Math.random()<.65?firework(e.clientX,e.clientY):star(e.clientX,e.clientY);
    else{for(let i=0;i<26;i++)P.push({k:"s",x:e.clientX,y:e.clientY,vx:R(-140,140),vy:R(-160,40),g:120,t:0,l:R(.5,.9),r:R(1.2,2.4),h:R(30,60),tw:true});kick();}});
  /* ---------- easter egg: type "java" ---------- */
  let typed="";
  document.addEventListener("keydown",e=>{if(e.target.closest&&e.target.closest("input,textarea,select,.CodeMirror,[contenteditable]"))return;if(e.key.length!==1)return;typed=(typed+e.key.toLowerCase()).slice(-4);if(typed==="java"){typed="";coffee();}});
  function coffee(){if(document.getElementById("java-egg"))return;const d=document.createElement("div");d.id="java-egg";d.setAttribute("aria-hidden","true");
    d.innerHTML='<svg viewBox="0 0 220 260"><defs><linearGradient id="cupG" x1="0" x2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset=".6" stop-color="#e2e8f0"/><stop offset="1" stop-color="#94a3b8"/></linearGradient></defs>'+
      '<g class="steam"><path d="M80 120 C60 90 100 80 80 50 C65 30 90 15 85 0"/><path d="M110 120 C90 90 130 80 110 50 C95 30 120 15 115 0"/><path d="M140 120 C120 90 160 80 140 50 C125 30 150 15 145 0"/></g>'+
      '<text x="110" y="70" text-anchor="middle" class="steam-t">Java</text>'+
      '<ellipse cx="110" cy="245" rx="92" ry="12" fill="rgba(0,0,0,.25)"/><path d="M40 130 L180 130 L168 230 Q110 250 52 230Z" fill="url(#cupG)"/><ellipse cx="110" cy="130" rx="70" ry="12" fill="#3b2314"/>'+
      '<path d="M178 150 Q215 150 210 185 Q205 212 170 205" stroke="#cbd5e1" stroke-width="12" fill="none"/><text x="110" y="200" text-anchor="middle" class="cup-t">☕ JAVA</text></svg>';
    document.body.appendChild(d);setTimeout(()=>{FX.confetti(innerWidth/2,innerHeight-160,40,{cols:["#3b2314","#6b3e1f","#a16207","#78350f"],speed:340});},700);
    if(window.SFX&&SFX.chirp)SFX.chirp(.6);if(window.MASCOT&&MASCOT.say)MASCOT.say("Fresh Java! ☕",true);setTimeout(()=>d.classList.add("out"),4200);setTimeout(()=>d.remove(),5200);}
  return {firework,burst,lantern,star,bolt,sleigh,apply,set(k,v){store.set(k==="diwali"?"js1-diwali":"js1-xmas",v);apply();},get diwali(){return !!dRoot;},get xmas(){return !!xRoot;}};
})();
window.FEST=FEST;

/* v22 scroll rider: on lesson pages a small flaming-skull rider rides along the bottom of the content column as the reading
   progress; the bar behind him burns. He faces the way you scroll, the wheels spin only while you scroll, and at the end of the
   page flames burst once. Hidden during the cinematic ride, in print, and below 700px. */
(function(){if(!/^l\d/.test(document.body.dataset.page||""))return;const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el=document.createElement("div");el.id="scrollRider";el.setAttribute("aria-hidden","true");
  el.innerHTML='<div class="sr-trail"><i></i></div><div class="sr-bike"><svg viewBox="0 0 48 32">'+
    '<g class="sr-fl"><path d="M25 9 C21 6 22 1 26 -2 C26 2 30 3 29 7Z" fill="#ff8a1e"/><path d="M26 8 C24 6 25 3 27 1 C27 4 29 5 28 7Z" fill="#ffd56a"/></g>'+
    '<g class="sr-w" style="transform-origin:10px 24px"><circle cx="10" cy="24" r="6" fill="none" stroke="#1b1b22" stroke-width="2.6"/><path d="M10 18V30M4 24H16" stroke="#7a1606" stroke-width="1"/></g>'+
    '<g class="sr-w" style="transform-origin:38px 24px"><circle cx="38" cy="24" r="6" fill="none" stroke="#1b1b22" stroke-width="2.6"/><path d="M38 18V30M32 24H44" stroke="#7a1606" stroke-width="1"/></g>'+
    '<path d="M10 24 L19 16 L31 16 L38 24 M31 16 L35 10" stroke="#2a2a33" stroke-width="2.2" fill="none" stroke-linecap="round"/>'+
    '<path d="M17 16 Q24 12 31 15 L29 18 L19 18Z" fill="#7f1d1d"/>'+
    '<path d="M21 15 L23 9 Q25 7 27 9 L29 12 L34 11" stroke="#14141a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+
    '<circle cx="26" cy="7" r="3.6" fill="#efe6d4"/><circle cx="25" cy="6.6" r="1" fill="#1a0b06"/><circle cx="27.4" cy="6.6" r="1" fill="#1a0b06"/>'+
    '<path d="M2 22 C-2 20 -4 23 -8 21 C-5 25 -1 26 2 25Z" fill="#ff7a18" class="sr-ex"/></svg></div>';
  document.body.appendChild(el);const tr=el.querySelector(".sr-trail"),bk=el.querySelector(".sr-bike");let last=scrollY,idle=0,done=false,q=0;
  function place(){q=0;const w=document.querySelector(".wrap>section")||document.querySelector(".wrap");if(!w)return;const b=w.getBoundingClientRect(),max=document.documentElement.scrollHeight-innerHeight,
      p=max>0?Math.min(1,Math.max(0,scrollY/max)):0,L=Math.max(8,b.left+8),Wd=Math.max(100,b.width-56);
    el.style.left=L+"px";el.style.width=Wd+"px";bk.style.transform="translateX("+(p*(Wd-56)).toFixed(1)+"px)";tr.style.transform="scaleX("+p.toFixed(4)+")";
    const d=scrollY-last;if(Math.abs(d)>1){el.classList.toggle("back",d<0);el.classList.add("moving");clearTimeout(idle);idle=setTimeout(()=>el.classList.remove("moving"),260);}last=scrollY;
    if(p>.995&&!done&&!still){done=true;const r=bk.getBoundingClientRect();if(window.FX)FX.confetti(r.left+20,r.top+10,40,{cols:["#ffd56a","#ff8a1e","#e2470f","#7a1606"],speed:300});if(window.SFX&&SFX.whoosh)SFX.whoosh();el.classList.add("fin");setTimeout(()=>el.classList.remove("fin"),1600);}
    if(p<.97)done=false;}
  const req=()=>{if(!q)q=requestAnimationFrame(place);};addEventListener("scroll",req,{passive:true});addEventListener("resize",req,{passive:true});place();
})();

/* v23 Memory Lab interpreter: runs a small, honest subset of Java (declarations, assignments, arrays, String / StringBuilder /
   Integer, == and equals, intern, clone, static methods with parameters and return, println, System.gc) and records a snapshot per
   statement: stack frames, heap objects in three zones (String pool, Integer cache, heap), console output, a plain-English note
   and what changed. Unsupported syntax gives a friendly error with the line number. */
const MLC=(function(){
  const PRIM=new Set(["int","long","short","byte","double","float","boolean","char"]);
  const DECL=/^(?:final\s+)?(int|long|short|byte|double|float|boolean|char|String|Integer|StringBuilder|Object|var|int\[\]|long\[\]|double\[\]|char\[\]|boolean\[\]|String\[\]|Integer\[\])\s+([A-Za-z_]\w*)\s*(?:=\s*([\s\S]+))?$/;
  const TOK=/\s*(\d+\.\d+|\d+|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)'|[A-Za-z_]\w*|==|!=|<=|>=|&&|\|\||[-+*\/%<>!=(){}\[\],.])/y;
  const clone=o=>JSON.parse(JSON.stringify(o));
  function splitStmts(t){const out=[];let cur="",q=null,d=0;for(const ch of t){if(q){cur+=ch;if(ch===q&&cur[cur.length-2]!=="\\")q=null;continue;}
      if(ch==='"'||ch==="'"){q=ch;cur+=ch;continue;}if(ch==="{"||ch==="(")d++;if(ch==="}"||ch===")")d--;if(ch===";"&&d<=0){out.push(cur.trim());cur="";continue;}cur+=ch;}
    if(cur.trim())out.push(cur.trim());return out.filter(Boolean);}
  function compile(src){const lines=src.replace(/\r/g,"").split("\n"),strip=l=>{let q=null;for(let i=0;i<l.length;i++){const c=l[i];if(q){if(c===q&&l[i-1]!=="\\")q=null;continue;}
        if(c==='"'||c==="'"){q=c;continue;}if(c==="/"&&l[i+1]==="/")return l.slice(0,i);}return l;};
    const methods={},top=[];let i=0;
    const push=(arr,line,t)=>{t=t.trim().replace(/^\{|\}$/g,"").trim();if(!t)return;for(const s of splitStmts(t))arr.push({line,src:s});};
    while(i<lines.length){const L=strip(lines[i]),m=L.match(/\bstatic\s+([\w\[\]<>]+)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*\{(.*)$/);
      if(m){const params=m[3].trim()?m[3].split(",").map(p=>{const q=p.trim().split(/\s+/);return {type:q.slice(0,-1).join(" "),name:q[q.length-1]};}):[];
        const body=[];let depth=1,rest=m[4];
        const eat=(txt,line)=>{let out="";for(const ch of txt){if(ch==="{")depth++;if(ch==="}"){depth--;if(depth===0)break;}out+=ch;}if(out.trim()&&out.trim()!=="{")push(body,line,out);};
        eat(rest,i);i++;while(i<lines.length&&depth>0){eat(strip(lines[i]),i);i++;}
        methods[m[2]]={name:m[2],ret:m[1],params,body};continue;}
      const t=L.trim();if(t&&!/^(public\s+|final\s+)*class\b/.test(t)&&!/^import\b/.test(t)&&!/^[{}]+$/.test(t))push(top,i,t);i++;}
    const main=methods.main?methods.main.body:top;delete methods.main;return {methods,main};}
  function run(src){
    const S={frames:[],heap:[],out:"",steps:[],nid:1},prog=compile(src);let notes=[],hot={v:[],o:[]};
    const get=id=>S.heap.find(o=>o.id===id),fr=()=>S.frames[S.frames.length-1];
    const fail=(line,msg)=>{const e=new Error(msg);e.line=line;throw e;};
    const snap=(line,msg)=>{S.steps.push({line,msg,hot,frames:clone(S.frames),heap:clone(S.heap),out:S.out});hot={v:[],o:[]};if(S.steps.length>600)fail(line,"This program takes too many steps for the Lab.");};
    const add=o=>{o.id=S.nid++;S.heap.push(o);hot.o.push(o.id);return o.id;};
    const pooled=text=>{let o=S.heap.find(x=>x.zone==="pool"&&x.kind==="String"&&x.text===text);if(o){notes.push('"'+esc(text)+'" is already in the String pool, so the existing object #'+o.id+" is reused");hot.o.push(o.id);return o.id;}
      const id=add({kind:"String",text,zone:"pool"});notes.push('"'+esc(text)+'" is a literal: it is stored once in the String pool (#'+id+")");return id;};
    const esc=t=>t.length>24?t.slice(0,22)+"…":t;
    const boxed=(n,line)=>{if(n>=-128&&n<=127){let o=S.heap.find(x=>x.zone==="cache"&&x.val===n);if(o){notes.push(n+" is boxed by Integer.valueOf: −128..127 come from the Integer cache, so the same object #"+o.id+" is reused");hot.o.push(o.id);return {r:o.id};}
        const id=add({kind:"Integer",val:n,zone:"cache"});notes.push(n+" is boxed by Integer.valueOf: it is in the cache range −128..127, so the cached object #"+id+" is used");return {r:id};}
      const id=add({kind:"Integer",val:n,zone:"heap"});notes.push(n+" is outside the Integer cache (−128..127), so valueOf creates a new Integer #"+id);return {r:id};};
    const P=(t,v)=>({p:1,t,v}),NUL={n:1};
    const isStr=v=>v&&v.r&&get(v.r)&&get(v.r).kind==="String"||v&&v.ts!=null;
    const text=v=>{if(!v)return "";if(v.ts!=null)return v.ts;if(v.n)return "null";if(v.p)return v.t==="char"?v.v:v.t==="boolean"?String(v.v):v.t==="double"?(Number.isInteger(v.v)?v.v.toFixed(1):String(v.v)):String(v.v);
      const o=get(v.r);if(!o)return "?";if(o.kind==="String"||o.kind==="StringBuilder")return o.text;if(o.kind==="Integer")return String(o.val);
      const h=((o.id*2654435761)>>>0).toString(16).slice(0,7);return (o.kind==="int[]"?"[I":o.kind==="String[]"?"[Ljava.lang.String;":"["+o.kind[0].toUpperCase())+"@"+h;};
    const num=(v,line)=>{if(v.p)return v.t==="char"?v.v.charCodeAt(0):v.v;if(v.r&&get(v.r).kind==="Integer")return get(v.r).val;fail(line,"Expected a number here.");};
    const lookup=(name,line)=>{for(const v of fr().vars)if(v.name===name)return v;fail(line,"Unknown variable "+name+".");};
    const refsTo=id=>{let n=0;for(const f of S.frames)for(const v of f.vars)if(v.val&&v.val.r===id)n++;for(const o of S.heap)if(o.vals&&o.kind==="String[]")for(const e of o.vals)if(e&&e.r===id)n++;return n;};
    const orphan=(old,line)=>{if(old&&old.r){const o=get(old.r);if(o&&o.zone==="heap"&&!refsTo(o.id))notes.push("#"+o.id+" now has no references: it is garbage and the GC may remove it");}};
    /* ---------- expressions ---------- */
    function evalExpr(src,line,ctx){ctx=ctx||{};const T=[];TOK.lastIndex=0;let m;const s=src.trim();
      while(TOK.lastIndex<s.length){const p=TOK.lastIndex;m=TOK.exec(s);if(!m){fail(line,"The Lab can't read “"+s.slice(p,p+12)+"”.");}T.push(m[1]);}
      let k=0;const peek=()=>T[k],next=()=>T[k++],want=t=>{if(T[k]!==t)fail(line,"Expected “"+t+"” in: "+s);k++;};
      const args=()=>{const a=[];want("(");if(peek()!==")"){a.push(or());while(peek()===","){next();a.push(or());}}want(")");return a;};
      function or(){let a=and();while(peek()==="||"){next();const b=and();a=P("boolean",a.v||b.v);}return a;}
      function and(){let a=eq();while(peek()==="&&"){next();const b=eq();a=P("boolean",a.v&&b.v);}return a;}
      function eq(){const lit=x=>x.ts!=null&&x.c?{r:pooled(x.ts),c:1}:x;let a=rel();while(peek()==="=="||peek()==="!="){const op=next();let b=rel(),r;a=lit(a);b=lit(b);
          if(a.p&&b.p||(a.p&&b.r)||(a.r&&b.p)){r=num(a,line)===num(b,line);if(a.r||b.r)notes.push("An Integer compared with an int is unboxed, so == compares the values");}
          else if(a.n||b.n)r=!!(a.n&&b.n);else if(a.ts!=null||b.ts!=null){r=false;notes.push("A String computed at run time is a separate object, so == is false");}
          else{r=a.r===b.r;notes.push(r?"== compares references: both point to the same object #"+a.r+" → true":"== compares references: #"+a.r+" and #"+b.r+" are different objects → false");hot.o.push(a.r,b.r);}
          a=P("boolean",op==="=="?r:!r);}return a;}
      function rel(){let a=add2();while(["<",">","<=",">="].includes(peek())){const op=next(),b=add2(),x=num(a,line),y=num(b,line);a=P("boolean",op==="<"?x<y:op===">"?x>y:op==="<="?x<=y:x>=y);}return a;}
      function add2(){let a=mul();while(peek()==="+"||peek()==="-"){const op=next(),b=mul();
          if(op==="+"&&(isStr(a)||isStr(b))){const t=text(a)+text(b);
            if(a.c&&b.c&&!ctx.print){const id=pooled(t);notes.push("Both sides are literals, so javac folds them into one constant at compile time");a={r:id,c:1};}
            else if(ctx.print){a=a.c&&b.c?{ts:t,c:1}:{ts:t};}
            else{const id=add({kind:"String",text:t,zone:"heap"});notes.push("+ on Strings at run time builds a new String #"+id+" (the original Strings never change: they are immutable)");a={r:id};}}
          else{const x=num(a,line),y=num(b,line),dbl=a.t==="double"||b.t==="double",lng=a.t==="long"||b.t==="long",z=op==="+"?x+y:x-y;a=P(dbl?"double":lng?"long":"int",dbl||lng?z:z|0);}}return a;}
      function mul(){let a=un();while(["*","/","%"].includes(peek())){const op=next(),b=un(),x=num(a,line),y=num(b,line),dbl=a.t==="double"||b.t==="double",lng=a.t==="long"||b.t==="long";
          if(!dbl&&op!=="*"&&y===0)fail(line,"ArithmeticException: / by zero");const z=op==="*"?(dbl||lng?x*y:Math.imul(x,y)):op==="/"?(dbl?x/y:Math.trunc(x/y)):x%y;a=P(dbl?"double":lng?"long":"int",dbl||lng?z:z|0);}return a;}
      function un(){if(peek()==="!"){next();const a=un();return P("boolean",!a.v);}if(peek()==="-"){next();const a=un(),z=-num(a,line);return P(a.t||"int",(a.t||"int")==="int"?z|0:z);}return post(prim());}
      function post(v){for(;;){
          if(peek()==="["){next();const i=num(or(),line);want("]");if(v.n)fail(line,"NullPointerException: the array is null");const o=get(v.r);
            if(!o||!o.vals)fail(line,"Only arrays can be indexed.");if(i<0||i>=o.vals.length)fail(line,"ArrayIndexOutOfBoundsException: Index "+i+" out of bounds for length "+o.vals.length);
            hot.o.push(o.id);const e=o.vals[i];v=o.kind==="String[]"||o.kind==="Integer[]"?(e||NUL):P(o.kind.replace("[]",""),e);continue;}
          if(peek()==="."){next();const name=next();
            if(peek()!=="("){if(name==="length"){const o=v.r&&get(v.r);if(o&&o.vals)return P("int",o.vals.length);}fail(line,"Unknown field ."+name+".");}
            const A=args();v=callMethod(v,name,A);continue;}
          return v;}}
      function prim(){const t=next();if(t===undefined)fail(line,"The expression is incomplete.");
        if(/^\d+\.\d+$/.test(t))return P("double",parseFloat(t));if(/^\d+$/.test(t))return P("int",parseInt(t,10));
        if(t[0]==='"'){const str=JSON.parse(t);if(ctx.print&&peek()!=="."&&!ctx.keepLit)return {ts:str,c:1};return {r:pooled(str),c:1};}
        if(t[0]==="'")return P("char",t.length===3?t[1]:JSON.parse('"'+t.slice(1,-1)+'"'));
        if(t==="true"||t==="false")return P("boolean",t==="true");if(t==="null")return NUL;
        if(t==="("){const v=or();want(")");return v;}
        if(t==="{"){const items=[];if(peek()!=="}"){items.push(or());while(peek()===","){next();items.push(or());}}want("}");return mkArray(ctx.arr||"int[]",items);}
        if(t==="new"){const ty=next();
          if(peek()==="["){next();if(peek()==="]"){next();want("{");const items=[];if(peek()!=="}"){items.push(or());while(peek()===","){next();items.push(or());}}want("}");return mkArray(ty+"[]",items);}
            const n=num(or(),line);want("]");if(n<0)fail(line,"NegativeArraySizeException: "+n);
            const kind=ty+"[]",ref=kind==="String[]"||kind==="Integer[]",vals=Array.from({length:n},()=>ref?null:ty==="boolean"?false:ty==="char"?"\u0000":ty==="double"?0:0);
            const id=add({kind,vals,zone:"heap"});notes.push("new "+ty+"["+n+"] creates an array object #"+id+" on the heap; every element starts at its default ("+(ref?"null":ty==="boolean"?"false":"0")+")");return {r:id};}
          const A=args();
          if(ty==="String"){const t2=A.length?text(A[0]):"";const id=add({kind:"String",text:t2,zone:"heap"});notes.push("new String(…) always creates a new object #"+id+" on the heap, even when the same text is in the pool");return {r:id};}
          if(ty==="StringBuilder"){const t2=A.length&&!(A[0].p&&A[0].t==="int")?text(A[0]):"",cap=A.length&&A[0].p&&A[0].t==="int"?A[0].v:16+t2.length;
            const id=add({kind:"StringBuilder",text:t2,cap,zone:"heap"});notes.push("new StringBuilder creates a mutable object #"+id+" (capacity "+cap+")");return {r:id};}
          if(ty==="Integer")fail(line,"new Integer(…) is deprecated and removed in modern Java; use Integer.valueOf(…).");
          fail(line,"The Lab can't create a "+ty+".");}
        if(t==="Integer"&&peek()==="."){next();const f=next(),A=args();if(f==="valueOf")return boxed(num(A[0],line),line);if(f==="parseInt")return P("int",parseInt(text(A[0]),10));fail(line,"Integer."+f+" isn't supported.");}
        if(t==="String"&&peek()==="."){next();const f=next(),A=args();if(f==="valueOf"){const s2=text(A[0]);if(ctx.print)return {ts:s2};const id=add({kind:"String",text:s2,zone:"heap"});notes.push("String.valueOf builds a new String #"+id);return {r:id};}fail(line,"String."+f+" isn't supported.");}
        if(t==="Arrays"&&peek()==="."){next();const f=next(),A=args(),o=A[0]&&A[0].r&&get(A[0].r);if(!o||!o.vals)fail(line,"Arrays."+f+" needs an array.");
          if(f==="toString"){const s2="["+o.vals.map(e=>o.kind==="String[]"?(e?text(e):"null"):String(e)).join(", ")+"]";if(ctx.print)return {ts:s2};const id=add({kind:"String",text:s2,zone:"heap"});return {r:id};}
          if(f==="sort"){o.vals.sort((x,y)=>o.kind==="String[]"?text(x).localeCompare(text(y)):x-y);hot.o.push(o.id);notes.push("Arrays.sort sorts the array object #"+o.id+" in place");return {ts:""};}
          if(f==="fill"){o.vals=o.vals.map(()=>A[1].p?A[1].v:A[1]);hot.o.push(o.id);notes.push("Arrays.fill writes into array #"+o.id);return {ts:""};}
          fail(line,"Arrays."+f+" isn't supported.");}
        if(/^[A-Za-z_]\w*$/.test(t)){if(peek()==="("&&prog.methods[t]){const A=args();return callUser(t,A,line);}
          const v=lookup(t,line);hot.v.push(v.name);if(v.val&&v.val.un)fail(line,"variable "+t+" might not have been initialized");return v.val;}
        fail(line,"Unexpected “"+t+"”.");}
      function mkArray(kind,items){const ref=kind==="String[]"||kind==="Integer[]";const vals=items.map(v=>ref?(v.n?null:v.ts!=null?{r:add({kind:"String",text:v.ts,zone:"heap"})}:{r:v.r}):num(v,line));
        const id=add({kind,vals,zone:"heap"});notes.push("The array initializer creates an array object #"+id+" with "+items.length+" elements");return {r:id};}
      function callMethod(v,name,A){if(v.n)fail(line,"NullPointerException: cannot call ."+name+"() on null");
        if(v.ts!=null){const o={kind:"String",text:v.ts};return strMethod(o,null,name,A);}
        const o=get(v.r);if(!o)fail(line,"Unknown object.");hot.o.push(o.id);
        if(o.kind==="String")return strMethod(o,v,name,A);
        if(o.kind==="StringBuilder"){
          if(name==="append"){o.text+=text(A[0]);if(o.text.length>o.cap){const old=o.cap;o.cap=Math.max(old*2+2,o.text.length);notes.push("The text no longer fits, so the internal array grows from "+old+" to "+o.cap);}
            notes.push("append changes the same StringBuilder #"+o.id+" in place: no new object");return v;}
          if(name==="insert"){const i=num(A[0],line);o.text=o.text.slice(0,i)+text(A[1])+o.text.slice(i);notes.push("insert edits StringBuilder #"+o.id+" in place");return v;}
          if(name==="reverse"){o.text=[...o.text].reverse().join("");notes.push("reverse flips StringBuilder #"+o.id+" in place");return v;}
          if(name==="toString"){if(ctx.print)return {ts:o.text};const id=add({kind:"String",text:o.text,zone:"heap"});notes.push("toString() copies the characters into a new String #"+id);return {r:id};}
          if(name==="length")return P("int",o.text.length);if(name==="capacity")return P("int",o.cap);if(name==="charAt")return P("char",o.text[num(A[0],line)]);
          fail(line,"StringBuilder."+name+" isn't supported in the Lab.");}
        if(o.kind==="Integer"){if(name==="equals"){const r=A[0].r&&get(A[0].r)&&get(A[0].r).kind==="Integer"&&get(A[0].r).val===o.val;notes.push("equals compares the int values → "+r);return P("boolean",r);}
          if(name==="intValue")return P("int",o.val);fail(line,"Integer."+name+" isn't supported.");}
        if(o.vals){if(name==="clone"){const id=add({kind:o.kind,vals:o.vals.slice(),zone:"heap"});notes.push("clone() makes a new array #"+id+" with the same elements (a shallow copy)");return {r:id};}
          if(name==="equals"){const r=A[0].r===o.id;notes.push("Arrays don't override equals, so it is the same as == → "+r);return P("boolean",r);}
          fail(line,"Arrays have no ."+name+"() in the Lab (try Arrays.toString or .clone()).");}
        fail(line,"."+name+"() isn't supported.");}
      function strMethod(o,v,name,A){const s2=o.text,mk=t=>{if(ctx.print)return {ts:t};const id=add({kind:"String",text:t,zone:"heap"});notes.push(name+"() returns a new String #"+id+": the original is unchanged");return {r:id};};
        switch(name){case "length":return P("int",s2.length);case "isEmpty":return P("boolean",!s2.length);
          case "charAt":{const i=num(A[0],line);if(i<0||i>=s2.length)fail(line,"StringIndexOutOfBoundsException: Index "+i+" out of bounds for length "+s2.length);return P("char",s2[i]);}
          case "equals":{const r=isStr(A[0])&&text(A[0])===s2;notes.push("equals compares the characters → "+r);return P("boolean",r);}
          case "equalsIgnoreCase":return P("boolean",isStr(A[0])&&text(A[0]).toLowerCase()===s2.toLowerCase());
          case "hashCode":{let h=0;for(const c of s2)h=(h*31+c.charCodeAt(0))|0;return P("int",h);}
          case "intern":{if(!v)return {ts:s2};let p=S.heap.find(x=>x.zone==="pool"&&x.text===s2);
            if(p){notes.push('intern() returns the pooled "'+esc(s2)+'" #'+p.id);hot.o.push(p.id);return {r:p.id};}
            o.zone="pool";notes.push('"'+esc(s2)+'" was not in the pool yet, so intern() records this object #'+o.id+" in the pool (Java 7+: no copy)");return v;}
          case "toUpperCase":return s2===s2.toUpperCase()&&v?(notes.push("toUpperCase() returns the same object when nothing changes"),v):mk(s2.toUpperCase());
          case "toLowerCase":return s2===s2.toLowerCase()&&v?(notes.push("toLowerCase() returns the same object when nothing changes"),v):mk(s2.toLowerCase());
          case "trim":return mk(s2.trim());case "concat":return text(A[0])===""&&v?(notes.push("concat(\"\") returns the same object"),v):mk(s2+text(A[0]));
          case "substring":{const b=num(A[0],line),e=A[1]?num(A[1],line):s2.length;if(b<0||e>s2.length||b>e)fail(line,"StringIndexOutOfBoundsException: begin "+b+", end "+e+", length "+s2.length);if(b===0&&e===s2.length&&v){notes.push("substring of the whole String returns the same object");return v;}return mk(s2.slice(b,e));}
          case "contains":return P("boolean",s2.includes(text(A[0])));case "indexOf":return P("int",s2.indexOf(text(A[0])));
          case "startsWith":return P("boolean",s2.startsWith(text(A[0])));case "replace":return mk(s2.split(text(A[0])).join(text(A[1])));
          case "compareTo":{const t2=text(A[0]);for(let i=0;i<Math.min(s2.length,t2.length);i++)if(s2[i]!==t2[i])return P("int",s2.charCodeAt(i)-t2.charCodeAt(i));return P("int",s2.length-t2.length);}
        }fail(line,"String."+name+"() isn't supported in the Lab.");}
      const v=or();if(k<T.length)fail(line,"The Lab can't read “"+T.slice(k).join(" ")+"”.");return v;}
    /* ---------- statements ---------- */
    function coerce(type,v,line){if(type==="Integer"&&v.p){return boxed(num(v,line),line);}
      if(PRIM.has(type)&&v.r&&get(v.r).kind==="Integer"){notes.push("The Integer is unboxed to an int value");return P("int",get(v.r).val);}
      if(type==="double"&&v.p&&v.t==="int")return P("double",v.v);if(type==="long"&&v.p&&v.t==="int")return P("long",v.v);if(type==="int"&&v.p&&v.t==="char")return P("int",v.v.charCodeAt(0));
      if(type==="char"&&v.p&&v.t==="int")return P("char",String.fromCharCode(v.v));
      if(v.ts!=null){const id=add({kind:"String",text:v.ts,zone:"heap"});return {r:id};}
      const out=Object.assign({},v);delete out.c;return out;}
    const show=v=>v.n?"null":v.p?(v.t==="char"?"'"+v.v+"'":String(v.v)):v.r?"→ #"+v.r:"";
    function exec(st){const s=st.src.trim(),line=st.line;notes=[];let m;
      if(/^(if|else|for|while|do|switch|try|catch)\b/.test(s))fail(line,"if / loops aren't supported in the Lab yet: write the steps out one by one.");
      if(m=s.match(/^System\.out\.print(ln)?\s*\(([\s\S]*)\)$/)){const v=m[2].trim()?evalExpr(m[2],line,{print:true}):{ts:""};const t=text(v);S.out+=t+(m[1]?"\n":"");
        snap(line,"Prints "+(t===""?"an empty line":t)+(notes.length?". "+notes.join(". "):""));return;}
      if(/^System\.gc\s*\(\s*\)$/.test(s)){gc(line);return;}
      if(m=s.match(/^return\b\s*([\s\S]*)$/)){const v=m[1].trim()?evalExpr(m[1],line):undefined;throw {ret:v,line};}
      if(m=s.match(DECL)){const [,type,name,rhs]=m;if(fr().vars.some(v=>v.name===name))fail(line,"variable "+name+" is already defined.");
        let v;if(rhs===undefined){v={un:1};notes.push(name+" is declared but not assigned yet");}
        else{const raw=evalExpr(rhs,line,{arr:type.endsWith("[]")?type:null});v=coerce(type,raw,line);if(/^final\s/.test(s)&&raw.c&&v.r){v.c=1;notes.push(name+" is final and set to a constant, so it is a compile-time constant");}}
        const t2=type==="var"?(v.p?v.t:v.r?get(v.r).kind:"Object"):type;fr().vars.push({name,type:t2,val:v});hot.v.push(name);
        snap(line,(notes.length?notes.join(". ")+". ":"")+(PRIM.has(t2)?name+" is a primitive "+t2+": the value "+show(v)+" is stored right in the stack frame":v.r?name+" holds a reference to object #"+v.r+" (the arrow)":name+" is "+(v.un?"not assigned yet":"null")));return;}
      if(m=s.match(/^([A-Za-z_]\w*)\s*\[([\s\S]+)\]\s*=\s*([\s\S]+)$/)){const ar=lookup(m[1],line);if(ar.val.n)fail(line,"NullPointerException: "+m[1]+" is null");const o=get(ar.val.r),i=num(evalExpr(m[2],line),line);
        if(i<0||i>=o.vals.length)fail(line,"ArrayIndexOutOfBoundsException: Index "+i+" out of bounds for length "+o.vals.length);
        const v=evalExpr(m[3],line);const ref=o.kind==="String[]"||o.kind==="Integer[]";const old=o.vals[i];o.vals[i]=ref?(v.n?null:{r:coerce("String",v,line).r}):num(v,line);hot.o.push(o.id);
        if(ref)orphan(old,line);
        snap(line,m[1]+"["+i+"] = "+(ref?(v.n?"null":"→ #"+o.vals[i].r):o.vals[i])+": this changes the array object #"+o.id+(refsTo(o.id)>1?", so every variable pointing to it sees the change":"")+(notes.length?". "+notes.join(". "):""));return;}
      if(m=s.match(/^([A-Za-z_]\w*)\s*(\+\+|--)$/)||s.match(/^(\+\+|--)\s*([A-Za-z_]\w*)$/)){const name=/\w/.test(m[1][0])?m[1]:m[2],op=/\w/.test(m[1][0])?m[2]:m[1],v=lookup(name,line);
        v.val=P(v.val.t||"int",num(v.val,line)+(op==="++"?1:-1));hot.v.push(name);snap(line,name+" "+op+": the value in the frame becomes "+v.val.v);return;}
      if(m=s.match(/^([A-Za-z_]\w*)\s*([-+*\/])=\s*([\s\S]+)$/)){const v=lookup(m[1],line),r=evalExpr(m[1]+m[2]+"("+m[3]+")",line),old=v.val;v.val=coerce(v.type,r,line);hot.v.push(m[1]);orphan(old,line);
        snap(line,m[1]+" "+m[2]+"= …: "+(v.val.r?m[1]+" now points to #"+v.val.r:"now "+show(v.val))+(notes.length?". "+notes.join(". "):""));return;}
      if(m=s.match(/^([A-Za-z_]\w*)\s*=\s*([\s\S]+)$/)){const v=lookup(m[1],line),r=evalExpr(m[2],line,{arr:v.type.endsWith("[]")?v.type:null}),old=v.val;v.val=coerce(v.type,r,line);hot.v.push(m[1]);
        const alias=v.val.r&&/^[A-Za-z_]\w*$/.test(m[2].trim())&&!PRIM.has(v.type);orphan(old,line);
        if(S.frames.length>1&&prog.methods[fr().name]&&prog.methods[fr().name].params.some(p=>p.name===m[1]))notes.push("Only this frame's copy of "+m[1]+" changes: the caller's variable is untouched");
        snap(line,(alias?m[1]+" = "+m[2].trim()+" copies the reference, not the object: both now point to #"+v.val.r:v.val.r?m[1]+" now points to #"+v.val.r:v.val.n?m[1]+" is now null: it points to nothing":m[1]+" is now "+show(v.val))+(notes.length?". "+notes.join(". "):""));return;}
      const um=s.match(/^([A-Za-z_]\w*)\s*\(/);if(um&&prog.methods[um[1]]){evalExpr(s,line);return;}
      const v=evalExpr(s,line);snap(line,(notes.length?notes.join(". "):"Done")+(v&&v.p?" (result "+show(v)+" is not used)":""));}
    function callUser(name,A,line){const mt=prog.methods[name];if(A.length!==mt.params.length)fail(line,name+" expects "+mt.params.length+" argument(s).");if(S.frames.length>12)fail(line,"StackOverflowError (too deep for the Lab)");
      const before=notes;notes=[];const f={name,vars:[]};
      mt.params.forEach((p,i)=>{const v=coerce(p.type,A[i],line);f.vars.push({name:p.name,type:p.type,val:v});});
      S.frames.push(f);hot.v=mt.params.map(p=>p.name);
      snap(line,name+"(…) is called: a new stack frame is pushed. Each parameter gets a COPY of the argument: "+mt.params.map((p,i)=>p.name+" = "+show(f.vars[i].val)).join(", ")+(f.vars.some(v=>v.val.r)?" (a copied reference still points to the same object)":""));
      let ret;try{for(const st of mt.body)exec(st);}catch(e){if(e&&e.ret!==undefined||e&&"ret" in e)ret=e.ret;else throw e;}
      S.frames.pop();notes=[];snap(mt.body.length?mt.body[mt.body.length-1].line:line,name+" returns"+(ret?" "+show(ret):"")+": its frame is popped and its local variables are gone. Changes made to objects stay.");
      notes=before;return ret||{ts:""};}
    function gc(line){const live=new Set(),mark=id=>{if(live.has(id))return;live.add(id);const o=get(id);if(o&&o.kind==="String[]")o.vals.forEach(e=>e&&mark(e.r));};
      S.frames.forEach(f=>f.vars.forEach(v=>v.val&&v.val.r&&mark(v.val.r)));S.heap.forEach(o=>{if(o.zone!=="heap")mark(o.id);});
      const dead=S.heap.filter(o=>!live.has(o.id));
      if(!dead.length){snap(line,"System.gc(): every object is still reachable from a variable (or the pool), so nothing is collected.");return;}
      dead.forEach(o=>{o.garbage=1;hot.o.push(o.id);});snap(line,"System.gc() marks the unreachable objects "+dead.map(o=>"#"+o.id).join(", ")+": no variable points to them any more.");
      S.heap=S.heap.filter(o=>live.has(o.id));snap(line,"…and sweeps them away. Pool Strings and cached Integers stay, because the JVM itself still references them.");}
    S.frames.push({name:"main",vars:[]});
    try{snap(-1,"The program starts: main gets a frame on the stack. Primitives live inside frames; objects live on the heap.");
      for(const st of prog.main)exec(st);S.frames.pop();snap(-1,"main returns: its frame is popped and the program ends.");}
    catch(e){if(e&&e.ret!==undefined||e&&"ret" in e){S.frames.pop();snap(-1,"main returns.");}else{S.error={line:e.line==null?-1:e.line,msg:e.message||String(e)};}}
    return S;}
  return {compile,run};
})();

/* v23 Memory Lab UI (#mlApp on the Practice page): an editable code pane (the line marker glides to the running statement), Step /
   Back / Run / Reset, a "Run GC" button that adds System.gc(), the stack (frames, primitives, reference dots) and the heap in three
   areas (String pool, Integer cache, objects) with arrows from every reference, the console, and a plain-English note per step.
   It reuses the runner's .rz-* look. The code is saved in this browser (js1-memlab). */
(function(){const host=document.getElementById("mlApp");if(!host)return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const st0={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  const EX=[
    ["String pool",'String a = "java";\nString b = "java";\nString c = new String("java");\nSystem.out.println(a == b);\nSystem.out.println(a == c);\nSystem.out.println(a.equals(c));\nString d = c.intern();\nSystem.out.println(a == d);'],
    ["Integer cache","Integer x = 127;\nInteger y = 127;\nInteger p = 128;\nInteger q = 128;\nSystem.out.println(x == y);\nSystem.out.println(p == q);\nSystem.out.println(p.equals(q));"],
    ["Arrays & aliasing","int[] a = {1, 2, 3};\nint[] b = a;\nb[0] = 99;\nSystem.out.println(a[0]);\nint[] c = a.clone();\nc[1] = 7;\nSystem.out.println(a[1]);\nSystem.out.println(Arrays.toString(c));"],
    ["Pass by value","public class PassByValue {\n    static void change(int[] arr, int n) {\n        arr[0] = 42;\n        n = 100;\n        arr = new int[2];\n    }\n\n    public static void main(String[] args) {\n        int[] nums = {1, 2, 3};\n        int count = 5;\n        change(nums, count);\n        System.out.println(nums[0]);\n        System.out.println(count);\n    }\n}"],
    ["StringBuilder",'String s = "Hi";\ns = s + "!";\nStringBuilder sb = new StringBuilder("Hi");\nsb.append("!");\nsb.append(" Java");\nString t = sb.toString();\nSystem.out.println(s);\nSystem.out.println(t);'],
    ["Garbage collection",'String s = new String("temp");\nint[] big = new int[4];\ns = null;\nbig = new int[2];\nSystem.gc();'],
    ["String[] of refs",'String[] names = new String[3];\nnames[0] = "Ann";\nnames[1] = new String("Bob");\nnames[2] = names[0];\nSystem.out.println(names[0] == names[2]);\nnames[1] = null;\nSystem.gc();']];
  host.innerHTML='<div class="ml-ex" role="group" aria-label="Examples">'+EX.map((e,i)=>'<button type="button" class="chip" data-ex="'+i+'">'+esc(e[0])+"</button>").join("")+"</div>"+
    '<div class="rz ml"><div class="rz-head"><span class="rz-dots"><i></i><i></i><i></i></span><span class="rz-file">MemoryLab.java · edit me</span><span class="rz-ct"></span></div>'+
    '<div class="rz-main"><div class="ml-ed"><div class="ml-bar"></div><div class="ml-gut" aria-hidden="true"></div><textarea spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Java code"></textarea></div>'+
    '<div class="rz-mem"><svg class="rz-arw" aria-hidden="true"><defs><marker id="mlM" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker></defs><g></g></svg>'+
    '<div class="rz-col"><h5>Stack</h5><div class="rz-stack"></div></div><div class="rz-col"><h5>Heap</h5><div class="rz-heap"></div></div></div></div>'+
    '<div class="rz-msg" aria-live="polite"></div><div class="rz-foot"><div class="rz-out"><span>Console</span><pre></pre></div>'+
    '<div class="rz-ctl"><button type="button" class="btn" data-a="reset" title="Start again">⟲</button><button type="button" class="btn" data-a="prev">◀ Back</button>'+
    '<button type="button" class="btn pri" data-a="next">Step ▶</button><button type="button" class="btn" data-a="play">▶ Run</button><button type="button" class="btn" data-a="gc" title="Add System.gc() at the end and run it">🗑 Run GC</button></div></div>'+
    '<div class="rz-prog"><i></i></div></div>';
  const $h=s=>host.querySelector(s),ta=$h("textarea"),gut=$h(".ml-gut"),bar=$h(".ml-bar"),stack=$h(".rz-stack"),heap=$h(".rz-heap"),mem=$h(".rz-mem"),g=$h(".rz-arw g"),
    msg=$h(".rz-msg"),out=$h(".rz-out pre"),ct=$h(".rz-ct"),prog=$h(".rz-prog i");
  ta.value=st0.get("js1-memlab")||EX[0][1];
  let S=null,src=null,k=0,prev=null,timer=null;const LH=22.75;
  const lines=()=>{const n=ta.value.split("\n").length;gut.innerHTML=Array.from({length:n},(_,i)=>"<div>"+(i+1)+"</div>").join("");};
  const sync=()=>{gut.scrollTop=ta.scrollTop;bar.style.marginTop=(-ta.scrollTop)+"px";};
  function compile(){if(src===ta.value&&S)return;src=ta.value;st0.set("js1-memlab",src);S=MLC.run(src);k=0;prev=null;}
  const stop=()=>{clearInterval(timer);timer=null;$h('[data-a="play"]').textContent="▶ Run";};
  const val=v=>!v||v.un?"<span>—</span>":v.n?'<b class="nul">null</b>':v.r?'<i class="rz-ref" data-r="'+v.r+'"></i>':"<b>"+esc(v.t==="char"?"'"+v.v+"'":v.t==="double"&&Number.isInteger(v.v)?v.v.toFixed(1):String(v.v))+"</b>";
  function obj(o,hot){const cls="rz-o"+(o.kind==="String"?" str":"")+(hot.includes(o.id)?" hot":"")+(o.garbage?" garb":""),id=" #"+o.id;
    const cells=(xs,ref)=>'<span class="rz-cells">'+xs.map((c,i)=>'<i>'+(ref?(c?'<i class="rz-ref" data-r="'+c.r+'"></i>':"null"):esc(c===" "?"␣":c===""?"":String(c)))+"<em>"+i+"</em></i>").join("")+"</span>";
    if(o.kind==="String")return '<div class="'+cls+'" data-id="'+o.id+'"><small>String'+id+'</small><b>"'+esc(o.text)+'"</b></div>';
    if(o.kind==="Integer")return '<div class="'+cls+'" data-id="'+o.id+'"><small>Integer'+id+"</small><b>"+o.val+"</b></div>";
    if(o.kind==="StringBuilder"){const xs=o.text.split("").concat(Array(Math.max(0,Math.min(o.cap,24)-o.text.length)).fill(""));
      return '<div class="'+cls+'" data-id="'+o.id+'"><small>StringBuilder'+id+" · length "+o.text.length+" · capacity "+o.cap+"</small>"+cells(xs.slice(0,24),false).replace(/<em>\d+<\/em>/g,"")+"</div>";}
    return '<div class="'+cls+'" data-id="'+o.id+'"><small>'+o.kind.replace("[]","["+o.vals.length+"]")+id+"</small>"+cells(o.vals,o.kind==="String[]"||o.kind==="Integer[]")+"</div>";}
  function arrows(){const mr=mem.getBoundingClientRect();let h="";
    mem.querySelectorAll(".rz-ref[data-r]").forEach(r=>{const t=heap.querySelector('.rz-o[data-id="'+r.dataset.r+'"]');if(!t)return;const a=r.getBoundingClientRect(),b=t.getBoundingClientRect();
      const x1=a.left+a.width/2-mr.left,y1=a.top+a.height/2-mr.top,right=b.left>a.right,x2=(right?b.left-2:b.right+2)-mr.left,y2=Math.min(b.bottom-8,Math.max(b.top+8,y1))-mr.top,
        dx=right?Math.max(30,(x2-x1)*.5):40,hot=r.closest(".hot")||t.classList.contains("hot");
      h+='<path class="'+(hot?"hot":"")+'" marker-end="url(#mlM)" d="M'+x1.toFixed(1)+" "+y1.toFixed(1)+" C"+(x1+dx).toFixed(1)+" "+y1.toFixed(1)+" "+(right?x2-dx:x2+dx).toFixed(1)+" "+y2.toFixed(1)+" "+x2.toFixed(1)+" "+y2.toFixed(1)+'"/>';});
    g.innerHTML=h;}
  function draw(){compile();const steps=S.steps,last=steps.length-1;k=Math.max(0,Math.min(k,last));const s=steps[k],pv=prev,end=k===last,err=end&&S.error;
    const L=err?S.error.line:s.line;[...gut.children].forEach((d,i)=>{d.className=i===L?(err?"err":"cur"):"";});
    bar.classList.toggle("on",L>=0);bar.classList.toggle("err",!!err);if(L>=0){bar.style.transform="translateY("+(L*LH)+"px)";const y=12+L*LH;if(y<ta.scrollTop||y>ta.scrollTop+ta.clientHeight-30)ta.scrollTop=Math.max(0,y-ta.clientHeight/2);}
    sync();
    stack.innerHTML=s.frames.map((fr,fi)=>{const pf=pv&&pv.frames[fi],isNew=!pf||pf.name!==fr.name;
      return '<div class="rz-fr'+(isNew&&pv?" push":"")+(fi===s.frames.length-1?" top":"")+'"><div class="rz-fh">'+esc(fr.name)+"()</div>"+
        (fr.vars.map(v=>{const o=pf&&!isNew?pf.vars.find(x=>x.name===v.name):null,chg=pv&&(!o||JSON.stringify(o.val)!==JSON.stringify(v.val));
          return '<div class="rz-v'+(chg?" chg":"")+(fi===s.frames.length-1&&s.hot.v.includes(v.name)?" hot":"")+'"><span><em>'+esc(v.type)+"</em>"+esc(v.name)+"</span>"+val(v.val)+"</div>";}).join("")||'<div class="rz-v e"><span>no variables yet</span></div>')+"</div>";}).reverse().join("")||'<div class="rz-empty">the stack is empty: the program has ended</div>';
    const ph=pv?pv.heap:[],grp=[["String pool",o=>o.zone==="pool"],["Integer cache · −128…127",o=>o.zone==="cache"],["Objects",o=>o.zone==="heap"]];
    heap.innerHTML=grp.map(([t,f])=>{const os=s.heap.filter(f);if(!os.length)return "";
      return '<div class="rz-area"><div class="rz-at">'+t+"</div>"+os.map(o=>{const p=ph.find(x=>x.id===o.id);return obj(o,s.hot.o).replace('class="rz-o','class="rz-o'+(pv&&!p?" pop":p&&JSON.stringify(p)!==JSON.stringify(o)&&!o.garbage?" chg":""));}).join("")+"</div>";}).join("")||'<div class="rz-empty">nothing on the heap yet</div>';
    msg.classList.toggle("err",!!err);msg.innerHTML=err?"⚠ Line "+(S.error.line+1)+": "+esc(S.error.msg):esc(s.msg);
    const newOut=pv&&s.out.length>pv.out.length?s.out.slice(pv.out.length):"";
    out.innerHTML=esc(newOut?pv.out:s.out)+(newOut?'<span class="new">'+esc(newOut)+"</span>":"");
    ct.textContent="step "+(k+1)+" / "+steps.length;prog.style.transform="scaleX("+((k+1)/steps.length).toFixed(3)+")";
    $h('[data-a="prev"]').disabled=k===0;$h('[data-a="next"]').disabled=end;
    requestAnimationFrame(arrows);prev=s;}
  host.addEventListener("click",e=>{const ex=e.target.closest("[data-ex]");if(ex){stop();ta.value=EX[+ex.dataset.ex][1];lines();src=null;draw();return;}
    const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;compile();
    if(a==="next"){stop();k++;draw();}else if(a==="prev"){stop();k--;prev=null;draw();}else if(a==="reset"){stop();k=0;prev=null;draw();}
    else if(a==="play"){if(timer){stop();return;}if(k>=S.steps.length-1)k=-1;b.textContent="❚❚ Pause";timer=setInterval(()=>{if(k>=S.steps.length-1){stop();return;}k++;draw();},1100);}
    else if(a==="gc"){stop();const P=MLC.compile(ta.value),lastSt=P.main[P.main.length-1],Ls=ta.value.split("\n");
      if(!lastSt){Ls.push("System.gc();");}else{const ind=(Ls[lastSt.line].match(/^\s*/)||[""])[0];Ls.splice(lastSt.line+1,0,ind+"System.gc();");}
      ta.value=Ls.join("\n");lines();src=null;compile();k=S.steps.length-1;draw();}});
  ta.addEventListener("input",()=>{lines();stop();});ta.addEventListener("scroll",sync,{passive:true});
  ta.addEventListener("keydown",e=>{if(e.key==="Tab"){e.preventDefault();const p=ta.selectionStart;ta.setRangeText("    ",p,ta.selectionEnd,"end");lines();}
    if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();compile();k++;draw();}});
  addEventListener("resize",()=>requestAnimationFrame(arrows),{passive:true});
  lines();draw();
})();

/* v23 Algorithm race (#raceApp on the Practice page): two sorting algorithms sort copies of the same array side by side. Each
   algorithm is first run to a trace of operations (c = compare i j, s = swap i j, w = write i value, d = element i is in its final
   place); both lanes then replay the same number of operations per frame, so the one that needs fewer operations wins. Bars light
   up amber for a comparison, pink for a write, green when final. Counters, a winner banner and a "why" verdict built from each
   algorithm's best / average / worst case and the data pattern. */
(function(){const host=document.getElementById("raceApp");if(!host)return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const ALG={
    bubble:{n:"Bubble sort",b:"O(n)",a:"O(n²)",w:"O(n²)",st:true,run(a,o){const n=a.length;for(let i=0;i<n-1;i++){let sw=false;for(let j=0;j<n-1-i;j++){o.push(["c",j,j+1]);if(a[j]>a[j+1]){[a[j],a[j+1]]=[a[j+1],a[j]];o.push(["s",j,j+1]);sw=true;}}o.push(["d",n-1-i]);if(!sw)break;}}},
    selection:{n:"Selection sort",b:"O(n²)",a:"O(n²)",w:"O(n²)",st:false,run(a,o){const n=a.length;for(let i=0;i<n-1;i++){let m=i;for(let j=i+1;j<n;j++){o.push(["c",m,j]);if(a[j]<a[m])m=j;}if(m!==i){[a[i],a[m]]=[a[m],a[i]];o.push(["s",i,m]);}o.push(["d",i]);}}},
    insertion:{n:"Insertion sort",b:"O(n)",a:"O(n²)",w:"O(n²)",st:true,run(a,o){for(let i=1;i<a.length;i++){const v=a[i];let j=i-1;while(j>=0){o.push(["c",j,i]);if(a[j]<=v)break;a[j+1]=a[j];o.push(["w",j+1,a[j]]);j--;}if(j+1!==i){a[j+1]=v;o.push(["w",j+1,v]);}}}},
    merge:{n:"Merge sort",b:"O(n log n)",a:"O(n log n)",w:"O(n log n)",st:true,run(a,o){const t=a.slice();const ms=(lo,hi)=>{if(hi-lo<1)return;const m=(lo+hi)>>1;ms(lo,m);ms(m+1,hi);for(let k=lo;k<=hi;k++)t[k]=a[k];
        let i=lo,j=m+1;for(let k=lo;k<=hi;k++){if(i>m){a[k]=t[j++];}else if(j>hi){a[k]=t[i++];}else{o.push(["c",i,j]);a[k]=t[j]<t[i]?t[j++]:t[i++];}o.push(["w",k,a[k]]);}};ms(0,a.length-1);}},
    quick:{n:"Quicksort (last pivot)",b:"O(n log n)",a:"O(n log n)",w:"O(n²)",st:false,run(a,o){const qs=(lo,hi)=>{while(lo<hi){const p=a[hi];let i=lo;for(let j=lo;j<hi;j++){o.push(["c",j,hi]);if(a[j]<p){if(i!==j){[a[i],a[j]]=[a[j],a[i]];o.push(["s",i,j]);}i++;}}
        if(i!==hi){[a[i],a[hi]]=[a[hi],a[i]];o.push(["s",i,hi]);}o.push(["d",i]);if(i-lo<hi-i){qs(lo,i-1);lo=i+1;}else{qs(i+1,hi);hi=i-1;}}if(lo===hi)o.push(["d",lo]);};qs(0,a.length-1);}},
    heap:{n:"Heap sort",b:"O(n log n)",a:"O(n log n)",w:"O(n log n)",st:false,run(a,o){const n=a.length,sift=(i,m)=>{for(;;){let l=2*i+1,r=l+1,b=i;if(l<m){o.push(["c",l,b]);if(a[l]>a[b])b=l;}if(r<m){o.push(["c",r,b]);if(a[r]>a[b])b=r;}if(b===i)return;[a[i],a[b]]=[a[b],a[i]];o.push(["s",i,b]);i=b;}};
        for(let i=(n>>1)-1;i>=0;i--)sift(i,n);for(let e=n-1;e>0;e--){[a[0],a[e]]=[a[e],a[0]];o.push(["s",0,e]);o.push(["d",e]);sift(0,e);}o.push(["d",0]);}}};
  const DATA={random:"Random",nearly:"Nearly sorted",reversed:"Reversed",few:"Few unique values"};
  function mkData(kind,n){let a=Array.from({length:n},(_,i)=>i+1);
    if(kind==="random"){for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}}
    else if(kind==="nearly"){for(let k=0;k<Math.max(1,n/12);k++){const i=Math.floor(Math.random()*(n-1));[a[i],a[i+1]]=[a[i+1],a[i]];}}
    else if(kind==="reversed")a.reverse();
    else a=Array.from({length:n},()=>Math.ceil(Math.random()*4)*(n/4));
    return a;}
  const opt=(o,sel)=>Object.entries(o).map(([k,v])=>'<option value="'+k+'"'+(k===sel?" selected":"")+">"+esc(v.n||v)+"</option>").join("");
  host.innerHTML='<div class="rc-ctl">'+
      '<label>Lane A <select data-k="a">'+opt(ALG,"insertion")+'</select></label><label>Lane B <select data-k="b">'+opt(ALG,"merge")+"</select></label>"+
      '<label>Data <select data-k="d">'+opt(DATA,"random")+'</select></label><label>Size <select data-k="n"><option>16</option><option selected>32</option><option>64</option><option>128</option></select></label>'+
      '<label class="rc-sp">Speed <input type="range" min="1" max="40" value="6" data-k="s"></label>'+
      '<button type="button" class="btn pri" data-a="go">▶ Race</button><button type="button" class="btn" data-a="new">⟲ New data</button></div>'+
    '<div class="rc-lanes">'+["a","b"].map(l=>'<div class="rc-lane" data-l="'+l+'"><div class="rc-h"><b></b><span class="rc-o"></span><span class="rc-win">🏆 winner</span></div><canvas></canvas>'+
      '<div class="rc-ct"><span>comparisons <b data-c="c">0</b></span><span>writes <b data-c="w">0</b></span><span>operations <b data-c="t">0</b></span></div><div class="rc-bar"><i></i></div></div>').join("")+"</div>"+
    '<div class="rc-why" aria-live="polite"></div>';
  const $=s=>host.querySelector(s),sel=k=>$('[data-k="'+k+'"]');
  let base=[],L={},raf=0,running=false;
  function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()||"#8b5cf6";}
  function lane(id){const el=$('.rc-lane[data-l="'+id+'"]'),key=sel(id).value,A=ALG[key],arr=base.slice(),ops=[];A.run(arr.slice(),ops);
    el.querySelector(".rc-h b").textContent=A.n;el.querySelector(".rc-o").textContent="best "+A.b+" · avg "+A.a+" · worst "+A.w+(A.st?" · stable":"");
    el.classList.remove("won","lost");return {el,key,A,arr,ops,i:0,c:0,w:0,hl:{},done:new Set(),fin:false,cv:el.querySelector("canvas")};}
  function setup(newData){cancelAnimationFrame(raf);running=false;$('[data-a="go"]').textContent="▶ Race";
    if(newData||!base.length||base.length!==+sel("n").value)base=mkData(sel("d").value,+sel("n").value);
    L={a:lane("a"),b:lane("b")};$(".rc-why").innerHTML="Both lanes get <b>the same "+base.length+" values</b> ("+DATA[sel("d").value].toLowerCase()+"). Press <b>Race</b>.";
    for(const l of Object.values(L)){paint(l);count(l);}}
  function paint(l){const cv=l.cv,dpr=Math.min(2,devicePixelRatio||1),W=cv.clientWidth,H=cv.clientHeight;if(cv.width!==Math.round(W*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}
    const g=cv.getContext("2d");g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);const n=l.arr.length,max=Math.max(...base),bw=W/n,acc=css("--accent"),acc2=css("--accent-2");
    for(let i=0;i<n;i++){const h=(l.arr[i]/max)*(H-6),x=i*bw,st=l.hl[i];
      g.fillStyle=l.fin||l.done.has(i)?"#22c55e":st==="c"?"#f59e0b":st==="w"?"#ec4899":i%2?acc:acc2;g.globalAlpha=st?1:l.fin||l.done.has(i)?.9:.78;
      g.fillRect(x+Math.min(1,bw*.12),H-h,Math.max(1,bw-Math.min(2,bw*.24)),h);}g.globalAlpha=1;}
  function count(l){const t=l.c+l.w;l.el.querySelector('[data-c="c"]').textContent=l.c;l.el.querySelector('[data-c="w"]').textContent=l.w;l.el.querySelector('[data-c="t"]').textContent=t;
    l.el.querySelector(".rc-bar i").style.transform="scaleX("+(l.ops.length?l.i/l.ops.length:0).toFixed(3)+")";}
  function step(l,k){l.hl={};for(let s=0;s<k&&l.i<l.ops.length;s++){const op=l.ops[l.i++];
      if(op[0]==="c"){l.c++;l.hl[op[1]]="c";l.hl[op[2]]="c";}
      else if(op[0]==="s"){l.w+=2;[l.arr[op[1]],l.arr[op[2]]]=[l.arr[op[2]],l.arr[op[1]]];l.hl[op[1]]="w";l.hl[op[2]]="w";}
      else if(op[0]==="w"){l.w++;l.arr[op[1]]=op[2];l.hl[op[1]]="w";}
      else if(op[0]==="d")l.done.add(op[1]);}
    if(l.i>=l.ops.length&&!l.fin){l.fin=true;l.hl={};l.end=performance.now();}}
  function why(){const a=L.a,b=L.b,ta=a.c+a.w,tb=b.c+b.w,d=sel("d").value,n=base.length;
    const W=ta===tb?null:ta<tb?a:b,Lo=W===a?b:a,tw=W?W.c+W.w:ta,tl=W?Lo.c+Lo.w:tb;
    const NOTE={bubble:{nearly:"bubble sort stops early when a pass makes no swaps, so nearly sorted data takes only a few passes",reversed:"reversed input is bubble sort's worst case: every pair is out of order",_:"bubble sort compares neighbours over and over: about n²/2 comparisons"},
      selection:{_:"selection sort always scans the whole unsorted part, whatever the data looks like: about n²/2 comparisons every time (but at most n−1 swaps)"},
      insertion:{nearly:"on nearly sorted data each element moves only a step or two, so insertion sort is close to O(n). That is why TimSort (Java's sort for objects) uses it for short runs",reversed:"reversed input makes every element walk all the way back: insertion sort's worst case, about n²/2 moves",_:"insertion sort shifts each element left until it fits: O(n²) on random data but very fast on small or nearly sorted arrays"},
      merge:{_:"merge sort always splits in half and merges: n log n work whatever the data (log₂ "+n+" ≈ "+Math.log2(n).toFixed(1)+" levels), but every merge writes every element, so it never benefits from sorted input"},
      quick:{nearly:"with the last element as pivot, sorted or nearly sorted input makes almost every partition lopsided: quicksort drifts towards O(n²). Real libraries pick better pivots (Java uses Dual-Pivot Quicksort for primitives)",reversed:"with the last element as pivot, reversed input makes every partition lopsided: quicksort's O(n²) worst case",few:"many equal values make this simple partition lopsided, so it slows down",_:"on random data quicksort's pivots split the array fairly evenly: O(n log n) with small constants, often the fastest in practice"},
      heap:{_:"heap sort is O(n log n) in every case and sorts in place, but jumping around the heap does more comparisons than merge or quick sort on average"}};
    const nt=l=>(NOTE[l.key][d]||NOTE[l.key]._);
    let h=W?"<b>"+esc(W.A.n)+"</b> won with <b>"+tw+"</b> operations against <b>"+tl+"</b> ("+(tl/Math.max(1,tw)).toFixed(1)+"× fewer).":"A tie: both needed <b>"+ta+"</b> operations.";
    h+="<ul><li>"+esc(a.A.n)+": "+nt(a)+".</li><li>"+esc(b.A.n)+": "+nt(b)+".</li></ul>";
    h+='<p class="small muted">Operations = comparisons + element writes (a swap counts as 2 writes). In Java, <code>Arrays.sort(int[])</code> uses Dual-Pivot Quicksort and <code>Arrays.sort(Object[])</code> / <code>List.sort</code> use TimSort (stable).</p>';
    $(".rc-why").innerHTML=h;if(W){W.el.classList.add("won");Lo.el.classList.add("lost");if(window.FX){const r=W.el.getBoundingClientRect();FX.confetti(r.left+r.width/2,r.top+30,36,{speed:280});}}}
  function frame(){const k=+sel("s").value;for(const l of Object.values(L)){if(!l.fin)step(l,k);paint(l);count(l);}
    if(L.a.fin&&L.b.fin){running=false;$('[data-a="go"]').textContent="▶ Race again";why();return;}raf=requestAnimationFrame(frame);}
  host.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;
    if(b.dataset.a==="new"){setup(true);return;}
    if(running){cancelAnimationFrame(raf);running=false;b.textContent="▶ Resume";return;}
    if(L.a.fin&&L.b.fin||!L.a.i&&!L.b.i)setup(false);running=true;b.textContent="❚❚ Pause";$(".rc-why").textContent="Racing…";raf=requestAnimationFrame(frame);});
  host.addEventListener("change",e=>{const k=e.target.dataset.k;if(k==="s")return;setup(k==="d"||k==="n");});
  addEventListener("resize",()=>{for(const l of Object.values(L))paint(l);},{passive:true});
  setup(true);
})();

