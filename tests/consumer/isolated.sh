#!/usr/bin/env bash
# Isolated installs. setup.sh installs most items before the ones it tests, so an item that
# forgets a dependency still works there. This builds a bare app and adds items that share no CSS-level
# dependency, one at a time, checking after each add that the rules it relies on arrived and the app
# type-checks and builds.
#   Run through scripts/consumer-check.sh (pnpm test:consumer), which builds and serves the registry and
#   sets KEYLINE_REGISTRY. By hand: KEYLINE_REGISTRY='<url>/r/{name}.json' tests/consumer/isolated.sh <empty-dir>
set -euo pipefail
DIR=${1:?usage: isolated.sh <empty-dir>}
REG=${KEYLINE_REGISTRY:-'http://127.0.0.1:5390/r/{name}.json'}
SHADCN="npx --yes shadcn@4.23.0"
mkdir -p "$DIR/src" && cd "$DIR"
cat > package.json <<'JSON'
{ "name": "keyline-isolated", "private": true, "type": "module",
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
echo '<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>isolated</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>' > index.html
echo '@import "tailwindcss";' > src/index.css
npm install --no-audit --no-fund
$SHADCN init -t vite -b base -p nova -y --no-monorepo
# the documented one-time step (docs: Installation), pointed at the local registry
$SHADCN registry add "@keyline-ui=$REG"

fails=0
check() { # item, component file, export, selector that must be in the CSS
  local item=$1 file=$2 name=$3 sel=$4
  $SHADCN add "@keyline-ui/$item" -y >/dev/null
  printf 'import { %s } from "@/components/keyline/ui/%s"\nexport const used = %s\n' "$name" "$file" "$name" > "src/use-$item.ts"
  if grep -qF "$sel" src/index.css; then echo "  ✓ $item: brought $sel"; else echo "  ✖ $item: $sel missing from the CSS"; fails=$((fails + 1)); fi
}
# each pair: the item, and a rule from the item it depends on only through its CSS
check number-field number-field NumberField ".kl-field-frame"
check switch switch Switch ".kl-choice-row"
check command command CommandDialog ".kl-scrim"
check time-field time-field TimeField ".kl-field-frame"
check app-shell app-shell AppShell ".kl-sheet"
check app-shell app-shell AppShell ".kl-nav-ic"
check nav nav NavIdentity ".kl-tip"
check tabs tabs Tabs ".kl-more-fade"
check checkbox-group checkbox-group CheckboxGroup ".kl-choice-row"
# Table now composes toolbar (filter tokens in a toolbar), so its CSS must come with it
check table table TableSortHeader ".kl-tb-item"
# The date picker ships its own CSS (the time row); time-field is already here
check date-picker date-picker DateTimePicker ".kl-dtp-time"
check date-picker date-picker Calendar ".kl-cal-dd"
# Avatar needs only the theme (its status floor rules ship in its own CSS); hover-card the theme's positioner; otp-field Field's frame and ! cell
check avatar avatar AvatarGroup '.kl-avatar[data-status="waiting"]'
check hover-card hover-card HoverCardContent ".kl-positioner"
check otp-field otp-field OtpField ".kl-field-bang"
# Kbd and toggle need only the theme; native-select brings Field's frame and ! cell; command now brings kbd
check kbd kbd KbdGroup ".kl-kbd-group"
check toggle toggle Toggle ".kl-flood"
check native-select native-select NativeSelect ".kl-field-bang"
check command command CommandDialog ".kl-kbd"
# Resizable needs only the theme (and react-resizable-panels from npm); navigation-menu the theme's positioner and dock
check resizable resizable ResizablePanelGroup ".kl-rz-grip"
check navigation-menu navigation-menu NavigationMenu ".kl-positioner"
printf 'import "./index.css"\n' > src/main.tsx
npx tsc -p tsconfig.json
npx vite build >/dev/null
echo "isolated: ${fails} missing"
exit $fails
