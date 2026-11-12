// Toolbar overflow (from r14): the More item (fit, order, kept items, state in the menu, focus, growth, RTL, the
// label trigger), toolbar item signals, and forced colours.
import { test, idle } from "./fixtures.mjs";
import { poll, rowItems, fits, menuRows, focusName14 as focusedName, lastMenu, stableBox } from "./lib/probes-c.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["toolbar-overflow", "multi-sort"] });

const READY = "[data-testid=specimen-overflow]";

async function setup(open, q = "") {
  const p = await open({ q, ready: READY });
  const sp = p.getByTestId("specimen-overflow");
  await sp.scrollIntoViewIfNeeded();
  const tb = p.getByTestId("ov-tb");
  return { p, sp, tb };
}

test("overflow: widths, the More menu's rows and state, growing back", async ({ open, ok }) => {
  const { p, sp, tb } = await setup(open);
  // the width change re-measures through a ResizeObserver: read the row until it shows the expected shape
  const setW = async (label, pred) => {
    await sp.getByRole("radio", { name: label }).click();
    return poll(() => rowItems(tb), pred, 3000);
  };
  let items = await rowItems(tb);
  ok(
    "overflow: wide, every item is in the row and there is no More item",
    items.length === 8 && !items.some((i) => i.more) && (await fits(tb)),
    items.map((i) => i.name),
  );
  ok(
    "overflow: the toolbar spans its line (width auto) and stays one Tab stop",
    (await tb.evaluate((t) => [...t.querySelectorAll("button, a, input")].filter((e) => e.tabIndex === 0).length)) ===
      1,
    null,
  );

  items = await setW(
    "560px",
    (it) =>
      it.some((i) => i.more) &&
      it.every((i) => i.inside) &&
      it[it.length - 1].name === "Publish" &&
      !it.some((i) => i.name === "Help"),
  );
  const moreAt = items.findIndex((i) => i.more);
  ok(
    "overflow 560px: a More item appears and every item left fits inside the frame",
    moreAt > 0 && items.every((i) => i.inside) && (await fits(tb)),
    items,
  );
  ok(
    "overflow 560px: items leave from the end; the primary stays last",
    items[items.length - 1].name === "Publish" && moreAt === items.length - 2 && !items.some((i) => i.name === "Help"),
    items.map((i) => i.name),
  );
  ok(
    "overflow 560px: the More item is named and announces a menu",
    (await tb.locator(".kl-tb-overflow").getAttribute("aria-label")) === "More" &&
      (await tb.locator(".kl-tb-overflow").getAttribute("aria-haspopup")) === "menu",
    null,
  );
  const seam = await tb.locator(".kl-tb-overflow").evaluate((e) => getComputedStyle(e).borderInlineStartWidth);
  ok("overflow: the More cell meets its neighbour on a 1px seam", seam === "1px", seam);

  items = await setW(
    "220px",
    (it) => it.map((i) => i.name).join("|") === "History|More|Publish" && it.every((i) => i.inside),
  );
  ok(
    "overflow 220px: the first group still fits; More and the primary follow it, all inside the frame",
    items.map((i) => i.name).join("|") === "History|More|Publish" && items.every((i) => i.inside),
    items.map((i) => i.name),
  );
  await p.getByTestId("ov-box").evaluate((e) => (e.style.width = "150px"));
  const at150 = async () => ({
    items: await rowItems(tb),
    redo: await tb.getByRole("button", { name: "Redo" }).count(),
  });
  const s150 = await poll(
    at150,
    (s) =>
      s.items.map((i) => i.name).join("|") === "History|More|Publish" && s.items.every((i) => i.inside) && s.redo === 0,
    3000,
  );
  items = s150.items;
  // a group gives up its items one at a time: Undo stays, Redo moves
  ok(
    "overflow 150px: History keeps Undo; More and the primary follow, all inside",
    items.map((i) => i.name).join("|") === "History|More|Publish" && items.every((i) => i.inside) && s150.redo === 0,
    items.map((i) => i.name),
  );

  // keyboard: one stop, arrows reach More, the menu holds the hidden items as rows with state
  await tb.locator(".kl-tb-overflow").focus();
  await p.keyboard.press("ArrowRight");
  ok("overflow: arrow keys move from More to the primary", (await focusedName(p)) === "Publish", await focusedName(p));
  await p.keyboard.press("ArrowLeft");
  await p.keyboard.press("Enter");
  await lastMenu(p);
  let rows = await menuRows(p);
  const names = rows?.filter((r) => r.role !== "separator" && r.role !== "presentation").map((r) => r.name);
  ok(
    "More menu: rows in the row's order (glyph items by their aria-label)",
    names && names.join("|") === "Redo|Wrap|List|Board|Map|Insert|Duplicate|Help",
    names,
  );
  ok(
    "More menu: a disabled item is a disabled row",
    rows.find((r) => r.name === "Redo")?.disabled === true,
    rows.find((r) => r.name === "Redo"),
  );
  ok(
    "More menu: an uncontrolled toggle is a checkbox row with its state (Wrap on)",
    rows.find((r) => r.name === "Wrap")?.role === "menuitemcheckbox" &&
      rows.find((r) => r.name === "Wrap")?.checked === "true",
    rows.find((r) => r.name === "Wrap"),
  );
  ok(
    "More menu: an exclusive group is radio rows (List checked)",
    rows
      .filter((r) => r.role === "menuitemradio")
      .map((r) => `${r.name}:${r.checked}`)
      .join(",") === "List:true,Board:false,Map:false",
    rows.filter((r) => r.role === "menuitemradio"),
  );
  ok(
    "More menu: a menu is a submenu row",
    (await p.locator("[role=menu] [role=menuitem][aria-haspopup=menu]").last().textContent()).includes("Insert"),
    null,
  );
  ok(
    "More menu: separators divide the groups",
    rows.filter((r) => r.role === "separator").length >= 2,
    rows.map((r) => r.role),
  );
  // change state from the menu
  await p.locator("[role=menu]").last().getByRole("menuitemcheckbox", { name: "Wrap" }).click();
  await p.locator("[role=menu]").last().getByRole("menuitemradio", { name: "Board" }).click();
  rows = await poll(
    () => menuRows(p),
    (r) =>
      r?.find((x) => x.name === "Wrap")?.checked === "false" && r?.find((x) => x.name === "Board")?.checked === "true",
    2000,
  );
  ok(
    "More menu: checking rows changes the items' state (Wrap off, Board chosen)",
    rows.find((r) => r.name === "Wrap")?.checked === "false" &&
      rows.find((r) => r.name === "Board")?.checked === "true",
    rows.filter((r) => /Wrap|Board/.test(r.name)),
  );
  const log = () => p.getByTestId("ov-log").innerText();
  const l1 = await poll(log, (t) => /wrap off · layout board/.test(t), 2000);
  ok("More menu: the owner hears it (onPressedChange, onValueChange)", /wrap off · layout board/.test(l1), l1);
  await p.locator("[role=menu]").last().getByRole("menuitem", { name: "Insert" }).hover();
  const checklist = p
    .locator("[role=menu]")
    .last()
    .getByRole("menuitem", { name: /Checklist/ });
  await checklist.waitFor({ state: "visible" });
  await stableBox(p.locator("[role=menu]").last());
  await checklist.click();
  const closed = async () => ({ log: await log(), menus: await p.locator("[role=menu]").count() });
  const c1 = await poll(closed, (s) => /Insert checklist/.test(s.log) && s.menus === 0, 3000);
  ok(
    "More menu: a submenu item runs its command, and the menus close",
    /Insert checklist/.test(c1.log) && c1.menus === 0,
    c1.log,
  );
  await tb.locator(".kl-tb-overflow").click();
  await lastMenu(p);
  await p
    .locator("[role=menu]")
    .last()
    .getByRole("menuitem", { name: /Duplicate/ })
    .click();
  const l2 = await poll(log, (t) => /Last command: Duplicate/.test(t), 2000);
  ok("More menu: a button row runs its onClick (Duplicate)", /Last command: Duplicate/.test(l2), l2);
  // the menu docks to the frame's bottom keyline at the end
  await p
    .locator("[role=menu]")
    .waitFor({ state: "detached" })
    .catch(() => {});
  await tb.locator(".kl-tb-overflow").click();
  await lastMenu(p);
  await idle(p);
  const dock = await p.evaluate(() => {
    const m = [...document.querySelectorAll("[role=menu]")].pop().getBoundingClientRect();
    const t = document.querySelector("[data-testid=ov-tb]").getBoundingClientRect();
    const o = document.querySelector(".kl-tb-overflow").getBoundingClientRect();
    return { top: m.top, tbB: t.bottom, mr: m.right, or: o.right };
  });
  ok(
    "More menu: docks on the toolbar's bottom keyline, end-aligned to the More cell",
    Math.abs(dock.top - (dock.tbB - 2)) <= 1.5 && Math.abs(dock.mr - dock.or) <= 1.5,
    dock,
  );
  await p.keyboard.press("Escape");
  const f1 = await poll(
    () => focusedName(p),
    (n) => n === "More",
    2000,
  );
  ok("More menu: Escape returns focus to More", f1 === "More", f1);

  // growing back: state survives the trip
  items = await setW("Fits", (it) => it.length === 8 && !it.some((i) => i.more));
  ok(
    "overflow: widened, every item returns and More goes",
    items.length === 8 && !items.some((i) => i.more),
    items.map((i) => i.name),
  );
  const wrapPressed = await tb.getByRole("button", { name: "Wrap" }).getAttribute("aria-pressed");
  const boardPressed = await tb.getByRole("button", { name: "Board" }).getAttribute("aria-pressed");
  ok(
    "overflow: back in the row, the toggles show the state set in the menu (Wrap off, Board on)",
    wrapPressed === "false" && boardPressed === "true",
    { wrapPressed, boardPressed },
  );
  const bandOf = () =>
    tb.evaluate((t) => {
      const bd = t.querySelector(".kl-tb-band");
      const btn = [...t.querySelectorAll("button")].find(
        (x) => x.querySelector(".kl-tb-label")?.textContent.trim() === "Board",
      );
      const a = bd.getBoundingClientRect();
      const c = btn.getBoundingClientRect();
      return { hidden: bd.hidden, dl: Math.round(a.left - c.left), dw: Math.round(a.width - c.width) };
    });
  await idle(p);
  await stableBox(tb.locator(".kl-tb-band"));
  const band = await poll(bandOf, (b) => !b.hidden && Math.abs(b.dl) <= 1 && Math.abs(b.dw) <= 2, 2000);
  ok(
    "overflow: the exclusive band sits on the chosen cell after the trip",
    !band.hidden && Math.abs(band.dl) <= 1 && Math.abs(band.dw) <= 2,
    band,
  );
  ok("no page errors (specimen)", p.errs.length === 0, p.errs);
});

