// Sidebar on the specimen: nested links (the band handed between parent and list frame by frame), row actions,
// the icon rail, the narrow start sheet, RTL, forced colours.
import { test, idle, stable, landed } from "./fixtures.mjs";
import { at, focused } from "./lib/section.mjs";
import { until } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["sidebar"] });

const VP = { width: 1440, height: 900 };
const shell = async (p) => (await at(p, "sidebar")).locator('[data-slot="app-shell"]');
// the band has landed and the folds have come to rest (both are animations on the document timeline)
const rest = async (p) => {
  await idle(p);
  await landed(p.locator("#sidebar [data-slot=nav-list] > [data-kl-band]").first());
};

test("sidebar: nested list and the band", async ({ open, ok }) => {
  const p = await open({ ...VP, ready: "#sidebar" });
  const s = await shell(p);
  const reports = s.getByRole("button", { name: "Reports" });
  ok(
    "sidebar: the nested list holding the current link starts open (aria-expanded, aria-controls)",
    (await reports.getAttribute("aria-expanded")) === "true" && !!(await reports.getAttribute("aria-controls")),
  );
  const cur = await s.locator('[aria-current="page"]').textContent();
  ok("sidebar: the current nested link is aria-current", cur?.includes("On-time"), cur);
  await reports.click();
  await rest(p);
  const rested = await reports.evaluate((el) => ({
    exp: el.getAttribute("aria-expanded"),
    covered: el.hasAttribute("data-kl-covered"),
    holds: el.hasAttribute("data-kl-holds"),
  }));
  ok(
    "sidebar: closing the list rests the band on its parent",
    rested.exp === "false" && rested.covered && rested.holds,
    rested,
  );
  await reports.hover();
  await idle(p);
  const hov = await reports.evaluate((el) => getComputedStyle(el).backgroundColor);
  ok(
    "sidebar: hovering the parent the band rests on keeps the band showing (no tint over it)",
    hov === "rgba(0, 0, 0, 0)" || hov === "transparent",
    hov,
  );
  // Frame by frame, the band and the covered colours stay on the selection while a list folds and
  // unfolds; nothing else is ever under the band or covered (rows inside a fold count only their visible part; the
  // band is measured as drawn, and the rows are the real ones, not the covered copy that rides in the band in flight)
  const frames = () =>
    p.evaluate(
      () =>
        new Promise((res) => {
          const list = document.querySelector("#sidebar [data-slot=nav-list]");
          const band = list.querySelector(":scope > [data-kl-band]");
          const out = [];
          const t0 = performance.now();
          const f = () => {
            const br = window.__klBand(band);
            const rows = [...list.querySelectorAll("[data-slot=nav-item]")]
              .filter((e) => !e.closest("[data-kl-ghost]"))
              .map((e) => {
                let { top, bottom } = e.getBoundingClientRect();
                const fold = e.closest("[data-slot=nav-fold]");
                if (fold) {
                  const fr = fold.getBoundingClientRect();
                  top = Math.max(top, fr.top);
                  bottom = Math.max(top, Math.min(bottom, fr.bottom));
                }
                return {
                  t: e.querySelector("[data-slot=nav-item-label]")?.textContent,
                  h: bottom - top,
                  ov: Math.min(br.bottom, bottom) - Math.max(br.top, top),
                  c: e.hasAttribute("data-kl-covered"),
                };
              })
              .filter((r) => r.h > 0);
            out.push({
              under: rows.filter((r) => r.ov > r.h * 0.25).map((r) => r.t),
              cov: rows.filter((r) => r.c).map((r) => r.t),
            });
            // timing: samples every frame for 650 ms, the whole fold/unfold
            if (performance.now() - t0 < 650) requestAnimationFrame(f);
            else res(out);
          };
          requestAnimationFrame(f);
        }),
    );
  const sweep = async (allowed) => {
    const r = frames();
    await reports.click();
    const out = await r;
    return out.filter((o) => [...o.under, ...o.cov].some((t) => !allowed.includes(t)));
  };
  let bad = await sweep(["Reports", "On-time"]);
  ok(
    "sidebar: opening a list holding the current link hands the band from the parent to it, crossing nothing else",
    bad.length === 0,
    bad[0],
  );
  await rest(p);
  bad = await sweep(["Reports", "On-time"]);
  ok(
    "sidebar: closing it folds the band into the parent at once (no sweep over the row below)",
    bad.length === 0,
    bad[0],
  );
  await rest(p);
  await reports.click();
  await rest(p);
  await s.getByRole("button", { name: /^Carriers/ }).click();
  await rest(p);
  bad = await sweep(["Carriers"]);
  ok("sidebar: with a row below current, the band rides it up while the list folds", bad.length === 0, bad[0]);
  await rest(p);
  bad = await sweep(["Carriers"]);
  ok("sidebar: ...and down while the list unfolds", bad.length === 0, bad[0]);
  await rest(p);
  await s.getByRole("button", { name: /^On-time/ }).click();
  await rest(p);
  await reports.click();
  await p.waitForTimeout(40); // timing: rapid toggling — the next press lands mid-fold
  await reports.click();
  await p.waitForTimeout(30); // timing: rapid toggling — the next press lands mid-unfold
  await reports.click();
  await rest(p);
  const fast = await reports.evaluate((el) => ({
    exp: el.getAttribute("aria-expanded"),
    cov: [...el.closest("[data-slot=nav-list]").querySelectorAll("[data-kl-covered]")].length,
    holds: el.hasAttribute("data-kl-covered"),
  }));
  ok(
    "sidebar: rapid toggling settles with the band on the parent alone",
    fast.exp === "false" && fast.cov === 1 && fast.holds,
    fast,
  );
  await reports.click();
  await rest(p);
  await s.getByRole("button", { name: "Exceptions" }).click();
  await rest(p);
  ok(
    "sidebar: choosing a nested link moves the band to it",
    (await s.getByRole("button", { name: "Exceptions" }).getAttribute("data-kl-covered")) === "",
  );
  ok("sidebar: no page errors", p.errs.length === 0, p.errs);
});

