// Accordion's parts (Base UI Accordion's Root, Item, Header, Trigger and Panel), the trigger's own header, keyboard,
// axe and the look the utilities carry: shared keylines, the caret column, the unfold and out of service.
import "./render-count";

import * as React from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionRoot,
  AccordionTrigger,
} from "@/components/keyline/ui/accordion";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inItem = (part: React.ReactNode) => (
  <AccordionRoot defaultValue={["a"]}>
    <AccordionItem value="a">{part}</AccordionItem>
  </AccordionRoot>
);

describeConformance("accordion", {
  AccordionRoot: { element: <AccordionRoot />, refInstanceof: HTMLDivElement, slot: "accordion" },
  AccordionItem: {
    element: <AccordionItem value="a" />,
    refInstanceof: HTMLDivElement,
    slot: "accordion-item",
    wrap: (part) => <AccordionRoot>{part}</AccordionRoot>,
  },
  AccordionHeader: {
    element: <AccordionHeader />,
    refInstanceof: HTMLHeadingElement,
    slot: "accordion-header",
    wrap: inItem,
  },
  AccordionTrigger: {
    element: <AccordionTrigger>Billing</AccordionTrigger>,
    refInstanceof: HTMLButtonElement,
    slot: "accordion-trigger",
    button: true,
    wrap: inItem,
  },
  AccordionPanel: {
    element: <AccordionPanel>Body</AccordionPanel>,
    refInstanceof: HTMLDivElement,
    slot: "accordion-panel",
    wrap: inItem,
  },
});

/* WebKit on macOS leaves buttons out of the Tab order by default; Option+Tab walks every control */
const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";
const BACK = server.browser === "webkit" ? "{Shift>}{Alt>}{Tab}{/Alt}{/Shift}" : "{Shift>}{Tab}{/Shift}";

