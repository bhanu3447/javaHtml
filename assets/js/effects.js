/* Decorative effects: fire rider, ancient tree, mascot, weather, sky, Halloween, festivals, scroll rider.
   Details: kb/appendix-effects.md.
   Part of the course scripts. Every page loads, in this order: course-index.js, quiz-data.js, course.js, effects.js,
   labs-oop.js, labs-collections.js, labs-analogy.js, labs-sorting.js, practice-tools.js. They are classic scripts, so
   top-level const/let/function names are shared between them (course.js defines $, $$, esc, store, hl, FX, THM…). */
"use strict";
/* paused by default: the whole file runs only when the effects switch is on (FX_ON in course.js). Names the other files use
   (RIDER, WX, HALLOWEEN, FEST) are exported on window at the end. */
(function(){if(!FX_ON)return;
/* fire rider: a flaming-skull biker rides across the bottom of the screen now and then (first after ~8 s, then every 40–70 s),
   leaving fire, embers and smoke behind. Canvas #rider sits above the page and ignores the pointer. RIDER.go() summons him (command palette).
   Skipped when the ∞ animation is off, under reduced motion and while the tab is hidden. P = particles {k: f fire | e ember | m smoke} */
const RIDER=(function(){
  const reduce=matchMedia("(prefers-reduced-motion: reduce)");
  const cv=document.createElement("canvas");cv.id="rider";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);
  let ctx=cv.getContext("2d");let W=0,H=0,dpr=1,raf=0,run=null,P=[],last=0,dark=true,camZ=1;
  /* v20 adaptive quality: lowQ halves the tree flames, drops the second road flame, renders the GPU fire at a third of the
     resolution and caps particles at 350 (set when the frame time average stays above 30 ms for 1.5 s of a ride) */
  let lowQ=false,ema=.016,slowT=0,GR=null;
  /* v14 layers: #riderLow (haunted backdrop, smoke, glow) < #rider3d (3D models) < #rider (fire, embers, chain, bullets) */
  const cvL=document.createElement("canvas");cvL.id="riderLow";cvL.setAttribute("aria-hidden","true");document.body.insertBefore(cvL,cv);const ctxL=cvL.getContext("2d"),ctxM=ctx;
  function size(){dpr=1;W=innerWidth;H=innerHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cvL.width=cv.width;cvL.height=cv.height;}
  size();addEventListener("resize",size,{passive:true});
  const R=(a,b)=>a+Math.random()*(b-a);
  /* theme palettes (picked from data-theme when he sets off; light/dark/system use classic fire): fire stages hot → cool as "r,g,b",
     g glow, e embers, ring wheel fire ring, eye socket glow, tank bike tank, beam headlight, sm smoke */
  const PALS={
    fire:{f:["255,248,214","255,206,84","255,136,24","214,48,10","90,30,20"],g:"255,110,0",e:"255,170,60",ring:"#ff7a18",eye:"#ff6a00",tank:"#7f1d1d",beam:"255,236,170",sm:"70,60,60"},
    midnight:{f:["235,245,255","147,197,253","59,130,246","37,99,235","30,41,90"],g:"59,130,246",e:"147,197,253",ring:"#60a5fa",eye:"#93c5fd",tank:"#1e3a8a",beam:"191,219,254",sm:"40,50,90"},
    nord:{f:["245,250,255","191,227,240","136,192,208","94,129,172","59,66,82"],g:"136,192,208",e:"216,222,233",ring:"#88c0d0",eye:"#8fbcbb",tank:"#4c566a",beam:"229,233,240",sm:"76,86,106"},
    dracula:{f:["255,236,250","255,121,198","189,147,249","139,92,246","68,40,90"],g:"189,147,249",e:"255,121,198",ring:"#ff79c6",eye:"#bd93f9",tank:"#6d28d9",beam:"241,250,140",sm:"68,71,90"},
    forest:{f:["240,255,220","190,242,100","132,204,22","34,160,107","20,60,40"],g:"132,204,22",e:"190,242,100",ring:"#84cc16",eye:"#a3e635",tank:"#14532d",beam:"217,249,157",sm:"40,60,45"},
    sunset:{f:["255,240,220","253,186,116","249,115,22","225,29,72","110,20,50"],g:"249,115,22",e:"251,146,60",ring:"#f97316",eye:"#e11d48",tank:"#be123c",beam:"254,215,170",sm:"120,60,70"},
    ocean:{f:["236,254,255","165,243,252","34,211,238","14,116,144","20,50,80"],g:"14,165,233",e:"103,232,249",ring:"#06b6d4",eye:"#22d3ee",tank:"#0e7490",beam:"207,250,254",sm:"50,80,100"},
    sepia:{f:["255,247,220","250,204,120","205,133,63","160,82,45","90,60,30"],g:"184,134,11",e:"218,165,32",ring:"#b8860b",eye:"#cd853f",tank:"#7c2d12",beam:"253,230,138",sm:"110,85,60"}};
  let pal=PALS.fire;
  function isDark(){const m=getComputedStyle(document.body).backgroundColor.match(/\d+/g)||[255,255,255];return (+m[0]*.3+ +m[1]*.59+ +m[2]*.11)<110;}
  /* cinematic sound, synthesised with Web Audio (no files): thunder, engine, gunshot, landing thud, hoofbeats, chain clinks, whoosh.
     The context starts on the ghost-button click (browsers need a gesture); 🔊/🔇 in the nav mutes it (js1-sound "0" = muted). */
  const SFX=(function(){let ac=null,master=null,noise=null,eng=null,engBuf=null,shp=null,on=store.get("js1-sound")!=="0";
    const ready=()=>{if(ac&&ac.state==="running")document.dispatchEvent(new Event("sfxready"));};
    function init(){if(ac){if(ac.state==="suspended")ac.resume().then(ready);return;}const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
      ac=new A();ac.addEventListener("statechange",ready);setTimeout(ready,50);master=ac.createGain();master.gain.value=on?.55:0;master.connect(ac.destination);
      const n=ac.sampleRate*2,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;noise=b;
      /* one engine cycle of a V-twin: two uneven exhaust pops (decaying thump + rasp), looped; playbackRate = revs */
      const L=Math.round(ac.sampleRate/11),eb=ac.createBuffer(1,L,ac.sampleRate),ed=eb.getChannelData(0);
      for(const [at,amp] of [[0,1],[.36,.75]]){const s0=Math.round(at*L);for(let i=0;i<L;i++){const t=((i-s0+L)%L)/ac.sampleRate,e=Math.exp(-t*70);ed[i]+=amp*e*(Math.sin(6.2832*62*t)*.9+Math.sin(6.2832*131*t)*.3+(Math.random()*2-1)*.55*Math.exp(-t*160));}}
      engBuf=eb;shp=ac.createWaveShaper();const cv=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;cv[i]=Math.tanh(2.6*x);}shp.curve=cv;}
    const ok=()=>ac&&ac.state==="running";
    function nz(type,f,q,t0,a,dec,vol,f1){const s=ac.createBufferSource();s.buffer=noise;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;s.loopStart=0;fl.frequency.setValueAtTime(f,t0);if(f1)fl.frequency.exponentialRampToValueAtTime(f1,t0+dec);fl.Q.value=q;
      const g=ac.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+a);g.gain.exponentialRampToValueAtTime(.001,t0+a+dec);s.connect(fl);fl.connect(g);g.connect(master);s.start(t0,Math.random()*1.8);s.stop(t0+a+dec+.05);}
    function tone(type,f0,f1,t0,dec,vol){const o=ac.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(f1,t0+dec);
      const g=ac.createGain();g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.001,t0+dec);o.connect(g);g.connect(master);o.start(t0);o.stop(t0+dec+.05);}
    return {init,
      get ac(){return ac;},get out(){return master;},get noise(){return noise;},get ok(){return ok();},
      /* weather ambience pieces: a single rain drop tick, a cricket chirp (night), a soft bird call */
      drop(t,v){if(!ok())return;nz("bandpass",1800+Math.random()*4200,3+Math.random()*5,t,.001,.025+Math.random()*.03,.05*v);},
      cricket(t,v){if(!ok())return;const f=4300+Math.random()*300;for(let i=0;i<3;i++)tone("sine",f,f*.98,t+i*.055,.035,.022*v);},
      get on(){return on;},set(v){on=v;store.set("js1-sound",v?"1":"0");if(master)master.gain.setTargetAtTime(v?.55:0,ac.currentTime,.05);document.dispatchEvent(new Event("sfxready"));},
      thunder(v){if(!ok())return;const t=ac.currentTime;v=v||1;nz("lowpass",900,.7,t,.02,.35,.9*v);nz("lowpass",220,.5,t+.08,.4,2.8,.8*v);nz("lowpass",120,.5,t+.3,.6,3.2,.55*v);},
      gun(){if(!ok())return;const t=ac.currentTime;nz("bandpass",1800,.8,t,.002,.18,.9);nz("lowpass",600,.6,t,.003,.35,.6);tone("sine",140,40,t,.22,.8);},
      thud(){if(!ok())return;const t=ac.currentTime;tone("sine",90,35,t,.28,.9);nz("lowpass",300,.6,t,.005,.25,.4);},
      hoof(v){if(!ok())return;const t=ac.currentTime;nz("lowpass",650,.7,t,.002,.1,.75*v);tone("sine",82,42,t,.11,.6*v);nz("bandpass",1300,4,t,.001,.03,.3*v);},
      neigh(){if(!ok())return;const t=ac.currentTime,o=ac.createOscillator(),lfo=ac.createOscillator(),lg=ac.createGain(),g=ac.createGain(),b1=ac.createBiquadFilter(),b2=ac.createBiquadFilter();
        o.type="sawtooth";o.frequency.setValueAtTime(480,t);o.frequency.linearRampToValueAtTime(980,t+.22);o.frequency.linearRampToValueAtTime(860,t+.7);o.frequency.linearRampToValueAtTime(380,t+1.35);
        lfo.frequency.value=10;lg.gain.setValueAtTime(10,t);lg.gain.linearRampToValueAtTime(70,t+.8);lfo.connect(lg);lg.connect(o.frequency);
        b1.type="bandpass";b1.frequency.value=1100;b1.Q.value=4;b2.type="bandpass";b2.frequency.value=2600;b2.Q.value=5;
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.32,t+.06);g.gain.linearRampToValueAtTime(.22,t+.9);g.gain.exponentialRampToValueAtTime(.001,t+1.45);
        o.connect(b1);o.connect(b2);b1.connect(g);b2.connect(g);g.connect(master);o.start(t);lfo.start(t);o.stop(t+1.5);lfo.stop(t+1.5);nz("bandpass",1600,1,t,.05,1.2,.08);},
      snort(){if(!ok())return;const t=ac.currentTime;nz("bandpass",850,1.4,t,.01,.22,.45);nz("bandpass",700,1.4,t+.28,.01,.3,.35);},
      creak(){if(!ok())return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),fl=ac.createBiquadFilter(),lfo=ac.createOscillator(),lg=ac.createGain();
        o.type="sawtooth";o.frequency.setValueAtTime(70,t);o.frequency.linearRampToValueAtTime(130,t+.5);o.frequency.linearRampToValueAtTime(85,t+.75);
        lfo.frequency.value=28;lg.gain.value=30;lfo.connect(lg);lg.connect(o.frequency);fl.type="bandpass";fl.frequency.value=700;fl.Q.value=3;
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16,t+.05);g.gain.setValueAtTime(.16,t+.6);g.gain.exponentialRampToValueAtTime(.001,t+.8);
        o.connect(fl);fl.connect(g);g.connect(master);o.start(t);lfo.start(t);o.stop(t+.85);lfo.stop(t+.85);},
      wail(){if(!ok())return;const t=ac.currentTime,o=ac.createOscillator(),lfo=ac.createOscillator(),lg=ac.createGain(),g=ac.createGain(),f=420+Math.random()*120;
        o.type="sine";o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*2.1,t+.5);o.frequency.exponentialRampToValueAtTime(f*.8,t+1.6);
        lfo.frequency.value=6;lg.gain.value=f*.04;lfo.connect(lg);lg.connect(o.frequency);
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.13,t+.25);g.gain.exponentialRampToValueAtTime(.001,t+1.7);
        o.connect(g);g.connect(master);o.start(t);lfo.start(t);o.stop(t+1.75);lfo.stop(t+1.75);nz("bandpass",1400,1.2,t,.2,1.4,.05);},
      howl(){if(!ok())return;const t=ac.currentTime,o=ac.createOscillator(),o2=ac.createOscillator(),lfo=ac.createOscillator(),lg=ac.createGain(),g=ac.createGain(),bp=ac.createBiquadFilter();
        o.type="sawtooth";o2.type="sine";o.frequency.setValueAtTime(250,t);o.frequency.linearRampToValueAtTime(530,t+.65);o.frequency.setValueAtTime(530,t+1.4);o.frequency.linearRampToValueAtTime(360,t+2.4);
        o2.frequency.setValueAtTime(500,t);o2.frequency.linearRampToValueAtTime(1060,t+.65);o2.frequency.linearRampToValueAtTime(720,t+2.4);
        lfo.frequency.value=5.5;lg.gain.value=9;lfo.connect(lg);lg.connect(o.frequency);bp.type="bandpass";bp.frequency.value=950;bp.Q.value=2.2;
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.22,t+.3);g.gain.setValueAtTime(.22,t+1.7);g.gain.exponentialRampToValueAtTime(.001,t+2.5);
        o.connect(bp);o2.connect(bp);bp.connect(g);g.connect(master);[o,o2,lfo].forEach(x=>{x.start(t);x.stop(t+2.55);});nz("bandpass",1300,1,t,.3,2.1,.04);},
      growl(){if(!ok())return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),lp=ac.createBiquadFilter(),lfo=ac.createOscillator(),lg=ac.createGain();
        o.type="sawtooth";o.frequency.setValueAtTime(78,t);o.frequency.linearRampToValueAtTime(96,t+.35);o.frequency.linearRampToValueAtTime(70,t+.8);lfo.frequency.value=24;lg.gain.value=14;lfo.connect(lg);lg.connect(o.frequency);
        lp.type="lowpass";lp.frequency.value=520;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.32,t+.06);g.gain.exponentialRampToValueAtTime(.001,t+.85);
        o.connect(lp);lp.connect(g);g.connect(master);o.start(t);lfo.start(t);o.stop(t+.9);lfo.stop(t+.9);nz("lowpass",380,.7,t,.02,.7,.25);},
      laugh(){if(!ok())return;const t=ac.currentTime;[0,.2,.4,.62].forEach((d,i)=>{const o=ac.createOscillator(),g=ac.createGain(),bp=ac.createBiquadFilter(),f=210-i*20;
        o.type="sawtooth";o.frequency.setValueAtTime(f*1.15,t+d);o.frequency.exponentialRampToValueAtTime(f*.82,t+d+.17);bp.type="bandpass";bp.frequency.value=820;bp.Q.value=3;
        g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(.24,t+d+.02);g.gain.exponentialRampToValueAtTime(.001,t+d+.19);o.connect(bp);bp.connect(g);g.connect(master);o.start(t+d);o.stop(t+d+.21);});
        nz("bandpass",1500,2,t,.01,.85,.04);},
      squeak(){if(!ok())return;const t=ac.currentTime;tone("sine",3400,1700,t,.12,.12);nz("lowpass",500,.7,t,.002,.12,.25);},
      hoot(){if(!ok())return;const t=ac.currentTime;[[0,.42],[.62,.2],[.88,.5]].forEach(([d,len],i)=>{const t0=t+d,o=ac.createOscillator(),o2=ac.createOscillator(),g=ac.createGain(),g2=ac.createGain();
        o.type="sine";o.frequency.setValueAtTime(330,t0);o.frequency.linearRampToValueAtTime(i===1?405:385,t0+len*.3);o.frequency.linearRampToValueAtTime(320,t0+len);o2.type="sine";o2.frequency.setValueAtTime(660,t0);o2.frequency.linearRampToValueAtTime(760,t0+len*.3);o2.frequency.linearRampToValueAtTime(640,t0+len);
        g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.42,t0+.07);g.gain.setValueAtTime(.42,t0+len-.1);g.gain.linearRampToValueAtTime(0,t0+len);g2.gain.value=.05;
        o.connect(g);o2.connect(g2);g2.connect(g);g.connect(master);o.start(t0);o2.start(t0);o.stop(t0+len+.05);o2.stop(t0+len+.05);nz("lowpass",450,.7,t0,.05,len,.04);});},
      chirp(v){if(!ok())return;v=v==null?1:v;const t=ac.currentTime;for(let i=0;i<4;i++){const f=3000+Math.random()*900;tone("sine",f,f*1.45,t+i*.11,.08,.14*v);}},
      clink(){if(!ok())return;const t=ac.currentTime;for(let i=0;i<3;i++)tone("sine",2200+Math.random()*1600,1800+Math.random()*900,t+i*.045,.16,.12);},
      whoosh(){if(!ok())return;nz("bandpass",350,1.2,ac.currentTime,.12,.4,.5,2200);},
      /* v15: firework burst (thump + crackle) and sleigh bells */
      pop(v){if(!ok())return;v=v||1;const t=ac.currentTime;nz("lowpass",900,.7,t,.004,.35,.5*v,120);for(let i=0;i<9;i++)nz("highpass",3500,1,t+.12+Math.random()*.5,.002,.04,.12*v);},
      splash(){if(!ok())return;const t=ac.currentTime;nz("highpass",1600,.8,t,.004,.32,.34);nz("bandpass",520,1,t,.008,.22,.22);},
      hiss(v){if(!ok())return;nz("highpass",3200,.7,ac.currentTime,.06,1.1,.16*(v||1),6500);},
      bells(){if(!ok())return;const t=ac.currentTime;for(let i=0;i<14;i++){const f=[2093,2637,3136][i%3]*(1+Math.random()*.01);tone("sine",f,f*.995,t+i*.16+Math.random()*.04,.5,.07);}},
      engine(go,rev){if(!ok())return;const t=ac.currentTime;
        if(go&&!eng){const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=engBuf;s.loop=true;fl.type="lowpass";fl.frequency.value=1100;fl.Q.value=.8;
          g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.5,t+.5);s.connect(shp);shp.connect(fl);fl.connect(g);g.connect(master);s.start();eng={s,fl,g};}
        else if(!go&&eng){const e=eng;eng=null;e.g.gain.setTargetAtTime(0,t,.3);setTimeout(()=>{e.s.stop();try{shp.disconnect();}catch(x){}},1600);}
        if(eng&&rev!=null){eng.s.playbackRate.setTargetAtTime(.9+rev*1.25,t,.12);eng.fl.frequency.setTargetAtTime(900+rev*1700,t,.12);}}};})();
  window.SFX=SFX;
  /* sound unlocks on the first click or key press anywhere (browsers need a gesture) */
  addEventListener("pointerdown",()=>SFX.init(),{once:true});addEventListener("keydown",()=>SFX.init(),{once:true});
  /* camera shake (the page and the trees jolt) and letterbox bars, toggled on <html> */
  /* v11: a Web Animation on the page layers (compositor only). The old version restarted a CSS class with a forced layout of the
     whole page, and its CSS stopped every other animation on the page during the shake, so everything froze and restarted. */
  const SHX=[0,-1,3,-5,5,-5,5,-5,3,-1,0],SHY=[0,0,-1,2,-2,2,-2,2,-1,0,0];
  function shake(k){k=k||1;const fr=SHX.map((x,i)=>({translate:(x*k).toFixed(1)+"px "+(SHY[i]*k).toFixed(1)+"px"}));
    for(const sel of [".wrap","#toc","#jungle","#jungleL","#mascot.ms-fixed"]){const el=document.querySelector(sel);if(el)el.animate(fr,{duration:500,easing:"cubic-bezier(.36,.07,.19,.97)"});}}
  /* the stunt run, as spans of the crossing (0 → 1): a bunny hop, a big jump (often a full backflip, fist in the air), a wheelie,
     and a last hop. Jumps rotate about the bike's centre, the wheelie about the rear wheel; every landing squashes the suspension. */
  function tricks(){const T=[],add=(a,b,k,h)=>T.push({a,b,k,h});
    add(R(.09,.13),R(.2,.23),"hop",R(45,65));
    add(R(.32,.35),R(.53,.56),Math.random()<.65?"flip":"big",R(120,150));
    add(R(.66,.68),R(.76,.78),"wheelie",0);
    add(R(.83,.85),R(.92,.94),"hop",R(35,55));return T;}
  function go(){if(run||reduce.matches)return;const st=R3.state;if(st==="ready"||st==="failed")return go0();
    const gb=document.getElementById("ghostBtn");if(gb)gb.classList.add("loading");let fired=false;
    const fin=()=>{if(fired)return;fired=true;if(gb)gb.classList.remove("loading");go0();};R3.load().then(fin,fin);setTimeout(fin,12000);}
  function title(){const t=document.createElement("div");t.className="ride-title";t.setAttribute("aria-hidden","true");t.innerHTML="<b>THE FIRE RIDER</b><i>rides tonight</i>";
    document.body.appendChild(t);setTimeout(()=>t.remove(),4600);}
  function go0(){if(run||reduce.matches)return;title();dark=isDark();pal=PALS[document.documentElement.dataset.theme]||PALS.fire;const s=Math.max(.45,Math.min(.75,W/2100)),dir=Math.random()<.5?1:-1,v=Math.max(170,W/9);
    run={s,dir,v,mode:"bike",x:dir>0?-160*s:W+160*s,spin:0,t:0,ang:0,pv:[0,-24],lift:0,sq:0,air:false,arm:false,tr:tricks(),g:0,shots:[.2,.32,.44],gun:0,flash:0,aim:-1};run.gy=H;hs=haunt(s);hs.fl=1;over(run);SFX.init();SFX.thunder();shake(1.4);setTimeout(()=>{if(run)SFX.engine(true,.2);},700);last=performance.now();if(!raf)raf=requestAnimationFrame(loop);}
  /* when the hero code window is on screen, the big jump becomes a backflip that arcs over it (other tricks in its way are dropped) */
  function over(r){const hw=document.getElementById("heroWin"),wr=hw&&!hw.hidden&&hw.getBoundingClientRect();if(!wr||wr.top>H-60||wr.bottom<0||wr.width<200)return;
    const base=H-34*r.s-12,need=(base-wr.top+60)/r.s*1.15;if(need<60||need>H*.8/r.s)return;const k=r.tr[1],pL=(wr.left-240)/W,pR=(wr.right+240)/W;
    Object.assign(k,{a:r.dir>0?pL:1-pR,b:r.dir>0?pR:1-pL,h:need,k:"flip",over:true});r.tr=r.tr.filter(t=>t===k||t.b<k.a-.02||t.a>k.b+.02);r.shots=r.shots.filter(p=>p<k.a||p>k.b);if(!r.shots.length)r.shots=[Math.max(.06,k.a-.08)];}
  /* haunted scene while he rides: the page darkens, a pale moon and bats appear, and a graveyard ground (tombstones, crosses, dead
     trees, an iron fence) rises along the bottom where he rides, with green fog drifting through it. hz fades it in and out. */
  let hs=null,hz=0,B=[];
  /* shooting: at set points of each pass (r.shots, progress 0 → 1) he aims his gun arm at the mascot (r.aim, local angle) and fires a
     glowing hellfire round; a near miss makes the bird dodge (MASCOT.dodge), which sends it to hide in the left tree */
  function shoot(p,dt){const r=run;r.gun=Math.max(0,r.gun-dt);r.flash=Math.max(0,r.flash-dt);if(r.gun>0)r.arm=false;
    /* every 1.3–2.1 s he picks off a bat or crow (leading it), unless the chain is busy */
    r.batT=(r.batT==null?1.4:r.batT)-dt;const busy=r.ch&&(r.ch.st==="throw"||r.ch.st==="reel"||r.ch.st==="carry");
    if(r.batT<=0&&hs&&!busy){r.batT=R(1.3,2.1);const L=hs.bats.filter(b=>!b.dead&&b.sx>60&&b.sx<W-60&&b.sy>50&&b.sy<H*.68);
      if(L.length){const b=L[Math.floor(Math.random()*L.length)],S=toW(0,-60),lead=Math.hypot(b.sx-S[0],b.sy-S[1])/1300;fire([b.sx+b.v*lead,b.sy],b);}}
    r.ghT=(r.ghT==null?2.2:r.ghT)-dt;
    if(r.ghT<=0&&hs&&hs.run){r.ghT=R(1.6,2.6);const G=[...hs.run,...hs.ghosts.filter(g=>g.mode!=="swoop"&&g.al>.6)].filter(g=>!g.dead&&g.t>.6&&g.x>60&&g.x<W-60&&g.cy);if(G.length){const g=G[Math.floor(Math.random()*G.length)],S=toW(0,-60),lead=Math.hypot(g.x-S[0],g.cy-S[1])/1300;fire([g.x+g.vx*lead,g.cy],{gh:g});}}
    if(!r.shots.length||p<r.shots[0])return;r.shots.shift();const t=window.MASCOT&&MASCOT.where();if(t)fire(t,null);}
  function fire(t,bat){const r=run;
    const ox=r.mode==="horse"?10:0,oy=r.mode==="horse"?-44:0,S=toW(ox+2,oy-58),a=Math.atan2((t[1]-S[1])/r.s,(t[0]-S[0])/(r.s*r.dir))-r.ang;
    SFX.gun();shake(bat?.2:.45);r.aim=a;r.gun=.8;r.flash=.1;r.arm=false;const M=toW(ox+2+Math.cos(a)*40,oy-58+Math.sin(a)*40),dx=t[0]-M[0],dy=t[1]-M[1],d=Math.hypot(dx,dy)||1;
    B.push({x:M[0],y:M[1],vx:dx/d*1300,vy:dy/d*1300,tx:t[0],ty:t[1],hit:false,bat});
    emit("f",M[0],M[1],14,()=>({vx:dx/d*R(80,260)+R(-40,40),vy:dy/d*R(80,260)+R(-40,40),r:R(2,5),l:R(.1,.22)}));}
  function haunt(s){const G=[],F=[];let x=R(-30,20);document.querySelectorAll(".burning").forEach(e=>e.classList.remove("burning"));
    const dead=(x,y,a,l,w,d,S)=>{const x1=x+Math.sin(a)*l,y1=y-Math.cos(a)*l,b=R(-.22,.22)*l;S.push([x,y,x1,y1,w,(x+x1)/2+Math.cos(a)*b,(y+y1)/2+Math.sin(a)*b]);if(d>0){dead(x1,y1,a-R(.3,.75),l*R(.6,.78),w*.62,d-1,S);dead(x1,y1,a+R(.3,.75),l*R(.6,.78),w*.62,d-1,S);}};
    while(x<W+40){const t=Math.random();
      if(t<.5)G.push({k:"grave",x,h:R(16,32),w:R(11,19),c:Math.random()<.35,tl:R(-.12,.12)});
      else if(t<.72){const S=[];dead(x,0,R(-.18,.18),R(48,84),R(5,9),5,S);G.push({k:"tree",S});}
      else G.push({k:"fence",x,w:R(40,90)});
      x+=R(60,160);}
    for(let x=R(0,60);x<W;x+=R(70,150)){const S=[];dead(x,-6,R(-.2,.2),R(36,64),R(3,5.5),4,S);F.push(S);}
    const bats=[];for(let i=0;i<22;i++){const crow=i<7;bats.push({k:crow?"crow":"bat",x:R(0,W),y:R(H*.06,H*.55),v:(crow?R(70,130):R(50,120))*(Math.random()<.5?1:-1),ph:R(0,6.28),s:crow?R(1.1,1.5):R(.55,1.15),b:R(0,6.28)});}
    const fog=[];for(let i=0;i<18;i++)fog.push({x:R(0,W),dy:R(-40,10),r:R(90,190),v:R(-22,22),g:Math.random()<.6});
    const ghosts=[];for(let i=0;i<8;i++)ghosts.push(roamer(i));
    const eyes=[];for(let i=0;i<9;i++)eyes.push({x:R(20,W-20),dy:R(-50,-8),ph:R(0,6.28),r:Math.random()<.7});
    const wisps=[];for(let i=0;i<3;i++)wisps.push({dx:R(-160,160),dy:R(-24,24),v:R(10,22),w:R(60,110)});
    const cof=[];for(let i=0;i<4;i++)cof.push({x:W*(.12+.76*(i+R(.2,.8))/4),at:1.1+i*R(1.1,1.7),tl:R(-.16,.16),k:R(.9,1.15),dir:Math.random()<.5?1:-1,done:false,cr:false});
    return {G,F,bats,fog,ghosts,eyes,wisps,cof,run:[],t:0,wolf:{st:"gone",t:0},s,ln:R(2,4),fl:0,moon:[W*R(.62,.78),R(H*.1,H*.17)]};}
  function web(x,y,dir){/* a cobweb in a top corner: radial threads + sagging rings */
    const R0=110;ctx.beginPath();for(let i=0;i<=6;i++){const a=(dir>0?0:Math.PI/2)+i*Math.PI/12;ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*R0*dir,y+Math.sin(a)*R0);}
    for(let k=1;k<=5;k++){const rr=k*R0/5.5;for(let i=0;i<6;i++){const a0=i*Math.PI/12,a1=(i+1)*Math.PI/12,m=(a0+a1)/2;
      ctx.moveTo(x+Math.cos(a0)*rr*dir,y+Math.sin(a0)*rr);ctx.quadraticCurveTo(x+Math.cos(m)*rr*.86*dir,y+Math.sin(m)*rr*.86,x+Math.cos(a1)*rr*dir,y+Math.sin(a1)*rr);}}ctx.stroke();}
  /* werewolf v3: a rigged, furry creature with wolf anatomy. Bones (hips, ribcage, shoulders, neck, broad skull, muzzle with a nose,
     hinged lower jaw, big swept-back ears, arms with long claws, digitigrade legs, bushy tail) are posed by joint angles; each bone is
     wrapped in a tapered capsule whose outline carries irregular fur tufts (many short, a few long, swept backwards, stirring slightly).
     The union is filled near-black with a pale moonlit rim, glowing red eyes and fangs. Poses: "howl" (upright on a crag in front of a
     swollen moon, muzzle to the sky), "leap" (stretched out, claws first), "land" (heavy crouch) and "run" (gallop: legs gather and
     extend, the spine flexes). Facing +x, ~190 units tall standing; except for the leap the figure is shifted so its lowest point sits
     on y = 0. */
  const WHN=n=>{const x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x);};
  function wcap(p,A,ra,B,rb,seed,amp,T){const dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,nx=-uy,ny=ux,N=Math.max(4,Math.round(L/3.2)),pts=[];
    /* fur: odd samples are tufts; length ~ k^1.7 (mostly short, a few long), swept back along the bone */
    const tuft=i=>{if(!(i%2)||!amp)return [0,0];const k=Math.pow(WHN(seed+i*7.13),1.7);return [amp*(.25+1.6*k)*(1+.12*Math.sin(T*3.1+i*1.7)),-(1.5+7*k)*amp];};
    const side=(sgn,base,t,r,i)=>{const [e,b]=tuft(i),d=r*(1+e);return [A[0]+dx*t+sgn*nx*d+ux*b,A[1]+dy*t+sgn*ny*d+uy*b];};
    for(let i=0;i<=N;i++){const t=i/N;pts.push(side(1,0,t,ra+(rb-ra)*t,i));}
    for(let j=1;j<6;j++){const an=j/6*Math.PI,c=Math.cos(an),s=Math.sin(an),[e]=tuft(N+j),d=rb*(1+e*.6);pts.push([B[0]+(nx*c+ux*s)*d,B[1]+(ny*c+uy*s)*d]);}
    for(let i=N;i>=0;i--){const t=i/N;pts.push(side(-1,0,t,ra+(rb-ra)*t,i+31));}
    for(let j=1;j<6;j++){const an=j/6*Math.PI,c=Math.cos(an),s=Math.sin(an),[e]=tuft(N+j+60),d=ra*(1+e*.6);pts.push([A[0]-(nx*c+ux*s)*d,A[1]-(ny*c+uy*s)*d]);}
    p.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length;k++)p.lineTo(pts[k][0],pts[k][1]);p.closePath();}
  function wtri(p,a,b,c){p.moveTo(a[0],a[1]);p.lineTo(b[0],b[1]);p.lineTo(c[0],c[1]);p.closePath();}
  function wcirc(p,c,r){p.moveTo(c[0]+r,c[1]);p.arc(c[0],c[1],r,0,6.2832);}
  const wgo=(o,a,l)=>[o[0]+Math.cos(a)*l,o[1]+Math.sin(a)*l],UP=-Math.PI/2,DN=Math.PI/2;
  function wolfRig(pose,g,T){
    let H=[0,0],C,N,S,ma,jo,arms,legs,tail,br=1+.04*Math.sin(T*2.6);
    if(pose==="howl"){
      C=wgo(H,UP+.2,64);N=wgo(C,UP+.22,24);S=wgo(N,UP+.18,15);ma=UP+.55+Math.sin(T*1.1)*.04;jo=.62+.08*Math.sin(T*1.9);
      arms=[[DN-.05,DN-.5,DN-.25,0],[DN+.2,DN-.15,DN+.1,1]];
      legs=[[DN-.5,DN+.6,DN-.3,0],[DN-.22,DN+.78,DN-.12,.1]];tail=DN+1.05;}
    else if(pose==="leap"){
      C=wgo(H,-.3,70);N=wgo(C,-.55,24);S=wgo(N,-.2,15);ma=.02;jo=.62;br=1;
      arms=[[-.45,-.15,.1,0],[.05,0,.25,1]];legs=[[2.5,2.95,2.4,2.1],[2.25,2.75,2.3,2]];tail=Math.PI+.1;}
    else if(pose==="land"){
      C=wgo(H,-.45,60);N=wgo(C,-.45,24);S=wgo(N,-.05,15);ma=.15;jo=.5;
      arms=[[DN-.05,DN+.3,0,0],[DN+.15,DN+.35,.05,1]];legs=[[DN-1,DN+1.2,DN-.65,0],[DN-.85,DN+1.1,DN-.55,.05]];tail=Math.PI-.55;}
    else{const f=Math.sin(g);
      C=wgo(H,-.16+.07*f,70+8*f);N=wgo(C,-.85,24);S=wgo(N,-.3+.05*Math.sin(g*2),15);ma=.12;jo=.32+.14*Math.max(0,Math.sin(g));br=1;
      const fr=k=>{const u=DN-.85*Math.sin(g+k);return [u,u-.1+1.05*Math.max(0,Math.sin(g+k+1.6)),u+.3+.4*Math.max(0,Math.sin(g+k+1.6)),0];};
      const hd=k=>{const th=DN-.25+.8*Math.sin(g+Math.PI+k);return [th,th+1+.55*Math.max(0,Math.sin(g+Math.PI+k+1.6)),th-.2,0];};
      arms=[fr(0).slice(0,3).concat(0),fr(.5).slice(0,3).concat(1)];legs=[hd(0),hd(.5)];tail=Math.PI-.3+.2*Math.sin(g);}
    const Sh=[C[0]+4,C[1]+11],Hp=[H[0]-2,H[1]+5];
    const A=arms.map(([a1,a2,a3,far])=>{const E=wgo(Sh,a1,40),W=wgo(E,a2,38),Hd=wgo(W,a3,16);return {E,W,Hd,a3,far};});
    const Lg=legs.map(([a1,a2,a3,a4])=>{const K=wgo(Hp,a1,46),Hk=wgo(K,a2,42),An=wgo(Hk,a3,28),Ft=wgo(An,a4,14);return {K,Hk,An,Ft,a4};});
    const tl=[H];for(let i=0;i<5;i++)tl.push(wgo(tl[i],tail+i*.14*(pose==="howl"?-1:1),14));
    return {H,C,N,S,ma,jo,br,Sh,Hp,A,Lg,tl};}
  function wolfPath(R,T){const p=new Path2D(),{H,C,N,S,ma,jo,br,Sh,Hp,A,Lg,tl}=R;
    const M=wgo(S,ma,40),J=wgo(S,ma+jo,34),mz0=wgo(S,ma,8);
    const arm=(a,s0)=>{wcap(p,Sh,12,a.E,9,s0,.35,T);wcap(p,a.E,9,a.W,6.5,s0+4,.45,T);wcap(p,a.W,6,a.Hd,4,s0+8,.1,T);};
    const leg=(l,s0)=>{wcap(p,Hp,17,l.K,11,s0,.3,T);wcap(p,l.K,9.5,l.Hk,7,s0+4,.35,T);wcap(p,l.Hk,7,l.An,5,s0+8,.12,T);wcap(p,l.An,5,l.Ft,3.5,s0+12,0,T);};
    A.filter(a=>a.far).forEach(a=>arm(a,11));Lg.slice(1).forEach(l=>leg(l,23));
    for(let i=0;i<tl.length-1;i++)wcap(p,tl[i],9.5-i*1.3,tl[i+1],8.2-i*1.4,41+i*5,1.05,T);
    wcap(p,H,22,C,30*br,47,.35,T);wcap(p,[H[0]+8,H[1]+6],16,[C[0]+8,C[1]+14],24*br,49,.3,T);
    wcap(p,C,26*br,Sh,17,51,.55,T);
    wcap(p,[C[0]-10,C[1]+8],18,[N[0]-7,N[1]+2],15,53,1.0,T);wcap(p,C,22*br,N,17,59,.8,T);
    wcap(p,N,16,S,12,61,.5,T);wcap(p,S,12,mz0,9.5,63,.12,T);wcap(p,mz0,8.2,M,3.8,67,.03,T);wcap(p,wgo(S,ma-1.2,6),5,wgo(S,ma-.35,14),3,69,0,T);
    wcap(p,wgo(S,ma+jo,4),6.5,J,2.6,71,.06,T);
    const ea=ma-2.3,eb=wgo(S,ea+.55,9),ec=wgo(S,ea-.5,8);wtri(p,eb,wgo(S,ea,28),ec);wtri(p,wgo(S,ea+.15,7),wgo(S,ea+.3,24),wgo(S,ea+.9,9));
    Lg.slice(0,1).forEach(l=>leg(l,73));A.filter(a=>!a.far).forEach(a=>arm(a,97));
    A.forEach(a=>{for(let k=-1;k<=1;k++){const ang=a.a3+k*.38,b=wgo(a.Hd,ang,2),t=wgo(a.Hd,ang+.32,15);wtri(p,wgo(b,ang+1.57,2),t,wgo(b,ang-1.57,2));}});
    Lg.forEach(l=>{for(let k=-1;k<=1;k++){const ang=l.a4+k*.3,b=wgo(l.Ft,ang,1.5),t=wgo(l.Ft,ang+.38,10);wtri(p,wgo(b,ang+1.57,1.6),t,wgo(b,ang-1.57,1.6));}});
    return p;}
  function wlow(R){let m=-1e9;R.Lg.forEach(l=>{m=Math.max(m,l.Ft[1]+4,l.An[1]+5);});R.A.forEach(a=>{m=Math.max(m,a.Hd[1]+4);});return m;}
  function wolfDraw(x,y,sc,dir,pose,g,a,rot,T,light){if(R3.on){R3.wolf(x,y,sc,dir,pose,g,a,rot,T);return;}const R=wolfRig(pose,g,T),p=wolfPath(R,T),S=R.S,ma=R.ma,jo=R.jo;
    ctx.save();ctx.translate(x,y);ctx.rotate(rot||0);ctx.scale(sc*dir,sc);if(pose!=="leap")ctx.translate(0,-wlow(R));else ctx.translate(-R.C[0]*.5,-R.C[1]*.5);
    if(pose!=="howl"){const cx=R.C[0]*.5,cy=R.C[1]*.5-10,au=ctx.createRadialGradient(cx,cy,6,cx,cy,120);au.addColorStop(0,"rgba(170,255,200,"+(.16*a).toFixed(3)+")");au.addColorStop(1,"rgba(170,255,200,0)");
      ctx.fillStyle=au;ctx.beginPath();ctx.arc(cx,cy,120,0,6.2832);ctx.fill();}
    const rim="rgba(222,255,226,"+(.85*a).toFixed(3)+")";
    if(pose==="howl"){ctx.strokeStyle=rim;ctx.lineWidth=2.6/sc;ctx.lineJoin="round";ctx.stroke(p);}
    else{const lx=(light?light[0]:-.4)*dir,ly=light?light[1]:-.9,k=1.9/sc;ctx.save();ctx.translate(lx*k,ly*k);ctx.fillStyle=rim;ctx.fill(p);ctx.restore();}
    ctx.fillStyle="rgba(9,5,13,"+a.toFixed(3)+")";ctx.fill(p);
    if(jo>.2){ctx.beginPath();ctx.fillStyle="rgba(240,236,224,"+(.95*a).toFixed(3)+")";
      for(const t of [.4,.56,.72,.88]){const u=wgo(S,ma,40*t),d=wgo(u,ma+Math.PI/2,7.2-3.8*t),v=wgo(S,ma+jo,34*t),e=wgo(v,ma+jo-Math.PI/2,5.2-2.8*t),big=t===.88?1.7:1;
        wtri(ctx,d,wgo(d,ma+Math.PI/2,3.4*big),wgo(d,ma,2.4));wtri(ctx,e,wgo(e,ma+jo-Math.PI/2,2.8*big),wgo(e,ma+jo,2));}
      ctx.fill();}
    const E=wgo(S,ma-.62,9.5),eg=ctx.createRadialGradient(E[0],E[1],0,E[0],E[1],6.5);eg.addColorStop(0,"rgba(255,60,40,"+a.toFixed(3)+")");eg.addColorStop(1,"rgba(255,30,20,0)");
    ctx.fillStyle=eg;ctx.beginPath();ctx.arc(E[0],E[1],6.5,0,6.2832);ctx.fill();ctx.fillStyle="rgba(255,210,180,"+a.toFixed(3)+")";ctx.beginPath();ctx.ellipse(E[0],E[1],2.2,1.3,ma,0,6.2832);ctx.fill();
    ctx.restore();}
  function wolfTick(h,dt,a,onMoon){const w=h.wolf;if(!w)return;const [mx,my]=h.moon,gy=H-17*h.s-12,sRun=h.s*1.25,sMoon=.6,T=h.t;
    const light=(x,y)=>{const dx=mx-x,dy=my-y,l=Math.hypot(dx,dy)||1;return [dx/l,dy/l];};
    if(onMoon){w.t+=dt;
      if(w.st==="wait"&&h.t>2.2){w.st="howl";w.t=0;SFX.howl();w.dir=mx<W/2?1:-1;}
      if(w.st==="howl"&&w.t>2.6){w.st="leap";w.t=0;w.x0=mx;w.y0=my+72;w.x1=Math.max(90,Math.min(W-90,mx+w.dir*Math.min(440,W*.3)));SFX.whoosh();}
      if(w.st==="leap"&&w.t>1.3){w.st="land";w.t=0;SFX.thud();shake(.75);SFX.growl();
        for(let i=0;i<4;i++)emit("m",w.x1+R(-40,40),gy,4,()=>({vx:R(-110,110),vy:R(-90,-20),r:R(6,13),l:R(.6,1.3)}));}
      if(w.st==="land"&&w.t>.55){w.st="run";w.t=0;w.x=w.x1;w.g=0;}
      if(w.st==="howl"||w.st==="leap"&&w.t<.4){const k=w.st==="howl"?Math.min(1,w.t/.5):1-w.t/.4,R0=40+62*k;
        /* the moon swells behind a rocky crag */
        const gl2=ctx.createRadialGradient(mx,my,R0*.6,mx,my,R0*2.6);gl2.addColorStop(0,"rgba(230,255,215,"+(.4*k*a).toFixed(3)+")");gl2.addColorStop(1,"rgba(230,255,215,0)");
        ctx.fillStyle=gl2;ctx.fillRect(mx-R0*2.6,my-R0*2.6,R0*5.2,R0*5.2);ctx.fillStyle="rgba(232,250,214,"+(.96*a*k).toFixed(3)+")";ctx.beginPath();ctx.arc(mx,my,R0,0,6.2832);ctx.fill();
        ctx.fillStyle="rgba(150,175,140,"+(.35*a*k).toFixed(3)+")";for(const [cx,cy,cr] of [[-.3,-.2,.18],[.28,.15,.14],[.12,-.42,.1],[-.36,.34,.12]]){ctx.beginPath();ctx.arc(mx+cx*R0,my+cy*R0,cr*R0,0,6.2832);ctx.fill();}
        ctx.fillStyle="rgba(9,5,13,"+(a*k).toFixed(3)+")";ctx.beginPath();ctx.moveTo(mx-R0*1.25,my+R0*1.05);ctx.lineTo(mx-R0*.55,my+R0*.62);ctx.lineTo(mx-R0*.2,my+R0*.7);ctx.lineTo(mx+R0*.05,my+R0*.5);
        ctx.lineTo(mx+R0*.32,my+R0*.58);ctx.lineTo(mx+R0*.7,my+R0*.48);ctx.lineTo(mx+R0*1.3,my+R0*1.05);ctx.closePath();ctx.fill();
        if(w.st==="howl")wolfDraw(mx+R0*.05*w.dir,my+R0*.52,sMoon*(R0/102),w.dir,"howl",0,a*k,0,T);}
      return;}
    if(w.st==="leap"){const u=Math.min(1,w.t/1.3),x=w.x0+(w.x1-w.x0)*u,y=w.y0+(gy-60*sRun-w.y0)*u*u-Math.sin(Math.PI*u)*170,sc=sMoon+(sRun-sMoon)*Math.pow(u,1.3),rot=(u-.35)*.75*w.dir;
      wolfDraw(x,y,sc,w.dir,"leap",0,a,rot,T,light(x,y));}
    else if(w.st==="land"){const c=Math.sin(Math.min(1,w.t/.55)*Math.PI);ctx.save();ctx.translate(w.x1,gy);ctx.scale(1+.06*c,1-.1*c);wolfDraw(0,0,sRun,w.dir,"land",0,a,0,T,light(w.x1,gy));ctx.restore();}
    else if(w.st==="run"){w.x+=w.dir*460*dt;w.g+=dt*13;if((w.dir>0&&w.x>W+180)||(w.dir<0&&w.x<-180)){w.st="gone";return;}
      wolfDraw(w.x,gy+Math.abs(Math.cos(w.g))*-5*sRun,sRun,w.dir,"run",w.g,a,0,T,light(w.x,gy));
      if(Math.random()<.4)emit("m",w.x-w.dir*40*sRun,gy,1,()=>({vx:-w.dir*R(20,70),vy:R(-50,-10),r:R(3,7),l:R(.4,.9)}));}}
  /* v17 ghost painter (window.ghostPaint): a glowing spectre drawn in head-radius units and scaled to S px. A soft aura, a domed head
     whose body flows down into 5 tattered tendrils that trail behind it (lean = forward speed 0..1), two wispy arms reaching ahead
     (arms 0 low … 1.3 raised), a hollow face turned three-quarters to the front: dark sockets with faint glowing pupils and a mouth that
     opens into a wail (mouth 0..1). It faces +x; dir (-1..1) mirrors it, and values in between squash it while it turns round.
     o.tint 1 = sickly green instead of moon-blue; o.light adds a soft outline so it still reads on light pages. */
  const GSPR={};
  function gSprite(k){if(GSPR[k])return GSPR[k];const c=document.createElement("canvas");c.width=c.height=64;const g=c.getContext("2d"),r=g.createRadialGradient(32,32,0,32,32,32);
    r.addColorStop(0,"rgba("+k+",.55)");r.addColorStop(.4,"rgba("+k+",.22)");r.addColorStop(1,"rgba("+k+",0)");g.fillStyle=r;g.fillRect(0,0,64,64);return GSPR[k]=c;}
  function ghostPaint(c,x,y,S,dir,t,al,o){o=o||{};if(al<=.01||S<1)return;
    const ph=o.ph||0,lean=Math.max(0,Math.min(1,o.lean||0)),mouth=o.mouth||0,arms=o.arms==null?.35:o.arms,tint=o.tint?1:0;
    const C0=tint?"214,255,228":"238,245,255",C1=tint?"150,255,190":"165,215,255",AU=tint?"120,255,170":"150,200,255";
    c.save();c.translate(x,y);c.scale(S*(Math.abs(dir)<.12?.12*Math.sign(dir||1):dir),S);c.rotate(lean*.32);
    c.globalAlpha=al;c.drawImage(gSprite(AU),-3.6,-3.2,7.2,7.6);c.globalAlpha=1;
    const L=2.75+.2*Math.sin(t*2.1+ph)+lean*.5,tl=-lean*1.5-.15*Math.sin(t*1.7+ph);
    const body=()=>{c.beginPath();c.moveTo(-1,.05);c.arc(0,0,1,Math.PI,0);c.bezierCurveTo(1.08,.85,1.02+tl*.25,1.6,.92+tl*.55,L*.72);
      for(let i=0;i<5;i++){const u0=.92-i*.38,u1=u0-.38,um=(u0+u1)/2,w=Math.sin(t*5.2+ph+i*1.4),ln=L+.3*w+(i%2?.35:0)+i*.08;
        c.quadraticCurveTo(u0+tl*.75,ln*.9,um+tl*(1+i*.08)+.12*w,ln);c.quadraticCurveTo(u1+tl*.7,L*.78+.12*Math.sin(t*4.3+i*2),u1+tl*.55,L*.72);}
      c.bezierCurveTo(-1+tl*.25,1.6,-1.08,.85,-1,.05);c.closePath();};
    /* a wispy sleeve: wide at the shoulder, bending at the elbow, tapering to a curled tip; it waves and rises when scared */
    const arm=(sd,a0)=>{const sx=sd?.45:-.45,sy=.6,w=Math.sin(t*6.5+ph+sd*2.1),w2=Math.sin(t*4.1+ph+sd),
        ex=sx+1.5+.25*arms,ey=sy+.25-1.3*arms+.3*w2,mx=(sx+ex)/2+.1,my=(sy+ey)/2+.35-.2*arms+.15*w,
        ag=c.createLinearGradient(sx,sy,ex,ey);ag.addColorStop(0,"rgba("+C0+",0)");ag.addColorStop(.3,"rgba("+C0+","+(a0*al).toFixed(3)+")");ag.addColorStop(1,"rgba("+C1+",0)");
      c.fillStyle=ag;c.beginPath();c.moveTo(sx,sy-.2);c.quadraticCurveTo(mx,my-.16,ex,ey);c.quadraticCurveTo(mx,my+.16,sx,sy+.2);c.closePath();c.fill();};
    arm(0,.4);
    body();const g=c.createLinearGradient(0,-1,tl*.4,L+.5);g.addColorStop(0,"rgba("+C0+","+(.93*al).toFixed(3)+")");g.addColorStop(.42,"rgba("+C0+","+(.7*al).toFixed(3)+")");
    g.addColorStop(.78,"rgba("+C1+","+(.28*al).toFixed(3)+")");g.addColorStop(1,"rgba("+C1+",0)");c.fillStyle=g;c.fill();
    if(o.light){c.strokeStyle="rgba(70,80,130,"+(.28*al).toFixed(3)+")";c.lineWidth=.07;c.stroke();}
    arm(1,.6);
    /* inner light on the crown */
    const hg=c.createRadialGradient(-.25,-.5,0,-.25,-.5,1.05);hg.addColorStop(0,"rgba(255,255,255,"+(.55*al).toFixed(3)+")");hg.addColorStop(1,"rgba(255,255,255,0)");
    c.fillStyle=hg;c.beginPath();c.arc(0,0,1,0,6.2832);c.fill();
    /* hollow face, three-quarters to the front: slanted sockets, glowing pupils, a wailing mouth */
    const bl=Math.sin(t*.9+ph*3)>.97?.15:1;
    c.fillStyle="rgba(14,8,30,"+(.88*al).toFixed(3)+")";
    for(const [ex,ey,rx,ry,rt] of [[-.06,-.18,.15,.25*bl,-.22],[.56,-.15,.14,.23*bl,.2],[.27,.5+.08*mouth,.1+.06*mouth,.07+.28*mouth,0]]){c.beginPath();c.ellipse(ex,ey,rx,ry,rt,0,6.2832);c.fill();}
    if(bl>.5){const pg=.55+.45*Math.sin(t*3+ph);c.fillStyle="rgba("+(tint?"170,255,140":"150,235,255")+","+(pg*al).toFixed(3)+")";c.beginPath();
      c.arc(-.02,-.13,.05,0,6.2832);c.moveTo(.635,-.11);c.arc(.59,-.11,.045,0,6.2832);c.fill();}
    c.restore();}
  window.ghostPaint=ghostPaint;

  /* v17 roaming ghosts of the haunted ride (hs.ghosts, 8): each wanders on its own, steering toward a new random point every 2–4 s,
     bobbing and turning round smoothly (g.f eases between -1 and 1). Every 5–9 s one of them either swoops at the viewer (grows ×6 and
     fades, then returns from an edge) or circles the moon for a while. Any ghost within 300 px of the rider flees screaming, arms up.
     The rider shoots them too (shoot() targets hs.run + hs.ghosts): a hit one bursts into green mist and comes back 2.6 s later. */
  function roamer(i){const L=Math.random()<.5;return {x:R(W*.08,W*.92),y:R(H*.1,H*.6),vx:0,vy:0,tx:R(W*.1,W*.9),ty:R(H*.1,H*.62),tt:R(1.5,3.5),
      s:R(.85,1.25),ph:R(0,6.28),t:-i*.6,f:L?1:-1,mode:"roam",mt:0,sc:.3,al:0,mouth:.6,arms:.9,tint:Math.random()<.35,tr:[],cy:0,dead:false,dt:0};}
  function mist(x,y,S,k,a){for(let j=0;j<3;j++){const rr=S*(1+k*3.2)*(.55+j*.3),cx=x+(j-1)*S*.3,cy=y-j*S*.2,gg=ctx.createRadialGradient(cx,cy,rr*.2,cx,cy,rr);
      gg.addColorStop(0,"rgba(160,255,190,"+(.45*(1-k)*a).toFixed(3)+")");gg.addColorStop(1,"rgba(120,255,170,0)");ctx.fillStyle=gg;ctx.beginPath();ctx.arc(cx,cy,rr,0,6.2832);ctx.fill();}}
  function roam(h,dt,a){const r=run,me=r?toW(0,-60):null;
    h.swT=(h.swT==null?4:h.swT)-dt;
    if(h.swT<=0){h.swT=R(5,9);const L=h.ghosts.filter(g=>g.mode==="roam"&&!g.dead&&g.t>1.5&&g.x>0&&g.x<W);
      if(L.length){const g=L[Math.floor(Math.random()*L.length)];
        if(Math.random()<.55){g.mode="swoop";g.mt=0;g.sx=g.x;g.sy=g.y;SFX.wail();}else{g.mode="orbit";g.mt=0;g.oa=Math.atan2(g.y-h.moon[1],g.x-h.moon[0]);}}}
    for(const g of h.ghosts){g.t+=dt;
      if(g.dead){g.dt+=dt;if(g.dt<1.1)mist(g.x,g.cy,12*g.s,g.dt/1.1,a);if(g.dt>2.6)Object.assign(g,roamer(0),{t:0});continue;}
      if(g.t<0)continue;g.al=Math.min(1,g.al+dt*.9);if(g.mode!=="swoop")g.sc+=(1-g.sc)*Math.min(1,dt*2.5);
      let tx=g.tx,ty=g.ty,max=95*g.s,scared=false;const dx=me?g.x-me[0]:0,dy=me?g.y-me[1]:0,dr=Math.hypot(dx,dy);
      if(me&&dr<300&&g.mode!=="swoop"){scared=true;const k=1/(dr||1);tx=g.x+dx*k*260;ty=Math.max(H*.06,Math.min(H*.72,g.y+dy*k*200-90));max=330*g.s;if(g.mode==="orbit")g.mode="roam";}
      if(g.mode==="swoop"){g.mt+=dt;const u=Math.min(1,g.mt/1.8),e=u*u;g.x=g.sx+(W/2-g.sx)*e;g.y=g.sy+(H*.42-g.sy)*e;g.sc=1+e*5;g.al=1-Math.pow(u,1.6);g.mouth=1;g.arms=1.25;
        g.vx=(W/2-g.sx)*.4;g.vy=0;if(u>=1){Object.assign(g,roamer(0),{t:0});continue;}}
      else{if(g.mode==="orbit"){g.mt+=dt;g.oa+=dt*1.2;const rr=100+22*Math.sin(g.mt*2);tx=h.moon[0]+Math.cos(g.oa)*rr;ty=h.moon[1]+Math.sin(g.oa)*rr*.7;max=230*g.s;if(g.mt>6)g.mode="roam";}
        else if(!scared){g.tt-=dt;if(g.tt<=0||Math.hypot(g.tx-g.x,g.ty-g.y)<40){g.tt=R(2,4);g.tx=R(W*.06,W*.94);g.ty=R(H*.1,H*.66);}}
        const ex=tx-g.x,ey=ty-g.y,el=Math.hypot(ex,ey)||1,sp=Math.min(max,el*2),k=Math.min(1,dt*(scared?4:1.5));
        g.vx+=(ex/el*sp-g.vx)*k;g.vy+=(ey/el*sp-g.vy)*k;g.x+=g.vx*dt;g.y+=g.vy*dt;
        g.mouth+=((scared?1:.12+.12*Math.sin(g.t*.7+g.ph))-g.mouth)*Math.min(1,dt*5);g.arms+=((scared?1.25:.3+.25*Math.sin(g.t*1.3+g.ph))-g.arms)*Math.min(1,dt*4);
        if(scared&&!g.scr){g.scr=1;if(Math.random()<.35)SFX.wail();}if(!scared)g.scr=0;
        if(g.x<-160||g.x>W+160||g.y<-160||g.y>H+120){Object.assign(g,roamer(0),{t:0});continue;}}
      const want=g.vx>12?1:g.vx<-12?-1:g.f>=0?1:-1;g.f+=(want-g.f)*Math.min(1,dt*3.5);
      const y=g.y+Math.sin(g.t*2.2+g.ph)*7,S=12*g.s*g.sc,AU=g.tint?"120,255,170":"150,200,255";g.cy=y+S*.6;
      g.tr.push([g.x,y]);if(g.tr.length>9)g.tr.shift();
      for(let i=0;i<g.tr.length-1;i++){const q=(i+1)/g.tr.length,[x0,y0]=g.tr[i];ctx.globalAlpha=.3*q*g.al*a;ctx.drawImage(gSprite(AU),x0-S*1.2,y0+S*.2,S*2.4,S*2.4);}ctx.globalAlpha=1;
      ghostPaint(ctx,g.x,y,S,g.f,g.t+g.ph,g.al*a*.95,{lean:Math.hypot(g.vx,g.vy)/(260*g.s),mouth:g.mouth,arms:g.arms,ph:g.ph,tint:g.tint});}}
  /* v16 inferno: as he rides, the road behind him, the coffins and the trees catch fire (inferno() below); each flame is a
     tongue(x,y,h,w) emitter for the v18 particle fire. Drawn on #riderLow, above the trees and below the 3D rider. */
  /* v19 GPU fire (canvas #fireGL, WebGL2, half resolution, between #riderLow and the 3D rider): each tongue(x,y,h,w) is one instanced
     quad whose fragment shader draws a procedural flame: two layers of domain-warped fractal noise scroll upward, bend the flame and
     tear its tips apart; the silhouette narrows with height; colour follows a blackbody ramp (the theme's pal.f: deep red → orange →
     yellow → white core) and a soft bloom halo is added. Output is premultiplied with alpha 0, so the page composites it additively.
     Falls back to the 2D particle fire when WebGL2 is unavailable. */
  /* v21 smoke plumes: a second instanced program draws billowing smoke columns (x, y = plume base, w, h, seed, alpha) BEFORE the
     fire, blended normally (premultiplied), dark grey with lighter billows, lit orange from underneath by the fire (c2) */
  const GF=(function(){let gl=null,cvF=null,ok=null,prog,vao,ib,U={},data=new Float32Array(6*1400),drawn=false,sp,svao,sib,SU={},sdata=new Float32Array(6*200);
    const SVS="#version 300 es\nin vec2 aC;in vec4 aI;in vec2 aJ;uniform vec2 uR;out vec2 vU;out float vS;out float vK;"+
      "void main(){vec2 p=aI.xy+vec2(aC.x*aI.z,-aC.y*aI.w);vU=aC;vS=aJ.x;vK=aJ.y;gl_Position=vec4(p.x/uR.x*2.-1.,1.-p.y/uR.y*2.,0.,1.);}";
    const SFS="#version 300 es\nprecision highp float;in vec2 vU;in float vS;in float vK;uniform float uT;uniform vec3 c2;out vec4 o;"+
      "float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}"+
      "float nz(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(hh(i),hh(i+vec2(1,0)),u.x),mix(hh(i+vec2(0,1)),hh(i+vec2(1,1)),u.x),u.y);}"+
      "float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*nz(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}"+
      "void main(){float y=vU.y,t=uT*.32+vS*5.7;"+
      "float lean=y*y*.55*sin(vS*3.1+uT*.15);"+
      "vec2 p=vec2(vU.x*1.3-lean,y*2.2-t);"+
      "float w=fb(p*1.3+vec2(0.,-t*.4));"+
      "float n=fb(p*2.1+vec2(w*1.8,w));"+
      "float wd=mix(.28,1.,pow(y,.55));"+
      "float x=(vU.x-lean)/wd;"+
      "float d=(1.-smoothstep(.15,1.,abs(x)+(n-.5)*.7))*smoothstep(0.,.18,y)*(1.-smoothstep(.45,1.,y));"+
      "d*=smoothstep(.28,.72,n+.12);"+
      "float a=clamp(d*.85,0.,1.)*vK;"+
      "vec3 col=mix(vec3(.06,.055,.065),vec3(.24,.23,.26),smoothstep(.3,.8,n));"+
      "col+=vec3(.1,.12,.17)*smoothstep(.35,1.,y)*smoothstep(.4,.9,n);"+
      "col+=c2*1.15*pow(1.-y,3.)*smoothstep(.2,.8,n);"+
      "o=vec4(col*a,a);}";
    const VS="#version 300 es\nin vec2 aC;in vec4 aI;in vec2 aJ;uniform vec2 uR;out vec2 vU;out float vS;out float vK;"+
      "void main(){vec2 p=aI.xy+vec2(aC.x*aI.z*1.6,-(aC.y*1.3-.1)*aI.w);vU=vec2(aC.x*1.6,aC.y*1.3-.1);vS=aJ.x;vK=aJ.y;"+
      "gl_Position=vec4(p.x/uR.x*2.-1.,1.-p.y/uR.y*2.,0.,1.);}";
    const FSH="#version 300 es\nprecision highp float;in vec2 vU;in float vS;in float vK;uniform float uT;uniform vec3 c0,c1,c2,c3;out vec4 o;"+
      "float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}"+
      "float nz(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(hh(i),hh(i+vec2(1,0)),u.x),mix(hh(i+vec2(0,1)),hh(i+vec2(1,1)),u.x),u.y);}"+
      "float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*nz(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}"+
      "void main(){vec2 u=vU;float t=uT*1.15+vS*7.31;"+
      "float n1=fb(vec2(u.x*1.5+vS*3.1,u.y*1.3-t*1.7));"+
      "float n2=fb(vec2(u.x*3.4-vS,u.y*3.1-t*2.9)+vec2(n1*1.6,n1));"+
      "float y=max(u.y,0.);"+
      "float x=u.x+(n1-.5)*1.2*y+(n2-.5)*.4*y+sin(uT*2.1+vS*5.3)*.3*y*y;"+
      "float w=mix(.95,.18,pow(min(y,1.2),.7));"+
      /* flame field: wide hot base, cooling with height, torn by turbulence that grows toward the tips */
      "float f=(1.-abs(x)/w)*1.1-pow(y,1.3)*.9+(n2-.55)*(.6+y*1.5)+(n1-.5)*.3;"+
      "f=clamp(f*smoothstep(-.12,.14,u.y+(n1-.5)*.1)*(1.-.35*smoothstep(.0,-.12,u.y)),0.,1.);"+
      "float tp=pow(f,1.15);"+
      "vec3 col=mix(c3*.35,c3,smoothstep(.0,.25,tp));col=mix(col,c2,smoothstep(.2,.5,tp));col=mix(col,c1,smoothstep(.45,.75,tp));col=mix(col,c0,smoothstep(.8,1.,tp));"+
      "float a=smoothstep(.0,.28,f);"+
      "float ef=(1.-smoothstep(.55,1.,abs(u.x)/1.6))*(1.-smoothstep(.7,1.,(u.y+.1)/1.3))*smoothstep(-.1,.02,u.y);"+
      "float g=exp(-2.6*length(vec2(u.x*.7,(u.y-.28)*.9)))*ef;"+
      "vec3 c=col*a*1.15+c2*g*.13+c3*g*.09;"+
      "o=vec4(c*vK,0.);}";
    const v3=s=>s.split(",").map(v=>+v/255);
    function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
    function init(before){if(ok!==null)return ok;ok=false;
      try{cvF=document.createElement("canvas");cvF.id="fireGL";cvF.setAttribute("aria-hidden","true");
        gl=cvF.getContext("webgl2",{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false});if(!gl)return false;
        prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,VS));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FSH));gl.linkProgram(prog);
        if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog));
        ["uR","uT","c0","c1","c2","c3"].forEach(k=>U[k]=gl.getUniformLocation(prog,k));
        vao=gl.createVertexArray();gl.bindVertexArray(vao);
        const qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,0,1,0,-1,1,1,1]),gl.STATIC_DRAW);
        const lc=gl.getAttribLocation(prog,"aC");gl.enableVertexAttribArray(lc);gl.vertexAttribPointer(lc,2,gl.FLOAT,false,0,0);
        ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferData(gl.ARRAY_BUFFER,data.byteLength,gl.DYNAMIC_DRAW);
        const li=gl.getAttribLocation(prog,"aI"),lj=gl.getAttribLocation(prog,"aJ");
        gl.enableVertexAttribArray(li);gl.vertexAttribPointer(li,4,gl.FLOAT,false,24,0);gl.vertexAttribDivisor(li,1);
        gl.enableVertexAttribArray(lj);gl.vertexAttribPointer(lj,2,gl.FLOAT,false,24,16);gl.vertexAttribDivisor(lj,1);
        gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
        /* smoke program: same corner buffer, its own instance buffer */
        sp=gl.createProgram();gl.attachShader(sp,sh(gl.VERTEX_SHADER,SVS));gl.attachShader(sp,sh(gl.FRAGMENT_SHADER,SFS));gl.linkProgram(sp);
        if(!gl.getProgramParameter(sp,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(sp));["uR","uT","c2"].forEach(k=>SU[k]=gl.getUniformLocation(sp,k));
        svao=gl.createVertexArray();gl.bindVertexArray(svao);gl.bindBuffer(gl.ARRAY_BUFFER,qb);const sc=gl.getAttribLocation(sp,"aC");gl.enableVertexAttribArray(sc);gl.vertexAttribPointer(sc,2,gl.FLOAT,false,0,0);
        sib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,sib);gl.bufferData(gl.ARRAY_BUFFER,sdata.byteLength,gl.DYNAMIC_DRAW);
        const si=gl.getAttribLocation(sp,"aI"),sj=gl.getAttribLocation(sp,"aJ");
        gl.enableVertexAttribArray(si);gl.vertexAttribPointer(si,4,gl.FLOAT,false,24,0);gl.vertexAttribDivisor(si,1);
        gl.enableVertexAttribArray(sj);gl.vertexAttribPointer(sj,2,gl.FLOAT,false,24,16);gl.vertexAttribDivisor(sj,1);gl.bindVertexArray(null);
        before.parentNode.insertBefore(cvF,before);ok=true;}catch(e){console.warn("GPU fire unavailable, using the 2D fire",e);ok=false;}
      return ok;}
    function draw(TG,T,a,W,H,pal,rs,SK){if(!ok)return;rs=rs||.5;SK=SK||[];const n=Math.min(TG.length/5,1400),m=Math.min(SK.length/6,200);
      if(!n&&!m){if(drawn){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);drawn=false;}return;}
      const w=Math.max(1,Math.round(W*rs)),h=Math.max(1,Math.round(H*rs));if(cvF.width!==w||cvF.height!==h){cvF.width=w;cvF.height=h;}
      for(let i=0;i<n;i++){const j=i*5,k=i*6;data[k]=TG[j];data[k+1]=TG[j+1];data[k+2]=TG[j+3];data[k+3]=TG[j+2];data[k+4]=TG[j+4]%61;data[k+5]=a;}
      gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      if(m){for(let i=0;i<m*6;i++)sdata[i]=SK[i];gl.useProgram(sp);gl.bindVertexArray(svao);gl.bindBuffer(gl.ARRAY_BUFFER,sib);gl.bufferSubData(gl.ARRAY_BUFFER,0,sdata,0,m*6);
        gl.uniform2f(SU.uR,W,H);gl.uniform1f(SU.uT,T%600);gl.uniform3fv(SU.c2,v3(pal.f[2]));gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,m);gl.blendFunc(gl.ONE,gl.ONE);}
      gl.useProgram(prog);gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferSubData(gl.ARRAY_BUFFER,0,data,0,n*6);
      gl.uniform2f(U.uR,W,H);gl.uniform1f(U.uT,T%600);gl.uniform3fv(U.c0,v3(pal.f[0]));gl.uniform3fv(U.c1,v3(pal.f[1]));gl.uniform3fv(U.c2,v3(pal.f[2]));gl.uniform3fv(U.c3,v3(pal.f[3]));
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,n);drawn=true;}
    function clear(){if(ok&&drawn){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);drawn=false;}}
    return {init,draw,clear,get el(){return cvF;},get ok(){return ok;}};})();
  /* v18 particle fire (replaces the drawn tongues): every tongue(x,y,h,w) of a frame is an emitter. Particles are soft round sprites
     drawn additively; they rise with buoyancy, lick sideways in turbulence and are pulled back toward their flame's axis (so flames
     narrow upward), shrinking as they cool white-hot → yellow → orange → deep red → nothing. Overlapping sprites build the bright core
     by themselves. Dark smoke rises from the taller flames. Sprites are pre-rendered per palette (FS: 24 heat steps + smoke).
     Budget: at most 2600 flame and 260 smoke particles; emission is scaled down evenly when the budget is full. */
  const TG=[],FP=[],SM=[];let FS=null,FSp=null,FC=null,fx=null;
  /* the fire is drawn into a half-resolution buffer and scaled up: the soft upscale melts the particles into one glowing volume */
  function fireCanvas(){const w=Math.ceil(W/2),h=Math.ceil(H/2);if(!FC){FC=document.createElement("canvas");fx=FC.getContext("2d");}
    if(FC.width!==w||FC.height!==h){FC.width=w;FC.height=h;}return fx;}
  let FK=1;function tongue(x,y,h,w,ph){h*=FK;w*=.5+.5*FK;if(h>1.5)TG.push(x,y,h,w,ph);}
  /* v22 is it raining (chosen weather, or the live weather where the user is)? */
  function rainy(){try{const m=WX.mode,k=m==="live"?(WX.live&&WX.live.kind):m;return k==="rain"||k==="storm";}catch(e){return false;}}
  const SKS=[];function plume(x,y,w,h,seed,al){if(al>.02&&h>20&&SKS.length<1200)SKS.push(x,y,w,h,seed%61,al);}
  function fireSprites(){if(FS&&FSp===pal)return FS;FSp=pal;const mix=(a,b,u)=>a.split(",").map((v,i)=>Math.round(+v+(+b.split(",")[i]-v)*u)).join(",");
    const mk=(rgb,soft)=>{const c=document.createElement("canvas");c.width=c.height=64;const g=c.getContext("2d"),r=g.createRadialGradient(32,32,0,32,32,32);
      r.addColorStop(0,"rgba("+rgb+",1)");r.addColorStop(soft,"rgba("+rgb+",.42)");r.addColorStop(1,"rgba("+rgb+",0)");g.fillStyle=r;g.fillRect(0,0,64,64);return c;};
    FS={heat:[],smoke:mk("74,64,62",.2)};
    for(let i=0;i<24;i++){const u=1+i/23*3,k=Math.min(3,Math.floor(u));FS.heat.push(mk(mix(pal.f[k],pal.f[k+1],u-k),.3));}
    return FS;}
  function flushT(T,a,dt){const S=fireSprites(),gpu=GF.init(cv);
    /* emit: rate grows with flame width; flames taller than ~24 px also breathe out smoke */
    let E=0;for(let i=0;i<TG.length;i+=5)E+=(10+TG[i+3]*2.6)*dt;const room=Math.max(0,3200-FP.length),sc=E>room?room/E:1;
    for(let i=0;i<TG.length;i+=5){const x=TG[i],y=TG[i+1],h=TG[i+2],w=TG[i+3],ph=TG[i+4];let n=(10+w*2.6)*dt*sc;
      while(!gpu&&n>0){if(n<1&&Math.random()>n)break;n--;const L=R(.5,.9),up=h/L*R(.85,1.2);
        FP.push({x:x+R(-w,w)*.8,y:y+R(-2,2),ax:x,vx:R(-12,12),vy:-up*1.25,acc:up*1.9,t:0,L,s:Math.max(4,w*R(1.2,1.7)),ph:ph+R(0,6.28)});}
      if(!gpu&&h>24&&SM.length<260&&Math.random()<dt*(.35+w*.05))SM.push({x:x+R(-w,w)*.5,y:y-h*.85,vx:R(-8,8),vy:-R(28,48),t:0,L:R(1.8,2.8),s:w*R(1.1,1.6)+6});}
    if(gpu)GF.draw(TG,T,a,W,H,pal,lowQ?.34:.5,SKS);SKS.length=0;
    TG.length=0;
    /* smoke first (normal blending), then the fire on top (additive) */
    ctx.globalCompositeOperation="source-over";
    for(let i=SM.length-1;i>=0;i--){const p=SM[i];p.t+=dt;if(p.t>=p.L){SM[i]=SM[SM.length-1];SM.pop();continue;}const u=p.t/p.L;
      p.vx+=Math.sin(T*1.3+p.y*.01)*14*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const r=p.s*(1+u*2.6);
      ctx.globalAlpha=.2*Math.sin(Math.PI*Math.min(1,u*1.4))*a;ctx.drawImage(S.smoke,p.x-r,p.y-r,r*2,r*2);}
    if(gpu){ctx.globalAlpha=1;return;}
    const f=fireCanvas();f.setTransform(.5,0,0,.5,0,0);f.globalAlpha=1;f.clearRect(0,0,W,H);f.globalCompositeOperation="lighter";
    for(let i=FP.length-1;i>=0;i--){const p=FP[i];p.t+=dt;if(p.t>=p.L){FP[i]=FP[FP.length-1];FP.pop();continue;}const u=p.t/p.L;
      p.vy-=p.acc*dt;p.vy*=1-.5*dt;
      p.vx+=(Math.sin(T*8.5+p.y*.045+p.ph)*90+Math.sin(T*3.1+p.ph*2)*40)*dt+(p.ax-p.x)*5*dt;p.vx*=1-3*dt;
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      const r=p.s*(u<.15?.7+u*2:1.0-.55*(u-.15)/.85)*(.9+.2*Math.sin(T*23+p.ph)),hi=Math.min(23,Math.floor(Math.pow(u,1.25)*24));
      f.globalAlpha=Math.min(1,u*6)*(1-u*u)*.5*a;f.drawImage(S.heat[hi],p.x-r,p.y-r*1.3,r*2,r*2.6);}
    ctx.globalAlpha=1;ctx.globalCompositeOperation="lighter";ctx.imageSmoothingEnabled=true;ctx.drawImage(FC,0,0,W,H);}
  /* a soft fire-glow sprite (radial gradient drawn once per palette) */
  let GS=null,GSp=null;
  function glowSprite(){if(GS&&GSp===pal)return GS;GSp=pal;GS=document.createElement("canvas");GS.width=GS.height=64;const g=GS.getContext("2d"),r=g.createRadialGradient(32,32,0,32,32,32);
    r.addColorStop(0,"rgba("+pal.f[1]+",1)");r.addColorStop(.35,"rgba("+pal.g+",.55)");r.addColorStop(1,"rgba("+pal.g+",0)");g.fillStyle=r;g.fillRect(0,0,64,64);return GS;}
  /* the two big trees (TREE.fire): each point lights after a delay that grows with its height, so the fire climbs from the base */
  function treeFire(){const T=[];if(!window.TREE||!TREE.fire)return T;
    for(const side of ["R","L"]){const p=TREE.fire(side);if(!p.length)continue;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
      for(const q of p){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);}
      T.push({el:document.getElementById(side==="R"?"jungle":"jungleL"),x0,x1,y0,y1,t:null,
        pts:p.map(q=>({x:q[0],y:q[1],s:q[2],d:(y1-q[1])/Math.max(1,y1-y0)*2.4+R(0,.35),ph:R(0,6.28)}))});}
    return T;}
  function inferno(dt,T){const h=hs,r=run;if(!h||hz<=.01){GF.clear();return;}
    /* rain: the fire struggles (60% height), road fires die sooner, steam rises and it hisses now and then */
    if(h.wet==null)h.wet=rainy();FK+=((h.wet?.6:1)-FK)*Math.min(1,dt*2);
    if(h.wet){if(Math.random()<dt*.5)SFX.hiss(.6);for(const q of h.road||[])if(q.t>.3)q.t+=dt*.35;}const a=Math.min(1,hz*1.4);
    if(!h.road){h.road=[];h.trees=treeFire();h.gone=0;}
    if(!r)h.gone+=dt;const out=Math.max(0,1-h.gone/1.6);
    ctx.globalCompositeOperation="lighter";
    /* 1. the road: a burn spot every ~20 px behind the wheels or hooves; flames roar ~3 s, then a lava crack is left */
    if(r&&(r.mode==="bike"||r.mode==="horse")){const bx=r.x-r.dir*(r.mode==="bike"?44:58)*r.s;
      /* v19.1 a natural fire front, not a comb: irregular gaps, widths and heights under a slow wave envelope, the odd big flare */
      if(h.e1==null){h.e1=R(0,6.28);h.e2=R(0,6.28);h.gap=20;}
      if(h.rx==null||h.rm!==r.mode||Math.abs(bx-h.rx)>h.gap*r.s){h.rx=bx;h.rm=r.mode;h.gap=R(14,46);
        const env=.55+.3*Math.sin(bx*.009+h.e1)+.2*Math.sin(bx*.027+h.e2),fl=Math.random()<.12?R(1.4,1.9):1;
        if(bx>-40&&bx<W+40)h.road.push({x:bx,t:0,s:r.s*R(.85,1.2),ph:R(0,6.28),jy:R(-3,3),hv:Math.max(.3,env*R(.7,1.3)*fl),wv:R(.6,1.7),h2:R(.4,1.2),o:R(-14,14)});}}
    const gy=H-9,RD=h.road;let mn=1e9,mx=-1e9;
    ctx.strokeStyle="rgba("+pal.f[3]+","+(.6*a*out*(.8+.2*Math.sin(T*3))).toFixed(3)+")";ctx.lineWidth=2.4;ctx.lineJoin="round";ctx.beginPath();
    for(let i=0;i<RD.length;i++){const q=RD[i];q.t+=dt;if(q.t<.25)continue;const p=RD[i-1];
      if(p&&p.t>=.25&&Math.abs(p.x-q.x)<40*q.s)ctx.lineTo(q.x,gy+q.jy);else ctx.moveTo(q.x,gy+q.jy);}
    ctx.stroke();
    for(const q of RD){const k=(q.t<.3?q.t/.3:q.t<3.4?1:Math.max(0,1-(q.t-3.4)/1.4))*out;if(k<=0)continue;mn=Math.min(mn,q.x);mx=Math.max(mx,q.x);
      const age=q.t<.3?1.15:1-.4*Math.min(1,(q.t-.3)/3.1);if(!lowQ&&RD.indexOf(q)%6===0)plume(q.x,gy-55*q.s,180*q.s,330*q.s,q.x,.55*k*a);
      tongue(q.x,gy+q.jy,95*q.s*k*q.hv*age,24*q.s*k*q.wv,q.ph);if(!lowQ&&q.h2>.85)tongue(q.x+q.o*q.s,gy+q.jy,55*q.s*k*q.h2*age,14*q.s*k*q.wv,q.ph+2);
      if(Math.random()<.04*k)emit("e",q.x,gy-20*q.s,1,()=>({vx:R(-40,40),vy:R(-200,-90),r:R(1,2),l:R(.8,1.6)}));
}
    /* firelight on the ground: soft glow pools under every few burning spots (no hard edges) */
    if(mx>mn){const gs=glowSprite();RD.forEach((q,i)=>{if(i%3)return;const k=(q.t<.3?q.t/.3:q.t<3.4?1:Math.max(0,1-(q.t-3.4)/1.4))*out;if(k<=0)return;
      ctx.globalAlpha=.3*k*a;ctx.drawImage(gs,q.x-110*q.s*1.6,gy-150*q.s*1.6,220*q.s*1.6,220*q.s*1.6);});ctx.globalAlpha=1;}
    /* 2. coffins he passes burst into flame: tongues up both sides and over the top, a glow, sparks */
    for(const c of h.cof){if(c.px==null)continue;
      if(c.burn==null&&r&&h.t-c.at>.35&&Math.abs(r.x-c.x)<60*h.s+20){c.burn=0;SFX.whoosh();const cy=c.py-c.hh*.5;
        emit("f",c.px,cy,24,()=>({vx:R(-160,160),vy:R(-260,-60),r:R(4,9),l:R(.3,.6)}));emit("e",c.px,cy,18,()=>({vx:R(-220,220),vy:R(-300,-80),r:R(1,2.2),l:R(.6,1.3)}));}
      if(c.burn==null||c.ex)continue;c.burn+=dt;const k=Math.min(1,c.burn/.6)*out,cs=Math.cos(c.tl),sn=Math.sin(c.tl),Pt=(lx,ly)=>[c.px+lx*cs-ly*sn,c.py+lx*sn+ly*cs];
      const cx=Pt(0,-c.hh*.5),gg=ctx.createRadialGradient(cx[0],cx[1],0,cx[0],cx[1],c.hh*1.4);gg.addColorStop(0,"rgba("+pal.g+","+(.35*a*k).toFixed(3)+")");gg.addColorStop(1,"rgba("+pal.g+",0)");
      ctx.fillStyle=gg;ctx.fillRect(cx[0]-c.hh*1.4,cx[1]-c.hh*1.4,c.hh*2.8,c.hh*2.8);
      for(let i=0;i<4;i++){const v=-.12-.22*i;for(const sd of [-1,1]){const [x,y]=Pt(sd*c.w*(.38+.12*Math.min(1,-v/.68)),c.hh*v);tongue(x,y,c.hh*.6*k,c.w*.3*k,i*1.3+sd+c.x);}}
      for(let i=0;i<3;i++){const [x,y]=Pt((i-1)*c.w*.26,-c.hh);tongue(x,y+3,c.hh*.85*k,c.w*.36*k,i*2.1+c.x);}
      if(Math.random()<.25*k)emit("e",cx[0]+R(-c.w*.4,c.w*.4),cx[1]-c.hh*.4,1,()=>({vx:R(-60,60),vy:R(-240,-110),r:R(1,2),l:R(.8,1.5)}));
      if(Math.random()<.05*k)emit("m",cx[0],cx[1]-c.hh*.8,1,()=>({vx:R(-20,20),vy:R(-70,-30),r:R(12,20),l:R(1.8,2.8)}));
      plume(cx[0],cx[1]-c.hh*.9,c.hh*1.7,c.hh*4.2,c.x,.85*k*a*Math.min(1,c.burn/1.5));}
    /* 3. the graveyard's dead trees light up at the branch tips as he passes */
    const gl=H-17*h.s-12;
    for(const g of h.G){if(g.k!=="tree")continue;
      if(g.bt==null&&r&&Math.abs(r.x-g.S[0][0])<55){g.bt=0;const S0=g.S[0];
        g.fp=g.S.filter(s=>s[4]<3.2).slice(0,8).map(s=>[s[2],s[3],R(0,6.28),R(0,.7)]).concat([[(S0[0]+S0[2])/2,(S0[1]+S0[3])/2,R(0,6.28),0]]);}
      if(g.bt==null)continue;g.bt+=dt;
      for(const [x,y,ph,d] of g.fp){const k=Math.max(0,Math.min(1,(g.bt-d)/.5))*out;tongue(x,gl+y+4,36*k,10*k,ph);}
      const S0=g.S[0];plume(S0[0],gl-70,90,200,S0[0],.6*a*out*Math.min(1,g.bt/2));}
    /* 4. the big trees: lit as he passes, the fire climbs from the trunk to the crown; leaves turn ember-orange (CSS .burning) */
    for(const t of h.trees){
      if(t.t==null&&r&&r.x>t.x0-60&&r.x<t.x1+60){t.t=0;SFX.whoosh();shake(.25);}
      if(t.t==null)continue;t.t+=dt;if(t.el&&t.t>1.1&&out>0)t.el.classList.add("burning");
      let cx=0,cy=0,n=0;const gs=glowSprite();
      for(const [pi,p] of t.pts.entries()){if(lowQ&&pi%2||p.ex)continue;if(h.wet&&Math.random()<dt*.15)steam(p.x,p.y-p.s,1);const k=Math.max(0,Math.min(1,(t.t-p.d)/.6))*out;if(k<=0)continue;cx+=p.x;cy+=p.y;n++;
        /* a blaze, not a candle: a glow lights the limb and three tongues of different heights lick upwards */
        const gr=p.s*6*k;ctx.globalAlpha=.42*a*(.85+.15*Math.sin(T*11+p.ph));ctx.drawImage(gs,p.x-gr,p.y-gr*1.15,gr*2,gr*2);ctx.globalAlpha=1;
        tongue(p.x,p.y+p.s*.6,p.s*7*k*(.8+.4*Math.abs(Math.sin(p.ph))),p.s*2.1*k,p.ph);
        if(Math.random()<.02*k)emit("e",p.x,p.y-p.s,1,()=>({vx:R(-50,50),vy:R(-220,-100),r:R(1,2.2),l:R(1,2)}));
}
      if(n){const wd=t.x1-t.x0,sa=a*out*Math.min(1,t.t/2.5),top=Math.max(80,t.y0+30);
        plume(t.x0+wd*.3,top,wd*.95,Math.min(top+60,460),t.x0,sa);plume(t.x0+wd*.72,top+30,wd*.8,Math.min(top+40,420),t.x0+9,sa*.9);
        plume((t.x0+t.x1)/2,cy/n,wd*.7,300,t.x0+21,sa*.7);}
      if(n){cx/=n;cy/=n;const rr=Math.max(t.x1-t.x0,t.y1-t.y0)*.7+80,gg=ctx.createRadialGradient(cx,cy,0,cx,cy,rr);
        gg.addColorStop(0,"rgba("+pal.g+","+(.3*a*out*Math.min(1,t.t/2)).toFixed(3)+")");gg.addColorStop(1,"rgba("+pal.g+",0)");ctx.fillStyle=gg;ctx.fillRect(cx-rr,cy-rr,rr*2,rr*2);}
      if(out<=0&&t.el){t.el.classList.remove("burning");t.el=null;}}
    const fa=Math.min(1,TG.length/5/90);if(fa>.02){ctx.globalCompositeOperation="lighter";
      ctx.fillStyle="rgba("+pal.g+","+(.045*fa*a*(.7+.3*Math.sin(T*13.1)*Math.sin(T*7.7))).toFixed(3)+")";ctx.fillRect(0,0,W,H);}
    flushT(T,a,dt);ctx.globalCompositeOperation="source-over";}
  /* v19 sprites drawn once: the moon (limb darkening, soft grey maria, speckled craters) and three moonlit cloud banks (soft dark
     puffs whose tops catch the moonlight) */
  let MS=null;const CS=[];
  function moonSprite(){if(MS)return MS;const c=document.createElement("canvas");c.width=c.height=256;const g=c.getContext("2d"),o=128,r=100;
    const gr=g.createRadialGradient(o-20,o-24,8,o,o,r);gr.addColorStop(0,"#f6f8fc");gr.addColorStop(.72,"#e1e6ef");gr.addColorStop(1,"#aeb6c8");g.fillStyle=gr;g.beginPath();g.arc(o,o,r,0,6.2832);g.fill();
    g.save();g.beginPath();g.arc(o,o,r,0,6.2832);g.clip();
    for(const [x,y,rr] of [[-30,-24,40],[22,-36,26],[36,8,32],[-8,26,24],[-46,14,18],[12,52,16],[-20,-58,14]]){const m=g.createRadialGradient(o+x,o+y,0,o+x,o+y,rr);
      m.addColorStop(0,"rgba(118,126,148,.5)");m.addColorStop(.65,"rgba(128,136,158,.28)");m.addColorStop(1,"rgba(140,148,168,0)");g.fillStyle=m;g.fillRect(o+x-rr,o+y-rr,rr*2,rr*2);}
    let sd=7;const rn=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
    for(let i=0;i<150;i++){const an=rn()*6.2832,d=Math.sqrt(rn())*r*.96,x=o+Math.cos(an)*d,y=o+Math.sin(an)*d,cr=rn()*3.2+.4;
      g.fillStyle="rgba(96,104,126,"+(rn()*.28).toFixed(3)+")";g.beginPath();g.arc(x,y,cr,0,6.2832);g.fill();g.fillStyle="rgba(255,255,255,"+(rn()*.18).toFixed(3)+")";g.beginPath();g.arc(x-cr*.35,y-cr*.35,cr*.55,0,6.2832);g.fill();}
    const lg=g.createRadialGradient(o,o,r*.55,o,o,r);lg.addColorStop(0,"rgba(4,8,30,0)");lg.addColorStop(1,"rgba(8,12,40,.4)");g.fillStyle=lg;g.fillRect(0,0,256,256);g.restore();return MS=c;}
  function cloudSprite(k){if(CS[k])return CS[k];const c=document.createElement("canvas");c.width=400;c.height=120;const g=c.getContext("2d");let sd=31+k*17;const rn=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
    const P=[];for(let i=0;i<16;i++){const u=i/15;P.push([30+u*340+rn()*20,62+Math.sin(u*3.14)*-14+rn()*16,18+Math.sin(u*3.14)*26+rn()*12]);}
    for(const [x,y,r] of P){const d=g.createRadialGradient(x,y,0,x,y,r);d.addColorStop(0,"rgba(14,16,34,.95)");d.addColorStop(.6,"rgba(18,20,40,.7)");d.addColorStop(1,"rgba(20,22,44,0)");g.fillStyle=d;g.fillRect(x-r,y-r,r*2,r*2);}
    for(const [x,y,r] of P){const d=g.createRadialGradient(x,y-r*.55,0,x,y-r*.55,r*.7);d.addColorStop(0,"rgba(170,182,220,.22)");d.addColorStop(1,"rgba(170,182,220,0)");g.fillStyle=d;g.fillRect(x-r,y-r*1.3,r*2,r*1.5);}
    return CS[k]=c;}
  /* a bat silhouette: head with ears, body, and two membrane wings scalloped between the finger bones; f (-1..1) flaps them */
  function batShape(x,y,s,f){const wy=-f*s*1.15;ctx.beginPath();ctx.moveTo(x-.22*s,y-.2*s);
    for(const sd of [-1,1]){if(sd>0){ctx.moveTo(x+.22*s,y-.2*s);}const X=v=>x+sd*v*s;
      ctx.quadraticCurveTo(X(1.2),y-.55*s+wy*.6,X(2.55),y+wy);ctx.quadraticCurveTo(X(2.15),y+.1*s+wy*.55,X(1.9),y+.38*s+wy*.45);
      ctx.quadraticCurveTo(X(1.6),y+.12*s+wy*.32,X(1.3),y+.46*s+wy*.25);ctx.quadraticCurveTo(X(1),y+.22*s+wy*.15,X(.66),y+.52*s);
      ctx.quadraticCurveTo(X(.45),y+.32*s,X(.18),y+.38*s);ctx.lineTo(x,y+.62*s);ctx.lineTo(X(.18),y+.38*s);ctx.lineTo(X(.22),y-.2*s);}
    ctx.moveTo(x-.2*s,y-.22*s);ctx.lineTo(x-.2*s,y-.62*s);ctx.lineTo(x-.07*s,y-.4*s);ctx.lineTo(x+.07*s,y-.4*s);ctx.lineTo(x+.2*s,y-.62*s);ctx.lineTo(x+.2*s,y-.22*s);ctx.closePath();ctx.fill();}
  /* a lightning bolt: midpoint displacement from a cloud to low in the sky, plus 2–3 thinner forks */
  function mkBolt(){const jag=(x0,y0,x1,y1,d,o)=>{if(d<=0)return [[x0,y0],[x1,y1]];const mx=(x0+x1)/2+R(-o,o),my=(y0+y1)/2+R(-o*.3,o*.3);
      const A=jag(x0,y0,mx,my,d-1,o*.55),B=jag(mx,my,x1,y1,d-1,o*.55);return A.concat(B.slice(1));};
    const x0=R(W*.15,W*.85),y0=R(-10,H*.08),x1=x0+R(-220,220),y1=R(H*.42,H*.7),main=jag(x0,y0,x1,y1,7,90),lines=[[main,1]];
    for(let i=0;i<3;i++){const p=main[Math.floor(R(.2,.7)*main.length)],an=Math.atan2(y1-y0,x1-x0)+R(-.9,.9),l=R(80,200);lines.push([jag(p[0],p[1],p[0]+Math.cos(an)*l,p[1]+Math.sin(an)*l,5,40),.55]);}
    return {t:0,lines};}
  /* v22 holy water + steam */
  const HW=[],STM=[],RINGS=[];let STS=null;
  function steamSprite(){if(STS)return STS;STS=document.createElement("canvas");STS.width=STS.height=64;const g=STS.getContext("2d"),r=g.createRadialGradient(32,32,0,32,32,32);
    r.addColorStop(0,"rgba(232,238,246,.9)");r.addColorStop(.45,"rgba(220,228,240,.35)");r.addColorStop(1,"rgba(220,228,240,0)");g.fillStyle=r;g.fillRect(0,0,64,64);return STS;}
  function steam(x,y,n){for(let i=0;i<n;i++)if(STM.length<240)STM.push({x:x+R(-10,10),y:y+R(-6,6),vx:R(-18,18),vy:-R(40,90),t:0,l:R(1.2,2.2),r:R(10,20)});}
  function splash(x,y){if(!run||!hs||hz<.3)return;SFX.splash();RINGS.push({x,y,t:0});
    for(let i=0;i<46;i++){const an=R(0,6.2832),sp=R(120,520);HW.push({x,y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp-R(80,220),t:0,l:R(.5,1),r:R(1.2,3)});}
    const h=hs,gy=H-9,d2=(ax,ay)=>Math.hypot(ax-x,ay-y);let put=0;
    for(const q of h.road||[])if(q.t<3.4&&Math.abs(q.x-x)<95&&y>gy-170){q.t=3.4;put++;steam(q.x,gy-20,3);}
    for(const t of h.trees||[])for(const p of t.pts)if(!p.ex&&d2(p.x,p.y)<90){p.ex=1;put++;steam(p.x,p.y-p.s,2);}
    for(const c of h.cof)if(c.burn!=null&&!c.ex&&c.px!=null&&d2(c.px,c.py-c.hh*.5)<c.hh+40){c.ex=1;put++;steam(c.px,c.py-c.hh*.6,8);}
    for(const g of h.G)if(g.bt!=null&&!g.ex&&Math.abs(g.S[0][0]-x)<70&&y>H*.6){g.ex=1;put++;steam(g.S[0][0],H-60,5);}
    if(put)SFX.hiss(Math.min(1.4,.5+put*.12));
    for(const g of [...h.ghosts,...h.run]){if(g.dead||g.cy==null)continue;const dx=g.x-x,dy=g.cy-y,dd=Math.hypot(dx,dy);
      if(dd<55){g.dead=true;g.dt=0;SFX.wail();}else if(dd<170){const k=(170-dd)/170*700/(dd||1);g.vx=(g.vx||0)+dx*k;if(g.vy!=null)g.vy+=dy*k;g.mouth=1;g.arms=1.3;}}}
  addEventListener("pointerdown",e=>{if(e.button===0&&run)splash(e.clientX,e.clientY);},{passive:true,capture:true});
  function water(dt){if(!HW.length&&!STM.length&&!RINGS.length)return;
    ctx.globalCompositeOperation="source-over";const sp=steamSprite();
    for(let i=STM.length-1;i>=0;i--){const p=STM[i];p.t+=dt;if(p.t>=p.l){STM.splice(i,1);continue;}const u=p.t/p.l;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=1-dt;
      const r=p.r*(1+u*2.4);ctx.globalAlpha=.45*Math.sin(Math.PI*Math.min(1,u*1.3));ctx.drawImage(sp,p.x-r,p.y-r,r*2,r*2);}
    ctx.globalAlpha=1;ctx.globalCompositeOperation="lighter";
    for(let i=RINGS.length-1;i>=0;i--){const g=RINGS[i];g.t+=dt;if(g.t>.5){RINGS.splice(i,1);continue;}const u=g.t/.5;
      ctx.strokeStyle="rgba(170,215,255,"+(.7*(1-u)).toFixed(3)+")";ctx.lineWidth=3*(1-u)+.5;ctx.beginPath();ctx.ellipse(g.x,g.y,20+u*120,12+u*70,0,0,6.2832);ctx.stroke();}
    ctx.lineCap="round";
    for(let i=HW.length-1;i>=0;i--){const p=HW[i];p.t+=dt;if(p.t>=p.l){HW.splice(i,1);continue;}p.vy+=700*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const u=p.t/p.l;
      ctx.strokeStyle="rgba(190,225,255,"+(.85*(1-u)).toFixed(3)+")";ctx.lineWidth=p.r;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.02,p.y-p.vy*.02);ctx.stroke();}
    ctx.globalCompositeOperation="source-over";}
  function hauntDraw(dt,T){const a=hz,h=hs;if(!h||a<=.01)return;
    const fk=.93+.07*Math.sin(T*23)*Math.sin(T*7.3);
    /* v19 grade: cool blue-black night, darker overhead, a faint warm horizon where the fires burn, heavy cinematic vignette */
    const sk=ctx.createLinearGradient(0,0,0,H);sk.addColorStop(0,"rgba(2,4,12,"+(.84*a*fk).toFixed(3)+")");sk.addColorStop(.55,"rgba(6,10,24,"+(.7*a*fk).toFixed(3)+")");
    sk.addColorStop(.86,"rgba(14,14,26,"+(.66*a*fk).toFixed(3)+")");sk.addColorStop(1,"rgba(34,16,12,"+(.7*a*fk).toFixed(3)+")");ctx.fillStyle=sk;ctx.fillRect(0,0,W,H);
    const vg=ctx.createRadialGradient(W/2,H*.48,Math.min(W,H)*.3,W/2,H*.48,Math.max(W,H)*.7);vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,4,"+(.78*a).toFixed(3)+")");ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    /* lightning: a double flash every few seconds */
    h.ln-=dt;if(h.ln<=0){h.fl=1;h.ln=R(4,9);h.bolt=mkBolt();setTimeout(()=>SFX.thunder(.55),250);setTimeout(()=>{if(hs)hs.fl=Math.max(hs.fl,.75);},160);}
    if(h.fl>0){ctx.fillStyle="rgba(200,215,255,"+(.2*h.fl*a).toFixed(3)+")";ctx.fillRect(0,0,W,H);h.fl=Math.max(0,h.fl-dt*3.2);}
    if(h.bolt){const b=h.bolt;b.t+=dt;if(b.t>.42)h.bolt=null;else{const v=b.t<.07?1:b.t<.11?.15:b.t<.2?1:1-(b.t-.2)/.22,al=v*a;
      ctx.globalCompositeOperation="lighter";ctx.lineJoin="round";ctx.lineCap="round";
      for(const [L,k] of b.lines)for(const [lw,c,o] of [[16*k,"150,160,255",.1],[6*k,"185,195,255",.42],[2*k,"255,255,255",.95]]){
        ctx.strokeStyle="rgba("+c+","+(o*al).toFixed(3)+")";ctx.lineWidth=lw;ctx.beginPath();L.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
      ctx.globalCompositeOperation="source-over";}}
    /* v19 moon: wide atmospheric halo, tight corona, then the pre-rendered disc (limb darkening, soft maria, craters) */
    const [mx,my]=h.moon;
    for(const [rr,al,c] of [[420,.16,"150,175,255"],[150,.3,"190,210,255"],[62,.55,"230,238,255"]]){const mg=ctx.createRadialGradient(mx,my,0,mx,my,rr);
      mg.addColorStop(0,"rgba("+c+","+(al*a).toFixed(3)+")");mg.addColorStop(1,"rgba("+c+",0)");ctx.fillStyle=mg;ctx.fillRect(mx-rr,my-rr,rr*2,rr*2);}
    ctx.globalAlpha=a;ctx.drawImage(moonSprite(),mx-56,my-56,112,112);ctx.globalAlpha=1;
    wolfTick(h,dt,a,true);
    for(const [i,w] of h.wisps.entries()){w.dx+=w.v*dt;if(w.dx>260)w.dx=-260;const cs=cloudSprite(i%3),cw=w.w*3.2,ch=cw*.3;ctx.globalAlpha=.92*a;ctx.drawImage(cs,mx+w.dx-cw/2,my+w.dy-ch/2,cw,ch);}ctx.globalAlpha=1;
    ctx.fillStyle="rgba(4,2,8,"+a.toFixed(3)+")";
    for(const b of h.bats){
      /* shot ones tumble down, then a new one flies in from an edge */
      if(b.dead){b.vy+=700*dt;b.sy+=b.vy*dt;b.sx+=b.v*.3*dt;b.rot+=dt*9;if(b.sy>H+40){b.dead=false;b.x=b.v>0?-40:W+40;b.y=R(H*.06,H*.5);}
        else{ctx.save();ctx.translate(b.sx,b.sy);ctx.rotate(b.rot);ctx.beginPath();ctx.ellipse(0,0,b.s*7,b.s*3,0,0,6.2832);ctx.fill();ctx.restore();continue;}}
      b.x+=b.v*dt;if(b.x>W+40)b.x=-40;if(b.x<-40)b.x=W+40;const y=b.y+Math.sin(T*1.6+b.b)*14,f=Math.sin(T*(b.k==="crow"?9:16)+b.ph),s=b.s*9;b.sx=b.x;b.sy=y;
      if(b.k==="crow"){const d=b.v>0?1:-1;ctx.save();ctx.translate(b.x,y);ctx.scale(d,1);ctx.beginPath();ctx.ellipse(0,0,s*.9,s*.28,0,0,6.2832);ctx.moveTo(s*.8,-s*.05);ctx.arc(s*.85,-s*.12,s*.2,0,6.2832);
        ctx.moveTo(s*1.02,-s*.16);ctx.lineTo(s*1.3,-s*.1);ctx.lineTo(s*1.02,-s*.04);ctx.moveTo(-s*.8,0);ctx.lineTo(-s*1.3,-s*.18);ctx.lineTo(-s*1.25,s*.16);ctx.closePath();
        ctx.moveTo(-s*.2,-s*.1);ctx.quadraticCurveTo(-s*.5,-s*1.3*f,-s*1.1,-s*1.4*f);ctx.quadraticCurveTo(-s*.4,-s*.6*f,s*.3,-s*.05);ctx.fill();ctx.restore();continue;}
      batShape(b.x,y,s*.85,f);}
    ctx.strokeStyle="rgba(215,215,235,"+(.22*a).toFixed(3)+")";ctx.lineWidth=.8;web(0,0,1);web(W,0,-1);
    const gl=H-17*h.s-12;ctx.lineCap="round";
    /* far line of dead trees, lighter, behind the graveyard */
    /* far row: fogged blue-grey silhouettes, then a fog band that separates them from the near graveyard */
    ctx.strokeStyle="rgba(40,46,66,"+(.85*a).toFixed(3)+")";for(const S of h.F)for(const [x0,y0,x1,y1,w,qx,qy] of S){ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,gl+y0);ctx.quadraticCurveTo(qx,gl+qy,x1,gl+y1);ctx.stroke();}
    const fb=ctx.createLinearGradient(0,gl-90,0,gl+4);fb.addColorStop(0,"rgba(90,104,132,0)");fb.addColorStop(1,"rgba(90,104,132,"+(.22*a).toFixed(3)+")");ctx.fillStyle=fb;ctx.fillRect(0,gl-90,W,94);
    const sil="rgba(9,5,16,"+a.toFixed(3)+")";ctx.fillStyle=sil;ctx.strokeStyle=sil;
    ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W+20;x+=20)ctx.lineTo(x,gl+2+Math.sin(x*.013)*3+Math.sin(x*.041)*1.5);ctx.lineTo(W,H);ctx.closePath();ctx.fill();
    for(const g of h.G){
      if(g.k==="grave"){ctx.save();ctx.translate(g.x,gl+3);ctx.rotate(g.tl);
        if(g.c){ctx.fillRect(-2,-g.h-6,4,g.h+6);ctx.fillRect(-g.w*.45,-g.h+2,g.w*.9,4);}
        else{ctx.beginPath();ctx.moveTo(-g.w/2,0);ctx.lineTo(-g.w/2,-g.h+g.w/2);ctx.arc(0,-g.h+g.w/2,g.w/2,Math.PI,0);ctx.lineTo(g.w/2,0);ctx.fill();}
        ctx.restore();}
      else if(g.k==="tree")for(const [x0,y0,x1,y1,w,qx,qy] of g.S){ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,gl+y0);ctx.quadraticCurveTo(qx,gl+qy,x1,gl+y1);ctx.stroke();}
      else{ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(g.x,gl-14);ctx.lineTo(g.x+g.w,gl-14);ctx.moveTo(g.x,gl-6);ctx.lineTo(g.x+g.w,gl-6);
        for(let x=g.x;x<=g.x+g.w;x+=7){ctx.moveTo(x,gl+2);ctx.lineTo(x,gl-20);}ctx.stroke();
        for(let x=g.x;x<=g.x+g.w;x+=7){ctx.beginPath();ctx.moveTo(x-2,gl-19);ctx.lineTo(x,gl-24);ctx.lineTo(x+2,gl-19);ctx.fill();}}}
    /* coffins: one by one they heave up out of the ground, shaking and throwing dirt; the lid creaks open on its hinge (green glow
       inside) and one or two ghosts burst out */
    h.t+=dt;ctx.save();ctx.beginPath();ctx.rect(0,0,W,gl+5);ctx.clip();
    for(const c of h.cof){const tt=h.t-c.at;if(tt<0)continue;const k=c.k*h.s,hh=90*k,w=36*k;
      const up=Math.min(1,tt/.55),e=1-Math.pow(1-up,3),sh=up<1?Math.sin(tt*70)*1.6:0,op=Math.max(0,Math.min(1,(tt-.55)/.35)),oe=op*op*(3-2*op);
      if(!c.cr&&tt>.5){c.cr=true;SFX.creak();}
      if(!c.done&&tt>.75){c.done=true;const n=Math.random()<.45?2:1;
        for(let i=0;i<n;i++)h.run.push({x:c.x,by:gl-hh*.55,t:-i*.35,vx:c.dir*(i?-1:1)*R(240,380),ph:R(0,6.28),s:R(.9,1.25)*h.s,tr:[]});SFX.wail();}
      if(up<1&&Math.random()<.6)emit("m",c.x+R(-w*.6,w*.6),gl,1,()=>({vx:R(-30,30),vy:R(-70,-25),r:R(3,7),l:R(.5,1)}));
      c.px=c.x+sh;c.py=gl+4+hh*(1-e)*.92;c.hh=hh;c.w=w;
      ctx.save();ctx.translate(c.x+sh,gl+4+hh*(1-e)*.92);ctx.rotate(c.tl);
      const P6=[[-w*.36,0],[-w*.5,-hh*.68],[-w*.3,-hh],[w*.3,-hh],[w*.5,-hh*.68],[w*.36,0]];
      const poly=()=>{ctx.beginPath();P6.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();};
      poly();ctx.fillStyle="rgba(30,18,12,"+a.toFixed(3)+")";ctx.fill();
      if(oe>0){ctx.save();poly();ctx.clip();ctx.fillStyle="rgba(4,2,4,"+a.toFixed(3)+")";ctx.fillRect(-w,-hh,2*w,hh);
        const gg=ctx.createRadialGradient(0,-hh*.5,0,0,-hh*.5,hh*.7);gg.addColorStop(0,"rgba(150,255,170,"+(.55*oe*a).toFixed(3)+")");gg.addColorStop(1,"rgba(150,255,170,0)");
        ctx.fillStyle=gg;ctx.fillRect(-w,-hh,2*w,hh);ctx.restore();}
      ctx.strokeStyle="rgba(110,72,44,"+(.9*a).toFixed(3)+")";ctx.lineWidth=1.6;poly();ctx.stroke();
      const sx=1-1.35*oe;ctx.save();ctx.translate(-w*.5,0);ctx.scale(sx,1);ctx.translate(w*.5,0);
      poly();ctx.fillStyle="rgba("+(sx<0?"22,13,9":"52,32,21")+","+a.toFixed(3)+")";ctx.fill();ctx.stroke();
      if(sx>0){ctx.save();poly();ctx.clip();ctx.strokeStyle="rgba(10,5,3,"+(.55*a).toFixed(3)+")";ctx.lineWidth=1.1;ctx.beginPath();
        for(const u of [-.17,.17]){ctx.moveTo(u*w,-hh);ctx.lineTo(u*w*1.15,0);}ctx.stroke();
        ctx.strokeStyle="rgba(150,165,200,"+(.35*a).toFixed(3)+")";ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-w*.47,-hh*.68);ctx.lineTo(-w*.3,-hh+1);ctx.lineTo(w*.28,-hh+1);ctx.stroke();
        ctx.fillStyle="rgba(170,160,140,"+(.7*a).toFixed(3)+")";for(const [nx,ny] of [[-.36,-.9],[.36,-.9],[-.4,-.12],[.4,-.12]]){ctx.beginPath();ctx.arc(nx*w,ny*hh,1.1,0,6.2832);ctx.fill();}
        ctx.restore();}
      if(sx>0){ctx.strokeStyle="rgba(210,200,180,"+(.55*a).toFixed(3)+")";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-hh*.82);ctx.lineTo(0,-hh*.35);ctx.moveTo(-w*.17,-hh*.68);ctx.lineTo(w*.17,-hh*.68);ctx.stroke();}
      ctx.restore();
      /* v16: once the rider sets it alight the wood chars black and its edges glow like embers */
      if(c.burn!=null){const ch=Math.min(1,c.burn/2.2);poly();ctx.fillStyle="rgba(8,4,2,"+(.72*ch*a).toFixed(3)+")";ctx.fill();
        ctx.strokeStyle="rgba("+pal.f[2]+","+((.45+.35*Math.sin(T*7+c.x))*a*Math.min(1,c.burn/.5)).toFixed(3)+")";ctx.lineWidth=2.4;ctx.stroke();}
      ctx.restore();}
    ctx.restore();
    /* red eyes blinking in the dark */
    for(const e of h.eyes){if(Math.sin(T*.9+e.ph)>.82)continue;const c=e.r?"255,40,30":"170,255,90";ctx.save();ctx.shadowColor="rgba("+c+",.9)";ctx.shadowBlur=8;ctx.fillStyle="rgba("+c+","+(.9*a).toFixed(3)+")";
      ctx.beginPath();ctx.ellipse(e.x-4,gl+e.dy,2.2,1.3,.15,0,6.2832);ctx.ellipse(e.x+4,gl+e.dy,2.2,1.3,-.15,0,6.2832);ctx.fill();ctx.restore();}
    /* v17: the roaming ghosts */
    roam(h,dt,a);
    /* ghosts escaping the coffins: they rise, lean forward and race across the graveyard, arms reaching, with a misty trail */
    h.run=h.run.filter(g=>g.x>-140&&g.x<W+140&&!(g.dead&&g.dt>1.1));
    for(const g of h.run){
      if(g.dead){g.dt+=dt;const k=g.dt/1.1,R0=g.s*16*(1+k*3.2);for(let j=0;j<3;j++){const rr=R0*(.55+j*.3);const gg=ctx.createRadialGradient(g.x,g.cy,rr*.2,g.x,g.cy,rr);
          gg.addColorStop(0,"rgba(160,255,190,"+(.45*(1-k)*a).toFixed(3)+")");gg.addColorStop(1,"rgba(120,255,170,0)");ctx.fillStyle=gg;ctx.beginPath();ctx.arc(g.x+(j-1)*R0*.3,g.cy-j*R0*.2,rr,0,6.2832);ctx.fill();}continue;}
      g.t+=dt;if(g.t<0)continue;const s=g.s*16,rise=Math.min(1,g.t/.5),d=Math.sign(g.vx)||1,sp=Math.min(1,Math.max(0,g.t-.45)*2.2);
      g.x+=g.vx*sp*dt;const y=g.by-rise*s*2.2+Math.sin(g.t*9+g.ph)*s*.18;g.cy=y+s*.4;g.tr.push([g.x,y]);if(g.tr.length>14)g.tr.shift();
      const al=a*Math.min(1,g.t*3)*.72;
      g.tr.forEach(([tx,ty],i)=>{const q=i/g.tr.length;ctx.fillStyle="rgba(200,255,220,"+(al*.16*q).toFixed(3)+")";ctx.beginPath();ctx.arc(tx-d*s*.6,ty+s*.6,s*(.35+.5*q),0,6.2832);ctx.fill();});
      ghostPaint(ctx,g.x,y,s,d,g.t+g.ph,Math.min(1,al*1.3),{lean:sp,mouth:.75+.25*Math.sin(g.t*7+g.ph),arms:1.1,ph:g.ph,tint:1});}
    wolfTick(h,dt,a,false);
    /* thick ground mist */
    const mist=ctx.createLinearGradient(0,gl-70,0,H);mist.addColorStop(0,"rgba(130,150,180,0)");mist.addColorStop(.6,"rgba(130,150,180,"+(.12*a).toFixed(3)+")");mist.addColorStop(1,"rgba(150,140,170,"+(.15*a).toFixed(3)+")");
    ctx.fillStyle=mist;ctx.fillRect(0,gl-70,W,H-gl+70);
    for(const f of h.fog){f.x+=f.v*dt;if(f.x-f.r>W)f.x=-f.r;if(f.x+f.r<0)f.x=W+f.r;
      const fy=gl+f.dy,fg=ctx.createRadialGradient(f.x,fy,0,f.x,fy,f.r),c=f.g?"120,148,175":"150,142,180";fg.addColorStop(0,"rgba("+c+","+(.15*a).toFixed(3)+")");fg.addColorStop(1,"rgba("+c+",0)");
      ctx.fillStyle=fg;ctx.fillRect(f.x-f.r,fy-f.r,2*f.r,2*f.r);}}
  /* local bike coordinates (facing +x, wheels on y = 0, rear wheel at -38), rotated by ang about the pivot pv → screen */
  function toW(lx,ly){const r=run,c=Math.cos(r.ang),sn=Math.sin(r.ang),px=r.pv[0],py=r.pv[1],x0=lx-px,y0=ly-py,rx=x0*c-y0*sn+px,ry=x0*sn+y0*c+py;return [r.x+rx*r.s*r.dir,r.gy+ry*r.s];}
  function land(){const r=run;r.sq=1;const back=-r.dir;SFX.thud();shake(.7);
    for(const wx of [-38,40]){const w=toW(wx,17);
      emit("e",w[0],w[1],12,()=>({vx:R(-260,260),vy:R(-260,-80),r:R(1,2.2),l:R(.5,1)}));
      emit("m",w[0],w[1]-4,5,()=>({vx:R(-90,90),vy:R(-40,-8),r:R(8,15),l:R(.8,1.5)}));
      emit("f",w[0],w[1]-6,10,()=>({vx:back*R(-60,160),vy:R(-140,-30),r:R(4,8),l:R(.25,.5)}));}}
  function emit(k,x,y,n,o){for(let i=0;i<n&&P.length<(lowQ?350:600);i++){const p=Object.assign({k,x:x+R(-3,3)-(run?run.dir*Math.random()*run.sp:0),y:y+R(-3,3),vx:R(-30,30),vy:R(-120,-40),t:0,l:R(.35,.8),r:R(4,9)},o&&o());if(run)p.r*=run.s;P.push(p);}}
  function limb(c,w,pts){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);ctx.stroke();}
  function bike(){const r=run;
    /* shadow on the ground, shrinking and fading as he rises */
    if(r.lift>1){const k=Math.max(0,1-r.lift/(220*r.s));ctx.fillStyle="rgba(0,0,0,"+(.22*k).toFixed(3)+")";ctx.beginPath();ctx.ellipse(r.x,r.base+18*r.s,62*r.s*(.5+.5*k),5*r.s*(.5+.5*k),0,0,6.2832);ctx.fill();}
    ctx.save();ctx.translate(r.x,r.gy+17*r.s);ctx.scale(r.dir*r.s*(1+.06*r.sq),r.s*(1-.14*r.sq));ctx.translate(0,-17);
    ctx.translate(r.pv[0],r.pv[1]);ctx.rotate(r.ang);ctx.translate(-r.pv[0],-r.pv[1]);ctx.lineCap="round";ctx.lineJoin="round";
    /* headlight beam */
    const bm=ctx.createLinearGradient(30,0,230,0);bm.addColorStop(0,"rgba("+pal.beam+",.38)");bm.addColorStop(1,"rgba("+pal.beam+",0)");ctx.fillStyle=bm;ctx.beginPath();ctx.moveTo(30,-36);ctx.lineTo(230,-80);ctx.lineTo(230,8);ctx.closePath();ctx.fill();
    /* wheels */
    for(const wx of [-38,40]){ctx.fillStyle="rgba(20,10,5,.55)";ctx.beginPath();ctx.arc(wx,0,17,0,6.2832);ctx.fill();ctx.strokeStyle="#0b0b0b";ctx.lineWidth=6;ctx.beginPath();ctx.arc(wx,0,17,0,6.2832);ctx.stroke();
      ctx.strokeStyle=pal.ring;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(wx,0,19.5,0,6.2832);ctx.stroke();
      ctx.strokeStyle="#9ca3af";ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(wx,0,11,0,6.2832);for(let i=0;i<6;i++){const a=r.spin+i*1.047;ctx.moveTo(wx,0);ctx.lineTo(wx+Math.cos(a)*11,Math.sin(a)*11);}ctx.stroke();
      ctx.fillStyle="#d1d5db";ctx.beginPath();ctx.arc(wx,0,3,0,6.2832);ctx.fill();}
    /* frame, engine, pipes, tank, seat, fork */
    limb("#1f2937",4.5,[-38,0,-10,-10,14,-22]);limb("#1f2937",4,[-10,-10,-24,-28]);
    ctx.fillStyle="#374151";ctx.fillRect(-16,-24,24,16);limb("#cbd5e1",2,[-12,-24,-6,-34,0,-24]);limb("#94a3b8",1.2,[-14,-18,6,-18,-14,-13,6,-13]);
    limb("#d1d5db",4,[-4,-9,-30,-8,-58,-11]);limb("#9ca3af",2,[-4,-13,-30,-13,-56,-16]);
    ctx.fillStyle=pal.tank;ctx.beginPath();ctx.ellipse(6,-31,16,7,-.12,0,6.2832);ctx.fill();ctx.fillStyle="rgba(255,255,255,.25)";ctx.beginPath();ctx.ellipse(4,-34,8,2,-.12,0,6.2832);ctx.fill();
    limb("#0a0a0a",6,[-30,-29,-8,-28]);limb("#111827",3,[-52,-14,-40,-24,-26,-27]);
    limb("#e5e7eb",3.6,[22,-40,40,0]);limb("#9ca3af",3,[18,-44,24,-50,30,-50]);
    ctx.fillStyle="#fde68a";ctx.beginPath();ctx.arc(28,-35,4.5,0,6.2832);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(29,-35,2,0,6.2832);ctx.fill();
    ctx.save();ctx.translate(0,r.air?-3:Math.sin(r.t*24)*.9+r.sq*3);figure(r);ctx.restore();ctx.restore();}
  /* legs at a gallop: gait cycle c = g/2π; each leg plants (stance, 42% of the cycle) and its hoof slides back at ground speed, then
     lifts and swings forward. Two-bone IK places the joint: forelegs bend at the knee (forward), hind legs at the hock (backward).
     Order: far hind, far fore, near hind, near fore (hind pair, then fore pair, as in a real gallop). Returns
     [hipX, hipY, jointX, jointY, hoofX, hoofY, lowerAngleFromVertical]. */
  function legs(g){const c=g/6.2832;return [[-38,-58,0,1],[30,-54,.42,0],[-34,-57,.1,1],[34,-53,.52,0]].map(([hx,hy,o,hind])=>{
    const ph=((c+o)%1+1)%1,st=.42,reach=hind?17:19,bx=hx+(hind?3:6);let fx,fy;
    if(ph<st){const u=ph/st;fx=bx+reach*(1-2*u);fy=0;}else{const u=(ph-st)/(1-st),e=u*u*(3-2*u);fx=bx-reach+2*reach*e;fy=-Math.sin(Math.PI*u)*(hind?15:21);}
    const A=hind?27:24,Bl=hind?29:30;let dx=fx-hx,dy=fy-hy,d=Math.hypot(dx,dy);const dd=Math.min(d,A+Bl-.4);dx*=dd/d;dy*=dd/d;fx=hx+dx;fy=hy+dy;
    const ang=Math.acos(Math.max(-1,Math.min(1,(A*A+dd*dd-Bl*Bl)/(2*A*dd)))),base=Math.atan2(dy,dx),ja=hind?base+ang:base-ang,
      kx=hx+Math.cos(ja)*A,ky=hy+Math.sin(ja)*A;return [hx,hy,kx,ky,fx,fy,Math.atan2(fx-kx,fy-ky)];});}
  /* the black stallion he rides back on: one smooth outline (chest, belly, haunches, arched neck, head, ears) over tapered legs with
     knee/hock joints and hooves, an ember rim glow, glowing eye, flame mane and tail that flicker, reins and saddle. Hooves on y = 0. */
  const HORSE="M-48 -68 C-40 -77 -24 -77 -10 -73 C2 -71 12 -74 20 -79 C30 -86 40 -100 49 -113 L52 -127 L56 -118 L59 -126 L61 -116 C67 -110 75 -100 81 -92 "+
    "C84 -88 82 -82 76 -83 C70 -84 64 -88 59 -92 C55 -95 49 -89 44 -80 C40 -72 41 -62 38 -52 C34 -46 22 -43 6 -43 C-10 -43 -22 -45 -30 -47 "+
    "C-40 -47 -48 -51 -51 -58 C-53 -63 -51 -67 -48 -68Z";
  function seg(x0,y0,x1,y1,w0,w1){const a=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(a),ny=Math.cos(a);ctx.beginPath();ctx.moveTo(x0+nx*w0,y0+ny*w0);ctx.lineTo(x1+nx*w1,y1+ny*w1);
    ctx.lineTo(x1-nx*w1,y1-ny*w1);ctx.lineTo(x0-nx*w0,y0-ny*w0);ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(x1,y1,w1,0,6.2832);ctx.fill();}
  function horseLeg(l,c){ctx.fillStyle=c;const hind=l[0]<0;seg(l[0],l[1],l[2],l[3],hind?7:5.5,hind?3.4:3.2);seg(l[2],l[3],l[4],l[5],2.5,2.1);ctx.beginPath();ctx.arc(l[4]-Math.sin(l[6])*4,l[5]-Math.cos(l[6])*4,2.7,0,6.2832);ctx.fill();
    ctx.save();ctx.translate(l[4],l[5]);ctx.rotate(-l[6]);ctx.fillStyle="#050404";ctx.beginPath();ctx.moveTo(-3.4,-2);ctx.lineTo(3.4,-2);ctx.lineTo(4.6,3);ctx.lineTo(-3.6,3);ctx.closePath();ctx.fill();
    ctx.fillStyle=pal.ring;ctx.globalAlpha=.85;ctx.fillRect(-3.8,2,8.4,1.6);ctx.restore();ctx.globalAlpha=1;}
  function flames(pts,len,T,seed){/* flame tongues streaming back (-x) from points along a line */
    const fg=ctx.createLinearGradient(0,-130,0,-50);fg.addColorStop(0,"rgba("+pal.f[1]+",.95)");fg.addColorStop(.5,"rgba("+pal.f[2]+",.9)");fg.addColorStop(1,"rgba("+pal.f[3]+",.8)");
    ctx.fillStyle=fg;pts.forEach(([x,y],i)=>{const fl=Math.sin(T*13+i*1.7+seed),L=len*(.75+.25*Math.sin(T*9+i*2.3+seed)),tx=x-L,ty=y-6-fl*5;
      ctx.beginPath();ctx.moveTo(x+3,y+2);ctx.quadraticCurveTo(x-L*.4,y-8+fl*4,tx,ty);ctx.quadraticCurveTo(x-L*.45,y+4-fl*3,x-2,y+4);ctx.closePath();ctx.fill();});}
  function horse(){const r=run,L=legs(r.g),T=r.t;
    ctx.save();ctx.translate(r.x,r.gy);ctx.scale(r.dir*r.s,r.s);ctx.translate(r.pv[0],r.pv[1]);ctx.rotate(r.ang);ctx.translate(-r.pv[0],-r.pv[1]);ctx.lineCap="round";ctx.lineJoin="round";
    horseLeg(L[0],"#0b0808");horseLeg(L[1],"#0b0808");
    ctx.globalCompositeOperation="lighter";flames([[-48,-67],[-50,-63],[-49,-59]],30,T,1);ctx.globalCompositeOperation="source-over";
    const bg=ctx.createLinearGradient(0,-90,0,-42);bg.addColorStop(0,"#2b2222");bg.addColorStop(.55,"#161010");bg.addColorStop(1,"#0a0707");
    const p=new Path2D(HORSE);ctx.save();ctx.shadowColor="rgba("+pal.g+",.9)";ctx.shadowBlur=10;ctx.fillStyle=bg;ctx.fill(p);ctx.restore();
    ctx.strokeStyle="rgba("+pal.g+",.55)";ctx.lineWidth=1.1;ctx.stroke(p);
    /* muscle highlights: shoulder, haunch, neck, jaw */
    ctx.strokeStyle="rgba(255,240,225,.12)";ctx.lineWidth=1.4;
    for(const d of ["M24 -74 C30 -64 30 -54 26 -48","M-30 -72 C-20 -66 -20 -54 -26 -48","M28 -82 C36 -90 42 -98 48 -106","M62 -94 C66 -98 70 -97 74 -93"]){ctx.stroke(new Path2D(d));}
    ctx.fillStyle="rgba(0,0,0,.45)";ctx.beginPath();ctx.ellipse(78,-87,1.6,1.1,.4,0,6.2832);ctx.fill();
    ctx.save();ctx.shadowColor=pal.eye;ctx.shadowBlur=8;ctx.fillStyle=pal.eye;ctx.beginPath();ctx.ellipse(64,-106,2.6,1.7,-.5,0,6.2832);ctx.fill();ctx.restore();
    ctx.globalCompositeOperation="lighter";flames([[22,-80],[28,-86],[34,-93],[40,-101],[46,-109],[51,-117]],22,T,4);ctx.globalCompositeOperation="source-over";
    horseLeg(L[2],"#1a1313");horseLeg(L[3],"#1a1313");
    ctx.fillStyle="#2a1a12";ctx.beginPath();ctx.moveTo(-12,-76);ctx.quadraticCurveTo(0,-82,12,-78);ctx.lineTo(10,-70);ctx.quadraticCurveTo(0,-72,-10,-70);ctx.closePath();ctx.fill();
    limb("#3a2a20",1.6,[2,-70,4,-58]);
    ctx.save();ctx.translate(10,-44+Math.sin(r.g*2)*1.5);figure(r);ctx.restore();
    limb("#6b4f3a",1,[34,-92,58,-90,76,-85]);
    ctx.restore();}
  /* the chain hangs from his fist (raised while throwing/holding) in a sagging curve of alternating links over a fiery glow */
  function chainFist(){const r=run;return r.arm?toW(18,-133+Math.sin(r.g*2)*1.5):toW(34,-92);}
  function chain(){const c=run.ch;if(!c||!c.e||c.st==="idle"||c.st==="off")return;const [x0,y0]=chainFist(),[x1,y1]=c.e,d=Math.hypot(x1-x0,y1-y0),
      mx=(x0+x1)/2,my=(y0+y1)/2+Math.min(60,d*.12),n=Math.max(4,Math.round(d/(7*Math.max(.6,run.s)))),pt=t=>[(1-t)*(1-t)*x0+2*(1-t)*t*mx+t*t*x1,(1-t)*(1-t)*y0+2*(1-t)*t*my+t*t*y1];
    ctx.save();ctx.lineCap="round";ctx.strokeStyle="rgba("+pal.g+",.45)";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(mx,my,x1,y1);ctx.stroke();
    ctx.strokeStyle="#d1d5db";ctx.lineWidth=1.8;
    for(let i=0;i<n;i++){const [ax,ay]=pt(i/n),[bx,by]=pt((i+1)/n),a=Math.atan2(by-ay,bx-ax),L=Math.hypot(bx-ax,by-ay);
      ctx.beginPath();ctx.ellipse((ax+bx)/2,(ay+by)/2,L*.62,i%2?1.2:3.2,a,0,6.2832);ctx.stroke();}
    ctx.fillStyle=pal.ring;ctx.beginPath();ctx.arc(x1,y1,3.4,0,6.2832);ctx.fill();ctx.restore();}
  /* rider: leather jacket, spiked shoulders, chain, skull; bobs with the road, crouches in the air, punches the sky on big jumps */
  function figure(r){
    limb("#1c1917",8,[-14,-34,4,-28,-2,-12]);limb("#0b0b0b",5,[-2,-12,6,-12]);
    limb("#141414",14,[-14,-36,0,-60]);limb("#262626",3,[-13,-38,-2,-58]);
    ctx.fillStyle="#cbd5e1";for(const [sx,sy] of [[-6,-66],[0,-67],[5,-65]]){ctx.beginPath();ctx.moveTo(sx-2,sy+5);ctx.lineTo(sx,sy);ctx.lineTo(sx+2,sy+5);ctx.fill();}
    limb("#9ca3af",1.4,[-10,-58,-2,-44,4,-38]);
    if(r.gun>0){const a=r.aim,hx=2+Math.cos(a)*26,hy=-58+Math.sin(a)*26,mx=2+Math.cos(a)*40,my=-58+Math.sin(a)*40;limb("#141414",6.5,[2,-58,hx,hy]);
      limb("#1f2937",3.4,[hx-Math.cos(a)*2,hy-Math.sin(a)*2,mx,my]);limb("#374151",2.6,[hx,hy,hx-Math.sin(a)*-5,hy+Math.cos(a)*5]);ctx.fillStyle="#0a0a0a";ctx.beginPath();ctx.arc(hx,hy,3.2,0,6.2832);ctx.fill();
      if(r.flash>0){ctx.save();ctx.shadowColor="rgba("+pal.g+",1)";ctx.shadowBlur=14;ctx.fillStyle="rgba("+pal.f[0]+",.95)";ctx.beginPath();ctx.arc(mx+Math.cos(a)*4,my+Math.sin(a)*4,6,0,6.2832);ctx.fill();ctx.restore();}}
    else if(r.arm){limb("#141414",6.5,[2,-58,10,-70,8,-86]);ctx.fillStyle="#0a0a0a";ctx.beginPath();ctx.arc(8,-88,3.6,0,6.2832);ctx.fill();}
    else{limb("#141414",6.5,[2,-58,14,-50,24,-48]);ctx.fillStyle="#0a0a0a";ctx.beginPath();ctx.arc(24,-48,3.2,0,6.2832);ctx.fill();}
    ctx.fillStyle="#f3ead7";ctx.beginPath();ctx.ellipse(6,-74,8.5,9.5,.15,0,6.2832);ctx.fill();ctx.beginPath();ctx.roundRect?ctx.roundRect(5,-69,9,8,2):ctx.rect(5,-69,9,8);ctx.fill();
    ctx.fillStyle="#120804";ctx.beginPath();ctx.ellipse(9,-75,2.6,3.2,0,0,6.2832);ctx.ellipse(14,-74,1.8,2.8,0,0,6.2832);ctx.fill();
    ctx.fillStyle=pal.eye;ctx.beginPath();ctx.arc(9.4,-75,1,0,6.2832);ctx.arc(14.2,-74,.8,0,6.2832);ctx.fill();
    ctx.fillStyle="#120804";ctx.beginPath();ctx.moveTo(14,-70);ctx.lineTo(16,-67);ctx.lineTo(13,-67);ctx.fill();limb("#3f2a1a",.9,[6,-64,14,-64,7,-62,7,-66,10,-62,10,-66,13,-62,13,-66]);}
  function col(f){const a=Math.pow(1-f,1.3)*(dark?.85:.75),i=f<.12?0:f<.3?1:f<.55?2:f<.8?3:4;return "rgba("+pal.f[i]+","+(i===4?a*.6:a).toFixed(3)+")";}
  /* 3D rider (v14): real models rendered with three.js r147 on canvas #rider3d, between the haunted backdrop (#riderLow) and the
     fire, chain and bullets (#rider). Models (CC BY 4.0, credited in the footer): cruiser "1990 Fatboy inspired Cruiser Motorcycle" by
     Alpha One, "Skeleton Lord" by DJMaesen, "Horse" by henrysteve973, "Werewolf - IDLE [MESHY]" by EthanFromEngland. They are packed as
     base64 GLB in assets/models/*.js (a file:// page can't fetch files) and load on the first summon (or hovering the ghost button).
     The ride logic stays the same: R3.bike(run) / R3.horse(run) / R3.wolf(...) place the models from the existing 2D state, the
     seated rider is posed by two-bone IK (hands on the grips or reins, feet on the pegs or flanks, gun arm aimed, fist raised) and the
     werewolf is posed procedurally on its Mixamo skeleton (howl, leap, crouch, sprint). If anything fails, the drawn versions stay. */
  const R3=(function(){
    let state="idle",loading=null,ren,scene,cam,cv3,hemi,moonL,keyL,fireL,B={},RD={},HS={},WF={},FL={},shown=false,rest=new Map();
    const MD=ROOT+"assets/models/",V=()=>new THREE.Vector3(),Q=()=>new THREE.Quaternion();
    const addS=src=>new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});
    const b64=s=>{const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;};
    function load(){if(loading)return loading;state="loading";
      const lib=window.THREE&&THREE.GLTFLoader?Promise.resolve():(window.THREE?Promise.resolve():addS("https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js")).then(()=>addS("https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/loaders/GLTFLoader.js"));
      loading=lib.then(()=>Promise.all(["bike","rider","horse"].map(k=>window.MODELS&&MODELS[k]?0:addS(MD+k+".js")))).then(build)
        .then(()=>{state="ready";},e=>{state="failed";console.warn("3D rider unavailable, the drawn one is used",e);});
      return loading;}
    const parse=k=>new Promise((res,rej)=>new THREE.GLTFLoader().parse(b64(MODELS[k]),"",g=>{delete MODELS[k];res(g);},rej));
    /* bounds after skinning, in the space of `space` */
    function box(o,space){o.updateMatrixWorld(true);const bb=new THREE.Box3(),v=V(),inv=space?new THREE.Matrix4().copy(space.matrixWorld).invert():null;
      o.traverse(m=>{if(!m.isMesh||!m.visible)return;const p=m.geometry.attributes.position;for(let i=0;i<p.count;i+=3){v.fromBufferAttribute(p,i);if(m.isSkinnedMesh)m.boneTransform(i,v);v.applyMatrix4(m.matrixWorld);if(inv)v.applyMatrix4(inv);bb.expandByPoint(v);}});return bb;}
    const bones=o=>{const b={};o.traverse(x=>{if(x.isBone){b[x.name.replace(/^mixamorig:?/,"").replace(/_\d+$/,"").replace(/_0$/,"")]=x;rest.set(x,x.quaternion.clone());}});return b;};
    const reset=bs=>{for(const k in bs){const r=rest.get(bs[k]);if(r)bs[k].quaternion.copy(r);}};
    const wp=(o,v)=>o.getWorldPosition(v||V());
    /* rotate `bone` so the direction bone→child turns toward bone→target (world space) */
    function aim(bone,child,target){bone.updateMatrixWorld(true);const a=wp(bone),c=wp(child),d0=c.sub(a).normalize(),d1=target.clone().sub(a).normalize();if(d0.lengthSq()<1e-9||d1.lengthSq()<1e-9)return;
      const q=Q().setFromUnitVectors(d0,d1),bw=bone.getWorldQuaternion(Q()),pw=bone.parent.getWorldQuaternion(Q());bone.quaternion.copy(pw.invert().multiply(q.multiply(bw)));bone.updateMatrixWorld(true);}
    /* two-bone IK: upper→mid→end reaches `target`; the middle joint bends toward `pole` */
    function ik(up,mid,end,target,pole){up.updateMatrixWorld(true);const A=wp(up),Bp=wp(mid),C=wp(end),la=A.distanceTo(Bp),lb=Bp.distanceTo(C);
      const T=target.clone(),AT=T.clone().sub(A),d=Math.max(Math.abs(la-lb)+1e-4,Math.min(la+lb-1e-4,AT.length()));AT.setLength(d);T.copy(A).add(AT);
      const n=AT.clone().normalize(),pl=pole.clone().sub(n.clone().multiplyScalar(pole.dot(n)));if(pl.lengthSq()<1e-9)pl.set(0,1,0);pl.normalize();
      const ca=(la*la+d*d-lb*lb)/(2*la*d),sa=Math.sqrt(Math.max(0,1-ca*ca)),Bd=A.clone().add(n.clone().multiplyScalar(ca*la)).add(pl.multiplyScalar(sa*la));
      aim(up,mid,Bd);aim(mid,end,T);}
    function build(){
      cv3=document.createElement("canvas");cv3.id="rider3d";cv3.setAttribute("aria-hidden","true");document.body.appendChild(cv3);
      ren=new THREE.WebGLRenderer({canvas:cv3,alpha:true,antialias:true,powerPreference:"high-performance"});ren.setClearColor(0,0);ren.outputEncoding=THREE.sRGBEncoding;
      ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=1.15;
      scene=new THREE.Scene();cam=new THREE.OrthographicCamera(0,1,0,-1,-4000,4000);
      hemi=new THREE.HemisphereLight(0x9fb4ff,0x1a1010,.75);moonL=new THREE.DirectionalLight(0xdff3ff,1.6);keyL=new THREE.DirectionalLight(0xbcd0ff,.55);
      fireL=new THREE.PointLight(0xff7a18,2.4,400,1.6);scene.add(hemi,moonL,moonL.target,keyL,keyL.target,fireL);
      /* v15 real fire: flame planes drawn by a noise shader (additive), hot core → cool tips in the theme's fire colours,
         streaming back with speed; two extra flickering lights put orange glints on the chrome and armour */
      FL.lights=[new THREE.PointLight(0xff7a18,1.4,300,1.6),new THREE.PointLight(0xff7a18,1.4,300,1.6)];FL.lights.forEach(l=>scene.add(l));
      FL.mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,
        uniforms:{uT:{value:0},c1:{value:new THREE.Color(1,1,.85)},c2:{value:new THREE.Color(1,.6,.1)},c3:{value:new THREE.Color(.9,.15,.03)},uSeed:{value:0}},
        vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
        fragmentShader:"uniform float uT,uSeed;uniform vec3 c1,c2,c3;varying vec2 vUv;"+
          "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}"+
          "float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}"+
          "float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+1.7;a*=.5;}return v;}"+
          /* a soft teardrop: rounded base, tapering wavy tongue, edges eaten by noise, bright core → orange → red tips */
          "void main(){vec2 uv=vUv;float t=uT*2.4+uSeed*17.;float q=fb(vec2(uv.x*2.6+uSeed,uv.y*2.4-t)),q2=fb(vec2(uv.x*5.+3.,uv.y*5.-t*1.7));"+
          "vec2 p=uv-vec2(.5,.2);p.x+=(q-.5)*.34*uv.y+(q2-.5)*.06;float wd=.3*pow(max(0.,1.-uv.y),.75)+.015;"+
          "float d=length(vec2(p.x/wd,p.y<0.?p.y/.2:p.y/.8));float body=1.-d+(q-.5)*.55+(q2-.5)*.18;"+
          "float a=smoothstep(.0,.42,body);float core=smoothstep(.35,.85,body);"+
          "vec3 col=mix(c3,c2,smoothstep(.05,.4,body));col=mix(col,c1,core);a*=smoothstep(1.,.82,uv.y);"+
          "gl_FragColor=vec4(col*a*1.25,a);}"});
      FL.geo=new THREE.PlaneGeometry(1,1);FL.geo.translate(0,.5,0);FL.pool=[];
      for(let i=0;i<8;i++){const m=new THREE.Mesh(FL.geo,FL.mat.clone());m.material.uniforms.uSeed.value=i*1.37;m.renderOrder=10;m.visible=false;scene.add(m);FL.pool.push(m);}
      return Promise.all(["bike","rider","horse"].map(parse)).then(([gb,gr,gh])=>{
        /* bike: faces +X; origin at the ground midway between the axles; body paint turned to blood-red black */
        const bm=gb.scene;bm.rotation.y=Math.PI/2;B.inner=new THREE.Group();B.inner.add(bm);let bb=box(bm,B.inner);
        B.len=bb.max.x-bb.min.x;B.hgt=bb.max.y-bb.min.y;B.wid=bb.max.z-bb.min.z;bm.position.set(-(bb.min.x+.525*B.len),-bb.min.y,-(bb.min.z+bb.max.z)/2);
        bm.traverse(m=>{if(m.isMesh&&m.material&&/Body/.test(m.material.name)){m.material=m.material.clone();m.material.color.setRGB(.32,.07,.06);m.material.metalness=Math.min(1,(m.material.metalness||0)+.25);}});
        /* wheels: parts centred on an axle and no bigger than the tyre spin around it */
        B.inner.updateMatrixWorld(true);B.wheels=[];
        for(const u of [.18,.87]){const c=new THREE.Vector3((u-.525)*B.len,.245*B.hgt,0),R=.132*B.len,pv=new THREE.Group();pv.position.copy(c);B.inner.add(pv);pv.updateMatrixWorld(true);const take=[];
          bm.traverse(m=>{if(!m.isMesh)return;const b=box(m,B.inner),cc=b.getCenter(V()),sz=b.getSize(V());if(Math.hypot(cc.x-c.x,cc.y-c.y)<.3*R&&Math.max(sz.x,sz.y)<2.35*R)take.push(m);});
          take.forEach(m=>pv.attach(m));B.wheels.push(pv);}
        B.rig=new THREE.Group();B.body=new THREE.Group();B.rig.add(B.body);B.body.add(B.inner);scene.add(B.rig);
        /* rider: the sword hidden; scaled to 1.78 m against the 2.4 m bike */
        const rm=gr.scene;rm.rotation.y=Math.PI/2;rm.traverse(m=>{if(m.isMesh&&m.material&&/sword/i.test(m.material.name))m.visible=false;});
        RD.m=rm;RD.g=new THREE.Group();RD.g.add(rm);RD.b=bones(rm);const rb=box(rm,RD.g);RD.h=rb.max.y-rb.min.y;
        /* horse: black coat and mane, ember eyes; gallop clip driven by the ride's gait phase */
        const hm=gh.scene;hm.rotation.y=Math.PI/2;HS.mix=new THREE.AnimationMixer(hm);const gal=gh.animations.find(a=>/Gallop$/.test(a.name));HS.act=HS.mix.clipAction(gal);HS.act.play();HS.dur=gal.duration;const bk=gh.animations.find(a=>/Buck_1$/.test(a.name));HS.buck=HS.mix.clipAction(bk);HS.buck.play();HS.buck.weight=0;HS.bdur=bk.duration;HS.mix.update(.05);
        const hb=[];hm.traverse(x=>{if(x.isBone)hb.push(x);});HS.mane=hb.filter(x=>/Neck_0[0-3]_|Head_00/.test(x.name)).slice(0,4);HS.tail=hb.find(x=>/Tail/i.test(x.name))||null;
        hm.traverse(m=>{if(!m.isMesh||!m.material)return;const n=m.material.name;if(/Horse|Hair/.test(n)){m.material=m.material.clone();m.material.color.setRGB(.028,.024,.026);m.material.metalness=0;m.material.roughness=.55;}
          if(/Cornea/.test(n)){m.material=m.material.clone();m.material.emissive=new THREE.Color(0xff3a10);m.material.emissiveIntensity=2.5;}});
        HS.inner=new THREE.Group();HS.inner.add(hm);bb=box(hm,HS.inner);HS.len=bb.max.x-bb.min.x;HS.hgt=bb.max.y-bb.min.y;HS.wid=bb.max.z-bb.min.z;
        hm.position.set(-(bb.min.x+.5*HS.len),-bb.min.y,-(bb.min.z+bb.max.z)/2);
        HS.rig=new THREE.Group();HS.body=new THREE.Group();HS.rig.add(HS.body);HS.body.add(HS.inner);scene.add(HS.rig);
        const gm=new THREE.MeshStandardMaterial({color:0x0c0c0e,metalness:.85,roughness:.35});RD.gun=new THREE.Group();
        const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,1,10),gm);barrel.rotation.z=-Math.PI/2;barrel.position.x=.55;
        const body=new THREE.Mesh(new THREE.BoxGeometry(.45,.32,.22),gm);body.position.x=.05;const grip=new THREE.Mesh(new THREE.BoxGeometry(.2,.5,.18),gm);grip.position.set(-.1,-.3,0);grip.rotation.z=.35;
        RD.gun.add(barrel,body,grip);RD.gun.visible=false;scene.add(RD.gun);
        [B.rig,HS.rig].forEach(o=>o.visible=false);});}
    const fireCols=()=>{const c=k=>pc(pal.f[k]);FL.pool.forEach(m=>{m.material.uniforms.c1.value.copy(c(0));m.material.uniforms.c2.value.copy(c(2));m.material.uniforms.c3.value.copy(c(3));});};
    function fl(i,p,h,w,lean){const m=FL.pool[i];if(!m)return;m.visible=true;m.position.set(p.x,p.y,300+i);m.scale.set(w,h,1);m.rotation.set(0,0,lean);
      m.material.uniforms.uT.value=performance.now()/1000;}
    function flLights(a,b){FL.lights[0].position.copy(a);FL.lights[1].position.copy(b);FL.lights.forEach((l,i)=>{l.color.copy(pc(pal.g));l.intensity=1.2+.5*Math.sin(performance.now()/(47+i*13));});}
    function sizeTo(){const w=innerWidth,h=innerHeight;if(cv3.width!==Math.round(w*Math.min(devicePixelRatio||1,1.5))||cam.right!==w||cam.bottom!==-h){ren.setPixelRatio(Math.min(devicePixelRatio||1,1.5));ren.setSize(w,h,false);cam.right=w;cam.bottom=-h;cam.updateProjectionMatrix();}}
    const pc=s=>{const a=s.split(",").map(Number);return new THREE.Color(a[0]/255,a[1]/255,a[2]/255);};
    function lightsAt(x,y,s){const [mx,my]=hs&&hs.moon?hs.moon:[W*.3,H*.15];moonL.position.set(mx,-my,-500);moonL.target.position.set(x,-y,0);
      keyL.position.set(x+200,-y+400,900);keyL.target.position.set(x,-y,0);fireL.color.copy(pc(pal.g));fireL.distance=420*s;fireL.intensity=2.2+.6*Math.sin(performance.now()/60)*Math.sin(performance.now()/23);}
    /* the rider sits at `seat`, hands to `hands`, feet to `feet` (points in the inner space of the bike or horse) */
    function seatRider(par,seat,hands,feet,r,scale,lean){
      if(RD.g.parent!==par){par.add(RD.g);RD.g.scale.setScalar(scale);RD.placed=false;}
      const b=RD.b;reset(b);RD.g.position.set(0,0,0);RD.m.position.set(0,0,0);RD.g.updateMatrixWorld(true);
      const hp=par.worldToLocal(wp(b.hips));RD.m.position.set((seat.x-hp.x)/scale,(seat.y-hp.y)/scale,(seat.z-hp.z)/scale);RD.g.updateMatrixWorld(true);
      const L=p=>par.localToWorld(p.clone()),fw=L(new THREE.Vector3(1,0,0)).sub(L(new THREE.Vector3(0,0,0))).normalize(),up=L(new THREE.Vector3(0,1,0)).sub(L(new THREE.Vector3(0,0,0))).normalize();
      aim(b.spine,b.chest,wp(b.spine).add(up.clone().multiplyScalar(Math.cos(lean))).add(fw.clone().multiplyScalar(Math.sin(lean))));
      aim(b.neck,b.head,wp(b.neck).add(up.clone()).add(fw.clone().multiplyScalar(.25)));
      ik(b.R_leg,b.R_knee,b.R_ankle,L(feet[1]),fw.clone().add(up.clone().multiplyScalar(.6)));ik(b.L_leg,b.L_knee,b.L_ankle,L(feet[0]),fw.clone().add(up.clone().multiplyScalar(.6)));
      const sh=par.worldToLocal(wp(b.R_arm)),armL=wp(b.R_arm).distanceTo(wp(b.R_elbow))+wp(b.R_elbow).distanceTo(wp(b.R_wrist));
      let rh=hands[1];const ul=armL/par.getWorldScale(V()).x;
      if(r.gun>0)rh=sh.clone().add(new THREE.Vector3(Math.cos(r.aim),-Math.sin(r.aim),0).multiplyScalar(ul*.98));
      else if(r.arm)rh=sh.clone().add(new THREE.Vector3(.15,1,.1).normalize().multiplyScalar(ul*.95));
      const back=up.clone().multiplyScalar(-1).add(fw.clone().multiplyScalar(-.6));
      ik(b.R_arm,b.R_elbow,b.R_wrist,L(rh),back);ik(b.L_arm,b.L_elbow,b.L_wrist,L(hands[0]),back);
      RD.gun.visible=r.gun>0;if(r.gun>0){const e=wp(b.R_elbow),w=wp(b.R_wrist),d=w.clone().sub(e).normalize(),sz=e.distanceTo(w)*.7;
        RD.gun.position.copy(w).add(d.clone().multiplyScalar(sz*.9));RD.gun.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),d);RD.gun.scale.setScalar(sz);}}
    /* place a rig: pivot in screen px (2D local pv scaled), tilt, yaw for a 3/4 view, model origin at local (ox, oy) of the 2D drawing */
    function place(o,r,ox,oy,k,sx,sy){const pvx=r.x+r.pv[0]*r.s*r.dir,pvy=r.gy+r.pv[1]*r.s;o.rig.position.set(pvx,-pvy,0);o.rig.rotation.set(0,0,-r.ang*r.dir);
      o.body.position.set(r.dir*(ox-r.pv[0])*r.s,-(oy-r.pv[1])*r.s,0);o.body.rotation.set(0,r.dir>0?-.28:Math.PI+.28,0);o.body.scale.set(k*(sx||1),k*(sy||1),k);}
    function bike(r){sizeTo();B.rig.visible=true;HS.rig.visible=false;shown=true;const k=125*r.s/B.len;
      place(B,r,1,17,k,1+.06*r.sq,1-.14*r.sq);B.wheels.forEach(w=>w.rotation.z=-r.spin*r.dir);
      const P=(u,v,z)=>new THREE.Vector3((u-.525)*B.len,v*B.hgt,z*B.wid);
      seatRider(B.inner,P(.36,.62,0),[P(.545,.83,-.33),P(.545,.83,.33)],[P(.63,.24,-.3),P(.63,.24,.3)],r,1.78*(B.len/2.4)/RD.h,r.air?.55:.3);
      lightsAt(r.x,r.gy-40*r.s,r.s);fireL.position.set(r.x,-(r.gy-80*r.s),60);
      fireCols();const lean=r.dir*(.75+(r.air?.25:0)),hd=wp(RD.b.head),w0=wp(B.wheels[0]),w1=wp(B.wheels[1]),ex=B.inner.localToWorld(new THREE.Vector3((.06-.525)*B.len,.3*B.hgt,.3*B.wid));
      fl(0,hd.clone().add(new THREE.Vector3(0,6*r.s,0)),70*r.s,40*r.s,lean);fl(1,w0.clone().add(new THREE.Vector3(0,-12*r.s,0)),64*r.s,46*r.s,lean*1.1);
      fl(2,w1.clone().add(new THREE.Vector3(0,-12*r.s,0)),52*r.s,40*r.s,lean*1.1);fl(3,ex,38*r.s,22*r.s,r.dir*1.35);flLights(w0,w1);}
    function horse(r){sizeTo();HS.rig.visible=true;B.rig.visible=false;shown=true;const k=150*r.s/HS.len;
      place(HS,r,14,0,k);const rear=r.rear!=null&&r.rear<2.4;HS.act.weight=rear?0:1;HS.buck.weight=rear?1:0;
      HS.act.time=((r.g/6.2832)%1+1)%1*HS.dur;HS.buck.time=rear?Math.min(1.5+.12*Math.sin(r.rear*7),HS.bdur-.01):0;HS.mix.update(0);
      const P=(u,v,z)=>new THREE.Vector3((u-.5)*HS.len,v*HS.hgt,z*HS.wid);
      seatRider(HS.inner,P(.57,.72,0),[P(.68,.76,-.12),P(.68,.76,.12)],[P(.56,.42,-.55),P(.56,.42,.55)],r,1.78*(HS.len/2.4)/RD.h,.2);
      lightsAt(r.x,r.gy-70*r.s,r.s);fireL.position.set(r.x,-(r.gy-120*r.s),60);
      fireCols();const lean=r.dir*(r.rear!=null&&r.rear<2.4?.25:.8),hd=wp(RD.b.head);fl(0,hd.clone().add(new THREE.Vector3(0,6*r.s,0)),70*r.s,40*r.s,lean);
      HS.mane.forEach((b,i)=>fl(1+i,wp(b),(44-i*6)*r.s,26*r.s,lean*1.1));if(HS.tail)fl(5,wp(HS.tail),46*r.s,24*r.s,r.dir*1.4);flLights(wp(HS.mane[0]||RD.b.head),HS.tail?wp(HS.tail):hd);}
    /* werewolf poses on its Mixamo skeleton: targets in the wolf's own space (X forward, Y up, model units) */
    function wolf(x,y,sc,dir,pose,g,a,rot,T){if(!WF.rig)return;sizeTo();WF.rig.visible=true;WF.seen=true;shown=true;const k=150*sc/WF.hgt,b=WF.b;
      WF.rig.position.set(x,-y,0);WF.rig.rotation.set(0,0,-(rot||0)*dir);WF.inner.rotation.set(0,dir>0?-.3:Math.PI+.3,0);WF.inner.scale.setScalar(k);
      WF.inner.position.set(0,pose==="leap"?-.45*150*sc:0,0);
      WF.mix.update(0);reset(b);WF.mix.setTime(T%2);WF.inner.updateMatrixWorld(true);
      const H=WF.hgt,L=p=>WF.inner.localToWorld(p.clone()),P=(u,v,z)=>L(new THREE.Vector3(u*H,v*H,z*H)),fw=P(1,0,0).sub(P(0,0,0)).normalize(),up=P(0,1,0).sub(P(0,0,0)).normalize();
      const look=(bn,ch,f,u)=>aim(bn,ch,wp(bn).add(up.clone().multiplyScalar(u)).add(fw.clone().multiplyScalar(f)));
      const back=fw.clone().multiplyScalar(-1),fwd=fw.clone(),knee=fw.clone().add(up.clone().multiplyScalar(.3));
      if(pose==="sit"||pose==="howl"){const br=Math.sin(T*2.6)*.03;
        look(b.Spine,b.Spine2,-.15,1);look(b.Spine2,b.Neck,-.05,1);look(b.Neck,b.Head,.35,1);look(b.Head,b.HeadTop_End,.55+br,1);
        ik(b.LeftArm,b.LeftForeArm,b.LeftHand,P(-.12,.36,-.62),back);ik(b.RightArm,b.RightForeArm,b.RightHand,P(.06,.4,.62),back);
        ik(b.LeftUpLeg,b.LeftLeg,b.LeftFoot,P(-.1,.02,-.2),knee);ik(b.RightUpLeg,b.RightLeg,b.RightFoot,P(.08,.02,.2),knee);}
      else if(pose==="leap"){look(b.Spine,b.Spine2,1,.25);look(b.Spine2,b.Neck,1,.2);look(b.Neck,b.Head,1,.25);
        ik(b.LeftArm,b.LeftForeArm,b.LeftHand,P(.85,.55,-.25),back);ik(b.RightArm,b.RightForeArm,b.RightHand,P(.9,.62,.25),back);
        ik(b.LeftUpLeg,b.LeftLeg,b.LeftFoot,P(-.75,.3,-.15),knee);ik(b.RightUpLeg,b.RightLeg,b.RightFoot,P(-.65,.18,.15),knee);}
      else if(pose==="land"){look(b.Spine,b.Spine2,.8,.5);look(b.Neck,b.Head,1,.3);
        ik(b.LeftArm,b.LeftForeArm,b.LeftHand,P(.45,.04,-.3),back);ik(b.RightArm,b.RightForeArm,b.RightHand,P(.5,.04,.3),back);
        ik(b.LeftUpLeg,b.LeftLeg,b.LeftFoot,P(-.15,.03,-.2),knee);ik(b.RightUpLeg,b.RightLeg,b.RightFoot,P(-.05,.03,.2),knee);}
      else{/* sprint: hunched forward, legs cycle (stance slides back on the ground, swing arcs forward), arms counter-swing */
        look(b.Spine,b.Spine2,.75,.65);look(b.Spine2,b.Neck,.8,.5);look(b.Neck,b.Head,1,.2);
        const foot=(ph,z)=>{const c=((ph/6.2832)%1+1)%1;let u,v;if(c<.45){const t=c/.45;u=.38-.76*t;v=.03;}else{const t=(c-.45)/.55,e=t*t*(3-2*t);u=-.38+.76*e;v=.03+Math.sin(Math.PI*t)*.32;}return P(u,v,z);};
        ik(b.LeftUpLeg,b.LeftLeg,b.LeftFoot,foot(g,-.16),knee);ik(b.RightUpLeg,b.RightLeg,b.RightFoot,foot(g+Math.PI,.16),knee);
        const hand=(ph,z)=>P(.25+.35*Math.sin(ph),.42+.12*Math.cos(ph),z);
        ik(b.LeftArm,b.LeftForeArm,b.LeftHand,hand(g+Math.PI,-.32),back);ik(b.RightArm,b.RightForeArm,b.RightHand,hand(g,.32),back);}
      WF.inner.traverse(m=>{if(m.isMesh&&m.material){m.material.transparent=a<.98;m.material.opacity=a;}});
      lightsAt(x,y-60*sc,sc);if(!run)fireL.intensity=0;}
    /* one render per frame; models not placed this frame are hidden */
    function frame(){if(state!=="ready")return;const any=(B.rig.visible||HS.rig.visible||WF.seen);
      if(WF.rig&&!WF.seen)WF.rig.visible=false;WF.seen=false;
      if(!any){if(shown){ren.clear();shown=false;}return;}
      ren.render(scene,cam);B.rig.visible=false;HS.rig.visible=false;if(RD.gun)RD.gun.visible=false;FL.pool.forEach(m=>m.visible=false);FL.lights.forEach(l=>l.intensity=0);}
    const dbg=()=>({state,cv:[cv3&&cv3.width,cv3&&cv3.height],cam:cam&&[cam.left,cam.right,cam.top,cam.bottom],bike:B.rig&&B.rig.position.toArray(),k:B.body&&B.body.scale.x,len:B.len,tris:ren&&ren.info.render.triangles,calls:ren&&ren.info.render.calls,vis:B.rig&&B.rig.visible});
    return {load,bike,horse,wolf,frame,dbg,get on(){return state==="ready";},get state(){return state;}};
  })();
  function loop(now){raf=requestAnimationFrame(loop);const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=Math.max(last,now);
    const r=run;
    hz+=((r?1:0)-hz)*Math.min(1,dt*1.4);
    document.documentElement.classList.toggle("haunted",hz>.3);document.documentElement.classList.toggle("cine",!!run);
    /* after the bike pass: a short pause, then he gallops back the other way on the flaming horse */
    if(r&&r.mode==="gap"){r.wait-=dt;if(r.wait<=0){r.mode="horse";r.dir=-r.dir;r.x=r.dir>0?-200*r.s:W+200*r.s;r.ang=0;r.pv=[0,-60];r.arm=false;r.air=false;r.lift=0;r.ch={st:"off",t:0};  /* v14: no chain catch (user asked to remove it) */ r.shots=[.08,.17];SFX.neigh();setTimeout(()=>SFX.snort(),1700);}}
    else if(r&&r.mode==="horse"){const pr=r.dir>0?r.x/W:1-r.x/W;
      if(r.rear==null&&pr>.4&&R3.on){r.rear=0;if(hs)hs.fl=1;SFX.thunder(1);setTimeout(()=>SFX.neigh(),180);shake(.6);}
      const rearing=r.rear!=null&&r.rear<2.4;if(r.rear!=null&&r.rear<2.4)r.rear+=dt;r.zt=rearing?1.12:1;const v=rearing?0:r.v*1.3;r.x+=r.dir*v*dt;r.t+=dt;const c0=r.g/6.2832;r.g+=dt*v/(15*r.s);r.sp=v*dt;
      for(const o of [0,.1,.42,.52])if(Math.floor(r.g/6.2832+o)>Math.floor(c0+o))SFX.hoof(o===.1||o===.52?1:.65);if(Math.random()<.003)SFX.snort();
      r.base=H-17*r.s-12;r.gy=r.base-Math.max(0,Math.sin(r.g-.6))*6*r.s;r.ang=Math.sin(r.g+.9)*.06;
      /* rearing: the whole horse pivots up about its hind hooves (nose to the moon), then drops back to the gallop */
      if(rearing){const u=Math.min(1,r.rear/2.4),e=Math.sin(Math.PI*Math.min(1,u*1.15));r.pv=[-46,0];r.ang=-.62*Math.pow(Math.max(0,e),.7);r.gy=r.base;}else if(r.rear!=null)r.pv=[0,-60];const back=-r.dir;
      const hd=toW(16,-126);emit("f",hd[0],hd[1],7,()=>({vx:back*R(60,200),vy:R(-160,-60),r:R(4,9),l:R(.25,.5)}));
      emit("e",hd[0],hd[1],2,()=>({vx:back*R(40,200),vy:R(-220,-80),r:R(1,2),l:R(.8,1.6)}));
      for(const [mx,my] of [[28,-80],[38,-92],[46,-104]]){const m=toW(mx,my);emit("f",m[0],m[1],1,()=>({vx:back*R(60,160),vy:R(-120,-40),r:R(2,5),l:R(.2,.4)}));}
      const tl=toW(-54,-54);emit("f",tl[0],tl[1],3,()=>({vx:back*R(80,200),vy:R(-70,10),r:R(3,7),l:R(.25,.5)}));
      for(const l of legs(r.g)){const hf=toW(l[4],l[5]);emit("f",hf[0],hf[1],l[5]>-6?5:1,()=>({vx:back*R(10,90),vy:R(-90,-20),r:R(3,6),l:R(.2,.45)}));
        if(l[5]>-3&&Math.random()<.25)emit("e",hf[0],hf[1],4,()=>({vx:R(-120,120),vy:R(-180,-60),r:R(1,2),l:R(.4,.9)}));}
      emit("m",tl[0],r.base-6*r.s,1,()=>({vx:back*R(10,50),vy:R(-40,-10),r:R(8,14),l:R(1.2,2.2)}));
      /* the flaming chain: thrown at the mascot, it catches it (MASCOT.grab), reels it in to fly on a leash above his raised fist,
         and lets it go before he leaves (MASCOT.release), then snaps back. c.st: idle → throw → reel → carry → back → off */
      const c=r.ch,fist=chainFist(),p=r.dir>0?r.x/W:1-r.x/W,ease=u=>u*u*(3-2*u),lerp=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u],lead=()=>[fist[0]-r.dir*34*r.s,fist[1]-72*r.s];c.t+=dt;
      if(c.st==="idle"){if(p>.27&&p<.62&&window.MASCOT){const w=MASCOT.where();if(w){c.st="throw";c.t=0;c.tg=w;SFX.whoosh();}}}
      else if(c.st==="throw"){const u=Math.min(1,c.t/.65);c.e=lerp(fist,c.tg,1-(1-u)*(1-u));
        if(u>=1){c.h=MASCOT.grab();SFX.clink();c.s0=c.e.slice();c.t=0;c.st=c.h?"reel":"back";emit("e",c.e[0],c.e[1],16,()=>({vx:R(-200,200),vy:R(-200,60),r:R(1,2.2),l:R(.4,.9)}));}}
      else if(c.st==="reel"){const u=Math.min(1,c.t/1.3);c.e=lerp(c.s0,lead(),ease(u));c.e[1]-=Math.sin(u*Math.PI)*40;if(u>=1){c.st="carry";c.t=0;}}
      else if(c.st==="carry"){const l=lead();if(Math.random()<.025)SFX.clink();c.e=[l[0]+Math.sin(r.t*5)*9,l[1]+Math.sin(r.t*7)*7];
        if(c.t>2.6||p>.86){(MASCOT.releaseGhost||MASCOT.release).call(MASCOT,c.h,c.e[0],c.e[1]);c.h=null;c.st="back";c.t=0;c.s0=c.e.slice();}}
      else if(c.st==="back"){const u=Math.min(1,c.t/.35);c.e=lerp(c.s0,fist,u);if(u>=1)c.st="off";}
      r.arm=c.st==="throw"||c.st==="reel"||c.st==="carry"||(r.rear!=null&&r.rear<2.4);shoot(p,dt);
      if(c.e&&c.st!=="idle"&&c.st!=="off")emit("f",c.e[0],c.e[1],2,()=>({vx:R(-40,40),vy:R(-80,-20),r:R(2,5),l:R(.2,.4)}));
      if(c.h)c.h.el.style.transform="translate("+(c.e[0]-c.h.cx).toFixed(1)+"px,"+(c.e[1]-c.h.cy).toFixed(1)+"px) scale("+(c.h.owl?.7:.7*r.dir)+",.7)";
      if(r.dir>0?r.x>W+240*r.s:r.x<-240*r.s){if(c.h)(MASCOT.releaseGhost||MASCOT.release).call(MASCOT,c.h,c.e[0],c.e[1]);else if(window.MASCOT)MASCOT.home();run=null;}}
    else if(r){let sl=1;const p0=r.dir>0?r.x/W:1-r.x/W;for(const k of r.tr)if(k.k==="flip"&&p0>k.a&&p0<k.b){const u=(p0-k.a)/(k.b-k.a);sl=k.over?2.2*(u>.4&&u<.6?.4:1):(u>.3&&u<.7?.35:1);}
      r.slow=(r.slow||1)+(sl-(r.slow||1))*Math.min(1,dt*7);r.zt=sl<.99?1.17:1;const dts=dt*r.slow;r.x+=r.dir*r.v*dts;r.t+=dts;const p=r.dir>0?r.x/W:1-r.x/W;
      let ang=0,pv=[0,-24],lift=0,air=false,arm=false;
      for(const k of r.tr){
        if(p>k.b){if(!k.done){k.done=true;if(k.k!=="wheelie")land();}continue;}
        if(p<k.a)continue;const u=(p-k.a)/(k.b-k.a);
        if(k.k==="wheelie"){ang=-.4*Math.min(1,Math.sin(Math.PI*u)*1.7);pv=[-38,0];continue;}
        air=true;arm=k.k!=="hop"&&u>.25&&u<.8;lift=k.h*r.s*(k.over?Math.sqrt(4*u*(1-u)):4*u*(1-u));
        if(k.k==="flip"){const e=u<.18?0:u>.82?1:(u-.18)/.64;ang=-6.2832*e*e*(3-2*e)-.3*Math.sin(Math.PI*u);}
        else ang=-.34*Math.sin(2*Math.PI*u)*(k.k==="big"?1.4:1);
        if(!k.up){k.up=true;SFX.engine(true,1.4);const ex=toW(-58,-11);emit("f",ex[0],ex[1],26,()=>({vx:-r.dir*R(120,320),vy:R(-80,20),r:R(3,7),l:R(.2,.45)}));}}
      r.sq=Math.max(0,r.sq-dt*3.5);r.ang=ang;r.pv=pv;r.lift=lift;r.air=air;r.arm=arm;shoot(p,dt);
      r.base=H-34*r.s-12;r.gy=r.base-lift;r.spin+=r.dir*r.v*dts/(17*r.s)*(air?1.6:1);SFX.engine(true,air?1.1:.25+.12*Math.sin(r.t*3));
      r.sp=r.v*dt;const hd=toW(6,-80),rw=toW(-38,16),fw=toW(40,16),ex=toW(-60,-13),wx=toW(-38,0),fx=toW(40,0),back=-r.dir;
      emit("f",hd[0],hd[1],R3.on?5:14,()=>({vx:back*R(60,220),vy:R(-170,-60),r:R(5,11),l:R(.3,.65)}));
      emit("e",hd[0],hd[1],2,()=>({vx:back*R(40,200),vy:R(-220,-80),r:R(1,2),l:R(.8,1.6)}));
      for(const w of [wx,fx])emit("f",w[0]+R(-16,16)*r.s,w[1]+R(-16,16)*r.s,4,()=>({vx:back*R(20,120),vy:R(-90,-20),r:R(3,6),l:R(.2,.45)}));
      emit("f",rw[0],rw[1],6,()=>({vx:back*R(0,40),vy:R(-70,-15),r:R(4,9),l:R(.7,1.5)}));
      emit("f",fw[0],fw[1],2,()=>({vx:back*R(0,30),vy:R(-60,-10),r:R(3,7),l:R(.5,1.1)}));
      emit("m",rw[0],rw[1]-8,2,()=>({vx:back*R(10,50),vy:R(-50,-15),r:R(8,14),l:R(1.4,2.4)}));
      emit("f",ex[0],ex[1],3,()=>({vx:back*R(120,260),vy:R(-30,10),r:R(2,5),l:R(.15,.35)}));
      if(r.dir>0?r.x>W+200*r.s:r.x<-200*r.s){r.mode="gap";r.wait=1.4;SFX.engine(false);}}
    for(const q of P){q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.97;if(q.k==="e")q.vy+=90*dt;if(q.k==="m"){q.r+=14*dt;q.vy*=.98;}}
    P=P.filter(q=>q.t<q.l);
    for(const b of B){b.x+=b.vx*dt;b.y+=b.vy*dt;emit("f",b.x,b.y,2,()=>({vx:-b.vx*.05+R(-20,20),vy:-b.vy*.05+R(-20,20),r:R(2,4),l:R(.12,.25)}));
      if(b.bat&&b.bat.gh){const g=b.bat.gh;if(!b.hit&&!g.dead&&g.cy&&Math.hypot(b.x-g.x,b.y-g.cy)<40*g.s+12){b.hit=true;g.dead=true;g.dt=0;b.x=-999;SFX.wail();
        emit("e",g.x,g.cy,14,()=>({vx:R(-200,200),vy:R(-200,60),r:R(1,2.2),l:R(.4,.9)}));}}
      else if(b.bat){const bt=b.bat;if(!b.hit&&!bt.dead&&Math.hypot(b.x-bt.sx,b.y-bt.sy)<26){b.hit=true;bt.dead=true;bt.vy=-140;bt.rot=0;b.x=-999;SFX.squeak();
        emit("e",bt.sx,bt.sy,16,()=>({vx:R(-220,220),vy:R(-220,80),r:R(1,2.4),l:R(.4,.9)}));emit("f",bt.sx,bt.sy,8,()=>({vx:R(-80,80),vy:R(-120,0),r:R(3,6),l:R(.2,.4)}));}}
      else if(!b.hit&&Math.hypot(b.x-b.tx,b.y-b.ty)<46){b.hit=true;if(window.MASCOT)MASCOT.dodge();}}
    B=B.filter(b=>b.x>-60&&b.x<W+60&&b.y>-60&&b.y<H+60);
    if(run&&!document.hidden){ema+=(dt-ema)*.05;if(ema>.03)slowT+=dt;else slowT=Math.max(0,slowT-dt*.5);if(slowT>1.5&&!lowQ){lowQ=true;console.info("fire rider: lighter mode for this device");}}
    const r3=R3.on;ctx=ctxL;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    hauntDraw(dt,now/1000);inferno(dt,now/1000);const dk0=dark;dark=dark||hz>.4;
    for(const q of P)if(q.k==="m"){const f=q.t/q.l;ctx.fillStyle="rgba("+pal.sm+","+((dark?.22:.08)*(1-f)).toFixed(3)+")";ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,6.2832);ctx.fill();}
    if(run){const [gx,gy]=toW(0,-40),g=ctx.createRadialGradient(gx,gy,0,gx,gy,190*run.s);g.addColorStop(0,"rgba("+pal.g+","+(dark?.28:.16)+")");g.addColorStop(1,"rgba("+pal.g+",0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(gx,gy,190*run.s,0,6.2832);ctx.fill();}
    ctx=ctxM;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    if(run){if(run.mode==="bike"){if(r3)R3.bike(run);else bike();}else if(run.mode==="horse"){if(r3)R3.horse(run);else horse();chain();}}
    ctx.globalCompositeOperation=dark?"lighter":"source-over";
    for(const q of P){if(q.k==="m")continue;const f=q.t/q.l;
      if(q.k==="e"){ctx.strokeStyle="rgba("+pal.e+","+((1-f)*(.6+.4*Math.random())).toFixed(3)+")";ctx.lineWidth=q.r*.9;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x-q.vx*.035,q.y-q.vy*.035);ctx.stroke();continue;}
      const HS=fireSprites().heat,rr=q.r*1.9*(f<.2?.6+f*2:1.1-f*.6);ctx.globalAlpha=Math.pow(1-f,1.2)*(dark?.75:.6);ctx.drawImage(HS[Math.min(23,Math.floor(f*24))],q.x-rr,q.y-rr*1.2,rr*2,rr*2.4);ctx.globalAlpha=1;}
    for(const b of B){ctx.save();ctx.shadowColor="rgba("+pal.g+",1)";ctx.shadowBlur=12;ctx.lineCap="round";ctx.strokeStyle="rgba("+pal.f[0]+",1)";ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(b.x-b.vx*.03,b.y-b.vy*.03);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore();}
    water(dt);ctx.globalCompositeOperation="source-over";dark=dk0;R3.frame();
    if(hz>.3&&!lowQ){if(!GR){const g=document.createElement("canvas");g.width=g.height=160;const x=g.getContext("2d"),im=x.createImageData(160,160);
        for(let i=0;i<im.data.length;i+=4){const v=Math.random()*255|0;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=Math.random()<.5?40:0;}x.putImageData(im,0,0);GR=ctx.createPattern(g,"repeat");}
      ctx.save();ctx.globalAlpha=.35*hz;ctx.translate(-R(0,160),-R(0,160));ctx.fillStyle=GR;ctx.fillRect(0,0,W+160,H+160);ctx.restore();}
    /* cinematic zoom on the rider during the backflip and the rearing (all three layers, compositor only) */
    camZ+=((run&&run.zt||1)-camZ)*Math.min(1,dt*2.6);const zc=[cvL,cv,document.getElementById("rider3d"),GF.el,document.getElementById("jungle"),document.getElementById("jungleL")];
    /* v20: the trees zoom with the camera too (origin converted into each element's own box), so the fire stays on its tree */
    if(camZ>1.002&&run){const [zx,zy]=toW(0,-40);zc.forEach(c=>{if(c){if(!c.style.transform||!c._b)c._b=c.getBoundingClientRect();const ox=[zx-c._b.left,zy-c._b.top];
      c.style.transformOrigin=ox[0].toFixed(0)+"px "+ox[1].toFixed(0)+"px";c.style.transform="scale("+camZ.toFixed(4)+")";}});}
    else if(camZ<=1.002)zc.forEach(c=>{if(c&&c.style.transform)c.style.transform="";});
    if(!run&&!P.length&&!B.length&&!HW.length&&!STM.length&&hz<.01){hz=0;hs=null;document.querySelectorAll(".burning").forEach(e=>e.classList.remove("burning"));cancelAnimationFrame(raf);raf=0;ctx.clearRect(0,0,W,H);ctxL.clearRect(0,0,W,H);GF.clear();R3.frame();}}
  /* he comes only when summoned: the ghost button, the command palette, or finishing a quiz */
  document.addEventListener("quizdone",()=>{SFX.init();setTimeout(()=>{if(!reduce.matches)go();},900);});
  /* ghost button in the nav: a ghost floats out of it and the rider comes (glows while he rides) */
  const GH='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5c-4.4 0-7.5 3.4-7.5 7.8V21l2.5-1.8 2.5 1.8 2.5-1.8 2.5 1.8 2.5-1.8 2.5 1.8V10.3c0-4.4-3.1-7.8-7.5-7.8z"/><ellipse cx="9.3" cy="10.5" rx="1.5" ry="2" fill="var(--surface,#fff)"/><ellipse cx="14.7" cy="10.5" rx="1.5" ry="2" fill="var(--surface,#fff)"/></svg>';
  const POP='<svg viewBox="0 0 24 24"><path fill="#f8f7ff" stroke="#a78bfa" stroke-width=".8" d="M12 2.5c-4.4 0-7.5 3.4-7.5 7.8V21l2.5-1.8 2.5 1.8 2.5-1.8 2.5 1.8 2.5-1.8 2.5 1.8V10.3c0-4.4-3.1-7.8-7.5-7.8z"/><ellipse cx="9.3" cy="10.5" rx="1.5" ry="2" fill="#1e1b4b"/><ellipse cx="14.7" cy="10.5" rx="1.5" ry="2" fill="#1e1b4b"/><ellipse cx="12" cy="15" rx="1.4" ry="1.7" fill="#1e1b4b"/></svg>';
  const tb=document.getElementById("tocBtn");
  if(tb){const gb=document.createElement("button");gb.id="ghostBtn";gb.type="button";gb.title="Summon the fire rider";gb.setAttribute("aria-label","Summon the fire rider");gb.innerHTML=GH;tb.before(gb);gb.addEventListener("pointerenter",()=>R3.load(),{once:true});
    const sb=document.createElement("button");sb.id="sndBtn";sb.type="button";const sp=()=>{sb.textContent=SFX.on?"🔊":"🔇";sb.title="Sound: "+(SFX.on?"on":"off");sb.setAttribute("aria-label",sb.title);sb.setAttribute("aria-pressed",String(SFX.on));};
    sp();gb.before(sb);sb.addEventListener("click",()=>{SFX.init();SFX.set(!SFX.on);sp();});
    gb.addEventListener("click",()=>{const r=gb.getBoundingClientRect(),p=document.createElement("div");p.className="gh-pop";p.innerHTML=POP;
      p.style.left=(r.left+r.width/2)+"px";p.style.top=(r.top+r.height/2)+"px";document.body.appendChild(p);setTimeout(()=>p.remove(),2000);
      go();if(run){gb.classList.add("on");const t=setInterval(()=>{if(!run){gb.classList.remove("on");clearInterval(t);}},300);}});}
  window.RIDER3D=R3;  /* test hook: the 3D layer */
  return {go};
})();

/* ancient tree: a massive, gnarled trunk fills the mascot column (≥1200px) from the ground up to the mascot's branch and runs off the
   right screen edge. A big dark hollow opens at its base (exposed-wood rim), with a smaller side hollow and a knot hole higher up;
   grey-brown bark with deep vertical fissures and lighter ridges, moss patches, and dappled sunlight drifting over it by day. A few
   natural leafy limbs reach out to the left and a crown sits behind the mascot. Limbs sway from their joints; a leaf drifts down now and
   then; darker at night (owl hours). Seeded random, so the same tree every time; rebuilt when the column's height changes. */
(function(){
  const box=document.createElement("div");box.id="jungle";box.setAttribute("aria-hidden","true");document.body.appendChild(box);
  const wide=matchMedia("(min-width:1200px)"),reduce=matchMedia("(prefers-reduced-motion: reduce)");
  const isNight=()=>{const p=THM.phase()[0];return !(p==="early"||p==="day");};
  const f=n=>n.toFixed(1);
  let svg=null,tips=[],perches=[],seed=11;
  const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;},rr=(a,b)=>a+rnd()*(b-a);
  /* smooth path through points (quadratic curves through the midpoints) */
  const smooth=P=>{let d="M"+f(P[0][0])+" "+f(P[0][1]);for(let i=1;i<P.length-1;i++)d+=" Q"+f(P[i][0])+" "+f(P[i][1])+" "+f((P[i][0]+P[i+1][0])/2)+" "+f((P[i][1]+P[i+1][1])/2);
    return d+" L"+f(P[P.length-1][0])+" "+f(P[P.length-1][1]);};
  function limb(x0,y0,x1,y1,w0,w1,bend,cls){const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,a=-dy/l,b=dx/l,mx=(x0+x1)/2+a*bend,my=(y0+y1)/2+b*bend;
    return '<path class="'+cls+'" d="M'+f(x0+a*w0)+' '+f(y0+b*w0)+' Q'+f(mx+a*(w0+w1)/2)+' '+f(my+b*(w0+w1)/2)+' '+f(x1+a*w1)+' '+f(y1+b*w1)+' L'+f(x1-a*w1)+' '+f(y1-b*w1)+' Q'+f(mx-a*(w0+w1)/2)+' '+f(my-b*(w0+w1)/2)+' '+f(x0-a*w0)+' '+f(y0-b*w0)+'Z"/>';}
  /* a pointed, slightly asymmetric leaf (12.5 long) with a short stalk; shade picked by where it sits in its clump (sunlit on top) */
  const LEAF="M0 0 L1.6 0 C3.6 -3.6 8.6 -4.2 12.5 0 C8.4 3.6 3.6 3.2 1.6 0Z";
  const shade=v=>{const r=rnd();return v<-.35?(r<.45?4:3):v<.05?(r<.25?4:r<.7?3:2):v<.45?(r<.5?2:1):(r<.6?1:0);};
  function leaves(x,y,ang,n,spread){let s="";for(let i=0;i<n;i++){const a=ang+rr(-1.7,1.7),d=rr(1,spread),lx=x+Math.sin(a)*d,ly=y-Math.cos(a)*d,rot=a*57.3-90+rr(-30,30),k=rr(.7,1.1);
      s+='<path class="jl'+shade((ly-y)/spread)+'" transform="translate('+f(lx)+' '+f(ly)+') rotate('+f(rot)+') scale('+f(k)+')" d="'+LEAF+'"/>';}return s;}
  /* a foliage clump: dark masses give it volume, then leaves fan out in every direction, lighter on top and darker underneath */
  function clump(x,y,r){let s="";
    for(let i=0;i<5;i++){const a=rr(0,6.283),d=rr(0,r*.45);s+='<ellipse class="jl0" cx="'+f(x+Math.cos(a)*d)+'" cy="'+f(y+Math.sin(a)*d+r*.15)+'" rx="'+f(rr(.45,.7)*r)+'" ry="'+f(rr(.4,.6)*r)+'"/>';}
    const n=Math.round(r*3.2);
    for(let i=0;i<n;i++){const a=rr(0,6.283),d=Math.sqrt(rnd())*r,lx=x+Math.cos(a)*d,ly=y+Math.sin(a)*d*.85,k=rr(.65,1.05),
      rot=a*57.3+rr(-40,40);
      s+='<path class="jl'+shade((ly-y)/r)+'" transform="translate('+f(lx)+' '+f(ly)+') rotate('+f(rot)+') scale('+f(k)+')" d="'+LEAF+'"/>';}
    return s;}
  function branch(x,y,ang,len,w,depth,sway){
    if(x+Math.sin(ang)*len<32)len=Math.max(8,(x-32)/-Math.sin(ang));
    const x1=Math.min(186,x+Math.sin(ang)*len),y1=y-Math.cos(ang)*len,w1=Math.max(.5,w*.62);
    if(depth>=2&&w>1.6)perches.push([x+(x1-x)*.55,y+(y1-y)*.55-w*.4,w]);
    let s=sway?'<g class="jg-b" style="transform-origin:'+f(x)+'px '+f(y)+'px;animation-duration:'+f(rr(5,8))+'s;animation-delay:'+f(-rr(0,8))+'s">':"<g>";
    s+=limb(x,y,x1,y1,w,w1,rr(-len*.08,len*.08),"jg-wood");
    if(depth<=0||w1<.8){s+=clump(x1,y1,rr(9,13));tips.push([x1,y1]);return s+"</g>";}
    const kids=rnd()<.35?3:2;
    for(let i=0;i<kids;i++){const t=i===0?1:rr(.45,.85),bx=x+(x1-x)*t,by=y+(y1-y)*t,side=i===0?rr(-.25,.15):(i%2?-1:1)*rr(.45,.9)-.15;
      s+=branch(bx,by,ang+side,len*rr(.62,.8),i===0?w1:w1*.8,depth-1,depth>=3);}
    if(depth<=2)s+=leaves(x1,y1,ang,8,10);
    return s+"</g>";}
  /* the woodpecker, drawn facing left with its head at about (-5,-11) and its body inside the hole (the clip hides what is behind the
     bark). Its head jabs at the bark in two drumming bursts per 11 s cycle, and wood chips fly from the bill on every strike. */
  function woodpecker(){
    const T=[[30,7],[50,5]],K=["0%{transform:none}","12%{transform:rotate(9deg)}","15%{transform:rotate(-7deg)}","19%,26%{transform:none}"];
    const C=[[],[],[]];
    T.forEach(([at,n])=>{for(let i=0;i<n;i++){const p=at+i*1.1;K.push(f(p)+"%{transform:none}",f(p+.45)+"%{transform:translate(-2.4px,.6px) rotate(-12deg)}");
      C.forEach((c,j)=>c.push(f(p+.4)+"%{opacity:0;transform:translate(-20px,-9px)}",f(p+.5)+"%{opacity:1;transform:translate(-20px,-9px)}",
        f(p+1.6)+"%{opacity:0;transform:translate("+f(-24-j*3)+"px,"+f(-6+j*4)+"px) rotate("+(90+j*70)+"deg)}"));}
      K.push(f(at+n*1.1)+"%{transform:none}");});
    K.push("64%{transform:none}","67%,71%{transform:rotate(8deg)}","74%,100%{transform:none}");
    const css="@keyframes jg-wph{"+K.join("")+"}"+C.map((c,j)=>"@keyframes jg-chip"+j+"{0%{opacity:0}"+c.join("")+"100%{opacity:0}}#jungle .jg-chip.c"+j+"{animation:jg-chip"+j+" 11s linear infinite}").join("");
    return '<style>'+css+'</style><g class="jg-wp">'+
      '<path fill="#151413" d="M-4 -6 C2 -8 9 -2 9 6 C9 12 6 16 2 18 C-2 14 -5 6 -4 -6Z"/>'+
      '<path fill="#efebe2" d="M-1 -1 C2.5 -2 5.5 2.5 5.5 8 C3 9 0 6 -1 -1Z"/>'+
      '<g fill="#efebe2"><circle cx="4.5" cy="12" r=".8"/><circle cx="6.5" cy="10.5" r=".7"/><circle cx="3" cy="14.5" r=".7"/><circle cx="5.5" cy="14" r=".6"/></g>'+
      '<path fill="#e6dfd2" d="M-4 -5 C-9 -1 -10 7 -7 13 C-5 16 -1 18 2 18 C-2 12 -4 4 -4 -5Z"/>'+
      '<path d="M-8 4 C-7.5 8 -6.5 11 -5 13" stroke="#cfc5b4" stroke-width=".8" fill="none"/>'+
      '<g transform="translate(-3 -5)"><g class="jg-wph"><g transform="translate(3 5)">'+
        '<circle cx="-5" cy="-11" r="6.2" fill="#efebe2"/>'+
        '<path fill="#151413" d="M-11.4 -12 C-10.5 -18.4 -1.5 -19.4 1.2 -13 C-2 -15.6 -7.2 -15.4 -11.4 -12Z"/>'+
        '<path fill="#c8102e" d="M.4 -15.4 C2.4 -13.4 2.4 -10.4 .6 -9 C-.6 -10.8 -.6 -13.4 .4 -15.4Z"/>'+
        '<path fill="#151413" d="M-10.6 -9 C-6.5 -7.3 -2.6 -7.4 1 -10.4 L1.2 -8.4 C-.6 -5.6 -1.8 -3.4 -2.8 -1 L-4.2 -1.8 C-4.4 -4 -6.4 -6.2 -10.6 -7.8Z"/>'+
        '<circle cx="-7.2" cy="-12" r="1.35" fill="#1a0f08"/><circle cx="-7.6" cy="-12.4" r=".45" fill="#fff"/>'+
        '<path fill="#3a3836" d="M-10.8 -11.6 L-19.6 -10.6 L-10.8 -9.3Z"/><path d="M-10.8 -11.4 L-19 -10.6" stroke="#77736d" stroke-width=".4"/>'+
      '</g></g></g></g>'+
      '<g fill="#c99a63"><rect class="jg-chip c0" x="-.8" y="-.5" width="1.8" height="1"/><rect class="jg-chip c1" x="-.6" y="-.4" width="1.3" height=".9"/><rect class="jg-chip c2" x="-.7" y="-.5" width="1.5" height="1"/></g>';}
  function build(){
    if(!wide.matches){box.innerHTML="";svg=null;return;}
    seed=11;tips=[];perches=[];
    const Ht=Math.max(460,box.clientHeight||innerHeight-56),tY=118,span=Ht-tY;
    /* left edge of the trunk, bottom → top: wide flared base narrowing upwards, with gnarled bulges */
    const edge=u=>{const base=118-80*Math.pow(1-u,1.8),flare=u<.08?-28*Math.pow((.08-u)/.08,2):0;
      return base+flare+7*Math.sin(u*9+1)+4*Math.sin(u*23)+(u>.55&&u<.7?-8*Math.sin((u-.55)/.15*Math.PI):0);};
    edgeAt=y=>edge((Ht-y)/span);
    trunkR=[];for(let i=0;i<=9;i++){const u=i/9*.88;trunkR.push([edge(u)+18,Ht-span*u-8]);}
    const L=[];for(let i=0;i<=60;i++){const u=i/60;L.push([edge(u),Ht-span*u]);}
    const trunkD=smooth(L)+" L 200 "+f(tY-12)+" L 200 "+(Ht+4)+" L "+f(L[0][0])+" "+(Ht+4)+" Z";
    const hy=Ht-150,hx0=72,hx1=146;
    let s='<svg viewBox="0 0 190 '+Ht+'" width="190" height="'+Ht+'"><defs>'+
      '<linearGradient id="jgBark" x1="0" x2="1"><stop offset="0" class="jb0"/><stop offset=".35" class="jb1"/><stop offset=".7" class="jb3"/><stop offset="1" class="jb2"/></linearGradient>'+
      '<linearGradient id="jgShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".25" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>'+
      '<radialGradient id="jgHole" cx=".5" cy=".7" r=".7"><stop offset="0" stop-color="#050302"/><stop offset=".7" stop-color="#140c07"/><stop offset="1" stop-color="#2b1b10"/></radialGradient>'+
      '<radialGradient id="jgMoss"><stop offset="0" class="jm0"/><stop offset="1" class="jm1"/></radialGradient>'+
      '<filter id="jgBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>'+
      /* bark texture: stretched noise makes long vertical furrows (dark) and plates (light) */
      '<filter id="jgTexD" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".32 .016" numOctaves="4" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 .05 0 0 0 0 .03 0 0 0 0 .02 3.4 0 0 0 -1.75"/></filter>'+
      '<filter id="jgTexL" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".5 .03" numOctaves="3" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 .93 0 0 0 0 .88 0 0 0 0 .78 -3 0 0 0 1.38"/></filter>'+
      '<linearGradient id="jgHoleIn" x1="0" x2="1"><stop offset=".3" stop-color="#050302" stop-opacity="0"/><stop offset="1" stop-color="#050302" stop-opacity=".92"/></linearGradient>'+
      '<clipPath id="jgWpc"><ellipse rx="13" ry="18.5"/><rect x="-60" y="-60" width="58" height="120"/></clipPath>'+
      '<clipPath id="jgClip"><path d="'+trunkD+'"/></clipPath></defs>';
    /* leafy limbs behind the trunk, reaching left from its upper part */
    let limbs="";
    [[.5,-1.05,58,5,4],[.62,-.85,50,4.4,4],[.74,-1.2,46,4,3],[.86,-.95,40,3.6,3],[.38,-1.25,44,4.2,3]].forEach(([u,a,len,w,d])=>{
      const y=Ht-span*u,x=edge(u)+6;limbs+=branch(x,y,a,len,w,d,true);});
    s+=limbs;
    /* trunk body, shading and texture (all clipped to the trunk) */
    s+='<path class="jg-trunk" d="'+trunkD+'"/><g clip-path="url(#jgClip)">';
    for(let i=0;i<34;i++){const x=rr(6,200),y0=rr(tY,Ht),len=rr(60,240),w=rr(.8,2.6),b=rr(-8,8);
      s+='<path class="jg-fis" style="stroke-width:'+f(w)+'" d="M'+f(x)+' '+f(y0)+' c '+f(b)+' '+f(-len*.3)+', '+f(-b)+' '+f(-len*.7)+', '+f(b*.5)+' '+f(-len)+'"/>'+
        '<path class="jg-rid" d="M'+f(x+w+1.2)+' '+f(y0-4)+' c '+f(b)+' '+f(-len*.3)+', '+f(-b)+' '+f(-len*.6)+', '+f(b*.5)+' '+f(-len*.85)+'"/>';}
    for(const [u,x,rx,ry] of [[.66,40,30,46],[.42,58,24,36],[.2,30,26,40],[.85,120,30,26],[.55,150,18,30]])s+='<ellipse cx="'+x+'" cy="'+f(Ht-span*u)+'" rx="'+rx+'" ry="'+ry+'" fill="url(#jgMoss)"/>';
    s+='<g class="jg-sun" filter="url(#jgBlur)">';for(let i=0;i<7;i++)s+='<ellipse cx="'+f(rr(60,190))+'" cy="'+f(rr(tY+40,Ht-60))+'" rx="'+f(rr(10,22))+'" ry="'+f(rr(16,40))+'" style="animation-delay:'+f(-rr(0,9))+'s"/>';s+="</g>";
    const tex='x="0" y="'+(tY-20)+'" width="200" height="'+(span+30)+'"';
    s+='<rect '+tex+' filter="url(#jgTexD)"/><rect class="jg-texl" '+tex+' filter="url(#jgTexL)"/>';
    /* roundness: a soft shadow follows the trunk's left edge, a faint highlight runs just inside it */
    const ed=smooth(L);
    s+='<path d="'+ed+'" stroke="#000" stroke-opacity=".5" stroke-width="30" fill="none" filter="url(#jgBlur)"/>'+
      '<path d="'+ed+'" transform="translate(34 0)" stroke="#fff" stroke-opacity=".08" stroke-width="22" fill="none" filter="url(#jgBlur)"/>';
    s+='<rect '+tex+' fill="url(#jgShade)"/></g>';
    /* knot hole higher up, with a great spotted woodpecker living in it */
    const ky=Ht-span*.6,kx=edge(.6)+54;
    s+='<g transform="translate('+f(kx)+' '+f(ky)+') scale(1.25)"><ellipse rx="17" ry="23" class="jg-rim"/><ellipse cx="-1" cy="-1" rx="15" ry="21" fill="none" stroke="var(--jfis)" stroke-width="2"/>'+
      '<ellipse rx="13" ry="18.5" fill="url(#jgHole)"/><g clip-path="url(#jgWpc)">'+woodpecker()+'<ellipse rx="13" ry="18.5" fill="url(#jgHoleIn)"/></g>'+
      '<path d="M-13 6 C-12 13 -7 18 0 18.5" stroke="var(--jwd)" stroke-width="1.6" fill="none" opacity=".55"/></g>';
    /* small side hollow */
    const sx=edge(.22)+22,sy=Ht-span*.22;s+='<path d="M'+f(sx)+' '+f(sy+34)+' Q'+f(sx-8)+' '+f(sy)+' '+f(sx+4)+' '+f(sy-32)+' Q'+f(sx+16)+' '+f(sy)+' '+f(sx+12)+' '+f(sy+34)+'Z" fill="url(#jgHole)"/>';
    /* the big hollow at the base, with exposed orange wood along its left rim */
    const H0='M'+hx0+' '+(Ht+2)+' C '+(hx0-2)+' '+(Ht-50)+', '+(hx0+2)+' '+(hy+30)+', '+(hx0+18)+' '+(hy+6)+' C '+(hx0+30)+' '+(hy-12)+', '+(hx1-24)+' '+(hy-6)+', '+(hx1-12)+' '+(hy+22)+' C '+(hx1-2)+' '+(hy+50)+', '+(hx1+2)+' '+(Ht-40)+', '+hx1+' '+(Ht+2)+' Z';
    s+='<path d="'+H0+'" class="jg-rim" transform="translate(-3 -4) scale(1.0)"/><path d="'+H0+'" fill="url(#jgHole)"/>'+
      '<path class="jg-wd" d="M'+(hx0+1)+' '+(Ht-6)+' C '+(hx0-1)+' '+(Ht-50)+', '+(hx0+3)+' '+(hy+30)+', '+(hx0+18)+' '+(hy+7)+'"/>';
    /* top crown behind the mascot's branch */
    s+=clump(edge(1)+46,tY-6,24)+clump(edge(1)+10,tY+14,20)+clump(176,tY-14,22);
    s+=branch(edge(1)+20,tY+40,-.6,36,4,3,true)+branch(edge(1)+40,tY+24,-.1,24,3.4,2,true)+branch(edge(1)+8,tY+70,-1.15,44,3.8,4,true);
    /* ground: earth and grass */
    s+='<rect x="0" y="'+(Ht-5)+'" width="190" height="6" class="jg-earth"/>';
    for(let i=0;i<16;i++){const x=rr(0,190);if(x>hx0-4&&x<hx1+4)continue;s+='<path class="jg-grass" style="animation-delay:'+f(-rr(0,4))+'s;transform-origin:'+f(x)+'px '+Ht+'px" d="M'+f(x)+' '+Ht+' q -2 -7 -5 -11 M'+f(x)+' '+Ht+' q 1 -9 2 -14 M'+f(x)+' '+Ht+' q 3 -6 7 -8"/>';}
    box.innerHTML=s+"</svg>";svg=$("svg",box);layerize(box);mode();spawn(TB);}
  function mode(){const n=isNight();box.classList.toggle("night",n);boxL.classList.toggle("night",n);if(WILD.night!==n){WILD.night=n;TR.forEach(spawn);}}
  /* motion v9: everything that moves is lifted out of the big tree SVG into its own small SVG layer (a swaying limb, the woodpecker's
     hollow, the sun dapple). The browser paints each layer once and the compositor only rotates / fades it, so the bark textures and
     thousands of leaves are never repainted per frame. Ancestor groups (clips, transforms) are copied as empty shells around the part. */
  const NS="http://www.w3.org/2000/svg";
  function layerize(host){const base=$("svg",host);if(!base)return;
    /* phase 1: pick the parts and read all their rectangles at once (a single layout instead of one per layer) */
    const jobs=[];
    $$(".jg-b",base).filter(g=>!g.parentNode.closest(".jg-b")).forEach(g=>{const o=(g.style.transformOrigin||"").match(/-?\d+(?:\.\d+)?/g);
      jobs.push({el:g,cls:"jg-b",origin:o&&o.length>1?[+o[0],+o[1]]:null,dur:g.style.animationDuration,del:g.style.animationDelay});});
    $$(".jg-wp",base).forEach(wp=>{let top=wp;while(top.parentNode&&top.parentNode!==base)top=top.parentNode;jobs.push({el:top,cls:"jg-wpL"});});
    $$(".jg-sun",base).forEach(g=>jobs.push({el:g,cls:"jg-sunL"}));
    const hr=host.getBoundingClientRect(),br=base.getBoundingClientRect(),bx=br.left-hr.left,by=br.top-hr.top;
    jobs.forEach(j=>j.r=j.el.getBoundingClientRect());
    /* phase 2: write */
    const frag=document.createDocumentFragment();
    for(const j of jobs){const r=j.r,el=j.el;if(!r.width&&!r.height)continue;const m=34,x0=r.left-br.left-m,y0=r.top-br.top-m,w=r.width+2*m,h=r.height+2*m;
      const L=document.createElementNS(NS,"svg");L.setAttribute("viewBox",[x0,y0,w,h].map(v=>v.toFixed(1)).join(" "));L.setAttribute("width",w.toFixed(1));L.setAttribute("height",h.toFixed(1));
      L.setAttribute("class","jg-layer "+j.cls);L.style.cssText="left:"+(bx+x0).toFixed(1)+"px;top:"+(by+y0).toFixed(1)+"px;right:auto;bottom:auto";
      if(j.origin)L.style.transformOrigin=(j.origin[0]-x0).toFixed(1)+"px "+(j.origin[1]-y0).toFixed(1)+"px";
      if(j.cls==="jg-b"){L.style.animationDuration=j.dur;L.style.animationDelay=j.del;el.classList.remove("jg-b");el.removeAttribute("style");$$(".jg-b",el).forEach(x=>{x.classList.remove("jg-b");x.removeAttribute("style");});}
      const chain=[];for(let a=el.parentNode;a&&a!==base;a=a.parentNode)chain.unshift(a);
      let p=L;for(const a of chain){const sh=a.cloneNode(false);p.appendChild(sh);p=sh;}p.appendChild(el);frag.appendChild(L);}
    host.appendChild(frag);}
  /* the second tree, bottom left (≥1500px, right of the sidebar, behind the content): a natural broadleaf tree with a leaning, tapered
     trunk (root flare, bark texture, edge shadow) that forks into limbs carrying shaded leaf clumps under a full crown. Same seeded
     helpers as the big tree; its limb points (TREE.perchesL) are where the bird hides when the fire rider shoots at it. */
  const boxL=document.createElement("div");boxL.id="jungleL";boxL.setAttribute("aria-hidden","true");document.body.appendChild(boxL);
  const wideL=matchMedia("(min-width:1500px)");let svgL=null,perchL=[];
  function buildL(){
    if(!wideL.matches){boxL.innerHTML="";svgL=null;perchL=[];return;}
    const t0=tips,p0=perches;tips=[];perches=[];seed=29;
    const Ht=Math.max(380,boxL.clientHeight||innerHeight*.8),fy=Ht*.52,cx=96;
    const half=u=>12-4.5*u+(u<.1?15*Math.pow((.1-u)/.1,2):0),lean=u=>7*Math.sin(u*2.4);
    const Lp=[],Rp=[];for(let i=0;i<=24;i++){const u=i/24,y=Ht+2-(Ht+2-fy)*u;Lp.push([cx+lean(u)-half(u),y]);Rp.push([cx+lean(u)+half(u),y]);}
    const trunk=smooth(Lp)+" L"+smooth(Rp.reverse()).slice(1)+"Z",fx=cx+lean(1);
    let s='<svg viewBox="0 0 200 '+Ht+'" width="200" height="'+Ht+'"><defs>'+
      '<linearGradient id="jgBarkL" x1="0" x2="1"><stop offset="0" class="jb0"/><stop offset=".35" class="jb1"/><stop offset=".7" class="jb3"/><stop offset="1" class="jb2"/></linearGradient>'+
      '<filter id="jgTexDL" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".5 .03" numOctaves="4" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 .05 0 0 0 0 .03 0 0 0 0 .02 3.4 0 0 0 -1.75"/></filter>'+
      '<filter id="jgBlurL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>'+
      '<clipPath id="jgClipL"><path d="'+trunk+'"/></clipPath></defs>';
    /* back of the crown, then the trunk, then limbs with their clumps in front */
    for(let i=0;i<9;i++)s+=clump(fx+rr(-60,60),fy-Ht*rr(.2,.4),rr(20,30));
    s+='<path d="'+trunk+'" fill="url(#jgBarkL)"/><g clip-path="url(#jgClipL)"><rect x="0" y="'+f(fy-10)+'" width="200" height="'+f(Ht-fy+14)+'" filter="url(#jgTexDL)"/>'+
      '<path d="'+smooth(Lp)+'" stroke="#000" stroke-opacity=".45" stroke-width="12" fill="none" filter="url(#jgBlurL)"/></g>';
    s+=branch(fx-3,fy+4,-.8,Ht*.17,6.5,4,false)+branch(fx,fy,-.12,Ht*.2,7,4,false)+branch(fx+3,fy+4,.62,Ht*.17,6.5,4,false)+
      branch(fx-5,fy+Ht*.09,-1.2,Ht*.12,4.6,3,true)+branch(fx+5,fy+Ht*.11,1.15,Ht*.11,4.4,3,true);
    s+=clump(fx-30,fy-Ht*.36,22)+clump(fx+30,fy-Ht*.37,22)+clump(fx,fy-Ht*.43,24);
    s+='<rect x="0" y="'+(Ht-4)+'" width="200" height="6" class="jg-earth"/>';
    for(let i=0;i<14;i++){const x=rr(10,190);s+='<path class="jg-grass" style="animation-delay:'+f(-rr(0,4))+'s;transform-origin:'+f(x)+'px '+Ht+'px" d="M'+f(x)+' '+Ht+' q -2 -7 -5 -11 M'+f(x)+' '+Ht+' q 1 -9 2 -14 M'+f(x)+' '+Ht+' q 3 -6 7 -8"/>';}
    boxL.innerHTML=s+"</svg>";svgL=$("svg",boxL);layerize(boxL);perchL=perches.filter(([x,y])=>y>40);tipL=tips.slice();
    trunkL=[];for(let i=0;i<=6;i++){const u=i/6*.95;trunkL.push([cx+lean(u),Ht-(Ht-fy)*u-6]);}tips=t0;perches=p0;mode();spawn(TL);}
  let rtL=0,lastHL=-1;new ResizeObserver(()=>{const hh=boxL.clientHeight;if(lastHL<0){lastHL=hh;return;}if(hh===lastHL)return;lastHL=hh;clearTimeout(rtL);rtL=setTimeout(buildL,120);}).observe(boxL);
  wideL.addEventListener("change",buildL);
  /* a leaf drifts down from a twig now and then */
  setInterval(()=>{if(!svg||document.hidden||reduce.matches||!tips.length)return;const [x,y]=tips[Math.floor(Math.random()*tips.length)];
    const hr=box.getBoundingClientRect(),br=svg.getBoundingClientRect(),l=document.createElementNS(NS,"svg");
    l.setAttribute("viewBox","0 -4 10 8");l.setAttribute("width","10");l.setAttribute("height","8");l.setAttribute("class","jg-layer jg-flL");
    l.style.cssText="left:"+f(br.left-hr.left+x)+"px;top:"+f(br.top-hr.top+y-4)+"px;right:auto;bottom:auto";
    l.innerHTML='<path class="jl'+(1+Math.floor(Math.random()*2))+'" d="M0 0 Q4.5 -3.2 10 0 Q4.5 3.2 0 0Z"/>';box.appendChild(l);setTimeout(()=>l.remove(),7000);},5200);
  let rt=0,lastH=-1;new ResizeObserver(()=>{const hh=box.clientHeight;if(lastH<0){lastH=hh;return;}if(hh===lastH)return;lastH=hh;clearTimeout(rt);rt=setTimeout(build,120);}).observe(box);
  wide.addEventListener("change",build);document.addEventListener("themechange",mode);setInterval(mode,60000);
  /* tree wildlife (2026-10-21): small songbirds by day (house sparrow, great tit, blue tit, chaffinch) and bats by night sit on the
     limbs of both trees. Each animal is a tiny SVG in a zero-size <div> on top of the tree's layers (.cr-host): hops, turns, flights
     and the bats' hanging sway are transforms on HTML elements, so only the compositor works; a peck, preen, tail flick or wing
     stretch repaints just that small SVG. One 800 ms tick picks idle actions (skipped while the tab is hidden, under reduced motion or
     with the background animation off). Birds fly a bounding arc to a free limb, bats drop and flutter an erratic loop, then hang. */
  const SPC=[
    {n:"sparrow",back:"#8b5d38",wing:"#6a4226",bar:"#e6d6b8",belly:"#d4c9b7",cheek:"#dcd6ca",cap:"#7f858a",bib:"#1d1a19",tail:"#56391f",bill:"#2a2521",leg:"#a47e5e",
      hx:'<path fill="#7a4a28" d="M-6.6 -17.4 C-3.6 -18.2 -2.2 -15.6 -2.6 -12.6 C-3.6 -14.2 -5 -15.6 -6.6 -15.6Z"/>'},
    {n:"great tit",back:"#7d8b3d",wing:"#56687b",bar:"#eef3f6",belly:"#f1d336",cheek:"#f7f7f4",cap:"#151515",bib:"#151515",tail:"#4b5a6a",bill:"#151515",leg:"#6b7480",
      x:'<path fill="#151515" d="M-6.6 -9.8 C-5.8 -7 -4.6 -4.4 -2.8 -1.8 L-1.2 -2 C-2.6 -4.6 -3.6 -7.2 -4.2 -10Z"/>'},
    {n:"blue tit",k:.88,back:"#8fae4c",wing:"#3f80cf",bar:"#f2f7ff",belly:"#f2da45",cheek:"#fbfbfa",cap:"#3a7fdc",bib:"#1e2c4a",tail:"#3a70bd",bill:"#222",leg:"#6f7b8f",
      hx:'<path fill="#1e2c4a" d="M-12 -15.9 L-3.2 -15.3 L-3.2 -14 L-11.6 -14.7Z M-3.2 -15.3 C-2.6 -13 -3 -11.4 -4.4 -10.4 L-4.6 -12Z"/>'},
    {n:"chaffinch",back:"#86613f",wing:"#26221f",bar:"#f3efe6",belly:"#d98d6b",cheek:"#d98d6b",cap:"#6f8299",bib:"#d98d6b",tail:"#2c2825",bill:"#a4abb3",leg:"#8a7466"}];
  /* a part that rotates about (x,y): the CSS animation turns the middle group, the outer/inner groups move the pivot to the origin */
  const piv=(c,x,y,inner)=>'<g transform="translate('+x+' '+y+')"><g class="'+c+'"><g transform="translate('+(-x)+' '+(-y)+')">'+inner+'</g></g></g>';
  const BODY="M-7.4 -12 C-9.4 -7 -6.4 -1.8 0 -1.4 C5.2 -1.4 9 -4.6 8.2 -8.8 C7.4 -12.8 2.6 -15 -1.6 -15 C-4.8 -15 -6.6 -14 -7.4 -12Z";
  /* songbird facing left, feet at (0,0); folded wing at rest, two spread wings (beating) in flight */
  function birdSvg(c){const k=c.k||1,
      wing=(cls,dark)=>piv(cls,-1,-11,'<path fill="'+c.wing+'" d="M-1 -11 C1 -19 8 -24.5 15.5 -24 C13 -21.5 13.5 -20 11.5 -18.4 C11 -16.6 9 -15.4 7.5 -14 C5.5 -12 3 -10.4 1.6 -9.4Z"/>'+
        '<path d="M1 -12 C4 -17 9 -21 14 -22.6 M2.6 -11 C5.6 -14.6 8.6 -17 12 -18.6" stroke="'+c.bar+'" stroke-width=".6" fill="none" opacity=".7"/>'+
        (dark?'<path fill="#000" opacity=".3" d="M-1 -11 C1 -19 8 -24.5 15.5 -24 C13 -21.5 13.5 -20 11.5 -18.4 C11 -16.6 9 -15.4 7.5 -14 C5.5 -12 3 -10.4 1.6 -9.4Z"/>':""));
    return '<svg class="cr-s" viewBox="0 0 40 32" width="'+f(40*k)+'" height="'+f(32*k)+'" style="left:'+f(-20*k)+'px;top:'+f(-26*k)+'px"><g transform="translate(20 26)">'+
      '<g class="cr-wo">'+wing("cr-wn cr-wb",1)+'</g>'+
      piv("cr-tail",5,-7,'<path fill="'+c.tail+'" d="M4.6 -8.8 L18.6 -3.6 C19.4 -3 19.4 -1.8 18.4 -1.4 L4.4 -4.4Z"/><path d="M6 -6.6 L17.8 -2.6" stroke="#000" stroke-opacity=".25" stroke-width=".5"/>')+
      '<path class="cr-leg" d="M-1.2 -2.2 L-1.8 0 M1.4 -2.2 L1.6 0 M-3.8 .1 L1 .1 M-.6 .1 L3.6 .1" stroke="'+c.leg+'" stroke-width=".75" stroke-linecap="round" fill="none"/>'+
      '<path fill="'+c.back+'" d="'+BODY+'"/><path fill="'+c.belly+'" d="M-7.3 -11.2 C-8.4 -6.2 -5.2 -1.9 0 -1.5 C3.4 -1.5 5.8 -3 6.4 -5.2 C2.4 -6.4 -3 -8.2 -7.3 -11.2Z"/>'+(c.x||"")+
      '<path fill="url(#crVol)" d="'+BODY+'"/>'+
      '<g class="cr-wf"><path fill="'+c.wing+'" d="M-3.6 -12.8 C1 -14.6 7.6 -12.4 11.8 -6.4 C7.6 -5.6 1.4 -6.6 -2.2 -9Z"/>'+
        '<path d="M-.4 -11.8 C3 -11.6 6.2 -9.9 8.8 -7.3 M1 -9.9 C3.8 -9.5 6.4 -8.2 8.9 -6.5" stroke="'+c.bar+'" stroke-width=".65" fill="none"/>'+
        '<path d="M2 -12.6 C4.6 -12 7 -10.6 9.4 -8.4" stroke="#000" stroke-opacity=".28" stroke-width=".5" fill="none"/></g>'+
      piv("cr-head",-4.4,-11.6,'<circle cx="-7.2" cy="-14.8" r="4.8" fill="'+c.cheek+'"/>'+
        '<path fill="'+c.cap+'" d="M-11.8 -15.4 C-11.4 -20.6 -3.2 -21.2 -2.6 -15.4 C-5 -17 -9.2 -17 -11.8 -15.4Z"/>'+(c.hx||"")+
        '<path fill="'+c.bib+'" d="M-10.8 -12.6 C-9.4 -10 -7 -8.8 -4.4 -9.2 L-4.8 -12 C-6.8 -12.4 -8.8 -12.6 -10.8 -12.6Z"/>'+
        '<circle cx="-8.8" cy="-15.6" r="1.05" fill="#0b0705"/><circle cx="-9.1" cy="-15.95" r=".35" fill="#fff"/>'+
        '<path fill="'+c.bill+'" d="M-11.6 -15.4 L-15.2 -14.3 L-11.4 -13.2Z"/><path d="M-11.6 -14.3 L-14.6 -14.3" stroke="#000" stroke-opacity=".35" stroke-width=".35"/>'+
        '<circle cx="-7.2" cy="-14.8" r="4.8" fill="url(#crVol)" opacity=".7"/>')+
      '<g class="cr-wo">'+wing("cr-wn",0)+'</g></g></svg>';}
  /* bat hanging head-down from the limb's underside (feet at (0,0)): wings wrapped round the body, ears pointing down, eye shine, a moonlit
     rim; one wing unfolds for a stretch. In flight the second group shows it the right way up with both wings beating. */
  function batSvg(){const M="#2b2024",F="#5b4134",H="#4a362c",B="#6b5550",
      wingF=s=>'<g transform="scale('+s+' 1)">'+piv("cr-bw",-2,8,'<path fill="'+M+'" d="M-2 7 C-6 2.6 -12 1.6 -17 3.6 L-15.4 7.8 L-12.6 6.6 L-11.4 11.2 L-7.8 9.4 L-5 13 C-4 11 -3 9.6 -2 10Z"/>'+
        '<path d="M-2.6 7.4 L-16.4 4 M-4 8.4 L-12.4 7 M-4 9.4 L-11.2 10.8 M-3.6 10.4 L-7.6 9.8" stroke="'+B+'" stroke-width=".45" fill="none"/>')+'</g>';
    return '<svg class="cr-s" viewBox="0 0 40 34" width="40" height="34"><g transform="translate(20 4)"><g class="cr-hang">'+
      '<path d="M-1.6 0 C-1.8 1.2 -1.4 2.4 -1 3.4 M1.6 0 C1.8 1.2 1.4 2.4 1 3.4" stroke="#1a1214" stroke-width=".8" fill="none" stroke-linecap="round"/>'+
      piv("cr-ws",-4,6,'<path fill="'+M+'" d="M-4 5 L-15 3 L-13.6 8 L-10.4 7 L-11 12.6 L-7.4 10.6 L-5.2 15Z"/><path d="M-4 5.6 L-14.6 3.4 M-4.4 7.4 L-10.6 7.2 M-4.6 9.4 L-10.6 12.2" stroke="'+B+'" stroke-width=".45" fill="none"/>')+
      '<path fill="'+M+'" d="M-5 3 C-7.2 8 -6.8 14.6 -3.2 18.8 C-1.2 20.4 1.2 20.4 3.2 18.8 C6.8 14.6 7.2 8 5 3 C2 1.6 -2 1.6 -5 3Z"/>'+
      '<path fill="'+F+'" d="M-2.2 5.6 C-3 9.6 -2.2 13.8 0 15.6 C2.2 13.8 3 9.6 2.2 5.6 C.8 5 -.8 5 -2.2 5.6Z"/>'+
      '<path d="M-4.6 4.6 C-5.4 9.6 -4.4 14.6 -2 18 M4.6 4.6 C5.4 9.6 4.4 14.6 2 18" stroke="'+B+'" stroke-width=".5" fill="none"/>'+
      '<path class="cr-rim" d="M-5 3 C-7.2 8 -6.8 14.6 -3.2 18.8"/>'+
      piv("cr-head",0,17,'<path fill="'+H+'" d="M-2.6 21.6 L-3.8 26.4 L-.9 23Z M2.6 21.6 L3.8 26.4 L.9 23Z"/><ellipse cx="0" cy="20.4" rx="3.1" ry="2.9" fill="'+H+'"/>'+
        '<ellipse cx="0" cy="18.9" rx=".9" ry=".6" fill="#22160f"/><circle class="cr-eye" cx="-1.2" cy="21.1" r=".55"/><circle class="cr-eye" cx="1.2" cy="21.1" r=".55"/>')+
      '</g><g class="cr-bf">'+wingF(1)+wingF(-1)+
      '<ellipse cx="0" cy="10" rx="2.8" ry="5.2" fill="'+M+'"/><ellipse cx="0" cy="9.4" rx="1.8" ry="3.6" fill="'+F+'"/>'+
      '<path fill="'+H+'" d="M-2.4 4.4 L-3.2 .2 L-.8 3.2Z M2.4 4.4 L3.2 .2 L.8 3.2Z"/><circle cx="0" cy="5" r="2.6" fill="'+H+'"/>'+
      '<circle class="cr-eye" cx="-1" cy="4.6" r=".5"/><circle class="cr-eye" cx="1" cy="4.6" r=".5"/></g></g></svg>';}
  { const d=document.createElementNS(NS,"svg");d.setAttribute("aria-hidden","true");d.style.cssText="position:absolute;width:0;height:0;overflow:hidden";
    d.innerHTML='<defs><radialGradient id="crVol" cx=".38" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient></defs>';
    document.body.appendChild(d);}
  /* the two trees: where their limbs are (svg coordinates), which limb points are visible, how many animals and where they may fly */
  const TB={box,nd:4,nb:3,P:()=>perches,ok:([x,y])=>y>200&&y<TB.svgH-50&&x>14&&edgeAt&&x<edgeAt(y)-8,top:176},
        TL={box:boxL,nd:2,nb:2,P:()=>perchL,ok:([x,y])=>y+TL.oy>50&&y+TL.oy<TL.h-40&&x>12&&x<188,top:30},TR=[TB,TL];
  let edgeAt=null,trunkR=[],trunkL=[],tipL=[];const WILD={list:[],night:null};
  const spot=(c,p)=>[c.T.ox+p[0],c.T.oy+p[1]+(c.bat?(p[2]||3)*1.15:-(p[2]||3)*.25)];
  function put(c,p){c.p=p;c.at=spot(c,p);c.el.style.left=f(c.at[0])+"px";c.el.style.top=f(c.at[1])+"px";}
  function spawn(T){WILD.list=WILD.list.filter(c=>{if(c.T!==T)return true;c.el.remove();return false;});
    if(T.host)T.host.remove();T.host=null;const base=$("svg",T.box);if(!base)return;
    const hr=T.box.getBoundingClientRect(),br=base.getBoundingClientRect();T.ox=br.left-hr.left;T.oy=br.top-hr.top;T.w=T.box.clientWidth;T.h=T.box.clientHeight;T.svgH=br.height;
    T.host=document.createElement("div");T.host.className="cr-host";T.box.appendChild(T.host);
    const night=isNight(),n=night?T.nb:T.nd,P=T.P().filter(T.ok).sort(()=>Math.random()-.5),pick=[];
    for(const p of P){if(pick.length>=n)break;if(pick.every(q=>Math.hypot(q[0]-p[0],q[1]-p[1])>26))pick.push(p);}
    for(const p of pick){const c={T,bat:night};c.el=document.createElement("div");c.el.className="cr "+(night?"cr-bat":"cr-bird");
      c.el.innerHTML='<div class="cr-f">'+(night?batSvg():birdSvg(SPC[Math.floor(Math.random()*SPC.length)]))+'</div>';
      if(!night&&Math.random()<.5)c.el.classList.add("r");put(c,p);T.host.appendChild(c.el);WILD.list.push(c);}}
  function act(c,k,ms){c.busy=1;c.el.classList.add(k);setTimeout(()=>{c.el.classList.remove(k);c.busy=0;},ms);}
  function hop(c){c.busy=1;if(Math.random()<.5)setTimeout(()=>c.el.classList.toggle("r"),140);
    c.el.animate([{transform:"none"},{transform:"translateY(-4px)",offset:.45},{transform:"none"}],{duration:300,easing:"ease-out"}).onfinish=()=>{c.busy=0;};}
  const free=c=>c.T.P().filter(c.T.ok).filter(p=>WILD.list.every(o=>o===c||o.T!==c.T||Math.hypot(o.p[0]-p[0],o.p[1]-p[1])>24));
  const clampX=(T,x)=>Math.max(14,Math.min(T.w-14,x)),rand=(a,b)=>a+Math.random()*(b-a);
  /* Catmull-Rom points through K, n per segment */
  const spline=(K,n)=>{const o=[];for(let i=0;i<K.length-1;i++){const p0=K[Math.max(0,i-1)],p1=K[i],p2=K[i+1],p3=K[Math.min(K.length-1,i+2)];
    for(let j=1;j<=n;j++){const t=j/n,t2=t*t,t3=t2*t;o.push([0,1].map(k=>.5*(2*p1[k]+(p2[k]-p0[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(3*p1[k]-p0[k]-3*p2[k]+p3[k])*t3)));}}return o;};
  function travel(c,pts,dur,p,ease){const [x0,y0]=c.at;c.busy=1;c.p=p;c.el.classList.add("fly");
    c.el.animate([{transform:"none"}].concat(pts.map(([x,y])=>({transform:"translate("+f(x-x0)+"px,"+f(y-y0)+"px)"}))),{duration:dur,easing:ease}).onfinish=()=>{
      if(!WILD.list.includes(c))return;put(c,p);c.el.classList.remove("fly");c.busy=0;if(!c.bat)act(c,"flick",450);};}
  function flyBird(c){const [x0,y0]=c.at,D=free(c).filter(p=>{const d=Math.hypot(c.T.ox+p[0]-x0,c.T.oy+p[1]-y0);return d>28&&d<170;});if(!D.length)return;
    const p=D[Math.floor(Math.random()*D.length)],[x1,y1]=spot(c,p),d=Math.hypot(x1-x0,y1-y0),mx=(x0+x1)/2,my=Math.min(y0,y1)-18-d*.3,pts=[];
    for(let i=1;i<=18;i++){const t=i/18,u=1-t;pts.push([clampX(c.T,u*u*x0+2*t*u*mx+t*t*x1),Math.max(c.T.top,u*u*y0+2*t*u*my+t*t*y1+Math.sin(t*Math.PI*5)*2.4*Math.sin(t*Math.PI))]);}
    c.el.classList.toggle("r",x1>x0);travel(c,pts,700+d*7,p,"ease-in-out");}
  function flyBat(c){const T=c.T,[x0,y0]=c.at,D=free(c);if(!D.length)return;const p=D[Math.floor(Math.random()*D.length)],[x1,y1]=spot(c,p),
      K=[[x0,y0],[x0+rand(-6,6),y0+16]];
    for(let i=0,n=4+Math.floor(Math.random()*3);i<n;i++)K.push([rand(24,T.w-24),rand(Math.max(T.top,40),T.h*.8)]);
    K.push([x1+rand(-10,10),y1+24],[x1,y1]);
    travel(c,spline(K,8).map(([x,y],i,a)=>i===a.length-1?[x,y]:[clampX(T,x+rand(-1.5,1.5)),y+rand(-1.5,1.5)]),3400+Math.random()*2200,p,"linear");}
  setInterval(()=>{if(document.hidden||reduce.matches||(window.THM&&THM.on===false))return;
    for(const c of WILD.list){if(c.busy)continue;const r=Math.random();
      if(c.bat){if(r<.012)flyBat(c);else if(r<.05)act(c,"stretch",2000);else if(r<.1)act(c,"look",1400);}
      else if(r<.018)flyBird(c);else if(r<.12)c.el.classList.toggle("r");else if(r<.21)act(c,"peck",800);else if(r<.25)act(c,"preen",1600);
      else if(r<.33)act(c,"flick",450);else if(r<.38)act(c,"tilt",1200);else if(r<.42)hop(c);}},800);
  /* the trees are built just after the first paint (their measuring would otherwise force extra layouts of the whole page) */
  requestAnimationFrame(()=>setTimeout(()=>{build();buildL();},0));
  /* perches for the flying mascot: points on the thicker limbs, in screen coordinates (big tree, and the left tree for hiding) */
  window.TREE={perches(){if(!svg||!wide.matches)return [];const b=box.getBoundingClientRect(),ox=b.right-190;return perches.map(([x,y])=>[ox+x,b.top+y]);},
    perchesL(){if(!svgL)return [];const b=boxL.getBoundingClientRect();return perchL.map(([x,y])=>[b.left+x,b.top+y]);},
    /* v16: where the fire rider's flames catch on each tree, as [x, y, size] in screen px: leaf clumps, every other limb, the trunk */
    fire(side){const L=side==="L";if(L?!svgL:!svg||!wide.matches)return [];const b=(L?boxL:box).getBoundingClientRect(),ox=L?b.left:b.right-190,
      P=[...(L?tipL:tips).map(([x,y])=>[x,y,12]),...(L?perchL:perches).map(([x,y])=>[x,y,8]),...(L?trunkL:trunkR).map(([x,y])=>[x,y,15])];
      /* only parts of the tree that are drawn: tips outside the tree's own box are clipped away, so no fire floats in mid-air */
      return P.filter(([x])=>x>=6&&x<=(L?194:186)).map(([x,y,s])=>[ox+x,b.top+y,s]).filter(([x,y])=>y>60&&y<innerHeight-4&&x<innerWidth+10);}};
})();

/* time of day: animated mascot (night owl 17–5, early bird 5–17) at the top right of the hero, plus a mini one in the nav */
(function(){
  /* the branch both characters sit on: a tapered limb with bark shading growing out of the tree on the right, one twig and real leaves */
  const LF=(x,y,r,k,c)=>'<g transform="translate('+x+' '+y+') rotate('+r+') scale('+k+')"><path d="M0 0 C6 -7 17 -8 24 0 C17 8 6 7 0 0Z" fill="url(#'+c+')"/><path d="M1 0 L22 0" stroke="#24411a" stroke-width=".7" opacity=".55"/></g>';
  const BR='<defs><linearGradient id="msBark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a7258"/><stop offset=".45" stop-color="#5e4a37"/><stop offset="1" stop-color="#2f241a"/></linearGradient>'+
      '<linearGradient id="msLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#86b84a"/><stop offset="1" stop-color="#3a6a1f"/></linearGradient>'+
      '<linearGradient id="msLeaf2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5e9433"/><stop offset="1" stop-color="#264a15"/></linearGradient></defs>'+
    '<path d="M64 181 C54 171 41 165 27 161 L28 159 C43 162 56 168 67 179Z" fill="url(#msBark)"/>'+
    '<path d="M2 183 C50 176 130 181 250 158 L250 184 C160 196 70 191 2 187Z" fill="url(#msBark)"/>'+
    '<path d="M8 183 C60 177 130 181 248 159" stroke="#f3e2c8" stroke-width="1" fill="none" opacity=".25"/>'+
    '<path d="M40 186 C80 184 120 187 170 179 M150 185 C180 182 210 178 248 172 M196 176 c6 -1 10 -1 14 1" stroke="#1e1610" stroke-width=".8" fill="none" opacity=".35"/>'+
    '<ellipse cx="176" cy="177" rx="3.4" ry="2.4" fill="#2a1f16" opacity=".6"/>'+
    LF(27,160,196,.8,"msLeaf")+LF(28,160,232,.7,"msLeaf2")+LF(46,170,250,.6,"msLeaf")+
    LF(198,168,-38,.85,"msLeaf2")+LF(214,165,-8,.75,"msLeaf")+LF(228,162,-62,.7,"msLeaf2")+LF(150,183,104,.7,"msLeaf2");
  /* weather cloud: hides the sun/moon when the weather (WX) is cloudy, rainy, stormy, snowy or foggy */
  const WXC='<g class="ms-wxc"><path d="M146 80 a15 15 0 0 1 12 -22 a22 22 0 0 1 40 -10 a17 17 0 0 1 30 14 a12 12 0 0 1 -2 24 h-72 a11 11 0 0 1 -8 -6z"/><path class="ms-wxc2" d="M120 66 a10 10 0 0 1 9 -14 a14 14 0 0 1 26 -5 a11 11 0 0 1 8 18 h-38 a7 7 0 0 1 -5 1z"/></g>';
  const OWL='<svg viewBox="0 0 240 220" role="img" aria-label="An animated night owl on a branch under the moon">'+
    '<defs><radialGradient id="msMoon"><stop offset="0" stop-color="#fffbe6"/><stop offset="1" stop-color="#fde68a"/></radialGradient><radialGradient id="msHalo"><stop offset="0" stop-color="#fde68a" stop-opacity=".5"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient></defs>'+
    '<circle class="o-halo" cx="184" cy="50" r="50" fill="url(#msHalo)"/><circle class="b-sun" cx="184" cy="50" r="26" fill="url(#msMoon)"/><circle cx="176" cy="44" r="4" fill="#f2cf6b" opacity=".55"/><circle cx="192" cy="58" r="3" fill="#f2cf6b" opacity=".45"/><circle cx="188" cy="38" r="2" fill="#f2cf6b" opacity=".4"/>'+
    WXC+
    '<g fill="#fff"><circle class="o-st" cx="34" cy="26" r="1.9"/><circle class="o-st" cx="70" cy="14" r="1.4"/><circle class="o-st" cx="120" cy="30" r="1.7"/><circle class="o-st" cx="226" cy="104" r="1.5"/><circle class="o-st" cx="20" cy="76" r="1.3"/><circle class="o-st" cx="140" cy="8" r="1.2"/></g>'+
    '<path class="o-shoot" d="M110 18 l-26 14" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>'+
    '<g fill="#fde047"><circle class="o-ff f1" cx="30" cy="140" r="2.4"/><circle class="o-ff f2" cx="196" cy="128" r="2"/><circle class="o-ff f3" cx="214" cy="186" r="2.2"/></g>'+
    BR+
    '<g class="o-body"><path class="o-wl" d="M74 112 C 54 130, 56 162, 80 172 C 82 152, 84 130, 74 112z" fill="#6f4a2f"/><path class="o-wr" d="M146 112 C 166 130, 164 162, 140 172 C 138 152, 136 130, 146 112z" fill="#6f4a2f"/>'+
      '<ellipse cx="110" cy="132" rx="40" ry="44" fill="#8b5e3c"/><ellipse cx="110" cy="146" rx="26" ry="28" fill="#ead2ad"/>'+
      '<path d="M99 134 l4 4 l4 -4 M113 134 l4 4 l4 -4 M106 145 l4 4 l4 -4 M99 156 l4 4 l4 -4 M113 156 l4 4 l4 -4" stroke="#b08458" stroke-width="1.7" fill="none" stroke-linecap="round"/>'+
      '<g class="o-head"><path d="M72 98 L74 60 L92 80 Q110 74 128 80 L146 60 L148 98 Q150 126 110 126 Q70 126 72 98z" fill="#8b5e3c"/>'+
        '<circle cx="95" cy="99" r="17" fill="#d9b48f"/><circle cx="125" cy="99" r="17" fill="#d9b48f"/>'+
        '<circle cx="95" cy="99" r="12" fill="#fbbf24"/><circle cx="125" cy="99" r="12" fill="#fbbf24"/>'+
        '<g class="o-pup"><circle cx="95" cy="100" r="6.8" fill="#1c1003"/><circle cx="125" cy="100" r="6.8" fill="#1c1003"/><circle cx="97.5" cy="97" r="2.1" fill="#fff"/><circle cx="127.5" cy="97" r="2.1" fill="#fff"/></g>'+
        '<ellipse class="o-lid" cx="95" cy="99" rx="13" ry="13" fill="#8b5e3c"/><ellipse class="o-lid" cx="125" cy="99" rx="13" ry="13" fill="#8b5e3c"/>'+
        '<path d="M104 110 L116 110 L110 123z" fill="#f59e0b"/></g>'+
      '<path d="M98 173 v7 M104 174 v7 M116 174 v7 M122 173 v7" stroke="#f59e0b" stroke-width="3.2" stroke-linecap="round"/></g>'+
    '<g class="ms-bub"><path d="M150 84 h74 a10 10 0 0 1 10 10 v16 a10 10 0 0 1 -10 10 h-58 l-10 9 l1 -9 h-7 a10 10 0 0 1 -10 -10 v-16 a10 10 0 0 1 10 -10z" fill="#fff"/><text x="189" y="107" text-anchor="middle" font-family="Inter,sans-serif" font-weight="700" font-size="14" fill="#1e1b4b">Hoo hoo!</text></g></svg>';
  const BIRD='<svg viewBox="0 0 240 220" role="img" aria-label="An animated early bird singing on a branch at sunrise">'+
    '<defs><radialGradient id="msSun"><stop offset="0" stop-color="#fde68a" stop-opacity=".7"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient></defs>'+
    '<circle class="b-halo" cx="182" cy="58" r="54" fill="url(#msSun)"/>'+
    '<g class="b-rays" stroke="#fbbf24" stroke-width="3.2" stroke-linecap="round"><path d="M182 22v-9M182 94v9M146 58h-9M218 58h9M156.5 32.5l-6.4-6.4M207.5 83.5l6.4 6.4M156.5 83.5l-6.4 6.4M207.5 32.5l6.4-6.4"/></g>'+
    '<circle class="b-sun" cx="182" cy="58" r="25" fill="#fcd34d"/><circle class="b-sun" cx="182" cy="58" r="25" fill="none" stroke="#f59e0b" stroke-width="1.5" opacity=".5"/>'+
    WXC+
    '<g class="b-cl1"><path d="M22 52 a10 10 0 0 1 12 -10 a14 14 0 0 1 26 4 a9 9 0 0 1 2 18 h-36 a8 8 0 0 1 -4 -12z" fill="#fff" opacity=".95"/></g>'+
    '<g class="b-cl2"><path d="M120 22 a7 7 0 0 1 9 -7 a10 10 0 0 1 18 3 a6 6 0 0 1 1 12 h-24 a6 6 0 0 1 -4 -8z" fill="#fff" opacity=".85"/></g>'+
    '<g class="b-fly"><path class="b-flap" d="M0 6 q6 -7 12 0 q6 -7 12 0" stroke="#334155" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>'+
    BR+
    /* a songbird drawn to real proportions: one smooth body outline (head, neck, back, rump, belly, breast), a folded wing hinged at
       the shoulder, layered tail feathers, thin bill and legs. The gradients use one shared user space so head and body meet without a
       seam. Its plumage comes from PLUM (robin, bluebird, cardinal, goldfinch, kingfisher): plumage() writes the colours into these
       gradients and the .b-belly/.b-edge/.b-lid/.b-bill parts. Colour patches are clipped to the outline, so nothing spills past it. */
    '<defs><linearGradient id="msRB" gradientUnits="userSpaceOnUse" x1="0" y1="90" x2="0" y2="176"><stop offset="0"/><stop offset="1"/></linearGradient>'+
      '<radialGradient id="msRO" gradientUnits="userSpaceOnUse" cx="140" cy="124" r="46"><stop offset="0"/><stop offset=".7"/><stop offset="1"/></radialGradient>'+
      '<radialGradient id="msRF" gradientUnits="userSpaceOnUse" cx="140" cy="110" r="18"><stop offset="0"/><stop offset=".7"/><stop offset="1"/></radialGradient>'+
      '<linearGradient id="msRW" gradientUnits="userSpaceOnUse" x1="116" y1="112" x2="66" y2="154"><stop offset="0"/><stop offset="1"/></linearGradient>'+
      '<linearGradient id="msRT" gradientUnits="userSpaceOnUse" x1="84" y1="150" x2="42" y2="178"><stop offset="0"/><stop offset="1"/></linearGradient>'+
      '<radialGradient id="msRS" gradientUnits="userSpaceOnUse" cx="122" cy="98" r="80"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient>'+
      '<clipPath id="msCB"><path d="M118 100 C108 110 88 120 78 134 C72 143 72 154 80 162 C90 171 108 174 122 168 C136 161 144 146 144 132 C144 124 144 120 142 116 C134 108 126 102 118 100Z"/></clipPath>'+
      '<clipPath id="msCH"><path d="M148 106 C146 97 139 92 130 92 C121 92 115 97 113 104 C111 112 114 120 120 124 C128 128 140 124 146 118 L149.5 112.5Z"/></clipPath></defs>'+
    '<g class="b-bird">'+
      /* tail: two layered feathers, the lower one darker */
      '<path d="M82 152 L46 174 L44 179 L52 178 L88 158Z" fill="url(#msRT)" opacity=".8"/>'+
      '<path d="M80 148 L42 168 L40 174 L48 174 L86 154Z" fill="url(#msRT)"/><path d="M44 171 L83 151" stroke="#fff" stroke-width=".6" opacity=".25"/>'+
      /* body, colour patches and shading (clipped to the outline) */
      '<path d="M118 100 C108 110 88 120 78 134 C72 143 72 154 80 162 C90 171 108 174 122 168 C136 161 144 146 144 132 C144 124 144 120 142 116 C134 108 126 102 118 100Z" fill="url(#msRB)"/>'+
      '<g clip-path="url(#msCB)"><ellipse class="b-belly" cx="112" cy="168" rx="26" ry="12"/>'+
        '<path d="M144 110 C133 109 127 116 125 126 C122 140 117 152 119 166 L126 172 C140 162 148 146 147 128Z" fill="url(#msRO)"/>'+
        '<path class="b-edge" d="M127 116 C124 128 121 142 118 154 C117 160 118 165 120 169" stroke-width="2.2" fill="none" opacity=".7" stroke-linecap="round"/>'+
        '<path d="M86 128 q3 -2 6 0 M95 121 q3 -2 6 0 M104 115 q3 -2 6 0 M90 136 q3 -2 6 0 M99 130 q3 -2 6 0" stroke="#000" stroke-width=".7" fill="none" opacity=".18"/>'+
        '<rect x="60" y="90" width="100" height="90" fill="url(#msRS)"/></g>'+
      /* folded wing, hinged at the shoulder: coverts, then long primaries with pale edges */
      '<g class="b-wing"><path d="M116 113 C105 110 91 118 83 130 C77 139 71 147 62 154 C75 155 91 151 103 144 C113 138 119 127 116 113Z" fill="url(#msRW)"/>'+
        '<path d="M113 118 C106 120 100 126 96 133 M108 126 C102 130 97 136 93 142" stroke="#fff" stroke-width=".8" fill="none" opacity=".28"/>'+
        '<path d="M98 140 C88 146 76 151 63 154 M100 136 C90 143 79 148 66 152 M103 132 C94 139 84 145 71 149" stroke="#000" stroke-width=".8" fill="none" opacity=".35"/>'+
        '<path d="M97 141 C87 147 76 151 64 153" stroke="#fff" stroke-width=".5" fill="none" opacity=".3"/></g>'+
      /* head (pecks): same gradients, face patch clipped to the head */
      '<g class="b-head"><path d="M148 106 C146 97 139 92 130 92 C121 92 115 97 113 104 C111 112 114 120 120 124 C128 128 140 124 146 118 L149.5 112.5Z" fill="url(#msRB)"/>'+
        '<g clip-path="url(#msCH)"><path d="M150 112 C148 101 142 97 136 98 C130 99 126 105 127 112 C128 120 133 126 141 126 L150 120Z" fill="url(#msRF)"/>'+
        '<path class="b-edge" d="M135 98 C129 100 126 106 127 113 C128 119 131 123 135 126" stroke-width="1.8" fill="none" opacity=".7" stroke-linecap="round"/>'+
        '<rect x="110" y="90" width="42" height="40" fill="url(#msRS)"/></g>'+
        '<circle cx="137.5" cy="104.5" r="3.6" fill="#fff" opacity=".35"/><circle class="b-pup" cx="137.5" cy="104.5" r="2.9" fill="#120c08"/><circle cx="138.5" cy="103.5" r=".9" fill="#fff"/>'+
        '<ellipse class="b-lid" cx="137.5" cy="104.5" rx="3.7" ry="3.7"/>'+
        '<path class="b-bill" d="M147.5 106.5 C152 107.6 156 108.8 160 110.2 C156 110.8 152 111.2 148.6 111.4Z"/><path class="b-beak b-bill2" d="M148.6 111.4 L158 110.6 C154 112 151 112.8 148.4 113Z"/></g>'+
      '<path d="M103 171 L101.5 179 M101.5 179 l-5 1.4 M101.5 179 l4.4 1.6 M101.5 179 l.8 2.8 M113 170 L113.5 178.5 M113.5 178.5 l-4.4 1.8 M113.5 178.5 l5 1 M113.5 178.5 l.2 2.8" stroke="#7d5f4c" stroke-width="1.5" stroke-linecap="round" fill="none"/></g>'+
    '<g class="b-notes" fill="#7c3aed" font-family="Inter,sans-serif" font-weight="700"><text class="n1" x="166" y="112" font-size="16">♪</text><text class="n2" x="174" y="104" font-size="18">♫</text><text class="n3" x="160" y="100" font-size="14">♪</text></g>'+
    '<g class="ms-bub"><path d="M150 112 h74 a10 10 0 0 1 10 10 v16 a10 10 0 0 1 -10 10 h-58 l-10 9 l1 -9 h-7 a10 10 0 0 1 -10 -10 v-16 a10 10 0 0 1 10 -10z" fill="#fff"/><text x="189" y="135" text-anchor="middle" font-family="Inter,sans-serif" font-weight="700" font-size="14" fill="#1e3a8a">Tweet tweet!</text></g></svg>';
  const kind=()=>{const p=THM.phase()[0];return p==="early"||p==="day"?"bird":"owl";};
  const hhmm=()=>{const d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");};
  const head=$("header#top"),h1=head&&$("h1",head);if(!h1)return;
  const ms=document.createElement("div");ms.id="mascot";ms.setAttribute("role","button");ms.tabIndex=0;h1.before(ms);
  const wide=matchMedia("(min-width:1200px)");
  const place=()=>{if(wide.matches){if(ms.parentNode!==document.body)document.body.appendChild(ms);ms.classList.add("ms-fixed");}else{ms.classList.remove("ms-fixed");if(ms.nextElementSibling!==h1)h1.before(ms);}};
  place();wide.addEventListener("change",place);
  let cur="",rt=0;
  /* plumages (real species): b back, o breast, f face, w wing, t tail (gradient stops), belly, edge (breast/face border), bill */
  const PLUM=[
    {n:"Robin",b:["#8d7659","#57452f"],o:["#f3904f","#df6630","#c24f22"],f:["#f3904f","#df6630","#c24f22"],w:["#7d664c","#463727"],t:["#6e5841","#3b2f22"],belly:"#ece5d9",edge:"#a7aeb2",bill:["#2e251f","#4a3c31"]},
    {n:"Bluebird",b:["#5b8fe0","#2d56a8"],o:["#eda06a","#d9813f","#b8652c"],f:["#6a9ae6","#3f70c8","#2d56a8"],w:["#4a80d8","#22448f"],t:["#3d6cc0","#1f3d80"],belly:"#f2eee6",edge:"#9fb6dc",bill:["#22242a","#3a3d45"]},
    {n:"Cardinal",b:["#e0453a","#a52219"],o:["#ee5246","#d9352b","#b8271f"],f:["#1c1110","#2a1512","#b8271f"],w:["#c2322a","#7f1914"],t:["#b02a22","#6e140f"],belly:"#d93a30",edge:"#e85a4f",bill:["#f08a3a","#d9702a"]},
    {n:"Goldfinch",b:["#f7d23a","#dcae14"],o:["#ffdf4a","#f7c823","#e0aa10"],f:["#ffe25a","#f7c823","#e6b015"],w:["#2e2e2e","#0f0f0f"],t:["#2a2a2a","#111111"],belly:"#f8f2d6",edge:"#e9c21c",bill:["#f2a65a","#e08a3c"]},
    {n:"Kingfisher",b:["#27aee0","#0f6f9f"],o:["#f39046","#e2722b","#c85a1c"],f:["#f39046","#e2722b","#c85a1c"],w:["#1f9fd6","#0b5f8c"],t:["#1689bd","#0a4f75"],belly:"#f3e6d4",edge:"#ffffff",bill:["#1d1d1f","#2c2c30"]}];
  let pl=Math.max(0,Math.min(PLUM.length-1,+(store.get("js1-bird")||0)||0));
  function plumage(){if(cur!=="bird")return;const P=PLUM[pl],stops=(id,c)=>{const g=$("#"+id,ms);if(g)[...g.children].forEach((s,i)=>s.setAttribute("stop-color",c[i]));};
    stops("msRB",P.b);stops("msRO",P.o);stops("msRF",P.f);stops("msRW",P.w);stops("msRT",P.t);
    $$(".b-belly",ms).forEach(e=>e.setAttribute("fill",P.belly));$$(".b-edge",ms).forEach(e=>e.setAttribute("stroke",P.edge));
    $$(".b-lid",ms).forEach(e=>e.setAttribute("fill",P.f[1]));const b1=$(".b-bill",ms),b2=$(".b-bill2",ms);if(b1)b1.setAttribute("fill",P.bill[0]);if(b2)b2.setAttribute("fill",P.bill[1]);}
  function paint(){const k=kind(),p=THM.phase();
    if(k!==cur){cur=k;ms.classList.remove("ms-owl","ms-bird");ms.classList.add("ms-"+k);ms.innerHTML=k==="owl"?OWL:BIRD;plumage();}
    const name=k==="owl"?"Night owl":PLUM[pl].n+" · "+(p[0]==="early"?"early bird":"song bird");
    ms.setAttribute("aria-label",name+" · "+hhmm()+": click to say hello");ms.title=name+" · "+hhmm()+(k==="bird"?" (click: new colours)":"");}
  function react(){if(window.SFX)cur==="owl"?SFX.hoot():SFX.chirp();ms.classList.remove("react");requestAnimationFrame(()=>requestAnimationFrame(()=>ms.classList.add("react")));clearTimeout(rt);rt=setTimeout(()=>ms.classList.remove("react"),2600);}
  /* study buddy (v13): short speech-bubble lines when you answer a quiz question, finish a quiz or mark a section understood (with a
     nod), and a nap (eyes shut, floating z's) after 2 minutes without activity; any activity wakes it ("I'm up!") */
  const pickL=a=>a[Math.floor(Math.random()*a.length)];
  function say(t,nod){if(flying||ms.classList.contains("away")||ms.classList.contains("sleep"))return;const tx=$(".ms-bub text",ms);if(!tx)return;
    if(!tx.dataset.d)tx.dataset.d=tx.textContent;tx.textContent=t;react();
    if(nod){const h=$(cur==="owl"?".o-head":".b-head",ms);if(h&&h.animate)h.animate([{transform:"rotate(0deg)"},{transform:"rotate(14deg)"},{transform:"rotate(0deg)"},{transform:"rotate(10deg)"},{transform:"rotate(0deg)"}],{duration:900,easing:"ease-in-out",composite:"add"});}
    clearTimeout(say.t);say.t=setTimeout(()=>{const t2=$(".ms-bub text",ms);if(t2&&t2.dataset.d)t2.textContent=t2.dataset.d;},2800);}
  document.addEventListener("quizanswer",e=>{const d=e.detail;say(d.ok&&d.streak>=3?"🔥 ×"+d.streak+"!":d.ok?pickL(["Nice!","Yes!","Correct!","Smart!"]):pickL(["Oops!","Not quite","Hmm…"]),d.ok);});
  document.addEventListener("quizdone",()=>setTimeout(()=>say("Bravo! 🎉",true),900));
  document.addEventListener("click",e=>{const b=e.target.closest(".sf-done");if(b)setTimeout(()=>{if(b.getAttribute("aria-pressed")==="true")say(pickL(["Great!","Learned!","Well done!"]),true);},40);});
  let napT=0,lastAct=0;
  const nap=()=>{if(document.hidden||flying)return;if(!$(".ms-zzz",ms))ms.insertAdjacentHTML("beforeend",'<span class="ms-zzz" aria-hidden="true"><i>z</i><i>z</i><i>z</i></span>');ms.classList.add("sleep");};
  const wake=()=>{const now=Date.now();if(now-lastAct<1000&&!ms.classList.contains("sleep"))return;lastAct=now;clearTimeout(napT);
    if(ms.classList.contains("sleep")){ms.classList.remove("sleep");setTimeout(()=>say("I'm up!"),250);}napT=setTimeout(nap,120000);};
  ["pointermove","pointerdown","keydown","scroll","wheel"].forEach(t=>addEventListener(t,wake,{passive:true}));wake();
  /* flight: now and then (and on click) the bird/owl takes off, flies to the "Java" heading (the hero h1 word when it is on screen,
     else the nav brand), pecks it three times (the word bounces, glows and throws sparks), then flies back and lands on its branch.
     A fixed .ms-flyer holds a clone of the character; the one on the branch hides (#mascot.away) until it lands, then calls out. */
  let flying=false;
  /* tree flight (≥1200px, where the tree is): the bird/owl swoops out over the page with a songbird's dipping flight, lands on a limb
     of the tree (TREE.perches), settles, hop-turns to face the page, looks round and pecks, then takes off and loops back to its branch.
     Wings stop flapping while perched (.ms-flyer.perched). Falls back to the heading flight (flyWord) when there is no tree. */
  function fly(){return flyTree()||flyWord();}
  function flyTree(){
    if(flying||document.hidden||!window.TREE||matchMedia("(prefers-reduced-motion:reduce)").matches)return false;
    const owl=cur==="owl",g=$(owl?".o-body":".b-bird",ms);if(!g)return false;
    const r=g.getBoundingClientRect(),W=innerWidth,H=innerHeight;if(!r.width||r.bottom<0||r.top>H)return false;
    const P=TREE.perches().filter(([x,y])=>y>r.bottom+90&&y<H-90&&x>W-200);if(!P.length)return false;
    const [tx,ty]=P[Math.floor(Math.random()*P.length)];
    const bb=g.getBBox(),k=r.width/bb.width,pad=8,fw=(bb.width+2*pad)*k;
    const fl=document.createElement("div");fl.className="ms-flyer ms-"+cur;fl.setAttribute("aria-hidden","true");
    fl.innerHTML='<svg viewBox="'+[bb.x-pad,bb.y-pad,bb.width+2*pad,bb.height+2*pad].join(" ")+'">'+g.outerHTML+"</svg>";
    Object.assign(fl.style,{left:(r.left-pad*k)+"px",top:(r.top-pad*k)+"px",width:fw+"px"});
    const hx=r.left+r.width/2,hy=r.top+r.height/2,sc=owl?.5:.6,px=tx+2,py=ty-r.height*sc/2+2,j=v=>v+(Math.random()-.5)*60;
    const cr=(a,b,c,d,t)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
    const path=Q=>{const F=[];for(let i=0;i<Q.length-1;i++)for(let s=0;s<12;s++){const t=s/12,q=[Q[Math.max(0,i-1)],Q[i],Q[i+1],Q[Math.min(Q.length-1,i+2)]];
      F.push([cr(q[0][0],q[1][0],q[2][0],q[3][0],t),cr(q[0][1],q[1][1],q[2][1],q[3][1],t)]);}F.push(Q[Q.length-1]);return F;};
    const out=path([[hx,hy],[hx-W*.1,hy-20],[j(W*.62),j((hy+py)/2)],[px-150,py-60],[px-45,py-16],[px,py]]),
      back=path([[px,py],[px-70,py-40],[j(W*.58),j(H*.45)],[j(W*.72),Math.max(60,hy-40)],[hx-50,hy-40],[hx,hy]]);
    const KF=[],T=13000,o1=.34,o2=.64;let face=1;
    const tf=(x,y,rot,sx,sy)=>"translate("+(x-hx).toFixed(1)+"px,"+(y-hy).toFixed(1)+"px) rotate("+rot.toFixed(1)+"deg) scale("+sx.toFixed(3)+","+sy.toFixed(3)+")";
    const push=(F,a,b,s0,s1)=>F.forEach(([x,y],i)=>{const n=F[Math.min(F.length-1,i+1)],dx=n[0]-x,dy=n[1]-y;if(Math.abs(dx)>2)face=dx<0?-1:1;
      const u=i/(F.length-1),s=s0+(s1-s0)*u+.12*Math.sin(Math.PI*u),dip=Math.sin(u*Math.PI*7)*9*Math.sin(Math.PI*u),
        tilt=Math.max(-22,Math.min(22,Math.atan2(dy,Math.abs(dx)+1)*57.3*.45));
      KF.push({offset:a+(b-a)*u,transform:tf(x,y+dip,owl?tilt*.4:tilt*face,owl?s:s*face,s)});});
    push(out,0,o1,1,sc);
    /* on the limb: land (squash), settle, hop-turn to face the page, look, peck twice, crouch, take off */
    const fz=face,at=(o,dy,rot,f,sy)=>KF.push({offset:o,transform:tf(px,py+dy,rot,owl?sc:sc*f,sc*(sy||1))});
    at(o1+.01,3,0,fz,.88);at(o1+.03,0,0,fz);at(o1+.08,0,0,fz);at(o1+.1,-7,0,fz);at(o1+.11,-7,0,-fz);at(o1+.13,0,0,-fz,.92);at(o1+.14,0,0,-fz);
    at(o1+.18,0,owl?-8:0,-fz);at(o1+.2,0,owl?8:0,-fz);at(o1+.21,2,owl?0:-fz*16,-fz);at(o1+.22,0,0,-fz);at(o1+.23,2,owl?0:-fz*16,-fz);at(o1+.24,0,0,-fz);
    at(o2-.02,0,0,-fz);at(o2-.005,3,0,-fz,.86);
    face=-fz;push(back,o2,1,sc,1);
    KF[0].transform=KF[KF.length-1].transform="translate(0px,0px) rotate(0deg) scale(1,1)";
    KF.sort((a,b)=>a.offset-b.offset);
    flying=true;ms.classList.add("away");document.body.appendChild(fl);
    const an=fl.animate(KF,{duration:T,easing:"linear"}),timers=[setTimeout(()=>fl.classList.add("perched"),T*(o1+.01)),setTimeout(()=>fl.classList.remove("perched"),T*(o2-.005))];
    an.onfinish=an.oncancel=()=>{timers.forEach(clearTimeout);fl.remove();ms.classList.remove("away");flying=false;react();};
    return true;}
  function flyWord(){
    if(flying||document.hidden||matchMedia("(prefers-reduced-motion:reduce)").matches)return false;
    const g=$(cur==="owl"?".o-body":".b-bird",ms);if(!g)return false;
    const r=g.getBoundingClientRect(),W=innerWidth,H=innerHeight;if(!r.width||r.bottom<0||r.top>H)return false;
    const big=$("header#top h1 .grad"),br=big&&big.getBoundingClientRect(),
      tg=br&&br.top>60&&br.bottom<H-20&&br.width?big:$("nav .brand span");if(!tg)return false;
    const tr=tg.getBoundingClientRect();
    const bb=g.getBBox(),k=r.width/bb.width,pad=8,owl=cur==="owl",fw=(bb.width+2*pad)*k,fh=(bb.height+2*pad)*k;
    const fl=document.createElement("div");fl.className="ms-flyer ms-"+cur;fl.setAttribute("aria-hidden","true");
    fl.innerHTML='<svg viewBox="'+[bb.x-pad,bb.y-pad,bb.width+2*pad,bb.height+2*pad].join(" ")+'">'+g.outerHTML+"</svg>";
    Object.assign(fl.style,{left:(r.left-pad*k)+"px",top:(r.top-pad*k)+"px",width:fw+"px"});
    const hx=r.left+r.width/2,hy=r.top+r.height/2,j=v=>v+(Math.random()-.5)*v*.12,top=Math.max(60,r.height*.7);
    /* where it perches to peck: the bird sits just right of the word (beak towards it), the owl hovers over it */
    const sc=Math.min(1,Math.max(.55,(tr.height*1.5)/fh)),
      px=owl?tr.left+tr.width*.55:tr.right+fw*sc*.3,py=owl?tr.top-fh*sc*.32:tr.top+tr.height*.42,toL=tr.left+tr.width/2<px;
    const cr=(a,b,c,d,t)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
    const path=P=>{const F=[];for(let i=0;i<P.length-1;i++)for(let s=0;s<10;s++){const t=s/10,q=[P[Math.max(0,i-1)],P[i],P[i+1],P[Math.min(P.length-1,i+2)]];
      F.push([cr(q[0][0],q[1][0],q[2][0],q[3][0],t),cr(q[0][1],q[1][1],q[2][1],q[3][1],t)]);}F.push(P[P.length-1]);return F;};
    const out=path([[hx,hy],[hx-W*.08,Math.max(top,hy-60)],[j((hx+px)/2),Math.max(top,Math.min(hy,py)-90)],[px+(toL?60:-60),py-50],[px,py]]),
      back=path([[px,py],[px+(toL?40:-40),py-70],[j(W*.45),j(H*.62)],[j(W*.78),j(H*.34)],[hx+40,Math.max(top,hy-80)],[hx,hy]]);
    let face=-1;const KF=[];
    const push=(F,o0,o1,s0,s1)=>F.forEach(([x,y],i)=>{const n=F[Math.min(F.length-1,i+1)],dx=n[0]-x,dy=n[1]-y;if(Math.abs(dx)>2)face=dx<0?-1:1;
      const u=i/(F.length-1),s=s0+(s1-s0)*u+.18*Math.sin(Math.PI*u),tilt=Math.max(-25,Math.min(25,Math.atan2(dy,Math.abs(dx)+1)*57.3*.5));
      KF.push({offset:o0+(o1-o0)*u,transform:"translate("+(x-hx).toFixed(1)+"px,"+(y-hy).toFixed(1)+"px) rotate("+(owl?tilt*.4:tilt*face).toFixed(1)+"deg) scale("+(owl?s:s*face).toFixed(3)+","+s.toFixed(3)+")"});});
    const T=9000,o1=.36,o2=.62;
    push(out,0,o1,1,sc);
    /* three pecks: lunge towards the word and back */
    const pf=toL?-1:1,at=(x,y,rot)=>"translate("+(x-hx).toFixed(1)+"px,"+(y-hy).toFixed(1)+"px) rotate("+rot+"deg) scale("+(owl?sc:sc*pf).toFixed(3)+","+sc.toFixed(3)+")";
    for(let i=0;i<3;i++){const b=o1+(o2-o1)*(i/3),d=(o2-o1)/3;
      KF.push({offset:b+d*.15,transform:at(px,py,0)});
      KF.push({offset:b+d*.45,transform:owl?at(px,py+10*sc,0):at(px+pf*12*sc,py+5*sc,pf*-22)});
      KF.push({offset:b+d*.75,transform:at(px,py,0)});}
    push(back,o2,1,sc,1);
    KF[0].transform=KF[KF.length-1].transform="translate(0px,0px) rotate(0deg) scale(1,1)";
    flying=true;ms.classList.add("away");document.body.appendChild(fl);tg.classList.add("poke-tgt");
    const an=fl.animate(KF,{duration:T,easing:"linear"}),timers=[];
    for(let i=0;i<3;i++)timers.push(setTimeout(()=>poke(tg,owl?px:px+pf*fw*sc*.45,owl?tr.top:py),T*(o1+(o2-o1)*(i/3+.45/3))));
    an.onfinish=an.oncancel=()=>{timers.forEach(clearTimeout);fl.remove();tg.classList.remove("poke-tgt","poked");ms.classList.remove("away");flying=false;react();};
    return true;}
  /* the poked word bounces and glows; a few sparks fly from the beak */
  function poke(el,x,y){el.classList.remove("poked");void el.offsetWidth;el.classList.add("poked");
    for(let i=0;i<7;i++){const s=document.createElement("i");s.className="poke-spark";s.style.left=x+"px";s.style.top=y+"px";
      const a=Math.random()*6.283,d=18+Math.random()*26;s.style.setProperty("--dx",(Math.cos(a)*d).toFixed(1)+"px");s.style.setProperty("--dy",(Math.sin(a)*d-8).toFixed(1)+"px");
      document.body.appendChild(s);setTimeout(()=>s.remove(),700);}}
  /* the fire rider and the mascot (RIDER calls these). where() is the bird's position (on its branch, or hiding in the left tree);
     dodge() — a shot just missed: feathers fly; at home it flees to a limb of the left tree (TREE.perchesL) and hides there, already
     hiding it hops aside; grab() hands RIDER a flapping clone to move on his chain (the copy on the branch hides); release(h,x,y) lets
     it go and it flies home; home() sends a hiding bird back when the rider has gone. */
  let out=null;
  const clone=g=>{const r=g.getBoundingClientRect(),bb=g.getBBox(),k=r.width/bb.width,pad=8;
    const fl=document.createElement("div");fl.className="ms-flyer ms-"+cur;fl.setAttribute("aria-hidden","true");
    fl.innerHTML='<svg viewBox="'+[bb.x-pad,bb.y-pad,bb.width+2*pad,bb.height+2*pad].join(" ")+'">'+g.outerHTML+"</svg>";
    Object.assign(fl.style,{left:(r.left-pad*k)+"px",top:(r.top-pad*k)+"px",width:((bb.width+2*pad)*k)+"px"});
    flying=true;ms.classList.add("away");document.body.appendChild(fl);return {el:fl,cx:r.left+r.width/2,cy:r.top+r.height/2,h:r.height,owl:cur==="owl"};};
  const done=el=>{el.remove();ms.classList.remove("away");flying=false;out=null;react();};
  function feathers(x,y){const P=PLUM[pl],c=cur==="owl"?["#8b5e3c","#ead2ad"]:[P.b[0],P.o[1],P.belly];
    for(let i=0;i<9;i++){const e=document.createElement("i");e.className="ms-feather";e.style.left=x+"px";e.style.top=y+"px";e.style.background=c[i%c.length];
      e.style.setProperty("--dx",((Math.random()-.5)*120).toFixed(0)+"px");e.style.setProperty("--dy",(Math.random()*90-20).toFixed(0)+"px");e.style.setProperty("--r",((Math.random()-.5)*720).toFixed(0)+"deg");
      document.body.appendChild(e);setTimeout(()=>e.remove(),1500);}}
  window.MASCOT={say,
    where(){if(out)return out.sit?[out.x,out.y]:null;const g=$(cur==="owl"?".o-body":".b-bird",ms);if(flying||!g)return null;const r=g.getBoundingClientRect();
      return r.width&&r.bottom>0&&r.top<innerHeight?[r.left+r.width/2,r.top+r.height/2]:null;},
    dodge(){const w=this.where();if(!w)return;feathers(w[0],w[1]);
      if(out){out.el.animate([{transform:"translate(0,0)"},{transform:"translate(-12px,-16px) rotate(-14deg)"},{transform:"translate(0,0)"}],{duration:480,easing:"ease-out",composite:"add"});return;}
      const P=window.TREE&&TREE.perchesL?TREE.perchesL().filter(([x,y])=>y>120&&y<innerHeight-60):[];
      if(!P.length){ms.classList.remove("dodge");void ms.offsetWidth;ms.classList.add("dodge");setTimeout(()=>ms.classList.remove("dodge"),600);return;}
      const g=$(cur==="owl"?".o-body":".b-bird",ms),h=clone(g),[tx,ty]=P[Math.floor(Math.random()*P.length)],sc=h.owl?.5:.6,px=tx,py=ty-h.h*sc/2+2,K=[];
      const mx=(h.cx+px)/2,my=Math.min(h.cy,py)-140;
      for(let i=0;i<=40;i++){const u=i/40,x=(1-u)*(1-u)*h.cx+2*(1-u)*u*mx+u*u*px,y=(1-u)*(1-u)*h.cy+2*(1-u)*u*my+u*u*py+Math.sin(u*Math.PI*6)*8*Math.sin(Math.PI*u),s=1+(sc-1)*u;
        K.push({offset:u,transform:"translate("+(x-h.cx).toFixed(1)+"px,"+(y-h.cy).toFixed(1)+"px) rotate("+(i<40?-10:0)+"deg) scale("+(h.owl?s:-s).toFixed(3)+","+s.toFixed(3)+")"});}
      out=Object.assign(h,{x:px,y:py,sc,sit:false});
      out.anim=h.el.animate(K,{duration:2200,easing:"ease-in-out",fill:"forwards"});
      out.anim.onfinish=()=>{if(out){out.sit=true;out.el.classList.add("perched");}};},
    grab(){if(out){if(!out.sit)return null;const h=out;h.anim.onfinish=null;h.anim.cancel();h.el.classList.remove("perched");
        h.el.style.transform="translate("+(h.x-h.cx)+"px,"+(h.y-h.cy)+"px) scale("+(h.owl?h.sc:-h.sc)+","+h.sc+")";out=null;return h;}
      const g=$(cur==="owl"?".o-body":".b-bird",ms);if(flying||!g||!g.getBoundingClientRect().width)return null;return clone(g);},
    release(h,x,y){const dx=x-h.cx,dy=y-h.cy,f=dx>0?-1:1,s=.7;
      const a=h.el.animate([{transform:"translate("+dx+"px,"+dy+"px) scale("+(h.owl?s:s*f)+","+s+")"},
        {transform:"translate("+(dx*.45)+"px,"+(Math.min(dy,0)*.5-90)+"px) rotate(-8deg) scale("+(h.owl?.85:.85*f)+",.85)"},
        {transform:"translate(0px,0px) scale(1,1)"}],{duration:2600,easing:"ease-in-out"});
      a.onfinish=a.oncancel=()=>done(h.el);},
    /* v12: after the chain the bird turns into a ghost (green puff + wail), the ghost swoops back to the tree, a second ghost rushes
       out of the tree straight at the viewer (growing to fill the screen as it fades), then the bird is back on its branch */
    releaseGhost(h,x,y){
      const GH='<svg viewBox="-14 -14 128 148"><ellipse cx="50" cy="62" rx="62" ry="72" fill="rgba(150,255,190,.22)"/><ellipse cx="50" cy="62" rx="44" ry="54" fill="rgba(170,255,205,.22)"/>'+
        '<path d="M10 62 Q10 8 50 8 Q90 8 90 62 L90 112 Q82 101 74 112 Q66 123 58 112 Q50 101 42 112 Q34 123 26 112 Q18 101 10 112 Z" fill="#eef4ff" fill-opacity=".93"/>'+
        '<path d="M88 58 Q104 48 110 30 M12 58 Q-4 48 -10 30" stroke="#eef4ff" stroke-opacity=".9" stroke-width="9" stroke-linecap="round" fill="none"/>'+
        '<ellipse cx="36" cy="52" rx="8" ry="12" fill="#140a22"/><ellipse cx="64" cy="52" rx="8" ry="12" fill="#140a22"/><ellipse cx="50" cy="82" rx="9" ry="13" fill="#140a22"/></svg>';
      const mk=(w,z)=>{const e=document.createElement("div");e.className="ms-ghost";e.setAttribute("aria-hidden","true");e.innerHTML=GH;e.style.width=w+"px";if(z)e.style.zIndex=z;document.body.appendChild(e);return e;};
      const puff=(px,py,n,col)=>{for(let i=0;i<n;i++){const e=document.createElement("i");e.className="ms-puff";e.style.left=px+"px";e.style.top=py+"px";e.style.background=col;
        e.style.setProperty("--dx",((Math.random()-.5)*150).toFixed(0)+"px");e.style.setProperty("--dy",((Math.random()-.5)*120).toFixed(0)+"px");document.body.appendChild(e);setTimeout(()=>e.remove(),1100);}};
      const wail=()=>{if(window.SFX&&SFX.wail)SFX.wail();};
      if(matchMedia("(prefers-reduced-motion: reduce)").matches){this.release(h,x,y);return;}
      /* 1. the bird on the chain vanishes in a green puff */
      h.el.animate([{opacity:1},{opacity:0}],{duration:260,fill:"forwards"});puff(x,y,16,"rgba(150,255,190,.85)");wail();setTimeout(()=>h.el.remove(),300);
      /* 2. a ghost appears there and swoops back to the tree */
      const G1=72,g=mk(G1),sx=x-G1/2,sy=y-G1*.62,tx=h.cx-G1/2,ty=h.cy-G1*.62,mx=(sx+tx)/2,my=Math.min(sy,ty)-170,f=tx<sx?-1:1,K=[];
      g.style.left=sx+"px";g.style.top=sy+"px";
      for(let i=0;i<=36;i++){const u=i/36,px=(1-u)*(1-u)*sx+2*(1-u)*u*mx+u*u*tx,py=(1-u)*(1-u)*sy+2*(1-u)*u*my+u*u*ty+Math.sin(u*Math.PI*5)*12;
        K.push({offset:u,opacity:i===0?0:i>31?(36-i)/5:1,transform:"translate("+(px-sx).toFixed(1)+"px,"+(py-sy).toFixed(1)+"px) rotate("+(Math.sin(u*Math.PI*6)*10).toFixed(1)+"deg) scale("+f+",1)"});}
      g.animate(K,{duration:2100,easing:"ease-in-out",fill:"forwards"}).onfinish=()=>{g.remove();
        /* 3. another ghost bursts out of the tree straight at the viewer */
        const Z=120,z=mk(Z,90),zx=h.cx-Z/2,zy=h.cy-Z*.62,cx=innerWidth/2-Z/2-zx,cy=innerHeight/2-Z*.62-zy;z.style.left=zx+"px";z.style.top=zy+"px";wail();
        z.animate([{transform:"translate(0px,0px) scale(.2)",opacity:0},{transform:"translate("+(cx*.3).toFixed(0)+"px,"+(cy*.3).toFixed(0)+"px) scale(1.5)",opacity:1,offset:.35},
          {transform:"translate("+cx.toFixed(0)+"px,"+cy.toFixed(0)+"px) scale(16)",opacity:0}],{duration:1200,easing:"cubic-bezier(.55,0,.9,.35)",fill:"forwards"}).onfinish=()=>{z.remove();
          /* 4. the bird is back on its branch */
          puff(h.cx,h.cy,10,"rgba(255,255,255,.85)");done(h.el);};};},
    home(){if(!out)return;if(!out.sit){out.anim.onfinish=()=>{if(out){out.sit=true;MASCOT.home();}};return;}
      const h=out;h.anim.onfinish=null;h.el.classList.remove("perched");this.release(h,h.x,h.y);h.anim.cancel();}};
  /* a click gives the bird the next plumage (kept between visits), then it flies off */
  const go=()=>{if(cur==="bird"&&!flying){pl=(pl+1)%PLUM.length;store.set("js1-bird",pl);plumage();paint();}if(!fly())react();};
  ms.addEventListener("click",go);ms.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});
  document.addEventListener("themechange",paint);
  paint();setInterval(paint,30000);setTimeout(react,1600);
  /* the owl hoots on its own every 35–58 s (sound plays once the page has had a click; see SFX) */
  (function hoots(){setTimeout(()=>{if(cur==="owl"&&!document.hidden&&window.SFX)SFX.hoot();hoots();},35000+Math.random()*23000);})();
  (function auto(ms){setTimeout(()=>{fly();auto(45000+Math.random()*45000);},ms);})(12000);
})();

/* weather v9: the scene follows the real weather or a kind picked in the ☁ picker (clear, cloudy, rain, storm, snow, fog, windy, off;
   intensity auto / light / medium / heavy), with matching sound. Canvas #wx draws rain + splashes, lightning, snow, fog, clouds and blown
   leaves at the display's frame rate (time-based; clouds and fog are pre-rendered sprites). #jungle gets wx-wet/wx-snow/wx-fog/wx-wind,
   #mascot wx-c1/wx-c2/wx-c3.
   Live weather: the place is a city you typed (Open-Meteo geocoding), else the browser location (asked once, saved for 6 h so other
   pages don't ask again), else an approximate place from the network (ipapi.co). Conditions come from Open-Meteo (current + last
   15-min precipitation) and wttr.in; the wetter of the two wins, refreshed every 10 min.
   Sound (after the first click, 🔊 in the nav mutes): rain hiss + drop ticks, thunder after each flash, wind gusts, birds by day and
   crickets at night when it is clear. Keys: js1-wx, js1-wx-lvl, js1-wx-live, js1-wx-loc. */
const WX=(function(){
  const reduce=matchMedia("(prefers-reduced-motion: reduce)");
  const KINDS=[["live","Live","📍"],["clear","Clear","☀️"],["cloudy","Cloudy","☁️"],["rain","Rain","🌧️"],["storm","Storm","⛈️"],["snow","Snow","❄️"],["fog","Fog","🌫️"],["wind","Windy","🍃"],["off","Off","⦸"]];
  const ICON={clear:"☀️",cloudy:"☁️",rain:"🌧️",storm:"⛈️",snow:"❄️",fog:"🌫️",wind:"🍃",off:"⦸"};
  const RANK={clear:0,cloudy:1,fog:2,rain:3,snow:4,storm:5};
  /* WMO weather codes (Open-Meteo) → [kind, level, description] */
  const CODES={0:["clear",1,"Clear sky"],1:["clear",1,"Mainly clear"],2:["cloudy",1,"Partly cloudy"],3:["cloudy",2,"Overcast"],45:["fog",2,"Fog"],48:["fog",3,"Rime fog"],
    51:["rain",1,"Light drizzle"],53:["rain",1,"Drizzle"],55:["rain",2,"Dense drizzle"],56:["rain",1,"Freezing drizzle"],57:["rain",2,"Freezing drizzle"],
    61:["rain",1,"Light rain"],63:["rain",2,"Rain"],65:["rain",3,"Heavy rain"],66:["rain",2,"Freezing rain"],67:["rain",3,"Heavy freezing rain"],
    71:["snow",1,"Light snow"],73:["snow",2,"Snow"],75:["snow",3,"Heavy snow"],77:["snow",1,"Snow grains"],80:["rain",1,"Rain showers"],81:["rain",2,"Rain showers"],82:["rain",3,"Violent showers"],
    85:["snow",2,"Snow showers"],86:["snow",3,"Heavy snow showers"],95:["storm",2,"Thunderstorm"],96:["storm",3,"Thunderstorm, hail"],99:["storm",3,"Thunderstorm, heavy hail"]};
  /* wttr.in (WWO) codes → [kind, level] */
  const WWO=c=>{c=+c;if([113].includes(c))return ["clear",1];if([116,119,122].includes(c))return ["cloudy",c===116?1:2];if([143,248,260].includes(c))return ["fog",2];
    if([200,386,389,392,395].includes(c))return ["storm",c===389||c===395?3:2];
    if([179,182,185,227,230,317,320,323,326,329,332,335,338,350,362,365,368,371,374,377].includes(c))return ["snow",[227,230,335,338,371,377].includes(c)?3:2];
    if([176,263,266,281,284,293,296,353].includes(c))return ["rain",1];if([299,302,311,356].includes(c))return ["rain",2];if([305,308,314,359].includes(c))return ["rain",3];return null;};
  const jget=k=>{try{return JSON.parse(store.get(k)||"null");}catch(e){return null;}};
  let mode=store.get("js1-wx")||"live",lv=+(store.get("js1-wx-lvl")||0)||0,live=jget("js1-wx-live"),loc=jget("js1-wx-loc"),status="",busy=false;
  if(live&&live.kind==null)live=null;
  let kind="clear",lvl=2,windy=false,dark=false;
  const cv=document.createElement("canvas");cv.id="wx";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);
  const ctx=cv.getContext("2d");let W=0,H=0,dpr=1,raf=0,last=0,T=0;
  const R=(a,b)=>a+Math.random()*(b-a);
  let drops=[],splash=[],flakes=[],fogs=[],clouds=[],leaves=[],bolt=null,flash=0,nextBolt=0;
  function isDark(){const m=getComputedStyle(document.body).backgroundColor.match(/\d+/g)||[255,255,255];return (+m[0]*.3+ +m[1]*.59+ +m[2]*.11)<110;}
  /* soft round sprite (pre-rendered once per colour), drawn scaled for clouds and fog banks */
  const SPR={};function sprite(rgb,a){const key=rgb+a;if(SPR[key])return SPR[key];const c=document.createElement("canvas");c.width=c.height=128;const g=c.getContext("2d"),gr=g.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,"rgba("+rgb+","+a+")");gr.addColorStop(.55,"rgba("+rgb+","+(a*.45).toFixed(3)+")");gr.addColorStop(1,"rgba("+rgb+",0)");g.fillStyle=gr;g.fillRect(0,0,128,128);return SPR[key]=c;}
  function size(){dpr=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);seed();}
  /* particle sets for the current kind and level */
  function seed(){const k=kind,L=lvl;
    const nr=k==="rain"?[0,150,260,420][L]:k==="storm"?[0,260,380,560][L]:0;
    drops=[];for(let i=0;i<nr;i++)drops.push({x:R(-100,W+100),y:R(-H,H),l:R(12,24),v:R(760,1150),a:R(.55,1)});
    flakes=[];if(k==="snow")for(let i=0,n=[0,80,160,300][L];i<n;i++)flakes.push({x:R(0,W),y:R(-H,H),r:R(1.2,3.6),v:R(30,85),ph:R(0,6.28),f:R(.6,1.6)});
    fogs=[];if(k==="fog")for(let i=0,n=4+2*L;i<n;i++)fogs.push({x:R(-200,W),y:R(H*.1,H*.95),r:R(200,420),v:R(8,24)*(Math.random()<.5?1:-1)});
    clouds=[];if(k!=="clear"&&k!=="off")for(let i=0,n=k==="cloudy"?3+2*L:6;i<n;i++)clouds.push({x:R(-300,W),y:R(-60,H*.16),r:R(160,300),v:R(6,18)});
    leaves=[];if(windy)for(let i=0;i<16;i++)leaves.push(leaf(true));
    splash=[];bolt=null;flash=0;nextBolt=R(2,6);}
  function leaf(any){return {x:any?R(-W*.5,W):R(-160,-20),y:R(H*.05,H*.9),vx:R(160,320),vy:R(-30,40),r:R(0,6.28),vr:R(-6,6),s:R(4,7),c:["#5f9a34","#94c454","#c9a227","#a4652a"][Math.floor(R(0,4))],ph:R(0,6.28)};}
  function makeBolt(){const x0=R(W*.35,W*.95);let x=x0,y=0;const P=[[x,y]],end=R(H*.45,H*.85),B=[];
    while(y<end){y+=R(14,34);x+=R(-26,26);P.push([x,y]);if(Math.random()<.18){const b=[[x,y]];let bx=x,by=y;for(let j=0;j<4;j++){by+=R(12,26);bx+=R(-30,30);b.push([bx,by]);}B.push(b);}}
    return {P,B,t:0};}
  function line(P){ctx.beginPath();ctx.moveTo(P[0][0],P[0][1]);for(let i=1;i<P.length;i++)ctx.lineTo(P[i][0],P[i][1]);ctx.stroke();}
  function frame(now){raf=requestAnimationFrame(frame);const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;T+=dt;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    const k=kind,wx=(windy?.55:.12);
    /* gloom: a faint blue-grey veil in light themes */
    const veil={rain:.05,storm:.1,snow:.04,fog:.03}[k];if(veil&&!dark){ctx.fillStyle="rgba(40,52,72,"+veil+")";ctx.fillRect(0,0,W,H);}
    if(clouds.length){const a=k==="storm"?.17:k==="rain"?.13:.09,s=sprite(dark?"190,200,220":k==="storm"||k==="rain"?"70,80,96":"120,130,145",a);
      for(const c of clouds){c.x+=c.v*dt*(windy?3:1);if(c.x-c.r>W)c.x=-c.r*1.5;ctx.drawImage(s,c.x-c.r,c.y-c.r*.7,2*c.r,1.4*c.r);}}
    if(fogs.length){const s=sprite(dark?"200,208,220":"235,238,242",dark?.1:.5);
      for(const f of fogs){f.x+=f.v*dt;if(f.x-f.r>W)f.x=-f.r;if(f.x+f.r<0)f.x=W+f.r;ctx.drawImage(s,f.x-f.r,f.y-f.r*.6,2*f.r,1.2*f.r);}}
    if(drops.length){ctx.lineCap="round";
      /* two passes: far drops thin and faint, near drops brighter */
      for(const near of [false,true]){ctx.strokeStyle=dark?(near?"rgba(185,208,240,.5)":"rgba(160,185,220,.26)"):(near?"rgba(60,85,120,.42)":"rgba(80,105,140,.22)");ctx.lineWidth=near?1.3:.9;ctx.beginPath();
        for(const d of drops){if((d.a>.8)!==near)continue;d.y+=d.v*dt;d.x+=wx*d.v*dt;
          if(d.y>H){if(near&&Math.random()<.6)splash.push({x:d.x,y:H-R(0,6),t:0});d.y=R(-120,-10);d.x=R(-200,W+50);}
          ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-wx*d.l,d.y-d.l);}
        ctx.stroke();}
      ctx.strokeStyle=dark?"rgba(170,195,230,.5)":"rgba(70,95,130,.45)";ctx.lineWidth=1;
      splash=splash.filter(s=>(s.t+=dt)<.35);for(const s of splash){const u=s.t/.35;ctx.globalAlpha=1-u;ctx.beginPath();ctx.ellipse(s.x,s.y,2+9*u,1+2.5*u,0,Math.PI,0);ctx.stroke();}
      ctx.globalAlpha=1;}
    if(flakes.length){ctx.fillStyle="rgba(255,255,255,.95)";ctx.strokeStyle=dark?"rgba(0,0,0,0)":"rgba(90,110,140,.35)";ctx.lineWidth=.8;
      for(const f of flakes){f.y+=f.v*dt;f.x+=(Math.sin(T*f.f+f.ph)*22+wx*90)*dt;if(f.y>H+5){f.y=-5;f.x=R(-50,W);}if(f.x>W+10)f.x=-10;
        ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,6.2832);ctx.fill();if(!dark)ctx.stroke();}}
    for(const l of leaves){l.x+=l.vx*dt;l.y+=(l.vy+Math.sin(T*3+l.ph)*40)*dt;l.r+=l.vr*dt;if(l.x>W+30||l.y>H+30||l.y<-30)Object.assign(l,leaf(false));
      ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.r);ctx.scale(1,Math.abs(Math.cos(T*4+l.ph))*.8+.2);ctx.fillStyle=l.c;ctx.beginPath();ctx.ellipse(0,0,l.s,l.s*.45,0,0,6.2832);ctx.fill();ctx.restore();}
    if(k==="storm"){nextBolt-=dt;if(nextBolt<=0){bolt=makeBolt();flash=1;nextBolt=R(4,10)/(lvl||1)*1.6;setTimeout(()=>{flash=Math.max(flash,.7);},140);
        /* thunder follows the flash, later and softer when the strike is far */
        const far=Math.random();setTimeout(()=>{if(window.SFX)SFX.thunder(.45+.6*(1-far));},250+far*2200);}
      if(flash>0){ctx.fillStyle="rgba(235,240,255,"+(flash*(dark?.22:.35)).toFixed(3)+")";ctx.fillRect(0,0,W,H);flash=Math.max(0,flash-dt*4);}
      if(bolt&&(bolt.t+=dt)<.35){const a=1-bolt.t/.35;ctx.save();ctx.globalAlpha=a*.35;ctx.strokeStyle="rgb(200,180,255)";ctx.lineWidth=7;line(bolt.P);
        ctx.globalAlpha=a;ctx.strokeStyle="#fff";ctx.lineWidth=2.2;line(bolt.P);ctx.lineWidth=1.1;bolt.B.forEach(line);ctx.restore();}}}
  function stop(){cancelAnimationFrame(raf);raf=0;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);}
  function start(){if(raf||document.hidden||reduce.matches)return;if(kind==="clear"&&!windy||kind==="off")return;last=performance.now();raf=requestAnimationFrame(frame);}

  /* ambience: a bus of looping noise layers + scheduled ticks, cross-faded when the weather changes */
  const AMB=(function(){let key="",bus=null,srcs=[],tm=[];
    function fade(){tm.forEach(clearInterval);tm=[];if(!bus)return;const ac=SFX.ac,b=bus,ss=srcs;bus=null;srcs=[];
      b.gain.setTargetAtTime(0,ac.currentTime,.6);setTimeout(()=>{ss.forEach(s=>{try{s.stop();}catch(e){}});try{b.disconnect();}catch(e){}},3500);}
    function build(k,L,wind,night){const ac=SFX.ac,v=[0,.6,.85,1.1][L]||.85;
      bus=ac.createGain();bus.gain.value=0;bus.connect(SFX.out);bus.gain.setTargetAtTime(1,ac.currentTime,1.2);
      const layer=(type,f,q,vol)=>{const s=ac.createBufferSource();s.buffer=SFX.noise;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
        const g=ac.createGain();g.gain.value=vol;s.connect(fl);fl.connect(g);g.connect(bus);s.start(0,Math.random()*1.8);srcs.push(s);return {fl,g};};
      const lfo=(param,hz,depth)=>{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=hz;g.gain.value=depth;o.connect(g);g.connect(param);o.start();srcs.push(o);};
      if(k==="rain"||k==="storm"){const s=k==="storm"?1.25:1;
        layer("bandpass",1300,.45,.2*v*s);layer("highpass",4800,.4,.045*v*s);layer("lowpass",260,.5,.11*v*s);
        tm.push(setInterval(()=>{if(!SFX.ok)return;const t=SFX.ac.currentTime;for(let i=0,n=Math.round(4+7*v*s);i<n;i++)SFX.drop(t+Math.random()*.25,v);},250));}
      if(wind||k==="storm"||k==="snow"||k==="fog"||k==="cloudy"){const strong=wind||k==="storm",w=layer("bandpass",380,.8,strong?.16:k==="snow"?.08:.045);
        lfo(w.g.gain,.09+Math.random()*.05,strong?.1:.025);lfo(w.fl.frequency,.06,strong?220:90);}
      if(night&&(k==="clear"||k==="cloudy"))tm.push(setInterval(()=>{if(!SFX.ok)return;const t=SFX.ac.currentTime;for(let i=0;i<3;i++)if(Math.random()<.7)SFX.cricket(t+i*.42+Math.random()*.1,k==="clear"?1:.6);},1300));
      if(!night&&k==="clear")tm.push(setInterval(()=>{if(SFX.ok&&Math.random()<.4)SFX.chirp(.45);},3200));}
    function set(k,L,wind,night){const S=window.SFX,nk=S&&S.on&&S.ok&&!document.hidden&&k!=="off"?[k,L,wind,night].join():"";if(nk===key)return;key=nk;fade();if(nk)build(k,L,wind,night);}
    return {set};})();
  const night=()=>{if(mode==="live"&&live&&live.day!=null&&Date.now()-live.t<3*3600e3)return !live.day;const h=new Date().getHours();return h<6||h>=18;};
  const sound=()=>AMB.set(kind,lvl,windy,night());

  /* work out what to show, then update the tree, the mascot, the canvas and the sound */
  function apply(){
    if(mode==="off"){kind="off";windy=false;}
    else if(mode==="live"){kind=live?live.kind:"clear";lvl=lv||(live?live.lvl:2);windy=!!(live&&live.wind>=28);}
    else{kind=mode==="wind"?"clear":mode;windy=mode==="wind";lvl=lv||2;}
    if(mode!=="live"&&mode!=="wind"&&lv===0)lvl=2;
    dark=isDark();
    const ms=document.getElementById("mascot");
    for(const jg of [document.getElementById("jungle"),document.getElementById("jungleL")])if(jg){jg.classList.toggle("wx-wet",kind==="rain"||kind==="storm");jg.classList.toggle("wx-snow",kind==="snow");jg.classList.toggle("wx-fog",kind==="fog");jg.classList.toggle("wx-wind",windy||kind==="storm");}
    if(ms){ms.classList.toggle("wx-c1",kind==="cloudy"||kind==="fog");ms.classList.toggle("wx-c2",kind==="rain"||kind==="storm");ms.classList.toggle("wx-c3",kind==="snow");}
    if(btn){btn.textContent=windy&&kind==="clear"?ICON.wind:ICON[kind]||"☀️";btn.title="Weather: "+label();}
    stop();seed();start();sound();if(!pk.hidden)paint();}
  function label(){if(mode==="off")return "off";
    return mode==="live"?(live?live.desc+", "+Math.round(live.temp)+"°C"+(live.place?" · "+live.place:""):"live (no data yet)"):(KINDS.find(x=>x[0]===mode)||[,mode])[1];}

  /* where: a typed city wins; else the browser location (saved for 6 h); else an approximate place from the network */
  const saveLoc=o=>{loc=o;store.set("js1-wx-loc",JSON.stringify(o));return o;};
  function viaIP(){return fetch("https://ipapi.co/json/").then(r=>r.json()).then(j=>{if(j.latitude==null)throw 0;
    return saveLoc({la:+(+j.latitude).toFixed(2),lo:+(+j.longitude).toFixed(2),name:j.city||"",src:"ip",t:Date.now()});});}
  function where(force){
    if(loc&&(loc.src==="city"||(!force&&loc.src==="gps"&&Date.now()-loc.t<6*3600e3)))return Promise.resolve(loc);
    return new Promise(res=>{
      const fallback=why=>{status=why;viaIP().then(res,()=>res(loc||null));};
      if(!navigator.geolocation)return fallback("This browser has no location access.");
      navigator.geolocation.getCurrentPosition(p=>res(saveLoc({la:+p.coords.latitude.toFixed(2),lo:+p.coords.longitude.toFixed(2),name:"",src:"gps",t:Date.now()})),
        e=>fallback(e.code===1?"Location access is blocked for this page.":"The browser could not get a location (is Windows location turned on?)."),
        {timeout:9000,maximumAge:30*60e3});});}
  /* what: Open-Meteo (current code, precipitation now and in the last hour) and wttr.in; the wetter answer wins */
  function conditions(L){
    const om=fetch("https://api.open-meteo.com/v1/forecast?latitude="+L.la+"&longitude="+L.lo+"&current=temperature_2m,weather_code,wind_speed_10m,precipitation,is_day&minutely_15=precipitation&past_minutely_15=4&forecast_minutely_15=1")
      .then(r=>r.json()).then(j=>{const c=j.current,cd=CODES[c.weather_code]||["cloudy",1,"Cloudy"],p=Math.max(c.precipitation||0,...((j.minutely_15||{}).precipitation||[0]).slice(-3));
        let k=cd[0],l=cd[1],desc=cd[2];if(p>0&&RANK[k]<RANK.rain){k="rain";l=p>2?2:1;desc=p>2?"Rain":"Light rain";}
        return {kind:k,lvl:l,desc,temp:c.temperature_2m,wind:c.wind_speed_10m,day:c.is_day};});
    const wt=fetch("https://wttr.in/"+L.la+","+L.lo+"?format=j1").then(r=>r.json()).then(j=>{const c=j.current_condition[0],m=WWO(c.weatherCode)||["cloudy",1];
        let [k,l]=m;if(+c.precipMM>0&&RANK[k]<RANK.rain){k="rain";l=1;}return {kind:k,lvl:l,desc:c.weatherDesc[0].value,temp:+c.temp_C,wind:+c.windspeedKmph};});
    return Promise.allSettled([om,wt]).then(([a,b])=>{const A=a.status==="fulfilled"?a.value:null,B=b.status==="fulfilled"?b.value:null;if(!A&&!B)throw 0;
      const w=!A?B:!B?A:(RANK[B.kind]>RANK[A.kind]?Object.assign({},A,{kind:B.kind,lvl:B.lvl,desc:B.desc}):A);w.lvl=Math.max(w.lvl,A&&B&&A.kind===B.kind?Math.max(A.lvl,B.lvl):w.lvl);return w;});}
  function fetchLive(force){
    if(mode!=="live"||busy)return;
    if(!force&&live&&Date.now()-live.t<10*60e3){apply();return;}
    if(!window.fetch){status="This browser can't fetch live weather.";apply();return;}
    busy=true;status="Finding your location…";if(!pk.hidden)paint();
    where(force).then(L=>{if(!L){busy=false;status+=" Type your city below.";apply();return;}
      if(!pk.hidden)paint();
      return conditions(L).then(w=>{live=Object.assign(w,{t:Date.now(),place:L.name||"",src:L.src});store.set("js1-wx-live",JSON.stringify(live));
          if(L.src!=="ip")status="";busy=false;apply();},
        ()=>{busy=false;status="Could not reach the weather services. Showing the last known weather.";apply();});});}
  function setCity(name){name=name.trim();if(!name)return;status="Looking up "+name+"…";paint();
    fetch("https://geocoding-api.open-meteo.com/v1/search?count=1&name="+encodeURIComponent(name)).then(r=>r.json()).then(j=>{const g=j.results&&j.results[0];
      if(!g){status="No place called “"+name+"” was found.";paint();return;}
      saveLoc({la:+g.latitude.toFixed(2),lo:+g.longitude.toFixed(2),name:g.name+(g.admin1?", "+g.admin1:""),src:"city",t:Date.now()});
      status="";if(mode!=="live"){mode="live";store.set("js1-wx","live");}fetchLive(true);},()=>{status="Could not reach the place search.";paint();});}

  /* picker: the weather button in the nav opens it */
  const tb=document.getElementById("theme");let btn=null;
  const pk=document.createElement("div");pk.className="thm";pk.hidden=true;pk.setAttribute("role","dialog");pk.setAttribute("aria-label","Weather");document.body.appendChild(pk);
  const SRC={city:"your city",gps:"your location",ip:"approximate, from your network"};
  function paint(){
    pk.innerHTML='<h4>Weather</h4><div class="thm-g wx-g">'+KINDS.map(([id,n,ic])=>'<button type="button" data-wx="'+id+'" aria-pressed="'+(id===mode)+'"><b>'+ic+"</b>"+n+"</button>").join("")+"</div>"+
      '<div class="thm-row wx-lv"><span>Intensity</span><span>'+[[0,"Auto"],[1,"Light"],[2,"Medium"],[3,"Heavy"]].map(([v,n])=>'<button type="button" data-lv="'+v+'" aria-pressed="'+(v===lv)+'">'+n+"</button>").join("")+"</span></div>"+
      '<form class="wx-city"><input type="text" placeholder="Your city, e.g. Nellore" aria-label="Your city" value="'+(loc&&loc.src==="city"?esc(loc.name.split(",")[0]):"")+'" spellcheck="false"><button type="submit">Set</button></form>'+
      '<p class="wx-st">'+(mode==="live"?(live?"<b>Live:</b> "+esc(live.desc)+", "+Math.round(live.temp)+"°C, wind "+Math.round(live.wind)+" km/h"+(live.place?" in <b>"+esc(live.place)+"</b>":"")+
          " · "+new Date(live.t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+' · <a href="#" data-rf="1">refresh</a>':"")+
        (loc?'<br><span style="font-size:.74rem">Place: '+(loc.name?esc(loc.name)+" · ":"")+SRC[loc.src]+(loc.src==="city"?' · <a href="#" data-gps="1">use my location instead</a>':"")+"</span>":"")+
        (status?"<br>"+esc(status):"")+'<br><span style="font-size:.74rem">Open-Meteo + wttr.in, refreshed every 10 min. Sound starts after your first click; 🔊 mutes it.</span>'
        :"Showing <b>"+label()+"</b>. Choose <b>Live</b> to follow the real weather.")+
      (reduce.matches?"<br>Your system asks for reduced motion, so rain and snow are not animated.":"")+"</p>";}
  if(tb){btn=document.createElement("button");btn.id="wxBtn";btn.type="button";btn.setAttribute("aria-label","Weather");btn.setAttribute("aria-expanded","false");tb.before(btn);
    const close=()=>{pk.hidden=true;btn.setAttribute("aria-expanded","false");};
    btn.onclick=e=>{e.stopPropagation();if(!pk.hidden)return close();paint();const r=btn.getBoundingClientRect();pk.style.top=(r.bottom+8)+"px";pk.style.right=Math.max(12,innerWidth-r.right)+"px";pk.hidden=false;btn.setAttribute("aria-expanded","true");};
    pk.addEventListener("submit",e=>{e.preventDefault();const i=$("input",pk);if(i)setCity(i.value);});
    pk.addEventListener("click",e=>{const a=e.target.closest("[data-rf],[data-gps]");if(a){e.preventDefault();if(a.dataset.gps){loc=null;store.set("js1-wx-loc","");}fetchLive(true);return;}
      const b=e.target.closest("button");if(!b||b.type==="submit")return;if(b.dataset.wx)set(b.dataset.wx);else if(b.dataset.lv!=null){lv=+b.dataset.lv;store.set("js1-wx-lvl",String(lv));apply();}});
    document.addEventListener("click",e=>{if(!pk.hidden&&!e.target.closest(".thm,#wxBtn"))close();});
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!pk.hidden){close();btn.focus();}});
    addEventListener("resize",close,{passive:true});}
  function set(m){mode=m;store.set("js1-wx",m);status="";apply();if(m==="live")fetchLive(false);}
  size();addEventListener("resize",()=>{size();},{passive:true});
  document.addEventListener("visibilitychange",()=>{document.hidden?stop():start();sound();});
  document.addEventListener("sfxready",sound);
  document.addEventListener("themechange",()=>setTimeout(apply,50));reduce.addEventListener("change",apply);
  apply();if(mode==="live")setTimeout(()=>fetchLive(false),800);
  setInterval(()=>{if(mode==="live"&&!document.hidden)fetchLive(false);},3*60e3);
  setInterval(sound,10*60e3);
  return {set,city:setCity,get mode(){return mode;},get live(){return live;},KINDS};
})();

/* sky (v13): a soft sky behind the page that follows the real time of day, blended minute by minute (dawn pink-orange, day blue,
   dusk orange-violet, night navy). At night in dark themes: three layers of twinkling stars and a shooting star every 8–16 s.
   In the evening and at night: fireflies drifting around the trees. All movement is transform/opacity (compositor only). */
(function(){
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sky=document.createElement("div");sky.id="sky2";sky.setAttribute("aria-hidden","true");
  sky.innerHTML='<div class="sk-g"></div><div class="sk-st s1"></div><div class="sk-st s2"></div><div class="sk-st s3"></div><i class="sk-shoot"></i><div class="sk-ff"></div>';
  document.body.prepend(sky);
  const stars=n=>Array.from({length:n},()=>Math.round(Math.random()*innerWidth)+"px "+Math.round(Math.random()*innerHeight*.62)+"px 0 "+(Math.random()<.18?1:0)+"px rgba(255,255,255,"+(.45+Math.random()*.55).toFixed(2)+")").join(",");
  const seedStars=()=>$$(".sk-st",sky).forEach((s,i)=>s.style.boxShadow=stars(36+i*22));
  /* [hour, top colour, horizon colour] — blended linearly between neighbours */
  const K=[[0,"#0b1026","#1b1f45"],[4.6,"#0b1026","#221d52"],[5.6,"#3b2a5c","#f59e8b"],[6.8,"#7aa7d9","#fcd5b5"],[8.2,"#8ec5ff","#dbeafe"],[16.3,"#8ec5ff","#dbeafe"],
    [17.6,"#6d5ba8","#fdba74"],[18.6,"#3b2a5c","#fb7185"],[19.6,"#141a3a","#3b2a5c"],[21,"#0b1026","#1b1f45"],[24,"#0b1026","#1b1f45"]];
  const hx=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),mix=(a,b,t)=>"rgb("+hx(a).map((v,i)=>Math.round(v+(hx(b)[i]-v)*t)).join(",")+")";
  const isDark=()=>{const m=getComputedStyle(document.body).backgroundColor.match(/\d+/g)||[255,255,255];return (+m[0]*.3+ +m[1]*.59+ +m[2]*.11)<110;};
  let night=false,eve=false;
  function upd(){const d=new Date(),h=d.getHours()+d.getMinutes()/60;let i=0;while(i<K.length-2&&h>=K[i+1][0])i++;
    const [h0,a0,b0]=K[i],[h1,a1,b1]=K[i+1],t=Math.max(0,Math.min(1,(h-h0)/(h1-h0))),dk=isDark();
    sky.style.setProperty("--sk1",mix(a0,a1,t));sky.style.setProperty("--sk2",mix(b0,b1,t));
    night=h<5.3||h>=19.8;eve=h>=17.8||h<4.5;
    sky.style.setProperty("--ska",dk?(night?.62:.2):(night?.12:.3));
    sky.classList.toggle("night",night&&dk);sky.classList.toggle("eve",eve&&!still);
    if(eve&&!still&&!$(".ff",sky))fireflies();}
  /* shooting stars at night */
  const shoot=$(".sk-shoot",sky);
  function shootLoop(){setTimeout(()=>{if(sky.classList.contains("night")&&!document.hidden&&!still){const x=innerWidth*(.25+Math.random()*.6),y=innerHeight*(.05+Math.random()*.25),a=-(18+Math.random()*22);
      shoot.style.left=x+"px";shoot.style.top=y+"px";
      shoot.animate([{transform:"rotate("+a+"deg) translateX(0) scaleX(.2)",opacity:0},{opacity:1,offset:.15},{transform:"rotate("+a+"deg) translateX(-520px) scaleX(1)",opacity:0}],{duration:1100,easing:"cubic-bezier(.3,0,.7,1)"});}
    shootLoop();},8000+Math.random()*8000);}
  /* fireflies: glowing dots wandering near the trees (or along the bottom on narrow screens) */
  function fireflies(){const box=$(".sk-ff",sky),wide=innerWidth>=1200,zones=wide?[[272,472],[innerWidth-200,innerWidth-10]]:[[0,innerWidth]];
    for(let i=0;i<14;i++){const z=zones[i%zones.length],x=z[0]+Math.random()*(z[1]-z[0]),y=innerHeight*(.45+Math.random()*.5),e=document.createElement("i");e.className="ff";
      e.style.left=x+"px";e.style.top=y+"px";e.style.animationDelay=(-Math.random()*3).toFixed(2)+"s";box.appendChild(e);
      const P=Array.from({length:5},()=>[(Math.random()-.5)*120,(Math.random()-.5)*90]);
      e.animate([{transform:"translate(0px,0px)"},...P.map(([a,b])=>({transform:"translate("+a.toFixed(0)+"px,"+b.toFixed(0)+"px)"})),{transform:"translate(0px,0px)"}],
        {duration:14000+Math.random()*9000,iterations:Infinity,easing:"ease-in-out",delay:-Math.random()*9000});}}
  seedStars();upd();shootLoop();
  setInterval(upd,60000);document.addEventListener("themechange",()=>setTimeout(upd,60));
  let rs=0;addEventListener("resize",()=>{clearTimeout(rs);rs=setTimeout(seedStars,300);},{passive:true});
})();

/* Halloween mode (v13): automatic from 21 Oct to 1 Nov (js1-halloween: "" auto, "1" on, "0" off; Ctrl+K toggles it). Glowing
   jack-o'-lanterns at the foot of the trees, flocks of bats crossing the sky every 16–28 s, a spider bobbing on its thread, and the
   fire rider rides in by himself once per visit (25 s after the first page). Everything is transform/opacity on small elements. */
const HALLOWEEN=(function(){
  const still=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,x){try{localStorage.setItem(k,x)}catch(e){}}};
  const auto=()=>{const d=new Date(),m=d.getMonth(),day=d.getDate();return (m===9&&day>=21)||(m===10&&day<=1);};
  const mode=()=>store.get("js1-halloween")||"";
  const active=()=>mode()==="1"||(mode()===""&&auto());
  const PUMP='<svg viewBox="0 0 64 56"><ellipse cx="32" cy="50" rx="26" ry="5" fill="rgba(0,0,0,.25)"/><path d="M32 12 q-1 -7 5 -10" stroke="#4d7c0f" stroke-width="3.2" fill="none" stroke-linecap="round"/>'+
    '<ellipse cx="19" cy="31" rx="14" ry="18" fill="#c2410c"/><ellipse cx="45" cy="31" rx="14" ry="18" fill="#c2410c"/><ellipse cx="32" cy="31" rx="15.5" ry="20" fill="#f97316"/>'+
    '<path d="M24 13 q-4 18 0 37 M40 13 q4 18 0 37" stroke="#c2410c" stroke-width="1.4" fill="none" opacity=".7"/>'+
    '<g class="pk-face"><path d="M18 26 l7 -7 l4 7z"/><path d="M46 26 l-7 -7 l-4 7z"/><path d="M30 31 l2 -4 l2 4z"/><path d="M15 36 q17 15 34 0 l-4 2.5 l-3 -3 l-3.5 3.5 l-3 -3.5 l-3.5 3.5 l-3 -3.5 l-3.5 3.5 l-3 -3z"/></g></svg>';
  const BAT='<svg viewBox="0 0 60 26"><g class="hb-w"><path d="M30 13 C22 2 12 0 2 6 C8 8 10 12 9 16 C14 13 19 15 21 19 C24 15 27 15 30 17Z"/><path d="M30 13 C38 2 48 0 58 6 C52 8 50 12 51 16 C46 13 41 15 39 19 C36 15 33 15 30 17Z"/></g>'+
    '<ellipse cx="30" cy="15" rx="4.2" ry="6"/><path d="M27 9 l1 -4 l2 3 l2 -3 l1 4z"/><circle cx="28.5" cy="12" r=".9" fill="#f87171"/><circle cx="31.5" cy="12" r=".9" fill="#f87171"/></svg>';
  const SPIDER='<svg viewBox="0 0 40 34"><g stroke="#1f1a2e" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M14 16 q-8 -6 -12 -2 M14 19 q-9 -1 -12 4 M15 22 q-7 4 -9 10 M16 13 q-6 -9 -10 -9"/>'+
    '<path d="M26 16 q8 -6 12 -2 M26 19 q9 -1 12 4 M25 22 q7 4 9 10 M24 13 q6 -9 10 -9"/></g><ellipse cx="20" cy="19" rx="7" ry="8" fill="#1f1a2e"/><circle cx="20" cy="10" r="4.5" fill="#1f1a2e"/>'+
    '<circle cx="18.4" cy="9.6" r="1" fill="#f87171"/><circle cx="21.6" cy="9.6" r="1" fill="#f87171"/></svg>';
  let root=null,batT=0;
  /* touch / click reactions (v13.1): a pumpkin bounces, flares and lets a little ghost out with an evil laugh; the spider drops on its
     thread and climbs back; a bat squeaks, flips and darts away */
  const GHOST='<svg viewBox="-14 -14 128 148"><ellipse cx="50" cy="62" rx="58" ry="66" fill="rgba(170,255,205,.2)"/><path d="M10 62 Q10 8 50 8 Q90 8 90 62 L90 112 Q82 101 74 112 Q66 123 58 112 Q50 101 42 112 Q34 123 26 112 Q18 101 10 112 Z" fill="#eef4ff" fill-opacity=".94"/>'+
    '<ellipse cx="36" cy="52" rx="8" ry="12" fill="#140a22"/><ellipse cx="64" cy="52" rx="8" ry="12" fill="#140a22"/><ellipse cx="50" cy="82" rx="9" ry="13" fill="#140a22"/></svg>';
  const SPOOKY=["#f97316","#a855f7","#22c55e","#facc15","#fb923c"];
  function poke(e){const t=e.target;
    const pk=t.closest(".hw-pk");
    if(pk){if(pk._busy)return;pk._busy=1;setTimeout(()=>{pk._busy=0;},1400);const r=pk.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height*.45;
      pk.classList.add("lit");setTimeout(()=>pk.classList.remove("lit"),1700);
      pk.animate([{transform:"scale(1,1)"},{transform:"scale(1.2,.8)"},{transform:"translateY(-16px) scale(.9,1.15)"},{transform:"scale(1.06,.94)"},{transform:"scale(1,1)"}],{duration:680,easing:"ease-out",composite:"add"});
      FX.confetti(cx,cy,28,{cols:SPOOKY,speed:320});
      const g=document.createElement("div");g.className="hw-ghost";g.innerHTML=GHOST;g.style.left=(cx-24)+"px";g.style.top=(cy-44)+"px";root.appendChild(g);
      g.animate([{transform:"translate(0px,24px) scale(.2)",opacity:0},{transform:"translate(-8px,-46px) scale(1)",opacity:1,offset:.28},{transform:"translate(16px,-140px) scale(1.05)",opacity:.9,offset:.68},{transform:"translate(-10px,-220px) scale(.9)",opacity:0}],
        {duration:2300,easing:"ease-out"}).onfinish=()=>g.remove();
      if(window.SFX&&SFX.laugh)SFX.laugh();return;}
    const sp=t.closest(".hw-spider");
    if(sp){if(sp._busy)return;sp._busy=1;const d=Math.round(innerHeight*.42);
      sp.animate([{transform:"translateY(0px)"},{transform:"translateY("+d+"px)",offset:.24},{transform:"translateY("+(d-34)+"px) rotate(14deg)",offset:.42},{transform:"translateY("+(d-6)+"px) rotate(-12deg)",offset:.58},{transform:"translateY(0px)"}],
        {duration:2700,easing:"cubic-bezier(.3,.7,.4,1)",composite:"add"}).onfinish=()=>{sp._busy=0;};
      if(window.SFX)SFX.squeak();return;}
    const bat=t.closest(".hw-bat");
    if(bat){const r=bat.getBoundingClientRect();bat.getAnimations().forEach(a=>a.cancel());const p="translate("+r.left.toFixed(0)+"px,"+r.top.toFixed(0)+"px)";bat.style.transform=p;
      FX.confetti(r.left+r.width/2,r.top+r.height/2,12,{cols:["#a855f7","#f87171","#facc15"],speed:200});
      bat.animate([{transform:p+" rotate(0deg)"},{transform:"translate("+(r.left+40).toFixed(0)+"px,"+(r.top-70).toFixed(0)+"px) rotate(360deg) scale(1.3)",offset:.4},
        {transform:"translate("+(r.left+140).toFixed(0)+"px,-140px) rotate(720deg) scale(.6)"}],{duration:900,easing:"ease-in",fill:"forwards"}).onfinish=()=>bat.remove();
      if(window.SFX)SFX.squeak();}}
  function on(){if(root||still())return;root=document.createElement("div");root.id="hween";root.setAttribute("aria-hidden","true");
    const wide=innerWidth>=1200,spots=wide?[["left:300px;bottom:2px",54],["left:410px;bottom:0",42],["right:58px;bottom:4px",60],["right:150px;bottom:0",44]]:[["left:8px;bottom:4px",46]];
    root.innerHTML=spots.map(([pos,w],i)=>'<div class="hw-pk" style="'+pos+';width:'+w+'px;animation-delay:'+(-i*.7)+'s"><div class="hw-glow"></div>'+PUMP+"</div>").join("")+
      '<div class="hw-spider" style="right:'+(wide?250:30)+'px"><i class="hw-thread"></i>'+SPIDER+"</div>";
    document.body.appendChild(root);root.addEventListener("click",poke);document.documentElement.classList.add("halloween");batLoop(2500);riderOnce();ghostsOn();}
  /* v17 roaming ghosts (Halloween mode): 4 spectres drift behind the page (canvas #hwg, z −1, ~30 fps), wandering on their own and
     shying away from the mouse pointer with a wail face; hidden while the fire rider rides (he brings his own) */
  let gcv=null,graf=0;
  function ghostsOn(){if(gcv||!window.ghostPaint)return;gcv=document.createElement("canvas");gcv.id="hwg";gcv.setAttribute("aria-hidden","true");document.body.appendChild(gcv);
    const c=gcv.getContext("2d");let W=0,H=0,last=0,acc=0,px=-999,py=-999,light=false,lt=0;
    const size=()=>{if(!gcv)return;W=gcv.width=innerWidth;H=gcv.height=innerHeight;};size();addEventListener("resize",size,{passive:true});
    addEventListener("pointermove",e=>{px=e.clientX;py=e.clientY;},{passive:true});
    const R=(a,b)=>a+Math.random()*(b-a),mk=()=>({x:R(W*.1,W*.9),y:R(H*.15,H*.8),vx:0,vy:0,tx:R(0,W),ty:R(0,H),tt:0,s:R(.7,1.1),ph:R(0,6.28),t:0,f:1,m:0,ar:.3,tint:Math.random()<.4,al:0});
    const G=Array.from({length:4},mk);
    const loop=now=>{if(!gcv)return;graf=requestAnimationFrame(loop);const dt=Math.min(.1,(now-(last||now))/1000);last=now;acc+=dt;if(acc<1/30)return;const d=acc;acc=0;
      if(document.hidden)return;lt-=d;if(lt<=0){lt=2;const m=getComputedStyle(document.body).backgroundColor.match(/\d+/g)||[0,0,0];light=(+m[0]*.3+ +m[1]*.59+ +m[2]*.11)>=110;}
      c.clearRect(0,0,W,H);if(document.documentElement.classList.contains("cine"))return;
      for(const g of G){g.t+=d;g.al=Math.min(1,g.al+d*.4);let tx=g.tx,ty=g.ty,mx=55*g.s;const dx=g.x-px,dy=g.y-py,dr=Math.hypot(dx,dy),sc=dr<170;
        if(sc){tx=g.x+dx/(dr||1)*220;ty=g.y+dy/(dr||1)*220;mx=260;}
        else{g.tt-=d;if(g.tt<=0||Math.hypot(g.tx-g.x,g.ty-g.y)<30){g.tt=R(3,6);g.tx=R(W*.05,W*.95);g.ty=R(H*.1,H*.85);}}
        const ex=tx-g.x,ey=ty-g.y,el=Math.hypot(ex,ey)||1,sp=Math.min(mx,el*1.5),k=Math.min(1,d*(sc?5:1.2));g.vx+=(ex/el*sp-g.vx)*k;g.vy+=(ey/el*sp-g.vy)*k;g.x+=g.vx*d;g.y+=g.vy*d;
        if(g.x<-90)g.x=W+70;if(g.x>W+90)g.x=-70;if(g.y<-90)g.y=H+50;if(g.y>H+90)g.y=-50;
        g.m+=((sc?1:.1)-g.m)*Math.min(1,d*5);g.ar+=((sc?1.25:.3)-g.ar)*Math.min(1,d*4);
        const want=g.vx>8?1:g.vx<-8?-1:g.f>=0?1:-1;g.f+=(want-g.f)*Math.min(1,d*3);
        ghostPaint(c,g.x,g.y+Math.sin(g.t*2+g.ph)*6,13*g.s,g.f,g.t+g.ph,g.al*(light?.5:.6),{lean:Math.hypot(g.vx,g.vy)/220,mouth:g.m,arms:g.ar,ph:g.ph,tint:g.tint,light});}};
    graf=requestAnimationFrame(loop);}
  function ghostsOff(){if(!gcv)return;cancelAnimationFrame(graf);gcv.remove();gcv=null;}
  function off(){if(!root)return;root.remove();root=null;clearTimeout(batT);ghostsOff();document.documentElement.classList.remove("halloween");}
  function flock(){if(!root||document.hidden)return;const n=3+Math.floor(Math.random()*3),dir=Math.random()<.5?1:-1,y0=innerHeight*(.1+Math.random()*.3);
    for(let i=0;i<n;i++){const b=document.createElement("div");b.className="hw-bat";b.innerHTML=BAT;const s=.7+Math.random()*.6;b.style.width=(40*s).toFixed(0)+"px";root.appendChild(b);
      const x0=dir>0?-80:innerWidth+80,x1=dir>0?innerWidth+80:-80,yy=y0+(Math.random()-.5)*90,K=[];
      for(let k=0;k<=12;k++){const u=k/12;K.push({transform:"translate("+(x0+(x1-x0)*u).toFixed(0)+"px,"+(yy+Math.sin(u*Math.PI*3+i)*40).toFixed(0)+"px) scaleX("+(dir>0?1:-1)+")"});}
      b.animate(K,{duration:6500+Math.random()*2500,delay:i*260+Math.random()*200,easing:"linear",fill:"both"}).onfinish=()=>b.remove();}
    if(window.SFX&&SFX.squeak&&Math.random()<.6)setTimeout(()=>SFX.squeak(),800);}
  function batLoop(first){clearTimeout(batT);batT=setTimeout(()=>{flock();batLoop();},first||16000+Math.random()*12000);}
  function riderOnce(){let seen=null;try{seen=sessionStorage.getItem("js1-hw-rider");}catch(e){}if(seen)return;
    setTimeout(()=>{if(!root||document.hidden)return;try{sessionStorage.setItem("js1-hw-rider","1");}catch(e){}const g=document.getElementById("ghostBtn");if(g)g.click();},25000);}
  function apply(){active()?on():off();}
  function set(m){store.set("js1-halloween",m);apply();}
  apply();
  return {set,get on(){return !!root;},get mode(){return mode();}};
})();

/* festivals + sky play (v15). One canvas #fest (fireworks, sky lanterns, snow, the sleigh, shooting stars, lightning) shared by:
   Diwali mode (auto ±5 days around Diwali; js1-diwali "" auto / "1" / "0"), Christmas mode (auto 15 Dec – 1 Jan; js1-xmas),
   click-the-sky (empty background: fireworks or a shooting star at night, lightning in a storm, a sparkle by day) and the "java"
   easter egg (a coffee cup whose steam spells Java). Canvas work stops when nothing is in flight. Ctrl+K toggles both modes. */
const FEST=(function(){
  const still=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,x){try{localStorage.setItem(k,x)}catch(e){}}};
  const R=(a,b)=>a+Math.random()*(b-a);
  const cv=document.createElement("canvas");cv.id="fest";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);
  const ctx=cv.getContext("2d");let W=0,H=0,dpr=1,raf=0,last=0;const P=[],L=[],X=[];
  function size(){dpr=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}
  size();addEventListener("resize",size,{passive:true});
  const kick=()=>{if(!raf&&!document.hidden)raf=requestAnimationFrame(loop);};
  function loop(now){const dt=Math.min(.05,(now-(last||now))/1000);last=now;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    /* sparks and rockets (additive) */
    ctx.globalCompositeOperation="lighter";
    for(let i=P.length-1;i>=0;i--){const p=P[i];p.t+=dt;
      if(p.k==="rk"){const u=Math.min(1,p.t/p.l),x=p.x0+(p.x1-p.x0)*u,y=p.y0+(p.y1-p.y0)*(1-Math.pow(1-u,2.2));
        for(let j=0;j<6;j++){const v=u-j*.015;if(v<0)break;const tx=p.x0+(p.x1-p.x0)*v,ty=p.y0+(p.y1-p.y0)*(1-Math.pow(1-v,2.2));ctx.fillStyle="rgba(255,220,160,"+(.5-j*.08).toFixed(2)+")";ctx.beginPath();ctx.arc(tx,ty,2.2-j*.25,0,6.2832);ctx.fill();}
        if(u>=1){P.splice(i,1);burst(x,y,p.cols);}continue;}
      p.vy+=p.g*dt;p.vx*=1-1.6*dt;p.vy*=1-1.2*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const f=p.t/p.l;if(f>=1){P.splice(i,1);continue;}
      const a=(1-f)*(p.tw?(.5+.5*Math.sin(p.t*40+i)):1);ctx.fillStyle="hsla("+p.h+",100%,"+(62+20*(1-f))+"%,"+a.toFixed(3)+")";ctx.beginPath();ctx.arc(p.x,p.y,p.r*(1-.5*f),0,6.2832);ctx.fill();}
    ctx.globalCompositeOperation="source-over";
    /* sky lanterns: warm paper lanterns rising and swaying */
    for(let i=L.length-1;i>=0;i--){const l=L[i];l.t+=dt;l.y-=l.vy*dt;l.x+=Math.sin(l.t*.8+l.ph)*12*dt;if(l.y<-80){L.splice(i,1);continue;}
      const fl=.85+.15*Math.sin(l.t*9+l.ph)*Math.sin(l.t*5.3),s=l.sz,g=ctx.createRadialGradient(l.x,l.y,0,l.x,l.y,s*3.2);
      g.addColorStop(0,"rgba(255,170,60,"+(.35*fl).toFixed(3)+")");g.addColorStop(1,"rgba(255,140,40,0)");ctx.fillStyle=g;ctx.fillRect(l.x-s*3.2,l.y-s*3.2,s*6.4,s*6.4);
      const bg=ctx.createLinearGradient(0,l.y-s,0,l.y+s);bg.addColorStop(0,"rgba(255,120,40,.95)");bg.addColorStop(1,"rgba(255,210,110,"+(.95*fl).toFixed(2)+")");
      ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(l.x-s*.55,l.y-s);ctx.quadraticCurveTo(l.x-s*.9,l.y,l.x-s*.6,l.y+s);ctx.lineTo(l.x+s*.6,l.y+s);ctx.quadraticCurveTo(l.x+s*.9,l.y,l.x+s*.55,l.y-s);ctx.closePath();ctx.fill();
      ctx.fillStyle="rgba(255,250,200,"+fl.toFixed(2)+")";ctx.beginPath();ctx.ellipse(l.x,l.y+s*.85,s*.18,s*.12,0,0,6.2832);ctx.fill();}
    /* extras (snow, sleigh, stars, bolts): each returns false when done */
    for(let i=X.length-1;i>=0;i--)if(X[i](dt,ctx,W,H)===false)X.splice(i,1);
    if(P.length||L.length||X.length)raf=requestAnimationFrame(loop);else{raf=0;last=0;ctx.clearRect(0,0,W,H);}}
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)kick();});
  const PAL=[[0,40,330],[45,190,280],[120,200,60],[200,320,30],[30,50,60]];
  function burst(x,y,hues){hues=hues||PAL[Math.floor(Math.random()*PAL.length)];const n=90,sp=R(160,260),ring=Math.random()<.4;
    for(let i=0;i<n;i++){const a=i/n*6.2832+R(-.05,.05),v=ring?sp:sp*R(.35,1);P.push({k:"s",x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:70,t:0,l:R(1.1,1.8),r:R(1.4,2.4),h:hues[i%hues.length],tw:Math.random()<.35});}
    if(window.SFX&&SFX.pop)SFX.pop(.6+Math.random()*.4);kick();}
  function firework(x,y,hues){if(still())return burst(x,y,hues);P.push({k:"rk",x0:x+R(-60,60),y0:H+10,x1:x,y1:y,t:0,l:R(.8,1.1),cols:hues});if(window.SFX&&SFX.whoosh)SFX.whoosh();kick();}
  function lantern(){if(still())return;L.push({x:R(W*.05,W*.95),y:H+40,vy:R(26,44),ph:R(0,6.28),sz:R(10,17),t:0});kick();}
  function star(x,y){const o={x:x,y:y,t:0,dx:R(380,520)*(Math.random()<.5?-1:1),dy:R(160,240)};
    X.push((dt,c)=>{o.t+=dt;const u=o.t/.9;if(u>=1)return false;const px=o.x+o.dx*u,py=o.y+o.dy*u,tx=px-o.dx*.18,ty=py-o.dy*.18,g=c.createLinearGradient(tx,ty,px,py);
      g.addColorStop(0,"rgba(255,255,255,0)");g.addColorStop(1,"rgba(255,255,255,"+(1-u).toFixed(2)+")");c.strokeStyle=g;c.lineWidth=2.2;c.lineCap="round";c.beginPath();c.moveTo(tx,ty);c.lineTo(px,py);c.stroke();
      c.fillStyle="rgba(220,235,255,"+(1-u).toFixed(2)+")";c.beginPath();c.arc(px,py,2.6,0,6.2832);c.fill();});kick();}
  function bolt(x,y){const pts=[[x+R(-60,60),0]];let cx=pts[0][0],cy=0;while(cy<y){cy+=R(18,40);cx+=(x-cx)*.15+R(-24,24);pts.push([cx,Math.min(cy,y)]);}const o={t:0};
    if(window.SFX&&SFX.thunder)setTimeout(()=>SFX.thunder(.8),220);
    X.push((dt,c,w,h)=>{o.t+=dt;if(o.t>.6)return false;const a=1-o.t/.6;c.fillStyle="rgba(220,225,255,"+(.25*a).toFixed(3)+")";c.fillRect(0,0,w,h);
      c.strokeStyle="rgba(200,180,255,"+(.5*a).toFixed(2)+")";c.lineWidth=8;c.lineJoin="round";c.beginPath();pts.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.stroke();
      c.strokeStyle="rgba(255,255,255,"+a.toFixed(2)+")";c.lineWidth=2.4;c.stroke();});kick();}
  /* ---------- Diwali ---------- */
  const DIWALI={2026:[10,8],2027:[9,29],2028:[9,17],2029:[10,5],2030:[9,26]};
  const near=(m,d,days)=>{const now=new Date(),t=new Date(now.getFullYear(),m,d);return Math.abs(now-t)<=days*864e5;};
  const autoD=()=>{const y=new Date().getFullYear(),d=DIWALI[y];return d?near(d[0],d[1],5):false;};
  const autoX=()=>{const n=new Date(),m=n.getMonth(),d=n.getDate();return (m===11&&d>=15)||(m===0&&d<=1);};
  const on=(key,auto)=>{const v=store.get(key)||"";return v==="1"||(v===""&&auto());};
  const DIYA='<svg viewBox="0 0 40 34"><defs><radialGradient id="dyG" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#d9733a"/><stop offset="1" stop-color="#7a2e10"/></radialGradient></defs>'+
    '<ellipse cx="20" cy="30" rx="15" ry="3" fill="rgba(0,0,0,.3)"/><path d="M3 18 Q20 34 37 18 Q30 22 20 22 Q10 22 3 18Z" fill="url(#dyG)"/><path d="M3 18 Q20 24 37 18" stroke="#f6c26b" stroke-width="1.4" fill="none"/>'+
    '<ellipse cx="20" cy="18.5" rx="17" ry="3.2" fill="#5a1f0a"/><g class="dy-f"><path d="M20 3 C26 10 24 16 20 18 C16 16 14 10 20 3Z" fill="#ffb02e"/><path d="M20 8 C23 12 22 16 20 17 C18 16 17 12 20 8Z" fill="#fff4b0"/></g></svg>';
  const RANGOLI=(()=>{const c=["#e11d48","#f59e0b","#10b981","#3b82f6","#a855f7","#f97316"];let s='<svg viewBox="-100 -100 200 200">';
    for(let k=0;k<4;k++){const n=8+k*4,r=24+k*20;for(let i=0;i<n;i++){const a=i/n*6.2832,x=Math.cos(a)*r,y=Math.sin(a)*r;s+='<path class="rg-p" d="M0 0 Q '+(Math.cos(a-.25)*r*.6).toFixed(1)+' '+(Math.sin(a-.25)*r*.6).toFixed(1)+' '+x.toFixed(1)+' '+y.toFixed(1)+' Q '+(Math.cos(a+.25)*r*.6).toFixed(1)+' '+(Math.sin(a+.25)*r*.6).toFixed(1)+' 0 0" fill="'+c[(i+k)%c.length]+'" fill-opacity=".85" stroke="#fff7e6" stroke-width=".8" style="--d:'+((k*n+i)*.03).toFixed(2)+'s"/>';}}
    s+='<circle r="12" fill="#facc15" stroke="#fff7e6" stroke-width="1.5"/><circle r="5" fill="#e11d48"/></svg>';return s;})();
  let dRoot=null,dLow=null,dT=0;
  function diwaliOn(){if(dRoot||still())return;dRoot=document.createElement("div");dRoot.id="diwali";dRoot.setAttribute("aria-hidden","true");
    const pts=[...(window.TREE&&TREE.perches?TREE.perches():[]),...(window.TREE&&TREE.perchesL?TREE.perchesL():[])].filter((p,i)=>i%2===0).slice(0,14);
    const gnd=[];for(let i=0;i<10;i++)gnd.push([W*(.08+.84*i/9),H-14]);
    const dy=([x,y],i)=>'<div class="dy" style="left:'+(x-14).toFixed(0)+'px;top:'+(y-24).toFixed(0)+'px;animation-delay:'+(-i*.37).toFixed(2)+'s">'+DIYA+"</div>";
    /* tree diyas sit over the trees; the ground row and the rangoli go behind the page content */
    dRoot.innerHTML=pts.map(dy).join("");dLow=document.createElement("div");dLow.id="diwaliLow";dLow.setAttribute("aria-hidden","true");
    dLow.innerHTML=gnd.map(dy).join("")+'<div class="rangoli">'+RANGOLI+"</div>";
    document.body.appendChild(dRoot);document.body.appendChild(dLow);const tick=()=>{if(!dRoot)return;if(!document.hidden){lantern();if(Math.random()<.45)firework(R(W*.15,W*.85),R(H*.12,H*.4));}dT=setTimeout(tick,R(2600,5200));};dT=setTimeout(tick,1200);}
  function diwaliOff(){if(!dRoot)return;dRoot.remove();dLow.remove();dRoot=dLow=null;clearTimeout(dT);}
  /* ---------- Christmas ---------- */
  let xRoot=null,xT=0,snow=null;
  function sleigh(){const dir=Math.random()<.5?1:-1,y0=H*R(.1,.22),o={t:0,dur:12};if(window.SFX&&SFX.bells)SFX.bells();
    X.push((dt,c,w)=>{o.t+=dt;const u=o.t/o.dur;if(u>=1)return false;const x=dir>0?-260+(w+520)*u:w+260-(w+520)*u,y=y0+Math.sin(u*6.2832)*18;
      c.save();c.translate(x,y);c.scale(dir,1);c.fillStyle="rgba(10,12,24,.92)";c.strokeStyle="rgba(10,12,24,.92)";c.lineCap="round";
      /* sleigh: curled runner, body, Santa */
      c.lineWidth=2.4;c.beginPath();c.moveTo(-70,10);c.lineTo(-10,10);c.quadraticCurveTo(4,10,2,0);c.stroke();
      c.beginPath();c.moveTo(-66,6);c.lineTo(-64,-10);c.quadraticCurveTo(-60,-18,-50,-16);c.lineTo(-20,-10);c.quadraticCurveTo(-12,-8,-14,6);c.closePath();c.fill();
      c.beginPath();c.arc(-48,-24,7,0,6.2832);c.fill();c.beginPath();c.moveTo(-54,-26);c.lineTo(-44,-38);c.lineTo(-40,-26);c.fill();c.fillStyle="rgba(255,255,255,.9)";c.beginPath();c.arc(-44,-38,1.8,0,6.2832);c.fill();c.fillStyle="rgba(10,12,24,.92)";
      c.lineWidth=1.2;c.beginPath();c.moveTo(-14,-6);c.lineTo(150,-14);c.stroke();
      /* four reindeer bounding */
      for(let k=0;k<4;k++){const rx=24+k*36,ry=-14+Math.sin(o.t*9+k)*3,g=Math.sin(o.t*9+k*1.3);c.beginPath();c.ellipse(rx,ry,11,5,0,0,6.2832);c.fill();
        c.lineWidth=2;c.beginPath();c.moveTo(rx+9,ry-2);c.lineTo(rx+14,ry-11);c.stroke();c.beginPath();c.ellipse(rx+16,ry-12,4,2.6,.3,0,6.2832);c.fill();
        c.lineWidth=1.1;c.beginPath();c.moveTo(rx+14,ry-14);c.lineTo(rx+11,ry-21);c.moveTo(rx+12,ry-18);c.lineTo(rx+8,ry-19);c.moveTo(rx+16,ry-14);c.lineTo(rx+18,ry-21);c.moveTo(rx+17,ry-18);c.lineTo(rx+21,ry-19);c.stroke();
        c.lineWidth=1.8;c.beginPath();c.moveTo(rx+6,ry+3);c.lineTo(rx+10+g*5,ry+11);c.moveTo(rx+3,ry+3);c.lineTo(rx+6-g*4,ry+11);c.moveTo(rx-6,ry+3);c.lineTo(rx-10-g*5,ry+11);c.moveTo(rx-3,ry+3);c.lineTo(rx-1+g*4,ry+11);c.stroke();
        if(k===3){c.fillStyle="rgba(255,60,50,"+(.7+.3*Math.sin(o.t*12)).toFixed(2)+")";c.beginPath();c.arc(rx+20,ry-12,2.2,0,6.2832);c.fill();c.fillStyle="rgba(10,12,24,.92)";}}
      /* a trail of glitter */
      c.restore();if(Math.random()<.5)P.push({k:"s",x:x-dir*60,y:y+8,vx:R(-20,20),vy:R(10,40),g:20,t:0,l:R(.6,1.2),r:R(1,1.8),h:R(40,60),tw:true});});kick();}
  function xmasOn(){if(xRoot||still())return;xRoot=document.createElement("div");xRoot.id="xmas";xRoot.setAttribute("aria-hidden","true");
    const pts=[...(window.TREE&&TREE.perches?TREE.perches():[]),...(window.TREE&&TREE.perchesL?TREE.perchesL():[])];const cols=["#ef4444","#facc15","#22c55e","#3b82f6","#f472b6"];
    xRoot.innerHTML=pts.map(([x,y],i)=>'<i class="xl" style="left:'+(x-3).toFixed(0)+'px;top:'+(y-2).toFixed(0)+'px;background:'+cols[i%cols.length]+';color:'+cols[i%cols.length]+';animation-delay:'+(-i*.29).toFixed(2)+'s"></i>').join("");
    document.body.appendChild(xRoot);
    const F=Array.from({length:90},()=>({x:R(0,W),y:R(-H,H),r:R(1,3),v:R(20,55),ph:R(0,6.28)}));
    snow=(dt,c,w,h)=>{if(!xRoot)return false;c.fillStyle="rgba(255,255,255,.85)";for(const f of F){f.y+=f.v*dt;f.x+=Math.sin(f.y*.02+f.ph)*12*dt;if(f.y>h+5){f.y=-5;f.x=R(0,w);}c.beginPath();c.arc(f.x,f.y,f.r,0,6.2832);c.fill();}};X.push(snow);
    const tick=()=>{if(!xRoot)return;if(!document.hidden)sleigh();xT=setTimeout(tick,R(28000,45000));};xT=setTimeout(tick,4000);kick();}
  function xmasOff(){if(!xRoot)return;xRoot.remove();xRoot=null;clearTimeout(xT);}
  function apply(){on("js1-diwali",autoD)?diwaliOn():diwaliOff();on("js1-xmas",autoX)?xmasOn():xmasOff();}
  setTimeout(apply,1500);
  /* ---------- click the sky ---------- */
  document.addEventListener("click",e=>{if(still()||e.defaultPrevented||e.button!==0)return;const t=e.target;
    if(!(t===document.body||t===document.documentElement||t.matches(".wrap,.wrap>section,.wrap>header,.band,#sky2,#jungle,#jungleL")))return;
    if(String(getSelection&&getSelection())!=="")return;
    const night=document.getElementById("sky2")&&document.getElementById("sky2").classList.contains("night"),storm=window.WX&&WX.mode==="storm";
    if(storm)bolt(e.clientX,e.clientY);else if(night||dRoot)Math.random()<.65?firework(e.clientX,e.clientY):star(e.clientX,e.clientY);
    else{for(let i=0;i<26;i++)P.push({k:"s",x:e.clientX,y:e.clientY,vx:R(-140,140),vy:R(-160,40),g:120,t:0,l:R(.5,.9),r:R(1.2,2.4),h:R(30,60),tw:true});kick();}});
  /* ---------- easter egg: type "java" ---------- */
  let typed="";
  document.addEventListener("keydown",e=>{if(e.target.closest&&e.target.closest("input,textarea,select,.CodeMirror,[contenteditable]"))return;if(e.key.length!==1)return;typed=(typed+e.key.toLowerCase()).slice(-4);if(typed==="java"){typed="";coffee();}});
  function coffee(){if(document.getElementById("java-egg"))return;const d=document.createElement("div");d.id="java-egg";d.setAttribute("aria-hidden","true");
    d.innerHTML='<svg viewBox="0 0 220 260"><defs><linearGradient id="cupG" x1="0" x2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset=".6" stop-color="#e2e8f0"/><stop offset="1" stop-color="#94a3b8"/></linearGradient></defs>'+
      '<g class="steam"><path d="M80 120 C60 90 100 80 80 50 C65 30 90 15 85 0"/><path d="M110 120 C90 90 130 80 110 50 C95 30 120 15 115 0"/><path d="M140 120 C120 90 160 80 140 50 C125 30 150 15 145 0"/></g>'+
      '<text x="110" y="70" text-anchor="middle" class="steam-t">Java</text>'+
      '<ellipse cx="110" cy="245" rx="92" ry="12" fill="rgba(0,0,0,.25)"/><path d="M40 130 L180 130 L168 230 Q110 250 52 230Z" fill="url(#cupG)"/><ellipse cx="110" cy="130" rx="70" ry="12" fill="#3b2314"/>'+
      '<path d="M178 150 Q215 150 210 185 Q205 212 170 205" stroke="#cbd5e1" stroke-width="12" fill="none"/><text x="110" y="200" text-anchor="middle" class="cup-t">☕ JAVA</text></svg>';
    document.body.appendChild(d);setTimeout(()=>{FX.confetti(innerWidth/2,innerHeight-160,40,{cols:["#3b2314","#6b3e1f","#a16207","#78350f"],speed:340});},700);
    if(window.SFX&&SFX.chirp)SFX.chirp(.6);if(window.MASCOT&&MASCOT.say)MASCOT.say("Fresh Java! ☕",true);setTimeout(()=>d.classList.add("out"),4200);setTimeout(()=>d.remove(),5200);}
  return {firework,burst,lantern,star,bolt,sleigh,apply,set(k,v){store.set(k==="diwali"?"js1-diwali":"js1-xmas",v);apply();},get diwali(){return !!dRoot;},get xmas(){return !!xRoot;}};
})();
window.FEST=FEST;

/* v22 scroll rider: on lesson pages a small flaming-skull rider rides along the bottom of the content column as the reading
   progress; the bar behind him burns. He faces the way you scroll, the wheels spin only while you scroll, and at the end of the
   page flames burst once. Hidden during the cinematic ride, in print, and below 700px. */
(function(){if(!/^l\d/.test(document.body.dataset.page||""))return;const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el=document.createElement("div");el.id="scrollRider";el.setAttribute("aria-hidden","true");
  el.innerHTML='<div class="sr-trail"><i></i></div><div class="sr-bike"><svg viewBox="0 0 48 32">'+
    '<g class="sr-fl"><path d="M25 9 C21 6 22 1 26 -2 C26 2 30 3 29 7Z" fill="#ff8a1e"/><path d="M26 8 C24 6 25 3 27 1 C27 4 29 5 28 7Z" fill="#ffd56a"/></g>'+
    '<g class="sr-w" style="transform-origin:10px 24px"><circle cx="10" cy="24" r="6" fill="none" stroke="#1b1b22" stroke-width="2.6"/><path d="M10 18V30M4 24H16" stroke="#7a1606" stroke-width="1"/></g>'+
    '<g class="sr-w" style="transform-origin:38px 24px"><circle cx="38" cy="24" r="6" fill="none" stroke="#1b1b22" stroke-width="2.6"/><path d="M38 18V30M32 24H44" stroke="#7a1606" stroke-width="1"/></g>'+
    '<path d="M10 24 L19 16 L31 16 L38 24 M31 16 L35 10" stroke="#2a2a33" stroke-width="2.2" fill="none" stroke-linecap="round"/>'+
    '<path d="M17 16 Q24 12 31 15 L29 18 L19 18Z" fill="#7f1d1d"/>'+
    '<path d="M21 15 L23 9 Q25 7 27 9 L29 12 L34 11" stroke="#14141a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+
    '<circle cx="26" cy="7" r="3.6" fill="#efe6d4"/><circle cx="25" cy="6.6" r="1" fill="#1a0b06"/><circle cx="27.4" cy="6.6" r="1" fill="#1a0b06"/>'+
    '<path d="M2 22 C-2 20 -4 23 -8 21 C-5 25 -1 26 2 25Z" fill="#ff7a18" class="sr-ex"/></svg></div>';
  document.body.appendChild(el);const tr=el.querySelector(".sr-trail"),bk=el.querySelector(".sr-bike");let last=scrollY,idle=0,done=false,q=0;
  function place(){q=0;const w=document.querySelector(".wrap>section")||document.querySelector(".wrap");if(!w)return;const b=w.getBoundingClientRect(),max=document.documentElement.scrollHeight-innerHeight,
      p=max>0?Math.min(1,Math.max(0,scrollY/max)):0,L=Math.max(8,b.left+8),Wd=Math.max(100,b.width-56);
    el.style.left=L+"px";el.style.width=Wd+"px";bk.style.transform="translateX("+(p*(Wd-56)).toFixed(1)+"px)";tr.style.transform="scaleX("+p.toFixed(4)+")";
    const d=scrollY-last;if(Math.abs(d)>1){el.classList.toggle("back",d<0);el.classList.add("moving");clearTimeout(idle);idle=setTimeout(()=>el.classList.remove("moving"),260);}last=scrollY;
    if(p>.995&&!done&&!still){done=true;const r=bk.getBoundingClientRect();if(window.FX)FX.confetti(r.left+20,r.top+10,40,{cols:["#ffd56a","#ff8a1e","#e2470f","#7a1606"],speed:300});if(window.SFX&&SFX.whoosh)SFX.whoosh();el.classList.add("fin");setTimeout(()=>el.classList.remove("fin"),1600);}
    if(p<.97)done=false;}
  const req=()=>{if(!q)q=requestAnimationFrame(place);};addEventListener("scroll",req,{passive:true});addEventListener("resize",req,{passive:true});place();
})();
window.RIDER=RIDER;window.WX=WX;window.HALLOWEEN=HALLOWEEN;window.FEST=FEST;
})();
