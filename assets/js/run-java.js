/* Run Java (v37, 2026-10-23): a ▶ Run button on every Java editor and on the Playground. The code is compiled and run on a
   real JDK by Wandbox (https://wandbox.org, a free public compile service with CORS enabled), so it works on GitHub Pages
   and from file://, with an internet connection. ~10–20 s per run; stdout, stderr/compile errors and the exit status are
   shown under the editor. Wandbox saves the source as prog.java, so a top-level `public class X` would be refused: the
   `public` of top-level type declarations is removed before sending (behaviour is unchanged). Programs that read
   System.in get a stdin box. The Playground compares the output with the task's expected output.
   Loaded after course.js (which creates the editor shells) on every Java page. Classes are prefixed jr-. */
"use strict";
(function(){
  const API="https://wandbox.org/api/compile.json",COMPILERS=["openjdk-jdk-22+36","openjdk-jdk-21+35"];
  const strip=src=>src.replace(/^([ \t]*)public(\s+)(?=(?:(?:final|abstract|sealed|non-sealed|static|strictfp)\s+)*(?:class|interface|enum|record)\b)/gm,"$1");
  const readsIn=src=>/System\.in\b|new\s+Scanner\s*\(|BufferedReader|Console\(\)/.test(src);
  async function exec(src,stdin){let last=null;
    for(const compiler of COMPILERS){const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),90000);
      try{const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({compiler,code:strip(src),stdin:stdin||"",options:""}),signal:ctl.signal});
        clearTimeout(t);if(r.status>=500){last=new Error("Wandbox returned "+r.status);continue;}
        if(!r.ok)throw new Error("Wandbox returned "+r.status);const j=await r.json();j.compiler=compiler;return j;}
      catch(e){clearTimeout(t);last=e;if(e.name==="AbortError")last=new Error("The run took longer than 90 s and was stopped.");}}
    throw last||new Error("Run service unavailable");}
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  function attach(box,getSrc,opts){opts=opts||{};if(box._jr)return;box._jr=true;
    const bar=box.querySelector(".bar");if(!bar)return;
    const run=document.createElement("button");run.type="button";run.className="ib run jr-run";run.textContent="▶ Run";run.title="Compile and run on a real JDK (Wandbox) · Ctrl+Enter";
    bar.insertBefore(run,bar.querySelector(".cp"));
    const out=document.createElement("div");out.className="jr-out";out.hidden=true;box.appendChild(out);
    let stdinBox=null;const ensureIn=()=>{if(stdinBox)return stdinBox;stdinBox=document.createElement("label");stdinBox.className="jr-in";stdinBox.innerHTML='<span>stdin (what the program reads)</span><textarea rows="2" spellcheck="false" placeholder="one value per line, or space-separated"></textarea>';box.insertBefore(stdinBox,out);return stdinBox;};
    async function go(){if(run.disabled)return;const src=getSrc();if(readsIn(src)&&!opts.stdin)ensureIn();if(typeof opts.fileOf==="function")opts.file=opts.fileOf();
      run.disabled=true;run.textContent="⏳ Running…";out.hidden=false;const t0=performance.now();
      out.innerHTML='<div class="jr-status">Compiling and running on a real JDK (Wandbox)… usually 10–20 s.<i class="jr-spin"></i></div>';
      try{const j=await exec(src,opts.stdin?opts.stdin():stdinBox?stdinBox.querySelector("textarea").value:"");const secs=((performance.now()-t0)/1000).toFixed(1);
        const ce=(j.compiler_error||"").trim(),so=j.program_output||"",se=(j.program_error||"").trim(),ok=j.status==="0"&&!ce;
        let html="";
        if(ce)html+='<div class="jr-lbl">compile error</div><pre class="jr-err">'+esc(ce.replace(/prog\.java/g,(opts.file||"Main.java")))+"</pre>";
        else{html+='<div class="jr-lbl">output</div><pre class="jr-stdout">'+(so?esc(so):'<span class="jr-dim">(no output)</span>')+"</pre>";
          if(se)html+='<div class="jr-lbl">stderr</div><pre class="jr-err">'+esc(se.replace(/prog\.java/g,(opts.file||"Main.java")))+"</pre>";}
        let verdict="";if(opts.expected&&!ce){const exp=opts.expected().trim(),got=so.trim();if(exp&&exp!=="(your output)")verdict=got===exp?' · <b class="jr-ok">✓ matches the expected output</b>':' · <b class="jr-bad">✗ differs from the expected output</b>';}
        html+='<div class="jr-status">'+(ok?"✓":"✗")+" exit "+esc(j.status)+(j.signal?" ("+esc(j.signal)+")":"")+" · JDK "+esc(j.compiler.replace("openjdk-jdk-","").split("+")[0])+" · "+secs+" s"+verdict+'<button type="button" class="ib jr-close">✕</button></div>';
        out.innerHTML=html;}
      catch(e){out.innerHTML='<div class="jr-lbl">could not run</div><pre class="jr-err">'+esc(e.message||String(e))+'</pre><div class="jr-status">Check your internet connection, or run it locally: save the file and type <code>java '+esc(opts.file||"Main.java")+'</code> (JDK 11+).<button type="button" class="ib jr-close">✕</button></div>';}
      run.disabled=false;run.textContent="▶ Run";}
    run.onclick=go;box._run=go;
    out.addEventListener("click",e=>{if(e.target.closest(".jr-close"))out.hidden=true;});
    if(!opts.noKey)box.addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)&&!e.target.closest(".jr-in")){e.preventDefault();go();}});}
  /* lesson editors (shells exist at load; CodeMirror mounts later) */
  document.querySelectorAll(".code").forEach(box=>{if(box.closest("#pg,#pgv,#heroWin,.hw"))return;const fn=box.querySelector(".fn");
    attach(box,()=>box._cm?box._cm.getValue():(box._src||(box.querySelector("pre")||{}).textContent||""),{file:fn?fn.textContent:"Main.java"});});
  /* the Java Visual Playground (java/playground.html): its toolbar button calls box._run() */
  const pv=document.querySelector("#pgv .code");
  if(pv){const fn=pv.querySelector(".fn"),inp=document.querySelector("#pgIn");
    attach(pv,()=>pv._cm?pv._cm.getValue():(pv._src||""),{fileOf:()=>fn?fn.textContent:"Main.java",stdin:()=>inp?inp.value:"",noKey:true});}
  /* the Playground: compare with the expected output shown next to it */
  const pg=document.querySelector("#pg .code");
  if(pg){const ta=pg.querySelector("textarea"),fn=pg.querySelector(".fn"),exp=document.querySelector("#pgOut");
    attach(pg,()=>pg._cm?pg._cm.getValue():ta?ta.value:"",{file:fn?fn.textContent:"Playground.java",expected:()=>exp?exp.textContent:""});}
  const f=document.querySelector("footer");if(f){const s=document.createElement("span");s.className="credits";s.innerHTML=' · ▶ Run compiles on a real JDK via <a href="https://wandbox.org" rel="noopener">Wandbox</a>';f.appendChild(s);}
})();
