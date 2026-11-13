// MessageScroller: the log opens on the newest message, follows arrivals at the end, holds the reader's place while
// reading history, counts what arrived, and the bounded, interruptible jump to Latest.
import { test, idle } from "./fixtures.mjs";
import { chat, scrollStill, until } from "./lib/chat.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["chat"] });

const VIEW = { width: 1280, height: 1000 };
const noErrors = (ok, p) =>
  ok("no page errors", p.errs.length + p.consoleErrs.length === 0, [...p.errs, ...p.consoleErrs]);
const atEnd = (p) =>
  until(p, () => {
    const v = document.querySelector("[data-testid=ms-frame] [data-slot=message-scroller-viewport]");
    return v.scrollHeight - v.clientHeight - v.scrollTop <= 2;
  });

test("chat: the log is a named region, opens on the newest, and follows a new message at the end", async ({
  open,
  ok,
}) => {
  const p = await open({ ...VIEW, ready: "[data-testid=ms-frame]" });
  const { frame, vp, geo } = await chat(p);
  ok(
    "chat: the viewport is a focusable named region holding a log",
    (await vp.getAttribute("role")) === "region" &&
      (await vp.getAttribute("aria-label")) === "Conversation with Tomasz Wolak" &&
      (await vp.getAttribute("tabindex")) === "0" &&
      (await frame.locator("[role=log]").count()) === 1,
  );
  ok("chat: opens on the newest message", (await geo()).gap <= 2, await geo());
  const jump = frame.locator("[data-slot=message-scroller-button]");
  ok(
    "chat: no Latest cell while at the end (hidden, out of the tab order)",
    (await jump.getAttribute("data-active")) === "false" &&
      (await jump.getAttribute("tabindex")) === "-1" &&
      (await jump.evaluate((j) => getComputedStyle(j).visibility)) === "hidden",
  );
  await p.getByTestId("ms-incoming").click();
  await until(p, () => /Shipper confirmed/.test(document.querySelector("[data-testid=ms-frame] [role=log]").innerText));
  await atEnd(p);
  await scrollStill(vp);
  ok(
    "chat: a new message while at the end keeps the log at the end",
    (await geo()).gap <= 2 && /Shipper confirmed/.test(await frame.locator("[role=log]").innerText()),
    await geo(),
  );
  noErrors(ok, p);
});

test("chat: scrolled up, Latest appears, a new message holds the place, Latest returns", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=ms-frame]" });
  const { frame, vp, geo, toTop } = await chat(p);
  const jump = frame.locator("[data-slot=message-scroller-button]");
  // scroll up like a reader (wheel): setting scrollTop by script is, rightly, not treated as the reader's intent.
  await toTop();
  await until(
    p,
    () =>
      document.querySelector("[data-testid=ms-frame] [data-slot=message-scroller-button]")?.dataset.active === "true" &&
      getComputedStyle(document.querySelector("[data-testid=ms-frame] [data-slot=message-scroller-button]"))
        .visibility === "visible",
  );
  ok(
    "chat: scrolled up, the Latest cell appears on the bottom keyline",
    (await jump.getAttribute("data-active")) === "true" &&
      (await jump.evaluate((j) => getComputedStyle(j).visibility)) === "visible",
  );
  const top0 = (await geo()).top;
  const n0 = await frame.locator("[data-slot=bubble]").count();
  await p.getByTestId("ms-incoming").click();
  await until(p, (n) => document.querySelectorAll("[data-testid=ms-frame] [data-slot=bubble]").length > n, n0);
  await scrollStill(vp);
  ok("chat: a new message while scrolled up holds the reader's place", Math.abs((await geo()).top - top0) <= 2, [
    top0,
    await geo(),
  ]);
  await jump.click();
  await atEnd(p);
  await scrollStill(vp);
  ok("chat: Latest returns to the newest message", (await geo()).gap <= 2, await geo());
  noErrors(ok, p);
});

