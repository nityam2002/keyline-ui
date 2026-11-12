// Avatar: photo, failed photo, slow photo, initials, status in the name and on the floor, square at every cut,
// the group's shared seams and count, the count opening everyone.
import { test, settle } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["otp", "avatar"] });

test("avatar: photo, initials, status, group, square, the count's list", async ({ open, ok }) => {
  // person-2 arrives late, so the initials hold the cell and the photo then replaces them. The route is installed
  // before the first navigation, as r18 did: installed later, a reload lets WebKit reuse the already-loaded photo.
  const p = await open({
    route: "specimen",
    q: "theme=light",
    ready: "#otp",
    // the subject is the cell before the photo arrives: the bundled app renders before "load", which would include
    // the delayed photo, so readiness is the DOM plus the #otp section, not the load event
    waitUntil: "domcontentloaded",
    settled: false, // WebKit's fonts.ready waits for the delayed photo too
    setup: (page) =>
      page.route("**/demo/person-2.svg", async (r) => {
        await new Promise((res) => setTimeout(res, 3000)); // timing: the slow photo's arrival is the subject
        await r.continue().catch(() => {});
      }),
  });
  const sec = p.locator("[data-testid=specimen-avatar]");
  await sec.scrollIntoViewIfNeeded();
  const sizes = sec.locator("[data-testid=av-sizes] [data-slot=avatar]");
  const ade = sizes.nth(1);
  const early = await ade.evaluate((a) => [
    a.querySelector("[data-slot=avatar-fallback]")?.textContent ?? null,
    a.querySelectorAll("img").length,
  ]);
  ok("slow photo: the initials hold the cell while it loads (AO)", early[0] === "AO" && early[1] === 0, early);
  await settle(p);
  await p
    .waitForFunction(
      (el) => el.querySelectorAll("img").length === 1 && !el.querySelector("[data-slot=avatar-fallback]"),
      await ade.elementHandle(),
      { timeout: 8000 },
    )
    .catch(() => {});
  ok(
    "slow photo: the photo replaces the initials once loaded",
    (await ade.locator("img").count()) === 1 && (await ade.locator("[data-slot=avatar-fallback]").count()) === 0,
    null,
  );
  const failed = sec.getByTestId("av-failed");
  ok(
    "failed photo: initials (MN), never a broken image",
    (await failed.locator("[data-slot=avatar-fallback]").textContent()) === "MN" &&
      (await failed.locator("img").count()) === 0,
    null,
  );
  ok(
    "an avatar is an image named by the person",
    (await failed.getAttribute("role")) === "img" && (await failed.getAttribute("aria-label")) === "María José Núñez",
    await failed.getAttribute("aria-label"),
  );
  const inits = await sizes.evaluateAll((xs) =>
    xs.map((x) => x.querySelector("[data-slot=avatar-fallback]")?.textContent ?? "img"),
  );
  ok(
    "initials: Han name gives one grapheme (李), an email its local part (O)",
    inits[4] === "李" && inits[5] === "O",
    inits,
  );
  const crewInits = await sec.locator("[data-testid=av-sizes] [data-slot=avatar-fallback]").allTextContents();
  ok("initials: first and last word (Wilhelmina Oostergetel-Vandersteen → WV)", crewInits.includes("WV"), crewInits);
  const st = sec.locator("[data-testid=av-status] [data-slot=avatar]");
  ok(
    "status joins the name (default words, and statusLabel)",
    (await st.nth(1).getAttribute("aria-label")) === "Ade Okafor, away" &&
      (await st.nth(2).getAttribute("aria-label")) === "María José Núñez, blocked at customs",
    [await st.nth(1).getAttribute("aria-label"), await st.nth(2).getAttribute("aria-label")],
  );
  // status is the avatar's floor: one line shape per kind, nothing drawn over the face
  const floors = await st.evaluateAll((xs) =>
    xs.map((a) => {
      const s = getComputedStyle(a);
      return [
        a.dataset.status,
        s.borderBottomStyle,
        s.borderBottomWidth,
        s.borderTopColor === s.borderBottomColor,
        a.children.length,
      ];
    }),
  );
  const fl = Object.fromEntries(floors.slice(0, 6).map((f) => [f[0], f]));
  ok(
    "status floor: active solid 3px, away dashed, done double, offline 1px",
    fl.normal[1] === "solid" &&
      fl.normal[2] === "3px" &&
      fl.waiting[1] === "dashed" &&
      fl.done[1] === "double" &&
      fl.none[2] === "1px",
    floors,
  );
  ok("status floor: attention turns the whole frame red", fl.attention[3] && fl.attention[1] === "solid", fl.attention);
  ok(
    "status: nothing is drawn over the face (photo or initials only)",
    floors.every((f) => f[4] === 1),
    floors,
  );
  const gray = await st
    .nth(4)
    .locator("img")
    .evaluate((i) => getComputedStyle(i).filter);
  ok("status offline: the photo turns grayscale", gray.includes("grayscale"), gray);
  const rows = await sec.locator("[data-testid=av-crew] [data-slot=avatar]").evaluateAll((xs) =>
    xs.map((x) => {
      const r = x.getBoundingClientRect(),
        m = x.parentElement.getBoundingClientRect();
      return [Math.round(r.width), Math.round(r.height), Math.round(m.height)];
    }),
  );
  ok(
    "list rows: a square avatar centred in the media cell, never stretched to the row",
    rows.every(([w, h, mh]) => w === h && w === 32 && mh > h),
    rows,
  );
  const decorative = await sec
    .locator("[data-testid=av-crew] [data-slot=avatar]")
    .evaluateAll((xs) => xs.every((x) => x.getAttribute("aria-hidden") === "true" && !x.getAttribute("role")));
  ok("avatars beside a printed name are decorative (hidden, no role)", decorative, null);
  // group
  const g = sec.getByTestId("av-group");
  const cells = await g.evaluate((el) =>
    [...el.children].map((c) => {
      const r = c.getBoundingClientRect();
      return [Math.round(r.left), Math.round(r.right), c.textContent];
    }),
  );
  ok("group: max 4 → three avatars and +3 (six people)", cells.length === 4 && cells[3][2] === "+3", cells);
  ok(
    "group: cells touch on shared seams (no gaps, no overlap)",
    cells.every((c, i) => i === 0 || c[0] === cells[i - 1][1]),
    cells,
  );
  const gw = (await g.boundingBox()).width;
  ok("group: as wide as its cells in a grid column (not stretched)", gw < 200, gw);
  ok(
    "group: the count keeps its sign first in RTL (+3)",
    await g.locator("[data-slot=avatar-group-count]").evaluate((c) => {
      c.closest("[data-testid=av-group]").setAttribute("dir", "rtl");
      const r = document.createRange();
      r.setStart(c.firstChild, 0);
      r.setEnd(c.firstChild, 1);
      const plus = r.getBoundingClientRect().left;
      c.closest("[data-testid=av-group]").removeAttribute("dir");
      return plus < c.getBoundingClientRect().left + c.getBoundingClientRect().width / 2;
    }),
    null,
  );
  ok(
    "group: named, count read as words",
    (await g.getAttribute("aria-label")) === "Assignees" &&
      (await g.locator("[data-slot=avatar-group-count]").getAttribute("aria-label")) === "3 more",
    null,
  );
  for (const q of ["cut=on", "cut=off"]) {
    await p.evaluate((c) => document.documentElement.setAttribute("data-kl-cut", c.split("=")[1]), q);
    const sq = await sec.locator("[data-slot=avatar][data-size]").evaluateAll((xs) =>
      xs.every((x) => {
        const r = x.getBoundingClientRect(),
          s = getComputedStyle(x);
        return (
          Math.abs(r.width - r.height) < 0.5 && s.borderTopLeftRadius === "0px" && s.borderBottomRightRadius === "0px"
        );
      }),
    );
    ok(`${q}: every avatar is square with no radius`, sq, null);
  }
  // the count opens everyone, by keyboard
  const more = sec.getByTestId("av-more");
  await more.focus();
  await p.keyboard.press("Enter");
  const pop = p.locator(".kl-popover:visible");
  await pop
    .locator("[data-slot=item]")
    .nth(5)
    .waitFor({ state: "visible", timeout: 3000 })
    .catch(() => {});
  ok(
    "count button: Enter opens the full list (6 people)",
    (await pop.locator("[data-slot=item]").count()) === 6 && (await more.getAttribute("aria-expanded")) === "true",
    null,
  );
  await p.keyboard.press("Escape");
  await p
    .waitForFunction(() => document.activeElement?.getAttribute("data-testid") === "av-more", null, { timeout: 3000 })
    .catch(() => {});
  ok(
    "count button: Escape closes and focus returns to it",
    (await p.evaluate(() => document.activeElement?.getAttribute("data-testid"))) === "av-more",
    await p.evaluate(() => document.activeElement?.outerHTML.slice(0, 80)),
  );
  ok("avatar: no page errors", p.errs.length === 0, p.errs);
});
