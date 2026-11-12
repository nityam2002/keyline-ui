// Time bounds: TimeField min/max (arrows wrap inside the range, End stays inside, typed times outside are stored
// but invalid with the range message in 24- and 12-hour, the period spin stays inside, min only), a disabled
// bounded field; DateTimePicker minTime/maxTime (default time clamped, the form refuses an out-of-range slot and
// submits an inside one).
import { test, idle } from "./fixtures.mjs";
import { until } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["time-bounds"] });

const OPEN = { height: 1000, ready: "[data-testid=specimen-bounds]" };
/* the values of a time field's parts, in DOM order: [name, value] */
const partsOf = (g) =>
  g.locator("input[role=spinbutton]").evaluateAll((xs) => xs.map((x) => [x.getAttribute("aria-label"), x.value]));

test("time bounds: arrows wrap inside, typed outside is invalid, 12-hour, min only, disabled", async ({ open, ok }) => {
  const p = await open(OPEN);
  const sec = p.getByTestId("specimen-bounds");
  const g = sec.getByRole("group", { name: /Gate open \(06:00–22:00\)/ });
  const g12 = sec.getByRole("group", { name: "Gate open (12-hour)" });
  const log = sec.getByTestId("bounds-log");
  const logHas = (re) => until(async () => re.test(await log.textContent()));
  const hrs = g.getByRole("spinbutton", { name: "Hours" });
  const mins = g.getByRole("spinbutton", { name: "Minutes" });
  await hrs.click();
  await p.keyboard.press("ArrowUp");
  await logHas(/06:00/);
  ok(
    "arrows: 21:30 → 22:30 would pass 22:00, so it wraps to 06:00",
    /06:00/.test(await log.textContent()),
    await log.textContent(),
  );
  await p.keyboard.press("ArrowDown");
  await logHas(/22:00/);
  ok("arrows: down from 06:00 wraps to 22:00", /22:00/.test(await log.textContent()), await log.textContent());
  await mins.click();
  await p.keyboard.press("ArrowUp");
  await logHas(/06:00/);
  ok("arrows: a minute step past 22:00 wraps to 06:00", /06:00/.test(await log.textContent()), await log.textContent());
  await p.keyboard.press("End");
  await logHas(/06:45/);
  ok("End on minutes (06:45) stays inside", /06:45/.test(await log.textContent()), await log.textContent());
  // typing outside is allowed and flagged
  await hrs.click();
  await p.keyboard.type("0500");
  const field = sec.locator(".kl-time").first();
  await until(async () => /05:00/.test(await log.textContent()) && (await field.getAttribute("data-invalid")) !== null);
  ok("typed 05:00 is stored (typing is not blocked)", /05:00/.test(await log.textContent()), await log.textContent());
  ok(
    "typed 05:00 is invalid with the range message and the ! cell",
    (await field.getAttribute("data-invalid")) !== null &&
      /Choose a time from 06:00 to 22:00\./.test(await field.textContent()),
    await field.textContent(),
  );
  ok(
    "the 12-hour field gives the message in its clock",
    /Choose a time from 06:00\sAM to 10:00\sPM\./.test(await g12.locator("xpath=..").textContent()),
    await g12.locator("xpath=..").textContent(),
  );
  await hrs.click();
  await p.keyboard.type("0800");
  await until(async () => (await field.getAttribute("data-invalid")) === null);
  ok(
    "back inside (08:00): the error clears",
    (await field.getAttribute("data-invalid")) === null,
    await field.textContent(),
  );
  // 12-hour period spin stays inside: 08:00 AM → PM is 20:00 (inside); then 10 PM + period → 10 AM inside
  await g12.getByRole("spinbutton", { name: "AM/PM" }).click();
  await p.keyboard.press("ArrowUp");
  await logHas(/20:00/);
  ok(
    "12-hour: the period flips 08:00 → 20:00 (inside)",
    /20:00/.test(await log.textContent()),
    await log.textContent(),
  );
  const early = sec.getByRole("group", { name: "Earliest only" });
  const earlyF = sec.locator(".kl-time").nth(2);
  await early.getByRole("spinbutton", { name: "Hours" }).click();
  await p.keyboard.press("ArrowUp");
  const ev = async () => (await partsOf(early)).map((x) => x[1]).join(":");
  await until(async () => (await ev()) !== "07:00");
  ok("min only: ArrowUp from 07:00 lands on min 08:30, not 08:00", (await ev()) === "08:30", await ev());
  await early.getByRole("spinbutton", { name: "Hours" }).click();
  await p.keyboard.type("0700");
  await until(
    async () =>
      (await earlyF.getAttribute("data-invalid")) !== null &&
      /Choose 08:30 or later\./.test(await earlyF.textContent()),
  );
  ok(
    "min only: typed 07:00 is invalid with 'Choose 08:30 or later.'",
    (await earlyF.getAttribute("data-invalid")) !== null && /Choose 08:30 or later\./.test(await earlyF.textContent()),
    await earlyF.textContent(),
  );
  const dis = sec.getByRole("group", { name: "Disabled, bounded" }).getByRole("spinbutton", { name: "Hours" });
  ok("disabled: the parts are disabled", await dis.isDisabled(), null);
  ok("no page errors (bounds)", p.errs.length === 0, p.errs);
});

