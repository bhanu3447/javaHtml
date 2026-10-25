/* Lesson 01 labs (Strings). Part of the course scripts: every Java page loads course-index.js, quiz-data.js, course.js,
   effects.js, then the labs of the lesson, then run-java.js. Classic scripts share one global scope, so nothing here is a
   top-level name: everything lives inside one IIFE. course.js provides $, $$, esc, hl, store. The String pool stepper
   (#poolviz) and the [data-cells] boxes are core widgets in course.js; this file holds the analogy visuals of the lesson.
   Hosts are .viz.an[id]; each builder is guarded by its id. The .an-* and .ol-* classes are the analogy CSS in course.css. */
"use strict";
(function(){
  if(!$(".an[id]"))return;
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pop=el=>{if(el&&!still)el.animate([{transform:"scale(.6)",opacity:0},{transform:"scale(1.08)",opacity:1,offset:.7},{transform:"none",opacity:1}],{duration:450,easing:"cubic-bezier(.2,1.4,.4,1)"});};
  const head=(t,sub,hooks)=>'<div class="ol-head an-h"><b>'+t+"</b><span>"+sub+"</span></div>"+(hooks?'<div class="an-hooks">'+hooks.map(h=>"<span>"+h+"</span>").join("")+"</div>":"");
  const mount=(id,title,sub,hooks,body)=>{const h=$("#"+id);if(!h)return null;h.innerHTML=head(title,sub,hooks)+'<div class="vbody">'+body+'<div class="an-foot"></div></div>';return h;};

  /* ===== identical twins: == vs equals ===== */
  (function(){const h=mount("anTwins","Identical twins","== asks \"same person?\"  equals asks \"same name?\"",
      ["<b>==</b> = is it the <b>same person</b>?","<b>equals</b> = do they <b>say the same name</b>?","two <code>new String(\"Asha\")</code> = twins","a second variable = a nickname for one person"],
      '<div class="an-people"></div><div class="ol-cmds"><button type="button" class="chip" data-q="eq">a == b</button><button type="button" class="chip" data-q="equals">a.equals(b)</button><button type="button" class="chip" data-q="alias">String c = a;  a == c</button><button type="button" class="chip" data-q="lit">two literals: "Asha" == "Asha"</button></div>');
    if(!h)return;
    $(".an-foot",h).innerHTML='<div class="an-code"></div><div class="msg" aria-live="polite">Two Strings made with <code>new String("Asha")</code> are identical twins: same name, two different people. Ask a question.</div>';
    const P=(tags,name,cls)=>'<div class="an-person '+(cls||"")+'"><div class="an-face">🧑</div><b>"'+name+'"</b><div class="an-tags">'+tags.map(t=>"<span>"+t+"</span>").join("")+"</div></div>";
    const draw=m=>{$(".an-people",h).innerHTML=m==="alias"?P(["a","c"],"Asha","hot")+P(["b"],"Asha"):m==="lit"?P(["x","y"],"Asha","hot")+'<div class="an-note">one pooled String: both literals share it</div>':P(["a"],"Asha",m==="eq"?"hot":m==="equals"?"talk":"")+P(["b"],"Asha",m==="eq"?"hot":m==="equals"?"talk":"");};
    const Q={eq:["a == b   // false","<code>==</code> compares <b>who</b>: two different people, so <b>false</b>, even though they look the same."],
      equals:["a.equals(b)   // true","<code>equals</code> compares <b>what they say</b>: both say \"Asha\", so <b>true</b>. Use this for Strings."],
      alias:["String c = a;   a == c   // true","<code>c</code> is just a nickname tag on the <b>same</b> person, so <code>a == c</code> is <b>true</b>."],
      lit:['"Asha" == "Asha"   // true (pooled)',"Literals go in the String pool, so both are the <b>same</b> person and <code>==</code> happens to be true. Don't rely on it: compare text with <code>equals</code>."]};
    h.addEventListener("click",e=>{const b=e.target.closest("[data-q]");if(!b)return;const q=b.dataset.q;$$("[data-q]",h).forEach(x=>x.classList.toggle("on",x===b));draw(q);
      $(".an-code",h).innerHTML='<div class="cur">'+hl(Q[q][0])+"</div>";$(".msg",h).innerHTML=Q[q][1];$$(".an-person.hot,.an-person.talk",h).forEach(pop);});
    draw("");})();

  /* ===== the sticker book: how the String pool decides ===== */
  (function(){const h=mount("anBook","The sticker book","Every literal is a sticker. The pool is the one shared book: same text, same sticker.",
      ["a <b>literal</b> = look in the book first","<b>new</b> = print your own copy, never in the book","<b>intern()</b> = hand your copy to the book","immutability makes sharing safe"],
      '<div class="an-people" id="anBookRow"></div><div class="ol-cmds"><button type="button" class="chip" data-b="lit">String a = "car";</button><button type="button" class="chip" data-b="lit2">String b = "car";</button><button type="button" class="chip" data-b="new">String c = new String("car");</button><button type="button" class="chip" data-b="intern">String d = c.intern();</button><button type="button" class="chip" data-b="reset">Reset</button></div>');
    if(!h)return;
    $(".an-foot",h).innerHTML='<div class="an-code"></div><div class="msg" aria-live="polite">Press the statements in order and watch where each variable points.</div>';
    let book=[],copies=[],log=[];
    const card=(tags,name,cls,where)=>'<div class="an-person '+(cls||"")+'"><div class="an-face">'+(where==="book"?"📖":"🖨️")+'</div><b>"'+name+'"</b><div class="an-tags">'+tags.map(t=>"<span>"+t+"</span>").join("")+'</div><div class="an-note">'+(where==="book"?"in the sticker book (pool)":"a private copy (heap)")+"</div></div>";
    const draw=hot=>{const row=$("#anBookRow",h);row.innerHTML=book.map(s=>card(s.tags,s.t,hot===s?"hot":"","book")).join("")+copies.map(s=>card(s.tags,s.t,hot===s?"hot":"","copy")).join("")||'<div class="an-note">the book is empty</div>';
      $(".an-code",h).innerHTML=log.map((l,i)=>'<div class="'+(i===log.length-1?"cur":"")+'">'+hl(l)+"</div>").join("")||'<div class="dim">// press a statement</div>';pop($(".an-person.hot",h));};
    const M={lit:()=>{let s=book.find(x=>x.t==="car");const was=!!s;if(!s){s={t:"car",tags:[]};book.push(s);}if(!s.tags.includes("a"))s.tags.push("a");log.push('String a = "car";');
        $(".msg",h).innerHTML=was?'The book already has <code>"car"</code>, so <code>a</code> gets that sticker.':'<code>"car"</code> is not in the book yet, so one sticker is <b>added</b> and <code>a</code> points to it.';return s;},
      lit2:()=>{let s=book.find(x=>x.t==="car");const was=!!s;if(!s){s={t:"car",tags:[]};book.push(s);}if(!s.tags.includes("b"))s.tags.push("b");log.push('String b = "car";');
        $(".msg",h).innerHTML=was?'Same text, same sticker: <code>b</code> points to the <b>same</b> object as <code>a</code>, so <code>a == b</code> is true.':'<code>"car"</code> was not in the book yet, so it is added now and <code>b</code> points to it.';return s;},
      new:()=>{const s={t:"car",tags:["c"]};copies.push(s);log.push('String c = new String("car");');
        $(".msg",h).innerHTML='<code>new</code> prints a <b>private copy</b>: same text, different object, never in the book. <code>a == c</code> is false, <code>a.equals(c)</code> is true.';return s;},
      intern:()=>{let s=book.find(x=>x.t==="car");const was=!!s;if(!s){s={t:"car",tags:[]};book.push(s);}if(!s.tags.includes("d"))s.tags.push("d");log.push("String d = c.intern();");
        $(".msg",h).innerHTML=was?'<code>intern()</code> looks the text up in the book and returns the <b>book\'s</b> sticker, so <code>d == a</code> is true. The private copy <code>c</code> stays where it is.':'The book had no <code>"car"</code>, so <code>intern()</code> puts <b>this</b> text in and returns it.';return s;},
      reset:()=>{book=[];copies=[];log=[];$(".msg",h).innerHTML="Press the statements in order and watch where each variable points.";return null;}};
    h.addEventListener("click",e=>{const b=e.target.closest("[data-b]");if(!b)return;draw(M[b.dataset.b]());});
    draw(null);})();
})();
