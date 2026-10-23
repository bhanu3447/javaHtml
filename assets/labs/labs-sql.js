/* SQL course kit + Lesson S00 labs (v36, 2026-10-23). Loaded only by the SQL pages (sql/*.html) after course.js and
   sql-seed.js. Classic script: shares the global scope with course.js ($, $$, esc, store, shell, cmReady, CM_BASE…).
   Classes are prefixed sq-. The database is sql.js (SQLite in WebAssembly, cdnjs), loaded on first use, seeded from
   SQL_SEED; SQ.reset() rebuilds it. Every result shown in the lesson text was produced by the same seed (sqlcheck.mjs).
   Kit: SQ.ready() SQ.run(sql, {fresh}) SQ.grid(result) SQ.stepper(host, frames, …). Code blocks
   <script type="text/x-sql" data-file="q.sql" data-auto> become editors with ▶ Run (Ctrl+Enter) and a result grid;
   data-auto runs them when they scroll into view. Labs: #sqCabinet #sqSchema #sqPick #sqOrder #sqKeys. */
"use strict";
const SQ=(function(){
  const CDN="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/";
  let P=null,SQLM=null,db=null;
  const load=()=>new Promise((ok,no)=>{if(window.initSqlJs)return ok();const sc=document.createElement("script");sc.src=CDN+"sql-wasm.js";sc.onload=ok;sc.onerror=()=>no(new Error("sql.js failed to load"));document.head.appendChild(sc);});
  function ready(){if(P)return P;P=load().then(()=>initSqlJs({locateFile:f=>CDN+f})).then(M=>{SQLM=M;db=new M.Database();db.run(SQL_SEED);return db;});return P;}
  function reset(){if(db){db.close();db=new SQLM.Database();db.run(SQL_SEED);}return db;}
  /* run one or more statements; {fresh:true} runs on a throw-away copy so a lab's INSERT never leaks into the shared database */
  async function run(sql,o){await ready();let d=db;if(o&&o.fresh){d=new SQLM.Database();d.run(SQL_SEED);}try{return d.exec(sql);}finally{if(d!==db)d.close();}}
  const cell=v=>"<td>"+(v===null?'<i class="sq-null">NULL</i>':esc(String(v)))+"</td>";
  function grid(res,o){o=o||{};if(!res||!res.length)return '<div class="sq-grid"><div class="sq-count">'+(o.empty||"no rows returned")+"</div></div>";
    return res.map(t=>'<div class="sq-grid"><table><thead><tr>'+t.columns.map(c=>"<th>"+esc(c)+"</th>").join("")+"</tr></thead><tbody>"+
      t.values.map((r,i)=>'<tr data-r="'+i+'"'+(o.hot&&o.hot(r,i)?' class="on"':"")+">"+r.map(cell).join("")+"</tr>").join("")+"</tbody></table><div class=\"sq-count\">"+t.values.length+(t.values.length===1?" row":" rows")+(o.note?" · "+o.note:"")+"</div></div>").join("");}
  const KW=new Set("select from where group by having order limit offset as and or not in is null distinct join left right inner outer on insert into values update set delete create table primary key references integer text date default unique count min max sum avg asc desc like between exists case when then else end with over partition".split(" "));
  function hlSql(s){return esc(s).replace(/('[^']*')|(--[^\n]*)|(\b\d+(\.\d+)?\b)|(\b[A-Za-z_]+\b)/g,(m,str,cm,num,_d,w)=>str?'<span class="s">'+str+"</span>":cm?'<span class="cm">'+cm+"</span>":num?'<span class="n">'+num+"</span>":KW.has(w.toLowerCase())?'<span class="k">'+w+"</span>":m);}
  let sqlMode=null;const modeReady=()=>sqlMode||(sqlMode=cmReady.then(ok=>ok?new Promise(r=>{const sc=document.createElement("script");sc.src=CM_BASE+"mode/sql/sql.min.js";sc.onload=()=>r(true);sc.onerror=()=>r(false);document.head.appendChild(sc);}):false));
  /* an editor with ▶ Run and a result grid under it */
  function editor(host,sql,file,o){o=o||{};const box=shell(file||"query.sql");host.replaceWith(box);box.classList.add("ed","sq-ed");
    const bar=$(".bar",box);const run=document.createElement("button");run.className="ib run";run.textContent="▶ Run";bar.insertBefore(run,$(".cp",box));
    const rs=$(".rs",box);rs.style.display="";
    const body=document.createElement("div"),out=document.createElement("div");body.className="sq-body";out.className="sq-out";
    body.innerHTML='<pre class="cm-wait"><code>'+hlSql(sql)+"</code></pre>";box.append(body,out);
    let cm=null,ta=null;const get=()=>cm?cm.getValue():ta?ta.value:sql;
    copyBtn(box,get);
    modeReady().then(ok=>{body.innerHTML="";if(ok){cm=CodeMirror(body,{value:sql,mode:"text/x-sql",theme:"lesson",lineNumbers:true,indentUnit:2,tabSize:2,viewportMargin:Infinity,extraKeys:{"Ctrl-Enter":()=>go(),"Cmd-Enter":()=>go()}});cm.on("changes",()=>box.classList.toggle("dirty",cm.getValue()!==sql));}
      else{ta=document.createElement("textarea");ta.value=sql;ta.spellcheck=false;ta.addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey))go();});body.appendChild(ta);}});
    rs.onclick=()=>{if(cm)cm.setValue(sql);else if(ta)ta.value=sql;box.classList.remove("dirty");out.innerHTML="";};
    async function go(){run.disabled=true;out.innerHTML='<div class="sq-count">running…</div>';
      try{const r=await run.sqRun(get());out.innerHTML=grid(r,{empty:"OK, no rows to show"})+(o.after?'<div class="sq-after">'+o.after+"</div>":"");}
      catch(e){out.innerHTML='<div class="sq-err">'+esc(e.message||String(e))+"</div>";}
      run.disabled=false;}
    run.sqRun=o.fresh?s=>SQ.run(s,{fresh:true}):s=>SQ.run(s);run.onclick=go;box._run=go;
    if(o.auto){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();go();}},{rootMargin:"120px 0px"});io.observe(box);}
    return box;}
  /* Back / Play / Next player (same controls as the other labs, so ← → Space work) */
  function stepper(host,frames,init,render){let k=-1,timer=null;const foot=$(".an-foot",host);const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
    foot.innerHTML='<div class="ctrl an-ctl"><button type="button" class="btn" data-s="back">◀ Back</button><button type="button" class="btn pri" data-s="play">▶ Play</button><button type="button" class="btn" data-s="next">Next ▶</button><span class="count"></span></div><div class="msg" aria-live="polite"></div>';
    const go=async n=>{k=Math.max(-1,Math.min(frames.length-1,n));const st=init();for(let i=0;i<=k;i++)if(frames[i].apply)await frames[i].apply(st);await render(st,k>=0?frames[k]:null,k);
      $(".msg",host).innerHTML=k>=0?frames[k].msg:host.dataset.intro||"Press <b>Play</b>, or step with <b>Next</b>.";
      $(".count",host).textContent=(k+1)+" / "+frames.length;$('[data-s="back"]',host).disabled=k<0;$('[data-s="next"]',host).disabled=k>=frames.length-1;};
    const stop=()=>{clearInterval(timer);timer=null;$('[data-s="play"]',host).textContent="▶ Play";};
    foot.addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(!b)return;const s=b.dataset.s;
      if(s==="next"){stop();go(k+1);}else if(s==="back"){stop();go(k-1);}
      else{if(timer){stop();return;}if(k>=frames.length-1)go(-1);b.textContent="❚❚ Pause";timer=setInterval(()=>{if(k>=frames.length-1){stop();return;}go(k+1);},still?600:2600);}});
    go(-1);return {go};}
  const head=(t,sub,hooks)=>'<div class="ol-head"><b>'+t+"</b><span>"+sub+"</span></div>"+(hooks?'<div class="fd-hooks">'+hooks.map(h=>"<span>"+h+"</span>").join("")+"</div>":"");
  const mount=(id,title,sub,hooks,body)=>{const h=$("#"+id);if(!h)return null;h.innerHTML=head(title,sub,hooks)+'<div class="vbody">'+body+'<div class="an-foot"></div></div>';return h;};
  return {ready,reset,run,grid,editor,stepper,mount,hlSql};
})();

