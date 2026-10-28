/* P05 labs (Builder): data only, drawn by the kit in labs-patterns.js (DPL.add / DPL.play). Hosts: #dp-bldpain (telescoping constructors,
   then JavaBeans setters, as the dealership adds options), #dp-bldref (refactor: telescoping/setters → Effective Java Builder, add / del /
   meter), #dp-bldrun (sequence view of new Car.Builder(..).trim(..).build()), #dpp-bldplay (playground: pick trim, colour, sunroof,
   warranty years, press build()), #dp-blduml (Roles / Dealership / GoF Director). Every class and method name comes from the P05
   programs, all run on JDK 25 (kb/patterns-05-builder.md). */
"use strict";
DPL.add({

/* ---------- §1 Pain lab: telescoping constructors, then setters ---------- */
bldpain:{pill:"PAIN LAB · TOO MANY CONSTRUCTORS",views:[{name:"Pain",h:300,
 nodes:[["main",5,5,100,"main()","the caller",275],
  {id:"c1",x:160,y:5,w:430,name:"Car",m:["+ Car(model, fuel)"]},
  {id:"c2",x:160,y:60,w:430,name:"Car",m:["+ Car(model, fuel, colour)"]},
  {id:"c3",x:160,y:115,w:430,name:"Car",m:["+ Car(model, fuel, colour, sunroof, alloyWheels)"]},
  {id:"c4",x:160,y:170,w:430,name:"Car",m:["+ Car(model, fuel, colour, sunroof, alloyWheels, gps, years)"]},
  {id:"bn",x:160,y:230,w:430,name:"CarBean",m:["+ setModel(model)","+ setColour(colour)"]}],
 edges:[["a1","main","c1","calls",0,"","h"],["a2","main","c2","calls",0,"","h"],["a3","main","c3","calls",0,"","h"],["a4","main","c4","calls",0,"","h"],["a5","main","bn","calls",0,"","h"]],
 steps:[
 {t:"Day 1: a car needs a model and a fuel",d:`Each box on the right is a <b>constructor</b>: the special method that builds an object (<code>new Car(...)</code>). The arrow means "calls". A <code>Car</code> needs only two things: a model and a fuel. One constructor, one clear call. Nothing hurts yet.`,
  code:`class Car {
    Car(String model, String fuel) { ... }
}

Car a = new Car("Nexon", "EV");`,marks:["new Car("],hide:["c2","c3","c4","bn","a2","a3","a4","a5"],lines:["a1"],meter:["constructors to keep in step",1,5],note:"1 constructor"},
 {t:"Request 1: the customer picks a colour",d:`Sales wants the colour on the order. The old <code>new Car("Nexon","EV")</code> calls are all over the code, so we keep that constructor and add a second one. Java lets a class have several constructors with different parameter lists ("overloading").`,
  code:`Car(String model, String fuel) { ... }
Car(String model, String fuel, String colour) { ... }   // new`,add:["Car(String model, String fuel, String colour)"],hide:["c3","c4","bn","a3","a4","a5"],on:["c2"],lines:["a1","a2"],meter:["constructors to keep in step",2,5],note:"2 constructors"},
 {t:"Request 2: sunroof and alloy wheels",d:`Two yes / no options arrive, so a third constructor takes two <code>boolean</code> values. A <code>boolean</code> is a true / false value. The call now reads <code>new Car("Nexon","EV","Red",true,false)</code>: nothing on that line says which <code>true</code> is the sunroof.`,
  code:`Car(String model, String fuel, String colour, boolean sunroof, boolean alloyWheels) { ... }   // new

Car b = new Car("Nexon", "EV", "Red", true, false);   // which is which?`,add:["boolean sunroof, boolean alloyWheels","new Car(\"Nexon\", \"EV\", \"Red\", true, false)"],hide:["c4","bn","a4","a5"],on:["c3"],lines:["a1","a2","a3"],meter:["constructors to keep in step",3,5],note:"3 constructors, 2 mystery booleans"},
 {t:"Request 3: GPS and an extended warranty",d:`Now seven parameters. Say a customer wants GPS but no sunroof and no alloys: the call must still spell out every value before it, in the right order. Swapping two <code>boolean</code>s still <b>compiles</b>: the car is built with the wrong options and nobody notices until delivery. This is the <b>telescoping constructor</b> problem: constructors that keep growing like a telescope.`,
  code:`Car(String model, String fuel, String colour, boolean sunroof, boolean alloyWheels,
    boolean gps, int warrantyYears) { ... }   // new

new Car("Nexon", "EV", "Red", true, false, true, 3);    // sunroof, gps
new Car("Nexon", "EV", "Red", false, true, true, 3);    // alloys, gps: compiles too`,add:["boolean gps, int warrantyYears","new Car(\"Nexon\", \"EV\", \"Red\", true, false, true, 3)","new Car(\"Nexon\", \"EV\", \"Red\", false, true, true, 3)"],hide:["bn","a5"],on:["c4"],bad:["c4"],lines:["a1","a2","a3","a4"],meter:["constructors to keep in step",4,5],note:"7 parameters, easy to swap"},
 {t:"The usual fix: JavaBeans setters",d:`To avoid long lists, many people write a plain constructor with <b>no arguments</b> and one <b>setter</b> (a method like <code>setColour</code> that changes one field) per option: the "JavaBeans" style. The call reads better, but the car is now <b>mutable</b> (changeable after it is made) and can be <b>half-built</b>: here the fuel was never set, so <code>describe()</code> prints <code>null</code>, and <code>setWarrantyYears(-4)</code> is accepted. Any other code holding the car can change it later, too.`,
  code:`CarBean c = new CarBean();
c.setModel("Tiago");
c.setColour("Blue");            // setFuel was never called
c.describe();                   // Tiago null Blue | ...
c.setWarrantyYears(-4);         // nothing checks this`,add:["CarBean c = new CarBean();","c.setModel(\"Tiago\");","c.setColour(\"Blue\");","c.setWarrantyYears(-4);"],hide:["c1","c2","c3","c4","a1","a2","a3","a4"],bad:["bn"],on:["bn"],lines:["a5"],meter:["ways to get an invalid car",3,3],note:"mutable, half-built, unchecked"},
 {t:"What we want",d:`Keep the readable, named calls of setters, and keep the safety of one constructor call: the car must be <b>complete, valid and unchangeable</b> the moment it exists. Collect the options somewhere else first, check them once, and only then make the car. That is the <b>Builder</b>. Section 02 builds it in small steps.`,
  hide:[],bad:["c4","bn"],lines:"all",meter:["ways to get an invalid car",3,3],note:"telescoping or setters: both hurt"}]}]},

/* ---------- §2 Refactor lab: telescoping / setters → Effective Java Builder ---------- */
bldref:{pill:"REFACTOR LAB · CONSTRUCTORS → BUILDER",views:[{name:"Refactor",h:250,
 nodes:[["main",10,110,110,"main()","the caller"],
  {id:"tel",x:430,y:10,w:160,name:"Car",m:["+ Car(model, fuel)","+ Car(… 7 params)"]},
  {id:"bean",x:150,y:170,w:200,name:"CarBean",m:["+ setModel(model)","+ setColour(colour)","+ setWarrantyYears(years)"]},
  {id:"bld",x:150,y:10,w:230,name:"Car.Builder",f:["- model, fuel: required","- trim, colour, …: optional"],m:["+ trim(trim): Builder","+ colour(colour): Builder","+ build(): Car"]},
  {id:"car",x:430,y:10,w:160,name:"Car",f:["- final fields"],m:["- Car(Builder)","+ price(): long"]}],
 edges:[["o1","main","tel"],["o2","main","bean"],["b0","main","bld"],["b1","bld","car"]],
 steps:[
 {t:"Find what hurts",d:`Start with the painful code. Two ways to make a <code>Car</code> exist: a constructor with many parameters, and an empty <code>CarBean</code> with setters. The first is unreadable and easy to get wrong; the second lets a half-built, changeable car exist. <b>What we want:</b> named options, all checked, and a car that cannot change after it is made.`,
  code:`new Car("Nexon", "EV", "Red", true, false, true, 3);   // which boolean is which?

CarBean c = new CarBean();      // no fuel yet: half-built
c.setModel("Tiago");
c.setWarrantyYears(-4);         // accepted, then anyone can change it again`,marks:["new Car(","CarBean c"],hide:["bld","car","b0","b1"],bad:["tel","bean"],lines:["o1","o2"],meter:["public constructors with long parameter lists",4,4],note:"telescoping + setters"},
 {t:"A helper object collects the options",d:`Add a small class <b>inside</b> <code>Car</code> (a <b>static nested class</b>, written <code>Car.Builder</code>) whose only job is to hold the options while the order is being filled in. The two <b>required</b> things, model and fuel, go in its constructor, so you cannot even start without them. Everything optional gets a default value. This is the order form at the dealership.`,
  code:`final class Car {
    static class Builder {
        private final String model, fuel;                   // required
        private String trim = "Base", colour = "White";     // optional: defaults
        private boolean sunroof, alloyWheels, gps;
        private int warrantyYears;

        Builder(String model, String fuel) { this.model = model; this.fuel = fuel; }
    }
}`,add:["static class Builder","private final String model, fuel;","private String trim = \"Base\", colour = \"White\";","private boolean sunroof, alloyWheels, gps;","private int warrantyYears;","Builder(String model, String fuel)"],hide:["car","b1","bean","o1","o2"],dim:["tel"],good:["bld"],on:["main"],lines:["b0"],meter:["public constructors with long parameter lists",4,4],note:"Builder: required in the constructor"},
 {t:"Fluent setters that return this",d:`Give the builder one method per option. Each <b>sets the option and returns <code>this</code></b> (the builder itself), so calls chain in one readable line: <code>.colour("Red").sunroof(true)</code>. This is called a <b>fluent interface</b>. The method name says which option you mean, so the "which boolean?" problem is gone.`,
  code:`        Builder trim(String trim) { this.trim = trim; return this; }
        Builder colour(String colour) { this.colour = colour; return this; }
        Builder sunroof(boolean on) { this.sunroof = on; return this; }
        Builder alloyWheels(boolean on) { this.alloyWheels = on; return this; }
        Builder gps(boolean on) { this.gps = on; return this; }
        Builder warrantyYears(int years) { this.warrantyYears = years; return this; }`,add:["Builder trim(","Builder colour(","Builder sunroof(","Builder alloyWheels(","Builder gps(","Builder warrantyYears("],hide:["car","b1","bean","o1","o2"],dim:["tel"],good:["bld"],on:["main"],lines:["b0"],meter:["public constructors with long parameter lists",4,4],note:"named options, chainable"},
 {t:"Car gets one private constructor and final fields",d:`Now the car itself. Delete the telescoping constructors and the setters. <code>Car</code> gets <b>one constructor, marked <code>private</code></b>, that copies the values from the builder into <b>final</b> fields (a <code>final</code> field can be set once and never changed). Only <code>Car.Builder</code> can reach a private constructor of the class it sits in, so <b>the builder is now the only way to make a car</b>, and the car is <b>immutable</b>.`,
  code:`final class Car {
    private final String model, fuel, trim, colour;
    private final boolean sunroof, alloyWheels, gps;
    private final int warrantyYears;

    private Car(Builder b) {                       // private: only Car.Builder can call it
        this.model = b.model; this.fuel = b.fuel; this.trim = b.trim; this.colour = b.colour;
        this.sunroof = b.sunroof; this.alloyWheels = b.alloyWheels; this.gps = b.gps;
        this.warrantyYears = b.warrantyYears;
    }
}`,add:["private final String model, fuel, trim, colour;","private final boolean sunroof, alloyWheels, gps;","private final int warrantyYears;","private Car(Builder b)","this.model = b.model;","this.sunroof = b.sunroof;","this.warrantyYears = b.warrantyYears;"],hide:["tel","bean","o1","o2"],good:["car"],on:["bld"],lines:["b1"],meter:["public constructors with long parameter lists",0,4],note:"one private constructor, final fields"},
 {t:"build() validates, then makes the car",d:`Add the finishing method. <code>build()</code> is where <b>all the rules live</b>: a sunroof is not allowed on the Base trim, and warranty years must be 0 to 5. If a rule fails it throws, so a car that breaks the rules <b>cannot exist</b>. If all is well it returns <code>new Car(this)</code>. The rules are checked once, in one place, after every option is known, so the order of the setter calls does not matter.`,
  code:`        Car build() {                                      // all checks in one place
            if (sunroof && trim.equals("Base"))
                throw new IllegalStateException("Sunroof is not available on the Base trim");
            if (warrantyYears < 0 || warrantyYears > 5)
                throw new IllegalStateException("Warranty years must be 0 to 5, got " + warrantyYears);
            return new Car(this);
        }`,add:["Car build()","if (sunroof && trim.equals(\"Base\"))","throw new IllegalStateException(\"Sunroof","if (warrantyYears < 0","throw new IllegalStateException(\"Warranty","return new Car(this);"],hide:["tel","bean","o1","o2"],good:["bld","car"],lines:["b1"],meter:["ways to get an invalid car",0,3],note:"invalid cars cannot be built"},
 {t:"The caller reads like an order form",d:`The caller now writes one chain: start the builder with the required values, name each option, finish with <code>build()</code>. The first line of the chain is the whole order; the options you skip keep their defaults, and <code>new Car.Builder("Tiago","Petrol").build()</code> is a valid plain car. Compare this with the seven-parameter call from the start.`,
  code:`Car nexon = new Car.Builder("Nexon", "EV")          // required: model and fuel
    .trim("Top").colour("Red").sunroof(true).gps(true).warrantyYears(3)
    .build();                                      // validates, then returns the finished car

Car base = new Car.Builder("Tiago", "Petrol").build();   // every option has a default`,add:["new Car.Builder(\"Nexon\", \"EV\")",".trim(\"Top\")",".build();","new Car.Builder(\"Tiago\", \"Petrol\").build()"],hide:["tel","bean","o1","o2"],on:["main"],good:["bld","car"],lines:"all",meter:["ways to get an invalid car",0,3],note:"readable and safe"},
 {t:"A new option is two small edits",d:`The dealership adds seat covers. Add one field and one fluent method to the <b>builder</b>, and one field to <code>Car</code>. No existing call is touched, because every old chain simply keeps the default. With telescoping constructors this would have meant yet another constructor and a new argument in every caller that wanted it.`,
  code:`private boolean seatCovers;                         // in Car.Builder: optional, default false
Builder seatCovers(boolean on) { this.seatCovers = on; return this; }

new Car.Builder("Tiago", "Petrol").seatCovers(true).build();`,add:["private boolean seatCovers;","Builder seatCovers(boolean on)","seatCovers(true)"],hide:["tel","bean","o1","o2"],on:["bld"],good:["car"],lines:["b0","b1"],meter:["places that must change for a new option",2,4],note:"callers are not edited"}]}]},

/* ---------- §3 Runtime lab: sequence of new Car.Builder(...)...build() ---------- */
bldrun:{pill:"RUNTIME LAB · THE ORDER FORM BECOMES A CAR",views:[{name:"Runtime",alt:"Sequence diagram: main creates a Car.Builder, calls trim, colour and sunroof on it (each returns the builder), then calls build; build checks the rules and creates the Car, which copies the builder's fields; main then calls describe on the car",
 seq:{lanes:[["main","main()","the caller"],["bu","builder","Car.Builder"],["ca","car","Car"]],
  msgs:[["main","bu","new Car.Builder(\"Nexon\",\"EV\")","new"],["main","bu","trim(\"Top\")"],["bu","main","this","ret"],
   ["main","bu","colour(\"Red\")"],["bu","main","this","ret"],["main","bu","sunroof(true)"],["bu","main","this","ret"],
   ["main","bu","build()"],["bu","bu","check the two rules","self"],["bu","ca","new Car(this)","new"],["ca","bu","copy the fields","call"],
   ["bu","main","Car","ret"],["main","ca","describe()"],["ca","main","\"Nexon EV Top Red | … Rs 1860000\"","ret"]]},
 code:`Car nexon = new Car.Builder("Nexon", "EV")
    .trim("Top").colour("Red").sunroof(true)
    .build();
System.out.println(nexon.describe());

Builder trim(String trim) { this.trim = trim; return this; }

Car build() {
    if (sunroof && trim.equals("Base")) throw new IllegalStateException("...");
    if (warrantyYears < 0 || warrantyYears > 5) throw new IllegalStateException("...");
    return new Car(this);
}

private Car(Builder b) { this.model = b.model; this.trim = b.trim; /* ... */ }`,
 steps:[
 {t:"main starts the order form",d:`<code>new Car.Builder("Nexon","EV")</code> creates the <b>builder</b>, not a car. It stores the two required values and gives every option its default (trim Base, colour White, no extras). No <code>Car</code> exists yet: the third lane is still empty.`,upto:1,cur:0,marks:["new Car.Builder(\"Nexon\", \"EV\")"]},
 {t:"First option: trim",d:`<code>trim("Top")</code> stores the value in the builder and <b>returns the builder itself</b> (<code>return this</code>). The dashed arrow back to <code>main</code> is that return. Because the same builder comes back, the next call in the chain is made on it.`,upto:3,cur:2,marks:[".trim(\"Top\")","Builder trim(String trim)"]},
 {t:"More options, same pattern",d:`<code>colour("Red")</code> and <code>sunroof(true)</code> do exactly the same: store, return <code>this</code>. Nothing is checked yet. The builder is only <b>collecting</b> parts. Note that the sunroof is now on while the trim is Top: that is allowed. (Try it with Base in the playground below.)`,upto:7,cur:6,marks:[".colour(\"Red\")",".sunroof(true)"]},
 {t:"build() checks the rules",d:`<code>build()</code> is the only place with rules. The loop arrow is the builder checking itself: sunroof with trim Top passes, warranty 0 is inside 0 to 5. If a rule had failed, an <code>IllegalStateException</code> would be thrown here and <b>no car would ever be created</b>.`,upto:9,cur:8,marks:[".build();","if (sunroof && trim.equals(\"Base\"))","if (warrantyYears < 0"]},
 {t:"The car is made and sealed",d:`<code>new Car(this)</code> runs the <b>private</b> constructor, passing the builder. The car copies every value into its own <code>final</code> fields (the arrow back to the builder is it reading them). After this the car can never change, and the builder is no longer needed: it can be thrown away or reused for the next order.`,upto:11,cur:10,marks:["return new Car(this);","private Car(Builder b)"]},
 {t:"build() returns the finished Car",d:`<code>build()</code> hands the <code>Car</code> back to <code>main</code>. The whole order, from an empty form to a finished immutable car, was <b>one chain</b>.`,upto:12,cur:11,marks:["Car nexon = new Car.Builder"]},
 {t:"Using the car",d:`<code>describe()</code> reads the fields and builds the line <b>Nexon EV Top Red | sunroof=true alloy=false gps=false warranty=0y | Rs 1860000</b>. The price is the EV base 1650000 + Top trim 150000 + sunroof 60000.`,upto:14,cur:13,marks:["System.out.println(nexon.describe());"],note:"Rs 1860000"}]}]},

/* ---------- §5 Structure lab: generic roles, dealership names, GoF Director ---------- */
blduml:{pill:"STRUCTURE LAB · THE ROLES",views:[
 {name:"Roles",h:290,
 nodes:[["cl",10,110,100,"Client","wants a Product"],
  {id:"dr",x:150,y:10,w:190,name:"Director",m:["+ construct(builder)"]},
  {id:"bi",x:150,y:105,w:190,name:"Builder",st:"interface",m:["+ buildPartA()","+ buildPartB()"]},
  {id:"cb",x:150,y:215,w:190,name:"ConcreteBuilder",m:["+ buildPartA()","+ getResult(): Product"]},
  {id:"pr",x:430,y:225,w:160,name:"Product",m:["parts assembled"]}],
 edges:[["e1","cl","dr"],["e2","dr","bi"],["e3","cb","bi","impl"],["e4","cb","pr"],["e5","cl","cb"]],
 steps:[
 {t:"Product: the complex object",d:`The <b>Product</b> is the object that is hard to build in one go: many parts, some optional. It is what the client finally wants.`,cur:["pr"],hide:["e1","e2","e3","e4","e5"],dim:["cl","dr","bi","cb"]},
 {t:"Builder: the steps",d:`The <b>Builder</b> interface lists the <b>steps</b> that make a product (<code>buildPartA</code>, <code>buildPartB</code>…). It says nothing about how a step is done or what the result looks like.`,cur:["bi"],hide:["e1","e2","e3","e4","e5"],dim:["cl","dr","cb","pr"]},
 {t:"ConcreteBuilder: one way to build",d:`A <b>ConcreteBuilder</b> implements the steps and keeps the unfinished product inside. <code>getResult()</code> hands over the finished one. Two ConcreteBuilders can build two <b>different representations</b> from the same steps (a car and a price sheet).`,on:["cb","pr","bi"],good:["cb"],lines:["e3","e4"],hide:["e1","e2","e5"],dim:["cl","dr"]},
 {t:"Director (optional): the recipe",d:`The <b>Director</b> knows the <b>order</b> of the steps for a standard product ("a sports EV": model, colour, sunroof). It calls the Builder interface, so it works with any ConcreteBuilder. In the common modern, <b>fluent</b> Builder there is no Director class: the caller (or a helper method) plays that part.`,cur:["dr"],on:["bi"],lines:["e2"],hide:["e1","e3","e4","e5"],dim:["cl","cb","pr"]},
 {t:"Client: wires it together",d:`The <b>Client</b> creates a ConcreteBuilder, hands it to the Director, and then <b>asks the builder</b> (not the Director) for the result, because only the client knows which representation it wants.`,cur:["cl"],on:["dr","cb"],lines:["e1","e5"],hide:["e2","e3","e4"],dim:["bi","pr"]},
 {t:"The whole pattern",d:`Client → Director → Builder ← ConcreteBuilder → Product. Same steps, different builders, different results. Next tab: the Effective Java style you will meet most often, where the Builder is a nested class and the caller is the Director.`,lines:"all"}]},
 {name:"Dealership",h:210,
 nodes:[["cl",10,70,110,"main()","Client + Director"],
  {id:"bld",x:165,y:10,w:230,name:"Car.Builder",m:["+ trim(trim): Builder","+ sunroof(on): Builder","+ build(): Car"]},
  {id:"car",x:450,y:10,w:140,name:"Car",f:["- final fields"],m:["+ price(): long","+ describe(): String"]}],
 edges:[["u1","cl","bld"],["u2","bld","car"]],
 steps:[
 {t:"Product = Car",d:`<code>Car</code> is the Product: <b>immutable</b>, with <code>final</code> fields and a <b>private</b> constructor, so nobody can create one except <code>Car.Builder</code>.`,cur:["car"],hide:["u1","u2"],dim:["cl","bld"]},
 {t:"Builder = Car.Builder",d:`<code>Car.Builder</code> is a <b>nested class</b> with the required values in its constructor, fluent methods for options and <code>build()</code> for the rules. There is no <code>Builder</code> interface here: there is only one way to build a car.`,cur:["bld"],hide:["u1","u2"],dim:["cl","car"]},
 {t:"build() creates the Car",d:`<code>build()</code> checks the rules and calls <code>new Car(this)</code>: the arrow from builder to car.`,on:["bld","car"],good:["car"],lines:["u2"],hide:["u1"],dim:["cl"]},
 {t:"Client = main() (and its own Director)",d:`<code>main</code> writes the chain. The chain is the "recipe", so the Director role is folded into the caller. When many callers need the same recipe, put it in a small method, for example <code>static Car sportsEv()</code>.`,cur:["cl"],on:["bld"],lines:["u1"],hide:["u2"],dim:["car"]},
 {t:"Read it in one sentence",d:`"A Car is only ever made by its Car.Builder, which collects options, checks them in build(), and then creates the finished, unchangeable Car."`,lines:"all"}]},
 {name:"GoF Director",h:290,
 nodes:[["cl",10,20,100,"main()","the client"],
  {id:"dr",x:150,y:10,w:190,name:"Director",m:["+ constructSportsEv(b)"]},
  {id:"vb",x:390,y:10,w:200,name:"VehicleBuilder",st:"interface",m:["+ reset()","+ setModel(model)","+ setColour(colour)","+ addSunroof()"]},
  {id:"cb",x:295,y:165,w:145,name:"CarBuilder",m:["+ getResult(): String"]},
  {id:"pb",x:450,y:165,w:145,name:"PriceSheetBuilder",m:["+ getResult(): String"]}],
 edges:[["g1","cl","dr"],["g2","dr","vb"],["g3","cb","vb","impl"],["g4","pb","vb","impl"]],
 steps:[
 {t:"The Builder interface",d:`<code>VehicleBuilder</code> lists the steps: <code>reset</code>, <code>setModel</code>, <code>setColour</code>, <code>addSunroof</code>. This is the classic <b>GoF</b> Builder.`,cur:["vb"],hide:["g1","g2","g3","g4"],dim:["cl","dr","cb","pb"]},
 {t:"Two ConcreteBuilders",d:`<code>CarBuilder</code> assembles a car description; <code>PriceSheetBuilder</code> assembles a quote. Same steps, <b>different representations</b>. Each has its own <code>getResult()</code> (the return types can differ, which is why it is not on the interface).`,on:["cb","pb","vb"],good:["cb","pb"],lines:["g3","g4"],hide:["g1","g2"],dim:["cl","dr"]},
 {t:"The Director holds the recipe",d:`<code>Director.constructSportsEv(b)</code> calls the steps in a fixed order on <b>any</b> <code>VehicleBuilder</code>. It never knows if it is producing a car or a price sheet.`,cur:["dr"],on:["vb"],lines:["g2"],hide:["g1","g3","g4"],dim:["cl","cb","pb"]},
 {t:"The client chooses the builder",d:`<code>main</code> creates a <code>CarBuilder</code> or a <code>PriceSheetBuilder</code>, passes it to the Director, then reads <code>getResult()</code> from the builder it chose.`,cur:["cl"],on:["dr"],lines:["g1"],hide:["g2","g3","g4"],dim:["vb","cb","pb"]},
 {t:"Whole picture",d:`Use this shape when the <b>same construction process</b> must produce <b>different representations</b>. In everyday Java, a single fluent Builder with no Director is far more common.`,lines:"all"}]}]}
});

