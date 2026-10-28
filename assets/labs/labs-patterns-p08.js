/* P08 labs (Abstract Factory): data only, drawn by the kit in labs-patterns.js (DPL.add / DPL.play). Hosts: #dp-abfpain (a market's parts chosen
   by if / else in three places, the EU car with an Indian plate), #dp-abfref (refactor: ladders → product interfaces → PartsFactory →
   India / EU factories → AssemblyLine takes one factory → new US family, add / del / meter), #dp-abfrun (sequence view of
   new AssemblyLine(new EuPartsFactory()).assemble()), #dpp-abfplay (playground: market, add the US factory, naive mode, assemble),
   #dp-abfuml (Roles / Dealership). Every class and method name comes from the P08 programs, all run on JDK 25
   (kb/patterns-08-abstract-factory.md). */
"use strict";

/* shared diagram parts (fresh arrays each call; names prefixed abf so they never clash with another page's script) */
const abfFactNodes=(withIfaces)=>{
  const f=["+ createEngine()","+ createHeadlights()","+ createPlate()"];
  const n=[{id:"cl",x:0,y:10,w:150,name:"AssemblyLine",m:["+ assemble()"]},
   {id:"pf",x:200,y:0,w:195,name:"PartsFactory",st:"interface",m:f.slice()},
   {id:"ip",x:0,y:130,w:190,name:"IndiaPartsFactory",m:f.slice()},
   {id:"ep",x:205,y:130,w:190,name:"EuPartsFactory",m:f.slice()},
   {id:"up",x:405,y:130,w:190,name:"UsPartsFactory",m:f.slice()},
   ["si",0,265,190,"India parts","Bs6, LeftBeam, IndianPlate"],
   ["se",205,265,190,"EU parts","Euro6, RightBeam, EuPlate"],
   ["su",398,265,200,"US parts","UsEngine, RightBeam, UsPlate"]];
  if(withIfaces)n.push({id:"en",x:0,y:350,w:190,name:"Engine",st:"interface",m:["+ name(): String","+ cost(): long"]},
   {id:"hl",x:205,y:350,w:190,name:"Headlights",st:"interface",m:["+ beam(): String"]},
   {id:"np",x:405,y:350,w:190,name:"NumberPlate",st:"interface",m:["+ show(): String"]});
  return n;
};
const abfFactEdges=()=>[["u0","cl","pf"],["i1","ip","pf","impl"],["i2","ep","pf","impl"],["i3","up","pf","impl"],
  ["c1","ip","si"],["c2","ep","se"],["c3","up","su"]];

const abfPainNodes=()=>[{id:"as",x:225,y:110,w:150,name:"Assembly",m:["+ build(market)"]},
  {id:"wk",x:225,y:0,w:150,name:"Workshop",m:["+ engine(market)","+ lights(market)"]},
  {id:"rg",x:225,y:215,w:150,name:"Registration",m:["+ plate(market)"]},
  ["be",0,0,105,"Bs6Engine","India"],["ee",495,0,105,"Euro6Engine","EU"],
  ["ll",0,75,105,"LeftBeam","India"],["rl",495,75,105,"RightBeam","EU"],
  ["ip",0,210,105,"IndianPlate","India"],["ep",495,210,105,"EuPlate","EU"]];
const abfPainEdges=()=>[["a1","as","wk"],["a2","as","rg"],["w1","wk","be"],["w2","wk","ee"],["w3","wk","ll"],["w4","wk","rl"],["r1","rg","ip"],["r2","rg","ep"]];

