// Dock geometry of popups against their owner: control-docked panels
// overlap the trigger's k2 edge; cell-docked panels sit on the keyline below the cell and cover both side keylines;
// a calendar with no room on either side stays in the viewport and scrolls inside.
import { test, idle, stable } from "./fixtures.mjs";

async function geo(p, trigger, panelSel) {
  await stable(p.locator(panelSel).last()).catch(() => {});
  const t = await trigger.boundingBox();
  const pn = await p.locator(panelSel).last().boundingBox();
  return {
    t,
    pn,
    overlap: Math.round(t.y + t.height) - Math.round(pn.y),
    dl: Math.round(pn.x) - Math.round(t.x),
    dr: Math.round(pn.x + pn.width) - Math.round(t.x + t.width),
  };
}

test("dock (control): calendar and select list in the booking dialog", async ({ open, ok }) => {
  const p = await open({ route: "playground", width: 1400, height: 1000, ready: "[data-slot=preview]" });
  const scope = p.getByTestId("scope-preview");
  await scope.getByRole("button", { name: "Book pickup…" }).click();
  const dlg = p.getByRole("dialog").filter({ hasText: "Book a pickup" });
  await dlg.waitFor();
  await idle(p);
  await dlg.locator(":is([data-slot=date-picker-trigger],[data-slot=date-range-trigger])").click();
  await p.locator(":is([data-slot=date-picker-popup],[data-slot=date-range-popup])").last().waitFor();
  await idle(p);
  let g = await geo(
    p,
    dlg.locator(":is([data-slot=date-picker-trigger],[data-slot=date-range-trigger])"),
    ":is([data-slot=date-picker-popup],[data-slot=date-range-popup])",
  );
  ok(
    "dock (control, wide owner): calendar overlaps the trigger's k2 edge, start-aligned, ends in a clear T (>= 48px short)",
    g.overlap === 2 && g.dl === 0 && g.dr <= -48,
    g,
  );
  await p.keyboard.press("Escape");
  await p
    .locator(":is([data-slot=date-picker-popup],[data-slot=date-range-popup]):visible")
    .waitFor({ state: "detached" })
    .catch(() => {});
  await idle(p);
  const carrier = dlg.locator("[data-slot=select] [role=combobox]");
  await carrier.click();
  await p.locator("[data-slot=select-popup]").last().waitFor();
  await idle(p);
  g = await geo(p, carrier, "[data-slot=select-popup]");
  ok(
    "dock (control): select list overlaps the k2 edge and spans the trigger exactly",
    g.overlap === 2 && g.dl === 0 && g.dr === 0,
    g,
  );
  ok("no page errors", p.errs.length === 0, p.errs);
});

for (const dir of ["ltr", "rtl"]) {
  test(`dock (cell, ${dir}): calendar and multiselect list in the shipments table`, async ({ open, ok }) => {
    const p = await open({
      route: "app",
      q: dir === "rtl" ? "dir=rtl" : "",
      width: 1400,
      height: 1000,
      ready: ".kl-sx-eta",
    });
    await idle(p);
    const eta = p.locator(".kl-sx-eta :is([data-slot=date-picker-trigger],[data-slot=date-range-trigger])").first();
    await eta.click();
    await p.locator(":is([data-slot=date-picker-popup],[data-slot=date-range-popup])").last().waitFor();
    await idle(p);
    let g = await geo(p, eta, ":is([data-slot=date-picker-popup],[data-slot=date-range-popup])");
    ok(
      `dock (cell, ${dir}): calendar sits on the keyline below the cell and covers both side keylines (snapped to the cell)`,
      g.overlap === 0 && g.dl === -2 && g.dr === 2,
      g,
    );
    await p.keyboard.press("Escape");
    await p
      .locator(":is([data-slot=date-picker-popup],[data-slot=date-range-popup]):visible")
      .waitFor({ state: "detached" })
      .catch(() => {});
    await idle(p);
    const msT = p.locator(".kl-sx-carriers [data-slot=combobox-input-group]").first();
    await p.locator(".kl-sx-carriers [data-slot=combobox-trigger]").first().click();
    await p.locator("[data-slot=combobox-popup]").last().waitFor();
    await idle(p);
    g = await geo(p, msT, "[data-slot=combobox-popup]");
    ok(
      `dock (cell, ${dir}): multiselect list follows the same geometry`,
      g.overlap === 0 && g.dl === -2 && g.dr === 2,
      g,
    );
    ok("no page errors", p.errs.length === 0, p.errs);
  });
}

test("390×700: a calendar with no room on either side stays inside the viewport and scrolls inside", async ({
  open,
  ok,
}) => {
  const phone = await open({
    route: "app",
    width: 390,
    height: 700,
    ready: ":is([data-slot=date-picker-trigger],[data-slot=date-range-trigger])",
  });
  const dt = phone.locator(":is([data-slot=date-picker-trigger],[data-slot=date-range-trigger]):visible").first();
  // centre the trigger so neither side has room for the panel, whatever the page chrome above it
  await dt.evaluate((e) => e.scrollIntoView({ block: "center" }));
  await dt.click();
  await phone.locator(":is([data-slot=date-picker-popup],[data-slot=date-range-popup]):visible").waitFor();
  await idle(phone);
  await stable(phone.locator(":is([data-slot=date-picker-popup],[data-slot=date-range-popup]):visible")).catch(
    () => {},
  );
  const fit = await phone
    .locator(":is([data-slot=date-picker-popup],[data-slot=date-range-popup]):visible")
    .evaluate((e) => {
      const r = e.getBoundingClientRect();
      return { l: r.left, r: r.right, b: r.bottom, scrolls: e.scrollHeight > e.clientHeight };
    });
  ok(
    "390×700: a calendar with no room on either side stays inside the viewport and scrolls inside",
    fit.l >= 0 && fit.r <= 390 && fit.b <= 700 - 11.5 && fit.scrolls,
    fit,
  );
});
