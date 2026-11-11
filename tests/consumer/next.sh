#!/usr/bin/env bash
# Builds an independent Next.js App Router consumer the way the installation guide describes, and checks what the
# install left behind. Run through scripts/consumer-check.sh (npm run test:consumer -- next), which serves the
# registry; by hand: KEYLINE_REGISTRY='<url>/r/{name}.json' tests/consumer/next.sh <empty-dir>
#
# The app deliberately differs from this repository: a src/ directory, the import alias ~/* instead of @/*, and a
# stock shadcn Button beside Keyline's. It installs Button (alone), Dialog (a portaled overlay that brings
# scroll-area, keyline-scope and the theme with it) and Chart (an npm dependency, recharts, and the table item).
# A server page renders Keyline components directly; a client island holds the interaction and the chart.
#
# Checks here (files and builds); tests/consumer/next.mjs checks the running app in a browser.
set -euo pipefail
DIR=${1:?usage: next.sh <empty-dir>}
REG=${KEYLINE_REGISTRY:-'http://127.0.0.1:5390/r/{name}.json'}
HERE=$(cd "$(dirname "$0")" && pwd)
SHADCN="npx --yes shadcn@4.23.0"
NEXT_VERSION=$(node -p 'require(process.argv[1]).devDependencies.next' "$HERE/../../package.json")
fails=0
ok() { if [ "$1" = 0 ]; then echo "  ✓ $2"; else echo "  ✖ $2"; fails=$((fails + 1)); fi; }

mkdir -p "$DIR" && cd "$DIR"
npx --yes "create-next-app@$NEXT_VERSION" app --ts --tailwind --app --src-dir --import-alias "~/*" --no-eslint \
  --use-npm --disable-git --no-agent-feedback --yes
cd app

# The guide's steps: init shadcn, map the registry, add components. Plus a stock shadcn component to coexist with.
$SHADCN init -b base -p nova -y --no-monorepo
$SHADCN add button -y
$SHADCN registry add "@keyline-ui=$REG"
$SHADCN add @keyline-ui/button -y
$SHADCN add @keyline-ui/dialog @keyline-ui/chart -y
set +e # from here on each check reports and the script fails at the end

node -e 'const j=require("./components.json"); if (j.aliases.components !== "~/components" || !j.rsc) { console.error("unexpected components.json", j); process.exit(1) }'
ok $? "components.json uses the ~ alias and rsc: true"
test -f src/components/keyline/ui/button.tsx && test -f src/components/keyline/ui/dialog.tsx && test -f src/components/keyline/ui/chart.tsx \
  && test -f src/components/keyline/ui/scroll-area.tsx && test -f src/components/keyline/lib/keyline-scope.ts && test -f src/components/ui/button.tsx
ok $? "Keyline lands in src/components/keyline beside shadcn's src/components/ui"
head -1 src/components/keyline/ui/dialog.tsx | grep -q '^"use client"'
ok $? "interactive components keep \"use client\" in an RSC project"
grep -q 'from "~/lib/utils"' src/components/keyline/ui/button.tsx && ! grep -rqE 'from "@/' src/components/keyline
ok $? "installed imports follow the project's alias (~/lib/utils), none left on @/"
! grep -rqE 'registry/keyline|@site/|site/public|127\.0\.0\.1|localhost|example\.invalid' src/components/keyline src/app/globals.css
ok $? "nothing installed refers to the Keyline repository, its site, or a local host"
node -e '
  const d = { ...require("./package.json").dependencies, ...require("./package.json").devDependencies }
  const demo = ["shiki", "playwright", "@fontsource-variable/ibm-plex-sans", "@fontsource/ibm-plex-mono", "embla-carousel-react", "react-day-picker", "react-resizable-panels", "cmdk", "@shadcn/react"]
  const extra = demo.filter((p) => p in d)
  const need = ["@base-ui/react", "recharts", "@fontsource-variable/atkinson-hyperlegible-next", "@fontsource-variable/atkinson-hyperlegible-mono"].filter((p) => !(p in d))
  if (extra.length || need.length) { console.error({ extra, need }); process.exit(1) }'
