// Popups rendered in a portal inherit the configuration of the place they were written: the section's cut and a dark subtree in a light page.
import { test } from "./fixtures.mjs";
import { until, trackHttp, same, specimen } from "./lib/flow.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["select", "split", "direction"] });

const Q = "theme=light&cut=on&density=default&motion=normal&dir=ltr";
async function page(open) {
  const p = await open({ route: "specimen", q: Q, width: 1440, height: 900, ready: ".kl-frame" });
  const http = await trackHttp(p, "[data-testid=entry]");
  return { p, ...specimen(p), errors: () => [...p.errs, ...p.consoleErrs, ...http] };
}
const noErrors = (ok, s) => ok("no page errors", same(s.errors(), []), { actual: s.errors(), expected: [] });

test("portal: select inherits the section's cut", async ({ open, ok }) => {
  const s = await page(open);
  const { p, col, cutOff, popupVar } = s;
  for (const [i, expect] of [
    [0, "on"],
    [1, "0"],
  ]) {
    await cutOff("Select", i === 1);
    await col("Select").locator("[data-slot=select] [role=combobox]").first().click();
    await p.locator("[role=listbox]:visible").waitFor();
    const cut = await popupVar("[role=listbox]", "--kl-cut");
    ok(`case ${i}: listbox --kl-cut is ${expect === "0" ? "0" : "not 0"}`, expect === "0" ? cut === "0" : cut !== "0", {
      cut,
    });
    await p.keyboard.press("Escape");
    await until(async () => (await p.locator("[role=listbox]:visible").count()) === 0);
  }
  noErrors(ok, s);
});

test("portal: menu inherits the section's cut", async ({ open, ok }) => {
  const s = await page(open);
  const { p, col, cutOff, popupVar } = s;
  await cutOff("Split button", true);
  // the menu reads its scope when it renders; an attribute set outside React needs one render to reach it
  await col("Split button").getByRole("radio", { name: "Day" }).click();
  await col("Split button").locator("[data-slot=split-button-trigger]").first().click();
  await p.locator("[role=menu]:visible").waitFor();
  const cut = await popupVar("[role=menu]", "--kl-cut");
  ok("menu in the cut-off section reads --kl-cut 0", same(cut, "0"), { actual: cut, expected: "0" });
  await p.keyboard.press("Escape");
  noErrors(ok, s);
});

test("portal: dark subtree in a light page", async ({ open, ok }) => {
  const s = await page(open);
  const { p, col, popupVar } = s;
  const dark = await p.evaluate(() => {
    const d = Object.assign(document.createElement("div"), { className: "dark" });
    document.body.append(d);
    const v = getComputedStyle(d).getPropertyValue("--kl-paper").trim();
    d.remove();
    return v;
  });
  await col("Select").evaluate((el) => el.classList.add("dark"));
  await col("Select").locator("[data-slot=select] [role=combobox]").first().click();
  await p.locator("[role=listbox]:visible").waitFor();
  const paper = await popupVar("[role=listbox]", "--kl-paper");
  ok("listbox carries the dark tokens of where it was written", same(paper, dark), { actual: paper, expected: dark });
  await p.keyboard.press("Escape");
  noErrors(ok, s);
});
