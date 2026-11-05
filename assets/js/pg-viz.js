/* pg-viz.js: the DSA Lab's explanation layer for the Java Visual Playground (java/playground.html). Loaded after jvm-lite.js, before
   playground.js. Pure functions, no DOM: index the program's statements by line (JVML.parse) and say in plain English what a statement
   does. Values never come from here: the line card adds them from the recorded trace. Global: window.PGVZ. Details: kb/playground.md. */
"use strict";
/* DSX: the DSA design system's building blocks (CSS block "dsa-ds v1"), shared by the DSA Lab and the D00–D21 labs (dsa pages load
   this file too; the PGVZ part below needs jvm-lite and stays off there). HTML builders return strings; flip() swaps a stage's HTML and
   glides every keyed element ([data-k], or opts.items) from its old place, fades new ones in and leaves a fading ghost for removed ones;
   stepper() is the one control bar (⏮ ◀ ▶/⏸ ▶ ⏭, speed, counter, keys ← → Space Home End). States: act cmp mod del ok dim new. */
(function(){
  const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const still=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T={fast:160,move:320,emph:480},EASE="cubic-bezier(.2,.7,.2,1)";
  const st=s=>s?" is-"+s.split(" ").join(" is-"):"";
  const K=(p,k)=>k===undefined||k===null?"":' data-k="'+E(p+k)+'"';
  /* cells(vals, {k, idx, addr, size, st(i), ptr:{name: i | [i, "cmp"]}, nil}) : contiguous memory cells, index under, address over */
  function cells(vals,o){o=o||{};const p=o.k||"c";
    const row=vals.map((v,i)=>'<span class="dsx-c'+st(o.st&&o.st(i))+(v===null||v===undefined?" nil":"")+'"'+K(p,o.keys?o.keys[i]:i)+">"+
      (o.addr!==undefined?"<u>0x"+(o.addr+i*(o.size||4)).toString(16)+"</u>":"")+"<b>"+(v===null||v===undefined?(o.nil||"·"):E(v))+"</b>"+(o.idx===false?"":"<i>"+i+"</i>")+"</span>").join("");
    let pts="";if(o.ptr){const at={};for(const n in o.ptr){const x=[].concat(o.ptr[n]),i=x[0];if(i===null||i===undefined)continue;(at[i]=at[i]||[]).push([n,x[1]||""]);}
      pts='<div class="dsx-pts">'+Object.keys(at).map(i=>at[i].map(([n,c],d)=>'<span class="dsx-pt '+c+'" style="left:calc('+(Number(i)+.5)+' * (var(--ds-cell) - var(--ds-bw)));top:'+(d*12)+'px">'+E(n)+"</span>").join("")).join("")+"</div>";}
    return '<div class="dsx-arr'+(o.addr!==undefined?" addr":"")+'">'+'<div class="dsx-row">'+row+"</div>"+pts+"</div>";}
  /* chain(nodes [{v, k, st, tags:[], alt:[]}], {dbl, tail:"null"|false, circ, ar:[state per arrow]}) : a linked list */
  function chain(nodes,o){o=o||{};
    const node=(n,i)=>'<span class="dsx-ni"'+K("n",n.k!==undefined?n.k:n.v)+'><span class="dsx-tgs">'+(n.tags||[]).map(t=>'<span class="dsx-tg">'+E(t)+"</span>").join("")+(n.alt||[]).map(t=>'<span class="dsx-tg alt">'+E(t)+"</span>").join("")+"</span>"+
      '<span class="dsx-n'+st(n.st)+'">'+(o.dbl?'<span class="dsx-np p'+(i===0&&!o.circ?" nil":"")+'"></span>':"")+"<b>"+E(n.v)+"</b>"+'<span class="dsx-np'+(i===nodes.length-1&&!o.circ&&!o.tail?" nil":"")+'"></span></span></span>';
    const ar=i=>'<i class="dsx-ar'+(o.dbl?" dbl":"")+st(o.ar&&o.ar[i])+'">'+(o.dbl?"<i></i>":"")+"</i>";
    let h=nodes.map((n,i)=>node(n,i)+(i<nodes.length-1?ar(i):"")).join("");
    if(!nodes.length)h='<span class="dsx-nil">head = null</span>';
    else if(o.tail&&!o.circ)h+=ar(nodes.length-1)+'<span class="dsx-nil">'+E(o.tail)+"</span>";
    return '<div class="dsx-chain'+(o.circ?" circ":"")+'">'+h+(o.circ&&nodes.length?'<span class="dsx-back" style="left:24px;right:24px"></span>':"")+"</div>";}
  /* pile(items bottom→top [{v, k, st, note}], {top:"top", label}) : a stack */
  function pile(items,o){o=o||{};
    return '<div class="dsx-stk">'+(o.label?'<span class="dsx-lbl">'+E(o.label)+"</span>":"")+'<div class="dsx-pile">'+items.map((x,i)=>'<span class="dsx-pi'+st(x.st)+'"'+K("p",x.k!==undefined?x.k:i)+(i===items.length-1&&o.top!==false?' data-top="← '+E(o.top||"top")+'"':"")+"><b>"+E(x.v)+"</b>"+(x.note?"<small>"+E(x.note)+"</small>":"")+"</span>").join("")+"</div></div>";}
  /* lane(items front→rear [{v, k, st}], {front, rear}) : a queue */
  function lane(items,o){o=o||{};
    return '<div class="dsx-q"><div class="dsx-lane">'+items.map((x,i)=>'<span class="dsx-pi'+st(x.st)+'"'+K("q",x.k!==undefined?x.k:i)+"><b>"+E(x.v)+"</b></span>").join("")+'</div><div class="dsx-qe"><span>'+E(o.front||"front")+"</span><span>"+E(o.rear||"rear")+"</span></div></div>";}
  const key=(el,auto)=>{if(el.dataset&&el.dataset.k)return el.dataset.k;if(!auto)return "";const b=el.querySelector("b");return String(el.getAttribute("class")||"").split(" ")[0]+"|"+(b||el).textContent.trim();};
  /* the items that move on their own: not a container of 2+ items, not inside another item */
  const items=(root,sel)=>{const all=[...root.querySelectorAll(sel)],cont=new Set(all.filter(el=>el.querySelectorAll(sel).length>1)),ok=new Set(all.filter(el=>!cont.has(el)));
    return all.filter(el=>{if(!ok.has(el))return false;for(let p=el.parentElement;p&&p!==root;p=p.parentElement)if(ok.has(p))return false;return true;});};
  /* flip(stage, html, {items: selector, auto: key by class + text when there is no data-k}) */
  function flip(stage,html,o){o=o||{};const sel=o.items||"[data-k]";
    if(still()||!stage.isConnected||!Element.prototype.animate){stage.innerHTML=html;return;}
    const sr=stage.getBoundingClientRect(),old=new Map(),cnt=new Map();
    const keyed=root=>items(root,sel).map(el=>{let k=key(el,o.auto);if(!k)return null;const n=(cnt.get(k)||0)+1;cnt.set(k,n);return [k+"#"+n,el];}).filter(Boolean);
    for(const [k,el] of keyed(stage))old.set(k,{r:el.getBoundingClientRect(),el});
    cnt.clear();stage.innerHTML=html;const seen=new Set();
    for(const [k,el] of keyed(stage)){const p=old.get(k);seen.add(k);
      if(p){const r=el.getBoundingClientRect(),dx=p.r.left-r.left,dy=p.r.top-r.top;
        if(Math.abs(dx)>.5||Math.abs(dy)>.5)el.animate([{transform:"translate("+dx+"px,"+dy+"px)"},{transform:"none"}],{duration:T.move,easing:EASE});}
      else if(old.size)el.animate([{opacity:0,transform:"scale(.82)"},{opacity:1,transform:"none"}],{duration:T.move,easing:EASE});}
    if(getComputedStyle(stage).position==="static")stage.style.position="relative";
    for(const [k,p] of old){if(seen.has(k))continue;const g=p.el.cloneNode(true);g.classList.add("dsx-ghost");
      Object.assign(g.style,{position:"absolute",left:(p.r.left-sr.left+stage.scrollLeft)+"px",top:(p.r.top-sr.top+stage.scrollTop)+"px",width:p.r.width+"px",height:p.r.height+"px",margin:"0",pointerEvents:"none"});
      stage.appendChild(g);g.animate([{opacity:.9},{opacity:0,transform:"translateY(-12px) scale(.9)"}],{duration:T.emph,easing:EASE}).onfinish=()=>g.remove();}}
  const SPD=[["0.5×",2],["1×",1],["2×",.5],["4×",.25]];
  const getS=()=>{try{const v=localStorage.getItem("js1-ds-speed");return v===null?1:Number(v);}catch(e){return 1;}};
  const setS=v=>{try{localStorage.setItem("js1-ds-speed",String(v));}catch(e){}};
  /* stepper(host, {n(): last step index, draw(k, dir), delay: base ms, extra: html}) → {set(k), reload(), get k} ; markup goes where
     ctl() is placed (a .dsx-ctl inside host); every button keeps data-a for the keyboard */
  const ctl=extra=>'<div class="dsx-ctl" role="group" aria-label="Step through"><button type="button" class="btn" data-a="first" title="Back to the start (Home)" aria-label="Back to the start">⏮</button><button type="button" class="btn" data-a="back" title="Previous step (←)" aria-label="Previous step">◀</button><button type="button" class="btn pri" data-a="play" title="Play or pause (Space)">▶ Play</button><button type="button" class="btn" data-a="next" title="Next step (→)" aria-label="Next step">▶</button><button type="button" class="btn" data-a="last" title="Jump to the end (End)" aria-label="Jump to the end">⏭</button><label class="dsx-spd"><span>Speed</span><select aria-label="Speed">'+SPD.map(([t,v])=>'<option value="'+v+'"'+(v===getS()?" selected":"")+">"+t+"</option>").join("")+"</select></label>"+(extra||"")+'<span class="dsx-cnt" aria-live="polite"></span><div class="dsx-prog"><i></i></div></div>';
  function stepper(host,o){let k=0,timer=null;const q=s=>host.querySelector(s);
    if(!host.hasAttribute("tabindex"))host.setAttribute("tabindex","-1");
    const ui=()=>{const n=o.n();q(".dsx-cnt").textContent="step "+k+" / "+n;q(".dsx-prog i").style.width=(n?k/n*100:0)+"%";
      q('[data-a="first"]').disabled=q('[data-a="back"]').disabled=k<=0;q('[data-a="next"]').disabled=q('[data-a="last"]').disabled=k>=n;
      q('[data-a="play"]').textContent=timer?"⏸ Pause":k>=n&&n>0?"↺ Replay":"▶ Play";};
    const go=(t,dir)=>{const n=o.n();t=Math.max(0,Math.min(n,t));if(t===k&&dir!=="load")return;k=t;o.draw(k,dir);ui();};
    const stop=()=>{if(timer){clearTimeout(timer);timer=null;}ui();};
    const tick=()=>{if(k>=o.n()){stop();return;}go(k+1,1);timer=setTimeout(tick,(o.delay||700)*getS());ui();};
    const play=()=>{if(timer){stop();return;}if(k>=o.n())go(0,-1);timer=setTimeout(tick,Math.min(400,(o.delay||700)*getS()));ui();};
    host.addEventListener("click",e=>{const b=e.target.closest(".dsx-ctl [data-a]");if(!b||!host.contains(b))return;const a=b.dataset.a;
      if(a==="play")play();else{stop();if(a==="next")go(k+1,1);else if(a==="back")go(k-1,-1);else if(a==="first")go(0,-1);else if(a==="last")go(o.n(),1);}});
    host.addEventListener("change",e=>{if(e.target.closest(".dsx-spd")){setS(Number(e.target.value));}});
    host.addEventListener("keydown",e=>{if(e.target.closest("input,select,textarea,.CodeMirror"))return;const m={ArrowRight:"next",ArrowLeft:"back",Home:"first",End:"last"}[e.key];
      if(m){e.preventDefault();stop();if(m==="next")go(k+1,1);else if(m==="back")go(k-1,-1);else if(m==="first")go(0,-1);else go(o.n(),1);}
      else if(e.key===" "&&!e.target.closest("button")){e.preventDefault();play();}});
    host.addEventListener("pointerdown",e=>{if(!e.target.closest("button,select,input,a,.CodeMirror"))host.focus({preventScroll:true});});
    return {set:t=>{stop();go(t,"load");},reload:()=>{stop();k=0;o.draw(0,"load");ui();},stop,get k(){return k;}};}
  const key3=()=>'<div class="dsx-key"><span class="act">working on</span><span class="cmp">compared</span><span class="mod">changed</span><span class="del">removed</span><span class="ok">done</span></div>';
  window.DSX={E,still,T,EASE,cells,chain,pile,lane,flip,ctl,stepper,legend:key3};
})();
(function(){
  if(!window.JVML)return;
  const STMT=new Set(["Local","ExprS","If","While","Do","For","ForEach","Return","Break","Continue","Yield","Throw","Try","Switch","Sync","Assert","CtorCall","Labeled"]);
  /* line -> the outermost statement that starts on it; line -> method/constructor declared on it */
  /* also (Phase 2): ix = array name -> [names used as its 1st index, names used as its 2nd index] (a[i], g[r][c], a[i+1]),
     cx = String/StringBuilder/List name -> names passed to charAt/substring/get/set…, bits = names used with & | ^ << >> >>> ~
     (Phase 3): use = variable name -> methods called on it (push, poll…), via = stack/queue name -> arrays indexed by its top (temps[st.peek()]),
     mono = stacks/queues popped inside a while loop that peeks at them (the monotonic-stack pattern)
     (Phase 5): dp = arrays assigned from their own cells (dp[i] = dp[i-1] + dp[i-2]), low = the source uses i & -i (Fenwick),
     seg = children at 2*i (segment tree), seg0 = children at 2*i+1 and 2*i+2 (root 0) */
  const IXF=new Set(["charAt","substring","subSequence","setCharAt","deleteCharAt","codePointAt","get","set","remove","insert"]);
  const BITOP=new Set(["&","|","^","<<",">>",">>>"]),BITAS=new Set(["&=","|=","^=","<<=",">>=",">>>="]);
  const PEEK=new Set(["peek","peekFirst","peekLast","getFirst","getLast","element","firstElement","lastElement"]),POP=new Set(["pop","poll","pollFirst","pollLast","removeFirst","removeLast"]);
  const ixName=e=>!e?null:e.k==="Name"?e.n:e.k==="Paren"?ixName(e.e):e.k==="Bin"&&(e.op==="+"||e.op==="-")&&e.r.k==="Lit"?ixName(e.l):null;
  function index(src){
    const byLine=new Map(),decl=new Map(),ix=new Map(),cx=new Map(),bits=new Set(),use=new Map(),via=new Map(),mono=new Set(),dp=new Set();let ast;
    const low=/\w\s*&\s*\(?\s*-\s*\w/.test(src),seg=/\b2\s*\*\s*\w|\w\s*\*\s*2\b|<<\s*1\b/.test(src),seg0=/2\s*\*\s*\w+\s*\+\s*2|\w\s*\*\s*2\s*\+\s*2/.test(src);
    try{ast=JVML.parse(src);}catch(e){return {byLine,decl,ix,cx,bits,use,via,mono,dp,low,seg,seg0};}
    const add=(m,a,n)=>{if(!m.has(a))m.set(a,new Set());m.get(a).add(n);};
    const calls=(x,set,out,sn)=>{if(!x||typeof x!=="object"||sn.has(x))return;sn.add(x);if(Array.isArray(x)){for(const y of x)calls(y,set,out,sn);return;}
      if(x.k==="Call"&&x.o&&x.o.k==="Name"&&set.has(x.n))out.add(x.o.n);for(const k in x)if(k!=="t"&&x[k]&&typeof x[k]==="object")calls(x[k],set,out,sn);};
    const put=(m,a,d,n)=>{if(!m.has(a))m.set(a,[new Set(),new Set()]);if(n)m.get(a)[d].add(n);};
    const seen=new Set();
    const walk=(x,owner)=>{
      if(!x||typeof x!=="object"||seen.has(x))return;seen.add(x);
      if(Array.isArray(x)){for(const y of x)walk(y,owner);return;}
      if(x.k==="Call"&&x.o&&x.o.k==="Name")add(use,x.o.n,x.n+(x.args.length?"/"+x.args.length:""));
      if(x.k==="Index"&&x.a.k==="Name"&&x.i.k==="Call"&&x.i.o&&x.i.o.k==="Name"&&(PEEK.has(x.i.n)||POP.has(x.i.n)))add(via,x.i.o.n,x.a.n);
      if(x.k==="While"){const pk=new Set(),pp=new Set();calls(x.c,PEEK,pk,new Set());calls(x.body,POP,pp,new Set());for(const n of pk)if(pp.has(n))mono.add(n);}
      if(x.k==="Index"){if(x.a.k==="Name")put(ix,x.a.n,0,ixName(x.i));else if(x.a.k==="Index"&&x.a.a.k==="Name"){put(ix,x.a.a.n,0,ixName(x.a.i));put(ix,x.a.a.n,1,ixName(x.i));}}
      else if(x.k==="Call"&&x.o&&x.o.k==="Name"&&IXF.has(x.n)){put(cx,x.o.n,0,null);for(const a of x.args.slice(0,2))put(cx,x.o.n,0,ixName(a));}
      else if(x.k==="Bin"&&BITOP.has(x.op)){const a=ixName(x.l);if(a)bits.add(a);if(x.op.length===1){const b=ixName(x.r);if(b)bits.add(b);}}
      else if(x.k==="Assign"&&BITAS.has(x.op)&&x.t.k==="Name")bits.add(x.t.n);
      else if(x.k==="Assign"&&x.t.k==="Index"){const a=arrName(x.t);if(a&&ixReads(x.v,a).length)dp.add(a);}
      else if(x.k==="Un"&&x.op==="~"&&x.e.k==="Name")bits.add(x.e.n);
      if(x.k&&STMT.has(x.k)&&x.line&&!byLine.has(x.line))byLine.set(x.line,x);
      if(x.body&&x.params&&x.line&&!decl.has(x.line))decl.set(x.line,{name:x.name||owner||"constructor",params:x.params.map(p=>p.n),ctor:!x.name});
      const nm=x.k==="Class"||x.kind?x.name:owner;
      for(const k in x)if(k!=="t"&&k!=="ret"&&x[k]&&typeof x[k]==="object")walk(x[k],nm);};
    walk(ast.types,null);
    return {byLine,decl,ix,cx,bits,use,via,mono,dp,low,seg,seg0};}
  /* (Phase 5) the array an index expression writes (dp[i] → dp, dp[i][j] → dp), the reads of that array inside an expression,
     and an index evaluated from the variables (get(name) → number, cell(name, i) → number; undefined when it can't) */
  const arrName=t=>t.a.k==="Name"?t.a.n:t.a.k==="Index"&&t.a.a.k==="Name"?t.a.a.n:null;
  function ixReads(e,a,out){out=out||[];if(!e||typeof e!=="object")return out;if(Array.isArray(e)){for(const y of e)ixReads(y,a,out);return out;}
    if(e.k==="Index"&&arrName(e)===a){out.push(e);return out;}if(e.k==="Lambda")return out;
    for(const k in e)if(k!=="t"&&e[k]&&typeof e[k]==="object")ixReads(e[k],a,out);return out;}
  function ixEval(e,get,cell){
    if(!e)return undefined;
    switch(e.k){case "Lit":return typeof e.v==="number"&&Number.isInteger(e.v)?e.v:undefined;case "Name":return get(e.n);case "Paren":return ixEval(e.e,get,cell);
      case "Un":{const v=ixEval(e.e,get,cell);return v===undefined?v:e.op==="-"?-v:e.op==="+"?v:undefined;}
      case "Index":{if(e.a.k!=="Name")return undefined;const i=ixEval(e.i,get,cell);return i===undefined?i:cell(e.a.n,i);}
      case "Bin":{const l=ixEval(e.l,get,cell),r=ixEval(e.r,get,cell);if(l===undefined||r===undefined)return undefined;
        switch(e.op){case "+":return l+r;case "-":return l-r;case "*":return l*r;case "/":return r?Math.trunc(l/r):undefined;case "%":return r?l%r:undefined;case "<<":return l<<r;case ">>":return l>>r;}}}
    return undefined;}
  /* ---------- Phase 2 views (HTML only; playground.js decides when to use them and adds the per-step markers) ---------- */
  const E=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  /* an int/long/char variable as bits: 8, 16 or 32 when the value (and the one before) fit, else the type's full width */
  function bitsHtml(name,type,val,prev){
    const full=type==="long"?64:type==="short"||type==="char"?16:type==="byte"?8:32;
    const big=x=>{try{return BigInt(x);}catch(e){return 0n;}},v=big(val),p=prev===undefined?null:big(prev);
    let w=full;if(v>=0n&&(p===null||p>=0n)){const m=p!==null&&p>v?p:v;w=m<256n?8:m<65536n?16:m<4294967296n?32:64;w=Math.min(w,full);}
    const bs=BigInt.asUintN(w,v).toString(2).padStart(w,"0"),ps=p===null?null:BigInt.asUintN(w,p).toString(2).padStart(w,"0");
    let h="";for(let i=0;i<w;i++){const pos=w-1-i,b=bs[i],ch=ps!==null&&ps[i]!==b;
      h+=(i&&i%4===0?'<span class="pg-bgap"></span>':"")+'<span class="pg-bt'+(b==="1"?" on":"")+(ch?" pg-bchg":"")+'" title="bit '+pos+'"><b>'+b+"</b>"+(w<=16||pos%4===0?"<i>"+pos+"</i>":"<i></i>")+"</span>";}
    return '<div class="pg-bh">'+E(name)+" = "+E(String(val))+' <small>'+type+" · "+w+" bits"+(w<full?" shown":"")+(ps!==null&&ps!==bs?" · was "+E(String(prev)):"")+'</small></div><div class="pg-bits">'+h+"</div>";}
  /* rows of [start, end] pairs as bars on one number line */
  function intervalsHtml(rows){ // rows: [{a, b, ka, kb}] (ka/kb = data-k of the two cells, for the change flash)
    let lo=Infinity,hi=-Infinity;for(const r of rows){lo=Math.min(lo,r.a,r.b);hi=Math.max(hi,r.a,r.b);}
    if(!isFinite(lo)){lo=0;hi=1;}if(hi===lo)hi=lo+1;
    const pct=x=>((x-lo)/(hi-lo)*100).toFixed(2);
    let h='<div class="pg-iv">';
    rows.forEach((r,i)=>{const a=Math.min(r.a,r.b),b=Math.max(r.a,r.b);
      h+='<div class="pg-ivr" data-r="'+i+'"><span class="pg-ivi">'+i+'</span><div class="pg-ivt"><div class="pg-ivb'+(r.a>r.b?" bad":"")+'" style="left:'+pct(a)+"%;width:calc("+(pct(b)-pct(a)).toFixed(2)+'% + 2px)"></div></div><span class="pg-ivl"><span data-k="'+r.ka+'">'+r.a+'</span>, <span data-k="'+r.kb+'">'+r.b+"</span></span></div>";});
    return h+'<div class="pg-ivr pg-ivax"><span class="pg-ivi"></span><div class="pg-ivt"><span style="left:0">'+lo+'</span><span style="left:100%">'+hi+"</span></div><span></span></div></div>";}
  /* a short source-like text of an expression (for sentences; "…" when it is long) */
  function tx(n,d){
    d=d||0;if(!n)return "";if(d>3)return "…";
    switch(n.k){
      case "Name":return n.n;
      case "Lit":return n.t==="String"?'"'+(String(n.v).length>16?String(n.v).slice(0,16)+"…":n.v)+'"':n.t==="char"?"'"+String.fromCharCode(n.v)+"'":n.v===null?"null":String(n.v);
      case "This":return "this";
      case "Field":return tx(n.o,d+1)+"."+n.n;
      case "Index":return tx(n.a,d+1)+"["+tx(n.i,d+1)+"]";
      case "Call":return (n.o?tx(n.o,d+1)+".":"")+n.n+"("+(n.args.length>2?"…":n.args.map(a=>tx(a,d+1)).join(", "))+")";
      case "New":return "new "+tn(n.t)+"("+(n.args.length>2?"…":n.args.map(a=>tx(a,d+1)).join(", "))+")";
      case "NewArr":return "new "+n.t.n+(n.dims||[]).map(x=>"["+tx(x,d+1)+"]").join("")+(n.init?"{…}":"");
      case "ArrInit":return "{…}";
      case "Bin":return tx(n.l,d+1)+" "+n.op+" "+tx(n.r,d+1);
      case "Un":return n.op+tx(n.e,d+1);
      case "PreInc":return n.op+tx(n.e,d+1);
      case "PostInc":return tx(n.e,d+1)+n.op;
      case "Assign":return tx(n.t,d+1)+" "+n.op+" "+tx(n.v,d+1);
      case "Cast":return "("+tn(n.t)+") "+tx(n.e,d+1);
      case "Paren":return "("+tx(n.e,d+1)+")";
      case "Cond":return tx(n.c,d+1)+" ? "+tx(n.a,d+1)+" : "+tx(n.b,d+1);
      case "Lambda":return "a lambda";
      default:return "…";}}
  const tn=t=>t?t.n+(t.a&&t.a.length?"<…>":"")+"[]".repeat(t.d||0):"var";
  const art=w=>/^[aeiouAEIOU]/.test(w)?"an "+w:"a "+w;
  /* what one expression statement does */
  function exprWhat(e){
    switch(e.k){
      case "Assign":{const t=tx(e.t),v=tx(e.v);
        if(e.op!=="=")return {"+=":"Adds "+v+" to "+t,"-=":"Subtracts "+v+" from "+t,"*=":"Multiplies "+t+" by "+v,"/=":"Divides "+t+" by "+v,"%=":"Keeps the remainder of "+t+" divided by "+v}[e.op]||("Updates "+t+" with "+e.op+" "+v);
        if(e.t.k==="Index")return "Stores "+v+" into the array cell "+t;
        if(e.t.k==="Field")return "Changes the field "+t+" to "+v;
        if(e.v.k==="New"||e.v.k==="NewArr")return "Creates "+art(e.v.k==="New"?tn(e.v.t)+" object":e.v.t.n+" array")+" on the heap and points "+t+" to it";
        return "Stores the value of "+v+" in "+t;}
      case "PostInc":case "PreInc":return (e.op==="++"?"Adds 1 to ":"Subtracts 1 from ")+tx(e.e);
      case "Call":{const o=e.o?tx(e.o):"";
        if(/^System\.(out|err)$/.test(o))return e.n==="println"?"Prints "+(e.args.length?tx(e.args[0]):"an empty line")+" to the console and moves to a new line":e.n==="print"?"Prints "+tx(e.args[0])+" to the console (no new line)":"Prints formatted text to the console";
        if(!o||o==="this")return "Calls the method "+e.n+"(): this method pauses, a new frame is pushed for "+e.n+", and it runs until it returns";
        return "Calls "+e.n+"() on "+o;}
      case "New":return "Creates "+art(tn(e.t))+" object on the heap (its constructor runs)";
      default:return "Evaluates "+tx(e);}}
  /* what a statement does, in beginner English */
  function what(s){
    if(!s)return "";
    switch(s.k){
      case "Local":{const ds=s.decls,names=ds.map(d=>d.n).join(", "),one=ds.length===1,d=ds[0],t=tn(s.t);
        if(one&&d.init&&(d.init.k==="NewArr"||d.init.k==="ArrInit"))return "Creates "+art(t)+" array on the heap and makes the variable "+d.n+" point to it";
        if(one&&d.init&&d.init.k==="New")return "Creates "+art(tn(d.init.t))+" object on the heap and makes the variable "+d.n+" point to it";
        if(one&&d.init&&d.init.k==="Lit"&&d.init.t==="String")return "Declares the String variable "+d.n+" and points it to the literal "+tx(d.init)+" (Strings live in the String pool)";
        return "Declares "+(one?"the variable ":"the variables ")+names+" (type "+t+")"+(ds.some(x=>x.init)?" and stores "+(one?"its":"their")+" starting value"+(one?" "+tx(d.init):"s"):"");}
      case "ExprS":return exprWhat(s.e);
      case "If":return "Checks the condition "+tx(s.c)+". If it is true the if-body runs"+(s.el?"; if it is false the else part runs":"; if it is false the body is skipped");
      case "While":return "Loop check: before every pass the condition "+tx(s.c)+" is tested. True → the body runs again; false → the loop ends";
      case "Do":return "do-while loop: the body always runs at least once; the condition "+tx(s.c)+" is checked after each pass";
      case "For":return "for loop: the first visit runs the start part once; every later visit runs the update and then tests "+(s.c?tx(s.c):"the condition")+". True → the body runs; false → the loop ends";
      case "ForEach":return "for-each loop: each pass takes the next element of "+tx(s.it)+" into "+s.n+"; when no elements are left, the loop ends";
      case "Return":return s.e?"Returns the value of "+tx(s.e)+" to the caller; this method's frame is removed from the stack":"Returns to the caller; this method's frame is removed from the stack";
      case "Break":return "break: leaves the nearest loop or switch right away";
      case "Continue":return "continue: skips the rest of this pass and goes to the next pass of the loop";
      case "Throw":return "Throws an exception: Java stops this code and looks for a matching catch, method by method up the stack";
      case "Try":return "try: runs the block; if an exception is thrown inside it, the matching catch runs"+(s.fin?", and the finally block always runs":"");
      case "Switch":return "switch: compares "+tx(s.e||s.s)+" with each case and jumps to the matching one";
      case "Yield":return "yield: gives the value of this switch case";
      case "Sync":return "synchronized block: runs the body while holding a lock";
      case "Assert":return "assert: skipped, because Java runs without -ea (assertions off)";
      case "CtorCall":return "Calls another constructor first (this(…) or super(…))";
      case "Labeled":return "A labeled statement (break/continue can name it)";}
    return "";}
  /* (Phase 4) a tree as one SVG. T = {nodes:[{k, t, s, c, tags, hot, kids:[index or -1], el:[edge labels]}], root, bin}.
     Binary: x follows the in-order position (a lone right child sits right of its parent), each node as wide as its label.
     N-ary: leaves side by side, a parent centred over its children; edge labels (trie letters) sit on the edges.
     Nodes are <g data-tk> moved by a CSS transform, so playground.js can glide them from their old place (rotations, sift-up). */
  function treeHtml(T){
    const N=T.nodes,roots=(T.roots||[T.root]).filter(r=>r>=0);if(!N.length||!roots.length)return '<div class="pg-novars">empty</div>';
    const w=n=>Math.max(n.t===""?18:28,String(n.t).length*7.2+16,n.s?String(n.s).length*6+12:0),GAP=10,DY=62,TOP=20;
    const X=new Array(N.length),D=new Array(N.length),par=new Array(N.length).fill(-1),seen=new Set();let cur=0,dm=0;
    const walk=(i,d)=>{if(i<0||seen.has(i))return;seen.add(i);D[i]=d;dm=Math.max(dm,d);const k=N[i].kids,wi=w(N[i]);
      for(const c of k)if(c>=0&&!seen.has(c))par[c]=i;
      if(T.bin){walk(k[0]??-1,d+1);X[i]=cur+wi/2;cur+=wi+GAP;walk(k[1]??-1,d+1);return;}
      const ks=k.filter(c=>c>=0);if(!ks.length){X[i]=cur+wi/2;cur+=wi+GAP;return;}
      for(const c of ks)walk(c,d+1);X[i]=Math.max((X[ks[0]]+X[ks[ks.length-1]])/2,cur-GAP-wi/2);cur=Math.max(cur,X[i]+wi/2+GAP);};
    for(const r of roots){walk(r,0);cur+=T.roots?GAP:0;}
    const on=new Set();for(let i=0;i<N.length;i++)if(seen.has(i)&&(N[i].pin||N[i].tags&&N[i].tags.length))for(let j=i;par[j]>=0;j=par[j])on.add(j); // edges on the path root → a named node
    const hh=n=>n.s?36:24,Wd=Math.max(40,cur-GAP+8),Ht=TOP+dm*DY+44;
    let ed="",lab="",nd="";
    for(const i of seen){const n=N[i],y=TOP+D[i]*DY;
      n.kids.forEach((c,j)=>{if(c<0||par[c]!==i)return;const x1=X[i]+4,y1=y+hh(n),x2=X[c]+4,y2=TOP+D[c]*DY,my=(y1+y2)/2;
        ed+='<path class="'+(on.has(c)?"on":"")+'" d="M'+x1+" "+y1+" C"+x1+" "+my+","+x2+" "+my+","+x2+" "+y2+'"/>';
        const e=n.el&&n.el[j];if(e)lab+='<text class="pg-tel" x="'+((x1+x2)/2)+'" y="'+(my+4)+'">'+esc(e)+"</text>";});
      const wi=w(n),pi=par[i],side=pi==null||pi<0?0:X[pi]<X[i]?1:-1, // the tag sits on the side away from the parent, so it never covers the edge coming in
        tg=n.tags&&n.tags.length?'<text class="pg-tnt" y="-6"'+(side?' x="'+(side*(wi/2+2))+'" text-anchor="'+(side>0?"start":"end")+'"':"")+">"+esc(n.tags.join(" · "))+"</text>":"";
      nd+='<g class="pg-tn'+(n.c?" "+n.c:"")+(n.hot?" hot":"")+(on.has(i)||n.pin||n.tags&&n.tags.length?" at":"")+'" data-tk="'+esc(n.k)+'" style="transform:translate('+(X[i]+4)+"px,"+y+'px)">'+
        '<rect x="'+(-wi/2)+'" width="'+wi+'" height="'+hh(n)+'" rx="'+(n.t===""?9:8)+'"/><text class="pg-tnv" y="16">'+esc(n.t)+"</text>"+(n.s?'<text class="pg-tns" y="30">'+esc(n.s)+"</text>":"")+tg+(n.cmp?'<text class="pg-tcmp'+(/true$/.test(n.cmp)?" t":" f")+'" x="'+(wi/2+7)+'" y="16">'+esc(n.cmp)+"</text>":"")+"</g>";}
    return '<svg class="pg-tree" width="'+Wd+'" height="'+Ht+'" viewBox="0 0 '+Wd+" "+Ht+'"><g class="pg-te">'+ed+"</g>"+lab+nd+"</svg>";}
  /* (Phase 5) a graph as one SVG: nodes on a circle (node 0 at the top, clockwise), so they never move while the program runs.
     G = {nodes:[{t, c, s, tags, hot}], edges:[{a, b, w, on}], dir}; an undirected edge is one line, a directed one has an arrowhead,
     two directed edges between the same pair bend apart; weights sit at the middle of their edge */
  function graphHtml(G){
    const N=G.nodes,n=N.length;if(!n)return '<div class="pg-novars">no nodes</div>';
    const w=t=>Math.max(30,String(t).length*7.4+14),HH=24,RR=n<2?0:Math.max(58,n*56/(2*Math.PI)),M=44,cx=RR+M+20,cy=RR+M,Wd=2*cx,Ht=2*cy+12;
    const P=N.map((x,i)=>{const a=-Math.PI/2+2*Math.PI*i/n;return [cx+RR*Math.cos(a),cy+RR*Math.sin(a)];});
    const pair=new Set(G.edges.map(e=>e.a+">"+e.b));
    const cut=(i,dx,dy)=>{const hw=w(N[i].t)/2+3,hh=HH/2+3,t=Math.min(dx?hw/Math.abs(dx):1e9,dy?hh/Math.abs(dy):1e9);return t;};
    let ed="",wl="";
    for(const e of G.edges){if(e.a===e.b||!P[e.a]||!P[e.b])continue;const [x1,y1]=P[e.a],[x2,y2]=P[e.b],dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1;
      const ta=cut(e.a,dx,dy),tb=cut(e.b,dx,dy),bend=G.dir&&pair.has(e.b+">"+e.a)?18:0,nx=-dy/L,ny=dx/L;
      const ax=x1+dx*ta+nx*bend*.5,ay=y1+dy*ta+ny*bend*.5,bx=x2-dx*tb+nx*bend*.5,by=y2-dy*tb+ny*bend*.5,mx=(x1+x2)/2+nx*bend,my=(y1+y2)/2+ny*bend;
      ed+='<path class="'+(e.on?"on":"")+'" d="M'+ax.toFixed(1)+" "+ay.toFixed(1)+(bend?" Q"+mx.toFixed(1)+" "+my.toFixed(1)+" ":" L")+bx.toFixed(1)+" "+by.toFixed(1)+'"'+(G.dir?' marker-end="url(#pgGa'+(e.on?"h":"")+')"':"")+"/>";
      if(e.w!==undefined)wl+='<text class="pg-gw'+(e.on?" on":"")+'" x="'+(mx+nx*(bend?6:9)).toFixed(1)+'" y="'+(my+ny*(bend?6:9)+4).toFixed(1)+'">'+esc(e.w)+"</text>";}
    let nd="";
    N.forEach((x,i)=>{const [px,py]=P[i],wi=w(x.t),out=n>1?[(px-cx)/RR,(py-cy)/RR]:[0,-1],tg=x.tags&&x.tags.length?x.tags.join(" · "):"";
      nd+='<g class="pg-tn pg-gn'+(x.c?" "+x.c:"")+(x.hot?" hot":"")+(tg?" at":"")+'" transform="translate('+px.toFixed(1)+","+(py-HH/2).toFixed(1)+')">'+
        '<rect x="'+(-wi/2)+'" width="'+wi+'" height="'+HH+'" rx="12"/><text class="pg-tnv" y="16">'+esc(x.t)+"</text>"+
        (x.s!==undefined&&x.s!==""?'<text class="pg-gs" x="'+(out[0]*(wi/2+12)).toFixed(1)+'" y="'+(HH/2+4+out[1]*(HH/2+10)).toFixed(1)+'">'+esc(x.s)+"</text>":"")+
        (tg?'<text class="pg-tnt" y="-6">'+esc(tg)+"</text>":"")+"</g>";});
    const mk=c=>'<marker id="pgGa'+c+'" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="pg-gah'+(c?" on":"")+'"/></marker>';
    return '<svg class="pg-graph" width="'+Wd.toFixed(0)+'" height="'+Ht.toFixed(0)+'" viewBox="0 0 '+Wd.toFixed(0)+" "+Ht.toFixed(0)+'"><defs>'+mk("")+mk("h")+'</defs><g class="pg-ge">'+ed+"</g>"+wl+nd+"</svg>";}
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  /* ---------- (Phase 6) complexity from the code's shape: loops, library calls, recursion. An estimate, never a proof ----------
     A cost is a sum of terms; a term = {p:{sym:power}, g:{sym:log power}, x:"2ⁿ"|"n!"|""}. Sizes get letters per method (n, m, k…,
     V/E for graphs); syms maps each letter to the source it stands for (n = nums.length). */
  const TM=(p,g,x)=>({p:p||{},g:g||{},x:x||""}),ONE=()=>[TM()];
  const tmul=(a,b)=>{const p={...a.p},g={...a.g};for(const s in b.p)p[s]=(p[s]||0)+b.p[s];for(const s in b.g)g[s]=(g[s]||0)+b.g[s];return TM(p,g,[a.x,b.x].filter(Boolean).join("·"));};
  const tle=(a,b)=>{if(a.x&&a.x!==b.x)return false;if(b.x&&!a.x)return true;const ks=new Set([...Object.keys(a.p),...Object.keys(a.g),...Object.keys(b.p),...Object.keys(b.g)]);
    for(const s of ks){const ap=a.p[s]||0,bp=b.p[s]||0;if(ap>bp||ap===bp&&(a.g[s]||0)>(b.g[s]||0))return false;}return true;};
  function simp(S){const out=[];S.forEach((a,i)=>{if(!S.some((b,j)=>j!==i&&tle(a,b)&&(!tle(b,a)||j<i)))out.push(a);});return out.length?out:ONE();}
  const sadd=(...ss)=>simp([].concat(...ss)),smul=(A,B)=>simp([].concat(...A.map(a=>B.map(b=>tmul(a,b)))));
  const SUP={2:"²",3:"³",4:"⁴",5:"⁵"};
  function ftm(t,noLog){const ps=Object.keys(t.p).filter(s=>t.p[s]).map(s=>t.p[s]===.5?"√"+s:s+(t.p[s]===1?"":SUP[t.p[s]]||"^"+t.p[s])).join("·");
    const gs=noLog?"":Object.keys(t.g).filter(s=>t.g[s]).map(s=>"log"+(t.g[s]>1?SUP[t.g[s]]||"":"")+" "+s).join(" ");
    return [t.x.replace(/\^n\b/g,"ⁿ"),ps,gs].filter(Boolean).join(t.x&&!ps&&!gs?"":" ").replace(/ (?=log)/g," ").replace(/^(.+ⁿ|.+!) (?=[^l])/,"$1·")||"1";}
  function fmt(S){S=simp(S);if(S.length>1&&S.every(t=>!t.x&&JSON.stringify(t.g)===JSON.stringify(S[0].g)&&Object.values(t.g).some(Boolean)))
      return "O(("+S.map(t=>ftm(t,true)).join(" + ")+") "+ftm(TM({},S[0].g))+")";
    return "O("+S.map(t=>ftm(t)).join(" + ")+")";}
  const isConst=S=>S.every(t=>!t.x&&!Object.values(t.p).some(Boolean)&&!Object.values(t.g).some(Boolean));
  const CGRN=/adj|graph|^g$|nei|nbr|edge|conn|road|flight|prereq|course|depend/i,EDGN=/edge|pair|road|flight|link|conn|prereq/i,MEMO=/memo|cache|^dp$|^f$|computed|seen/i;
  const LOGT=/PriorityQueue|TreeMap|TreeSet/,LOGM=/^(add|offer|poll|remove|put|get|containsKey|contains|floor\w*|ceiling\w*|higher\w*|lower\w*|first\w*|last\w*|pollFirst\w*|pollLast\w*|merge)$/;
  const LINS=/^(substring|toCharArray|indexOf|lastIndexOf|contains|replace|replaceAll|split|toUpperCase|toLowerCase|repeat|strip|trim|chars|reverse|toString|insert|deleteCharAt|join)$/;
  const ADDM=/^(add|addAll|put|offer|push|addFirst|addLast|offerFirst|offerLast|append|set)$/;
  function cplx(src){
    let ast;try{ast=JVML.parse(src);}catch(e){return null;}
    const meths=[],byName=new Map(),fieldT=new Map();
    const collect=C=>{if(!C||C.k!=="Class")return;for(const f of C.fields||[])for(const d of f.decls||[f])if(d&&d.n)fieldT.set(d.n,(f.t||d.t||{}).n);
      for(const m of (C.methods||[]))if(m.body){meths.push(m);if(!byName.has(m.name))byName.set(m.name,m);m.cn=C.name;}for(const n of C.nested||[])collect(n);};
    for(const C of ast.types)collect(C);
    const done=new Map(),busy=new Set();
    const kids=x=>{const out=[];for(const k in x){if(k==="cls"||k==="outer"||k==="C"||k==="line"||k==="end")continue;const v=x[k];if(!v||typeof v!=="object")continue;if(k==="t"&&!v.k)continue;out.push(v);}return out;};
    const has=(x,ok,sn)=>{sn=sn||new Set();if(!x||typeof x!=="object"||sn.has(x))return false;sn.add(x);if(Array.isArray(x))return x.some(y=>has(y,ok,sn));if(x.k==="Class")return false;if(ok(x))return true;return kids(x).some(y=>has(y,ok,sn));};
    const names=x=>{const s=new Set();has(x,y=>{if(y.k==="Name")s.add(y.n);return false;});return s;};
    // two passes: the second hands out the letters in order of importance (the size in the leading term gets n)
    function method(m){if(done.has(m))return done.get(m);busy.add(m);let out=analyze(m,[]),mg=null;
      if(out.rec&&out.rec.pass.length&&out.rec.nk){mg=new Map(out.rec.pass.map(p=>[p,out.rec.nk]));out=analyze(m,[],mg);}
      const ord=[...new Set((out.ts+" "+out.ss).match(/[A-Za-z]\w*/g)||[])].filter(s=>out.keys.has(s)&&s!=="O"&&s!=="log");
      const seed=[...ord,...out.keys.keys()].filter((s,i,a)=>a.indexOf(s)===i).map(s=>[out.keys.get(s),out.syms.get(s)]);
      if(seed.some(([k],i)=>[...out.keys.values()][i]!==k))out=analyze(m,seed,mg);busy.delete(m);done.set(m,out);return out;}
    function analyze(m,seed,merge){
      const ty=new Map(fieldT),alias=new Map(),declD=new Map(),params=new Set(m.params.map(p=>p.n)),syms=new Map(),key2s=new Map(),rows=[],space=[];
      for(const p of m.params)ty.set(p.n,(p.t||{}).n+"[]".repeat((p.t||{}).d||0));
      has(m.body,y=>{if(y.k==="Local")for(const d of y.decls){ty.set(d.n,(y.t||d.t||{}).n+"[]".repeat(((y.t||d.t||{}).d||0)));if(d.init&&!alias.has(d.n))alias.set(d.n,d.init);}return false;});
      const LET=["n","m","k","p","q"];
      const INTT=/^(int|long|short)$/,keys=new Map();
      const weak=new Set();
      const sym=(key,txt)=>{if(merge&&merge.has(key)){key=merge.get(key);if(!key2s.has(key)){const s=sym(key,key);weak.add(s);return s;}}
        if(key2s.has(key)){const s=key2s.get(key);if(txt&&weak.has(s)){syms.set(s,txt);weak.delete(s);}return s;}const lt=/^[a-z]$/.test(key)&&INTT.test(ty.get(key)||"");
        let s=key==="V"||key==="E"||key==="h"?key:lt&&!syms.has(key)?key:LET.find(l=>!syms.has(l)&&!params.has(l)||l===key&&lt)||"n"+syms.size;
        if(!syms.has(s)){syms.set(s,txt||key);keys.set(s,key);}key2s.set(key,s);return s;};
      // lo/hi-style int parameters are one size: the range between them
      const RNG=[["lo","hi"],["low","high"],["left","right"],["l","r"],["start","end"],["from","to"]].find(([a,b])=>m.params.some(p=>p.n===a&&INTT.test((p.t||{}).n))&&m.params.some(p=>p.n===b&&INTT.test((p.t||{}).n)));
      for(const [k,t] of seed)sym(k,t);
      const loopV=new Map(),seenK=new Set(),coll=n=>/List|Map|\[\]/.test(ty.get(n)||"");
      // graphs: V = nodes, E = edges (an edge list, or the neighbour lists over the whole run); an int n/nodes beside a graph is V
      const graph=[...ty.keys()].some(n=>CGRN.test(n)&&!EDGN.test(n)&&coll(n)),NV=/^(n|N|V|v|nodes|vertices|numNodes|numCourses)$/;
      const gsym=n=>EDGN.test(n)?sym("E","E = "+n+" (edges)"):sym("V","V = nodes ("+n+")");
      function keyOf(e){if(!e)return null;
        switch(e.k){case "Lit":return null;case "Paren":return keyOf(e.e);case "NewArr":return e.init?null:keyOf((e.dims||[])[0]);
          case "Name":{if(loopV.has(e.n))return loopV.get(e.n);if(seenK.has(e.n))return null;
            if(RNG&&RNG.includes(e.n))return sym("range:"+RNG.join(","),"n = "+RNG[1]+" − "+RNG[0]+" + 1");
            if(graph&&NV.test(e.n)&&INTT.test(ty.get(e.n)||""))return sym("V","V = nodes ("+e.n+")");
            if(alias.has(e.n)&&(INTT.test(ty.get(e.n)||"")||alias.get(e.n).k==="NewArr")){seenK.add(e.n);const a=alias.get(e.n),k=keyOf(a.k==="NewArr"?(a.dims||[])[0]:a);seenK.delete(e.n);if(k||a.k==="NewArr")return k;}
            return CGRN.test(e.n)&&coll(e.n)?gsym(e.n):sym(e.n,e.n+(INTT.test(ty.get(e.n)||"")?"":/String|List|Set|Map|Deque|Queue|Stack|Builder/.test(ty.get(e.n)||"")?" (its size)":".length"));}
          case "Field":if(e.n==="length"){if(e.o.k==="Index")return sym(tx(e.o),tx(e.o)+".length");if(e.o.k==="Name"&&alias.has(e.o.n)&&alias.get(e.o.n).k==="NewArr")return keyOf(e.o);return e.o.k==="Name"&&CGRN.test(e.o.n)?gsym(e.o.n):e.o.k==="Name"?sym(e.o.n,e.o.n+".length"):keyOf(e.o);}
            return e.o.k==="This"?sym(e.n,e.n):null;
          case "Call":if(/^(length|size)$/.test(e.n)&&e.o)return e.o.k==="Name"&&CGRN.test(e.o.n)?gsym(e.o.n):e.o.k==="Name"?sym(e.o.n,e.o.n+"."+e.n+"()"):keyOf(e.o);
            if(e.o&&e.o.k==="Name"&&e.o.n==="Math")return keyOf(e.args[0])||keyOf(e.args[1]);if(/^(toCharArray|keySet|values|entrySet|chars|toString|split|trim|strip|toLowerCase|toUpperCase)$/.test(e.n))return keyOf(e.o);return null;
          case "Bin":return keyOf(e.l)||keyOf(e.r);case "Un":return keyOf(e.e);case "Cast":return keyOf(e.e);}
        return null;}
      const lin=s=>[TM({[s]:1})],lg=s=>[TM({},{[s]:1})];
      const isMut=(b,v,re)=>has(b,y=>y.k==="Assign"&&y.t.k==="Name"&&y.t.n===v&&re.test(y.op+(y.v?" "+tx(y.v):""))||(y.k==="PostInc"||y.k==="PreInc")&&y.e.k==="Name"&&y.e.n===v&&re.test(y.op));
      const HALF=/^(\/=|>>=|>>>=|\*=|<<=) |^= .*(\/ ?\d|>> ?\d|>>> ?\d|\* ?2\b|<< ?1)|^&= /;
      // one loop: how many times it runs (a sum) and the words for it; am = amortised (its total over the enclosing loop, not per pass)
      function loopF(st,ctx){
        const cmpOf=(c,v)=>{if(!c)return null;if(c.k==="Paren")return cmpOf(c.e,v);if(c.k==="Bin"&&(c.op==="&&"||c.op==="||"))return cmpOf(c.l,v)||cmpOf(c.r,v);
          if(c.k==="Bin"&&/^(<|<=|>|>=|!=)$/.test(c.op)){const L=c.l,Rr=c.r;if(!v)return c;const nv=x=>x&&(x.k==="Name"&&x.n===v||x.k==="Bin"&&x.op==="*"&&x.l.k==="Name"&&x.l.n===v);
            if(nv(L))return {v:L,x:Rr,sq:L.k==="Bin"};if(nv(Rr))return {v:Rr,x:L,sq:Rr.k==="Bin"};}return null;};
        const outer=ctx.loops.length>0;
        if(st.k==="For"){const i0=st.init&&st.init[0];let v=null,iv=null;
          if(i0&&i0.k==="Local"){v=i0.decls[0].n;iv=i0.decls[0].init;}else if(i0&&i0.k==="ExprS"&&i0.e.k==="Assign"&&i0.e.t.k==="Name"){v=i0.e.t.n;iv=i0.e.v;}
          const u=st.upd&&st.upd[0]&&(st.upd[0].k==="ExprS"?st.upd[0].e:st.upd[0]);
          if(!v&&u){const t=u.k==="Assign"?u.t:u.e;if(t&&t.k==="Name")v=t.n;} // for (; i < n; i += …): the counter is the updated variable
          const cc=cmpOf(st.c,v);
          if(v&&cc&&cc.x.k==="Lit"&&cc.x.v===null&&u&&u.k==="Assign"&&u.v.k==="Field"){const key=/left|right|child/i.test(u.v.n)?sym("h","h = tree height"):sym("list","n = list length");
            return {S:lin(key),w:"walks the chain via ."+u.v.n+": "+key+" times",v,key};}
          if(!v||!cc||!u)return {S:lin(ctx.keys[ctx.keys.length-1]||sym("n")),w:"depends on the data",v};
          if(u.k==="Assign"&&/^[+-]=$/.test(u.op)&&/& ?-|& ?\(-/.test(tx(u.v,-9))){const key=keyOf(cc.x)||keyOf(iv)||sym("n");return {S:lg(key),w:v+" jumps by its lowest 1-bit ("+tx(u.v)+"): at most log "+key+" times",v,key};}
          const mult=u.k==="Assign"&&(/^(\*=|\/=|<<=|>>=|>>>=)$/.test(u.op)||u.op==="="&&u.v&&/[*/]|<<|>>/.test(u.v.op||"")),key=keyOf(cc.x)||keyOf(iv);
          const tri=[...names(cc.x),...names(iv)].some(n=>ctx.loopVars.has(n));
          if(!key){const a=iv&&iv.k==="Lit"?iv.v:null,b=cc.x.k==="Lit"?cc.x.v:null;return {S:ONE(),w:a!=null&&b!=null&&!mult?"a fixed "+Math.abs(b-a+(/=/.test(st.c.op)?1:0))+" times":"a fixed number of times",v};}
          if(cc.sq)return {S:[TM({[key]:.5})],w:v+" * "+v+" stops at "+key+": √"+key+" times",v,key};
          if(mult)return {S:lg(key),w:v+" "+(/\*|<</.test(u.op+(u.v?u.v.op:""))?"doubles":"halves")+" each time: log "+key+" times",v,key};
          return {S:lin(key),w:tri?"up to "+key+" times (it starts or stops at the outer loop's variable: about half on average, same order)":key+" times",v,key};}
        if(st.k==="ForEach"){const it=st.it;
          if(it.k==="NewArr"||it.k==="ArrInit"||it.k==="Call"&&/^(of|asList)$/.test(it.n)&&it.args.every(a=>a.k==="Lit"))return {S:ONE(),w:"a fixed list",v:st.n};
          const root=it.k==="Call"&&it.o?it.o:it.k==="Index"?it.a:it,rn=root&&root.k==="Name"?root.n:"";
          if((it.k==="Call"&&/^(get|getOrDefault)$/.test(it.n)||it.k==="Index")&&CGRN.test(rn)){sym("V","V = nodes of "+rn);
            return {S:lin(sym("E","E = edges in "+rn)),w:"the neighbours of one node; over the whole run each edge once: E in total",v:st.n,am:outer,key:"E"};}
          const key=keyOf(it)||(names(it).size?sym(tx(it),tx(it)):null);if(!key)return {S:ONE(),w:"a fixed list",v:st.n};
          return {S:lin(key),w:"every item of "+tx(it)+": "+key+" times",v:st.n,key};}
        // while / do-while
        const c=st.c,b=st.body,ns=[...names(c)];
        const drain=has(c,y=>y.k==="Call"&&(y.n==="isEmpty"||y.n==="size")&&y.o&&y.o.k==="Name");
        const outside=v=>ctx.loops.length&&(declD.get(v)??-1)<ctx.loops.length;
        if(drain){const q=[];has(c,y=>{if(y.k==="Call"&&(y.n==="isEmpty"||y.n==="size")&&y.o&&y.o.k==="Name")q.push(y.o.n);return false;});
          const popped=has(b,y=>y.k==="Call"&&/^(pop|poll\w*|remove\w*)$/.test(y.n)&&y.o&&y.o.k==="Name"&&q.includes(y.o.n));
          const g=has(b,y=>y.k==="ForEach"&&has(y.it,z=>z.k==="Name"&&CGRN.test(z.n)));
          const key=g?sym("V","V = nodes"):outer&&popped&&ctx.keys[ctx.keys.length-1]||sym(q[0],q[0]+" (items that go through it)");
          return {S:lin(key),w:"once per item taken from "+q[0]+(g?": each node once":"")+(outer&&popped?"; each item is pushed once, so all passes together pop at most "+key:""),v:q[0],am:outer&&popped,key};}
        if(c&&c.k==="Bin"&&c.op==="!="&&(c.r.k==="Lit"&&c.r.v===null)&&c.l.k==="Name"){const v=c.l.n;let f="";has(b,y=>{if(y.k==="Assign"&&y.t.k==="Name"&&y.t.n===v&&y.v.k==="Field")f=y.v.n;return false;});
          if(/left|right|child/i.test(f))return {S:lin("h"),w:"one step down the tree per pass: the height h (log n when balanced, n when not)",v,key:sym("h","h = tree height")};
          const key=sym("list","n = list length");return {S:lin(key),w:"walks the chain via ."+(f||"next")+": "+key+" times",v,am:outer&&outside(v),key};}
        const cc=cmpOf(c,null);
        if(cc&&cc.l.k==="Name"&&cc.r.k==="Name"&&isMut(b,cc.l.n,/./)&&isMut(b,cc.r.n,/./)){const lo=cc.l.n,hi=cc.r.n,key=keyOf(cc.r)||keyOf(cc.l)||sym("n");
          const bs=has(b,y=>(y.k==="Local"&&y.decls.some(d=>d.init&&/\/ ?2\b|>>>? ?1/.test(tx(d.init,-9)))||y.k==="Assign"&&/\/ ?2\b|>>>? ?1/.test(tx(y.v,-9))));
          return bs?{S:lg(key),w:"binary search: "+lo+".."+hi+" halves each pass: log "+key+" times",v:lo,key}:{S:lin(key),w:"two pointers "+lo+" and "+hi+" move toward each other: "+key+" passes at most",v:lo,am:outer&&outside(lo),key};}
        for(const v of ns)if(isMut(b,v,/^[+-]= .*& ?\(?-/)){const key=keyOf(cc&&(cc.l.k==="Name"&&cc.l.n===v?cc.r:cc.l))||sym("n");return {S:lg(key),w:v+" jumps by its lowest 1-bit: at most log "+key+" times",v,key};}
        for(const v of ns){if(isMut(b,v,HALF)){const key=keyOf({k:"Name",n:v})||sym("n");return {S:lg(key),w:v+" shrinks by a factor each pass: log "+key+" times (one per digit or bit)",v,key};}}
        for(const v of ns){if(isMut(b,v,/^(\+\+|--|\+=|-=)/)){const other=cc&&(cc.l.k==="Name"&&cc.l.n===v?cc.r:cc.l),key=keyOf(other)||keyOf({k:"Name",n:v})||sym("n");
          return {S:lin(key),w:v+" moves one step per pass: "+key+" times"+(outer&&outside(v)?"; "+v+" never goes back, so all passes together move it "+key+" times":""),v,am:outer&&outside(v),key};}}
        // a sliding window: a pointer of the outer loop that only moves forward (declared outside it)
        const fw=[...names(b)].find(v=>isMut(b,v,/^(\+\+|\+=)/)&&outside(v));
        if(fw){const key=ctx.keys[ctx.keys.length-1]||sym("n");return {S:lin(key),w:fw+" only moves forward and never resets, so all passes together move it "+key+" times",v:fw,am:true,key};}
        return {S:lin(ctx.keys[ctx.keys.length-1]||sym("n")),w:"depends on the data (no counter found)",v:null};}
      // a library call or user method call: its own cost (null when constant)
      function callCost(y,ctx){
        if(y.k==="Call"){const on=y.o&&y.o.k==="Name"?y.o.n:"",t=ty.get(on)||"",a0=y.args[0];
          if(y.n==="sort"&&(on==="Arrays"||on==="Collections"||/List/.test(t))){const key=keyOf(on==="Arrays"||on==="Collections"?a0:y.o);if(!key)return null;return {S:[TM({[key]:1},{[key]:1})],w:"sorting: "+key+" log "+key};}
          if(LOGT.test(t)&&LOGM.test(y.n)){const key=graph?sym("V","V = nodes"):(ctx.drainKey||keyOf({k:"Name",n:on})||sym("n"));return {S:lg(key),w:t.replace(/<.*/,"")+"."+y.n+": log "+key+" (a heap/tree step)"};}
          if(/^(Arrays|Collections|System)$/.test(on)&&/^(fill|copyOf|copyOfRange|equals|toString|reverse|max|min|frequency|arraycopy|asList|sum|stream)$/.test(y.n)){const key=keyOf(a0);if(!key)return null;return {S:lin(key),w:on+"."+y.n+": goes over all "+key};}
          if(/List/.test(t)&&(/^(contains|indexOf|lastIndexOf|removeIf)$/.test(y.n)||y.n==="add"&&y.args.length===2||y.n==="remove"&&a0&&a0.k==="Lit"&&a0.v===0&&!/Linked/.test(t))){const key=keyOf({k:"Name",n:on});return {S:lin(key),w:on+"."+y.n+": scans or shifts the list, "+key+" each time"};}
          if(/^(String|StringBuilder)$/.test(t)&&LINS.test(y.n)){const key=keyOf({k:"Name",n:on});return {S:lin(key),w:on+"."+y.n+"(): copies or scans the text, "+key+" each time"};}
          if((!y.o||y.o.k==="This"||on&&byName.has(y.n)&&on===m.cn)&&byName.has(y.n)){const mm=byName.get(y.n);if(mm===m||busy.has(mm))return null;const r=method(mm);
            if(isConst(r.time))return null;
            // the callee's sizes in the caller's words: a parameter's size is the size of the argument passed (a literal = constant)
            const pix=n=>mm.params.findIndex(p=>p.n===n),mp=new Map();
            for(const [s,k] of r.keys){let to;if(pix(k)>=0)to=keyOf(y.args[pix(k)]);else if(k.startsWith("range:")){const i=pix(k.slice(6).split(",")[1]);to=i>=0?keyOf(y.args[i]):null;}else to=sym(k,r.syms.get(s));mp.set(s,to||null);}
            const S=simp(r.time.map(t=>{const p={},g={};for(const s in t.p)if(mp.get(s))p[mp.get(s)]=(p[mp.get(s)]||0)+t.p[s];for(const s in t.g)if(mp.get(s))g[mp.get(s)]=(g[mp.get(s)]||0)+t.g[s];
              const x=t.x.split("·").map(z=>z.replace(/\^(\w+)$|^(\w+)!$/,(a,e,f)=>{const to=mp.get(e||f);return to?e?"^"+to:to+"!":"#";})).filter(z=>z&&!z.includes("#")).join("·");return TM(p,g,x);}));
            return isConst(S)?null:{S,w:"calls "+y.n+"(): "+fmt(r.time)+" in its own sizes ("+[...r.syms].map(([a,b])=>a+(b.startsWith(a+" =")?b.slice(a.length):" = "+b)).join(", ")+")"};}}
        if(y.k==="New"&&y.args.length===1&&/List|Set|Deque|Queue|Map|String/.test(y.t.n)){const key=keyOf(y.args[0]);if(key)return {S:lin(key),w:"new "+y.t.n+"(…) copies "+key+" items"};}
        if(y.k==="Assign"&&y.op==="+="&&y.t.k==="Name"&&ty.get(y.t.n)==="String"&&ctx.loops.length){const key=sym("n");return {S:lin(key),w:y.t.n+" += … builds a new String each time (use a StringBuilder)"};}
        return null;}
      // the cost of a statement or expression
      function cost(x,ctx){
        if(!x||typeof x!=="object")return [];if(Array.isArray(x))return sadd(...x.map(y=>cost(y,ctx)),[]);
        if(x.k==="Lambda"||x.k==="Class")return [];
        if(x.k==="Local")for(const d of x.decls)declD.set(d.n,ctx.loops.length);
        if(x.k==="Local")for(const d of x.decls)if(d.init&&d.init.k==="NewArr"&&d.init.dims&&d.init.dims.length){let S=ONE();for(const dm of d.init.dims){const key=keyOf(dm);if(key)S=smul(S,lin(key));}if(!isConst(S))space.push({S,w:d.n+" = "+tx(d.init),l:x.line});}
        if(/^(For|ForEach|While|Do)$/.test(x.k)){
          if(x.k==="For")for(const i of x.init||[])if(i.k==="Local")for(const d of i.decls)declD.set(d.n,ctx.loops.length+1);
          const f=loopF(x,ctx),row={l:x.line,d:ctx.loops.length,k:"loop",s:isConst(f.S)?"1":ftm(f.S[0]),w:f.w,am:!!f.am,key:f.key,src:(x.k==="ForEach"?"for (… : "+tx(x.it)+")":x.k==="For"?"for (…; "+tx(x.c)+"; …)":(x.k==="Do"?"do … while (":"while (")+tx(x.c)+")")};rows.push(row);
          const once=x.k==="ForEach"?cost(x.it,ctx):x.k==="For"?cost(x.init,ctx):[]; // evaluated once, not per pass
          if(f.v)ctx.loopVars.add(f.v);const sv=ctx.am;ctx.am=[];ctx.loops.push(f.S);ctx.ams.push(!!f.am);ctx.keys.push(f.key||null);const dk=ctx.drainKey;if(f.key&&/once per item/.test(f.w))ctx.drainKey=f.key;
          const body=sadd(cost(x.body,ctx),x.k==="For"?cost(x.upd,ctx):[],x.k==="ForEach"?[]:cost(x.c,ctx));
          ctx.loops.pop();ctx.ams.pop();ctx.keys.pop();ctx.drainKey=dk;const am=ctx.am;ctx.am=sv;if(f.v)ctx.loopVars.delete(f.v);
          const tot=sadd(smul(f.S,body),once,...am);row.tot=fmt(tot);
          if(f.am){ctx.am.push(tot);return [];}return tot;}
        let own=[];const cc=(x.k==="Call"||x.k==="New"||x.k==="Assign")?callCost(x,ctx):null;
        if(cc){own=cc.S;rows.push({l:x.line,d:ctx.loops.length,k:"call",s:ftm(cc.S[0]),w:cc.w,src:tx(x)});}
        if(x.k==="Call"&&x.o&&x.o.k==="Name"&&ADDM.test(x.n)&&ctx.loops.length){let S=ONE();const a0=ctx.ams.lastIndexOf(true);for(const L of ctx.loops.slice(Math.max(0,a0)))S=smul(S,L);if(!isConst(S))space.push({S,w:x.o.n+"."+x.n+"(…) inside the loops",l:x.line});}
        return sadd(own,...kids(x).map(y=>cost(y,ctx)));}
      const ctx={loops:[],ams:[],keys:[],loopVars:new Set(),am:[],drainKey:null};
      let time=cost(m.body,ctx);time=sadd(time,...ctx.am);
      // recursion: calls per path (a), how the argument shrinks, memo
      const self=y=>y.k==="Call"&&y.n===m.name&&(!y.o||y.o.k==="This"||y.o.k==="Name"&&y.o.n===m.cn);
      let rec=null;
      if(has(m.body,self)){
        let inLoop=false,loopArg=false;const sites=[];
        const br=x=>{if(!x||typeof x!=="object")return 0;if(Array.isArray(x))return x.reduce((s,y)=>s+br(y),0);if(x.k==="Lambda"||x.k==="Class")return 0;
          if(x.k==="If")return br(x.c)+Math.max(br(x.th),br(x.el));if(x.k==="Cond")return br(x.c)+Math.max(br(x.a),br(x.b));
          if(/^(For|ForEach|While|Do)$/.test(x.k)&&has(x.body,self)){inLoop=true;const lv=x.k==="For"&&x.init[0]&&x.init[0].k==="Local"?x.init[0].decls[0].n:x.n;
            has(x.body,y=>{if(self(y)&&y.args.some(a=>names(a).has(lv)))loopArg=true;return false;});return br(x.body);}
          let s=0;if(self(x)){s=1;sites.push(x);}return s+kids(x).reduce((t,y)=>t+br(y),0);};
        const a=br(m.body);let shrink="";const mids=new Set([...alias].filter(([n,e])=>/\/ ?2\b|>>>? ?1/.test(tx(e,-9))).map(([n])=>n));
        for(const y of sites)y.args.forEach(e=>{const t=tx(e,-9);
          if(/\/ ?2\b|>>>? ?1/.test(t)||[...names(e)].some(n=>mids.has(n)))shrink="half";
          else if(e.k==="Field"&&/left|right|next|child/i.test(e.n)&&!shrink)shrink="struct";
          else if(e.k==="Bin"&&/^[+-]$/.test(e.op)&&e.r.k==="Lit"&&e.l.k==="Name"&&params.has(e.l.n)&&!shrink)shrink="step";
          else if(e.k==="Bin"&&/^[+-]$/.test(e.op)&&e.l.k==="Name"&&!params.has(e.l.n)&&!shrink)shrink="loop";});
        if(!shrink&&sites.some(y=>y.args.some(e=>e.k==="Index"||e.k==="Call")))shrink="struct";
        const memo=has(m.body,y=>y.k==="If"&&MEMO.test([...names(y.c)].join(" "))&&has(y.th,z=>z.k==="Return"));
        // the size: an int parameter the calls change (or the bound of the loop the calls sit in)
        const chg=m.params.filter((p,i)=>sites.some(y=>y.args[i]&&!(y.args[i].k==="Name"&&y.args[i].n===p.n)));
        const ip=RNG&&chg.find(p=>RNG.includes(p.n))||chg.find(p=>INTT.test((p.t||{}).n)&&!(p.t||{}).d)||chg[0];let pk=ip&&shrink!=="struct"?keyOf({k:"Name",n:ip.n}):null;
        // pruned halving (a segment-tree query): 2+ early returns before the calls cut most branches
        const prune=a>=2&&shrink==="half"&&(m.body.st||[]).filter(y=>y.k==="If"&&has(y.th,z=>z.k==="Return")&&!has(y.th,self)).length>=2;
        if(inLoop){const lr=rows.find(r=>r.k==="loop"&&r.key&&has(m.body,y=>/^(For|ForEach|While)$/.test(y.k)&&y.line===r.l&&has(y.body,self)));if(lr)pk=lr.key;}
        const used=has(m.body,y=>y.k==="If"&&has(y.c,z=>z.k==="Index"&&z.a.k==="Name"&&/used|vis|seen|taken|on/i.test(z.a.n)));
        const n=shrink==="struct"?(a<=1?sym("h","h = tree height"):sym("nodes","n = nodes")):pk||sym("n"),w=time;let calls,depth,how;
        // collections handed down unchanged (path, current…) never hold more than the depth: pass 2 counts them as the size
        const pass=m.params.filter((p,i)=>!/^(int|long|short|char|boolean|double)$/.test((p.t||{}).n)&&sites.every(y=>y.args[i]&&y.args[i].k==="Name"&&y.args[i].n===p.n)&&has(m.body,z=>z.k==="Call"&&z.o&&z.o.k==="Name"&&z.o.n===p.n&&/^(add|push|addLast|append|offer)$/.test(z.n))).map(p=>p.n);
        const fib=sites.length>=2&&sites.every(y=>y.args.some(e=>e.k==="Bin"&&e.op==="-"&&e.r.k==="Lit"))&&new Set(sites.map(y=>tx(y.args.find(e=>e.k==="Bin"),-9))).size>1;
        if(shrink==="struct"){const h=sym("h","h = tree height");depth=lin(h);
          if(a<=1){calls=depth;how="follows one path down: at most h calls (h = log n when balanced, n when not)";}else{calls=lin(sym("nodes","n = nodes"));how="each node is visited once";}}
        else if(prune){calls=lg(n);depth=lg(n);how="the range checks return early, so only about 4 nodes per level keep going: log "+n;}
        else if(inLoop){calls=[TM({},{},used||!loopArg?n+"!":"2^"+n)];depth=lin(n);how=used||!loopArg?"a loop of choices, one fewer each level (permutations)":"each item is taken or skipped (subsets / combinations)";}
        else if(a<=1){calls=shrink==="half"?lg(n):lin(n);depth=calls;how=shrink==="half"?"one call per level, the range halves":"one call per level, the size drops by one";}
        else if(shrink==="half"){calls=lin(n);depth=lg(n);how=a+" calls on halves: "+(a===2?"log "+n+" levels":"")+(isConst(w)?"":", each level does "+n+" work in total");}
        else{calls=[TM({},{},(fib?"1.6":a)+"^"+n)];depth=lin(n);how=a+" calls each, the size drops by one"+(fib?": like Fibonacci, about 1.6ⁿ calls (2ⁿ is the simple upper bound)":"");}
        if(memo&&!(shrink==="struct")){calls=lin(n);how="the memo answers each argument once: about "+n+" real calls (the rest return at once)";}
        let tt=smul(calls,isConst(w)?ONE():w);if(shrink==="half"&&a>=2&&!isConst(w))tt=[TM({[n]:1},{[n]:1})];
        // the recurrence in the size's letter: T(n − 1), T(n/2), T(left)…
        const tA=y=>{const i=ip?m.params.indexOf(ip):-1,e=i>=0?y.args[i]:y.args.find(z=>names(z).size);if(!e)return "…";const t=tx(e,-9);
          if(shrink==="half")return n+"/2";if(shrink==="struct")return t;if(e.k==="Bin"&&e.r.k==="Lit")return n+" "+(e.op==="+"?"−":"−")+" "+e.r.v;return t;};
        const eq="T("+n+") = "+(inLoop?(used||!loopArg?n+" × T("+n+" − 1)":"T("+n+" − 1) + T("+n+" − 2) + … + T(0)"):a<=1&&sites.length>1?"T("+tA(sites[0])+")":sites.slice(0,Math.max(1,Math.min(a,3))).map(y=>"T("+tA(y)+")").join(" + "))+" + "+fmt(w).slice(2,-1)+(a<=1&&sites.length>1?"  (only one of the "+sites.length+" calls runs)":"");
        rec={a,shrink,memo,how,eq,pass,nk:keys.get(n),szp:ip&&shrink!=="struct"?(RNG&&RNG.includes(ip.n)?RNG.slice():[ip.n]):[],calls:fmt(calls),depth:fmt(depth),work:fmt(w)};time=tt;space.push({S:depth,w:"recursion depth (one stack frame per level)",l:m.line});}
      const out={name:m.name,cls:m.cn,line:m.line,end:m.end,params:m.params.map(p=>p.n),time:simp(time),ts:fmt(time),space:space.length?sadd(...space.map(s=>s.S)):ONE(),sp:space,rows,rec,syms,keys};
      out.ss=fmt(out.space);return out;}
    const ms=meths.map(m=>{try{return method(m);}catch(e){busy.clear();return null;}}).filter(Boolean); // an odd shape skips that method, never the page
    return {ms};}
  window.PGVZ={index,what,tx,bitsHtml,intervalsHtml,treeHtml,graphHtml,ixReads,ixEval,cplx,fmt,version:6};
})();
