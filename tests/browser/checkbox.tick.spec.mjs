// The checkbox tick is centred in its box, measured from pixels at 4x.
// The element screenshot here is the measurement itself (the tick's ink bounds), not a review image.
// Where the box sits on the page must not decide the result: the box is moved through quarter-pixel offsets on both
// axes and measured at each, against the box as painted. (This once read 0.6–1px low at some positions and passed at
// others: it centred on the screenshot, whose clip rounds outward at a fractional position, and the path's ink was
// also 0.42px low by construction. The limit is one device pixel, so that bias fails.)
import { test, idle } from "./fixtures.mjs";
test.use({ only: ["choices"] });

const OFFSETS = [0, 0.25, 0.5, 0.75];

for (const t of ["light", "dark"]) {
  test(`checkbox tick: the tick's ink is centred at every sub-pixel position (${t})`, async ({ open, ok }) => {
    const p = await open({
      q: `theme=${t}`,
      width: 1280,
      height: 900,
      ctx: { deviceScaleFactor: 4 },
      ready: "[data-slot=checkbox][data-checked]",
    });
    const box = p.locator("[data-slot=checkbox][data-checked]:not([data-disabled])").first();
    await box.scrollIntoViewIfNeeded();
    const worst = { off: [0, 0], at: null };
    let inked = true;
    for (const dx of OFFSETS)
      for (const dy of OFFSETS) {
        // a layout offset (relative positioning), not a transform: it is painted and snapped like any placed box
        await box.evaluate(
          (el, [x, y]) => {
            el.style.position = "relative";
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
          },
          [dx, dy],
        );
        await idle(p);
        const buf = await box.screenshot();
        const off = await p.evaluate(
          async (src) => {
            const im = new Image();
            im.src = src;
            await im.decode();
            const c = document.createElement("canvas");
            c.width = im.width;
            c.height = im.height;
            const x = c.getContext("2d");
            x.drawImage(im, 0, 0);
            const d = x.getImageData(0, 0, c.width, c.height).data;
            const at = (X, Y) => {
              const i = (Y * c.width + X) * 4;
              return d[i] + d[i + 1] + d[i + 2];
            };
            // the reference is the box as painted, not the image: at a fractional page position the screenshot's clip
            // rounds outward and carries a strip of page background on one side (76 device rows for a 72-row box)
            const fill = at(c.width >> 1, 12); // the box's fill (its checked border is the same colour), above the tick's ink
            let bx0 = 1e9,
              bx1 = -1,
              by0 = 1e9,
              by1 = -1;
            for (let Y = 0; Y < c.height; Y++)
              for (let X = 0; X < c.width; X++)
                if (Math.abs(at(X, Y) - fill) <= 30) {
                  bx0 = Math.min(bx0, X);
                  bx1 = Math.max(bx1, X);
                  by0 = Math.min(by0, Y);
                  by1 = Math.max(by1, Y);
                }
            const b = 8; // the 2px border, in device pixels: the tick is inside it
            let x0 = 1e9,
              x1 = -1,
              y0 = 1e9,
              y1 = -1;
            for (let Y = by0 + b; Y <= by1 - b; Y++)
              for (let X = bx0 + b; X <= bx1 - b; X++)
                if (Math.abs(at(X, Y) - fill) > 150) {
                  x0 = Math.min(x0, X);
                  x1 = Math.max(x1, X);
                  y0 = Math.min(y0, Y);
                  y1 = Math.max(y1, Y);
                }
            return [(x0 + x1 - (bx0 + bx1)) / 8, (y0 + y1 - (by0 + by1)) / 8, x1 - x0];
          },
          "data:image/png;base64," + buf.toString("base64"),
        );
        if (off[2] <= 20) inked = false;
        if (Math.max(Math.abs(off[0]), Math.abs(off[1])) > Math.max(Math.abs(worst.off[0]), Math.abs(worst.off[1])))
          Object.assign(worst, { off, at: [dx, dy] });
      }
    ok(
      `checkbox (${t}): the tick's ink is centred in the box at every quarter-pixel offset (within 0.25px, one device pixel at 4x)`,
      inked && Math.abs(worst.off[0]) <= 0.25 && Math.abs(worst.off[1]) <= 0.25,
      { worst, inked },
    );
  });
}
