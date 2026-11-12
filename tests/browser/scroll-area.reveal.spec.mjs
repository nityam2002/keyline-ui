// ScrollArea reveal (after macOS overlay scrollbars): at rest, reveal on scroll, the ~0.9s hold and the fade,
// retargeting mid-fade, keyboard, the edge cell (hover reveal and widen), every axis, always/rail, and RTL.
// The hold and fade durations are the behaviour under test: those samples and waits are kept and marked timing.
import { test } from "./fixtures.mjs";
import { state, tokens, sample, center, until, frames, ready, inputDuringFade } from "./lib/scroll-area.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["scroll-area"] });

const noErrors = (ok, p) =>
  ok("no page errors", p.errs.length + p.consoleErrs.length === 0, [...p.errs, ...p.consoleErrs]);
const VIEW = { width: 1280, height: 1000, ready: "[data-testid=sa-v]" };

test("scroll area: at rest — overlay platform reveals, the cell and seam are there, the thumb slim and hidden", async ({
  open,
  ok,
}) => {
  const p = await open(VIEW);
  const v = await ready(p, "sa-v");
  const s = await state(v);
  ok(
    "rest: the platform overlays scrollbars here, so the area reveals (data-kl-reveal=scroll)",
    s.reveal === "scroll",
    s.reveal,
  );
  ok(
    "rest: the bar's cell and its 1px seam are there, the thumb is not",
    s.bars.vertical.bar.width === 12 && s.bars.vertical.seam === "1px" && s.bars.vertical.op === 0,
    s.bars.vertical,
  );
  ok(
    "rest: the hidden thumb is slim (4 of 7px) and centred in the cell",
    s.bars.vertical.scale.startsWith("0.57") &&
      Math.abs(
        (s.bars.vertical.thumb.left + s.bars.vertical.thumb.right) / 2 -
          (s.bars.vertical.bar.left + 3 + s.bars.vertical.bar.right - 2) / 2,
      ) < 0.6,
    s.bars.vertical,
  );
  noErrors(ok, p);
});

test("scroll area: a wheel reveals, holds ~0.9s, fades — and nothing moves", async ({ open, ok }) => {
  const p = await open(VIEW);
  const v = await ready(p, "sa-v");
  const rest = await state(v);
  const [cx, cy] = center(rest.vpRect);
  await p.mouse.move(cx - 100, cy);
  await p.mouse.wheel(0, 60);
  const samples = await sample(v, 1500); // timing: the reveal, hold and fade durations are what is measured
  const firstUp = samples.find(([, o]) => o > 0);
  const full = samples.find(([, o]) => o === 1);
  const fadeStart = samples.find(([t, o]) => full && t > full[0] && o < 1);
  const last = samples.at(-1);
  ok(
    "scroll: the thumb starts to reveal within 120ms of the wheel and is fully there within 250ms",
    firstUp && firstUp[0] <= 120 && full && full[0] <= 250,
    { firstUp, full },
  );
  ok(
    "scroll: it holds while the axis settles, then fades about 0.9s after the last input (≥ 750ms, ≤ 1100ms)",
    fadeStart && fadeStart[0] >= 750 && fadeStart[0] <= 1100,
    fadeStart,
  );
  ok("scroll: the fade completes (gone by 1.5s)", last[1] === 0, last);
  const s = await state(v);
  ok(
    "no layout moves: the viewport, content and bar keep their geometry through reveal and fade",
    s.vpRect.width === rest.vpRect.width &&
      s.content.width === rest.content.width &&
      s.bars.vertical.bar.x === rest.bars.vertical.bar.x,
    { before: rest.content.width, after: s.content.width },
  );
  noErrors(ok, p);
});

