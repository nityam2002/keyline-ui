// Chart (recharts): marks and data roles, the one tab stop, tooltip, keyboard, legend, table view, RTL and reduced
// motion.
import { test, stable } from "./fixtures.mjs";
import { rgb, until } from "./lib/chat.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["chart", "chat"] });

const VIEW = { width: 1280, height: 1000 };
const noErrors = (ok, p) =>
  ok("no page errors", p.errs.length + p.consoleErrs.length === 0, [...p.errs, ...p.consoleErrs]);

/** The bar chart, scrolled into view, its grow animation finished (12 bars, their boxes still). */
async function barsReady(p) {
  const bars = p.getByTestId("ch-bars");
  await bars.scrollIntoViewIfNeeded();
  const rects = bars.locator(".recharts-bar-rectangle path");
  await until(p, () => document.querySelectorAll("[data-testid=ch-bars] .recharts-bar-rectangle path").length === 12);
  await stable(rects.first(), 4).catch(() => {});
  await stable(rects.last(), 4).catch(() => {});
  return { bars, rects };
}

test("chart: marks, data roles, tab stop, ticks and grid", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=specimen-chart]" });
  const { bars, rects } = await barsReady(p);
  ok("chart: six days × two series drawn", (await rects.count()) === 12, await rects.count());
  const [d1, d2] = [await rgb(p, "var(--kl-data-1)"), await rgb(p, "var(--kl-data-2)")];
  const f = await rects.evaluateAll((r) => r.map((x) => getComputedStyle(x).fill));
  ok("chart: series take the data roles in config order (focal, comparison)", f[0] === d1 && f[f.length - 1] === d2, {
    f0: f[0],
    fl: f[f.length - 1],
    d1,
    d2,
  });
  const svg = bars.locator("svg.recharts-surface");
  const name = await svg.evaluate((s) => document.getElementById(s.getAttribute("aria-labelledby") ?? "")?.textContent);
  ok(
    "chart: the plot is one tab stop named by the figure's title, with a key hint",
    (await svg.getAttribute("tabindex")) === "0" &&
      name === "Pallets unloaded per day" &&
      /Arrow keys/.test(
        await svg.evaluate((s) => document.getElementById(s.getAttribute("aria-describedby") ?? "")?.textContent ?? ""),
      ),
    name,
  );
  const tick = bars.locator(".recharts-cartesian-axis-tick-value").first();
  const tf = await tick.evaluate((t) => [getComputedStyle(t).fontFamily, getComputedStyle(t).fill]);
  ok(
    "chart: ticks in the Code voice, supporting ink",
    /Mono/.test(tf[0]) && tf[1] === (await rgb(p, "var(--kl-ink-3)")),
    tf,
  );
  const grid = await bars
    .locator(".recharts-cartesian-grid line")
    .first()
    .evaluate((l) => [getComputedStyle(l).stroke, getComputedStyle(l).strokeDasharray]);
  ok(
    "chart: grid is a solid hairline in line-soft",
    grid[0] === (await rgb(p, "var(--kl-line-soft)")) && /^(none|0(px)?)$/.test(grid[1]),
    grid,
  );
  noErrors(ok, p);
});

test("chart: pointer hover shows the inverse tooltip, unannounced", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=specimen-chart]" });
  const { bars, rects } = await barsReady(p);
  const bx = await rects.first().boundingBox();
  await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2);
  const tip = bars.locator("[data-slot=chart-tooltip]");
  await until(p, () =>
    /pallets/.test(document.querySelector("[data-testid=ch-bars] [data-slot=chart-tooltip]")?.innerText ?? ""),
  );
  await stable(tip).catch(() => {});
  const tt = (await tip.innerText().catch(() => "")).replace(/\s+/g, " ");
  ok(
    "chart: hover shows the inverse tooltip: day, then each series with its figure and unit",
    /^Mon This week 182 pallets Last week 160 pallets$/.test(tt.trim()),
    tt,
  );
  const tbg = await tip.evaluate((t) => getComputedStyle(t).backgroundColor);
  ok("chart: tooltip surface is the inverse", tbg === (await rgb(p, "var(--kl-inverse)")), tbg);
  ok(
    "chart: pointer hover is not announced (focus is elsewhere)",
    ((await bars.locator("[role=status]").textContent()) ?? "") === "",
  );
  noErrors(ok, p);
});

test("chart: arrows step through the days, announced, with the focus ring", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=specimen-chart]" });
  const { bars } = await barsReady(p);
  const svg = bars.locator("svg.recharts-surface");
  await svg.focus();
  await p.keyboard.press("ArrowRight");
  await p.keyboard.press("ArrowRight");
  await until(p, () => /, /.test(document.querySelector("[data-testid=ch-bars] [role=status]")?.textContent ?? ""));
  const live = await bars.locator("[role=status]").textContent();
  ok(
    "chart: arrows step through the days and each step is announced",
    live === "Tue, This week 205 pallets, Last week 171 pallets" ||
      live === "Wed, This week 197 pallets, Last week 188 pallets",
    live,
  );
  const ring = await bars.locator(".recharts-wrapper").evaluate((w) => getComputedStyle(w).outlineStyle);
  ok("chart: the focused plot shows the focus ring", ring === "solid", ring);
  noErrors(ok, p);
});

