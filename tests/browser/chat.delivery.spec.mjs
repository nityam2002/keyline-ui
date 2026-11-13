// Chat delivery: sending (pending segment, Sending… → Sent → Read), the unfold, rapid sending, the composer, and
// retrying a message that was not sent.
import { test } from "./fixtures.mjs";
import { chat, scrollStill, until } from "./lib/chat.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["chat"] });

const VIEW = { width: 1280, height: 1000 };
const noErrors = (ok, p) =>
  ok("no page errors", p.errs.length + p.consoleErrs.length === 0, [...p.errs, ...p.consoleErrs]);

test("chat: the composer appends your message at the end, on your side", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=ms-frame]" });
  const { frame, vp, geo } = await chat(p);
  await p.getByTestId("ms-input").fill("On my way to bay 2.");
  await p.keyboard.press("Enter");
  await until(p, () =>
    /On my way to bay 2\./.test(
      [...document.querySelectorAll("[data-testid=ms-frame] [data-message-id]")].at(-1)?.innerText ?? "",
    ),
  );
  await until(p, () => {
    const v = document.querySelector("[data-testid=ms-frame] [data-slot=message-scroller-viewport]");
    return v.scrollHeight - v.clientHeight - v.scrollTop <= 2;
  });
  await scrollStill(vp);
  const last = frame.locator("[data-message-id]").last();
  ok(
    "chat: sending appends your message at the end, on your side",
    (await geo()).gap <= 2 &&
      /On my way to bay 2\./.test(await last.innerText()) &&
      (await last.locator("[data-slot=message]").getAttribute("data-align")) === "end",
    await geo(),
  );
  noErrors(ok, p);
});

