// usage: node scripts/dp-checks/qmerge.js p00add <file>   → appends QZ_P00_ADD questions to QZ.p00 and RC_P00_ADD prompts to RC.p00
//        node scripts/dp-checks/qmerge.js lesson <file>   → the file holds "QZ.pNN=[…];" and "RC.pNN={…};": replaces an existing QZ.pNN/RC.pNN or appends at the end
// Validates by evaluating the result (every answer index valid, no "</script>" or "${").
const fs=require("fs"),vm=require("vm");
const QF=require("path").resolve(__dirname,"../../assets/data/quiz-data.js");
const [mode,file]=process.argv.slice(2);let q=fs.readFileSync(QF,"utf8");const add=fs.readFileSync(file,"utf8");
if(/<\/script>|\$\{/.test(add))throw new Error("forbidden </script> or ${ in "+file);
const statement=(src,name)=>{const i=src.indexOf(name+"=");if(i<0)return null;let d=0,j=src.indexOf("=",i)+1,inS=null;
  for(;j<src.length;j++){const c=src[j];if(inS){if(c==="\\"){j++;continue;}if(c===inS)inS=null;continue;}
    if(c==='"'||c==="'"||c==="`"){inS=c;continue;}if(c==="["||c==="{")d++;else if(c==="]"||c==="}"){d--;if(d===0){j++;break;}}}
  if(src[j]===";")j++;return [i,j];};
if(mode==="p00add"){
  const ctx={};vm.createContext(ctx);vm.runInContext(add,ctx);
  const [a,b]=statement(q,"QZ.p00");const qBody=q.slice(a,b);const close=qBody.lastIndexOf("]");
  const lines=add.slice(add.indexOf("QZ_P00_ADD=[")+12,statement(add,"QZ_P00_ADD")[1]).replace(/\];?\s*$/,"").trim().replace(/,\s*$/,"");
  q=q.slice(0,a)+qBody.slice(0,close).replace(/,?\s*$/,",\n")+lines+"\n"+qBody.slice(close)+q.slice(b);
  const [c,d]=statement(q,"RC.p00");const rc=vm.runInContext("("+q.slice(c+7,d).replace(/;$/,"")+")",vm.createContext({}));
  for(const k of Object.keys(ctx.RC_P00_ADD))rc[k]=(rc[k]||[]).concat(ctx.RC_P00_ADD[k]);
  q=q.slice(0,c)+"RC.p00="+JSON.stringify(rc).replace(/\],"d/g,'],\n "d')+";"+q.slice(d);
}else{
  for(const name of [...add.matchAll(/^(QZ\.p\d\d|RC\.p\d\d)=/gm)].map(m=>m[1])){
    const [a,b]=statement(add,name),stmt=add.slice(a,b).trim(),ex=statement(q,name);
    q=ex?q.slice(0,ex[0])+stmt+q.slice(ex[1]):q.replace(/\s*$/,"\n")+stmt+"\n";
  }
}
const ctx={window:{},QZ:undefined,RC:undefined};vm.createContext(ctx);vm.runInContext(q.replace(/^(?:const|let|var)\s+(QZ|RC)\s*=/gm,"$1="),ctx);
const QZ=ctx.QZ||ctx.window.QZ,RC=ctx.RC||ctx.window.RC;
let bad=[];for(const k in QZ)QZ[k].forEach((x,i)=>{if(!(x.a>=0&&x.a<x.o.length))bad.push(k+"#"+i);});
if(bad.length)throw new Error("bad answer index: "+bad.join(", "));
fs.writeFileSync(QF,q);
console.log("ok",Object.keys(QZ).filter(k=>/^p/.test(k)).map(k=>k+":"+QZ[k].length+"q/"+(RC[k]?Object.values(RC[k]).flat().length:0)+"rc").join(" "));
