// The shipments block's header actions on a Toolbar (from r15): one Tab stop, arrows, Export, Alerts → inspector
// (wide) and sheet with focus return (medium), overflow into More at 520 and 390.
import { test, idle } from "./fixtures.mjs";
import { poll, lastMenu } from "./lib/probes-c.mjs";

const READY = "[data-slot=app-shell-header] [data-slot=toolbar]";
const active = (p) =>
  p.evaluate(() => {
    const a = document.activeElement;
    return {
      role: a?.closest("[role=gridcell]") ? "gridcell" : a?.getAttribute("role"),
      name: (a?.getAttribute("aria-label") || a?.textContent || "").trim(),
      value: a?.value,
    };
  });

test("header 1440: Alerts, Export, Help; one Tab stop; Export toasts", async ({ open, ok }) => {
  const p = await open({ route: "app", width: 1440, height: 900, ready: READY });
  const tb = p.getByRole("toolbar", { name: "Page actions" });
  const namesOf = () =>
    tb
      .locator(":scope > :not([data-slot=toolbar-more])")
      .evaluateAll((xs) =>
        xs
          .filter((x) => !/fixed|absolute/.test(getComputedStyle(x).position) && x.getBoundingClientRect().width > 0)
          .map((x) => (x.querySelector("[data-slot=toolbar-label]")?.textContent || x.textContent).trim()),
      );
  const names = await poll(namesOf, (n) => n.length === 3 && /Alerts/.test(n[0]), 3000);
  ok(
    "1440: the header toolbar shows Alerts, Export and Help, with no More",
    names.length === 3 && /Alerts/.test(names[0]) && (await tb.locator("[data-slot=toolbar-more]").count()) === 0,
    names,
  );
  const stops = await tb.evaluate((t) => [...t.querySelectorAll("button, a")].filter((x) => x.tabIndex === 0).length);
  ok("1440: the toolbar is one Tab stop", stops === 1, stops);
  await tb.getByRole("button", { name: /Alerts/ }).focus();
  await p.keyboard.press("ArrowRight");
  ok("1440: arrows move along the actions (Alerts → Export)", (await active(p)).name === "Export", await active(p));
  await p.keyboard.press("Enter");
  const toasts = await poll(
    () =>
      p
        .locator("[data-slot=toast-root]")
        .allTextContents()
        .then((x) => x.join(" ")),
    (t) => /Export of/.test(t),
    3000,
  );
  ok("1440: Export reports in a toast", /Export of/.test(toasts), null);
  ok("no page errors (header wide, Export)", p.errs.length === 0, p.errs);
});

test("header 1440: an alert opens its shipment in the inspector", async ({ open, ok }) => {
  // a fresh page: in WebKit a toast on screen while the inspector opens inline logs a ResizeObserver
  // loop from Base UI's toast measurement it happens with any toast, not only Export)
  const p = await open({ route: "app", width: 1440, height: 900, ready: READY });
  const tb = p.getByRole("toolbar", { name: "Page actions" });
  await tb.getByRole("button", { name: /Alerts/ }).click();
  await lastMenu(p);
  const first = p.locator("[role=menu]").last().getByRole("menuitem").first();
  const firstText = (await first.textContent()) ?? "";
  const id = /SH-\d+/.exec(firstText)?.[0];
  await first.click();
  const aside = await poll(
    () => p.locator("[data-slot=app-shell-aside]").textContent(),
    (t) => !!id && t?.includes(id),
    3000,
  );
  await idle(p);
  ok("1440: an alert opens its shipment in the inspector", !!id && aside?.includes(id), { id, firstText });
  ok("no page errors (header wide, Alerts)", p.errs.length === 0, p.errs);
});

test("header 1000: an alert opens the sheet; closing returns focus to Alerts", async ({ open, ok }) => {
  // medium: the aside is a sheet; it returns focus to the Alerts trigger
  const p = await open({ route: "app", width: 1000, height: 900, ready: READY });
  const tb = p.getByRole("toolbar", { name: "Page actions" });
  await tb.getByRole("button", { name: /Alerts/ }).click();
  await lastMenu(p);
  await p.locator("[role=menu]").last().getByRole("menuitem").first().click();
  const n = await poll(
    () => p.locator("[role=dialog]").count(),
    (c) => c > 0,
    3000,
  );
  ok("1000: the alert opens the shipment sheet", n > 0, null);
  await p.locator("[role=dialog]").last().waitFor({ state: "visible" });
  await idle(p);
  await p.keyboard.press("Escape");
  const a = await poll(
    () => active(p),
    (x) => /Alerts/.test(x.name),
    3000,
  );
  ok("1000: closing the sheet returns focus to Alerts", /Alerts/.test(a.name), a);
  ok("no page errors (header medium)", p.errs.length === 0, p.errs);
});

for (const w of [520, 390]) {
  test(`header ${w}: fits, crumbs keep room, actions move into More`, async ({ open, ok }) => {
    const p = await open({ route: "app", width: w, height: 800, ready: READY });
    const tb = p.getByRole("toolbar", { name: "Page actions" });
    const geoOf = () =>
      p.evaluate(() => {
        const h = document.querySelector("[data-slot=app-shell-header]");
        const c = h.querySelector("[data-slot=app-shell-crumbs]").getBoundingClientRect().width;
        return {
          fits: h.scrollWidth <= h.clientWidth + 1,
          crumbs: c,
          page: document.documentElement.scrollWidth <= innerWidth + 1,
        };
      });
    // the toolbar re-measures when its fonts land: read the header once it has settled into the overflow shape
    await poll(
      () => tb.locator("[data-slot=toolbar-more]").count(),
      (c) => c === 1,
      3000,
    );
    const geo = await poll(geoOf, (g) => g.fits && g.page && g.crumbs >= 100, 3000);
    ok(`${w}: the header fits (no overflow), the page does not scroll sideways`, geo.fits && geo.page, geo);
    ok(`${w}: the crumbs keep their room (≥ 100px) while actions move`, geo.crumbs >= 100, geo);
    ok(`${w}: the actions show More`, (await tb.locator("[data-slot=toolbar-more]").count()) === 1, null);
    await tb.locator("[data-slot=toolbar-more]").click();
    await lastMenu(p);
    const rows = await p
      .locator("[role=menu]")
      .last()
      .evaluate((m) => [...m.querySelectorAll("[role^=menuitem]")].map((x) => x.textContent.trim()));
    ok(
      `${w}: More holds what moved (Help${w === 390 ? ", Export, Alerts" : ""})`,
      rows.some((r) => /Help/.test(r)) &&
        (w !== 390 || (rows.some((r) => /Export/.test(r)) && rows.some((r) => /Alerts/.test(r)))),
      rows,
    );
    await p.keyboard.press("Escape");
    ok(`no page errors (header ${w})`, p.errs.length === 0, p.errs);
  });
}