test("chat: a reply while following unfolds as a new run; three in a row join it", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=ms-frame]" });
  const { frame, vp, geo } = await chat(p);
  // state before this block: the last run is the reader's own, delivered and read
  await p.getByTestId("ms-input").fill("Ok.");
  await p.keyboard.press("Enter");
  await until(
    p,
    () =>
      /^Read/.test(
        [...document.querySelectorAll('[data-testid=ms-frame] [data-testid="receipt"]')].at(-1)?.innerText ?? "",
      ),
    null,
    8000,
  );
  await scrollStill(vp);
  await p.getByTestId("ms-incoming").click();
  await until(
    p,
    () =>
      [...document.querySelectorAll("[data-testid=ms-frame] [data-slot=message]")].at(-1)?.dataset.align === "start",
  );
  const arrived = await frame
    .locator("[data-slot=message]")
    .last()
    .evaluate((m) => ({ align: m.dataset.align, anims: m.getAnimations().length }));
  ok(
    "arrival: a reply while following unfolds (its run, with header and avatar) and the log follows",
    arrived.align === "start" && arrived.anims === 1,
    arrived,
  );
  await idle(p).catch(() => {});
  await atEnd(p);
  ok("arrival: at the end once it lands", (await geo()).gap <= 2, await geo());
  await p.getByTestId("ms-three").click();
  await until(
    p,
    () =>
      [...document.querySelectorAll("[data-testid=ms-frame] [data-slot=message]")]
        .at(-1)
        ?.querySelectorAll("[data-slot=bubble]").length === 4,
  );
  await idle(p).catch(() => {});
  await atEnd(p);
  await scrollStill(vp);
  ok(
    "arrival: three in a row join one run, each attached, the log at the end",
    (await geo()).gap <= 2 &&
      (await frame.locator("[data-slot=message]").last().locator("[data-slot=bubble]").count()) === 4,
    await geo(),
  );
  noErrors(ok, p);
});

test("chat: reading — three replies arrive below, the line holds and Latest counts them", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=ms-frame]" });
  const { frame, vp } = await chat(p);
  const box = await frame.boundingBox();
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await p.mouse.wheel(0, -500);
  await scrollStill(vp);
  const anchorTop = () =>
    vp.evaluate((v) => {
      const vt = v.getBoundingClientRect().top;
      const u = [...v.querySelectorAll("[data-slot=bubble]")].find((x) => x.getBoundingClientRect().top >= vt);
      return { id: u.dataset.msg ?? u.innerText.slice(0, 20), top: u.getBoundingClientRect().top };
    });
  const a0 = await anchorTop();
  const n0 = await frame.locator("[data-slot=bubble]").count();
  await p.getByTestId("ms-three").click();
  await until(p, (n) => document.querySelectorAll("[data-testid=ms-frame] [data-slot=bubble]").length === n + 3, n0);
  await idle(p).catch(() => {});
  await scrollStill(vp);
  const a1 = await vp.evaluate(
    (v, id) =>
      [...v.querySelectorAll("[data-slot=bubble]")]
        .find((x) => (x.dataset.msg ?? x.innerText.slice(0, 20)) === id)
        .getBoundingClientRect().top,
    a0.id,
  );
  ok("reading: three replies arrive below; the line being read does not move", Math.abs(a1 - a0.top) <= 1, [a0, a1]);
  const jump = frame.locator("[data-slot=message-scroller-button]");
  ok(
    "reading: the Latest cell counts them ('3 new') and says so in its name",
    /3 new/.test(await jump.innerText()) && (await jump.getAttribute("aria-label")) === "Latest, 3 new messages",
    [await jump.innerText(), await jump.getAttribute("aria-label")],
  );
  noErrors(ok, p);
});

