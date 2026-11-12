// DateTimePicker unavailable time slots (from r22): unavailable days, slot radio group, booked slots, held day, the
// 12-hour slot names, and a typed booked time without slots.
import { test, idle } from "./fixtures.mjs";
import { poll } from "./lib/probes-c.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["toolbar-group-overflow", "time-slots"] });

const READY = "[data-testid=specimen-groups]";
const focused = (p) =>
  p.evaluate(() => document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.trim());
const dialogOpen = async (p) => {
  await p.locator("[role=dialog]").last().waitFor({ state: "visible" });
  await idle(p);
};
const dialogClosed = (p) =>
  poll(
    () => p.locator("[role=dialog]").count(),
    (n) => n === 0,
    3000,
  );

test("slots: unavailable days, the slot group, choosing, held day, reopen, form value", async ({ open, ok }) => {
  const p = await open({ height: 1000, ready: READY });
  const ts = p.getByTestId("ts-pick");
  const log = () => p.getByTestId("ts-log").innerText();
  const dlg = p.locator("[role=dialog]").last();
  const dayBtn = (n) => dlg.locator(`button.kl-day[aria-label*=", ${n} November 2026"]`);
  const slot = (t) => dlg.locator(".kl-dtp-slots [role=radio]").filter({ hasText: new RegExp(`^${t}$`) });
  const status = () => dlg.locator(".kl-dtp-slot-status").innerText();
  await ts.scrollIntoViewIfNeeded();
  await ts.getByRole("button").first().click();
  await dialogOpen(p);
  ok(
    "slots: a day with every slot booked is unavailable, named 'fully booked'",
    /unavailable \(fully booked\)/.test(await dayBtn(12).getAttribute("aria-label")) && (await dayBtn(12).isDisabled()),
    await dayBtn(12).getAttribute("aria-label"),
  );
  ok(
    "slots: a day with no slots is unavailable, named 'no times'",
    /unavailable \(no times\)/.test(await dayBtn(15).getAttribute("aria-label")),
    await dayBtn(15).getAttribute("aria-label"),
  );
  ok(
    "slots: before a day, no slots; the area and the row ask for a day",
    (await dlg.locator(".kl-dtp-slots [role=radio]").count()) === 0 &&
      /Choose a day to see its times/.test(await dlg.locator(".kl-dtp-slots").innerText()) &&
      /Choose a day/.test(await status()),
    await status(),
  );
  const h0 = await dlg.evaluate((e) => e.getBoundingClientRect().height);
  await dayBtn(10).click();
  const group = dlg.getByRole("radiogroup", { name: "Time, Tue, 10 Nov 2026" });
  await poll(
    () => group.getByRole("radio").count(),
    (n) => n === 16,
    2000,
  );
  await idle(p);
  const h1 = await dlg.evaluate((e) => e.getBoundingClientRect().height);
  ok("slots: choosing a day does not resize the popup (the slot area is a fixed four rows)", Math.abs(h1 - h0) < 0.5, [
    h0,
    h1,
  ]);
  ok(
    "slots: choosing a day shows its times as one radio group named with the day",
    (await group.count()) === 1 && (await group.getByRole("radio").count()) === 16,
    await dlg.locator(".kl-dtp-slots").getAttribute("aria-label"),
  );
  ok(
    "slots: a booked slot is disabled and named with its reason",
    (await slot("09:00").getAttribute("aria-disabled")) === "true" &&
      (await slot("09:00").getAttribute("aria-label")) === "09:00, unavailable (booked)" &&
      (await slot("12:00").getAttribute("aria-label")) === "12:00, unavailable (lunch)",
    await slot("09:00").getAttribute("aria-label"),
  );
  ok(
    "slots: a booked slot is hatched and struck like an unavailable day",
    await slot("09:00").evaluate(
      (e) =>
        getComputedStyle(e).backgroundImage !== "none" &&
        getComputedStyle(e.firstElementChild).textDecorationLine === "line-through",
    ),
    null,
  );
  ok(
    "slots: the day alone sets no value; the row asks for a time",
    (await log()) === "Value: —" && /Choose a time/.test(await status()),
    [await log(), await status()],
  );
  await slot("08:30").click();
  const l1 = await poll(log, (t) => t === "Value: 2026-11-10 08:30", 2000);
  ok(
    "slots: a slot sets the value; the popup stays open",
    l1 === "Value: 2026-11-10 08:30" && (await dlg.isVisible()),
    l1,
  );
  const st1 = await poll(status, (t) => /08:30\s*CET/.test(t), 2000);
  ok(
    "slots: the chosen slot is checked and floods INK; the row prints it with the zone",
    (await slot("08:30").getAttribute("aria-checked")) === "true" &&
      (await slot("08:30").evaluate((e) => getComputedStyle(e, "::before").content !== "none")) &&
      /08:30\s*CET/.test(st1),
    st1,
  );
  await slot("08:30").focus();
  await p.keyboard.press("ArrowRight");
  const kb = await poll(
    async () => [await focused(p), await log()],
    (x) => x[0] === "11:30" && x[1] === "Value: 2026-11-10 11:30",
    2000,
  );
  ok(
    "slots: arrows skip booked slots (08:30 → 11:30) and choose",
    kb[0] === "11:30" && kb[1] === "Value: 2026-11-10 11:30",
    kb,
  );
  await dayBtn(11).click();
  const l2 = await poll(log, (t) => t === "Value: 2026-11-11 11:30", 2000);
  ok("slots: another day where the time is free takes it at once", l2 === "Value: 2026-11-11 11:30", l2);
  await slot("08:30").click();
  await poll(log, (t) => t === "Value: 2026-11-11 08:30", 2000);
  await dayBtn(9).click();
  const held = async () => [
    await log(),
    await status(),
    await dayBtn(9).getAttribute("data-kl-on"),
    await slot("08:30").getAttribute("aria-checked"),
  ];
  const h = await poll(
    held,
    (x) => x[0] === "Value: 2026-11-11 08:30" && /Choose a time/.test(x[1]) && x[2] === "" && x[3] === "false",
    2000,
  );
  ok(
    "slots: a day where the time is booked is held; the value waits for a slot",
    h[0] === "Value: 2026-11-11 08:30" && /Choose a time/.test(h[1]) && h[2] === "" && h[3] === "false",
    [h[0], h[1]],
  );
  await p.keyboard.press("Escape");
  await dialogClosed(p);
  const trig = await poll(
    () => ts.getByRole("button").first().innerText(),
    (t) => /11 Nov 2026, 08:30/.test(t),
    2000,
  );
  ok("slots: closing drops the held day; the trigger shows the value", /11 Nov 2026, 08:30/.test(trig), trig);
  await ts.getByRole("button").first().click();
  await dialogOpen(p);
  const re = [
    await dayBtn(11).getAttribute("data-kl-on"),
    await slot("08:30").getAttribute("aria-checked"),
    await p.locator("[role=dialog]").count(),
  ];
  ok("slots: reopened on the value's day and slot", re[0] === "" && re[1] === "true", re);
  await p.keyboard.press("Escape");
  await dialogClosed(p);
  ok(
    "slots: the form value is local 'YYYY-MM-DDTHH:MM'",
    (await ts.locator("input[name=slot]").inputValue()) === "2026-11-11T08:30",
    await ts.locator("input[name=slot]").inputValue(),
  );
  ok("no page errors", p.errs.length === 0, p.errs);
});

