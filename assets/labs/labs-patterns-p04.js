/* P04 labs (Factory Method): data only, drawn by the kit in labs-patterns.js (DPL.add / DPL.play). Hosts: #dp-facpain (new PetrolCar /
   DieselCar / EvCar scattered over checkout, test-drive booking and reports), #dp-facref (refactor: scattered new → Simple Factory →
   Factory Method, add / del / meter), #dp-facrun (sequence view of new EvShowroom().sellCar()), #dpp-facplay (playground: pick the
   showroom, add the CNG subclass, sell a car), #dp-facuml (Roles / Dealership). Every class and method name comes from the P04
   programs, all run on JDK 25 (kb/patterns-04-factory-method.md). */
"use strict";
DPL.add({

/* ---------- §1 Pain lab: new scattered over three places ---------- */
facpain:{pill:"PAIN LAB · NEW IS EVERYWHERE",views:[{name:"Pain",h:235,
 nodes:[{id:"co",x:10,y:10,w:170,name:"Checkout",m:["+ sell(fuel)"]},
  {id:"td",x:215,y:10,w:170,name:"TestDrive",m:["+ book(fuel)"]},
  {id:"rp",x:420,y:10,w:170,name:"Reports",m:["+ line(fuel)"]},
  ["pc",5,175,140,"PetrolCar","new PetrolCar()"],["dc",155,175,140,"DieselCar","new DieselCar()"],
  ["ec",305,175,140,"EvCar","new EvCar()"],["gc",455,175,140,"CngCar","new CngCar()"]],
 edges:[["a0","co","pc"],["a1","co","dc"],["a2","co","ec"],["a3","co","gc"],
  ["b0","td","pc"],["b1","td","dc"],["b2","td","ec"],["b3","td","gc"],
  ["c0","rp","pc"],["c1","rp","dc"],["c2","rp","ec"],["c3","rp","gc"]],
 steps:[
 {t:"Day 1: Checkout makes the car it sells",d:"Each box on the left is a <b>class</b> (the lines under its name are its methods); each box on the right is a car class. An arrow means \"creates\". <code>Checkout.sell</code> must make a car, so it uses <code>new</code> (the keyword that builds an object) and an <b>if / else</b> on the fuel text to choose the class. That is fine for now: one place, three arrows.",
  code:`class Checkout {
    static void sell(String fuel) {
        Car car;
        if (fuel.equals("petrol")) car = new PetrolCar();
        else if (fuel.equals("diesel")) car = new DieselCar();
        else car = new EvCar();
        System.out.println("Sold " + car.describe() + ": Rs " + car.price());
    }
}`,marks:["new PetrolCar()","new DieselCar()","new EvCar()"],hide:["td","rp","gc","b0","b1","b2","b3","c0","c1","c2","c3","a3"],lines:["a0","a1","a2"],meter:["places that choose a car class",1,3],note:"1 place knows the three car classes"},
 {t:"Request 1: test-drive booking needs a car too",d:"The booking desk must create the car it will show. The quickest fix is to <b>copy</b> the same if / else. Now two classes know all the car classes, and the two ladders must stay in step by hand.",
  code:`class TestDrive {
    static void book(String fuel) {
        Car car;
        if (fuel.equals("petrol")) car = new PetrolCar();
        else if (fuel.equals("diesel")) car = new DieselCar();
        else car = new EvCar();
        System.out.println("Test drive booked: " + car.describe());
    }
}`,add:["class TestDrive","static void book","Car car;","fuel.equals(\"petrol\")","fuel.equals(\"diesel\")","else car = new EvCar();"],hide:["rp","gc","c0","c1","c2","c3","a3","b3"],on:["td"],lines:["b0","b1","b2"],meter:["places that choose a car class",2,3],note:"2 copies of the ladder"},
 {t:"Request 2: reports copy it again, slightly differently",d:"The reports class needs the car's details. Whoever wrote it copied the ladder but handled the last case in a different way (an unknown fuel gives <code>null</code> instead of an electric car). Three copies, and they already disagree.",
  code:`class Reports {
    static void line(String fuel) {
        Car car = null;
        if (fuel.equals("petrol")) car = new PetrolCar();
        else if (fuel.equals("diesel")) car = new DieselCar();
        else if (fuel.equals("ev")) car = new EvCar();
        if (car == null) System.out.println("Report: unknown fuel (no car created)");
        else System.out.println("Report: " + car.describe() + " | Rs " + car.price());
    }
}`,add:["class Reports","Car car = null;","fuel.equals(\"ev\")","if (car == null)"],hide:["gc","a3","b3","c3"],on:["rp"],bad:["rp"],lines:["c0","c1","c2"],meter:["places that choose a car class",3,3],note:"3 copies, 2 different rules"},
 {t:"Request 3: the dealership starts selling CNG cars",d:"A new class <code>CngCar</code> appears (bottom right). Every place that chooses a class must now learn about it: three ladders, three edits to code that already works, and every one must be tested again. This is the cost of <code>new</code> scattered around.",
  code:`// Checkout.sell, TestDrive.book and Reports.line each need:
else if (fuel.equals("cng")) car = new CngCar();`,add:["fuel.equals(\"cng\")"],hide:[],bad:["co","td","rp"],on:["gc"],lines:["a3","b3","c3"],meter:["places to edit for the new fuel",3,3],note:"1 new fuel = 3 edits"},
 {t:"One place is forgotten",d:"Someone edits <code>Checkout</code> and <code>Reports</code> but forgets <code>TestDrive</code>. Its <code>else</code> branch still creates an <code>EvCar</code>, so a customer who asks for a CNG test drive is booked in an electric car. No compile error, no exception: the compiler cannot tell you which <code>new</code> you forgot.",
  code:`// TestDrive.book("cng") still runs the old ladder:
else car = new EvCar();          // CNG customer gets an EV!`,marks:["new EvCar()"],hide:["a1","a2","b3","b1","c1","c2"],bad:["td","ec"],lines:["a3","b2","c3"],meter:["places to edit for the new fuel",3,3],note:"TestDrive: cng → EvCar (silent bug)"},
 {t:"What we want",d:"Callers like <code>Checkout</code> should say \"I need a car\" and never name <code>PetrolCar</code> or <code>EvCar</code>. Something else decides which class to build, in <b>one</b> place per kind of showroom. Section 02 builds that in small steps: first the quick fix (a Simple Factory), then the real <b>Factory Method</b>.",
  hide:[],bad:["co","td","rp"],lines:"all",meter:["places to edit for the new fuel",3,3],note:"scattered new = shotgun edits"}]}]},

/* ---------- §2 Refactor lab: scattered new → Simple Factory → Factory Method ---------- */
facref:{pill:"REFACTOR LAB · NEW → FACTORY METHOD",views:[{name:"Refactor",h:270,
 nodes:[["main",10,15,110,"main()","the client"],
  ["lad",130,10,170,"if / else on fuel","3 places"],
  {id:"cf",x:130,y:10,w:170,name:"CarFactory",m:["+ create(fuel): Car"]},
  {id:"sr",x:130,y:10,w:170,name:"Showroom",st:"abstract",m:["+ createCar(): Car","+ sellCar()"]},
  {id:"ci",x:5,y:110,w:105,name:"CityShowroom",m:["+ createCar()"]},
  {id:"ev",x:115,y:110,w:105,name:"EvShowroom",m:["+ createCar()"]},
  {id:"cn",x:225,y:110,w:105,name:"CngShowroom",m:["+ createCar()"]},
  {id:"car",x:430,y:10,w:160,name:"Car",st:"interface",m:["+ describe(): String","+ price(): long"]},
  {id:"pc",x:345,y:215,w:78,name:"PetrolCar",m:["+ price()"]},
  {id:"pe",x:431,y:215,w:78,name:"EvCar",m:["+ price()"]},
  {id:"pg",x:517,y:215,w:78,name:"CngCar",m:["+ price()"]}],
 edges:[["m0","main","lad"],["f0","main","cf"],["f1","cf","pc"],["f2","cf","pe"],["u0","main","sr"],["h1","sr","car"],
  ["e1","ci","sr","ext"],["e2","ev","sr","ext"],["e3","cn","sr","ext"],
  ["n1","ci","pc"],["n2","ev","pe"],["n3","cn","pg"],["i1","pc","car","impl"],["i2","pe","car","impl"],["i3","pg","car","impl"]],
 steps:[
 {t:"Find what varies",d:"Start from the painful code. Ask: <b>what changes every time a new fuel arrives?</b> Only <i>which class gets created</i>: the <code>new PetrolCar()</code> / <code>new EvCar()</code> lines inside three ladders. What the callers do with the car (print, price, book) never changes. The part that varies is what we move.",
  code:`class Checkout {
    static void sell(String fuel) {
        Car car;
        if (fuel.equals("petrol")) car = new PetrolCar();
        else if (fuel.equals("diesel")) car = new DieselCar();
        else car = new EvCar();
        System.out.println("Sold " + car.describe());
    }
}
// TestDrive.book and Reports.line repeat the same ladder`,marks:["new PetrolCar()","new DieselCar()","new EvCar()"],hide:["cf","sr","ci","ev","cn","car","pc","pe","pg","f0","f1","f2","u0","h1","e1","e2","e3","n1","n2","n3","i1","i2","i3"],bad:["lad"],lines:["m0"],meter:["if / else ladders on the fuel",3,3],note:"what varies: the class to create"},
 {t:"Callers only need the Car interface",d:"Look at what the callers do: only <code>car.describe()</code> and <code>car.price()</code>. They need <i>a Car</i>, not a <i>PetrolCar</i>. The dashed arrows mean \"implements\": every car class is a <code>Car</code>. This is the <b>Product</b> role: the type the callers hold. (<code>DieselCar</code> looks like <code>PetrolCar</code> and is left out of the diagram.)",
  code:`interface Car {                       // the Product: all the callers ever need
    String describe();
    long price();
}

class PetrolCar implements Car { /* ... */ }   // ConcreteProduct
class EvCar implements Car { /* ... */ }       // ConcreteProduct`,marks:["interface Car","implements Car"],hide:["cf","sr","ci","ev","cn","pg","f0","f1","f2","u0","h1","e1","e2","e3","n1","n2","n3","i3"],good:["car"],lines:["i1","i2"],meter:["if / else ladders on the fuel",3,3],note:"Product = Car"},
 {t:"Quick fix: a Simple Factory",d:"Move the ladder into <b>one</b> static method, <code>CarFactory.create(fuel)</code>. The three callers now just call it. Ladders drop from three to one. This is a good, common step, but it is <b>not</b> a GoF pattern: it is one class that knows every car class, and a static method cannot be overridden or swapped in a test.",
  code:`class CarFactory {                       // NOT a GoF pattern: a stepping stone
    static Car create(String fuel) {
        return switch (fuel) {
            case "petrol" -> new PetrolCar();
            case "ev" -> new EvCar();
            default -> throw new IllegalArgumentException("unknown fuel: " + fuel);
        };
    }
}

class Checkout {
    static void sell(String fuel) {
        Car car = CarFactory.create(fuel);   // no "new PetrolCar" here any more
        System.out.println("Sold " + car.describe());
    }
}`,add:["class CarFactory","static Car create","return switch","case \"petrol\"","case \"ev\"","default ->","Car car = CarFactory.create(fuel);"],hide:["lad","m0","sr","ci","ev","cn","pg","u0","h1","e1","e2","e3","n1","n2","n3","i3"],good:["cf"],lines:["f0","f1","f2"],meter:["if / else ladders on the fuel",1,3],note:"Simple Factory: 3 ladders → 1 switch"},
 {t:"Make \"who creates\" a method that subclasses override",d:"Now the real pattern. Instead of one factory that knows every class, write an <b>abstract class</b> <code>Showroom</code> (the <b>Creator</b>) with an <b>abstract method</b> <code>createCar()</code>: a method with no body, which every subclass must fill in. That method is the <b>factory method</b>. The old factory is gone from the diagram: its job is about to be split among subclasses.",
  code:`abstract class Showroom {            // Creator
    abstract Car createCar();        // the factory method: no body here
}`,add:["abstract class Showroom","abstract Car createCar();"],hide:["lad","cf","main","m0","f0","f1","f2","u0","ci","ev","cn","pg","e1","e2","e3","n1","n2","n3","i3"],good:["sr"],lines:["h1"],meter:["if / else ladders on the fuel",1,3],note:"Creator + factory method"},
 {t:"Put the business method in the creator",d:"The showroom does real work: it sells a car. <code>sellCar()</code> lives in the <b>base class</b> and calls <code>createCar()</code> to get its car. It never says <code>new PetrolCar</code>: it only knows the <code>Car</code> interface. The steps around the creation are fixed here; only the creation varies (this is the <a href=\"02-template-method.html\">Template Method</a> shape).",
  code:`abstract class Showroom {
    abstract Car createCar();

    void sellCar() {                 // business method: the same for every showroom
        Car car = createCar();       // asks the factory method, never "new PetrolCar"
        System.out.println("Inspecting " + car.describe());
        System.out.println("Delivered " + car.describe() + ": Rs " + car.price());
    }
}`,add:["void sellCar()","Car car = createCar();","Inspecting","Delivered"],hide:["lad","cf","m0","f0","f1","f2","ci","ev","cn","pg","e1","e2","e3","n1","n2","n3","i3"],on:["main"],good:["sr"],lines:["u0","h1"],meter:["if / else ladders on the fuel",1,3],note:"sellCar() calls createCar()"},
 {t:"One subclass per kind of showroom",d:"<code>CityShowroom</code> and <code>EvShowroom</code> <b>extend</b> <code>Showroom</code> (solid arrow, hollow head) and <b>override</b> the factory method: each returns the product it wants. These are the <b>ConcreteCreators</b>. The grey arrows show which creator makes which product. There is no if / else on the fuel left anywhere.",
  code:`abstract class Showroom { /* as before */ }

class CityShowroom extends Showroom {      // ConcreteCreator
    Car createCar() { return new PetrolCar(); }
}

class EvShowroom extends Showroom {        // ConcreteCreator
    Car createCar() { return new EvCar(); }
}`,add:["class CityShowroom","return new PetrolCar()","class EvShowroom","return new EvCar()"],hide:["lad","cf","m0","f0","f1","f2","cn","pg","e3","n3","i3"],good:["ci","ev"],lines:["e1","e2","n1","n2"],meter:["if / else ladders on the fuel",0,3],note:"each creator decides one product"},
 {t:"A new fuel is a new subclass",d:"The dealership adds CNG. Write <code>CngCar</code> and <code>CngShowroom</code>; run <code>new CngShowroom().sellCar()</code>. <code>Showroom</code>, <code>CityShowroom</code> and the callers are not edited at all (Open / Closed). The forgotten-<code>new</code> bug from section 01 cannot happen: there is no ladder to forget.",
  code:`class CngCar implements Car {              // NEW
    public String describe() { return "Tiago CNG"; }
    public long price() { return 800000; }
}

class CngShowroom extends Showroom {       // NEW
    Car createCar() { return new CngCar(); }
}

new CngShowroom().sellCar();               // Inspecting Tiago CNG`,add:["class CngCar","\"Tiago CNG\"","class CngShowroom","new CngCar()","new CngShowroom().sellCar()"],hide:["lad","cf","m0","f0","f1","f2"],on:["main"],good:["cn","pg"],lines:["u0","e3","n3","i3"],meter:["places to edit for a new fuel",0,3],note:"new fuel = 2 new classes, 0 edits"}]}]},

/* ---------- §3 Runtime lab: sequence of new EvShowroom().sellCar() ---------- */
facrun:{pill:"RUNTIME LAB · WHO CREATES WHAT",views:[{name:"Runtime",alt:"Sequence diagram: main creates an EvShowroom and calls sellCar; sellCar calls the overridden createCar, which creates an EvCar; then sellCar asks the car for describe and price",
 seq:{lanes:[["main","main()","the client"],["sh","evShowroom","EvShowroom"],["ca","car","EvCar"]],
  msgs:[["main","sh","new EvShowroom()","new"],["main","sh","sellCar()"],["sh","sh","createCar()","self"],["sh","ca","new EvCar()","new"],
   ["sh","ca","describe()"],["ca","sh","\"Nexon EV\"","ret"],["sh","ca","describe()"],["ca","sh","\"Nexon EV\"","ret"],
   ["sh","ca","price()"],["ca","sh","1650000","ret"],["sh","main","sellCar done","ret"]]},
 code:`Showroom showroom = new EvShowroom();
showroom.sellCar();

abstract class Showroom {
    abstract Car createCar();
    void sellCar() {
        Car car = createCar();
        System.out.println("Inspecting " + car.describe());
        System.out.println("Delivered " + car.describe() + ": Rs " + car.price());
    }
}

class EvShowroom extends Showroom {
    Car createCar() { return new EvCar(); }
}`,
 steps:[
 {t:"main creates a showroom",d:"The client chooses <i>which kind</i> of showroom to build. This is the only place that names a creator class; it never names a car class. The object is an <code>EvShowroom</code>, held as a plain <code>Showroom</code>.",upto:1,cur:0,marks:["new EvShowroom()"]},
 {t:"main calls sellCar()",d:"<code>sellCar</code> is written once, in <code>Showroom</code>, and <code>EvShowroom</code> inherits it. The call runs that code with <code>this</code> being the <code>EvShowroom</code> object.",upto:2,cur:1,marks:["showroom.sellCar();","void sellCar()"]},
 {t:"sellCar asks the factory method",d:"The loop arrow is a call to the object itself. <code>createCar()</code> is abstract in <code>Showroom</code>, so Java's <b>dynamic dispatch</b> runs the version of the <i>actual</i> object: <code>EvShowroom.createCar()</code>. The line sits in the base class, but the decision is made by the subclass.",upto:3,cur:2,marks:["Car car = createCar();","Car createCar() { return new EvCar(); }"]},
 {t:"createCar builds the product",d:"<code>EvShowroom.createCar()</code> runs <code>new EvCar()</code> (the only <code>new</code> on this page's path) and returns it. Back in <code>sellCar</code> the variable has the type <code>Car</code>: the base class never learns the name <code>EvCar</code>.",upto:4,cur:3,marks:["return new EvCar()","Car car = createCar();"]},
 {t:"First line printed",d:"<code>sellCar</code> calls <code>car.describe()</code> through the <code>Car</code> interface; the <code>EvCar</code> returns \"Nexon EV\", and <code>println</code> prints <b>Inspecting Nexon EV</b>.",upto:6,cur:5,marks:["System.out.println(\"Inspecting \""],note:"Inspecting Nexon EV"},
 {t:"Second line printed",d:"The second line asks for <code>describe()</code> again and then <code>price()</code>: <b>Delivered Nexon EV: Rs 1650000</b>. Swap in a <code>CityShowroom</code> in the first line and every other line stays the same; only the object that answers <code>createCar()</code> changes.",upto:10,cur:9,marks:["System.out.println(\"Delivered \""],note:"Delivered Nexon EV: Rs 1650000"},
 {t:"sellCar returns",d:"The method ends and control returns to <code>main</code>. One creator object and one product object were involved; the whole <b>decision of what to build</b> lived in a one-line override.",upto:11,cur:10,marks:["void sellCar()"]}]}]},

/* ---------- §5 Structure lab: generic roles, then the dealership names ---------- */
facuml:{pill:"STRUCTURE LAB · THE ROLES",views:[
 {name:"Roles",h:250,
 nodes:[["cl",10,20,110,"Client","uses a Creator"],
  {id:"cr",x:160,y:10,w:190,name:"Creator",st:"abstract",m:["+ factoryMethod(): Product","+ someOperation()"]},
  {id:"pr",x:430,y:10,w:160,name:"Product",st:"interface",m:["+ operation()"]},
  {id:"cc",x:160,y:150,w:190,name:"ConcreteCreator",m:["+ factoryMethod(): Product"]},
  {id:"cp",x:430,y:150,w:160,name:"ConcreteProduct",m:["+ operation()"]}],
 edges:[["e1","cl","cr"],["e2","cc","cr","ext"],["e3","cr","pr"],["e4","cp","pr","impl"],["e5","cc","cp"]],
 steps:[
 {t:"Product: what gets created",d:"<b>Product</b> is the interface of the things being created. The Creator and the client only ever hold this type, never a concrete class.",cur:["pr"],hide:["e1","e2","e3","e4","e5"],dim:["cl","cr","cc","cp"]},
 {t:"ConcreteProduct: one real class",d:"A <b>ConcreteProduct</b> implements the Product interface. There is one per variant; the new variants are added here.",on:["cp"],good:["pr"],lines:["e4"],hide:["e1","e2","e3","e5"],dim:["cl","cr","cc"]},
 {t:"Creator: the factory method and the work around it",d:"<b>Creator</b> declares the <b>factory method</b> (abstract, or with a default body) and an operation that <i>uses</i> it. It returns and uses a <code>Product</code>, so it never names a concrete product.",cur:["cr"],on:["pr"],lines:["e3"],hide:["e1","e2","e4","e5"],dim:["cl","cc","cp"]},
 {t:"ConcreteCreator: overrides the factory method",d:"A <b>ConcreteCreator</b> extends the Creator and overrides the factory method to return one ConcreteProduct. This is the one line where <code>new</code> lives. Add another pair of classes for every new variant.",on:["cc","cp","cr"],good:["cc"],lines:["e2","e5"],hide:["e1","e3","e4"],dim:["cl","pr"]},
 {t:"Client: picks a creator",d:"The <b>Client</b> chooses which ConcreteCreator to use and calls its operation. It never says <code>new ConcreteProduct()</code>.",cur:["cl"],on:["cr"],lines:["e1"],hide:["e2","e3","e4","e5"],dim:["pr","cc","cp"]},
 {t:"The whole pattern",d:"Client → Creator ← ConcreteCreators, which create ConcreteProducts, which implement the Product the Creator uses. Two parallel hierarchies: creators and products.",lines:"all"}]},
 {name:"Dealership",h:270,
 nodes:[["cl",10,15,110,"main()","the client"],
  {id:"sr",x:130,y:10,w:170,name:"Showroom",st:"abstract",m:["+ createCar(): Car","+ sellCar()"]},
  {id:"car",x:430,y:10,w:160,name:"Car",st:"interface",m:["+ describe(): String","+ price(): long"]},
  {id:"ci",x:5,y:110,w:105,name:"CityShowroom",m:["+ createCar()"]},
  {id:"ev",x:115,y:110,w:105,name:"EvShowroom",m:["+ createCar()"]},
  {id:"cn",x:225,y:110,w:105,name:"CngShowroom",m:["+ createCar()"]},
  {id:"pc",x:345,y:215,w:78,name:"PetrolCar",m:["+ price()"]},
  {id:"pe",x:431,y:215,w:78,name:"EvCar",m:["+ price()"]},
  {id:"pg",x:517,y:215,w:78,name:"CngCar",m:["+ price()"]}],
 edges:[["u0","cl","sr"],["h1","sr","car"],["e1","ci","sr","ext"],["e2","ev","sr","ext"],["e3","cn","sr","ext"],
  ["n1","ci","pc"],["n2","ev","pe"],["n3","cn","pg"],["i1","pc","car","impl"],["i2","pe","car","impl"],["i3","pg","car","impl"]],
 steps:[
 {t:"Product = Car",d:"<code>Car</code> is the Product: <code>describe()</code> and <code>price()</code>. <code>PetrolCar</code>, <code>EvCar</code> and <code>CngCar</code> are the ConcreteProducts.",cur:["car"],on:["pc","pe","pg"],lines:["i1","i2","i3"],hide:["u0","h1","e1","e2","e3","n1","n2","n3"],dim:["cl","sr","ci","ev","cn"]},
 {t:"Creator = Showroom",d:"<code>Showroom</code> declares <code>abstract Car createCar()</code> (the factory method) and <code>sellCar()</code>, which calls it. It returns and uses a <code>Car</code> and never names a concrete car.",cur:["sr"],on:["car"],lines:["h1"],hide:["u0","e1","e2","e3","n1","n2","n3","i1","i2","i3"],dim:["cl","ci","ev","cn","pc","pe","pg"]},
 {t:"ConcreteCreators = one showroom per product",d:"<code>CityShowroom</code> creates a <code>PetrolCar</code>, <code>EvShowroom</code> an <code>EvCar</code>, <code>CngShowroom</code> a <code>CngCar</code>: each overrides <code>createCar()</code> with one <code>new</code>. A fourth fuel is a fourth pair of boxes.",on:["ci","ev","cn","pc","pe","pg"],good:["sr"],lines:["e1","e2","e3","n1","n2","n3"],hide:["u0","h1","i1","i2","i3"],dim:["cl","car"]},
 {t:"Client = main()",d:"<code>main</code> writes <code>new CityShowroom().sellCar()</code> (or lets a configuration or Spring pick the showroom). It never names a car class.",cur:["cl"],on:["sr"],lines:["u0"],hide:["h1","e1","e2","e3","n1","n2","n3","i1","i2","i3"],dim:["car","ci","ev","cn","pc","pe","pg"]},
 {t:"Read it in one sentence",d:"\"A Showroom sells a Car it asks a subclass to create; each showroom subclass builds one kind of car.\" Say that and you can draw Factory Method in an interview.",lines:"all"}]}]}
});

