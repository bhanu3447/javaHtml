// contrast of every lab text (SVG + HTML, outside code panels) in all nine themes, every step; dim/hidden nodes excluded (quieter by design)
(function(){try{
  const st=document.createElement("style");st.textContent="*,*::before,*::after{transition:none!important;animation:none!important}";document.head.appendChild(st);
  const parse=s=>{let m=s.match(/rgba?\(([^)]+)\)/);if(m){const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return [p[0],p[1],p[2],p[3]==null?1:p[3]];}
    m=s.match(/color\(srgb ([^)]+)\)/);if(m){const p=m[1].split(/[ \/]+/).filter(Boolean).map(Number);return [p[0]*255,p[1]*255,p[2]*255,p[3]==null?1:p[3]];}return null;};
  const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]);};
  const over=(top,bot)=>{const a=top[3];return [top[0]*a+bot[0]*(1-a),top[1]*a+bot[1]*(1-a),top[2]*a+bot[2]*(1-a),1];};
  const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  function bgOf(el){let stack=[];for(let e=el;e;e=e.parentElement){const c=parse(getComputedStyle(e).backgroundColor);if(c&&c[3]>0){stack.push(c);if(c[3]>=1)break;}}
    let b=[255,255,255,1];for(let i=stack.length-1;i>=0;i--)b=over(stack[i],b);return b;}
  const THEMES=["light","dark","midnight","nord","dracula","forest","sunset","ocean","sepia"],fails={};let n=0;
  const add=(th,msg,r)=>{const k=th+" "+msg;if(!fails[k]||fails[k]>r)fails[k]=r;};
  THEMES.forEach(th=>{document.documentElement.dataset.theme=th;
    Object.keys(DPL.BUILT).forEach(key=>{const B=DPL.BUILT[key];B.ctl.forEach((c,vi)=>{B.tab(vi);for(let si=0;si<c.n;si++){c.show(si);
      const view=B.host.querySelector('.dp-view[data-v="'+vi+'"]');const stage=bgOf(view.querySelector(".dp-stage"));
      view.querySelectorAll(".dp-nd:not(.dim):not(.dp-hide)").forEach(nd=>{let rb=parse(getComputedStyle(nd.querySelector("rect")).fill)||[255,255,255,1];rb=over(rb,stage);
        nd.querySelectorAll("text").forEach(t=>{if(!t.textContent)return;n++;const f=parse(getComputedStyle(t).fill);const r=ratio(over(f,rb),rb);
          const big=parseFloat(getComputedStyle(t).fontSize)>=14&&+getComputedStyle(t).fontWeight>=700;if(r<(big?3:4.5))add(th,key+" "+nd.dataset.n+" '"+t.textContent+"' "+(nd.className.baseVal),Math.round(r*100)/100);});});
      view.querySelectorAll(".dp-ed:not(.dim):not(.dp-hide) .dp-el").forEach(t=>{n++;const r=ratio(parse(getComputedStyle(t).fill),stage);if(r<4.5)add(th,key+" edge label '"+t.textContent+"'",Math.round(r*100)/100);});
      view.querySelectorAll(".dp-now b,.dp-now span,.dp-d,.dp-note,.dp-leg span,.dp-pos").forEach(e=>{if(!e.textContent.trim())return;n++;const r=ratio(over(parse(getComputedStyle(e).color),bgOf(e)),bgOf(e));if(r<4.5)add(th,key+" html "+e.className,Math.round(r*100)/100);});
    }});B.tab(0);});
    document.querySelectorAll(".dp-head .dp-pill,.dp-tabs button,.dp-chips button,.dp-fcol h4,.dp-fcol h4 small,.dp-fcol li:not(.off) b,.dp-fcol li:not(.off) span,.dp-fcol li:not(.off) i,.dp-ba,.dp-anat b,.dp-anat span,.dp-chip,.dp-pat-i,.dp-pat-i b,.dp-pat-r,.dp-lv,.dp-po,.dp-pred-f,.dp-pe,.dp-xm,.dp-xb label,.dp-rev b,.dp-rev span,.dp-play-tag,.dp-psel span,.dp-tog,.dp-mcol h4 span,.dp-mcol h4 small,.dp-mc:not(.off) .dp-mc-n,.dp-mc:not(.off) .dp-mc-m,.dp-mc:not(.off) .dp-mc-s,.dp-mapf label span,.dp-meter span,.dp-meter em,.dp-pk-m,.dp-pk-l").forEach(e=>{n++;const bg=bgOf(e);const r=ratio(over(parse(getComputedStyle(e).color),bg),bg);if(r<4.5)add(th,"page "+e.className+" '"+e.textContent.slice(0,20)+"'",Math.round(r*100)/100);});
  });
  const p=document.createElement("pre");p.id="dpout";p.textContent=JSON.stringify({checked:n,fails});document.body.appendChild(p);
}catch(e){const p=document.createElement("pre");p.id="dpout";p.textContent=JSON.stringify({crash:String(e.stack||e)});document.body.appendChild(p);}})();
