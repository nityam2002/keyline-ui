// Picker triggers: the accessible name includes the value (label + value ids).
import { test } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["async", "time", "time-slots", "date-time", "time-bounds"] });

test("pickers: every trigger is named by its label and its value", async ({ open, ok }) => {
  const p = await open({ route: "specimen", width: 1440, height: 900, ready: ".kl-dr-trigger[aria-labelledby]" });
  const names = await p.evaluate(() =>
    [...document.querySelectorAll(".kl-dr-trigger[aria-labelledby]")].map((t) => {
      const ids = t.getAttribute("aria-labelledby").split(/\s+/);
      return {
        ids: ids.length,
        resolved: ids.every((id) => document.getElementById(id)),
        value: document.getElementById(ids[1])?.textContent.trim(),
      };
    }),
  );
  ok(
    "pickers: every trigger is named by its label and its value",
    names.length > 0 && names.every((n) => n.ids === 2 && n.resolved),
    names.slice(0, 4),
  );
});
