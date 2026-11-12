import { test } from "node:test";
import assert from "node:assert/strict";
import { groupBy, hasGroups, longestValue } from "../src/registry/keyline/lib/options.ts";

test("groupBy keeps first-appearance order of groups and of options inside them", () => {
  const list = [
    { v: "a", group: "Rotterdam" },
    { v: "b", group: "Antwerp" },
    { v: "c", group: "Rotterdam" },
    { v: "d" },
    { v: "e", group: "Antwerp" },
  ];
  assert.deepEqual(
    groupBy(list).map((g) => [g.group, g.items.map((o) => o.v)]),
    [
      ["Rotterdam", ["a", "c"]],
      ["Antwerp", ["b", "e"]],
      ["", ["d"]],
    ],
  );
  assert.deepEqual(groupBy([]), []);
  assert.equal(hasGroups(list), true);
  const ungrouped: { v: string; group?: string }[] = [{ v: "x" }, { v: "y", group: "" }];
  assert.equal(hasGroups(ungrouped), false);
});

test("longestValue: ends, steps, signs, separators and decimals", () => {
  assert.equal(longestValue(0, 100), "100");
  assert.equal(longestValue(-40, 40, 1, "en"), "-40");
  assert.equal(longestValue(0, 40, 0.5, "en", { minimumFractionDigits: 1 }), "40.0");
  assert.equal(longestValue(0, 12000, 100, "en"), "12,000");
  assert.equal(longestValue(0, 1, 0.01, "en", { style: "percent" }), "100%");
  // the step beside an end can be longer than the end itself
  assert.equal(longestValue(0, 10, 0.25, "en"), "0.25");
});
