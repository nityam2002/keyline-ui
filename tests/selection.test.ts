import { test } from "node:test"
import assert from "node:assert/strict"
import { patchWithUndo, removeWithUndo, restrictTo, scopeOf, setMany, toggle } from "../src/registry/keyline/lib/selection.ts"

const rows = Array.from({ length: 10 }, (_, i) => ({ id: `r${i}`, carrier: i % 2 ? "DHL" : "DSV" }))
const ids = rows.map((r) => r.id)

test("scope counts selected rows hidden by filters", () => {
  const sel = new Set(["r0", "r1", "r8"])
  const s = scopeOf(sel, ["r0", "r1", "r2", "r3"], ["r0", "r1"])
  assert.deepEqual(s, { count: 3, visible: 2, hidden: 1, page: "all", allMatching: false })
})

test("page state: some / none / all; empty page is none", () => {
  assert.equal(scopeOf(new Set(["r0"]), ids, ["r0", "r1"]).page, "some")
  assert.equal(scopeOf(new Set(), ids, ["r0"]).page, "none")
  assert.equal(scopeOf(new Set(["r0"]), ids, []).page, "none")
})

test("all matching is false for an empty result set", () => {
  assert.equal(scopeOf(new Set(["r0"]), [], []).allMatching, false)
})

test("toggle and setMany never mutate their input", () => {
  const a = new Set(["r0"])
  const b = toggle(a, "r1", true)
  const c = setMany(b, ["r0", "r1"], false)
  assert.deepEqual([...a], ["r0"])
  assert.deepEqual([...b].sort(), ["r0", "r1"])
  assert.equal(c.size, 0)
})

test("keep visible only drops hidden selections", () => {
  assert.deepEqual([...restrictTo(new Set(["r0", "r8"]), ["r0", "r1"])], ["r0"])
})

test("undo restores each row's OWN previous value", () => {
  const { next, undo, count } = patchWithUndo(rows, new Set(["r0", "r1"]), (r) => ({ ...r, carrier: "Rhenus" }))
  assert.equal(count, 2)
  assert.deepEqual(next.slice(0, 2).map((r) => r.carrier), ["Rhenus", "Rhenus"])
  // another edit lands between the action and Undo: undo must not clobber it
  const later = next.map((r) => (r.id === "r5" ? { ...r, carrier: "CEVA" } : r))
  const back = undo(later)
  assert.deepEqual(back.slice(0, 2).map((r) => r.carrier), ["DSV", "DHL"])
  assert.equal(back.find((r) => r.id === "r5")!.carrier, "CEVA")
})

test("remove + undo reinserts at the original indexes, even after other removals", () => {
  const { next, undo } = removeWithUndo(rows, new Set(["r0", "r4", "r9"]))
  assert.deepEqual(next.map((r) => r.id), ["r1", "r2", "r3", "r5", "r6", "r7", "r8"])
  assert.deepEqual(undo(next).map((r) => r.id), ids)
  const shorter = next.filter((r) => r.id !== "r2")
  assert.deepEqual(undo(shorter).map((r) => r.id), ["r0", "r1", "r3", "r4", "r5", "r6", "r7", "r8", "r9"])
})

test("undo is idempotent when the rows are already back", () => {
  const { undo } = removeWithUndo(rows, new Set(["r3"]))
  assert.deepEqual(undo(rows).map((r) => r.id), ids)
})
