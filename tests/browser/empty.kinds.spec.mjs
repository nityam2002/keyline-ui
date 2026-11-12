// Empty: count band and title, live roles per kind, error → Retry → first-use, the narrow band, the cell layout.
import { test } from "./fixtures.mjs";
import { near, box, css, until } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["number", "empty"] });

test("empty: kinds, roles, retry recovery, narrow band, cell", async ({ open, ok }) => {
  const p = await open({ ready: "#number .kl-number" });
  const e = p.locator("#empty");
  await e.scrollIntoViewIfNeeded();
  const first = e.locator(".kl-empty").first();
  ok(
    "empty: count 0 · RESULTS · an h3 title",
    (await first.locator(".kl-empty-n").innerText()).replace(/\s+/g, " ") === "0 RESULTS" &&
      (await first.locator("h3").count()) === 1,
    await first.locator(".kl-empty-n").innerText(),
  );
  ok("empty: no live role unless asked", (await first.getAttribute("role")) === null, null);
  const err = e.locator(".kl-empty[data-kind=error]");
  ok(
    "empty: the error kind is an alert with a red count cell",
    (await err.getAttribute("role")) === "alert" &&
      (await css(err.locator(".kl-empty-n"), "background-color")) !==
        (await css(first.locator(".kl-empty-n"), "background-color")),
    null,
  );
  await err.getByRole("button", { name: "Retry" }).click();
  const start = e.locator(".kl-empty[data-kind=start]");
  await until(async () => (await start.count()) === 1);
  ok(
    "empty: Retry recovers to the first-use state (status)",
    (await start.count()) === 1 && (await start.getAttribute("role")) === "status",
    null,
  );
  const narrow = e.locator(".kl-empty").nth(2);
  const nb = await box(narrow.locator(".kl-empty-n"));
  const tb = await box(narrow.locator(".kl-empty-t"));
  ok(
    "empty: at 340px the count is a band above the message",
    nb.y + nb.height <= tb.y + 1 && near(nb.width, tb.width, 2),
    { nb, tb },
  );
  const cell = e.locator(".kl-empty[data-kl-layout=cell]");
  ok(
    "empty: a cell has no frame of its own",
    (await css(cell, "border-top-width")) === "0px",
    await css(cell, "border-top-width"),
  );
  ok("no page errors (default page)", p.errs.length === 0, p.errs);
});
