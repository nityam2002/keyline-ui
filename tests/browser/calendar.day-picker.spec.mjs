// Calendar on react-day-picker: naming, month/year Selects, picking, library keyboard, next month; the range
// calendar's preview, commit and notches; min/max bounds; RTL; and the calendar inside a picker's popover.
import { test, idle } from "./fixtures.mjs";
import { active, until } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["time-bounds", "month-jump"] });

const OPEN = { height: 1000, ready: "[data-testid=specimen-bounds]" };

// the calendar's month and year are Keyline Selects: open the cell, choose the option
const pickOpt = async (p, scope, name, option) => {
  const cb = scope.getByRole("combobox", { name });
  await cb.click();
  const opt = p.getByRole("option", { name: option, exact: true });
  await opt.waitFor();
  await idle(p);
  await opt.click();
  await until(async () => (await cb.textContent()).trim() === option && !(await opt.isVisible()));
  await idle(p);
};

test("cal: naming, month/year dropdowns, picking, keyboard, next month", async ({ open, ok }) => {
  const p = await open(OPEN);
  const cal = p.getByTestId("jump-cal");
  const grid = () => cal.getByRole("grid");
  const day = (re) => cal.getByRole("button", { name: re });
  const log = () => p.getByTestId("jump-log").textContent();
  const label = () => grid().getAttribute("aria-label");
  ok("cal: the grid is named for its month", (await label()) === "November 2026", await label());
  ok(
    "cal: month and year are named selects showing November 2026",
    (await cal.getByRole("combobox", { name: "Month" }).textContent()).trim() === "November" &&
      (await cal.getByRole("combobox", { name: "Year" }).textContent()).trim() === "2026",
    null,
  );
  ok(
    "cal: Monday-first weekday headers (hidden from AT by the library; each day's name carries its weekday)",
    (await cal.locator(".kl-cal-wd").first().textContent()) === "Mon" &&
      /^Monday, 2 November/.test(await day(/, 2 November 2026/).getAttribute("aria-label")),
    null,
  );
  ok(
    "cal: today is marked aria-current=date",
    (await day(/, 7 November 2026/).getAttribute("aria-current")) === "date",
    null,
  );
  const w0 = await cal.evaluate((c) => c.querySelector(".kl-cal").getBoundingClientRect().width);
  await pickOpt(p, cal, "Year", "2028");
  await pickOpt(p, cal, "Month", "October");
  await until(async () => (await label()) === "October 2028");
  ok("dropdowns: choosing October and 2028 shows that month", (await label()) === "October 2028", await label());
  ok(
    "dropdowns: the width does not move between months",
    Math.abs((await cal.evaluate((c) => c.querySelector(".kl-cal").getBoundingClientRect().width)) - w0) < 0.5,
    null,
  );
  await day(/, 7 October 2028/).click();
  await until(async () => /2028-10-07/.test(await log()));
  ok("pick: a press chooses the day", /2028-10-07/.test(await log()), await log());
  ok(
    "pick: the chosen day floods ink (on, ink signal) and its cell is selected",
    await day(/, 7 October 2028/).evaluate(
      (x) =>
        x.hasAttribute("data-kl-on") &&
        x.classList.contains("kl-sig-ink") &&
        x.closest("[role=gridcell]").getAttribute("aria-selected") === "true",
    ),
    null,
  );
  const at = async () => (await active(p)).name;
  await p.keyboard.press("ArrowRight");
  await until(async () => /, 8 October 2028/.test(await at()));
  ok("keys: ArrowRight moves a day", /, 8 October 2028/.test(await at()), await active(p));
  await p.keyboard.press("ArrowDown");
  await until(async () => /, 15 October 2028/.test(await at()));
  ok("keys: ArrowDown moves a week", /, 15 October 2028/.test(await at()), await active(p));
  await p.keyboard.press("PageDown");
  await until(async () => /, 15 November 2028/.test(await at()) && (await label()) === "November 2028");
  ok(
    "keys: PageDown moves a month and the grid follows",
    /, 15 November 2028/.test(await at()) && (await label()) === "November 2028",
    await active(p),
  );
  await p.keyboard.press("Shift+PageDown");
  await until(async () => /, 15 November 2029/.test(await at()));
  ok("keys: Shift+PageDown moves a year", /, 15 November 2029/.test(await at()), await active(p));
  await p.keyboard.press("Home");
  await until(async () => /^Monday, 12 November 2029/.test(await at()));
  ok("keys: Home goes to the week's first day (Monday)", /^Monday, 12 November 2029/.test(await at()), await active(p));
  await p.keyboard.press("End");
  await until(async () => /^Sunday, 18 November 2029/.test(await at()));
  ok("keys: End goes to the week's last day (Sunday)", /^Sunday, 18 November 2029/.test(await at()), await active(p));
  await p.keyboard.press("Enter");
  await until(async () => /2029-11-18/.test(await log()));
  ok("keys: Enter chooses", /2029-11-18/.test(await log()), await log());
  await cal.getByRole("button", { name: "Next month" }).click();
  await until(async () => (await label()) === "December 2029");
  ok("nav: Next month steps the grid", (await label()) === "December 2029", await label());
  ok("no page errors (calendar)", p.errs.length === 0, p.errs);
});

