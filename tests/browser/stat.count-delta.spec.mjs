// Stat: the Count never breaks inside a number; the delta is spoken as text.
import { test } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["panel", "skeleton", "carousel"] });

test("stat: Count on one line, no aria-label on the delta", async ({ open, ok }) => {
  const p = await open({ route: "specimen", width: 1440, height: 900, ready: "[data-slot=stat-value] .kl-count" });
  const s = await p.evaluate(() =>
    [...document.querySelectorAll("[data-slot=stat-value] .kl-count")].map((c) => {
      const r = c.getBoundingClientRect();
      const lh = parseFloat(getComputedStyle(c).lineHeight) || parseFloat(getComputedStyle(c).fontSize) * 1.3;
      return { text: c.textContent, lines: Math.round(r.height / lh), ws: getComputedStyle(c).whiteSpace };
    }),
  );
  ok("stat: every Count is on one line", s.length > 0 && s.every((x) => x.ws === "nowrap" && x.lines <= 1), s);
  const labelled = await p.evaluate(() => [...document.querySelectorAll("[data-slot=stat-delta][aria-label]")].length);
  ok("stat: no aria-label on the role-less delta span", labelled === 0, labelled);
});
