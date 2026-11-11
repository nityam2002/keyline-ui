// Helpers for the motion-lab specs.
//   band(seg)    the segmented band: { l, r } in px from the host's padding box start, as drawn (window.__klBand,
//                fixtures.mjs: during a move only part of the band element is visible), tug (data-kl-tug on the control) and
//                chk, which items are checked as a "0100" string
//   centre(loc)  [x, y] of the locator's box centre
export const band = (seg) =>
  seg.evaluate((s) => {
    const b = s.querySelector(":scope > [data-kl-band]")
    const v = window.__klBand(b), h = s.getBoundingClientRect()
    const l = v.left - h.left - s.clientLeft + s.scrollLeft
    return { l, r: l + v.width, tug: s.hasAttribute("data-kl-tug"), chk: [...s.querySelectorAll("[data-kl-item]")].map((e) => (e.hasAttribute("data-checked") ? 1 : 0)).join("") }
  })

export const centre = async (loc) => {
  const r = await loc.boundingBox()
  return [r.x + r.width / 2, r.y + r.height / 2]
}

/** Waits until the segmented band has landed (no flight) and its drawn box and the tug hold for three frames. */
export const bandRests = (seg, timeout = 5000) =>
  seg.evaluate(
    (s, timeout) =>
      new Promise((res, rej) => {
        const b = s.querySelector(":scope > [data-kl-band]")
        let last = "", same = 0
        const t0 = performance.now()
        const tick = () => {
          const v = window.__klBand(b)
          const k = b.hasAttribute("data-kl-flight") ? "" : `${v.left.toFixed(2)}|${v.width.toFixed(2)}|${s.hasAttribute("data-kl-tug")}`
          if (!k) last = ""
          same = k && k === last ? same + 1 : 0
          last = k
          if (same >= 3) return res(true)
          if (performance.now() - t0 > timeout) return rej(new Error("bandRests: band still moving"))
          requestAnimationFrame(tick)
        }
        tick()
      }),
    timeout,
  )
