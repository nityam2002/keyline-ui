// Motion tokens: square is the default; the Stretch tokens are settle times; reduced motion zeroes every timing
// token.
import { test } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["split"] });

test("motion tokens: square default and the Stretch settle times", async ({ open, ok }) => {
  const p = await open({ route: "specimen", width: 1440, height: 900, ready: "[data-kl-stretch]" });
  const t = await p.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      cut: cs.getPropertyValue("--kl-cut").trim(),
      lead: cs.getPropertyValue("--kl-stretch-lead").trim(),
      trail: cs.getPropertyValue("--kl-stretch-trail").trim(),
    };
  });
  ok("default: --kl-cut is 0 (square)", t.cut === "0", t);
  ok(
    "stretch tokens are settle times: lead 100, trail 220 (inside the 220ms everyday cap)",
    t.lead === "100" && t.trail === "220",
    t,
  );
});

test("motion tokens: reduced motion zeroes every timing token", async ({ open, ok }) => {
  const r = await open({ route: "specimen", q: "motion=reduce", width: 1440, height: 900, ready: "[data-kl-stretch]" });
  const z = await r.evaluate(() => {
    const cs = getComputedStyle(document.querySelector("[data-kl-stretch]") ?? document.documentElement);
    return [
      "--kl-t-flood",
      "--kl-t-unflood",
      "--kl-t-unfold",
      "--kl-t-fold",
      "--kl-stretch-lead",
      "--kl-stretch-trail",
    ].map((k) => [k, cs.getPropertyValue(k).trim()]);
  });
  ok(
    "reduced motion: every timing token is zero",
    z.every(([, v]) => parseFloat(v) === 0),
    z,
  );
});

// A consumer's production build minifies the tokens (`160ms` ships as `.16s`): the motion reads the unit, so a token in
// seconds times the same motion as one in milliseconds. (cssMs once parsed `.16s` as 0.16ms: every timed motion snapped.)
for (const [form, lead, trail] of [
  ["ms", "100ms", "220ms"],
  ["s (minified)", ".1s", ".22s"],
]) {
  test(`motion tokens: the Stretch band travels with its tokens in ${form}`, async ({ open, ok }) => {
    const p = await open({ route: "specimen", width: 1440, height: 900, ready: "[data-kl-stretch]" });
    const host = p
      .locator("[data-kl-stretch]")
      .filter({ has: p.locator(":scope > [data-kl-band]:not([hidden])") })
      .first();
    await host.evaluate(
      (el, [l, t]) => {
        el.style.setProperty("--kl-stretch-lead", l);
        el.style.setProperty("--kl-stretch-trail", t);
      },
      [lead, trail],
    );
    const items = host.locator("[data-kl-item]");
    // the item farthest from the band, so the travel is long enough to watch
    const target = await host.evaluate((el) => {
      const b = window.__klBand(el.querySelector(":scope > [data-kl-band]"));
      const its = [...el.querySelectorAll("[data-kl-item]")].filter((i) => i.closest("[data-kl-stretch]") === el);
      let best = 0,
        far = -1;
      its.forEach((i, k) => {
        const d = Math.abs(i.getBoundingClientRect().left - b.left) + Math.abs(i.getBoundingClientRect().top - b.top);
        if (d > far) {
          far = d;
          best = k;
        }
      });
      return best;
    });
    const landed = () =>
      host.evaluate((el, k) => {
        const b = window.__klBand(el.querySelector(":scope > [data-kl-band]"));
        const it = [...el.querySelectorAll("[data-kl-item]")]
          .filter((i) => i.closest("[data-kl-stretch]") === el)
          [k].getBoundingClientRect();
        return (
          Math.abs(b.left - it.left) <= 2 &&
          Math.abs(b.right - it.right) <= 2 &&
          Math.abs(b.top - it.top) <= 2 &&
          Math.abs(b.bottom - it.bottom) <= 2
        );
      }, target);
    await items.nth(target).click();
    await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const early = await landed();
    await p.waitForTimeout(700); // timing: past the 220ms trail settle, with margin for a loaded runner
    const late = await landed();
    ok(`stretch (${form}): two frames after the press the band is still travelling, then it lands`, !early && late, {
      early,
      late,
    });
  });
}
