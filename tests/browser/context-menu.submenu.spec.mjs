// ContextMenu: opening at the pointer, marking the object, direction in the portal, a keyboard path into a Menu
// submenu and back, Escape; in LTR also the keyboard contextmenu event, a disabled item and running an action.
import { test, idle, settle } from "./fixtures.mjs";
import { near, box, active, until } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["slider", "context"] });

for (const dir of ["ltr", "rtl"]) {
  test(`context menu (${dir}): pointer opening, submenu by keyboard, Escape`, async ({ open, ok }) => {
    const q = await open({ q: `dir=${dir}`, ready: "#slider .kl-slider" });
    const rows = q.locator("#context .kl-ctx-trigger");
    await rows.nth(0).evaluate((el) => {
      el.scrollIntoView({ block: "start" });
      window.scrollBy(0, -120);
    });
    await settle(q);
    const rb = await box(rows.nth(0));
    // press near the row's inline-start, so the submenu has room on the inline-end side (else it flips, correctly)
    const px = dir === "ltr" ? rb.x + 120 : rb.x + rb.width - 120;
    await q.mouse.click(px, rb.y + 20, { button: "right" });
    const menu = q.locator("[data-slot=menu-popup]").first();
    await menu.waitFor();
    await idle(q);
    const mb = await box(menu);
    ok(
      `context menu (${dir}): right-click opens at the pointer (pointer 2px inside its top-start corner, Base UI's default)`,
      (await menu.isVisible()) &&
        (dir === "ltr" ? near(mb.x, px + 2, 1.5) : near(mb.x + mb.width, px - 2, 1.5)) &&
        near(mb.y, rb.y + 20 - 5, 1.5),
      { mb, at: [px, rb.y + 20] },
    );
    ok(
      `context menu (${dir}): the object is marked while open`,
      (await rows.nth(0).getAttribute("data-popup-open")) !== null &&
        (await rows.nth(0).evaluate((el) => getComputedStyle(el).outlineStyle)) === "solid",
      null,
    );
    ok(
      `context menu (${dir}): carries the page direction into the portal`,
      (await q
        .locator(".kl-positioner")
        .filter({ has: q.locator("[data-slot=menu-popup]") })
        .getAttribute("dir")) === dir,
      null,
    );
    // keyboard into the submenu
    await q.keyboard.press("ArrowDown");
    await q.keyboard.press("ArrowDown");
    await q.keyboard.press("ArrowDown");
    await q.keyboard.press(dir === "ltr" ? "ArrowRight" : "ArrowLeft");
    const sub = q.locator("[data-slot=menu-popup]").filter({ hasText: "Customs broker" });
    await sub.waitFor();
    await until(async () => (await active(q)).text.startsWith("Customs broker"));
    await idle(q);
    const sb = await box(sub);
    const mb2 = await box(menu);
    ok(
      `submenu (${dir}): opens beside the menu on its inline-end, sharing one 2px edge`,
      (await sub.isVisible()) && (dir === "ltr" ? near(sb.x, mb2.x + mb2.width - 2) : near(sb.x + sb.width, mb2.x + 2)),
      { sb, mb2 },
    );
    const trig = menu.locator("[data-slot=menu-submenu-trigger]");
    const tb = await box(trig);
    ok(
      `submenu (${dir}): its first row is level with the trigger row; the trigger keeps the cursor`,
      near(sb.y + 2, tb.y, 2) && (await trig.getAttribute("data-popup-open")) !== null,
      { sb, tb },
    );
    ok(
      `submenu (${dir}): focus is on its first item`,
      (await active(q)).text.startsWith("Customs broker"),
      await active(q),
    );
    await q.keyboard.press(dir === "ltr" ? "ArrowLeft" : "ArrowRight");
    await until(async () => !(await sub.isVisible()) && /Send to/.test((await active(q)).text));
    ok(
      `submenu (${dir}): the opposite arrow closes it and returns to the trigger`,
      !(await sub.isVisible()) && /Send to/.test((await active(q)).text),
      await active(q),
    );
    await q.keyboard.press("Escape");
    await until(async () => !(await menu.isVisible()) && (await rows.nth(0).getAttribute("data-popup-open")) === null);
    ok(
      `context menu (${dir}): Escape closes and unmarks the object`,
      !(await menu.isVisible()) && (await rows.nth(0).getAttribute("data-popup-open")) === null,
      null,
    );
    if (dir === "ltr") {
      // keyboard opening: the Menu key / Shift+F10 fire `contextmenu` on the focused row
      await rows.nth(2).focus();
      await rows
        .nth(2)
        .dispatchEvent("contextmenu", { bubbles: true, cancelable: true, button: 2, clientX: 0, clientY: 0 });
      const m3 = q.locator("[data-slot=menu-popup]").first();
      await until(async () => (await m3.isVisible()) && /EUR1/.test(await m3.innerText()));
      ok(
        "context menu: a keyboard contextmenu event on a focused row opens its menu (focus inside)",
        (await m3.isVisible()) && /EUR1/.test(await m3.innerText()),
        null,
      );
      const openItem = m3.getByRole("menuitem", { name: /\bOpen\b/ });
      ok(
        "context menu: a missing document's Open is disabled",
        (await openItem.getAttribute("aria-disabled")) === "true",
        null,
      );
      await m3.getByRole("menuitem", { name: /Upload new version/ }).click();
      const status = q.locator("#context [role=status]");
      await until(
        async () => (await status.innerText()).includes("Uploading a new version of EUR.1") && !(await m3.isVisible()),
      );
      ok(
        "context menu: choosing runs the action and closes",
        (await status.innerText()).includes("Uploading a new version of EUR.1") && !(await m3.isVisible()),
        await status.innerText(),
      );
    }
  });
}
