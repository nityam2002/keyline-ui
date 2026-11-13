// Scroll edges on overflowing rows (tabs, segmented, toggle group, nav): data-kl-more marks, no rubber band or
// bar, the browser-driven edge shadows (pinned, inert, taking no room, graded ink), keyboard scrolling; RTL.
import { test } from "./fixtures.mjs";
import { until } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["participants", "edges"] });

const READY = "#participants form";

// The shadows are on the scrollport's edges after a scroll, put there by the browser (a scroll timeline,
// or sticky where there is none), never by script on the scroll event (that lagged a frame behind the cells),
// and they take no room in the row (its scroll width is the cells' alone)
const pinned = (row) =>
  row.evaluate(async (e) => {
    const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const max = e.scrollWidth - e.clientWidth,
      rtl = getComputedStyle(e).direction === "rtl",
      out = [];
    const fades = [...e.querySelectorAll(":scope > .kl-more-fade")];
    const cs = getComputedStyle(e),
      pr = e.getBoundingClientRect();
    const L = pr.left + parseFloat(cs.borderLeftWidth),
      R = pr.right - parseFloat(cs.borderRightWidth);
    for (const f of [0.25, 0.5, 0.75]) {
      e.scrollLeft = (rtl ? -1 : 1) * Math.round(max * f);
      await frame();
      const [st, en] = ["start", "end"].map((k) => fades.find((x) => x.dataset.klFade === k).getBoundingClientRect());
      const s0 = rtl ? R - st.right : st.left - L,
        e0 = rtl ? en.left - L : R - en.right;
      out.push(Math.max(Math.abs(s0), Math.abs(e0)));
    }
    const byBrowser = fades.every((x) => {
      const c = getComputedStyle(x);
      return !x.getAttribute("style") && (c.animationTimeline.includes("scroll") || c.position === "sticky");
    });
    const sw = e.scrollWidth;
    fades.forEach((x) => (x.style.display = "none"));
    const bare = e.scrollWidth;
    fades.forEach((x) => x.removeAttribute("style"));
    e.scrollLeft = 0;
    return { off: Math.max(...out), byBrowser, sw, bare };
  });

