// A disabled primary's label is the disabled ink, not on-cobalt white on the hatch (toolbar and bulk bar).
import { test } from "./fixtures.mjs";
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["button", "table", "toolbar"] });

test("disabled primary: the label is the disabled ink (toolbar, bulk bar)", async ({ open, ok }) => {
  const p = await open({ route: "specimen", width: 1440, height: 900, ready: ".kl-tb-item[data-kl-primary]" });
  const d = await p.evaluate(() => {
    const tb = document.querySelector(".kl-tb-item[data-kl-primary]");
    if (!tb) return null;
    tb.setAttribute("data-disabled", "");
    const cs = getComputedStyle(tb);
    const out = { toolbar: cs.color, bulk: null };
    tb.removeAttribute("data-disabled");
    const bulk = [...document.querySelectorAll("button[disabled]")].find((e) =>
      e.textContent.trim().startsWith("Assign carrier"),
    );
    if (bulk) out.bulk = getComputedStyle(bulk).color;
    const probe = document.createElement("span");
    probe.style.color = "var(--kl-dis)";
    tb.parentElement.append(probe);
    out.dis = getComputedStyle(probe).color;
    probe.remove();
    return out;
  });
  ok("disabled primary (toolbar): the label is the disabled ink", d && d.toolbar === d.dis, d);
  ok("disabled primary (bulk bar button): the label is not white", d && d.bulk !== "rgb(255, 255, 255)", d);
});
