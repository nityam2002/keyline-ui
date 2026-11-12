// DateTimePicker (from r15): open on the day, a day keeps the time, the time row, Done, Escape, presets, clear,
// time before day, disabled, the cell layout, Form required / validate / server error, portal scope and RTL keys.
import { test, idle } from "./fixtures.mjs";
import { poll } from "./lib/probes-c.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["date-time"] });

const READY = "[data-testid=specimen-dtp]";
const active = (p) =>
  p.evaluate(() => {
    const a = document.activeElement;
    return {
      role: a?.closest("[role=gridcell]") ? "gridcell" : a?.getAttribute("role"),
      name: (a?.getAttribute("aria-label") || a?.textContent || "").trim(),
      value: a?.value,
    };
  });
/* press Tab until the focus has this accessible name (or give up) */
async function tabTo(p, name, max = 12) {
  for (let i = 0; i < max; i++) {
    await p.keyboard.press("Tab");
    if ((await active(p)).name === name) return true;
  }
  return false;
}
/* the popup is open, its grid has focus and its motion has finished */
async function opened(p) {
  await p.locator("[role=dialog]").last().waitFor({ state: "visible" });
  await poll(
    () => active(p),
    (a) => a.role === "gridcell",
    3000,
  );
  await idle(p);
}
const closed = (p) =>
  poll(
    () => p.locator("[role=dialog]").count(),
    (n) => n === 0,
    3000,
  );

test("date-time picker: open, day keeps the time, time row, Done, Escape, presets, Delete", async ({ open, ok }) => {
  const p = await open({ height: 1000, ready: READY });
  const sec = p.getByTestId("specimen-dtp");
  await sec.scrollIntoViewIfNeeded();
  const log = sec.getByTestId("dtp-log");
  const logIs = (re) =>
    poll(
      () => log.textContent(),
      (t) => re.test(t),
      2000,
    );
  const trig = sec.getByRole("button", { name: /^Collection( |$)/ });
  const dialog = () => p.locator("[role=dialog]").last();
  await trig.click();
  await opened(p);
  ok(
    "opens on the chosen day in the grid",
    (await active(p)).role === "gridcell" && /, 7 November 2026/.test((await active(p)).name),
    await active(p),
  );
  await dialog()
    .getByRole("gridcell", { name: /, 10 November 2026/ })
    .click();
  const l1 = await logIs(/2026-11-10 14:30/);
  ok("choosing a day keeps the time (2026-11-10 14:30)", /2026-11-10 14:30/.test(l1), l1);
  ok("…and keeps the popup open for the time", await dialog().isVisible(), null);
  ok("Tab reaches the time row's hours", await tabTo(p, "Hours"), await active(p));
  await p.keyboard.type("16");
  const l2 = await logIs(/2026-11-10 16:30/);
  ok("typing 16 changes the time as it is typed (16:30)", /2026-11-10 16:30/.test(l2), l2);
  ok("Tab goes minutes → Done", (await tabTo(p, "Done", 2)) === true, await active(p));
  await p.keyboard.press("Enter");
  await closed(p);
  await poll(() => trig.evaluate((x) => x === document.activeElement), Boolean, 2000);
  ok(
    "Done closes, and focus returns to the trigger",
    (await p.locator("[role=dialog]").count()) === 0 &&
      (await active(p)).name.includes("Sat") === false &&
      (await trig.evaluate((x) => x === document.activeElement)),
    await active(p),
  );
  ok(
    "the trigger prints date and time",
    /Tue, 10 Nov 2026, 16:30/.test(await trig.textContent()),
    await trig.textContent(),
  );
  await trig.click();
  await opened(p);
  await p.keyboard.press("Escape");
  await closed(p);
  await poll(() => trig.evaluate((x) => x === document.activeElement), Boolean, 2000);
  ok(
    "Escape closes, focus on the trigger",
    (await p.locator("[role=dialog]").count()) === 0 && (await trig.evaluate((x) => x === document.activeElement)),
    await active(p),
  );
  await trig.click();
  await opened(p);
  await dialog().getByRole("button", { name: "Tomorrow 08:00" }).click();
  const l3 = await logIs(/2026-11-08 08:00/);
  ok("a preset with its own time sets both (2026-11-08 08:00)", /2026-11-08 08:00/.test(l3), l3);
  await dialog().getByRole("button", { name: "Today", exact: true }).click();
  const l4 = await logIs(/2026-11-07 08:00/);
  ok("a preset at midnight keeps the chosen time (2026-11-07 08:00)", /2026-11-07 08:00/.test(l4), l4);
  await p.keyboard.press("Escape");
  await closed(p);
  await trig.focus();
  await p.keyboard.press("Delete");
  const l5 = await logIs(/Collection: null/);
  ok(
    "Delete on the closed trigger clears the value",
    /Collection: null/.test(l5) && /Choose a date and time/.test(await trig.textContent()),
    l5,
  );
  ok("no page errors (date-time)", p.errs.length === 0, p.errs);
});

