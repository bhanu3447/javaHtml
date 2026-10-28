/* P03 State labs: data only (plus the Playground's small pure functions), drawn by the kit in labs-patterns.js.
   Hosts: #dp-stapain (Pain: the status switch grows), #dp-staref (Refactor: switches → state classes), #dp-starun (Runtime: sequence of
   ORD-2 pay / deliver / cancel), #dp-stauml (Structure: Roles / Dealership / States), #dpp-staplay (Playground: drive one order).
   Class names and outputs come from OrderBefore.java / OrderAfter.java, run on JDK 25 (kb/patterns-03-state.md).
   Wrapped in an IIFE: classic scripts share one global scope, so this file adds no top-level names. */
"use strict";
(function(){

/* ---------- shared layout for the order's state diagram (Structure "States" view and the Playground) ---------- */
const SNODES=[["Booked",10,40,100,"Booked","start"],["Paid",165,40,100,"Paid","money in"],["Allocated",320,40,100,"Allocated","car reserved"],
  ["Delivered",475,40,110,"Delivered","final"],["Cancelled",245,150,110,"Cancelled","final"]];
const SEDGES=[["t1","Booked","Paid","calls",0,"pay"],["t2","Paid","Allocated","calls",0,"allocate"],["t3","Allocated","Delivered","calls",0,"deliver"],
  ["c1","Booked","Cancelled","calls",0,"cancel"],["c2","Paid","Cancelled","calls",0,"cancel"],["c3","Allocated","Cancelled","calls",0,"cancel"]];

/* ---------- Refactor / Dealership class boxes (names = OrderAfter.java) ---------- */
const ORDM=["+ pay()","+ allocate()","+ deliver()","+ cancel()","~ moveTo(next, note)"];
const OSTM=["+ name(): String","+ pay(Order)","+ allocate(Order)","+ deliver(Order)","+ cancel(Order)"];
function states(y){return [{id:"bk",x:8,y,w:112,name:"Booked",m:["+ name()","+ pay(o)","+ cancel(o)"]},{id:"pd",x:126,y,w:112,name:"Paid",m:["+ name()","+ allocate(o)","+ cancel(o)"]},
  {id:"al",x:244,y,w:112,name:"Allocated",m:["+ name()","+ deliver(o)","+ cancel(o)"]},{id:"dv",x:362,y,w:112,name:"Delivered",m:["+ name()"]},{id:"cn",x:480,y,w:112,name:"Cancelled",m:["+ name()"]}];}
const IMPL=[["ib","bk","ost","impl"],["ip","pd","ost","impl"],["ia","al","ost","impl"],["id","dv","ost","impl"],["ic","cn","ost","impl"]];

const C_BEFORE=`class Order {
    private String status = "Booked";

    void pay() {
        switch (status) {
            case "Booked" -> moveTo("Paid", "Rs " + price + " received");
            default -> reject("pay");
        }
    }
    void allocate() { /* switch: "Paid" -> "Allocated", else reject */ }
    void deliver()  { /* switch: "Allocated" -> "Delivered", else reject */ }
    void cancel()   { /* switch: "Booked", "Paid", "Allocated" -> "Cancelled" */ }
}`;
const C_IFACE=`interface OrderState {
    String name();
    default void pay(Order o)      { o.reject("pay"); }
    default void allocate(Order o) { o.reject("allocate"); }
    default void deliver(Order o)  { o.reject("deliver"); }
    default void cancel(Order o)   { o.reject("cancel"); }
}`;
const C_IFACE1=`interface OrderState { name() + four default methods that reject }`;
const C_BP=`class Booked implements OrderState {
    public String name() { return "Booked"; }
    public void pay(Order o)    { o.moveTo(new Paid(), "Rs " + o.price() + " received"); }
    public void cancel(Order o) { o.moveTo(new Cancelled(), "no refund needed"); }
}
class Paid implements OrderState {
    public String name() { return "Paid"; }
    public void allocate(Order o) { o.moveTo(new Allocated(), "chassis reserved"); }
    public void cancel(Order o)   { o.moveTo(new Cancelled(), "refund Rs " + o.price()); }
}`;
const C_BP1=`class Booked, class Paid { … as in step 3 … }`;
const C_ADC=`class Allocated implements OrderState {
    public String name() { return "Allocated"; }
    public void deliver(Order o) { o.moveTo(new Delivered(), "keys handed over"); }
    public void cancel(Order o)  { o.moveTo(new Cancelled(), "refund Rs " + o.price()); }
}
class Delivered implements OrderState { public String name() { return "Delivered"; } }
class Cancelled implements OrderState { public String name() { return "Cancelled"; } }`;
const C_ADC1=`class Allocated, class Delivered, class Cancelled { … as in step 4 … }`;
const C_OLD1=`class Order { … the four switches, unchanged for now … }`;
const C_DELEG=`class Order {
    private String status = "Booked";
    private OrderState state = new Booked();

    void pay()      { switch (status) { … } }
    void pay()      { state.pay(this); }
    void allocate() { switch (status) { … } }
    void allocate() { state.allocate(this); }
    void deliver()  { switch (status) { … } }
    void deliver()  { state.deliver(this); }
    void cancel()   { switch (status) { … } }
    void cancel()   { state.cancel(this); }
}`;
const C_MOVE=`class Order {
    private OrderState state = new Booked();

    void pay()      { state.pay(this); }
    void allocate() { state.allocate(this); }
    void deliver()  { state.deliver(this); }
    void cancel()   { state.cancel(this); }

    void moveTo(String next, String note) { … status = next; }
    void moveTo(OrderState next, String note) {
        System.out.println(id + ": " + state.name() + " -> " + next.name() + " (" + note + ")");
        state = next;
    }
    void reject(String action) {
        System.out.println(id + ": cannot " + action + " an order that is " + state.name());
    }
}`;
const C_FINAL=`Order a = new Order("ORD-1", 700000);
a.pay();       // ORD-1: Booked -> Paid (Rs 700000 received)
a.allocate();  // ORD-1: Paid -> Allocated (chassis reserved)
a.deliver();   // ORD-1: Allocated -> Delivered (keys handed over)
a.cancel();    // ORD-1: cannot cancel an order that is Delivered

Order b = new Order("ORD-2", 900000);
b.pay();       // ORD-2: Booked -> Paid (Rs 900000 received)
b.deliver();   // ORD-2: cannot deliver an order that is Paid
b.cancel();    // ORD-2: Paid -> Cancelled (refund Rs 900000)`;

const C_RUN=`Order b = new Order("ORD-2", 900000);
b.pay();       // ORD-2: Booked -> Paid (Rs 900000 received)
b.deliver();   // ORD-2: cannot deliver an order that is Paid
b.cancel();    // ORD-2: Paid -> Cancelled (refund Rs 900000)

class Order {
    private OrderState state = new Booked();
    void pay()      { state.pay(this); }
    void deliver()  { state.deliver(this); }
    void cancel()   { state.cancel(this); }
    void moveTo(OrderState next, String note) {
        System.out.println(id + ": " + state.name() + " -> " + next.name() + " (" + note + ")");
        state = next;
    }
    void reject(String action) {
        System.out.println(id + ": cannot " + action + " an order that is " + state.name());
    }
}
class Booked implements OrderState {
    public void pay(Order o)    { o.moveTo(new Paid(), "Rs " + o.price() + " received"); }
}
class Paid implements OrderState {          // no deliver(): the default below runs
    public void cancel(Order o)   { o.moveTo(new Cancelled(), "refund Rs " + o.price()); }
}
interface OrderState {
    default void deliver(Order o)  { o.reject("deliver"); }
}`;

const ALL_HIDE=["ost","bk","pd","al","dv","cn","ord","h1","ib","ip","ia","id","ic"];
const without=(arr,keep)=>arr.filter(x=>!keep.includes(x));
const MET="Order methods that switch on the status";

DPL.add({

/* ---------- §1 Pain: the status String and its switches ---------- */
stapain:{pill:"PAIN LAB · ONE STATUS STRING, MORE AND MORE SWITCHES",views:[{name:"Naive Order",h:300,
 alt:"The naive Order: a status String and one switch per action, growing with every change request",
 nodes:[["cli",10,20,170,"Sales desk","the client",46],["ord",10,124,170,"Order","status: String",46],
  ["pay",240,10,350,"pay()","switch: Booked → Paid",44],["del",240,66,350,"deliver()","switch: Paid → Delivered",44],
  ["can",240,122,350,"cancel()","switch: Booked, Paid (refund), else reject",44],["alo",240,178,350,"allocate()","switch: Paid → Allocated",44],
  ["scr",10,230,170,"Screens, reports","switch on status too",46],["bug",240,240,350,"status = \"Payed\"","compiles; wrong only at run time",44]],
 edges:[["e0","cli","ord","calls",0,"pay()…"],["e1","ord","pay","calls",0,"","h"],["e2","ord","del","calls",0,"","h"],["e3","ord","can","calls",0,"","h"],["e4","ord","alo","calls",0,"","h"],["e5","scr","ord","calls",0,"reads status"]],
 steps:[
 {t:"Day 1: a car order that can be paid and delivered",d:"The <b>client</b> is the code that uses an object; here the sales desk. It asks one <code>Order</code> to <code>pay()</code> or <code>deliver()</code>. The order remembers where it is in a <code>String status</code> (\"Booked\", \"Paid\", \"Delivered\"), and each method is a <b>switch</b> on that string: <code>pay()</code> only works when the status is Booked. Two methods, two switches: still easy.",
  hide:["can","alo","scr","bug","e3","e4","e5"],on:["ord"],cur:["pay","del"],lines:["e0","e1","e2"],meter:["switches to edit when the statuses change",2,6],note:"each arrow = a method of Order; each box = the switch inside it"},
 {t:"Change request 1: customers may cancel",d:"Cancelling is allowed while the order is Booked (nothing to refund) or Paid (refund the money), but <b>not</b> after delivery. That is a third switch, and it has to know <b>every</b> status, including the ones where cancelling is not allowed.",
  hide:["alo","scr","bug","e4","e5"],on:["ord"],good:["can"],lines:["e3"],meter:["switches to edit when the statuses change",3,6],note:"a new action = a new switch over every status"},
 {t:"Change request 2: \"Allocated\" between Paid and Delivered",d:"The dealership now reserves a chassis before delivery. One new status, but look what moves: a new <code>allocate()</code> switch, <code>deliver()</code> must now expect Allocated instead of Paid, and <code>cancel()</code> must refund from Allocated too. <b>Red boxes are tested code you had to open again.</b>",
  hide:["scr","bug","e5"],on:["ord"],good:["alo"],bad:["del","can"],lines:["e2","e3","e4"],txt:{del:["deliver()","switch: Allocated → Delivered (edited)"],can:["cancel()","switch: Booked, Paid, Allocated (edited)"]},meter:["switches to edit when the statuses change",4,6],note:"one new status → three methods touched"},
 {t:"The status leaks out",d:"The order screen shows a Pay button only when the status is Booked; the daily report counts \"Paid\" orders. They switch on the same string, so every status change also edits code <b>outside</b> <code>Order</code>.",
  hide:["bug"],on:["ord"],bad:["scr","del","can"],lines:["e5"],txt:{del:["deliver()","switch: Allocated → Delivered"],can:["cancel()","switch: Booked, Paid, Allocated"]},meter:["switches to edit when the statuses change",6,6],note:"the rules are copied wherever the string is read"},
 {t:"A typo compiles",d:"<code>status = \"Payed\"</code> is a perfectly valid String. The compiler cannot tell you that no switch has a case for it; you find out when a customer's order is stuck and every action is rejected.",
  on:["ord"],bad:["bug"],lines:[],txt:{del:["deliver()","switch: Allocated → Delivered"],can:["cancel()","switch: Booked, Paid, Allocated"]},meter:["switches to edit when the statuses change",6,6],note:"stringly-typed status: errors move from compile time to run time"},
 {t:"Where are the rules of \"Paid\"?",d:"Ask \"what can a Paid order do?\" and you must read <b>four</b> methods: pay (rejects), allocate (moves on), deliver (rejects), cancel (refunds). The rules of one status are scattered; the rules of one action are bundled. The State pattern flips that: <b>one class per status</b>, holding all of that status's rules.",
  on:["pay","alo","del","can"],cur:["ord"],lines:["e1","e2","e3","e4"],txt:{pay:["pay()","Paid → reject"],alo:["allocate()","Paid → Allocated"],del:["deliver()","Paid → reject"],can:["cancel()","Paid → Cancelled + refund"]},meter:["switches to edit when the statuses change",6,6],note:"one status = four places to read"}
 ]}]},

/* ---------- §2 Refactor: switches → one class per state ---------- */
staref:{pill:"REFACTOR LAB · SWITCHES → STATE OBJECTS",views:[{name:"Refactor",h:300,
 alt:"Refactoring the Order: an OrderState interface, one class per status, and an Order that delegates",
 nodes:[{id:"old",x:20,y:20,w:210,name:"Order",f:["- status: String"],m:["+ pay()","+ allocate()","+ deliver()","+ cancel()"]},
  {id:"ord",x:20,y:20,w:210,name:"Order",f:["- state: OrderState"],m:ORDM},
  {id:"ost",x:320,y:20,w:260,name:"OrderState",st:"interface",m:OSTM}].concat(states(200)),
 edges:[["h1","ord","ost","has",0,"state"]].concat(IMPL),
 steps:[
 {t:"Start: four methods, four switches",d:"This is the Before code, shortened. Every method of <code>Order</code> asks \"which status am I in?\" and branches. We will move each status's rules into its own class, in small steps, running the program after each one.",
  code:C_BEFORE,marks:["switch (status)","String status"],hide:ALL_HIDE,cur:["old"],meter:[MET,4,4]},
 {t:"Name the role: an OrderState interface",d:"One method per <b>action</b> (<code>pay</code>, <code>allocate</code>, <code>deliver</code>, <code>cancel</code>) plus <code>name()</code>. Each action is a <b>default method</b> that rejects. Why: most statuses forbid most actions, so \"not allowed\" is written <b>once</b>, here, and a status class only overrides what it allows. Each method receives the <code>Order</code> so a state can move it on.",
  code:C_IFACE+"\n\n"+C_OLD1,add:["interface OrderState","String name();","default void"],hide:without(ALL_HIDE,["ost"]),cur:["ost"],on:["old"],meter:[MET,4,4]},
 {t:"One class per status: Booked and Paid",d:"Move the Booked branches into <code>class Booked</code>: from Booked you may pay (go to Paid) or cancel (no refund). Paid may allocate or cancel with a refund. <b>The state decides the next state</b> and creates it; nothing else in the program needs to know the order of statuses.",
  code:C_IFACE1+"\n\n"+C_BP+"\n\n"+C_OLD1,add:["class Booked","class Paid","public String name()","public void"],hide:without(ALL_HIDE,["ost","bk","pd","ib","ip"]),cur:["bk","pd"],on:["ost"],lines:["ib","ip"],meter:[MET,4,4]},
 {t:"The rest: Allocated, Delivered, Cancelled",d:"Allocated may deliver or cancel. Delivered and Cancelled are <b>final</b>: their classes override nothing, so every action falls through to the interface's \"cannot …\" default. An illegal action needs no code at all.",
  code:C_IFACE1+"\n"+C_BP1+"\n\n"+C_ADC+"\n\n"+C_OLD1,add:["class Allocated","class Delivered","class Cancelled","public void deliver","public void cancel"],hide:without(ALL_HIDE,["ost","bk","pd","al","dv","cn","ib","ip","ia","id","ic"]),cur:["al","dv","cn"],on:["ost"],lines:["ia","id","ic"],meter:[MET,4,4]},
 {t:"The context delegates",d:"<code>Order</code> is now the <b>context</b>: the object the client talks to, which holds the current state. The <code>String</code> becomes a field of type <code>OrderState</code>, and each switch becomes one line: <code>state.pay(this)</code>. Java runs the <code>pay</code> of whichever class the field points to (dynamic dispatch, P00). <b>No switch left.</b>",
  code:C_DELEG,del:["String status","switch (status)"],add:["OrderState state","{ state."],hide:["old"],cur:["ord"],on:["ost"],lines:["h1"],meter:[MET,0,4]},
 {t:"States call back: moveTo and reject",d:"<code>moveTo(next, note)</code> now takes a state object, prints the line and swaps the field. <code>reject(action)</code> prints the error. <code>Order</code> records the change but never decides it: <b>transitions live in the states</b>. A new status is a new class plus one edit in the state that leads to it.",
  code:C_MOVE,del:["void moveTo(String next"],add:["void moveTo(OrderState next","state = next;"],hide:["old"],cur:["ord"],on:["bk","pd","al"],lines:["h1","ib","ip","ia"],meter:[MET,0,4]},
 {t:"Same output, new shape",d:"Run the After program below: it prints exactly the same seven lines as the Before program. Behaviour kept, structure changed: that is a refactor. Next time a status arrives, you add a class instead of editing four switches.",
  code:C_FINAL,marks:["// ORD-"],hide:["old"],on:["ord","ost","bk","pd","al","dv","cn"],lines:"all",meter:[MET,0,4]}
 ]}]},

/* ---------- §3 Runtime: ORD-2 pays, tries to deliver, cancels ---------- */
starun:{pill:"RUNTIME LAB · WHO CALLS WHOM",views:[{name:"Runtime",alt:"Sequence of calls for order ORD-2: pay, deliver (rejected), cancel",code:C_RUN,
 seq:{lanes:[["main","main","the client"],["ord","b","Order"],["bk","Booked","state 1"],["pd","Paid","state 2"],["cn","Cancelled","state 3"]],
  msgs:[["main","ord","new Order(…)","new"],["ord","bk","new Booked()","new"],
   ["main","ord","pay()"],["ord","bk","pay(this)"],["bk","pd","new Paid()","new"],["bk","ord","moveTo(paid, …)"],["ord","ord","println; state = paid","self"],
   ["main","ord","deliver()"],["ord","pd","deliver(this)"],["pd","ord","reject(\"deliver\")"],["ord","ord","println","self"],
   ["main","ord","cancel()"],["ord","pd","cancel(this)"],["pd","cn","new Cancelled()","new"],["pd","ord","moveTo(cancelled, …)"],["ord","ord","println; state = cancelled","self"]]},
 steps:[
 {t:"Create the order: it starts as Booked",d:"<code>main</code> (the client) creates order <code>b</code>. While <code>b</code> is being built, its field initializer runs <code>new Booked()</code>: every order starts with a Booked state object in its <code>state</code> field.",upto:2,cur:1,marks:["new Order(\"ORD-2\"","private OrderState state = new Booked()"]},
 {t:"b.pay() is passed to the current state",d:"<code>Order.pay()</code> has no switch: it calls <code>state.pay(this)</code>. The field points to a Booked object, so Java runs <b>Booked's</b> <code>pay</code>, and passes the order along so the state can change it.",upto:4,cur:3,marks:["b.pay();","void pay()      { state.pay(this); }","public void pay(Order o)"]},
 {t:"Booked decides: the next state is Paid",d:"Booked's <code>pay</code> creates the next state object, <code>new Paid()</code>, and hands it to <code>o.moveTo(…)</code> with a note: \"Rs 900000 received\". The decision \"after Booked comes Paid\" lives here, in Booked.",upto:6,cur:5,marks:["public void pay(Order o)","void moveTo(OrderState next"]},
 {t:"Order prints and swaps the field",d:"<code>moveTo</code> prints <code>ORD-2: Booked -> Paid (Rs 900000 received)</code>, the first output line, then sets <code>state = next</code>. From now on, every call goes to the Paid object; nothing points to the Booked object any more, so the garbage collector can free it.",upto:7,cur:6,marks:["System.out.println(id + \": \" + state.name() + \" -> \"","state = next;"],note:"output: ORD-2: Booked -> Paid (Rs 900000 received)"},
 {t:"b.deliver(): Paid has no deliver()",d:"Same delegation: <code>state.deliver(this)</code>, and the state is now Paid. <code>Paid</code> does not override <code>deliver</code>, so the interface's <b>default</b> method runs. That is how the illegal action is handled: in one place, for every state that does not allow it.",upto:9,cur:8,marks:["b.deliver();","void deliver()  { state.deliver(this); }","default void deliver(Order o)"]},
 {t:"The default rejects",d:"The default calls <code>o.reject(\"deliver\")</code>, which prints <code>ORD-2: cannot deliver an order that is Paid</code>. The state did not change: no <code>moveTo</code> was called.",upto:11,cur:10,marks:["void reject(String action)","\": cannot \""],note:"output: ORD-2: cannot deliver an order that is Paid"},
 {t:"b.cancel() goes to Paid's cancel",d:"<code>Paid</code> does override <code>cancel</code>: a paid order may be cancelled, with a refund.",upto:13,cur:12,marks:["b.cancel();","void cancel()   { state.cancel(this); }","public void cancel(Order o)"]},
 {t:"Paid creates Cancelled and moves the order",d:"<code>new Cancelled()</code>, then <code>o.moveTo(cancelled, \"refund Rs 900000\")</code>. Paid knows that cancelling from Paid means a refund; Booked knew that cancelling from Booked does not.",upto:15,cur:14,marks:["public void cancel(Order o)","void moveTo(OrderState next"]},
 {t:"Third line printed; the order is final",d:"<code>ORD-2: Paid -> Cancelled (refund Rs 900000)</code>. The field now holds a Cancelled object, which overrides nothing, so any further action prints \"cannot …\". Three outputs, and <code>Order</code> never once asked which status it was in.",upto:16,cur:15,marks:["b.cancel();","state = next;"],note:"output: ORD-2: Paid -> Cancelled (refund Rs 900000)"}
 ]}]},

/* ---------- §5 Structure: Roles / Dealership / States ---------- */
stauml:{pill:"STRUCTURE LAB · THE STATE PATTERN",views:[
 {name:"Roles",h:330,alt:"Generic State pattern: Client, Context, State interface, two concrete states",
 nodes:[["cli",20,10,200,"Client","calls the context",44],
  {id:"ctx",x:20,y:90,w:200,name:"Context",f:["- state: State"],m:["+ request()","~ changeState(next)"]},
  {id:"st",x:340,y:90,w:240,name:"State",st:"interface",m:["+ handle(Context)"]},
  {id:"sa",x:270,y:240,w:150,name:"ConcreteStateA",m:["+ handle(Context)"]},{id:"sb",x:440,y:240,w:150,name:"ConcreteStateB",m:["+ handle(Context)"]}],
 edges:[["e0","cli","ctx","calls",0,"request()"],["h1","ctx","st","has",0,"state"],["i1","sa","st","impl"],["i2","sb","st","impl"],["c1","sa","ctx","calls",30,"changeState(B)"]],
 steps:[
 {t:"Client: talks to the context only",d:"The <b>client</b> is whatever code uses the object: a <code>main</code>, a controller, a scheduled job. It calls <code>request()</code> and never sees a state object.",cur:["cli"],on:["ctx"],lines:["e0"]},
 {t:"Context: the object whose behaviour changes",d:"The <b>context</b> keeps a reference to its current state (has-a, the diamond) and forwards every request to it: <code>state.handle(this)</code>. It passes itself so the state can change it.",cur:["ctx"],on:["st"],lines:["h1"]},
 {t:"State: one method per request",d:"The <b>State</b> interface lists what can be asked in any state. Default methods (or an abstract base class) can hold the shared \"not allowed\" answer.",cur:["st"],lines:[]},
 {t:"Concrete states: one class per state",d:"Each <b>ConcreteState</b> implements the requests for its own state: what happens, and which state comes next. Adding a state = adding a class (Open / Closed, P00).",cur:["sa","sb"],on:["st"],lines:["i1","i2"]},
 {t:"The transition: a state replaces itself",d:"After handling a request, ConcreteStateA may call <code>changeState(B)</code> on the context. This arrow is what separates State from Strategy: <b>the states change the context's state</b>, the client does not choose it.",cur:["sa"],on:["ctx","sb"],lines:["c1"]}]},
 {name:"Dealership",h:355,alt:"The dealership's State classes: Order, OrderState and five states",
 nodes:[["cli",20,6,210,"main() · sales desk","the client",40],
  {id:"ord",x:20,y:90,w:210,name:"Order",f:["- state: OrderState"],m:ORDM},
  {id:"ost",x:320,y:90,w:260,name:"OrderState",st:"interface",m:OSTM}].concat(states(265)),
 edges:[["e0","cli","ord","calls",0,"pay(), cancel()…"],["h1","ord","ost","has",0,"state"]].concat(IMPL),
 steps:[
 {t:"Client: main() or a controller",d:"It calls <code>pay()</code>, <code>allocate()</code>, <code>deliver()</code>, <code>cancel()</code> on an <code>Order</code>, and never names a state class.",cur:["cli"],on:["ord"],lines:["e0"]},
 {t:"Context: Order",d:"Holds <code>state</code> (an <code>OrderState</code>) and delegates every action to it. <code>moveTo</code> and <code>reject</code> are the two call-backs the states use.",cur:["ord"],on:["ost"],lines:["h1"]},
 {t:"State: OrderState",d:"One method per action, each a default that rejects, plus <code>name()</code> for printing and storing.",cur:["ost"],lines:[]},
 {t:"Concrete states: five classes",d:"Booked, Paid and Allocated override the actions they allow; Delivered and Cancelled override none, so they are final.",cur:["bk","pd","al","dv","cn"],on:["ost"],lines:["ib","ip","ia","id","ic"]},
 {t:"The whole design",d:"Read it aloud: \"main uses an Order; the Order has an OrderState; five classes are OrderStates, and they move the Order from one to the next.\"",on:["cli","ord","ost","bk","pd","al","dv","cn"],lines:"all"}]},
 {name:"States",h:210,alt:"State diagram of a car order: Booked, Paid, Allocated, Delivered, Cancelled",
 nodes:SNODES,edges:SEDGES,
 steps:[
 {t:"A state diagram: boxes are states, arrows are actions",d:"This is not a class diagram. Each box is a <b>state</b> the order can be in; each arrow is an <b>action</b> that moves it to another state. Every arrow here is one overridden method in the code.",lines:[],note:"read: in state X, action → state Y"},
 {t:"The happy path",d:"pay → allocate → deliver. Each arrow is written in the class it starts from: <code>Booked.pay</code>, <code>Paid.allocate</code>, <code>Allocated.deliver</code>.",cur:["Booked","Paid","Allocated","Delivered"],lines:["t1","t2","t3"]},
 {t:"Cancel: three arrows, three different rules",d:"From Booked: no refund. From Paid or Allocated: refund the price. The rule sits next to the state it belongs to.",cur:["Cancelled"],on:["Booked","Paid","Allocated"],lines:["c1","c2","c3"]},
 {t:"No arrow = not allowed",d:"There is no \"deliver\" arrow out of Paid and no arrow at all out of Delivered or Cancelled. In the code, a missing arrow is a method the class does not override: the default rejects it.",bad:["Delivered","Cancelled"],lines:[],note:"final states: no way out"}]}
]}

});

/* ---------- §3 Playground: drive one order; output = what OrderAfter.java prints ---------- */
const NEXT={Booked:{pay:["Paid",p=>"Rs "+p+" received"],cancel:["Cancelled",()=>"no refund needed"]},
  Paid:{allocate:["Allocated",()=>"chassis reserved"],cancel:["Cancelled",p=>"refund Rs "+p]},
  Allocated:{deliver:["Delivered",()=>"keys handed over"],cancel:["Cancelled",p=>"refund Rs "+p]},Delivered:{},Cancelled:{}};
const EDGE={"Booked:pay":"t1","Paid:allocate":"t2","Allocated:deliver":"t3","Booked:cancel":"c1","Paid:cancel":"c2","Allocated:cancel":"c3"};
DPL.play({staplay:{pill:"DRIVE ORDER ORD-1 (Rs 700000)",
 init:()=>({st:"Booked",log:[],edge:null,bad:false}),
 controls:[{id:"pay",type:"button",label:"Pay"},{id:"allocate",type:"button",label:"Allocate"},{id:"deliver",type:"button",label:"Deliver"},{id:"cancel",type:"button",label:"Cancel"}],
 act:(s,id)=>{const t=NEXT[s.st][id],call=("order."+id+"();").padEnd(17)+"// ";
   if(t){s.log.push(call+"ORD-1: "+s.st+" -> "+t[0]+" ("+t[1](700000)+")");s.edge=EDGE[s.st+":"+id];s.st=t[0];s.bad=false;}
   else{s.log.push(call+"ORD-1: cannot "+id+" an order that is "+s.st);s.edge=null;s.bad=true;}
   if(s.log.length>8)s.log.shift();},
 render:s=>{const allowed=Object.keys(NEXT[s.st]);
   return {h:210,nodes:SNODES,edges:SEDGES,cur:s.bad?[]:[s.st],bad:s.bad?[s.st]:[],lines:s.edge?[s.edge]:undefined,
    alt:"State diagram; the order is now "+s.st,log:s.log.length?s.log:["Order order = new Order(\"ORD-1\", 700000);   // starts Booked"],
    out:"state = "+s.st+(allowed.length?" · allowed now: "+allowed.join(", "):" · final: every action is rejected")};}}});

})();
