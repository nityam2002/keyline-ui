// Small measuring and waiting helpers shared by specs.
//
//   near(a, b, tol)    |a − b| ≤ tol (default 1.01)
//   box(loc)           the locator's bounding box
//   css(loc, prop, ps) a computed style value (optionally of a pseudo-element)
//   active(p)          the focused element: { label, text, role, name, value }
//   describedBy(loc)   the text of the elements named by aria-describedby, joined with " | "
//   until(fn, ms)      polls fn() until it returns truthy or the time is up, never throws: a wait on an observable
//                      condition that leaves the verdict to the following ok(), which reports the actual value
export const near = (a, b, tol = 1.01) => Math.abs(a - b) <= tol
export const box = (loc) => loc.boundingBox()
export const css = (loc, prop, pseudo) => loc.evaluate((e, [p, ps]) => getComputedStyle(e, ps || null).getPropertyValue(p), [prop, pseudo])
export const active = (p) =>
  p.evaluate(() => {
    const a = document.activeElement
    return {
      label: a?.getAttribute("aria-label") || "",
      text: (a?.textContent || "").trim().slice(0, 60),
      role: a?.getAttribute("role") || a?.tagName,
      name: (a?.getAttribute("aria-label") || a?.textContent || "").trim(),
      value: a?.value,
    }
  })
export const describedBy = (loc) =>
  loc.evaluate((e) => (e.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean).map((id) => document.getElementById(id)?.textContent || "").join(" | "))

export async function until(fn, ms = 5000) {
  const t0 = Date.now()
  for (;;) {
    try {
      if (await fn()) return true
    } catch {}
    if (Date.now() - t0 > ms) return false
    await new Promise((r) => setTimeout(r, 30))
  }
}
