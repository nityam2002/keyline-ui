// Button group: each button its own Tab stop, one owner per seam.
import { test } from "./fixtures.mjs";
import { at, focused } from "./lib/section.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["button-group"] });

test("button group: Tab stops and seams", async ({ open, ok }) => {
  const p = await open({ width: 1440, height: 900, ready: "#button-group" });
  const g = await at(p, "button-group");
  const pages = g.getByRole("group", { name: "Pages" });
  await pages.getByRole("button", { name: "Previous" }).focus();
  await p.keyboard.press("Tab");
  ok("button group: each button is its own Tab stop (role group)", (await focused(p)).text?.endsWith("Next"));
  const seams = await g
    .getByRole("group", { name: "Zoom" })
    .evaluate((el) => [...el.children].map((c) => getComputedStyle(c).borderInlineStartWidth));
  ok(
    "button group: one edge, one owner (the separator's 2px seam, none doubled after it)",
    seams.join() === "0px,1px,1px,2px,0px",
    seams,
  );
});
