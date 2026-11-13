// Resizable's parts are react-resizable-panels' components (the library owns the separator's ARIA, keys, pointer
// and layout). They take no `render` and no function className or style, so Base UI's wrapper contract applies only in
// part: each forwards its props, its element ref (`elementRef`) and a className, and carries its slot. Then axe, the
// keyboard, and the look the utilities carry: the 1px seam, the 3px ink line while hovered or held, the focus colour,
// the grip cell and its horizontal form.
import "./render-count";

import * as React from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/keyline/ui/resizable";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";

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
/* each gradient layer's size; engines list one value for all layers or one per layer */
const layers = (v: string) => [...new Set(v.split(",").map((x) => x.trim()))].join(", ");
/* In light every edge is ink, so an edge colour is only told apart in dark */
const dark = () => document.querySelector(".dark")!;
const q = (slot: string) => document.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;

function Example({ orientation = "horizontal" as "horizontal" | "vertical", withHandle = true, theme = "dark" }) {
  return (
    <div className={theme} style={{ width: 480, height: 240, display: "flex" }}>
      <ResizablePanelGroup orientation={orientation} aria-label="Manifests split">
        <ResizablePanel id="list" defaultSize="40%" minSize="20%">
          List
        </ResizablePanel>
        <ResizableHandle withHandle={withHandle} aria-label="Manifests" />
        <ResizablePanel id="detail">Detail</ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

const inGroup = (part: React.ReactNode) => (
  <ResizablePanelGroup>
    <ResizablePanel id="a">A</ResizablePanel>
    {part}
    <ResizablePanel id="b">B</ResizablePanel>
  </ResizablePanelGroup>
);

/* the library puts a Panel's className on its inner element (which may shrink below its content) */
const PARTS: Record<
  string,
  { element: React.ReactElement<Record<string, unknown>>; slot: string; classOnChild?: boolean; wrap?: typeof inGroup }
> = {
  ResizablePanelGroup: { element: <ResizablePanelGroup />, slot: "resizable" },
  ResizablePanel: {
    element: <ResizablePanel id="part" />,
    slot: "resizable-panel",
    classOnChild: true,
    wrap: (p) => <ResizablePanelGroup>{p}</ResizablePanelGroup>,
  },
  ResizableHandle: { element: <ResizableHandle aria-label="Seam" />, slot: "resizable-handle", wrap: inGroup },
};

describe("resizable: library parts", () => {
  for (const [name, part] of Object.entries(PARTS)) {
    it(`${name}: props, elementRef and className reach its element, which carries its slot`, async () => {
      const elementRef = React.createRef<HTMLDivElement>();
      const el = React.cloneElement(part.element, {
        elementRef,
        "data-testid": "part",
        "data-probe": "kept",
        className: "from-part",
      });
      await render(<main>{part.wrap ? part.wrap(el) : el}</main>);
      const node = document.querySelector<HTMLElement>('[data-testid="part"]')!;
      expect(elementRef.current).toBe(node);
      expect(node.getAttribute("data-probe")).toBe("kept");
      expect((part.classOnChild ? node.firstElementChild! : node).classList.contains("from-part")).toBe(true);
      expect(node.getAttribute("data-slot")).toBe(part.slot);
    });
  }
  it("an explicit data-slot does not replace the part's", async () => {
    await render(<main>{inGroup(<ResizableHandle aria-label="Seam" data-slot="other" />)}</main>);
    expect(document.querySelector('[role="separator"]')!.getAttribute("data-slot")).toBe("resizable-handle");
  });
});

describe("resizable: axe and keyboard", () => {
  it("has no violations", async () => {
    await render(
      <main>
        <Example theme="" />
      </main>,
    );
    await expectNoAxeViolations();
  });

  it("Tab reaches the separator; the arrows move the seam", async () => {
    await render(
      <main>
        <Example />
      </main>,
    );
    const sep = document.querySelector<HTMLElement>('[role="separator"]')!;
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(sep);
    const before = Number(sep.getAttribute("aria-valuenow"));
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => Number(sep.getAttribute("aria-valuenow"))).toBeGreaterThan(before);
  });
});

describe("resizable: style", () => {
  it("at rest the seam is one 1px line; its 3px ink line is centred on it and hidden", async () => {
    await render(<Example />);
    const h = q("resizable-handle");
    expect(cs(h).width).toBe(px(h, "--kl-k1"));
    expect(cs(h).backgroundColor).toBe(color("var(--kl-line)", dark()));
    expect(cs(h).outlineStyle).toBe("none");
    expect(cs(h).outlineWidth).toBe("0px");
    expect(cs(h).position).toBe("relative");
    expect(cs(h).zIndex).toBe("1");
    const after = cs(h, "::after");
    expect(after.content).toBe('""');
    expect(after.width).toBe(px(h, "--kl-k3"));
    expect(after.translate).toBe("-50%");
    expect(after.opacity).toBe("0");
    expect(after.backgroundColor).toBe(color("var(--kl-ink)", dark()));
    expect(after.pointerEvents).toBe("none");
  });

  it("hovered or held (the library's data-separator) the line shows; keyboard focus draws it in the focus colour", async () => {
    await render(<Example />);
    const h = q("resizable-handle");
    for (const state of ["hover", "active"]) {
      h.setAttribute("data-separator", state);
      expect(cs(h, "::after").opacity).toBe("1");
    }
    h.setAttribute("data-separator", "inactive");
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(h);
    expect(cs(h, "::after").opacity).toBe("1");
    expect(cs(h, "::after").backgroundColor).toBe(color("var(--kl-focus)", dark()));
  });

  it("the grip is a 14×28 cell on the seam with two short keylines; hovered it takes ink, held it inverts", async () => {
    await render(<Example />);
    const h = q("resizable-handle");
    const g = q("resizable-grip");
    expect(cs(g).width).toBe("14px");
    expect(cs(g).height).toBe("28px");
    expect(cs(g).translate).toBe("-50% -50%");
    expect(cs(g).borderTopWidth).toBe(px(g, "--kl-k1"));
    expect(cs(g).borderTopColor).toBe(color("var(--kl-line)", dark()));
    expect(cs(g).backgroundColor).toBe(color("var(--kl-cell)", dark()));
    expect(layers(cs(g).backgroundSize)).toBe("1px 12px");
    expect(cs(g).backgroundPosition).toBe("4px 50%, 7px 50%");
    expect(cs(g).backgroundImage).toMatch(/^linear-gradient.*linear-gradient/);
    h.setAttribute("data-separator", "hover");
    expect(cs(g).borderTopColor).toBe(color("var(--kl-ink)", dark()));
    h.setAttribute("data-separator", "active");
    expect(cs(g).backgroundColor).toBe(color("var(--kl-inverse)", dark()));
    expect(cs(g).borderTopColor).toBe(color("var(--kl-inverse)", dark()));
    expect(cs(g).backgroundImage).toBe("none");
  });

  it("keyboard focus gives the grip a ring-weight border in the focus colour", async () => {
    await render(<Example />);
    const g = q("resizable-grip");
    await userEvent.keyboard("{Tab}");
    expect(cs(g).borderTopWidth).toBe(px(g, "--kl-ring"));
    expect(cs(g).borderTopColor).toBe(color("var(--kl-focus)", dark()));
  });

  it("a vertical group lays the seam across: 1px high, the line and the grip turned", async () => {
    await render(<Example orientation="vertical" />);
    const h = q("resizable-handle");
    expect(h.getAttribute("aria-orientation")).toBe("horizontal");
    expect(cs(h).height).toBe(px(h, "--kl-k1"));
    expect(cs(h).width).toBe("480px");
    const after = cs(h, "::after");
    expect(after.height).toBe(px(h, "--kl-k3"));
    expect(after.width).toBe("480px");
    expect(after.translate).toBe("0px -50%");
    const g = q("resizable-grip");
    expect(cs(g).width).toBe("28px");
    expect(cs(g).height).toBe("14px");
    expect(layers(cs(g).backgroundSize)).toBe("12px 1px");
    expect(cs(g).backgroundPosition).toBe("50% 4px, 50% 7px");
  });

  it("panels may shrink below their content; a standalone group is the outermost Keyline element", async () => {
    await render(<Example />);
    const inner = q("resizable-panel").firstElementChild!;
    expect(cs(inner).minWidth).toBe("0px");
    expect(cs(inner).minHeight).toBe("0px");
    expect(q("resizable").classList.contains("kl-type")).toBe(true);
  });
});
