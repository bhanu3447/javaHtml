// injected before </body>: walks every DPL lab, every view, every step; writes JSON into <pre id="dpout">
(function(){try{
  const out={errors:window.__errs||[],labs:{},fails:[],quiz:0,rcp:0,scroll:0,editors:0};
  const ov=(a,b,pad)=>a.x<b.x+b.width-pad&&b.x<a.x+a.width-pad&&a.y<b.y+b.height-pad&&b.y<a.y+a.height-pad;
  function check(key,vi,si){
    const host=document.getElementById("dp-"+key),view=host.querySelector('.dp-view[data-v="'+vi+'"]');
    const tag=key+"/"+vi+"/"+(si+1);
    const nodes=[...view.querySelectorAll(".dp-nd:not(.dp-hide)")];
    const rects=nodes.map(n=>{const r=n.querySelector("rect");return {id:n.dataset.n,x:+r.getAttribute("x"),y:+r.getAttribute("y"),width:+r.getAttribute("width"),height:+r.getAttribute("height")};});
    // label fit
    nodes.forEach((n,i)=>{const r=rects[i];n.querySelectorAll("text").forEach(t=>{if(!t.textContent)return;const b=t.getBBox();
      if(b.x<r.x+2||b.x+b.width>r.x+r.width-2||b.y<r.y||b.y+b.height>r.y+r.height+1)out.fails.push(tag+" fit "+r.id+": '"+t.textContent+"' "+Math.round(b.width)+"/"+r.width);});});
    // box overlap
    for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++)if(ov(rects[i],rects[j],0))out.fails.push(tag+" boxes overlap "+rects[i].id+"/"+rects[j].id);
    // edge labels vs boxes, edge paths through boxes
    view.querySelectorAll(".dp-ed:not(.dp-hide)").forEach(g=>{const l=g.querySelector(".dp-el");if(l){const b=l.getBBox();rects.forEach(r=>{if(ov(b,r,1))out.fails.push(tag+" edge label "+g.dataset.e+" on box "+r.id);});}
      const p=g.querySelector("path"),L=p.getTotalLength();
      for(let s=6;s<L-6;s+=4){const pt=p.getPointAtLength(s);rects.forEach(r=>{if(pt.x>r.x+3&&pt.x<r.x+r.width-3&&pt.y>r.y+3&&pt.y<r.y+r.height-3)out.fails.push(tag+" edge "+g.dataset.e+" crosses "+r.id);});}});
    // controls
    const back=view.querySelector("[data-a=back]"),next=view.querySelector("[data-a=next]"),n=DPL.LABS[key].views[vi].steps.length;
    if(back.disabled!==(si===0))out.fails.push(tag+" back state");if(next.disabled!==(si===n-1))out.fails.push(tag+" next state");
    if(view.querySelector("[data-pos]").textContent!==(si+1)+" / "+n)out.fails.push(tag+" pos");
    if(!view.querySelector(".dp-now b").textContent.startsWith("STEP "+(si+1)+" / "+n))out.fails.push(tag+" step bar");
    // highlighted code line exists when marks given
    const st=DPL.LABS[key].views[vi].steps[si];if(st.marks&&st.marks.length&&!view.querySelector(".dp-ln.on"))out.fails.push(tag+" no code line for marks "+st.marks.join("|"));
  }
  Object.keys(DPL.BUILT).forEach(key=>{const B=DPL.BUILT[key];out.labs[key]=[];
    B.ctl.forEach((c,vi)=>{B.tab(vi);out.labs[key].push(c.n);for(let si=0;si<c.n;si++){c.show(si);check(key,vi,si);}c.show(0);});B.tab(0);});
  // dedupe
  out.fails=[...new Set(out.fails)].map(f=>f.replace(/\/\d+ /," ")).filter((f,i,a)=>a.indexOf(f)===i);
  out.quiz=document.querySelectorAll(".quiz .qq").length;out.rcp=document.querySelectorAll("#rcp details").length;
  out.editors=document.querySelectorAll('script[type="text/x-java"]').length+"/"+document.querySelectorAll(".code").length;
  out.scroll=document.documentElement.scrollWidth-innerWidth;
  out.fam=document.querySelectorAll("#dpFam li").length;out.pick=!!document.querySelector("#dpPick");
  out.wide=[...document.querySelectorAll("body *")].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1&&r.width>0&&!e.closest(".tw,pre,.code,.CodeMirror,.dp-code,#portal,nav")}).slice(0,8).map(e=>e.tagName+"."+e.className);
  const pre=document.createElement("pre");pre.id="dpout";pre.textContent=JSON.stringify(out);document.body.appendChild(pre);
}catch(e){const p=document.createElement("pre");p.id="dpout";p.textContent=JSON.stringify({crash:String(e&&e.stack||e),errs:window.__errs,dpl:typeof DPL});document.body.appendChild(p);}})();
