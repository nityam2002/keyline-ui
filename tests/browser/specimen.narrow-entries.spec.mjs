// At 375px the round-26 specimen entries (questionnaire, toast, sidebar, button group, marker) do not overflow
// sideways.
import { test } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["questionnaire", "toast", "sidebar", "button-group", "marker"] });

test("specimen narrow (375px): round-26 entries fit", async ({ open, ok }) => {
  const p = await open({ width: 375, height: 800, ready: "#marker" });
  const over = await p.evaluate(() =>
    ["questionnaire", "toast", "sidebar", "button-group", "marker"]
      .map((id) => {
        const e = document.getElementById(id);
        return [id, e.scrollWidth - e.clientWidth];
      })
      .filter(([, d]) => d > 1),
  );
  ok("narrow (375px): no new entry overflows sideways", over.length === 0, over);
});
