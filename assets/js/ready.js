/* Interview readiness (2026-11-08, kb/site/site-internals.md → "Interview readiness"): one "ready %" per target role on the hub,
   built only from what this browser (or the synced account, auth.js → progress sync) already knows:
   js1-sum[course] = {total, und, qn, qa, qc, next, last} written by study.js on every course page, and js1-iday (interview-day
   mock rounds: by[course] = [points, questions]).
   Course score (0–1) = 45 % sections understood (und / total) + 40 % quiz (qc / qn: correct answers over ALL questions, so an
   unanswered quiz counts as 0) + 15 % mock (points / questions over the last 5 interview-day rounds that had this course; when
   there is no round yet the first two parts are scaled up to 100 %). Role score = the weighted mean over the role's courses.
   Public engine file (no lesson content). window.READY = {render(el), score(role), ROLES}; role choice in js1-ready-role. */
(function(){
"use strict";
const J=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}};
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const NAME={java:"Java",sql:"SQL",dsa:"DSA",spring:"Spring Boot",patterns:"Design Patterns",lld:"Low-Level Design",api:"REST API",
  sysdesign:"System Design",docker:"Docker & K8s",cicd:"CI/CD",os:"Operating Systems",networks:"Networks",dbms:"DBMS",
  behavioural:"Behavioural",redis:"Redis",kafka:"Kafka",nginx:"NGINX",python:"Python"};