test("chat: send — pending, Sending…, the unfold, Sent, Read; then rapid sending", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=ms-frame]" });
  const { frame, geo } = await chat(p);
  // count the unfolds started (robust to timing under load)
  await p.evaluate(() => {
    window.__unfolds = [];
    const o = Element.prototype.animate;
    Element.prototype.animate = function (...a) {
      window.__unfolds.push(this.dataset.slot);
      return o.apply(this, a);
    };
  });
  const n = await frame.locator("[data-slot=bubble]").count();
  await p.getByTestId("ms-input").fill("Ok.");
  await p.keyboard.press("Enter");
  await until(p, (n) => document.querySelectorAll("[data-testid=ms-frame] [data-slot=bubble]").length > n, n, 2000);
  const newest = frame.locator("[data-slot=bubble]").last();
  const receipt = frame.getByTestId("receipt").last();
  ok(
    "send: your message is in at once, on your side, with the pending segment on its bottom keyline",
    (await newest.locator("[data-slot=bubble-text]").innerText()) === "Ok." &&
      (await newest.getAttribute("data-pending")) === "" &&
      (await newest.locator(".kl-pending").count()) === 1 &&
      (await newest.getAttribute("aria-busy")) === "true",
  );
  ok("send: the receipt under it says Sending…", (await receipt.innerText()) === "Sending…", await receipt.innerText());
  ok("send: the log is at the newest message", (await geo()).gap <= 2, await geo());
  await until(p, () => window.__unfolds.length > 0, null, 1000);
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const anim = await p.evaluate(() => window.__unfolds.splice(0));
  ok(
    "send: the new message unfolds from its top keyline (one animation, on the message or bubble)",
    anim.length === 1 && /^(message|bubble)$/.test(anim[0]),
    anim,
  );
  await until(
    p,
    () => [...document.querySelectorAll('[data-testid=ms-frame] [data-testid="receipt"]')].at(-1)?.innerText === "Sent",
    null,
    4000,
  );
  ok(
    "send: delivered: the segment is gone and the receipt says Sent",
    (await newest.locator(".kl-pending").count()) === 0 && (await receipt.innerText()) === "Sent",
  );
  await until(
    p,
    () =>
      /^Read/.test(
        [...document.querySelectorAll('[data-testid=ms-frame] [data-testid="receipt"]')].at(-1)?.innerText ?? "",
      ),
    null,
    6000,
  );
  ok(
    "send: read: the receipt says Read with the time, still right under it",
    /^Read 14:\d\d$/.test(await receipt.innerText()) &&
      (await receipt.evaluate((r) => r.previousElementSibling?.getAttribute("data-slot") === "bubble")),
  );
  ok(
    "send: one receipt per run, under its last delivered message",
    (await frame.locator("[data-slot=message]").last().getByTestId("receipt").count()) === 1,
  );

  // rapid sending
  const n0 = await frame.locator("[data-slot=bubble]").count();
  for (let i = 1; i <= 6; i++) {
    await p.getByTestId("ms-input").fill(`Rapid ${i}`);
    await p.keyboard.press("Enter");
  }
  await until(
    p,
    (n) => document.querySelectorAll("[data-testid=ms-frame] [data-slot=bubble]").length === n + 6,
    n0,
    2000,
  );
  await until(
    p,
    () => {
      const v = document.querySelector("[data-testid=ms-frame] [data-slot=message-scroller-viewport]");
      return v.scrollHeight - v.clientHeight - v.scrollTop <= 2;
    },
    null,
    2000,
  );
  const texts = await frame
    .locator("[data-slot=bubble]")
    .evaluateAll((bs) => bs.slice(-6).map((x) => x.querySelector("[data-slot=bubble-text]").innerText));
  ok(
    "rapid send: six messages in order, all in, the log at the end",
    (await frame.locator("[data-slot=bubble]").count()) === n0 + 6 &&
      texts.join() === "Rapid 1,Rapid 2,Rapid 3,Rapid 4,Rapid 5,Rapid 6" &&
      (await geo()).gap <= 2,
    [texts, await geo()],
  );
  ok(
    "rapid send: the newest is still pending while the controls stay usable",
    (await frame.locator("[data-slot=bubble]").last().getAttribute("data-pending")) === "" &&
      (await p.getByTestId("ms-input").isEditable()),
  );
  await until(
    p,
    () =>
      !document.querySelector("[data-testid=ms-frame] .kl-pending") &&
      /^Read/.test(
        [...document.querySelectorAll('[data-testid=ms-frame] [data-testid="receipt"]')].at(-1)?.innerText ?? "",
      ),
    null,
    8000,
  );
  ok(
    "rapid send: all delivered; one receipt for the run, Read",
    (await frame.locator(".kl-pending").count()) === 0 &&
      /^Read/.test(await frame.getByTestId("receipt").last().innerText()),
  );
  noErrors(ok, p);
});

test("chat: retrying a message that was not sent", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=ms-frame]" });
  const { frame } = await chat(p);
  const failed = frame.locator('[data-slot=bubble][data-tone="attention"]');
  await failed.scrollIntoViewIfNeeded();
  await frame.getByRole("button", { name: "Retry", exact: true }).click();
  await until(
    p,
    () => document.querySelector('[data-testid=ms-frame] [data-msg="m6"]')?.dataset.tone === "tint",
    null,
    2000,
  );
  ok(
    "retry message: the ! cell retracts, the bubble turns yours again and sends",
    (await frame.locator('[data-msg="m6"]').getAttribute("data-tone")) === "tint" &&
      (await frame.locator('[data-msg="m6"]').getAttribute("data-pending")) === "",
  );
  await until(
    p,
    () =>
      /^Read/.test(
        document.querySelector('[data-testid=ms-frame] [data-msg="m6"]')?.nextElementSibling?.innerText ?? "",
      ),
    null,
    6000,
  );
  ok(
    "retry message: then reads Read under it",
    /^Read/.test(await frame.locator('[data-msg="m6"]').locator("xpath=following-sibling::*[1]").innerText()),
  );
  noErrors(ok, p);
});
