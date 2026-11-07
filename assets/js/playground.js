/* playground.js: the Java Visual Playground UI (courses/java/playground.html). Loaded after course.js and jvm-lite.js, before run-java.js.
   Visualize runs the editor's program in JVML (jvm-lite.js) and steps through the recorded snapshots: stack frames, heap boxes
   keyed by object id (only boxes whose record changed are rebuilt), String pool strip, SVG reference arrows, console, "Why?" line.
   Everything lives in one IIFE (classic scripts share one global scope). CSS: the "playground v1" block in course.css (pg- classes).
   DSA Lab (v3): Memory switch (off = only the data structures, tagged with variable names), Variables table, Current-line card
   (statement meaning from pg-viz.js + the recorded condition values), line hit counts and breakpoints in the editor gutter,
   step over / out / to breakpoint, full screen, resizable panels.
   Phase 2 ("DSA views" block): index markers, lo..hi ranges and swap animations on arrays/Lists/Strings, 2D grids, interval bars, bits,
   bars, and a "Show as" menu per box (source analysis in pg-viz.js). Phase 3: stacks, queues, monotonic tags, linked-list cycles.
   Phase 4: trees of objects (binary, AVL, n-ary, trie) as one SVG in the root's box, PriorityQueue heaps, HashMap/HashSet buckets,
   TreeMap/TreeSet red-black trees; nodes glide to their new place (pg-viz treeHtml draws, flipTree animates).
   localStorage (always in try/catch): js1-pg-code, js1-pg-stdin, js1-pg-speed, js1-pg-objs, js1-pg-mem, js1-pg-full, js1-pg-split.
   Details: kb/java/playground.md. */
