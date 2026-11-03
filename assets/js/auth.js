/* auth v1: the course lock (login, roles, per-course approval). Needs auth-config.js and supabase-js loaded first.
   Used by the hub, login.html, admin.html and the locked-page shells that scripts/lock.mjs writes. Docs: kb/access-lock.md */
(function(){
  var C=window.AUTH_CFG||{};
  var on=!!(C.url&&C.anonKey&&C.url.indexOf("YOUR-")<0&&C.anonKey.indexOf("YOUR-")<0&&window.supabase);
  var sb=on?window.supabase.createClient(C.url,C.anonKey):null;
  var COURSES={java:"Java: Zero to Advanced",sql:"SQL: Zero to Advanced",spring:"Spring Boot: Annotations Lab",patterns:"Design Patterns, Beginner to Expert",n8n:"n8n Automation: Zero to Selling Flows",dsa:"DSA: Zero to Interview",resume:"Resume Builder: ATS match + LaTeX"};
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
  async function signOut(){if(sb)try{await sb.auth.signOut();}catch(e){}}
  /* a safe "next" target: a relative path inside the site only */
  function safeNext(n){n=String(n||"");return /^[\w\/.#?=&-]+$/.test(n)&&n.indexOf("..")<0&&n.charAt(0)!=="/"?n:"index.html";}

  /* The ∞ cover written into an unlocked lesson (first thing in <body>): inline styles and SMIL only, because the lesson's
     own CSS is exactly what hasn't loaded yet. It fades out once every <link rel="stylesheet"> has loaded (and the
     fonts, for at most 1.5 s more), or after 10 s whatever happens, so the reader never sees the page without its CSS. */
  function cover(){
    var t="";try{t=String(localStorage.getItem("js1-theme")||"");}catch(e){}
    var dark=/dark/.test(t)||(!/light/.test(t)&&matchMedia("(prefers-color-scheme: dark)").matches);
    var bg=dark?"#0a0c12":"#f7f8fb",fg=dark?"#e6e9f0":"#0f172a",line=dark?"#232836":"#e3e7ef",acc=dark?"#8b8cf8":"#4f46e5";
    var still=matchMedia("(prefers-reduced-motion: reduce)").matches,d="M32 18C25 7 8 7 8 18s17 11 24 0 17-11 24 0-17 11-24 0";
    return '<div id="auCover" role="status" aria-live="polite" style="position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:'+bg+';color:'+fg+';font:600 15px/1.4 Inter,system-ui,-apple-system,Segoe UI,sans-serif;transition:opacity .3s">'+
      '<svg viewBox="0 0 64 36" width="120" height="68" style="overflow:visible" aria-hidden="true"><path d="'+d+'" pathLength="120" fill="none" stroke="'+line+'" stroke-width="4.5" stroke-linecap="round"/>'+
      '<path d="'+d+'" pathLength="120" fill="none" stroke="'+acc+'" stroke-width="4.5" stroke-linecap="round"'+(still?"":' stroke-dasharray="28 92"')+'>'+(still?"":'<animate attributeName="stroke-dashoffset" from="0" to="-120" dur="1.6s" repeatCount="indefinite"/>')+"</path></svg>"+
      "<span>Opening the lesson…</span></div>"+
      '<script>(function(){var c=document.getElementById("auCover"),gone=false;if(!c)return;'+
      'function hide(){if(gone)return;gone=true;c.style.opacity="0";setTimeout(function(){c.remove();},320);}'+
      'function ready(){var f=document.fonts&&document.fonts.ready,cap=new Promise(function(r){setTimeout(r,1500);});(f?Promise.race([f,cap]):cap).then(function(){setTimeout(hide,60);});}'+
      'var ls=[].slice.call(document.querySelectorAll("link[rel=stylesheet]")),n=ls.length;function one(){if(--n<=0)ready();}'+
      'if(!n)ready();else ls.forEach(function(l){if(l.sheet)one();else{l.addEventListener("load",one);l.addEventListener("error",one);}});'+
      'setTimeout(hide,10000);})();<\/script>';
  }

  /* locked-page shell: show the page if allowed, otherwise a card that explains why */
  async function gate(path,root){
    var box=document.getElementById("auGate"),course=path.split("/")[0],title=COURSES[course]||"This course";
    var home='<a class="au-btn" href="'+root+'index.html">All courses</a>';
    /* while waiting: the shell's ∞ loader with a message; after 6 s, say why it can be slow (free tiers sleep) */
    var hint=setTimeout(function(){var h=document.getElementById("auLoadHint");if(h)h.hidden=false;},6000);
    function say(t){var m=document.getElementById("auLoadMsg");if(m)m.textContent=t;}
    function card(h,t,actions){clearTimeout(hint);box.innerHTML='<div class="au-card"><span class="au-lock" aria-hidden="true">'+(h||"🔒")+'</span><h1>'+esc(title)+'</h1><p>'+t+'</p><div class="au-acts">'+actions+home+'</div></div>';}
    if(!on){card("⚙️","The course lock is not set up yet (assets/js/auth-config.js still has placeholder values).","");return;}
    var login='<a class="au-btn pri" href="'+root+'login.html?next='+encodeURIComponent(path+location.search+location.hash)+'">Log in</a>';
    say("Checking your login…");
    if(!(await session())){card("","This course is open to approved members only. Log in to continue.",login);return;}
    say("Checking your access…");
    var r=await fn("page",{path:path});
    if(r.html){
      clearTimeout(hint);say("Opening the lesson…");
      /* document.open() is ignored while the shell is still parsing, so wait for it to finish */
      if(document.readyState==="loading")await new Promise(function(ok){document.addEventListener("DOMContentLoaded",ok);});
      var html=/<body[^>]*>/i.test(r.html)?r.html.replace(/<body[^>]*>/i,function(b){return b+cover();}):cover()+r.html;
      document.open();document.write(html);document.close();
      if(location.hash)setTimeout(function(){var e=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(e)e.scrollIntoView();},400);
      return;
    }
    if(r.status==="login"){card("","Your session has ended. Log in again.",login);return;}
    if(r.status==="face"){await signOut();card("🙂","A face login lasts 1 hour. Log in again with your face to open this course.",login);return;}
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
