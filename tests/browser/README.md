# Browser specs

Playwright Test specs, one file per component or behaviour (`<component>[.<aspect>].spec.mjs`), run in Chrome
(the installed Chrome channel) and WebKit against a development-mode build of the demo app (`src/demo/`).

```sh
pnpm test:browser                               # every spec, both engines (builds and serves the app itself)
pnpm exec playwright test toolbar menu          # specs whose file name matches
pnpm exec playwright test --project=chromium    # one engine, without the @timing pass
```

A failed test is retried once with a trace, kept under `.artifacts/playwright/` (open a trace with
`pnpm exec playwright show-trace <file>`). A test that fails and then passes on its one retry is reported as flaky.

## Writing a spec

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
- `eng` is `"chromium"` or `"webkit"`. Engine-specific branches stay explicit (`if (eng === "chromium")`) —
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
