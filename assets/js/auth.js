/* auth v1: the course lock (login, roles, per-course approval). Needs auth-config.js and supabase-js loaded first.
   Used by the hub, login.html, admin.html and the locked-page shells that scripts/lock.mjs writes. Docs: kb/access-lock.md */
(function(){
  var C=window.AUTH_CFG||{};
  var on=!!(C.url&&C.anonKey&&C.url.indexOf("YOUR-")<0&&C.anonKey.indexOf("YOUR-")<0&&window.supabase);
  var sb=on?window.supabase.createClient(C.url,C.anonKey):null;
  var COURSES={java:"Java: Zero to Advanced",sql:"SQL: Zero to Advanced",spring:"Spring Boot: Annotations Lab",patterns:"Design Patterns, Beginner to Expert",n8n:"n8n Automation: Zero to Selling Flows",dsa:"DSA: Zero to Interview",redis:"Redis: Zero to Production",kafka:"Kafka: Zero to Production",nginx:"NGINX: Zero to Production",resume:"Resume Builder: ATS match + LaTeX"};
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}

  async function session(){if(!sb)return null;try{return (await sb.auth.getSession()).data.session;}catch(e){return null;}}
  /* the logged-in person: {user, profile:{name,email,username,role,status}, face (this login passed the face check), admin, approved (account), access:{java:"approved",...}} or null */
  async function me(){
    var s=await session();if(!s)return null;
    var p=await sb.from("profiles").select("id,name,email,username,role,status").eq("id",s.user.id).maybeSingle();
    var a=await sb.from("course_access").select("course_id,status").eq("user_id",s.user.id);
    var f=await sb.rpc("face_ok");
    var access={};(a.data||[]).forEach(function(r){access[r.course_id]=r.status;});
    var prof=p.data||{email:s.user.email,role:"learner"},admin=prof.role==="owner"||prof.role==="admin";
    if(admin)Object.keys(COURSES).forEach(function(k){access[k]="approved";});
    return {user:s.user,profile:prof,face:f.data===true,admin:admin,approved:admin||prof.status==="approved",access:access};
  }
  /* call an edge function with the person's token; always resolves to an object (+ .httpStatus) */
  async function fn(name,body){
    var s=await session(),j={};
    try{var r=await fetch(C.url+"/functions/v1/"+name,{method:"POST",headers:{"Content-Type":"application/json",apikey:C.anonKey,Authorization:"Bearer "+(s?s.access_token:C.anonKey)},body:JSON.stringify(body||{})});
      try{j=await r.json();}catch(e){j={error:"Unexpected answer from the server ("+r.status+")."};}j.httpStatus=r.status;}
    catch(e){j={error:"Network error: check your internet connection."};}
    return j;
  }
  async function request(course){var r=await sb.rpc("request_course",{p_course:course});return r.error?{error:r.error.message}:{status:r.data};}
  /* signOut(true) = the face session ran out (keep the offline copies); signOut() = the person logged out (delete them) */
  async function signOut(keepOffline){if(!keepOffline)forget();if(sb)try{await sb.auth.signOut();}catch(e){}}

  /* Offline (2026-11-04, kb/access-lock.md → "Offline"): sw.js (registered here, https only) caches the public site, the CDN
     files and the signed lesson scripts. Each lesson the page function returns is kept in Cache Storage "zl-private"; it is
     shown again only when the network fails, for 7 days after the last time it was unlocked online, and never after a log-out
     (signOut deletes the cache and the zl-offline marker). */
  var PRIV="zl-private",KEEP=7*864e5,okey=function(p){return "https://zl.local/page/"+p;};
  var ROOTURL=(document.currentScript&&document.currentScript.src)?new URL("../../",document.currentScript.src).href:"";
  if(on&&ROOTURL&&location.protocol==="https:"&&"serviceWorker" in navigator)
    addEventListener("load",function(){navigator.serviceWorker.register(ROOTURL+"sw.js",{scope:ROOTURL}).catch(function(){});});
  async function keep(path,html){try{if(!window.caches)return;var c=await caches.open(PRIV);
    await c.put(okey(path),new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8","X-Saved":String(Date.now())}}));
    localStorage.setItem("zl-offline","1");}catch(e){}}
  async function kept(path){try{if(!window.caches||localStorage.getItem("zl-offline")!=="1")return null;
    var r=await (await caches.open(PRIV)).match(okey(path));if(!r)return null;var t=+r.headers.get("X-Saved")||0;
    return Date.now()-t>KEEP?null:{html:await r.text(),t:t};}catch(e){return null;}}
  function forget(){try{localStorage.removeItem("zl-offline");}catch(e){}try{if(window.caches)caches.delete(PRIV);}catch(e){}}
  /* a safe "next" target: a relative path inside the site only */
  function safeNext(n){n=String(n||"");return /^[\w\/.#?=&-]+$/.test(n)&&n.indexOf("..")<0&&n.charAt(0)!=="/"?n:"index.html";}

  /* The loader written over an unlocked lesson (first thing in <body>), so the lesson is never seen without its CSS:
     loader.js's markup + styles (SMIL animation, nothing from the lesson's own CSS), removed once every
     <link rel=stylesheet> has loaded (and the fonts, for at most 1.5 s more), or after 10 s whatever happens. */
  function cover(course){
    if(!window.ZL)return "";
    return ZL.css()+ZL.html({id:"auCover",step:3,msg:"Opening the lesson",course:course})+
      '<script>(function(){var c=document.getElementById("auCover"),gone=false;if(!c)return;'+
      'var t0=window.__zlT0||Date.now(),min='+(window.ZL.MIN_SHOW||0)+';'+
      'function hide(){if(gone)return;var left=min-(Date.now()-t0);if(left>0){setTimeout(hide,left);return;}gone=true;c.classList.add("zl-out");setTimeout(function(){c.remove();var s=document.getElementById("zlCss");if(s)s.remove();},480);}'+
      'function ready(){var f=document.fonts&&document.fonts.ready,cap=new Promise(function(r){setTimeout(r,1500);});(f?Promise.race([f,cap]):cap).then(function(){setTimeout(hide,120);});}'+
      'var ls=[].slice.call(document.querySelectorAll("link[rel=stylesheet]")),n=ls.length;function one(){if(--n<=0)ready();}'+
      'if(!n)ready();else ls.forEach(function(l){if(l.sheet)one();else{l.addEventListener("load",one);l.addEventListener("error",one);}});'+
      'setTimeout(hide,10000);if(window.ZL&&ZL.nav)ZL.nav();})();<\/script>';
  }

  /* locked-page shell: show the page if allowed, otherwise a card that explains why */
  async function gate(path,root){
    var box=document.getElementById("auGate"),course=path.split("/")[0],title=COURSES[course]||"This course";
    var home='<a class="au-btn" href="'+root+'index.html">All courses</a>';
    /* while waiting: the shell's loader (loader.js, mounted before anything slow) shows the step; it explains slow wake-ups itself */
    var zl=window.ZLc||null;
    function say(step,t){if(zl)zl.set(step,t);}
    function card(h,t,actions){if(zl){zl.leave();zl=null;}box.innerHTML='<div class="au-card"><span class="au-lock" aria-hidden="true">'+(h||"🔒")+'</span><h1>'+esc(title)+'</h1><p>'+t+'</p><div class="au-acts">'+actions+home+'</div></div>';}
    if(!on){card("⚙️","The course lock is not set up yet (assets/js/auth-config.js still has placeholder values).","");return;}
    var login='<a class="au-btn pri" href="'+root+'login.html?next='+encodeURIComponent(path+location.search+location.hash)+'">Log in</a>';
    async function show(src,savedAt){
      say(2,"Opening the lesson");
      /* document.open() is ignored while the shell is still parsing, so wait for it to finish */
      if(document.readyState==="loading")await new Promise(function(ok){document.addEventListener("DOMContentLoaded",ok);});
      var note=savedAt?'<div role="status" style="position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:2147483000;padding:8px 14px;border-radius:99px;background:#1f2937;color:#fff;font:600 13px/1.3 system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.3)">Offline copy from '+esc(new Date(savedAt).toLocaleDateString())+' · ▶ Run needs the internet</div>':"";
      var html=/<body[^>]*>/i.test(src)?src.replace(/<body[^>]*>/i,function(b){return b+cover(course)+note;}):cover(course)+note+src;
      document.open();document.write(html);document.close();
      if(location.hash)setTimeout(function(){var e=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(e)e.scrollIntoView();},400);
    }
    var offline=function(){return navigator.onLine===false;};
    say(0,"Checking your sign-in");
    if(!(await session())){var k0=offline()&&await kept(path);if(k0){await show(k0.html,k0.t);return;}
      card("","This course is open to approved members only. Log in to continue.",login);return;}
    say(1,"Checking your access");
    var r=await fn("page",{path:path});
    if(r.html){keep(path,r.html);await show(r.html);return;}
    if(r.httpStatus==null&&/Network error/.test(r.error||"")){var k1=await kept(path);if(k1){await show(k1.html,k1.t);return;}}
    if(r.status==="login"){card("","Your session has ended. Log in again.",login);return;}
    if(r.status==="face"){await signOut(true);card("🙂","A face login lasts 1 hour. Log in again with your face to open this course.",login);return;}
    if(r.status==="account_pending"){card("⏳","Your account is waiting for the owner's approval. Once it is approved you can ask for this course.","");return;}
    if(r.status==="account_rejected"){card("✋","Your registration was not approved. Ask the course owner if you think this is a mistake.","");return;}
    var ask='<button class="au-btn pri" type="button" id="auAsk">Request access</button>';
    if(r.status==="pending")card("⏳","Your request is waiting for approval. You can open the course as soon as it is approved.","");
    else if(r.status==="rejected")card("✋","Your earlier request was not approved. You can ask again.",ask);
    else if(r.status==="none")card("","You have an account, but not access to this course yet.",ask);
    else card("⚠️",esc(r.error||"Something went wrong."),'<button class="au-btn pri" type="button" onclick="location.reload()">Try again</button>');
    var b=document.getElementById("auAsk");
    if(b)b.onclick=async function(){b.disabled=true;var q=await request(course);
      if(q.error){b.disabled=false;b.textContent="Request failed, try again";}else location.reload();};
  }

  window.AUTH={on:on,sb:sb,COURSES:COURSES,esc:esc,session:session,me:me,fn:fn,request:request,signOut:signOut,safeNext:safeNext,gate:gate};
})();
