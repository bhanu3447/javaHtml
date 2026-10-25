/* jvm-lite.js: a small Java interpreter for the Visual Playground (java/playground.html). No DOM code in this file.
   Lexer -> parser (AST) -> tree-walking interpreter -> step recorder. Everything lives inside one IIFE; the only global is
   window.JVML = { run(source, stdin, opts) -> result, state(result, k) -> snapshot, version }.
   Values: int/short/byte = JS number, long = BigInt, double = JDbl, float = JFlt, char = JChr, boolean = JS boolean,
   null = null, references = heap objects (HObj). Strings, boxed numbers, arrays and collections are heap objects, so == and
   the String pool / Integer cache behave like the JVM. Full notes: kb/playground.md. */
"use strict";
(function(G){
const VERSION="1.0";
const MAX_STEPS=50000,MAX_DEPTH=2000,CP_EVERY=256;

class CompileError extends Error{constructor(line,msg){super(msg);this.line=line;}}

/* ============================== LEXER ============================== */
const KW=new Set(("abstract assert boolean break byte case catch char class const continue default do double else enum extends final "+
  "finally float for goto if implements import instanceof int interface long native new package private protected public return short "+
  "static strictfp super switch synchronized this throw throws transient try void volatile while true false null").split(" "));
const PRIM=new Set(["int","long","double","float","char","boolean","byte","short"]);
const OPS3=["<<=","..."],OPS2=["->","::","++","--","&&","||","==","!=","<=",">=","+=","-=","*=","/=","%=","&=","|=","^=","<<"];
const isD=c=>c>="0"&&c<="9";
const isIdS=c=>!!c&&(c>="a"&&c<="z"||c>="A"&&c<="Z"||c==="_"||c==="$"||c>"\u00bf");
const isIdP=c=>isIdS(c)||isD(c);

function lex(src){
  src=src.replace(/\r\n?/g,"\n");
  const T=[],n=src.length;let i=0,line=1;
  const E=m=>{throw new CompileError(line,m);};
  function esc(j){const c=src[j+1];
    switch(c){case "n":return ["\n",j+2];case "t":return ["\t",j+2];case "b":return ["\b",j+2];case "r":return ["\r",j+2];
      case "f":return ["\f",j+2];case "s":return [" ",j+2];case '"':return ['"',j+2];case "'":return ["'",j+2];case "\\":return ["\\",j+2];
      case "u":{let k=j+1;while(src[k]==="u")k++;const h=src.slice(k,k+4);if(!/^[0-9a-fA-F]{4}$/.test(h))E("illegal unicode escape");return [String.fromCharCode(parseInt(h,16)),k+4];}}
    if(c>="0"&&c<="7"){let k=j+1,s="";const mx=c<="3"?3:2;while(s.length<mx&&src[k]>="0"&&src[k]<="7")s+=src[k++];return [String.fromCharCode(parseInt(s,8)),k];}
    E("illegal escape character in literal");}
  function textBlock(){ // i points after the opening """
    let k=i;while(src[k]===" "||src[k]==="\t")k++;
    if(src[k]!=="\n")E("illegal text block open delimiter sequence, missing line terminator");
    k++;line++;let raw="";
    for(;;){if(k>=n)E("unclosed text block");if(src.startsWith('"""',k))break;
      if(src[k]==="\\"){raw+=src[k]+src[k+1];if(src[k+1]==="\n")line++;k+=2;continue;}
      if(src[k]==="\n")line++;raw+=src[k++];}
    i=k+3;
    const ls=raw.split("\n"),last=ls[ls.length-1],closeOwn=/^[ \t]*$/.test(last);
    let min=Infinity;ls.forEach((l,ix)=>{if(ix===ls.length-1&&closeOwn){min=Math.min(min,l.length);return;}if(/^[ \t]*$/.test(l))return;min=Math.min(min,l.match(/^[ \t]*/)[0].length);});
    if(min===Infinity)min=0;
    const body=(closeOwn?ls.slice(0,-1):ls).map(l=>/^[ \t]*$/.test(l)?"":l.slice(min).replace(/[ \t]+$/,""));
    let s=body.join("\n")+(closeOwn?"\n":""),o="";
    for(let j=0;j<s.length;){if(s[j]==="\\"){if(s[j+1]==="\n"){j+=2;continue;}const save=src;const r=escIn(s,j);o+=r[0];j=r[1];}else o+=s[j++];}
    return o;}
  function escIn(s,j){const c=s[j+1];const m={n:"\n",t:"\t",b:"\b",r:"\r",f:"\f",s:" ",'"':'"',"'":"'","\\":"\\"};
    if(m[c]!==undefined)return [m[c],j+2];
    if(c==="u"){let k=j+1;while(s[k]==="u")k++;return [String.fromCharCode(parseInt(s.slice(k,k+4),16)),k+4];}
    if(c>="0"&&c<="7"){let k=j+1,o="";const mx=c<="3"?3:2;while(o.length<mx&&s[k]>="0"&&s[k]<="7")o+=s[k++];return [String.fromCharCode(parseInt(o,8)),k];}
    E("illegal escape character in text block");}
  while(i<n){
    const c=src[i];
    if(c==="\n"){line++;i++;continue;}
    if(c===" "||c==="\t"||c==="\f"){i++;continue;}
    if(c==="/"&&src[i+1]==="/"){while(i<n&&src[i]!=="\n")i++;continue;}
    if(c==="/"&&src[i+1]==="*"){i+=2;while(i<n&&!(src[i]==="*"&&src[i+1]==="/")){if(src[i]==="\n")line++;i++;}if(i>=n)E("unclosed comment");i+=2;continue;}
    const s=i,sl=line;
    if(isIdS(c)){while(i<n&&isIdP(src[i]))i++;const w=src.slice(s,i);T.push({t:KW.has(w)?"kw":"id",v:w,line:sl,s,e:i});continue;}
    if(isD(c)||(c==="."&&isD(src[i+1]))){
      let j=i,kind="int",txt,radix=10;
      if(c==="0"&&(src[i+1]==="x"||src[i+1]==="X")){j=i+2;while(/[0-9a-fA-F_]/.test(src[j]||""))j++;txt=src.slice(i+2,j);radix=16;}
      else if(c==="0"&&(src[i+1]==="b"||src[i+1]==="B")){j=i+2;while(/[01_]/.test(src[j]||""))j++;txt=src.slice(i+2,j);radix=2;}
      else{while(/[0-9_]/.test(src[j]||""))j++;
        if(src[j]==="."&&!isIdS(src[j+1])&&src[j+1]!=="."){kind="double";j++;while(/[0-9_]/.test(src[j]||""))j++;}
        if(src[j]==="e"||src[j]==="E"){kind="double";j++;if(src[j]==="+"||src[j]==="-")j++;if(!isD(src[j]))E("malformed floating-point literal");while(/[0-9_]/.test(src[j]||""))j++;}
        txt=src.slice(i,j);}
      const suf=src[j];
      if(suf==="L"||suf==="l"){if(kind!=="int")E("malformed number");kind="long";j++;}
      else if(suf==="f"||suf==="F"){kind="float";j++;}
      else if(suf==="d"||suf==="D"){kind="double";j++;}
      if(isIdP(src[j]||""))E("illegal character in number");
      txt=txt.replace(/_/g,"");
      let v;
      if(kind==="double"||kind==="float"){if(radix!==10)E("hexadecimal floating-point literals are not supported");v=parseFloat(txt);if(kind==="float")v=Math.fround(v);}
      else{if(radix===10&&txt.length>1&&txt[0]==="0"){radix=8;if(/[89]/.test(txt))E("integer number too large");}
        const big=radix===10?BigInt(txt):BigInt((radix===16?"0x":radix===8?"0o":"0b")+(radix===8?txt.slice(1):txt));
        if(kind==="long"){if(radix===10&&big>9223372036854775808n)E("integer number too large");if(radix!==10&&big>0xFFFFFFFFFFFFFFFFn)E("integer number too large");v=big;}
        else{if(radix===10){if(big>2147483648n)E("integer number too large");v=big;}else{if(big>0xFFFFFFFFn)E("integer number too large");v=Number(BigInt.asIntN(32,big));}}}
      T.push({t:"num",kind,v,dec:radix===10,line:sl,s,e:j});i=j;continue;}
    if(c==='"'){
      if(src.startsWith('"""',i)){i+=3;const v=textBlock();T.push({t:"str",v,line:sl,s,e:i});continue;}
      let j=i+1,v="";
      for(;;){const d=src[j];if(d===undefined||d==="\n")E("unclosed string literal");if(d==='"')break;if(d==="\\"){const r=esc(j);v+=r[0];j=r[1];}else{v+=d;j++;}}
      i=j+1;T.push({t:"str",v,line:sl,s,e:i});continue;}
    if(c==="'"){
      let j=i+1,v;
      if(src[j]==="\\"){const r=esc(j);v=r[0];j=r[1];}else{if(src[j]==="'"||src[j]==="\n"||src[j]===undefined)E("empty character literal");v=src[j];j++;}
      if(src[j]!=="'")E("unclosed character literal");
      i=j+1;T.push({t:"chr",v:v.charCodeAt(0),line:sl,s,e:i});continue;}
    let op=null;
    for(const o of OPS3)if(src.startsWith(o,i)){op=o;break;}
    if(!op)for(const o of OPS2)if(src.startsWith(o,i)){op=o;break;}
    if(!op&&"+-*/%=<>!~?:;,.(){}[]&|^@".includes(c))op=c;
    if(!op)E("illegal character: '"+c+"'");
    T.push({t:"op",v:op,line:sl,s,e:i+op.length});i+=op.length;}
  T.push({t:"eof",v:"<EOF>",line,s:n,e:n});
  return T;}

/* ============================== PARSER ============================== */
const MODS=new Set(["public","private","protected","static","final","abstract","native","transient","volatile","strictfp","synchronized","default","sealed","non-sealed"]);
const BINP={"||":1,"&&":2,"|":3,"^":4,"&":5,"==":6,"!=":6,"<":7,">":7,"<=":7,">=":7,"instanceof":7,"<<":8,">>":8,">>>":8,"+":9,"-":9,"*":10,"/":10,"%":10};
const ASSIGN=new Set(["=","+=","-=","*=","/=","%=","&=","|=","^=","<<=",">>=",">>>="]);

function parse(src){
  const T=lex(src);let p=0;
  const pk=(k=0)=>T[p+k],nx=()=>T[p++];
  const E=(m,t)=>{throw new CompileError((t||T[p]).line,m);};
  const is=(v,k=0)=>{const t=T[p+k];return (t.t==="op"||t.t==="kw")&&t.v===v;};
  const isId=(k=0)=>T[p+k].t==="id";
  const acc=v=>{if(is(v)){p++;return true;}return false;};
  const ex=v=>{if(!is(v))E("'"+v+"' expected"+(T[p].t!=="eof"?", found '"+T[p].v+"'":" (reached end of file)"));return T[p++];};
  const exId=()=>{if(!isId())E("<identifier> expected"+(T[p].t!=="eof"?", found '"+T[p].v+"'":""));return T[p++].v;};
  const srcOf=(a,b)=>src.replace(/\r\n?/g,"\n").slice(a,b);
  /* '>' merging: the lexer never produces >> or >>>, so generics close cleanly */
  function opAt(i){const t=T[i];if(t.t==="kw"&&t.v==="instanceof")return {v:"instanceof",n:1};if(t.t!=="op")return null;
    if(t.v===">"){const a=T[i+1];if(a.t==="op"&&a.s===t.e){
      if(a.v===">"){const b=T[i+2];if(b.t==="op"&&b.s===a.e){if(b.v===">")return {v:">>>",n:3};if(b.v===">=")return {v:">>>=",n:3};}return {v:">>",n:2};}
      if(a.v===">=")return {v:">>=",n:2};}}
    return {v:t.v,n:1};}
  function skipAnno(){while(is("@")&&!(T[p+1].t==="kw"&&T[p+1].v==="interface")){p++;exId();while(acc("."))exId();if(is("(")){let d=0;do{if(is("("))d++;else if(is(")"))d--;p++;}while(d>0);}}}
  function mods(){const m=new Set();for(;;){skipAnno();const t=T[p];if((t.t==="kw"||t.t==="id")&&MODS.has(t.v)&&!(t.v==="default"&&(is(":",1)||is("->",1)))){
      if(t.v==="non"){}m.add(t.v);p++;continue;}
      if(t.t==="id"&&t.v==="non"&&is("-",1)){p+=3;continue;}break;}return m;}
  /* ---------- types ---------- */
  function typeArgs(){ // at '<'
    const args=[];ex("<");if(is(">")){p++;return args;}
    for(;;){if(acc("?")){if(acc("extends")||acc("super"))args.push(type());else args.push({n:"Object",d:0,a:[]});}else args.push(type());
      if(acc(","))continue;break;}
    ex(">");return args;}
  function type(){
    const t=T[p];let name;
    if(t.t==="kw"&&(PRIM.has(t.v)||t.v==="void")){p++;name=t.v;}
    else if(t.t==="id"){p++;name=t.v;var args=null;if(is("<"))args=typeArgs();
      while(is(".")&&T[p+1].t==="id"){p++;name=T[p++].v;if(is("<"))args=typeArgs();}
      if(/^(java|javax)$/.test(name))E("<identifier> expected");}
    else E("<identifier> expected"+(t.t!=="eof"?", found '"+t.v+"'":""));
    let d=0;skipAnno();while(is("[")&&is("]",1)){p+=2;d++;}
    return {n:name,d,a:args||[]};}
  function tryType(){const s=p;try{return type();}catch(e){p=s;return null;}}
  function typeParams(){if(!is("<"))return [];const r=[];p++;for(;;){skipAnno();r.push(exId());if(acc("extends")){type();while(acc("&"))type();}if(acc(","))continue;break;}ex(">");return r;}
  /* ---------- compilation unit ---------- */
  const imports=[];
  function unit(){
    if(acc("package")){exId();while(acc("."))exId();ex(";");}
    while(is("import")){p++;acc("static");let s=exId();while(acc(".")){if(acc("*")){s+=".*";break;}s+="."+exId();}ex(";");imports.push(s);}
    const types=[];
    while(T[p].t!=="eof"){if(acc(";"))continue;const m=mods();types.push(typeDecl(m,null));}
    return {types,imports};}
  function typeDecl(m,outer){
    const line=T[p].line;let kind;
    if(acc("class"))kind="class";else if(acc("interface"))kind="interface";else if(acc("enum"))kind="enum";
    else if(is("@")&&T[p+1].v==="interface"){p+=2;kind="annotation";}
    else if(isId()&&T[p].v==="record"&&isId(1)){p++;kind="record";}
    else E("class, interface, enum, or record expected");
    const name=exId(),C={k:"Class",kind,name,mods:m,line,outer,tparams:typeParams(),sup:null,ifaces:[],fields:[],methods:[],ctors:[],inits:[],nested:[],consts:[],comps:null,anon:false};
    if(kind==="record"){ex("(");C.comps=[];if(!is(")"))for(;;){skipAnno();acc("final");const t=type();C.comps.push({t,n:exId()});if(acc(","))continue;break;}ex(")");}
    if(acc("extends")){if(kind==="interface"){C.ifaces.push(type());while(acc(","))C.ifaces.push(type());}else C.sup=type();}
    if(acc("implements")){C.ifaces.push(type());while(acc(","))C.ifaces.push(type());}
    if(isId()&&T[p].v==="permits"){p++;type();while(acc(","))type();}
    if(kind==="annotation"){let d=0;do{if(is("{"))d++;else if(is("}"))d--;p++;}while(d>0);return C;}
    classBody(C);return C;}
  function classBody(C){
    ex("{");
    if(C.kind==="enum"){
      let ord=0;
      while(!is(";")&&!is("}")){skipAnno();const line=T[p].line,n=exId();let args=[],body=null;if(is("("))args=argList();
        if(is("{")){body={k:"Class",kind:"class",name:"",mods:new Set(),line,outer:C,tparams:[],sup:{n:C.name,d:0,a:[]},ifaces:[],fields:[],methods:[],ctors:[],inits:[],nested:[],consts:[],comps:null,anon:true};classBody(body);}
        C.consts.push({n,args,body,line,ord:ord++});if(!acc(","))break;}
      acc(";");}
    while(!acc("}")){
      if(T[p].t==="eof")E("reached end of file while parsing");
      if(acc(";"))continue;
      const line=T[p].line;
      if(is("{")){C.inits.push({st:false,block:block(),line});continue;}
      if(is("static")&&is("{",1)){p++;C.inits.push({st:true,block:block(),line});continue;}
      const m=mods();
      if(is("class")||is("interface")||is("enum")||(isId()&&T[p].v==="record"&&isId(1)&&is("(",2))||(is("@")&&T[p+1].v==="interface")){const N=typeDecl(m,C);if(C.kind==="interface")N.mods.add("static");C.nested.push(N);continue;}
      const tps=typeParams();
      // constructor (also the compact record constructor)
      if(isId()&&T[p].v===C.name&&(is("(",1)||(C.kind==="record"&&is("{",1)))){
        p++;let params=null,compact=false;
        if(is("(")){params=paramList();}else{compact=true;params=C.comps.map(c=>({t:c.t,n:c.n,va:false}));}
        if(acc("throws")){type();while(acc(","))type();}
        const b=block();C.ctors.push({k:"Ctor",mods:m,params,body:b,line,end:b.end,compact,cls:C});continue;}
      const t=type();
      const nameTok=T[p],name=exId();
      if(is("(")){
        const params=paramList();let d=t.d;while(is("[")&&is("]",1)){p+=2;d++;}
        if(acc("throws")){type();while(acc(","))type();}
        let body=null;if(is("{"))body=block();else{if(acc("default")){expr();}ex(";");}
        if(C.kind==="interface"&&!m.has("static")&&!m.has("private")&&body&&!m.has("default"))E("interface abstract methods cannot have body",nameTok);
        const abs=!body;
        C.methods.push({k:"Method",name,ret:{n:t.n,d,a:t.a},params,body,mods:m,st:m.has("static"),abs,line,end:body?body.end:line,cls:C,tps});continue;}
      // field(s)
      p--;const decls=declarators(t);ex(";");
      for(const d of decls){const st=m.has("static")||C.kind==="interface";const F={n:d.n,t:d.t,init:d.init,st,fin:m.has("final")||C.kind==="interface",line:d.line,cls:C};
        C.fields.push(F);C.inits.push({st,field:F,line:d.line});}}
    return C;}
  function paramList(){ex("(");const ps=[];if(!is(")"))for(;;){skipAnno();acc("final");skipAnno();const t=type();let va=false;if(acc("...")){va=true;t.d++;}
      const n=exId();while(is("[")&&is("]",1)){p+=2;t.d++;}ps.push({t,n,va});if(acc(","))continue;break;}
    ex(")");return ps;}
  function declarators(t){const r=[];
    for(;;){const line=T[p].line,n=exId();let d=t.d;while(is("[")&&is("]",1)){p+=2;d++;}const ty={n:t.n,d,a:t.a};let init=null;
      if(acc("="))init=is("{")?arrInit(ty):expr();
      r.push({n,t:ty,init,line});if(acc(","))continue;break;}
    return r;}
  function arrInit(ty){const line=ex("{").line,el=[];const et={n:ty.n,d:ty.d-1,a:ty.a};
    while(!is("}")){el.push(is("{")?arrInit(et):expr());if(!acc(","))break;}ex("}");return {k:"ArrInit",t:ty,el,line};}
  /* ---------- statements ---------- */
  function block(){const line=ex("{").line,st=[];while(!is("}")){if(T[p].t==="eof")E("reached end of file while parsing");st.push(stmt());}const end=T[p].line;p++;return {k:"Block",st,line,end};}
  function isLocalDecl(){const s=p;
    try{while(is("final")||is("@")){if(acc("final"))continue;skipAnno();}
      const t=type();if(!isId())return false;const nt=T[p+1];if(!nt)return false;
      if(t.n==="var"&&t.d===0)return true;
      return (nt.t==="op"&&(nt.v==="="||nt.v===";"||nt.v===","||nt.v===":"||nt.v==="["));}
    catch(e){return false;}finally{p=s;}}
  function localDecl(){const line=T[p].line;let fin=false;while(is("final")||is("@")){if(acc("final")){fin=true;continue;}skipAnno();}
    const t=type();const decls=declarators(t);return {k:"Local",t,decls,fin,line};}
  function stmt(){
    const t=T[p],line=t.line;
    if(is("{"))return block();
    if(acc(";"))return {k:"Empty",line};
    if(t.t==="id"&&is(":",1)&&!is("::",1)){p+=2;return {k:"Labeled",label:t.v,body:stmt(),line};}
    if(t.t==="kw")switch(t.v){
      case "if":{p++;ex("(");const c=expr();ex(")");const th=stmt();let el=null;if(acc("else"))el=stmt();return {k:"If",c,th,el,line};}
      case "while":{p++;ex("(");const c=expr();ex(")");return {k:"While",c,body:stmt(),line};}
      case "do":{p++;const body=stmt();const cl=ex("while").line;ex("(");const c=expr();ex(")");ex(";");return {k:"Do",body,c,cline:cl,line};}
      case "for":{p++;ex("(");
        if(isLocalDecl()){const s=p;let fin=false;while(is("final")||is("@")){if(acc("final"))continue;skipAnno();}const ty=type();const nm=exId();
          if(acc(":")){const it=expr();ex(")");return {k:"ForEach",t:ty,n:nm,it,body:stmt(),line};}
          p=s;}
        const init=[];if(!is(";")){if(isLocalDecl())init.push(localDecl());else{init.push({k:"ExprS",e:expr(),line});while(acc(","))init.push({k:"ExprS",e:expr(),line});}}
        ex(";");const c=is(";")?null:expr();ex(";");const upd=[];if(!is(")")){upd.push(expr());while(acc(","))upd.push(expr());}ex(")");
        return {k:"For",init,c,upd,body:stmt(),line};}
      case "return":{p++;const e=is(";")?null:expr();ex(";");return {k:"Return",e,line};}
      case "break":{p++;const l=isId()?nx().v:null;ex(";");return {k:"Break",label:l,line};}
      case "continue":{p++;const l=isId()?nx().v:null;ex(";");return {k:"Continue",label:l,line};}
      case "throw":{p++;const e=expr();ex(";");return {k:"Throw",e,line};}
      case "try":{p++;const res=[];
        if(acc("(")){while(!is(")")){if(isLocalDecl())res.push(localDecl());else res.push({k:"ExprS",e:expr(),line:T[p].line});if(!acc(";"))break;}ex(")");}
        const b=block(),cs=[];let fin=null;
        while(is("catch")){const cl=nx().line;ex("(");acc("final");const ts=[type()];while(acc("|"))ts.push(type());const n=exId();ex(")");cs.push({ts,n,b:block(),line:cl});}
        if(acc("finally"))fin=block();
        if(!cs.length&&!fin&&!res.length)E("'catch' or 'finally' expected");
        return {k:"Try",res,b,cs,fin,line};}
      case "switch":{const s=switchX(false);return s;}
      case "synchronized":{p++;ex("(");const l=expr();ex(")");return {k:"Sync",l,body:block(),line};}
      case "assert":{p++;const c=expr();let m=null;if(acc(":"))m=expr();ex(";");return {k:"Assert",c,m,line};}
      case "this":case "super":if(is("(",1)){p++;const args=argList();ex(";");return {k:"CtorCall",kind:t.v,args,line};}break;
      case "class":case "interface":case "enum":E("local classes are not supported in the visualizer, declare the class at the top level or inside the main class");
    }
    if(t.t==="id"&&t.v==="yield"&&!is("=",1)&&!is("(",1)&&!is(".",1)){p++;const e=expr();ex(";");return {k:"Yield",e,line};}
    if(t.t==="id"&&(t.v==="record")&&isId(1)&&is("(",2))E("local records are not supported in the visualizer, declare the record inside the class");
    if(isLocalDecl()){const d=localDecl();ex(";");return d;}
    const e=expr();
    if(!["Assign","PreInc","PostInc","Call","New"].includes(e.k))E("not a statement",t);
    ex(";");return {k:"ExprS",e,line};}
  function switchX(isExpr){
    const line=ex("switch").line;ex("(");const e=expr();ex(")");ex("{");const cases=[];let arrow=null;
    while(!acc("}")){
      const cl=T[p].line;let labels;
      if(acc("default")){labels=null;}
      else{ex("case");labels=[];for(;;){if(acc("default")){labels.push({k:"Default"});}else{
          if(isId()&&isId(1)&&!is(",",1))E("pattern matching in switch is not supported in the visualizer, use Run for real output");
          labels.push(ternary());}if(acc(","))continue;break;}}
      let a;if(acc("->"))a=true;else{ex(":");a=false;}
      if(arrow===null)arrow=a;else if(arrow!==a)E("different case kinds used in the switch");
      let body;
      if(a){if(is("{"))body=[block()];else if(is("throw"))body=[stmt()];else{const bl=T[p].line;const x=expr();ex(";");body=[{k:isExpr?"Yield":"ExprS",e:x,line:bl,arrowExpr:true}];}}
      else{body=[];while(!is("case")&&!is("default")&&!is("}"))body.push(stmt());
        if(is("default")&&(is("->",1)||is(":",1))){}}
      cases.push({labels,body,line:cl});}
    return {k:"Switch",e,cases,arrow:!!arrow,isExpr,line};}
  /* ---------- expressions ---------- */
  function argList(){ex("(");const a=[];if(!is(")"))for(;;){a.push(expr());if(acc(","))continue;break;}ex(")");return a;}
  function lambdaAhead(){
    if(isId()&&is("->",1))return true;
    if(!is("("))return false;
    let d=0,i=p;for(;;i++){const t=T[i];if(t.t==="eof")return false;if(t.t==="op"){if(t.v==="(")d++;else if(t.v===")"){d--;if(d===0)break;}}}
    return T[i+1].t==="op"&&T[i+1].v==="->";}
  function lambda(){const st=T[p],line=st.line,params=[];
    if(isId()){params.push({n:nx().v,t:null});}
    else{ex("(");if(!is(")"))for(;;){acc("final");if(isId()&&(is(",",1)||is(")",1)))params.push({n:nx().v,t:null});else{const t=type();params.push({n:exId(),t:t.n==="var"?null:t});}if(acc(","))continue;break;}ex(")");}
    ex("->");const body=is("{")?block():expr();
    return {k:"Lambda",params,body,line,text:srcOf(st.s,T[p-1].e).replace(/\s+/g," ")};}
  function expr(){
    if(lambdaAhead())return lambda();
    const l=ternary();const o=opAt(p);
    if(o&&ASSIGN.has(o.v)){const line=T[p].line;p+=o.n;
      if(!["Name","Field","Index"].includes(l.k))E("unexpected type\n  required: variable\n  found:    value");
      const v=is("{")?E("illegal start of expression"):expr();return {k:"Assign",op:o.v,t:l,v,line};}
    return l;}
  function ternary(){const c=binary(1);if(is("?")){const line=nx().line;const a=lambdaAhead()?lambda():ternary();ex(":");const b=lambdaAhead()?lambda():ternary();return {k:"Cond",c,a,b,line};}return c;}
  function binary(min){
    let l=unary();
    for(;;){const o=opAt(p);if(!o||!(o.v in BINP))break;const pr=BINP[o.v];if(pr<min)break;const line=T[p].line;p+=o.n;
      if(o.v==="instanceof"){acc("final");const t=type();let bind=null;if(isId()&&!(T[p].v==="instanceof"))bind=nx().v;l={k:"InstOf",e:l,t,bind,line};continue;}
      const r=binary(pr+1);l=fold({k:"Bin",op:o.v,l,r,line});}
    return l;}
  /* compile-time constant folding of String concatenation (so "hel" + "lo" is one pooled literal, like javac) */
  function constStr(n){if(n.k==="Lit"){if(n.t==="String")return n.v;if(n.t==="int"||n.t==="boolean")return String(n.v);if(n.t==="char")return String.fromCharCode(n.v);}return null;}
  function fold(n){if(n.op==="+"&&n.l.k==="Lit"&&n.r.k==="Lit"&&(n.l.t==="String"||n.r.t==="String")){const a=constStr(n.l),b=constStr(n.r);if(a!==null&&b!==null)return {k:"Lit",t:"String",v:a+b,line:n.line};}return n;}
  function castAhead(){ // at '('
    const s=p;p++;
    try{const t=T[p];
      if(t.t==="kw"&&PRIM.has(t.v)){const ty=type();if(acc(")"))return ty;return null;}
      if(t.t!=="id")return null;const ty=type();while(acc("&"))type();if(!acc(")"))return null;
      const n=T[p];
      if(n.t==="id"||n.t==="num"||n.t==="str"||n.t==="chr"||(n.t==="op"&&(n.v==="("||n.v==="!"||n.v==="~"))||(n.t==="kw"&&["this","super","new","true","false","null","switch"].includes(n.v)))return ty;
      return null;}
    catch(e){return null;}finally{if(!castAhead.ok)p=s;}}
  function unary(){
    const t=T[p],line=t.line;
    if(t.t==="op")switch(t.v){
      case "+":case "-":{p++;const n=T[p];
        if(t.v==="-"&&n.t==="num"&&n.dec&&(n.kind==="int"||n.kind==="long")&&!(T[p+1].t==="op"&&(T[p+1].v==="."||T[p+1].v==="["))){p++;
          if(n.kind==="int")return {k:"Lit",t:"int",v:Number(-n.v)|0,line};return {k:"Lit",t:"long",v:BigInt.asIntN(64,-n.v),line};}
        return {k:"Un",op:t.v,e:unary(),line};}
      case "++":case "--":{p++;const e=unary();if(!["Name","Field","Index"].includes(e.k))E("unexpected type");return {k:"PreInc",op:t.v,e,line};}
      case "!":case "~":{p++;return {k:"Un",op:t.v,e:unary(),line};}
      case "(":{const s=p;const ty=castAhead();if(ty){const s2=p;p=s;p++;type();while(acc("&"))type();ex(")");return {k:"Cast",t:ty,e:unary(),line};}p=s;break;}}
    return postfix(primary());}
  function primary(){
    const t=T[p],line=t.line;
    switch(t.t){
      case "num":p++;
        if(t.kind==="int"){if(t.v===2147483648n)E("integer number too large",t);return {k:"Lit",t:"int",v:typeof t.v==="bigint"?Number(t.v):t.v,line};}
        if(t.kind==="long"){if(t.v===9223372036854775808n)E("integer number too large",t);return {k:"Lit",t:"long",v:t.v,line};}
        return {k:"Lit",t:t.kind,v:t.v,line};
      case "str":p++;return {k:"Lit",t:"String",v:t.v,line};
      case "chr":p++;return {k:"Lit",t:"char",v:t.v,line};
      case "id":p++;
        if(is("(")){const args=argList();return {k:"Call",o:null,n:t.v,args,line};}
        return {k:"Name",n:t.v,line};
      case "kw":switch(t.v){
        case "true":case "false":p++;return {k:"Lit",t:"boolean",v:t.v==="true",line};
        case "null":p++;return {k:"Lit",t:"null",v:null,line};
        case "this":p++;return {k:"This",line};
        case "super":{p++;if(acc("::")){return {k:"MRef",o:{k:"Super",line},n:exId(),line};}ex(".");const n=exId();if(is("(")){return {k:"Call",o:{k:"Super",line},n,args:argList(),line};}return {k:"Field",o:{k:"Super",line},n,line};}
        case "new":return newX();
        case "switch":return switchX(true);
        default:if(PRIM.has(t.v)||t.v==="void"){const ty=type();if(acc("::")){ex("new");return {k:"MRef",o:{k:"TypeRef",t:ty,line},n:"new",line};}ex(".");ex("class");return {k:"ClassLit",t:ty,line};}}
        break;
      case "op":if(t.v==="("){p++;const e=expr();ex(")");return {k:"Paren",e,line};}
        if(t.v==="{")E("illegal start of expression: array initializers are only allowed in declarations (use new int[]{...})");break;}
    E("illegal start of expression"+(t.t!=="eof"?": '"+t.v+"'":""));}
  function newX(){
    const line=ex("new").line;
    const t=T[p];let base;
    if(t.t==="kw"&&PRIM.has(t.v)){p++;base={n:t.v,d:0,a:[]};}
    else{base={n:exId(),d:0,a:[]};if(is("<"))base.a=typeArgs();while(acc(".")){base.n=exId();if(is("<"))base.a=typeArgs();}}
    if(is("[")){const dims=[];let extra=0;
      while(is("[")){p++;if(is("]")){p++;extra++;continue;}if(extra)E("']' expected");dims.push(expr());ex("]");}
      const ty={n:base.n,d:dims.length+extra,a:base.a};
      if(is("{")){if(dims.length)E("array creation with both dimension expression and initialization is illegal");return {k:"NewArr",t:ty,dims:[],init:arrInit(ty),line};}
      if(!dims.length)E("array dimension missing");
      return {k:"NewArr",t:ty,dims,init:null,line};}
    if(PRIM.has(base.n))E("'[' expected");
    const args=argList();let body=null;
    if(is("{")){body={k:"Class",kind:"class",name:"",mods:new Set(),line,outer:null,tparams:[],sup:base,ifaces:[],fields:[],methods:[],ctors:[],inits:[],nested:[],consts:[],comps:null,anon:true};classBody(body);}
    return {k:"New",t:base,args,body,line};}
  function postfix(e){
    for(;;){
      const t=T[p];
      if(is(".")){p++;
        if(is("<")){typeArgs();}
        if(acc("new"))E("inner class creation with outer.new is not supported in the visualizer");
        if(acc("class")){e={k:"ClassLit",t:{n:e.n||"?",d:0,a:[]},line:t.line};continue;}
        if(acc("this")){e={k:"This",line:t.line,outer:e.n};continue;}
        if(acc("super")){ex(".");const n=exId();if(!is("("))E("'(' expected");e={k:"Call",o:{k:"Super",iface:e.n,line:t.line},n,args:argList(),line:t.line};continue;}
        const n=exId();
        if(is("(")){e={k:"Call",o:e,n,args:argList(),line:t.line};continue;}
        e={k:"Field",o:e,n,line:t.line};continue;}
      if(is("[")){
        if(is("]",1)&&(e.k==="Name"||e.k==="Field")){ // Type[]::new or Type[].class
          let d=0;while(is("[")&&is("]",1)){p+=2;d++;}const ty={n:e.n,d,a:[]};
          if(acc("::")){ex("new");return {k:"MRef",o:{k:"TypeRef",t:ty,line:t.line},n:"new",line:t.line};}
          ex(".");ex("class");return {k:"ClassLit",t:ty,line:t.line};}
        p++;const i=expr();ex("]");e={k:"Index",a:e,i,line:t.line};continue;}
      if(is("++")||is("--")){if(!["Name","Field","Index"].includes(e.k))E("unexpected type");p++;e={k:"PostInc",op:t.v,e,line:t.line};continue;}
      if(is("::")){p++;const n=acc("new")?"new":exId();e={k:"MRef",o:e,n,line:t.line};continue;}
      if(is("<")&&(e.k==="Name"||e.k==="Field")&&/^[A-Z]/.test(e.n)){ // generic type before :: (List<String>::size)
        const s=p;try{typeArgs();if(is("::")){continue;}}catch(x){}p=s;}
      return e;}}
  castAhead.ok=false;
  return unit();}

/* ============================== VALUES ============================== */
class JChr{constructor(c){this.c=c;}}
class JDbl{constructor(v){this.v=v;}}
class JFlt{constructor(v){this.v=v;}}
class SAcc{constructor(s){this.s=s;}}
class JThrow{constructor(o){this.obj=o;}}
class StopRun{constructor(kind,msg,line){this.kind=kind;this.msg=msg;this.line=line;}}
class Fatal extends Error{constructor(line,msg){super(msg);this.line=line;}}
class HObj{constructor(id,kind,cls){this.id=id;this.kind=kind;this.cls=cls;this._d=0;}}
const UNINIT={uninit:1};
const wideT=(ty,v)=>ty?(ty.d===0&&(ty.n==="long"||ty.n==="double")):(typeof v==="bigint"||v instanceof JDbl);
const CHC=[];const chr=c=>CHC[c]||(CHC[c]=new JChr(c));
const D0=new JDbl(0),F0=new JFlt(0);
const isRef=v=>v===null||v instanceof HObj;
const isPrim=v=>v!==null&&v!==undefined&&!(v instanceof HObj);
const kd=v=>typeof v==="number"||v instanceof JChr?1:typeof v==="bigint"?2:v instanceof JFlt?3:v instanceof JDbl?4:0;
const num=v=>typeof v==="number"?v:typeof v==="bigint"?Number(v):v instanceof JChr?v.c:v.v;
const toL=v=>typeof v==="bigint"?v:typeof v==="number"?BigInt(v):v instanceof JChr?BigInt(v.c):d2l(v.v);
function d2i(x){if(Number.isNaN(x))return 0;if(x>=2147483647)return 2147483647;if(x<=-2147483648)return -2147483648;return Math.trunc(x)|0;}
function d2l(x){if(Number.isNaN(x))return 0n;if(x>=9223372036854775807)return 9223372036854775807n;if(x<=-9223372036854775808)return -9223372036854775808n;return BigInt(Math.trunc(x));}
const WRAP={Integer:"int",Long:"long",Double:"double",Float:"float",Character:"char",Boolean:"boolean",Short:"short",Byte:"byte"};
const PRIMW={int:"Integer",long:"Long",double:"Double",float:"Float",char:"Character",boolean:"Boolean",short:"Short",byte:"Byte"};
function defVal(tk){switch(tk){case "int":case "short":case "byte":return 0;case "long":return 0n;case "double":return D0;case "float":return F0;case "char":return chr(0);case "boolean":return false;}return null;}
function toPrim(tk,v){
  switch(tk){
    case "int":return v instanceof JChr?v.c:typeof v==="number"?v:typeof v==="bigint"?Number(BigInt.asIntN(32,v)):d2i(v.v);
    case "long":return toL(v);
    case "short":return (toPrim("int",v)<<16)>>16;
    case "byte":return (toPrim("int",v)<<24)>>24;
    case "char":return chr(toPrim("int",v)&0xFFFF);
    case "double":return v instanceof JDbl?v:new JDbl(num(v));
    case "float":return v instanceof JFlt?v:new JFlt(Math.fround(num(v)));
    case "boolean":return v;}
  return v;}
const tstr=t=>!t?"var":t.n+(t.a&&t.a.length?"<"+t.a.map(tstr).join(", ")+">":"")+"[]".repeat(t.d);
const ekey=t=>t.n+"[]".repeat(Math.max(0,t.d-1));
function vtype(v){if(typeof v==="number")return "int";if(typeof v==="bigint")return "long";if(typeof v==="boolean")return "boolean";if(v instanceof JChr)return "char";
  if(v instanceof JDbl)return "double";if(v instanceof JFlt)return "float";if(v===null)return "Object";
  if(v.kind==="str")return "String";if(v.kind==="arr")return v.et+"[]";if(v.kind==="obj")return v.cls.simple||v.cls.qname;if(v.kind==="lambda")return "lambda";return v.cls||"Object";}
/* Java's Double.toString / Float.toString: shortest digits that round-trip, decimal form for 1e-3 <= |x| < 1e7 */
function layoutNum(digits,exp,ax){
  if(ax>=1e-3&&ax<1e7){if(exp>=0){const ip=digits.slice(0,exp+1).padEnd(exp+1,"0");const fp=digits.slice(exp+1)||"0";return ip+"."+fp;}return "0."+"0".repeat(-exp-1)+digits;}
  return digits[0]+"."+(digits.slice(1)||"0")+"E"+exp;}
function splitExp(x){let [m,e]=Math.abs(x).toExponential().split("e");let d=m.replace(".",""),ex=parseInt(e,10);
  if(d.length===1){const t=Math.abs(x).toExponential(1).split("e");d=t[0].replace(".","").replace(/0+$/,"")||"0";ex=parseInt(t[1],10);}
  return [d,ex];}
function fmtD(x){if(Number.isNaN(x))return "NaN";if(x===Infinity)return "Infinity";if(x===-Infinity)return "-Infinity";if(x===0)return 1/x<0?"-0.0":"0.0";
  const [d,e]=splitExp(x);return (x<0?"-":"")+layoutNum(d,e,Math.abs(x));}
function fmtF(x){if(Number.isNaN(x))return "NaN";if(x===Infinity)return "Infinity";if(x===-Infinity)return "-Infinity";if(x===0)return 1/x<0?"-0.0":"0.0";
  let s=null;for(let p=1;p<=9;p++){const t=Math.abs(x).toPrecision(p);if(Math.fround(parseFloat(t))===Math.abs(x)){s=t;break;}}
  let [d,e]=splitExp(parseFloat(s));if(d.length===1){const ax=Math.abs(x);
    const t=ax.toExponential(1).split("e");const c2=parseFloat(t[0]+"e"+t[1]);if(Math.fround(c2)===ax){d=t[0].replace(".","").replace(/0+$/,"")||"0";e=parseInt(t[1],10);}}
  return (x<0?"-":"")+layoutNum(d,e,Math.abs(x));}
function strHash(s){let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return h;}
const DV=new DataView(new ArrayBuffer(8));
function dblBits(x){if(Number.isNaN(x))return [0x7ff80000,0];DV.setFloat64(0,x);return [DV.getInt32(0),DV.getInt32(4)];}
function fltBits(x){if(Number.isNaN(x))return 0x7fc00000;DV.setFloat32(0,x);return DV.getInt32(0);}
function tableSizeFor(c){let n=1;while(n<c)n*=2;return Math.min(n,1<<30);}
/* decimal rounding HALF_UP on the shortest repr (what java.util.Formatter does for %f) */
function fixedHalfUp(x,prec){
  if(!isFinite(x))return Number.isNaN(x)?"NaN":(x>0?"Infinity":"-Infinity");
  const neg=x<0||(x===0&&1/x<0);let [d,e]=x===0?["0",0]:splitExp(x);
  // digits d with decimal exponent e: value = 0.d * 10^(e+1)
  let intLen=e+1,s=d;
  if(intLen<=0){s="0".repeat(1-intLen)+s;intLen=1;}
  if(s.length<intLen+prec+1)s=s.padEnd(intLen+prec+1,"0");
  let keep=s.slice(0,intLen+prec),nextD=s.charCodeAt(intLen+prec)-48;
  let arr=keep.split("").map(Number);
  if(nextD>=5){let i=arr.length-1;for(;i>=0;i--){if(arr[i]===9){arr[i]=0;}else{arr[i]++;break;}}if(i<0){arr.unshift(1);intLen++;}}
  let ip=arr.slice(0,intLen).join("").replace(/^0+(?=\d)/,""),fp=arr.slice(intLen).join("");
  const res=ip+(prec>0?"."+fp:"");
  return (neg&&/[1-9]/.test(res)?"-":neg&&x!==0?"-":"")+res;}

/* built-in classes written in Java and run by this interpreter (quietly: their frames are hidden) */
const EXC=[["Exception","Throwable","java.lang"],["Error","Throwable","java.lang"],["RuntimeException","Exception","java.lang"],
  ["ArithmeticException","RuntimeException","java.lang"],["ArrayStoreException","RuntimeException","java.lang"],["ClassCastException","RuntimeException","java.lang"],
  ["IllegalArgumentException","RuntimeException","java.lang"],["IllegalStateException","RuntimeException","java.lang"],["IndexOutOfBoundsException","RuntimeException","java.lang"],
  ["NegativeArraySizeException","RuntimeException","java.lang"],["NullPointerException","RuntimeException","java.lang"],["UnsupportedOperationException","RuntimeException","java.lang"],
  ["ArrayIndexOutOfBoundsException","IndexOutOfBoundsException","java.lang"],["StringIndexOutOfBoundsException","IndexOutOfBoundsException","java.lang"],
  ["NumberFormatException","IllegalArgumentException","java.lang"],["ConcurrentModificationException","RuntimeException","java.util"],
  ["NoSuchElementException","RuntimeException","java.util"],["InputMismatchException","NoSuchElementException","java.util"],["EmptyStackException","RuntimeException","java.util"],
  ["IOException","Exception","java.io"],["FileNotFoundException","IOException","java.io"],["UncheckedIOException","RuntimeException","java.io"],["InterruptedException","Exception","java.lang"],
  ["CloneNotSupportedException","Exception","java.lang"],["VirtualMachineError","Error","java.lang"],["StackOverflowError","VirtualMachineError","java.lang"],
  ["OutOfMemoryError","VirtualMachineError","java.lang"],["AssertionError","Error","java.lang"],["DateTimeException","RuntimeException","java.time"],
  ["IllegalFormatException","IllegalArgumentException","java.util"],["MissingFormatArgumentException","IllegalFormatException","java.util"],
  ["IllegalFormatConversionException","IllegalFormatException","java.util"],["UnknownFormatConversionException","IllegalFormatException","java.util"],
  ["PatternSyntaxException","IllegalArgumentException","java.util.regex"]];
const BUILTIN_SRC="class Throwable { String message; Throwable cause;\n"+
  " Throwable() {}\n Throwable(String message) { this.message = message; }\n Throwable(String message, Throwable cause) { this.message = message; this.cause = cause; }\n"+
  " Throwable(Throwable cause) { this.cause = cause; if (cause != null) this.message = cause.toString(); }\n"+
  " public String getMessage() { return message; }\n public String getLocalizedMessage() { return getMessage(); }\n public Throwable getCause() { return cause; }\n"+
  " public Throwable initCause(Throwable c) { this.cause = c; return this; }\n"+
  " public String toString() { String m = getLocalizedMessage(); String n = getClass().getName(); return m != null ? n + \": \" + m : n; }\n}\n"+
  EXC.map(([n,p])=>"class "+n+" extends "+p+" { "+n+"() { super(); } "+n+"(String m) { super(m); } "+n+"(String m, Throwable c) { super(m, c); } "+n+"(Throwable c) { super(c); } }").join("\n");
let BUILTIN_AST=null;
const LAUNCH=["java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:104)","java.base/java.lang.reflect.Method.invoke(Method.java:565)",
  "jdk.compiler/com.sun.tools.javac.launcher.SourceLauncher.execute(SourceLauncher.java:258)","jdk.compiler/com.sun.tools.javac.launcher.SourceLauncher.run(SourceLauncher.java:138)",
  "jdk.compiler/com.sun.tools.javac.launcher.SourceLauncher.main(SourceLauncher.java:76)"];
const PKG={Throwable:"java.lang"};EXC.forEach(e=>PKG[e[0]]=e[2]);

/* names of library classes the interpreter knows (static members or constructors) */
const LIBCLS=new Set(["System","Math","Integer","Long","Double","Float","Character","Boolean","Short","Byte","String","StringBuilder","StringBuffer","Arrays","Collections",
  "List","Set","Map","Objects","Thread","Optional","Scanner","Random","ArrayList","LinkedList","HashMap","LinkedHashMap","TreeMap","HashSet","LinkedHashSet","TreeSet",
  "ArrayDeque","Stack","PriorityQueue","Comparator","Collectors","IntStream","Stream","Number","Object","Iterator","Iterable","Collection","Queue","Deque","Map.Entry","Entry",
  "Function","BiFunction","Predicate","Consumer","Supplier","Runnable","Comparable","UnaryOperator","BinaryOperator","BiConsumer","IntBinaryOperator","CharSequence","Vector","Character.UnicodeBlock","StrictMath","OptionalInt","OptionalDouble","Executors","LocalDate"]);
const FUNC_IFACES=new Set(["Runnable","Comparator","Function","BiFunction","Predicate","BiPredicate","Consumer","BiConsumer","Supplier","UnaryOperator","BinaryOperator","Callable",
  "IntBinaryOperator","IntUnaryOperator","IntPredicate","IntFunction","ToIntFunction","ToLongFunction","ToDoubleFunction","IntConsumer","Comparable","Iterable"]);

/* ============================== THE VM ============================== */
class Frame{constructor(vm,name,C,self,m){this.ns=0;this.id="f"+(++vm.fid);this.name=name;this.C=C;this.t=self;this.m=m;this.v=[];this.line=0;this.callLine=0;this.cap=null;this.hid=false;this.ret=undefined;this._d=0;this.isF=true;this.mname=m?m.name:"";}}

class VM{
  constructor(src,stdin,opts){
    this.src=src;this.stdin=stdin||"";this.inPos=0;this.opts=opts||{};
    this.nid=0;this.fid=0;this.frames=[];this.fr=null;this.depth=0;this.quiet=0;
    this.CL=new Map();this.pool=new Map();this.bcache=new Map();this.statAreas=[];this.sk=[];
    this.out="";this.errR=[];this.steps=[];this.cur=new Map();this.dirty=[];this.chg=new Set();this.notes=[];
    this.anonN=new Map();this.clsObjs=new Map();this.lamN=new Map();this.objCount=0;this.all=[];this.freed=0;
    this.maxSteps=this.opts.maxSteps||MAX_STEPS;this.ps=null;this.nsteps=0;this.lastCp=0;this.cps=[];}
  /* ---------- class registry ---------- */
  load(){
    if(!BUILTIN_AST)BUILTIN_AST=parse(BUILTIN_SRC);
    for(const d of BUILTIN_AST.types)this.mkClass(d,null,true);
    this.ast=parse(this.src);
    for(const d of this.ast.types)this.mkClass(d,null,false);
    for(const C of this.allC)this.link(C);}
  mkClass(def,outer,builtin){
    const name=def.name;
    const C={def,name,simple:name,qname:outer?outer.qname+"$"+name:(builtin?(PKG[name]||"java.lang")+"."+name:name),outer,builtin,kind:def.kind,sup:null,ifaces:[],ifn:[],
      fields:[],sfields:[],methods:new Map(),ctors:def.ctors,inits:def.inits,statics:{},st:0,abs:def.mods.has("abstract")||def.kind==="interface",
      stNested:!outer||def.mods.has("static")||def.kind!=="class"||outer.kind==="interface",anon:!!def.anon,comps:def.comps,consts:def.consts,sa:null,lamIx:0};
    for(const f of def.fields)(f.st?C.sfields:C.fields).push(f);
    if(def.comps)for(const c of def.comps)C.fields.push({n:c.n,t:c.t,init:null,st:false,fin:true,line:def.line,cls:def});
    for(const m of def.methods){if(!C.methods.has(m.name))C.methods.set(m.name,[]);C.methods.get(m.name).push(m);m.C=C;}
    for(const c of def.ctors)c.C=C;
    if(!def.anon){
      if(!builtin&&this.CL.has(name)&&!this.CL.get(name).builtin)throw new CompileError(def.line,"duplicate class: "+name);
      this.CL.set(name,C);if(outer)this.CL.set(outer.name+"."+name,C);}
    (this.allC||(this.allC=[])).push(C);
    for(const n of def.nested)this.mkClass(n,C,builtin);
    return C;}
  link(C){
    const d=C.def;
    if(d.sup){const S=this.cls(d.sup.n);if(!S){if(LIBCLS.has(d.sup.n)&&d.sup.n!=="Object")throw new CompileError(d.line,"extending the library class "+d.sup.n+" is not supported in the visualizer, use Run for real output");
        if(d.sup.n!=="Object")throw new CompileError(d.line,"cannot find symbol\n  symbol: class "+d.sup.n);}
      else if(S.kind==="interface"&&C.anon){C.ifaces.push(S);C.ifn.push(S.name);}
      else C.sup=S;}
    for(const t of d.ifaces){const I=this.cls(t.n);C.ifn.push(t.n);if(I)C.ifaces.push(I);}
    for(const f of C.sfields)C.statics[f.n]=defVal(f.t.d?"":f.t.n);
    if(C.kind==="enum")for(const k of C.consts)C.statics[k.n]=null;}
  cls(n){if(!n)return null;const i=n.lastIndexOf(".");const C=this.CL.get(n)||(i>=0?this.CL.get(n.slice(i+1)):null);return C||null;}
  isSub(C,name){for(let K=C;K;K=K.sup){if(K.name===name||K.qname===name)return true;if(this.ifHas(K,name))return true;}return false;}
  ifHas(K,name){if(K.ifn.includes(name))return true;for(const I of K.ifaces)if(I.name===name||this.ifHas(I,name))return true;for(const I of K.ifaces)if(I.sup&&this.isSub(I,name))return true;return false;}
  allFields(C){if(C._af)return C._af;const r=C.sup?this.allFields(C.sup).slice():[];for(const f of C.fields)r.push({n:f.n,t:f.t,C});return C._af=r;}
  ftype(C,n){for(let K=C;K;K=K.sup)for(const f of K.fields)if(f.n===n)return f.t;return null;}
  sowner(C,n){for(let K=C;K;K=K.sup){if(K.sfields.some(f=>f.n===n)||(K.kind==="enum"&&K.consts.some(k=>k.n===n)))return K;for(const I of K.ifaces){const r=this.sowner(I,n);if(r)return r;}}return null;}
  sftype(C,n){const f=C.sfields.find(f=>f.n===n);return f?f.t:{n:C.name,d:0,a:[]};}
  nestedOf(C,n){for(let K=C;K;K=K.sup){const N=this.CL.get(K.name+"."+n);if(N)return N;}return null;}
  initClass(C){
    if(C.st)return;C.st=1;
    if(C.sup)this.initClass(C.sup);
    if(!C.builtin){C.sa={id:"S:"+C.qname,isS:true,C,_d:0};this.statAreas.push(C.sa.id);this.rebuildSk();this.touch(C.sa);}
    const sinit=C.inits.filter(i=>i.st);
    if(!sinit.length&&C.kind!=="enum"){C.st=2;return;}
    const F=new Frame(this,(C.simple||C.qname)+".<clinit>",C,null,null);F.mname="<clinit>";if(C.builtin)F.hid=true;
    this.push(F,this.fr?this.fr.line:0);
    try{
      if(C.kind==="enum")C.consts.forEach(k=>{F.line=k.line;this.step(k.line,"line");const args=k.args.map(a=>this.ev(a));
        let K=C;if(k.body){K=this.mkClass(k.body,C,false);K.qname=C.qname+"$"+(++C.lamIx);K.simple="";K.name=C.name;this.link(K);K.sup=C;}
        const o=this.newRaw(K);o.en=k.n;o.ord=k.ord;this.runCtor(K,this.pickCtor(K,args,k),o,args,k.line);C.statics[k.n]=o;this.touch(C.sa);});
      for(const it of sinit){F.line=it.line;
        if(it.field){this.step(it.line,"line");if(it.field.init){const v=it.field.init.k==="ArrInit"?this.arrInit(it.field.init,it.field.t):this.ev(it.field.init);C.statics[it.field.n]=this.coerce(it.field.t,v);this.touch(C.sa);this.chg.add(C.sa.id+":"+it.field.n);}}
        else{const c=this.block(it.block.st);}}}
    finally{this.pop();}
    C.st=2;}
  /* ---------- frames, recorder hooks ---------- */
  rebuildSk(){this.sk=this.statAreas.concat(this.frames.filter(f=>!f.hid).map(f=>f.id));}
  push(F,callLine){F.callLine=callLine||0;if(this.fr){this.fr.line=callLine||this.fr.line;this.touch(this.fr);}
    if(this.frames.length&&this.frames[this.frames.length-1].hid)F.hid=F.hid||false;
    this.frames.push(F);this.fr=F;this.depth++;if(!F.hid)this.sk=this.sk.concat([F.id]);this.touch(F);}
  pop(){const F=this.frames.pop();this.depth--;this.fr=this.frames[this.frames.length-1]||null;if(!F.hid)this.sk=this.sk.slice(0,-1);if(this.fr)this.touch(this.fr);return F;}
  touch(e){if(!e._d){e._d=1;this.dirty.push(e);}}
  note(n){if(!this.quiet&&this.notes.length<8)this.notes.push(n);}
  /* ---------- heap ---------- */
  alloc(kind,cls,props){const o=new HObj(++this.nid,kind,cls);if(props)Object.assign(o,props);this.objCount++;this.all.push(o);this.touch(o);this.chg.add("h"+o.id);return o;}
  str(s){return this.alloc("str","String",{s,pool:false});}
  lit(s){let o=this.pool.get(s);if(!o){o=this.alloc("str","String",{s,pool:true});this.pool.set(s,o);}else this.note({t:"pooled",o});return o;}
  intern(o){const e=this.pool.get(o.s);if(e)return e;o.pool=true;this.touch(o);this.pool.set(o.s,o);return o;}
  box(v,as){
    if(v===null||v===undefined||v instanceof HObj)return v;
    if(as&&WRAP[as]&&WRAP[as]!==vtype(v))v=toPrim(WRAP[as],v);
    if(typeof v==="number"){if(as==="Short"||as==="Byte")return this.boxOf(as,v,v>=-128&&v<=127);return this.boxOf("Integer",v,v>=-128&&v<=127);}
    if(typeof v==="bigint")return this.boxOf("Long",v,v>=-128n&&v<=127n);
    if(typeof v==="boolean")return this.boxOf("Boolean",v,true);
    if(v instanceof JChr)return this.boxOf("Character",v,v.c<=127);
    if(v instanceof JDbl)return this.alloc("box","Double",{v});
    if(v instanceof JFlt)return this.alloc("box","Float",{v});
    return v;}
  boxOf(cls,v,cached){if(!cached)return this.alloc("box",cls,{v});const key=cls+":"+(v instanceof JChr?v.c:String(v));let o=this.bcache.get(key);
    if(!o){o=this.alloc("box",cls,{v,cached:true});this.bcache.set(key,o);}else this.note({t:"cache",o});return o;}
  unbox(v,n){if(v instanceof HObj){if(v.kind==="box")return v.v;this.fatal(n,"bad operand type "+vtype(v));}
    if(v===null)this.thr("NullPointerException",n&&n.k?this.unboxMsg(n):null,n);return v;}
  unboxMsg(n){const st=this.staticTypeOf(n);const W=st&&WRAP[st]?st:"Integer";return 'Cannot invoke "java.lang.'+W+"."+WRAP[W]+'Value()" because '+this.desc(n)+" is null";}
  needPrim(t,v,n){if(v===null&&t&&t.d===0&&PRIM.has(t.n))this.thr("NullPointerException",this.unboxMsg(n),n);return v;}
  newRaw(C){const f={};for(const x of this.allFields(C))f[x.n]=defVal(x.t.d?"":x.t.n);const o=this.alloc("obj",C,{f});if(this.isSub(C,"Throwable"))o.trace=this.trace();return o;}
  newArr1(et,len,n){if(len<0)this.thr("NegativeArraySizeException",String(len),n);const dv=defVal(et.endsWith("]")?"":et);const a=new Array(len);for(let i=0;i<len;i++)a[i]=dv;return this.alloc("arr",null,{et,a});}
  /* ---------- errors ---------- */
  fatal(n,msg){throw new Fatal(n&&n.line||(this.fr?this.fr.line:0),msg);}
  noSym(n,what){this.fatal(n,"cannot find symbol\n  symbol: "+(what||"variable "+n.n));}
  mkEx(name,msg){const C=this.cls(name);this.initClass(C);const o=this.newRaw(C);o.f.message=msg==null?null:this.str(msg);this.touch(o);return o;}
  thr(name,msg,n){if(n&&n.line&&this.fr)this.fr.line=n.line;const o=this.mkEx(name,msg);this.throwObj(o,n);}
  throwObj(o,n){const line=n&&n.line||(this.fr?this.fr.line:0);this.note({t:"throw",o});this.inflight=o.id;this.step(line,"exception");this.inflight=null;throw new JThrow(o);}
  trace(){const r=[];for(let i=this.frames.length-1;i>=0;i--){const F=this.frames[i];if(F.hid)continue;r.push({c:F.C?F.C.qname:"",m:F.mname,l:F.line});}
    if(this.frames.length&&this.frames[0].isMain)for(const raw of LAUNCH)r.push({raw});return r;}
  desc(n){ // how the JVM's helpful NullPointerException names an expression
    if(!n)return '"<unknown>"';
    switch(n.k){
      case "Name":{const r=this.find(n.n);if(r&&r.k===2)return '"this.'+n.n+'"';if(r&&r.k===3)return '"'+r.C.qname+"."+n.n+'"';
        if(r&&r.k===1)return this.opts.names?'"'+n.n+'"':'"<local'+r.e.sl+'>"';if(r&&r.k===4&&this.fr.capSl&&this.fr.capSl.has(n.n))return this.opts.names?'"'+n.n+'"':'"<local'+this.fr.capSl.get(n.n)+'>"';return '"'+n.n+'"';}
      case "Field":{const inner=this.desc(n.o);if(inner.startsWith('"'))return '"'+inner.slice(1,-1)+"."+n.n+'"';return '"'+n.n+'"';}
      case "Index":{const a=this.desc(n.a),i=n.i.k==="Lit"?String(n.i.v):n.i.k==="Name"?n.i.n:"...";return '"'+a.slice(1,-1)+"["+i+']"';}
      case "Call":return 'the return value of "'+this.mdesc(n)+'"';
      case "Paren":return this.desc(n.e);
      case "Cast":return this.desc(n.e);
      case "This":return '"this"';}
    return '"<expression>"';}
  mdesc(n){let C=null;if(n.o===null&&this.fr)C=this.fr.C;
    const ms=C?this.methodsNamed(C,n.n):[];const m=ms.find(m=>m.params.length===n.args.length);
    if(m)return (m.C.qname)+"."+n.n+"("+m.params.map(p=>tstr({n:p.t.n,d:p.t.d,a:[]})).join(", ")+")";
    return n.n+"()";}
  /* ---------- types and conversions ---------- */
  coerce(t,v){
    if(!t||v===undefined)return v;
    if(t.d===0&&PRIM.has(t.n)){if(v instanceof HObj){if(v.kind!=="box")return v;v=v.v;}else if(v===null)this.thr("NullPointerException",null);return toPrim(t.n,v);}
    if(isPrim(v))return this.box(v,WRAP[t.n]?t.n:null);
    if(v&&v.kind==="lambda"&&!v.iface&&t.d===0){const I=this.cls(t.n);if(I&&I.kind==="interface")v.iface=I;else if(!I)v.ifn=t.n;}
    return v;}
  cast(t,v,n){
    if(t.d===0&&PRIM.has(t.n)){if(v instanceof HObj&&v.kind==="box")v=v.v;else if(v===null)this.thr("NullPointerException",null,n);else if(v instanceof HObj)this.fatal(n,"incompatible types: "+vtype(v)+" cannot be converted to "+t.n);
      if(t.n==="boolean"&&typeof v!=="boolean")this.fatal(n,"incompatible types: "+vtype(v)+" cannot be converted to boolean");return toPrim(t.n,v);}
    if(isPrim(v))return this.box(v,WRAP[t.n]?t.n:null);
    if(v===null)return null;
    if(!this.instOf(v,t))this.thr("ClassCastException","class "+this.jname(v)+" cannot be cast to class "+this.tname(t),n);
    return v;}
  jname(v){if(v.kind==="obj")return v.cls.qname;if(v.kind==="str")return "java.lang.String";if(v.kind==="box")return "java.lang."+v.cls;if(v.kind==="arr")return "["+v.et;return "java.util."+v.cls;}
  tname(t){const C=this.cls(t.n);if(C)return C.qname;if(WRAP[t.n]||["String","Object","Number","Comparable"].includes(t.n))return "java.lang."+t.n;return t.n;}
  instOf(v,t){
    if(v===null||v===undefined)return false;
    if(isPrim(v))v=this.box(v);
    const n=t.n;
    if(t.d>0){if(v.kind!=="arr")return false;if(n==="Object"&&t.d<=v.et.split("[").length)return true;return ekey(t)===v.et||(!PRIM.has(n)&&!PRIM.has(v.et.replace(/\[\]/g,"")));}
    if(n==="Object")return true;
    switch(v.kind){
      case "str":return ["String","CharSequence","Comparable"].includes(n);
      case "box":return v.cls===n||(n==="Number"&&v.cls!=="Character"&&v.cls!=="Boolean")||n==="Comparable";
      case "obj":return this.isSub(v.cls,n)||(n==="Comparable"&&v.cls.kind==="enum")||(n==="Enum"&&v.cls.kind==="enum")||(n==="Record"&&v.cls.kind==="record");
      case "arr":return false;
      case "lambda":return !v.iface||v.iface.name===n||this.isSub(v.iface,n)||FUNC_IFACES.has(n);
      default:{const K=LIBKIND[v.cls]||[];return v.cls===n||K.includes(n);}}}
  /* ---------- names, fields ---------- */
  find(name){
    const F=this.fr;if(!F)return null;
    for(let i=F.v.length-1;i>=0;i--)if(F.v[i].n===name)return {k:1,e:F.v[i],F};
    if(F.cap&&F.cap.has(name))return {k:4,v:F.cap.get(name)};
    let C=F.C,o=F.t;
    while(C){
      if(o&&o.kind==="obj"&&o.f&&name in o.f&&this.isSub(o.cls,C.name))return {k:2,o,n:name};
      if(o&&o.kind==="obj"&&o.f&&name in o.f)return {k:2,o,n:name};
      const S=this.sowner(C,name);if(S)return {k:3,C:S,n:name};
      if(o&&o.cap&&o.cap.has(name))return {k:4,v:o.cap.get(name)};
      o=o?o.outer||null:null;C=C.outer;}
    return null;}
  rget(r,n){
    switch(r.k){
      case 1:if(r.e.v===UNINIT)this.fatal(n,"variable "+r.e.n+" might not have been initialized");return r.e.v;
      case 2:return r.o.f[r.n];
      case 3:this.initClass(r.C);return r.C.statics[r.n];
      case 4:return r.v;}}
  rset(r,v,n,lbl){
    switch(r.k){
      case 1:{const e=r.e;e.v=this.coerce(e.ty,v);this.touch(r.F);this.chg.add(r.F.id+":"+e.n);this.note({t:"set",l:lbl||e.n,v:e.v});return e.v;}
      case 2:{const t=this.ftype(r.o.cls,r.n);const x=this.coerce(t,v);r.o.f[r.n]=x;this.touch(r.o);this.chg.add("h"+r.o.id+":"+r.n);this.note({t:"set",l:lbl||"this."+r.n,v:x});return x;}
      case 3:{this.initClass(r.C);const x=this.coerce(this.sftype(r.C,r.n),v);r.C.statics[r.n]=x;if(r.C.sa){this.touch(r.C.sa);this.chg.add(r.C.sa.id+":"+r.n);}this.note({t:"set",l:lbl||r.C.simple+"."+r.n,v:x});return x;}
      case 4:this.fatal(n,"local variables referenced from a lambda expression must be final or effectively final");}}
  declare(name,ty,v,line){
    const F=this.fr;const e={n:name,t:ty?tstr(ty):vtype(v),ty,v:v===UNINIT?UNINIT:this.coerce(ty,v)};
    const lo=F.marks!==undefined?F.marks:0;
    for(let i=F.v.length-1;i>=0;i--)if(F.v[i].n===name){if(i>=(F.scope0||0)){F.v.splice(i,1);break;}}
    e.sl=F.ns;F.ns+=wideT(ty,e.v)?2:1;
    F.v.push(e);this.touch(F);this.chg.add(F.id+":"+name);if(v!==UNINIT)this.note({t:"set",l:name,v:e.v,decl:1});return e;}
  trunc(mk){const F=this.fr;if(F.v.length>mk){F.v.length=mk;this.touch(F);}}
  target(x){
    if(x.k==="Name"){const r=this.find(x.n);if(r)return {v:this.rget(r,x)};const C=this.cls(x.n);if(C)return {C};if(LIBCLS.has(x.n))return {L:x.n};if(x.n==="java"||x.n==="javax")return {P:x.n};this.noSym(x);}
    if(x.k==="Field"){const t=this.target(x.o);
      if(t.P){if(/^[A-Z]/.test(x.n)){if(LIBCLS.has(x.n))return {L:x.n};this.fatal(x,t.P+"."+x.n+" is not supported in the visualizer, use Run for real output");}return {P:t.P+"."+x.n};}
      if(t.C){const N=this.nestedOf(t.C,x.n);if(N)return {C:N};return {v:this.getStatic(t.C,x.n,x)};}
      if(t.L){if(t.L==="Map"&&x.n==="Entry")return {L:"Map.Entry"};return {v:this.libField(t.L,x.n,x)};}
      return {v:this.fieldOf(t.v,x.o,x.n,x)};}
    if(x.k==="Super")return {v:this.fr.t};
    return {v:this.ev(x)};}
  getStatic(C,n,x){const S=this.sowner(C,n);if(!S){if(n==="length")this.fatal(x,"cannot find symbol");this.noSym(x,"variable "+n);}this.initClass(S);return S.statics[n];}
  fieldOf(o,on,n,x){
    if(o===null)this.thr("NullPointerException",n==="length"?"Cannot read the array length because "+this.desc(on)+" is null":'Cannot read field "'+n+'" because '+this.desc(on)+" is null",x);
    if(o instanceof HObj){if(o.kind==="arr"&&n==="length")return o.a.length;if(o.kind==="obj"&&n in o.f)return o.f[n];}
    if(o instanceof HObj&&o.kind==="obj"){const S=this.sowner(o.cls,n);if(S){this.initClass(S);return S.statics[n];}}
    this.fatal(x,"cannot find symbol\n  symbol: variable "+n);}
  lval(t){ // an assignable place: {get, set, lbl}
    if(t.k==="Name"){const r=this.find(t.n);if(!r)this.noSym(t);return {get:()=>this.rget(r,t),set:v=>this.rset(r,v,t,t.n),lbl:t.n,ty:r.k===1?r.e.ty:r.k===2?this.ftype(r.o.cls,r.n):r.k===3?this.sftype(r.C,r.n):null};}
    if(t.k==="Field"){
      let o;if(t.o.k==="Super"||t.o.k==="This")o=this.fr.t;else{const tg=this.target(t.o);
        if(tg.C){const S=this.sowner(tg.C,t.n);if(!S)this.noSym(t);const r={k:3,C:S,n:t.n};return {get:()=>this.rget(r,t),set:v=>this.rset(r,v,t,S.simple+"."+t.n),lbl:S.simple+"."+t.n,ty:this.sftype(S,t.n)};}
        o=tg.v;}
      const lbl=this.label(t);
      if(o===null)this.thr("NullPointerException",'Cannot assign field "'+t.n+'" because '+this.desc(t.o)+" is null",t);
      if(!(o instanceof HObj)||o.kind!=="obj"||!(t.n in o.f)){if(o&&o.kind==="arr"&&t.n==="length")this.fatal(t,"cannot assign a value to final variable length");this.noSym(t);}
      const r={k:2,o,n:t.n};return {get:()=>o.f[t.n],set:v=>this.rset(r,v,t,lbl),lbl,ty:this.ftype(o.cls,t.n)};}
    if(t.k==="Index"){const a=this.ev(t.a),i=this.toI(this.ev(t.i),t.i);
      if(a===null)this.thr("NullPointerException","Cannot store to "+this.arrWord(t)+" array because "+this.desc(t.a)+" is null",t);
      const lbl=this.label(t.a)+"["+i+"]";
      const chk=()=>{if(i<0||i>=a.a.length)this.thr("ArrayIndexOutOfBoundsException","Index "+i+" out of bounds for length "+a.a.length,t);};
      const et=a.et,ety=et.endsWith("]")?null:{n:et,d:0,a:[]};
      return {get:()=>{chk();return a.a[i];},set:v=>{chk();const x=ety&&PRIM.has(et)?this.coerce(ety,v):isPrim(v)?this.box(v,WRAP[et]?et:null):v;a.a[i]=x;this.touch(a);this.chg.add("h"+a.id+":"+i);this.note({t:"set",l:lbl,v:x});return x;},lbl,ty:ety};}
    this.fatal(t,"unexpected type");}
  arrWord(t){return "the";}
  label(n){switch(n.k){case "Name":return n.n;case "Field":return this.label(n.o)+"."+n.n;case "This":return "this";case "Index":return this.label(n.a)+"["+(n.i.k==="Lit"?n.i.v:n.i.k==="Name"?n.i.n:"…")+"]";case "Call":return n.n+"(…)";case "Paren":return this.label(n.e);}return "…";}
  toI(v,n){v=v instanceof HObj?this.unbox(v,n):v;if(v===null)this.unbox(null,n);if(v instanceof JChr)return v.c;if(typeof v!=="number")this.fatal(n,"incompatible types: possible lossy conversion from "+vtype(v)+" to int");return v;}
  cond(e){let v=this.ev(e);if(v instanceof HObj&&v.kind==="box")v=v.v;else if(v===null)this.thr("NullPointerException",'Cannot invoke "java.lang.Boolean.booleanValue()" because '+this.desc(e)+" is null",e);if(typeof v!=="boolean")this.fatal(e,"incompatible types: "+vtype(v)+" cannot be converted to boolean");return v;}
  /* ---------- statements ---------- */
  body(st){for(const s of st){const c=this.exec(s);if(c)return c;}} // a method body: locals stay visible for the return step
  block(st){const F=this.fr,mk=F.v.length,ns=F.ns;try{for(const s of st){const c=this.exec(s);if(c)return c;}}finally{if(this.fr===F){this.trunc(mk);F.ns=ns;}}}
  loopCtl(c,label){ // returns 0 = continue looping, 1 = break the loop, 2 = propagate c
    if(c.k==="b")return c.l==null||c.l===label?1:2;
    if(c.k==="c")return c.l==null||c.l===label?0:2;
    return 2;}
  exec(s,label){
    const F=this.fr;
    switch(s.k){
      case "Block":return this.block(s.st);
      case "Empty":return;
      case "Local":F.line=s.line;this.step(s.line,"line");
        for(const d of s.decls){let v=UNINIT,ty=s.t.n==="var"&&s.t.d===0?null:d.t;
          if(d.init){v=d.init.k==="ArrInit"?this.arrInit(d.init,d.t):this.needPrim(ty,this.ev(d.init),d.init);if(ty===null&&v&&v.kind==="lambda")this.fatal(s,"cannot infer type for local variable "+d.n+"\n  (lambda expression needs an explicit target-type)");}
          this.declare(d.n,ty,v,s.line);}
        return;
      case "ExprS":F.line=s.line;this.step(s.line,"line");this.ev(s.e);return;
      case "If":F.line=s.line;this.step(s.line,"line");if(this.cond(s.c))return this.exec(s.th);if(s.el)return this.exec(s.el);return;
      case "While":for(;;){F.line=s.line;this.step(s.line,"line");if(!this.cond(s.c))return;const c=this.exec(s.body,null);if(c){const r=this.loopCtl(c,label);if(r===1)return;if(r===2)return c;}}
      case "Do":for(;;){const c=this.exec(s.body,null);if(c){const r=this.loopCtl(c,label);if(r===1)return;if(r===2)return c;}F.line=s.cline;this.step(s.cline,"line");if(!this.cond(s.c))return;}
      case "For":{const mk=F.v.length,ns0=F.ns;F.line=s.line;this.step(s.line,"line");
        try{for(const i of s.init){if(i.k==="Local"){for(const d of i.decls){const v=d.init?(d.init.k==="ArrInit"?this.arrInit(d.init,d.t):this.ev(d.init)):UNINIT;this.declare(d.n,i.t.n==="var"?null:d.t,v,s.line);}}else this.ev(i.e);}
          let first=true;
          for(;;){if(!first){F.line=s.line;this.step(s.line,"line");for(const u of s.upd)this.ev(u);}first=false;
            if(s.c&&!this.cond(s.c))return;
            const c=this.exec(s.body,null);if(c){const r=this.loopCtl(c,label);if(r===1)return;if(r===2)return c;}}}
        finally{if(this.fr===F){this.trunc(mk);F.ns=ns0;}}}
      case "ForEach":return this.forEach(s,label);
      case "Labeled":{const c=this.exec(s.body,s.label);if(c&&c.k==="b"&&c.l===s.label)return;return c;}
      case "Return":{F.line=s.line;this.step(s.line,"line");let v;
        if(s.e){v=this.ev(s.e);if(F.m&&F.m.ret)v=this.coerce(F.m.ret,v);}
        F.ret=v===undefined?"void":v;this.touch(F);this.note({t:"ret",F,v});this.step(s.line,"return");return {k:"r",v};}
      case "Break":F.line=s.line;this.step(s.line,"line");return {k:"b",l:s.label};
      case "Continue":F.line=s.line;this.step(s.line,"line");return {k:"c",l:s.label};
      case "Yield":F.line=s.line;if(!s.arrowExpr)this.step(s.line,"line");return {k:"y",v:this.ev(s.e)};
      case "Throw":{F.line=s.line;this.step(s.line,"line");const o=this.ev(s.e);if(o===null)this.thr("NullPointerException",'Cannot throw exception because '+this.desc(s.e)+" is null",s);
        if(!(o instanceof HObj)||o.kind!=="obj"||!this.isSub(o.cls,"Throwable"))this.fatal(s,"incompatible types: "+vtype(o)+" cannot be converted to Throwable");
        this.throwObj(o,s);}
      case "Try":return this.tryStmt(s);
      case "Switch":{F.line=s.line;this.step(s.line,"line");const r=this.switchRun(s);if(r&&r.k==="b"&&r.l==null)return;return r;}
      case "Sync":{F.line=s.line;this.step(s.line,"line");const l=this.ev(s.l);if(l===null)this.thr("NullPointerException",null,s);return this.exec(s.body);}
      case "Assert":F.line=s.line;this.step(s.line,"line");return; // assertions are disabled by default (java without -ea)
      case "CtorCall":this.fatal(s,"call to "+s.kind+" must be first statement in constructor");
    }
    this.fatal(s,"unsupported statement "+s.k);}
  forEach(s,label){
    const F=this.fr;F.line=s.line;this.step(s.line,"line");
    const it=this.ev(s.it);if(it===null)this.thr("NullPointerException",null,s);
    const mk=F.v.length,ty=s.t.n==="var"?null:s.t,ns0=F.ns;
    F.ns+=it.kind==="arr"?3:1; // javac's hidden locals: array copy, length, index (or the Iterator)
    const ns1=F.ns;
    const one=(v,i)=>{if(i>0){F.line=s.line;this.step(s.line,"line");}this.trunc(mk);F.ns=ns1;this.declare(s.n,ty,v,s.line);const c=this.exec(s.body,null);this.trunc(mk);return c;};
    try{
      if(it.kind==="arr"){for(let i=0;i<it.a.length;i++){const c=one(it.a[i],i);if(c){const r=this.loopCtl(c,label);if(r===1)return;if(r===2)return c;}}return;}
      const I=this.iterOf(it,s);let i=0;
      while(this.itHas(I)){const v=this.itNext(I,s);const c=one(v,i++);if(c){const r=this.loopCtl(c,label);if(r===1)return;if(r===2)return c;}}}
    finally{if(this.fr===F){this.trunc(mk);F.ns=ns0;}}}
  tryStmt(s){
    const F=this.fr;F.line=s.line;this.step(s.line,"line");
    const mk=F.v.length,ns0=F.ns,res=[];let comp,pend=null;
    try{
      try{for(const r of s.res){if(r.k==="Local"){for(const d of r.decls){const v=this.ev(d.init);this.declare(d.n,r.t.n==="var"?null:r.t,v,r.line);res.push(v);}}else res.push(this.ev(r.e));}
        comp=this.exec(s.b);}
      catch(e){if(!(e instanceof JThrow))throw e;pend=e;}
      for(let i=res.length-1;i>=0;i--){const r=res[i];if(r!==null){try{this.vcall(r,"close",[],s);}catch(e){if(!(e instanceof JThrow))throw e;if(!pend)pend=e;}}}
      if(pend){const h=s.cs.find(c=>c.ts.some(t=>this.instOf(pend.obj,t)));
        if(h){const ex=pend;pend=null;const m2=F.v.length;F.ns=ns0;F.line=h.line;this.declare(h.n,h.ts.length===1?h.ts[0]:{n:"Exception",d:0,a:[]},ex.obj,h.line);this.note({t:"catch",o:ex.obj});this.step(h.line,"line");
          try{comp=this.exec(h.b);}catch(e){if(!(e instanceof JThrow))throw e;pend=e;}finally{if(this.fr===F)this.trunc(m2);}}}}
    finally{if(this.fr===F){this.trunc(mk);F.ns=ns0;}}
    if(s.fin){const fc=this.exec(s.fin);if(fc)return fc;}
    if(pend)throw pend;
    return comp;}
  caseMatch(v,lab,ty){
    if(lab.k==="Default")return false;
    if(v instanceof HObj&&v.kind==="obj"&&v.cls.kind!=="class"&&v.en!==undefined){if(lab.k==="Name")return v.en===lab.n;if(lab.k==="Field")return v.en===lab.n;return false;}
    const c=this.ev(lab);
    if(v instanceof HObj&&v.kind==="str")return c instanceof HObj&&c.kind==="str"&&c.s===v.s;
    return num(v)===num(c instanceof HObj?c.v:c);}
  switchRun(s){
    let v=this.ev(s.e);
    if(v===null)this.thr("NullPointerException",null,s);
    if(v instanceof HObj&&v.kind==="box")v=v.v;
    let idx=-1,def=-1;
    for(let i=0;i<s.cases.length&&idx<0;i++){const c=s.cases[i];if(c.labels===null){def=i;continue;}
      for(const l of c.labels){if(l.k==="Default"){def=i;continue;}if(this.caseMatch(v,l)){idx=i;break;}}}
    if(idx<0)idx=def;
    const F=this.fr,ns0=F.ns;if(v instanceof HObj&&v.kind==="str")F.ns+=2; // javac's temps for a String switch
    try{return this.switchBody(s,idx);}finally{F.ns=ns0;}}
  switchBody(s,idx){
    if(idx<0){if(s.isExpr)this.fatal(s,"the switch expression does not cover all possible input values");return;}
    if(s.arrow){const c=s.cases[idx];for(const st of c.body){const r=this.exec(st);if(r)return r;}return;}
    for(let i=idx;i<s.cases.length;i++){const r=this.block(s.cases[i].body);if(r)return r;}}
  /* ---------- expressions ---------- */
  ev(n){
    switch(n.k){
      case "Lit":switch(n.t){
        case "String":return this.lit(n.v);
        case "int":case "long":case "boolean":return n.v;
        case "double":return n.cv||(n.cv=new JDbl(n.v));
        case "float":return n.cv||(n.cv=new JFlt(n.v));
        case "char":return chr(n.v);
        case "null":return null;}
        break;
      case "Name":{const r=this.find(n.n);if(!r){if(this.cls(n.n)||LIBCLS.has(n.n))this.fatal(n,"cannot find symbol\n  symbol: variable "+n.n);this.noSym(n);}return this.rget(r,n);}
      case "Paren":return this.ev(n.e);
      case "This":{if(!this.fr.t)this.fatal(n,"non-static variable this cannot be referenced from a static context");
        if(n.outer){let o=this.fr.t;while(o&&!(o.kind==="obj"&&o.cls.name===n.outer))o=o.outer;return o||this.fr.t;}return this.fr.t;}
      case "Field":{if(n.o.k==="Super"||n.o.k==="This"&&!n.o.outer){const o=this.fr.t;if(!o)this.fatal(n,"non-static variable this cannot be referenced from a static context");if(o.f&&n.n in o.f)return o.f[n.n];const S=this.sowner(o.cls,n.n);if(S)return this.getStatic(S,n.n,n);this.noSym(n,"variable "+n.n);}
        const t=this.target(n);if(t.C)this.fatal(n,"cannot find symbol\n  symbol: variable "+n.n);if(t.L)this.fatal(n,"cannot find symbol");return t.v;}
      case "Index":{const a=this.ev(n.a),i=this.toI(this.ev(n.i),n.i);
        if(a===null)this.thr("NullPointerException","Cannot load from "+this.arrT(n.a)+" array because "+this.desc(n.a)+" is null",n);
        if(a.kind!=="arr")this.fatal(n,"array required, but "+vtype(a)+" found");
        if(i<0||i>=a.a.length)this.thr("ArrayIndexOutOfBoundsException","Index "+i+" out of bounds for length "+a.a.length,n);
        return a.a[i];}
      case "Call":return this.call(n);
      case "New":return this.newObj(n);
      case "NewArr":return n.init?this.arrInit(n.init,n.t):this.newArr(n);
      case "ArrInit":return this.arrInit(n,n.t);
      case "Assign":return this.assign(n);
      case "Bin":return this.bin(n);
      case "Un":return this.un(n);
      case "PreInc":case "PostInc":return this.inc(n);
      case "Cast":return this.cast(n.t,this.ev(n.e),n);
      case "Cond":{const c=this.cond(n.c);const v=this.ev(c?n.a:n.b);
        // numeric promotion between the two branches (cond ? 1 : 2.0 is a double)
        if(isPrim(v)&&n.a.k==="Lit"&&n.b.k==="Lit"&&n.a.t!==n.b.t&&["int","double","long","float","char"].includes(n.a.t)&&["int","double","long","float","char"].includes(n.b.t)){
          const order=["char","int","long","float","double"];const t=order[Math.max(order.indexOf(n.a.t),order.indexOf(n.b.t))];if(!(t==="int"&&(n.a.t==="char"||n.b.t==="char")))return toPrim(t,v);}
        return v;}
      case "InstOf":{const v=this.ev(n.e);const r=v!==null&&this.instOf(v,n.t);if(r&&n.bind)this.declare(n.bind,n.t,v,n.line);return r;}
      case "Lambda":return this.mkLambda(n);
      case "MRef":return this.mkMRef(n);
      case "Switch":{this.step(n.line,"line");const r=this.switchRun(n);if(r&&r.k==="y")return r.v;if(r&&r.k==="r")this.fatal(n,"return outside of enclosing switch expression");this.fatal(n,"switch expression completes without providing a value");}
      case "ClassLit":{const C=this.cls(n.t.n);return this.classObj(C,n.t.n);}
      case "Super":return this.fr.t;
      case "ValLit":return n.v;
      case "TypeRef":this.fatal(n,"unexpected type");}
    this.fatal(n,"unsupported expression "+n.k);}
  arrT(n){const v=this.peekType(n);return v||"object";}
  peekType(n){if(n.k==="Name"){const r=this.find(n.n);if(r&&r.k===1&&r.e.ty){const t=r.e.ty;return t.d>0?t.n+"[]".repeat(t.d-1):null;}if(r&&r.k===2){const t=this.ftype(r.o.cls,r.n);return t&&t.d>0?t.n+"[]".repeat(t.d-1):null;}}return null;}
  arrInit(n,t){const et=ekey(t),ety={n:t.n,d:t.d-1,a:t.a};
    const a=n.el.map(e=>e.k==="ArrInit"?this.arrInit(e,ety):(ety.d===0&&PRIM.has(ety.n)?this.coerce(ety,this.ev(e)):this.coerce(ety,this.ev(e))));
    const o=this.alloc("arr",null,{et,a});this.note({t:"alloc",o});return o;}
  newArr(n){const dims=n.dims.map(d=>this.toI(this.ev(d),d));
    const mk=(lv,t)=>{const et=ekey(t);const o=this.newArr1(et,dims[lv],n);if(lv<dims.length-1){const sub={n:t.n,d:t.d-1,a:t.a};for(let i=0;i<o.a.length;i++)o.a[i]=mk(lv+1,sub);}return o;};
    const o=mk(0,n.t);this.note({t:"alloc",o});return o;}
  assign(n){
    if(n.op==="="){
      if(n.t.k==="Index"){ // Java evaluates array, index, then the value, then checks
        const a=this.ev(n.t.a),i=this.toI(this.ev(n.t.i),n.t.i);const v=this.ev(n.v);
        if(a===null)this.thr("NullPointerException","Cannot store to "+this.arrT(n.t.a)+" array because "+this.desc(n.t.a)+" is null",n);
        if(i<0||i>=a.a.length)this.thr("ArrayIndexOutOfBoundsException","Index "+i+" out of bounds for length "+a.a.length,n);
        const et=a.et;const x=PRIM.has(et)?this.coerce({n:et,d:0,a:[]},v):isPrim(v)?this.box(v,WRAP[et]?et:null):v;
        a.a[i]=x;this.touch(a);this.chg.add("h"+a.id+":"+i);this.note({t:"set",l:this.label(n.t.a)+"["+i+"]",v:x});return x;}
      const L=this.lval(n.t);const v=n.v.k==="ArrInit"?this.arrInit(n.v,L.ty):this.needPrim(L.ty,this.ev(n.v),n.v);return L.set(v);}
    const L=this.lval(n.t);const old=L.get();const op=n.op.slice(0,-1);
    if(op==="+"&&old instanceof HObj&&old.kind==="str"){const r=this.ev(n.v);return L.set(this.str(old.s+this.jstr(r)));}
    if(old===null&&op==="+"&&L.ty&&L.ty.n==="String"){const r=this.ev(n.v);return L.set(this.str("null"+this.jstr(r)));}
    const r=this.ev(n.v);
    let res=this.binop(op,old,r,n);
    // compound assignment casts back to the variable's type
    const tk=L.ty&&L.ty.d===0&&PRIM.has(L.ty.n)?L.ty.n:(isPrim(old)?vtype(old):old&&old.kind==="box"?WRAP[old.cls]:null);
    if(tk&&isPrim(res))res=toPrim(tk,res);
    return L.set(res);}
  inc(n){const L=this.lval(n.e);let old=L.get();const b=old instanceof HObj&&old.kind==="box";const ov=b?old.v:old;
    if(ov===null)this.unbox(null,n.e);
    let nv;const one=n.op==="++"?1:-1;
    if(typeof ov==="number"){const tk=L.ty&&PRIM.has(L.ty.n)&&L.ty.d===0?L.ty.n:"int";nv=toPrim(tk,(ov+one)|0);}
    else if(typeof ov==="bigint")nv=BigInt.asIntN(64,ov+BigInt(one));
    else if(ov instanceof JChr)nv=chr((ov.c+one)&0xFFFF);
    else if(ov instanceof JDbl)nv=new JDbl(ov.v+one);
    else if(ov instanceof JFlt)nv=new JFlt(Math.fround(ov.v+one));
    else this.fatal(n,"bad operand type "+vtype(ov)+" for unary operator '"+n.op+"'");
    this.notes.push({t:"inc",l:L.lbl,o:ov,nv,op:n.op,pre:n.k==="PreInc"});
    const stored=L.set(nv);if(this.notes.length>1&&this.notes[this.notes.length-1].t==="set")this.notes.pop();
    return n.k==="PreInc"?stored:(b?old:ov);}
  un(n){
    if(n.op==="!"){return !this.cond(n.e);}
    let v=this.ev(n.e);if(v instanceof HObj)v=this.unbox(v,n.e);else if(v===null)this.unbox(null,n.e);
    switch(n.op){
      case "-":if(typeof v==="number")return (-v)|0;if(v instanceof JChr)return -v.c|0;if(typeof v==="bigint")return BigInt.asIntN(64,-v);if(v instanceof JDbl)return new JDbl(-v.v);if(v instanceof JFlt)return new JFlt(-v.v);break;
      case "+":return v instanceof JChr?v.c:v;
      case "~":if(typeof v==="number")return ~v;if(v instanceof JChr)return ~v.c;if(typeof v==="bigint")return ~v;break;}
    this.fatal(n,"bad operand type "+vtype(v)+" for unary operator '"+n.op+"'");}
  bin(n){
    const op=n.op;
    if(op==="&&")return this.cond(n.l)&&this.cond(n.r);
    if(op==="||")return this.cond(n.l)||this.cond(n.r);
    if(op==="+"){ // left-to-right chain: numbers add until a String appears, then everything concatenates (one String result)
      const ops=[];let x=n;while(x.k==="Bin"&&x.op==="+"){ops.push(x.r);x=x.l;}ops.push(x);ops.reverse();
      let acc=this.ev(ops[0]);if(acc instanceof HObj&&acc.kind==="str")acc=new SAcc(acc.s);
      for(let i=1;i<ops.length;i++){const v=this.ev(ops[i]);
        if(acc instanceof SAcc){acc.s+=this.jstr(v);continue;}
        if(v instanceof HObj&&v.kind==="str"){acc=new SAcc(this.jstr(acc)+v.s);continue;}
        if(!isPrim(acc)&&!(acc instanceof HObj&&acc.kind==="box")||!isPrim(v)&&!(v instanceof HObj&&v.kind==="box")){
          if(acc===null||v===null){const other=acc===null?v:acc;if(other===null||other instanceof HObj&&other.kind!=="box")this.fatal(n,"bad operand types for binary operator '+'");this.unbox(null,acc===null?ops[i-1]:ops[i]);}
          this.fatal(n,"bad operand types for binary operator '+'\n  first type:  "+vtype(acc)+"\n  second type: "+vtype(v));}
        acc=this.binop("+",acc,v,n);}
      if(acc instanceof SAcc){const o=this.str(acc.s);return o;}
      return acc;}
    const a=this.ev(n.l),b=this.ev(n.r);
    return this.binop(op,a,b,n);}
  binop(op,a,b,n){
    if(op==="=="||op==="!="){
      let eq;
      if(isRef(a)&&isRef(b)){eq=a===b;if(a&&b&&a.kind==="box"&&b.kind==="box"&&this.opts.noBoxIdentity)eq=num(a.v)===num(b.v);}
      else{if(a instanceof HObj)a=this.unbox(a,n.l);if(b instanceof HObj)b=this.unbox(b,n.r);if(a===null)a=this.unbox(null,n.l);if(b===null)b=this.unbox(null,n.r);
        if(typeof a==="boolean"||typeof b==="boolean")eq=a===b;else{const k=Math.max(kd(a),kd(b));eq=k===2?toL(a)===toL(b):num(a)===num(b);}}
      return op==="=="?eq:!eq;}
    if(a instanceof HObj)a=this.unbox(a,n&&n.l);else if(a===null)this.unbox(null,n&&n.l);
    if(b instanceof HObj)b=this.unbox(b,n&&n.r);else if(b===null)this.unbox(null,n&&n.r);
    switch(op){
      case "<":case ">":case "<=":case ">=":{const k=Math.max(kd(a),kd(b));if(!k||!kd(a)||!kd(b))this.fatal(n,"bad operand types for binary operator '"+op+"'");
        let x,y;if(k===2){x=toL(a);y=toL(b);}else{x=num(a);y=num(b);}
        return op==="<"?x<y:op===">"?x>y:op==="<="?x<=y:x>=y;}
      case "<<":case ">>":case ">>>":{const s=typeof b==="bigint"?Number(b&63n):(b instanceof JChr?b.c:b);
        if(typeof a==="bigint"){const c=BigInt(s&63);if(op==="<<")return BigInt.asIntN(64,a<<c);if(op===">>")return a>>c;return BigInt.asIntN(64,BigInt.asUintN(64,a)>>c);}
        const x=a instanceof JChr?a.c:a;if(typeof x!=="number")this.fatal(n,"bad operand types for binary operator '"+op+"'");const c=s&31;
        if(op==="<<")return x<<c;if(op===">>")return x>>c;return (x>>>c)|0;}
      case "&":case "|":case "^":if(typeof a==="boolean"&&typeof b==="boolean")return op==="&"?a&&b:op==="|"?a||b:a!==b;break;}
    const k=Math.max(kd(a),kd(b));
    if(!kd(a)||!kd(b))this.fatal(n,"bad operand types for binary operator '"+op+"'\n  first type:  "+vtype(a)+"\n  second type: "+vtype(b));
    if(k===1){const x=a instanceof JChr?a.c:a,y=b instanceof JChr?b.c:b;
      switch(op){case "+":return (x+y)|0;case "-":return (x-y)|0;case "*":return Math.imul(x,y);
        case "/":if(y===0)this.thr("ArithmeticException","/ by zero",n);return (x/y)|0;
        case "%":if(y===0)this.thr("ArithmeticException","/ by zero",n);return (x%y)|0;
        case "&":return x&y;case "|":return x|y;case "^":return x^y;}}
    if(k===2){const x=toL(a),y=toL(b);
      switch(op){case "+":return BigInt.asIntN(64,x+y);case "-":return BigInt.asIntN(64,x-y);case "*":return BigInt.asIntN(64,x*y);
        case "/":if(y===0n)this.thr("ArithmeticException","/ by zero",n);return BigInt.asIntN(64,x/y);
        case "%":if(y===0n)this.thr("ArithmeticException","/ by zero",n);return x%y;
        case "&":return x&y;case "|":return x|y;case "^":return x^y;}}
    const x=num(a),y=num(b);let r;
    switch(op){case "+":r=x+y;break;case "-":r=x-y;break;case "*":r=x*y;break;case "/":r=x/y;break;case "%":r=x%y;break;
      default:this.fatal(n,"bad operand types for binary operator '"+op+"'");}
    return k===3?new JFlt(Math.fround(r)):new JDbl(r);}
  /* Java's String.valueOf, as a JS string */
  jstr(v){
    if(v===null||v===undefined)return "null";
    if(typeof v==="number")return String(v);if(typeof v==="bigint")return v.toString();if(typeof v==="boolean")return v?"true":"false";
    if(v instanceof JChr)return String.fromCharCode(v.c);if(v instanceof JDbl)return fmtD(v.v);if(v instanceof JFlt)return fmtF(v.v);
    if(v.kind==="str")return v.s;if(v.kind==="box")return this.jstr(v.v);
    if(v.kind==="obj"){const r=this.vcall(v,"toString",[],null);return r===null?"null":r.s;}
    if(v.kind==="arr")return "["+(PRIM.has(v.et)?{int:"I",long:"J",double:"D",float:"F",char:"C",boolean:"Z",short:"S",byte:"B"}[v.et]:"L"+(this.tname({n:v.et.replace(/\[\]/g,""),d:0})))+(v.et.includes("[")?"":v.et.length&&!PRIM.has(v.et)?";":"")+"@"+this.ihash(v).toString(16);
    if(v.kind==="lambda")return (this.fr&&this.fr.C?this.fr.C.qname:"Main")+"$$Lambda/0x"+(0x7f000000+v.id*0x1f8).toString(16)+"@"+this.ihash(v).toString(16);
    return libToString(this,v);}
  ihash(o){if(o.ih===undefined){let x=(o.id*0x9E3779B1+0x5bd1e995)|0;x^=x>>>15;x=Math.imul(x,0x2c1b3c6d);x^=x>>>12;o.ih=(x>>>1)&0x7fffffff;if(o.ih<0x1000000)o.ih+=0x1000000;}return o.ih;}
  /* ---------- objects, calls ---------- */
  classObj(C,name){const key=C?C.qname:name;let o=this.clsObjs.get(key);if(!o){o=this.alloc("clsobj","Class",{C,name,hid:true});this.clsObjs.set(key,o);}return o;}
  args(as){return as.map(a=>this.ev(a));}
  methodsNamed(C,name){const r=[];const seen=new Set();
    const walk=K=>{for(;K;K=K.sup){const ms=K.methods.get(name);if(ms)for(const m of ms)r.push(m);for(const I of K.ifaces)walkI(I);}};
    const walkI=I=>{if(seen.has(I))return;seen.add(I);const ms=I.methods.get(name);if(ms)for(const m of ms)r.push(m);for(const J of I.ifaces)walkI(J);};
    walk(C);return r;}
  score(t,v){ // cost of passing v to a parameter of type t, -1 = not applicable
    const n=t.n;
    if(t.d===0&&PRIM.has(n)){
      let x=v;let boxed=false;if(x instanceof HObj){if(x.kind!=="box")return -1;x=x.v;boxed=true;}if(x===null)return -1;
      const vk=vtype(x);const W={byte:0,short:1,char:1,int:2,long:3,float:4,double:5};
      if(vk===n)return boxed?6:0;if(n==="boolean"||vk==="boolean")return -1;
      if(n==="char")return -1;
      if(vk==="char"&&(n==="short"||n==="byte"))return -1;
      if(W[n]>W[vk])return (boxed?6:0)+W[n]-W[vk];return -1;}
    if(v===null)return t.d>0||!PRIM.has(n)?1:-1;
    if(isPrim(v)){if(t.d>0)return -1;const vk=vtype(v);if(WRAP[n])return WRAP[n]===vk?6:-1;if(n==="Object"||n==="Number"||n==="Comparable"||n==="Serializable")return 8;if(this.cls(n)||LIBCLS.has(n)||n==="String")return -1;return 9;}
    if(t.d>0)return v.kind==="arr"&&(this.instOf(v,t)||!PRIM.has(v.et)&&!PRIM.has(n))?(ekey(t)===v.et?0:1):-1;
    if(n==="Object")return 10;
    if(this.instOf(v,t)){if(v.kind==="obj"){let d=0;for(let K=v.cls;K&&K.name!==n;K=K.sup)d++;return Math.min(d,5);}return 0;}
    if(!this.cls(n)&&!LIBCLS.has(n)&&!WRAP[n]&&n!=="String"&&n!=="Iterable")return 9; // a type variable such as T
    return -1;}
  pick(ms,args,n,what){
    let best=null,bs=Infinity;
    for(const m of ms){if(m.abs&&ms.some(o=>o!==m&&!o.abs&&o.params.length===m.params.length))continue;
      const ps=m.params,va=ps.length&&ps[ps.length-1].va;let s=0,ok=true;
      if(!va||args.length===ps.length){if(args.length!==ps.length){if(!va)continue;}
        else for(let i=0;i<ps.length;i++){let c=this.score(ps[i].t,args[i]);if(c<0&&va&&i===ps.length-1){c=this.score({n:ps[i].t.n,d:ps[i].t.d-1,a:[]},args[i]);if(c>=0)c+=20;}if(c<0){ok=false;break;}s+=c;}}
      else{if(args.length<ps.length-1)continue;for(let i=0;i<ps.length-1;i++){const c=this.score(ps[i].t,args[i]);if(c<0){ok=false;break;}s+=c;}
        const et={n:ps[ps.length-1].t.n,d:ps[ps.length-1].t.d-1,a:[]};for(let i=ps.length-1;i<args.length&&ok;i++){const c=this.score(et,args[i]);if(c<0)ok=false;else s+=c;}s+=20;}
      if(ok&&s<bs){bs=s;best=m;}}
    if(!best){if(what===false)return null;this.fatal(n,"no suitable method found for "+(ms[0]?ms[0].name:n.n)+"("+args.map(vtype).join(", ")+")");}
    return best;}
  packArgs(m,args){const ps=m.params;if(!ps.length||!ps[ps.length-1].va)return args;
    const last=ps[ps.length-1];if(args.length===ps.length){const a=args[args.length-1];if(a===null||(a instanceof HObj&&a.kind==="arr"&&this.score(last.t,a)>=0))return args;}
    const et={n:last.t.n,d:last.t.d-1,a:[]};const rest=args.slice(ps.length-1).map(v=>this.coerce(et,v));
    const arr=this.alloc("arr",null,{et:ekey(last.t),a:rest});return args.slice(0,ps.length-1).concat([arr]);}
  sig(m){return m.params.map(p=>tstr({n:p.t.n,d:p.t.d,a:[]}).replace(/\[\]$/,p.va?"...":"[]")).join(", ");}
  invoke(m,args,self,n){
    const C=m.C;
    if(this.depth>=MAX_DEPTH)this.soe(n);
    args=this.packArgs(m,args);
    const isMain=m.name==="main"&&this.frames.length===0;
    const F=new Frame(this,isMain?"main":(C.simple||C.qname)+"."+m.name+"("+this.sig(m)+")",C,m.st?null:self,m);F.isMain=isMain;
    if(C.builtin)F.hid=true;
    if(self&&!m.st){F.v.push({n:"this",t:C.simple||C.qname,ty:null,v:self,sl:0});F.ns=1;}
    m.params.forEach((p,i)=>{F.v.push({n:p.n,t:tstr(p.t),ty:p.t,v:this.coerce(p.t,args[i]),sl:F.ns});F.ns+=wideT(p.t)?2:1;});
    const callLine=n&&n.line||(this.fr?this.fr.line:0);
    this.push(F,callLine);if(F.hid)this.quiet++;
    F.line=m.line;this.note({t:"call",F});this.step(m.line,"call");
    let r;
    try{
      if(!m.body){if(m.abs)this.fatal(n,"abstract method "+m.name+" cannot be called");}
      else{const c=this.body(m.body.st);if(c&&c.k==="r")r=c.v;else if(c&&(c.k==="b"||c.k==="c"))this.fatal(n,"break outside switch or loop");
        if(!c){F.ret="void";this.touch(F);this.note({t:"ret",F,v:undefined});F.line=m.end;this.step(m.end,"return");}}}
    catch(e){if(e instanceof RangeError)this.soe(n);throw e;}
    finally{if(F.hid)this.quiet--;this.pop();}
    return r;}
  soe(n){const o=this.soeObj;o.pre=false;o.trace=this.trace();this.touch(o);throw new JThrow(o);}
  callUnq(n){
    const F=this.fr;let C=F.C,self=F.t;
    while(C){const ms=this.methodsNamed(C,n.n);
      if(ms.length){const args=this.args(n.args);const m=this.pick(ms,args,n);
        if(m.st)return this.invoke(m,args,null,n);
        if(!self)this.fatal(n,"non-static method "+m.name+"("+this.sig(m)+") cannot be referenced from a static context");
        return this.vcall(self,n.n,args,n,m);}
      if(C.kind==="enum"&&(n.n==="values"||n.n==="valueOf"))return this.callStatic(C,n.n,this.args(n.args),n);
      self=self?self.outer||null:null;C=C.outer;}
    if(F.lam&&F.lamSelf){const o=F.lamSelf;return this.vcall(o,n.n,this.args(n.args),n);}
    if(F.t&&F.t.kind==="obj")return this.objNative(F.t,n.n,this.args(n.args),n);
    this.fatal(n,"cannot find symbol\n  symbol: method "+n.n+"("+n.args.map(()=>"…").join(", ")+")");}
  call(n){
    const F=this.fr;if(n.line)F.line=n.line;
    if(n.o===null)return this.callUnq(n);
    if(n.o.k==="Super"){const self=F.t;if(!self)this.fatal(n,"non-static variable super cannot be referenced from a static context");
      const args=this.args(n.args);const D=F.m&&F.m.C?F.m.C:F.C;
      if(n.o.iface){const IC=this.cls(n.o.iface);const ims=IC?this.methodsNamed(IC,n.n).filter(m=>m.body):[];if(!ims.length)this.fatal(n,"cannot find symbol: "+n.o.iface+".super."+n.n);return this.invoke(this.pick(ims,args,n),args,self,n);}
      let ms=D.sup?this.methodsNamed(D.sup,n.n).filter(m=>m.body):[];
      if(!ms.length)for(const I of D.ifaces){ms=this.methodsNamed(I,n.n).filter(m=>m.body);if(ms.length)break;}
      if(ms.length)return this.invoke(this.pick(ms,args,n),args,self,n);
      return this.objNative(self,n.n,args,n,true);}
    const tg=this.target(n.o);
    if(tg.C){const args=this.args(n.args);return this.callStatic(tg.C,n.n,args,n);}
    if(tg.L){const args=this.args(n.args);return libStatic(this,tg.L,n.n,args,n);}
    const o=tg.v;const args=this.args(n.args);
    if(o===null)this.thr("NullPointerException",'Cannot invoke "'+this.nullSig(n)+'" because '+this.desc(n.o)+" is null",n);
    return this.vcall(o,n.n,args,n);}
  nullSig(n){ // "String.length()" style name of the method a null receiver was asked to run
    const t=this.staticTypeOf(n.o);
    if(t){const C=this.cls(t);if(C){const ms=this.methodsNamed(C,n.n);const m=ms.find(m=>m.params.length===n.args.length)||ms[0];if(m)return m.C.qname+"."+n.n+"("+this.sig(m)+")";}
      const q=t==="String"||WRAP[t]||t==="Object"||t==="StringBuilder"?t:LIBKIND[t]?"java.util."+t:t;
      return q+"."+n.n+"("+n.args.map(a=>this.argT(a)).join(", ")+")";}
    return n.n+"()";}
  argT(a){if(a.k==="Lit")return a.t==="String"?"String":a.t==="null"?"Object":a.t;if(a.k==="Name"){const r=this.find(a.n);if(r&&r.k===1&&r.e.ty)return tstr({n:r.e.ty.n,d:r.e.ty.d,a:[]});if(r&&r.k===1)return r.e.t;}return "Object";}
  staticTypeOf(x){if(x.k==="Name"){const r=this.find(x.n);if(r&&r.k===1)return r.e.ty?(r.e.ty.d?null:r.e.ty.n):r.e.t;if(r&&r.k===2){const t=this.ftype(r.o.cls,r.n);return t&&!t.d?t.n:null;}if(r&&r.k===3){const t=this.sftype(r.C,r.n);return t&&!t.d?t.n:null;}}
    if(x.k==="Field"){try{const tg=this.target(x.o);if(tg.v&&tg.v.kind==="obj"){const t=this.ftype(tg.v.cls,x.n);return t&&!t.d?t.n:null;}}catch(e){if(!(e instanceof JThrow))throw e;}}
    if(x.k==="Call"){if(x.o===null&&this.fr.C){const ms=this.methodsNamed(this.fr.C,x.n);if(ms[0])return ms[0].ret.n;}}
    if(x.k==="Index"){const t=this.peekType(x.a);return t;}
    return null;}
  callStatic(C,name,args,n){
    const ms=this.methodsNamed(C,name).filter(m=>m.st);
    if(!ms.length){
      if(C.kind==="enum"&&name==="values"){this.initClass(C);return this.alloc("arr",null,{et:C.name,a:C.consts.map(k=>C.statics[k.n])});}
      if(C.kind==="enum"&&name==="valueOf"){this.initClass(C);const s=this.jstr(args[0]);if(!(s in C.statics)||!C.consts.some(k=>k.n===s))this.thr("IllegalArgumentException","No enum constant "+C.qname.replace(/\$/g,".")+"."+s,n);return C.statics[s];}
      if(this.methodsNamed(C,name).length)this.fatal(n,"non-static method "+name+"() cannot be referenced from a static context");
      this.fatal(n,"cannot find symbol\n  symbol:   method "+name+"\n  location: class "+C.name);}
    this.initClass(C);
    return this.invoke(this.pick(ms,args,n),args,null,n);}
  findVirtual(C,name,args,n){const ms=this.methodsNamed(C,name);if(!ms.length)return null;
    const cands=ms.filter(m=>m.body||m.abs||m.C.kind==="interface");return this.pick(cands,args,n,false);}
  vcall(o,name,args,n,hint){
    if(o===null)this.thr("NullPointerException",null,n);
    if(isPrim(o))o=this.box(o);
    if(o.kind==="obj"){
      let m=null;const ms=this.methodsNamed(o.cls,name);
      if(ms.length){const conc=ms.filter(x=>x.body);if(hint&&hint.st===false&&hint.body){m=this.pick(conc.filter(x=>x.params.length===hint.params.length&&this.sig(x)===this.sig(hint)),args,n,false)||hint;}else m=this.pick(conc,args,n,false);}
      if(m)return this.invoke(m,args,o,n);
      return this.objNative(o,name,args,n);}
    if(o.kind==="lambda")return this.lamCall(o,name,args,n);
    return libCall(this,o,name,args,n);}
  objNative(o,name,args,n,viaSuper){
    const C=o.cls;
    if(C.kind==="record"&&args.length===0&&C.comps.some(c=>c.n===name))return o.f[name];
    switch(name){
      case "toString":if(args.length)break;
        if(C.kind==="record")return this.str((C.simple)+"["+C.comps.map(c=>c.n+"="+this.jstr(o.f[c.n])).join(", ")+"]");
        if(o.en!==undefined)return this.lit(o.en);
        return this.str(C.qname+"@"+this.hashOf(o).toString(16));
      case "hashCode":if(args.length)break;
        if(C.kind==="record"){let h=0;for(const c of C.comps)h=(Math.imul(31,h)+this.jhash(o.f[c.n]))|0;return h;}
        return this.ihash(o);
      case "equals":if(args.length!==1)break;
        if(C.kind==="record"){const b=args[0];if(!(b instanceof HObj)||b.kind!=="obj"||b.cls!==C)return false;return C.comps.every(c=>this.jeq(o.f[c.n],b.f[c.n]));}
        return o===args[0];
      case "getClass":return this.classObj(C);
      case "name":if(o.en!==undefined)return this.lit(o.en);break;
      case "ordinal":if(o.en!==undefined)return o.ord;break;
      case "compareTo":if(o.en!==undefined){const b=args[0];if(b===null)this.thr("NullPointerException",null,n);return o.ord-b.ord;}break;
      case "getDeclaringClass":if(o.en!==undefined)return this.classObj(C.kind==="enum"?C:C.sup);break;
      case "printStackTrace":if(this.isSub(C,"Throwable")){this.printTrace(o,true);return;}break;
      case "getStackTrace":if(this.isSub(C,"Throwable"))return this.alloc("arr",null,{et:"StackTraceElement",a:(o.trace||[]).map(t=>this.alloc("misc","StackTraceElement",{text:t.raw||t.c+"."+t.m+"("+this.fileName()+":"+t.l+")"}))});break;
      case "addSuppressed":return;
      case "fillInStackTrace":o.trace=this.trace();return o;}
    const ln=lamNative(this,o,name,args,n);if(ln!==NOPE)return ln;
    this.fatal(n,"cannot find symbol\n  symbol:   method "+name+"("+args.map(vtype).join(",")+")\n  location: class "+(C.simple||C.qname));}
  hashOf(o){const r=this.vcall(o,"hashCode",[],null);return (typeof r==="number"?r:0)>>>0;}
  fileName(){return (this.mainC?this.mainC.name:"Main")+".java";}
  tline(t){return t.raw?"\tat "+t.raw:"\tat "+t.c+"."+t.m+"("+this.fileName()+":"+t.l+")";}
  traceLines(o,tr){return (tr||o.trace||[]).map(t=>this.tline(t));}
  printTrace(o,err,trim){
    const top=trim?(o.trace||[]).filter(t=>!t.raw):(o.trace||[]);
    let s=this.jstr(o)+"\n"+this.traceLines(o,top).join("\n")+(top.length?"\n":"");
    let prev=top,c=o.f&&o.f.cause,guard=0;
    while(c&&c!==o&&guard++<10){const tr=c.trace||[];let k=0;while(k<tr.length&&k<prev.length&&this.tline(tr[tr.length-1-k])===this.tline(prev[prev.length-1-k]))k++;
      s+="Caused by: "+this.jstr(c)+"\n"+tr.slice(0,tr.length-k).map(t=>this.tline(t)+"\n").join("")+(k?"\t... "+k+" more\n":"");
      prev=tr;c=c.f.cause;}
    this.print(s,true);}
  print(s,err){const a=this.out.length;this.out+=s;if(err)this.errR.push([a,this.out.length]);if(!this.quiet)this.note({t:"print",s});}
  newObj(n){
    if(n.body){ // anonymous class
      let K=n.cls;if(!K){const encl=this.fr.C;const cnt=(this.anonN.get(encl.qname)||0)+1;this.anonN.set(encl.qname,cnt);
        K=this.mkClass(n.body,encl,false);K.qname=encl.qname+"$"+cnt;K.simple="";K.name=encl.name+"$"+cnt;K.anonOf=n.t.n;K.stNested=false;
        const S=this.cls(n.t.n);if(S){if(S.kind==="interface"){K.ifaces.push(S);K.ifn.push(S.name);}else K.sup=S;}
        else if(FUNC_IFACES.has(n.t.n)||["Iterator","Iterable","Comparable"].includes(n.t.n))K.ifn.push(n.t.n);
        else if(n.t.n!=="Object")this.fatal(n,"anonymous subclasses of the library class "+n.t.n+" are not supported in the visualizer");
        n.cls=K;}
      const args=this.args(n.args);this.initClass(K);
      const o=this.newRaw(K);o.outer=this.fr.t;o.cap=this.captureVars();
      this.note({t:"alloc",o});
      if(K.sup)this.runCtor(K.sup,this.pickCtor(K.sup,args,n),o,args,n.line);
      this.runInitsAnon(K,o,n);
      return o;}
    const C=this.cls(n.t.n);
    if(!C){if(LIBCLS.has(n.t.n)||LIBNEW[n.t.n]){const args=this.args(n.args);const o=libNew(this,n.t.n,args,n);this.note({t:"alloc",o});return o;}this.fatal(n,"cannot find symbol\n  symbol: class "+n.t.n);}
    if(C.abs)this.fatal(n,C.name+" is abstract; cannot be instantiated");
    if(C.kind==="enum")this.fatal(n,"enum classes may not be instantiated");
    const args=this.args(n.args);
    this.initClass(C);
    const o=this.newRaw(C);
    if(!C.stNested&&C.outer){o.outer=this.fr.t;}
    this.note({t:"alloc",o});
    this.runCtor(C,this.pickCtor(C,args,n),o,args,n.line);
    return o;}
  captureVars(){const F=this.fr;const m=new Map(F.cap||[]);for(const e of F.v)if(e.n!=="this"&&e.v!==UNINIT)m.set(e.n,e.v);return m;}
  pickCtor(C,args,n){if(!C.ctors.length){if(C.kind==="record"&&args.length===C.comps.length)return null;if(args.length)this.fatal(n,"constructor "+C.name+" in class "+C.name+" cannot be applied to given types;\n  required: no arguments\n  found:    "+args.map(vtype).join(","));return null;}
    const ms=C.ctors.map(c=>({params:c.params,name:C.name,c,abs:false}));
    if(C.kind==="record"&&!C.ctors.some(c=>c.params.length===C.comps.length&&!c.compact)&&!C.ctors.some(c=>c.compact)&&args.length===C.comps.length)return null;
    const m=this.pick(ms,args,n,false);
    if(!m)this.fatal(n,"constructor "+C.name+" in class "+C.name+" cannot be applied to given types;\n  found: "+args.map(vtype).join(","));
    return m.c;}
  runCtor(C,ct,o,args,line){
    if(this.depth>=MAX_DEPTH)this.soe(null);
    if(!ct){ // default (or canonical record) constructor
      if(C.kind==="record"&&C.comps){C.comps.forEach((c,i)=>{o.f[c.n]=this.coerce(c.t,args[i]);});this.touch(o);return;}
      if(C.sup)this.runCtor(C.sup,this.pickCtor(C.sup,[],{line}),o,[],line);
      if(C.inits.some(i=>!i.st)){const F=new Frame(this,(C.simple||C.qname)+"()",C,o,{name:"<init>",C,params:[],ret:null});F.mname="<init>";if(C.builtin)F.hid=true;F.v.push({n:"this",t:C.simple,ty:null,v:o});
        this.push(F,line);if(F.hid)this.quiet++;try{this.runInits(C,o);}finally{if(F.hid)this.quiet--;this.pop();}}
      return;}
    args=this.packArgs({params:ct.params},args);
    const F=new Frame(this,"new "+(C.simple||C.qname)+"("+this.sig({params:ct.params})+")",C,o,{name:"<init>",C,params:ct.params,ret:null,line:ct.line});F.mname="<init>";
    if(C.builtin)F.hid=true;
    F.v.push({n:"this",t:C.simple||C.qname,ty:null,v:o,sl:0});F.ns=1;
    ct.params.forEach((p,i)=>{F.v.push({n:p.n,t:tstr(p.t),ty:p.t,v:this.coerce(p.t,args[i]),sl:F.ns});F.ns+=wideT(p.t)?2:1;});
    this.push(F,line);if(F.hid)this.quiet++;
    F.line=ct.line;this.note({t:"call",F});this.step(ct.line,"call");
    try{
      let st=ct.body.st;const first=st[0];
      if(first&&first.k==="CtorCall"){F.line=first.line;this.step(first.line,"line");const a2=this.args(first.args);
        if(first.kind==="this")this.runCtor(C,this.pickCtor(C,a2,first),o,a2,first.line);
        else{if(!C.sup)this.fatal(first,"no superclass constructor to call");this.runCtor(C.sup,this.pickCtor(C.sup,a2,first),o,a2,first.line);this.runInits(C,o);}
        st=st.slice(1);}
      else{if(C.sup)this.runCtor(C.sup,this.pickCtor(C.sup,[],ct),o,[],ct.line);this.runInits(C,o);}
      const c=this.body(st);
      if(ct.compact){for(const comp of C.comps){const e=F.v.find(x=>x.n===comp.n);o.f[comp.n]=e?e.v:null;}this.touch(o);}
      F.ret="void";this.touch(F);F.line=ct.end;this.step(ct.end,"return");}
    catch(e){if(e instanceof RangeError)this.soe(null);throw e;}
    finally{if(F.hid)this.quiet--;this.pop();}}
  runInits(C,o){for(const it of C.inits){if(it.st)continue;this.fr.line=it.line;
      if(it.field){if(it.field.init){this.step(it.line,"line");const v=it.field.init.k==="ArrInit"?this.arrInit(it.field.init,it.field.t):this.ev(it.field.init);o.f[it.field.n]=this.coerce(it.field.t,v);this.touch(o);this.chg.add("h"+o.id+":"+it.field.n);}}
      else this.block(it.block.st);}}
  runInitsAnon(K,o,n){const F=new Frame(this,(K.qname)+"()",K,o,{name:"<init>",C:K,params:[],ret:null});F.mname="<init>";F.v.push({n:"this",t:K.qname,ty:null,v:o});F.cap=o.cap;
    if(!K.inits.some(i=>!i.st))return;
    this.push(F,n.line);try{this.runInits(K,o);}finally{this.pop();}}
  /* ---------- lambdas and method references ---------- */
  mkLambda(n){const F=this.fr;const o=this.alloc("lambda","lambda",{node:n,cap:this.captureVars(),self:F.t,C:F.C,text:n.text,encl:F.mname});
    if(!n.lname){const C=F.C;n.lname="lambda$"+(F.mname==="<init>"?"new":F.mname==="<clinit>"?"static":F.mname)+"$"+(C.lamIx++);}
    this.note({t:"lambda",o});return o;}
  mkMRef(n){const F=this.fr;let bound,C=null,L=null,type=null;
    if(n.o.k==="TypeRef"){type=n.o.t;}
    else if(n.o.k==="Super"){bound=F.t;}
    else if(n.o.k==="Name"&&!this.find(n.o.n)&&(this.cls(n.o.n)||LIBCLS.has(n.o.n))){C=this.cls(n.o.n);if(!C)L=n.o.n;}
    else if(n.o.k==="Field"){const tg=this.target(n.o);if(tg.C)C=tg.C;else if(tg.L)L=tg.L;else bound=tg.v;}
    else bound=this.ev(n.o);
    if(bound===null)this.thr("NullPointerException",null,n);
    const text=(n.o.k==="Name"?n.o.n:n.o.k==="Field"?this.label(n.o):n.o.k==="TypeRef"?tstr(n.o.t):n.o.k==="This"?"this":"…")+"::"+n.n;
    return this.alloc("lambda","lambda",{mref:{bound,C,L,name:n.n,type,sup:n.o.k==="Super"},text,self:F.t,C:F.C,cap:new Map()});}
  lamCall(o,name,args,n){
    if(o.iface){const ms=this.methodsNamed(o.iface,name).filter(m=>m.body&&!m.st);if(ms.length){const m=this.pick(ms,args,n,false);if(m)return this.invoke(m,args,o,n);}}
    const r=lamNative(this,o,name,args,n);if(r!==NOPE)return r;
    if(name==="equals"&&args.length===1)return o===args[0];if(name==="hashCode"&&!args.length)return this.ihash(o);if(name==="toString"&&!args.length)return this.str(this.jstr(o));
    return this.callFn(o,args,n);}
  /* run a functional object: lambda, method reference, or an object that implements the interface */
  callFn(f,args,n,mname){
    if(f===null)this.thr("NullPointerException",null,n);
    if(f.kind!=="lambda"){const nm=mname||this.samName(f);return this.vcall(f,nm,args,n);}
    if(f.js)return f.js(args,n);
    if(f.mref)return this.mrefCall(f,args,n);
    const L=f.node;if(L.params.length!==args.length)this.fatal(n,"incompatible parameter types in lambda expression");
    if(this.depth>=MAX_DEPTH)this.soe(n);
    const F=new Frame(this,"lambda ("+L.params.map(p=>p.n).join(", ")+") ->",f.C,f.self,{name:L.lname,C:f.C,params:[],ret:null});
    F.mname=L.lname||"lambda";F.cap=f.cap;F.lam=true;F.lamSelf=f.self;
    let csl=0;if(f.cap)for(const [k] of f.cap){F.capSl=F.capSl||new Map();F.capSl.set(k,csl++);}F.ns=csl;
    L.params.forEach((p,i)=>{F.v.push({n:p.n,t:p.t?tstr(p.t):vtype(args[i]),ty:p.t,v:p.t?this.coerce(p.t,args[i]):args[i],sl:F.ns});F.ns+=wideT(p.t,args[i])?2:1;});
    this.push(F,n&&n.line||(this.fr?this.fr.line:0));F.line=L.line;this.note({t:"call",F});this.step(L.line,"call");
    let r;
    try{
      if(L.body.k==="Block"){const c=this.body(L.body.st);if(c&&c.k==="r")r=c.v;}
      else{this.step(L.line,"line");r=this.ev(L.body);}
      F.ret=r===undefined?"void":r;this.touch(F);this.note({t:"ret",F,v:r});this.step(L.line,"return");}
    catch(e){if(e instanceof RangeError)this.soe(n);throw e;}
    finally{this.pop();}
    return r;}
  samName(o){if(o.kind==="obj"){for(let K=o.cls;K;K=K.sup){for(const [nm,ms] of K.methods){if(ms.some(m=>m.body&&!m.st&&!["toString","equals","hashCode"].includes(nm)))return nm;}}}return "apply";}
  mrefCall(f,args,n){const R=f.mref;
    if(R.type){if(R.name==="new"){if(R.type.d>0){const len=this.toI(args[0],n);return this.newArr1(ekey(R.type),len,n);}return this.newObj({k:"New",t:R.type,args:args.map(a=>({k:"ValLit",v:a})),line:n?n.line:0,body:null});}}
    if(R.bound!==undefined&&R.bound!==null||R.sup){const recv=R.bound||f.self;return R.sup?this.superCall(recv,R.name,args,n):this.vcall(recv,R.name,args,n);}
    if(R.name==="new"){if(R.C)return this.ctorWith(R.C,args,n);return libNew(this,R.L,args,n);}
    if(R.C){const st=this.methodsNamed(R.C,R.name).filter(m=>m.st);const m=st.length?this.pick(st,args,n,false):null;
      if(m){this.initClass(R.C);return this.invoke(m,args,null,n);}
      if(!args.length)this.fatal(n,"invalid method reference");return this.vcall(args[0],R.name,args.slice(1),n);}
    const s=libStaticTry(this,R.L,R.name,args,n);if(s!==NOPE)return s;
    if(!args.length)this.fatal(n,"invalid method reference");
    return this.vcall(args[0],R.name,args.slice(1),n);}
  superCall(self,name,args,n){const D=this.fr.C;const ms=D.sup?this.methodsNamed(D.sup,name).filter(m=>m.body):[];if(ms.length)return this.invoke(this.pick(ms,args,n),args,self,n);return this.objNative(self,name,args,n);}
  ctorWith(C,args,n){if(C.abs)this.fatal(n,C.name+" is abstract; cannot be instantiated");this.initClass(C);const o=this.newRaw(C);this.note({t:"alloc",o});this.runCtor(C,this.pickCtor(C,args,n),o,args,n?n.line:0);return o;}
  /* ---------- equality, hashing, ordering used by the collections ---------- */
  jeq(a,b){
    if(a===b)return true;if(a===null||b===null||a===undefined||b===undefined)return false;
    if(isPrim(a))a=this.box(a);if(isPrim(b))b=this.box(b);
    if(a.kind==="str")return b.kind==="str"&&a.s===b.s;
    if(a.kind==="box"){if(b.kind!=="box"||a.cls!==b.cls)return false;if(a.cls==="Double"){const x=dblBits(num(a.v)),y=dblBits(num(b.v));return x[0]===y[0]&&x[1]===y[1];}
      if(a.cls==="Float")return fltBits(num(a.v))===fltBits(num(b.v));if(a.cls==="Long"||a.cls==="Boolean")return a.v===b.v;return num(a.v)===num(b.v);}
    if(a.kind==="obj"){const r=this.vcall(a,"equals",[b],null);return r===true||(r instanceof HObj&&r.v===true);}
    return libEquals(this,a,b);}
  jhash(v){
    if(v===null||v===undefined)return 0;if(isPrim(v))v=this.box(v);
    switch(v.kind){
      case "str":if(v.h===undefined)v.h=strHash(v.s);return v.h;
      case "box":{const x=v.v;switch(v.cls){case "Integer":case "Short":case "Byte":return x;case "Long":return Number(BigInt.asIntN(32,x^(BigInt.asUintN(64,x)>>32n)));
        case "Double":{const b=dblBits(num(x));return (b[0]^b[1])|0;}case "Float":return fltBits(num(x));case "Character":return x.c;case "Boolean":return x?1231:1237;}return 0;}
      case "obj":{const r=this.vcall(v,"hashCode",[],null);return typeof r==="number"?r:num(r);}
      default:return libHash(this,v);}}
  jcmp(a,b,n){
    if(a===null||b===null)this.thr("NullPointerException",null,n);
    if(isPrim(a))a=this.box(a);if(isPrim(b))b=this.box(b);
    if(a.kind==="str"&&b.kind==="str")return strCmp(a.s,b.s);
    if(a.kind==="box"&&b.kind==="box"){if(a.cls==="Boolean")return (a.v?1:0)-(b.v?1:0);const x=a.cls==="Long"?a.v:num(a.v),y=b.cls==="Long"?b.v:num(b.v);return x<y?-1:x>y?1:0;}
    if(a.kind==="obj"){if(a.en!==undefined&&b.en!==undefined)return a.ord-b.ord;
      if(!this.instOf(a,{n:"Comparable",d:0,a:[]}))this.thr("ClassCastException","class "+a.cls.qname+" cannot be cast to class java.lang.Comparable",n);
      const r=this.vcall(a,"compareTo",[b],n);return typeof r==="number"?r:num(r);}
    this.thr("ClassCastException","class "+this.jname(a)+" cannot be cast to class java.lang.Comparable",n);}
  cmpWith(c,n){ // a JS comparator from a Java Comparator (or natural order when c is null)
    if(c===null||c===undefined)return (a,b)=>this.jcmp(a,b,n);
    return (a,b)=>{const r=this.callFn(c,[a,b],n,"compare");return typeof r==="number"?r:num(this.unbox(r,n));};}
  /* ---------- iteration over Iterables ---------- */
  iterOf(it,n){
    if(it.kind==="obj"){const iter=this.vcall(it,"iterator",[],n);return {user:iter};}
    if(it.kind==="iter")return {native:it};
    return {native:libIter(this,it,n)};}
  itHas(I){if(I.user){const r=this.vcall(I.user,"hasNext",[],null);return r===true||(r&&r.v===true);}return libIterHas(this,I.native);}
  itNext(I,n){if(I.user)return this.vcall(I.user,"next",[],n);return libIterNext(this,I.native,n);}
  /* ---------- the recorder ---------- */
  step(line,ev){
    if(this.quiet)return;
    if(++this.nsteps>this.maxSteps)throw new StopRun("limit","Stopped after "+this.maxSteps.toLocaleString("en-US")+" steps (infinite loop?)",line);
    // a second "line" step on the same line of the same frame with nothing changed adds nothing: skip it (it still counts toward the limit)
    const prev=this.steps[this.steps.length-1];
    if(ev==="line"&&prev&&prev.e==="line"&&prev.l===line&&prev.f===(this.fr?this.fr.id:null)&&!this.dirty.length&&!this.notes.length&&!this.chg.size&&prev.k===this.sk&&prev.o===this.out.length)return;
    const d=[];
    for(const e of this.dirty){e._d=0;const r=e.isF?this.recFrame(e):e.isS?this.recStatic(e):this.recObj(e);this.cur.set(r.id,r);d.push(r);}
    this.dirty.length=0;
    const st={l:line,e:ev,f:this.fr?this.fr.id:null,d,k:this.sk,x:ev==="exception"?this.inflight:undefined,o:this.out.length,c:this.chg.size?[...this.chg]:null,w:this.notes.length?this.why():null};
    this.chg.clear();this.notes.length=0;
    // checkpoints: every CP_EVERY steps, or less often when the heap is big (memory stays bounded)
    if(!this.steps.length||this.steps.length-this.lastCp>=Math.max(CP_EVERY,this.cur.size>>2)){st.cp=new Map(this.cur);this.lastCp=this.steps.length;this.cps.push(this.steps.length);}
    this.steps.push(st);}
  enc(v){
    if(v===undefined||v===UNINIT)return undefined;if(v===null)return null;
    if(typeof v==="number")return {p:"int",s:String(v)};if(typeof v==="bigint")return {p:"long",s:v.toString()};if(typeof v==="boolean")return {p:"boolean",s:v?"true":"false"};
    if(v instanceof JChr)return {p:"char",s:String.fromCharCode(v.c),c:v.c};if(v instanceof JDbl)return {p:"double",s:fmtD(v.v)};if(v instanceof JFlt)return {p:"float",s:fmtF(v.v)};
    if(v==="void")return {p:"void",s:"void"};
    return {r:v.id};}
  recFrame(F){const vars=[];for(const e of F.v){if(e.v===UNINIT)continue;vars.push({n:e.n,t:e.t,v:this.enc(e.v)});}
    if(F.cap&&F.lam)for(const [k,v] of F.cap)vars.push({n:k,t:"captured",v:this.enc(v),cap:1});
    return {id:F.id,fr:1,name:F.name,line:F.line,call:F.callLine,vars,ret:F.ret===undefined?undefined:F.ret==="void"?{p:"void",s:"void"}:this.enc(F.ret)};}
  recStatic(S){const C=S.C;const vars=[];
    if(C.kind==="enum")for(const k of C.consts)vars.push({n:k.n,t:C.name,v:this.enc(C.statics[k.n])});
    for(const f of C.sfields)vars.push({n:f.n,t:tstr(f.t),v:this.enc(C.statics[f.n])});
    const ms=[];for(const [nm,list] of C.methods)for(const m of list)ms.push((m.st?"static ":"")+(m.abs&&!m.body?"abstract ":"")+nm+"("+this.sig(m)+")");
    const kind=C.kind==="class"?(C.abs?"abstract class":C.anon?"anonymous class":"class"):C.kind;
    return {id:S.id,st:1,name:C.simple||C.qname,q:C.qname,kind,sup:C.sup&&C.sup.name!=="Object"?(C.sup.simple||C.sup.qname):null,ifs:C.ifn.slice(),ms,ctors:C.ctors.length,
      comps:C.comps?C.comps.map(c=>c.n):null,consts:C.kind==="enum"?C.consts.map(k=>k.n):null,vars};}
  /* System.gc(): mark everything reachable from the roots (stack frames, static fields, the String pool and the box caches), free the rest */
  gc(n){
    const seen=new Set(),q=[];const add=x=>{if(x instanceof HObj&&!seen.has(x)){seen.add(x);q.push(x);}};
    for(const F of this.frames){add(F.t);for(const e of F.v)add(e.v);if(F.cap)for(const x of F.cap.values())add(x);add(F.ret);}
    for(const C of this.allC)for(const k in C.statics)add(C.statics[k]);
    for(const o of this.pool.values())add(o);for(const o of this.bcache.values())add(o);for(const o of this.clsObjs.values())add(o);
    add(this.soeObj);add(this.ps_out);add(this.ps_err);add(this.sysIn);
    while(q.length){const o=q.pop();
      switch(o.kind){
        case "obj":for(const k in o.f)add(o.f[k]);add(o.outer);if(o.cap)for(const x of o.cap.values())add(x);break;
        case "arr":case "list":case "deque":case "pq":for(const x of o.a)add(x);add(o.cmp);add(o.backing);break;
        case "map":case "set":for(const e of o.es){add(e.k);if(e.v!==true)add(e.v);add(e.ho);}add(o.cmp);add(o.kv);add(o.vv);add(o.ev);break;
        case "view":add(o.m);break;case "entry":add(o.e.k);add(o.e.v);add(o.m);break;case "iter":add(o.coll);if(o.st)add(o.st.src);break;
        case "lambda":if(o.cap)for(const x of o.cap.values())add(x);add(o.self);if(o.mref)add(o.mref.bound);break;
        case "stream":for(const x of o.src)add(x);for(const op of o.ops)add(op.f);break;case "opt":add(o.v);break;case "coll":for(const x of o.args)add(x);break;}}
    const keep=[],dead=[];for(const o of this.all)(seen.has(o)?keep:dead).push(o);
    let shown=0;for(const o of dead){o.dead=true;this.touch(o);if(!o.hid&&o.kind!=="clsobj")shown++;}
    this.all=keep;this.freed+=shown;
    this.note({t:"gc",n:shown,live:keep.filter(o=>!o.hid&&!o.pre&&o.kind!=="clsobj").length});
    this.step(n&&n.line||(this.fr?this.fr.line:0),"gc");}
  recObj(o){const r=this.recObj0(o);if(o.dead)r.dead=1;return r;}
  recObj0(o){
    const id=o.id;
    switch(o.kind){
      case "obj":{const C=o.cls;const f=[];for(const x of this.allFields(C))f.push({n:x.n,t:tstr(x.t),v:this.enc(o.f[x.n]),self:!x.t.d&&(x.t.n===C.name||this.isSub(C,x.t.n)&&x.t.n!=="Object")?1:0});
        const r={id,k:"obj",cls:C.simple||C.qname,f};if(o.en!==undefined)r.en=o.en;if(C.kind==="record")r.rec=1;if(this.isSub(C,"Throwable"))r.ex=1;if(o.pre)r.pre=1;if(C.anon)r.anon=1;return r;}
      case "str":return {id,k:"str",s:o.s,pool:o.pool?1:0};
      case "box":return {id,k:"box",cls:o.cls,s:this.jstr(o.v),cached:o.cached?1:0};
      case "arr":{const n=o.a.length,lim=Math.min(n,500);const a=new Array(lim);for(let i=0;i<lim;i++)a[i]=this.enc(o.a[i]);return {id,k:"arr",et:o.et,len:n,a};}
      case "lambda":return {id,k:"lambda",text:o.text};
      case "clsobj":return {id,k:"hid",hid:1};
      default:return libRec(this,o);}}
  why(){const N=this.notes;const out=[];
    const alloc=N.find(x=>x.t==="alloc");const set=N.filter(x=>x.t==="set");const desc=o=>{if(!o)return "";if(o.kind==="obj")return "a "+(o.cls.simple||o.cls.qname)+(o.en?" ("+o.en+")":"");if(o.kind==="arr")return "an "+o.et+"["+o.a.length+"] array";if(o.kind==="str")return 'a String "'+o.s+'"';if(o.kind==="box")return "an "+o.cls+" box";return "a "+(o.cls||o.kind);};
    for(const x of N){
      if(x.t==="inc"){out.push(x.l+x.op+" reads "+this.jstr(x.o)+" and writes "+this.jstr(x.nv));}
      else if(x.t==="ret"&&x.F){const fs=this.frames,i=fs.lastIndexOf(x.F);const caller=fs[(i<0?fs.length:i)-1];out.push(this.flabel(x.F)+(x.v===undefined?" finishes":" returns "+this.short(x.v))+(caller?" to "+this.flabel(caller):""));}
      else if(x.t==="call"&&x.F)out.push("calls "+this.flabel(x.F)+": a new frame is pushed on the stack");
      else if(x.t==="throw")out.push("throws "+this.jstr(x.o));
      else if(x.t==="catch")out.push("the exception is caught here");
      else if(x.t==="pooled")out.push('the literal "'+x.o.s+'" is already in the String pool, so it is reused');
      else if(x.t==="cache")out.push(x.o.cls+".valueOf reuses the cached box for "+this.jstr(x.o.v));
      else if(x.t==="gc")out.push(x.n?"System.gc(): the collector starts from the stack and the static fields, marks every object it can reach, and frees the "+x.n+" it can't reach ("+x.live+" objects stay)":"System.gc(): every object is still reachable, so nothing is freed");}
    if(alloc){const s=set.find(x=>x.v===alloc.o);out.unshift("new allocates "+desc(alloc.o)+" on the heap"+(s?"; "+s.l+" now points to it":""));}
    else if(set.length){const s=set[set.length-1];if(s.v instanceof HObj&&s.v.kind!=="str"&&s.v.kind!=="box")out.push(s.l+" now points to "+desc(s.v)+(s.decl?"":"")+" (a reference is copied, not the object)");else if(!out.length)out.push(s.l+" = "+this.short(s.v));}
    return out.length?out.slice(0,2).join("; "):null;}
  flabel(F){ // fact(3), new Car("Swift"), main
    if(F.isMain)return "main";if(!F.m||!F.m.params||F.mname==="<clinit>")return F.name;
    const vals=F.m.params.map(p=>{const e=F.v.find(x=>x.n===p.n);return e?this.short(e.v):"…";});
    return (F.mname==="<init>"?"new "+(F.C.simple||F.C.qname):F.mname.startsWith("lambda$")?"lambda":F.mname)+"("+vals.join(", ")+")";}
  short(v){if(v instanceof HObj){if(v.kind==="str")return '"'+(v.s.length>30?v.s.slice(0,30)+"…":v.s)+'"';if(v.kind==="box")return this.jstr(v.v);return vtype(v)+"#"+v.id;}const s=this.jstr(v);return v instanceof JChr?"'"+s+"'":s;}
}
/* ============================== RUN / STATE ============================== */
function JVM_RUN(src,stdin,opts){
  const t0=Date.now();
  const vm=new VM(src,stdin,opts);
  const res={steps:vm.steps,out:"",errR:vm.errR,error:null,src,ms:0,objs:0,file:"Main.java"};
  try{vm.load();}
  catch(e){if(e instanceof CompileError){res.error={line:e.line,msg:e.message,kind:"compile"};return res;}res.error={line:0,msg:"internal error: "+e.message,kind:"internal",stack:e.stack};return res;}
  let mainC=null,mainM=null;
  for(const C of vm.allC){if(C.builtin)continue;const ms=C.methods.get("main");if(!ms)continue;
    const m=ms.find(m=>m.st&&m.params.length===1&&m.params[0].t.n==="String"&&m.params[0].t.d===1)||ms.find(m=>m.st&&m.params.length===0);
    if(m&&(!mainC||C.def.mods.has("public")&&!C.outer)){mainC=C;mainM=m;}}
  if(!mainM){res.error={line:1,msg:"no main method found: add public static void main(String[] args) to a class",kind:"compile"};return res;}
  let top=mainC;while(top.outer)top=top.outer;vm.mainC=top;res.file=top.name+".java";res.main=mainC.qname;
  try{
    vm.quiet++;vm.soeObj=vm.mkEx("StackOverflowError",null);vm.soeObj.pre=true;vm.quiet--;
    vm.initClass(mainC);
    const args=vm.alloc("arr",null,{et:"String",a:[]});
    vm.invoke(mainM,mainM.params.length?[args]:[],null,null);
    vm.finish(null);}
  catch(e){
    if(e instanceof JThrow){vm.frames.length=0;vm.fr=null;vm.depth=0;vm.quiet++;
      try{const o=e.obj;let s='Exception in thread "main" ';const a=vm.out.length;vm.printTrace(o,true,true);
        vm.out=vm.out.slice(0,a)+s+vm.out.slice(a);const last=vm.errR[vm.errR.length-1];if(last)last[0]=a,last[1]+=s.length;}
      catch(x){if(!(x instanceof JThrow)&&!(x instanceof Fatal))throw x;}
      vm.quiet--;res.uncaught=true;vm.finish(e.obj);}
    else if(e instanceof StopRun){if(e.kind==="limit")res.error={line:e.line,msg:e.msg,kind:"limit"};else{vm.finish(null);res.exit=true;}}
    else if(e instanceof Fatal||e instanceof CompileError){res.error={line:e.line,msg:e.message,kind:e instanceof Fatal?"runtime":"compile"};vm.finish(null,true);}
    else if(e instanceof RangeError){res.error={line:vm.fr?vm.fr.line:0,msg:"the program is too deep for the visualizer (JavaScript stack exhausted)",kind:"limit"};}
    else{res.error={line:vm.fr?vm.fr.line:0,msg:"internal error: "+e.message,kind:"internal",stack:e.stack};}}
  res.out=vm.out;res.ms=Date.now()-t0;res.objs=vm.objCount;res.cps=vm.cps;res.total=vm.nsteps;
  return res;}
VM.prototype.finish=function(exc,keepFrames){
  if(!keepFrames){this.frames.length=0;this.fr=null;this.depth=0;this.sk=this.statAreas.slice();}
  this.quiet=0;this.maxSteps=Infinity;
  if(exc)this.note({t:"uncaught",o:exc});
  this.step(0,"end");};
function JVM_STATE(res,k){
  const s=res.steps;if(!s.length)return null;k=Math.max(0,Math.min(k,s.length-1));
  const cps=res.cps;let lo=0,hi=cps.length-1;while(lo<hi){const mid=(lo+hi+1)>>1;if(cps[mid]<=k)lo=mid;else hi=mid-1;}
  const b=cps[lo];const m=new Map(s[b].cp);
  for(let i=b+1;i<=k;i++)for(const r of s[i].d)m.set(r.id,r);
  const st=s[k];
  return {k,step:st,line:st.l,ev:st.e,prev:k>0?s[k-1].l:0,frames:st.k.map(id=>m.get(id)).filter(Boolean),recs:m,console:res.out.slice(0,st.o),errR:res.errR.filter(r=>r[0]<st.o).map(r=>[r[0],Math.min(r[1],st.o)]),why:st.w,changed:st.c||[]};}
/* ============================== LIBRARY ============================== */
const NOPE={nope:1};
function strCmp(a,b){const n=Math.min(a.length,b.length);for(let i=0;i<n;i++){const d=a.charCodeAt(i)-b.charCodeAt(i);if(d)return d;}return a.length-b.length;}
const LIBKIND={ArrayList:["List","Collection","Iterable","AbstractList","RandomAccess"],LinkedList:["List","Deque","Queue","Collection","Iterable"],
  ImmutableList:["List","Collection","Iterable"],ArraysList:["List","Collection","Iterable"],Stack:["List","Vector","Collection","Iterable"],
  HashMap:["Map","AbstractMap"],LinkedHashMap:["Map","HashMap"],TreeMap:["Map","SortedMap","NavigableMap"],ImmutableMap:["Map"],
  HashSet:["Set","Collection","Iterable"],LinkedHashSet:["Set","HashSet","Collection","Iterable"],TreeSet:["Set","SortedSet","NavigableSet","Collection","Iterable"],ImmutableSet:["Set","Collection","Iterable"],
  ArrayDeque:["Deque","Queue","Collection","Iterable"],PriorityQueue:["Queue","Collection","Iterable"],StringBuilder:["CharSequence"],StringBuffer:["CharSequence"],
  Entry:["Map.Entry","Entry"],Iterator:["Iterator"],KeySet:["Set","Collection","Iterable"],Values:["Collection","Iterable"],EntrySet:["Set","Collection","Iterable"],
  Optional:[],Scanner:["Closeable","AutoCloseable"],Random:[],BufferedReader:["Closeable","AutoCloseable"]};
const QN={ArrayList:"java.util.ArrayList",LinkedList:"java.util.LinkedList",ImmutableList:"java.util.ImmutableCollections$ListN",ArraysList:"java.util.Arrays$ArrayList",Stack:"java.util.Stack",
  HashMap:"java.util.HashMap",LinkedHashMap:"java.util.LinkedHashMap",TreeMap:"java.util.TreeMap",ImmutableMap:"java.util.ImmutableCollections$MapN",HashSet:"java.util.HashSet",
  LinkedHashSet:"java.util.LinkedHashSet",TreeSet:"java.util.TreeSet",ImmutableSet:"java.util.ImmutableCollections$SetN",ArrayDeque:"java.util.ArrayDeque",PriorityQueue:"java.util.PriorityQueue",
  StringBuilder:"java.lang.StringBuilder",StringBuffer:"java.lang.StringBuffer",Scanner:"java.util.Scanner",Random:"java.util.Random",Optional:"java.util.Optional",Iterator:"java.util.ArrayList$Itr",Object:"java.lang.Object"};
const B=(vm,v)=>vm.box(v);
const I=(vm,v,n)=>vm.toI(v,n);
const S=(vm,v,n)=>{if(v===null)vm.thr("NullPointerException",null,n);if(v instanceof HObj&&v.kind==="str")return v.s;if(v instanceof HObj&&(v.kind==="sb"))return v.s;return vm.jstr(v);};
const truthy=(vm,v,n)=>{if(v instanceof HObj)v=vm.unbox(v,n);return v===true;};
const IOOBE=(vm,i,len,n)=>vm.thr("IndexOutOfBoundsException","Index "+i+" out of bounds for length "+len,n);
/* ---------- maps and sets (shared storage: o.es entries {k,v,h,seq}) ---------- */
const PRESENT=true;
const spreadH=h=>(h^(h>>>16));
function isHashOrder(o){return o.cls==="HashMap"||o.cls==="HashSet";}
function mNew(vm,kind,cls,props){const o=vm.alloc(kind,cls,Object.assign({es:[],ix:new Map(),cap:0,icap:16,seq:0,mod:0,tree:cls==="TreeMap"||cls==="TreeSet",cmp:null},props||{}));return o;}
function tIdx(vm,o,k,n){const cf=o.cf||(o.cf=vm.cmpWith(o.cmp,n));if(k===null&&!o.cmp)vm.thr("NullPointerException",null,n);
  let lo=0,hi=o.es.length-1;while(lo<=hi){const mid=(lo+hi)>>>1;const c=cf(o.es[mid].k,k);if(c<0)lo=mid+1;else if(c>0)hi=mid-1;else return [mid,true];}return [lo,false];}
function mFind(vm,o,k,n){if(o.tree){if(!o.es.length&&k!==null)return null;const [i,f]=tIdx(vm,o,k,n);return f?o.es[i]:null;}
  const h=vm.jhash(k);const b=o.ix.get(h);if(b)for(const e of b)if(e.k===k||vm.jeq(e.k,k))return e;return null;}
function mPut(vm,o,k,v,n,ifAbsent){
  if(o.imm)vm.thr("UnsupportedOperationException",null,n);
  k=B(vm,k);v=v===PRESENT?v:B(vm,v);
  if(o.tree){if(!o.es.length&&k!==null&&!o.cmp)vm.jcmp(k,k,n);const [i,f]=tIdx(vm,o,k,n);
    if(f){const e=o.es[i];const old=e.v;if(!ifAbsent||old===null){e.v=v;vm.touch(o);}return old;}
    o.es.splice(i,0,{k,v,seq:++o.seq});o.mod++;vm.touch(o);return null;}
  const h=vm.jhash(k);let b=o.ix.get(h);
  if(b)for(const e of b)if(e.k===k||vm.jeq(e.k,k)){const old=e.v;if(!ifAbsent||old===null){e.v=v;vm.touch(o);}return old;}
  const e={k,v,h,seq:++o.seq};if(!b)o.ix.set(h,b=[]);b.push(e);o.es.push(e);o.mod++;
  if(!o.cap)o.cap=o.icap;if(o.es.length>o.cap*0.75&&o.cap<(1<<30))o.cap*=2;
  vm.touch(o);return null;}
function mRemove(vm,o,k,n){if(o.imm)vm.thr("UnsupportedOperationException",null,n);const e=mFind(vm,o,k,n);if(!e)return null;mDel(vm,o,e);return e;}
function mDel(vm,o,e){const i=o.es.indexOf(e);if(i>=0)o.es.splice(i,1);if(!o.tree){const b=o.ix.get(e.h);if(b){b.splice(b.indexOf(e),1);if(!b.length)o.ix.delete(e.h);}}o.mod++;vm.touch(o);}
function mClear(vm,o,n){if(o.imm)vm.thr("UnsupportedOperationException",null,n);o.es.length=0;o.ix.clear();o.mod++;vm.touch(o);}
function mOrder(o){if(!isHashOrder(o)||!o.cap)return o.es;const m=o.cap-1;return o.es.slice().sort((a,b)=>((spreadH(a.h)&m)-(spreadH(b.h)&m))||(a.seq-b.seq));}
function bucketOf(o,e){return o.cap&&!o.tree?(spreadH(e.h)&(o.cap-1)):null;}
function entryObj(vm,m,e){if(!e.ho)e.ho=vm.alloc("entry","Entry",{e,m,int:1});return e.ho;}
/* every Collection as a JS array of its elements, in iteration order */
function toArr(vm,c,n){
  if(c===null)vm.thr("NullPointerException",null,n);
  switch(c.kind){
    case "list":case "deque":return c.a.slice();
    case "pq":return c.a.slice();
    case "set":return mOrder(c).map(e=>e.k);
    case "view":{const es=mOrder(c.m);return c.w==="k"?es.map(e=>e.k):c.w==="v"?es.map(e=>e.v):es.map(e=>entryObj(vm,c.m,e));}
    case "arr":return c.a.slice();
    case "obj":{const r=[];const I=vm.iterOf(c,n);while(vm.itHas(I))r.push(vm.itNext(I,n));return r;}}
  vm.fatal(n,"expected a Collection, found "+vtype(c));}
function libIter(vm,c,n){
  switch(c.kind){
    case "list":case "deque":case "pq":return {src:c,i:0,mod:c.mod,arr:c.a,live:true};
    case "set":return {src:c,i:0,mod:c.mod,arr:mOrder(c).map(e=>e.k),ents:null};
    case "view":{const es=mOrder(c.m);return {src:c.m,i:0,mod:c.m.mod,arr:c.w==="k"?es.map(e=>e.k):c.w==="v"?es.map(e=>e.v):es.map(e=>entryObj(vm,c.m,e)),ents:es,w:c.w};}
    case "iter":return c.st;
    case "map":vm.fatal(n,"for-each not applicable to expression type "+c.cls+" (iterate over keySet(), values() or entrySet())");
    case "stream":return {src:{mod:0},i:0,mod:0,arr:streamArr(vm,c,n)};
    case "str":vm.fatal(n,"for-each not applicable to expression type String (use toCharArray())");}
  vm.fatal(n,"for-each not applicable to expression type "+vtype(c));}
function libIterHas(vm,I){return I.live?I.i!==I.arr.length:I.i<I.arr.length;}
function libIterNext(vm,I,n){if(I.src.mod!==I.mod)vm.thr("ConcurrentModificationException",null,n);if(I.i>=I.arr.length)vm.thr("NoSuchElementException",null,n);I.last=I.i;const v=I.arr[I.i++];if(I.it)vm.touch(I.it);return v;}
function mkIter(vm,c,n,cls){const st=libIter(vm,c,n);const o=vm.alloc("iter",cls||"Iterator",{st,coll:c});st.it=o;return o;}
/* ---------- list helpers ---------- */
function lNew(vm,cls,a,props){return vm.alloc(cls==="ArrayDeque"?"deque":"list",cls,Object.assign({a:a||[],mod:0,cap:cls==="ArrayList"?(a&&a.length?a.length:0):undefined},props||{}));}
function lMut(vm,o,n,structural){if(o.imm||(o.fixed&&structural))vm.thr("UnsupportedOperationException",null,n);}
function lGrow(o,need){if(o.cls!=="ArrayList")return;if(need<=o.cap)return;let nc=o.cap===0&&!o.sized?Math.max(10,need):o.cap+(o.cap>>1);if(nc<need)nc=need;o.cap=nc;}
function chkIdx(vm,o,i,n,len){len=len===undefined?o.a.length:len;if(i<0||i>=len){if(o.cls==="LinkedList")vm.thr("IndexOutOfBoundsException","Index: "+i+", Size: "+len,n);
  if(o.cls==="Stack")vm.thr("ArrayIndexOutOfBoundsException",i>=len?"Array index out of range: "+i:"Index "+i+" out of bounds for length "+len,n);IOOBE(vm,i,len,n);}}
const fmtList=(vm,a)=>"["+a.map(x=>x===undefined?"null":vm.jstr(x)).join(", ")+"]";
function libToString(vm,o){
  switch(o.kind){
    case "list":case "deque":case "pq":return fmtList(vm,o.a);
    case "set":return fmtList(vm,mOrder(o).map(e=>e.k));
    case "map":return "{"+mOrder(o).map(e=>vm.jstr(e.k)+"="+vm.jstr(e.v)).join(", ")+"}";
    case "view":return fmtList(vm,toArr(vm,o));
    case "entry":return vm.jstr(o.e.k)+"="+vm.jstr(o.e.v);
    case "sb":return o.s;
    case "opt":return o.v===undefined?o.cls+".empty":o.cls+"["+vm.jstr(o.v)+"]";
    case "clsobj":return o.C?(o.C.kind==="interface"?"interface ":"class ")+o.C.qname:"class "+(QN[o.name]||"java.lang."+o.name);
    case "misc":return o.text||(o.cls+"@"+vm.ihash(o).toString(16));
    case "iter":return (QN.Iterator)+"@"+vm.ihash(o).toString(16);}
  return (QN[o.cls]||o.cls)+"@"+vm.ihash(o).toString(16);}
function libEquals(vm,a,b){
  if(a===b)return true;if(!(b instanceof HObj))return false;
  const isList=x=>x.kind==="list"||(x.kind==="deque"&&false);
  if(isList(a)){if(!isList(b))return false;if(a.a.length!==b.a.length)return false;for(let i=0;i<a.a.length;i++)if(!vm.jeq(a.a[i],b.a[i]))return false;return true;}
  if(a.kind==="set"||(a.kind==="view"&&a.w!=="v")){if(!(b.kind==="set"||(b.kind==="view"&&b.w!=="v")))return false;const x=toArr(vm,a),y=toArr(vm,b);if(x.length!==y.length)return false;return y.every(e=>collHas(vm,a,e));}
  if(a.kind==="map"){if(b.kind!=="map"||a.es.length!==b.es.length)return false;return a.es.every(e=>{const f=mFind(vm,b,e.k);return f&&vm.jeq(e.v,f.v);});}
  if(a.kind==="entry"){if(b.kind!=="entry")return false;return vm.jeq(a.e.k,b.e.k)&&vm.jeq(a.e.v,b.e.v);}
  if(a.kind==="opt"){return b.kind==="opt"&&(a.v===undefined?b.v===undefined:b.v!==undefined&&vm.jeq(a.v,b.v));}
  return false;}
function libHash(vm,o){
  switch(o.kind){
    case "list":{let h=1;for(const e of o.a)h=(Math.imul(31,h)+vm.jhash(e))|0;return h;}
    case "set":{let h=0;for(const e of o.es)h=(h+vm.jhash(e.k))|0;return h;}
    case "map":{let h=0;for(const e of o.es)h=(h+(vm.jhash(e.k)^vm.jhash(e.v)))|0;return h;}
    case "entry":return vm.jhash(o.e.k)^vm.jhash(o.e.v);}
  return vm.ihash(o);}
function collHas(vm,c,v,n){
  switch(c.kind){case "set":return !!mFind(vm,c,v,n);case "map":return !!mFind(vm,c,v,n);
    case "view":if(c.w==="k")return !!mFind(vm,c.m,v,n);if(c.w==="v")return c.m.es.some(e=>vm.jeq(e.v,v));{if(!(v instanceof HObj)||v.kind!=="entry")return false;const e=mFind(vm,c.m,v.e.k,n);return !!e&&vm.jeq(e.v,v.e.v);}}
  return toArr(vm,c,n).some(e=>vm.jeq(e,v));}
function libRec(vm,o){
  const id=o.id,E=v=>vm.enc(v);
  switch(o.kind){
    case "list":return {id,k:o.cls==="LinkedList"?"linked":o.cls==="Stack"?"stack":"list",cls:o.cls==="ImmutableList"?"List.of":o.cls==="ArraysList"?"Arrays.asList":o.cls,a:o.a.slice(0,200).map(E),size:o.a.length,cap:o.cap};
    case "deque":return {id,k:"deque",cls:o.cls,a:o.a.slice(0,200).map(E),size:o.a.length};
    case "pq":return {id,k:"pq",cls:o.cls,a:o.a.slice(0,200).map(E),size:o.a.length};
    case "map":return {id,k:"map",cls:o.cls==="ImmutableMap"?"Map.of":o.cls,e:mOrder(o).slice(0,200).map(e=>[E(e.k),E(e.v),bucketOf(o,e)]),size:o.es.length,cap:o.cap||null};
    case "set":return {id,k:"set",cls:o.cls==="ImmutableSet"?"Set.of":o.cls,a:mOrder(o).slice(0,200).map(e=>E(e.k)),b:isHashOrder(o)||o.cls==="LinkedHashSet"?mOrder(o).slice(0,200).map(e=>bucketOf(o,e)):null,size:o.es.length,cap:o.cap||null};
    case "view":return {id,k:"view",of:o.m.id,w:o.w,cls:o.w==="k"?"keySet()":o.w==="v"?"values()":"entrySet()"};
    case "entry":return {id,k:"entry",key:E(o.e.k),val:E(o.e.v)};
    case "sb":return {id,k:"sb",cls:o.cls,s:o.s,cap:o.cap};
    case "iter":return {id,k:"iter",of:o.coll?o.coll.id:null,cur:o.st?o.st.i:0};
    case "opt":return {id,k:"misc",cls:o.cls,s:libToString(vm,o)};
    case "scanner":return {id,k:"misc",cls:"Scanner",s:o.fromIn?"reads System.in":"reads a String"};
    case "random":return {id,k:"misc",cls:"Random",s:"seed "+o.seed.toString()};
    case "reader":return {id,k:"misc",cls:"BufferedReader",s:"reads System.in"};
    case "misc":return {id,k:"misc",cls:o.cls,s:o.text||""};}
  return {id,k:"hid",hid:1};}
/* ---------- printf / String.format ---------- */
function groupDigits(s){return s.replace(/\B(?=(\d{3})+(?!\d))/g,",");}
function jformat(vm,fmt,args,n){
  let out="",ai=0,i=0;const re=/%(\d+\$)?([-#+ 0,(<]*)(\d+)?(\.\d+)?([a-zA-Z%])/g;let m;
  const fail=(cls,msg)=>vm.thr(cls,msg,n);
  while((m=re.exec(fmt))!==null){
    out+=fmt.slice(i,m.index);i=re.lastIndex;
    const [all,pos,flags,w,pr,cv]=m;const width=w?parseInt(w,10):0,prec=pr?parseInt(pr.slice(1),10):-1;
    if(cv==="n"){out+="\n";continue;}if(cv==="%"){out+=pad("%",width,flags);continue;}
    let arg;if(flags.includes("<"))arg=args[ai-1];else if(pos)arg=args[parseInt(pos,10)-1];else{if(ai>=args.length)fail("MissingFormatArgumentException","Format specifier '"+all+"'");arg=args[ai++];}
    let s;const v=arg instanceof HObj&&arg.kind==="box"?arg.v:arg;
    const conv=cv.toLowerCase();
    switch(conv){
      case "d":{if(v===null){s="null";break;}if(!(typeof v==="number"||typeof v==="bigint"))fail("IllegalFormatConversionException",cv+" != "+vm.jname(B(vm,v)));
        let x=typeof v==="bigint"?v:BigInt(v);const neg=x<0n;let d=(neg?-x:x).toString();if(flags.includes(","))d=groupDigits(d);
        let sign=neg?(flags.includes("(")?"(":"-"):flags.includes("+")?"+":flags.includes(" ")?" ":"";if(neg&&flags.includes("("))d+=")";
        if(flags.includes("0")&&!flags.includes("-")&&width>sign.length+d.length)d="0".repeat(width-sign.length-d.length)+d;s=sign+d;break;}
      case "f":case "e":{if(v===null){s="null";break;}if(!(v instanceof JDbl||v instanceof JFlt))fail("IllegalFormatConversionException",cv+" != "+vm.jname(B(vm,v)));
        const x=num(v);const p=prec<0?6:prec;
        if(!isFinite(x)){s=Number.isNaN(x)?"NaN":(x>0?(flags.includes("+")?"+":"")+"Infinity":"-Infinity");break;}
        let body;if(conv==="f"){body=fixedHalfUp(Math.abs(x),p);if(flags.includes(",")){const [a,b]=body.split(".");body=groupDigits(a)+(b!==undefined?"."+b:"");}}
        else{let t=Math.abs(x).toExponential(p);let [mm,ee]=t.split("e");const ev=parseInt(ee,10);body=mm+"e"+(ev<0?"-":"+")+String(Math.abs(ev)).padStart(2,"0");}
        const neg=x<0||(x===0&&1/x<0);let sign=neg?"-":flags.includes("+")?"+":flags.includes(" ")?" ":"";
        if(flags.includes("0")&&!flags.includes("-")&&width>sign.length+body.length)body="0".repeat(width-sign.length-body.length)+body;
        s=sign+body;if(cv==="E")s=s.toUpperCase();break;}
      case "s":s=arg===undefined?"null":vm.jstr(arg);if(prec>=0)s=s.slice(0,prec);if(cv==="S")s=s.toUpperCase();break;
      case "c":{if(v===null){s="null";break;}if(v instanceof JChr)s=String.fromCharCode(v.c);else if(typeof v==="number")s=String.fromCodePoint(v);else fail("IllegalFormatConversionException",cv+" != "+vm.jname(B(vm,v)));if(cv==="C")s=s.toUpperCase();break;}
      case "b":s=v===null||v===undefined?"false":typeof v==="boolean"?String(v):"true";if(cv==="B")s=s.toUpperCase();break;
      case "x":case "o":{if(v===null){s="null";break;}if(!(typeof v==="number"||typeof v==="bigint"))fail("IllegalFormatConversionException",cv+" != "+vm.jname(B(vm,v)));
        const r=conv==="x"?16:8;s=typeof v==="bigint"?BigInt.asUintN(64,v).toString(r):(v>>>0).toString(r);if(flags.includes("#"))s=(r===16?"0x":"0")+s;if(cv==="X")s=s.toUpperCase();
        if(flags.includes("0")&&width>s.length)s=s.padStart(width,"0");break;}
      case "h":s=arg===null?"null":(vm.jhash(arg)>>>0).toString(16);if(cv==="H")s=s.toUpperCase();break;
      default:fail("UnknownFormatConversionException","Conversion = '"+cv+"'");}
    out+=pad(s,width,flags);}
  out+=fmt.slice(i);return out;}
function pad(s,w,flags){if(s.length>=w)return s;return flags.includes("-")?s+" ".repeat(w-s.length):" ".repeat(w-s.length)+s;}
/* ---------- java.util.Random (the exact 48-bit LCG, so seeded output matches the JDK) ---------- */
const RM=0x5DEECE66Dn,RA=0xBn,RK=(1n<<48n)-1n;
function rNext(o,bits){o.seed=(o.seed*RM+RA)&RK;return Number(BigInt.asIntN(32,o.seed>>BigInt(48-bits)));}
function rNextInt(vm,o,bound,n){if(bound===undefined)return rNext(o,32);if(bound<=0)vm.thr("IllegalArgumentException","bound must be positive",n);
  let r=rNext(o,31);const m=bound-1;
  if((bound&m)===0)return Number((BigInt(bound)*BigInt(r))>>31n);
  for(let u=r;((u-(r=u%bound)+m)|0)<0;u=rNext(o,31));return r;}
function rNextDouble(o){return (rNext(o,26)*134217728+rNext(o,27))/9007199254740992;}
/* ---------- Scanner ---------- */
function scTok(vm,o,peek,n){let p=o.pos;const s=o.src;while(p<s.length&&/\s/.test(s[p]))p++;if(p>=s.length)return null;let q=p;while(q<s.length&&!/\s/.test(s[q]))q++;if(!peek)o.pos=q;return s.slice(p,q);}
function scNeed(vm,o,n){const t=scTok(vm,o,true,n);if(t===null)vm.thr("NoSuchElementException",null,n);return t;}
const isJavaInt=s=>/^[+-]?\d+$/.test(s);
/* ---------- streams (lazy pipelines evaluated element by element, like java.util.stream) ---------- */
function mkStream(vm,src,prim){return vm.alloc("stream","Stream",{src,ops:[],prim:prim||null,hid:true});}
function stAdd(vm,s,op,prim){const t=vm.alloc("stream","Stream",{src:s.src,ops:s.ops.concat([op]),prim:prim===undefined?s.prim:prim,hid:true});return t;}
function runStream(vm,s,sink,n){
  let items=s.src;let ops=s.ops;
  // split at sorted() barriers
  let start=0;
  for(let k=0;k<=ops.length;k++){
    const last=k===ops.length;
    if(!last&&ops[k].t!=="sorted")continue;
    const seg=ops.slice(start,k);
    if(last){const push=chain(vm,seg,sink,n);for(const v of items){if(!push(v))break;}return;}
    const buf=[];const push=chain(vm,seg,v=>{buf.push(v);return true;},n);for(const v of items){if(!push(v))break;}
    const cf=vm.cmpWith(ops[k].c,n);items=mergeSort(buf,cf);start=k+1;}}
function chain(vm,seg,sink,n){
  let next=sink;
  for(let i=seg.length-1;i>=0;i--){const op=seg[i],nx=next;
    switch(op.t){
      case "filter":next=v=>truthy(vm,vm.callFn(op.f,[v],n,"test"),n)?nx(v):true;break;
      case "map":next=v=>{let r=vm.callFn(op.f,[v],n,"apply");if(op.to==="int")r=vm.coerce({n:"int",d:0},r);else if(op.to==="double")r=vm.coerce({n:"double",d:0},r);else if(op.to==="long")r=vm.coerce({n:"long",d:0},r);else if(op.to==="obj"&&isPrim(r))r=B(vm,r);return nx(r);};break;
      case "peek":next=v=>{vm.callFn(op.f,[v],n,"accept");return nx(v);};break;
      case "boxed":next=v=>nx(B(vm,v));break;
      case "limit":{let c=0;next=v=>{if(c>=op.k)return false;c++;const r=nx(v);return r&&c<op.k;};break;}
      case "skip":{let c=0;next=v=>c++<op.k?true:nx(v);break;}
      case "distinct":{const seen=[];next=v=>{if(seen.some(x=>vm.jeq(x,v)))return true;seen.push(v);return nx(v);};break;}
      case "flatMap":next=v=>{const r=vm.callFn(op.f,[v],n,"apply");for(const x of streamArr(vm,r,n))if(!nx(x))return false;return true;};break;}}
  return next;}
function streamArr(vm,s,n){const r=[];runStream(vm,s,v=>{r.push(v);return true;},n);return r;}
function mergeSort(a,cf){return a.map((v,i)=>[v,i]).sort((x,y)=>cf(x[0],y[0])||x[1]-y[1]).map(x=>x[0]);}
function primSort(et,a){if(et==="double"||et==="float"){a.sort((x,y)=>{const p=num(x),q=num(y);if(Number.isNaN(p))return Number.isNaN(q)?0:1;if(Number.isNaN(q))return -1;if(p<q)return -1;if(p>q)return 1;if(p===0&&q===0)return (1/p<0?-1:0)-(1/q<0?-1:0);return 0;});return;}
  if(et==="long"){a.sort((x,y)=>x<y?-1:x>y?1:0);return;}if(et==="char"){a.sort((x,y)=>x.c-y.c);return;}if(et==="boolean")return;a.sort((x,y)=>x-y);}
function optOf(vm,v,cls){return vm.alloc("opt",cls||"Optional",{v});}
function collectorRun(vm,c,items,n){
  const a=c.args;
  switch(c.ct){
    case "toList":return lNew(vm,"ArrayList",items.map(v=>B(vm,v)),{cap:items.length});
    case "toUnmodifiableList":return lNew(vm,"ImmutableList",items.map(v=>B(vm,v)),{imm:true});
    case "toSet":{const s=mNew(vm,"set","HashSet");for(const v of items)mPut(vm,s,v,PRESENT,n);return s;}
    case "joining":{const d=a[0]?S(vm,a[0],n):"",p=a[1]?S(vm,a[1],n):"",q=a[2]?S(vm,a[2],n):"";return vm.str(p+items.map(v=>vm.jstr(v)).join(d)+q);}
    case "counting":return BigInt(items.length);
    case "summingInt":{let t=0;for(const v of items)t=(t+vm.coerce({n:"int",d:0},vm.callFn(a[0],[v],n,"applyAsInt")))|0;return t;}
    case "averagingInt":case "averagingDouble":{if(!items.length)return D0;let t=0;for(const v of items)t+=num(vm.unbox(B(vm,vm.callFn(a[0],[v],n,"apply")),n));return new JDbl(t/items.length);}
    case "groupingBy":case "partitioningBy":{
      const m=mNew(vm,"map",c.ct==="partitioningBy"?"LinkedHashMap":a[1]&&a[1].kind==="lambda"&&a.length===3?"TreeMap":"HashMap");const groups=[];
      if(c.ct==="partitioningBy"){groups.push({k:false,items:[]},{k:true,items:[]});}
      for(const v of items){let k=vm.callFn(a[0],[v],n,c.ct==="partitioningBy"?"test":"apply");if(c.ct==="partitioningBy")k=truthy(vm,k,n);const kb=B(vm,k);let g=groups.find(x=>vm.jeq(B(vm,x.k),kb));if(!g){g={k:kb,items:[]};groups.push(g);}g.items.push(v);}
      const down=c.ct==="groupingBy"?(a.length===3?a[2]:a[1]):a[1];
      for(const g of groups)mPut(vm,m,g.k,down&&down.kind==="coll"?collectorRun(vm,down,g.items,n):lNew(vm,"ArrayList",g.items.map(v=>B(vm,v)),{cap:g.items.length}),n);
      return m;}
    case "toMap":{const m=mNew(vm,"map","HashMap");for(const v of items){const k=vm.callFn(a[0],[v],n,"apply"),val=vm.callFn(a[1],[v],n,"apply");const old=mFind(vm,m,B(vm,k),n);
        if(old){if(a[2])old.v=B(vm,vm.callFn(a[2],[old.v,B(vm,val)],n,"apply"));else vm.thr("IllegalStateException","Duplicate key "+vm.jstr(k)+" (attempted merging values "+vm.jstr(old.v)+" and "+vm.jstr(val)+")",n);}
        else mPut(vm,m,k,val,n);}return m;}}
  vm.fatal(n,"Collectors."+c.ct+" is not supported in the visualizer");}
/* ---------- functional helpers ---------- */
function jsFn(vm,text,fn){return vm.alloc("lambda","lambda",{js:fn,text,cap:new Map()});}
function lamNative(vm,o,name,args,n){
  const f=o;
  switch(name){
    case "reversed":if(args.length)break;return jsFn(vm,"reversed()",(a,n2)=>{const r=vm.callFn(f,[a[1],a[0]],n2,"compare");return r;});
    case "thenComparing":{const g=args[0];const isCmp=args.length===1&&g.kind==="lambda"&&(g.js?g.cmp:(g.node?g.node.params.length===2:false));
      const second=args.length===2?keyCmp(vm,args[0],args[1],n):isCmp||(g.kind==="obj")?g:keyCmp(vm,g,null,n);
      return jsFn(vm,"thenComparing(…)",(a,n2)=>{const r=num(vm.callFn(f,a,n2,"compare"));return r!==0?r:num(vm.callFn(second,a,n2,"compare"));});}
    case "thenComparingInt":case "thenComparingDouble":case "thenComparingLong":{const second=keyCmp(vm,args[0],null,n);return jsFn(vm,name+"(…)",(a,n2)=>{const r=num(vm.callFn(f,a,n2,"compare"));return r!==0?r:num(vm.callFn(second,a,n2,"compare"));});}
    case "andThen":{const g=args[0];return jsFn(vm,"andThen(…)",(a,n2)=>{const r=vm.callFn(f,a,n2,"apply");if(f.node&&f.node.body&&a.length===1&&r===undefined){vm.callFn(g,a,n2,"accept");return;}return vm.callFn(g,[r],n2,"apply");});}
    case "compose":{const g=args[0];return jsFn(vm,"compose(…)",(a,n2)=>vm.callFn(f,[vm.callFn(g,a,n2,"apply")],n2,"apply"));}
    case "negate":if(args.length)break;return jsFn(vm,"negate()",(a,n2)=>!truthy(vm,vm.callFn(f,a,n2,"test"),n2));
    case "and":{const g=args[0];return jsFn(vm,"and(…)",(a,n2)=>truthy(vm,vm.callFn(f,a,n2,"test"),n2)&&truthy(vm,vm.callFn(g,a,n2,"test"),n2));}
    case "or":{const g=args[0];return jsFn(vm,"or(…)",(a,n2)=>truthy(vm,vm.callFn(f,a,n2,"test"),n2)||truthy(vm,vm.callFn(g,a,n2,"test"),n2));}}
  return NOPE;}
function keyCmp(vm,key,cmp,n){const o=jsFn(vm,"comparing(…)",(a,n2)=>{const x=vm.callFn(key,[a[0]],n2,"apply"),y=vm.callFn(key,[a[1]],n2,"apply");return cmp?num(vm.unbox(B(vm,vm.callFn(cmp,[x,y],n2,"compare")),n2)):vm.jcmp(x,y,n2);});o.cmp=true;return o;}
/* ---------- static members of library classes ---------- */
const MAXL=9223372036854775807n,MINL=-9223372036854775808n;
const NFE=(vm,s,n,radix)=>vm.thr("NumberFormatException",s===null?"Cannot parse null string: null":'For input string: "'+s+'"'+(radix&&radix!==10?" under radix "+radix:""),n);
function parseIntJ(vm,s,radix,n,long){
  if(s===null)NFE(vm,null,n);radix=radix||10;
  const digits="0123456789abcdefghijklmnopqrstuvwxyz".slice(0,radix);
  if(!s.length)NFE(vm,s,n,radix);
  let i=0,neg=false;if(s[0]==="-"||s[0]==="+"){neg=s[0]==="-";i=1;if(s.length===1)NFE(vm,s,n,radix);}
  let v=0n;for(;i<s.length;i++){const d=digits.indexOf(s[i].toLowerCase());if(d<0)NFE(vm,s,n,radix);v=v*BigInt(radix)+BigInt(d);}
  if(neg)v=-v;
  if(long){if(v>MAXL||v<MINL)NFE(vm,s,n,radix);return v;}
  if(v>2147483647n||v<-2147483648n)NFE(vm,s,n,radix);return Number(v);}
function parseDblJ(vm,s,n){if(s===null)vm.thr("NullPointerException",null,n);const t=s.trim();if(!t.length)vm.thr("NumberFormatException",s.length?'For input string: "'+s+'"':"empty String",n);
  if(/^[+-]?(NaN|Infinity)$/.test(t))return t.includes("NaN")?NaN:t[0]==="-"?-Infinity:Infinity;
  if(!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?[fFdD]?$/.test(t))vm.thr("NumberFormatException",'For input string: "'+s+'"',n);return parseFloat(t.replace(/[fFdD]$/,""));}
const isWs=c=>c===32||(c>=9&&c<=13)||(c>=28&&c<=31)||c===0x1680||(c>=0x2000&&c<=0x2006)||(c>=0x2008&&c<=0x200a)||c===0x2028||c===0x2029||c===0x205f||c===0x3000;
const cOf=(vm,v,n)=>{v=v instanceof HObj?vm.unbox(v,n):v;return v instanceof JChr?v.c:typeof v==="number"?v:0;};
function chUp(c){const s=String.fromCharCode(c).toUpperCase();return s.length===1?s.charCodeAt(0):c;}
function chLo(c){const s=String.fromCharCode(c).toLowerCase();return s.length===1?s.charCodeAt(0):c;}
const mathT=(vm,a,n)=>{const vs=a.map(x=>x instanceof HObj?vm.unbox(x,n):x);return [vs,Math.max(...vs.map(kd))];};
function mathMM(vm,a,n,isMax){const [v,k]=mathT(vm,a,n);
  if(k===1){const x=num(v[0]),y=num(v[1]);return isMax?Math.max(x,y):Math.min(x,y);}
  if(k===2){const x=toL(v[0]),y=toL(v[1]);return isMax?(x>y?x:y):(x<y?x:y);}
  const x=num(v[0]),y=num(v[1]);let r=isMax?Math.max(x,y):Math.min(x,y);return k===3?new JFlt(r):new JDbl(r);}
const D=x=>new JDbl(x);
const LIBS={
  Math:{
    abs:(vm,a,n)=>{const [v,k]=mathT(vm,a,n);const x=v[0];if(k===1)return Math.abs(num(x))|0;if(k===2)return BigInt.asIntN(64,x<0n?-x:x);return k===3?new JFlt(Math.abs(num(x))):D(Math.abs(num(x)));},
    max:(vm,a,n)=>mathMM(vm,a,n,true),min:(vm,a,n)=>mathMM(vm,a,n,false),
    pow:(vm,a)=>D(Math.pow(num(a[0]),num(a[1]))),sqrt:(vm,a)=>D(Math.sqrt(num(a[0]))),cbrt:(vm,a)=>D(Math.cbrt(num(a[0]))),
    floor:(vm,a)=>D(Math.floor(num(a[0]))),ceil:(vm,a)=>D(Math.ceil(num(a[0]))),rint:(vm,a)=>{const x=num(a[0]);const f=Math.floor(x),d=x-f;return D(d<0.5?f:d>0.5?f+1:(f%2===0?f:f+1));},
    round:(vm,a,n)=>{const v=a[0] instanceof HObj?vm.unbox(a[0],n):a[0];if(v instanceof JFlt)return d2i(Math.floor(v.v+0.5));const x=num(v);if(kd(v)<=2)return toL(v);return d2l(Math.round(x));},
    random:()=>D(Math.random()),hypot:(vm,a)=>D(Math.hypot(num(a[0]),num(a[1]))),log:(vm,a)=>D(Math.log(num(a[0]))),log10:(vm,a)=>D(Math.log10(num(a[0]))),exp:(vm,a)=>D(Math.exp(num(a[0]))),
    sin:(vm,a)=>D(Math.sin(num(a[0]))),cos:(vm,a)=>D(Math.cos(num(a[0]))),tan:(vm,a)=>D(Math.tan(num(a[0]))),asin:(vm,a)=>D(Math.asin(num(a[0]))),acos:(vm,a)=>D(Math.acos(num(a[0]))),atan:(vm,a)=>D(Math.atan(num(a[0]))),
    atan2:(vm,a)=>D(Math.atan2(num(a[0]),num(a[1]))),toRadians:(vm,a)=>D(num(a[0])/180*Math.PI),toDegrees:(vm,a)=>D(num(a[0])*180/Math.PI),signum:(vm,a)=>D(Math.sign(num(a[0]))),
    floorDiv:(vm,a,n)=>{const [v,k]=mathT(vm,a,n);if(k===2){const x=toL(v[0]),y=toL(v[1]);if(y===0n)vm.thr("ArithmeticException","/ by zero",n);let q=x/y;if((x%y!==0n)&&((x<0n)!==(y<0n)))q-=1n;return q;}const x=num(v[0]),y=num(v[1]);if(y===0)vm.thr("ArithmeticException","/ by zero",n);return Math.floor(x/y)|0;},
    floorMod:(vm,a,n)=>{const [v,k]=mathT(vm,a,n);if(k===2){const x=toL(v[0]),y=toL(v[1]);if(y===0n)vm.thr("ArithmeticException","/ by zero",n);let m=x%y;if(m!==0n&&((m<0n)!==(y<0n)))m+=y;return m;}const x=num(v[0]),y=num(v[1]);if(y===0)vm.thr("ArithmeticException","/ by zero",n);let m=x%y;if(m!==0&&((m<0)!==(y<0)))m+=y;return m|0;},
    addExact:(vm,a,n)=>exact(vm,a,n,(x,y)=>x+y),subtractExact:(vm,a,n)=>exact(vm,a,n,(x,y)=>x-y),multiplyExact:(vm,a,n)=>exact(vm,a,n,(x,y)=>x*y),
    incrementExact:(vm,a,n)=>exact(vm,[a[0],1],n,(x,y)=>x+y),decrementExact:(vm,a,n)=>exact(vm,[a[0],1],n,(x,y)=>x-y),negateExact:(vm,a,n)=>exact(vm,[0,a[0]],n,(x,y)=>x-y),
    toIntExact:(vm,a,n)=>{const x=toL(a[0]);if(x>2147483647n||x<-2147483648n)vm.thr("ArithmeticException","integer overflow",n);return Number(x);}},
  System:{
    currentTimeMillis:()=>BigInt(Date.now()),nanoTime:()=>BigInt(Math.round((typeof performance!=="undefined"?performance.now():Date.now())*1e6)),
    exit:(vm,a)=>{throw new StopRun("exit","System.exit("+num(a[0])+")",vm.fr?vm.fr.line:0);},
    identityHashCode:(vm,a)=>a[0]===null?0:vm.ihash(a[0]),lineSeparator:vm=>vm.str("\n"),getProperty:()=>null,getenv:()=>null,gc:(vm,a,n)=>{vm.gc(n);},
    arraycopy:(vm,a,n)=>{const [src,sp0,dst,dp0,len0]=a;if(src===null||dst===null)vm.thr("NullPointerException",null,n);const sp=num(sp0),dp=num(dp0),len=num(len0);
      const nm=x=>x.et+"["+x.a.length+"]";
      if(len<0)vm.thr("ArrayIndexOutOfBoundsException","arraycopy: length "+len+" is negative",n);
      if(sp<0)vm.thr("ArrayIndexOutOfBoundsException","arraycopy: source index "+sp+" out of bounds for "+nm(src),n);
      if(dp<0)vm.thr("ArrayIndexOutOfBoundsException","arraycopy: destination index "+dp+" out of bounds for "+nm(dst),n);
      if(sp+len>src.a.length)vm.thr("ArrayIndexOutOfBoundsException","arraycopy: last source index "+(sp+len)+" out of bounds for "+nm(src),n);
      if(dp+len>dst.a.length)vm.thr("ArrayIndexOutOfBoundsException","arraycopy: last destination index "+(dp+len)+" out of bounds for "+nm(dst),n);
      const tmp=src.a.slice(sp,sp+len);for(let i=0;i<len;i++)dst.a[dp+i]=tmp[i];vm.touch(dst);vm.chg.add("h"+dst.id);}},
  Thread:{sleep:(vm,a)=>{vm.note({t:"sleep",ms:a[0]});},currentThread:vm=>vm.alloc("misc","Thread",{text:"Thread[#1,main,5,main]",hid:true})},
  Integer:{
    parseInt:(vm,a,n)=>parseIntJ(vm,a[0]===null?null:S(vm,a[0],n),a[1]!==undefined?num(a[1]):10,n),
    valueOf:(vm,a,n)=>{const x=a[0] instanceof HObj&&a[0].kind==="str"?parseIntJ(vm,a[0].s,a[1]!==undefined?num(a[1]):10,n):toPrim("int",vm.unbox(a[0],n));return vm.box(x);},
    toString:(vm,a,n)=>vm.str(a.length>1?(num(a[0])).toString(num(a[1])):String(num(vm.unbox(a[0],n)))),
    toBinaryString:(vm,a)=>vm.str((num(a[0])>>>0).toString(2)),toHexString:(vm,a)=>vm.str((num(a[0])>>>0).toString(16)),toOctalString:(vm,a)=>vm.str((num(a[0])>>>0).toString(8)),
    compare:(vm,a,n)=>{const x=num(vm.unbox(a[0],n)),y=num(vm.unbox(a[1],n));return x<y?-1:x>y?1:0;},max:(vm,a,n)=>Math.max(num(vm.unbox(a[0],n)),num(vm.unbox(a[1],n))),min:(vm,a,n)=>Math.min(num(vm.unbox(a[0],n)),num(vm.unbox(a[1],n))),
    sum:(vm,a,n)=>(num(vm.unbox(a[0],n))+num(vm.unbox(a[1],n)))|0,signum:(vm,a)=>Math.sign(num(a[0])),abs:(vm,a)=>Math.abs(num(a[0]))|0,
    bitCount:(vm,a)=>{let x=num(a[0])>>>0,c=0;while(x){c+=x&1;x>>>=1;}return c;},hashCode:(vm,a)=>num(a[0]),
    reverse:(vm,a)=>{let x=num(a[0])>>>0,r=0;for(let i=0;i<32;i++){r=(r<<1)|(x&1);x>>>=1;}return r|0;},
    highestOneBit:(vm,a)=>{const x=num(a[0]);return x===0?0:(1<<(31-Math.clz32(x)))|0;},numberOfLeadingZeros:(vm,a)=>Math.clz32(num(a[0])),
    numberOfTrailingZeros:(vm,a)=>{const x=num(a[0]);if(x===0)return 32;let c=0;while(!((x>>>c)&1))c++;return c;}},
  Long:{parseLong:(vm,a,n)=>parseIntJ(vm,a[0]===null?null:S(vm,a[0],n),a[1]!==undefined?num(a[1]):10,n,true),
    valueOf:(vm,a,n)=>vm.box(a[0] instanceof HObj&&a[0].kind==="str"?parseIntJ(vm,a[0].s,10,n,true):toL(vm.unbox(a[0],n))),
    toString:(vm,a,n)=>vm.str(toL(vm.unbox(a[0],n)).toString(a.length>1?num(a[1]):10)),compare:(vm,a,n)=>{const x=toL(vm.unbox(a[0],n)),y=toL(vm.unbox(a[1],n));return x<y?-1:x>y?1:0;},
    max:(vm,a)=>{const x=toL(a[0]),y=toL(a[1]);return x>y?x:y;},min:(vm,a)=>{const x=toL(a[0]),y=toL(a[1]);return x<y?x:y;},sum:(vm,a)=>BigInt.asIntN(64,toL(a[0])+toL(a[1])),abs:(vm,a)=>{const x=toL(a[0]);return x<0n?BigInt.asIntN(64,-x):x;},
    toBinaryString:(vm,a)=>vm.str(BigInt.asUintN(64,toL(a[0])).toString(2)),toHexString:(vm,a)=>vm.str(BigInt.asUintN(64,toL(a[0])).toString(16))},
  Double:{parseDouble:(vm,a,n)=>D(parseDblJ(vm,a[0]===null?null:S(vm,a[0],n),n)),valueOf:(vm,a,n)=>vm.box(a[0] instanceof HObj&&a[0].kind==="str"?D(parseDblJ(vm,a[0].s,n)):toPrim("double",vm.unbox(a[0],n))),
    toString:(vm,a,n)=>vm.str(fmtD(num(vm.unbox(a[0],n)))),isNaN:(vm,a)=>Number.isNaN(num(a[0])),isInfinite:(vm,a)=>!isFinite(num(a[0]))&&!Number.isNaN(num(a[0])),isFinite:(vm,a)=>isFinite(num(a[0])),
    compare:(vm,a,n)=>dblCmp(num(vm.unbox(a[0],n)),num(vm.unbox(a[1],n))),max:(vm,a)=>D(Math.max(num(a[0]),num(a[1]))),min:(vm,a)=>D(Math.min(num(a[0]),num(a[1]))),sum:(vm,a)=>D(num(a[0])+num(a[1])),
    hashCode:(vm,a)=>{const b=dblBits(num(a[0]));return (b[0]^b[1])|0;}},
  Float:{parseFloat:(vm,a,n)=>new JFlt(Math.fround(parseDblJ(vm,S(vm,a[0],n),n))),valueOf:(vm,a,n)=>vm.box(a[0] instanceof HObj&&a[0].kind==="str"?new JFlt(Math.fround(parseDblJ(vm,a[0].s,n))):toPrim("float",vm.unbox(a[0],n))),
    compare:(vm,a,n)=>dblCmp(num(vm.unbox(a[0],n)),num(vm.unbox(a[1],n))),toString:(vm,a,n)=>vm.str(fmtF(num(vm.unbox(a[0],n)))),isNaN:(vm,a)=>Number.isNaN(num(a[0]))},
  Character:{
    isDigit:(vm,a,n)=>/\p{Nd}/u.test(String.fromCharCode(cOf(vm,a[0],n))),isLetter:(vm,a,n)=>/\p{L}/u.test(String.fromCharCode(cOf(vm,a[0],n))),
    isLetterOrDigit:(vm,a,n)=>/[\p{L}\p{Nd}]/u.test(String.fromCharCode(cOf(vm,a[0],n))),isAlphabetic:(vm,a,n)=>/\p{Alphabetic}/u.test(String.fromCharCode(cOf(vm,a[0],n))),
    isUpperCase:(vm,a,n)=>/\p{Lu}/u.test(String.fromCharCode(cOf(vm,a[0],n))),isLowerCase:(vm,a,n)=>/\p{Ll}/u.test(String.fromCharCode(cOf(vm,a[0],n))),
    isWhitespace:(vm,a,n)=>isWs(cOf(vm,a[0],n)),isSpaceChar:(vm,a,n)=>/\p{Zs}/u.test(String.fromCharCode(cOf(vm,a[0],n))),
    toUpperCase:(vm,a,n)=>{const v=a[0] instanceof HObj?vm.unbox(a[0],n):a[0];const c=chUp(cOf(vm,v,n));return typeof v==="number"?c:chr(c);},
    toLowerCase:(vm,a,n)=>{const v=a[0] instanceof HObj?vm.unbox(a[0],n):a[0];const c=chLo(cOf(vm,v,n));return typeof v==="number"?c:chr(c);},
    getNumericValue:(vm,a,n)=>{const c=String.fromCharCode(cOf(vm,a[0],n)).toLowerCase();const d="0123456789abcdefghijklmnopqrstuvwxyz".indexOf(c);return d;},
    digit:(vm,a,n)=>{const c=String.fromCharCode(cOf(vm,a[0],n)).toLowerCase();const r=num(a[1]);const d="0123456789abcdefghijklmnopqrstuvwxyz".indexOf(c);return d>=0&&d<r?d:-1;},
    forDigit:(vm,a)=>{const d=num(a[0]),r=num(a[1]);return d>=0&&d<r?chr("0123456789abcdefghijklmnopqrstuvwxyz".charCodeAt(d)):chr(0);},
    valueOf:(vm,a,n)=>vm.box(toPrim("char",vm.unbox(a[0],n))),toString:(vm,a,n)=>vm.str(String.fromCharCode(cOf(vm,a[0],n))),compare:(vm,a,n)=>cOf(vm,a[0],n)-cOf(vm,a[1],n),
    isVowel:null,hashCode:(vm,a,n)=>cOf(vm,a[0],n),toChars:(vm,a,n)=>vm.alloc("arr",null,{et:"char",a:[chr(num(a[0]))]})},
  Boolean:{parseBoolean:(vm,a)=>a[0]!==null&&a[0].s.toLowerCase()==="true",valueOf:(vm,a,n)=>vm.box(a[0] instanceof HObj&&a[0].kind==="str"?a[0].s.toLowerCase()==="true":vm.unbox(a[0],n)),
    toString:(vm,a,n)=>vm.str(String(vm.unbox(a[0],n))),compare:(vm,a,n)=>(vm.unbox(a[0],n)?1:0)-(vm.unbox(a[1],n)?1:0),logicalAnd:(vm,a)=>a[0]&&a[1],logicalOr:(vm,a)=>a[0]||a[1],logicalXor:(vm,a)=>a[0]!==a[1]},
  Short:{parseShort:(vm,a,n)=>{const v=parseIntJ(vm,S(vm,a[0],n),10,n);if(v<-32768||v>32767)vm.thr("NumberFormatException",'Value out of range. Value:"'+a[0].s+'" Radix:10',n);return v;},valueOf:(vm,a,n)=>vm.box(toPrim("short",vm.unbox(a[0],n)),"Short")},
  Byte:{parseByte:(vm,a,n)=>{const v=parseIntJ(vm,S(vm,a[0],n),10,n);if(v<-128||v>127)vm.thr("NumberFormatException",'Value out of range. Value:"'+a[0].s+'" Radix:10',n);return v;},valueOf:(vm,a,n)=>vm.box(toPrim("byte",vm.unbox(a[0],n)),"Byte")},
  String:{
    valueOf:(vm,a,n)=>{const v=a[0];if(v instanceof HObj&&v.kind==="arr"&&v.et==="char"){if(a.length===3)return vm.str(v.a.slice(num(a[1]),num(a[1])+num(a[2])).map(c=>String.fromCharCode(c.c)).join(""));return vm.str(v.a.map(c=>String.fromCharCode(c.c)).join(""));}
      if(v instanceof HObj&&v.kind==="str")return v;if(v===null)return vm.lit("null");if(v instanceof HObj&&v.kind==="obj")return vm.vcall(v,"toString",[],n);return vm.str(vm.jstr(v));},
    copyValueOf:(vm,a)=>vm.str(a[0].a.map(c=>String.fromCharCode(c.c)).join("")),
    join:(vm,a,n)=>{const d=S(vm,a[0],n);let items;if(a.length===2&&a[1] instanceof HObj&&a[1].kind!=="str"){items=toArr(vm,a[1],n);}else items=a.slice(1);return vm.str(items.map(x=>vm.jstr(x)).join(d));},
    format:(vm,a,n)=>vm.str(jformat(vm,S(vm,a[0],n),fmtArgs(vm,a.slice(1)),n))},
  Arrays:{
    toString:(vm,a)=>{const x=a[0];if(x===null)return vm.str("null");return vm.str("["+x.a.map(v=>vm.jstr(v)).join(", ")+"]");},
    deepToString:(vm,a)=>{const f=x=>x===null?"null":x instanceof HObj&&x.kind==="arr"?"["+x.a.map(f).join(", ")+"]":vm.jstr(x);return vm.str(f(a[0]));},
    sort:(vm,a,n)=>{const x=a[0];if(x===null)vm.thr("NullPointerException",null,n);let from=0,to=x.a.length,c=null;
      if(a.length>=3&&!(a[1] instanceof HObj)){from=num(a[1]);to=num(a[2]);if(from>to)vm.thr("IllegalArgumentException","fromIndex("+from+") > toIndex("+to+")",n);if(from<0||to>x.a.length)vm.thr("ArrayIndexOutOfBoundsException","Array index out of range: "+(from<0?from:to),n);c=a[3]||null;}else c=a[1]||null;
      const part=x.a.slice(from,to);
      if(PRIM.has(x.et)){primSort(x.et,part);}else{const cf=vm.cmpWith(c,n);const s=mergeSort(part,cf);for(let i=0;i<s.length;i++)part[i]=s[i];}
      for(let i=0;i<part.length;i++)x.a[from+i]=part[i];vm.touch(x);vm.chg.add("h"+x.id);vm.note({t:"sort",o:x});},
    fill:(vm,a,n)=>{const x=a[0];let from=0,to=x.a.length,v=a[1];if(a.length===4){from=num(a[1]);to=num(a[2]);v=a[3];}
      const et=x.et;const cv=PRIM.has(et)?vm.coerce({n:et,d:0},v):isPrim(v)?vm.box(v):v;for(let i=from;i<to;i++)x.a[i]=cv;vm.touch(x);vm.chg.add("h"+x.id);},
    copyOf:(vm,a,n)=>{const x=a[0],len=num(a[1]);if(len<0)vm.thr("NegativeArraySizeException",String(len),n);const dv=defVal(x.et.endsWith("]")?"":x.et);const r=[];for(let i=0;i<len;i++)r.push(i<x.a.length?x.a[i]:dv);const o=vm.alloc("arr",null,{et:x.et,a:r});vm.note({t:"alloc",o});return o;},
    copyOfRange:(vm,a,n)=>{const x=a[0],f=num(a[1]),t=num(a[2]);if(f>t)vm.thr("IllegalArgumentException",f+" > "+t,n);if(f<0||f>x.a.length)vm.thr("ArrayIndexOutOfBoundsException","Array index out of range: "+f,n);const dv=defVal(x.et.endsWith("]")?"":x.et);const r=[];for(let i=f;i<t;i++)r.push(i<x.a.length?x.a[i]:dv);const o=vm.alloc("arr",null,{et:x.et,a:r});vm.note({t:"alloc",o});return o;},
    asList:(vm,a)=>{if(a.length===1&&a[0] instanceof HObj&&a[0].kind==="arr"&&!PRIM.has(a[0].et)){return lNew(vm,"ArraysList",a[0].a,{fixed:true,backing:a[0]});}return lNew(vm,"ArraysList",a.map(v=>vm.box(v)),{fixed:true});},
    equals:(vm,a)=>{const x=a[0],y=a[1];if(x===y)return true;if(x===null||y===null)return false;if(x.a.length!==y.a.length)return false;return x.a.every((v,i)=>PRIM.has(x.et)?num(v)===num(y.a[i])||(typeof v==="boolean"&&v===y.a[i]):vm.jeq(v,y.a[i]));},
    deepEquals:(vm,a)=>{const f=(x,y)=>{if(x===y)return true;if(x===null||y===null)return false;if(x instanceof HObj&&x.kind==="arr"&&y instanceof HObj&&y.kind==="arr")return x.a.length===y.a.length&&x.a.every((v,i)=>f(v,y.a[i]));return isPrim(x)?num(x)===num(y):vm.jeq(x,y);};return f(a[0],a[1]);},
    hashCode:(vm,a)=>{const x=a[0];if(x===null)return 0;let h=1;for(const v of x.a)h=(Math.imul(31,h)+vm.jhash(v))|0;return h;},
    stream:(vm,a,n)=>{const x=a[0];let items=x.a;if(a.length===3)items=items.slice(num(a[1]),num(a[2]));const p=x.et==="int"?"int":x.et==="double"?"double":x.et==="long"?"long":null;return mkStream(vm,items.slice(),p);},
    binarySearch:(vm,a,n)=>{const x=a[0];let lo=0,hi=x.a.length-1;const key=a[1];const cf=PRIM.has(x.et)?((p,q)=>{const u=num(p),v=num(q);return u<v?-1:u>v?1:0;}):vm.cmpWith(a[2]||null,n);
      while(lo<=hi){const mid=(lo+hi)>>>1;const c=cf(x.a[mid],key);if(c<0)lo=mid+1;else if(c>0)hi=mid-1;else return mid;}return -(lo+1);},
    setAll:(vm,a,n)=>{const x=a[0];for(let i=0;i<x.a.length;i++){const v=vm.callFn(a[1],[i],n,"apply");x.a[i]=PRIM.has(x.et)?vm.coerce({n:x.et,d:0},v):v;}vm.touch(x);}},
  Collections:{
    sort:(vm,a,n)=>{const l=a[0];lMut(vm,l,n,false);const s=mergeSort(l.a,vm.cmpWith(a[1]||null,n));for(let i=0;i<s.length;i++)l.a[i]=s[i];l.mod++;vm.touch(l);syncBack(vm,l);},
    reverse:(vm,a,n)=>{const l=a[0];lMut(vm,l,n,false);l.a.reverse();vm.touch(l);syncBack(vm,l);},
    shuffle:(vm,a,n)=>{const l=a[0];const r=a[1]||libNew(vm,"Random",[],n);for(let i=l.a.length;i>1;i--){const j=rNextInt(vm,r,i,n);const t=l.a[i-1];l.a[i-1]=l.a[j];l.a[j]=t;}vm.touch(l);syncBack(vm,l);},
    swap:(vm,a,n)=>{const l=a[0],i=num(a[1]),j=num(a[2]);chkIdx(vm,l,i,n);chkIdx(vm,l,j,n);const t=l.a[i];l.a[i]=l.a[j];l.a[j]=t;vm.touch(l);syncBack(vm,l);},
    max:(vm,a,n)=>{const xs=toArr(vm,a[0],n);if(!xs.length)vm.thr("NoSuchElementException",null,n);const cf=vm.cmpWith(a[1]||null,n);return xs.reduce((m,x)=>cf(x,m)>0?x:m);},
    min:(vm,a,n)=>{const xs=toArr(vm,a[0],n);if(!xs.length)vm.thr("NoSuchElementException",null,n);const cf=vm.cmpWith(a[1]||null,n);return xs.reduce((m,x)=>cf(x,m)<0?x:m);},
    frequency:(vm,a,n)=>toArr(vm,a[0],n).filter(x=>a[1]===null?x===null:vm.jeq(a[1],x)).length,
    unmodifiableList:(vm,a,n)=>lNew(vm,"ImmutableList",toArr(vm,a[0],n),{imm:true}),unmodifiableSet:(vm,a,n)=>{const s=mNew(vm,"set","LinkedHashSet",{imm:false});for(const x of toArr(vm,a[0],n))mPut(vm,s,x,PRESENT,n);s.imm=true;return s;},
    unmodifiableMap:(vm,a,n)=>{const m=mNew(vm,"map","LinkedHashMap");for(const e of mOrder(a[0]))mPut(vm,m,e.k,e.v,n);m.imm=true;return m;},
    emptyList:vm=>lNew(vm,"ImmutableList",[],{imm:true}),emptySet:vm=>{const s=mNew(vm,"set","ImmutableSet");s.imm=true;return s;},emptyMap:vm=>{const m=mNew(vm,"map","ImmutableMap");m.imm=true;return m;},
    singletonList:(vm,a)=>lNew(vm,"ImmutableList",[vm.box(a[0])],{imm:true}),nCopies:(vm,a)=>lNew(vm,"ImmutableList",new Array(num(a[0])).fill(vm.box(a[1])),{imm:true}),
    addAll:(vm,a,n)=>{const c=a[0];let ch=false;const xs=a.length===2&&a[1] instanceof HObj&&a[1].kind==="arr"?a[1].a:a.slice(1);for(const x of xs)if(libCall(vm,c,"add",[x],n))ch=true;return ch;},
    reverseOrder:(vm,a,n)=>{const c=a[0]||null;const o=jsFn(vm,"Collections.reverseOrder()",(xs,n2)=>c?num(vm.callFn(c,[xs[1],xs[0]],n2,"compare")):vm.jcmp(xs[1],xs[0],n2));o.cmp=true;return o;},
    fill:(vm,a)=>{const l=a[0];for(let i=0;i<l.a.length;i++)l.a[i]=vm.box(a[1]);vm.touch(l);}},
  List:{of:(vm,a,n)=>{const xs=a.length===1&&a[0] instanceof HObj&&a[0].kind==="arr"&&!PRIM.has(a[0].et)?a[0].a.slice():a;if(xs.some(x=>x===null))vm.thr("NullPointerException",null,n);return lNew(vm,"ImmutableList",xs.map(x=>vm.box(x)),{imm:true});},
    copyOf:(vm,a,n)=>lNew(vm,"ImmutableList",toArr(vm,a[0],n),{imm:true})},
  Set:{of:(vm,a,n)=>{const s=mNew(vm,"set","ImmutableSet");for(const x of a){if(x===null)vm.thr("NullPointerException",null,n);if(mFind(vm,s,vm.box(x),n))vm.thr("IllegalArgumentException","duplicate element: "+vm.jstr(x),n);mPut(vm,s,x,PRESENT,n);}s.imm=true;return s;},
    copyOf:(vm,a,n)=>{const s=mNew(vm,"set","ImmutableSet");for(const x of toArr(vm,a[0],n))mPut(vm,s,x,PRESENT,n);s.imm=true;return s;}},
  Map:{of:(vm,a,n)=>{const m=mNew(vm,"map","ImmutableMap");for(let i=0;i<a.length;i+=2){if(mFind(vm,m,vm.box(a[i]),n))vm.thr("IllegalArgumentException","duplicate key: "+vm.jstr(a[i]),n);mPut(vm,m,a[i],a[i+1],n);}m.imm=true;return m;},
    entry:(vm,a)=>vm.alloc("entry","Entry",{e:{k:vm.box(a[0]),v:vm.box(a[1])},m:null}),
    ofEntries:(vm,a,n)=>{const m=mNew(vm,"map","ImmutableMap");for(const e of (a.length===1&&a[0].kind==="arr"?a[0].a:a))mPut(vm,m,e.e.k,e.e.v,n);m.imm=true;return m;},
    copyOf:(vm,a,n)=>{const m=mNew(vm,"map","ImmutableMap");for(const e of mOrder(a[0]))mPut(vm,m,e.k,e.v,n);m.imm=true;return m;}},
  Objects:{equals:(vm,a)=>a[0]===a[1]||(a[0]!==null&&vm.jeq(a[0],a[1])),hash:(vm,a)=>{let h=1;const xs=a.length===1&&a[0] instanceof HObj&&a[0].kind==="arr"&&!PRIM.has(a[0].et)?a[0].a:a;for(const v of xs)h=(Math.imul(31,h)+vm.jhash(v))|0;return h;},
    hashCode:(vm,a)=>a[0]===null?0:vm.jhash(a[0]),toString:(vm,a)=>a[0]===null&&a.length>1?a[1]:vm.str(vm.jstr(a[0])),isNull:(vm,a)=>a[0]===null,nonNull:(vm,a)=>a[0]!==null,
    requireNonNull:(vm,a,n)=>{if(a[0]===null)vm.thr("NullPointerException",a[1]?S(vm,a[1],n):null,n);return a[0];},requireNonNullElse:(vm,a)=>a[0]!==null?a[0]:a[1],
    compare:(vm,a,n)=>a[0]===a[1]?0:num(vm.callFn(a[2],[a[0],a[1]],n,"compare"))},
  Optional:{of:(vm,a,n)=>{if(a[0]===null)vm.thr("NullPointerException",null,n);return optOf(vm,vm.box(a[0]));},ofNullable:(vm,a)=>optOf(vm,a[0]===null?undefined:vm.box(a[0])),empty:vm=>optOf(vm,undefined)},
  Comparator:{
    naturalOrder:vm=>{const o=jsFn(vm,"Comparator.naturalOrder()",(a,n)=>vm.jcmp(a[0],a[1],n));o.cmp=true;return o;},
    reverseOrder:vm=>{const o=jsFn(vm,"Comparator.reverseOrder()",(a,n)=>vm.jcmp(a[1],a[0],n));o.cmp=true;return o;},
    comparing:(vm,a,n)=>keyCmp(vm,a[0],a[1]||null,n),comparingInt:(vm,a,n)=>keyCmp(vm,a[0],null,n),comparingDouble:(vm,a,n)=>keyCmp(vm,a[0],null,n),comparingLong:(vm,a,n)=>keyCmp(vm,a[0],null,n)},
  Function:{identity:vm=>jsFn(vm,"Function.identity()",a=>a[0])},UnaryOperator:{identity:vm=>jsFn(vm,"UnaryOperator.identity()",a=>a[0])},
  Predicate:{not:(vm,a,n)=>{const f=a[0];return jsFn(vm,"Predicate.not(…)",(x,n2)=>!truthy(vm,vm.callFn(f,x,n2,"test"),n2));},isEqual:(vm,a)=>{const t=a[0];return jsFn(vm,"Predicate.isEqual(…)",x=>t===null?x[0]===null:vm.jeq(t,x[0]));}},
  Collectors:{toList:vm=>coll(vm,"toList",[]),toUnmodifiableList:vm=>coll(vm,"toUnmodifiableList",[]),toSet:vm=>coll(vm,"toSet",[]),joining:(vm,a)=>coll(vm,"joining",a),counting:vm=>coll(vm,"counting",[]),
    groupingBy:(vm,a)=>coll(vm,"groupingBy",a),partitioningBy:(vm,a)=>coll(vm,"partitioningBy",a),toMap:(vm,a)=>coll(vm,"toMap",a),summingInt:(vm,a)=>coll(vm,"summingInt",a),averagingInt:(vm,a)=>coll(vm,"averagingInt",a),averagingDouble:(vm,a)=>coll(vm,"averagingDouble",a)},
  IntStream:{range:(vm,a)=>{const r=[];for(let i=num(a[0]);i<num(a[1]);i++)r.push(i);return mkStream(vm,r,"int");},rangeClosed:(vm,a)=>{const r=[];for(let i=num(a[0]);i<=num(a[1]);i++)r.push(i);return mkStream(vm,r,"int");},
    of:(vm,a)=>mkStream(vm,a.length===1&&a[0] instanceof HObj&&a[0].kind==="arr"?a[0].a.slice():a.slice(),"int")},
  Stream:{of:(vm,a)=>mkStream(vm,(a.length===1&&a[0] instanceof HObj&&a[0].kind==="arr"&&!PRIM.has(a[0].et)?a[0].a:a).map(x=>vm.box(x)),null),empty:vm=>mkStream(vm,[],null)}};
LIBS.StringBuffer={};LIBS.StrictMath=LIBS.Math;
function exact(vm,a,n,f){const [v,k]=mathT(vm,a,n);if(k===2){const r=f(toL(v[0]),toL(v[1]));if(r>MAXL||r<MINL)vm.thr("ArithmeticException","long overflow",n);return r;}
  const r=f(num(v[0]),num(v[1]));if(r>2147483647||r<-2147483648)vm.thr("ArithmeticException","integer overflow",n);return r;}
function dblCmp(x,y){if(x<y)return -1;if(x>y)return 1;const a=dblBits(x),b=dblBits(y);const p=BigInt.asIntN(64,(BigInt(a[0])<<32n)|BigInt(a[1]>>>0)),q=BigInt.asIntN(64,(BigInt(b[0])<<32n)|BigInt(b[1]>>>0));return p===q?0:p<q?-1:1;}
function coll(vm,ct,args){return vm.alloc("coll","Collector",{ct,args,hid:true});}
function fmtArgs(vm,a){if(a.length===1&&a[0] instanceof HObj&&a[0].kind==="arr"&&!PRIM.has(a[0].et))return a[0].a;return a;}
function syncBack(vm,l){if(l.backing){vm.touch(l.backing);}}
const LIBF={
  Math:{PI:D(Math.PI),E:D(Math.E)},
  Integer:{MAX_VALUE:2147483647,MIN_VALUE:-2147483648,SIZE:32,BYTES:4},Long:{MAX_VALUE:MAXL,MIN_VALUE:MINL,SIZE:64},
  Double:{MAX_VALUE:D(Number.MAX_VALUE),MIN_VALUE:D(5e-324),POSITIVE_INFINITY:D(Infinity),NEGATIVE_INFINITY:D(-Infinity),NaN:D(NaN)},
  Float:{MAX_VALUE:new JFlt(3.4028234663852886e38),MIN_VALUE:new JFlt(1.401298464324817e-45)},
  Character:{MIN_VALUE:chr(0),MAX_VALUE:chr(65535)},Short:{MAX_VALUE:32767,MIN_VALUE:-32768},Byte:{MAX_VALUE:127,MIN_VALUE:-128}};
VM.prototype.libField=function(L,name,x){
  if(L==="System"){if(name==="out"||name==="err"){const k="ps_"+name;if(!this[k])this[k]=this.alloc("ps","PrintStream",{err:name==="err",hid:true});return this[k];}
    if(name==="in"){if(!this.sysIn)this.sysIn=this.alloc("misc","InputStream",{hid:true,text:"java.io.BufferedInputStream"});return this.sysIn;}}
  if(L==="Boolean"&&(name==="TRUE"||name==="FALSE"))return this.box(name==="TRUE");
  const t=LIBF[L];if(t&&name in t)return t[name];
  this.fatal(x,L+"."+name+" is not supported in the visualizer, use Run for real output");};
function libStaticTry(vm,L,name,args,n){const t=LIBS[L];if(t&&t[name])return t[name](vm,args,n);return NOPE;}
function libStatic(vm,L,name,args,n){
  const t=LIBS[L];if(t&&t[name])return t[name](vm,args,n);
  if(L==="Map.Entry"||L==="Entry"){if(name==="comparingByKey"){const c=args[0]||null;return jsFn(vm,"Map.Entry.comparingByKey()",(a,n2)=>c?num(vm.callFn(c,[a[0].e.k,a[1].e.k],n2,"compare")):vm.jcmp(a[0].e.k,a[1].e.k,n2));}
    if(name==="comparingByValue"){const c=args[0]||null;return jsFn(vm,"Map.Entry.comparingByValue()",(a,n2)=>c?num(vm.callFn(c,[a[0].e.v,a[1].e.v],n2,"compare")):vm.jcmp(a[0].e.v,a[1].e.v,n2));}}
  vm.fatal(n,L+"."+name+"() is not supported in the visualizer, use Run for real output");}
const LIBNEW={
  ArrayList:(vm,a,n)=>{if(!a.length)return lNew(vm,"ArrayList",[],{cap:0});if(!(a[0] instanceof HObj)){const c=num(vm.unbox(a[0],n));if(c<0)vm.thr("IllegalArgumentException","Illegal Capacity: "+c,n);return lNew(vm,"ArrayList",[],{cap:c,sized:true});}const xs=toArr(vm,a[0],n);return lNew(vm,"ArrayList",xs,{cap:xs.length,sized:true});},
  LinkedList:(vm,a,n)=>lNew(vm,"LinkedList",a.length?toArr(vm,a[0],n):[]),
  Vector:(vm,a,n)=>lNew(vm,"ArrayList",a.length&&a[0] instanceof HObj?toArr(vm,a[0],n):[],{cap:10}),
  Stack:(vm)=>lNew(vm,"Stack",[]),
  ArrayDeque:(vm,a,n)=>lNew(vm,"ArrayDeque",a.length&&a[0] instanceof HObj?toArr(vm,a[0],n):[]),
  PriorityQueue:(vm,a,n)=>{let cmp=null,src=null;for(const x of a){if(x instanceof HObj&&(x.kind==="lambda"||x.kind==="obj"&&vm.instOf(x,{n:"Comparator",d:0,a:[]})))cmp=x;else if(x instanceof HObj)src=x;}
    const o=vm.alloc("pq","PriorityQueue",{a:[],mod:0,cmp});if(src){if(src.kind==="pq"){o.a=src.a.slice();o.cmp=src.cmp;}else{o.a=toArr(vm,src,n);for(let i=(o.a.length>>>1)-1;i>=0;i--)pqDown(vm,o,i,o.a[i],n);}}return o;},
  HashMap:(vm,a,n)=>mapNew(vm,"HashMap",a,n),LinkedHashMap:(vm,a,n)=>mapNew(vm,"LinkedHashMap",a,n),
  TreeMap:(vm,a,n)=>{const o=mNew(vm,"map","TreeMap");if(a[0]&&a[0].kind==="map"){for(const e of mOrder(a[0]))mPut(vm,o,e.k,e.v,n);}else if(a[0])o.cmp=a[0];return o;},
  HashSet:(vm,a,n)=>setNew(vm,"HashSet",a,n),LinkedHashSet:(vm,a,n)=>setNew(vm,"LinkedHashSet",a,n),
  TreeSet:(vm,a,n)=>{const o=mNew(vm,"set","TreeSet");if(a[0]){if(a[0].kind==="lambda"||a[0].kind==="obj"&&vm.instOf(a[0],{n:"Comparator",d:0,a:[]}))o.cmp=a[0];else for(const x of toArr(vm,a[0],n))mPut(vm,o,x,PRESENT,n);}return o;},
  StringBuilder:(vm,a,n)=>sbNew(vm,"StringBuilder",a,n),StringBuffer:(vm,a,n)=>sbNew(vm,"StringBuffer",a,n),
  Scanner:(vm,a,n)=>{const src=a[0];if(src instanceof HObj&&src.kind==="str")return vm.alloc("scanner","Scanner",{src:src.s,pos:0});return vm.alloc("scanner","Scanner",{src:vm.stdin,pos:0,fromIn:true});},
  BufferedReader:(vm)=>vm.alloc("reader","BufferedReader",{src:vm.stdin,pos:0}),InputStreamReader:(vm)=>vm.alloc("misc","InputStreamReader",{hid:true}),
  Random:(vm,a,n)=>{const s=a.length?toL(vm.unbox(a[0],n)):BigInt(Math.floor(Math.random()*2**47))^BigInt(Date.now());return vm.alloc("random","Random",{seed:(BigInt.asUintN(64,s)^RM)&RK});},
  Object:(vm)=>vm.alloc("misc","Object",{text:null}),
  String:(vm,a,n)=>{if(!a.length)return vm.str("");const v=a[0];if(v instanceof HObj&&v.kind==="str")return vm.str(v.s);if(v instanceof HObj&&v.kind==="arr"){const cs=a.length===3?v.a.slice(num(a[1]),num(a[1])+num(a[2])):v.a;return vm.str(cs.map(c=>v.et==="char"?String.fromCharCode(c.c):String.fromCharCode(num(c))).join(""));}return vm.str(vm.jstr(v));},
  Integer:(vm,a,n)=>vm.alloc("box","Integer",{v:a[0] instanceof HObj&&a[0].kind==="str"?parseIntJ(vm,a[0].s,10,n):toPrim("int",vm.unbox(a[0],n))}),
  Double:(vm,a,n)=>vm.alloc("box","Double",{v:toPrim("double",vm.unbox(a[0],n))}),Long:(vm,a,n)=>vm.alloc("box","Long",{v:toL(vm.unbox(a[0],n))}),
  Character:(vm,a,n)=>vm.alloc("box","Character",{v:vm.unbox(a[0],n)}),Boolean:(vm,a,n)=>vm.alloc("box","Boolean",{v:vm.unbox(a[0],n)})};
function mapNew(vm,cls,a,n){const o=mNew(vm,"map",cls);
  if(a.length&&a[0] instanceof HObj&&a[0].kind==="map"){const s=a[0].es.length;o.icap=Math.max(1,tableSizeFor(Math.floor(s/0.75+1)));for(const e of mOrder(a[0]))mPut(vm,o,e.k,e.v,n);}
  else if(a.length){const c=num(vm.unbox(a[0],n));if(c<0)vm.thr("IllegalArgumentException","Illegal initial capacity: "+c,n);o.icap=tableSizeFor(Math.max(1,c));if(a[2]===true)o.accessOrder=true;}
  return o;}
function setNew(vm,cls,a,n){const o=mNew(vm,"set",cls);
  if(a.length&&a[0] instanceof HObj){const xs=toArr(vm,a[0],n);o.icap=tableSizeFor(Math.max(Math.floor(xs.length/0.75)+1,16));for(const x of xs)mPut(vm,o,x,PRESENT,n);}
  else if(a.length){o.icap=tableSizeFor(Math.max(1,num(vm.unbox(a[0],n))));}
  return o;}
function sbNew(vm,cls,a,n){if(!a.length)return vm.alloc("sb",cls,{s:"",cap:16});const v=a[0];if(!(v instanceof HObj)){return vm.alloc("sb",cls,{s:"",cap:num(vm.unbox(v,n))});}
  if(v===null)vm.thr("NullPointerException",null,n);const s=S(vm,v,n);return vm.alloc("sb",cls,{s,cap:s.length+16});}
function libNew(vm,name,args,n){const f=LIBNEW[name];if(!f)vm.fatal(n,"new "+name+"(…) is not supported in the visualizer, use Run for real output");return f(vm,args,n);}
/* ---------- PriorityQueue (the JDK's sift-up / sift-down, so toString order matches) ---------- */
function pqCmp(vm,o,n){return o.cf||(o.cf=vm.cmpWith(o.cmp,n));}
function pqUp(vm,o,k,x,n){const cf=pqCmp(vm,o,n);const q=o.a;while(k>0){const p=(k-1)>>>1,e=q[p];if(cf(x,e)>=0)break;q[k]=e;k=p;}q[k]=x;}
function pqDown(vm,o,k,x,n){const cf=pqCmp(vm,o,n);const q=o.a,size=q.length;const half=size>>>1;while(k<half){let ch=2*k+1,c=q[ch];const r=ch+1;if(r<size&&cf(c,q[r])>0)c=q[ch=r];if(cf(x,c)<=0)break;q[k]=c;k=ch;}q[k]=x;}
function pqOffer(vm,o,v,n){if(v===null)vm.thr("NullPointerException",null,n);v=vm.box(v);o.mod++;const i=o.a.length;o.a.push(v);if(i===0){if(!o.cmp)vm.jcmp(v,v,n);}else pqUp(vm,o,i,v,n);vm.touch(o);return true;}
function pqPoll(vm,o,n){if(!o.a.length)return null;const q=o.a;const r=q[0];o.mod++;const x=q.pop();if(q.length)pqDown(vm,o,0,x,n);vm.touch(o);return r;}
function pqRemoveAt(vm,o,i,n){const q=o.a;o.mod++;const s=q.length-1;if(s===i)q.pop();else{const moved=q.pop();pqDown(vm,o,i,moved,n);if(q[i]===moved)pqUp(vm,o,i,moved,n);}vm.touch(o);}
/* ---------- instance methods ---------- */
const STR={
  length:(vm,o)=>o.s.length,isEmpty:(vm,o)=>o.s.length===0,isBlank:(vm,o)=>/^\s*$/.test(o.s),
  charAt:(vm,o,a,n)=>{const i=I(vm,a[0],n);if(i<0||i>=o.s.length)vm.thr("StringIndexOutOfBoundsException",(i<0?"index "+i+", length "+o.s.length:"Index "+i+" out of bounds for length "+o.s.length),n);return chr(o.s.charCodeAt(i));},
  codePointAt:(vm,o,a,n)=>o.s.codePointAt(I(vm,a[0],n)),
  substring:(vm,o,a,n)=>{const len=o.s.length,b=I(vm,a[0],n),e=a.length>1?I(vm,a[1],n):len;if(b<0||e>len||b>e)vm.thr("StringIndexOutOfBoundsException","Range ["+b+", "+e+") out of bounds for length "+len,n);if(b===0&&e===len)return o;return vm.str(o.s.slice(b,e));},
  subSequence:(vm,o,a,n)=>STR.substring(vm,o,a,n),
  indexOf:(vm,o,a,n)=>{const t=a[0] instanceof JChr||typeof a[0]==="number"?String.fromCharCode(cOf(vm,a[0],n)):S(vm,a[0],n);return o.s.indexOf(t,a.length>1?Math.max(0,I(vm,a[1],n)):0);},
  lastIndexOf:(vm,o,a,n)=>{const t=a[0] instanceof JChr||typeof a[0]==="number"?String.fromCharCode(cOf(vm,a[0],n)):S(vm,a[0],n);return a.length>1?(I(vm,a[1],n)<0?-1:o.s.lastIndexOf(t,I(vm,a[1],n))):o.s.lastIndexOf(t);},
  contains:(vm,o,a,n)=>o.s.includes(S(vm,a[0],n)),
  equals:(vm,o,a)=>a[0] instanceof HObj&&a[0].kind==="str"&&a[0].s===o.s,equalsIgnoreCase:(vm,o,a)=>a[0] instanceof HObj&&a[0].kind==="str"&&a[0].s.length===o.s.length&&(a[0].s.toUpperCase()===o.s.toUpperCase()||a[0].s.toLowerCase()===o.s.toLowerCase()),
  contentEquals:(vm,o,a,n)=>S(vm,a[0],n)===o.s,
  compareTo:(vm,o,a,n)=>{if(a[0]===null)vm.thr("NullPointerException",null,n);return strCmp(o.s,a[0].s);},compareToIgnoreCase:(vm,o,a)=>strCmp(o.s.toUpperCase().toLowerCase(),a[0].s.toUpperCase().toLowerCase()),
  toUpperCase:(vm,o)=>{const r=o.s.toUpperCase();return r===o.s?o:vm.str(r);},toLowerCase:(vm,o)=>{const r=o.s.toLowerCase();return r===o.s?o:vm.str(r);},
  trim:(vm,o)=>{const r=o.s.replace(/^[\x00-\x20]+|[\x00-\x20]+$/g,"");return r===o.s?o:vm.str(r);},strip:(vm,o)=>{const r=o.s.trim();return r===o.s?o:vm.str(r);},
  stripLeading:(vm,o)=>{const r=o.s.replace(/^\s+/,"");return r===o.s?o:vm.str(r);},stripTrailing:(vm,o)=>{const r=o.s.replace(/\s+$/,"");return r===o.s?o:vm.str(r);},
  split:(vm,o,a,n)=>{const parts=jsplit(o.s,S(vm,a[0],n),a.length>1?num(a[1]):0);return vm.alloc("arr",null,{et:"String",a:parts.map(p=>vm.str(p))});},
  replace:(vm,o,a,n)=>{let r;if(a[0] instanceof JChr){r=o.s.split(String.fromCharCode(a[0].c)).join(String.fromCharCode(a[1].c));}else{const f=S(vm,a[0],n),t=S(vm,a[1],n);r=f===""?t+o.s.split("").join(t)+t:o.s.split(f).join(t);}return r===o.s?o:vm.str(r);},
  replaceAll:(vm,o,a,n)=>vm.str(o.s.replace(jre(vm,S(vm,a[0],n),"g",n),jrepl(S(vm,a[1],n)))),replaceFirst:(vm,o,a,n)=>vm.str(o.s.replace(jre(vm,S(vm,a[0],n),"",n),jrepl(S(vm,a[1],n)))),
  matches:(vm,o,a,n)=>jre(vm,"^(?:"+S(vm,a[0],n)+")$","",n).test(o.s),
  startsWith:(vm,o,a,n)=>o.s.startsWith(S(vm,a[0],n),a.length>1?I(vm,a[1],n):0),endsWith:(vm,o,a,n)=>o.s.endsWith(S(vm,a[0],n)),
  toCharArray:(vm,o)=>{const r=vm.alloc("arr",null,{et:"char",a:Array.from({length:o.s.length},(_,i)=>chr(o.s.charCodeAt(i)))});vm.note({t:"alloc",o:r});return r;},
  chars:(vm,o)=>mkStream(vm,Array.from({length:o.s.length},(_,i)=>o.s.charCodeAt(i)),"int"),
  hashCode:(vm,o)=>vm.jhash(o),intern:(vm,o)=>{const r=vm.intern(o);vm.note({t:"intern",o:r});return r;},
  concat:(vm,o,a,n)=>{const t=S(vm,a[0],n);return t===""?o:vm.str(o.s+t);},repeat:(vm,o,a,n)=>{const c=I(vm,a[0],n);if(c<0)vm.thr("IllegalArgumentException","count is negative: "+c,n);return c===1?o:vm.str(o.s.repeat(c));},
  formatted:(vm,o,a,n)=>vm.str(jformat(vm,o.s,fmtArgs(vm,a),n)),toString:(vm,o)=>o,
  lines:(vm,o)=>mkStream(vm,o.s.split(/\r?\n/).filter((x,i,arr)=>!(i===arr.length-1&&x==="")).map(x=>vm.str(x)),null),
  indent:(vm,o,a)=>{const k=num(a[0]);return vm.str(o.s.split("\n").filter((x,i,arr)=>!(i===arr.length-1&&x==="")).map(l=>k>=0?" ".repeat(k)+l:l.replace(new RegExp("^\\s{0,"+(-k)+"}"),"")).join("\n")+"\n");},
  getClass:(vm,o)=>vm.classObj(null,"String"),describeConstable:(vm,o)=>optOf(vm,o)};
function jre(vm,re,flags,n){try{return new RegExp(re.replace(/\\p\{Alpha\}/g,"[A-Za-z]").replace(/\\p\{Punct\}/g,"[!-\\/:-@\\[-`{-~]").replace(/\(\?<([a-zA-Z])/g,"(?<$1"),flags);}catch(e){vm.thr("PatternSyntaxException",re,n);}}
function jrepl(r){return r.replace(/\$(\d)/g,"$$$1").replace(/\\(.)/g,"$1");}
function jsplit(s,re,limit){
  if(re.length===1&&!".$|()[{^?*+\\".includes(re)||re.length===2&&re[0]==="\\"&&!/[0-9a-zA-Z]/.test(re[1])){ // fast path like the JDK
    const sep=re.length===2?re[1]:re;const out=[];let last=0,idx;let matched=false;
    while((idx=s.indexOf(sep,last))>=0){matched=true;if(limit>0&&out.length===limit-1)break;out.push(s.slice(last,idx));last=idx+1;}
    if(!matched)return [s];out.push(s.slice(last));if(limit===0)while(out.length&&out[out.length-1]==="")out.pop();return out;}
  const R=new RegExp(re,"g");const out=[];let last=0,m,matched=false;
  while((m=R.exec(s))!==null){const st=m.index,en=st+m[0].length;
    if(m[0].length===0){R.lastIndex++;if(st===0||st>=s.length)continue;}
    if(st===0&&en>0&&last===0&&!matched){matched=true;if(limit>0&&out.length===limit-1)break;out.push("");last=en;continue;}
    matched=true;if(limit>0&&out.length===limit-1)break;out.push(s.slice(last,st));last=en;}
  if(!matched)return [s];out.push(s.slice(last));if(limit===0)while(out.length&&out[out.length-1]==="")out.pop();return out;}
const BOX={
  intValue:(vm,o)=>toPrim("int",o.v),longValue:(vm,o)=>toPrim("long",o.v),doubleValue:(vm,o)=>toPrim("double",o.v),floatValue:(vm,o)=>toPrim("float",o.v),
  shortValue:(vm,o)=>toPrim("short",o.v),byteValue:(vm,o)=>toPrim("byte",o.v),charValue:(vm,o)=>o.v,booleanValue:(vm,o)=>o.v,
  compareTo:(vm,o,a,n)=>{if(a[0]===null)vm.thr("NullPointerException",null,n);if(o.cls==="Double"||o.cls==="Float")return dblCmp(num(o.v),num(vm.unbox(a[0],n)));return vm.jcmp(o,a[0],n);},
  equals:(vm,o,a)=>vm.jeq(o,a[0]),hashCode:(vm,o)=>vm.jhash(o),toString:(vm,o)=>vm.str(vm.jstr(o.v)),isNaN:(vm,o)=>Number.isNaN(num(o.v)),isInfinite:(vm,o)=>!isFinite(num(o.v))&&!Number.isNaN(num(o.v)),
  getClass:(vm,o)=>vm.classObj(null,o.cls)};
const ARR={clone:(vm,o)=>{const r=vm.alloc("arr",null,{et:o.et,a:o.a.slice()});vm.note({t:"alloc",o:r});return r;},equals:(vm,o,a)=>o===a[0],hashCode:(vm,o)=>vm.ihash(o),toString:(vm,o)=>vm.str(vm.jstr(o)),getClass:(vm,o)=>vm.classObj(null,o.et+"[]")};
const SB={
  append:(vm,o,a,n)=>{let t;const v=a[0];if(v instanceof HObj&&v.kind==="arr"&&v.et==="char")t=v.a.map(c=>String.fromCharCode(c.c)).join("");else t=vm.jstr(v);if(a.length===3&&v instanceof HObj&&v.kind==="str")t=v.s.slice(num(a[1]),num(a[2]));
    if(v instanceof JDbl||v instanceof JFlt){const need=o.s.length+(v instanceof JDbl?24:15);if(need>o.cap)o.cap=Math.max(need,o.cap*2+2);}
    sbSet(vm,o,o.s+t);return o;},
  insert:(vm,o,a,n)=>{const i=I(vm,a[0],n);if(i<0||i>o.s.length)vm.thr("StringIndexOutOfBoundsException","offset "+i+", length "+o.s.length,n);sbSet(vm,o,o.s.slice(0,i)+vm.jstr(a[1])+o.s.slice(i));return o;},
  delete:(vm,o,a,n)=>{const s=I(vm,a[0],n);let e=I(vm,a[1],n);if(e>o.s.length)e=o.s.length;if(s<0||s>e)vm.thr("StringIndexOutOfBoundsException","start "+s+", end "+e+", length "+o.s.length,n);sbSet(vm,o,o.s.slice(0,s)+o.s.slice(e));return o;},
  deleteCharAt:(vm,o,a,n)=>{const i=I(vm,a[0],n);if(i<0||i>=o.s.length)vm.thr("StringIndexOutOfBoundsException","index "+i+",length "+o.s.length,n);sbSet(vm,o,o.s.slice(0,i)+o.s.slice(i+1));return o;},
  reverse:(vm,o)=>{sbSet(vm,o,Array.from(o.s).reverse().join(""));return o;},
  toString:(vm,o)=>vm.str(o.s),length:(vm,o)=>o.s.length,capacity:(vm,o)=>o.cap,isEmpty:(vm,o)=>o.s.length===0,
  charAt:(vm,o,a,n)=>{const i=I(vm,a[0],n);if(i<0||i>=o.s.length)vm.thr("StringIndexOutOfBoundsException","index "+i+",length "+o.s.length,n);return chr(o.s.charCodeAt(i));},
  setCharAt:(vm,o,a,n)=>{const i=I(vm,a[0],n);if(i<0||i>=o.s.length)vm.thr("StringIndexOutOfBoundsException","index "+i+",length "+o.s.length,n);sbSet(vm,o,o.s.slice(0,i)+String.fromCharCode(cOf(vm,a[1],n))+o.s.slice(i+1));},
  indexOf:(vm,o,a,n)=>o.s.indexOf(S(vm,a[0],n),a.length>1?I(vm,a[1],n):0),lastIndexOf:(vm,o,a,n)=>o.s.lastIndexOf(S(vm,a[0],n)),
  replace:(vm,o,a,n)=>{const s=I(vm,a[0],n),e=Math.min(I(vm,a[1],n),o.s.length);sbSet(vm,o,o.s.slice(0,s)+S(vm,a[2],n)+o.s.slice(e));return o;},
  setLength:(vm,o,a,n)=>{const l=I(vm,a[0],n);sbSet(vm,o,l<=o.s.length?o.s.slice(0,l):o.s+"\u0000".repeat(l-o.s.length));},
  substring:(vm,o,a,n)=>{const b=I(vm,a[0],n),e=a.length>1?I(vm,a[1],n):o.s.length;if(b<0||e>o.s.length||b>e)vm.thr("StringIndexOutOfBoundsException","start "+b+", end "+e+", length "+o.s.length,n);return vm.str(o.s.slice(b,e));},
  chars:(vm,o)=>mkStream(vm,Array.from({length:o.s.length},(_,i)=>o.s.charCodeAt(i)),"int"),compareTo:(vm,o,a)=>strCmp(o.s,a[0].s),
  equals:(vm,o,a)=>o===a[0],hashCode:(vm,o)=>vm.ihash(o)};
function sbSet(vm,o,s){if(s.length>o.cap){let nc=o.cap*2+2;if(nc<s.length)nc=s.length;o.cap=nc;}o.s=s;vm.touch(o);vm.chg.add("h"+o.id);}
const COLL={ // methods every Collection shares
  size:(vm,o)=>toArr(vm,o).length,isEmpty:(vm,o)=>toArr(vm,o).length===0,contains:(vm,o,a,n)=>collHas(vm,o,a[0],n),
  containsAll:(vm,o,a,n)=>toArr(vm,a[0],n).every(x=>collHas(vm,o,x,n)),
  iterator:(vm,o,a,n)=>mkIter(vm,o,n),forEach:(vm,o,a,n)=>{const I0=libIter(vm,o,n);while(libIterHas(vm,I0))vm.callFn(a[0],[libIterNext(vm,I0,n)],n,"accept");},
  stream:(vm,o,a,n)=>mkStream(vm,toArr(vm,o,n),null),parallelStream:(vm,o,a,n)=>mkStream(vm,toArr(vm,o,n),null),
  toArray:(vm,o,a,n)=>{const xs=toArr(vm,o,n);let et="Object";if(a[0]&&a[0].kind==="arr")et=a[0].et;else if(a[0]&&a[0].kind==="lambda")et="Object";const r=vm.alloc("arr",null,{et,a:xs});vm.note({t:"alloc",o:r});return r;},
  toString:(vm,o)=>vm.str(libToString(vm,o)),equals:(vm,o,a)=>libEquals(vm,o,a[0]),hashCode:(vm,o)=>libHash(vm,o),getClass:(vm,o)=>vm.classObj(null,o.cls)};
const LIST=Object.assign({},COLL,{
  size:(vm,o)=>o.a.length,isEmpty:(vm,o)=>o.a.length===0,
  add:(vm,o,a,n)=>{lMut(vm,o,n,true);if(a.length===1){lGrow(o,o.a.length+1);o.a.push(vm.box(a[0]));o.mod++;vm.touch(o);vm.chg.add("h"+o.id+":"+(o.a.length-1));vm.note({t:"add",o});return true;}
    const i=I(vm,a[0],n);if(i<0||i>o.a.length)vm.thr("IndexOutOfBoundsException","Index: "+i+", Size: "+o.a.length,n);lGrow(o,o.a.length+1);o.a.splice(i,0,vm.box(a[1]));o.mod++;vm.touch(o);},
  addAll:(vm,o,a,n)=>{lMut(vm,o,n,true);let i=o.a.length,src=a[0];if(a.length===2){i=I(vm,a[0],n);src=a[1];if(i<0||i>o.a.length)vm.thr("IndexOutOfBoundsException","Index: "+i+", Size: "+o.a.length,n);}
    const xs=toArr(vm,src,n);lGrow(o,o.a.length+xs.length);o.a.splice(i,0,...xs);o.mod++;vm.touch(o);return xs.length>0;},
  get:(vm,o,a,n)=>{const i=I(vm,a[0],n);chkIdx(vm,o,i,n);return o.a[i];},
  set:(vm,o,a,n)=>{lMut(vm,o,n,false);const i=I(vm,a[0],n);chkIdx(vm,o,i,n);const old=o.a[i];o.a[i]=vm.box(a[1]);vm.touch(o);vm.chg.add("h"+o.id+":"+i);syncBack(vm,o);return old;},
  remove:(vm,o,a,n)=>{lMut(vm,o,n,true);
    if(!a.length){if(o.cls==="LinkedList"){if(!o.a.length)vm.thr("NoSuchElementException",null,n);o.mod++;vm.touch(o);return o.a.shift();}vm.fatal(n,"no suitable method found for remove()");}
    const x=a[0];if(typeof x==="number"||x instanceof JChr){const i=cOf(vm,x,n);chkIdx(vm,o,i,n);o.mod++;vm.touch(o);return o.a.splice(i,1)[0];}
    const i=o.a.findIndex(e=>x===null?e===null:vm.jeq(x,e));if(i<0)return false;o.a.splice(i,1);o.mod++;vm.touch(o);return true;},
  indexOf:(vm,o,a)=>o.a.findIndex(e=>a[0]===null?e===null:vm.jeq(a[0],e)),lastIndexOf:(vm,o,a)=>{for(let i=o.a.length-1;i>=0;i--)if(a[0]===null?o.a[i]===null:vm.jeq(a[0],o.a[i]))return i;return -1;},
  contains:(vm,o,a)=>o.a.some(e=>a[0]===null?e===null:vm.jeq(a[0],e)),
  clear:(vm,o,a,n)=>{lMut(vm,o,n,true);o.a.length=0;o.mod++;vm.touch(o);},
  removeIf:(vm,o,a,n)=>{lMut(vm,o,n,true);const keep=[];let ch=false;for(const e of o.a){if(truthy(vm,vm.callFn(a[0],[e],n,"test"),n))ch=true;else keep.push(e);}if(ch){o.a.length=0;o.a.push(...keep);o.mod++;vm.touch(o);}return ch;},
  removeAll:(vm,o,a,n)=>{lMut(vm,o,n,true);const before=o.a.length;const rm=a[0];const keep=o.a.filter(e=>!collHas(vm,rm,e,n));o.a.length=0;o.a.push(...keep);if(keep.length!==before){o.mod++;vm.touch(o);}return keep.length!==before;},
  retainAll:(vm,o,a,n)=>{lMut(vm,o,n,true);const before=o.a.length;const keep=o.a.filter(e=>collHas(vm,a[0],e,n));o.a.length=0;o.a.push(...keep);if(keep.length!==before){o.mod++;vm.touch(o);}return keep.length!==before;},
  replaceAll:(vm,o,a,n)=>{lMut(vm,o,n,false);for(let i=0;i<o.a.length;i++)o.a[i]=vm.box(vm.callFn(a[0],[o.a[i]],n,"apply"));vm.touch(o);syncBack(vm,o);},
  sort:(vm,o,a,n)=>{lMut(vm,o,n,false);const s=mergeSort(o.a,vm.cmpWith(a[0]||null,n));for(let i=0;i<s.length;i++)o.a[i]=s[i];o.mod++;vm.touch(o);syncBack(vm,o);},
  subList:(vm,o,a,n)=>{const f=I(vm,a[0],n),t=I(vm,a[1],n);if(f<0)vm.thr("IndexOutOfBoundsException","fromIndex = "+f,n);if(t>o.a.length)vm.thr("IndexOutOfBoundsException","toIndex = "+t,n);if(f>t)vm.thr("IllegalArgumentException","fromIndex("+f+") > toIndex("+t+")",n);return lNew(vm,"ArrayList",o.a.slice(f,t),{cap:t-f});},
  iterator:(vm,o,a,n)=>mkIter(vm,o,n),listIterator:(vm,o,a,n)=>mkIter(vm,o,n),
  getFirst:(vm,o,a,n)=>{if(!o.a.length)vm.thr("NoSuchElementException",null,n);return o.a[0];},getLast:(vm,o,a,n)=>{if(!o.a.length)vm.thr("NoSuchElementException",null,n);return o.a[o.a.length-1];},
  reversed:(vm,o)=>lNew(vm,"ArrayList",o.a.slice().reverse()),ensureCapacity:(vm,o,a)=>{if(o.cls==="ArrayList"){const c=num(a[0]);if(c>o.cap)o.cap=c;vm.touch(o);}},trimToSize:(vm,o)=>{if(o.cls==="ArrayList"){o.cap=o.a.length;vm.touch(o);}},
  // Stack (java.util.Stack extends Vector): top of the stack is the END of the list
  push:(vm,o,a,n)=>{if(o.cls==="Stack"){o.a.push(vm.box(a[0]));o.mod++;vm.touch(o);vm.note({t:"push",o});return a[0];}return DQ.push(vm,o,a,n);},
  pop:(vm,o,a,n)=>{if(o.cls==="Stack"){if(!o.a.length)vm.thr("EmptyStackException",null,n);o.mod++;vm.touch(o);return o.a.pop();}return DQ.pop(vm,o,a,n);},
  peek:(vm,o,a,n)=>{if(o.cls==="Stack"){if(!o.a.length)vm.thr("EmptyStackException",null,n);return o.a[o.a.length-1];}return DQ.peek(vm,o,a,n);},
  empty:(vm,o)=>o.a.length===0,search:(vm,o,a)=>{for(let i=o.a.length-1;i>=0;i--)if(vm.jeq(a[0],o.a[i]))return o.a.length-i;return -1;},
  firstElement:(vm,o,a,n)=>{if(!o.a.length)vm.thr("NoSuchElementException",null,n);return o.a[0];},lastElement:(vm,o,a,n)=>{if(!o.a.length)vm.thr("NoSuchElementException",null,n);return o.a[o.a.length-1];},
  elementAt:(vm,o,a,n)=>{const i=I(vm,a[0],n);chkIdx(vm,o,i,n);return o.a[i];},addElement:(vm,o,a)=>{o.a.push(vm.box(a[0]));o.mod++;vm.touch(o);}});
const DQ=Object.assign({},COLL,{ // ArrayDeque, and the Deque/Queue side of LinkedList: index 0 is the head
  size:(vm,o)=>o.a.length,isEmpty:(vm,o)=>o.a.length===0,
  add:(vm,o,a,n)=>{dqNull(vm,o,a[0],n);o.a.push(vm.box(a[0]));o.mod++;vm.touch(o);return true;},offer:(vm,o,a,n)=>DQ.add(vm,o,a,n),addLast:(vm,o,a,n)=>{DQ.add(vm,o,a,n);},offerLast:(vm,o,a,n)=>DQ.add(vm,o,a,n),
  addFirst:(vm,o,a,n)=>{dqNull(vm,o,a[0],n);o.a.unshift(vm.box(a[0]));o.mod++;vm.touch(o);},offerFirst:(vm,o,a,n)=>{DQ.addFirst(vm,o,a,n);return true;},push:(vm,o,a,n)=>{DQ.addFirst(vm,o,a,n);vm.note({t:"push",o});},
  poll:(vm,o)=>{if(!o.a.length)return null;o.mod++;vm.touch(o);return o.a.shift();},pollFirst:(vm,o)=>DQ.poll(vm,o),pollLast:(vm,o)=>{if(!o.a.length)return null;o.mod++;vm.touch(o);return o.a.pop();},
  remove:(vm,o,a,n)=>{if(a.length){const i=o.a.findIndex(e=>vm.jeq(a[0],e));if(i<0)return false;o.a.splice(i,1);o.mod++;vm.touch(o);return true;}if(!o.a.length)vm.thr("NoSuchElementException",null,n);return DQ.poll(vm,o);},
  removeFirst:(vm,o,a,n)=>{if(!o.a.length)vm.thr("NoSuchElementException",null,n);return DQ.poll(vm,o);},pop:(vm,o,a,n)=>DQ.removeFirst(vm,o,a,n),
  removeLast:(vm,o,a,n)=>{if(!o.a.length)vm.thr("NoSuchElementException",null,n);return DQ.pollLast(vm,o);},
  peek:(vm,o)=>o.a.length?o.a[0]:null,peekFirst:(vm,o)=>DQ.peek(vm,o),peekLast:(vm,o)=>o.a.length?o.a[o.a.length-1]:null,
  element:(vm,o,a,n)=>{if(!o.a.length)vm.thr("NoSuchElementException",null,n);return o.a[0];},getFirst:(vm,o,a,n)=>DQ.element(vm,o,a,n),getLast:(vm,o,a,n)=>{if(!o.a.length)vm.thr("NoSuchElementException",null,n);return o.a[o.a.length-1];},
  clear:(vm,o)=>{o.a.length=0;o.mod++;vm.touch(o);},contains:(vm,o,a)=>o.a.some(e=>vm.jeq(a[0],e)),
  descendingIterator:(vm,o,a,n)=>{const it=mkIter(vm,lNew(vm,"ArrayList",o.a.slice().reverse()),n);return it;},
  removeIf:(vm,o,a,n)=>LIST.removeIf(vm,o,a,n)});
function dqNull(vm,o,v,n){if(v===null&&o.cls==="ArrayDeque")vm.thr("NullPointerException",null,n);}
const PQ=Object.assign({},COLL,{
  size:(vm,o)=>o.a.length,isEmpty:(vm,o)=>o.a.length===0,add:(vm,o,a,n)=>pqOffer(vm,o,a[0],n),offer:(vm,o,a,n)=>pqOffer(vm,o,a[0],n),
  poll:(vm,o,a,n)=>pqPoll(vm,o,n),peek:(vm,o)=>o.a.length?o.a[0]:null,element:(vm,o,a,n)=>{if(!o.a.length)vm.thr("NoSuchElementException",null,n);return o.a[0];},
  remove:(vm,o,a,n)=>{if(!a.length){if(!o.a.length)vm.thr("NoSuchElementException",null,n);return pqPoll(vm,o,n);}const i=o.a.findIndex(e=>vm.jeq(a[0],e));if(i<0)return false;pqRemoveAt(vm,o,i,n);return true;},
  clear:(vm,o)=>{o.a.length=0;o.mod++;vm.touch(o);},contains:(vm,o,a)=>o.a.some(e=>vm.jeq(a[0],e)),comparator:(vm,o)=>o.cmp,addAll:(vm,o,a,n)=>{for(const x of toArr(vm,a[0],n))pqOffer(vm,o,x,n);return true;}});
const SET=Object.assign({},COLL,{
  size:(vm,o)=>o.es.length,isEmpty:(vm,o)=>o.es.length===0,
  add:(vm,o,a,n)=>{if(o.imm)vm.thr("UnsupportedOperationException",null,n);const had=!!mFind(vm,o,vm.box(a[0]),n);if(had)return false;mPut(vm,o,a[0],PRESENT,n);vm.note({t:"add",o});return true;},
  remove:(vm,o,a,n)=>!!mRemove(vm,o,vm.box(a[0]),n),contains:(vm,o,a,n)=>!!mFind(vm,o,vm.box(a[0]),n),clear:(vm,o,a,n)=>mClear(vm,o,n),
  addAll:(vm,o,a,n)=>{let ch=false;for(const x of toArr(vm,a[0],n))if(SET.add(vm,o,[x],n))ch=true;return ch;},
  removeAll:(vm,o,a,n)=>{let ch=false;for(const x of toArr(vm,a[0],n))if(mRemove(vm,o,x,n))ch=true;return ch;},
  retainAll:(vm,o,a,n)=>{let ch=false;for(const e of o.es.slice())if(!collHas(vm,a[0],e.k,n)){mDel(vm,o,e);ch=true;}return ch;},
  removeIf:(vm,o,a,n)=>{let ch=false;for(const e of mOrder(o).slice())if(truthy(vm,vm.callFn(a[0],[e.k],n,"test"),n)){mDel(vm,o,e);ch=true;}return ch;},
  first:(vm,o,a,n)=>{if(!o.es.length)vm.thr("NoSuchElementException",null,n);return o.es[0].k;},last:(vm,o,a,n)=>{if(!o.es.length)vm.thr("NoSuchElementException",null,n);return o.es[o.es.length-1].k;},
  pollFirst:(vm,o)=>{if(!o.es.length)return null;const e=o.es[0];mDel(vm,o,e);return e.k;},pollLast:(vm,o)=>{if(!o.es.length)return null;const e=o.es[o.es.length-1];mDel(vm,o,e);return e.k;},
  floor:(vm,o,a,n)=>navK(vm,o,a[0],n,"floor"),ceiling:(vm,o,a,n)=>navK(vm,o,a[0],n,"ceiling"),higher:(vm,o,a,n)=>navK(vm,o,a[0],n,"higher"),lower:(vm,o,a,n)=>navK(vm,o,a[0],n,"lower"),
  headSet:(vm,o,a,n)=>subTree(vm,o,"set",null,a[0],false,a[1]===true,n),tailSet:(vm,o,a,n)=>subTree(vm,o,"set",a[0],null,a[1]!==false,false,n),subSet:(vm,o,a,n)=>subTree(vm,o,"set",a[0],a.length===4?a[2]:a[1],a.length===4?a[1]===true:true,a.length===4?a[3]===true:false,n),
  descendingSet:(vm,o)=>{const s=mNew(vm,"set","LinkedHashSet");for(const e of o.es.slice().reverse())mPut(vm,s,e.k,PRESENT);return s;},
  descendingIterator:(vm,o,a,n)=>mkIter(vm,lNew(vm,"ArrayList",o.es.map(e=>e.k).reverse()),n)});
function navE(vm,o,k,n,how){if(!o.tree)vm.fatal(n,how+"() needs a TreeSet or TreeMap");if(!o.es.length)return null;const [i,f]=tIdx(vm,o,vm.box(k),n);
  switch(how){case "floor":return f?o.es[i]:o.es[i-1]||null;case "ceiling":return f?o.es[i]:o.es[i]||null;case "higher":return f?o.es[i+1]||null:o.es[i]||null;case "lower":return o.es[i-1]||null;}}
function navK(vm,o,k,n,how){const e=navE(vm,o,k,n,how);return e?e.k:null;}
function subTree(vm,o,kind,lo,hi,loInc,hiInc,n){const r=mNew(vm,kind,o.cls);r.cmp=o.cmp;const cf=vm.cmpWith(o.cmp,n);
  for(const e of o.es){if(lo!==null){const c=cf(e.k,vm.box(lo));if(c<0||(c===0&&!loInc))continue;}if(hi!==null){const c=cf(e.k,vm.box(hi));if(c>0||(c===0&&!hiInc))continue;}mPut(vm,r,e.k,e.v,n);}return r;}
const MAP={
  size:(vm,o)=>o.es.length,isEmpty:(vm,o)=>o.es.length===0,
  put:(vm,o,a,n)=>{const old=mPut(vm,o,a[0],a[1],n);vm.note({t:"put",o});return old;},
  get:(vm,o,a,n)=>{const e=mFind(vm,o,vm.box(a[0]),n);if(e&&o.accessOrder){o.es.splice(o.es.indexOf(e),1);o.es.push(e);vm.touch(o);}return e?e.v:null;},
  getOrDefault:(vm,o,a,n)=>{const e=mFind(vm,o,vm.box(a[0]),n);return e?e.v:a[1];},
  containsKey:(vm,o,a,n)=>!!mFind(vm,o,vm.box(a[0]),n),containsValue:(vm,o,a)=>o.es.some(e=>a[0]===null?e.v===null:vm.jeq(a[0],e.v)),
  remove:(vm,o,a,n)=>{const e=mFind(vm,o,vm.box(a[0]),n);if(!e)return a.length>1?false:null;if(a.length>1){if(!vm.jeq(e.v,a[1]))return false;mDel(vm,o,e);return true;}mDel(vm,o,e);return e.v;},
  putIfAbsent:(vm,o,a,n)=>mPut(vm,o,a[0],a[1],n,true),clear:(vm,o,a,n)=>mClear(vm,o,n),
  putAll:(vm,o,a,n)=>{for(const e of mOrder(a[0]))mPut(vm,o,e.k,e.v,n);},
  keySet:(vm,o)=>o.kv||(o.kv=vm.alloc("view","KeySet",{m:o,w:"k",int:1})),values:(vm,o)=>o.vv||(o.vv=vm.alloc("view","Values",{m:o,w:"v",int:1})),entrySet:(vm,o)=>o.ev||(o.ev=vm.alloc("view","EntrySet",{m:o,w:"e",int:1})),
  merge:(vm,o,a,n)=>{const k=vm.box(a[0]);const e=mFind(vm,o,k,n);if(!e||e.v===null){mPut(vm,o,k,a[1],n);return vm.box(a[1]);}const r=vm.callFn(a[2],[e.v,vm.box(a[1])],n,"apply");if(r===null){mDel(vm,o,e);return null;}e.v=vm.box(r);vm.touch(o);return e.v;},
  compute:(vm,o,a,n)=>{const k=vm.box(a[0]);const e=mFind(vm,o,k,n);const r=vm.callFn(a[1],[k,e?e.v:null],n,"apply");if(r===null){if(e)mDel(vm,o,e);return null;}if(e){e.v=vm.box(r);vm.touch(o);return e.v;}mPut(vm,o,k,r,n);return vm.box(r);},
  computeIfAbsent:(vm,o,a,n)=>{const k=vm.box(a[0]);const e=mFind(vm,o,k,n);if(e&&e.v!==null)return e.v;const r=vm.callFn(a[1],[k],n,"apply");if(r===null)return null;mPut(vm,o,k,r,n);return vm.box(r);},
  computeIfPresent:(vm,o,a,n)=>{const k=vm.box(a[0]);const e=mFind(vm,o,k,n);if(!e||e.v===null)return null;const r=vm.callFn(a[1],[k,e.v],n,"apply");if(r===null){mDel(vm,o,e);return null;}e.v=vm.box(r);vm.touch(o);return e.v;},
  replace:(vm,o,a,n)=>{const e=mFind(vm,o,vm.box(a[0]),n);if(!e)return null;const old=e.v;e.v=vm.box(a[a.length-1]);vm.touch(o);return old;},
  replaceAll:(vm,o,a,n)=>{for(const e of mOrder(o))e.v=vm.box(vm.callFn(a[0],[e.k,e.v],n,"apply"));vm.touch(o);},
  forEach:(vm,o,a,n)=>{const mod=o.mod;for(const e of mOrder(o).slice()){vm.callFn(a[0],[e.k,e.v],n,"accept");if(o.mod!==mod)vm.thr("ConcurrentModificationException",null,n);}},
  firstKey:(vm,o,a,n)=>{if(!o.es.length)vm.thr("NoSuchElementException",null,n);return o.es[0].k;},lastKey:(vm,o,a,n)=>{if(!o.es.length)vm.thr("NoSuchElementException",null,n);return o.es[o.es.length-1].k;},
  firstEntry:(vm,o)=>o.es.length?entryObj(vm,o,o.es[0]):null,lastEntry:(vm,o)=>o.es.length?entryObj(vm,o,o.es[o.es.length-1]):null,
  pollFirstEntry:(vm,o)=>{if(!o.es.length)return null;const e=o.es[0];mDel(vm,o,e);return entryObj(vm,null,e);},pollLastEntry:(vm,o)=>{if(!o.es.length)return null;const e=o.es[o.es.length-1];mDel(vm,o,e);return entryObj(vm,null,e);},
  floorKey:(vm,o,a,n)=>navK(vm,o,a[0],n,"floor"),ceilingKey:(vm,o,a,n)=>navK(vm,o,a[0],n,"ceiling"),higherKey:(vm,o,a,n)=>navK(vm,o,a[0],n,"higher"),lowerKey:(vm,o,a,n)=>navK(vm,o,a[0],n,"lower"),
  floorEntry:(vm,o,a,n)=>{const e=navE(vm,o,a[0],n,"floor");return e?entryObj(vm,o,e):null;},ceilingEntry:(vm,o,a,n)=>{const e=navE(vm,o,a[0],n,"ceiling");return e?entryObj(vm,o,e):null;},
  higherEntry:(vm,o,a,n)=>{const e=navE(vm,o,a[0],n,"higher");return e?entryObj(vm,o,e):null;},lowerEntry:(vm,o,a,n)=>{const e=navE(vm,o,a[0],n,"lower");return e?entryObj(vm,o,e):null;},
  headMap:(vm,o,a,n)=>subTree(vm,o,"map",null,a[0],false,a[1]===true,n),tailMap:(vm,o,a,n)=>subTree(vm,o,"map",a[0],null,a[1]!==false,false,n),
  subMap:(vm,o,a,n)=>subTree(vm,o,"map",a[0],a.length===4?a[2]:a[1],a.length===4?a[1]===true:true,a.length===4?a[3]===true:false,n),
  descendingMap:(vm,o)=>{const m=mNew(vm,"map","LinkedHashMap");for(const e of o.es.slice().reverse())mPut(vm,m,e.k,e.v);return m;},
  descendingKeySet:(vm,o)=>{const s=mNew(vm,"set","LinkedHashSet");for(const e of o.es.slice().reverse())mPut(vm,s,e.k,PRESENT);return s;},
  toString:(vm,o)=>vm.str(libToString(vm,o)),equals:(vm,o,a)=>libEquals(vm,o,a[0]),hashCode:(vm,o)=>libHash(vm,o),getClass:(vm,o)=>vm.classObj(null,o.cls)};
const VIEW=Object.assign({},COLL,{
  size:(vm,o)=>o.m.es.length,isEmpty:(vm,o)=>o.m.es.length===0,
  remove:(vm,o,a,n)=>{if(o.w==="k")return !!mRemove(vm,o.m,vm.box(a[0]),n);if(o.w==="v"){const e=o.m.es.find(e=>vm.jeq(a[0],e.v));if(e){mDel(vm,o.m,e);return true;}return false;}return false;},
  removeIf:(vm,o,a,n)=>{let ch=false;for(const e of mOrder(o.m).slice()){const v=o.w==="k"?e.k:o.w==="v"?e.v:entryObj(vm,o.m,e);if(truthy(vm,vm.callFn(a[0],[v],n,"test"),n)){mDel(vm,o.m,e);ch=true;}}return ch;},
  clear:(vm,o,a,n)=>mClear(vm,o.m,n)});
const ENTRY={getKey:(vm,o)=>o.e.k,getValue:(vm,o)=>o.e.v,setValue:(vm,o,a,n)=>{if(!o.m)vm.thr("UnsupportedOperationException",null,n);const old=o.e.v;o.e.v=vm.box(a[0]);vm.touch(o.m);vm.touch(o);return old;},
  toString:(vm,o)=>vm.str(libToString(vm,o)),equals:(vm,o,a)=>libEquals(vm,o,a[0]),hashCode:(vm,o)=>libHash(vm,o)};
const ITER={hasNext:(vm,o)=>libIterHas(vm,o.st),next:(vm,o,a,n)=>libIterNext(vm,o.st,n),
  remove:(vm,o,a,n)=>{const I0=o.st;if(I0.last===undefined||I0.last===null)vm.thr("IllegalStateException",null,n);const c=o.coll;if(I0.src.mod!==I0.mod)vm.thr("ConcurrentModificationException",null,n);
    if(I0.live){c.a.splice(I0.last,1);I0.i=I0.last;c.mod++;I0.mod=c.mod;vm.touch(c);}
    else{const m=c.kind==="view"?c.m:c;const k=I0.ents?I0.ents[I0.last]:mFind(vm,m,I0.arr[I0.last],n);const e=I0.ents?k:k;if(e)mDel(vm,m,e);I0.mod=m.mod;}
    I0.last=null;vm.touch(o);},
  forEachRemaining:(vm,o,a,n)=>{while(libIterHas(vm,o.st))vm.callFn(a[0],[libIterNext(vm,o.st,n)],n,"accept");}};
const SCAN={
  nextInt:(vm,o,a,n)=>{const t=scNeed(vm,o,n);if(!isJavaInt(t))vm.thr("InputMismatchException",null,n);const v=BigInt(t);if(v>2147483647n||v<-2147483648n)vm.thr("InputMismatchException",'For input string: "'+t+'"',n);scTok(vm,o,false,n);return Number(v);},
  nextLong:(vm,o,a,n)=>{const t=scNeed(vm,o,n);if(!isJavaInt(t))vm.thr("InputMismatchException",null,n);scTok(vm,o,false,n);return BigInt(t);},
  nextDouble:(vm,o,a,n)=>{const t=scNeed(vm,o,n);if(!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t))vm.thr("InputMismatchException",null,n);scTok(vm,o,false,n);return D(parseFloat(t));},
  nextBoolean:(vm,o,a,n)=>{const t=scNeed(vm,o,n);if(!/^(true|false)$/i.test(t))vm.thr("InputMismatchException",null,n);scTok(vm,o,false,n);return t.toLowerCase()==="true";},
  next:(vm,o,a,n)=>{scNeed(vm,o,n);return vm.str(scTok(vm,o,false,n));},
  nextLine:(vm,o,a,n)=>{if(o.pos>=o.src.length)vm.thr("NoSuchElementException","No line found",n);let e=o.src.indexOf("\n",o.pos);if(e<0)e=o.src.length;const s=o.src.slice(o.pos,e).replace(/\r$/,"");o.pos=e+1;vm.touch(o);return vm.str(s);},
  hasNext:(vm,o)=>scTok(vm,o,true)!==null,hasNextInt:(vm,o)=>{const t=scTok(vm,o,true);return t!==null&&isJavaInt(t)&&BigInt(t)<=2147483647n&&BigInt(t)>=-2147483648n;},
  hasNextLine:(vm,o)=>o.pos<o.src.length,hasNextDouble:(vm,o)=>{const t=scTok(vm,o,true);return t!==null&&/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t);},close:()=>{}};
const READER={readLine:(vm,o)=>{if(o.pos>=o.src.length)return null;let e=o.src.indexOf("\n",o.pos);if(e<0)e=o.src.length;const s=o.src.slice(o.pos,e).replace(/\r$/,"");o.pos=e+1;return vm.str(s);},
  read:(vm,o)=>{if(o.pos>=o.src.length)return -1;return o.src.charCodeAt(o.pos++);},close:()=>{},ready:(vm,o)=>o.pos<o.src.length};
const RAND={nextInt:(vm,o,a,n)=>{vm.touch(o);if(a.length===2){const org=num(a[0]),bnd=num(a[1]);if(org>=bnd)vm.thr("IllegalArgumentException","bound must be greater than origin",n);
      let r=rNext(o,32);const nn=(bnd-org)|0,m=nn-1;if((nn&m)===0)return (r&m)+org;if(nn>0){for(let u=r>>>1;((u+m-(r=u%nn))|0)<0;u=rNext(o,32)>>>1);return r+org;}while(r<org||r>=bnd)r=rNext(o,32);return r;}
    return rNextInt(vm,o,a.length?num(a[0]):undefined,n);},
  nextDouble:(vm,o)=>{vm.touch(o);return D(rNextDouble(o));},nextBoolean:(vm,o)=>{vm.touch(o);return rNext(o,1)!==0;},
  nextLong:(vm,o)=>{vm.touch(o);const hi=rNext(o,32),lo=rNext(o,32);return BigInt.asIntN(64,(BigInt(hi)<<32n)+BigInt(lo));},
  nextGaussian:(vm,o)=>{vm.touch(o);if(o.hg!==undefined){const g=o.hg;o.hg=undefined;return D(g);}let v1,v2,s;do{v1=2*rNextDouble(o)-1;v2=2*rNextDouble(o)-1;s=v1*v1+v2*v2;}while(s>=1||s===0);const mul=Math.sqrt(-2*Math.log(s)/s);o.hg=v2*mul;return D(v1*mul);},
  setSeed:(vm,o,a)=>{o.seed=(BigInt.asUintN(64,toL(a[0]))^RM)&RK;o.hg=undefined;}};
const OPT={isPresent:(vm,o)=>o.v!==undefined,isEmpty:(vm,o)=>o.v===undefined,
  get:(vm,o,a,n)=>{if(o.v===undefined)vm.thr("NoSuchElementException","No value present",n);return o.v;},getAsInt:(vm,o,a,n)=>OPT.get(vm,o,a,n),getAsDouble:(vm,o,a,n)=>OPT.get(vm,o,a,n),getAsLong:(vm,o,a,n)=>OPT.get(vm,o,a,n),
  orElse:(vm,o,a)=>o.v===undefined?a[0]:o.v,orElseGet:(vm,o,a,n)=>o.v===undefined?vm.callFn(a[0],[],n,"get"):o.v,
  orElseThrow:(vm,o,a,n)=>{if(o.v!==undefined)return o.v;if(a.length){const ex=vm.callFn(a[0],[],n,"get");vm.throwObj(ex,n);}vm.thr("NoSuchElementException","No value present",n);},
  ifPresent:(vm,o,a,n)=>{if(o.v!==undefined)vm.callFn(a[0],[o.v],n,"accept");},ifPresentOrElse:(vm,o,a,n)=>{if(o.v!==undefined)vm.callFn(a[0],[o.v],n,"accept");else vm.callFn(a[1],[],n,"run");},
  map:(vm,o,a,n)=>{if(o.v===undefined)return o;const r=vm.callFn(a[0],[o.v],n,"apply");return optOf(vm,r===null?undefined:vm.box(r));},
  filter:(vm,o,a,n)=>{if(o.v===undefined)return o;return truthy(vm,vm.callFn(a[0],[o.v],n,"test"),n)?o:optOf(vm,undefined);},
  toString:(vm,o)=>vm.str(libToString(vm,o)),equals:(vm,o,a)=>libEquals(vm,o,a[0]),hashCode:(vm,o)=>o.v===undefined?0:vm.jhash(o.v)};
const STREAM={
  filter:(vm,o,a)=>stAdd(vm,o,{t:"filter",f:a[0]}),map:(vm,o,a)=>stAdd(vm,o,{t:"map",f:a[0],to:o.prim}),mapToInt:(vm,o,a)=>stAdd(vm,o,{t:"map",f:a[0],to:"int"},"int"),
  mapToDouble:(vm,o,a)=>stAdd(vm,o,{t:"map",f:a[0],to:"double"},"double"),mapToLong:(vm,o,a)=>stAdd(vm,o,{t:"map",f:a[0],to:"long"},"long"),mapToObj:(vm,o,a)=>stAdd(vm,o,{t:"map",f:a[0],to:"obj"},null),
  asDoubleStream:(vm,o)=>stAdd(vm,o,{t:"map",f:jsFn(vm,"(double)",x=>D(num(x[0]))),to:"double"},"double"),
  boxed:(vm,o)=>stAdd(vm,o,{t:"boxed"},null),peek:(vm,o,a)=>stAdd(vm,o,{t:"peek",f:a[0]}),limit:(vm,o,a)=>stAdd(vm,o,{t:"limit",k:Number(toL(a[0]))}),skip:(vm,o,a)=>stAdd(vm,o,{t:"skip",k:Number(toL(a[0]))}),
  distinct:(vm,o)=>stAdd(vm,o,{t:"distinct"}),sorted:(vm,o,a)=>stAdd(vm,o,{t:"sorted",c:a[0]||null}),flatMap:(vm,o,a)=>stAdd(vm,o,{t:"flatMap",f:a[0]}),
  forEach:(vm,o,a,n)=>{runStream(vm,o,v=>{vm.callFn(a[0],[v],n,"accept");return true;},n);},forEachOrdered:(vm,o,a,n)=>STREAM.forEach(vm,o,a,n),
  collect:(vm,o,a,n)=>collectorRun(vm,a[0],streamArr(vm,o,n),n),toList:(vm,o,a,n)=>lNew(vm,"ImmutableList",streamArr(vm,o,n).map(v=>vm.box(v)),{imm:true}),
  toArray:(vm,o,a,n)=>{const xs=streamArr(vm,o,n);const r=vm.alloc("arr",null,{et:o.prim||"Object",a:xs});vm.note({t:"alloc",o:r});return r;},
  count:(vm,o,a,n)=>BigInt(streamArr(vm,o,n).length),
  sum:(vm,o,a,n)=>{const xs=streamArr(vm,o,n);if(o.prim==="double")return D(xs.reduce((s,x)=>s+num(x),0));if(o.prim==="long")return xs.reduce((s,x)=>BigInt.asIntN(64,s+toL(x)),0n);return xs.reduce((s,x)=>(s+num(x))|0,0);},
  average:(vm,o,a,n)=>{const xs=streamArr(vm,o,n);return optOf(vm,xs.length?D(xs.reduce((s,x)=>s+num(x),0)/xs.length):undefined,"OptionalDouble");},
  max:(vm,o,a,n)=>stMinMax(vm,o,a,n,true),min:(vm,o,a,n)=>stMinMax(vm,o,a,n,false),
  reduce:(vm,o,a,n)=>{const xs=streamArr(vm,o,n);if(a.length===1){if(!xs.length)return optOf(vm,undefined,o.prim==="int"?"OptionalInt":"Optional");let acc=xs[0];for(let i=1;i<xs.length;i++)acc=vm.callFn(a[0],[acc,xs[i]],n,"apply");return optOf(vm,o.prim?acc:vm.box(acc),o.prim==="int"?"OptionalInt":o.prim==="double"?"OptionalDouble":"Optional");}
    let acc=a[0];for(const x of xs)acc=vm.callFn(a[1],[acc,x],n,"apply");return o.prim?vm.coerce({n:o.prim,d:0},acc):acc;},
  anyMatch:(vm,o,a,n)=>{let r=false;runStream(vm,o,v=>{if(truthy(vm,vm.callFn(a[0],[v],n,"test"),n)){r=true;return false;}return true;},n);return r;},
  allMatch:(vm,o,a,n)=>{let r=true;runStream(vm,o,v=>{if(!truthy(vm,vm.callFn(a[0],[v],n,"test"),n)){r=false;return false;}return true;},n);return r;},
  noneMatch:(vm,o,a,n)=>!STREAM.anyMatch(vm,o,a,n),
  findFirst:(vm,o,a,n)=>{let r;runStream(vm,o,v=>{r=v;return false;},n);return optOf(vm,r===undefined?undefined:o.prim?r:vm.box(r),o.prim==="int"?"OptionalInt":o.prim==="double"?"OptionalDouble":"Optional");},
  findAny:(vm,o,a,n)=>STREAM.findFirst(vm,o,a,n),
  summaryStatistics:(vm,o,a,n)=>{const xs=streamArr(vm,o,n).map(num);const s=xs.reduce((p,x)=>p+x,0);return vm.alloc("misc","IntSummaryStatistics",{text:"IntSummaryStatistics{count="+xs.length+", sum="+s+", min="+(xs.length?Math.min(...xs):2147483647)+", average="+fixedHalfUp(xs.length?s/xs.length:0,6)+", max="+(xs.length?Math.max(...xs):-2147483648)+"}"});}};
function stMinMax(vm,o,a,n,isMax){const xs=streamArr(vm,o,n);const cls=o.prim==="int"?"OptionalInt":o.prim==="double"?"OptionalDouble":o.prim==="long"?"OptionalLong":"Optional";
  if(!xs.length)return optOf(vm,undefined,cls);const cf=o.prim?((x,y)=>num(x)-num(y)):vm.cmpWith(a[0]||null,n);
  let best=xs[0];for(let i=1;i<xs.length;i++){const c=cf(xs[i],best);if(isMax?c>0:c<0)best=xs[i];}return optOf(vm,o.prim?best:vm.box(best),cls);}
const PS={
  println:(vm,o,a,n)=>{vm.print((a.length?psStr(vm,a[0]):"")+"\n",o.err);},
  print:(vm,o,a,n)=>{vm.print(psStr(vm,a[0]),o.err);},
  printf:(vm,o,a,n)=>{vm.print(jformat(vm,S(vm,a[0],n),fmtArgs(vm,a.slice(1)),n),o.err);return o;},
  format:(vm,o,a,n)=>PS.printf(vm,o,a,n),flush:()=>{},write:(vm,o,a)=>{vm.print(String.fromCharCode(num(a[0])),o.err);}};
function psStr(vm,v){if(v instanceof HObj&&v.kind==="arr"&&v.et==="char")return v.a.map(c=>String.fromCharCode(c.c)).join("");return vm.jstr(v);}
const CLSOBJ={getName:(vm,o)=>vm.str(o.C?o.C.qname:(QN[o.name]||(PRIM.has(o.name)?o.name:"java.lang."+o.name))),getSimpleName:(vm,o)=>vm.str(o.C?o.C.simple:o.name),
  toString:(vm,o)=>vm.str(libToString(vm,o)),equals:(vm,o,a)=>o===a[0],hashCode:(vm,o)=>vm.ihash(o),isInstance:(vm,o,a)=>o.C?vm.instOf(a[0],{n:o.C.name,d:0}):false};
const TABLES={str:STR,box:BOX,arr:ARR,sb:SB,list:LIST,deque:DQ,pq:PQ,set:SET,map:MAP,view:VIEW,entry:ENTRY,iter:ITER,scanner:SCAN,reader:READER,random:RAND,opt:OPT,stream:STREAM,ps:PS,clsobj:CLSOBJ};
function libCall(vm,o,name,args,n){
  let T=TABLES[o.kind];
  if(o.kind==="list"&&o.cls==="LinkedList"&&!(name in LIST)&&DQ[name])T=DQ;
  if(o.kind==="list"&&o.cls==="LinkedList"&&["peek","poll","offer","push","pop","remove","element","addFirst","addLast","offerFirst","offerLast","removeFirst","removeLast","peekFirst","peekLast","pollFirst","pollLast","getFirst","getLast","descendingIterator"].includes(name)&&!(name==="remove"&&args.length))T=DQ;
  const f=T&&T[name];
  if(f)return f(vm,o,args,n);
  switch(name){
    case "toString":if(!args.length)return vm.str(libToString(vm,o));break;
    case "equals":return libEquals(vm,o,args[0]);case "hashCode":return libHash(vm,o);case "getClass":return vm.classObj(null,o.cls);}
  if(o.kind==="misc"&&o.cls==="Thread"&&name==="getName")return vm.str("main");
  if(o.kind==="misc"&&o.cls==="StackTraceElement")return vm.str(o.text);
  vm.fatal(n,(QN[o.cls]?o.cls:o.kind==="str"?"String":o.cls||o.kind)+"."+name+"() is not supported in the visualizer, use Run for real output");}
G.JVML={run:(src,stdin,opts)=>JVM_RUN(src,stdin,opts),state:(r,k)=>JVM_STATE(r,k),parse,lex,version:VERSION};
})(typeof window!=="undefined"?window:globalThis);
