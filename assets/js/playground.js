/* playground.js: the Java Visual Playground UI (java/playground.html). Loaded after course.js and jvm-lite.js, before run-java.js.
   Visualize runs the editor's program in JVML (jvm-lite.js) and steps through the recorded snapshots: stack frames, heap boxes
   keyed by object id (only boxes whose record changed are rebuilt), String pool strip, SVG reference arrows, console, "Why?" line.
   Everything lives in one IIFE (classic scripts share one global scope). CSS: the "playground v1" block in course.css (pg- classes).
   localStorage (always in try/catch): js1-pg-code, js1-pg-stdin, js1-pg-speed. Details: kb/playground.md. */
"use strict";
(function(){
  const PGhost=document.getElementById("pgv");if(!PGhost||!window.JVML)return;
  const q=(s,r)=>(r||document).querySelector(s),qa=(s,r)=>Array.from((r||document).querySelectorAll(s));
  const H=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const LS={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}}};
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const box=q(".code",PGhost),inEl=q("#pgIn"),con=q("#pgCon"),conInfo=q("#pgConInfo"),why=q("#pgWhy"),slide=q("#pgSlide"),pos=q("#pgPos"),
    speedSel=q("#pgSpeed"),panel=q("#pgPanel"),classesEl=q("#pgClasses"),objsBox=q("#pgObjs"),svg=q("#pgArrows"),framesEl=q("#pgFrames"),heapEl=q("#pgHeap"),poolEl=q("#pgPool"),exSel=q("#pgEx"),playBtn=q(".pg-play",PGhost);
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
  let R=null,K=0,timer=null,stale=false,marks=[],errMark=null;
  let objMode=LS.get("js1-pg-objs")==="1";
  const speed=()=>parseFloat(speedSel.value)||1;
  speedSel.value=LS.get("js1-pg-speed")||"1";if(!speedSel.value)speedSel.value="1";
  /* ---------- running ---------- */
  function visualize(){
    stop();const code=getCode();setFile();LS.set("js1-pg-code",code);LS.set("js1-pg-stdin",inEl.value);
    why.innerHTML='<span class="pg-busy"></span> Running the program in the visualizer…';PGhost.classList.add("pg-running");
    setTimeout(()=>{
      const t0=performance.now();
      try{R=JVML.run(code,inEl.value);}catch(e){R={steps:[],out:"",errR:[],error:{line:0,msg:"internal error: "+e.message,kind:"internal"}};}
      R.took=Math.round(performance.now()-t0);lineKey="";conKey="";PGhost.classList.remove("pg-running");stale=false;PGhost.classList.remove("pg-stale");
      clearErr();
      if(!R.steps.length){showFatal();return;}
      slide.max=String(R.steps.length-1);go(0);
      if(R.error&&R.error.line)markErr(R.error.line);},30);}
  function showFatal(){const e=R.error||{msg:"nothing to show",line:0};
    framesEl.innerHTML="";heapEl.innerHTML="";heapEl.style.height="0px";poolEl.hidden=true;svg.innerHTML="";slide.max="0";slide.value="0";pos.textContent="step 0 / 0";
    con.innerHTML='<span class="pg-err">'+H((e.line?"Line "+e.line+": ":"")+e.msg)+"</span>";conInfo.textContent=e.kind==="compile"?"did not compile":"stopped";
    why.innerHTML='<b class="pg-bad">'+(e.kind==="compile"?"Compile error":"Can't visualize this program")+"</b> · "+H((e.line?"line "+e.line+": ":"")+e.msg.split("\n")[0])+(e.kind!=="compile"?" · try <b>Run on a real JDK</b>":"");
    if(e.line)markErr(e.line);}
  function markErr(line){const c=cm();if(!c||line<1||line>c.lineCount())return;errMark=c.addLineClass(line-1,"background","pg-errline");}
  function clearErr(){const c=cm();if(c&&errMark){c.removeLineClass(errMark,"background","pg-errline");errMark=null;}}
  /* ---------- stepping ---------- */
  function go(k){if(!R||!R.steps.length)return;K=Math.max(0,Math.min(k,R.steps.length-1));render();}
  function play(){if(!R||!R.steps.length)return;if(timer){stop();return;}if(K>=R.steps.length-1)go(0);
    playBtn.textContent="❚❚";playBtn.setAttribute("aria-label","Pause");
    const tick=()=>{if(K>=R.steps.length-1){stop();return;}go(K+1);timer=setTimeout(tick,Math.max(40,700/speed()));};timer=setTimeout(tick,Math.max(40,700/speed()));}
  function stop(){if(timer)clearTimeout(timer);timer=null;playBtn.textContent="▶";playBtn.setAttribute("aria-label","Play");}
  /* ---------- rendering ---------- */
  function render(){
    const S=JVML.state(R,K);const N=R.steps.length;
    slide.value=String(K);pos.textContent="step "+(K+1)+" / "+N+(S.line?" · line "+S.line:"");
    lines(S);consoleOut(S);whyLine(S);
    const chg=new Set(S.changed);
    const model=heapModel(S);
    drawFrames(S,chg);drawHeap(S,model,chg);drawArrows(chg);}
  let lineKey="";
  function lines(S){const c=cm();if(!c)return;const lk=S.line+"|"+S.prev+"|"+S.ev+"|"+stale+"|"+(R&&R.took);if(lk===lineKey)return;lineKey=lk;for(const m of marks)c.removeLineClass(m.h,"background",m.c);marks=[];
    if(stale)return;
    const add=(l,cls)=>{if(l>0&&l<=c.lineCount())marks.push({h:c.addLineClass(l-1,"background",cls),c:cls});};
    if(S.prev&&S.prev!==S.line)add(S.prev,"pg-prevline");add(S.line,S.ev==="exception"?"pg-exline":"pg-curline");
    if(S.line>0&&S.line<=c.lineCount()){const info=c.getScrollInfo(),top=c.heightAtLine(S.line-1,"local");if(top<info.top+20||top>info.top+info.clientHeight-40)c.scrollTo(null,Math.max(0,top-info.clientHeight/3));}}
  let conKey="";
  function consoleOut(S){const last0=K===R.steps.length-1,ck=S.console.length+"|"+last0+"|"+(R.error?1:0)+"|"+R.took;if(ck===conKey)return;conKey=ck;let txt=S.console,html="",at=0;
    for(const [a,b] of S.errR){html+=H(txt.slice(at,a))+'<span class="pg-err">'+H(txt.slice(a,b))+"</span>";at=b;}html+=H(txt.slice(at));
    const last=K===R.steps.length-1;
    if(last&&R.error)html+=(html&&!html.endsWith("\n")?"\n":"")+'<span class="pg-warn">'+H((R.error.line?"Line "+R.error.line+": ":"")+R.error.msg)+(R.error.kind==="limit"?"":"\n(the visualizer stops here; Run on a real JDK for the real output)")+"</span>";
    con.innerHTML=html||'<span class="pg-dim">(nothing printed yet)</span>';con.scrollTop=con.scrollHeight;
    conInfo.textContent=last?(R.error?"stopped":R.uncaught?"ended with an exception":"finished")+" · "+N(R.total||R.steps.length)+" steps in "+R.took+" ms":"";}
  const N=n=>n.toLocaleString("en-US");
  function whyLine(S){
    let t=S.why;
    if(!t){const f=S.frames.filter(x=>x.fr).pop();
      switch(S.ev){case "call":t=f?"enter "+f.name+": a new frame is pushed":"";break;
        case "return":t=f?f.name+" returns"+(f.ret&&f.ret.p!=="void"?" "+valTxt(f.ret,S):"")+", and its frame is popped next":"";break;
        case "exception":t="an exception is thrown here";break;
        case "gc":t="System.gc() runs the garbage collector";break;
        case "end":t=R.uncaught?"the exception was never caught, so the program ends and the JVM prints the stack trace":"main returned: the program is finished";break;
        default:t=K===0?"the program starts":S.line?"line "+S.line+" runs next":"";}}
    why.innerHTML=(S.ev==="exception"?'<b class="pg-bad">Exception</b> · ':S.ev==="call"?'<b class="pg-acc">Call</b> · ':S.ev==="return"?'<b class="pg-acc">Return</b> · ':S.ev==="end"?'<b class="pg-good">End</b> · ':S.ev==="gc"?'<b class="pg-bad">GC</b> · ':"")+(t?H(t):"&nbsp;");}
  /* values */
  function valTxt(v,S){if(v===undefined)return "";if(v===null)return "null";if(v.r!==undefined){const r=S.recs.get(v.r);if(r&&r.k==="str")return '"'+r.s+'"';if(r&&r.k==="box")return r.s;return "→ "+(r?(r.cls||r.k):"#"+v.r);}
    if(v.p==="char")return "'"+v.s+"' ("+v.c+")";return v.s;}
  function cellVal(v,S,key){ // inline value inside a box (strings and boxed numbers are drawn inline in containers)
    if(v===null||v===undefined)return '<span class="pg-null">null</span>';
    if(v.r!==undefined){const r=S.recs.get(v.r);
      if(r&&(r.k==="str"||r.k==="box")&&objMode)return '<span class="pg-dot" data-to="'+v.r+'"'+(key?' data-k="'+H(key)+'"':"")+"></span>";
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
  /* ---------- the heap: which boxes to draw ---------- */
  function refsOf(r){const out=[],a=v=>{if(v&&v.r!==undefined)out.push(v.r);};
    switch(r.k){case "obj":r.f.forEach(x=>a(x.v));break;case "arr":case "list":case "linked":case "stack":case "deque":case "pq":case "set":r.a.forEach(a);break;
      case "map":r.e.forEach(e=>{a(e[0]);a(e[1]);});break;case "entry":a(r.key);a(r.val);break;case "view":case "iter":if(r.of!=null)out.push(r.of);break;}
    return out;}
  function heapModel(S){
    const recs=S.recs,reach=new Set(),order=[],direct=new Set(),qq=[];
    const visit=(id,isDirect)=>{if(id==null)return;const r=recs.get(id);if(!r||r.hid)return;if(isDirect)direct.add(id);if(reach.has(id))return;reach.add(id);order.push(id);qq.push(id);};
    for(const f of S.frames.filter(x=>x.fr).reverse().slice(0,MAXF).concat(S.frames.filter(x=>x.st))){for(const v of f.vars)if(v.v&&v.v.r!==undefined)visit(v.v.r,true);if(f.ret&&f.ret.r!==undefined)visit(f.ret.r,true);}
    if(S.step.x!=null)visit(S.step.x,true); // the exception being thrown
    // deeper frames that are not drawn still keep objects alive
    for(const f of S.frames.filter(x=>x.fr).reverse().slice(MAXF))for(const v of f.vars)if(v.v&&v.v.r!==undefined)visit(v.v.r,false);
    while(qq.length){const id=qq.shift(),r=recs.get(id);
      if(r.k==="obj"){for(const x of r.f)if(x.v&&x.v.r!==undefined)visit(x.v.r,true);}
      else if(r.k==="entry"||r.k==="view"||r.k==="iter"){for(const t of refsOf(r))visit(t,true);}
      else for(const t of refsOf(r))visit(t,objMode);}
    // garbage: recently unreachable objects stay visible, faded
    const GK=["obj","arr","list","linked","stack","deque","pq","map","set","sb"];
    const freed=S.ev==="gc"?S.step.d.filter(r=>r.dead&&GK.includes(r.k)).map(r=>r.id):[];
    const gone=[];for(const [id,r] of recs){if(reach.has(id)||r.hid||r.pre||r.dead||typeof id!=="number")continue;if(["obj","arr","list","linked","stack","deque","pq","map","set","sb"].includes(r.k))gone.push(id);}
    gone.sort((a,b)=>b-a);
    const pool=[];for(const [id,r] of recs)if(r.k==="str"&&r.pool)pool.push(id);
    return {reach,order,direct,gone:gone.slice(0,12),freed:freed.slice(0,24),pool:pool.slice(0,40)};}
  const DRAWN=new Map(); // heap id -> element (keyed, reused while the record is unchanged)
  let flashed=[];
  function boxHtml(r,S){
    switch(r.k){
      case "obj":{const tag=r.en?r.cls+" · "+r.en:r.rec?"record "+r.cls:r.ex?r.cls+" (exception)":r.anon?r.cls+" (anonymous)":r.cls;
        return '<div class="pg-bh">'+H(tag)+"</div>"+(r.f.length?'<table class="pg-flds">'+r.f.map(x=>'<tr data-k="h'+r.id+":"+H(x.n)+'"><td class="pg-vn">'+H(x.n)+'</td><td class="pg-vv">'+varVal(x.v,S,"h"+r.id+":"+x.n)+"</td></tr>").join("")+"</table>":'<div class="pg-novars">no fields</div>');}
      case "str":return '<div class="pg-bh">String'+(r.pool?" · pooled":"")+'</div><div class="pg-str">"'+H(r.s.length>60?r.s.slice(0,60)+"…":r.s)+'"</div>';
      case "box":return '<div class="pg-bh">'+H(r.cls)+(r.cached?" · cached":"")+'</div><div class="pg-str">'+H(r.s)+"</div>";
      case "arr":{const n=r.len,show=Math.min(n,64);let cells="";for(let i=0;i<show;i++)cells+='<div class="pg-cell" data-k="h'+r.id+":"+i+'"><div class="pg-cv0">'+cellVal(r.a[i],S,"h"+r.id+":"+i)+'</div><i>'+i+"</i></div>";
        return '<div class="pg-bh">'+H(r.et)+"["+n+"]</div>"+'<div class="pg-cells">'+cells+(n>show?'<div class="pg-cell pg-cmore">+'+(n-show)+"</div>":"")+(n===0?'<div class="pg-novars">empty</div>':"")+"</div>";}
      case "list":return '<div class="pg-bh">'+H(r.cls)+' <small>size '+r.size+(r.cap!==undefined&&r.cap!==null?" · capacity "+r.cap:"")+"</small></div>"+cellsRow(r,S);
      case "linked":return '<div class="pg-bh">LinkedList <small>size '+r.size+'</small></div><div class="pg-chain">'+(r.a.length?r.a.map((v,i)=>'<span class="pg-node">'+cellVal(v,S,"h"+r.id+":"+i)+"</span>").join('<span class="pg-link">⇄</span>'):'<span class="pg-novars">empty</span>')+"</div>";
      case "stack":case "deque":{const isStack=r.k==="stack";const items=isStack?r.a.slice().reverse():r.a;
        return '<div class="pg-bh">'+H(r.cls)+' <small>size '+r.size+"</small></div>"+'<div class="pg-vstack">'+(items.length?items.map((v,i)=>'<div class="pg-slot">'+cellVal(v,S)+(i===0?'<span class="pg-top">'+(isStack?"top":"head · top")+"</span>":i===items.length-1&&!isStack?'<span class="pg-top tail">tail</span>':"")+"</div>").join(""):'<div class="pg-novars">empty</div>')+"</div>";}
      case "pq":{let tree="",lv=0;for(let s=0;s<r.a.length;lv++,s=2*s+1){const e=Math.min(r.a.length,2*s+1);tree+='<div class="pg-tl">'+r.a.slice(s,e).map(v=>'<span>'+cellVal(v,S)+"</span>").join("")+"</div>";if(lv>4)break;}
        return '<div class="pg-bh">PriorityQueue <small>size '+r.size+" · head = smallest</small></div>"+cellsRow(r,S)+(r.a.length>1?'<div class="pg-ptree">'+tree+"</div>":"");}
      case "map":return '<div class="pg-bh">'+H(r.cls)+' <small>size '+r.size+(r.cap?" · table "+r.cap:"")+"</small></div>"+(r.e.length?'<table class="pg-map">'+r.e.map((e,i)=>'<tr>'+(e[2]!==null&&e[2]!==undefined?'<td class="pg-bk">['+e[2]+"]</td>":"")+'<td class="pg-mk">'+cellVal(e[0],S)+'</td><td class="pg-ar">→</td><td class="pg-mv">'+cellVal(e[1],S,"h"+r.id+":v"+i)+"</td></tr>").join("")+"</table>":'<div class="pg-novars">empty</div>');
      case "set":return '<div class="pg-bh">'+H(r.cls)+' <small>size '+r.size+(r.cap?" · table "+r.cap:"")+"</small></div>"+'<div class="pg-cells">'+(r.a.length?r.a.map((v,i)=>'<div class="pg-cell"><div class="pg-cv0">'+cellVal(v,S)+"</div>"+(r.b&&r.b[i]!==null&&r.b[i]!==undefined?"<i>["+r.b[i]+"]</i>":"")+"</div>").join(""):'<div class="pg-novars">empty</div>')+"</div>";
      case "sb":return '<div class="pg-bh">'+H(r.cls)+' <small>length '+r.s.length+" · capacity "+r.cap+'</small></div><div class="pg-str">"'+H(r.s.length>60?r.s.slice(0,60)+"…":r.s)+'"</div>';
      case "entry":return '<div class="pg-bh">Map.Entry</div><div class="pg-str">'+cellVal(r.key,S)+" = "+cellVal(r.val,S)+"</div>";
      case "view":return '<div class="pg-bh">'+H(r.cls)+' <small>a live view</small></div><div class="pg-str"><span class="pg-dot" data-to="'+r.of+'"></span></div>';
      case "iter":return '<div class="pg-bh">Iterator <small>cursor '+r.cur+'</small></div><div class="pg-str"><span class="pg-dot" data-to="'+r.of+'"></span></div>';
      case "lambda":return '<div class="pg-bh">λ lambda</div><div class="pg-str pg-mono">'+H(r.text.length>48?r.text.slice(0,48)+"…":r.text)+"</div>";
      case "misc":return '<div class="pg-bh">'+H(r.cls)+'</div><div class="pg-str">'+H(r.s||"")+"</div>";}
    return '<div class="pg-bh">'+H(r.k)+"</div>";}
  function cellsRow(r,S){if(!r.a.length)return '<div class="pg-cells"><div class="pg-novars">empty</div></div>';
    const show=Math.min(r.a.length,64);let cells="";for(let i=0;i<show;i++)cells+='<div class="pg-cell" data-k="h'+r.id+":"+i+'"><div class="pg-cv0">'+cellVal(r.a[i],S,"h"+r.id+":"+i)+"</div><i>"+i+"</i></div>";
    return '<div class="pg-cells">'+cells+(r.a.length>show?'<div class="pg-cell pg-cmore">+'+(r.a.length-show)+"</div>":"")+"</div>";}
  function getBox(id,r,S,cls){
    let el=DRAWN.get(id);
    if(!el){el=document.createElement("div");el.dataset.id=id;el._fresh=true;el._th=false;el._tag=null;DRAWN.set(id,el);}
    // a record is an immutable snapshot of one object, and the Strings and boxed numbers a box shows inline never change,
    // so a box is rebuilt only when its own record changes
    if(el._rec!==r){el.innerHTML=boxHtml(r,S);el._rec=r;el._w=0;el._tag=null;}
    const base="pg-box pg-k-"+r.k+(cls||"");
    if(el._base!==base){el._base=base;el.className=base+(el._th?" pg-thrown":"");}
    const tag=/pg-freed/.test(cls||"")?"freed by GC":/pg-gone/.test(cls||"")?"unreachable":null;
    if(tag!==el._tag){el._tag=tag;const t=q(".pg-gtag.gn",el);if(t)t.remove();if(tag)el.insertAdjacentHTML("afterbegin",'<span class="pg-gtag gn">'+tag+"</span>");}
    if(r.k==="obj")el.dataset.cls=r.cls;
    if(el._fresh){el.classList.add("pg-new");setTimeout(()=>el.classList.remove("pg-new"),500);}
    return el;}
  function drawHeap(S,M,chg){
    const recs=S.recs;
    // which ids get their own box
    const show=[];for(const id of M.order){const r=recs.get(id);if(!r)continue;if((r.k==="str"&&r.pool)||((r.k==="str"||r.k==="box")&&!M.direct.has(id)))continue;if(r.k==="entry"&&!M.direct.has(id))continue;show.push(id);}
    // pool strip
    const pb=q(".pg-poolb",poolEl);
    if(M.pool.length){poolEl.hidden=false;const keep=new Set();
      for(const id of M.pool){const r=recs.get(id);const el=getBox(id,r,S,M.reach.has(id)?"":" pg-quiet");keep.add(el);if(el.parentNode!==pb)pb.appendChild(el);}
      for(const el of Array.from(pb.children))if(!keep.has(el))el.remove();}
    else{poolEl.hidden=true;pb.innerHTML="";}
    // heap boxes
    const keep=new Set(),els=[];
    for(const id of show){const el=getBox(id,recs.get(id),S,"");els.push([id,el]);keep.add(el);}
    for(const id of M.gone){const r=recs.get(id);if(!r)continue;const el=getBox(id,r,S," pg-gone");els.push([id,el]);keep.add(el);}
    for(const id of M.freed){const r=recs.get(id);if(!r)continue;const el=getBox(id,r,S," pg-gone pg-freed");els.push([id,el]);keep.add(el);}
    for(const el of Array.from(heapEl.children))if(!keep.has(el))el.remove();
    for(const [,el] of els)if(el.parentNode!==heapEl)heapEl.appendChild(el);
    // the exception being thrown
    for(const [id,el] of els){const th=id===S.step.x;if(th!==el._th){el._th=th;el.classList.toggle("pg-thrown",th);const t=q(".pg-gtag.th",el);if(th&&!t)el.insertAdjacentHTML("afterbegin",'<span class="pg-gtag th">thrown</span>');else if(!th&&t)t.remove();}}
    // changed cells and fields flash: only inside the boxes this step touched
    for(const el of flashed)el.classList.remove("pg-chg");flashed=[];
    const touched=new Set();for(const k of chg)if(k[0]==="h"){const i=k.indexOf(":");touched.add(i<0?k.slice(1):k.slice(1,i));}
    for(const id of touched){const el=DRAWN.get(+id);if(!el||!el.isConnected)continue;for(const c of qa("[data-k]",el))if(chg.has(c.dataset.k)){c.classList.add("pg-chg");flashed.push(c);}}
    layout(S,els);
    if(!els.length&&!M.pool.length)heapEl.innerHTML='<div class="pg-empty">The heap is empty: no objects yet.</div>';}
  /* ---------- layout: linked chains in a row, trees top-down, everything else flows ---------- */
  function layout(S,els){
    const W=Math.max(320,heapEl.clientWidth||600),GX=34,GY=28;
    for(const [,el] of els){if(!el._w){el._w=el.offsetWidth;el._h=el.offsetHeight;}}
    const recs=S.recs,byId=new Map(els),placed=new Set();let y=4,maxX=0;
    const selfF=r=>r&&r.k==="obj"?r.f.filter(x=>x.self&&x.v!==undefined):[];
    const put=(id,x,yy)=>{const el=byId.get(id);if(el._x!==x){el._x=x;el.style.left=x+"px";}if(el._y!==yy){el._y=yy;el.style.top=yy+"px";}placed.add(id);maxX=Math.max(maxX,x+el._w);};
    // trees: objects with two or more self-typed fields (left/right)
    const treeIds=els.map(e=>e[0]).filter(id=>selfF(recs.get(id)).length>=2);
    const isChild=new Set();for(const id of treeIds)for(const x of selfF(recs.get(id)))if(x.v&&x.v.r!==undefined&&byId.has(x.v.r))isChild.add(x.v.r);
    for(const root of treeIds.filter(id=>!isChild.has(id))){
      const rows=[];let idx=0;const seen=new Set();
      const walk=(id,d)=>{if(id==null||seen.has(id)||!byId.has(id))return;seen.add(id);const f=selfF(recs.get(id));walk(f[0]&&f[0].v&&f[0].v.r,d+1);rows.push({id,d,i:idx++});for(const x of f.slice(1))walk(x.v&&x.v.r,d+1);};
      walk(root,0);
      const cw=Math.max(...rows.map(r=>byId.get(r.id)._w))+14,ch=Math.max(...rows.map(r=>byId.get(r.id)._h))+GY+10;
      for(const r of rows)put(r.id,6+r.i*cw,y+r.d*ch);
      y+=(Math.max(...rows.map(r=>r.d))+1)*ch+8;}
    // chains: objects with one self-typed field (next)
    const chainIds=els.map(e=>e[0]).filter(id=>!placed.has(id)&&selfF(recs.get(id)).length===1);
    const pointed=new Set();for(const id of chainIds){const f=selfF(recs.get(id))[0];if(f.v&&f.v.r!==undefined)pointed.add(f.v.r);}
    const heads=chainIds.filter(id=>!pointed.has(id)).concat(chainIds.filter(id=>pointed.has(id)));
    for(const h of heads){if(placed.has(h))continue;let x=6,rowH=0,id=h;const seq=[];
      while(id!=null&&byId.has(id)&&!placed.has(id)&&seq.length<60){seq.push(id);placed.add(id);const f=selfF(recs.get(id))[0];id=f&&f.v&&f.v.r!==undefined?f.v.r:null;}
      if(seq.length<2){for(const s of seq)placed.delete(s);continue;}
      for(const s of seq){const el=byId.get(s);placed.delete(s);put(s,x,y);x+=el._w+GX;rowH=Math.max(rowH,el._h);}
      y+=rowH+GY;}
    // the rest: rows that wrap at the panel width
    let x=6,rowH=0;
    for(const [id,el] of els){if(placed.has(id))continue;if(x>6&&x+el._w>W-6){x=6;y+=rowH+GY;rowH=0;}put(id,x,y);x+=el._w+GX;rowH=Math.max(rowH,el._h);}
    y+=rowH;
    heapEl.style.height=Math.max(60,y+12)+"px";heapEl.style.minWidth=Math.max(0,maxX+12)+"px";
    // boxes appear where they belong; only boxes that move later glide
    for(const [,el] of els)if(el._fresh){el.classList.add("pg-place");el._fresh=false;requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.remove("pg-place")));}}
  /* ---------- arrows ---------- */
  function drawArrows(chg){
    const pr=panel.getBoundingClientRect(),sx=panel.scrollLeft,sy=panel.scrollTop;
    svg.setAttribute("width",panel.scrollWidth);svg.setAttribute("height",panel.scrollHeight);
    let paths="";
    for(const dot of qa(".pg-dot",panel)){
      const to=dot.dataset.to;let tgt=DRAWN.get(+to);if(tgt&&!tgt.isConnected)tgt=null;
      if(!tgt){dot.classList.add("pg-dangle");continue;}
      const a=dot.getBoundingClientRect(),b=tgt.getBoundingClientRect();
      const x1=a.left+a.width/2-pr.left+sx,y1=a.top+a.height/2-pr.top+sy;
      const L=b.left-pr.left+sx,T=b.top-pr.top+sy,Rr=L+b.width,B=T+b.height;
      let d;
      if(L>x1+18){const x2=L-1,y2=Math.min(Math.max(T+14,y1-40),B-8),y2b=T+14;d=orth(x1,y1,x2,Math.abs(y2b-y1)<b.height?Math.max(T+8,Math.min(y1,B-8)):y2b);}
      else if(T>y1+12){const x2=Math.min(Math.max(x1,L+12),Rr-12);d="M"+x1+" "+y1+" C"+x1+" "+(y1+Math.max(30,(T-y1)/2))+","+x2+" "+(T-Math.max(30,(T-y1)/2))+","+x2+" "+(T-1);}
      else if(B<y1-12){const x2=Math.min(Math.max(x1,L+12),Rr-12);d="M"+x1+" "+y1+" C"+x1+" "+(y1-40)+","+x2+" "+(B+40)+","+x2+" "+(B+1);}
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
    const host=t.closest(".pg-dot")?t.closest(".pg-dot"):t.closest("tr,.pg-cell,.pg-slot,.pg-node");
    const dots=host?(host.classList.contains("pg-dot")?[host]:qa(".pg-dot",host)):[];
    if(dots.length&&!t.closest(".pg-box:not(.pg-k-obj)")||dots.length&&t.closest(".pg-cell,.pg-slot,.pg-node,tr")){
      for(const d of dots){light(d.closest("tr,.pg-cell,.pg-slot,.pg-node"));const b=DRAWN.get(+d.dataset.to);if(b&&b.isConnected)light(b);
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
  exSel.onchange=()=>{const e=EX[+exSel.value];if(!e)return;baseCode=e.code;setCode(e.code);inEl.value=e.stdin;q("#pgInBox").open=!!e.stdin;exSel.value="";setFile();visualize();};
  q("#pgShare").onclick=async()=>{const code=getCode();const t=await packCode(code);const url=location.href.split("#")[0]+"#code="+t+(inEl.value?"&in="+b64u(new TextEncoder().encode(inEl.value)):"");
    try{history.replaceState(null,"",url);}catch(e){}
    const ok=()=>{why.innerHTML='<b class="pg-good">Link copied</b> · anyone who opens it gets this program'+(inEl.value?" and its input":"")+".";};
    if(navigator.clipboard)navigator.clipboard.writeText(url).then(ok,()=>{why.textContent="Copy this link: "+url;});else why.textContent="Copy this link: "+url;};
  qa(".pg-ctl [data-a]").forEach(b=>b.onclick=()=>act(b.dataset.a));
  function act(a){if(!R)return;if(a!=="play")stop();switch(a){case "first":go(0);break;case "back":go(K-1);break;case "next":go(K+1);break;case "last":go(R.steps.length-1);break;case "play":play();break;}}
  slide.oninput=()=>{stop();go(+slide.value);};
  speedSel.onchange=()=>{LS.set("js1-pg-speed",speedSel.value);if(timer){stop();play();}};
  inEl.oninput=()=>LS.set("js1-pg-stdin",inEl.value);
  document.addEventListener("keydown",e=>{
    const t=e.target;if(t&&t.closest&&t.closest("input,textarea,select,.CodeMirror,[contenteditable]")){
      if(t.closest(".CodeMirror")&&e.key==="Enter"&&(e.ctrlKey||e.metaKey)&&t.closest("#pgv")){e.preventDefault();e.stopPropagation();visualize();}return;}
    if(!R||e.ctrlKey||e.metaKey||e.altKey)return;
    const k=e.key;
    if(k==="ArrowRight"||k===" "){e.preventDefault();act("next");}else if(k==="ArrowLeft"){e.preventDefault();act("back");}
    else if(k==="Home"){e.preventDefault();act("first");}else if(k==="End"){e.preventDefault();act("last");}else if(k==="p"||k==="P"){e.preventDefault();act("play");}},true);
  let rsz=0;addEventListener("resize",()=>{cancelAnimationFrame(rsz);rsz=requestAnimationFrame(()=>{if(R&&R.steps.length){DRAWN.forEach(el=>el._w=0);render();}});},{passive:true});
  panel.addEventListener("scroll",()=>{},{passive:true});
  /* edits after a run: the drawing no longer matches the code */
  const watch=setInterval(()=>{const c=cm();if(!c)return;clearInterval(watch);
    let tm=0;c.on("changes",()=>{clearTimeout(tm);tm=setTimeout(()=>LS.set("js1-pg-code",c.getValue()),400);if(R&&!stale){stale=true;PGhost.classList.add("pg-stale");stop();
      for(const m of marks)c.removeLineClass(m.h,"background",m.c);marks=[];clearErr();why.innerHTML="The code changed: press <b>▶ Visualize</b> (Ctrl+Enter) to see the new run.";}});
    if(errMark===null&&R&&R.error&&R.error.line)markErr(R.error.line);if(R&&R.steps.length)render();},80);
  /* ---------- start: shared link > saved work > default example ---------- */
  (async()=>{
    const h=location.hash.match(/code=([A-Za-z0-9_-]+)/),hin=location.hash.match(/[&#]in=([A-Za-z0-9_-]*)/);
    let code=null;
    if(h){try{code=await unpackCode(h[1]);}catch(e){code=null;}if(hin&&hin[1]){try{inEl.value=new TextDecoder().decode(unb64u(hin[1]));}catch(e){}}}
    if(code===null){const saved=LS.get("js1-pg-code");if(saved&&saved.trim())code=saved;const si=LS.get("js1-pg-stdin");if(si)inEl.value=si;}
    if(code!==null)setCode(code);
    if(inEl.value)q("#pgInBox").open=true;
    setFile();visualize();})();
  window.PGV={run:visualize,go:k=>go(k),get result(){return R;},get step(){return K;},layoutCount:()=>DRAWN.size};
})();
