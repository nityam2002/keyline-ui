// Rendered-contrast measurement (Chrome only). Measures what
// is actually rendered: every visible text run against the composited surface behind it, and every control/frame
// edge against the surface outside it. Colours are resolved by the browser (drawn to an sRGB canvas, so
// out-of-gamut values are mapped exactly as the page shows them) and translucent layers are composited. Disabled
// controls are reported separately (WCAG exempts them). Background images (hatching, the flood's clip-path circle
// mid-transition) are not modelled.
//   measure(p, rootSel)  → { text: [{ r, min, dis, … }], edges: [{ r, dis, … }] }; rootSel "portals" = everything
//                          outside the app root (dialogs, popups)
//   summary(label, m)    prints a summary line and returns { textFail, edgeFail, … } (live items only:
//                          text below its minimum, 4.5 or 3 for large text; edges below 3)
import { settle } from "../fixtures.mjs";

// 1. collect text runs and edges with their computed colours; 2. hide all text and photograph the page;
// 3. sample the photographed surface behind each run (the most common pixel in its box) and outside
// each edge. This sees bands, floods, pseudo-elements and translucent layers as they are painted.
export async function measure(p, rootSel) {
  const items = await p.evaluate((rootSel) => {
    // "portals" = everything outside the app root (dialogs, popups)
    const all =
      rootSel === "portals"
        ? [...document.body.children].filter((c) => c.id !== "root").flatMap((c) => [c, ...c.querySelectorAll("*")])
        : [...(document.querySelector(rootSel) ?? document.body).querySelectorAll("*")];
    const vis = (e) => {
      const r = e.getBoundingClientRect();
      const s = getComputedStyle(e);
      return (
        r.width > 0 &&
        r.height > 0 &&
        s.visibility !== "hidden" &&
        +s.opacity > 0.05 &&
        !e.closest("[inert],[hidden],.kl-sr,[data-testid=pg-contrast]")
      );
    };
    // the part of a box that clipping ancestors (overflow, folded slots) leave visible
    const clipped = (r, el) => {
      let [x0, y0, x1, y1] = [r.left, r.top, r.right, r.bottom];
      for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (cs.overflowX !== "visible" || cs.overflowY !== "visible") {
          const c = a.getBoundingClientRect();
          x0 = Math.max(x0, c.left);
          y0 = Math.max(y0, c.top);
          x1 = Math.min(x1, c.right);
          y1 = Math.min(y1, c.bottom);
        }
      }
      return { left: x0, top: y0, width: x1 - x0, height: y1 - y0 };
    };
    const disabled = (e) => !!e.closest(":disabled,[aria-disabled=true],[data-disabled]");
    const name = (e) => String(e.className).split(" ").filter(Boolean).slice(0, 2).join(".") || e.tagName.toLowerCase();
    const text = [];
    const edges = [];
    const sx = scrollX,
      sy = scrollY;
    for (const el of all) {
      if (!vis(el)) continue;
      const s = getComputedStyle(el);
      for (const n of el.childNodes) {
        if (n.nodeType !== 3 || !n.textContent.trim()) continue;
        const rg = document.createRange();
        rg.selectNodeContents(n);
        const r = clipped(rg.getBoundingClientRect(), el);
        if (r.width < 4 || r.height < 4) continue;
        // skip text covered by another layer (an open popup over a dialog field)
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (hit && !el.contains(hit) && !hit.contains(el)) continue;
        const size = parseFloat(s.fontSize);
        text.push({
          t: n.textContent.trim().slice(0, 28),
          cls: name(el),
          color: s.color,
          box: [r.left + sx, r.top + sy, r.width, r.height],
          large: size >= 24 || (size >= 18.66 && +s.fontWeight >= 700),
          dis: disabled(el),
        });
      }
      if (
        el.matches(
          ".kl-ctl:not([data-kl-layout=cell]), .kl-frame:not([data-kl-layout=cell]), [data-slot=checkbox], [data-slot=switch]",
        ) &&
        parseFloat(s.borderTopWidth) > 0 &&
        !/rgba\(.*, 0\)$/.test(s.borderTopColor)
      ) {
        const r = el.getBoundingClientRect();
        edges.push({
          cls: name(el),
          color: s.borderTopColor,
          w: s.borderTopWidth,
          box: [r.left + sx, r.top + sy, r.width, r.height],
          dis: disabled(el),
        });
      }
    }
    return { text, edges };
  }, rootSel);
  await p
    .addStyleTag({
      content:
        "*, *::before, *::after { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; caret-color: transparent !important; text-decoration-color: transparent !important; outline-color: transparent !important }",
    })
    .then((h) => h.evaluate((e) => e.setAttribute("data-audit", "")));
  await settle(p);
  const shot = (await p.screenshot({ fullPage: true })).toString("base64");
  await p.evaluate(() => document.querySelectorAll("style[data-audit]").forEach((e) => e.remove()));
  return p.evaluate(
    async ({ items, shot }) => {
      const img = new Image();
      img.src = "data:image/png;base64," + shot;
      await img.decode();
      const cv = document.createElement("canvas");
      cv.width = img.width;
      cv.height = img.height;
      const cx = cv.getContext("2d", { willReadFrequently: true });
      cx.drawImage(img, 0, 0);
      const px = cx.getImageData(0, 0, img.width, img.height).data;
      const at = (x, y) => {
        x = Math.round(x);
        y = Math.round(y);
        if (x < 0 || y < 0 || x >= img.width || y >= img.height) return null;
        const i = (y * img.width + x) * 4;
        return [px[i], px[i + 1], px[i + 2]];
      };
      const mode = (pts) => {
        const m = new Map();
        for (const c of pts)
          if (c) {
            const k = c.join(",");
            m.set(k, (m.get(k) ?? 0) + 1);
          }
        let best = null,
          n = 0;
        for (const [k, v] of m)
          if (v > n) {
            best = k;
            n = v;
          }
        return best?.split(",").map(Number);
      };
      const one = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      const rgba = (c) => {
        one.clearRect(0, 0, 1, 1);
        one.fillStyle = "#000";
        one.fillStyle = c;
        one.fillRect(0, 0, 1, 1);
        const d = one.getImageData(0, 0, 1, 1).data;
        return [d[0], d[1], d[2], d[3] / 255];
      };
      const over = (t, u) => [0, 1, 2].map((i) => t[i] * t[3] + u[i] * (1 - t[3]));
      const lin = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      const L = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
      const ratio = (a, b) => {
        const [x, y] = [L(a), L(b)].sort((m, n) => n - m);
        return +((x + 0.05) / (y + 0.05)).toFixed(2);
      };
      const text = items.text
        .map((t) => {
          const [x, y, w, h] = t.box;
          const pts = [];
          for (let i = 1; i < 12; i++) for (let j = 1; j < 6; j++) pts.push(at(x + (w * i) / 12, y + (h * j) / 6));
          const bg = mode(pts);
          return bg
            ? {
                t: t.t,
                cls: t.cls,
                r: ratio(over(rgba(t.color), bg), bg),
                min: t.large ? 3 : 4.5,
                dis: t.dis,
                at: t.box.map(Math.round),
              }
            : null;
        })
        .filter(Boolean);
      const edges = items.edges
        .map((e) => {
          const [x, y, w, h] = e.box;
          const pts = [];
          for (let i = 2; i < 9; i++) {
            pts.push(at(x + (w * i) / 10, y - 3), at(x + (w * i) / 10, y + h + 2));
            pts.push(at(x - 3, y + (h * i) / 10), at(x + w + 2, y + (h * i) / 10));
          }
          const bg = mode(pts);
          return bg
            ? {
                cls: e.cls,
                w: e.w,
                r: ratio(over(rgba(e.color), bg), bg),
                dis: e.dis,
                at: e.box.map(Math.round),
                border: e.color,
              }
            : null;
        })
        .filter(Boolean);
      return { text, edges };
    },
    { items, shot },
  );
}

