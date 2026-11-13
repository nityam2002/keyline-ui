// Command: a new query shows its results from the top. cmdk 1.1.1 scrolls to the previous selection when rows
// remount (a grouped index giving way to a flat list) and then selects the first row without scrolling back.
import { test } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["command"] });

test("command: typing a query keeps the results at the top", async ({ open, ok }) => {
  const p = await open({ route: "specimen", q: "theme=light", ready: "#command" });
  await p.getByTestId("specimen-command").getByRole("button", { name: "Search" }).click();
  const list = p.getByTestId("command-list");
  await list.waitFor();
  const read = () =>
    list.evaluate((el) => ({
      top: Math.round(el.scrollTop),
      max: el.scrollHeight - el.clientHeight,
      selected: el.querySelector("[cmdk-item][aria-selected=true]")?.textContent ?? null,
      first: el.querySelector("[cmdk-item]")?.textContent ?? null,
    }));
  for (const query of ["l", "la"]) {
    await p.keyboard.type(query.slice(-1));
    await p.waitForTimeout(150);
    const s = await read();
    ok(
      `command: after typing "${query}", the list is at its top with the first result selected`,
      s.max > 0 && s.top === 0 && s.selected === s.first,
      s,
    );
  }
  // the active row is still scrolled into view by arrow keys
  for (let i = 0; i < 12; i++) await p.keyboard.press("ArrowDown");
  const moved = await read();
  ok("command: arrowing down scrolls the active row into view", moved.top > 0, moved);
});
