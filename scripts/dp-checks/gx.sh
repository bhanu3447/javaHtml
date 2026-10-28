#!/bin/sh
# State gallery: every view × step of the listed labs, cloned side by side into one screenshot (review it in light AND dark).
# usage: sh scripts/dp-checks/gx.sh <theme> <height> <out.png> <lab,lab,...> <page in patterns/, e.g. 01-strategy.html>
#   lab keys = the ids without "dp-"; out.png without a folder is written to $DPTMP (default /tmp/dp-checks); the path is printed.
TOOLS="$(cd "$(dirname "$0")" && pwd)"; PRJ="$(cd "$TOOLS/../.." && pwd)"
TMPD="${DPTMP:-/tmp/dp-checks}"; mkdir -p "$TMPD"
# Chrome: set CHROME to its path on another machine (default: Windows per-user install). cygpath exists only on Windows Git Bash.
CH="${CHROME:-$LOCALAPPDATA/Google/Chrome/Application/chrome.exe}"
wp(){ if command -v cygpath >/dev/null 2>&1; then cygpath "$@"; else echo "$2"; fi; }
TH="$1"; H="$2"; OUT="$3"; LABS="$4"; PG="${5:-00-foundations.html}"
case "$OUT" in */*) ;; *) OUT="$TMPD/$OUT";; esac
BASE="file:///$(wp -m "$PRJ/patterns" | sed 's/ /%20/g')/"
node -e '
const fs=require("fs");const [src,dst,base,test,th,labs]=process.argv.slice(1);
let h=fs.readFileSync(src,"utf8");
h=h.replace("<head>","<head><base href=\""+base+"\"><script>try{localStorage.setItem(\"js1-theme\",\""+th+"\")}catch(e){}document.documentElement.dataset.theme=\""+th+"\";window.__LABS="+JSON.stringify(labs.split(","))+";</script>");
h=h.replace("</body>","<script>"+fs.readFileSync(test,"utf8")+"</script></body>");
fs.writeFileSync(dst,h);' "$PRJ/patterns/$PG" "$TMPD/g-$$.html" "$BASE" "$TOOLS/gallery.js" "$TH" "$LABS"
P="$TMPD/prof2-$$"; rm -rf "$P"; mkdir -p "$P"
"$CH" --headless=new --allow-file-access-from-files --hide-scrollbars --user-data-dir="$(wp -w "$P")" --window-size=1280,$H --virtual-time-budget=8000 --screenshot="$(wp -w "$OUT")" "file:///$(wp -m "$TMPD/g-$$.html")" 2>/dev/null
echo "$(wp -w "$OUT")"
rm -rf "$P" "$TMPD/g-$$.html"