/* weights add up to 100 per role; picked from what each round of that hiring loop tests (not from any company's data) */
const ROLES={
  backend:{n:"Java backend (fresher)",d:"Service and product companies hiring Java freshers: core Java, SQL, coding, a little Spring and the HR round.",
    w:{java:30,sql:15,dsa:20,spring:15,api:5,dbms:5,behavioural:10}},
  spring:{n:"Spring Boot developer",d:"1–3 years, Spring roles: Spring in depth, REST, data, containers and pipelines, a design discussion.",
    w:{spring:30,java:20,sql:10,api:10,docker:8,cicd:5,sysdesign:7,behavioural:10}},
  sde1:{n:"SDE-1 (product company)",d:"MAANG-style loop: coding rounds dominate, then LLD / machine coding, CS fundamentals, light system design.",
    w:{dsa:35,java:10,lld:10,patterns:5,sysdesign:10,os:7,networks:6,dbms:7,behavioural:10}}
};
function parts(c,sum,iday){
  const x=sum[c]||{},cov=x.total?Math.min(1,x.und/x.total):0,quiz=x.qn?Math.min(1,x.qc/x.qn):0;
  const rounds=iday.filter(r=>r&&r.by&&Array.isArray(r.by[c])&&r.by[c][1]).slice(-5);
  const pts=rounds.reduce((a,r)=>a+r.by[c][0],0),n=rounds.reduce((a,r)=>a+r.by[c][1],0),mock=n?pts/n:null;
  const s=mock==null?(.45*cov+.40*quiz)/.85:.45*cov+.40*quiz+.15*mock;
  return {c,cov,quiz,mock,s:Math.max(0,Math.min(1,s)),started:!!sum[c],x};
}
function score(role){
  const R=ROLES[role]||ROLES.backend,sum=J("js1-sum",{}),iday=J("js1-iday",[]);
  const L=Object.keys(R.w).map(c=>Object.assign(parts(c,sum,Array.isArray(iday)?iday:[]),{w:R.w[c]}));
  const tot=L.reduce((a,p)=>a+p.w,0),pct=Math.round(100*L.reduce((a,p)=>a+p.w*p.s,0)/tot);
  /* next best step: the course where the role loses the most points */
  const gap=L.slice().sort((a,b)=>b.w*(1-b.s)-a.w*(1-a.s))[0];
  return {role:R,list:L,pct,gap};
}
const band=p=>p>=75?["Interview-ready","rd-g2"]:p>=50?["Getting close","rd-g1"]:p>=20?["Building up","rd-g0"]:["Just started","rd-gx"];
const link=p=>{const x=p.x||{},f=(x.next&&x.next.f)||(x.last&&x.last.f)||("courses/"+p.c+"/index.html");return /^courses\//.test(f)?f:"courses/"+p.c+"/"+f;};
function css(){if(document.getElementById("rdCss"))return;const s=document.createElement("style");s.id="rdCss";s.textContent=`
.rd{--rd-a:var(--accent,#6366f1);display:grid;gap:16px}
.rd-tabs{display:flex;flex-wrap:wrap;gap:8px}
.rd-tab{font:600 .85rem/1 Inter,system-ui,sans-serif;padding:9px 14px;border-radius:99px;border:1px solid var(--line,rgba(127,127,127,.3));background:transparent;color:inherit;cursor:pointer}
.rd-tab[aria-selected="true"]{background:var(--rd-a);border-color:var(--rd-a);color:#fff}
.rd-tab:focus-visible{outline:2px solid var(--rd-a);outline-offset:2px}
.rd-top{display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:center}
.rd-ring{width:132px;height:132px;position:relative}
.rd-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.rd-ring circle{fill:none;stroke-width:11}
.rd-ring .bg{stroke:var(--line,rgba(127,127,127,.22))}
.rd-ring .fg{stroke:url(#rdGrad);stroke-linecap:round;transition:stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1)}
.rd-ring b{position:absolute;inset:0;display:grid;place-items:center;font:800 2rem/1 "Inter Tight",Inter,sans-serif}
.rd-ring b small{display:block;font:600 .7rem/1.2 Inter,sans-serif;opacity:.7;text-align:center}
.rd-lbl{display:inline-block;font:700 .75rem/1 Inter,sans-serif;letter-spacing:.04em;text-transform:uppercase;padding:6px 10px;border-radius:99px;margin-bottom:8px}
.rd-g2{background:rgba(16,185,129,.16);color:#059669}.rd-g1{background:rgba(245,158,11,.16);color:#b45309}
.rd-g0{background:rgba(99,102,241,.14);color:#4f46e5}.rd-gx{background:rgba(127,127,127,.15)}
.rd-top p{margin:4px 0;opacity:.85;font-size:.92rem}
.rd-next{display:inline-flex;gap:6px;align-items:center;margin-top:8px;font-weight:700;color:var(--rd-a);text-decoration:none}
.rd-next:hover{text-decoration:underline}
.rd-list{display:grid;gap:10px}
.rd-row{display:grid;grid-template-columns:minmax(110px,170px) 1fr 52px;gap:12px;align-items:center;font-size:.9rem;text-decoration:none;color:inherit;border-radius:10px;padding:4px 6px}
.rd-row:hover,.rd-row:focus-visible{background:rgba(127,127,127,.08)}
.rd-row span small{display:block;opacity:.65;font-size:.75rem}
.rd-bar{height:10px;border-radius:99px;background:var(--line,rgba(127,127,127,.2));overflow:hidden;display:flex}
.rd-bar i{display:block;height:100%;transform-origin:left;transition:transform .8s cubic-bezier(.2,.8,.2,1)}
.rd-bar .c{background:#6366f1}.rd-bar .q{background:#10b981}.rd-bar .m{background:#f59e0b}
.rd-row b{text-align:right;font-variant-numeric:tabular-nums}
.rd-key{display:flex;flex-wrap:wrap;gap:14px;font-size:.78rem;opacity:.8}
.rd-key i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.rd-note{font-size:.78rem;opacity:.7;margin:0}
@media (max-width:560px){.rd-top{grid-template-columns:1fr;justify-items:center;text-align:center}.rd-row{grid-template-columns:96px 1fr 44px;gap:8px}}
@media (prefers-reduced-motion:reduce){.rd-ring .fg,.rd-bar i{transition:none}}
`;document.head.appendChild(s);}
function render(el){
  if(!el)return;css();
  let role=J("js1-ready-role","backend");if(!ROLES[role])role="backend";
  const r=score(role),[lbl,cls]=band(r.pct),C=2*Math.PI*54;
  const rows=r.list.slice().sort((a,b)=>b.w-a.w).map(p=>{
    /* bar segments show each part's share of the course score */
    const m=p.mock==null,f=m?1/.85:1,seg=(v,wt,k)=>'<i class="'+k+'" style="width:'+(100*wt*f*v).toFixed(1)+'%"></i>';
    return '<a class="rd-row" href="'+esc(link(p))+'" title="'+esc(NAME[p.c]+": sections "+Math.round(100*p.cov)+"%, quiz "+Math.round(100*p.quiz)+"%"+(m?", no mock round yet":", mock "+Math.round(100*p.mock)+"%"))+'">'+
      "<span>"+esc(NAME[p.c]||p.c)+"<small>weight "+p.w+"%"+(p.started?"":" · not started")+"</small></span>"+
      '<span class="rd-bar" aria-hidden="true">'+seg(p.cov,.45,"c")+seg(p.quiz,.40,"q")+(m?"":seg(p.mock,.15,"m"))+"</span><b>"+Math.round(100*p.s)+"%</b></a>";}).join("");
  const g=r.gap,gn=NAME[g.c]||g.c;
  el.innerHTML='<div class="rd"><div class="rd-tabs" role="tablist" aria-label="Target role">'+
    Object.keys(ROLES).map(k=>'<button type="button" role="tab" class="rd-tab" data-role="'+k+'" aria-selected="'+(k===role)+'">'+esc(ROLES[k].n)+"</button>").join("")+"</div>"+
    '<div class="rd-top"><div class="rd-ring" role="img" aria-label="'+r.pct+'% ready for '+esc(r.role.n)+'"><svg viewBox="0 0 132 132" aria-hidden="true"><defs><linearGradient id="rdGrad" x1="0" x2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#10b981"/></linearGradient></defs>'+
      '<circle class="bg" cx="66" cy="66" r="54"/><circle class="fg" cx="66" cy="66" r="54" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+C.toFixed(1)+'"/></svg><b>'+r.pct+"%<small>ready</small></b></div>"+
      '<div><span class="rd-lbl '+cls+'">'+lbl+"</span><p>"+esc(r.role.d)+"</p>"+
      (r.pct<100?'<a class="rd-next" href="'+esc(link(g))+'">Biggest gain next: '+esc(gn)+" (+"+Math.round(g.w*(1-g.s))+" pts possible) →</a>":"")+"</div></div>"+
    '<div class="rd-list">'+rows+"</div>"+
    '<div class="rd-key"><span><i style="background:#6366f1"></i>sections understood (45%)</span><span><i style="background:#10b981"></i>quiz correct (40%)</span><span><i style="background:#f59e0b"></i>interview-day mock (15%)</span></div>'+
    '<p class="rd-note">Mark sections as understood, answer each lesson\'s quiz and run interview-day mock rounds to raise it. The weights are this site\'s estimate of what each loop tests, not a hiring guarantee.</p></div>';
  const fg=el.querySelector(".rd-ring .fg");requestAnimationFrame(()=>requestAnimationFrame(()=>{if(fg)fg.style.strokeDashoffset=(C*(1-r.pct/100)).toFixed(1);}));
  el.querySelector(".rd-tabs").onclick=e=>{const b=e.target.closest("[data-role]");if(!b)return;try{localStorage.setItem("js1-ready-role",JSON.stringify(b.dataset.role));}catch(x){}render(el);
    const t=el.querySelector('[data-role="'+b.dataset.role+'"]');if(t)t.focus();};
  el.querySelector(".rd-tabs").onkeydown=e=>{if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft")return;const ks=Object.keys(ROLES),i=ks.indexOf(role),n=ks[(i+(e.key==="ArrowRight"?1:ks.length-1))%ks.length];
    try{localStorage.setItem("js1-ready-role",JSON.stringify(n));}catch(x){}render(el);const t=el.querySelector('[data-role="'+n+'"]');if(t)t.focus();};
}
window.READY={render,score,ROLES};
})();
