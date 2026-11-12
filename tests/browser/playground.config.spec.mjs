// The configuration playground: preset contrast, palette families, modes and tokens on
// the scope, overlays carrying the configuration, narrow + RTL reflow, export without diagnostics, reset and
// persistence. Each test applies the configuration it
// needs on a fresh page.
import { readFileSync } from "node:fs";
import { test, idle } from "./fixtures.mjs";
import { until, pick } from "./lib/flow.mjs";

const tok = (loc, names) =>
  loc.evaluate(
    (e, names) => Object.fromEntries(names.map((n) => [n, getComputedStyle(e).getPropertyValue(n).trim()])),
    names,
  );

async function setup(open) {
  const p = await open({
    route: "playground",
    width: 1600,
    height: 1000,
    ctx: { acceptDownloads: true },
    ready: "[data-slot=preview]",
  });
  return { p, ctl: p.getByRole("complementary", { name: "Configuration" }), scope: p.getByTestId("scope-preview") };
}
// palette Ember plus the modes the mode checks run under
async function modes(p) {
  await pick(p, "Palette", "Ember");
  await pick(p, "Theme", "Light");
  await pick(p, "Cut", "Full");
  await pick(p, "Density", "Comfortable");
  await pick(p, "Motion", "Reduced");
  await pick(p, "Font", "IBM Plex");
}
async function toggle(p, ctl, name) {
  const s = ctl.getByRole("switch", { name });
  const before = await s.getAttribute("aria-checked");
  await s.click();
  await until(async () => (await s.getAttribute("aria-checked")) !== before);
  await idle(p);
}

for (const pal of ["Signal", "Harbor", "Ember", "Ledger"])
  for (const th of ["Light", "Dark"])
    test(`contrast: ${pal} ${th.toLowerCase()} token pairs pass AA`, async ({ open, ok }) => {
      const { p } = await setup(open);
      await pick(p, "Palette", pal);
      await pick(p, "Theme", th);
      const read = () =>
        p
          .locator("[data-testid=pg-contrast] tr")
          .evaluateAll((trs) =>
            trs.map((t) => [t.children[0].textContent, +t.children[1].textContent, t.hasAttribute("data-fail")]),
          );
      await until(async () => (await read()).length === 17);
      const rows = await read();
      ok(
        `contrast: ${pal} ${th.toLowerCase()} — ${rows.length} token pairs pass AA`,
        rows.length === 17 && rows.every((r) => !r[2]),
        rows.filter((r) => r[2]),
      );
      ok("no page errors", p.errs.length === 0, p.errs);
    });

test("palette: a colour source changes its whole family", async ({ open, ok }) => {
  const { p, scope } = await setup(open);
  await pick(p, "Palette", "Signal");
  await pick(p, "Theme", "Light");
  const fam = ["--kl-cobalt", "--kl-on-cobalt", "--kl-cobalt-text", "--kl-focus", "--kl-data-1", "--kl-data-2"];
  const probe = scope.locator("[data-slot=preview]");
  const colours = async () =>
    probe.evaluate((e, fam) => {
      const s = document.createElement("span");
      e.append(s);
      const out = fam.map((f) => ((s.style.color = `var(${f})`), getComputedStyle(s).color));
      s.remove();
      return out;
    }, fam);
  const before = await colours();
  await pick(p, "Palette", "Ember");
  const after = await colours();
  ok(
    "palette: commit source updates fill, foreground-safe text, focus and data colours",
    fam.every((f, i) => f === "--kl-on-cobalt" || before[i] !== after[i]),
    { before, after },
  );
  ok("no page errors", p.errs.length === 0, p.errs);
});

test("scope: modes and tokens land on the scope", async ({ open, ok }) => {
  const { p, ctl, scope } = await setup(open);
  await modes(p);
  const t = await tok(scope, ["--kl-cut", "--kl-ctl", "--kl-t-flood", "--kl-font", "--kl-weight-strong"]);
  ok(
    "scope: cut 1, comfortable 40px, reduced motion 0ms, Plex",
    t["--kl-cut"] === "1" &&
      t["--kl-ctl"] === "40px" &&
      t["--kl-t-flood"] === "0ms" &&
      t["--kl-font"].includes("IBM Plex"),
    t,
  );
  const radius = await scope
    .locator(".kl-frame, .kl-ctl")
    .evaluateAll(
      (es) =>
        es.filter(
          (e) =>
            parseFloat(getComputedStyle(e).borderStartStartRadius) > 0 ||
            (getComputedStyle(e).clipPath || "none") !== "none",
        ).length,
    );
  ok("cut full: frames in the preview take the cut (square is the default)", radius > 0, radius);
  const h = await scope.getByRole("button", { name: "Retry sync" }).evaluate((e) => e.getBoundingClientRect().height);
  ok("comfortable: a standalone button is 40px tall", Math.abs(h - 40) < 0.6, h);
  ok(
    "weights clamp to the font: Heavy 800 is disabled for Plex",
    (await ctl.getByRole("radio", { name: "Heavy 800" }).getAttribute("aria-disabled")) === "true" ||
      (await ctl.getByRole("radio", { name: "Heavy 800" }).isDisabled()),
  );
  ok("no page errors", p.errs.length === 0, p.errs);
});