"use strict";
(function(){
  const PGhost=document.getElementById("pgv");if(!PGhost||!window.JVML)return;
  const q=(s,r)=>(r||document).querySelector(s),qa=(s,r)=>Array.from((r||document).querySelectorAll(s));
  const H=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const LS={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}}};
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const box=q(".code",PGhost),inEl=q("#pgIn"),con=q("#pgCon"),conInfo=q("#pgConInfo"),why=q("#pgWhy"),slide=q("#pgSlide"),pos=q("#pgPos"),
    speedSel=q("#pgSpeed"),panel=q("#pgPanel"),classesEl=q("#pgClasses"),objsBox=q("#pgObjs"),svg=q("#pgArrows"),framesEl=q("#pgFrames"),heapEl=q("#pgHeap"),poolEl=q("#pgPool"),exSel=q("#pgEx"),playBtn=q(".pg-play",PGhost),
    memBox=q("#pgMem"),fullBtn=q("#pgFull"),cardEl=q("#pgCard"),cardLn=q("#pgCardLn"),watchEl=q("#pgWatch"),watchInfo=q("#pgWatchInfo");
  /* ---------- examples ---------- */
  const EX=qa('#pgExamples script[type="text/x-java-example"]').map(s=>({name:s.dataset.name,file:s.dataset.file,code:s.textContent.replace(/^\n+/,"").replace(/\s+$/,"")+"\n",stdin:s.dataset.stdin||""}));
  exSel.innerHTML='<option value="">Examples…</option>'+EX.map((e,i)=>'<option value="'+i+'">'+H(e.name)+"</option>").join("");
  const DEFAULT=(box&&box._src?box._src:"")+"\n";
  let baseCode=DEFAULT,curFile=(q(".fn",box)||{}).textContent||"Main.java";
  /* ---------- editor access (course.js mounts CodeMirror lazily) ---------- */
  const cm=()=>box&&box._cm;
  function getCode(){return cm()?cm().getValue():box._src||"";}
  function setCode(src){if(cm()){cm().setValue(src);return;}box._src=src.replace(/\s+$/,"");const w=q(".cm-wait",box);
    if(w&&typeof hl==="function")w.innerHTML="<code>"+hl(box._src).split("\n").map(x=>'<span class="ln">'+x+"</span>").join("")+"</code>";}
  const fileOf=src=>{const m=src.match(/public\s+(?:final\s+|abstract\s+)*(?:class|interface|enum|record)\s+([A-Za-z_$][\w$]*)/)||src.match(/(?:class|record|enum)\s+([A-Za-z_$][\w$]*)/);return (m?m[1]:"Main")+".java";};
  function setFile(){curFile=fileOf(getCode());const fn=q(".fn",box);if(fn)fn.textContent=curFile;}
  /* ---------- share links: #code=z<deflate base64url> (or b<utf-8 base64url>) [&in=<base64url>] ---------- */
  const b64u=bytes=>{let s="";for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+8192));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");};
  const unb64u=t=>{const s=atob(t.replace(/-/g,"+").replace(/_/g,"/"));const b=new Uint8Array(s.length);for(let i=0;i<s.length;i++)b[i]=s.charCodeAt(i);return b;};
  async function packCode(code){const bytes=new TextEncoder().encode(code);
    if(window.CompressionStream){try{const st=new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"));const z=new Uint8Array(await new Response(st).arrayBuffer());return "z"+b64u(z);}catch(e){}}
    return "b"+b64u(bytes);}
  async function unpackCode(t){const kind=t[0],bytes=unb64u(t.slice(1));
    if(kind==="z"){const st=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));return new TextDecoder().decode(await new Response(st).arrayBuffer());}
    return new TextDecoder().decode(bytes);}
  /* ---------- state ---------- */
  let R=null,K=0,timer=null,stale=false,marks=[],errMark=null,DEP=[],IDX={byLine:new Map(),decl:new Map(),ix:new Map(),cx:new Map(),bits:new Set(),use:new Map(),via:new Map(),mono:new Set(),dp:new Set(),low:false,seg:false,seg0:false};
  let objMode=LS.get("js1-pg-objs")==="1",memOn=LS.get("js1-pg-mem")==="1";
  const OM=()=>objMode&&memOn; // Strings and boxes as their own objects: a Memory-view option only
  const speed=()=>{const v=parseFloat(speedSel.value);return isNaN(v)?1:v;}; // 0 = Instant
  const IXC=["#60a5fa","#f472b6","#34d399","#fbbf24","#a78bfa","#fb923c","#22d3ee"]; // v8: pointer chip colours, picked by the variable name
  let UZ=1,FITALL=false; // v4: the user zoom (− Fit +), multiplies the picture scale; v5: Fit shrinks a tall picture until all of it shows
  speedSel.value=LS.get("js1-pg-speed")||"1";if(!speedSel.value)speedSel.value="1";
  /* ---------- running ---------- */
  function visualize(){
    stop();const code=getCode();setFile();LS.set("js1-pg-code",code);LS.set("js1-pg-stdin",inEl.value);
    why.innerHTML='<span class="pg-busy"></span> Running the program in the visualizer…';PGhost.classList.add("pg-running");
    setTimeout(()=>{
      const t0=performance.now();
      try{R=JVML.run(code,inEl.value);}catch(e){R={steps:[],out:"",errR:[],error:{line:0,msg:"internal error: "+e.message,kind:"internal"}};}
      R.took=Math.round(performance.now()-t0);lineKey="";conKey="";HI=null;histKey="";PGhost.classList.remove("pg-running");stale=false;PGhost.classList.remove("pg-stale");
      clearErr();
      DEP=R.steps.map(s=>s.k.reduce((n,id)=>n+(typeof id==="string"&&id.startsWith("S:")?0:1),0));
      IDX=window.PGVZ?PGVZ.index(code):IDX;IDX.top1=/\btop\s*=\s*-\s*1\b/.test(code);IDX.sort=/\b(void|int\[\]|static)\s+\w*[sS]ort\w*\s*\(|class\s+\w*Sort/.test(code);OPEN.clear();BITC.clear();AS.clear();hitsGutter();
      try{CX=window.PGVZ&&PGVZ.cplx?PGVZ.cplx(code):null;}catch(e){CX=null;}cxRun++;cxKey="";if(CX)for(const m of CX.ms)m.show=!!m.rec||m.ts!=="O(1)";
      const ran=()=>{try{document.dispatchEvent(new CustomEvent("pg:ran",{detail:R}));}catch(e){}}; // missions (labs-java-play.js) listen
      if(!R.steps.length){showFatal();ran();return;}
      slide.max=String(R.steps.length-1);go(0);
      if(R.error&&R.error.line)markErr(R.error.line);ran();},30);}
  function showFatal(){const e=R.error||{msg:"nothing to show",line:0};
    framesEl.innerHTML="";heapEl.innerHTML="";heapEl.style.height="0px";poolEl.hidden=true;svg.innerHTML="";slide.max="0";slide.value="0";pos.textContent="step 0 / 0";
    DRAWN.clear();cardEl.innerHTML="";cardLn.textContent="";watchEl.innerHTML='<div class="pg-empty">Nothing ran.</div>';watchInfo.textContent="";
    if(histEl)histEl.innerHTML="";if(htab==="hist")setHTab("con"); // the error is in the Console
    con.innerHTML='<span class="pg-err">'+H((e.line?"Line "+e.line+": ":"")+e.msg)+"</span>";conInfo.textContent=e.kind==="compile"?"did not compile":"stopped";
    why.innerHTML='<b class="pg-bad">'+(e.kind==="compile"?"Compile error":"Can't visualize this program")+"</b> · "+H((e.line?"line "+e.line+": ":"")+e.msg.split("\n")[0])+(e.kind!=="compile"?" · try <b>Run on a real JDK</b>":"");
    heapEl.style.height="";heapEl.innerHTML='<div class="pg-empty pg-errc"><b>'+(e.kind==="compile"?"The program does not compile":"This program cannot be visualized")+(e.line?" · line "+e.line:"")+"</b><code>"+H(e.msg.split("\n")[0])+"</code>"+(e.kind==="compile"?"Fix the highlighted line in the editor, then press <b>▶ Visualize</b> (Ctrl+Enter).":"It may use a library the visualizer does not know. <b>Run on a real JDK</b> still runs it.")+"</div>";
    if(e.line)markErr(e.line);}
  function markErr(line){const c=cm();if(!c||line<1||line>c.lineCount())return;errMark=c.addLineClass(line-1,"background","pg-errline");}
  function clearErr(){const c=cm();if(c&&errMark){c.removeLineClass(errMark,"background","pg-errline");errMark=null;}}
  /* ---------- stepping ---------- */
  function go(k){if(!R||!R.steps.length)return;K=Math.max(0,Math.min(k,R.steps.length-1));render();}
  function play(){if(!R||!R.steps.length)return;if(timer){stop();return;}if(K>=R.steps.length-1)go(0);
    if(!speed()){toBp();return;} // Instant: straight to the next breakpoint (or the end)
    playBtn.textContent="❚❚";playBtn.setAttribute("aria-label","Pause");
    const tick=()=>{if(K>=R.steps.length-1){stop();return;}go(K+1);if(atBp(K)){stop();return;}timer=setTimeout(tick,Math.max(40,700/speed()));};timer=setTimeout(tick,Math.max(40,700/speed()));}
  /* debugger moves over the recorded trace: DEP[k] = how many method frames are on the stack at step k */
  function findFwd(ok){for(let j=K+1;j<R.steps.length;j++)if(ok(j))return j;return R.steps.length-1;}
  const stepOver=()=>{const d=DEP[K];go(findFwd(j=>DEP[j]<=d));};
  const stepOut=()=>{const d=DEP[K];go(findFwd(j=>DEP[j]<d));};
  function atBp(k){const s=R.steps[k];return s.e==="line"&&bpLines().has(s.l);}
  function toBp(){go(findFwd(atBp));}
  function stop(){if(timer)clearTimeout(timer);timer=null;playBtn.textContent="▶";playBtn.setAttribute("aria-label","Play");}
  /* ---------- rendering ---------- */
  function render(){
    const S=JVML.state(R,K);const N=R.steps.length;
    slide.value=String(K);pos.textContent="step "+(K+1)+" / "+N+(S.line?" · line "+S.line:"");
    lines(S);consoleOut(S);history();whyLine(S);lineCard(S);
    const chg=new Set(S.changed);
    if(tab==="cx")cxPane(S);else watch(S,chg);
    const C=viewCtx(S),model=heapModel(S,C);
    if(memOn)drawFrames(S,chg);drawHeap(S,model,chg,C);drawArrows(chg);}
  let lineKey="";
  function lines(S){const c=cm();if(!c)return;const lk=S.line+"|"+S.prev+"|"+S.ev+"|"+stale+"|"+(R&&R.took);if(lk===lineKey)return;lineKey=lk;for(const m of marks)c.removeLineClass(m.h,"background",m.c);marks=[];
    if(stale)return;
    const add=(l,cls)=>{if(l>0&&l<=c.lineCount())marks.push({h:c.addLineClass(l-1,"background",cls),c:cls});};
    if(S.prev&&S.prev!==S.line)add(S.prev,"pg-prevline");add(S.line,S.ev==="exception"?"pg-exline":"pg-curline");
    if(S.line>0&&S.line<=c.lineCount()){const info=c.getScrollInfo(),top=c.heightAtLine(S.line-1,"local");if(top<info.top+20||top>info.top+info.clientHeight-40)c.scrollTo(null,Math.max(0,top-info.clientHeight/3));}}
  let conKey="";
  function consoleOut(S){const last0=K===R.steps.length-1,ck=S.console.length+"|"+last0+"|"+(R.error?1:0)+"|"+R.took;if(ck===conKey)return;conKey=ck;
    // past the recording limit the program ran on unrecorded (R.ff): the last step shows everything it printed
    const full=last0&&R.ff>0;let txt=full?R.out:S.console,html="",at=0;
    for(const [a,b] of full?R.errR:S.errR){html+=H(txt.slice(at,a))+'<span class="pg-err">'+H(txt.slice(a,b))+"</span>";at=b;}html+=H(txt.slice(at));
    const last=K===R.steps.length-1;
    if(last&&R.error)html+=(html&&!html.endsWith("\n")?"\n":"")+'<span class="pg-warn">'+H((R.error.line?"Line "+R.error.line+": ":"")+R.error.msg)+(R.error.kind==="limit"?(R.ff?"\nToo big for the Lab: it recorded the first "+N(R.steps.length)+" steps (step through them), then ran on without recording until it stopped. An infinite loop or a very large input: Run on a real JDK gives the full output.":""):"\n(the visualizer stops here; Run on a real JDK for the real output)")+"</span>";
    else if(last&&R.ff)html+=(html&&!html.endsWith("\n")?"\n":"")+'<span class="pg-dim">The Lab recorded the first '+N(R.steps.length)+" steps; the other "+N(R.total-R.ff+1)+" ran without recording, so this console shows the complete output.</span>";
    con.innerHTML=html||'<span class="pg-dim">(nothing printed yet)</span>';con.scrollTop=con.scrollHeight;if(hdot)hdot.hidden=htab==="con"||!S.console;
    conInfo.textContent=last?(R.error?"stopped":R.uncaught?"ended with an exception":"finished")+" · "+N(R.total||R.steps.length)+" steps in "+R.took+" ms":"";}
  const N=n=>n.toLocaleString("en-US");
  /* ---------- History (R3): one row per step that did something (a sentence, a call, a return, an exception, printed text);
     indexes built once per run, the list shows the last 60 up to the current step; a click goes back to that step ---------- */
  const histEl=q("#pgHist"),htabs=qa(".pg-htab",PGhost),hdot=q(".pg-hdot",PGhost);let HI=null,histKey="",htab=LS.get("js1-pg-htab")==="con"?"con":"hist",conSeen=0;
  function setHTab(t){htab=t==="con"?"con":"hist";LS.set("js1-pg-htab",htab);for(const b of htabs){const on=b.dataset.ht===htab;b.classList.toggle("on",on);b.setAttribute("aria-selected",String(on));b.tabIndex=on?0:-1;}
    if(histEl)histEl.hidden=htab!=="hist";con.hidden=htab!=="con";histKey="";conKey="";if(R&&R.steps.length)render();}
  for(const b of htabs){b.onclick=()=>setHTab(b.dataset.ht);b.onkeydown=e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();e.stopPropagation();setHTab(htab==="hist"?"con":"hist");q(".pg-htab.on",PGhost).focus();}};}
  setHTab(htab);
  if(histEl)histEl.addEventListener("click",e=>{const b=e.target.closest("[data-hk]");if(b){stop();go(+b.dataset.hk);}});
  function histIdx(){HI=[];const s=R.steps;for(let j=1;j<s.length;j++){const x=s[j];if(effTxt(x.w)||x.e==="call"||x.e==="return"||x.e==="exception"||x.e==="end"||x.o!==s[j-1].o)HI.push(j);}}
  function histRow(j){const s=R.steps[j],p=R.steps[j-1],out=R.out.slice(p.o,s.o).replace(/\n$/,"");let t=effTxt(s.w)||"",ev="";
    if(s.e==="call"){const f=frameOf(JVML.state(R,j),s.f);ev="call";t=t||"enters "+(f?f.name:"a method");}
    else if(s.e==="return"){ev="ret";t=t||"returns";}else if(s.e==="exception"){ev="ex";t=t||"an exception is thrown";}else if(s.e==="end"){ev="end";t="the program ends";}
    if(out)t+=(t?" · ":"")+"prints "+(out.length>40?out.slice(0,40)+"…":out);
    return {l:p.l||s.l,t:t.split(" (a reference is copied, not the object)").join(""),ev};}
  function history(){
    if(!histEl||htab!=="hist"||!R)return;if(!HI)histIdx();
    let lo=0,hi=HI.length;while(lo<hi){const m=(lo+hi)>>1;if(HI[m]<=K)lo=m+1;else hi=m;} // HI[0..lo) are the steps up to K
    const key=K+"|"+lo+"|"+R.took;if(key===histKey)return;histKey=key;
    if(!lo){histEl.innerHTML='<li class="pg-dim">Nothing has happened yet: step forward with → and every step that changes something is listed here.</li>';return;}
    const from=Math.max(0,lo-60);let h=from?'<li class="pg-dim">… '+N(from)+" earlier steps</li>":"";
    for(let i=from;i<lo;i++){const j=HI[i],r=R._hr&&R._hr[j]||((R._hr=R._hr||{})[j]=histRow(j));
      h+='<li'+(i===lo-1?' class="on"':"")+'><button type="button" data-hk="'+j+'" title="'+H((r.l?"line "+r.l+": ":"")+r.t)+'"><span class="pg-hln">'+(r.l?"L"+r.l:"")+"</span>"+(r.ev?'<b class="pg-hev '+r.ev+'">'+{call:"call",ret:"return",ex:"throw",end:"end"}[r.ev]+"</b>":"")+'<span class="pg-htx">'+H(r.t)+"</span></button></li>";}
    histEl.innerHTML=h;histEl.scrollTop=histEl.scrollHeight;}
  // an effect sentence without the Memory-view details (cached boxes, the String pool) when Memory is off
  const effTxt=w=>!w||memOn?w:w.split("; ").filter(x=>!/reuses the cached box|already in the String pool/.test(x)).join("; ");
  function whyLine(S){
    let t=effTxt(S.why);const pl=K>0&&S.ev==="line"&&t?R.steps[K-1].l:0;
    if(pl){why.classList.remove("pg-why0");why.innerHTML='<span class="pg-jr">line '+pl+" just ran</span>"+H(t);return;} // the step's sentence is what the previous line did
    if(!t){const f=S.frames.filter(x=>x.fr).pop();
      switch(S.ev){case "call":t=f?"enter "+f.name+": a new frame is pushed":"";break;
        case "return":t=f?f.name+" returns"+(f.ret&&f.ret.p!=="void"?" "+valTxt(f.ret,S):"")+", and its frame is popped next":"";break;
        case "exception":t="an exception is thrown here";break;
        case "gc":t="System.gc() runs the garbage collector";break;
        case "end":t=R.uncaught?"the exception was never caught, so the program ends and the JVM prints the stack trace":"main returned: the program is finished";break;
        default:t=K===0?"the program starts":"";}} // v5: nothing new to say → the bar hides (the card already shows the line)
    why.innerHTML=(S.ev==="exception"?'<b class="pg-bad">Exception</b> · ':S.ev==="call"?'<b class="pg-acc">Call</b> · ':S.ev==="return"?'<b class="pg-acc">Return</b> · ':S.ev==="end"?'<b class="pg-good">End</b> · ':S.ev==="gc"?'<b class="pg-bad">GC</b> · ':"")+(t?H(t):"&nbsp;");why.classList.toggle("pg-why0",!t&&S.ev==="line");}
  /* ---------- the Current-line card: what the highlighted line does, what happens when it runs (the next step's record), what runs next ---------- */
  const srcLine=l=>{const c=cm();const t=c&&l>0&&l<=c.lineCount()?c.getLine(l-1):(getCode().split("\n")[l-1]||"");return t.trim();};
  const frameOf=(S,id)=>S.frames.find(f=>f.id===id);
  function condHtml(cd){
    let h="";const parts=cd.p||[];
    if(parts.length===1&&parts[0][0]===cd.s){const p=parts[0];h='<div class="pg-cd"><code>'+H(p[0])+'</code><i>→</i><code>'+H(p[1]+" "+p[2]+" "+p[3])+"</code><i>→</i>"+tf(p[4])+"</div>";}
    else{h='<div class="pg-cd"><code>'+H(cd.s)+"</code></div>";
      for(const p of parts)h+='<div class="pg-cd pg-cdp"><code>'+H(p[0])+'</code><i>→</i><code>'+H(p[1]+" "+p[2]+" "+p[3])+"</code><i>→</i>"+tf(p[4])+"</div>";
      const n=(cd.s.match(/&&|\|\|/g)||[]).length+1;
      if(parts.length&&parts.length<n&&/&&|\|\|/.test(cd.s))h+='<div class="pg-cdn">'+(cd.v?"|| stops at the first true part":"&& stops at the first false part")+": the rest is not checked</div>";
      h+='<div class="pg-cd"><span>whole condition</span><i>→</i>'+tf(cd.v)+"</div>";}
    return h;}
  const tf=v=>'<b class="pg-tf '+(v?"t":"f")+'">'+(v?"true":"false")+"</b>";
  /* why the program is on this line: the condition the previous line decided, or the call that brought it here */
  function whyHere(S,st){
    const pv=K>0?R.steps[K-1]:null;let t="";
    if(S.ev==="call"&&pv)t="called from line "+pv.l;
    else if(st.cd&&S.ev==="line"&&pv&&pv.e!=="return"){const cd=st.cd;
      if(cd.fe)t=cd.done?"<code>"+H(cd.fe)+"</code> has no elements left, so the loop ended":"<code>"+H(cd.fe)+"</code> took the next element: "+H(cd.fv);
      else{const one=cd.p&&cd.p.length===1&&cd.p[0][0]===cd.s?" ("+H(cd.p[0][1]+" "+cd.p[0][2]+" "+cd.p[0][3])+")":"";
        t="<code>"+H(cd.s)+"</code>"+one+" was "+tf(cd.v)+(cd.lp?cd.v?", so the loop body runs":", so the loop ended":"");}}
    return t?'<div class="pg-whyh"><span>Why here</span>'+(t.startsWith("<")?t:H(t))+"</div>":"";}
  function lineCard(S){
    const L=S.line,nx=K+1<R.steps.length?R.steps[K+1]:null,st=S.step;
    cardLn.textContent=L?"line "+L:"";
    if(S.ev==="end"){cardEl.innerHTML='<p class="pg-what">'+(R.uncaught?"An exception was never caught, so the program stopped and Java printed the stack trace.":"The program has finished: main returned and the stack is empty.")+"</p>"+(R.out?'<p class="pg-dim">See the Console for everything it printed.</p>':"");return;}
    const stmt=st.sn||IDX.byLine.get(L),fr=frameOf(S,st.f);
    let what="";
    if(S.ev==="call")what="Enters "+(fr?fr.name:"a method")+": Java pushes a new frame for it, holding its parameters and local variables, and runs its body from the top.";
    else if(S.ev==="return")what=(fr?fr.name:"The method")+" is done"+(fr&&fr.ret&&fr.ret.p!=="void"?" and hands back "+valTxt(fr.ret,S):"")+". Its frame is removed and the caller continues where it paused.";
    else if(S.ev==="exception")what="An exception is thrown here. Java leaves this code and looks for a matching catch, from this method outwards.";
    else if(S.ev==="gc")what="System.gc() ran the garbage collector: objects nothing can reach are freed.";
    else what=window.PGVZ?PGVZ.what(stmt):"";
    // v4: the card reads top-down as a summary first (the line, what it changes, what runs next), then the reason (why here, the condition), then the long explanation (two lines, "more" opens it)
    const top='<div class="pg-cl"><span>'+(L||"")+"</span><code>"+H(srcLine(L)||"")+"</code></div>";let sum="";
    let h=whyHere(S,st);const whatH=what?'<p class="pg-what">'+H(what)+(/[.!]$/.test(what)?"":".")+"</p>":"";
    // when it runs: a condition decided now (next step), or the one that finished as we came back to this line
    const cd=nx&&nx.cd?nx.cd:st.cd&&S.ev==="line"&&R.steps[K-1]&&R.steps[K-1].e==="return"?st.cd:null;
    if(cd){
      if(cd.fe)h+='<div class="pg-pass">'+(cd.lp?"Loop pass "+cd.lp.n:"")+"</div>"+(cd.done?'<div class="pg-cd"><span>no elements left</span><i>→</i><b class="pg-tf f">loop ends</b></div>':'<div class="pg-cd"><code>'+H(cd.fe)+'</code><i>=</i><code>'+H(cd.fv)+"</code><span>the next element</span></div>");
      else{if(cd.lp)h+='<div class="pg-pass">'+(cd.lp.d?"After pass "+(cd.lp.n-1)+": check again":"Loop check "+cd.lp.n+(cd.lp.n>1?" · after pass "+(cd.lp.n-1):" · before the first pass"))+"</div>";
        h+=condHtml(cd);}}
    // what changes when it runs
    if(nx){const eff=[];
      const nw=effTxt(nx.w);if(nw)eff.push(H(nw));
      const out=R.out.slice(st.o,nx.o);if(out.trim())eff.push("prints <code>"+H(out.length>60?out.slice(0,60)+"…":out.replace(/\n$/,""))+"</code>");
      if(eff.length)sum+='<ul class="pg-eff">'+eff.map(x=>"<li>"+x+"</li>").join("")+"</ul>";
      // next
      let nt="";
      if(nx.e==="call"){const S1=JVML.state(R,K+1),f1=frameOf(S1,nx.f);nt="enters "+(f1?f1.name:"a method")+" (line "+nx.l+")";}
      else if(nx.e==="return")nt="the method returns (line "+nx.l+")";
      else if(nx.e==="end")nt="the program ends";
      else if(nx.e==="exception")nt="an exception is thrown (line "+nx.l+")";
      else{nt="line "+nx.l;
        if(cd&&cd.lp&&!cd.fe)nt+=cd.v?" · the loop body runs":" · the loop is over";
        else if(cd&&cd.fe)nt+=cd.done?" · the loop is over":" · the loop body runs";
        else if(cd&&stmt&&stmt.k==="If")nt+=cd.v?" · the if-body":stmt.el?" · the else part":" · the body is skipped";
        else if(DEP[K+1]<DEP[K])nt+=" · back in the caller";
        else if(nx.l<L&&nx.f===st.f)nt+=" · back to the loop";}
      sum+='<div class="pg-next"><span>Next</span>'+H(nt)+"</div>";}
    cardEl.innerHTML=top+sum+(h?'<div class="pg-cdet">'+h+"</div>":"")+whatH+(what.length>110?'<button type="button" class="pg-more" aria-expanded="'+cardMore+'">'+(cardMore?"less":"more")+"</button>":"");}
  let cardMore=LS.get("js1-pg-more")==="1";PGhost.classList.toggle("pg-cmore",cardMore);
  cardEl.addEventListener("click",e=>{const b=e.target.closest(".pg-more");if(!b)return;cardMore=!cardMore;LS.set("js1-pg-more",cardMore?"1":"0");PGhost.classList.toggle("pg-cmore",cardMore);b.textContent=cardMore?"less":"more";b.setAttribute("aria-expanded",String(cardMore));});
  /* ---------- the Variables table: the current method's locals and parameters, this.fields, static fields ---------- */
  const OPEN=new Set();
  function summ(v,S,deep){ // one-line value text; references are summarised
    if(v===undefined)return "";if(v===null)return "null";
    if(v.r===undefined)return v.p==="char"?"'"+v.s+"'":v.s;
    const r=S.recs.get(v.r);if(!r)return "ref";
    const list=(a,n)=>"["+a.slice(0,8).map(x=>summ(x,S,1)).join(", ")+((n||a.length)>8?", …":"")+"]";
    switch(r.k){
      case "str":return '"'+(r.s.length>40?r.s.slice(0,40)+"…":r.s)+'"';case "box":return r.s;case "sb":return '"'+r.s+'"';
      case "arr":return deep?r.et+"["+r.len+"]":list(r.a,r.len);
      case "list":case "linked":case "stack":case "deque":case "pq":case "set":return deep?r.cls+"("+r.size+")":list(r.a,r.size);
      case "map":return deep?r.cls+"("+r.size+")":"{"+r.e.slice(0,6).map(e=>summ(e[0],S,1)+"="+summ(e[1],S,1)).join(", ")+(r.size>6?", …":"")+"}";
      case "obj":return deep?r.cls:r.cls+(r.en?"."+r.en:"")+" {"+r.f.slice(0,4).map(x=>x.n+"="+summ(x.v,S,1)).join(", ")+(r.f.length>4?", …":"")+"}";
      case "lambda":return "λ "+r.text;default:return r.cls||r.k;}}
  function prevOf(rec,name,cur){ // the value before the last change, from the step deltas (bounded scan)
    for(let j=K,n=0;j>0&&n<4000;j--,n++){for(const r of R.steps[j].d){if(r.id!==rec)continue;const x=getField(r,name);const t=x===undefined?undefined:sig(x);if(t!==cur)return x===undefined?{nw:1}:{v:x};}}
    return null;}
  const getField=(r,n)=>{const a=r.vars||r.f;if(!a)return undefined;const x=a.find(y=>y.n===n);return x?x.v:undefined;};
  const sig=v=>v===null?"null":v.r!==undefined?"#"+v.r:v.p+":"+v.s;
  function watch(S,chg){
    const fr=frameOf(S,S.step.f),rows=[];
    if(fr){for(const v of fr.vars){
      if(v.n==="this"&&v.v&&v.v.r!==undefined){const o=S.recs.get(v.v.r);if(o&&o.f)for(const x of o.f)rows.push({n:"this."+x.n,t:"",v:x.v,sc:"field",rec:o.id,f:x.n,key:"h"+o.id+":"+x.n});continue;}
      rows.push({n:v.n,t:v.t,v:v.v,sc:v.cap?"captured":v.pa?"param":"local",rec:fr.id,f:v.n,key:fr.id+":"+v.n});}}
    for(const c of S.frames.filter(x=>x.st))for(const v of c.vars)rows.push({n:c.name+"."+v.n,t:v.t,v:v.v,sc:"static",rec:c.id,f:v.n,key:c.id+":"+v.n});
    watchInfo.textContent=fr?"in "+fr.name:"";
    if(!rows.length){watchEl.innerHTML='<div class="pg-empty">'+(S.ev==="end"?"The program has finished.":"No variables yet in "+(fr?fr.name:"this method")+".")+"</div>";return;}
    let h='<table class="pg-wt"><thead><tr><th>Variable</th><th title="A value that the last line changed reads before → now">Value</th></tr></thead><tbody>';
    for(const w of rows){
      const cur=sig(w.v),changed=chg.has(w.key),inner=w.v&&w.v.r!==undefined&&[...chg].some(k=>k.startsWith("h"+w.v.r+":"));
      const p=changed?prevOf(w.rec,w.f,cur):null;
      const isRef=w.v&&w.v.r!==undefined&&(()=>{const r=S.recs.get(w.v.r);return r&&["arr","obj","list","linked","stack","deque","pq","set","map"].includes(r.k);})();
      const open=isRef&&OPEN.has(w.key);
      // v4: two columns; the type sits under the name, the scope is in the tooltip, a change reads "before → now"
      h+='<tr class="'+(changed?"pg-chg ":"")+(inner?"pg-inn ":"")+'" data-key="'+H(w.key)+'" title="'+H((w.t?w.t+" ":"")+w.n+" · "+w.sc)+'"><td class="pg-wn">'+(isRef?'<button type="button" class="pg-wx" aria-expanded="'+open+'" aria-label="Expand '+H(w.n)+'">'+(open?"▾":"▸")+"</button>":"")+H(w.n)+(changed?' <i class="pg-wdot" title="changed by the last line"></i>':"")+(w.t?'<small class="pg-wty">'+H(w.t)+"</small>":"")+'</td><td class="pg-wv">'+(p?p.nw?'<small class="pg-wnew">new</small> ':'<s class="pg-wold">'+H(summ(p.v,S,1))+'</s><i class="pg-warr">→</i>':"")+'<span class="pg-wcur" title="'+H(summ(w.v,S))+'">'+H(summ(w.v,S))+"</span>"+(inner&&!changed?' <small class="pg-acc">contents changed</small>':"")+"</td></tr>";
      if(open)h+=subRows(S.recs.get(w.v.r),S,chg);}
    watchEl.innerHTML=h+"</tbody></table>";}
  function subRows(r,S,chg){
    let items=[];
    if(r.k==="obj")items=r.f.map(x=>[x.n,x.v,"h"+r.id+":"+x.n]);
    else if(r.k==="map")items=r.e.slice(0,20).map((e,i)=>[summ(e[0],S,1),e[1],"h"+r.id+":v"+i]);
    else items=r.a.slice(0,20).map((v,i)=>["["+i+"]",v,"h"+r.id+":"+i]);
    const more=(r.k==="obj"?0:(r.len||r.size||0)-items.length);
    return items.map(([n,v,k])=>'<tr class="pg-sub'+(chg.has(k)?" pg-chg":"")+'"><td class="pg-wn">'+H(n)+'</td><td class="pg-wv">'+H(summ(v,S,1))+"</td></tr>").join("")+(more>0?'<tr class="pg-sub"><td></td><td class="pg-wv pg-dim">… '+more+" more</td></tr>":"");}
  watchEl.addEventListener("click",e=>{const b=e.target.closest(".pg-wx");if(!b)return;const k=b.closest("tr").dataset.key;if(OPEN.has(k))OPEN.delete(k);else OPEN.add(k);if(R&&R.steps.length)watch(JVML.state(R,K),new Set(JVML.state(R,K).changed));});
  /* ---------- editor gutters: breakpoints (click a line number) and how many times each line ran ---------- */
  const BPS=new Set();
  function bpLines(){const c=cm(),s=new Set();if(!c)return s;for(const h of BPS){const n=c.getLineNumber(h);if(n==null)BPS.delete(h);else s.add(n+1);}return s;}
  function toggleBp(line){const c=cm();if(!c)return;const h=c.getLineHandle(line);
    if(BPS.has(h)){BPS.delete(h);c.setGutterMarker(h,"pg-bp",null);}
    else{BPS.add(h);const m=document.createElement("span");m.className="pg-bpd";m.title="Breakpoint: Play and ⏭ stop here";m.textContent="●";c.setGutterMarker(h,"pg-bp",m);}}
  function hitsGutter(){const c=cm();if(!c)return;c.clearGutter("pg-hits");if(!R||!R.hits||stale)return;
    let mx=1;for(const k in R.hits)mx=Math.max(mx,R.hits[k]);
    for(const k in R.hits){const l=+k;if(l<1||l>c.lineCount())continue;const n=R.hits[k],m=document.createElement("span");m.className="pg-hit";
      m.style.setProperty("--h",(0.15+0.85*n/mx).toFixed(2));m.textContent="×"+(n>9999?Math.round(n/1000)+"k":n);m.title="line "+l+" ran "+n.toLocaleString("en-US")+" time"+(n>1?"s":"")+" in this run";c.setGutterMarker(l-1,"pg-hits",m);}}
  /* values */
  function valTxt(v,S){if(v===undefined)return "";if(v===null)return "null";if(v.r!==undefined){const r=S.recs.get(v.r);if(r&&r.k==="str")return '"'+r.s+'"';if(r&&r.k==="box")return r.s;return "→ "+(r?(r.cls||r.k):"#"+v.r);}
    if(v.p==="char")return "'"+v.s+"' ("+v.c+")";return v.s;}
  function cellVal(v,S,key){ // inline value inside a box (strings and boxed numbers are drawn inline in containers)
    if(v===null||v===undefined)return '<span class="pg-null">null</span>';
    if(v.r!==undefined){const r=S.recs.get(v.r);
      if(r&&(r.k==="str"||r.k==="box")&&OM())return '<span class="pg-dot" data-to="'+v.r+'"'+(key?' data-k="'+H(key)+'"':"")+"></span>";
      if(r&&r.k==="str")return '<span class="pg-sv" title="String #'+v.r+'">"'+H(r.s.length>24?r.s.slice(0,24)+"…":r.s)+'"</span>';
      if(r&&r.k==="box")return '<span class="pg-bv" title="'+r.cls+' #'+v.r+'">'+H(r.s)+"</span>";
      return '<span class="pg-dot" data-to="'+v.r+'"'+(key?' data-k="'+H(key)+'"':"")+"></span>";}
    if(v.p==="char")return '<span class="pg-cv">\''+H(v.s)+"'</span>";
    return '<span class="pg-pv">'+H(v.s)+"</span>";}
  function varVal(v,S,key){ // a variable or field: references are arrows (also to Strings and boxes, to show sharing)
    if(v===null)return '<span class="pg-null">null</span>';
    if(v&&v.r!==undefined){const r=S.recs.get(v.r);if(!r||r.hid)return '<span class="pg-dim">ref</span>';return '<span class="pg-dot" data-to="'+v.r+'" data-k="'+H(key)+'"></span>';}
    if(v&&v.p==="char")return "'"+H(v.s)+"' <small>("+v.c+")</small>";
    return v?H(v.s):"";}
  /* ---------- the stack ---------- */
  const MAXF=12;
  function drawFrames(S,chg){
    const frs=S.frames.filter(f=>f.fr).reverse(),sts=S.frames.filter(f=>f.st);
    const cur=S.step.f;let html="";
    const shown=frs.slice(0,MAXF);
    for(const f of shown){const isCur=f.id===cur;
      html+='<div class="pg-fr'+(isCur?" cur":"")+'" data-id="'+f.id+'"><div class="pg-frh"><b>'+H(f.name)+"</b><span>"+(isCur?"line "+(S.line||f.line):f.line?"paused at line "+f.line:"")+"</span></div>"+
        varRows(f,S,chg)+"</div>";}
    if(frs.length>MAXF)html+='<div class="pg-more">… '+(frs.length-MAXF)+" more frames below (the call stack is "+frs.length+" deep)</div>";
    if(!frs.length&&S.ev==="end")html+='<div class="pg-empty">The stack is empty: main has returned.</div>';
    framesEl.innerHTML=html;drawClasses(sts,S,chg);}
  function drawClasses(sts,S,chg){
    if(!sts.length){classesEl.innerHTML='<div class="pg-empty">No class loaded yet.</div>';return;}
    let h="";
    for(const c of sts){
      const head=(c.kind||"class")+" "+c.name+(c.comps?"("+c.comps.join(", ")+")":"");
      const ext=[c.sup?"extends "+c.sup:"",c.ifs&&c.ifs.length?"implements "+c.ifs.join(", "):""].filter(Boolean).join(" · ");
      const ms=(c.ms||[]).filter(m=>!/^static main\(/.test(m));
      h+='<div class="pg-cls" data-name="'+H(c.name)+'"><div class="pg-clh"><b>'+H(head)+"</b>"+(ext?"<span>"+H(ext)+"</span>":"")+"</div>"+
        (c.vars.length?'<div class="pg-clsub">static fields · one copy for the whole class</div>'+varRows(c,S,chg):"")+
        (ms.length||c.ctors?'<div class="pg-ms"><span>'+(c.ctors?c.ctors+" constructor"+(c.ctors>1?"s":"")+(ms.length?" · ":""):"")+"</span>"+ms.map(m=>"<code>"+H(m)+"</code>").join(" ")+"</div>":"")+"</div>";}
    classesEl.innerHTML=h;}
  function varRows(f,S,chg){
    if(!f.vars.length&&!f.ret)return '<div class="pg-novars">no variables yet</div>';
    let h='<table class="pg-vars">';
    for(const v of f.vars){const key=f.id+":"+v.n;h+='<tr class="'+(chg.has(key)?"pg-chg":"")+(v.cap?" pg-cap":"")+'"><td class="pg-vn">'+H(v.n)+'</td><td class="pg-vt">'+H(v.t)+'</td><td class="pg-vv">'+varVal(v.v,S,key)+"</td></tr>";}
    if(f.ret&&f.ret.p!=="void")h+='<tr class="pg-ret"><td class="pg-vn">return</td><td class="pg-vt"></td><td class="pg-vv">'+varVal(f.ret,S,f.id+":return")+"</td></tr>";
    else if(f.ret)h+='<tr class="pg-ret"><td class="pg-vn">return</td><td class="pg-vt"></td><td class="pg-vv pg-dim">void</td></tr>';
    return h+"</table>";}
  /* ---------- DSA views (Phase 2): index markers, ranges, swaps, bars, grids, characters, bits, intervals ---------- */
  const INTP=new Set(["int","short","byte","long"]),BITP=new Set(["int","short","byte","long","char"]),NUMP=new Set(["int","long","short","byte","double","float"]);
  const PAIRS=[["lo","hi"],["low","high"],["left","right"],["l","r"],["start","end"]];
  const ASL={astack:"Stack",cells:"Cells",bars:"Bars",grid:"Grid",intervals:"Intervals",chars:"Characters",text:"Text",stack:"Stack",queue:"Queue",chain:"Chain",tree:"Tree",boxes:"Boxes",entries:"Entries",buckets:"Buckets",graph:"Graph",lists:"Lists",forest:"Forest",seg:"Segment tree",fenwick:"Fenwick"};
  const STACKM=["push/1","pop"],QUEUEM=["offer/1","poll","peek","element","remove","offerLast/1","offerFirst/1","pollFirst","pollLast","peekFirst","peekLast","addLast/1","addFirst/1","removeFirst","removeLast"];
  const AS=new Map(),ASN=new Map(),BITC=new Map(); // "Show as" choices by object id (this run) and by kind + variable name (next runs); bits pseudo-records
  const IVN=/interval|meeting|range|merge|booking|event|slot|segment|span/i;
  /* the current method's view of the world: object id -> names pointing to it, name -> primitive value (locals, this.fields, statics) */
  function viewCtx(S){
    const fr=frameOf(S,S.step.f),by=new Map(),prims=new Map();let thisId=null;
    const scan=vars=>{for(const v of vars){if(!v.v||v.n==="this")continue;if(v.v.r!==undefined){if(!by.has(v.v.r))by.set(v.v.r,[]);by.get(v.v.r).push(v.n);}else if(!prims.has(v.n))prims.set(v.n,v.v);}};
    if(fr){scan(fr.vars);const th=fr.vars.find(v=>v.n==="this"),o=th&&th.v&&th.v.r!==undefined&&S.recs.get(th.v.r);if(o&&o.f){scan(o.f);thisId=th.v.r;}}
    for(const c of S.frames.filter(x=>x.st))scan(c.vars);
    // R3: an array held in a field of an object the method can see (s.data beside s.top): the field name and its owner
    const own=new Map();for(const oid of [thisId,...by.keys()]){const o=S.recs.get(oid);if(o&&o.k==="obj")for(const x of o.f)if(x.v&&x.v.r!==undefined&&!own.has(x.v.r)){const a=S.recs.get(x.v.r);if(a&&a.k==="arr")own.set(x.v.r,{f:x.n,o});}}
    return {by,prims,own};}
  /* an int from the method's variables, else from the fields of the object that owns this array */
  const ownInt=(C,id,n)=>{const v=intOf(C,n);if(v!==undefined)return v;const w=C.own&&C.own.get(id);const x=w&&w.o.f.find(y=>y.n===n);return x&&x.v&&INTP.has(x.v.p)?+x.v.s:undefined;};
  const namesOf=(C,id)=>{const n=C.by.get(id);if(n&&n.length)return n;const w=C.own&&C.own.get(id);return w?[w.f]:[];};
  /* R3: an array-backed stack (class name or field says stack, an int field top/size/count…): how many slots are in use and where top is */
  const STKN=/stack|stk/i,TOPN=/^(top|size|sz|count|cnt|n|sp|len)$/;
  function arrStack(id,r,C){const w=C.own&&C.own.get(id);if(!w||r.k!=="arr"||r.len>40||!(STKN.test(w.o.cls)||STKN.test(w.f)))return null;
    const t=w.o.f.find(x=>TOPN.test(x.n)&&x.v&&INTP.has(x.v.p));if(!t)return null;const v=+t.v.s,idx=t.n==="top"&&IDX.top1; // top = -1 when empty: top is the index of the top item
    const used=Math.max(0,Math.min(r.len,idx?v+1:v));return {used,top:used-1,name:w.o.cls,f:t.n};}
  const intOf=(C,n)=>{const v=C.prims.get(n);return v&&INTP.has(v.p)?+v.s:undefined;};
  const numOf=(v,S)=>{if(!v)return NaN;if(v.r!==undefined){const b=S.recs.get(v.r);return b&&b.k==="box"&&/^(Integer|Long|Short|Byte|Double|Float)$/.test(b.cls)?+b.s:NaN;}return NUMP.has(v.p)?+v.s:NaN;};
  const isGrid=(r,recs)=>r&&(r.k==="arr"&&/\[\]$/.test(r.et)||r.k==="list")&&r.a.length>0&&r.a.length<=40&&(r.k==="arr"?r.len:r.size)===r.a.length&&
    r.a.every(v=>{const x=v&&v.r!==undefined&&recs.get(v.r);return x&&x.k==="arr"&&x.len<=40&&!/\[\]$/.test(x.et);});
  function prevPrim(n,S){if(K<1)return null;const P=JVML.state(R,K-1),f=frameOf(P,S.step.f);const v=f&&f.vars.find(x=>x.n===n);return v&&v.v&&v.v.r===undefined?v.v:null;}
  const anyName=(id,S)=>{for(const f of S.frames)for(const v of f.vars)if(v.v&&v.v.r===id)return v.n;return "";}; // a caller's name for it
  function viewOf(id,r,S,M,C){
    const nm=(C.by.get(id)||[])[0]||anyName(id,S),key=r.k+":"+(nm||""),pick=(opts,def)=>{if(!AS.has(id)&&nm)AS.set(id,ASN.get(key)||def); // the first name seen decides the default, so it stays inside other methods
      const a=AS.get(id);return {key,opts,cur:opts.includes(a)?a:def};};
    if(M.grids.has(id)){const rows=M.grids.get(id).map(x=>S.recs.get(x)),opts=["grid"];
      if(rows.every(x=>x.len===2&&x.a.every(v=>!isNaN(numOf(v,S)))))opts.push("intervals");
      const gg=GRN.test(nm||"")||EDGN.test(nm||"")?gridGraph(rows,S,nm):null;if(gg)opts.push("graph");
      const v=Object.assign(pick(opts,gg&&!gg.el&&GRN.test(nm||"")?"graph":opts[1]==="intervals"&&IVN.test(nm||"")?"intervals":"grid"),{deps:rows});
      if(v.cur==="graph"){v.gm=graphModel(gg,S,C,C.by.get(id)||(nm?[nm]:[]));v.sig=v.gm.sig;}
      return v;}
    if(M.graphs.has(id)){const g=M.graphs.get(id),map=r.k==="map",hash=map&&/^(Linked)?Hash/.test(r.cls)&&(r.cap||0)<=256;
      const v=g.ids?pick(["graph","boxes"],"graph"):pick(map?(hash?["entries","buckets","graph"]:["entries","graph"]):["graph","lists"],GRN.test(nm||"")?"graph":map?hash&&/^Hash/.test(r.cls)?"buckets":"entries":"lists");
      if(v.cur==="graph"){v.gm=graphModel(g,S,C,C.by.get(id)||(nm?[nm]:[]));v.sig=v.gm.sig;}
      return v;}
    if(M.trees.has(id)){const t=M.trees.get(id);return Object.assign(pick(["tree","boxes"],"tree"),{tm:t,sig:t.sig});}
    if((r.k==="map"||r.k==="set")&&/^Tree(Map|Set)$/.test(r.cls))return pick(["tree","entries"],"tree");
    if((r.k==="map"||r.k==="set")&&/^(Linked)?Hash(Map|Set)$/.test(r.cls)&&(r.cap||0)<=256)return pick(["entries","buckets"],/^Hash/.test(r.cls)?"buckets":"entries");
    if((r.k==="arr"||r.k==="list")&&r.a.length>1&&r.a.every(v=>!isNaN(numOf(v,S)))){const opts=["cells","bars"],ns=C.by.get(id)||(nm?[nm]:namesOf(C,id));let def=IDX.sort&&r.k==="arr"?"bars":"cells",sm=null;
      const ak=r.k==="arr"&&arrStack(id,r,C);if(ak){opts.unshift("astack");def="astack";}
      if(r.k==="arr"&&ns.some(n=>UFN.test(n))&&ufOf(r)){opts.push("forest");def="forest";}
      if(r.k==="arr"&&IDX.seg&&(sm=segModel(r,S,C,ns))){opts.push("seg");if(SEGN.test(nm||"")&&!(IDX.low&&FWN.test(nm||"")))def="seg";}
      if(r.k==="arr"&&IDX.low&&INTP.has(r.et)&&r.len>=3&&ns.some(n=>FWN.test(n))){opts.push("fenwick");def="fenwick";}
      const v=pick(opts,def);
      if(v.cur==="astack"){v.ak=ak;v.sig="ak"+ak.used;}
      else if(v.cur==="forest")v.tm=ufModel(r,S,C,ns);else if(v.cur==="seg")v.tm=sm;else if(v.cur==="fenwick")v.tm={sig:fenwickHtml(r,S,C,ns)};
      if(v.tm)v.sig=v.tm.sig;return v;}
    if(r.k==="str"&&M.chars.has(id))return pick(["chars","text"],"chars");
    if(r.k==="sb"&&r.s.length<=64)return pick(["chars","text"],(C.by.get(id)||[]).some(n=>IDX.cx.has(n))?"chars":"text");
    // stacks and queues: an ArrayDeque or LinkedList is drawn the way the program uses it (push/pop = a stack, offer/poll = a queue)
    if(r.k==="stack")return {key,opts:["stack"],cur:"stack"};
    if(r.k==="deque"||r.k==="linked"){const ns=(C.by.get(id)||[]).concat(nm?[nm]:[]),has=ms=>ns.some(n=>{const u=IDX.use.get(n);return u&&ms.some(m=>u.has(m));});
      return r.k==="deque"?pick(["stack","queue"],has(STACKM)?"stack":"queue"):pick(["chain","queue","stack"],has(STACKM)?"stack":has(QUEUEM)?"queue":"chain");}
    return null;}
  panel.addEventListener("change",e=>{const s=e.target.closest(".pg-as"),b=s&&s.closest(".pg-box");if(!b)return;AS.set(+b.dataset.id,s.value);if(b._vw&&b._vw.key.slice(-1)!==":")ASN.set(b._vw.key,s.value);if(R&&R.steps.length)render();});
  /* two cells of one array or list exchanged their values over the last few steps, and the last line finished it */
  function swapOf(id,r,chg){
    if(!r.a||![...chg].some(k=>k.startsWith("h"+id+":")))return null;
    const cur=r.a.map(sig);
    for(let j=K-1,n=0;j>=0&&n<8;j--,n++){const o=JVML.state(R,j).recs.get(id);if(!o||!o.a||o.a.length!==cur.length)return null;
      const d=[];for(let i=0;i<cur.length&&d.length<3;i++)if(sig(o.a[i])!==cur[i])d.push(i);
      if(d.length>2)return null;if(d.length===2&&sig(o.a[d[0]])===cur[d[1]]&&sig(o.a[d[1]])===cur[d[0]])return d;}
    return null;}
  /* per step: pointer markers under the cells (variables the program uses as indexes of this array/String/List, plus lo/hi-style pairs),
     the lo..hi range shaded, the cells at a marker outlined, a finished swap animated; grids get row/column markers */
  function decorate(el,id,r,S,C,M,vw,chg){
    const names=namesOf(C,id);
    if(vw&&vw.cur==="astack"){stackMarks(el,vw);return;}
    // trees glide to their new shape; what the last line added stays lit only on that step
    if(vw&&/^(tree|forest|seg)$/.test(vw.cur)||r.k==="pq"){flipTree(el);if(el._bk!==K)for(const g of qa(".pg-tn.hot",el))g.classList.remove("hot");return;}
    if(vw&&vw.cur==="buckets"){if(el._bk!==K)for(const c of qa(".pg-bkc.new",el))c.classList.remove("new");return;}
    if(vw&&(vw.cur==="stack"||vw.cur==="queue")){sqMarks(el,id,r,S,C,vw.cur);return;}
    if(vw&&(vw.cur==="graph"||vw.cur==="fenwick"))return;
    if(IDX.dp.size&&(M.grids.has(id)?vw&&vw.cur==="grid":r.k==="arr"&&!(vw&&vw.cur==="bars")))dpArrows(el,id,S,C,M,chg);
    if(M.grids.has(id)){gridMarks(el,names,C,vw);return;}
    const chars=vw&&vw.cur==="chars";if(!(r.k==="arr"||r.k==="list"||chars))return;
    const len=r.k==="arr"?r.len:r.k==="list"?r.size:r.s.length;
    const want=new Set();let hasIx=false;
    for(const n of names)for(const m of [IDX.ix.get(n),IDX.cx.get(n)])if(m){hasIx=true;m[0].forEach(x=>want.add(x));}
    let rng=null;
    if(hasIx)for(const [a,b] of PAIRS){const va=ownInt(C,id,a),vb=ownInt(C,id,b);if(va!==undefined&&vb!==undefined){want.add(a);want.add(b);if(!rng)rng=[va,vb];}}
    const marks=[];for(const n of want){const v=ownInt(C,id,n);if(v!==undefined&&v>=0&&v<=len)marks.push([n,v]);}
    marks.sort((a,b)=>a[1]-b[1]||(a[0]<b[0]?-1:1));
    // R3: the cells the condition on this line compares (a[j] > a[j + 1]), from the variables' values now
    const cmp=[];const cs=S.ev==="line"&&(S.step.sn||IDX.byLine.get(S.line));
    if(cs&&cs.c&&/^(If|While|For|Do)$/.test(cs.k)&&window.PGVZ&&PGVZ.ixReads)for(const n of names)for(const e of PGVZ.ixReads(cs.c,n)){const i=PGVZ.ixEval(e.i,x=>ownInt(C,id,x),()=>undefined);if(i!==undefined&&i>=0&&i<len&&!cmp.includes(i))cmp.push(i);}
    const sw=swapOf(id,r,chg),mk=JSON.stringify([marks,rng,sw,hasIx,cmp]);
    if(mk===el._mk)return;el._mk=mk;
    const wrap=q(".pg-cells",el);if(!wrap)return;
    const cells=qa(":scope>.pg-cell:not(.pg-cmore)",wrap),at=new Set(marks.map(m=>m[1]));
    { const t=q(".pg-gtag.cmp",el);if(t)t.remove();if(cmp.length===2&&!sw)el.insertAdjacentHTML("afterbegin",'<span class="pg-gtag cmp">compare ['+cmp[0]+"] and ["+cmp[1]+"]</span>"); }
    cells.forEach((c,i)=>{c.classList.toggle("pg-cmp",cmp.includes(i));c.classList.toggle("pg-at",at.has(i));c.classList.toggle("pg-in",!!rng&&i>=rng[0]&&i<=rng[1]);c.classList.toggle("pg-out",!!rng&&(i<rng[0]||i>rng[1]));c.classList.remove("pg-swc");});
    wrap.classList.toggle("pg-ixw",hasIx);
    if(!el._ixm)el._ixm=new Map();
    const stack=new Map(),live=new Set();let lines=hasIx?1:0;
    for(const [n,v] of marks){const c=cells[Math.min(v,cells.length-1)];if(!c||v>cells.length)continue;
      const row=stack.get(v)||0;stack.set(v,row+1);lines=Math.max(lines,Math.min(row+1,3));
      let m=el._ixm.get(n),fresh=false;if(!m){m=document.createElement("span");m.className="pg-ixm";m.textContent=n;m.style.setProperty("--ic",IXC[[...n].reduce((h,ch)=>h*31+ch.charCodeAt(0)>>>0,7)%IXC.length]);wrap.appendChild(m);el._ixm.set(n,m);fresh=true;}
      const x=v<cells.length?c.offsetLeft+c.offsetWidth/2:c.offsetLeft+c.offsetWidth+12,y=c.offsetTop+c.offsetHeight+4+Math.min(row,2)*19;
      if(fresh)m.style.transition="none";m.style.left=x+"px";m.style.top=y+"px";m.classList.toggle("past",v>=cells.length);
      if(fresh){void m.offsetWidth;m.style.transition="";}live.add(n);}
    for(const [n,m] of el._ixm)if(!live.has(n)){m.remove();el._ixm.delete(n);}
    const pad=lines?(8+lines*19)+"px":"";if(wrap.style.paddingBottom!==pad){wrap.style.paddingBottom=pad;el._w=0;}
    const t=q(".pg-gtag.sw",el);if(t)t.remove();
    if(sw){const a=cells[sw[0]],b=cells[sw[1]];el.insertAdjacentHTML("afterbegin",'<span class="pg-gtag sw">swap ['+sw[0]+"] ⇄ ["+sw[1]+"]</span>");
      if(a&&b){a.classList.add("pg-swc");b.classList.add("pg-swc");
        if(!still&&a.animate){const dx=b.offsetLeft-a.offsetLeft,dy=b.offsetTop-a.offsetTop,lift=Math.min(34,12+Math.abs(dx)/8),o={duration:620,easing:"cubic-bezier(.45,.05,.25,1)"}; // v8: an arc, one over and one under
          a.animate([{transform:"translate("+dx+"px,"+dy+"px)",zIndex:2},{transform:"translate("+dx/2+"px,"+(dy/2-lift)+"px) scale(1.06)",zIndex:2,offset:.5},{transform:"none",zIndex:2}],o);b.animate([{transform:"translate("+(-dx)+"px,"+(-dy)+"px)"},{transform:"translate("+(-dx/2)+"px,"+(-dy/2+lift)+"px) scale(.96)",offset:.5},{transform:"none"}],o);}}}}
  function gridMarks(el,names,C,vw){
    const rs=new Map(),cs=new Map(),add=(m,n,v)=>{if(!m.has(v))m.set(v,[]);m.get(v).push(n);};
    for(const n of names){const a=IDX.ix.get(n);if(!a)continue;for(const x of a[0]){const v=intOf(C,x);if(v!==undefined)add(rs,x,v);}for(const x of a[1]){const v=intOf(C,x);if(v!==undefined)add(cs,x,v);}}
    const mk=JSON.stringify([[...rs],[...cs],vw&&vw.cur]);if(mk===el._mk)return;el._mk=mk;
    if(vw&&vw.cur==="intervals"){for(const row of qa(".pg-ivr[data-r]",el)){const i=+row.dataset.r;row.classList.toggle("pg-at",rs.has(i));row.querySelector(".pg-ivi").textContent=rs.has(i)?rs.get(i).join(",")+"→"+i:i;}return;}
    for(const tr of qa("tr[data-r]",el)){const i=+tr.dataset.r;tr.querySelector(".pg-gm").textContent=(rs.get(i)||[]).join(",");tr.classList.toggle("pg-row",rs.has(i));}
    for(const th of qa("th[data-c]",el))th.querySelector(".pg-gm").textContent=(cs.get(+th.dataset.c)||[]).join(",");
    for(const td of qa("td[data-c]",el)){const i=+td.parentNode.dataset.r,j=+td.dataset.c;td.classList.toggle("pg-col",cs.has(j));td.classList.toggle("pg-at",rs.has(i)&&cs.has(j));}}
  /* stacks and queues, per step: the value each index points to (temps[st.peek()] → "temps[3] = 71"), the monotonic order,
     and what the last line pushed (slides in) or popped (a fading ghost at the end it left from) */
  function sqMarks(el,id,r,S,C,cur){
    const names=C.by.get(id)||[],stk=cur==="stack",rev=r.k==="stack"; // java.util.Stack keeps its top last; ArrayDeque/LinkedList push at the front
    let arr=null,an="";
    for(const n of names)for(const a of IDX.via.get(n)||[])if(!arr)for(const [oid,ns] of C.by)if(ns.includes(a)){const x=S.recs.get(oid);if(x&&x.k==="arr"){arr=x;an=a;break;}}
    const at=v=>{const i=numOf(v,S);return {i,m:arr&&Number.isInteger(i)&&i>=0&&i<arr.a.length?arr.a[i]:undefined};};
    const nat=r.a.map(at),seq=(stk&&!rev?nat.slice().reverse():nat).map(x=>arr?numOf(x.m,S):x.i); // bottom → top, or front → back
    let dir="";if(seq.length>1&&seq.every(x=>!isNaN(x))){const ok=f=>seq.every((x,i)=>!i||f(seq[i-1],x));dir=ok((a,b)=>a<b)?"↑ increasing":ok((a,b)=>a<=b)?"↑ non-decreasing":ok((a,b)=>a>b)?"↓ decreasing":ok((a,b)=>a>=b)?"↓ non-increasing":"";}
    const mono=names.some(n=>IDX.mono.has(n))?(stk?"monotonic stack":"monotonic queue")+(dir?" · "+(an||"values")+" "+dir+(stk?" from bottom to top":" from front to back"):""):"";
    // what the last line did: one element added or removed at either end
    let ch=null;const P=K>0?JVML.state(R,K-1).recs.get(id):null;
    if(P&&P!==r&&P.a){const O=P.a.map(sig),N=r.a.map(sig),eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
      if(N.length===O.length+1){if(eq(N.slice(1),O))ch={add:0};else if(eq(N.slice(0,-1),O))ch={add:N.length-1};}
      else if(O.length===N.length+1){if(eq(O.slice(1),N))ch={rm:0,v:P.a[0]};else if(eq(O.slice(0,-1),N))ch={rm:O.length-1,v:P.a[O.length-1]};}}
    const flip=rev&&stk,shown=flip?nat.slice().reverse():nat,disp=i=>flip?r.a.length-1-i:i; // natural index → drawn position
    const mk=JSON.stringify([nat.map(x=>x.m?sig(x.m):""),mono,ch&&[ch.add,ch.rm],K]);if(mk===el._mk)return;el._mk=mk;el._w=0;
    const wrap=q(".pg-sq",el);if(!wrap)return;
    for(const g of qa(".pg-ghost",wrap))g.remove();
    const items=qa(".pg-sqi:not(.pg-cmore)",wrap),fm=x=>x.m===undefined?"":an+"["+x.i+"] = "+valTxt(x.m,S);
    items.forEach((it,j)=>{const t=q(".pg-sqm",it);if(t)t.textContent=fm(shown[j]||{});it.classList.remove("pg-push","l","r");});
    let mt=q(".pg-mtag",el);if(mono){if(!mt){q(".pg-bh",el).insertAdjacentHTML("afterend",'<div class="pg-mtag"></div>');mt=q(".pg-mtag",el);}mt.textContent=mono;}else if(mt)mt.remove();
    if(!ch)return;
    if(ch.add!==undefined){const p=disp(ch.add),it=items[p];if(it){it.classList.add("pg-push");if(!stk)it.classList.add(p===0?"l":"r");}return;}
    const p=disp(ch.rm),first=p===0,g=document.createElement("div");
    g.className="pg-sqi pg-ghost"+(stk?" up":first?" l":" r");
    g.innerHTML='<b class="pg-sqv">'+cellVal(ch.v,S)+'</b><span class="pg-sqm">'+H(fm(at(ch.v)))+'</span><span class="pg-sqe">'+(stk?"popped":"removed")+"</span>";
    const em=q(".pg-novars",wrap);if(em)em.remove();
    if(first)wrap.insertBefore(g,wrap.firstChild);else wrap.appendChild(g);}
  /* ---------- DSA views (Phase 4): trees (binary, AVL, n-ary, trie) as one picture, heaps, hash buckets, red-black TreeMap/TreeSet ---------- */
  const PARF=/^(parent|par|up|next|prev\w*)$/i,ENDF=/^(is)?(end|word|leaf|terminal|eow|endofword)$/i,HTF=/^(height|ht|h)$/i;
  function touchedOf(S){if(!S._tch){const s=new Set();for(const k of S.changed)if(k[0]==="h"){const i=k.indexOf(":");s.add(+(i<0?k.slice(1):k.slice(1,i)));}S._tch=s;}return S._tch;}
  function plain(v,S,leaf){ // short text for a tree node, heap item or bucket entry (leaf: only numbers, chars, booleans, Strings)
    if(v===null||v===undefined)return leaf?null:"null";
    if(v.r===undefined)return v.p==="char"?"'"+v.s+"'":v.s;
    const r=S.recs.get(v.r);if(!r)return null;
    if(r.k==="str")return '"'+(r.s.length>14?r.s.slice(0,14)+"…":r.s)+'"';if(r.k==="box")return r.cls==="Character"?"'"+r.s+"'":r.s;
    if(leaf)return null;
    if(r.k==="arr"&&r.len<=4&&r.a.every(x=>x&&x.r===undefined))return "["+r.a.map(x=>x.s).join(",")+"]";
    if(r.k==="obj"){const x=r.f.find(y=>y.v&&y.v.r===undefined);return x?x.v.s:r.cls;}
    return r.cls||r.k;}
  /* the children of a tree node: 2+ self-typed fields (left/right; parent/next/prev are not children) = binary;
     a field holding an array, List, Set or Map of its own class = n-ary (a trie's TrieNode[26] gives the letters a..z) */
  function treeKids(r,S){
    if(!r||r.k!=="obj"||r.ex||r.en!==undefined)return null;
    const sf=r.f.filter(x=>x.self&&!PARF.test(x.n));
    if(sf.length>=2)return {bin:sf.length===2,ks:sf.map(x=>({v:x.v}))};
    for(const x of r.f){if(!x.v||x.v.r===undefined||!x.t)continue;
      const m=x.t.match(/^(\w+)\[\]$/)||x.t.match(/^\w*(?:List|Collection|Set)<(\w+)>$/)||x.t.match(/^\w*Map<\w+,\s*(\w+)>$/);
      if(!m||m[1]!==r.cls)continue;const c=S.recs.get(x.v.r);if(!c)continue;
      if(c.k==="arr")return {box:c.id,ks:c.a.map((v,i)=>v?{v,e:c.len===26?String.fromCharCode(97+i):c.len>=128&&c.len<=256&&i>32&&i<127?String.fromCharCode(i):String(i)}:null).filter(Boolean)};
      if(c.k==="list"||c.k==="linked"||c.k==="set")return {box:c.id,ks:c.a.filter(Boolean).map(v=>({v}))};
      if(c.k==="map")return {box:c.id,ks:c.e.filter(e=>e[1]).map(e=>({v:e[1],e:String(plain(e[0],S)).replace(/^'(.*)'$/,"$1")}))};}
    return null;}
  function nodeLabel(r,S){let t=null,end=false;const sub=[];
    for(const x of r.f){if(x.self)continue;const v=x.v;
      if(v&&v.p==="boolean"&&ENDF.test(x.n)){end=v.s==="true";continue;}
      const s=plain(v,S,true);if(s===null)continue;
      if(t===null&&!HTF.test(x.n))t=s;else if(sub.length<2)sub.push(HTF.test(x.n)?"h"+s:x.n+"="+s);}
    return {t,end,sub:sub.join(" ")};}
  /* Memory off: every tree of user objects becomes one picture in its root's box; the other nodes (and a trie's child arrays) get no box */
  function treesOf(S,C,order){
    const kids=new Map(),child=new Set(),trees=new Map(),inTree=new Map();
    for(const id of order){const tk=treeKids(S.recs.get(id),S);if(tk){kids.set(id,tk);for(const c of tk.ks)if(c.v&&c.v.r!==undefined)child.add(c.v.r);}}
    for(const [root] of kids){if(child.has(root))continue;const m=treeModel(root,S,C,kids);if(!m)continue;
      trees.set(root,m);if(AS.get(root)==="boxes")continue;for(const id of m.ids)if(id!==root)inTree.set(id,root);}
    /* graphs of objects (2026-11-04): nodes whose child list/array is not a tree (a Node with a neighbors list that has cycles or
       shared nodes) become one graph per connected group, drawn in the box of the node a variable reaches first (≤ 30 nodes) */
    const inT=new Set();for(const [r,m] of trees){inT.add(r);for(const id of m.ids)inT.add(id);}
    const free=new Set([...kids.keys()].filter(id=>!inT.has(id)&&kids.get(id).box!=null)),nb=new Map(),objG=new Map(),seen=new Set();
    const link=(a,b)=>{if(!nb.has(a))nb.set(a,new Set());nb.get(a).add(b);};
    for(const id of free)for(const c of kids.get(id).ks){const t=c.v&&c.v.r;if(free.has(t)){link(id,t);link(t,id);}}
    for(const start of order){if(!free.has(start)||seen.has(start))continue;const comp=[],st=[start];seen.add(start);
      while(st.length){const id=st.pop();comp.push(id);for(const t of nb.get(id)||[])if(!seen.has(t)){seen.add(t);st.push(t);}}
      if(comp.length<2||comp.length>30)continue;
      const pos=new Map(order.map((id,i)=>[id,i]));comp.sort((a,b)=>(a===start?-1:b===start?1:(pos.get(a)??1e9)-(pos.get(b)??1e9)));
      const at=new Map(comp.map((id,i)=>[id,i]));
      objG.set(start,{n:comp.length,ids:comp,rows:comp.concat(comp.map(id=>kids.get(id).box)),
        out:comp.map(id=>kids.get(id).ks.map(c=>c.v&&c.v.r).filter(t=>at.has(t)).map(t=>({to:at.get(t)}))),
        labels:comp.map(id=>{const L=nodeLabel(S.recs.get(id),S);return L.t!=null?String(L.t).replace(/^"(.*)"$/,"$1"):"#"+id;})});}
    return {trees,inTree,objG};}
  function treeModel(root,S,C,kids){
    const T={nodes:[],root:0,bin:true},at=new Set(),ids=new Set(),tch=touchedOf(S);let ok=true;
    const build=id=>{if(at.has(id)||T.nodes.length>=255){ok=false;return -1;} // shared or cyclic: a graph, not a tree
      at.add(id);ids.add(id);const r=S.recs.get(id),tk=kids.get(id)||treeKids(r,S),i=T.nodes.length;
      const n={k:"o"+id,r,kids:[],el:[],tags:(C.by.get(id)||[]).slice(0,3),hot:tch.has(id)};T.nodes.push(n);
      if(!tk)return i;if(!tk.bin)T.bin=false;if(tk.box!=null){ids.add(tk.box);if(tch.has(tk.box))n.hot=true;}
      for(const c of tk.ks){const cr=c.v&&c.v.r!==undefined?S.recs.get(c.v.r):null;
        if(!cr||cr.k!=="obj"){if(tk.bin){n.kids.push(-1);n.el.push("");}continue;}
        n.kids.push(build(c.v.r));n.el.push(c.e||"");}
      return i;};
    build(root);if(!ok)return null;
    const N=T.nodes,ht=[],hOf=i=>i<0?0:ht[i]??(ht[i]=1+Math.max(0,...N[i].kids.map(hOf)));
    const avl=T.bin&&N[0].r.f.some(x=>HTF.test(x.n)&&x.v&&x.v.r===undefined);let bal=true;
    N.forEach((n,i)=>{const L=nodeLabel(n.r,S);n.t=L.t??"";n.s=L.sub;if(L.end)n.c="end";
      if(T.bin){const bf=hOf(n.kids[0]??-1)-hOf(n.kids[1]??-1);if(Math.abs(bf)>1)bal=false;
        if(avl){n.s=(n.s?n.s+" · ":"")+"bf "+(bf>0?"+":"")+bf;if(Math.abs(bf)>1)n.c="bad";}}});
    let info=N.length+" node"+(N.length>1?"s":"")+" · height "+hOf(0);
    if(T.bin){const io=[],w=i=>{if(i<0)return;w(N[i].kids[0]??-1);io.push(N[i].t);w(N[i].kids[1]??-1);};w(0);
      const nums=io.every(t=>t!==""&&!isNaN(+t)),vals=nums?io.map(Number):io,sorted=vals.every((v,i)=>!i||vals[i-1]<v);
      info="binary tree · "+info+(io.length>1&&(nums||io.every(t=>/^"/.test(t)))?sorted?" · a BST: in-order is sorted":" · not a BST: in-order is not sorted":"")+(N.length>2?bal?" · balanced":" · not balanced (a side is 2+ levels deeper)":"");}
    else if(N.some(n=>n.el.some(Boolean))){const words=[],w=(i,p)=>{const n=N[i];if(n.c==="end")words.push(p);n.kids.forEach((c,j)=>{if(c>=0)w(c,p+(n.el[j]||""));});};w(0,"");
      info="trie · "+info+" · "+words.length+" word"+(words.length===1?"":"s")+(words.length?": "+words.slice(0,8).join(", ")+(words.length>8?", …":""):"");
      for(const n of N)n.kids.forEach((c,j)=>{if(c>=0&&N[c].t===""&&n.el[j]){N[c].t=n.el[j];n.el[j]="";}});} // a trie draws each letter inside its node
    else info="tree · "+info;
    // R3: the comparison this line makes against a named node (v < node.val → "60 < 50 ✗"), from the next step's condition record
    const nx=K+1<R.steps.length?R.steps[K+1]:null,cps=S.ev==="line"&&nx&&nx.cd&&nx.cd.p||[];
    if(cps.length)for(const n of N)for(const t of n.tags){const p=cps.find(x=>new RegExp("\\b"+t.replace(/\W/g,"")+"\\.\\w").test(x[0]));if(p&&!n.cmp)n.cmp=p[1]+" "+p[2]+" "+p[3]+" → "+(p[4]?"true":"false");}
    const sg=JSON.stringify(N.map(n=>[n.k,n.t,n.s,n.c,n.tags,n.hot,n.kids,n.el,n.cmp]));
    return {T,ids,info,sig:sg};}
  /* TreeMap/TreeSet: the red-black tree jvm-lite keeps beside the sorted entries (the JDK's own insert/delete fix-ups) */
  function rbModel(r,S){const rb=r.rb,map=r.k==="map",key=i=>map?r.e[i][0]:r.a[i];
    const P=K>0?JVML.state(R,K-1).recs.get(r.id):null,old=new Map(),fresh=P&&P!==r&&P.k===r.k;
    if(fresh)(map?P.e.map(e=>[sig(e[0]),sig(e[1])]):P.a.map(v=>[sig(v),""])).forEach(([a,b])=>old.set(a,b));
    const nodes=[];for(let i=0;i<rb.l.length;i++){const ks=sig(key(i)),vs=map?sig(r.e[i][1]):"";
      nodes.push({k:"k"+ks,t:plain(key(i),S),s:map?"→ "+plain(r.e[i][1],S):"",c:rb.red[i]?"red":"black",kids:[rb.l[i],rb.r[i]],el:[],hot:!!fresh&&(!old.has(ks)||old.get(ks)!==vs)});}
    let bh=0;for(let i=rb.t;i>=0;i=rb.l[i])if(!rb.red[i])bh++;
    const hg=i=>i<0?0:1+Math.max(hg(rb.l[i]),hg(rb.r[i]));
    return {T:{nodes,root:rb.t,bin:true},info:"red-black tree · height "+hg(rb.t)+" · "+bh+" black node"+(bh>1?"s":"")+" on every path down · a red node never has a red child"};}
  /* PriorityQueue: the array is a binary heap, the children of [i] are [2i+1] and [2i+2] */
  function pqModel(r,S){const P=K>0?JVML.state(R,K-1).recs.get(r.id):null,cnt=new Map(),n=r.a.length,nodes=[];
    r.a.forEach((v,i)=>{const s=sig(v),c=cnt.get(s)||0;cnt.set(s,c+1);
      nodes.push({k:"v"+s+"#"+c,t:plain(v,S),s:"["+i+"]",kids:[2*i+1<n?2*i+1:-1,2*i+2<n?2*i+2:-1],el:[],hot:!!P&&P!==r&&!!P.a&&(!P.a[i]||sig(P.a[i])!==s)});});
    const nums=r.a.map(v=>numOf(v,S)),ok=f=>nums.every((x,i)=>!i||f(nums[(i-1)>>1],x));
    const kind=n>1&&nums.every(x=>!isNaN(x))?ok((p,c)=>p<=c)?"min-heap: every parent ≤ its children, so the smallest is on top":ok((p,c)=>p>=c)?"max-heap: every parent ≥ its children, so the largest is on top":"":"a binary heap: the head [0] comes first by the comparator";
    return {T:{nodes,root:n?0:-1,bin:true},kind};}
  function treeBox(r,S,vw){
    if(r.k==="obj"){const m=vw.tm;return '<div class="pg-bh">'+H(r.cls)+' <small>tree</small></div><div class="pg-ttag">'+H(m.info)+"</div>"+PGVZ.treeHtml(m.T);}
    const head='<div class="pg-bh">'+H(r.cls)+" <small>size "+r.size+"</small></div>";
    if(!r.rb)return head+'<div class="pg-novars">'+(r.size?"too big to draw as a tree":"empty")+"</div>";
    const m=rbModel(r,S);return head+'<div class="pg-ttag">'+H(m.info)+"</div>"+PGVZ.treeHtml(m.T);}
  /* HashMap/HashSet: the table's buckets (index = hash & (capacity − 1)), collisions chained, a resize called out */
  const plainKey=(v,S)=>{const t=cellVal(v,S).replace(/<[^>]*>/g,"");return t.replace(/&quot;/g,'"').replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");};
  function bucketsHtml(r,S){
    const map=r.k==="map",cap=r.cap||0,items=map?r.e.map(e=>({k:e[0],v:e[1],b:e[2],h:e[3]})):r.a.map((k,i)=>({k,b:r.b&&r.b[i],h:r.hs&&r.hs[i]}));
    const P=K>0?JVML.state(R,K-1).recs.get(r.id):null,fresh=P&&P!==r&&P.k===r.k,old=fresh?new Set((map?P.e.map(e=>e[0]):P.a).map(sig)):null;
    const by=new Map();for(const it of items){if(!by.has(it.b))by.set(it.b,[]);by.get(it.b).push(it);}
    // R3: the entry this step added or changed, with the hash → bucket arithmetic spelled out
    const ov=fresh&&map?new Map(P.e.map(e=>[sig(e[0]),sig(e[1])])):null;
    const cur=fresh?items.find(it=>!old.has(sig(it.k))||ov&&ov.get(sig(it.k))!==sig(it.v)):null;
    const rib=cur&&cur.h!==undefined&&cur.h!==null&&cap?'<div class="pg-hrib"><code>hash('+H(plainKey(cur.k,S))+")</code> = "+cur.h+" → <code>"+cur.h+" &amp; "+(cap-1)+"</code> = <b>bucket ["+cur.b+"]</b> · "+(old.has(sig(cur.k))?"same key: the value is replaced":"new key"+((by.get(cur.b)||[]).length>1?", it joins the chain":""))+"</div>":"";
    let h="",run=-1;
    const flush=j=>{if(run<0)return;h+='<div class="pg-bkr e"><i>['+(j-1>run?run+"–"+(j-1):run)+"]</i><span>empty</span></div>";run=-1;};
    for(let j=0;j<cap;j++){const its=by.get(j);if(!its){if(run<0)run=j;continue;}flush(j);
      h+='<div class="pg-bkr'+(cur&&cur.b===j?" on":"")+'"><i>['+j+"]</i>"+its.map(it=>'<span class="pg-bkc'+(old&&!old.has(sig(it.k))?" new":"")+(it===cur?" cur":"")+'" title="hash '+it.h+" → "+it.h+" & "+(cap-1)+" = bucket "+j+'">'+cellVal(it.k,S)+(map?'<span class="pg-ar">=</span>'+cellVal(it.v,S):"")+"</span>").join('<span class="pg-bkl" title="next entry in this bucket">→</span>')+
        (its.length>1?'<span class="pg-bkx">collision · '+its.length+" in one bucket</span>":"")+"</div>";}
    flush(cap);
    const rs=fresh&&P.cap&&cap&&P.cap!==cap?'<div class="pg-mtag">resized: table '+P.cap+" → "+cap+", every key moved to bucket hash & "+(cap-1)+"</div>":"";
    return '<div class="pg-bh">'+H(r.cls)+" <small>size "+r.size+(cap?" · table "+cap+" · grows after "+Math.floor(cap*0.75)+" entries":"")+"</small></div>"+rs+rib+
      (cap?'<div class="pg-bks">'+h+"</div>":'<div class="pg-novars">empty: the table is made on the first '+(map?"put":"add")+"</div>");}
  /* after a rebuild, nodes glide from where they were (rotations, sift-up, a new level) and new nodes fade in */
  function flipTree(el){
    const svg=q("svg.pg-tree",el);if(!svg||svg===el._tsv)return;el._tsv=svg;
    const old=el._tp||new Map(),now=new Map();let moved=false;
    for(const g of qa("g[data-tk]",svg)){const m=g.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);if(!m)continue;
      const p=[+m[1],+m[2]],o=old.get(g.dataset.tk);now.set(g.dataset.tk,p);if(still)continue;
      if(!o){if(old.size)g.classList.add("pg-tnew");continue;}
      if((o[0]!==p[0]||o[1]!==p[1])&&g.animate){moved=true;g.animate([{transform:"translate("+o[0]+"px,"+o[1]+"px)"},{transform:g.style.transform}],{duration:480,easing:"cubic-bezier(.3,.7,.3,1)"});}}
    if(moved)q(".pg-te",svg).classList.add("pg-tfade");
    el._tp=now;}
  /* ---------- DSA views (Phase 5): graphs, Union-Find forests, segment and Fenwick trees, DP arrows, the recursion call tree ---------- */
  const GRN=/adj|graph|^g$|nei|nbr|edge|conn|road|flight|prereq|course|depend/i,EDGN=/edge|pair|road|conn|flight|link/i,UFN=/^(parent|parents|par|root|roots|uf|leader|fa|father|boss)$/i,
    SEGN=/^(seg\w*|st|tree|t|segment\w*)$/i,FWN=/^(bit|fen\w*|ft|fw|tree)$/i,VISN=/visit|seen|^vis$|used|marked/i,COLN=/^(colou?rs?|state|states|status)$/i,
    DISTN=/dist|^d$|cost|hops?$|level|depth|indeg|time|^low$|disc/i,RANKN=/^(rank|ranks|size|sizes|sz|height|cnt|count)$/i;
  const INF=x=>x>=2147483647||x<=-2147483648||Math.abs(x)>=1e15;
  const chosen=(id,r,nm,def)=>AS.get(id)||ASN.get(r.k+":"+(nm||""))||def; // the view heapModel must plan for (viewOf's pick decides the same way)
  /* one adjacency entry: an int, an int[] {to, weight}, or an edge object (to/v/dest… and w/weight/cost…) */
  function edgeTo(v,S){
    const x=numOf(v,S);if(Number.isInteger(x))return {to:x};
    const o=v&&v.r!==undefined&&S.recs.get(v.r);if(!o)return null;
    if(o.k==="arr"&&o.a.length&&o.a.length<=3){const t=numOf(o.a[0],S),w=o.a.length>1?numOf(o.a[1],S):NaN;return Number.isInteger(t)?{to:t,w:isNaN(w)?undefined:w}:null;}
    if(o.k==="obj"){const ns=o.f.filter(f=>!isNaN(numOf(f.v,S))),t=ns.find(f=>/^(to|v|dest|dst|target|node|end)$/i.test(f.n))||ns[0],w=ns.find(f=>f!==t&&/^(w|wt|weight|cost|dist|len|time)$/i.test(f.n));
      return t?{to:numOf(t.v,S),w:w?numOf(w.v,S):undefined}:null;}
    return null;}
  /* an array or List of Lists: entry i holds the neighbours of node i */
  function adjOf(r,S){
    if(!(r.k==="arr"||r.k==="list")||!r.a.length||r.a.length>30||(r.k==="arr"?r.len:r.size)!==r.a.length)return null;
    const n=r.a.length,out=[],rows=[];
    for(const v of r.a){const x=v&&v.r!==undefined&&S.recs.get(v.r);if(!x||!/^(list|linked|set)$/.test(x.k)||x.a.length>60)return null;rows.push(x.id);
      const es=x.a.map(y=>edgeTo(y,S));if(es.some(e=>!e||!Number.isInteger(e.to)||e.to<0||e.to>=n))return null;out.push(es);}
    return {n,out,rows};}
  /* a Map from a node to the List/Set of its neighbours (keys may be Strings) */
  function mapAdj(r,S){
    if(r.k!=="map"||!r.e.length||r.e.length>30)return null;
    const keys=[],at=new Map(),add=v=>{const s=plain(v,S,true);if(s===null)return -1;if(!at.has(s)){at.set(s,keys.length);keys.push(v);}return at.get(s);};
    const lists=[];for(const e of r.e){if(add(e[0])<0)return null;const x=e[1]&&e[1].r!==undefined&&S.recs.get(e[1].r);if(!x||!/^(list|linked|set)$/.test(x.k)||x.a.length>60)return null;lists.push(x);}
    const out=[];for(let i=0;i<r.e.length;i++){const es=[];for(const v of lists[i].a){const t=add(v);if(t<0)return null;es.push({to:t});}out[at.get(plain(r.e[i][0],S,true))]=es;}
    if(keys.length>30)return null;for(let i=0;i<keys.length;i++)if(!out[i])out[i]=[];
    return {n:keys.length,out,keys,rows:lists.map(x=>x.id)};}
  /* an int[][]: an adjacency matrix (square, 0/1 or weights), an edge list ({a, b} or {a, b, w} rows), or neighbour lists */
  function gridGraph(rows,S,nm){
    const n=rows.length,val=v=>v&&v.p==="boolean"?(v.s==="true"?1:0):numOf(v,S),vals=rows.map(x=>x.a.map(val));
    if(vals.some(r=>r.some(isNaN)))return null;
    if(n>=2&&n<=20&&vals.every(r=>r.length===n)&&!EDGN.test(nm||"")){const wt=vals.some(r=>r.some(y=>y!==0&&y!==1&&!INF(y)));
      return {n,out:vals.map(r=>{const es=[];r.forEach((x,j)=>{if(x&&!INF(x))es.push({to:j,w:wt?x:undefined});});return es;}),mat:1};}
    if(!vals.every(r=>r.every(x=>Number.isInteger(x)&&x>=0)))return null;
    const mx=Math.max(-1,...vals.map(r=>Math.max(-1,...r)));
    if(vals.every(r=>r.length===2||r.length===3)&&(EDGN.test(nm||"")||mx>=n)){if(mx+1>30)return null;const out=Array.from({length:mx+1},()=>[]);for(const r of vals)out[r[0]].push({to:r[1],w:r[2]});return {n:mx+1,out,el:1};}
    return mx<n&&n<=30?{n,out:vals.map(r=>r.map(to=>({to})))}:null;}
  const tagMap=()=>{const m=new Map();m.put=(i,nm)=>{if(!m.has(i))m.set(i,[]);if(!m.get(i).includes(nm))m.get(i).push(nm);};return m;};
  function valOfName(C,x){const v=C.prims.get(x);if(v)return v;for(const [id,ns] of C.by)if(ns.includes(x))return {r:id};return null;}
  /* the graph's colours and numbers come from the program's own arrays, Sets, Maps and queues (found by name and size) */
  function graphModel(g,S,C,names){
    const n=g.n,idx=new Map();for(let i=0;i<n;i++)idx.set(g.ids?"o"+g.ids[i]:g.keys?plain(g.keys[i],S,true):String(i),i);
    const nodeOf=v=>{if(v==null)return -1;if(g.ids){const j=v.r!==undefined?idx.get("o"+v.r):undefined;return j===undefined?-1:j;}const o=v.r!==undefined&&S.recs.get(v.r);if(o&&o.k==="arr"&&o.a.length)v=o.a[0];const i=idx.get(plain(v,S,true));return i===undefined?-1:i;};
    const col=new Array(n).fill(""),sub=new Array(n).fill(""),ring=new Set(),cap=[];let subN="";
    for(const [id,ns] of C.by){const r=S.recs.get(id),nm=ns[0];if(!r||g.rows&&g.rows.includes(id))continue;
      if(r.k==="arr"&&!g.keys&&r.len===n&&r.a.length===n){
        if(r.et==="boolean"){r.a.forEach((v,i)=>{if(v&&v.s==="true")col[i]="vis";});cap.push("green = "+nm+"[i] is true");continue;}
        if(!INTP.has(r.et))continue;const vs=r.a.map(v=>+v.s);
        if(COLN.test(nm)&&vs.every(x=>x>=0&&x<=2)||VISN.test(nm)&&vs.every(x=>x===0||x===1)){vs.forEach((x,i)=>{if(x===2||x===1&&VISN.test(nm))col[i]="vis";else if(x===1)col[i]="act";});cap.push(VISN.test(nm)?"green = visited":"grey = in progress, green = done");continue;}
        if(!subN&&DISTN.test(nm)){subN=nm;vs.forEach((x,i)=>{sub[i]=INF(x)?"∞":String(x);});}}
      else if(r.k==="set"&&VISN.test(nm)){for(const v of r.a){const i=nodeOf(v);if(i>=0)col[i]="vis";}cap.push("green = in "+nm);}
      else if(r.k==="map"&&!subN&&DISTN.test(nm)){subN=nm;for(const e of r.e){const i=nodeOf(e[0]);if(i>=0){const x=numOf(e[1],S);sub[i]=isNaN(x)?String(plain(e[1],S)):INF(x)?"∞":String(x);}}}
      else if(/^(deque|linked|stack|pq)$/.test(r.k)&&r.a.length&&r.a.length<=60){let any=false;for(const v of r.a){const i=nodeOf(v);if(i>=0){ring.add(i);any=true;}}if(any&&!cap.some(x=>/ring/.test(x)))cap.push("dashed amber = in "+nm);}}
    // variables: the names the program uses to index the graph (u in adj.get(u)) and the arrays beside it (v in visited[v])
    const tg=tagMap(),ixn=new Set();
    for(const nm of names)for(const m of [IDX.ix.get(nm),IDX.cx.get(nm)])if(m)m[0].forEach(x=>ixn.add(x));
    for(const [id,ns] of C.by){const r=S.recs.get(id);if(r&&r.k==="arr"&&r.len===n)for(const nm of ns){const m=IDX.ix.get(nm);if(m)m[0].forEach(x=>ixn.add(x));}}
    for(const x of ixn){const v=valOfName(C,x),i=v?nodeOf(v):-1;if(i>=0)tg.put(i,x);}
    if(g.ids)g.ids.forEach((id,i)=>{for(const nm of C.by.get(id)||[])tg.put(i,nm);}); // graph of objects: the variables that point at a node
    const E=[],has=new Set();g.out.forEach((es,a)=>es.forEach(e=>{E.push({a,b:e.to,w:e.w});has.add(a+">"+e.to+">"+e.w);}));
    const dir=!g.el&&E.some(e=>!has.has(e.b+">"+e.a+">"+e.w)),edges=dir||g.el?E:E.filter(e=>e.a<=e.b);
    for(const e of edges)e.on=tg.has(e.a)&&tg.has(e.b)&&e.a!==e.b;
    const tch=touchedOf(S),nodes=[];
    for(let i=0;i<n;i++)nodes.push({t:g.labels?g.labels[i]:g.keys?String(plain(g.keys[i],S)).replace(/^"(.*)"$/,"$1"):String(i),c:(col[i]+(ring.has(i)?" inq":"")).trim(),s:sub[i],tags:tg.get(i)||[],hot:!!g.rows&&tch.has(g.rows[i])});
    const wt=edges.some(e=>e.w!==undefined);
    const info=(dir?"directed":"undirected")+" graph · "+n+" node"+(n===1?"":"s")+" · "+edges.length+" edge"+(edges.length===1?"":"s")+(wt?" · weights on the edges":"")+(cap.length?" · "+cap.join(" · "):"")+(subN?" · "+subN+" beside each node":"");
    const G={nodes,edges,dir};return {G,info,sig:JSON.stringify([nodes,edges.map(e=>[e.a,e.b,e.w,e.on]),dir])};}
  function graphBox(r,vw){const head=r.k==="arr"?H(r.et)+"["+r.len+"]":r.k==="obj"?H(r.cls)+" <small>graph of objects</small>":H(r.cls)+" <small>size "+r.size+"</small>";
    return '<div class="pg-bh">'+head+'</div><div class="pg-ttag">'+H(vw.gm.info)+"</div>"+PGVZ.graphHtml(vw.gm.G);}
  /* Union-Find: an int[] where every value is an index of the same array (parent[i]); node i hangs under parent[i], a root is its own parent */
  function ufOf(r){if(r.k!=="arr"||r.et!=="int"||r.len<2||r.len>64||r.a.length!==r.len)return null;const p=r.a.map(v=>+v.s);return p.every(x=>x>=0&&x<r.len)?p:null;}
  function ixTags(names,C,n){const tg=tagMap();for(const nm of names){const m=IDX.ix.get(nm);if(m)for(const x of m[0]){const v=intOf(C,x);if(v!==undefined&&v>=0&&v<n)tg.put(v,x);}}return tg;}
  function ufModel(r,S,C,names){
    const p=ufOf(r),n=p.length,P=K>0?JVML.state(R,K-1).recs.get(r.id):null,tg=ixTags(names,C,n);
    let rk=null,rn="";for(const [id,ns] of C.by){const x=S.recs.get(id);if(x&&x!==r&&x.k==="arr"&&x.len===n&&RANKN.test(ns[0])){rk=x;rn=ns[0];break;}}
    const nodes=p.map((x,i)=>({k:"u"+i,t:String(i),s:rk?rn+" "+rk.a[i].s:"",c:x===i?"root":"",tags:tg.get(i)||[],hot:!!P&&P!==r&&!!P.a&&!!P.a[i]&&P.a[i].s!==r.a[i].s,kids:[],el:[]}));
    p.forEach((x,i)=>{if(x!==i)nodes[x].kids.push(i);});
    const roots=[];p.forEach((x,i)=>{if(x===i)roots.push(i);});
    const info="Union-Find forest · "+roots.length+" set"+(roots.length===1?"":"s")+" · node i hangs under parent[i]; a root is its own parent"+(rk?" · "+rn+" under each node":"");
    return {T:{nodes,roots,bin:false},info,sig:JSON.stringify(nodes)};}
  /* a segment tree in an array: root 1 with children 2i and 2i+1 (root 0 with 2i+1 and 2i+2 when the code says so); node i covers lo..hi of the input */
  function segModel(r,S,C,names){
    if(r.k!=="arr"||!NUMP.has(r.et)||r.len>1024)return null;
    let src=null,sn="";for(const [id,ns] of C.by){const x=S.recs.get(id);if(x&&x!==r&&x.k==="arr"&&NUMP.has(x.et)&&x.len>=2&&2*x.len<=r.len&&r.len<=4*x.len){src=x;sn=ns[0];break;}}
    if(!src)return null;
    const z=IDX.seg0,m=src.len,n=Math.min(r.len,r.a.length),P=K>0?JVML.state(R,K-1).recs.get(r.id):null,tg=ixTags(names,C,n),nodes=[];
    const build=(i,lo,hi)=>{if(i>=n||nodes.length>=255)return -1;const j=nodes.length,v=r.a[i];
      const nd={k:"s"+i,t:plain(v,S),s:"#"+i+" ["+lo+(lo===hi?"":".."+hi)+"]",tags:tg.get(i)||[],hot:!!P&&P!==r&&!!P.a&&!!P.a[i]&&P.a[i].s!==v.s,kids:[],el:[],v:numOf(v,S)};nodes.push(nd);
      if(lo<hi){const mid=(lo+hi)>>1;nd.kids.push(build(z?2*i+1:2*i,lo,mid),build(z?2*i+2:2*i+1,mid+1,hi));}return j;};
    build(z?0:1,0,m-1);
    const inner=nodes.filter(x=>x.kids.length===2&&x.kids[0]>=0&&x.kids[1]>=0),ok=f=>inner.length&&inner.some(x=>x.v)&&inner.every(x=>x.v===f(nodes[x.kids[0]].v,nodes[x.kids[1]].v));
    const op=ok((a,b)=>a+b)?" · each node = left + right (sums)":ok(Math.min)?" · each node = the smaller child (minimums)":ok(Math.max)?" · each node = the larger child (maximums)":"";
    const info="segment tree over "+sn+"[0.."+(m-1)+"] · node #i has children #"+(z?"2i+1 and #2i+2":"2i and #2i+1")+op;
    return {T:{nodes,root:0,bin:true},info,sig:JSON.stringify(nodes.map(x=>[x.t,x.tags,x.hot]))};}
  /* a Fenwick (binary indexed) tree: bit[i] holds the sum of the lowbit(i) positions that end at i (lowbit = i & -i) */
  function fenwickHtml(r,S,C,names){
    const n=Math.min(r.len,r.a.length),show=Math.min(n,33),tg=ixTags(names,C,n),P=K>0?JVML.state(R,K-1).recs.get(r.id):null;
    const hot=i=>!!P&&P!==r&&!!P.a&&!!P.a[i]&&P.a[i].s!==r.a[i].s;
    let h='<div class="pg-bh">'+H(r.et)+"["+r.len+"] <small>Fenwick tree · bit[0] unused</small></div>"+'<div class="pg-ttag">bit[i] holds the sum of positions i − lowbit(i) + 1 … i, where lowbit(i) = i &amp; −i</div><table class="pg-grid pg-fw"><tr><th></th>';
    for(let i=1;i<show;i++)h+='<th><b class="pg-gm">'+H((tg.get(i)||[]).join(","))+"</b>"+i+"</th>";
    h+='</tr><tr><th>bit</th>';
    for(let i=1;i<show;i++)h+='<td data-k="h'+r.id+":"+i+'"'+(tg.has(i)?' class="pg-at"':"")+">"+cellVal(r.a[i],S,"h"+r.id+":"+i)+"</td>";
    h+="</tr>";
    for(let L=1;L<show;L*=2){h+='<tr class="pg-fwl"><th title="lowbit">'+L+"</th>";
      for(let i=1;i<show;){const e=i+L-1;if(e<show&&(e&-e)===L){h+='<td colspan="'+L+'" class="pg-fwc'+(tg.has(e)?" at":"")+(hot(e)?" hot":"")+'"><span title="bit['+e+"] = positions "+(e-L+1)+".."+e+'">'+(L>1?(e-L+1)+"…"+e:e)+"</span></td>";i=e+1;}else{h+="<td></td>";i++;}}
      h+="</tr>";}
    return h+"</table>";}
  /* DP arrows: when the last line wrote dp[i] from other cells of dp (dp[i] = dp[i-1] + dp[i-2]), arrows run from the cells it read to the cell it wrote */
  function dpArrows(el,id,S,C,M,chg){
    const names=(C.by.get(id)||[]).filter(n=>IDX.dp.has(n)),rows=M.grids.get(id),wrap=q(rows?".pg-grid":".pg-cells",el);if(!wrap)return;
    if(!rows&&wrap.classList.contains("pg-dpw")!==names.length>0){wrap.classList.toggle("pg-dpw",names.length>0);el._w=0;}
    const src=[],dst=[],txt=[],P=K>0?R.steps[K-1]:null;
    if(names.length&&P&&P.e==="line"&&P.f===S.step.f&&P.sn){
      const wrote=new Set([...chg].filter(k=>rows?rows.some(x=>k.startsWith("h"+x+":")):k.startsWith("h"+id+":")));
      if(wrote.size){const PS=JVML.state(R,K-1),PC=viewCtx(PS),get=x=>intOf(PC,x);
        const cell=(x,i)=>{for(const [oid,ns] of PC.by)if(ns.includes(x)){const a=PS.recs.get(oid);if(a&&a.k==="arr"&&i>=0&&i<a.a.length){const v=numOf(a.a[i],PS);return Number.isInteger(v)?v:undefined;}}return undefined;};
        const at=(e,an)=>{if(rows){if(e.a.k!=="Index")return null;const i=PGVZ.ixEval(e.a.i,get,cell),j=PGVZ.ixEval(e.i,get,cell);return i>=0&&i<rows.length&&j>=0?["h"+rows[i]+":"+j,an+"["+i+"]["+j+"]"]:null;}
          if(e.a.k!=="Name")return null;const i=PGVZ.ixEval(e.i,get,cell);return i>=0?["h"+id+":"+i,an+"["+i+"]"]:null;};
        const as=[],find=x=>{if(!x||typeof x!=="object")return;if(Array.isArray(x)){x.forEach(find);return;}if(x.k==="Lambda"||x!==P.sn&&x.line&&x.line!==P.l)return;
          if(x.k==="Assign"&&x.t&&x.t.k==="Index")as.push(x);for(const k in x)if(k!=="t"&&k!=="ret"&&x[k]&&typeof x[k]==="object")find(x[k]);};
        find(P.sn);
        for(const a of as){const an=a.t.a.k==="Name"?a.t.a.n:a.t.a.k==="Index"&&a.t.a.a.k==="Name"?a.t.a.a.n:null;if(!names.includes(an))continue;
          const tk=at(a.t,an);if(!tk||!wrote.has(tk[0]))continue;dst.push(tk[0]);const rd=[];
          for(const e of PGVZ.ixReads(a.v,an)){const k=at(e,an);if(k&&k[0]!==tk[0]&&!src.includes(k[0])){src.push(k[0]);rd.push(k[1]);}}
          if(rd.length)txt.push(tk[1]+" ← "+rd.join(", "));}}}
    const mk=JSON.stringify([src,dst]);if(mk===el._dp)return;el._dp=mk;
    for(const c of qa(".pg-dps,.pg-dpt",el))c.classList.remove("pg-dps","pg-dpt");
    const o=q(".pg-dpa",el);if(o)o.remove();const t=q(".pg-gtag.dp",el);if(t)t.remove();
    if(!src.length)return;
    const pos=c=>{let x=0,y=0,e=c;while(e&&e!==el){x+=e.offsetLeft;y+=e.offsetTop;e=e.offsetParent;}return [x,y,c.offsetWidth,c.offsetHeight];};
    const D=dst.map(k=>q('[data-k="'+k+'"]',el)).filter(Boolean);if(!D.length)return;
    let ps="";const [dx,dy,dw,dh]=pos(D[0]);D.forEach(c=>c.classList.add("pg-dpt"));
    for(const k of src){const c=q('[data-k="'+k+'"]',el);if(!c)continue;c.classList.add("pg-dps");const [sx,sy,sw,sh]=pos(c);
      if(!rows){const x1=sx+sw/2,x2=dx+dw/2,y1=sy-1,y2=dy-1,top=Math.min(y1,y2)-Math.min(21,8+Math.abs(x2-x1)*.12);ps+='<path d="M'+x1+" "+y1+" C"+x1+" "+top+","+x2+" "+top+","+x2+" "+y2+'" marker-end="url(#pgDa)"/>';}
      else{const x1=sx+sw/2,y1=sy+sh/2,x2=dx+dw/2,y2=dy+dh/2,L=Math.hypot(x2-x1,y2-y1)||1,ex=x2-(x2-x1)/L*Math.min(11,L/2),ey=y2-(y2-y1)/L*Math.min(9,L/2),mx=(x1+ex)/2-(y2-y1)/L*8,my=(y1+ey)/2+(x2-x1)/L*8;
        ps+='<path d="M'+x1+" "+y1+" Q"+mx+" "+my+" "+ex+" "+ey+'" marker-end="url(#pgDa)"/>';}}
    el.insertAdjacentHTML("beforeend",'<svg class="pg-dpa" width="'+el.offsetWidth+'" height="'+el.offsetHeight+'"><defs><marker id="pgDa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="pg-dah"/></marker></defs>'+ps+"</svg>");
    if(txt.length)el.insertAdjacentHTML("afterbegin",'<span class="pg-gtag dp">'+H(txt.join(" · "))+"</span>");}
  /* the recursion call tree, from the whole trace (built once per run): every call, its arguments, its return value, when it ended */
  function callTree(){
    if(R._ct)return R._ct;const by=new Map(),all=[],open=[];
    R.steps.forEach((s,k)=>{
      for(let j=open.length-1;j>=0;j--)if(!s.k||!s.k.includes(open[j].id)){open[j].end=k;open.splice(j,1);}
      for(const d of s.d)if(d.fr&&d.ret!==undefined){const x=by.get(d.id);if(x&&x.kr<0){x.ret=d.ret;x.kr=k;}}
      if(s.e!=="call")return;const f=s.d.find(d=>d.id===s.f);if(!f)return;
      const i=s.k?s.k.indexOf(s.f):-1,pn=i>0?by.get(s.k[i-1])||null:null;
      const x={id:s.f,m:String(f.name).split("(")[0],k0:k,kr:-1,end:Infinity,ret:null,args:f.vars.filter(v=>v.pa),par:pn,kids:[],lab:null};
      by.set(s.f,x);all.push(x);open.push(x);if(pn)pn.kids.push(x);});
    /* recursive = a method that reaches itself, directly or through other methods (2026-11-04: mutual recursion, isEven → isOdd →
       isEven); grp maps each such method to every method of its cycle, and the call tree follows all of them */
    const grp=new Map(),join=ms=>{const u=new Set(ms);for(const m of ms)if(grp.has(m))for(const y of grp.get(m))u.add(y);for(const m of u)grp.set(m,u);};
    for(const x of all){if(x.par&&x.par.m===x.m){if(!grp.has(x.m))join([x.m]);continue;}
      let d=0;for(let a=x.par;a&&d<60;a=a.par,d++)if(a.m===x.m){const ms=[a.m];for(let b=x;b!==a;b=b.par)ms.push(b.m);join(ms);break;}}
    const rec=new Set(grp.keys());
    return R._ct={by,all,rec,grp};}
  function argTxt(v,S){
    if(v===null||v===undefined)return "null";if(v.r===undefined)return v.p==="char"?"'"+v.s+"'":v.s;
    const r=S.recs.get(v.r);if(!r)return "…";if(r.k==="str")return '"'+(r.s.length>8?r.s.slice(0,8)+"…":r.s)+'"';if(r.k==="box")return r.s;
    if(r.a&&r.a.length<=5&&r.a.every(x=>!x||x.r===undefined||(S.recs.get(x.r)||{}).k==="box"))return "["+r.a.map(x=>argTxt(x,S)).join(",")+"]";
    return "…";}
  function ctLabel(x){if(x.lab)return x.lab;const S=JVML.state(R,x.k0),ps=x.par&&x.par.m===x.m?x.par:null;
    const a=x.args.map((v,i)=>{const t=argTxt(v.v,S);return ps&&v.v&&v.v.r!==undefined&&ps.argt&&ps.argt[i]===t?"…":t;});x.argt=x.args.map(v=>argTxt(v.v,S));
    const s=x.m.split(".").pop()+"("+a.join(", ")+")";return x.lab=s.length>28?s.slice(0,27)+"…)":s;}
  /* Memory off: the call tree of the recursive call running now (or the last one that ran), up to 200 calls */
  function ctModel(S){
    const T=callTree();if(!T.rec.size)return null;const stk=S.step.k||[];let x=null;
    for(let j=stk.length-1;j>=0&&!x;j--){const y=T.by.get(stk[j]);if(y&&T.rec.has(y.m))x=y;}
    if(!x)for(let j=T.all.length-1;j>=0;j--){const y=T.all[j];if(y.k0<=K&&T.rec.has(y.m)){x=y;break;}}
    if(!x)return null;const G=T.grp.get(x.m)||new Set([x.m]),inG=c=>G.has(c.m);while(x.par&&inG(x.par))x=x.par;
    const root=x,list=[],sz=y=>1+y.kids.filter(inG).reduce((s,c)=>s+sz(c),0),total=sz(root);if(total<3)return null;
    const walk=y=>{if(list.length>=200||y.k0>K&&total>31)return;list.push(y);for(const c of y.kids)if(inG(c))walk(c);};walk(root); // v8: a small tree (≤ 31 calls) also shows the calls still to come, as ghosts; a big one grows as it runs
    const at=new Map(list.map((y,i)=>[y,i])),seen=new Map(),nodes=[];let rep=0,redo=false,dm=0;
    let begun=0;for(const y of list){const fut=y.k0>K;if(!fut)begun++;const lab=ctLabel(y),live=stk.includes(y.id),done=!live&&!fut&&y.end<=K,r=!fut&&y.kr>=0&&y.kr<=K&&y.ret&&y.ret.p!=="void";
      // R3: a repeat needs the same text and the same objects (insert(node#4, 40) and insert(node#5, 40) both print as insert(…, 40))
      const sk=lab+"|"+(y.args||[]).map(a=>a.v&&a.v.r!==undefined?"#"+a.v.r:"").join(",");
      const again=!fut&&seen.has(sk)&&seen.get(sk).k0<y.k0;if(again){rep++;if(y.kids.some(inG))redo=true;}else seen.set(sk,y);
      let d=0;for(let p=y;p!==root;p=p.par)d++;dm=Math.max(dm,d);
      nodes.push({k:"c"+y.id,t:fut?"":lab,s:r?"→ "+argTxt(y.ret,S):"",c:[y.id===S.step.f?"cur":"",done?"done":"",again?"rep":"",fut?"fut":""].filter(Boolean).join(" "),pin:y.id===S.step.f,tags:[],kids:y.kids.filter(c=>at.has(c)).map(c=>at.get(c)),el:[]});}
    const info="call tree of "+ctLabel(root)+" · "+(begun<total?begun+" of "+total+" calls so far"+(begun<list.length?" (faint = still to come)":""):total+" call"+(total===1?"":"s"))+" · depth "+(dm+1)+(rep?" · "+rep+" repeated (dashed amber: same arguments as an earlier call"+(redo?", all its work done again: a memo would skip it":"")+")":"")+(total>200&&list.length>=200?" · the first 200 are drawn":"");
    return {T:{nodes,root:0,bin:false},info,sig:JSON.stringify([info,nodes.map(n=>[n.k,n.s,n.c,n.kids])])};}
  /* ---------- (Phase 6) the Complexity tab: theory from the code's shape (PGVZ.cplx), the recursion measured from the call tree,
     and counts from this run, kept apart. Built once per run and method; each step only moves the "so far" fills ---------- */
  let CX=null,cxPin=null,cxKey="",cxRun=0,tab=LS.get("js1-pg-tab")==="cx"?"cx":"vars";
  const cxEl=q("#pgCx"),tabBtns=qa(".pg-tab",PGhost);
  function setTab(t){tab=t==="cx"?"cx":"vars";LS.set("js1-pg-tab",tab);for(const b of tabBtns){const on=b.dataset.tab===tab;b.classList.toggle("on",on);b.setAttribute("aria-selected",String(on));b.tabIndex=on?0:-1;}
    if(watchEl)watchEl.hidden=tab!=="vars";if(cxEl)cxEl.hidden=tab!=="cx";cxKey="";if(R&&R.steps.length)render();}
  const mName=x=>x.m.split(".").pop();
  const lb2=x=>Math.log2(Math.max(2,x));
  const fact=n=>{let f=1;for(let i=2;i<=Math.min(n,170);i++)f*=i;return f;};
  function sizeOfV(v,S){if(v===undefined||v===null)return undefined;if(v.r===undefined)return /^(int|long|short|byte|char)$/.test(v.p)?+(v.p==="char"?v.c:v.s):undefined;
    const r=S.recs.get(v.r);if(!r)return undefined;return r.len!==undefined?r.len:r.size!==undefined?r.size:r.s!==undefined?r.s.length:r.a?r.a.length:r.e?r.e.length:undefined;}
  /* the value of each size letter for one call: parameters at call time, locals just before it returns, then static fields */
  function cxSizes(mx,x){const out=new Map();if(!x)return out;const P=JVML.state(R,x.k0);let E=null;
    const look=n=>{const f=frameOf(P,x.id);let v=f&&f.vars.find(y=>y.n===n);if(v)return [v.v,P];
      if(!E)E=JVML.state(R,Math.max(x.k0,Math.min(x.end,R.steps.length)-1));const g=frameOf(E,x.id);v=g&&g.vars.find(y=>y.n===n);if(v)return [v.v,E];
      for(const st of E.frames.filter(z=>z.st)){v=st.vars.find(y=>y.n===n);if(v)return [v.v,E];}return [undefined,P];};
    const sz=n=>{const [v,S]=look(n);return sizeOfV(v,S);};
    const vars=()=>{const f=frameOf(P,x.id);return f?f.vars:[];};
    for(const [s,k] of mx.keys){let n;
      if(k.startsWith("range:")){const [a,b]=k.slice(6).split(",");const A=sz(a),B=sz(b);n=A!==undefined&&B!==undefined?B-A+1:undefined;}
      else if(k==="V"){for(const nm of ["n","N","V","nodes","vertices","numNodes","numCourses"]){n=sz(nm);if(n!==undefined)break;}
        if(n===undefined){const g=vars().find(v=>GRN.test(v.n)&&!/edge|pair|road|flight/i.test(v.n));if(g)n=sizeOfV(g.v,P);}}
      else if(k==="E"){const e=vars().find(v=>/edge|pair|road|flight|link|conn|prereq/i.test(v.n));if(e)n=sizeOfV(e.v,P);
        else{const g=vars().find(v=>GRN.test(v.n));const r=g&&g.v&&g.v.r!==undefined?P.recs.get(g.v.r):null;if(r&&r.a){n=0;for(const c of r.a){const z=sizeOfV(c,P);if(z===undefined){n=undefined;break;}n+=z;}}}}
      else if(/^(h|nodes|list)$/.test(k))n=undefined;
      else if(k.includes("[")){const base=k.split("[")[0],[v,S]=look(base),r=v&&v.r!==undefined?S.recs.get(v.r):null;n=r&&r.a&&r.a[0]?sizeOfV(r.a[0],S):undefined;}
      else n=sz(k);
      if(n!==undefined&&isFinite(n))out.set(s,n);}
    return out;}
  function evalT(t,sz){let v=1;for(const s in t.p){if(!sz.has(s))return NaN;v*=Math.pow(Math.max(sz.get(s),1),t.p[s]);}for(const s in t.g){if(!sz.has(s))return NaN;v*=Math.pow(lb2(sz.get(s)),t.g[s]);}
    for(const x of t.x?t.x.split("·"):[]){const m=x.match(/^([\d.]+)\^(\w+)$/),f=x.match(/^(\w+)!$/);if(m){if(!sz.has(m[2]))return NaN;v*=Math.pow(+m[1],sz.get(m[2]));}else if(f){if(!sz.has(f[1]))return NaN;v*=fact(sz.get(f[1]));}else return NaN;}
    return v;}
  /* least squares on (x, y): slope and R² */
  function lsq(P){const n=P.length;if(n<2)return null;let sx=0,sy=0,sxx=0,sxy=0,syy=0;for(const [x,y] of P){sx+=x;sy+=y;sxx+=x*x;sxy+=x*y;syy+=y*y;}
    const d=n*sxx-sx*sx;if(!d)return null;const b=(n*sxy-sx*sy)/d,a=(sy-b*sx)/n;let ss=0,st=0;const my=sy/n;for(const [x,y] of P){ss+=(y-a-b*x)**2;st+=(y-my)**2;}return {b,a,r2:st?1-ss/st:1};}
  /* how the counts grow with the size: exponential, polynomial or logarithmic, whichever fits best (needs 3+ sizes) */
  function fitGrowth(pts){const by=new Map();for(const [s,c] of pts){if(!by.has(s))by.set(s,[]);by.get(s).push(c);}
    const P=[...by].map(([s,cs])=>[s,cs.reduce((a,b)=>a+b,0)/cs.length]).sort((a,b)=>a[0]-b[0]);if(P.length<3||P[P.length-1][1]<=P[0][1])return null;
    const ex=lsq(P.map(([s,c])=>[s,Math.log(c)])),po=lsq(P.filter(p=>p[0]>=1).map(([s,c])=>[Math.log(s),Math.log(c)])),lo=lsq(P.map(([s,c])=>[Math.log2(s+1),c]));
    const C=[ex&&{k:"exp",r2:ex.r2,v:Math.exp(ex.b)},po&&{k:"poly",r2:po.r2,v:po.b},lo&&{k:"log",r2:lo.r2-.02}].filter(Boolean).sort((a,b)=>b.r2-a.r2);let f=C[0];if(!f)return null;
    if(f.k==="exp"&&f.v<1.2&&po)f=C.find(c=>c.k==="poly")||f;if(f.k==="poly"&&f.v<.4&&lo)f={k:"log",r2:lo.r2};
    const txt=f.k==="exp"?"≈ "+f.v.toFixed(2)+"ⁿ (exponential: ×"+f.v.toFixed(2)+" for each +1 in n)":f.k==="poly"?"≈ n^"+f.v.toFixed(1)+(Math.abs(f.v-1)<.25?" (linear)":Math.abs(f.v-2)<.25?" (quadratic)":Math.abs(f.v-3)<.3?" (cubic)":""):"≈ log n";
    return {txt,r2:Math.max(0,f.r2),P};}
  /* per run, per method: the calls, their sizes, line steps, hottest lines, the recursion levels (cached on R) */
  function cxMeasure(mx){R._cxm=R._cxm||new Map();if(R._cxm.has(mx.name))return R._cxm.get(mx.name);
    const T=callTree(),calls=T.all.filter(x=>mName(x)===mx.name),tops=calls.filter(x=>!x.par||x.par.m!==x.m),N=R.steps.length;
    // the busiest lines (run 2+ times; a lambda's line counts its comparator calls, so it is left out)
    const hot=[];for(let l=mx.line+1;l<=(mx.end||mx.line);l++)if(R.hits&&R.hits[l]>1&&!/->/.test(srcLine(l)))hot.push([l,R.hits[l]]);hot.sort((a,b)=>b[1]-a[1]);const hl=hot.slice(0,4).map(h=>h[0]);
    for(const x of tops){const e=Math.min(x.end,N);x.ls=[];x.hl=new Map(hl.map(l=>[l,[]]));for(let k=x.k0;k<e;k++){const s=R.steps[k];if(s.e!=="line")continue;x.ls.push(k);const a=x.hl.get(s.l);if(a)a.push(k);}}
    const out={calls,tops,hl,growth:null};
    // growth across top-level calls: steps vs the leading size
    const lead=mx.time[0]?Object.keys(mx.time[0].p).concat(Object.keys(mx.time[0].g),(mx.time[0].x.match(/\^(\w+)|(\w+)!/)||[]).slice(1).filter(Boolean)):[];
    out.lead=lead[0]||[...mx.keys.keys()][0]||null;
    if(tops.length>=3&&out.lead){const pts=[];for(const x of tops.slice(0,40)){const sz=cxSizes(mx,x);if(sz.has(out.lead))pts.push([sz.get(out.lead),Math.max(1,x.ls.length)]);}out.growth=fitGrowth(pts);}
    if(mx.rec){const kids=new Map(calls.map(x=>[x,x.kids.filter(c=>mName(c)===mx.name)]));
      const sub=new Map();for(let i=calls.length-1;i>=0;i--){const x=calls[i];sub.set(x,1+kids.get(x).reduce((s,c)=>s+(sub.get(c)||1),0));}
      const sp=mx.rec.szp||[],pv=(x,n)=>{const a=x.args.find(v=>v.n===n);return a&&a.v&&a.v.r===undefined?+a.v.s:undefined;};
      const pts=[];for(const x of calls.slice(0,4000)){let s;if(sp.length===2){const A=pv(x,sp[0]),B=pv(x,sp[1]);if(A!==undefined&&B!==undefined)s=B-A+1;}else if(sp.length===1)s=pv(x,sp[0]);if(s!==undefined)pts.push([s,sub.get(x)]);}
      if(pts.length){const ls=lsq(pts);if(ls&&ls.b<0){const mx2=Math.max(...pts.map(p=>p[0]));for(const p of pts)p[0]=mx2-p[0];out.flip=true;}}
      out.rgrowth=fitGrowth(pts);out.sub=sub;out.kids=kids;}
    R._cxm.set(mx.name,out);return out;}
  /* which method to explain: the pinned chip, else the innermost analysed method running now, else the one with the most steps */
  function cxFocus(S){const ms=CX.ms;if(cxPin&&ms.some(m=>m.name===cxPin))return ms.find(m=>m.name===cxPin);
    const stk=(S.step.k||[]).slice().reverse();for(const id of stk){const f=frameOf(S,id);const n=f&&f.fr?String(f.name).split("(")[0].split(".").pop():null;const m=n&&ms.find(y=>y.name===n);if(m&&m.show)return m;}
    const other=ms.some(m=>m.show&&m.name!=="main");let best=null,bs=-1;for(const m of ms){if(!m.show||other&&m.name==="main")continue;const z=cxMeasure(m).tops.reduce((s,x)=>s+x.ls.length,0);if(z>bs){bs=z;best=m;}}return best||ms[0];}
  const LAD=[["1",()=>1],["log n",n=>lb2(n)],["n",n=>n],["n log n",n=>n*lb2(n)],["n²",n=>n*n],["n³",n=>n*n*n],["2ⁿ",n=>Math.pow(2,n)],["n!",n=>fact(n)]];
  function cxPane(S){
    if(!cxEl)return;
    if(!CX||!CX.ms.some(m=>m.show)){watchInfo.textContent="";if(cxKey!=="none"+cxRun){cxKey="none"+cxRun;cxEl.innerHTML='<div class="pg-empty">'+(CX?"No loops and no recursion here: every line runs a fixed number of times, O(1). Loops, recursion and library calls such as sorting are explained in this tab.":"The time and space complexity appear here after ▶ Visualize.")+"</div>";}return;}
    const mx=cxFocus(S),M=cxMeasure(mx),top=M.tops.find(x=>x.k0<=K&&K<x.end)||M.tops.filter(x=>x.k0<=K).pop()||M.tops[0];
    const key=cxRun+"|"+mx.name+"|"+(top?top.id:"")+"|"+(cxPin||"");watchInfo.textContent=mx.name+"()";
    if(key!==cxKey){cxKey=key;cxBuild(mx,M,top);}
    cxStep(mx,M,top);}
  function cxBuild(mx,M,top){
    const used=new Set((mx.ts+" "+mx.ss+" "+(mx.rec?mx.rec.eq:"")).match(/[A-Za-z]\w*/g)||[]),letters=[...mx.syms].filter(([s])=>used.has(s));
    let h='<div class="pg-cxm" role="group" aria-label="Methods">'+CX.ms.filter(m=>m.show).map(m=>'<button type="button" class="pg-cxc'+(m===mx?" on":"")+(cxPin===m.name?" pin":"")+'" data-m="'+H(m.name)+'" aria-pressed="'+(m===mx)+'">'+H(m.name)+"() <b>"+H(m.ts)+"</b></button>").join("")+"</div>";
    // 1. theory
    h+='<div class="pg-cxs"><div class="pg-cxh"><span class="pg-cxk th">Theory</span>from the code\'s shape, before running</div>';
    h+='<div class="pg-cxbig"><span>Time <b>'+H(mx.ts)+'</b></span><span>Extra space <b>'+H(mx.ss)+"</b></span></div>";
    if(letters.length)h+='<div class="pg-cxsym">'+letters.filter(([s,t])=>t!==s).map(([s,t])=>"<code>"+H(t.startsWith(s+" =")?t:s+" = "+t)+"</code>").join(" ")+"</div>";
    const rows=mx.rows.filter(r=>r.k==="loop"||r.s!=="1");
    if(rows.length){h+='<ol class="pg-cxl">';for(const r of rows)h+='<li style="--d:'+r.d+'" data-l="'+r.l+'"><span class="pg-cxln">L'+r.l+'</span><code>'+H(r.src)+'</code><b class="pg-cxf'+(r.am?" am":"")+'">'+(r.k==="loop"?(r.am?"+ ":"× ")+H(r.s):"+ "+H(r.s)+" each")+"</b>"+(r.am?'<i class="pg-cxa">amortised</i>':"")+"<small>"+H(r.w)+"</small></li>";h+="</ol>";
      if(rows.some(r=>r.k==="loop"&&!r.am&&r.d>0))h+='<div class="pg-cxn">Nested loops multiply (× inside ×); loops one after another add, and the biggest wins.</div>';}
    else if(!mx.rec)h+='<div class="pg-cxn">No loops and no recursion: every line runs a fixed number of times.</div>';
    if(mx.rec){const r=mx.rec;h+='<div class="pg-cxeq"><code>'+H(r.eq)+"</code></div><div class=\"pg-cxn\">"+H(r.how)+". Calls "+H(r.calls)+" · depth "+H(r.depth)+" · work per call "+H(r.work)+"</div>";}
    if(mx.sp.length)h+='<div class="pg-cxn">Space: '+mx.sp.map(s=>"L"+s.l+" "+H(s.w)+" → "+H(PGVZ.fmt(s.S))).join(" · ")+"</div>";
    h+="</div>";
    // 2. the recursion, measured from the call tree
    if(mx.rec&&M.calls.length){const root=top;
      h+='<div class="pg-cxs"><div class="pg-cxh"><span class="pg-cxk me">Measured</span>the recursion, counted from its call tree</div><div class="pg-cxst" data-st="rec"></div><div class="pg-cxlv" data-lv></div>';
      if(M.rgrowth){const g=M.rgrowth;h+='<div class="pg-cxn">Each call\'s own subtree against its size ('+H((mx.rec.szp||[]).length===2?mx.rec.szp[1]+" − "+mx.rec.szp[0]+" + 1":(M.flip?"items left after ":"")+(mx.rec.szp||[""])[0])+"): <b>"+H(g.txt)+"</b> <small>fit "+g.r2.toFixed(2)+"</small></div>"+cxPts(g.P,M.flip?"left":"n");}
      h+="</div>";}
    // 3. this run
    h+='<div class="pg-cxs"><div class="pg-cxh"><span class="pg-cxk ob">Observed</span>'+(top?"this call, "+H(ctLabel(top))+(M.tops.length>1?" <small>(call "+(M.tops.indexOf(top)+1)+" of "+M.tops.length+")</small>":""):"not called in this run")+"</div>";
    if(top){const sz=cxSizes(mx,top),sv=[...sz].filter(([s])=>used.has(s));
      h+='<div class="pg-cxsym">'+(sv.length?sv.map(([s,v])=>"<code>"+H(s)+" = "+v+"</code>").join(" "):"<small>the sizes could not be read from the variables</small>")+'</div><div class="pg-cxst" data-st="run"></div>';
      if(M.hl.length)h+='<div class="pg-cxhl">'+M.hl.map(l=>'<div class="pg-cxhr" data-l="'+l+'"><span class="pg-cxln">L'+l+'</span><code>'+H(srcLine(l))+'</code><i><i></i></i><b></b></div>').join("")+"</div>";
      h+=cxLadder(mx,M,top,sz);}
    if(M.growth)h+='<div class="pg-cxn">Across '+M.tops.length+" calls, the steps grow <b>"+H(M.growth.txt)+"</b> <small>fit "+M.growth.r2.toFixed(2)+"</small></div>"+cxPts(M.growth.P,M.lead);
    h+='</div><div class="pg-cxn pg-cxfoot">Theory is an estimate from the loops and calls it can read; Measured and Observed are counted from this run. Click a line number to find it in the code.</div>';
    cxEl.innerHTML=h;}
  function cxPts(P,lab){const mx=Math.max(...P.map(p=>p[1]));return '<div class="pg-cxpts" aria-label="size and count">'+P.slice(-12).map(([s,c])=>'<span title="'+lab+" = "+s+": "+Math.round(c)+'"><i style="height:'+Math.max(3,Math.round(c/mx*36))+'px"></i><small>'+s+"</small></span>").join("")+"</div>";}
  /* a log-scale ruler of growth classes at this size, with this call's hottest line and the theory's class marked */
  function cxLadder(mx,M,top,sz){const lead=M.lead,n=lead&&sz.get(lead);if(!n||n<2||!M.hl.length)return "";
    const cnt=(top.hl.get(M.hl[0])||[]).length;if(cnt<2)return "";const th=mx.time.map(t=>evalT(t,sz)).filter(v=>isFinite(v)).reduce((a,b)=>Math.max(a,b),0);
    const L=LAD.map(([t,f])=>[t.replace(/n/g,lead),f(n)]),hi=Math.max(cnt,th||0)*3,keep=L.filter(([,v],i)=>i<3||v<=hi||L[i-1][1]<=hi),top1=Math.log10(Math.max(...keep.map(k=>k[1]),cnt,2)*1.15);
    const X=v=>(Math.log10(Math.max(1,v))/top1*100).toFixed(1)+"%";
    let h='<div class="pg-cxlad" role="img" aria-label="growth classes at '+lead+" = "+n+'"><div class="pg-cxrl" data-top="'+top1+'">';
    for(const [t,v] of keep)h+='<span class="pg-cxt'+(t===mx.ts.slice(2,-1)?" th":"")+'" style="left:'+X(v)+'"><i></i><small>'+H(t)+"</small><em>"+(v>=1e6?v.toExponential(1):Math.round(v))+"</em></span>";
    h+='<span class="pg-cxdot" data-dot style="left:0%"><b></b></span></div></div>';
    const ratio=th?cnt/th:0,cls=mx.ts.slice(2,-1),inTs=new Set(mx.time.flatMap(t=>Object.keys(t.p).concat(Object.keys(t.g),(t.x.match(/\^(\w+)|(\w+)!/g)||[]).map(z=>z.replace(/[\^!]/g,"")))));
    h+='<div class="pg-cxn">The busiest line, L'+M.hl[0]+", took <b>"+cnt+"</b> steps in this call (one per stop there, loop re-checks included; the gutter's ×N counts whole statements over the run)"+(th?"; the theory's "+H(cls)+" at "+H([...sz].filter(([s])=>inTs.has(s)).map(([s,v])=>s+" = "+v).join(", "))+" is "+(th>=1e6?th.toExponential(2):Math.round(th))+": the count is "+(ratio>=.95&&ratio<=1.05?"exactly that":"about "+(ratio<1?ratio.toFixed(2):ratio.toFixed(1))+" × "+H(cls)+" (Big-O drops this constant factor)"):"")+".</div>";
    return h;}
  const cnt0=(a,k)=>{let lo=0,hi=a.length;while(lo<hi){const m=(lo+hi)>>1;if(a[m]<=k)lo=m+1;else hi=m;}return lo;}; // how many indexes ≤ k
  function cxStep(mx,M,top){
    if(top){const st=q('[data-st="run"]',cxEl),done=cnt0(top.ls,K),all=top.ls.length;if(st)st.innerHTML="<b>"+done+"</b> of "+all+" line steps of this call done"+(K>=top.end?" · finished":K<top.k0?" · not started":"");
      for(const r of qa(".pg-cxhr",cxEl)){const a=top.hl.get(+r.dataset.l)||[],c=cnt0(a,K),mxh=Math.max(1,(top.hl.get(M.hl[0])||[]).length);r.style.setProperty("--w",(a.length/mxh*100).toFixed(1)+"%");r.style.setProperty("--f",(a.length?c/a.length*100:0).toFixed(1)+"%");q("b",r).textContent=c+" / "+a.length+" steps";r.classList.toggle("now",R.steps[K].l===+r.dataset.l&&K>=top.k0&&K<top.end);}
      const dot=q("[data-dot]",cxEl);if(dot){const c=cnt0(top.hl.get(M.hl[0])||[],K);q("b",dot).textContent=c;dot.title="L"+M.hl[0]+" so far: "+c;
        dot.style.left=Math.min(100,Math.log10(Math.max(1,c))/+dot.parentNode.dataset.top*100).toFixed(1)+"%";}}
    if(mx.rec&&M.calls.length&&top){const st=q('[data-st="rec"]',cxEl),lv=q("[data-lv]",cxEl),T=[],lvl=[];let rep=0,dmax=0;const seen=new Set();
      const walk=(x,d)=>{T.push([x,d]);for(const c of M.kids.get(x)||[])walk(c,d+1);};walk(top,0);
      for(const [x,d] of T){if(!lvl[d])lvl[d]=[0,0];lvl[d][1]++;if(x.k0<=K){lvl[d][0]++;dmax=Math.max(dmax,d);if(!mx.rec.pass.length){const kk=x.args.map(v=>sig(v.v)).join(",");if(seen.has(kk))rep++;else seen.add(kk);}}} // a shared path list makes equal-looking calls different
      const so=T.filter(([x])=>x.k0<=K).length;
      if(st)st.innerHTML="<b>"+so+"</b> of "+T.length+" calls so far · depth "+(dmax+1)+" of "+lvl.length+(rep?' · <span class="pg-cxrep">'+rep+" repeated (same arguments as an earlier call)</span>":"");
      if(lv){const mx2=Math.max(...lvl.map(l=>l[1])),show=lvl.slice(0,14);if(lv.children.length!==show.length)lv.innerHTML=show.map((l,i)=>'<div class="pg-cxlr"><span>level '+i+"</span><i><i></i></i><b></b></div>").join("")+(lvl.length>14?'<div class="pg-cxn">+'+(lvl.length-14)+" deeper levels</div>":"");
        show.forEach((l,i)=>{const r=lv.children[i];r.style.setProperty("--w",(l[1]/mx2*100).toFixed(1)+"%");r.style.setProperty("--f",(l[0]/l[1]*100).toFixed(1)+"%");r.lastChild.textContent=l[0]+(l[0]<l[1]?" / "+l[1]:"")+(i&&lvl[i-1][1]?"  ×"+(l[1]/lvl[i-1][1]).toFixed(1):"");});}}}
  if(cxEl)cxEl.addEventListener("click",e=>{const c=e.target.closest(".pg-cxc");if(c){cxPin=cxPin===c.dataset.m?null:c.dataset.m;cxKey="";render();return;}
    const ln=e.target.closest("[data-l]");if(ln&&cm()){const l=+ln.dataset.l,c2=cm();c2.setCursor({line:l-1,ch:0});const t=c2.charCoords({line:l-1,ch:0},"local").top;c2.scrollTo(null,Math.max(0,t-c2.getScrollInfo().clientHeight/3));
      const hdl=c2.addLineClass(l-1,"background","pg-cxflash");setTimeout(()=>c2.removeLineClass(hdl,"background","pg-cxflash"),900);}});
  for(const b of tabBtns){b.onclick=()=>setTab(b.dataset.tab);b.onkeydown=e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();e.stopPropagation();setTab(tab==="cx"?"vars":"cx");q('.pg-tab.on',PGhost).focus();}};}
  /* ---------- the heap: which boxes to draw ---------- */
  function refsOf(r){const out=[],a=v=>{if(v&&v.r!==undefined)out.push(v.r);};
    switch(r.k){case "obj":r.f.forEach(x=>a(x.v));break;case "arr":case "list":case "linked":case "stack":case "deque":case "pq":case "set":r.a.forEach(a);break;
      case "map":r.e.forEach(e=>{a(e[0]);a(e[1]);});break;case "entry":a(r.key);a(r.val);break;case "view":case "iter":if(r.of!=null)out.push(r.of);break;}
    return out;}
  function heapModel(S,C){
    const recs=S.recs,reach=new Set(),order=[],direct=new Set(),qq=[],grids=new Map(),rowOf=new Map(),chars=new Set(),bits=[],graphs=new Map(),gIn=new Map();
    // Memory off: only data structures and objects (Strings and numbers stay inline; an exception only while it is thrown)
    const visit=(id,isDirect)=>{if(id==null)return;const r=recs.get(id);if(!r||r.hid)return;
      if(!memOn&&dsaHide(id,r,S))return;
      if(isDirect)direct.add(id);if(reach.has(id))return;reach.add(id);order.push(id);qq.push(id);};
    for(const f of S.frames.filter(x=>x.fr).reverse().slice(0,MAXF).concat(S.frames.filter(x=>x.st))){for(const v of f.vars)if(v.v&&v.v.r!==undefined)visit(v.v.r,true);if(f.ret&&f.ret.r!==undefined)visit(f.ret.r,true);}
    if(S.step.x!=null)visit(S.step.x,true); // the exception being thrown
    // deeper frames that are not drawn still keep objects alive
    for(const f of S.frames.filter(x=>x.fr).reverse().slice(MAXF))for(const v of f.vars)if(v.v&&v.v.r!==undefined)visit(v.v.r,false);
    while(qq.length){const id=qq.shift(),r=recs.get(id);
      if(!memOn&&(r.k==="list"||r.k==="arr"||r.k==="map")){const nm=(C.by.get(id)||[])[0]||anyName(id,S),g=!GRN.test(nm||"")?null:r.k==="map"?mapAdj(r,S):adjOf(r,S); // a graph is known by its name (adj, graph, neighbors…)
        if(g){graphs.set(id,g);
          if(chosen(id,r,nm,"graph")==="graph"){for(const rid of g.rows){reach.add(rid);gIn.set(rid,id);for(const t of refsOf(recs.get(rid))){reach.add(t);gIn.set(t,id);}}continue;}}}
      if(!memOn&&isGrid(r,recs)){const rows=r.a.map(v=>v.r);grids.set(id,rows); // Memory off: a 2D array is one grid; its rows get no boxes of their own
        for(const rid of rows){reach.add(rid);rowOf.set(rid,id);for(const t of refsOf(recs.get(rid)))visit(t,false);}continue;}
      if(r.k==="obj"){for(const x of r.f)if(x.v&&x.v.r!==undefined)visit(x.v.r,true);}
      else if(r.k==="entry"||r.k==="view"||r.k==="iter"){for(const t of refsOf(r))visit(t,true);}
      else for(const t of refsOf(r))visit(t,OM());}
    // garbage: recently unreachable objects stay visible, faded
    const GK=["obj","arr","list","linked","stack","deque","pq","map","set","sb"];
    const freed=S.ev==="gc"?S.step.d.filter(r=>r.dead&&GK.includes(r.k)).map(r=>r.id):[];
    const gone=[];for(const [id,r] of recs){if(reach.has(id)||r.hid||r.pre||r.dead||typeof id!=="number")continue;if(GK.includes(r.k)&&(memOn||!dsaHide(id,r,S)&&!(r.k==="arr"&&r.et==="String")))gone.push(id); /* Memory off: a dropped String[] (split) is noise */}
    gone.sort((a,b)=>b-a);
    // Memory off: Strings the program indexes (charAt, substring…) are drawn as characters; ints used with bit operators as bits
    if(!memOn){for(const [id,ns] of C.by){const r=recs.get(id);if(r&&r.k==="str"&&r.s.length<=64&&ns.some(n=>IDX.cx.has(n))){chars.add(id);direct.add(id);if(!reach.has(id)){reach.add(id);order.push(id);}}}
      for(const [n,v] of C.prims)if(IDX.bits.has(n)&&BITP.has(v.p)&&bits.length<6)bits.push(n);}
    const pool=[];if(memOn)for(const [id,r] of recs)if(r.k==="str"&&r.pool)pool.push(id);
    // Memory off: each object is tagged with the names of the current method's variables (and static fields) that point to it
    const tags=new Map();
    if(!memOn){const fr=S.frames.find(f=>f.id===S.step.f),add=(id,n)=>{if(!tags.has(id))tags.set(id,[]);tags.get(id).push(n);};
      if(fr)for(const v of fr.vars)if(v.v&&v.v.r!==undefined&&reach.has(v.v.r))add(v.v.r,v.n);
      for(const c of S.frames.filter(x=>x.st))for(const v of c.vars)if(v.v&&v.v.r!==undefined&&reach.has(v.v.r))add(v.v.r,c.name+"."+v.n);}
    const {trees,inTree,objG}=memOn?{trees:new Map(),inTree:new Map(),objG:new Map()}:treesOf(S,C,order);
    for(const [id,g] of objG){graphs.set(id,g);const r=recs.get(id);if(chosen(id,r,(C.by.get(id)||[])[0]||anyName(id,S),"graph")==="graph")for(const rid of g.rows)if(rid!==id)gIn.set(rid,id);}
    for(const [a,b] of gIn)inTree.set(a,b);
    return {reach,order,direct,gone:gone.slice(0,12),freed:freed.slice(0,24),pool:pool.slice(0,40),tags,grids,rowOf,chars,bits,trees,inTree,graphs};}
  const dsaHide=(id,r,S)=>!DSAK.has(r.k)||r.k==="obj"&&r.ex&&id!==S.step.x||r.k==="arr"&&!r.len&&r.et==="String"; // main's empty args
  const DSAK=new Set(["obj","arr","list","linked","stack","deque","pq","map","set","sb"]);
  const DRAWN=new Map(); // heap id -> element (keyed, reused while the record is unchanged)
  let CTC=null; // the call-tree pseudo-record, kept while its picture is unchanged
  let curM=null; // the last heap model (drawArrows finds nodes drawn inside a tree picture)
  let flashed=[];
  function boxHtml(r,S,vw){
    const cur=vw&&vw.cur;
    if(cur==="grid"||cur==="intervals")return gridHtml(r,S,vw.deps,cur);
    if(cur==="chars")return charsHtml(r);
    if(cur==="astack")return astackHtml(r,S,vw.ak);
    if(cur==="stack"||cur==="queue")return sqHtml(r,S,cur);
    if(cur==="tree")return treeBox(r,S,vw);
    if(cur==="buckets")return bucketsHtml(r,S);
    if(cur==="graph")return graphBox(r,vw);
    if(cur==="forest"||cur==="seg")return '<div class="pg-bh">'+H(r.et)+"["+r.len+"] <small>"+(cur==="seg"?"segment tree":"Union-Find")+'</small></div><div class="pg-ttag">'+H(vw.tm.info)+"</div>"+PGVZ.treeHtml(vw.tm.T);
    if(cur==="fenwick")return vw.tm.sig;
    switch(r.k){
      case "bits":return PGVZ.bitsHtml(r.n,r.p,r.v,r.pv);
      case "ctree":return '<div class="pg-bh">Call tree <small>recursion</small></div><div class="pg-ttag">'+H(r.m.info)+"</div>"+PGVZ.treeHtml(r.m.T);
      case "obj":if(!memOn&&chainNode(r))return nodeHtml(r,S);{const tag=r.en?r.cls+" · "+r.en:r.rec?"record "+r.cls:r.ex?r.cls+" (exception)":r.anon?r.cls+" (anonymous)":r.cls;
        return '<div class="pg-bh">'+H(tag)+"</div>"+(r.f.length?'<table class="pg-flds">'+r.f.map(x=>'<tr data-k="h'+r.id+":"+H(x.n)+'"><td class="pg-vn">'+H(x.n)+'</td><td class="pg-vv">'+varVal(x.v,S,"h"+r.id+":"+x.n)+"</td></tr>").join("")+"</table>":'<div class="pg-novars">no fields</div>');}
      case "str":return '<div class="pg-bh">String'+(r.pool?" · pooled":"")+'</div><div class="pg-str">"'+H(r.s.length>60?r.s.slice(0,60)+"…":r.s)+'"</div>';
      case "box":return '<div class="pg-bh">'+H(r.cls)+(r.cached?" · cached":"")+'</div><div class="pg-str">'+H(r.s)+"</div>";
      case "arr":return '<div class="pg-bh">'+H(r.et)+"["+r.len+"]</div>"+cellsRow(r,S,cur==="bars");
      case "list":return '<div class="pg-bh">'+H(r.cls)+' <small>size '+r.size+(r.cap!==undefined&&r.cap!==null?" · capacity "+r.cap:"")+"</small></div>"+cellsRow(r,S,cur==="bars");
      case "linked":return '<div class="pg-bh">LinkedList <small>size '+r.size+'</small></div><div class="pg-chain">'+(r.a.length?r.a.map((v,i)=>'<span class="pg-node">'+cellVal(v,S,"h"+r.id+":"+i)+"</span>").join('<span class="pg-link">⇄</span>'):'<span class="pg-novars">empty</span>')+"</div>";
      case "stack":case "deque":return sqHtml(r,S,r.k==="stack"?"stack":"queue");
      case "pq":{const m=pqModel(r,S);
        return '<div class="pg-bh">PriorityQueue <small>size '+r.size+"</small></div>"+(m.kind?'<div class="pg-ttag">'+H(m.kind)+"</div>":"")+cellsRow(r,S)+(r.a.length?PGVZ.treeHtml(m.T):"");}
      case "map":return '<div class="pg-bh">'+H(r.cls)+' <small>size '+r.size+(r.cap?" · table "+r.cap:"")+"</small></div>"+(r.e.length?'<table class="pg-map">'+r.e.map((e,i)=>'<tr>'+(e[2]!==null&&e[2]!==undefined?'<td class="pg-bk">['+e[2]+"]</td>":"")+'<td class="pg-mk">'+cellVal(e[0],S)+'</td><td class="pg-ar">→</td><td class="pg-mv">'+cellVal(e[1],S,"h"+r.id+":v"+i)+"</td></tr>").join("")+"</table>":'<div class="pg-novars">empty</div>');
      case "set":return '<div class="pg-bh">'+H(r.cls)+' <small>size '+r.size+(r.cap?" · table "+r.cap:"")+"</small></div>"+'<div class="pg-cells">'+(r.a.length?r.a.map((v,i)=>'<div class="pg-cell"><div class="pg-cv0">'+cellVal(v,S)+"</div>"+(r.b&&r.b[i]!==null&&r.b[i]!==undefined?"<i>["+r.b[i]+"]</i>":"")+"</div>").join(""):'<div class="pg-novars">empty</div>')+"</div>";
      case "sb":return '<div class="pg-bh">'+H(r.cls)+' <small>length '+r.s.length+" · capacity "+r.cap+'</small></div><div class="pg-str">"'+H(r.s.length>60?r.s.slice(0,60)+"…":r.s)+'"</div>';
      case "entry":return '<div class="pg-bh">Map.Entry</div><div class="pg-str">'+cellVal(r.key,S)+" = "+cellVal(r.val,S)+"</div>";
      case "view":return '<div class="pg-bh">'+H(r.cls)+' <small>a live view</small></div><div class="pg-str"><span class="pg-dot" data-to="'+r.of+'"></span></div>';
      case "iter":return '<div class="pg-bh">Iterator <small>cursor '+r.cur+'</small></div><div class="pg-str"><span class="pg-dot" data-to="'+r.of+'"></span></div>';
      case "lambda":return '<div class="pg-bh">λ lambda</div><div class="pg-str pg-mono">'+H(r.text.length>48?r.text.slice(0,48)+"…":r.text)+"</div>";
      case "misc":return '<div class="pg-bh">'+H(r.cls)+'</div><div class="pg-str">'+H(r.s||"")+"</div>";}
    return '<div class="pg-bh">'+H(r.k)+"</div>";}
  /* R3: a linked-list node as one horizontal [ prev | data | next ] record; a null link is ⌀ */
  const chainNode=r=>{const s=r.f.filter(x=>x.self);return s.length>0&&s.length<=2&&(s.length===1||s.some(x=>/^prev/i.test(x.n)))&&r.f.length-s.length<=3;};
  function nodeHtml(r,S){const cell=(x,ptr)=>{const k="h"+r.id+":"+x.n,nul=!x.v||x.v.p==="null"||x.v.r===undefined&&ptr;
      return '<div class="pg-lnc'+(ptr?" ptr":"")+'" data-k="'+H(k)+'"><i>'+H(x.n)+"</i><b>"+(ptr&&nul?'<span class="pg-lnull" title="null: no next node">⌀</span>':varVal(x.v,S,k))+"</b></div>";};
    const prev=r.f.filter(x=>x.self&&/^prev/i.test(x.n)),data=r.f.filter(x=>!x.self),nxt=r.f.filter(x=>x.self&&!/^prev/i.test(x.n));
    return '<div class="pg-bh">'+H(r.cls)+'</div><div class="pg-ln">'+prev.map(x=>cell(x,1)).join("")+data.map(x=>cell(x,0)).join("")+nxt.map(x=>cell(x,1)).join("")+"</div>";}
  /* R3: an array-backed stack, slot [len-1] at the top and [0] at the bottom; slots above top are free (their old values stay, faded) */
  function astackHtml(r,S,ak){let h="";
    for(let i=r.len-1;i>=0;i--){const k="h"+r.id+":"+i,free=i>=ak.used;
      h+='<div class="pg-asi'+(free?" free":"")+'" data-k="'+k+'"'+(free?' title="not in the stack: pop only moves '+H(ak.f)+', the old value stays until a push overwrites it"':"")+'><i>['+i+']</i><b>'+cellVal(r.a[i],S,k)+"</b></div>";}
    return '<div class="pg-bh">'+H(r.et)+"["+r.len+'] <small>'+H(ak.name)+" · "+ak.used+" of "+r.len+" slots used · "+H(ak.f)+" = "+(ak.f==="top"&&IDX.top1?ak.top:ak.used)+'</small></div><div class="pg-ast">'+h+'<span class="pg-astm"></span></div>';}
  function stackMarks(el,vw){const ak=vw.ak,mk="ast"+ak.used;if(el._mk===mk)return;el._mk=mk;
    const wrap=q(".pg-ast",el),m=q(".pg-astm",el);if(!wrap||!m)return;const cells=qa(".pg-asi",wrap),n=cells.length;
    const c=ak.used?cells[n-ak.used]:cells[n-1];if(!c)return;
    m.textContent=ak.used?"← top"+(ak.f==="top"?"":" ("+ak.f+" − 1)"):"empty"+(ak.f==="top"&&IDX.top1?" · top = −1":"");
    const cb=q("b",c);m.style.left=(ak.used?cb.offsetLeft+cb.offsetWidth+10:cb.offsetLeft)+"px";m.style.top=(ak.used?c.offsetTop+c.offsetHeight/2:c.offsetTop+c.offsetHeight+10)+"px";m.classList.toggle("none",!ak.used);}
  /* a stack drawn upright (top first, an open-topped container) or a queue left to right (front … back) */
  function sqHtml(r,S,cur){
    const stk=cur==="stack",items=stk&&r.k==="stack"?r.a.slice().reverse():r.a,show=Math.min(items.length,40),n=items.length;
    let h="";for(let i=0;i<show;i++){const lab=stk?(i===0?"top":i===n-1?"bottom":""):n===1?"front · back":i===0?"front":i===n-1?"back":"";
      h+='<div class="pg-sqi"><b class="pg-sqv">'+cellVal(items[i],S)+'</b><span class="pg-sqm"></span>'+(lab?'<span class="pg-sqe">'+lab+"</span>":"")+"</div>";}
    if(n>show)h+='<div class="pg-sqi pg-cmore">+'+(n-show)+"</div>";
    return '<div class="pg-bh">'+H(r.cls)+" <small>size "+r.size+" · "+(stk?"a stack (last in, first out)":"a queue (first in, first out)")+"</small></div>"+
      '<div class="pg-sq '+(stk?"pg-sqs":"pg-sqq")+'">'+(h||'<div class="pg-novars">empty</div>')+"</div>";}
  function cellsRow(r,S,bars){const n=r.k==="arr"?r.len:r.a.length;if(!n)return '<div class="pg-cells"><div class="pg-novars">empty</div></div>';
    const show=Math.min(r.a.length,64);let cells="",mx=0;
    if(bars)for(let i=0;i<show;i++)mx=Math.max(mx,Math.abs(numOf(r.a[i],S))||0);
    for(let i=0;i<show;i++){const k="h"+r.id+":"+i,v=bars?numOf(r.a[i],S):0;
      cells+='<div class="pg-cell'+(bars?" pg-barc":"")+'" data-k="'+k+'">'+(bars?'<div class="pg-vbar'+(v<0?" neg":"")+'" style="height:'+(4+Math.round(56*Math.abs(v)/(mx||1)))+'px"></div>':"")+'<div class="pg-cv0">'+cellVal(r.a[i],S,k)+"</div><i>"+i+"</i></div>";}
    return '<div class="pg-cells">'+cells+(n>show?'<div class="pg-cell pg-cmore">+'+(n-show)+"</div>":"")+"</div>";}
  /* Memory off: a 2D array (or a List of int[]) as one table, or as interval bars */
  function gridHtml(r,S,rows,cur){
    const C=Math.max(0,...rows.map(x=>x.len)),jag=rows.some(x=>x.len!==C),cols=Math.min(C,40);
    const head='<div class="pg-bh">'+(r.k==="arr"?H(r.et.replace(/\[\]$/,""))+"["+rows.length+"]"+(jag?"[]":"["+C+"]"):H(r.cls)+" <small>size "+r.size+"</small>")+"</div>";
    if(cur==="intervals")return head+PGVZ.intervalsHtml(rows.map(x=>({a:numOf(x.a[0],S),b:numOf(x.a[1],S),ka:"h"+x.id+":0",kb:"h"+x.id+":1"})));
    let h=head+'<table class="pg-grid"><tr><th></th>';
    for(let j=0;j<cols;j++)h+='<th data-c="'+j+'"><b class="pg-gm"></b>'+j+"</th>";
    h+="</tr>";
    rows.forEach((x,i)=>{h+='<tr data-r="'+i+'"><th><b class="pg-gm"></b>'+i+"</th>";
      for(let j=0;j<cols;j++)h+=j<x.len?'<td data-k="h'+x.id+":"+j+'" data-c="'+j+'">'+cellVal(x.a[j],S,"h"+x.id+":"+j)+"</td>":'<td class="pg-gx"></td>';h+="</tr>";});
    return h+"</table>";}
  /* a String or StringBuilder as one cell per character */
  function charsHtml(r){const s=r.s,show=Math.min(s.length,64);let c="";
    for(let i=0;i<show;i++)c+='<div class="pg-cell pg-chc"><div class="pg-cv0">'+(s[i]===" "?'<span class="pg-dim">␣</span>':H(s[i]))+"</div><i>"+i+"</i></div>";
    return '<div class="pg-bh">'+(r.k==="str"?"String":H(r.cls))+" <small>length "+s.length+(r.k==="sb"?" · capacity "+r.cap:"")+'</small></div><div class="pg-cells">'+(c||'<div class="pg-novars">empty ""</div>')+(s.length>show?'<div class="pg-cell pg-cmore">+'+(s.length-show)+"</div>":"")+"</div>";}
  function getBox(id,r,S,cls,tags,vw){
    let el=DRAWN.get(id);
    if(!el){el=document.createElement("div");el.dataset.id=id;el._fresh=true;el._th=false;el._tag=null;DRAWN.set(id,el);}
    // a record is an immutable snapshot of one object, and the Strings and boxed numbers a box shows inline never change,
    // so a box is rebuilt only when its own record changes
    const vk=vw?vw.cur:"",deps=vw&&vw.deps;el._vw=vw;
    const vs=vw&&vw.sig;
    if(el._rec!==r||el._vk!==vk||el._sig!==vs||deps&&!(el._deps&&el._deps.length===deps.length&&deps.every((d,i)=>d===el._deps[i]))){
      el.innerHTML=boxHtml(r,S,vw);el._rec=r;el._vk=vk;el._sig=vs;el._bk=K;el._deps=deps;el._w=0;el._tag=null;el._vt="";el._mk=null;el._ixm=null;el._dp=null;
      if(vw&&vw.opts.length>1)q(".pg-bh",el).insertAdjacentHTML("beforeend",'<select class="pg-as" aria-label="Show as" title="Show as">'+vw.opts.map(o=>'<option value="'+o+'"'+(o===vw.cur?" selected":"")+">"+ASL[o]+"</option>").join("")+"</select>");}
    const base="pg-box pg-k-"+r.k+(cls||"");
    if(el._base!==base){el._base=base;el.className=base+(el._th?" pg-thrown":"");}
    const tag=/pg-freed/.test(cls||"")?"freed by GC":/pg-gone/.test(cls||"")?"unreachable":null;
    if(tag!==el._tag){el._tag=tag;const t=q(".pg-gtag.gn",el);if(t)t.remove();if(tag)el.insertAdjacentHTML("afterbegin",'<span class="pg-gtag gn">'+tag+"</span>");}
    if(r.k==="obj")el.dataset.cls=r.cls;
    const vt=tags&&tags.length?tags.join(" · "):"";
    if(vt!==el._vt){el._vt=vt;const t=q(".pg-vtag",el);if(t)t.remove();if(vt)el.insertAdjacentHTML("afterbegin",'<span class="pg-vtag">'+H(vt)+"</span>");if(vt&&!el._fresh&&!still){el.classList.remove("pg-tagmv");void el.offsetWidth;el.classList.add("pg-tagmv");}}
    if(el._fresh){el.classList.add("pg-new");setTimeout(()=>el.classList.remove("pg-new"),500);}
    return el;}
  function drawHeap(S,M,chg,C){
    const recs=S.recs;
    // which ids get their own box
    curM=M;
    const show=[];for(const id of M.order){const r=recs.get(id);if(!r||M.inTree.has(id))continue;if((r.k==="str"&&r.pool&&!M.chars.has(id))||((r.k==="str"||r.k==="box")&&!M.direct.has(id)))continue;if(r.k==="entry"&&!M.direct.has(id))continue;show.push(id);}
    // pool strip
    const pb=q(".pg-poolb",poolEl);
    if(M.pool.length){poolEl.hidden=false;const keep=new Set();
      for(const id of M.pool){const r=recs.get(id);const el=getBox(id,r,S,M.reach.has(id)?"":" pg-quiet");keep.add(el);if(el.parentNode!==pb)pb.appendChild(el);}
      for(const el of Array.from(pb.children))if(!keep.has(el))el.remove();}
    else{poolEl.hidden=true;pb.innerHTML="";}
    // heap boxes
    const keep=new Set(),els=[];
    const vws=new Map();
    const ct=memOn?null:ctModel(S); // v8: the recursion call tree comes after the data (it is the bigger picture now that it shows every call)
    for(const id of show){const r=recs.get(id),vw=viewOf(id,r,S,M,C);vws.set(id,vw);const el=getBox(id,r,S,"",M.tags.get(id),vw);els.push([id,el]);keep.add(el);}
    if(ct){if(!CTC||CTC.sig!==ct.sig)CTC={sig:ct.sig,rr:{k:"ctree",id:"ct",m:ct}};const el=getBox("ct",CTC.rr,S,"");els.push(["ct",el]);keep.add(el);flipTree(el);}
    for(const n of M.bits){const v=C.prims.get(n),pv=prevPrim(n,S),val=v.p==="char"?v.c:v.s,pval=pv&&sig(pv)!==sig(v)?(pv.p==="char"?pv.c:pv.s):undefined,ck=n+"|"+v.p+"|"+val+"|"+pval;
      let rr=BITC.get(ck);if(!rr){rr={k:"bits",id:"b:"+n,n,p:v.p,v:val,pv:pval};BITC.set(ck,rr);}
      const el=getBox(rr.id,rr,S,"");els.push([rr.id,el]);keep.add(el);}
    for(const id of M.gone){const r=recs.get(id);if(!r)continue;const el=getBox(id,r,S," pg-gone");els.push([id,el]);keep.add(el);}
    for(const id of M.freed){const r=recs.get(id);if(!r)continue;const el=getBox(id,r,S," pg-gone pg-freed");els.push([id,el]);keep.add(el);}
    for(const el of Array.from(heapEl.children))if(!keep.has(el))el.remove();
    for(const [,el] of els)if(el.parentNode!==heapEl)heapEl.appendChild(el);
    for(const [id,el] of els)if(typeof id==="number"&&M.reach.has(id))decorate(el,id,recs.get(id),S,C,M,vws.get(id),chg);
    // the exception being thrown
    for(const [id,el] of els){const th=id===S.step.x;if(th!==el._th){el._th=th;el.classList.toggle("pg-thrown",th);const t=q(".pg-gtag.th",el);if(th&&!t)el.insertAdjacentHTML("afterbegin",'<span class="pg-gtag th">thrown</span>');else if(!th&&t)t.remove();}}
    // changed cells and fields flash: only inside the boxes this step touched
    for(const el of flashed)el.classList.remove("pg-chg");flashed=[];
    const touched=new Set();for(const k of chg)if(k[0]==="h"){const i=k.indexOf(":");touched.add(i<0?k.slice(1):k.slice(1,i));}
    for(const id of touched)for(const bid of [+id,M.rowOf.get(+id)]){const el=bid!=null&&DRAWN.get(bid);if(!el||!el.isConnected)continue;for(const c of qa("[data-k]",el))if(chg.has(c.dataset.k)){c.classList.add("pg-chg");flashed.push(c);}}
    layout(S,els);
    if(!els.length&&!M.pool.length)heapEl.innerHTML='<div class="pg-empty">'+(memOn?"<b>The heap is empty.</b>Objects appear here the moment <code>new</code> runs.":"<b>Nothing to draw yet.</b>Step forward (→ or ▶): arrays, lists, maps and objects appear here the moment they are created. Plain values (int, double, String…) are in the Variables table.")+"</div>";}
  /* ---------- layout: linked chains in a row, trees top-down, everything else flows ---------- */
  function layout(S,els){
    const W=Math.max(320,heapEl.clientWidth||600),GX=34,GY=memOn?42:44; // Memory off: room for the variable tags above each box
    for(const [,el] of els){if(!el._w){el._w=el.offsetWidth;el._h=el.offsetHeight;}}
    const recs=S.recs,byId=new Map(els),placed=new Set();let y=memOn?36:22,maxX=0;
    const selfF=r=>r&&r.k==="obj"?r.f.filter(x=>x.self&&x.v!==undefined):[];
    // the link a chain follows: "next", or the only self-typed field, or the one beside prev; two or more others (left/right) make a tree
    const nextF=r=>{const f=selfF(r);return f.find(x=>/^next$/i.test(x.n))||(f.length===1?f[0]:f.length===2&&f.some(x=>/^prev/i.test(x.n))?f.find(x=>!/^prev/i.test(x.n)):null);};
    const isTree=r=>selfF(r).length>=2&&!nextF(r),cyc=new Map();
    const put=(id,x,yy)=>{const el=byId.get(id);if(el._x!==x){el._x=x;el.style.left=x+"px";}if(el._y!==yy){el._y=yy;el.style.top=yy+"px";}placed.add(id);maxX=Math.max(maxX,x+el._w);};
    // trees: objects with two or more self-typed fields (left/right)
    const treeIds=els.map(e=>e[0]).filter(id=>isTree(recs.get(id)));
    const isChild=new Set();for(const id of treeIds)for(const x of selfF(recs.get(id)))if(x.v&&x.v.r!==undefined&&byId.has(x.v.r))isChild.add(x.v.r);
    for(const root of treeIds.filter(id=>!isChild.has(id))){
      const rows=[];let idx=0;const seen=new Set();
      // in-order (first child, the node, then the others) with an explicit stack: a 100,000-deep chain of left links must not overflow
      const st=[{id:root,d:0,s:0}];
      while(st.length){const t=st[st.length-1];
        if(t.s===0){if(t.id==null||seen.has(t.id)||!byId.has(t.id)){st.pop();continue;}seen.add(t.id);t.f=selfF(recs.get(t.id));t.s=1;const a=t.f[0];st.push({id:a&&a.v&&a.v.r,d:t.d+1,s:0});continue;}
        st.pop();rows.push({id:t.id,d:t.d,i:idx++});for(const x of t.f.slice(1).reverse())st.push({id:x.v&&x.v.r,d:t.d+1,s:0});}
      const mx=g=>rows.reduce((m,r)=>Math.max(m,g(r)),0); // not Math.max(...rows): too many arguments for a long chain
      const cw=mx(r=>byId.get(r.id)._w)+14,ch=mx(r=>byId.get(r.id)._h)+GY+10;
      for(const r of rows)put(r.id,6+r.i*cw,y+r.d*ch);
      y+=(mx(r=>r.d)+1)*ch+8;}
    // chains: singly or doubly linked nodes in a row; a next that leads back into the row is a cycle
    const chainIds=els.map(e=>e[0]).filter(id=>!placed.has(id)&&nextF(recs.get(id)));
    const pointed=new Set();for(const id of chainIds){const f=nextF(recs.get(id));if(f.v&&f.v.r!==undefined)pointed.add(f.v.r);}
    const heads=chainIds.filter(id=>!pointed.has(id)).concat(chainIds.filter(id=>pointed.has(id)));
    let cx0=6,cRowH=0,cBack=0; // R3: chains share a row while they fit (a list being reversed shows both halves side by side)
    for(const h of heads){if(placed.has(h))continue;let id=h;const seq=[];
      while(id!=null&&byId.has(id)&&!placed.has(id)&&seq.length<60){seq.push(id);placed.add(id);const f=nextF(recs.get(id));id=f&&f.v&&f.v.r!==undefined?f.v.r:null;}
      if(seq.length<2&&!(memOn?0:seq.length&&chainIds.length>1)){for(const s of seq)placed.delete(s);continue;}
      const back=seq.indexOf(id);if(back>=0){cyc.set(seq[seq.length-1],back===0?"↺ circular":"↺ back to node "+(back+1));if(seq.length>1)cyc.set(id,"in");}
      const tw=seq.reduce((s,q2)=>s+byId.get(q2)._w+GX,0)-GX;
      if(cx0>6&&(cx0+tw>W-6||back>=0||cBack)){y+=cRowH+GY+(cBack?26:0);cx0=6;cRowH=0;cBack=0;}
      let x=cx0;for(const s of seq){const el=byId.get(s);placed.delete(s);put(s,x,y);x+=el._w+GX;cRowH=Math.max(cRowH,el._h);}
      cx0=x+40;if(back>=0)cBack=1;}
    if(cx0>6)y+=cRowH+GY+(cBack?26:0); // room for the cycle arrow that runs under the row
    // the rest: rows that wrap at the panel width
    let x=6,rowH=0;
    for(const [id,el] of els){if(placed.has(id))continue;if(x>6&&x+el._w>W-6){x=6;y+=rowH+GY;rowH=0;}put(id,x,y);x+=el._w+GX;rowH=Math.max(rowH,el._h);}
    y+=rowH;
    for(const [id,el] of els){const c=cyc.get(id)||"";if(c===(el._cy||""))continue;el._cy=c;const t=q(".pg-gtag.cy",el);if(t)t.remove();
      el.classList.toggle("pg-cyin",c==="in");if(c&&c!=="in")el.insertAdjacentHTML("afterbegin",'<span class="pg-gtag cy">'+c+"</span>");}
    // R3, Memory off: a small picture is scaled up (≤ 1.8×) and centred; sizes only grow during a run, so the scale settles instead of jumping (never the empty-state message: it was scaled and pushed off the panel)
    let s=1,ox=0;
    if(!memOn&&R&&els.length){const mw=R._mw=Math.max(R._mw||0,maxX),mh=R._mh=Math.max(R._mh||0,y+12),ah=panel.clientHeight-heapEl.offsetTop-24;
      s=Math.max(FITALL?.4:.9,Math.min(1.8,(W-16)/Math.max(mw,1),ah/Math.max(mh,1)));s=Math.floor(s*20)/20;
      if(S.ev==="end"||els.every(([,el])=>el.classList.contains("pg-gone")))s=Math.min(s,1);} // v5: a tall picture zooms out to fit; garbage is never enlarged
    if(UZ!==1)s=Math.round(s*UZ*100)/100;
    let oy=0;if(!memOn&&R&&els.length){ox=Math.max(0,Math.floor((W-(R._mw||maxX)*s)/2));oy=Math.max(0,Math.min(160,Math.floor((panel.clientHeight-heapEl.offsetTop-24-(R._mh||y+12)*s)/3)));} // v8: and a third of the free height above it
    const xf=s!==1||ox||oy?"translate("+ox+"px,"+oy+"px) scale("+s+")":"";if(heapEl.style.transform!==xf)heapEl.style.transform=xf;heapEl._s=s;
    heapEl.style.height=Math.max(60,y+12)+"px";heapEl.style.marginBottom=s!==1||oy?Math.round((y+12)*(s-1)+oy)+"px":"";heapEl.style.marginRight=s>1?Math.round((maxX+12)*(s-1))+"px":""; // never negative: that widens the heap and the next layout wraps widerheapEl.style.minWidth=Math.max(0,maxX+12)+"px";
    // boxes appear where they belong; only boxes that move later glide
    for(const [,el] of els)if(el._fresh){el.classList.add("pg-place");el._fresh=false;requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.remove("pg-place")));}}
  /* ---------- arrows ---------- */
  function drawArrows(chg){
    const pr=panel.getBoundingClientRect(),sx=panel.scrollLeft,sy=panel.scrollTop;
    svg.setAttribute("width",panel.scrollWidth);svg.setAttribute("height",panel.scrollHeight);
    let paths="",si=0,ui=0,boxR=null;
    const sR0=dot=>{const b0=dot.closest(".pg-box");return b0?b0.getBoundingClientRect().right-pr.left+sx:dot.getBoundingClientRect().right-pr.left+sx;}; // the right edge of the arrow's own box
    const gutter=(x0,y0,T)=>{if(!boxR)boxR=qa("#pgHeap .pg-box,#pgPool .pg-box",panel).map(b=>{const r=b.getBoundingClientRect();return {L:r.left-pr.left+sx,R:r.right-pr.left+sx,T:r.top-pr.top+sy,B:r.bottom-pr.top+sy};});
      let gx=x0;for(let n=0;n<3;n++)for(const b of boxR)if(b.T<T-2&&b.B>y0&&b.L<gx+6&&b.R>gx-6)gx=b.R+12; // step right of any box the drop would cut through
      return gx<pr.width+sx-6?gx:x0;};
    for(const dot of qa(".pg-dot",panel)){
      const to=dot.dataset.to;let tgt=DRAWN.get(+to);if(tgt&&!tgt.isConnected)tgt=null;
      if(!tgt&&curM&&curM.inTree.has(+to)){const rb=DRAWN.get(curM.inTree.get(+to));tgt=rb&&rb.isConnected&&q('[data-tk="o'+to+'"]',rb);} // a node inside a tree picture
      if(!tgt){dot.classList.add("pg-dangle");continue;}
      if(!dot.getClientRects().length)continue; // inside a hidden area (Memory off)
      const a=dot.getBoundingClientRect(),b=tgt.getBoundingClientRect();
      const x1=a.left+a.width/2-pr.left+sx,y1=a.top+a.height/2-pr.top+sy;
      const L=b.left-pr.left+sx,T=b.top-pr.top+sy,Rr=L+b.width,B=T+b.height,sb=dot.closest(".pg-box"),sL=sb?sb.getBoundingClientRect().left-pr.left+sx:x1;
      let d;
      // R3, Memory on: a stack variable pointing down into the heap leaves to the right, drops in its own gutter lane, runs along
      // its own lane above the target's row and enters the target from the top (no curves across headings or other boxes)
      const stk=memOn&&dot.closest("#pgFrames");
      if(stk&&T>y1+12){const i=si++,r=5,yh=T+Math.min(13,b.height/2),gx=gutter(x1+22+i*7,y1,yh+8);
        if(!boxR)gutter(0,0,0);const clear=Rr<gx-12&&!boxR.some(o=>o.L>Rr+2&&o.L<gx&&o.T<yh&&o.B>yh);
        // nothing between the lane and the target: in at its right side, level with its title, pointing left
        if(clear)d="M"+x1+" "+y1+" H"+(gx-r)+" Q"+gx+" "+y1+" "+gx+" "+(y1+r)+" V"+(yh-r)+" Q"+gx+" "+yh+" "+(gx-r)+" "+yh+" H"+(Rr+1);
        else{const yl=T-14-(i%4)*5,x2=Math.max(L+12,Rr-18-(i%4)*8),s=x2<gx?-1:1; // else down onto its top
          d="M"+x1+" "+y1+" H"+(gx-r)+" Q"+gx+" "+y1+" "+gx+" "+(y1+r)+" V"+(yl-r)+" Q"+gx+" "+yl+" "+(gx+s*r)+" "+yl+" H"+(x2-s*r)+" Q"+x2+" "+yl+" "+x2+" "+(yl+r)+" V"+(T-1);}}
      else if(L>x1+18){const x2=L-1,y2=Math.min(Math.max(T+14,y1-40),B-8),y2b=T+14;d=orth(x1,y1,x2,Math.abs(y2b-y1)<b.height?Math.max(T+8,Math.min(y1,B-8)):y2b);}
      else if(T>y1+12){const x2=Math.min(Math.max(x1,L+12),Rr-12);d="M"+x1+" "+y1+" C"+x1+" "+(y1+Math.max(30,(T-y1)/2))+","+x2+" "+(T-Math.max(30,(T-y1)/2))+","+x2+" "+(T-1);}
      else if(B<y1-12){const i=ui++,r=5,xo=sR0(dot)+10+(i%3)*5,yu=B+12+(i%3)*4,x2=Math.min(Math.max(L+16,(L+Rr)/2+(i%3)*6),Rr-12),s=x2<xo?-1:1;
        // R3: a field pointing up (an object's String in the pool above): right out of its box, up, across, into the target from below
        d=yu<y1-2*r?"M"+x1+" "+y1+" H"+(xo-r)+" Q"+xo+" "+y1+" "+xo+" "+(y1-r)+" V"+(yu+r)+" Q"+xo+" "+yu+" "+(xo+s*r)+" "+yu+" H"+(x2-s*r)+" Q"+x2+" "+yu+" "+x2+" "+(yu-r)+" V"+(B+1)
          :"M"+x1+" "+y1+" C"+x1+" "+(y1-40)+","+x2+" "+(B+40)+","+x2+" "+(B+1);}
      else if(Rr<x1-10&&sL>Rr&&sL-Rr<=90){const y2=Math.max(T+8,Math.min(y1,B-8));d="M"+sL+" "+y1+" C"+(sL-14)+" "+y1+","+(Rr+14)+" "+y2+","+(Rr+1)+" "+y2;} // the neighbour on the left (a prev link): straight out of this box's left side
      else if(Rr<x1-10){const yb=Math.max(y1,B)+14+Math.min(30,(x1-Rr)/14),ex=Rr-16;d="M"+x1+" "+y1+" C"+(x1+26)+" "+y1+","+(x1+26)+" "+yb+","+(x1+4)+" "+yb+" H"+(ex+8)+" Q"+ex+" "+yb+" "+ex+" "+(yb-8)+" V"+(B+1);} // left on the same row (prev, a cycle): a U under the row
      else{const yb=Math.max(y1,B)+46;d="M"+x1+" "+y1+" C"+(x1+50)+" "+yb+","+(L-50)+" "+yb+","+(L-1)+" "+(T+14);} // a back edge (cycle)
      const hot=dot.dataset.k&&chg.has(dot.dataset.k);
      paths+='<path class="'+(hot?"hot":"")+'" data-to="'+to+'"'+(dot.dataset.k?' data-k="'+H(dot.dataset.k)+'"':"")+' d="'+d+'" marker-end="url(#pgAh'+(hot?"h":"")+')"/>';}
    svg.innerHTML='<defs><marker id="pgAh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="pg-ahd"/></marker>'+
      '<marker id="pgAhh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="pg-ahd hot"/></marker></defs>'+paths;}
  function orth(x1,y1,x2,y2){ // rounded orthogonal path: right, down/up, right
    const mx=x1+Math.max(10,Math.min(40,(x2-x1)/2)),r=Math.min(8,Math.abs(y2-y1)/2,Math.abs(mx-x1));
    if(Math.abs(y2-y1)<2)return "M"+x1+" "+y1+" H"+x2;
    const s=y2>y1?1:-1;
    return "M"+x1+" "+y1+" H"+(mx-r)+" Q"+mx+" "+y1+" "+mx+" "+(y1+s*r)+" V"+(y2-s*r)+" Q"+mx+" "+y2+" "+(mx+r)+" "+y2+" H"+x2;}
  /* ---------- hover tracing: a variable lights its arrow and object; an object lights every arrow into it and its class ---------- */
  let lit=[];
  const light=el=>{if(el){el.classList.add("pg-hl");lit.push(el);}};
  function unlight(){for(const el of lit)el.classList.remove("pg-hl");lit=[];}
  panel.addEventListener("mouseover",e=>{
    unlight();const t=e.target;
    const cls=t.closest(".pg-cls");if(cls){light(cls);for(const b of qa('.pg-box[data-cls="'+cls.dataset.name+'"]',panel))light(b);return;}
    const host=t.closest(".pg-dot")?t.closest(".pg-dot"):t.closest("tr,.pg-cell,.pg-sqi,.pg-node");
    const dots=host?(host.classList.contains("pg-dot")?[host]:qa(".pg-dot",host)):[];
    if(dots.length&&!t.closest(".pg-box:not(.pg-k-obj)")||dots.length&&t.closest(".pg-cell,.pg-sqi,.pg-node,tr")){
      for(const d of dots){light(d.closest("tr,.pg-cell,.pg-sqi,.pg-node"));const b=DRAWN.get(+d.dataset.to);if(b&&b.isConnected)light(b);
        for(const pth of qa('path[data-to="'+d.dataset.to+'"]',svg))if(!d.dataset.k||pth.dataset.k===d.dataset.k)light(pth);}
      return;}
    const box=t.closest(".pg-box");
    if(box){light(box);for(const pth of qa('path[data-to="'+box.dataset.id+'"]',svg))light(pth);if(box.dataset.cls)light(q('.pg-cls[data-name="'+box.dataset.cls+'"]',panel));}});
  panel.addEventListener("mouseleave",unlight);
  if(objsBox){objsBox.checked=objMode;objsBox.onchange=()=>{objMode=objsBox.checked;LS.set("js1-pg-objs",objMode?"1":"0");DRAWN.forEach(el=>{el._rec=null;});if(R&&R.steps.length)render();};}
  /* ---------- wiring ---------- */
  q("#pgGo").onclick=visualize;
  q("#pgRun").onclick=()=>{if(box._run)box._run();};
  q("#pgReset").onclick=()=>{stop();setCode(baseCode);setFile();LS.set("js1-pg-code","");why.textContent="Code restored. Press ▶ Visualize.";};
  exSel.onchange=()=>{const e=EX[+exSel.value];if(!e)return;baseCode=e.code;box._orig=e.code;setCode(e.code);inEl.value=e.stdin;q("#pgInBox").open=!!e.stdin;exSel.value="";setFile();visualize();};
  q("#pgShare").onclick=async()=>{const code=getCode();const t=await packCode(code);const url=location.href.split("#")[0]+"#code="+t+(inEl.value?"&in="+b64u(new TextEncoder().encode(inEl.value)):"");
    try{history.replaceState(null,"",url);}catch(e){}
    const ok=()=>{why.innerHTML='<b class="pg-good">Link copied</b> · anyone who opens it gets this program'+(inEl.value?" and its input":"")+".";};
    if(navigator.clipboard)navigator.clipboard.writeText(url).then(ok,()=>{why.textContent="Copy this link: "+url;});else why.textContent="Copy this link: "+url;};
  qa(".pg-ctl [data-a]").forEach(b=>b.onclick=()=>act(b.dataset.a));
  function act(a){if(!R||!R.steps.length)return;if(a!=="play")stop();switch(a){case "first":go(0);break;case "back":go(K-1);break;case "next":go(K+1);break;case "last":go(R.steps.length-1);break;case "play":play();break;
    case "over":stepOver();break;case "out":stepOut();break;case "bp":toBp();break;}}
  slide.oninput=()=>{stop();go(+slide.value);};
  speedSel.onchange=()=>{LS.set("js1-pg-speed",speedSel.value);if(timer){stop();play();}};
  inEl.oninput=()=>LS.set("js1-pg-stdin",inEl.value);
  /* Memory switch: off (default) = only the data structures; on = stack, classes, String pool and every heap object */
  function setMem(on){memOn=on;HI=null;histKey="";if(R)R._hr=null;memBox.checked=on;PGhost.classList.toggle("pg-nomem",!on);LS.set("js1-pg-mem",on?"1":"0");DRAWN.forEach(el=>{el._rec=null;el._w=0;});heapEl.innerHTML="";DRAWN.clear();if(R&&R.steps.length)render();}
  memBox.onchange=()=>setMem(memBox.checked);
  PGhost.classList.toggle("pg-nomem",!memOn);memBox.checked=memOn;
  /* full screen: the Fullscreen API when it is allowed, otherwise (iPhone) an expanded layout that hides the site chrome */
  let apiFull=false;
  function setFull(on,api){
    document.body.classList.toggle("pg-full",on);fullBtn.setAttribute("aria-pressed",String(on));fullBtn.querySelector("span").textContent=on?"Exit full screen":"Full screen";LS.set("js1-pg-full",on?"1":"0");
    const de=document.documentElement;
    if(on&&api&&de.requestFullscreen&&!document.fullscreenElement){apiFull=true;de.requestFullscreen().catch(()=>{apiFull=false;});}
    if(!on&&document.fullscreenElement){apiFull=false;document.exitFullscreen().catch(()=>{});}
    afterResize();}
  fullBtn.onclick=()=>setFull(!document.body.classList.contains("pg-full"),true);
  document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement&&apiFull){apiFull=false;setFull(false);}});
  if(LS.get("js1-pg-full")==="1")setFull(true,false); // a browser asks for a click before real full screen, so a reload opens the expanded layout
  /* resizable panels: editor width (x) and the bottom panels' height (y), saved as "width,height" */
  const sp=(LS.get("js1-pg-split")||"").split(",");if(+sp[0])PGhost.style.setProperty("--pg-lw",sp[0]+"px");if(+sp[1])PGhost.style.setProperty("--pg-bh",sp[1]+"px");
  function saveSplit(){LS.set("js1-pg-split",(parseInt(PGhost.style.getPropertyValue("--pg-lw"))||"")+","+(parseInt(PGhost.style.getPropertyValue("--pg-bh"))||""));}
  function sizeTo(axis,px){const r=PGhost.getBoundingClientRect(),rr=q(".pg-right",PGhost).getBoundingClientRect();
    if(axis==="x")PGhost.style.setProperty("--pg-lw",Math.round(Math.max(260,Math.min(r.width-420,px)))+"px");
    else PGhost.style.setProperty("--pg-bh",Math.round(Math.max(110,Math.min(rr.height-180,px)))+"px");}
  qa(".pg-split",PGhost).forEach(el=>{const axis=el.classList.contains("pg-sx")?"x":"y";
    el.addEventListener("pointerdown",e=>{e.preventDefault();el.setPointerCapture(e.pointerId);el.classList.add("on");
      const mv=ev=>{if(axis==="x")sizeTo("x",ev.clientX-PGhost.getBoundingClientRect().left);else sizeTo("y",q(".pg-right",PGhost).getBoundingClientRect().bottom-ev.clientY);};
      const up=()=>{el.removeEventListener("pointermove",mv);el.removeEventListener("pointerup",up);el.classList.remove("on");saveSplit();afterResize();};
      el.addEventListener("pointermove",mv);el.addEventListener("pointerup",up);});
    el.addEventListener("keydown",e=>{const d={ArrowLeft:-24,ArrowRight:24,ArrowUp:24,ArrowDown:-24}[e.key];if(!d)return;e.preventDefault();e.stopPropagation();
      if(axis==="x")sizeTo("x",q(".pg-left",PGhost).getBoundingClientRect().width+d);else sizeTo("y",q(".pg-bottom",PGhost).getBoundingClientRect().height+d);saveSplit();afterResize();});});
  function afterResize(){requestAnimationFrame(()=>{const c=cm();if(c)c.refresh();if(R&&R.steps.length){DRAWN.forEach(el=>el._w=0);render();}});}
  document.addEventListener("keydown",e=>{
    const t=e.target;
    if(e.key==="Escape"&&document.body.classList.contains("pg-full")&&!document.fullscreenElement&&!(cm()&&cm().state.completionActive)){setFull(false);return;}
    if(t&&t.closest&&t.closest("input,textarea,select,.CodeMirror,[contenteditable]")){
      if(t.closest(".CodeMirror")&&e.key==="Enter"&&(e.ctrlKey||e.metaKey)&&t.closest("#pgv")){e.preventDefault();e.stopPropagation();visualize();}return;}
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    const k=e.key.length===1?e.key.toLowerCase():e.key;
    if(k==="f"){e.preventDefault();fullBtn.click();return;}
    if(k==="m"){e.preventDefault();setMem(!memOn);return;}
    if(k==="c"){e.preventDefault();setTab(tab==="cx"?"vars":"cx");return;}
    if(!R)return;
    const A={ArrowRight:"next"," ":"next",ArrowLeft:"back",Home:"first",End:"last",p:"play",o:"over",u:"out",b:"bp"}[k];
    if(A){e.preventDefault();act(A);}},true);
  let rsz=0;addEventListener("resize",()=>{cancelAnimationFrame(rsz);rsz=requestAnimationFrame(()=>{if(R&&R.steps.length){DRAWN.forEach(el=>el._w=0);render();}});},{passive:true});
  /* once CodeMirror exists: gutters (breakpoints, hit counts), a host that fills the column, and edits after a run fade the drawing */
  const cmWatch=setInterval(()=>{const c=cm();if(!c)return;clearInterval(cmWatch);
    c.setOption("gutters",["pg-bp","CodeMirror-linenumbers","pg-hits"]);
    const host=c.getWrapperElement().parentNode;if(host)host.classList.add("pg-cmhost");
    c.on("gutterClick",(c2,line,g)=>{if(g==="pg-bp"||g==="CodeMirror-linenumbers")toggleBp(line);});
    let tm=0;c.on("changes",()=>{clearTimeout(tm);tm=setTimeout(()=>LS.set("js1-pg-code",c.getValue()),400);if(R&&!stale){stale=true;PGhost.classList.add("pg-stale");stop();hitsGutter();
      for(const m of marks)c.removeLineClass(m.h,"background",m.c);marks=[];clearErr();why.innerHTML="The code changed: press <b>▶ Visualize</b> (Ctrl+Enter) to see the new run.";}});
    if(errMark===null&&R&&R.error&&R.error.line)markErr(R.error.line);hitsGutter();c.refresh();if(R&&R.steps.length)render();},80);
  /* ---------- v4 UX (2026-11-02): example gallery, phone tabs, first-visit hint, timeline marks, zoom and pan,
     History hover flash, sorted region on sorts. Hooks: render() is wrapped (v4after runs after every frame). ---------- */
  const PHONE=matchMedia("(max-width:760px)");
  /* the example gallery: the <select> stays (keyboard, tests) but is hidden; a button opens a dialog of grouped cards */
  const CATS=[
    ["Basics","Values, Strings, input, exceptions",/^(Playground|Hello|Swap two|Scanner|Exceptions|Integer cache)/,"vars"],
    ["Arrays and Strings","Indexes, 2D grids, two pointers, bits",/^(Arrays and loops|2D matrix|String pool|StringBuilder|Palindrome|Bits)/,"arr"],
    ["Objects and classes","new, references, static, inheritance, GC",/^(Car class|Static vs|Garbage|Inheritance|Interface and lambda)/,"obj"],
    ["Recursion","The call stack and the call tree",/^(Factorial|Fibonacci|Backtracking)/,"tree"],
    ["Linked lists","Nodes joined by references",/^(Linked list|Doubly|Cycle)/,"list"],
    ["Stacks and queues","Last in first out, first in first out, monotonic",/^(Stack with|Queue with|Monotonic)/,"stack"],
    ["Trees and heaps","BST, AVL, trie, heap, red-black",/^(Binary tree|AVL|Trie|Heap|TreeMap)/,"tree"],
    ["Hashing","Buckets and collisions",/^HashMap/,"hash"],
    ["Graphs","BFS, Dijkstra, Union-Find",/^(Graph BFS|Dijkstra|Union-Find)/,"graph"],
    ["Sorting, searching and DP","Sorts, binary search, DP tables, range trees",/^(Bubble|Insertion sort|Merge sort|Quicksort|Binary search|Grid DP|DP arrows|Merge intervals|Segment|Fenwick)/,"bars"],
    ["Compare two solutions","The slow and the fast version of the same problem",/^Compare:/,"bars"]];
  const LESSON=[[/^(Arrays and loops|2D matrix)/,"D01","../dsa/01-arrays.html"],[/^HashMap/,"D02","../dsa/02-hashing.html"],[/^Palindrome/,"D03","../dsa/03-two-pointers.html"],
    [/^(Factorial|Fibonacci)/,"D05","../dsa/05-recursion.html"],[/^(Bubble|Insertion sort|Merge sort|Quicksort)/,"D06","../dsa/06-sorting.html"],[/^Compare: (Two Sum|duplicates)/,"D02","../dsa/02-hashing.html"],[/^Compare: search/,"D07","../dsa/07-binary-search.html"],[/^Compare: Fibonacci/,"D17","../dsa/17-dp-1.html"],[/^Binary search/,"D07","../dsa/07-binary-search.html"],
    [/^(Linked list|Doubly|Cycle)/,"D08","../dsa/08-linked-lists.html"],[/^(Stack with|Queue with|Monotonic)/,"D09","../dsa/09-stacks-queues.html"],
    [/^Binary tree/,"D10","../dsa/10-trees.html"],[/^(AVL|TreeMap)/,"D11","../dsa/11-bst.html"],[/^Heap/,"D12","../dsa/12-heaps.html"],[/^Backtracking/,"D13","../dsa/13-backtracking.html"],
    [/^Graph BFS/,"D14","../dsa/14-graphs.html"],[/^(Dijkstra|Union-Find)/,"D15","../dsa/15-graphs-2.html"],[/^Merge intervals/,"D16","../dsa/16-greedy.html"],
    [/^DP arrows/,"D17","../dsa/17-dp-1.html"],[/^Grid DP/,"D18","../dsa/18-dp-2.html"],[/^(Trie|Bits)/,"D19","../dsa/19-tries-bits-math.html"],[/^(Segment|Fenwick)/,"D21","../dsa/21-advanced-extras.html"],
    [/^(String pool|StringBuilder)/,"L01","lessons/01-strings.html"],[/^Car class/,"L02","lessons/02-classes-objects.html"],[/^Inheritance/,"L04","lessons/04-inheritance.html"]];
  const GLYPH={ // tiny pictures for the cards (currentColor)
    vars:'<rect x="6" y="9" width="16" height="10" rx="2"/><rect x="26" y="9" width="16" height="10" rx="2"/><rect x="46" y="9" width="16" height="10" rx="2"/>',
    arr:'<rect x="4" y="8" width="13" height="13"/><rect x="17" y="8" width="13" height="13"/><rect x="30" y="8" width="13" height="13"/><rect x="43" y="8" width="13" height="13"/><path d="M23 26l0 0"/>',
    obj:'<rect x="6" y="5" width="22" height="18" rx="3"/><path d="M28 14h12"/><rect x="40" y="5" width="22" height="18" rx="3"/>',
    tree:'<circle cx="34" cy="6" r="4"/><circle cx="20" cy="22" r="4"/><circle cx="48" cy="22" r="4"/><path d="M31 9l-8 10M37 9l8 10"/>',
    list:'<rect x="3" y="9" width="14" height="10" rx="2"/><rect x="27" y="9" width="14" height="10" rx="2"/><rect x="51" y="9" width="14" height="10" rx="2"/><path d="M17 14h8M41 14h8"/>',
    stack:'<rect x="20" y="3" width="28" height="7" rx="2"/><rect x="20" y="11" width="28" height="7" rx="2"/><rect x="20" y="19" width="28" height="7" rx="2"/>',
    hash:'<path d="M8 6v18M18 6v18"/><rect x="26" y="5" width="12" height="7" rx="2"/><rect x="44" y="5" width="12" height="7" rx="2"/><rect x="26" y="17" width="12" height="7" rx="2"/><path d="M38 8h6"/>',
    graph:'<circle cx="10" cy="8" r="4"/><circle cx="34" cy="22" r="4"/><circle cx="58" cy="8" r="4"/><circle cx="34" cy="6" r="3"/><path d="M13 10l18 10M37 20l18-10M14 8h17M37 6h17"/>',
    bars:'<rect x="8" y="16" width="8" height="10"/><rect x="20" y="8" width="8" height="18"/><rect x="32" y="12" width="8" height="14"/><rect x="44" y="3" width="8" height="23"/>'};
  const catOf=n=>CATS.find(c=>c[2].test(n))||["More","",null,"vars"],lessonOf=n=>LESSON.find(l=>l[0].test(n));
  const pick=q(".pg-pick",PGhost),galBtn=document.createElement("button");
  galBtn.type="button";galBtn.className="btn pg-galb";galBtn.id="pgGal";galBtn.setAttribute("aria-haspopup","dialog");galBtn.title="Pick one of the "+EX.length+" example programs";
  galBtn.innerHTML='<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" fill="currentColor"/></svg> Examples';
  if(pick){pick.after(galBtn);pick.classList.add("pg-pickx");}
  const gal=document.createElement("dialog");gal.className="pg-gal";gal.setAttribute("aria-label","Example programs");
  let curEx=-1;
  gal.innerHTML='<div class="pg-galh"><b>Examples</b><span>'+EX.length+' programs · pick one to load it and step through</span><input type="search" class="pg-gals" placeholder="Search: tree, sort, HashMap…" aria-label="Search the examples"><button type="button" class="ib pg-galx" aria-label="Close">✕</button></div><div class="pg-galb2"></div>';
  document.body.appendChild(gal);
  const galBody=q(".pg-galb2",gal),galS=q(".pg-gals",gal);
  function galDraw(){const f=galS.value.trim().toLowerCase();let h="";
    const groups=new Map();EX.forEach((e,i)=>{const c=catOf(e.name);if(f&&!(e.name+" "+c[0]+" "+c[1]).toLowerCase().includes(f))return;if(!groups.has(c[0]))groups.set(c[0],{c,items:[]});groups.get(c[0]).items.push(i);});
    const cix=n=>{const i=CATS.findIndex(x=>x[0]===n);return i<0?99:i;}; // groups in the planned order, not in the order of the first example
    for(const {c,items} of [...groups.values()].sort((x,y)=>cix(x.c[0])-cix(y.c[0]))){h+='<div class="pg-gsec"><h3>'+H(c[0])+(c[1]?" <small>"+H(c[1])+"</small>":"")+'</h3><div class="pg-galg">';
      for(const i of items){const e=EX[i],l=lessonOf(e.name);
        h+='<div class="pg-gcard'+(i===curEx?" on":"")+'"><button type="button" data-ex="'+i+'"><svg viewBox="0 0 68 28" aria-hidden="true">'+GLYPH[c[3]]+"</svg><b>"+H(e.name)+"</b><small>"+H(e.file)+"</small></button>"+
          (l?'<a href="'+l[2]+'" title="The lesson that teaches this">'+l[1]+" lesson ↗</a>":"")+"</div>";}
      h+="</div></div>";}
    galBody.innerHTML=h||'<p class="pg-empty">No example matches “'+H(galS.value)+'”.</p>';}
  function galOpen(){galS.value="";galDraw();if(gal.showModal)gal.showModal();else gal.setAttribute("open","");setTimeout(()=>galS.focus(),30);}
  function galClose(){if(gal.close)gal.close();else gal.removeAttribute("open");galBtn.focus();}
  galBtn.onclick=galOpen;q(".pg-galx",gal).onclick=galClose;galS.oninput=galDraw;
  gal.addEventListener("click",e=>{if(e.target===gal){galClose();return;}const b=e.target.closest("[data-ex]");if(!b)return;loadEx(+b.dataset.ex);galClose();});
  gal.addEventListener("keydown",e=>{e.stopPropagation();if(e.key==="Escape"){e.preventDefault();galClose();}},true);
  function loadEx(i){curEx=i;exSel.value=String(i);exSel.dispatchEvent(new Event("change"));if(PHONE.matches)setMt("pic");}
  /* phone tabs: Code · Picture · Explain, the step bar pinned to the bottom of the screen */
  const mt=document.createElement("div");mt.className="pg-mtabs";mt.setAttribute("role","tablist");mt.setAttribute("aria-label","Show");
  mt.innerHTML=[["code","Code"],["pic","Picture"],["exp","Explain"]].map(([k,t])=>'<button type="button" role="tab" data-mt="'+k+'">'+t+"</button>").join("");
  q(".pg-bar",PGhost).after(mt);
  let mtab=LS.get("js1-pg-mtab")||"pic";
  function setMt(t){mtab=t;LS.set("js1-pg-mtab",t);PGhost.classList.remove("pg-mt-code","pg-mt-pic","pg-mt-exp");PGhost.classList.add("pg-mt-"+t);
    for(const b of qa("[data-mt]",mt)){const on=b.dataset.mt===t;b.classList.toggle("on",on);b.setAttribute("aria-selected",String(on));}
    if(PHONE.matches)afterResize();}
  mt.addEventListener("click",e=>{const b=e.target.closest("[data-mt]");if(b)setMt(b.dataset.mt);});
  setMt(mtab);
  q("#pgGo").addEventListener("click",()=>{if(PHONE.matches)setMt("pic");});
  /* first visit: point at the step buttons once */
  let coach=null;
  if(LS.get("js1-pg-coach")!=="1"){coach=document.createElement("div");coach.className="pg-coach";coach.setAttribute("role","note");
    coach.innerHTML='<b>Step through the program</b><span>Press <kbd>→</kbd> or <span class="pg-ck">▶|</span> to run one line, <kbd>←</kbd> to go back, <kbd>Space</kbd>/▶ to play. Pick another program from <b>Examples</b>.</span><button type="button" class="btn pri">Got it</button>';
    q(".pg-ctl",PGhost).after(coach);qa('.pg-ctl [data-a="next"],.pg-ctl [data-a="play"]',PGhost).forEach(b=>b.classList.add("pg-pulse"));
    q("button",coach).onclick=()=>coachDone();}
  function coachDone(){if(!coach)return;coach.remove();coach=null;LS.set("js1-pg-coach","1");qa(".pg-pulse",PGhost).forEach(b=>b.classList.remove("pg-pulse"));}
  /* the timeline: marks over the step slider for calls, printed output, exceptions and breakpoints; a click goes there */
  const tl=document.createElement("div");tl.className="pg-tl";tl.setAttribute("aria-hidden","true");
  const slw=document.createElement("span");slw.className="pg-slw";slide.before(slw);slw.append(slide,tl);
  let tlKey="";
  function timeline(){const N=R.steps.length,bp=bpLines(),key=R.took+"|"+N+"|"+[...bp].join(",");if(key===tlKey)return;tlKey=key;
    if(N<2){tl.innerHTML="";return;}
    const seen=new Set();let h="";
    const add=(j,c,t)=>{const p=Math.round(1000*j/(N-1))/10,k=c+p;if(seen.has(k))return;seen.add(k);h+='<b class="pg-tk '+c+'" style="left:calc(8px + (100% - 16px) * '+(j/(N-1)).toFixed(4)+')" data-k="'+j+'" title="step '+(j+1)+": "+H(t)+'"></b>';};
    for(let j=1;j<N;j++){const s=R.steps[j],p=R.steps[j-1];
      if(s.e==="exception")add(j,"ex","an exception is thrown");
      else if(s.o!==p.o)add(j,"out","prints "+R.out.slice(p.o,s.o).replace(/\n$/,"").slice(0,30));
      else if(s.e==="call"&&DEP[j]<=3)add(j,"call","a method is called (line "+s.l+")");
      if(s.e==="line"&&bp.has(s.l))add(j,"bp","breakpoint, line "+s.l);}
    tl.innerHTML=h;}
  tl.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(b){stop();go(+b.dataset.k);}});
  /* zoom and pan: − Fit + over the picture; Ctrl+wheel zooms; drag the empty background to pan; keys + − 0 */
  const zm=document.createElement("div");zm.className="pg-zoom";zm.setAttribute("role","group");zm.setAttribute("aria-label","Zoom the picture");
  zm.innerHTML='<button type="button" class="ib" data-z="-" title="Zoom out (−)" aria-label="Zoom out">−</button><button type="button" class="ib pg-zfit" data-z="0" title="Fit: shrink the picture until all of it shows (0)" aria-pressed="false">Fit</button><button type="button" class="ib" data-z="+" title="Zoom in (+)" aria-label="Zoom in">+</button>';
  panel.prepend(zm);
  function zoom(z){FITALL=z==="0";UZ=z==="0"?1:Math.max(.4,Math.min(3,UZ*(z==="+"?1.2:1/1.2)));const fb=q(".pg-zfit",zm);fb.textContent=UZ===1?"Fit":Math.round(UZ*100)+"%";fb.classList.toggle("on",FITALL);fb.setAttribute("aria-pressed",String(FITALL));if(R&&R.steps.length){DRAWN.forEach(el=>el._w=0);render();}}
  zm.addEventListener("click",e=>{const b=e.target.closest("[data-z]");if(b)zoom(b.dataset.z);});
  panel.addEventListener("wheel",e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();zoom(e.deltaY<0?"+":"-");},{passive:false});
  panel.addEventListener("pointerdown",e=>{if(e.button!==0||e.pointerType==="touch"||e.target.closest(".pg-box,button,select,input,label,a,.pg-frame,.pg-cls"))return;
    if(panel.scrollWidth<=panel.clientWidth&&panel.scrollHeight<=panel.clientHeight)return;
    const x0=e.clientX,y0=e.clientY,l0=panel.scrollLeft,t0=panel.scrollTop;panel.classList.add("pg-pan");panel.setPointerCapture(e.pointerId);
    const mv=ev=>{panel.scrollLeft=l0-(ev.clientX-x0);panel.scrollTop=t0-(ev.clientY-y0);};
    const up=()=>{panel.classList.remove("pg-pan");panel.removeEventListener("pointermove",mv);panel.removeEventListener("pointerup",up);};
    panel.addEventListener("pointermove",mv);panel.addEventListener("pointerup",up);});
  document.addEventListener("keydown",e=>{const t=e.target;if(e.ctrlKey||e.metaKey||e.altKey||t&&t.closest&&t.closest("input,textarea,select,.CodeMirror,[contenteditable],dialog"))return;
    const z={"+":"+","=":"+","-":"-","0":"0"}[e.key];if(z&&R){e.preventDefault();zoom(z);}});
  /* History: hovering a row flashes what that step changed (cells, fields, boxes) and its line in the editor */
  let hfl=[],hln=null;
  function hClear(){for(const el of hfl)el.classList.remove("pg-hfl");hfl=[];const c=cm();if(c&&hln){c.removeLineClass(hln,"background","pg-hfline");hln=null;}}
  if(histEl){histEl.addEventListener("mouseover",e=>{const b=e.target.closest("[data-hk]");if(!b||!R)return;hClear();const j=+b.dataset.hk,S=JVML.state(R,j);
      for(const k of S.changed){if(k[0]!=="h")continue;const id=parseInt(k.slice(1)),el=DRAWN.get(id);if(!el||!el.isConnected)continue;const cell=el.querySelector('[data-k="'+k+'"]');(cell||el).classList.add("pg-hfl");hfl.push(cell||el);}
      const c=cm(),l=(R.steps[j-1]||R.steps[j]).l;if(c&&l>0&&l<=c.lineCount())hln=c.addLineClass(l-1,"background","pg-hfline");});
    histEl.addEventListener("mouseleave",hClear);}
  /* sorts: the part that is already in its final place is shaded and labelled (bubble sort: the last i cells; selection sort: the first i) */
  let SRT=null,srtR=null;
  function sortPlan(code){ // v6: bubble (final tail), selection (final head), insertion (sorted so far), quicksort (pivot and sides), merge sort (two halves)
    const b=code.match(/for\s*\(\s*int\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*([\w.]+?)\s*-\s*(?:1\s*-\s*(\w+)|(\w+)\s*-\s*1)\s*;/);
    if(b){const inner=b[1],a=(code.match(new RegExp("(\\w+)\\s*\\[\\s*"+inner+"\\s*\\+\\s*1\\s*\\]"))||[])[1];return a?{kind:"tail",arr:a,outer:b[3]||b[4]}:null;}
    const s=code.match(/for\s*\(\s*int\s+(\w+)\s*=\s*(\w+)\s*\+\s*1\s*;/);
    if(s&&/min\w*\s*=\s*\w+\s*;/.test(code)){const a=(code.match(new RegExp("(\\w+)\\s*\\[\\s*"+s[1]+"\\s*\\]"))||[])[1];return a?{kind:"head",arr:a,outer:s[2]}:null;}
    const w=code.match(/while\s*\(\s*(\w+)\s*>=\s*0\s*&&\s*(\w+)\s*\[\s*\1\s*\]\s*>\s*\w+\s*\)/),o=code.match(/for\s*\(\s*int\s+(\w+)\s*=\s*1\s*;/);
    if(w&&o)return {kind:"ins",arr:w[2],outer:o[1]};
    const p=code.match(/int\s+pivot\s*=\s*(\w+)\s*\[\s*(\w+)\s*\]/);if(p)return {kind:"quick",arr:p[1],pidx:p[2]};
    const m=code.match(/merge\s*\(\s*(\w+)\s*,/);if(m&&/\bmid\s*=/.test(code))return {kind:"merge",arr:m[1]};
    return null;}
  const SRTC=["pg-srt","pg-srt2","pg-srB","pg-hA","pg-hB","pg-pv"];
  function sortedMarks(S){
    if(srtR!==R){srtR=R;SRT=IDX.sort?sortPlan(getCode()):null;}
    for(const cl of SRTC)for(const el of qa("."+cl,heapEl))el.classList.remove(cl);for(const el of qa(".pg-srtl",heapEl))el.remove();
    if(!SRT)return;const fr=frameOf(S,S.step.f);if(!fr)return;
    const vr=n=>fr.vars.find(v=>v.n===n),iv=n=>{const x=vr(n);return x&&x.v&&x.v.p==="int"?+x.v.s:undefined;},first=(...ns)=>{for(const n of ns){const v=iv(n);if(v!==undefined)return v;}};
    const av=vr(SRT.arr);if(!av||!av.v||av.v.r===undefined)return;
    const r=S.recs.get(av.v.r),el=DRAWN.get(av.v.r);if(!r||!el||r.k!=="arr")return;
    const n=r.len,cell=i=>el.querySelector('[data-k="h'+r.id+":"+i+'"]'),paint=(lo,hi,cl)=>{for(let i=Math.max(0,lo);i<=Math.min(n-1,hi);i++){const c=cell(i);if(c)c.classList.add(cl);}};
    const rng=(lo,hi)=>lo===hi?"["+lo+"]":"["+lo+"…"+hi+"]",labels=[];
    if(SRT.kind==="tail"||SRT.kind==="head"){const o=iv(SRT.outer);if(o===undefined)return;const lo=SRT.kind==="tail"?n-o:0,hi=SRT.kind==="tail"?n-1:o-1;if(hi<lo)return;
      paint(lo,hi,"pg-srt");labels.push('<span class="ok">✓ in place: '+rng(lo,hi)+"</span>");}
    else if(SRT.kind==="ins"){const o=iv(SRT.outer);if(o===undefined||o<1)return;paint(0,o-1,"pg-srt2");labels.push('<span class="so">sorted so far: '+rng(0,o-1)+"</span>");}
    else if(SRT.kind==="quick"){const lo=first("lo","low","l","left"),hi=first("hi","high","h","r","right"),i=iv("i"),j=iv("j"),pv=iv(SRT.pidx);
      if(lo===undefined||hi===undefined||pv===undefined||!vr("pivot"))return;
      if(i!==undefined&&i>=lo){paint(lo,i,"pg-srt2");labels.push('<span class="so">≤ pivot: '+rng(lo,i)+"</span>");}
      const g0=i===undefined?lo:i+1;if(j!==undefined&&j-1>=g0){paint(g0,j-1,"pg-srB");labels.push('<span class="gt">&gt; pivot: '+rng(g0,j-1)+"</span>");}
      const c=cell(pv);if(c)c.classList.add("pg-pv");labels.push('<span class="pv">pivot = '+H(SRT.arr)+"["+pv+"]</span>");}
    else if(SRT.kind==="merge"){const lo=first("lo","low","l","left"),hi=first("hi","high","h","r","right"),mid=first("mid","m");if(lo===undefined||hi===undefined||mid===undefined||hi<=lo)return;
      paint(lo,mid,"pg-hA");paint(mid+1,hi,"pg-hB");labels.push('<span class="ha">left half '+rng(lo,mid)+'</span><span class="hb">right half '+rng(mid+1,hi)+"</span>");}
    const cells=el.querySelector(".pg-cells");if(cells&&labels.length)cells.insertAdjacentHTML("afterend",'<div class="pg-srtl">'+labels.join("")+"</div>");}
  function v4after(){if(!R||!R.steps.length)return;PGhost.classList.remove("pg-nosteps");if(coach)coach.hidden=false;timeline();if(!memOn)sortedMarks(JVML.state(R,K));if(coach&&K>=2)coachDone();}
  render=(r0=>function(){r0();v4after();})(render);
  // v5: a program that does not run leaves nothing to step: no timeline marks, no hint, the step buttons dimmed
  showFatal=(f0=>function(){f0();tl.innerHTML="";tlKey="";if(coach)coach.hidden=true;PGhost.classList.add("pg-nosteps");})(showFatal);
  /* ---------- v6 (2026-11-02): live syntax check, "try another input" with a growth log, predict mode, compare two solutions,
     save the run as a GIF. Wraps act() (predict) and extends v4after() through v6after(). ---------- */
  /* live syntax check while typing: JVML.parse only (no run), the line gets a wavy underline and a one-line note under the editor */
  const lintEl=document.createElement("div");lintEl.className="pg-lint";lintEl.hidden=true;lintEl.setAttribute("role","status");box.after(lintEl);
  let lintMark=null,lintT=0;
  function lint(){const c=cm();if(!c)return;if(lintMark){c.removeLineClass(lintMark,"text","pg-lintline");lintMark=null;}
    try{JVML.parse(c.getValue());lintEl.hidden=true;}
    catch(e){if(!e||!e.line){lintEl.hidden=true;return;}const ln=Math.min(e.line,c.lineCount());lintMark=c.addLineClass(ln-1,"text","pg-lintline");
      lintEl.hidden=false;lintEl.innerHTML='<b>Line '+ln+"</b>"+H(e.message)+"<span>click to go there</span>";
      lintEl.onclick=()=>{c.focus();c.setCursor({line:ln-1,ch:c.getLine(ln-1).length});};}}
  /* "try another input": the program's first int[] literal gets new data; the steps of each size are kept, so the growth shows */
  const inRow=document.createElement("div");inRow.className="pg-inrow";inRow.hidden=true;lintEl.after(inRow);
  const ARRRE=/(int\[\]\s+(\w+)\s*=\s*(?:new\s+int\[\]\s*)?\{)([\s\d,+-]*)(\})/;
  let inKind="random",growth=new Map(),growKey="",inR=null;
  function arrLit(code){const m=code.match(ARRRE);if(!m)return null;const vals=m[3].split(",").map(s=>s.trim()).filter(Boolean).map(Number);
    return vals.length&&!vals.some(isNaN)?{name:m[2],vals}:null;}
  function genVals(kind,n){let a;
    if(kind==="few")a=Array.from({length:n},()=>1+Math.floor(Math.random()*4));
    else{const s=new Set(),top=Math.max(99,n*3);while(s.size<n)s.add(1+Math.floor(Math.random()*top));a=[...s];}
    if(kind==="sorted")a.sort((x,y)=>x-y);else if(kind==="reversed")a.sort((x,y)=>y-x);return a;}
  const withVals=(code,v)=>code.replace(ARRRE,(x,a,b,c,d)=>a+v.join(", ")+d);
  function setInput(kind,n){const code=getCode();if(!arrLit(code))return;inKind=kind;setCode(withVals(code,genVals(kind,n)));setFile();visualize();}
  const stepsTxt=r=>r.ff?N(r.steps.length)+"+":N(r.steps.length);
  function growNote(){const g=[...growth].sort((a,b)=>a[0]-b[0]);if(g.length<2)return "";const n1=g[0][0],s1=g[0][1].steps.length,n2=g[g.length-1][0],s2=g[g.length-1][1].steps.length;if(n2<=n1||s1<1)return "";
    const e=Math.log(s2/s1)/Math.log(n2/n1);
    return ' <span class="pg-gn">'+(e<.55?"grows slowly (like log n)":e<1.4?"grows like n: double the input, double the steps":e<2.5?"grows like n²: double the input, four times the steps":"grows faster than n²")+"</span>";}
  function inDraw(){const code=getCode(),A=arrLit(code);inRow.hidden=!A;if(!A)return;const n=A.vals.length,key=code.replace(ARRRE,"$1$4");
    if(key!==growKey){growKey=key;growth=new Map();}
    if(R&&R.steps.length&&!stale&&!R.error)growth.set(n,R);
    const g=[...growth].sort((a,b)=>a[0]-b[0]);
    inRow.innerHTML='<span class="pg-inl">Try another input for <code>'+H(A.name)+"</code></span>"+
      [["random","Random"],["sorted","Sorted"],["reversed","Reversed"],["few","Repeats"]].map(([k,t])=>'<button type="button" class="pg-chip'+(k===inKind?" on":"")+'" data-ik="'+k+'">'+t+"</button>").join("")+
      '<span class="pg-insz">size'+[5,10,20,40].map(s=>'<button type="button" class="pg-chip'+(s===n?" on":"")+'" data-in="'+s+'">'+s+"</button>").join("")+"</span>"+
      (g.length>1?'<div class="pg-grow">Steps: '+g.map(([k,r])=>"n = "+k+" → <b>"+stepsTxt(r)+"</b>").join(" · ")+growNote()+"</div>":
        '<div class="pg-grow pg-dim">Pick two sizes to see how the number of steps grows.</div>');}
  inRow.addEventListener("click",e=>{const b=e.target.closest("[data-ik],[data-in]");if(!b)return;const A=arrLit(getCode());if(!A)return;
    if(b.dataset.ik)setInput(b.dataset.ik,A.vals.length);else setInput(inKind,+b.dataset.in);});
  const cmW=setInterval(()=>{const c=cm();if(!c)return;clearInterval(cmW);c.on("changes",()=>{clearTimeout(lintT);lintT=setTimeout(()=>{lint();inDraw();},650);});lint();},120);
  /* predict mode: before a step, guess what the line will do (a condition, an array cell or a variable); the answer shows, then it steps */
  const predB=document.createElement("button");predB.type="button";predB.className="ib pg-predb";predB.title="Predict mode: before each step, guess what the line will do (keys 1 to 4)";
  let PRED=LS.get("js1-pg-pred")==="1",pend=null;const score=[0,0];
  const dbg=q(".pg-dbg",PGhost);if(dbg)dbg.appendChild(predB);
  const predEl=document.createElement("div");predEl.className="pg-pred";predEl.hidden=true;predEl.setAttribute("aria-live","polite");q(".pg-ctl",PGhost).after(predEl);
  function predUi(){predB.textContent=PRED?"◎ Predict: on":"◎ Predict";predB.setAttribute("aria-pressed",String(PRED));predB.classList.toggle("on",PRED);if(!PRED){pend=null;predEl.hidden=true;}}
  predB.onclick=()=>{PRED=!PRED;LS.set("js1-pg-pred",PRED?"1":"0");predUi();};predUi();
  function mkQ(nm,now,old,pool,L){const o=[now];const add=x=>{if(x!=null&&x!==""&&!o.includes(x)&&o.length<4)o.push(x);};
    if(old!==null)add(old);
    if(now==="true"||now==="false")add(now==="true"?"false":"true");
    else if(/^-?\d+$/.test(now)){const n=+now;add(String(n+1));add(String(n-1));add(String(n*2===n?n+2:n*2));}
    for(const p of pool)add(p);
    for(let i=o.length-1;i>0;i--){const j=(i*7+nm.length+now.length)%(i+1);[o[i],o[j]]=[o[j],o[i]];}
    return {t:"What will <code>"+H(nm)+"</code> be after line "+L+" runs?",o,a:o.indexOf(now)};}
  function qFor(k){if(!R||k+1>=R.steps.length)return null;const nx=R.steps[k+1],S0=JVML.state(R,k),S1=JVML.state(R,k+1),L=S0.line;
    if(nx.cd&&!nx.cd.fe&&nx.cd.s&&typeof nx.cd.v==="boolean")return {t:"Will <code>"+H(nx.cd.s)+"</code> be true or false?",o:["true","false"],a:nx.cd.v?0:1};
    for(const key of S1.changed){const m=/^h(\d+):(\d+)$/.exec(key);if(!m)continue;const r1=S1.recs.get(+m[1]);if(!r1||r1.k!=="arr")continue;
      const nm=(viewCtx(S1).by.get(r1.id)||[])[0];if(!nm)continue;const i=+m[2],r0=S0.recs.get(r1.id),old=r0&&r0.a&&r0.a[i]!==undefined?valTxt(r0.a[i],S0):null;
      return mkQ(nm+"["+i+"]",valTxt(r1.a[i],S1),old,r1.a.map(v=>valTxt(v,S1)),L);}
    const f0=frameOf(S0,S0.step.f),f1=f0&&frameOf(S1,f0.id);
    if(f1)for(const v of f1.vars){if(!v.v||v.v.r!==undefined||v.n==="this")continue;const o=f0.vars.find(x=>x.n===v.n),now=valTxt(v.v,S1),old=o&&o.v&&o.v.r===undefined?valTxt(o.v,S0):null;
      if(old===now)continue;return mkQ(v.n,now,old,f1.vars.filter(x=>x.v&&x.v.r===undefined).map(x=>valTxt(x.v,S1)),L);}
    return null;}
  const scoreTxt=()=>score[1]?"Score <b>"+score[0]+" / "+score[1]+"</b>":"Guess, then see";
  function ask(){const Q=qFor(K);if(!Q){predEl.hidden=true;return false;}pend=Q;predEl.hidden=false;
    predEl.innerHTML='<div class="pg-pq"><span class="pg-ptag">Predict · line '+(JVML.state(R,K).line||"")+"</span>"+Q.t+'</div><div class="pg-po">'+Q.o.map((x,i)=>'<button type="button" data-po="'+i+'"><kbd>'+(i+1)+"</kbd>"+H(x)+"</button>").join("")+
      '</div><div class="pg-ps">'+scoreTxt()+' <button type="button" class="pg-pskip">Skip: show me →</button></div>';return true;}
  const a0=act;
  function answer(i){if(!pend)return;const Q=pend;pend=null;const ok=i===Q.a;if(i>=0){score[1]++;if(ok)score[0]++;}
    qa("[data-po]",predEl).forEach((b,j)=>{b.disabled=true;b.classList.add(j===Q.a?"ok":j===i?"no":"dim");});
    q(".pg-ps",predEl).innerHTML=(i<0?"It is <b>"+H(Q.o[Q.a])+"</b>":ok?'<b class="pg-good">✓ Right</b>':'<b class="pg-bad">✗ It is '+H(Q.o[Q.a])+"</b>")+" · "+scoreTxt()+" · press → for the next one";
    a0("next");}
  act=function(a){
    if(a==="next"&&PRED&&R&&R.steps.length&&!timer&&K+1<R.steps.length){if(pend){answer(-1);return;}if(ask())return;}
    if(a!=="next"){pend=null;predEl.hidden=true;}a0(a);};
  predEl.addEventListener("click",e=>{const b=e.target.closest("[data-po]");if(b){answer(+b.dataset.po);return;}if(e.target.closest(".pg-pskip"))answer(-1);});
  document.addEventListener("keydown",e=>{if(!pend||e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target;if(t&&t.closest&&t.closest("input,textarea,select,.CodeMirror,dialog"))return;
    const n=+e.key;if(n>=1&&n<=pend.o.length){e.preventDefault();e.stopPropagation();answer(n-1);}},true);
  /* compare two solutions: the same data at growing sizes, both programs run in the background, steps side by side and a race */
  const CMPP=[
    {t:"Two Sum",slow:"Compare: Two Sum, brute force",fast:"Compare: Two Sum, HashMap",cs:"O(n²)",cf:"O(n)",sizes:[5,10,20,40],data:"pairlast",why:"Brute force tries every pair; the HashMap remembers what it has seen and finds the partner in one look."},
    {t:"Contains Duplicate",slow:"Compare: duplicates, brute force",fast:"Compare: duplicates, HashSet",cs:"O(n²)",cf:"O(n)",sizes:[5,10,20,40],data:"distinct",why:"Comparing every pair grows with n²; a HashSet answers \"seen before?\" in O(1)."},
    {t:"Search a sorted array",slow:"Compare: search, linear",fast:"Compare: search, binary",cs:"O(n)",cf:"O(log n)",sizes:[8,16,32,64],data:"sorted",why:"A linear scan looks at every value; binary search halves the range each time, so 64 values take about 6 looks."},
    {t:"Fibonacci",slow:"Compare: Fibonacci, naive",fast:"Compare: Fibonacci, memo",cs:"O(2ⁿ)",cf:"O(n)",sizes:[5,10,14,18],data:"n",why:"The naive recursion solves the same smaller fib again and again; the memo solves each n once."}];
  const exIx=n=>EX.findIndex(e=>e.name===n);
  function pairData(kind,n){const s=new Set();while(s.size<n)s.add(1+Math.floor(Math.random()*n*4));const a=[...s].sort((x,y)=>x-y);
    if(kind==="sorted")return a;const big=a.splice(-2);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return kind==="pairlast"?a.concat(big):a.concat(big).sort(()=>Math.random()-.5);}
  const cmpD=document.createElement("dialog");cmpD.className="pg-gal pg-cmpd";cmpD.setAttribute("aria-label","Compare two solutions");document.body.appendChild(cmpD);
  cmpD.addEventListener("keydown",e=>{e.stopPropagation();if(e.key==="Escape"){e.preventDefault();cmpD.close();}},true);
  cmpD.addEventListener("click",e=>{if(e.target===cmpD){cmpD.close();return;}if(e.target.closest(".pg-galx")){cmpD.close();return;}const b=e.target.closest("[data-open]");if(b){cmpD.close();loadEx(+b.dataset.open);}});
  function compare(P){const A=EX[exIx(P.slow)],B=EX[exIx(P.fast)];if(!A||!B)return;
    cmpD.innerHTML='<div class="pg-galh"><b>'+H(P.t)+": "+P.cs+" vs "+P.cf+'</b><span>both programs, the same data, growing sizes</span><button type="button" class="ib pg-galx" aria-label="Close">✕</button></div><div class="pg-galb2 pg-cmpb"><p class="pg-dim">Running…</p></div>';
    if(cmpD.showModal)cmpD.showModal();else cmpD.setAttribute("open","");
    setTimeout(()=>{const rows=[];
      for(const n of P.sizes){let a=A.code,b=B.code;
        if(P.data==="n"){a=a.replace(/int n = \d+;/,"int n = "+n+";");b=b.replace(/int n = \d+;/,"int n = "+n+";");}
        else{const v=pairData(P.data,n);a=withVals(a,v);b=withVals(b,v);}
        let ra,rb;try{ra=JVML.run(a,"");rb=JVML.run(b,"");}catch(e){continue;}
        rows.push({n,a:ra.steps.length,b:rb.steps.length,af:ra.ff,bf:rb.ff});}
      const last=rows[rows.length-1]||{a:1,b:1},mx=Math.max(last.a,last.b,1);
      q(".pg-cmpb",cmpD).innerHTML='<p>'+H(P.why)+'</p><div class="pg-race"><div><span>'+H(A.name.replace(/^Compare: /,""))+" · "+P.cs+'</span><i class="slow" style="--w:'+(100*last.a/mx).toFixed(1)+'%"></i><b>'+N(last.a)+(last.af?"+":"")+' steps</b></div><div><span>'+H(B.name.replace(/^Compare: /,""))+" · "+P.cf+'</span><i class="fast" style="--w:'+(100*last.b/mx).toFixed(1)+'%"></i><b>'+N(last.b)+(last.bf?"+":"")+" steps</b></div><small>at n = "+last.n+"</small></div>"+
        '<div class="tw"><table><thead><tr><th>n</th><th>'+P.cs+" steps</th><th>"+P.cf+" steps</th><th>slower by</th></tr></thead><tbody>"+rows.map(r=>"<tr><td>"+r.n+"</td><td>"+N(r.a)+(r.af?"+":"")+"</td><td>"+N(r.b)+(r.bf?"+":"")+"</td><td>"+(r.a/Math.max(1,r.b)).toFixed(1)+"×</td></tr>").join("")+"</tbody></table></div>"+
        '<p class="pg-dim">A step is one line the Lab ran (the same count as the step bar). Data is random each time; the worst case is built in (the pair is last, nothing repeats, the target is missing).</p>'+
        '<div class="pg-cmpbtn"><button type="button" class="btn" data-open="'+exIx(P.slow)+'">Step through the '+P.cs+" one</button><button type=\"button\" class=\"btn pri\" data-open=\""+exIx(P.fast)+'">Step through the '+P.cf+" one</button></div>";
      requestAnimationFrame(()=>requestAnimationFrame(()=>cmpD.classList.add("go")));},40);}
  // the gallery gets a "Compare two solutions" strip at the top
  const galDraw0=galDraw;galDraw=function(){galDraw0();if(galS.value.trim())return;
    galBody.insertAdjacentHTML("afterbegin",'<div class="pg-gsec"><h3>Compare two solutions <small>the same input at growing sizes: see why the faster one wins</small></h3><div class="pg-galg">'+
      CMPP.map((P,i)=>'<div class="pg-gcard pg-gcmp"><button type="button" data-cmp="'+i+'"><svg viewBox="0 0 68 28" aria-hidden="true"><rect x="4" y="6" width="58" height="6" rx="3"/><rect x="4" y="17" width="18" height="6" rx="3"/></svg><b>'+H(P.t)+"</b><small>"+P.cs+" vs "+P.cf+"</small></button></div>").join("")+"</div></div>");};
  gal.addEventListener("click",e=>{const b=e.target.closest("[data-cmp]");if(!b)return;e.stopPropagation();galClose();compare(CMPP[+b.dataset.cmp]);},true);
  /* save the run as an animated GIF: each frame is the picture panel drawn through an SVG foreignObject (inlined computed styles) */
  const GPROPS=["display","position","left","top","right","bottom","width","height","margin-top","margin-right","margin-bottom","margin-left","padding-top","padding-right","padding-bottom","padding-left",
    "border-top","border-right","border-bottom","border-left","border-radius","background-color","background-image","color","font-family","font-size","font-weight","font-style","line-height","letter-spacing",
    "text-align","text-transform","white-space","vertical-align","opacity","transform","transform-origin","box-shadow","box-sizing","flex-direction","flex-wrap","flex-grow","flex-shrink","flex-basis",
    "align-items","align-self","justify-content","gap","grid-template-columns","grid-template-rows","grid-column","grid-row","overflow","z-index","visibility","fill","stroke","stroke-width","stroke-dasharray",
    "stroke-linecap","text-anchor","dominant-baseline","paint-order","min-width","min-height","max-width","list-style-type","border-collapse","table-layout"];
  function styled(el){const c=el.cloneNode(false);const cs=getComputedStyle(el);let s="";for(const p of GPROPS){const v=cs.getPropertyValue(p);if(v)s+=p+":"+v+";";}
    c.setAttribute("style",s);c.removeAttribute("class");
    for(const ch of el.childNodes){if(ch.nodeType===3)c.appendChild(ch.cloneNode());else if(ch.nodeType===1&&!ch.matches(".pg-zoom,script,select,.pg-legend .pg-sw"))c.appendChild(styled(ch));}
    return c;}
  function snap(w,h,sc){return new Promise(res=>{const node=styled(panel);node.style.margin="0";node.style.width=w+"px";node.style.height=h+"px";node.style.overflow="hidden";
      const inner=document.createElement("div");inner.setAttribute("style","width:"+w+"px;height:"+h+"px;overflow:hidden;background:"+getComputedStyle(panel).backgroundColor);
      node.scrollTop=0;inner.appendChild(node);
      const svgs='<svg xmlns="http://www.w3.org/2000/svg" width="'+Math.round(w*sc)+'" height="'+Math.round(h*sc)+'"><g transform="scale('+sc+')"><foreignObject width="'+w+'" height="'+h+'">'+new XMLSerializer().serializeToString(inner)+"</foreignObject></g></svg>";
      const img=new Image(),late=setTimeout(()=>res(null),4000);img.onload=()=>{clearTimeout(late);const cv=document.createElement("canvas");cv.width=Math.round(w*sc);cv.height=Math.round(h*sc);const x=cv.getContext("2d");x.drawImage(img,0,0);
        try{res(x.getImageData(0,0,cv.width,cv.height).data);}catch(e){res(null);}};img.onerror=()=>{clearTimeout(late);res(null);};
      img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svgs);});}
  function gifLzw(idx,b){const MIN=8,CLR=256,EOI=257;let size=MIN+1,next=EOI+1,clearing=false,dict=new Map(),cur=0,bits=0;const buf=[];
    const emit=c=>{cur|=c<<bits;bits+=size;while(bits>=8){buf.push(cur&255);cur>>>=8;bits-=8;}
      if(clearing){size=MIN+1;clearing=false;}else if(next>(1<<size)-1&&size<12)size++;};
    b(MIN);emit(CLR);let pre=idx[0];
    for(let i=1;i<idx.length;i++){const k=idx[i],key=pre*256+k,v=dict.get(key);if(v!==undefined){pre=v;continue;}
      emit(pre);if(next<4096)dict.set(key,next++);else{clearing=true;emit(CLR);dict=new Map();next=EOI+1;}pre=k;}
    emit(pre);emit(EOI);if(bits>0)buf.push(cur&255);
    for(let i=0;i<buf.length;i+=255){const n=Math.min(255,buf.length-i);b(n);for(let j=0;j<n;j++)b(buf[i+j]);}b(0);}
  function gifEncode(frames,w,h,delay){const out=[],b=x=>out.push(x&255),w16=x=>{b(x);b(x>>8);},str=s=>{for(const c of s)b(c.charCodeAt(0));};
    str("GIF89a");w16(w);w16(h);b(0xF7);b(0);b(0);
    for(let i=0;i<256;i++){const r=Math.floor(i/42),g=Math.floor(i%42/6),bb=i%6;if(i<252){b(Math.round(r*51));b(Math.round(g*42.5));b(Math.round(bb*51));}else{b(0);b(0);b(0);}}
    str("\x21\xFF\x0BNETSCAPE2.0");b(3);b(1);w16(0);b(0);
    const D=[0,32,8,40,48,16,56,24,12,44,4,36,60,28,52,20]; // 4×4 ordered dither, so dark UI colours band less
    for(const px of frames){b(0x21);b(0xF9);b(4);b(0);w16(delay);b(0);b(0);b(0x2C);w16(0);w16(0);w16(w);w16(h);b(0);
      const idx=new Uint8Array(w*h);
      for(let y=0,i=0;y<h;y++)for(let x=0;x<w;x++,i++){const j=i*4,t=(D[(y&3)*4+(x&3)]-30)/64;
        const q5=v=>Math.max(0,Math.min(5,Math.round(v*5/255+t))),q6=v=>Math.max(0,Math.min(6,Math.round(v*6/255+t)));
        idx[i]=q5(px[j])*42+q6(px[j+1])*6+q5(px[j+2]);}
      gifLzw(idx,b);}
    b(0x3B);return new Uint8Array(out);}
  async function saveGif(){if(!R||!R.steps.length)return;const N0=R.steps.length,k0=K,count=Math.min(60,N0),w=panel.clientWidth,h=panel.clientHeight,sc=Math.min(1,720/w);
    stop();PGhost.classList.add("pg-cap");const frames=[];
    for(let f=0;f<count;f++){const j=count<2?0:Math.round(f*(N0-1)/(count-1));go(j);why.innerHTML='<span class="pg-busy"></span> Making the GIF… frame '+(f+1)+" of "+count;
      await new Promise(r=>setTimeout(r,40));const px=await snap(w,h,sc);if(!px){frames.length=0;break;}frames.push(px);}
    PGhost.classList.remove("pg-cap");go(k0);
    if(!frames.length){why.innerHTML='<b class="pg-bad">GIF</b> · this browser cannot draw the picture into an image.';return null;}
    const gif=gifEncode(frames,Math.round(w*sc),Math.round(h*sc),Math.max(20,Math.round(6000/count/10))),blob=new Blob([gif],{type:"image/gif"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=curFile.replace(/\.java$/,"")+".gif";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},4000);
    why.innerHTML='<b class="pg-good">GIF saved</b> · '+count+" frames, "+Math.round(blob.size/1024)+" KB ("+H(a.download)+")";return blob;}
  zm.insertAdjacentHTML("afterbegin",'<button type="button" class="ib pg-gifb" title="Save the whole run as an animated GIF (60 frames)">GIF</button>');
  q(".pg-gifb",zm).onclick=e=>{e.stopPropagation();saveGif();};
  function v6after(){if(R!==inR){inR=R;inDraw();}}
  const v4a0=v4after;v4after=function(){v4a0();v6after();};
  /* ---------- start: shared link > saved work > default example ---------- */
  (async()=>{
    const h=location.hash.match(/code=([A-Za-z0-9_-]+)/),hin=location.hash.match(/[&#]in=([A-Za-z0-9_-]*)/);
    let code=null;
    if(h){try{code=await unpackCode(h[1]);}catch(e){code=null;}if(hin&&hin[1]){try{inEl.value=new TextDecoder().decode(unb64u(hin[1]));}catch(e){}}}
    if(code===null){const saved=LS.get("js1-pg-code");if(saved&&saved.trim())code=saved;const si=LS.get("js1-pg-stdin");if(si)inEl.value=si;}
    if(code!==null)setCode(code);
    if(inEl.value)q("#pgInBox").open=true;
    setFile();visualize();})();
  setTab(tab);
  /* v7: the Look menu beside the Memory switch: Classic (no class), Glass, Soft, Outline, Minimal (body.pg-lk-glass|soft|line|mono) */
  const lookSel=q("#pgLook"),LOOKS=["classic","glass","soft","line","mono"];
  function setLook(v){if(!LOOKS.includes(v))v="classic";for(const l of LOOKS)document.body.classList.toggle("pg-lk-"+l,l===v&&l!=="classic");if(lookSel)lookSel.value=v;LS.set("js1-pg-look",v);}
  if(lookSel){lookSel.onchange=()=>setLook(lookSel.value);setLook(LS.get("js1-pg-look")||"classic");}
  /* load(code, stdin, run): a mission's starter becomes the editor's program (Reset returns to it), like picking an example */
  const loadCode=(code,stdin,go1)=>{baseCode=code;box._orig=code;setCode(code);inEl.value=stdin||"";q("#pgInBox").open=!!stdin;exSel.value="";setFile();if(go1!==false)visualize();};
  window.PGV={run:visualize,load:loadCode,setLook,go:k=>go(k),act:a=>act(a),gif:()=>saveGif(),setMem,setFull,toggleBp,setTab,get cx(){return CX;},get result(){return R;},get step(){return K;},layoutCount:()=>DRAWN.size};
})();