ok $? "dependencies: what button, dialog and chart need, and nothing the demo or site uses"
grep -q '@fontsource-variable/atkinson-hyperlegible-next' src/app/globals.css && grep -q -- '--kl-ink' src/app/globals.css && grep -q '\.kl-dialog' src/app/globals.css
ok $? "globals.css received the fonts, tokens and the dialog's rules"

# Pages: the server page imports Keyline directly; the island is the user's own client component.
cat > src/app/page.tsx <<'TSX'
import { Button } from "~/components/keyline/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogBody } from "~/components/keyline/ui/dialog"
import { Button as ShadcnButton } from "~/components/ui/button"
import { Island } from "./island"

export default function Page() {
  return (
    <main className="flex flex-col items-start gap-6 p-8">
      <Button data-testid="kl-light">Keyline light</Button>
      <ShadcnButton data-testid="shadcn">shadcn button</ShadcnButton>
      <div className="dark bg-kl-paper p-4" data-testid="dark-region">
        <Button data-testid="kl-dark">Keyline dark</Button>
      </div>
      <Dialog>
        <DialogTrigger render={<Button />}>Open dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Server-rendered dialog</DialogTitle>
          </DialogHeader>
          <DialogBody>Written in a server component, opened in the browser.</DialogBody>
        </DialogContent>
      </Dialog>
      <Island />
    </main>
  )
}
TSX
cat > src/app/island.tsx <<'TSX'
"use client"

import * as React from "react"
import { Bar, BarChart, XAxis } from "recharts"
import { Button } from "~/components/keyline/ui/button"
import { ChartContainer, type ChartConfig } from "~/components/keyline/ui/chart"

const data = [{ day: "Mon", n: 3 }, { day: "Tue", n: 5 }, { day: "Wed", n: 2 }]
const config = { n: { label: "Orders" } } satisfies ChartConfig

export function Island() {
  const [count, setCount] = React.useState(0)
  return (
    <>
      <Button onClick={() => setCount((c) => c + 1)}>Pressed {count}</Button>
      <ChartContainer config={config} className="h-[160px] w-[320px]" aria-label="Orders by day" data-testid="chart">
        <BarChart data={data}>
          <XAxis dataKey="day" />
          <Bar dataKey="n" fill="var(--color-n)" isAnimationActive={false} />
        </BarChart>
      </ChartContainer>
    </>
  )
}
TSX

npx tsc --noEmit
ok $? "type check"
npx next build
ok $? "next build (server page prerenders Keyline components)"

# Repeated installation: a second add changes nothing; without --overwrite a local edit survives; with it the
# component is replaced; neither adds a second copy of any CSS.
snapshot() { (cat src/app/globals.css; find src/components/keyline -type f | sort | xargs cat) | shasum | cut -d' ' -f1; }
before=$(snapshot)
$SHADCN add @keyline-ui/button @keyline-ui/dialog @keyline-ui/chart -y
ok $([ "$(snapshot)" = "$before" ]; echo $?) "re-adding the same items changes no file and no CSS"
echo '// my edit' >> src/components/keyline/ui/button.tsx
css=$(shasum src/app/globals.css)
$SHADCN add @keyline-ui/button -y </dev/null
grep -q '// my edit' src/components/keyline/ui/button.tsx
ok $? "re-adding without --overwrite keeps a local edit"
$SHADCN add @keyline-ui/button --overwrite -y
! grep -q '// my edit' src/components/keyline/ui/button.tsx && [ "$(shasum src/app/globals.css)" = "$css" ]
ok $? "--overwrite replaces the component and leaves the CSS as it was"
ok $([ "$(snapshot)" = "$before" ]; echo $?) "after --overwrite the install is byte-identical to the first one"

[ $fails -eq 0 ] || { echo "next: $fails failed"; exit 1; }