DPL.add({

/* ---------- §1 Pain lab: the market chooses each part in a different place ---------- */
abfpain:{pill:"PAIN LAB · EVERY PART CHOSEN BY AN IF / ELSE",views:[{name:"Pain",h:270,
 nodes:abfPainNodes(),
 edges:abfPainEdges(),
 steps:[
 {t:"Day 1: the dealership sells only in India",d:"Each box on the left is a <b>class</b> (the lines under its name are its methods); each box on the right is a part. An arrow means \"creates\" or \"calls\". A car needs three matching parts: an <b>engine</b>, <b>headlights</b> and a <b>number plate</b>. <code>Workshop</code> creates the engine and headlights, <code>Registration</code> creates the plate, and <code>Assembly</code> puts the car together. With one market there is no choice to make: three <code>new</code>, three arrows.",
  code:`class Workshop {
    static Engine engine(String market) { return new Bs6Engine(); }
    static Headlights lights(String market) { return new LeftBeam(); }
}
class Registration {
    static NumberPlate plate(String market) { return new IndianPlate(); }
}`,marks:["new Bs6Engine()","new LeftBeam()","new IndianPlate()"],hide:["ee","rl","ep","w2","w4","r2"],lines:["a1","a2","w1","w3","r1"],meter:["places that pick a part by market",0,3],note:"1 market, no if / else"},
 {t:"Request 1: the dealership starts selling in the EU",d:"The EU needs a <b>Euro 6</b> engine (a different emissions rule) and headlights with a <b>right-hand traffic</b> beam pattern (India drives on the left, the EU on the right). The quick fix is an <b>if / else on the market text</b> in each place that creates an engine or headlights. Two ladders now.",
  code:`class Workshop {
    static Engine engine(String market) {
        if (market.equals("IN")) return new Bs6Engine();
        else return new Euro6Engine();
    }
    static Headlights lights(String market) {
        if (market.equals("IN")) return new LeftBeam();
        else return new RightBeam();
    }
}`,add:["if (market.equals(\"IN\")) return new Bs6Engine();","else return new Euro6Engine();","if (market.equals(\"IN\")) return new LeftBeam();","else return new RightBeam();"],hide:["ep","r2"],on:["ee","rl"],lines:["a1","w1","w2","w3","w4"],meter:["places that pick a part by market",2,3],note:"2 ladders in Workshop"},
 {t:"Request 2: the plate needs the same ladder, written later",d:"Registration must now issue an EU plate too, so someone adds a third ladder. It was written by a different person, on a different day, and nothing forces it to agree with the other two. Look at the first line: the market text is <code>\"EUR\"</code>, not <code>\"EU\"</code>. Java compiles it happily, because both are just strings.",
  code:`class Registration {
    static NumberPlate plate(String market) {
        if (market.equals("EUR")) return new EuPlate();   // typo: never matches "EU"
        else return new IndianPlate();
    }
}`,add:["if (market.equals(\"EUR\")) return new EuPlate();","else return new IndianPlate();"],hide:[],on:["ep"],bad:["rg"],lines:["a2","r1","r2"],meter:["places that pick a part by market",3,3],note:"3 ladders, written separately"},
 {t:"The bug: an EU car with an Indian plate",d:"Build an EU car. <code>engine(\"EU\")</code> and <code>lights(\"EU\")</code> fall into the right branches, but <code>plate(\"EU\")</code> never matches <code>\"EUR\"</code>, so the <code>else</code> branch hands out an <code>IndianPlate</code>. The car leaves with a <b>mismatched family</b>: EU engine, EU headlights, Indian plate. No exception, no compile error; it is found at registration, or by a customer.",
  code:`Assembly.build("EU");
// Market EU: Euro 6 engine | right-hand traffic beam | KA 01 AB 1234
//                                                        ^ an Indian plate on an EU car`,marks:["KA 01 AB 1234"],hide:[],bad:["ip","rg"],good:["ee","rl"],lines:["a1","a2","w2","w4","r1"],meter:["places that pick a part by market",3,3],note:"EU engine + EU lights + Indian plate"},
 {t:"Request 3: the dealership opens in the US",d:"A third market means a third branch in <b>every</b> ladder: <code>else if (market.equals(\"US\"))</code> in <code>engine</code>, again in <code>lights</code>, again in <code>plate</code>. Three edits to code that already works, and the same typo is possible three more times. (The US parts are not drawn to keep the picture readable.) Run the old code with <code>\"US\"</code> today and every part silently falls into an <code>else</code>: a Euro 6 engine and an Indian plate.",
  code:`// Workshop.engine, Workshop.lights and Registration.plate each need:
else if (market.equals("US")) return new UsEngine();   // and the same for lights, plate`,add:["market.equals(\"US\")"],hide:[],bad:["wk","rg"],lines:["w1","w2","w3","w4","r1","r2"],meter:["places to edit for a new market",3,3],note:"1 new market = 3 edits"},
 {t:"What we want",d:"Nobody should pick a part one by one. The <b>market should pick the whole set at once</b>: one object that knows \"for India: BS6 engine, left beam, Indian plate\" and can only hand out parts that belong together. The assembly line then asks that one object for every part, and a mismatched car becomes impossible to build. Section 02 builds this in small steps.",
  hide:[],good:["as"],lines:"all",meter:["places that pick a part by market",3,3],note:"one object, one matching set"}]}]},

/* ---------- §2 Refactor lab: ladders → interfaces → PartsFactory → concrete factories → one factory injected ---------- */
abfref:{pill:"REFACTOR LAB · LADDERS → ABSTRACT FACTORY",views:[{name:"Refactor",h:435,
 nodes:abfFactNodes(true).concat([["lad",200,10,195,"if / else on market","3 places"]]),
 edges:abfFactEdges().concat([["m0","cl","lad"]]),
 steps:[
 {t:"Find what varies together",d:"Start from the painful code. Ask: <b>what changes when the market changes?</b> Not one part but <i>all three at once</i>: engine, headlights and plate each switch on the same market text. The parts of one market belong together; the ladders treat them as strangers. The set is what we must create as a unit.",
  code:`static Engine engine(String market) {
    if (market.equals("IN")) return new Bs6Engine();
    else return new Euro6Engine();
}
static Headlights lights(String market) { /* same ladder */ }
static NumberPlate plate(String market) { /* same ladder, typo and all */ }`,marks:["market.equals(\"IN\")"],hide:["pf","ip","ep","up","si","se","su","en","hl","np","u0","i1","i2","i3","c1","c2","c3"],bad:["lad"],lines:["m0"],meter:["if / else ladders on the market",3,3],note:"what varies: the whole set"},
 {t:"Give each kind of part an interface",d:"The assembly line only needs to <i>use</i> a part: ask the engine its name and cost, the headlights their beam, the plate its text. So each kind of part gets an <b>interface</b> (a list of methods with no code): <code>Engine</code>, <code>Headlights</code>, <code>NumberPlate</code>. These are the <b>AbstractProducts</b>. Every real part (<code>Bs6Engine</code>, <code>RightBeam</code>…) implements one of them.",
  code:`interface Engine { String name(); long cost(); }
interface Headlights { String beam(); }
interface NumberPlate { String show(); }

class Bs6Engine implements Engine { /* ... */ }
class IndianPlate implements NumberPlate { /* ... */ }`,add:["interface Engine","interface Headlights","interface NumberPlate"],hide:["lad","m0","cl","pf","ip","ep","up","si","se","su","u0","i1","i2","i3","c1","c2","c3"],good:["en","hl","np"],meter:["if / else ladders on the market",3,3],note:"AbstractProducts"},
 {t:"One interface that creates the whole set",d:"Now the key move. Write <b>one interface</b>, <code>PartsFactory</code> (the <b>AbstractFactory</b>), with <b>one create method per kind of part</b>. Whoever holds a <code>PartsFactory</code> can ask for an engine, headlights and a plate, and gets back only the interface types. Note that <b>each of these three methods is itself a <a href=\"04-factory-method.html\">Factory Method</a></b>: a method whose job is to create one product.",
  code:`interface PartsFactory {              // AbstractFactory
    Engine createEngine();            // a Factory Method
    Headlights createHeadlights();    // a Factory Method
    NumberPlate createPlate();        // a Factory Method
}`,add:["interface PartsFactory","Engine createEngine();","Headlights createHeadlights();","NumberPlate createPlate();"],hide:["lad","m0","cl","ip","ep","up","si","se","su","u0","i1","i2","i3","c1","c2","c3"],good:["pf"],on:["en","hl","np"],meter:["if / else ladders on the market",3,3],note:"PartsFactory: 3 factory methods"},
 {t:"A concrete factory for India",d:"<code>IndiaPartsFactory</code> <b>implements</b> <code>PartsFactory</code> (dashed arrow in the full picture, drawn here as a solid hollow-head arrow) and creates the India set: a <code>Bs6Engine</code>, a <code>LeftBeam</code> and an <code>IndianPlate</code>. All three <code>new</code> calls for India live in <b>one class</b>, written by one person at one time, so they cannot disagree.",
  code:`class IndiaPartsFactory implements PartsFactory {   // ConcreteFactory
    public Engine createEngine() { return new Bs6Engine(); }
    public Headlights createHeadlights() { return new LeftBeam(); }
    public NumberPlate createPlate() { return new IndianPlate(); }
}`,add:["class IndiaPartsFactory","new Bs6Engine()","new LeftBeam()","new IndianPlate()"],hide:["lad","m0","cl","ep","up","se","su","u0","i2","i3","c2","c3"],good:["ip","si"],on:["pf"],lines:["i1","c1"],meter:["if / else ladders on the market",3,3],note:"India set in one class"},
 {t:"A concrete factory for the EU",d:"<code>EuPartsFactory</code> is the same shape with the EU parts: <code>Euro6Engine</code>, <code>RightBeam</code>, <code>EuPlate</code>. The EU plate is now created <b>next to</b> the EU engine, so an EU car cannot get an Indian plate by a typo. There is no market text to mistype: the choice is which class you hold.",
  code:`class EuPartsFactory implements PartsFactory {      // ConcreteFactory
    public Engine createEngine() { return new Euro6Engine(); }
    public Headlights createHeadlights() { return new RightBeam(); }
    public NumberPlate createPlate() { return new EuPlate(); }
}`,add:["class EuPartsFactory","new Euro6Engine()","new RightBeam()","new EuPlate()"],hide:["lad","m0","cl","up","su","u0","i3","c3"],good:["ep","se"],on:["pf","ip","si"],lines:["i1","i2","c1","c2"],meter:["if / else ladders on the market",3,3],note:"EU set in one class"},
 {t:"The assembly line receives ONE factory",d:"The client, <code>AssemblyLine</code>, takes a <code>PartsFactory</code> in its <b>constructor</b> (this is called <b>constructor injection</b>: the object is handed in from outside) and asks it for all three parts. It never says <code>new Bs6Engine</code> and never reads a market text. Because every part comes from the same factory, the engine, headlights and plate always match. The three ladders are deleted.",
  code:`class AssemblyLine {
    private final PartsFactory parts;
    AssemblyLine(PartsFactory parts) { this.parts = parts; }
    void assemble() {
        Engine e = Workshop.engine(market);
        Headlights h = Workshop.lights(market);
        NumberPlate p = Registration.plate(market);
        Engine e = parts.createEngine();
        Headlights h = parts.createHeadlights();
        NumberPlate p = parts.createPlate();
    }
}`,add:["private final PartsFactory parts;","AssemblyLine(PartsFactory parts)","parts.createEngine()","parts.createHeadlights()","parts.createPlate()"],del:["Workshop.engine(market)","Workshop.lights(market)","Registration.plate(market)"],hide:["lad","m0","up","su","i3","c3"],good:["cl","pf"],on:["ip","ep","si","se"],lines:["u0"],meter:["if / else ladders on the market",0,3],note:"ladders: 3 → 0"},
 {t:"A new market is one new family",d:"The dealership opens in the US. Write the parts that differ (<code>UsEngine</code>, <code>UsPlate</code>) and <b>one new class</b>, <code>UsPartsFactory</code>; it reuses <code>RightBeam</code> because the US also drives on the right. Then <code>new AssemblyLine(new UsPartsFactory())</code>. <code>PartsFactory</code>, <code>AssemblyLine</code> and the other factories are not edited. Adding a new <i>family</i> is the easy direction; adding a new <i>kind of part</i> is the hard one (section 02, below).",
  code:`class UsPartsFactory implements PartsFactory {      // NEW: one class = one new family
    public Engine createEngine() { return new UsEngine(); }
    public Headlights createHeadlights() { return new RightBeam(); }
    public NumberPlate createPlate() { return new UsPlate(); }
}

new AssemblyLine(new UsPartsFactory()).assemble();`,add:["class UsPartsFactory","new UsEngine()","new UsPlate()","new AssemblyLine(new UsPartsFactory())"],hide:["lad","m0"],good:["up","su"],on:["cl","pf"],lines:["u0","i3","c3"],meter:["places to edit for a new market",0,3],note:"new market = 1 new factory, 0 edits"}]}]},

/* ---------- §3 Runtime lab: sequence of new AssemblyLine(new EuPartsFactory()).assemble() ---------- */
abfrun:{pill:"RUNTIME LAB · ONE FACTORY, THREE MATCHING PARTS",views:[{name:"Runtime",alt:"Sequence diagram: main creates an EuPartsFactory and an AssemblyLine holding it, then calls assemble; the line asks the factory for an engine, headlights and a plate, and the factory creates Euro6Engine, RightBeam and EuPlate; the line then asks each part for its text",
 seq:{lanes:[["main","main()","the client"],["ln","line","AssemblyLine"],["eu","euFactory","PartsFactory"],["en","engine","Euro6Engine"],["hl","lights","RightBeam"],["pl","plate","EuPlate"]],
  msgs:[["main","eu","new EuPartsFactory()","new"],["main","ln","new AssemblyLine(factory)","new"],["main","ln","assemble()"],
   ["ln","eu","createEngine()"],["eu","en","new Euro6Engine()","new"],
   ["ln","eu","createHeadlights()"],["eu","hl","new RightBeam()","new"],
   ["ln","eu","createPlate()"],["eu","pl","new EuPlate()","new"],
   ["ln","en","name(), cost()"],["en","ln","\"Euro 6 engine\", 150000","ret"],
   ["ln","hl","beam()"],["hl","ln","\"right-hand traffic beam\"","ret"],
   ["ln","pl","show()"],["pl","ln","\"[EU] B-MW 1234\"","ret"],["ln","main","assemble done","ret"]]},
 code:`PartsFactory eu = new EuPartsFactory();
AssemblyLine line = new AssemblyLine(eu);
line.assemble();

class AssemblyLine {
    private final PartsFactory parts;
    AssemblyLine(PartsFactory parts) { this.parts = parts; }
    void assemble() {
        Engine e = parts.createEngine();
        Headlights h = parts.createHeadlights();
        NumberPlate p = parts.createPlate();
        System.out.println("Engine: " + e.name() + " (Rs " + e.cost() + ")");
        System.out.println("Headlights: " + h.beam());
        System.out.println("Plate: " + p.show());
    }
}

class EuPartsFactory implements PartsFactory {
    public Engine createEngine() { return new Euro6Engine(); }
    public Headlights createHeadlights() { return new RightBeam(); }
    public NumberPlate createPlate() { return new EuPlate(); }
}`,
 steps:[
 {t:"main chooses the family, once",d:"The client builds <code>new EuPartsFactory()</code>. This is the <b>only line that names a family</b>; it never names an engine, a beam or a plate. In a real application this choice is made once at startup (configuration or Spring), not here.",upto:1,cur:0,marks:["new EuPartsFactory()"]},
 {t:"main hands the factory to the line",d:"<code>new AssemblyLine(eu)</code> stores the factory in a field. From now on the line can only get parts from that one factory: there is no other way to obtain an engine.",upto:2,cur:1,marks:["new AssemblyLine(eu)","AssemblyLine(PartsFactory parts)"]},
 {t:"main calls assemble()",d:"<code>assemble()</code> is written once, in <code>AssemblyLine</code>. It will behave the same for every family; only the object in the <code>parts</code> field differs.",upto:3,cur:2,marks:["line.assemble();","void assemble()"]},
 {t:"The line asks for an engine",d:"<code>parts.createEngine()</code> is a call on the <code>PartsFactory</code> interface. Java runs the version of the <i>actual</i> object, <code>EuPartsFactory.createEngine()</code>, which runs <code>new Euro6Engine()</code>. This is a <b>Factory Method</b>: one method creating one product, chosen by the object it is called on.",upto:5,cur:4,marks:["Engine e = parts.createEngine();","return new Euro6Engine()"]},
 {t:"Then headlights and a plate, from the same factory",d:"The line makes two more calls on the <i>same</i> factory object. Each create method builds one product: <code>RightBeam</code>, then <code>EuPlate</code>. All three come from <code>EuPartsFactory</code>, so all three are EU parts: <b>that is the consistency guarantee</b>.",upto:9,cur:8,marks:["Headlights h = parts.createHeadlights();","NumberPlate p = parts.createPlate();","return new RightBeam()","return new EuPlate()"]},
 {t:"The line uses the parts through their interfaces",d:"<code>assemble()</code> asks each part for its text: <code>e.name()</code>, <code>e.cost()</code>, <code>h.beam()</code>, <code>p.show()</code>. It prints <b>Engine: Euro 6 engine (Rs 150000)</b>, <b>Headlights: right-hand traffic beam</b> and <b>Plate: [EU] B-MW 1234</b>. The line never learns the class names behind the interfaces.",upto:15,cur:14,marks:["System.out.println(\"Engine: \"","System.out.println(\"Headlights: \"","System.out.println(\"Plate: \""],note:"Plate: [EU] B-MW 1234"},
 {t:"Swap the family, nothing else changes",d:"Replace the first line with <code>new IndiaPartsFactory()</code> and rerun: the same sequence happens, with <code>Bs6Engine</code>, <code>LeftBeam</code> and <code>IndianPlate</code>. <code>AssemblyLine</code> is untouched. The whole decision of <i>which market</i> sat in one constructor call.",upto:16,cur:15,marks:["PartsFactory eu = new EuPartsFactory();"]}]}]},

/* ---------- §5 Structure lab: generic roles, then the dealership names ---------- */
abfuml:{pill:"STRUCTURE LAB · THE ROLES",views:[
 {name:"Roles",h:380,
 nodes:[["cl",245,0,110,"Client","uses factory"],
  {id:"af",x:200,y:85,w:200,name:"AbstractFactory",st:"interface",m:["+ createProductA()","+ createProductB()"]},
  {id:"pa",x:0,y:85,w:155,name:"AbstractProductA",st:"interface",m:["+ operationA()"]},
  {id:"pb",x:445,y:85,w:155,name:"AbstractProductB",st:"interface",m:["+ operationB()"]},
  {id:"a1",x:0,y:205,w:74,name:"ProductA1",m:[]},{id:"a2",x:82,y:205,w:74,name:"ProductA2",m:[]},
  {id:"b1",x:445,y:205,w:74,name:"ProductB1",m:[]},{id:"b2",x:527,y:205,w:73,name:"ProductB2",m:[]},
  {id:"f1",x:100,y:305,w:150,name:"ConcreteFactory1",m:["+ createProductA()","+ createProductB()"]},
  {id:"f2",x:350,y:305,w:150,name:"ConcreteFactory2",m:["+ createProductA()","+ createProductB()"]}],
 edges:[["u0","cl","af"],["k1","af","pa"],["k2","af","pb"],["x1","f1","af","impl"],["x2","f2","af","impl"],
  ["i1","a1","pa","impl"],["i2","a2","pa","impl"],["i3","b1","pb","impl"],["i4","b2","pb","impl"],
  ["c1","f1","a1"],["c2","f1","b1"],["c3","f2","a2"],["c4","f2","b2"]],
 steps:[
 {t:"AbstractProducts: one interface per kind of part",d:"<b>AbstractProductA</b> and <b>AbstractProductB</b> are the interfaces of the <i>kinds</i> of things being created (in the dealership: engine, headlights, plate; two are drawn, a family may have any number). The client only ever holds these types.",cur:["pa","pb"],dim:["cl","af","a1","a2","b1","b2","f1","f2"],hide:["u0","k1","k2","x1","x2","i1","i2","i3","i4","c1","c2","c3","c4"]},
 {t:"ConcreteProducts: the real parts, grouped in families",d:"<b>ProductA1</b> and <b>ProductB1</b> belong to family 1; <b>ProductA2</b> and <b>ProductB2</b> to family 2 (India: Bs6Engine + LeftBeam + IndianPlate; EU: Euro6Engine + RightBeam + EuPlate). Each implements its abstract product. Parts of one family are meant to be used together.",on:["a1","a2","b1","b2"],good:["pa","pb"],lines:["i1","i2","i3","i4"],dim:["cl","af","f1","f2"],hide:["u0","k1","k2","x1","x2","c1","c2","c3","c4"]},
 {t:"AbstractFactory: one create method per kind of part",d:"<b>AbstractFactory</b> declares <code>createProductA()</code> and <code>createProductB()</code>, returning the abstract types. <b>Each create method is a <a href=\"04-factory-method.html\">Factory Method</a></b>; the Abstract Factory is a <i>group</i> of them that must be used together.",cur:["af"],on:["pa","pb"],lines:["k1","k2"],dim:["cl","a1","a2","b1","b2","f1","f2"],hide:["u0","x1","x2","i1","i2","i3","i4","c1","c2","c3","c4"]},
 {t:"ConcreteFactories: one per family",d:"<b>ConcreteFactory1</b> creates family 1 (ProductA1 and ProductB1); <b>ConcreteFactory2</b> creates family 2. Every <code>new</code> of a family lives in its factory, so the products it hands out always match. <b>A new family is a new ConcreteFactory plus its products</b>; nothing existing changes.",on:["f1","f2","a1","a2","b1","b2","af"],good:["f1","f2"],lines:["x1","x2","c1","c2","c3","c4"],dim:["cl","pa","pb"],hide:["u0","k1","k2","i1","i2","i3","i4"]},
 {t:"Client: gets one factory, uses interfaces only",d:"The <b>Client</b> receives a ConcreteFactory (typically by constructor injection) but knows it only as <b>AbstractFactory</b>. It asks that factory for every product and uses them through the abstract product types. It never names a ConcreteProduct, and it can never mix families.",cur:["cl"],on:["af","pa","pb"],lines:["u0","k1","k2"],dim:["a1","a2","b1","b2","f1","f2"],hide:["x1","x2","i1","i2","i3","i4","c1","c2","c3","c4"]},
 {t:"The whole pattern",d:"Client → AbstractFactory ← ConcreteFactories, each creating one family of ConcreteProducts that implement the AbstractProducts the client uses. Two directions of change: <b>new family = easy</b> (one class), <b>new product kind = hard</b> (the interface and every factory change).",lines:"all"}]},
 {name:"Dealership",h:435,
 nodes:abfFactNodes(true),
 edges:abfFactEdges(),
 steps:[
 {t:"AbstractProducts = Engine, Headlights, NumberPlate",d:"The three interfaces on the bottom row are the AbstractProducts. Each part set above is made of one concrete class per interface: India parts = <code>Bs6Engine</code>, <code>LeftBeam</code>, <code>IndianPlate</code>; EU parts = <code>Euro6Engine</code>, <code>RightBeam</code>, <code>EuPlate</code>; US parts = <code>UsEngine</code>, <code>RightBeam</code>, <code>UsPlate</code>.",cur:["en","hl","np"],on:["si","se","su"],dim:["cl","pf","ip","ep","up"],hide:["u0","i1","i2","i3","c1","c2","c3"]},
 {t:"ConcreteProducts = the part sets",d:"Each box in the third row stands for one family of ConcreteProducts. Parts of one set belong together: a BS6 engine goes with a left-beam headlight and an Indian plate. <code>RightBeam</code> appears in two sets: families may share a part.",cur:["si","se","su"],on:["en","hl","np"],dim:["cl","pf","ip","ep","up"],hide:["u0","i1","i2","i3","c1","c2","c3"]},
 {t:"AbstractFactory = PartsFactory",d:"<code>PartsFactory</code> has one create method per product: <code>createEngine()</code>, <code>createHeadlights()</code>, <code>createPlate()</code>. Each is a <a href=\"04-factory-method.html\">Factory Method</a>. Together they form the interface a market must provide.",cur:["pf"],on:["en","hl","np"],dim:["cl","ip","ep","up","si","se","su"],hide:["u0","i1","i2","i3","c1","c2","c3"]},
 {t:"ConcreteFactories = one per market",d:"<code>IndiaPartsFactory</code>, <code>EuPartsFactory</code> and <code>UsPartsFactory</code> each implement <code>PartsFactory</code> and create exactly one set (arrow down). Adding a market is adding a column here. Adding a <code>Battery</code> product, on the other hand, means a new create method in <code>PartsFactory</code> and in <b>all three</b> factories.",on:["ip","ep","up","si","se","su","pf"],good:["ip","ep","up"],lines:["i1","i2","i3","c1","c2","c3"],dim:["cl","en","hl","np"],hide:["u0"]},
 {t:"Client = AssemblyLine",d:"<code>AssemblyLine</code> takes a <code>PartsFactory</code> in its constructor and builds a car from it. It does not know India from the EU. <code>main()</code> (or Spring) picks the factory once.",cur:["cl"],on:["pf"],lines:["u0"],dim:["ip","ep","up","si","se","su","en","hl","np"],hide:["i1","i2","i3","c1","c2","c3"]},
 {t:"Read it in one sentence",d:"\"An AssemblyLine builds a car from whatever PartsFactory it is given; each factory makes one market's matching set of parts.\" Say that and you can draw Abstract Factory in an interview.",lines:"all"}]}]}
});

