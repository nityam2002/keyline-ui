// The focus edge on text-entry frames, light and dark: the frame's own edge is the only
// indicator; it appears for keyboard and editable focus, not after a pointer choice returns focus to a trigger; it
// does not move anything; it is distinct from open (inverse caret) and invalid (red border).
import { test, idle, settle } from "./fixtures.mjs";
import { until } from "./lib/flow.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["field", "select", "async"] });

/** State of focus: the active element, its edge (if any) and every outline drawn from it up to the edge. */
const state = (p) =>
  p.evaluate(() => {
    const a = document.activeElement;
    const edge = a?.closest(".kl-edge");
    const tr = (c) => c === "rgba(0, 0, 0, 0)" || c === "transparent";
    const outlines = [];
    for (let e = a; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0)
        outlines.push(String(e.className).slice(0, 40));
      if (e === edge) break;
    }
    let band = null,
      border = null,
      frameRect = null;
    if (edge) {
      const b = getComputedStyle(edge, "::before");
      band = tr(b.borderTopColor) ? null : b.borderTopColor;
      border = getComputedStyle(edge).borderTopColor;
      const r = edge.getBoundingClientRect();
      frameRect = [r.x, r.y, r.width, r.height].map(Math.round);
    }
    return {
      tag: a?.tagName,
      cls: String(a?.className || ""),
      slot: a?.getAttribute("data-slot"),
      edge: edge
        ? String(edge.className)
            .split(" ")
            .find((c) => /select|dr-|ms-|tf-|part|field-frame/.test(c) && c !== "kl-field-frame") || "kl-field-frame"
        : null,
      band,
      border,
      outlines,
      frameRect,
      layout: edge?.getAttribute("data-kl-layout"),
    };
  });
const bandOn = (s) => !!s.band;
const oneIndicator = (s) => s.outlines.length === 0;

async function go(open, route, theme) {
  const p = await open({
    route,
    width: 1280,
    height: 900,
    ready: route === "app" ? ".kl-tf-search input" : ".kl-field-input",
  });
  await p.evaluate((t) => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(t);
  }, theme);
  await settle(p);
  await idle(p).catch(() => {});
  return p;
}