test("edges: marks, no rubber band or bar, pinned shadows, keyboard scrolling", async ({ open, ok }) => {
  const p = await open({ ready: READY });
  const sec = p.locator("#edges");
  await sec.scrollIntoViewIfNeeded();
  const tabs = sec.locator("[data-slot=tabs-list]").first();
  const more = () => tabs.getAttribute("data-kl-more");
  await until(async () => (await more()) !== null);
  ok("edges: a row with hidden items marks its end (data-kl-more=end)", (await more()) === "end", await more());
  // No rubber band (it dragged the shadow off the edge) and no bar (the shadow is the cue)
  const ov = await tabs.evaluate((e) => {
    const c = getComputedStyle(e);
    return {
      ob: c.overscrollBehaviorX,
      sw: c.scrollbarWidth,
      bar: e.offsetHeight - e.clientHeight - parseFloat(c.borderTopWidth) - parseFloat(c.borderBottomWidth),
    };
  });
  ok("edges: an overflowing row does not rubber-band and shows no scrollbar", ov.ob === "none" && ov.bar === 0, ov);
  // An ink shadow cast inward from the hidden edge, eased, inside the padding box (the border is
  // kept), pinned to the visible edge
  const fade = await tabs.evaluate((e) => {
    const f = e.querySelector('.kl-more-fade[data-kl-fade="end"]'),
      c = getComputedStyle(f);
    const probe = document.createElement("span");
    probe.style.color = "var(--kl-cell)";
    e.append(probe);
    const cell = getComputedStyle(probe).color;
    probe.remove();
    const r = f.getBoundingClientRect(),
      pr = e.getBoundingClientRect(),
      bw = parseFloat(getComputedStyle(e).borderRightWidth);
    return {
      op: c.opacity,
      bg: c.backgroundImage,
      cell,
      mask: getComputedStyle(e).maskImage,
      gap: Math.round(pr.right - bw - r.right),
      hidden: f.getAttribute("aria-hidden"),
      pe: c.pointerEvents,
      border: getComputedStyle(e).borderTopWidth,
    };
  });
  ok(
    "edges: the end fade shows, inert (aria-hidden, no pointer events), flush with the visible edge",
    fade.op === "1" && fade.hidden === "true" && fade.pe === "none" && Math.abs(fade.gap) <= 1,
    fade,
  );
  for (const sel of ["[data-slot=tabs-list]", "[data-slot=segmented]", "[data-slot=toggle-group]"]) {
    const row = sec.locator(sel).first();
    if (!(await row.count())) continue;
    const pn = await pinned(row);
    ok(
      `edges: ${sel} scrolled, the browser keeps its shadows on the edges, and they take no room`,
      pn.off <= 1 && pn.byBrowser && pn.sw === pn.bare,
      pn,
    );
  }
  ok(
    "edges: a dark shadow (black at an alpha, not the row's surface), with graded stops into transparent",
    !fade.bg.includes(`${fade.cell} 0%`) &&
      /(oklch\(0 0 0 \/ 0\.[1-9]|rgba\(0, 0, 0, 0\.[1-9])/.test(fade.bg) &&
      (fade.bg.match(/%/g) || []).length >= 5 &&
      /transparent|\/ 0\)|rgba\(0, 0, 0, 0\)/.test(fade.bg),
    [fade.cell, fade.bg.slice(0, 160)],
  );
  ok(
    "edges: no mask (a mask can only fade to transparent) and the frame border is kept",
    (fade.mask === "none" || fade.mask === "") && fade.border === "2px",
    fade,
  );
  await tabs.evaluate((e) => (e.scrollLeft = 60));
  await until(async () => (await more()) === "start end");
  ok("edges: scrolled partway, both edges are marked", (await more()) === "start end", await more());
  await tabs.getByRole("tab").first().focus();
  await p.keyboard.press("End");
  await until(async () => (await more()) === "start");
  ok(
    "edges: End moves to the last tab, which scrolls in; only the start is marked",
    (await more()) === "start",
    await more(),
  );
  const rows = [
    ["toggle group", "[data-slot=toggle-group]"],
    ["segmented", "[data-slot=segmented]"],
    ["nav row", "[data-slot=nav-list]"],
  ];
  await until(async () => {
    for (const [, sel] of rows)
      if ((await sec.locator(sel).first().getAttribute("data-kl-more")) !== "end") return false;
    return true;
  });
  for (const [name, sel] of rows)
    ok(
      `edges: the ${name} marks its hidden end`,
      (await sec.locator(sel).first().getAttribute("data-kl-more")) === "end",
      await sec.locator(sel).first().getAttribute("data-kl-more"),
    );
  ok(
    "edges: a row that fits is not marked",
    (await sec.locator("[data-slot=tabs-list]").nth(1).getAttribute("data-kl-more")) === null,
    null,
  );
  ok("specimen: no page errors", p.errs.length === 0, p.errs);
});

test("edges (rtl, reduced motion): logical end, pinned shadows, scrolled to the end", async ({ open, ok }) => {
  const q = await open({ q: "dir=rtl&motion=reduce", ready: READY });
  const tabs = q.locator("#edges [data-slot=tabs-list]").first();
  await tabs.scrollIntoViewIfNeeded();
  const more = () => tabs.getAttribute("data-kl-more");
  await until(async () => (await more()) !== null);
  ok("rtl: the hidden edge is the logical end", (await more()) === "end", await more());
  const rp = await pinned(tabs);
  ok(
    "rtl: scrolled, the browser keeps the shadows on the edges, and they take no room",
    rp.off <= 1 && rp.byBrowser && rp.sw === rp.bare,
    rp,
  );
  await tabs.evaluate((e) => (e.scrollLeft = -(e.scrollWidth - e.clientWidth)));
  await until(async () => (await more()) === "start");
  ok("rtl: scrolled to the end, only the start is marked", (await more()) === "start", await more());
});
