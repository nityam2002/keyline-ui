// The committed registry is what a fresh build makes: buildRegistry() in memory must match site/public/r byte for
// byte, so a change to a meta, a component's source or its CSS that was not rebuilt fails here, before CI's
// `pnpm registry:build && git diff --exit-code site/public/r`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { buildRegistry, ROOT, OUTPUT, INDEX } from "../../scripts/registry/build.ts";
import { generateTheme } from "../../scripts/registry/theme.ts";

const built = await buildRegistry();

test("the theme CSS is what theme/tokens.ts and theme/foundation.css generate (run pnpm registry:build)", () => {
  for (const [file, css] of generateTheme())
    assert.ok(readFileSync(ROOT + file, "utf8") === css, `${file} is stale: run pnpm registry:build`);
});

test("site/public/r holds exactly the items the metas define", () => {
  assert.deepEqual(readdirSync(ROOT + OUTPUT).toSorted(), [...built.items.keys()].toSorted());
});

test("every built item matches a fresh build (run pnpm registry:build)", () => {
  for (const [f, txt] of built.items)
    assert.ok(
      readFileSync(`${ROOT}${OUTPUT}/${f}`, "utf8") === txt,
      `${OUTPUT}/${f} is stale: run pnpm registry:build`,
    );
});

test("registry.json matches a fresh build (run pnpm registry:build)", () => {
  assert.ok(readFileSync(ROOT + INDEX, "utf8") === built.index, `${INDEX} is stale: run pnpm registry:build`);
});
