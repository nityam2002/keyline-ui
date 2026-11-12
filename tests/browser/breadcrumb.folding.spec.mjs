// Breadcrumb: landmarks, list and current page, folding long paths into the … menu, narrow folding; RTL chevrons
// and cut-off corners.
import { test } from "./fixtures.mjs";
import { box, css } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["number", "wayfinding"] });

const READY = "#number .kl-number";

test("breadcrumb: landmarks, current page, folding, … menu, narrow", async ({ open, ok }) => {
  const p = await open({ ready: READY });
  const w = p.locator("#wayfinding");
  await w.scrollIntoViewIfNeeded();
  const crumbs = w.getByRole("navigation", { name: "Breadcrumb" });
  ok("breadcrumb: three breadcrumb landmarks", (await crumbs.count()) === 3, await crumbs.count());
  const short = crumbs.nth(0);
  ok(
    "breadcrumb: an ordered list; here is aria-current=page and not a link",
    (await short.locator("ol > li").count()) === 4 &&
      (await short.locator("[aria-current=page]").innerText()) === "ECT Delta" &&
      (await short.locator("a[aria-current]").count()) === 0,
    null,
  );
  ok(
    "breadcrumb: short path shows every level, no … cell",
    !(await short.locator(".kl-crumb-more").isVisible()) && (await short.getByRole("link").count()) === 2,
    null,
  );
  const long = crumbs.nth(1);
  ok(
    "breadcrumb: six levels fold to … · parent · here",
    (await long.locator(".kl-crumb-more").isVisible()) &&
      (await long.getByRole("link", { name: "Network" }).isVisible()) === false &&
      (await long.getByRole("link", { name: "Maasvlakte II" }).isVisible()),
    null,
  );
  const here = await box(long.locator(".kl-crumb-cur"));
  const navBox = await box(long);
  ok(
    "breadcrumb: a very long current label stays inside the frame",
    here.x + here.width <= navBox.x + navBox.width + 1,
    { here, navBox },
  );
  await long.getByRole("button", { name: /Earlier levels/ }).click();
  const items = p.getByRole("menu").getByRole("menuitem");
  await items.first().waitFor();
  ok(
    "breadcrumb: the … menu lists the folded levels in order, as links",
    (await items.allInnerTexts()).map((t) => t.replace(/^\d+\s*/, "").trim()).join("|") ===
      "Network|Europe|Netherlands|Port of Rotterdam" && (await p.getByRole("menu").locator("a[href]").count()) === 4,
    await items.allInnerTexts(),
  );
  await p.keyboard.press("Escape");
  const narrow = crumbs.nth(2);
  ok(
    "breadcrumb: under 480px of width it folds even with four levels",
    (await narrow.locator(".kl-crumb-more").isVisible()) &&
      !(await narrow.getByRole("link", { name: "Network" }).isVisible()),
    null,
  );
  ok("no page errors (default page)", p.errs.length === 0, p.errs);
});

test("breadcrumb: rtl chevrons mirror; cut off keeps no corner room", async ({ open, ok }) => {
  const q = await open({ q: "dir=rtl&cut=off&density=compact", ready: READY });
  const w = q.locator("#wayfinding");
  await w.scrollIntoViewIfNeeded();
  const sep = q.locator("#wayfinding .kl-crumb-sep").first();
  ok("rtl: breadcrumb chevrons mirror", (await css(sep, "scale")) === "-1 1", await css(sep, "scale"));
  ok(
    "cut off: the breadcrumb keeps no corner room",
    (await css(w.locator(".kl-crumbs-list").first(), "padding-inline-start")) === "0px",
    null,
  );
  ok("no page errors (rtl, cut off, compact)", q.errs.length === 0, q.errs);
});
