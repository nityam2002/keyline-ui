// A table in the flow of a page: a wheel over a grid that cannot scroll vertically moves the page (the block axis
// chains, as the reference tables' overflow-x-only containers do); only the inline axis is contained.
import { test } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["number", "sort"] });

test("table: the block axis chains to the page, the inline axis is contained", async ({ open, ok }) => {
  const p = await open({ ready: "#number [data-slot=number-field]", height: 600 });
  const grid = p.locator("#sort [data-slot=table-scroll]");
  const viewport = grid.locator(":scope > [data-slot=scroll-area-viewport]");
  await grid.scrollIntoViewIfNeeded();
  const behaviour = await viewport.evaluate((v) => {
    const cs = getComputedStyle(v);
    return `${cs.overscrollBehaviorInline}/${cs.overscrollBehaviorBlock}`;
  });
  ok("table: overscroll is contained inline only", behaviour === "contain/auto", behaviour);

  // the page's scroller is whichever ancestor scrolls; sum them so the spec holds for any page shell
  const pageTop = () =>
    grid.evaluate((g) => {
      let t = 0;
      for (let e = g.parentElement; e; e = e.parentElement) t += e.scrollTop;
      return t + (document.scrollingElement?.scrollTop ?? 0);
    });
  // upward: the specimen page sits at the end of its range once the grid is in view
  const box = await grid.boundingBox();
  const before = await pageTop();
  await p.mouse.move(box.x + box.width / 2, box.y + Math.min(box.height / 2, 40));
  for (let i = 0; i < 3; i++) {
    await p.mouse.wheel(0, -60);
    await p.waitForTimeout(120);
  }
  const moved = before - (await pageTop());
  const inner = await viewport.evaluate((v) => v.scrollTop);
  ok("table: a wheel over an unbounded grid scrolls the page, not the grid", moved > 0 && inner === 0, {
    moved,
    inner,
  });
});
