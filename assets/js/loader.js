/* ∞ loader v2 (2026-11-03): the one loading screen of the site (hub, admin, every locked-page shell, and the cover written
   over an unlocked lesson until its CSS has loaded). Public, dependency-free, loaded before anything slow. Prefix zl-.
   Aurora background, a gradient progress bar on top, the site's ∞ with a glowing comet (head + fading tail, SMIL so the
   same markup also works inside a freshly written document), a shimmering status line and a three-step tracker
   (Sign-in → Access → Lesson). Reduced motion: everything still, the ∞ drawn in full. Docs: kb/lock/access-lock.md. */
(function(){
  /* a symmetric lemniscate: two mirrored loops (outer tangents vertical at x = 8 and x = 56) crossing at (32, 18) */
  var D="M32 18C25 7 8 7 8 18C8 29 25 29 32 18C39 7 56 7 56 18C56 29 39 29 32 18";
  var STEPS=["Sign-in","Access","Lesson"];
  function dark(){var t="";try{t=String(localStorage.getItem("js1-theme")||"");}catch(e){}
    var a=document.documentElement.getAttribute("data-theme")||"";
    if(/light/.test(a)||/light/.test(t))return false;if(/dark/.test(a)||/dark/.test(t))return true;
    return !!(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches);}
  function still(){return !!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);}

  var CSS=
  ".zl{--zl-bg:#f7f8fb;--zl-fg:#0f172a;--zl-mu:#64748b;--zl-ln:rgba(15,23,42,.10);--zl-a:#4f46e5;--zl-b:#9333ea;--zl-c:#06b6d4;--zl-glow:.22;"+
    "position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;overflow:hidden;background:var(--zl-bg);color:var(--zl-fg);"+
    "font:500 15px/1.5 Inter,'Inter Tight',system-ui,-apple-system,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;transition:opacity .45s ease,filter .45s ease,transform .45s ease}"+
  ".zl.zl-dark{--zl-bg:#07080d;--zl-fg:#eef0f6;--zl-mu:#8b93a7;--zl-ln:rgba(255,255,255,.08);--zl-a:#818cf8;--zl-b:#c084fc;--zl-c:#22d3ee;--zl-glow:.38}"+
  ".zl.zl-out{opacity:0;filter:blur(6px);transform:scale(1.015);pointer-events:none}"+
  ".zl-au{position:absolute;inset:-20%;pointer-events:none;filter:blur(60px);opacity:var(--zl-glow)}"+
  ".zl-au i{position:absolute;width:46vmax;height:46vmax;border-radius:50%;mix-blend-mode:normal}"+
  ".zl-au i:nth-child(1){left:8%;top:12%;background:radial-gradient(circle,var(--zl-a),transparent 62%);animation:zl-d1 14s ease-in-out infinite alternate}"+
  ".zl-au i:nth-child(2){right:6%;top:26%;background:radial-gradient(circle,var(--zl-b),transparent 62%);animation:zl-d2 17s ease-in-out infinite alternate}"+
  ".zl-au i:nth-child(3){left:30%;bottom:2%;background:radial-gradient(circle,var(--zl-c),transparent 62%);animation:zl-d3 19s ease-in-out infinite alternate;opacity:.7}"+
  "@keyframes zl-d1{to{transform:translate(12%,10%) scale(1.15)}}@keyframes zl-d2{to{transform:translate(-14%,8%) scale(.9)}}@keyframes zl-d3{to{transform:translate(8%,-12%) scale(1.1)}}"+
  ".zl-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(var(--zl-ln) 1px,transparent 1px),linear-gradient(90deg,var(--zl-ln) 1px,transparent 1px);"+
    "background-size:44px 44px;-webkit-mask-image:radial-gradient(ellipse at center,#000 0,transparent 62%);mask-image:radial-gradient(ellipse at center,#000 0,transparent 62%);opacity:.6}"+
  ".zl-bar{position:absolute;left:0;right:0;top:0;height:2px;overflow:hidden}"+
  ".zl-bar i{position:absolute;top:0;bottom:0;width:38%;left:-38%;background:linear-gradient(90deg,transparent,var(--zl-a),var(--zl-b),var(--zl-c),transparent);animation:zl-bar 1.5s cubic-bezier(.65,.05,.36,1) infinite;box-shadow:0 0 12px var(--zl-b)}"+
  "@keyframes zl-bar{to{left:100%}}"+
  ".zl-box{position:relative;display:flex;flex-direction:column;align-items:center;gap:20px;padding:24px;text-align:center;max-width:460px;animation:zl-in .6s cubic-bezier(.2,.8,.2,1) both}"+
  "@keyframes zl-in{from{opacity:0;transform:translateY(10px) scale(.98)}}"+
  ".zl-mark{position:relative;width:250px;height:141px;overflow:visible}"+
  ".zl-orb{position:absolute;left:50%;top:50%;width:300px;height:170px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(ellipse,color-mix(in srgb,var(--zl-b) 34%,transparent),transparent 68%);filter:blur(18px);animation:zl-br 3.2s ease-in-out infinite;pointer-events:none}"+
  "@keyframes zl-br{50%{transform:translate(-50%,-50%) scale(1.14);opacity:.7}}"+
  ".zl-hero{position:relative;display:grid;place-items:center}"+
  ".zl-fly{position:absolute;inset:0;perspective:520px;perspective-origin:50% 45%;pointer-events:none;overflow:hidden;"+
    "-webkit-mask-image:radial-gradient(ellipse 280px 215px at 50% 50%,transparent 56%,#000 92%);mask-image:radial-gradient(ellipse 280px 215px at 50% 50%,transparent 56%,#000 92%)}"+
  ".zl-fly span{position:absolute;left:50%;top:45%;white-space:nowrap;font:700 22px/1 'JetBrains Mono',ui-monospace,monospace;letter-spacing:-.01em;opacity:0;"+
    "background:linear-gradient(90deg,var(--zl-a),var(--zl-b),var(--zl-c));-webkit-background-clip:text;background-clip:text;color:transparent;will-change:transform,opacity,filter;"+
    "animation:zl-fly 6.4s cubic-bezier(.4,0,.75,.6) infinite;animation-delay:var(--d)}"+
  ".zl-fly span.w{font:800 30px/1 'Inter Tight',Inter,system-ui,sans-serif;letter-spacing:-.02em}"+
  "@keyframes zl-fly{0%{opacity:0;filter:blur(4px);transform:translate(-50%,-50%) translate3d(calc(var(--x)*.3),calc(var(--y)*.3),-900px)}"+
    "16%{opacity:.95;filter:blur(0)}74%{opacity:.9;filter:blur(0)}"+
    "100%{opacity:0;filter:blur(6px);transform:translate(-50%,-50%) translate3d(var(--x),var(--y),340px)}}"+
  ".zl-dark .zl-fly span{opacity:0}"+
  ".zl-brand{font:600 11px/1 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.28em;text-transform:uppercase;color:var(--zl-mu)}"+
  ".zl-msg{margin:0;font:650 19px/1.3 'Inter Tight',Inter,system-ui,sans-serif;letter-spacing:-.01em;background:linear-gradient(90deg,var(--zl-fg) 0%,var(--zl-fg) 38%,var(--zl-a) 50%,var(--zl-fg) 62%,var(--zl-fg) 100%);"+
    "background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:zl-sh 2.4s linear infinite}"+
  "@keyframes zl-sh{from{background-position:100% 0}to{background-position:-150% 0}}"+
  ".zl-steps{display:flex;align-items:center;gap:8px;margin:0;padding:0;list-style:none}"+
  ".zl-steps li{display:flex;align-items:center;gap:7px;font:600 12px/1 Inter,system-ui,sans-serif;color:var(--zl-mu);transition:color .3s}"+
  ".zl-steps li b{position:relative;display:grid;place-items:center;width:20px;height:20px;border-radius:50%;border:1.5px solid var(--zl-ln);font-size:11px;transition:all .35s}"+
  ".zl-steps li+li::before{content:'';width:26px;height:1.5px;margin-right:2px;background:var(--zl-ln);border-radius:2px;transition:background .35s}"+
  ".zl-steps li.done{color:var(--zl-fg)}.zl-steps li.done b{border-color:transparent;background:linear-gradient(135deg,var(--zl-a),var(--zl-b));color:#fff}"+
  ".zl-steps li.done+li::before{background:linear-gradient(90deg,var(--zl-a),var(--zl-b))}"+
  ".zl-steps li.now{color:var(--zl-fg)}.zl-steps li.now b{border-color:var(--zl-a)}"+
  ".zl-steps li.now b::after{content:'';position:absolute;inset:-5px;border-radius:50%;border:1.5px solid var(--zl-a);animation:zl-pu 1.4s ease-out infinite}"+
  ".zl-steps li.now b::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--zl-a)}"+
  "@keyframes zl-pu{from{opacity:.8;transform:scale(.7)}to{opacity:0;transform:scale(1.5)}}"+
  ".zl-hint{max-width:360px;margin:0;font-size:13px;line-height:1.55;color:var(--zl-mu);opacity:0;transform:translateY(4px);transition:opacity .5s,transform .5s}"+
  ".zl-hint.on{opacity:1;transform:none}"+
  "@media (prefers-reduced-motion:reduce){.zl *,.zl *::before,.zl *::after{animation:none!important;transition:none!important}.zl-bar,.zl-fly{display:none}.zl-msg{color:var(--zl-fg);background:none}}"+
  "@media (max-width:420px){.zl-mark{width:190px;height:107px}.zl-orb{width:230px;height:130px}.zl-fly span{font-size:16px}.zl-fly span.w{font-size:22px}.zl-msg{font-size:17px}.zl-steps{gap:5px}.zl-steps li{font-size:11px;gap:5px}.zl-steps li+li::before{width:12px}}";

  /* the ∞ with a comet: gradient track, three dashes (tail, body, head) moving together, a glowing head dot on the path */
  function mark(id){var g="zlg"+id,f="zlf"+id,s=still();
    function dash(len,off,w,op){return '<path d="'+D+'" pathLength="120" fill="none" stroke="url(#'+g+')" stroke-width="'+w+'" stroke-linecap="round" opacity="'+op+'"'+
      (s?"":' stroke-dasharray="'+len+" "+(120-len)+'" stroke-dashoffset="'+off+'"')+">"+(s?"":'<animate attributeName="stroke-dashoffset" from="'+off+'" to="'+(off-120)+'" dur="2.2s" repeatCount="indefinite"/>')+"</path>";}
    return '<svg class="zl-mark" viewBox="0 0 64 36" aria-hidden="true"><defs>'+
      '<linearGradient id="'+g+'" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="var(--zl-a)" style="stop-color:var(--zl-a)"/><stop offset=".55" stop-color="var(--zl-b)" style="stop-color:var(--zl-b)"/><stop offset="1" stop-color="var(--zl-c)" style="stop-color:var(--zl-c)"/></linearGradient>'+
      '<filter id="'+f+'" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'+
      '<path d="'+D+'" fill="none" stroke="url(#'+g+')" stroke-width="2.6" stroke-linecap="round" opacity="'+(s?".9":".16")+'"/>'+
      (s?"":'<g filter="url(#'+f+')">'+dash(42,42,2.6,.22)+dash(20,20,3.2,.55)+dash(7,7,3.8,1)+
        '<circle r="3.4" fill="url(#'+g+')" opacity=".28"><animateMotion dur="2.2s" repeatCount="indefinite" path="'+D+'"/></circle>'+
        '<circle r="2.3" fill="#fff" stroke="var(--zl-a)" stroke-width=".9" style="stroke:var(--zl-a)"><animateMotion dur="2.2s" repeatCount="indefinite" path="'+D+'"/></circle></g>')+"</svg>";}

  /* course names and code that rise from deep behind the screen and fly past the reader (3D, staggered, never over the text) */
  function W(big,code){return big.map(function(t){return [t,1];}).concat(code.map(function(t){return [t,0];}));}
  var FLY={
    java:W(["Java","JVM"],["class Car","@Override","HashMap","Stream","λ","record","volatile","Thread","Optional","List<T>","try { }","interface","GC","{ }","sealed","var"]),
    sql:W(["SQL","Postgres"],["SELECT *","JOIN","GROUP BY","WHERE","ORDER BY","HAVING","INDEX","COMMIT","PRIMARY KEY","OVER ()","WITH cte","UNION","NULL","COUNT(*)","ROLLBACK","VIEW"]),
    spring:W(["Spring Boot","IoC"],["@Bean","@Autowired","@RestController","@Transactional","@Service","@GetMapping","JPA","@Entity","DI","application.yml","@Configuration","@Repository","Actuator","@Value"]),
    patterns:W(["Patterns","SOLID"],["Strategy","Observer","Factory","Decorator","Singleton","Adapter","Builder","Proxy","Command","Facade","State","Visitor","Composite","Iterator"]),
    redis:W(["Redis","cache"],["GET","SET","TTL","INCR","EXPIRE","SCAN","RESP","ZADD","HSET","LPUSH","cache-aside","6379"]),
    nginx:W(["NGINX","the gate"],["server","location","proxy_pass","upstream","worker","epoll","try_files","reload","443","TLS","limit_req","cache","nginx -t"]),
    sysdesign:W(["System Design","scale"],["QPS","p99","shard","replica","cache hit","CDN","load balancer","CAP","quorum","fan-out","idempotent","backoff","SLO","consistent hash"]),
    kafka:W(["Kafka","events"],["topic","partition","offset","producer","consumer","acks=all","ISR","lag","rebalance","compaction","9092","KRaft","commit"]),
    dsa:W(["DSA","Big-O"],["O(log n)","O(n)","BFS","DFS","heap","DP","two pointers","stack","queue","graph","binary search","memo","trie","sliding window"]),
    n8n:W(["n8n","Automation"],["Webhook","{{ $json }}","HTTP Request","IF","Merge","Cron","AI Agent","Set","Code","Split Out","workflow","Wait","Switch","Error Trigger"]),
    resume:W(["Resume","ATS"],["LaTeX","impact","skills","keywords","projects","metrics","PDF","match %","summary","experience"]),
    all:W(["Java","SQL","Spring Boot","DSA","Patterns","n8n"],["SELECT *","class Car","@Bean","JOIN","λ","O(log n)","Stream","{ }","HashMap","GROUP BY","record","@Transactional","Webhook","Strategy"])};
  var NAME={sysdesign:"System Design",nginx:"NGINX",kafka:"Kafka",redis:"Redis",java:"Java",sql:"SQL",spring:"Spring Boot",patterns:"Patterns",dsa:"DSA",n8n:"n8n",resume:"Resume"};
  function fly(course){var set=FLY[course]||FLY.all,k=set.length;return '<div class="zl-fly" aria-hidden="true">'+set.map(function(w,i){
      var a=(i*137.5)%360*Math.PI/180,r=34+(i*29)%22;   /* golden-angle spread, 34–56 vmax out from the centre */
      return '<span'+(w[1]?' class="w"':"")+' style="--x:'+(Math.cos(a)*r).toFixed(1)+'vmax;--y:'+(Math.sin(a)*r*.62).toFixed(1)+'vmax;--d:'+(-(i*6.4/k)).toFixed(2)+'s">'+w[0]+"</span>";}).join("")+"</div>";}

  var n=0;
  function html(o){o=o||{};var id=++n,step=o.step||0;
    return '<div class="zl'+(dark()?" zl-dark":"")+'"'+(o.id?' id="'+o.id+'"':"")+' role="status" aria-live="polite">'+
      '<div class="zl-au" aria-hidden="true"><i></i><i></i><i></i></div><div class="zl-grid" aria-hidden="true"></div>'+(still()?"":fly(o.course))+'<div class="zl-bar" aria-hidden="true"><i></i></div>'+
      '<div class="zl-box"><div class="zl-hero"><span class="zl-orb" aria-hidden="true"></span>'+mark(id)+"</div>"+'<span class="zl-brand">'+(NAME[o.course]?NAME[o.course]+" · ":"")+'Zero to Advanced</span><p class="zl-msg">'+(o.msg||"Loading")+"</p>"+
      (o.steps===false?"":'<ol class="zl-steps">'+STEPS.map(function(t,i){return '<li class="'+(i<step?"done":i===step?"now":"")+'"><b>'+(i<step?"✓":"")+"</b>"+t+"</li>";}).join("")+"</ol>")+
      '<p class="zl-hint">'+(o.hint||"The free server is waking up after a quiet spell. The first visit can take up to a minute; after that it's quick.")+"</p></div></div>";}

  function css(){return "<style id=\"zlCss\">"+CSS+"</style>";}
  /* mount into this document; returns a controller */
  var MIN_SHOW=3000;   /* ms, from the loader's first appearance (user, 2026-11-03: "3 seconds you keep") */
  function mount(o){o=o||{};var t0=o.fresh?Date.now():(window.__zlT0=window.__zlT0||Date.now());   /* the page's first loader shares its start with the lesson cover (the window survives document.write); switches count their own */
    if(!document.getElementById("zlCss"))(document.head||document.documentElement).insertAdjacentHTML("beforeend",css());
    var host=document.createElement("div");host.innerHTML=html(o);var el=host.firstChild;(document.body||document.documentElement).appendChild(el);
    var timer=o.hintAfter===0?null:setTimeout(function(){var h=el.querySelector(".zl-hint");if(h)h.classList.add("on");},o.hintAfter||6000);
    return {el:el,
      set:function(step,msg){var lis=el.querySelectorAll(".zl-steps li");for(var i=0;i<lis.length;i++){lis[i].className=i<step?"done":i===step?"now":"";lis[i].firstChild.textContent=i<step?"✓":"";}
        if(msg){var m=el.querySelector(".zl-msg");m.textContent=msg;}},
      leave:function(){clearTimeout(timer);if(!el.parentNode||el.zlLeaving)return;el.zlLeaving=1;
        setTimeout(function(){el.classList.add("zl-out");setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},480);},Math.max(0,MIN_SHOW-(Date.now()-t0)));}};}
  /* Switching (user, 2026-11-03: "between lessons, courses, and inside lessons each section"): on a click that leaves for
     another page of the site, the loader appears at once (the next page's shell takes over with its own); on a click to a
     section of this page, or any jump that changes the #section (the search palette…), the loader shows that section's
     title, the page jumps behind it, and it lifts after MIN_SHOW. Not for new tabs, modified clicks, downloads, other
     sites, bare "#" links, or page links some script already handled. A page restored from the back/forward cache drops it. */
  function titleOf(el){var h=el.matches&&el.matches("h1,h2,h3")?el:el.querySelector&&el.querySelector("h2,h3,h1");
    var t=(h||el).textContent||"";t=t.replace(/^\s*\d+\s*/,"").replace(/\s+/g," ").replace(/[\s#¶]+$/,"").trim();   /* drop the section number and the copy-link mark */return t.length>60?t.slice(0,57)+"…":t;}
  function section(id){var el=id&&document.getElementById(id);if(!el||document.querySelector(".zl:not(.zl-out)"))return;
    var c=courseOf(location.pathname),t=titleOf(el);mount({fresh:1,course:c,msg:t?"Opening: "+t:"Opening the section",steps:false,hintAfter:0}).leave();}
  function courseOf(path){var p=path.split("/");for(var i=0;i<p.length;i++)if(NAME[p[i]])return p[i];return "";}
  function nav(){var r=document.documentElement;if(r.__zlNav)return;r.__zlNav=1;   /* on <html>: document.open() keeps the Document but wipes its listeners and replaces <html> */
    document.addEventListener("click",function(e){
      if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
      var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a||(a.target&&a.target!=="_self")||a.hasAttribute("download"))return;
      var u;try{u=new URL(a.getAttribute("href"),location.href);}catch(x){return;}
      if(u.protocol!==location.protocol||u.host!==location.host)return;
      if(u.pathname===location.pathname){if(u.hash.length>1)section(decodeURIComponent(u.hash.slice(1)));return;}   /* a section of this page */
      if(e.defaultPrevented)return;
      if(!/(\/|\.html)$/i.test(u.pathname))return;   /* pages only, not files */
      if(document.querySelector(".zl:not(.zl-out)"))return;
      var c=courseOf(u.pathname);var m=mount({fresh:1,course:c,msg:"Opening "+(NAME[c]||"the page"),steps:false,hintAfter:0});setTimeout(function(){m.leave();},8000);});
    addEventListener("hashchange",function(){section(decodeURIComponent(location.hash.slice(1)));});
    addEventListener("beforeunload",function(){if(document.querySelector(".zl:not(.zl-out)"))return;
      var m=mount({fresh:1,course:courseOf(location.pathname),msg:"Opening",steps:false,hintAfter:0});setTimeout(function(){m.leave();},8000);});
    addEventListener("pageshow",function(ev){if(ev.persisted){var z=document.querySelectorAll(".zl");for(var i=0;i<z.length;i++)z[i].parentNode.removeChild(z[i]);}});}
  nav();
  window.ZL={css:css,html:html,mount:mount,nav:nav,MIN_SHOW:MIN_SHOW};
})();
