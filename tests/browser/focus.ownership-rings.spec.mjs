// Focus ownership and ring geometry on the playground's Preview:
// pointer choices leave no ring, keyboard restores focus with one indicator, and a keyboard traversal of the whole
// preview finds exactly one unclipped indicator per stop.
import { test, idle } from "./fixtures.mjs";
import { until, pick } from "./lib/flow.mjs";
import { ringsOf, traverse } from "./lib/focus-rings.mjs";

const playground = (open) => open({ route: "playground", width: 1400, height: 1000, ready: "[data-slot=preview]" });
// the select trigger is found by its slot (its classes are utilities)
const onTrigger = (p) => p.evaluate(() => document.activeElement?.getAttribute("data-slot") === "select-trigger");
const activeHas = (p, cls) =>
  until(() =>
    p.evaluate(
      (c) => !!(document.activeElement?.classList.contains(c) || document.activeElement?.matches(`[data-slot=${c}]`)),
      cls,
    ),
  );

test("focus ownership: pointer choices leave no ring; keyboard restores focus with one indicator", async ({
  open,
  ok,
}) => {
  const p = await playground(open);
  const scope = p.getByTestId("scope-preview");
  await scope.getByRole("button", { name: "Book pickup…" }).click();
  const dlg = p.getByRole("dialog").filter({ hasText: "Book a pickup" });
  await dlg.waitFor();
  await idle(p);
  const carrier = dlg.locator("[data-slot=select] [role=combobox]");
  await carrier.click();
  await p.getByRole("option", { name: /DSV Road/ }).click();
  await activeHas(p, "select-trigger");
  await idle(p);
  let r = await ringsOf(p);
  ok(
    "select: a pointer choice returns focus to the trigger without a ring",
    (await onTrigger(p)) && r.rings.length === 0,
    r,
  );
  await dlg.locator("[data-slot=date-picker-trigger]").click();
  await p.locator("[role=gridcell] button[aria-label*='12 November']").click();
  await activeHas(p, "date-picker-trigger");
  await idle(p);
  r = await ringsOf(p);
  ok(
    "date picker: a pointer choice returns focus to the trigger without a ring",
    (await p.evaluate(() => document.activeElement?.getAttribute("data-slot"))) === "date-picker-trigger" &&
      r.rings.length === 0,
    r,
  );
  await dlg.locator("[data-slot=date-picker-trigger]").focus();
  await p.keyboard.press("Enter");
  await until(() => p.evaluate(() => !!document.activeElement?.closest("[role=grid]")));
  await idle(p);
  await p.keyboard.press("Escape");
  await activeHas(p, "date-picker-trigger");
  await idle(p);
  r = await ringsOf(p);
  ok(
    "date picker: Escape returns focus to the trigger, with one indicator: its own edge",
    (await p.evaluate(() => document.activeElement?.getAttribute("data-slot"))) === "date-picker-trigger" &&
      r.rings.length === 1 &&
      r.rings[0].off === "edge",
    r,
  );
  await carrier.focus();
  await p.keyboard.press("ArrowDown");
  await until(async () => (await p.locator("[role=listbox]:visible").count()) === 1);
  ok("select: keyboard opens the list with focus inside it", (await p.locator("[role=listbox]:visible").count()) === 1);
  await idle(p);
  await p.keyboard.press("Escape");
  await activeHas(p, "select-trigger");
  await idle(p);
  r = await ringsOf(p);
  ok(
    "select: Escape closes and restores focus to the trigger, one indicator (its edge)",
    (await onTrigger(p)) && r.rings.length === 1 && r.rings[0].off === "edge",
    r,
  );
  await dlg.locator("input").first().click();
  r = await ringsOf(p);
  ok(
    "text field: a pointer click shows the frame's edge (editable fields always match :focus-visible), not a ring",
    r.rings.length === 1 && r.rings[0].cls === "kl-edge",
    r,
  );
  ok("no page errors", p.errs.length === 0, p.errs);
});

test("ring geometry: keyboard traversal of the playground preview", async ({ open, ok }) => {
  const p = await playground(open);
  const { stops, bad } = await traverse(p, "[data-testid=scope-preview]");
  const label = "playground preview";
  ok(
    `${label}: ${stops} focus stops, each with exactly one unclipped indicator (ring at a token offset, or the frame's edge)`,
    stops > 10 && bad.length === 0,
    bad.slice(0, 6),
  );
  ok("no page errors", p.errs.length === 0, p.errs);
});

test("ring geometry: traversal in dark, cut off, compact; a ring on a band takes the band's text colour", async ({
  open,
  ok,
}) => {
  const p = await playground(open);
  const scope = p.getByTestId("scope-preview");
  await pick(p, "Theme", "Dark");
  await pick(p, "Cut", "Off");
  await pick(p, "Density", "Compact");
  const { stops, bad } = await traverse(p, "[data-testid=scope-preview]");
  const label = "playground preview (dark, cut off, compact)";
  ok(
    `${label}: ${stops} focus stops, each with exactly one unclipped indicator (ring at a token offset, or the frame's edge)`,
    stops > 10 && bad.length === 0,
    bad.slice(0, 6),
  );
  // a ring on a fill takes the fill's text colour
  const onFill = await scope
    .locator("[data-kl-covered], .kl-flood[data-kl-on]")
    .evaluateAll((es) => es.slice(0, 1).map((e) => e.className));
  const covered = scope.locator("[role=radio][data-kl-covered], [data-slot=segmented-item][data-kl-covered]").first();
  await covered.focus();
  await p.keyboard.press("ArrowRight");
  await p.keyboard.press("ArrowLeft");
  await until(() => p.evaluate(() => document.activeElement?.hasAttribute("data-kl-covered")));
  await idle(p);
  const fill = await p.evaluate(() => {
    const a = document.activeElement;
    const cs = getComputedStyle(a);
    return { covered: a.hasAttribute("data-kl-covered"), ring: cs.outlineColor, text: cs.color };
  });
  ok("a ring drawn on a band uses the band's text colour", fill.covered && fill.ring === fill.text, { fill, onFill });
  ok("no page errors", p.errs.length === 0, p.errs);
});