test("overflow: focus on an item that leaves the row moves to More", async ({ open, ok }) => {
  const { p, sp, tb } = await setup(open);
  // focus on an item that leaves the row moves to More
  await tb.getByRole("link", { name: "Help" }).focus();
  await sp.getByRole("radio", { name: "380px" }).click();
  await tb.locator(".kl-tb-overflow").waitFor();
  // the Segmented press took focus; put it back on a soon-hidden item and shrink with the keyboard-free API
  await sp.getByRole("radio", { name: "Fits" }).click();
  await tb.getByRole("link", { name: "Help" }).waitFor({ state: "visible" });
  await poll(
    () => rowItems(tb),
    (it) => it.length === 8 && !it.some((i) => i.more),
    3000,
  );
  await tb.getByRole("link", { name: "Help" }).focus();
  await p.getByTestId("ov-box").evaluate((e) => (e.style.width = "380px"));
  const f = await poll(
    () => focusedName(p),
    (n) => n === "More",
    3000,
  );
  ok("overflow: when the focused item leaves the row, focus moves to More (not to the page)", f === "More", f);
  ok("no page errors (specimen)", p.errs.length === 0, p.errs);
});

test("overflow (label): the panel's input shrinks to its minimum before commands move", async ({ open, ok }) => {
  const { p } = await setup(open);
  // label trigger in a panel: the input shrinks to its minimum before commands move
  const pt = p.getByTestId("ov-panel").getByRole("toolbar");
  await p.getByTestId("ov-panel").evaluate((e) => (e.style.maxWidth = "330px"));
  const read = async () => ({
    items: await rowItems(pt),
    inputW: await pt
      .locator(".kl-tb-input")
      .evaluate((e) => [e.getBoundingClientRect().width, parseFloat(getComputedStyle(e).minWidth)]),
    fit: await fits(pt),
  });
  const s = await poll(
    read,
    (s) => s.items.some((i) => i.more && i.name.startsWith("Actions")) && s.inputW[0] >= s.inputW[1] - 1 && s.fit,
    3000,
  );
  const { items, inputW } = s;
  ok(
    "overflow (label): the input keeps at least its minimum; the commands move into a labelled item",
    items.some((i) => i.more && i.name.startsWith("Actions")) && inputW[0] >= inputW[1] - 1 && s.fit,
    { items, inputW },
  );
  ok("no page errors (specimen)", p.errs.length === 0, p.errs);
});

