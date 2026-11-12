// Form: responsive/vertical/horizontal field orientation, the shared label column, actions in the control column,
// client validation, server errors and success; the narrow (390px) layout.
import { test, settle } from "./fixtures.mjs";
import { near, box, until } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["number", "form"] });

const READY = "#number [data-slot=number-field]";

test("form: orientation, label column, validation, server error, success", async ({ open, ok }) => {
  const p = await open({ ready: READY });
  const f = p.locator("#form");
  await f.scrollIntoViewIfNeeded();
  const lab = f.locator(".kl-field").first().locator(".kl-field-label");
  const fr = f.locator(".kl-field").first().locator(".kl-field-frame");
  let L = await box(lab);
  let F = await box(fr);
  ok(
    "form: responsive at ~650px of form width puts the label beside the frame",
    L.x + L.width <= F.x && near(L.y + L.height / 2, F.y + F.height / 2, 3),
    { L, F },
  );
  const act = await box(f.locator("[data-slot=form-actions]"));
  ok("form: actions sit in the control column", near(act.x, F.x, 1), { act: act.x, F: F.x });
  const labels = await f
    .locator("[data-slot=form] > .kl-field > .kl-field-label, [data-slot=form] > .kl-field > * > .kl-field-label")
    .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
  ok("form: every field's label column has the same width", new Set(labels).size === 1, labels);
  await f.getByRole("radio", { name: "Vertical" }).click();
  await until(async () => {
    const l = await box(lab),
      fb = await box(fr);
    return l.y + l.height <= fb.y + 1;
  });
  await settle(p);
  L = await box(lab);
  F = await box(fr);
  ok("form: vertical puts the label above the frame", L.y + L.height <= F.y + 1 && near(L.x, F.x, 1), { L, F });
  await f.getByRole("radio", { name: "Responsive" }).click();
  // submit empty: Base UI validates, focuses the first invalid field, shows the message
  await f.getByRole("button", { name: "Book pickup" }).click();
  await until(
    async () =>
      (await f.getByText("Enter the shipment reference.").isVisible()) &&
      (await p.evaluate(() => document.activeElement?.getAttribute("placeholder"))) === "SH-24-0193",
  );
  ok(
    "form: submit with a missing reference shows its message and focuses it",
    (await f.getByText("Enter the shipment reference.").isVisible()) &&
      (await p.evaluate(() => document.activeElement?.getAttribute("placeholder"))) === "SH-24-0193",
    await p.evaluate(() => document.activeElement?.outerHTML.slice(0, 80)),
  );
  const ref = f.getByLabel("Reference", { exact: true });
  await ref.fill("DUP-1");
  await f.getByRole("button", { name: "Book pickup" }).click();
  await until(
    async () =>
      (await f.getByText("DUP-1 is already booked for this week.").isVisible()) &&
      (await f.locator(".kl-field").first().getAttribute("data-invalid")) !== null,
  );
  ok(
    "form: a server error lands on its field (errors prop)",
    (await f.getByText("DUP-1 is already booked for this week.").isVisible()) &&
      (await f.locator(".kl-field").first().getAttribute("data-invalid")) !== null,
    null,
  );
  await ref.fill("SH-77");
  await until(async () => !(await f.getByText("DUP-1 is already booked").isVisible()));
  ok(
    "form: editing the field clears its server error",
    !(await f.getByText("DUP-1 is already booked").isVisible()),
    null,
  );
  await f.getByRole("button", { name: "Book pickup" }).click();
  await until(async () => await f.getByText("SH-77 · 12 PLT · std").isVisible());
  ok(
    "form: success shows a done notice with the submitted values",
    await f.getByText("SH-77 · 12 PLT · std").isVisible(),
    await f.locator("[data-slot=notice]").allInnerTexts(),
  );
  ok("no page errors (default page)", p.errs.length === 0, p.errs);
});

test("form: narrow (390px) responsive form is vertical; explicit horizontal stays; no page scroll", async ({
  open,
  ok,
}) => {
  const r = await open({ width: 390, ready: READY });
  const f = r.locator("#form");
  await f.scrollIntoViewIfNeeded();
  const L = await box(f.locator(".kl-field").first().locator(".kl-field-label"));
  const F = await box(f.locator(".kl-field").first().locator(".kl-field-frame"));
  ok("narrow: the responsive form is vertical at 390px", L.y + L.height <= F.y + 1, { L, F });
  await f.getByRole("radio", { name: "Horizontal" }).click();
  const horizontal = async () => {
    const l = await box(f.locator(".kl-field").first().locator(".kl-field-label")),
      fb = await box(f.locator(".kl-field").first().locator(".kl-field-frame"));
    return l.x + l.width <= fb.x;
  };
  await until(horizontal);
  await settle(r);
  const L2 = await box(f.locator(".kl-field").first().locator(".kl-field-label"));
  const F2 = await box(f.locator(".kl-field").first().locator(".kl-field-frame"));
  ok("narrow: an explicit horizontal form stays horizontal (the author's choice)", L2.x + L2.width <= F2.x, { L2, F2 });
  const overflow = await r.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok("narrow: no horizontal page scroll at 390px", overflow <= 0, overflow);
  ok("no page errors (390px)", r.errs.length === 0, r.errs);
});
