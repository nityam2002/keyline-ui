#!/usr/bin/env bash
# Builds an independent consumer: Vite + React + Tailwind 4 + stock shadcn (base-nova), then installs Keyline
# from a locally served registry into components/keyline/, alongside shadcn's components/ui/.
#   Run through scripts/consumer-check.sh (npm run test:consumer), which builds and serves the registry and
#   sets KEYLINE_REGISTRY. By hand: KEYLINE_REGISTRY='<url>/r/{name}.json' tests/consumer/setup.sh <empty-dir>
set -euo pipefail
DIR=${1:?usage: setup.sh <empty-dir>}
DEFAULT_REG='http://127.0.0.1:5390/r/{name}.json'
REG=${KEYLINE_REGISTRY:-$DEFAULT_REG}
HERE=$(cd "$(dirname "$0")" && pwd)
SHADCN="npx --yes shadcn@4.23.0"
mkdir -p "$DIR/src" && cd "$DIR"
cat > package.json <<'JSON'
{ "name": "keyline-consumer", "private": true, "type": "module",
  "scripts": { "dev": "vite", "build": "tsc -b && vite build" },
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
{ "compilerOptions": { "target": "ES2022", "lib": ["ES2022", "DOM", "DOM.Iterable"], "module": "ESNext", "moduleResolution": "bundler", "jsx": "react-jsx", "strict": true, "noUnusedLocals": true, "noUnusedParameters": true, "skipLibCheck": true, "noEmit": true, "types": ["vite/client"], "baseUrl": ".", "paths": { "@/*": ["./src/*"] } }, "include": ["src"] }
JSON
echo '<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Keyline consumer</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>' > index.html
echo '@import "tailwindcss";' > src/index.css
printf 'import { StrictMode } from "react"\nimport { createRoot } from "react-dom/client"\nimport "./index.css"\nimport App from "./App"\ncreateRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>)\n' > src/main.tsx
echo 'export default function App() { return null }' > src/App.tsx
npm install --no-audit --no-fund
# A form library, to exercise the controlled APIs the way an app would
npm install --no-audit --no-fund react-hook-form@7
# A headless table library, rendered with Keyline table parts
npm install --no-audit --no-fund @tanstack/react-table@8
$SHADCN init -t vite -b base -p nova -y --no-monorepo
$SHADCN add card input -y
# the documented one-time step (docs: Installation), pointed at the local registry
$SHADCN registry add "@keyline-ui=$REG"
# isolated first, then combined in separate runs (exercises CSS merging across adds)
$SHADCN add @keyline-ui/switch -y
$SHADCN add @keyline-ui/button -y
$SHADCN add @keyline-ui/table @keyline-ui/panel @keyline-ui/stat @keyline-ui/nav @keyline-ui/select -y
$SHADCN add @keyline-ui/checkbox @keyline-ui/radio-group @keyline-ui/field @keyline-ui/dialog @keyline-ui/menu @keyline-ui/tooltip @keyline-ui/toast @keyline-ui/selection -y
$SHADCN add @keyline-ui/date-range @keyline-ui/multiselect @keyline-ui/segmented @keyline-ui/toggle-group @keyline-ui/split-button @keyline-ui/command @keyline-ui/inspector @keyline-ui/tabs @keyline-ui/switch -y
# New foundations and the configuration lib
$SHADCN add @keyline-ui/notice @keyline-ui/item @keyline-ui/popover @keyline-ui/sheet @keyline-ui/date-picker @keyline-ui/keyline-config -y
# The scroll area, on its own (dialog, table and inspector also depend on it)
$SHADCN add @keyline-ui/scroll-area -y
# Slider and context menu on their own (isolated), then the rest together
$SHADCN add @keyline-ui/slider -y
$SHADCN add @keyline-ui/context-menu -y
$SHADCN add @keyline-ui/combobox @keyline-ui/accordion @keyline-ui/collapsible @keyline-ui/progress -y
# Number field and pagination on their own, then the rest together (field, menu and table are updates)
$SHADCN add @keyline-ui/number-field -y
$SHADCN add @keyline-ui/pagination -y
$SHADCN add @keyline-ui/empty @keyline-ui/breadcrumb @keyline-ui/field @keyline-ui/menu @keyline-ui/table -y
# New items on their own, then the updated field participants and scroll-edge users together
$SHADCN add @keyline-ui/time-field -y
$SHADCN add @keyline-ui/menubar -y
$SHADCN add @keyline-ui/skeleton @keyline-ui/app-shell -y
$SHADCN add @keyline-ui/select @keyline-ui/combobox @keyline-ui/slider @keyline-ui/number-field @keyline-ui/tabs @keyline-ui/nav @keyline-ui/toggle-group @keyline-ui/segmented --overwrite -y
# Toolbar and checkbox group on their own, then the updated panel, inspector and app shell
$SHADCN add @keyline-ui/toolbar -y
$SHADCN add @keyline-ui/checkbox-group -y
$SHADCN add @keyline-ui/panel @keyline-ui/inspector @keyline-ui/app-shell --overwrite -y
# The theme (narrow-row fades), the collection lib (multi-sort), toolbar (overflow, signals) and table (sort levels, toolbar-aware tokens)
$SHADCN add @keyline-ui/keyline @keyline-ui/collection @keyline-ui/toolbar @keyline-ui/table --overwrite -y
# Date-picker (DateTimePicker, now composing time-field) on its own with --overwrite (it was installed above),
# then the 12-hour time field, the Slider's ! cell, isolated units, the field's fixed attention cell and the shell's toolbar actions
$SHADCN add @keyline-ui/date-picker --overwrite -y
$SHADCN add @keyline-ui/time-field @keyline-ui/slider @keyline-ui/number-field @keyline-ui/field @keyline-ui/app-shell --overwrite -y
# The month/year jump (date-range, shared by date-picker; calendar lib) and time bounds (time-field, date-picker); keyline for the jump styles
$SHADCN add @keyline-ui/keyline @keyline-ui/calendar @keyline-ui/date-range @keyline-ui/time-field @keyline-ui/date-picker --overwrite -y
# The shell's sidebar (nav: groups, icons, identity, rail via tooltip; app-shell: collapse="rail", column height) and the centred checkbox tick
$SHADCN add @keyline-ui/nav @keyline-ui/app-shell @keyline-ui/checkbox --overwrite -y
# Avatar, hover card and OTP field, each on its own, then together with the items they compose with
$SHADCN add @keyline-ui/avatar -y
$SHADCN add @keyline-ui/hover-card -y
$SHADCN add @keyline-ui/otp-field -y
$SHADCN add @keyline-ui/avatar @keyline-ui/hover-card @keyline-ui/otp-field @keyline-ui/item @keyline-ui/panel -y
# Kbd, toggle and native-select on their own; then field (FieldBar), command (Kbd) and toggle-group (shared toggle) updated
$SHADCN add @keyline-ui/kbd -y
$SHADCN add @keyline-ui/toggle -y
$SHADCN add @keyline-ui/native-select -y
$SHADCN add @keyline-ui/field @keyline-ui/command @keyline-ui/toggle-group --overwrite -y
# Resizable and navigation-menu on their own
$SHADCN add @keyline-ui/resizable -y
$SHADCN add @keyline-ui/navigation-menu -y
# Questionnaire, button group, marker and direction on their own; nav, app-shell and toast updated; the
# sidebar and alert-dialog install names (which only pull existing items) last
$SHADCN add @keyline-ui/questionnaire -y
$SHADCN add @keyline-ui/button-group -y
$SHADCN add @keyline-ui/marker @keyline-ui/direction -y
$SHADCN add @keyline-ui/nav @keyline-ui/app-shell @keyline-ui/toast --overwrite -y
$SHADCN add @keyline-ui/sidebar @keyline-ui/alert-dialog -y
# a configuration exported by the playground, installed from a local file (KEYLINE_CONFIG = path to the item)
if [ -n "${KEYLINE_CONFIG:-}" ]; then
  cp "$KEYLINE_CONFIG" ./keyline-config.json
  $SHADCN add ./keyline-config.json -y
fi
cp "$HERE/App.tsx" src/App.tsx
# the playground's own composition, verbatim except for the install path
sed 's#@/registry/keyline/#@/components/keyline/#g' "$HERE/../../src/demo/playground/Preview.tsx" > src/Preview.tsx
cp "$HERE/PreviewPage.tsx" src/PreviewPage.tsx
printf 'import { StrictMode } from "react"\nimport { createRoot } from "react-dom/client"\nimport "./index.css"\nimport App from "./App"\nimport PreviewPage from "./PreviewPage"\nconst page = new URLSearchParams(location.search).get("page")\ncreateRoot(document.getElementById("root")!).render(<StrictMode>{page === "preview" ? <PreviewPage /> : <App />}</StrictMode>)\n' > src/main.tsx
npx tsc -b
npx vite build
echo "consumer ready in $DIR"
