// Reduced motion, both paths (the system setting and the scoped ?motion=reduce): a held press does not lean, rows
// close at once.
import { test } from "./fixtures.mjs";
import { band, centre, bandRests } from "./lib/segmented-band.mjs";

for (const [q, ctx, name] of [
  ["", { reducedMotion: "reduce" }, "system"],
  ["?motion=reduce", {}, "scoped"],
]) {
  test(`reduced motion (${name}): no lean, rows close at once`, { tag: "@timing" }, async ({ open, ok }) => {
    const p = await open({ width: 1440, height: 900, route: "motion", q, ctx, ready: "[data-testid=lab-tug]" });
    const tug = p.locator("[data-testid=lab-tug]");
    await tug.scrollIntoViewIfNeeded();
    const seg = tug.locator("[data-tug='12'] [data-slot=segmented]");
    await bandRests(seg);
    await p.mouse.move(...(await centre(seg.locator("[data-kl-item]").nth(2))));
    await p.mouse.down();
    await p.waitForTimeout(150); // timing: a held press — long enough that the motion path would lean
    const t = await band(seg);
    await p.mouse.up();
    ok(`reduced (${name}): a held press does not lean`, !t.tug, t);
    const rows = p.locator("[data-testid=lab-rows]");
    await rows.scrollIntoViewIfNeeded();
    await p.locator("[data-testid=lab-rows-toggle]").click();
    await p.waitForTimeout(20); // timing: "at once" — nothing may be animating 20 ms after the toggle
    const anim = await rows.evaluate((t) =>
      [...t.querySelectorAll("tbody > tr")].some((r) => r.getAnimations().length > 0),
    );
    ok(`reduced (${name}): rows close at once`, !anim);
  });
}