/* ---------- §3 Playground: pick the showroom, add CNG, sell; same lines as FactoryMethod.java ---------- */
DPL.play({facplay:{pill:"PLAYGROUND · WHICH SHOWROOM CREATES WHICH CAR",
 init:()=>({room:"city",cng:false,sales:[]}),
 controls:[{id:"room",type:"select",label:"Showroom",options:[["city","CityShowroom"],["ev","EvShowroom"],["cng","CngShowroom"]]},
  {id:"cng",type:"toggle",label:"Dealer adds the new CngShowroom class"},
  {id:"sell",type:"button",label:"Sell a car ▶"}],
 act:(s,id)=>{if(id!=="sell")return;
  const P={city:["CityShowroom","Nexon Petrol",1250000],ev:["EvShowroom","Nexon EV",1650000],cng:["CngShowroom","Tiago CNG",800000]};
  const r=P[s.room]||P.city,missing=s.room==="cng"&&!s.cng;
  s.sales.push(missing?{code:"new CngShowroom().sellCar();   // compile error: cannot find symbol  class CngShowroom",lines:[]}
   :{code:"new "+r[0]+"().sellCar();",lines:["Inspecting "+r[1],"Delivered "+r[1]+": Rs "+r[2]]});
  if(s.sales.length>4)s.sales.shift();},
 render:s=>{
  const P={city:["ci","n1","i1","pc","CityShowroom","PetrolCar"],ev:["ev","n2","i2","pe","EvShowroom","EvCar"],cng:["cn","n3","i3","pg","CngShowroom","CngCar"]};
  const c=P[s.room]||P.city,live=s.room!=="cng"||s.cng;
  const hide=s.cng?[]:["cn","pg","e3","n3","i3"];
  const all=["ci","ev","cn","pc","pe","pg"].filter(i=>!hide.includes(i));
  const log=s.sales.map(x=>x.code),out=s.sales.reduce((a,x)=>a.concat(x.lines),[]);
  return {h:270,alt:live?(c[4]+" creates a "+c[5]+" when sellCar() runs"):"CngShowroom does not exist yet: switch on the toggle to add the class",
   nodes:[["main",10,15,110,"main()","sellCar()"],
    {id:"sr",x:130,y:10,w:170,name:"Showroom",st:"abstract",m:["+ createCar(): Car","+ sellCar()"]},
    {id:"car",x:430,y:10,w:160,name:"Car",st:"interface",m:["+ describe(): String","+ price(): long"]},
    {id:"ci",x:5,y:110,w:105,name:"CityShowroom",m:["+ createCar()"]},
    {id:"ev",x:115,y:110,w:105,name:"EvShowroom",m:["+ createCar()"]},
    {id:"cn",x:225,y:110,w:105,name:"CngShowroom",m:["+ createCar()"]},
    {id:"pc",x:345,y:215,w:78,name:"PetrolCar",m:["+ price()"]},
    {id:"pe",x:431,y:215,w:78,name:"EvCar",m:["+ price()"]},
    {id:"pg",x:517,y:215,w:78,name:"CngCar",m:["+ price()"]}].filter(n=>Array.isArray(n)||!hide.includes(n.id)),
   edges:[["u0","main","sr"],["h1","sr","car"],["e1","ci","sr","ext"],["e2","ev","sr","ext"],["e3","cn","sr","ext"],
    ["n1","ci","pc"],["n2","ev","pe"],["n3","cn","pg"],["i1","pc","car","impl"],["i2","pe","car","impl"],["i3","pg","car","impl"]].filter(e=>!hide.includes(e[0])),
   on:live?["main","sr",c[0],c[3]]:["main","sr"],good:live?[c[3]]:[],dim:live?all.filter(i=>i!==c[0]&&i!==c[3]):all,lines:live?["u0","h1",c[1],c[2]]:["u0"],
   log:log.length?log:["// press \"Sell a car\""],out:out.length?"// output:\n"+out.join("\n"):"// output:"};
 }}});
