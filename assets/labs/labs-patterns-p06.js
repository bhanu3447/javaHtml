/* P06 labs (Singleton): data only, drawn by the kit in labs-patterns.js (DPL.add / DPL.play). Hosts: #dp-sglpain (three desks, three
   registries that disagree), #dp-sglref (refactor: new everywhere → private constructor + static field + getInstance(), then lazy),
   #dp-sglrun (sequence view of three getInstance() calls), #dpp-sglplay (playground: three desks, "naive new" toggle, sell CH-101),
   #dp-sgluml (Roles / Dealership). Every class and method name comes from the P06 programs, all run on JDK 25 (kb/patterns-06-singleton.md). */
"use strict";
DPL.add({

/* ---------- §1 Pain lab: every desk makes its own registry ---------- */
sglpain:{pill:"PAIN LAB · EVERY DESK MAKES ITS OWN REGISTRY",views:[{name:"Pain",h:268,
 nodes:[["sd",10,12,110,"Sales desk","sells cars"],["vd",10,102,110,"Service desk","books repairs"],["rp",10,192,110,"Reports","month-end stock"],
  {id:"r1",x:175,y:5,w:215,name:"VehicleRegistry",m:["+ sell(chassis)","+ isInStock(chassis)"]},
  {id:"r2",x:175,y:95,w:215,name:"VehicleRegistry",m:["+ sell(chassis)","+ isInStock(chassis)"]},
  {id:"r3",x:175,y:185,w:215,name:"VehicleRegistry",m:["+ sell(chassis)","+ isInStock(chassis)"]},
  ["s1",450,12,135,"stock list","3 cars"],["s2",450,102,135,"stock list","3 cars"],["s3",450,192,135,"stock list","3 cars"]],
 edges:[["a1","sd","r1","calls",0,"","h"],["a2","vd","r2","calls",0,"","h"],["a3","rp","r3","calls",0,"","h"],
  ["b1","r1","s1","has",0,"","h"],["b2","r2","s2","has",0,"","h"],["b3","r3","s3","has",0,"","h"]],
 steps:[
 {t:"Day 1: the sales desk keeps the stock",d:`A <b>registry</b> is a list of every car in stock, found by its <b>chassis number</b> (the number stamped on the car, like <code>CH-101</code>). The sales desk makes one with <code>new VehicleRegistry()</code>: <code>new</code> is the Java word that builds a fresh object. The arrow means "calls"; the diamond means "owns". One desk, one registry, one stock list of 3 cars. Nothing hurts yet.`,
  code:`// Sales desk
VehicleRegistry registry = new VehicleRegistry();   // 3 cars in stock
registry.sell("CH-101");`,marks:["new VehicleRegistry()"],hide:["vd","rp","r2","r3","s2","s3","a2","a3","b2","b3"],on:["sd"],lines:["a1","b1"],meter:["places that call new VehicleRegistry()",1,3],note:"1 registry"},
 {t:"Request 1: the service desk needs the stock too",d:`The service desk wants to check whether a car is in stock before it promises a part. It writes the same line, <code>new VehicleRegistry()</code>. That builds a <b>second, separate</b> registry. It starts with the same 3 cars, so for now nothing looks wrong.`,
  code:`// Sales desk
VehicleRegistry registry = new VehicleRegistry();

// Service desk
VehicleRegistry registry = new VehicleRegistry();   // a second copy`,add:["// Service desk","VehicleRegistry registry = new VehicleRegistry();   // a second copy"],hide:["rp","r3","s3","a3","b3"],on:["vd","r2"],lines:["a1","a2","b1","b2"],meter:["places that call new VehicleRegistry()",2,3],note:"2 registries"},
 {t:"Request 2: the month-end report needs it",d:`Reports also needs the stock, so it makes a <b>third</b> registry. The code is the same everywhere, which makes it feel harmless. But the showroom now has three separate stock lists, and each one only changes when <i>its own</i> owner changes it.`,
  code:`// Sales desk:    new VehicleRegistry()
// Service desk:  new VehicleRegistry()
// Reports:       new VehicleRegistry()      // a third copy`,add:["// Reports:       new VehicleRegistry()"],on:["rp","r3"],lines:["a1","a2","a3","b1","b2","b3"],meter:["places that call new VehicleRegistry()",3,3],note:"3 registries"},
 {t:"A car is sold: the copies disagree",d:`The sales desk sells <code>CH-101</code> and calls <code>sell("CH-101")</code> on <b>its</b> registry. That list now has 2 cars. The service desk and Reports still list <code>CH-101</code> as in stock, because nobody told their copies. Reports will promise a car that is already gone. This is the real bug: <b>one fact, three places</b>.`,
  code:`salesDesk.sell("CH-101");
salesDesk.isInStock("CH-101");   // false
reports.isInStock("CH-101");     // true  (stale copy)`,add:["salesDesk.sell(\"CH-101\");","reports.isInStock(\"CH-101\");     // true  (stale copy)"],txt:{s1:["stock list","2 cars"],s2:["stock list","still has CH-101"],s3:["stock list","still has CH-101"]},on:["s1"],bad:["s2","s3","r2","r3"],lines:["a1","b1"],meter:["places that call new VehicleRegistry()",3,3],note:"copies disagree"},
 {t:"The usual workaround: pass one around by hand",d:`You could create one registry in <code>main</code> and pass it into every class that needs it. That works, but every class and every method between them must carry it, and nothing stops a new teammate from writing <code>new VehicleRegistry()</code> again next month. The class itself does not protect the rule "there is only one".`,
  code:`new SalesDesk(registry);
new ServiceDesk(registry);
new Reports(registry);          // and so on, for every class
// nothing stops: new VehicleRegistry()`,txt:{s1:["stock list","2 cars"],s2:["stock list","still has CH-101"],s3:["stock list","still has CH-101"]},bad:["r2","r3","s2","s3"],lines:"all",meter:["places that call new VehicleRegistry()",3,3],note:"rule not enforced"},
 {t:"What we want",d:`The class should <b>refuse</b> to be created twice. There must be exactly one <code>VehicleRegistry</code> in the whole program, and every desk must reach that same object through one agreed doorway. That is the <b>Singleton</b> pattern. Section 02 builds it in small steps.`,
  txt:{s1:["stock list","2 cars"],s2:["stock list","still has CH-101"],s3:["stock list","still has CH-101"]},bad:["r1","r2","r3"],lines:"all",meter:["places that call new VehicleRegistry()",3,3],note:"one registry, one doorway"}]}]},

/* ---------- §2 Refactor lab: new everywhere → Singleton ---------- */
sglref:{pill:"REFACTOR LAB · new EVERYWHERE → ONE INSTANCE",views:[{name:"Refactor",h:268,
 nodes:[["sd",10,12,110,"Sales desk","caller"],["vd",10,102,110,"Service desk","caller"],["rp",10,192,110,"Reports","caller"],
  {id:"r1",x:175,y:5,w:215,name:"VehicleRegistry",m:["+ VehicleRegistry()","+ sell(chassis)"]},
  {id:"r2",x:175,y:95,w:215,name:"VehicleRegistry",m:["+ VehicleRegistry()","+ sell(chassis)"]},
  {id:"r3",x:175,y:185,w:215,name:"VehicleRegistry",m:["+ VehicleRegistry()","+ sell(chassis)"]},
  {id:"va",x:260,y:70,w:330,name:"VehicleRegistry",m:["- VehicleRegistry()","+ sell(chassis)","+ isInStock(chassis)"]},
  {id:"vb",x:260,y:55,w:330,name:"VehicleRegistry",f:["- static final INSTANCE: VehicleRegistry"],m:["- VehicleRegistry()","+ sell(chassis)","+ isInStock(chassis)"]},
  {id:"vc",x:260,y:40,w:330,name:"VehicleRegistry",f:["- static final INSTANCE: VehicleRegistry"],m:["- VehicleRegistry()","+ getInstance(): VehicleRegistry","+ sell(chassis)","+ isInStock(chassis)"]}],
 edges:[["o1","sd","r1","calls",0,"","h"],["o2","vd","r2","calls",0,"","h"],["o3","rp","r3","calls",0,"","h"],
  ["n1","sd","vc","calls",0,"","h"],["n2","vd","vc","calls",0,"","h"],["n3","rp","vc","calls",0,"","h"]],
 steps:[
 {t:"Find what hurts",d:`Three desks, three <code>new VehicleRegistry()</code> calls, three registries that can disagree. The constructor is <b>public</b> (the default here), so any class can build another copy at any time. <b>What we want:</b> exactly one registry, and a class that makes a second one impossible.`,
  code:`class VehicleRegistry {
    VehicleRegistry() { ... }            // anyone can call this
    void sell(String chassis) { ... }
}

VehicleRegistry registry = new VehicleRegistry();   // sales, service, reports`,marks:["VehicleRegistry registry = new"],hide:["va","vb","vc","n1","n2","n3"],bad:["r1","r2","r3"],lines:"all",meter:["places that can create a registry",3,3],note:"3 copies"},
 {t:"1. Make the constructor private",d:`Add the word <code>private</code> to the constructor. Now only code <b>inside</b> <code>VehicleRegistry</code> can say <code>new VehicleRegistry()</code>. Every desk that did it now fails to <b>compile</b>, which is what we want: the compiler finds every place that must change. The first half of "exactly one": nobody outside can make another.`,
  code:`class VehicleRegistry {
    VehicleRegistry() { ... }            // anyone can call this
    private VehicleRegistry() { ... }    // only this class can
    void sell(String chassis) { ... }
}

// in a desk: new VehicleRegistry()  ->  compile error`,add:["private VehicleRegistry() { ... }    // only this class can"],del:["// anyone can call this"],hide:["r1","r2","r3","vb","vc","o1","o2","o3","n1","n2","n3"],bad:["sd","vd","rp"],good:["va"],meter:["places that can create a registry",3,3],note:"callers no longer compile"},
 {t:"2. Keep the one instance in a private static field",d:`Someone must still build the single registry, so the class builds it <b>itself</b>. A <code>static</code> field belongs to the <b>class</b>, not to an object, so there is exactly one of it. <code>final</code> means it is set once. <code>private</code> keeps outsiders away from the field. This is called <b>eager initialisation</b>: the object is created as soon as the class is loaded.`,
  code:`final class VehicleRegistry {
    private static final VehicleRegistry INSTANCE = new VehicleRegistry();   // the one object

    private VehicleRegistry() { ... }
    void sell(String chassis) { ... }
}`,add:["private static final VehicleRegistry INSTANCE = new VehicleRegistry();"],hide:["r1","r2","r3","va","vc","o1","o2","o3","n1","n2","n3"],bad:["sd","vd","rp"],good:["vb"],meter:["places that can create a registry",1,3],note:"the class makes its own one"},
 {t:"3. Give everyone one public doorway: getInstance()",d:`The field is private, so the desks need a way in. Add a <code>public static</code> method, conventionally called <code>getInstance()</code>, that returns the field. <code>static</code> means you call it on the class: <code>VehicleRegistry.getInstance()</code>, no object needed first. The method is the doorway; there is no other.`,
  code:`final class VehicleRegistry {
    private static final VehicleRegistry INSTANCE = new VehicleRegistry();

    private VehicleRegistry() { ... }

    public static VehicleRegistry getInstance() { return INSTANCE; }   // the doorway
    void sell(String chassis) { ... }
}`,add:["public static VehicleRegistry getInstance() { return INSTANCE; }"],hide:["r1","r2","r3","va","vb","o1","o2","o3","n1","n2","n3"],bad:["sd","vd","rp"],good:["vc"],meter:["places that can create a registry",1,3],note:"one doorway"},
 {t:"4. Switch the desks to getInstance()",d:`In each desk replace <code>new VehicleRegistry()</code> with <code>VehicleRegistry.getInstance()</code>. All three arrows now end at the <b>same box</b>. The sale made at the sales desk is visible in Reports, because there is only one stock list. <code>salesDesk == reports</code> is <code>true</code>: two names, one object.`,
  code:`VehicleRegistry registry = new VehicleRegistry();
VehicleRegistry registry = VehicleRegistry.getInstance();   // all three desks

salesDesk.sell("CH-101");
reports.isInStock("CH-101");   // false: the same object`,add:["VehicleRegistry registry = VehicleRegistry.getInstance();   // all three desks","reports.isInStock(\"CH-101\");   // false: the same object"],del:["VehicleRegistry registry = new VehicleRegistry();"],hide:["r1","r2","r3","va","vb"],good:["vc","sd","vd","rp"],lines:["n1","n2","n3"],meter:["places that can create a registry",1,3],note:"one object, three names"},
 {t:"5. Option: create it lazily, on the first call",d:`Eager creation builds the registry even if nobody ever asks for it. <b>Lazy</b> initialisation waits: the field starts empty and <code>getInstance()</code> builds the object on the first call. It is the same Singleton, created later. <b>Warning:</b> this simple lazy version is only safe with one thread. Two threads could both see <code>null</code> and build two. Fixing that is in section 06.`,
  code:`private static final VehicleRegistry INSTANCE = new VehicleRegistry();
private static VehicleRegistry instance;          // empty until the first call

public static VehicleRegistry getInstance() {
    if (instance == null) instance = new VehicleRegistry();
    return instance;
}`,add:["private static VehicleRegistry instance;","if (instance == null) instance = new VehicleRegistry();","return instance;"],del:["private static final VehicleRegistry INSTANCE"],hide:["r1","r2","r3","va","vb"],good:["vc"],lines:["n1","n2","n3"],meter:["places that can create a registry",1,3],note:"lazy: only safe for one thread"}]}]},

/* ---------- §3 Runtime lab: three getInstance() calls ---------- */
sglrun:{pill:"RUNTIME LAB · THREE DESKS CALL getInstance()",views:[{name:"Runtime",alt:"Sequence diagram: main calls getInstance on the VehicleRegistry class; the class sees its field is null, creates the registry and stores it, and returns it. The next two getInstance calls find the field already set and return the same registry; main compares salesDesk and serviceDesk and gets true; then a sale through one name is seen through another",
 seq:{lanes:[["main","main()","the three desks"],["cls","VehicleRegistry","the class (static)"],["obj","registry","the one object"]],
  msgs:[["main","cls","getInstance()"],["cls","cls","instance == null ? yes","self"],["cls","obj","new VehicleRegistry()","new"],["cls","cls","instance = the new object","self"],["cls","main","the registry","ret"],
   ["main","cls","getInstance()"],["cls","cls","instance == null ? no","self"],["cls","main","the same registry","ret"],
   ["main","cls","getInstance()"],["cls","main","the same registry","ret"],
   ["main","main","salesDesk == serviceDesk: true","self"],["main","obj","sell(\"CH-101\")"],["main","obj","isInStock(\"CH-101\")"],["obj","main","false","ret"]]},
 code:`VehicleRegistry salesDesk = VehicleRegistry.getInstance();
VehicleRegistry serviceDesk = VehicleRegistry.getInstance();
VehicleRegistry reports = VehicleRegistry.getInstance();
System.out.println(salesDesk == serviceDesk);   // true
salesDesk.sell("CH-101");
System.out.println(reports.isInStock("CH-101")); // false

private static VehicleRegistry instance;
public static VehicleRegistry getInstance() {
    if (instance == null) {
        instance = new VehicleRegistry();
    }
    return instance;
}`,
 steps:[
 {t:"The sales desk asks for the registry",d:`<code>main</code> calls <code>VehicleRegistry.getInstance()</code>. A column here is an object, time runs downwards, a solid arrow is a call. The call goes to the <b>class</b> (it is <code>static</code>), not to an object: no registry exists yet, so there is nothing else to call.`,upto:1,cur:0,marks:["VehicleRegistry salesDesk = VehicleRegistry.getInstance();","public static VehicleRegistry getInstance()"]},
 {t:"First call: the field is empty, so create",d:`Inside <code>getInstance()</code> the loop arrow is the check <code>instance == null</code>. It is <code>null</code> (nothing stored yet), so the class runs its own private constructor: the new-object arrow. That is why the program prints <b>VehicleRegistry created</b> here, once. Then the object is stored in the <code>instance</code> field.`,upto:4,cur:2,marks:["if (instance == null) {","instance = new VehicleRegistry();"]},
 {t:"The registry is returned",d:`<code>getInstance()</code> returns the stored object to <code>main</code>, which keeps it in <code>salesDesk</code>. The registry exists now: the third column is filled.`,upto:5,cur:4,marks:["return instance;"]},
 {t:"Second call: same object, nothing created",d:`The service desk calls <code>getInstance()</code>. This time <code>instance == null</code> is <b>false</b>, so the <code>if</code> body is skipped: there is no new-object arrow, and nothing is printed. The method just returns the stored object. The third desk (Reports) does exactly the same.`,upto:10,cur:6,marks:["VehicleRegistry serviceDesk = VehicleRegistry.getInstance();","VehicleRegistry reports = VehicleRegistry.getInstance();"]},
 {t:"One object, three names",d:`<code>salesDesk == serviceDesk</code> compares the two <b>references</b> (the arrows that point to an object). Both point at the same registry, so the program prints <b>true</b>. For a Singleton, <code>==</code> is the proof.`,upto:11,cur:10,marks:["System.out.println(salesDesk == serviceDesk);"],note:"prints true"},
 {t:"A sale through one name is seen by all",d:`<code>salesDesk.sell("CH-101")</code> removes the car from the one stock list. Asking <code>reports.isInStock("CH-101")</code> goes to the <b>same</b> object, so the answer is <b>false</b>. The three desks can no longer disagree.`,upto:14,cur:13,marks:["salesDesk.sell(\"CH-101\");","System.out.println(reports.isInStock(\"CH-101\"));"],note:"prints false"}]}]},

/* ---------- §5 Structure lab ---------- */
sgluml:{pill:"STRUCTURE LAB · THE ROLES",views:[
 {name:"Roles",h:240,
 nodes:[["c1",10,15,110,"Client A","needs the object"],["c2",10,95,110,"Client B","needs it too"],["c3",10,175,110,"Client C","and this one"],
  {id:"sg",x:200,y:10,w:390,name:"Singleton",f:["- static instance: Singleton"],m:["- Singleton()","+ static getInstance(): Singleton","+ operation()"]}],
 edges:[["e1","c1","sg","calls",0,"","h"],["e2","c2","sg","calls",0,"","h"],["e3","c3","sg","calls",0,"","h"]],
 steps:[
 {t:"Singleton: the only class",d:`There is only one real role: the <b>Singleton</b> class. Its two promises are "at most one instance exists" and "everyone can reach it". Everything else in the picture is a <b>client</b> (code that uses it).`,cur:["sg"],hide:["e1","e2","e3"],dim:["c1","c2","c3"]},
 {t:"A private constructor",d:`<code>- Singleton()</code>: the <code>-</code> means <b>private</b>. Nobody outside can write <code>new Singleton()</code>. This stops other copies.`,cur:["sg"],hide:["e1","e2","e3"],dim:["c1","c2","c3"]},
 {t:"A static field holds the instance",d:`<code>- static instance</code>: one field, owned by the class, that holds the single object. Underline (static) in UML means "one per class, not one per object".`,cur:["sg"],hide:["e1","e2","e3"],dim:["c1","c2","c3"]},
 {t:"getInstance(): the global doorway",d:`<code>+ static getInstance()</code> returns the instance (and, if it is lazy, creates it first). Every client uses this and only this.`,cur:["sg"],hide:["e1","e2","e3"],dim:["c1","c2","c3"]},
 {t:"Clients all arrive at one box",d:`Each client calls <code>Singleton.getInstance()</code>. Three arrows, one object. That is the whole pattern.`,on:["sg"],good:["sg"],lines:"all"}]},
 {name:"Dealership",h:240,
 nodes:[["sd",10,15,110,"Sales desk","sells cars"],["vd",10,95,110,"Service desk","books repairs"],["rp",10,175,110,"Reports","month-end"],
  {id:"vr",x:200,y:10,w:390,name:"VehicleRegistry",f:["- static final INSTANCE: VehicleRegistry","- inStock: Set"],m:["- VehicleRegistry()","+ static getInstance(): VehicleRegistry","+ sell(chassis)","+ isInStock(chassis)","+ count(): int"]}],
 edges:[["u1","sd","vr","calls",0,"","h"],["u2","vd","vr","calls",0,"","h"],["u3","rp","vr","calls",0,"","h"]],
 steps:[
 {t:"VehicleRegistry is the Singleton",d:`The class keeps the stock of cars by chassis number in <code>inStock</code>. It is <code>final</code> so nobody can subclass it and sneak in a second one.`,cur:["vr"],hide:["u1","u2","u3"],dim:["sd","vd","rp"]},
 {t:"Private constructor, static INSTANCE",d:`<code>private VehicleRegistry()</code> and <code>private static final INSTANCE</code>: the class builds its one registry itself, when it loads (eager).`,cur:["vr"],hide:["u1","u2","u3"],dim:["sd","vd","rp"]},
 {t:"getInstance() is the doorway",d:`The three desks never write <code>new</code>. They call <code>VehicleRegistry.getInstance()</code> and get the same object back.`,on:["vr"],good:["vr"],lines:"all"},
 {t:"One sentence",d:`"There is one <code>VehicleRegistry</code> for the whole showroom; every desk reaches it through <code>getInstance()</code>, so every desk sees the same stock."`,lines:"all"}]}]}
});