test("sidebar: row actions", async ({ open, ok }) => {
  const p = await open({ ...VP, ready: "#sidebar" });
  const s = await shell(p);
  // row action: Tab from the item reaches its ⋯ cell; the menu opens, Escape returns focus
  const lateItem = s.getByRole("button", { name: "Late arrivals", exact: true });
  await lateItem.focus();
  await p.keyboard.press("Tab");
  const fa = await focused(p);
  ok("sidebar: the row action is the next Tab stop after its item", fa.label === "More for Late arrivals", fa);
  await p.keyboard.press("Enter");
  await p
    .getByRole("menu")
    .waitFor({ timeout: 5000 })
    .catch(() => {});
  ok("sidebar: the row action opens a menu", await p.getByRole("menu").isVisible());
  await p.keyboard.press("Escape");
  await until(async () => (await focused(p)).label === "More for Late arrivals");
  ok(
    "sidebar: Escape closes it and focus returns to the ⋯ cell",
    (await focused(p)).label === "More for Late arrivals",
  );
  await s.getByRole("button", { name: "More for Customs holds" }).click();
  await p.getByRole("menuitem", { name: "Delete view" }).click();
  await until(async () => (await s.getByRole("button", { name: "Customs holds", exact: true }).count()) === 0);
  ok(
    "sidebar: a row action acts on its row (Delete view removes it)",
    (await s.getByRole("button", { name: "Customs holds", exact: true }).count()) === 0,
  );
  ok("sidebar: no page errors", p.errs.length === 0, p.errs);
});