test("scroll area: scroll–stop–scroll turns the fade back from where it is", async ({ open, ok }) => {
  const p = await open(VIEW);
  const v = await ready(p, "sa-v");
  const [cx, cy] = center((await state(v)).vpRect);
  await p.mouse.move(cx - 100, cy);
  await p.mouse.wheel(0, 40);
  // "where it is": the opacity when the second wheel reaches the page (harness latency is not the product's)
  // timing: sampling the turn of the fade, frame by frame
  const { at: mid, samples } = await inputDuringFade(p, v, {
    lo: 0.15,
    hi: 0.85,
    still: true,
    ms: 200,
    event: "wheel",
    input: () => p.mouse.wheel(0, 40),
  });
  // input reaches the page a frame or three after it is sent; until then the fade runs on. Then it turns, rising
  // through in-between values (a transition retargeted from where it was), never snapping to 0 or restarting.
  const low = Math.min(...samples.map(([, o]) => o));
  const rising = samples.slice(samples.findIndex(([, o]) => o === low));
  ok(
    "scroll–stop–scroll: input during the fade turns it back from where it is: no restart from 0, a smooth rise to full",
    low > mid - 0.25 && rising.some(([, o]) => o > low + 0.02 && o < 0.99) && samples.at(-1)[1] === 1,
    { mid, samples: samples.slice(0, 8) },
  );
  noErrors(ok, p);
});

test("scroll area: PageDown scrolls natively and reveals the thumb", async ({ open, ok }) => {
  const p = await open(VIEW);
  const v = await ready(p, "sa-v");
  await v.getByRole("region", { name: "Activity" }).focus();
  await p.keyboard.press("PageDown");
  await until(v, (ops, root) => ops.vertical > 0.5 && root.firstElementChild.scrollTop > 0, 1000);
  const s = await state(v);
  ok(
    "keyboard: PageDown scrolls natively and reveals the thumb",
    s.bars.vertical.op > 0.5 && s.top > 0,
    s.bars.vertical,
  );
  noErrors(ok, p);
});

test("scroll area: the edge cell reveals and widens on hover; links beside it are not the bar; re-entry during the fade", async ({
  open,
  ok,
}) => {
  const p = await open(VIEW);
  const v = await ready(p, "sa-v");
  const tk = await tokens(p);
  const bar = (await state(v)).bars.vertical.bar;
  await p.mouse.move(bar.x - 30, bar.y + 40);
  await p.mouse.move(bar.x + 6, bar.y + 40, { steps: 3 });
  await until(
    v,
    (ops, root) =>
      ops.vertical === 1 &&
      /^(1|none)$/.test(
        getComputedStyle(root.querySelector(":scope > [data-orientation=vertical]").firstElementChild).scale,
      ) &&
      !root
        .querySelector(":scope > [data-orientation=vertical]")
        .firstElementChild.getAnimations()
        .some((a) => a.playState === "running"),
    1500,
  );
  let e = (await state(v)).bars.vertical;
  ok(
    "edge: the pointer on the bar's cell reveals the thumb, full width, one tone darker (ink-2)",
    e.op === 1 && (e.scale === "1" || e.scale === "none") && e.bg === tk.ink2,
    { e, ink2: tk.ink2 },
  );
  ok(
    "edge: the wide thumb stays inside the cell's 2px inset",
    e.thumb.left >= bar.left + 1 + 2 - 0.6 && e.thumb.right <= bar.right - 2 + 0.6,
    { thumb: e.thumb, bar },
  );
  // a link beside the bar, on the row level with the pointer
  const link = await v
    .getByTestId("sa-edge-link")
    .evaluateAll(
      (ls, y) =>
        ls.map((l) => l.getBoundingClientRect().toJSON()).sort((a, b) => Math.abs(a.y - y) - Math.abs(b.y - y))[0],
      bar.y + 60,
    );
  const atLink = await p.evaluate(
    ([x, y]) => document.elementFromPoint(x, y)?.getAttribute("data-testid"),
    center(link),
  );
  const beside = await p.evaluate(
    ([x, y]) => !!document.elementFromPoint(x, y)?.closest("[data-orientation]"),
    [bar.x - 1, bar.y + 40],
  );
  ok(
    "edge: the activation zone is the 12px cell only; a link near it and the content 1px beside it are not the bar",
    atLink === "sa-edge-link" && !beside && link.x + link.width <= bar.x,
    { atLink, beside, link, bar },
  );
  await p.mouse.move(bar.x - 120, bar.y + 40);
  await p.waitForTimeout(60); // timing: "at once" — narrowed 60ms after leaving, while the hold keeps it visible
  e = (await state(v)).bars.vertical;
  ok(
    "edge: leaving the cell narrows the thumb at once but holds it visible before the fade",
    e.op > 0.9 && e.scale !== "1",
    e,
  );
  /* pointer entry during the fade */
  // "where it was": the opacity when the pointer reaches the page (harness latency is not the product's)
  // timing: sampling the turn of the fade, frame by frame
  const { at: fading, samples } = await inputDuringFade(p, v, {
    lo: 0.1,
    hi: 0.8,
    ms: 160,
    event: "pointermove",
    input: () => p.mouse.move(bar.x + 6, bar.y + 60),
  });
  const lowE = Math.min(...samples.map(([, o]) => o));
  ok(
    "edge: the pointer arriving during the fade brings the thumb back smoothly from where it was",
    lowE > fading - 0.25 && samples.some(([, o]) => o > lowE + 0.02 && o < 0.99) && samples.at(-1)[1] === 1,
    { fading, samples: samples.slice(0, 5) },
  );
  noErrors(ok, p);
});