test("portal: the dialog and a select inside it carry the configuration", async ({ open, ok }) => {
  const { p, scope } = await setup(open);
  await modes(p);
  await pick(p, "Theme", "Dark");
  await scope.getByRole("button", { name: "Book pickup…" }).click();
  const dlg = p.getByRole("dialog");
  await dlg.waitFor();
  await dlg.locator("[data-slot=select] [role=combobox]").click();
  const lb = p.locator("[role=listbox]:visible");
  await lb.waitFor();
  await idle(p);
  const want = await tok(scope, ["--kl-commit", "--kl-cut", "--kl-dark", "--kl-font", "--kl-ctl"]);
  ok(
    "portal: dialog carries palette, cut, theme, font and density",
    JSON.stringify(await tok(dlg, Object.keys(want))) === JSON.stringify(want),
    { want, got: await tok(dlg, Object.keys(want)) },
  );
  ok(
    "portal: select opened inside the dialog carries them too",
    JSON.stringify(await tok(lb, Object.keys(want))) === JSON.stringify(want),
    await tok(lb, Object.keys(want)),
  );
  const dark = await lb.evaluate((e) => getComputedStyle(e.closest(".kl-select-panel") ?? e).backgroundColor);
  const pageCell = await scope
    .locator(".kl-frame")
    .first()
    .evaluate((e) => getComputedStyle(e).backgroundColor);
  ok(
    "portal: derived colours recompute in the portal (dark raised surface, lighter than the page's cells)",
    /oklch\(0\.26/.test(dark) && /oklch\(0\.22/.test(pageCell),
    { dark, pageCell },
  );
  ok("no page errors", p.errs.length === 0, p.errs);
});

test("narrow 390px + RTL: the preview reflows without sideways scroll", async ({ open, ok }) => {
  const { p, ctl, scope } = await setup(open);
  await modes(p);
  await pick(p, "Theme", "Dark");
  await toggle(p, ctl, "Right to left");
  await toggle(p, ctl, "Narrow frame (390px)");
  const over = await scope.getByTestId("pg-canvas").evaluate((e) => e.scrollWidth - e.clientWidth);
  ok("narrow 390px + RTL: the preview does not overflow its frame", over <= 1, over);
  // and it actually reflows to one column: every region and notice spans the narrow canvas
  const thin = await scope
    .locator("[data-slot=preview] :is(.kl-frame, [data-slot=notice])")
    .evaluateAll((es) =>
      es
        .filter(
          (e) =>
            e.getBoundingClientRect().width > 0 &&
            !e.closest("[data-slot=preview-actions]") &&
            !e.parentElement.closest(".kl-frame") &&
            e.getBoundingClientRect().width < 300,
        )
        .map((e) => [
          String(e.className).split(" ").slice(0, 3).join("."),
          Math.round(e.getBoundingClientRect().width),
        ]),
    );
  ok("narrow 390px: regions reflow to the full width (no region under 300px)", thin.length === 0, thin);
  ok("no page errors", p.errs.length === 0, p.errs);
});

test("export carries the configuration and no diagnostics; reset and persistence", async ({ open, ok }) => {
  const { p, ctl } = await setup(open);
  await modes(p);
  await pick(p, "Theme", "Dark");
  await toggle(p, ctl, "Right to left");
  await toggle(p, ctl, "Narrow frame (390px)");
  // diagnostics are never exported; reset returns everything to default
  await toggle(p, ctl, "Slow motion ×8");
  await ctl.getByRole("button", { name: "Install config" }).click();
  const sheet = p.locator("[data-slot=sheet]");
  await sheet.waitFor();
  await sheet.getByRole("tab", { name: "CSS" }).click();
  const css = await sheet
    .locator("[data-testid=pg-code] pre:visible", { hasText: ":root {" })
    .first()
    .textContent({ timeout: 5000 });
  ok(
    "export: CSS carries the chosen tokens and nothing diagnostic",
    /--kl-cut: 1;/.test(css) && /IBM Plex/.test(css) && !/slow|1120ms|rtl|390/i.test(css),
    css,
  );
  await sheet.getByRole("tab", { name: "Runtime scope" }).click();
  const runtime = await sheet
    .locator("[data-testid=pg-code] pre:visible", { hasText: "KeylineConfigScope" })
    .first()
    .textContent({ timeout: 5000 });
  ok(
    "export: runtime snippet carries the configuration, not the diagnostics",
    /"cut": "full"/.test(runtime) && !/slow|rtl|narrow|compare/i.test(runtime),
    runtime,
  );
  await sheet.getByRole("tab", { name: "shadcn CLI" }).click();
  const [dl] = await Promise.all([
    p.waitForEvent("download"),
    sheet.getByRole("button", { name: "Download keyline-config.json" }).click(),
  ]);
  const item = JSON.parse(readFileSync(await dl.path(), "utf8"));
  ok(
    "export: downloaded registry item carries all 10 tokens and the font package",
    Object.keys(item.css[":root"] ?? {}).length === 10 &&
      item.dependencies.includes("@fontsource-variable/ibm-plex-sans"),
    item,
  );
  ok(
    "export: no development URL in CSS, runtime snippet or registry item",
    !/localhost|127\.0\.0\.1|:529\d/.test(css + runtime + JSON.stringify(item)),
  );
  await p.keyboard.press("Escape");
  await sheet.waitFor({ state: "detached" }).catch(() => {});
  await idle(p);
  await ctl.getByRole("button", { name: "Reset" }).click();
  ok("reset: back to the default badge", (await ctl.getByText("DEFAULT", { exact: true }).count()) === 1);
  const stored = await p.evaluate(() => localStorage.getItem("keyline.playground.v1"));
  ok(
    "persistence: the stored configuration is the default after reset",
    stored && JSON.parse(stored).cut === "off" && JSON.parse(stored).font === "atkinson",
    stored,
  );
  ok("no page errors", p.errs.length === 0, p.errs);
});