function Example(props: Partial<React.ComponentProps<typeof Accordion>>) {
  return (
    <Accordion defaultValue={["docs"]} {...props}>
      <AccordionItem value="docs">
        <AccordionTrigger description="Invoice, packing list" meta="3 files">
          Customs documents
        </AccordionTrigger>
        <AccordionPanel contentClassName="grid gap-4">
          <p className="probe-m">Upload the EUR.1 before 14:00.</p>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="billing">
        <AccordionTrigger meta="€ 2,410">Billing</AccordionTrigger>
        <AccordionPanel flush>Net 30</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="hazmat" disabled>
        <AccordionTrigger description="Not applicable" meta="—">
          Dangerous goods
        </AccordionTrigger>
        <AccordionPanel>—</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

const all = (slot: string, root: ParentNode = document) => [
  ...root.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`),
];
const q = (slot: string, root: ParentNode = document) => all(slot, root)[0]!;
const items = () => all("accordion-item");
const trigger = (i: number) => q("accordion-trigger", items()[i]!);

function color(value: string, root: Element = document.body) {
  const probe = document.createElement("span");
  probe.style.color = value;
  root.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}
/* In light every edge is ink, so an edge colour is only told apart from the default (currentColor) in dark */
const Dark = ({ children }: { children: React.ReactNode }) => <div className="dark">{children}</div>;
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
/** waits for every transition on the page to land */
const settle = () => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {})));

describe("accordion: structure", () => {
  it("a trigger brings its own heading, at the level asked; one composed in a header doesn't add a second", async () => {
    await render(
      <Accordion>
        <AccordionItem value="a">
          <AccordionTrigger>Plain</AccordionTrigger>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger level={4}>Level four</AccordionTrigger>
        </AccordionItem>
        <AccordionItem value="c">
          <AccordionHeader level={2}>
            <AccordionTrigger>Composed</AccordionTrigger>
          </AccordionHeader>
        </AccordionItem>
      </Accordion>,
    );
    const heads = all("accordion-header");
    expect(heads.map((h) => h.tagName)).toEqual(["H3", "H4", "H2"]);
    expect(heads.every((h) => h.querySelectorAll('[data-slot="accordion-header"]').length === 0)).toBe(true);
    expect(heads.every((h) => h.firstElementChild?.getAttribute("data-slot") === "accordion-trigger")).toBe(true);
  });

  it("className goes to the panel, contentClassName to the content inside its clip", async () => {
    await render(
      <Accordion defaultValue={["a"]}>
        <AccordionItem value="a">
          <AccordionTrigger>A</AccordionTrigger>
          <AccordionPanel className="probe-panel" contentClassName="grid gap-4">
            <p>One</p>
            <p>Two</p>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>,
    );
    expect(q("accordion-panel").classList.contains("probe-panel")).toBe(true);
    expect(getComputedStyle(q("accordion-content")).display).toBe("grid");
    expect(getComputedStyle(q("accordion-content")).rowGap).toBe("16px");
  });
});

describe("accordion: axe", () => {
  it("has no violations: open and closed rows, a disabled row, and a cell accordion", async () => {
    await render(
      <main>
        <Example />
        <div className="kl-frame">
          <Accordion layout="cell" multiple defaultValue={["weights", "lanes"]}>
            <AccordionItem value="weights">
              <AccordionTrigger meta="2 limits">Weights</AccordionTrigger>
              <AccordionPanel>40 t gross</AccordionPanel>
            </AccordionItem>
            <AccordionItem value="lanes">
              <AccordionTrigger meta="NL → DE">Lanes</AccordionTrigger>
              <AccordionPanel flush>Rotterdam to Duisburg</AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("accordion: keyboard", () => {
  it("Tab moves between headers; Enter and Space toggle with Base UI's event details; Tab leaves at both edges", async () => {
    const seen: [unknown, { reason: string }][] = [];
    await render(
      <main>
        <input aria-label="Before" />
        <Example defaultValue={[]} onValueChange={(v, details) => seen.push([v, details])} />
        <input aria-label="After" />
      </main>,
    );
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard(TAB);
    await expect.poll(() => document.activeElement).toBe(trigger(0));
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => trigger(0).getAttribute("aria-expanded")).toBe("true");
    expect(seen.at(-1)![0]).toEqual(["docs"]);
    expect(seen.at(-1)![1].reason).toBeTypeOf("string");
    await userEvent.keyboard(" ");
    await expect.poll(() => trigger(0).getAttribute("aria-expanded")).toBe("false");
    await userEvent.keyboard(TAB);
    await expect.poll(() => document.activeElement).toBe(trigger(1));
    // the disabled row is not a stop
    await userEvent.keyboard(TAB);
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard(BACK);
    await userEvent.keyboard(BACK);
    await expect.poll(() => document.activeElement).toBe(trigger(0));
    await userEvent.keyboard(BACK);
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });
});

describe("accordion: style", () => {
  it("rows share keylines: each row after the first draws a k1 seam above it", async () => {
    await render(
      <Dark>
        <Example />
      </Dark>,
    );
    expect(getComputedStyle(items()[0]!).borderTopWidth).toBe("0px");
    expect(getComputedStyle(items()[1]!).borderTopWidth).toBe(px(items()[1]!, "--kl-k1"));
    expect(getComputedStyle(items()[1]!).borderTopColor).toBe(color("var(--kl-seam)", dark()));
  });

  it("the caret is a 40px column divided by a seam; open, it turns and reads in ink", async () => {
    await render(
      <Dark>
        <Example />
      </Dark>,
    );
    await settle();
    const open = q("accordion-caret", items()[0]!);
    const closed = q("accordion-caret", items()[1]!);
    expect(open.getBoundingClientRect().width).toBe(40);
    expect(getComputedStyle(open).borderInlineStartWidth).toBe(px(open, "--kl-k1"));
    expect(getComputedStyle(open).borderInlineStartColor).toBe(color("var(--kl-seam)", dark()));
    expect(getComputedStyle(open).color).toBe(color("var(--kl-ink)", dark()));
    expect(getComputedStyle(closed).color).toBe(color("var(--kl-ink-2)", dark()));
    expect(getComputedStyle(open.querySelector("svg")!).rotate).toBe("180deg");
    expect(getComputedStyle(closed.querySelector("svg")!).rotate).toBe("none");
    // the caret column runs straight down: rows with and without meta put it at the same x
    expect(open.getBoundingClientRect().left).toBe(closed.getBoundingClientRect().left);
  });

  it("the title is the lead size, the description and meta the label size in secondary ink", async () => {
    await render(<Example />);
    const t = trigger(0);
    const title = q("accordion-title", t).firstElementChild!;
    expect(getComputedStyle(title).fontSize).toBe(px(t, "--kl-text-lead"));
    expect(getComputedStyle(q("accordion-description", t)).fontSize).toBe(px(t, "--kl-text-label"));
    expect(getComputedStyle(q("accordion-meta", t)).color).toBe(color("var(--kl-ink-2)"));
    expect(t.getBoundingClientRect().height).toBeGreaterThanOrEqual(parseFloat(px(t, "--kl-row")));
  });

  it("a disabled row is out of service, every voice in it disabled ink", async () => {
    await render(<Example />);
    const t = trigger(2);
    expect(getComputedStyle(t).backgroundImage).toMatch(/linear-gradient/);
    expect(getComputedStyle(t).cursor).toBe("not-allowed");
    for (const slot of ["accordion-description", "accordion-meta", "accordion-caret"])
      expect(getComputedStyle(q(slot, t)).color, slot).toBe(color("var(--kl-dis)"));
  });

  it("a disabled row that is open keeps its caret in disabled ink", async () => {
    await render(
      <Accordion defaultValue={["x"]}>
        <AccordionItem value="x" disabled>
          <AccordionTrigger>Locked</AccordionTrigger>
          <AccordionPanel>Body</AccordionPanel>
        </AccordionItem>
      </Accordion>,
    );
    expect(getComputedStyle(q("accordion-caret")).color).toBe(color("var(--kl-dis)"));
  });

  it("a header row under the pointer tints", async () => {
    await render(<Example />);
    await userEvent.hover(trigger(1));
    await expect.poll(() => getComputedStyle(trigger(1)).backgroundColor).toBe(color("var(--kl-tint)"));
  });

  it("while a row is pressed its title travels and the caret cell stays put, its glyph travelling inside it", async () => {
    await render(<Example />);
    const t = trigger(1);
    t.setAttribute("data-kl-pressed", "");
    expect(getComputedStyle(q("accordion-title", t)).translate).toBe("0px 1px");
    expect(getComputedStyle(q("accordion-caret", t)).translate).toBe("none");
    expect(getComputedStyle(q("accordion-caret", t)).paddingTop).toBe("2px");
  });

  it("the content carries the seam under the header and the inset; flush drops the inset", async () => {
    await render(
      <Dark>
        <Margins />
        <Example multiple defaultValue={["docs", "billing"]} />
      </Dark>,
    );
    await settle();
    const [content, flush] = all("accordion-content");
    const inset = px(content!, "--kl-inset");
    expect(getComputedStyle(content!).borderTopWidth).toBe(px(content!, "--kl-k1"));
    expect(getComputedStyle(content!).borderTopColor).toBe(color("var(--kl-seam)", dark()));
    expect(getComputedStyle(content!).paddingInlineStart).toBe(inset);
    expect(getComputedStyle(content!).paddingBottom).toBe(`${parseFloat(inset) + 4}px`);
    expect(getComputedStyle(content!.firstElementChild!).marginTop).toBe("0px");
    expect(getComputedStyle(flush!).paddingInlineStart).toBe("0px");
    expect(getComputedStyle(flush!).paddingBottom).toBe("0px");
  });

  it("the panel unfolds from height 0 to its content's height, and clips while it moves", async () => {
    await render(<Example defaultValue={[]} />);
    trigger(1).click();
    await expect.poll(() => items()[1]!.querySelector('[data-slot="accordion-panel"]')).not.toBeNull();
    const panel = q("accordion-panel", items()[1]!);
    expect(getComputedStyle(panel).overflow).toBe("hidden");
    expect(getComputedStyle(panel).transitionProperty).toBe("height");
    await expect
      .poll(() => panel.getBoundingClientRect().height)
      .toBe(q("accordion-content", panel).getBoundingClientRect().height);
    expect(q("accordion-content", panel).getBoundingClientRect().height).toBeGreaterThan(0);
    // the start and end of the transition are height 0, the fold durations on the way out
    panel.style.transition = "none";
    for (const a of ["data-starting-style", "data-ending-style"]) {
      panel.setAttribute(a, "");
      expect(panel.getBoundingClientRect().height, a).toBe(0);
      panel.removeAttribute(a);
    }
    panel.style.transition = "";
    panel.setAttribute("data-ending-style", "");
    expect(getComputedStyle(panel).transitionDuration).toBe(
      getComputedStyle(panel)
        .getPropertyValue("--kl-t-fold")
        .trim()
        .replace(/^(\d+)ms$/, (_, n) => `${n / 1000}s`),
    );
    panel.removeAttribute("data-ending-style");
  });

  it("a control accordion is a cell surface in a 2px frame; a cell one leaves both to its frame", async () => {
    await render(
      <main>
        <Example />
        <div className="kl-frame">
          <Example layout="cell" />
        </div>
      </main>,
    );
    const [control, cell] = all("accordion");
    expect(getComputedStyle(control!).backgroundColor).toBe(color("var(--kl-cell)"));
    expect(getComputedStyle(control!).borderTopWidth).toBe(px(control!, "--kl-k2"));
    expect(getComputedStyle(cell!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(cell!).borderTopWidth).toBe("0px");
  });
});
