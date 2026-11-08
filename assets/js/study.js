/* Study tools (2026-11-04, kb/site/site-internals.md → "Study tools"). Public engine file, self-contained (own helpers and CSS),
   so the hub can load it too. course.js loads it on every course page after the page has been built.
   - Review today: spaced repetition (Leitner boxes, 1 · 3 · 7 · 21 · 60 days) over every course: quiz questions answered wrong,
     recall prompts of the lessons you started (Day 1 / 3 / 7), "Explain it back" answers you were unsure of, and the sections you
     marked as understood (their 1 · 3 · 7-day schedule in js1-done, shared with the section footers).
     A card keeps its own copy of the question, so it can be reviewed from any course.
   - Mock interview: this course's interview cards (COURSE.qa), round size, timer, Space = reveal, 1 2 3 = nailed / shaky / missed.
   - Progress: every course from the summaries written here (js1-sum), streak (js1-days), due reviews, weak quizzes.
   - Explain it back: a text box under each section that has a 30-second summary (.tldr), compared with that summary.
   - Cheat sheet: print only the headings, summaries, takeaways, tables and example cards (body.cheat).
   - Accessibility: figures get role="img" + a label, lab outputs announce their changes (aria-live).
   API: STUDY.open("review"|"mock"|"progress"), STUDY.due(), STUDY.dash(el), STUDY.cheat().
   Storage (try/catch, all js1-*): js1-srs {id:{b,due,c,k,…card}}, js1-sum {course:{…}}, js1-days [dates], js1-xb {secId:text},
   js1-mock {k:{r,t}}, js1-mock-cfg; reads js1-qz-<quiz>, js1-done, js1-course. */
