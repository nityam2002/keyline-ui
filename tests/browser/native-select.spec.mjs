// NativeSelect: Field participant (label, description, placeholder and required), Form values, groups, the
// caret not blocking presses, the OS list's scheme, narrow, RTL, focus edge.
import { test } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["toggle", "native-select"] });

const until = (p, fn, arg, timeout = 4000) => p.waitForFunction(fn, arg, { timeout }).catch(() => {});

for (const q of ["theme=light", "theme=dark"]) {
  test(`native select: field, form, caret, scheme, narrow, RTL (${q})`, async ({ open, ok }) => {
    const p = await open({ route: "specimen", q, ready: "#toggle" });
    const sec = p.getByTestId("specimen-ns");
    await sec.scrollIntoViewIfNeeded();
    const term = sec.getByRole("combobox", { name: "Delivery terminal" });
    ok(
      `${q}: labelled by its label, described by its description`,
      (await term.count()) === 1 &&
        (await term.evaluate((s) =>
          (s.getAttribute("aria-describedby") ?? "")
            .split(" ")
            .some((id) => document.getElementById(id)?.textContent?.includes("closed for the night")),
        )),
      null,
    );
    ok(
      `${q}: starts on the placeholder; groups and a disabled option are native`,
      (await term.inputValue()) === "" &&
        (await term.locator("optgroup").count()) === 2 &&
        (await term.locator("option[disabled]").count()) === 2,
      await term.inputValue(),
    );
    await sec.getByRole("button", { name: "Book slot" }).click();
    await until(
      p,
      (t) => {
        const fl = t.closest(".kl-field");
        return fl.hasAttribute("data-invalid") && (fl.querySelector(".kl-field-error")?.textContent ?? "").length > 0;
      },
      await term.elementHandle(),
    );
    ok(
      `${q}: required: submitting empty marks it invalid with a message`,
      (await term.evaluate((t) => {
        const fl = t.closest(".kl-field");
        return fl.hasAttribute("data-invalid") && (fl.querySelector(".kl-field-error")?.textContent ?? "").length > 0;
      })) && (await sec.getByTestId("ns-submitted").textContent()).includes("—"),
      null,
    );
    await term.selectOption("RTM-APM2");
    await sec.getByRole("button", { name: "Book slot" }).click();
    await until(p, () =>
      (document.querySelector("[data-testid=ns-submitted]")?.textContent ?? "").includes('"terminal":"RTM-APM2"'),
    );
    ok(
      `${q}: Form values carry the choice and the controlled country`,
      (await sec.getByTestId("ns-submitted").textContent()).includes('"terminal":"RTM-APM2"') &&
        (await sec.getByTestId("ns-submitted").textContent()).includes('"country":"NL"'),
      await sec.getByTestId("ns-submitted").textContent(),
    );
    const hit = await term.evaluate((s) => {
      const c = s.parentElement.querySelector("[data-slot=native-select-icon]").getBoundingClientRect();
      return document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2) === s;
    });
    ok(`${q}: a press on the caret cell reaches the select`, hit, null);
    const scheme = await term.evaluate((s) => getComputedStyle(s).colorScheme);
    ok(
      `${q}: the OS list follows the theme (${q.includes("dark") ? "dark" : "light"})`,
      scheme === (q.includes("dark") ? "dark" : "light"),
      scheme,
    );
    await term.focus();
    await p.keyboard.press("Shift+Tab");
    await p.keyboard.press("Tab");
    ok(
      `${q}: keyboard focus shows the frame's edge`,
      await term.evaluate((s) => s.closest(".kl-field-frame").matches(":has(.kl-edge-part:focus-visible)")),
      null,
    );
    const nar = await sec.getByTestId("ns-narrow").evaluate((el) => {
      const f = el.querySelector("[data-slot=native-select-frame]").getBoundingClientRect();
      return [Math.round(f.width), Math.round(el.getBoundingClientRect().width)];
    });
    ok(`${q}: a long option stays inside a 220px column`, nar[0] <= nar[1], nar);
    const rtl = await sec.getByTestId("ns-rtl").evaluate((el) => {
      const c = el.querySelector("[data-slot=native-select-icon]").getBoundingClientRect(),
        f = el.querySelector("[data-slot=native-select-frame]").getBoundingClientRect();
      return [Math.round(c.left - f.left), Math.round(f.right - c.right)];
    });
    ok(`${q}: RTL: the caret cell is at the inline end (left)`, rtl[0] <= 3 && rtl[1] > 100, rtl);
    ok(
      `${q}: disabled and invalid states`,
      (await sec.getByRole("combobox", { name: "Carrier" }).isDisabled()) &&
        (await sec
          .getByRole("combobox", { name: "Hazard class" })
          .evaluate((s) => !!s.closest("[data-invalid]") && !!s.closest(".kl-field").querySelector(".kl-field-bang"))),
      null,
    );
    ok(`${q}: native select: no page errors`, p.errs.length === 0, p.errs);
  });
}
