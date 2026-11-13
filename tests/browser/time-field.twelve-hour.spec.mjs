// TimeField's 12-hour cycle (from r15): the period part, typing, arrows, conversion to the stored 24-hour value,
// locale order, fixed width, disabled and invalid.
import { test } from "./fixtures.mjs";
import { poll } from "./lib/probes-c.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["date-time", "time-cycle"] });

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
/* the values of a time field's parts, in DOM order: [name, value] */
const partsOf = (g) =>
  g.locator("input[role=spinbutton]").evaluateAll((xs) => xs.map((x) => [x.getAttribute("aria-label"), x.value]));

test("12-hour: period part, typing, arrows, stored 24-hour value", async ({ open, ok }) => {
  const p = await open({ height: 1000, ready: READY });
  const sec = p.getByTestId("specimen-time");
  await sec.scrollIntoViewIfNeeded();
  const g24 = sec.getByRole("group", { name: "Pickup (24-hour)" });
  const g12 = sec.getByRole("group", { name: "Pickup (12-hour, en-US)" });
  const log = sec.getByTestId("tc-log");
  const logIs = (re) =>
    poll(
      () => log.textContent(),
      (t) => re.test(t),
      2000,
    );
  ok(
    "12-hour: 14:30 shows as 02 : 30 PM",
    JSON.stringify(await partsOf(g12)) ===
      JSON.stringify([
        ["Hours", "02"],
        ["Minutes", "30"],
        ["AM/PM", "PM"],
      ]),
    await partsOf(g12),
  );
  const pm = await g12
    .getByRole("spinbutton", { name: "AM/PM" })
    .evaluate((x) => [
      x.getAttribute("aria-valuetext"),
      x.getAttribute("aria-valuenow"),
      x.getAttribute("aria-valuemax"),
    ]);
  ok(
    "12-hour: the period is a spin button announced by its name (valuetext PM, 1 of 0–1)",
    pm[0] === "PM" && pm[1] === "1" && pm[2] === "1",
    pm,
  );
  const hrs = await g12
    .getByRole("spinbutton", { name: "Hours" })
    .evaluate((x) => [x.getAttribute("aria-valuemin"), x.getAttribute("aria-valuemax")]);
  ok("12-hour: hours run 1–12", hrs[0] === "1" && hrs[1] === "12", hrs);

  // typing on the 24-hour clock reaches the 12-hour one (one shared value)
  await g24.getByRole("spinbutton", { name: "Hours" }).click();
  await p.keyboard.type("0915");
  const l1 = await logIs(/09:15/);
  ok("24-hour typing 0915 stores 09:15", /09:15/.test(l1), l1);
  const v12 = await poll(
    async () => JSON.stringify((await partsOf(g12)).map((x) => x[1])),
    (s) => s === '["09","15","AM"]',
    2000,
  );
  ok("…and the 12-hour field shows 09 : 15 AM", v12 === '["09","15","AM"]', await partsOf(g12));

  // typing on the 12-hour clock: "7" advances, "45" advances to the period, "p" sets PM
  await g12.getByRole("spinbutton", { name: "Hours" }).click();
  await p.keyboard.type("7");
  ok("12-hour: a lone 7 is unambiguous and advances to minutes", (await active(p)).name === "Minutes", await active(p));
  await p.keyboard.type("45");
  ok("12-hour: two minute digits advance to the period", (await active(p)).name === "AM/PM", await active(p));
  await p.keyboard.type("p");
  const l2 = await logIs(/19:45/);
  ok("12-hour: typing p sets PM and stores 19:45", /19:45/.test(l2), l2);
  await p.keyboard.press("ArrowUp");
  const l3 = await logIs(/07:45/);
  ok("12-hour: an arrow on the period switches it (07:45)", /07:45/.test(l3), l3);
  const w1 = await g12.evaluate((x) => x.getBoundingClientRect().width);
  await p.keyboard.press("ArrowDown");
  await logIs(/19:45/);
  const w2 = await g12.evaluate((x) => x.getBoundingClientRect().width);
  ok("12-hour: the frame keeps its width from AM to PM", Math.abs(w1 - w2) < 0.5, { w1, w2 });
  await p.keyboard.press("ArrowUp"); // back to AM
  await logIs(/07:45/);
  await g12.getByRole("spinbutton", { name: "Hours" }).focus();
  await p.keyboard.press("End");
  const l4 = await logIs(/00:45/);
  ok("12-hour: End on hours is 12, and 12 AM stores 00:45", /00:45/.test(l4), l4);
  await p.keyboard.press("ArrowUp");
  const a1 = await poll(
    () => active(p),
    (a) => a.value === "01",
    2000,
  );
  ok("12-hour: hours wrap 12 → 01", a1.value === "01", a1);
  await p.keyboard.press("ArrowDown");
  const a2 = await poll(
    () => active(p),
    (a) => a.value === "12",
    2000,
  );
  ok("12-hour: and 01 → 12", a2.value === "12", a2);
  await g12.getByRole("spinbutton", { name: "AM/PM" }).focus();
  await p.keyboard.press("Backspace");
  const l5 = await logIs(/null/);
  ok("12-hour: Backspace clears the period, and the value is null until it is set", /null/.test(l5), l5);
  await p.keyboard.press("Backspace");
  ok(
    "12-hour: Backspace in the empty period returns to minutes",
    (await active(p)).name === "Minutes",
    await active(p),
  );
  ok("no page errors (time)", p.errs.length === 0, p.errs);
});

test("12-hour: lone 0, locale periods, ko order, disabled, invalid", async ({ open, ok }) => {
  const p = await open({ height: 1000, ready: READY });
  const sec = p.getByTestId("specimen-time");
  await sec.scrollIntoViewIfNeeded();
  // "0" alone is no hour on a 12-hour clock
  const empty = sec.getByRole("group", { name: "Empty, required, 12-hour" });
  await empty.getByRole("spinbutton", { name: "Hours" }).click();
  await p.keyboard.type("0");
  await p.keyboard.press("Tab");
  const parts = await poll(
    () => partsOf(empty),
    (x) => x[0][1] === "",
    2000,
  );
  ok("12-hour: a lone 0 is cleared on leaving (not padded to an invalid 00)", parts[0][1] === "", parts);
  ok(
    "12-hour en-GB: the period is named by the locale (am/pm)",
    (await empty.locator("[data-slot=time-field-period-sizer]").allTextContents()).join(",") === "am,pm",
    await empty.locator("[data-slot=time-field-period-sizer]").allTextContents(),
  );
  const ko = await partsOf(sec.getByRole("group", { name: "Gate (12-hour, ko)" }));
  ok(
    "ko: the period comes first in the tab order, named by the locale (오전 07 : 05)",
    ko[0][0] === "AM/PM" && ko[0][1] === "오전" && ko[1][1] === "07",
    ko,
  );
  const dis = await sec
    .getByRole("group", { name: "Driver check-in" })
    .locator("input")
    .evaluateAll((xs) => xs.every((x) => x.disabled));
  ok("12-hour disabled: every part, the period too, is disabled", dis, null);
  const late = await poll(
    () =>
      sec
        .getByRole("group", { name: "Late slot" })
        .evaluate((g) => g.querySelector(".kl-field-bang").getBoundingClientRect().width),
    (w) => w >= 28,
    2000,
  );
  ok("12-hour invalid: the ! cell is open", late >= 28, late);
  ok("no page errors (time)", p.errs.length === 0, p.errs);
});
