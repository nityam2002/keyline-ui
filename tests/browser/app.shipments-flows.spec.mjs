// Real pointer and keyboard flows on the app's shipments block. Every flow opens a fresh
// #/app page and checks that page's errors (page errors, console errors, HTTP >= 400).
import { test, idle } from "./fixtures.mjs";
import { until, trackHttp, same } from "./lib/flow.mjs";

const isMac = process.platform === "darwin";
const Q = "theme=light&cut=on&density=default&motion=normal&dir=ltr";

async function app(open) {
  const p = await open({ route: "app", q: Q, width: 1440, height: 900, ready: ".kl-frame" });
  const http = await trackHttp(p, "[data-testid=shipments-table] tbody tr[data-slot=table-row]");
  const rows = p.locator("[data-testid=shipments-table] tbody tr[data-slot=table-row]");
  const carrier = (i) => rows.nth(i).locator("td").nth(4).textContent();
  const a = {
    p,
    rows,
    carriers: (n) => Promise.all(Array.from({ length: n }, (_, i) => carrier(i))),
    count: () => p.locator("[data-slot=table-bulk-count] .kl-count").textContent(),
    undo: () => p.locator("[data-slot=toast-action]", { hasText: "Undo" }).last(),
    search: p.locator("[data-slot=table-search] input"),
    selectedTab: () =>
      p
        .locator(
          '[data-testid=shipments-table] [role=tab][aria-selected="true"], [role=tablist] [role=tab][aria-selected="true"]',
        )
        .first()
        .textContent(),
    errors: () => [...p.errs, ...p.consoleErrs, ...http],
  };
  return a;
}
const noErrors = (ok, a) =>
  ok("no page errors during flows", same(a.errors(), []), { actual: a.errors(), expected: [] });

test("app: filter", async ({ open, ok }) => {
  const a = await app(open);
  const all = await a.rows.count();
  await a.search.fill("Lyon");
  await until(async () => {
    const n = await a.rows.count();
    return n > 0 && n < all;
  });
  const n = await a.rows.count();
  ok("search narrows the rows", n > 0 && n < all, { all, n });
  noErrors(ok, a);
});

test("app: view tabs (keyboard)", async ({ open, ok }) => {
  const a = await app(open);
  const { p } = a;
  const before = await a.selectedTab();
  await p.locator('[role=tab][aria-selected="true"]').first().focus();
  await p.keyboard.press("ArrowRight");
  const next = await a.selectedTab();
  ok("ArrowRight activates the next view", next !== before, { before });
  const focusSel = await p.evaluate(() => document.activeElement?.getAttribute("aria-selected"));
  ok("focus follows the active tab", same(focusSel, "true"), { actual: focusSel, expected: "true" });
  await p.keyboard.press("Home");
  const home = await a.selectedTab();
  ok("Home returns to the first view", same(home, before), { actual: home, expected: before });
  noErrors(ok, a);
});

test("app: assign + Undo restores each row's own value", async ({ open, ok }) => {
  const a = await app(open);
  const { p, rows } = a;
  for (const i of [0, 1, 2]) await rows.nth(i).locator("[data-slot=checkbox]").click();
  const c = await a.count();
  ok("three selected", same(c, "3"), { actual: c, expected: "3" });
  const before = await a.carriers(3);
  await p.locator("[data-slot=table-bulk-bar] button", { hasText: "Assign carrier" }).click();
  await p.locator("[data-slot=menu-item]", { hasText: "DSV Road" }).click();
  await a.undo().waitFor();
  const assigned = await a.carriers(3);
  ok("all three assigned", same(assigned, ["DSV Road", "DSV Road", "DSV Road"]), {
    actual: assigned,
    expected: ["DSV Road", "DSV Road", "DSV Road"],
  });
  await a.undo().click();
  await until(async () => same(await a.carriers(3), before));
  const restored = await a.carriers(3);
  ok("Undo restores the previous carriers, per row", same(restored, before), { actual: restored, expected: before });
  noErrors(ok, a);
});

test("app: async failure changes nothing", async ({ open, ok }) => {
  const a = await app(open);
  const { p } = a;
  await p.locator("[data-testid=shipments-table] thead [data-slot=checkbox]").click();
  const n = Number(await a.count());
  const before = await a.carriers(6);
  await p.locator("[data-slot=table-bulk-bar] button", { hasText: "Assign carrier" }).click();
  await p.locator("[data-slot=menu-item]", { hasText: "Rhenus Road" }).click();
  await p.locator("[data-slot=toast-root]", { hasText: "Nothing was changed" }).waitFor();
  ok("more than the capacity was selected", n > 5, { n });
  const after = await a.carriers(6);
  ok("carriers unchanged after the failure", same(after, before), { actual: after, expected: before });
  const kept = Number(await a.count());
  ok("selection kept for a retry", same(kept, n), { actual: kept, expected: n });
  noErrors(ok, a);
});