test("chart: legends keep config order", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=specimen-chart]" });
  const { bars } = await barsReady(p);
  const leg = await bars.locator("[data-slot=chart-legend-item]").allInnerTexts();
  ok(
    "chart: legend lists the series in config order with square keys",
    leg.join("|") === "This week|Last week" &&
      (await bars
        .locator("[data-slot=chart-legend] [data-slot=chart-key]")
        .first()
        .evaluate((k) => getComputedStyle(k).borderRadius)) === "0px",
    leg,
  );
  const stackLeg = await p.getByTestId("ch-stack").locator("[data-slot=chart-legend-item]").allInnerTexts();
  ok("chart: a stacked chart's legend keeps config order", stackLeg.join("|") === "On time|Late", stackLeg);
  noErrors(ok, p);
});

test("chart: Table view carries the rows, and back", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=specimen-chart]" });
  const { bars } = await barsReady(p);
  await bars.getByRole("radio", { name: "Table" }).click();
  const table = bars.locator("table");
  await table.locator("tbody tr").first().waitFor();
  const head = await table.locator("thead th").allInnerTexts();
  const row = await table.locator("tbody tr").first().locator("th, td").allInnerTexts();
  ok(
    "chart: Table view carries the same rows (category column, a column per series)",
    (await table.locator("tbody tr").count()) === 6 &&
      head.map((h) => h.trim()).join("|") === "Day|This week pallets|Last week pallets" &&
      row.join("|") === "Mon|182|160",
    { head, row },
  );
  ok(
    "chart: table figures are end-aligned",
    (await table
      .locator("tbody td")
      .first()
      .evaluate((t) => getComputedStyle(t).textAlign)) === "end",
  );
  await bars.getByRole("radio", { name: "Chart" }).click();
  await until(p, () => document.querySelectorAll("[data-testid=ch-bars] .recharts-bar-rectangle path").length === 12);
  ok("chart: back to the chart", (await bars.locator(".recharts-bar-rectangle path").count()) === 12);
  noErrors(ok, p);
});

test("chart: RTL puts the first day at the inline start; SVG text stays ltr", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=specimen-chart]" });
  const rtl = p.getByTestId("ch-rtl");
  await rtl.scrollIntoViewIfNeeded();
  const tickLabels = rtl.locator(".recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value");
  await tickLabels.first().waitFor();
  await stable(rtl.locator(".recharts-cartesian-grid")).catch(() => {});
  await stable(tickLabels.last()).catch(() => {});
  const ticks = await tickLabels.evaluateAll((t) =>
    t
      .map((x) => [x.textContent, x.getBoundingClientRect().left])
      .sort((a, b) => a[1] - b[1])
      .map((x) => x[0]),
  );
  const yx = await rtl
    .locator(".recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value")
    .first()
    .evaluate((t) => t.getBoundingClientRect().left);
  const plotR = await rtl.locator(".recharts-cartesian-grid").evaluate((g) => g.getBoundingClientRect().right);
  ok(
    "chart RTL: the first day sits at the inline start (right), the value axis on the start edge",
    ticks[ticks.length - 1] === "Mon" && ticks[0] === "Sat" && yx >= plotR - 1,
    { ticks, yx, plotR },
  );
  const anchor = await p
    .getByTestId("ch-stack")
    .locator(".recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value")
    .first()
    .evaluate((t) => getComputedStyle(t).direction);
  ok("chart: SVG text keeps ltr anchoring (labels never flip into the marks)", anchor === "ltr", anchor);
  noErrors(ok, p);
});

test("chart: reduced motion draws the bars at full size", async ({ open, ok }) => {
  const q = await open({ ...VIEW, q: "motion=reduce" });
  const bars = q.getByTestId("ch-bars");
  await bars.waitFor();
  await bars.scrollIntoViewIfNeeded();
  await q.waitForSelector("[data-testid=ch-bars] .recharts-bar-rectangle path");
  const h0 = await bars
    .locator(".recharts-bar-rectangle path")
    .first()
    .evaluate((r) => r.getBoundingClientRect().height);
  await q.waitForTimeout(1000); // timing: the bars must not grow over the following second
  const h1 = await bars
    .locator(".recharts-bar-rectangle path")
    .first()
    .evaluate((r) => r.getBoundingClientRect().height);
  ok("chart: reduced motion: bars land at full height, no grow", Math.abs(h0 - h1) < 0.5 && h1 > 50, { h0, h1 });
});
