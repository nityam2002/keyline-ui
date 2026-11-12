// Combobox on the specimen page: local filtering with marks and groups, docking, choose/clear, disabled options,
// Escape; the async form's error, Retry and recovery; invalid and disabled frames.
import { test, idle } from "./fixtures.mjs";
import { near, box, active, until } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["slider", "combobox"] });

test("combobox: filter, choose, clear, async error and recovery", async ({ open, ok }) => {
  const p = await open({ ready: "#slider .kl-slider" });
  const cbs = p.locator("#combobox .kl-combobox");
  const term = cbs.nth(0);
  // scroll the specimen to the slider first so the combobox
  // sits high enough for the full list to open below (opened lower, the list flips above and stays there after
  // filtering, and the docking check measures the flipped side)
  await p.locator("#slider .kl-slider").first().scrollIntoViewIfNeeded();
  await term.scrollIntoViewIfNeeded();
  const input = term.locator("input[role=combobox]");
  ok(
    "combobox: a controlled value shows its label in the input",
    (await input.inputValue()).startsWith("Hamburg Altenwerder"),
    await input.inputValue(),
  );
  ok("combobox: a chosen value offers the clear cell", (await term.locator(".kl-cb-clear").count()) === 1, null);
  await input.click();
  await input.fill("");
  await p.keyboard.type("noord");
  const panel = p.locator(".kl-cb-panel").first();
  const opts = panel.locator("[role=option]");
  await until(async () => (await opts.count()) === 1 && (await panel.locator("mark.kl-match").count()) > 0);
  await idle(p);
  ok(
    "combobox: typing filters the local list (“noord” → 1 match)",
    (await opts.count()) === 1 && /Noordzee/.test(await opts.first().innerText()),
    await opts.count(),
  );
  ok(
    "combobox: the typed text is marked in the match",
    (await panel.locator("mark.kl-match").first().innerText()).toLowerCase() === "noord",
    null,
  );
  ok(
    "combobox: the group heading of the match is listed",
    (await panel.locator(".kl-cb-group-label").allInnerTexts()).join() === "Antwerp",
    await panel.locator(".kl-cb-group-label").allInnerTexts(),
  );
  const tb = await box(term.locator(".kl-cb-frame"));
  const pb = await box(panel);
  ok(
    "combobox: the list docks on the frame (overlaps its 2px bottom border, same start edge)",
    near(pb.y, tb.y + tb.height - 2) && near(pb.x, tb.x),
    { tb, pb },
  );
  ok(
    "combobox: autoHighlight puts the cursor on the first match",
    (await opts.first().getAttribute("data-highlighted")) !== null,
    null,
  );
  await p.keyboard.press("Enter");
  await until(async () => (await input.inputValue()) === "Antwerp Noordzee PSA" && !(await panel.isVisible()));
  ok(
    "combobox: Enter chooses; the input shows the label and the list closes",
    (await input.inputValue()) === "Antwerp Noordzee PSA" && !(await panel.isVisible()),
    await input.inputValue(),
  );
  await term.locator(".kl-cb-clear").click();
  await until(async () => (await input.inputValue()) === "" && (await term.locator(".kl-cb-clear").count()) === 0);
  ok(
    "combobox: Clear empties the value and removes the clear cell",
    (await input.inputValue()) === "" && (await term.locator(".kl-cb-clear").count()) === 0,
    await input.inputValue(),
  );
  // disabled option is listed but can't be chosen
  await input.focus();
  await p.keyboard.type("tollerort");
  const dopt = p.locator(".kl-cb-panel [role=option]").first();
  await until(async () => /tollerort/i.test(await dopt.innerText()));
  ok(
    "combobox: a closed terminal is listed, disabled",
    (await dopt.getAttribute("aria-disabled")) === "true",
    await dopt.getAttribute("aria-disabled"),
  );
  await p.keyboard.press("Escape");
  await until(async () => !(await p.locator(".kl-cb-panel").first().isVisible()));
  ok(
    "combobox: Escape closes and keeps focus in the input",
    !(await p.locator(".kl-cb-panel").first().isVisible()) && (await active(p)).role === "combobox",
    await active(p),
  );
  await p.keyboard.press("Escape");

  // async: error with Retry, then results
  const car = cbs.nth(1);
  const cin = car.locator("input[role=combobox]");
  await cin.click();
  await p.keyboard.type("err");
  const cpanel = p
    .locator(".kl-cb-panel")
    .filter({ has: p.locator(".kl-cb-head") })
    .first();
  await until(
    async () =>
      /timed out/.test(await cpanel.locator(".kl-cb-status").innerText()) &&
      (await cpanel.locator(".kl-cb-retry").count()) === 1,
  );
  ok(
    "combobox async: a failed search says so and offers Retry",
    /timed out/.test(await cpanel.locator(".kl-cb-status").innerText()) &&
      (await cpanel.locator(".kl-cb-retry").count()) === 1,
    await cpanel.locator(".kl-cb-status").innerText(),
  );
  await cin.fill("ds");
  await until(
    async () =>
      /1 match for “ds”/.test(await cpanel.locator(".kl-cb-status").innerText()) &&
      (await cpanel.locator("[role=option]").count()) === 1,
  );
  ok(
    "combobox async: recovery: a new search lists matches with a count",
    /1 match for “ds”/.test(await cpanel.locator(".kl-cb-status").innerText()) &&
      (await cpanel.locator("[role=option]").count()) === 1,
    await cpanel.locator(".kl-cb-status").innerText(),
  );
  await p.keyboard.press("ArrowDown");
  await p.keyboard.press("Enter");
  await until(async () => (await cin.inputValue()) === "DSV Road");
  ok(
    "combobox async: choosing keeps the label; the other comboboxes are untouched",
    (await cin.inputValue()) === "DSV Road" && (await term.locator("input.kl-cb-input").inputValue()) === "",
    [await cin.inputValue()],
  );
  ok(
    "combobox: invalid draws the attention frame",
    (await cbs
      .nth(2)
      .locator(".kl-cb-frame")
      .evaluate((el) => getComputedStyle(el).borderTopColor)) !==
      (await cbs
        .nth(0)
        .locator(".kl-cb-frame")
        .evaluate((el) => getComputedStyle(el).borderTopColor)),
    null,
  );
  ok("combobox: disabled input is disabled", await cbs.nth(3).locator("input.kl-cb-input").isDisabled(), null);
  ok("no page errors", p.errs.length === 0, p.errs);
});