(function(){
  if(!document.body.dataset.course||document.body.dataset.course!=="sql")return;
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pop=el=>{if(el&&!still)el.animate([{transform:"scale(.7)",opacity:.2},{transform:"scale(1.05)",opacity:1,offset:.7},{transform:"none",opacity:1}],{duration:400,easing:"cubic-bezier(.2,1.4,.4,1)"});};
  const err=(host,e)=>{$(".msg",host).innerHTML='<b>'+esc(e.message||String(e))+"</b>";$(".msg",host).classList.add("err");};

  /* ---- SQL code blocks → editors ---- */
  $$('script[type="text/x-sql"]').forEach(sc=>{const sql=sc.textContent.replace(/^\n+/,"").replace(/\s+$/,"");SQ.editor(sc,sql,sc.dataset.file,{auto:sc.hasAttribute("data-auto"),fresh:sc.hasAttribute("data-fresh"),after:sc.dataset.after});});
  /* reset button(s) */
  $$("[data-sq-reset]").forEach(b=>b.onclick=async()=>{await SQ.ready();SQ.reset();b.textContent="Database reset ✓";setTimeout(()=>b.textContent="Reset the database",1500);});

  const TABLES=[["customers","people who bought or may buy a car","🧑"],["cars","the catalogue: one row per model","🚗"],["sales","one row per car sold","🧾"],["employees","the staff, with a manager tree","👔"],["services","workshop visits","🔧"],["cities","city → region","📍"]];

  /* ===== S00 · the filing cabinet (analogy) ===== */
  (function(){const h=SQ.mount("sqCabinet","The filing cabinet","A database is a cabinet. Each drawer is a table, each folder a row, each label on the folder a column.",
      ["<b>table</b> = a drawer","<b>row</b> = one folder","<b>column</b> = a label every folder has","<b>primary key</b> = the folder's number"],
      '<div class="sq-cab">'+TABLES.map(t=>'<button type="button" class="sq-drawer" data-t="'+t[0]+'"><i>'+t[2]+'</i><b>'+t[0]+'</b><small>'+t[1]+'</small><em></em></button>').join("")+'</div><div class="sq-open"><div class="ol-empty">Pull a drawer.</div></div><div class="msg" aria-live="polite">Click a drawer to open it.</div>');
    if(!h)return;
    SQ.ready().then(async()=>{for(const t of TABLES){const r=await SQ.run("SELECT COUNT(*) FROM "+t[0]);$('.sq-drawer[data-t="'+t[0]+'"] em',h).textContent=r[0].values[0][0]+" folders";}}).catch(e=>err(h,e));
    h.addEventListener("click",async e=>{const b=e.target.closest(".sq-drawer");if(!b)return;$$(".sq-drawer",h).forEach(x=>x.classList.toggle("on",x===b));
      try{const t=b.dataset.t,cols=await SQ.run("PRAGMA table_info("+t+")"),rows=await SQ.run("SELECT * FROM "+t+" LIMIT 4"),n=(await SQ.run("SELECT COUNT(*) FROM "+t))[0].values[0][0];
        const pk=cols[0].values.filter(c=>c[5]>0).map(c=>c[1]);
        $(".sq-open",h).innerHTML='<div class="sq-labels">'+cols[0].values.map(c=>'<span class="'+(c[5]>0?"pk":"")+'">'+esc(c[1])+'<small>'+esc(c[2].toLowerCase())+(c[5]>0?" · key":"")+"</small></span>").join("")+"</div>"+
          '<div class="sq-folders">'+rows[0].values.map(r=>'<div class="sq-folder"><b>#'+esc(String(r[cols[0].values.findIndex(c=>c[5]>0)]))+'</b>'+r.map((v,i)=>'<span><small>'+esc(cols[0].values[i][1])+"</small>"+(v===null?'<i class="sq-null">NULL</i>':esc(String(v)))+"</span>").join("")+"</div>").join("")+(n>4?'<div class="sq-more">… '+(n-4)+" more folders</div>":"")+"</div>";
        $(".msg",h).innerHTML="Drawer <b>"+esc(t)+"</b>: "+n+" folders (rows). Every folder carries the same "+cols[0].values.length+" labels (columns). The folder number is the <b>primary key</b> <code>"+esc(pk.join(", "))+"</code>: no two folders share it, so it is how you ask for exactly one.";$(".msg",h).classList.remove("err");pop($(".sq-open",h));}
      catch(x){err(h,x);}});})();

  /* ===== S00 · the schema: tables and the keys that link them ===== */
  (function(){const FK=[["sales","car_id","cars","the car model that was sold"],["sales","customer_id","customers","who bought it"],["sales","employee_id","employees","who sold it"],["services","car_id","cars","the model that was serviced"],["customers","referred_by","customers","the customer who referred them (same table!)"],["employees","manager_id","employees","their manager (same table!)"]];
    const h=SQ.mount("sqSchema","How the drawers connect","A foreign key is a column that holds another table's primary key. Click one to follow it.",
      ["<b>primary key</b>: unique, identifies the row","<b>foreign key</b>: points at another row's key","a table can point at <b>itself</b>","links are followed with <b>JOIN</b> (Lesson S02)"],
      '<div class="sq-schema"></div><div class="sq-follow"><div class="ol-empty">Click a <b>→</b> column.</div></div><div class="ctrl an-ctl sq-fkctl" hidden><button type="button" class="btn" data-s="back">◀ Back</button><button type="button" class="btn" data-s="next">Next row ▶</button><span class="count"></span></div><div class="msg" aria-live="polite">Each card is a table. Columns marked <b>→</b> are foreign keys.</div>');
    if(!h)return;let cur=null,i=0;
    SQ.ready().then(async()=>{let html="";for(const t of TABLES){const cols=await SQ.run("PRAGMA table_info("+t[0]+")");html+='<div class="sq-tcard" data-t="'+t[0]+'"><b>'+t[2]+" "+t[0]+"</b>"+cols[0].values.map(c=>{const fk=FK.find(f=>f[0]===t[0]&&f[1]===c[1]);return '<span class="'+(c[5]>0?"pk":fk?"fk":"")+'"'+(fk?' data-fk="'+fk[0]+"."+fk[1]+'" role="button" tabindex="0"':"")+'>'+(c[5]>0?"🔑 ":"")+esc(c[1])+(fk?' <em>→ '+fk[2]+"</em>":"")+"</span>";}).join("")+"</div>";}
      $(".sq-schema",h).innerHTML=html;}).catch(e=>err(h,e));
    async function show(){const [t,col,ref]=cur;const rows=await SQ.run("SELECT * FROM "+t+" WHERE "+col+" IS NOT NULL ORDER BY id");const n=rows[0].values.length;i=((i%n)+n)%n;const row=rows[0].values[i],cols=rows[0].columns,v=row[cols.indexOf(col)];
      const target=await SQ.run("SELECT * FROM "+ref+" WHERE id = "+v);
      $(".sq-follow",h).innerHTML='<div class="sq-two"><div><h5>'+esc(t)+" · row "+(i+1)+" of "+n+"</h5>"+SQ.grid(rows.map(r=>({columns:r.columns,values:[row]})),{hot:()=>true})+"</div><div class=\"sq-arrowcol\"><span>"+esc(col)+" = "+esc(String(v))+"</span><i>→</i><span>"+esc(ref)+".id = "+esc(String(v))+"</span></div><div><h5>"+esc(ref)+"</h5>"+SQ.grid(target,{hot:()=>true})+"</div></div>";
      $(".sq-fkctl",h).hidden=false;$(".sq-fkctl .count",h).textContent=(i+1)+" / "+n;
      const fk=FK.find(f=>f[0]===t&&f[1]===col);$(".msg",h).innerHTML="<code>"+esc(t+"."+col)+"</code> holds <b>"+esc(String(v))+"</b>, which is the primary key of one row in <code>"+esc(ref)+"</code>: "+fk[3]+". The value is stored once there and only <i>referenced</i> here: no copying of names or prices.";$(".msg",h).classList.remove("err");pop($(".sq-arrowcol",h));}
    h.addEventListener("click",e=>{const s=e.target.closest("[data-fk]");if(s){$$("[data-fk]",h).forEach(x=>x.classList.toggle("on",x===s));const [t,col]=s.dataset.fk.split(".");cur=[t,col,FK.find(f=>f[0]===t&&f[1]===col)[2]];i=0;show().catch(x=>err(h,x));return;}
      const b=e.target.closest(".sq-fkctl [data-s]");if(b&&cur){i+=b.dataset.s==="next"?1:-1;show().catch(x=>err(h,x));}});
    h.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.dataset.fk){e.preventDefault();e.stopPropagation();e.target.click();}});})();

  /* ===== S00 · build a SELECT by clicking ===== */
  (function(){const h=SQ.mount("sqPick","Build a query by clicking","SELECT picks columns, FROM names the drawer. Everything else is optional.",
      ["<code>SELECT</code> = which labels to read","<code>FROM</code> = which drawer","<code>*</code> = every label","<code>ORDER BY</code> and <code>LIMIT</code> shape the output"],
      '<div class="ol-cmds"><span class="fd-lbl">FROM</span>'+["cars","customers","employees"].map((t,i)=>'<button type="button" class="chip'+(i?"":" on")+'" data-t="'+t+'">'+t+'</button>').join("")+'</div>'+
      '<div class="ol-cmds sq-cols"><span class="fd-lbl">SELECT</span></div>'+
      '<div class="ol-cmds"><span class="fd-lbl">ORDER BY</span><select class="sq-ord"><option value="">(table order)</option></select><select class="sq-dir"><option value="">ASC</option><option value=" DESC">DESC</option></select><span class="fd-lbl">LIMIT</span><select class="sq-lim"><option value="">all</option><option>3</option><option>5</option></select></div>'+
      '<div class="an-code"></div><div class="sq-res"></div><div class="msg" aria-live="polite">Click column chips to add or remove them. The query and its result update live.</div>');
    if(!h)return;let table="cars",picked=new Set(["brand","model","price"]);
    async function cols(){const c=await SQ.run("PRAGMA table_info("+table+")");return c[0].values.map(x=>x[1]);}
    async function paint(){try{const cs=await cols();if(![...picked].every(p=>cs.includes(p)))picked=new Set(cs.slice(1,3));
      $(".sq-cols",h).innerHTML='<span class="fd-lbl">SELECT</span><button type="button" class="chip'+(picked.size===0?" on":"")+'" data-c="*">*</button>'+cs.map(c=>'<button type="button" class="chip'+(picked.has(c)?" on":"")+'" data-c="'+c+'">'+c+"</button>").join("");
      const ord=$(".sq-ord",h),keep=ord.value;ord.innerHTML='<option value="">(table order)</option>'+cs.map(c=>'<option'+(c===keep?" selected":"")+">"+c+"</option>").join("");
      const sel=picked.size?[...cs].filter(c=>picked.has(c)).join(", "):"*",o=ord.value?"\nORDER BY "+ord.value+$(".sq-dir",h).value:"",l=$(".sq-lim",h).value?"\nLIMIT "+$(".sq-lim",h).value:"";
      const sql="SELECT "+sel+"\nFROM "+table+o+l+";";$(".an-code",h).innerHTML='<div class="cur">'+SQ.hlSql(sql)+"</div>";
      const r=await SQ.run(sql);$(".sq-res",h).innerHTML=SQ.grid(r);
      $(".msg",h).innerHTML=picked.size?"Reading <b>"+picked.size+"</b> of "+cs.length+" labels from every folder in <code>"+table+"</code>"+(o?", sorted":"")+(l?", first "+$(".sq-lim",h).value+" only":"")+". Column order in the output follows the table, not your click order.":"<code>*</code> reads every label. Fine for exploring; in real code name the columns, so the result does not change when the table does.";$(".msg",h).classList.remove("err");}catch(e){err(h,e);}}
    h.addEventListener("click",e=>{const t=e.target.closest("[data-t]");if(t){table=t.dataset.t;$$("[data-t]",h).forEach(x=>x.classList.toggle("on",x===t));picked=new Set();$(".sq-ord",h).value="";paint();return;}
      const c=e.target.closest("[data-c]");if(c){if(c.dataset.c==="*")picked=new Set();else{picked.has(c.dataset.c)?picked.delete(c.dataset.c):picked.add(c.dataset.c);}paint();}});
    h.addEventListener("change",paint);paint();})();

  /* ===== S00 · the logical order of a query (headline) ===== */
  (function(){const Q={from:"SELECT brand, COUNT(*) AS models, MIN(price) AS cheapest\nFROM cars\nWHERE year >= 2023\nGROUP BY brand\nHAVING COUNT(*) >= 2\nORDER BY cheapest\nLIMIT 1;"};
    const STEPS=[
      {k:"FROM",sql:"SELECT * FROM cars",msg:"<b>1 · FROM</b> opens the drawer: all 12 rows of <code>cars</code>, every column. Nothing is filtered yet. (With a JOIN, the tables are combined here.)"},
      {k:"WHERE",sql:"SELECT * FROM cars WHERE year >= 2023",msg:"<b>2 · WHERE</b> keeps the rows that pass the test, <b>one row at a time</b>: 9 of 12 survive. <code>COUNT(*)</code> cannot be used here: nothing has been counted yet."},
      {k:"GROUP BY",sql:"SELECT brand, COUNT(*) AS models, MIN(price) AS cheapest FROM cars WHERE year >= 2023 GROUP BY brand",msg:"<b>3 · GROUP BY</b> folds the 9 rows into <b>6 groups</b>, one per brand. From here on, a row means a group, so only the grouping column and aggregates (<code>COUNT</code>, <code>MIN</code>…) make sense."},
      {k:"HAVING",sql:"SELECT brand, COUNT(*) AS models, MIN(price) AS cheapest FROM cars WHERE year >= 2023 GROUP BY brand HAVING COUNT(*) >= 2",msg:"<b>4 · HAVING</b> is WHERE for groups: keep brands with 2 or more models. 2 groups survive."},
      {k:"SELECT",sql:"SELECT brand, COUNT(*) AS models, MIN(price) AS cheapest FROM cars WHERE year >= 2023 GROUP BY brand HAVING COUNT(*) >= 2",msg:"<b>5 · SELECT</b> finally shapes the output columns and names them (<code>AS models</code>). This is why an alias <b>cannot</b> be used in WHERE (it does not exist yet) but <b>can</b> in ORDER BY."},
      {k:"ORDER BY",sql:"SELECT brand, COUNT(*) AS models, MIN(price) AS cheapest FROM cars WHERE year >= 2023 GROUP BY brand HAVING COUNT(*) >= 2 ORDER BY cheapest",msg:"<b>6 · ORDER BY</b> sorts the finished rows. Without it the order is whatever the engine found convenient: never rely on it."},
      {k:"LIMIT",sql:"SELECT brand, COUNT(*) AS models, MIN(price) AS cheapest FROM cars WHERE year >= 2023 GROUP BY brand HAVING COUNT(*) >= 2 ORDER BY cheapest LIMIT 1",msg:"<b>7 · LIMIT</b> cuts the sorted list: the one brand with the cheapest 2023+ model among brands with 2+ models. Written order: SELECT first. <b>Executed order: SELECT fifth.</b>"}];
    const h=SQ.mount("sqOrder","How a query really runs","You write SELECT first. The engine runs it fifth. Watch the rows change clause by clause.",
      ["<b>FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</b>","WHERE filters rows, HAVING filters groups","an alias exists only after SELECT","ORDER BY is the only guaranteed order"],
      '<div class="sq-two sq-ordlab"><div><h5>Written order</h5><pre class="sq-q"></pre></div><div><h5>Execution order</h5><ol class="sq-steps">'+STEPS.map(s=>"<li>"+s.k+"</li>").join("")+'</ol></div></div><div class="sq-res"></div>');
    if(!h)return;h.dataset.intro="Press <b>Play</b>. Each step runs a real query on the database and shows the rows that exist at that point.";
    const lines=Q.from.split("\n");
    SQ.stepper(h,STEPS.map((s,i)=>({msg:s.msg})),()=>({}),async(st,f,k)=>{
      $(".sq-q",h).innerHTML=lines.map((l,i)=>{const key=l.split(" ")[0]+(l.startsWith("GROUP")||l.startsWith("ORDER")?" BY":"");const idx=STEPS.findIndex(s=>s.k===key);return '<span class="sq-l'+(idx===k?" cur":idx>=0&&idx<k?" done":"")+'">'+SQ.hlSql(l)+"</span>";}).join("\n");
      $$(".sq-steps li",h).forEach((li,i)=>{li.classList.toggle("cur",i===k);li.classList.toggle("done",i<k);});
      if(k<0){$(".sq-res",h).innerHTML="";return;}
      try{const r=await SQ.run(STEPS[k].sql);$(".sq-res",h).innerHTML=SQ.grid(r,{note:STEPS[k].k});pop($(".sq-res",h));}catch(e){err(h,e);}});})();

  /* ===== S00 · keys and NULL: what the database refuses ===== */
  (function(){const T=[
      ["Insert a car with id 1 (already used)","INSERT INTO cars VALUES (1, 'Maruti', 'Dzire', 2024, 700000, 'white', 1);","The <b>primary key</b> must be unique. The database refuses the whole statement; nothing is half-written."],
      ["Sell a car that does not exist (car_id 99)","INSERT INTO sales VALUES (16, 99, 1, 4, '2024-09-01', 100);","The <b>foreign key</b> must point at a real row in <code>cars</code>. (SQLite checks this only with <code>PRAGMA foreign_keys = ON</code>; PostgreSQL and MySQL/InnoDB always do.)"],
      ["Add a customer without a city","INSERT INTO customers (id, name, joined_on) VALUES (11, 'Nikhil', '2024-09-01');\nSELECT id, name, city, referred_by FROM customers WHERE id = 11;","Columns you leave out become <b>NULL</b>: 'no value'. NULL is not 0 and not an empty string; it is the absence of a value."],
      ["Count services, then count their costs","SELECT COUNT(*) AS all_rows, COUNT(cost) AS with_cost FROM services;","<code>COUNT(*)</code> counts rows; <code>COUNT(cost)</code> counts rows where <code>cost</code> is <b>not NULL</b>. Two services have no cost yet."],
      ["Find customers whose city is NULL, the wrong way","SELECT name FROM customers WHERE city = NULL;","Nothing. <code>= NULL</code> is never true: comparing with 'unknown' gives unknown, and WHERE keeps only <i>true</i>. Lesson S01 goes deep on this."],
      ["… and the right way","SELECT name FROM customers WHERE city IS NULL;","<code>IS NULL</code> is the test for a missing value."]];
    const h=SQ.mount("sqKeys","What the database refuses","Keys are rules the database enforces for you. NULL is the gap it leaves when you say nothing.",
      ["a <b>primary key</b> is unique: duplicates are rejected","a <b>foreign key</b> must exist: orphans are rejected","a missing value is <b>NULL</b>, not 0 or ''","test it with <code>IS NULL</code>, never <code>= NULL</code>"],
      '<div class="ol-cmds sq-tries">'+T.map((t,i)=>'<button type="button" class="chip" data-i="'+i+'">'+esc(t[0])+'</button>').join("")+'</div><div class="an-code"></div><div class="sq-res"></div><div class="msg" aria-live="polite">Pick a statement. Each runs on a fresh copy of the database, so you can try them in any order.</div>');
    if(!h)return;
    h.addEventListener("click",async e=>{const b=e.target.closest("[data-i]");if(!b)return;const t=T[+b.dataset.i];$$("[data-i]",h).forEach(x=>x.classList.toggle("on",x===b));
      $(".an-code",h).innerHTML='<div class="cur">'+SQ.hlSql(t[1])+"</div>";const m=$(".msg",h);m.classList.remove("err");
      try{const r=await SQ.run(t[1],{fresh:true});$(".sq-res",h).innerHTML=SQ.grid(r,{empty:"no rows returned"});m.innerHTML="✓ Accepted. "+t[2];}
      catch(x){$(".sq-res",h).innerHTML='<div class="sq-err">'+esc(x.message)+"</div>";m.innerHTML="✗ Refused: <code>"+esc(x.message)+"</code>. "+t[2];}pop($(".sq-res",h));});})();
})();
