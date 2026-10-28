/* P07 labs (Prototype): data only, drawn by the kit in labs-patterns.js (DPL.add / DPL.play). Hosts: #dp-propain (demo-car set-up repeated,
   duplicate() with instanceof), #dp-proref (refactor: copy constructor shallow → deep → Car.copy() → registry), #dp-prorun (sequence view:
   shallow copy shares the list, deep copy does not), #dpp-proplay (playground: template, deep copy toggle, copy, add accessory),
   #dp-prouml (Roles / Dealership). Class and method names come from the P07 programs, all run on JDK 25 (kb/patterns-07-prototype.md). */
"use strict";
DPL.add({

/* ---------- §1 Pain lab: every new demo car repeats the set-up ---------- */
propain:{pill:"PAIN LAB · EVERY DEMO CAR REPEATS THE SET-UP",views:[{name:"Pain",h:268,
 nodes:[["s1",10,12,150,"Set-up code","8 lines"],["s2",10,102,150,"Set-up code","8 lines (pasted)"],["s3",10,192,150,"Set-up code","8 lines (pasted)"],
  ["c1",225,12,170,"Demo car 1","Nexon, Blue, 2 extras"],["c2",225,102,170,"Demo car 2","Nexon, Blue, 2 extras"],["c3",225,192,170,"Demo car 3","Nexon, Blue, 2 extras"],
  ["dp",450,102,135,"duplicate(Car)","instanceof chain"]],
 edges:[["a1","s1","c1","calls",0,"","h"],["a2","s2","c2","calls",0,"","h"],["a3","s3","c3","calls",0,"","h"],["d1","dp","c1","calls",0,"","h"]],
 steps:[
 {t:"Day 1: one demo car for test drives",d:`A <b>demo car</b> is the showroom car customers take on a test drive. It is not just a model name: it has a trim (the version, like XZ+), a colour, a list of accessories (sunroof, floor mats), a map of dealer-fitted extras with their prices, and a <code>ServiceHistory</code> object. A few lines of set-up code build it. The arrow means "builds". One set-up, one car: fine.`,
  code:`PetrolCar car = new PetrolCar("Nexon", "XZ+", "Blue");
car.accessories.add("Sunroof");
car.accessories.add("Floor mats");
car.extras.put("Alarm", 4500L);
car.history.entries.add("PDI done");`,marks:["new PetrolCar"],hide:["s2","s3","c2","c3","dp","a2","a3","d1"],on:["s1"],lines:["a1"],meter:["places to edit",1,6],note:"1 set-up"},
 {t:"Request 1: a second demo car for the other branch",d:`The second branch wants an identical Nexon. You paste the <b>whole set-up</b> again. It works, but now the same 8 lines live in two places. The code does not say "make another one like that car"; it says "repeat all the steps".`,
  code:`// branch 1
PetrolCar car1 = new PetrolCar("Nexon", "XZ+", "Blue");  ...8 lines
// branch 2: pasted
PetrolCar car2 = new PetrolCar("Nexon", "XZ+", "Blue");  ...8 lines`,add:["// branch 2: pasted"],hide:["s3","c3","dp","a3","d1"],on:["s2","c2"],lines:["a1","a2"],meter:["places to edit",2,6],note:"2 copies of the set-up"},
 {t:"Request 2: a third demo car",d:`A third showroom wants one too. Another paste. Each paste is a chance to mistype a price or forget a line.`,
  code:`// branch 1: 8 lines
// branch 2: 8 lines (pasted)
// branch 3: 8 lines (pasted)`,add:["// branch 3: 8 lines (pasted)"],hide:["dp","d1"],on:["s3","c3"],lines:["a1","a2","a3"],meter:["places to edit",3,6],note:"3 copies of the set-up"},
 {t:"Request 3: the alarm now costs more",d:`Head office raises the alarm price. You must find and edit <b>every</b> set-up. Miss one and that demo car quotes the old price. One fact lives in three places, so the cars drift apart.`,
  code:`car.extras.put("Alarm", 4500L);   // branch 1
car.extras.put("Alarm", 4500L);   // branch 2  (forgot to change!)
car.extras.put("Alarm", 4500L);   // branch 3`,hide:["dp","d1"],bad:["c2","s2"],lines:["a1","a2","a3"],meter:["places to edit",4,6],note:"3 places to change one price"},
 {t:"Request 4: copy any car, but I only have a Car",d:`The booking service receives a <code>Car</code> (an <b>interface</b>: a list of methods, with no fields). It must make a copy of whichever car it got. It does not know if it is a <code>PetrolCar</code> or an <code>EvCar</code>, so you write <code>duplicate(Car c)</code> with an <code>instanceof</code> chain: one branch per class, each rebuilding the car field by field.`,
  code:`static Car duplicate(Car c) {
    if (c instanceof PetrolCar p) {
        PetrolCar n = new PetrolCar(p.model, p.trim, p.colour);
        n.accessories.addAll(p.accessories);
        return n;
    }
    // else if (c instanceof EvCar e) { ... }
    throw new IllegalArgumentException("unknown car");
}`,add:["static Car duplicate(Car c) {","if (c instanceof PetrolCar p) {"],on:["dp"],lines:["d1"],meter:["places to edit",5,6],note:"duplicate() needs every class"},
 {t:"The copy is incomplete, and a new class breaks it",d:`Look at the code again: the extras map and the service history were never copied, so the copy has <code>extras=0, services=0</code>. Nobody noticed, because it still compiles. And when a new <code>EvCar</code> arrives, <code>duplicate</code> throws "unknown car" until someone adds a branch. <b>What we want:</b> a car that knows how to copy itself, and a ready-made example to copy from.`,
  code:`// copy.describe():
// Nexon XZ+ Blue | accessories=[...] | extras=0 | services=0`,txt:{dp:["duplicate(Car)","forgot 2 fields"]},bad:["dp","c2"],lines:["d1"],meter:["places to edit",6,6],note:"incomplete copies, new class breaks it"}]}]},

/* ---------- §2 Refactor lab: set-up repeated → copy() + registry ---------- */
proref:{pill:"REFACTOR LAB · REPEATED SET-UP → copy() AND A REGISTRY",views:[{name:"Refactor",h:325,
 nodes:[["mn",10,130,80,"main()","client"],
  {id:"reg",x:115,y:8,w:185,name:"CarRegistry",f:["- templates: Map"],m:["+ register(key, car)","+ create(key): Car"]},
  {id:"car",x:335,y:8,w:255,name:"Car",st:"interface",m:["+ copy(): Car","+ setColour(colour)","+ addAccessory(accessory)","+ describe(): String"]},
  {id:"pa",x:115,y:130,w:185,name:"PetrolCar",f:["- accessories: List","- history: ServiceHistory"],m:["+ PetrolCar(src)"]},
  {id:"pc",x:115,y:130,w:185,name:"PetrolCar",f:["- accessories: List","- history: ServiceHistory"],m:["+ PetrolCar(src)","+ copy(): Car"]},
  {id:"sh",x:335,y:130,w:255,name:"ServiceHistory",f:["- entries: List"],m:["+ copy(): ServiceHistory","+ size(): int"]},
  {id:"ev",x:115,y:245,w:185,name:"EvCar",f:["- batteryKwh: int"],m:["+ copy(): Car"]}],
 edges:[["m0","mn","pa","calls",0,"","h"],["m1","mn","reg","calls",0,"","h"],["r1","reg","car","has",0,"","h"],["i1","pc","car","impl",0,"","h"],
  ["e1","ev","pc","ext",0,"","v"],["h0","pa","sh","has",0,"","h"],["h1","pc","sh","has",0,"","h"]],
 steps:[
 {t:"Find what hurts",d:`Every new demo car repeats the set-up, and <code>duplicate</code> must know each class. The caller has to <b>name the class</b> (<code>PetrolCar</code>) to copy it. <b>What we want:</b> the car copies itself, the caller needs no class name, and ready-made templates are kept in one place.`,
  code:`PetrolCar a = nexonDemo();   // 5 set-up lines
PetrolCar b = nexonDemo();   // again
static Car duplicate(Car c) { /* instanceof per class */ }`,marks:["nexonDemo()","duplicate"],hide:["reg","car","pc","sh","ev","m1","r1","i1","e1","h0","h1"],on:["pa"],bad:["mn"],lines:["m0"],meter:["classes the caller must name to copy a car",2,2],note:"caller names every class"},
 {t:"1. Give the class a copy constructor (first try: shared)",d:`A <b>copy constructor</b> is a constructor that takes another object of the same class and copies its fields. The first, obvious version just assigns each field: <code>this.accessories = src.accessories</code>. That copies the <b>reference</b> (the arrow to the list), not the list. The copy and the original now point at the <b>same</b> list and the <b>same</b> history. This is a <b>shallow copy</b>, and it is a bug waiting to happen.`,
  code:`PetrolCar(PetrolCar src) {
    this.accessories = src.accessories;   // same list!
    this.history = src.history;           // same history!
}`,add:["this.accessories = src.accessories;   // same list!","this.history = src.history;           // same history!"],hide:["reg","car","pc","sh","ev","m1","r1","i1","e1","h0","h1"],bad:["pa"],lines:["m0"],meter:["things the copy shares with the original",2,2],note:"shallow: shares list and history"},
 {t:"2. Copy the list, not the reference",d:`Make a <b>new</b> list and copy the contents in: <code>new ArrayList</code> then <code>addAll</code>. The strings inside are immutable (they never change), so sharing them is safe. The copy now owns its own list; adding an accessory to the copy leaves the original alone.`,
  code:`PetrolCar(PetrolCar src) {
    this.accessories = src.accessories;   // same list!
    this.accessories.addAll(src.accessories);   // a new list, same strings
    this.history = src.history;           // same history!
}`,add:["this.accessories.addAll(src.accessories);   // a new list, same strings"],del:["this.accessories = src.accessories;   // same list!"],hide:["reg","car","pc","sh","ev","m1","r1","i1","e1","h0","h1"],on:["pa"],lines:["m0"],meter:["things the copy shares with the original",1,2],note:"list fixed, history still shared"},
 {t:"3. Copy the nested object too: a deep copy",d:`<code>ServiceHistory</code> is an object that holds its own list. Copying only the reference to it still shares it. Give <code>ServiceHistory</code> its own <code>copy()</code> and call it: <code>src.history.copy()</code>. When every object the car owns is copied like this, we have a <b>deep copy</b>: the copy and the original share nothing that can change.`,
  code:`PetrolCar(PetrolCar src) {
    this.accessories.addAll(src.accessories);
    this.history = src.history;           // same history!
    this.history = src.history.copy();        // a new history
}`,add:["this.history = src.history.copy();        // a new history"],del:["this.history = src.history;           // same history!"],hide:["reg","car","pc","ev","m1","r1","i1","e1"],good:["pa","sh"],lines:["m0","h0"],meter:["things the copy shares with the original",0,2],note:"deep copy: shares nothing"},
 {t:"4. Declare copy() on the Car interface",d:`The caller holds a <code>Car</code>, not a <code>PetrolCar</code>. Add <code>Car copy()</code> to the interface. Each class implements it by calling its own copy constructor, so the correct class is made without the caller knowing it. <code>EvCar</code> overrides <code>copy()</code> and returns an <code>EvCar</code>. The <code>instanceof</code> chain is gone, and a new car class only has to write its own <code>copy()</code>.`,
  code:`interface Car { Car copy(); ... }

class PetrolCar implements Car {
    public Car copy() { return new PetrolCar(this); }
}
class EvCar extends PetrolCar {
    @Override public Car copy() { return new EvCar(this); }
}`,add:["interface Car { Car copy(); ... }","public Car copy() { return new PetrolCar(this); }","@Override public Car copy() { return new EvCar(this); }"],hide:["reg","pa","m0","m1","r1","h0"],good:["car","pc","ev"],lines:["i1","e1","h1"],meter:["classes the caller must name to copy a car",0,2],note:"each class copies itself"},
 {t:"5. Keep ready-made templates in a prototype registry",d:`A <b>prototype registry</b> is a <code>Map</code> of preconfigured example cars under a key, like <code>"nexon-demo"</code>. <code>create(key)</code> finds the template and returns a <b>copy</b> of it. It never hands out the template itself, or someone could change the master example. The set-up now runs <b>once</b>, when the template is registered.`,
  code:`class CarRegistry {
    private final Map<String, Car> templates = new LinkedHashMap<>();
    void register(String key, Car template) { templates.put(key, template); }
    Car create(String key) {
        return templates.get(key).copy();     // copy, never the template
    }
}`,add:["class CarRegistry {","Car create(String key) {","return templates.get(key).copy();     // copy, never the template"],hide:["pa","m0","h0","m1"],good:["reg"],on:["car","pc","ev","sh"],lines:["r1","i1","e1","h1"],meter:["places that repeat the set-up",1,3],note:"set-up written once"},
 {t:"6. Clients ask the registry, then tweak the copy",d:`The client never writes <code>new</code> and never names a class. It asks for a template by key and changes only what differs for this order: a colour, one more accessory. <b>When to copy:</b> when the set-up is long or expensive, and most of it is the same each time.`,
  code:`registry.register("nexon-demo", nexonDemo());   // once
Car order = registry.create("nexon-demo");        // a copy
order.setColour("Red");                          // tweak the copy only`,marks:["registry.create"],hide:["pa","m0","h0"],good:["reg","car","pc","ev"],on:["mn"],lines:["m1","r1","i1","e1","h1"],meter:["places that repeat the set-up",1,3],note:"copy, then tweak"}]}]},

/* ---------- §3 Runtime lab: shallow copy vs deep copy ---------- */
prorun:{pill:"RUNTIME LAB · SHALLOW COPY VS DEEP COPY",views:[{name:"Runtime",alt:"Sequence diagram: main creates a PetrolCar called original, which makes an accessories list holding Sunroof. main calls shallowCopy, which creates a second PetrolCar that points at the same accessories list. Adding Roof rails to the shallow copy changes the shared list, so original.describe shows Roof rails too. Then main calls copy, which creates a third PetrolCar with its own new list. Adding Tow bar to it leaves the original unchanged",
 seq:{lanes:[["main","main()","the test"],["orig","original","PetrolCar"],["lst","accessories","the ArrayList"],["shw","shallow","PetrolCar"],["dpc","deep","PetrolCar"]],
  msgs:[["main","orig","new PetrolCar(...)","new"],["orig","lst","new ArrayList()","new"],["main","orig","addAccessory(\"Sunroof\")"],["orig","lst","add(\"Sunroof\")"],
   ["main","orig","shallowCopy()"],["orig","shw","new PetrolCar(same fields)","new"],["shw","lst","holds the SAME list"],
   ["main","shw","addAccessory(\"Roof rails\")"],["shw","lst","add(\"Roof rails\")"],
   ["main","orig","describe()"],["orig","main","[Sunroof, Roof rails]","ret"],
   ["main","orig","copy()"],["orig","dpc","new PetrolCar(new list)","new"],
   ["main","dpc","addAccessory(\"Tow bar\")"],
   ["main","orig","describe()"],["orig","main","[Sunroof, Roof rails]","ret"]]},
 code:`PetrolCar original = new PetrolCar("Nexon", "XZ+", "Blue");
original.addAccessory("Sunroof");

PetrolCar shallow = original.shallowCopy();
shallow.addAccessory("Roof rails");
println(original.describe());   // [Sunroof, Roof rails]  <- bug

PetrolCar deep = original.copy();
deep.addAccessory("Tow bar");
println(original.describe());   // no Tow bar: unchanged

PetrolCar shallowCopy() { return new PetrolCar(model, trim, colour, accessories, history); }
PetrolCar copy() { return new PetrolCar(model, trim, colour, new ArrayList<>(accessories), history.copy()); }`,
 steps:[
 {t:"The original is built",d:`A column is an object; time runs downwards; a solid arrow is a call; a dashed arrow is a return. <code>main</code> builds the <code>original</code> car. Its constructor makes an <code>ArrayList</code> (the third column) for the accessories, and <code>addAccessory("Sunroof")</code> puts one string in it.`,upto:4,cur:3,marks:["new PetrolCar(\"Nexon\"","original.addAccessory(\"Sunroof\");"]},
 {t:"shallowCopy(): a new car, the SAME list",d:`<code>shallowCopy()</code> builds a second <code>PetrolCar</code> but hands it the <b>reference</b> to the original's list, not a new list. The arrow from <code>shallow</code> goes to the same <code>accessories</code> column. Two cars, one list.`,upto:7,cur:6,marks:["PetrolCar shallow = original.shallowCopy();","PetrolCar shallowCopy()"]},
 {t:"Adding to the shallow copy",d:`<code>shallow.addAccessory("Roof rails")</code> adds to the list. It is the list the original also uses. The copy was supposed to be a separate car.`,upto:9,cur:8,marks:["shallow.addAccessory(\"Roof rails\");"]},
 {t:"The original changed: the bug",d:`<code>original.describe()</code> reads the shared list and returns <b>[Sunroof, Roof rails]</b>. Nobody touched the original, yet it has Roof rails now. The demo car on the showroom floor got an accessory meant for one customer's order. This is the shallow-copy bug.`,upto:11,cur:10,marks:["println(original.describe());   // [Sunroof, Roof rails]  <- bug"],note:"original changed!"},
 {t:"copy(): a deep copy builds its own list",d:`<code>copy()</code> makes the new car with <code>new ArrayList&lt;&gt;(accessories)</code>: a <b>new list</b> holding the same strings (strings are immutable, so sharing them is safe). It copies the service history the same way. The new car owns its list.`,upto:13,cur:12,marks:["PetrolCar deep = original.copy();","PetrolCar copy()"]},
 {t:"Adding to the deep copy",d:`<code>deep.addAccessory("Tow bar")</code> changes only the deep copy's own list.`,upto:14,cur:13,marks:["deep.addAccessory(\"Tow bar\");"]},
 {t:"The original is unchanged",d:`<code>original.describe()</code> still prints <b>[Sunroof, Roof rails]</b>, with no Tow bar. (The Roof rails came from the earlier shallow bug.) A deep copy kept the change inside the copy, which is what we wanted.`,upto:16,cur:15,marks:["println(original.describe());   // no Tow bar: unchanged"],note:"no Tow bar in the original"}]}]},

/* ---------- §5 Structure lab ---------- */
prouml:{pill:"STRUCTURE LAB · THE ROLES",views:[
 {name:"Roles",h:325,
 nodes:[["cl",4,130,100,"Client","wants a copy"],
  {id:"rg",x:115,y:8,w:185,name:"PrototypeRegistry",f:["- prototypes: Map"],m:["+ register(key, p)","+ create(key)"]},
  {id:"pr",x:335,y:8,w:255,name:"Prototype",st:"interface",m:["+ clone(): Prototype"]},
  {id:"c1",x:115,y:130,w:185,name:"ConcretePrototype1",f:["- state"],m:["+ clone(): Prototype"]},
  {id:"c2",x:335,y:130,w:255,name:"ConcretePrototype2",f:["- state","- nested object"],m:["+ clone(): Prototype"]}],
 edges:[["x1","cl","rg","calls",0,"","h"],["x2","rg","pr","has",0,"","h"],["x3","c1","pr","impl",0,"","h"],["x4","c2","pr","impl",0,"","v"]],
 steps:[
 {t:"Prototype: the copy contract",d:`The <b>Prototype</b> interface has one method that means "give me a copy of yourself". (Called <code>clone()</code> in textbooks; in Java we usually name it <code>copy()</code> to avoid the <code>Object.clone()</code> trouble.) The caller depends only on this type.`,cur:["pr"],dim:["cl","rg","c1","c2"],hide:["x1","x2","x3","x4"]},
 {t:"ConcretePrototype: knows how to copy itself",d:`Each concrete class implements the copy, usually with a copy constructor. <b>Only the class knows its own fields</b>, so only it can copy them correctly, including the nested objects (a deep copy).`,cur:["c1","c2"],dim:["cl","rg","pr"],hide:["x1","x2","x3","x4"]},
 {t:"Implements",d:`Both concrete classes implement the interface, so a client can treat them the same way, without knowing which one it has.`,on:["c1","c2","pr"],lines:["x3","x4"],hide:["x1","x2"],dim:["cl","rg"]},
 {t:"PrototypeRegistry (optional)",d:`The <b>registry</b> keeps ready-made example objects under a key and returns a <b>copy</b> on request. It is optional: the pattern works without it. It is what makes Prototype useful for "start from a standard setup".`,cur:["rg"],on:["pr"],lines:["x2"],hide:["x1","x3","x4"],dim:["cl","c1","c2"]},
 {t:"The client asks for a copy",d:`The <b>client</b> asks the registry for a copy by key and changes what differs. It never writes <code>new ConcretePrototype2()</code>, so it does not depend on the concrete classes.`,on:["cl","rg"],good:["pr"],lines:"all"}]},
 {name:"Dealership",h:325,
 nodes:[["mn",10,130,80,"main()","client"],
  {id:"reg",x:115,y:8,w:185,name:"CarRegistry",f:["- templates: Map"],m:["+ register(key, car)","+ create(key): Car"]},
  {id:"car",x:335,y:8,w:255,name:"Car",st:"interface",m:["+ copy(): Car","+ setColour(colour)","+ addAccessory(accessory)","+ describe(): String"]},
  {id:"pc",x:115,y:130,w:185,name:"PetrolCar",f:["- accessories: List","- extras: Map","- history: ServiceHistory"],m:["+ PetrolCar(src)","+ copy(): Car"]},
  {id:"sh",x:335,y:130,w:255,name:"ServiceHistory",f:["- entries: List"],m:["+ copy(): ServiceHistory","+ size(): int"]},
  {id:"ev",x:115,y:260,w:185,name:"EvCar",f:["- batteryKwh: int"],m:["+ copy(): Car"]}],
 edges:[["u1","mn","reg","calls",0,"","h"],["u2","reg","car","has",0,"","h"],["u3","pc","car","impl",0,"","h"],["u4","ev","pc","ext",0,"","v"],["u5","pc","sh","has",0,"","h"]],
 steps:[
 {t:"Car is the Prototype",d:`<code>Car</code> declares <code>copy()</code>. The booking code holds a <code>Car</code> and never needs to know what it really is.`,cur:["car"],dim:["mn","reg","pc","sh","ev"],hide:["u1","u2","u3","u4","u5"]},
 {t:"PetrolCar and EvCar copy themselves",d:`<code>PetrolCar</code> copies its accessories list, its <code>extras</code> map and its <code>ServiceHistory</code> in a copy constructor. <code>EvCar</code> extends it, adds <code>batteryKwh</code> and overrides <code>copy()</code> to return an <code>EvCar</code>.`,cur:["pc","ev"],on:["car"],lines:["u3","u4"],hide:["u1","u2","u5"],dim:["mn","reg","sh"]},
 {t:"ServiceHistory is copied as well",d:`A car owns a <code>ServiceHistory</code>. A deep copy gives the new car its own history, through <code>ServiceHistory.copy()</code>. This is the nested object that a shallow copy would share.`,cur:["sh"],on:["pc"],lines:["u5"],hide:["u1","u2","u3","u4"],dim:["mn","reg","car","ev"]},
 {t:"CarRegistry keeps the templates",d:`<code>CarRegistry</code> holds the ready-made cars ("nexon-demo", "tiago-ev-demo"). <code>create(key)</code> returns <code>template.copy()</code>.`,cur:["reg"],on:["car"],lines:["u2"],hide:["u1","u3","u4","u5"],dim:["mn","pc","sh","ev"]},
 {t:"main() asks for a copy",d:`<code>main()</code> calls <code>registry.create("nexon-demo")</code>, gets a <code>Car</code>, and tweaks it. One sentence: "<i>start from the showroom's example car, then change what this customer wants.</i>"`,on:["mn","reg"],good:["car"],lines:"all"}]}]}
});