test("chat: history — earlier messages and growth above the reader keep the line in place", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=ms-frame]" });
  const { frame, vp, toTop } = await chat(p);
  await toTop();
  const m1 = frame.locator('[data-msg="m1"]');
  const y0 = (await m1.boundingBox()).y;
  await p.getByTestId("ms-earlier").click();
  await frame.locator('[data-msg="e1"]').waitFor({ state: "attached" });
  const prependAnims = await frame.evaluate((f) =>
    [...f.querySelectorAll("[data-slot=message], [data-slot=bubble]")].reduce(
      (n, x) => n + x.getAnimations().length,
      0,
    ),
  );
  await scrollStill(vp);
  const y1 = (await m1.boundingBox()).y;
  ok(
    "history: loading earlier messages keeps the line being read in place and animates nothing",
    Math.abs(y1 - y0) <= 1 && prependAnims === 0 && (await frame.locator('[data-msg="e1"]').count()) === 1,
    [y0, y1, prependAnims],
  );
  // a size change above the reader (a file's reason wraps, a thumbnail loads): engines without scroll anchoring too
  {
    const bx = await frame.boundingBox();
    await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2);
    await p.mouse.wheel(0, 250);
    await scrollStill(vp);
  }
  const held = await vp.evaluate(async (v) => {
    const vt = v.getBoundingClientRect().top;
    const bs = [...v.querySelectorAll("[data-slot=bubble]")];
    const i = bs.findIndex((x) => x.getBoundingClientRect().top >= vt);
    const t0 = bs[i].getBoundingClientRect().top;
    const above = bs[i - 1]; // partly in view or just above: its growth must not push the reader
    above.style.paddingBlockEnd = "80px";
    await new Promise((r) => setTimeout(r, 200)); // timing: kept, the hold is judged after the resize observers have run
    const t1 = bs[i].getBoundingClientRect().top;
    above.style.paddingBlockEnd = "";
    await new Promise((r) => setTimeout(r, 200)); // timing: kept, as above
    return [t0, t1, bs[i].getBoundingClientRect().top];
  });
  ok(
    "history: something above the reader grows and shrinks; the line being read holds",
    Math.abs(held[1] - held[0]) <= 1 && Math.abs(held[2] - held[0]) <= 1,
    held,
  );
  noErrors(ok, p);
});

test("chat: the jump — bounded from the oldest message, folds at the end", { tag: "@timing" }, async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=ms-frame]" });
  const { frame, geo, toTop } = await chat(p);
  const jump = frame.locator("[data-slot=message-scroller-button]");
  await toTop();
  await until(
    p,
    () =>
      document.querySelector("[data-testid=ms-frame] [data-slot=message-scroller-button]")?.dataset.active === "true",
  );
  const t0 = Date.now();
  await jump.click();
  let landed = 0;
  for (let i = 0; i < 40; i++) {
    await p.waitForTimeout(50); // timing: the landing time itself is measured (≤ 1s)
    if ((await geo()).gap <= 2) {
      landed = Date.now() - t0;
      break;
    }
  }
  ok(
    "jump: from the oldest message it lands on the newest within a bounded time (≤ 1s)",
    landed > 0 && landed <= 1000,
    landed,
  );
  await until(
    p,
    () =>
      document.querySelector("[data-testid=ms-frame] [data-slot=message-scroller-button]")?.dataset.active === "false",
  );
  ok(
    "jump: at the end the count is gone and the cell folds",
    (await jump.getAttribute("data-active")) === "false" && (await jump.getAttribute("aria-label")) === null,
  );
  noErrors(ok, p);
});

test("chat: the jump — a wheel during it stops it where the reader took over", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=ms-frame]" });
  const { frame, geo, toTop } = await chat(p);
  const jump = frame.locator("[data-slot=message-scroller-button]");
  const box = await frame.boundingBox();
  await toTop();
  await until(
    p,
    () =>
      document.querySelector("[data-testid=ms-frame] [data-slot=message-scroller-button]")?.dataset.active === "true",
  );
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await jump.click();
  await p.waitForTimeout(40); // timing: the wheel must arrive while the jump is in flight
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await p.mouse.wheel(0, -300);
  await p.waitForTimeout(900); // timing: past the jump's bounded duration — it must not have resumed
  const g1 = await geo();
  await p.waitForTimeout(600); // timing: "it stays there" — nothing moves over the next 600ms
  const g2 = await geo();
  ok(
    "jump: a wheel during the jump stops it where the reader took over, and it stays there",
    g1.gap > 40 && Math.abs(g2.top - g1.top) <= 1,
    [g1, g2],
  );
  noErrors(ok, p);
});

test("chat: the jump by keyboard lands on the newest and focuses the log", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=ms-frame]" });
  const { frame, vp, geo, toTop } = await chat(p);
  const jump = frame.locator("[data-slot=message-scroller-button]");
  await toTop();
  await until(
    p,
    () =>
      document.querySelector("[data-testid=ms-frame] [data-slot=message-scroller-button]")?.dataset.active === "true",
  );
  await jump.focus();
  await p.keyboard.press("Enter");
  await atEnd(p);
  await scrollStill(vp);
  const kb = [
    await geo(),
    await p.evaluate(() => document.activeElement?.getAttribute("data-slot") || document.activeElement?.tagName),
  ];
  ok(
    "jump by keyboard: lands on the newest and puts focus on the log",
    kb[0].gap <= 2 && kb[1] === "message-scroller-viewport",
    kb,
  );
  noErrors(ok, p);
});
