// Slider on the specimen page: keyboard steps, Home/End, a press on the rail, the range form, disabled and cell
// layouts; and the reduced-motion transitions.
import { test, idle, stable } from "./fixtures.mjs";
import { near, box, until } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["slider"] });

const READY = "#slider .kl-slider";

test("slider: keyboard, rail press, range, disabled and cell layouts", async ({ open, ok }) => {
  const p = await open({ ready: READY });
  const s = p.locator("#slider .kl-slider");
  const axle = s.nth(0);
  await axle.scrollIntoViewIfNeeded();
  const input = axle.locator("input[type=range]");
  const readout = () => axle.locator(".kl-slider-value").innerText();
  await input.focus();
  await p.keyboard.press("ArrowRight");
  await until(async () => (await readout()).replace(/\s+/g, "") === "12.5t");
  ok(
    "slider: ArrowRight steps by `step` (12.0 → 12.5) and the readout follows",
    (await readout()).replace(/\s+/g, "") === "12.5t",
    await readout(),
  );
  ok(
    "slider: the thumb input carries aria-valuenow and a unit in its value text",
    (await input.getAttribute("aria-valuenow")) === "12.5" &&
      /12\.5 t/.test((await input.getAttribute("aria-valuetext")) || ""),
    [await input.getAttribute("aria-valuenow"), await input.getAttribute("aria-valuetext")],
  );
  const ring = await axle.locator(".kl-slider-thumb").evaluate((el) => ({
    w: getComputedStyle(el).outlineWidth,
    s: getComputedStyle(el).outlineStyle,
    o: getComputedStyle(el).outlineOffset,
  }));
  ok(
    "slider: keyboard focus rings the thumb (2px, outside)",
    ring.s === "solid" && ring.w === "2px" && ring.o === "2px",
    ring,
  );
  await p.keyboard.press("End");
  await until(async () => (await input.getAttribute("aria-valuenow")) === "40");
  await idle(p);
  const wMax = (await box(axle.locator(".kl-slider-value"))).width;
  await p.keyboard.press("Home");
  await until(async () => (await input.getAttribute("aria-valuenow")) === "0");
  await idle(p);
  const wMin = (await box(axle.locator(".kl-slider-value"))).width;
  ok(
    "slider: Home/End reach min and max; the readout cell keeps its width",
    (await input.getAttribute("aria-valuenow")) === "0" && near(wMax, wMin, 0.5),
    { wMax, wMin },
  );
  ok(
    "slider: the form value is a hidden input named by `name`",
    (await axle.locator("input[name=axle]").count()) === 1 || (await input.getAttribute("name")) === "axle",
    null,
  );
  // pointer: a press at 75% of the rail sets ~75% of the range
  const rail = await box(axle.locator(".kl-slider-rail"));
  await p.mouse.click(rail.x + rail.width * 0.75, rail.y + rail.height / 2);
  await until(async () => (await input.getAttribute("aria-valuenow")) !== "0");
  await idle(p);
  const v = Number(await input.getAttribute("aria-valuenow"));
  ok("slider: a press on the rail at 75% sets 30 t (±0.5)", Math.abs(v - 30) <= 0.5, v);
  const th = await box(axle.locator(".kl-slider-thumb"));
  ok("slider: the thumb's centre is at the pressed point", near(th.x + th.width / 2, rail.x + rail.width * 0.75, 2), {
    th,
    rail,
  });
  // the thumb stays inside the frame at both ends
  const frame = await box(axle.locator(".kl-slider-frame"));
  await input.focus();
  await p.keyboard.press("End");
  await until(async () => (await input.getAttribute("aria-valuenow")) === "40");
  await idle(p);
  const thEnd = await box(axle.locator(".kl-slider-thumb"));
  const ctl = await box(axle.locator(".kl-slider-control"));
  ok(
    "slider: at max the thumb stays inside its cell (clear of the readout keyline)",
    thEnd.x + thEnd.width <= ctl.x + ctl.width - 4 && thEnd.x >= frame.x,
    { thEnd, ctl },
  );

  // range: two named thumbs, independent of the single slider (which now holds 40)
  const win = s.nth(1);
  const thumbs = win.locator("input[type=range]");
  ok(
    "slider range: two thumbs named “from” and “to”",
    (await thumbs.count()) === 2 &&
      (await thumbs.nth(0).getAttribute("aria-label")) === "Delivery window, from" &&
      (await thumbs.nth(1).getAttribute("aria-label")) === "Delivery window, to",
    [await thumbs.nth(0).getAttribute("aria-label")],
  );
  await thumbs.nth(1).focus();
  await p.keyboard.press("ArrowLeft");
  await until(async () => (await win.locator(".kl-slider-value").innerText()).replace(/\s+/g, "") === "8–16h");
  await idle(p);
  ok(
    "slider range: moving “to” changes only the range (8–16), the single slider keeps 40.0",
    (await win.locator(".kl-slider-value").innerText()).replace(/\s+/g, "") === "8–16h" &&
      (await axle.locator("input[type=range]").getAttribute("aria-valuenow")) === "40",
    await win.locator(".kl-slider-value").innerText(),
  );
  // the fill follows the thumb a frame or more later; measure once it has stopped moving
  await stable(win.locator(".kl-slider-fill"));
  const fill = await box(win.locator(".kl-slider-fill"));
  const t0 = await box(win.locator(".kl-slider-thumb").nth(0));
  const t1 = await box(win.locator(".kl-slider-thumb").nth(1));
  ok(
    "slider range: the fill runs between the two thumbs' centres",
    near(fill.x, t0.x + t0.width / 2, 2) && near(fill.x + fill.width, t1.x + t1.width / 2, 2),
    { fill, t0, t1 },
  );
  ok("no page errors", p.errs.length === 0, p.errs);
});

test("slider: disabled and cell layouts", async ({ open, ok }) => {
  const p = await open({ ready: READY });
  const s = p.locator("#slider .kl-slider");
  await s.nth(0).scrollIntoViewIfNeeded();
  const dis = s.nth(3);
  ok(
    "slider disabled: the input is disabled and the frame hatched",
    (await dis.locator("input[type=range]").isDisabled()) &&
      (await dis
        .locator(".kl-slider-frame")
        .evaluate((el) => getComputedStyle(el).backgroundImage.includes("gradient"))),
    null,
  );
  // the cell layout fills its footer row: the readout keyline runs the full height
  const cell = s.nth(4);
  const cf = await box(cell.locator(".kl-slider-frame"));
  // the row is the nearest box ancestor (the slider sits in a display: contents Field host)
  const row = await cell.evaluate((c) => {
    let el = c.parentElement;
    while (el && getComputedStyle(el).display === "contents") el = el.parentElement;
    const cs = getComputedStyle(el);
    return { height: el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) };
  });
  const val = await box(cell.locator(".kl-slider-value"));
  ok(
    "slider cell: fills the row; its readout cell runs the full height",
    near(cf.height, row.height, 1.5) &&
      near(val.height, cf.height, 1.5) &&
      (await cell.locator(".kl-slider-frame").evaluate((el) => getComputedStyle(el).borderTopWidth)) === "0px",
    { cf, row, val },
  );
  ok(
    "slider compact: the thumb is 12×18 inside a compact region",
    (await cell.locator(".kl-slider-thumb").evaluate((el) => `${el.offsetWidth}×${el.offsetHeight}`)) === "12×18",
    await cell.locator(".kl-slider-thumb").evaluate((el) => `${el.offsetWidth}×${el.offsetHeight}`),
  );
  ok("no page errors", p.errs.length === 0, p.errs);
});