(function(){
"use strict";
if(window.STUDY)return;
const st={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const J=(k,d)=>{try{const v=JSON.parse(st.get(k)||"null");return v==null?d:v}catch(e){return d}};
const put=(k,v)=>st.set(k,JSON.stringify(v));
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const q1=(s,r)=>(r||document).querySelector(s),qa=(s,r)=>Array.prototype.slice.call((r||document).querySelectorAll(s));
const DAY=864e5,INT=[1,3,7,21,60],GAP=[1,2,4],AGAIN=10*60*1000,CAP=30;
const PRE={l:"java",f:"spring",s:"sql",p:"patterns",n:"n8n",d:"dsa",r:"redis",k:"kafka",g:"nginx",h:"sysdesign",b:"behavioural",c:"docker",a:"api",v:"cicd",o:"os",w:"networks",q:"dbms",m:"lld"},CNAME={dbms:"DBMS",java:"Java",sql:"SQL",patterns:"Design Patterns",n8n:"n8n",dsa:"DSA",redis:"Redis",kafka:"Kafka",nginx:"NGINX",sysdesign:"System Design",behavioural:"Behavioural",lld:"Low-Level Design",docker:"Docker",api:"REST API",cicd:"CI/CD",os:"Operating Systems",networks:"Computer Networks",spring:"Spring Boot"};
const RCD={d1:["Day 1 · define",0],d3:["Day 3 · explain why",2],d7:["Day 7 · apply",6]};
const courseOf=k=>PRE[String(k)[0]]||"";
const tag=k=>(CNAME[courseOf(k)]||"")+" · "+String(k).toUpperCase();
const day=t=>{const d=new Date(t);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
const reduced=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;

/* what this page has (course pages: the globals of course-index.js, quiz-data.js and course.js; the hub: none) */
const G=n=>{try{return Function("return typeof "+n+'!=="undefined"?'+n+":undefined")();}catch(e){return undefined;}};
const QZ=G("QZ")||{},RC=G("RC")||{},COURSE=G("COURSE")||{pages:[],qa:[]},PAGE=G("PAGE")||"",CID=G("COURSE_ID")||"";
const ROOT=G("ROOT")||new URL(".",location.href).href;
const SECP={};(COURSE.pages||[]).forEach(p=>(p.sections||[]).forEach(s=>SECP[s.id]={p,s}));
const href=u=>/^(https?:|file:|#)/.test(u)?u:ROOT+u;

/* ---------- the review deck ---------- */
let srs=J("js1-srs",{});
const saveSrs=()=>put("js1-srs",srs);
/* every quiz question answered wrong becomes a card (box 0, due now); a lesson whose quiz you started brings its recall prompts */
function enrol(){
  const now=Date.now();let ch=false;
  for(const k in QZ){const ans=J("js1-qz-"+k,null);if(!ans||!Object.keys(ans).length)continue;
    (QZ[k]||[]).forEach((x,i)=>{const id="q:"+k+":"+i;if(ans[i]!=null&&ans[i]!==x.a&&!srs[id]){srs[id]={b:0,due:now,c:"q",k,q:x.q,o:x.o,a:x.a,e:x.e};ch=true;}});
    const r=RC[k];if(r)for(const d in RCD)(r[d]||[]).forEach((p,i)=>{const id="r:"+k+":"+d+":"+i;
      if(!srs[id]){srs[id]={b:0,due:now+RCD[d][1]*DAY,c:"r",k,d,q:p[0],a:p[1]};ch=true;}});}
  if(ch)saveSrs();}
/* sections marked as understood (course.js keeps {t,r,s} and, since 2026-11-04, n title, u link, k lesson) */
const done=()=>J("js1-done",{});
const secDue=p=>p.s>=3?Infinity:p.r+GAP[p.s]*DAY;
function backfill(){const d=done();let ch=false;
  for(const id in d){const x=SECP[id];if(x&&!d[id].n){d[id].n=x.s.n+" · "+x.s.t;d[id].u=x.p.file+"#"+id;d[id].k=x.p.key;ch=true;}}
  if(ch)put("js1-done",d);}
function deck(scope){
  const now=Date.now(),L=[],inScope=k=>scope!=="course"||courseOf(k)===CID;
  for(const id in srs){const c=srs[id];if(c.due<=now&&inScope(c.k))L.push(Object.assign({id},c));}
  const d=done();for(const id in d){const p=d[id];if(p.n&&p.s<3&&secDue(p)<=now&&inScope(p.k||"")&&(scope!=="course"||p.k))L.push({id,c:"s",k:p.k||"",n:p.n,u:p.u,due:secDue(p)});}
  return L.sort((a,b)=>a.due-b.due).slice(0,CAP);}
function due(){const now=Date.now();let n=0;srs=J("js1-srs",{});for(const id in srs)if(srs[id].due<=now)n++;
  const d=done();for(const id in d)if(d[id].n&&secDue(d[id])<=now)n++;return n;}
function grade(card,ok){const now=Date.now();
  if(card.c==="s"){const d=done(),p=d[card.id];if(p){if(ok)p.s++;else p.s=0;p.r=now;put("js1-done",d);}return;}
  const c=srs[card.id];if(!c)return;
  if(ok){c.b=Math.min(c.b+1,5);c.due=now+INT[c.b-1]*DAY;}else{c.b=0;c.due=now+AGAIN;}
  saveSrs();}

/* ---------- summaries for the hub ---------- */
function summarise(){
  if(!CID||!COURSE.pages||!COURSE.pages.length)return;
  /* lesson keys are a course letter + two digits (l01, r12, h05, n01b); 2026-11-05: was /^[lspnd]\d/, which left Redis (r), Kafka (k),
     NGINX (g) and System Design (h) at zero on the hub */
  const sum=J("js1-sum",{}),d=done(),lessons=COURSE.pages.filter(p=>/^[a-z]\d\d/.test(p.key));
  let total=0,und=0;lessons.forEach(p=>(p.sections||[]).forEach(s=>{total++;if(d[s.id])und++;}));
  let qn=0,qa_=0,qc=0;const weak=[];
  lessons.forEach(p=>{const list=QZ[p.key];if(!list)return;const ans=J("js1-qz-"+p.key,{});let a=0,c=0;
    list.forEach((x,i)=>{if(ans[i]!=null){a++;if(ans[i]===x.a)c++;}});qn+=list.length;qa_+=a;qc+=c;
    if(a>=3&&c/a<.6)weak.push({k:p.short||p.key,n:p.name,f:p.file,pct:Math.round(100*c/a)});});
  const me=COURSE.pages.find(p=>p.key===PAGE),prev=sum[CID]||{};
  /* next lesson = the first lesson after the one being read with a section not yet marked understood (else the one right after) */
  const at=lessons.findIndex(p=>p.key===PAGE),rest=at<0?[]:lessons.slice(at+1),
    nx=rest.find(p=>(p.sections||[]).some(s=>!d[s.id]))||rest[0];
  /* graded tasks solved in this course's labs (each kit keeps its own store of solved ids) */
  const TK={redis:"js1-redis-tasks",kafka:"js1-kafka-tasks",nginx:"js1-nginx-tasks",sysdesign:"js1-sd-tasks"}[CID],tasks=TK?Object.keys(J(TK,{})).length:0;
  sum[CID]={name:CNAME[CID]||CID,home:"courses/"+CID+"/index.html",total,und,qn,qa:qa_,qc,weak:weak.sort((a,b)=>a.pct-b.pct).slice(0,3),tasks,
    last:me&&me.key!=="home"?{f:me.file,n:me.name,t:Date.now()}:prev.last||null,
    next:at<0?prev.next||null:nx?{f:nx.file,n:nx.name}:null,t:Date.now()};
  put("js1-sum",sum);
  const days=J("js1-days",[]),t=day(Date.now());if(days[days.length-1]!==t){days.push(t);put("js1-days",days.slice(-400));}}
function streak(){const days=J("js1-days",[]);if(!days.length)return 0;const set=new Set(days);let n=0,t=Date.now();
  if(!set.has(day(t)))t-=DAY;while(set.has(day(t))){n++;t-=DAY;}return n;}

/* ---------- styles (tokens of course.css and the hub; fallbacks for anything else) ---------- */
const css=`
.sd-dlg{width:min(720px,calc(100vw - 24px));max-height:calc(100vh - 48px);margin:24px auto auto;padding:0;border:1px solid var(--line,#e3e7ef);border-radius:18px;background:var(--surface,#fff);color:var(--text,#0f172a);box-shadow:0 24px 70px rgba(15,23,42,.28)}
.sd-dlg[open]{display:flex;flex-direction:column}.sd-dlg::backdrop{background:rgba(10,12,24,.5);backdrop-filter:blur(3px)}
.sd-h{display:flex;align-items:center;gap:6px;padding:10px 12px;border-bottom:1px solid var(--line,#e3e7ef);flex-wrap:wrap}
.sd-tabs{display:flex;gap:4px;flex:1;flex-wrap:wrap}.sd-tabs button,.sd-x{font:600 .88rem Inter,system-ui,sans-serif;border:1px solid transparent;background:none;color:var(--muted,#5b6474);padding:8px 12px;border-radius:10px;cursor:pointer;min-height:40px}
.sd-tabs button[aria-selected="true"]{background:var(--accent-soft,#eef0ff);color:var(--accent,#4f46e5);border-color:color-mix(in srgb,var(--accent,#4f46e5) 30%,transparent)}
.sd-tabs button:focus-visible,.sd-x:focus-visible,.sd-b:focus-visible,.sd-opt:focus-visible{outline:2px solid var(--accent,#4f46e5);outline-offset:2px}
.sd-n{display:inline-block;min-width:1.5em;padding:0 .4em;margin-left:4px;border-radius:99px;background:var(--accent,#4f46e5);color:#fff;font-size:.75rem;line-height:1.5em;text-align:center}
.sd-body{padding:16px 18px 20px;overflow:auto}
.sd-b{font:600 .9rem Inter,system-ui,sans-serif;padding:9px 14px;min-height:42px;border-radius:10px;border:1px solid var(--line,#e3e7ef);background:var(--surface,#fff);color:var(--text,#0f172a);cursor:pointer}
.sd-b.pri{background:var(--accent-fill,#4f46e5);border-color:var(--accent-fill,#4f46e5);color:#fff}.sd-b.ok{border-color:var(--good,#047857);color:var(--good,#047857)}.sd-b.no{border-color:var(--bad,#c81e1e);color:var(--bad,#c81e1e)}
.sd-b:disabled{opacity:.5;cursor:default}
.sd-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:12px 0 0}
.sd-row>b{font:700 .7rem "JetBrains Mono",monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#5b6474);min-width:64px}
.sd-chip{font:600 .82rem Inter,system-ui,sans-serif;padding:6px 11px;min-height:36px;border-radius:99px;border:1px solid var(--line,#e3e7ef);background:none;color:var(--text,#0f172a);cursor:pointer}
.sd-chip[aria-pressed="true"]{background:var(--accent-soft,#eef0ff);border-color:var(--accent,#4f46e5);color:var(--accent,#4f46e5)}
.sd-stats{display:flex;flex-wrap:wrap;gap:8px}.sd-stats span{flex:1 1 110px;padding:10px 12px;border:1px solid var(--line,#e3e7ef);border-radius:12px;font-size:.82rem;color:var(--muted,#5b6474)}
.sd-stats b{display:block;font:800 1.35rem "Inter Tight",Inter,sans-serif;color:var(--text,#0f172a)}
.sd-card{border:1px solid var(--line,#e3e7ef);border-radius:14px;padding:14px 16px;background:var(--bg,#f7f8fb)}
.sd-top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font:600 .74rem "JetBrains Mono",monospace;color:var(--muted,#5b6474);margin-bottom:8px}
.sd-q{font-size:1rem;line-height:1.55}.sd-q pre,.sd-a pre{overflow-x:auto;max-width:100%;padding:10px 12px;border-radius:10px;background:var(--code-bg,#0f1320);color:var(--code-text,#e6e9f0);font-size:.82rem}
.sd-q code,.sd-a code{font-family:"JetBrains Mono",monospace;font-size:.9em}
.sd-opts{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;margin-top:12px}
.sd-opt{display:flex;gap:10px;align-items:flex-start;text-align:left;font:500 .92rem Inter,system-ui,sans-serif;padding:10px 12px;min-height:44px;border-radius:10px;border:1px solid var(--line,#e3e7ef);background:var(--surface,#fff);color:var(--text,#0f172a);cursor:pointer}
.sd-opt>i{font:700 .78rem "JetBrains Mono",monospace;font-style:normal;color:var(--muted,#5b6474)}.sd-opt.ok{border-color:var(--good,#047857);background:color-mix(in srgb,var(--good,#047857) 10%,transparent)}
.sd-opt.no{border-color:var(--bad,#c81e1e);background:color-mix(in srgb,var(--bad,#c81e1e) 10%,transparent)}
.sd-a{margin-top:12px;padding:12px 14px;border-left:3px solid var(--accent,#4f46e5);background:var(--surface,#fff);border-radius:0 10px 10px 0;line-height:1.55}
.sd-a.okk{border-color:var(--good,#047857)}.sd-a.nok{border-color:var(--bad,#c81e1e)}
.sd-bar{height:6px;border-radius:99px;background:var(--line,#e3e7ef);overflow:hidden;margin:4px 0 12px}.sd-bar i{display:block;height:100%;background:var(--accent,#4f46e5);transform-origin:left}
.sd-empty{padding:18px;text-align:center;color:var(--muted,#5b6474);border:1px dashed var(--line,#e3e7ef);border-radius:14px}
.sd-list{display:grid;gap:8px;margin-top:12px}.sd-list a{display:block;padding:10px 12px;border:1px solid var(--line,#e3e7ef);border-radius:10px;color:var(--text,#0f172a);text-decoration:none}
.sd-list a small{display:block;color:var(--muted,#5b6474);font-size:.76rem}
.sd-tm{display:flex;align-items:center;gap:10px;margin-top:10px;font:600 .8rem "JetBrains Mono",monospace;color:var(--muted,#5b6474)}.sd-tm .sd-bar{flex:1;margin:0}.sd-tm.low{color:var(--bad,#c81e1e)}
.sd-dash{display:grid;gap:12px}.sd-cs{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr));gap:10px}
.sd-c{border:1px solid var(--line,#e3e7ef);border-radius:14px;padding:12px 14px;background:var(--surface,#fff)}.sd-c h4{margin:0 0 6px;font:700 .95rem Inter,system-ui,sans-serif}
.sd-c p{margin:4px 0 0;font-size:.8rem;color:var(--muted,#5b6474)}.sd-c a{color:var(--accent,#4f46e5);font-weight:600;text-decoration:none}
.sd-heat{display:grid;gap:6px}.sd-hg{display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,11px);grid-auto-columns:11px;gap:3px;max-width:100%;overflow:hidden}
.sd-hg i{border-radius:3px}.sd-h0{background:var(--line,#e3e7ef)}.sd-h1{background:var(--accent,#4f46e5)}.sd-hx{background:transparent}
.sd-badge{position:absolute;top:2px;right:2px;min-width:16px;height:16px;padding:0 4px;border-radius:99px;background:var(--bad-fill,#c81e1e);color:#fff;font:700 10px/16px Inter,sans-serif;text-align:center;pointer-events:none}
#studyBtn{position:relative}
.xb{margin:10px 0 0;padding:12px 14px;border:1px solid var(--line,#e3e7ef);border-radius:12px;background:var(--surface,#fff)}
.xb textarea{width:100%;min-height:96px;box-sizing:border-box;font:inherit;font-size:.92rem;padding:10px;border-radius:10px;border:1px solid var(--line,#e3e7ef);background:var(--bg,#f7f8fb);color:var(--text,#0f172a);resize:vertical}
.xb-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:10px;margin-top:10px}.xb-two>div{padding:10px 12px;border-radius:10px;border:1px solid var(--line,#e3e7ef);font-size:.9rem;line-height:1.5}
.xb-two b{display:block;font:700 .68rem "JetBrains Mono",monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--accent,#4f46e5);margin-bottom:4px}
.xb-msg{font-size:.85rem;color:var(--muted,#5b6474);margin:8px 0 0}
@media (max-width:520px){.sd-body{padding:12px 12px 16px}.sd-tabs button{padding:8px 9px}}
@media (prefers-reduced-motion:no-preference){.sd-dlg[open]{animation:sd-in .18s ease-out}@keyframes sd-in{from{opacity:0;transform:translateY(8px)}}}
@media print{body.cheat nav,body.cheat .band,body.cheat .secfoot,body.cheat footer,body.cheat #toc,body.cheat .quiz,body.cheat .xb,
  body.cheat .wrap>section>:not(h2):not(.num):not(.tldr):not(.takeaways):not(.tw):not(.exg):not(table){display:none!important}
  body.cheat .wrap>section{break-inside:avoid-page;margin:0 0 10px!important;padding:0!important}body.cheat .wrap>section>h2{font-size:14pt;margin:8px 0 4px}
  body.cheat header .lead,body.cheat header .cta,body.cheat header .hero-code{display:none!important}}
nav button.cs-open{width:auto;padding:0 10px 0 7px;gap:6px;display:flex;align-items:center;position:relative;color:color-mix(in srgb,#f59e0b 62%,var(--text,#111));font:600 .78rem Inter,system-ui,sans-serif;
  border:1px solid color-mix(in srgb,#f59e0b 45%,transparent);background:color-mix(in srgb,#fbbf24 14%,transparent);box-shadow:0 0 12px -2px rgba(245,158,11,.45)}
nav button.cs-open:hover{color:color-mix(in srgb,#f59e0b 45%,var(--text,#111));background:color-mix(in srgb,#fbbf24 26%,transparent);border-color:#f59e0b;box-shadow:0 0 18px 0 rgba(245,158,11,.6)}
.cs-bulb{display:grid;place-items:center}.cs-bulb svg{width:18px;height:18px;overflow:visible}.cs-rays{opacity:.35}
.cs-glass{fill:rgba(251,191,36,.25)}.cs-open:hover .cs-glass,.cs-lit .cs-glass{fill:#fbbf24}.cs-open:hover .cs-rays,.cs-lit .cs-rays{opacity:1}
@media (max-width:760px){nav button.cs-open{padding:0;width:34px;justify-content:center}.cs-lbl{display:none}}
.cs-pill{margin:14px 0 4px}
@media (prefers-reduced-motion:no-preference){.cs-rays,.cs-glass{transition:opacity .2s,fill .2s}
  .cs-open:hover .cs-bulb{animation:csWig .5s ease}.cs-lit .cs-bulb{animation:csFlash .7s ease}
  .cs-new::after{content:"";position:absolute;inset:-3px;border-radius:12px;border:2px solid #f59e0b;animation:csRing 2.2s ease-out infinite;pointer-events:none}
  .cs-new .cs-rays{animation:csRay 2.2s ease-in-out infinite}}
@keyframes csRing{0%{opacity:.8;transform:scale(1)}70%,100%{opacity:0;transform:scale(1.35)}}
@keyframes csRay{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes csWig{0%,100%{transform:rotate(0)}30%{transform:rotate(-14deg)}65%{transform:rotate(10deg)}}
@keyframes csFlash{0%{filter:none}35%{filter:drop-shadow(0 0 8px #fbbf24) brightness(1.5);transform:scale(1.25)}100%{filter:none;transform:scale(1)}}
.cs-st{font:600 .75rem Inter,system-ui,sans-serif;color:var(--muted,#5b6474);white-space:nowrap;cursor:help}.cs-st b{color:var(--text,#111)}.cs-st .cs-dn{color:#d97706}
.cs-pick{flex:none;padding:0 16px 10px;flex-wrap:wrap;gap:6px;max-height:88px;overflow:auto}.cs-pick[hidden]{display:none}
.cs-lh{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin:26px 0 10px;padding-top:14px;border-top:1px solid var(--line,#e3e7ef);font:800 1.05rem "Inter Tight",Inter,system-ui,sans-serif}
.cs-sec:first-child .cs-lh,.cs-sec[hidden]+.cs-sec .cs-lh{margin-top:0}.cs-lh a{font:600 .78rem Inter,system-ui,sans-serif;color:var(--accent,#4f46e5);text-decoration:none}
.cs-known{box-shadow:inset 0 -2px 0 rgba(16,185,129,.75)}.cs-miss{box-shadow:inset 0 -2px 0 rgba(239,68,68,.75)}.cs-due{box-shadow:inset 0 -2px 0 rgba(245,158,11,.9)}
.cs-rt{display:inline-flex;gap:4px;margin-left:6px;vertical-align:middle;white-space:nowrap}
.cs-rt button{width:28px;height:22px;padding:0;border-radius:7px;border:1px solid var(--line,#e3e7ef);background:var(--surface,#fff);cursor:pointer;font:700 .8rem/1 Inter,system-ui,sans-serif}
.cs-y{color:#059669}.cs-n{color:#dc2626}.cs-y:hover{background:rgba(16,185,129,.16)}.cs-n:hover{background:rgba(239,68,68,.16)}.cs-rt button:focus-visible{outline:2px solid var(--accent,#4f46e5);outline-offset:1px}
.sd-cs{display:block;margin-bottom:6px;font:700 .66rem "JetBrains Mono",monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--accent,#4f46e5)}
.sd-q pre{margin:8px 0 0;overflow-x:auto;padding:10px 12px;border-radius:10px;background:var(--code-bg,#0f1320);color:var(--code-text,#e6e9f0);font:.8rem/1.55 "JetBrains Mono",monospace;white-space:pre}
@media (max-width:620px){.cs-st{order:9;flex-basis:100%;padding:0 4px}}
.cs-dlg{width:min(1060px,calc(100vw - 24px));max-width:calc(100vw - 24px)}.cs-body{min-width:0}.cs-t{flex:1 1 220px;min-width:0;font:700 .95rem Inter,system-ui,sans-serif;padding:0 4px}
.cs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));grid-auto-flow:row dense;gap:12px}
.cs-card{min-width:0;border:1px solid var(--line,#e3e7ef);border-radius:14px;padding:12px 14px;background:var(--bg,#f7f8fb)}.cs-card.wide{grid-column:1/-1}
.cs-card h3{margin:0 0 8px;font:700 .7rem "JetBrains Mono",monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--accent,#4f46e5)}
.cs-card p{margin:0;font-size:.92rem;line-height:1.55}.cs-card ul{margin:0;padding-left:18px}.cs-card li{margin:5px 0;font-size:.88rem;line-height:1.5}
.cs-card code{font-family:"JetBrains Mono",monospace;font-size:.86em}
.cs-card pre{margin:6px 0 0;overflow-x:auto;padding:10px 12px;border-radius:10px;background:var(--code-bg,#0f1320);color:var(--code-text,#e6e9f0);font:.78rem/1.55 "JetBrains Mono",monospace}
.cs-card pre code{font-size:1em}.cs-card pre .cs-a{color:#7ee2a8}
.cs-tw{overflow-x:auto}.cs-card table{width:100%;border-collapse:collapse;font-size:.82rem;margin:0}
.cs-card th,.cs-card td{padding:6px 7px;border-bottom:1px solid var(--line,#e3e7ef);text-align:left;vertical-align:top}.cs-card th{font-weight:700;color:var(--muted,#5b6474)}
.cs-links{display:flex;flex-wrap:wrap;gap:6px}.cs-links a{font:600 .8rem Inter,system-ui,sans-serif;padding:5px 10px;border-radius:99px;border:1px solid var(--line,#e3e7ef);color:var(--accent,#4f46e5);text-decoration:none}
.cs-hide .cs-a:not(.on){filter:blur(5px);cursor:pointer;user-select:none}.cs-a:focus-visible{outline:2px solid var(--accent,#4f46e5);outline-offset:2px;border-radius:4px}
@media (prefers-reduced-motion:no-preference){.cs-a{transition:filter .15s}}
@media print{body.csprint>*:not(.cs-dlg){display:none!important}body.csprint .cs-dlg{position:static;display:block!important;width:auto;max-height:none;margin:0;border:0;box-shadow:none;animation:none}
  body.csprint .cs-dlg .sd-h button{display:none}body.csprint .cs-body{overflow:visible;padding:8px 0 0}body.csprint .cs-a{filter:none!important}
  body.csprint .cs-card{break-inside:avoid}body.csprint .cs-grid{grid-template-columns:1fr 1fr;gap:8px}body.csprint .cs-card.wide{grid-column:1/-1}
  body.csprint .cs-pick,body.csprint .cs-rt,body.csprint .cs-st,body.csprint .cs-sec[hidden],body.csprint .cs-lh a{display:none!important}
  body.csprint .cs-a{box-shadow:none!important}body.csprint .cs-card pre{white-space:pre-wrap;overflow:visible}body.csprint .cs-sec+.cs-sec{break-before:page}body.csprint .cs-lh{border:0;margin-top:0}}
/* company question bank (2026-11-08) */
.qt-badge{display:inline-flex;align-items:center;gap:3px;margin-left:8px;padding:2px 8px;border-radius:99px;font:700 .72rem Inter,system-ui,sans-serif;background:rgba(245,158,11,.16);color:#b45309;vertical-align:middle}
.qt-box{margin-top:12px;padding-top:10px;border-top:1px dashed var(--line,#e3e7ef);display:grid;gap:8px}
.qt-chips{display:flex;flex-wrap:wrap;gap:6px}.qt-chips:empty{display:none}
.qt-chip{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:99px;font:600 .78rem Inter,system-ui,sans-serif;border:1px solid var(--line,#e3e7ef);background:var(--bg2,rgba(127,127,127,.06))}
.qt-chip.mine{border-color:#f59e0b}.qt-x{border:0;background:none;color:inherit;cursor:pointer;font:700 1rem/1 Inter,sans-serif;padding:0 2px;min-width:24px;min-height:24px}
.qt-rep>summary{cursor:pointer;font:600 .82rem Inter,system-ui,sans-serif;color:var(--accent,#4f46e5);list-style:none}.qt-rep>summary::-webkit-details-marker{display:none}
.qt-f{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:end;margin-top:8px}.qt-f label{display:grid;gap:3px;font:600 .75rem Inter,system-ui,sans-serif;color:var(--muted,#5b6474)}
.qt-f input,.qt-f select{font:500 .9rem Inter,system-ui,sans-serif;padding:7px 10px;min-height:36px;border-radius:8px;border:1px solid var(--line,#e3e7ef);background:var(--bg,#fff);color:var(--text,#0f172a);min-width:0;max-width:100%}
.qt-msg{font-size:.8rem;color:var(--muted,#5b6474)}.qt-note{font-size:.75rem;color:var(--muted,#5b6474);margin:6px 0 0}
.sd-card .qt-chips{margin-top:8px}`;
function addCss(){if(q1("#sdCss"))return;const s=document.createElement("style");s.id="sdCss";s.textContent=css;document.head.appendChild(s);}

/* ---------- the panel ---------- */
let dlg=null,tab="review",scope=J("js1-srs-scope","all");
function panel(){
  if(dlg)return dlg;addCss();
  dlg=document.createElement("dialog");dlg.className="sd-dlg";dlg.setAttribute("aria-labelledby","sdTitle");
  dlg.innerHTML='<div class="sd-h"><span id="sdTitle" class="vh" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Study tools</span><div class="sd-tabs" role="tablist" aria-label="Study tools"></div><button type="button" class="sd-x" aria-label="Close">✕</button></div><div class="sd-body" role="tabpanel" tabindex="-1"></div>';
  document.body.appendChild(dlg);
  q1(".sd-x",dlg).onclick=()=>dlg.close();
  dlg.addEventListener("click",e=>{if(e.target===dlg)dlg.close();});
  dlg.addEventListener("close",()=>{mockStop();badge();});
  q1(".sd-tabs",dlg).addEventListener("click",e=>{const b=e.target.closest("button");if(b)show(b.dataset.t);});
  q1(".sd-tabs",dlg).addEventListener("keydown",e=>{const bs=qa("button",e.currentTarget),i=bs.indexOf(document.activeElement);
    if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();const n=bs[(i+(e.key==="ArrowRight"?1:-1)+bs.length)%bs.length];n.focus();show(n.dataset.t);}});
  dlg.addEventListener("keydown",mockKeys);
  return dlg;}
function tabs(){const n=due(),T=[["review","Review today"+(n?'<span class="sd-n">'+n+"</span>":"")],["mock","Mock interview"],["progress","Progress"]];
  q1(".sd-tabs",dlg).innerHTML=T.filter(([t])=>t!=="mock"||(COURSE.qa||[]).length).map(([t,h])=>'<button type="button" role="tab" data-t="'+t+'" aria-selected="'+(t===tab)+'" tabindex="'+(t===tab?0:-1)+'">'+h+"</button>").join("");}
function body(){return q1(".sd-body",dlg);}
function show(t){tab=t;mockStop();tabs();({review:review,mock:mock,progress:progress})[t]();}
function open(t){panel();enrol();ldEnrol().then(n=>{if(n&&dlg&&dlg.open&&tab==="review"&&!cards.length)review();}).catch(()=>{});if(!dlg.open)dlg.showModal();show(t||"review");const b=q1('.sd-tabs [aria-selected="true"]',dlg);if(b)b.focus();}

/* Review today */
let cards=[],ci=0,again=new Set(),tally={ok:0,no:0};
function review(){
  backfill();
  const all=deck("all"),mine=CID?deck("course"):all;
  const list=scope==="course"&&CID?mine:all;
  if(list.some(c=>c.c==="ld"))ldFresh(list);
  body().innerHTML='<div class="sd-stats"><span><b>'+all.length+(all.length>=CAP?"+":"")+"</b>due now</span><span><b>"+Object.keys(srs).length+"</b>cards in your deck</span><span><b>"+streak()+"</b>day streak</span></div>"+
    (CID?'<div class="sd-row" role="group" aria-label="Which courses"><b>From</b><button type="button" class="sd-chip" data-sc="all" aria-pressed="'+(scope!=="course")+'">All courses</button><button type="button" class="sd-chip" data-sc="course" aria-pressed="'+(scope==="course")+'">'+esc(CNAME[CID]||CID)+" only</button></div>":"")+
    '<div class="sd-row">'+(list.length?'<button type="button" class="sd-b pri" data-go="1">Start · '+list.length+(list.length===1?" card":" cards")+"</button>":"")+"</div>"+
    (list.length?'<p class="xb-msg">Wrong quiz answers, recall prompts of the lessons you started, sections you marked as understood, cheat sheet answers you rated ✓ / ✗, LLD case studies you finished and "Explain it back" answers come back after 1, 3, 7, 21 and 60 days. A miss starts the card again.</p>':
      '<div class="sd-empty" style="margin-top:12px">Nothing is due. Answer a lesson quiz, mark sections as understood, rate cheat sheet answers or use "Explain it back", and the cards come back here on the right day.</div>');
  body().onclick=e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.sc){scope=b.dataset.sc;put("js1-srs-scope",scope);review();return;}
    if(b.dataset.go){cards=list.slice();ci=0;again=new Set();tally={ok:0,no:0};card();}};}
function card(){
  if(ci>=cards.length){finishReview();return;}
  const c=cards[ci],top='<div class="sd-top"><span>Card '+(ci+1)+" / "+cards.length+" · "+esc(c.c==="q"?"Quiz":c.c==="r"?RCD[c.d][0]:c.c==="x"?"Explain it back":c.c==="cs"?"Cheat sheet":c.c==="sx"?"Stream drill":c.c==="ld"?"LLD case":c.c==="db"?"DSA re-solve":"Section review")+'</span><span>'+esc(c.k?tag(c.k):"")+"</span></div>"+
    '<div class="sd-bar" aria-hidden="true"><i style="transform:scaleX('+(ci/cards.length)+')"></i></div>';
  let h="";
  if(c.c==="q")h='<div class="sd-q">'+c.q+'</div><div class="sd-opts" role="group" aria-label="Options">'+c.o.map((o,j)=>'<button type="button" class="sd-opt" data-j="'+j+'"><i>'+"ABCDEF"[j]+"</i><span>"+o+"</span></button>").join("")+'</div><div class="sd-a" hidden aria-live="polite"></div><div class="sd-row" hidden><button type="button" class="sd-b pri" data-next="1">Next card</button></div>';
  else if(c.c==="s")h='<div class="sd-q">Recall what <b>'+esc(c.n)+"</b> teaches: say it in two or three sentences, then open it to check.</div>"+
    '<div class="sd-row"><a class="sd-b" href="'+esc(href(c.u||""))+'" target="_blank" rel="noopener">Open the section ↗</a></div><div class="sd-row"><button type="button" class="sd-b ok" data-g="1">✓ I remember it</button><button type="button" class="sd-b no" data-g="0">✗ Forgot · restart</button></div>';
  else h='<div class="sd-q">'+(c.c==="x"?"Explain <b>"+esc(c.n)+"</b> in your own words.":c.q)+'</div><div class="sd-a" hidden></div><div class="sd-row"><button type="button" class="sd-b pri" data-show="1">Show the answer</button></div>';
  body().innerHTML='<div class="sd-card">'+top+h+"</div>";
  body().onclick=e=>{const b=e.target.closest("button");if(!b)return;
    if(b.classList.contains("sd-opt")){const j=+b.dataset.j,ok=j===c.a;qa(".sd-opt",body()).forEach(x=>{x.disabled=true;const k=+x.dataset.j;x.classList.toggle("ok",k===c.a);x.classList.toggle("no",k===j&&!ok);});
      const a=q1(".sd-a",body());a.hidden=false;a.className="sd-a "+(ok?"okk":"nok");a.innerHTML="<b>"+(ok?"Correct.":"Not quite — the answer is "+"ABCDEF"[c.a]+".")+"</b> "+(c.e||"");
      rate(ok,false);const r=q1("[data-next]",body());r.parentElement.hidden=false;r.focus();return;}
    if(b.dataset.next){ci++;card();return;}
    if(b.dataset.show){const a=q1(".sd-a",body());a.hidden=false;a.innerHTML=(c.c==="x"?"<b>The summary.</b> ":"")+(c.a||c.m||"")+((c.c==="ld"||c.c==="db")&&c.u?'<p class="ldq-go"><a href="'+esc(href(c.u))+'" target="_blank" rel="noopener">'+(c.c==="db"?"Open the problem ↗":"Open the case study ↗")+'</a></p>':"");
      b.parentElement.innerHTML='<button type="button" class="sd-b ok" data-g="1">✓ Knew it</button><button type="button" class="sd-b no" data-g="0">✗ Not yet</button>';q1("[data-g]",body()).focus();return;}
    if(b.dataset.g!=null){rate(b.dataset.g==="1",true);}};
  const f=q1(".sd-opt,[data-show],[data-g]",body());if(f)f.focus();}
function rate(ok,next){const c=cards[ci];grade(c,ok);ok?tally.ok++:tally.no++;
  if(!ok&&c.c!=="s"&&!again.has(c.id)){again.add(c.id);cards.push(Object.assign({},c));}
  if(next){ci++;card();}}
function finishReview(){badge();
  body().innerHTML='<div class="sd-card" style="text-align:center"><div style="font:800 1.6rem \'Inter Tight\',Inter,sans-serif">'+tally.ok+" / "+(tally.ok+tally.no)+' remembered</div><p class="xb-msg">Cards you knew come back later each time; missed ones come back first. See you on the next due day.</p>'+
    '<div class="sd-row" style="justify-content:center"><button type="button" class="sd-b" data-back="1">Back</button></div></div>';
  body().onclick=e=>{if(e.target.closest("[data-back]"))review();};
  const fx=G("FX");if(!reduced()&&fx&&fx.shower&&tally.ok&&!tally.no)fx.shower();}

/* Mock interview (this course's interview cards; ported from the v1 #mockviz) */
let mk={deck:[],res:[],i:0,shown:false,active:false,timer:null,end:0};
const mhist=()=>J("js1-mock",{}),mcfg=()=>Object.assign({ls:[],weak:false,n:10,t:60,co:"",rd:""},J("js1-mock-cfg",{}));
function mockStop(){clearInterval(mk.timer);mk.timer=null;}
function mock(){
  mk.active=false;mockStop();
  const QS=COURSE.qa||[],h=mhist(),cfg=mcfg(),isWeak=q=>h[q.k]&&h[q.k].r>1,LSH=[...new Set(QS.map(q=>q.l))];
  /* company question bank: companies / rounds reported on this course's cards (loads once, then redraws this panel) */
  if(!QT){qtLoad().then(()=>{if(tab==="mock"&&!mk.active)mock();}).catch(()=>{});}
  const tagsOf=q=>(QT&&QT[q.k])||[],COS={};QS.forEach(q=>tagsOf(q).forEach(t=>{COS[t.co]=(COS[t.co]||0)+t.n;}));
  const coList=Object.keys(COS).sort((a,b)=>COS[b]-COS[a]).slice(0,10);
  const coOk=q=>(!cfg.co||tagsOf(q).some(t=>t.co===cfg.co))&&(!cfg.rd||tagsOf(q).some(t=>t.r===cfg.rd&&(!cfg.co||t.co===cfg.co)));
  const pool=QS.filter(q=>(!cfg.ls.length||cfg.ls.includes(q.l))&&(!cfg.weak||isWeak(q))&&coOk(q)),size=cfg.n?Math.min(pool.length,cfg.n):pool.length;
  const chip=(f,v,t)=>'<button type="button" class="sd-chip" data-'+f+'="'+v+'" aria-pressed="'+(cfg[f]===v)+'">'+t+"</button>";
  body().innerHTML='<div class="sd-stats"><span><b>'+QS.length+"</b>questions</span><span><b>"+QS.filter(q=>h[q.k]&&h[q.k].r===1).length+"</b>nailed</span><span><b>"+QS.filter(isWeak).length+"</b>weak</span></div>"+
    '<div class="sd-row" role="group" aria-label="Lessons"><b>Lessons</b>'+LSH.map(l=>'<button type="button" class="sd-chip" data-l="'+esc(l)+'" aria-pressed="'+cfg.ls.includes(l)+'">'+esc(l)+"</button>").join("")+
      '<button type="button" class="sd-chip" data-w="1" aria-pressed="'+cfg.weak+'">Weak only</button></div>'+
    (coList.length||cfg.co?'<div class="sd-row" role="group" aria-label="Asked at company"><b>Asked at</b><button type="button" class="sd-chip" data-co="" aria-pressed="'+!cfg.co+'">Any</button>'+
      coList.map(c=>'<button type="button" class="sd-chip" data-co="'+esc(c)+'" aria-pressed="'+(cfg.co===c)+'">🏢 '+esc(qtTitle(c))+" · "+COS[c]+"</button>").join("")+"</div>"+
      '<div class="sd-row" role="group" aria-label="Interview round"><b>Stage</b><button type="button" class="sd-chip" data-rd="" aria-pressed="'+!cfg.rd+'">Any</button>'+
      Object.keys(QROUND).map(r=>'<button type="button" class="sd-chip" data-rd="'+r+'" aria-pressed="'+(cfg.rd===r)+'">'+QROUND[r]+"</button>").join("")+"</div>"
      :'<p class="xb-msg">No company reports on this course yet. After revealing an answer, tap “Asked in a real interview?” to start the company question bank.</p>')+
    '<div class="sd-row" role="group" aria-label="Questions per round"><b>Round</b>'+[5,10,20,0].map(v=>chip("n",v,v?v+" questions":"All")).join("")+"</div>"+
    '<div class="sd-row" role="group" aria-label="Time per question"><b>Timer</b>'+[0,45,60,90,120].map(v=>chip("t",v,v?v+" s":"Off")).join("")+"</div>"+
    '<div class="sd-row"><button type="button" class="sd-b pri" data-start="1"'+(size?"":" disabled")+">Start round · "+size+(size===1?" question":" questions")+"</button></div>"+
    '<p class="xb-msg">No lesson selected means all lessons. Answer aloud as if to an interviewer, then rate yourself honestly. Keys: Space reveals, 1 · 2 · 3 rate, Esc ends the round.</p>';
  body().onclick=e=>{const b=e.target.closest("button");if(!b)return;const D=b.dataset,c=mcfg();
    if(D.start){mockStart(pool,cfg);return;}
    if(D.co!=null)c.co=D.co;else if(D.rd!=null)c.rd=D.rd;else
    if(D.l)c.ls=c.ls.includes(D.l)?c.ls.filter(x=>x!==D.l):c.ls.concat(D.l);else if(D.w)c.weak=!c.weak;else if(D.n!=null)c.n=+D.n;else if(D.t!=null)c.t=+D.t;else return;
    put("js1-mock-cfg",c);mock();};}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function mockStart(list,cfg,again_){mk.deck=shuffle(list.slice());if(cfg.n&&!again_)mk.deck=mk.deck.slice(0,cfg.n);mk.res=[];mk.i=0;mk.active=true;mk.cfg=cfg;mockShow();}
function secLink(id){const x=SECP[id];return x?href(x.p.file+"#"+id):"#"+id;}
function mockShow(){
  mk.shown=false;const q=mk.deck[mk.i],t=mk.cfg.t;
  body().innerHTML='<div class="sd-card"><div class="sd-top"><span>Question '+(mk.i+1)+" / "+mk.deck.length+" · "+esc(q.l)+'</span><a href="'+esc(secLink(q.sec))+'">'+esc(q.st)+"</a></div>"+
    '<div class="sd-q">'+q.q+'</div><div class="qt-chips">'+qtChips(q.k,false)+"</div>"+(t?'<div class="sd-tm"><span class="sd-bar"><i></i></span><span class="sd-s">'+t+" s</span></div>":"")+
    '<div class="sd-a" hidden></div><div class="sd-row"><button type="button" class="sd-b pri" data-rv="1">Reveal answer</button><button type="button" class="sd-b" data-end="1">End round</button></div></div>';
  body().onclick=e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.rv)mockReveal();else if(b.dataset.end)mockFinish();else if(b.dataset.r)mockRate(+b.dataset.r);};
  mockStop();if(t){mk.end=Date.now()+t*1000;mk.timer=setInterval(mockTick,250);mockTick();}
  q1("[data-rv]",body()).focus();}
