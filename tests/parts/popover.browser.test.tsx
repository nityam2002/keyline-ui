import "./render-count";

import * as React from "react";
import {
  Popover,
  PopoverBody,
  PopoverClose,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/keyline/ui/popover";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const open = (part: React.ReactNode) => (
  <Popover open>
    <PopoverPopup>{part}</PopoverPopup>
  </Popover>
);

describeConformance("popover", {
  PopoverTrigger: {
    element: <PopoverTrigger>Note</PopoverTrigger>,
    refInstanceof: HTMLButtonElement,
    slot: "popover-trigger",
    button: true,
    wrap: (part) => <Popover>{part}</Popover>,
  },
  PopoverPopup: {
    element: <PopoverPopup>Body</PopoverPopup>,
    refInstanceof: HTMLDivElement,
    slot: "popover-popup",
    wrap: (part) => <Popover open>{part}</Popover>,
  },
  PopoverClose: {
    element: <PopoverClose>Cancel</PopoverClose>,
    refInstanceof: HTMLButtonElement,
    slot: "popover-close",
    button: true,
    wrap: open,
  },
  PopoverTitle: {
    element: <PopoverTitle>Note</PopoverTitle>,
    refInstanceof: HTMLHeadingElement,
    slot: "popover-title",
    wrap: open,
  },
  PopoverDescription: {
    element: <PopoverDescription>Read before loading.</PopoverDescription>,
    refInstanceof: HTMLParagraphElement,
    slot: "popover-description",
    wrap: open,
  },
  PopoverHeader: {
    element: <PopoverHeader title="Note" />,
    refInstanceof: HTMLDivElement,
    slot: "popover-header",
    wrap: open,
  },
  PopoverBody: {
    element: <PopoverBody>Body</PopoverBody>,
    refInstanceof: HTMLDivElement,
    slot: "popover-body",
    wrap: open,
  },
  PopoverFooter: {
    element: <PopoverFooter>Footer</PopoverFooter>,
    refInstanceof: HTMLDivElement,
    slot: "popover-footer",
    wrap: open,
  },
});

/** A popover between two page fields, portalled into the page's landmark. */
function Example({ detached, attachWeight }: { detached?: boolean; attachWeight?: 1 | 2 }) {
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  return (
    // whole-pixel layout: Base UI places the popup on whole pixels, so the trigger's edges are whole too
    <main ref={setMain} style={{ padding: 40, display: "grid", gridAutoRows: 40, justifyItems: "start" }}>
      {/* text fields: every engine tabs to them (WebKit on macOS does not tab to buttons by default) */}
      <input aria-label="Before" />
      <Popover>
        <PopoverTrigger className="kl-ctl" style={{ padding: 8 }}>
          Delivery note
        </PopoverTrigger>
        <PopoverPopup container={main} detached={detached} attachWeight={attachWeight}>
          <PopoverHeader title="Delivery note" description="Read before loading." />
          <PopoverBody>
            <input aria-label="Note" />
          </PopoverBody>
          <PopoverFooter>
            <PopoverClose>Cancel</PopoverClose>
          </PopoverFooter>
        </PopoverPopup>
      </Popover>
      <input aria-label="After" />
    </main>
  );
}

const trigger = () => document.querySelector<HTMLElement>('[data-slot="popover-trigger"]')!;
const popup = () => document.querySelector<HTMLElement>('[data-slot="popover-popup"]');
const isOpen = () => trigger().hasAttribute("data-popup-open");

async function openByKeyboard() {
  trigger().focus();
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => popup()).not.toBeNull();
  await expect.poll(() => popup()!.contains(document.activeElement)).toBe(true);
  // the entry has landed: its position is final
  await expect.poll(() => popup()!.hasAttribute("data-starting-style")).toBe(false);
}

describe("popover: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
    await openByKeyboard();
    // non-modal: the page stays live around it, so the whole page is judged
    await expectNoAxeViolations();
  });
});

describe("popover: keyboard", () => {
  it("Escape closes the popover and returns focus to the trigger", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Escape}");
    await expect.poll(isOpen).toBe(false);
    await expect.poll(() => document.activeElement).toBe(trigger());
  });

  it("Tab leaves the open popover forward, to the page after the trigger, and closes it", async () => {
    await render(<Example />);
    await openByKeyboard();
    document.querySelector<HTMLElement>('[aria-label="Note"]')!.focus();
    // the field, then the footer's close cell (Option+Tab reaches a button in WebKit), then out
    await userEvent.keyboard(server.browser === "webkit" ? "{Alt>}{Tab}{Tab}{/Alt}" : "{Tab}{Tab}");
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("After");
    await expect.poll(isOpen).toBe(false);
  });

  it("Shift+Tab leaves the open popover backward, to the trigger", async () => {
    await render(<Example />);
    await openByKeyboard();
    document.querySelector<HTMLElement>('[aria-label="Note"]')!.focus();
    // the header's close cell, then out to the trigger
    await userEvent.keyboard(
      server.browser === "webkit" ? "{Shift>}{Alt>}{Tab}{Tab}{/Alt}{/Shift}" : "{Shift>}{Tab}{Tab}{/Shift}",
    );
    await expect.poll(() => document.activeElement).toBe(trigger());
  });
});

describe("popover: construction", () => {
  it("docks: the shared edge lies on the trigger's keyline at the owner's weight", async () => {
    await render(<Example />);
    await openByKeyboard();
    const t = trigger().getBoundingClientRect();
    const p = popup()!;
    expect(getComputedStyle(p).borderTopWidth).toBe("2px");
    // sideOffset -2: the popup's top border covers the trigger's bottom border
    expect(p.getBoundingClientRect().top).toBeCloseTo(t.bottom - 2, 1);
    expect(p.getBoundingClientRect().left).toBeCloseTo(t.left, 1);
  });

  it("docks to a cell at 1px", async () => {
    await render(<Example attachWeight={1} />);
    await openByKeyboard();
    const p = popup()!;
    expect(getComputedStyle(p).borderTopWidth).toBe("1px");
    expect(p.getBoundingClientRect().top).toBeCloseTo(trigger().getBoundingClientRect().bottom, 1);
  });

  it("detached: a control frame one gutter away, with the control cut", async () => {
    await render(<Example detached />);
    await openByKeyboard();
    const p = popup()!;
    const cs = getComputedStyle(p);
    expect([cs.borderTopWidth, cs.borderLeftWidth, cs.borderBottomWidth]).toEqual(["2px", "2px", "2px"]);
    expect(p.getBoundingClientRect().top).toBeCloseTo(trigger().getBoundingClientRect().bottom + 8, 1);
  });

  it("detached: enters from the trigger side (a fade where clip-path is the cut), instantly under reduced motion", async () => {
    await render(<Example detached />);
    await openByKeyboard();
    const p = popup()!;
    const bevel = CSS.supports("corner-start-start-shape", "bevel");
    p.style.transition = "none";
    p.setAttribute("data-starting-style", "");
    const start = getComputedStyle(p);
    expect(bevel ? start.clipPath : start.opacity).toBe(bevel ? "inset(0px 0px 100%)" : "0");
    p.removeAttribute("data-starting-style");
    p.style.transition = "";
    expect(parseFloat(getComputedStyle(p).transitionDuration)).toBeGreaterThan(0);
    document.querySelector("main")!.setAttribute("data-kl-motion", "reduce");
    expect(getComputedStyle(p).transitionDuration).toBe("0s");
  });
});
