// The shell's sidebar on the shipments block: brand identity block, labelled groups, the key column and its
// full-height seam, the current item's ink key, the footer pinned to the viewport's bottom, the rail with
// tooltips on hover and focus, the narrow sheet, RTL.
import { test, idle, stable } from "./fixtures.mjs";

const H = 820;

for (const q of ["theme=light", "theme=dark&density=compact&cut=off", "dir=rtl"]) {
  test(`shell sidebar: open column (${q})`, async ({ open, ok }) => {
    const p = await open({ route: "app", q, width: 1280, height: H, ready: ".kl-shell-h" });
    const nav = p.getByRole("navigation", { name: "Main" });
    const col = p.locator(".kl-shell-nav");
    await stable(col);
    // groups
    const ops = nav.getByRole("list", { name: "Operations" });
    ok(
      `${q}: groups are lists named by their labels (Operations 3, Billing 1)`,
      (await ops.getByRole("link").count()) === 3 &&
        (await nav.getByRole("list", { name: "Billing" }).getByRole("link").count()) === 1,
      null,
    );
    // brand block
    const brand = await col.locator(".kl-nav-h").evaluate((h) => {
      const s = getComputedStyle(h);
      return [
        s.backgroundColor,
        s.color,
        getComputedStyle(document.querySelector(".kl-shell-nav")).getPropertyValue("--kl-inverse"),
        h.textContent,
      ];
    });
    ok(
      `${q}: the header is the ink brand block (Freightdesk, RTM · Rotterdam)`,
      brand[0] !== "rgba(0, 0, 0, 0)" && /Freightdesk/.test(brand[3]) && /RTM · Rotterdam/.test(brand[3]),
      brand,
    );
    // key column
    const keys = await col.locator(".kl-nav-ic").evaluateAll((xs) =>
      xs.map((x) => {
        const r = x.getBoundingClientRect();
        return [Math.round(r.width), Math.round(r.left), Math.round(r.right)];
      }),
    );
    ok(
      `${q}: every item has a 44px key cell, all in one column`,
      keys.length === 4 && keys.every((k) => k[0] === 44 && k[1] === keys[0][1]),
      keys,
    );
    const rtl = q.includes("rtl");
    const navBox = await col.boundingBox();
    ok(
      `${q}: the key column is at the reading start (${rtl ? "right" : "left"})`,
      rtl ? Math.abs(keys[0][2] - (navBox.x + navBox.width - 3)) <= 2 : Math.abs(keys[0][1] - (navBox.x + 3)) <= 2,
      { keys: keys[0], navBox },
    );
    // the current item's key is ink on the cobalt band (the band's own ink column; the cell stays transparent)
    const cur = await nav.locator("[aria-current=page] .kl-nav-ic").evaluate((x) => {
      const band = x.closest("[data-kl-stretch]").querySelector(":scope > [data-kl-band]");
      const bs = getComputedStyle(band),
        r = x.getBoundingClientRect(),
        br = band.getBoundingClientRect();
      const ink = parseFloat(bs.backgroundSize);
      const inkL = bs.backgroundPositionX === "100%" ? br.right - ink : br.left;
      return {
        cell: getComputedStyle(x).backgroundColor,
        ink,
        under: r.left >= inkL - 1 && r.right <= inkL + ink + 1 && r.top >= br.top - 1 && r.bottom <= br.bottom + 1,
        inkColour: bs.backgroundImage.match(/oklch\([^)]*\)|rgb[a]?\([^)]*\)/)?.[0],
        band: bs.backgroundColor,
      };
    });
    ok(
      `${q}: the current item's key cell sits under ink, distinct from the band (the band's own ink column)`,
      cur.cell === "rgba(0, 0, 0, 0)" && cur.ink === 44 && cur.under && cur.inkColour && cur.inkColour !== cur.band,
      cur,
    );
    // column to the viewport bottom; footer in view
    const foot = await col.locator(".kl-nav-f").boundingBox();
    ok(
      `${q}: the column reaches the viewport's bottom (one gutter) and the footer is in view`,
      Math.abs(navBox.y + navBox.height - (H - 16)) <= 18 && foot.y + foot.height <= H,
      { navBottom: navBox.y + navBox.height, foot },
    );
    await p.mouse.wheel(0, 600);
    await p
      .waitForFunction(
        () =>
          scrollY > 0 ||
          document.scrollingElement.scrollTop > 0 ||
          [...document.querySelectorAll("*")].some((e) => e.scrollTop > 0),
        null,
        { timeout: 3000 },
      )
      .catch(() => {});
    await stable(col);
    const nb2 = await col.boundingBox();
    ok(
      `${q}: after scrolling the column is sticky and still ends at the viewport's bottom`,
      nb2.y >= 0 && Math.abs(nb2.y + nb2.height - (H - 16)) <= 18,
      nb2,
    );
    ok(`${q}: no page errors`, p.errs.length === 0, p.errs);
  });
}