test("scroll area: horizontal — one bar with a top seam, a sideways scroll reveals it", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=sa-h]" });
  const h = await ready(p, "sa-h");
  let s = await state(h);
  ok(
    "horizontal: one bar, a 12px cell with its top seam; the thumb hidden and slim toward the bottom edge",
    !s.bars.vertical &&
      s.bars.horizontal.bar.height === 12 &&
      s.bars.horizontal.seam === "1px" &&
      s.bars.horizontal.op === 0 &&
      /0\.57/.test(s.bars.horizontal.scale),
    s.bars,
  );
  const [hx, hy] = center(s.vpRect);
  await p.mouse.move(hx, hy - 10);
  await p.mouse.wheel(80, 0);
  await until(h, (ops, root) => ops.horizontal === 1 && root.firstElementChild.scrollLeft !== 0, 1000);
  s = await state(h);
  ok("horizontal: a sideways scroll reveals its thumb", s.bars.horizontal.op === 1 && s.left !== 0, {
    op: s.bars.horizontal.op,
    left: s.left,
  });
  noErrors(ok, p);
});

test("scroll area: both axes — the corner cell, one axis revealed at a time, the bottom cell on hover", async ({
  open,
  ok,
}) => {
  const p = await open({ ...VIEW, ready: "[data-testid=sa-both]" });
  const both = await ready(p, "sa-both");
  await until(both, (ops) => ops.vertical === 0 && ops.horizontal === 0, 3000);
  let s = await state(both);
  ok(
    "both: two bars and the corner cell; neither thumb shows at rest",
    s.bars.vertical && s.bars.horizontal && s.bars.vertical.op === 0 && s.bars.horizontal.op === 0 && s.corner,
    s.bars,
  );
  const [bx2, by2] = center(s.vpRect);
  await p.mouse.move(bx2, by2);
  await p.mouse.wheel(0, 60);
  await until(both, (ops) => ops.vertical === 1, 1000);
  s = await state(both);
  ok(
    "both: scrolling one axis reveals only that axis's thumb",
    s.bars.vertical.op === 1 && s.bars.horizontal.op === 0,
    { v: s.bars.vertical.op, h: s.bars.horizontal.op },
  );
  const hb = s.bars.horizontal.bar;
  await p.mouse.move(hb.x + 30, hb.y + 6);
  await until(
    both,
    (ops, root) =>
      ops.horizontal === 1 &&
      /^(1|none)$/.test(
        getComputedStyle(root.querySelector(":scope > [data-orientation=horizontal]").firstElementChild).scale,
      ),
    1000,
  );
  s = await state(both);
  ok(
    "both: the pointer on the bottom cell reveals and widens the horizontal thumb",
    s.bars.horizontal.op === 1 && (s.bars.horizontal.scale === "1" || s.bars.horizontal.scale === "none"),
    s.bars.horizontal,
  );
  noErrors(ok, p);
});