test("time bounds: DateTimePicker clamps the default time; the form refuses 23:30 and submits 14:15", async ({
  open,
  ok,
}) => {
  const p = await open(OPEN);
  const sec = p.getByTestId("specimen-bounds");
  // DateTimePicker: default time clamps to minTime, form submits; an out-of-range typed time blocks submit
  const form = sec.getByTestId("bounds-form");
  const submitted = () => sec.getByTestId("bounds-submitted").textContent();
  const openPicker = async () => {
    await form.getByRole("button", { name: /Dock slot/ }).click();
    const dlg = p.locator("[role=dialog]").last();
    await dlg.waitFor();
    await idle(p);
    return dlg;
  };
  const closed = () => until(async () => (await p.locator("[role=dialog]").count()) === 0);
  let dlg = await openPicker();
  await dlg.getByRole("gridcell", { name: /, 12 November 2026/ }).click();
  const parts = () => dlg.locator("input[role=spinbutton]").evaluateAll((xs) => xs.map((x) => x.value));
  await until(async () => (await parts()).join(":") === "06:00");
  ok(
    "picker: a day takes defaultTime 05:00 clamped to minTime 06:00",
    (await parts()).join(":") === "06:00",
    await parts(),
  );
  await dlg.getByRole("spinbutton", { name: "Hours" }).click();
  await p.keyboard.type("2330");
  await until(async () => (await parts()).join(":") === "23:30");
  await dlg.getByRole("button", { name: "Done" }).click();
  await closed();
  await form.getByRole("button", { name: "Book" }).click();
  await until(async () => /Choose a time from 06:00 to 22:00\./.test(await form.textContent()));
  ok(
    "form: 23:30 is refused with the range message",
    /Choose a time from 06:00 to 22:00\./.test(await form.textContent()) && /Submitted: —/.test(await submitted()),
    await form.textContent(),
  );
  dlg = await openPicker();
  await dlg.getByRole("spinbutton", { name: "Hours" }).click();
  await p.keyboard.type("1415");
  await dlg.getByRole("button", { name: "Done" }).click();
  await closed();
  await form.getByRole("button", { name: "Book" }).click();
  await until(async () => /"slot":"2026-11-12T14:15"/.test(await submitted()));
  ok("form: 14:15 submits as 2026-11-12T14:15", /"slot":"2026-11-12T14:15"/.test(await submitted()), await submitted());
  ok("no page errors (bounds)", p.errs.length === 0, p.errs);
});
