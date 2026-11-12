// Breadcrumb renders its own markup (there is no Base UI breadcrumb), so the conformance suite does not apply: this
// checks what it forwards (props, ref, className, data-slot), folding, keyboard, axe and the look the utilities carry.
import "./render-count";

import * as React from "react";
import { Breadcrumb, type Crumb } from "@/components/keyline/ui/breadcrumb";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";

const SHORT: Crumb[] = [
  { label: "Network", href: "#network" },
  { label: "Rotterdam", href: "#rotterdam" },
  { label: "ECT Delta" },
];
const LONG: Crumb[] = [
  { label: "Network", href: "#network" },
  { label: "Europe", href: "#europe" },
  { label: "Netherlands", href: "#nl" },
  { label: "Rotterdam", href: "#rotterdam" },
  { label: "ECT Delta" },
];

/* WebKit on macOS leaves links and buttons out of the Tab order by default; Option+Tab walks every control */
const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";
const BACK = server.browser === "webkit" ? "{Shift>}{Alt>}{Tab}{/Alt}{/Shift}" : "{Shift>}{Tab}{/Shift}";

const all = (slot: string, root: ParentNode = document) => [
  ...root.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`),
];
const q = (slot: string, root: ParentNode = document) => all(slot, root)[0]!;
/* rendered at all (a link in a hidden crumb keeps its own display) */
const shown = (el: Element) => el.getClientRects().length > 0;
/* the test page is 414px wide, under the fold's 480px: style checks give the nav room */
const Wide = ({ children }: { children: React.ReactNode }) => <main className="w-[720px]">{children}</main>;

function color(value: string, root: Element = document.body) {
  const probe = document.createElement("span");
  probe.style.color = value;
  root.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}
/* In light every edge is ink, so an edge colour is only told apart from the default (currentColor) in dark */
const dark = () => document.querySelector(".dark")!;
const px = (el: Element, v: string) => {
  const probe = document.createElement("span");
  probe.style.cssText = `position: absolute; width: var(${v})`;
  el.append(probe);
  const w = getComputedStyle(probe).width;
  probe.remove();
  return w;
};

describe("breadcrumb: forwarding", () => {
  it("passes props, ref and className to the nav, which carries its data-slot", async () => {
    const ref = React.createRef<HTMLElement>();
    await render(<Breadcrumb ref={ref} items={SHORT} className="probe" lang="fr" data-probe="kept" />);
    const nav = q("breadcrumb");
    expect(ref.current).toBe(nav);
    expect(nav.tagName).toBe("NAV");
    expect(nav.classList.contains("probe")).toBe(true);
    expect(nav.getAttribute("lang")).toBe("fr");
    expect(nav.getAttribute("data-probe")).toBe("kept");
  });

  it("a crumb's render prop replaces its link and keeps the cell's look", async () => {
    await render(
      <Breadcrumb items={[{ label: "Home", render: <a href="#home" data-router="" /> }, { label: "Here" }]} />,
    );
    const link = q("breadcrumb-link");
    expect(link.hasAttribute("data-router")).toBe(true);
    expect(link.classList.contains("kl-cell")).toBe(true);
  });
});

describe("breadcrumb: axe", () => {
  it("has no violations: short, folded, a cell, and the fold's menu open", async () => {
    await render(
      <main>
        <Breadcrumb items={SHORT} aria-label="Short" />
        <Breadcrumb items={LONG} aria-label="Long" />
        <div className="kl-frame">
          <Breadcrumb items={SHORT} layout="cell" aria-label="Cell" />
        </div>
      </main>,
    );
    await expectNoAxeViolations();
    q("menu-trigger", all("breadcrumb")[1]).focus();
    await userEvent.keyboard("{Enter}");
    await expect
      .poll(() => document.activeElement?.closest('[data-slot="menu-popup"]'))
      .toBe(document.querySelector('[data-slot="menu-popup"]'));
    // the menu portals out of the page's landmark (Breadcrumb has no container prop): the page and the popup are
    // judged apart, the popup on its own markup
    await expectNoAxeViolations(document.querySelector("main")!);
    await expectNoAxeViolations(document.querySelector('[data-slot="menu-popup"]')!);
  });
});

describe("breadcrumb: keyboard", () => {
  it("each ancestor is a Tab stop, the fold's trigger too; the page is not; Tab leaves at both edges", async () => {
    await render(
      <main>
        <input aria-label="Before" />
        <Breadcrumb items={LONG} />
        <input aria-label="After" />
      </main>,
    );
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    const names: string[] = [];
    for (let i = 0; i < 3; i++) {
      await userEvent.keyboard(TAB);
      names.push(document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent ?? "");
    }
    expect(names).toEqual(["Earlier levels (3)", "Rotterdam", "After"]);
    await userEvent.keyboard(BACK);
    await userEvent.keyboard(BACK);
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("Earlier levels (3)");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => document.querySelectorAll('[data-slot="menu-popup"] [role="menuitem"]').length).toBe(3);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("Earlier levels (3)");
    await userEvent.keyboard(BACK);
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });
});

describe("breadcrumb: style", () => {
  it("the current page is the cobalt cell; ancestors are ink links", async () => {
    await render(
      <Wide>
        <Breadcrumb items={SHORT} />
      </Wide>,
    );
    const page = q("breadcrumb-page");
    expect(page.getAttribute("aria-current")).toBe("page");
    expect(getComputedStyle(page).backgroundColor).toBe(color("var(--kl-cobalt)"));
    expect(getComputedStyle(page).color).toBe(color("var(--kl-on-cobalt)"));
    expect(getComputedStyle(page).fontSize).toBe(px(page, "--kl-text-body"));
    expect(getComputedStyle(q("breadcrumb-link")).color).toBe(color("var(--kl-ink)"));
    expect(getComputedStyle(q("breadcrumb-separator")).color).toBe(color("var(--kl-ink-3)"));
  });

  it("seams sit on each crumb's end edge, never the last's, and none on a start edge", async () => {
    await render(
      <Wide>
        <div className="dark">
          <Breadcrumb items={SHORT} />
        </div>
      </Wide>,
    );
    const [a, b, here] = all("breadcrumb-item");
    for (const el of [a!, b!]) {
      expect(getComputedStyle(el).borderInlineEndWidth).toBe(px(el, "--kl-k1"));
      expect(getComputedStyle(el).borderInlineEndColor).toBe(color("var(--kl-seam)", dark()));
    }
    expect(getComputedStyle(b!).borderInlineStartWidth).toBe("0px");
    expect(getComputedStyle(here!).borderInlineEndWidth).toBe("0px");
  });

  it("a control frame hugs its crumbs on the cell surface; a cell fills its row and leaves it the surface", async () => {
    await render(
      <main className="w-[720px]">
        <Breadcrumb items={SHORT} />
        <div className="kl-frame">
          <Breadcrumb items={SHORT} layout="cell" />
        </div>
      </main>,
    );
    const [control, cell] = all("breadcrumb-list");
    expect(getComputedStyle(control!).backgroundColor).toBe(color("var(--kl-cell)"));
    expect(getComputedStyle(control!).display).toBe("inline-flex");
    expect(control!.getBoundingClientRect().height).toBe(parseFloat(px(control!, "--kl-ctl")));
    expect(getComputedStyle(cell!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(cell!).display).toBe("flex");
    expect(cell!.getBoundingClientRect().height).toBe(parseFloat(px(cell!, "--kl-row")));
  });

  it("folds by count: the earlier levels go into the … cell, the parent and the page stay", async () => {
    await render(
      <main className="w-[900px]">
        <Breadcrumb items={SHORT} />
        <Breadcrumb items={LONG} />
      </main>,
    );
    const [short, long] = all("breadcrumb");
    // the … cell is there for the width fold, out of the layout until a fold calls it
    expect(shown(q("breadcrumb-more", short))).toBe(false);
    expect(all("breadcrumb-link", short).filter(shown).length).toBe(2);
    expect(shown(q("breadcrumb-more", long))).toBe(true);
    expect(
      all("breadcrumb-link", long)
        .filter(shown)
        .map((l) => l.textContent),
    ).toEqual(["Rotterdam"]);
  });

  it("folds by width: under 480px of its own width, and its links truncate sooner", async () => {
    const few = LONG.slice(1);
    await render(
      <main>
        <div className="w-[640px]">
          <Breadcrumb items={few} maxItems={9} />
        </div>
        <div className="w-[470px]">
          <Breadcrumb items={few} maxItems={9} />
        </div>
      </main>,
    );
    const [wide, narrow] = all("breadcrumb");
    expect(shown(q("breadcrumb-more", wide))).toBe(false);
    expect(all("breadcrumb-link", wide).filter(shown).length).toBe(3);
    expect(shown(q("breadcrumb-more", narrow))).toBe(true);
    expect(all("breadcrumb-link", narrow).filter(shown).length).toBe(1);
    const ch = (el: HTMLElement, n: number) => {
      const probe = document.createElement("span");
      // out of the flow: a flex item's used width would be the link's to shrink
      probe.style.cssText = `position: absolute; width: ${n}ch`;
      el.append(probe);
      const w = getComputedStyle(probe).width;
      probe.remove();
      return w;
    };
    const w = q("breadcrumb-link", wide);
    const n = all("breadcrumb-link", narrow).find(shown)!;
    // to the layout unit (1/64px): the probe's ch and the link's round apart
    expect(parseFloat(getComputedStyle(w).maxWidth)).toBeCloseTo(parseFloat(ch(w, 22)), 1);
    expect(parseFloat(getComputedStyle(n).maxWidth)).toBeCloseTo(parseFloat(ch(n, 14)), 1);
    // the fold's trigger never truncates
    expect(getComputedStyle(q("menu-trigger", narrow)).maxWidth).toBe("none");
  });

  it("the fold's trigger reads inverse while its menu is open, the chevron with it", async () => {
    await render(
      <Wide>
        <Breadcrumb items={LONG} />
      </Wide>,
    );
    const trigger = q("menu-trigger");
    trigger.click();
    await expect.poll(() => trigger.hasAttribute("data-popup-open")).toBe(true);
    expect(getComputedStyle(trigger).backgroundColor).toBe(color("var(--kl-inverse)"));
    expect(getComputedStyle(trigger).color).toBe(color("var(--kl-on-inverse)"));
    expect(getComputedStyle(q("breadcrumb-separator", trigger)).color).toBe(color("var(--kl-on-inverse)"));
  });

  it("an ancestor under the pointer underlines its label", async () => {
    await render(
      <Wide>
        <Breadcrumb items={SHORT} />
      </Wide>,
    );
    const link = q("breadcrumb-link");
    await userEvent.hover(link);
    await expect.poll(() => getComputedStyle(link.firstElementChild!).textDecorationLine).toBe("underline");
  });

  it("RTL: the chevrons mirror; an LTR island inside keeps them", async () => {
    await render(
      <Wide>
        <div dir="rtl">
          <Breadcrumb items={SHORT} />
          <div dir="ltr">
            <Breadcrumb items={SHORT} />
          </div>
        </div>
      </Wide>,
    );
    const [rtl, ltr] = all("breadcrumb");
    expect(getComputedStyle(q("breadcrumb-separator", rtl)).scale).toBe("-1 1");
    expect(getComputedStyle(q("breadcrumb-separator", ltr)).scale).toBe("none");
  });
});
