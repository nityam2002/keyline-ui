// Popover dock: a detached Popover keeps its cut in every engine — at rest and on the way in.
import { test, idle } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["avatar"] });

test("popover: a detached popover keeps its cut at rest and unfolds or fades on the way in", async ({ open, ok }) => {
  const p = await open({ width: 1280, height: 1000, ready: "[data-testid=av-more]" });
  const t = p.getByTestId("av-more");
  await t.scrollIntoViewIfNeeded();
  await t.click();
  const pop = p.locator(".kl-popover-float").last();
  await pop.waitFor({ state: "attached" });
  await p.waitForTimeout(60); // timing: sample the entry 60ms in, while it is still on the way in
  const mid = await pop.evaluate((e) => [getComputedStyle(e).clipPath, getComputedStyle(e).opacity]);
  await idle(p).catch(() => {});
  const rest = await pop.evaluate((e) => [
    getComputedStyle(e).clipPath,
    CSS.supports("corner-start-start-shape: bevel") ? getComputedStyle(e).cornerStartStartShape : "n/a",
  ]);
  const corner = await pop.evaluate(() => CSS.supports("corner-start-start-shape: bevel"));
  ok(
    "popover: a detached popover at rest keeps the cut (corner shape, or the clip-path polygon)",
    corner ? /bevel|superellipse\(0\)/.test(rest[1]) : rest[0].startsWith("polygon"),
    { rest },
  );
  ok(
    "popover: on the way in it unfolds where the cut is a corner shape and fades elsewhere",
    corner ? mid[0].startsWith("inset") : mid[0].startsWith("polygon"),
    { mid },
  );
  await p.keyboard.press("Escape");
  ok("no page errors", p.errs.length + p.consoleErrs.length === 0, [...p.errs, ...p.consoleErrs]);
});
