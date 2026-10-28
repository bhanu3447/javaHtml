/* P02 labs (Template Method): data only, drawn by the kit in labs-patterns.js (DPL.add / DPL.play). Hosts:
   #dp-tplpain (Pain lab: three copied inspection checklists drifting), #dp-tplref (Refactor lab: copies → abstract base with a final
   template method, an abstract step and a hook), #dp-tplrun (Runtime lab, sequence view of new EvInspection().inspect("Nexon EV")),
   #dpp-tplplay (Playground: pick the car type, override the road-test hook, run the inspection), #dp-tpluml (Structure: Roles / Dealership).
   Code excerpts come from InspectionBefore.java / InspectionAfter.java, run on JDK 25 (kb/patterns-02-template-method.md).
   Everything sits inside one IIFE: classic scripts share one global scope. */
"use strict";
(function(){

/* ---------- shared code excerpts ---------- */
const BEFORE=`class PetrolInspection {
    void inspect(String model) {
        System.out.println("== PDI " + model + " ==");
        System.out.println("bay booked");
        System.out.println("common: tyres, lights, wipers, brake fluid");
        System.out.println("petrol: engine oil, fuel lines");
        System.out.println("road test: 5 km");
        System.out.println("signed off");
    }
}

class DieselInspection {                 // copied from PetrolInspection, then edited
    void inspect(String model) {
        System.out.println("== PDI " + model + " ==");
        System.out.println("bay booked");
        System.out.println("common: tyres, lights, wipers");          // brake fluid never added here
        System.out.println("diesel: engine oil, AdBlue level");
        System.out.println("road test: 5 km");
        System.out.println("signed off");
    }
}

class EvInspection {                     // copied again, from an older version
    void inspect(String model) {
        System.out.println("== PDI " + model + " ==");
        System.out.println("bay booked");
        System.out.println("common: tyres, lights, wipers, brake fluid");
        System.out.println("ev: battery health, charge port");
        System.out.println("signed off");                           // signed off BEFORE the road test
        System.out.println("road test: 5 km");
    }
}`;

const SUBS=`class PetrolInspection extends PreDeliveryInspection {
    @Override protected void modelChecks() { System.out.println("petrol: engine oil, fuel lines"); }
}

class DieselInspection extends PreDeliveryInspection {
    @Override protected void modelChecks() { System.out.println("diesel: engine oil, AdBlue level"); }
}

class EvInspection extends PreDeliveryInspection {
    @Override protected void modelChecks() { System.out.println("ev    : battery health, charge port"); }`;

const AFTER_BASE=`abstract class PreDeliveryInspection {
    // the template method: the order of the steps is written once, here, and cannot be overridden
    public final void inspect(String model) {
        System.out.println("== PDI " + model + " ==");
        bookBay();
        commonChecks();
        modelChecks();                     // primitive operation: every subclass must fill it in
        if (needsRoadTest()) roadTest();   // hook: optional step with a default
        signOff();
    }

    private void bookBay()      { System.out.println("base  : bay booked"); }
    private void commonChecks() { System.out.println("base  : tyres, lights, wipers, brake fluid"); }
    protected abstract void modelChecks();
    protected boolean needsRoadTest() { return true; }
    protected void roadTest()   { System.out.println("base  : road test 5 km"); }
    private void signOff()      { System.out.println("base  : signed off"); }
}`;
const AFTER=AFTER_BASE+"\n\n"+SUBS+`
    @Override protected void roadTest()    { System.out.println("ev    : road test 5 km + regen braking"); }
}`;

/* ---------- Refactor lab: four versions of the base box, one set of extends arrows per version ---------- */
const PDI=[
  ["pdi2",["+ inspect(model)","# modelChecks()  abstract"]],
  ["pdi3",["+ inspect(model)","- bookBay()","- commonChecks()","# modelChecks()  abstract","- roadTest()","- signOff()"]],
  ["pdi4",["+ inspect(model)  final","- bookBay()","- commonChecks()","# modelChecks()  abstract","- roadTest()","- signOff()"]],
  ["pdi5",["+ inspect(model)  final","- bookBay()","- commonChecks()","# modelChecks()  abstract","# needsRoadTest(): boolean","# roadTest()","- signOff()"]]];
const REF_NODES=PDI.map(([id,m])=>({id,x:130,y:10,w:340,name:"PreDeliveryInspection",st:"abstract",m})).concat([
  {id:"pb",x:10,y:200,w:180,name:"PetrolInspection",m:["+ inspect(model)"]},
  {id:"db",x:210,y:200,w:180,name:"DieselInspection",m:["+ inspect(model)"]},
  {id:"eb",x:410,y:200,w:180,name:"EvInspection",m:["+ inspect(model)"]},
  {id:"pa",x:10,y:200,w:180,name:"PetrolInspection",m:["# modelChecks()"]},
  {id:"da",x:210,y:200,w:180,name:"DieselInspection",m:["# modelChecks()"]},
  {id:"ea",x:410,y:200,w:180,name:"EvInspection",m:["# modelChecks()"]},
  {id:"ea5",x:410,y:200,w:180,name:"EvInspection",m:["# modelChecks()","# roadTest()"]},
  ["anon",10,290,200,"anonymous subclass","needsRoadTest() → false",44],
  ["nobase",150,70,300,"no base class yet","each class owns a full copy",48]]);
const REF_EDGES=[];
PDI.forEach(([id])=>{const v=id.slice(3);REF_EDGES.push(["xp"+v,"pa",id,"ext"],["xd"+v,"da",id,"ext"],["xe"+v,v==="5"?"ea5":"ea",id,"ext"]);});
REF_EDGES.push(["xan","anon","pa","ext"]);
const ALL_IDS=REF_NODES.map(n=>Array.isArray(n)?n[0]:n.id).concat(REF_EDGES.map(e=>e[0]));
/* show = the node and edge ids visible in this step; everything else is hidden */
const only=show=>ALL_IDS.filter(id=>!show.includes(id));
const ver=v=>["pdi"+v,"pa","da",v==="5"?"ea5":"ea","xp"+v,"xd"+v,"xe"+v];

const S2=`abstract class PreDeliveryInspection {                 // the order, written once
    public void inspect(String model) {
        System.out.println("== PDI " + model + " ==");
        System.out.println("bay booked");
        System.out.println("common: tyres, lights, wipers, brake fluid");
        modelChecks();                                  // the one step that varies
        System.out.println("road test: 5 km");
        System.out.println("signed off");
    }
    protected abstract void modelChecks();
}

class PetrolInspection extends PreDeliveryInspection {
    void inspect(String model) { /* 6 copied lines */ }
    @Override protected void modelChecks() { System.out.println("petrol: engine oil, fuel lines"); }
}

class DieselInspection extends PreDeliveryInspection {
    void inspect(String model) { /* 6 copied lines */ }
    @Override protected void modelChecks() { System.out.println("diesel: engine oil, AdBlue level"); }
}

class EvInspection extends PreDeliveryInspection {
    void inspect(String model) { /* 6 copied lines */ }
    @Override protected void modelChecks() { System.out.println("ev    : battery health, charge port"); }
}`;
const S3BASE=`abstract class PreDeliveryInspection {
    public void inspect(String model) {
        System.out.println("== PDI " + model + " ==");
        bookBay();
        commonChecks();
        modelChecks();
        roadTest();
        signOff();
    }

    private void bookBay()      { System.out.println("base  : bay booked"); }
    private void commonChecks() { System.out.println("base  : tyres, lights, wipers, brake fluid"); }
    protected abstract void modelChecks();
    private void roadTest()     { System.out.println("base  : road test 5 km"); }
    private void signOff()      { System.out.println("base  : signed off"); }
}`;
const S3=S3BASE+"\n\n"+SUBS+"\n}";
const S4=S3.replace("    public void inspect(String model) {","    public final void inspect(String model) {      // final: no subclass can reorder or skip steps");
const S6=AFTER+`

// a variant is now one small class; here an anonymous one for a demo car
PreDeliveryInspection demo = new PetrolInspection() {
    @Override protected boolean needsRoadTest() { return false; }
};
demo.inspect("Swift demo");`;

/* ---------- Pain lab: three columns of copied steps ---------- */
const COLS=[["p",10,"PetrolInspection","petrol"],["d",210,"DieselInspection","diesel"],["e",410,"EvInspection","EV"]];
const PAIN_NODES=[["main",200,6,200,"main()","the client",40]];
COLS.forEach(([c,x,name,fuel])=>{PAIN_NODES.push({id:c+"c",x,y:62,w:180,name,m:["+ inspect(model)"]});
  ["1 book bay","2 common checks","3 "+fuel+" checks","4 road test","5 sign off"].forEach((t,i)=>PAIN_NODES.push([c+(i+1),x,120+i*40,180,t,"",34]));});
const col=c=>[c+"c",c+"1",c+"2",c+"3",c+"4",c+"5"];
const common=c=>[c+"1",c+"2",c+"4",c+"5"];

DPL.add({

/* ---------- §01 Pain lab ---------- */
tplpain:{pill:"PAIN LAB · ONE CHECKLIST, THREE COPIES",views:[{name:"Copy and paste",h:322,
 nodes:PAIN_NODES,
 edges:[["m1","main","pc"],["m2","main","dc"],["m3","main","ec"]],
 code:BEFORE,
 steps:[
 {t:"One car type, one checklist",d:"Before a new car is handed over, the workshop runs a <b>pre-delivery inspection</b> (PDI). <code>PetrolInspection.inspect()</code> prints its five steps in order: the five boxes under the class are the five lines inside that one method. <code>main()</code> is the <b>client</b>: the code that uses the class. The arrow means \"calls\".",
  cur:["pc"],on:["p1","p2","p3","p4","p5"],lines:["m1"],hide:col("d").concat(col("e"),["m2","m3"]),marks:["class PetrolInspection"],meter:["places to edit per checklist change",1,4],note:"5 steps, written once"},
 {t:"Diesel arrives: copy, paste, edit one line",d:"The quickest way to support diesel cars is to copy the class and change step 3. It works today. But steps 1, 2, 4 and 5 (highlighted) now exist <b>twice</b>, and nothing ties the two copies together.",
  on:common("p").concat(common("d")),good:["p3","d3"],cur:["dc"],lines:["m1","m2"],hide:col("e").concat(["m3"]),marks:["class DieselInspection","copied from PetrolInspection"],meter:["places to edit per checklist change",2,4],note:"the same order, written twice"},
 {t:"EV arrives: a third copy",d:"Electric cars need battery checks instead of engine checks, so a third copy appears. Only the green step really differs between the three classes; everything else is duplicated.",
  on:common("p").concat(common("d"),common("e")),good:["p3","d3","e3"],cur:["ec"],lines:"all",marks:["class EvInspection"],meter:["places to edit per checklist change",3,4],note:"3 copies of one checklist"},
 {t:"Change request: add brake fluid to the common checks",d:"The service manager adds brake fluid to the checklist. Someone must edit <b>all three</b> copies. Petrol and EV were edited; diesel was forgotten, and nothing (no compiler, no test) noticed. The copies have started to <b>drift</b> apart.",
  good:["p2","e2"],bad:["d2"],on:["pc","dc","ec"],lines:"all",txt:{d2:["2 missing brake fluid",""]},marks:["brake fluid never added here"],meter:["places to edit per checklist change",3,4],note:"edited 2 of 3 copies"},
 {t:"The order drifts too",d:"The EV class was copied from an older version where the car was signed off <b>before</b> the road test. Each class decides the order for itself, so a wrong order is just another line nobody compares.",
  bad:["d2","e4","e5"],on:["pc","dc","ec"],lines:"all",txt:{d2:["2 missing brake fluid",""],e4:["4 sign off",""],e5:["5 road test",""]},marks:["signed off BEFORE"],meter:["places to edit per checklist change",3,4],note:"signed off before the road test"},
 {t:"CNG cars next month: a fourth copy",d:"Each new car type adds another copy of the same order, and each checklist change must be repeated in every copy. <b>The smell</b>: several classes run the same steps in the same order and differ in only one or two of them.",
  bad:["d2","e4","e5"],on:common("p").concat(common("d"),common("e")),good:["p3","d3","e3"],lines:"all",txt:{d2:["2 missing brake fluid",""],e4:["4 sign off",""],e5:["5 road test",""]},marks:["void inspect(String model)"],meter:["places to edit per checklist change",4,4],note:"one order, written N times"}]}]},

/* ---------- §02 Refactor lab ---------- */
tplref:{pill:"REFACTOR LAB · COPIES TO ONE TEMPLATE",views:[{name:"Refactor",h:350,
 nodes:REF_NODES,edges:REF_EDGES,
 steps:[
 {t:"Start: three classes, three copies of the order",d:"Each class has its own <code>inspect()</code> with all six print lines. We will move the shared order into one place in small steps, running the program after each one.",
  code:BEFORE,hide:only(["pb","db","eb","nobase"]),bad:["pb","db","eb"],marks:["void inspect(String model)"],meter:["copies of the step order",3,3],note:"3 copies"},
 {t:"Pull the order up into an abstract base class",d:"A new <b>abstract class</b> (it can hold code but cannot be created with <code>new</code>) gets the one copy of the order. The step that differs becomes an <b>abstract method</b>, <code>modelChecks()</code>: a blank the base class calls but does not fill. Each subclass now <code>extends</code> the base, deletes its copied <code>inspect()</code> and fills in only the blank.",
  code:S2,hide:only(ver("2")),cur:["pdi2"],good:["pa","da","ea"],lines:["xp2","xd2","xe2"],add:["abstract class PreDeliveryInspection","modelChecks();","extends PreDeliveryInspection","protected void modelChecks() {"],del:["6 copied lines"],marks:["public void inspect(String model) {"],meter:["copies of the step order",1,3],note:"1 copy of the order"},
 {t:"Name every fixed step and make it private",d:"Each fixed step becomes a small <code>private</code> method. Private methods cannot be overridden, so no subclass can change how a bay is booked or how sign-off works. The template now reads like the printed checklist: one line per step.",
  code:S3,hide:only(ver("3")),cur:["pdi3"],on:["pa","da","ea"],lines:["xp3","xd3","xe3"],add:["bookBay();","commonChecks();","roadTest();","signOff();","private void"],del:[],marks:["protected abstract void modelChecks"],meter:["copies of the step order",1,3],note:"base fixes the steps"},
 {t:"Make the template method final",d:"<code>inspect()</code> is now the <b>template method</b>: it fixes the order and calls the steps. Marking it <code>final</code> means no subclass can override it, so the EV bug (sign-off before the road test) can no longer be written: the compiler rejects it.",
  code:S4,hide:only(ver("4")),cur:["pdi4"],on:["pa","da","ea"],lines:["xp4","xd4","xe4"],add:["public final void inspect"],marks:["signOff();"],meter:["copies of the step order",1,3],note:"order locked by the compiler"},
 {t:"An optional step becomes a hook",d:"Some cars need no road test (a demo car already driven 300 km). A <b>hook</b> is a step with a default that subclasses <i>may</i> override: <code>needsRoadTest()</code> returns <code>true</code> unless a subclass says otherwise, and <code>roadTest()</code> is now <code>protected</code> with a default body. EV overrides <code>roadTest()</code> to add regen braking.",
  code:AFTER,hide:only(ver("5")),cur:["pdi5"],good:["ea5"],on:["pa","da"],lines:["xp5","xd5","xe5"],add:["if (needsRoadTest()) roadTest();","protected boolean needsRoadTest","protected void roadTest()","regen braking"],marks:["protected abstract void modelChecks"],meter:["copies of the step order",1,3],note:"abstract = must fill · hook = may fill"},
 {t:"A new variant is one small class",d:"The demo car needs no new copy of the checklist: an (anonymous) subclass overrides one hook and inherits everything else. A CNG car would be one class with one method. The order still lives in exactly one place.",
  code:S6,hide:only(ver("5").concat(["anon","xan"])),good:["anon"],on:["pdi5","pa","da","ea5"],lines:["xan"],add:["PreDeliveryInspection demo","return false;"],marks:["demo.inspect"],meter:["copies of the step order",1,3],note:"new variant = new subclass, base untouched"}]}]},

/* ---------- §03 Runtime lab (sequence) ---------- */
tplrun:{pill:"RUNTIME LAB · WHO CALLS WHOM",views:[{name:"Runtime",alt:"Sequence diagram: main creates an EvInspection and calls inspect; the base class code calls bookBay, commonChecks, then calls down into EvInspection for modelChecks and roadTest, then signOff.",
 seq:{lanes:[["m","main()","the client"],["b","inspection","base class code"],["s","inspection","EvInspection code"]],
  msgs:[["m","s","new EvInspection()","new"],["m","b","inspect(\"Nexon EV\")"],["b","b","bookBay()","self"],["b","b","commonChecks()","self"],
   ["b","s","modelChecks()"],["s","b","return","ret"],["b","b","needsRoadTest() → true","self"],["b","s","roadTest()"],["s","b","return","ret"],["b","b","signOff()","self"],["b","m","return","ret"]]},
 code:AFTER+`

new EvInspection().inspect("Nexon EV");`,
 steps:[
 {t:"main creates one object",d:"<code>new EvInspection()</code> makes <b>one</b> object. The two right-hand lanes are the same object: the middle lane is the code it inherited from <code>PreDeliveryInspection</code>, the right lane is the code written in <code>EvInspection</code>.",upto:1,cur:0,marks:["new EvInspection().inspect"]},
 {t:"main calls the template method",d:"<code>inspect</code> is not in <code>EvInspection</code>; Java finds it in the parent. It prints the header line.",upto:2,cur:1,marks:["public final void inspect","== PDI"],note:"== PDI Nexon EV =="},
 {t:"Fixed step: bookBay()",d:"A private method of the base class runs. The subclass cannot touch it.",upto:3,cur:2,marks:["private void bookBay"],note:"base  : bay booked"},
 {t:"Fixed step: commonChecks()",d:"Same for the common checks: one copy, used by every car type.",upto:4,cur:3,marks:["private void commonChecks"],note:"base  : tyres, lights, wipers, brake fluid"},
 {t:"The base calls down: modelChecks()",d:"<code>modelChecks()</code> is abstract in the base, so dynamic dispatch runs the object's own version, in <code>EvInspection</code>. The parent calls the child, not the other way round: the <b>Hollywood principle</b>, \"don't call us, we'll call you\".",upto:5,cur:4,marks:["ev    : battery health"],note:"ev    : battery health, charge port"},
 {t:"Control comes back to the template",d:"The subclass method returns; the template continues with the next line. The subclass never decides what comes next.",upto:6,cur:5,marks:["if (needsRoadTest()) roadTest();"]},
 {t:"Hook: needsRoadTest()",d:"<code>EvInspection</code> does not override this hook, so the base default runs and returns <code>true</code>. Nothing is printed.",upto:7,cur:6,marks:["protected boolean needsRoadTest"]},
 {t:"Hook with an override: roadTest()",d:"<code>roadTest()</code> has a default in the base, but <code>EvInspection</code> overrides it, so the EV version runs.",upto:8,cur:7,marks:["regen braking\")"],note:"ev    : road test 5 km + regen braking"},
 {t:"Back in the template",d:"The override returns and the template moves to the last step.",upto:9,cur:8,marks:["if (needsRoadTest()) roadTest();"]},
 {t:"Fixed step: signOff()",d:"Sign-off is always last: the order is in one <code>final</code> method.",upto:10,cur:9,marks:["private void signOff"],note:"base  : signed off"},
 {t:"inspect returns to main",d:"Six lines printed; four came from base-class code, two from <code>EvInspection</code>. main only ever called <b>one</b> method.",upto:11,cur:10,marks:["new EvInspection().inspect"],note:"6 lines: 4 from the base, 2 from the subclass"}]}]},

/* ---------- §05 Structure lab ---------- */
tpluml:{pill:"STRUCTURE LAB · THE ROLES",views:[
 {name:"Roles",h:280,
 nodes:[{id:"ac",x:150,y:10,w:290,name:"AbstractClass",st:"abstract",m:["+ templateMethod()  final","# primitiveOperation()  abstract","# hook()  default body"]},
  ["cl",460,10,130,"Client","templateMethod()"],
  {id:"ca",x:40,y:180,w:230,name:"ConcreteClassA",m:["# primitiveOperation()"]},
  {id:"cb",x:330,y:180,w:230,name:"ConcreteClassB",m:["# primitiveOperation()","# hook()"]}],
 edges:[["c1","cl","ac"],["e1","ca","ac","ext"],["e2","cb","ac","ext"]],
 steps:[
 {t:"AbstractClass owns the algorithm",d:"The <b>AbstractClass</b> holds the <b>template method</b>: one <code>final</code> method that calls the steps in a fixed order. It is abstract because one or more steps are left blank.",cur:["ac"],lines:[]},
 {t:"Primitive operations: the blanks",d:"A <b>primitive operation</b> is an abstract step: the template calls it, every concrete subclass <b>must</b> implement it. Usually <code>protected</code>, because only the template should call it.",cur:["ac","ca","cb"],lines:["e1","e2"]},
 {t:"Hooks: optional steps",d:"A <b>hook</b> has a default body (often empty, or <code>return true</code>). Subclasses <b>may</b> override it to add or skip behaviour. ConcreteClassB does; ConcreteClassA keeps the default.",cur:["cb"],on:["ac"],dim:["ca"],lines:["e2"]},
 {t:"ConcreteClasses fill in the blanks",d:"Each <b>ConcreteClass</b> extends the AbstractClass (solid line, hollow triangle) and supplies only the varying steps. It inherits the template and never calls it itself.",cur:["ca","cb"],on:["ac"],lines:["e1","e2"]},
 {t:"The client calls the template",d:"The <b>client</b> holds a variable of the abstract type and calls <code>templateMethod()</code>. Control flows <b>down</b> from the parent to the child's steps: the Hollywood principle.",cur:["cl"],on:["ac"],lines:["c1"]}]},
 {name:"Dealership",h:300,
 nodes:[{id:"pdi",x:130,y:10,w:340,name:"PreDeliveryInspection",st:"abstract",m:["+ inspect(model)  final","- bookBay()","- commonChecks()","# modelChecks()  abstract","# needsRoadTest(): boolean","# roadTest()","- signOff()"]},
  ["mn",490,10,100,"main()","inspect(model)"],
  {id:"pe",x:10,y:220,w:180,name:"PetrolInspection",m:["# modelChecks()"]},
  {id:"de",x:210,y:220,w:180,name:"DieselInspection",m:["# modelChecks()"]},
  {id:"ev",x:410,y:220,w:180,name:"EvInspection",m:["# modelChecks()","# roadTest()"]}],
 edges:[["c1","mn","pdi"],["e1","pe","pdi","ext"],["e2","de","pdi","ext"],["e3","ev","pdi","ext"]],
 code:AFTER,
 steps:[
 {t:"AbstractClass = PreDeliveryInspection",d:"<code>inspect(model)</code> is the template method (<code>final</code>). The <code>-</code> lines are private fixed steps, the <code>#</code> lines are protected steps meant for subclasses.",cur:["pdi"],lines:[],marks:["public final void inspect"]},
 {t:"Primitive operation = modelChecks()",d:"Abstract in the base; each car type must implement it.",cur:["pe","de","ev"],on:["pdi"],lines:["e1","e2","e3"],marks:["protected void modelChecks()"]},
 {t:"Hooks = needsRoadTest() and roadTest()",d:"Both have defaults. <code>EvInspection</code> overrides <code>roadTest()</code>; the demo car (an anonymous subclass in main) overrides <code>needsRoadTest()</code>.",cur:["ev"],on:["pdi"],dim:["pe","de"],lines:["e3"],marks:["protected boolean needsRoadTest","protected void roadTest()"]},
 {t:"Client = main()",d:"main creates a concrete inspection and calls <code>inspect</code>, the only public method. Adding a CNG car = one new subclass; nothing above it changes.",cur:["mn"],on:["pdi"],lines:["c1"],marks:["public final void inspect"]}]}]}
});

/* ---------- §03 Playground: what does inspect() print for this car? ---------- */
const MODEL={petrol:"Swift",diesel:"XUV700",ev:"Nexon EV"};
const CLS={petrol:"PetrolInspection",diesel:"DieselInspection",ev:"EvInspection"};
const CHECKS={petrol:"petrol: engine oil, fuel lines",diesel:"diesel: engine oil, AdBlue level",ev:"ev    : battery health, charge port"};
DPL.play({tplplay:{pill:"RUN AN INSPECTION",
 init:()=>({type:"ev",skip:false,ran:null}),
 controls:[{id:"type",type:"select",label:"Car type",options:[["petrol","Petrol · Swift"],["diesel","Diesel · XUV700"],["ev","EV · Nexon EV"]]},
  {id:"skip",type:"toggle",label:"Override hook: needsRoadTest() returns false"},
  {id:"run",type:"button",label:"▶ Run inspection"}],
 act:(s,id)=>{if(id==="run")s.ran=s.type+"|"+s.skip;},
 render:s=>{
  const t=s.type,ran=s.ran===t+"|"+s.skip,ev=t==="ev",road=!s.skip;
  const subM=["# modelChecks()"].concat(ev?["# roadTest()"]:[],s.skip?["# needsRoadTest() → false"]:[]);
  const sub={id:"sub",x:10,y:190,w:280,name:s.skip?"anonymous subclass of "+CLS[t]:CLS[t],m:subM};
  const step=(id,y,t1,s1)=>[id,320,y,270,t1,s1,40];
  const nodes=[{id:"pdi",x:10,y:10,w:280,name:"PreDeliveryInspection",st:"abstract",m:["+ inspect(model)  final","- bookBay()","- commonChecks()","# modelChecks()  abstract","# needsRoadTest(): boolean","# roadTest()","- signOff()"]},sub,
   step("s1",10,"1  bookBay()","from the base class"),
   step("s2",58,"2  commonChecks()","from the base class"),
   step("s3",106,"3  modelChecks()","from "+CLS[t]),
   step("s4",154,"4  needsRoadTest() → roadTest()",!road?"skipped: the hook returned false":ev?"roadTest() from EvInspection":"roadTest() from the base class"),
   step("s5",202,"5  signOff()","from the base class")];
  const edges=[["x","sub","pdi","ext"],["c1","pdi","s1"],["c2","pdi","s2"],["c3","pdi","s3"],["c4","pdi","s4"],["c5","pdi","s5"]];
  const call=(s.skip?"new "+CLS[t]+"() { needsRoadTest() → false }":"new "+CLS[t]+"()")+".inspect(\""+MODEL[t]+"\")";
  if(!ran)return {h:275,nodes,edges,lines:[],dim:["s1","s2","s3","s4","s5"],alt:"Class diagram and the five steps, not run yet",
    out:"Choose a car type and the hook, then press ▶ Run inspection.\nJava will run: "+call};
  const lines=["== PDI "+MODEL[t]+" ==","base  : bay booked","base  : tyres, lights, wipers, brake fluid",CHECKS[t]];
  if(road)lines.push(ev?"ev    : road test 5 km + regen braking":"base  : road test 5 km");
  lines.push("base  : signed off");
  const fromSub=["s3"].concat(road&&ev?["s4"]:[]);
  return {h:275,nodes,edges,good:fromSub.concat(["sub"]),on:["pdi","s1","s2","s5"].concat(road&&!ev?["s4"]:[]),dim:road?[]:["s4"],
   lines:road?["x","c1","c2","c3","c4","c5"]:["x","c1","c2","c3","c5"],
   alt:"Steps run in order; green steps came from "+sub.name,
   log:["// "+call],out:lines.join("\n")};}}});

})();
