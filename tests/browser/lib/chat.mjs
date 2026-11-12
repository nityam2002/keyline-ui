// Helpers for the chat family specs (Message, Bubble, MessageScroller, Attachment) on the specimen page.

/** The MessageScroller specimen: its frame, viewport, a geometry reader and a reader-like scroll to the top. */
export async function chat(p) {
  const frame = p.getByTestId("ms-frame");
  await frame.scrollIntoViewIfNeeded();
  const vp = frame.locator(".kl-ms-vp");
  await vp.waitFor();
  // the log opens on the newest message: wait until it is there and the frame has stopped moving
  await p
    .waitForFunction(
      () => {
        const v = document.querySelector("[data-testid=ms-frame] .kl-ms-vp");
        return v && v.scrollHeight - v.clientHeight - v.scrollTop <= 2;
      },
      null,
      { timeout: 5000 },
    )
    .catch(() => {});
  const geo = () =>
    vp.evaluate((v) => ({
      top: Math.round(v.scrollTop),
      gap: Math.round(v.scrollHeight - v.clientHeight - v.scrollTop),
    }));
  // scroll like a reader (wheel): a scripted scrollTop is not reader intent, and the log would keep following
  const toTop = async () => {
    const bx = await frame.boundingBox();
    await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2);
    for (let i = 0; i < 10 && (await vp.evaluate((v) => v.scrollTop)) > 0; i++) {
      await p.mouse.wheel(0, -800);
      await p.waitForFunction(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(true)))),
      );
    }
    await scrollStill(vp);
  };
  return { frame, vp, geo, toTop };
}

/** Waits until an element's scroll position has not changed for `frames` frames (a smooth scroll has ended). */
export const scrollStill = (loc, frames = 6, timeout = 4000) =>
  loc
    .evaluate(
      (v, [frames, timeout]) =>
        new Promise((res) => {
          let last = null,
            same = 0;
          const t0 = performance.now();
          const tick = () => {
            const k = `${v.scrollTop}|${v.scrollHeight}`;
            same = k === last ? same + 1 : 0;
            last = k;
            if (same >= frames || performance.now() - t0 > timeout) return res(true);
            requestAnimationFrame(tick);
          };
          tick();
        }),
      [frames, timeout],
    )
    .catch(() => {});

/** Waits (without failing) for a page condition; the assertion after it decides. */
export const until = (p, fn, arg, timeout = 5000) =>
  p.waitForFunction(fn, arg, { timeout, polling: "raf" }).catch(() => {});

/* Each run hangs from its own side. Theirs: the header, bubble text, file glyph ink and footer start on one line.
   Yours: the header, each bubble's text box and the footer end on one line (so every bubble is flush to the end).
   Edges flip in RTL. */
export const edges = (root) =>
  root.evaluate((r) => {
    const out = [];
    for (const m of r.querySelectorAll(".kl-msg")) {
      const rtl = getComputedStyle(m).direction === "rtl";
      const mine = m.dataset.align === "end";
      const left = rtl === mine;
      const start = (el) => {
        const b = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return left ? b.left + parseFloat(cs.paddingLeft) : b.right - parseFloat(cs.paddingRight);
      };
      const xs = [];
      const h = m.querySelector(".kl-msg-h");
      if (h) xs.push(["header", start(h)]);
      for (const t of m.querySelectorAll(".kl-bubble:not([data-tone=attention]) .kl-bubble-t"))
        xs.push(["text", start(t)]);
      for (const f of m.querySelectorAll(".kl-msg-f")) xs.push(["footer", start(f)]);
      // a 16px glyph's ink starts 3px into its box
      if (!mine)
        for (const g of m.querySelectorAll(".kl-att[data-kl-layout=cell] .kl-att-media > svg")) {
          const b = g.getBoundingClientRect();
          xs.push(["glyph", rtl ? b.right - 3 : b.left + 3]);
        }
      const spread = Math.max(...xs.map((x) => x[1])) - Math.min(...xs.map((x) => x[1]));
      out.push({ align: m.dataset.align, n: xs.length, spread: Math.round(spread * 10) / 10 });
    }
    return out;
  });

/** A CSS colour value resolved to rgb() inside the page (inside .kl-chart so chart-scoped tokens resolve too). */
export const rgb = (p, v) =>
  p.evaluate((v) => {
    const d = document.createElement("div");
    d.style.color = v;
    (document.querySelector(".kl-chart") ?? document.body).appendChild(d);
    const c = getComputedStyle(d).color;
    d.remove();
    return c;
  }, v);
