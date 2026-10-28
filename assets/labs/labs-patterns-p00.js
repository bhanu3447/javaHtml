/* P00 labs (Foundations + SOLID): data only, drawn by the kit in labs-patterns.js (DPL.add). Hosts: #dp-uml (reading a class diagram),
   #dp-iface (program to an interface: Structure / Runtime), #dp-dispatch (dynamic dispatch), #dp-comp (inheritance vs composition),
   #dp-srp #dp-ocp #dp-lsp #dp-isp #dp-dip (Before / After), #dp-lambda (one interface four ways), #dp-refactor (tight vs loose coupling),
   plus the families map #dpFam. Code excerpts come from the P00 programs, all run on JDK 25 (kb/patterns-00-foundations.md). */
"use strict";
DPL.families(document.getElementById("dpFam"));
DPL.add({

/* ---------- §4 reading a class diagram ---------- */
uml:{pill:"VISUAL LAB · READING A CLASS DIAGRAM",views:[{name:"Diagram",h:310,
 nodes:[{id:"drv",x:200,y:10,w:200,name:"Drivable",st:"interface",m:["+ drive(int)","+ honk()"]},
  {id:"veh",x:200,y:120,w:200,name:"Vehicle",st:"abstract",f:["# plate: String"],m:["+ wheels(): int"]},
  {id:"sw",x:90,y:250,w:170,name:"Swift",m:["+ drive(int)"]},{id:"nx",x:340,y:250,w:170,name:"Nexon",m:["+ drive(int)"]},
  {id:"shw",x:420,y:120,w:175,name:"Showroom",f:["- cars: List<Vehicle>"],m:["+ sell(plate)"]},
  ["cust",430,10,160,"Customer","wants a car"]],
 edges:[["i1","veh","drv","impl"],["e1","sw","veh","ext"],["e2","nx","veh","ext"],["h1","shw","veh","has"],["c1","cust","shw","calls"]],
 code:`interface Drivable {
    void drive(int speed);
    default void honk() { System.out.println("Beep!"); }
}
abstract class Vehicle implements Drivable {
    protected final String plate;
    public int wheels() { return 4; }
}
class Swift extends Vehicle { public void drive(int speed) { … } }
class Nexon extends Vehicle { public void drive(int speed) { … } }

class Showroom {
    private List<Vehicle> cars;                  // has-a
    public void sell(String plate) { … }
}
class Customer {
    void buy(Showroom s) { s.sell("KA-01"); }    // calls
}`,
 steps:[
 {t:"A box is one class",d:"Three parts from top to bottom: the <b>name</b>, the <b>fields</b> (what it has), the <b>methods</b> (what it can do). A part with nothing to show is left out, so <code>Swift</code> has no field part.",cur:["sw"],lines:[],marks:["class Swift"],note:"name · fields · methods"},
 {t:"The sign in front of a member is its visibility",d:"<b>+</b> public, <b>−</b> private, <b>#</b> protected. <code>+ wheels(): int</code> reads \"a public method wheels that returns an int\". The type comes after a colon.",cur:["veh","shw"],lines:[],marks:["protected final String plate","public int wheels","private List<Vehicle>"],note:"+ public · − private · # protected"},
 {t:"«interface» and «abstract»: you cannot new them",d:"A word in « » above the name says what kind of type it is, and the name is in <i>italics</i> when the type is not finished (an interface or an abstract class).",cur:["drv"],on:["veh"],lines:[],marks:["interface Drivable","abstract class Vehicle"],note:"italic name = cannot be instantiated"},
 {t:"Implements: dashed line, hollow triangle",d:"<code>Vehicle implements Drivable</code>. The triangle always points at the type that makes the <b>promise</b>.",cur:["veh"],on:["drv"],lines:["i1"],marks:["implements Drivable"],note:"Vehicle ⇢ Drivable"},
 {t:"Extends: solid line, hollow triangle",d:"<code>Swift extends Vehicle</code> and <code>Nexon extends Vehicle</code>: each inherits <code>plate</code> and <code>wheels()</code> and writes its own <code>drive</code>.",cur:["sw","nx"],on:["veh"],lines:["e1","e2"],marks:["extends Vehicle"],note:"child → parent"},
 {t:"Has-a: a diamond at the owner",d:"<code>Showroom</code> keeps a list of vehicles in a field. The diamond sits on the side of the class that <b>owns</b> the field. This is <b>composition</b> (you meet it again in section 7).",cur:["shw"],on:["veh"],lines:["h1"],marks:["private List<Vehicle> cars"],note:"owner ◇— part"},
 {t:"Calls / uses: a plain arrow",d:"<code>Customer</code> does not keep a Showroom; it only calls a method on one that is passed in. A plain arrow means \"uses\".",cur:["cust"],on:["shw"],lines:["c1"],marks:["s.sell"],note:"caller → callee"},
 {t:"Now read the whole picture",d:"\"A Customer uses a Showroom, which has Vehicles. Every Vehicle is Drivable; Swift and Nexon are the real Vehicles.\" Every pattern in this course comes with a diagram like this one.",on:["drv","veh","sw","nx","shw","cust"],lines:"all",note:"four arrows are all you need"}]}]},

/* ---------- §5 program to an interface ---------- */
iface:{pill:"VISUAL LAB · PROGRAM TO AN INTERFACE",views:[
 {name:"Structure",h:220,
 nodes:[{id:"co",x:20,y:30,w:210,name:"Checkout",f:["- gateway: PaymentGateway"],m:["+ buy(car, lakhs)"]},
  {id:"pg",x:340,y:30,w:220,name:"PaymentGateway",st:"interface",m:["+ pay(lakhs): String"]},
  {id:"card",x:290,y:160,w:150,name:"CardGateway",m:["+ pay(lakhs)"]},{id:"upi",x:460,y:160,w:130,name:"UpiGateway",m:["+ pay(lakhs)"]}],
 edges:[["h1","co","pg","has"],["i1","card","pg","impl"],["i2","upi","pg","impl"]],
 code:`class Checkout {
    private final PaymentGateway gateway;          // the field's type is the INTERFACE
    Checkout(PaymentGateway gateway) { this.gateway = gateway; }
    void buy(String car, int lakhs) {
        System.out.println(car + ": " + gateway.pay(lakhs));
    }
}
interface PaymentGateway { String pay(int lakhs); }
class CardGateway implements PaymentGateway { … }
class UpiGateway  implements PaymentGateway { … }

List<String> cars = new ArrayList<>();             // same idea in the JDK`,
 steps:[
 {t:"Checkout has a gateway, typed as the interface",d:"The field is a <code>PaymentGateway</code>, not a <code>CardGateway</code>. Checkout only knows the <b>promise</b>: \"you can call <code>pay</code>\".",cur:["co"],on:["pg"],lines:["h1"],marks:["private final PaymentGateway gateway"],note:"depend on what it does, not on who does it"},
 {t:"Two classes keep the promise",d:"<code>CardGateway</code> and <code>UpiGateway</code> both implement <code>PaymentGateway</code>. Either one can sit in the field.",cur:["card","upi"],on:["pg"],lines:["i1","i2"],marks:["implements PaymentGateway"],note:"two implementations, one interface"},
 {t:"Checkout never names a concrete class",d:"Search the Checkout code: no <code>CardGateway</code>, no <code>UpiGateway</code>. Adding a wallet gateway tomorrow needs no change here.",good:["co"],on:["pg"],dim:["card","upi"],lines:["h1"],marks:["gateway.pay(lakhs)"],note:"Checkout compiles without knowing the gateways exist"},
 {t:"You already do this with List",d:"<code>List&lt;String&gt; cars = new ArrayList&lt;&gt;()</code> declares the interface and picks the class once. Change it to <code>LinkedList</code> and nothing else changes.",on:["co","pg","card","upi"],lines:"all",marks:["List<String> cars"],note:"declare the interface · choose the class once"}]},
 {name:"Runtime",h:250,
 nodes:[["main",20,20,180,"main()","creates and wires"],["co",20,160,180,"checkout",": Checkout"],["card",390,80,190,"card",": CardGateway"],["upi",390,180,190,"upi",": UpiGateway"]],
 edges:[["w1","main","co","calls",0,"new Checkout(…)"],["c1","co","card","calls",0,"pay(7)","h"],["c2","co","upi","calls",0,"pay(12)","h"]],
 code:`new Checkout(new CardGateway()).buy("Swift", 7);   // Swift: paid 7 lakh by card
new Checkout(new UpiGateway()).buy("Nexon", 12);   // Nexon: paid 12 lakh by UPI`,
 steps:[
 {t:"main builds a card gateway and hands it over",d:"<code>main</code> is the only place that says <code>new CardGateway()</code>. It passes that object into the Checkout constructor.",cur:["main"],on:["co","card"],lines:["w1"],hide:["upi","c2"],txt:{co:["checkout","gateway = card"]},marks:["new CardGateway()"],note:"wiring happens in one place"},
 {t:"buy calls pay: the card code runs",d:"<code>gateway.pay(7)</code> is a call on the interface. At run time the object in the field is a CardGateway, so <b>its</b> <code>pay</code> runs.",cur:["card"],on:["co"],lines:["c1"],hide:["upi","c2"],txt:{co:["checkout","gateway = card"]},marks:["buy(\"Swift\", 7)"],note:"Swift: paid 7 lakh by card"},
 {t:"A second checkout gets a UPI gateway",d:"Same Checkout class, different object in the field. Nothing in Checkout was edited or recompiled.",cur:["co"],on:["upi"],dim:["card"],lines:["w1"],txt:{co:["checkout","gateway = upi"]},marks:["new UpiGateway()"],note:"new object, same class"},
 {t:"Now pay runs the UPI code",d:"The same line <code>gateway.pay(lakhs)</code> now reaches UpiGateway. Which code runs is decided by the object, not by the variable's type: this is <b>polymorphism</b>.",cur:["upi"],on:["co"],dim:["card"],lines:["c2"],txt:{co:["checkout","gateway = upi"]},marks:["buy(\"Nexon\", 12)"],note:"Nexon: paid 12 lakh by UPI"},
 {t:"Checkout's code never changed",d:"Swap, add or fake a gateway (for a test) without touching Checkout. Most patterns in this course are this one trick, used for a specific problem.",good:["co"],on:["card","upi","main"],lines:["c1","c2"],txt:{co:["checkout","any gateway"]},note:"one interface · many objects · zero edits"}]}]},

/* ---------- §6 how Java picks the method (dynamic dispatch) ---------- */
dispatch:{pill:"VISUAL LAB · WHICH apply() RUNS?",views:[{name:"One call, two objects",h:262,
 nodes:[["var",200,15,150,"discount","type: Discount"],
  {id:"disc",x:440,y:10,w:150,name:"Discount",st:"interface",m:["+ apply(long): long"]},
  ["o1",100,110,170,"object on the heap",": FestivalDiscount"],["o2",320,110,170,"object on the heap",": LoyaltyDiscount"],
  {id:"fc",x:85,y:205,w:200,name:"FestivalDiscount",m:["+ apply: price × 90 / 100"]},
  {id:"lc",x:305,y:205,w:200,name:"LoyaltyDiscount",m:["+ apply: price − 20000"]}],
 edges:[["t1","var","disc","calls",0,"declared as","h"],["r1","var","o1"],["r2","var","o2"],
  ["k1","o1","fc"],["k2","o2","lc"]],
 code:`Discount discount = new FestivalDiscount();   // declared: Discount · object: FestivalDiscount
discount.apply(price);                        // 630000

discount = new LoyaltyDiscount();             // same variable, another object
discount.apply(price);                        // 680000

interface Discount { long apply(long price); }
class FestivalDiscount implements Discount {
    @Override public long apply(long price) { return price * 90 / 100; }
}
class LoyaltyDiscount implements Discount {
    @Override public long apply(long price) { return price - 20000; }
}`,
 steps:[
 {t:"One call: discount.apply(price)",d:"Two questions hide in this line: may it be written at all, and <b>which</b> <code>apply</code> runs? Java answers them at two different times. The variable <code>discount</code> has a <b>declared type</b>; the object it points to has its own <b>runtime type</b>.",cur:["var"],on:["o1"],lines:[],hide:["o2","lc","r2","k2"],marks:["new FestivalDiscount()"],note:"declared type ≠ object's type"},
 {t:"Compile time: only the declared type counts",d:"The compiler sees <code>Discount discount</code>. <code>Discount</code> promises <code>apply(long)</code>, so the call compiles. The compiler does not know which object will be there when the program runs.",cur:["disc"],on:["var"],dim:["o1"],lines:["t1"],hide:["o2","lc","r2","k2"],marks:["interface Discount"],note:"compiles: Discount has apply(long)"},
 {t:"Run time: follow the reference to the heap",d:"The variable holds a <b>reference</b>, an arrow to an object on the heap. The JVM follows it and finds a <code>FestivalDiscount</code> object.",cur:["o1"],on:["var"],lines:["r1"],hide:["o2","lc","r2","k2"],marks:["// 630000"],note:"the object is what matters now"},
 {t:"The object knows its class",d:"Every object carries a pointer to its class. The class of this one is <code>FestivalDiscount</code>, which <b>overrides</b> <code>apply</code>.",cur:["fc"],on:["o1","var"],lines:["r1","k1"],hide:["o2","lc","r2","k2"],marks:["class FestivalDiscount"],note:"object → class → method"},
 {t:"FestivalDiscount.apply runs",d:"The method of the object's class runs. Choosing the method at run time from the object is called <b>dynamic dispatch</b>.",good:["fc"],on:["o1","var"],lines:["r1","k1"],hide:["o2","lc","r2","k2"],marks:["price * 90 / 100"],note:"700000 → 630000"},
 {t:"Same variable, a different object",d:"<code>discount = new LoyaltyDiscount()</code>. The declared type is still <code>Discount</code>, so the same call still compiles. The arrow now points at another object.",cur:["o2"],on:["var"],dim:["o1","fc"],lines:["r2"],hide:["r1"],marks:["new LoyaltyDiscount()"],note:"declared type unchanged · object changed"},
 {t:"Now LoyaltyDiscount.apply runs",d:"The same line of code reaches a different method, because the object's class is different. The caller was never edited.",good:["lc"],on:["var","o2"],dim:["o1","fc"],lines:["r2","k2"],hide:["r1"],marks:["price - 20000","// 680000"],note:"700000 → 680000"},
 {t:"Overrides at run time, overloads at compile time",d:"This run-time choice applies to <b>overrides</b> (same name, same parameter types). <b>Overloads</b> (same name, different parameter types) are picked by the compiler from declared types, before any object exists. The program below shows both.",on:["var","disc","o2","lc","o1","fc"],lines:"all",hide:["r1"],marks:["@Override"],note:"override: the object decides · overload: the compiler decides"}]}]},

/* ---------- §7 composition over inheritance ---------- */
comp:{pill:"VISUAL LAB · COMPOSITION OVER INHERITANCE",views:[
 {name:"Inheritance",h:310,
 nodes:[{id:"car",x:220,y:10,w:160,name:"Car",m:["+ start()"]},{id:"suv",x:80,y:95,w:160,name:"Suv"},{id:"sed",x:360,y:95,w:160,name:"Sedan"},
  {id:"ps",x:10,y:175,w:135,name:"PetrolSuv",m:["+ start()"]},{id:"es",x:155,y:175,w:135,name:"ElectricSuv",m:["+ start()"]},
  {id:"pse",x:305,y:175,w:135,name:"PetrolSedan",m:["+ start()"]},{id:"ese",x:455,y:175,w:135,name:"ElectricSedan",m:["+ start()"]},
  ["h1",80,255,160,"HybridSuv","+1 class",44],["h2",360,255,160,"HybridSedan","+1 class",44]],
 edges:[["e1","suv","car","ext"],["e2","sed","car","ext"],["e3","ps","suv","ext"],["e4","es","suv","ext"],["e5","pse","sed","ext"],["e6","ese","sed","ext"]],
 code:`class Car { void start() { … } }
class Suv extends Car { }
class Sedan extends Car { }
class PetrolSuv extends Suv { void start() { /* vroom */ } }
class ElectricSuv extends Suv { void start() { /* hum */ } }
class PetrolSedan extends Sedan { void start() { /* vroom */ } }
class ElectricSedan extends Sedan { void start() { /* hum */ } }
// + HybridSuv, HybridSedan, DieselSuv, DieselSedan …`,
 steps:[
 {t:"Body type as a subclass",d:"<code>Suv</code> and <code>Sedan</code> extend <code>Car</code>. So far, so good: two kinds of car, two classes.",cur:["suv","sed"],on:["car"],lines:["e1","e2"],hide:["ps","es","pse","ese","h1","h2","e3","e4","e5","e6"],marks:["extends Car"],note:"2 classes"},
 {t:"Engine type as a subclass too",d:"Petrol or electric is a second, independent choice. With inheritance every <b>combination</b> needs its own class: 2 bodies × 2 engines = 4 classes, and the petrol code is written twice.",cur:["ps","es","pse","ese"],on:["suv","sed"],lines:["e3","e4","e5","e6"],hide:["h1","h2"],marks:["PetrolSuv","ElectricSuv","PetrolSedan","ElectricSedan"],note:"2 × 2 = 4 leaf classes"},
 {t:"Add one engine, get two more classes",d:"A hybrid engine means <code>HybridSuv</code> and <code>HybridSedan</code>. Add diesel and a hatchback and you are at 4 × 3 = 12. This is the <b>class explosion</b>.",bad:["h1","h2"],on:["ps","es","pse","ese"],lines:[],marks:["HybridSuv"],note:"bodies × engines classes"},
 {t:"And the engine is fixed for life",d:"An object of <code>PetrolSuv</code> can never become electric: the class is chosen at <code>new</code> and cannot change. Inheritance is decided at compile time.",cur:["ps"],bad:["ps"],dim:["es","pse","ese","h1","h2"],lines:["e3"],marks:["class PetrolSuv"],note:"inheritance can't change at run time"}]},
 {name:"Composition",h:250,
 nodes:[{id:"car",x:30,y:30,w:200,name:"Car",f:["- body: String","- engine: Engine"],m:["+ start()","+ setEngine(e)"]},
  {id:"eng",x:360,y:30,w:200,name:"Engine",st:"interface",m:["+ sound(): String"]},
  {id:"pe",x:270,y:190,w:150,name:"PetrolEngine",m:["+ sound()"]},{id:"ee",x:440,y:190,w:150,name:"ElectricEngine",m:["+ sound()"]},
  {id:"hy",x:60,y:190,w:160,name:"HybridEngine",m:["+ sound()"]}],
 edges:[["h1","car","eng","has"],["i1","pe","eng","impl"],["i2","ee","eng","impl"],["i3","hy","eng","impl"]],
 code:`interface Engine { String sound(); }
class PetrolEngine   implements Engine { … "petrol engine, vroom" }
class ElectricEngine implements Engine { … "electric motor, hum" }

class Car {
    private final String body;
    private Engine engine;                              // has-a
    void setEngine(Engine engine) { this.engine = engine; }
    void start() { System.out.println(body + ": " + engine.sound()); }
}

Car suv = new Car("SUV", new PetrolEngine());
suv.start();                          // SUV: petrol engine, vroom
suv.setEngine(new ElectricEngine());  // swap the part at run time
suv.start();                          // SUV: electric motor, hum`,
 steps:[
 {t:"The car HAS an engine",d:"One <code>Car</code> class with a field of type <code>Engine</code> (an interface). The body type is just a value in another field.",cur:["car"],on:["eng"],lines:["h1"],hide:["hy","i3"],marks:["private Engine engine"],note:"1 Car class"},
 {t:"Each engine is its own small class",d:"<code>PetrolEngine</code> and <code>ElectricEngine</code> implement <code>Engine</code>. The petrol code exists once, whatever the body.",cur:["pe","ee"],on:["eng"],lines:["i1","i2"],hide:["hy","i3"],marks:["implements Engine"],note:"2 engines · any body"},
 {t:"Swap the part at run time",d:"<code>setEngine(new ElectricEngine())</code>: the same car object now hums. Composition is decided at <b>run time</b>; the Car calls <code>engine.sound()</code> and <b>delegates</b> the work.",cur:["car","ee"],on:["eng"],dim:["pe"],lines:["h1","i2"],hide:["hy","i3"],marks:["suv.setEngine","electric motor, hum"],note:"SUV: electric motor, hum"},
 {t:"A new engine is one new class",d:"<code>HybridEngine</code> plugs into every body type with no change to Car. Classes grow as bodies + engines, not bodies × engines.",good:["hy"],on:["car","eng","pe","ee"],lines:["i3"],marks:["interface Engine"],note:"bodies + engines, not bodies × engines"}]}]},

/* ---------- §8 S: single responsibility ---------- */
srp:{pill:"VISUAL LAB · S · SINGLE RESPONSIBILITY",views:[
 {name:"Before",h:250,
 nodes:[["tax",20,20,170,"Accounts team","tax and discount rules"],["des",215,20,170,"Sales team","invoice layout"],["it",410,20,170,"IT team","where files are saved"],
  {id:"inv",x:200,y:125,w:200,name:"Invoice",f:["- car: String","- price, discount: int"],m:["+ total(): int","+ print()","+ save()"]}],
 edges:[["a1","tax","inv"],["a2","des","inv"],["a3","it","inv"]],
 code:`class Invoice {
    private final String car;
    private final int price, discount;

    int total() { return price - discount; }                    // job 1: business rule
    void print() {                                              // job 2: presentation
        System.out.println("INVOICE  " + car + "  Rs " + total());
    }
    void save() {                                               // job 3: storage
        System.out.println("saved invoice-" + car + ".txt");
    }
}`,
 steps:[
 {t:"One class doing three jobs",d:"<code>Invoice</code> computes the total, prints itself and saves itself. Three different people in the dealership care about those three jobs.",cur:["inv"],on:["tax","des","it"],marks:["job 1","job 2","job 3"],note:"three reasons to change"},
 {t:"Accounts changes a tax rule: edit Invoice",d:"A discount rule changes, so someone opens <code>Invoice</code> and edits <code>total()</code>.",cur:["tax"],bad:["inv"],lines:["a1"],marks:["int total()"],note:"edit 1"},
 {t:"Sales wants a new layout: edit Invoice again",d:"Another person opens the same file to change <code>print()</code>. Two edits, one file: merge conflicts, and a layout change can break the totals.",cur:["des"],bad:["inv"],lines:["a2"],marks:["void print()"],note:"edit 2, same file"},
 {t:"IT moves files to the cloud: and again",d:"Every team's change re-tests and redeploys everybody's code. The class has <b>three reasons to change</b>.",cur:["it"],bad:["inv"],lines:["a3"],marks:["void save()"],note:"edit 3, same file"}]},
 {name:"After",h:230,
 nodes:[["tax",20,20,170,"Accounts team","tax and discount rules"],["des",215,20,170,"Sales team","invoice layout"],["it",410,20,170,"IT team","where files are saved"],
  {id:"inv",x:20,y:130,w:170,name:"Invoice",st:"record",f:["car, price, discount"],m:["+ total(): int"]},
  {id:"pr",x:215,y:130,w:170,name:"InvoicePrinter",m:["+ print(Invoice)"]},{id:"repo",x:410,y:130,w:170,name:"InvoiceRepository",m:["+ save(Invoice)"]}],
 edges:[["a1","tax","inv"],["a2","des","pr"],["a3","it","repo"]],
 code:`record Invoice(String car, int price, int discount) {      // the business rule
    int total() { return price - discount; }
}
class InvoicePrinter {                                     // the layout
    void print(Invoice inv) { … }
}
class InvoiceRepository {                                  // the storage
    void save(Invoice inv) { … }
}`,
 steps:[
 {t:"Three classes, one job each",d:"The rule stays in <code>Invoice</code>; printing and saving move into their own classes that take an Invoice.",on:["inv","pr","repo","tax","des","it"],lines:"all",marks:["record Invoice","class InvoicePrinter","class InvoiceRepository"],note:"one reason to change each"},
 {t:"A tax change touches only Invoice",d:"Accounts edits <code>total()</code>. The printer and the repository are not opened, not re-tested.",cur:["tax"],good:["inv"],dim:["pr","repo"],lines:["a1"],marks:["int total()"],note:"1 class changed"},
 {t:"A layout change touches only InvoicePrinter",d:"Sales gets its own file. No merge conflict with Accounts.",cur:["des"],good:["pr"],dim:["inv","repo"],lines:["a2"],marks:["void print"],note:"1 class changed"},
 {t:"A storage change touches only InvoiceRepository",d:"<b>SRP</b>: a class should have one reason to change, that is, one actor it answers to. It does not mean \"one method\".",cur:["it"],good:["repo"],dim:["inv","pr"],lines:["a3"],marks:["void save"],note:"1 class changed"}]}]},

/* ---------- §9 O: open/closed ---------- */
ocp:{pill:"VISUAL LAB · O · OPEN / CLOSED",views:[
 {name:"Before",h:265,
 nodes:[{id:"calc",x:170,y:20,w:260,name:"PriceCalculator",m:["+ finalPrice(price, offer)"]},
  ["b1",20,120,170,"if festival","10% off"],["b2",215,120,170,"else if loyalty","20,000 off"],["b3",410,120,170,"else","full price"],
  ["b4",215,200,170,"else if student","edit + re-test all"]],
 edges:[["o1","calc","b1"],["o2","calc","b2"],["o3","calc","b3"]],
 code:`class PriceCalculator {
    int finalPrice(int price, String offer) {
        if (offer.equals("festival")) return price * 90 / 100;   // 10% off
        else if (offer.equals("loyalty")) return price - 20000;  // flat 20,000 off
        else return price;
        // a "student" offer? edit here again
    }
}`,
 steps:[
 {t:"Every offer lives in one method",d:"<code>finalPrice</code> picks the rule with an if / else chain on a string.",cur:["calc"],on:["b1","b2","b3"],lines:"all",hide:["b4"],marks:["int finalPrice"],note:"one method knows every offer"},
 {t:"\"festival\" takes the first branch",d:"<code>finalPrice(700000, \"festival\")</code> returns 630000.",cur:["b1"],on:["calc"],lines:["o1"],hide:["b4"],marks:["\"festival\""],note:"700000 → 630000"},
 {t:"\"loyalty\" takes the second",d:"<code>finalPrice(700000, \"loyalty\")</code> returns 680000.",cur:["b2"],on:["calc"],lines:["o2"],hide:["b4"],marks:["\"loyalty\""],note:"700000 → 680000"},
 {t:"A new offer means opening tested code",d:"Marketing adds a student offer. Someone must edit <code>finalPrice</code>, add a branch, and re-test the branches that already worked. A typo here breaks every offer.",bad:["calc","b4"],on:["b1","b2","b3"],lines:"all",marks:["student"],note:"modified, not extended"}]},
 {name:"After",h:210,
 nodes:[{id:"calc",x:20,y:20,w:180,name:"PriceCalculator",m:["+ finalPrice(p, d)"]},
  {id:"disc",x:270,y:20,w:200,name:"Discount",st:"interface",m:["+ apply(price): int"]},
  {id:"nd",x:8,y:150,w:140,name:"NoDiscount",m:["+ apply(price)"]},{id:"fd",x:156,y:150,w:140,name:"FestivalDiscount",m:["+ apply(price)"]},
  {id:"ld",x:304,y:150,w:140,name:"LoyaltyDiscount",m:["+ apply(price)"]},{id:"st",x:452,y:150,w:140,name:"StudentDiscount",m:["+ apply(price)"]}],
 edges:[["u1","calc","disc"],["i1","nd","disc","impl"],["i2","fd","disc","impl"],["i3","ld","disc","impl"],["i4","st","disc","impl"]],
 code:`interface Discount { int apply(int price); }

class FestivalDiscount implements Discount {
    public int apply(int price) { return price * 90 / 100; }
}
class LoyaltyDiscount implements Discount {
    public int apply(int price) { return price - 20000; }
}
class StudentDiscount implements Discount {     // NEW offer: a new class, nothing else edited
    public int apply(int price) { return price * 95 / 100; }
}
class PriceCalculator {                          // closed for modification
    int finalPrice(int price, Discount d) { return d.apply(price); }
}`,
 steps:[
 {t:"The calculator knows only Discount",d:"<code>finalPrice</code> takes a <code>Discount</code> and calls <code>apply</code>. It has no idea which offers exist.",cur:["calc"],on:["disc"],lines:["u1"],hide:["st","i4"],marks:["int finalPrice(int price, Discount d)"],note:"no if / else"},
 {t:"Each offer is its own class",d:"No discount, festival and loyalty each implement <code>apply</code>. Each one can be read and tested alone.",cur:["nd","fd","ld"],on:["disc"],lines:["i1","i2","i3"],hide:["st","i4"],marks:["class FestivalDiscount","class LoyaltyDiscount"],note:"one class per rule"},
 {t:"A new offer is a new class",d:"<code>StudentDiscount</code> is added. Nothing that already works was opened.",good:["st"],on:["disc"],lines:["i4"],marks:["class StudentDiscount","return price * 95"],note:"StudentDiscount 665000"},
 {t:"Open for extension, closed for modification",d:"<b>OCP</b>: add behaviour by adding code, not by editing tested code. This exact shape is the <b>Strategy</b> pattern (lesson 01).",good:["calc"],on:["disc","nd","fd","ld","st"],lines:"all",marks:["closed for modification"],note:"extended without being modified"}]}]},

/* ---------- §10 L: Liskov substitution ---------- */
lsp:{pill:"VISUAL LAB · L · LISKOV SUBSTITUTION",views:[
 {name:"Before",h:230,
 nodes:[["loop",15,30,190,"fleet loop","for (Car c : fleet)"],{id:"car",x:245,y:20,w:170,name:"Car",f:["# name: String"],m:["+ refuel()"]},
  {id:"pc",x:130,y:160,w:180,name:"PetrolCar"},{id:"ec",x:370,y:160,w:210,name:"ElectricCar",m:["+ refuel(): throws!"]}],
 edges:[["c1","loop","car"],["e1","pc","car","ext"],["e2","ec","car","ext"]],
 code:`for (Car c : fleet) {
    c.refuel();      // the code was written for Car, so it trusts refuel()
}
class Car {
    void refuel() { System.out.println(name + ": tank filled"); }
}
class PetrolCar extends Car { }
class ElectricCar extends Car {          // "an electric car IS A car", so extends... but
    @Override void refuel() {            // it breaks the parent's promise
        throw new UnsupportedOperationException(name + " has no fuel tank");
    }
}`,
 steps:[
 {t:"\"An electric car is a car\", so it extends Car",d:"It sounds right in English. <code>ElectricCar</code> inherits <code>refuel()</code> and overrides it, because it has no tank.",cur:["ec"],on:["car"],lines:["e2"],marks:["class ElectricCar extends Car"],note:"is-a in English ≠ is-a in code"},
 {t:"The fleet loop trusts the parent",d:"The loop was written for <code>Car</code>, whose promise is \"after <code>refuel()</code> the car can drive\".",cur:["loop"],on:["car"],lines:["c1"],marks:["c.refuel()"],note:"code written against Car"},
 {t:"A PetrolCar keeps the promise",d:"The first car in the list is a Swift. Refuel works.",good:["pc"],on:["loop","car"],lines:["c1","e1"],txt:{loop:["fleet loop","Swift: tank filled"]},marks:["tank filled"],note:"Swift: tank filled"},
 {t:"An ElectricCar breaks it",d:"The second car throws <code>UnsupportedOperationException</code>. The loop did nothing wrong; the subclass could not stand in for its parent.",bad:["ec","loop"],on:["car"],lines:["c1","e2"],txt:{loop:["fleet loop","Nexon EV: exception!"]},marks:["throw new UnsupportedOperationException"],note:"the program crashes"}]},
 {name:"After",h:250,
 nodes:[["loop",15,30,190,"fleet loop","for (Vehicle v : fleet)"],{id:"veh",x:245,y:20,w:170,name:"Vehicle",st:"abstract",f:["# name: String"],m:["+ topUp()"]},
  {id:"pc",x:110,y:170,w:200,name:"PetrolCar",m:["+ topUp(): fill tank"]},{id:"ec",x:350,y:170,w:230,name:"ElectricCar",m:["+ topUp(): charge"]}],
 edges:[["c1","loop","veh"],["e1","pc","veh","ext"],["e2","ec","veh","ext"]],
 code:`abstract class Vehicle {
    abstract void topUp();               // the promise is about the RESULT, not about petrol
}
class PetrolCar extends Vehicle {
    void topUp() { System.out.println(name + ": tank filled"); }
}
class ElectricCar extends Vehicle {
    void topUp() { System.out.println(name + ": battery charged"); }
}
for (Vehicle v : fleet) v.topUp();       // Swift: tank filled / Nexon EV: battery charged`,
 steps:[
 {t:"Promise the result, not the mechanism",d:"<code>Vehicle.topUp()</code> promises \"afterwards the range is full\". Petrol and electric cars can both keep that.",cur:["veh"],on:["pc","ec"],lines:["e1","e2"],marks:["abstract void topUp()"],note:"a promise every subtype can keep"},
 {t:"PetrolCar keeps it",d:"Fills the tank.",good:["pc"],on:["loop","veh"],lines:["c1","e1"],txt:{loop:["fleet loop","Swift: tank filled"]},marks:["tank filled"],note:"Swift: tank filled"},
 {t:"ElectricCar keeps it too",d:"Charges the battery. The loop works for every element, with no <code>instanceof</code> check and no exception.",good:["ec"],on:["loop","veh"],lines:["c1","e2"],txt:{loop:["fleet loop","Nexon EV: charged"]},marks:["battery charged"],note:"Nexon EV: battery charged"},
 {t:"The Liskov rule",d:"<b>LSP</b>: wherever the parent is expected, any subtype must work without surprises. Warning signs: an override that throws, does nothing, or callers that check <code>instanceof</code>.",good:["loop"],on:["veh","pc","ec"],lines:"all",note:"subtypes must be substitutable"}]}]},

/* ---------- §11 I: interface segregation ---------- */
isp:{pill:"VISUAL LAB · I · INTERFACE SEGREGATION",views:[
 {name:"Before",h:250,
 nodes:[["caller",15,40,160,"caller code","m.sell(\"Nexon\")"],
  {id:"staff",x:200,y:15,w:200,name:"ShowroomStaff",st:"interface",m:["+ sell(car)","+ repair(car)","+ testDrive(car)"]},
  {id:"mech",x:200,y:160,w:200,name:"Mechanic",m:["+ repair(car)","+ testDrive(car)","+ sell(car): throws!"]}],
 edges:[["c1","caller","staff"],["i1","mech","staff","impl"]],
 code:`interface ShowroomStaff {
    void sell(String car);
    void repair(String car);
    void testDrive(String car);
}
class Mechanic implements ShowroomStaff {
    public void repair(String car)    { … }
    public void testDrive(String car) { … }
    public void sell(String car) {     // forced to write a method it can't honour
        throw new UnsupportedOperationException(name + " does not sell cars");
    }
}`,
 steps:[
 {t:"One fat interface for everyone",d:"<code>ShowroomStaff</code> lists every job in the showroom.",cur:["staff"],lines:[],marks:["interface ShowroomStaff"],note:"3 methods, 1 interface"},
 {t:"A mechanic must implement all of it",d:"Mechanics repair and test-drive. They do not sell, but the interface forces a <code>sell</code> method anyway.",cur:["mech"],on:["staff"],lines:["i1"],marks:["implements ShowroomStaff","forced to write"],note:"a method it can't honour"},
 {t:"The compiler allows a call that cannot work",d:"Code holding a <code>ShowroomStaff</code> calls <code>sell</code>. It compiles; at run time the mechanic throws.",bad:["mech"],cur:["caller"],on:["staff"],lines:["c1","i1"],marks:["throw new UnsupportedOperationException"],note:"Ravi does not sell cars (exception)"},
 {t:"And every change ripples",d:"Change <code>sell</code>'s parameters and every mechanic class must be edited and recompiled, though none of them sells.",bad:["staff","mech"],on:["caller"],lines:["i1"],marks:["void sell(String car);"],note:"clients depend on methods they don't use"}]},
 {name:"After",h:250,
 nodes:[{id:"seller",x:20,y:20,w:170,name:"Seller",st:"interface",m:["+ sell(car)"]},{id:"rep",x:215,y:20,w:170,name:"Repairer",st:"interface",m:["+ repair(car)"]},
  {id:"drv",x:410,y:20,w:170,name:"Driver",st:"interface",m:["+ testDrive(car)"]},
  {id:"sm",x:60,y:175,w:190,name:"SalesMechanic",m:["+ sell(car)","+ repair(car)"]},{id:"mech",x:350,y:175,w:190,name:"Mechanic",m:["+ repair(car)","+ testDrive(car)"]}],
 edges:[["i1","sm","seller","impl"],["i2","sm","rep","impl"],["i3","mech","rep","impl"],["i4","mech","drv","impl"]],
 code:`interface Seller   { void sell(String car); }
interface Repairer { void repair(String car); }
interface Driver   { void testDrive(String car); }

class Mechanic implements Repairer, Driver { … }
class SalesMechanic implements Seller, Repairer { … }  // a class may take several roles

Repairer m = new Mechanic("Ravi");
m.repair("Swift");                 // Ravi repairs Swift
// m.sell("Nexon");                // compile error: Repairer has no sell()`,
 steps:[
 {t:"Small interfaces, one role each",d:"Selling, repairing and driving become three tiny interfaces.",cur:["seller","rep","drv"],lines:[],marks:["interface Seller","interface Repairer","interface Driver"],note:"1 role = 1 interface"},
 {t:"A Mechanic takes only its roles",d:"<code>Mechanic implements Repairer, Driver</code>: no <code>sell</code> to fake.",cur:["mech"],on:["rep","drv"],lines:["i3","i4"],marks:["class Mechanic implements Repairer, Driver"],note:"nothing to throw"},
 {t:"A class can take several roles",d:"<code>SalesMechanic</code> sells and repairs. Java allows any number of interfaces on one class.",cur:["sm"],on:["seller","rep"],lines:["i1","i2"],marks:["class SalesMechanic"],note:"Asha sells Nexon · Asha repairs Nexon"},
 {t:"The wrong call can't be written",d:"A <code>Repairer</code> variable has no <code>sell</code>, so the mistake is a compile error instead of a crash. <b>ISP</b>: no client should depend on methods it does not use.",good:["mech"],on:["rep"],lines:["i3"],marks:["compile error"],note:"error moved from run time to compile time"}]}]},

/* ---------- §12 D: dependency inversion ---------- */
dip:{pill:"VISUAL LAB · D · DEPENDENCY INVERSION",views:[
 {name:"Before",h:220,
 nodes:[{id:"os",x:30,y:40,w:220,name:"OrderService",f:["- sms = new SmsSender()"],m:["+ place(car)"]},
  {id:"sms",x:370,y:46,w:200,name:"SmsSender",m:["+ send(text)"]},
  ["email",370,150,200,"EmailSender?","means editing OrderService"],["test",30,150,220,"unit test","sends a real SMS"]],
 edges:[["h1","os","sms","has",0,"new"]],
 code:`class OrderService {                                // the high-level business rule...
    private final SmsSender sms = new SmsSender();  // ...welded to one concrete detail

    void place(String car) {
        System.out.println("order placed: " + car);
        sms.send("your " + car + " is booked");
    }
}`,
 steps:[
 {t:"The business rule builds its own detail",d:"<code>OrderService</code> (the important, high-level rule) writes <code>new SmsSender()</code> itself, so it depends on a low-level detail.",cur:["os"],on:["sms"],lines:["h1"],hide:["email","test"],marks:["new SmsSender()"],note:"high level → low level"},
 {t:"Placing an order sends an SMS",d:"It works today.",cur:["sms"],on:["os"],lines:["h1"],hide:["email","test"],marks:["sms.send"],note:"order placed: Swift · SMS to customer: your Swift is booked"},
 {t:"Email instead? Edit the business rule",d:"To switch channels you must open and change <code>OrderService</code>, the class that should change least.",bad:["os","email"],on:["sms"],lines:["h1"],hide:["test"],marks:["private final SmsSender sms"],note:"a detail forces a change in the rule"},
 {t:"A unit test sends a real SMS",d:"There is no seam to pass a fake in, so testing <code>place</code> sends real messages (or can't run at all).",bad:["test","os"],on:["sms","email"],lines:["h1"],marks:["sms.send"],note:"untestable without the real detail"}]},
 {name:"After",h:230,
 nodes:[{id:"os",x:20,y:20,w:220,name:"OrderService",f:["- notifier: Notifier"],m:["+ place(car)"]},
  {id:"nt",x:340,y:20,w:220,name:"Notifier",st:"interface",m:["+ send(text)"]},
  {id:"sms",x:20,y:170,w:170,name:"SmsNotifier",m:["+ send(text)"]},{id:"email",x:215,y:170,w:170,name:"EmailNotifier",m:["+ send(text)"]},
  {id:"fake",x:410,y:170,w:170,name:"FakeNotifier",m:["+ send(text)"]}],
 edges:[["h1","os","nt","has"],["i1","sms","nt","impl"],["i2","email","nt","impl"],["i3","fake","nt","impl"]],
 code:`interface Notifier { void send(String text); }      // the abstraction both sides depend on

class OrderService {
    private final Notifier notifier;                // depends on the interface only
    OrderService(Notifier notifier) {               // the detail is handed in (constructor injection)
        this.notifier = notifier;
    }
    void place(String car) { … notifier.send("your " + car + " is booked"); }
}

new OrderService(new SmsNotifier()).place("Swift");    // SMS: your Swift is booked
new OrderService(new EmailNotifier()).place("Nexon");  // Email: your Nexon is booked
new OrderService(fake).place("Creta");                 // test: fake.last = your Creta is booked`,
 steps:[
 {t:"Both sides depend on an abstraction",d:"<code>OrderService</code> holds a <code>Notifier</code>, and every channel implements <code>Notifier</code>. The arrows now point <b>towards</b> the interface: the dependency is <b>inverted</b>.",cur:["nt"],on:["os","sms","email","fake"],lines:["h1","i1","i2","i3"],marks:["interface Notifier","private final Notifier notifier"],note:"rule → interface ← details"},
 {t:"Production passes the SMS notifier",d:"The detail arrives through the constructor.",cur:["sms"],on:["os","nt"],dim:["email","fake"],lines:["h1","i1"],marks:["new SmsNotifier()"],note:"SMS: your Swift is booked"},
 {t:"Email: change the wiring, not the rule",d:"Pass an <code>EmailNotifier</code>. <code>OrderService</code> is not opened.",cur:["email"],good:["os"],on:["nt"],dim:["sms","fake"],lines:["h1","i2"],marks:["new EmailNotifier()"],note:"Email: your Nexon is booked"},
 {t:"Tests pass a fake",d:"A <code>FakeNotifier</code> only records the text, so the test checks <code>fake.last</code> and nothing is sent.",cur:["fake"],good:["os"],on:["nt"],dim:["sms","email"],lines:["h1","i3"],marks:["fake"],note:"your Creta is booked (recorded, not sent)"},
 {t:"Who passes it in? main, or Spring",d:"<b>DIP</b> is the principle (depend on abstractions). <b>Dependency injection</b> is the technique (pass the detail in). Spring's IoC container does the passing for you with constructor injection.",good:["os"],on:["nt","sms","email","fake"],lines:"all",marks:["constructor injection"],note:"DIP = principle · DI = technique · IoC container = tool"}]}]},

/* ---------- §13 lambdas: one interface written four ways ---------- */
lambda:{pill:"VISUAL LAB · ONE INTERFACE, FOUR WAYS",views:[{name:"Same object, less code",h:200,
 nodes:[["calc",10,30,150,"price calculator","rule.apply(700000)"],
  {id:"pr",x:215,y:20,w:170,name:"PriceRule",st:"interface",m:["+ apply(long): long"]},
  ["obj",440,30,150,"rule object",": FestivalRule"],
  ["out",10,130,150,"result","630000"],["loc",215,130,170,"code you write","5 lines + a class"]],
 edges:[["c1","calc","pr","calls",0,"calls"],["i1","obj","pr","impl"]],
 steps:[
 {t:"1 · A named class",d:"The version you know: a class <code>FestivalRule</code> with a name, written in its own place, then <code>new FestivalRule()</code>. The calculator holds it as a <code>PriceRule</code>.",cur:["obj"],on:["calc","pr","out","loc"],lines:"all",txt:{obj:["rule object",": FestivalRule"],loc:["code you write","5 lines + a class"]},
  code:`class FestivalRule implements PriceRule {
    @Override public long apply(long price) {
        return price * 90 / 100;
    }
}

PriceRule rule = new FestivalRule();`,marks:["class FestivalRule","new FestivalRule()"],note:"rule.apply(700000) → 630000"},
 {t:"2 · An anonymous class",d:"The same class, written where it is used and given no name: <code>new PriceRule() { … }</code> declares the class and creates its one object in a single expression.",cur:["obj"],on:["calc","pr","out","loc"],lines:"all",txt:{obj:["rule object","anonymous class"],loc:["code you write","5 lines, no name"]},
  code:`PriceRule rule = new PriceRule() {
    @Override public long apply(long price) {
        return price * 90 / 100;
    }
};`,marks:["new PriceRule() {"],note:"rule.apply(700000) → 630000"},
 {t:"3 · A lambda",d:"<code>PriceRule</code> has exactly one abstract method, so it is a <b>functional interface</b>: the compiler knows the code can only be <code>apply</code>. Keep just the parameter and the body: <code>price -&gt; price * 90 / 100</code>. It is still an object that implements <code>PriceRule</code>.",cur:["obj"],on:["calc","pr","out","loc"],lines:"all",txt:{obj:["rule object","a lambda"],loc:["code you write","1 line"]},
  code:`@FunctionalInterface
interface PriceRule { long apply(long price); }   // exactly one abstract method

PriceRule rule = price -> price * 90 / 100;`,marks:["price -> price"],note:"rule.apply(700000) → 630000"},
 {t:"4 · A method reference",d:"If a method that does the job already exists, point at it: <code>Lambdas::festival</code>. Its parameters and return type match <code>apply</code>, so it fits the interface. Four spellings, one diagram: the calculator never noticed.",good:["obj"],on:["calc","pr","out","loc"],lines:"all",txt:{obj:["rule object","Lambdas::festival"],loc:["code you write","1 line, reuses a method"]},
  code:`static long festival(long price) { return price * 90 / 100; }   // already exists

PriceRule rule = Lambdas::festival;`,marks:["Lambdas::festival"],note:"same object role · four ways to write it"}]}]},

/* ---------- §14 first refactor: tight vs loose coupling ---------- */
refactor:{pill:"VISUAL LAB · TIGHT VS LOOSE COUPLING",views:[
 {name:"Before · tight",h:260,
 nodes:[["main",10,20,150,"main()","pay(\"card\", 700000)"],
  {id:"co",x:215,y:20,w:200,name:"Checkout",m:["+ pay(type, amount)"]},
  ["b1",15,130,135,"if card","1% fee"],["b2",160,130,135,"else if upi","no fee"],["b3",305,130,135,"else if cash","receipt"],["b4",450,130,135,"else","unknown type"],
  ["b5",160,205,280,"else if emi / wallet …","open Checkout again",44]],
 edges:[["m1","main","co"],["o1","co","b1"],["o2","co","b2"],["o3","co","b3"],["o4","co","b4"]],
 code:`checkout.pay("card", 700000);     // card: Rs 700000 + 1% fee = Rs 707000

class Checkout {
    void pay(String type, long amount) {
        if (type.equals("card")) {
            long fee = amount / 100;
            System.out.println("card: Rs " + amount + " + 1% fee = Rs " + (amount + fee));
        } else if (type.equals("upi")) {
            System.out.println("UPI: Rs " + amount + ", no fee");
        } else if (type.equals("cash")) {
            System.out.println("cash: Rs " + amount + ", receipt printed");
        } else {
            System.out.println("unknown payment type: " + type);
        }
        // EMI next month, a wallet after that: open this method again each time
    }
}`,
 steps:[
 {t:"One method knows every payment type",d:"<code>Checkout.pay</code> picks the behaviour with an if / else on a string, the <b>type code</b>.",cur:["co"],on:["b1","b2","b3","b4"],lines:["o1","o2","o3","o4"],hide:["b5"],marks:["void pay(String type"],note:"4 branches in 1 method"},
 {t:"\"card\" takes the first branch",d:"<code>pay(\"card\", 700000)</code> adds the 1% fee.",cur:["b1"],on:["main","co"],lines:["m1","o1"],hide:["b5"],marks:["type.equals(\"card\")","checkout.pay"],note:"card: Rs 700000 + 1% fee = Rs 707000"},
 {t:"Tight coupling",d:"Checkout knows every concrete way of paying, by name, inside its own code. You cannot hand it a fake payment for a test, and card, UPI and cash rules change in the same file.",bad:["co"],on:["b1","b2","b3","b4"],lines:["o1","o2","o3","o4"],hide:["b5"],marks:["\"card: Rs","\"UPI: Rs","\"cash: Rs"],note:"tight: the client names every detail"},
 {t:"EMI arrives: open Checkout again",d:"Every new type adds a branch to tested code. <b>The smell</b>: an if / else on a type code that keeps growing.",bad:["co","b5"],on:["b1","b2","b3","b4"],lines:["o1","o2","o3","o4"],marks:["EMI next month"],note:"modified again, not extended"}]},
 {name:"After · loose",h:250,
 nodes:[["main",10,20,140,"main()","new Checkout(upi)"],
  {id:"co",x:215,y:15,w:170,name:"Checkout",f:["- payment: Payment"],m:["+ pay(amount)"]},
  {id:"pi",x:430,y:20,w:160,name:"Payment",st:"interface",m:["+ pay(amount)"]},
  {id:"cp",x:10,y:170,w:135,name:"CardPayment",m:["+ pay(amount)"]},{id:"up",x:155,y:170,w:135,name:"UpiPayment",m:["+ pay(amount)"]},
  {id:"ca",x:300,y:170,w:135,name:"CashPayment",m:["+ pay(amount)"]},["wl",445,170,145,"wallet","a lambda",45]],
 edges:[["m1","main","co","calls",0,"injects"],["h1","co","pi","has"],["i1","cp","pi","impl"],["i2","up","pi","impl"],["i3","ca","pi","impl"],["i4","wl","pi","impl"]],
 code:`interface Payment { String pay(long amount); }

class CardPayment implements Payment { … }
class UpiPayment  implements Payment { … }
class CashPayment implements Payment { … }

class Checkout {
    private final Payment payment;                       // loose: the interface only
    Checkout(Payment payment) { this.payment = payment; } // handed in from outside
    void pay(long amount) { System.out.println(payment.pay(amount)); }
}

new Checkout(new UpiPayment()).pay(700000);   // UPI: Rs 700000, no fee
new Checkout(amount -> "wallet: Rs " + amount + ", 2% cashback").pay(700000);`,
 steps:[
 {t:"Checkout depends on one interface",d:"The varying part gets a name, <code>Payment</code>. Checkout keeps a <code>Payment</code> field and calls <code>payment.pay(amount)</code>; it no longer names any concrete class.",cur:["co"],on:["pi"],lines:["h1"],hide:["wl","i4"],marks:["private final Payment payment"],note:"Checkout knows only Payment"},
 {t:"One class per payment type",d:"Each branch moved into its own class. Card fees can change without opening the UPI or cash code.",cur:["cp","up","ca"],on:["pi"],lines:["i1","i2","i3"],hide:["wl","i4"],marks:["class CardPayment","class UpiPayment","class CashPayment"],note:"one rule per class"},
 {t:"main chooses and injects",d:"Only <code>main</code> says <code>new UpiPayment()</code> and passes it to the constructor. That is <b>loose coupling</b>: Checkout uses whatever it is handed.",cur:["main"],on:["co","up","pi"],dim:["cp","ca"],lines:["m1","h1","i2"],hide:["wl","i4"],marks:["new Checkout(new UpiPayment())"],note:"UPI: Rs 700000, no fee"},
 {t:"A wallet: one lambda, Checkout untouched",d:"<code>Payment</code> has one method, so a new type can even be a lambda (section 13). Nothing that already works was opened.",good:["wl","co"],on:["pi"],dim:["cp","up","ca"],lines:["i4","h1"],marks:["wallet"],note:"wallet: Rs 700000, 2% cashback"},
 {t:"You just discovered Strategy",d:"Interchangeable behaviours behind one interface, chosen from outside: this is the <b>Strategy</b> pattern, lesson 01.",good:["co"],on:["main","pi","cp","up","ca","wl"],lines:"all",marks:["interface Payment"],note:"tight → loose = if / else → Strategy"}]}]}
});
