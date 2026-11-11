// Dialog (rename: focus in the field, validation, Enter saves, Escape returns focus) and AlertDialog (focus on the
// safe action, Escape keeps, confirm runs).
import { test, idle } from "./fixtures.mjs"
import { at, focused } from "./lib/section.mjs"
import { until } from "./lib/probe.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["dialog","alert-dialog"] })

const VP = { width: 1440, height: 900 }

test("dialog: rename view", async ({ open, ok }) => {
  const p = await open({ ...VP, ready: "#dialog" })
  const d = await at(p, "dialog")
  const trig = d.getByRole("button", { name: "Rename view…" })
  await trig.click()
  const dlg = p.getByRole("dialog", { name: "Rename view" })
  await dlg.waitFor({ timeout: 5000 }).catch(() => {})
  await until(async () => (await focused(p)).tag === "input")
  await idle(p)
  const fd = await focused(p)
  ok("dialog: opens, named by its title, focus in the name field", (await dlg.isVisible()) && fd.tag === "input", fd)
  await dlg.locator("input").fill("")
  await p.keyboard.press("Enter")
  await until(() => dlg.getByText("Give the view a name.").isVisible())
  ok("dialog: an empty name keeps it open with an error", (await dlg.isVisible()) && (await dlg.getByText("Give the view a name.").isVisible()))
  await dlg.locator("input").fill("Late, reefers")
  await p.keyboard.press("Enter")
  await dlg.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {})
  ok("dialog: Enter saves and closes", !(await dlg.isVisible()) && (await d.getByText("Late, reefers").isVisible()))
  await trig.click()
  await dlg.waitFor({ timeout: 5000 }).catch(() => {})
  await idle(p)
  await p.keyboard.press("Escape")
  await dlg.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {})
  await until(async () => (await focused(p)).text?.endsWith("Rename view…"))
  ok("dialog: Escape closes and focus returns to the trigger", (await focused(p)).text?.endsWith("Rename view…"))
})

test("alert dialog: delete view", async ({ open, ok }) => {
  const p = await open({ ...VP, ready: "#alert-dialog" })
  const a = await at(p, "alert-dialog")
  await a.getByRole("button", { name: "Delete view…" }).click()
  const ad = p.getByRole("alertdialog")
  await ad.waitFor({ timeout: 5000 }).catch(() => {})
  await until(async () => (await focused(p)).text === "Keep view")
  await idle(p)
  ok("alert dialog: role alertdialog, focus on the safe action", (await ad.isVisible()) && (await focused(p)).text === "Keep view")
  await p.keyboard.press("Escape")
  await ad.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {})
  await until(async () => (await focused(p)).text?.endsWith("Delete view…"))
  ok("alert dialog: Escape keeps (reported), focus returns", (await a.getByText("Kept").isVisible()) && (await focused(p)).text?.endsWith("Delete view…"))
  await a.getByRole("button", { name: "Delete view…" }).click()
  await ad.waitFor({ timeout: 5000 }).catch(() => {})
  await idle(p)
  await ad.getByRole("button", { name: "Delete view" }).click()
  await until(() => a.getByText("Deleted").isVisible())
  ok("alert dialog: confirm runs the action", await a.getByText("Deleted").isVisible())
})
