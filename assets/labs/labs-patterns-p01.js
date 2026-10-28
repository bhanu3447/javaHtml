/* P01 labs (Strategy): data only, drawn by the kit in labs-patterns.js (DPL.add / DPL.play). Hosts: #dp-stgpain (the if / else ladder
   growing as offers arrive), #dp-stgref (refactor to Strategy, add / del / meter), #dp-stgrun (sequence view of StrategyAfter.main),
   #dpp-stgplay (playground: pick a rule and a price, see the plugged-in class and the printed line), #dp-stguml (Roles / Dealership).
   Every class and method name comes from the P01 programs, all run on JDK 25 (kb/patterns-01-strategy.md). */
"use strict";
DPL.add({

/* ---------- §1 Pain lab: the discount ladder in Checkout ---------- */
stgpain:{pill:"PAIN LAB · OFFERS KEEP ARRIVING",views:[{name:"Pain",h:215,
 nodes:[["main",10,20,150,"main()","the client"],
  {id:"co",x:215,y:14,w:210,name:"Checkout",m:["+ total(price, offer)","+ label(offer)","+ print(price, offer)"]},
  ["b0",8,140,110,"else","no discount"],["b1",126,140,110,"festival","10% off"],["b2",244,140,110,"loyalty","Rs 20000 off"],
  ["b3",362,140,110,"corporate","15% off"],["b4",480,140,112,"next offer?","edit again"]],
 edges:[["m1","main","co"],["o0","co","b0"],["o1","co","b1"],["o2","co","b2"],["o3","co","b3"],["o4","co","b4"]],
 steps:[
 {t:"Day 1: one price for everyone",d:"Two boxes. <b>main()</b> is the <b>client</b>: the code that <i>uses</i> an object. The rounded box with a line under its name is the <b>class</b> <code>Checkout</code>; the lines under the name are its methods. The arrow means \"calls\". There are no offers yet, so <code>total</code> just returns the price.",
  code:`class Checkout {
    long total(long price) {
        return price;              // day 1: no offers
    }
}`,marks:["return price;"],hide:["b1","b2","b3","b4","o1","o2","o3","o4"],txt:{b0:["return price","the only path"],main:["main()","total(700000)"]},lines:["m1","o0"],meter:["edits made to Checkout so far",0,13],note:"Rs 700000 for everyone"},
 {t:"Request 1: a festival offer, 10% off",d:"Marketing asks for a festival discount. The quickest fix is an <b>if / else</b> inside <code>Checkout</code>, chosen by a string <code>offer</code> (a <b>type code</b>: a value that says which behaviour to run). The receipt also needs the offer's name, so a second method <code>label</code> gets the same if / else. Each box below the class is now one branch.",
  code:`class Checkout {
    long total(long price, String offer) {
        if (offer.equals("festival")) return price * 90 / 100;
        else return price;
    }
    String label(String offer) {
        if (offer.equals("festival")) return "Festival 10%";
        else return "No discount";
    }
}`,add:["String offer)","offer.equals(\"festival\")","else return \"No discount\""],hide:["b2","b3","b4","o2","o3","o4"],on:["b1"],lines:["o0","o1"],meter:["edits made to Checkout so far",3,13],note:"3 edits: a new parameter, a branch in total, a whole new method"},
 {t:"Request 2: loyal customers get Rs 20000 off",d:"Another offer, another branch, <b>in both methods</b>. Nothing new was <i>added</i> to the program as a separate piece: the same class was opened and edited again, and the festival branch that already worked has to be tested again.",
  code:`class Checkout {
    long total(long price, String offer) {
        if (offer.equals("festival")) return price * 90 / 100;
        else if (offer.equals("loyalty")) return Math.max(0, price - 20000);
        else return price;
    }
    String label(String offer) {
        if (offer.equals("festival")) return "Festival 10%";
        else if (offer.equals("loyalty")) return "Loyalty Rs 20000";
        else return "No discount";
    }
}`,add:["offer.equals(\"loyalty\")"],hide:["b3","b4","o3","o4"],on:["b2"],lines:["o0","o1","o2"],meter:["edits made to Checkout so far",5,13],note:"2 more edits, 2 ladders to keep in step"},
 {t:"Request 3: corporate buyers get 15% off",d:"Three offers, two ladders of four branches. Every arrow from <code>Checkout</code> is a rule it must know by name. The class now changes whenever <i>any</i> offer changes: it has many reasons to change (it breaks the S and the O of SOLID from P00).",
  code:`class Checkout {
    long total(long price, String offer) {
        if (offer.equals("festival")) return price * 90 / 100;
        else if (offer.equals("loyalty")) return Math.max(0, price - 20000);
        else if (offer.equals("corporate")) return price * 85 / 100;
        else return price;
    }
    String label(String offer) {
        if (offer.equals("festival")) return "Festival 10%";
        else if (offer.equals("loyalty")) return "Loyalty Rs 20000";
        else if (offer.equals("corporate")) return "Corporate 15%";
        else return "No discount";
    }
}`,add:["offer.equals(\"corporate\")"],hide:["b4","o4"],on:["b3"],bad:["co"],lines:["o0","o1","o2","o3"],meter:["edits made to Checkout so far",7,13],note:"4 branches × 2 methods"},
 {t:"A typo slips through",d:"A salesperson types <code>\"festive\"</code>. No branch matches, so the <code>else</code> box quietly gives <b>no discount</b>: no compile error, no exception, just an angry customer. Strings cannot be checked by the compiler, and you cannot test the festival rule on its own because it lives inside <code>Checkout</code>.",
  code:`checkout.print(700000, "festive");   // No discount: Rs 700000  (typo!)

class Checkout {
    long total(long price, String offer) {
        if (offer.equals("festival")) return price * 90 / 100;
        else if (offer.equals("loyalty")) return Math.max(0, price - 20000);
        else if (offer.equals("corporate")) return price * 85 / 100;
        else return price;
    }
    // label(offer) has the same ladder
}`,marks:["\"festive\"","else return price;"],hide:["b4","o4"],bad:["b0","main"],txt:{main:["main()","print(…, \"festive\")"]},lines:["m1","o0"],meter:["edits made to Checkout so far",7,13],note:"festive → No discount: Rs 700000"},
 {t:"Next month: student, exchange bonus, EMI season…",d:"Each new offer costs two more edits to tested code, forever. The class that should only <b>add up a bill</b> has become the home of every pricing idea marketing ever had. <b>What we want</b>: <code>Checkout</code> should ask \"something that can apply a discount\" and never care which one. That is the Strategy pattern, built in section 02.",
  hide:[],bad:["co","b4"],on:["b0","b1","b2","b3"],lines:"all",meter:["edits made to Checkout so far",13,13],note:"3 more offers = 6 more edits to the same class"}]}]},

/* ---------- §2 Refactor lab: from the ladder to Strategy ---------- */
stgref:{pill:"REFACTOR LAB · LADDER → STRATEGY",views:[{name:"Refactor",h:250,
 nodes:[["main",10,20,140,"main()","the client"],
  {id:"old",x:190,y:10,w:200,name:"Checkout",m:["+ total(price, offer)","+ label(offer)"]},
  ["lad",10,100,140,"if / else ladder","4 branches × 2"],
  {id:"co",x:190,y:10,w:200,name:"Checkout",f:["- discount: Discount"],m:["+ setDiscount(d)","+ total(price)","+ print(price)"]},
  {id:"di",x:425,y:14,w:170,name:"Discount",st:"interface",m:["+ apply(price): long","+ label(): String"]},
  {id:"nd",x:8,y:180,w:138,name:"NoDiscount",m:["+ apply(price)","+ label()"]},
  {id:"fd",x:154,y:180,w:138,name:"FestivalDiscount",m:["+ apply(price)","+ label()"]},
  {id:"ld",x:300,y:180,w:138,name:"LoyaltyDiscount",m:["+ apply(price)","+ label()"]},
  {id:"cd",x:446,y:180,w:146,name:"CorporateDiscount",m:["+ apply(price)","+ label()"]}],
 edges:[["m0","main","old"],["l0","old","lad"],["m1","main","co"],["h1","co","di","has"],
  ["i0","nd","di","impl"],["i1","fd","di","impl"],["i2","ld","di","impl"],["i3","cd","di","impl"]],
 steps:[
 {t:"Find what varies",d:"Start from the painful code. Ask: <b>what changes every time a request arrives?</b> Only the discount rule (how much off, and its name). The rest of <code>Checkout</code> (add up, print) stays the same. The part that varies is what we pull out.",
  code:`class Checkout {
    long total(long price, String offer) {
        if (offer.equals("festival")) return price * 90 / 100;
        else if (offer.equals("loyalty")) return Math.max(0, price - 20000);
        else if (offer.equals("corporate")) return price * 85 / 100;
        else return price;
    }
    String label(String offer) {
        if (offer.equals("festival")) return "Festival 10%";
        else if (offer.equals("loyalty")) return "Loyalty Rs 20000";
        else if (offer.equals("corporate")) return "Corporate 15%";
        else return "No discount";
    }
}`,marks:["offer.equals("],hide:["co","di","nd","fd","ld","cd","m1","h1","i0","i1","i2","i3"],bad:["lad"],lines:["m0","l0"],meter:["type checks inside Checkout",6,6],note:"what varies: the rule"},
 {t:"Give the varying part a name: an interface",d:"An <b>interface</b> is a promise: \"I can <code>apply</code> a discount to a price and tell you my <code>label</code>\". This role is called the <b>Strategy</b>. Nothing uses it yet; we only gave the idea a type. The dashed box marks an interface.",
  code:`interface Discount {                // NEW: the role every rule plays
    long apply(long price);
    String label();
}

class Checkout {
    long total(long price, String offer) { /* the ladder, unchanged */ }
    String label(String offer)           { /* the ladder, unchanged */ }
}`,add:["interface Discount","long apply(long price);","String label();"],hide:["co","nd","fd","ld","cd","m1","h1","i0","i1","i2","i3"],good:["di"],lines:["m0","l0"],meter:["type checks inside Checkout",6,6],note:"Strategy = the interface"},
 {t:"Move one rule into its own class",d:"Take the festival branches out of both ladders and put them in <code>FestivalDiscount implements Discount</code>. One small step, then run the program: same output. A class that implements the Strategy is a <b>ConcreteStrategy</b>. The dashed arrow with a hollow head means \"implements\".",
  code:`interface Discount { long apply(long price); String label(); }

class FestivalDiscount implements Discount {
    public long apply(long price) { return price * 90 / 100; }
    public String label() { return "Festival 10%"; }
}

class Checkout {
    long total(long price, String offer) {
        if (offer.equals("festival")) return price * 90 / 100;
        ...
    }
    String label(String offer) {
        if (offer.equals("festival")) return "Festival 10%";
        ...
    }
}`,add:["class FestivalDiscount","price * 90 / 100; }","\"Festival 10%\"; }"],del:["offer.equals(\"festival\")"],hide:["co","nd","ld","cd","m1","h1","i0","i2","i3"],good:["fd"],lines:["i1","m0","l0"],meter:["type checks inside Checkout",4,6],note:"same output, one branch pair gone"},
 {t:"Move the other rules the same way",d:"<code>NoDiscount</code>, <code>LoyaltyDiscount</code> and <code>CorporateDiscount</code> each get their branches. The old ladders are now empty: every type check is struck out. Each rule can be tested alone: <code>new LoyaltyDiscount().apply(700000)</code>.",
  code:`class NoDiscount implements Discount {
    public long apply(long price) { return price; }
    public String label() { return "No discount"; }
}
class FestivalDiscount implements Discount { /* as before */ }
class LoyaltyDiscount implements Discount {
    public long apply(long price) { return Math.max(0, price - 20000); }
    public String label() { return "Loyalty Rs 20000"; }
}
class CorporateDiscount implements Discount {
    public long apply(long price) { return price * 85 / 100; }
    public String label() { return "Corporate 15%"; }
}

class Checkout {
        else if (offer.equals("loyalty")) return Math.max(0, price - 20000);
        else if (offer.equals("corporate")) return price * 85 / 100;
        else return price;
        else if (offer.equals("loyalty")) return "Loyalty Rs 20000";
        else if (offer.equals("corporate")) return "Corporate 15%";
        else return "No discount";
}`,add:["class NoDiscount","class LoyaltyDiscount","class CorporateDiscount","return price; }","price - 20000); }","price * 85 / 100; }","\"No discount\"; }","\"Loyalty Rs 20000\"; }","\"Corporate 15%\"; }"],del:["offer.equals(","else return"],hide:["co","lad","l0","m1","h1"],good:["nd","ld","cd"],lines:["i0","i1","i2","i3"],meter:["type checks inside Checkout",0,6],note:"4 ConcreteStrategies, 0 type checks"},
 {t:"Checkout holds a Discount and delegates",d:"The new <code>Checkout</code> has a field of the <b>interface</b> type (the diamond = \"has-a\"). It is now the <b>Context</b>: the object that owns a strategy and uses it. <code>total</code> just calls <code>discount.apply(price)</code>: handing the work to another object is <b>delegation</b>. Checkout no longer knows a single offer by name.",
  code:`class Checkout {
    private Discount discount;                       // has-a: the current strategy
    Checkout(Discount discount) { this.discount = discount; }
    void setDiscount(Discount discount) { this.discount = discount; }
    long total(long price) { return discount.apply(price); }   // delegate
    void print(long price) {
        System.out.println(discount.label() + ": Rs " + total(price));
    }
}`,add:["private Discount discount;","Checkout(Discount discount)","void setDiscount","discount.apply(price)","void print(long price)","discount.label()"],hide:["old","lad","m0","l0","m1"],good:["co"],lines:["h1"],meter:["type checks inside Checkout",0,6],note:"Context → Strategy (has-a)"},
 {t:"The client chooses, and can swap at run time",d:"<code>main</code> (the client) creates the rule it wants and hands it in: through the constructor, or later through <code>setDiscount</code>. Same <code>Checkout</code> object, different behaviour. A new offer next month is <b>one new class</b>; <code>Checkout</code> is never opened again (Open / Closed).",
  code:`long price = 700000;
Checkout checkout = new Checkout(new FestivalDiscount());
checkout.print(price);                          // Festival 10%: Rs 630000
checkout.setDiscount(new LoyaltyDiscount());    // swap the rule at run time
checkout.print(price);                          // Loyalty Rs 20000: Rs 680000`,add:["new Checkout(new FestivalDiscount())","checkout.setDiscount(new LoyaltyDiscount())"],hide:["old","lad","m0","l0"],on:["main","co"],good:["fd","ld"],txt:{main:["main()","picks the rule"]},lines:["m1","h1","i1","i2"],meter:["type checks inside Checkout",0,6],note:"new offer = 1 new class, 0 edits to Checkout"}]}]},

/* ---------- §3 Runtime lab: sequence of StrategyAfter.main (first two prints) ---------- */
stgrun:{pill:"RUNTIME LAB · WHO CALLS WHOM",views:[{name:"Runtime",alt:"Sequence diagram: main creates a FestivalDiscount and a Checkout, print asks the strategy for label and apply; then main swaps in a LoyaltyDiscount and print runs again",
 seq:{lanes:[["main","main()","the client"],["co","checkout","Checkout"],["fe","festival","FestivalDiscount"],["lo","loyalty","LoyaltyDiscount"]],
  msgs:[["main","fe","new FestivalDiscount()","new"],["main","co","new Checkout(festival)","new"],["main","co","print(700000)"],
   ["co","fe","label()"],["fe","co","\"Festival 10%\"","ret"],["co","co","total(700000)","self"],["co","fe","apply(700000)"],["fe","co","630000","ret"],["co","main","line printed","ret"],
   ["main","lo","new LoyaltyDiscount()","new"],["main","co","setDiscount(loyalty)"],["main","co","print(700000)"],
   ["co","lo","label()"],["lo","co","\"Loyalty Rs 20000\"","ret"],["co","co","total(700000)","self"],["co","lo","apply(700000)"],["lo","co","680000","ret"],["co","main","line printed","ret"]]},
 code:`long price = 700000;
Checkout checkout = new Checkout(new FestivalDiscount());
checkout.print(price);                          // Festival 10%: Rs 630000
checkout.setDiscount(new LoyaltyDiscount());    // swap the rule at run time
checkout.print(price);                          // Loyalty Rs 20000: Rs 680000

class Checkout {
    private Discount discount;
    Checkout(Discount discount) { this.discount = discount; }
    void setDiscount(Discount discount) { this.discount = discount; }
    long total(long price) { return discount.apply(price); }
    void print(long price) {
        System.out.println(discount.label() + ": Rs " + total(price));
    }
}`,
 steps:[
 {t:"Two objects are created",d:"Each column is one <b>object</b>; the dashed line below it is its life. <code>new FestivalDiscount()</code> creates the strategy first (Java evaluates the argument before the constructor runs), then <code>new Checkout(…)</code> stores it in the field <code>discount</code>.",upto:2,cur:1,marks:["new Checkout(new FestivalDiscount())","this.discount = discount; }"]},
 {t:"main calls print(700000)",d:"The client talks only to the context. It does not know (or care) that a festival rule is inside.",upto:3,cur:2,marks:["checkout.print(price);                          // Festival","void print(long price)"]},
 {t:"print asks the strategy for its label",d:"Java evaluates the string from left to right, so <code>discount.label()</code> runs first. <code>discount</code> holds a <code>FestivalDiscount</code>, so dynamic dispatch (P00) runs its <code>label()</code>, which returns \"Festival 10%\".",upto:5,cur:4,marks:["discount.label()"]},
 {t:"total delegates to apply",d:"<code>print</code> calls its own <code>total</code> (the loop arrow = a call to itself), which calls <code>discount.apply(700000)</code>. The festival rule computes <code>700000 * 90 / 100</code> and returns <b>630000</b>. This hand-off is the whole pattern: <b>delegation</b>.",upto:8,cur:7,marks:["return discount.apply(price)"]},
 {t:"First line printed",d:"<code>println</code> joins the pieces and prints <b>Festival 10%: Rs 630000</b>; <code>print</code> returns to main.",upto:9,cur:8,marks:["System.out.println(discount.label()"],note:"Festival 10%: Rs 630000"},
 {t:"Swap the strategy at run time",d:"main creates a <code>LoyaltyDiscount</code> and calls <code>setDiscount</code>. The <b>same</b> Checkout object now points to a different rule. The festival object is no longer used (the garbage collector will reclaim it).",upto:11,cur:10,marks:["checkout.setDiscount(new LoyaltyDiscount())","void setDiscount"]},
 {t:"Same calls, different behaviour",d:"<code>print</code> runs exactly the same code as before, but now <code>label()</code> and <code>apply()</code> go to the loyalty object: <code>Math.max(0, 700000 - 20000)</code> = <b>680000</b>. Checkout did not change; only the object behind the interface did.",upto:17,cur:15,marks:["return discount.apply(price)","checkout.print(price);                          // Loyalty"]},
 {t:"Second line printed",d:"Output: <b>Loyalty Rs 20000: Rs 680000</b>. Two different results from one context, chosen by the client at run time.",upto:18,cur:17,marks:["System.out.println(discount.label()"],note:"Loyalty Rs 20000: Rs 680000"}]}]},

/* ---------- §5 Structure lab: generic roles, then the dealership names ---------- */
stguml:{pill:"STRUCTURE LAB · THE ROLES",views:[
 {name:"Roles",h:250,
 nodes:[["cl",10,20,140,"Client","chooses a strategy"],
  {id:"cx",x:190,y:10,w:200,name:"Context",f:["- strategy: Strategy"],m:["+ setStrategy(s)","+ doWork()"]},
  {id:"si",x:425,y:14,w:170,name:"Strategy",st:"interface",m:["+ execute()"]},
  {id:"ca",x:40,y:180,w:160,name:"ConcreteStrategyA",m:["+ execute()"]},{id:"cb",x:220,y:180,w:160,name:"ConcreteStrategyB",m:["+ execute()"]},
  {id:"cc",x:400,y:180,w:160,name:"ConcreteStrategyC",m:["+ execute()"]}],
 edges:[["e1","cl","cx"],["e2","cx","si","has"],["e3","ca","si","impl"],["e4","cb","si","impl"],["e5","cc","si","impl"]],
 steps:[
 {t:"Strategy: the interface",d:"<b>Strategy</b> declares the one job every variant can do (<code>execute()</code>). It is usually an interface, often with a single method.",cur:["si"],hide:["e1","e2","e3","e4","e5"],dim:["cl","cx","ca","cb","cc"]},
 {t:"ConcreteStrategy: one class per variant",d:"Each <b>ConcreteStrategy</b> implements the interface in its own way. They are interchangeable: any of them can stand where a <code>Strategy</code> is expected.",on:["ca","cb","cc"],good:["si"],lines:["e3","e4","e5"],hide:["e1","e2"],dim:["cl","cx"]},
 {t:"Context: has a Strategy and delegates to it",d:"<b>Context</b> keeps a reference typed as the interface (the diamond = has-a) and forwards the varying work to it. It never names a concrete class.",cur:["cx"],on:["si"],lines:["e2"],hide:["e1"],dim:["cl"]},
 {t:"Client: picks one and hands it in",d:"The <b>Client</b> decides which strategy to use and gives it to the context (constructor, setter, or a framework such as Spring doing it for you). The choice is made <i>outside</i> the context.",cur:["cl"],on:["cx"],lines:["e1"]},
 {t:"The whole pattern",d:"Client → Context → Strategy ← ConcreteStrategies. To add a variant you add a class on the bottom row; nothing above it changes.",lines:"all"}]},
 {name:"Dealership",h:250,
 nodes:[["cl",10,20,140,"main()","the client"],
  {id:"co",x:190,y:10,w:200,name:"Checkout",f:["- discount: Discount"],m:["+ setDiscount(d)","+ total(price)","+ print(price)"]},
  {id:"di",x:425,y:14,w:170,name:"Discount",st:"interface",m:["+ apply(price): long","+ label(): String"]},
  {id:"nd",x:8,y:180,w:138,name:"NoDiscount",m:["+ apply(price)","+ label()"]},
  {id:"fd",x:154,y:180,w:138,name:"FestivalDiscount",m:["+ apply(price)","+ label()"]},
  {id:"ld",x:300,y:180,w:138,name:"LoyaltyDiscount",m:["+ apply(price)","+ label()"]},
  {id:"cd",x:446,y:180,w:146,name:"CorporateDiscount",m:["+ apply(price)","+ label()"]}],
 edges:[["e1","cl","co"],["e2","co","di","has"],["e3","nd","di","impl"],["e4","fd","di","impl"],["e5","ld","di","impl"],["e6","cd","di","impl"]],
 steps:[
 {t:"Strategy = Discount",d:"<code>Discount</code> is the Strategy: <code>apply(price)</code> and <code>label()</code>.",cur:["di"],hide:["e1","e2","e3","e4","e5","e6"],dim:["cl","co","nd","fd","ld","cd"]},
 {t:"ConcreteStrategies = the four offers",d:"<code>NoDiscount</code>, <code>FestivalDiscount</code>, <code>LoyaltyDiscount</code>, <code>CorporateDiscount</code>: one class per rule. A fifth offer is a fifth box here.",on:["nd","fd","ld","cd"],good:["di"],lines:["e3","e4","e5","e6"],hide:["e1","e2"],dim:["cl","co"]},
 {t:"Context = Checkout",d:"<code>Checkout</code> owns <code>private Discount discount</code>; <code>total</code> delegates to <code>discount.apply(price)</code>.",cur:["co"],on:["di"],lines:["e2"],hide:["e1"],dim:["cl"]},
 {t:"Client = main()",d:"<code>main</code> writes <code>new Checkout(new FestivalDiscount())</code> and later <code>setDiscount(new LoyaltyDiscount())</code>. In a Spring app the container would inject it instead (section 05, below).",cur:["cl"],on:["co"],lines:["e1"]},
 {t:"Read the diagram in one sentence",d:"\"Checkout has a Discount; each offer is a Discount; main decides which one Checkout gets.\" If you can say that, you can draw Strategy in an interview.",lines:"all"}]}]}
});

