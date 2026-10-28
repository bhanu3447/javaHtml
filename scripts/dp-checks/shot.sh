#!/bin/sh
# Full-page screenshot of one page (to look at the whole page, not just the labs).
# usage: sh scripts/dp-checks/shot.sh <page relative to the project> <width> <height> <out.png> [theme]
TOOLS="$(cd "$(dirname "$0")" && pwd)"; PRJ="$(cd "$TOOLS/../.." && pwd)"
TMPD="${DPTMP:-/tmp/dp-checks}"; mkdir -p "$TMPD"
# Chrome: set CHROME to its path on another machine (default: Windows per-user install). cygpath exists only on Windows Git Bash.
CH="${CHROME:-$LOCALAPPDATA/Google/Chrome/Application/chrome.exe}"
wp(){ if command -v cygpath >/dev/null 2>&1; then cygpath "$@"; else echo "$2"; fi; }
PAGE="$1"; W="${2:-1280}"; H="${3:-4000}"; OUT="${4:-shot.png}"; TH="${5:-light}"
case "$OUT" in */*) ;; *) OUT="$TMPD/$OUT";; esac
BASE="file:///$(wp -m "$PRJ/$(dirname "$PAGE")" | sed 's/ /%20/g')/"
node -e '
const fs=require("fs");const [src,dst,base,th]=process.argv.slice(1);
let h=fs.readFileSync(src,"utf8");
h=h.replace("<head>","<head><base href=\""+base+"\"><script>try{localStorage.setItem(\"js1-theme\",\""+th+"\")}catch(e){}document.documentElement.dataset.theme=\""+th+"\";</script><style>*{animation:none!important;transition:none!important}.reveal,[data-reveal]{opacity:1!important;transform:none!important}</style>");
fs.writeFileSync(dst,h);' "$PRJ/$PAGE" "$TMPD/s-$$.html" "$BASE" "$TH"
P="$TMPD/prof3-$$"; rm -rf "$P"; mkdir -p "$P"
"$CH" --headless=new --allow-file-access-from-files --hide-scrollbars --user-data-dir="$(wp -w "$P")" --window-size=$W,$H --virtual-time-budget=8000 --screenshot="$(wp -w "$OUT")" "file:///$(wp -m "$TMPD/s-$$.html")" 2>/dev/null
echo "$(wp -w "$OUT")"
rm -rf "$P" "$TMPD/s-$$.html"
