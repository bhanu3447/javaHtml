// injected before </body>: exercises the phase-B widgets on a page and writes JSON into <pre id="dpout">
// checks: every .dp-pat header filled, Refactor add/del/meter, Playground controls change output, Predict reveal/try again,
// Explain it back stores a rating, map card count, filters and search
(function(){const out={errors:window.__errs||[],res:{},fails:[]};const F=m=>out.fails.push(m);try{
  document.querySelectorAll(".dp-pat[data-p]").forEach(h=>{if(!h.querySelector(".dp-gl"))F("header "+h.dataset.p+": no glyph");if(!h.querySelector(".dp-pat-i"))F("header "+h.dataset.p+": no intent");});
  out.res.headers=document.querySelectorAll(".dp-pat[data-p]").length;
  // Refactor labs: every step that declares add/del shows such lines; meter shown when declared
  Object.keys(DPL.BUILT).forEach(key=>{const B=DPL.BUILT[key];B.ctl.forEach((c,vi)=>{B.tab(vi);const v=DPL.LABS[key].views[vi];
    for(let si=0;si<c.n;si++){c.show(si);const s=v.steps[si],view=B.host.querySelector('.dp-view[data-v="'+vi+'"]');
      if((s.add||[]).length&&!view.querySelector(".dp-ln.add"))F(key+"/"+vi+"/"+(si+1)+" add lines not shown");
      if((s.del||[]).length&&!view.querySelector(".dp-ln.del"))F(key+"/"+vi+"/"+(si+1)+" del lines not shown");
      const m=view.querySelector("[data-meter]");if(s.meter&&(!m||m.hidden))F(key+"/"+vi+"/"+(si+1)+" meter hidden");
      if(v.seq){const vis=view.querySelectorAll(".dp-ed.dp-sq:not(.dp-hide)").length,want=s.upto==null?v.seq.msgs.length:s.upto;if(vis!==want)F(key+" seq step "+(si+1)+": "+vis+" msgs shown, want "+want);}
    }c.show(0);});B.tab(0);});
  // Playgrounds: change every select to every option, toggle every toggle, press every button; the output must change at least once
  out.res.plays={};
  Object.keys(DPL.PBUILT||{}).forEach(key=>{const P=DPL.PBUILT[key],o=()=>P.host.querySelector("[data-out]").textContent;const seen=new Set([o()]);let acts=0;
    P.host.querySelectorAll("select[data-c]").forEach(sel=>[...sel.options].forEach(op=>{sel.value=op.value;sel.dispatchEvent(new Event("change",{bubbles:true}));seen.add(o());acts++;}));
    P.host.querySelectorAll("input[type=checkbox][data-c]").forEach(cb=>{cb.click();seen.add(o());cb.click();acts++;});
    P.host.querySelectorAll("button[data-c]").forEach(b=>{b.click();seen.add(o());acts++;});
    if(seen.size<2)F("play "+key+": output never changes");
    const svg=P.host.querySelector("svg");if(!svg||!svg.querySelector(".dp-nd"))F("play "+key+": no diagram");
    out.res.plays[key]={actions:acts,outputs:seen.size};});
  // Predict
  const preds=[...document.querySelectorAll(".dp-pred")];out.res.predict=preds.length;
  preds.forEach((p,i)=>{const bs=p.querySelectorAll(".dp-po"),ex=p.querySelector(".dp-pe");if(!bs.length){F("predict "+i+": no option buttons");return;}
    bs[0].click();if(!p.classList.contains("done"))F("predict "+i+": not locked");if(ex&&ex.hidden)F("predict "+i+": explanation hidden");
    if(!p.querySelector(".dp-po.ok"))F("predict "+i+": right answer not marked");
    const r=p.querySelector(".dp-pred-r");if(r){r.click();if(p.classList.contains("done"))F("predict "+i+": try again failed");}});
  // Explain it back
  const xbs=[...document.querySelectorAll(".dp-xb")];out.res.explain=xbs.length;
  xbs.forEach(x=>{const k=x.dataset.k;x.querySelector("[data-x=show]").click();if(x.querySelector(".dp-xm").hidden)F("xb "+k+": model hidden");
    x.querySelector("[data-r=almost]").click();let st={};try{st=JSON.parse(localStorage.getItem("js1-dpxb"))||{};}catch(e){}if(!st[k]||st[k].r!=="almost")F("xb "+k+": rating not stored");});
  // map
  const mp=document.querySelector(".dp-map");if(mp){out.res.mapCards=mp.querySelectorAll(".dp-mc").length;if(out.res.mapCards!==23)F("map: "+out.res.mapCards+" cards");
    const host=mp.parentElement,q=host.querySelector("[data-f=q]");q.value="loan";q.dispatchEvent(new Event("input",{bubbles:true}));
    out.res.mapSearchLoan=host.querySelectorAll(".dp-mc:not(.off)").length;q.value="";q.dispatchEvent(new Event("input",{bubbles:true}));
    const f=host.querySelector("[data-f=f]");f.value="c";f.dispatchEvent(new Event("change",{bubbles:true}));out.res.mapCreational=host.querySelectorAll(".dp-mc:not(.off)").length;
    if(out.res.mapCreational!==5)F("map: creational filter shows "+out.res.mapCreational);f.value="";f.dispatchEvent(new Event("change",{bubbles:true}));}
  out.res.scroll=document.documentElement.scrollWidth-innerWidth;if(out.res.scroll>0)F("horizontal scroll "+out.res.scroll);
}catch(e){out.fails.push("EXCEPTION "+e.message+" "+e.stack);}
const pre=document.createElement("pre");pre.id="dpout";pre.textContent=JSON.stringify(out);document.body.appendChild(pre);})();
