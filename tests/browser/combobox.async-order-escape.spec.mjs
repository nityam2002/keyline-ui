// Combobox and Multiselect, async, controlled and uncontrolled:
// 93: a whole query pasted into a closed field is the search the list shows (the open must not supersede it);
//     rapid queries whose responses arrive out of order list only the latest query's; the initial load on open,
//     a failure with Retry, and the chosen label across a new search still work.
// 97: Escape on a closed field keeps the value (and passes on, so an enclosing overlay can close); Escape on an
//     open list still closes it; the clear cell, a token's remove cell and Backspace still remove.
// Each in normal and reduced motion (the popup unmounts at once under reduced motion). The specimen
// (src/demo/specimens/combobox-async.tsx) holds every request on window.__klAsyncRequests until the test settles it, in any order.
import { test } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["async-race"] });

const open38 = (open, reduce) => async () => {
  const p = await open({
    route: "specimen",
    width: 1280,
    height: 1000,
    ctx: { reducedMotion: reduce ? "reduce" : "no-preference" },
    ready: "[data-testid=cb-c]",
  });
  await p.getByTestId("cb-c").scrollIntoViewIfNeeded();
  p.allErrs = () => [...p.errs, ...p.consoleErrs];
  return p;
};

/* the held requests of one field: query, aborted, settled */
const reqs = (p, field) =>
  p.evaluate(
    (f) =>
      (window.__klAsyncRequests ?? [])
        .map((r, i) => ({ i, field: r.field, q: r.q, aborted: r.aborted, settled: !!r.done }))
        .filter((r) => r.field === f),
    field,
  );
const settleReq = (p, i, good = true) =>
  p.evaluate(
    ([i, good]) => {
      const r = window.__klAsyncRequests[i];
      r.done = true;
      r.settle(good);
    },
    [i, good],
  );
const latest = async (p, field) => (await reqs(p, field)).at(-1);
/* waits until the field's latest request matches (query, live, unsettled), returning nothing; the check follows */
const request = (p, field, q, after = -1) =>
  p
    .waitForFunction(
      ([f, q, after]) => {
        const rs = (window.__klAsyncRequests ?? []).map((r, i) => ({ ...r, i })).filter((r) => r.field === f);
        const r = rs.at(-1);
        return r && r.i > after && (q === null || r.q === q);
      },
      [field, q, after],
      { timeout: 4000 },
    )
    .catch(() => {});
const input = (p, id) => p.getByTestId(id).locator("input").first();
const value = (p, id) => p.getByTestId(`${id}-value`).textContent();
const escapes = async (p, id) => +(await p.getByTestId(`${id}-escapes`).textContent());
const status = (p) => p.locator(".kl-positioner [role=status]").first().textContent();
const options = (p) => p.getByRole("option").allTextContents();
const listOpen = async (p) => (await p.getByRole("listbox").count()) > 0;
const unmounted = (p) =>
  p
    .getByRole("listbox")
    .waitFor({ state: "detached", timeout: 3000 })
    .catch(() => {});
const statusIs = (p, re) =>
  p
    .waitForFunction(
      (src) => new RegExp(src).test(document.querySelector(".kl-positioner [role=status]")?.textContent ?? ""),
      re.source,
      { timeout: 4000 },
    )
    .catch(() => {});

const FIELDS = [
  { id: "cb-c", kind: "cb", label: "Carrier (controlled, async)" },
  { id: "cb-u", kind: "cb", label: "Carrier (uncontrolled, async)" },
  { id: "ms-c", kind: "ms", label: "Carriers (controlled)" },
  { id: "ms-u", kind: "ms", label: "Carriers (uncontrolled)" },
];

