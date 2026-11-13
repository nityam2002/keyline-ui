// The shared Stretch band (on the Period segmented control): it settles inside the cap, and a resize during the
// move ends with the band on the new geometry. The band's position is sampled every frame: that sampling and its
// windows are the measurement.
import { test, idle } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["split"] });

test("stretch: settle time and a resize mid-move", { tag: "@timing" }, async ({ open, ok }) => {
  const p = await open({ route: "specimen", width: 1440, height: 900, ready: '[aria-label="Period"] [data-kl-band]' });
  const seg = p.locator('[aria-label="Period"]').first();
  await seg.scrollIntoViewIfNeeded();
  await idle(p);
  const items = seg.locator("[data-kl-item]:not([data-disabled])");
  const n = await items.count();
  // the 700ms per-frame sampling window starts at the press itself (not before Playwright's click), so a slow
  // click on a loaded machine cannot use up the window before the band moves
  await seg.evaluate((s) => {
    const band = s.querySelector(":scope > [data-kl-band]");
    window.__f = [];
    window.__fdone = false;
    const go = () => {
      const t0 = performance.now();
      const loop = () => {
        const r = window.__klBand(band);
        window.__f.push([performance.now() - t0, r.left, r.right]);
        if (performance.now() - t0 < 700) requestAnimationFrame(loop);
        else window.__fdone = true;
      };
      loop();
    };
    s.addEventListener("pointerdown", go, { once: true, capture: true });
  });
  await items.nth(n - 1).click();
  await p.waitForFunction(() => window.__fdone, null, { timeout: 5000 }).catch(() => {}); // the sampling window has run
  const settle = await p.evaluate(() => {
    const f = window.__f;
    const last = f[f.length - 1];
    let start = null;
    let end = 0;
    for (const [t, l, r] of f) {
      if (start === null && (Math.abs(l - f[0][1]) > 0.5 || Math.abs(r - f[0][2]) > 0.5)) start = t;
      if (Math.abs(l - last[1]) > 0.5 || Math.abs(r - last[2]) > 0.5) end = t;
    }
    return start === null ? -1 : Math.round(end - start);
  });
  ok("stretch: the band moves and settles within 260ms of its first movement", settle > 0 && settle <= 260, settle);
  await items.nth(0).click();
  await p.waitForTimeout(50); // timing: the resize must land while the band is still moving
  await seg.evaluate((s) => s.querySelectorAll("[data-kl-item]").forEach((el) => (el.style.paddingInline = "24px")));
  await p.waitForTimeout(800); // timing: kept, the settle window after a mid-move resize (r25's measurement window)
  const geo = await seg.evaluate((s) => {
    const band = window.__klBand(s.querySelector(":scope > [data-kl-band]"));
    const act = s.querySelector("[data-kl-covered]")?.getBoundingClientRect();
    return act && [band.left - act.left, band.right - act.right].map((v) => Math.round(v * 10) / 10);
  });
  ok(
    "stretch: a resize during the move ends with the band on the new geometry",
    geo && Math.abs(geo[0]) <= 1 && Math.abs(geo[1]) <= 1,
    geo,
  );
});
