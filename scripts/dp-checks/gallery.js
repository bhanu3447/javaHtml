// state gallery: every view × step of the labs listed in window.__LABS, cloned into frames, 2 per row; rest of page moved off-screen
(function(){
  const keys=window.__LABS;const g=document.createElement("div");
  g.style.cssText="position:absolute;left:0;top:0;width:1260px;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px;background:var(--bg);z-index:9999";
  keys.forEach(key=>{const B=DPL.BUILT[key];B.ctl.forEach((c,vi)=>{B.tab(vi);for(let si=0;si<c.n;si++){c.show(si);
    const v=B.host.querySelector('.dp-view[data-v="'+vi+'"]');const f=document.createElement("div");
    f.style.cssText="border:1px solid var(--line);border-radius:10px;padding:8px;background:var(--surface)";
    f.innerHTML='<div style="font:600 11px JetBrains Mono,monospace;color:var(--muted);margin-bottom:4px">'+key+" · "+DPL.LABS[key].views[vi].name+" · step "+(si+1)+"</div>";
    ["dp-now","dp-stage"].forEach(cl=>f.appendChild(v.querySelector("."+cl).cloneNode(true)));g.appendChild(f);}});B.host.querySelectorAll(".dp-view").forEach(p=>p.hidden=false);});
  document.querySelector("body>.wrap").style.cssText="position:absolute;left:-5000px;top:0;width:1200px";
  document.querySelector("nav").style.display="none";
  document.body.appendChild(g);
})();