function mockTick(){const tm=q1(".sd-tm",body());if(!tm){mockStop();return;}const left=Math.max(0,mk.end-Date.now()),f=left/(mk.cfg.t*1000);
  q1(".sd-bar i",tm).style.transform="scaleX("+f+")";q1(".sd-s",tm).textContent=left?Math.ceil(left/1000)+" s":"Time's up";tm.classList.toggle("low",left>0&&f<.25);
  if(!left){mockStop();mockReveal();}}
function mockReveal(){if(mk.shown||!mk.active)return;mk.shown=true;mockStop();
  const a=q1(".sd-a",body());a.hidden=false;a.innerHTML="<b>Model answer.</b> "+mk.deck[mk.i].a+qtForm(mk.deck[mk.i].k);
  const qb=q1(".qt-box",a);if(qb){q1(".qt-chips",qb).remove();qtWire(qb,k=>{const c=q1(".sd-card > .qt-chips",body());if(c)c.innerHTML=qtChips(k,false);});}
  const r=q1(".sd-row",body().lastElementChild);r.innerHTML='<button type="button" class="sd-b ok" data-r="1">✓ Nailed it</button><button type="button" class="sd-b" data-r="2">~ Shaky</button><button type="button" class="sd-b no" data-r="3">✗ Missed</button><button type="button" class="sd-b" data-end="1">End round</button>';
  q1("[data-r]",body()).focus();}
