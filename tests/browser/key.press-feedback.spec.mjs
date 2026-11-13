// Key: press feedback on the pressable families the round-28 audit found silent (answers before release), the
// held-press seed of the flood, and the pressed cells staying on their frame while only ink travels.
import { test } from "./fixtures.mjs";
import { centre } from "./lib/segmented-band.mjs";
import { until } from "./lib/probe.mjs";

const VP = { width: 1440, height: 900 };
const uncv = (p) =>
  p.evaluate(() => document.querySelectorAll("[data-cv]").forEach((e) => e.removeAttribute("data-cv")));

test("seed: held press seeds the flood, leaving withdraws it", async ({ open, ok }) => {
  const p = await open({ ...VP, route: "motion", ready: "[data-testid=lab-seed]" });
  const seed = p.locator("[data-testid=lab-seed]");
  await seed.scrollIntoViewIfNeeded();
  const it = seed.getByRole("button", { name: "Awaiting docs" }).nth(1);
  const clip = () =>
    it.evaluate((e) => ({ press: e.hasAttribute("data-kl-press"), clip: getComputedStyle(e, "::before").clipPath }));
  const [x, y] = await centre(it);
  await p.mouse.move(x, y);
  await p.mouse.down();
  await p.waitForTimeout(250); // timing: a held press — the seed is what a 250 ms hold shows
  const held = await clip();
  ok("seed: a held press shows a 7px seed at the press point", held.press && /circle\(7px/.test(held.clip), held);
  await p.mouse.move(x, y + 120, { steps: 3 });
  await until(async () => !(await clip()).press, 1000);
  const gone = await clip();
  await p.mouse.up();
  ok(
    "seed: leaving the cell withdraws the seed and nothing toggles",
    !gone.press && (await it.getAttribute("aria-pressed")) !== "true",
    gone,
  );
  await p.mouse.move(x, y);
  await p.mouse.down();
  await p.mouse.up();
  await until(async () => (await it.getAttribute("aria-pressed")) === "true");
  ok("seed: a press and release toggles and floods", (await it.getAttribute("aria-pressed")) === "true");
});

test("key: specimen families answer the press before release", async ({ open, ok }) => {
  const p = await open({ ...VP, route: "specimen", ready: "[data-cv], [data-slot=nav-item]" });
  await uncv(p);
  // what shows: the background of the pressed thing (or of its box), never a hidden child
  const families = [
    ["[data-slot=nav-item]:not([aria-current])", "nav item", ""],
    [
      ":is([data-slot=checkbox-field-row], [data-slot=checkbox-group-item-row]):has([data-slot=checkbox]:not([data-checked], [data-disabled]))",
      "checkbox row",
      "[data-slot=checkbox]",
    ],
    [
      "[data-slot=table] td.kl-ix .kl-ix-in:has([data-slot=checkbox][data-unchecked])",
      "table index cell",
      "[data-slot=checkbox]",
    ],
    [
      "button:is([data-slot=date-picker-trigger],[data-slot=date-range-trigger])[data-kl-layout=control]",
      "date field trigger",
      "",
    ],
    [
      "button:is([data-slot=date-picker-trigger],[data-slot=date-range-trigger])[data-kl-layout=cell]",
      "date cell trigger",
      "",
    ],
  ];
  for (const [sel, name, part] of families) {
    const snap = (e, part) => getComputedStyle(part ? e.querySelector(part) : e).backgroundColor;
    const el = p.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    const [x, y] = await centre(el);
    await p.mouse.move(x, y);
    await p.waitForTimeout(60); // timing: hover settles before the press is compared against it
    const a = await el.evaluate(snap, part);
    await p.mouse.down();
    await p.waitForTimeout(40); // timing: "before release" — the answer must show 40 ms into the press
    const c = await el.evaluate(snap, part);
    // release in place over a neutral spot of the same cell is a toggle; release off it (WebKit keeps :active on
    // the chain of a press released elsewhere until the next press, so reset with a click on the page margin)
    await p.mouse.move(2, 2);
    await p.mouse.up();
    await p.mouse.click(2, 2);
    ok(`key: a ${name} answers the press before release`, a !== c, { a, c });
  }
});

test("key: a shipment ID answers the press", async ({ open, ok }) => {
  const p = await open({ ...VP, route: "app", ready: ".kl-sx-open" });
  // Shipments: the ID that opens the inspector
  const id = p.locator(".kl-sx-open").nth(1);
  const [ix, iy] = await centre(id);
  await p.mouse.move(ix, iy);
  await p.waitForTimeout(60); // timing: hover settles before the press is compared against it
  const ia = await id.evaluate((e) => getComputedStyle(e).backgroundColor);
  await p.mouse.down();
  await p.waitForTimeout(40); // timing: "before the inspector opens" — the answer must show 40 ms into the press
  const ic = await id.evaluate((e) => getComputedStyle(e).backgroundColor);
  await p.mouse.move(2, 2);
  await p.mouse.up();
  ok("key: a shipment ID answers the press before the inspector opens", ia !== ic, { ia, ic });
});

const CELLS =
  ".kl-slot[data-open] > span > span, [data-slot=button-affix], [data-slot=toolbar-affix], .kl-radio-meta, [data-slot=accordion-caret], [data-slot=item-media]";
async function cellsCheck(p, ok, sel, name) {
  const el = p.locator(sel).filter({ visible: true }).first();
  if (!(await el.count())) {
    ok(`key cells: ${name} found`, false, sel);
    return;
  }
  await el.scrollIntoViewIfNeeded();
  const geo = () =>
    el.evaluate((k, CELLS) => {
      const R = k.getBoundingClientRect();
      return [...k.querySelectorAll(CELLS)]
        .filter((c) => c.getBoundingClientRect().width)
        .map((c) => {
          const r = c.getBoundingClientRect();
          const g = document.createRange();
          g.selectNodeContents(c);
          const q = g.getBoundingClientRect();
          return { top: r.top - R.top, bottom: r.bottom - R.top, ink: q.top - R.top };
        });
    }, CELLS);
  const r = await el.boundingBox();
  await p.mouse.move(r.x + 12, r.y + r.height / 2);
  await p.waitForTimeout(60); // timing: hover settles before the press is compared against it
  const a = await geo();
  await p.mouse.down();
  await p.waitForTimeout(60); // timing: the pressed state 60 ms into a held press
  const c = await geo();
  await p.mouse.move(2, 2);
  await p.mouse.up();
  await p.mouse.click(2, 2);
  await p.keyboard.press("Escape");
  const still =
    a.length > 0 && a.every((x, i) => Math.abs(x.top - c[i].top) < 0.1 && Math.abs(x.bottom - c[i].bottom) < 0.1);
  const inked = a.every((x, i) => Math.abs(c[i].ink - x.ink - 1) < 0.3);
  ok(`key cells: a pressed ${name} keeps its cells on the frame; their ink travels 1px`, still && inked, { a, c });
}

test("key cells: specimen families keep their cells on the frame", async ({ open, ok }) => {
  const p = await open({ ...VP, route: "specimen", ready: "[data-slot=accordion-trigger]" });
  await uncv(p);
  const families = [
    ['[data-slot="button"][data-signal=failed]', "failed button (! cell)"],
    [
      '[data-slot="button"][data-variant=primary]:has([data-slot=button-done][data-open])',
      "done primary button (✓ cell)",
    ],
    ['[data-slot="button"]:has([data-slot=button-affix])', "button with an affix"],
    ["[data-kl-tb-item]:has(> [data-slot=toolbar-affix])", "toolbar item with an affix"],
    ["[data-slot=radio-group-item]:has(> .kl-radio-meta):not([data-checked])", "radio row with a meta cell"],
    ["[data-slot=accordion-trigger]", "accordion trigger"],
  ];
  for (const [sel, name] of families) await cellsCheck(p, ok, sel, name);
});

test("key cells: an item with media keeps its cells on the frame", async ({ open, ok }) => {
  const p = await open({ ...VP, route: "playground", ready: "[data-slot=item][data-interactive]" });
  await cellsCheck(p, ok, "[data-slot=item][data-interactive]:has(> [data-slot=item-media])", "item with media");
});
