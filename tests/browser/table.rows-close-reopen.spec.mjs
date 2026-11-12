// Rows leave and return in place: the rows below close the gap with motion, Undo opens the room again.
import { test } from "./fixtures.mjs";
import { until } from "./lib/probe.mjs";

test("rows: close the gap and reopen in place", async ({ open, ok }) => {
  const p = await open({ width: 1440, height: 900, route: "motion", ready: "[data-testid=lab-rows]" });
  const rows = p.locator("[data-testid=lab-rows]");
  await rows.scrollIntoViewIfNeeded();
  const toggle = p.locator("[data-testid=lab-rows-toggle]");
  const moving = () =>
    rows.evaluate((t) => [...t.querySelectorAll("tbody > tr")].some((r) => r.getAnimations().length > 0));
  await toggle.click();
  await p.waitForTimeout(30); // timing: samples the rows while their motion should be running
  const m1 = await moving();
  await until(async () => !(await moving()) && (await rows.locator("tbody > tr").count()) === 3);
  ok(
    "rows: the rows below close the gap with motion, then rest",
    m1 && !(await moving()) && (await rows.locator("tbody > tr").count()) === 3,
    m1,
  );
  await toggle.click();
  await p.waitForTimeout(30); // timing: samples the rows while their motion should be running
  const m2 = await rows.evaluate((t) =>
    [...t.querySelectorAll("tbody > tr")].map((r) => r.getAnimations().length).join(""),
  );
  await until(async () => !(await moving()) && (await rows.locator("tbody > tr").count()) === 5);
  ok(
    "rows: Undo opens the room again in place (returning and following rows animate)",
    /1/.test(m2) && (await rows.locator("tbody > tr").count()) === 5 && !(await moving()),
    m2,
  );
});
