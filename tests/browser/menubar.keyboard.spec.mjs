// Menubar: role and name, arrow keys between titles, opening with ArrowDown, the inverse open title, docking on
// the bar's keyline, moving between open menus, checkbox/radio items, Escape, a submenu item, a disabled title.
import { test, idle } from "./fixtures.mjs";
import { near, css, until } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["participants", "menubar"] });

test("menubar: keyboard, docking, items, submenu, disabled title", async ({ open, ok }) => {
  const p = await open({ ready: "#participants form" });
  const sec = p.locator("#menubar");
  await sec.scrollIntoViewIfNeeded();
  const bar = sec.getByRole("menubar", { name: "Shipments" });
  ok("menubar: role menubar, named", (await bar.count()) === 1, null);
  const file = bar.getByRole("menuitem", { name: "File" });
  const edit = bar.getByRole("menuitem", { name: "Edit" });
  const view = bar.getByRole("menuitem", { name: "View" });
  const focused = (loc) => loc.evaluate((e) => e === document.activeElement);
  const state = () => sec.getByTestId("specimen-menubar").textContent();
  await file.focus();
  await p.keyboard.press("ArrowRight");
  ok("menubar: ArrowRight moves to the next title", await focused(edit), null);
  await p.keyboard.press("ArrowDown");
  const undo = p.getByRole("menuitem", { name: "Undo" });
  await undo.waitFor();
  await idle(p);
  ok("menubar: ArrowDown opens the menu", await undo.isVisible(), null);
  ok(
    "menubar: the open title is the inverse cell",
    (await edit.getAttribute("data-popup-open")) !== null &&
      (await css(edit, "background-color")) !== (await css(file, "background-color")),
    null,
  );
  const menu = p.locator(".kl-mbar-menu");
  const mb = await menu.boundingBox();
  const bb = await bar.boundingBox();
  ok("menubar: the menu's top border lies on the bar's bottom keyline", near(mb.y, bb.y + bb.height - 2, 1.5), [
    mb.y,
    bb.y + bb.height,
  ]);
  await p.keyboard.press("ArrowRight");
  await until(async () => (await view.getAttribute("data-popup-open")) !== null && !(await undo.isVisible()));
  ok(
    "menubar: with a menu open, ArrowRight opens the next menu",
    (await view.getAttribute("data-popup-open")) !== null && !(await undo.isVisible()),
    null,
  );
  const value = p.getByRole("menuitemcheckbox", { name: "Value" });
  await value.click();
  await until(async () => (await state()).includes("status, eta, value"));
  ok(
    "menubar: a checkbox item toggles and the menu stays open",
    (await state()).includes("status, eta, value") && (await value.isVisible()),
    await state(),
  );
  await p.getByRole("menuitemradio", { name: "48 rows" }).click();
  await until(async () => (await state()).includes("48 rows"));
  ok("menubar: a radio item chooses", (await state()).includes("48 rows"), null);
  await p.keyboard.press("Escape");
  await until(async () => !(await value.isVisible()));
  ok(
    "menubar: Escape closes and focus returns to the title",
    !(await value.isVisible()) && (await focused(view)),
    null,
  );
  await file.click();
  const exp = p.getByRole("menuitem", { name: "Export" });
  await exp.waitFor();
  await exp.hover();
  const csv = p.getByRole("menuitem", { name: "CSV" });
  await csv.waitFor();
  await idle(p);
  await csv.click();
  await until(async () => (await state()).includes("Export CSV") && !(await csv.isVisible()));
  ok(
    "menubar: a submenu item runs and the menus close",
    (await state()).includes("Export CSV") && !(await csv.isVisible()),
    null,
  );
  const auto = bar.getByRole("menuitem", { name: "Automations" });
  ok("menubar: a disabled menu's title is hatched", (await css(auto, "background-image")) !== "none", null);
  ok("specimen: no page errors", p.errs.length === 0, p.errs);
});
