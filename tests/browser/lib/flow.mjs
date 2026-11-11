// Flow helpers shared by the specimen, playground and focus specs.
//
//   until(fn, ms)        polls fn() until it returns truthy or the time is up; never throws, returns the last value.
//                        A wait on an observable condition that leaves the verdict to the following ok().
//   trackHttp(p)         the live array of "HTTP <status> <url>" responses >= 400 since the page's first request
//                        (collected by the fixture's open()).
//   pick(p, group, name) chooses a radio in the playground's Configuration panel and waits for the scope to apply it.
import { settle } from "../fixtures.mjs"

export async function until(fn, ms = 5000) {
  const t0 = Date.now()
  let v
  for (;;) {
    try {
      v = await fn()
    } catch {
      v = undefined
    }
    if (v || Date.now() - t0 > ms) return v
    await new Promise((r) => setTimeout(r, 30))
  }
}

export async function trackHttp(p, ready) {
  // the fixture's open() listens for responses before the first navigation, so no reload is needed
  if (ready) await p.locator(ready).first().waitFor({ state: "visible" })
  return p.httpErrs
}

export async function pick(p, group, name) {
  const radio = p.getByRole("complementary", { name: "Configuration" }).getByRole("radiogroup", { name: group }).getByRole("radio", { name, exact: true })
  await radio.click()
  await until(async () => (await radio.getAttribute("aria-checked")) === "true" || (await radio.getAttribute("data-checked")) !== null, 2000)
  await settle(p)
}

/** Equality for checks: Object.is, or equal JSON. */
export const same = (a, b) => Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b)

/** Specimen helpers: the stage of a component's entry, its section-level cut switch, and a custom
 * property read on the last visible popup matching a selector. */
export function specimen(p) {
  const col = (title) => p.locator("[data-testid=entry]", { has: p.locator("h2", { hasText: new RegExp(`^${title}`) }) }).locator("[data-testid=stage]")
  const cutOff = (title, off) => col(title).evaluate((el, off) => (off ? el.setAttribute("data-kl-cut", "off") : el.removeAttribute("data-kl-cut")), off)
  const popupVar = (sel, v) => p.locator(sel + ":visible").last().evaluate((el, v) => getComputedStyle(el).getPropertyValue(v).trim(), v)
  return { col, cutOff, popupVar }
}
