// OTP field: typing, filtering, Backspace, paste, the verify signals and focus recovery, slot names, Form
// required/validate/submit, RTL order, narrow and cell layouts, disabled, masked, in a dialog.
import { test } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["otp"] });

const val = (slots) => slots.evaluateAll((xs) => xs.map((x) => x.value).join(""));
const until = (p, fn, arg, timeout = 4000) => p.waitForFunction(fn, arg, { timeout }).catch(() => {});

for (const q of ["theme=light", "theme=dark&density=compact&cut=off"]) {
  test(`otp field: typing, verify signals, paste (${q})`, async ({ open, ok }) => {
    const p = await open({ route: "specimen", q, ready: "#otp" });
    const f = p.getByTestId("otp-verify");
    await f.scrollIntoViewIfNeeded();
    const slots = f.locator("[data-slot=otp-field-input]");
    ok(
      `${q}: six slots, split 3 + 3 by one join cell`,
      (await slots.count()) === 6 && (await f.locator("[data-slot=otp-field-separator]").count()) === 1,
      null,
    );
    ok(
      `${q}: the first slot is named by the label and described by the description; the rest by position`,
      (await f
        .getByRole("textbox", { name: "Verification code" })
        .evaluate(
          (x) =>
            x.getAttribute("data-slot") === "otp-field-input" &&
            /Sent to/.test(
              document.getElementById(x.getAttribute("aria-describedby")?.split(" ")[0] ?? "")?.textContent ?? "",
            ),
        )) && (await slots.nth(1).getAttribute("aria-label")) === "Character 2 of 6",
      null,
    );
    await slots.first().click();
    await p.keyboard.type("1a2");
    ok(
      `${q}: typing advances; letters are refused in a numeric code`,
      (await val(slots)) === "12" &&
        (await p.evaluate(() => document.activeElement?.getAttribute("aria-label"))) === "Character 3 of 6",
      await slots.evaluateAll((xs) => xs.map((x) => x.value)),
    );
    await p.keyboard.press("Backspace");
    ok(`${q}: Backspace clears back one slot`, (await val(slots)) === "1", null);
    const seams = await slots.evaluateAll((xs) =>
      xs.map((x) => {
        const r = x.getBoundingClientRect();
        return [Math.round(r.left), Math.round(r.right)];
      }),
    );
    ok(
      `${q}: slots share seams (each starts where the last ends, the join between 3 and 4)`,
      seams.every((s, i) => i === 0 || i === 3 || s[0] === seams[i - 1][1]),
      seams,
    );
    // wrong code → pending → failed, focus back on the first slot with the code kept
    await p.keyboard.type("23456");
    await until(
      p,
      () =>
        document.querySelector("[data-testid=otp-verify] [data-slot=otp-field-frame]")?.getAttribute("aria-busy") ===
          "true" && !!document.querySelector("[data-testid=otp-verify] .kl-pending"),
    );
    // one snapshot of the pending state (it lasts about a second; separate round trips can outrun it under load)
    const pend = await f.evaluate((f) => ({
      busy: f.querySelector("[data-slot=otp-field-frame]").getAttribute("aria-busy"),
      ro: f.querySelector("[data-slot=otp-field-input]").readOnly,
      seg: f.querySelectorAll(".kl-pending").length,
      status: f.querySelector("[role=status]").textContent,
    }));
    ok(
      `${q}: complete → pending: busy, slots read-only, a segment on the bottom keyline`,
      pend.busy === "true" && pend.ro && pend.seg === 1,
      pend,
    );
    ok(`${q}: pending is announced`, /Checking the code/.test(pend.status), pend);
    await until(p, () => {
      const f = document.querySelector("[data-testid=otp-verify]"),
        a = document.activeElement;
      return (
        f.hasAttribute("data-invalid") &&
        /doesn't match/.test(f.querySelector("[data-slot=field-error]")?.textContent ?? "") &&
        f.querySelector(".kl-field-bang")?.getBoundingClientRect().width > 20 &&
        a?.getAttribute("data-slot") === "otp-field-input" &&
        !a.getAttribute("aria-label") &&
        a.selectionEnd - a.selectionStart === 1
      );
    });
    ok(
      `${q}: failed: invalid, the ! cell and the message`,
      (await f.getAttribute("data-invalid")) !== null &&
        /doesn't match/.test(await f.locator("[data-slot=field-error]").textContent()) &&
        (await f.locator(".kl-field-bang").evaluate((x) => x.getBoundingClientRect().width)) > 20,
      null,
    );
    ok(
      `${q}: failed: the caret returns to the first slot, the code stays visible and selected`,
      (await p.evaluate(() => {
        const a = document.activeElement;
        return (
          a?.getAttribute("data-slot") === "otp-field-input" &&
          !a.getAttribute("aria-label") &&
          a.selectionEnd - a.selectionStart === 1
        );
      })) && (await val(slots)) === "123456",
      null,
    );
    // paste the right code
    await slots.first().focus();
    await p.evaluate(() => {
      const dt = new DataTransfer();
      dt.setData("text/plain", "246 810");
      document.activeElement.dispatchEvent(
        new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }),
      );
    });
    await until(
      p,
      () =>
        [...document.querySelectorAll("[data-testid=otp-verify] [data-slot=otp-field-input]")]
          .map((x) => x.value)
          .join("") === "246810",
    );
    ok(`${q}: paste fills every slot (spaces dropped)`, (await val(slots)) === "246810", await val(slots));
    ok(`${q}: a new attempt clears the failed state`, (await f.getAttribute("data-invalid")) === null, null);
    await until(
      p,
      () =>
        document.querySelector("[data-testid=otp-verify] [data-slot=otp-field-done]")?.getAttribute("data-open") ===
          "" &&
        /Code verified/.test(document.querySelector("[data-testid=otp-verify] [role=status]")?.textContent ?? ""),
    );
    await until(
      p,
      () =>
        document.querySelector("[data-testid=otp-verify] [data-slot=otp-field-done]").getBoundingClientRect().width >
        20,
    );
    ok(
      `${q}: done: a ✓ cell is inserted and announced`,
      (await f.locator("[data-slot=otp-field-done]").getAttribute("data-open")) === "" &&
        (await f.locator("[data-slot=otp-field-done]").evaluate((x) => x.getBoundingClientRect().width)) > 20 &&
        /Code verified/.test(await f.locator("[role=status]").textContent()),
      null,
    );
    ok(`${q}: no page errors`, p.errs.length === 0, p.errs);
  });

  test(`otp field: Form required, validate, submit (${q})`, async ({ open, ok }) => {
    const p = await open({ route: "specimen", q, ready: "#otp" });
    const form = p.getByTestId("otp-form");
    await form.scrollIntoViewIfNeeded();
    await form.getByRole("button", { name: "Use code" }).click();
    await until(p, () => {
      const f = document.querySelector("[data-testid=otp-form]");
      return (
        f.querySelector("[data-slot=otp-field]")?.hasAttribute("data-invalid") &&
        f.querySelectorAll("[data-slot=field-error]").length === 1
      );
    });
    ok(
      `${q}: Form: an empty required code is invalid with a message`,
      (await form.locator("[data-slot=otp-field]").getAttribute("data-invalid")) !== null &&
        (await form.locator("[data-slot=field-error]").count()) === 1,
      null,
    );
    const rslots = form.locator("[data-slot=otp-field-input]");
    await rslots.first().click();
    await p.keyboard.type("abcdefgh");
    ok(
      `${q}: alphanumeric: letters kept, shown as typed`,
      (await val(rslots).then((v) => v.toLowerCase())) === "abcdefgh",
      null,
    );
    await form.getByRole("button", { name: "Use code" }).click();
    await until(p, () =>
      /at least one digit/.test(
        document.querySelector("[data-testid=otp-form] [data-slot=field-error]")?.textContent ?? "",
      ),
    );
    ok(
      `${q}: Form: validate rejects a code without a digit`,
      /at least one digit/.test(await form.locator("[data-slot=field-error]").textContent()),
      null,
    );
    await rslots.first().click();
    await p.keyboard.press("ControlOrMeta+a").catch(() => {});
    for (let i = 0; i < 8; i++) await p.keyboard.press("Backspace");
    await rslots.first().click();
    await p.keyboard.type("ab12cd34");
    await form.getByRole("button", { name: "Use code" }).click();
    await until(p, () =>
      /"recovery":"ab12cd34"/i.test(document.querySelector("[data-testid=otp-submitted]")?.textContent ?? ""),
    );
    const sub = await p.getByTestId("otp-submitted").textContent();
    ok(`${q}: Form: the code submits under its name`, /"recovery":"ab12cd34"/i.test(sub), sub);
    ok(`${q}: no page errors`, p.errs.length === 0, p.errs);
  });
}

