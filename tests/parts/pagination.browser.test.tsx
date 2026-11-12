// Pagination renders its own markup (there is no Base UI pagination), so the conformance suite does not apply: this
// checks what it forwards (props, ref, className, data-slot), paging, keyboard, axe and the look the utilities carry.
import "./render-count";

import * as React from "react";
import { Pagination } from "@/components/keyline/ui/pagination";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";

/* WebKit on macOS leaves buttons out of the Tab order by default; Option+Tab walks every control */
const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";

const all = (slot: string, root: ParentNode = document) => [
  ...root.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`),
];
const q = (slot: string, root: ParentNode = document) => all(slot, root)[0]!;
const shown = (el: Element) => el.getClientRects().length > 0;

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

function Paged(props: Partial<React.ComponentProps<typeof Pagination>>) {
  const [page, setPage] = React.useState(props.page ?? 5);
  return <Pagination pageCount={20} {...props} page={page} onPageChange={setPage} />;
}

describe("pagination: forwarding", () => {
  it("passes props, ref, className and style to the nav, which carries its data-slot", async () => {
    const ref = React.createRef<HTMLElement>();
    await render(
      <Pagination ref={ref} page={1} pageCount={3} className="probe" style={{ marginTop: 3 }} data-probe="kept" />,
    );
    const nav = q("pagination");
    expect(ref.current).toBe(nav);
    expect(nav.classList.contains("probe")).toBe(true);
    expect(nav.getAttribute("data-probe")).toBe("kept");
    expect(nav.style.marginTop).toBe("3px");
    expect(nav.style.getPropertyValue("--kl-pg-ch")).toBe("1");
  });
});

describe("pagination: axe", () => {
  it("has no violations: buttons, links, unknown count, a cell", async () => {
    await render(
      <main>
        <Pagination page={5} pageCount={20} label="Buttons" />
        <Pagination page={1} pageCount={20} label="Links" getHref={(p) => `#p${p}`} />
        <Pagination page={1} pageCount={null} label="Loading" />
        <div className="kl-frame">
          <Pagination page={20} pageCount={20} layout="cell" label="Cell" />
        </div>
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("pagination: keyboard", () => {
  it("every live cell is a Tab stop, the current page included; Enter pages", async () => {
    await render(
      <main>
        <input aria-label="Before" />
        <Paged />
      </main>,
    );
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard(TAB);
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Previous page");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => document.querySelector('[aria-current="page"]')?.textContent).toBe("4");
    await userEvent.keyboard(TAB);
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Page 1");
  });
});

describe("pagination: style", () => {
  it("the current page is the cobalt cell, its ring in its own text colour", async () => {
    await render(<Paged />);
    const here = document.querySelector<HTMLElement>('[aria-current="page"]')!;
    expect(here.getAttribute("data-slot")).toBe("pagination-page");
    expect(getComputedStyle(here).backgroundColor).toBe(color("var(--kl-cobalt)"));
    expect(getComputedStyle(here).color).toBe(color("var(--kl-on-cobalt)"));
    expect(getComputedStyle(here).cursor).toBe("default");
    // reached by keyboard, so the ring shows (focus-visible)
    document.querySelector<HTMLElement>('[aria-label="Page 4"]')!.focus();
    await userEvent.keyboard(TAB);
    await expect.poll(() => document.activeElement).toBe(here);
    expect(getComputedStyle(here).outlineColor).toBe(color("var(--kl-on-cobalt)"));
  });

  it("the frame keeps its width whichever page is current", async () => {
    const pages = [1, 2, 3, 5, 10, 17, 19, 20];
    await render(
      <main className="w-[720px]">
        {pages.map((p) => (
          <div key={p}>
            <Pagination page={p} pageCount={20} />
          </div>
        ))}
      </main>,
    );
    const widths = all("pagination-frame").map((f) => f.getBoundingClientRect().width);
    expect(widths).toHaveLength(pages.length);
    expect(new Set(widths).size).toBe(1);
  });

  it("Previous and Next are square in the frame; Previous widens by the cut's room", async () => {
    await render(
      <main>
        <Paged />
        <div data-kl-cut="on">
          <Paged />
        </div>
      </main>,
    );
    const [plain, cut] = all("pagination-frame");
    const next = q("pagination-next", plain);
    expect(next.getBoundingClientRect().width).toBe(plain!.clientHeight);
    expect(q("pagination-previous", plain).getBoundingClientRect().width).toBe(plain!.clientHeight);
    const prev = q("pagination-previous", cut);
    // --kl-c reads back as an unresolved calc(); a probe's width resolves it
    const probe = document.createElement("span");
    probe.style.cssText = "position: absolute; width: var(--kl-c)";
    cut!.append(probe);
    const c = parseFloat(getComputedStyle(probe).width);
    probe.remove();
    expect(c).toBeGreaterThan(0);
    expect(prev.getBoundingClientRect().width).toBeCloseTo(cut!.clientHeight + c * 0.35, 1);
    expect(parseFloat(getComputedStyle(prev).paddingInlineStart)).toBeCloseTo(c * 0.35, 1);
  });

  it("at the ends, the step is out of service: hatched, disabled ink, not-allowed", async () => {
    await render(
      <main>
        <Pagination page={1} pageCount={9} />
        <Pagination page={1} pageCount={9} getHref={(p) => `#p${p}`} />
      </main>,
    );
    for (const prev of all("pagination-previous")) {
      const cs = getComputedStyle(prev);
      expect(cs.backgroundImage).toMatch(/linear-gradient/);
      expect(cs.color).toBe(color("var(--kl-dis)"));
      expect(cs.cursor).toBe("not-allowed");
    }
    expect(getComputedStyle(q("pagination-next")).backgroundImage).toBe("none");
  });

  it("a number cell and a gap are as wide as the largest page number, in one weight", async () => {
    await render(<Paged />);
    const gap = q("pagination-ellipsis");
    const n = q("pagination-page");
    expect(getComputedStyle(gap).minWidth).toBe(getComputedStyle(n).minWidth);
    expect(getComputedStyle(gap).fontWeight).toBe(getComputedStyle(n).fontWeight);
    expect(getComputedStyle(gap).color).toBe(color("var(--kl-ink-2)"));
    expect(getComputedStyle(n).fontVariantNumeric).toBe("tabular-nums");
    expect(getComputedStyle(n).justifyContent).toBe("center");
  });

  it("under 360px of its own width, the numbers fold into one 5 / 20 cell between the steps", async () => {
    await render(
      <div className="w-[340px]">
        <Paged />
      </div>,
    );
    expect(all("pagination-page").some(shown)).toBe(false);
    expect(shown(q("pagination-ellipsis"))).toBe(false);
    const status = q("pagination-status");
    expect(getComputedStyle(status).display).toBe("flex");
    expect(getComputedStyle(status).flexGrow).toBe("1");
    expect(status.textContent!.replace(/\s/g, "")).toBe("5/20");
    expect(getComputedStyle(q("pagination-frame")).display).toBe("flex");
  });

  it("while the count is unknown, the status shows – and every cell is out of service", async () => {
    await render(
      <main className="w-[640px]">
        <Pagination page={1} pageCount={null} />
        <Pagination page={1} pageCount={20} />
      </main>,
    );
    const [loading, known] = all("pagination");
    const status = q("pagination-status", loading);
    expect(shown(status)).toBe(true);
    expect(status.textContent).toBe("–");
    expect(getComputedStyle(status).fontSize).toBe(getComputedStyle(status).getPropertyValue("--kl-text-label").trim());
    expect(getComputedStyle(status).color).toBe(color("var(--kl-ink)"));
    expect(shown(q("pagination-status", known))).toBe(false);
    expect((q("pagination-next", loading) as HTMLButtonElement).disabled).toBe(true);
  });

  it("as a row of a wider frame, the rest of the row is an empty cell whose seam closes the last key", async () => {
    await render(
      <div className="dark">
        <div className="kl-frame w-[640px]">
          <Pagination page={2} pageCount={4} layout="cell" />
        </div>
      </div>,
    );
    const frame = q("pagination-frame");
    const after = getComputedStyle(frame, "::after");
    expect(after.content).toBe('""');
    expect(after.flexGrow).toBe("1");
    expect(after.borderInlineStartColor).toBe(color("var(--kl-line)", dark()));
    expect(frame.getBoundingClientRect().width).toBe(frame.parentElement!.getBoundingClientRect().width);
    expect(getComputedStyle(frame).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(`${q("pagination-next").getBoundingClientRect().width}px`).toBe(
      getComputedStyle(frame).getPropertyValue("--kl-row").trim(),
    );
  });

  it("RTL: the arrows mirror", async () => {
    await render(
      <div dir="rtl">
        <Paged />
      </div>,
    );
    expect(getComputedStyle(q("pagination-next").querySelector("svg")!).scale).toBe("-1 1");
  });
});
