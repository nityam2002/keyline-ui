// Toast: the docked stack (kinds, description, Undo, promise, failed with Retry, warning glyph, +n count, hover
// unfold, focus ring, × dismiss) and the floating stack raised outside React (corner, limit, peek, fan-out,
// paused countdowns, swipe, F6, dismiss all), and the floating toast's gutter at 375px.
import { test, idle } from "./fixtures.mjs";
import { at } from "./lib/section.mjs";
import { until } from "./lib/probe.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["toast"] });

const VP = { width: 1440, height: 900 };
// every toast in the floating viewport (box, opacity of its content) unchanged for 5 frames: its motion is over
const stackRests = (p, timeout = 5000) =>
  p.waitForFunction(
    () =>
      new Promise((res) => {
        const key = () =>
          [...document.querySelectorAll('[data-slot="toast-floating"] .kl-toast')]
            .map((e) => {
              const r = e.getBoundingClientRect();
              return [r.top, r.left, r.width, r.height, getComputedStyle(e.firstElementChild).opacity]
                .map(String)
                .join();
            })
            .join("|");
        let last = key(),
          same = 0;
        const tick = () => {
          const k = key();
          same = k === last ? same + 1 : 0;
          last = k;
          if (same >= 5) return res(true);
          if (same === 0 && performance.now() - t0 > 800) return res(false);
          requestAnimationFrame(tick);
        };
        const t0 = performance.now();
        requestAnimationFrame(tick);
      }),
    null,
    { timeout, polling: 50 },
  );

