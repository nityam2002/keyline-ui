// Input group: toggle and button cells in a field frame, bars above and below a textarea, invalid, narrow, RTL.
import { test } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["toggle", "input-group"] });

const frameFit = (root, sel) =>
  [...root.querySelectorAll(sel)].map((fr) => {
    const f = fr.getBoundingClientRect();
    const out = [...fr.children]
      .filter((c) => getComputedStyle(c).position !== "absolute")
      .filter((c) => {
        const r = c.getBoundingClientRect();
        return (
          r.width > 0 &&
          (r.left < f.left - 0.5 || r.right > f.right + 0.5 || r.top < f.top - 0.5 || r.bottom > f.bottom + 0.5)
        );
      }).length;
    return { w: Math.round(f.width), parent: Math.round(fr.parentElement.getBoundingClientRect().width), out };
  });
const until = (p, fn, arg, timeout = 4000) => p.waitForFunction(fn, arg, { timeout }).catch(() => {});

for (const q of ["theme=light", "theme=dark&density=compact&cut=off"]) {
  test(`input group: toggle, copy, search, bars, invalid, narrow, RTL (${q})`, async ({ open, ok, eng }) => {
    const p = await open({ route: "specimen", q, ready: "#toggle" });
    const sec = p.getByTestId("specimen-ig");
    await sec.scrollIntoViewIfNeeded();
    const pw = sec.getByLabel("Password", { exact: true });
    const reveal = sec.getByTestId("ig-reveal");
    ok(
      `${q}: show-password is a named toggle, off`,
      (await reveal.getAttribute("aria-pressed")) === "false" &&
        (await reveal.getAttribute("aria-label")) === "Show password",
      null,
    );
    await pw.focus();
    await p.keyboard.press(eng === "webkit" ? "Alt+Tab" : "Tab");
    ok(
      `${q}: Tab goes from the input to its toggle`,
      await reveal.evaluate((x) => x === document.activeElement),
      await p.evaluate(() => document.activeElement?.outerHTML.slice(0, 60)),
    );
    await p.keyboard.press("Space");
    await until(p, () => document.querySelector("[data-testid=ig-reveal]")?.getAttribute("aria-pressed") === "true");
    ok(
      `${q}: Space shows the password (type text, pressed)`,
      (await pw.getAttribute("type")) === "text" && (await reveal.getAttribute("aria-pressed")) === "true",
      null,
    );
    const cell = await reveal.evaluate((t) => {
      const r = t.getBoundingClientRect(),
        f = t.parentElement.getBoundingClientRect(),
        bw = parseFloat(getComputedStyle(t.parentElement).borderTopWidth);
      return [
        Math.round(r.width),
        Math.round(r.height),
        Math.round(f.height - 2 * bw),
        getComputedStyle(t).outlineOffset,
      ];
    });
    ok(
      `${q}: the toggle is a square cell of the frame's inner height, ring inside`,
      Math.abs(cell[0] - cell[1]) <= 1 && Math.abs(cell[1] - cell[2]) <= 1 && parseFloat(cell[3]) < 0,
      cell,
    );
    const edge = await reveal.evaluate((t) =>
      t.parentElement.matches(":has(:is(input, textarea, .kl-edge-part):focus-visible)"),
    );
    ok(`${q}: focus on the toggle leaves the frame's edge to the input (one indicator)`, !edge, null);
    // copy
    await sec.getByTestId("ig-copy").click();
    await until(
      p,
      () => document.querySelector("[data-testid=ig-copy]")?.getAttribute("data-signal") === "done",
      null,
      2000,
    );
    ok(
      `${q}: Copy shows done in its cell`,
      (await sec.getByTestId("ig-copy").getAttribute("data-signal")) === "done",
      null,
    );
    await until(
      p,
      () => document.querySelector("[data-testid=ig-copy]")?.getAttribute("data-signal") === null,
      null,
      5000,
    );
    ok(`${q}: and returns to idle`, (await sec.getByTestId("ig-copy").getAttribute("data-signal")) === null, null);
    // search: clear and match case
    const s = sec.getByTestId("ig-search");
    await s.getByRole("button", { name: "Clear search" }).click();
    await s
      .getByRole("button", { name: "Clear search" })
      .waitFor({ state: "detached", timeout: 3000 })
      .catch(() => {});
    ok(
      `${q}: Clear empties the search, leaves, and focus returns to the input`,
      (await s.getByRole("searchbox").inputValue()) === "" &&
        (await s.getByRole("button", { name: "Clear search" }).count()) === 0 &&
        (await s.getByRole("searchbox").evaluate((x) => x === document.activeElement)),
      null,
    );
    const mc = s.getByRole("button", { name: "Match case" });
    await mc.click();
    ok(`${q}: Match case toggles (aria-pressed)`, (await mc.getAttribute("aria-pressed")) === "true", null);
    // message: bars span the frame
    const m = sec.getByTestId("ig-message");
    const bars = await m.evaluate((el) => {
      const fr = el.querySelector(".kl-field-frame"),
        f = fr.getBoundingClientRect(),
        bw = parseFloat(getComputedStyle(fr).borderLeftWidth),
        ta = el.querySelector("textarea").getBoundingClientRect();
      return [...fr.querySelectorAll("[data-slot=field-bar]")].map((b) => {
        const r = b.getBoundingClientRect();
        return [
          b.dataset.side,
          Math.round(r.width),
          Math.round(f.width - 2 * bw),
          b.dataset.side === "start" ? r.bottom <= ta.top + 1 : r.top >= ta.bottom - 1,
        ];
      });
    });
    ok(
      `${q}: bars span the frame, start above and end below the textarea`,
      bars.length === 2 && bars.every(([, w, fw, place]) => Math.abs(w - fw) <= 1 && place),
      bars,
    );
    const spacer = await m.locator("[data-kl-spacer]").evaluate((x) => getComputedStyle(x).borderInlineStartWidth);
    ok(`${q}: the bar's spacer draws no seam`, spacer === "0px", spacer);
    await m.locator("textarea").fill("x".repeat(170));
    await until(p, () => {
      const m = document.querySelector("[data-testid=ig-message]");
      return m.hasAttribute("data-invalid") && m.querySelector("[data-testid=ig-count]")?.textContent === "170/160";
    });
    ok(
      `${q}: over the limit: invalid, message, count, Send disabled`,
      (await m.getAttribute("data-invalid")) !== null &&
        (await m.getByText("10 characters too long").count()) === 1 &&
        (await m.getByTestId("ig-count").textContent()) === "170/160" &&
        (await m.getByRole("button", { name: "Send to 14 drivers" }).isDisabled()),
      null,
    );
    const inv = await sec.getByTestId("ig-invalid").evaluate(frameFit, ".kl-field-frame");
    ok(
      `${q}: invalid with a button: the ! cell and the button stay inside the frame`,
      inv[0].out === 0 &&
        (await sec
          .getByTestId("ig-invalid")
          .locator(".kl-field-bang")
          .evaluate((x) => x.getBoundingClientRect().width)) > 20,
      inv,
    );
    const nar = await sec.getByTestId("ig-narrow").evaluate(frameFit, ".kl-field-frame");
    ok(
      `${q}: 260px column: the frame and every cell fit`,
      nar.every((f) => f.out === 0 && f.w <= 260),
      nar,
    );
    const rtl = await sec
      .getByTestId("ig-rtl")
      .evaluate((el) => [
        el.querySelector("button").getBoundingClientRect().left,
        el.querySelector("input").getBoundingClientRect().left,
      ]);
    ok(`${q}: RTL: the button cell is at the inline end (left)`, rtl[0] < rtl[1], rtl);
    ok(`${q}: input group: no page errors`, p.errs.length === 0, p.errs);
  });
}

test("input group: 390px, every frame fits its column", async ({ open, ok }) => {
  const p = await open({ route: "specimen", q: "theme=light", width: 390, height: 844, ready: "#toggle" });
  const fits = await p.getByTestId("specimen-ig").evaluate(frameFit, ".kl-field-frame");
  ok(
    "390px: every input-group frame fits its column, no cell outside",
    fits.every((f) => f.out === 0 && f.w <= f.parent + 0.5),
    fits,
  );
});