test("date-time picker: time before day, 12-hour trigger, disabled, cell layout", async ({ open, ok }) => {
  const p = await open({ height: 1000, ready: READY });
  const sec = p.getByTestId("specimen-dtp");
  await sec.scrollIntoViewIfNeeded();
  const dialog = () => p.locator("[role=dialog]").last();
  // a time typed before any day is held for the day chosen next
  const empty = sec.getByRole("button", { name: /^Empty( |$)/ });
  await empty.click();
  await dialog().waitFor({ state: "visible" });
  await idle(p);
  await tabTo(p, "Hours");
  await p.keyboard.type("1105");
  await dialog()
    .getByRole("gridcell", { name: /, 12 November 2026/ })
    .click();
  await p.keyboard.press("Escape");
  await closed(p);
  const et = await poll(
    () => empty.textContent(),
    (t) => /12 Nov 2026, 11:05/.test(t),
    2000,
  );
  ok("time first, then day: the held time is used (Thu 12 Nov, 11:05)", /12 Nov 2026, 11:05/.test(et), et);
  ok(
    "12-hour picker prints AM/PM in the trigger",
    /09:00 AM/.test(await sec.getByRole("button", { name: /Delivery window/ }).textContent()),
    await sec.getByRole("button", { name: /Delivery window/ }).textContent(),
  );
  ok(
    "disabled: the trigger is disabled",
    await sec.getByRole("button", { name: /Customs inspection/ }).isDisabled(),
    null,
  );
  // the cell row: invalid cell shows its ! even when the value is cut short
  const cellOf = () =>
    sec.getByTestId("dtp-cell-row").evaluate((r) =>
      [...r.children].map((c) => ({
        inv: c.hasAttribute("data-invalid"),
        bang: c.querySelector(".kl-field-bang").getBoundingClientRect().width,
        ell: getComputedStyle(c.querySelector(".kl-dtp-text")).textOverflow,
      })),
    );
  const cell = await poll(cellOf, (c) => c[1].inv && c[1].bang >= 28 && !c[0].inv && c[0].bang === 0, 2000);
  ok(
    "cell layout: the invalid cell keeps a 30px ! cell beside a long value",
    cell[1].inv && cell[1].bang >= 28 && !cell[0].inv && cell[0].bang === 0,
    cell,
  );
  ok(
    "cell layout: a long value ends in an ellipsis",
    cell.every((c) => c.ell === "ellipsis"),
    cell,
  );
  ok("no page errors (date-time)", p.errs.length === 0, p.errs);
});