test("range: Sunday-first, hover and arrow preview, Escape, commit, notches", async ({ open, ok }) => {
  const p = await open(OPEN);
  // range calendar (en-US, Sunday first)
  const rc = p.getByTestId("jump-range");
  const rday = (n) => rc.getByRole("button", { name: new RegExp(`, November ${n}, 2026`) });
  ok("range: Sunday-first headers", (await rc.locator(".kl-cal-wd").first().textContent()) === "Sun", null);
  await rday(5).click();
  await rday(17).hover();
  await until(
    async () =>
      (await rc.locator("[data-pending]").count()) === 1 && (await rday(10).getAttribute("data-preview")) === "",
  );
  ok(
    "range: after a start, hovering previews the range (pending, preview cells, labelled)",
    (await rc.locator("[data-pending]").count()) === 1 &&
      (await rday(10).getAttribute("data-preview")) === "" &&
      /in range, preview/.test(await rday(10).getAttribute("aria-label")),
    await rday(10).getAttribute("aria-label"),
  );
  await p.keyboard.press("Escape");
  await until(
    async () =>
      (await rc.locator("[data-pending]").count()) === 0 && (await rday(10).getAttribute("data-preview")) === null,
  );
  ok(
    "range: Escape drops the pending start",
    (await rc.locator("[data-pending]").count()) === 0 && (await rday(10).getAttribute("data-preview")) === null,
    null,
  );
  await rday(5).click();
  await p.keyboard.press("ArrowRight");
  await p.keyboard.press("ArrowRight");
  await until(
    async () =>
      /, November 7, 2026/.test((await active(p)).name) && (await rday(6).getAttribute("data-preview")) === "",
  );
  ok(
    "range: arrow keys after a start preview too",
    (await rday(6).getAttribute("data-preview")) === "" && (await rday(8).getAttribute("data-preview")) === null,
    null,
  );
  await rday(17).click();
  await until(
    async () => (await rday(10).evaluate((x) => x.closest("[role=gridcell]").getAttribute("aria-selected"))) === "true",
  );
  ok(
    "range: the second press commits 5–17 (cells selected, ends ink, labelled)",
    (await rday(10).evaluate((x) => x.closest("[role=gridcell]").getAttribute("aria-selected"))) === "true" &&
      (await rday(5).evaluate((x) => x.classList.contains("kl-sig-ink"))) &&
      /range start$/.test(await rday(5).getAttribute("aria-label")) &&
      /range end$/.test(await rday(17).getAttribute("aria-label")),
    await rday(5).getAttribute("aria-label"),
  );
  ok(
    "range: cut at the row ends, the cells carry notches (7 continues, 8 continued)",
    (await rday(7).getAttribute("data-cont-next")) === "" &&
      (await rday(8).getAttribute("data-cont-prev")) === "" &&
      (await rday(5).getAttribute("data-cont-prev")) === null,
    null,
  );
  const notch = await rday(7).evaluate((x) => getComputedStyle(x, "::after").borderInlineStartWidth);
  ok("range: the notch is drawn", notch === "6px", notch);
  ok("no page errors (calendar)", p.errs.length === 0, p.errs);
});

