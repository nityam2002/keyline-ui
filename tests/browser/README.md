# Browser specs

Two kinds of browser test, for two questions.

- **Part tests** (`tests/parts/<component>.browser.test.tsx`, Vitest browser mode) ask whether each exported part
  honours its contract on its own. They mount one part at a time, imported through `@/components/keyline/*` as a
  consumer would, run the Base UI wrapper contract (`describeConformance` in `tests/parts/conformance.tsx`) and axe
  over it, and count renders where that matters. Every component gets one, listing all of its exported parts.
- **Page specs** (`tests/browser/<component>[.<aspect>].spec.mjs`, Playwright Test) ask whether a component works in
  a page: keyboard paths, focus, motion, geometry across density, direction and theme, and flows that cross
  components. They run against a development-mode build of the demo app (`src/demo/`).

When a check needs only the part and its props, write it as a part test; when it needs a page, a layout or a real
input sequence across components, write a page spec.

```sh
pnpm test:parts                                 # every part test in Chromium, Firefox and WebKit
pnpm test:parts button                          # part tests whose file name matches
pnpm test:browser                               # every page spec, every engine (builds and serves the app itself)
pnpm exec playwright test toolbar menu          # page specs whose file name matches
pnpm exec playwright test --project=chromium    # one engine, without the @timing pass
```

Neither runner retries. A test that passes only sometimes has a cause, and the cause gets fixed
(.github/CONTRIBUTING.md, "Fix the cause"). A failed page spec keeps its trace under `.artifacts/playwright/` (open it
with `pnpm exec playwright show-trace <file>`).

## Writing a part test

```tsx
import "./render-count"; // first: it must load before react-dom

import { Button, ButtonAffix } from "@/components/keyline/ui/button";

import { describeConformance } from "./conformance";

describeConformance("button", {
  Button: { element: <Button>Save</Button>, refInstanceof: HTMLButtonElement, slot: "button", button: true },
  ButtonAffix: { element: <ButtonAffix>3</ButtonAffix>, refInstanceof: HTMLSpanElement, slot: "button-affix" },
});
```

- A part that needs context (a Menu item inside its Root and Popup) passes `wrap`, which renders it in place.
- `expectNoAxeViolations()` (`tests/parts/axe.ts`) runs axe over the document; mount inside `<main>`.
- `countRenders()` (`tests/parts/render-count.ts`) counts commits per component name, for parts whose cost is
  their re-renders.
- Generic parts also get a compile-only file in `tests/types/` (`pnpm test:types`), asserting how the value type flows
  to callbacks with `expectType`.

## Writing a page spec

```js
import { test, settle, idle, stable } from "./fixtures.mjs"

test("toolbar: arrows move focus, Home and End jump", async ({ open, ok, eng }) => {
  const p = await open({ route: "specimen", q: "dir=rtl", width: 1280, height: 900, ready: "#toolbar" })
  // …real input…
  ok("toolbar: ArrowRight moves to the next item", cond, detail)
})
```

- `open()` makes a fresh browser context per page, so tests never share state. Use one `test()` per
  independent block; steps that build on each other's page state stay inside one test.
- `ok(name, cond, detail)` is a soft assertion: every check in a test runs and is printed; any failure fails the
  test. Never loosen a condition or a tolerance when moving a check.
- `eng` is `"chromium"`, `"firefox"` or `"webkit"`. Engine-specific branches stay explicit (`if (eng === "chromium")`) —
  `test.skip` is only for a combination that cannot exist (an emulation the engine lacks), with the reason.
- Waiting: `settle(p)` (fonts + two frames), `idle(p)` (no finite animation running), `stable(locator)` (its box
  stops moving), or a Playwright wait on the observable state (`locator.waitFor`, `expect.poll`,
  `waitForFunction`). A fixed `p.waitForTimeout(ms)` is kept only where the duration itself is the subject
  (a held press, a hover delay, a hold-then-fade, sampling motion) and is marked `// timing:` with why.
- No screenshots or pixel baselines in specs; assert on geometry, computed styles and the accessibility tree.
  For looking at a change by eye, use `pnpm capture` (see .github/CONTRIBUTING.md).
- Specimen entries: a spec that works inside a few specimen entries declares them once, after its imports:
  `test.use({ only: ["toolbar", "toolbar-overflow"] })` (the entry ids in `src/demo/App.tsx`). `open()` then loads
  `?only=…`, about 0.2 s instead of 1–4 s for the whole specimen, and fails if any listed entry is missing. Leave it
  out when a check is about the whole page (every entry, traversal, page geometry), and pass `open({ only: null })`
  for one test whose measurement depends on where the element sits on the full page (sub-pixel position).
- Timing: a test that measures a duration (settle time, frames to a commit, how long a jump takes) is tagged
  `test("…", { tag: "@timing" }, async …)`. The `*-timing` projects run those after the main pass, one at a time, so
  other workers' load is not in the measurement. Keep the tag to tests that need it; each costs about 2 s of wall time.
