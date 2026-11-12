// The sortable table header: aria-sort, the ink band, the press cycle (ascending → descending → none), a
// high-to-low column, the mark in an end-aligned column, the Empty cell for no rows, and recovery.
import { test } from "./fixtures.mjs";
import { box, css } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["number", "sort"] });

test("sort: aria-sort, band, press cycle, end-aligned mark, empty result", async ({ open, ok }) => {
  const p = await open({ ready: "#number .kl-number" });
  const s = p.locator("#sort");
  await s.scrollIntoViewIfNeeded();
  const th = (name) => s.locator("th", { hasText: name });
  const firstRef = () => s.locator("tbody tr").first().locator("td").first().innerText();
  ok(
    "sort: aria-sort on every sortable header (ETA ascending, others none)",
    (await th("ETA").getAttribute("aria-sort")) === "ascending" &&
      (await th("Reference").getAttribute("aria-sort")) === "none",
    null,
  );
  const band = await css(th("ETA"), "box-shadow");
  ok("sort: the sorted header carries the ink band", band !== "none" && /inset/.test(band), band);
  await th("Reference").getByRole("button").click();
  ok(
    "sort: a new column starts ascending, numeric-aware (SH-2 first)",
    (await th("Reference").getAttribute("aria-sort")) === "ascending" &&
      (await th("ETA").getAttribute("aria-sort")) === "none" &&
      (await firstRef()) === "SH-2",
    await firstRef(),
  );
  await th("Reference").getByRole("button").press("Enter");
  ok(
    "sort: Enter on the header flips it (SH-31 first)",
    (await th("Reference").getAttribute("aria-sort")) === "descending" && (await firstRef()) === "SH-31",
    await firstRef(),
  );
  await th("Reference").getByRole("button").press("Space");
  ok(
    "sort: the third press clears the sort",
    (await th("Reference").getAttribute("aria-sort")) === "none" &&
      /nothing/.test(await p.getByTestId("sort-state").innerText()),
    null,
  );
  await th("Gross weight").getByRole("button").click();
  ok(
    "sort: a high-to-low column starts descending (22,650 first)",
    (await th("Gross weight").getAttribute("aria-sort")) === "descending" &&
      (await s.locator("tbody tr").first().locator("td").nth(3).innerText()) === "22,650",
    null,
  );
  const mark = await box(th("Gross weight").locator(".kl-sort"));
  const lbl = await box(th("Gross weight").locator(".kl-th-label"));
  ok("sort: in an end-aligned column the mark sits before the label", mark.x + mark.width <= lbl.x + 1, { mark, lbl });
  await s.getByRole("button", { name: "Filter to nothing" }).click();
  ok(
    "sort: an empty result is an Empty cell inside the table",
    (await s.locator(".kl-tr-state .kl-empty").count()) === 1 &&
      (await s.locator(".kl-tr-state .kl-empty").getByText("No shipments match").isVisible()),
    null,
  );
  await s.getByRole("button", { name: "Clear filter" }).click();
  ok(
    "sort: clearing the filter brings the rows back",
    (await s.locator("tbody tr").count()) === 4,
    await s.locator("tbody tr").count(),
  );
  ok("no page errors (default page)", p.errs.length === 0, p.errs);
});
