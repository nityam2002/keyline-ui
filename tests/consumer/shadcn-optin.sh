#!/usr/bin/env bash
# The opt-in `keyline-shadcn` item in a fresh shadcn project. setup.sh never installs it (that consumer
# checks Keyline leaves stock shadcn alone), so this builds a bare base-nova app, adds the item twice (the second time
# with --overwrite, as an upgrade would), and checks that stock shadcn takes Keyline's radius, colours and color-scheme.
#   Run through scripts/consumer-check.sh (pnpm test:consumer), which builds and serves the registry and
#   sets KEYLINE_REGISTRY. By hand: KEYLINE_REGISTRY='<url>/r/{name}.json' tests/consumer/shadcn-optin.sh <empty-dir>
set -euo pipefail
DIR=${1:?usage: shadcn-optin.sh <empty-dir>}
REG=${KEYLINE_REGISTRY:-'http://127.0.0.1:5390/r/{name}.json'}
HERE=$(cd "$(dirname "$0")" && pwd)
PORT=5320
if lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then echo "port $PORT is in use"; exit 1; fi
SHADCN="npx --yes shadcn@4.23.0"
mkdir -p "$DIR/src" && cd "$DIR"
cat > package.json <<'JSON'
{ "name": "keyline-shadcn-optin", "private": true, "type": "module",
  "dependencies": { "react": "^19.2.0", "react-dom": "^19.2.0" },
  "devDependencies": { "@tailwindcss/vite": "^4.3.5", "@types/node": "^24.0.0", "@types/react": "^19.2.0", "@types/react-dom": "^19.2.0", "@vitejs/plugin-react": "^5.1.1", "tailwindcss": "^4.3.5", "typescript": "~5.9.3", "vite": "^7.3.1" } }
JSON
cat > vite.config.ts <<'TS'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
export default defineConfig({ plugins: [react(), tailwindcss()], resolve: { alias: { "@": path.resolve(__dirname, "./src") } } })
TS
cat > tsconfig.json <<'JSON'
{ "compilerOptions": { "target": "ES2022", "lib": ["ES2022", "DOM", "DOM.Iterable"], "module": "ESNext", "moduleResolution": "bundler", "jsx": "react-jsx", "strict": true, "skipLibCheck": true, "noEmit": true, "types": ["vite/client"], "baseUrl": ".", "paths": { "@/*": ["./src/*"] } }, "include": ["src"] }
JSON
echo '<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>optin</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>' > index.html
echo '@import "tailwindcss";' > src/index.css
printf 'import { createRoot } from "react-dom/client"\nimport "./index.css"\nimport App from "./App"\ncreateRoot(document.getElementById("root")!).render(<App />)\n' > src/main.tsx
npm install --no-audit --no-fund >/dev/null
$SHADCN init -t vite -b base -p nova -y --no-monorepo >/dev/null
$SHADCN add card button -y >/dev/null
# the documented one-time step (docs: Installation), pointed at the local registry
$SHADCN registry add "@keyline-ui=$REG"
$SHADCN add @keyline-ui/keyline-shadcn -y >/dev/null
$SHADCN add @keyline-ui/keyline-shadcn --overwrite -y >/dev/null
cat > src/App.tsx <<'TSX'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
function Set({ id }: { id: string }) {
  return (
    <div className="flex gap-4 p-4">
      <Card data-testid={`${id}-card`}><CardContent>Card</CardContent></Card>
      <Button data-testid={`${id}-btn`}>Button</Button>
      <div data-testid={`${id}-sidebar`} className="bg-sidebar p-4">Sidebar</div>
      <div data-testid={`${id}-rounded`} className="rounded border p-4">rounded</div>
    </div>
  )
}
export default function App() {
  return (
    <main>
      <Set id="light" />
      <div className="dark" data-testid="dark"><Set id="dark" /></div>
    </main>
  )
}
TSX
npx tsc -b
(exec node_modules/.bin/vite --port $PORT --strictPort >/dev/null 2>&1) & V=$!
trap 'kill $V 2>/dev/null' EXIT
for i in $(seq 40); do curl -s -o /dev/null http://localhost:$PORT/ && break; sleep 0.5; done
node "$HERE/shadcn-optin.mjs" "http://localhost:$PORT/"