test("toolbar signals: pending, done, failed, idle; Publish runs pending then done", async ({ open, ok }) => {
  const { p, tb } = await setup(open);
  // signals
  const sg = p.getByTestId("ov-signals");
  await sg.scrollIntoViewIfNeeded();
  const pend = sg.getByRole("button", { name: "Saving" });
  ok(
    "signal pending: aria-busy, still focusable, a segment on the bottom keyline",
    (await pend.getAttribute("aria-busy")) === "true" &&
      (await pend.getAttribute("tabindex")) !== null &&
      (await pend.locator(".kl-pending").count()) === 1,
    null,
  );
  const slot = async (name, cls) =>
    sg
      .getByRole("button", { name })
      .locator(cls)
      .evaluate((e) => [e.hasAttribute("data-open"), e.getBoundingClientRect().width]);
  // the ✓ and ! cells open with a width transition: read them once they have opened
  const both = async () => ({ done: await slot("Saved", ".kl-tb-done"), failed: await slot("Retry", ".kl-tb-fail") });
  await idle(p);
  const { done, failed } = await poll(
    both,
    (s) => s.done[0] && s.done[1] > 20 && s.failed[0] && s.failed[1] > 20,
    3000,
  );
  ok(
    "signal done: the ✓ cell is open; failed: the ! cell is open at the start",
    done[0] && done[1] > 20 && failed[0] && failed[1] > 20,
    { done, failed },
  );
  const idleW = await tb
    .getByRole("button", { name: "Publish" })
    .locator(".kl-tb-done")
    .evaluate((e) => e.getBoundingClientRect().width);
  ok("signal idle: closed slots take no width", idleW === 0, idleW);
  const pub = tb.getByRole("button", { name: "Publish" });
  await pub.click();
  const busy = await poll(
    () => pub.getAttribute("aria-busy"),
    (v) => v === "true",
    2000,
    10,
  );
  ok("signal: Publish runs pending then done", busy === "true", null);
  const sig = await poll(
    () => pub.getAttribute("data-signal"),
    (v) => v === "done",
    4000,
  );
  ok("signal: done after the work", sig === "done", sig);
  ok("no page errors (specimen)", p.errs.length === 0, p.errs);
});

