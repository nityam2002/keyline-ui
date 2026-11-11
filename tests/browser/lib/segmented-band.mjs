// Helpers for the motion-lab specs.
//   band(seg)    the segmented band: { l, r } in px (from its inline style), tug (data-kl-tug on the control) and
//                chk, which items are checked as a "0100" string
//   centre(loc)  [x, y] of the locator's box centre
export const band = (seg) =>
  seg.evaluate((s) => {
    const b = s.querySelector("[data-kl-band]")
    const l = parseFloat(b.style.left || "0")
    return { l, r: l + parseFloat(b.style.width || "0"), tug: s.hasAttribute("data-kl-tug"), chk: [...s.querySelectorAll("[data-kl-item]")].map((e) => (e.hasAttribute("data-checked") ? 1 : 0)).join("") }
  })

export const centre = async (loc) => {
  const r = await loc.boundingBox()
  return [r.x + r.width / 2, r.y + r.height / 2]
}

/** Waits until the segmented band's inline box stops changing for three frames (its motion is JS-driven, so
 * document.getAnimations() does not see it). */
export const bandRests = (seg, timeout = 5000) =>
  seg.evaluate(
    (s, timeout) =>
      new Promise((res, rej) => {
        const b = s.querySelector("[data-kl-band]")
        let last = "", same = 0
        const t0 = performance.now()
        const tick = () => {
          const k = `${b.style.left}|${b.style.width}|${s.hasAttribute("data-kl-tug")}`
          same = k === last ? same + 1 : 0
          last = k
          if (same >= 3) return res(true)
          if (performance.now() - t0 > timeout) return rej(new Error("bandRests: band still moving"))
          requestAnimationFrame(tick)
        }
        tick()
      }),
    timeout,
  )
