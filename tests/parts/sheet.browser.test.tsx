import "./render-count";

import * as React from "react";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPopup,
  SheetTitle,
  SheetTrigger,
} from "@/components/keyline/ui/sheet";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const open = (part: React.ReactNode) => (
  <Sheet open>
    <SheetPopup aria-label="Carrier details">{part}</SheetPopup>
  </Sheet>
);

// every part but the popup is Dialog's own, and carries Dialog's slot
describeConformance("sheet", {
  SheetTrigger: {
    element: <SheetTrigger>Carrier</SheetTrigger>,
    refInstanceof: HTMLButtonElement,
    slot: "dialog-trigger",
    button: true,
    wrap: (part) => <Sheet>{part}</Sheet>,
  },
  SheetPopup: {
    element: <SheetPopup aria-label="Carrier details">Body</SheetPopup>,
    refInstanceof: HTMLDivElement,
    slot: "sheet-popup",
    wrap: (part) => <Sheet open>{part}</Sheet>,
  },
  SheetClose: {
    element: <SheetClose>Close</SheetClose>,
    refInstanceof: HTMLButtonElement,
    slot: "dialog-close",
    button: true,
    wrap: open,
  },
  SheetTitle: {
    element: <SheetTitle>Carrier</SheetTitle>,
    refInstanceof: HTMLHeadingElement,
    slot: "dialog-title",
    wrap: open,
  },
  SheetDescription: {
    element: <SheetDescription>DHL Freight</SheetDescription>,
    refInstanceof: HTMLParagraphElement,
    slot: "dialog-description",
    wrap: open,
  },
  SheetHeader: {
    element: <SheetHeader>Head</SheetHeader>,
    refInstanceof: HTMLDivElement,
    slot: "dialog-header",
    wrap: open,
  },
  SheetBody: { element: <SheetBody>Body</SheetBody>, refInstanceof: HTMLDivElement, slot: "dialog-body", wrap: open },
  SheetFooter: {
    element: <SheetFooter>Foot</SheetFooter>,
    refInstanceof: HTMLDivElement,
    slot: "dialog-footer",
    wrap: open,
  },
});

/** A sheet between two page fields, portalled into the page's landmark. */
function Example({ side, dir }: { side?: "end" | "start" | "bottom"; dir?: "rtl" }) {
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  return (
    <main ref={setMain} dir={dir} style={{ padding: 40, display: "grid", gridAutoRows: 40, justifyItems: "start" }}>
      <input aria-label="Before" />
      <Sheet>
        <SheetTrigger>Carrier details</SheetTrigger>
        <SheetPopup container={main} side={side}>
          <SheetHeader>
            <SheetTitle>Carrier details</SheetTitle>
            <SheetDescription>DHL Freight</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <input aria-label="Name" />
            <input aria-label="Note" />
          </SheetBody>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </SheetPopup>
      </Sheet>
      <input aria-label="After" />
    </main>
  );
}

const trigger = () => document.querySelector<HTMLElement>('[data-slot="dialog-trigger"]')!;
const popup = () => document.querySelector<HTMLElement>('[data-slot="sheet-popup"]');
const focused = () => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent;
// WebKit on macOS tabs only to text fields unless Option is held
const tab = (n: number, shift = false) => {
  const alt = server.browser === "webkit";
  return userEvent.keyboard(
    `${shift ? "{Shift>}" : ""}${alt ? "{Alt>}" : ""}${"{Tab}".repeat(n)}${alt ? "{/Alt}" : ""}${shift ? "{/Shift}" : ""}`,
  );
};

async function openByKeyboard() {
  trigger().focus();
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => popup()).not.toBeNull();
  await expect.poll(() => popup()!.contains(document.activeElement)).toBe(true);
  await expect.poll(() => popup()!.hasAttribute("data-starting-style")).toBe(false);
}

describe("sheet: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
    await openByKeyboard();
    // modal: Base UI makes the rest of the page inert while it is open, and axe flags the page's own fields for that,
    // so the open state is judged on the sheet
    await expectNoAxeViolations(popup()!);
  });
});

describe("sheet: keyboard", () => {
  it("Escape closes the sheet and returns focus to the trigger", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => popup()).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger());
  });

  it("traps focus: Tab from the last control wraps to the first, Shift+Tab from the first to the last", async () => {
    await render(<Example />);
    await openByKeyboard();
    [...popup()!.querySelectorAll<HTMLElement>("button")].find((b) => b.textContent === "Close")!.focus();
    await tab(1);
    await expect.poll(focused).toBe("Name");
    await tab(1, true);
    await expect.poll(focused).toBe("Close");
  });
});

describe("sheet: construction", () => {
  const edges = (p: HTMLElement) => {
    const cs = getComputedStyle(p);
    return [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth];
  };

  it("end: the inline end edge, full height, the page-facing and top keylines at region weight", async () => {
    await render(<Example />);
    await openByKeyboard();
    const p = popup()!;
    const r = p.getBoundingClientRect();
    expect([r.top, r.right, r.bottom]).toEqual([0, innerWidth, innerHeight]);
    expect(edges(p)).toEqual(["3px", "0px", "0px", "3px"]);
  });

  it("end mirrors in RTL", async () => {
    await render(<Example dir="rtl" />);
    await openByKeyboard();
    const p = popup()!;
    expect(p.getBoundingClientRect().left).toBe(0);
    expect(edges(p)).toEqual(["3px", "3px", "0px", "0px"]);
    // and unfolds from the left edge
    p.style.transition = "none";
    p.setAttribute("data-starting-style", "");
    expect(getComputedStyle(p).clipPath).toBe("inset(0px 100% 0px 0px)");
  });

  it("start: the page-facing keyline only, no cut", async () => {
    await render(<Example side="start" />);
    await openByKeyboard();
    const p = popup()!;
    expect(p.getBoundingClientRect().left).toBe(0);
    expect(edges(p)).toEqual(["0px", "3px", "0px", "0px"]);
    expect(getComputedStyle(p).getPropertyValue("--kl-cut-size").trim()).toBe("0px");
  });

  it("bottom: full width on the bottom edge", async () => {
    await render(<Example side="bottom" />);
    await openByKeyboard();
    const p = popup()!;
    const r = p.getBoundingClientRect();
    expect([r.left, r.right, r.bottom]).toEqual([0, innerWidth, innerHeight]);
    expect(edges(p)).toEqual(["3px", "0px", "0px", "3px"]);
  });

  it("unfolds from its docked edge and folds back, inert while it leaves, instantly under reduced motion", async () => {
    await render(<Example />);
    await openByKeyboard();
    const p = popup()!;
    p.style.transition = "none";
    for (const state of ["data-starting-style", "data-ending-style"]) {
      p.setAttribute(state, "");
      // end in LTR: clipped back to the right edge
      expect(getComputedStyle(p).clipPath).toBe("inset(0px 0px 0px 100%)");
      p.removeAttribute(state);
    }
    p.setAttribute("data-ending-style", "");
    expect(getComputedStyle(p).pointerEvents).toBe("none");
    p.removeAttribute("data-ending-style");
    p.style.transition = "";
    expect(parseFloat(getComputedStyle(p).transitionDuration)).toBeGreaterThan(0);
    document.querySelector("main")!.setAttribute("data-kl-motion", "reduce");
    expect(getComputedStyle(p).transitionDuration).toBe("0s");
  });
});
