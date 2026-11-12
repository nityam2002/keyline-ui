// Probes shared by the toolbar / checkbox-group / shipments / date-time specs.
// poll(fn, pred) re-reads a value until pred(value) holds or the timeout passes and returns the last value
// (never throws), so the soft assertion that follows prints the real detail on failure.
export async function poll(fn, pred = Boolean, timeout = 5000, interval = 40) {
  const t0 = Date.now();
  let v;
  for (;;) {
    try {
      v = await fn();
    } catch {
      v = undefined;
    }
    let good = false;
    try {
      good = await pred(v);
    } catch {}
    if (good || Date.now() - t0 > timeout) return v;
    await new Promise((r) => setTimeout(r, interval));
  }
}

export const near = (a, b, tol = 1.01) => Math.abs(a - b) <= tol;
export const css = (loc, prop, pseudo) =>
  loc.evaluate((e, [p, ps]) => getComputedStyle(e, ps || null).getPropertyValue(p), [prop, pseudo]);
export const box = (loc) =>
  loc.evaluate((e) => {
    const r = e.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom };
  });
// the computed colour of a token, resolved on an element inside the page's scope
export const token = (p, name) =>
  p.evaluate((n) => {
    const d = document.createElement("div");
    d.style.color = `var(${n})`;
    document.querySelector(".kl-frame").appendChild(d);
    const c = getComputedStyle(d).color;
    d.remove();
    return c;
  }, name);

/* the toolbar row's items as the reader sees them: name, kind, and whether it overflows the toolbar's box (r14) */
export const rowItems = (tb) =>
  tb.evaluate((t) => {
    const r = t.getBoundingClientRect();
    return [...t.children]
      .filter((c) => !/fixed|absolute/.test(getComputedStyle(c).position) && c.getBoundingClientRect().width > 0)
      .map((c) => {
        const b = c.getBoundingClientRect();
        const name = (
          c.getAttribute("aria-label") ||
          c.querySelector(".kl-tb-label")?.textContent ||
          c.textContent ||
          ""
        ).trim();
        return {
          name,
          more: c.classList.contains("kl-tb-overflow"),
          inside: b.left >= r.left - 1 && b.right <= r.right + 1,
          l: Math.round(b.left),
          w: Math.round(b.width),
        };
      });
  });
export const fits = (tb) =>
  tb.evaluate(
    (t) =>
      [...t.children]
        .filter((c) => !/fixed|absolute/.test(getComputedStyle(c).position))
        .reduce((s, c) => s + c.getBoundingClientRect().width, 0) <=
      t.clientWidth + 1,
  );
/* the last open menu's rows (r14 form) */
export const menuRows = (p) =>
  p.evaluate(() => {
    const m = [...document.querySelectorAll("[role=menu]")].pop();
    if (!m) return null;
    return [...m.querySelectorAll("[role^=menuitem], [role=group] > [role=presentation], [role=separator]")].map(
      (e) => ({
        role: e.getAttribute("role"),
        name: (e.querySelector(".kl-menu-label > span")?.textContent || e.textContent || "").trim(),
        checked: e.getAttribute("aria-checked"),
        disabled: e.hasAttribute("data-disabled") || e.getAttribute("aria-disabled") === "true",
      }),
    );
  });
/* r14 focus name: aria-label, the toolbar label, or text */
export const focusName14 = (p) =>
  p.evaluate(() => {
    const a = document.activeElement;
    return (
      a?.getAttribute("aria-label") ||
      a?.querySelector(".kl-tb-label")?.textContent ||
      a?.textContent ||
      a?.tagName ||
      ""
    ).trim();
  });
/* number of Tab stops (roving tabindex) inside a toolbar */
export const tabStops = (tb, sel = "button, a, input") =>
  tb.evaluate((x, s) => [...x.querySelectorAll(s)].filter((e) => e.tabIndex === 0).length, sel);
/* the last menu is open and its geometry has settled */
export async function lastMenu(p) {
  const m = p.locator("[role=menu]").last();
  await m.waitFor({ state: "visible" });
  await stableBox(m);
  return m;
}
/* the element's box stops changing for three frames (no throw on timeout) */
export const stableBox = (loc, timeout = 4000) =>
  loc
    .evaluate(
      (el, timeout) =>
        new Promise((res) => {
          let last = "",
            same = 0;
          const t0 = performance.now();
          const tick = () => {
            const r = el.getBoundingClientRect();
            const k = [r.x, r.y, r.width, r.height].map((v) => v.toFixed(2)).join();
            same = k === last ? same + 1 : 0;
            last = k;
            if (same >= 3 || performance.now() - t0 > timeout) return res(true);
            requestAnimationFrame(tick);
          };
          tick();
        }),
      timeout,
    )
    .catch(() => {});
