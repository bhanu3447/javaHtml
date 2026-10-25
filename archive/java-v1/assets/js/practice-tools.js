/* Practice page tools: Memory Lab interpreter + UI and the Algorithm race (v23).
   Part of the course scripts. Every page loads, in this order: course-index.js, quiz-data.js, course.js, effects.js,
   labs-oop.js, labs-collections.js, labs-analogy.js, labs-sorting.js, practice-tools.js. They are classic scripts, so
   top-level const/let/function names are shared between them (course.js defines $, $$, esc, store, hl, FX, THM…). */
"use strict";
/* v23 Memory Lab interpreter: runs a small, honest subset of Java (declarations, assignments, arrays, String / StringBuilder /
   Integer, == and equals, intern, clone, static methods with parameters and return, println, System.gc) and records a snapshot per
   statement: stack frames, heap objects in three zones (String pool, Integer cache, heap), console output, a plain-English note
   and what changed. Unsupported syntax gives a friendly error with the line number. */
const MLC=(function(){
  const PRIM=new Set(["int","long","short","byte","double","float","boolean","char"]);
  const DECL=/^(?:final\s+)?(int|long|short|byte|double|float|boolean|char|String|Integer|StringBuilder|Object|var|int\[\]|long\[\]|double\[\]|char\[\]|boolean\[\]|String\[\]|Integer\[\])\s+([A-Za-z_]\w*)\s*(?:=\s*([\s\S]+))?$/;
  const TOK=/\s*(\d+\.\d+|\d+|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)'|[A-Za-z_]\w*|==|!=|<=|>=|&&|\|\||[-+*\/%<>!=(){}\[\],.])/y;
  const clone=o=>JSON.parse(JSON.stringify(o));
  function splitStmts(t){const out=[];let cur="",q=null,d=0;for(const ch of t){if(q){cur+=ch;if(ch===q&&cur[cur.length-2]!=="\\")q=null;continue;}
      if(ch==='"'||ch==="'"){q=ch;cur+=ch;continue;}if(ch==="{"||ch==="(")d++;if(ch==="}"||ch===")")d--;if(ch===";"&&d<=0){out.push(cur.trim());cur="";continue;}cur+=ch;}
    if(cur.trim())out.push(cur.trim());return out.filter(Boolean);}
  function compile(src){const lines=src.replace(/\r/g,"").split("\n"),strip=l=>{let q=null;for(let i=0;i<l.length;i++){const c=l[i];if(q){if(c===q&&l[i-1]!=="\\")q=null;continue;}
        if(c==='"'||c==="'"){q=c;continue;}if(c==="/"&&l[i+1]==="/")return l.slice(0,i);}return l;};
    const methods={},top=[];let i=0;
    const push=(arr,line,t)=>{t=t.trim().replace(/^\{|\}$/g,"").trim();if(!t)return;for(const s of splitStmts(t))arr.push({line,src:s});};
    while(i<lines.length){const L=strip(lines[i]),m=L.match(/\bstatic\s+([\w\[\]<>]+)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*\{(.*)$/);
      if(m){const params=m[3].trim()?m[3].split(",").map(p=>{const q=p.trim().split(/\s+/);return {type:q.slice(0,-1).join(" "),name:q[q.length-1]};}):[];
        const body=[];let depth=1,rest=m[4];
        const eat=(txt,line)=>{let out="";for(const ch of txt){if(ch==="{")depth++;if(ch==="}"){depth--;if(depth===0)break;}out+=ch;}if(out.trim()&&out.trim()!=="{")push(body,line,out);};
        eat(rest,i);i++;while(i<lines.length&&depth>0){eat(strip(lines[i]),i);i++;}
        methods[m[2]]={name:m[2],ret:m[1],params,body};continue;}
      const t=L.trim();if(t&&!/^(public\s+|final\s+)*class\b/.test(t)&&!/^import\b/.test(t)&&!/^[{}]+$/.test(t))push(top,i,t);i++;}
    const main=methods.main?methods.main.body:top;delete methods.main;return {methods,main};}
  function run(src){
    const S={frames:[],heap:[],out:"",steps:[],nid:1},prog=compile(src);let notes=[],hot={v:[],o:[]};
    const get=id=>S.heap.find(o=>o.id===id),fr=()=>S.frames[S.frames.length-1];
    const fail=(line,msg)=>{const e=new Error(msg);e.line=line;throw e;};
    const snap=(line,msg)=>{S.steps.push({line,msg,hot,frames:clone(S.frames),heap:clone(S.heap),out:S.out});hot={v:[],o:[]};if(S.steps.length>600)fail(line,"This program takes too many steps for the Lab.");};
    const add=o=>{o.id=S.nid++;S.heap.push(o);hot.o.push(o.id);return o.id;};
    const pooled=text=>{let o=S.heap.find(x=>x.zone==="pool"&&x.kind==="String"&&x.text===text);if(o){notes.push('"'+esc(text)+'" is already in the String pool, so the existing object #'+o.id+" is reused");hot.o.push(o.id);return o.id;}
      const id=add({kind:"String",text,zone:"pool"});notes.push('"'+esc(text)+'" is a literal: it is stored once in the String pool (#'+id+")");return id;};
    const esc=t=>t.length>24?t.slice(0,22)+"…":t;
    const boxed=(n,line)=>{if(n>=-128&&n<=127){let o=S.heap.find(x=>x.zone==="cache"&&x.val===n);if(o){notes.push(n+" is boxed by Integer.valueOf: −128..127 come from the Integer cache, so the same object #"+o.id+" is reused");hot.o.push(o.id);return {r:o.id};}
        const id=add({kind:"Integer",val:n,zone:"cache"});notes.push(n+" is boxed by Integer.valueOf: it is in the cache range −128..127, so the cached object #"+id+" is used");return {r:id};}
      const id=add({kind:"Integer",val:n,zone:"heap"});notes.push(n+" is outside the Integer cache (−128..127), so valueOf creates a new Integer #"+id);return {r:id};};
    const P=(t,v)=>({p:1,t,v}),NUL={n:1};
    const isStr=v=>v&&v.r&&get(v.r)&&get(v.r).kind==="String"||v&&v.ts!=null;
    const text=v=>{if(!v)return "";if(v.ts!=null)return v.ts;if(v.n)return "null";if(v.p)return v.t==="char"?v.v:v.t==="boolean"?String(v.v):v.t==="double"?(Number.isInteger(v.v)?v.v.toFixed(1):String(v.v)):String(v.v);
      const o=get(v.r);if(!o)return "?";if(o.kind==="String"||o.kind==="StringBuilder")return o.text;if(o.kind==="Integer")return String(o.val);
      const h=((o.id*2654435761)>>>0).toString(16).slice(0,7);return (o.kind==="int[]"?"[I":o.kind==="String[]"?"[Ljava.lang.String;":"["+o.kind[0].toUpperCase())+"@"+h;};
    const num=(v,line)=>{if(v.p)return v.t==="char"?v.v.charCodeAt(0):v.v;if(v.r&&get(v.r).kind==="Integer")return get(v.r).val;fail(line,"Expected a number here.");};
    const lookup=(name,line)=>{for(const v of fr().vars)if(v.name===name)return v;fail(line,"Unknown variable "+name+".");};
    const refsTo=id=>{let n=0;for(const f of S.frames)for(const v of f.vars)if(v.val&&v.val.r===id)n++;for(const o of S.heap)if(o.vals&&o.kind==="String[]")for(const e of o.vals)if(e&&e.r===id)n++;return n;};
    const orphan=(old,line)=>{if(old&&old.r){const o=get(old.r);if(o&&o.zone==="heap"&&!refsTo(o.id))notes.push("#"+o.id+" now has no references: it is garbage and the GC may remove it");}};
    /* ---------- expressions ---------- */
    function evalExpr(src,line,ctx){ctx=ctx||{};const T=[];TOK.lastIndex=0;let m;const s=src.trim();
      while(TOK.lastIndex<s.length){const p=TOK.lastIndex;m=TOK.exec(s);if(!m){fail(line,"The Lab can't read “"+s.slice(p,p+12)+"”.");}T.push(m[1]);}
      let k=0;const peek=()=>T[k],next=()=>T[k++],want=t=>{if(T[k]!==t)fail(line,"Expected “"+t+"” in: "+s);k++;};
      const args=()=>{const a=[];want("(");if(peek()!==")"){a.push(or());while(peek()===","){next();a.push(or());}}want(")");return a;};
      function or(){let a=and();while(peek()==="||"){next();const b=and();a=P("boolean",a.v||b.v);}return a;}
      function and(){let a=eq();while(peek()==="&&"){next();const b=eq();a=P("boolean",a.v&&b.v);}return a;}
      function eq(){const lit=x=>x.ts!=null&&x.c?{r:pooled(x.ts),c:1}:x;let a=rel();while(peek()==="=="||peek()==="!="){const op=next();let b=rel(),r;a=lit(a);b=lit(b);
          if(a.p&&b.p||(a.p&&b.r)||(a.r&&b.p)){r=num(a,line)===num(b,line);if(a.r||b.r)notes.push("An Integer compared with an int is unboxed, so == compares the values");}
          else if(a.n||b.n)r=!!(a.n&&b.n);else if(a.ts!=null||b.ts!=null){r=false;notes.push("A String computed at run time is a separate object, so == is false");}
          else{r=a.r===b.r;notes.push(r?"== compares references: both point to the same object #"+a.r+" → true":"== compares references: #"+a.r+" and #"+b.r+" are different objects → false");hot.o.push(a.r,b.r);}
          a=P("boolean",op==="=="?r:!r);}return a;}
      function rel(){let a=add2();while(["<",">","<=",">="].includes(peek())){const op=next(),b=add2(),x=num(a,line),y=num(b,line);a=P("boolean",op==="<"?x<y:op===">"?x>y:op==="<="?x<=y:x>=y);}return a;}
      function add2(){let a=mul();while(peek()==="+"||peek()==="-"){const op=next(),b=mul();
          if(op==="+"&&(isStr(a)||isStr(b))){const t=text(a)+text(b);
            if(a.c&&b.c&&!ctx.print){const id=pooled(t);notes.push("Both sides are literals, so javac folds them into one constant at compile time");a={r:id,c:1};}
            else if(ctx.print){a=a.c&&b.c?{ts:t,c:1}:{ts:t};}
            else{const id=add({kind:"String",text:t,zone:"heap"});notes.push("+ on Strings at run time builds a new String #"+id+" (the original Strings never change: they are immutable)");a={r:id};}}
          else{const x=num(a,line),y=num(b,line),dbl=a.t==="double"||b.t==="double",lng=a.t==="long"||b.t==="long",z=op==="+"?x+y:x-y;a=P(dbl?"double":lng?"long":"int",dbl||lng?z:z|0);}}return a;}
      function mul(){let a=un();while(["*","/","%"].includes(peek())){const op=next(),b=un(),x=num(a,line),y=num(b,line),dbl=a.t==="double"||b.t==="double",lng=a.t==="long"||b.t==="long";
          if(!dbl&&op!=="*"&&y===0)fail(line,"ArithmeticException: / by zero");const z=op==="*"?(dbl||lng?x*y:Math.imul(x,y)):op==="/"?(dbl?x/y:Math.trunc(x/y)):x%y;a=P(dbl?"double":lng?"long":"int",dbl||lng?z:z|0);}return a;}
      function un(){if(peek()==="!"){next();const a=un();return P("boolean",!a.v);}if(peek()==="-"){next();const a=un(),z=-num(a,line);return P(a.t||"int",(a.t||"int")==="int"?z|0:z);}return post(prim());}
      function post(v){for(;;){
          if(peek()==="["){next();const i=num(or(),line);want("]");if(v.n)fail(line,"NullPointerException: the array is null");const o=get(v.r);
            if(!o||!o.vals)fail(line,"Only arrays can be indexed.");if(i<0||i>=o.vals.length)fail(line,"ArrayIndexOutOfBoundsException: Index "+i+" out of bounds for length "+o.vals.length);
            hot.o.push(o.id);const e=o.vals[i];v=o.kind==="String[]"||o.kind==="Integer[]"?(e||NUL):P(o.kind.replace("[]",""),e);continue;}
          if(peek()==="."){next();const name=next();
            if(peek()!=="("){if(name==="length"){const o=v.r&&get(v.r);if(o&&o.vals)return P("int",o.vals.length);}fail(line,"Unknown field ."+name+".");}
            const A=args();v=callMethod(v,name,A);continue;}
          return v;}}
      function prim(){const t=next();if(t===undefined)fail(line,"The expression is incomplete.");
        if(/^\d+\.\d+$/.test(t))return P("double",parseFloat(t));if(/^\d+$/.test(t))return P("int",parseInt(t,10));
        if(t[0]==='"'){const str=JSON.parse(t);if(ctx.print&&peek()!=="."&&!ctx.keepLit)return {ts:str,c:1};return {r:pooled(str),c:1};}
        if(t[0]==="'")return P("char",t.length===3?t[1]:JSON.parse('"'+t.slice(1,-1)+'"'));
        if(t==="true"||t==="false")return P("boolean",t==="true");if(t==="null")return NUL;
        if(t==="("){const v=or();want(")");return v;}
        if(t==="{"){const items=[];if(peek()!=="}"){items.push(or());while(peek()===","){next();items.push(or());}}want("}");return mkArray(ctx.arr||"int[]",items);}
        if(t==="new"){const ty=next();
          if(peek()==="["){next();if(peek()==="]"){next();want("{");const items=[];if(peek()!=="}"){items.push(or());while(peek()===","){next();items.push(or());}}want("}");return mkArray(ty+"[]",items);}
            const n=num(or(),line);want("]");if(n<0)fail(line,"NegativeArraySizeException: "+n);
            const kind=ty+"[]",ref=kind==="String[]"||kind==="Integer[]",vals=Array.from({length:n},()=>ref?null:ty==="boolean"?false:ty==="char"?"\u0000":ty==="double"?0:0);
            const id=add({kind,vals,zone:"heap"});notes.push("new "+ty+"["+n+"] creates an array object #"+id+" on the heap; every element starts at its default ("+(ref?"null":ty==="boolean"?"false":"0")+")");return {r:id};}
          const A=args();
          if(ty==="String"){const t2=A.length?text(A[0]):"";const id=add({kind:"String",text:t2,zone:"heap"});notes.push("new String(…) always creates a new object #"+id+" on the heap, even when the same text is in the pool");return {r:id};}
          if(ty==="StringBuilder"){const t2=A.length&&!(A[0].p&&A[0].t==="int")?text(A[0]):"",cap=A.length&&A[0].p&&A[0].t==="int"?A[0].v:16+t2.length;
            const id=add({kind:"StringBuilder",text:t2,cap,zone:"heap"});notes.push("new StringBuilder creates a mutable object #"+id+" (capacity "+cap+")");return {r:id};}
          if(ty==="Integer")fail(line,"new Integer(…) is deprecated and removed in modern Java; use Integer.valueOf(…).");
          fail(line,"The Lab can't create a "+ty+".");}
        if(t==="Integer"&&peek()==="."){next();const f=next(),A=args();if(f==="valueOf")return boxed(num(A[0],line),line);if(f==="parseInt")return P("int",parseInt(text(A[0]),10));fail(line,"Integer."+f+" isn't supported.");}
        if(t==="String"&&peek()==="."){next();const f=next(),A=args();if(f==="valueOf"){const s2=text(A[0]);if(ctx.print)return {ts:s2};const id=add({kind:"String",text:s2,zone:"heap"});notes.push("String.valueOf builds a new String #"+id);return {r:id};}fail(line,"String."+f+" isn't supported.");}
        if(t==="Arrays"&&peek()==="."){next();const f=next(),A=args(),o=A[0]&&A[0].r&&get(A[0].r);if(!o||!o.vals)fail(line,"Arrays."+f+" needs an array.");
          if(f==="toString"){const s2="["+o.vals.map(e=>o.kind==="String[]"?(e?text(e):"null"):String(e)).join(", ")+"]";if(ctx.print)return {ts:s2};const id=add({kind:"String",text:s2,zone:"heap"});return {r:id};}
          if(f==="sort"){o.vals.sort((x,y)=>o.kind==="String[]"?text(x).localeCompare(text(y)):x-y);hot.o.push(o.id);notes.push("Arrays.sort sorts the array object #"+o.id+" in place");return {ts:""};}
          if(f==="fill"){o.vals=o.vals.map(()=>A[1].p?A[1].v:A[1]);hot.o.push(o.id);notes.push("Arrays.fill writes into array #"+o.id);return {ts:""};}
          fail(line,"Arrays."+f+" isn't supported.");}
        if(/^[A-Za-z_]\w*$/.test(t)){if(peek()==="("&&prog.methods[t]){const A=args();return callUser(t,A,line);}
          const v=lookup(t,line);hot.v.push(v.name);if(v.val&&v.val.un)fail(line,"variable "+t+" might not have been initialized");return v.val;}
        fail(line,"Unexpected “"+t+"”.");}
      function mkArray(kind,items){const ref=kind==="String[]"||kind==="Integer[]";const vals=items.map(v=>ref?(v.n?null:v.ts!=null?{r:add({kind:"String",text:v.ts,zone:"heap"})}:{r:v.r}):num(v,line));
        const id=add({kind,vals,zone:"heap"});notes.push("The array initializer creates an array object #"+id+" with "+items.length+" elements");return {r:id};}
      function callMethod(v,name,A){if(v.n)fail(line,"NullPointerException: cannot call ."+name+"() on null");
        if(v.ts!=null){const o={kind:"String",text:v.ts};return strMethod(o,null,name,A);}
        const o=get(v.r);if(!o)fail(line,"Unknown object.");hot.o.push(o.id);
        if(o.kind==="String")return strMethod(o,v,name,A);
        if(o.kind==="StringBuilder"){
          if(name==="append"){o.text+=text(A[0]);if(o.text.length>o.cap){const old=o.cap;o.cap=Math.max(old*2+2,o.text.length);notes.push("The text no longer fits, so the internal array grows from "+old+" to "+o.cap);}
            notes.push("append changes the same StringBuilder #"+o.id+" in place: no new object");return v;}
          if(name==="insert"){const i=num(A[0],line);o.text=o.text.slice(0,i)+text(A[1])+o.text.slice(i);notes.push("insert edits StringBuilder #"+o.id+" in place");return v;}
          if(name==="reverse"){o.text=[...o.text].reverse().join("");notes.push("reverse flips StringBuilder #"+o.id+" in place");return v;}
          if(name==="toString"){if(ctx.print)return {ts:o.text};const id=add({kind:"String",text:o.text,zone:"heap"});notes.push("toString() copies the characters into a new String #"+id);return {r:id};}
          if(name==="length")return P("int",o.text.length);if(name==="capacity")return P("int",o.cap);if(name==="charAt")return P("char",o.text[num(A[0],line)]);
          fail(line,"StringBuilder."+name+" isn't supported in the Lab.");}
        if(o.kind==="Integer"){if(name==="equals"){const r=A[0].r&&get(A[0].r)&&get(A[0].r).kind==="Integer"&&get(A[0].r).val===o.val;notes.push("equals compares the int values → "+r);return P("boolean",r);}
          if(name==="intValue")return P("int",o.val);fail(line,"Integer."+name+" isn't supported.");}
        if(o.vals){if(name==="clone"){const id=add({kind:o.kind,vals:o.vals.slice(),zone:"heap"});notes.push("clone() makes a new array #"+id+" with the same elements (a shallow copy)");return {r:id};}
          if(name==="equals"){const r=A[0].r===o.id;notes.push("Arrays don't override equals, so it is the same as == → "+r);return P("boolean",r);}
          fail(line,"Arrays have no ."+name+"() in the Lab (try Arrays.toString or .clone()).");}
        fail(line,"."+name+"() isn't supported.");}
      function strMethod(o,v,name,A){const s2=o.text,mk=t=>{if(ctx.print)return {ts:t};const id=add({kind:"String",text:t,zone:"heap"});notes.push(name+"() returns a new String #"+id+": the original is unchanged");return {r:id};};
        switch(name){case "length":return P("int",s2.length);case "isEmpty":return P("boolean",!s2.length);
          case "charAt":{const i=num(A[0],line);if(i<0||i>=s2.length)fail(line,"StringIndexOutOfBoundsException: Index "+i+" out of bounds for length "+s2.length);return P("char",s2[i]);}
          case "equals":{const r=isStr(A[0])&&text(A[0])===s2;notes.push("equals compares the characters → "+r);return P("boolean",r);}
          case "equalsIgnoreCase":return P("boolean",isStr(A[0])&&text(A[0]).toLowerCase()===s2.toLowerCase());
          case "hashCode":{let h=0;for(const c of s2)h=(h*31+c.charCodeAt(0))|0;return P("int",h);}
          case "intern":{if(!v)return {ts:s2};let p=S.heap.find(x=>x.zone==="pool"&&x.text===s2);
            if(p){notes.push('intern() returns the pooled "'+esc(s2)+'" #'+p.id);hot.o.push(p.id);return {r:p.id};}
            o.zone="pool";notes.push('"'+esc(s2)+'" was not in the pool yet, so intern() records this object #'+o.id+" in the pool (Java 7+: no copy)");return v;}
          case "toUpperCase":return s2===s2.toUpperCase()&&v?(notes.push("toUpperCase() returns the same object when nothing changes"),v):mk(s2.toUpperCase());
          case "toLowerCase":return s2===s2.toLowerCase()&&v?(notes.push("toLowerCase() returns the same object when nothing changes"),v):mk(s2.toLowerCase());
          case "trim":return mk(s2.trim());case "concat":return text(A[0])===""&&v?(notes.push("concat(\"\") returns the same object"),v):mk(s2+text(A[0]));
          case "substring":{const b=num(A[0],line),e=A[1]?num(A[1],line):s2.length;if(b<0||e>s2.length||b>e)fail(line,"StringIndexOutOfBoundsException: begin "+b+", end "+e+", length "+s2.length);if(b===0&&e===s2.length&&v){notes.push("substring of the whole String returns the same object");return v;}return mk(s2.slice(b,e));}
          case "contains":return P("boolean",s2.includes(text(A[0])));case "indexOf":return P("int",s2.indexOf(text(A[0])));
          case "startsWith":return P("boolean",s2.startsWith(text(A[0])));case "replace":return mk(s2.split(text(A[0])).join(text(A[1])));
          case "compareTo":{const t2=text(A[0]);for(let i=0;i<Math.min(s2.length,t2.length);i++)if(s2[i]!==t2[i])return P("int",s2.charCodeAt(i)-t2.charCodeAt(i));return P("int",s2.length-t2.length);}
        }fail(line,"String."+name+"() isn't supported in the Lab.");}
      const v=or();if(k<T.length)fail(line,"The Lab can't read “"+T.slice(k).join(" ")+"”.");return v;}
    /* ---------- statements ---------- */
    function coerce(type,v,line){if(type==="Integer"&&v.p){return boxed(num(v,line),line);}
      if(PRIM.has(type)&&v.r&&get(v.r).kind==="Integer"){notes.push("The Integer is unboxed to an int value");return P("int",get(v.r).val);}
      if(type==="double"&&v.p&&v.t==="int")return P("double",v.v);if(type==="long"&&v.p&&v.t==="int")return P("long",v.v);if(type==="int"&&v.p&&v.t==="char")return P("int",v.v.charCodeAt(0));
      if(type==="char"&&v.p&&v.t==="int")return P("char",String.fromCharCode(v.v));
      if(v.ts!=null){const id=add({kind:"String",text:v.ts,zone:"heap"});return {r:id};}
      const out=Object.assign({},v);delete out.c;return out;}
    const show=v=>v.n?"null":v.p?(v.t==="char"?"'"+v.v+"'":String(v.v)):v.r?"→ #"+v.r:"";
    function exec(st){const s=st.src.trim(),line=st.line;notes=[];let m;
      if(/^(if|else|for|while|do|switch|try|catch)\b/.test(s))fail(line,"if / loops aren't supported in the Lab yet: write the steps out one by one.");
      if(m=s.match(/^System\.out\.print(ln)?\s*\(([\s\S]*)\)$/)){const v=m[2].trim()?evalExpr(m[2],line,{print:true}):{ts:""};const t=text(v);S.out+=t+(m[1]?"\n":"");
        snap(line,"Prints "+(t===""?"an empty line":t)+(notes.length?". "+notes.join(". "):""));return;}
      if(/^System\.gc\s*\(\s*\)$/.test(s)){gc(line);return;}
      if(m=s.match(/^return\b\s*([\s\S]*)$/)){const v=m[1].trim()?evalExpr(m[1],line):undefined;throw {ret:v,line};}
      if(m=s.match(DECL)){const [,type,name,rhs]=m;if(fr().vars.some(v=>v.name===name))fail(line,"variable "+name+" is already defined.");
        let v;if(rhs===undefined){v={un:1};notes.push(name+" is declared but not assigned yet");}
        else{const raw=evalExpr(rhs,line,{arr:type.endsWith("[]")?type:null});v=coerce(type,raw,line);if(/^final\s/.test(s)&&raw.c&&v.r){v.c=1;notes.push(name+" is final and set to a constant, so it is a compile-time constant");}}
        const t2=type==="var"?(v.p?v.t:v.r?get(v.r).kind:"Object"):type;fr().vars.push({name,type:t2,val:v});hot.v.push(name);
        snap(line,(notes.length?notes.join(". ")+". ":"")+(PRIM.has(t2)?name+" is a primitive "+t2+": the value "+show(v)+" is stored right in the stack frame":v.r?name+" holds a reference to object #"+v.r+" (the arrow)":name+" is "+(v.un?"not assigned yet":"null")));return;}
      if(m=s.match(/^([A-Za-z_]\w*)\s*\[([\s\S]+)\]\s*=\s*([\s\S]+)$/)){const ar=lookup(m[1],line);if(ar.val.n)fail(line,"NullPointerException: "+m[1]+" is null");const o=get(ar.val.r),i=num(evalExpr(m[2],line),line);
        if(i<0||i>=o.vals.length)fail(line,"ArrayIndexOutOfBoundsException: Index "+i+" out of bounds for length "+o.vals.length);
        const v=evalExpr(m[3],line);const ref=o.kind==="String[]"||o.kind==="Integer[]";const old=o.vals[i];o.vals[i]=ref?(v.n?null:{r:coerce("String",v,line).r}):num(v,line);hot.o.push(o.id);
        if(ref)orphan(old,line);
        snap(line,m[1]+"["+i+"] = "+(ref?(v.n?"null":"→ #"+o.vals[i].r):o.vals[i])+": this changes the array object #"+o.id+(refsTo(o.id)>1?", so every variable pointing to it sees the change":"")+(notes.length?". "+notes.join(". "):""));return;}
      if(m=s.match(/^([A-Za-z_]\w*)\s*(\+\+|--)$/)||s.match(/^(\+\+|--)\s*([A-Za-z_]\w*)$/)){const name=/\w/.test(m[1][0])?m[1]:m[2],op=/\w/.test(m[1][0])?m[2]:m[1],v=lookup(name,line);
        v.val=P(v.val.t||"int",num(v.val,line)+(op==="++"?1:-1));hot.v.push(name);snap(line,name+" "+op+": the value in the frame becomes "+v.val.v);return;}
      if(m=s.match(/^([A-Za-z_]\w*)\s*([-+*\/])=\s*([\s\S]+)$/)){const v=lookup(m[1],line),r=evalExpr(m[1]+m[2]+"("+m[3]+")",line),old=v.val;v.val=coerce(v.type,r,line);hot.v.push(m[1]);orphan(old,line);
        snap(line,m[1]+" "+m[2]+"= …: "+(v.val.r?m[1]+" now points to #"+v.val.r:"now "+show(v.val))+(notes.length?". "+notes.join(". "):""));return;}
      if(m=s.match(/^([A-Za-z_]\w*)\s*=\s*([\s\S]+)$/)){const v=lookup(m[1],line),r=evalExpr(m[2],line,{arr:v.type.endsWith("[]")?v.type:null}),old=v.val;v.val=coerce(v.type,r,line);hot.v.push(m[1]);
        const alias=v.val.r&&/^[A-Za-z_]\w*$/.test(m[2].trim())&&!PRIM.has(v.type);orphan(old,line);
        if(S.frames.length>1&&prog.methods[fr().name]&&prog.methods[fr().name].params.some(p=>p.name===m[1]))notes.push("Only this frame's copy of "+m[1]+" changes: the caller's variable is untouched");
        snap(line,(alias?m[1]+" = "+m[2].trim()+" copies the reference, not the object: both now point to #"+v.val.r:v.val.r?m[1]+" now points to #"+v.val.r:v.val.n?m[1]+" is now null: it points to nothing":m[1]+" is now "+show(v.val))+(notes.length?". "+notes.join(". "):""));return;}
      const um=s.match(/^([A-Za-z_]\w*)\s*\(/);if(um&&prog.methods[um[1]]){evalExpr(s,line);return;}
      const v=evalExpr(s,line);snap(line,(notes.length?notes.join(". "):"Done")+(v&&v.p?" (result "+show(v)+" is not used)":""));}
    function callUser(name,A,line){const mt=prog.methods[name];if(A.length!==mt.params.length)fail(line,name+" expects "+mt.params.length+" argument(s).");if(S.frames.length>12)fail(line,"StackOverflowError (too deep for the Lab)");
      const before=notes;notes=[];const f={name,vars:[]};
      mt.params.forEach((p,i)=>{const v=coerce(p.type,A[i],line);f.vars.push({name:p.name,type:p.type,val:v});});
      S.frames.push(f);hot.v=mt.params.map(p=>p.name);
      snap(line,name+"(…) is called: a new stack frame is pushed. Each parameter gets a COPY of the argument: "+mt.params.map((p,i)=>p.name+" = "+show(f.vars[i].val)).join(", ")+(f.vars.some(v=>v.val.r)?" (a copied reference still points to the same object)":""));
      let ret;try{for(const st of mt.body)exec(st);}catch(e){if(e&&e.ret!==undefined||e&&"ret" in e)ret=e.ret;else throw e;}
      S.frames.pop();notes=[];snap(mt.body.length?mt.body[mt.body.length-1].line:line,name+" returns"+(ret?" "+show(ret):"")+": its frame is popped and its local variables are gone. Changes made to objects stay.");
      notes=before;return ret||{ts:""};}
    function gc(line){const live=new Set(),mark=id=>{if(live.has(id))return;live.add(id);const o=get(id);if(o&&o.kind==="String[]")o.vals.forEach(e=>e&&mark(e.r));};
      S.frames.forEach(f=>f.vars.forEach(v=>v.val&&v.val.r&&mark(v.val.r)));S.heap.forEach(o=>{if(o.zone!=="heap")mark(o.id);});
      const dead=S.heap.filter(o=>!live.has(o.id));
      if(!dead.length){snap(line,"System.gc(): every object is still reachable from a variable (or the pool), so nothing is collected.");return;}
      dead.forEach(o=>{o.garbage=1;hot.o.push(o.id);});snap(line,"System.gc() marks the unreachable objects "+dead.map(o=>"#"+o.id).join(", ")+": no variable points to them any more.");
      S.heap=S.heap.filter(o=>live.has(o.id));snap(line,"…and sweeps them away. Pool Strings and cached Integers stay, because the JVM itself still references them.");}
    S.frames.push({name:"main",vars:[]});
    try{snap(-1,"The program starts: main gets a frame on the stack. Primitives live inside frames; objects live on the heap.");
      for(const st of prog.main)exec(st);S.frames.pop();snap(-1,"main returns: its frame is popped and the program ends.");}
    catch(e){if(e&&e.ret!==undefined||e&&"ret" in e){S.frames.pop();snap(-1,"main returns.");}else{S.error={line:e.line==null?-1:e.line,msg:e.message||String(e)};}}
    return S;}
  return {compile,run};
})();

/* v23 Memory Lab UI (#mlApp on the Practice page): an editable code pane (the line marker glides to the running statement), Step /
   Back / Run / Reset, a "Run GC" button that adds System.gc(), the stack (frames, primitives, reference dots) and the heap in three
   areas (String pool, Integer cache, objects) with arrows from every reference, the console, and a plain-English note per step.
   It reuses the runner's .rz-* look. The code is saved in this browser (js1-memlab). */
(function(){const host=document.getElementById("mlApp");if(!host)return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const st0={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  const EX=[
    ["String pool",'String a = "java";\nString b = "java";\nString c = new String("java");\nSystem.out.println(a == b);\nSystem.out.println(a == c);\nSystem.out.println(a.equals(c));\nString d = c.intern();\nSystem.out.println(a == d);'],
    ["Integer cache","Integer x = 127;\nInteger y = 127;\nInteger p = 128;\nInteger q = 128;\nSystem.out.println(x == y);\nSystem.out.println(p == q);\nSystem.out.println(p.equals(q));"],
    ["Arrays & aliasing","int[] a = {1, 2, 3};\nint[] b = a;\nb[0] = 99;\nSystem.out.println(a[0]);\nint[] c = a.clone();\nc[1] = 7;\nSystem.out.println(a[1]);\nSystem.out.println(Arrays.toString(c));"],
    ["Pass by value","public class PassByValue {\n    static void change(int[] arr, int n) {\n        arr[0] = 42;\n        n = 100;\n        arr = new int[2];\n    }\n\n    public static void main(String[] args) {\n        int[] nums = {1, 2, 3};\n        int count = 5;\n        change(nums, count);\n        System.out.println(nums[0]);\n        System.out.println(count);\n    }\n}"],
    ["StringBuilder",'String s = "Hi";\ns = s + "!";\nStringBuilder sb = new StringBuilder("Hi");\nsb.append("!");\nsb.append(" Java");\nString t = sb.toString();\nSystem.out.println(s);\nSystem.out.println(t);'],
    ["Garbage collection",'String s = new String("temp");\nint[] big = new int[4];\ns = null;\nbig = new int[2];\nSystem.gc();'],
    ["String[] of refs",'String[] names = new String[3];\nnames[0] = "Ann";\nnames[1] = new String("Bob");\nnames[2] = names[0];\nSystem.out.println(names[0] == names[2]);\nnames[1] = null;\nSystem.gc();']];
  host.innerHTML='<div class="ml-ex" role="group" aria-label="Examples">'+EX.map((e,i)=>'<button type="button" class="chip" data-ex="'+i+'">'+esc(e[0])+"</button>").join("")+"</div>"+
    '<div class="rz ml"><div class="rz-head"><span class="rz-dots"><i></i><i></i><i></i></span><span class="rz-file">MemoryLab.java · edit me</span><span class="rz-ct"></span></div>'+
    '<div class="rz-main"><div class="ml-ed"><div class="ml-bar"></div><div class="ml-gut" aria-hidden="true"></div><textarea spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Java code"></textarea></div>'+
    '<div class="rz-mem"><svg class="rz-arw" aria-hidden="true"><defs><marker id="mlM" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker></defs><g></g></svg>'+
    '<div class="rz-col"><h5>Stack</h5><div class="rz-stack"></div></div><div class="rz-col"><h5>Heap</h5><div class="rz-heap"></div></div></div></div>'+
    '<div class="rz-msg" aria-live="polite"></div><div class="rz-foot"><div class="rz-out"><span>Console</span><pre></pre></div>'+
    '<div class="rz-ctl"><button type="button" class="btn" data-a="reset" title="Start again">⟲</button><button type="button" class="btn" data-a="prev">◀ Back</button>'+
    '<button type="button" class="btn pri" data-a="next">Step ▶</button><button type="button" class="btn" data-a="play">▶ Run</button><button type="button" class="btn" data-a="gc" title="Add System.gc() at the end and run it">🗑 Run GC</button></div></div>'+
    '<div class="rz-prog"><i></i></div></div>';
  const $h=s=>host.querySelector(s),ta=$h("textarea"),gut=$h(".ml-gut"),bar=$h(".ml-bar"),stack=$h(".rz-stack"),heap=$h(".rz-heap"),mem=$h(".rz-mem"),g=$h(".rz-arw g"),
    msg=$h(".rz-msg"),out=$h(".rz-out pre"),ct=$h(".rz-ct"),prog=$h(".rz-prog i");
  ta.value=st0.get("js1-memlab")||EX[0][1];
  let S=null,src=null,k=0,prev=null,timer=null;const LH=22.75;
  const lines=()=>{const n=ta.value.split("\n").length;gut.innerHTML=Array.from({length:n},(_,i)=>"<div>"+(i+1)+"</div>").join("");};
  const sync=()=>{gut.scrollTop=ta.scrollTop;bar.style.marginTop=(-ta.scrollTop)+"px";};
  function compile(){if(src===ta.value&&S)return;src=ta.value;st0.set("js1-memlab",src);S=MLC.run(src);k=0;prev=null;}
  const stop=()=>{clearInterval(timer);timer=null;$h('[data-a="play"]').textContent="▶ Run";};
  const val=v=>!v||v.un?"<span>—</span>":v.n?'<b class="nul">null</b>':v.r?'<i class="rz-ref" data-r="'+v.r+'"></i>':"<b>"+esc(v.t==="char"?"'"+v.v+"'":v.t==="double"&&Number.isInteger(v.v)?v.v.toFixed(1):String(v.v))+"</b>";
  function obj(o,hot){const cls="rz-o"+(o.kind==="String"?" str":"")+(hot.includes(o.id)?" hot":"")+(o.garbage?" garb":""),id=" #"+o.id;
    const cells=(xs,ref)=>'<span class="rz-cells">'+xs.map((c,i)=>'<i>'+(ref?(c?'<i class="rz-ref" data-r="'+c.r+'"></i>':"null"):esc(c===" "?"␣":c===""?"":String(c)))+"<em>"+i+"</em></i>").join("")+"</span>";
    if(o.kind==="String")return '<div class="'+cls+'" data-id="'+o.id+'"><small>String'+id+'</small><b>"'+esc(o.text)+'"</b></div>';
    if(o.kind==="Integer")return '<div class="'+cls+'" data-id="'+o.id+'"><small>Integer'+id+"</small><b>"+o.val+"</b></div>";
    if(o.kind==="StringBuilder"){const xs=o.text.split("").concat(Array(Math.max(0,Math.min(o.cap,24)-o.text.length)).fill(""));
      return '<div class="'+cls+'" data-id="'+o.id+'"><small>StringBuilder'+id+" · length "+o.text.length+" · capacity "+o.cap+"</small>"+cells(xs.slice(0,24),false).replace(/<em>\d+<\/em>/g,"")+"</div>";}
    return '<div class="'+cls+'" data-id="'+o.id+'"><small>'+o.kind.replace("[]","["+o.vals.length+"]")+id+"</small>"+cells(o.vals,o.kind==="String[]"||o.kind==="Integer[]")+"</div>";}
  function arrows(){const mr=mem.getBoundingClientRect();let h="";
    mem.querySelectorAll(".rz-ref[data-r]").forEach(r=>{const t=heap.querySelector('.rz-o[data-id="'+r.dataset.r+'"]');if(!t)return;const a=r.getBoundingClientRect(),b=t.getBoundingClientRect();
      const x1=a.left+a.width/2-mr.left,y1=a.top+a.height/2-mr.top,right=b.left>a.right,x2=(right?b.left-2:b.right+2)-mr.left,y2=Math.min(b.bottom-8,Math.max(b.top+8,y1))-mr.top,
        dx=right?Math.max(30,(x2-x1)*.5):40,hot=r.closest(".hot")||t.classList.contains("hot");
      h+='<path class="'+(hot?"hot":"")+'" marker-end="url(#mlM)" d="M'+x1.toFixed(1)+" "+y1.toFixed(1)+" C"+(x1+dx).toFixed(1)+" "+y1.toFixed(1)+" "+(right?x2-dx:x2+dx).toFixed(1)+" "+y2.toFixed(1)+" "+x2.toFixed(1)+" "+y2.toFixed(1)+'"/>';});
    g.innerHTML=h;}
  function draw(){compile();const steps=S.steps,last=steps.length-1;k=Math.max(0,Math.min(k,last));const s=steps[k],pv=prev,end=k===last,err=end&&S.error;
    const L=err?S.error.line:s.line;[...gut.children].forEach((d,i)=>{d.className=i===L?(err?"err":"cur"):"";});
    bar.classList.toggle("on",L>=0);bar.classList.toggle("err",!!err);if(L>=0){bar.style.transform="translateY("+(L*LH)+"px)";const y=12+L*LH;if(y<ta.scrollTop||y>ta.scrollTop+ta.clientHeight-30)ta.scrollTop=Math.max(0,y-ta.clientHeight/2);}
    sync();
    stack.innerHTML=s.frames.map((fr,fi)=>{const pf=pv&&pv.frames[fi],isNew=!pf||pf.name!==fr.name;
      return '<div class="rz-fr'+(isNew&&pv?" push":"")+(fi===s.frames.length-1?" top":"")+'"><div class="rz-fh">'+esc(fr.name)+"()</div>"+
        (fr.vars.map(v=>{const o=pf&&!isNew?pf.vars.find(x=>x.name===v.name):null,chg=pv&&(!o||JSON.stringify(o.val)!==JSON.stringify(v.val));
          return '<div class="rz-v'+(chg?" chg":"")+(fi===s.frames.length-1&&s.hot.v.includes(v.name)?" hot":"")+'"><span><em>'+esc(v.type)+"</em>"+esc(v.name)+"</span>"+val(v.val)+"</div>";}).join("")||'<div class="rz-v e"><span>no variables yet</span></div>')+"</div>";}).reverse().join("")||'<div class="rz-empty">the stack is empty: the program has ended</div>';
    const ph=pv?pv.heap:[],grp=[["String pool",o=>o.zone==="pool"],["Integer cache · −128…127",o=>o.zone==="cache"],["Objects",o=>o.zone==="heap"]];
    heap.innerHTML=grp.map(([t,f])=>{const os=s.heap.filter(f);if(!os.length)return "";
      return '<div class="rz-area"><div class="rz-at">'+t+"</div>"+os.map(o=>{const p=ph.find(x=>x.id===o.id);return obj(o,s.hot.o).replace('class="rz-o','class="rz-o'+(pv&&!p?" pop":p&&JSON.stringify(p)!==JSON.stringify(o)&&!o.garbage?" chg":""));}).join("")+"</div>";}).join("")||'<div class="rz-empty">nothing on the heap yet</div>';
    msg.classList.toggle("err",!!err);msg.innerHTML=err?"⚠ Line "+(S.error.line+1)+": "+esc(S.error.msg):esc(s.msg);
    const newOut=pv&&s.out.length>pv.out.length?s.out.slice(pv.out.length):"";
    out.innerHTML=esc(newOut?pv.out:s.out)+(newOut?'<span class="new">'+esc(newOut)+"</span>":"");
    ct.textContent="step "+(k+1)+" / "+steps.length;prog.style.transform="scaleX("+((k+1)/steps.length).toFixed(3)+")";
    $h('[data-a="prev"]').disabled=k===0;$h('[data-a="next"]').disabled=end;
    requestAnimationFrame(arrows);prev=s;}
  host.addEventListener("click",e=>{const ex=e.target.closest("[data-ex]");if(ex){stop();ta.value=EX[+ex.dataset.ex][1];lines();src=null;draw();return;}
    const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;compile();
    if(a==="next"){stop();k++;draw();}else if(a==="prev"){stop();k--;prev=null;draw();}else if(a==="reset"){stop();k=0;prev=null;draw();}
    else if(a==="play"){if(timer){stop();return;}if(k>=S.steps.length-1)k=-1;b.textContent="❚❚ Pause";timer=setInterval(()=>{if(k>=S.steps.length-1){stop();return;}k++;draw();},1100);}
    else if(a==="gc"){stop();const P=MLC.compile(ta.value),lastSt=P.main[P.main.length-1],Ls=ta.value.split("\n");
      if(!lastSt){Ls.push("System.gc();");}else{const ind=(Ls[lastSt.line].match(/^\s*/)||[""])[0];Ls.splice(lastSt.line+1,0,ind+"System.gc();");}
      ta.value=Ls.join("\n");lines();src=null;compile();k=S.steps.length-1;draw();}});
  ta.addEventListener("input",()=>{lines();stop();});ta.addEventListener("scroll",sync,{passive:true});
  ta.addEventListener("keydown",e=>{if(e.key==="Tab"){e.preventDefault();const p=ta.selectionStart;ta.setRangeText("    ",p,ta.selectionEnd,"end");lines();}
    if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();compile();k++;draw();}});
  addEventListener("resize",()=>requestAnimationFrame(arrows),{passive:true});
  lines();draw();
})();

/* v23 Algorithm race (#raceApp on the Practice page): two sorting algorithms sort copies of the same array side by side. Each
   algorithm is first run to a trace of operations (c = compare i j, s = swap i j, w = write i value, d = element i is in its final
   place); both lanes then replay the same number of operations per frame, so the one that needs fewer operations wins. Bars light
   up amber for a comparison, pink for a write, green when final. Counters, a winner banner and a "why" verdict built from each
   algorithm's best / average / worst case and the data pattern. */
(function(){const host=document.getElementById("raceApp");if(!host)return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const ALG={
    bubble:{n:"Bubble sort",b:"O(n)",a:"O(n²)",w:"O(n²)",st:true,run(a,o){const n=a.length;for(let i=0;i<n-1;i++){let sw=false;for(let j=0;j<n-1-i;j++){o.push(["c",j,j+1]);if(a[j]>a[j+1]){[a[j],a[j+1]]=[a[j+1],a[j]];o.push(["s",j,j+1]);sw=true;}}o.push(["d",n-1-i]);if(!sw)break;}}},
    selection:{n:"Selection sort",b:"O(n²)",a:"O(n²)",w:"O(n²)",st:false,run(a,o){const n=a.length;for(let i=0;i<n-1;i++){let m=i;for(let j=i+1;j<n;j++){o.push(["c",m,j]);if(a[j]<a[m])m=j;}if(m!==i){[a[i],a[m]]=[a[m],a[i]];o.push(["s",i,m]);}o.push(["d",i]);}}},
    insertion:{n:"Insertion sort",b:"O(n)",a:"O(n²)",w:"O(n²)",st:true,run(a,o){for(let i=1;i<a.length;i++){const v=a[i];let j=i-1;while(j>=0){o.push(["c",j,i]);if(a[j]<=v)break;a[j+1]=a[j];o.push(["w",j+1,a[j]]);j--;}if(j+1!==i){a[j+1]=v;o.push(["w",j+1,v]);}}}},
    merge:{n:"Merge sort",b:"O(n log n)",a:"O(n log n)",w:"O(n log n)",st:true,run(a,o){const t=a.slice();const ms=(lo,hi)=>{if(hi-lo<1)return;const m=(lo+hi)>>1;ms(lo,m);ms(m+1,hi);for(let k=lo;k<=hi;k++)t[k]=a[k];
        let i=lo,j=m+1;for(let k=lo;k<=hi;k++){if(i>m){a[k]=t[j++];}else if(j>hi){a[k]=t[i++];}else{o.push(["c",i,j]);a[k]=t[j]<t[i]?t[j++]:t[i++];}o.push(["w",k,a[k]]);}};ms(0,a.length-1);}},
    quick:{n:"Quicksort (last pivot)",b:"O(n log n)",a:"O(n log n)",w:"O(n²)",st:false,run(a,o){const qs=(lo,hi)=>{while(lo<hi){const p=a[hi];let i=lo;for(let j=lo;j<hi;j++){o.push(["c",j,hi]);if(a[j]<p){if(i!==j){[a[i],a[j]]=[a[j],a[i]];o.push(["s",i,j]);}i++;}}
        if(i!==hi){[a[i],a[hi]]=[a[hi],a[i]];o.push(["s",i,hi]);}o.push(["d",i]);if(i-lo<hi-i){qs(lo,i-1);lo=i+1;}else{qs(i+1,hi);hi=i-1;}}if(lo===hi)o.push(["d",lo]);};qs(0,a.length-1);}},
    heap:{n:"Heap sort",b:"O(n log n)",a:"O(n log n)",w:"O(n log n)",st:false,run(a,o){const n=a.length,sift=(i,m)=>{for(;;){let l=2*i+1,r=l+1,b=i;if(l<m){o.push(["c",l,b]);if(a[l]>a[b])b=l;}if(r<m){o.push(["c",r,b]);if(a[r]>a[b])b=r;}if(b===i)return;[a[i],a[b]]=[a[b],a[i]];o.push(["s",i,b]);i=b;}};
        for(let i=(n>>1)-1;i>=0;i--)sift(i,n);for(let e=n-1;e>0;e--){[a[0],a[e]]=[a[e],a[0]];o.push(["s",0,e]);o.push(["d",e]);sift(0,e);}o.push(["d",0]);}}};
  const DATA={random:"Random",nearly:"Nearly sorted",reversed:"Reversed",few:"Few unique values"};
  function mkData(kind,n){let a=Array.from({length:n},(_,i)=>i+1);
    if(kind==="random"){for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}}
    else if(kind==="nearly"){for(let k=0;k<Math.max(1,n/12);k++){const i=Math.floor(Math.random()*(n-1));[a[i],a[i+1]]=[a[i+1],a[i]];}}
    else if(kind==="reversed")a.reverse();
    else a=Array.from({length:n},()=>Math.ceil(Math.random()*4)*(n/4));
    return a;}
  const opt=(o,sel)=>Object.entries(o).map(([k,v])=>'<option value="'+k+'"'+(k===sel?" selected":"")+">"+esc(v.n||v)+"</option>").join("");
  host.innerHTML='<div class="rc-ctl">'+
      '<label>Lane A <select data-k="a">'+opt(ALG,"insertion")+'</select></label><label>Lane B <select data-k="b">'+opt(ALG,"merge")+"</select></label>"+
      '<label>Data <select data-k="d">'+opt(DATA,"random")+'</select></label><label>Size <select data-k="n"><option>16</option><option selected>32</option><option>64</option><option>128</option></select></label>'+
      '<label class="rc-sp">Speed <input type="range" min="1" max="40" value="6" data-k="s"></label>'+
      '<button type="button" class="btn pri" data-a="go">▶ Race</button><button type="button" class="btn" data-a="new">⟲ New data</button></div>'+
    '<div class="rc-lanes">'+["a","b"].map(l=>'<div class="rc-lane" data-l="'+l+'"><div class="rc-h"><b></b><span class="rc-o"></span><span class="rc-win">🏆 winner</span></div><canvas></canvas>'+
      '<div class="rc-ct"><span>comparisons <b data-c="c">0</b></span><span>writes <b data-c="w">0</b></span><span>operations <b data-c="t">0</b></span></div><div class="rc-bar"><i></i></div></div>').join("")+"</div>"+
    '<div class="rc-why" aria-live="polite"></div>';
  const $=s=>host.querySelector(s),sel=k=>$('[data-k="'+k+'"]');
  let base=[],L={},raf=0,running=false;
  function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()||"#8b5cf6";}
  function lane(id){const el=$('.rc-lane[data-l="'+id+'"]'),key=sel(id).value,A=ALG[key],arr=base.slice(),ops=[];A.run(arr.slice(),ops);
    el.querySelector(".rc-h b").textContent=A.n;el.querySelector(".rc-o").textContent="best "+A.b+" · avg "+A.a+" · worst "+A.w+(A.st?" · stable":"");
    el.classList.remove("won","lost");return {el,key,A,arr,ops,i:0,c:0,w:0,hl:{},done:new Set(),fin:false,cv:el.querySelector("canvas")};}
  function setup(newData){cancelAnimationFrame(raf);running=false;$('[data-a="go"]').textContent="▶ Race";
    if(newData||!base.length||base.length!==+sel("n").value)base=mkData(sel("d").value,+sel("n").value);
    L={a:lane("a"),b:lane("b")};$(".rc-why").innerHTML="Both lanes get <b>the same "+base.length+" values</b> ("+DATA[sel("d").value].toLowerCase()+"). Press <b>Race</b>.";
    for(const l of Object.values(L)){paint(l);count(l);}}
  function paint(l){const cv=l.cv,dpr=Math.min(2,devicePixelRatio||1),W=cv.clientWidth,H=cv.clientHeight;if(cv.width!==Math.round(W*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}
    const g=cv.getContext("2d");g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);const n=l.arr.length,max=Math.max(...base),bw=W/n,acc=css("--accent"),acc2=css("--accent-2");
    for(let i=0;i<n;i++){const h=(l.arr[i]/max)*(H-6),x=i*bw,st=l.hl[i];
      g.fillStyle=l.fin||l.done.has(i)?"#22c55e":st==="c"?"#f59e0b":st==="w"?"#ec4899":i%2?acc:acc2;g.globalAlpha=st?1:l.fin||l.done.has(i)?.9:.78;
      g.fillRect(x+Math.min(1,bw*.12),H-h,Math.max(1,bw-Math.min(2,bw*.24)),h);}g.globalAlpha=1;}
  function count(l){const t=l.c+l.w;l.el.querySelector('[data-c="c"]').textContent=l.c;l.el.querySelector('[data-c="w"]').textContent=l.w;l.el.querySelector('[data-c="t"]').textContent=t;
    l.el.querySelector(".rc-bar i").style.transform="scaleX("+(l.ops.length?l.i/l.ops.length:0).toFixed(3)+")";}
  function step(l,k){l.hl={};for(let s=0;s<k&&l.i<l.ops.length;s++){const op=l.ops[l.i++];
      if(op[0]==="c"){l.c++;l.hl[op[1]]="c";l.hl[op[2]]="c";}
      else if(op[0]==="s"){l.w+=2;[l.arr[op[1]],l.arr[op[2]]]=[l.arr[op[2]],l.arr[op[1]]];l.hl[op[1]]="w";l.hl[op[2]]="w";}
      else if(op[0]==="w"){l.w++;l.arr[op[1]]=op[2];l.hl[op[1]]="w";}
      else if(op[0]==="d")l.done.add(op[1]);}
    if(l.i>=l.ops.length&&!l.fin){l.fin=true;l.hl={};l.end=performance.now();}}
  function why(){const a=L.a,b=L.b,ta=a.c+a.w,tb=b.c+b.w,d=sel("d").value,n=base.length;
    const W=ta===tb?null:ta<tb?a:b,Lo=W===a?b:a,tw=W?W.c+W.w:ta,tl=W?Lo.c+Lo.w:tb;
    const NOTE={bubble:{nearly:"bubble sort stops early when a pass makes no swaps, so nearly sorted data takes only a few passes",reversed:"reversed input is bubble sort's worst case: every pair is out of order",_:"bubble sort compares neighbours over and over: about n²/2 comparisons"},
      selection:{_:"selection sort always scans the whole unsorted part, whatever the data looks like: about n²/2 comparisons every time (but at most n−1 swaps)"},
      insertion:{nearly:"on nearly sorted data each element moves only a step or two, so insertion sort is close to O(n). That is why TimSort (Java's sort for objects) uses it for short runs",reversed:"reversed input makes every element walk all the way back: insertion sort's worst case, about n²/2 moves",_:"insertion sort shifts each element left until it fits: O(n²) on random data but very fast on small or nearly sorted arrays"},
      merge:{_:"merge sort always splits in half and merges: n log n work whatever the data (log₂ "+n+" ≈ "+Math.log2(n).toFixed(1)+" levels), but every merge writes every element, so it never benefits from sorted input"},
      quick:{nearly:"with the last element as pivot, sorted or nearly sorted input makes almost every partition lopsided: quicksort drifts towards O(n²). Real libraries pick better pivots (Java uses Dual-Pivot Quicksort for primitives)",reversed:"with the last element as pivot, reversed input makes every partition lopsided: quicksort's O(n²) worst case",few:"many equal values make this simple partition lopsided, so it slows down",_:"on random data quicksort's pivots split the array fairly evenly: O(n log n) with small constants, often the fastest in practice"},
      heap:{_:"heap sort is O(n log n) in every case and sorts in place, but jumping around the heap does more comparisons than merge or quick sort on average"}};
    const nt=l=>(NOTE[l.key][d]||NOTE[l.key]._);
    let h=W?"<b>"+esc(W.A.n)+"</b> won with <b>"+tw+"</b> operations against <b>"+tl+"</b> ("+(tl/Math.max(1,tw)).toFixed(1)+"× fewer).":"A tie: both needed <b>"+ta+"</b> operations.";
    h+="<ul><li>"+esc(a.A.n)+": "+nt(a)+".</li><li>"+esc(b.A.n)+": "+nt(b)+".</li></ul>";
    h+='<p class="small muted">Operations = comparisons + element writes (a swap counts as 2 writes). In Java, <code>Arrays.sort(int[])</code> uses Dual-Pivot Quicksort and <code>Arrays.sort(Object[])</code> / <code>List.sort</code> use TimSort (stable).</p>';
    $(".rc-why").innerHTML=h;if(W){W.el.classList.add("won");Lo.el.classList.add("lost");if(window.FX){const r=W.el.getBoundingClientRect();FX.confetti(r.left+r.width/2,r.top+30,36,{speed:280});}}}
  function frame(){const k=+sel("s").value;for(const l of Object.values(L)){if(!l.fin)step(l,k);paint(l);count(l);}
    if(L.a.fin&&L.b.fin){running=false;$('[data-a="go"]').textContent="▶ Race again";why();return;}raf=requestAnimationFrame(frame);}
  host.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;
    if(b.dataset.a==="new"){setup(true);return;}
    if(running){cancelAnimationFrame(raf);running=false;b.textContent="▶ Resume";return;}
    if(L.a.fin&&L.b.fin||!L.a.i&&!L.b.i)setup(false);running=true;b.textContent="❚❚ Pause";$(".rc-why").textContent="Racing…";raf=requestAnimationFrame(frame);});
  host.addEventListener("change",e=>{const k=e.target.dataset.k;if(k==="s")return;setup(k==="d"||k==="n");});
  addEventListener("resize",()=>{for(const l of Object.values(L))paint(l);},{passive:true});
  setup(true);
})();
