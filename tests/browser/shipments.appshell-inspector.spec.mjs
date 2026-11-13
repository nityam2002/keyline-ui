// The shipments block on AppShell (from r13): Inspector as the aside when wide, the end sheet when medium, sheets
// for navigation when narrow, and the Notice for a filtered-out shipment.
import { test, idle } from "./fixtures.mjs";
import { poll, near, box, stableBox } from "./lib/probes-c.mjs";

const READY = ".kl-sx-table tbody tr[data-slot=table-row]";

test("block wide (1440): Inspector as the shell's aside, Notice when filtered out", async ({ open, ok }) => {
  const a = await open({ route: "app", width: 1440, height: 900, ready: READY });
  const shell = a.locator(".kl-sx");
  ok(
    "block: the block is an AppShell; wide at 1440",
    (await shell.getAttribute("data-slot")) === "app-shell" && (await shell.getAttribute("data-kl-shell")) === "wide",
    await shell.getAttribute("data-kl-shell"),
  );
  ok(
    "block: no private layout or banner markup remains",
    (await a.locator(".kl-sx-conflict, .kl-sx-nav").count()) === 0,
    null,
  );
  const row = a.locator(".kl-sx-open").nth(2);
  const id = (await row.textContent()).trim();
  await row.click();
  const aside = a.locator("[data-slot=app-shell-aside] [data-slot=inspector]");
  await aside.waitFor({ state: "visible" }).catch(() => {});
  ok("block: inspecting a row opens the Inspector inline as the shell's aside", await aside.isVisible(), null);
  const crumb = a.locator('[data-slot=app-shell-header] [aria-current="page"]');
  const crumbText = await poll(
    () => crumb.textContent(),
    (t) => t.includes(id),
    2000,
  );
  ok("block: the header breadcrumb ends at the inspected shipment", crumbText.includes(id), crumbText);
  await idle(a);
  await stableBox(aside);
  const sb = await box(a.locator(".kl-sx-table")),
    ab = await box(aside);
  ok("block: table and Inspector are one gutter apart (C1)", near(ab.x - sb.r, 12, 1.5), ab.x - sb.r);
  // hidden by a filter → the Notice (neutral) with Show in table
  await a
    .locator(".kl-sx-table")
    .getByRole("tab", { name: /Delivered/ })
    .click();
  const notice = aside.locator('[data-slot="notice"]');
  await poll(
    async () => (await notice.isVisible()) && /Hidden by the current filters/.test(await notice.textContent()),
    Boolean,
    3000,
  );
  await idle(a);
  ok(
    "block: a filtered-out shipment shows a Notice cell (neutral) in the Inspector",
    (await notice.isVisible()) &&
      (await notice.getAttribute("data-tone")) === "neutral" &&
      /Hidden by the current filters/.test(await notice.textContent()),
    null,
  );
  ok(
    "block: the Notice owns the keyline under it",
    (await aside.locator("[data-slot=notice-root]").evaluate((e) => getComputedStyle(e).borderBottomWidth)) === "1px",
    null,
  );
  await notice.getByRole("button", { name: "Show in table" }).click();
  const fold = await poll(
    () => aside.locator("[data-slot=notice-root]").getAttribute("data-open"),
    (v) => v === null,
    3000,
  );
  ok("block: Show in table folds the Notice away", fold === null, null);
  ok("block wide: no page errors", a.errs.length === 0, a.errs);
});

test("block medium (1024): the Inspector is an end sheet", async ({ open, ok }) => {
  const m = await open({ route: "app", width: 1024, height: 800, ready: READY });
  ok(
    "block: medium at 1024 (aside becomes a sheet)",
    (await m.locator(".kl-sx").getAttribute("data-kl-shell")) === "medium",
    await m.locator(".kl-sx").getAttribute("data-kl-shell"),
  );
  const r2 = m.locator(".kl-sx-open").nth(1);
  await r2.click();
  const dlg = m.getByRole("dialog");
  await dlg.waitFor({ state: "visible" }).catch(() => {});
  await poll(() => m.evaluate(() => !!document.activeElement.closest('[role="dialog"]')), Boolean, 3000);
  ok(
    "block medium: the Inspector opens in an end sheet (dialog) and takes focus",
    (await dlg.isVisible()) &&
      (await dlg.locator("[data-slot=inspector]").count()) === 1 &&
      (await m.evaluate(() => !!document.activeElement.closest('[role="dialog"]'))),
    null,
  );
  await idle(m);
  await m.keyboard.press("Escape");
  await dlg.waitFor({ state: "hidden" }).catch(() => {});
  await poll(() => m.evaluate(() => document.activeElement?.classList.contains("kl-sx-open")), Boolean, 3000);
  ok(
    "block medium: Escape closes the sheet, clears the inspection and returns focus to the row",
    !(await dlg.isVisible()) &&
      (await m.evaluate(() => document.activeElement?.classList.contains("kl-sx-open"))) &&
      (await m.locator(".kl-sx-open[aria-pressed=true]").count()) === 0,
    await m.evaluate(() => document.activeElement?.className),
  );
  ok("block medium: no page errors", m.errs.length === 0, m.errs);
});

test("block narrow (600): navigation sheet", async ({ open, ok }) => {
  const nn = await open({ route: "app", width: 600, height: 800, ready: READY });
  ok(
    "block: narrow at 600 (sidebar and aside are sheets)",
    (await nn.locator(".kl-sx").getAttribute("data-kl-shell")) === "narrow" &&
      (await nn.locator("[data-slot=app-shell-nav]").count()) === 0,
    null,
  );
  await nn.locator("[data-slot=app-shell-toggle]").click();
  const nav = nn.getByRole("dialog", { name: "Navigation" });
  await nav.waitFor({ state: "visible" }).catch(() => {});
  ok("block narrow: the toggle opens the navigation sheet", await nav.isVisible(), null);
  await idle(nn);
  await nav.getByRole("link", { name: /Carriers/ }).click();
  await nav.waitFor({ state: "hidden" }).catch(() => {});
  ok("block narrow: choosing a place closes it", !(await nav.isVisible()), null);
  await idle(nn);
  ok(
    "block narrow: the page never scrolls sideways",
    await nn.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    null,
  );
  ok("block narrow: no page errors", nn.errs.length === 0, nn.errs);
});