function mockRate(r){if(!mk.shown)return;const q=mk.deck[mk.i],h=mhist();mk.res[mk.i]=r;h[q.k]={r,t:Date.now()};put("js1-mock",h);if(++mk.i<mk.deck.length)mockShow();else mockFinish();}
function mockFinish(){mk.active=false;mockStop();const n=mk.res.filter(Boolean).length;if(!n){mock();return;}
  const c=[1,2,3].map(r=>mk.res.filter(x=>x===r).length),weak=mk.deck.map((q,j)=>({q,r:mk.res[j]})).filter(x=>x.r>1);
  body().innerHTML='<div class="sd-card"><div style="font:800 1.6rem \'Inter Tight\',Inter,sans-serif">'+c[0]+" / "+n+' nailed</div><div class="sd-stats" style="margin-top:10px"><span><b>'+c[0]+"</b>nailed</span><span><b>"+c[1]+"</b>shaky</span><span><b>"+c[2]+"</b>missed</span></div>"+
    (weak.length?'<div class="sd-list">'+weak.map(x=>'<a href="'+esc(secLink(x.q.sec))+'"><small>'+esc(x.q.l+" · "+x.q.st+" · "+(x.r===2?"shaky":"missed"))+"</small>"+x.q.q+"</a>").join("")+"</div>":'<p class="xb-msg">Every answer nailed. Try a longer round or the timer.</p>')+
    '<div class="sd-row">'+(weak.length?'<button type="button" class="sd-b pri" data-again="1">Drill these '+weak.length+" again</button>":"")+'<button type="button" class="sd-b" data-new="1">New round</button></div></div>';
  body().onclick=e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.again)mockStart(weak.map(x=>x.q),mk.cfg,true);else if(b.dataset.new)mock();};}