test("date-time picker in a Form: required, default time, validate, server error", async ({ open, ok }) => {
  const p = await open({ height: 1000, ready: READY });
  const sec = p.getByTestId("specimen-dtp");
  const dialog = () => p.locator("[role=dialog]").last();
  // Form: required, validate, server error
  const form = sec.getByTestId("dtp-form");
  await form.scrollIntoViewIfNeeded();
  const formHas = (re) =>
    poll(
      () => form.textContent(),
      (t) => re.test(t),
      2000,
    );
  const slot = form.getByRole("button", { name: /^Slot( |$)/ });
  await form.getByRole("button", { name: "Book slot" }).click();
  ok(
    "Form: an empty required slot fails with its message",
    /Choose a date and time\./.test(await formHas(/Choose a date and time\./)),
    null,
  );
  const bang = await poll(
    () =>
      form
        .locator(".kl-dtp")
        .first()
        .evaluate((f) => [
          f.hasAttribute("data-invalid"),
          f.querySelector(".kl-field-bang").getBoundingClientRect().width,
        ]),
    (b) => b[0] && b[1] >= 28,
    2000,
  );
  ok("Form: the slot's ! cell opens", bang[0] && bang[1] >= 28, bang);
  ok("Form: nothing was submitted", /Submitted: —/.test(await sec.getByTestId("dtp-submitted").textContent()), null);
  await slot.click();
  await opened(p);
  await dialog()
    .getByRole("gridcell", { name: /, 9 November 2026/ })
    .click();
  await p.keyboard.press("Escape");
  await closed(p);
  await form.getByRole("button", { name: "Book slot" }).click();
  const sub = await poll(
    () => sec.getByTestId("dtp-submitted").textContent(),
    (t) => /"slot":"2026-11-09T09:00"/.test(t),
    2000,
  );
  ok(
    "Form: a day gets the default time, and the slot submits as local YYYY-MM-DDTHH:MM",
    /"slot":"2026-11-09T09:00"/.test(sub),
    sub,
  );
  await slot.click();
  await opened(p);
  await tabTo(p, "Hours");
  await p.keyboard.type("05");
  await p.keyboard.press("Escape");
  await closed(p);
  await form.getByRole("button", { name: "Book slot" }).click();
  ok(
    "Form: validate sees the value (05:00 → The dock opens at 06:00.)",
    /The dock opens at 06:00\./.test(await formHas(/The dock opens at 06:00\./)),
    null,
  );
  await form.getByRole("button", { name: "Simulate server error" }).click();
  ok(
    "Form: a server error by name shows under the slot",
    /Dock 4 was just booked for that time\./.test(await formHas(/Dock 4 was just booked for that time\./)),
    null,
  );
  ok("no page errors (date-time)", p.errs.length === 0, p.errs);
});

test("date-time picker: portal carries compact density and RTL; RTL keys", async ({ open, ok }) => {
  // portal scope and RTL keys
  const p = await open({ height: 1000, q: "density=compact&dir=rtl", ready: READY });
  const trig = p.getByTestId("specimen-dtp").getByRole("button", { name: /^Collection( |$)/ });
  await trig.scrollIntoViewIfNeeded();
  await trig.click();
  await opened(p);
  const day = await p
    .locator("[role=dialog]")
    .last()
    .evaluate((d) => [
      getComputedStyle(d).getPropertyValue("--kl-day").trim(),
      d.querySelector(".kl-dtp-time-label") ? getComputedStyle(d.querySelector(".kl-dtp-time-label")).display : null,
      getComputedStyle(d).direction,
    ]);
  ok(
    "portal: the popup carries compact density (34px days; the label cell gives way) and RTL",
    day[0] === "34px" && day[1] === "none" && day[2] === "rtl",
    day,
  );
  await p.keyboard.press("ArrowLeft");
  const a = await poll(
    () => active(p),
    (x) => /, 8 November 2026/.test(x.name),
    2000,
  );
  ok("RTL: ArrowLeft moves to the next day", /, 8 November 2026/.test(a.name), a);
  const fit = await p
    .locator("[role=dialog]")
    .last()
    .evaluate((d) => {
      const r = d.querySelector(".kl-dtp-time");
      return r.scrollWidth <= r.clientWidth + 1;
    });
  ok("compact: the time row fits the 7-day panel", fit, null);
  ok("no page errors (date-time compact RTL)", p.errs.length === 0, p.errs);
});
