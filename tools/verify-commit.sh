#!/bin/bash
# usage: bash tools/verify-commit.sh "commit message"  - boss gate: build, tests, check-site (all pages incl. /shop/<id>/), a11y, gaps, Pages build check; then commit + push. Author per CONTEXT.md (no AI attribution).
cd "$(dirname "$0")/.." || exit 2
PATHS="/ /events/ /shop/ /sell/ /visit/ /privacy/ /nope $(node -e 'const r=require("./src/data/releases.json");const a=Array.isArray(r)?r:(r.releases||[]);const fs=require("fs");console.log(a.map(x=>"/shop/"+x.id+"/").filter(q=>fs.existsSync("src/pages/shop/[id].astro")).join(" "))' 2>/dev/null)"
echo "paths: $PATHS"
npm run build >/tmp/vc-build.log 2>&1 || { echo BUILD FAIL; tail -20 /tmp/vc-build.log; exit 1; }
npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)" | tr '\n' ' '; echo
npm test >/dev/null 2>&1 || { echo TESTS FAIL; npm test 2>&1 | grep -B2 -A8 "not ok" | head -40; exit 1; }
PORT=4399 node tools/serve.mjs >/dev/null 2>&1 & SP=$!
sleep 2
MSYS_NO_PATHCONV=1 node tools/check-site.mjs http://localhost:4399 $PATHS; RC=$?
kill $SP 2>/dev/null
[ $RC -eq 0 ] || { echo CHECK FAIL; exit 1; }
sleep 1
timeout 900 npm run a11y >/tmp/vc-a11y.log 2>&1 || { echo A11Y FAIL; tail -15 /tmp/vc-a11y.log; exit 1; }
tail -1 /tmp/vc-a11y.log
PORT=4398 node tools/serve.mjs >/dev/null 2>&1 & GP=$!
sleep 2
timeout 600 node tools/gaps.mjs $PATHS --base=http://localhost:4398 >/tmp/vc-gaps.log 2>&1; GRC=$?
kill $GP 2>/dev/null
[ $GRC -eq 0 ] || { echo GAPS FAIL; tail -15 /tmp/vc-gaps.log; exit 1; }
echo "gaps: clean"
npm run build:pages >/tmp/vc-pages.log 2>&1 || { echo PAGES BUILD FAIL; tail -15 /tmp/vc-pages.log; exit 1; }
PORT=4397 node tools/serve-pages.mjs >/dev/null 2>&1 & PP=$!
sleep 2
MSYS_NO_PATHCONV=1 timeout 600 node tools/check-site.mjs http://localhost:4397/Mulligan-Games-B $PATHS >/tmp/vc-pcheck.log 2>&1; PRC=$?
kill $PP 2>/dev/null
[ $PRC -eq 0 ] || { echo PAGES CHECK FAIL; tail -15 /tmp/vc-pcheck.log; exit 1; }
echo "pages build: check-site clean"
git add -A && git commit -q -m "$1" && git pull -q --rebase && git push -q && git log --oneline -1