/* ---------- §3 Playground: pick trim, colour, sunroof, warranty years; press build(); same lines as BuilderPattern.java ---------- */
DPL.play({bldplay:{pill:"PLAYGROUND · FILL THE FORM, THEN build()",
 init:()=>({trim:"Base",colour:"White",sunroof:false,years:"0",sig:null,ok:false,runs:[]}),
 controls:[{id:"trim",type:"select",label:"Trim",options:[["Base","Base"],["Top","Top"]]},
  {id:"colour",type:"select",label:"Colour",options:[["White","White"],["Red","Red"],["Blue","Blue"]]},
  {id:"sunroof",type:"toggle",label:"Sunroof"},
  {id:"years",type:"select",label:"Warranty years",options:[["0","0"],["1","1"],["2","2"],["3","3"],["4","4"],["5","5"],["7","7 (invalid)"],["-1","-1 (invalid)"]]},
  {id:"build",type:"button",label:"build() ▶"}],
 act:(s,id)=>{if(id!=="build")return;
  const y=parseInt(s.years,10);let err=null;
  if(s.sunroof&&s.trim==="Base")err="Sunroof is not available on the Base trim";
  else if(y<0||y>5)err="Warranty years must be 0 to 5, got "+y;
  const price=1650000+(s.trim==="Top"?150000:0)+(s.sunroof?60000:0)+y*12000;
  const code='new Car.Builder("Nexon", "EV").trim("'+s.trim+'").colour("'+s.colour+'").sunroof('+s.sunroof+').warrantyYears('+y+').build();';
  s.runs.push({code:code,lines:err?["Exception in thread \"main\" java.lang.IllegalStateException: "+err]:
   ["Nexon EV "+s.trim+" "+s.colour+" | sunroof="+s.sunroof+" alloy=false gps=false warranty="+y+"y | Rs "+price]});
  if(s.runs.length>3)s.runs.shift();
  s.sig=[s.trim,s.colour,s.sunroof,s.years].join("|");s.ok=!err;},
 render:s=>{
  const y=parseInt(s.years,10),sig=[s.trim,s.colour,s.sunroof,s.years].join("|"),fresh=s.sig===sig;
  const sunBad=s.sunroof&&s.trim==="Base",yrBad=y<0||y>5,built=fresh&&s.ok,failed=fresh&&!s.ok;
  const nodes=[["main",10,95,110,"main()","fills the form"],
   {id:"bld",x:150,y:10,w:230,name:"Car.Builder",m:["+ sunroof(on): Builder","+ build(): Car"]},
   ["pt",150,130,100,"trim",s.trim],["pc",260,130,100,"colour",s.colour],["ps",370,130,100,"sunroof",s.sunroof?"on":"off"],["pw",480,130,100,"warranty",s.years+" yr"]];
  const edges=[["m1","main","bld"],["p1","pt","bld","calls",0,"","v"],["p2","pc","bld","calls",0,"","v"],["p3","ps","bld","calls",0,"","v"],["p4","pw","bld","calls",0,"","v"]];
  if(built){nodes.push({id:"car",x:430,y:10,w:160,name:"Car",f:["- final fields"],m:["+ price(): long"]});edges.push(["b1","bld","car"]);}
  const bad=[];if(failed)bad.push("bld");if(sunBad)bad.push("ps","pt");if(yrBad)bad.push("pw");
  const log=s.runs.map(r=>r.code),out=s.runs.reduce((a,r)=>a.concat(r.lines),[]);
  return {h:200,alt:built?"The builder collected the parts and build() created an immutable Car":failed?"build() threw an exception, so no Car was created":"The builder is collecting the parts; press build()",
   nodes:nodes,edges:edges,on:["main","bld"],good:built?["car"]:[],bad:bad,lines:built?["m1","b1","p1","p2","p3","p4"]:["m1","p1","p2","p3","p4"],
   log:log.length?log:["// choose the options, then press build()"],out:out.length?"// output:\n"+out.join("\n"):"// output:"};
 }}});