function mockKeys(e){if(tab!=="mock"||!mk.active||e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target;if(t&&t.closest&&t.closest("input,textarea,select"))return;
  if(e.key==="Escape"){e.preventDefault();mockFinish();}else if(!mk.shown&&e.key===" "){e.preventDefault();mockReveal();}else if(mk.shown&&/^[123]$/.test(e.key)){e.preventDefault();mockRate(+e.key);}}

/* Progress (also the hub dashboard) */
/* the last 12 weeks of study days (js1-days) as a calendar grid, Monday rows on top, today bottom-right (2026-11-05) */
function heat(){const set=new Set(J("js1-days",[])),now=new Date(),dow=(now.getDay()+6)%7,cells=[];let n=0;
  for(let w=11;w>=0;w--)for(let r=0;r<7;r++){const back=w*7+(dow-r);if(back<0){cells.push('<i class="sd-hx" aria-hidden="true"></i>');continue;}
    const t=day(now.getTime()-back*DAY),on=set.has(t);if(on)n++;cells.push('<i class="'+(on?"sd-h1":"sd-h0")+'" title="'+t+(on?": studied":"")+'"></i>');}
  return '<div class="sd-heat"><b style="font-size:.85rem">Study days · last 12 weeks · '+n+'</b><div class="sd-hg" role="img" aria-label="'+n+' study days in the last 12 weeks">'+cells.join("")+"</div></div>";}
function dashHtml(withLinks){
  const sum=J("js1-sum",{}),ids=Object.keys(sum).sort((a,b)=>(sum[b].t||0)-(sum[a].t||0)),n=due(),s=streak();
  if(!ids.length)return '<div class="sd-empty">Your progress shows here after you open a lesson: sections understood, quiz scores, the day streak and the reviews that are due.</div>';
  const last=ids.map(i=>sum[i].last&&Object.assign({c:i},sum[i].last)).filter(Boolean).sort((a,b)=>b.t-a.t)[0];
  const weak=[].concat(...ids.map(i=>(sum[i].weak||[]).map(w=>Object.assign({c:i},w)))).sort((a,b)=>a.pct-b.pct).slice(0,4);
  const reviewHref=last?href(last.f.split("#")[0])+"#study-review":"";
  return '<div class="sd-dash"><div class="sd-stats"><span><b>'+s+"</b>day streak</span><span><b>"+n+"</b>reviews due"+(n&&withLinks&&reviewHref?' · <a href="'+esc(reviewHref)+'">review now</a>':"")+"</span>"+
    "<span><b>"+ids.reduce((a,i)=>a+(sum[i].qa||0),0)+"</b>quiz answers</span>"+(last&&withLinks?'<span><b style="font-size:1rem">Continue</b><a href="'+esc(href(last.f))+'">'+esc(last.n)+" →</a></span>":"")+"</div>"+
    '<div class="sd-cs">'+ids.map(i=>{const x=sum[i],sp=x.total?Math.round(100*x.und/x.total):0,qp=x.qa?Math.round(100*x.qc/x.qa):0,qd=x.qn?Math.round(100*x.qa/x.qn):0;
      return '<div class="sd-c"><h4>'+esc(x.name)+"</h4>"+(x.total&&x.und?'<p>Sections understood · <b>'+x.und+" / "+x.total+'</b></p><div class="sd-bar" aria-hidden="true"><i style="transform:scaleX('+sp/100+')"></i></div>':"")+
        '<p>Quiz questions answered · <b>'+(x.qa||0)+" / "+(x.qn||0)+"</b> ("+qd+'%)</p><div class="sd-bar" aria-hidden="true"><i style="transform:scaleX('+qd/100+')"></i></div>'+
        (x.qa?"<p>Quiz accuracy · <b>"+qp+"%</b></p>":"")+(x.tasks?"<p>Graded tasks solved · <b>"+x.tasks+"</b></p>":"")+
        (withLinks?'<p><a href="'+esc(href(x.last?x.last.f:x.home))+'">'+(x.last?"Continue: "+esc(x.last.n):"Open the course")+" →</a></p>"+
          (x.next&&(!x.last||x.next.f!==x.last.f)?'<p><a href="'+esc(href(x.next.f))+'">Next: '+esc(x.next.n)+" →</a></p>":""):"")+"</div>";}).join("")+"</div>"+
    heat()+
    (weak.length?'<div><b style="font-size:.85rem">Weakest quizzes</b><div class="sd-list">'+weak.map(w=>'<a href="'+esc(href(w.f))+'"><small>'+esc(CNAME[w.c]||w.c)+" · "+w.pct+"% correct</small>"+esc(w.n)+"</a>").join("")+"</div></div>":"")+"</div>";}
function progress(){body().innerHTML=dashHtml(true);body().onclick=null;}
function dash(el){if(!el)return;addCss();el.innerHTML=dashHtml(true);el.hidden=false;}

/* ---------- Explain it back: under each section that has a 30-second summary ---------- */
function explain(){
  const saved=J("js1-xb",{});
  qa(".secfoot").forEach(f=>{const sec=f.closest("section"),tl=sec&&q1(".tldr",sec);if(!tl||q1(".sf-xb",f))return;
    const b=document.createElement("button");b.type="button";b.className="sf-xb";b.setAttribute("aria-expanded","false");b.textContent="✎ Explain it back";
    const note=q1(".sf-note",f);f.insertBefore(b,note||null);
    b.onclick=()=>{let box=f.nextElementSibling&&f.nextElementSibling.classList.contains("xb")?f.nextElementSibling:null;
      if(box){box.remove();b.setAttribute("aria-expanded","false");return;}
      box=document.createElement("div");box.className="xb";const id=sec.id,h2=q1("h2",sec),title=(h2?h2.textContent:id).trim();
      box.innerHTML='<label for="xb-'+id+'"><b>Explain it back.</b> Without scrolling up: what does this section teach, and why does it matter? Then compare.</label>'+
        '<textarea id="xb-'+id+'" placeholder="In my own words…"></textarea><div class="sd-row"><button type="button" class="sd-b pri" data-cmp="1">Compare with the summary</button></div><div class="xb-out" aria-live="polite"></div>';
      f.after(box);b.setAttribute("aria-expanded","true");const ta=q1("textarea",box);ta.value=J("js1-xb",{})[id]||"";ta.focus();
      ta.oninput=()=>{const s=J("js1-xb",{});s[id]=ta.value;put("js1-xb",s);};
      box.onclick=e=>{const k=e.target.closest("button");if(!k)return;
        if(k.dataset.cmp){if(!ta.value.trim()){q1(".xb-out",box).innerHTML='<p class="xb-msg">Write a sentence or two first: putting it in your own words is what makes it stick.</p>';return;}
          q1(".xb-out",box).innerHTML='<div class="xb-two"><div><b>You wrote</b>'+esc(ta.value).replace(/\n/g,"<br>")+"</div><div><b>The summary</b>"+model(tl)+'</div></div><div class="sd-row"><span class="xb-msg" style="margin:0">Did you cover the main idea?</span><button type="button" class="sd-b ok" data-x="1">Yes</button><button type="button" class="sd-b no" data-x="0">Partly / no</button></div>';return;}
        if(k.dataset.x!=null){const sid="x:"+id,lk=(SECP[id]||{}).p;
          if(k.dataset.x==="0"){srs[sid]={b:0,due:Date.now()+DAY,c:"x",k:lk?lk.key:"",n:title,m:model(tl)};saveSrs();badge();
            q1(".xb-out",box).insertAdjacentHTML("beforeend",'<p class="xb-msg">Added to Review today: it comes back tomorrow.</p>');}
          else{if(srs[sid]){delete srs[sid];saveSrs();}q1(".xb-out",box).insertAdjacentHTML("beforeend",'<p class="xb-msg">Good. Mark the section as understood to get its 1 · 3 · 7-day reviews.</p>');}
          qa("[data-x]",box).forEach(x=>x.disabled=true);}};};
    if(saved[sec.id])b.textContent="✎ Explain it back · draft saved";});}
function model(tl){const m=tl.cloneNode(true),hd=m.querySelector("b");if(hd&&/30 seconds/i.test(hd.textContent))hd.remove();return m.innerHTML.trim().slice(0,4000);}

/* ---------- nav button with the number of due reviews ---------- */
function navBtn(){
  const cmd=q1("#cmdBtn");if(!cmd||q1("#studyBtn"))return;
  const b=document.createElement("button");b.type="button";b.id="studyBtn";b.className=cmd.className;
  b.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5V5a2 2 0 0 1 2-2h12v16H6.5a2.5 2.5 0 0 0 0 5H18"/><path d="M9 8h6M9 12h4"/></svg>';
  b.onclick=()=>open("review");cmd.before(b);badge();}
function badge(){const b=q1("#studyBtn");if(!b)return;const n=due();let s=q1(".sd-badge",b);
  const lab="Study: review today, mock interview, progress"+(n?" ("+n+" due)":"");b.title=lab;b.setAttribute("aria-label",lab);
  if(!n){if(s)s.remove();return;}if(!s){s=document.createElement("span");s.className="sd-badge";s.setAttribute("aria-hidden","true");b.appendChild(s);}s.textContent=n>99?"99+":String(n);}

/* ---------- accessibility pass on the built page ---------- */
function a11y(){
  qa("figure svg:not([role]):not([aria-hidden])").forEach(svg=>{const fig=svg.closest("figure"),cap=fig&&q1("figcaption",fig);
    svg.setAttribute("role","img");if(cap){if(!cap.id)cap.id="cap-"+Math.random().toString(36).slice(2,8);svg.setAttribute("aria-labelledby",cap.id);}
    else svg.setAttribute("aria-label",(fig&&fig.getAttribute("aria-label"))||"Diagram");});
  /* lab message and output lines: read out when they change */
  qa("section [class*='-msg']:not([aria-live]),section [class$='-out']:not([aria-live]),section .msg:not([aria-live]),section [id$='Msg']:not([aria-live]),section [id$='msg']:not([aria-live])").forEach(el=>{
    if(!el.closest(".CodeMirror,pre,.quiz,[aria-live]"))el.setAttribute("aria-live","polite");});
  /* icon-only buttons get their title as a name */
  qa("button:not([aria-label])").forEach(b=>{if(!b.textContent.trim()&&b.title)b.setAttribute("aria-label",b.title);});}

/* ---------- cheat sheet ---------- */
function cheat(){document.body.classList.add("cheat");addCss();const off=()=>{document.body.classList.remove("cheat");removeEventListener("afterprint",off);};addEventListener("afterprint",off);print();}

/* ---------- cheat sheets (2026-11-08): a lesson's <template id="cheatsheet"> opens as a pop-up panel; a course home with
   <meta name="zl-sheets" data-src="…/sheets-<course>.js"> (written by build-index.mjs, locked) opens every lesson's sheet in one pack
   (lesson chips, Print = one lesson per page). Cards .cs-card (h3 + content, .wide spans the row); .cs-a = an answer, blurred in
   self-test mode until clicked. A revealed answer gets ✓ / ✗: that makes it a Review today card (c:"cs", id cs:<lesson>:<hash of
   question + answer>, same 1·3·7·21·60-day ladder) and the sheet underlines it known / missed / due from then on.
   Self-test on/off in js1-cs-hide ("0" = off). ---------- */
let csDlg=null;
const hash=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h*33)^s.charCodeAt(i))>>>0;return h.toString(36);};
const txt=el=>(el?el.textContent:"").replace(/\s+/g," ").trim();
/* the question Review today shows for an answer: the card title + the code just before it, its row and column, or its line */
function cue(a){
  const card=a.closest(".cs-card"),hd=card?txt(q1("h3",card)):"",pre=a.closest("pre"),td=a.closest("td,th");let q="";
  if(pre){const code=q1("code",pre)||pre;let s="";
    for(const n of code.childNodes){if(n===a)break;if(n.nodeType!==1){s+=n.textContent;continue;}
      if(n.classList.contains("cs-a"))s="";else if(!n.classList.contains("cs-rt"))s+=n.textContent;}
    q="<pre>"+esc(s.replace(/^\n+|\s+$/g,"").split("\n").slice(-8).join("\n"))+"</pre>";}
  else if(td){const tr=td.parentElement,tb=td.closest("table"),i=Array.prototype.indexOf.call(tr.children,td),h0=tb.rows[0];
    const row=i?txt(tr.children[0]):"",col=h0&&h0!==tr&&h0.children[i]?txt(h0.children[i]):"";
    q=(row?"<b>"+esc(row)+"</b>":"")+(row&&col?" · ":"")+esc(col);}
  else{const box=a.closest("li,p")||a.parentElement,i=qa(".cs-a",box).indexOf(a),c=box.cloneNode(true);
    qa(".cs-rt",c).forEach(x=>x.remove());qa(".cs-a",c).forEach((x,j)=>x.replaceWith(document.createTextNode(j===i?" ___ ":" … ")));q=c.innerHTML.trim().replace(/\s*___$/,"");}
  return '<small class="sd-cs">'+esc(hd)+"</small>"+q;}
