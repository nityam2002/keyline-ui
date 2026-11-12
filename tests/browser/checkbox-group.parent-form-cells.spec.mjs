// CheckboxGroup (from r13): parent row, descriptions, rules, Form values / validate / server errors, popover cells,
// invalid and disabled groups.
import { test, idle } from "./fixtures.mjs";
import { poll, css, token } from "./lib/probes-c.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["toolbar", "checkbox-group"] });

const READY = "[data-testid=specimen-toolbar]";

test("checkbox group: parent row, keyboard, descriptions, rules", async ({ open, ok }) => {
  const p = await open({ ready: READY });
  const sec = p.locator("#checkbox-group");
  await sec.scrollIntoViewIfNeeded();
  const n = p.getByTestId("cbg-notify");
  const box_ = (name) => n.getByRole("checkbox", { name });
  const parent = box_("All events");
  ok(
    "checkbox group: a named group (fieldset legend)",
    (await n.getByRole("group", { name: "Notify me about" }).count()) === 1,
    null,
  );
  ok(
    "checkbox group: the parent is mixed while some are checked; its count says 2/4",
    (await parent.getAttribute("aria-checked")) === "mixed" &&
      (await n.locator("[data-kl-parent] .kl-cbg-meta").textContent()) === "2/4",
    await parent.getAttribute("aria-checked"),
  );
  await parent.click();
  const readAll = () =>
    Promise.all(
      ["Delayed", "Arrived at the dock", /Exception raised/, "Invoice ready"].map((x) =>
        box_(x).getAttribute("aria-checked"),
      ),
    );
  const after = await poll(readAll, (a) => a.slice(0, 3).every((x) => x === "true") && a[3] === "false", 2000);
  ok(
    "checkbox group: the parent checks every enabled option; the disabled one keeps its state",
    after.slice(0, 3).every((x) => x === "true") && after[3] === "false",
    after,
  );
  await parent.click();
  const readTwo = () =>
    Promise.all(["Delayed", "Arrived at the dock"].map((x) => box_(x).getAttribute("aria-checked")));
  const cleared = await poll(readTwo, (a) => a.every((x) => x === "false"), 2000);
  ok(
    "checkbox group: a second press clears them",
    cleared.every((x) => x === "false") && /none/.test(await n.textContent()),
    cleared,
  );
  await n.getByText("Arrived at the dock").click();
  const arrived = await poll(
    () => box_("Arrived at the dock").getAttribute("aria-checked"),
    (v) => v === "true",
    2000,
  );
  ok("checkbox group: the whole row is the target (label text toggles)", arrived === "true", null);
  await box_("Arrived at the dock").focus();
  await p.keyboard.press("Tab");
  ok(
    "checkbox group: Tab moves to the next box",
    /Exception/.test((await p.evaluate(() => document.activeElement.closest("label")?.textContent)) || ""),
    null,
  );
  await p.keyboard.press("Space");
  ok("checkbox group: Space toggles", (await box_(/Exception raised/).getAttribute("aria-checked")) === "true", null);
  const desc = await box_("Delayed").evaluate((e) =>
    (e.getAttribute("aria-describedby") || "")
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent || "")
      .join("|"),
  );
  ok("checkbox group: an option's description describes its box", /ETA moved/.test(desc), desc);
  const g = await n.evaluate((root) => {
    const rows = [...root.querySelectorAll(".kl-cbg-row")];
    const meta = rows.map((r) => r.querySelector(".kl-cbg-meta").getBoundingClientRect().x);
    return {
      parentRule: getComputedStyle(rows[1]).borderTopWidth,
      rowRule: getComputedStyle(rows[2]).borderTopWidth,
      metaStraight: meta.every((x) => Math.abs(x - meta[0]) < 0.5),
      wrapH: rows[3].getBoundingClientRect().height,
      h: rows[2].getBoundingClientRect().height,
    };
  });
  ok(
    "checkbox group: 2px rule under the parent row, 1px between options",
    g.parentRule === "2px" && g.rowRule === "1px",
    g,
  );
  ok(
    "checkbox group: the meta column runs straight; a long label wraps inside its row",
    g.metaStraight && g.wrapH > g.h + 10,
    g,
  );
  const inv = n.locator(".kl-cbg-row[data-disabled]");
  ok(
    "checkbox group: the disabled option is hatched",
    /repeating-linear-gradient|linear-gradient/.test(await css(inv.locator(".kl-cbg-label"), "background-image")),
    null,
  );
  ok("checkbox group: no page errors", p.errs.length === 0, p.errs);
});