/* ---------- §3 Playground: market, add the US factory, naive mode; same lines as AbfBefore.java / AbstractFactory.java ---------- */
DPL.play({abfplay:{pill:"PLAYGROUND · ASSEMBLE A CAR FOR A MARKET",
 init:()=>({market:"india",us:false,naive:false,runs:[]}),
 controls:[{id:"market",type:"select",label:"Market",options:[["india","India"],["eu","EU"],["us","US"]]},
  {id:"us",type:"toggle",label:"Add the UsPartsFactory class"},
  {id:"naive",type:"toggle",label:"Naive mode (if / else on the market, no factory)"},
  {id:"go",type:"button",label:"Assemble car ▶"}],
 act:(s,id)=>{if(id!=="go")return;
  const F={india:["IndiaPartsFactory","IN","BS6 engine",120000,"left-hand traffic beam","KA 01 AB 1234"],
   eu:["EuPartsFactory","EU","Euro 6 engine",150000,"right-hand traffic beam","[EU] B-MW 1234"],
   us:["UsPartsFactory","US","EPA Tier 3 engine",140000,"right-hand traffic beam","CA 8ABC123"]};
  const f=F[s.market]||F.india;
  if(s.naive){
   const ind=s.market==="india";
   s.runs.push({code:"Assembly.build(\""+f[1]+"\");",lines:["Market "+f[1]+": "+(ind?"BS6 engine":"Euro 6 engine")+" | "+(ind?"left-hand traffic beam":"right-hand traffic beam")+" | KA 01 AB 1234"]});
  }else if(s.market==="us"&&!s.us){
   s.runs.push({code:"new AssemblyLine(new UsPartsFactory()).assemble();   // compile error: cannot find symbol  class UsPartsFactory",lines:[]});
  }else{
   s.runs.push({code:"new AssemblyLine(new "+f[0]+"()).assemble();",lines:["Engine: "+f[2]+" (Rs "+f[3]+")","Headlights: "+f[4],"Plate: "+f[5]]});
  }
  if(s.runs.length>3)s.runs.shift();},
 render:s=>{
  const log=s.runs.map(x=>x.code),out=s.runs.reduce((a,x)=>a.concat(x.lines),[]);
  const tail={log:log.length?log:["// press \"Assemble car\""],out:out.length?"// output:\n"+out.join("\n"):"// output:"};
  if(s.naive){
   const ind=s.market==="india",E=ind?"be":"ee",L=ind?"ll":"rl",we=ind?"w1":"w2",wl=ind?"w3":"w4";
   return Object.assign({h:270,alt:ind?"Naive mode, India: Workshop picks BS6 engine and left beam, Registration picks the Indian plate; all three match by luck":"Naive mode, "+s.market.toUpperCase()+": Workshop picks Euro 6 engine and right beam, but Registration never matches the market text and hands out the Indian plate: a mismatched car",
   nodes:abfPainNodes(),
 edges:abfPainEdges(),
   on:["as","wk","rg"],good:[E,L,"ip"].filter(x=>x!=="ip"||ind),bad:ind?[]:["ip","rg"],
   dim:["be","ee","ll","rl","ip","ep"].filter(x=>x!==E&&x!==L&&x!=="ip"),lines:["a1","a2",we,wl,"r1"]},tail);
  }
  const P={india:["ip","si","i1","c1"],eu:["ep","se","i2","c2"],us:["up","su","i3","c3"]};
  const c=P[s.market]||P.india,live=s.market!=="us"||s.us;
  const hide=s.us?[]:["up","su","i3","c3"];
  const all=["ip","ep","up","si","se","su"].filter(i=>!hide.includes(i));
  return Object.assign({h:340,alt:live?"AssemblyLine holds "+(s.market==="india"?"IndiaPartsFactory":s.market==="eu"?"EuPartsFactory":"UsPartsFactory")+" and gets the three matching parts of that market":"UsPartsFactory does not exist yet: switch on the toggle to add the class",
   nodes:abfFactNodes(false).filter(n=>Array.isArray(n)||!hide.includes(n.id)).map(n=>Array.isArray(n)&&hide.includes(n[0])?null:n).filter(Boolean),
   edges:abfFactEdges().filter(e=>!hide.includes(e[0])),
   on:live?["cl","pf",c[0],c[1]]:["cl","pf"],good:live?[c[1]]:[],dim:live?all.filter(i=>i!==c[0]&&i!==c[1]):all,lines:live?["u0",c[2],c[3]]:["u0"]},tail);
 }}});
