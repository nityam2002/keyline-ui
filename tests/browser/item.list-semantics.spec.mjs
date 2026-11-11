// ItemList semantics: a list holds only list items, also when its rows are buttons or links (Item with `render`).
// The AppShell specimen's "Shipments" list is a list of buttons.
import { test } from "./fixtures.mjs"
test.use({ only: ["shell"] })

test("item list: interactive rows are list items holding the button, and keep the row's divider and width", async ({ open, ok }) => {
  const p = await open({ ready: "#shell [data-slot=item-list]" })
  const list = p.locator("#shell").getByRole("list", { name: "Shipments" })
  const kids = await list.evaluate((l) => [...l.children].map((c) => c.getAttribute("role")))
  ok("item list: every child of the list is a list item", kids.length > 1 && kids.every((r) => r === "listitem"), kids)
  const items = list.getByRole("listitem")
  const buttons = list.getByRole("button")
  ok("item list: one button per list item, still a button", (await items.count()) === (await buttons.count()) && (await buttons.count()) === kids.length, { items: await items.count(), buttons: await buttons.count() })
  const rows = await list.evaluate((l) =>
    [...l.children].map((li) => {
      const b = li.querySelector("button")
      return { liW: li.getBoundingClientRect().width, bW: b.getBoundingClientRect().width, top: getComputedStyle(li).borderTopWidth }
    }),
  )
  ok("item list: the button fills its list item", rows.every((r) => Math.abs(r.liW - r.bW) < 0.5), rows)
  ok("item list: rows after the first draw the 1px divider, the first none", rows[0].top === "0px" && rows.slice(1).every((r) => r.top === "1px"), rows.map((r) => r.top))
})
