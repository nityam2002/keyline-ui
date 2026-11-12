// Scroll Area's parts (Base UI ScrollArea's Root, Viewport, Content, Scrollbar, Thumb and Corner), keyboard, axe and
// the look the utilities carry: the bar as a cell on the region's edge, the room the viewport gives it, the hidden
// thumb of an overlay platform, the rail, the corner, the focus ring the root draws, and a region inside another.
import "./render-count";

import * as React from "react";
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@/components/keyline/ui/scroll-area";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const tall = <div style={{ height: 600, width: 600 }}>Manifest lines</div>;
/* a region that overflows both ways, so every bar (and the corner) renders */
const inRoot = (part: React.ReactNode, children: React.ReactNode = null) => (
  <ScrollAreaRoot scrollbars="both" style={{ height: 120, width: 200 }}>
    <ScrollAreaViewport>
      <ScrollAreaContent>{tall}</ScrollAreaContent>
    </ScrollAreaViewport>
    {part}
    {children}
  </ScrollAreaRoot>
);
/* the bars render once Base UI has measured the overflow */
const scrollbarReady = (slot: string) => async () => {
  await expect.poll(() => document.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
};

describeConformance("scroll-area", {
  ScrollAreaRoot: { element: <ScrollAreaRoot />, refInstanceof: HTMLDivElement, slot: "scroll-area" },
  ScrollAreaViewport: {
    element: <ScrollAreaViewport />,
    refInstanceof: HTMLDivElement,
    slot: "scroll-area-viewport",
    wrap: (part) => <ScrollAreaRoot>{part}</ScrollAreaRoot>,
  },
  ScrollAreaContent: {
    element: <ScrollAreaContent />,
    refInstanceof: HTMLDivElement,
    slot: "scroll-area-content",
    wrap: (part) => (
      <ScrollAreaRoot>
        <ScrollAreaViewport>{part}</ScrollAreaViewport>
      </ScrollAreaRoot>
    ),
  },
  ScrollAreaScrollbar: {
    element: <ScrollAreaScrollbar orientation="vertical" keepMounted />,
    refInstanceof: HTMLDivElement,
    slot: "scroll-area-scrollbar",
    wrap: (part) => inRoot(part),
    ready: scrollbarReady("scroll-area-scrollbar"),
  },
  ScrollAreaThumb: {
    element: <ScrollAreaThumb />,
    refInstanceof: HTMLDivElement,
    slot: "scroll-area-thumb",
    wrap: (part) => inRoot(<ScrollAreaScrollbar keepMounted>{part}</ScrollAreaScrollbar>),
    ready: scrollbarReady("scroll-area-scrollbar"),
  },
  ScrollAreaCorner: {
    element: <ScrollAreaCorner />,
    refInstanceof: HTMLDivElement,
    slot: "scroll-area-corner",
    wrap: (part) =>
      inRoot(
        <>
          <ScrollAreaScrollbar orientation="vertical" keepMounted />
          <ScrollAreaScrollbar orientation="horizontal" keepMounted />
        </>,
        part,
      ),
    ready: scrollbarReady("scroll-area-scrollbar"),
  },
});

const q = (slot: string, root: ParentNode = document) => root.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;
const cs = (el: Element, pseudo?: string) => getComputedStyle(el, pseudo);
function color(value: string, root: Element = document.body) {
  const probe = document.createElement("span");
  probe.style.color = value;
  root.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}
const px = (el: Element, v: string) => {
  const probe = document.createElement("span");
  probe.style.width = `var(${v})`;
  el.append(probe);
  const w = getComputedStyle(probe).width;
  probe.remove();
  return w;
};
/* a length that may be negative (an outline offset), resolved through a margin */
const len = (el: Element, v: string) => {
  const probe = document.createElement("span");
  probe.style.marginLeft = `var(${v})`;
  el.append(probe);
  const m = getComputedStyle(probe).marginLeft;
  probe.remove();
  return m;
};
const dark = () => document.querySelector(".dark")!;
const bar = (orientation: "vertical" | "horizontal", root: ParentNode = document) =>
  root.querySelector<HTMLElement>(`[data-slot="scroll-area-scrollbar"][data-orientation="${orientation}"]`);
const lines = (n: number) =>
  Array.from({ length: n }, (_, i) => (
    <p key={i} style={{ margin: 0, height: 20 }}>
      Event {i + 1}
    </p>
  ));

function Log(props: Partial<React.ComponentProps<typeof ScrollArea>>) {
  return (
    <ScrollArea label="Activity" style={{ height: 160, width: 240 }} {...props}>
      {lines(30)}
    </ScrollArea>
  );
}

describe("scroll-area: axe", () => {
  it("has no violations: a labelled region that overflows, and one with both bars", async () => {
    await render(
      <main>
        <Log />
        <ScrollArea label="Wide table" scrollbars="both" style={{ height: 120, width: 200 }}>
          {tall}
        </ScrollArea>
      </main>,
    );
    await expect.poll(() => bar("horizontal")).not.toBeNull();
    await expectNoAxeViolations();
  });
});

describe("scroll-area: keyboard", () => {
  it("an overflowing viewport is one Tab stop and scrolls with the keyboard (PageDown); Tab leaves at both edges", async () => {
    await render(
      <main>
        <input aria-label="Before" />
        <Log />
        <input aria-label="After" />
      </main>,
    );
    const vp = q("scroll-area-viewport");
    await expect.poll(() => vp.tabIndex).toBe(0);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    await expect.poll(() => document.activeElement).toBe(vp);
    await userEvent.keyboard("{PageDown}");
    await expect.poll(() => vp.scrollTop).toBeGreaterThan(0);
    await userEvent.keyboard("{Tab}");
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.poll(() => document.activeElement).toBe(vp);
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });
});

describe("scroll-area: style", () => {
  it("a bar is a 12px cell on the edge with its own 1px seam; the viewport gives up its width only while it overflows", async () => {
    await render(
      <div className="dark">
        <Log />
        <ScrollArea label="Short" style={{ height: 160, width: 240 }} data-testid="short">
          {lines(2)}
        </ScrollArea>
      </div>,
    );
    await expect.poll(() => bar("vertical")).not.toBeNull();
    const b = bar("vertical")!;
    const root = q("scroll-area");
    expect(b.getBoundingClientRect().width).toBe(12);
    expect(cs(b).borderInlineStartWidth).toBe(px(root, "--kl-k1"));
    expect(cs(b).borderInlineStartColor).toBe(color("var(--kl-seam)", dark()));
    expect(cs(b).backgroundColor).toBe(color("var(--kl-cell)", dark()));
    // the 2px ends are margins (the thumb's exact travel), and ::after paints the cell under them
    expect(cs(b).marginTop).toBe("2px");
    expect(cs(b).marginBottom).toBe("2px");
    expect(cs(b).paddingTop).toBe("0px");
    expect(cs(b).paddingLeft).toBe("2px");
    expect(cs(b, "::after").top).toBe("-2px");
    expect(cs(b, "::after").bottom).toBe("-2px");
    expect(cs(b, "::after").backgroundColor).toBe(color("var(--kl-cell)", dark()));
    expect(cs(b, "::after").borderInlineStartWidth).toBe(px(root, "--kl-k1"));
    expect(cs(q("scroll-area-viewport")).paddingInlineEnd).toBe("12px");
    // the viewport draws no outline of its own (the root rings it)
    expect(cs(q("scroll-area-viewport")).outlineStyle).toBe("none");
    expect(cs(q("scroll-area-viewport")).outlineWidth).toBe("0px");
    const short = document.querySelector('[data-testid="short"]')!;
    expect(cs(q("scroll-area-viewport", short)).paddingInlineEnd).toBe("0px");
  });

  it("right to left, the bar sits on the left with its seam on its right", async () => {
    await render(
      <div dir="rtl">
        <Log />
      </div>,
    );
    await expect.poll(() => bar("vertical")).not.toBeNull();
    const b = bar("vertical")!.getBoundingClientRect();
    const r = q("scroll-area").getBoundingClientRect();
    expect(b.left).toBe(r.left);
    expect(cs(bar("vertical")!).borderRightWidth).toBe(px(q("scroll-area"), "--kl-k1"));
    // the cell under the 2px ends runs from the seam to the region's left edge
    expect(cs(bar("vertical")!, "::after").right).toBe(`-${px(q("scroll-area"), "--kl-k1")}`);
    expect(cs(bar("vertical")!, "::after").left).toBe("0px");
    expect(cs(q("scroll-area-viewport")).paddingLeft).toBe("12px");
  });

  it("on an overlay platform the thumb hides slim; pointed at, it shows full width in the second ink", async () => {
    await render(
      <div className="dark">
        <Log scrollbarVisibility="scroll" />
      </div>,
    );
    await expect.poll(() => bar("vertical")).not.toBeNull();
    const thumb = q("scroll-area-thumb");
    expect(cs(thumb).opacity).toBe("0");
    expect(cs(thumb).scale).toMatch(/^0\.5714\d* 1$/);
    expect(cs(thumb).transitionDelay).toBe("0.4s, 0s, 0s");
    await userEvent.hover(bar("vertical")!);
    await expect.poll(() => cs(thumb).backgroundColor).toBe(color("var(--kl-ink-2)", dark()));
    await expect.poll(() => cs(thumb).opacity).toBe("1");
    expect(cs(thumb).scale).toBe("1");
    expect(cs(thumb).transitionDuration).toBe("0.09s, 0.12s, 0.12s");
    expect(cs(thumb).transitionDelay).toBe("0s");
  });

  it("scrolling an axis shows its thumb, still slim", async () => {
    await render(
      <>
        <input aria-label="Away" />
        <Log scrollbarVisibility="scroll" />
      </>,
    );
    // the pointer rests off the bar (an earlier test may have left it where this bar now is)
    await userEvent.hover(document.querySelector('[aria-label="Away"]')!);
    await expect.poll(() => bar("vertical")).not.toBeNull();
    const thumb = q("scroll-area-thumb");
    // a user's scroll (Base UI shows the thumb for the reader's own scrolling, not a script's)
    await expect.poll(() => q("scroll-area-viewport").tabIndex).toBe(0);
    q("scroll-area-viewport").focus();
    await userEvent.keyboard("{PageDown}");
    await expect.poll(() => bar("vertical")!.hasAttribute("data-scrolling")).toBe(true);
    await expect.poll(() => cs(thumb).opacity).toBe("1");
    expect(cs(thumb).scale).not.toBe("1");
  });

  it("where native bars take space the thumb always shows, in the third ink", async () => {
    await render(
      <div className="dark">
        <Log scrollbarVisibility="always" />
      </div>,
    );
    await expect.poll(() => bar("vertical")).not.toBeNull();
    const thumb = q("scroll-area-thumb");
    expect(cs(thumb).opacity).toBe("1");
    expect(cs(thumb).scale).toBe("none");
    expect(cs(thumb).backgroundColor).toBe(color("var(--kl-ink-3)", dark()));
  });

  it("a rail has no cell: a 1px keyline runs the bar and the 6px thumb is centred on it", async () => {
    await render(
      <div className="dark">
        <Log track="rail" scrollbarVisibility="always" />
      </div>,
    );
    await expect.poll(() => bar("vertical")).not.toBeNull();
    const b = bar("vertical")!;
    expect(cs(b).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(cs(b).borderInlineStartWidth).toBe("0px");
    expect(cs(b).marginTop).toBe("0px");
    expect(cs(b, "::before").width).toBe(px(b, "--kl-k1"));
    expect(cs(b, "::before").backgroundColor).toBe(color("var(--kl-line-soft)", dark()));
    const t = q("scroll-area-thumb").getBoundingClientRect();
    const br = b.getBoundingClientRect();
    expect(t.width).toBe(6);
    expect(t.left - br.left).toBe(br.right - t.right);
  });

  it("a region inside a rail region keeps its own cell bar", async () => {
    await render(
      <ScrollArea track="rail" label="Page" style={{ height: 400, width: 320 }} data-testid="outer">
        <Log scrollbarVisibility="always" />
        <div style={{ height: 600 }} />
      </ScrollArea>,
    );
    const outer = document.querySelector<HTMLElement>('[data-testid="outer"]')!;
    const inner = outer.querySelector<HTMLElement>('[data-slot="scroll-area"]')!;
    await expect.poll(() => bar("vertical", inner)).not.toBeNull();
    const b = bar("vertical", inner)!;
    expect(cs(b).borderInlineStartWidth).toBe(px(b, "--kl-k1"));
    expect(cs(b).marginTop).toBe("2px");
    expect(q("scroll-area-thumb", b).getBoundingClientRect().width).toBe(7);
  });

  it("with both bars the corner cell closes their seams", async () => {
    await render(
      <div className="dark">
        <ScrollArea label="Wide" scrollbars="both" style={{ height: 120, width: 200 }}>
          {tall}
        </ScrollArea>
      </div>,
    );
    await expect.poll(() => document.querySelector('[data-slot="scroll-area-corner"]')).not.toBeNull();
    const c = q("scroll-area-corner");
    expect(cs(c).borderInlineStartWidth).toBe(px(c, "--kl-k1"));
    expect(cs(c).borderTopWidth).toBe(px(c, "--kl-k1"));
    expect(cs(c).borderTopColor).toBe(color("var(--kl-seam)", dark()));
    expect(cs(c).backgroundColor).toBe(color("var(--kl-cell)", dark()));
    const h = bar("horizontal")!;
    expect(cs(h).borderTopWidth).toBe(px(h, "--kl-k1"));
    expect(cs(h).marginLeft).toBe("2px");
    expect(cs(q("scroll-area-viewport")).paddingBottom).toBe("12px");
  });

  it("a keyboard-focused viewport is ringed by the root, inside the region and above the bars", async () => {
    await render(
      <div className="dark">
        <input aria-label="Before" />
        <Log />
      </div>,
    );
    const vp = q("scroll-area-viewport");
    await expect.poll(() => vp.tabIndex).toBe(0);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    await expect.poll(() => document.activeElement).toBe(vp);
    const ring = cs(q("scroll-area"), "::after");
    expect(ring.outlineStyle).toBe("solid");
    expect(ring.outlineWidth).toBe(px(vp, "--kl-ring"));
    expect(ring.outlineOffset).toBe(len(vp, "--kl-ring-in"));
    expect(ring.outlineColor).toBe(color("var(--kl-focus)", dark()));
    expect(ring.zIndex).toBe("2");
    expect(cs(vp).outlineStyle).toBe("none");
  });

  it("reduced motion makes reveal and fade immediate, inside a reduced-motion scope and on the root itself", async () => {
    await render(
      <>
        <div data-kl-motion="reduce">
          <Log data-testid="in" />
        </div>
        <Log data-testid="self" data-kl-motion="reduce" />
        <Log data-testid="plain" />
      </>,
    );
    const v = (id: string) => cs(document.querySelector(`[data-testid="${id}"]`)!).getPropertyValue("--kl-t-reveal");
    expect(v("in")).toBe("0ms");
    expect(v("self")).toBe("0ms");
    expect(v("plain")).toBe("90ms");
  });

  it("the root is the outermost Keyline element: its content takes Keyline's type", async () => {
    await render(
      <div style={{ fontFamily: "serif", fontSize: 30 }}>
        <Log />
      </div>,
    );
    const p = q("scroll-area-content").querySelector("p")!;
    expect(cs(p).fontFamily).not.toBe("serif");
    expect(cs(p).fontSize).toBe(px(p, "--kl-fs"));
  });
});