test("overflow RTL: More before the primary, menu end-aligned and RTL", async ({ open, ok }) => {
  const { p, sp, tb } = await setup(open, "dir=rtl");
  await sp.getByRole("radio", { name: "380px" }).click();
  const items = await poll(
    () => rowItems(tb),
    (it) => {
      const m = it.find((i) => i.more),
        pb = it.find((i) => i.name === "Publish");
      return m && pb && m.l > pb.l && it.every((i) => i.inside);
    },
    3000,
  );
  const more = items.find((i) => i.more);
  const pub = items.find((i) => i.name === "Publish");
  ok(
    "overflow RTL: More sits before the primary in reading order (to its right), all inside",
    more && pub && more.l > pub.l && items.every((i) => i.inside),
    items,
  );
  await tb.locator(".kl-tb-overflow").click();
  await lastMenu(p);
  await idle(p);
  const g = await p.evaluate(() => {
    const m = [...document.querySelectorAll("[role=menu]")].pop();
    const o = document.querySelector(".kl-tb-overflow").getBoundingClientRect();
    const r = m.getBoundingClientRect();
    return { dir: getComputedStyle(m).direction, ml: Math.round(r.left), ol: Math.round(o.left) };
  });
  ok(
    "overflow RTL: the menu is RTL and end-aligned (its left edge on the More cell's left)",
    g.dir === "rtl" && Math.abs(g.ml - g.ol) <= 2,
    g,
  );
  await p.keyboard.press("Escape");
});