test("sidebar: icon rail", async ({ open, ok }) => {
  const p = await open({ ...VP, ready: "#sidebar" });
  const s = await shell(p);
  // rail: key cells only, no row actions; a nested item widens the sidebar with its list open
  await s.locator("[data-slot=app-shell-toggle]").click();
  await until(() => s.evaluate((el) => el.getAttribute("data-kl-nav") === "rail"));
  await idle(p);
  const rail = await s.evaluate((el) => ({
    nav: el.getAttribute("data-kl-nav"),
    acts: el.querySelectorAll("[data-slot=app-shell-nav] [data-slot=nav-action]").length,
    subs: el.querySelectorAll("[data-slot=app-shell-nav] [data-slot=nav-sub]").length,
  }));
  ok(
    "sidebar: collapse to the icon rail hides labels' lists and row actions",
    rail.nav === "rail" && rail.acts === 0 && rail.subs === 0,
    rail,
  );
  // (not the covered copy of the list that rides inside a moving band)
  await s.locator('[data-slot=app-shell-nav] button:not([data-kl-ghost] *):has-text("Reports")').click();
  await until(() =>
    s.evaluate(
      (el) =>
        el.getAttribute("data-kl-nav") === "open" &&
        el.querySelector("[data-slot=nav-item][aria-expanded]")?.getAttribute("aria-expanded") === "true",
    ),
  );
  const wide = await s.evaluate((el) => ({
    nav: el.getAttribute("data-kl-nav"),
    exp: el.querySelector("[data-slot=nav-item][aria-expanded]")?.getAttribute("aria-expanded"),
  }));
  ok(
    "sidebar: pressing a nested item on the rail widens the sidebar with its list open",
    wide.nav === "open" && wide.exp === "true",
    wide,
  );
  ok("sidebar: no page errors", p.errs.length === 0, p.errs);
});

test("sidebar: narrow start sheet", async ({ open, ok }) => {
  const p = await open({ ...VP, ready: "#sidebar" });
  const s = await shell(p);
  // narrow: a start sheet; a disclosure keeps it open; a link closes it
  await (await at(p, "sidebar")).getByText("600px (sheet)").click();
  await idle(p);
  await stable(s);
  // the box settling is not the shell switching: its band is set when its ResizeObserver reports, a React update
  // after that. The toggle reads the band, so a press before it is narrow hides the medium column instead.
  ok(
    "sidebar: at 600px the shell is narrow",
    await until(() => s.evaluate((el) => el.getAttribute("data-kl-shell") === "narrow")),
  );
  await s.locator("[data-slot=app-shell-toggle]").click();
  const sheet = p.getByRole("dialog", { name: "Navigation" });
  await sheet.waitFor({ timeout: 5000 });
  await idle(p);
  ok("sidebar: narrow, the toggle opens the start sheet", await sheet.isVisible());
  await sheet.getByRole("button", { name: "Reports" }).click();
  await sheet.getByRole("button", { name: "Reports" }).click();
  await idle(p);
  ok("sidebar: a disclosure in the sheet keeps the sheet open", await sheet.isVisible());
  await sheet.getByRole("button", { name: "Carrier scorecards" }).click();
  await sheet.waitFor({ state: "hidden", timeout: 5000 });
  ok("sidebar: choosing a link closes the sheet", !(await sheet.isVisible()));
  ok("sidebar: no page errors", p.errs.length === 0, p.errs);
});

test("sidebar: rtl nested list", async ({ open, ok }) => {
  const p = await open({ ...VP, q: "dir=rtl&theme=dark", ready: "#sidebar" });
  const s = await shell(p);
  const sub = await s
    .locator("[data-slot=nav-sub]")
    .first()
    .evaluate((el) => ({
      side: getComputedStyle(el).borderRightWidth,
      caret: getComputedStyle(el.closest("li").querySelector("[data-slot=nav-item-caret] svg")).transform,
    }));
  ok(
    "rtl: the nested list hangs on the right-hand seam; the caret mirrors",
    sub.side === "1px" && sub.caret !== "none",
    sub,
  );
});

test("sidebar: forced colours", async ({ open, ok, eng }) => {
  test.skip(eng !== "chromium", "forced-colors emulation is Chromium-only");
  const p = await open({ ...VP, ctx: { forcedColors: "active" }, ready: "#sidebar" });
  const s = await shell(p);
  await s.getByRole("button", { name: "More for Late arrivals" }).click();
  await p
    .getByRole("menu")
    .waitFor({ timeout: 5000 })
    .catch(() => {});
  await idle(p);
  const act = await s
    .getByRole("button", { name: "More for Late arrivals" })
    .evaluate((el) => [getComputedStyle(el).backgroundColor, getComputedStyle(el).color]);
  ok("forced colours: an open row action is Highlight", act[0] !== act[1], act);
});