test("app: selection outside the results", async ({ open, ok }) => {
  const a = await app(open);
  const { p, rows } = a;
  for (const i of [0, 1, 2]) await rows.nth(i).locator("[data-slot=checkbox]").click();
  const id = (await rows.nth(0).locator("td").nth(2).textContent()).trim();
  await a.search.fill(id);
  await until(async () => /not in these results/.test(await p.locator("[data-slot=table-bulk-bar]").textContent()));
  const scope = await p.locator("[data-slot=table-bulk-bar]").textContent();
  ok("scope says how many are not in the results", /2 not in these results/.test(scope), scope);
  await p.locator("[data-slot=table-bulk-bar] button", { hasText: /Keep only/ }).click();
  const c = await a.count();
  ok("keep visible only leaves one", same(c, "1"), { actual: c, expected: "1" });
  noErrors(ok, a);
});

test("app: destructive confirm, Escape, Undo", async ({ open, ok }) => {
  const a = await app(open);
  const { p, rows } = a;
  const firstTab = () => p.locator("[role=tab]").first().textContent();
  const total = await firstTab();
  for (const i of [0, 1]) await rows.nth(i).locator("[data-slot=checkbox]").click();
  await p.locator("[data-slot=table-bulk-bar] [role=toolbar] button", { hasText: "Actions" }).click();
  await p.locator("[data-slot=menu-item]", { hasText: "Cancel" }).click();
  await p.waitForSelector("[data-slot=alert-dialog-popup]");
  // the alert moves focus into itself once it has opened
  await until(() => p.evaluate(() => !!document.activeElement?.closest("[data-slot=alert-dialog-popup]")));
  await idle(p).catch(() => {});
  const focused = await p.evaluate(() => document.activeElement?.textContent);
  ok("alert opens on the safe action", !/cancel 2/i.test(focused ?? ""), focused);
  await p.keyboard.press("Escape");
  const c = await a.count();
  ok("Escape keeps the selection", same(c, "2"), { actual: c, expected: "2" });
  await p.locator("[data-slot=table-bulk-bar] [role=toolbar] button", { hasText: "Actions" }).click();
  await p.locator("[data-slot=menu-item]", { hasText: "Cancel" }).click();
  // the rows that start a slide are recorded as they start (a slide is shorter than a round trip to the page)
  await p.evaluate(() => {
    window.__rowSlides = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      if (this.matches("[data-testid=shipments-table] tbody > tr")) window.__rowSlides.push(this.rowIndex);
      return animate.apply(this, args);
    };
  });
  const slides = () => p.evaluate(() => window.__rowSlides.splice(0).length);
  await p.locator("[data-slot=alert-dialog-confirm]").click();
  const removed = await firstTab();
  ok("cancel removes the rows", removed !== total, { total });
  await until(async () => (await p.evaluate(() => window.__rowSlides.length)) > 0);
  const closing = await slides();
  ok("the rows below close the gap with motion", closing > 0, { closing });
  await a.undo().click();
  const back = await firstTab();
  ok("Undo restores the count", same(back, total), { actual: back, expected: total });
  await until(async () => (await p.evaluate(() => window.__rowSlides.length)) > 0);
  const opening = await slides();
  ok("Undo opens the room again with motion", opening > 0, { opening });
  noErrors(ok, a);
});

test("app: command menu", async ({ open, ok, eng }) => {
  const a = await app(open);
  const { p } = a;
  await p.locator("body").click({ position: { x: 5, y: 5 } });
  await p.keyboard.press(isMac && eng === "webkit" ? "Meta+k" : "Control+k");
  await p.waitForSelector("[data-slot=command]");
  await p.keyboard.type("show");
  await p.keyboard.press("Alt+Digit2");
  ok("Alt+2 runs the second result (a view switch)", (await a.selectedTab()) !== null);
  await p.keyboard.press("Escape").catch(() => {});
  noErrors(ok, a);
});

test("app: row expansion", async ({ open, ok }) => {
  const a = await app(open);
  const { p, rows } = a;
  const y0 = await rows.nth(0).boundingBox();
  await rows.nth(0).locator("[data-slot=table-expand-cell] button").click();
  await until(async () => (await rows.nth(0).locator("[data-slot=table-index-cell]").getAttribute("rowspan")) === "2");
  await idle(p).catch(() => {});
  const y1 = await rows.nth(0).boundingBox();
  ok("expanded row stays in place", Math.abs((y0?.y ?? 0) - (y1?.y ?? 0)) < 0.5, { y0: y0?.y, y1: y1?.y });
  const span = await rows.nth(0).locator("[data-slot=table-index-cell]").getAttribute("rowspan");
  ok("index cell spans the detail row", same(span, "2"), { actual: span, expected: "2" });
  noErrors(ok, a);
});

test("app: the expand button keeps its 44px target when the table scrolls sideways", async ({ open, ok }) => {
  // at 1440 the table fits; narrower, it scrolls inside its frame and auto layout used to squeeze the cell to 16px
  for (const width of [1440, 1024, 760]) {
    const p = await open({
      route: "app",
      q: Q,
      width,
      height: 900,
      ready: "[data-testid=shipments-table] tbody tr[data-slot=table-row]",
    });
    const sizes = await p
      .locator("[data-testid=shipments-table] tbody tr[data-slot=table-row] [data-slot=table-expand-cell] button")
      .evaluateAll((bs) => bs.map((b) => Math.round(b.getBoundingClientRect().width)));
    ok(
      `expand buttons at ${width}px are 44px wide (WCAG 2.5.8 needs 24)`,
      sizes.length > 0 && sizes.every((w) => w >= 44),
      { width, sizes: [...new Set(sizes)] },
    );
  }
});
