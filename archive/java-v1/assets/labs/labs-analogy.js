/* Analogy visuals (v26) on every lesson page.
   Part of the course scripts. Every page loads, in this order: course-index.js, quiz-data.js, course.js, effects.js,
   labs-oop.js, labs-collections.js, labs-analogy.js, labs-sorting.js, practice-tools.js. They are classic scripts, so
   top-level const/let/function names are shared between them (course.js defines $, $$, esc, store, hl, FX, THM…). */
"use strict";
/* Analogy visuals (v26): one memorable real-world picture per key concept, all over the course (the user asked for the Car
   Factory kind of thing "all over the document"). Hosts are .viz.an[id] on each lesson page; each builder is guarded by its id.
   Shared: AN.head (title + memory hooks), AN.steps (a Back / Play / Next player over a list of frames), OLF.carSvg (the car). */
(function(){
  if(!$(".an[id]"))return;
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait=ms=>new Promise(r=>setTimeout(r,still?Math.min(ms,40):ms));
  const car=(c,k)=>OLF?OLF.carSvg(c,k):"🚗";
  const pop=el=>{if(el&&!still)el.animate([{transform:"scale(.6)",opacity:0},{transform:"scale(1.08)",opacity:1,offset:.7},{transform:"none",opacity:1}],{duration:450,easing:"cubic-bezier(.2,1.4,.4,1)"});};
  const shake=el=>{if(el&&!still)el.animate([{transform:"translateX(0)"},{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"translateX(0)"}],{duration:320});};
  const head=(t,sub,hooks)=>'<div class="ol-head an-h"><b>'+t+"</b><span>"+sub+"</span></div>"+(hooks?'<div class="an-hooks">'+hooks.map(h=>"<span>"+h+"</span>").join("")+"</div>":"");
  /* a stepper: frames = [{code, msg, apply(state)}]; render(state) paints; state rebuilt from scratch on Back */
  function stepper(host,frames,init,render,unhot){let k=-1,timer=null;const foot=$(".an-foot",host);const ctl='<div class="ctrl an-ctl"><button type="button" class="btn" data-s="back">◀ Back</button><button type="button" class="btn pri" data-s="play">▶ Play</button><button type="button" class="btn" data-s="next">Next ▶</button><span class="count"></span></div><div class="an-code"></div><div class="msg" aria-live="polite"></div>';
    foot.innerHTML=ctl;
    const go=n=>{k=Math.max(-1,Math.min(frames.length-1,n));const st=init();for(let i=0;i<=k;i++){if(i===k&&unhot)unhot(st);frames[i].apply&&frames[i].apply(st);}render(st,k>=0?frames[k]:null);
      $(".an-code",host).innerHTML=frames.slice(0,k+1).map((f,i)=>f.code?'<div class="'+(i===k?"cur":"")+'">'+hl(f.code)+"</div>":"").join("")||'<div class="dim">// press Next or Play</div>';
      $(".msg",host).innerHTML=k>=0?frames[k].msg:host.dataset.intro||"Press <b>Play</b>, or step with <b>Next</b>.";
      $(".count",host).textContent=(k+1)+" / "+frames.length;$('[data-s="back"]',host).disabled=k<0;$('[data-s="next"]',host).disabled=k>=frames.length-1;};
    const stop=()=>{clearInterval(timer);timer=null;$('[data-s="play"]',host).textContent="▶ Play";};
    foot.addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(!b)return;const s=b.dataset.s;
      if(s==="next"){stop();go(k+1);}else if(s==="back"){stop();go(k-1);}
      else{if(timer){stop();return;}if(k>=frames.length-1)go(-1);b.textContent="❚❚ Pause";timer=setInterval(()=>{if(k>=frames.length-1){stop();return;}go(k+1);},still?600:1700);}});
    go(-1);return {go};}
  const mount=(id,title,sub,hooks,body)=>{const h=$("#"+id);if(!h)return null;h.innerHTML=head(title,sub,hooks)+'<div class="vbody">'+body+'<div class="an-foot"></div></div>';return h;};

  /* ===== L00 · boxes and keys: primitives vs references ===== */
  (function(){const h=mount("anBoxes","Boxes and car keys","A primitive variable holds the value. A reference variable holds a key.",
      ["<b>primitive</b> = the value sits in the box","<b>reference</b> = a key to an object","copy a primitive = photocopy the number","copy a reference = cut a second key"],
      '<div class="an-two"><div class="an-pane"><h5>Variables (boxes on the stack)</h5><div class="an-boxes"></div></div><div class="an-pane"><h5>Objects (the parking lot / heap)</h5><div class="an-lot"></div></div></div>');
    if(!h)return;
    const F=[{code:"int x = 5;",msg:"<code>x</code> is a box with the number <b>5</b> inside. For primitives the value itself lives in the box.",apply:s=>s.v.push({n:"x",t:"int",v:"5"})},
      {code:"int y = x;",msg:"Copying a primitive is a <b>photocopy</b>: <code>y</code> gets its own 5. The two boxes are not connected.",apply:s=>s.v.push({n:"y",t:"int",v:"5",hot:1})},
      {code:"y = 9;",msg:"Change <code>y</code> and only <code>y</code> changes. <code>x</code> is still <b>5</b>.",apply:s=>{s.v[1].v="9";s.v[1].hot=1;}},
      {code:'Car a = new Car();',msg:"An object is too big for a box: it is parked in the lot (the heap). The box <code>a</code> holds only a <b>key</b> to it.",apply:s=>{s.car=1;s.v.push({n:"a",t:"Car",key:1,hot:1});}},
      {code:"Car b = a;",msg:"Copying a reference cuts a <b>second key</b>. Still <b>one</b> car in the lot.",apply:s=>s.v.push({n:"b",t:"Car",key:1,hot:1})},
      {code:'b.paint("red");',msg:"Drive to the car with key <code>b</code> and paint it. Open it with key <code>a</code>: it is <b>red</b> too, because it is the same car. That is all a reference is.",apply:s=>{s.color="#ef4444";s.hot="car";}}];
    stepper(h,F,()=>({v:[],car:0,color:"#3b82f6"}),(s)=>{
      $(".an-boxes",h).innerHTML=s.v.map(v=>'<div class="an-box'+(v.hot?" hot":"")+'"><small>'+v.t+" "+v.n+"</small><b>"+(v.key?"🔑 key #1":v.v)+"</b></div>").join("")||'<div class="ol-empty">no variables yet</div>';
      $(".an-lot",h).innerHTML=s.car?'<div class="an-carcard'+(s.hot==="car"?" hot":"")+'">'+car(s.color)+'<small>Car #1 · keys: '+s.v.filter(v=>v.key).map(v=>v.n).join(", ")+"</small></div>":'<div class="ol-empty">empty lot</div>';
      pop($(".an-box.hot",h));},s=>{s.v.forEach(v=>v.hot=0);s.hot=0;});})();

  /* ===== L00 · odometer: integer overflow ===== */
  (function(){const h=mount("anOdo","The car odometer","Numbers in Java have a fixed number of digits, so they roll over",
      ["a <b>byte</b> = an 8-bit odometer","the top bit = the sign","<b>MAX + 1</b> rolls over to <b>MIN</b>","no error, no warning"],
      '<div class="seg an-seg"><button type="button" data-m="byte" class="on">byte (8 bits)</button><button type="button" data-m="int">int (32 bits)</button></div><div class="an-odo"><div class="an-dial">🚗<span class="an-num"></span></div><div class="an-bits"></div></div>'+
      '<div class="ol-cmds"><button type="button" class="btn" data-o="-1">− 1</button><button type="button" class="btn pri" data-o="1">+ 1</button><button type="button" class="chip" data-o="max">jump to MAX</button><button type="button" class="chip" data-o="min">jump to MIN</button><button type="button" class="chip" data-o="zero">reset to 0</button></div>');
    if(!h)return;let mode="byte",v=125;
    const L={byte:{min:-128,max:127,w:8,wrap:x=>((x+128)%256+256)%256-128,T:"Byte"},int:{min:-2147483648,max:2147483647,w:32,wrap:x=>x|0,T:"Integer"}};
    $(".an-foot",h).innerHTML='<div class="an-code"></div><div class="msg" aria-live="polite"></div>';
    function draw(note,roll){const m=L[mode],bits=(mode==="byte"?(v&255):(v>>>0)).toString(2).padStart(m.w,"0");
      $(".an-num",h).textContent=v.toLocaleString("en-US");$(".an-num",h).classList.toggle("neg",v<0);
      $(".an-bits",h).innerHTML=bits.split("").map((b,i)=>'<i class="'+(b==="1"?"on":"")+(i===0?" sign":"")+'">'+b+"</i>").join("");$(".an-bits",h).classList.toggle("w32",mode==="int");
      if(roll&&!still)$(".an-dial",h).animate([{transform:"rotateX(0)"},{transform:"rotateX(90deg)"},{transform:"rotateX(0)"}],{duration:500});
      $(".msg",h).innerHTML=note||("The leftmost bit is the <b>sign</b> (1 = negative). Range: "+m.min.toLocaleString("en-US")+" to "+m.max.toLocaleString("en-US")+". Press <b>+ 1</b> near the top.");}
    h.addEventListener("click",e=>{const s=e.target.closest(".an-seg [data-m]");if(s){mode=s.dataset.m;$$(".an-seg button",h).forEach(b=>b.classList.toggle("on",b===s));v=L[mode].max-2;$(".an-code",h).innerHTML="";draw();return;}
      const b=e.target.closest("[data-o]");if(!b)return;const m=L[mode],o=b.dataset.o,ty=mode;
      if(o==="max"){v=m.max;$(".an-code",h).innerHTML=hl(ty+" n = "+m.T+".MAX_VALUE;   // "+m.max);draw();return;}
      if(o==="min"){v=m.min;$(".an-code",h).innerHTML=hl(ty+" n = "+m.T+".MIN_VALUE;   // "+m.min);draw();return;}
      if(o==="zero"){v=0;$(".an-code",h).innerHTML=hl(ty+" n = 0;");draw();return;}
      const d=+o,raw=v+d,nv=m.wrap(raw),rolled=raw!==nv;v=nv;
      $(".an-code",h).innerHTML=hl("n"+(d>0?"++":"--")+";   // n is now "+nv+(rolled?"  (rolled over!)":""));
      draw(rolled?(d>0?"<b>Rolled over!</b> Like a car odometer going from 999999 to 000000, the bits wrapped: "+m.max.toLocaleString("en-US")+" + 1 = <b>"+m.min.toLocaleString("en-US")+"</b>. Java gives no error. Use <code>long</code>, or <code>Math.addExact</code> to get an exception instead.":"Rolled under: "+m.min.toLocaleString("en-US")+" − 1 = <b>"+m.max.toLocaleString("en-US")+"</b>."):null,rolled);if(rolled)shake($(".an-odo",h));});
    v=125;draw();})();

  /* ===== L00 · photocopy and key copy: pass-by-value ===== */
  (function(){const h=mount("anCopy","Photocopies and spare keys","Java always hands a method a copy. For objects, the copy is a key.",
      ["argument = a <b>photocopy</b>","primitive: the method scribbles on its copy","object: the copy is a <b>spare key</b>","it can paint your car, not swap it"],
      '<div class="seg an-seg"><button type="button" data-c="0" class="on">change(int x)</button><button type="button" data-c="1">paint(Car c)</button><button type="button" data-c="2">replace(Car c)</button></div><div class="an-three"><div class="an-pane"><h5>main()</h5><div class="an-side" data-w="main"></div></div><div class="an-pane an-mid"><h5>the car lot</h5><div class="an-lot"></div></div><div class="an-pane"><h5>the method</h5><div class="an-side" data-w="m"></div></div></div>');
    if(!h)return;
    const SC=[
      [{code:"int n = 5;",msg:"Your note says <b>5</b>.",apply:s=>s.main.push(["n","📝 5"])},
       {code:"change(n);",msg:"Java makes a <b>photocopy</b> of the note and hands it to the method as <code>x</code>.",apply:s=>s.m.push(["x","📝 5",1])},
       {code:"    x = 99;   // inside change",msg:"The method scribbles <b>99</b> on <i>its photocopy</i>.",apply:s=>s.m[0]=["x","📝 99",1]},
       {code:"System.out.println(n);   // 5",msg:"The method returns and its photocopy is thrown away. Your note still says <b>5</b>.",apply:s=>{s.m=[];s.main[0][2]=1;}}],
      [{code:"Car mine = new Car();",msg:"You own a blue car and hold its key.",apply:s=>{s.car=1;s.main.push(["mine","🔑 key #1"]);}},
       {code:"paint(mine);",msg:"Java cuts a <b>spare key</b> (a copy of the reference) and hands it over as <code>c</code>.",apply:s=>s.m.push(["c","🔑 key #1",1])},
       {code:'    c.paint("red");   // inside paint',msg:"The method uses the spare key to reach <b>your</b> car and paints it red.",apply:s=>{s.color="#ef4444";s.hot=1;}},
       {code:"System.out.println(mine.color);   // red",msg:"Back in <code>main</code>, your car is red. The method changed the <b>object</b>, through a copy of the key.",apply:s=>{s.m=[];s.main[0][2]=1;}}],
      [{code:"Car mine = new Car();",msg:"You own a blue car.",apply:s=>{s.car=1;s.main.push(["mine","🔑 key #1"]);}},
       {code:"replace(mine);",msg:"The method gets a spare key, <code>c</code>.",apply:s=>s.m.push(["c","🔑 key #1",1])},
       {code:"    c = new Car();   // inside replace",msg:"The method throws its spare key away and takes a key to a <b>new</b> car. That changes only its own copy.",apply:s=>{s.car2=1;s.m[0]=["c","🔑 key #2",1];}},
       {code:"// mine still opens car #1",msg:"Your key still opens your original car. A method can never make <i>your</i> variable point somewhere else: that would be pass-by-reference, and Java doesn't have it.",apply:s=>{s.m=[];s.main[0][2]=1;}}]];
    let sc=0,st=null;
    const render=s=>{const side=(arr)=>arr.map(([n,v,hot])=>'<div class="an-box'+(hot?" hot":"")+'"><small>'+n+"</small><b>"+v+"</b></div>").join("")||'<div class="ol-empty">—</div>';
      $('[data-w="main"]',h).innerHTML=side(s.main);$('[data-w="m"]',h).innerHTML=side(s.m);
      $(".an-lot",h).innerHTML=(s.car?'<div class="an-carcard'+(s.hot?" hot":"")+'">'+car(s.color)+"<small>car #1</small></div>":"")+(s.car2?'<div class="an-carcard hot">'+car("#22c55e")+"<small>car #2 (new)</small></div>":"")||'<div class="ol-empty">no cars (primitives need none)</div>';
      pop($(".an-box.hot",h));};
    const load=()=>{const host=h.querySelector(".an-foot");host.innerHTML="";st=stepper(h,SC[sc],()=>({main:[],m:[],car:0,car2:0,color:"#3b82f6",hot:0}),render,s=>{s.main.forEach(a=>a[2]=0);s.m.forEach(a=>a[2]=0);s.hot=0;});};
    h.addEventListener("click",e=>{const b=e.target.closest(".an-seg [data-c]");if(!b)return;sc=+b.dataset.c;$$(".an-seg button",h).forEach(x=>x.classList.toggle("on",x===b));
      const old=$(".an-foot",h),fresh=old.cloneNode(false);old.replaceWith(fresh);load();});
    load();})();

  /* ===== L00 · stack of plates: the call stack ===== */
  (function(){const h=mount("anPlates","A stack of plates","Every method call puts a plate on the stack; return takes it off",
      ["call = put a plate on top","return = take the top plate off","only the <b>top</b> plate is working","no base case = plates hit the ceiling"],
      '<div class="an-two"><div class="an-cup"><div class="an-ceil">ceiling: the stack size limit</div><div class="an-plates"></div><div class="an-table"></div></div><div><div class="ol-cmds"><button type="button" class="btn pri" data-p="ok">▶ fact(4)</button><button type="button" class="btn" data-p="bad">▶ fact(4) without a base case</button></div><div class="an-code an-src"></div><div class="an-out"></div></div></div>');
    if(!h)return;let tok=0;
    $(".an-foot",h).innerHTML='<div class="msg" aria-live="polite">Press <b>fact(4)</b> and watch plates go on and come off.</div>';
    const plates=$(".an-plates",h),msg=$(".msg",h),out=$(".an-out",h);
    const plate=(t,cls)=>{const p=document.createElement("div");p.className="an-plate "+(cls||"");p.innerHTML=t;plates.appendChild(p);if(!still)p.animate([{transform:"translateY(-60px)",opacity:0},{transform:"none",opacity:1}],{duration:380,easing:"cubic-bezier(.2,1.3,.4,1)"});return p;};
    async function run(bad){const t=++tok;plates.innerHTML="";out.innerHTML="";h.classList.remove("an-crash");
      $(".an-src",h).innerHTML=(bad?["static int fact(int n) {","    return n * fact(n - 1);   // no base case!","}"]:["static int fact(int n) {","    if (n <= 1) return 1;     // base case","    return n * fact(n - 1);","}"]).map(l=>"<div>"+hl(l)+"</div>").join("");
      plate("main()","main");msg.innerHTML="<code>main</code> is the first plate.";await wait(700);
      for(let n=4;;n--){if(t!==tok)return;if(!bad&&n<1)break;
        const all=$$(".an-plate",h);if(bad&&all.length>=11){h.classList.add("an-crash");shake($(".an-cup",h));
          msg.innerHTML="The plates hit the ceiling: <b>java.lang.StackOverflowError</b>. Without a base case every call adds a plate and none ever comes off. Real stacks hold thousands of frames, but they always run out.";out.innerHTML='<span class="olf-err">Exception in thread "main" java.lang.StackOverflowError</span>';return;}
        plate("fact("+n+") <small>n = "+n+"</small>");msg.innerHTML="<code>fact("+n+")</code> is called: a new plate with its <b>own</b> <code>n = "+n+"</code>. The plate below waits."+(n<=1&&!bad?"":"");await wait(650);if(!bad&&n===1)break;}
      if(t!==tok)return;msg.innerHTML="<code>fact(1)</code> hits the <b>base case</b>: it returns 1 without calling again, so no more plates go on.";await wait(900);
      let val=1;for(let n=1;n<=4;n++){if(t!==tok)return;const top=$$(".an-plate",h).pop();top.classList.add("off");if(!still)top.animate([{transform:"none",opacity:1},{transform:"translate(80px,-30px) rotate(12deg)",opacity:0}],{duration:420,fill:"forwards"});
        await wait(430);top.remove();val*=n;const below=$$(".an-plate",h).pop();msg.innerHTML="The top plate comes off and hands <b>"+val+"</b> down to "+(n<4?"<code>fact("+(n+1)+")</code>":"<code>main</code>")+".";if(below)pop(below);await wait(650);}
      out.innerHTML="Prints <b>24</b>";msg.innerHTML="Back to one plate, <code>main</code>. Every call put a plate on, every return took one off: last in, first out.";}
    h.addEventListener("click",e=>{const b=e.target.closest("[data-p]");if(b)run(b.dataset.p==="bad");});})();

  /* ===== L00 · waterfall steps: switch fall-through ===== */
  (function(){const h=mount("anFall","The waterfall","Classic switch: water enters at the matching case and pours down until a break",
      ["case = a step","<b>break</b> = a dam","no break = water falls to the next step","arrow switch: separate pools, no falling"],
      '<div class="ol-cmds"><span class="small muted">x =</span><button type="button" class="chip on" data-x="1">1</button><button type="button" class="chip" data-x="2">2</button><button type="button" class="chip" data-x="3">3</button><button type="button" class="chip" data-x="7">7</button><label class="ol-tog"><input type="checkbox" data-arrow> arrow switch (<code>-&gt;</code>)</label><button type="button" class="btn pri" data-go>▶ run switch (x)</button></div>'+
      '<div class="an-two"><div class="an-falls"></div><div><div class="an-code an-src"></div><div class="an-out"></div></div></div>');
    if(!h)return;
    const C=[["1",'"A"',false],["2",'"B"',true],["3",'"C"',false],["default",'"D"',true]];let x=1,arrow=false,tok=0;
    $(".an-foot",h).innerHTML='<div class="msg" aria-live="polite">Click a dam (<b>break</b>) to add or remove it, pick x, then run.</div>';
    function draw(lit){$(".an-falls",h).innerHTML=C.map((c,i)=>'<div class="an-step'+(lit&&lit.has(i)?" wet":"")+(arrow?" pool":"")+'" style="margin-left:'+(i*18)+'px"><span>'+(c[0]==="default"?"default":"case "+c[0])+"</span><b>print("+c[1]+")</b>"+(arrow?"":'<button type="button" class="an-dam'+(c[2]?" on":"")+'" data-d="'+i+'" title="toggle break">'+(c[2]?"🧱 break":"no break")+"</button>")+"</div>").join("");
      $(".an-src",h).innerHTML=["switch (x) {"].concat(C.map(c=>"    "+(c[0]==="default"?"default":"case "+c[0])+(arrow?" -> print("+c[1]+");":": print("+c[1]+");"+(c[2]?" break;":"")))).concat(["}"]).map(l=>"<div>"+hl(l)+"</div>").join("");}
    async function go(){const t=++tok;let i=C.findIndex(c=>c[0]===String(x));if(i<0)i=3;const lit=new Set(),out=[];$(".an-out",h).innerHTML="";
      while(i<C.length){if(t!==tok)return;lit.add(i);out.push(C[i][1].replace(/"/g,""));draw(lit);$(".an-out",h).innerHTML="Output: <b>"+out.join("")+"</b>";
        const step=$$(".an-step",h)[i];pop(step);await wait(650);if(arrow||C[i][2])break;i++;}
      $(".msg",h).innerHTML=arrow?"Arrow cases never fall through: each case is its own pool. Output: <b>"+out.join("")+"</b>.":
        out.length>1?"The water entered at "+(x>3||x<1?"<code>default</code>":"<code>case "+x+"</code>")+" and poured down "+(out.length-1)+" more step"+(out.length>2?"s":"")+" before a dam stopped it. Output <b>"+out.join("")+"</b>. A missing <code>break</code> is the classic bug.":"A dam right away: only <b>"+out.join("")+"</b>.";}
    h.addEventListener("click",e=>{const d=e.target.closest("[data-d]");if(d){C[+d.dataset.d][2]=!C[+d.dataset.d][2];draw();return;}
      const c=e.target.closest("[data-x]");if(c){x=+c.dataset.x;$$("[data-x]",h).forEach(b=>b.classList.toggle("on",b===c));return;}
      if(e.target.closest("[data-go]"))go();});
    h.addEventListener("change",e=>{if(e.target.matches("[data-arrow]")){arrow=e.target.checked;draw();}});draw();})();

  /* ===== L01 · stone tablet vs whiteboard: String vs StringBuilder ===== */
  (function(){const h=mount("anTablet","Stone tablets vs a whiteboard","A String is carved in stone. A StringBuilder is a whiteboard.",
      ["String = a <b>stone tablet</b>: can't change","\"changing\" it = carve a new tablet","old tablets = garbage","StringBuilder = one <b>whiteboard</b> you keep writing on"],
      '<div class="an-two"><div class="an-pane"><h5 class="cd">String s = ""; s += i;</h5><div class="an-tabs"></div><div class="an-stat" data-k="s"></div></div><div class="an-pane"><h5 class="cd">StringBuilder sb; sb.append(i);</h5><div class="an-wb"><span></span></div><div class="an-stat" data-k="b"></div></div></div>');
    if(!h)return;
    const F=[0,1,2,3,4,5].map(i=>({code:i?"s += "+i+";   sb.append("+i+");":'String s = "";   StringBuilder sb = new StringBuilder();',
      msg:i===0?"Both start empty.":i===1?"The String can't change, so <code>s += 1</code> carves a <b>new</b> tablet \"1\". The whiteboard just gets \"1\" written on it.":
        i<5?"Another new tablet, with all "+i+" characters copied onto it. The previous tablet is now garbage. The whiteboard just adds one character.":
        "After 5 rounds: <b>6</b> tablets (5 of them garbage) and 15 characters copied, versus <b>one</b> whiteboard. For n rounds the String way copies about n²/2 characters: O(n²). StringBuilder is O(n).",
      apply:s=>{s.n=i;}}));
    stepper(h,F,()=>({n:-1}),s=>{const n=s.n;let txt="";const tabs=[];for(let i=0;i<=n;i++){if(i)txt+=i;tabs.push(txt);}
      $(".an-tabs",h).innerHTML=tabs.map((t,i)=>'<div class="an-tab'+(i<tabs.length-1?" old":" new")+'">'+(t?esc(t):"&quot;&quot;")+"</div>").join("");
      const copied=n>0?n*(n+1)/2:0;
      $('[data-k="s"]',h).innerHTML=n<0?"":"objects: <b>"+tabs.length+"</b> · garbage: <b>"+Math.max(0,tabs.length-1)+"</b> · chars copied: <b>"+copied+"</b>";
      $(".an-wb span",h).textContent=n<0?"":txt||" ";$('[data-k="b"]',h).innerHTML=n<0?"":"objects: <b>1</b> · chars written: <b>"+Math.max(0,n)+"</b>";
      pop($(".an-tab.new",h));});})();

  /* ===== L01 · identical twins: == vs equals ===== */
  (function(){const h=mount("anTwins","Identical twins","== asks \"same person?\"  equals asks \"same content?\"",
      ["<b>==</b> = is it the <b>same person</b>?","<b>equals</b> = do they <b>say the same name</b>?","two <code>new String(\"Asha\")</code> = twins","a second variable = a nickname for one person"],
      '<div class="an-people"></div><div class="ol-cmds"><button type="button" class="chip" data-q="eq">a == b</button><button type="button" class="chip" data-q="equals">a.equals(b)</button><button type="button" class="chip" data-q="alias">String c = a;  a == c</button><button type="button" class="chip" data-q="lit">two literals: "Asha" == "Asha"</button></div>');
    if(!h)return;
    $(".an-foot",h).innerHTML='<div class="an-code"></div><div class="msg" aria-live="polite">Two Strings made with <code>new String("Asha")</code> are identical twins: same name, two different people. Ask a question.</div>';
    const P=(tags,name,cls)=>'<div class="an-person '+(cls||"")+'"><div class="an-face">🧑</div><b>"'+name+'"</b><div class="an-tags">'+tags.map(t=>"<span>"+t+"</span>").join("")+"</div></div>";
    const draw=(m)=>{$(".an-people",h).innerHTML=m==="alias"?P(["a","c"],"Asha","hot")+P(["b"],"Asha"):m==="lit"?P(["x","y"],"Asha","hot")+'<div class="an-note">one pooled String: both literals share it</div>':P(["a"],"Asha",m==="eq"?"hot":m==="equals"?"talk":"")+P(["b"],"Asha",m==="eq"?"hot":m==="equals"?"talk":"");};
    const Q={eq:["a == b   // false","<code>==</code> compares <b>who</b>: two different people, so <b>false</b>, even though they look the same."],
      equals:["a.equals(b)   // true","<code>equals</code> compares <b>what they say</b>: both say \"Asha\", so <b>true</b>. Use this for Strings."],
      alias:["String c = a;   a == c   // true","<code>c</code> is just a nickname tag on the <b>same</b> person, so <code>a == c</code> is <b>true</b>."],
      lit:['"Asha" == "Asha"   // true (pooled)',"Literals go in the String pool, so both are the <b>same</b> person and <code>==</code> happens to be true. Don't rely on it: compare text with <code>equals</code>."]};
    h.addEventListener("click",e=>{const b=e.target.closest("[data-q]");if(!b)return;const q=b.dataset.q;$$("[data-q]",h).forEach(x=>x.classList.toggle("on",x===b));draw(q);
      $(".an-code",h).innerHTML='<div class="cur">'+hl(Q[q][0])+"</div>";$(".msg",h).innerHTML=Q[q][1];$$(".an-person.hot,.an-person.talk",h).forEach(pop);});
    draw("");})();

  /* ===== L03 · caterpillar: sliding window ===== */
  (function(){const h=mount("anCat","The caterpillar","Longest substring without repeating characters, as a caterpillar crawling along the string",
      ["the body = the <b>window</b>","the head eats the next letter (right++)","a repeat in the body? the tail lets go (left++)","each letter is eaten once: O(n)"],
      '<div class="vin"><input class="an-cin" value="abcabcbb" maxlength="16" spellcheck="false" aria-label="String"></div><div class="an-track"></div><div class="an-best"></div>');
    if(!h)return;
    function frames(str){const F=[];let l=0,best=0,bl=0,br=-1;const last={};
      F.push({code:"int left = 0, best = 0;",msg:"The caterpillar starts with no body.",apply:s=>{s.l=0;s.r=-1;s.best=0;s.b=[0,-1];}});
      for(let r=0;r<str.length;r++){const c=str[r];
        if(last[c]!==undefined&&last[c]>=l){const nl=last[c]+1,ol=l;l=nl;const R=r,L=l;
          F.push({code:"// '"+c+"' is already in the body → left = "+L,msg:"The head wants <b>'"+c+"'</b>, but the body already has one. The tail lets go of "+(L-ol)+" letter"+(L-ol>1?"s":"")+", up to just past the old '"+c+"'.",apply:s=>{s.l=L;s.r=R-1;s.warn=R;}});}
        last[c]=r;if(r-l+1>best){best=r-l+1;bl=l;br=r;}const R=r,L=l,B=best,BL=bl,BR=br;
        F.push({code:"right = "+R+": eat '"+c+"'   window = \""+str.slice(L,R+1)+"\"",msg:"The head eats <b>'"+c+"'</b>. Body: \""+str.slice(L,R+1)+"\" (length "+(R-L+1)+")."+(R-L+1===B&&BR===R?" <b>New best!</b>":""),apply:s=>{s.l=L;s.r=R;s.best=B;s.b=[BL,BR];s.warn=-1;}});}
      F.push({code:"return best;   // "+best,msg:"The caterpillar reached the end. Longest run without repeats: <b>\""+str.slice(bl,br+1)+"\"</b>, length <b>"+best+"</b>. Every letter was eaten once and released at most once: O(n).",apply:s=>{}});return F;}
    function load(){const str=($(".an-cin",h).value||"abcabcbb").slice(0,16);const old=$(".an-foot",h),fresh=old.cloneNode(false);old.replaceWith(fresh);
      stepper(h,frames(str),()=>({l:0,r:-1,best:0,b:[0,-1],warn:-1}),s=>{
        $(".an-track",h).innerHTML=str.split("").map((c,i)=>{const inb=i>=s.l&&i<=s.r,head=i===s.r&&s.r>=s.l,tail=i===s.l&&inb;
          return '<span class="an-cell'+(inb?" body":"")+(head?" head":"")+(tail?" tail":"")+(i===s.warn?" warn":"")+'">'+esc(c)+"<small>"+i+"</small></span>";}).join("");
        $(".an-best",h).innerHTML="best so far: <b>"+s.best+"</b>"+(s.best?' ("'+esc(str.slice(s.b[0],s.b[1]+1))+'")':"");});}
    $(".an-cin",h).addEventListener("change",load);load();})();

  /* ===== L04 · numbered lockers: arrays ===== */
  (function(){const h=mount("anLockers","A row of numbered lockers","An array is a welded row of same-size lockers, numbered from 0",
      ["index = locker number (from <b>0</b>)","<code>arr[i]</code> = walk straight to it: O(1)","the row is welded: fixed length","more room = build a bigger row and copy"],
      '<div class="an-lockers"><span class="an-runner">🏃</span><div class="an-lrow"></div></div><div class="ol-cmds"><span class="small muted">i =</span><input type="number" class="an-li" value="5" min="0" max="9" style="width:58px"><button type="button" class="btn pri" data-l="get">arr[i]</button><button type="button" class="btn" data-l="walk">linked list get(i)</button><button type="button" class="chip" data-l="add">add a 9th item</button><button type="button" class="chip" data-l="reset">reset</button></div>');
    if(!h)return;let A=[12,7,30,4,19,25,8,16],grown=false;
    $(".an-foot",h).innerHTML='<div class="an-code"></div><div class="msg" aria-live="polite">An <code>int[8]</code>: eight lockers, each 4 bytes wide, starting at address 1000. Pick an index.</div>';
    const draw=(hot,walk)=>{$(".an-lrow",h).innerHTML=A.map((v,i)=>'<div class="an-locker'+(hot===i?" hot":"")+(walk&&walk.has(i)?" walked":"")+(v===null?" vac":"")+'"><small>'+i+"</small><b>"+(v===null?"":v)+"</b><em>@"+(1000+i*4)+"</em></div>").join("");};
    /* on a narrow screen the row scrolls: bring locker i into view (v40) */
    const seeL=i=>{const sc=$(".an-lockers",h),t=$$(".an-locker",h)[i];if(!sc||!t||sc.scrollWidth<=sc.clientWidth+1)return;
      sc.scrollTo({left:Math.max(0,t.offsetLeft-(sc.clientWidth-t.offsetWidth)/2),behavior:still||document.documentElement.classList.contains("no-motion")?"auto":"smooth"});};
    const run=async(i,mode)=>{const ls=$$(".an-locker",h),rn=$(".an-runner",h);if(!ls[i])return;const target=ls[i];
      if(mode==="get"){rn.style.transform="translateX("+(target.offsetLeft+target.offsetWidth/2-12)+"px)";draw(i);seeL(i);$(".an-code",h).innerHTML='<div class="cur">'+hl("arr["+i+"]   // address = 1000 + "+i+" × 4 = "+(1000+i*4)+"  →  "+A[i])+"</div>";
        $(".msg",h).innerHTML="One multiplication and one addition give the address, so the runner goes <b>straight</b> to locker "+i+". Locker 0 or locker 7: the same single step. That is O(1), and why indexes start at 0 (the offset from the start).";pop($(".an-locker.hot",h));}
      else{const seen=new Set();for(let k=0;k<=i;k++){seen.add(k);draw(k,seen);const rr=$(".an-runner",h);const t=$$(".an-locker",h)[k];rr.style.transform="translateX("+(t.offsetLeft+t.offsetWidth/2-12)+"px)";seeL(k);$(".an-code",h).innerHTML='<div class="cur">'+hl("list.get("+i+")   // node "+k+" → next …")+"</div>";await wait(330);}
        $(".msg",h).innerHTML="A linked list has no locker numbers, only \"next\" arrows, so the runner checks <b>"+(i+1)+"</b> doors to reach item "+i+": O(n). Arrays win at random access.";}};
    h.addEventListener("click",e=>{const b=e.target.closest("[data-l]");if(!b)return;const m=b.dataset.l,i=Math.max(0,Math.min(A.length-1,parseInt($(".an-li",h).value,10)||0));
      if(m==="get"||m==="walk")run(i,m);
      else if(m==="add"){if(grown){$(".msg",h).innerHTML="The new row has room (16 lockers). Press reset to start again.";return;}
        $(".an-code",h).innerHTML='<div>'+hl("arr[8] = 21;   // ArrayIndexOutOfBoundsException: Index 8 out of bounds for length 8")+'</div><div class="cur">'+hl("arr = Arrays.copyOf(arr, 16);   arr[8] = 21;")+"</div>";
        shake($(".an-lockers",h));grown=true;A=A.concat([21],Array(7).fill(null));setTimeout(()=>{draw(8);seeL(8);pop($$(".an-locker",h)[8]);},still?0:400);
        $(".msg",h).innerHTML="The row is <b>welded</b>: there is no locker 8, so <code>arr[8]</code> throws. To grow, build a <b>new, bigger row</b> and move everything across (<code>Arrays.copyOf</code>). An <code>ArrayList</code> does exactly this for you, about 1.5× each time.";}
      else{A=[12,7,30,4,19,25,8,16];grown=false;draw();seeL(0);$(".an-runner",h).style.transform="";$(".an-code",h).innerHTML="";}});
    draw();})();

  /* ===== L04 · cinema seats: 2D and jagged arrays ===== */
  (function(){const h=mount("anCinema","Cinema seats","A 2D array is rows of seats; each row is its own array",
      ["<code>seats[row][col]</code> = row, then seat","<code>seats.length</code> = number of rows","<code>seats[r].length</code> = seats in that row","jagged = a theatre with rows of different lengths"],
      '<div class="ol-cmds"><label class="ol-tog"><input type="checkbox" data-j> jagged (balcony rows)</label></div><div class="an-hall"><div class="an-screen">SCREEN</div><div class="an-rows"></div></div>');
    if(!h)return;let jag=false;
    $(".an-foot",h).innerHTML='<div class="an-code"></div><div class="msg" aria-live="polite">Click a seat, or a row label.</div>';
    const shape=()=>jag?[6,4,5]:[5,5,5];
    const draw=(sel,row)=>{const S=shape();$(".an-rows",h).innerHTML=S.map((n,r)=>'<div class="an-row'+(row===r?" hot":"")+'"><button type="button" class="an-rl" data-r="'+r+'">row '+r+"</button>"+Array.from({length:n},(_,c)=>'<button type="button" class="an-seat'+(sel&&sel[0]===r&&sel[1]===c?" hot":"")+'" data-s="'+r+","+c+'">'+c+"</button>").join("")+"</div>").join("");};
    h.addEventListener("click",e=>{const s=e.target.closest("[data-s]"),r=e.target.closest("[data-r]");const S=shape();
      if(s){const [a,b]=s.dataset.s.split(",").map(Number);draw([a,b]);$(".an-code",h).innerHTML='<div class="cur">'+hl("seats["+a+"]["+b+"]   // row "+a+", seat "+b)+"</div>";
        $(".msg",h).innerHTML="First pick the row (<code>seats["+a+"]</code>, itself an array), then the seat in it. <code>seats.length</code> = "+S.length+" rows; this row has <code>seats["+a+"].length</code> = "+S[a]+" seats.";pop($(".an-seat.hot",h));}
      else if(r){const a=+r.dataset.r;draw(null,a);$(".an-code",h).innerHTML='<div class="cur">'+hl("int[] row = seats["+a+"];   // a whole row: length "+S[a])+"</div>";
        $(".msg",h).innerHTML="A 2D array is an <b>array of rows</b>. <code>seats["+a+"]</code> is a reference to one row's own array, so rows can even have different lengths (jagged).";}});
    h.addEventListener("change",e=>{if(e.target.matches("[data-j]")){jag=e.target.checked;draw();$(".an-code",h).innerHTML='<div class="cur">'+hl(jag?"int[][] seats = { new int[6], new int[4], new int[5] };   // jagged":"int[][] seats = new int[3][5];")+"</div>";
      $(".msg",h).innerHTML=jag?"Each row was created separately, with its own length. Always loop with <code>seats[r].length</code>, never a fixed number.":"Three rows of five: a rectangle.";}});
    draw();})();

  /* ===== L04 · guess the number: binary search ===== */
  (function(){const h=mount("anGuess","Guess the number","Binary search is the guessing game: always guess the middle",
      ["sorted data only (a phone book, not a pile)","guess the middle","\"too high\" throws away the top half","100 numbers: at most 7 guesses"],
      '<div class="ol-cmds"><span class="small muted">I\'m thinking of</span><input type="number" class="an-gt" value="73" min="1" max="100" style="width:64px"><span class="small muted">(1–100)</span><button type="button" class="btn pri" data-g>▶ play</button></div><div class="an-range"><div class="an-band"></div><div class="an-pin"></div></div><div class="an-guesses"></div>');
    if(!h)return;let tok=0;
    $(".an-foot",h).innerHTML='<div class="msg" aria-live="polite">Pick a secret number and press play. The searcher only hears "too high", "too low" or "yes".</div>';
    async function play(){const t=++tok,target=Math.max(1,Math.min(100,parseInt($(".an-gt",h).value,10)||1));let lo=1,hi=100,n=0;const G=[];
      const band=$(".an-band",h),pin=$(".an-pin",h),pct=v=>((v-1)/99*100)+"%";
      while(lo<=hi){if(t!==tok)return;const mid=(lo+hi)>>>1;n++;band.style.left=pct(lo);band.style.width="calc("+pct(hi)+" - "+pct(lo)+" + 1%)";pin.style.left=pct(mid);pin.textContent=mid;
        const r=mid===target?"yes!":mid>target?"too high":"too low";G.push('<span class="'+(mid===target?"hit":"")+'"><b>'+n+".</b> "+mid+" → "+r+"</span>");$(".an-guesses",h).innerHTML=G.join("");
        $(".msg",h).innerHTML="Range "+lo+"–"+hi+" ("+(hi-lo+1)+" left). Guess the middle: <b>"+mid+"</b> → "+r+".";await wait(900);
        if(mid===target)break;if(mid>target)hi=mid-1;else lo=mid+1;}
      if(t!==tok)return;$(".msg",h).innerHTML="Found <b>"+target+"</b> in <b>"+n+"</b> guesses. Counting up from 1 would take <b>"+target+"</b>. Each guess halves the range, so 100 numbers need at most 7 (log₂ 100 ≈ 6.6), and a million need only 20. That is O(log n): <code>Arrays.binarySearch</code>, on <b>sorted</b> data.";}
    h.addEventListener("click",e=>{if(e.target.closest("[data-g]"))play();});})();

  /* ===== L05 · town clock vs wristwatches: static vs instance ===== */
  (function(){const h=mount("anClock","The town clock and wristwatches","static = one clock in the square for everyone; instance = each person's own watch",
      ["<b>static</b> field = the town clock: one, shared","instance field = each person's own watch","change the town clock: everyone sees it","change one watch: only that person"],
      '<div class="an-town"><div class="an-tower"><div class="an-face2">🕰️</div><b class="an-tt"></b><small>static int townTime</small></div><div class="an-folk"></div></div>'+
      '<div class="ol-cmds"><button type="button" class="btn pri" data-c="town">Clock.townTime += 1</button><button type="button" class="chip" data-c="0">asha.watch += 1</button><button type="button" class="chip" data-c="1">ravi.watch += 1</button><button type="button" class="chip" data-c="2">meera.watch += 1</button></div>');
    if(!h)return;let town=9;const folk=[["asha",9],["ravi",9],["meera",9]];
    $(".an-foot",h).innerHTML='<div class="an-code"></div><div class="msg" aria-live="polite">Three people (objects), each with a wristwatch (an instance field), all looking at one town clock (a static field).</div>';
    const draw=(hot)=>{$(".an-tt",h).textContent=town+":00";$(".an-folk",h).innerHTML=folk.map(([n,w],i)=>'<div class="an-folkp'+(hot===i?" hot":"")+(hot==="town"?" look":"")+'"><div class="an-face">🧑</div><b>'+n+'</b><span>⌚ '+w+':00</span><small>sees town: '+town+":00</small></div>").join("");};
    h.addEventListener("click",e=>{const b=e.target.closest("[data-c]");if(!b)return;const c=b.dataset.c;
      if(c==="town"){town=town%12+1;draw("town");pop($(".an-tower",h));$(".an-code",h).innerHTML='<div class="cur">'+hl("Clock.townTime += 1;   // one shared field")+"</div>";$(".msg",h).innerHTML="One change to the <b>static</b> field, and all three people see <b>"+town+":00</b>. There is only one town clock, however many people there are (even zero).";}
      else{const i=+c;folk[i][1]=folk[i][1]%12+1;draw(i);pop($$(".an-folkp",h)[i]);$(".an-code",h).innerHTML='<div class="cur">'+hl(folk[i][0]+".watch += 1;   // only this object")+"</div>";$(".msg",h).innerHTML="Only "+folk[i][0]+"'s watch moved to "+folk[i][1]+":00. Each object has its <b>own copy</b> of an instance field.";}});
    draw();})();
})();
