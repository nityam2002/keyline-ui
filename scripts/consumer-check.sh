#!/usr/bin/env bash
# Consumer checks: install Keyline from a freshly built registry into new apps, the way a user would. The registry
# is served from site/public at /r/{name}.json, the same files and path the documentation site publishes.
#
#   flows     tests/consumer/setup.sh builds a Vite + stock shadcn app and adds every item (alone and together,
#             including --overwrite re-adds), type-checks and builds it; tests/consumer/flows.mjs then runs
#             interaction checks on it in Chrome and WebKit
#   isolated  tests/consumer/isolated.sh adds items one at a time to a bare app and checks the CSS rules each
#             depends on arrived with it
#   optin     tests/consumer/shadcn-optin.sh checks the opt-in keyline-shadcn item over stock shadcn
#   next      tests/consumer/next.sh builds a Next.js App Router app (src/, ~/* alias, stock shadcn beside
#             Keyline), installs button, dialog and chart, checks the files, re-adds, builds; tests/consumer/next.mjs
#             then checks the running app in Chrome and WebKit
#
#   pnpm test:consumer               all four
#   pnpm test:consumer -- isolated   some of them
#
# Needs network access (npm and the shadcn CLI). The apps are built in a temporary directory; logs go to
# .artifacts/consumer/.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$(pwd)
CHECKS=${*:-flows isolated optin next}
REG_PORT=5390
APP_PORT=5319
NEXT_PORT=5320
LOGS="$ROOT/.artifacts/consumer"
for port in $REG_PORT $APP_PORT $NEXT_PORT; do
  if lsof -nP -iTCP:$port -sTCP:LISTEN >/dev/null 2>&1; then echo "port $port is in use; stop that server first"; exit 1; fi
done
rm -rf "$LOGS" && mkdir -p "$LOGS"
WORK=$(mktemp -d)
PIDS=()
cleanup() { for p in "${PIDS[@]}"; do kill "$p" 2>/dev/null || true; wait "$p" 2>/dev/null || true; done; rm -rf "$WORK"; }
trap cleanup EXIT

pnpm registry:build >"$LOGS/registry.log" 2>&1 || { cat "$LOGS/registry.log"; exit 1; }
node -e '
  const http = require("http"), fs = require("fs"), path = require("path")
  const dir = path.resolve("site/public")
  http.createServer((req, res) => {
    const file = path.join(dir, decodeURIComponent(new URL(req.url, "http://x").pathname))
    if (!file.startsWith(dir + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end()
    res.writeHead(200, { "content-type": file.endsWith(".json") ? "application/json" : "application/octet-stream" })
    fs.createReadStream(file).pipe(res)
  }).listen(Number(process.argv[1]), "127.0.0.1")
' $REG_PORT &
PIDS+=($!)
export KEYLINE_REGISTRY="http://127.0.0.1:$REG_PORT/r/{name}.json"

fails=0
step() { # name, command...
  local name=$1; shift
  echo "consumer: $name"
  if "$@" >"$LOGS/$name.log" 2>&1; then grep -E "✓|✖" "$LOGS/$name.log" | grep -c "✓" | sed 's/^/  passed checks: /'; else
    fails=$((fails + 1)); grep -E "✖|rror" "$LOGS/$name.log" | head -20; echo "  FAILED (log: .artifacts/consumer/$name.log)"; fi
}
# Called as an `if` condition by step(), so `set -e` is off inside these functions: every command that can fail
# must return on failure itself, or only the last one decides the result.
flows() {
  bash tests/consumer/setup.sh "$WORK/flows" || return 1
  (cd "$WORK/flows" && exec node_modules/.bin/vite --port $APP_PORT --strictPort) >"$LOGS/flows-server.log" 2>&1 &
  PIDS+=($!)
  for _ in $(seq 60); do curl -s -o /dev/null "http://localhost:$APP_PORT/" && break; sleep 0.5; done
  node tests/consumer/flows.mjs "http://localhost:$APP_PORT/"
}
next() {
  bash tests/consumer/next.sh "$WORK/next" || return 1
  (cd "$WORK/next/app" && exec node_modules/.bin/next start --port $NEXT_PORT) >"$LOGS/next-server.log" 2>&1 &
  PIDS+=($!)
  for _ in $(seq 60); do curl -s -o /dev/null "http://localhost:$NEXT_PORT/" && break; sleep 0.5; done
  node tests/consumer/next.mjs "http://localhost:$NEXT_PORT/"
}
for c in $CHECKS; do
  case $c in
    flows) step flows flows ;;
    isolated) step isolated bash tests/consumer/isolated.sh "$WORK/isolated" ;;
    optin) step optin bash tests/consumer/shadcn-optin.sh "$WORK/optin" ;;
    next) step next next ;;
    *) echo "unknown check: $c (flows, isolated, optin, next)"; exit 2 ;;
  esac
done
[ $fails -eq 0 ] && echo "consumer: all passed" || echo "consumer: $fails failed"
exit $fails
