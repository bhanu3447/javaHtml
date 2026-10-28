// usage: node scripts/dp-checks/dpmatch.js <project-relative page, e.g. patterns/01-strategy.html>
// "Diagrams match code": every UML class box name (and every method name in it) in every lab view of the page must appear in the
// page's Java code (the <script type="text/x-java"> blocks plus the labs' own code panels). Views whose name starts with "Roles"
// use the generic GoF role names on purpose and are skipped. Prints JSON {page, checked, fails[]}.
const fs=require("fs"),path=require("path"),vm=require("vm");
const PRJ=path.resolve(__dirname,"../..");
const page=process.argv[2];const html=fs.readFileSync(path.join(PRJ,page),"utf8");
let java=[...html.matchAll(/<script type="text\/x-java"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join("\n");
java+="\n"+[...html.matchAll(/<pre class="dp-spring"[^>]*>([\s\S]*?)<\/pre>/g)].map(m=>m[1]).join("\n");
const labs={},plays={};
const DPL={add:m=>Object.assign(labs,m),play:m=>Object.assign(plays,m),families(){},picker(){},map(){},CATALOG:[],BYN:{},glyph:()=>""};
const ctx={DPL,document:{getElementById:()=>null,querySelectorAll:()=>[],querySelector:()=>null},window:{},console};
ctx.window.DPL=DPL;vm.createContext(ctx);
const data=[...html.matchAll(/<script src="\.\.\/assets\/labs\/(labs-patterns-p\d\d\.js)"><\/script>/g)].map(m=>m[1]);
data.forEach(f=>vm.runInContext(fs.readFileSync(path.join(PRJ,"assets/labs",f),"utf8"),ctx,{filename:f}));
[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach(m=>{if(/DPL\.(add|play)/.test(m[1]))vm.runInContext(m[1],ctx);});
const fails=[];let checked=0;
Object.entries(labs).forEach(([key,spec])=>spec.views.forEach(v=>{
  if(/^Roles/i.test(v.name||""))return;
  const code=java+"\n"+(v.code||"")+"\n"+v.steps.map(s=>s.code||"").join("\n");
  (v.nodes||[]).forEach(n=>{if(Array.isArray(n))return;
    const name=String(n.name).replace(/<.*$/,"").trim();checked++;
    if(!new RegExp("\\b"+name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b").test(code))fails.push(key+"/"+v.name+": class "+name+" not in code");
    (n.m||[]).forEach(m=>{const mm=String(m).match(/([A-Za-z_]\w*)\s*\(/);if(!mm)return;checked++;
      if(!new RegExp("\\b"+mm[1]+"\\s*\\(").test(code))fails.push(key+"/"+v.name+": method "+name+"."+mm[1]+"() not in code");});
  });}));
console.log(JSON.stringify({page,labs:Object.keys(labs).length,plays:Object.keys(plays).length,checked,fails}));
