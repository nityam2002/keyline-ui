// The chat family under reduced motion, and on a phone (touch, dark theme, RTL page).
import { test } from "./fixtures.mjs";
import { chat, edges, scrollStill, until } from "./lib/chat.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["chat"] });

test("chat: reduced motion — no unfolds, a static pending segment, the tick kept, the jump at once", async ({
  open,
  ok,
}) => {
  const p = await open({
    width: 1280,
    height: 1000,
    q: "motion=reduce",
    ctx: { reducedMotion: "reduce" },
    ready: "[data-testid=ms-frame]",
  });
  const { frame, geo, toTop } = await chat(p);
  const n = await frame.locator(".kl-bubble").count();
  await p.getByTestId("ms-input").fill("Still here.");
  await p.keyboard.press("Enter");
  await until(p, (n) => document.querySelectorAll("[data-testid=ms-frame] .kl-bubble").length > n, n, 2000);
  const nb = frame.locator(".kl-bubble").last();
  const st = await nb.evaluate((x) => ({
    anims: [x, x.closest(".kl-msg")].flatMap((e) => e.getAnimations()).length,
    pend: getComputedStyle(x.querySelector(".kl-pending"), "::before").animationName,
  }));
  ok(
    "reduced: a sent message appears at once (no unfold); sending is a static hatched segment",
    st.anims === 0 && st.pend === "none",
    st,
  );
  ok(
    "reduced: the receipt still says Sending…",
    (await frame.getByTestId("receipt").last().innerText()) === "Sending…",
  );
  const m = await frame.locator(".kl-msg").count();
  await p.getByTestId("ms-incoming").click();
  await until(p, (m) => document.querySelectorAll("[data-testid=ms-frame] .kl-msg").length > m, m, 2000);
  ok(
    "reduced: an arrival has no animation",
    (await frame
      .locator(".kl-msg")
      .last()
      .evaluate(
        (m) =>
          m.getAnimations().length + [...m.querySelectorAll("*")].reduce((n, x) => n + x.getAnimations().length, 0),
      )) === 0,
  );
  await p.getByTestId("ms-attach").click();
  await p.waitForFunction(
    () => [...document.querySelectorAll('[data-testid="ms-frame"] .kl-att')].at(-1).dataset.mark === "done",
    null,
    { timeout: 6000 },
  );
  const mk = await frame
    .locator(".kl-att")
    .last()
    .locator(".kl-att-mark")
    .evaluate((m) => getComputedStyle(m).clipPath);
  ok(
    "reduced: the done tick still shows (instantly full), so the feedback is kept",
    mk !== "circle(0px at 50% 100%)",
    mk,
  );
  await toTop();
  await until(p, () => document.querySelector("[data-testid=ms-frame] .kl-ms-jump")?.dataset.active === "true");
  await frame.locator(".kl-ms-jump").click();
  await p.waitForTimeout(80); // timing: "at once" — landed 80ms after the click
  ok("reduced: the jump lands at once", (await geo()).gap <= 2, await geo());
  ok("reduced: no page errors", p.errs.length + p.consoleErrs.length === 0, [...p.errs, ...p.consoleErrs]);
});

test("chat: phone, dark, RTL page — the reading edge, sides, isolation, frames, taps", async ({ open, ok, eng }) => {
  const p = await open({
    width: 390,
    height: 844,
    q: "theme=dark&dir=rtl",
    ctx: { hasTouch: true, isMobile: eng === "chromium" },
    ready: "[data-testid=ms-frame]",
  });
  const { frame, vp, geo, toTop } = await chat(p);
  const e = await edges(frame);
  ok(
    "phone, dark, RTL page: the reading edge holds",
    e.every((r) => r.spread <= 1),
    e,
  );
  const side = await frame.evaluate((f) => {
    const c = f.querySelector(".kl-ms-content").getBoundingClientRect();
    const end = f.querySelector('.kl-msg[data-align="end"] .kl-bubble').getBoundingClientRect();
    const start = f.querySelector('.kl-msg[data-align="start"] .kl-bubble').getBoundingClientRect();
    return {
      yoursLeft: end.left - c.left,
      theirsRight: c.right - start.right,
      sideways: f.querySelector(".kl-ms-vp").scrollWidth - f.querySelector(".kl-ms-vp").clientWidth,
    };
  });
  ok(
    "RTL page: your runs at the left, theirs at the right, nothing sideways",
    side.yoursLeft < 40 && side.sideways === 0,
    side,
  );
  const det = await frame.evaluate((f) =>
    [...f.querySelectorAll(".kl-att-desc")].map((d) => {
      const t = d.querySelector("bdi").getBoundingClientRect();
      const n = d.parentElement.querySelector(".kl-att-title").getBoundingClientRect();
      return Math.round(Math.abs(t.right - n.right));
    }),
  );
  ok(
    "RTL page: each file's name and detail start on the same (right) edge",
    det.length > 0 && det.every((x) => x <= 1),
    det,
  );
  const foot = await frame
    .locator('.kl-msg-f[data-tone="attention"] bdi')
    .first()
    .evaluate((x) => x.textContent);
  ok("RTL page: a failure reason keeps its punctuation in place (isolated)", foot === "Not sent: no signal.", foot);
  const seam = await frame
    .locator(".kl-bubble")
    .first()
    .evaluate((x) => getComputedStyle(x).borderTopColor);
  ok(
    "dark: bubbles keep their frame (not a white slab): the frame is the dark line tone",
    !/rgb\(255, 255, 255\)/.test(seam),
    seam,
  );
  await toTop();
  await until(p, () => document.querySelector("[data-testid=ms-frame] .kl-ms-jump")?.dataset.active === "true");
  await frame.locator(".kl-ms-jump").tap();
  await until(p, () => {
    const v = document.querySelector("[data-testid=ms-frame] .kl-ms-vp");
    return v.scrollHeight - v.clientHeight - v.scrollTop <= 2;
  });
  await scrollStill(vp);
  ok("touch: tapping Latest lands on the newest", (await geo()).gap <= 2, await geo());
  await p.getByTestId("ms-attach-fail").tap();
  await p.waitForFunction(
    () => [...document.querySelectorAll('[data-testid="ms-frame"] .kl-att')].at(-1).dataset.status === "error",
    null,
    { timeout: 4000 },
  );
  const rb = frame
    .locator(".kl-att")
    .last()
    .getByRole("button", { name: /^Retry/ });
  const rbb = await rb.boundingBox();
  await rb.tap();
  await until(
    p,
    () => [...document.querySelectorAll('[data-testid="ms-frame"] .kl-att')].at(-1).dataset.status === "uploading",
    null,
    2000,
  );
  ok(
    "touch: Retry is a full-height cell (≥ 40px tall) and a tap resumes the upload",
    rbb.height >= 40 && (await frame.locator(".kl-att").last().getAttribute("data-status")) === "uploading",
    rbb,
  );
  ok("phone: no page errors", p.errs.length + p.consoleErrs.length === 0, [...p.errs, ...p.consoleErrs]);
});
