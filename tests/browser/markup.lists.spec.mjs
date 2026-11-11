// Markup: no Stretch band (or anything else) is a non-<li> child of a list.
import { test } from "./fixtures.mjs"

test("markup: every child of a list is a list item", async ({ open, ok }) => {
  const p = await open({ route: "specimen", width: 1440, height: 900, ready: "[data-kl-band]" })
  const bad = await p.evaluate(() => [...document.querySelectorAll(":is(ul, ol) > :not(li, script, template)")].map((e) => `${e.parentElement.className.split(" ")[0]} > ${e.tagName}.${String(e.className).split(" ")[0]}`))
  ok("markup: every child of a list is a list item", bad.length === 0, bad.slice(0, 5))
})