test("slots 12-hour: slot names in the locale's 12-hour form", async ({ open, ok }) => {
  const p = await open({ height: 1000, ready: READY });
  const dlg = p.locator("[role=dialog]").last();
  const t12 = p.getByTestId("ts-12");
  await t12.scrollIntoViewIfNeeded();
  await t12.getByRole("button").first().click();
  await dialogOpen(p);
  await dlg.locator('button.kl-day[aria-label*="November 10, 2026"]').click();
  const names12 = await poll(
    () =>
      dlg
        .locator(".kl-dtp-slots [role=radio]")
        .evaluateAll((r) => r.slice(0, 3).map((x) => x.getAttribute("aria-label"))),
    (n) => n.length === 3,
    2000,
  );
  ok(
    "slots 12-hour: slots print in the locale's 12-hour form",
    /^08:00\sAM$/.test(names12[0]) && /^09:00\sAM, unavailable \(booked\)$/.test(names12[2]),
    names12,
  );
  await p.keyboard.press("Escape");
  ok("no page errors", p.errs.length === 0, p.errs);
});

test("slots: without slots, a typed booked time is invalid", async ({ open, ok }) => {
  const p = await open({ height: 1000, ready: READY });
  const dlg = p.locator("[role=dialog]").last();
  const typed = p.getByTestId("ts-typed");
  await typed.scrollIntoViewIfNeeded();
  await typed.getByRole("button").first().click();
  await dialogOpen(p);
  const minutes = dlg.getByRole("spinbutton", { name: /minute/i });
  await minutes.focus();
  await p.keyboard.type("30");
  await poll(
    () => minutes.inputValue(),
    (v) => v === "30",
    2000,
  );
  await p.keyboard.press("Escape");
  await dialogClosed(p);
  const terr = await poll(
    () => typed.innerText(),
    (t) => /09:30 is booked\. Choose another time\./.test(t),
    2000,
  );
  ok(
    "without slots: a typed booked time is invalid with the reason",
    /09:30 is booked\. Choose another time\./.test(terr) &&
      (await typed.locator("[data-slot=date-time-picker]").getAttribute("data-invalid")) !== null,
    terr,
  );
  ok(
    "slots: the trigger is aria-invalid while the field's message shows",
    (await typed.locator(".kl-dr-trigger").getAttribute("aria-invalid")) === "true" &&
      (await p.getByTestId("ts-pick").locator(".kl-dr-trigger").getAttribute("aria-invalid")) === null,
  );
  ok("no page errors", p.errs.length === 0, p.errs);
});
