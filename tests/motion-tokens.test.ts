import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCssTime, parseCssLength, Spring } from "../src/registry/keyline/lib/keyline-motion.ts";

// A timing token reaches the runtime as whatever the consumer's CSS pipeline emitted. Minifiers (Lightning CSS,
// esbuild, cssnano) rewrite `160ms` to `.16s`, so the unit decides the value, never the leading digits.
test("time: ms and s resolve to the same milliseconds", () => {
  assert.equal(parseCssTime("160ms"), 160);
  assert.equal(parseCssTime(".16s"), 160);
  assert.equal(parseCssTime("0.16s"), 160);
  assert.equal(parseCssTime("1.5s"), 1500);
  assert.equal(parseCssTime(" 140ms "), 140); // custom properties keep their surrounding whitespace
  assert.equal(parseCssTime("140MS"), 140); // CSS units are ASCII case-insensitive
});

test("time: zero in any spelling is zero (reduced motion)", () => {
  for (const v of ["0", "0ms", "0s", ".0s", "0.0ms"]) assert.equal(parseCssTime(v), 0, v);
});

test("time: a unitless number is milliseconds (the --kl-stretch-* tokens)", () => {
  assert.equal(parseCssTime("100"), 100);
  assert.equal(parseCssTime("220"), 220);
});

test("time: anything else is not a time", () => {
  for (const v of ["", "  ", "auto", "12px", "160 ms", "calc(1s)", "var(--x)", "1e3q", "-", "NaN"])
    assert.equal(parseCssTime(v), null, v);
});

test("length: px or unitless px", () => {
  assert.equal(parseCssLength("12"), 12);
  assert.equal(parseCssLength("12px"), 12);
  assert.equal(parseCssLength(".5px"), 0.5);
  assert.equal(parseCssLength("0"), 0);
  for (const v of ["", "12ms", "1rem", "auto"]) assert.equal(parseCssLength(v), null, v);
});

// One parser: a component that reads a token with parseFloat alone ignores its unit (nav.tsx carried its own copy of
// the bug). Every token read in the registry goes through tokenMs / tokenPx.
const TOKEN_PARSEFLOAT = /parseFloat\(\s*(?:\w+\s*\?\s*)?getComputedStyle\([^)]*\)\s*\.getPropertyValue\(/;

test("the guard recognises the shapes the bug took", () => {
  assert.ok(TOKEN_PARSEFLOAT.test("const v = parseFloat(getComputedStyle(el).getPropertyValue(prop))")); // keyline-motion
  assert.ok(TOKEN_PARSEFLOAT.test("const v = el ? parseFloat(getComputedStyle(el).getPropertyValue(prop)) : NaN")); // nav.tsx
  assert.ok(!TOKEN_PARSEFLOAT.test("parseFloat(getComputedStyle(el).top)")); // a resolved length is fine
});

test("no registry file parses a token with parseFloat", async () => {
  const { readdir, readFile } = await import("node:fs/promises");
  const root = new URL("../src/registry/keyline/", import.meta.url);
  const files = (await readdir(root, { recursive: true })).filter((f) => /\.tsx?$/.test(f));
  const offenders: string[] = [];
  for (const f of files) {
    const src = await readFile(new URL(f, root), "utf8");
    if (TOKEN_PARSEFLOAT.test(src)) offenders.push(f);
  }
  assert.deepEqual(offenders, []);
});

// The spring is stepped once per frame (1/60s, up to 34ms after a late frame). It must hold for any settle time a token
// can give it: a fixed-step integrator diverged to NaN at 20ms and under (the band froze on `NaNpx`), which is what a
// misread token (0.16 for .16s) or a consumer's short token produced.
test("spring: any settle time converges with no overshoot, close to its stated time", () => {
  for (const ms of [1, 5, 10, 16, 20, 40, 100, 220, 600]) {
    for (const dt of [1 / 120, 1 / 60, 0.034]) {
      const s = new Spring(0).tune(ms);
      s.t = 100;
      let t = 0;
      let prev = 0;
      while (!s.done() && t < 5) {
        s.step(dt);
        t += dt;
        assert.ok(Number.isFinite(s.x) && Number.isFinite(s.v), `${ms}ms @${dt}: finite`);
        assert.ok(s.x <= 100 + 1e-9 && s.x >= prev - 1e-9, `${ms}ms @${dt}: monotonic, no overshoot (x=${s.x})`);
        prev = s.x;
      }
      assert.ok(s.done(), `${ms}ms @${dt}: settles`);
    }
    // the settle time's promise (SETTLE = 8): (1 + 8)·e^-8 = 0.302% of the travel left at that time, whatever the frames
    const s = new Spring(0).tune(ms);
    s.t = 100;
    s.step(ms / 1000);
    assert.ok(Math.abs(s.x - 100) <= 0.302 + 1e-6, `${ms}ms: ${s.x} at its settle time`);
  }
});

test("spring: stepping in pieces is the same motion as one step (frame rate does not change the curve)", () => {
  const a = new Spring(0).tune(220),
    b = new Spring(0).tune(220);
  a.t = b.t = 100;
  a.step(0.05);
  for (let i = 0; i < 5; i++) b.step(0.01);
  assert.ok(Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.v - b.v) < 1e-9, `${a.x} ${b.x}`);
});

test("spring: a retarget keeps position and velocity (rapid input never jumps)", () => {
  const s = new Spring(0).tune(220);
  s.t = 100;
  s.step(1 / 60);
  const { x, v } = s;
  s.t = -50;
  s.tune(100);
  assert.equal(s.x, x);
  assert.equal(s.v, v);
  s.step(1e-6);
  assert.ok(Math.abs(s.x - (x + v * 1e-6)) < 1e-6, "the next step carries on from the same position and velocity");
});

test("spring: untuned, it coasts at its velocity", () => {
  const s = new Spring(10);
  s.v = 30;
  s.step(0.5);
  assert.equal(s.x, 25);
});