test("toast: docked stack", async ({ open, ok }) => {
  const p = await open({ ...VP, ready: "#toast" });
  const t = await at(p, "toast");
  const panel = t.locator('[data-testid="toast-docked"]');
  const dock = panel.locator('[data-slot="toast-dock"]');
  const front = (sel = ".kl-toast") =>
    dock.evaluate((el, sel) => el.querySelector(sel)?.getAttribute("data-kind") ?? null, sel);
  await panel.getByRole("button", { name: "Archive" }).first().click();
  await until(async () => (await front()) === "done");
  await idle(p);
  const t1 = await dock.evaluate((el) => {
    const r = el.querySelector(".kl-toast");
    return {
      kind: r?.getAttribute("data-kind"),
      title: r?.querySelector(".kl-toast-title")?.textContent,
      desc: r?.querySelector(".kl-toast-desc")?.textContent,
      drain: !!r?.querySelector(".kl-toast-drain"),
      inDock: !!el.closest('[data-testid="toast-docked"]'),
    };
  });
  ok(
    "toast: Archive docks a done toast with a description, an Undo cell and the drain, inside the panel",
    t1.kind === "done" && t1.title === "Archived SH-20483" && t1.desc === "2 left in Ready" && t1.drain && t1.inDock,
    t1,
  );
  await dock.getByRole("button", { name: "Undo" }).click();
  await until(
    async () => (await dock.locator(".kl-toast").count()) === 0 && (await panel.getByText("SH-20483").isVisible()),
  );
  ok(
    "toast: Undo restores the row and closes the toast",
    (await panel.getByText("SH-20483").isVisible()) && (await dock.locator(".kl-toast").count()) === 0,
  );
  await panel.getByRole("button", { name: "Export", exact: true }).click();
  await until(async () => (await front()) === "loading");
  const t2 = await dock.evaluate((el) => {
    const r = el.querySelector(".kl-toast");
    return {
      kind: r?.getAttribute("data-kind"),
      pending: !!r?.querySelector(".kl-toast-pending"),
      drain: !!r?.querySelector(".kl-toast-drain"),
    };
  });
  ok(
    "toast: Export tracks the promise: loading runs the pending segment, no countdown",
    t2.kind === "loading" && t2.pending && !t2.drain,
    t2,
  );
  await until(async () => (await front()) === "done");
  await idle(p);
  const t3 = await dock.evaluate((el) => {
    const r = el.querySelector(".kl-toast");
    return {
      kind: r?.getAttribute("data-kind"),
      title: r?.querySelector(".kl-toast-title")?.textContent,
      n: el.querySelectorAll(".kl-toast:not([data-ending-style])").length,
    };
  });
  ok(
    "toast: …then becomes done in the same toast",
    t3.kind === "done" && t3.title === "Manifest exported" && t3.n === 1,
    t3,
  );
  await panel.getByText("Export fails").click();
  await panel.getByRole("button", { name: "Export", exact: true }).click();
  await until(async () => (await front()) === "failed");
  await idle(p);
  const t4 = await dock.evaluate((el) => {
    const r = el.querySelector(".kl-toast");
    return { kind: r?.getAttribute("data-kind"), retry: r?.querySelector(".kl-toast-action")?.textContent };
  });
  ok("toast: a rejected export becomes failed with Retry", t4.kind === "failed" && t4.retry === "Retry", t4);
  await panel.getByRole("button", { name: "Warning" }).click();
  await until(async () => (await front(".kl-toast:not([data-ending-style])")) === "warning");
  await idle(p);
  const t5 = await dock.evaluate((el) => {
    const r = el.querySelector(".kl-toast:not([data-ending-style])");
    return {
      kind: r?.getAttribute("data-kind"),
      glyph: !!r?.querySelector('.kl-toast-sig .kl-glyph[data-kind="attention"]'),
    };
  });
  ok("toast: warning shows the attention glyph", t5.kind === "warning" && t5.glyph, t5);
  // Base UI exposes × to assistive tech once the region has focus or is expanded (F6 reaches it)
  // The dock keeps the others behind the front one and counts them; nothing leaves the cell collapsed
  await p.mouse.move(2, 2);
  await idle(p);
  const ds = await dock.evaluate((el) => {
    const front = el.querySelector(".kl-toast[data-kl-front]");
    const box = el.getBoundingClientRect();
    const shown = [...el.querySelectorAll(".kl-toast")].filter(
      (t) => getComputedStyle(t).visibility !== "hidden" && +getComputedStyle(t).opacity > 0,
    );
    return {
      kind: front?.getAttribute("data-kind"),
      more: front?.querySelector(".kl-toast-more")?.textContent,
      shown: shown.length,
      inside: shown.every((t) => {
        const r = t.getBoundingClientRect();
        return r.top >= box.top - 0.5 && r.bottom <= box.bottom + 0.5;
      }),
    };
  });
  ok(
    "toast stack (dock): the newest is in front, +n counts the waiting ones, nothing covers the rows",
    ds.kind === "warning" && /^\+[1-9]/.test(ds.more ?? "") && ds.shown === 1 && ds.inside,
    ds,
  );
  await dock.hover();
  await until(() =>
    dock.evaluate(
      (el) =>
        el.querySelectorAll(".kl-toast:not([data-ending-style])").length >= 2 &&
        [...el.querySelectorAll(".kl-toast:not([data-ending-style])")]
          .slice(0, -1)
          .some((t) => t.getBoundingClientRect().bottom <= el.getBoundingClientRect().top + 0.5),
    ),
  );
  await idle(p);
  const de = await dock.evaluate((el) => {
    const box = el.getBoundingClientRect();
    const rs = [...el.querySelectorAll(".kl-toast:not([data-ending-style])")]
      .map((t) => t.getBoundingClientRect())
      .sort((a, b) => a.top - b.top);
    return {
      n: rs.length,
      above: rs.slice(0, -1).every((r) => r.bottom <= box.top + 0.5),
      seams: rs.every((r, i) => i === 0 || Math.abs(r.top - rs[i - 1].bottom) < 1),
    };
  });
  ok(
    "toast stack (dock): hover unfolds the waiting messages upward from the dock on shared seams",
    de.n >= 2 && de.above && de.seams,
    de,
  );
  // by keyboard (WebKit gives programmatic focus no :focus-visible): from its × back to the toast itself
  await dock.locator(".kl-toast[data-kl-front] .kl-toast-x").focus();
  for (let i = 0; i < 3; i++) {
    if (await dock.locator(".kl-toast[data-kl-front]").evaluate((t) => document.activeElement === t)) break;
    await p.keyboard.press("Shift+Tab");
  }
  const ring = await dock.locator(".kl-toast[data-kl-front]").evaluate((t) => {
    const cs = getComputedStyle(t);
    return {
      fv: t.matches(":focus-visible"),
      style: cs.outlineStyle,
      w: parseFloat(cs.outlineWidth),
      off: parseFloat(cs.outlineOffset),
    };
  });
  ok(
    "toast stack (dock): a focused toast shows its ring inside the clipped cell",
    ring.fv && ring.style !== "none" && ring.w > 0 && ring.off <= -ring.w,
    ring,
  );
  await dock.locator(".kl-toast[data-kl-front] .kl-toast-x").click();
  const kinds = () =>
    dock.evaluate((el) =>
      [...el.querySelectorAll(".kl-toast:not([data-ending-style])")].map((t) => t.getAttribute("data-kind")),
    );
  await until(async () => !(await kinds()).includes("warning"));
  const left = await kinds();
  ok("toast: × dismisses the shown toast", !left.includes("warning"), left);
  ok("toast: no page errors", p.errs.length === 0, p.errs);
});

