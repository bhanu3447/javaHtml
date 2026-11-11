"use strict";(function(){if(window.PYR)return;const BASE="https://cdn.jsdelivr.net/pyodide/v0.29.5/full/",VERSION="Python 3.13 · Pyodide 0.29.5",PRELUDE=String.raw`
def _pyrun(src, stdin_text, main, echo=True):
    # echo: write each line read by input() after its prompt, like a terminal (False for graded tasks: judges never echo input)
    import sys, io, builtins, traceback, importlib, os
    sys.dont_write_bytecode = True   # no stale .pyc (pytest's rewritten tests) when a file is edited and run again in the same second
    sys.stdin = io.StringIO(stdin_text)
    orig = builtins.input
    def _inp(prompt=""):
        sys.stdout.write(str(prompt))
        line = sys.stdin.readline()
        if not line:
            raise EOFError("EOF when reading a line (the input box has no more lines)")
        line = line.rstrip("\n")
        if echo:
            sys.stdout.write(line + "\n")
        return line
    builtins.input = _inp
    importlib.invalidate_caches()
    g = {"__name__": "__main__", "__builtins__": builtins, "__file__": main}
    try:
        exec(compile(src, main, "exec"), g)
        return None
    except SystemExit as e:
        return None if e.code in (None, 0) else "SystemExit: " + str(e.code)
    except BaseException as e:
        tb = e.__traceback__.tb_next if e.__traceback__ else None
        return "".join(traceback.format_exception(type(e), e, tb))
    finally:
        builtins.input = orig
        sys.stdout.flush(); sys.stderr.flush()

_repl_ns = {"__name__": "__main__"}
def _pyrepl(src):
    # one REPL entry: "M" = needs more lines (an open block), "E…" = error text, "O" = done (expression values were printed by sys.displayhook)
    import codeop, traceback, sys
    try:
        code = codeop.compile_command(src, "<stdin>", "single")
    except (SyntaxError, OverflowError, ValueError) as e:
        return "E" + "".join(traceback.format_exception_only(type(e), e))
    if code is None:
        return "M"
    try:
        exec(code, _repl_ns)
    except SystemExit:
        return "E" + "exit() is ignored here: this REPL lives in the page.\n"
    except BaseException as e:
        tb = e.__traceback__.tb_next if e.__traceback__ else None
        return "E" + "".join(traceback.format_exception(type(e), e, tb))
    finally:
        sys.stdout.flush()
    return "O"
`,TRACER=String.raw`
def _pyviz(src, stdin_text, max_steps, objects_all):
    import sys, json, builtins, types, io, traceback
    FILE = "<main.py>"
    out = io.StringIO()
    lines = stdin_text.split("\n") if stdin_text else []
    if lines and lines[-1] == "":
        lines.pop()
    steps = []
    INLINE = (int, float, complex, bool, type(None), str)
    SKIP = {"__builtins__", "__name__", "__doc__", "__package__", "__loader__", "__spec__", "__file__", "__cached__", "__annotations__"}
    def short(r, n=80):
        return r if len(r) <= n else r[: n - 1] + "…"
    def has(cell):
        try:
            cell.cell_contents
            return True
        except ValueError:
            return False
    def ref(v, heap, depth):
        if isinstance(v, INLINE) and not objects_all:
            return ["v", short(repr(v))]
        i = str(id(v))
        if i not in heap and depth < 40 and len(heap) < 300:
            heap[i] = None
            heap[i] = enc(v, heap, depth + 1)
        return ["r", i]
    def enc(v, heap, depth):
        t = type(v)
        tn = t.__name__
        if isinstance(v, (int, float, complex, bool, str, bytes, type(None))):
            return [tn, "prim", short(repr(v), 120)]
        if t in (list, tuple, set, frozenset) or tn == "deque":
            items = list(v)[:60]
            if t in (set, frozenset):
                try:
                    items = sorted(items, key=repr)
                except Exception:
                    pass
            return [tn, "seq", [ref(x, heap, depth) for x in items], len(v)]
        if isinstance(v, dict):
            return [tn, "map", [[ref(k, heap, depth), ref(x, heap, depth)] for k, x in list(v.items())[:60]], len(v)]
        if isinstance(v, (types.FunctionType, type)) and getattr(v, "__module__", "") != "__main__":
            return ["class" if isinstance(v, type) else "function", "prim", ("class " if isinstance(v, type) else "") + v.__qualname__ + " (from " + str(v.__module__) + ")"]
        if isinstance(v, types.FunctionType):
            c = v.__code__
            args = list(c.co_varnames[: c.co_argcount + c.co_kwonlyargcount])
            if c.co_flags & 4:
                args.append("*" + c.co_varnames[len(args)])
            if c.co_flags & 8:
                args.append("**" + c.co_varnames[len(args)])
            cells = []
            if v.__closure__:
                cells = [[n, ref(cl.cell_contents, heap, depth)] for n, cl in zip(c.co_freevars, v.__closure__) if has(cl)]
            return ["function", "fn", v.__qualname__, args, cells]
        if isinstance(v, type):
            attrs = [[k, ref(x, heap, depth)] for k, x in v.__dict__.items() if not (k.startswith("__") and k.endswith("__"))]
            return ["class", "cls", v.__name__, [b.__name__ for b in v.__bases__ if b is not object], attrs[:40]]
        if isinstance(v, types.ModuleType):
            return ["module", "prim", v.__name__]
        if isinstance(v, types.GeneratorType):
            fr = v.gi_frame
            return ["generator", "prim", v.__qualname__ + (" (paused at line " + str(fr.f_lineno) + ")" if fr else " (finished)")]
        d = getattr(v, "__dict__", None)
        if isinstance(d, dict) and t.__module__ == "__main__":
            return [tn, "obj", [[k, ref(x, heap, depth)] for k, x in list(d.items())[:40]]]
        slots = getattr(t, "__slots__", None)
        if slots and t.__module__ == "__main__":
            return [tn, "obj", [[k, ref(getattr(v, k), heap, depth)] for k in slots if hasattr(v, k)]]
        return [tn, "prim", short(repr(v), 120)]
    def snap(frame, event, arg):
        stack = []
        f = frame
        while f is not None:
            if f.f_code.co_filename == FILE:
                stack.append(f)
            f = f.f_back
        stack.reverse()
        heap = {}
        frames = []
        for fr in stack:
            glob = fr.f_code.co_name == "<module>"
            loc = fr.f_globals if glob else fr.f_locals
            vs = [[n, ref(x, heap, 0)] for n, x in list(loc.items()) if n not in SKIP and not n.startswith("_pyviz")]
            fd = {"n": "Global frame" if glob else fr.f_code.co_name, "id": str(id(fr)), "v": vs}
            if fr is frame and event == "return" and not glob:
                fd["r"] = ref(arg, heap, 0)
            frames.append(fd)
        st = {"l": frame.f_lineno, "e": event, "f": frames, "h": heap, "o": len(out.getvalue())}
        if event == "exception":
            st["x"] = arg[0].__name__ + ": " + str(arg[1])
        steps.append(st)
    class Stop(Exception):
        pass
    def tracer(frame, event, arg):
        if frame.f_code.co_filename != FILE:
            return None
        if len(steps) >= max_steps:
            raise Stop()
        if event == "call" and frame.f_code.co_name == "<module>":
            return tracer   # the module "starting" (line 0) is not a step anyone needs to see
        if event in ("call", "line", "return", "exception"):
            snap(frame, event, arg)
        return tracer
    def fake_input(prompt=""):
        out.write(str(prompt))
        if not lines:
            raise EOFError("EOF when reading a line (the input box has no more lines)")
        s = lines.pop(0)
        out.write(s + "\n")
        return s
    g = {"__name__": "__main__", "__builtins__": builtins}
    err = None
    try:
        code = compile(src, FILE, "exec")
    except SyntaxError as e:
        return json.dumps({"steps": [], "out": "", "err": "".join(traceback.format_exception_only(type(e), e)), "limit": False})
    limit = False
    old = (sys.stdout, sys.stderr, builtins.input)
    sys.stdout = out
    sys.stderr = out
    builtins.input = fake_input
    sys.settrace(tracer)
    try:
        exec(code, g)
    except Stop:
        limit = True
    except BaseException as e:
        tb = e.__traceback__
        while tb is not None and tb.tb_frame.f_code.co_filename != FILE:
            tb = tb.tb_next
        err = "".join(traceback.format_exception(type(e), e, tb)).replace('File "<main.py>"', 'File "main.py"')
    finally:
        sys.settrace(None)
        sys.stdout, sys.stderr, builtins.input = old
    return json.dumps({"steps": steps, "out": out.getvalue(), "err": err, "limit": limit})
`,WORKER=`importScripts(${JSON.stringify(BASE+"pyodide.js")});
let py=null,job=0,known=[];
const ready=loadPyodide({indexURL:${JSON.stringify(BASE)}}).then(p=>{py=p;p.runPython(${JSON.stringify(PRELUDE)});p.runPython(${JSON.stringify(TRACER)});postMessage({t:"ready"});return p;},
  e=>{postMessage({t:"fail",error:String(e&&e.message||e)});});
function files(f){const FS=py.FS;known.forEach(n=>{try{FS.unlink("/home/pyodide/"+n);}catch(_){}});known=Object.keys(f);
  /* "shop/pricing.py" → modules "shop.pricing" and "shop"; folders are created as needed (packages, Lesson Y10) */
  const mods=new Set();known.forEach(n=>{const m=n.replace(/\\.py$/,"").replace(/\\//g,".").replace(/\\.__init__$/,"");m.split(".").forEach((_,i,a)=>mods.add(a.slice(0,i+1).join(".")));});
  py.runPython("import sys, importlib\\nfor _n in "+JSON.stringify([...mods])+":\\n    sys.modules.pop(_n, None)\\nimportlib.invalidate_caches()");
  known.forEach(n=>{const d=n.split("/").slice(0,-1).join("/");if(d)FS.mkdirTree("/home/pyodide/"+d);FS.writeFile("/home/pyodide/"+n,f[n]);});}
function sink(err){const d=new TextDecoder();return {write(b){const s=d.decode(b,{stream:true});if(s)postMessage({t:"out",id:job,s,err});return b.length;}};}
onmessage=async e=>{const m=e.data;await ready;if(!py)return;job=m.id;const t0=performance.now();
  try{
    const code=[m.src||""].concat(m.files?Object.values(m.files):[]).join("\\n");
    if(/zoneinfo|ZoneInfo/.test(code))await py.loadPackage("tzdata",{messageCallback:()=>{}});   /* the time-zone database is a separate package in Pyodide */
    await py.loadPackagesFromImports(code,{messageCallback:()=>{}}).catch(()=>{});            /* numpy etc. from the Pyodide distribution, if imported */
    if(m.files)files(m.files);
    if(m.op==="run"){py.setStdout(sink(false));py.setStderr(sink(true));
      const fn=py.globals.get("_pyrun"),args=[m.files[m.main],m.stdin||"",m.main,m.echo!==false];
      /* callPromising lets asyncio.run() suspend (WebAssembly stack switching, JSPI); plain call where it is unavailable */
      let err;try{err=fn.callPromising?await fn.callPromising(...args):fn(...args);}catch(x){if(/stack switch|callPromising|JSPI/i.test(String(x)))err=fn(...args);else throw x;}fn.destroy();
      postMessage({t:"done",id:m.id,error:err||null,ms:performance.now()-t0});}
    else if(m.op==="repl"){py.setStdout(sink(false));py.setStderr(sink(true));
      const fn=py.globals.get("_pyrepl"),r=fn(m.src);fn.destroy();
      postMessage({t:"done",id:m.id,repl:r,ms:performance.now()-t0});}
    else if(m.op==="trace"){const fn=py.globals.get("_pyviz"),r=fn(m.src,m.stdin||"",m.max||600,!!m.all);fn.destroy();
      postMessage({t:"done",id:m.id,trace:r,ms:performance.now()-t0});}
  }catch(x){postMessage({t:"done",id:m.id,error:String(x&&x.message||x),ms:performance.now()-t0});}};`;let W=null,wReady=null,seq=0,cur=null;const status=[],say=s=>status.forEach(f=>{try{f(s)}catch{}});function worker(){if(W)return wReady;let url;try{url=URL.createObjectURL(new Blob([WORKER],{type:"text/javascript"})),W=new Worker(url)}catch{return W=null,Promise.reject(new Error("This browser cannot start a Web Worker here, so Python cannot run."))}return say("Loading Python (about 10 MB the first time, then cached)…"),wReady=new Promise((ok,no)=>{W.onmessage=e=>{const m=e.data;if(m.t==="ready")say(""),ok();else if(m.t==="fail")say(""),no(new Error("Python could not load: "+m.error+". Check the internet connection and try again.")),kill();else if(cur&&m.id===cur.id){if(m.t==="out")cur.onOut(m.s,m.err);else if(m.t==="done"){const c=cur;cur=null,clearTimeout(c.timer),m.error&&/fatally failed|fatal error/i.test(m.error)&&(kill(),m.error+=`

The Python runtime crashed (usually recursion too deep for the browser's stack) and has been restarted. Run again.`),c.done(m)}}},W.onerror=e=>{say(""),no(new Error("Python could not load ("+(e.message||"network error")+").")),kill()}}),wReady.catch(()=>{}),wReady}function kill(){W&&(W.terminate(),W=null,wReady=null)}function send(msg,opt){return stop(),worker().then(()=>new Promise(done=>{const id=++seq;cur={id,onOut:opt.onOut||(()=>{}),done},opt.timeout&&(cur.timer=setTimeout(()=>{if(cur&&cur.id===id){const c=cur;cur=null,kill(),c.done({timedOut:!0})}},opt.timeout)),cur.stop=()=>{const c=cur;cur=null,clearTimeout(c.timer),kill(),c.done({stopped:!0})},W.postMessage(Object.assign({id},msg))}))}function stop(){cur&&cur.stop&&cur.stop()}window.PYR={VERSION,warm(){return worker().catch(()=>{})},onStatus(f){status.push(f)},stop,busy(){return!!cur},async run(o){const t0=performance.now(),m=await send({op:"run",files:o.files,main:o.main||"main.py",stdin:o.stdin||"",echo:o.echo!==!1},{onOut:o.onOut,timeout:o.timeout||15e3});return{ok:!m.error&&!m.timedOut&&!m.stopped,error:m.error||null,ms:m.ms||performance.now()-t0,stopped:!!m.stopped,timedOut:!!m.timedOut}},async repl(src,onOut){const m=await send({op:"repl",src},{onOut,timeout:15e3});return m.timedOut||m.stopped?{state:"error",error:m.timedOut?"Stopped after 15 s.":"Stopped."}:m.error?{state:"error",error:m.error}:m.repl==="M"?{state:"more"}:m.repl[0]==="E"?{state:"error",error:m.repl.slice(1)}:{state:"ok"}},async trace(o){const m=await send({op:"trace",files:o.files||null,src:o.src,stdin:o.stdin||"",max:o.max||600,all:!!o.all},{timeout:o.timeout||2e4});return m.timedOut?{steps:[],out:"",err:"The visualiser stopped after "+Math.round((o.timeout||2e4)/1e3)+" s.",limit:!0}:m.stopped?null:m.error?{steps:[],out:"",err:m.error,limit:!1}:JSON.parse(m.trace)}}})();
