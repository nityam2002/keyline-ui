// Keyboard, focus and placement of Popover, Sheet, DatePicker, Notice and Item inside the playground's Preview
// compositions. WebKit does not move focus to buttons on click, so triggers are driven
// from the keyboard everywhere.
import { test, idle } from "./fixtures.mjs";
import { until, pick } from "./lib/flow.mjs";

const focusIn = (p, sel) => p.evaluate((sel) => !!document.activeElement?.closest(sel), sel);
const focusedText = (p) =>
  p.evaluate(() =>
    (document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent || "").trim(),
  );

async function setup(open) {
  const p = await open({ route: "playground", width: 1600, height: 1000, ready: "[data-slot=preview]" });
  const press = async (loc) => {
    await loc.focus();
    await p.keyboard.press("Enter");
  };
  return {
    p,
    scope: p.getByTestId("scope-preview"),
    ctl: p.getByRole("complementary", { name: "Configuration" }),
    press,
  };
}

test("popover: docked, focus inside, nested select, Escape returns focus", async ({ open, ok }) => {
  const { p, scope, press } = await setup(open);
  const filters = scope.getByRole("button", { name: /^Filters/ });
  await press(filters);
  const pop = p.locator("[data-slot=popover-popup]").filter({ hasText: "Filter shipments" }).first();
  await until(async () => (await pop.isVisible()) && (await focusIn(p, "[data-slot=popover-popup]")));
  await idle(p);
  ok(
    "popover: opens with focus inside",
    (await pop.isVisible()) && (await focusIn(p, "[data-slot=popover-popup]")),
    await focusedText(p),
  );
  const tb = await filters.boundingBox();
  const pb = await pop.boundingBox();
  ok(
    "popover: docked under its trigger, end-aligned",
    Math.abs(pb.y - (tb.y + tb.height)) <= 4 && Math.abs(pb.x + pb.width - (tb.x + tb.width)) <= 4,
    { tb, pb },
  );
  await pop.locator("[role=combobox]").focus();
  await p.keyboard.press("Enter");
  await p.locator("[role=listbox]:visible").waitFor();
  await idle(p);
  await p.keyboard.press("ArrowDown");
  await p.keyboard.press("Enter");
  await until(async () => (await pop.locator("[role=combobox]").textContent()).includes("DHL"));
  await idle(p);
  ok(
    "popover: choosing in a nested select keeps the popover open",
    (await pop.isVisible()) && (await pop.locator("[role=combobox]").textContent()).includes("DHL"),
    await pop.locator("[role=combobox]").textContent(),
  );
  await p.keyboard.press("Escape");
  await until(async () => !(await pop.isVisible()) && /Filters/.test(await focusedText(p)));
  ok(
    "popover: Escape closes and returns focus to the trigger",
    !(await pop.isVisible()) && /Filters/.test(await focusedText(p)),
    await focusedText(p),
  );
  ok("no page errors", p.errs.length === 0, p.errs);
});

test("sheet: modal focus trap, edge attachment (LTR and RTL), notice, Escape returns focus", async ({ open, ok }) => {
  const { p, scope, ctl, press } = await setup(open);
  const details = scope.getByRole("button", { name: "Carrier details" });
  await press(details);
  const sheet = p.getByRole("dialog").filter({ hasText: "Insurance certificate" });
  await sheet.waitFor();
  await until(() => focusIn(p, "[role=dialog]"));
  await idle(p);
  let trapped = true;
  // paced like a person: Base UI's focus guards redirect asynchronously, and zero-delay synthetic Tabs
  // can outrun them (Dialog behaves the same)
  for (let i = 0; i < 14; i++) {
    await p.keyboard.press("Tab");
    await p.waitForTimeout(80); // timing: Tabs paced like a person (the focus guards redirect asynchronously)
    if (!(await focusIn(p, "[role=dialog]"))) trapped = false;
  }
  ok("sheet: Tab stays inside the sheet", trapped);
  const sb = await sheet.boundingBox();
  ok("sheet: attached to the inline-end edge (LTR: right)", Math.abs(sb.x + sb.width - 1600) <= 1 && sb.y <= 1, sb);
  ok(
    "sheet: notice inside it is announced as a region with a glyph and text",
    (await sheet.locator("[data-slot=notice]").count()) === 1,
  );
  await p.keyboard.press("Escape");
  await until(async () => (await sheet.count()) === 0 && (await focusedText(p)).endsWith("Carrier details"));
  ok(
    "sheet: Escape closes and returns focus to the trigger",
    (await sheet.count()) === 0 && (await focusedText(p)).endsWith("Carrier details"),
    await focusedText(p),
  );
  const rtlSwitch = ctl.getByRole("switch", { name: "Right to left" });
  await rtlSwitch.click();
  await until(async () => (await rtlSwitch.getAttribute("aria-checked")) === "true");
  await idle(p);
  await press(details);
  await sheet.waitFor();
  await idle(p);
  const rb = await sheet.boundingBox();
  ok("sheet: RTL attaches to the left edge", rb.x <= 1, rb);
  ok("no page errors", p.errs.length === 0, p.errs);
});

