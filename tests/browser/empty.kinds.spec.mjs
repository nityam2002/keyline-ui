// Empty: count band and title, live roles per kind, error → Retry → first-use, the narrow band, the cell layout.
import { test } from "./fixtures.mjs";
import { near, box, css, until } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["number", "empty"] });

test("empty: kinds, roles, retry recovery, narrow band, cell", async ({ open, ok }) => {
  const p = await open({ ready: "#number .kl-number" });
  const e = p.locator("#empty");
  await e.scrollIntoViewIfNeeded();
  const first = e.locator("[data-slot=empty]").first();
  ok(
    "empty: count 0 · RESULTS · an h3 title",
    (await first.locator("[data-slot=empty-count]").innerText()).replace(/\s+/g, " ") === "0 RESULTS" &&
      (await first.locator("h3").count()) === 1,
    await first.locator("[data-slot=empty-count]").innerText(),
  );
  ok("empty: no live role unless asked", (await first.getAttribute("role")) === null, null);
  const err = e.locator("[data-slot=empty][data-kind=error]");
  ok(
    "empty: the error kind is an alert with a red count cell",
    (await err.getAttribute("role")) === "alert" &&
      (await css(err.locator("[data-slot=empty-count]"), "background-color")) !==
        (await css(first.locator("[data-slot=empty-count]"), "background-color")),
    null,
  );
  await err.getByRole("button", { name: "Retry" }).click();
  const start = e.locator("[data-slot=empty][data-kind=start]");
  await until(async () => (await start.count()) === 1);
  ok(
    "empty: Retry recovers to the first-use state (status)",
    (await start.count()) === 1 && (await start.getAttribute("role")) === "status",
    null,
  );
  const narrow = e.locator("[data-slot=empty]").nth(2);
  const nb = await box(narrow.locator("[data-slot=empty-count]"));
  const tb = await box(narrow.locator("[data-slot=empty-content]"));
  ok(
    "empty: at 340px the count is a band above the message",
    nb.y + nb.height <= tb.y + 1 && near(nb.width, tb.width, 2),
    { nb, tb },
  );
  const cell = e.locator("[data-slot=empty][data-kl-layout=cell]");
  ok(
    "empty: a cell has no frame of its own",
    (await css(cell, "border-top-width")) === "0px",
    await css(cell, "border-top-width"),
  );
  ok("no page errors (default page)", p.errs.length === 0, p.errs);
});
