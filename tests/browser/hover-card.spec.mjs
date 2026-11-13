// Hover card: the delay and the drawing underline, leaving early, keyboard focus, the card's parts, inside the
// viewport at 390px, RTL, reduced motion.
import { test, idle, stable } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["otp", "hover-card"] });

const under = (loc) => loc.evaluate((a) => getComputedStyle(a).backgroundSize.split(",")[0].trim());

for (const q of ["theme=light", "theme=dark&density=compact&cut=off", "dir=rtl"]) {
  test(`hover card: delay, open, leave, keyboard (${q})`, async ({ open, ok }) => {
    const p = await open({ route: "specimen", q, ready: "#otp" });
    const text = p.getByTestId("hc-text");
    await text.scrollIntoViewIfNeeded();
    const nora = text.locator("[data-slot=hover-card-trigger]").first();
    const box = await nora.boundingBox();
    const card = p.locator("[data-slot=hover-card-popup]");
    // timing: the underline is sampled 300ms after the pointer enters (part-way through the hover delay). The timer
    // runs in the page from the pointerenter itself, so round trips on a loaded machine cannot stretch the 300ms.
    await nora.evaluate((a) => {
      window.__hcMid = null;
      a.addEventListener(
        "pointerenter",
        () =>
          setTimeout(
            () =>
              (window.__hcMid = [
                getComputedStyle(a).backgroundSize.split(",")[0].trim(),
                document.querySelectorAll("[data-slot=hover-card-popup]").length,
              ]),
            300,
          ),
        { once: true },
      );
    });
    await p.mouse.move(box.x + 10, box.y + box.height / 2);
    await p.waitForFunction(() => window.__hcMid, null, { timeout: 5000 });
    const [mid, cardsMid] = await p.evaluate(() => window.__hcMid);
    const pct = parseFloat(mid);
    ok(`${q}: during the delay the underline is drawing (${mid})`, pct > 10 && pct < 95, mid);
    ok(`${q}: no card before the delay ends`, cardsMid === 0, null);
    await card.waitFor({ state: "visible", timeout: 3000 }).catch(() => {});
    await idle(p);
    await stable(card).catch(() => {});
    ok(
      `${q}: the card opens after the delay with header, code and facts`,
      (await card.count()) === 1 &&
        /Nora van der Berg/.test(await card.locator("[data-slot=hover-card-title]").textContent()) &&
        (await card.locator("[data-slot=hover-card-code]").textContent()) === "U-0412" &&
        (await card.locator("[data-slot=hover-card-fact]").count()) === 2,
      null,
    );
    ok(`${q}: open, the underline is fully drawn`, (await under(nora)).startsWith("100%"), null);
    const cb = await card.boundingBox();
    ok(`${q}: the card sits one gutter (8px) below the link`, Math.abs(cb.y - (box.y + box.height) - 8) <= 2, {
      card: cb.y,
      link: box.y + box.height,
    });
    ok(
      `${q}: the card is on the overlay level and the raised surface`,
      await card.evaluate((c) => getComputedStyle(c.closest(".kl-positioner")).zIndex === "60"),
      null,
    );
    // leaving closes; leaving early never opens
    await p.mouse.move(5, 5);
    await card.waitFor({ state: "detached", timeout: 3000 }).catch(() => {});
    ok(`${q}: leaving closes the card`, (await card.count()) === 0, null);
    const ade = text.locator("[data-slot=hover-card-trigger]").nth(1);
    const ab = await ade.boundingBox();
    await p.mouse.move(ab.x + 5, ab.y + ab.height / 2);
    await p.waitForTimeout(200); // timing: a 200ms pass, shorter than the hover delay
    await p.mouse.move(5, 5);
    await p.waitForTimeout(800); // timing: nothing may open within the delay after leaving; the underline retracts
    ok(
      `${q}: passing over a link (200ms) opens nothing and the underline retracts`,
      (await card.count()) === 0 && (await under(ade)).startsWith("0%"),
      null,
    );
    // keyboard: focus opens it; the link keeps focus; Escape closes
    await ade.focus();
    await card.waitFor({ state: "visible", timeout: 3000 }).catch(() => {});
    ok(
      `${q}: keyboard focus opens the card; focus stays on the link`,
      (await card.count()) === 1 &&
        (await p.evaluate(() => document.activeElement?.getAttribute("data-slot") === "hover-card-trigger")),
      null,
    );
    await p.keyboard.press("Escape");
    await card.waitFor({ state: "detached", timeout: 3000 }).catch(() => {});
    ok(`${q}: Escape closes it`, (await card.count()) === 0, null);
    ok(
      `${q}: the card is not in the accessibility order (the link is the interface)`,
      (await p.evaluate(
        () =>
          document.querySelectorAll(
            "[data-slot=hover-card-popup] [tabindex='0'], [data-slot=hover-card-popup] button, [data-slot=hover-card-popup] a",
          ).length,
      )) === 0,
      null,
    );
    ok(`${q}: no page errors`, p.errs.length === 0, p.errs);
  });
}

test("hover card: 390px, the card stays inside the viewport", async ({ open, ok }) => {
  // the long name in a narrow column; the card stays inside the viewport
  const p = await open({ route: "specimen", q: "theme=light", width: 390, height: 844, ready: "#otp" });
  const t = p.getByTestId("hc-narrow").locator("[data-slot=hover-card-trigger]");
  await t.scrollIntoViewIfNeeded();
  await t.focus();
  const card = p.locator("[data-slot=hover-card-popup]");
  await card.waitFor({ state: "visible", timeout: 3000 }).catch(() => {});
  await idle(p);
  await stable(card).catch(() => {});
  const cb = await card.boundingBox();
  ok("390px: the card fits the viewport with 12px to spare", cb && cb.x >= 11 && cb.x + cb.width <= 390 - 11, cb);
  const wrap = await p.locator("[data-slot=hover-card-title]").evaluate((x) => x.scrollWidth <= x.clientWidth + 1);
  ok("390px: a long name wraps inside the card", wrap, null);
});

test("hover card: reduced motion", async ({ open, ok }) => {
  const p = await open({ route: "specimen", q: "motion=reduce", ready: "#otp" });
  const t = p.getByTestId("hc-text").locator("[data-slot=hover-card-trigger]").first();
  await t.scrollIntoViewIfNeeded();
  const bb = await t.boundingBox();
  // timing: sampled 300ms after pointerenter (part-way through the hover delay), timed in the page
  await t.evaluate((a) => {
    window.__hcMid = null;
    a.addEventListener(
      "pointerenter",
      () => setTimeout(() => (window.__hcMid = getComputedStyle(a).backgroundSize.split(",")[0].trim()), 300),
      { once: true },
    );
  });
  await p.mouse.move(bb.x + 5, bb.y + 5);
  await p.waitForFunction(() => window.__hcMid, null, { timeout: 5000 });
  ok(
    "reduced motion: the underline does not draw during the delay",
    (await p.evaluate(() => window.__hcMid)).startsWith("0%"),
    null,
  );
  await p
    .locator("[data-slot=hover-card-popup]")
    .waitFor({ state: "visible", timeout: 3000 })
    .catch(() => {});
  ok(
    "reduced motion: it is drawn once the card is open",
    (await under(t)).startsWith("100%") && (await p.locator("[data-slot=hover-card-popup]").count()) === 1,
    null,
  );
});
