import { test } from "node:test";
import assert from "node:assert/strict";

// lib/data-table imports its siblings without an extension, as registry source does: register the resolver first,
// so `node --test tests/data-table.test.ts` runs on its own as well as under `pnpm test`.
await import("./resolve-ts.ts");
const {
  ariaSortOf,
  columnAlign,
  columnCellClassName,
  describeFilter,
  fromSortList,
  isFilterActive,
  matchesFilter,
  matchesSearch,
  nextSorting,
  pageRange,
  rowCode,
  selectionScope,
  sortLevelOf,
  toSortList,
} = await import("../src/registry/keyline/lib/data-table.ts");

/* ---------------- sorting ---------------- */

test("sorting converts to Keyline's sort list and back, level for level", () => {
  const sorting = [
    { id: "dock", desc: false },
    { id: "pallets", desc: true },
  ];
  const list = toSortList(sorting);
  assert.deepEqual(list, [
    { key: "dock", direction: "ascending" },
    { key: "pallets", direction: "descending" },
  ]);
  assert.deepEqual(fromSortList(list), sorting);
});

test("a plain press: the column alone, first direction, the other, then none", () => {
  let s = nextSorting([{ id: "dock", desc: false }], "slot");
  assert.deepEqual(s, [{ id: "slot", desc: false }]);
  s = nextSorting(s, "slot");
  assert.deepEqual(s, [{ id: "slot", desc: true }]);
  assert.deepEqual(nextSorting(s, "slot"), []);
});

test("a column that reads high-to-low first starts descending", () => {
  const s = nextSorting([], "kg", { first: "descending" });
  assert.deepEqual(s, [{ id: "kg", desc: true }]);
  assert.deepEqual(nextSorting(s, "kg", { first: "descending" }), [{ id: "kg", desc: false }]);
});

test("an additive press adds a level, flips it, then drops it, keeping the others", () => {
  let s = nextSorting([{ id: "dock", desc: false }], "slot", { additive: true });
  assert.deepEqual(s, [
    { id: "dock", desc: false },
    { id: "slot", desc: false },
  ]);
  s = nextSorting(s, "slot", { additive: true });
  assert.deepEqual(s, [
    { id: "dock", desc: false },
    { id: "slot", desc: true },
  ]);
  assert.deepEqual(nextSorting(s, "slot", { additive: true }), [{ id: "dock", desc: false }]);
});

test("a header's level: direction, 1-based place, level count; null when unsorted", () => {
  const sorting = [
    { id: "dock", desc: false },
    { id: "slot", desc: true },
  ];
  assert.deepEqual(sortLevelOf(sorting, "slot"), { direction: "descending", priority: 2, levels: 2 });
  assert.equal(sortLevelOf(sorting, "carrier"), null);
});

test("aria-sort: the first level only; later levels none at all; unsorted columns 'none'", () => {
  const sorting = [
    { id: "dock", desc: true },
    { id: "slot", desc: false },
  ];
  assert.equal(ariaSortOf(sorting, "dock"), "descending");
  assert.equal(ariaSortOf(sorting, "slot"), undefined);
  assert.equal(ariaSortOf(sorting, "carrier"), "none");
  assert.equal(ariaSortOf([], "dock"), "none");
});

/* ---------------- columns, pager, selection ---------------- */

test("column alignment comes from meta.align; anything else is the start", () => {
  assert.equal(columnAlign({ align: "end" }), "end");
  assert.equal(columnAlign({ align: "start" }), undefined);
  assert.equal(columnAlign(undefined), undefined);
  assert.equal(columnAlign("end"), undefined);
});

test("a column's cell classes come from meta.cellClassName; empty or not a string is none", () => {
  assert.equal(columnCellClassName({ cellClassName: "p-0" }), "p-0");
  assert.equal(columnCellClassName({ cellClassName: "" }), undefined);
  assert.equal(columnCellClassName({ cellClassName: 1 }), undefined);
  assert.equal(columnCellClassName(undefined), undefined);
});

