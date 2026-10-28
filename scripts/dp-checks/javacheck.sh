#!/bin/sh
# Runs every Java editor of a page on the installed JDK and checks that each output line appears in that program's comments.
# usage: sh scripts/dp-checks/javacheck.sh <page relative to the project, e.g. patterns/02-template-method.html>
# Prints one line per program: "<File>.java: <n> lines, <m> not in comments" (+ the first missing lines). Trailing spaces and
# stack-trace "at …(X.java:N)" lines are ignored (exception demos show only the exception line in comments).
TOOLS="$(cd "$(dirname "$0")" && pwd)"; PRJ="$(cd "$TOOLS/../.." && pwd)"
T="${DPTMP:-/tmp/dp-checks}/java-$$"; rm -rf "$T"; mkdir -p "$T"
node -e '
const fs=require("fs"),t=fs.readFileSync(process.argv[1],"utf8");
for(const m of t.matchAll(/<script type="text\/x-java" data-file="([^"]+)"[^>]*>([\s\S]*?)<\/script>/g))
  fs.writeFileSync(process.argv[2]+"/"+m[1],m[2].replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&"));' "$PRJ/$1" "$T"
cd "$T" || exit 1
for f in *.java; do
  [ -f "$f" ] || { echo "no Java editors"; break; }
  java -Dstdout.encoding=UTF-8 "$f" 2>&1 | tr -d '\r' | sed 's/[[:space:]]*$//; /^[[:space:]]*at .*java:[0-9]*)$/d' > out.txt
  n=0; miss=""
  while IFS= read -r l; do [ -z "$l" ] && continue; grep -qF -- "$l" "$f" || { n=$((n+1)); [ $n -le 2 ] && miss="$miss
   not in comments: $l"; }; done < out.txt
  echo "$f: $(wc -l < out.txt) lines, $n not in comments$miss"
done
cd /; rm -rf "$T"
