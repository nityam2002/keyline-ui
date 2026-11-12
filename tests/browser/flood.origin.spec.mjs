// The flood's origin belongs to one press: the press point is set for the press and cleared after its flood.
import { test } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["split"] });

test("flood origin: set for the press, cleared after its flood", async ({ open, ok }) => {
  const p = await open({
    route: "specimen",
    width: 1440,
    height: 900,
    ready: ":is([data-slot=toggle], [data-slot=toggle-group-item])",
  });
  const cell = p.locator(":is([data-slot=toggle], [data-slot=toggle-group-item])").first();
  await cell.scrollIntoViewIfNeeded();
  // the press is held while "during" is read: the origin is cleared 180ms (--kl-t-flood + 40) after release, which
  // a click-then-read round trip can outrun on a loaded machine
  const b = await cell.boundingBox();
  await p.mouse.move(b.x + 4, b.y + 4);
  await p.mouse.down();
  const during = await cell.evaluate((e) => e.style.getPropertyValue("--kl-fx"));
  await p.mouse.up();
  await p
    .waitForFunction((e) => e.style.getPropertyValue("--kl-fx") === "", await cell.elementHandle(), { timeout: 3000 })
    .catch(() => {});
  const after = await cell.evaluate((e) => e.style.getPropertyValue("--kl-fx"));
  ok("flood: the press point is set for the press and cleared after its flood", during !== "" && after === "", {
    during,
    after,
  });
});