test("page range: 1-based rows, page count at least 1, the page clamped to the last", () => {
  assert.deepEqual(pageRange({ pageIndex: 1, pageSize: 10 }, 64), { from: 11, to: 20, pages: 7, page: 1 });
  assert.deepEqual(pageRange({ pageIndex: 6, pageSize: 10 }, 64), { from: 61, to: 64, pages: 7, page: 6 });
  assert.deepEqual(pageRange({ pageIndex: 9, pageSize: 10 }, 64), { from: 61, to: 64, pages: 7, page: 6 });
  assert.deepEqual(pageRange({ pageIndex: 0, pageSize: 10 }, 0), { from: 0, to: 0, pages: 1, page: 0 });
});

test("row codes count across pages from 01", () => {
  assert.equal(rowCode(0, 10, 0), "01");
  assert.equal(rowCode(2, 10, 4), "25");
  assert.equal(rowCode(10, 10, 0), "101");
});

test("selection scope counts the selected rows and those the filter hides", () => {
  assert.deepEqual(selectionScope({ a: true, b: true, c: false, d: true }, ["a", "c"]), { count: 3, hidden: 2 });
  assert.deepEqual(selectionScope({}, ["a"]), { count: 0, hidden: 0 });
});

/* ---------------- filter model ---------------- */

test("an inactive filter filters nothing", () => {
  assert.equal(isFilterActive(undefined), false);
  assert.equal(isFilterActive({ kind: "text", value: "  " }), false);
  assert.equal(isFilterActive({ kind: "set", values: [] }), false);
  assert.equal(isFilterActive({ kind: "range", from: null, to: undefined }), false);
  assert.equal(matchesFilter(undefined, { kind: "set", values: [] }), true);
  assert.equal(matchesFilter("x", null), true);
});

test("text: contains, ignoring case and accents", () => {
  const f = { kind: "text", value: " lyon " } as const;
  assert.equal(matchesFilter("Saint-Priest, Lyon", f), true);
  assert.equal(matchesFilter("Kraków", { kind: "text", value: "krakow" }), true);
  assert.equal(matchesFilter("Metz", f), false);
  assert.equal(matchesFilter(null, f), false);
});

test("set: the value is one of the members", () => {
  const f = { kind: "set", values: ["DHL Freight", "Maersk"] } as const;
  assert.equal(matchesFilter("Maersk", f), true);
  assert.equal(matchesFilter("Rhenus Road", f), false);
  assert.equal(matchesFilter(undefined, f), false);
});

test("range: inclusive at both ends, either end open, dates and numbers", () => {
  const nov = (d: number) => new Date(2026, 10, d);
  const f = { kind: "range", from: nov(12), to: nov(16) } as const;
  assert.equal(matchesFilter(nov(12), f), true);
  assert.equal(matchesFilter(nov(16), f), true);
  assert.equal(matchesFilter(nov(17), f), false);
  assert.equal(matchesFilter(5, { kind: "range", from: 5 }), true);
  assert.equal(matchesFilter(4, { kind: "range", from: 5 }), false);
  assert.equal(matchesFilter(99, { kind: "range", to: 100 }), true);
  assert.equal(matchesFilter("12", { kind: "range", from: 5 }), false);
});

test("search: some value of the row contains the text; an empty search passes", () => {
  assert.equal(matchesSearch(["SH-20481", "Hamburg, DE", 1240], "hamb"), true);
  assert.equal(matchesSearch(["SH-20481", null, 1240], "124"), true);
  assert.equal(matchesSearch(["SH-20481"], "lyon"), false);
  assert.equal(matchesSearch([], " "), true);
});

test("a filter as a token's words", () => {
  assert.deepEqual(describeFilter({ kind: "text", value: " lyon " }), { op: "has", value: "lyon" });
  assert.deepEqual(describeFilter({ kind: "set", values: ["DHL"] }), { op: "is", value: "DHL" });
  assert.deepEqual(describeFilter({ kind: "set", values: ["DHL", "DSV"] }, { noun: ["carrier", "carriers"] }), {
    op: "is",
    value: "2 carriers",
  });
  assert.deepEqual(describeFilter({ kind: "range", from: 1, to: 5 }), { op: "in", value: "1–5" });
  assert.deepEqual(describeFilter({ kind: "range", from: 1 }), { op: "from", value: "1" });
  assert.deepEqual(describeFilter({ kind: "range", to: 5 }), { op: "to", value: "5" });
  assert.equal(describeFilter({ kind: "set", values: [] }), null);
});