function csMark(a){const c=srs[a.dataset.id];a.classList.remove("cs-known","cs-miss","cs-due");
  if(c)a.classList.add(c.due<=Date.now()?"cs-due":c.b>0?"cs-known":"cs-miss");}
function csStats(){const as=qa(".cs-sec:not([hidden]) .cs-a",csDlg),n=c=>as.filter(a=>a.classList.contains(c)).length,d=n("cs-due");
  q1(".cs-st",csDlg).innerHTML="<b>"+n("cs-known")+"</b> / "+as.length+" known"+(d?' · <b class="cs-dn">'+d+"</b> due":"");}
function csChips(a,on){const n=a.nextElementSibling;if(n&&n.classList.contains("cs-rt"))n.remove();
  if(on)a.insertAdjacentHTML("afterend",'<span class="cs-rt" role="group" aria-label="Did you know it?"><button type="button" class="cs-y" title="Knew it · comes back later">✓</button><button type="button" class="cs-n" title="Missed it · comes back soon">✗</button></span>');}
function csRate(a,ok){srs=J("js1-srs",{});const id=a.dataset.id;
  if(!srs[id])srs[id]={b:0,due:0,c:"cs",k:a.dataset.k};
  Object.assign(srs[id],{q:cue(a),a:a.innerHTML});grade({id},ok);csMark(a);csStats();badge();}
function csFill(list,pack){srs=J("js1-srs",{});const b=q1(".cs-body",csDlg);
  b.innerHTML=list.map(s=>'<div class="cs-sec" data-k="'+esc(s.k)+'">'+(pack?'<h2 class="cs-lh"><span>'+esc(s.name||s.k)+'</span><a href="'+esc(href(s.file))+'">Open the lesson ↗</a></h2>':"")+s.html+"</div>").join("");
  qa(".cs-sec",b).forEach((sec,i)=>{const s=list[i];
    qa(".cs-a",sec).forEach(a=>{a.dataset.id="cs:"+s.k+":"+hash(cue(a)+"|"+a.innerHTML);a.dataset.k=s.k;csMark(a);});
    if(pack)qa('a[href^="#"]',sec).forEach(x=>x.href=href(s.file)+x.getAttribute("href"));});
  const pk=q1(".cs-pick",csDlg);pk.hidden=!pack;
  pk.innerHTML=pack?'<button type="button" class="sd-chip" data-pk="" aria-pressed="true">All</button>'+list.map(s=>'<button type="button" class="sd-chip" data-pk="'+esc(s.k)+'" aria-pressed="false">'+esc(s.short||s.k)+"</button>").join(""):"";
  csStats();}
