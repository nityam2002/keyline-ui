import { test } from "node:test";
import assert from "node:assert/strict";
import {
  nextSort,
  sortOf,
  compareValues,
  pageWindow,
  nextSortList,
  sortLevel,
  compareBy,
  type SortList,
} from "../src/registry/keyline/lib/collection.ts";

test("nextSort cycles a column and starts a new one fresh", () => {
  let s = nextSort(null, "eta");
  assert.deepEqual(s, { key: "eta", direction: "ascending" });
  s = nextSort(s, "eta");
  assert.deepEqual(s, { key: "eta", direction: "descending" });
  assert.equal(nextSort(s, "eta"), null);
  assert.deepEqual(nextSort(s, "eta", { clearable: false }), { key: "eta", direction: "ascending" });
  assert.deepEqual(nextSort(s, "weight"), { key: "weight", direction: "ascending" });
  // a column whose natural order is high-to-low
  const d = nextSort(null, "amount", { first: "descending" });
  assert.deepEqual(d, { key: "amount", direction: "descending" });
  assert.deepEqual(nextSort(d, "amount", { first: "descending" }), { key: "amount", direction: "ascending" });
  assert.equal(sortOf(d, "amount"), "descending");
  assert.equal(sortOf(d, "eta"), null);
});

test("compareValues: numeric-aware text, numbers, dates, empties last", () => {
  const boxes = ["Box 10", "box 9", "Box 1"].sort((a, b) => compareValues(a, b));
  assert.deepEqual(boxes, ["Box 1", "box 9", "Box 10"]);
  assert.ok(compareValues(2, 10) < 0);
  assert.ok(compareValues(2, 10, "descending") > 0);
  assert.ok(compareValues(new Date(2026, 0, 2), new Date(2026, 0, 1)) > 0);
  // empties go last in both directions
  assert.deepEqual(
    [null, 3, 1].sort((a, b) => compareValues(a, b)),
    [1, 3, null],
  );
  assert.deepEqual(
    [null, 3, 1].sort((a, b) => compareValues(a, b, "descending")),
    [3, 1, null],
  );
});

test("pageWindow keeps a constant number of slots once it collapses", () => {
  assert.deepEqual(pageWindow(1, 0), []);
  assert.deepEqual(pageWindow(2, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(pageWindow(1, 7), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(pageWindow(1, 20), [1, 2, 3, 4, 5, "gap-end", 20]);
  assert.deepEqual(pageWindow(4, 20), [1, 2, 3, 4, 5, "gap-end", 20]);
  assert.deepEqual(pageWindow(5, 20), [1, "gap-start", 4, 5, 6, "gap-end", 20]);
  assert.deepEqual(pageWindow(17, 20), [1, "gap-start", 16, 17, 18, 19, 20]);
  assert.deepEqual(pageWindow(20, 20), [1, "gap-start", 16, 17, 18, 19, 20]);
  assert.deepEqual(pageWindow(99, 20), pageWindow(20, 20));
  for (let p = 1; p <= 40; p++) assert.equal(pageWindow(p, 40).length, 7);
  assert.equal(pageWindow(10, 40, 2).length, 9);
});

test("nextSortList: a plain press is the single-column cycle and drops the other levels", () => {
  let l: SortList<string> = nextSortList([], "status");
  assert.deepEqual(l, [{ key: "status", direction: "ascending" }]);
  l = nextSortList(
    [
      { key: "status", direction: "ascending" },
      { key: "eta", direction: "ascending" },
    ],
    "status",
  );
  assert.deepEqual(l, [{ key: "status", direction: "descending" }]);
  assert.deepEqual(nextSortList(l, "status"), []);
  // a secondary column pressed plainly becomes the only sort, starting fresh
  assert.deepEqual(
    nextSortList(
      [
        { key: "status", direction: "ascending" },
        { key: "eta", direction: "descending" },
      ],
      "eta",
      { first: "descending" },
    ),
    [{ key: "eta", direction: "descending" }],
  );
});

test("nextSortList: an additive press adds, flips, then removes a level in place", () => {
  const a: SortList<string> = [{ key: "status", direction: "ascending" }];
  const b = nextSortList(a, "eta", { additive: true });
  assert.deepEqual(b, [
    { key: "status", direction: "ascending" },
    { key: "eta", direction: "ascending" },
  ]);
  const c = nextSortList(b, "eta", { additive: true });
  assert.deepEqual(c[1], { key: "eta", direction: "descending" });
  assert.deepEqual(nextSortList(c, "eta", { additive: true }), a);
  // removing the first level promotes the next
  assert.deepEqual(nextSortList(nextSortList(c, "status", { additive: true }), "status", { additive: true }), [
    { key: "eta", direction: "descending" },
  ]);
  assert.deepEqual(nextSortList(c, "eta", { additive: true, clearable: false })[1], {
    key: "eta",
    direction: "ascending",
  });
  assert.deepEqual(nextSortList([], "w", { additive: true, first: "descending" }), [
    { key: "w", direction: "descending" },
  ]);
});

test("sortLevel and compareBy: ties fall to the next level", () => {
  const l: SortList<"g" | "n"> = [
    { key: "g", direction: "ascending" },
    { key: "n", direction: "descending" },
  ];
  assert.deepEqual(sortLevel(l, "n"), { direction: "descending", priority: 2 });
  assert.equal(sortLevel(l, "x" as "g"), null);
  const rows = [
    { g: "b", n: 1 },
    { g: "a", n: 1 },
    { g: "a", n: 3 },
    { g: "b", n: null },
    { g: "a", n: 2 },
  ];
  const sorted = [...rows].sort(compareBy(l, (r, k) => r[k], "en"));
  assert.deepEqual(
    sorted.map((r) => `${r.g}${r.n}`),
    ["a3", "a2", "a1", "b1", "bnull"],
  );
  assert.equal(compareBy([], () => 0)(rows[0], rows[1]), 0);
});
