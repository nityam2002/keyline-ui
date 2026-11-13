// Rows leave and return in place: the rows below close the gap with motion, Undo opens the room again.
//
// The motion is recorded, not sampled: each row's animate() call is logged as it starts. A slide lasts --kl-t-fold
// (120ms) or --kl-t-unfold (160ms), shorter than a round trip to the page under load, so a sample of
// getAnimations() after the click can land after the slide has finished and read "no motion".
import { test } from "./fixtures.mjs";
import { until } from "./lib/probe.mjs";

test("rows: close the gap and reopen in place", async ({ open, ok }) => {
  const p = await open({ width: 1440, height: 900, route: "motion", ready: "[data-testid=lab-rows]" });
  const rows = p.locator("[data-testid=lab-rows]");
  await rows.scrollIntoViewIfNeeded();
  const toggle = p.locator("[data-testid=lab-rows-toggle]");
  await rows.evaluate((t) => {
    window.__rowSlides = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...a) {
      if (this.matches("tbody > tr") && t.contains(this))
        window.__rowSlides.push(this.querySelector("[data-slot=table-cell]").textContent);
      return animate.apply(this, a);
    };
  });
  // the rows that started a slide since the last read, in order
  const slides = () => p.evaluate(() => window.__rowSlides.splice(0));
  const moving = () =>
    rows.evaluate((t) => [...t.querySelectorAll("tbody > tr")].some((r) => r.getAnimations().length > 0));
  const ids = () =>
    rows.evaluate((t) =>
      [...t.querySelectorAll("tbody > tr")].map((r) => r.querySelector("[data-slot=table-cell]").textContent),
    );

  await toggle.click();
  await until(async () => !(await moving()) && (await rows.locator("tbody > tr").count()) === 3);
  const closed = await slides();
  ok(
    "rows: the rows below close the gap with motion (02 and 03 leave, 04 and 05 slide up), then rest",
    closed.join() === "SH-20484,SH-20485" && (await ids()).join() === "SH-20481,SH-20484,SH-20485" && !(await moving()),
    { closed, ids: await ids() },
  );

  await toggle.click();
  await until(async () => !(await moving()) && (await rows.locator("tbody > tr").count()) === 5);
  const reopened = await slides();
  ok(
    "rows: Undo opens the room again in place (02 and 03 return, 04 and 05 move down; 01 stays)",
    reopened.join() === "SH-20482,SH-20483,SH-20484,SH-20485" &&
      (await ids()).join() === "SH-20481,SH-20482,SH-20483,SH-20484,SH-20485" &&
      !(await moving()),
    { reopened, ids: await ids() },
  );
});