test("bounds: disabled days, unavailable navigation, single-year dropdown, keyboard stays inside", async ({
  open,
  ok,
}) => {
  const p = await open(OPEN);
  const bc = p.getByTestId("jump-bounded");
  const bday = (n) => bc.getByRole("button", { name: new RegExp(`, ${n} November 2026`) });
  ok(
    "bounds: days before min are disabled, hatched and say why",
    (await bday(2).isDisabled()) &&
      (await bday(2).getAttribute("data-unavailable")) === "" &&
      /unavailable \(before the first date\)/.test(await bday(2).getAttribute("aria-label")),
    await bday(2).getAttribute("aria-label"),
  );
  ok(
    "bounds: Previous month is unavailable at the first month",
    (await bc.getByRole("button", { name: "Previous month" }).getAttribute("aria-disabled")) === "true",
    null,
  );
  ok(
    "bounds: the year dropdown offers only 2026 (a single choice is shown, not opened)",
    (await bc.getByRole("combobox", { name: "Year" }).isDisabled()) &&
      (await bc.getByRole("combobox", { name: "Year" }).textContent()).trim() === "2026",
    null,
  );
  await bday(3).click();
  await p.keyboard.press("ArrowLeft");
  ok(
    "bounds: ArrowLeft from the first day stays put",
    /, 3 November 2026/.test((await active(p)).name),
    await active(p),
  );
  await bc.getByRole("button", { name: "Next month" }).click();
  const dec5 = bc.getByRole("button", { name: /, 5 December 2026/ });
  await dec5.waitFor();
  ok(
    "bounds: December shows; days after max are disabled; Next is unavailable",
    (await dec5.isDisabled()) &&
      (await bc.getByRole("button", { name: "Next month" }).getAttribute("aria-disabled")) === "true",
    null,
  );
  ok("no page errors (calendar)", p.errs.length === 0, p.errs);
});

test("rtl: direction, right-to-left days, narrow weekday names, ArrowLeft is next", async ({ open, ok }) => {
  const p = await open(OPEN);
  const rtl = p.getByTestId("jump-rtl");
  ok(
    "rtl: the calendar takes the DOM direction",
    (await rtl.locator(".kl-cal-root").getAttribute("dir")) === "rtl",
    null,
  );
  const xs = await rtl
    .locator("button.kl-day")
    .evaluateAll((ds) => [ds[0].getBoundingClientRect().left, ds[1].getBoundingClientRect().left]);
  ok("rtl: days run right to left", xs[0] > xs[1], xs);
  const heads = await rtl.locator(".kl-cal-wd").allTextContents();
  ok(
    "rtl: long weekday names fall back to the narrow form",
    heads.every((h) => [...h].length <= 3),
    heads,
  );
  await rtl.locator("button.kl-day").nth(6).click();
  const before = (await active(p)).name;
  await p.keyboard.press("ArrowLeft");
  const after = (await active(p)).name;
  ok(
    "rtl: ArrowLeft moves to the next day",
    before !== after &&
      (await rtl
        .locator("button.kl-day")
        .nth(7)
        .evaluate((x) => x === document.activeElement)),
    [before, after],
  );
  ok("no page errors (calendar)", p.errs.length === 0, p.errs);
});

test("picker: focus in the grid, year dropdown inside the popover, Escape returns focus", async ({ open, ok }) => {
  const p = await open(OPEN);
  const form = p.getByTestId("bounds-form");
  const trig = form.getByRole("button", { name: /Dock slot/ });
  await trig.click();
  const dlg = p.locator("[role=dialog]").last();
  await until(() => p.evaluate(() => !!document.activeElement?.closest("[role=dialog] [role=gridcell]")));
  await idle(p);
  ok(
    "picker: focus opens on a day in the grid",
    await p.evaluate(() => !!document.activeElement?.closest("[role=dialog] [role=gridcell]")),
    null,
  );
  await pickOpt(p, dlg, "Year", "2027");
  await until(async () => (await dlg.getByRole("grid").getAttribute("aria-label")) === "November 2027");
  ok(
    "picker: the year dropdown works inside the popover and keeps it open",
    (await p.locator("[role=dialog]").count()) === 1 &&
      (await dlg.getByRole("grid").getAttribute("aria-label")) === "November 2027",
    null,
  );
  await dlg.locator("button.kl-day").first().focus();
  await p.keyboard.press("Escape");
  await until(
    async () =>
      (await p.locator("[role=dialog]").count()) === 0 && (await trig.evaluate((x) => x === document.activeElement)),
  );
  ok(
    "picker: Escape in the grid closes the popover and focus returns to the trigger",
    (await p.locator("[role=dialog]").count()) === 0 && (await trig.evaluate((x) => x === document.activeElement)),
    null,
  );
  ok("no page errors (picker)", p.errs.length === 0, p.errs);
});