test("shell sidebar: the rail (collapse, names, tooltips on hover and focus, expand)", async ({ open, ok, eng }) => {
  const p = await open({ route: "app", width: 1280, height: H, ready: ".kl-shell-h" });
  const toggle = p.locator(".kl-shell-toggle");
  const col = p.locator(".kl-shell-nav");
  const tooltip = p.locator("[data-slot=tooltip]");
  ok(
    "rail: the toggle says Collapse navigation and is expanded",
    (await toggle.getAttribute("aria-label")) === "Collapse navigation" &&
      (await toggle.getAttribute("aria-expanded")) === "true",
    await toggle.getAttribute("aria-label"),
  );
  await toggle.click();
  await p
    .waitForFunction(() => Math.round(document.querySelector(".kl-shell-nav").getBoundingClientRect().width) <= 60)
    .catch(() => {});
  await idle(p);
  await stable(col);
  const w = (await col.boundingBox()).width;
  ok("rail: collapse keeps a 56px column of key cells", Math.round(w) === 56, w);
  ok(
    "rail: the toggle now says Expand navigation, not expanded",
    (await toggle.getAttribute("aria-label")) === "Expand navigation" &&
      (await toggle.getAttribute("aria-expanded")) === "false",
    null,
  );
  const nav = p.getByRole("navigation", { name: "Main" });
  ok(
    "rail: items keep their names (label + count)",
    (await nav.getByRole("link", { name: /^Carriers\s*9$/ }).count()) === 1,
    await nav.getByRole("link").allTextContents(),
  );
  const vis = await nav
    .locator(".kl-nav-l")
    .first()
    .evaluate((x) => x.getBoundingClientRect().width);
  ok("rail: labels are visually hidden", vis <= 1, vis);
  const cur = await nav
    .locator("[aria-current=page] .kl-nav-ic")
    .evaluate((x) => [getComputedStyle(x).backgroundColor, getComputedStyle(x).color]);
  ok("rail: the current item shows the cobalt band (its key cell is transparent)", cur[0] === "rgba(0, 0, 0, 0)", cur);
  await nav.getByRole("link", { name: /^Carriers/ }).hover();
  const carriersTip = tooltip.filter({ hasText: /Carriers\s*9/ });
  await carriersTip.waitFor({ state: "visible", timeout: 3000 }).catch(() => {});
  ok("rail: hovering an item shows its label and count beside it", await carriersTip.isVisible(), null);
  await p.mouse.move(700, 700);
  await carriersTip.waitFor({ state: "hidden", timeout: 3000 }).catch(() => {});
  await toggle.focus();
  let inRail = false,
    n = 0;
  while (!inRail && n++ < 20) {
    // WebKit on macOS skips links on Tab by default; Alt+Tab is the platform's all-controls key
    await p.keyboard.press(eng === "webkit" ? "Alt+Tab" : "Tab");
    inRail = await p.evaluate(() => !!document.activeElement?.closest(".kl-shell-nav"));
  }
  const shipTip = tooltip.filter({ hasText: "Shipments" });
  await shipTip.waitFor({ state: "visible", timeout: 3000 }).catch(() => {});
  await idle(p);
  const name = await p.evaluate(() => document.activeElement?.textContent?.trim());
  ok(
    "rail: Tab reaches the rail's current item, and keyboard focus shows its tooltip",
    /Shipments/.test(name) && (await shipTip.isVisible()),
    { name, n },
  );
  const tip = await tooltip.last().boundingBox();
  ok("rail: the tooltip sits beside the rail, outside its frame", tip && tip.x >= 16 + 56, tip);
  await p.keyboard.press("Escape");
  const dock = nav.getByRole("link", { name: /^Dock schedule/ });
  await dock.click();
  await p
    .waitForFunction(
      () =>
        [...document.querySelectorAll(".kl-shell-nav a")].some(
          (a) => a.textContent.trim().startsWith("Dock schedule") && a.getAttribute("aria-current") === "page",
        ),
      null,
      { timeout: 3000 },
    )
    .catch(() => {});
  ok("rail: choosing an item moves the current item", (await dock.getAttribute("aria-current")) === "page", null);
  await toggle.click();
  await p
    .waitForFunction(() => Math.round(document.querySelector(".kl-shell-nav").getBoundingClientRect().width) >= 200)
    .catch(() => {});
  await idle(p);
  await stable(col);
  ok(
    "rail: expand restores the full column",
    Math.round((await col.boundingBox()).width) === 208,
    (await col.boundingBox()).width,
  );
  ok("no page errors (rail)", p.errs.length === 0, p.errs);
});

test("shell sidebar: the narrow sheet (390px)", async ({ open, ok }) => {
  const p = await open({ route: "app", width: 390, height: 760, ready: ".kl-shell-h" });
  await p.locator(".kl-shell-toggle").click();
  const sheet = p.getByRole("dialog", { name: "Navigation" });
  await sheet.waitFor({ state: "visible" });
  await idle(p);
  await stable(sheet.locator(".kl-nav-f"));
  ok(
    "sheet: the sidebar opens as a sheet with both groups and the footer",
    (await sheet.getByRole("list", { name: "Operations" }).count()) === 1 &&
      (await sheet.getByText("Mila Jansen").isVisible()),
    null,
  );
  const f = await sheet.locator(".kl-nav-f").boundingBox();
  ok("sheet: the footer sits at the sheet's bottom", f && Math.abs(f.y + f.height - 760) <= 4, f);
  ok(
    "sheet: labels are not a rail there (visible)",
    (await sheet
      .locator(".kl-nav-l")
      .first()
      .evaluate((x) => x.getBoundingClientRect().width)) > 40,
    null,
  );
  await sheet.getByRole("link", { name: /^Invoices/ }).click();
  await p
    .getByRole("dialog", { name: "Navigation" })
    .waitFor({ state: "detached", timeout: 3000 })
    .catch(() => {});
  ok(
    "sheet: choosing an item closes the sheet",
    (await p.getByRole("dialog", { name: "Navigation" }).count()) === 0,
    null,
  );
  ok("no page errors (sheet)", p.errs.length === 0, p.errs);
});