test("toast: floating stack", async ({ open, ok, eng }) => {
  const p = await open({ ...VP, ready: "#toast" });
  const t = await at(p, "toast");
  const floating = (sel) => p.locator(`[data-slot="toast-floating"] ${sel}`);
  // outside React: a plain module function raises it in the floating viewport
  await t.getByRole("button", { name: "Simulate a carrier message" }).click();
  await floating(".kl-toast")
    .first()
    .waitFor({ timeout: 5000 })
    .catch(() => {});
  await stackRests(p);
  await idle(p);
  const fl = await p.evaluate(() => {
    const v = document.querySelector('[data-slot="toast-floating"]');
    const r = v?.querySelector(".kl-toast")?.getBoundingClientRect();
    return {
      title: v?.querySelector(".kl-toast-title")?.textContent,
      right: r ? innerWidth - r.right : null,
      bottom: r ? innerHeight - r.bottom : null,
    };
  });
  ok(
    "toast: createToaster raises a floating toast at the inline-end corner",
    fl.title?.includes("Kuehne+Nagel") && fl.right === 16 && fl.bottom === 16,
    fl,
  );
  // The floating stack (Base UI's stacking, Keyline's drawing)
  await t.getByRole("button", { name: "Three in a row" }).click();
  await p.mouse.move(2, 2);
  const limState = () =>
    p.evaluate(() => {
      const v = document.querySelector('[data-slot="toast-floating"]');
      const all = [...v.querySelectorAll(".kl-toast:not([data-ending-style])")];
      return {
        n: all.length,
        limited: all.filter((e) => e.hasAttribute("data-limited")).length,
        more: v.querySelector(".kl-toast[data-kl-front] .kl-toast-more bdi")?.textContent,
      };
    });
  // the three arrive one after another: wait for the fourth (and its +n), then for the stack's motion to end
  await until(async () => {
    const s = await limState();
    return s.n >= 4 && s.limited >= 1 && s.more === "+3";
  });
  await stackRests(p);
  await idle(p);
  const geo = () =>
    p.evaluate(() =>
      [
        ...document.querySelectorAll(
          '[data-slot="toast-floating"] .kl-toast:not([data-ending-style]):not([data-limited])',
        ),
      ].map((e) => {
        const r = e.getBoundingClientRect();
        return {
          front: e.hasAttribute("data-kl-front"),
          top: r.top,
          bottom: r.bottom,
          left: r.left,
          right: r.right,
          bg: getComputedStyle(e).backgroundColor,
          text: +getComputedStyle(e.firstElementChild).opacity,
        };
      }),
    );
  // four now (the carrier message above, then three): the oldest waits over the limit, and the count includes it
  const lim = await limState();
  ok(
    "toast stack (floating): over the limit (3) a toast waits hidden, and +n still counts it",
    lim.n === 4 && lim.limited === 1 && lim.more === "+3",
    lim,
  );
  const c = await geo();
  const f = c.find((x) => x.front);
  const back = c.filter((x) => !x.front).sort((a, b) => b.top - a.top);
  ok(
    "toast stack (floating): three at most; the older ones peek 8px above the front one, each narrower, their content hidden",
    c.length === 3 &&
      back.length === 2 &&
      Math.abs(f.top - back[0].top - 8) < 1 &&
      Math.abs(back[0].top - back[1].top - 8) < 1 &&
      back[0].left > f.left &&
      back[1].left > back[0].left &&
      back.every((x) => x.text === 0 && x.bg !== f.bg),
    c,
  );
  await floating(".kl-toast[data-kl-front]").hover();
  await until(() =>
    p.evaluate(() => document.querySelector('[data-slot="toast-floating"]')?.hasAttribute("data-expanded")),
  );
  await stackRests(p);
  await idle(p);
  const e = (await geo()).sort((a, b) => a.top - b.top);
  ok(
    "toast stack (floating): hover fans it out into a column 8px apart, every toast readable",
    e.length === 3 && e.every((x, i) => x.text === 1 && (i === 0 || Math.abs(x.top - e[i - 1].bottom - 8) < 1.5)),
    e,
  );
  const paused = await p.evaluate(() => {
    const d = [...document.querySelectorAll('[data-slot="toast-floating"] .kl-toast-drain')];
    return d.length > 0 && d.every((x) => getComputedStyle(x).animationPlayState === "paused");
  });
  ok("toast stack (floating): every countdown pauses while it is open", paused);
  const moreShown = await p.evaluate(
    () =>
      [...document.querySelectorAll('[data-slot="toast-floating"] .kl-toast-more')].filter(
        (m) => m.getClientRects().length > 0,
      ).length,
  );
  ok("toast stack (floating): expanded, there is nothing left to count (no +n)", moreShown === 0, moreShown);
  if (eng === "chromium") {
    const before = await floating(".kl-toast").count();
    const fr = await floating(".kl-toast[data-kl-front]").boundingBox();
    await p.mouse.move(fr.x + 120, fr.y + 20);
    await p.mouse.down();
    for (let i = 1; i <= 10; i++) {
      await p.mouse.move(fr.x + 120 + i * 25, fr.y + 20);
      await p.waitForTimeout(16); // timing: one move per frame, so the swipe has a velocity
    }
    await p.mouse.up();
    await until(
      async () =>
        (await floating(".kl-toast").count()) === before - 1 &&
        (await floating(".kl-toast[data-limited]").count()) === 0,
    );
    ok(
      "toast stack (floating): a swipe toward the inline end dismisses the front toast",
      (await floating(".kl-toast").count()) === before - 1,
    );
    ok(
      "toast stack (floating): the one waiting over the limit comes forward",
      (await floating(".kl-toast[data-limited]").count()) === 0,
    );
  }
  // the keyboard opens the stack too: F6 moves focus into the viewport (Base UI), which expands it
  await p.mouse.move(2, 2);
  await until(() =>
    p.evaluate(() => !document.querySelector('[data-slot="toast-floating"]')?.hasAttribute("data-expanded")),
  );
  await idle(p);
  await p.keyboard.press("F6");
  const kxState = () =>
    p.evaluate(() => {
      const v = document.querySelector('[data-slot="toast-floating"]');
      return {
        expanded: v?.hasAttribute("data-expanded") ?? null,
        inside: v?.contains(document.activeElement) ?? null,
      };
    });
  await until(async () => {
    const s = await kxState();
    return s.expanded && s.inside;
  });
  const kx = await kxState();
  ok("toast stack (floating): F6 moves focus into the stack and expands it", kx.expanded && kx.inside, kx);
  await t.getByRole("button", { name: "Dismiss all" }).click();
  await until(async () => (await floating(".kl-toast").count()) === 0);
  ok("toast: dismiss() closes every toast", (await floating(".kl-toast").count()) === 0);
  ok("toast: no page errors", p.errs.length === 0, p.errs);
});

test("toast: floating toast at 375px", async ({ open, ok }) => {
  const p = await open({ width: 375, height: 800, ready: "#toast" });
  await (await at(p, "toast")).getByRole("button", { name: "Simulate a carrier message" }).click();
  await p
    .locator('[data-slot="toast-floating"] .kl-toast')
    .first()
    .waitFor({ timeout: 5000 })
    .catch(() => {});
  await stackRests(p);
  await idle(p);
  const w = await p.evaluate(() => {
    const r = document.querySelector('[data-slot="toast-floating"] .kl-toast')?.getBoundingClientRect();
    return r ? [r.left, r.right] : null;
  });
  ok("narrow: the floating toast fits the viewport with a 16px gutter", w && w[0] >= 15.5 && w[1] <= 375 - 15.5, w);
});