test("scroll area: scrollbarVisibility=always and the rail track", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=sa-always]" });
  const tk = await tokens(p);
  await ready(p, "sa-always");
  let s = await state(p.getByTestId("sa-always"));
  ok(
    "scrollbarVisibility=always: the thumb is there at rest, full width, ink-3",
    s.reveal === "always" &&
      s.bars.vertical.op === 1 &&
      (s.bars.vertical.scale === "none" || s.bars.vertical.scale === "1") &&
      s.bars.vertical.bg === tk.ink3,
    s.bars.vertical,
  );
  await ready(p, "sa-rail");
  s = await state(p.getByTestId("sa-rail"));
  ok(
    "rail: the hidden thumb is half of its 6px, centred on the rail",
    s.bars.vertical.op === 0 && s.bars.vertical.scale === "0.5 1",
    s.bars.vertical,
  );
  noErrors(ok, p);
});

test("scroll area RTL: the bar on the inline end; the edge reveals and widens inside the cell", async ({
  open,
  ok,
}) => {
  const p = await open({ ...VIEW, q: "dir=rtl" });
  const v = await ready(p, "sa-v");
  let s = await state(v);
  const bar = s.bars.vertical.bar;
  ok(
    "RTL: the bar is on the inline end (left); the slim thumb is centred in the cell",
    bar.x < s.content.x &&
      Math.abs((s.bars.vertical.thumb.left + s.bars.vertical.thumb.right) / 2 - (bar.left + 2 + bar.right - 3) / 2) <
        0.6,
    { bar, origin: s.bars.vertical.origin, thumb: s.bars.vertical.thumb },
  );
  await p.mouse.move(bar.x + 6, bar.y + 40);
  await until(
    v,
    (ops, root) =>
      ops.vertical === 1 &&
      !root
        .querySelector(":scope > [data-orientation=vertical]")
        .firstElementChild.getAnimations()
        .some((a) => a.playState === "running"),
    1000,
  );
  s = await state(v);
  ok(
    "RTL: the edge reveals and widens it inside the cell",
    s.bars.vertical.op === 1 &&
      s.bars.vertical.thumb.left >= bar.left + 2 - 0.6 &&
      s.bars.vertical.thumb.right <= bar.right - 1 - 2 + 0.6,
    s.bars.vertical.thumb,
  );
});

test("scroll area RTL: horizontal — scrolling toward the end reveals the thumb, moving from the right", async ({
  open,
  ok,
}) => {
  const p = await open({ ...VIEW, q: "dir=rtl", ready: "[data-testid=sa-h]" });
  const h = await ready(p, "sa-h");
  let s = await state(h);
  const [hx, hy] = center(s.vpRect);
  await p.mouse.move(hx, hy - 10);
  await p.mouse.wheel(-80, 0);
  await until(h, (ops, root) => ops.horizontal === 1 && root.firstElementChild.scrollLeft < 0, 1000);
  await frames(p);
  s = await state(h);
  ok(
    "RTL horizontal: scrolling toward the end reveals the thumb, which moves from the right",
    s.bars.horizontal.op === 1 && s.left < 0 && s.bars.horizontal.thumb.right < s.bars.horizontal.bar.right - 2,
    { left: s.left, thumb: s.bars.horizontal.thumb, bar: s.bars.horizontal.bar },
  );
});
