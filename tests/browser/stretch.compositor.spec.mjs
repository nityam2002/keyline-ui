// The Stretch band runs on the compositor: a move is transform-only animations planned up front, so a long task on
// the main thread (a route commit, a lazy example mounting) cannot freeze it mid-stretch. A covered copy of the labels
// rides in the band; it is inert, hidden from assistive tech and findable by nothing. The move lands exactly and idles.
import { test, idle, landed } from "./fixtures.mjs";

const Q = "theme=light&cut=on&density=default&motion=normal&dir=ltr";
const SEG = "[data-testid=motion-lab] .kl-segmented";

test("stretch: a move is compositor transforms, survives a long task, and lands clean", async ({ open, ok }) => {
  const p = await open({ route: "motion", q: Q, width: 1200, height: 900, ready: SEG });
  const seg = p.locator(SEG).first();
  const band = seg.locator(":scope > [data-kl-band]");
  await seg.locator("[data-kl-item]").nth(0).click();
  await idle(p);
  await landed(band);
  const r = await seg.evaluate((s) => {
    const b = s.querySelector(":scope > [data-kl-band]");
    const items = [...s.querySelectorAll("[data-kl-item]")];
    items[3].click();
    // the move is planned in the click's commit: read it before any frame runs
    const anims = document.getAnimations().filter((a) => b.contains(a.effect?.target));
    const props = [
      ...new Set(
        anims.flatMap((a) =>
          a.effect
            .getKeyframes()
            .flatMap((k) =>
              Object.keys(k).filter((x) => !["offset", "easing", "composite", "computedOffset"].includes(x)),
            ),
        ),
      ),
    ];
    const ghost = b.querySelector("[data-kl-ghost]");
    const g = ghost && {
      hidden: ghost.getAttribute("aria-hidden") === "true",
      inert: ghost.inert,
      ids: ghost.querySelectorAll("[id]").length + (ghost.id ? 1 : 0),
      roles: ghost.querySelectorAll("[role]").length + (ghost.hasAttribute("role") ? 1 : 0),
      aria: [ghost, ...ghost.querySelectorAll("*")]
        .flatMap((e) => [...e.attributes].map((x) => x.name))
        .filter((n) => n.startsWith("aria-") && n !== "aria-hidden").length,
      hooks: ghost.querySelectorAll(
        "[data-kl-item], [data-kl-band], [data-kl-stretch], [data-slot], [data-testid], [tabindex]",
      ).length,
      covered: ghost.querySelectorAll("[data-kl-covered]").length,
    };
    return { n: anims.length, props, flight: b.getAttribute("data-kl-flight"), g, items: items.length };
  });
  ok(
    "stretch: a move runs as WAAPI animations of transform only (what the compositor runs off the main thread)",
    r.n >= 2 && r.props.length === 1 && r.props[0] === "transform",
    r,
  );
  ok("stretch: a choice travels with the covered copy riding in the band", r.flight === "travel" && !!r.g, r);
  ok(
    "stretch: the copy is aria-hidden and inert, and carries no ids, roles, ARIA state, slots or hooks",
    r.g?.hidden && r.g.inert && r.g.ids === 0 && r.g.roles === 0 && r.g.aria === 0 && r.g.hooks === 0,
    r.g,
  );
  ok("stretch: every label in the copy reads covered", r.g?.covered === r.items, r.g);
  // a long task once the move is under way: the stall a route commit or a lazy mount makes. (Whether the compositor
  // kept drawing through it is visible only in pixels; what a spec can hold is that nothing on the main thread had
  // to run for the move, and that the move still lands right after the stall.)
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await p.evaluate(() => {
    const t0 = performance.now();
    // timing: a 300ms long task, the length of the stalls measured on the docs site
    while (performance.now() - t0 < 300);
  });
  await landed(band);
  await idle(p);
  const end = await seg.evaluate((s) => {
    const b = s.querySelector(":scope > [data-kl-band]");
    const v = window.__klBand(b);
    const it = s.querySelector("[data-kl-item][data-checked]").getBoundingClientRect();
    return {
      dl: v.left - it.left,
      dr: v.right - it.right,
      ghosts: document.querySelectorAll("[data-kl-ghost], [data-kl-band-clip]").length,
      anims: document.getAnimations().filter((x) => b.contains(x.effect?.target)).length,
      covered: [...s.querySelectorAll("[data-kl-item][data-kl-covered]")].map((e) => e.hasAttribute("data-checked")),
    };
  });
  ok("stretch: it lands on the chosen item", Math.abs(end.dl) <= 1 && Math.abs(end.dr) <= 1, end);
  ok("stretch: landing removes the copy, the clip and the animations", end.ghosts === 0 && end.anims === 0, end);
  ok("stretch: once landed, only the chosen label is covered", end.covered.length === 1 && end.covered[0], end);
  ok("stretch: no page errors", !p.errs.length, p.errs);
});
