// Tabs' parts (Base UI Tabs' Root, List, Tab and Panel), the band the stretch engine draws under the chosen tab,
// keyboard, axe and the look the utilities carry.
import "./render-count";

import * as React from "react";
import { Tabs, TabsList, TabsPanel, TabsRoot, TabsTab } from "@/components/keyline/ui/tabs";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inRoot = (part: React.ReactNode) => <TabsRoot defaultValue="a">{part}</TabsRoot>;

describeConformance("tabs", {
  TabsRoot: { element: <TabsRoot defaultValue="a" />, refInstanceof: HTMLDivElement, slot: "tabs" },
  TabsList: {
    element: <TabsList aria-label="Views" />,
    refInstanceof: HTMLDivElement,
    slot: "tabs-list",
    wrap: inRoot,
  },
  TabsTab: {
    element: <TabsTab value="a">Open</TabsTab>,
    refInstanceof: HTMLButtonElement,
    slot: "tabs-tab",
    wrap: (part) => inRoot(<TabsList aria-label="Views">{part}</TabsList>),
  },
  TabsPanel: {
    element: <TabsPanel value="a">Body</TabsPanel>,
    refInstanceof: HTMLDivElement,
    slot: "tabs-panel",
    wrap: inRoot,
  },
});

/* WebKit on macOS leaves buttons out of the Tab order by default; Option+Tab walks every control */
const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";
const BACK = server.browser === "webkit" ? "{Shift>}{Alt>}{Tab}{/Alt}{/Shift}" : "{Shift>}{Tab}{/Shift}";

function Example({ layout, ...props }: { layout?: "control" | "cell" } & React.ComponentProps<typeof Tabs>) {
  return (
    <Tabs defaultValue="open" {...props}>
      <TabsList aria-label="Shipments" layout={layout}>
        <TabsTab value="open">Open</TabsTab>
        <TabsTab value="held" count={12}>
          Held
        </TabsTab>
        <TabsTab value="closed" disabled>
          Closed
        </TabsTab>
      </TabsList>
      <TabsPanel value="open">Open shipments</TabsPanel>
      <TabsPanel value="held">Held shipments</TabsPanel>
      <TabsPanel value="closed">Closed shipments</TabsPanel>
    </Tabs>
  );
}

