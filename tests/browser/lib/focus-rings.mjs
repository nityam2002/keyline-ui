// Focus-indicator probes.
//   ringsOf(p)                        every element from the focused one up that draws an indicator, with its ring box
//   traverse(p, rootSel)              Tab through rootSel; returns { stops, bad }: bad lists the stops without exactly
//                                     one indicator, clipped by an ancestor, or not at a ring-token offset (or the edge)

export const ringsOf = (p) =>
  p.evaluate(() => {
    const a = document.activeElement;
    const out = [];
    for (let e = a, d = 0; e && d < 6; e = e.parentElement, d++) {
      const cs = getComputedStyle(e);
      if (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0)
        out.push({
          d,
          cls: String(e.className).split(" ").slice(-1)[0],
          off: cs.outlineOffset,
          color: cs.outlineColor,
          text: cs.color,
        });
      // A text-entry frame's own edge is its indicator (a band inside the frame, never an outline)
      const band = e.classList?.contains("kl-edge") ? getComputedStyle(e, "::before") : null;
      if (band && band.content !== "none" && !/rgba\(0, 0, 0, 0\)|transparent/.test(band.borderTopColor))
        out.push({ d, cls: "kl-edge", off: "edge", color: band.borderTopColor });
      // a ring drawn by a pseudo element of the scroll area root
      const after = getComputedStyle(e, "::after");
      if (e.classList?.contains("kl-scroll") && after.outlineStyle !== "none" && parseFloat(after.outlineWidth) > 0)
        out.push({ d, cls: "kl-scroll::after", off: after.outlineOffset });
    }
    return { active: String(a?.className || a?.tagName).slice(0, 60), rings: out };
  });

export async function traverse(p, rootSel, max = 260) {
  await p.evaluate((s) => {
    const r = document.querySelector(s);
    r.setAttribute("tabindex", "-1");
    r.focus();
    r.removeAttribute("tabindex");
  }, rootSel);
  const seen = new Set();
  const bad = [];
  let stops = 0;
  for (let i = 0; i < max; i++) {
    await p.keyboard.press("Tab");
    const r = await p.evaluate((rootSel) => {
      const a = document.activeElement;
      if (!a || a === document.body || !document.querySelector(rootSel).contains(a)) return null;
      const key = (a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 30) + "|" + a.className;
      const rings = [];
      for (let e = a, d = 0; e && d < 6; e = e.parentElement, d++) {
        const cs = getComputedStyle(e);
        const pseudo = e.classList.contains("kl-scroll") ? getComputedStyle(e, "::after") : null;
        const src =
          cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0
            ? cs
            : pseudo && pseudo.outlineStyle !== "none" && parseFloat(pseudo.outlineWidth) > 0
              ? pseudo
              : null;
        // The focus edge is drawn inside the frame (inset 0), so it cannot be clipped by an ancestor
        const band = e.classList.contains("kl-edge") ? getComputedStyle(e, "::before") : null;
        if (!src && band && band.content !== "none" && !/rgba\(0, 0, 0, 0\)|transparent/.test(band.borderTopColor)) {
          rings.push({ d, off: "edge", w: parseFloat(band.borderTopWidth), clip: 0 });
          continue;
        }
        if (!src) continue;
        const off = parseFloat(src.outlineOffset),
          w = parseFloat(src.outlineWidth),
          bb = e.getBoundingClientRect(),
          x = off + w;
        const ring = { l: bb.left - x, t: bb.top - x, r: bb.right + x, b: bb.bottom + x };
        let clip = 0;
        for (let an = e.parentElement; an && an !== document.documentElement; an = an.parentElement) {
          const acs = getComputedStyle(an);
          if (acs.overflowX === "visible" && acs.overflowY === "visible") continue;
          const ab = an.getBoundingClientRect();
          const box = {
            l: ab.left + parseFloat(acs.borderLeftWidth),
            t: ab.top + parseFloat(acs.borderTopWidth),
            r: ab.right - parseFloat(acs.borderRightWidth),
            b: ab.bottom - parseFloat(acs.borderBottomWidth),
          };
          // a scroller clips only across its scroll axis edges that are not scrolled content
          clip = Math.max(box.l - ring.l, ring.r - box.r, box.t - ring.t, ring.b - box.b);
          if (acs.overflowY !== "visible" && an.scrollHeight > an.clientHeight + 1)
            clip = Math.max(box.l - ring.l, ring.r - box.r);
          if (clip > 0.5) {
            clip = { by: String(an.className).slice(0, 40), px: +clip.toFixed(1) };
            break;
          }
          clip = 0;
        }
        rings.push({
          d,
          off,
          w,
          clip,
          onFill: !!a.closest("[data-kl-covered], [data-kl-on], [data-checked].kl-flood"),
          color: src.outlineColor,
          text: getComputedStyle(e).color,
        });
      }
      return { key, rings };
    }, rootSel);
    if (!r) continue;
    if (seen.has(r.key)) continue;
    seen.add(r.key);
    stops++;
    const ring = r.rings[0];
    if (r.rings.length !== 1) bad.push({ key: r.key, why: r.rings.length ? "double" : "none", rings: r.rings });
    else if (ring.clip) bad.push({ key: r.key, why: "clipped", clip: ring.clip });
    else if (![2, -2, "edge"].includes(ring.off)) bad.push({ key: r.key, why: "offset", off: ring.off });
  }
  return { stops, bad };
}
