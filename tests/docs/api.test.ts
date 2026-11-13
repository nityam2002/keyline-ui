// The component pages' API, data-attribute and CSS-variable tables come from site/generated/api/<name>.json. Those
// files must be what scripts/docs/api.ts makes from the current types, metas and source: a prop, a default, a
// `data-*` attribute or a CSS variable changed without `pnpm docs:api` fails here.
import { test } from "node:test";
import assert from "node:assert/strict";
import { drift, generateApi } from "../../scripts/docs/api.ts";

const generated = await generateApi();

test("site/generated/api matches the source (run pnpm docs:api)", () => {
  assert.deepEqual(drift(generated), []);
});

test("every page names its main props with their types", () => {
  const button = JSON.parse(generated.get("button.json") ?? "{}") as {
    parts: { name: string; props: { name: string; type: string; default: string }[] }[];
  };
  const variant = button.parts.find((p) => p.name === "Button")?.props.find((p) => p.name === "variant");
  assert.deepEqual(variant && { type: variant.type, default: variant.default }, {
    type: '"secondary" | "primary" | "destructive" | "quiet"',
    default: '"secondary"',
  });
});
