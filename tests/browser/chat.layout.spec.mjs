// The chat family's layout: one reading edge per run, attached bubbles, tones and frames, RTL and the narrow panel.
import { test } from "./fixtures.mjs";
import { chat, edges, rgb, until } from "./lib/chat.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["chat"] });

const VIEW = { width: 1280, height: 1000 };
const noErrors = (ok, p) =>
  ok("no page errors", p.errs.length + p.consoleErrs.length === 0, [...p.errs, ...p.consoleErrs]);

test("chat layout: each run's reading edge, the avatar, attached bubbles, compact replies and links", async ({
  open,
  ok,
}) => {
  const p = await open({ ...VIEW, ready: "[data-testid=ms-frame]" });
  const { frame } = await chat(p);
  const e = await edges(frame);
  ok(
    "layout: each run lines up on its own side: header, texts, glyphs and receipt on one line (±1px)",
    e.length >= 6 && e.every((r) => r.spread <= 1),
    e,
  );
  const cases = await edges(p.getByTestId("bubble-cases"));
  ok(
    "layout: the same holds for short, multiline, link, files-only and text-with-files bubbles",
    cases.every((r) => r.spread <= 1),
    cases,
  );
  const rtl = await edges(p.getByTestId("chat-rtl"));
  ok(
    "layout RTL: the lines mirror (theirs right, yours left)",
    rtl.every((r) => r.spread <= 1) && rtl.length === 2,
    rtl,
  );
  const geom = await frame.evaluate((f) => {
    const run = [...f.querySelectorAll('[data-slot=message][data-align="start"]')].find(
      (m) => m.querySelectorAll("[data-slot=bubble]").length > 2,
    );
    const av = run.querySelector("[data-slot=message-avatar]").getBoundingClientRect();
    const bubbles = [...run.querySelectorAll("[data-slot=bubble]")].map((x) => x.getBoundingClientRect());
    return {
      avTop: av.top,
      firstTop: bubbles[0].top,
      joins: bubbles.slice(1).map((x, i) => Math.round((bubbles[i].bottom - x.top) * 10) / 10),
    };
  });
  ok(
    "layout: the avatar is level with the first bubble's top keyline",
    Math.abs(geom.avTop - geom.firstTop) <= 1,
    geom,
  );
  ok(
    "layout: consecutive bubbles of a run share one 2px keyline (overlap 2px, no gap)",
    geom.joins.length > 0 && geom.joins.every((j) => j === 2),
    geom.joins,
  );
  const hug = await frame.evaluate((f) => {
    const content = f.querySelector("[data-slot=message-scroller-content]");
    const right = content.getBoundingClientRect().right - parseFloat(getComputedStyle(content).paddingRight);
    return [...f.querySelectorAll('[data-slot=message][data-align="end"] [data-slot=bubble]')].map((x) =>
      Math.round(right - x.getBoundingClientRect().right),
    );
  });
  ok(
    "layout: your runs sit at the end: every bubble touches the log's end edge",
    hug.every((d) => Math.abs(d) <= 1),
    hug,
  );
  const w = await p
    .getByTestId("bubble-cases")
    .evaluate((g) =>
      [...g.querySelectorAll("[data-slot=bubble]")].map((x) => Math.round(x.getBoundingClientRect().width)),
    );
  ok(
    "layout: a short reply stays compact; a long link wraps inside the column",
    w[0] < 80 && w[2] <= Math.round(Math.max(...w)),
    w,
  );
  const lk = await p.getByTestId("bubble-cases").evaluate((g) => {
    const a = g.querySelector("[data-slot=bubble-text] a");
    const bb = a.closest("[data-slot=bubble]").getBoundingClientRect();
    return a.getBoundingClientRect().right <= bb.right;
  });
  ok("layout: a long link never runs past its bubble", lk);
  noErrors(ok, p);
});

test("chat layout: bubble tones, the failed message, text direction, reactions and RTL runs", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=ms-frame]" });
  const { frame } = await chat(p);
  const tint = await rgb(p, "var(--kl-tint)");
  // The frame is the bubble itself; text and files are its cells
  const own = frame.locator("[data-slot=bubble][data-tone=tint]").first();
  const theirs = frame.locator("[data-slot=bubble][data-tone=plain]").first();
  ok(
    "chat: your bubbles are tint, theirs the cell surface; both 2px frames without radius",
    (await own.evaluate((b) => getComputedStyle(b).backgroundColor)) === tint &&
      (await theirs.evaluate((b) =>
        [getComputedStyle(b).borderTopWidth, getComputedStyle(b).borderBottomRightRadius].join(" "),
      )) === "2px 0px",
  );
  const att = frame.locator("[data-slot=bubble][data-tone=attention]");
  ok(
    "chat: a message that was not sent: attention frame with a ! cell and the reason beside it",
    (await att.evaluate((b) => getComputedStyle(b).borderTopColor)) === (await rgb(p, "var(--kl-red)")) &&
      (await att.locator("[data-slot=bubble-bang]").evaluate((b) => b.getBoundingClientRect().width)) >= 27 &&
      /Not sent: no signal/.test(await att.locator("xpath=..").innerText()),
  );
  ok(
    "chat: bubble text takes its own direction",
    (await own.locator("[data-slot=bubble-text]").first().getAttribute("dir")) === "auto",
  );
  ok(
    "chat: reactions are a pressed toggle with a full name",
    (await frame.locator("[data-slot=bubble-reactions] button").getAttribute("aria-label")) ===
      "Thumbs up, 1, you reacted",
  );
  const rtl = p.getByTestId("chat-rtl");
  const [them, me] = [
    await rtl.locator("[data-slot=message]").nth(0).locator("[data-slot=bubble]").first().boundingBox(),
    await rtl.locator("[data-slot=message]").nth(1).locator("[data-slot=bubble]").first().boundingBox(),
  ];
  ok(
    "chat RTL: their run at the right (start), yours at the left (end)",
    them.x + them.width > me.x + me.width && them.x > me.x,
    [them, me],
  );
  noErrors(ok, p);
});

test("chat layout: the narrow panel (340px) keeps everything inside and the reading edge", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=ms-frame]" });
  const { frame } = await chat(p);
  await p.getByRole("radio", { name: "Narrow panel" }).click();
  await until(
    p,
    () => Math.round(document.querySelector("[data-testid=ms-frame]").getBoundingClientRect().width) === 340,
  );
  await p.waitForFunction(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(true)))));
  const nar = await frame.evaluate((f) => {
    const vp = f.querySelector("[data-slot=message-scroller-viewport]");
    const c = f.querySelector("[data-slot=message-scroller-content]").getBoundingClientRect();
    const over = [
      ...f.querySelectorAll("[data-slot=bubble], [data-slot=message-header], [data-slot=message-footer]"),
    ].filter(
      (x) => x.getBoundingClientRect().right > c.right + 0.5 || x.getBoundingClientRect().left < c.left - 0.5,
    ).length;
    return {
      sideways: vp.scrollWidth - vp.clientWidth,
      over,
      av: f.querySelector("[data-slot=message-avatar] [data-slot=avatar]").getBoundingClientRect().width,
      w: Math.round(f.getBoundingClientRect().width),
    };
  });
  ok(
    "narrow (340px): nothing runs out of the log, no sideways scroll, a 24px face",
    nar.sideways === 0 && nar.over === 0 && nar.av === 24 && nar.w === 340,
    nar,
  );
  const ne = await edges(frame);
  ok(
    "narrow: the reading edge still holds in every run",
    ne.every((r) => r.spread <= 1),
    ne,
  );
  noErrors(ok, p);
});