function sheetMode(on){if(!csDlg)return;csDlg.classList.toggle("cs-hide",on);st.set("js1-cs-hide",on?"1":"0");
  const m=q1(".cs-mode",csDlg);m.setAttribute("aria-pressed",String(on));m.textContent=on?"Self-test: on":"Self-test: off";
  qa(".cs-rt",csDlg).forEach(x=>x.remove());
  qa(".cs-a",csDlg).forEach(a=>{a.classList.remove("on");if(on){a.tabIndex=0;a.setAttribute("role","button");a.title="Click to reveal, then ✓ or ✗";}else{a.removeAttribute("tabindex");a.removeAttribute("role");a.removeAttribute("title");}});}
function sheetPrint(){const off=()=>{document.body.classList.remove("csprint");removeEventListener("afterprint",off);csDlg.close();csDlg.showModal();};
  document.body.classList.add("csprint");addEventListener("afterprint",off);csDlg.close();csDlg.show();print();}
function csOpen(title){addCss();
  if(!csDlg){csDlg=document.createElement("dialog");csDlg.className="sd-dlg cs-dlg";csDlg.setAttribute("aria-labelledby","csT");
    csDlg.innerHTML='<div class="sd-h"><b id="csT" class="cs-t"></b><span class="cs-st" aria-live="polite" title="Green = known, amber = due again, red = missed. In self-test mode reveal an answer, then press ✓ or ✗: it joins Review today."></span>'+
      '<button type="button" class="sd-b cs-mode"></button><button type="button" class="sd-b cs-all">Reveal all</button>'+
      '<button type="button" class="sd-b cs-pr">Print</button><button type="button" class="sd-x" aria-label="Close cheat sheet">✕</button></div>'+
      '<div class="sd-row cs-pick" role="group" aria-label="Lessons" hidden></div><div class="sd-body cs-body"></div>';
    document.body.appendChild(csDlg);
    q1(".cs-mode",csDlg).onclick=()=>sheetMode(!csDlg.classList.contains("cs-hide"));
    q1(".cs-all",csDlg).onclick=()=>qa(".cs-sec:not([hidden]) .cs-a",csDlg).forEach(a=>{a.classList.add("on");csChips(a,false);});
    q1(".cs-pr",csDlg).onclick=sheetPrint;q1(".sd-x",csDlg).onclick=()=>csDlg.close();
    const flip=e=>{const a=e.target.closest(".cs-a");if(a&&csDlg.classList.contains("cs-hide")){csChips(a,a.classList.toggle("on"));e.preventDefault();}};
    csDlg.addEventListener("click",e=>{if(e.target===csDlg)return csDlg.close();
      const r=e.target.closest(".cs-y,.cs-n");if(r){const g=r.parentElement;csRate(g.previousElementSibling,r.classList.contains("cs-y"));g.remove();return;}
      const p=e.target.closest("[data-pk]");if(p){qa("[data-pk]",csDlg).forEach(x=>x.setAttribute("aria-pressed",String(x===p)));
        qa(".cs-sec",csDlg).forEach(s=>s.hidden=!!p.dataset.pk&&s.dataset.k!==p.dataset.pk);csStats();q1(".cs-body",csDlg).scrollTop=0;return;}
      if(e.target.closest('a[href^="#"]'))return csDlg.close();flip(e);});
    csDlg.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&!e.target.closest("button"))flip(e);});}
  q1("#csT",csDlg).textContent=title;}
function csShow(){sheetMode(st.get("js1-cs-hide")!=="0");if(!csDlg.open)csDlg.showModal();q1(".cs-body",csDlg).scrollTop=0;}
function sheet(){const tpl=q1("template#cheatsheet");if(!tpl)return;
  csOpen("💡 Cheat sheet · "+(document.body.dataset.name||document.title));csFill([{k:document.body.dataset.page||PAGE||"page",html:tpl.innerHTML}],false);csShow();}
/* the course pack: every lesson's sheet, loaded on first use from the signed data-src of <meta name="zl-sheets"> */
function pack(){const m=q1('meta[name="zl-sheets"]');if(!m)return;
  const go=()=>{const L=window.SHEETS||[];csOpen("💡 All cheat sheets · "+(CNAME[CID]||CID)+" · "+L.length+" lessons");csFill(L,true);csShow();};
  if(window.SHEETS)return go();
  const s=document.createElement("script");s.src=m.getAttribute("data-src");s.onload=go;
  s.onerror=()=>{s.remove();csOpen("Cheat sheets");q1(".cs-pick",csDlg).hidden=true;q1(".cs-st",csDlg).textContent="";
    q1(".cs-body",csDlg).innerHTML='<div class="sd-empty">The cheat sheets could not be loaded. Check the connection and try again.</div>';if(!csDlg.open)csDlg.showModal();};
  document.head.appendChild(s);}
/* 💡 bulb in the top nav (2026-11-08, user: "cheat sheet on the top with some bulb button show effect"): amber glow,
   pulses until the sheet is first opened (js1-cs-seen), lights up on click, then opens. No nav → old pill under the lead. */
function sheetBtn(){const all=!q1("template#cheatsheet");if((all&&!q1('meta[name="zl-sheets"]'))||q1(".cs-open"))return;
  const anchor=q1("#studyBtn")||q1("#cmdBtn"),b=document.createElement("button");b.type="button";b.className="cs-open";
  b.title=all?"Every lesson's cheat sheet in one printable view":"Cheat sheet of this lesson";b.setAttribute("aria-label",all?"Open all cheat sheets of this course":"Open the cheat sheet of this lesson");
  b.innerHTML='<span class="cs-bulb" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g class="cs-rays"><path d="M12 1v1.5M4.2 4.2l1 1M19.8 4.2l-1 1M1.5 11H3M21 11h1.5"/></g><path class="cs-glass" d="M9 17.5h6M9.5 21h5M8.2 14.6A6 6 0 1 1 15.8 14.6c-.6.6-.8 1.3-.8 2.1v.8H9v-.8c0-.8-.2-1.5-.8-2.1z"/></svg></span><span class="cs-lbl">'+(all?"All cheat sheets":"Cheat sheet")+'</span>';
  if(st.get("js1-cs-seen")!=="1")b.classList.add("cs-new");
  b.onclick=()=>{b.classList.remove("cs-new");st.set("js1-cs-seen","1");b.classList.add("cs-lit");setTimeout(()=>b.classList.remove("cs-lit"),700);(all?pack:sheet)();};
  if(anchor)return anchor.before(b);
  const h=q1("header#top"),ld=h&&q1(".lead",h);if(!h)return;b.classList.add("sd-b","cs-pill");ld?ld.after(b):h.appendChild(b);}

/* ---------- Company question bank (2026-11-08): "I was asked this at <company>, <round>" on interview cards ----------
   Live site: public.question_tags (own reports) + qtag_counts() (everyone's counts, needs a face login); cached 10 min in
   sessionStorage zls-qt. Without the lock (file://) reports stay in this browser (js1-qtags {key: [[company, round]]}).
   Card key = COURSE.qa k = "<section id>:<Q label>" (build-index.mjs). Shown on every details.d card (badge in the summary,
   chips + Report form in the answer) and as Company / Round filters + chips in the mock interview. */
const QROUND={online:"Online test",phone:"Phone screen",tech:"Technical",design:"Design / machine coding",manager:"Managerial",hr:"HR"};
const QCOMMON=["Amazon","Google","Microsoft","Meta","Apple","Adobe","Atlassian","Oracle","SAP","Salesforce","Uber","Flipkart","Walmart","PayPal","Goldman Sachs","JPMorgan","Morgan Stanley","Paytm","PhonePe","Swiggy","Zomato","Razorpay","CRED","Zoho","Freshworks","TCS","Infosys","Wipro","HCLTech","Tech Mahindra","Cognizant","Accenture","Capgemini","LTIMindtree","Deloitte","IBM"];
const qsb=()=>{const A=window.AUTH;return A&&A.on&&A.sb?A.sb:null;};
let QT=null;   /* {key: [{co, r, n, mine}]} */
const qtFire=()=>setTimeout(()=>{try{document.dispatchEvent(new Event("qtready"));}catch(e){}},0);   /* M07's "Asked at" filters listen */
const qtNorm=s=>String(s||"").trim().replace(/\s+/g," ").slice(0,60);
const qtTitle=s=>s.replace(/\b\w/g,c=>c.toUpperCase());
async function qtLoad(force){
  if(QT&&!force)return QT;
  const sb=qsb();
  if(!sb){const L=J("js1-qtags",{});QT={};for(const k in L)QT[k]=(L[k]||[]).map(([co,r])=>({co:co.toLowerCase(),r,n:1,mine:true}));qtFire();return QT;}
  if(!force){try{const c=JSON.parse(sessionStorage.getItem("zls-qt")||"null");if(c&&Date.now()-c.t<6e5){QT=c.d;qtFire();return QT;}}catch(e){}}
  const r=await sb.rpc("qtag_counts");QT={};
  if(!r.error)(r.data||[]).forEach(x=>{(QT[x.q_key]=QT[x.q_key]||[]).push({co:x.company,r:x.round,n:+x.n,mine:!!x.mine});});
  try{sessionStorage.setItem("zls-qt",JSON.stringify({t:Date.now(),d:QT}));}catch(e){}
  qtFire();return QT;}
async function qtAdd(k,co,r,del){
  const sb=qsb();co=qtNorm(co);if(co.length<2||!QROUND[r])return "Type the company name (2–60 letters) and pick the round.";
  if(!sb){const L=J("js1-qtags",{}),a=(L[k]||[]).filter(([c,x])=>!(c.toLowerCase()===co.toLowerCase()&&x===r));if(!del)a.push([co,r]);L[k]=a;put("js1-qtags",L);await qtLoad(true);return "";}
  const q=del?await sb.from("question_tags").delete().eq("q_key",k).ilike("company",co).eq("round",r)
             :await sb.from("question_tags").insert({q_key:k,company:co,round:r});
  if(q.error&&!/duplicate/i.test(q.error.message))return /face|permission|policy/i.test(q.error.message)?"Log in again with your face to report.":q.error.message;
  await qtLoad(true);return "";}