for (const reduce of [false, true]) {
  const m = reduce ? "reduced motion" : "normal motion";
  for (const f of FIELDS) {
    const ms = f.kind === "ms";
    const start = ms ? "evergreen" : "none";

    test(`combobox async ${f.id} (${m}): the initial load on open`, async ({ open, ok }) => {
      const p = await open38(open, reduce)();
      await p.getByTestId(f.id).locator('[aria-label="Show carriers"], [aria-label="Open carriers"]').click();
      await request(p, f.id, null);
      const r = await latest(p, f.id);
      ok("opening an empty field searches for the empty query", r && r.q === "" && !r.aborted, await reqs(p, f.id));
      await settleReq(p, r.i);
      await statusIs(p, /^7 carriers$/);
      ok(
        "the empty query lists every carrier",
        (await options(p)).length === 7 && /^7 carriers$/.test(await status(p)),
        { o: await options(p), s: await status(p) },
      );
    });

    test(`combobox async ${f.id} (${m}): paste, out-of-order responses, Escape, removal, Retry`, async ({
      open,
      ok,
    }) => {
      const p = await open38(open, reduce)();
      const inp = input(p, f.id);

      /* ---------- 93: a whole query pasted into the closed field ---------- */
      ok("the field starts closed", !(await listOpen(p)));
      await inp.fill("hap"); // one input event, as a paste is
      await request(p, f.id, "hap");
      await p.waitForTimeout(150); // timing: the window in which the open must not supersede the pasted query
      let r = await reqs(p, f.id);
      const live = r.filter((x) => !x.aborted);
      ok(
        "paste: the pasted query is the latest request and nothing superseded it",
        r.at(-1)?.q === "hap" && live.length === 1 && live[0].q === "hap",
        r,
      );
      await settleReq(p, r.at(-1).i);
      await statusIs(p, /^1 match for “hap”$/);
      ok(
        "paste: the list shows the pasted query's results, labelled with it",
        JSON.stringify(await options(p)).includes("Hapag-Lloyd") &&
          (await options(p)).length === 1 &&
          (await status(p)) === "1 match for “hap”",
        { o: await options(p), s: await status(p) },
      );

      /* ---------- 93: rapid queries, responses out of order ---------- */
      for (const q of ["o", "co", "cos"]) await inp.fill(q);
      await request(p, f.id, "cos");
      await p
        .waitForFunction(
          (fid) => {
            const rs = (window.__klAsyncRequests ?? []).filter((r) => r.field === fid);
            const by = (q) => rs.findLast((x) => x.q === q);
            return by("o")?.aborted && by("co")?.aborted;
          },
          f.id,
          { timeout: 3000 },
        )
        .catch(() => {});
      r = await reqs(p, f.id);
      const [o1, o2, o3] = ["o", "co", "cos"].map((q) => r.findLast((x) => x.q === q));
      ok(
        "rapid: three requests, the two earlier ones aborted",
        o1 && o2 && o3 && o1.aborted && o2.aborted && !o3.aborted,
        r,
      );
      await settleReq(p, o3.i);
      await statusIs(p, /^1 match for “cos”$/);
      await settleReq(p, o1.i);
      await settleReq(p, o2.i, false);
      await p.waitForTimeout(150); // timing: the late (stale) responses must change nothing within this window
      ok(
        "rapid: the latest query's results stay listed after older responses (one a failure) arrive late",
        (await status(p)) === "1 match for “cos”" &&
          JSON.stringify(await options(p)) === JSON.stringify(["COSCO"]) &&
          (await p.locator(".kl-positioner").getByRole("button", { name: "Retry" }).count()) === 0,
        {
          o: await options(p),
          s: await status(p),
          retry: await p.locator(".kl-positioner").getByRole("button", { name: "Retry" }).count(),
        },
      );

      /* ---------- choose, then Escape on the closed field (97) ---------- */
      await p.getByRole("option", { name: "COSCO" }).click();
      const chosen = ms ? "evergreen,cosco" : "cosco";
      ok("the option is chosen", (await value(p, f.id)) === chosen, { v: await value(p, f.id) });
      await inp.focus();
      await p.keyboard.press("Escape"); // straight after the pick: under reduced motion the list is already unmounted
      await p.waitForTimeout(60); // timing: the value must not be dropped by an Escape straight after the pick
      ok("Escape straight after a pick keeps the value", (await value(p, f.id)) === chosen, await value(p, f.id));
      await unmounted(p);
      const before = await escapes(p, f.id);
      await p.keyboard.press("Escape");
      await p
        .waitForFunction(
          ([id, n]) => +document.querySelector(`[data-testid=${id}-escapes]`).textContent >= n,
          [f.id, before + 1],
          { timeout: 3000 },
        )
        .catch(() => {});
      ok("Escape on the closed field keeps the value", (await value(p, f.id)) === chosen, await value(p, f.id));
      ok(
        ms
          ? "Escape on the closed field keeps every token"
          : "Escape on the closed field keeps the chosen label in the input",
        ms
          ? (await p
              .getByTestId(f.id)
              .getByRole("button", { name: /^Remove / })
              .count()) === 2
          : (await inp.inputValue()) === "COSCO",
        ms ? null : await inp.inputValue(),
      );
      ok(
        "Escape on the closed field passes on (an enclosing overlay can close)",
        (await escapes(p, f.id)) === before + 1,
        { before, after: await escapes(p, f.id) },
      );

      /* ---------- Escape on an open list closes it; the chosen label survives a new search ---------- */
      const prev = (await latest(p, f.id))?.i ?? -1;
      await inp.fill("hap");
      await request(p, f.id, "hap", prev);
      await settleReq(p, (await latest(p, f.id)).i);
      await p
        .waitForFunction(
          () => [...document.querySelectorAll("[role=option]")].some((o) => o.textContent.includes("Hapag-Lloyd")),
          null,
          { timeout: 4000 },
        )
        .catch(() => {});
      ok(
        "a new search lists other results while a value is chosen",
        (await options(p)).some((o) => o.includes("Hapag-Lloyd")) && (await value(p, f.id)) === chosen,
        { o: await options(p) },
      );
      await p.keyboard.press("Escape");
      await unmounted(p);
      ok(
        "Escape on the open list closes it and keeps the value",
        !(await listOpen(p)) && (await value(p, f.id)) === chosen,
        { v: await value(p, f.id) },
      );
      if (!ms)
        ok(
          "closing restores the chosen label in the input",
          (await inp.inputValue()) === "COSCO",
          await inp.inputValue(),
        );
      else await inp.fill("");
      await p.keyboard.press("Escape");
      await p.waitForTimeout(150); // timing: a further Escape must not drop the value within this window
      ok(
        "and a further Escape on the closed field still keeps it",
        (await value(p, f.id)) === chosen,
        await value(p, f.id),
      );

      /* ---------- the intentional removals still work ---------- */
      if (ms) {
        const remove = p.getByTestId(f.id).getByRole("button", { name: "Remove COSCO" });
        if (await remove.count()) await remove.click();
        ok("a token's remove cell takes it out", (await value(p, f.id)) === start, await value(p, f.id));
        await inp.focus();
        await p.keyboard.press("Backspace");
        await p
          .waitForFunction((id) => document.querySelector(`[data-testid=${id}-value]`).textContent === "none", f.id, {
            timeout: 3000,
          })
          .catch(() => {});
        ok(
          "Backspace in the empty input removes the last token",
          (await value(p, f.id)) === "none",
          await value(p, f.id),
        );
      } else {
        const clear = p.getByTestId(f.id).getByRole("button", { name: `Clear ${f.label}` });
        if (await clear.count()) await clear.click();
        await p
          .waitForFunction(
            (id) =>
              document.querySelector(`[data-testid=${id}-value]`).textContent === "none" &&
              document.querySelector(`[data-testid=${id}] input`).value === "",
            f.id,
            { timeout: 3000 },
          )
          .catch(() => {});
        ok("the clear cell clears the value", (await value(p, f.id)) === "none" && (await inp.inputValue()) === "", {
          v: await value(p, f.id),
          i: await inp.inputValue(),
        });
      }

      /* ---------- a failure offers Retry; Retry searches the same query ---------- */
      const prev2 = (await latest(p, f.id))?.i ?? -1;
      await inp.fill("zz");
      await request(p, f.id, "zz", prev2);
      await settleReq(p, (await latest(p, f.id)).i, false);
      await statusIs(p, /failed/);
      ok(
        "a failed search says so and offers Retry",
        (await status(p)).includes("failed") &&
          (await p.locator(".kl-positioner").getByRole("button", { name: "Retry" }).count()) === 1,
        await status(p),
      );
      const prev3 = (await latest(p, f.id)).i;
      await p.locator(".kl-positioner").getByRole("button", { name: "Retry" }).click();
      await request(p, f.id, null, prev3);
      r = await latest(p, f.id);
      ok("Retry searches the same query again", r.q === "zz" && !r.aborted && !r.settled, r);
      await settleReq(p, r.i);
      await statusIs(p, /^0 matches for “zz”$/);
      ok("the retried search lands", (await status(p)) === "0 matches for “zz”", await status(p));
      ok("no page errors", p.allErrs().length === 0, p.allErrs());
    });
  }

  test(`combobox local cb-l (${m}): a default value and a keyboard pick survive Escape`, async ({ open, ok }) => {
    const p = await open38(open, reduce)();
    const inp = input(p, "cb-l");
    await inp.focus();
    await p.keyboard.press("Escape");
    await p.waitForTimeout(150); // timing: Escape on the closed field must not drop the default within this window
    ok(
      "a default value survives Escape on the closed field",
      (await value(p, "cb-l")) === "msc" && (await inp.inputValue()) === "MSC",
      { v: await value(p, "cb-l"), i: await inp.inputValue() },
    );
    await inp.fill("ever");
    await p.keyboard.press("ArrowDown");
    await p.keyboard.press("Enter");
    await p.keyboard.press("Escape");
    await p.waitForTimeout(60); // timing: an Escape straight after the pick, before the list has unmounted
    await unmounted(p);
    await p.keyboard.press("Escape");
    await p.waitForTimeout(150); // timing: the second Escape must not drop the pick within this window
    ok(
      "a keyboard pick survives Escape, twice",
      (await value(p, "cb-l")) === "evergreen" && (await inp.inputValue()) === "Evergreen",
      { v: await value(p, "cb-l"), i: await inp.inputValue() },
    );
    ok("no page errors", p.allErrs().length === 0, p.allErrs());
  });
}