for (const theme of ["light", "dark"]) {
  test(`focus edge (${theme}): text field — click, typing, Tab away and back, invalid`, async ({ open, ok }) => {
    const p = await go(open, "specimen", theme);
    // 1. text field: pointer click → edge (caret is there), no outline anywhere, frame does not move
    const weight = p.locator(".kl-field-input[data-align=end]").first();
    await weight.scrollIntoViewIfNeeded();
    const before = await weight.evaluate((e) => {
      const r = e.closest(".kl-edge").getBoundingClientRect();
      return [r.x, r.y, r.width, r.height].map(Math.round);
    });
    await weight.click();
    let s = await state(p);
    ok("field: click shows the edge", bandOn(s), s);
    ok("field: edge is the only indicator (no outline)", oneIndicator(s), s.outlines);
    ok("field: edge recolours the frame border to the band colour", s.border === s.band, [s.border, s.band]);
    ok("field: no layout shift", JSON.stringify(before) === JSON.stringify(s.frameRect), [before, s.frameRect]);
    await p.keyboard.type("5");
    s = await state(p);
    ok("field: typing keeps the edge", bandOn(s), s);
    // Shift+Tab leaves → edge gone; Tab returns → edge back
    await p.keyboard.press("Shift+Tab");
    s = await state(p);
    ok(
      "field: Shift+Tab away removes the edge from the field",
      !(s.edge === "kl-field-frame" && s.frameRect?.join() === before.join()),
      s,
    );
    await p.keyboard.press("Tab");
    s = await state(p);
    ok("field: Tab back shows the edge", bandOn(s) && oneIndicator(s), s);
    // 2. invalid + focus: red border kept, band is the focus colour
    await weight.evaluate((e) => e.closest(".kl-field").setAttribute("data-invalid", ""));
    await weight.click();
    s = await state(p);
    ok("invalid: border stays attention, band is focus (distinct)", bandOn(s) && s.border !== s.band, [
      s.border,
      s.band,
    ]);
  });

  test(`focus edge (${theme}): select — open caret, pointer choice, Tab, arrows, Escape`, async ({ open, ok }) => {
    const p = await go(open, "specimen", theme);
    // 3. select: pointer choice returns focus to the trigger without an edge
    const trig = p.locator("[data-slot=select-trigger]:not([data-disabled])").first();
    await trig.scrollIntoViewIfNeeded();
    await trig.click();
    await p.waitForSelector("[data-slot=select-item]");
    await idle(p);
    let s = await state(p);
    const caretOpen = await trig.evaluate(
      (t) => getComputedStyle(t.querySelector("[data-slot=select-icon]")).backgroundColor,
    );
    ok(
      "select: open is shown by the caret cell, not an edge on the trigger",
      !(s.edge?.includes("select") && bandOn(s)) && caretOpen !== "rgba(0, 0, 0, 0)",
      { s, caretOpen },
    );
    await p.locator("[data-slot=select-item]").nth(1).click();
    await until(() => p.evaluate(() => document.activeElement?.getAttribute("data-slot") === "select-trigger"));
    await idle(p);
    s = await state(p);
    ok(
      "select: after a pointer choice, focus is on the trigger with no edge or ring",
      s.slot === "select-trigger" && !bandOn(s) && oneIndicator(s),
      s,
    );
    // keyboard: Tab off and back → edge; Enter opens, arrows move, Escape returns with edge
    await p.keyboard.press("Shift+Tab");
    await p.keyboard.press("Tab");
    s = await state(p);
    ok("select: Tab to trigger shows the edge", s.slot === "select-trigger" && bandOn(s) && oneIndicator(s), s);
    await p.keyboard.press("Enter");
    await p.waitForSelector("[data-slot=select-item]");
    await idle(p);
    await p.keyboard.press("ArrowDown");
    const hl = await p.evaluate(() => !!document.querySelector("[data-slot=select-item][data-highlighted]"));
    ok("select: arrows move the ink cursor in the popup", hl, hl);
    await p.keyboard.press("Escape");
    await until(() => p.evaluate(() => document.activeElement?.getAttribute("data-slot") === "select-trigger"));
    await idle(p);
    s = await state(p);
    ok("select: Escape restores focus to the trigger with the edge", s.slot === "select-trigger" && bandOn(s), s);
  });

  test(`focus edge (${theme}): multiselect — input, popup navigation, chip focus`, async ({ open, ok }) => {
    const p = await go(open, "specimen", theme);
    // 4. multiselect: click input → edge + open caret; ArrowLeft to a chip → still one edge, chip is ink, no ring
    const ms = p
      .locator(
        "[data-slot=multiselect]:not(:has([data-slot=combobox-input-group][data-disabled])) [data-slot=combobox-input]",
      )
      .first();
    await ms.scrollIntoViewIfNeeded();
    await ms.click();
    await idle(p);
    let s = await state(p);
    ok("multiselect: click shows one edge", bandOn(s) && oneIndicator(s), s);
    await p.keyboard.press("ArrowDown");
    s = await state(p);
    ok("multiselect: popup navigation keeps focus in the input and the edge on", s.tag === "INPUT" && bandOn(s), s);
    await p.keyboard.press("Escape");
    await idle(p);
    await p.keyboard.press("ArrowLeft");
    await until(() => p.evaluate(() => document.activeElement?.getAttribute("data-slot") === "combobox-chip"), 1000);
    await idle(p);
    s = await state(p);
    const chip = await p.evaluate(() => {
      const a = document.activeElement;
      return a?.getAttribute("data-slot") === "combobox-chip" ? getComputedStyle(a).backgroundColor : null;
    });
    if (chip) {
      ok("multiselect: chip focus keeps one edge on the frame, no chip ring", bandOn(s) && oneIndicator(s), s);
      ok(
        "multiselect: focused chip is the ink cursor, not yellow",
        chip !==
          (await p.evaluate(
            () =>
              getComputedStyle(document.querySelector("[data-slot=combobox-chip]:not(:focus)") || document.body)
                .backgroundColor,
          )),
        chip,
      );
    } else ok("multiselect: ArrowLeft focuses a chip", false, s);
  });

  test(`focus edge (${theme}): table search cell`, async ({ open, ok }) => {
    const p = await go(open, "app", theme);
    // 5. table search (a cell): click → flush band inside the cell, no outline
    const search = p.locator(".kl-tf-search input").first();
    await search.click();
    let s = await state(p);
    const flush = await p.evaluate(() => {
      const c = document.querySelector(".kl-tf-search");
      const b = getComputedStyle(c, "::before");
      return b.top === "0px" && b.left === "0px";
    });
    ok("search cell: band flush on the cell's keylines, no outline", bandOn(s) && oneIndicator(s) && flush, s);
    await p.keyboard.press("Tab");
    s = await state(p);
    ok("search cell: Tab onward removes it", !(s.edge || "").includes("tf-search"), s);
  });

  test(`focus edge (${theme}): date trigger and field group part`, async ({ open, ok }) => {
    const p = await go(open, "specimen", theme);
    // 6. date picker: keyboard open, Escape restores focus to its trigger with the edge
    const dt = p.locator(".kl-dr-trigger").first();
    await dt.scrollIntoViewIfNeeded();
    await dt.focus();
    await p.keyboard.press("Shift+Tab");
    await p.keyboard.press("Tab");
    let s = await state(p);
    ok("date trigger: Tab shows the edge", bandOn(s) && oneIndicator(s), s);
    await p.keyboard.press("Enter");
    await until(() => p.evaluate(() => !!document.activeElement?.closest("[role=grid], [role=dialog]")));
    await idle(p);
    await p.keyboard.press("Escape");
    await until(() => p.evaluate(() => document.activeElement?.classList.contains("kl-dr-trigger")));
    await idle(p);
    s = await state(p);
    ok("date trigger: Escape returns focus with the edge", s.cls.includes("kl-dr-trigger") && bandOn(s), s);
    // 7. field group part: the part gets the band, the group frame does not draw one too
    const part = p.locator(".kl-field-part input").first();
    if (await part.count()) {
      await part.scrollIntoViewIfNeeded();
      await part.click();
      s = await state(p);
      const groupBand = await part.evaluate((i) => {
        const g = i.closest("[data-slot=field-group-frame]");
        const b = getComputedStyle(g, "::before");
        return { content: b.content, outline: getComputedStyle(g).outlineStyle };
      });
      ok(
        "field group: one band, on the focused part",
        bandOn(s) && s.edge.includes("part") && groupBand.content === "none" && groupBand.outline === "none",
        { s, groupBand },
      );
    }
  });
}