const qtChips=(k,withMine)=>{const a=(QT&&QT[k])||[];if(!a.length)return "";
  return a.slice().sort((x,y)=>y.n-x.n).map(t=>'<span class="qt-chip'+(t.mine?" mine":"")+'" title="'+esc(QROUND[t.r]||t.r)+(t.mine?" · you reported this":"")+'">🏢 '+esc(qtTitle(t.co))+" · "+esc(QROUND[t.r]||t.r)+(t.n>1?" <b>×"+t.n+"</b>":"")+
    (withMine&&t.mine?' <button type="button" class="qt-x" data-qtdel="'+esc(t.co)+'|'+t.r+'" aria-label="Remove my report">×</button>':"")+"</span>").join("");};
function qtForm(k){
  const known=new Set(QCOMMON);for(const kk in (QT||{}))QT[kk].forEach(t=>known.add(qtTitle(t.co)));
  return '<div class="qt-box" data-qk="'+esc(k)+'"><div class="qt-chips">'+qtChips(k,true)+'</div>'+
    '<details class="qt-rep"><summary>🏢 Asked in a real interview? Report it</summary><form class="qt-f" novalidate><label>Company <input name="co" list="qtList" maxlength="60" autocomplete="off" required placeholder="e.g. Infosys"></label>'+
    '<label>Round <select name="r">'+Object.keys(QROUND).map(r=>'<option value="'+r+'"'+(r==="tech"?" selected":"")+">"+QROUND[r]+"</option>").join("")+"</select></label>"+
    '<button type="submit" class="sd-b pri">Save</button><span class="qt-msg" aria-live="polite"></span></form>'+
    '<p class="qt-note">Reports are shared (company and round only, never your name) and build this site\'s company question bank.</p></details>'+
    (document.getElementById("qtList")?"":'<datalist id="qtList">'+[...known].sort().map(c=>'<option value="'+esc(c)+'">').join("")+"</datalist>")+"</div>";}
function qtWire(root,after){
  root.addEventListener("submit",async e=>{const f=e.target.closest(".qt-f");if(!f)return;e.preventDefault();const box=f.closest(".qt-box"),m=q1(".qt-msg",f);
    /* novalidate + this check: the browser's own "fill in this field" bubble when the field is on screen, and no console warning
       ("invalid form control … is not focusable") when the form is submitted while its <details> is closed; qtAdd still validates */
    if(!f.co.checkValidity()&&f.co.getClientRects().length){f.co.reportValidity();return;}
    m.textContent="Saving…";const err=await qtAdd(box.dataset.qk,f.co.value,f.r.value);m.textContent=err||"Saved. Thank you!";
    if(!err){f.co.value="";q1(".qt-chips",box).innerHTML=qtChips(box.dataset.qk,true);if(after)after(box.dataset.qk);}});
  root.addEventListener("click",async e=>{const b=e.target.closest("[data-qtdel]");if(!b)return;e.preventDefault();e.stopPropagation();const box=b.closest(".qt-box"),[co,r]=b.dataset.qtdel.split("|");
    await qtAdd(box.dataset.qk,co,r,true);q1(".qt-chips",box).innerHTML=qtChips(box.dataset.qk,true);if(after)after(box.dataset.qk);});}
const qtBadge=k=>{const n=((QT&&QT[k])||[]).reduce((a,t)=>a+t.n,0);return n?'<span class="qt-badge" title="Reported in real interviews '+n+(n===1?" time":" times")+'">🏢 '+n+"</span>":"";};
/* every interview card on a lesson page */
async function qtCards(){
  const cards=qa("section[id] details.d");if(!cards.length)return;
  await qtLoad().catch(()=>{QT=QT||{};});
  const keyOf=d=>{const s=d.closest("section[id]"),l=q1("summary .q",d);return s&&l?s.id+":"+l.textContent.trim():"";};
  const paint=d=>{const k=keyOf(d);if(!k)return;let b=q1(":scope > summary .qt-badge",d);const h=qtBadge(k);
    if(b)b.outerHTML=h||"";else if(h)q1("summary",d).insertAdjacentHTML("beforeend",h);};
  cards.forEach(d=>{paint(d);d.addEventListener("toggle",()=>{if(!d.open||q1(".qt-box",d))return;const k=keyOf(d),body=q1(":scope > .b",d);if(!k||!body)return;
    body.insertAdjacentHTML("beforeend",qtForm(k));qtWire(q1(".qt-box",body),()=>paint(d));});});}
/* ---------- LLD case studies (lld review+tags v1, 2026-11-08; kb/site/site-internals.md → Study tools → "LLD case cards") ----------
   A finished case (kit test passed or rubric fully scored: js1-lld-done {"id:x"|"p:problem"|"t:title": …}; M07 rounds saved:
   js1-lld-timed / js1-lld-mock rounds[].id) becomes a Review today card ld:<caseId> {c:"ld", k:"m02", q, a, u, n, t, p}, box 0,
   due in 1 day. Q/A come from assets/data/lld-review.js (window.LLD_REVIEW, generated by scripts/lld-review.mjs from
   lld-cases.js), loaded only when needed from the signed data-src of <meta name="zl-lldrev"> (lock.mjs upload adds it) or the
   plain path. The card keeps its own copy (reviewable from any course); a later load refreshes the copy.
   Every LLDK.req panel has an empty .ldk-qt slot: it gets the case's company chips (bank key "lld:<caseId>") + the report form. */
let LDP=null;
function ldData(){if(window.LLD_REVIEW)return Promise.resolve(window.LLD_REVIEW);if(LDP)return LDP;
  LDP=new Promise(res=>{const m=q1('meta[name="zl-lldrev"]'),s=document.createElement("script");s.src=(m&&m.getAttribute("data-src"))||ROOT+"assets/data/lld-review.js";
    s.onload=()=>res(window.LLD_REVIEW&&window.LLD_REVIEW.cases?window.LLD_REVIEW:null);s.onerror=()=>{s.remove();LDP=null;res(null);};document.head.appendChild(s);});
  return LDP;}
const ldSplit=r=>{const i=r.indexOf(":");return [r.slice(0,i),r.slice(i+1)];};
const ldFind=(D,r)=>{const [t,v]=ldSplit(r);return D.cases.find(c=>t==="id"?c.id===v:t==="p"?c.p===v:c.t===v);};
const ldCopy=c=>({q:c.q,a:c.a,u:"courses/lld/"+c.href,n:c.n,t:c.t,p:c.p||"",k:String(c.m||"m00").toLowerCase()});
function ldRefs(){const R=new Set(Object.keys(J("js1-lld-done",{})));
  ["js1-lld-timed","js1-lld-mock"].forEach(k=>((J(k,{})||{}).rounds||[]).forEach(r=>{if(r&&r.id)R.add("id:"+r.id);}));
  return [...R].filter(r=>/^(id|p|t):./.test(r));}
function ldHave(r){const [t,v]=ldSplit(r);if(t==="id")return !!srs["ld:"+v];
  for(const id in srs){const c=srs[id];if(c&&c.c==="ld"&&(t==="p"?c.p===v:c.t===v))return true;}return false;}
async function ldEnrol(){srs=J("js1-srs",{});const todo=ldRefs().filter(r=>!ldHave(r));if(!todo.length)return 0;
  const D=await ldData();if(!D)return 0;srs=J("js1-srs",{});const now=Date.now();let n=0;
  todo.forEach(r=>{const c=ldFind(D,r);if(!c||srs["ld:"+c.id])return;srs["ld:"+c.id]=Object.assign({b:0,due:now+DAY,c:"ld"},ldCopy(c));n++;});
  if(n){saveSrs();badge();}return n;}
function ldFresh(list){ldData().then(D=>{if(!D)return;srs=J("js1-srs",{});let ch=false;
  for(const id in srs){const c=srs[id];if(!c||c.c!=="ld")continue;const x=D.cases.find(k=>"ld:"+k.id===id);if(!x)continue;const cp=ldCopy(x);
    if(cp.q!==c.q||cp.a!==c.a||cp.u!==c.u){Object.assign(c,cp);ch=true;}}
  if(ch){saveSrs();(list||[]).forEach(c=>{const x=c.c==="ld"&&D.cases.find(k=>"ld:"+k.id===c.id);if(x)Object.assign(c,ldCopy(x));});}});}
/* "Asked at" chips + report form under an LLDK.req header */
async function ldTag(host){const slot=host&&q1(":scope > .ldk-qt",host);if(!slot||slot.dataset.on)return;slot.dataset.on="1";
  let id=host.dataset.ldkCase||"";
  if(!id){const D=await ldData(),c=D&&D.cases.find(x=>x.t===host.dataset.ldkTitle);if(!c){slot.hidden=true;return;}id=c.id;}
  await qtLoad().catch(()=>{QT=QT||{};});
  const k="lld:"+id;
  slot.innerHTML='<div class="ldq-hd"><b>🏢 Asked at</b><span class="ldq-none"></span></div>'+qtForm(k);
  const none=()=>{const e=!((QT&&QT[k])||[]).length;slot.classList.toggle("ldq-empty",e);
    q1(".ldq-none",slot).textContent=e?"No company has been reported for this case yet. Were you asked it in a real interview? Report it below.":"";};
  none();qtWire(q1(".qt-box",slot),none);}
const ldTags=()=>qa(".ldk-req").forEach(h=>ldTag(h).catch(()=>{}));
window.STUDY={open,due,dash,cheat,badge,sheet,pack,
  qt:{load:()=>qtLoad().catch(()=>QT||{}),get:()=>QT||{},title:qtTitle,ROUND:QROUND}};
if(CID&&COURSE.pages&&COURSE.pages.length){
  enrol();backfill();summarise();addCss();explain();navBtn();sheetBtn();a11y();qtCards().catch(()=>{});
  ldEnrol().catch(()=>{});ldTags();document.addEventListener("lldreq",e=>{ldTag(e.detail&&e.detail.host).catch(()=>{});});
  document.addEventListener("lldcase",()=>{ldEnrol().catch(()=>{});});
  document.addEventListener("quizanswer",()=>{enrol();summarise();badge();});
  document.addEventListener("click",e=>{if(e.target.closest(".secfoot .sf-done"))setTimeout(()=>{backfill();summarise();badge();},0);});
  const h=decodeURIComponent(location.hash);if(h==="#study-review"||h==="#study-mock"||h==="#study-progress"){history.replaceState(null,"",location.pathname+location.search);open(h.slice(7));}
  else if(h==="#cheatsheet"){history.replaceState(null,"",location.pathname+location.search);q1("template#cheatsheet")?sheet():pack();}
  setInterval(badge,30*60*1000);}
})();
