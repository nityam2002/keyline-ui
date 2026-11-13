import { test } from "node:test";
import assert from "node:assert/strict";
import { land, VIEW } from "../site/lib/contours.ts";
import { flatten, crossings, type P } from "./geometry.ts";

const { rings, keyline } = land();
// every subpath, tagged with the level it belongs to
const paths = [...rings.map((r) => r.d), keyline].flatMap((d, level) => flatten(d).map((pts) => ({ level, pts })));

test("the field draws every level, the keyline included", () => {
  assert.ok(rings.length >= 14);
  // one keyline: a single line meandering through the hills (one subpath)
  assert.equal(flatten(keyline).length, 1);
  assert.ok(keyline.startsWith("M"));
  assert.ok(paths.length >= 15);
});

test("no contour crosses itself or another level (the keyline included)", () => {
  assert.deepEqual(crossings(paths), []);
});

test("neighbouring levels keep a readable gap where the sheet shows them", () => {
  // closest approach between different levels, inside the visible viewBox
  const vis = (p: P) => p[0] > VIEW.x && p[0] < VIEW.x + VIEW.w && p[1] > VIEW.y && p[1] < VIEW.y + VIEW.h;
  const pts = paths.flatMap((p) => p.pts.filter(vis).map((q) => ({ level: p.level, q })));
  const C = 10;
  const grid = new Map<string, typeof pts>();
  for (const p of pts) {
    const key = `${Math.floor(p.q[0] / C)},${Math.floor(p.q[1] / C)}`;
    grid.set(key, [...(grid.get(key) ?? []), p]);
  }
  let min = Infinity;
  for (const p of pts) {
    const gx = Math.floor(p.q[0] / C),
      gy = Math.floor(p.q[1] / C);
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (const o of grid.get(`${gx + dx},${gy + dy}`) ?? [])
          if (o.level !== p.level) min = Math.min(min, Math.hypot(o.q[0] - p.q[0], o.q[1] - p.q[1]));
  }
  // hill country is steep in places, where the lines bunch as on a real survey map; they still never touch
  assert.ok(min > 5, `closest approach between levels is ${min.toFixed(1)} units`);
});