/* ---------- §3 Playground: pick the rule and the price; same arithmetic as StrategyAfter.java ---------- */
DPL.play({stgplay:{pill:"PLAYGROUND · PLUG IN A DISCOUNT",
 init:()=>({rule:"festival",price:"700000",swapTo:null,from:null}),
 controls:[{id:"rule",type:"select",label:"Discount rule",options:[["none","NoDiscount"],["festival","FestivalDiscount"],["loyalty","LoyaltyDiscount"],["corporate","CorporateDiscount"]]},
  {id:"price",type:"select",label:"Cart total",options:[["700000","Hatchback · Rs 700000"],["1250000","SUV · Rs 1250000"],["15000","Seat covers · Rs 15000"]]},
  {id:"swap",type:"button",label:"Swap to the next rule ▶"}],
 act:(s,id)=>{if(id!=="swap")return;const order=["none","festival","loyalty","corporate"];s.from=s.rule;s.rule=order[(order.indexOf(s.rule)+1)%4];s.swapTo=s.rule;},
 render:s=>{
  const R={none:["NoDiscount","nd","No discount",p=>p],festival:["FestivalDiscount","fd","Festival 10%",p=>Math.floor(p*90/100)],
   loyalty:["LoyaltyDiscount","ld","Loyalty Rs 20000",p=>Math.max(0,p-20000)],corporate:["CorporateDiscount","cd","Corporate 15%",p=>Math.floor(p*85/100)]};
  const r=R[s.rule]||R.none,p=+s.price,total=r[3](p),ids=["nd","fd","ld","cd"],edge={nd:"i0",fd:"i1",ld:"i2",cd:"i3"};
  const swapped=s.swapTo===s.rule&&s.from&&R[s.from];
  const log=swapped?["Checkout checkout = new Checkout(new "+R[s.from][0]+"());","checkout.setDiscount(new "+r[0]+"());   // swapped at run time","checkout.print("+p+");"]
   :["Checkout checkout = new Checkout(new "+r[0]+"());","checkout.print("+p+");"];
  return {h:250,alt:"Checkout holding a "+r[0]+"; output "+r[2]+": Rs "+total,
   nodes:[["main",10,20,140,"main()","print("+p+")"],
    {id:"co",x:190,y:10,w:200,name:"Checkout",f:["- discount: Discount"],m:["+ setDiscount(d)","+ total(price)","+ print(price)"]},
    {id:"di",x:425,y:14,w:170,name:"Discount",st:"interface",m:["+ apply(price): long","+ label(): String"]},
    {id:"nd",x:8,y:180,w:138,name:"NoDiscount",m:["+ apply(price)","+ label()"]},
    {id:"fd",x:154,y:180,w:138,name:"FestivalDiscount",m:["+ apply(price)","+ label()"]},
    {id:"ld",x:300,y:180,w:138,name:"LoyaltyDiscount",m:["+ apply(price)","+ label()"]},
    {id:"cd",x:446,y:180,w:146,name:"CorporateDiscount",m:["+ apply(price)","+ label()"]}],
   edges:[["m1","main","co"],["h1","co","di","has"],["i0","nd","di","impl"],["i1","fd","di","impl"],["i2","ld","di","impl"],["i3","cd","di","impl"]],
   on:["main","co"],good:[r[1]],dim:ids.filter(i=>i!==r[1]),lines:["m1","h1",edge[r[1]]],
   log:log.concat(["// output:"]),out:r[2]+": Rs "+total};
 }}});
