// Collapsible's parts (Base UI Collapsible's Root, Trigger and Panel), keyboard, axe and the look the utilities carry:
// the caret box, the spine that continues its keyline down the content, and the unfold.
import "./render-count";

import * as React from "react";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "@/components/keyline/ui/collapsible";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("collapsible", {
  CollapsibleRoot: { element: <CollapsibleRoot />, refInstanceof: HTMLDivElement, slot: "collapsible" },
  CollapsibleTrigger: {
    element: <CollapsibleTrigger>More</CollapsibleTrigger>,
    refInstanceof: HTMLButtonElement,
    slot: "collapsible-trigger",
    button: true,
    wrap: (part) => <CollapsibleRoot>{part}</CollapsibleRoot>,
  },
  CollapsiblePanel: {
    element: <CollapsiblePanel>Body</CollapsiblePanel>,
    refInstanceof: HTMLDivElement,
    slot: "collapsible-panel",
    wrap: (part) => <CollapsibleRoot defaultOpen>{part}</CollapsibleRoot>,
  },
});

/* WebKit on macOS leaves buttons out of the Tab order by default; Option+Tab walks every control */
const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";
const BACK = server.browser === "webkit" ? "{Shift>}{Alt>}{Tab}{/Alt}{/Shift}" : "{Shift>}{Tab}{/Shift}";

function Example(props: Partial<React.ComponentProps<typeof Collapsible>> & { disabled?: boolean }) {
  return (
    <Collapsible {...props}>
      <CollapsibleTrigger meta="12">Advanced options</CollapsibleTrigger>
      <CollapsiblePanel contentClassName="grid gap-4">
        <p className="probe-m">Axle load</p>
        <p>Tolerance</p>
      </CollapsiblePanel>
    </Collapsible>
  );
}

const q = (slot: string, root: ParentNode = document) => root.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;

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
/* a margin from a layer under the utilities (a component class, the base), which the content's first-child rule beats */
const Margins = () => <style>{"@layer components { .probe-m { margin-block: 16px } }"}</style>;
const px = (el: Element, v: string) => {
  const probe = document.createElement("span");
  probe.style.width = `var(${v})`;
  el.append(probe);
  const w = getComputedStyle(probe).width;
  probe.remove();
  return w;
};

