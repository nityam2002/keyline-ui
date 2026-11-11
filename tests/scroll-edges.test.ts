import { test } from "node:test"
import assert from "node:assert/strict"
import { scrollEdges } from "../src/registry/keyline/lib/scroll-edges.ts"

const row = (scrollWidth: number, clientWidth: number, scrollLeft: number) => ({ scrollWidth, clientWidth, scrollLeft }) as HTMLElement

test("a row that fits is not marked", () => {
  assert.equal(scrollEdges(row(300, 300, 0)), "")
  // a sub-pixel overflow (zoom, fractional widths) is not overflow
  assert.equal(scrollEdges(row(300.5, 300, 0)), "")
})

test("LTR: end at rest, both partway, start at the end", () => {
  assert.equal(scrollEdges(row(500, 300, 0)), "end")
  assert.equal(scrollEdges(row(500, 300, 100)), "start end")
  assert.equal(scrollEdges(row(500, 300, 200)), "start")
  // within a pixel of either end counts as the end (scroll snapping, fractional scroll positions)
  assert.equal(scrollEdges(row(500, 300, 199.5)), "start")
  assert.equal(scrollEdges(row(500, 300, 0.5)), "end")
})

test("RTL: scrollLeft runs negative, the edges stay logical", () => {
  assert.equal(scrollEdges(row(500, 300, 0)), "end")
  assert.equal(scrollEdges(row(500, 300, -100)), "start end")
  assert.equal(scrollEdges(row(500, 300, -200)), "start")
})