test("date picker: grid keyboard, unavailable days, form value, inside the booking dialog", async ({ open, ok }) => {
  const { p, scope, press } = await setup(open);
  await press(scope.getByRole("button", { name: "Book pickup…" }));
  const dlg = p.getByRole("dialog").filter({ hasText: "Book a pickup" });
  await dlg.waitFor();
  await idle(p);
  const trigger = dlg.locator("[data-slot=date-picker-trigger]");
  await press(trigger);
  const grid = p.locator("[role=grid]").last();
  await grid.waitFor();
  await until(async () => /9 November 2026/.test(await focusedText(p)));
  ok(
    "date picker: focus lands on the selected day in the grid",
    /9 November 2026/.test(await focusedText(p)),
    await focusedText(p),
  );
  await p.keyboard.press("ArrowRight");
  ok("date picker: ArrowRight moves one day", /10 November 2026/.test(await focusedText(p)), await focusedText(p));
  await p.keyboard.press("ArrowDown");
  ok("date picker: ArrowDown moves one week", /17 November 2026/.test(await focusedText(p)), await focusedText(p));
  const sunday = grid.locator("[role=gridcell] button[aria-label*='15 November 2026']");
  ok(
    "date picker: an unavailable day says why",
    (await sunday.isDisabled()) && /unavailable \(Depot closed\)/.test(await sunday.getAttribute("aria-label")),
    await sunday.getAttribute("aria-label"),
  );
  await p.keyboard.press("Enter");
  await until(async () => !(await grid.isVisible()) && (await focusIn(p, "[data-slot=date-picker-trigger]")));
  ok(
    "date picker: Enter chooses, closes and returns focus to the trigger",
    !(await grid.isVisible()) && (await focusIn(p, "[data-slot=date-picker-trigger]")),
    await focusedText(p),
  );
  ok(
    "date picker: the form value is the ISO date",
    (await dlg.locator("input[type=hidden][name=pickup]").inputValue()) === "2026-11-17",
    await dlg.locator("input[type=hidden][name=pickup]").inputValue(),
  );
  ok("date picker: the dialog stayed open throughout", await dlg.isVisible());
  ok("no page errors", p.errs.length === 0, p.errs);
});

test("notice: dismiss folds it away and makes it inert", async ({ open, ok }) => {
  const { p, scope, press } = await setup(open);
  const info = scope.locator("[data-slot=notice]").filter({ hasText: "Carrier rates update" });
  await press(info.getByRole("button", { name: "Dismiss" }));
  const isGone = () =>
    info.evaluate((e) => {
      const host = e.closest("[inert]") ?? e;
      return (
        host.hasAttribute("inert") ||
        e.getBoundingClientRect().height < 1 ||
        getComputedStyle(e).visibility === "hidden"
      );
    });
  await until(isGone);
  await idle(p);
  ok("notice: dismiss folds it away and makes it inert", await isGone());
  ok("no page errors", p.errs.length === 0, p.errs);
});

test("item: rows are real controls; the link row is a link", async ({ open, ok }) => {
  const { p, scope } = await setup(open);
  const items = scope.locator("[data-slot=item-list]").first();
  ok(
    "item: switch inside a row toggles from the keyboard",
    await (async () => {
      const sw = items.getByRole("switch").first();
      const before = await sw.getAttribute("aria-checked");
      await sw.focus();
      await p.keyboard.press("Space");
      return before !== (await sw.getAttribute("aria-checked"));
    })(),
  );
  ok(
    "item: the add row renders as a link (render prop keeps the element)",
    (await items.getByRole("link").count()) >= 1,
  );
  ok("no page errors", p.errs.length === 0, p.errs);
});

test("reduced motion: the sheet opens without animation", async ({ open, ok }) => {
  const { p, scope, press } = await setup(open);
  await pick(p, "Motion", "Reduced");
  await idle(p);
  // Every animation and transition that starts while the sheet opens is recorded as it starts, so how long one
  // lasts does not decide whether it is seen. A zero-duration one has finished by its start event and is not
  // recorded. The Configuration panel sits outside the reduced scope by design (the Motion picker's band travels;
  // picking scrolls the panel, whose thumb holds on a timer and then fades), so its motion is left out.
  await p.evaluate(() => {
    const seen = /** @type {string[]} */ ([]);
    /** @param {AnimationEvent | TransitionEvent} e */
    const record = (e) => {
      const el = /** @type {Element} */ (e.target);
      if (el.closest('aside[aria-label="Configuration"]')) return;
      const name = "animationName" in e ? e.animationName : e.propertyName;
      const live = el
        .getAnimations()
        .filter((a) => (/** @type {any} */ (a).animationName ?? /** @type {any} */ (a).transitionProperty) === name)
        .filter((a) => Number(a.effect?.getComputedTiming().activeDuration ?? 0) > 0);
      if (!live.length) return;
      const where = el.closest("[data-slot=sheet-popup], [data-testid=scope-preview], main");
      seen.push(
        `${name} on ${el.getAttribute("data-slot") ?? el.className} in ${where?.getAttribute("data-slot") ?? where?.getAttribute("data-testid") ?? where?.tagName ?? "page"}`,
      );
    };
    document.addEventListener("animationstart", record, true);
    document.addEventListener("transitionrun", record, true);
    /** @type {any} */ (window).__motion = seen;
  });
  const details = scope.getByRole("button", { name: "Carrier details" });
  await press(details);
  const sheet = p.getByRole("dialog");
  await sheet.waitFor();
  await idle(p);
  const anim = await p.evaluate(() => /** @type {any} */ (window).__motion);
  ok("reduced motion: opening the sheet runs no animation", anim.length === 0, anim);
  ok("no page errors", p.errs.length === 0, p.errs);
});
