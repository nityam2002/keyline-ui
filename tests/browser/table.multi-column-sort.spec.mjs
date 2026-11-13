// Multi-column sort on the specimen (from r14): TableSortHeader levels, Shift + press, aria-sort on the first level,
// the place text for screen readers.
import { test } from "./fixtures.mjs";
import { poll } from "./lib/probes-c.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["toolbar-overflow", "multi-sort"] });

test("multi-sort: levels, Shift + click / Enter, plain press resets", async ({ open, ok }) => {
  const p = await open({ ready: "[data-testid=specimen-overflow]" });
  const sp = p.getByTestId("specimen-sort");
  await sp.scrollIntoViewIfNeeded();
  const th = (n) => sp.locator("th", { hasText: n });
  const col = (i) => sp.locator("tbody tr").evaluateAll((rs, i) => rs.map((r) => r.children[i].textContent.trim()), i);
  const state = async () => ({
    dock: await th("Dock").getAttribute("aria-sort"),
    slot: await th("Slot").getAttribute("aria-sort"),
    carrier: await th("Carrier").getAttribute("aria-sort"),
    pallets: await th("Pallets").getAttribute("aria-sort"),
  });
  const levels = () => p.getByTestId("sort-levels").innerText();
  let s = await state();
  ok(
    "multi-sort: aria-sort only on the first level (Dock); Slot sorts second without it; others none",
    s.dock === "ascending" && s.slot === null && s.carrier === "none" && s.pallets === "none",
    s,
  );
  const n = await sp.locator("[data-slot=table-sort-level]").allTextContents();
  ok("multi-sort: each sorted header prints its place (1, 2)", n.join(",") === "1,2", n);
  const sr = await th("Slot").locator(".kl-sr").textContent();
  ok("multi-sort: the second level says its place in text", /sort 2 of 2, ascending/.test(sr), sr);
  const d = await col(0);
  const sl = await col(2);
  const ordered = d.every((x, i) => i === 0 || x > d[i - 1] || (x === d[i - 1] && sl[i] >= sl[i - 1]));
  ok(
    "multi-sort: rows by Dock, ties by Slot",
    ordered,
    d.map((x, i) => `${x} ${sl[i]}`),
  );
  // shift + click adds a third level, high-to-low first
  await th("Pallets")
    .locator("button")
    .click({ modifiers: ["Shift"] });
  const third = async () => ({
    n: await th("Pallets")
      .locator("[data-slot=table-sort-level]")
      .textContent()
      .catch(() => null),
    sort: await th("Pallets").getAttribute("data-sort"),
    levels: await levels(),
  });
  const t3 = await poll(
    third,
    (t) => t.n === "3" && t.sort === "descending" && /pallets descending/.test(t.levels),
    2000,
  );
  ok(
    "multi-sort: Shift + click adds a level at its first direction (Pallets descending, 3)",
    t3.n === "3" && t3.sort === "descending" && /pallets descending/.test(t3.levels),
    t3.levels,
  );
  await th("Slot")
    .locator("button")
    .click({ modifiers: ["Shift"] });
  const l2 = await poll(levels, (t) => /dock ascending, then slot descending, then pallets descending/.test(t), 2000);
  ok(
    "multi-sort: Shift + click on a level flips it in place",
    /dock ascending, then slot descending, then pallets descending/.test(l2),
    l2,
  );
  await th("Slot")
    .locator("button")
    .click({ modifiers: ["Shift"] });
  const dropped = /dock ascending, then pallets descending$|dock ascending, then pallets descending ·/;
  const l3 = await poll(levels, (t) => dropped.test(t), 2000);
  const pn = await poll(
    () =>
      th("Pallets")
        .locator("[data-slot=table-sort-level]")
        .textContent()
        .catch(() => null),
    (v) => v === "2",
    2000,
  );
  ok("multi-sort: a third Shift + click drops it; Pallets becomes 2", dropped.test(l3) && pn === "2", l3);
  // keyboard: Shift + Enter on a focused header adds a level
  await th("Carrier").locator("button").focus();
  await p.keyboard.press("Shift+Enter");
  const kb = await poll(levels, (t) => /then carrier ascending/.test(t), 2000);
  ok("multi-sort: Shift + Enter on a header adds a level from the keyboard", /then carrier ascending/.test(kb), kb);
  // plain press: one column again
  await th("Carrier").locator("button").click();
  const single = async () => ({ s: await state(), nums: await sp.locator("[data-slot=table-sort-level]").count() });
  const s1 = await poll(single, (x) => x.s.carrier === "ascending" && x.s.dock === "none" && x.nums === 0, 2000);
  s = s1.s;
  ok(
    "multi-sort: a plain press sorts by that column alone, fresh (numbers go, aria-sort moves)",
    s.carrier === "ascending" && s.dock === "none" && s1.nums === 0,
    { s, levels: await levels() },
  );
  ok("multi-sort: a single sort keeps no place text", (await sp.locator("th .kl-sr").count()) === 0, null);
  ok("no page errors (sort)", p.errs.length === 0, p.errs);
});
