// Select, Combobox, Slider, NumberField and TimeField as Base UI Field participants inside a Form: validate and
// required on submit, the ! cell, values carried by the Form, Slider validate, server errors from Form `errors`,
// and the cell layout.
import { test, idle, stable } from "./fixtures.mjs";
import { css, describedBy, until } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["participants"] });

test("participants: validate, values, slider validate, server errors, cells", async ({ open, ok }) => {
  const p = await open({ ready: "#participants form" });
  const sec = p.locator("#participants");
  const form = sec.locator("form");
  await form.scrollIntoViewIfNeeded();
  const pre = sec.getByTestId("specimen-values");
  const service = form.locator('[data-slot="select"]');
  const carrier = form.locator('[data-slot="combobox"]').first();
  const submit = () => form.getByRole("button", { name: "Check booking" }).click();
  await submit();
  await until(
    async () =>
      (await form.getByText("Choose a service level.").isVisible()) &&
      (await carrier.getAttribute("data-invalid")) !== null,
  );
  await idle(p);
  ok(
    "participants: submit with no service runs Select's validate (message under the frame)",
    await form.getByText("Choose a service level.").isVisible(),
    null,
  );
  ok(
    "participants: the Select field is invalid (Field.Root data-invalid)",
    (await service.getAttribute("data-invalid")) !== null,
    null,
  );
  const bang = service.locator(".kl-field-bang");
  // the ! cell unfolds (about 150ms); measure it once its box has stopped moving
  await stable(bang);
  ok(
    "participants: the invalid Select inserts the ! cell",
    ((await bang.boundingBox())?.width ?? 0) > 20,
    await bang.boundingBox(),
  );
  ok(
    "participants: required Combobox is invalid on submit",
    (await carrier.getAttribute("data-invalid")) !== null,
    null,
  );
  ok(
    "participants: an invalid form does not submit (values unchanged)",
    (await pre.textContent()).includes("Not submitted"),
    await pre.textContent(),
  );
  const trig = service.locator('[data-slot="select-trigger"]');
  ok(
    "participants: the error describes the Select trigger",
    (await describedBy(trig)).includes("Choose a service level."),
    await describedBy(trig),
  );

  await trig.click();
  await p.getByRole("option", { name: "Standard" }).click();
  await until(
    async () =>
      (await p.getByRole("option", { name: "Standard" }).count()) === 0 ||
      !(await p.getByRole("option", { name: "Standard" }).isVisible()),
  );
  const cbInput = carrier.locator("[data-slot=combobox-input]");
  await cbInput.fill("Mae");
  await p.getByRole("option", { name: /^Maersk/ }).click();
  await until(
    async () =>
      (await cbInput.inputValue()).startsWith("Maersk") &&
      !(await p.getByRole("option", { name: /^Maersk/ }).isVisible()),
  );
  const values = async () => {
    try {
      return JSON.parse(await pre.textContent());
    } catch {
      return {};
    }
  };
  await submit();
  await until(async () => (await values()).service !== undefined);
  const vals = await values();
  ok("participants: Form values carry Select (service = std)", vals.service === "std", vals);
  ok(
    "participants: Form values carry Combobox (carrier = Maersk, the option's value)",
    vals.carrier === "Maersk",
    vals.carrier,
  );
  ok(
    "participants: Form values carry Slider (setpoint = 4) and a range (humidity = [75, 90])",
    vals.setpoint === 4 && JSON.stringify(vals.humidity) === "[75,90]",
    [vals.setpoint, vals.humidity],
  );
  ok(
    "participants: Form values carry NumberField and TimeField (pallets 18, pickup 09:30)",
    vals.pallets === 18 && vals.pickup === "09:30",
    [vals.pallets, vals.pickup],
  );
  ok(
    "participants: valid fields clear their invalid state",
    (await service.getAttribute("data-invalid")) === null && (await carrier.getAttribute("data-invalid")) === null,
    null,
  );

  // Slider validate
  const thumb = form.getByRole("slider", { name: "Set point" });
  const chilled = form.getByText("Chilled goods ride at 8 °C or colder.");
  await thumb.focus();
  await p.keyboard.press("End");
  await submit();
  await until(() => chilled.isVisible());
  ok("participants: Slider validate fails above 8 °C with its message", await chilled.isVisible(), null);
  const slider = form.locator("[data-slot=slider]").first();
  ok(
    "participants: the invalid Slider frame turns red",
    (await css(slider.locator("[data-slot=slider-frame]"), "border-top-color")) ===
      (await css(slider, "--kl-red")).trim() || (await slider.getAttribute("data-invalid")) !== null,
    null,
  );
  await thumb.focus();
  await p.keyboard.press("Home");
  await submit();
  await until(async () => !(await chilled.isVisible()));
  ok("participants: fixing the value clears the Slider error", !(await chilled.isVisible()), null);

  // server errors from Form `errors`
  await form.getByRole("button", { name: "Simulate server errors" }).click();
  const serverErrors = [
    ["Select", "Express is sold out for Friday."],
    ["Combobox", "This carrier has no reefer slots this week."],
    ["Slider", "The unit on this trailer holds 2 °C at best."],
    ["TimeField", "The dock closes at 16:00 on Fridays."],
  ];
  await until(async () => {
    for (const [, text] of serverErrors) if (!(await form.getByText(text).isVisible())) return false;
    return true;
  });
  await idle(p);
  for (const [what, text] of serverErrors)
    ok(`participants: a server error for the ${what} shows under it`, await form.getByText(text).isVisible(), null);
  // regression: the centred Select value drew a text-high red seam beside the ! cell
  ok(
    "participants: an invalid Select value draws no seam beside the ! cell",
    (await css(form.locator("[data-slot=select-value]").first(), "border-inline-start-width")) === "0px",
    await css(form.locator("[data-slot=select-value]").first(), "border-inline-start-width"),
  );

  // cells
  const cells = sec.locator('.kl-cells:has(> [data-slot="select"])');
  const cellSel = cells.locator('[data-slot="select"]');
  const cellErr = cellSel.locator("[data-slot=field-error]");
  ok(
    "participants: an invalid Select cell keeps its message for assistive tech only (kl-sr)",
    (await cellErr.getAttribute("class")).includes("kl-sr") &&
      (await describedBy(cellSel.locator('[data-slot="select-trigger"]'))).includes("sold out"),
    await cellErr.getAttribute("class"),
  );
  ok(
    "participants: an invalid Select cell shows the ! cell",
    ((await cellSel.locator(".kl-field-bang").boundingBox())?.width ?? 0) > 20,
    null,
  );
  ok(
    "participants: an invalid Combobox cell shows the ! cell",
    ((await cells.locator('[data-slot="combobox"] .kl-field-bang').boundingBox())?.width ?? 0) > 20,
    null,
  );
  const dis = sec.locator('[data-slot="select"][data-disabled]');
  ok(
    "participants: a disabled Select's Field is disabled and the trigger is hatched",
    (await dis.count()) === 1 &&
      (await css(dis.locator('[data-slot="select-trigger"]'), "background-image")) !== "none",
    null,
  );
  ok("specimen: no page errors", p.errs.length === 0, p.errs);
});
