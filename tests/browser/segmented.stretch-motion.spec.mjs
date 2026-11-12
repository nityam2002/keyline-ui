// Per-frame samples of the segmented control's stretch band on #/motion. Sampled in Chromium only.
import { test, idle } from "./fixtures.mjs";

const Q = "theme=light&cut=on&density=default&motion=normal&dir=ltr";
const sample = (page, action) =>
  page.evaluate(async (action) => {
    const host = document.querySelector("[data-testid=motion-lab] .kl-segmented");
    const band = host.querySelector(":scope > [data-kl-band]");
    const items = [...host.querySelectorAll("[data-kl-item]")];
    const hr = host.getBoundingClientRect();
    const frames = [];
    const t0 = performance.now();
    const grab = () => {
      const b = window.__klBand(band);
      frames.push({
        t: Math.round(performance.now() - t0),
        l: +(b.left - hr.left).toFixed(1),
        r: +(b.right - hr.left).toFixed(1),
      });
    };
    if (action === "fwd") items[3].click();
    if (action === "reverse") {
      items[3].click();
      await new Promise((r) => setTimeout(r, 90));
      items[0].click();
    }
    await new Promise((res) => {
      const loop = () => {
        grab();
        performance.now() - t0 < 700 ? requestAnimationFrame(loop) : res();
      };
      loop();
    });
    const target = items[items.findIndex((i) => i.hasAttribute("data-checked"))].getBoundingClientRect();
    return {
      frames,
      sel: items.findIndex((i) => i.hasAttribute("data-checked")),
      frameW: hr.width,
      target: { l: target.left - hr.left, r: target.right - hr.left },
    };
  }, action);
const sum = (s) => {
  const f = s.frames;
  const end = f[f.length - 1];
  const settle = f.find((x, i) => f.slice(i).every((y) => Math.abs(y.l - end.l) < 0.5 && Math.abs(y.r - end.r) < 0.5));
  return {
    settleMs: settle?.t,
    inside: f.every((x) => x.l >= -0.5 && x.r <= s.frameW + 0.5),
    lands: Math.abs(end.l - s.target.l) < 1.5 && Math.abs(end.r - s.target.r) < 1.5,
    sel: s.sel,
    stretched: Math.max(...f.map((x) => x.r - x.l)) > Math.max(f[0].r - f[0].l, end.r - end.l) + 8,
  };
};
const SEG = "[data-testid=motion-lab] .kl-segmented";

test("motion: stretch band, forward and reversal mid-flight", { tag: "@timing" }, async ({ open, ok, eng }) => {
  test.skip(eng !== "chromium", "per-frame band sampling is calibrated for Chromium");
  const p = await open({ route: "motion", q: Q, width: 1200, height: 900, ready: SEG });
  await p.locator(`${SEG} [data-kl-item]`).nth(0).click();
  await idle(p);
  const fwd = sum(await sample(p, "fwd"));
  ok("forward: band stretches before it lands", fwd.stretched, fwd);
  ok("forward: lands on the selected item", fwd.lands && fwd.sel === 3, fwd);
  ok("forward: never leaves the frame", fwd.inside, fwd);
  ok("forward: settles within 600ms", fwd.settleMs != null && fwd.settleMs < 600, fwd);
  await p.locator(`${SEG} [data-kl-item]`).nth(1).click();
  await idle(p);
  const rev = sum(await sample(p, "reverse"));
  ok("reversal mid-flight: lands on the latest choice", rev.lands && rev.sel === 0, rev);
  ok("reversal mid-flight: never leaves the frame", rev.inside, rev);
});

test("motion: stretch band, reduced motion", { tag: "@timing" }, async ({ open, ok, eng }) => {
  test.skip(eng !== "chromium", "per-frame band sampling is calibrated for Chromium");
  const p = await open({
    route: "motion",
    q: Q.replace("motion=normal", "motion=reduce"),
    width: 1200,
    height: 900,
    ready: SEG,
  });
  await idle(p);
  const red = sum(await sample(p, "fwd"));
  ok("reduced motion: lands in the first frames, no stretch", red.lands && !red.stretched && red.settleMs <= 50, red);
});