test("toolbar forced colours: band, primary, pressed outline, fades, signals, focus ring, sorted headers", async ({
  open,
  ok,
  eng,
}) => {
  test.skip(eng !== "chromium", "Playwright emulates forced-colors in Chromium only (WebKit cannot emulate it)");
  const p = await open({ ctx: { forcedColors: "active" }, ready: READY });
  const sys = (name) =>
    p.evaluate((n) => {
      const d = document.createElement("div");
      d.style.cssText = `forced-color-adjust:none;background:${n}`;
      document.body.appendChild(d);
      const c = getComputedStyle(d).backgroundColor;
      d.remove();
      return c;
    }, name);
  const HL = await sys("Highlight");
  const BT = await sys("ButtonText");
  const tb = p.getByTestId("ov-tb");
  await tb.scrollIntoViewIfNeeded();
  await idle(p);
  const fc = await tb.evaluate((t) => {
    const band = t.querySelector(".kl-tb-band");
    const prim = t.querySelector("[data-kl-primary]");
    const wrap = [...t.querySelectorAll("button")].find(
      (x) => x.querySelector(".kl-tb-label")?.textContent.trim() === "Wrap",
    );
    return {
      band: getComputedStyle(band).backgroundColor,
      prim: getComputedStyle(prim).backgroundColor,
      wrapOutline: [getComputedStyle(wrap).outlineStyle, getComputedStyle(wrap).outlineWidth],
      fades: [...t.querySelectorAll(".kl-more-fade")].map((f) => getComputedStyle(f).display),
    };
  });
  ok("forced colours: the exclusive band is Highlight", fc.band === HL, { band: fc.band, HL });
  ok("forced colours: the primary item is ButtonText (inverse), not a lost cobalt", fc.prim === BT, {
    prim: fc.prim,
    BT,
  });
  ok(
    "forced colours: a pressed toggle carries a 3px outline (the flood is gone)",
    fc.wrapOutline[0] === "solid" && fc.wrapOutline[1] === "3px",
    fc.wrapOutline,
  );
  ok(
    "forced colours: edge fades are not drawn",
    fc.fades.every((d) => d === "none"),
    fc.fades,
  );
  const sg = await p
    .getByTestId("ov-signals")
    .evaluate((t) =>
      [...t.querySelectorAll(".kl-tb-done[data-open] > span > span, .kl-tb-fail[data-open] > span > span")].map(
        (e) => getComputedStyle(e).backgroundColor,
      ),
    );
  ok("forced colours: open ✓ and ! signal cells are Highlight", sg.length === 2 && sg.every((c) => c === HL), {
    sg,
    HL,
  });
  await tb.getByRole("button", { name: "Undo" }).focus();
  await p.keyboard.press("ArrowRight");
  await p.keyboard.press("ArrowLeft");
  const ring = await p.evaluate(() => {
    const a = document.activeElement;
    const s = getComputedStyle(a);
    return [s.outlineStyle, parseFloat(s.outlineWidth)];
  });
  ok("forced colours: the keyboard focus ring is drawn", ring[0] !== "none" && ring[1] >= 2, ring);
  const st = await p
    .getByTestId("specimen-sort")
    .locator("th[data-sort]")
    .evaluateAll((ths) => ths.map((t) => getComputedStyle(t).textDecorationLine));
  ok(
    "forced colours: every sorted header (each level) is underlined, not just tinted",
    st.length === 2 && st.every((d) => d.includes("underline")),
    st,
  );
});
