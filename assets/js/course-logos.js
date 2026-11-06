/* Course logos (2026-11-06, user: "the real Java symbol, like that"): the letter badges become the technology's logo, on a white tile so
   dark logos stay visible in the dark theme. Where: the brand badge in the nav of every course page (course from body data-course or
   the folder under /courses/), and every link to a course home that starts with a badge (<i> or .ic: the course switcher built by
   course.js, the hub's menu and course cards). Courses without a technology logo (dsa, patterns, sysdesign, behavioural, resume)
   keep their letters. Loaded by course.js and by the hub (index.html). Files in assets/img/logos:
   java, spring, redis, kafka (apachekafka), docker: Devicon v2.16.0 "original" icons, MIT licence (https://devicon.dev);
   sql: Devicon "azuresqldatabase" (a database symbol; the course covers PostgreSQL, MySQL and SQLite, so no vendor logo);
   nginx: "Nginx logo hexagon.svg", Wikimedia Commons, public domain; n8n: Simple Icons 13.21.0, CC0, coloured #EA4B71.
   The logos are trademarks of their owners, used here only to name the technology a course teaches. */
(function(){"use strict";
  const L={java:"Java",sql:"SQL",spring:"Spring",redis:"Redis",kafka:"Apache Kafka",nginx:"NGINX",docker:"Docker",n8n:"n8n"};
  const base=new URL("../img/logos/",document.currentScript?document.currentScript.src:location.href).href;
  const css=document.createElement("style");
  css.textContent=".lg-on{background:#fff!important;box-shadow:0 0 0 1px rgba(15,23,42,.12)!important;padding:2px;overflow:hidden}"+
    ".lg-on>img{display:block;width:100%;height:100%;object-fit:contain}.course .ic.lg-on{padding:7px}";
  document.head.appendChild(css);
  const put=(el,id)=>{if(!el||el.classList.contains("lg-on"))return;el.classList.add("lg-on");el.setAttribute("title",L[id]);
    el.innerHTML='<img src="'+base+id+'.svg" alt="'+L[id]+' logo" decoding="async">';};
  const m=new URL(document.baseURI).pathname.match(/\/courses\/([^/]+)\//),cur=document.body.dataset.course||(m&&m[1])||"";
  function apply(){
    if(L[cur])document.querySelectorAll("nav .brand > i").forEach(i=>put(i,cur));
    document.querySelectorAll('a[href*="courses/"]').forEach(a=>{const mm=(a.getAttribute("href")||"").match(/courses\/([a-z0-9]+)\//);if(!mm||!L[mm[1]])return;
      const ic=a.querySelector(":scope > i, :scope > .ic");if(ic)put(ic,mm[1]);});}
  apply();
  /* the course switcher and some hub parts are built later: re-apply when the DOM changes (cheap: once per frame at most) */
  let q=false;new MutationObserver(()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;apply();});}).observe(document.body,{childList:true,subtree:true});
})();