export const summary = (label, m) => {
  const live = m.text.filter((x) => !x.dis);
  const fail = live.filter((x) => x.r < x.min);
  const eLive = m.edges.filter((x) => !x.dis);
  const eFail = eLive.filter((x) => x.r < 3);
  const min = (a) => (a.length ? Math.min(...a.map((x) => x.r)).toFixed(2) : "–");
  const med = (a) =>
    a.length
      ? a
          .map((x) => x.r)
          .sort((x, y) => x - y)
          [Math.floor(a.length / 2)].toFixed(2)
      : "–";
  console.log(
    `${label.padEnd(34)} text ${String(live.length).padStart(4)} min ${min(live)} median ${med(live)} fail ${fail.length}  | edges ${String(eLive.length).padStart(3)} min ${min(eLive)} fail ${eFail.length}  | disabled text min ${min(m.text.filter((x) => x.dis))}`,
  );
  for (const f of [...fail, ...eFail].slice(0, 6)) console.log("     below:", JSON.stringify(f));
  const lowest = [...live].sort((a, b) => a.r - b.r).slice(0, 3);
  const lowestEdges = [...eLive].sort((a, b) => a.r - b.r).slice(0, 3);
  return {
    label,
    lowest,
    lowestEdges,
    textCount: live.length,
    textMin: +min(live),
    textMedian: +med(live),
    textFail: fail,
    edgeCount: eLive.length,
    edgeMin: +min(eLive),
    edgeFail: eFail,
  };
};
