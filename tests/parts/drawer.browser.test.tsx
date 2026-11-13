import "./render-count";

import * as React from "react";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/keyline/ui/drawer";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const open = (part: React.ReactNode) => (
  <Drawer open>
    <DrawerPopup aria-label="Bay 2 log">{part}</DrawerPopup>
  </Drawer>
);

describeConformance("drawer", {
  DrawerTrigger: {
    element: <DrawerTrigger>Bay 2 log</DrawerTrigger>,
    refInstanceof: HTMLButtonElement,
    slot: "drawer-trigger",
    button: true,
    wrap: (part) => <Drawer>{part}</Drawer>,
  },
  DrawerPopup: {
    element: <DrawerPopup aria-label="Bay 2 log">Body</DrawerPopup>,
    refInstanceof: HTMLDivElement,
    slot: "drawer-popup",
    wrap: (part) => <Drawer open>{part}</Drawer>,
  },
  DrawerClose: {
    element: <DrawerClose>Close</DrawerClose>,
    refInstanceof: HTMLButtonElement,
    slot: "drawer-close",
    button: true,
    wrap: open,
  },
  DrawerTitle: {
    element: <DrawerTitle>Bay 2</DrawerTitle>,
    refInstanceof: HTMLHeadingElement,
    slot: "drawer-title",
    wrap: open,
  },
  DrawerDescription: {
    element: <DrawerDescription>Last 24 hours.</DrawerDescription>,
    refInstanceof: HTMLParagraphElement,
    slot: "drawer-description",
    wrap: open,
  },
  DrawerBody: {
    element: <DrawerBody>Body</DrawerBody>,
    refInstanceof: HTMLDivElement,
    slot: "drawer-body",
    wrap: open,
  },
  // the header and footer are Dialog's own parts
  DrawerHeader: {
    element: <DrawerHeader>Head</DrawerHeader>,
    refInstanceof: HTMLDivElement,
    slot: "dialog-header",
    wrap: open,
  },
  DrawerFooter: {
    element: <DrawerFooter>Foot</DrawerFooter>,
    refInstanceof: HTMLDivElement,
    slot: "dialog-footer",
    wrap: open,
  },
});

/** A drawer between two page fields, portalled into the page's landmark. */
function Example({ side, dir }: { side?: "bottom" | "end" | "start"; dir?: "rtl" }) {
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  return (
    <main ref={setMain} dir={dir} style={{ padding: 40, display: "grid", gridAutoRows: 40, justifyItems: "start" }}>
      <input aria-label="Before" />
      <Drawer side={side}>
        <DrawerTrigger>Bay 2 log</DrawerTrigger>
        <DrawerPopup container={main}>
          <DrawerHeader>
            <DrawerTitle>Bay 2 log</DrawerTitle>
            <DrawerDescription>Last 24 hours.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <input aria-label="Name" />
            <input aria-label="Note" />
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose>Close</DrawerClose>
          </DrawerFooter>
        </DrawerPopup>
      </Drawer>
      <input aria-label="After" />
    </main>
  );
}

const trigger = () => document.querySelector<HTMLElement>('[data-slot="drawer-trigger"]')!;
const popup = () => document.querySelector<HTMLElement>('[data-slot="drawer-popup"]');
const backdrop = () => document.querySelector<HTMLElement>('[data-slot="drawer-backdrop"]');
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
  // the slide has landed: its position is final
  await Promise.all(
    popup()!
      .getAnimations()
      .map((a) => a.finished),
  );
}

describe("drawer: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
    await openByKeyboard();
    // modal: Base UI makes the rest of the page inert while it is open, and axe flags the page's own fields for that,
    // so the open state is judged on the drawer
    await expectNoAxeViolations(popup()!);
  });
});

describe("drawer: keyboard", () => {
  it("Escape closes the drawer and returns focus to the trigger", async () => {
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

describe("drawer: construction", () => {
  it("bottom: full width on the viewport's bottom edge, its top edge at region weight over a scrim", async () => {
    await render(<Example />);
    await openByKeyboard();
    const p = popup()!;
    const r = p.getBoundingClientRect();
    expect(p.getAttribute("data-swipe-direction")).toBe("down");
    expect([r.left, r.right, r.bottom]).toEqual([0, innerWidth, innerHeight]);
    expect(getComputedStyle(p).borderTopWidth).toBe("3px");
    expect(getComputedStyle(backdrop()!).position).toBe("fixed");
  });

  it("end: the inline end, mirrored in RTL; its page-facing edge at region weight", async () => {
    await render(<Example side="end" />);
    await openByKeyboard();
    let p = popup()!;
    expect(p.getAttribute("data-swipe-direction")).toBe("right");
    expect(p.getBoundingClientRect().right).toBe(innerWidth);
    expect(getComputedStyle(p).borderLeftWidth).toBe("3px");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => popup()).toBeNull();

    document.body.innerHTML = "";
    await render(<Example side="end" dir="rtl" />);
    await openByKeyboard();
    p = popup()!;
    expect(p.getAttribute("data-swipe-direction")).toBe("left");
    expect(p.getBoundingClientRect().left).toBe(0);
    expect(getComputedStyle(p).borderRightWidth).toBe("3px");
  });

  it("slides in from its side and out to it, the scrim with it, instantly under reduced motion", async () => {
    await render(<Example />);
    await openByKeyboard();
    const p = popup()!;
    const b = backdrop()!;
    p.style.transition = "none";
    b.style.transition = "none";
    for (const state of ["data-starting-style", "data-ending-style"]) {
      p.setAttribute(state, "");
      b.setAttribute(state, "");
      // translateY(100%): moved down by its own height
      expect(new DOMMatrix(getComputedStyle(p).transform).m42).toBeCloseTo(p.offsetHeight, 0);
      expect(getComputedStyle(b).opacity).toBe("0");
      p.removeAttribute(state);
      b.removeAttribute(state);
    }
    p.style.transition = "";
    b.style.transition = "";
    expect(parseFloat(getComputedStyle(p).transitionDuration)).toBeGreaterThan(0);
    expect(parseFloat(getComputedStyle(b).transitionDuration)).toBeGreaterThan(0);
    document.querySelector("main")!.setAttribute("data-kl-motion", "reduce");
    expect(getComputedStyle(p).transitionDuration).toBe("0s");
    expect(getComputedStyle(b).transitionDuration).toBe("0s");
  });
});