/* ---------- §3 Playground: template, deep copy toggle, copy, add accessory (same lines as PrototypeShallow) ---------- */
DPL.play({proplay:{pill:"PLAYGROUND · COPY A TEMPLATE, THEN CHANGE THE COPY",
 init:()=>({tpl:"nexon",deep:false,last:null,orig:null,copy:null,added:0,runs:[]}),
 controls:[{id:"tpl",type:"select",label:"Template (registry key)",options:[["nexon","nexon-demo"],["punch","punch-demo"]]},
  {id:"deep",type:"toggle",label:"deep copy"},
  {id:"copy",type:"button",label:"copy"},
  {id:"add",type:"button",label:"add accessory to copy"},
  {id:"reset",type:"button",label:"Reset"}],
 act:(s,id)=>{
  const T={nexon:{m:"Nexon XZ+ Blue",acc:["Sunroof","Floor mats"]},punch:{m:"Punch Adventure Green",acc:["Roof rails"]}},EXTRA=["Tow bar","Mud flaps","Seat covers","Dash cam"];
  if(s.last!==s.tpl||!s.orig){s.last=s.tpl;s.orig={acc:T[s.tpl].acc.slice()};s.copy=null;s.added=0;s.runs=[];}
  const run={code:[],lines:[]};
  if(id==="reset"){s.orig={acc:T[s.tpl].acc.slice()};s.copy=null;s.added=0;s.runs=[];return;}
  if(id==="copy"){
   run.code.push("PetrolCar copy = original."+(s.deep?"copy":"shallowCopy")+"();");
   run.code.push('System.out.println("same list object? " + (original.accessories() == copy.accessories()));');
   s.copy={deep:s.deep,acc:s.deep?s.orig.acc.slice():s.orig.acc};s.added=0;
   run.lines.push("same list object? "+(!s.deep));}
  else if(id==="add"){
   const a=EXTRA[s.added%EXTRA.length];
   run.code.push('copy.addAccessory("'+a+'");');
   if(!s.copy){run.lines.push('Exception in thread "main" java.lang.NullPointerException: Cannot invoke "PetrolCar.addAccessory(String)" because "copy" is null');}
   else{s.added++;s.copy.acc.push(a);
    run.code.push('System.out.println("original: " + original.describe());','System.out.println("copy:     " + copy.describe());');
    run.lines.push("original: "+T[s.tpl].m+" | accessories=["+s.orig.acc.join(", ")+"] | services=1","copy:     "+T[s.tpl].m+" | accessories=["+s.copy.acc.join(", ")+"] | services=1");}}
  else return;
  s.runs.push(run);if(s.runs.length>3)s.runs.shift();},
 render:s=>{
  const T={nexon:{m:"Nexon XZ+ Blue",acc:["Sunroof","Floor mats"]},punch:{m:"Punch Adventure Green",acc:["Roof rails"]}};
  if(s.last!==s.tpl||!s.orig){s.last=s.tpl;s.orig={acc:T[s.tpl].acc.slice()};s.copy=null;s.added=0;s.runs=[];}
  const nodes=[],edges=[],on=[],good=[],bad=[];
  const shared=!!(s.copy&&s.copy.acc===s.orig.acc),sep=!!(s.copy&&!shared);
  nodes.push(["og",10,12,150,"original",T[s.tpl].m]);on.push("og");
  nodes.push(["ol",235,12,215,shared?"accessories list (shared)":"accessories list",s.orig.acc.join(", ")]);
  edges.push(["e1","og","ol","has",0,"","h"]);
  const lines=["e1"];
  if(s.copy){
   nodes.push(["cp",10,150,150,"copy",s.copy.deep?"deep copy":"shallow copy"]);on.push("cp");
   if(shared){edges.push(["e2","cp","ol","has",0,"","h"]);lines.push("e2");bad.push("ol");}
   else{nodes.push(["cl",235,150,215,"copy's own list",s.copy.acc.join(", ")]);edges.push(["e2","cp","cl","has",0,"","h"]);lines.push("e2");}}
  const v=!s.copy?["no copy yet","press copy"]:shared?["SHARED list","a change shows in both"]:["separate lists","safe to change"];
  nodes.push(["vd",470,82,120,v[0],v[1]]);
  if(shared)bad.push("vd");else if(sep)good.push("vd");
  const out=s.runs.reduce((a,r)=>a.concat(r.lines),[]),log=s.runs.reduce((a,r)=>a.concat(r.code),[]);
  return {h:225,alt:!s.copy?"No copy exists yet":shared?"The original and the copy share one accessories list":"The original and the copy have separate accessories lists",
   nodes:nodes,edges:edges,on:on,good:good,bad:bad,lines:lines,
   log:log.length?log:["// press copy to run the copy line"],out:out.length?"// output:\n"+out.join("\n"):"// output:"};
 }}});
