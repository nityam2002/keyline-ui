// The shipments block on the app page: header sort (band on the keyline, both triangles, order, flip, a
// high-to-low column), the View menu (visible-column count, hiding a column, ID locked), rows per page, Clear
// sort, and the expanded detail's span.
import { test, idle } from "./fixtures.mjs";
import { until } from "./lib/probe.mjs";

test("block: sort, columns, rows per page, clear sort, detail span", async ({ open, ok }) => {
  const a = await open({ route: "app", ready: ".kl-sx" });
  const table = a.locator(".kl-sx table");
  const heads = () => table.locator("thead th").allTextContents();
  const dest = table.locator("thead th", { hasText: "Destination" });
  const destCells = () => table.locator("tbody td.kl-sx-dest").allTextContents();
  await dest.getByRole("button").click();
  await until(async () => (await dest.getAttribute("aria-sort")) === "ascending");
  await idle(a);
  let d = await destCells();
  // regression: the band floated one keyline above the row's keyline; now it is that keyline, thickened upward
  const band = await dest.evaluate((e) => {
    const c = getComputedStyle(e),
      n = e.nextElementSibling && getComputedStyle(e.nextElementSibling);
    return { bc: c.borderBottomColor, nb: n?.borderBottomWidth, bw: c.borderBottomWidth, sh: c.boxShadow };
  });
  ok(
    "block: the sort band sits on the header keyline (same bottom edge as its neighbours)",
    band.bw === band.nb && /inset/.test(band.sh) && /-1px inset|0px -1px 0px 0px inset/.test(band.sh),
    band,
  );
  // regression: the sorted mark hid its other triangle, leaving a lone triangle off the glyph's centre
  const marks = await dest.evaluate((e) => {
    const n = e.nextElementSibling;
    const c = (x) => {
      const r = x.querySelector(".kl-sort svg").getBoundingClientRect();
      return r.y + r.height / 2;
    };
    return { other: getComputedStyle(e.querySelector(".kl-sort-down")).stroke, own: c(e), next: c(n) };
  });
  ok(
    "block: the sorted mark keeps both triangles and the neighbours' centre line",
    marks.other !== "none" && Math.abs(marks.own - marks.next) < 0.5,
    marks,
  );
  ok(
    "block: Destination sorts ascending (aria-sort, rows in order)",
    (await dest.getAttribute("aria-sort")) === "ascending" &&
      d.every((x, i) => i === 0 || d[i - 1].localeCompare(x, "en-GB", { numeric: true, sensitivity: "base" }) <= 0),
    d.slice(0, 4),
  );
  await dest.getByRole("button").click();
  await until(async () => (await dest.getAttribute("aria-sort")) === "descending");
  d = await destCells();
  ok(
    "block: a second press sorts descending",
    (await dest.getAttribute("aria-sort")) === "descending" &&
      d[0].localeCompare(d[d.length - 1], "en-GB", { sensitivity: "base" }) >= 0,
    d.slice(0, 3),
  );
  const wt = table.locator("thead th", { hasText: "Weight" });
  await wt.getByRole("button").click();
  await until(async () => (await wt.getAttribute("aria-sort")) === "descending");
  ok(
    "block: Weight starts heaviest first; Destination is no longer sorted",
    (await wt.getAttribute("aria-sort")) === "descending" && (await dest.getAttribute("aria-sort")) === "none",
    null,
  );
  const nCols = (await heads()).length;
  const viewBtn = a.locator(".kl-sx").getByRole("button", { name: /^View/ });
  ok(
    "block: the View trigger counts visible columns (7/7)",
    (await viewBtn.textContent()).includes("7/7"),
    await viewBtn.textContent(),
  );
  await viewBtn.click();
  const carrier = a.getByRole("menuitemcheckbox", { name: "Carrier" });
  await carrier.waitFor();
  await idle(a);
  await carrier.click();
  await until(async () => (await heads()).length === nCols - 1);
  ok(
    "block: unchecking Carrier hides its column; the menu stays open",
    (await heads()).length === nCols - 1 &&
      !(await heads()).some((h) => h.startsWith("Carrier")) &&
      (await carrier.isVisible()),
    await heads(),
  );
  ok(
    "block: ID cannot be hidden",
    await a
      .getByRole("menuitemcheckbox", { name: /^ID/ })
      .evaluate((e) => e.hasAttribute("data-disabled") || e.getAttribute("aria-disabled") === "true"),
    null,
  );
  const bodyRows = () => table.locator("tbody > tr.kl-tr:not(.kl-tr-detail)").count();
  await a.getByRole("menuitemradio", { name: "24 rows" }).click();
  await until(async () => (await bodyRows()) === 24);
  await a.getByRole("menuitem", { name: /Clear sort/ }).click();
  const sorted = () => table.locator('thead th[aria-sort="ascending"], thead th[aria-sort="descending"]').count();
  await until(async () => (await sorted()) === 0);
  const rows = await bodyRows();
  ok("block: 24 rows per page", rows === 24, rows);
  ok("block: Clear sort returns every header to none", (await sorted()) === 0, null);
  ok(
    "block: the expanded detail spans the visible columns",
    await (async () => {
      await table.locator("tbody .kl-xp button").first().click();
      await until(async () => (await table.locator("tbody td[colspan]").count()) > 0);
      const span = await table.locator("tbody td[colspan]").first().getAttribute("colspan");
      return Number(span) === nCols - 1 - 1;
    })(),
    await table.locator("tbody td[colspan]").first().getAttribute("colspan"),
  );
  ok("block: no page errors", a.errs.length === 0, a.errs);
});
