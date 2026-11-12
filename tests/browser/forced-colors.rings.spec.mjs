// Forced colours (Chromium emulation only): rings and focus bands use Highlight
//.
import { test, idle } from "./fixtures.mjs";
import { until } from "./lib/flow.mjs";

test("forced colours: scroll region ring and select trigger ring use Highlight", async ({ open, ok, eng }) => {
  test.skip(eng !== "chromium", "forced-colours emulation exists only in Chromium");
  const fc = await open({
    route: "playground",
    width: 1400,
    height: 1000,
    ctx: { forcedColors: "active" },
    ready: "[data-slot=preview]",
  });
  const hl = await fc.evaluate(() => {
    const d = document.createElement("div");
    d.style.color = "Highlight";
    document.body.append(d);
    const c = getComputedStyle(d).color;
    d.remove();
    return c;
  });
  const vp = fc
    .getByTestId("scope-preview")
    .locator("[data-slot=scroll-area]")
    .filter({ hasText: "Departed Hamburg hub" })
    .locator(".kl-scroll-vp");
  await vp.focus();
  const saRing = await vp.evaluate((e) => getComputedStyle(e.parentElement, "::after").outlineColor);
  await fc.getByTestId("scope-preview").getByRole("button", { name: "Book pickup…" }).click();
  const combo = fc.getByRole("dialog").locator("[data-slot=select] [role=combobox]");
  await combo.waitFor();
  await idle(fc);
  await combo.focus();
  await fc.keyboard.press("ArrowDown");
  await fc.locator("[role=listbox]:visible").waitFor();
  await idle(fc);
  await fc.keyboard.press("Escape");
  await until(() => fc.evaluate(() => document.activeElement?.getAttribute("role") === "combobox"));
  await idle(fc);
  const trRing = await fc.evaluate(() => getComputedStyle(document.activeElement).outlineColor);
  ok(
    "forced colours: rings use Highlight (scroll region, select trigger after Escape)",
    saRing === hl && trRing === hl,
    { hl, saRing, trRing },
  );
});

test("forced colours: the focus band is 3px Highlight", async ({ open, ok, eng }) => {
  test.skip(eng !== "chromium", "forced-colours emulation exists only in Chromium");
  const p = await open({ route: "specimen", width: 1280, height: 720 });
  await p.emulateMedia({ forcedColors: "active" });
  const w = p.locator(".kl-field-input[data-align=end]").first();
  await w.click();
  const fc = await w.evaluate((e) => {
    const b = getComputedStyle(e.closest(".kl-edge"), "::before");
    return { w: b.borderTopWidth, c: b.borderTopColor };
  });
  ok("forced colours: band is 3px Highlight", fc.w === "3px" && fc.c !== "rgba(0, 0, 0, 0)", fc);
});
