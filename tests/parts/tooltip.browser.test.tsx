import "./render-count";

import * as React from "react";
import { TooltipPopup, TooltipRoot, TooltipTrigger } from "@/components/keyline/ui/tooltip";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("tooltip", {
  TooltipTrigger: {
    element: <TooltipTrigger>Export</TooltipTrigger>,
    refInstanceof: HTMLButtonElement,
    slot: "tooltip-trigger",
    wrap: (part) => <TooltipRoot>{part}</TooltipRoot>,
  },
  TooltipPopup: {
    element: <TooltipPopup>Export the view as CSV</TooltipPopup>,
    refInstanceof: HTMLDivElement,
    slot: "tooltip-popup",
    wrap: (part) => <TooltipRoot open>{part}</TooltipRoot>,
  },
});

/** A tooltip on a button between two page fields, portalled into the page's landmark. */
function Example({ shortcut }: { shortcut?: string }) {
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  return (
    // whole-pixel layout: Base UI places the popup on whole pixels, so the trigger's edges are whole too
    <main ref={setMain} style={{ padding: 80, display: "grid", gridAutoRows: 40, justifyItems: "start" }}>
      <input aria-label="Before" />
      <TooltipRoot>
        <TooltipTrigger delay={0} className="kl-ctl" style={{ padding: 8 }}>
          Export
        </TooltipTrigger>
        {/* whole-pixel text, so the label's bottom edge is whole too */}
        <TooltipPopup container={main} shortcut={shortcut} style={{ lineHeight: "20px" }}>
          Export the view as CSV
        </TooltipPopup>
      </TooltipRoot>
      <input aria-label="After" />
    </main>
  );
}

const trigger = () => document.querySelector<HTMLElement>('[data-slot="tooltip-trigger"]')!;
const popup = () => document.querySelector<HTMLElement>('[data-slot="tooltip-popup"]');

/** Keyboard focus opens the tooltip (Option+Tab reaches a button in WebKit). */
async function openByKeyboard() {
  document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
  await userEvent.keyboard(server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}");
  await expect.poll(() => document.activeElement).toBe(trigger());
  await expect.poll(() => popup()).not.toBeNull();
  await expect.poll(() => popup()!.hasAttribute("data-starting-style")).toBe(false);
}

describe("tooltip: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example shortcut="⌘E" />);
    await expectNoAxeViolations();
    await openByKeyboard();
    // the page stays live around a tooltip, so the whole page is judged
    await expectNoAxeViolations();
  });
});

describe("tooltip: keyboard", () => {
  it("Escape closes the tooltip with focus kept on the trigger", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => popup()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });
});

describe("tooltip: construction", () => {
  it("docks to the trigger's focus ring: one ring (4px) above it", async () => {
    await render(<Example />);
    await openByKeyboard();
    expect(popup()!.getBoundingClientRect().bottom).toBeCloseTo(trigger().getBoundingClientRect().top - 4, 1);
  });

  it("a shortcut is its own cell, divided by a keyline in the label's colour", async () => {
    await render(<Example shortcut="⌘E" />);
    await openByKeyboard();
    const p = popup()!;
    const kbd = p.querySelector<HTMLElement>('[data-slot="tooltip-shortcut"]')!;
    const cs = getComputedStyle(kbd);
    expect(cs.borderInlineStartWidth).not.toBe("0px");
    expect(cs.borderInlineStartColor).toBe(getComputedStyle(p).color);
  });

  it("fades in and out, instantly under reduced motion", async () => {
    await render(<Example />);
    await openByKeyboard();
    const p = popup()!;
    p.style.transition = "none";
    for (const state of ["data-starting-style", "data-ending-style"]) {
      p.setAttribute(state, "");
      expect(getComputedStyle(p).opacity).toBe("0");
      p.removeAttribute(state);
    }
    p.style.transition = "";
    expect(parseFloat(getComputedStyle(p).transitionDuration)).toBeGreaterThan(0);
    document.querySelector("main")!.setAttribute("data-kl-motion", "reduce");
    expect(getComputedStyle(p).transitionDuration).toBe("0s");
  });
});
