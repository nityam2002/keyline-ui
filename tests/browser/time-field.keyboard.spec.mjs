// TimeField keyboard and typing (spin buttons, wrapping, PageUp, digit auto-advance, padding on blur, Backspace
// back to hours), invalid/disabled parts, a controlled range with a cross-field rule in cells; and RTL order.
import { test } from "./fixtures.mjs";
import { near, until } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["participants", "time", "edges"] });

const READY = "#participants form";
const focused = (loc) => loc.evaluate((e) => e === document.activeElement);

test("time: spin buttons, wrapping, PageUp, typing and auto-advance", async ({ open, ok }) => {
  const p = await open({ ready: READY });
  const sec = p.locator("#time");
  await sec.scrollIntoViewIfNeeded();
  const t0 = sec.locator(".kl-time").first();
  const h = t0.getByRole("spinbutton", { name: "Hours" });
  const m = t0.getByRole("spinbutton", { name: "Minutes" });
  ok(
    "time: parts are spin buttons with value, min and max",
    (await h.getAttribute("aria-valuenow")) === "14" &&
      (await h.getAttribute("aria-valuemax")) === "23" &&
      (await m.getAttribute("aria-valuemax")) === "59",
    null,
  );
  ok("time: the group is named by the label", (await t0.getByRole("group", { name: "Pickup" }).count()) === 1, null);
  const w0 = (await t0.locator(".kl-time-frame").boundingBox()).width;
  await h.focus();
  await p.keyboard.press("ArrowUp");
  ok("time: ArrowUp steps the hour (14 → 15)", (await h.inputValue()) === "15", await h.inputValue());
  await p.keyboard.press("End");
  await p.keyboard.press("ArrowUp");
  ok("time: hours wrap (End = 23, ArrowUp → 00)", (await h.inputValue()) === "00", await h.inputValue());
  await p.keyboard.press("PageUp");
  ok("time: PageUp moves hours by 6", (await h.inputValue()) === "06", await h.inputValue());
  await p.keyboard.type("7");
  await until(() => focused(m));
  ok("time: a digit that cannot start a two-digit hour advances to minutes", await focused(m), null);
  await p.keyboard.type("5");
  await p.keyboard.press("Tab");
  await until(async () => (await h.inputValue()) === "07" && (await m.inputValue()) === "05");
  ok("time: blur pads both parts (07 : 05)", (await h.inputValue()) === "07" && (await m.inputValue()) === "05", [
    await h.inputValue(),
    await m.inputValue(),
  ]);
  ok(
    "time: the frame keeps its width while typing",
    near((await t0.locator(".kl-time-frame").boundingBox()).width, w0),
    [w0],
  );
  await h.focus();
  await p.keyboard.type("2");
  await p.waitForTimeout(30); // timing: kept, a negative check: after "2" the focus must not have moved on
  ok('time: "2" waits for a second digit (could be 20–23)', await focused(h), null);
  await p.keyboard.type("3");
  await until(() => focused(m));
  ok("time: a second digit advances to minutes", await focused(m), null);
  // regression: advancing blurs the hours inside the same change event; the blur must not pad the stale "2"
  ok(
    "time: the two-digit hour survives the advance (23, not 02)",
    (await h.inputValue()) === "23",
    await h.inputValue(),
  );
  ok("specimen: no page errors", p.errs.length === 0, p.errs);
});

test("time: 15-minute steps wrap; Backspace in empty minutes returns to hours", async ({ open, ok }) => {
  const p = await open({ ready: READY });
  const sec = p.locator("#time");
  await sec.scrollIntoViewIfNeeded();
  const cut = sec.locator(".kl-time").nth(1);
  const cm = cut.getByRole("spinbutton", { name: "Minutes" });
  await cm.focus();
  await p.keyboard.press("ArrowUp");
  ok("time: 15-minute steps wrap minutes (45 → 00)", (await cm.inputValue()) === "00", await cm.inputValue());
  await p.keyboard.press("ArrowUp");
  ok("time: …then 15", (await cm.inputValue()) === "15", await cm.inputValue());
  await p.keyboard.press("Backspace");
  await p.keyboard.press("Backspace");
  await p.keyboard.press("Backspace");
  ok(
    "time: Backspace in empty minutes returns to hours",
    await focused(cut.getByRole("spinbutton", { name: "Hours" })),
    null,
  );
  ok("specimen: no page errors", p.errs.length === 0, p.errs);
});

test("time: invalid and disabled parts; a controlled range with a cross-field rule in cells", async ({ open, ok }) => {
  const p = await open({ ready: READY });
  const sec = p.locator("#time");
  await sec.scrollIntoViewIfNeeded();
  const gate = sec.locator(".kl-time").nth(3);
  ok(
    "time: invalid shows the message and marks the parts aria-invalid",
    (await gate.getByText("The terminal closes at 22:00.").isVisible()) &&
      (await gate.getByRole("spinbutton", { name: "Hours" }).getAttribute("aria-invalid")) === "true",
    null,
  );
  const disabled = sec.locator(".kl-time").nth(4);
  ok("time: disabled parts are disabled", await disabled.getByRole("spinbutton", { name: "Hours" }).isDisabled(), null);

  const slot = sec.locator('.kl-cells:has(> [data-slot="date-picker"])');
  const from = slot.locator(".kl-time").nth(0);
  await from.getByRole("spinbutton", { name: "Hours" }).focus();
  await p.keyboard.type("17");
  await p.keyboard.press("Tab");
  const slotText = () => sec.getByTestId("specimen-slot").textContent();
  await until(
    async () =>
      (await slotText()).includes("17:00–16:00") &&
      ((await from.locator(".kl-field-bang").boundingBox())?.width ?? 0) > 20,
  );
  ok(
    "time: controlled value reports HH:MM (17:00–16:00)",
    (await slotText()).includes("17:00–16:00"),
    await slotText(),
  );
  ok(
    "time: the cross-field rule marks the From cell invalid with the ! cell",
    (await from.getAttribute("data-invalid")) !== null &&
      ((await from.locator(".kl-field-bang").boundingBox())?.width ?? 0) > 20,
    null,
  );
  const dp = slot.locator('[data-slot="date-picker"]');
  ok(
    "time: as cells, the time parts hug and the date takes the room",
    (await dp.boundingBox()).width > (await from.boundingBox()).width,
    [(await dp.boundingBox()).width, (await from.boundingBox()).width],
  );
  ok("specimen: no page errors", p.errs.length === 0, p.errs);
});

test("rtl: a clock time reads hours then minutes; the zone sits at the end", async ({ open, ok }) => {
  const q = await open({ q: "dir=rtl&motion=reduce", ready: READY });
  // bring the scroll-edge rows into view first, so the time field sits where the checks expect it
  await q.locator("#edges .kl-tabs-list").first().scrollIntoViewIfNeeded();
  const tf = q.locator("#time .kl-time").first();
  const [hx, mx, zx] = await Promise.all(
    [
      tf.getByRole("spinbutton", { name: "Hours" }),
      tf.getByRole("spinbutton", { name: "Minutes" }),
      tf.locator(".kl-time-zone"),
    ].map(async (l) => (await l.boundingBox()).x),
  );
  ok("rtl: the time reads hours then minutes left to right; the zone is at the end (left)", hx < mx && zx < hx, [
    hx,
    mx,
    zx,
  ]);
});