const all = (slot: string) => [...document.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`)];
const tab = (name: string) => all("tabs-tab").find((t) => t.textContent?.startsWith(name))!;

function color(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
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

describe("tabs: axe", () => {
  it("has no violations: a control row with a count and a disabled tab, and a cell row", async () => {
    await render(
      <main>
        <Example />
        <div className="kl-frame">
          <Example layout="cell" />
        </div>
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("tabs: keyboard", () => {
  it("the chosen tab is the one Tab stop; arrows choose and show the panel; Tab leaves at both edges", async () => {
    const seen: [unknown, { reason: string }][] = [];
    await render(
      <main>
        <input aria-label="Before" />
        <Example onValueChange={(v, details) => seen.push([v, details])} />
        <input aria-label="After" />
      </main>,
    );
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard(TAB);
    await expect.poll(() => document.activeElement).toBe(tab("Open"));
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => tab("Held").getAttribute("aria-selected")).toBe("true");
    expect(seen.at(-1)![0]).toBe("held");
    expect(seen.at(-1)![1].reason).toBeTypeOf("string");
    expect(document.querySelector('[data-slot="tabs-panel"]:not([hidden])')!.textContent).toBe("Held shipments");
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => tab("Open").getAttribute("aria-selected")).toBe("true");
    // the panel is the next stop, then out
    await userEvent.keyboard(TAB);
    await expect.poll(() => document.activeElement?.getAttribute("data-slot")).toBe("tabs-panel");
    await userEvent.keyboard(TAB);
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard(BACK);
    await userEvent.keyboard(BACK);
    await expect.poll(() => document.activeElement).toBe(tab("Open"));
    await userEvent.keyboard(BACK);
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });
});

describe("tabs: style", () => {
  it("the band is cobalt under the chosen tab, whose label reads on-cobalt", async () => {
    await render(<Example />);
    await expect.poll(() => tab("Open").hasAttribute("data-kl-covered")).toBe(true);
    const band = document.querySelector<HTMLElement>('[data-slot="tabs-list"] > [data-kl-band]')!;
    expect(getComputedStyle(band).backgroundColor).toBe(color("var(--kl-cobalt)"));
    expect(getComputedStyle(band).position).toBe("absolute");
    expect(getComputedStyle(tab("Open")).color).toBe(color("var(--kl-on-cobalt)"));
    expect(getComputedStyle(tab("Held")).color).toBe(color("var(--kl-ink)"));
  });

  it("the first tab draws no divider; the next ones a k1 seam", async () => {
    await render(<Example />);
    expect(getComputedStyle(tab("Open")).borderInlineStartWidth).toBe("0px");
    expect(getComputedStyle(tab("Held")).borderInlineStartWidth).toBe(px(tab("Held"), "--kl-k1"));
    expect(getComputedStyle(tab("Held")).borderInlineStartColor).toBe(color("var(--kl-line)"));
  });

  it("a tab with a count is at least 104px, its label one step smaller and the count 21px", async () => {
    await render(<Example />);
    const held = tab("Held");
    expect(getComputedStyle(held).minWidth).toBe("104px");
    expect(getComputedStyle(tab("Open")).minWidth).toBe("auto");
    const label = held.querySelector<HTMLElement>('[data-slot="tabs-tab-label"]')!;
    expect(getComputedStyle(label).fontSize).toBe(px(held, "--kl-text-label"));
    expect(getComputedStyle(tab("Open").firstElementChild!).fontSize).toBe(px(held, "--kl-text-body"));
    expect(getComputedStyle(held.querySelector('[data-slot="tabs-tab-count"]')!).fontSize).toBe("21px");
  });

  it("a disabled tab is out of service: hatched, disabled ink, not-allowed", async () => {
    await render(<Example />);
    const cs = getComputedStyle(tab("Closed"));
    expect(cs.backgroundImage).toMatch(/linear-gradient/);
    expect(cs.color).toBe(color("var(--kl-dis)"));
    expect(cs.cursor).toBe("not-allowed");
  });

  it("a tab under the pointer tints; the chosen one keeps its band", async () => {
    await render(<Example />);
    await userEvent.hover(tab("Held"));
    await expect.poll(() => getComputedStyle(tab("Held")).backgroundColor).toBe(color("var(--kl-tint)"));
    await userEvent.hover(tab("Open"));
    expect(getComputedStyle(tab("Open")).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("a control row hugs its tabs on the cell surface; a cell row fills the frame and leaves it the surface", async () => {
    await render(
      <main className="w-[640px]">
        <Example />
        <div className="kl-frame">
          <Example layout="cell" />
        </div>
      </main>,
    );
    const [control, cell] = all("tabs-list");
    expect(getComputedStyle(control!).backgroundColor).toBe(color("var(--kl-cell)"));
    expect(control!.getBoundingClientRect().width).toBeLessThan(400);
    expect(getComputedStyle(cell!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(cell!.getBoundingClientRect().width).toBe(cell!.parentElement!.getBoundingClientRect().width);
  });

  it("a focused panel draws the ring outside it", async () => {
    // a ring-out other than 2px: the shadcn bridge's global :focus-visible offset is 2px
    await render(
      <main style={{ "--kl-ring-out": "4px" } as React.CSSProperties}>
        <Example />
      </main>,
    );
    tab("Open").focus();
    await userEvent.keyboard(TAB);
    const panel = document.activeElement as HTMLElement;
    expect(panel.getAttribute("data-slot")).toBe("tabs-panel");
    const cs = getComputedStyle(panel);
    expect(cs.outlineStyle).toBe("solid");
    expect(cs.outlineColor).toBe(color("var(--kl-focus)"));
    expect(cs.outlineOffset).toBe(px(panel, "--kl-ring-out"));
  });

  it("the root is the outermost Keyline element: its panels take Keyline's ink, unless it sits in another one", async () => {
    await render(
      <main style={{ color: "rgb(255, 0, 0)" }}>
        <Example />
        <div className="kl-cells" style={{ color: "rgb(0, 128, 0)" }}>
          <Example />
        </div>
      </main>,
    );
    const [outer, inner] = all("tabs-panel").filter((p) => !p.hidden);
    expect(getComputedStyle(outer!).color).toBe(color("var(--kl-ink)"));
    expect(getComputedStyle(inner!).color).toBe("rgb(0, 128, 0)");
  });
});