test("checkbox group in a Form: validate, values, server error", async ({ open, ok }) => {
  const p = await open({ ready: READY });
  // Form: validate, server error, values
  const f = p.getByTestId("cbg-form");
  await f.scrollIntoViewIfNeeded();
  const values = () => p.getByTestId("cbg-values").textContent();
  await f.getByRole("checkbox", { name: "Benelux" }).click();
  await f.getByRole("button", { name: "Save access" }).click();
  const regions = f.locator(".kl-cbg");
  await f
    .getByText("Choose at least one region.")
    .waitFor({ state: "visible" })
    .catch(() => {});
  await idle(p);
  const red = await token(p, "--kl-red");
  const frame = await poll(
    () => css(regions.locator(".kl-cbg-frame"), "border-top-color"),
    (c) => c === red,
    2000,
  );
  ok(
    "checkbox group in a Form: validate fails with its message; the frame turns red",
    (await f.getByText("Choose at least one region.").isVisible()) && frame === red,
    frame,
  );
  await f.getByRole("checkbox", { name: "Baltics" }).click();
  await f.getByRole("button", { name: "Save access" }).click();
  const v1 = await poll(values, (t) => /"regions":\["baltics"\]/.test(t), 3000);
  ok("checkbox group in a Form: values carry the checked list under its name", /"regions":\["baltics"\]/.test(v1), v1);
  await f
    .getByText(/customs bond/)
    .waitFor({ state: "visible" })
    .catch(() => {});
  ok(
    "checkbox group in a Form: a server error from Form errors shows under the group",
    await f.getByText(/customs bond/).isVisible(),
    null,
  );
  await f.getByRole("checkbox", { name: "Baltics" }).click();
  await f
    .getByText(/customs bond/)
    .waitFor({ state: "hidden", timeout: 3000 })
    .catch(() => {});
  ok(
    "checkbox group in a Form: editing clears the server error",
    !(await f.getByText(/customs bond/).isVisible()),
    null,
  );
  await f.getByRole("checkbox", { name: "All" }).click();
  await f.getByRole("button", { name: "Save access" }).click();
  const all = /"regions":\["benelux","dach","nordics","iberia","baltics"\]|"regions":\[(?:"[a-z]+",?){5}\]/;
  const v2 = await poll(values, (t) => all.test(t), 3000);
  ok("checkbox group in a Form: the parent row checks all five", all.test(v2), v2);
  ok("checkbox group: no page errors", p.errs.length === 0, p.errs);
});

test("checkbox group cells in a popover; invalid and disabled groups", async ({ open, ok }) => {
  const p = await open({ ready: READY });
  const sec = p.locator("#checkbox-group");
  await sec.scrollIntoViewIfNeeded();
  // popover cells
  await sec.getByRole("button", { name: /^Status · 2/ }).click();
  const pop = p.locator("[data-slot=popover-popup]");
  await pop.waitFor({ state: "visible" });
  const pgroup = pop.getByRole("group", { name: "Status" });
  ok(
    "checkbox group cells: in a popover the legend names the group but is not shown",
    (await pgroup.count()) === 1 &&
      (await pop
        .locator(".kl-cbg legend, .kl-cbg .kl-field-label")
        .first()
        .evaluate((e) => e.getBoundingClientRect().width <= 1)),
    null,
  );
  const pf = await pop
    .locator(".kl-cbg-frame")
    .evaluate((e) => ({ b: getComputedStyle(e).borderTopWidth, l: getComputedStyle(e).borderLeftWidth }));
  ok("checkbox group cells: no frame of its own inside the popover", pf.b === "0px" && pf.l === "0px", pf);
  await pop.getByRole("checkbox", { name: "Late" }).click();
  const n3 = await poll(
    () => sec.getByRole("button", { name: /^Status · 3/ }).count(),
    (c) => c === 1,
    2000,
  );
  ok("checkbox group cells: state reaches the trigger (Status · 3)", n3 === 1, null);
  await p.keyboard.press("Escape");
  await pop.waitFor({ state: "hidden" }).catch(() => {});

  const bad = sec.getByRole("group", { name: "Labels to print" });
  ok(
    "checkbox group: invalid shows a red frame and its message",
    (await css(bad.locator(".kl-cbg-frame"), "border-top-color")) === (await token(p, "--kl-red")) &&
      (await bad.getByText("Pick at least one label.").isVisible()),
    null,
  );
  const dis = sec.getByRole("group", { name: "Archived channels" });
  const db = await dis
    .getByRole("checkbox")
    .evaluateAll((els) =>
      els.map((e) => e.getAttribute("aria-disabled") === "true" || e.hasAttribute("data-disabled")),
    );
  ok(
    "checkbox group: a disabled group disables every box and dims its frame",
    db.every(Boolean) &&
      (await css(dis.locator(".kl-cbg-frame"), "border-top-color")) !== (await token(p, "--kl-line")),
    db,
  );
  ok("checkbox group: no page errors", p.errs.length === 0, p.errs);
});
