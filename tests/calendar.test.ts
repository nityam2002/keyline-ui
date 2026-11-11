// node --test tests/  (Node ≥ 22.18 strips TypeScript types natively; no test framework dependency)
import { test } from "node:test"
import assert from "node:assert/strict"
import { countAvailable, formatRange, order } from "../src/registry/keyline/lib/calendar.ts"

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day)
const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`

// ICU versions differ on spacing around the range dash ("5–9 Nov" vs "5 – 9 Nov"); that is locale output, not ours.
const fr = (...a: Parameters<typeof formatRange>) => formatRange(...a).replace(/\s*–\s*/g, "–").replace(/\u202f|\u2009/g, " ")

test("formatRange: same month, cross month, cross year, single day", () => {
  assert.equal(fr({ from: d(2026, 11, 5), to: d(2026, 11, 9) }), "5–9 Nov")
  assert.equal(fr({ from: d(2026, 11, 28), to: d(2026, 12, 3) }), "28 Nov–3 Dec")
  // the bug: comparing months only rendered "28–3 Jan" for this range
  assert.equal(fr({ from: d(2026, 12, 28), to: d(2027, 1, 3) }), "28 Dec 2026–3 Jan 2027")
  // same month number, different year must not collapse into one month
  assert.equal(fr({ from: d(2026, 11, 5), to: d(2027, 11, 9) }), "5 Nov 2026–9 Nov 2027")
  assert.equal(fr({ from: d(2026, 11, 5), to: d(2026, 11, 5) }), "5 Nov")
  assert.equal(fr(null), "")
})

test("formatRange follows the locale", () => {
  assert.match(formatRange({ from: d(2026, 11, 5), to: d(2026, 11, 9) }, "en-US"), /^Nov 5\s*–\s*9$/)
})

// the 17th and the 22nd are closed
const closed = (x: Date) => x.getMonth() === 10 && (x.getDate() === 17 || x.getDate() === 22)

test("range ordering and available-day count", () => {
  const r = order(d(2026, 11, 19), d(2026, 11, 12))
  assert.equal(iso(r.from), "2026-11-12")
  assert.equal(countAvailable(r, closed), 7) // 8 days minus the 17th
  assert.equal(countAvailable({ from: d(2026, 11, 16), to: d(2026, 11, 23) }, closed), 6)
})

