// Marker: pending is a busy polite status; the separator is a separator.
import { test } from "./fixtures.mjs";
import { at } from "./lib/section.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["marker"] });

test("marker: pending status and separator", async ({ open, ok }) => {
  const p = await open({ width: 1440, height: 900, ready: "#marker" });
  const m = await at(p, "marker");
  const st = await m
    .locator('[data-slot="marker"][role="status"]')
    .evaluate((el) => ({ busy: el.getAttribute("aria-busy"), run: !!el.querySelector(".kl-pending") }));
  ok("marker: pending is a busy polite status with the pending segment", st.busy === "true" && st.run, st);
  ok("marker: the separator is a separator", (await m.locator('[data-slot="marker"][role="separator"]').count()) === 1);
});