/* ---------- §3 Playground: three desks, naive new toggle, sell CH-101 (same lines as SingletonBefore / SingletonRun) ---------- */
DPL.play({sglplay:{pill:"PLAYGROUND · THREE DESKS, ONE REGISTRY (OR NOT)",
 init:()=>({naive:false,n:0,single:null,regs:{},refs:{sd:null,vd:null,rp:null},decl:{},runs:[]}),
 controls:[{id:"sales",type:"button",label:"Sales desk getInstance()"},
  {id:"service",type:"button",label:"Service desk getInstance()"},
  {id:"reports",type:"button",label:"Reports getInstance()"},
  {id:"sell",type:"button",label:"Sell car CH-101"},
  {id:"naive",type:"toggle",label:"naive new (no Singleton)"}],
 act:(s,id)=>{
  const D={sales:["sd","salesDesk","Sales desk"],service:["vd","serviceDesk","Service desk"],reports:["rp","reports","Reports"]};
  const run={code:[],lines:[]};
  if(D[id]){const d=D[id],decl=s.decl[d[0]]?"":"VehicleRegistry ";s.decl[d[0]]=true;
   if(s.naive){const k=++s.n;s.regs[k]={stock:["CH-101","CH-102","CH-103"]};s.refs[d[0]]=k;
    run.code.push(decl+d[1]+" = new VehicleRegistry();");run.lines.push("new VehicleRegistry created");}
   else{if(!s.single){const k=++s.n;s.regs[k]={stock:["CH-101","CH-102","CH-103"]};s.single=k;run.lines.push("VehicleRegistry created");}
    s.refs[d[0]]=s.single;run.code.push(decl+d[1]+" = VehicleRegistry.getInstance();");}}
  else if(id==="sell"){
   run.code.push('salesDesk.sell("CH-101");');
   if(s.refs.sd===null){run.lines.push('Exception in thread "main" java.lang.NullPointerException: Cannot invoke "VehicleRegistry.sell(String)" because "salesDesk" is null');}
   else{const r=s.regs[s.refs.sd];r.stock=r.stock.filter(c=>c!=="CH-101");
    Object.keys(D).forEach(k=>{const d=D[k],ref=s.refs[d[0]];if(ref===null)return;
     run.code.push('System.out.println("'+d[2]+': CH-101 in stock? " + '+d[1]+'.isInStock("CH-101"));');
     run.lines.push(d[2]+": CH-101 in stock? "+s.regs[ref].stock.includes("CH-101"));});}}
  else return;
  s.runs.push(run);if(s.runs.length>3)s.runs.shift();},
 render:s=>{
  const Y={sd:12,vd:102,rp:192},NM={sd:["Sales desk","salesDesk"],vd:["Service desk","serviceDesk"],rp:["Reports","reports"]};
  const nodes=[],edges=[],on=[],bad=[],good=[],keys=["sd","vd","rp"];
  keys.forEach(k=>{nodes.push([k,10,Y[k],120,NM[k][0],s.refs[k]===null?NM[k][1]+" = null":NM[k][1]]);if(s.refs[k]!==null)on.push(k);});
  const ids=[...new Set(keys.map(k=>s.refs[k]).filter(v=>v!==null))];
  const stocks=ids.map(i=>s.regs[i].stock.join(" ")),differ=new Set(stocks).size>1;
  ids.forEach(i=>{const who=keys.filter(k=>s.refs[k]===i),y=who.length>1?102:Y[who[0]],rid="r"+i;
   nodes.push([rid,230,y,190,"VehicleRegistry #"+i,s.regs[i].stock.length+" cars: "+s.regs[i].stock.map(c=>c.slice(3)).join(" ")]);
   who.forEach(k=>edges.push(["e"+k,k,rid,"calls",0,"","h"]));
   if(differ)bad.push(rid);else if(i===s.single)good.push(rid);});
  const verdict=!ids.length?["no registry yet","press a desk"]:ids.length===1?["one object","every desk agrees"]:differ?["copies differ","reports go stale"]:["equal, "+ids.length+" copies","a sale splits them"];
  nodes.push(["vd2",465,102,125,verdict[0],verdict[1]]);
  const lines=edges.map(e=>e[0]);
  const out=s.runs.reduce((a,r)=>a.concat(r.lines),[]),log=s.runs.reduce((a,r)=>a.concat(r.code),[]);
  if(differ)bad.push("vd2");else if(ids.length===1)good.push("vd2");
  return {h:262,alt:!ids.length?"No registry exists yet":ids.length===1?"All desks hold the same single registry":differ?"The desks hold separate registries whose stock lists differ":"The desks hold separate registries",
   nodes:nodes,edges:edges,on:on,good:good,bad:bad,lines:lines,
   log:log.length?log:["// press a desk button to run its line"],out:out.length?"// output:\n"+out.join("\n"):"// output:"};
 }}});
