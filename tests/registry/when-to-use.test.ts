// Every component says when to reach for it (`whenToUse` in its meta, shown on its docs page), and that guidance stays
// on the site: the build strips it, so no item JSON a consumer installs carries it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadMetas, buildRegistry } from "../../scripts/registry/build.ts";

const metas = await loadMetas();

test("every registry:ui meta has a whenToUse of at most 280 characters", () => {
  const ui = metas.filter((m) => m.type === "registry:ui");
  assert.ok(ui.length > 0, "no registry:ui metas found");
  for (const m of ui) {
    const w = m.whenToUse?.trim() ?? "";
    assert.ok(w.length > 0, `${m.metaFile}: add whenToUse`);
    assert.ok(w.length <= 280, `${m.metaFile}: whenToUse is ${w.length} characters; keep it to 280`);
  }
});

test("no built item carries whenToUse", async () => {
  const built = await buildRegistry();
  for (const [file, json] of built.items) assert.ok(!json.includes('"whenToUse"'), `${file} ships whenToUse`);
});