describe("collapsible: axe", () => {
  it("has no violations: closed, open and disabled", async () => {
    await render(
      <main>
        <Example />
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Open options</CollapsibleTrigger>
          <CollapsiblePanel>Body</CollapsiblePanel>
        </Collapsible>
        <Collapsible disabled>
          <CollapsibleTrigger meta="2">Locked options</CollapsibleTrigger>
          <CollapsiblePanel>Body</CollapsiblePanel>
        </Collapsible>
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("collapsible: keyboard", () => {
  it("the trigger is one Tab stop; Enter and Space toggle with Base UI's event details; Tab leaves at both edges", async () => {
    const seen: [boolean, { reason: string }][] = [];
    await render(
      <main>
        <input aria-label="Before" />
        <Example onOpenChange={(open, details) => seen.push([open, details])} />
        <input aria-label="After" />
      </main>,
    );
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard(TAB);
    const trigger = q("collapsible-trigger");
    await expect.poll(() => document.activeElement).toBe(trigger);
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("true");
    expect(seen.at(-1)![0]).toBe(true);
    expect(seen.at(-1)![1].reason).toBeTypeOf("string");
    await userEvent.keyboard(" ");
    await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("false");
    await userEvent.keyboard(TAB);
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard(BACK);
    await expect.poll(() => document.activeElement).toBe(trigger);
    await userEvent.keyboard(BACK);
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });
});

describe("collapsible: style", () => {
  it("the caret box is an 18px square in a 2px line on the cell surface; open, its caret turns", async () => {
    await render(
      <div className="dark">
        <Example defaultOpen />
      </div>,
    );
    const box = q("collapsible-box");
    expect(box.getBoundingClientRect().width).toBe(18);
    expect(box.getBoundingClientRect().height).toBe(18);
    expect(getComputedStyle(box).borderTopWidth).toBe(px(box, "--kl-k2"));
    expect(getComputedStyle(box).borderTopColor).toBe(color("var(--kl-line)", dark()));
    expect(getComputedStyle(box).backgroundColor).toBe(color("var(--kl-cell)", dark()));
    expect(getComputedStyle(box.querySelector("svg")!).rotate).toBe("180deg");
  });

  for (const dir of ["ltr", "rtl"] as const)
    it(`${dir}: the spine continues the box's keyline down the content's start edge, and the content clears it`, async () => {
      await render(
        <div dir={dir} className="dark">
          <Margins />
          <Example defaultOpen />
        </div>,
      );
      await expect.poll(() => q("collapsible-panel").hasAttribute("data-starting-style")).toBe(false);
      const box = q("collapsible-box").getBoundingClientRect();
      const content = q("collapsible-content");
      const cs = getComputedStyle(content);
      const r = content.getBoundingClientRect();
      // the spine's 2px line sits centred under the box
      const spine = dir === "ltr" ? r.left + 1 : r.right - 1;
      expect(spine).toBe(box.left + box.width / 2);
      expect(cs.borderInlineStartWidth).toBe(px(content, "--kl-k2"));
      expect(cs.borderInlineStartColor).toBe(color("var(--kl-line)", dark()));
      // the text starts 18px past the spine, on the spine's side
      expect(cs.paddingInlineStart).toBe("18px");
      expect(cs.paddingInlineEnd).toBe("0px");
      expect(getComputedStyle(content.firstElementChild!).marginTop).toBe("0px");
      expect(cs.display).toBe("grid");
    });

  it("under the pointer the box tints and the label underlines", async () => {
    await render(<Example />);
    await userEvent.hover(q("collapsible-trigger"));
    await expect.poll(() => getComputedStyle(q("collapsible-box")).backgroundColor).toBe(color("var(--kl-tint)"));
    expect(getComputedStyle(q("collapsible-label")).textDecorationLine).toBe("underline");
    expect(getComputedStyle(q("collapsible-label")).textUnderlineOffset).toBe("3px");
  });

  it("disabled: disabled ink, the box hatched in the disabled line, no hover", async () => {
    await render(<Example disabled />);
    const trigger = q("collapsible-trigger");
    await userEvent.hover(trigger, { force: true });
    expect(getComputedStyle(trigger).color).toBe(color("var(--kl-dis)"));
    expect(getComputedStyle(trigger).cursor).toBe("not-allowed");
    const box = getComputedStyle(q("collapsible-box"));
    expect(box.borderTopColor).toBe(color("var(--kl-dis-line)"));
    expect(box.backgroundImage).toMatch(/linear-gradient/);
    expect(box.backgroundColor).toBe(color("var(--kl-cell)"));
    expect(getComputedStyle(q("collapsible-label")).textDecorationLine).toBe("none");
  });

  it("the meta is the Code voice; the label the body size, whatever size it sits in", async () => {
    await render(
      <div className="kl-cells" style={{ fontSize: 20 }}>
        <Example />
      </div>,
    );
    const meta = getComputedStyle(q("collapsible-meta"));
    const probe = document.createElement("span");
    probe.style.fontFamily = "var(--kl-font-mono)";
    q("collapsible-meta").append(probe);
    expect(meta.fontFamily).toBe(getComputedStyle(probe).fontFamily);
    probe.remove();
    expect(getComputedStyle(q("collapsible-label")).fontSize).toBe(px(q("collapsible-label"), "--kl-text-body"));
  });

  it("the panel clips and is height 0 at the start and end of its unfold", async () => {
    await render(<Example defaultOpen />);
    const panel = q("collapsible-panel");
    expect(getComputedStyle(panel).overflow).toBe("hidden");
    await expect
      .poll(() => panel.getBoundingClientRect().height)
      .toBe(q("collapsible-content").getBoundingClientRect().height);
    panel.style.transition = "none";
    for (const a of ["data-starting-style", "data-ending-style"]) {
      panel.setAttribute(a, "");
      expect(panel.getBoundingClientRect().height, a).toBe(0);
      panel.removeAttribute(a);
    }
  });

  it("the root is the outermost Keyline element: its content takes Keyline's ink, unless it sits in another one", async () => {
    await render(
      <main style={{ color: "rgb(255, 0, 0)" }}>
        <Example defaultOpen />
        <div className="kl-cells" style={{ color: "rgb(0, 128, 0)" }}>
          <Example defaultOpen />
        </div>
      </main>,
    );
    const [outer, inner] = document.querySelectorAll('[data-slot="collapsible-content"]');
    expect(getComputedStyle(outer!).color).toBe(color("var(--kl-ink)"));
    expect(getComputedStyle(inner!).color).toBe("rgb(0, 128, 0)");
  });
});
