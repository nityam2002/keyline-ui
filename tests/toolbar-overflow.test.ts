import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LAYOUT_UNIT,
  fitStep,
  fitsIn,
  fold,
  isGroup,
  kindOf,
  overflows,
  splits,
  type FitInput,
  type RowItem,
} from "../src/registry/keyline/lib/toolbar-overflow.ts";

/** An element as the toolbar sees it: its attributes. */
type El = { name: string; getAttribute(n: string): string | null };
const el = (name: string, attrs: Record<string, string> = {}): El => ({
  name,
  getAttribute: (n) => attrs[n] ?? null,
});
const slot = (name: string, s: string, more: Record<string, string> = {}) => el(name, { "data-slot": s, ...more });

test("kindOf: items by data-slot; separators; the primary, inputs, spacers and foreign elements stay", () => {
  for (const s of ["toolbar-button", "toolbar-toggle", "toolbar-link", "toolbar-menu-trigger", "toolbar-group"])
    assert.equal(kindOf(slot("x", s)), "unit", s);
  assert.equal(kindOf(slot("x", "toolbar-toggle-group")), "unit");
  assert.equal(kindOf(slot("x", "toolbar-separator")), "separator");
  assert.equal(kindOf(slot("x", "toolbar-button", { "data-kl-primary": "" })), "keep");
  assert.equal(kindOf(slot("x", "toolbar-menu-trigger", { "data-kl-primary": "" })), "keep");
  assert.equal(kindOf(slot("x", "toolbar-input-cell")), "keep");
  assert.equal(kindOf(slot("x", "toolbar-spacer")), "keep");
  assert.equal(kindOf(el("div")), "keep");
  assert.equal(kindOf(slot("x", "button")), "keep", "a Keyline Button is not a toolbar item");
  assert.equal(kindOf(null), "keep");
});

test("kindOf reads only the element: a wrapped or custom item is the element with the slot", () => {
  // <Tooltip><ToolbarButton/></Tooltip> and a caller's <FilterToken/> render these same elements; the
  // element type that rendered them plays no part
  const wrapped = slot("Undo (in a Tooltip)", "toolbar-button");
  const custom = slot("Carrier filter (FilterToken)", "toolbar-group");
  assert.equal(kindOf(wrapped), "unit");
  assert.equal(kindOf(custom), "unit");
  assert.equal(isGroup(custom), true);
  assert.equal(isGroup(wrapped), false);
});

test("splits: a ToolbarGroup of plain items gives them up one at a time", () => {
  const g = slot("g", "toolbar-group");
  const a = slot("a", "toolbar-button");
  const b = slot("b", "toolbar-toggle");
  assert.equal(splits(g, [a, b]), true);
  assert.equal(splits(slot("g", "toolbar-group", { "data-kl-keep-together": "" }), [a, b]), false, "keepTogether");
  assert.equal(splits(slot("g", "toolbar-toggle-group"), [a, b]), false, "a toggle group stays whole");
  assert.equal(splits(g, [a]), false, "one item is the group");
  assert.equal(splits(g, [a, slot("p", "toolbar-button", { "data-kl-primary": "" })]), false, "holds a primary");
  assert.equal(splits(g, [a, slot("n", "toolbar-group")]), false, "holds a group");
  assert.equal(splits(g, [a, el("div")]), false, "holds a foreign element");
});

// the overflow specimen: History (split group of Undo, Redo), Wrap, Layout (toggle group), Insert (menu),
// a separator, Duplicate, Help, Publish (primary)
const [history, undo, redo, wrap, layout, insert, sep, dup, help, publish] = [
  "history",
  "undo",
  "redo",
  "wrap",
  "layout",
  "insert",
  "sep",
  "dup",
  "help",
  "publish",
];
const row: RowItem<string>[] = [
  { el: history!, kind: "unit", members: [undo!, redo!] },
  { el: wrap!, kind: "unit", members: null },
  { el: layout!, kind: "unit", members: null },
  { el: insert!, kind: "unit", members: null },
  { el: sep!, kind: "separator", members: null },
  { el: dup!, kind: "unit", members: null },
  { el: help!, kind: "unit", members: null },
  { el: publish!, kind: "keep", members: null },
];

test("fold: units leave from the end; nothing leaves at 0", () => {
  const f0 = fold(row, 0);
  assert.deepEqual(f0.units, [undo, redo, wrap, layout, insert, dup, help]);
  assert.equal(f0.folded.size, 0);
  assert.equal(f0.more, null);
  const f1 = fold(row, 1);
  assert.deepEqual([...f1.folded], [help]);
  assert.deepEqual(f1.more, { before: help });
});

