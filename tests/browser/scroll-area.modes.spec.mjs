// ScrollArea under reduced motion (Keyline scope and system), forced colours and more contrast, the platform probe
// (classic native bars), and touch.
import { test } from "./fixtures.mjs";
import { state, sample, center, until, ready } from "./lib/scroll-area.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["scroll-area"] });

/* ---------- REDUCED MOTION: reveal and fade are immediate; the idle hold stays ---------- */
for (const how of ["?motion=reduce", "os"]) {
  test(`scroll area: reduced motion (${how === "os" ? "system" : "Keyline scope"}) — no in-between frames, the hold kept`, async ({
    open,
    ok,
  }) => {
    const p = await open({
      width: 1280,
      height: 1000,
      q: how === "os" ? "" : how,
      ctx: how === "os" ? { reducedMotion: "reduce" } : {},
      ready: "[data-testid=sa-v]",
    });
    const v = await ready(p, "sa-v");
    const s = await state(v);
    const [cx, cy] = center(s.vpRect);
    await p.mouse.move(cx - 100, cy);
    await p.mouse.wheel(0, 60);
    const samples = await sample(v, 1400); // timing: the hold (~0.9s) and the instant reveal/fade are what is measured
    const between = samples.filter(([, o]) => o > 0.02 && o < 0.98);
    const shown = samples.filter(([, o]) => o === 1);
    ok(
      `reduced motion (${how === "os" ? "system" : "Keyline scope"}): the thumb appears and disappears without in-between frames, and still holds ~0.9s`,
      between.length === 0 && shown.length && shown.at(-1)[0] - shown[0][0] >= 600,
      { between: between.slice(0, 4), first: shown[0], last: shown.at(-1) },
    );
  });
}

/* ---------- FORCED COLOURS and MORE CONTRAST: always shown (Chrome emulates both) ---------- */
for (const [what, media] of [
  ["forced colours", { forcedColors: "active" }],
  ["more contrast", { contrast: "more" }],
]) {
  test(`scroll area: ${what} — the thumb shown at rest`, async ({ open, ok, eng }) => {
    test.skip(eng !== "chromium", "WebKit does not emulate forced colours / prefers-contrast");
    const p = await open({ width: 1280, height: 1000, ready: "[data-testid=sa-v]" });
    await p.emulateMedia(media);
    const v = await ready(p, "sa-v");
    await until(v, (ops) => ops.vertical === 1, 1000);
    const s = await state(v);
    ok(
      `${what}: the thumb is shown at rest, full width (a fading cue is not relied on)`,
      s.bars.vertical.op === 1 && (s.bars.vertical.scale === "none" || s.bars.vertical.scale === "1"),
      s.bars.vertical,
    );
  });
}

/* ---------- THE PLATFORM PROBE: classic native bars → always shown ----------
   WebKit draws classic bars for a styled ::-webkit-scrollbar. Chrome on macOS keeps overlay bars whatever the page
   says (and no launch flag changes that), so the classic branch is asserted in WebKit; the code is the same. */
test("scroll area: where native scrollbars take space, the thumb always shows", async ({ open, ok, eng }) => {
  test.skip(eng !== "webkit", "Chrome on macOS keeps overlay bars whatever the page says");
  const classic = () => {
    const add = () => {
      const st = document.createElement("style");
      // classic bars: a styled ::-webkit-scrollbar is classic in both engines (scrollbar-color, which Keyline's
      // theme sets and which inherits, would make Chrome ignore it, so it is reset here)
      st.textContent =
        "* { scrollbar-color: auto !important } ::-webkit-scrollbar { width: 15px; height: 15px; background: #ccc }";
      document.head.append(st);
    };
    if (document.head) add();
    else document.addEventListener("DOMContentLoaded", add);
  };
  const p = await open({ width: 1280, height: 1000, init: classic, ready: "[data-testid=sa-v]" });
  const v = await ready(p, "sa-v");
  await until(v, (ops, root) => root.dataset.klReveal === "always" && ops.vertical === 1, 1000);
  const s = await state(v);
  ok(
    "system: where native scrollbars take space, the thumb always shows (data-kl-reveal=always)",
    s.reveal === "always" && s.bars.vertical.op === 1,
    { reveal: s.reveal, op: s.bars.vertical.op },
  );
});

/* ---------- TOUCH: no hover reveal; a touch scroll reveals ---------- */
test("scroll area: touch — no hover reveal; a touch scroll reveals", async ({ open, ok, eng }) => {
  const p = await open({
    width: 400,
    height: 860,
    ctx: { hasTouch: true, isMobile: eng === "chromium" },
    ready: "[data-testid=sa-v]",
  });
  const hoverNone = await p.evaluate(() => matchMedia("(hover: none)").matches);
  const v = await ready(p, "sa-v");
  let s = await state(v);
  if (hoverNone) {
    await p.mouse.move(s.bars.vertical.bar.x + 6, s.bars.vertical.bar.y + 30);
    await p.waitForTimeout(200); // timing: "never reveals" — nothing may happen within the reveal time
    s = await state(v);
    ok(
      "touch: a device without hover never reveals by 'hover' (no sticky reveal after a tap)",
      s.bars.vertical.op === 0,
      s.bars.vertical.op,
    );
  }
  // a touch scroll: Base UI treats every scroll in touch modality as the reader's
  await v.evaluate((root) => {
    root.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "touch", bubbles: true }));
    root.firstElementChild.scrollTop += 120;
  });
  await until(v, (ops) => ops.vertical === 1, 1000);
  s = await state(v);
  ok("touch: a touch scroll reveals the thumb", s.bars.vertical.op === 1, s.bars.vertical.op);
});
