// Browser checks on the Next.js App Router consumer built by tests/consumer/next.sh (Chrome + WebKit).
// Usage: node tests/consumer/next.mjs <appURL>   (see scripts/consumer-check.sh)
import { chromium, webkit } from "playwright";
const URL = process.argv[2] || "http://localhost:5320/";
let fails = 0;
const ok = (eng, name, cond, detail) => {
  console.log(`${cond ? "  ✓" : "  ✖"} [${eng}] ${name}${cond ? "" : " — " + JSON.stringify(detail)}`);
  if (!cond) fails++;
};
const style = (loc, ...props) =>
  loc.evaluate((e, props) => {
    const s = getComputedStyle(e);
    return Object.fromEntries(props.map((p) => [p, s.getPropertyValue(p).trim()]));
  }, props);

for (const [eng, type, opts] of [
  ["chromium", chromium, { channel: "chrome" }],
  ["webkit", webkit, {}],
]) {
  const b = await type.launch(opts);
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  const failed = [];
  p.on("requestfailed", (r) => failed.push(r.url()));
  p.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
  await p.goto(URL, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);

  const light = p.getByTestId("kl-light"),
    dark = p.getByTestId("kl-dark"),
    stock = p.getByTestId("shadcn");
  // Button carries its styles as Tailwind utilities in src/components/keyline/: the app's Tailwind (PostCSS,
  // which finds sources by scanning the project) must have generated them. Compared with the tokens, in place.
  const generated = await light.evaluate((e) => {
    const token = (prop, value) => {
      const probe = document.createElement("span");
      probe.style.setProperty(prop, value);
      e.append(probe);
      const v = getComputedStyle(probe).getPropertyValue(prop);
      probe.remove();
      return v;
    };
    const s = getComputedStyle(e);
    return {
      fill: [s.backgroundColor, token("background-color", "var(--kl-cell)")],
      height: [s.minHeight, token("min-height", "var(--kl-ctl)")],
    };
  });
  ok(
    eng,
    "Keyline's utilities were generated: the button is filled with --kl-cell and is --kl-ctl tall",
    generated.fill[0] === generated.fill[1] &&
      generated.height[0] === generated.height[1] &&
      generated.height[0] !== "0px",
    generated,
  );
  const L = await style(light, "font-family", "color", "background-color", "border-top-width");
  const D = await style(dark, "color", "background-color");
  const S = await style(stock, "font-family");
  ok(eng, "Keyline button speaks Keyline's font", /Atkinson Hyperlegible Next/.test(L["font-family"]), L);
  ok(
    eng,
    "the font file loaded from the app's own bundle",
    await p.evaluate(
      () =>
        document.fonts.check('16px "Atkinson Hyperlegible Next Variable"') ||
        document.fonts.check('16px "Atkinson Hyperlegible Next"'),
    ),
  );
  ok(
    eng,
    "tokens are defined on the page",
    (await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--kl-ink").trim())) !== "",
  );
  ok(eng, "Keyline button has its frame", parseFloat(L["border-top-width"]) >= 1, L);
  ok(
    eng,
    "dark region: the Keyline button takes the dark theme",
    D.color !== L.color && D["background-color"] !== L["background-color"],
    { L, D },
  );
  ok(
    eng,
    "stock shadcn button keeps its own font (Keyline does not restyle the app)",
    !/Atkinson/.test(S["font-family"]),
    S,
  );

  // interaction in the user's client island
  await p.getByRole("button", { name: "Pressed 0" }).click();
  ok(
    eng,
    "client island: pressing the button updates state",
    (await p.getByRole("button", { name: "Pressed 1" }).count()) === 1,
  );

  // the overlay: written in the server page, portaled to <body>, styled, closes with Escape
  await p.getByRole("button", { name: "Open dialog" }).click();
  const dlg = p.getByRole("dialog", { name: "Server-rendered dialog" });
  await dlg.waitFor();
  ok(eng, "dialog: portaled out of <main>", await dlg.evaluate((d) => !d.closest("main")));
  const G = await style(dlg, "border-top-width", "font-family", "background-color");
  ok(
    eng,
    "dialog: Keyline frame and font in the portal",
    parseFloat(G["border-top-width"]) >= 2 && /Atkinson/.test(G["font-family"]),
    G,
  );
  // Base UI moves focus in on a frame after the dialog shows: wait for it (it fails if focus never arrives)
  const inside = await p
    .waitForFunction(() => document.querySelector('[role="dialog"]')?.contains(document.activeElement))
    .then(
      () => true,
      () => false,
    );
  ok(eng, "dialog: focus moves inside", inside);
  await p.keyboard.press("Escape");
  await dlg.waitFor({ state: "hidden" });
  ok(
    eng,
    "dialog: Escape closes it and focus returns to the trigger",
    await p.evaluate(() => document.activeElement?.textContent?.includes("Open dialog")),
  );

  // the chart: recharts (an npm dependency of the item) draws bars in the series colour
  const bars = p.getByTestId("chart").locator(".recharts-bar-rectangle path, .recharts-rectangle");
  ok(eng, "chart: recharts drew the three bars", (await bars.count()) === 3, await bars.count());

  ok(eng, "no runtime, hydration or console errors", errs.length === 0, errs);
  ok(eng, "no failed requests", failed.length === 0, failed);
  await b.close();
}
console.log(fails ? `next: ${fails} failed` : "next: all passed");
process.exit(fails ? 1 : 0);