test("fold: a separator leaves with the item after it, and More takes the separator's place", () => {
  const f = fold(row, 2);
  assert.deepEqual(new Set(f.folded), new Set([help, dup, sep]));
  assert.deepEqual(f.more, { before: sep });
});

test("fold: a splitting group leaves one item at a time, and More follows the part that stays", () => {
  const f = fold(row, 6);
  assert.equal(f.partial, history);
  assert.ok(f.folded.has(redo) && !f.folded.has(undo) && !f.folded.has(history));
  assert.deepEqual(f.more, { after: history });
  const all = fold(row, 7);
  assert.equal(all.partial, null);
  assert.ok(all.folded.has(history), "a group whose items all left leaves whole");
  assert.deepEqual(all.more, { before: history });
  assert.ok(!all.folded.has(publish), "the primary never leaves");
});

test("fold: a count past the units is all of them", () => {
  assert.equal(fold(row, 99).folded.size, fold(row, 7).folded.size);
});

test("fold: a wrapped or custom item folds like a plain one (it is classified by its element)", () => {
  // the same row as the toolbar builds it: each element classified by kindOf
  const els = [
    slot("Undo in a Tooltip", "toolbar-button"),
    slot("FilterToken", "toolbar-group", { "data-kl-keep-together": "" }),
    slot("Search", "toolbar-input-cell"),
    slot("Save", "toolbar-button", { "data-kl-primary": "" }),
  ];
  const items = els.map((e) => ({ el: e, kind: kindOf(e), members: null }));
  const f = fold(items, 1);
  assert.deepEqual(
    [...f.folded].map((e) => e.name),
    ["FilterToken"],
  );
  const g = fold(items, 2);
  assert.deepEqual([...g.folded].map((e) => e.name).sort(), ["FilterToken", "Undo in a Tooltip"]);
  assert.equal(fold(items, 3).folded.size, 2, "the input and the primary stay");
});

test("overflows: the sub-pixel edge. Half a pixel of items over the row is overflow; float noise is not", () => {
  // WebKit measured 344.53px of items in a 344px row: the row would clip 0.53px and scroll by it, so its last
  // unit leaves. Compared with clientWidth rounded up to 345 (or with a +1 tolerance) it stayed.
  assert.equal(overflows(344.53, 344), true);
  assert.equal(overflows(344 + LAYOUT_UNIT, 344), true, "one layout unit over");
  assert.equal(overflows(344 + LAYOUT_UNIT / 2, 344), false, "less than a layout unit: summing rects");
  assert.equal(overflows(344, 344), false, "exactly full fits");
  assert.equal(overflows(343.5, 344), false);
});

test("fitsIn: a unit comes back only into room it fits, with no headroom asked", () => {
  assert.equal(fitsIn(80, 80), true);
  assert.equal(fitsIn(80.53, 80), false);
  assert.equal(fitsIn(80 + LAYOUT_UNIT / 2, 80), true);
});

const at = (o: Partial<FitInput>): FitInput => ({
  count: 0,
  total: 7,
  available: 344,
  extent: 300,
  free: 44,
  need: Infinity,
  blocked: null,
  ...o,
});

test("fitStep: one more out while the items overflow, remembering the size it folded at", () => {
  assert.deepEqual(fitStep(at({ extent: 344.53 })), { count: 1, blocked: { count: 0, available: 344 } });
  assert.deepEqual(fitStep(at({ count: 7, extent: 400 })), { count: 7, blocked: null }, "nothing left to fold");
});

test("fitStep: a fitting row with nothing out stays", () => {
  assert.deepEqual(fitStep(at({ extent: 344 })), { count: 0, blocked: null });
});

test("fitStep: one back when the free space holds it; not when it would overflow by a fraction", () => {
  assert.equal(fitStep(at({ count: 2, extent: 280, free: 64, need: 64 })).count, 1);
  assert.equal(fitStep(at({ count: 2, extent: 280, free: 64, need: 64.53 })).count, 2);
  assert.equal(fitStep(at({ count: 2, need: Infinity })).count, 2, "a unit never measured doesn't come back");
});

test("fitStep: no unit comes back at the size it just left at (the passes settle)", () => {
  const blocked = { count: 1, available: 344 };
  // the fold from 1 to 2 happened at 344: at 344 or narrower it stays at 2 even if the arithmetic says it fits
  assert.equal(fitStep(at({ count: 2, free: 100, need: 50, blocked })).count, 2);
  assert.equal(fitStep(at({ count: 2, available: 343, free: 100, need: 50, blocked })).count, 2);
  // wider than that, it comes back
  assert.equal(fitStep(at({ count: 2, available: 345, free: 100, need: 50, blocked })).count, 1);
  // a block from another count doesn't hold
  assert.equal(fitStep(at({ count: 3, free: 100, need: 50, blocked })).count, 2);
});
