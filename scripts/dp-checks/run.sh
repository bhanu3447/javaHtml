#!/bin/sh
# Headless-Chrome check of one page: injects a test script before </body> and prints the JSON it writes into <pre id="dpout">.
# usage: sh scripts/dp-checks/run.sh <page relative to the project, e.g. patterns/01-strategy.html> [width=1280] [test=dptest.js]
#   tests in this folder: dptest.js (lab geometry + controls, every view and step), widgets.js (pattern header, Refactor add/del/meter,
#   sequence views, playgrounds, Predict, Explain it back, home map), contrast.js (labs + widgets in all nine themes)
# Temporary files go to $DPTMP (default: the system temp folder /tmp/dp-checks), never into the project.
TOOLS="$(cd "$(dirname "$0")" && pwd)"; PRJ="$(cd "$TOOLS/../.." && pwd)"
TMPD="${DPTMP:-/tmp/dp-checks}"; mkdir -p "$TMPD"
# Chrome: set CHROME to its path on another machine (default: Windows per-user install). cygpath exists only on Windows Git Bash.
CH="${CHROME:-$LOCALAPPDATA/Google/Chrome/Application/chrome.exe}"
wp(){ if command -v cygpath >/dev/null 2>&1; then cygpath "$@"; else echo "$2"; fi; }
PAGE="$1"; W="${2:-1280}"; TEST="${3:-dptest.js}"
DIR=$(dirname "$PAGE")
BASE="file:///$(wp -m "$PRJ/$DIR" | sed 's/ /%20/g')/"
node -e '
const fs=require("fs");const [src,dst,base,test]=process.argv.slice(1);
let h=fs.readFileSync(src,"utf8");
h=h.replace("<head>","<head><base href=\""+base+"\"><script>window.__errs=[];addEventListener(\"error\",e=>__errs.push(String(e.message)+\" @\"+(e.filename||\"\").split(\"/\").pop()+\":\"+e.lineno));const __ce=console.error;console.error=(...a)=>{__errs.push(\"console: \"+a.join(\" \"));__ce(...a)};</script>");
h=h.replace("</body>","<script>"+fs.readFileSync(test,"utf8")+"</script></body>");
fs.writeFileSync(dst,h);' "$PRJ/$PAGE" "$TMPD/t-$$.html" "$BASE" "$TOOLS/$TEST"
P="$TMPD/prof-$$"; rm -rf "$P"; mkdir -p "$P"
"$CH" --headless=new --allow-file-access-from-files --user-data-dir="$(wp -w "$P")" --window-size=$W,900 --virtual-time-budget=8000 --dump-dom "file:///$(wp -m "$TMPD/t-$$.html")" 2>/dev/null | sed -n 's/.*<pre id="dpout">\(.*\)<\/pre>.*/\1/p' | sed 's/&quot;/"/g; s/&gt;/>/g; s/&lt;/</g; s/&amp;/\&/g'
rm -rf "$P" "$TMPD/t-$$.html"
