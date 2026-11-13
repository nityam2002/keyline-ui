// Picker triggers: the accessible name includes the value (label + value ids).
import { test } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["async", "time", "time-slots", "date-time", "time-bounds"] });

test("pickers: every trigger is named by its label and its value (and a range by its count)", async ({ open, ok }) => {
  const p = await open({
    route: "specimen",
    width: 1440,
    height: 900,
    ready: ":is([data-slot=date-picker-trigger],[data-slot=date-range-trigger])[aria-labelledby]",
  });
  const names = await p.evaluate(() =>
    [
      ...document.querySelectorAll(
        ":is([data-slot=date-picker-trigger],[data-slot=date-range-trigger])[aria-labelledby]",
      ),
    ].map((t) => {
      const ids = t.getAttribute("aria-labelledby").split(/\s+/);
      return {
        ids: ids.length,
        // a range trigger also shows its day count, so that is part of its name too
        want: t.getAttribute("data-slot") === "date-range-trigger" ? 3 : 2,
        resolved: ids.every((id) => document.getElementById(id)),
        value: document.getElementById(ids[1])?.textContent.trim(),
      };
    }),
  );
  ok(
    "pickers: every trigger is named by its label and its value (and a range by its count)",
    names.length > 0 && names.every((n) => n.ids === n.want && n.resolved),
    names.slice(0, 4),
  );
});
