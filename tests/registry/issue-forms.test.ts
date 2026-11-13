// The issue forms' "Affected items" list is every item a consumer adds by name (components, blocks, themes) plus
// "not sure", so a new, renamed or removed item cannot leave the forms behind. The docs examples are installable
// blocks too, but a report about one is a report about the component it shows, so they are not listed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ROOT = new URL("../../", import.meta.url);
const index = JSON.parse(readFileSync(new URL("registry.json", ROOT), "utf8")) as {
  items: { name: string; type: string; files?: { path: string }[] }[];
};
const isExample = (it: { files?: { path: string }[] }) =>
  (it.files ?? []).some((f) => f.path.startsWith("src/registry/keyline/examples/"));
const expected = [
  ...index.items.filter((it) => /^registry:(ui|block|theme)$/.test(it.type) && !isExample(it)).map((it) => it.name),
  "not sure",
];

// The options of the dropdown with `id: items`: the `- name` lines after its `options:`, up to `validations:`.
function itemOptions(form: string): string[] {
  const block = /\n {4}id: items\n[\s\S]*?\n {6}options:\n([\s\S]*?)\n {4}validations:/.exec(form);
  assert.ok(block, "no dropdown with id: items");
  return block[1]!.split("\n").map((line) => line.replace(/^ {8}- /, ""));
}

for (const file of ["bug.yml", "accessibility.yml"])
  test(`.github/ISSUE_TEMPLATE/${file} lists every item a consumer adds by name`, () => {
    const form = readFileSync(new URL(`.github/ISSUE_TEMPLATE/${file}`, ROOT), "utf8");
    assert.deepEqual(itemOptions(form), expected);
  });
