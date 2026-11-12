// Helpers for the ScrollArea reveal/hold/fade/grip specs (and the same bar inside the MessageScroller).

/* a scroll area's state: per bar, the thumb's opacity, scale and tone, and the geometry nothing may change */
export const state = (loc) =>
  loc.evaluate((root) => {
    const vp = root.querySelector(":scope > [data-id$=-viewport], :scope > .kl-scroll-vp") || root.firstElementChild
    const bars = {}
    for (const bar of root.querySelectorAll(":scope > [data-orientation]")) {
      const t = bar.firstElementChild
      const cs = getComputedStyle(t)
      const r = (e) => e.getBoundingClientRect().toJSON()
      bars[bar.dataset.orientation] = {
        op: +(+cs.opacity).toFixed(3),
        scale: cs.scale,
        bg: cs.backgroundColor,
        origin: cs.transformOrigin,
        scrolling: bar.hasAttribute("data-scrolling"),
        // the cell the reader sees: the bar's box plus the travel-axis margins its ::after fills (scroll-area.css)
        bar: (() => { const b = r(bar), bs = getComputedStyle(bar), mt = parseFloat(bs.marginTop), mb = parseFloat(bs.marginBottom), ml = parseFloat(bs.marginLeft), mr = parseFloat(bs.marginRight); const x = b.x - ml, y = b.y - mt, width = b.width + ml + mr, height = b.height + mt + mb; return { x, y, width, height, left: x, top: y, right: x + width, bottom: y + height } })(),
        thumb: r(t),
        seam: getComputedStyle(bar)[bar.dataset.orientation === "vertical" ? "borderInlineStartWidth" : "borderBlockStartWidth"],
      }
    }
    const content = vp.firstElementChild.getBoundingClientRect().toJSON()
    return { reveal: root.dataset.klReveal, top: vp.scrollTop, left: vp.scrollLeft, maxTop: vp.scrollHeight - vp.clientHeight, maxLeft: vp.scrollWidth - vp.clientWidth, vpRect: vp.getBoundingClientRect().toJSON(), content, bars, corner: !!root.querySelector(":scope > .kl-scroll-corner, :scope > [data-id$=corner]") || root.children.length > 3, dir: getComputedStyle(root).direction }
  })

export const tokens = (p) =>
  p.evaluate(() => {
    const d = document.createElement("div")
    document.body.append(d)
    const g = (v) => {
      d.style.backgroundColor = `var(${v})`
      return getComputedStyle(d).backgroundColor
    }
    const o = { ink: g("--kl-ink"), ink2: g("--kl-ink-2"), ink3: g("--kl-ink-3") }
    d.remove()
    return o
  })

/* sample a thumb's opacity every frame for ms (in the page, so the samples are not spaced by the protocol) */
export const sample = (loc, ms, axis = "vertical") =>
  loc.evaluate(
    (root, [ms, axis]) =>
      new Promise((res) => {
        const t = root.querySelector(`:scope > [data-orientation=${axis}]`).firstElementChild
        const out = []
        const t0 = performance.now()
        const f = () => {
          out.push([Math.round(performance.now() - t0), +(+getComputedStyle(t).opacity).toFixed(3)])
          if (performance.now() - t0 < ms) requestAnimationFrame(f)
          else res(out)
        }
        f()
      }),
    [ms, axis],
  )

export const center = (r) => [r.x + r.width / 2, r.y + r.height / 2]

/** Waits (without failing) until fn(thumb opacities by axis, root) is true — polled every frame in the page. */
export const until = (loc, fn, timeout = 4000) =>
  loc
    .evaluate(
      (root, [src, timeout]) =>
        new Promise((res) => {
          const test = new Function("ops", "root", `return (${src})(ops, root)`)
          const t0 = performance.now()
          const tick = () => {
            const ops = {}
            for (const bar of root.querySelectorAll(":scope > [data-orientation]")) ops[bar.dataset.orientation] = +(+getComputedStyle(bar.firstElementChild).opacity).toFixed(3)
            let v = false
            try {
              v = test(ops, root)
            } catch {}
            if (v || performance.now() - t0 > timeout) return res(!!v)
            requestAnimationFrame(tick)
          }
          tick()
        }),
      [fn.toString(), timeout],
    )
    .catch(() => false)

/** Two animation frames. */
export const frames = (p) => p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))

/** Scrolls a scroll area into view and waits until the platform probe has run and its bars are at rest. */
export async function ready(p, id) {
  const loc = p.getByTestId(id)
  await loc.scrollIntoViewIfNeeded()
  await until(loc, (ops, root) => !!root.dataset.klReveal && Object.keys(ops).length > 0)
  await frames(p)
  return loc
}

/** Input during a fade, with the harness's latency taken out: in the page, wait (every frame) until the thumb's
 * opacity is inside (lo, hi) (and, with `still`, the bar has no data-scrolling), start sampling every frame, and ask
 * the test through a binding to send `input`. `at` is the opacity on the event that delivers the input to the page
 * (`event`, listened for on window in the capture phase) — where the fade was when the input reached it; a protocol
 * round trip under load would otherwise count as part of the product's response. Returns { at, sentAt, samples }. */
export async function inputDuringFade(p, loc, { lo, hi, still = false, ms, input, event }) {
  const name = `__klInput${Math.random().toString(36).slice(2)}`
  await p.exposeBinding(name, () => {
    input()
  })
  return loc.evaluate(
    (root, [name, lo, hi, still, ms, event]) =>
      new Promise((res, rej) => {
        const bar = root.querySelector(":scope > [data-orientation=vertical]")
        const t = bar.firstElementChild
        const op = () => +(+getComputedStyle(t).opacity).toFixed(3)
        const t0 = performance.now()
        const wait = () => {
          const o = op()
          if (o > lo && o < hi && (!still || !bar.hasAttribute("data-scrolling"))) return go(o)
          if (performance.now() - t0 > 3000) return rej(new Error(`opacity never inside (${lo}, ${hi})`))
          requestAnimationFrame(wait)
        }
        const go = (sentAt) => {
          const out = []
          let at = null
          let arrived = 0
          const on = () => {
            if (at == null) {
              at = op()
              arrived = performance.now()
            }
          }
          addEventListener(event, on, { capture: true, passive: true })
          const s0 = performance.now()
          window[name]()
          const f = () => {
            out.push([Math.round(performance.now() - s0), op()])
            // sample for `ms` after the input arrived (or give up 2s after sending)
            if (at == null ? performance.now() - s0 < 2000 : performance.now() - arrived < ms) requestAnimationFrame(f)
            else {
              removeEventListener(event, on, { capture: true })
              res({ at: at ?? sentAt, sentAt, samples: out })
            }
          }
          f()
        }
        wait()
      }),
    [name, lo, hi, still, ms, event],
  )
}