test("otp field: RTL, narrow, every OTP's geometry, cell layout, disabled, masked, in a dialog", async ({
  open,
  ok,
}) => {
  const p = await open({ route: "specimen", q: "theme=light", ready: "#otp" });
  // RTL: the code keeps its order, the ! cell leads at the page's start (right)
  const r = p.getByTestId("otp-rtl");
  await r.scrollIntoViewIfNeeded();
  const xs = await r
    .locator("[data-slot=otp-field-input]")
    .evaluateAll((xs) => xs.map((x) => Math.round(x.getBoundingClientRect().left)));
  const bang = await r.locator(".kl-field-bang").boundingBox();
  ok(
    "RTL: slots stay left to right (2468 reads in order)",
    xs.every((x, i) => i === 0 || x > xs[i - 1]),
    xs,
  );
  ok("RTL: the ! cell is at the page's start (right of the slots)", bang.x >= xs[xs.length - 1], { bang, xs });
  // narrow
  const n = p.getByTestId("otp-narrow");
  const fw = (await n.locator("[data-slot=otp-field-frame]").boundingBox()).width;
  ok("230px column: the frame fits (slots give way)", fw <= 230.5, fw);
  // every OTP on the page: cells inside the frame, every character's ink inside its slot with room to spare
  const geo = await p.locator("[data-slot=otp-field-frame]").evaluateAll((frames) =>
    frames.map((fr) => {
      const f = fr.getBoundingClientRect(),
        bw = parseFloat(getComputedStyle(fr).borderRightWidth);
      const inner = [f.left + bw, f.right - bw];
      const cells = [...fr.querySelectorAll("[data-slot=otp-field-input], [data-slot=otp-field-separator]")];
      const outside = cells.filter((c) => {
        const r = c.getBoundingClientRect();
        return r.left < inner[0] - 0.5 || r.right > inner[1] + 0.5;
      }).length;
      const ctx = document.createElement("canvas").getContext("2d");
      let tight = 0,
        minRoom = 99,
        minSlot = 99;
      for (const s of fr.querySelectorAll("[data-slot=otp-field-input]")) {
        const cs = getComputedStyle(s),
          r = s.getBoundingClientRect();
        minSlot = Math.min(minSlot, r.width);
        if (s.scrollWidth > s.clientWidth + 0.5) tight++;
        if (!s.value || s.type === "password") continue;
        ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const m = ctx.measureText(s.value),
          ink = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
        const room = (s.clientWidth - ink) / 2;
        minRoom = Math.min(minRoom, room);
        if (room < 4) tight++;
      }
      return {
        label: fr.closest("[data-slot=otp-field]")?.querySelector("label")?.textContent,
        frameW: Math.round(f.width),
        parentW: Math.round(fr.parentElement.getBoundingClientRect().width),
        outside,
        tight,
        minRoom: Math.round(minRoom * 10) / 10,
        minSlot: Math.round(minSlot),
      };
    }),
  );
  ok(
    "every OTP: slots and joins inside the frame, never past its clipped edge",
    geo.every((g) => g.outside === 0),
    geo.filter((g) => g.outside),
  );
  ok(
    "every OTP: each character's ink has ≥4px each side in its slot, no slot scrolls",
    geo.every((g) => g.tight === 0),
    geo.filter((g) => g.tight),
  );
  ok(
    "every OTP: the frame fits its column",
    geo.every((g) => g.frameW <= g.parentW + 0.5),
    geo.filter((g) => g.frameW > g.parentW + 0.5),
  );
  const tg = geo.filter((g) => /^Recovery code/.test(g.label ?? "") && g.parentW <= 290);
  ok(
    "290px column: 8 characters, a join and the ! cell fit, slots stay ≥26px",
    tg.length === 2 && tg.every((g) => g.frameW <= 290.5 && g.minSlot >= 26),
    tg,
  );
  // cell layout fills the footer cell
  const c = p.getByTestId("otp-cell");
  const cw = await c
    .locator("[data-slot=otp-field]")
    .evaluate((x) => [
      x.getBoundingClientRect().width,
      [...x.querySelectorAll("[data-slot=otp-field-input]")].reduce((a, s) => a + s.getBoundingClientRect().width, 0),
    ]);
  ok("cell layout: the slots fill the cell (no dead space)", cw[1] >= cw[0] - 4, cw);
  ok(
    "disabled: every slot is disabled",
    await p
      .getByRole("textbox", { name: "Disabled" })
      .evaluate((x) =>
        [...x.closest("[data-slot=otp-field]").querySelectorAll("[data-slot=otp-field-input]")].every(
          (s) => s.disabled,
        ),
      ),
    null,
  );
  ok(
    "masked: slots are password inputs",
    (await p
      .locator("[data-slot=otp-field]", { hasText: "Terminal PIN" })
      .locator("[data-slot=otp-field-input]")
      .first()
      .getAttribute("type")) === "password",
    null,
  );
  // dialog: verify inside a dialog, which closes after done
  await p.getByRole("button", { name: "Release shipment…" }).click();
  const dlg = p.getByRole("dialog");
  await dlg.locator("[data-slot=otp-field-input]").first().waitFor({ state: "visible" });
  await dlg.locator("[data-slot=otp-field-input]").first().focus();
  ok(
    "dialog: focus can start in the code's first slot",
    await p.evaluate(
      () =>
        !!document.activeElement?.closest("[role=dialog]") &&
        document.activeElement.getAttribute("data-slot") === "otp-field-input",
    ),
    null,
  );
  await p.keyboard.type("246810");
  await p
    .getByRole("dialog")
    .waitFor({ state: "detached", timeout: 6000 })
    .catch(() => {});
  ok("dialog: the right code verifies and the dialog closes", (await p.getByRole("dialog").count()) === 0, null);
  ok("otp misc: no page errors", p.errs.length === 0, p.errs);
});
